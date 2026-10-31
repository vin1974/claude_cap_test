// fullName is never stored: it is derived from firstName/lastName on read.
const enrich = d => {
  if (d) d.fullName = `${(d.firstName || '').trim()} ${(d.lastName || '').trim()}`.trim();
};

// Make sure firstName/lastName are fetched when fullName is selected in `columns`
const ensureNameColumns = (columns) => {
  if (!columns) return;
  const refs = columns.map(c => c.ref && c.ref[0]);
  if (!refs.includes('fullName')) return;
  for (const f of ['firstName', 'lastName']) if (!refs.includes(f)) columns.push({ ref: [f] });
};

const each = (data, fn) => Array.isArray(data) ? data.forEach(fn) : fn(data);

module.exports = { enrich, ensureNameColumns, each };
