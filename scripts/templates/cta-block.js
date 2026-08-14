const DEMO_URL = 'https://calendly.com/nick-godaylii/30min';

// Dark panel CTA — used on the /articles/ listing page.
export function renderCta() {
  return `<section class="wrap">
  <div class="articles-cta">
    <div class="articles-cta__copy">
      <img class="articles-cta__mark reveal" style="--ty:24px" src="/assets/favicon.svg" width="40" height="40" alt="" loading="lazy">
      <h2 class="reveal" style="--ty:48px;--d:.05s">Ready to stop guessing on eligibility?</h2>
      <p class="reveal" style="--ty:72px;--d:.1s">dayliiIQ keeps FSA and HSA eligibility clear and cited, so you always know what qualifies.</p>
    </div>
    <a class="articles-cta__btn reveal" style="--ty:96px;--d:.15s" href="${DEMO_URL}" target="_blank" rel="noopener"><span class="articles-cta__btn-chip"><svg class="ic"><use href="#i-arrow"/></svg></span>Book a demo</a>
  </div>
</section>`;
}

// The homepage's own CTA component (.cta/.cta-inner/.cta-actions, already
// styled in css/styles.css) — used on individual article pages instead of
// the dark panel above, for consistency with the rest of the site.
export function renderHomeCta() {
  return `<section class="cta"><div class="wrap">
  <div class="cta-inner reveal">
    <span class="eyebrow" style="justify-content:center;margin-bottom:20px;display:inline-flex;width:100%;"><span class="eyebrow-dot"></span>Get started</span>
    <h2>Ready to stop guessing on eligibility?</h2>
    <p>dayliiIQ keeps FSA and HSA eligibility clear and cited, so you always know what qualifies before you spend.</p>
    <div class="cta-actions">
      <a class="btn btn-pri" href="${DEMO_URL}" target="_blank" rel="noopener">Book a demo <svg class="ic"><use href="#i-arrow"/></svg></a>
      <div class="em">or email <a href="mailto:nick@godaylii.com">nick@godaylii.com</a></div>
    </div>
  </div>
</div></section>`;
}
