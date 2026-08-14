import { escapeHtml, escapeAttr, formatDate } from '../lib/render.js';

// The fields article-card__* markup actually needs — also what goes into
// manifest.json for client-side "Load more" rendering (see js/main.js,
// which builds the identical markup from these same fields in the browser).
export function toCardData(article) {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category || '',
    publishedDate: article.publishedDate,
    featuredImage: article.featuredImage || '',
  };
}

export function renderCard(article, index = 0) {
  const href = `/articles/${article.slug}/`;
  const img = article.featuredImage
    ? `<img src="${escapeAttr(article.featuredImage)}" alt="" loading="lazy" decoding="async">`
    : '';
  const tag = article.category
    ? `<span class="article-card__tag">${escapeHtml(article.category)}</span>`
    : '';
  const delay = (index % 3) * 0.08;

  return `<li class="article-card reveal" style="--ty:120px;--d:${delay}s">
  <a class="article-card__link" href="${href}">
    <div class="article-card__frame"><div class="article-card__thumb">${img}</div></div>
    <div class="article-card__body">
      <div class="article-card__meta">
        ${tag}
        <time datetime="${article.publishedDate}">${formatDate(article.publishedDate)}</time>
      </div>
      <h2 class="article-card__title">${escapeHtml(article.title)}</h2>
      <div class="article-card__footer">
        <span class="article-card__read">Read article</span>
        <span class="article-card__arrow"><svg class="ic"><use href="#i-arrow"/></svg></span>
      </div>
    </div>
  </a>
</li>`;
}
