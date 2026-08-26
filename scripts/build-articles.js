// Vercel build command entry point: fetches published articles from Airtable
// and regenerates the static /articles section + sitemap.xml from scratch.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPublishedArticles } from './lib/airtable.js';
import { sanitizeBody } from './lib/sanitize.js';
import { renderArticleListPage, renderArticleListAllPage, renderManifest } from './templates/article-list.js';
import { renderArticleDetailPage } from './templates/article-detail.js';
import { renderSitemap } from './templates/sitemap.js';
import { SITE_URL } from './lib/site.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(REPO_ROOT, 'articles');

function write(relPath, content) {
  const dest = path.join(REPO_ROOT, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

async function main() {
  const articles = await fetchPublishedArticles({
    pat: process.env.AIRTABLE_PAT,
    baseId: process.env.AIRTABLE_BASE_ID,
    table: process.env.AIRTABLE_TABLE_NAME,
  });
  console.log(`fetched ${articles.length} published article(s) from Airtable`);

  fs.rmSync(ARTICLES_DIR, { recursive: true, force: true });

  write('articles/index.html', renderArticleListPage(articles));
  write('articles/manifest.json', renderManifest(articles));
  write('articles/all/index.html', renderArticleListAllPage(articles));

  for (const article of articles) {
    const sanitized = sanitizeBody(article.bodyHtml);
    const html = renderArticleDetailPage(article, sanitized, articles);
    write(`articles/${article.slug}/index.html`, html);
  }

  write('sitemap.xml', renderSitemap(articles));
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(`wrote 1 list page, 1 manifest, 1 full-list page, ${articles.length} article page(s), sitemap.xml`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
