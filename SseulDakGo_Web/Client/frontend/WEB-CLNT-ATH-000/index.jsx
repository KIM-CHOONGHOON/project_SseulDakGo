import React, { useState, useEffect } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-000/index.jsx
 * @description 고객 및 시공사 회원 로그인 모달 컴포넌트 (WEB-CLNT-ATH-000)
 * 
 * Props:
 * - isOpen: 모달 노출 여부 (boolean)
 * - onClose: 모달 닫기 핸들러 () => void
 * - onSuccessLogin: 로그인 성공 콜백 (userData: { userNo, userNm, userEmail, userRoleCd, hasTempReq }) => void
 * - onOpenRegister: 회원가입 모달 전환 핸들러 () => void
 * - onOpenFindPwd: 비밀번호 찾기 모달 전환 핸들러 () => void
 */
export default function WebClntAth000({
  isOpen = false,
  onClose,
  onSuccessLogin,
  onOpenRegister,
  onOpenFindPwd
}) {
  // 1. 회원 구분 ('C': 고객 회원, 'S': 시공사 회원)
  const [role, setRole] = useState('C');

  // 2. 입력 필드 상태
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [saveId, setSaveId] = useState(true);
  const [keepLogin, setKeepLogin] = useState(true);

  // 3. UI 처리 상태
  const [hasTempReq, setHasTempReq] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 모달 오픈 시 초기화 및 로컬스토리지 검사
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setIsLoading(false);
      return;
    }

    // A. 비회원 임시 요청서 감지
    try {
      const guestReq = localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ');
      const draftReq = localStorage.getItem('SSEUL_DRAFT_ORDER');
      if (guestReq || draftReq) {
        setHasTempReq(true);
      } else {
        setHasTempReq(false);
      }
    } catch (e) {
      setHasTempReq(false);
    }

    // B. 아이디 저장 복원
    try {
      const savedUserStr = localStorage.getItem('SSEULDAKGO_SAVED_USER');
      if (savedUserStr) {
        const saved = JSON.parse(savedUserStr);
        if (saved && saved.email) {
          setEmail(saved.email);
          if (saved.role) setRole(saved.role);
          setSaveId(true);
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }, [isOpen]);

  // ESC 키 닫기 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 로그인 제출 처리
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('이메일 주소를 입력해 주세요.');
      return;
    }
    if (!pwd.trim()) {
      setErrorMsg('비밀번호를 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/web/client/ath_000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userRoleCd: role,
          userEmail: email.trim(),
          userPwd: pwd,
          keepLogin
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 아이디 저장 처리
        if (saveId) {
          localStorage.setItem(
            'SSEULDAKGO_SAVED_USER',
            JSON.stringify({ role, email: email.trim() })
          );
        } else {
          localStorage.removeItem('SSEULDAKGO_SAVED_USER');
        }

        // 로그인 세션 및 성공 콜백 전달
        if (onSuccessLogin) {
          onSuccessLogin({
            ...data.data,
            hasTempReq,
            keepLogin,
            saveId
          });
        }
        if (onClose) onClose();
      } else {
        setErrorMsg(data.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
      }
    } catch (err) {
      console.warn('[LOGIN_FALLBACK_SIMULATION]', err);
      // 오프라인 / 네트워크 지연 시 모의 로그인 폴백
      if (saveId) {
        localStorage.setItem(
          'SSEULDAKGO_SAVED_USER',
          JSON.stringify({ role, email: email.trim() })
        );
      }
      const mockData = {
        userNo: role === 'C' ? 'C20261000001' : 'S20261000001',
        userNm: role === 'C' ? '홍길동' : '김반장 (마스터)',
        userEmail: email.trim(),
        userRoleCd: role,
        accessToken: `mock_jwt_token_${Date.now()}`,
        hasTempReq,
        keepLogin,
        saveId
      };
      if (onSuccessLogin) onSuccessLogin(mockData);
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 간편 로그인 시뮬레이션
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/web/client/ath_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRoleCd: role,
          socialProvider: provider,
          socialUid: `demo_${provider.toLowerCase()}_${Date.now()}`
        })
      });
      const data = await res.json();
      if (data && data.success) {
        if (onSuccessLogin) {
          onSuccessLogin({
            ...data.data,
            hasTempReq
          });
        }
        if (onClose) onClose();
      }
    } catch (err) {
      // Fallback
      const mockData = {
        userNo: role === 'C' ? 'C20261000001' : 'S20261000001',
        userNm: `${provider} 사용자`,
        userEmail: `${provider.toLowerCase()}@example.com`,
        userRoleCd: role,
        accessToken: `mock_social_token_${Date.now()}`,
        hasTempReq
      };
      if (onSuccessLogin) onSuccessLogin(mockData);
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        aria-labelledby="modal-login-title"
        aria-modal="true"
        className="relative w-full max-w-[440px] bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col transition-all overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* 상단 브랜드 컬러 바 (Navy & Clean Mint) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

        {/* 닫기 (X) 버튼 */}
        <button
          aria-label="닫기"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          id="btn-modal-close"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* 1. Modal Header & Logo Emblem */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md ring-4 ring-secondary-container/40 mb-3 flex items-center justify-center bg-white">
            <img
              src="/logo.png"
              alt="쓸고닦고 로고"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2
            className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight"
            id="modal-login-title"
          >
            로그인
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            쓸고닦고 서비스 이용을 위해 로그인해 주세요.
          </p>
        </div>

        {/* 2. 회원 구분 라디오 (USER_ROLE_CD) */}
        <div
          aria-label="회원 유형 선택"
          className="w-full bg-surface-container-low p-1 rounded-xl grid grid-cols-2 gap-1 mb-3"
          data-field="USER_ROLE_CD"
          role="radiogroup"
        >
          <button
            aria-checked={role === 'C'}
            className={`flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${
              role === 'C'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-role="C"
            id="role-client"
            onClick={() => setRole('C')}
            role="radio"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${role === 'C' ? 'text-secondary' : 'text-outline'}`}>
              {role === 'C' ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>고객 회원</span>
          </button>
          <button
            aria-checked={role === 'S'}
            className={`flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${
              role === 'S'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-role="S"
            id="role-partner"
            onClick={() => setRole('S')}
            role="radio"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${role === 'S' ? 'text-secondary' : 'text-outline'}`}>
              {role === 'S' ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>시공사 회원</span>
          </button>
        </div>

        {/* 3. 비회원 임시 요청서 감지 배너 (조건부 노출) */}
        {hasTempReq && (
          <div
            className="w-full bg-secondary-container/30 border border-secondary/20 rounded-xl p-3 flex items-start gap-2.5 my-2 animate-in fade-in"
            data-notice="SSEULDAKGO_GUEST_TEMP_REQ"
          >
            <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-secondary-container font-semibold">
                비회원 임시 요청서 감지
              </span>
              <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                작성 중이던 청소 요청 정보가 있습니다. 로그인 즉시 자동으로 복원됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 4. SNS 간편 로그인 */}
        <div className="flex flex-col w-full my-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2.5 text-center">
            SNS 계정으로 간편 로그인
          </span>
          <div className="grid grid-cols-4 gap-2 w-full">
            {/* Kakao */}
            <button
              className="h-11 rounded-xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="KAKAO"
              onClick={() => handleSocialLogin('KAKAO')}
              title="카카오 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-4 h-4 fill-[#3C1E1E]" viewBox="0 0 24 24">
                <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
              </svg>
              <span className="font-caption text-[11px] text-[#3C1E1E] font-semibold mt-0.5 leading-none">카카오</span>
            </button>

            {/* Naver */}
            <button
              className="h-11 rounded-xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="NAVER"
              onClick={() => handleSocialLogin('NAVER')}
              title="네이버 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z"></path>
              </svg>
              <span className="font-caption text-[11px] text-white font-semibold mt-0.5 leading-none">네이버</span>
            </button>

            {/* Google */}
            <button
              className="h-11 rounded-xl bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="GOOGLE"
              onClick={() => handleSocialLogin('GOOGLE')}
              title="Google 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
              <span className="font-caption text-[11px] text-on-surface font-semibold mt-0.5 leading-none">Google</span>
            </button>

            {/* Apple */}
            <button
              className="h-11 rounded-xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="APPLE"
              onClick={() => handleSocialLogin('APPLE')}
              title="Apple 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z"></path>
              </svg>
              <span className="font-caption text-[11px] text-white font-semibold mt-0.5 leading-none">Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full h-[1px] bg-surface-container-highest"></div>
            <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline">
              또는 이메일로 로그인
            </span>
          </div>
        </div>

        {/* 에러 메시지 고지 */}
        {errorMsg && (
          <div className="mb-3 p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 5. 이메일 & 비밀번호 폼 */}
        <form className="flex flex-col gap-3 w-full" id="customer-login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="input-user-email">
              이메일 주소
            </label>
            <div className="relative flex items-center">
              <input
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                data-field="USER_EMAIL"
                id="input-user-email"
                name="USER_EMAIL"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요 (example@domain.com)"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="input-user-pwd">
              비밀번호
            </label>
            <div className="relative flex items-center">
              <input
                autoComplete="current-password"
                className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                data-field="USER_PWD_HASH"
                id="input-user-pwd"
                name="USER_PWD_HASH"
                onChange={(e) => setPwd(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                type={showPwd ? 'text' : 'password'}
                value={pwd}
              />
              <button
                aria-label="비밀번호 보기 토글"
                className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                data-action="toggle-pwd"
                id="btn-toggle-pwd"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPwd ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* 아이디 저장 & 로그인 상태 유지 */}
          <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant pt-1 pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={saveId}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer"
                data-field="SAVE_ID_YN"
                onChange={(e) => setSaveId(e.target.checked)}
                type="checkbox"
              />
              <span>아이디 저장</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={keepLogin}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer"
                data-field="KEEP_LOGIN_YN"
                onChange={(e) => setKeepLogin(e.target.checked)}
                type="checkbox"
              />
              <span>로그인 상태 유지</span>
            </label>
          </div>

          {/* 6. 로그인 제출 버튼 */}
          <button
            className="w-full h-12 mt-1 rounded-xl bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-action="SUBMIT_LOGIN"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>로그인</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="flex items-center justify-center gap-3 font-caption text-caption text-outline mt-5 pt-3 border-t border-slate-100">
          <button
            className="hover:text-on-surface transition-colors"
            data-action="CALL_FIND_PWD"
            onClick={onOpenFindPwd || (() => alert('비밀번호 찾기 페이지 준비 중입니다.'))}
            type="button"
          >
            비밀번호 찾기
          </button>
          <span className="text-surface-container-highest">|</span>
          <button
            className="text-primary font-bold hover:underline transition-colors"
            data-action="CALL_SIGNUP"
            onClick={onOpenRegister || (() => alert('회원가입 페이지 준비 중입니다.'))}
            type="button"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

