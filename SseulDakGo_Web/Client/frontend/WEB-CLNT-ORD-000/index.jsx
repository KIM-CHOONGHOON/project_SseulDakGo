import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-000/index.jsx
 * @description 나의 청소 신청 현황 메인 화면 컴포넌트 (WEB-CLNT-ORD-000)
 *              - 4대 요약 통계 집계 카드 (전체, 청약접수중, 계약체결/진행중, 완료)
 *              - 상태별 탭 필터링 및 POST /api/web/client/ord_000 비동기 데이터 바인딩
 *              - 7일 만료 실시간 타이머 (BID_OPEN 건 매초 남은시간 계산 및 0초 시 BID_EXPIRED 자동 전이)
 *              - [파트너 청약서 비교 및 선택하기 >] 상세 화면(WEB-CLNT-ORD-001) 라우팅
 *              - [+ 신규 청소 요청 등록하기] 청소 신청 모달(WEB-CLNT-REQ-000) 연계
 *              - .cursorrules 2.5 공식 브랜드 로고(/logo.png) 반영
 * 
 * Props:
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onOpenRequestModal 청소 신청 모달 오픈 핸들러 () => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 * @param {Object} currentUser 현재 로그인 사용자 정보 ({ USER_NO, USER_NM, USER_ROLE_CD })
 */
