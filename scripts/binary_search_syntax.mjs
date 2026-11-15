import fs from 'fs';
import vm from 'vm';

const html = fs.readFileSync('preview/index.html', 'utf8');
const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
const code = match[1];
const lines = code.split('\n');

console.log('Script total lines:', lines.length);

// 최근 git diff로 변경된 라인들을 하나씩 확인해보자!
// 3730 ~ 3890 (useEffect initialSocial)
// 4770 ~ 4840 (userNm, userTel)
// 5310 ~ 5645 (소셜 모달 3종)
console.log('Checking recent lines...');

for (let i = 3730; i < 3890; i++) {
  // console.log(`${i+1}: ${lines[i]}`);
}

