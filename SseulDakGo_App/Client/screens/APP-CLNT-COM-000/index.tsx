import React, { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * ============================================================================
 * [하이브리드 앱 모바일 프론트엔드]
 * 화면 ID: APP-CLNT-COM-000
 * 한글 화면명: 고객 모바일 홈 (웹뷰 기반 하이브리드 앱)
 * 파일 경로: SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.tsx
 * 아키텍처: Capacitor / WebView 껍데기 앱 내 패키징되는 반응형 React 컴포넌트
 * 연동 백엔드 API: POST /api/app/client/com_000
 *                (SseulDakGo_App/Client/backend/api_APP_CLNT_COM_000/route.js)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Capacitor / Webview Native Bridge 인터페이스 선언
// ----------------------------------------------------------------------------
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => 'ios' | 'android' | 'web';
      Plugins?: {
        Haptics?: {
          impact?: (options: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void>;
          notification?: (options: { type: 'SUCCESS' | 'WARNING' | 'ERROR' }) => Promise<void>;
        };
        StatusBar?: {
          setStyle?: (options: { style: 'LIGHT' | 'DARK' }) => Promise<void>;
          setBackgroundColor?: (options: { color: string }) => Promise<void>;
        };
        App?: {
          addListener?: (eventName: string, listener: (data: any) => void) => { remove: () => void };
          exitApp?: () => Promise<void>;
        };
      };
      toNative?: (event: string, data: any) => void;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * 네이티브 햅틱 피드백 트리거 (Capacitor Bridge 및 Web API Fallback)
 */
export const triggerHaptic = (style: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS' = 'LIGHT') => {
  try {
    if (typeof window !== 'undefined') {
      if (style === 'SUCCESS') {
        if (window.Capacitor?.Plugins?.Haptics?.notification) {
          window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
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
  } catch (e) {
    // Silent catch
  }
};

/**
 * 네이티브 웹뷰 메시지 전송 헬퍼 (Capacitor / Custom Webview Shell 연동)
 */
export const sendNativeMessage = (action: string, payload: Record<string, any> = {}) => {
  try {
    const message = JSON.stringify({ action, payload, timestamp: Date.now() });
    if (window.Capacitor?.toNative) {
      window.Capacitor.toNative(action, payload);
    } else if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(message);
    } else if (typeof window !== 'undefined') {
      window.postMessage({ source: 'APP-CLNT-COM-000', action, payload }, '*');
    }
  } catch (e) {
    console.warn('[NATIVE_BRIDGE_WARN]', e);
  }
};

export interface AppClntCom000Props {
  navigation?: {
    navigate: (screen: string, params?: any) => void;
    goBack?: () => void;
  };
  currentUser?: {
    userNo?: string;
    userNm?: string;
    userRoleCd?: string;
    isCertified?: boolean;
    profileImgUrl?: string;
  } | null;
  onNavigate?: (screenIdOrPath: string, params?: Record<string, any>) => void;
  onOpenRequestModal?: (category?: string) => void;
}

/**
 * [청소 요청 화면 컴포넌트] APP-CLNT-REQ-000
 * SseulDakGo_App/Client/screens/APP-CLNT-REQ-000/index.tsx 연동
 */
export interface AppClntReq000Props {
  visible: boolean;
  initialTab?: 'REGULAR' | 'APPLIANCE' | 'MOVEIN' | string;
  onClose: () => void;
  onOpenLogin?: () => void;
  onNavigate?: (screenId: string, params?: any) => void;
}

export function AppClntReq000(props: AppClntReq000Props) {
  if (!props.visible) return null;
  if (typeof window !== 'undefined' && (window as any).AppClntReq000) {
    return React.createElement((window as any).AppClntReq000, props);
  }
  return null;
}

/**
 * [로그인 화면 컴포넌트] APP-CLNT-ATH-000
 * SseulDakGo_App/Client/screens/APP-CLNT-ATH-000/index.tsx 연동 (WEB-CLNT-ATH-000 동일)
 */
export interface AppClntAth000Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (userData: any) => void;
  onOpenRegister?: () => void;
  onOpenFindPwd?: () => void;
}

export function AppClntAth000(props: AppClntAth000Props) {
  if (!props.isOpen) return null;
  if (typeof window !== 'undefined' && (window as any).AppClntAth000) {
    return React.createElement((window as any).AppClntAth000, props);
  }
  return null;
}

/**
 * [통합 회원가입 화면 컴포넌트] APP-CLNT-ATH-010
 * SseulDakGo_App/Client/screens/APP-CLNT-ATH-010/index.tsx 연동 (WEB-CLNT-ATH-010 동일)
 */
export interface AppClntAth010Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRegister?: (userData: any) => void;
  onOpenLogin?: () => void;
}

export function AppClntAth010(props: AppClntAth010Props) {
  if (!props.isOpen) return null;
  if (typeof window !== 'undefined' && (window as any).AppClntAth010) {
    return React.createElement((window as any).AppClntAth010, props);
  }
  return null;
}

/**
 * [가입 완료 환영 및 회원정보/약관/서명 관리 모달] APP-CLNT-ATH-011
 */
export interface AppClntAth011Props {
  isOpen: boolean;
  userInfo?: any;
  onClose: () => void;
  onOpenRequestModal?: () => void;
  onNavigate?: (screenId: string) => void;
}

export function AppClntAth011(props: AppClntAth011Props) {
  if (!props.isOpen) return null;
  if (typeof window !== 'undefined' && (window as any).AppClntAth011) {
    return React.createElement((window as any).AppClntAth011, props);
  }
  return null;
}

/**
 * 저장소 기반 초기 인증 상태 복원
 * - 앱/홈페이지 실행 시 기본은 '로그아웃 상태 (null)'
 * - 로그인 시 "로그인 유지" (SSEULDAKGO_KEEP_LOGIN = 'Y')가 선택된 경우에만 로그인 상태 유지
 * - "로그인 유지"가 아니면 앱 실행 시 로그아웃 상태로 시작
 */
export function getInitialAuthUser() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
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
  } catch (e) {
    console.warn('[AUTH_RESTORE_ERR]', e);
  }
  return null;
}

