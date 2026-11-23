/* AVA — chrome behaviour shared by every page: menu, cursor, current link. */
(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var open = body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { body.classList.remove('menu-open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); }
  });

  /* mark the current page in the nav — Casting is a view of Work, so it and
     Work take turns, and a face's own page counts as Casting */
  var here = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  var casting = /(^|[?&])view=Casting/.test(location.search) || here === '/model';
  Array.prototype.forEach.call(document.querySelectorAll('.nav-links a, .menu-list a'), function (a) {
    var href = a.getAttribute('href'), to = href.split('?')[0].replace(/\.html$/, '');
    var isCasting = /view=Casting/.test(href);
    var on = isCasting ? casting : (to === '/work' ? (here === '/work' && !casting) : (to === here));
    if (on) a.setAttribute('aria-current', 'page');
  });

  /* Chat agent (ElevenLabs): a floating widget on every page, loaded once the
     page is idle so it never competes with the films. On a phone it is the tiny bubble at bottom centre.
     Off until this site has its own agent: put its agent id in AGENT_ID to switch it on. */
  var AGENT_ID = '';
  function loadAgent() {
    if (!AGENT_ID || document.querySelector('elevenlabs-convai')) return;
    var w = document.createElement('elevenlabs-convai');
    w.setAttribute('agent-id', AGENT_ID);
    var phone = window.matchMedia('(max-width: 900px)').matches;
    w.setAttribute('placement', phone ? 'bottom' : 'bottom-right');
    /* the full pill (avatar, call button, chat, "powered by") covers a third of a phone screen; a phone gets the tiny bubble */
    if (phone) w.setAttribute('variant', 'tiny');
    body.appendChild(w);
    body.classList.add('has-agent');
    var sc = document.createElement('script');
    sc.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.20.0';
    sc.async = true;
    body.appendChild(sc);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(loadAgent, { timeout: 4000 });
  else setTimeout(loadAgent, 2500);

  /* selected clients — the About page's scrolling list, above every closing band
     (the About page shows its own, so it is skipped there) */
  var CLIENTS = ['Lucky Energy', 'Sequel', 'Kyle Kuzma', 'Sony Music', 'Warner Music', 'Universal Music', 'Justin Bieber', 'MuchMusic', 'CBC', 'Cineplex', 'LCBO', 'Wrigley', 'Winners', 'Jim Beam', 'Red Bull', 'MSN', 'Tourism Toronto'];
  var closing = document.querySelector('.band-cta');
  closing = closing && closing.closest('.band');
  if (closing && !document.getElementById('marquee')) {
    var strip = document.createElement('section');
    strip.className = 'cl-strip'; strip.setAttribute('aria-label', 'Selected clients');
    var eb = document.createElement('div'); eb.className = 'eyebrow mono';
    eb.innerHTML = '<span class="dot">Selected clients</span>';
    var mq = document.createElement('div'); mq.className = 'cl-marquee';
    var tr = document.createElement('div'); tr.className = 'cl-track display';
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var names = CLIENTS.map(function (n) { return '<span>' + n + '</span>'; }).join('<i></i>') + '<i></i>';
    tr.innerHTML = still ? names : names + names;   /* twice, so the loop has no seam */
    mq.appendChild(tr); strip.appendChild(eb); strip.appendChild(mq);
    closing.parentNode.insertBefore(strip, closing);
  }

  /* back to top — a small solid arrow, bottom-right; it shows once the page has scrolled a screen.
     When the chat widget is on (its pill sits bottom-right on desktop) the arrow rides just above it. */
  var top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
  top.addEventListener('click', function () {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
  });
  body.appendChild(top);
  var topTick = false;
  function topShow() { topTick = false; top.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.9); }
  window.addEventListener('scroll', function () { if (!topTick) { topTick = true; requestAnimationFrame(topShow); } }, { passive: true });
  topShow();

  /* neon dot cursor — fine pointers only, swells over anything clickable */
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var cur = document.createElement('div');
    cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true');
    body.appendChild(cur);
    var x = -100, y = -100, tx = x, ty = y, shown = false;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; body.classList.add('cur-on'); x = tx; y = ty; }
      var hot = e.target.closest && e.target.closest('a, button, .slide, .card');
      body.classList.toggle('cur-hot', !!hot);
    });
    document.addEventListener('mouseleave', function () { body.classList.remove('cur-on'); shown = false; });
    (function tick() {
      x += (tx - x) * 0.35; y += (ty - y) * 0.35;
      cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(tick);
    })();
  }
})();
