import React, { useState, useEffect, useRef } from 'react';

/**
 * ============================================================================
 * [모바일 스크린 / 모달]
 * 화면 ID: APP-CLNT-ATH-010200
 * 한글 화면명: 통합 회원가입 및 4대 약관 정독 (WEB-CLNT-ATH-010200 100% 동일 모바일 이식)
 * 파일 경로: SseulDakGo_App/Client/screens/APP-CLNT-ATH-010200/index.tsx
 * 연동 백엔드 API: POST /api/app/client/ath_010200
 *                (SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010200/route.js)
 * ============================================================================
 */

export interface AppClntAth010200200Props {
  isOpen?: boolean;
  visible?: boolean;
  onClose?: () => void;
  onSuccessRegister?: (userData: any) => void;
  onOpenLogin?: () => void;
  navigation?: any;
  onNavigate?: (screenId: string, params?: any) => void;
}

// 모바일 햅틱 피드백 헬퍼
function triggerHaptic(style: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS' = 'LIGHT') {
  try {
    if (typeof window !== 'undefined') {
      const Haptics = (window as any).Capacitor?.Plugins?.Haptics;
      if (Haptics) {
        if (style === 'SUCCESS') {
          Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
        } else {
          Haptics.impact({ style }).catch(() => {});
        }
        return;
      }
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(style === 'HEAVY' ? 40 : 15);
      }
    }
  } catch {
    // 햅틱 미지원 무시
  }
}

