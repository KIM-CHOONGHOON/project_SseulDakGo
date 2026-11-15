import fs from 'fs';
import path from 'path';

const previewHtmlPath = path.join(process.cwd(), 'preview', 'index.html');
let content = fs.readFileSync(previewHtmlPath, 'utf8');

// 1. Definition of the 3 Sub Modals and WebClntMyp010100
const subModalsAndMypageComponent = `
// ============================================================================
// [서브 모달] WEB-CLNT-MYP-010200 (전화번호 변경)
// ============================================================================
function WebClntMyp010200Modal({ isOpen, currentUser, onClose, onSuccess }) {
  const [currentPhone, setCurrentPhone] = useState(currentUser?.PHONE_NO || currentUser?.USER_PHONE || '010-8286-3457');
  const [newPhone, setNewPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(180);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let interval;
    if (isCodeSent && timer > 0 && !isVerified) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCodeSent, timer, isVerified]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (!newPhone || newPhone.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setIsCodeSent(true);
    setTimer(180);
    alert('인증번호(6자리: 123456)가 발송되었습니다.');
  };

  const handleConfirmCode = () => {
    if (verifyCode === '123456' || verifyCode.length === 6) {
      setIsVerified(true);
      alert('전화번호 본인인증이 완료되었습니다.');
    } else {
      alert('인증번호 6자리를 정확히 입력해주세요. (테스트용: 123456)');
    }
  };

  const handleComplete = () => {
    if (!isVerified) {
      alert('먼저 SMS 인증을 완료해주세요.');
      return;
    }
    alert('전화번호가 성공적으로 변경되었습니다: ' + newPhone);
    if (onSuccess) onSuccess(newPhone);
    onClose();
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-mono font-bold bg-primary-fixed/40 text-primary px-2 py-0.5 rounded">WEB-CLNT-MYP-010200</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">전화번호 변경</h3>
            <p className="text-xs text-slate-500">안전한 알림 및 시공 매칭을 위해 새 번호로 인증해주세요.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">현재 등록된 번호</label>
            <input type="text" disabled value={currentPhone} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono" />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">신규 휴대폰 번호</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="010-XXXX-XXXX" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)}
                disabled={isVerified}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono" 
              />
              <button 
                type="button" 
                onClick={handleSendCode} 
                disabled={isVerified}
                className="px-3.5 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-on-secondary-fixed-variant transition-colors whitespace-nowrap cursor-pointer"
              >
                {isCodeSent ? '재전송' : '인증요청'}
              </button>
            </div>
          </div>

          {isCodeSent && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-bold">SMS 인증번호 6자리</label>
                <span className="text-red-500 font-mono font-bold">{formatTime(timer)}</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6} 
                  placeholder="123456" 
                  value={verifyCode} 
                  onChange={(e) => setVerifyCode(e.target.value)}
                  disabled={isVerified}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-center font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                />
                <button 
                  type="button" 
                  onClick={handleConfirmCode} 
                  disabled={isVerified}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-on-primary-fixed-variant transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isVerified ? '인증완료 ✓' : '확인'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer text-xs">
            취소
          </button>
          <button 
            type="button" 
            onClick={handleComplete} 
            disabled={!isVerified} 
            className={\`px-5 py-2 rounded-lg text-white font-bold text-xs \${isVerified ? 'bg-primary hover:bg-on-primary-fixed-variant cursor-pointer shadow-md' : 'bg-slate-300 cursor-not-allowed'}\`}
          >
            변경 완료
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// [서브 모달] WEB-CLNT-MYP-010300 (비밀번호 변경)
// ============================================================================
function WebClntMyp010300Modal({ isOpen, currentUser, onClose, onSuccess }) {
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPwd || newPwd.length < 8) {
      alert('새 비밀번호는 최소 8자 이상 입력해주세요.');
      return;
    }
    if (newPwd !== confirmPwd) {
      alert('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    alert('비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-mono font-bold bg-primary-fixed/40 text-primary px-2 py-0.5 rounded">WEB-CLNT-MYP-010300</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">비밀번호 변경</h3>
            <p className="text-xs text-slate-500">영문, 숫자, 특수문자를 혼합하여 안전하게 설정하세요.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
            💡 네이버/카카오 간편로그인 회원은 자체 비밀번호를 등록하면 이메일/비밀번호로도 로그인할 수 있습니다.
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">현재 비밀번호</label>
            <input 
              type="password" 
              placeholder="현재 사용 중인 비밀번호 (최초 등록 시 생략 가능)" 
              value={curPwd} 
              onChange={e => setCurPwd(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">새 비밀번호</label>
            <input 
              type="password" 
              placeholder="8~16자 영문/숫자/특수문자 조합" 
              value={newPwd} 
              onChange={e => setNewPwd(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">새 비밀번호 확인</label>
            <input 
              type="password" 
              placeholder="새 비밀번호 다시 입력" 
              value={confirmPwd} 
              onChange={e => setConfirmPwd(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {confirmPwd && (
              <p className={\`mt-1 font-bold \${newPwd === confirmPwd ? 'text-emerald-600' : 'text-red-500'}\`}>
                {newPwd === confirmPwd ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 -mx-6 -mb-6 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer">
              취소
            </button>
            <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg font-bold hover:bg-on-primary-fixed-variant cursor-pointer shadow-md">
              비밀번호 변경하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// [서브 모달] WEB-CLNT-MYP-020100 (사업자등록증 등록 - 시공사 전용)
// ============================================================================
function WebClntMyp020100Modal({ isOpen, currentUser, onClose, onSuccess }) {
  const [bizType, setBizType] = useState('CORP'); // 'CORP' | 'INDIVIDUAL'
  const [bizNo, setBizNo] = useState('120-88-29401');
  const [corpNm, setCorpNm] = useState('공간다원');
  const [ceoNm, setCeoNm] = useState('김충훈');
  const [fileName, setFileName] = useState('사업자등록증_공간다원.pdf');
  const [isVerified, setIsVerified] = useState(true);

  if (!isOpen) return null;

  const handleVerifyHometax = () => {
    alert('국세청 홈택스 실시간 진위 확인: 정상 계속사업자 (과세유형: 일반과세자) 확인되었습니다.');
    setIsVerified(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bizNo || bizNo.length < 10) {
      alert('10자리 사업자등록번호를 정확히 입력해주세요.');
      return;
    }
    alert('사업자등록증 정보가 성공적으로 갱신/등록되었습니다.');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">WEB-CLNT-MYP-020100</span>
              <span className="text-[10px] bg-secondary text-white font-bold px-1.5 py-0.5 rounded">시공사(S) 전용</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1">사업자등록증 & 세금계산서 관리</h3>
            <p className="text-xs text-slate-500">전자세금계산서 발행 및 파트너 시공 계약 필수 서류를 관리합니다.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button 
              type="button" 
              onClick={() => setBizType('INDIVIDUAL')} 
              className={\`flex-1 py-1.5 rounded-lg font-bold transition-all \${bizType === 'INDIVIDUAL' ? 'bg-white shadow text-primary' : 'text-slate-500'}\`}
            >
              개인사업자
            </button>
            <button 
              type="button" 
              onClick={() => setBizType('CORP')} 
              className={\`flex-1 py-1.5 rounded-lg font-bold transition-all \${bizType === 'CORP' ? 'bg-white shadow text-primary' : 'text-slate-500'}\`}
            >
              법인사업자
            </button>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">사업자등록번호 (10자리)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={bizNo} 
                onChange={e => setBizNo(e.target.value)} 
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-secondary focus:outline-none" 
              />
              <button 
                type="button" 
                onClick={handleVerifyHometax} 
                className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                홈택스 진위확인
              </button>
            </div>
            {isVerified && <p className="text-emerald-600 font-bold mt-1">✓ 국세청 홈택스 인증 완료 (정상 계속사업자)</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">상호명 (법인명)</label>
              <input type="text" value={corpNm} onChange={e => setCorpNm(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">대표자 성명</label>
              <input type="text" value={ceoNm} onChange={e => setCeoNm(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">사업자등록증 사본 첨부</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => alert('파일 선택 창이 호출됩니다.')}>
              <span className="material-symbols-outlined text-[32px] text-slate-400">cloud_upload</span>
              <p className="font-bold text-slate-700 mt-1">{fileName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF 지원 (최대 10MB)</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 -mx-6 -mb-6 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer">
              닫기
            </button>
            <button type="submit" className="px-5 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-on-secondary-fixed-variant cursor-pointer shadow-md">
              저장 및 인증 요청
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;

// Read the code of WebClntMyp010100 from frontend/WEB-CLNT-MYP-010100/index.jsx
const mypCodePath = path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-MYP-010100', 'index.jsx');
let mypCode = fs.readFileSync(mypCodePath, 'utf8');

// Strip imports and exports from mypCode
mypCode = mypCode.replace(/import\s+React.*?;\s*/gs, '');
mypCode = mypCode.replace(/export\s+default\s+function\s+WebClntMyp010100/g, 'function WebClntMyp010100');

// Insert subModalsAndMypageComponent and mypCode right before WebClntCom010000
const insertMarker = '// [메인 화면 컴포넌트] WEB-CLNT-COM-010000';
const pos = content.indexOf(insertMarker);
if (pos !== -1) {
  content = content.slice(0, pos) + `${subModalsAndMypageComponent}\n\n${mypCode}\n\n` + content.slice(pos);
  console.log('Inserted SubModals and WebClntMyp010100 before WebClntCom010000.');
} else {
  console.error('Could not find insertMarker in preview/index.html');
}

// 2. Add screen switching inside WebClntCom010000
const navCheckMarker = '// 청소 시공 검수 및 현장 직불 완료 승인 (WEB-CLNT-JOB-010100) 화면 전환';
const mypageRouteCode = `
  // [신규] 내정보 (WEB-CLNT-MYP-010100) 화면 라우팅
  if (activeNavPath && (activeNavPath === "WEB-CLNT-MYP-010100" || activeNavPath === "my-page" || activeNavPath === "my-account")) {
    return (
      <>
        <WebClntMyp010100
          currentUser={userInfo}
          onNavigate={(path) => setActiveNavPath(path)}
          onOpenPhoneModal={() => setSubModalType('CHANGE_PHONE')}
          onOpenPasswordModal={() => setSubModalType('CHANGE_PWD')}
          onOpenBizModal={() => setSubModalType('BIZ_REG')}
          onLogout={() => {
            setUserInfo({
              isGuest: true,
              USER_NO: "GUEST",
              USER_NM: "비회원",
              USER_ROLE_CD: "GUEST",
            });
            setActiveNavPath("home");
          }}
        />
        {/* 서브 모달 3종 */}
        <WebClntMyp010200Modal
          isOpen={subModalType === 'CHANGE_PHONE'}
          currentUser={userInfo}
          onClose={() => setSubModalType(null)}
          onSuccess={(newPhone) => {
            setUserInfo(prev => ({ ...prev, PHONE_NO: newPhone, USER_PHONE: newPhone }));
            setSubModalType(null);
          }}
        />
        <WebClntMyp010300Modal
          isOpen={subModalType === 'CHANGE_PWD'}
          currentUser={userInfo}
          onClose={() => setSubModalType(null)}
          onSuccess={() => setSubModalType(null)}
        />
        <WebClntMyp020100Modal
          isOpen={subModalType === 'BIZ_REG'}
          currentUser={userInfo}
          onClose={() => setSubModalType(null)}
          onSuccess={() => setSubModalType(null)}
        />
      </>
    );
  }
