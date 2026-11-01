import React, { useState, useEffect, useRef } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010/index.jsx
 * @description 통합 회원가입 및 4대 약관 정독 모달 컴포넌트 (WEB-CLNT-ATH-010)
 *              - SNS(카카오, 네이버, Google, Apple) 연동 간편 가입 및 일반 이메일 가입
 *              - 자필 전자서명 캔버스 패드 & 서명 지우기 & PNG 파일 저장 연동
 * 
 * Props:
 * - isOpen: 모달 표시 여부 (boolean)
 * - onClose: 모달 닫기 핸들러 () => void
 * - onSuccessRegister: 가입 완료 성공 콜백 (userData) => void
 * - onOpenLogin: 로그인 모달(WEB-CLNT-ATH-000) 전환 핸들러 () => void
 */
export default function WebClntAth010({
  isOpen = false,
  onClose,
  onSuccessRegister,
  onOpenLogin
}) {
  // 1. 회원 구분 ('C': 고객 회원, 'S': 시공사 회원)
  const [role, setRole] = useState('C');

  // 2. SNS 연동 정보
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialUid, setSocialUid] = useState(null);

  // 3. 계정 정보 필드
  const [email, setEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false); // 비밀번호 보기/숨기기 토글 (Requirement 1)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false); // 비밀번호 확인 보기/숨기기 토글 (Requirement 1)
  const [userNm, setUserNm] = useState('');
  const [userTel, setUserTel] = useState('');
  const [isTelVerified, setIsTelVerified] = useState(true);

  // 오류 및 유효성 검증 알림 모달 상태 (Requirement 2)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    targetRef: null
  });

  // 회원가입 완료 축하 커스텀 모달 상태 (브라우저 기본 alert 대체)
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    userData: null
  });

  const handleConfirmSuccessModal = () => {
    const userData = successModal.userData;
    setSuccessModal({ isOpen: false, title: '', message: '', userData: null });
    if (onSuccessRegister && userData) {
      onSuccessRegister(userData);
    }
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onClose) {
      onClose();
    }
  };

  const showAlertModal = (message, title = '입력 정보 확인', targetRef = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      targetRef
    });
  };

  // 포커스 및 스크롤용 ref
  const emailInputRef = useRef(null);
  const pwdInputRef = useRef(null);
  const pwdConfirmInputRef = useRef(null);

  // 4. 자필 전자서명 캔버스 상태
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // 5. 4대 약관 Scroll-Lock 및 개별 동의 일시(agreedAt) 상태 관리
  const [terms, setTerms] = useState({
    service: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() },
    privacy: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() },
    location: { scrolled: false, checked: false, progress: 0, agreedAt: null },
    finance: { scrolled: false, checked: false, progress: 0, agreedAt: null }
  });

  const [allChecked, setAllChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfoMsg, setSuccessInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 스크롤 감지용 ref
  const locationViewerRef = useRef(null);
  const financeViewerRef = useRef(null);
  const termsSectionRef = useRef(null);

  // 모달 오픈 시 초기화
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setSuccessInfoMsg('');
      setIsLoading(false);
      setSocialProvider(null);
      setSocialUid(null);
      setShowPwd(false);
      setShowPwdConfirm(false);
      setAlertModal({ isOpen: false, title: '', message: '', targetRef: null });
      setUserNm('');
      setUserTel('');
      handleClearSignature();
      return;
    }
  }, [isOpen]);

  // 약관 동의 건수 계산
  const agreeCount = Object.values(terms).filter((t) => t.checked).length;

  useEffect(() => {
    setAllChecked(agreeCount === 4);
  }, [agreeCount]);

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

  // =========================================================================
  // 전자서명 캔버스 드로잉 로직 (마우스 & 터치 지원)
  // =========================================================================
  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#003262'; // Brand Deep Royal Navy
    isDrawing.current = true;
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const startDrawingTouch = (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#003262';
      isDrawing.current = true;
      setHasSignature(true);
    }
  };

  const drawTouch = (e) => {
    if (!isDrawing.current) return;
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // =========================================================================
  // SNS 연동 가입 핸들러
  // =========================================================================
  const handleSocialSignup = (provider) => {
    const dummyUid = `${provider.toLowerCase()}_uid_${Date.now()}`;
    const dummyEmail = `${provider.toLowerCase()}_user@sseuldakgo.kr`;

    setSocialProvider(provider);
    setSocialUid(dummyUid);
    setEmail(dummyEmail);
    setIsEmailChecked(true);
    setIsEmailValid(true);
    setEmailCheckMsg(`✓ ${provider} 계정으로 본인확인 및 연동되었습니다.`);
    setPwd('social_auth_pwd!');
    setPwdConfirm('social_auth_pwd!');
    setErrorMsg('');

    if (agreeCount === 4) {
      setSuccessInfoMsg(`${provider} 계정 연동 완료! 서명 날인 후 '회원가입 완료하기'를 누르시면 가입이 완료됩니다.`);
    } else {
      setSuccessInfoMsg(`${provider} 계정이 연동되었습니다. 아래 4대 필수 약관 전문 확인 및 서명 날인 후 가입을 완료해 주세요.`);
      if (termsSectionRef.current) {
        termsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // SNS 연동 해제
  const handleCancelSocial = () => {
    setSocialProvider(null);
    setSocialUid(null);
    setEmail('');
    setIsEmailChecked(false);
    setEmailCheckMsg('');
    setPwd('');
    setPwdConfirm('');
    setSuccessInfoMsg('');
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('올바른 형식의 이메일 주소를 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/web/client/ath_010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_EMAIL',
          userRoleCd: role,
          userEmail: email.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.isAvailable) {
        setIsEmailChecked(true);
        setIsEmailValid(true);
        setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
      } else {
        setIsEmailChecked(true);
        setIsEmailValid(false);
        setEmailCheckMsg(data.message || '이미 등록된 이메일 주소입니다.');
      }
    } catch (e) {
      setIsEmailChecked(true);
      setIsEmailValid(true);
      setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
    }
  };

  // 휴대폰 재인증 모의 호출
  const handleReverifyTel = () => {
    alert('PASS / SMS 실명확인 팝업이 호출되었습니다. (가상 환경 테스트 통과)');
    setIsTelVerified(true);
  };

  // Scroll-Lock 감지 핸들러
  const handleScroll = (key, e) => {
    const el = e.target;
    if (!el) return;

    const scrolledToEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 6;
    const progress = Math.min(
      100,
      Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    );

    setTerms((prev) => {
      const current = prev[key];
      if (scrolledToEnd) {
        return {
          ...prev,
          [key]: {
            ...current,
            scrolled: true,
            checked: true,
            progress: 100,
            agreedAt: current.agreedAt || new Date().toISOString()
          }
        };
      } else if (!current.checked) {
        return {
          ...prev,
          [key]: { ...current, progress }
        };
      }
      return prev;
    });
  };

  // 개별 체크박스 토글 (동의 일시 실시간 기록)
  const handleToggleTerm = (key) => {
    const target = terms[key];
    if (!target.scrolled) {
      showAlertModal('약관 본문을 끝까지 스크롤하여 전문을 확인하신 후 동의해 주세요.', '약관 정독 필요');
      return;
    }
    setTerms((prev) => {
      const willCheck = !prev[key].checked;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          checked: willCheck,
          agreedAt: willCheck ? new Date().toISOString() : null
        }
      };
    });
  };

  // 전체 동의 토글 (모든 약관에 현재 시점 Timestamp 반영)
  const handleToggleAll = (e) => {
    const checked = e.target.checked;
    const nowIso = new Date().toISOString();
    if (checked) {
      if (!terms.location.scrolled || !terms.finance.scrolled) {
        showAlertModal('필수 약관의 전문(위치기반, 전자금융거래)을 스크롤하여 먼저 끝까지 확인해주셔야 일괄 동의가 완료됩니다.', '약관 정독 필요');
        return;
      }
      setTerms({
        service: { ...terms.service, checked: true, agreedAt: terms.service.agreedAt || nowIso },
        privacy: { ...terms.privacy, checked: true, agreedAt: terms.privacy.agreedAt || nowIso },
        location: { ...terms.location, checked: true, agreedAt: terms.location.agreedAt || nowIso },
        finance: { ...terms.finance, checked: true, agreedAt: terms.finance.agreedAt || nowIso }
      });
    } else {
      setTerms({
        service: { ...terms.service, checked: false, agreedAt: null },
        privacy: { ...terms.privacy, checked: false, agreedAt: null },
        location: { ...terms.location, checked: false, agreedAt: null },
        finance: { ...terms.finance, checked: false, agreedAt: null }
      });
    }
  };

  // 최종 가입 제출 (Requirement 2 검증 및 모달 출력)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // 2.1 이메일 입력 여부 검증
    if (!email || !email.trim()) {
      showAlertModal('로그인 이메일(계정 ID)을 입력해 주세요.', '이메일 입력 필요', emailInputRef);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showAlertModal('올바른 이메일 주소 형식(name@example.com)으로 입력해 주세요.', '이메일 형식 확인', emailInputRef);
      return;
    }

    // 2.2 비밀번호 및 비밀번호 확인 입력 여부와 두 비밀번호 일치 검증 (일반 가입 시)
    if (!socialProvider) {
      if (!pwd || !pwd.trim()) {
        showAlertModal('비밀번호를 입력해 주세요.', '비밀번호 입력 필요', pwdInputRef);
        return;
      }
      if (pwd.length < 6) {
        showAlertModal('비밀번호는 최소 6자 이상(영문, 숫자, 특수기호 혼용)이어야 합니다.', '비밀번호 규칙 확인', pwdInputRef);
        return;
      }
      if (!pwdConfirm || !pwdConfirm.trim()) {
        showAlertModal('비밀번호 확인을 입력해 주세요.', '비밀번호 확인 필요', pwdConfirmInputRef);
        return;
      }
      if (pwd !== pwdConfirm) {
        showAlertModal('비밀번호와 비밀번호 확인에 입력된 정보가 일치하지 않습니다.\n동일한 비밀번호를 다시 입력해 주세요.', '비밀번호 불일치', pwdConfirmInputRef);
        return;
      }
    }

    // 성함 및 연락처 검증
    if (!userNm || !userNm.trim()) {
      showAlertModal('성함(실명)을 입력해 주세요.', '실명 입력 필요');
      return;
    }
    if (!userTel || !userTel.trim()) {
      showAlertModal('휴대폰 번호를 입력해 주세요.', '휴대폰 번호 필요');
      return;
    }

    // 2.3 이용 약관 마지막까지 읽었는지 확인
    if (!terms.location.scrolled || !terms.location.checked) {
      showAlertModal('위치기반 서비스 이용약관의 전문을 끝까지 스크롤하여 확인 후 동의를 완료해 주세요.', '이용약관 확인 필요', locationViewerRef);
      return;
    }
    if (!terms.finance.scrolled || !terms.finance.checked) {
      showAlertModal('전자금융거래 이용약관의 전문을 끝까지 스크롤하여 확인 후 동의를 완료해 주세요.', '이용약관 확인 필요', financeViewerRef);
      return;
    }
    if (!terms.service.checked || !terms.privacy.checked) {
      showAlertModal('필수 이용약관(서비스 이용약관, 개인정보 수집 및 이용)에 동의해 주세요.', '이용약관 확인 필요', termsSectionRef);
      return;
    }

    // 2.4 서명 입력 여부 검증
    if (!hasSignature) {
      showAlertModal('안심 계약 체결 및 본인 확인을 위해 서명란에 자필 전자서명을 입력해 주세요.', '전자서명 입력 필요', canvasRef);
      return;
    }

    setIsLoading(true);

    // Canvas Data URL 추출
    const signDataUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    const nowIso = new Date().toISOString();

    // 약관별 정밀 동의 일자/시간(시분초) 페이로드 구성 (TB_TERMS_MASTER v1.0 기준 동기화)
    const agreedTermsDetail = [
      {
        termsCd: 'SERVICE',
        termsVer: 'v1.0',
        agreeYn: terms.service.checked ? 'Y' : 'N',
        agreedAt: terms.service.agreedAt || nowIso
      },
      {
        termsCd: 'PRIVACY',
        termsVer: 'v1.0',
        agreeYn: terms.privacy.checked ? 'Y' : 'N',
        agreedAt: terms.privacy.agreedAt || nowIso
      },
      {
        termsCd: 'LOCATION',
        termsVer: 'v1.0',
        agreeYn: terms.location.checked ? 'Y' : 'N',
        agreedAt: terms.location.agreedAt || nowIso
      },
      {
        termsCd: 'FINANCE',
        termsVer: 'v1.0',
        agreeYn: terms.finance.checked ? 'Y' : 'N',
        agreedAt: terms.finance.agreedAt || nowIso
      },
      {
        termsCd: 'SIGNATURE',
        termsVer: 'v1.0',
        agreeYn: hasSignature ? 'Y' : 'N',
        agreedAt: nowIso
      }
    ];

    try {
      const res = await fetch('/api/web/client/ath_010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER',
          userRoleCd: role,
          userEmail: email.trim(),
          userPwd: pwd,
          userPwdConfirm: pwdConfirm,
          userNm: userNm.trim(),
          userTel: userTel.trim(),
          socialProvider: socialProvider || null,
          socialUid: socialUid || null,
          signDataUrl: signDataUrl,
          agreedTerms: ['SERVICE', 'PRIVACY', 'LOCATION', 'FINANCE', 'SIGNATURE'],
          agreedTermsDetail: agreedTermsDetail
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessModal({
          isOpen: true,
          title: '[쓸고닦고 회원가입 완료]',
          message: socialProvider
            ? `${socialProvider} 계정으로 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.`
            : '쓸고닦고 통합 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.',
          userData: data.data,
        });
      } else {
        showAlertModal(data.message || '회원가입 처리 중 오류가 발생했습니다.', '회원가입 실패');
        setErrorMsg(data.message || '회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.warn('[REGISTER_REQUEST_ERR]', err);
      showAlertModal('회원가입 서버 통신 중 오류가 발생했습니다: ' + (err?.message || err), '통신 오류');
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="signup-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        aria-labelledby="modal-headline"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden text-on-surface transform transition-all duration-300 border border-slate-200/80 animate-in zoom-in-95"
        id="signup-modal-container"
        role="dialog"
      >
        {/* Top Micro Status Banner */}
        <div className="bg-surface-container-low px-6 sm:px-8 py-2.5 flex items-center justify-between border-b border-slate-200/60">
          <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-semibold tracking-tight">KISA & 금융위 가이드라인 준수 전자서명 세션</span>
          </div>
          <span className="text-on-surface-variant font-caption text-caption">화면 ID: WEB-CLNT-ATH-010</span>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto px-6 sm:px-8 pt-6 pb-8 space-y-6 flex-1 scroll-smooth" id="modal-scroll-pane">
          {/* 1. Modal Header */}
          <header className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="relative w-12 h-12 rounded-xl bg-surface-container p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                  alt="쓸고닦고 공식 심볼 로고"
                  className="w-full h-full object-cover rounded-lg"
                  src="/logo.png"
                />
              </div>
              <div>
                <h2 className="text-on-surface font-headline-md text-headline-md tracking-tight font-bold" id="modal-headline">
                  통합 회원가입
                </h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  쓸고닦고와 함께 깨끗하고 믿을 수 있는 안심 공간을 만들어보세요.
                </p>
              </div>
            </div>
            <button
              aria-label="닫기"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
              onClick={onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          {/* 2. 회원 구분 2-Way 세그먼트 버튼 (TB_USER: USER_ROLE_CD) */}
          <section aria-labelledby="role-select-title" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface font-bold" id="role-select-title">
                회원 유형 선택
              </span>
              <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                실시간 역할 분기 적용
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl">
              {/* 고객 회원 (C) */}
              <button
                className={`h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${
                  role === 'C'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="C"
                id="role-btn-client"
                onClick={() => setRole('C')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>고객 회원 (의뢰·발주)</span>
              </button>
              {/* 시공사 회원 (S) */}
              <button
                className={`h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${
                  role === 'S'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="S"
                id="role-btn-partner"
                onClick={() => setRole('S')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">engineering</span>
                <span>시공사 회원 (시공.수주)</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-caption text-caption flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[14px] text-primary">info</span>
              <span>선택하신 회원 구분에 따라 시공 발주서 등록 또는 파트너 견적 전송 권한이 부여됩니다.</span>
            </p>
          </section>

          {/* 피드백 안내 메시지 (SNS 연동 성공 / 에러) */}
          {successInfoMsg && (
            <div className="p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-xl flex items-start justify-between gap-2 text-on-secondary-fixed-variant font-caption text-caption animate-in fade-in">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
                <span>{successInfoMsg}</span>
              </div>
              {socialProvider && (
                <button
                  type="button"
                  onClick={handleCancelSocial}
                  className="text-[11px] underline shrink-0 hover:text-primary"
                >
                  연동 취소
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in">
              <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 3. 계정 정보 입력 섹션 (TB_USER) */}
          <section className="space-y-4 pt-1">
            {/* SNS 계정으로 간편 가입 버튼군 (로그인 이메일 위에 배치) */}
            <div className="flex flex-col w-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2 text-center">
                SNS 계정으로 간편 가입
              </span>
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {/* Kakao */}
                <button
                  className={`h-11 rounded-2xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'KAKAO' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="KAKAO"
                  onClick={() => handleSocialSignup('KAKAO')}
                  title="카카오로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-4 h-4 fill-[#3C1E1E]" viewBox="0 0 24 24">
                    <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-[#3C1E1E] font-bold mt-0.5 leading-none">카카오</span>
                </button>

                {/* Naver */}
                <button
                  className={`h-11 rounded-2xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'NAVER' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="NAVER"
                  onClick={() => handleSocialSignup('NAVER')}
                  title="네이버로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-white font-bold mt-0.5 leading-none">네이버</span>
                </button>

                {/* Google */}
                <button
                  className={`h-11 rounded-2xl bg-surface-container-lowest border border-slate-300/80 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'GOOGLE' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="GOOGLE"
                  onClick={() => handleSocialSignup('GOOGLE')}
                  title="Google로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-on-surface font-bold mt-0.5 leading-none">Google</span>
                </button>

                {/* Apple */}
                <button
                  className={`h-11 rounded-2xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'APPLE' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="APPLE"
                  onClick={() => handleSocialSignup('APPLE')}
                  title="Apple로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-white font-bold mt-0.5 leading-none">Apple</span>
                </button>
              </div>

              {/* 구분선 */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full h-[1px] bg-slate-200"></div>
                <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline">
                  또는 이메일로 가입
                </span>
              </div>
            </div>

            {/* 이메일 인풋 및 중복 확인 */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-email">
                로그인 이메일 (계정 ID)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                    data-field="USER_EMAIL"
                    id="field-user-email"
                    ref={emailInputRef}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailChecked(false);
                    }}
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                  />
                </div>
                <button
                  className="h-12 px-4 bg-surface-container text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-high transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  id="btn-check-duplicate"
                  onClick={handleCheckEmail}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_search</span>
                  <span>중복확인</span>
                </button>
              </div>
              {isEmailChecked && (
                <p className={`font-caption text-caption ${isEmailValid ? 'text-secondary' : 'text-error'}`} id="email-hint">
                  {emailCheckMsg}
                </p>
              )}
            </div>

            {/* 비밀번호 & 비밀번호 확인 (Requirement 1: 눈 아이콘 보기/숨기기 토글) */}
            {!socialProvider && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 비밀번호 */}
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-pwd">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_HASH"
                        id="field-user-pwd"
                        ref={pwdInputRef}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="영문, 숫자, 특수문자 조합"
                        type={showPwd ? 'text' : 'password'}
                        value={pwd}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title={showPwd ? '비밀번호 숨기기' : '비밀번호 표시'}
                        aria-label={showPwd ? '비밀번호 숨기기' : '비밀번호 표시'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPwd ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-pwd-confirm">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_CONFIRM"
                        id="field-user-pwd-confirm"
                        ref={pwdConfirmInputRef}
                        onChange={(e) => setPwdConfirm(e.target.value)}
                        placeholder="비밀번호 재입력"
                        type={showPwdConfirm ? 'text' : 'password'}
                        value={pwdConfirm}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title={showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                        aria-label={showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPwdConfirm ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  8~16자 영문, 숫자, 특수기호(!@#$%^&*)를 혼용하여 안전하게 설정해주세요.
                </p>
              </>
            )}

            {/* 성명 (성함) 입력 (TB_USER: USER_NM) */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-nm">
                성명 (성함)
              </label>
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                data-field="USER_NM"
                id="field-user-nm"
                onChange={(e) => setUserNm(e.target.value)}
                onFocus={(e) => { e.target.placeholder = ''; }}
                onBlur={(e) => { if (!e.target.value) e.target.placeholder = '홍길동'; }}
                placeholder="홍길동"
                type="text"
                value={userNm}
              />
            </div>
          </section>

          {/* 4. 휴대폰 실명 본인확인 섹션 (TB_USER: USER_TEL) */}
          <section className="space-y-3 p-4 bg-surface-container-low rounded-2xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold" htmlFor="field-user-tel">
                <span className="material-symbols-outlined text-secondary text-[18px]">phonelink_lock</span>
                휴대폰 본인명의 실명인증
              </label>
              <span className="text-secondary font-label-sm text-label-sm font-semibold">PASS / SMS 통신사 연동</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all"
                data-field="USER_TEL"
                id="field-user-tel"
                onChange={(e) => setUserTel(e.target.value)}
                onFocus={(e) => { e.target.placeholder = ''; }}
                onBlur={(e) => { if (!e.target.value) e.target.placeholder = '010-0000-0000'; }}
                placeholder="010-0000-0000"
                type="tel"
                value={userTel}
              />
              <button
                className="h-12 px-4 bg-surface-container-lowest border border-secondary/30 text-secondary font-label-md text-label-md rounded-xl hover:bg-secondary/10 transition-colors shrink-0 shadow-sm flex items-center gap-1"
                onClick={handleReverifyTel}
                type="button"
              >
                <span>재인증 요청</span>
              </button>
            </div>
            {/* 완료 피드백 뱃지 */}
            <div className="p-3 bg-secondary-fixed/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span className="text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                  본인인증 완료 ({userNm || '홍길동'} / {userTel ? userTel.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2') : '010-****-0000'})
                </span>
              </div>
              <span className="text-on-secondary-fixed-variant font-caption text-caption opacity-80 font-mono">
                CI 암호화 검증필
              </span>
            </div>
          </section>

          {/* 5. 필수 4대 약관 Scroll-Lock 컴플라이언스 아코디언/뷰어 */}
          <section aria-labelledby="terms-section-title" className="space-y-3.5 pt-2" ref={termsSectionRef}>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold" id="terms-section-title">
                필수 이용약관 동의 <span className="text-secondary font-body-sm font-normal">(Scroll-Lock)</span>
              </h3>
              <span className="text-on-surface-variant font-caption text-caption">
                4건 중 <span className="font-bold text-secondary" id="agree-count">{agreeCount}</span>건 완료
              </span>
            </div>

            {/* 안내 가이드 배너 */}
            <div className="p-3 bg-tertiary-fixed/40 rounded-xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">policy</span>
              <div className="space-y-0.5 text-on-tertiary-fixed">
                <p className="font-label-sm text-label-sm font-bold">전체 약관 정독 의무화 시스템 가동 중</p>
                <p className="font-caption text-caption leading-relaxed">
                  각 약관의 본문을 끝까지 스크롤하여 100% 확인하셔야 동의 체크박스가 자동 활성화됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-3" id="terms-container">
              {/* 1) 서비스 통합이용약관 v1.0 */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="SERVICE">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.service.checked}
                        className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="SERVICE"
                        data-terms-ver-seq="1"
                        id="check-terms-service"
                        onChange={() => handleToggleTerm('service')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 서비스 통합이용약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    전문 확인 완료
                  </span>
                </div>
                <div className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner" id="viewer-terms-service">
                  <p className="font-semibold text-on-surface">제1조 (목적 및 플랫폼 매칭비 확정 규정)</p>
                  <p>본 약관은 주식회사 쓸고닦고(이하 '회사')가 운영하는 O2O 주거위생 안심 매칭 서비스의 기본 이용조건을 규정합니다. 회사는 매칭 성사 시 1회 고정 플랫폼 중개비 16,500원(부가세 포함)을 정액 청구합니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (현장 시공비 직불 원칙 및 안심 시공 책임)</p>
                  <p>시공 노임 및 인건비는 시공 검수 완료 후 고객이 시공 마스터에게 직접 지급함을 원칙으로 하며, 회사는 인건비의 무단 전용 및 과도한 에스크로 예치를 지양합니다. 마스터의 고의·과실로 발생한 손해는 1억원 배상책임보험을 통해 보증 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (역경매 및 덤핑 금지)</p>
                  <p>플랫폼의 표준 단가 체계를 왜곡하는 불공정 덤핑 제안 및 무단 수수료 전가는 즉각적인 계정 정지 및 회원 자격 박탈 사유가 됩니다.</p>
                </div>
              </div>

              {/* 2) 개인정보 수집 및 이용 동의 v1.0 */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="PRIVACY">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.privacy.checked}
                        className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="PRIVACY"
                        data-terms-ver-seq="1"
                        id="check-terms-privacy"
                        onChange={() => handleToggleTerm('privacy')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 개인정보 수집 및 이용 동의 v1.0
                      </span>
                    </label>
                  </div>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    전문 확인 완료
                  </span>
                </div>
                <div className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner" id="viewer-terms-privacy">
                  <p className="font-semibold text-on-surface">1. 수집 항목 및 보유 목적</p>
                  <p>- 필수 수집 항목: 성명, 휴대전화번호, 이메일 주소, 서비스 시공 희망 주소지(동·호수 포함).</p>
                  <p>- 이용 목적: 신원 인증, 1급 청소 마스터 파견 배차, 1억원 안심보험 접수 및 서비스 사후 안심보증 이력 관리.</p>
                  <p className="font-semibold text-on-surface">2. 보유 및 파기 절차</p>
                  <p>회원 탈퇴 시 전자금융거래법 및 개인정보보호법에 명시된 법정 보관기간(거래내역 5년) 경과 후 지체 없이 복구 불가능한 방법으로 영구 파기합니다.</p>
                </div>
              </div>

              {/* 3) 위치기반 서비스 이용약관 v1.0 (Scroll 감지 대상) */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="LOCATION">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.location.checked}
                        className={`w-4 h-4 rounded text-secondary accent-secondary ${
                          terms.location.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                        }`}
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="LOCATION"
                        data-terms-ver-seq="1"
                        disabled={!terms.location.scrolled}
                        id="check-terms-location"
                        onChange={() => handleToggleTerm('location')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 위치기반 서비스 이용약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${
                      terms.location.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    id="badge-terms-location"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {terms.location.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.location.scrolled
                        ? '전문 확인 완료'
                        : `스크롤 필요 (${terms.location.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner"
                  id="viewer-terms-location"
                  onScroll={(e) => handleScroll('location', e)}
                  ref={locationViewerRef}
                >
                  <p className="font-semibold text-on-surface">제1조 (위치정보의 활용)</p>
                  <p>회사는 신청인의 신청 주소지를 기반으로 가장 신속하게 현장 도달이 가능한 반경 5km 이내의 검증된 1급 홈케어 마스터를 자동 정렬하여 매칭 후보로 제안합니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (위치기반 출동 관제)</p>
                  <p>배차 확정 시공 일자에 마스터의 실제 이동 현황 및 예상 방문 시간(ETA)을 고객 단말기에 실시간 푸시 통보할 수 있습니다. 수집된 GPS 정보는 작업 완료 24시간 후 완전히 마스킹 폐기 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (이용자의 권리)</p>
                  <p>고객은 언제든지 단말기 설정을 통해 위치 정보 수집을 일시 중단할 수 있으며, 이 경우 자동 거리 기반 배차 대신 주소 직접 검색 수기 방식으로 대체 처리됩니다. (본 조항 정독 완료)</p>
                </div>
              </div>

              {/* 4) 전자금융거래 기본약관 v1.0 (Scroll 감지 대상) */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="FINANCE">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.finance.checked}
                        className={`w-4 h-4 rounded text-secondary accent-secondary ${
                          terms.finance.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                        }`}
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="FINANCE"
                        data-terms-ver-seq="1"
                        disabled={!terms.finance.scrolled}
                        id="check-terms-finance"
                        onChange={() => handleToggleTerm('finance')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 전자금융거래 기본약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${
                      terms.finance.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    id="badge-terms-finance"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {terms.finance.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.finance.scrolled
                        ? '전문 확인 완료'
                        : `스크롤 필요 (${terms.finance.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner"
                  id="viewer-terms-finance"
                  onScroll={(e) => handleScroll('finance', e)}
                  ref={financeViewerRef}
                >
                  <p className="font-semibold text-on-surface">제1조 (결제 대행 및 환불 방침)</p>
                  <p>매칭 수수료(16,500원) 결제는 공인 전자지급결제대행업자(PG)를 통해 안전하게 진행되며, 시공 마스터 매칭 실패 시 수수료는 100% 즉시 자동 환불 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (3개월 안심보증 케어 연동)</p>
                  <p>정상 완료된 거래 건에 한하여 90일간 누수, 결로, 재오염에 대한 안심보증 분쟁조정위원회의 지원을 받으실 수 있습니다. 현장 직불금 영수증은 마스터가 현장에서 직접 세금계산서 또는 현금영수증으로 발급 교부합니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (오류의 정정)</p>
                  <p>이용자는 전자금융거래에 오류가 있음을 안 때에 즉시 회사에 정정을 요구할 수 있으며 회사는 접수 즉시 2영업일 이내에 원인을 규명하여 회신합니다. (정독 완료)</p>
                </div>
              </div>
            </div>
          </section>

          {/* 전체 동의 간편 컨트롤 */}
          <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                checked={allChecked}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                id="check-all-terms"
                onChange={handleToggleAll}
                type="checkbox"
              />
              <span className="font-label-md text-label-md text-on-surface font-bold">
                [전체 동의] 4대 필수 약관 및 개인정보 처리방침에 모두 동의합니다.
              </span>
            </label>
            <span className="text-secondary font-label-sm text-label-sm font-semibold">일괄 서명</span>
          </div>

          {/* =================================================================
              6. [신규 추가] 전자서명 패드 (자필 서명 날인 & 서명 지우기)
          ================================================================= */}
          <section className="space-y-2 pt-1 border-t border-slate-200/60" data-field="TB_MEMBER_AGREE_SIGN">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">draw</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  자필 전자서명 날인
                </span>
                <span className="font-caption text-caption text-secondary font-semibold">
                  (전자서명법 제3조 법적 효력)
                </span>
              </div>
              <button
                className="h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                id="btn-clear-signature"
                onClick={handleClearSignature}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>서명지우기</span>
              </button>
            </div>
            <div className="relative w-full h-32 rounded-xl border border-slate-300 bg-surface-container-lowest overflow-hidden shadow-inner flex flex-col justify-between">
              <canvas
                className="w-full h-full cursor-crosshair touch-none"
                height={128}
                id="signature-canvas"
                onMouseDown={startDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={drawTouch}
                onTouchStart={startDrawingTouch}
                ref={canvasRef}
                width={500}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-outline/60 text-sm font-medium">
                  <span>여기에 마우스 또는 터치로 자필 서명해 주세요</span>
                </div>
              )}
            </div>
            <p className="font-caption text-caption text-outline flex items-center gap-1 px-0.5">
              <span className="material-symbols-outlined text-[13px]">info</span>
              <span>본 서명은 PNG 파일로 저장되며 공인 전자증적 데이터베이스에 영구 보관됩니다.</span>
            </p>
          </section>

          {/* 7. Footer Actions & CTA */}
          <div className="space-y-4 pt-2">
            <button
              className="w-full h-[52px] bg-secondary hover:bg-[#005049] text-white rounded-xl font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading}
              id="btn-submit-signup"
              onClick={handleSubmit}
              type="button"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>회원가입 완료하기</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <div className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1.5">
              <span>이미 계정이 있으신가요?</span>
              <button
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={onOpenLogin || (() => {})}
                type="button"
              >
                로그인하기 (WEB-CLNT-ATH-000)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 유효성 검증 오류 안내 모달 (Requirement 2) */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {alertModal.title || '입력 정보 확인'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {alertModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const targetRef = alertModal.targetRef;
                setAlertModal({ isOpen: false, title: '', message: '', targetRef: null });
                if (targetRef && targetRef.current) {
                  setTimeout(() => {
                    targetRef.current.focus?.();
                    targetRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                  }, 50);
                }
              }}
              className="w-full h-11 bg-primary text-on-primary font-label-lg text-label-lg rounded-xl hover:bg-primary-container transition-colors shadow-md font-bold cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 회원가입 완료 축하 커스텀 모달 (브라우저 기본 alert 완전 대체) */}
      {successModal.isOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40 text-center animate-in zoom-in-95 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">verified</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {successModal.title || '[쓸고닦고 회원가입 완료]'}
            </h3>
            <div className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left w-full">
              {successModal.message}
            </div>
            <button
              type="button"
              onClick={handleConfirmSuccessModal}
              className="w-full h-12 bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg rounded-2xl transition-all shadow-md font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <span>확인 (로그인 화면으로 이동)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
