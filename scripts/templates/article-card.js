import { escapeHtml, escapeAttr, formatDate } from '../lib/render.js';

export function renderCard(article, index = 0, hiddenByDefault = false) {
  const href = `/articles/${article.slug}/`;
  const img = article.featuredImage
    ? `<img src="${escapeAttr(article.featuredImage)}" alt="" loading="lazy" decoding="async">`
    : '';
  const tag = article.category
    ? `<span class="article-card__tag">${escapeHtml(article.category)}</span>`
    : '';
  const delay = (index % 3) * 0.08;
  const moreAttrs = hiddenByDefault ? ' data-more hidden' : '';

  return `<li class="article-card reveal" style="--ty:120px;--d:${delay}s"${moreAttrs}>
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