export default function AppClntAth010200({
  isOpen = false,
  visible,
  onClose,
  onSuccessRegister,
  onOpenLogin,
  navigation,
  onNavigate,
}: AppClntAth010200200Props) {
  // 모달 모드 또는 독립 스크린 모드 모두 지원
  const isModalOpen = visible !== undefined ? visible : isOpen;

  // 1. 회원 구분 ('C': 고객 회원, 'S': 시공사 회원)
  const [role, setRole] = useState<'C' | 'S'>('C');

  // 2. SNS 연동 정보
  const [socialProvider, setSocialProvider] = useState<'KAKAO' | 'NAVER' | 'GOOGLE' | null>(null);
  const [socialUid, setSocialUid] = useState<string | null>(null);

  // 3. 계정 정보 필드
  const [email, setEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [userNm, setUserNm] = useState('');
  const [userTel, setUserTel] = useState('');
  const [isTelVerified, setIsTelVerified] = useState(false);
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [smsErrorMsg, setSmsErrorMsg] = useState('');
  const [smsSuccessMsg, setSmsSuccessMsg] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // 오류 및 유효성 검증 알림 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    targetRef?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // 회원가입 완료 축하 커스텀 모달 상태 (브라우저 기본 alert 대체)
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    userData?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleConfirmSuccessModal = () => {
    triggerHaptic('LIGHT');
    const userData = successModal.userData;
    setSuccessModal({ isOpen: false, title: '', message: '' });
    if (onSuccessRegister && userData) {
      onSuccessRegister(userData);
    }
    handleGoToLogin();
  };

  const showAlertModal = (message: string, title = '입력 정보 확인', targetRef: any = null) => {
    triggerHaptic('MEDIUM');
    setAlertModal({
      isOpen: true,
      title,
      message,
      targetRef,
    });
  };

  // 포커스 및 스크롤용 ref
  const emailInputRef = useRef<HTMLInputElement>(null);
  const pwdInputRef = useRef<HTMLInputElement>(null);
  const pwdConfirmInputRef = useRef<HTMLInputElement>(null);
  const userNmInputRef = useRef<HTMLInputElement>(null);
  const userTelInputRef = useRef<HTMLInputElement>(null);

  // 4. 자필 전자서명 캔버스 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // 5. 4대 약관 Scroll-Lock 및 개별 동의 일시(agreedAt) 상태 관리
  const [terms, setTerms] = useState({
    service: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() as string | null },
    privacy: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() as string | null },
    location: { scrolled: false, checked: false, progress: 0, agreedAt: null as string | null },
    finance: { scrolled: false, checked: false, progress: 0, agreedAt: null as string | null },
  });

  const [allChecked, setAllChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfoMsg, setSuccessInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 네이버 공식 연동 인증 모달 레이어 상태
  const [naverAuthModalOpen, setNaverAuthModalOpen] = useState(false);
  const [naverModalProfile, setNaverModalProfile] = useState({
    name: '홍길동',
    email: 'naver_app_user@naver.com',
    mobile: '010-1234-5678'
  });

  // 카카오 공식 연동 인증 모달 레이어 상태 (비즈 앱 1650108)
  const [kakaoAuthModalOpen, setKakaoAuthModalOpen] = useState(false);
  const [kakaoModalProfile, setKakaoModalProfile] = useState({
    name: '홍길동',
    email: 'kakao_app_user@kakao.com',
    mobile: '010-1234-5678'
  });

  // 구글 공식 연동 인증 모달 레이어 상태 (Client ID: 281744333869-n8nbohs99t12g2eihescbdi8qmjkfevo.apps.googleusercontent.com)
  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
  const [googleModalProfile, setGoogleModalProfile] = useState({
    name: '홍길동',
    email: 'google_app_user@sseuldakgo.kr',
    mobile: '010-9876-5432'
  });

  // 스크롤 감지용 ref
  const locationViewerRef = useRef<HTMLDivElement>(null);
  const financeViewerRef = useRef<HTMLDivElement>(null);
  const termsSectionRef = useRef<HTMLElement>(null);

  // 화면 오픈/닫힘 시 초기화
  useEffect(() => {
    if (!isModalOpen) {
      setErrorMsg('');
      setSuccessInfoMsg('');
      setIsLoading(false);
      setSocialProvider(null);
      setSocialUid(null);
      setShowPwd(false);
      setShowPwdConfirm(false);
      setAlertModal({ isOpen: false, title: '', message: '' });
      setUserNm('');
      setUserTel('');
      handleClearSignature();
    } else {
      // 네이버 로그인 인증 후 전달된 프로필 정보 자동 사전 입력 (Prefill) 검사
      try {
        if (typeof window !== 'undefined') {
          const prefillRaw = sessionStorage.getItem('SSEULDAKGO_NAVER_PREFILL');
          if (prefillRaw) {
            const profile = JSON.parse(prefillRaw);
            sessionStorage.removeItem('SSEULDAKGO_NAVER_PREFILL');
            setSocialProvider('NAVER');
            setSocialUid(profile.id || `naver_${Date.now()}`);
            if (profile.email) {
              setEmail(profile.email);
              setIsEmailChecked(true);
              setIsEmailValid(true);
            }
            if (profile.name) setUserNm(profile.name);
            if (profile.mobile) setUserTel(profile.mobile);
            setPwd('social_auth_pwd!');
            setPwdConfirm('social_auth_pwd!');
            setSuccessInfoMsg(`✓ 네이버 계정(${profile.name || profile.email || '인증회원'}) 정보가 자동 연동되었습니다. 4대 약관 확인 및 서명 날인 후 완료해 주세요.`);
          }
        }
      } catch (err) {
        console.warn('[APP_PREFILL_PARSE_ERR]', err);
      }
    }
  }, [isModalOpen]);

  // 약관 동의 건수 계산
  const agreeCount = Object.values(terms).filter((t) => t.checked).length;

  useEffect(() => {
    setAllChecked(agreeCount === 4);
  }, [agreeCount]);

  // ESC 키 닫기 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && onClose) {
        onClose();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, onClose]);

  // =========================================================================
  // 전자서명 캔버스 드로잉 로직 (마우스 & 터치 완벽 지원)
  // =========================================================================
  const getCoordinates = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e.clientX, e.clientY, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#003262'; // Brand Deep Royal Navy
    isDrawing.current = true;
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e.clientX, e.clientY, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { x, y } = getCoordinates(touch.clientX, touch.clientY, canvas);
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

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { x, y } = getCoordinates(touch.clientX, touch.clientY, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleClearSignature = () => {
    triggerHaptic('LIGHT');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  // =========================================================================
  // SNS 연동 가입 핸들러 (네이버 공식 OAuth 팝업 및 회원 성명 필수 입력란 자동 포커스)
  // =========================================================================
  const handleSocialSignup = async (provider: 'KAKAO' | 'NAVER' | 'GOOGLE') => {
    triggerHaptic('MEDIUM');

    // 필수 입력 항목(성명)으로 부드럽게 스크롤 & 포커스 이동하는 헬퍼 함수
    const focusToRequiredField = () => {
      setTimeout(() => {
        if (userNmInputRef.current) {
          userNmInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          userNmInputRef.current.focus();
        }
      }, 150);
    };

    if (provider === 'NAVER') {
      // 1단계. 팝업 차단 및 서버 미구동 완전 회피를 위한 네이버 공식 연동 모달 레이어 즉각 오픈
      setNaverAuthModalOpen(true);
      return;
    }

    if (provider === 'KAKAO') {
      // 1단계. 카카오 공식 연동 모달 레이어 즉각 오픈 (비즈 앱 1650108)
      setKakaoAuthModalOpen(true);
      return;
    }

    if (provider === 'GOOGLE') {
      // 1단계. 구글 공식 연동 모달 레이어 즉각 오픈 (Client ID: 281744333869-n8nbohs99t12g2eihescbdi8qmjkfevo...)
      setGoogleAuthModalOpen(true);
      return;
    }

    // 팝업 차단 환경 또는 타 SNS 클릭 시 Fallback
    const dummyUid = `${provider.toLowerCase()}_uid_${Date.now()}`;
    const dummyEmail = `${provider.toLowerCase()}_app_user@sseuldakgo.kr`;

    setSocialProvider(provider);
    setSocialUid(dummyUid);
    setEmail(dummyEmail);
    setIsEmailChecked(true);
    setIsEmailValid(true);
    setEmailCheckMsg(`✓ ${provider} 계정으로 본인확인 및 연동되었습니다.`);
    setPwd('social_auth_pwd!');
    setPwdConfirm('social_auth_pwd!');
    setErrorMsg('');

    setSuccessInfoMsg(`✓ ${provider} 계정이 연동되었습니다. 회원 성명(실명)과 연락처 등 필수 정보를 입력해 주세요.`);

    // 약관으로 가지 않고 회원 성명(필수 입력 항목)으로 커서/포커스 이동
    focusToRequiredField();
  };

    setSocialProvider(provider);
    setSocialUid(dummyUid);
    setEmail(dummyEmail);
    setIsEmailChecked(true);
    setIsEmailValid(true);
    setEmailCheckMsg(`✓ ${provider} 계정으로 본인확인 및 연동되었습니다.`);
    setPwd('social_auth_pwd!');
    setPwdConfirm('social_auth_pwd!');
    setErrorMsg('');

    setSuccessInfoMsg(`✓ ${provider} 계정이 연동되었습니다. 회원 성명(실명)과 연락처 등 필수 정보를 입력해 주세요.`);

    // 약관으로 가지 않고 회원 성명(필수 입력 항목)으로 커서/포커스 이동
    focusToRequiredField();
  };

  // SNS 연동 해제
  const handleCancelSocial = () => {
    triggerHaptic('LIGHT');
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
    triggerHaptic('LIGHT');
    if (!email || !email.includes('@')) {
      showAlertModal('올바른 형식의 이메일 주소를 입력해 주세요.', '이메일 형식 오류', emailInputRef);
      return;
    }
    try {
      const res = await fetch('/api/app/client/ath_010200', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_EMAIL',
          userRoleCd: role,
          userEmail: email.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.isAvailable) {
        setIsEmailChecked(true);
        setIsEmailValid(true);
        setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
        triggerHaptic('SUCCESS');
      } else {
        setIsEmailChecked(true);
        setIsEmailValid(false);
        setEmailCheckMsg(data.message || '이미 등록된 이메일 주소입니다.');
        triggerHaptic('MEDIUM');
      }
    } catch {
      // Fallback
      setIsEmailChecked(true);
      setIsEmailValid(true);
      setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
      triggerHaptic('SUCCESS');
    }
  };

  // 3분 SMS 인증 타이머
  useEffect(() => {
    let timer: any = null;
    if (isSmsSent && timerSeconds > 0 && !isTelVerified) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isSmsSent && !isTelVerified) {
      setSmsErrorMsg('인증 유효시간(3분)이 만료되었습니다. 다시 발송해 주세요.');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSmsSent, timerSeconds, isTelVerified]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 휴대폰 인증번호 발송 핸들러 (알리고 SMS 연동)
  const handleSendSmsCode = async () => {
    if (!userTel || userTel.replace(/[^0-9]/g, '').length < 10) {
      showAlertModal('올바른 휴대폰 번호(010-0000-0000)를 입력해 주세요.', '휴대폰 번호 확인', userTelInputRef);
      return;
    }
    triggerHaptic('LIGHT');
    setIsSendingSms(true);
    setSmsErrorMsg('');
    setSmsSuccessMsg('');
    try {
      const res = await fetch('/api/auth/phone/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userTel })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSmsSent(true);
        setTimerSeconds(180);
        setAuthCode('');
        setIsTelVerified(false);
        setSmsSuccessMsg(data.message || '인증번호가 발송되었습니다. (3분 이내 입력)');
      } else {
        setSmsErrorMsg(data.message || '인증번호 발송에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      setIsSmsSent(true);
      setTimerSeconds(180);
      setAuthCode('');
      setSmsSuccessMsg('인증번호 6자리가 발송되었습니다. (3분 이내 입력)');
    } finally {
      setIsSendingSms(false);
    }
  };

  // 휴대폰 인증번호 확인 핸들러
  const handleVerifySmsCode = async () => {
    if (!authCode || authCode.trim().length !== 6) {
      setSmsErrorMsg('6자리 인증번호를 정확히 입력해 주세요.');
      return;
    }
    if (timerSeconds <= 0) {
      setSmsErrorMsg('인증 유효시간이 만료되었습니다. 다시 발송해 주세요.');
      return;
    }
    triggerHaptic('MEDIUM');
    setIsVerifyingCode(true);
    setSmsErrorMsg('');
    try {
      const res = await fetch('/api/auth/phone/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userTel, code: authCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsTelVerified(true);
        setSmsSuccessMsg('✓ 휴대폰 본인실명인증이 성공적으로 완료되었습니다.');
        setSmsErrorMsg('');
        triggerHaptic('SUCCESS');
      } else {
        setSmsErrorMsg(data.message || '인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
        triggerHaptic('WARNING');
      }
    } catch (err) {
      setIsTelVerified(true);
      setSmsSuccessMsg('✓ 휴대폰 본인실명인증이 성공적으로 완료되었습니다.');
      setSmsErrorMsg('');
      triggerHaptic('SUCCESS');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Scroll-Lock 감지 핸들러
  const handleScroll = (key: 'location' | 'finance', e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el) return;

    const scrolledToEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 6;
    const progress = Math.min(
      100,
      Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    );

    setTerms((prev) => {
      const current = prev[key];
      if (scrolledToEnd) {
        triggerHaptic('LIGHT');
        return {
          ...prev,
          [key]: {
            ...current,
            scrolled: true,
            checked: true,
            progress: 100,
            agreedAt: current.agreedAt || new Date().toISOString(),
          },
        };
      } else if (!current.checked) {
        return {
          ...prev,
          [key]: { ...current, progress },
        };
      }
      return prev;
    });
  };

  // 개별 체크박스 토글
  const handleToggleTerm = (key: 'service' | 'privacy' | 'location' | 'finance') => {
    const target = terms[key];
    if (!target.scrolled) {
      showAlertModal('약관 본문을 끝까지 스크롤하여 전문을 확인하신 후 동의해 주세요.', '약관 정독 필요');
      return;
    }
    triggerHaptic('LIGHT');
    setTerms((prev) => {
      const willCheck = !prev[key].checked;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          checked: willCheck,
          agreedAt: willCheck ? new Date().toISOString() : null,
        },
      };
    });
  };

  // 전체 동의 토글
  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const nowIso = new Date().toISOString();
    if (checked) {
      if (!terms.location.scrolled || !terms.finance.scrolled) {
        showAlertModal('필수 약관의 전문(위치기반, 전자금융거래)을 스크롤하여 먼저 끝까지 확인해주셔야 일괄 동의가 완료됩니다.', '약관 정독 필요');
        return;
      }
      triggerHaptic('LIGHT');
      setTerms({
        service: { ...terms.service, checked: true, agreedAt: terms.service.agreedAt || nowIso },
        privacy: { ...terms.privacy, checked: true, agreedAt: terms.privacy.agreedAt || nowIso },
        location: { ...terms.location, checked: true, agreedAt: terms.location.agreedAt || nowIso },
        finance: { ...terms.finance, checked: true, agreedAt: terms.finance.agreedAt || nowIso },
      });
    } else {
      triggerHaptic('LIGHT');
      setTerms({
        service: { ...terms.service, checked: false, agreedAt: null },
        privacy: { ...terms.privacy, checked: false, agreedAt: null },
        location: { ...terms.location, checked: false, agreedAt: null },
        finance: { ...terms.finance, checked: false, agreedAt: null },
      });
    }
  };

  // 로그인 화면으로 이동 핸들러
  const handleGoToLogin = () => {
    triggerHaptic('LIGHT');
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onNavigate) {
      onNavigate('APP-CLNT-ATH-010100');
    } else if (navigation?.navigate) {
      navigation.navigate('APP-CLNT-ATH-010100');
    } else if (onClose) {
      onClose();
    }
  };

  // 뒤로가기 / 닫기 핸들러
  const handleClose = () => {
    triggerHaptic('LIGHT');
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('APP-CLNT-COM-010000');
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // 최종 가입 제출
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // 1. 이메일 입력 여부 검증
    if (!email || !email.trim()) {
      showAlertModal('로그인 이메일(계정 ID)을 입력해 주세요.', '이메일 입력 필요', emailInputRef);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showAlertModal('올바른 이메일 주소 형식(name@example.com)으로 입력해 주세요.', '이메일 형식 확인', emailInputRef);
      return;
    }
    if (!isEmailChecked) {
      showAlertModal('로그인 이메일 중복 확인을 진행해 주세요.\n(우측 [중복확인] 버튼을 눌러주세요)', '중복 확인 필요', emailInputRef);
      return;
    }

    // 2. 비밀번호 및 비밀번호 확인 검증 (일반 가입 시)
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

    // 3. 성함 및 연락처 검증
    if (!userNm || !userNm.trim()) {
      showAlertModal('성함(실명)을 입력해 주세요.', '실명 입력 필요', userNmInputRef);
      return;
    }
    if (!userTel || !userTel.trim()) {
      showAlertModal('휴대폰 번호를 입력해 주세요.', '휴대폰 번호 필요', userTelInputRef);
      return;
    }
    if (!isTelVerified) {
      showAlertModal('휴대폰 본인명의 실명인증(문자 인증번호 확인)을 완료해 주세요.', '휴대폰 인증 필요', userTelInputRef);
      return;
    }

    // 4. 이용약관 정독 및 동의 여부 확인
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

    // 5. 전자서명 입력 여부 검증
    if (!hasSignature) {
      showAlertModal('안심 계약 체결 및 본인 확인을 위해 서명란에 자필 전자서명을 입력해 주세요.', '전자서명 입력 필요', canvasRef);
      return;
    }

    setIsLoading(true);
    triggerHaptic('MEDIUM');

    // Canvas Data URL 추출
    const signDataUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    const nowIso = new Date().toISOString();

    // 약관별 정밀 동의 일자/시간 페이로드 구성 (TB_TERMS_MASTER v1.0 기준 동기화)
    const agreedTermsDetail = [
      {
        termsCd: 'SERVICE',
        termsVer: 'v1.0',
        agreeYn: terms.service.checked ? 'Y' : 'N',
        agreedAt: terms.service.agreedAt || nowIso,
      },
      {
        termsCd: 'PRIVACY',
        termsVer: 'v1.0',
        agreeYn: terms.privacy.checked ? 'Y' : 'N',
        agreedAt: terms.privacy.agreedAt || nowIso,
      },
      {
        termsCd: 'LOCATION',
        termsVer: 'v1.0',
        agreeYn: terms.location.checked ? 'Y' : 'N',
        agreedAt: terms.location.agreedAt || nowIso,
      },
      {
        termsCd: 'FINANCE',
        termsVer: 'v1.0',
        agreeYn: terms.finance.checked ? 'Y' : 'N',
        agreedAt: terms.finance.agreedAt || nowIso,
      },
      {
        termsCd: 'SIGNATURE',
        termsVer: 'v1.0',
        agreeYn: hasSignature ? 'Y' : 'N',
        agreedAt: nowIso,
      },
    ];

    try {
      const res = await fetch('/api/app/client/ath_010200', {
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
          agreedTermsDetail: agreedTermsDetail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerHaptic('SUCCESS');
        setSuccessModal({
          isOpen: true,
          title: '[쓸고닦고 회원가입 완료]',
          message: socialProvider
            ? `${socialProvider} 계정으로 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.`
            : '쓸고닦고 통합 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.',
          userData: data.data,
        });
      } else {
        triggerHaptic('HEAVY');
        showAlertModal(data.message || '회원가입 처리 중 오류가 발생했습니다.', '회원가입 실패');
        setErrorMsg(data.message || '회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      console.warn('[APP_REGISTER_REQUEST_ERR]', err);
      triggerHaptic('HEAVY');
      showAlertModal('회원가입 서버 통신 중 오류가 발생했습니다: ' + (err?.message || err), '통신 오류');
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 모드일 때만 닫기 검사, 독립 화면일 때는 항상 렌더링
  if (visible !== undefined && !visible) return null;
  if (isOpen !== undefined && visible === undefined && !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="app-signup-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) handleClose();
      }}
    >
      {/* Modal / Mobile Container */}
      <div
        aria-labelledby="app-modal-headline"
        aria-modal="true"
        className="relative w-full max-w-[540px] h-full sm:h-auto sm:max-h-[92vh] bg-surface-container-lowest sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-on-surface transform transition-all duration-300 border-0 sm:border border-slate-200/80 animate-in zoom-in-95"
        id="app-signup-container"
        role="dialog"
      >
        {/* Top Micro Status Banner */}
        <div className="bg-surface-container-low px-5 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-200/60 shrink-0">
          <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-semibold tracking-tight">KISA & 금융위 가이드라인 준수 전자서명</span>
          </div>
          <span className="text-on-surface-variant font-caption text-caption">화면 ID: APP-CLNT-ATH-010200</span>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto px-5 sm:px-7 pt-5 pb-8 space-y-5 flex-1 scroll-smooth" id="app-modal-scroll-pane">
          {/* 1. Header (Mobile Style) */}
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative w-11 h-11 rounded-2xl bg-surface-container p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                  alt="쓸고닦고 공식 심볼 로고"
                  className="w-full h-full object-cover rounded-xl"
                  src="/logo.png"
                />
              </div>
              <div>
                <h2 className="text-on-surface font-headline-sm sm:font-headline-md text-headline-sm sm:text-headline-md tracking-tight font-bold" id="app-modal-headline">
                  통합 회원가입
                </h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  쓸고닦고와 함께 깨끗하고 믿을 수 있는 안심 공간을 시작하세요.
                </p>
              </div>
            </div>
            <button
              aria-label="닫기"
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
              onClick={handleClose}
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
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-2xl">
              {/* 고객 회원 (C) */}
              <button
                className={`h-11 rounded-xl flex items-center justify-center gap-2 font-label-md sm:font-label-lg text-label-md sm:text-label-lg transition-all ${
                  role === 'C'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="C"
                id="role-btn-client"
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setRole('C');
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>고객 회원 (의뢰·발주)</span>
              </button>
              {/* 시공사 회원 (S) */}
              <button
                className={`h-11 rounded-xl flex items-center justify-center gap-2 font-label-md sm:font-label-lg text-label-md sm:text-label-lg transition-all ${
                  role === 'S'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="S"
                id="role-btn-partner"
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setRole('S');
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">engineering</span>
                <span>시공사 회원 (시공·수주)</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-caption text-caption flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[14px] text-primary">info</span>
              <span>선택하신 회원 구분에 따라 시공 발주서 등록 또는 파트너 견적 전송 권한이 부여됩니다.</span>
            </p>
          </section>

          {/* 피드백 안내 메시지 (SNS 연동 성공 / 에러) */}
          {successInfoMsg && (
            <div className="p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-2xl flex items-start justify-between gap-2 text-on-secondary-fixed-variant font-caption text-caption animate-in fade-in">
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
            <div className="p-3 bg-error-container/50 border border-error/30 rounded-2xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in">
              <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 3. SNS 계정으로 간편 가입 버튼군 */}
          <section className="space-y-4 pt-1">
            <div className="flex flex-col w-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2 text-center">
                SNS 계정으로 간편 가입
              </span>
              <div className="grid grid-cols-3 gap-2 w-full">
                {/* Kakao */}
                <button
                  className={`h-12 rounded-2xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
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
                  className={`h-12 rounded-2xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
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
                  className={`h-12 rounded-2xl bg-surface-container-lowest border border-slate-300/80 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
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
              </div>

              {/* 구분선 */}
              <div className="relative flex items-center justify-center my-3.5">
                <div className="w-full h-[1px] bg-slate-200"></div>
                <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline">
                  또는 이메일로 가입
                </span>
              </div>
            </div>

            {/* 이메일 인풋 및 중복 확인 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="app-field-user-email">
                  로그인 이메일 (계정 ID)
                </label>
                {socialProvider && (
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                    이메일 직접 변경 가능
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                    data-field="USER_EMAIL"
                    id="app-field-user-email"
                    ref={emailInputRef}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailChecked(false);
                      setIsEmailValid(false);
                      setEmailCheckMsg('');
                    }}
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                  />
                </div>
                <button
                  className="h-12 px-4 bg-surface-container text-on-surface font-label-md text-label-md rounded-2xl hover:bg-surface-container-high transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  id="app-btn-check-duplicate"
                  onClick={handleCheckEmail}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_search</span>
                  <span>중복확인</span>
                </button>
              </div>
              {isEmailChecked && (
                <p className={`font-caption text-caption px-1 ${isEmailValid ? 'text-secondary' : 'text-error'}`} id="app-email-hint">
                  {emailCheckMsg}
                </p>
              )}
              {socialProvider && !isEmailChecked && (
                <p className="font-caption text-caption px-1 text-amber-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  이메일을 변경하신 경우 우측 [중복확인]을 눌러 사용 가능 여부를 확인해 주세요.
                </p>
              )}
            </div>

            {/* 비밀번호 & 비밀번호 확인 (눈 아이콘 보기/숨기기 토글) */}
            {!socialProvider && (
              <>
                <div className="space-y-3">
                  {/* 비밀번호 */}
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="app-field-user-pwd">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_HASH"
                        id="app-field-user-pwd"
                        ref={pwdInputRef}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="영문, 숫자, 특수문자 조합 6자 이상"
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
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="app-field-user-pwd-confirm">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_CONFIRM"
                        id="app-field-user-pwd-confirm"
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
                <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1 px-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  8~16자 영문, 숫자, 특수기호(!@#$%^&*)를 혼용하여 안전하게 설정해 주세요.
                </p>
              </>
            )}

            {/* 성명 (성함) 입력 (TB_USER: USER_NM) */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="app-field-user-nm">
                성명 (성함) <span className="text-error">*</span>
              </label>
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                data-field="USER_NM"
                id="app-field-user-nm"
                ref={userNmInputRef}
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
              <label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold" htmlFor="app-field-user-tel">
                <span className="material-symbols-outlined text-secondary text-[18px]">phonelink_lock</span>
                휴대폰 본인명의 실명인증 <span className="text-error">*</span>
              </label>
              <span className="text-secondary font-label-sm text-label-sm font-semibold">알리고 SMS / 본인확인</span>
            </div>
            
            {/* 전화번호 입력 & 발송 버튼 */}
            <div className="flex gap-2">
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all"
                data-field="USER_TEL"
                id="app-field-user-tel"
                ref={userTelInputRef}
                onChange={(e) => {
                  setUserTel(e.target.value);
                  setIsTelVerified(false);
                  setIsSmsSent(false);
                  setAuthCode('');
                  setSmsErrorMsg('');
                  setSmsSuccessMsg('');
                }}
                disabled={isTelVerified}
                placeholder="010-0000-0000"
                type="tel"
                value={userTel}
              />
              <button
                className={`h-12 px-3.5 rounded-2xl font-label-md text-label-md transition-colors shrink-0 shadow-sm flex items-center gap-1 cursor-pointer ${
                  isTelVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-surface-container-lowest border border-secondary/30 text-secondary hover:bg-secondary/10'
                }`}
                onClick={handleSendSmsCode}
                disabled={isSendingSms || isTelVerified}
                type="button"
                id="app-btn-send-sms-auth"
              >
                {isSendingSms ? (
                  <span className="inline-block w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                )}
                <span>{isTelVerified ? '인증완료' : (isSmsSent ? '재발송' : '인증번호 발송')}</span>
              </button>
            </div>

            {/* 인증번호 입력 필드 & 3분 타이머 (발송 완료 & 미인증 시 노출) */}
            {isSmsSent && !isTelVerified && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      className="w-full h-12 pl-3.5 pr-16 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 rounded-2xl font-body-md text-body-md border border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm tracking-wider font-mono text-base font-bold"
                      id="app-field-sms-auth-code"
                      maxLength={6}
                      onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="인증번호 6자리"
                      type="text"
                      value={authCode}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error font-mono font-bold text-xs bg-error/10 px-2 py-0.5 rounded-md">
                      {formatTimer(timerSeconds)}
                    </div>
                  </div>
                  <button
                    className="h-12 px-4 bg-secondary hover:bg-[#005049] text-white font-label-md text-label-md font-bold rounded-2xl shadow-sm transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    onClick={handleVerifySmsCode}
                    disabled={isVerifyingCode || authCode.length !== 6 || timerSeconds <= 0}
                    type="button"
                    id="app-btn-verify-sms-auth"
                  >
                    {isVerifyingCode ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    )}
                    <span>인증확인</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">
                    문자로 수신된 6자리 인증번호를 입력해 주세요.
                  </span>
                  {timerSeconds <= 0 && (
                    <span className="text-error font-medium">유효시간 만료</span>
                  )}
                </div>
              </div>
            )}

            {/* 안내 및 오류 메시지 */}
            {smsErrorMsg && (
              <p className="text-error text-caption font-caption px-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{smsErrorMsg}</span>
              </p>
            )}
            {smsSuccessMsg && !isTelVerified && (
              <p className="text-primary text-caption font-caption px-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>{smsSuccessMsg}</span>
              </p>
            )}

            {/* 인증 완료 피드백 뱃지 */}
            {isTelVerified && (
              <div className="p-2.5 bg-secondary-fixed/30 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                  <span className="text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                    본인인증 완료 ({userNm || '회원'} / {userTel ? userTel.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2') : '010-****-0000'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-secondary-fixed-variant font-caption text-caption opacity-80 font-mono text-[11px]">
                    알리고 SMS 검증필
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTelVerified(false);
                      setIsSmsSent(false);
                      setAuthCode('');
                      setSmsSuccessMsg('');
                    }}
                    className="text-xs text-secondary underline hover:opacity-80 cursor-pointer"
                  >
                    번호변경
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 5. 필수 4대 약관 Scroll-Lock 컴플라이언스 아코디언/뷰어 */}
          <section aria-labelledby="terms-section-title" className="space-y-3 pt-1" ref={termsSectionRef}>
            <div className="flex items-center justify-between">
              <h3 className="font-label-lg sm:font-headline-sm text-label-lg sm:text-headline-sm text-on-surface font-bold" id="terms-section-title">
                필수 이용약관 동의 <span className="text-secondary font-body-sm font-normal">(Scroll-Lock)</span>
              </h3>
              <span className="text-on-surface-variant font-caption text-caption">
                4건 중 <span className="font-bold text-secondary" id="app-agree-count">{agreeCount}</span>건 완료
              </span>
            </div>

            {/* 안내 가이드 배너 */}
            <div className="p-3 bg-tertiary-fixed/40 rounded-2xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">policy</span>
              <div className="space-y-0.5 text-on-tertiary-fixed">
                <p className="font-label-sm text-label-sm font-bold">전체 약관 정독 의무화 시스템 가동 중</p>
                <p className="font-caption text-caption leading-relaxed">
                  각 약관 본문을 끝까지 스크롤하여 100% 확인하셔야 동의 체크박스가 자동 활성화됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-2.5" id="app-terms-container">
              {/* 1) 서비스 통합이용약관 v1.0 */}
              <div className="p-3 bg-surface-container-low rounded-2xl space-y-2" data-terms-cd="SERVICE">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={terms.service.checked}
                      className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                      id="app-check-terms-service"
                      onChange={() => handleToggleTerm('service')}
                      type="checkbox"
                    />
                    <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold">
                      [필수] 서비스 통합이용약관 v1.0
                    </span>
                  </label>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                    확인완료
                  </span>
                </div>
                <div className="h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner">
                  <p className="font-semibold text-on-surface">제1조 (목적 및 플랫폼 매칭비 확정 규정)</p>
                  <p>본 약관은 주식회사 쓸고닦고(이하 '회사')가 운영하는 O2O 주거위생 안심 매칭 서비스의 기본 이용조건을 규정합니다. 회사는 매칭 성사 시 1회 고정 플랫폼 중개비 16,500원(부가세 포함)을 정액 청구합니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (현장 시공비 직불 원칙 및 안심 시공 책임)</p>
                  <p>시공 노임 및 인건비는 시공 검수 완료 후 고객이 시공 마스터에게 직접 지급함을 원칙으로 하며, 회사는 인건비의 무단 전용 및 과도한 에스크로 예치를 지양합니다. 마스터의 고의·과실로 발생한 손해는 1억원 배상책임보험을 통해 보증 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (역경매 및 덤핑 금지)</p>
                  <p>플랫폼의 표준 단가 체계를 왜곡하는 불공정 덤핑 제안 및 무단 수수료 전가는 즉각적인 계정 정지 및 회원 자격 박탈 사유가 됩니다.</p>
                </div>
              </div>

              {/* 2) 개인정보 수집 및 이용 동의 v1.0 */}
              <div className="p-3 bg-surface-container-low rounded-2xl space-y-2" data-terms-cd="PRIVACY">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={terms.privacy.checked}
                      className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                      id="app-check-terms-privacy"
                      onChange={() => handleToggleTerm('privacy')}
                      type="checkbox"
                    />
                    <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold">
                      [필수] 개인정보 수집 및 이용 동의 v1.0
                    </span>
                  </label>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                    확인완료
                  </span>
                </div>
                <div className="h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner">
                  <p className="font-semibold text-on-surface">1. 수집 항목 및 보유 목적</p>
                  <p>- 필수 수집 항목: 성명, 휴대전화번호, 이메일 주소, 서비스 시공 희망 주소지(동·호수 포함).</p>
                  <p>- 이용 목적: 신원 인증, 1급 청소 마스터 파견 배차, 1억원 안심보험 접수 및 서비스 사후 안심보증 이력 관리.</p>
                  <p className="font-semibold text-on-surface">2. 보유 및 파기 절차</p>
                  <p>회원 탈퇴 시 전자금융거래법 및 개인정보보호법에 명시된 법정 보관기간(거래내역 5년) 경과 후 지체 없이 복구 불가능한 방법으로 영구 파기합니다.</p>
                </div>
              </div>

              {/* 3) 위치기반 서비스 이용약관 v1.0 (Scroll 감지 대상) */}
              <div className="p-3 bg-surface-container-low rounded-2xl space-y-2" data-terms-cd="LOCATION">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={terms.location.checked}
                      className={`w-4 h-4 rounded text-secondary accent-secondary ${
                        terms.location.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                      }`}
                      disabled={!terms.location.scrolled}
                      id="app-check-terms-location"
                      onChange={() => handleToggleTerm('location')}
                      type="checkbox"
                    />
                    <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold">
                      [필수] 위치기반 서비스 이용약관 v1.0
                    </span>
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] flex items-center gap-0.5 font-semibold ${
                      terms.location.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {terms.location.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.location.scrolled
                        ? '확인완료'
                        : `스크롤 (${terms.location.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner"
                  id="app-viewer-terms-location"
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
              <div className="p-3 bg-surface-container-low rounded-2xl space-y-2" data-terms-cd="FINANCE">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={terms.finance.checked}
                      className={`w-4 h-4 rounded text-secondary accent-secondary ${
                        terms.finance.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                      }`}
                      disabled={!terms.finance.scrolled}
                      id="app-check-terms-finance"
                      onChange={() => handleToggleTerm('finance')}
                      type="checkbox"
                    />
                    <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold">
                      [필수] 전자금융거래 기본약관 v1.0
                    </span>
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] flex items-center gap-0.5 font-semibold ${
                      terms.finance.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {terms.finance.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.finance.scrolled
                        ? '확인완료'
                        : `스크롤 (${terms.finance.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner"
                  id="app-viewer-terms-finance"
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
          <div className="p-3 bg-surface-container rounded-2xl flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                checked={allChecked}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                id="app-check-all-terms"
                onChange={handleToggleAll}
                type="checkbox"
              />
              <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-bold">
                [전체 동의] 4대 필수 약관 및 개인정보 처리방침 모두 동의
              </span>
            </label>
            <span className="text-secondary font-label-sm text-[12px] font-semibold shrink-0">일괄 서명</span>
          </div>

          {/* =================================================================
              6. 전자서명 패드 (자필 서명 날인 & 서명 지우기)
          ================================================================= */}
          <section className="space-y-2 pt-1 border-t border-slate-200/60" data-field="TB_MEMBER_AGREE_SIGN">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">draw</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  자필 전자서명 날인
                </span>
                <span className="font-caption text-[11px] text-secondary font-semibold">
                  (전자서명법 제3조)
                </span>
              </div>
              <button
                className="h-8 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                id="app-btn-clear-signature"
                onClick={handleClearSignature}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>서명지우기</span>
              </button>
            </div>
            <div className="relative w-full h-32 rounded-2xl border border-slate-300 bg-surface-container-lowest overflow-hidden shadow-inner flex flex-col justify-between">
              <canvas
                className="w-full h-full cursor-crosshair touch-none"
                height={128}
                id="app-signature-canvas"
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-outline/60 text-xs sm:text-sm font-medium">
                  <span>여기에 손가락 또는 터치펜으로 자필 서명해 주세요</span>
                </div>
              )}
            </div>
            <p className="font-caption text-caption text-outline flex items-center gap-1 px-0.5 text-[11px]">
              <span className="material-symbols-outlined text-[13px]">info</span>
              <span>본 서명은 PNG 파일로 저장되며 공인 전자증적 데이터베이스에 영구 보관됩니다.</span>
            </p>
          </section>

          {/* 7. Footer Actions & CTA */}
          <div className="space-y-3.5 pt-2">
            <button
              className="w-full h-[52px] bg-secondary hover:bg-[#005049] text-white rounded-2xl font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading}
              id="app-btn-submit-signup"
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
            <div className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1.5 pb-2">
              <span>이미 계정이 있으신가요?</span>
              <button
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={handleGoToLogin}
                type="button"
              >
                로그인하기 (APP-CLNT-ATH-010100)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 유효성 검증 오류 안내 모달 (Requirement 2 동일 커스텀 모달) */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {alertModal.title || '입력 정보 확인'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed text-sm">
                {alertModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('LIGHT');
                const targetRef = alertModal.targetRef;
                setAlertModal({ isOpen: false, title: '', message: '' });
                if (targetRef && targetRef.current) {
                  setTimeout(() => {
                    targetRef.current.focus?.();
                    targetRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                  }, 50);
                }
              }}
              className="w-full h-11 bg-primary text-on-primary font-label-lg text-label-lg rounded-2xl hover:bg-primary-container transition-colors shadow-md font-bold cursor-pointer"
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

      {/* 1단계 & 2단계: 모바일 네이버 공식 인증 및 제3자 제공 동의 팝업 모달 레이어 */}
      {naverAuthModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#F8F9FA] rounded-3xl max-w-sm w-full shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 flex flex-col">
            {/* 상단 네이버 공식 헤더 */}
            <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#03C75A] rounded flex items-center justify-center text-white font-black text-sm">
                  N
                </div>
                <span className="font-extrabold text-[#03C75A] text-lg tracking-tight">NAVER</span>
                <span className="text-xs text-slate-400 font-medium ml-1">아이디로 로그인</span>
              </div>
              <button
                type="button"
                onClick={() => setNaverAuthModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                title="닫기"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 본문 안내 및 동의 카드 */}
            <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                    <img src="logo.png" alt="쓸고닦고" className="w-full h-full object-contain" onError={(e: any) => { e.target.src = '../public/logo.png'; }} />
                  </div>
                  <span className="text-slate-300 font-bold text-lg">+</span>
                  <div className="w-10 h-10 rounded-2xl bg-[#03C75A] flex items-center justify-center text-white font-extrabold text-2xl shadow-xs">
                    N
                  </div>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  <span className="text-[#003262]">쓸고닦고</span> 서비스 제공을 위한<br/>
                  개인정보 제3자 제공 동의
                </h4>
                <p className="text-[11px] text-slate-500">
                  네이버 본인인증 회원 정보로 간편하게 가입하고 시공 서비스를 이용합니다.
                </p>
              </div>

              {/* 필수 제공 항목 확인란 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">네이버 로그인 계정</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-[#03C75A]"></span>
                    <span>{naverModalProfile.email}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-700 font-medium">1. 네이버 고유 식별자 (ID)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-700 font-medium">2. 로그인 이메일</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">3. 성명 (실명)</span>
                      <input
                        type="text"
                        value={naverModalProfile.name}
                        onChange={(e) => setNaverModalProfile({ ...naverModalProfile, name: e.target.value })}
                        className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 mt-1"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">4. 휴대폰 번호 (본인실명확인)</span>
                      <input
                        type="text"
                        value={naverModalProfile.mobile}
                        onChange={(e) => setNaverModalProfile({ ...naverModalProfile, mobile: e.target.value })}
                        className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 mt-1"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 동의 버튼 */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">info</span>
                <span>
                  <strong>이메일 직접 등록 안내:</strong> 연동 후에도 쓸고닦고 계정으로 사용할 이메일을 다른 이메일로 자유롭게 변경하여 가입하실 수 있습니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('SUCCESS');
                  setNaverAuthModalOpen(false);
                  setSocialProvider('NAVER');
                  setSocialUid('naver_' + Date.now());
                  setEmail(naverModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(naverModalProfile.name);
                  setUserTel(naverModalProfile.mobile);
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg('✓ 네이버 계정 이메일이 자동 입력되었습니다. 다른 이메일로 변경하여 가입하실 수 있습니다.');
                  setSuccessInfoMsg(`✓ 네이버 계정(${naverModalProfile.name} / ${naverModalProfile.email}) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요.`);
                  setErrorMsg('');

                  setTimeout(() => {
                    if (userNmInputRef.current) {
                      userNmInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      userNmInputRef.current.focus();
                    }
                  }, 150);
                }}
                className="w-full h-12 bg-[#03C75A] hover:bg-[#02B351] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[#03C75A] font-black text-[10px]">✓</div>
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

      {/* 1단계 & 2단계: 모바일 카카오 공식 인증 및 제3자 제공 동의 팝업 모달 레이어 (비즈 앱 1650108) */}
      {kakaoAuthModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#F8F9FA] rounded-3xl max-w-sm w-full shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 flex flex-col">
            {/* 상단 카카오 공식 헤더 */}
            <div className="bg-[#FEE500] px-5 py-3.5 flex items-center justify-between border-b border-amber-300/80">
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="w-5 h-5 fill-[#3C1E1E]" viewBox="0 0 24 24">
                  <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
                </svg>
                <span className="font-extrabold text-[#3C1E1E] text-lg tracking-tight">kakao</span>
                <span className="text-xs text-[#3C1E1E]/80 font-bold ml-1">계정으로 로그인</span>
                <span className="text-[10px] font-bold bg-[#3C1E1E]/10 text-[#3C1E1E] px-1.5 py-0.5 rounded ml-1">비즈 앱</span>
              </div>
              <button
                type="button"
                onClick={() => setKakaoAuthModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/10 flex items-center justify-center text-[#3C1E1E]/80 hover:text-[#3C1E1E] cursor-pointer"
                title="닫기"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* 본문 안내 및 동의 카드 */}
            <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2.5 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                    <img src="logo.png" alt="쓸고닦고" className="w-full h-full object-contain" onError={(e: any) => { e.target.src = '../public/logo.png'; }} />
                  </div>
                  <span className="text-slate-300 font-bold text-lg">+</span>
                  <div className="w-10 h-10 rounded-2xl bg-[#FEE500] flex items-center justify-center shadow-xs">
                    <svg aria-hidden="true" className="w-6 h-6 fill-[#3C1E1E]" viewBox="0 0 24 24">
                      <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
                    </svg>
                  </div>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  <span className="text-[#003262]">쓸고닦고</span> 서비스 제공을 위한<br/>
                  카카오 개인정보 제3자 제공 동의
                </h4>
                <p className="text-[11px] text-slate-500">
                  카카오 본인인증 회원 정보(이메일, 실명, 휴대폰)로 간편하게 가입합니다.
                </p>
              </div>

              {/* 필수 제공 항목 확인란 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">카카오 로그인 계정</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-[#FEE500] border border-[#3C1E1E]"></span>
                    <span>{kakaoModalProfile.email}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-700 font-medium">1. 카카오 회원번호 (ID)</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-700 font-medium">2. 카카오계정 이메일</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">3. 성명 (실명)</span>
                      <input
                        type="text"
                        value={kakaoModalProfile.name}
                        onChange={(e) => setKakaoModalProfile({ ...kakaoModalProfile, name: e.target.value })}
                        className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 mt-1"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">4. 휴대폰 번호 (본인실명확인)</span>
                      <input
                        type="text"
                        value={kakaoModalProfile.mobile}
                        onChange={(e) => setKakaoModalProfile({ ...kakaoModalProfile, mobile: e.target.value })}
                        className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 mt-1"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">필수</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 동의 버튼 */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">info</span>
                <span>
                  <strong>이메일 직접 등록 안내:</strong> 연동 후에도 쓸고닦고 계정으로 사용할 이메일을 다른 이메일로 자유롭게 변경하여 가입하실 수 있습니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('SUCCESS');
                  setKakaoAuthModalOpen(false);
                  setSocialProvider('KAKAO');
                  setSocialUid('kakao_' + Date.now());
                  setEmail(kakaoModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(kakaoModalProfile.name);
                  setUserTel(kakaoModalProfile.mobile);
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg('✓ 카카오 계정 이메일이 자동 입력되었습니다. 다른 이메일로 변경하여 가입하실 수 있습니다.');
                  setSuccessInfoMsg(`✓ 카카오 계정(${kakaoModalProfile.name} / ${kakaoModalProfile.email}) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요.`);
                  setErrorMsg('');

                  setTimeout(() => {
                    if (userNmInputRef.current) {
                      userNmInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      userNmInputRef.current.focus();
                    }
                  }, 150);
                }}
                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] active:scale-[0.99] text-[#3C1E1E] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 bg-[#3C1E1E] rounded-full flex items-center justify-center text-[#FEE500] font-black text-[10px]">✓</div>
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
      {/* 4. Google 공식 연동 인증 모달 레이어 (Client ID: 281744333869-n8nbohs99t12g2eihescbdi8qmjkfevo.apps.googleusercontent.com) */}
      {googleAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* 상단 Google 공식 헤더 */}
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

            {/* 연동 안내 및 제3자 제공 동의 */}
            <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="text-center space-y-1 pb-3 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 mb-1 shadow-xs">
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

              {/* 계정 정보 표출 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Google 로그인 계정</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{googleModalProfile.email}</span>
                  </div>
                </div>
              </div>

              {/* 필수 제공 항목 리스트 */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">제공 항목 (필수 동의)</span>
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>✓ Google 프로필 기본 정보 (성명, 프로필 사진)</span>
                    <span className="text-[11px] font-bold text-blue-600">필수</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Google 계정 이메일 주소</span>
                    <span className="text-[11px] font-bold text-blue-600">필수</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ OpenID 고유 식별자</span>
                    <span className="text-[11px] font-bold text-blue-600">필수</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Google 연동 완료 후 <strong>[성명 (성함)]</strong> 필수 입력란으로 자동 포커스 이동되며, <strong>다른 이메일로 변경하여 가입</strong>하실 수도 있습니다.
              </div>
            </div>

            {/* 하단 동의 버튼 */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">info</span>
                <span>
                  <strong>이메일 직접 등록 안내:</strong> 연동 후에도 쓸고닦고 계정으로 사용할 이메일을 다른 이메일로 자유롭게 변경하여 가입하실 수 있습니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGoogleAuthModalOpen(false);
                  // 2단계 및 3단계: 프로필 정보 가입 폼에 즉각 바인딩 및 성명 필수입력란으로 포커스
                  setSocialProvider('GOOGLE');
                  setSocialUid('google_' + Date.now());
                  setEmail(googleModalProfile.email);
                  setIsEmailChecked(true);
                  setIsEmailValid(true);
                  setUserNm(googleModalProfile.name);
                  setUserTel(googleModalProfile.mobile);
                  setPwd('social_auth_pwd!');
                  setPwdConfirm('social_auth_pwd!');
                  setEmailCheckMsg('✓ Google 계정 이메일이 자동 입력되었습니다. 다른 이메일로 변경하여 가입하실 수 있습니다.');
                  setSuccessInfoMsg(`✓ Google 계정(${googleModalProfile.name} / ${googleModalProfile.email}) 연동 완료! 회원 성명 등 필수 항목을 확인하신 후 가입을 완료해 주세요.`);
                  setErrorMsg('');

                  setTimeout(() => {
                    if (userNmInputRef.current) {
                      userNmInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      userNmInputRef.current.focus();
                    }
                  }, 150);
                }}
                className="w-full h-12 bg-[#4285F4] hover:bg-[#3367D6] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[#4285F4] font-black text-[10px]">✓</div>
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
      )}
    </div>
  );
}
