/**
 * POST /api/brief
 *
 * The only endpoint either brief talks to. Validates the payload, then
 * forwards it verbatim to a Make webhook. Nothing is stored here — no
 * database, no queue, no state beyond an in-memory rate-limit window.
 *
 * Two forms share this route, told apart by `form`:
 *   production — the lead. Returns a Content Treatment.
 *   casting    — follows. Returns a Casting Brief.
 * Each has its own answers schema; everything else is identical.
 *
 * Fires up to twice per session, both carrying the same `submissionId`:
 *   partial   — the moment the contact screen is submitted
 *   complete  — on final submit
 * Make upserts on that ID so the two resolve to one record.
 *
 * Runtime is Node, not edge, so the retry and the logging behave predictably.
 *
 * Env:
 *   MAKE_WEBHOOK_URL  server-only, never sent to the browser. Not set yet —
 *                     until it is, submissions go out through the interim
 *                     fallback below rather than being dropped.
 */

const RATE_LIMIT = 5;             // requests
const RATE_WINDOW_MS = 60 * 1000; // per minute, per IP
const RETRY_DELAY_MS = 500;
const WEBHOOK_TIMEOUT_MS = 8000;

/* In-memory is fine here. A cold start losing the window costs nothing —
   the limit exists to blunt scripted floods, not to bill anyone. */
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const window = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  window.push(now);
  hits.set(ip, window);

  /* Keep the map from growing without bound on a long-lived instance. */
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) hits.delete(k);
    }
  }
  return window.length > RATE_LIMIT;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/* ---------------------------------------------------------------------------
   Schemas. Shaped the way zod would report — a field path and a message per
   problem — without pulling a dependency into a repo that has no build.

   `list` fields arrive as arrays of slugs; everything else is a single slug or
   free text. Keys not named here are stripped before forwarding, so a client
   cannot smuggle extras through to Make.
   --------------------------------------------------------------------------- */

const FORMS = {
  casting: {
    single: ['useCase', 'audience', 'ageBand', 'aesthetic', 'voice', 'timing', 'entryPoint'],
    list: ['channels'],
  },
  production: {
    single: ['moment', 'momentOther', 'audience', 'aesthetic', 'aestheticOther', 'format', 'formatOther',
             'casting', 'castingOther', 'strategy', 'strategyOther', 'volume', 'volumeOther',
             'timing', 'timingOther', 'needsOther', 'channelsOther'],
    list: ['needs', 'channels'],
  },
};

const keysFor = (form) => [...FORMS[form].single, ...FORMS[form].list];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function validate(b) {
  const errors = [];
  const bad = (path, message) => errors.push({ path, message });
  const isStr = (v) => typeof v === 'string';

  if (!b || typeof b !== 'object' || Array.isArray(b)) {
    return { errors: [{ path: '', message: 'Expected a JSON object' }] };
  }

  if (!FORMS[b.form]) {
    bad('form', `Must be one of: ${Object.keys(FORMS).join(', ')}`);
  }
  if (!isStr(b.submissionId) || !UUID_RE.test(b.submissionId)) {
    bad('submissionId', 'Must be a UUID');
  }
  if (b.event !== 'partial' && b.event !== 'complete') {
    bad('event', 'Must be "partial" or "complete"');
  }
  if (!isStr(b.submittedAt) || !ISO_RE.test(b.submittedAt) || isNaN(Date.parse(b.submittedAt))) {
    bad('submittedAt', 'Must be an ISO 8601 timestamp');
  }

  const contact = b.contact;
  if (!contact || typeof contact !== 'object') {
    bad('contact', 'Required');
  } else {
    if (!isStr(contact.name) || !contact.name.trim()) bad('contact.name', 'Required');
    if (!isStr(contact.email) || !EMAIL_RE.test(contact.email)) bad('contact.email', 'Must be a valid email address');
    if (contact.role != null && !isStr(contact.role)) bad('contact.role', 'Must be a string');
  }

  const brand = b.brand;
  if (!brand || typeof brand !== 'object') {
    bad('brand', 'Required');
  } else {
    if (!isStr(brand.name) || !brand.name.trim()) bad('brand.name', 'Required');
    if (brand.url != null && !isStr(brand.url)) bad('brand.url', 'Must be a string');
  }

  const answers = b.answers;
  if (answers != null && FORMS[b.form]) {
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      bad('answers', 'Must be an object');
    } else {
      const { single, list } = FORMS[b.form];
      for (const k of Object.keys(answers)) {
        if (!single.includes(k) && !list.includes(k)) {
          bad(`answers.${k}`, `Not a field on the ${b.form} brief`);
        }
      }
      for (const k of list) {
        if (answers[k] != null && (!Array.isArray(answers[k]) || !answers[k].every(isStr))) {
          bad(`answers.${k}`, 'Must be an array of slugs');
        }
      }
      for (const k of single) {
        if (answers[k] != null && !isStr(answers[k])) bad(`answers.${k}`, 'Must be a string slug');
      }
    }
  }
  /* answers may be absent entirely — a `partial` legitimately carries none */

  const meta = b.meta;
  if (!meta || typeof meta !== 'object') {
    bad('meta', 'Required');
  } else {
    if (typeof meta.durationMs !== 'number' || !isFinite(meta.durationMs) || meta.durationMs < 0) {
      bad('meta.durationMs', 'Must be a non-negative number');
    }
    if (meta.source != null && !isStr(meta.source)) bad('meta.source', 'Must be a string');
    if (meta.referrer != null && !isStr(meta.referrer)) bad('meta.referrer', 'Must be a string');
    if (meta.utm != null) {
      if (typeof meta.utm !== 'object' || Array.isArray(meta.utm) ||
          !Object.values(meta.utm).every(isStr)) {
        bad('meta.utm', 'Must be a string map');
      }
    }
  }

  return { errors };
}

