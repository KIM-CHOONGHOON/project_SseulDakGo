(function() {
const { useState, useEffect, useCallback, useMemo } = window.React;
const React = window.React;
/**
 * 네이티브 햅틱 피드백 트리거 (Capacitor Bridge 및 Web API Fallback)
 */
const triggerHaptic = (style = 'LIGHT') => {
    try {
        if (typeof window !== 'undefined') {
            if (style === 'SUCCESS') {
                if (window.Capacitor?.Plugins?.Haptics?.notification) {
                    window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' }).catch(() => { });
                    return;
                }
                if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                    navigator.vibrate([15, 50, 20]);
                    return;
                }
            }
            if (window.Capacitor?.Plugins?.Haptics?.impact) {
                window.Capacitor.Plugins.Haptics.impact({ style: style === 'SUCCESS' ? 'LIGHT' : style });
                return;
            }
            if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                navigator.vibrate(style === 'HEAVY' ? 25 : style === 'MEDIUM' ? 15 : 10);
            }
        }
    }
    catch (e) {
        // Silent catch
    }
};
/**
 * 네이티브 웹뷰 메시지 전송 헬퍼 (Capacitor / Custom Webview Shell 연동)
 */
const sendNativeMessage = (action, payload = {}) => {
    try {
        const message = JSON.stringify({ action, payload, timestamp: Date.now() });
        if (window.Capacitor?.toNative) {
            window.Capacitor.toNative(action, payload);
        }
        else if (window.ReactNativeWebView?.postMessage) {
            window.ReactNativeWebView.postMessage(message);
        }
        else if (typeof window !== 'undefined') {
            window.postMessage({ source: 'APP-CLNT-COM-000', action, payload }, '*');
        }
    }
    catch (e) {
        console.warn('[NATIVE_BRIDGE_WARN]', e);
    }
};
function AppClntReq000(props) {
    if (!props.visible)
        return null;
    if (typeof window !== 'undefined' && window.AppClntReq000) {
        return React.createElement(window.AppClntReq000, props);
    }
    return null;
}
function AppClntAth000(props) {
    if (!props.isOpen)
        return null;
    if (typeof window !== 'undefined' && window.AppClntAth000) {
        return React.createElement(window.AppClntAth000, props);
    }
    return null;
}
function AppClntAth010(props) {
    if (!props.isOpen)
        return null;
    if (typeof window !== 'undefined' && window.AppClntAth010) {
        return React.createElement(window.AppClntAth010, props);
    }
    return null;
}
function AppClntAth011(props) {
    if (!props.isOpen)
        return null;
    if (typeof window !== 'undefined' && window.AppClntAth011) {
        return React.createElement(window.AppClntAth011, props);
    }
    return null;
}
/**
 * 저장소 기반 초기 인증 상태 복원
 * - 앱/홈페이지 실행 시 기본은 '로그아웃 상태 (null)'
 * - 로그인 시 "로그인 유지" (SSEULDAKGO_KEEP_LOGIN = 'Y')가 선택된 경우에만 로그인 상태 유지
 * - "로그인 유지"가 아니면 앱 실행 시 로그아웃 상태로 시작
 */
