// Read-only comparison of the live WordPress source against published Airtable
// records. This detects new, removed, or changed source posts before a redirect
// or publishing gap becomes an SEO issue. It intentionally never writes Airtable.
import { fetchPublishedArticles } from './lib/airtable.js';

const sourceOrigin = process.env.LEGACY_SOURCE_ORIGIN || 'https://godaylii.com';

async function fetchSourcePosts() {
  const all = [];
  for (let page = 1; ; page++) {
    const url = new URL('/wp-json/wp/v2/posts', sourceOrigin);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('_fields', 'id,slug,link,date,modified,status');
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (response.status === 400 && page > 1) break;
    if (!response.ok) throw new Error(`Legacy WordPress API returned ${response.status} for page ${page}`);
    const posts = await response.json();
    all.push(...posts.filter(post => post.status === 'publish'));
    const totalPages = Number(response.headers.get('x-wp-totalpages') || page);
    if (page >= totalPages) break;
  }
  return all;
}

const airtable = await fetchPublishedArticles({
  pat: process.env.AIRTABLE_PAT,
  baseId: process.env.AIRTABLE_BASE_ID,
  table: process.env.AIRTABLE_TABLE_NAME,
});
const source = await fetchSourcePosts();
const publishedSlugs = new Set(airtable.map(article => article.slug));
const sourceSlugs = new Set(source.map(post => post.slug));
const missingInAirtable = source.filter(post => !publishedSlugs.has(post.slug));
const orphanedInAirtable = airtable.filter(article => !sourceSlugs.has(article.slug));
const report = { sourcePosts: source.length, airtablePublished: airtable.length, missingInAirtable, orphanedInAirtable };
console.log(JSON.stringify(report, null, 2));
if (missingInAirtable.length || orphanedInAirtable.length) process.exitCode = 1;
