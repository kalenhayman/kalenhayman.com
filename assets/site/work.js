/* =============================================================================
   AVA — the work. One list, every page reads from it.

   A piece is { id, title, types[], w, h, src | video, poster?, href?, deck?, text?, pdf? }.
   `pdf` is a document (a brand guide, a deck): the card shows `src` as its
   cover and opening it pages through the PDF itself. `hidden: true` parks a
   piece out of sight.
   `text: true` marks a graphic that carries its own type (a cover, a deck
   page) — it stays out of the home slider, where a title sits on the image.
   types come from the six services plus Casting. A view (filter) only goes
   live once it holds two pieces; until then its button stays hidden.
   ========================================================================== */
(function () {
  var B = 'https://ogpmpr3qmyfpwkqr.public.blob.vercel-storage.com/';
  var KUZ = B + 'Aurora%20V1%20-%20KUZ/';

  var WORK = [
    { id: 'the-studio-e01', title: 'The Studio · E01', types: ['Series'], w: 16, h: 9,
      poster: B + 'THE%20STUDIO%20-%20SERIES/The_Studio_Title_Card.png',
      posterPortrait: B + 'THE%20STUDIO%20-%20SERIES/VERTICAL%20TITLE%20COVERS/The_Studio_Title_Card_-_Vertical.png',
      videoPortrait: B + 'THE%20STUDIO%20-%20SERIES/VERTICAL%20VIDEOS/The%20STUDIO%20S01%20EP%2001%20-vertical%20-%20Oct%205%202026%20-%20DIR%20K.HAYMAN.mp4',
      video: B + 'THE%20STUDIO%20-%20SERIES/The%20Studio%20E01%20dir.%20k.hayman%2008.11.2026%20-%20landscap%2025mb.mp4',
      href: '/the-studio' },
    { id: 'the-studio-e05', title: 'The Studio · E05', types: ['Series'], w: 16, h: 9,
      video: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20VIDEOS/The%20STUDIO%20S01%20E05%20-%20A%20Mental%20Contract%20-%20landscape%20w%20titles%20-%20compressed.mp4',
      poster: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20TITLE%20COVERS/the-studio-s01e05-poster-16x9.png',
      videoPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20VIDEOS/The%20STUDIO%20S01%20E05%20-%20A%20Mental%20Contract%20-%20vertical%20-%20compressed.mp4',
      posterPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20TITLE%20COVERS/The%20STUDIO%20S01%20E05%20The%20Mental%20Contract%20ft%20KIA_poster.png',
      href: '/the-studio' },
    { id: 'the-studio-e04', title: 'The Studio · E04', types: ['Series'], w: 16, h: 9,
      poster: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20TITLE%20COVERS/The_Studio_Title_Card_-_Episode_04.png',
      video: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20VIDEOS/The%20STUDIO%20S01%20E04.mp4',
      videoPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20VIDEOS/The%20STUDIO%20S01%20E04%20-%20vertical%20dir.%20K.HAYMAN.mp4',
      posterPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20TITLE%20COVERS/The%20STUDIO%20S01%20E04%20-%20vertical%20dir.%20K.HAYMAN-Cover.jpg',
      href: '/the-studio' },
    { id: 'the-studio-e03', title: 'The Studio · E03', types: ['Series'], w: 16, h: 9,
      poster: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20TITLE%20COVERS/The%20STUDIO%20S01%20E03%20-%20landscape%20dir.%20K.HAYMAN%281%29-Cover.jpg',
      video: B + 'THE%20STUDIO%20-%20SERIES/' + 'The%20STUDIO%20S01%20E03%20-%20landscape%20dir.%20K.HAYMAN%20-%20COMPRESSED.mp4',
      videoPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20VIDEOS/The%20STUDIO%20S01%20E03.mp4',
      posterPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20TITLE%20COVERS/The_Studio_Title_Card_-_Episode_03_Vertical%20%281%29.png',
      href: '/the-studio' },
    { id: 'the-studio-e02', title: 'The Studio · E02', types: ['Series'], w: 16, h: 9,
      poster: B + 'THE%20STUDIO%20-%20SERIES/' + 'LANDSCAPE%20TITLE%20COVERS/The_Studio_Title_Card_-_Episode_02.png',
      video: B + 'THE%20STUDIO%20-%20SERIES/LANDSCAPE%20VIDEOS/The%20Studio%20E02-2%20landscape%20Oct_13_2026%20dir.K.HAYMA.mp4',
      videoPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20VIDEOS/The%20Studio%20S01%20E02%20dir.%20k.hayman%20_10_08_2026.mp4',
      posterPortrait: B + 'THE%20STUDIO%20-%20SERIES/' + 'VERTICAL%20TITLE%20COVERS/The_Studio_Title_Card_-_Episode_02.png',
      href: '/the-studio' },
    { id: 'aurora', title: 'Aurora × KUZ', types: ['Video'], w: 16, h: 9,
      poster: KUZ + 'KUZ%20IMAGE/KYLE%20AURORA%20HERO%20PAGE%201.png',
      video: KUZ + 'KUZ%20VIDEO/An%20Aurora%20Original%20x%2024%20Hours%20w%20KUZ%20by%20AVA%20Studios%20-%201920x1080.mp4',
      videoPortrait: KUZ + 'KUZ%20VIDEO/An%20Aurora%20Original%20x%20KUZ%2024%20Hours%20by%20AVA%20Studios%20-%20vertical.mp4',
      href: '/aurora' },
    { id: 'aurora-frames', title: 'Aurora · Frames', types: ['Image'], w: 2842, h: 1498, hidden: true,
      src: KUZ + 'KUZ%20IMAGE/paris_fashion_week.png',
      more: [KUZ + 'KUZ%20IMAGE/Kyle%20Walk-Out%201.png', KUZ + 'KUZ%20IMAGE/KUZ%20Court%20Training%202.png', KUZ + 'KUZ%20IMAGE/Villa%20Environment.png',
             KUZ + 'KUZ%20IMAGE/KUZ%20Ice%20Plunge.png', KUZ + 'KUZ%20IMAGE/kyle_ice_bath.png', KUZ + 'KUZ%20IMAGE/kyle_ice_bath_2.png',
             KUZ + 'KUZ%20IMAGE/villa_ice_bath_environment.png', KUZ + 'KUZ%20IMAGE/Kyle%20look-back.png', KUZ + 'KUZ%20IMAGE/KYLE%20AURORA%20HERO%20PAGE%201.png',
             KUZ + 'KUZ%20IMAGE/kyle_winnie_afterparty_paris_landing_page_grab.png', KUZ + 'KUZ%20IMAGE/kyle_walk_out_finale.png',
             KUZ + 'KUZ%20IMAGE/kyle_landing_page_video_SOF_pulled_over.png'] },
    { id: 'aurora-web', title: 'Aurora · Landing pages', types: ['Web'], w: 2868, h: 1540, hidden: true,
      src: KUZ + 'KUZ%20IMAGE/kyle_landing_page_1.png',
      more: [KUZ + 'KUZ%20IMAGE/kyle_landing_page_2.png', KUZ + 'KUZ%20IMAGE/aurora_landing_page_1_LPM%20environment.png', KUZ + 'KUZ%20IMAGE/kyle_LPM_night_landing_page.png'] },
    /* the home page hero: the demo reel, from its own title card (startAt 0) */
    { id: 'demo-reel', title: 'Demo Reel', types: ['Video'], w: 16, h: 9, startAt: 0,
      poster: B + 'PORTFOLIO/AVA-Demo-Reel-Cover.png',
      video: '/assets/video/ava-demo-reel.mp4' },   /* faststart copy of DEMO REELS/AVA DEMO REEL 11_2026 */
    { id: 'dupixent', title: 'Dupixent', types: ['Video'], w: 16, h: 9,
      poster: 'assets/img/dupixent-cover.jpg',
      video: B + 'PORTFOLIO/DUPIXENT%20-%20animatic%20.mp4' },
    { id: 'asics', title: 'Asics', types: ['Video'], w: 9, h: 16,
      poster: 'assets/img/asics-cover.jpg',
      video: 'assets/video/asics-spec-ad.mp4' },
    { id: 'i-am-ava', title: 'I Am AVA', types: ['Video'], w: 16, h: 9,
      video: B + 'I%20AM%20AVA%20-%20FULL%20-%20compressed.mp4' },
    { id: 'ava-brand-guide', text: true, title: 'AVA · Brand Guide', types: ['Branding'], w: 1600, h: 1131,
      src: 'assets/docs/ava-brand-guide/p-1.jpg', href: '/brand-guide' },
    { id: 'raven-brand-kit', text: true, title: 'Raven Red · Brand Kit', types: ['Branding'], w: 2408, h: 1586,
      src: B + 'RAVEN/1%20RAVEN%20BRAND%20KIT%20COVER.png',
      more: [B + 'RAVEN/4%20RAVEN%20BRAND%20KIT%20COVER.png'] },
    { id: 'kia-brand-guide', text: true, title: 'KIA · Brand Guide', types: ['Branding'], w: 1978, h: 1406,
      src: B + 'KIA/KIA%20BRAND%20GUIDE%20COVER%20PAGE%20SCREEN%20GRAB.png' },
    { id: 'raven-rise-film', title: 'Vancouver Rise FC', types: ['Video'], w: 9, h: 16,
      video: B + 'RAVEN/RAVEN%20RED%20RISE%20by%20AVA%20Studio%20-%20September%202026.mp4' },
    { id: 'kia-oura', title: 'Oura', types: ['Video'], w: 9, h: 16,
      video: B + 'KIA/KIA%20OURA%20RING.mp4' },
    { id: 'raven-rise-stills', title: 'Vancouver Rise FC', types: ['Image'], w: 9, h: 16,
      src: B + 'RAVEN/Vancouver%20Rise%20FC%20-%20AVA%20Spec%20Campaign-selection%20%282%29%20copy.png',
      more: [B + 'RAVEN/Vancouver%20Rise%20FC%20-%20AVA%20Spec%20Campaign-selection%20copy.png'] },
    { id: 'raven-hero', title: 'Raven Red · The Hero', types: ['Image'], w: 4, h: 5,
      src: B + 'RAVEN/05%20_%20The%20Hero.png' },
    { id: 'raven-out-of-sound', title: 'Raven Red · Out of Sound', types: ['Image'], w: 4, h: 5,
      src: B + 'RAVEN/04%20_%20Out%20of%20Sound.png' },
    { id: 'raven-battle-cry', title: 'Battle Cry · Nîpisîy Red', types: ['Image'], w: 1414, h: 2000,
      src: B + 'RAVEN/BATTLE%20CRY%20-%20Ni%CC%82pisi%CC%82y%20Red%20CAMPAIGN%20.jpeg' },
    { id: 'danny-air-jordan', title: 'Danny × Air Jordan', types: ['Image'], w: 1786, h: 1199, text: true,
      src: B + 'DANNY/PRESS%20RELEASE%201.png',
      more: [B + 'DANNY/PRESS%20RELEASE%202.png'] },
    { id: 'kia-aqua', title: 'KIA · Aqua Energy', types: ['Image'], w: 4, h: 5,
      src: B + 'KIA/KAI%20AQUA%20ENERGY%203.png',
      more: [B + 'KIA/KAI%20AQUA%20ENERGY%204.png', B + 'KIA/KAI%20AQUA%20ENERGY%206.png'] },
    { id: 'kia-strength', title: 'KIA · Strength', types: ['Image'], w: 3, h: 4,
      src: B + 'KIA/KIA%20STRENGHT%20TRAINING%203.png',
      more: [B + 'KIA/KIA%20STRENGHT%20TRAINING%205.png'] },
    { id: 'raven-team-canada', title: 'Raven Red · Team Canada', types: ['Image'], w: 880, h: 1168,
      src: B + 'RAVEN/RAVEN%20FITNESS%20EDITORIAL%20TEAM%20CANADA.png' },
    { id: 'kia-editorial', text: true, title: 'KIA · Avatar Editorial No.01', types: ['Deck'], w: 0.707, h: 1,
      src: 'assets/kia-editorial/kia-01.jpg',
      more: ['assets/kia-editorial/kia-02.jpg', 'assets/kia-editorial/kia-03.jpg', 'assets/kia-editorial/kia-04.jpg', 'assets/kia-editorial/kia-05.jpg', 'assets/kia-editorial/kia-06.jpg', 'assets/kia-editorial/kia-07.jpg', 'assets/kia-editorial/kia-08.jpg'] },
    { id: 'raven-editorial', text: true, title: 'Raven Red · In Search of My Hero', types: ['Deck'], w: 0.707, h: 1,
      src: 'assets/raven-editorial/raven-01.jpg',
      more: ['assets/raven-editorial/raven-02.jpg', 'assets/raven-editorial/raven-03.jpg', 'assets/raven-editorial/raven-04.jpg', 'assets/raven-editorial/raven-05.jpg', 'assets/raven-editorial/raven-06.jpg', 'assets/raven-editorial/raven-07.jpg'] },
    { id: 'globalist-editorial', text: true, title: 'Globalist · Editorial', types: ['Deck'], w: 0.707, h: 1,
      src: 'assets/globalist-editorial/globalist-01.jpg',
      more: ['assets/globalist-editorial/globalist-02.jpg', 'assets/globalist-editorial/globalist-03.jpg', 'assets/globalist-editorial/globalist-04.jpg', 'assets/globalist-editorial/globalist-05.jpg', 'assets/globalist-editorial/globalist-06.jpg'] },

    /* Originals — the casting view */
    { id: 'virtual-affair', title: 'The Virtual Affair', sub: 'Danny & Laura', types: ['Casting'], w: 1200, h: 630, src: 'assets/og/the-virtual-affair.jpg', href: '/the-virtual-affair' },
    { id: 'kia', title: 'KIA', sub: 'Fitness · Performance', types: ['Casting'], w: 1792, h: 2400, src: 'assets/model-kia.png', deck: '/model?m=kia' },
    { id: 'raven', title: 'RAVEN', sub: 'Music · Culture', types: ['Casting'], w: 1792, h: 2194, src: 'assets/model-raven.jpg', deck: '/model?m=raven' },
    { id: 'globalist', title: 'GLOBALIST', sub: 'Editorial · Longform', types: ['Casting'], w: 1792, h: 2400, src: 'assets/model-globalist.jpg', deck: '/model?m=globalist' },
    { id: 'danny', title: 'DANNY', sub: "Men's fashion · Campaign", types: ['Casting'], w: 2023, h: 1858, src: 'assets/model-danny.jpg', deck: '/model?m=danny' },
    { id: 'laura', title: 'LAURA', sub: 'Luxury · Beauty', types: ['Casting'], w: 1792, h: 2400, src: 'assets/model-laura.png', deck: '/model?m=laura' }
  ];

  /* Motion pieces without a poster of their own get the frame the
     work-thumbs action pulled for them (assets/work/<id>.jpg). */
  WORK.forEach(function (p) { if (p.video && !p.poster) p.poster = 'assets/work/' + p.id + '.jpg'; });

  var PIECE = {};
  WORK.forEach(function (p) { PIECE[p.id] = p; });

  /* `hidden: true` keeps a piece out of every view until it is ready. */
  WORK = WORK.filter(function (p) { return !p.hidden; });

  /* ---------------------------------------------------------------------------
     Projects — the portfolio is shown by project, not by file. Each one has a
     name (the brand or the project), a kind (what it is), the service types it
     covers, and one 16:10 thumbnail (assets/projects/<id>.jpg, built by the
     project-thumbs action from scripts/project-thumbs.json). A project with a
     page of its own links there; the rest open in the lightbox and step through
     every image and film in them. `face: true` marks an AVA Original, which only
     shows under Casting.
     ------------------------------------------------------------------------ */
  function mediaOf(ids) {
    var out = [];
    ids.forEach(function (id) {
      var p = PIECE[id]; if (!p) return;
      if (p.video) out.push({ video: p.video, videoPortrait: p.videoPortrait, poster: p.poster });
      else [p.src].concat(p.more || []).forEach(function (s) { out.push({ src: s }); });
    });
    return out;
  }
  /* Newest first: the home page always shows the top three. */
  var PROJECTS = [
    { id: 'oshi-nori', name: 'Oshi Nori', kind: 'Concept site', types: ['Web'], href: '/oshi-nori' },
    { id: 'craffles', name: 'Craffles', kind: 'Concept site', types: ['Web'], href: '/craffles' },
    { id: 'tavola', name: 'Tavola', kind: 'Concept site', types: ['Web'], href: '/tavola' },
    /* España (concept site, /espana) is decommissioned — files kept; to bring it back, restore:
       { id: 'espana', name: 'España', kind: 'Concept site', types: ['Web'], href: '/espana' }, */
    { id: 'red-accordion', name: 'The Red Accordion', kind: 'Concept site', types: ['Web'], href: '/red-accordion' },
    /* No Bad Days (website, /no-bad-days) is parked for now — to bring it back, restore:
       { id: 'no-bad-days', name: 'No Bad Days', kind: 'Website', types: ['Web'], href: '/no-bad-days' }, */
    { id: 'the-studio', name: 'The STUDIO', kind: 'Pilot web series', types: ['Series', 'Video'], href: '/the-studio' },
    { id: 'aurora', name: 'Aurora × KUZ', kind: 'Brand film', types: ['Video', 'Image', 'Web'], href: '/aurora' },
    { id: 'virtual-affair', name: 'The Virtual Affair', kind: 'Casting', types: ['Image', 'Casting'], href: '/the-virtual-affair' },
    { id: 'dupixent', name: 'Dupixent', kind: 'Animatic ad', types: ['Video'], media: mediaOf(['dupixent']) },
    { id: 'asics', name: 'Asics', kind: 'Spec ad', types: ['Video'], media: mediaOf(['asics']) },
    { id: 'raven-rise', name: 'Vancouver Rise FC', kind: 'Spec campaign · Video & stills', types: ['Video', 'Image'], media: mediaOf(['raven-rise-film', 'raven-rise-stills']) },
    { id: 'kia-oura', name: 'Oura', kind: 'Spec ad', types: ['Video'], media: mediaOf(['kia-oura']) },
    { id: 'i-am-ava', name: 'I Am AVA', kind: 'Casting outtakes', types: ['Video', 'Casting'], media: mediaOf(['i-am-ava']) },
    { id: 'ava-brand-guide', name: 'AVA', kind: 'Brand guide', types: ['Branding', 'Deck'], href: '/brand-guide' },
    { id: 'raven-brand-kit', name: 'Raven Red', kind: 'Brand kit', types: ['Branding'], media: mediaOf(['raven-brand-kit']) },
    { id: 'kia-brand-guide', name: 'KIA', kind: 'Brand guide', types: ['Branding'], media: mediaOf(['kia-brand-guide']) },
    { id: 'raven-editorial', name: 'Raven Red · In Search of My Hero', kind: 'Editorial', types: ['Deck'], media: mediaOf(['raven-editorial']) },
    { id: 'kia-editorial', name: 'KIA · Avatar Editorial No.01', kind: 'Editorial', types: ['Deck'], media: mediaOf(['kia-editorial']) },
    { id: 'globalist', name: 'The Globalist', kind: 'Editorial · Brand kit', types: ['Deck', 'Branding'],
      media: mediaOf(['globalist-editorial']).concat([1, 2, 3, 4, 5].map(function (n) { return { src: 'assets/docs/globalist-brand-kit/p-' + n + '.jpg' }; })) },
    { id: 'raven-campaigns', name: 'Raven Red', kind: 'Campaign stills', types: ['Image'], media: mediaOf(['raven-hero', 'raven-out-of-sound', 'raven-battle-cry', 'raven-team-canada']) },
    { id: 'kia-campaigns', name: 'KIA', kind: 'Fitness campaign', types: ['Image'], media: mediaOf(['kia-aqua', 'kia-strength']) },
    { id: 'danny-air-jordan', name: 'Danny × Air Jordan', kind: 'Spec ad', types: ['Image'], media: mediaOf(['danny-air-jordan']) },

    /* Originals — the faces, under Casting */
    { id: 'face-kia', name: 'KIA', kind: 'Original · Fitness', types: ['Casting'], face: true, href: '/model?m=kia' },
    { id: 'face-raven', name: 'RAVEN', kind: 'Original · Music', types: ['Casting'], face: true, href: '/model?m=raven' },
    { id: 'face-globalist', name: 'GLOBALIST', kind: 'Original · Editorial', types: ['Casting'], face: true, href: '/model?m=globalist' },
    { id: 'face-danny', name: 'DANNY', kind: 'Original · Men’s fashion', types: ['Casting'], face: true, href: '/model?m=danny' },
    { id: 'face-laura', name: 'LAURA', kind: 'Original · Luxury', types: ['Casting'], face: true, href: '/model?m=laura' }
  ];
  PROJECTS.forEach(function (p) { p.thumb = '/assets/projects/' + p.id + '.jpg'; });

  var VIEWS = ['All', 'Branding', 'Web', 'Deck', 'Image', 'Video', 'Series', 'Casting'];
  var INTAKE = '/start-intake';

  /* views count projects: All is every project, Casting the faces and casting work */
  function inView(p, view) { return view === 'All' ? !p.face : p.types.indexOf(view) > -1; }
  function count(view) {
    return PROJECTS.filter(function (p) { return inView(p, view); }).length;
  }
  function liveViews() { return VIEWS.filter(function (v) { return count(v) >= 2; }); }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  /* Rows are justified like a contact sheet: every piece keeps its own ratio,
     the row height flexes so each row runs edge to edge. */
  function layout(gridEl) {
    var W = gridEl.clientWidth, gap = 10, target = W < 700 ? 220 : (W < 1100 ? 300 : 380);
    var cards = Array.prototype.filter.call(gridEl.children, function (c) { return !c.classList.contains('is-out'); });
    var row = [], sum = 0, phone = W < 700, pos = 0;
    function flush(fit) {
      var h = fit ? (W - gap * (row.length - 1)) / sum : target;
      /* rows are laid out in the order they close, so a held card follows the landscape one */
      row.forEach(function (c) { c.style.width = Math.floor(c._ratio * h) + 'px'; c.style.setProperty('--h', Math.floor(h) + 'px'); c.style.order = pos++; });
      row = []; sum = 0;
    }
    cards.forEach(function (c) {
      if (phone) {
        /* On a phone, vertical pieces sit two to a row and a landscape piece
           takes a row of its own. */
        if (c._ratio > 1.2) {
          var held = row, heldSum = sum;      /* a lone vertical waits for its pair */
          row = [c]; sum = c._ratio; flush(true);
          row = held; sum = heldSum; return;
        }
        row.push(c); sum += c._ratio;
        if (row.length === 2) flush(true);
        return;
      }
      row.push(c); sum += c._ratio;
      if (sum * target + gap * (row.length - 1) >= W) flush(true);
    });
    if (row.length) flush(phone ? row.length === 2 : sum * target > W * 0.7);
  }
  function typesLine(p) { return p.sub || p.types.join(' / '); }

  /* --- the card --- */
  function card(p) {
    /* A face goes straight to its own page; a piece with a page of its own does too. */
    var link = p.href || p.deck;
    var a = el(link ? 'a' : 'button', 'card');
    a._ratio = p.w / p.h;
    if (link) a.href = link; else { a.type = 'button'; a.addEventListener('click', function () { open(p, seqFrom(a)); }); }
    a.setAttribute('data-id', p.id);
    a.setAttribute('aria-label', p.title + ' — ' + typesLine(p));
    var m = el('div', 'card-media');
    m.style.setProperty('--ar', p.w + ' / ' + p.h);
    if (p.src) {
      var img = document.createElement('img');
      img.src = p.src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      m.appendChild(img);
    } else if (p.video) {
      /* Motion cards show their first frame, then play silently on hover
         (pointer devices) or once they scroll into view (touch). */
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      if (p.poster) v.poster = p.poster;
      /* With a poster, the card downloads nothing until it is hovered: a page
         of nine films would otherwise queue nine downloads behind the hero. */
      v.preload = p.poster ? 'none' : 'metadata';
      var attach = function () { if (!v.src) v.src = p.video; };
      if (!p.poster) attach();
      m.appendChild(v);
      a.addEventListener('mouseenter', function () { attach(); var q = v.play(); if (q && q.catch) q.catch(function () {}); });
      a.addEventListener('mouseleave', function () { v.pause(); });
    }
    a.appendChild(el('span', 'card-slash'));
    a.appendChild(m);
    var cap = el('div', 'card-cap');
    cap.appendChild(el('span', 'card-title', p.title));
    cap.appendChild(el('span', 'card-types mono', typesLine(p)));
    a.appendChild(cap);
    return a;
  }

  /* The pieces a lightbox steps through: every card in the same grid that opens in
     place (not a link to its own page) and is showing under the current view. */
  function seqFrom(card) {
    var grid = card.parentNode; if (!grid) return null;
    var out = [];
    Array.prototype.forEach.call(grid.children, function (c) {
      if (c.tagName !== 'BUTTON' || c.classList.contains('is-out')) return;
      var id = c.getAttribute('data-id');
      var q = WORK.filter(function (x) { return x.id === id; })[0];
      if (q) out.push(q);
    });
    return out;
  }

  /* --- grid + views --- */
  function mount(root, opts) {
    opts = opts || {};
    var list = opts.ids ? opts.ids.map(function (id) { return WORK.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean) : WORK;
    var viewsEl = root.querySelector('.views');
    var gridEl = root.querySelector('.grid');
    var current = opts.view || 'All';

    function apply(view) {
      current = view;
      Array.prototype.forEach.call(gridEl.children, function (c) {
        var id = c.getAttribute('data-id');
        if (!id) { c.classList.toggle('is-out', view !== 'All' && view !== 'Casting'); return; }
        var p = WORK.filter(function (x) { return x.id === id; })[0];
        c.classList.toggle('is-out', view !== 'All' && p.types.indexOf(view) === -1);
      });
      if (viewsEl) Array.prototype.forEach.call(viewsEl.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === view));
      });
      layout(gridEl);
      if (opts.onView) opts.onView(view);
    }
    var raf;
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { layout(gridEl); }); });

    if (viewsEl) {
      var live = liveViews();
      VIEWS.forEach(function (v) {
        var li = el('li');
        var b = el('button', null, v);
        b.type = 'button'; b.setAttribute('data-view', v);
        if (live.indexOf(v) === -1) b.hidden = true;
        b.addEventListener('click', function () { apply(v); });
        li.appendChild(b); viewsEl.appendChild(li);
      });
    }
    list.forEach(function (p) { gridEl.appendChild(card(p)); });
    if (opts.cta) {
      /* Build Your Own — the sixth casting card */
      var c = el('a', 'card card--cta');
      c.href = INTAKE; c._ratio = 0.8;
      c.appendChild(el('span', 'card-types mono dot', 'Originals'));
      c.appendChild(el('span', 'card-title', 'Build<br>your own'));
      c.appendChild(el('span', 'btn', 'Start Intake <span class="arr">→</span>'));
      gridEl.appendChild(c);
    }
    apply(current);
    return { apply: apply };
  }

  /* --- projects: one card each, all the same size --- */
  var asPieceCache = {};
  function asPiece(p) {
    return asPieceCache[p.id] || (asPieceCache[p.id] = { id: p.id, title: p.name, sub: p.kind, types: p.types, media: p.media || [] });
  }
  function projectSeq(card) {
    var out = [];
    Array.prototype.forEach.call(card.parentNode.children, function (c) {
      if (c.tagName !== 'BUTTON' || c.classList.contains('is-out')) return;
      var q = PROJECTS.filter(function (x) { return x.id === c.getAttribute('data-id'); })[0];
      if (q) out.push(asPiece(q));
    });
    return out;
  }
  function projectCard(p) {
    var a = el(p.href ? 'a' : 'button', 'card card--project');
    if (p.href) a.href = p.href;
    else { a.type = 'button'; a.addEventListener('click', function () { open(asPiece(p), projectSeq(a)); }); }
    a.setAttribute('data-id', p.id);
    a.setAttribute('aria-label', p.name + ' — ' + p.kind);
    var m = el('div', 'card-media');
    var img = document.createElement('img');
    img.src = p.thumb; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    m.appendChild(img);
    a.appendChild(el('span', 'card-slash'));
    a.appendChild(m);
    var cap = el('div', 'card-cap');
    cap.appendChild(el('span', 'card-title', p.name));
    var n = p.media ? p.media.length : 0;
    var meta = p.href ? (p.face ? 'Profile →' : 'Project page →') : (n > 1 ? n + ' pieces' : (n && p.media[0].video ? 'Video' : ''));
    cap.appendChild(el('span', 'card-types mono', '<span>' + p.kind + '</span>' + (meta ? '<span class="card-meta">' + meta + '</span>' : '')));
    a.appendChild(cap);
    return a;
  }
  function mountProjects(root, opts) {
    opts = opts || {};
    var list = opts.ids ? opts.ids.map(function (id) { return PROJECTS.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean) : PROJECTS;
    var viewsEl = root.querySelector('.views');
    var gridEl = root.querySelector('.grid');
    gridEl.classList.add('pgrid');
    var cta = null;
    function apply(view) {
      Array.prototype.forEach.call(gridEl.children, function (c) {
        if (c === cta) { c.classList.toggle('is-out', view !== 'Casting'); return; }
        var p = PROJECTS.filter(function (x) { return x.id === c.getAttribute('data-id'); })[0];
        c.classList.toggle('is-out', !inView(p, view));
      });
      if (viewsEl) Array.prototype.forEach.call(viewsEl.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === view));
      });
      if (opts.onView) opts.onView(view);
    }
    if (viewsEl) {
      var live = liveViews();
      VIEWS.forEach(function (v) {
        var li = el('li');
        var b = el('button', null, v);
        b.type = 'button'; b.setAttribute('data-view', v);
        if (live.indexOf(v) === -1) b.hidden = true;
        b.addEventListener('click', function () { apply(v); });
        li.appendChild(b); viewsEl.appendChild(li);
      });
    }
    list.forEach(function (p) { gridEl.appendChild(projectCard(p)); });
    if (opts.cta) {
      /* Build your own — closes the Casting view, same size as the faces */
      cta = el('a', 'card card--project card--build');
      cta.href = INTAKE;
      var m = el('div', 'card-media');
      m.appendChild(el('span', 'build-t display', 'Build<br>your own'));
      cta.appendChild(el('span', 'card-slash'));
      cta.appendChild(m);
      var cap = el('div', 'card-cap');
      cap.appendChild(el('span', 'card-title', 'Your face. Your IP.'));
      cap.appendChild(el('span', 'card-types mono', '<span>Original · Custom</span><span class="card-meta">Start Intake →</span>'));
      cta.appendChild(cap);
      gridEl.appendChild(cta);
    }
    apply(opts.view || 'All');
    return { apply: apply };
  }

  /* --- open in place --- */
  var lb, lbMedia, lbTitle, lbTypes, lbLink, lbIdx, lbPages, lbPdf, lbTypesBase = '';
  var lbSeq = null, lbPos = 0, lbPrev, lbNext, lbCount;
  var PDFJS = '/assets/vendor/pdfjs/';
  function ensureLb() {
    if (lb) return;
    lb = el('div', 'lb'); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    var inner = el('div', 'lb-inner');
    lbMedia = el('div', 'lb-media');
    var cap = el('div', 'lb-cap');
    lbTitle = el('span', 'card-title');
    lbTypes = el('span', 'card-types mono');
    lbLink = el('a', 'lb-link');
    cap.appendChild(lbTitle); cap.appendChild(lbTypes); cap.appendChild(lbLink);
    inner.appendChild(lbMedia); inner.appendChild(cap);
    var close = el('button', 'lb-close', 'Close');
    close.type = 'button'; close.addEventListener('click', shut);
    lb.appendChild(inner); lb.appendChild(close);
    /* previous / next piece in the grid it was opened from */
    lbPrev = el('button', 'lb-step lb-step--prev', '←'); lbPrev.type = 'button'; lbPrev.setAttribute('aria-label', 'Previous piece');
    lbNext = el('button', 'lb-step lb-step--next', '→'); lbNext.type = 'button'; lbNext.setAttribute('aria-label', 'Next piece');
    lbPrev.addEventListener('click', function () { piece(-1); });
    lbNext.addEventListener('click', function () { piece(1); });
    lbCount = el('span', 'lb-count mono');
    lb.appendChild(lbPrev); lb.appendChild(lbNext); lb.appendChild(lbCount);
    lb.addEventListener('click', function (e) { if (e.target === lb) shut(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') shut();
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    /* a click on the right half pages forward, the left half back; a swipe does the same */
    lbMedia.addEventListener('click', function (e) {
      if (!lbPages && !lbPdf) return;
      if (e.target.tagName === 'VIDEO') return;
      var r = lbMedia.getBoundingClientRect();
      page(e.clientX - r.left < r.width / 2 ? -1 : 1);
    });
    var x0 = null;
    lbMedia.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lbMedia.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.body.appendChild(lb);
  }
  /* The arrow keys and a swipe turn a piece's own pages first (a deck, a PDF);
     past its last page they move on to the next piece, and back past its first
     to the previous one. */
  function step(d) {
    var n = lbPdf ? lbPdf.total : (lbPages ? lbPages.length : 1);
    if (n > 1 && lbIdx + d >= 0 && lbIdx + d < n) { page(d); return; }
    piece(d);
  }
  function piece(d) {
    if (!lbSeq || lbSeq.length < 2) return;
    lbPos = (lbPos + d + lbSeq.length) % lbSeq.length;
    show(lbSeq[lbPos]);
  }
  function counter(n, total) { lbTypes.textContent = lbTypesBase + ' · ' + n + ' / ' + total; }
  function page(d) {
    if (lbPdf) { renderPdfPage(lbIdx + d); return; }
    if (!lbPages) return;
    lbIdx = (lbIdx + d + lbPages.length) % lbPages.length;
    renderItem(lbPages[lbIdx]);
    counter(lbIdx + 1, lbPages.length);
  }
  /* the things a piece shows, in order: a film, or a still and its pages */
  function itemsOf(p) {
    if (p.media) return p.media;
    if (p.video) return [{ video: p.video, videoPortrait: p.videoPortrait, poster: p.poster }];
    return [p.src].concat(p.more || []).map(function (s) { return { src: s }; });
  }
  function renderItem(it) {
    var old = lbMedia.querySelector('video'); if (old) old.pause();
    lbMedia.textContent = '';
    if (it.video) {
      var v = document.createElement('video');
      v.controls = true; v.autoplay = true; v.playsInline = true; v.muted = true;
      v.setAttribute('playsinline', ''); if (it.poster) v.poster = it.poster;
      var tall = window.matchMedia('(orientation: portrait)').matches;
      v.src = (tall && it.videoPortrait) || it.video;
      lbMedia.appendChild(v);
    } else {
      var img = document.createElement('img'); img.src = it.src; img.alt = lbTitle.textContent;
      lbMedia.appendChild(img);
    }
  }

  /* --- documents: pdf.js, loaded the first time a PDF opens --- */
  var pdfReady = null;
  function loadPdfJs() {
    if (pdfReady) return pdfReady;
    pdfReady = new Promise(function (res, rej) {
      if (window.pdfjsLib) return res(window.pdfjsLib);
      var sc = document.createElement('script');
      sc.src = PDFJS + 'pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = function () { pdfReady = null; rej(new Error('pdf.js failed to load')); };
      document.head.appendChild(sc);
    });
    return pdfReady;
  }
  var pdfSeq = 0;
  function openPdf(p) {
    var seq = ++pdfSeq;
    var canvas = document.createElement('canvas');
    canvas.className = 'lb-page';
    canvas.setAttribute('aria-label', p.title);
    loadPdfJs().then(function (lib) {
      return lib.getDocument({ url: p.pdf }).promise;
    }).then(function (doc) {
      if (seq !== pdfSeq) return;
      lbPdf = { doc: doc, canvas: canvas, total: doc.numPages, busy: false };
      lbMedia.textContent = '';
      lbMedia.appendChild(canvas);
      lbMedia.style.cursor = 'e-resize';
      renderPdfPage(0);
    }).catch(function () {
      /* no viewer — the cover stays and the link opens the file itself */
      if (seq === pdfSeq) counter('PDF', '');
    });
  }
  function renderPdfPage(i) {
    var d = lbPdf; if (!d || d.busy) return;
    lbIdx = (i + d.total) % d.total;
    d.busy = true;
    d.doc.getPage(lbIdx + 1).then(function (pg) {
      var box = lb.getBoundingClientRect();
      var maxW = Math.min(box.width - 2 * parseFloat(getComputedStyle(lb).paddingLeft), 1400);
      var maxH = window.innerHeight - 140;
      var v = pg.getViewport({ scale: 1 });
      var scale = Math.min(maxW / v.width, maxH / v.height);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var vp = pg.getViewport({ scale: scale * dpr });
      d.canvas.width = vp.width; d.canvas.height = vp.height;
      d.canvas.style.width = Math.floor(vp.width / dpr) + 'px';
      d.canvas.style.height = Math.floor(vp.height / dpr) + 'px';
      return pg.render({ canvasContext: d.canvas.getContext('2d'), viewport: vp }).promise;
    }).then(function () {
      d.busy = false;
      counter(lbIdx + 1, d.total);
    }, function () { d.busy = false; });
  }
  function open(p, seq) {
    ensureLb();
    lbSeq = seq && seq.length ? seq : [p];
    lbPos = Math.max(0, lbSeq.indexOf(p));
    if (lbSeq.indexOf(p) === -1) lbSeq = [p];
    show(p);
    lb.classList.add('is-open');
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-close').focus();
  }
  function show(p) {
    var old = lbMedia.querySelector('video'); if (old) old.pause();
    lbMedia.textContent = '';
    lbPages = null; lbPdf = null; pdfSeq++;
    lbMedia.style.cursor = '';
    if (p.pdf) {
      /* the cover shows at once; the document replaces it when it has loaded */
      var cover = document.createElement('img'); cover.src = p.src; cover.alt = p.title;
      lbMedia.appendChild(cover);
      lbMedia.style.cursor = 'progress';
      openPdf(p);
    } else {
      var items = itemsOf(p);
      lbTitle.textContent = p.title;
      lbIdx = 0;
      if (items.length) renderItem(items[0]);
      if (items.length > 1) { lbPages = items; lbMedia.style.cursor = 'e-resize'; }
    }
    lbTitle.textContent = p.title;
    lbTypesBase = typesLine(p);
    lbTypes.textContent = lbPages ? lbTypesBase + ' · 1 / ' + lbPages.length : lbTypesBase;
    if (p.deck) { lbLink.hidden = false; lbLink.href = p.deck; lbLink.textContent = 'View Profile Deck →'; lbLink.removeAttribute('target'); }
    else if (p.pdf) { lbLink.hidden = false; lbLink.href = p.pdf; lbLink.target = '_blank'; lbLink.rel = 'noopener'; lbLink.textContent = 'Open the PDF →'; }
    else { lbLink.hidden = true; }
    var many = lbSeq.length > 1;
    lbPrev.hidden = lbNext.hidden = lbCount.hidden = !many;
    lbCount.textContent = many ? (lbPos + 1) + ' / ' + lbSeq.length : '';
  }
  function shut() {
    if (!lb) return;
    var v = lbMedia.querySelector('video'); if (v) v.pause();
    lb.classList.remove('is-open');
    document.body.classList.remove('lb-open');
  }

  window.AVA = { WORK: WORK, PROJECTS: PROJECTS, VIEWS: VIEWS, INTAKE: INTAKE, mount: mount, mountProjects: mountProjects, open: open, liveViews: liveViews, count: count };
})();
