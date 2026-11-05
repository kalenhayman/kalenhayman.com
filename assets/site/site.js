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

  /* AVA's chat agent (ElevenLabs): a floating widget on every page, loaded once the
     page is idle so it never competes with the films. On a phone it is the tiny bubble at bottom centre. */
  function loadAgent() {
    if (document.querySelector('elevenlabs-convai')) return;
    var w = document.createElement('elevenlabs-convai');
    w.setAttribute('agent-id', 'agent_2401kxsxcckvercb1kxzf8zam209');
    var phone = window.matchMedia('(max-width: 900px)').matches;
    w.setAttribute('placement', phone ? 'bottom' : 'bottom-right');
    /* the full pill (avatar, call button, chat, "powered by") covers a third of a phone screen; a phone gets the tiny bubble */
    if (phone) w.setAttribute('variant', 'tiny');
    body.appendChild(w);
    var sc = document.createElement('script');
    sc.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.20.0';
    sc.async = true;
    body.appendChild(sc);
  }
  if ('requestIdleCallback' in window) requestIdleCallback(loadAgent, { timeout: 4000 });
  else setTimeout(loadAgent, 2500);

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
