import fs from 'fs';
import path from 'path';

const outDir = path.join(process.env.LOCALAPPDATA, 'Programs', 'Antigravity IDE', 'resources', 'app', 'out');
function searchString(dir, str) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchString(full, str);
    } else if (f.endsWith('.js')) {
      const c = fs.readFileSync(full, 'utf8');
      const idx = c.indexOf(str);
      if (idx !== -1) {
        console.log(`Found "${str}" in: ${f}`);
        console.log('Context:', c.substring(Math.max(0, idx - 80), Math.min(c.length, idx + 120)));
      }
    }
  }
}
searchString(outDir, 'No Connection');
