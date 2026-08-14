// ONE-TIME migration: visits each article's real live page on godaylii.com,
// pulls its actual og:image, and pushes it into the `thumbnail_image`
// attachment field on the matching Airtable record (join key: the `id` field).
//
// Run with:  node --env-file=.env scripts/fetch-thumbnails.js
// Test a few first:  node --env-file=.env scripts/fetch-thumbnails.js --limit=5

const PAT = process.env.AIRTABLE_PAT;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE_NAME;
const LIMIT = Number((process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity;

if (!PAT || !BASE_ID || !TABLE) {
  throw new Error('Missing AIRTABLE_PAT, AIRTABLE_BASE_ID, or AIRTABLE_TABLE_NAME (run with --env-file=.env)');
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchAllRecords() {
  const records = [];
  let offset;
  do {
    const url = new URL(AIRTABLE_URL);
    url.searchParams.set('pageSize', '100');
    url.searchParams.append('fields[]', 'id');
    url.searchParams.append('fields[]', 'url');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
    if (!res.ok) throw new Error(`Airtable list error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

function extractOgImage(html) {
  const m = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)
    || /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i.exec(html);
  return m ? m[1] : null;
}

async function fetchOgImage(pageUrl) {
  const res = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; daylii-thumb-fetch/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return extractOgImage(await res.text());
}

async function patchThumbnail(recordId, imageUrl) {
  const res = await fetch(`${AIRTABLE_URL}/${recordId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { thumbnail_image: [{ url: imageUrl }] } }),
  });
  if (!res.ok) throw new Error(`Airtable patch error ${res.status}: ${await res.text()}`);
}

async function main() {
  const records = (await fetchAllRecords()).slice(0, LIMIT);
  console.log(`processing ${records.length} record(s)${LIMIT < Infinity ? ' (--limit applied)' : ''}`);

  let ok = 0, noImage = 0, failed = 0;
  for (const record of records) {
    const pageUrl = record.fields.url;
    const articleId = record.fields.id;
    if (!pageUrl) { console.log(`skip id=${articleId}: no url field`); noImage++; continue; }
    try {
      const imageUrl = await fetchOgImage(pageUrl);
      if (!imageUrl) { console.log(`no og:image found for id=${articleId} (${pageUrl})`); noImage++; continue; }
      await patchThumbnail(record.id, imageUrl);
      console.log(`✓ id=${articleId} -> ${imageUrl}`);
      ok++;
    } catch (err) {
      console.error(`✗ id=${articleId} (${pageUrl}): ${err.message}`);
      failed++;
    }
    await sleep(250); // polite to godaylii.com, and under Airtable's 5 req/s cap
  }

  console.log(`\n${ok} updated, ${noImage} had no image, ${failed} failed (of ${records.length})`);
  if (failed > 0) process.exitCode = 1;
}

main();
