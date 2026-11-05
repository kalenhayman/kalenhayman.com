# HANDOFF · CASTING BRIEF PAGE
### For Claude Code · AVA Design Studio
Stack: Next.js on Vercel · GitHub · Make + Airtable behind it

Self-contained. All copy is in section 5 — no other document needed except `AVA-Casting-Brief-Mockup.html` for visual reference.

---

## 1 · THE JOB

Build one route — `/casting-brief` — a conversational, one-question-per-screen form that ends by POSTing to a single internal endpoint. That endpoint forwards to a Make webhook. Make does everything after that.

**In scope:** the page, the flow, the endpoint, the payload contract.
**Out of scope:** PDF generation, email sending, Airtable writes, a database, an admin dashboard, authentication. All of that lives in Make. Do not build any of it here, and do not add a database.

If the repo isn't Next.js App Router, adapt the structure but keep the endpoint contract and payload shape exactly as specified.

---

## 2 · FILES

```
app/casting-brief/page.tsx          server component · metadata, OG tags
app/casting-brief/CastingBrief.tsx  client component · the flow
app/casting-brief/screens.ts        all copy from section 5, typed
app/casting-brief/types.ts          Answers, Payload
app/api/casting-brief/route.ts      POST handler → Make webhook
```

Every string from section 5 goes into `screens.ts` as data. No copy hardcoded in JSX — it gets edited weekly and shouldn't require touching components.

Visual reference is `AVA-Casting-Brief-Mockup.html`. Port the tokens and layout logic; don't port the HTML. Build it as components. Note that the mockup shows 7 of the 14 screens and abbreviates some option lists — **section 5 is authoritative for all copy.**

---

## 3 · FLOW

```
welcome → q1_brand → q2_usecase → q3_audience → card_compare
→ q4_age → q5_look → q6_voice → q7_channels → card_timeline
→ contact → q8_timing → q9_entry → end
```

**Rules:**
- One screen at a time. URL hash reflects position (`#q3`) so back/forward work.
- Single-select auto-advances on click, ~180ms delay so the selected state registers.
- Text screens advance on Enter. `Shift+Enter` for newline in the long-text field.
- Letter keys (A–H) select options. Show the key badges — they're in the mockup.
- Multi-select (`q7`) does not auto-advance. It needs a confirm button.
- Progress = the skewed neon stripe, width driven by screen index.
- Answers persist to `sessionStorage` under `ava_cb_draft` on every change; restore on mount. A refresh mid-form should not lose work.
- `prefers-reduced-motion` kills screen transitions. Everything still works.

**Branching:**

| Condition | Behaviour |
|---|---|
| `q2 === 'unsure'` | skip `q4_age` |
| `q8 === 'weeks'` | end variant `hot` |
| `q8 === 'next_quarter'` or `'internal_case'` | end variant `early` |
| otherwise | end variant `default` |

---

## 4 · ENDPOINT CONTRACT

`POST /api/casting-brief` · JSON in, JSON out. The only network call the client makes.

**Fires twice per session:**

1. `event: "partial"` — the moment the contact screen is submitted. This is why email sits at screen 11 of 14. If they abandon after this, you still have the lead.
2. `event: "complete"` — on final submit.

Both carry the same `submissionId`, generated with `crypto.randomUUID()` when the form mounts and held for the session. Make upserts on that ID so both calls resolve to one Airtable record.

**Payload:**

```ts
{
  submissionId: string;        // uuid, stable across both calls
  event: "partial" | "complete";
  submittedAt: string;         // ISO
  contact: { name: string; email: string; role?: string };
  brand:   { name: string; url?: string };
  answers: {
    useCase?: string;          // slug, not label
    audience?: string;
    ageBand?: string;
    aesthetic?: string;
    voice?: string;
    channels?: string[];
    timing?: string;
    entryPoint?: string;
  };
  meta: {
    source?: string;           // ?src= param
    utm?: Record<string,string>;
    referrer?: string;
    durationMs: number;
  };
}
```

