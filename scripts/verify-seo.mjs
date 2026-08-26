// Build-time guardrail for the article migration. It validates the generated
// artifacts before they are deployed, so legacy canonicals and noindex tags
// cannot silently return in a later template change.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './lib/site.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articlesDir = path.join(root, 'articles');
const failures = [];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function expectedUrl(file) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'index.html') return `${SITE_URL}/`;
  const pagePath = relative.replace(/\/index\.html$/, '/');
  return `${SITE_URL}/${pagePath}`;
}

function checkPage(file) {
  const html = read(file);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  const expected = expectedUrl(file);
  if (canonical !== expected) failures.push(`${path.relative(root, file)} canonical: expected ${expected}, found ${canonical || 'missing'}`);
  if (/\bnoindex\b/i.test(html)) failures.push(`${path.relative(root, file)} contains noindex`);
  if (!/<meta name="robots" content="index,follow">/i.test(html)) failures.push(`${path.relative(root, file)} is missing index,follow robots meta`);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') checkPage(full);
  }
}

checkPage(path.join(root, 'index.html'));
walk(articlesDir);

const robots = read(path.join(root, 'robots.txt'));
if (robots !== `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`) failures.push('robots.txt does not match the required public crawl policy');

const sitemap = read(path.join(root, 'sitemap.xml'));
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!sitemapUrls.length) failures.push('sitemap.xml has no URLs');
for (const loc of sitemapUrls) {
  if (!loc.startsWith(`${SITE_URL}/`)) failures.push(`sitemap contains non-iq URL: ${loc}`);
}

if (failures.length) {
  console.error('SEO verification failed:\n' + failures.map(f => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log(`SEO verification passed for ${sitemapUrls.length} sitemap URL(s) and all generated public pages.`);