export default function WebClntOrd000({
  onNavigate,
  onOpenRequestModal,
  onLogout,
  currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
  }
}) {
  // 1. 상태 관리
  const [orderList, setOrderList] = useState([]);
  const [summary, setSummary] = useState({
    totalCnt: 4,
    bidOpenCnt: 2,
    inProgressCnt: 1,
    completedCnt: 1
  });
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [timeLeftMap, setTimeLeftMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const effectiveUserNo = currentUser.USER_NO || 'C20261000001';

  // 2. 백엔드 목록 조회 API 호출 (POST /api/web/client/ord_000)
  const fetchOrderData = useCallback(async (filterValue = currentFilter) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/web/client/ord_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientUserNo: effectiveUserNo,
          statusFilter: filterValue
        })
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setOrderList(result.data.orders || []);
        if (result.data.summary) {
          setSummary(result.data.summary);
        }

        // 초기 남은 시간(초 단위) 계산하여 timeLeftMap에 설정
        const nowMs = Date.now();
        const initialMap = {};
        (result.data.orders || []).forEach((item) => {
          if (item.orderStatus === 'BID_OPEN' && item.bidExpireDt) {
            const expMs = new Date(item.bidExpireDt).getTime();
            const diffSec = Math.max(0, Math.floor((expMs - nowMs) / 1000));
            initialMap[item.orderNo] = diffSec;
          }
        });
        setTimeLeftMap(initialMap);
      }
    } catch (err) {
      console.warn('[WEB-CLNT-ORD-000] 목록 조회 API 통신 오류 (시뮬레이션 유지):', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserNo, currentFilter]);

  // 마운트 및 필터 변경 시 호출
  useEffect(() => {
    fetchOrderData(currentFilter);
  }, [currentFilter, fetchOrderData]);

  // 3. 7일 만료 실시간 타이머 구현 (useEffect & setInterval)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMap((prevMap) => {
        const nextMap = { ...prevMap };
        let hasExpiredTransition = false;

        Object.keys(nextMap).forEach((orderNo) => {
          if (nextMap[orderNo] > 0) {
            nextMap[orderNo] -= 1;
            // 0초에 도달한 경우
            if (nextMap[orderNo] === 0) {
              hasExpiredTransition = true;
            }
          }
        });

        // 0초 도달 시 해당 카드의 상태를 즉시 'BID_EXPIRED'(청약 만료)로 전이
        if (hasExpiredTransition) {
          setOrderList((prevList) =>
            prevList.map((order) => {
              if (order.orderStatus === 'BID_OPEN' && nextMap[order.orderNo] === 0) {
                return { ...order, orderStatus: 'BID_EXPIRED' };
              }
              return order;
            })
          );
        }

        return nextMap;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 남은 초를 "D일 H시간 M분 S초" 및 진행률(%)로 변환하는 포맷터
  const formatTimeLeft = (seconds) => {
    if (seconds === undefined || seconds === null || seconds <= 0) {
      return { text: '청약 기간 마감 (BID_EXPIRED)', percent: 100, isExpired: true };
    }

    const totalSevenDaysSec = 7 * 24 * 60 * 60;
    const elapsedSec = Math.max(0, totalSevenDaysSec - seconds);
    const percent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalSevenDaysSec) * 100)));

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return {
      text: `${days}일 ${hours}시간 ${mins}분 ${pad(secs)}초`,
      percent,
      isExpired: false
    };
  };

  // 사용자 인터랙션: [파트너 청약서 비교 및 선택하기 >] 클릭 시 상세 화면 라우팅
  const handleNavigateToQuotes = (orderNo) => {
    const targetUrl = `WEB-CLNT-ORD-001?orderNo=${encodeURIComponent(orderNo)}`;
    console.log(`[WEB-CLNT-ORD-000] 라우팅 실행 -> ${targetUrl}`);
    if (onNavigate) {
      onNavigate(targetUrl);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${targetUrl}`;
      alert(`[WEB-CLNT-ORD-001 상세 이동]\n발주번호 ${orderNo}의 파트너 청약서 비교 화면으로 이동합니다.`);
    }
  };

  // 사용자 인터랙션: [+ 신규 청소 요청 등록하기] 클릭 시 모달 트리거
  const handleOpenRequest = () => {
    if (onOpenRequestModal) {
      onOpenRequestModal();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('OPEN_CLEANING_REQUEST_MODAL', {
          detail: { screenId: 'WEB-CLNT-REQ-000', userNo: effectiveUserNo }
        })
      );
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 고정 GNB 헤더 (.cursorrules 2.5 공식 로고 /logo.png 반영)
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          {/* Brand Logo & Location Chip */}
          <div className="flex items-center gap-space-md shrink-0">
            <a
              className="flex items-center gap-space-sm group"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              <img
                alt="쓸고닦고 공식 로고"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                  쓸고닦고
                </span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  BUILDING CLEANING STANDARD
                </span>
              </div>
            </a>

            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>경기 고양시 일산동구</span>
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full"
            data-active-classes="bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm"
          >
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              홈
            </a>
            <a
              aria-current="page"
              className="px-4 py-2 transition-colors bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-semibold"
              data-path="my-requests"
              href="#my-requests"
            >
              나의 신청현황
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="service-history"
              href="#service-history"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('service-history');
              }}
            >
              이용내역
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="my-account"
              href="#my-account"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('my-account');
              }}
            >
              마이
            </a>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {currentUser.USER_NM || '홍길동'}님
              </span>
              <span className="font-caption text-caption text-secondary font-medium">
                인증회원 ({effectiveUserNo})
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="알림"
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              <button
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer"
                onClick={onLogout || (() => alert('로그아웃되었습니다.'))}
                type="button"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-1 ring-outline-variant/30 font-semibold text-xs">
                {currentUser.USER_NM ? currentUser.USER_NM.slice(0, 1) : '홍'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden pb-space-xl">
            <div className="max-w-[1200px] mx-auto px-margin pt-space-lg flex flex-col gap-space-lg">

              {/* 1. 상단 요약 배너 및 4대 핵심 지표 통계 */}
              <section aria-label="발주 요약 대시보드" className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-xs">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold tracking-wide">
                        고객 발주 포털
                      </span>
                      <span className="text-outline text-caption font-caption font-mono">WEB-CLNT-ORD-000</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                      나의 청소 신청 현황
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                      고객님이 직접 지정가로 발주하신 청소 건들의 실시간 매칭 상태입니다. 역경매 없이 지정가 그대로 검증된 시공 마스터와 매칭됩니다.
                    </p>
                  </div>
                  {/* Quick Stat Badge */}
                  <div className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-4 py-2 rounded-xl text-on-surface shadow-xs">
                    <span
                      className="material-symbols-outlined text-secondary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline">표준 정액 보증제</span>
                      <span className="font-label-md text-label-md font-semibold text-primary">역경매 강요 0건</span>
                    </div>
                  </div>
                </div>

                {/* 4대 핵심 요약 지표 카드 그리드 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
                  {/* 전체 발주 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">전체 발주</span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight" data-field="TOTAL_ORDER_COUNT">
                        {summary.totalCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-secondary font-medium">누적 진행 통합</span>
                    </div>
                  </div>

                  {/* 청약 접수중 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] relative overflow-hidden border border-secondary/20">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/5 rounded-full pointer-events-none"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-secondary font-semibold">청약 접수중</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                        실시간 모집중
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-secondary font-bold tracking-tight" data-field="BID_OPEN_COUNT">
                        {summary.bidOpenCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-secondary font-medium">7일 기한 내 마스터 접수</span>
                    </div>
                  </div>

                  {/* 계약 체결/진행중 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">계약 체결/진행중</span>
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">handshake</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight" data-field="CNTR_PROGRESS_COUNT">
                        {summary.inProgressCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-primary font-medium">마스터 매칭 완료</span>
                    </div>
                  </div>

                  {/* 청소 완료 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">청소 완료</span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-outline font-bold tracking-tight" data-field="COMPLETED_COUNT">
                        {summary.completedCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-outline font-medium">현장 최종 검수 필</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. 필터 세그먼트 & 신규 발주 CTA 버튼 */}
              <section aria-label="필터 및 등록 조작" className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-sm">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto" id="filterTabGroup">
                  <button
                    className={`filter-tab px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'ALL'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('ALL')}
                    type="button"
                  >
                    <span>전체</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                      {summary.totalCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'BID_OPEN'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('BID_OPEN')}
                    type="button"
                  >
                    <span>청약접수중</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                      {summary.bidOpenCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'CNTR_CONFIRMED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('CNTR_CONFIRMED')}
                    type="button"
                  >
                    <span>계약확정</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {summary.inProgressCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'SVC_PROGRESS'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('SVC_PROGRESS')}
                    type="button"
                  >
                    <span>진행중</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      0
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'SVC_COMPLETED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('SVC_COMPLETED')}
                    type="button"
                  >
                    <span>완료</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {summary.completedCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'BID_EXPIRED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('BID_EXPIRED')}
                    type="button"
                  >
                    <span>만료/취소</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      0
                    </span>
                  </button>
                </div>

                {/* Primary Action CTA */}
                <button
                  className="h-[44px] px-6 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  data-action="OPEN_MODAL_WEB_CLNT_REQ_000"
                  onClick={handleOpenRequest}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>신규 청소 요청 등록하기</span>
                </button>
              </section>

              {/* 3. 발주 오더 목록 리스트 (Main Feed List) */}
              <section aria-label="발주 목록 피드" className="flex flex-col gap-space-lg">
                {isLoading && orderList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[36px] animate-spin mb-2">progress_activity</span>
                    <span className="text-on-surface-variant font-body-sm">발주 신청 현황을 불러오는 중입니다...</span>
                  </div>
                ) : orderList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm border border-slate-200/60 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[48px] mb-3">inbox</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                      해당 조건의 발주 신청 내역이 없습니다.
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                      원하시는 청소 서비스와 희망 시공 금액을 지정하여 신규 발주서를 등록해 보세요.
                    </p>
                    <button
                      className="h-10 px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
                      onClick={handleOpenRequest}
                      type="button"
                    >
                      청소 요청 등록하기
                    </button>
                  </div>
                ) : (
                  orderList.map((order) => {
                    const isBidOpen = order.orderStatus === 'BID_OPEN';
                    const isConfirmed = order.orderStatus === 'CNTR_CONFIRMED';
                    const isCompleted = order.orderStatus === 'SVC_COMPLETED';
                    const isExpired = order.orderStatus === 'BID_EXPIRED';

                    const remainingSeconds = timeLeftMap[order.orderNo];
                    const remainingFormatted = formatTimeLeft(remainingSeconds);

                    return (
                      <article
                        className="order-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border border-slate-200/70"
                        data-status={order.orderStatus}
                        key={order.orderNo}
                      >
                        {/* Card Header Bar */}
                        <div className="px-space-md py-space-sm bg-surface-container-low/50 flex flex-wrap items-center justify-between gap-space-sm border-b border-slate-200/50">
                          <div className="flex items-center gap-space-sm flex-wrap text-caption font-caption text-outline">
                            <span>
                              발주번호:{' '}
                              <strong className="text-on-surface font-semibold font-mono" data-field="ORDER_NO">
                                {order.orderNo}
                              </strong>
                            </span>
                            <span className="text-outline-variant">|</span>
                            <span>
                              등록일시:{' '}
                              <span className="text-on-surface-variant" data-field="REG_DT">
                                {order.regDt}
                              </span>
                            </span>
                            {order.confirmedDtText && (
                              <>
                                <span className="text-outline-variant">|</span>
                                <span>
                                  체결일시:{' '}
                                  <span className="text-primary font-medium">
                                    {order.confirmedDtText}
                                  </span>
                                </span>
                              </>
                            )}
                            <span className="text-outline-variant">|</span>
                            <span>
                              신청자:{' '}
                              <span className="text-on-surface-variant" data-field="USER_NM">
                                {currentUser.USER_NM || '홍길동'} ({order.clientUserNo || effectiveUserNo})
                              </span>
                            </span>
                          </div>

                          {/* Status Badge with green pulse for BID_OPEN */}
                          <div className="flex items-center gap-2">
                            {isBidOpen && (
                              <span
                                className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span>청약접수중</span>
                                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span
                                className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">handshake</span>
                                <span>계약체결완료</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span
                                className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                <span>청소완료 (검수합격)</span>
                              </span>
                            )}
                            {isExpired && (
                              <span
                                className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                <span>청약만료</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 7-Day Expiry Countdown Timer Box (BID_OPEN 건만 노출) */}
                        {isBidOpen && (
                          <div className="mx-space-md mt-space-md p-space-sm bg-secondary-fixed/20 rounded-xl flex flex-col gap-2 border border-secondary/20">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[20px]">hourglass_top</span>
                                <span className="font-label-md text-label-md text-primary font-semibold">
                                  7일 청약 마감까지 남은 시간:
                                </span>
                                <span
                                  className="font-headline-sm text-headline-sm text-tertiary-container font-bold tracking-tight font-mono"
                                  data-field="BID_EXPIRE_DT"
                                >
                                  {remainingFormatted.text}
                                </span>
                              </div>
                              <span className="font-caption text-caption text-on-surface-variant">
                                마감일시:{' '}
                                <strong className="text-primary font-semibold">
                                  {order.bidExpireDt}
                                </strong>
                              </span>
                            </div>
                            {/* 7-Day Progress Bar */}
                            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                              <div
                                className="h-full bg-secondary rounded-full transition-all duration-500"
                                style={{ width: `${remainingFormatted.percent}%` }}
                              ></div>
                            </div>
                            <p className="font-caption text-caption text-outline leading-tight">
                              만료 전까지 접수된 청약서 중 제시된 포트폴리오와 이력을 비교하여 마음에 드는 마스터를 자유롭게 선택할 수 있습니다.
                            </p>
                          </div>
                        )}

                        {/* 계약체결완료 마스터 정보 배너 (CNTR_CONFIRMED 건) */}
                        {isConfirmed && order.contractMaster && (
                          <div className="mx-space-md mt-space-md p-space-sm rounded-xl bg-primary/5 flex flex-wrap items-center justify-between gap-space-sm border border-primary/15">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-base">
                                {order.contractMaster.masterNm ? order.contractMaster.masterNm.slice(0, 1) : '김'}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-label-lg text-label-lg text-primary font-bold">
                                    담당 마스터 매칭 완료
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                                    신원·책임보험 100% 검증
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface">
                                  <strong className="font-semibold">{order.contractMaster.companyNm}</strong> (
                                  {order.contractMaster.masterNm} / {order.contractMaster.licenseNm} / 시공 평점 {order.contractMaster.rating})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                                onClick={() => alert(`[안심번호 통화] ${order.contractMaster.safePhone}로 연결합니다.`)}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[16px]">call</span>
                                안심번호 통화
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Order Detail Grid (4분할) */}
                        <div className="p-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md">
                          {/* Col 1: Service Type & Details */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">cleaning_services</span>
                              서비스 구분 및 상세 내역
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-semibold"
                                data-field="CLEAN_LARGE_CD"
                              >
                                {order.cleanLargeNm || order.cleanLargeCd}
                              </span>
                              <span className="font-label-lg text-label-lg text-on-surface font-semibold" data-field="CLEAN_MID_CD">
                                {order.cleanMidNm || order.cleanMidCd}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant pt-0.5">
                              {order.detailDesc}
                            </p>
                          </div>

                          {/* Col 2: Site Address */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">distance</span>
                              시공 현장 주소
                            </span>
                            <p className="font-label-lg text-label-lg text-on-surface font-semibold" data-field="ADDR_TEXT">
                              {order.addrText}
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {order.addrDetail}
                            </p>
                          </div>

                          {/* Col 3: Requested Date & Time */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">calendar_clock</span>
                              시공 희망 일정
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-headline-sm text-headline-sm text-primary font-bold" data-field="SERVICE_START_DT">
                                {order.serviceStartDt}
                              </span>
                              {order.dDayText && (
                                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                                  {order.dDayText}
                                </span>
                              )}
                              {isCompleted && (
                                <div className="flex items-center gap-0.5 text-secondary">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                      star
                                    </span>
                                  ))}
                                  <span className="font-label-sm text-label-sm font-bold text-on-surface ml-1">5.0 / 5.0</span>
                                </div>
                              )}
                            </div>
                            <span className="font-caption text-caption text-secondary font-medium">
                              {order.serviceScheduleText || '고객 지정 희망 일정'}
                            </span>
                          </div>

                          {/* Col 4: Guaranteed Fixed Labor Fee */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-primary/5">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                                {isCompleted ? '시공 대금 정산 결과' : '고객 지정 확정 시공대금'}
                              </span>
                              <span className="font-caption text-caption text-outline">
                                {isCompleted ? '거래 종결' : '플랫폼 수수료 16,500원 결제 완료'}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight font-mono" data-field="PROPOSED_PRICE">
                                {Number(order.proposedPrice).toLocaleString()}원
                              </span>
                              {order.priceUnitText && (
                                <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                                  {order.priceUnitText}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-caption text-caption font-medium shadow-xs">
                                {isCompleted ? '현장 직불 완료 (영수증 수령)' : '역경매 없음 · 현장 직불 고정액'}
                              </span>
                            </div>
                            <p className="font-caption text-caption text-tertiary font-medium">
                              {order.priceNotice || '* 시공 검수 완료 후 마스터 계좌로 직접 송금하는 확정 계약금입니다.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer Action Bar */}
                        <div className="px-space-md py-space-sm bg-surface-container-low/80 flex flex-wrap items-center justify-between gap-space-sm border-t border-slate-200/50">
                          <div className="flex items-center gap-2">
                            {isBidOpen && (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  현재 <strong className="text-secondary font-headline-sm text-headline-sm font-bold font-mono" data-field="APPLY_COUNT">{order.applyCount || 0}명</strong>의 검증된 시공 마스터가 청약서를 제출했습니다.
                                </span>
                              </>
                            )}
                            {isConfirmed && (
                              <>
                                <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  계약이 체결되어 일정 조율이 완료되었습니다. 시공 당일 마스터가 직접 방문합니다.
                                </span>
                              </>
                            )}
                            {isCompleted && (
                              <>
                                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  시공 전/후 고화질 사진 보고서와 전자 검수 확인서가 발급되었습니다.
                                </span>
                              </>
                            )}
                            {isExpired && (
                              <>
                                <span className="material-symbols-outlined text-outline text-[20px]">info</span>
                                <span className="font-body-md text-body-md text-on-surface-variant">
                                  7일 청약 기한이 만료되었습니다. 조건을 재조정하여 다시 발주하실 수 있습니다.
                                </span>
                              </>
                            )}
                          </div>

                          {/* Footer Action Buttons */}
                          <div>
                            {isBidOpen && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all cursor-pointer"
                                data-action="VIEW_QUOTES"
                                data-order-no={order.orderNo}
                                onClick={() => handleNavigateToQuotes(order.orderNo)}
                                type="button"
                              >
                                <span>파트너 청약서 비교 및 선택하기 ({order.applyCount || 0}건)</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                              </button>
                            )}
                            {isConfirmed && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-primary-container active:scale-[0.98] transition-all cursor-pointer"
                                onClick={() => alert(`[계약서 확인] 발주번호 ${order.orderNo}의 표준 직불 전자계약서를 확인합니다.`)}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">description</span>
                                <span>매칭 계약서 및 마스터 정보 보기</span>
                              </button>
                            )}
                            {isCompleted && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-surface-container transition-all cursor-pointer border border-slate-200/80"
                                onClick={() => alert(`[보고서 다운로드] 발주번호 ${order.orderNo}의 시공 사진 보고서 PDF 다운로드를 시작합니다.`)}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span>시공 결과 보고서 및 검수 확인서 다운로드</span>
                              </button>
                            )}
                            {isExpired && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:bg-surface-container transition-all cursor-pointer"
                                onClick={handleOpenRequest}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                <span>재신청하기</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>

              {/* 4. 하단 안심 보증 인포 배너 */}
              <section className="mt-space-md p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg border border-slate-200/60">
                <div className="flex items-center gap-space-md">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[32px]">shield_lock</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      쓸고닦고 3대 안심 약속
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      ① 100% 신원 및 범죄이력 보증 마스터 배정 &nbsp;|&nbsp;
                      ② 시공 검수 후 전액 현장 직불 (불합리한 에스크로 수수료 제로) &nbsp;|&nbsp;
                      ③ 시공 하자 발생 시 3개월 무상 A/S 안심 케어 보증
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <button
                    className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors shadow-xs border border-slate-200/80 cursor-pointer"
                    onClick={() => alert('쓸고닦고 3대 안심 보증 규정 전문이 확인되었습니다.')}
                    type="button"
                  >
                    보증 규정 확인
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
                    onClick={() => alert('고객센터 (02-429-5459) 상담 연결이 준비 중입니다.')}
                    type="button"
                  >
                    고객센터 상담문의
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          FOOTER: 법적 고지 및 고객센터 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                alt="쓸고닦고 로고"
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
                src="/logo.png"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                쓸고닦고
              </span>
              <span className="font-caption text-caption text-outline">
                프리미엄 홈케어 컨시어지
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <a className="hover:text-on-surface transition-colors font-semibold" data-path="terms-of-service" href="#">
                이용약관
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors font-semibold text-primary" data-path="privacy-policy" href="#">
                개인정보처리방침
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="customer-service" href="#">
                고객센터
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="partner-inquiry" href="#">
                기사 파트너 등록
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant">
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                (주)공간다원
              </p>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>대표자: 김충훈</span>
                <span>사업자등록번호: 214-88-02482</span>
                <span>통신판매업신고: 제2025-경기고양-1849호</span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>고객센터: 02-429-5459 (평일 09:00 - 18:00)</span>
                <span>이메일: support@spacendw.kr</span>
              </div>
              <p className="text-outline">
                경기도 고양시 일산동구 중앙로 1261번길 42
              </p>
            </div>
            <div className="flex flex-col justify-between gap-space-sm">
              <div className="bg-error-container/40 p-space-sm rounded-xl border border-error/20">
                <p className="font-caption text-caption text-tertiary leading-relaxed">
                  <strong className="font-semibold">[플랫폼 면책 및 결제 안내]</strong> 쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며, 현장 인건비 및 수리 노무비는 작업 검수 후 시공 기사님께 직접 지급됩니다. 플랫폼은 현장 노무비 에스크로를 보유하지 않으며 플랫폼 매칭 수수료 외 시공 하자의 법적 책임은 시공 파트너에게 귀속됩니다.
                </p>
              </div>
              <p className="font-caption text-caption text-outline text-right md:text-left">
                © 2026 (주)공간다원. All rights reserved. SseulDakGo Domestic Infrastructure Platform.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