Slugs, not display labels — the labels will get reworded and shouldn't break Make's routing.

**The route handler must:**
- Validate with zod. Reject malformed input with 400 and a field-level message.
- Read `MAKE_WEBHOOK_URL` from env. Never expose it client-side. No `NEXT_PUBLIC_` prefix.
- Rate limit by IP — 5 requests per minute. In-memory is fine; don't add Redis.
- Honeypot: a visually hidden field named `company_website`. If filled, return 200 and drop silently.
- Return `{ ok: true }` fast. Don't make the user wait on Make. If the webhook fails, log it and still return `ok` on `complete` — the person shouldn't see an error because a Make scenario is down. Retry once with 500ms backoff first.
- Runtime `nodejs`, not edge.

**Env:**
```
MAKE_WEBHOOK_URL=          # required, server-only
NEXT_PUBLIC_CALENDAR_URL=  # discovery call booking link
NEXT_PUBLIC_ROSTER_URL=    # roster page, used by the 'early' end screen
```

---

## 5 · COPY

Authoritative. Use verbatim. Slugs in `backticks` are the values sent in the payload.

### WELCOME · `welcome`

**Headline:** Cast a face your brand owns.

**Body:** Eight questions about your brand. Three minutes. You get back a casting brief — the face, on paper, plus what it would take to build it. No pitch attached.

**Button:** Start casting →
**Under button:** Takes about 3 minutes

---

### 01 · BRAND · `q1_brand`
*Short text, required + optional second field*

**Question:** First — who are we casting for?
**Field 1 placeholder:** Brand name → `brand.name`
**Field 2 placeholder:** brand.com or @brand → `brand.url` *(optional)*
**Helper:** We'll use this on the brief.

---

### 02 · THE WORK · `q2_usecase`
*Single select, auto-advance → `answers.useCase`*

**Question:** What's the work?
**Helper:** Pick the closest one. We'll get specific on the call.

| Slug | Label | Trailing |
|---|---|---|
| `campaign` | A campaign | — one push, fixed window |
| `always_on` | Always-on social | — content that never stops needing a face |
| `ecomm` | E-comm & lookbook | — product on a body, at volume |
| `launch` | A launch | — new product, new market, new brand |
| `spokesperson` | A spokesperson | — one face carrying the whole brand |
| `unsure` | Still figuring it out | — |

---

### 03 · AUDIENCE · `q3_audience`
*Long text, required, 200 char → `answers.audience`*

**Question:** Who does this face need to reach?
**Helper:** One line is plenty.
**Placeholder:** e.g. Women 25–34 in the US who train four times a week and buy on their phone.
**Under field:** The more specific you are, the more specific the brief comes back.

---

### CARD A · `card_compare`
*Statement screen. Bone background, ink text. No input.*

**Headline:** Here's what changes.

**Column 1 — Traditional talent:** Book, shoot, negotiate usage, re-shoot when the line extends, re-negotiate at renewal, absorb whatever happens to that person's public life.

**Column 2 — An AVA face:** Build once. Every look, every season, every channel, from the same face. Usage written the way you want it, day one. It doesn't cancel and it doesn't age out of contract.

**Closing line:** The design is ours. The face is yours.
**Button:** Keep going →

---

### 04 · AGE & ERA · `q4_age`
*Single select, auto-advance → `answers.ageBand`. Skipped if `q2 = unsure`.*

**Question:** How old is this face?

| Slug | Label | Trailing |
|---|---|---|
| `early_20s` | Early 20s | — Gen-Z energy, new money, first apartment |
| `late_20s_30s` | Late 20s to 30s | — established, aspirational, in their stride |
| `40_plus` | 40s and up | — authority, expertise, earned |
| `range` | Give me a range | — cast across the audience |
| `unsure` | Not sure — show me options | — |

---

