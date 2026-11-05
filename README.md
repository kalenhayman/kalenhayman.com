# aug26.avadesign.studio

Static marketing site for **AVA Design Studio** — custom model avatars designed as brand-owned IP.

No build step, no dependencies. Commit and deploy as-is.

## Structure

```
index.html            Home page — lead-gen flow, hero → what/who → custom avatars → roster → where → method → cycle → contact
studio.html           The deeper story — why it matters, when it gets made, how it gets made
model.html            Per-model profile — reads ?m=<slug> (kia, raven, kai, globalist, danny, laura)
<slug>.html           Shareable per-model URL — carries that model's link-preview tags
production-brief.html The production brief — served at /brief/production. Leads.
casting-brief.html    The casting brief — served at /brief/casting. Follows.
assets/brief/         The flow engine and styles both briefs share
api/brief.js          Their endpoint — validates, then forwards to a Make webhook
vercel.json           Rewrites for the /brief/* routes
assets/               Logos, badge, model portraits, editorial still
```

Fonts load from Google Fonts (Archivo Black, Archivo Narrow, Archivo, JetBrains Mono).

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host — point it at the repo root.

- **Vercel / Netlify:** no build command, publish directory `.`
- **GitHub Pages:** Settings → Pages → deploy from `main` / root
- **Cloudflare Pages:** framework preset "None", output directory `.`

## Information architecture

The home page is a lead-gen path: establish what the studio does, lead with the custom
commission as the USP, show the in-house casting roster, show where the work lands,
show the growth cycle, then convert.

| # | Section | Job |
|---|---------|-----|
| — | Hero | Position, plus a CTA straight into the production brief |
| 01 | What we do / who it's for | Context before any model is shown |
| 02 | The commission | **Custom** model avatars — the actual offer |
| 03 | Casting roster | The in-house six — available to partner with, and proof of what we build to brief |
| 04 | Where it goes | Social, paid, e-comm, catalogue, EDM, film, OOH, spokesperson |
| 05 | The method | The four phases, `#how` |
| 06 | The growth cycle | Stage pricing, `#cycle` |
| 07 | Contact | Sign-off — both briefs, plus the direct email |

Why / when / how moved to `studio.html`, reachable from the **Studio** dropdown and
from buttons on the home page. The nav stays four items wide: Custom Avatars,
Roster, Studio ▾, Start intake.

## Contact

There is no inline form on the site. Conversion is exclusively through the two
briefs — `/brief/production` and `/brief/casting` — linked from the hero, the
commission section, Where It Goes, the growth cycle, the nav on every page, both
mobile menus, and the `#contact` sign-off section itself. `#contact` is a landing
spot, not a form: a headline, both brief buttons, and the direct email.

An earlier version of the site carried a standalone intake form here — name, email,
and a set of optional qualifier chips, posted via FormSubmit. It has been removed.
The briefs collect richer, structured answers than that form ever did, so there is
no longer a reason to keep a second, shallower path alongside them.

## Design tokens

Set as CSS custom properties in `index.html`:

| Token | Value | Role |
|-------|-------|------|
| `--neon` | `#D8FE00` | Accent — 5–15% of surface |
| `--ink` | `#000000` | Primary dark, text, dark BG |
| `--bone` | `#EBEBEA` | Off-white canvas |
| `--sand` | `#7A7A78` | Secondary, captions |
| `--paper` | `#FFFFFF` | Pure white contrast |

Type roles: Archivo Black (display, tight −0.035em tracking) · Archivo Narrow 600 (chrome, 0.2em tracking, uppercase) · Archivo 400 (body) · JetBrains Mono (labels and kickers only).

Hard corners only. No drop shadows, no gradients. Transitions 300ms `ease-out`.

Body copy is `--sand` on desktop for the editorial feel, but lifts to `--bone` below
900px — grey at phone sizes was not legible enough. Keep that override in step when
adding new body-copy classes.

## Behavior

