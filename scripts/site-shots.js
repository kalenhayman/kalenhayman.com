/* Screenshots a live site for a case study. Run by .github/workflows/site-shots.yml. */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const URL = process.env.URL, OUT = process.env.OUT;
fs.mkdirSync(OUT, { recursive: true });

async function settle(pg) {
  // walk the page once so lazy images and reveal-on-scroll blocks fire
  await pg.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await pg.waitForTimeout(1500);
}
// the tops of the page's big blocks, spaced at least most of a screen apart
async function stops(pg, vh, max) {
  return pg.evaluate(({ vh, max }) => {
    const H = document.documentElement.scrollHeight;
    const tops = [0];
    document.querySelectorAll('section, header, footer, main > div, [class*="section"]').forEach(e => {
      const r = e.getBoundingClientRect(); const t = Math.round(r.top + scrollY);
      if (r.height > 240 && t > 0 && t < H - 200) tops.push(Math.min(t, H - vh));
    });
    tops.sort((a, b) => a - b);
    const out = [];
    tops.forEach(t => { if (!out.length || t - out[out.length - 1] > vh * 0.8) out.push(t); });
    for (let y = vh; out.length < 3 && y < H - vh; y += vh) if (!out.some(t => Math.abs(t - y) < vh * 0.8)) out.push(y);
    return out.sort((a, b) => a - b).slice(0, max);
  }, { vh, max });
}
async function shoot(pg, prefix, vh, max) {
  const ys = await stops(pg, vh, max);
  let i = 0;
  for (const y of ys) {
    await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(1300);
    await pg.screenshot({ path: `${OUT}/${prefix}-${String(i++).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 84 });
  }
  console.log(prefix, 'stops', ys.join(','));
}

(async () => {
  const b = await chromium.launch();
  // desktop
  const d = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
  await d.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto', e.message));
  await d.waitForTimeout(2500);
  const info = await d.evaluate(() => ({
    title: document.title,
    meta: [...document.querySelectorAll('meta[name], meta[property]')].map(m => (m.getAttribute('name') || m.getAttribute('property')) + ' = ' + m.content),
    heads: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName + ': ' + h.innerText.replace(/\s+/g, ' ').trim()),
    links: [...document.querySelectorAll('a[href]')].map(a => a.innerText.replace(/\s+/g, ' ').trim() + ' -> ' + a.getAttribute('href')).slice(0, 60),
    height: document.documentElement.scrollHeight,
    text: document.body.innerText.slice(0, 6000)
  }));
  console.log(JSON.stringify(info, null, 2));
  await settle(d);
  await shoot(d, 'd', 900, 8);
  // one full-page capture at 1x for review
  const full = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await full.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await full.waitForTimeout(2000); await settle(full);
  await full.screenshot({ path: `${OUT}/full.jpg`, type: 'jpeg', quality: 70, fullPage: true });
  // phone
  const m = await (await b.newContext({ ...devices['iPhone 13'] })).newPage();
  await m.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await m.waitForTimeout(2500); await settle(m);
  await shoot(m, 'm', 844, 5);
  await b.close();
})();
