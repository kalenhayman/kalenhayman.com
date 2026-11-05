(function () {
  'use strict';

  /* =========================================================================
     BRIEF ENGINE
     ---------------------------------------------------------------------
     One flow engine, two forms. Everything specific to a form — its copy,
     its questions, its branching, its slugs — arrives in `window.BRIEF`,
     which the page defines before loading this file. Nothing form-specific
     lives in here, so a fix lands on both briefs at once.

     Configs: casting-brief.html, production-brief.html
     ====================================================================== */
  var CFG = window.BRIEF;
  if (!CFG) throw new Error('window.BRIEF must be defined before engine.js');

  var FORM = CFG.form;                 /* 'casting' | 'production' */
  var SCREENS = CFG.screens;
  var ENDINGS = CFG.endings;
  var ERRORS = CFG.errors;
  var STAMP = CFG.stamp;
  var ANSWER_KEYS = CFG.answerKeys;    /* the payload's answers contract */
  var DRAFT_KEY = CFG.draftKey;

  /* Both URLs are public by nature — they end up in an href — so they sit in
     the page config rather than an env var, which a zero-build static site
     has no way to inject. The Make webhook is the opposite: it is read from
     the environment inside /api/brief.js and never named in client code, so
     nothing here references it. See the README for the variable. */
  var CALENDAR_URL = CFG.calendarUrl;
  var ROSTER_URL = CFG.rosterUrl;
  var ENDPOINT = CFG.endpoint || '/api/brief';

  /* Slug → label. The wire only ever carries slugs; Make holds its own copy
     of the labels. This exists so nothing else has to re-derive them. */
  var LABELS = (function () {
    var map = {};
    SCREENS.forEach(function (s) {
      if (!s.options || !s.key) return;
      map[s.key] = {};
      s.options.forEach(function (o) { map[s.key][o.slug] = strip(o.label); });
    });
    return map;
  })();
  function strip(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* =========================================================================
     STATE
     ====================================================================== */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.getElementById('stage');
  var bodyEl = document.getElementById('body');
  var progBar = document.getElementById('progBar');
  var backBtn = document.getElementById('back');

  var state = {
    submissionId: '', startedAt: Date.now(),
    contact: {}, brand: {}, answers: {},
    partialSent: false, completeSent: false
  };

  restore();
  if (!state.submissionId) state.submissionId = uuid();

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (window.crypto && crypto.getRandomValues)
        ? crypto.getRandomValues(new Uint8Array(1))[0] % 16 : (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function save() { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) {} }
  function restore() {
    try {
      var d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (!d || typeof d !== 'object') return;
      state.submissionId = d.submissionId || '';
      state.startedAt = d.startedAt || Date.now();
      state.contact = d.contact || {};
      state.brand = d.brand || {};
      state.answers = d.answers || {};
      state.partialSent = !!d.partialSent;
      state.completeSent = !!d.completeSent;
    } catch (e) {}
  }

  /* =========================================================================
     PATH — branching lives here and nowhere else.
     ====================================================================== */
  function path() {
    if (!CFG.skip) return SCREENS;
    return SCREENS.filter(function (s) { return !CFG.skip(s, state); });
  }
  function endVariant() {
    return (CFG.endVariant && CFG.endVariant(state)) || 'default';
  }

  var index = 0;
  var keyHandler = null;
  var hpField = null;

  /* =========================================================================
     RENDER
     ====================================================================== */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var VIEWS = {
    welcome: viewWelcome, choice: viewChoice, multi: viewMulti, text: viewText,
    fields: viewFields, picture: viewPicture, compare: viewCompare,
    timeline: viewTimeline, end: viewEnd
  };

  function render() {
    var list = path();
    index = Math.max(0, Math.min(index, list.length - 1));
    var s = list[index];

    keyHandler = null;
    hpField = null;
    var light = (s.theme || CFG.theme) === 'light';
    stage.classList.toggle('is-light', light);
    document.body.classList.toggle('is-light', light);
    progBar.style.width = (index / (list.length - 1)) * 100 + '%';
    backBtn.hidden = index === 0 || s.type === 'end';

    var view = el('div', 'view' + (reduced ? '' : ' is-entering'));
    view.appendChild(el('div', 'count', s.type === 'end' ? 'Complete' : (s.eyebrow || '')));
    VIEWS[s.type](view, s);

    bodyEl.innerHTML = '';
    bodyEl.appendChild(view);

    if (location.hash.slice(1) !== s.hash) history.replaceState(null, '', '#' + s.hash);
    var f = view.querySelector('input, textarea, .opt, .tile, .btn');
    if (f && !window.matchMedia('(hover: none)').matches) f.focus({ preventScroll: true });
  }

  function heading(view, s) {
    view.appendChild(el('h1', 'q' + (s.type === 'welcome' ? '' : ' q--sm'), s.q));
    if (s.help) view.appendChild(el('p', 'help', s.help));
  }

  function button(view, label, ghost) {
    var b = el('button', 'btn' + (ghost ? ' btn--ghost' : ''), label);
    b.type = 'button';
    view.appendChild(b);
    return b;
  }

  /* Options render into a fieldset so the question labels the group. */
  function group(view, s, cls, role) {
    var fs = document.createElement('fieldset');
    fs.className = cls;
    fs.setAttribute('role', role);
    fs.setAttribute('aria-label', strip(s.q));
    view.appendChild(fs);
    return fs;
  }

  function exclusives(s) {
    var m = {};
    s.options.forEach(function (o) { if (o.exclusive) m[o.slug] = true; });
    return m;
  }
  function syncMulti(s, wrap, cur) {
    s.options.forEach(function (o, i) {
      wrap.children[i].setAttribute('aria-pressed', cur.indexOf(o.slug) > -1 ? 'true' : 'false');
    });
  }

  function optsClass(s) {
    return 'opts' + (s.options.length > 6 ? ' opts--dense' : '');
  }

  function optionButton(o, i, role) {
    var b = el('button', 'opt');
    b.type = 'button';
    b.setAttribute('role', role);
    b.appendChild(el('span', 'k', String.fromCharCode(65 + i)));
    b.appendChild(el('span', 't', o.label + (o.note ? ' <s>' + o.note + '</s>' : '')));
    return b;
  }

  /* Letter keys A–H. Rebound on every render, cleared when a screen has none. */
  function bindKeys(s, wrap) {
    keyHandler = function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'Enter' && s.type === 'multi') { e.preventDefault(); next(); return; }
      if (e.key.length !== 1) return;
      var i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < wrap.children.length) { e.preventDefault(); wrap.children[i].click(); }
    };
  }

  /* --- welcome --- */
  function viewWelcome(view, s) {
    heading(view, s);
    button(view, s.cta).addEventListener('click', function () { track('start'); next(); });
    view.appendChild(el('div', 'hint', s.hint));
  }

  /* --- single choice --- */
  function viewChoice(view, s) {
    heading(view, s);
    var wrap = group(view, s, optsClass(s), 'radiogroup');
    var other = null;
    s.options.forEach(function (o, i) {
      var b = optionButton(o, i, 'radio');
      b.setAttribute('aria-checked', state.answers[s.key] === o.slug ? 'true' : 'false');
      b.addEventListener('click', function () { pick(s, wrap, b, o, other); });
      wrap.appendChild(b);
    });
    if (s.microlabel) view.appendChild(el('div', 'microlabel', s.microlabel));
    if (hasOther(s)) {
      other = otherField(view, s, true);
      if (state.answers[s.key] === otherSlug(s)) other.show();
    }
    bindKeys(s, wrap);
  }

  /* The selected button flashes, then the form moves on — long enough that
     the choice reads before the page changes. "Other" asks for a word first,
     so it never auto-advances. */
  var FLASH_MS = 560;
  function flash(btn) {
    if (reduced) return;
    btn.classList.remove('is-flash');
    void btn.offsetWidth;
    btn.classList.add('is-flash');
    btn.addEventListener('animationend', function done() {
      btn.classList.remove('is-flash');
      btn.removeEventListener('animationend', done);
    });
  }
  function pick(s, wrap, btn, o, other) {
    Array.prototype.forEach.call(wrap.children, function (c) { c.setAttribute('aria-checked', 'false'); });
    btn.setAttribute('aria-checked', 'true');
    state.answers[s.key] = o.slug;
    if (!o.other) delete state.answers[s.key + 'Other'];
    save();
    flash(btn);
    if (o.other) { if (other) other.show(); return; }
    if (other) other.hide();
    setTimeout(next, reduced ? 0 : FLASH_MS);
  }

  /* --- "Other" — an option that may carry a few words -------------------
     The field sits under the options, hidden until Other is selected. Its
     text travels as <key>Other, only when something was typed. On single-
     choice screens it brings its own OK button, since those otherwise
     advance on their own. */
  function hasOther(s) { return s.options.some(function (o) { return o.other; }); }
  function otherSlug(s) { var o = s.options.filter(function (x) { return x.other; })[0]; return o ? o.slug : null; }
  function otherField(view, s, single) {
    var box = el('div', 'other');
    box.hidden = true;
    var f = el('div', 'field');
    var lab = el('label', null, 'Tell us more &mdash; optional');
    lab.setAttribute('for', s.key + '-other');
    var inp = document.createElement('input');
    inp.type = 'text'; inp.id = s.key + '-other'; inp.maxLength = 120;
    inp.placeholder = 'A few words is plenty';
    inp.value = state.answers[s.key + 'Other'] || '';
    inp.addEventListener('input', function () {
      var v = inp.value.trim();
      if (v) state.answers[s.key + 'Other'] = v; else delete state.answers[s.key + 'Other'];
      save();
    });
    f.appendChild(lab); f.appendChild(inp);
    box.appendChild(f);
    if (single) {
      var ok = el('button', 'btn', s.cta || 'OK &rarr;');
      ok.type = 'button';
      ok.addEventListener('click', next);
      box.appendChild(ok);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); next(); } });
    }
    view.appendChild(box);
    return {
      show: function () { box.hidden = false; setTimeout(function () { inp.focus({ preventScroll: true }); }, 0); },
      hide: function () { box.hidden = true; }
    };
  }

  /* --- multi select — never auto-advances --- */
  function viewMulti(view, s) {
    heading(view, s);
    var wrap = group(view, s, optsClass(s), 'group');
    var picked = state.answers[s.key] || [];
    var other = null;
    s.options.forEach(function (o, i) {
      var b = optionButton(o, i, null);
      b.removeAttribute('role');
      b.setAttribute('aria-pressed', picked.indexOf(o.slug) > -1 ? 'true' : 'false');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        var cur = state.answers[s.key] || [];
        if (on) {
          cur = cur.filter(function (v) { return v !== o.slug; });
        } else if (o.exclusive) {
          /* "Nothing yet" cannot be true alongside "product shots" — an
             exclusive option clears the rest, and any other clears it. */
          cur = [o.slug];
        } else {
          var ex = exclusives(s);
          cur = cur.filter(function (v) { return !ex[v]; }).concat([o.slug]);
        }
        state.answers[s.key] = cur;
        if (other) {
          if (cur.indexOf(otherSlug(s)) > -1) other.show();
          else { other.hide(); delete state.answers[s.key + 'Other']; }
        }
        save();
        syncMulti(s, wrap, cur);
        if (!on) flash(b);
      });
      wrap.appendChild(b);
    });
    if (s.microlabel) view.appendChild(el('div', 'microlabel', s.microlabel));
    if (hasOther(s)) {
      other = otherField(view, s, false);
      if (picked.indexOf(otherSlug(s)) > -1) other.show();
    }
    button(view, s.cta).addEventListener('click', next);
    bindKeys(s, wrap);
  }

  /* --- long text --- */
  function viewText(view, s) {
    heading(view, s);
    var f = el('div', 'field');
    var ta = document.createElement('textarea');
    ta.rows = 1;
    ta.placeholder = s.placeholder;
    ta.maxLength = s.maxlength || 200;
    ta.value = state.answers[s.key] || '';
    ta.setAttribute('aria-label', strip(s.q));
    f.appendChild(ta);
    var err = el('div', 'err');
    err.hidden = true;
    f.appendChild(err);
    view.appendChild(f);
    if (s.microlabel) view.appendChild(el('div', 'microlabel', s.microlabel));

    var grow = function () { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
    ta.addEventListener('input', function () {
      grow();
      state.answers[s.key] = ta.value.trim();
      save();
      if (!err.hidden) { err.hidden = true; f.classList.remove('field--err'); }
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); }
    });
    setTimeout(grow, 0);
    button(view, s.cta).addEventListener('click', go);

    function go() {
      if (s.required && !ta.value.trim()) {
        err.textContent = ERRORS.required;
        err.hidden = false;
        f.classList.add('field--err');
        ta.focus();
        return;
      }
      next();
    }
  }

  /* --- field group (brand, contact) --- */
  function viewFields(view, s) {
    heading(view, s);
    var rows = [];

    /* Five fields will not fit a 375px screen at the standard rhythm — the
       production brief asks for contact and brand on one screen. */
    if (s.fields.length > 3) view.classList.add('fields-dense');

    s.fields.forEach(function (fd) {
      /* A field names its own store when a screen mixes them — the production
         brief asks for contact and brand together. */
      var st = fd.store || s.store;
      var store = state[st];
      var f = el('div', 'field');
      var id = 'f_' + st + '_' + fd.name;
      var lab = el('label', null, fd.label);
      lab.setAttribute('for', id);
      var inp = document.createElement('input');
      inp.type = fd.type === 'email' ? 'email' : 'text';
      inp.id = id;
      inp.name = fd.name;
      inp.placeholder = fd.placeholder;
      inp.value = store[fd.name] || '';
      inp.autocomplete = fd.type === 'email' ? 'email'
        : (st === 'contact' && fd.name === 'name') ? 'name'
        : (st === 'contact' && fd.name === 'role') ? 'organization-title'
        : (st === 'brand' && fd.name === 'name') ? 'organization'
        : (st === 'brand' && fd.name === 'url') ? 'url' : 'off';
      if (fd.required) inp.required = true;
      var err = el('div', 'err');
      err.hidden = true;
      f.appendChild(lab); f.appendChild(inp); f.appendChild(err);
      view.appendChild(f);

      var row = { fd: fd, inp: inp, f: f, err: err };
      rows.push(row);

      inp.addEventListener('input', function () {
        store[fd.name] = inp.value.trim();
        save();
        clearErr(row);
      });
      /* Validated on blur, not on every keystroke. An empty required field is
         not an error until submit — leaving it untouched is not a mistake yet. */
      inp.addEventListener('blur', function () {
        if (fd.type === 'email' && inp.value.trim()) validate(row);
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    });

    if (s.capture) {
      /* Honeypot — out of sight and out of the tab order, named plainly
         enough that a bot fills it in. */
      var hp = el('div', 'hp');
      var hi = document.createElement('input');
      hi.type = 'text'; hi.name = 'company_website'; hi.id = 'company_website';
      hi.tabIndex = -1; hi.autocomplete = 'off';
      hi.setAttribute('aria-hidden', 'true');
      var hl = el('label', null, 'Company website');
      hl.setAttribute('for', 'company_website');
      hp.appendChild(hl); hp.appendChild(hi);
      view.appendChild(hp);
      hpField = hi;
    }

    if (s.microlabel) view.appendChild(el('div', 'microlabel', s.microlabel));
    var btn = button(view, s.cta);
    var sendErr = el('div', 'err');
    sendErr.hidden = true;
    view.appendChild(sendErr);
    btn.addEventListener('click', submit);

    function clearErr(row) {
      if (row.err.hidden) return;
      row.err.hidden = true;
      row.f.classList.remove('field--err');
    }
    function fail(row, msg) {
      row.err.textContent = msg;
      row.err.hidden = false;
      row.f.classList.add('field--err');
      return false;
    }
    function validate(row) {
      var v = row.inp.value.trim();
      if (row.fd.required && !v) return fail(row, ERRORS.required);
      if (row.fd.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        return fail(row, ERRORS.email);
      }
      clearErr(row);
      return true;
    }

    function submit() {
      var ok = true;
      rows.forEach(function (r) { if (!validate(r)) ok = false; });
      if (!ok) {
        var bad = view.querySelector('.field--err input');
        if (bad) bad.focus();
        return;
      }
      if (!s.capture) { next(); return; }

      sendErr.hidden = true;
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Sending…';
      /* Mid-form, this captures the lead early (a partial); as the last
         screen, it sends the finished brief. Either way, if the network drops
         it, say so and let them retry — the answers are already saved. */
      var list = path();
      var last = !!(list[index + 1] && list[index + 1].type === 'end');
      send(last ? 'complete' : 'partial').then(function (ok2) {
        if (!ok2) {
          btn.disabled = false;
          btn.textContent = label;
          sendErr.textContent = ERRORS.send;
          sendErr.hidden = false;
          return;
        }
        if (last) { state.completeSent = true; track('complete'); }
        else { state.partialSent = true; track('partial'); }
        save();
        next();
      });
    }
  }

  /* --- picture choice --- */
  function viewPicture(view, s) {
    heading(view, s);
    var wrap = group(view, s, 'tiles', 'radiogroup');
    s.options.forEach(function (o, i) {
      var b = el('button', 'tile');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', state.answers[s.key] === o.slug ? 'true' : 'false');
      var img = el('div', 'img' + (o.img ? '' : ' is-placeholder'));
      if (o.img) {
        img.style.backgroundImage = 'url("' + o.img + '")';
        img.setAttribute('role', 'img');
        img.setAttribute('aria-label', strip(o.label) + ' — ' + strip(o.note || ''));
      }
      b.appendChild(img);
      b.appendChild(el('div', 'cap',
        String.fromCharCode(65 + i) + ' · ' + o.label + (o.note ? '<i>' + o.note + '</i>' : '')));
      b.addEventListener('click', function () { pick(s, wrap, b, o, null); });
      wrap.appendChild(b);
    });
    if (s.microlabel) view.appendChild(el('div', 'microlabel', s.microlabel));
    bindKeys(s, wrap);
  }

  /* --- statement card: two columns --- */
  function viewCompare(view, s) {
    heading(view, s);
    view.appendChild(el('div', 'rule--neon'));
    var two = el('div', 'two');
    s.columns.forEach(function (c) {
      var col = el('div', 'col' + (c.own ? ' col--own' : ''));
      col.appendChild(el('h4', null, c.own ? '<span>' + c.head + '</span>' : c.head));
      col.appendChild(el('p', null, c.body));
      two.appendChild(col);
    });
    view.appendChild(two);
    view.appendChild(el('p', 'closing', s.closing));
    view.appendChild(el('div', 'rule'));
    button(view, s.cta, true).addEventListener('click', next);
  }

  /* --- statement card: the schedule --- */
  function viewTimeline(view, s) {
    heading(view, s);
    view.appendChild(el('div', 'rule--neon'));
    var dl = el('dl', 'steps');
    s.steps.forEach(function (st) {
      var row = el('div', 'step');
      row.appendChild(el('dt', null, st.when));
      row.appendChild(el('dd', null, st.what));
      dl.appendChild(row);
    });
    view.appendChild(dl);
    view.appendChild(el('p', 'foot-note', s.note));
    button(view, s.cta, true).addEventListener('click', next);
  }

  function viewPhases(view, ph) {
    var box = el('div', 'phases');
    box.appendChild(el('h2', 'phases-head', ph.heading));
    box.appendChild(el('p', 'phases-sf', ph.standfirst));
    var list = el('div', 'phase-list');
    ph.steps.forEach(function (st) {
      var row = el('div', 'phase');
      row.appendChild(el('div', 'phase-no', st.no));
      var body = el('div');
      body.appendChild(el('div', 'phase-name', st.name));
      body.appendChild(el('p', 'phase-does', st.does));
      body.appendChild(el('p', 'phase-gets', '<b>You get:</b> ' + st.gets));
      row.appendChild(body);
      list.appendChild(row);
    });
    box.appendChild(list);
    /* Timing lives beside the CTA, never inside the phases. */
    if (ph.note) box.appendChild(el('p', 'phases-note', ph.note));
    view.appendChild(box);
  }

  /* End screens name a destination rather than carrying a URL, so the config
     stays pure copy and cannot reach for an engine-scope variable. */
  function endHref(target) {
    return target === 'roster' ? ROSTER_URL : CALENDAR_URL;
  }

  /* --- end --- */
  function viewEnd(view) {
    var v = ENDINGS[endVariant()];
    view.appendChild(el('div', 'wordmark-wrap', '<span class="wordmark">K</span>'));
    view.appendChild(el('h1', 'q q--sm', v.q));
    view.appendChild(el('p', 'help', v.help));

    /* The four phases sit above the CTA on every variant — the method is the
       same whatever the timing said. */
    if (CFG.phases) viewPhases(view, CFG.phases);

    var a = document.createElement('a');
    a.className = 'btn';
    a.textContent = v.cta;
    a.href = endHref(v.ctaTarget);
    if (/^https?:/.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { if (v.ctaEvent) track(v.ctaEvent); });
    view.appendChild(a);

    if (v.subTarget) {
      var s2 = document.createElement('a');
      s2.className = 'sub';
      s2.textContent = v.sub;
      s2.href = endHref(v.subTarget);
      s2.target = '_blank';
      s2.rel = 'noopener';
      s2.addEventListener('click', function () { if (v.subEvent) track(v.subEvent); });
      view.appendChild(s2);
    } else if (v.sub) {
      view.appendChild(el('div', 'sub', v.sub));
    }
    if (STAMP) view.appendChild(el('div', 'stamp', STAMP));
  }

  /* =========================================================================
     NAVIGATION
     ====================================================================== */
  function next() {
    var list = path();
    if (index >= list.length - 1) return;
    if (list[index + 1].type === 'end' && !state.completeSent) {
      state.completeSent = true;
      save();
      send('complete');          /* deliberately not awaited */
      track('complete');
    }
    index += 1;
    render();
  }
  function prev() { if (index > 0) { index -= 1; render(); } }
  backBtn.addEventListener('click', prev);

  window.addEventListener('hashchange', function () {
    var want = location.hash.slice(1);
    var list = path();
    for (var i = 0; i < list.length; i++) {
      if (list[i].hash === want && i !== index) { index = i; render(); return; }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (keyHandler) keyHandler(e);
    if (e.key === 'Escape') prev();
  });

  /* =========================================================================
     TRANSPORT — the only network call the client makes.
     ====================================================================== */
  /* Once the hidden trap field has been filled, every later send is marked
     too, so a bot is dropped at every step, not just the one with the field. */
  var botFlag = '';
  function honeypot() {
    var v = hpField ? String(hpField.value || '').trim() : '';
    if (v) botFlag = v;
    return botFlag;
  }

  function payload(event) {
    var p = new URLSearchParams(location.search);
    var utm = {};
    p.forEach(function (v, k) { if (k.indexOf('utm_') === 0) utm[k] = v; });
    return {
      submissionId: state.submissionId,
      form: FORM,
      event: event,
      submittedAt: new Date().toISOString(),
      contact: {
        name: state.contact.name || '',
        email: state.contact.email || '',
        role: state.contact.role || undefined
      },
      brand: {
        name: state.brand.name || '',
        url: state.brand.url || undefined
      },
      answers: (function () {
        var a = {};
        ANSWER_KEYS.forEach(function (k) {
          if (state.answers[k] !== undefined) a[k] = state.answers[k];
        });
        return a;
      })(),
      meta: {
        source: p.get('src') || undefined,
        utm: utm,
        referrer: document.referrer || undefined,
        durationMs: Date.now() - state.startedAt
      },
      company_website: honeypot()
    };
  }

  /* Resolves true only if the endpoint accepted it. A Make scenario being
     down still resolves true — the endpoint absorbs that, and it is not the
     visitor's problem. */
  function send(event) {
    var body = payload(event);
    emailStudio(body);
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  /* EMAIL — each submission is also emailed to the studio through FormSubmit,
     straight from the visitor's browser. FormSubmit sits behind a bot check
     that turns away server requests, so this cannot live in /api/brief. It is
     fire-and-forget: it never blocks the form or shows the visitor an error.
     The inbox must be activated once (FormSubmit emails an "Activate Form"
     link on the first submission). */
  var EMAIL_TO = CFG.emailTo;

  function plain(html) {
    var d = document.createElement('div');
    d.innerHTML = String(html == null ? '' : html).replace(/<br\s*\/?>/gi, ' ');
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function emailFields(p) {
    var kind = FORM === 'casting' ? 'Casting' : 'Production';
    var done = p.event === 'complete';
    var f = {
      _subject: (done ? 'New ' : 'Started ') + kind.toLowerCase() + ' brief — ' +
        (p.brand.name || 'unnamed brand') + ' (' + (p.contact.name || 'no name') + ')',
      _template: 'table',
      _captcha: 'false',
      Brief: kind + (done ? ' — completed' : ' — started (contact captured, not finished yet)'),
      Name: p.contact.name,
      email: p.contact.email
    };
    if (p.contact.email) f._replyto = p.contact.email;
    if (p.contact.role) f.Role = p.contact.role;
    f.Brand = p.brand.name;
    if (p.brand.url) f['Brand site'] = p.brand.url;
    /* every answered question, in the order it was asked, in the brief's own words */
    SCREENS.forEach(function (sc) {
      if (!sc.key || p.answers[sc.key] === undefined) return;
      var v = p.answers[sc.key];
      var lab = function (slug) {
        var o = (sc.options || []).filter(function (x) { return x.slug === slug; })[0];
        return o ? plain(o.label) : String(slug);
      };
      f[plain(sc.q)] = Array.isArray(v) ? v.map(lab).join(', ') : (sc.options ? lab(v) : String(v));
      var ot = p.answers[sc.key + 'Other'];
      if (ot) f[plain(sc.q) + ' \u2014 other'] = String(ot);
    });
    f['Time on form'] = Math.round((p.meta.durationMs || 0) / 1000) + 's';
    if (p.meta.source) f.Source = p.meta.source;
    if (p.meta.referrer) f.Referrer = p.meta.referrer;
    var utm = Object.keys(p.meta.utm || {}).map(function (k) { return k + '=' + p.meta.utm[k]; }).join(' ');
    if (utm) f.UTM = utm;
    f['Submission ID'] = p.submissionId;
    /* The lead gets a plain-text reply on completion only, so they receive
       one email, not two. */
    if (done && p.contact.email && CFG.autoReply) f._autoresponse = CFG.autoReply(p);
    return f;
  }

  function emailStudio(p) {
    if (!EMAIL_TO || (p.company_website && String(p.company_website).trim())) return;
    try {
      fetch('https://formsubmit.co/ajax/' + EMAIL_TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(emailFields(p)),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  /* Four events per form, prefixed so the two briefs stay distinguishable:
     cb_start / pb_start, and so on. Nothing else is tracked. */
  function track(name) {
    try {
      if (window.va) window.va('event', { name: (CFG.eventPrefix || '') + name });
    } catch (e) {}
  }

  /* =========================================================================
     BOOT
     ====================================================================== */
  (function boot() {
    var want = location.hash.slice(1);
    var list = path();
    for (var i = 0; i < list.length; i++) {
      /* A restored draft resumes mid-form, but never straight onto the end
         screen — that would fire `complete` off a deep link. */
      if (list[i].hash === want && list[i].type !== 'end') { index = i; break; }
    }
    save();
    render();
  })();
})();