### 05 · THE LOOK · `q5_look`
*Picture choice, single select, auto-advance → `answers.aesthetic`. Six roster stills, 3:4, grayscale.*

**Question:** Pick the energy.

| Slug | Label | Trailing |
|---|---|---|
| `editorial` | Editorial | high fashion, controlled light, cold |
| `athletic` | Athletic | sweat, motion, performance |
| `streetwear` | Streetwear | culture-forward, city, unposed |
| `luxe` | Luxe | quiet money, texture, restraint |
| `clinical` | Clean & clinical | beauty, wellness, tech |
| `warm` | Warm & human | lifestyle, real rooms, real light |

---

### 06 · VOICE · `q6_voice`
*Single select, auto-advance → `answers.voice`*

**Question:** Does this face need a voice?
**Helper:** Voice adds a build stage. Worth knowing early.

| Slug | Label | Trailing |
|---|---|---|
| `stills` | Stills only | — campaign imagery, e-comm, print |
| `video` | Voice and video | — talking pieces, UGC, ads |
| `both` | Both | — the full spokesperson |

---

### 07 · CHANNELS · `q7_channels`
*Multi-select, confirm button → `answers.channels[]`*

**Question:** Where does the work need to live?
**Helper:** Select everything that applies.
**Under options:** This sets your usage schedule. We put it in writing before any work starts.

| Slug | Label |
|---|---|
| `organic` | Organic social — IG, TikTok |
| `paid` | Paid social & digital ads |
| `ecomm` | E-comm — PDP, category, lookbook |
| `site` | Brand site |
| `email` | Email |
| `print_ooh` | Print & OOH |
| `retail` | Retail & in-store |
| `unsure` | Not sure yet |

**Button:** OK →

---

### CARD B · `card_timeline`
*Statement screen. No input.*

**Headline:** From here, it moves fast.

- **Day 1** — 20-minute call. Scope, audience, the face.
- **Day 2** — Brand DNA session. Age, heritage, voice, aesthetic, cause.
- **Day 3–5** — First look. Three directions, one chosen.
- **Day 6–7** — Hero set delivered. Usage schedule signed.

**Footnote:** Roster casting runs faster. Custom builds take four to six weeks to reach full range.
**Button:** Almost done →

---

### CONTACT · `contact`
*Fires the `partial` event on submit.*

**Question:** Where should the brief go?
**Helper:** One PDF, built from your answers. Nothing else unless you ask.

| Field | Placeholder | Required |
|---|---|---|
| `contact.name` | First and last | yes |
| `contact.email` | you@brand.com | yes |
| `contact.role` | e.g. Brand Director | no |

**Under fields:** Work email, please — it's how we know which brand to build the brief around.
**Button:** Send it →

---

### 08 · TIMING · `q8_timing`
*Single select, auto-advance → `answers.timing`. Drives the end screen.*

**Question:** What's the timing?

| Slug | Label | Trailing | End variant |
|---|---|---|---|
| `weeks` | Weeks | — there's a date on a calendar | `hot` |
| `this_quarter` | This quarter | — planning it now | `default` |
| `next_quarter` | Next quarter or later | — early | `early` |
| `internal_case` | Just building the case internally | — | `early` |

---

### 09 · ENTRY POINT · `q9_entry`
*Single select, auto-advance → `answers.entryPoint`*

**Question:** Two ways in. Which one do you want on the brief?

| Slug | Label |
|---|---|
| `roster` | Cast from the roster — a face that already exists, campaign-ready in days. From $3,500 per campaign. |
| `custom` | Build a custom face — designed only for you, owned outright. $14,500, four to six weeks. |
| `both` | Show me both — side by side, with numbers |

**Helper:** Ranges, not quotes. Scope sets the number.

---

### END · `default`

**Headline:** That's the brief.
**Body:** It's in your inbox in the next few minutes.

If you want to talk it through, the discovery call is 20 minutes and it's free. We'll bring two roster faces that fit what you just described.

