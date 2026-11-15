import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx'),
  path.join(process.cwd(), 'preview_client', 'index.html')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    /if \(initialSocial\.mobile \|\| initialSocial\.userTel\) {[\s\S]*?setIsTelVerified\(true\);[\s\S]*?setIsSmsSent\(false\);[\s\S]*?}/g,
    `if (initialSocial.mobile || initialSocial.userTel) {
        const ph = initialSocial.mobile || initialSocial.userTel;
        setUserTel(ph);
        setIsTelVerified(false);
        setIsSmsSent(false);
      }`
  );
  content = content.replace(
    /✓ \$\{p\} 본인인증 정보\(\$\{initialSocial\.name \|\| ''\} \/ \$\{initialSocial\.email \|\| ''\}\)가 자동 반영되었습니다\. 약관 동의 및 전자서명 후 가입을 완료해 주세요\./g,
    "✓ ${p} 연동 정보(${initialSocial.name || ''} / ${initialSocial.email || ''})가 자동 조립되었습니다. 휴대전화 본인인증을 완료해 주세요."
  );
  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed:', f);
}

