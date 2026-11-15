import fs from 'fs';

const html = fs.readFileSync('preview/index.html', 'utf8');
const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!match) {
  console.log('No script tag found!');
  process.exit(1);
}
const code = match[1];
const lines = code.split('\n');

console.log('Script total lines:', lines.length);

// 5280부터 5680까지 모달 영역 라인 출력
for (let i = 5280; i < 5680; i++) {
  if (lines[i]) {
    // console.log(`${i+1}: ${lines[i]}`);
  }
}

// 5300 ~ 5420: NAVER modal
let naverDivOpen = 0;
let naverDivClose = 0;
for (let i = 5290; i < 5420; i++) {
  const line = lines[i] || '';
  naverDivOpen += (line.match(/<div/g) || []).length;
  naverDivClose += (line.match(/<\/div>/g) || []).length;
}
console.log('Naver modal divs: open =', naverDivOpen, 'close =', naverDivClose);

// 5420 ~ 5530: KAKAO modal
let kakaoDivOpen = 0;
let kakaoDivClose = 0;
for (let i = 5420; i < 5535; i++) {
  const line = lines[i] || '';
  kakaoDivOpen += (line.match(/<div/g) || []).length;
  kakaoDivClose += (line.match(/<\/div>/g) || []).length;
}
console.log('Kakao modal divs: open =', kakaoDivOpen, 'close =', kakaoDivClose);

// 5535 ~ 5650: GOOGLE modal
let googleDivOpen = 0;
let googleDivClose = 0;
for (let i = 5535; i < 5650; i++) {
  const line = lines[i] || '';
  googleDivOpen += (line.match(/<div/g) || []).length;
  googleDivClose += (line.match(/<\/div>/g) || []).length;
}
console.log('Google modal divs: open =', googleDivOpen, 'close =', googleDivClose);

