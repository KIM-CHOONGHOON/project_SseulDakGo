import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // 1. WebClntAth010200201 컴포넌트 내부: 시공사/고객 기본값 동적 분기
  const oldCompInit = `  const [profile, setProfile] = useState({
    userNo: userInfo?.userNo || userInfo?.USER_NO || 'C20261100001',
    userNm: userInfo?.userNm || userInfo?.USER_NM || '고객',
    userEmail: userInfo?.userEmail || userInfo?.USER_EMAIL || 'user@example.com',
    userTel: userInfo?.userTel || userInfo?.USER_TEL || '',
    userRoleCd: userInfo?.userRoleCd || userInfo?.USER_ROLE_CD || 'C',
    signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || userInfo?.SIGN_IMG_URL || null,
    regDt: ''
  });`;

  const newCompInit = `  const isPartnerUser = Boolean(
    userInfo?.userRoleCd === 'S' || 
    userInfo?.USER_ROLE_CD === 'S' || 
    String(userInfo?.userNo || userInfo?.USER_NO || '').startsWith('S')
  );
  const defaultUserNo = isPartnerUser ? 'S20261100001' : 'C20261100001';
  const defaultUserNm = isPartnerUser ? '공간다원' : '고객';

  const [profile, setProfile] = useState({
    userNo: userInfo?.userNo || userInfo?.USER_NO || defaultUserNo,
    userNm: userInfo?.userNm || userInfo?.USER_NM || defaultUserNm,
    userEmail: userInfo?.userEmail || userInfo?.USER_EMAIL || (isPartnerUser ? 'gonggandawon_corp@naver.com' : 'user@example.com'),
    userTel: userInfo?.userTel || userInfo?.USER_TEL || '010-8286-3457',
    userRoleCd: isPartnerUser ? 'S' : 'C',
    signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || userInfo?.SIGN_IMG_URL || null,
    regDt: ''
  });`;

  if (content.includes(oldCompInit)) {
    content = content.replace(oldCompInit, newCompInit);
    console.log(`Updated WebClntAth010200201 state init in: ${f}`);
  } else {
    console.warn(`oldCompInit not found in: ${f}`);
  }

  // effectiveUserNo 수정
  content = content.replace(
    /const effectiveUserNo = userInfo\?\.userNo \|\| userInfo\?\.USER_NO \|\| profile\.userNo \|\| 'C20261100001';/,
    `const effectiveUserNo = userInfo?.userNo || userInfo?.USER_NO || profile.userNo || defaultUserNo;`
  );

  // 2. 메인 컴포넌트 상태 추가: 내정보 드롭다운 및 서브 모달 상태
  const oldMainStates = `  const [activeNavPath, setActiveNavPath] = useState('home');`;
  const newMainStates = `  const [activeNavPath, setActiveNavPath] = useState('home');
  // 내정보 드롭다운 및 서브 모달 상태
  const [isMyMenuOpen, setIsMyMenuOpen] = useState(false);
  const [subModalType, setSubModalType] = useState(null); // 'CHANGE_PHONE' | 'CHANGE_PWD' | 'BIZ_REG'`;

  if (content.includes(oldMainStates) && !content.includes('isMyMenuOpen')) {
    content = content.replace(oldMainStates, newMainStates);
    console.log(`Added isMyMenuOpen state in: ${f}`);
  }

  // 3. 헤더의 "마이" 네비게이션 -> "내정보" 드롭다운 메뉴로 교체
  const oldMyNavPattern = /<a\s+className=\{[\s\S]*?activeNavPath === 'my-account'[\s\S]*?data-path="my-account"[\s\S]*?onClick=\{\(e\) => handleNavClick\(e, 'my-account'\)\}\s*>\s*마이\s*<\/a>/;

  const newMyNavBlock = `{/* 내정보 드롭다운 메뉴 (고객 C: 3개, 시공사 S: 4개) */}
            <div 
              className="relative"
              onMouseEnter={() => setIsMyMenuOpen(true)}
              onMouseLeave={() => setIsMyMenuOpen(false)}
            >
              <button
                type="button"
                className={
                  activeNavPath === 'my-account' || isMyMenuOpen
                    ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md flex items-center gap-1 cursor-pointer'
                    : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center gap-1 cursor-pointer'
                }
                onClick={() => {
                  if (userInfo && !userInfo.isGuest) {
                    setIsMyMenuOpen(!isMyMenuOpen);
                  } else {
                    alert('내정보 관리를 위해 먼저 로그인해 주세요.');
                    setIsLoginModalOpen(true);
                  }
                }}
              >
                <span>내정보</span>
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200">
                  {isMyMenuOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {/* 하위 드롭다운 레이어 */}
              {isMyMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-[200] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {userInfo?.USER_ROLE_CD === 'S' ? '시공사 회원' : (userInfo?.isGuest ? '비회원' : '고객 회원')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-600">
                      {userInfo?.isGuest ? 'GUEST' : (userInfo?.USER_ROLE_CD === 'S' ? 'PARTNER' : 'CLIENT')}
                    </span>
                  </div>

                  {userInfo?.isGuest ? (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs text-slate-500">로그인 후 내정보를 이용하실 수 있습니다.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        로그인하기
                      </button>
                    </div>
                  ) : userInfo?.USER_ROLE_CD === 'S' ? (
                    /* 2.2 시공사(S) 4대 메뉴 */
                    <div className="py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setSubModalType('BIZ_REG');
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[17px] text-amber-600">badge</span>
                          사업자등록증 등록
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                          WEB-PTNR-MYP-010200
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setSubModalType('CHANGE_PHONE');
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[17px] text-slate-500">phonelink_setup</span>
                          전화번호 변경
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-1 py-0.2 rounded">
                          WEB-PTNR-MYP-010300
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setSubModalType('CHANGE_PWD');
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[17px] text-slate-500">lock_reset</span>
                          비밀번호 변경
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-1 py-0.2 rounded">
                          WEB-PTNR-MYP-010400
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setWelcomeUserInfo({
                            userNo: userInfo.USER_NO,
                            userNm: userInfo.USER_NM,
                            userEmail: userInfo.USER_EMAIL || '',
                            userRoleCd: 'S',
                            signImgUrl: userInfo.SIGN_IMG_URL || null,
                          });
                          setIsWelcomeModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors border-t border-slate-100 cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                          내정보 (약관/서명)
                        </span>
                        <span className="text-[10px] text-primary bg-primary-fixed/30 px-1 py-0.2 rounded">
                          WEB-PTNR-MYP-010100
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* 2.1 고객(C) 3대 메뉴 */
                    <div className="py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setSubModalType('CHANGE_PHONE');
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[17px] text-slate-500">phonelink_setup</span>
                          전화번호 변경
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-1 py-0.2 rounded">
                          WEB-CLNT-MYP-010200
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setSubModalType('CHANGE_PWD');
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-[17px] text-slate-500">lock_reset</span>
                          비밀번호 변경
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-1 py-0.2 rounded">
                          WEB-CLNT-MYP-010300
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMyMenuOpen(false);
                          setWelcomeUserInfo({
                            userNo: userInfo.USER_NO,
                            userNm: userInfo.USER_NM,
                            userEmail: userInfo.USER_EMAIL || '',
                            userRoleCd: 'C',
                            signImgUrl: userInfo.SIGN_IMG_URL || null,
                          });
                          setIsWelcomeModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center justify-between transition-colors border-t border-slate-100 cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                          내정보 (약관/서명)
                        </span>
                        <span className="text-[10px] text-primary bg-primary-fixed/30 px-1 py-0.2 rounded">
                          WEB-CLNT-MYP-010100
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>`;

  if (oldMyNavPattern.test(content)) {
    content = content.replace(oldMyNavPattern, newMyNavBlock);
    console.log(`Replaced '마이' nav with '내정보' dropdown in: ${f}`);
  } else {
    console.warn(`oldMyNavPattern not found in: ${f}`);
  }

  // 4. 서브 모달 3종 (전화번호 변경, 비밀번호 변경, 사업자등록증 등록) 렌더링 추가
  const subModalBlock = `{/* 내정보 서브 모달 3종 (전화번호 변경, 비밀번호 변경, 사업자등록증 등록) */}
            {subModalType && (
              <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                  <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-amber-400">
                        {subModalType === 'BIZ_REG' ? 'badge' : (subModalType === 'CHANGE_PHONE' ? 'phonelink_setup' : 'lock_reset')}
                      </span>
                      <span className="font-bold text-sm">
                        {subModalType === 'BIZ_REG' && '사업자등록증 등록/관리'}
                        {subModalType === 'CHANGE_PHONE' && '휴대전화번호 변경 (알리고 SMS 실명인증)'}
                        {subModalType === 'CHANGE_PWD' && '비밀번호 변경'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubModalType(null)}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700">화면 및 API 식별자</span>
                      <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                        {subModalType === 'BIZ_REG' && 'WEB-PTNR-MYP-010200'}
                        {subModalType === 'CHANGE_PHONE' && (userInfo?.USER_ROLE_CD === 'S' ? 'WEB-PTNR-MYP-010300' : 'WEB-CLNT-MYP-010200')}
                        {subModalType === 'CHANGE_PWD' && (userInfo?.USER_ROLE_CD === 'S' ? 'WEB-PTNR-MYP-010400' : 'WEB-CLNT-MYP-010300')}
                      </span>
                    </div>

                    {subModalType === 'BIZ_REG' && (
                      <div className="space-y-3 text-xs text-slate-600">
                        <p className="leading-relaxed">
                          시공사(파트너) 회원의 신뢰성 보증을 위해 관할 세무서 발행 사업자등록증 증빙 파일을 업로드합니다.
                        </p>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer bg-slate-50/50">
                          <span className="material-symbols-outlined text-3xl text-slate-400">upload_file</span>
                          <p className="mt-2 font-bold text-slate-700">사업자등록증 파일 선택 또는 드래그</p>
                          <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG (최대 10MB)</p>
                        </div>
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                          <span>🔒</span>
                          <span>업로드된 서류는 KISA 및 개인정보보호법에 따라 안전하게 보관됩니다.</span>
                        </div>
                      </div>
                    )}

                    {subModalType === 'CHANGE_PHONE' && (
                      <div className="space-y-3 text-xs text-slate-600">
                        <p className="leading-relaxed">
                          새로운 휴대전화번호를 입력 후 알리고(ALIGO) SMS 본인인증을 완료하시면 변경됩니다.
                        </p>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">새 휴대전화번호</label>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              placeholder="010-0000-0000"
                              className="flex-1 h-11 px-3 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => alert('인증번호가 발송되었습니다. (테스트 모드)')}
                              className="px-3 h-11 bg-primary text-white font-bold rounded-xl shrink-0"
                            >
                              인증요청
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {subModalType === 'CHANGE_PWD' && (
                      <div className="space-y-3 text-xs text-slate-600">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">현재 비밀번호</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">새 비밀번호</label>
                          <input
                            type="password"
                            placeholder="8자 이상 영문, 숫자, 특수문자"
                            className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSubModalType(null)}
                      className="flex-1 h-11 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert('정상적으로 처리되었습니다.');
                        setSubModalType(null);
                      }}
                      className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      저장 및 변경 완료
                    </button>
                  </div>
                </div>
              </div>
            )}`;

  if (content.includes('{/* Interactive Modal: WEB-CLNT-ATH-010200')) {
    content = content.replace('{/* Interactive Modal: WEB-CLNT-ATH-010200', subModalBlock + '\n\n            {/* Interactive Modal: WEB-CLNT-ATH-010200');
    console.log(`Added subModalBlock in: ${f}`);
  }

  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(f, content, 'utf8');
}

// preview_client 동기화
if (fs.existsSync('preview/index.html') && fs.existsSync('preview_client/index.html')) {
  fs.copyFileSync('preview/index.html', 'preview_client/index.html');
  console.log('Synced to preview_client/index.html');
}
