# dayliiIQ — Landing Page

The cited, always-current eligibility engine for FSA/HSA and Medicare OTC commerce.
A single-page, dual-audience marketing site (Retailer ⇄ Manufacturer toggle).

Built as a plain static site — no build step, no framework — so it deploys anywhere.

## Structure

```
.
├── index.html              # the page
├── css/styles.css          # all styles + @font-face (self-hosted fonts)
├── js/main.js              # audience toggle + footer year
├── assets/
│   ├── daylii_logo.png     # gradient logo (used in nav + footer)
│   ├── favicon.svg         # brand "IQ" mark
│   └── fonts/*.woff2       # Geist, Geist Mono, Source Serif 4, Instrument Serif
├── robots.txt
├── vercel.json             # cleanUrls + long-cache headers for assets
└── design-source/          # original client handoff (HTML source of truth + Framer spec)
```

## Run locally

No build needed. Serve the folder over HTTP (fonts won't load from `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to Vercel

This repo is a static site at the root — Vercel needs no framework preset and no
Root Directory change.

**Option A — Dashboard:** Import the repo, framework preset **Other**, leave the
build command empty and the output directory as the root. Deploy.

**Option B — CLI:**
```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

## Before launch — replace these placeholders

1. **Book a demo** link → real booking URL (currently `https://cal.com/daylii/demo`).
2. **Email** → real inbox (currently `hello@daylii.com`).
3. **Canonical / OG / robots URLs** → set to the real production domain (currently `daylii.com`).
4. **Proof stats** are real anonymized pilot numbers — confirm you're comfortable publishing them.
5. No lead-capture form is included (button + email only). Add a form wired to your CRM if you want capture.