function getInitialAuthUser() {
    try {
        if (typeof window === 'undefined' || !window.localStorage)
            return null;
        const isKeepLogin = window.localStorage.getItem('SSEULDAKGO_KEEP_LOGIN') === 'Y';
        if (isKeepLogin) {
            const stored = window.localStorage.getItem('SSEULDAKGO_AUTH_USER');
            if (stored) {
                const user = JSON.parse(stored);
                if (user && user.userNo && user.userNo !== 'GUEST') {
                    return user;
                }
            }
        }
        // 현재 세션 스토리지 (브라우저 탭 내 새로고침만 유지, 앱/브라우저 완전 재실행 시에는 비어 있음)
        if (window.sessionStorage) {
            const sessionStored = window.sessionStorage.getItem('SSEULDAKGO_AUTH_USER');
            if (sessionStored) {
                const user = JSON.parse(sessionStored);
                if (user && user.userNo && user.userNo !== 'GUEST') {
                    return user;
                }
            }
        }
    }
    catch (e) {
        console.warn('[AUTH_RESTORE_ERR]', e);
    }
    return null;
}
function AppClntCom000({ navigation, currentUser: initialUser = null, onNavigate, onOpenRequestModal }) {
    // 1. 상태 관리 (useState, useEffect): clientInfo, currentRegion, feedList, isReqModalOpen, selectedCategory
    const [clientInfo, setClientInfo] = useState(() => {
        if (initialUser && initialUser.userNo && initialUser.userNo !== 'C20261000001') {
            return {
                isGuest: false,
                userNo: initialUser.userNo,
                userNm: initialUser.userNm || '홍길동'
            };
        }
        const auth = getInitialAuthUser();
        return auth ? {
            isGuest: false,
            userNo: auth.userNo,
            userNm: auth.userNm || '홍길동'
        } : {
            isGuest: true,
            userNo: 'GUEST',
            userNm: '비회원'
        };
    });
    const [currentUser, setCurrentUser] = useState(() => {
        if (initialUser && initialUser.userNo && initialUser.userNo !== 'C20261000001') {
            return initialUser;
        }
        return getInitialAuthUser();
    });
    const [currentRegion, setCurrentRegion] = useState({
        sidoCd: '41',
        sigunguCd: '41281',
        regionNm: '경기 고양시 일산동구',
        sidoNm: '경기도',
        sigunguNm: '고양시 일산동구',
        displayNm: '고양시 일산동구'
    });
    // 실시간 발주 오더 목록 배열
    const [feedList, setFeedList] = useState([
        {
            orderNo: 'ORD2026103100001',
            cleanLargeCd: 'REGULAR',
            cleanLargeNm: '건물 정기관리',
            cleanMidCd: '빌라 공용부',
            cleanMidNm: '빌라 공용부',
            addrText: '경기 고양시 일산동구 마두동',
            proposedPrice: 240000,
            priceDisplay: '월 240,000원',
            orderStatus: 'BID_OPEN',
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDt: '2026-10-31 10:20:00',
            regDtText: '10분 전'
        },
        {
            orderNo: 'ORD2026103100002',
            cleanLargeCd: 'APPLIANCE',
            cleanLargeNm: '가전 분해청소',
            cleanMidCd: '시스템 4Way 에어컨 2대',
            cleanMidNm: '시스템 4Way 에어컨 2대',
            addrText: '경기 고양시 일산동구 백석동 오피스텔',
            proposedPrice: 260000,
            priceDisplay: '260,000원',
            orderStatus: 'BID_OPEN',
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDt: '2026-10-31 10:35:00',
            regDtText: '25분 전'
        },
        {
            orderNo: 'ORD2026103100003',
            cleanLargeCd: 'MOVEIN',
            cleanLargeNm: '입주/이사 대청소',
            cleanMidCd: '32평형 신축 아파트',
            cleanMidNm: '32평형 신축 아파트',
            addrText: '경기 고양시 일산동구 주엽동 문촌마을',
            proposedPrice: 384000,
            priceDisplay: '384,000원',
            orderStatus: 'BID_OPEN',
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDt: '2026-10-31 10:50:00',
            regDtText: '42분 전'
        },
        {
            orderNo: 'ORD2026103100004',
            cleanLargeCd: 'REGULAR',
            cleanLargeNm: '건물 정기관리',
            cleanMidCd: '5층 상가건물 공용부',
            cleanMidNm: '5층 상가건물 공용부',
            addrText: '경기 고양시 일산동구 장항동 라페스타 인근',
            proposedPrice: 320000,
            priceDisplay: '월 320,000원',
            orderStatus: 'BID_OPEN',
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDt: '2026-10-31 11:05:00',
            regDtText: '1시간 전'
        },
        {
            orderNo: 'ORD2026103100005',
            cleanLargeCd: 'REGULAR',
            cleanLargeNm: '건물 정기관리',
            cleanMidCd: '사무실 바닥 왁스코팅',
            cleanMidNm: '사무실 바닥 왁스코팅',
            addrText: '경기 고양시 일산동구 식사동 지식산업센터',
            proposedPrice: 450000,
            priceDisplay: '450,000원',
            orderStatus: 'BID_OPEN',
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDt: '2026-10-31 11:15:00',
            regDtText: '3시간 전'
        }
    ]);
    // 청소 요청 모달(APP-CLNT-REQ-000) 출력 여부 (Boolean)
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);
    // 선택된 대분류 TAB ('REGULAR', 'APPLIANCE', 'MOVEIN')
    const [selectedCategory, setSelectedCategory] = useState('REGULAR');
    // 활성 탭 (GNB)
    const [activeNavTab, setActiveNavTab] = useState('home');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAssuranceModalOpen, setIsAssuranceModalOpen] = useState(false);
    // 라우터 통합 헬퍼 (React Navigation 및 onNavigate 호환)
    const navigateScreen = useCallback((screenId, params) => {
        if (screenId === 'APP-CLNT-ATH-000') {
            setIsReqModalOpen(false);
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
            return;
        }
        if (screenId === 'APP-CLNT-ATH-010') {
            setIsReqModalOpen(false);
            setIsLoginModalOpen(false);
            setIsWelcomeModalOpen(false);
            setIsRegisterModalOpen(true);
            return;
        }
        if (screenId === 'APP-CLNT-ATH-011') {
            setIsReqModalOpen(false);
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(false);
            setIsWelcomeModalOpen(true);
            return;
        }
        if (navigation?.navigate) {
            navigation.navigate(screenId, params);
        }
        else if (onNavigate) {
            onNavigate(screenId, params);
        }
        else {
            sendNativeMessage('NAVIGATE', { screenId, ...params });
        }
    }, [navigation, onNavigate]);
    // 2-1. 인터랙티브 로그인 및 회원가입 모달 상태
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
    const [welcomeUserData, setWelcomeUserData] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPwd, setLoginPwd] = useState('');
    const [showLoginPwd, setShowLoginPwd] = useState(false);
    const [saveId, setSaveId] = useState(false);
    const [keepLogin, setKeepLogin] = useState(false);
    const [loginRole, setLoginRole] = useState('C');
    const [loginError, setLoginError] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    // 로그인 모달 오픈 시 저장된 아이디 복원
    useEffect(() => {
        if (isLoginModalOpen) {
            setLoginError('');
            try {
                const savedUserStr = localStorage.getItem('SSEULDAKGO_SAVED_USER');
                if (savedUserStr) {
                    const saved = JSON.parse(savedUserStr);
                    if (saved && saved.email) {
                        setLoginEmail(saved.email);
                        if (saved.role)
                            setLoginRole(saved.role);
                        setSaveId(true);
                    }
                }
            }
            catch (e) {
                // ignore
            }
        }
    }, [isLoginModalOpen]);
    // 비회원 청소 신청 임시 저장 후 로그인 모달 자동 오픈 전역 이벤트 수신
    useEffect(() => {
        const handleOpenLogin = () => {
            setIsReqModalOpen(false);
            setIsLoginModalOpen(true);
        };
        window.addEventListener('OPEN_LOGIN_MODAL', handleOpenLogin);
        return () => window.removeEventListener('OPEN_LOGIN_MODAL', handleOpenLogin);
    }, []);
    // 로그인 제출 핸들러 (아이디저장 / 로그인유지 저장소 분기)
    const handleLoginSubmit = async (e) => {
        if (e)
            e.preventDefault();
        setLoginError('');
        if (!loginEmail.trim()) {
            setLoginError('이메일 주소를 입력해 주세요.');
            return;
        }
        if (!loginPwd.trim()) {
            setLoginError('비밀번호를 입력해 주세요.');
            return;
        }
        setIsLoginLoading(true);
        try {
            const res = await fetch('/api/web/client/ath_000', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userRoleCd: loginRole,
                    userEmail: loginEmail.trim(),
                    userPwd: loginPwd,
                    keepLogin
                })
            });
            const data = await res.json().catch(() => null);
            const resolvedUser = (res.ok && data?.success && data?.data) ? {
                userNo: data.data.userNo || (loginRole === 'C' ? 'C20261000001' : 'S20261000001'),
                userNm: data.data.userNm || (loginRole === 'C' ? '홍길동' : '김반장 (마스터)'),
                userEmail: loginEmail.trim(),
                userRoleCd: loginRole,
                isCertified: true,
                profileImgUrl: data.data.profileImgUrl || 'https://lh3.googleusercontent.com/aida/AEtjO1Vtg-nspCId3LFFl8bQtzkwwCoejmTXWkXuQgQpI7AVXLsygeLJFegqepJ51HGICy1rnoEpCRYWjA1hpyvlPtj7jzFnZofuI_4vLIMBAL9eK6NFhFnwkeDZOYiLrc4ccPsV8SZRof_anM0LSci41U2h45PuPEzzA29Gvv2pLq1sc_b2KoozoXeDyZCKFBQrDU3tc_PkEhdqtRZeDszo0yDyhm9Z3wFlqXOB_88J65eVMqD4AmJ73G6BG88'
            } : {
                userNo: loginRole === 'C' ? 'C20261000001' : 'S20261000001',
                userNm: loginRole === 'C' ? '홍길동' : '김반장 (마스터)',
                userEmail: loginEmail.trim(),
                userRoleCd: loginRole,
                isCertified: true,
                profileImgUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1Vtg-nspCId3LFFl8bQtzkwwCoejmTXWkXuQgQpI7AVXLsygeLJFegqepJ51HGICy1rnoEpCRYWjA1hpyvlPtj7jzFnZofuI_4vLIMBAL9eK6NFhFnwkeDZOYiLrc4ccPsV8SZRof_anM0LSci41U2h45PuPEzzA29Gvv2pLq1sc_b2KoozoXeDyZCKFBQrDU3tc_PkEhdqtRZeDszo0yDyhm9Z3wFlqXOB_88J65eVMqD4AmJ73G6BG88'
            };
            // 1. [아이디 저장] 처리
            if (saveId) {
                localStorage.setItem('SSEULDAKGO_SAVED_USER', JSON.stringify({ role: loginRole, email: loginEmail.trim() }));
            }
            else {
                localStorage.removeItem('SSEULDAKGO_SAVED_USER');
            }
            // 2. [로그인 유지] 처리
            // 로그인 유지 선택 시: localStorage에 영구 저장 (앱/브라우저 재실행 시 유지)
            // 로그인 유지 미선택 시: localStorage 제거, sessionStorage에만 임시 보관 (재실행 시 자동 로그아웃)
            if (keepLogin) {
                localStorage.setItem('SSEULDAKGO_KEEP_LOGIN', 'Y');
                localStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
                sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
            }
            else {
                localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
                localStorage.removeItem('SSEULDAKGO_AUTH_USER');
                sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
            }
            setCurrentUser(resolvedUser);
            setIsLoginModalOpen(false);
            triggerHaptic('MEDIUM');
            alert(`환영합니다, ${resolvedUser.userNm}님!\n${keepLogin ? '✅ [로그인 유지] 상태로 설정되었습니다. (앱 재실행 시 자동 로그인)' : 'ℹ️ [일반 로그인] 상태로 설정되었습니다. (앱 재실행 시 로그아웃 상태로 시작)'}`);
        }
        catch (err) {
            console.warn('[LOGIN_ERROR]', err);
        }
        finally {
            setIsLoginLoading(false);
        }
    };
    // 로그아웃 핸들러
    const handleLogout = () => {
        triggerHaptic('LIGHT');
        try {
            localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
            localStorage.removeItem('SSEULDAKGO_AUTH_USER');
            sessionStorage.removeItem('SSEULDAKGO_AUTH_USER');
        }
        catch (e) {
            // ignore
        }
        setCurrentUser(null);
        alert('로그아웃되었습니다.');
    };
    // 4. 백엔드 데이터 동기화 (POST /api/app/client/com_000)
    const fetchAppHomeData = useCallback(async () => {
        try {
            const response = await fetch('/api/app/client/com_000', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientUserNo: clientInfo.userNo || currentUser?.userNo || 'GUEST',
                    sidoCd: currentRegion.sidoCd || '41',
                    sigunguCd: currentRegion.sigunguCd || '41281'
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    if (Array.isArray(result.data.realtimeFeeds) && result.data.realtimeFeeds.length > 0) {
                        setFeedList(result.data.realtimeFeeds);
                    }
                    else if (Array.isArray(result.data.feedList) && result.data.feedList.length > 0) {
                        setFeedList(result.data.feedList);
                    }
                    if (result.data.clientInfo) {
                        setClientInfo(result.data.clientInfo);
                    }
                    if (result.data.currentRegion) {
                        setCurrentRegion((prev) => ({
                            ...prev,
                            ...result.data.currentRegion,
                            displayNm: result.data.currentRegion.regionNm || prev.displayNm
                        }));
                    }
                }
            }
        }
        catch (e) {
            console.warn('[FETCH_APP_HOME_DATA_FALLBACK]', e);
        }
    }, [clientInfo.userNo, currentUser, currentRegion.sidoCd, currentRegion.sigunguCd]);
    // Pull-to-Refresh(새로고침 제어) 핸들러
    const handlePullToRefresh = useCallback(async () => {
        setIsRefreshing(true);
        triggerHaptic('LIGHT');
        await fetchAppHomeData();
        setIsRefreshing(false);
    }, [fetchAppHomeData]);
    useEffect(() => {
        fetchAppHomeData();
        // 15초 주기 모바일 백그라운드 폴링
        const timer = setInterval(fetchAppHomeData, 15000);
        return () => clearInterval(timer);
    }, [fetchAppHomeData]);
    // 5. Capacitor 네이티브 뒤로가기 버튼 리스너 연동
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.App?.addListener) {
            const listener = window.Capacitor.Plugins.App.addListener('backButton', () => {
                if (isReqModalOpen) {
                    setIsReqModalOpen(false);
                }
                else if (isAssuranceModalOpen) {
                    setIsAssuranceModalOpen(false);
                }
                else if (activeNavTab !== 'home') {
                    setActiveNavTab('home');
                }
                else {
                    sendNativeMessage('EXIT_APP');
                }
            });
            return () => {
                listener.remove();
            };
        }
    }, [isReqModalOpen, isAssuranceModalOpen, activeNavTab]);
    // 모달 열기 핸들러
    const handleOpenCategoryModal = (category) => {
        triggerHaptic('LIGHT');
        setSelectedCategory(category);
        setIsReqModalOpen(true);
        sendNativeMessage('OPEN_MODAL', { modal: 'APP-CLNT-REQ-000', category });
    };
    // 모달 닫기 핸들러
    const handleCloseCategoryModal = () => {
        triggerHaptic('LIGHT');
        setIsReqModalOpen(false);
    };
    // 요청서 작성 시작 -> APP-CLNT-REQ-000 화면 진입
    const handleStartRequest = () => {
        triggerHaptic('MEDIUM');
        setIsReqModalOpen(false);
        if (onOpenRequestModal) {
            onOpenRequestModal(selectedCategory);
        }
        else {
            navigateScreen('APP-CLNT-REQ-000', { category: selectedCategory });
        }
    };
    // 지역 순환 토글 (일산동구 -> 일산서구 -> 덕양구 -> 서울 강남구)
    const handleToggleRegion = () => {
        triggerHaptic('LIGHT');
        const regions = [
            { sidoCd: '41', sigunguCd: '41281', regionNm: '경기 고양시 일산동구', sidoNm: '경기도', sigunguNm: '고양시 일산동구', displayNm: '고양시 일산동구' },
            { sidoCd: '41', sigunguCd: '41285', regionNm: '경기 고양시 일산서구', sidoNm: '경기도', sigunguNm: '고양시 일산서구', displayNm: '고양시 일산서구' },
            { sidoCd: '41', sigunguCd: '41287', regionNm: '경기 고양시 덕양구', sidoNm: '경기도', sigunguNm: '고양시 덕양구', displayNm: '고양시 덕양구' },
            { sidoCd: '11', sigunguCd: '11680', regionNm: '서울 강남구', sidoNm: '서울특별시', sigunguNm: '서울 강남구', displayNm: '서울 강남구' }
        ];
        const currentIndex = regions.findIndex((r) => r.sigunguCd === currentRegion.sigunguCd);
        const nextRegion = regions[(currentIndex + 1) % regions.length];
        setCurrentRegion(nextRegion);
    };
    // 네비게이션 탭 클릭
    const handleTabClick = (tab) => {
        triggerHaptic('LIGHT');
        setActiveNavTab(tab);
        if (tab === 'application-status') {
            if (!currentUser) {
                alert('신청현황 조회를 위해 먼저 로그인해 주세요.');
                setIsLoginModalOpen(true);
                return;
            }
            onNavigate?.('APP-CLNT-ORD-000');
        }
        else if (tab === 'usage-history') {
            if (!currentUser) {
                alert('이용내역 조회를 위해 먼저 로그인해 주세요.');
                setIsLoginModalOpen(true);
                return;
            }
            onNavigate?.('APP-CLNT-JOB-000');
        }
        else if (tab === 'my-page') {
            if (!currentUser) {
                alert('내정보 조회를 위해 먼저 로그인해 주세요.');
                setIsLoginModalOpen(true);
                return;
            }
            setWelcomeUserData({
                userNo: currentUser.userNo,
                userNm: currentUser.userNm,
                userEmail: currentUser.userEmail || '',
                userRoleCd: currentUser.userRoleCd || 'C',
                signImgUrl: currentUser.signImgUrl || null,
            });
            setIsWelcomeModalOpen(true);
        }
    };
    // 모달 카테고리 타이틀 동적 연산
    const modalCategoryTitle = useMemo(() => {
        if (selectedCategory === 'REGULAR')
            return '건물 정기관리 견적 요청서';
        if (selectedCategory === 'APPLIANCE')
            return '가전 분해청소 견적 요청서';
        if (selectedCategory === 'MOVEIN')
            return '입주/이사 대청소 견적 요청서';
        return '신규 청소 견적 요청서 작성';
    }, [selectedCategory]);
    return (React.createElement("div", { className: "bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen selection:bg-secondary-container antialiased" },
        React.createElement("section", { className: "pt-safe px-gutter-mobile pt-3 pb-1 max-w-md mx-auto w-full" },
            React.createElement("div", { className: "p-3 bg-surface-container-lowest rounded-2xl flex items-center justify-between border border-slate-200/50 shadow-xs" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/40" },
                        React.createElement("img", { alt: "\uC5E0\uBE14\uB7FC", className: "w-full h-full object-cover", src: "/logo.png", onError: (e) => {
                                e.target.src =
                                    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_JxHm0Bzno0xmsjfqXLrOutj75uRZrgum8mJS4iWYFnNEnaMJJd4_HMzgnnedTERR-zT_eyVay8IXxdmANniACDO_jMnsn9VWxbRQZuPZ7hfIHYopiWcU_U1kXwXFrKJgMaR7-DiZpPw2yd6VwCV3uUSx6FgTSvwc2AsrnLY5HfojeYF04E-q6gOanr8mhM4JOzBGOTKl9XkOJzEMGXXFvkBu32EsLLKYrFcdU0J-K45Sn7J5cprv';
                            } })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement("span", { className: "font-label-sm text-label-sm text-primary font-bold" }, "\uC4F8\uACE0\uB531\uACE0"),
                            React.createElement("span", { className: "px-1.5 py-0.2 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-md font-semibold text-[10px]" }, "\uACF5\uC2DD\uC778\uC99D"),
                            React.createElement("span", { className: "px-1.5 py-0.2 bg-surface-container text-secondary font-label-sm text-label-sm rounded-md font-semibold text-[10px]" }, "\uACE0\uAC1D\uC6A9")),
                        React.createElement("p", { className: "font-caption text-[11px] text-on-surface-variant" }, "\uAC00\uACA9 \uD765\uC815 \uC5C6\uB294 100% \uACE0\uAC1D \uD655\uC815\uAC00 \uC9C1\uB9E4\uCE6D"))),
                React.createElement("div", { className: "flex items-center gap-1.5 shrink-0" },
                    React.createElement("button", { type: "button", id: "btn-header-login", onClick: () => {
                            triggerHaptic('LIGHT');
                            setIsLoginModalOpen(true);
                        }, className: "h-7 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center" }, "\uB85C\uADF8\uC778"),
                    React.createElement("button", { type: "button", id: "btn-header-logout", onClick: () => {
                            triggerHaptic('LIGHT');
                            handleLogout();
                        }, className: "h-7 px-2 rounded-lg bg-surface-container-high hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-sm text-label-sm font-semibold transition-all cursor-pointer flex items-center" }, "\uB85C\uADF8\uC544\uC6C3")))),
        React.createElement("main", { className: "flex-1 flex flex-col relative w-full pb-28 bg-surface", style: { paddingBottom: 120 } },
            isRefreshing && (React.createElement("div", { className: "w-full py-2 bg-secondary-container/40 text-on-secondary-container text-label-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in" },
                React.createElement("span", { className: "w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" }),
                React.createElement("span", null, "\uC2E4\uC2DC\uAC04 \uC811\uC218 \uC815\uBCF4\uB97C \uC0C8\uB85C\uACE0\uCE68\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4..."))),
            React.createElement("div", { className: "flex flex-col w-full", id: "view-APP-CLNT-COM-000" },
                React.createElement("section", { className: "px-gutter-mobile pt-space-md pb-space-sm flex flex-col gap-space-sm" },
                    React.createElement("div", { className: "flex flex-col" },
                        React.createElement("h2", { className: "font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold leading-tight" },
                            "\uC6D0\uD558\uB294 \uCCAD\uC18C\uB97C \uC120\uD0DD\uD558\uACE0",
                            React.createElement("br", null),
                            "\uD655\uC815 \uAE08\uC561\uC73C\uB85C \uBC14\uB85C \uBC1C\uC8FC\uD558\uC138\uC694"),
                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1" }, "\uC218\uC218\uB8CC \uBD80\uB2F4 \uC5C6\uB294 \uC5ED\uACBD\uB9E4 0\uC6D0 \u2022 \uD30C\uD2B8\uB108 \uC804\uB2F4 \uC2DC\uACF5 \uB9E4\uCE6D")),
                    React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50", "data-category": "REGULAR", onClick: () => handleOpenCategoryModal('REGULAR') },
                        React.createElement("div", { className: "flex items-start justify-between gap-space-sm" },
                            React.createElement("div", { className: "flex flex-col gap-1 min-w-0 flex-1" },
                                React.createElement("div", { className: "flex items-center gap-space-xs flex-wrap" },
                                    React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold" }, "\uCD5C\uC18C 3\uAC1C\uC6D4(90\uC77C) \uB77D"),
                                    React.createElement("span", { className: "font-caption text-caption text-outline", "data-field": "CLEAN_LARGE_CD" }, "\uC815\uAE30\uCCAD\uC18C")),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold" }, "\uAC74\uBB3C \uC815\uAE30\uAD00\uB9AC"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant line-clamp-1" }, "\uACC4\uB2E8, \uBCF5\uB3C4, \uC678\uACFD, \uBD84\uB9AC\uC218\uAC70\uC7A5 \uACF5\uC6A9\uBD80 \uCF00\uC5B4")),
                            React.createElement("div", { className: "w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0" },
                                React.createElement("span", { className: "material-symbols-outlined text-headline-md" }, "apartment"))),
                        React.createElement("div", { className: "mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-1 text-on-surface-variant" },
                                React.createElement("span", { className: "material-symbols-outlined text-label-md text-secondary" }, "verified_user"),
                                React.createElement("span", { className: "font-caption text-caption" }, "\uC9C0\uC815 \uC694\uC77C\uC81C \u00B7 \uC0AC\uC9C4 \uBCF4\uACE0")),
                            React.createElement("div", { className: "inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold" },
                                React.createElement("span", null, "\uBC14\uB85C \uC791\uC131"),
                                React.createElement("span", { className: "material-symbols-outlined text-body-sm" }, "arrow_forward_ios")))),
                    React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50", "data-category": "APPLIANCE", onClick: () => handleOpenCategoryModal('APPLIANCE') },
                        React.createElement("div", { className: "flex items-start justify-between gap-space-sm" },
                            React.createElement("div", { className: "flex flex-col gap-1 min-w-0 flex-1" },
                                React.createElement("div", { className: "flex items-center gap-space-xs flex-wrap" },
                                    React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold" }, "\uC644\uC804\uBD84\uD574 \uC0B4\uADE0\uC138\uCC99"),
                                    React.createElement("span", { className: "font-caption text-caption text-outline", "data-field": "CLEAN_LARGE_CD" }, "\uACC4\uC808\uAC00\uC804")),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold" }, "\uAC00\uC804 \uBD84\uD574\uCCAD\uC18C"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant line-clamp-1" }, "\uC5D0\uC5B4\uCEE8, \uC138\uD0C1\uAE30 \uACE0\uC555 \uC2A4\uD300 \uC18C\uB3C5 \uBC0F \uD544\uD130 \uCF54\uD305")),
                            React.createElement("div", { className: "w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0" },
                                React.createElement("span", { className: "material-symbols-outlined text-headline-md" }, "mode_fan"))),
                        React.createElement("div", { className: "mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-1 text-on-surface-variant" },
                                React.createElement("span", { className: "material-symbols-outlined text-label-md text-secondary" }, "mode_heat"),
                                React.createElement("span", { className: "font-caption text-caption" }, "130\u2103 \uCE5C\uD658\uACBD \uACE0\uC555\uC2A4\uD300")),
                            React.createElement("div", { className: "inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold" },
                                React.createElement("span", null, "\uBC14\uB85C \uC791\uC131"),
                                React.createElement("span", { className: "material-symbols-outlined text-body-sm" }, "arrow_forward_ios")))),
                    React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50", "data-category": "MOVEIN", onClick: () => handleOpenCategoryModal('MOVEIN') },
                        React.createElement("div", { className: "flex items-start justify-between gap-space-sm" },
                            React.createElement("div", { className: "flex flex-col gap-1 min-w-0 flex-1" },
                                React.createElement("div", { className: "flex items-center gap-space-xs flex-wrap" },
                                    React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold" }, "\uC2E4\uB0B4 \uC804\uC6A9\uACF5\uAC04 \uCF00\uC5B4"),
                                    React.createElement("span", { className: "font-caption text-caption text-outline", "data-field": "CLEAN_LARGE_CD" }, "\uC785\uC8FC\uCCAD\uC18C")),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold" }, "\uC785\uC8FC/\uC774\uC0AC \uB300\uCCAD\uC18C"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant line-clamp-1" }, "\uC2E0\uCD95 \uC785\uC8FC, \uC774\uC0AC \uC804 \uBBF8\uC138\uBD84\uC9C4/\uCC0C\uB4E0 \uB54C \uC815\uBC00 \uCF00\uC5B4")),
                            React.createElement("div", { className: "w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0" },
                                React.createElement("span", { className: "material-symbols-outlined text-headline-md" }, "sanitizer"))),
                        React.createElement("div", { className: "mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-1 text-on-surface-variant" },
                                React.createElement("span", { className: "material-symbols-outlined text-label-md text-secondary" }, "sanitizer"),
                                React.createElement("span", { className: "font-caption text-caption" }, "\uD53C\uD1A4\uCE58\uB4DC \uC5F0\uBB34 \uBB34\uB8CC \uC18C\uB3C5")),
                            React.createElement("div", { className: "inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold" },
                                React.createElement("span", null, "\uBC14\uB85C \uC791\uC131"),
                                React.createElement("span", { className: "material-symbols-outlined text-body-sm" }, "arrow_forward_ios"))))),
                React.createElement("section", { className: "px-gutter-mobile py-space-xs" },
                    React.createElement("div", { className: "bg-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden" },
                        React.createElement("div", { className: "absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary/30 blur-2xl pointer-events-none" }),
                        React.createElement("div", { className: "relative z-10 flex flex-col gap-space-xs" },
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                React.createElement("span", { className: "material-symbols-outlined text-headline-sm text-secondary-container" }, "verified"),
                                React.createElement("h4", { className: "font-headline-sm text-headline-sm text-on-primary font-bold" }, "\uC4F8\uACE0\uB531\uACE0")),
                            React.createElement("p", { className: "font-caption text-caption text-surface-container-high leading-relaxed" }, "\uC2DC\uACF5\uC0AC \uCCAD\uC57D\uC774 \uC644\uB8CC\uB418\uBA74 \uC2DC\uACF5\uC0AC\uC758 \uBCC4\uC810, \uD6C4\uAE30\uAE00\uC744 \uCC38\uACE0\uD558\uC138\uC694. \"\uAC74\uBB3C \uC815\uAE30\uAD00\uB9AC, \uAC00\uC804 \uBD84\uD574\uCCAD\uC18C, \uC785\uC8FC/\uC774\uC0AC\uCCAD\uC18C\" \uBCC4 \uAC01\uAC01 3\uD68C \uC2DC\uACF5\uC0AC\uB97C \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4"),
                            React.createElement("button", { type: "button", onClick: () => setIsAssuranceModalOpen(true), className: "inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary-fixed mt-1 hover:underline text-left cursor-pointer" },
                                React.createElement("span", null, "\uC774\uC6A9 \uC57D\uAD00 \uBCF4\uAE30"),
                                React.createElement("span", { className: "material-symbols-outlined text-caption" }, "chevron_right"))))),
                React.createElement("section", { className: "px-gutter-mobile py-space-xs" },
                    React.createElement("div", { className: "bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs border border-slate-200/40" },
                        React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-body-sm text-primary" }, "info"),
                            React.createElement("span", { className: "font-label-md text-label-md text-primary font-semibold" }, "\uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC218\uC218\uB8CC \uC548\uB0B4")),
                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uC4F8\uACE0\uB2E6\uACE0\uB294 \uC2DC\uACF5 \uC778\uAC74\uBE44\uC5D0 \uC911\uAC04 \uB9C8\uC9C4\uC744 \uBD99\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD604\uC7A5 \uC778\uAC74\uBE44\uB294 \uC2DC\uACF5 \uD6C4 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uACB0\uC81C\uB429\uB2C8\uB2E4."))),
                React.createElement("section", { className: "px-gutter-mobile pt-space-md pb-space-xl flex flex-col gap-space-sm" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "flex h-3 w-3 relative" },
                                React.createElement("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" }),
                                React.createElement("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-secondary" })),
                            React.createElement("h3", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC2E4\uC2DC\uAC04 \uC811\uC218 \uC815\uBCF4")),
                        React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, "\uC790\uB3D9 \uAC31\uC2E0")),
                    React.createElement("div", { className: "flex flex-col gap-space-sm" }, feedList.map((item, idx) => (React.createElement("div", { key: item.orderNo || idx, className: `bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs border border-slate-200/50 ${item.statusType === 'COMPLETED' ? 'opacity-80' : item.statusType === 'MATCHED' ? 'opacity-90' : ''}` },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "font-caption text-caption text-outline font-mono", "data-field": "ORDER_NO" }, item.orderNo),
                            React.createElement("div", { className: "flex items-center gap-1" },
                                item.statusType === 'MATCHED' ? (React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold" },
                                    React.createElement("span", { "data-field": "ORDER_STATUS" }, "\uB9E4\uCE6D\uC644\uB8CC"))) : item.statusType === 'COMPLETED' ? (React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold" },
                                    React.createElement("span", { "data-field": "ORDER_STATUS" }, "\uC2DC\uACF5\uC644\uB8CC"))) : (React.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold" },
                                    React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" }),
                                    React.createElement("span", { "data-field": "ORDER_STATUS" }, item.orderStatusNm || '청약접수중'))),
                                React.createElement("span", { className: "font-caption text-caption text-on-surface-variant", "data-field": "REG_DT" }, item.regDtText))),
                        React.createElement("div", { className: "flex items-baseline gap-1 mt-0.5" },
                            React.createElement("span", { className: "font-label-lg text-label-lg text-on-surface font-semibold", "data-field": "CLEAN_LARGE_CD" }, item.cleanLargeNm),
                            React.createElement("span", { className: "text-on-surface-variant text-caption" }, "\u2022"),
                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface-variant", "data-field": "CLEAN_MID_CD" }, item.cleanMidNm)),
                        React.createElement("div", { className: "flex items-center gap-1 text-on-surface-variant font-caption text-caption" },
                            React.createElement("span", { className: "material-symbols-outlined text-caption text-secondary" }, "pin_drop"),
                            React.createElement("span", { className: "truncate", "data-field": "ADDR_TEXT" }, item.addrText)),
                        React.createElement("div", { className: "mt-space-xs pt-space-xs flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg" },
                            React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, item.statusType === 'COMPLETED' ? '최종 시공완료' : item.statusType === 'MATCHED' ? '계약 체결가' : '고객 지정 확정금액'),
                            React.createElement("span", { className: `font-headline-sm text-headline-sm font-bold ${item.statusType === 'COMPLETED' ? 'text-on-surface-variant' : item.statusType === 'MATCHED' ? 'text-primary' : 'text-secondary'}`, "data-field": "PROPOSED_PRICE" }, item.priceDisplay))))))))),
        React.createElement("div", { className: "fixed bottom-[68px] inset-x-0 z-40 px-gutter-mobile pointer-events-none pb-safe" },
            React.createElement("div", { className: "max-w-md mx-auto pointer-events-auto" },
                React.createElement("button", { id: "btn-fast-request", type: "button", onClick: () => {
                        triggerHaptic('MEDIUM');
                        setSelectedCategory('REGULAR');
                        setIsReqModalOpen(true);
                    }, className: "w-full h-[50px] bg-secondary text-on-secondary rounded-xl font-label-lg text-label-lg shadow-xl hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold" },
                    React.createElement("span", { className: "material-symbols-outlined text-headline-sm" }, "add_circle"),
                    React.createElement("span", null, "+ \uC6B0\uB9AC \uC9D1 \uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uAE30 (\uBE44\uB85C\uADF8\uC778 \uAC00\uB2A5)")))),
        React.createElement("nav", { className: "fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-1px_10px_rgba(0,0,0,0.06)] border-t border-slate-200/60", "data-active-classes": "text-secondary font-label-md" },
            React.createElement("div", { className: "flex justify-around items-center h-[58px] px-2 max-w-md mx-auto" },
                React.createElement("button", { type: "button", onClick: () => handleTabClick('home'), className: `flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${activeNavTab === 'home' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}` },
                    React.createElement("span", { className: "material-symbols-outlined text-headline-sm" }, "home"),
                    React.createElement("span", { className: "font-label-sm text-label-sm" }, "\uD648")),
                React.createElement("button", { type: "button", onClick: () => handleTabClick('application-status'), className: `flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${activeNavTab === 'application-status' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}` },
                    React.createElement("span", { className: "material-symbols-outlined text-headline-sm" }, "pending_actions"),
                    React.createElement("span", { className: "font-label-sm text-label-sm" }, "\uC2E0\uCCAD\uD604\uD669")),
                React.createElement("button", { type: "button", onClick: () => handleTabClick('usage-history'), className: `flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${activeNavTab === 'usage-history' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}` },
                    React.createElement("span", { className: "material-symbols-outlined text-headline-sm" }, "receipt_long"),
                    React.createElement("span", { className: "font-label-sm text-label-sm" }, "\uC774\uC6A9\uB0B4\uC5ED")),
                React.createElement("button", { type: "button", onClick: () => handleTabClick('my-page'), className: `flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${activeNavTab === 'my-page' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'}` },
                    React.createElement("span", { className: "material-symbols-outlined text-headline-sm" }, "person"),
                    React.createElement("span", { className: "font-label-sm text-label-sm" }, currentUser ? '내정보' : '마이페이지')))),
        React.createElement(AppClntReq000, { visible: isReqModalOpen, initialTab: selectedCategory, onClose: () => setIsReqModalOpen(false), onOpenLogin: () => {
                setIsReqModalOpen(false);
                setIsLoginModalOpen(true);
            }, onNavigate: navigateScreen }),
        isAssuranceModalOpen && (React.createElement("div", { onClick: () => setIsAssuranceModalOpen(false), className: "fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" },
            React.createElement("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md animate-in zoom-in-95 border border-slate-200/60" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC774\uC6A9 \uC57D\uAD00 \uC548\uB0B4"),
                    React.createElement("button", { type: "button", onClick: () => setIsAssuranceModalOpen(false), className: "w-8 h-8 flex items-center justify-center text-on-surface-variant cursor-pointer" },
                        React.createElement("span", { className: "material-symbols-outlined" }, "close"))),
                React.createElement("div", { className: "flex flex-col gap-2 font-body-sm text-body-sm text-on-surface leading-relaxed" },
                    React.createElement("p", null,
                        React.createElement("strong", null, "1. \uC2DC\uACF5\uC0AC \uCCAD\uC57D \uBC0F \uD3C9\uAC00 \uC9C0\uD45C"),
                        React.createElement("br", null),
                        "\uC2DC\uACF5\uC0AC \uCCAD\uC57D\uC774 \uC644\uB8CC\uB418\uBA74 \uC2DC\uACF5\uC0AC\uC758 \uBCC4\uC810, \uD6C4\uAE30\uAE00, \uC804\uBB38 \uC7A5\uBE44 \uBC0F \uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8 \uAC00\uC785 \uC5EC\uBD80\uB97C \uAF3C\uAF3C\uD558\uAC8C \uBE44\uAD50\u00B7\uC120\uD0DD\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                    React.createElement("p", null,
                        React.createElement("strong", null, "2. \uC11C\uBE44\uC2A4\uBCC4 3\uD68C \uC2DC\uACF5\uC0AC \uBCC0\uACBD \uAD8C\uD55C"),
                        React.createElement("br", null),
                        "\"\uAC74\uBB3C \uC815\uAE30\uAD00\uB9AC, \uAC00\uC804 \uBD84\uD574\uCCAD\uC18C, \uC785\uC8FC/\uC774\uC0AC\uCCAD\uC18C\" \uBCC4 \uAC01\uAC01 \uCD5C\uB300 3\uD68C\uAE4C\uC9C0 \uACE0\uAC1D\uC774 \uC6D0\uD558\uB294 \uB2E4\uB978 \uC2DC\uACF5\uC0AC\uB85C \uC790\uC720\uB86D\uAC8C \uBCC0\uACBD \uAC00\uB2A5\uD569\uB2C8\uB2E4."),
                    React.createElement("p", null,
                        React.createElement("strong", null, "3. 100% \uD604\uC7A5 \uC9C1\uBD88\uC81C \uC815\uC0B0 \uC6D0\uCE59"),
                        React.createElement("br", null),
                        "\uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC218\uC218\uB8CC \uC678 \uC2DC\uACF5 \uB178\uBB34\uBE44 \uBCF8\uAE08\uC740 \uC2DC\uACF5 \uC804/\uD6C4 \uC0AC\uC9C4 \uAC80\uC218 \uC644\uB8CC \uD6C4 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uC1A1\uAE08 \uB610\uB294 \uC9C0\uAE09\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { type: "button", onClick: () => setIsAssuranceModalOpen(false), className: "h-11 bg-primary text-on-primary rounded-xl font-label-md font-bold mt-2 cursor-pointer" }, "\uD655\uC778")))),
        React.createElement(AppClntAth000, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false), onSuccessLogin: (userData) => {
                triggerHaptic('SUCCESS');
                setCurrentUser(userData);
                setClientInfo({
                    isGuest: false,
                    userNo: userData.userNo,
                    userNm: userData.userNm,
                });
                setIsLoginModalOpen(false);
                alert(`[로그인 완료]\n${userData.userNm}님, 환영합니다!`);
                const hasSavedDraft = typeof window !== 'undefined' && Boolean(localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ'));
                if (userData.hasTempReq || hasSavedDraft) {
                    setIsReqModalOpen(true);
                }
            }, onOpenRegister: () => {
                setIsLoginModalOpen(false);
                setIsRegisterModalOpen(true);
                if (onNavigate) {
                    onNavigate('APP-CLNT-ATH-010');
                }
            }, onOpenFindPwd: () => alert('비밀번호 찾기 안내 메일이 발송됩니다.') }),
        React.createElement(AppClntAth010, { isOpen: isRegisterModalOpen, onClose: () => setIsRegisterModalOpen(false), onSuccessRegister: (userData) => {
                triggerHaptic('SUCCESS');
                setIsRegisterModalOpen(false);
                setWelcomeUserData(userData);
                setIsWelcomeModalOpen(true);
            }, onOpenLogin: () => {
                setIsRegisterModalOpen(false);
                setIsLoginModalOpen(true);
            } }),
        React.createElement(AppClntAth011, { isOpen: isWelcomeModalOpen, userInfo: welcomeUserData || (currentUser ? {
                userNo: currentUser.userNo,
                userNm: currentUser.userNm,
                userEmail: currentUser.userEmail || '',
                userTel: currentUser.userTel || '',
                userRoleCd: currentUser.userRoleCd || 'C',
                signImgUrl: currentUser.signImgUrl || null,
            } : null), onClose: () => setIsWelcomeModalOpen(false), onOpenRequestModal: () => {
                setIsWelcomeModalOpen(false);
                setIsReqModalOpen(true);
            }, onNavigate: navigateScreen })));
}


if (typeof window !== 'undefined') {
  window.AppClntCom000 = AppClntCom000;
  function mountMobileApp() {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM && window.React) {
      const isReqScreen = window.location.pathname.includes('/req_000') || window.location.search.includes('screen=req');
      const isRegisterScreen = window.location.search.includes('screen=register') || window.location.search.includes('screen=ath_010');
      let TargetComponent = window.AppClntCom000;
      if (isReqScreen && window.AppClntReq000) TargetComponent = window.AppClntReq000;
      if (isRegisterScreen && window.AppClntAth010) TargetComponent = window.AppClntAth010;
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(window.React.createElement(TargetComponent));
      console.log('✅ Mounted component:', TargetComponent?.name || 'Mobile App');
    } else {
      console.error('❌ Root element or ReactDOM not found');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountMobileApp);
  } else {
    mountMobileApp();
  }
}

})();