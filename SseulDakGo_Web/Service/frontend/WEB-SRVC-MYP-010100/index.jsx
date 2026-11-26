import React, { useState, useEffect } from 'react';
import WebSrvcQot020200Modal from '../WEB-SRVC-QOT-020200/index.jsx';

/**
 * [ID: WEB-SRVC-MYP-010100]
 * 화면명: 시공사 내정보 및 서비스 지역 관리 (Main)
 * API: GET/PATCH /api/srvc/myp/010100
 * 탈회 모달: WEB-SRVC-MYP-010200 (GET /api/srvc/myp/010200) -> WEB-SRVC-MYP-010201 (PATCH /api/srvc/myp/010201)
 */
export default function WebSrvcMyp010100({
  currentUser = {
    USER_NO: 'S20261100001',
    USER_NM: '김충훈',
    COMPANY_NM: '공간다원',
    USER_TEL: '010-8942-9114',
    USER_EMAIL: 'gonggandawon_corp@naver.com',
    USER_ROLE_CD: 'S',
  },
  onNavigate,
  onLogout,
}) {
  const userNo = currentUser?.USER_NO || 'S20261100001';

  const [profile, setProfile] = useState({
    userNo,
    userNm: currentUser?.USER_NM || '김충훈',
    companyNm: currentUser?.COMPANY_NM || '공간다원',
    bizRegNo: '120-88-29401',
    userTel: currentUser?.USER_TEL || '010-8942-9114',
    userEmail: currentUser?.USER_EMAIL || 'gonggandawon_corp@naver.com',
    activeJobs: 4,
    completedJobs: 89,
    ratingAvg: 4.9,
    reviewCount: 28,
    settlementBalance: 2480000,
    certStatus: 'VERIFIED',
    certDate: '2026-11-15',
  });

  // 시공사 활동 지역 (최대 10개)
  const [regions, setRegions] = useState([
    '경기 고양시 일산동구',
    '경기 고양시 일산서구',
    '서울 강남구',
  ]);
  const [newRegion, setNewRegion] = useState('');

  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', icon: 'check_circle' });

  // 알림 센터 상태 (WEB-CLNT-COM-010100)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 확정가 청약 신청 모달 상태 (WEB-SRVC-QOT-010100)
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    visitTime: '10:00',
    workerCount: '2',
    appealMsg: '',
  });

  // 청약진행상태 상세 모달 상태 (WEB-SRVC-QOT-020200)
  const [quoteStatusTarget, setQuoteStatusTarget] = useState(null);

  // 테마 상태 (light / dark)
  const [isDark, setIsDark] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('SSEULDAKGO_THEME') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('SSEULDAKGO_THEME', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  // 탈회 검증 상태 (WEB-SRVC-MYP-010200)
  const [withdrawCheck, setWithdrawCheck] = useState({
    loading: false,
    canWithdraw: false,
    ongoingList: [],
  });

  const showToast = (message, icon = 'check_circle') => {
    setToast({ visible: true, message, icon });
    if (window.__srvcMypToastTimer) clearTimeout(window.__srvcMypToastTimer);
    window.__srvcMypToastTimer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    let mounted = true;
    fetch(`/api/srvc/myp/010100?userNo=${encodeURIComponent(userNo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.success) return;
        if (data.profile) setProfile((prev) => ({ ...prev, ...data.profile }));
        if (Array.isArray(data.regions) && data.regions.length > 0) {
          setRegions(data.regions);
        }
      })
      .catch(() => {});

    fetch(`/api/common/notifications?userNo=${encodeURIComponent(userNo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        const list = Array.isArray(data.notifications) ? data.notifications : Array.isArray(data.list) ? data.list : [];
        setNotifications(list);
        const calcUnread = list.filter(
          (n) => n.isRead === 'N' || n.IS_READ === 'N' || n.READ_YN === 'N' || n.isRead === false
        ).length;
        const pendingQuoteCnt = list.filter((n) => !n.isQuoted && !n.IS_QUOTED).length;
        setUnreadCount(
          typeof data.unreadCount === 'number' && data.unreadCount > 0
            ? data.unreadCount
            : calcUnread > 0
            ? calcUnread
            : pendingQuoteCnt
        );
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [userNo]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAddRegion = async () => {
    const trimmed = newRegion.trim();
    if (!trimmed) return;
    if (regions.length >= 10) {
      showToast('활동 지역은 최대 10개까지 등록할 수 있습니다.', 'warning');
      return;
    }
    if (regions.includes(trimmed)) {
      showToast('이미 등록된 활동 지역입니다.', 'info');
      return;
    }
    const updated = [...regions, trimmed];
    setRegions(updated);
    setNewRegion('');
    try {
      await fetch('/api/srvc/myp/010100', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNo, regions: updated }),
      });
    } catch {
      // 로컬 상태 유지
    }
    showToast(`활동 지역(${trimmed})이 추가되었습니다.`);
  };

  const handleRemoveRegion = async (target) => {
    const updated = regions.filter((r) => r !== target);
    setRegions(updated);
    try {
      await fetch('/api/srvc/myp/010100', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNo, regions: updated }),
      });
    } catch {
      // 로컬 상태 유지
    }
    showToast(`활동 지역(${target})이 삭제되었습니다.`);
  };

  // 회원탈회 버튼 클릭 -> WEB-SRVC-MYP-010200 호출
  const handleOpenWithdrawCheck = async () => {
    setActiveModal('WEB-SRVC-MYP-010200');
    setWithdrawCheck({ loading: true, canWithdraw: false, ongoingList: [] });
    try {
      const res = await fetch(`/api/srvc/myp/010200?userNo=${encodeURIComponent(userNo)}`);
      const data = await res.json();
      setWithdrawCheck({
        loading: false,
        canWithdraw: Boolean(data.canWithdraw),
        ongoingList: Array.isArray(data.ongoingList) ? data.ongoingList : [],
      });
    } catch {
      setWithdrawCheck({
        loading: false,
        canWithdraw: false,
        ongoingList: [],
      });
      showToast('진행 중인 용역 조회 중 오류가 발생했습니다.', 'error');
    }
  };

  // 최종 탈회 확정 -> WEB-SRVC-MYP-010201 호출
  const handleConfirmWithdraw = async () => {
    try {
      const res = await fetch('/api/srvc/myp/010201', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNo }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveModal(null);
        showToast('회원 탈회가 완료되었습니다.');
        onLogout?.();
      } else {
        showToast(data.message || '탈회 처리 중 오류가 발생했습니다.', 'error');
      }
    } catch {
      showToast('탈회 처리 중 네트워크 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className={`font-body-md antialiased min-h-screen transition-colors ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-surface text-on-surface'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b-2 border-[#006a61]">
        <div className="h-20 max-w-[1440px] mx-auto px-margin flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-xl">
            <a
              className="flex items-center group"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('WEB-SRVC-COM-010000');
              }}
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-sm ring-2 ring-[#006a61]/25 flex items-center justify-center overflow-hidden">
                <img
                  src="/storage/project/brand/Logo_%EC%93%B8%EA%B3%A0%EB%94%B1%EA%B3%A0.jpg"
                  alt="쓸고닦고 공식 로고"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
            </a>

            <nav className="hidden xl:flex items-center gap-space-lg">
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('WEB-SRVC-COM-010000');
                }}
              >
                시공사 대시보드
              </a>
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                href="#qot"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('WEB-SRVC-QOT-010000');
                }}
              >
                청소·시공 청약
              </a>
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                href="#job"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.('WEB-SRVC-JOB-020000');
                }}
              >
                현장 진행 현황
              </a>
              <a
                className="font-body-md text-body-md text-primary font-title-md transition-colors py-space-xs"
                href="#myp"
                onClick={(e) => e.preventDefault()}
              >
                내정보 및 지역관리
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden md:flex items-center bg-surface-container-low p-space-2xs rounded-full shadow-[0_1px_2px_-1px_rgba(15,23,42,0.04)]">
              <span className="font-label-sm text-label-sm px-space-sm py-space-2xs rounded-full bg-secondary text-on-secondary">
                인증 시공사 (S)
              </span>
            </div>
            <button
              aria-label="테마 전환"
              title={isDark ? '화이트 모드로 전환' : '다크 모드로 전환'}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              aria-label="알림"
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setActiveModal('WEB-CLNT-COM-010100')}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-highest transition-colors"
              type="button"
              onClick={() => setActiveModal('WEB-SRVC-MYP-010105')}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              로그아웃
            </button>
            <div className="flex items-center gap-space-xs pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary text-[18px]">verified</span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">
                  {profile.companyNm} ({profile.userNm})
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium leading-none">
                  {profile.userNo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="max-w-[1440px] w-full mx-auto px-margin-mobile md:px-margin py-space-md flex flex-col gap-space-lg">
          {/* Toast */}
          <div
            className={`fixed top-24 right-6 z-[150] transition-all duration-300 flex items-center gap-space-xs bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl ${
              toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0 pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">{toast.icon}</span>
            <span className="font-body-md text-body-md font-medium">{toast.message}</span>
          </div>

          {/* 1. Breadcrumb & Title */}
          <div className="flex flex-col gap-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <nav aria-label="Breadcrumb" className="flex items-center gap-space-2xs text-on-surface-variant font-label-md text-label-md">
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  href="#srvc-home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.('WEB-SRVC-COM-010000');
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">home</span>
                  시공사 대시보드
                </a>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-space-xs py-space-2xs rounded-full font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  {regions[0] || '활동 지역 미지정'}
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                <span className="text-on-surface font-semibold">시공사 내정보 및 서비스 지역 관리</span>
              </nav>
              <span className="font-mono text-label-sm bg-surface-container-high px-2.5 py-1 rounded text-on-surface-variant">
                ID: WEB-SRVC-MYP-010100
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
              <div>
                <h1 className="font-headline-lg text-headline-lg md:font-headline-xl md:text-headline-xl text-on-surface tracking-tight">
                  시공사 내정보 및 서비스 지역 관리
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  시공 파트너 계정 정보, 사업자 인증, 활동 지역(최대 10개), 보안 설정을 한곳에서 통합 관리합니다.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm bg-secondary-container/40 text-on-secondary-container px-space-sm py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                인증 시스템 정상 가동 중
              </span>
            </div>
          </div>

          {/* 2. 4 Bento Grid Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">배정 진행 시공</span>
                  <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-metric-num-lg text-metric-num-lg text-primary">{profile.activeJobs}</span>
                  <span className="font-title-md text-title-md text-on-surface">건</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">금일 착공 2건 · 견적 조율 2건</p>
              </div>
              <div className="pt-space-md mt-space-sm flex items-center justify-between">
                <a
                  className="font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  href="#orders"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('진행 중인 의뢰 내역 목록으로 이동합니다.');
                  }}
                >
                  <span>의뢰 내역 바로가기</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">누적 완공 실적</span>
                  <div className="w-9 h-9 rounded-lg bg-secondary-container/60 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-metric-num-lg text-metric-num-lg text-secondary">{profile.completedJobs}</span>
                  <span className="font-title-md text-title-md text-on-surface">건</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  출금 가능 정산 잔액 {profile.settlementBalance.toLocaleString()}원
                </p>
              </div>
              <div className="pt-space-md mt-space-sm flex items-center justify-between">
                <a
                  className="font-label-md text-label-md text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                  href="#report"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('완료된 공간 시공 통합 리포트를 불러옵니다.');
                  }}
                >
                  <span>시공 완료 리포트</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">고객 평가 평점</span>
                  <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-bold">
                    신뢰도 99.4%
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 my-space-xs">
                  <span className="font-metric-num-lg text-metric-num-lg text-on-surface">{profile.ratingAvg}</span>
                  <span className="font-title-md text-title-md text-outline">/ 5.0</span>
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">총 후기 {profile.reviewCount}개 중 27개 만점</p>
              </div>
              <div className="pt-space-md mt-space-sm flex items-center justify-between">
                <a
                  className="font-label-md text-label-md text-tertiary font-semibold hover:underline inline-flex items-center gap-1"
                  href="#reviews"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('후기 및 평가 관리 페이지로 이동합니다.');
                  }}
                >
                  <span>리뷰 관리</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Card 4: 사업자 인증 상태 */}
            <div className="relative overflow-hidden bg-emerald-50/60 border border-emerald-200 p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006a61]" />
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold text-on-surface">사업자 인증 상태: 인증완료</span>
                    <span className="font-label-sm text-label-sm bg-emerald-200/70 text-[#006a61] font-bold px-2 py-0.5 rounded-full">
                      인증일 {profile.certDate}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-[#006a61] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    사업자등록번호: <span className="font-bold text-on-surface">{profile.bizRegNo}</span> ({profile.companyNm})
                  </p>
                  <div className="flex items-start gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-[#006a61] shrink-0 mt-0.5">workspace_premium</span>
                    <span className="font-body-sm text-body-sm leading-snug">
                      전문분야: 특수 입주청소 · 상가 바닥 왁싱 코팅 · 피톤치드 살균 소독 방역
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-space-sm mt-space-sm border-t border-emerald-200/70 flex items-center justify-between gap-2">
                <button
                  className="inline-flex items-center gap-1.5 font-label-md text-label-md font-bold text-[#006a61] hover:underline"
                  type="button"
                  onClick={() => setActiveModal('WEB-SRVC-MYP-010101')}
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>사업자등록증 등록</span>
                </button>
                <span className="text-emerald-300">|</span>
                <button
                  className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setActiveModal('WEB-SRVC-MYP-010102')}
                >
                  인증 갱신 안내
                </button>
              </div>
            </div>
          </div>

          {/* 3. 서비스 활동 지역 관리 (최대 10개) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">map</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  서비스 활동 지역 관리 ({regions.length} / 10개)
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="예: 서울 마포구"
                  className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:border-secondary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRegion}
                  className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:opacity-90"
                >
                  지역 추가
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                  {region}
                  <button
                    type="button"
                    aria-label={`${region} 삭제`}
                    onClick={() => handleRemoveRegion(region)}
                    className="text-outline hover:text-error ml-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 4. Bottom Action Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {/* Module A: 계정 및 보안 관리 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">계정 및 보안 관리</h3>
                  </div>
                  <span className="font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed px-space-xs py-0.5 rounded-full font-bold">
                    안전 등급: 매우 높음
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">휴대폰 번호 관리</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {profile.userTel} (SMS 본인인증 완료)
                      </span>
                    </div>
                    <button
                      className="h-8 px-space-sm rounded bg-surface-container-lowest text-primary hover:bg-surface font-label-sm text-label-sm font-bold shadow-sm"
                      type="button"
                      onClick={() => setActiveModal('WEB-SRVC-MYP-010103')}
                    >
                      변경
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">비밀번호 변경</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        최종 변경 45일 전 (90일 주기 권장)
                      </span>
                    </div>
                    <button
                      className="h-8 px-space-sm rounded bg-surface-container-lowest text-primary hover:bg-surface font-label-sm text-label-sm font-bold shadow-sm"
                      type="button"
                      onClick={() => setActiveModal('WEB-SRVC-MYP-010104')}
                    >
                      재설정
                    </button>
                  </div>
                </div>
              </div>

              {/* 탈회(#D32F2F) -> 회원탈회 안내 */}
              <div className="pt-space-sm flex flex-col gap-space-xs border-t border-surface-container-high">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <button
                      className="px-3 py-1.5 rounded-lg text-white font-label-sm text-label-sm font-bold shadow-sm hover:opacity-90"
                      style={{ backgroundColor: '#D32F2F' }}
                      type="button"
                      onClick={handleOpenWithdrawCheck}
                    >
                      탈회
                    </button>
                  </div>
                  <button
                    className="font-body-sm text-body-sm text-outline hover:text-on-surface underline"
                    type="button"
                    onClick={() => setActiveModal('WEB-SRVC-MYP-010107')}
                  >
                    회원탈회 안내
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-1">
                  * IP 차단 및 비정상 로그인 시도 알림이 실시간으로 발송됩니다.
                </p>
              </div>
            </div>

            {/* Module B: 이용 편의 및 계정 제어 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">tune</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">이용 편의 및 계정 제어</h3>
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded font-mono">
                    v2.4.1 플랫폼 연동
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <button
                    type="button"
                    onClick={() => setActiveModal('WEB-SRVC-MYP-010108')}
                    className="w-full text-left flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px] text-primary">notifications_active</span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">알림 수신 설정</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          카카오 알림톡, 모바일 푸시, SMS 견적알림 켜짐
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-outline">chevron_right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('WEB-SRVC-MYP-010109')}
                    className="w-full text-left flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px] text-secondary">account_balance</span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          환불 및 예치금 계좌 관리
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          신한은행 110-***-841920 (예금주: {profile.userNm})
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-outline">chevron_right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('WEB-SRVC-MYP-010110')}
                    className="w-full text-left flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px] text-tertiary">policy</span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          개인정보 수집 및 마케팅 동의 내역
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          위탁 시공 규정 및 위치정보 동의 2025.10.12
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-outline">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="pt-space-sm bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between text-outline font-label-sm text-label-sm">
                <span>계정 최종 로그인: 2026-11-24 (SseulDakGo Security Protected)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-space-2xl border-t-2 border-[#006a61]">
        <div className="max-w-[1440px] mx-auto px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-xl">
            <div className="md:col-span-2 flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs mb-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden">
                  <img
                    src="/storage/project/brand/Logo_%EC%93%B8%EA%B3%A0%EB%94%B1%EA%B3%A0.jpg"
                    alt="쓸고닦고 공식 로고"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-headline-sm text-headline-sm text-primary">SseulDakGo</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                전문 검증 시공사와 함께하는 프리미엄 청소 &amp; 상업 공간 위생 매니지먼트 플랫폼. 완벽한 시공 보증과 디지털 위생 감사 솔루션을 제공합니다.
              </p>
              <div className="mt-space-sm flex items-center gap-space-md">
                <span className="font-label-md text-label-md text-secondary-fixed-dim bg-on-secondary-fixed px-space-sm py-space-2xs rounded-full">
                  ISO 9001 위생관리 인증
                </span>
                <span className="font-label-md text-label-md text-secondary-fixed-dim bg-on-secondary-fixed px-space-sm py-space-2xs rounded-full">
                  전문 책임보험 10억 가입
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface">고객지원 센터</span>
              <span className="font-metric-num-sm text-metric-num-sm text-primary">1588-7824</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                운영시간: 평일 08:30 ~ 18:30
                <br />
                주말/공휴일 긴급 위생지원 가동
              </p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface">약관 및 정책</span>
              <nav className="flex flex-col gap-space-2xs">
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#terms">
                  이용약관 (Terms)
                </a>
                <a className="font-body-sm text-body-sm text-primary font-semibold hover:underline" href="#privacy">
                  개인정보처리방침 (Privacy Policy)
                </a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#warranty">
                  시공 품질보증 규정
                </a>
                <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#partner-guide">
                  파트너 계약 가이드
                </a>
              </nav>
            </div>
          </div>
          <div className="pt-space-md bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <div>
              <span>(주)쓸닦고 공간케어 | 대표이사: 김충훈 | 사업자등록번호: 214-88-09142 | 통신판매업신고: 제2024-서울강남-0418호</span>
              <p className="mt-space-2xs text-outline">
                서울특별시 강남구 테헤란로 152 강남파이낸스센터 18층 | 책임관리자: privacy@sseldakgo.com
              </p>
            </div>
            <div className="text-right text-outline">© 2025 SseulDakGo Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* Modal: WEB-SRVC-MYP-010200 (시공사 회원 탈회 조건 검증) */}
      {activeModal === 'WEB-SRVC-MYP-010200' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-error/20 overflow-hidden">
            <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface">
              <div>
                <span className="font-mono text-label-sm text-error font-bold">[ID: WEB-SRVC-MYP-010200]</span>
                <h2 className="font-headline-sm text-headline-sm text-error">시공사 회원 탈회 조건 검증</h2>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {withdrawCheck.loading ? (
                <p className="text-body-md text-on-surface-variant">청약·진행 중인 용역을 확인하고 있습니다...</p>
              ) : withdrawCheck.ongoingList.length > 0 ? (
                <div className="bg-error-container/40 border border-error/30 p-4 rounded-xl text-body-sm">
                  <p className="font-bold text-error mb-2">
                    청약·진행 중인 용역이 있어 모든 청소 용역이 종료되어야만 탈회가 가능합니다.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-on-surface">
                    {withdrawCheck.ongoingList.map((item, idx) => (
                      <li key={idx}>
                        {item.orderNo} ({item.statusNm || '진행중'})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-body-md text-on-surface">
                  진행 중인 청약 및 시공 용역이 없습니다. 회원 탈회를 진행하실 수 있습니다.
                </p>
              )}
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-body-md font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!withdrawCheck.canWithdraw}
                title={!withdrawCheck.canWithdraw ? '진행 중인 용역이 있어 탈회가 불가합니다' : ''}
                onClick={() => setActiveModal('WEB-SRVC-MYP-010201')}
                className="px-5 py-2 rounded-lg text-white text-body-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D32F2F' }}
              >
                회원탈회
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WEB-SRVC-MYP-010201 (시공사 회원 탈회 최종 확인) */}
      {activeModal === 'WEB-SRVC-MYP-010201' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-error/20 overflow-hidden">
            <div className="p-5 border-b border-surface-container-high bg-surface">
              <span className="font-mono text-label-sm text-error font-bold">[ID: WEB-SRVC-MYP-010201]</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">회원 탈회 최종 확인</h2>
            </div>
            <div className="p-6 text-center">
              <p className="font-title-md text-title-md text-on-surface">회원 탈회를 정말 원하십니까?</p>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-body-md font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                className="px-5 py-2 rounded-lg text-white text-body-md font-semibold"
                style={{ backgroundColor: '#D32F2F' }}
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WEB-CLNT-COM-010100 (알림 센터 및 미청약 건 바로 청약 연동) */}
      {activeModal === 'WEB-CLNT-COM-010100' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">알림 센터 및 수신 목록</h2>
              </div>
              <button type="button" onClick={() => setActiveModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto flex flex-col gap-3">
              {notifications.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-6">수신된 알림이 없습니다.</p>
              ) : (
                notifications.map((noti, idx) => {
                  const title = noti.NOTI_TITLE || noti.title || '';
                  const content = noti.NOTI_CONTENT || noti.content || '';
                  const orderNoMatch = content.match(/ORD-[0-9-]+/) || title.match(/ORD-[0-9-]+/);
                  const orderNo = noti.ORDER_NO || noti.orderNo || (orderNoMatch ? orderNoMatch[0] : '');
                  const category =
                    noti.CLEAN_TYPE_NM ||
                    (title.includes('입주') || content.includes('입주')
                      ? '입주청소'
                      : title.includes('가전') || content.includes('가전') || content.includes('에어컨') || content.includes('세탁기')
                      ? '계절가전청소'
                      : '정기청소');
                  // 현장주소: 시/도/구·군까지만 추출
                  const rawAddr = noti.SITE_ADDR || noti.addr || (content.match(/현장:\s*([^\(•\n]+)/)?.[1] || '').trim();
                  const shortAddr = rawAddr
                    ? rawAddr.split(/\s+/).slice(0, 3).join(' ')
                    : '경기 고양시 일산동구';
                  // 청소범위 요약
                  const scopeRaw = noti.CLEAN_SCOPE || (content.split('•')[1] || '').trim();
                  const cleanScope = scopeRaw
                    ? scopeRaw.replace(/^[^:]+:\s*/, '').slice(0, 40)
                    : title.replace(/^\[[^\]]+\]\s*/, '').slice(0, 35);
                  const isQuoted = Boolean(noti.IS_QUOTED || noti.isQuoted);
                  const fixedPrice = noti.FIXED_PRICE || noti.fixedPrice || 250000;
                  return (
                    <div
                      key={noti.NOTI_ID || idx}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col gap-2"
                    >
                      {/* 1줄: 청소요청구분 | 발주번호 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm font-bold">
                            {category}
                          </span>
                          <span className="font-mono text-body-sm font-bold text-on-surface">{orderNo}</span>
                        </div>
                        <span className="font-label-sm text-outline shrink-0">
                          {noti.REG_DT ? String(noti.REG_DT).slice(0, 16) : ''}
                        </span>
                      </div>
                      {/* 2줄: 현장주소(시/도/군) | 청소범위 | 버튼 */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex flex-col text-body-sm text-on-surface-variant min-w-0">
                          <span className="font-semibold text-on-surface truncate">{shortAddr}</span>
                          <span className="truncate">{cleanScope}</span>
                        </div>
                        {isQuoted ? (
                          <button
                            type="button"
                            onClick={() => {
                              setQuoteStatusTarget({
                                orderNo,
                                category,
                                shortAddr,
                                cleanScope,
                                fixedPrice,
                                statusLabel: '청약 접수중 (고객 승인 대기)',
                              });
                              setActiveModal('WEB-SRVC-QOT-020200');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-bold shrink-0 hover:opacity-90"
                          >
                            청약진행상태
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setQuoteTarget({ orderNo, title: `${category} (${shortAddr})`, fixedPrice });
                              setActiveModal('WEB-SRVC-QOT-010100');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm font-bold shrink-0 hover:opacity-90"
                          >
                            바로청약하기
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-body-md font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WEB-SRVC-QOT-010100 (확정가 청소용역 청약 신청) */}
      {activeModal === 'WEB-SRVC-QOT-010100' && quoteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal('WEB-CLNT-COM-010100');
          }}
        >
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-secondary/30 overflow-hidden">
            <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">확정가 청소용역 청약 신청</h2>
              </div>
              <button type="button" onClick={() => setActiveModal('WEB-CLNT-COM-010100')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20 text-body-sm">
                <div className="font-bold text-on-surface">발주번호: {quoteTarget.orderNo}</div>
                <div className="text-secondary font-bold mt-1">
                  고객 확정 지정가: {Number(quoteTarget.fixedPrice).toLocaleString()}원 (금액 수정 불가)
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md font-semibold">방문 가능 시간</label>
                  <input
                    type="time"
                    value={quoteForm.visitTime}
                    onChange={(e) => setQuoteForm((p) => ({ ...p, visitTime: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-outline-variant bg-surface"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md font-semibold">투입 인원 (명)</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteForm.workerCount}
                    onChange={(e) => setQuoteForm((p) => ({ ...p, workerCount: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-outline-variant bg-surface"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold">시공사 어필 메시지</label>
                <textarea
                  rows="3"
                  value={quoteForm.appealMsg}
                  onChange={(e) => setQuoteForm((p) => ({ ...p, appealMsg: e.target.value }))}
                  placeholder="장비, 경력, 시공 계획 등을 입력해 주세요."
                  className="px-3 py-2 rounded-lg border border-outline-variant bg-surface"
                />
              </div>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal('WEB-CLNT-COM-010100')}
                className="px-4 py-2 rounded-lg text-body-md font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                취소
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/srvc/qot/010100', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userNo,
                        orderNo: quoteTarget.orderNo,
                        visitTime: quoteForm.visitTime,
                        workerCount: Number(quoteForm.workerCount) || 1,
                        appealMsg: quoteForm.appealMsg,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setNotifications((prev) =>
                        prev.map((n) => {
                          const nOrder = n.ORDER_NO || n.orderNo || (n.NOTI_CONTENT || n.content || '').match(/ORD-[0-9-]+/)?.[0];
                          return nOrder === quoteTarget.orderNo ? { ...n, isQuoted: true, IS_QUOTED: true } : n;
                        })
                      );
                      setUnreadCount((prev) => Math.max(0, prev - 1));
                      showToast('확정가 청약 신청이 완료되었습니다.');
                      setActiveModal(null);
                    } else {
                      showToast(data.message || '청약 신청에 실패했습니다.', 'error');
                    }
                  } catch {
                    showToast('청약 신청 처리 중 오류가 발생했습니다.', 'error');
                  }
                }}
                className="px-5 py-2 rounded-lg bg-secondary text-on-secondary text-body-md font-semibold"
              >
                청약 제출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WEB-SRVC-QOT-020200 (청약진행상태 및 청소 요청 상세) */}
      <WebSrvcQot020200Modal
        isOpen={activeModal === 'WEB-SRVC-QOT-020200'}
        userNo={userNo}
        target={quoteStatusTarget}
        onClose={() => setActiveModal('WEB-CLNT-COM-010100')}
      />

      {/* 기타 안내/설정 모달 공통 닫기 처리 */}
      {activeModal &&
        activeModal !== 'WEB-CLNT-COM-010100' &&
        activeModal !== 'WEB-SRVC-QOT-010100' &&
        activeModal !== 'WEB-SRVC-QOT-020200' &&
        activeModal !== 'WEB-SRVC-MYP-010200' &&
        activeModal !== 'WEB-SRVC-MYP-010201' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveModal(null);
            }}
          >
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant overflow-hidden">
              <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface">
                <span className="font-mono text-label-sm text-primary font-bold">[ID: {activeModal}]</span>
                <button type="button" onClick={() => setActiveModal(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 text-body-md text-on-surface-variant">
                {activeModal === 'WEB-SRVC-MYP-010105'
                  ? '현재 시공사 계정에서 로그아웃하시겠습니까?'
                  : `${activeModal} 설정 화면이 호출되었습니다.`}
              </div>
              <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-lg text-body-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  닫기
                </button>
                {activeModal === 'WEB-SRVC-MYP-010105' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      showToast('성공적으로 로그아웃되었습니다.');
                      onLogout?.();
                    }}
                    className="px-5 py-2 rounded-lg bg-primary text-on-primary text-body-md font-semibold"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
