import React, { useState, useEffect, useMemo, useCallback } from 'react';
import WebClntPay000 from '../WEB-CLNT-PAY-000/index.jsx';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-001/index.jsx
 * @description 청소 요청 상세 및 용역 청약서 비교/선택 화면 컴포넌트 (WEB-CLNT-ORD-001)
 *              - 2열 비대칭 레이아웃 (38% 좌측 Sticky 발주 스펙 요약 / 62% 우측 파트너 청약서 비교 피드)
 *              - 가격 역경매 배제, 고객 확정 지정가(100% 수락) 기반 파트너 일정/역량/평점 비교
 *              - 7일 만료 실시간 타이머 및 정렬(추천순, 빠른시공순, 최신접수순) 지원
 *              - [이 파트너로 배차 확정하기 >] 클릭 시 전자계약 체결 모달(WEB-CLNT-PAY-000 연계) 오픈
 *              - .cursorrules 2.5 공식 브랜드 상표 로고(/logo.png) 반영
 * 
 * Props:
 * @param {string} orderNo 발주 관리번호 (미전달 시 URL 파라미터 또는 기본값 사용)
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 * @param {Object} currentUser 로그인 사용자 정보 ({ USER_NO, USER_NM, USER_ROLE_CD })
 */
export default function WebClntOrd001({
  orderNo: propOrderNo,
  onNavigate,
  onLogout,
  currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
  }
}) {
  // 1. URL 파라미터 추출 또는 Prop 기반 발주번호 결정
  const orderNo = useMemo(() => {
    if (propOrderNo) return propOrderNo;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryOrderNo = urlParams.get('orderNo');
      if (queryOrderNo) return queryOrderNo;

      // Hash 파라미터 검사 (#WEB-CLNT-ORD-001?orderNo=...)
      if (window.location.hash.includes('orderNo=')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        const hNo = hashParams.get('orderNo');
        if (hNo) return hNo;
      }
    }
    return 'ORD2026103100001';
  }, [propOrderNo]);

  // 2. 상태 관리
  const [orderData, setOrderData] = useState(null);
  const [applyList, setApplyList] = useState([]);
  const [selectedApply, setSelectedApply] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [sortType, setSortType] = useState('recommend'); // 'recommend' | 'fast' | 'latest'
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isConfirming, setIsConfirming] = useState(false);

  const effectiveUserNo = currentUser.USER_NO || 'C20261000001';

  // 3. 백엔드 API 상세 및 청약서 목록 호출 (POST /api/web/client/ord_001)
  const fetchOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/web/client/ord_001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientUserNo: effectiveUserNo,
          orderNo: orderNo
        })
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setOrderData(result.data.orderMaster);
        setApplyList(result.data.applyList || []);
      }
    } catch (err) {
      console.warn('[WEB-CLNT-ORD-001] 청약서 상세 조회 실패 (시뮬레이션 유지):', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserNo, orderNo]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 4. 실시간 타이머 갱신 인터벌 (1초 주기)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 남은 시간 계산
  const remainingTimeText = useMemo(() => {
    if (!orderData || !orderData.bidExpireDt) return '3일 08시간 12분';
    const expireTime = new Date(orderData.bidExpireDt).getTime();
    const diff = expireTime - currentTime;
    if (diff <= 0) return '청약 접수 마감';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    return `${days}일 ${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`;
  }, [orderData, currentTime]);

  // 정렬된 청약서 목록
  const sortedApplyList = useMemo(() => {
    const list = [...applyList];
    if (sortType === 'fast') {
      // 빠른 시공순 (startTime 앞선 순)
      return list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }
    if (sortType === 'latest') {
      // 최신 접수순
      return list.sort((a, b) => new Date(b.regDt).getTime() - new Date(a.regDt).getTime());
    }
    // 기본 추천순: 평점 높은 순
    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [applyList, sortType]);

  // 파트너 선택 및 배차 확정 모달 열기
  const handleSelectPartner = (apply) => {
    setSelectedApply(apply);
    setIsPayModalOpen(true);
  };

  // 배차 최종 확정 액션 처리
  const handleConfirmMatch = () => {
    if (!selectedApply) return;
    setIsConfirming(true);

    setTimeout(() => {
      setIsConfirming(false);
      setIsPayModalOpen(false);
      alert(
        `🎉 [배차 확정 완료]\n파트너사 "${selectedApply.companyNm}"(청약번호: ${selectedApply.applyNo}) 배차가 최종 확정되었습니다.\n\n표준 전자계약서 교부 및 결제 연동 페이지(WEB-CLNT-PAY-000)로 이동합니다.`
      );
      if (onNavigate) {
        onNavigate('WEB-CLNT-PAY-000');
      }
    }, 800);
  };

  // 뒤로 가기 (목록으로 이동)
  const handleGoBack = (e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate('my-requests');
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  if (isLoading && !orderData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-[40px] animate-spin mb-3">progress_activity</span>
        <p className="font-label-md text-label-md text-on-surface-variant">발주 상세 및 파트너 청약서를 불러오는 중입니다...</p>
      </div>
    );
  }

  const order = orderData || {
    orderNo: 'ORD2026103100001',
    cleanLargeNm: '정기청소',
    facilityTypeNm: '사무실·오피스',
    proposedPrice: 720000,
    cleanMidNm: '계단, 복도, 외곽 공용부',
    serviceStartDt: '2026.11.01',
    serviceEndDt: '2027.01.31',
    weekCleanFreq: 2,
    cleanDaysConfig: '매주 월, 수',
    addrText: '경기 고양시 일산동구 마두동 123-45 한빛빌딩 (B1~4F)',
    parkingAvailText: '지하 주차 가능 (무료 방문권 지급)',
    contactPersonNm: '홍길동',
    contactTel: '010-9876-5432',
    detailReqNote: '지하 1층부터 지상 4층까지 계단 난간 및 유리창 먼지 제거 위주로 부탁드립니다. 1층 출입구 분리수거장 주변 물청소 포함입니다.'
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 상단 고정 GNB (.cursorrules 2.5 공식 로고 /logo.png 반영)
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          {/* Brand Logo & Location */}
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
                <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight leading-none">
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
              onClick={handleGoBack}
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

          {/* Profile & Auth Cluster */}
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
          SUB-HEADER & NAVIGATION BAR
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* Sub-Header Navigation & Order Key Bar */}
          <div className="w-full bg-surface-container-lowest shadow-sm border-b border-slate-200/60">
            <div className="max-w-[1200px] mx-auto px-margin py-3.5 flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low cursor-pointer"
                  onClick={handleGoBack}
                  title="신청 목록으로 이동"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>목록으로 돌아가기</span>
                </button>
                <span className="text-outline-variant text-caption">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-caption text-caption">발주번호</span>
                  <span className="font-label-md text-label-md font-bold text-primary tracking-tight font-mono" data-field="ORDER_NO">
                    {order.orderNo}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-caption text-caption text-on-surface-variant">진행 프로세스</span>
                <span
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full shadow-xs"
                  data-field="ORDER_STATUS"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  청약접수중
                </span>
              </div>
            </div>
          </div>

          {/* ====================================================================
              MAIN WORKFLOW CANVAS: 2-Column Split (38% Left / 62% Right)
          ==================================================================== */}
          <div className="max-w-[1200px] mx-auto px-margin py-space-xl w-full">
            {/* Notice Headline */}
            <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                    DISPATCH &amp; SUBSCRIPTION COMPARISON
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-caption text-caption text-outline font-mono">WEB-CLNT-ORD-001</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                  청소 요청 상세 및 용역 청약서 비교/선택
                </h1>
              </div>
              <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2 text-on-surface-variant font-caption text-caption border border-slate-200/60">
                <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                <span>고객 확정 지정가 방식 · 추가금 요구 없는 1:1 파트너 직배차</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* ================================================================
                  LEFT COLUMN: Sticky Order Summary (38% -> 5 cols)
              ================================================================ */}
              <aside className="lg:col-span-5 w-full lg:sticky lg:top-[92px]">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-md border border-slate-200/80">
                  {/* Card Header & Category Badges */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold">내 청소 발주 조건</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-md font-semibold" data-field="CLEAN_LARGE_CD">
                        {order.cleanLargeNm || '정기청소'}
                      </span>
                      <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2.5 py-1 rounded-md" data-field="FACILITY_TYPE_CD">
                        {order.facilityTypeNm || '사무실·오피스'}
                      </span>
                    </div>
                  </div>

                  {/* Fixed Matching Price Block */}
                  <div className="bg-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-on-primary/80 font-caption text-caption">
                        <span>고객 지정 확정 대금</span>
                        <span className="inline-flex items-center gap-1 text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-secondary-fixed">
                          <span className="material-symbols-outlined text-[13px]">lock</span>
                          역경매 없음
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-caption text-on-primary/80">월</span>
                        <strong
                          className="font-display-hero text-headline-lg lg:text-[34px] font-bold text-secondary-container tracking-tight font-mono"
                          data-field="PROPOSED_PRICE"
                        >
                          {Number(order.proposedPrice).toLocaleString()}원
                        </strong>
                      </div>
                      <p className="font-caption text-caption text-on-primary/75 mt-1 leading-snug">
                        현장 직불 고정액 · 수수료 분쟁 제로 · 플랫폼 중개수수료 별도 정산
                      </p>
                    </div>
                    {/* Decorative Shape */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                  </div>

                  {/* 7-Day Expiry Countdown Timer Banner */}
                  <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center justify-between gap-2 border border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">청약 접수 마감까지</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-label-lg text-label-lg font-bold text-error font-mono" data-field="BID_EXPIRE_DT">
                        {remainingTimeText}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Specifications Table */}
                  <div className="flex flex-col divide-y divide-surface-container-high text-body-sm font-body-sm">
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">청소 구역/유형</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium" data-field="CLEAN_MID_CD">
                        {order.cleanMidNm}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">계약/희망 일정</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium">
                        <span data-field="SERVICE_START_DT">{order.serviceStartDt}</span> ~ <span data-field="SERVICE_END_DT">{order.serviceEndDt}</span>
                        <span className="text-secondary font-semibold text-caption ml-1">({order.servicePeriodDays || 92}일간)</span>
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">주기 및 요일</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium">
                        주 <span className="font-bold text-primary" data-field="WEEK_CLEAN_FREQ">{order.weekCleanFreq || 2}</span>회
                        (<span className="text-secondary font-semibold" data-field="CLEAN_DAYS_CONFIG">{order.cleanDaysConfig || '매주 월, 수'}</span>)
                      </span>
                    </div>
                    <div className="py-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-caption text-caption">현장 주소</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>경기 고양
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface" data-field="ADDR_TEXT">
                        {order.addrText}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">현장 주차</span>
                      <span className="font-label-md text-label-md text-on-surface text-right" data-field="PARKING_AVAIL_CD">
                        {order.parkingAvailText || '지하 주차 가능 (무료 방문권 지급)'}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">발주자 정보</span>
                      <span className="font-label-md text-label-md text-on-surface text-right">
                        <span className="font-bold" data-field="CONTACT_PERSON_NM">{order.contactPersonNm}</span>
                        <span className="text-outline">·</span>
                        <span className="text-on-surface-variant" data-field="CONTACT_TEL">{order.contactTel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer Detail Note Box */}
                  <div className="bg-surface-container-low/70 rounded-xl p-3.5 flex flex-col gap-1.5 border border-slate-200/50">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-primary">assignment</span>
                      <span className="font-bold">현장 특기 요청사항</span>
                    </div>
                    <div
                      className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-lowest p-3 rounded-lg border border-slate-200/40"
                      data-field="DETAIL_REQ_NOTE"
                    >
                      "{order.detailReqNote}"
                    </div>
                  </div>

                  {/* Trust Escrow Policy Pill */}
                  <div className="bg-error-container/30 rounded-xl p-3 text-caption font-caption text-tertiary flex items-start gap-2 border border-error/20">
                    <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0 mt-0.5">info</span>
                    <p className="leading-relaxed">
                      <strong>직접 지급 안전고지:</strong> 플랫폼은 현장 노무비를 보관하지 않으며, 작업 완료 후 현장 검수 시 확정액을 기사님께 직접 지급합니다.
                    </p>
                  </div>
                </div>
              </aside>

              {/* ================================================================
                  RIGHT COLUMN: Partner Application Proposals List (62% -> 7 cols)
              ================================================================ */}
              <div className="lg:col-span-7 flex flex-col gap-space-md w-full">
                {/* Control Header & Sorting Filter Bar */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-slate-200/80">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold">접수된 파트너 청약서</h2>
                      <span className="inline-flex items-center justify-center bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold">
                        <span data-field="TOTAL_APPLY_CNT">{sortedApplyList.length}</span>건
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                      기사님이 제안한 방문 일자, 시작 시각, 투입 인원 및 작업 계획을 꼼꼼히 확인하고 최적의 파트너 1인을 선택해 주세요.
                    </p>
                  </div>

                  {/* Sorting Segmented Buttons */}
                  <div className="inline-flex p-1 bg-surface-container-low rounded-xl shrink-0 border border-slate-200/50" role="tablist">
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'recommend'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('recommend')}
                      type="button"
                    >
                      추천순
                    </button>
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'fast'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('fast')}
                      type="button"
                    >
                      빠른시공순
                    </button>
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'latest'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('latest')}
                      type="button"
                    >
                      최신접수순
                    </button>
                  </div>
                </div>

                {/* Proposals Cards Feed */}
                {sortedApplyList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-slate-200/70 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[48px] mb-3">hourglass_empty</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                      현재 접수된 파트너 청약서가 없습니다.
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      7일 기한 내 마스터들이 청약서를 제출하는 즉시 본 화면에 실시간으로 등록됩니다.
                    </p>
                  </div>
                ) : (
                  sortedApplyList.map((apply, idx) => {
                    const isTopRecommend = idx === 0 && sortType === 'recommend';

                    return (
                      <article
                        className={`relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md overflow-hidden border border-slate-200/80 ${
                          isTopRecommend ? 'ring-2 ring-secondary/40 shadow-md' : ''
                        }`}
                        data-apply-no={apply.applyNo}
                        key={apply.applyNo}
                      >
                        {/* Top Accent Ribbon for Top Recommendation */}
                        {isTopRecommend && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-secondary-container to-primary"></div>
                        )}

                        {/* Card Header & Partner Profile */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pt-1">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0 text-secondary">
                              <span className="material-symbols-outlined text-[28px]">
                                {idx === 0 ? 'cleaning_services' : idx === 1 ? 'sanitizer' : 'groups'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {apply.recommendBadge && (
                                  <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold inline-flex items-center gap-1 shadow-xs">
                                    <span className="material-symbols-outlined text-[13px]">verified</span>
                                    {apply.recommendBadge}
                                  </span>
                                )}
                                <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-medium">
                                  {apply.gradeNm || '마스터 등급'}
                                </span>
                                <span className="text-caption font-caption text-outline" data-field="REG_DT">
                                  {apply.regDt} 접수
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight" data-field="COMPANY_NM">
                                  {apply.companyNm}
                                </h3>
                                <span className="font-label-md text-label-md text-on-surface-variant font-medium" data-field="USER_NM">
                                  ({apply.userNm || '마스터'})
                                </span>
                              </div>
                              {/* Rating and Verified Badges */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <div className="inline-flex items-center gap-1 text-[#F59E0B] font-label-sm text-label-sm font-bold">
                                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                  </span>
                                  <span>{apply.rating || '5.0'}</span>
                                  <span className="text-on-surface-variant font-normal font-caption text-caption">
                                    (리뷰 {apply.reviewCount || 84}건)
                                  </span>
                                </div>
                                <span className="text-outline-variant text-[10px]">·</span>
                                {(apply.certifications || ['신원100%검증', '배상책임보험 1억원 가입']).map((c, ci) => (
                                  <span
                                    className="bg-surface-container-low text-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full"
                                    key={ci}
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:shrink-0">
                            <span className="font-caption text-caption text-outline">
                              {apply.careerText ? '경력 누적' : apply.specialPointText ? '특화 포인트' : '고객 지정가 수락율'}
                            </span>
                            <div className="font-label-lg text-label-lg font-bold text-secondary">
                              {apply.careerText || apply.specialPointText || '100% 일치'}
                            </div>
                          </div>
                        </div>

                        {/* Proposal Spec Highlights Grid (4 Columns) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-secondary-container/20 rounded-xl p-3.5 border border-secondary/15">
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">시공 제안일</span>
                            <strong className="font-label-lg text-label-lg text-secondary font-bold" data-field="PROPOSED_DATE">
                              {apply.proposedDate}
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">시작 시각</span>
                            <strong className="font-label-lg text-label-lg text-on-surface font-bold" data-field="START_TIME">
                              {apply.startTime}
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">예상 소요시간</span>
                            <strong className="font-label-lg text-label-lg text-on-surface font-bold" data-field="WORK_HOURS">
                              {apply.workHours}시간
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">투입 인원</span>
                            <strong className="font-label-lg text-label-lg text-primary font-bold" data-field="ASSIGN_STAFF_CNT">
                              {apply.assignStaffCnt}
                            </strong>
                          </div>
                        </div>

                        {/* Partner Appeal Message */}
                        <div className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-1.5 shadow-xs border border-slate-200/40">
                          <div className="flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-secondary">format_quote</span>
                            <span>파트너 작업 계획 및 어필</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed pl-1" data-field="APPEAL_MSG">
                            "{apply.appealMsg}"
                          </p>
                        </div>

                        {/* Bottom Action Bar & Contract Acceptance */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-2 bg-surface-container-low/40 p-3 rounded-xl border border-slate-200/40">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-caption text-caption text-on-surface-variant">확정 시공비:</span>
                            <strong className="font-headline-sm text-headline-sm font-bold text-secondary font-mono">
                              {Number(apply.confirmedPrice || order.proposedPrice).toLocaleString()}원
                            </strong>
                            <span className="font-caption text-[11px] text-outline font-medium">
                              (고객 지정가 100% 수락 · 추가비 없음)
                            </span>
                          </div>
                          <button
                            className="btn-select-partner inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-on-secondary-container active:scale-95 px-5 py-2.5 rounded-xl font-label-lg text-label-lg font-bold shadow-sm transition-all cursor-pointer"
                            data-apply={apply.applyNo}
                            data-name={apply.companyNm}
                            data-time={`${apply.proposedDate} ${apply.startTime}`}
                            onClick={() => handleSelectPartner(apply)}
                            type="button"
                          >
                            <span>이 파트너로 배차 확정하기</span>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3-Pillar Security & Trust Banner */}
            <section className="mt-space-xl bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/70">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0 text-secondary">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">100% 신원 보증 파트너</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      사업자등록증, 범죄경력 검증, 배상책임보험 1억원 이상 의무 가입된 정예 기사님만 매칭됩니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <span className="material-symbols-outlined text-[22px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">현장 직불제 안심 정산</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      사전 선결제 강요 없이 현장 작업 검수가 완료된 후 파트너에게 직접 정산하여 분쟁을 차단합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface">
                    <span className="material-symbols-outlined text-[22px]">handshake</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">3개월 무상 A/S 보증</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      정기 계약 기간 중 발생한 미흡 구간 및 현장 클레임 발생 시 24시간 내 재방문 조치를 지원합니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ====================================================================
          INTERACTIVE CONFIRMATION MODAL: WEB-CLNT-PAY-000 결제 및 배차 확정 모달
      ==================================================================== */}
      {isPayModalOpen && selectedApply && (
        <WebClntPay000
          isOpen={isPayModalOpen}
          orderData={{
            ...order,
            categories: [order.cleanLargeCd || 'REGULAR']
          }}
          applyData={selectedApply}
          currentUser={currentUser}
          onClose={() => setIsPayModalOpen(false)}
          onPaymentSuccess={(contractData) => {
            console.log('[PAY_SUCCESS]', contractData);
            if (onNavigate) {
              onNavigate('my-application-status');
            } else if (typeof window !== 'undefined') {
              window.location.hash = '#my-application-status';
            }
          }}
        />
      )}

      {/* ====================================================================
          FOOTER: 하단 법적 고지 및 고객센터 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                alt="쓸고닦고 공식 로고"
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

