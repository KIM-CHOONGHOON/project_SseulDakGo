import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // 1. 프로필 초기값 (김충훈, 010-8286-3457)
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

  // 2. NAVER 모달: 5339~5380행 본문 영역 교체 (div 닫힘 완벽 일치)
  const naverTarget = `<div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>로그인 네이버 이메일</span>
                  <span className="text-[11px] text-emerald-600 font-bold">수정 가능</span>
                </div>
                <input
                  type="email"
                  value={naverModalProfile.email}
                  onChange={(e) => setNaverModalProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="예: your_id@naver.com"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#03C75A]"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">제공 항목 (필수 연동 정보)</span>
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">실명 (성명)</span>
                    <input
                      type="text"
                      value={naverModalProfile.name}
                      onChange={(e) => setNaverModalProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="성명 입력"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#03C75A]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">휴대전화번호</span>
                    <input
                      type="tel"
                      value={naverModalProfile.mobile}
                      onChange={(e) => setNaverModalProfile(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="010-XXXX-XXXX"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-[#03C75A]"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ 네이버 연동 후 <strong>다른 이메일로 자유롭게 변경</strong>하실 수 있으며, 입력하신 실제 휴대전화 번호로 가입 인증이 진행됩니다.
              </div>`;

  const naverReplacement = `<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-emerald-600">🔒</span>
                <span>네이버 실명인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>`;

  if (content.includes(naverTarget)) {
    content = content.replace(naverTarget, naverReplacement);
    console.log('Replaced NAVER target in', f);
  } else {
    console.warn('NAVER target not matched exactly in', f);
  }

  // 3. KAKAO 모달: 본문 영역 교체
  const kakaoTarget = `<div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>로그인 카카오 이메일</span>
                  <span className="text-[11px] text-amber-700 font-bold">수정 가능</span>
                </div>
                <input
                  type="email"
                  value={kakaoModalProfile.email}
                  onChange={(e) => setKakaoModalProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="예: your_kakao@kakao.com"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">제공 항목 (필수 연동 정보)</span>
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">실명 (성명)</span>
                    <input
                      type="text"
                      value={kakaoModalProfile.name}
                      onChange={(e) => setKakaoModalProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="성명 입력"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">휴대전화번호</span>
                    <input
                      type="tel"
                      value={kakaoModalProfile.mobile}
                      onChange={(e) => setKakaoModalProfile(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="010-XXXX-XXXX"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ 카카오 연동 후 <strong>다른 이메일로 자유롭게 변경</strong>하실 수 있으며, 입력하신 실제 휴대전화 번호로 가입 인증이 진행됩니다.
              </div>`;

  const kakaoReplacement = `<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-amber-600">🔒</span>
                <span>카카오 인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>`;

  if (content.includes(kakaoTarget)) {
    content = content.replace(kakaoTarget, kakaoReplacement);
    console.log('Replaced KAKAO target in', f);
  } else {
    console.warn('KAKAO target not matched exactly in', f);
  }

  // 4. GOOGLE 모달: 본문 영역 교체
  const googleTarget = `<div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Google 로그인 이메일</span>
                  <span className="text-[11px] text-blue-600 font-bold">수정 가능</span>
                </div>
                <input
                  type="email"
                  value={googleModalProfile.email}
                  onChange={(e) => setGoogleModalProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="예: your_id@gmail.com"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">제공 항목 (필수 연동 정보)</span>
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">실명 (성명)</span>
                    <input
                      type="text"
                      value={googleModalProfile.name}
                      onChange={(e) => setGoogleModalProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="성명 입력"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">휴대전화번호</span>
                    <input
                      type="tel"
                      value={googleModalProfile.mobile}
                      onChange={(e) => setGoogleModalProfile(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="010-XXXX-XXXX"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Google 연동 후 <strong>다른 이메일로 자유롭게 변경</strong>하실 수 있으며, 입력하신 실제 휴대전화 번호로 가입 인증이 진행됩니다.
              </div>`;

  const googleReplacement = `<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-blue-600">🔒</span>
                <span>Google 인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>`;

  if (content.includes(googleTarget)) {
    content = content.replace(googleTarget, googleReplacement);
    console.log('Replaced GOOGLE target in', f);
  } else {
    console.warn('GOOGLE target not matched exactly in', f);
  }

  // 5. 모달 동의 버튼 클릭 시 isTelVerified(false) 처리
  // NAVER
  content = content.replace(
    /onClick={\(\) => {\s*setNaverAuthModalOpen\(false\);[\s\S]*?setUserTel\(naverModalProfile\.mobile\);\s*setIsTelVerified\(true\);/g,
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
                  setSmsSuccessMsg('');`
  );

  // KAKAO
  content = content.replace(
    /onClick={\(\) => {\s*setKakaoAuthModalOpen\(false\);[\s\S]*?setUserTel\(kakaoModalProfile\.mobile\);\s*setIsTelVerified\(true\);/g,
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
                  setSmsSuccessMsg('');`
  );

  // GOOGLE
  content = content.replace(
    /onClick={\(\) => {\s*setGoogleAuthModalOpen\(false\);[\s\S]*?setUserTel\(googleModalProfile\.mobile\);\s*setIsTelVerified\(true\);/g,
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
                  setSmsSuccessMsg('');`
  );

  // 안내 문구
  content = content.replace(
    /setEmailCheckMsg\('✓ 네이버 계정 이메일이 자동 입력되었습니다\. 다른 이메일로 변경하여 가입하실 수 있습니다\.'\);/g,
    "setEmailCheckMsg(`✓ 네이버 연동 계정(${naverModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)`);"
  );
  content = content.replace(
    /setSuccessInfoMsg\(`✓ 네이버 계정\(\$\{naverModalProfile\.name\} \/ \$\{naverModalProfile\.email\}\) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요\.\`\);/g,
    "setSuccessInfoMsg(`✓ 네이버 계정 정보(성명: ${naverModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.`);"
  );

  content = content.replace(
    /setEmailCheckMsg\('✓ 카카오 계정 이메일이 자동 입력되었습니다\. 다른 이메일로 변경하여 가입하실 수 있습니다\.'\);/g,
    "setEmailCheckMsg(`✓ 카카오 연동 계정(${kakaoModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)`);"
  );
  content = content.replace(
    /setSuccessInfoMsg\(`✓ 카카오 계정\(\$\{kakaoModalProfile\.name\} \/ \$\{kakaoModalProfile\.email\}\) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요\.\`\);/g,
    "setSuccessInfoMsg(`✓ 카카오 계정 정보(성명: ${kakaoModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.`);"
  );

  content = content.replace(
    /setEmailCheckMsg\('✓ Google 계정 이메일이 자동 입력되었습니다\. 다른 이메일로 변경하여 가입하실 수 있습니다\.'\);/g,
    "setEmailCheckMsg(`✓ Google 연동 계정(${googleModalProfile.email})이 안전하게 조립되었습니다. (수정 불가)`);"
  );
  content = content.replace(
    /setSuccessInfoMsg\(`✓ Google 계정\(\$\{googleModalProfile\.name\} \/ \$\{googleModalProfile\.email\}\) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요\.\`\);/g,
    "setSuccessInfoMsg(`✓ Google 계정 정보(성명: ${googleModalProfile.name}, 이메일, 휴대전화번호)가 조립되었습니다. 아래 휴대폰 본인명의 실명인증(문자 인증)을 완료해 주세요.`);"
  );

  // 6. initialSocial 블록 내 setIsTelVerified(true) -> false
  content = content.replace(
    /if \(initialSocial\.mobile\) {\s*setUserTel\(initialSocial\.mobile\);\s*setIsTelVerified\(true\);/g,
    `if (initialSocial.mobile) {
        setUserTel(initialSocial.mobile);
        setIsTelVerified(false);`
  );
  content = content.replace(
    /if \(initialSocial\.mobile \|\| initialSocial\.userTel\) {\s*const ph = initialSocial\.mobile \|\| initialSocial\.userTel;\s*setUserTel\(ph\);\s*setIsTelVerified\(true\);/g,
    `if (initialSocial.mobile || initialSocial.userTel) {
        const ph = initialSocial.mobile || initialSocial.userTel;
        setUserTel(ph);
        setIsTelVerified(false);`
  );

  // 7. 성명 라벨 부분
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

  fs.writeFileSync(f, content, 'utf8');
  console.log('Applied perfectly to:', f);
}

// preview_client 복사
const src = path.join(process.cwd(), 'preview', 'index.html');
const dest = path.join(process.cwd(), 'preview_client', 'index.html');
if (fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log('Copied to preview_client/index.html');
}