- **Hero** copy is left-aligned to the same gutter as the sections below, and parallaxes
  and fades on scroll (`translate3d` + scale, driven by `requestAnimationFrame`).
- **Hero background video** is set by `HERO_VIDEO` at the top of the script in
  `index.html`, currently the public blob `I AM AVA - FULL.mp4`. Always use a
  **public** blob URL — a signed `*.private.blob.vercel-storage.com` link carries an
  expiring delegation token, so the hero would break when it lapses and the token
  would be readable in page source. With no URL set, or under
  `prefers-reduced-motion`, the video element is removed and the grid backdrop stays;
  it also falls back to the grid if the file fails to load. The video fades in on
  `loadeddata`, and a left-weighted scrim keeps the copy legible over the footage.
  No poster frame is set yet — add one if the first paint shows a black flash.
- **Hero film.** With no interaction the video simply loops muted behind the copy. The
  **Watch with sound** control starts it with audio from 0:00 and puts the hero into
  *cinema mode* — `.hero.is-cinema` fades the copy and the bottom strip out and drops
  the scrim to 0.22 so the frame plays clean. Muting, pausing, pressing Escape or
  scrolling away all leave cinema mode and bring the copy back. The parallax loop owns
  `.hero-inner` opacity every frame, so it checks the `cinema` flag rather than being
  overridden by CSS.
- **Hero playback controls** sit bottom-right once the video is ready: sound, play/pause
  and fullscreen. An IntersectionObserver mutes and pauses the film when the hero leaves
  the viewport so audio never follows the visitor down the page, and resumes muted
  playback on return unless they paused it themselves. The controls are removed
  alongside the video if it fails to load or under `prefers-reduced-motion`.
  For iOS inline autoplay the element carries `muted`, `playsinline` and
  `preload="metadata"` in markup, and the script sets `muted`, adds
  `webkit-playsinline` and calls `load()` after assigning the late `src`. Crucially it
  calls `play()` immediately rather than waiting for `loadeddata` — iOS will not buffer
  a background video until play is requested, so gating the first play on a load event
  deadlocks. The load events only drive the reveal. If autoplay is refused outright
  (Low Power Mode, data saver) the script arms a one-shot document listener so the
  visitor's first tap anywhere starts the film. The controls are shown as soon as the
  source is assigned, not on reveal, so a play button always exists even when autoplay
  never happens.
- **Roster filmstrip** is a 700vh pinned section; vertical scroll drives horizontal `translate3d` on the track, with a neon progress bar and an `NN / 06` counter.
- **Line-item rows** (What / Who / Where / How) shift to neon on hover.
- `prefers-reduced-motion` disables the marquee, blink, and smooth scroll.

## Mobile navigation

Below 900px both pages swap the inline nav for a hamburger. The desktop nav is
untouched above that breakpoint.

- `index.html` — the six nav links are replaced by a full-screen menu listing all
  eight sections, numbered, plus contact details.
- `model.html` — the link row *and* the roster tab strip (which overflowed the
  viewport) move into the menu: the six models stacked with the current one in neon,
  then the studio links.

The toggle animates to an X, the menu locks body scroll while open, and closes on
link tap, model selection, Escape, or a resize back to desktop. Arrow-key page turns
are suppressed while the menu covers the page.

## Model profiles

`model.html` renders all six profiles from one file, keyed by the `m` query param
(`model.html?m=kia`). Nav tabs switch between models client-side (URL updates via
`history.replaceState`). Each profile has a sticky portrait hero, spec sheet with
tags and a Book CTA, an optional magazine spread, a pinned horizontal portfolio
filmstrip with category filters (Stills / Motion / Editorial / E-comm), and a
usage-rights section. Unknown slugs fall back to the first model. Portfolio frames
are labeled placeholders ("asset pending") until real portfolio assets land.


### Magazine spread

A model presents its editorial as a two-page magazine below the portrait hero by
adding a `magazine` key to its entry in `MODELS` (`model.html`):

