import { readFileSync } from 'fs';

export type CSVRow = string[];

// Synchronous CSV reader for simple CSVs used by tests.
// Supports quoted fields and escaped quotes by doubling "".
export function readCsvSync(filePath: string): CSVRow[] {
  const text = readFileSync(filePath, 'utf8');
  return text
    .split(/\r?\n/)
    // Keep original line whitespace; only filter empty/comment lines using trimmed check
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'))
    .map((line) => {
      const res: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          res.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      res.push(cur);
      // IMPORTANT: preserve field whitespace intentionally so tests can distinguish
      // between empty string and space-only values. Do not trim fields here.
      return res;
    });
}
