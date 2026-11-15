import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  const isCrlf = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

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

  // 2. initialSocial 블록 내 setIsTelVerified(true) -> false
  content = content.replace(
    /if \(initialSocial\.mobile\) {\s*setUserTel\(initialSocial\.mobile\);\s*setIsTelVerified\(true\);[\s\S]*?}/g,
    `if (initialSocial.mobile) {
        setUserTel(initialSocial.mobile);
        setIsTelVerified(false); // 소셜 연동 가입 시에도 휴대전화 실명인증 필수
      }`
  );
  content = content.replace(
    /if \(initialSocial\.mobile \|\| initialSocial\.userTel\) {\s*const ph = initialSocial\.mobile \|\| initialSocial\.userTel;\s*setUserTel\(ph\);\s*setIsTelVerified\(true\);[\s\S]*?}/g,
    `if (initialSocial.mobile || initialSocial.userTel) {
        const ph = initialSocial.mobile || initialSocial.userTel;
        setUserTel(ph);
        setIsTelVerified(false); // 소셜 연동 가입 시에도 휴대전화 실명인증 필수
      }`
  );

  // 3. 모달 3종 전체 블록 치환: {/* 1. NAVER 공식 연동 인증 모달 레이어 */} 부터 GOOGLE 끝까지
  const threeModalsPattern = /{\/\*\s*1\.\s*NAVER\s*공식\s*연동\s*인증\s*모달\s*레이어\s*\*\/}[\s\S]*?{naverAuthModalOpen\s*&&[\s\S]*?{\/\*\s*2\.\s*KAKAO\s*공식\s*연동\s*인증\s*모달\s*레이어\s*\*\/}[\s\S]*?{kakaoAuthModalOpen\s*&&[\s\S]*?{\/\*\s*3\.\s*Google\s*공식\s*연동\s*인증\s*모달\s*레이어\s*\*\/}[\s\S]*?{googleAuthModalOpen\s*&&[\s\S]*?취소하고 가입창으로 돌아가기[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/;

  const replacement = `{/* 1. NAVER 공식 연동 인증 모달 레이어 */}
      {naverAuthModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#03C75A] px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight">NAVER</span>
                <span className="text-xs font-semibold opacity-90">아이디로 로그인</span>
              </div>
              <button
                type="button"
                onClick={() => setNaverAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white text-xs font-bold transition-colors cursor-pointer"
                title="닫기"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center space-y-1.5 pb-3 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mb-1 shadow-xs">
                  <img src="/logo.png" alt="쓸고닦고" className="w-8 h-8 rounded-full object-cover" onerror="this.src='logo.png'" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  <span className="text-[#003262]">쓸고닦고</span> 서비스 제공을 위한<br />
                  네이버 개인정보 제3자 제공 동의
                </h4>
                <p className="text-[11px] text-slate-500">
                  네이버 실명인증 회원 정보로 간편하게 가입하고 시공 발주 및 견적을 안전하게 이용합니다.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
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
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
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
                }}
                className="w-full h-12 bg-[#03C75A] hover:bg-[#02b350] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>동의하고 계속하기 (회원정보 자동 연동)</span>
              </button>
              <button
                type="button"
                onClick={() => setNaverAuthModalOpen(false)}
                className="w-full py-1 text-xs text-slate-400 hover:text-slate-600 text-center cursor-pointer"
              >
                취소하고 가입창으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. KAKAO 공식 연동 인증 모달 레이어 */}
      {kakaoAuthModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#FEE500] px-5 py-3.5 flex items-center justify-between border-b border-amber-300">
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-5 h-5 fill-[#3C1E1E]" viewBox="0 0 24 24">
                  <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
                </svg>
                <span className="font-black text-[#3C1E1E] text-lg tracking-tight">kakao</span>
                <span className="text-xs font-bold text-[#3C1E1E]/80 ml-1">계정으로 로그인</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#3C1E1E]/10 text-[#3C1E1E] px-2 py-0.5 rounded font-mono">
                  비즈 앱 (ID 1650108)
                </span>
                <button
                  type="button"
                  onClick={() => setKakaoAuthModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#3C1E1E]/10 hover:bg-[#3C1E1E]/20 flex items-center justify-center text-[#3C1E1E] text-xs font-bold transition-colors cursor-pointer"
                  title="닫기"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center space-y-1.5 pb-3 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mb-1 shadow-xs">
                  <img src="/logo.png" alt="쓸고닦고" className="w-8 h-8 rounded-full object-cover" onerror="this.src='logo.png'" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  <span className="text-[#003262]">쓸고닦고</span> 서비스 제공을 위한<br />
                  카카오 개인정보 제3자 제공 동의
                </h4>
                <p className="text-[11px] text-slate-500">
                  카카오 비즈 앱 인증 회원 정보로 간편하게 가입하고 시공 발주 및 견적을 안전하게 이용합니다.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
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
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
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
                }}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] active:scale-[0.99] text-[#3C1E1E] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>동의하고 계속하기 (회원정보 자동 연동)</span>
              </button>
              <button
                type="button"
                onClick={() => setKakaoAuthModalOpen(false)}
                className="w-full py-1 text-xs text-slate-400 hover:text-slate-600 text-center cursor-pointer"
              >
                취소하고 가입창으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Google 공식 연동 인증 모달 레이어 */}
      {googleAuthModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                </svg>
                <span className="font-extrabold text-slate-800 text-base tracking-tight">Google</span>
                <span className="text-xs text-slate-500 font-bold ml-1">계정으로 로그인</span>
              </div>
              <button
                type="button"
                onClick={() => setGoogleAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold transition-colors cursor-pointer"
                title="닫기"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center space-y-1.5 pb-3 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mb-1 shadow-xs">
                  <img src="/logo.png" alt="쓸고닦고" className="w-8 h-8 rounded-full object-cover" onerror="this.src='logo.png'" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  <span className="text-[#003262]">쓸고닦고</span> 서비스 제공을 위한<br />
                  Google 개인정보 제공 동의
                </h4>
                <p className="text-[11px] text-slate-500">
                  Google 인증 회원 정보로 간편하게 가입하고 시공 발주 및 견적을 안전하게 이용합니다.
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-mono">
                  OAuth 2.0 (Project: sseuldakgo)
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
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
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
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
                }}
                className="w-full h-12 bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>동의하고 계속하기 (회원정보 자동 연동)</span>
              </button>
              <button
                type="button"
                onClick={() => setGoogleAuthModalOpen(false)}
                className="w-full py-1 text-xs text-slate-400 hover:text-slate-600 text-center cursor-pointer"
              >
                취소하고 가입창으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}`;

  if (threeModalsPattern.test(content)) {
    content = content.replace(threeModalsPattern, replacement);
    console.log('Successfully replaced 3 modals in:', f);
  } else {
    console.warn('Three modals pattern failed in:', f);
  }

  // 4. 성명 라벨 뱃지 및 휴대전화 disabled 수정
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

  content = content.replace(
    /disabled={isTelVerified && !socialProvider}/g,
    'disabled={isTelVerified}'
  );

  if (isCrlf) content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(f, content, 'utf8');
}

// preview_client 동기화
const src = path.join(process.cwd(), 'preview', 'index.html');
const dest = path.join(process.cwd(), 'preview_client', 'index.html');
if (fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log('Synced to preview_client/index.html');
}