```js
magazine: { label: 'My Avatar, My Story · Vol.01', pages: ['assets/kai-editorial/kai-01.jpg', ...] }
```

Four models use this:

| Model | Editorial | Pages |
|-------|-----------|-------|
| KIA | Avatar Editorial · No.01 | 8 |
| RAVEN | Raven Red · In Search of My Hero · Vol.01 | 7 |
| KAI | My Avatar, My Story · Vol.01 | 6 |
| GLOBALIST | The Introduction · Issue No.01 | 6 |

Each is exported from its source PDF to `assets/<slug>-editorial/` as progressive
JPEG (150dpi render, quality 84, max 1240px wide). KAI's and GLOBALIST's source PDFs
end on a credits/colophon page carrying a superseded contact address; those pages are
not exported, so each book closes on its final editorial spread.

The cover stands alone, then pages pair into spreads (02–03, 04–05 …),
with a real 3D page turn: a leaf rotates about the spine carrying the outgoing page on
its front and the incoming one on its back. Below 900px it collapses to one page at a
time. Prev/next arrows, a Cover jump, arrow keys and swipe all drive it, plus an
Expand button that takes the book fullscreen. Turning is disabled at both ends rather
than wrapping, and `prefers-reduced-motion` swaps the turn for a cut.

### Portfolio frames

The filmstrip shows nine frames per model. Delivered work leads the strip and the
labelled "asset pending" placeholders fill out the rest, so the frame count stays
constant as assets land one at a time. Give a model real work with a `works` array
on its entry in `MODELS`:

```js
works: [
  { title: 'Strength Training', kind: 'Still', cat: 'Stills',
    src: 'https://…/KIA%20STRENGHT%20TRAINING%203.png' },
  { title: 'Aqua Energy · Film', kind: 'Spec campaign · motion', cat: 'Motion',
    video: 'https://…/KIA%20AQUA%20ENERGY%201.mov' }
],
```

`cat` must be one of `Stills`, `Motion`, `Editorial`, `E-comm` to sort under the
filters. A frame carries either a `src` (image) or a `video` — a video frame loops
muted and inline and comes to colour on hover, exactly like a still. `src`/`video`
can be a repo path or a public blob URL. Omit `ar` and `ratio` and the frame takes
its shape and its printed ratio from the file once it loads — an image on `load`, a
video on `loadedmetadata` — then re-measures the pinned strip, so a delivered asset
never has to declare its own dimensions. Set them explicitly only to crop
deliberately.

Use an **`.mp4` (H.264)** for video frames wherever possible. A `.mov` container
plays in Safari but Chrome and Firefox often refuse it, so a `.mov` frame can come up
blank on desktop even though the markup is correct — the same cross-browser gap the
hero video avoids by using `.mp4`.

## Link previews

Crawlers do not run JavaScript, so `model.html?m=kia` cannot carry a per-model preview
— every model would share one card. Each model therefore has a thin static page at
`/<slug>.html` holding its own Open Graph and Twitter tags, which then sends the
visitor through to `model.html?m=<slug>`. Roster cards link to these, and switching
tabs on a profile rewrites the address bar to `<slug>.html`, so whatever a visitor
copies is always shareable.

Cards live in `assets/og/<slug>.jpg` at 1200×630, split so **no type ever sits over the
portrait**: a black panel on the left carries the badge, name in Archivo Black, role in
neon and the roster line, with the grayscale portrait full-bleed on the right. Names are
fitted to the panel after the webfont loads — measuring before it arrives sizes against
the fallback and overflows. To regenerate after a portrait changes, render the same layout at
1200×630 in a headless browser and screenshot as JPEG — the roster data can be read
straight out of `model.html` so the cards cannot drift from it. Note that Google Fonts
must be reachable, or the brand faces silently fall back.

## The growth cycle

Pricing lives in one place: the `#cycle` section on the home page.

| Stage | Fee |
|---|---|
| Month 01 · Start-Up Kit | $2,500 |
| Month 02 · Content Production Launch | $5,000 |
| Months 03–05 · Campaign | $10,000 |

