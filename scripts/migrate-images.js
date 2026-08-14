// ONE-TIME migration: downloads featured images from the old godaylii.com WP export
// into assets/articles/ and rewrites the CSV to point at the new self-hosted URLs.
// Not run by the Vercel build — run manually, once, before the Airtable CSV import.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV, stringifyCSV } from './lib/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CSV_IN = path.resolve(REPO_ROOT, '../godaylii_articles.csv');
const CSV_OUT = path.resolve(REPO_ROOT, '../godaylii_articles_selfhosted.csv');
const IMG_DIR = path.join(REPO_ROOT, 'assets', 'articles');
const SITE_BASE = 'https://daylii.com';

const COLUMNS = ['id', 'date', 'modified', 'slug', 'url', 'title', 'excerpt',
  'content_html', 'content_text', 'word_count', 'author', 'categories', 'tags',
  'featured_image', 'meta_description'];

function extFromUrl(url) {
  const m = /\.([a-z0-9]{2,5})(?:\?|$)/i.exec(url);
  return m ? m[1].toLowerCase() : 'jpg';
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; article-image-migration/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const rows = parseCSV(fs.readFileSync(CSV_IN, 'utf8'));
  fs.mkdirSync(IMG_DIR, { recursive: true });

  let downloaded = 0, skipped = 0, failed = 0;
  for (const row of rows) {
    const url = row.featured_image?.trim();
    if (!url) { skipped++; continue; }

    const filename = `${row.slug}.${extFromUrl(url)}`;
    const dest = path.join(IMG_DIR, filename);
    try {
      if (!fs.existsSync(dest)) {
        await downloadImage(url, dest);
        console.log(`downloaded ${filename}`);
        await new Promise(r => setTimeout(r, 150)); // be polite to the old host
      }
      row.featured_image = `${SITE_BASE}/assets/articles/${filename}`;
      downloaded++;
    } catch (err) {
      console.error(`FAILED ${row.slug}: ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(CSV_OUT, stringifyCSV(rows, COLUMNS));
  console.log(`\n${downloaded} mapped, ${skipped} had no image, ${failed} failed`);
  console.log(`wrote ${CSV_OUT}`);
  if (failed > 0) process.exitCode = 1;
}

main();