`;

if (content.includes(navCheckMarker)) {
  content = content.replace(navCheckMarker, `${mypageRouteCode}\n  ${navCheckMarker}`);
  console.log('Added WEB-CLNT-MYP-010100 route in WebClntCom010000.');
} else {
  console.error('Could not find navCheckMarker in preview/index.html');
}

// 3. Fix the dropdown in WebClntCom010000 (replace lines with hover flickering with rock-solid click dropdown and proper IDs)
const dropdownTargetStart = '{/* 내정보 드롭다운 메뉴 (고객 C: 3개, 시공사 S: 4개) */}';
const dropdownTargetEnd = '{/* Right: Auth / Profile Cluster */}';

const newDropdownCode = `{/* 내정보 드롭다운 메뉴 (고객 C: 3개, 시공사 S: 4개) */}
            <div className="relative">
              <button
                type="button"
                className={
                  activeNavPath === 'my-account' || activeNavPath === 'WEB-CLNT-MYP-010100' || isMyMenuOpen
                    ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md flex items-center gap-1 cursor-pointer font-bold'
                    : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all flex items-center gap-1 cursor-pointer'
                }
                onClick={(e) => {
                  e.stopPropagation();
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

              {/* 하위 드롭다운 레이어 (바깥 클릭 백드롭 및 정확한 채번 ID 적용) */}
              {isMyMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[190]" 
                    onClick={() => setIsMyMenuOpen(false)} 
                  />
                  <div 
                    className="absolute right-0 top-full pt-1 w-64 z-[200]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {userInfo?.USER_ROLE_CD === 'S' ? '시공사 회원' : (userInfo?.isGuest ? '비회원' : '고객 회원')}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-600">
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
                            className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
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
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold">
                              WEB-CLNT-MYP-020100
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
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
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
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
                              WEB-CLNT-MYP-010300
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsMyMenuOpen(false);
                              setActiveNavPath('WEB-CLNT-MYP-010100');
                            }}
                            className="w-full px-4 py-2.5 text-left text-primary hover:bg-primary-fixed/30 flex items-center justify-between transition-colors border-t border-slate-100 cursor-pointer font-bold bg-primary-fixed/10"
                          >
                            <span className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                              내정보 관리 (프로필 및 통계)
                            </span>
                            <span className="text-[10px] text-primary bg-white px-1.5 py-0.5 rounded border border-primary/20 font-mono font-bold shadow-xs">
                              WEB-CLNT-MYP-010100
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
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
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
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
                              WEB-CLNT-MYP-010300
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsMyMenuOpen(false);
                              setActiveNavPath('WEB-CLNT-MYP-010100');
                            }}
                            className="w-full px-4 py-2.5 text-left text-primary hover:bg-primary-fixed/30 flex items-center justify-between transition-colors border-t border-slate-100 cursor-pointer font-bold bg-primary-fixed/10"
                          >
                            <span className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                              내정보 관리 (프로필 및 통계)
                            </span>
                            <span className="text-[10px] text-primary bg-white px-1.5 py-0.5 rounded border border-primary/20 font-mono font-bold shadow-xs">
                              WEB-CLNT-MYP-010100
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>

          `;

const idxStart = content.indexOf(dropdownTargetStart);
const idxEnd = content.indexOf(dropdownTargetEnd);
if (idxStart !== -1 && idxEnd !== -1) {
  content = content.slice(0, idxStart) + newDropdownCode + content.slice(idxEnd);
  console.log('Replaced dropdown menu markup successfully.');
} else {
  console.error('Could not locate dropdown markers:', { idxStart, idxEnd });
}

// 4. Render sub modals in WebClntCom010000
const modalRenderMarker = '<WebClntAth010200201';
const subModalsRenderCode = `
            {/* [신규] 내정보 서브 모달 3종 */}
            <WebClntMyp010200Modal
              isOpen={subModalType === 'CHANGE_PHONE'}
              currentUser={userInfo}
              onClose={() => setSubModalType(null)}
              onSuccess={(newPhone) => {
                setUserInfo(prev => ({ ...prev, PHONE_NO: newPhone, USER_PHONE: newPhone }));
                setSubModalType(null);
              }}
            />
            <WebClntMyp010300Modal
              isOpen={subModalType === 'CHANGE_PWD'}
              currentUser={userInfo}
              onClose={() => setSubModalType(null)}
              onSuccess={() => setSubModalType(null)}
            />
            <WebClntMyp020100Modal
              isOpen={subModalType === 'BIZ_REG'}
              currentUser={userInfo}
              onClose={() => setSubModalType(null)}
              onSuccess={() => setSubModalType(null)}
            />
`;

if (content.includes(modalRenderMarker)) {
  content = content.replace(modalRenderMarker, `${subModalsRenderCode}\n            ${modalRenderMarker}`);
  console.log('Added sub modals rendering in WebClntCom010000.');
} else {
  console.error('Could not find modalRenderMarker in preview/index.html');
}

fs.writeFileSync(previewHtmlPath, content, 'utf8');
console.log('Saved updated preview/index.html!');

// Also sync to preview_client/index.html
const clientPreviewPath = path.join(process.cwd(), 'preview_client', 'index.html');
fs.copyFileSync(previewHtmlPath, clientPreviewPath);
console.log('Synced to preview_client/index.html!');