Three constraints the section is built to hold, and which any edit must keep:
every stage is **optional**, there is **no five-month commitment**, and these
are **stage fees only** — content assets and deliverables are quoted
individually. That last one is why no stage carries a list of what's included:
a deliverable list would read as an all-inclusive bundle, which is not how the
studio sells.

For the same reason it is deliberately not a pricing table — no boxes, no
tiers, no comparison columns. Three typographic stages on hairlines, each
marked optional, with the qualifier directly beneath. Keep it that way.

## Briefs

Two conversational forms, one question per screen, each ending in a POST that Make
turns into a personalised PDF. They are the only part of the site with a server
component.

| Route | Form | Returns | Screens |
|---|---|---|---|
| `/brief/production` | `production` | Content Treatment, 2 pages | 14 (15 with the identity branch) |
| `/brief/casting` | `casting` | Casting Brief | 14 (13 when `q4_age` is skipped) |

**Production leads; casting follows.** The production brief is the primary intake —
it asks what needs making. The avatar work appears inside the treatment it returns
as an option near the end, never as the pitch. The casting brief is for someone who
already knows they want a face.

`/casting-brief` and `/casting-intake` still resolve, from before the `/brief/*`
family existed.

**Neither is linked from anywhere yet, by design.** Point the nav at them once the
Make scenarios are live and returning real PDFs — an empty inbox after someone fills
one of these out is worse than not shipping.

### Structure

```
assets/brief/engine.js   the flow engine — shared, form-agnostic
assets/brief/brief.css   the shared styles
production-brief.html    config only: copy, slugs, branching
casting-brief.html       config only: copy, slugs, branching
api/brief.js             the endpoint — one handler, one schema per form
api/casting-brief.js     compatibility route, defaults `form` to casting
```

Each page defines `window.BRIEF` and then loads the engine. Everything a visitor
reads lives in that config as data — `screens`, `endings`, `errors` — so a copy
rewrite never touches logic, and a fix to the engine lands on both briefs at once.

**The one rule that breaks things if missed:** every option carries a `label` and a
`slug`. Reword labels freely. Never rename a slug — it is what reaches Make, and
renaming one silently breaks routing and scoring on every record already stored.

### Branching

Each config owns exactly two functions, `skip` and `endVariant`.

Production:

| Condition | Effect |
|---|---|
| `needs` includes `branding` or `web` | inserts the identity question |
| `volume = monthly_heavy` | end variant `program` — outranks timing |
| `timing = weeks` | end variant `hot` |
| `timing = next_quarter` or `internal_case` | end variant `early` |
| otherwise | end variant `default` |

Casting:

| Condition | Effect |
|---|---|
| `useCase = unsure` | `q4_age` drops out of the path |
| `timing = weeks` | end variant `hot` |
| `timing = next_quarter` or `internal_case` | end variant `early` |
| otherwise | end variant `default` |

`team = agency` is deliberately **not** branched here. It changes nothing the
visitor sees, so Make derives the partnership flag from the raw slug. Keeping
derived state off the wire means the payload records what was answered, not what we
concluded.

### Flow behaviour

Single-select auto-advances after 180ms so the selection registers; multi-select
waits for its button. Options marked `exclusive` — "Nothing yet", "Not sure yet" —
clear the rest when picked, and are cleared by anything else. Letter keys A–H pick
options, Enter advances a text screen, `Shift+Enter` is a newline, Escape goes back.
The URL hash tracks position, and every change writes to `sessionStorage` under the
config's `draftKey`, so a refresh resumes where it left off — though never straight
onto the end screen, which would fire the completion event off a deep link.

Screens with seven or more options, or four or more fields, tighten their spacing
below 560px; without it they overflow a 375px viewport. Desktop is untouched. Above
700×640 the block centres between counter and base rather than falling to the
bottom, which is right on a phone but leaves a void on a monitor.

### Endpoint

