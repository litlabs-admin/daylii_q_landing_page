import { SITE_URL as SITE } from '../lib/site.js';

function url(loc, lastmod) {
  return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`;
}

export function renderSitemap(articles) {
  const urls = [url(`${SITE}/`), url(`${SITE}/articles/`), url(`${SITE}/articles/all/`)];

  for (const a of articles) {
    urls.push(url(`${SITE}/articles/${a.slug}/`, a.modifiedDate));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}
