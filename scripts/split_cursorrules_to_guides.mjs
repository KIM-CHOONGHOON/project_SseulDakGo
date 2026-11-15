import fs from 'fs';
import path from 'path';

const cursorrulesPath = path.join(process.cwd(), '.cursorrules');
const content = fs.readFileSync(cursorrulesPath, 'utf8');
const lines = content.split('\n');

const guideDir = path.join(process.cwd(), 'guide');
if (!fs.existsSync(guideDir)) {
  fs.mkdirSync(guideDir, { recursive: true });
}

// Helper to extract lines (1-indexed inclusive)
function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

// 1. Guide 01: 기본거버넌스 및 채번규칙 (라인 7 ~ 395)
let sec1_2 = getSlice(7, 395);
// Mask sensitive DB password in guide 01 for security
sec1_2 = sec1_2.replace(/Ch72337528/g, '******** (보안: .cursorrules 또는 .env.local 참조)');
const guide01 = `# [쓸고닦고] 01. 플랫폼 기본 거버넌스 및 채번 규칙 가이드

---

${sec1_2}
`;
fs.writeFileSync(path.join(guideDir, '01_기본거버넌스_및_채번규칙.md'), guide01, 'utf8');
console.log('Created guide/01_기본거버넌스_및_채번규칙.md');

// 2. Guide 02: 업무통제 및 제휴정산 (라인 396 ~ 438)
const sec3_4 = getSlice(396, 438);
const guide02 = `# [쓸고닦고] 02. 청소 발주·업무 통제 및 타사 제휴사 정산 거버넌스

---

${sec3_4}
`;
fs.writeFileSync(path.join(guideDir, '02_업무통제_및_제휴정산.md'), guide02, 'utf8');
console.log('Created guide/02_업무통제_및_제휴정산.md');

// 3. Guide 03: 데이터베이스 DDL (라인 439 ~ 1120)
const sec5 = getSlice(439, 1120);
const guide03 = `# [쓸고닦고] 03. 전체 데이터베이스 DDL 스크립트 및 스키마 명세서

---

${sec5}
`;
fs.writeFileSync(path.join(guideDir, '03_데이터베이스_DDL.md'), guide03, 'utf8');
console.log('Created guide/03_데이터베이스_DDL.md');

// 4. Guide 04: 로그인유지 세션 알림정책
const existingLoginPath = path.join(guideDir, '쓸고딱고 로그인 유지.md');
let guide04Content = '';
if (fs.existsSync(existingLoginPath)) {
  guide04Content = fs.readFileSync(existingLoginPath, 'utf8');
}
const guide04 = `# [쓸고닦고] 04. 로그인 유지(자동로그인) · 세션 제어 & 알림 환경설정 시스템

---

${guide04Content}
`;
fs.writeFileSync(path.join(guideDir, '04_로그인유지_세션_알림정책.md'), guide04, 'utf8');
console.log('Created guide/04_로그인유지_세션_알림정책.md');

// 5. Guide 05: WEB 화면목록 및 기능명세 (라인 1121 ~ 1303)
const sec6 = getSlice(1121, 1303);
const guide05 = `# [쓸고닦고] 05. WEB 화면 목록 및 기능 상세 명세서 (개정 접두사: WEB- / 6자리 ID)

---

${sec6}
`;
fs.writeFileSync(path.join(guideDir, '05_WEB_화면목록_및_기능명세.md'), guide05, 'utf8');
console.log('Created guide/05_WEB_화면목록_및_기능명세.md');

// 6. Guide 06: APP 화면목록 및 기능명세 (라인 1304 ~ 1500)
const sec7 = getSlice(1304, 1500);
const guide06 = `# [쓸고닦고] 06. APP 화면 목록 및 기능 상세 명세서 (개정 접두사: APP- / 6자리 ID)

---

${sec7}
`;
fs.writeFileSync(path.join(guideDir, '06_APP_화면목록_및_기능명세.md'), guide06, 'utf8');
console.log('Created guide/06_APP_화면목록_및_기능명세.md');

// 7. Guide 07: E2E 업무 워크플로우 (라인 1501 ~ 1617)
const sec8 = getSlice(1501, 1617);
const guide07 = `# [쓸고닦고] 07. 전체 엔드투엔드(End-to-End) 워크플로우 명세서

---

${sec8}
`;
fs.writeFileSync(path.join(guideDir, '07_E2E_업무_워크플로우.md'), guide07, 'utf8');
console.log('Created guide/07_E2E_업무_워크플로우.md');

// 8. Guide 08: 프로그램 분석명세서 작성표준 (라인 1618 ~ 끝)
const sec9 = getSlice(1618, lines.length);
const guide08 = `# [쓸고닦고] 08. FrontEnd, BackEnd 분석 결과 명세서 작성 표준 가이드

---

${sec9}
`;
fs.writeFileSync(path.join(guideDir, '08_프로그램_분석명세서_작성표준.md'), guide08, 'utf8');
console.log('Created guide/08_프로그램_분석명세서_작성표준.md');

console.log('All 8 guide files created successfully!');
