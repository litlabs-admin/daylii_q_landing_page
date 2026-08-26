import { escapeHtml, escapeAttr } from '../lib/render.js';
import { SITE_URL } from '../lib/site.js';

const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/daylii_logo.png`;

// Nav/footer chrome ported once from index.html — mirror manually if that file's
// chrome markup changes, since index.html itself isn't run through this generator.
export function renderLayout({ title, description, canonical, ogImage, jsonLd = [], bodyHtml }) {
  const image = ogImage || DEFAULT_OG_IMAGE;
  const jsonLdTags = jsonLd
    .map(obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow">

<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:image" content="${escapeAttr(image)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="daylii">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
<meta name="twitter:image" content="${escapeAttr(image)}">

<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" href="/assets/daylii_logo.png">
<link rel="preload" href="/assets/fonts/manrope-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/articles.css">
${jsonLdTags}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" id="progress" aria-hidden="true"></div>

<svg width="0" height="0" class="sprite" aria-hidden="true" focusable="false"><defs>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M0 3C0 1.343 1.343 0 3 0L9.75 0 9.75 13.5 3 13.5C1.343 13.5 0 14.843 0 16.5" transform="translate(12 5.25)"/><path d="M0 13.5L6.75 13.5C8.407 13.5 9.75 14.843 9.75 16.5L9.75 3C9.75 1.343 8.407 0 6.75 0L0 0Z" transform="translate(2.25 5.25)"/></symbol>
</defs></svg>

<header class="nav" id="nav"><div class="wrap nav-in">
  <a class="nav-logo" href="/" aria-label="daylii home"><img src="/assets/daylii_logo.png" width="112" height="24" alt="daylii" decoding="async"></a>
  <nav class="nav-links" aria-label="Primary">
    <a href="/#value">Who it's for</a>
    <a href="/#how">How it works</a>
    <a class="btn btn-ghost" href="https://calendly.com/nick-godaylii/30min" target="_blank" rel="noopener">Book a demo <svg class="ic"><use href="#i-arrow"/></svg></a>
  </nav>
</div></header>

<main id="main">
${bodyHtml}
</main>

<footer class="ft"><div class="wrap">
  <div class="ft-in">
    <div class="ft-brand">
      <img src="/assets/daylii_logo.png" width="102" height="22" alt="daylii" loading="lazy" decoding="async">
      <p class="tag">The cited, always-current eligibility engine for consumer-directed spend.</p>
    </div>
    <div class="ft-links">
      <div class="ft-col"><h5>Product</h5><a href="/#how">How it works</a><a href="/#why">Why dayliiIQ</a><a href="/#proof">Proof</a></div>
      <div class="ft-col"><h5>Resources</h5><a href="/articles/">Articles</a></div>
      <div class="ft-col"><h5>Get started</h5><a href="/#demo">Book a demo</a><a href="mailto:nick@godaylii.com">Contact</a></div>
    </div>
  </div>
  <div class="ft-base">© <span id="yr"></span> daylii. dayliiIQ provides product-eligibility classification and is not legal or tax advice; final eligibility and reimbursement are governed by the applicable benefit plan and its administrator. Not affiliated with any retailer or manufacturer named or referenced.</div>
</div></footer>

<script src="/js/main.js" defer></script>
</body>
</html>
`;
}
