# kalenhayman.com

Personal site for **Kalen Hayman**: director, producer and designer. It started as a copy of avadesign.studio, then got its own K mark, first-person copy and a light skin.

There is no build step and there are no dependencies. Vercel deploys `main` as-is.

## Structure

```
index.html              Home: demo reel hero, selected projects, intake call to action
work.html               Every project, filterable (Branding, Deck, Image, Video, Casting)
services.html           What I do
about.html              Profile, skills, credits and education
contact.html            info@kalenhayman.com + intake
the-studio.html         The Studio: web series player, cast, stills
aurora.html             Aurora × Kyle Kuzma case study
the-virtual-affair.html Casting project (Danny & Laura)
brand-guide.html        Flip-book of a brand guide PDF
profile.html            Per-model page, served at /model?m=<slug>
<slug>.html             Shareable per-model URLs with their own link-preview tags
production-brief.html   The intake form, served at /start-intake
treatment.html          Proposal template, filled from /treatments/<token>.json
api/brief.js            Intake endpoint: validates, then forwards to the Make webhook
assets/site/            Shared chrome: site.css (tokens + light skin), site.js, work.js (projects)
assets/brief/           Intake engine and styles
vercel.json             Clean URLs, rewrites, redirects
.github/workflows/      Media helpers (thumbs, share cards, video encodes, probes)
```

## Skin

`assets/site/site.css` defines the tokens. The page surface is white (`--ink`) and the type is black (`--bone`). Films, players, the lightbox and image cards stay dark: they reset the tokens in the dark-island rule near the top of the file. Add a class there to make another block dark.

The fonts are Anton, Archivo and JetBrains Mono, loaded from Google Fonts. The accent is neon `#D8FE00`.

## Environment

- `MAKE_WEBHOOK_URL` (Vercel, server-only) is where intake submissions are forwarded. It uses the same webhook as avadesign.studio.

## Chat agent

`assets/site/site.js` can load an ElevenLabs chat agent. It is off until `AGENT_ID` is set.

## Local preview

```bash
npx serve .            # or: python3 -m http.server 8000
```