export default function AppClntCom000({
  navigation,
  currentUser: initialUser = null,
  onNavigate,
  onOpenRequestModal
}: AppClntCom000Props) {
  // 1. 상태 관리 (useState, useEffect): clientInfo, currentRegion, feedList, isReqModalOpen, selectedCategory
  const [clientInfo, setClientInfo] = useState<{ isGuest: boolean; userNo: string; userNm: string }>(() => {
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

  const [currentUser, setCurrentUser] = useState<any>(() => {
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
  const [feedList, setFeedList] = useState<any[]>([
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
  const [selectedCategory, setSelectedCategory] = useState<'REGULAR' | 'APPLIANCE' | 'MOVEIN'>('REGULAR');

  // 활성 탭 (GNB)
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'application-status' | 'usage-history' | 'my-page'>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAssuranceModalOpen, setIsAssuranceModalOpen] = useState(false);

  // 라우터 통합 헬퍼 (React Navigation 및 onNavigate 호환)
  const navigateScreen = useCallback((screenId: string, params?: any) => {
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
    } else if (onNavigate) {
      onNavigate(screenId, params);
    } else {
      sendNativeMessage('NAVIGATE', { screenId, ...params });
    }
  }, [navigation, onNavigate]);

  // 2-1. 인터랙티브 로그인 및 회원가입 모달 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeUserData, setWelcomeUserData] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);
  const [loginRole, setLoginRole] = useState<'C' | 'S'>('C');
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
            if (saved.role) setLoginRole(saved.role);
            setSaveId(true);
          }
        }
      } catch (e) {
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
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        localStorage.setItem(
          'SSEULDAKGO_SAVED_USER',
          JSON.stringify({ role: loginRole, email: loginEmail.trim() })
        );
      } else {
        localStorage.removeItem('SSEULDAKGO_SAVED_USER');
      }

      // 2. [로그인 유지] 처리
      // 로그인 유지 선택 시: localStorage에 영구 저장 (앱/브라우저 재실행 시 유지)
      // 로그인 유지 미선택 시: localStorage 제거, sessionStorage에만 임시 보관 (재실행 시 자동 로그아웃)
      if (keepLogin) {
        localStorage.setItem('SSEULDAKGO_KEEP_LOGIN', 'Y');
        localStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
        sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
      } else {
        localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
        localStorage.removeItem('SSEULDAKGO_AUTH_USER');
        sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(resolvedUser));
      }

      setCurrentUser(resolvedUser);
      setIsLoginModalOpen(false);
      triggerHaptic('MEDIUM');
      alert(`환영합니다, ${resolvedUser.userNm}님!\n${keepLogin ? '✅ [로그인 유지] 상태로 설정되었습니다. (앱 재실행 시 자동 로그인)' : 'ℹ️ [일반 로그인] 상태로 설정되었습니다. (앱 재실행 시 로그아웃 상태로 시작)'}`);
    } catch (err) {
      console.warn('[LOGIN_ERROR]', err);
    } finally {
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
    } catch (e) {
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
          } else if (Array.isArray(result.data.feedList) && result.data.feedList.length > 0) {
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
    } catch (e) {
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
        } else if (isAssuranceModalOpen) {
          setIsAssuranceModalOpen(false);
        } else if (activeNavTab !== 'home') {
          setActiveNavTab('home');
        } else {
          sendNativeMessage('EXIT_APP');
        }
      });
      return () => {
        listener.remove();
      };
    }
  }, [isReqModalOpen, isAssuranceModalOpen, activeNavTab]);

  // 모달 열기 핸들러
  const handleOpenCategoryModal = (category: 'REGULAR' | 'APPLIANCE' | 'MOVEIN') => {
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
    } else {
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
  const handleTabClick = (tab: 'home' | 'application-status' | 'usage-history' | 'my-page') => {
    triggerHaptic('LIGHT');
    setActiveNavTab(tab);
    if (tab === 'application-status') {
      if (!currentUser) {
        alert('신청현황 조회를 위해 먼저 로그인해 주세요.');
        setIsLoginModalOpen(true);
        return;
      }
      onNavigate?.('APP-CLNT-ORD-000');
    } else if (tab === 'usage-history') {
      if (!currentUser) {
        alert('이용내역 조회를 위해 먼저 로그인해 주세요.');
        setIsLoginModalOpen(true);
        return;
      }
      onNavigate?.('APP-CLNT-JOB-000');
    } else if (tab === 'my-page') {
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
    if (selectedCategory === 'REGULAR') return '건물 정기관리 견적 요청서';
    if (selectedCategory === 'APPLIANCE') return '가전 분해청소 견적 요청서';
    if (selectedCategory === 'MOVEIN') return '입주/이사 대청소 견적 요청서';
    return '신규 청소 견적 요청서 작성';
  }, [selectedCategory]);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen selection:bg-secondary-container antialiased">
      
      {/* Brand Sub-Banner with Official Badge (앱 최상단 헤더) */}
      <section className="pt-safe px-gutter-mobile pt-3 pb-1 max-w-md mx-auto w-full">
        <div className="p-3 bg-surface-container-lowest rounded-2xl flex items-center justify-between border border-slate-200/50 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/40">
              <img
                alt="엠블럼"
                className="w-full h-full object-cover"
                src="/logo.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_JxHm0Bzno0xmsjfqXLrOutj75uRZrgum8mJS4iWYFnNEnaMJJd4_HMzgnnedTERR-zT_eyVay8IXxdmANniACDO_jMnsn9VWxbRQZuPZ7hfIHYopiWcU_U1kXwXFrKJgMaR7-DiZpPw2yd6VwCV3uUSx6FgTSvwc2AsrnLY5HfojeYF04E-q6gOanr8mhM4JOzBGOTKl9XkOJzEMGXXFvkBu32EsLLKYrFcdU0J-K45Sn7J5cprv';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-label-sm text-label-sm text-primary font-bold">쓸고딱고</span>
                <span className="px-1.5 py-0.2 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-md font-semibold text-[10px]">
                  공식인증
                </span>
                <span className="px-1.5 py-0.2 bg-surface-container text-secondary font-label-sm text-label-sm rounded-md font-semibold text-[10px]">
                  고객용
                </span>
              </div>
              <p className="font-caption text-[11px] text-on-surface-variant">가격 흥정 없는 100% 고객 확정가 직매칭</p>
            </div>
          </div>
          {/* 로그인 버튼 뒤에 로그아웃 버튼 배치 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="btn-header-login"
              onClick={() => {
                triggerHaptic('LIGHT');
                setIsLoginModalOpen(true);
              }}
              className="h-7 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center"
            >
              로그인
            </button>
            <button
              type="button"
              id="btn-header-logout"
              onClick={() => {
                triggerHaptic('LIGHT');
                handleLogout();
              }}
              className="h-7 px-2 rounded-lg bg-surface-container-high hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-sm text-label-sm font-semibold transition-all cursor-pointer flex items-center"
            >
              로그아웃
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MAIN CONTENT: 스크롤 영역 (플로팅 CTA 버튼 회피용 하단 120px 패딩)
      ==================================================================== */}
      <main className="flex-1 flex flex-col relative w-full pb-28 bg-surface" style={{ paddingBottom: 120 }}>
        {/* Pull-to-Refresh 로딩 바 */}
        {isRefreshing && (
          <div className="w-full py-2 bg-secondary-container/40 text-on-secondary-container text-label-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></span>
            <span>실시간 접수 정보를 새로고침하고 있습니다...</span>
          </div>
        )}

        <div className="flex flex-col w-full" id="view-APP-CLNT-COM-000">

          {/* Hero Section: Headline & 3 Major Category Cards */}
          <section className="px-gutter-mobile pt-space-md pb-space-sm flex flex-col gap-space-sm">
            <div className="flex flex-col">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold leading-tight">
                원하는 청소를 선택하고<br />확정 금액으로 바로 발주하세요
              </h2>
              <p className="font-caption text-caption text-on-surface-variant mt-1">
                수수료 부담 없는 역경매 0원 • 파트너 전담 시공 매칭
              </p>
            </div>

            {/* Category 1: 정기청소 (REGULAR) */}
            <div
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50"
              data-category="REGULAR"
              onClick={() => handleOpenCategoryModal('REGULAR')}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      최소 3개월(90일) 락
                    </span>
                    <span className="font-caption text-caption text-outline" data-field="CLEAN_LARGE_CD">
                      정기청소
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold">
                    건물 정기관리
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">
                    계단, 복도, 외곽, 분리수거장 공용부 케어
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-headline-md">apartment</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-label-md text-secondary">verified_user</span>
                  <span className="font-caption text-caption">지정 요일제 · 사진 보고</span>
                </div>
                <div className="inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold">
                  <span>바로 작성</span>
                  <span className="material-symbols-outlined text-body-sm">arrow_forward_ios</span>
                </div>
              </div>
            </div>

            {/* Category 2: 계절가전 (APPLIANCE) */}
            <div
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50"
              data-category="APPLIANCE"
              onClick={() => handleOpenCategoryModal('APPLIANCE')}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      완전분해 살균세척
                    </span>
                    <span className="font-caption text-caption text-outline" data-field="CLEAN_LARGE_CD">
                      계절가전
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold">
                    가전 분해청소
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">
                    에어컨, 세탁기 고압 스팀 소독 및 필터 코팅
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-headline-md">mode_fan</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-label-md text-secondary">mode_heat</span>
                  <span className="font-caption text-caption">130℃ 친환경 고압스팀</span>
                </div>
                <div className="inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold">
                  <span>바로 작성</span>
                  <span className="material-symbols-outlined text-body-sm">arrow_forward_ios</span>
                </div>
              </div>
            </div>

            {/* Category 3: 입주청소 (MOVEIN) */}
            <div
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-slate-200/50"
              data-category="MOVEIN"
              onClick={() => handleOpenCategoryModal('MOVEIN')}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      실내 전용공간 케어
                    </span>
                    <span className="font-caption text-caption text-outline" data-field="CLEAN_LARGE_CD">
                      입주청소
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors font-bold">
                    입주/이사 대청소
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">
                    신축 입주, 이사 전 미세분진/찌든 때 정밀 케어
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary-container group-hover:text-secondary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-headline-md">sanitizer</span>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-label-md text-secondary">sanitizer</span>
                  <span className="font-caption text-caption">피톤치드 연무 무료 소독</span>
                </div>
                <div className="inline-flex items-center gap-0.5 text-secondary font-label-md text-label-md font-semibold">
                  <span>바로 작성</span>
                  <span className="material-symbols-outlined text-body-sm">arrow_forward_ios</span>
                </div>
              </div>
            </div>

          </section>

          {/* Trust & Assurance Banner */}
          <section className="px-gutter-mobile py-space-xs">
            <div className="bg-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-secondary/30 blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-space-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-headline-sm text-secondary-container">verified</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-primary font-bold">
                    쓸고딱고
                  </h4>
                </div>
                <p className="font-caption text-caption text-surface-container-high leading-relaxed">
                  시공사 청약이 완료되면 시공사의 별점, 후기글을 참고하세요. &quot;건물 정기관리, 가전 분해청소, 입주/이사청소&quot; 별 각각 3회 시공사를 변경할 수 있습니다
                </p>
                <button
                  type="button"
                  onClick={() => setIsAssuranceModalOpen(true)}
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary-fixed mt-1 hover:underline text-left cursor-pointer"
                >
                  <span>이용 약관 보기</span>
                  <span className="material-symbols-outlined text-caption">chevron_right</span>
                </button>
              </div>
            </div>
          </section>

          {/* Fixed Platform Match Fee Disclosure Banner */}
          <section className="px-gutter-mobile py-space-xs">
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs border border-slate-200/40">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-body-sm text-primary">info</span>
                <span className="font-label-md text-label-md text-primary font-semibold">플랫폼 매칭 수수료 안내</span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">
                쓸고닦고는 시공 인건비에 중간 마진을 붙이지 않습니다. 현장 인건비는 시공 후 기사님께 직접 결제됩니다.
              </p>
            </div>
          </section>

          {/* Live Feed: Realtime Neighborhood Orders */}
          <section className="px-gutter-mobile pt-space-md pb-space-xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  실시간 접수 정보
                </h3>
              </div>
              <span className="font-caption text-caption text-on-surface-variant">자동 갱신</span>
            </div>

            {/* Feed List Cards */}
            <div className="flex flex-col gap-space-sm">
              {feedList.map((item, idx) => (
                <div
                  key={item.orderNo || idx}
                  className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs border border-slate-200/50 ${
                    item.statusType === 'COMPLETED' ? 'opacity-80' : item.statusType === 'MATCHED' ? 'opacity-90' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-outline font-mono" data-field="ORDER_NO">
                      {item.orderNo}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.statusType === 'MATCHED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                          <span data-field="ORDER_STATUS">매칭완료</span>
                        </span>
                      ) : item.statusType === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                          <span data-field="ORDER_STATUS">시공완료</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                          <span data-field="ORDER_STATUS">{item.orderStatusNm || '청약접수중'}</span>
                        </span>
                      )}
                      <span className="font-caption text-caption text-on-surface-variant" data-field="REG_DT">
                        {item.regDtText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold" data-field="CLEAN_LARGE_CD">
                      {item.cleanLargeNm}
                    </span>
                    <span className="text-on-surface-variant text-caption">•</span>
                    <span className="font-body-md text-body-md text-on-surface-variant" data-field="CLEAN_MID_CD">
                      {item.cleanMidNm}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption">
                    <span className="material-symbols-outlined text-caption text-secondary">pin_drop</span>
                    <span className="truncate" data-field="ADDR_TEXT">{item.addrText}</span>
                  </div>

                  <div className="mt-space-xs pt-space-xs flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded-lg">
                    <span className="font-caption text-caption text-on-surface-variant">
                      {item.statusType === 'COMPLETED' ? '최종 시공완료' : item.statusType === 'MATCHED' ? '계약 체결가' : '고객 지정 확정금액'}
                    </span>
                    <span
                      className={`font-headline-sm text-headline-sm font-bold ${
                        item.statusType === 'COMPLETED' ? 'text-on-surface-variant' : item.statusType === 'MATCHED' ? 'text-primary' : 'text-secondary'
                      }`}
                      data-field="PROPOSED_PRICE"
                    >
                      {item.priceDisplay}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ====================================================================
          STICKY FLOATING FAST REQUEST REGISTRATION BAR (하단 네비 바 위 배치)
      ==================================================================== */}
      <div className="fixed bottom-[68px] inset-x-0 z-40 px-gutter-mobile pointer-events-none pb-safe">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            id="btn-fast-request"
            type="button"
            onClick={() => {
              triggerHaptic('MEDIUM');
              setSelectedCategory('REGULAR');
              setIsReqModalOpen(true);
            }}
            className="w-full h-[50px] bg-secondary text-on-secondary rounded-xl font-label-lg text-label-lg shadow-xl hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-headline-sm">add_circle</span>
            <span>+ 우리 집 청소 요청 등록하기 (비로그인 가능)</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM FIXED NAVIGATION BAR (이미지 2 매칭: 홈 | 신청현황 | 이용내역 | 마이페이지)
      ==================================================================== */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-1px_10px_rgba(0,0,0,0.06)] border-t border-slate-200/60"
        data-active-classes="text-secondary font-label-md"
      >
        <div className="flex justify-around items-center h-[58px] px-2 max-w-md mx-auto">
          {/* 1. 홈 */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${
              activeNavTab === 'home' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-headline-sm">home</span>
            <span className="font-label-sm text-label-sm">홈</span>
          </button>

          {/* 2. 신청현황 */}
          <button
            type="button"
            onClick={() => handleTabClick('application-status')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${
              activeNavTab === 'application-status' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-headline-sm">pending_actions</span>
            <span className="font-label-sm text-label-sm">신청현황</span>
          </button>

          {/* 3. 이용내역 */}
          <button
            type="button"
            onClick={() => handleTabClick('usage-history')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${
              activeNavTab === 'usage-history' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-headline-sm">receipt_long</span>
            <span className="font-label-sm text-label-sm">이용내역</span>
          </button>

          {/* 4. 마이페이지 (내정보) */}
          <button
            type="button"
            onClick={() => handleTabClick('my-page')}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 h-11 transition-colors cursor-pointer ${
              activeNavTab === 'my-page' ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-headline-sm">person</span>
            <span className="font-label-sm text-label-sm">{currentUser ? '내정보' : '마이페이지'}</span>
          </button>
        </div>
      </nav>

      {/* ====================================================================
          청소 견적 요청 모달 연동 (APP-CLNT-REQ-000)
      ==================================================================== */}
      <AppClntReq000
        visible={isReqModalOpen}
        initialTab={selectedCategory}
        onClose={() => setIsReqModalOpen(false)}
        onOpenLogin={() => {
          setIsReqModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onNavigate={navigateScreen}
      />

      {/* ====================================================================
          ASSURANCE / TERMS GUIDE MODAL
      ==================================================================== */}
      {isAssuranceModalOpen && (
        <div
          onClick={() => setIsAssuranceModalOpen(false)}
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md animate-in zoom-in-95 border border-slate-200/60"
          >
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                이용 약관 안내
              </span>
              <button
                type="button"
                onClick={() => setIsAssuranceModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface leading-relaxed">
              <p>
                <strong>1. 시공사 청약 및 평가 지표</strong><br />
                시공사 청약이 완료되면 시공사의 별점, 후기글, 전문 장비 및 배상책임보험 가입 여부를 꼼꼼하게 비교·선택하실 수 있습니다.
              </p>
              <p>
                <strong>2. 서비스별 3회 시공사 변경 권한</strong><br />
                &quot;건물 정기관리, 가전 분해청소, 입주/이사청소&quot; 별 각각 최대 3회까지 고객이 원하는 다른 시공사로 자유롭게 변경 가능합니다.
              </p>
              <p>
                <strong>3. 100% 현장 직불제 정산 원칙</strong><br />
                플랫폼 매칭 수수료 외 시공 노무비 본금은 시공 전/후 사진 검수 완료 후 기사님께 직접 송금 또는 지급합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAssuranceModalOpen(false)}
              className="h-11 bg-primary text-on-primary rounded-xl font-label-md font-bold mt-2 cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          APP-CLNT-ATH-000 로그인 모달 연동 (WEB-CLNT-ATH-000 100% 동일 구현)
      ==================================================================== */}
      <AppClntAth000
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={(userData) => {
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
        }}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
          if (onNavigate) {
            onNavigate('APP-CLNT-ATH-010');
          }
        }}
        onOpenFindPwd={() => alert('비밀번호 찾기 안내 메일이 발송됩니다.')}
      />

      {/* ====================================================================
          APP-CLNT-ATH-010 통합 회원가입 모달 연동 (WEB-CLNT-ATH-010 100% 동일 구현)
      ==================================================================== */}
      <AppClntAth010
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccessRegister={(userData) => {
          triggerHaptic('SUCCESS');
          setIsRegisterModalOpen(false);
          setWelcomeUserData(userData);
          setIsWelcomeModalOpen(true);
        }}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* ====================================================================
          APP-CLNT-ATH-011 모바일 가입 환영 / 회원정보 / 약관 및 서명 관리 모달
      ==================================================================== */}
      <AppClntAth011
        isOpen={isWelcomeModalOpen}
        userInfo={welcomeUserData || (currentUser ? {
          userNo: currentUser.userNo,
          userNm: currentUser.userNm,
          userEmail: currentUser.userEmail || '',
          userTel: currentUser.userTel || '',
          userRoleCd: currentUser.userRoleCd || 'C',
          signImgUrl: currentUser.signImgUrl || null,
        } : null)}
        onClose={() => setIsWelcomeModalOpen(false)}
        onOpenRequestModal={() => {
          setIsWelcomeModalOpen(false);
          setIsReqModalOpen(true);
        }}
        onNavigate={navigateScreen}
      />

    </div>
  );
}

export { AppClntCom000 };

