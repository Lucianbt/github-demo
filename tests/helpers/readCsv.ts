/// <reference types="node" />
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

export type CSVRow = string[];

// Determine directory of this helper. In most runtimes __dirname exists; keep a
// fallback for environments where it's unavailable.
// Prefer __dirname (available in commonjs). If it's not defined (rare),
// fallback to a reasonable workspace-relative path.
const thisDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.resolve(process.cwd(), 'tests', 'helpers');

// Synchronous CSV reader for simple CSVs used by tests.
export function readCsvSync(filePath: string): CSVRow[] {
  // Try multiple strategies to find the file so tests work regardless of cwd.
  const tried: string[] = [];

  // 1) If absolute path provided, try it directly
  if (/^[A-Za-z]:\\|^\\\\|^\//.test(filePath) || filePath.startsWith('/')) {
    if (existsSync(filePath)) {
      tried.push(filePath);
      const text = readFileSync(filePath, 'utf8');
      return parseCsv(text);
    }
    tried.push(filePath);
  }

  // 2) Try resolving from current working directory (what most CLIs use)
  const fromCwd = path.resolve(process.cwd(), filePath);
  if (existsSync(fromCwd)) {
    tried.push(fromCwd);
    const text = readFileSync(fromCwd, 'utf8');
    return parseCsv(text);
  }
  tried.push(fromCwd);

  // 3) Try resolving relative to this helper file (tests/helpers)
  // If filePath starts with 'tests' remove that prefix to avoid duplication.
  const normalized = filePath.replace(/^[\\/]*tests[\\/]+/, '');
  const fromHelpers = path.resolve(thisDir, '..', normalized);
  if (existsSync(fromHelpers)) {
    tried.push(fromHelpers);
    const text = readFileSync(fromHelpers, 'utf8');
    return parseCsv(text);
  }
  tried.push(fromHelpers);

  // 4) Try placing file under tests/data relative to helper
  const fromHelpersData = path.resolve(thisDir, '..', 'data', normalized.replace(/^data[\\/]+/, ''));
  if (existsSync(fromHelpersData)) {
    tried.push(fromHelpersData);
    const text = readFileSync(fromHelpersData, 'utf8');
    return parseCsv(text);
  }
  tried.push(fromHelpersData);

  // If none matched, throw a helpful error listing attempted paths.
  throw new Error(`readCsvSync: file not found: '${filePath}'. Tried: ${tried.join(', ')}`);
}

function parseCsv(text: string): CSVRow[] {
  return text
    .split(/\r?\n/)
    // Keep original line whitespace; only filter empty/comment lines using trimmed check
    .filter((l: string) => l.trim().length > 0 && !l.trim().startsWith('#'))
    .map((line: string) => {
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
