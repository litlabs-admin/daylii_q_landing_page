const DEMO_URL = 'https://calendly.com/nick-godaylii/30min';

// The homepage's own CTA component (.cta/.cta-inner/.cta-actions, same
// markup and copy as the #demo section in index.html) — used on individual
// article pages instead of the dark panel above, for consistency with the
// rest of the site.
export function renderHomeCta() {
  return `<section class="cta"><div class="wrap">
  <div class="cta-inner reveal">
    <span class="eyebrow" style="justify-content:center;margin-bottom:20px;display:inline-flex;width:100%;"><span class="eyebrow-dot"></span>Get started</span>
    <h2>See dayliiIQ run on your own catalog.</h2>
    <p>Send us a sample and we'll return cited determinations — eligible, ineligible, LMN — for every SKU across the programs you care about, so you can see exactly what's recoverable and what's at risk.</p>
    <div class="cta-actions">
      <a class="btn btn-pri" href="${DEMO_URL}" target="_blank" rel="noopener">Book a demo <svg class="ic"><use href="#i-arrow"/></svg></a>
      <div class="em">or email <a href="mailto:nick@godaylii.com">nick@godaylii.com</a></div>
    </div>
  </div>
</div></section>`;
}
