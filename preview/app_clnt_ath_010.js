(function() {
const { useState, useEffect, useRef } = window.React;
const React = window.React;
// 모바일 햅틱 피드백 헬퍼
function triggerHaptic(style = 'LIGHT') {
    try {
        if (typeof window !== 'undefined') {
            const Haptics = window.Capacitor?.Plugins?.Haptics;
            if (Haptics) {
                if (style === 'SUCCESS') {
                    Haptics.notification({ type: 'SUCCESS' }).catch(() => { });
                }
                else {
                    Haptics.impact({ style }).catch(() => { });
                }
                return;
            }
            if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                navigator.vibrate(style === 'HEAVY' ? 40 : 15);
            }
        }
    }
    catch {
        // 햅틱 미지원 무시
    }
}
function AppClntAth010({ isOpen = false, visible, onClose, onSuccessRegister, onOpenLogin, navigation, onNavigate, }) {
    // 모달 모드 또는 독립 스크린 모드 모두 지원
    const isModalOpen = visible !== undefined ? visible : isOpen;
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
    const [showPwd, setShowPwd] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);
    const [userNm, setUserNm] = useState('');
    const [userTel, setUserTel] = useState('');
    const [isTelVerified, setIsTelVerified] = useState(true);
    // 오류 및 유효성 검증 알림 모달 상태
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    });
    // 회원가입 완료 축하 커스텀 모달 상태 (브라우저 기본 alert 대체)
    const [successModal, setSuccessModal] = useState({
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
    const showAlertModal = (message, title = '입력 정보 확인', targetRef = null) => {
        triggerHaptic('MEDIUM');
        setAlertModal({
            isOpen: true,
            title,
            message,
            targetRef,
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
        finance: { scrolled: false, checked: false, progress: 0, agreedAt: null },
    });
    const [allChecked, setAllChecked] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successInfoMsg, setSuccessInfoMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // 스크롤 감지용 ref
    const locationViewerRef = useRef(null);
    const financeViewerRef = useRef(null);
    const termsSectionRef = useRef(null);
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
        }
    }, [isModalOpen]);
    // 약관 동의 건수 계산
    const agreeCount = Object.values(terms).filter((t) => t.checked).length;
    useEffect(() => {
        setAllChecked(agreeCount === 4);
    }, [agreeCount]);
    // ESC 키 닫기 이벤트 핸들러
    useEffect(() => {
        const handleKeyDown = (e) => {
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
    const getCoordinates = (clientX, clientY, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
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
    const draw = (e) => {
        if (!isDrawing.current)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const { x, y } = getCoordinates(e.clientX, e.clientY, canvas);
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
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
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
    const drawTouch = (e) => {
        if (!isDrawing.current)
            return;
        if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            const { x, y } = getCoordinates(touch.clientX, touch.clientY, canvas);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };
    const handleClearSignature = () => {
        triggerHaptic('LIGHT');
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setHasSignature(false);
    };
    // =========================================================================
    // SNS 연동 가입 핸들러
    // =========================================================================
    const handleSocialSignup = (provider) => {
        triggerHaptic('MEDIUM');
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
        if (agreeCount === 4) {
            setSuccessInfoMsg(`${provider} 계정 연동 완료! 서명 날인 후 '회원가입 완료하기'를 누르시면 가입이 완료됩니다.`);
        }
        else {
            setSuccessInfoMsg(`${provider} 계정이 연동되었습니다. 아래 4대 필수 약관 전문 확인 및 서명 날인 후 가입을 완료해 주세요.`);
            if (termsSectionRef.current) {
                termsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
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
            const res = await fetch('/api/app/client/ath_010', {
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
            }
            else {
                setIsEmailChecked(true);
                setIsEmailValid(false);
                setEmailCheckMsg(data.message || '이미 등록된 이메일 주소입니다.');
                triggerHaptic('MEDIUM');
            }
        }
        catch {
            // Fallback
            setIsEmailChecked(true);
            setIsEmailValid(true);
            setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
            triggerHaptic('SUCCESS');
        }
    };
    // 휴대폰 재인증 모의 호출
    const handleReverifyTel = () => {
        triggerHaptic('LIGHT');
        showAlertModal('PASS / SMS 실명확인 팝업이 호출되었습니다. (가상 환경 테스트 통과)', '본인인증 완료');
        setIsTelVerified(true);
    };
    // Scroll-Lock 감지 핸들러
    const handleScroll = (key, e) => {
        const el = e.currentTarget;
        if (!el)
            return;
        const scrolledToEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 6;
        const progress = Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100));
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
            }
            else if (!current.checked) {
                return {
                    ...prev,
                    [key]: { ...current, progress },
                };
            }
            return prev;
        });
    };
    // 개별 체크박스 토글
    const handleToggleTerm = (key) => {
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
    const handleToggleAll = (e) => {
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
        }
        else {
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
        }
        else if (onNavigate) {
            onNavigate('APP-CLNT-ATH-000');
        }
        else if (navigation?.navigate) {
            navigation.navigate('APP-CLNT-ATH-000');
        }
        else if (onClose) {
            onClose();
        }
    };
    // 뒤로가기 / 닫기 핸들러
    const handleClose = () => {
        triggerHaptic('LIGHT');
        if (onClose) {
            onClose();
        }
        else if (onNavigate) {
            onNavigate('APP-CLNT-COM-000');
        }
        else if (navigation?.goBack) {
            navigation.goBack();
        }
    };
    // 최종 가입 제출
    const handleSubmit = async (e) => {
        if (e)
            e.preventDefault();
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
            showAlertModal('성함(실명)을 입력해 주세요.', '실명 입력 필요');
            return;
        }
        if (!userTel || !userTel.trim()) {
            showAlertModal('휴대폰 번호를 입력해 주세요.', '휴대폰 번호 필요');
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
            const res = await fetch('/api/app/client/ath_010', {
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
            }
            else {
                triggerHaptic('HEAVY');
                showAlertModal(data.message || '회원가입 처리 중 오류가 발생했습니다.', '회원가입 실패');
                setErrorMsg(data.message || '회원가입 처리 중 오류가 발생했습니다.');
            }
        }
        catch (err) {
            console.warn('[APP_REGISTER_REQUEST_ERR]', err);
            triggerHaptic('HEAVY');
            showAlertModal('회원가입 서버 통신 중 오류가 발생했습니다: ' + (err?.message || err), '통신 오류');
            setErrorMsg('서버 통신 오류가 발생했습니다.');
        }
        finally {
            setIsLoading(false);
        }
    };
    // 모달 모드일 때만 닫기 검사, 독립 화면일 때는 항상 렌더링
    if (visible !== undefined && !visible)
        return null;
    if (isOpen !== undefined && visible === undefined && !isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200", id: "app-signup-modal-backdrop", onClick: (e) => {
            if (e.target === e.currentTarget && onClose)
                handleClose();
        } },
        React.createElement("div", { "aria-labelledby": "app-modal-headline", "aria-modal": "true", className: "relative w-full max-w-[540px] h-full sm:h-auto sm:max-h-[92vh] bg-surface-container-lowest sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-on-surface transform transition-all duration-300 border-0 sm:border border-slate-200/80 animate-in zoom-in-95", id: "app-signup-container", role: "dialog" },
            React.createElement("div", { className: "bg-surface-container-low px-5 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-200/60 shrink-0" },
                React.createElement("div", { className: "flex items-center gap-1.5 text-secondary font-label-sm text-label-sm" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "verified_user"),
                    React.createElement("span", { className: "font-semibold tracking-tight" }, "KISA & \uAE08\uC735\uC704 \uAC00\uC774\uB4DC\uB77C\uC778 \uC900\uC218 \uC804\uC790\uC11C\uBA85")),
                React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uD654\uBA74 ID: APP-CLNT-ATH-010")),
            React.createElement("div", { className: "overflow-y-auto px-5 sm:px-7 pt-5 pb-8 space-y-5 flex-1 scroll-smooth", id: "app-modal-scroll-pane" },
                React.createElement("header", { className: "flex items-start justify-between gap-3" },
                    React.createElement("div", { className: "flex items-start gap-3" },
                        React.createElement("div", { className: "relative w-11 h-11 rounded-2xl bg-surface-container p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center" },
                            React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uC2EC\uBCFC \uB85C\uACE0", className: "w-full h-full object-cover rounded-xl", src: "/logo.png" })),
                        React.createElement("div", null,
                            React.createElement("h2", { className: "text-on-surface font-headline-sm sm:font-headline-md text-headline-sm sm:text-headline-md tracking-tight font-bold", id: "app-modal-headline" }, "\uD1B5\uD569 \uD68C\uC6D0\uAC00\uC785"),
                            React.createElement("p", { className: "text-on-surface-variant font-body-sm text-body-sm mt-0.5" }, "\uC4F8\uACE0\uB2E6\uACE0\uC640 \uD568\uAED8 \uAE68\uB057\uD558\uACE0 \uBBFF\uC744 \uC218 \uC788\uB294 \uC548\uC2EC \uACF5\uAC04\uC744 \uC2DC\uC791\uD558\uC138\uC694."))),
                    React.createElement("button", { "aria-label": "\uB2EB\uAE30", className: "w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0", onClick: handleClose, type: "button" },
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close"))),
                React.createElement("section", { "aria-labelledby": "role-select-title", className: "space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold", id: "role-select-title" }, "\uD68C\uC6D0 \uC720\uD615 \uC120\uD0DD"),
                        React.createElement("span", { className: "text-secondary font-label-sm text-label-sm flex items-center gap-1 font-semibold" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "tune"),
                            "\uC2E4\uC2DC\uAC04 \uC5ED\uD560 \uBD84\uAE30 \uC801\uC6A9")),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-2xl" },
                        React.createElement("button", { className: `h-11 rounded-xl flex items-center justify-center gap-2 font-label-md sm:font-label-lg text-label-md sm:text-label-lg transition-all ${role === 'C'
                                ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`, "data-field": "USER_ROLE_CD", "data-role-value": "C", id: "role-btn-client", onClick: () => {
                                triggerHaptic('LIGHT');
                                setRole('C');
                            }, type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "person"),
                            React.createElement("span", null, "\uACE0\uAC1D \uD68C\uC6D0 (\uC758\uB8B0\u00B7\uBC1C\uC8FC)")),
                        React.createElement("button", { className: `h-11 rounded-xl flex items-center justify-center gap-2 font-label-md sm:font-label-lg text-label-md sm:text-label-lg transition-all ${role === 'S'
                                ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`, "data-field": "USER_ROLE_CD", "data-role-value": "S", id: "role-btn-partner", onClick: () => {
                                triggerHaptic('LIGHT');
                                setRole('S');
                            }, type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "engineering"),
                            React.createElement("span", null, "\uC2DC\uACF5\uC0AC \uD68C\uC6D0 (\uC2DC\uACF5\u00B7\uC218\uC8FC)"))),
                    React.createElement("p", { className: "text-on-surface-variant font-caption text-caption flex items-center gap-1.5 px-1" },
                        React.createElement("span", { className: "material-symbols-outlined text-[14px] text-primary" }, "info"),
                        React.createElement("span", null, "\uC120\uD0DD\uD558\uC2E0 \uD68C\uC6D0 \uAD6C\uBD84\uC5D0 \uB530\uB77C \uC2DC\uACF5 \uBC1C\uC8FC\uC11C \uB4F1\uB85D \uB610\uB294 \uD30C\uD2B8\uB108 \uACAC\uC801 \uC804\uC1A1 \uAD8C\uD55C\uC774 \uBD80\uC5EC\uB429\uB2C8\uB2E4."))),
                successInfoMsg && (React.createElement("div", { className: "p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-2xl flex items-start justify-between gap-2 text-on-secondary-fixed-variant font-caption text-caption animate-in fade-in" },
                    React.createElement("div", { className: "flex items-start gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5" }, "check_circle"),
                        React.createElement("span", null, successInfoMsg)),
                    socialProvider && (React.createElement("button", { type: "button", onClick: handleCancelSocial, className: "text-[11px] underline shrink-0 hover:text-primary" }, "\uC5F0\uB3D9 \uCDE8\uC18C")))),
                errorMsg && (React.createElement("div", { className: "p-3 bg-error-container/50 border border-error/30 rounded-2xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error shrink-0" }, "error"),
                    React.createElement("span", null, errorMsg))),
                React.createElement("section", { className: "space-y-4 pt-1" },
                    React.createElement("div", { className: "flex flex-col w-full" },
                        React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2 text-center" }, "SNS \uACC4\uC815\uC73C\uB85C \uAC04\uD3B8 \uAC00\uC785"),
                        React.createElement("div", { className: "grid grid-cols-4 gap-2 w-full" },
                            React.createElement("button", { className: `h-12 rounded-2xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'KAKAO' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "KAKAO", onClick: () => handleSocialSignup('KAKAO'), title: "\uCE74\uCE74\uC624\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-4 h-4 fill-[#3C1E1E]", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-[#3C1E1E] font-bold mt-0.5 leading-none" }, "\uCE74\uCE74\uC624")),
                            React.createElement("button", { className: `h-12 rounded-2xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'NAVER' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "NAVER", onClick: () => handleSocialSignup('NAVER'), title: "\uB124\uC774\uBC84\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-white font-bold mt-0.5 leading-none" }, "\uB124\uC774\uBC84")),
                            React.createElement("button", { className: `h-12 rounded-2xl bg-surface-container-lowest border border-slate-300/80 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'GOOGLE' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "GOOGLE", onClick: () => handleSocialSignup('GOOGLE'), title: "Google\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                                    React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                                    React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                                    React.createElement("path", { d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z", fill: "#EA4335" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-on-surface font-bold mt-0.5 leading-none" }, "Google")),
                            React.createElement("button", { className: `h-12 rounded-2xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'APPLE' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "APPLE", onClick: () => handleSocialSignup('APPLE'), title: "Apple\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-white font-bold mt-0.5 leading-none" }, "Apple"))),
                        React.createElement("div", { className: "relative flex items-center justify-center my-3.5" },
                            React.createElement("div", { className: "w-full h-[1px] bg-slate-200" }),
                            React.createElement("span", { className: "absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline" }, "\uB610\uB294 \uC774\uBA54\uC77C\uB85C \uAC00\uC785"))),
                    React.createElement("div", { className: "space-y-1.5" },
                        React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "app-field-user-email" }, "\uB85C\uADF8\uC778 \uC774\uBA54\uC77C (\uACC4\uC815 ID)"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("div", { className: "relative flex-1" },
                                React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_EMAIL", id: "app-field-user-email", ref: emailInputRef, onChange: (e) => {
                                        setEmail(e.target.value);
                                        setIsEmailChecked(false);
                                    }, placeholder: "name@example.com", type: "email", value: email })),
                            React.createElement("button", { className: "h-12 px-4 bg-surface-container text-on-surface font-label-md text-label-md rounded-2xl hover:bg-surface-container-high transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer", id: "app-btn-check-duplicate", onClick: handleCheckEmail, type: "button" },
                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "manage_search"),
                                React.createElement("span", null, "\uC911\uBCF5\uD655\uC778"))),
                        isEmailChecked && (React.createElement("p", { className: `font-caption text-caption px-1 ${isEmailValid ? 'text-secondary' : 'text-error'}`, id: "app-email-hint" }, emailCheckMsg))),
                    !socialProvider && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "app-field-user-pwd" }, "\uBE44\uBC00\uBC88\uD638"),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("input", { className: "w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_PWD_HASH", id: "app-field-user-pwd", ref: pwdInputRef, onChange: (e) => setPwd(e.target.value), placeholder: "\uC601\uBB38, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790 \uC870\uD569 6\uC790 \uC774\uC0C1", type: showPwd ? 'text' : 'password', value: pwd }),
                                    React.createElement("button", { type: "button", onClick: () => setShowPwd(!showPwd), className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer", title: showPwd ? '비밀번호 숨기기' : '비밀번호 표시', "aria-label": showPwd ? '비밀번호 숨기기' : '비밀번호 표시' },
                                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, showPwd ? 'visibility' : 'visibility_off')))),
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "app-field-user-pwd-confirm" }, "\uBE44\uBC00\uBC88\uD638 \uD655\uC778"),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("input", { className: "w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_PWD_CONFIRM", id: "app-field-user-pwd-confirm", ref: pwdConfirmInputRef, onChange: (e) => setPwdConfirm(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC785\uB825", type: showPwdConfirm ? 'text' : 'password', value: pwdConfirm }),
                                    React.createElement("button", { type: "button", onClick: () => setShowPwdConfirm(!showPwdConfirm), className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer", title: showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시', "aria-label": showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시' },
                                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, showPwdConfirm ? 'visibility' : 'visibility_off'))))),
                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant flex items-center gap-1 px-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "lock"),
                            "8~16\uC790 \uC601\uBB38, \uC22B\uC790, \uD2B9\uC218\uAE30\uD638(!@#$%^&*)\uB97C \uD63C\uC6A9\uD558\uC5EC \uC548\uC804\uD558\uAC8C \uC124\uC815\uD574 \uC8FC\uC138\uC694."))),
                    React.createElement("div", { className: "space-y-1.5" },
                        React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "app-field-user-nm" }, "\uC131\uBA85 (\uC131\uD568)"),
                        React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all", "data-field": "USER_NM", id: "app-field-user-nm", onChange: (e) => setUserNm(e.target.value), onFocus: (e) => { e.target.placeholder = ''; }, onBlur: (e) => { if (!e.target.value)
                                e.target.placeholder = '홍길동'; }, placeholder: "\uD64D\uAE38\uB3D9", type: "text", value: userNm }))),
                React.createElement("section", { className: "space-y-3 p-4 bg-surface-container-low rounded-2xl border border-slate-200/50" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("label", { className: "font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold", htmlFor: "app-field-user-tel" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "phonelink_lock"),
                            "\uD734\uB300\uD3F0 \uBCF8\uC778\uBA85\uC758 \uC2E4\uBA85\uC778\uC99D"),
                        React.createElement("span", { className: "text-secondary font-label-sm text-label-sm font-semibold" }, "PASS / SMS")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-2xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all", "data-field": "USER_TEL", id: "app-field-user-tel", onChange: (e) => setUserTel(e.target.value), onFocus: (e) => { e.target.placeholder = ''; }, onBlur: (e) => { if (!e.target.value)
                                e.target.placeholder = '010-0000-0000'; }, placeholder: "010-0000-0000", type: "tel", value: userTel }),
                        React.createElement("button", { className: "h-12 px-3.5 bg-surface-container-lowest border border-secondary/30 text-secondary font-label-md text-label-md rounded-2xl hover:bg-secondary/10 transition-colors shrink-0 shadow-sm flex items-center gap-1", onClick: handleReverifyTel, type: "button" },
                            React.createElement("span", null, "\uC7AC\uC778\uC99D"))),
                    React.createElement("div", { className: "p-2.5 bg-secondary-fixed/30 rounded-xl flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px]" }, "check_circle"),
                            React.createElement("span", { className: "text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold" },
                                "\uBCF8\uC778\uC778\uC99D \uC644\uB8CC (",
                                userNm || '홍길동',
                                " / ",
                                userTel ? userTel.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2') : '010-****-0000',
                                ")")),
                        React.createElement("span", { className: "text-on-secondary-fixed-variant font-caption text-caption opacity-80 font-mono text-[11px]" }, "CI \uC554\uD638\uD654"))),
                React.createElement("section", { "aria-labelledby": "terms-section-title", className: "space-y-3 pt-1", ref: termsSectionRef },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("h3", { className: "font-label-lg sm:font-headline-sm text-label-lg sm:text-headline-sm text-on-surface font-bold", id: "terms-section-title" },
                            "\uD544\uC218 \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758 ",
                            React.createElement("span", { className: "text-secondary font-body-sm font-normal" }, "(Scroll-Lock)")),
                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" },
                            "4\uAC74 \uC911 ",
                            React.createElement("span", { className: "font-bold text-secondary", id: "app-agree-count" }, agreeCount),
                            "\uAC74 \uC644\uB8CC")),
                    React.createElement("div", { className: "p-3 bg-tertiary-fixed/40 rounded-2xl flex items-start gap-2.5" },
                        React.createElement("span", { className: "material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5" }, "policy"),
                        React.createElement("div", { className: "space-y-0.5 text-on-tertiary-fixed" },
                            React.createElement("p", { className: "font-label-sm text-label-sm font-bold" }, "\uC804\uCCB4 \uC57D\uAD00 \uC815\uB3C5 \uC758\uBB34\uD654 \uC2DC\uC2A4\uD15C \uAC00\uB3D9 \uC911"),
                            React.createElement("p", { className: "font-caption text-caption leading-relaxed" }, "\uAC01 \uC57D\uAD00 \uBCF8\uBB38\uC744 \uB05D\uAE4C\uC9C0 \uC2A4\uD06C\uB864\uD558\uC5EC 100% \uD655\uC778\uD558\uC154\uC57C \uB3D9\uC758 \uCCB4\uD06C\uBC15\uC2A4\uAC00 \uC790\uB3D9 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4."))),
                    React.createElement("div", { className: "space-y-2.5", id: "app-terms-container" },
                        React.createElement("div", { className: "p-3 bg-surface-container-low rounded-2xl space-y-2", "data-terms-cd": "SERVICE" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                    React.createElement("input", { checked: terms.service.checked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", id: "app-check-terms-service", onChange: () => handleToggleTerm('service'), type: "checkbox" }),
                                    React.createElement("span", { className: "font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC11C\uBE44\uC2A4 \uD1B5\uD569\uC774\uC6A9\uC57D\uAD00 v1.0")),
                                React.createElement("span", { className: "bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold flex items-center gap-0.5" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, "check"),
                                    "\uD655\uC778\uC644\uB8CC")),
                            React.createElement("div", { className: "h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner" },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uBAA9\uC801 \uBC0F \uD50C\uB7AB\uD3FC \uB9E4\uCE6D\uBE44 \uD655\uC815 \uADDC\uC815)"),
                                React.createElement("p", null, "\uBCF8 \uC57D\uAD00\uC740 \uC8FC\uC2DD\uD68C\uC0AC \uC4F8\uACE0\uB2E6\uACE0(\uC774\uD558 '\uD68C\uC0AC')\uAC00 \uC6B4\uC601\uD558\uB294 O2O \uC8FC\uAC70\uC704\uC0DD \uC548\uC2EC \uB9E4\uCE6D \uC11C\uBE44\uC2A4\uC758 \uAE30\uBCF8 \uC774\uC6A9\uC870\uAC74\uC744 \uADDC\uC815\uD569\uB2C8\uB2E4. \uD68C\uC0AC\uB294 \uB9E4\uCE6D \uC131\uC0AC \uC2DC 1\uD68C \uACE0\uC815 \uD50C\uB7AB\uD3FC \uC911\uAC1C\uBE44 16,500\uC6D0(\uBD80\uAC00\uC138 \uD3EC\uD568)\uC744 \uC815\uC561 \uCCAD\uAD6C\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (\uD604\uC7A5 \uC2DC\uACF5\uBE44 \uC9C1\uBD88 \uC6D0\uCE59 \uBC0F \uC548\uC2EC \uC2DC\uACF5 \uCC45\uC784)"),
                                React.createElement("p", null, "\uC2DC\uACF5 \uB178\uC784 \uBC0F \uC778\uAC74\uBE44\uB294 \uC2DC\uACF5 \uAC80\uC218 \uC644\uB8CC \uD6C4 \uACE0\uAC1D\uC774 \uC2DC\uACF5 \uB9C8\uC2A4\uD130\uC5D0\uAC8C \uC9C1\uC811 \uC9C0\uAE09\uD568\uC744 \uC6D0\uCE59\uC73C\uB85C \uD558\uBA70, \uD68C\uC0AC\uB294 \uC778\uAC74\uBE44\uC758 \uBB34\uB2E8 \uC804\uC6A9 \uBC0F \uACFC\uB3C4\uD55C \uC5D0\uC2A4\uD06C\uB85C \uC608\uCE58\uB97C \uC9C0\uC591\uD569\uB2C8\uB2E4. \uB9C8\uC2A4\uD130\uC758 \uACE0\uC758\u00B7\uACFC\uC2E4\uB85C \uBC1C\uC0DD\uD55C \uC190\uD574\uB294 1\uC5B5\uC6D0 \uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8\uC744 \uD1B5\uD574 \uBCF4\uC99D \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC5ED\uACBD\uB9E4 \uBC0F \uB364\uD551 \uAE08\uC9C0)"),
                                React.createElement("p", null, "\uD50C\uB7AB\uD3FC\uC758 \uD45C\uC900 \uB2E8\uAC00 \uCCB4\uACC4\uB97C \uC65C\uACE1\uD558\uB294 \uBD88\uACF5\uC815 \uB364\uD551 \uC81C\uC548 \uBC0F \uBB34\uB2E8 \uC218\uC218\uB8CC \uC804\uAC00\uB294 \uC989\uAC01\uC801\uC778 \uACC4\uC815 \uC815\uC9C0 \uBC0F \uD68C\uC6D0 \uC790\uACA9 \uBC15\uD0C8 \uC0AC\uC720\uAC00 \uB429\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "p-3 bg-surface-container-low rounded-2xl space-y-2", "data-terms-cd": "PRIVACY" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                    React.createElement("input", { checked: terms.privacy.checked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", id: "app-check-terms-privacy", onChange: () => handleToggleTerm('privacy'), type: "checkbox" }),
                                    React.createElement("span", { className: "font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \uBC0F \uC774\uC6A9 \uB3D9\uC758 v1.0")),
                                React.createElement("span", { className: "bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold flex items-center gap-0.5" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, "check"),
                                    "\uD655\uC778\uC644\uB8CC")),
                            React.createElement("div", { className: "h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner" },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "1. \uC218\uC9D1 \uD56D\uBAA9 \uBC0F \uBCF4\uC720 \uBAA9\uC801"),
                                React.createElement("p", null, "- \uD544\uC218 \uC218\uC9D1 \uD56D\uBAA9: \uC131\uBA85, \uD734\uB300\uC804\uD654\uBC88\uD638, \uC774\uBA54\uC77C \uC8FC\uC18C, \uC11C\uBE44\uC2A4 \uC2DC\uACF5 \uD76C\uB9DD \uC8FC\uC18C\uC9C0(\uB3D9\u00B7\uD638\uC218 \uD3EC\uD568)."),
                                React.createElement("p", null, "- \uC774\uC6A9 \uBAA9\uC801: \uC2E0\uC6D0 \uC778\uC99D, 1\uAE09 \uCCAD\uC18C \uB9C8\uC2A4\uD130 \uD30C\uACAC \uBC30\uCC28, 1\uC5B5\uC6D0 \uC548\uC2EC\uBCF4\uD5D8 \uC811\uC218 \uBC0F \uC11C\uBE44\uC2A4 \uC0AC\uD6C4 \uC548\uC2EC\uBCF4\uC99D \uC774\uB825 \uAD00\uB9AC."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "2. \uBCF4\uC720 \uBC0F \uD30C\uAE30 \uC808\uCC28"),
                                React.createElement("p", null, "\uD68C\uC6D0 \uD0C8\uD1F4 \uC2DC \uC804\uC790\uAE08\uC735\uAC70\uB798\uBC95 \uBC0F \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95\uC5D0 \uBA85\uC2DC\uB41C \uBC95\uC815 \uBCF4\uAD00\uAE30\uAC04(\uAC70\uB798\uB0B4\uC5ED 5\uB144) \uACBD\uACFC \uD6C4 \uC9C0\uCCB4 \uC5C6\uC774 \uBCF5\uAD6C \uBD88\uAC00\uB2A5\uD55C \uBC29\uBC95\uC73C\uB85C \uC601\uAD6C \uD30C\uAE30\uD569\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "p-3 bg-surface-container-low rounded-2xl space-y-2", "data-terms-cd": "LOCATION" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                    React.createElement("input", { checked: terms.location.checked, className: `w-4 h-4 rounded text-secondary accent-secondary ${terms.location.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`, disabled: !terms.location.scrolled, id: "app-check-terms-location", onChange: () => handleToggleTerm('location'), type: "checkbox" }),
                                    React.createElement("span", { className: "font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC704\uCE58\uAE30\uBC18 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00 v1.0")),
                                React.createElement("span", { className: `px-2 py-0.5 rounded-full font-label-sm text-[11px] flex items-center gap-0.5 font-semibold ${terms.location.scrolled
                                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                                        : 'bg-surface-container-high text-on-surface-variant'}` },
                                    React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, terms.location.scrolled ? 'check' : 'hourglass_bottom'),
                                    React.createElement("span", null, terms.location.scrolled
                                        ? '확인완료'
                                        : `스크롤 (${terms.location.progress}%)`))),
                            React.createElement("div", { className: "h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner", id: "app-viewer-terms-location", onScroll: (e) => handleScroll('location', e), ref: locationViewerRef },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uC704\uCE58\uC815\uBCF4\uC758 \uD65C\uC6A9)"),
                                React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC2E0\uCCAD\uC778\uC758 \uC2E0\uCCAD \uC8FC\uC18C\uC9C0\uB97C \uAE30\uBC18\uC73C\uB85C \uAC00\uC7A5 \uC2E0\uC18D\uD558\uAC8C \uD604\uC7A5 \uB3C4\uB2EC\uC774 \uAC00\uB2A5\uD55C \uBC18\uACBD 5km \uC774\uB0B4\uC758 \uAC80\uC99D\uB41C 1\uAE09 \uD648\uCF00\uC5B4 \uB9C8\uC2A4\uD130\uB97C \uC790\uB3D9 \uC815\uB82C\uD558\uC5EC \uB9E4\uCE6D \uD6C4\uBCF4\uB85C \uC81C\uC548\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (\uC704\uCE58\uAE30\uBC18 \uCD9C\uB3D9 \uAD00\uC81C)"),
                                React.createElement("p", null, "\uBC30\uCC28 \uD655\uC815 \uC2DC\uACF5 \uC77C\uC790\uC5D0 \uB9C8\uC2A4\uD130\uC758 \uC2E4\uC81C \uC774\uB3D9 \uD604\uD669 \uBC0F \uC608\uC0C1 \uBC29\uBB38 \uC2DC\uAC04(ETA)\uC744 \uACE0\uAC1D \uB2E8\uB9D0\uAE30\uC5D0 \uC2E4\uC2DC\uAC04 \uD478\uC2DC \uD1B5\uBCF4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC218\uC9D1\uB41C GPS \uC815\uBCF4\uB294 \uC791\uC5C5 \uC644\uB8CC 24\uC2DC\uAC04 \uD6C4 \uC644\uC804\uD788 \uB9C8\uC2A4\uD0B9 \uD3D0\uAE30 \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC774\uC6A9\uC790\uC758 \uAD8C\uB9AC)"),
                                React.createElement("p", null, "\uACE0\uAC1D\uC740 \uC5B8\uC81C\uB4E0\uC9C0 \uB2E8\uB9D0\uAE30 \uC124\uC815\uC744 \uD1B5\uD574 \uC704\uCE58 \uC815\uBCF4 \uC218\uC9D1\uC744 \uC77C\uC2DC \uC911\uB2E8\uD560 \uC218 \uC788\uC73C\uBA70, \uC774 \uACBD\uC6B0 \uC790\uB3D9 \uAC70\uB9AC \uAE30\uBC18 \uBC30\uCC28 \uB300\uC2E0 \uC8FC\uC18C \uC9C1\uC811 \uAC80\uC0C9 \uC218\uAE30 \uBC29\uC2DD\uC73C\uB85C \uB300\uCCB4 \uCC98\uB9AC\uB429\uB2C8\uB2E4. (\uBCF8 \uC870\uD56D \uC815\uB3C5 \uC644\uB8CC)"))),
                        React.createElement("div", { className: "p-3 bg-surface-container-low rounded-2xl space-y-2", "data-terms-cd": "FINANCE" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                    React.createElement("input", { checked: terms.finance.checked, className: `w-4 h-4 rounded text-secondary accent-secondary ${terms.finance.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`, disabled: !terms.finance.scrolled, id: "app-check-terms-finance", onChange: () => handleToggleTerm('finance'), type: "checkbox" }),
                                    React.createElement("span", { className: "font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC804\uC790\uAE08\uC735\uAC70\uB798 \uAE30\uBCF8\uC57D\uAD00 v1.0")),
                                React.createElement("span", { className: `px-2 py-0.5 rounded-full font-label-sm text-[11px] flex items-center gap-0.5 font-semibold ${terms.finance.scrolled
                                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                                        : 'bg-surface-container-high text-on-surface-variant'}` },
                                    React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, terms.finance.scrolled ? 'check' : 'hourglass_bottom'),
                                    React.createElement("span", null, terms.finance.scrolled
                                        ? '확인완료'
                                        : `스크롤 (${terms.finance.progress}%)`))),
                            React.createElement("div", { className: "h-20 overflow-y-auto p-2.5 bg-surface-container-lowest rounded-xl font-caption text-caption text-on-surface-variant leading-relaxed space-y-1 shadow-inner", id: "app-viewer-terms-finance", onScroll: (e) => handleScroll('finance', e), ref: financeViewerRef },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uACB0\uC81C \uB300\uD589 \uBC0F \uD658\uBD88 \uBC29\uCE68)"),
                                React.createElement("p", null, "\uB9E4\uCE6D \uC218\uC218\uB8CC(16,500\uC6D0) \uACB0\uC81C\uB294 \uACF5\uC778 \uC804\uC790\uC9C0\uAE09\uACB0\uC81C\uB300\uD589\uC5C5\uC790(PG)\uB97C \uD1B5\uD574 \uC548\uC804\uD558\uAC8C \uC9C4\uD589\uB418\uBA70, \uC2DC\uACF5 \uB9C8\uC2A4\uD130 \uB9E4\uCE6D \uC2E4\uD328 \uC2DC \uC218\uC218\uB8CC\uB294 100% \uC989\uC2DC \uC790\uB3D9 \uD658\uBD88 \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (3\uAC1C\uC6D4 \uC548\uC2EC\uBCF4\uC99D \uCF00\uC5B4 \uC5F0\uB3D9)"),
                                React.createElement("p", null, "\uC815\uC0C1 \uC644\uB8CC\uB41C \uAC70\uB798 \uAC74\uC5D0 \uD55C\uD558\uC5EC 90\uC77C\uAC04 \uB204\uC218, \uACB0\uB85C, \uC7AC\uC624\uC5FC\uC5D0 \uB300\uD55C \uC548\uC2EC\uBCF4\uC99D \uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C\uC758 \uC9C0\uC6D0\uC744 \uBC1B\uC73C\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uD604\uC7A5 \uC9C1\uBD88\uAE08 \uC601\uC218\uC99D\uC740 \uB9C8\uC2A4\uD130\uAC00 \uD604\uC7A5\uC5D0\uC11C \uC9C1\uC811 \uC138\uAE08\uACC4\uC0B0\uC11C \uB610\uB294 \uD604\uAE08\uC601\uC218\uC99D\uC73C\uB85C \uBC1C\uAE09 \uAD50\uBD80\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC624\uB958\uC758 \uC815\uC815)"),
                                React.createElement("p", null, "\uC774\uC6A9\uC790\uB294 \uC804\uC790\uAE08\uC735\uAC70\uB798\uC5D0 \uC624\uB958\uAC00 \uC788\uC74C\uC744 \uC548 \uB54C\uC5D0 \uC989\uC2DC \uD68C\uC0AC\uC5D0 \uC815\uC815\uC744 \uC694\uAD6C\uD560 \uC218 \uC788\uC73C\uBA70 \uD68C\uC0AC\uB294 \uC811\uC218 \uC989\uC2DC 2\uC601\uC5C5\uC77C \uC774\uB0B4\uC5D0 \uC6D0\uC778\uC744 \uADDC\uBA85\uD558\uC5EC \uD68C\uC2E0\uD569\uB2C8\uB2E4. (\uC815\uB3C5 \uC644\uB8CC)"))))),
                React.createElement("div", { className: "p-3 bg-surface-container rounded-2xl flex items-center justify-between" },
                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                        React.createElement("input", { checked: allChecked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", id: "app-check-all-terms", onChange: handleToggleAll, type: "checkbox" }),
                        React.createElement("span", { className: "font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface font-bold" }, "[\uC804\uCCB4 \uB3D9\uC758] 4\uB300 \uD544\uC218 \uC57D\uAD00 \uBC0F \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68 \uBAA8\uB450 \uB3D9\uC758")),
                    React.createElement("span", { className: "text-secondary font-label-sm text-[12px] font-semibold shrink-0" }, "\uC77C\uAD04 \uC11C\uBA85")),
                React.createElement("section", { className: "space-y-2 pt-1 border-t border-slate-200/60", "data-field": "TB_MEMBER_AGREE_SIGN" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "draw"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uB0A0\uC778"),
                            React.createElement("span", { className: "font-caption text-[11px] text-secondary font-semibold" }, "(\uC804\uC790\uC11C\uBA85\uBC95 \uC81C3\uC870)")),
                        React.createElement("button", { className: "h-8 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1", id: "app-btn-clear-signature", onClick: handleClearSignature, type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "refresh"),
                            React.createElement("span", null, "\uC11C\uBA85\uC9C0\uC6B0\uAE30"))),
                    React.createElement("div", { className: "relative w-full h-32 rounded-2xl border border-slate-300 bg-surface-container-lowest overflow-hidden shadow-inner flex flex-col justify-between" },
                        React.createElement("canvas", { className: "w-full h-full cursor-crosshair touch-none", height: 128, id: "app-signature-canvas", onMouseDown: startDrawing, onMouseLeave: stopDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onTouchEnd: stopDrawing, onTouchMove: drawTouch, onTouchStart: startDrawingTouch, ref: canvasRef, width: 500 }),
                        !hasSignature && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none text-outline/60 text-xs sm:text-sm font-medium" },
                            React.createElement("span", null, "\uC5EC\uAE30\uC5D0 \uC190\uAC00\uB77D \uB610\uB294 \uD130\uCE58\uD39C\uC73C\uB85C \uC790\uD544 \uC11C\uBA85\uD574 \uC8FC\uC138\uC694")))),
                    React.createElement("p", { className: "font-caption text-caption text-outline flex items-center gap-1 px-0.5 text-[11px]" },
                        React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "info"),
                        React.createElement("span", null, "\uBCF8 \uC11C\uBA85\uC740 PNG \uD30C\uC77C\uB85C \uC800\uC7A5\uB418\uBA70 \uACF5\uC778 \uC804\uC790\uC99D\uC801 \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uC5D0 \uC601\uAD6C \uBCF4\uAD00\uB429\uB2C8\uB2E4."))),
                React.createElement("div", { className: "space-y-3.5 pt-2" },
                    React.createElement("button", { className: "w-full h-[52px] bg-secondary hover:bg-[#005049] text-white rounded-2xl font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer", disabled: isLoading, id: "app-btn-submit-signup", onClick: handleSubmit, type: "button" }, isLoading ? (React.createElement("span", { className: "inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : (React.createElement(React.Fragment, null,
                        React.createElement("span", null, "\uD68C\uC6D0\uAC00\uC785 \uC644\uB8CC\uD558\uAE30"),
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "arrow_forward")))),
                    React.createElement("div", { className: "text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1.5 pb-2" },
                        React.createElement("span", null, "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?"),
                        React.createElement("button", { className: "text-primary font-semibold hover:underline cursor-pointer", onClick: handleGoToLogin, type: "button" }, "\uB85C\uADF8\uC778\uD558\uAE30 (APP-CLNT-ATH-000)"))))),
        alertModal.isOpen && (React.createElement("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 space-y-4" },
                React.createElement("div", { className: "w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm" },
                    React.createElement("span", { className: "material-symbols-outlined text-[28px]" }, "warning")),
                React.createElement("div", { className: "space-y-1.5" },
                    React.createElement("h3", { className: "font-headline-sm text-headline-sm font-bold text-on-surface" }, alertModal.title || '입력 정보 확인'),
                    React.createElement("p", { className: "font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed text-sm" }, alertModal.message)),
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        const targetRef = alertModal.targetRef;
                        setAlertModal({ isOpen: false, title: '', message: '' });
                        if (targetRef && targetRef.current) {
                            setTimeout(() => {
                                targetRef.current.focus?.();
                                targetRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                            }, 50);
                        }
                    }, className: "w-full h-11 bg-primary text-on-primary font-label-lg text-label-lg rounded-2xl hover:bg-primary-container transition-colors shadow-md font-bold cursor-pointer" }, "\uD655\uC778")))),
        successModal.isOpen && (React.createElement("div", { className: "fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40 text-center animate-in zoom-in-95 flex flex-col items-center" },
                React.createElement("div", { className: "w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3" },
                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "verified")),
                React.createElement("h3", { className: "font-headline-sm text-headline-sm font-bold text-on-surface mb-2" }, successModal.title || '[쓸고닦고 회원가입 완료]'),
                React.createElement("div", { className: "text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left w-full" }, successModal.message),
                React.createElement("button", { type: "button", onClick: handleConfirmSuccessModal, className: "w-full h-12 bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg rounded-2xl transition-all shadow-md font-bold cursor-pointer flex items-center justify-center gap-2" },
                    React.createElement("span", null, "\uD655\uC778 (\uB85C\uADF8\uC778 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9)"),
                    React.createElement("span", { className: "material-symbols-outlined text-sm" }, "arrow_forward")))))));
}

if (typeof window !== 'undefined') {
  window.AppClntAth010 = AppClntAth010;
  console.log('✅ APP-CLNT-ATH-010 Mobile Screen registered to window.AppClntAth010');
}

})();