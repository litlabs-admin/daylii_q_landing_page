// Cleans up body HTML inherited from the old WordPress export:
//  - extracts the FAQPage JSON-LD that WP's FAQ plugin left invalidly nested in a <p>
//  - downgrades any stray in-body <h1> to <h2> (the page's real H1 is the article title)
//  - strips any other <script> tags and inline event handlers for hygiene
const FAQ_BLOCK = /<p[^>]*>\s*<script type="application\/ld\+json">([\s\S]*?)<\/script>\s*<\/p>/gi;

export function sanitizeBody(html) {
  let faq = null;
  let out = (html || '').replace(FAQ_BLOCK, (_match, json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed['@type'] === 'FAQPage' && Array.isArray(parsed.mainEntity)) faq = parsed;
    } catch { /* malformed embed, drop it silently */ }
    return '';
  });

  out = out
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');

  return { html: out.trim(), faq };
}