`POST /api/brief` fires **twice** per session, both carrying one `submissionId`:
`partial` when the contact screen is submitted, `complete` on final submit. Make
upserts on that ID so the two become one record. Email sits before the last three
questions for exactly this reason — abandonment after that point still leaves a lead.

`form` tells the two apart and selects the answers schema; keys belonging to the
other form are rejected with a 400. The handler validates field by field, rate
limits to 5 requests per minute per IP in memory, drops anything filling the hidden
`company_website` honeypot with a 200, and retries the webhook once at 500ms before
giving up. A dead Make scenario still returns `{ ok: true }` — the visitor reaches
the end screen either way. A genuine transport failure on the `partial` is the one
case that surfaces, since the lead would otherwise be lost silently.

### Environment

| Variable | Where | Notes |
|---|---|---|
| `MAKE_WEBHOOK_URL` | Vercel env, **server only** | Not set yet. While unset, submissions go out through the interim fallback below rather than being dropped. Never name it in client code. |
| `calendarUrl` | each page's `window.BRIEF` | **Booking link TBA.** Points at the studio inbox meanwhile, so the CTA still does something. One line to swap. |
| `rosterUrl` | each page's `window.BRIEF` | Currently `/#roster`. |

The two URLs are page config rather than env vars because the site has no build step
to inject them, and both end up in an `href` anyway.

### Interim delivery, until Make exists

`MAKE_WEBHOOK_URL` is not configured yet. Without a fallback the endpoint would
validate a submission, log it and throw it away — the form would look like it
worked while every lead vanished. So while the variable is unset, `api/brief.js`
flattens the payload and emails it to `hello@avadesign.studio` through the same
FormSubmit address the site's own intake already uses.

This is a stopgap, not architecture. Setting `MAKE_WEBHOOK_URL` takes over
automatically and none of it runs. To remove the safety net, delete
`FALLBACK_ENDPOINT` and the `else` branch in `forward()`.

Note the log lines differ: a fallback send warns, a real webhook send is silent.
That is how you tell which path a submission took.

### Analytics

Four events per form, prefixed by `eventPrefix` — `pb_start`, `pb_partial`,
`pb_complete`, `pb_calendar_click`, and the `cb_` equivalents. Nothing else is
tracked, and they go nowhere unless Vercel Analytics is enabled on the project.

### The four phases

Approved language — Direction, Casting, Production, Delivery — stated identically
wherever it appears. Phase names never change; they carry through to proposals, the
rate card and the deck.

| Surface | Where |
|---|---|
| Casting brief | End screen, above the CTA, on all three variants (`phases` in the config) |
| Home page | `#how`, below Where It Goes |
| `studio.html` | `#how` |

Two rules the build enforces. **No days, no weeks inside the phases** — the single
permitted timing sentence is the `note`, which renders beside the CTA, never in the
list. And the phases must not reuse the territories grid: territories are *what* we
make, phases are *how*, so the phases run as a staggered stepped sequence with a
neon rule that grows per step, collapsing to a numbered stack below 900px.

This replaced two things: the casting brief's `card_timeline` screen (a Day 1 /
Day 6–7 sequence a client could read as a production schedule) and `studio.html`'s
five-step method, which sat under the same "How it gets made" heading the nav points
at, under different names. One method now, stated once.

The casting brief's end screen exceeds a phone viewport by roughly 190px as a result
— the phases sit above the CTA by design. It is the one screen exempt from the
no-scroll rule, and the only screen a visitor reaches after acting.

### Picture choice

Both briefs show the same six 3:4 grayscale tiles for direction, on the same
`aesthetic` slugs. They render as hatched placeholders until real stills land — add
an `img` path to each option and they take over automatically. One set of six serves
both forms.

## Not yet in the repo

- Real portfolio assets for each model (nine frames per profile).
- Six roster stills for the briefs' picture choice (3:4, grayscale). One set serves both.
- Analytics, sitemap.

## Contact

hello@avadesign.studio · Vancouver, B.C.
