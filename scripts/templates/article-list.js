import { renderLayout } from './layout.js';
import { renderCard, toCardData } from './article-card.js';
import { renderCta } from './cta-block.js';

const SITE = 'https://daylii.com';
const CANONICAL = `${SITE}/articles/`;
const LIST_DESCRIPTION = 'Practical guidance on FSA, HSA, and consumer-directed health spending from the daylii team.';

// 1 featured (latest) + 9 regular server-rendered; everything past that
// lives only in manifest.json and is fetched + rendered client-side as
// "Load more" is clicked (js/main.js) — keeps the initial HTML small
// regardless of how many articles exist.
const DEFAULT_VISIBLE = 10;

function introHtml() {
  return `<header class="articles__intro">
    <span class="articles__badge reveal" style="--ty:24px"><span class="articles__badge-icon"><svg class="ic"><use href="#i-book"/></svg></span>Articles</span>
    <h1 class="reveal" style="--ty:48px;--d:.08s">Latest Insights</h1>
    <p class="intro reveal" style="--ty:72px;--d:.16s">${LIST_DESCRIPTION}</p>
  </header>`;
}

export function renderArticleListPage(articles) {
  const visible = articles.slice(0, DEFAULT_VISIBLE);
  const cards = visible.map((article, i) => renderCard(article, i)).join('\n');
  const hasMore = articles.length > DEFAULT_VISIBLE;

  const loadMoreHtml = hasMore
    ? `<div class="load-more">
      <button type="button" class="btn btn-ghost" id="load-more-btn" data-list="article-list" data-manifest="/articles/manifest.json" data-shown="${DEFAULT_VISIBLE}" data-batch="3">Load more <svg class="ic"><use href="#i-arrow"/></svg></button>
      <p class="sr-only" id="load-more-status" role="status" aria-live="polite"></p>
    </div>
    <noscript><p class="load-more__noscript"><a href="/articles/all/">View all articles</a></p></noscript>`
    : '';

  const bodyHtml = `<div class="wrap articles">
  ${introHtml()}
  <ul class="article-list" id="article-list">
${cards}
  </ul>
  ${loadMoreHtml}
</div>
${renderCta()}`;

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: CANONICAL },
    ],
  }];

  return renderLayout({ title: 'Articles | daylii', description: LIST_DESCRIPTION, canonical: CANONICAL, jsonLd, bodyHtml });
}

// Lean JSON manifest — just what article-card__* markup needs, built client-
// side by the matching renderer in js/main.js on each "Load more" click.
export function renderManifest(articles) {
  return JSON.stringify(articles.map(toCardData));
}

// Full, plain, no-JS-required listing (every article, fully server-rendered,
// no load-more) — the <noscript> fallback destination and a real crawlable
// "see everything" page in its own right.
export function renderArticleListAllPage(articles) {
  const title = 'All Articles | daylii';
  const cards = articles.map((article, i) => renderCard(article, i)).join('\n');

  const bodyHtml = `<div class="wrap articles">
  ${introHtml()}
  <ul class="article-list">
${cards}
  </ul>
</div>
${renderCta()}`;

  // Canonicalizes to /articles/ (not itself) — this page exists as the
  // no-JS "Load more" fallback, not a second piece of content to rank.
  return renderLayout({ title, description: LIST_DESCRIPTION, canonical: CANONICAL, bodyHtml });
}