function clean(b) {
  const answers = {};
  if (b.answers && typeof b.answers === 'object') {
    for (const k of keysFor(b.form)) {
      if (b.answers[k] != null) answers[k] = b.answers[k];
    }
  }
  const out = {
    submissionId: b.submissionId,
    form: b.form,
    event: b.event,
    submittedAt: b.submittedAt,
    contact: {
      name: String(b.contact.name).trim(),
      email: String(b.contact.email).trim().toLowerCase(),
    },
    brand: { name: String(b.brand.name).trim() },
    answers,
    meta: {
      durationMs: b.meta.durationMs,
      utm: b.meta.utm && typeof b.meta.utm === 'object' ? b.meta.utm : {},
    },
  };
  if (b.contact.role) out.contact.role = String(b.contact.role).trim();
  if (b.brand.url) out.brand.url = String(b.brand.url).trim();
  if (b.meta.source) out.meta.source = b.meta.source;
  if (b.meta.referrer) out.meta.referrer = b.meta.referrer;
  return out;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) return null;
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return null; }
}

async function postOnce(url, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Make returned ${res.status}`);
    return true;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------------------
   Delivery.

   Leads are emailed to the studio from the visitor's browser (see EMAIL in
   /assets/brief/engine.js) — FormSubmit's bot check turns away server
   requests, so it cannot be called from here. This endpoint validates the
   payload and, when MAKE_WEBHOOK_URL is set, forwards it to Make for the lead
   store and Slack alerts.
   --------------------------------------------------------------------------- */
async function forward(body) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) {
    console.log(`[brief] ${body.form} ${body.event} ${body.submissionId} validated (no MAKE_WEBHOOK_URL; emailed from the browser)`);
    return true;
  }
  try {
    return await postOnce(url, body);
  } catch (first) {
    console.error('[brief] webhook attempt 1 failed:', first.message);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    try {
      return await postOnce(url, body);
    } catch (second) {
      console.error(`[brief] webhook failed twice for ${body.form} ${body.event} ${body.submissionId}:`, second.message);
      return false;
    }
  }
}

/**
 * @param {object} [opts]
 * @param {string} [opts.defaultForm] applied when the body omits `form`, so a
 *        form-specific legacy route stays valid.
 */
async function handler(req, res, opts = {}) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'Too many requests' });
  }

  const body = await readBody(req);
  if (!body) {
    return res.status(400).json({ ok: false, errors: [{ path: '', message: 'Body must be valid JSON' }] });
  }
  if (opts.defaultForm && body.form == null) body.form = opts.defaultForm;

  /* Honeypot. Anything that fills a field no human can see is a bot —
     answer 200 so it learns nothing, and drop the payload. */
  if (typeof body.company_website === 'string' && body.company_website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const { errors } = validate(body);
  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  /* Return fast. The visitor is not waiting on Make. */
  await forward(clean(body));

  return res.status(200).json({ ok: true });
}

module.exports = handler;
module.exports.FORMS = FORMS;
