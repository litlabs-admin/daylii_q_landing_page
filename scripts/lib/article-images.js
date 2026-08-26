import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL } from './site.js';

const MIME_EXTENSIONS = new Map([
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

function extensionFromPathname(value) {
  const extension = path.extname(new URL(value).pathname).slice(1).toLowerCase();
  return /^(avif|gif|jpe?g|png|webp)$/.test(extension) ? extension.replace('jpeg', 'jpg') : '';
}

function localFallback(assetDir, slug) {
  const match = fs.readdirSync(assetDir, { withFileTypes: true })
    .find(entry => entry.isFile() && entry.name.replace(/\.[^.]+$/, '') === slug);
  return match ? path.join(assetDir, match.name) : null;
}

async function fetchImage(sourceUrl) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase() || '';
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('empty response');
      return { bytes, extension: MIME_EXTENSIONS.get(contentType) || extensionFromPathname(sourceUrl) || 'jpg' };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(lastError?.message || 'image download failed');
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index]);
    }
  }));
  return results;
}

// Download the current Airtable attachment while it is valid, hash its bytes,
// and publish it as a stable site asset. The hashed filename makes the existing
// one-year immutable cache safe when an editor replaces an image.
export async function materializeArticleImages({ articles, assetDir, preferRemote = false }) {
  const generatedDir = path.join(assetDir, 'generated');
  const resolvedAssetDir = path.resolve(assetDir);
  const resolvedGeneratedDir = path.resolve(generatedDir);
  if (!resolvedGeneratedDir.startsWith(`${resolvedAssetDir}${path.sep}`)) throw new Error('Refusing to clean an image directory outside assets/articles');
  fs.rmSync(resolvedGeneratedDir, { recursive: true, force: true });
  fs.mkdirSync(resolvedGeneratedDir, { recursive: true });

  const outcomes = await mapLimit(articles, 6, async article => {
    if (!article.featuredImage) return { article, featuredImage: '', source: 'none' };
    const fallback = localFallback(assetDir, article.slug);
    if (fallback && !preferRemote) {
      return { article, bytes: fs.readFileSync(fallback), extension: path.extname(fallback).slice(1), source: 'local-fallback' };
    }
    try {
      const { bytes, extension } = await fetchImage(article.featuredImage);
      return { article, bytes, extension, source: 'airtable' };
    } catch (downloadError) {
      if (!fallback) throw new Error(`${article.slug}: Airtable image failed (${downloadError.message}) and no local fallback exists`);
      return { article, bytes: fs.readFileSync(fallback), extension: path.extname(fallback).slice(1), source: 'local-fallback' };
    }
  });

  let airtableDownloads = 0;
  let localFallbackCount = 0;
  let withoutImage = 0;
  for (const outcome of outcomes) {
    if (!outcome.featuredImage && !outcome.bytes) {
      outcome.article.featuredImage = '';
      withoutImage++;
      continue;
    }
    const hash = crypto.createHash('sha256').update(outcome.bytes).digest('hex').slice(0, 16);
    const filename = `${outcome.article.slug}-${hash}.${outcome.extension}`;
    fs.writeFileSync(path.join(resolvedGeneratedDir, filename), outcome.bytes);
    outcome.article.featuredImage = `${SITE_URL}/assets/articles/generated/${filename}`;
    if (outcome.source === 'airtable') airtableDownloads++;
    else localFallbackCount++;
  }

  console.log(`materialized ${airtableDownloads + localFallbackCount} article image(s): ${airtableDownloads} Airtable download(s), ${localFallbackCount} local fallback(s), ${withoutImage} without image`);
}
