// Generates the page-specific legacy redirect map from published Airtable
// records. This is a deliverable for the system controlling godaylii.com; the
// iq.godaylii.com repository cannot install redirects on the old host itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './lib/site.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'redirects.csv');

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function normalizeOldUrl(value) {
  const url = new URL(String(value || '').trim());
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  if (hostname !== 'godaylii.com') throw new Error(`Legacy URL is not on godaylii.com: ${value}`);
  if (url.search || url.hash) throw new Error(`Legacy URL must not contain a query or fragment: ${value}`);
  const pathname = url.pathname === '/' ? '/' : `${url.pathname.replace(/\/+$/, '')}/`;
  return `https://godaylii.com${pathname}`;
}

async function fetchPublishedRecords() {
  const { AIRTABLE_PAT: pat, AIRTABLE_BASE_ID: baseId, AIRTABLE_TABLE_NAME: table } = process.env;
  if (!pat || !baseId || !table) throw new Error('Missing AIRTABLE_PAT, AIRTABLE_BASE_ID, or AIRTABLE_TABLE_NAME');

  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set('filterByFormula', '{Published} = 1');
    url.searchParams.set('pageSize', '100');
    url.searchParams.append('fields[]', 'id');
    url.searchParams.append('fields[]', 'url');
    url.searchParams.append('fields[]', 'slug');
    url.searchParams.append('fields[]', 'title');
    if (offset) url.searchParams.set('offset', offset);

    const response = await fetch(url, { headers: { Authorization: `Bearer ${pat}` } });
    if (!response.ok) throw new Error(`Airtable API error ${response.status}: ${await response.text()}`);
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);
  return records;
}

const records = await fetchPublishedRecords();
const rows = records.map(record => {
  const fields = record.fields;
  if (!fields.url) throw new Error(`Published record ${fields.id || record.id} is missing url`);
  if (!fields.slug) throw new Error(`Published record ${fields.id || record.id} is missing slug`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug)) throw new Error(`Invalid slug: ${fields.slug}`);
  return {
    id: fields.id || record.id,
    title: fields.title || '',
    old_url: normalizeOldUrl(fields.url),
    new_url: `${SITE_URL}/articles/${fields.slug}/`,
  };
});

for (const key of ['old_url', 'new_url']) {
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row[key])) throw new Error(`Duplicate ${key}: ${row[key]}`);
    seen.add(row[key]);
  }
}

rows.sort((a, b) => a.old_url.localeCompare(b.old_url));
const columns = ['id', 'title', 'old_url', 'new_url'];
const csv = [columns.join(','), ...rows.map(row => columns.map(column => csvCell(row[column])).join(','))].join('\r\n') + '\r\n';
fs.writeFileSync(output, csv, 'utf8');
console.log(`Wrote ${rows.length} validated redirect row(s) to ${output}`);
