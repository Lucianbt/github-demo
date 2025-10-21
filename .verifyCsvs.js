const fs = require('fs');
function readCsvSync(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text
    .split(/\r?\n/)
    // Keep line whitespace; filter blank/comment lines using trimmed checks
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'))
    .map((line) => {
      const res = [];
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
      // Do not trim fields here; preserve whitespace exactly as in CSV
      return res;
    });
}

const files = [
  'tests/data/calendar.csv',
  'tests/data/confirmareparola.csv',
  'tests/data/educatie.csv',
  'tests/data/numeprenume.csv',
  'tests/data/profesie-telefon.csv',
];

for (const f of files) {
  try {
    const rows = readCsvSync(f);
  const short = rows.map((r) => r.map((s) => (s.length > 60 ? s.slice(0, 60) + '...' : s)));
    console.log('---', f, '---');
    console.log(JSON.stringify(short, null, 2));
  } catch (e) {
    console.error('ERROR reading', f, e.message);
  }
}
