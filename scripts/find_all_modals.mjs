import fs from 'fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const lines = html.split(/\r?\n/);

let naverStart = lines.findIndex(l => l.includes('naverAuthModalOpen && (')) + 1;
let kakaoStart = lines.findIndex(l => l.includes('kakaoAuthModalOpen && (')) + 1;

let depth = 0;
for (let i = naverStart - 1; i < kakaoStart - 1; i++) {
  const line = lines[i];
  const o = (line.match(/<div/g) || []).length;
  const c = (line.match(/<\/div>/g) || []).length;
  depth += (o - c);
  console.log(`${i+1}: [${o}-${c} => ${depth}] ${line.substring(0, 80)}`);
}
