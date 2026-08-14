// ponytail: hand-rolled RFC4180 parser, avoids a csv-parse dependency for two small scripts
export function parseCSV(text) {
  const clean = text.replace(/^﻿/, '');
  const rows = [];
  let field = '', row = [], inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r') { /* skip, \n handles the break */ }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const header = rows.shift();
  return rows
    .filter(r => !(r.length === 1 && r[0] === ''))
    .map(r => Object.fromEntries(header.map((h, idx) => [h, r[idx] ?? ''])));
}

function csvEscape(v) {
  return '"' + String(v ?? '').replace(/"/g, '""') + '"';
}

export function stringifyCSV(rows, columns) {
  const lines = [columns.map(csvEscape).join(',')];
  for (const r of rows) lines.push(columns.map(c => csvEscape(r[c])).join(','));
  return '﻿' + lines.join('\r\n') + '\r\n';
}
