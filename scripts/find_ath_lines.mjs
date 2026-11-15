import fs from 'fs';
const s = fs.readFileSync('preview/server.js', 'utf8');
const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("/api/web/client/ath_010100")) {
    console.log('line ' + (i+1));
  }
}
