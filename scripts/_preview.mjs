// ponytail: preview script using mock data (no Airtable creds needed).
// Regenerate anytime with: node scripts/_preview.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderArticleListPage } from './templates/article-list.js';
import { renderArticleDetailPage } from './templates/article-detail.js';
import { sanitizeBody } from './lib/sanitize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const IMAGES = [
  '24-hsa-fsa-eligible-expenses.webp', 'ai-for-fsa-hsa.webp', 'amazon-hsa-eligible-products.webp',
  'are-air-purifiers-fsa-eligible.webp', 'are-blood-pressure-monitors-fsa-eligible.webp',
];
const CATS = ['FSA Basics', 'HSA Guides', 'Eligible Expenses', 'Daylii Dose'];

const TITLES = [
  'Are Diapers FSA Eligible? A Parent’s Complete Guide',
  '24 HSA/FSA Eligible Expenses You Didn’t Know About',
  'How AI Is Transforming FSA and HSA Management',
  'Are Air Purifiers FSA Eligible? What to Know Before You Buy',
  'Amazon HSA Eligible Products: A Shopping Guide',
  'Are Blood Pressure Monitors FSA Eligible?',
  'The Founder’s Guide to Health Benefit Hygiene',
  'A Simple Reimbursement Workflow for Small Teams',
  'Smart Expense Categories: A Clean Setup That Scales',
  'A Simple Accounts Receivable Workflow for Small Teams',
];

// 14 mock articles: enough to exercise the "Load more" button (shows after
// the first 10 — 1 featured + 9 regular) without needing real Airtable data.
const articles = Array.from({ length: 14 }, (_, i) => ({
  slug: i === 0 ? 'are-diapers-fsa-eligible' : `mock-article-${i}`,
  title: TITLES[i % TITLES.length] + (i >= TITLES.length ? ` (${i})` : ''),
  excerpt: 'Practical guidance on FSA, HSA, and consumer-directed health spending from the daylii team.',
  publishedDate: new Date(2026, 0, 27 - i).toISOString(),
  modifiedDate: new Date(2026, 0, 27 - i).toISOString(),
  wordCount: 900,
  authorName: 'daylii Team',
  featuredImage: `/assets/articles/${IMAGES[i % IMAGES.length]}`,
  metaDescription: 'Practical guidance on FSA, HSA, and consumer-directed health spending from the daylii team.',
  category: CATS[i % CATS.length],
}));

// listing page
const listHtml = renderArticleListPage(articles);
fs.mkdirSync(path.join(REPO_ROOT, 'articles'), { recursive: true });
fs.writeFileSync(path.join(REPO_ROOT, 'articles', 'index.html'), listHtml);
console.log('wrote articles/index.html');

// detail page for the first article, with a realistic body (headings, list, table)
const article = articles[0];
const bodyHtml = `
<p>Most parents spend over eighty dollars a month on standard baby diapers without any financial relief. While tax-free health accounts can help save money on medical care, basic baby supplies rarely qualify.</p>
<h2>What Counts as Medically Necessary</h2>
<p>The IRS draws a hard line between everyday baby products and items required to treat a diagnosed medical condition.</p>
<ul>
<li><p><strong>Standard diapers:</strong> Not eligible — considered a general personal-care expense.</p></li>
<li><p><strong>Diapers for incontinence:</strong> Eligible with a Letter of Medical Necessity.</p></li>
<li><p><strong>Diaper rash cream:</strong> Eligible over-the-counter without a prescription.</p></li>
<li><p><em>Why it matters:</em> Getting this wrong is the <strong>most common</strong> reason FSA claims get denied.</p></li>
</ul>
<h2>How to Check Before You Buy</h2>
<p>daylii checks every SKU against the current IRS guidance so you know before you swipe your card.</p>
`;
const sanitized = sanitizeBody(bodyHtml);
const detailHtml = renderArticleDetailPage(article, sanitized, articles);
const outDir = path.join(REPO_ROOT, 'articles', article.slug);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), detailHtml);
console.log('wrote articles/' + article.slug + '/index.html');
