export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function escapeAttr(s) {
  return escapeHtml(s).replace(/\n/g, ' ');
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function readTime(wordCount) {
  return Math.max(1, Math.ceil((wordCount || 0) / 200));
}

export function truncate(s, max) {
  const str = String(s ?? '');
  return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str;
}
