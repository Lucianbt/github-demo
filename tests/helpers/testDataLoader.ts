import { readCsvSync, CSVRow } from './readCsv';

export type DataRow = { group: string; label: string; value: string };
export type TestData = { valid: Array<{ label: string; value: string }>; invalid: Array<{ label: string; value: string }> };

function normalizeRow(row: CSVRow): DataRow {
  // CSV rows are expected as: group,label,value OR group,value
  const group = row[0] || '';
  let label = '';
  let value = '';
  if (row.length === 1) {
    label = row[0];
    value = row[0];
  } else if (row.length === 2) {
    label = row[1];
    value = row[1];
  } else {
    label = row[1];
    value = row[2];
  }
  return { group: group.trim(), label: label.trim(), value: value };
}

function expandPlaceholders(s: string): string {
  return s.replace(/\$\{A(\d+)\}/g, (_, n) => 'A'.repeat(parseInt(n, 10)));
}

export function loadTestData(filePath: string, prefix?: string): TestData {
  const rows = readCsvSync(filePath).map(normalizeRow);
  const validGroup = prefix ? `${prefix}_valid` : 'valid';
  const invalidGroup = prefix ? `${prefix}_invalid` : 'invalid';
  const valid = rows
    .filter((r) => r.group === validGroup)
    .map((r) => ({ label: r.label || r.value, value: expandPlaceholders(r.value || r.label) }));
  const invalid = rows
    .filter((r) => r.group === invalidGroup)
    .map((r) => ({ label: r.label || r.value, value: expandPlaceholders(r.value || r.label) }));
  return { valid, invalid };
}
