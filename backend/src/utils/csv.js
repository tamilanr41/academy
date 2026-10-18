/**
 * Minimal RFC-4180 style CSV serialization for admin exports.
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCell(typeof c.value === 'function' ? c.value(row) : row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

function sendCSV(res, filename, csv) {
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  return res.send(`﻿${csv}`);
}

module.exports = { toCSV, sendCSV };
