const DEMO_URL = 'https://calendly.com/nick-godaylii/30min';

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
