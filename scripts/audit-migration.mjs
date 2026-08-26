// Public, repeatable verification for the legacy-domain migration. It makes
// no writes: failures are intentionally actionable and suitable for CI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from './lib/csv.js';
import { SITE_URL } from './lib/site.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = process.argv.includes('--output')
  ? path.resolve(root, process.argv[process.argv.indexOf('--output') + 1])
  : null;
const expectedRedirects = Number(process.env.EXPECTED_REDIRECT_COUNT || 250);
const failures = [];

function canonicalFor(url) {
  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  return parsed.href;
}

async function request(url, { body = false } = {}) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
      headers: { 'user-agent': 'dayliiIQ-migration-audit/1.0' },
    });
    return { url, status: response.status, location: response.headers.get('location'), body: body ? await response.text() : '' };
  } catch (error) {
    return { url, error: error.message };
  }
}

async function mapLimit(items, limit, mapper) {
  const output = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await mapper(items[index]);
    }
  }));
  return output;
}

function verifyIndexablePage(result, expectedUrl, label) {
  if (result.error) return `${label}: request failed (${result.error})`;
  if (result.status !== 200) return `${label}: expected 200, received ${result.status}`;
  const canonical = result.body.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (canonical !== expectedUrl) return `${label}: canonical expected ${expectedUrl}, found ${canonical || 'missing'}`;
  if (/\bnoindex\b/i.test(result.body)) return `${label}: contains noindex`;
  return null;
}

const redirectRows = parseCSV(fs.readFileSync(path.join(root, 'redirects.csv'), 'utf8'));
if (redirectRows.length !== expectedRedirects) {
  failures.push(`redirect map has ${redirectRows.length} rows; expected ${expectedRedirects}. Reconcile the missing legacy articles before declaring the migration complete.`);
}
const sourceUrls = new Set();
const destinationUrls = new Set();
for (const row of redirectRows) {
  if (!row.old_url || !row.new_url) failures.push(`redirect row ${row.id || '(unknown)'} is missing an old_url or new_url`);
  if (sourceUrls.has(row.old_url)) failures.push(`duplicate old_url: ${row.old_url}`);
  if (destinationUrls.has(row.new_url)) failures.push(`duplicate new_url: ${row.new_url}`);
  sourceUrls.add(row.old_url);
  destinationUrls.add(row.new_url);
}

const robots = await request(`${SITE_URL}/robots.txt`, { body: true });
const expectedRobots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
if (robots.error || robots.status !== 200 || robots.body !== expectedRobots) failures.push('robots.txt is unavailable or does not match the required public crawl policy');

const sitemapResponse = await request(`${SITE_URL}/sitemap.xml`, { body: true });
const sitemapUrls = sitemapResponse.body ? [...sitemapResponse.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]) : [];
if (sitemapResponse.error || sitemapResponse.status !== 200 || !sitemapUrls.length) failures.push('sitemap.xml is unavailable or has no URLs');
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap.xml contains duplicate URLs');
for (const url of sitemapUrls) if (!url.startsWith(`${SITE_URL}/`)) failures.push(`sitemap has a non-iq URL: ${url}`);

const pages = await mapLimit(sitemapUrls, 12, async url => ({ url, result: await request(url, { body: true }) }));
for (const { url, result } of pages) {
  const issue = verifyIndexablePage(result, canonicalFor(url), url);
  if (issue) failures.push(issue);
}

const redirects = await mapLimit(redirectRows, 12, async row => {
  const legacy = await request(row.old_url);
  let issue = null;
  if (legacy.error) issue = `${row.old_url}: redirect request failed (${legacy.error})`;
  else if (legacy.status !== 301) issue = `${row.old_url}: expected 301, received ${legacy.status}`;
  else if (!legacy.location || canonicalFor(new URL(legacy.location, row.old_url).href) !== canonicalFor(row.new_url)) issue = `${row.old_url}: expected Location ${row.new_url}, found ${legacy.location || 'missing'}`;
  return { old_url: row.old_url, new_url: row.new_url, status: legacy.status || null, location: legacy.location || null, issue };
});
for (const item of redirects) if (item.issue) failures.push(item.issue);

const report = {
  checkedAt: new Date().toISOString(),
  expectedRedirects,
  redirectRows: redirectRows.length,
  sitemapUrls: sitemapUrls.length,
  failed: failures.length,
  failures,
  redirects,
};
if (reportPath) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
if (failures.length) {
  console.error(`Migration audit failed with ${failures.length} issue(s):\n${failures.map(value => `- ${value}`).join('\n')}`);
  process.exitCode = 1;
} else console.log(`Migration audit passed: ${redirectRows.length} redirects and ${sitemapUrls.length} public URLs are correct.`);