**Button:** Book 20 minutes → `NEXT_PUBLIC_CALENDAR_URL`
**Secondary:** Or reply to the email. AVA reads everything.

---

### END · `hot`

**Headline:** That's the brief — and you're on a clock.
**Body:** Two roster slots are open this month. The call is 20 minutes and we'll know inside it whether this works for your date.

**Button:** Book 20 minutes → `NEXT_PUBLIC_CALENDAR_URL`
**Secondary:** Brief's in your inbox either way.

---

### END · `early`

**Headline:** That's the brief.
**Body:** It's in your inbox — use it however you need to. Steal the framework, put it in the deck, take it to whoever signs.

When there's a date, we'll be here.

**Button:** See the roster → `NEXT_PUBLIC_ROSTER_URL`
**Secondary:** Or book 20 minutes whenever it gets real. → `NEXT_PUBLIC_CALENDAR_URL`

---

### PAGE META

**Title:** Casting Brief · AVA
**Description:** Eight questions about your brand. Three minutes. Get back a casting brief — the face, on paper, and what it takes to build it.
**OG image:** roster still, grayscale, with the AVA wordmark and stripe.

### ERROR STATES

- Empty required field: `Needs an answer before you can move on.`
- Invalid email: `That email won't reach you. Check it.`
- Submit failed: `Didn't send. Try once more — your answers are saved.`

Errors state what happened. They don't apologise.

---

## 6 · DESIGN

```
--ink   #000000    base, background
--bone  #EBEBEA    primary text
--sand  #7A7A78    secondary, captions
--paper #FFFFFF    contrast
--neon  #D8FE00    the charge — max ~15% of any screen
```

Fonts via `next/font/google`, self-hosted, `display: 'swap'`:
- **Anton** — questions. Uppercase, `letter-spacing: -0.02em`.
- **Archivo** — body, 400–700, sentence case.
- **JetBrains Mono** — counters, labels, microcopy. Uppercase, `letter-spacing: 0.22em`.

**Two rules that are the entire look:** neon is never a background fill, and `border-radius` is `0` everywhere — including focus rings and buttons.

Neon appears in exactly three places: the progress stripe, the selected-option edge, the primary button. Statement cards flip to a bone background with ink text.

---

## 7 · QUALITY FLOOR

Not negotiable, and not announced in the UI:

- Mobile-first. Every screen works at 375px without scrolling to reach the button.
- Visible keyboard focus everywhere. Bone outline, square.
- Each screen is a labelled `fieldset`/`legend` or an `h1`, with `aria-live` on transitions.
- Email validated on blur, not on every keystroke.
- Lighthouse 95+ across the board. No layout shift from fonts.
- Picture choice: `next/image`, 3:4, grayscale, AVIF/WebP, lazy below the fold.
- No analytics beyond Vercel Analytics. Four events only: `cb_start`, `cb_partial`, `cb_complete`, `cb_calendar_click`.

---

## 8 · DONE MEANS

1. All 14 screens render and are keyboard-navigable start to finish.
2. Refresh at screen 6 restores the answers.
3. Contact submit fires `partial`; final submit fires `complete`; both share one `submissionId`.
4. Malformed POST returns 400. Honeypot returns 200 and drops.
5. Webhook down → user still reaches the end screen with no visible error.
6. All three end variants reachable by changing only `q8`.
7. 375px, keyboard-only, and reduced-motion checked by hand.
8. `MAKE_WEBHOOK_URL` confirmed absent from the client bundle.

Deploy to a Vercel preview branch first. Don't point the domain until the Make scenario is live and returning a real PDF — an empty inbox after someone fills this out is worse than not shipping.

---

## 9 · WHAT MAKE HANDLES (context only — don't build)

Webhook receives → upsert Airtable `Brand Pipeline` on `submissionId` → calculate score → generate the personalised PDF → send email 1 with the PDF attached → enrol in the 4-email sequence → set `Next Follow-up` to +1 day.

The form is the door. The brief is the product.
