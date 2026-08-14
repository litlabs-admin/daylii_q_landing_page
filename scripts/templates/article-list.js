import { renderLayout } from './layout.js';
import { renderCard } from './article-card.js';
import { renderCta } from './cta-block.js';

const SITE = 'https://daylii.com';
const CANONICAL = `${SITE}/articles/`;
const LIST_DESCRIPTION = 'Practical guidance on FSA, HSA, and consumer-directed health spending from the daylii team.';

// 1 featured (latest) + 9 regular shown by default; the rest are pre-rendered
// but hidden, revealed in one shot by the "Load more" button (no pagination,
// no second page — everything already lives in this one static file).
const DEFAULT_VISIBLE = 10;

export function renderArticleListPage(articles) {
  const cards = articles
    .map((article, i) => renderCard(article, i, i >= DEFAULT_VISIBLE))
    .join('\n');
  const hasMore = articles.length > DEFAULT_VISIBLE;

  const bodyHtml = `<div class="wrap articles">
  <header class="articles__intro">
    <span class="articles__badge reveal" style="--ty:24px"><span class="articles__badge-icon"><svg class="ic"><use href="#i-book"/></svg></span>Articles</span>
    <h1 class="reveal" style="--ty:48px;--d:.08s">Latest Insights</h1>
    <p class="intro reveal" style="--ty:72px;--d:.16s">${LIST_DESCRIPTION}</p>
  </header>
  <ul class="article-list" id="article-list">
${cards}
  </ul>
  ${hasMore ? `<div class="load-more"><button type="button" class="btn btn-ghost" id="load-more-btn" data-list="article-list">Load more <svg class="ic"><use href="#i-arrow"/></svg></button></div>` : ''}
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
