// Matches the actual Airtable column names from the CSV import — not the
// Title Case names used in earlier docs/guidance before the base existed.
const FIELD_MAP = {
  slug: 'slug',
  title: 'title',
  seoTitle: 'seo_title',
  excerpt: 'excerpt',
  bodyHtml: 'content_html',
  publishedDate: 'date',
  modifiedDate: 'modified',
  wordCount: 'word_count',
  authorName: 'author',
  featuredImage: 'featured_image',
  thumbnailImage: 'thumbnail_image',
  metaDescription: 'meta_description',
  published: 'Published',
  category: 'categories',
};

export async function fetchPublishedArticles({ pat, baseId, table }) {
  if (!pat || !baseId || !table) {
    throw new Error('Missing AIRTABLE_PAT, AIRTABLE_BASE_ID, or AIRTABLE_TABLE_NAME env var');
  }

  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set('filterByFormula', `{${FIELD_MAP.published}} = 1`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${pat}` } });
    if (!res.ok) throw new Error(`Airtable API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  const articles = records.map(r => {
    const f = r.fields;
    return {
      slug: f[FIELD_MAP.slug],
      title: f[FIELD_MAP.title] || '',
      seoTitle: f[FIELD_MAP.seoTitle] || '',
      excerpt: f[FIELD_MAP.excerpt] || '',
      bodyHtml: f[FIELD_MAP.bodyHtml] || '',
      publishedDate: f[FIELD_MAP.publishedDate] || null,
      modifiedDate: f[FIELD_MAP.modifiedDate] || f[FIELD_MAP.publishedDate] || null,
      wordCount: Number(f[FIELD_MAP.wordCount]) || 0,
      authorName: f[FIELD_MAP.authorName] || 'daylii Team',
      // thumbnail_image (Airtable-hosted attachment, pulled from the real
      // live page's og:image) wins when present; featured_image is the
      // WP-export fallback for the handful of articles that had none.
      featuredImage: f[FIELD_MAP.thumbnailImage]?.[0]?.url || f[FIELD_MAP.featuredImage] || '',
      metaDescription: f[FIELD_MAP.metaDescription] || f[FIELD_MAP.excerpt] || '',
      category: String(f[FIELD_MAP.category] || '').split(',')[0].trim(),
    };
  });

  const missingSlug = articles.filter(a => !a.slug);
  if (missingSlug.length) throw new Error(`${missingSlug.length} published record(s) missing a Slug`);

  const seen = new Set();
  for (const a of articles) {
    if (seen.has(a.slug)) throw new Error(`Duplicate slug in Airtable: "${a.slug}"`);
    seen.add(a.slug);
  }

  articles.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  return articles;
}
