import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // 1. 프로필 초기값(홍길동 -> 실제 사용자 김충훈/전화번호) 변경
  content = content.replace(
    /const \[naverModalProfile, setNaverModalProfile\] = useState\(\{[\s\S]*?name:\s*'[^']*',[\s\S]*?email:\s*'[^']*',[\s\S]*?mobile:\s*'[^']*'[\s\S]*?\}\);/,
    `const [naverModalProfile, setNaverModalProfile] = useState({
    name: '김충훈',
    email: 'chunggiwa@naver.com',
    mobile: '010-8286-3457'
  });`
  );

  content = content.replace(
    /const \[kakaoModalProfile, setKakaoModalProfile\] = useState\(\{[\s\S]*?name:\s*'[^']*',[\s\S]*?email:\s*'[^']*',[\s\S]*?mobile:\s*'[^']*'[\s\S]*?\}\);/,
    `const [kakaoModalProfile, setKakaoModalProfile] = useState({
    name: '김충훈',
    email: 'chunggiwa@gmail.com',
    mobile: '010-8286-3457'
  });`
  );

  content = content.replace(
    /const \[googleModalProfile, setGoogleModalProfile\] = useState\(\{[\s\S]*?name:\s*'[^']*',[\s\S]*?email:\s*'[^']*',[\s\S]*?mobile:\s*'[^']*'[\s\S]*?\}\);/,
    `const [googleModalProfile, setGoogleModalProfile] = useState({
    name: '김충훈',
    email: 'chunggiwa@gmail.com',
    mobile: '010-8286-3457'
  });`
  );

  // 2. NAVER 모달 동의 클릭 시: isTelVerified(false) 및 정보 조립 & 안내 메시지 정리
  content = content.replace(
    /onClick={\(\) => {\s*setNaverAuthModalOpen\(false\);[\s\S]*?setTimeout\(\(\) => {[\s\S]*?}, 150\);\s*}}/,
    `onClick={() => {
                  setNaverAuthModalOpen(false);
                  setSocialProvider('NAVER');
                  setSocialUid('naver_' + Date.now());
                  setEmail(naverModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(naverModalProfile.name);
                  setUserTel(naverModalProfile.mobile);
                  setIsTelVerified(false);
                  setIsSmsSent(false);
                  setAuthCode('');
                  setSmsErrorMsg('');
                  setSmsSuccessMsg('');
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg(\`✓ 네이버 연동 계정(\${naverModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)\`);
                  setSuccessInfoMsg(\`✓ 네이버 계정 정보(성명: \${naverModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.\`);
                  setErrorMsg('');
                  setTimeout(() => {
                    const btnSms = document.getElementById('btn-send-sms-auth') || document.getElementById('field-user-tel');
                    if (btnSms) {
                      btnSms.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      btnSms.focus();
                    }
                  }, 150);
                }}`
  );

  // 3. KAKAO 모달 동의 클릭 시: isTelVerified(false) 및 정보 조립 & 안내 메시지 정리
  content = content.replace(
    /onClick={\(\) => {\s*setKakaoAuthModalOpen\(false\);[\s\S]*?setTimeout\(\(\) => {[\s\S]*?}, 150\);\s*}}/,
    `onClick={() => {
                  setKakaoAuthModalOpen(false);
                  setSocialProvider('KAKAO');
                  const kakaoUid = 'kakao_' + Date.now();
                  setSocialUid(kakaoUid);
                  setEmail(kakaoModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(kakaoModalProfile.name);
                  setUserTel(kakaoModalProfile.mobile);
                  setIsTelVerified(false);
                  setIsSmsSent(false);
                  setAuthCode('');
                  setSmsErrorMsg('');
                  setSmsSuccessMsg('');
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg(\`✓ 카카오 연동 계정(\${kakaoModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)\`);
                  setSuccessInfoMsg(\`✓ 카카오 계정 정보(성명: \${kakaoModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.\`);
                  setErrorMsg('');
                  setTimeout(() => {
                    const btnSms = document.getElementById('btn-send-sms-auth') || document.getElementById('field-user-tel');
                    if (btnSms) {
                      btnSms.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      btnSms.focus();
                    }
                  }, 150);
                }}`
  );

  // 4. GOOGLE 모달 동의 클릭 시: isTelVerified(false) 및 정보 조립 & 안내 메시지 정리
  content = content.replace(
    /onClick={\(\) => {\s*setGoogleAuthModalOpen\(false\);[\s\S]*?setTimeout\(\(\) => {[\s\S]*?}, 150\);\s*}}/,
    `onClick={() => {
                  setGoogleAuthModalOpen(false);
                  setSocialProvider('GOOGLE');
                  setSocialUid('google_' + Date.now());
                  setEmail(googleModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(googleModalProfile.name);
                  setUserTel(googleModalProfile.mobile);
                  setIsTelVerified(false);
                  setIsSmsSent(false);
                  setAuthCode('');
                  setSmsErrorMsg('');
                  setSmsSuccessMsg('');
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg(\`✓ Google 연동 계정(\${googleModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)\`);
                  setSuccessInfoMsg(\`✓ Google 계정 정보(성명: \${googleModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.\`);
                  setErrorMsg('');
                  setTimeout(() => {
                    const btnSms = document.getElementById('btn-send-sms-auth') || document.getElementById('field-user-tel');
                    if (btnSms) {
                      btnSms.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      btnSms.focus();
                    }
                  }, 150);
                }}`
  );

  // 5. 성명 라벨에 소셜 연동 고정 뱃지 표시 강화
  content = content.replace(
    /({\/\*\s*성명\s*\(성함\)\s*입력\s*\(TB_USER:\s*USER_NM\)\s*\*\/}\s*<div className="space-y-1\.5">\s*)<label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-nm">\s*성명\s*\(성함\)\s*<\/label>/,
    `$1<div className="flex justify-between items-center">
                <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-nm">
                  성명 (성함)
                </label>
                {socialProvider && (
                  <span className="text-[11px] text-slate-500 font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    SNS 연동 (수정 불가)
                  </span>
                )}
              </div>`
  );

  // 6. 휴대전화 입력창: 소셜 연동 시에도 미인증 상태면 disabled 되지 않도록
  content = content.replace(
    /disabled={isTelVerified && !socialProvider}/g,
    'disabled={isTelVerified}'
  );

  fs.writeFileSync(f, content, 'utf8');
  console.log('Successfully updated:', f);
}

// preview_client 동기화
const src = path.join(process.cwd(), 'preview', 'index.html');
const dest = path.join(process.cwd(), 'preview_client', 'index.html');
if (fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log('Successfully synchronized preview_client/index.html');
}

