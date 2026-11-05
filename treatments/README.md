# Per-lead treatments

Each approved lead gets one JSON file here, addressed by an unguessable token:

    /treatments/<token>.json   →   kalenhayman.com/treatment/#<token>

`treatment.html` fetches that file and renders it over the fixed brand
template (method, growth cycle, framing). No token, or a missing file, falls
back to the embedded sample so the page is never broken.

## Shape

```json
{
  "form": "production",                       // "production" | "casting"
  "brand": "Meridian Athletic",
  "preparedFor": "Dana Osei",
  "date": "20 August 2026",
  "headline": ["One content system for", "Meridian’s next season."],
  "standfirst": "One or two sentences of standfirst.",
  "direction": [                              // mirrored back from their answers
    { "k": "Audience", "v": "Women 25–34" },
    { "k": "Look", "v": "Editorial, clean" }
  ],
  "approach": [                               // 2–4 short paragraphs (Claude-written)
    "How we'd build it, point one.",
    "Point two."
  ],
  "deliverables": [                           // production: channels; casting: where the face works
    { "ch": "Hero film", "wh": "What it is." }
  ]
}
```

Values are already human-readable (slugs mapped to labels at assembly time),
so the page is a dumb renderer. Keep tokens random (a UUID) — the page is
`noindex` and nothing links to it, so the link is effectively private.
