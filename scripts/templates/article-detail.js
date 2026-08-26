import { renderLayout } from './layout.js';
import { renderCard } from './article-card.js';
import { renderHomeCta } from './cta-block.js';
import { extractFaqJsonLd } from './faq-block.js';
import { escapeHtml, escapeAttr, formatDate, truncate } from '../lib/render.js';
import { SITE_URL } from '../lib/site.js';

const SITE = SITE_URL;
const RELATED_COUNT = 3;

export function renderArticleDetailPage(article, sanitized, allArticles) {
  const canonical = `${SITE}/articles/${article.slug}/`;
  const title = article.seoTitle || `${article.title} | daylii`;
  const description = truncate(article.metaDescription, 300);

  // FAQ content already renders visibly in sanitized.html (authored prose) —
  // this only recovers the JSON-LD for structured data, no duplicate section.
  const faqJsonLd = extractFaqJsonLd(sanitized.faq);

  const related = allArticles
    .filter(a => a.slug !== article.slug)
    .slice(0, RELATED_COUNT);
  const seeAlsoHtml = related.length
    ? `<section class="wrap">
      <div class="see-also">
        <div class="see-also__head">
          <h2>See also</h2>
          <a class="article__back-btn article__back-btn--dark" href="/articles/">Back to articles <svg class="ic ic-flip"><use href="#i-arrow"/></svg></a>
        </div>
        <ul class="article-list see-also__list">
          ${related.map((a, i) => renderCard(a, i)).join('\n')}
        </ul>
      </div>
    </section>`
    : '';

  const currentIndex = allArticles.findIndex(a => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
  const navLink = (a, dir) => a ? `<a class="article__navlink article__navlink--${dir}" href="/articles/${a.slug}/">
      ${dir === 'prev' ? `<span class="article__navcircle"><svg class="ic ic-flip"><use href="#i-arrow"/></svg></span>` : ''}
      <span>${escapeHtml(a.title)}</span>
      ${dir === 'next' ? `<span class="article__navcircle"><svg class="ic"><use href="#i-arrow"/></svg></span>` : ''}
    </a>` : '';
  const postscriptHtml = `<div class="article__postscript">
    <span class="article__date-pill"><time datetime="${article.publishedDate}">${formatDate(article.publishedDate)}</time></span>
    ${prevArticle || nextArticle ? `<div class="article__quicklinks">
      ${navLink(prevArticle, 'prev')}
      <span class="article__quicklinks-divider"></span>
      ${navLink(nextArticle, 'next')}
    </div>` : ''}
  </div>`;

  const imageHtml = article.featuredImage
    ? `<div class="wrap"><div class="article__frame"><img class="article__image" src="${escapeAttr(article.featuredImage)}" alt="" loading="eager" decoding="async"></div></div>`
    : '';

  const bodyHtml = `<article class="article">
  <header class="wrap article__header">
    <a class="article__back-btn" href="/articles/">Back to articles <svg class="ic ic-flip"><use href="#i-arrow"/></svg></a>
    <h1 class="article__title">${escapeHtml(article.title)}</h1>
    ${article.category ? `<span class="article__tag">${escapeHtml(article.category)}</span>` : ''}
  </header>
  ${imageHtml}
  <div class="wrap article__content">
    <div class="article-body">
${sanitized.html}
    </div>
    ${postscriptHtml}
  </div>
</article>
${seeAlsoHtml}
${renderHomeCta()}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      image: article.featuredImage || undefined,
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate,
      author: { '@type': 'Organization', name: 'daylii' },
      publisher: {
        '@type': 'Organization',
        name: 'daylii',
        logo: { '@type': 'ImageObject', url: `${SITE}/assets/daylii_logo.png` },
      },
      mainEntityOfPage: canonical,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE}/articles/` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
      ],
    },
  ];
  if (faqJsonLd) jsonLd.push({ '@context': 'https://schema.org', ...faqJsonLd });

  return renderLayout({ title, description, canonical, ogImage: article.featuredImage, jsonLd, bodyHtml });
}
