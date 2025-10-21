/**
 * Text utilities used by tests (placeholder expansion, trimming helpers, etc.)
 */
/**
 * Expand placeholders like ${A256} into repeated characters (A x 256).
 * Keeps behavior deterministic for long-string test cases stored in CSVs.
 */
export function expandPlaceholders(s: string): string {
  if (!s || typeof s !== 'string') return s;
  return s.replace(/\$\{A(\d+)\}/g, (_m, n) => 'A'.repeat(parseInt(n, 10)));
}

// future text helpers (e.g., truncate, pad) can be exported here
