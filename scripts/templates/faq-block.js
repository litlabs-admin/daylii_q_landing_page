// The old WP export already renders the FAQ visibly in the body as regular prose —
// the sanitizer only pulls the JSON-LD out of an invalidly-nested <script> tag.
// So this just validates/passes through the structured data; no second visible block.
export function extractFaqJsonLd(faq) {
  if (!faq || faq['@type'] !== 'FAQPage' || !Array.isArray(faq.mainEntity)) return null;
  const valid = faq.mainEntity.filter(q => q?.name && q?.acceptedAnswer?.text);
  return valid.length ? { ...faq, mainEntity: valid } : null;
}
