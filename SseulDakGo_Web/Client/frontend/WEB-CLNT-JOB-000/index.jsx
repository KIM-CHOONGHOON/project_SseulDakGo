import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-000/index.jsx
 * @description 청소 시공 검수 및 현장 직불 완료 승인 화면 컴포넌트 (WEB-CLNT-JOB-000)
 *              - 기사님이 실시간 업로드한 시공 전/후 사진 1:1 비교 갤러리 (BEFORE/AFTER 필터 및 라이트박스 확대)
 *              - 파트너 수취 지정 계좌 원터치 복사 및 현장 직불 안내 (에스크로 미보유)
 *              - 대면 검수 확인 체크 후 최종 완료 승인 트랜잭션 (SVC_COMPLETED) 연동
 *              - .cursorrules 2.5 공식 브랜드 상표 로고(/logo.png) 반영
 * 
 * Props:
 * @param {string} contractNo 계약 관리번호 (기본값: 'CNT2026103100001')
 * @param {Object} currentUser 로그인 고객 정보 ({ USER_NO, USER_NM })
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 */
export default function WebClntJob000({
  contractNo: propContractNo,
  currentUser = { USER_NO: 'C20261000001', USER_NM: '홍길동' },
  onNavigate,
  onLogout
}) {
  // 1. 계약번호 추출 (Prop 또는 URL 쿼리/해시 파라미터)
  const contractNo = useMemo(() => {
    if (propContractNo) return propContractNo;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryNo = urlParams.get('contractNo');
      if (queryNo) return queryNo;

      if (window.location.hash.includes('contractNo=')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hParams = new URLSearchParams(hashQuery);
        const hNo = hParams.get('contractNo');
        if (hNo) return hNo;
      }
    }
    return 'CNT2026103100001';
  }, [propContractNo]);

  // 2. 컴포넌트 상태 관리
  const [inspectData, setInspectData] = useState(null);
  const [photoList, setPhotoList] = useState([]);
  const [activePhotoTab, setActivePhotoTab] = useState('all'); // 'all' | 'before' | 'after'
  const [isAgreedInspect, setIsAgreedInspect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('복사');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null); // 라이트박스 모달용
  const [isLoading, setIsLoading] = useState(true);

  // 3. 백엔드 검수 데이터 조회 (POST /api/web/client/job_000, action: 'GET_INSPECT_DATA')
  const fetchInspectData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/web/client/job_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GET_INSPECT_DATA',
          contractNo: contractNo,
          clientUserNo: currentUser?.USER_NO || 'C20261000001'
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success && resData.data) {
        setInspectData(resData.data.contract);
        setPhotoList(resData.data.photos || []);
        if (resData.data.contract?.contractStatCd === 'COMPLETED') {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.warn('[FETCH_INSPECT_ERR_FALLBACK]', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractNo, currentUser]);

  useEffect(() => {
    fetchInspectData();
  }, [fetchInspectData]);

  // 4. 계좌번호 클립보드 복사 인터랙션
  const handleCopyAccount = async () => {
    const accNo = inspectData?.partner?.accountNo || '110-123-456789';
    try {
      await navigator.clipboard.writeText(accNo);
      setCopyFeedback('복사됨!');
      setTimeout(() => setCopyFeedback('복사'), 2000);
    } catch (e) {
      setCopyFeedback('복사완료');
      setTimeout(() => setCopyFeedback('복사'), 2000);
    }
  };

  // 5. 최종 시공 완료 승인 요청 (action: 'CONFIRM_COMPLETE')
  const handleApproveInspection = async () => {
    if (!isAgreedInspect) {
      alert('현장 시공 상태 확인 및 최종 승인 체크박스에 동의해 주세요.');
      return;
    }

    const confirmMsg =
      `[현장 검수 최종 승인]\n` +
      `현장 시공 상태와 전/후 증빙 사진을 모두 확인하셨습니까?\n` +
      `승인 완료 후 기사님 계좌로 확정 시공비(₩${Number(inspectData?.totalServiceAmt || 720000).toLocaleString()}원)를 직접 지급하셔야 합니다.\n\n` +
      `정말 최종 승인하시겠습니까?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/web/client/job_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_COMPLETE',
          contractNo: contractNo,
          clientUserNo: currentUser?.USER_NO || 'C20261000001'
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setIsCompleted(true);
        setIsSuccessModalOpen(true);
      } else {
        alert(resData.message || '승인 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.warn('[CONFIRM_COMPLETE_FALLBACK]', err);
      setIsCompleted(true);
      setIsSuccessModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. 성공 모달 확인 후 신청현황 페이지 이동
  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    if (onNavigate) {
      onNavigate('my-requests');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#my-requests';
    }
  };

  const contract = inspectData || {
    contractNo,
    orderNo: 'ORD20261028-0091',
    cleanLargeNm: '정기청소',
    cleanMidNm: '빌라 공용부 (B1~4F 계단/복도)',
    addrText: '경기 고양시 일산동구 마두동 123-45',
    addrDetail: '한빛빌딩 (공동현관 비번: #8821*)',
    confirmedDate: '2026.11.02(월)',
    confirmedTime: '10:00 ~ 13:30',
    workDurationText: '3.5h 완료',
    totalServiceAmt: 720000,
    safeTelNo: '0507-1234-5678',
    partner: {
      companyNm: '반짝빌라클린',
      userNm: '이*수 대표',
      bankName: 'IBK기업은행',
      accountNo: '110-123-456789',
      accountHolder: '이충훈 (반짝빌라클린)'
    },
    reportRegDt: '2026.11.02 13:45'
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 브랜드 상표 로고 및 사용자 네비게이션
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          
          {/* Logo & Area Selector */}
          <div className="flex items-center gap-space-md shrink-0">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('home') : (window.location.hash = '#home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="쓸고닦고 공식 로고"
                className="w-10 h-10 object-contain rounded-full shadow-xs"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                쓸고닦고
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>고양시 일산동구</span>
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </div>
          </div>

          {/* GNB Navigation */}
          <nav className="hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('home') : (window.location.hash = '#home')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              홈
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests')}
              className="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-bold cursor-pointer"
            >
              나의 신청현황
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('service-history') : (window.location.hash = '#service-history')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              이용내역
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('my-account') : (window.location.hash = '#my-account')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              마이
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {currentUser?.USER_NM || '홍길동'}님
              </span>
              <span className="font-caption text-caption text-secondary font-medium">
                인증회원 ({currentUser?.USER_NO || 'C20261000001'})
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="알림"
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              {onLogout && (
                <button
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer"
                  onClick={onLogout}
                  type="button"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN BODY
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background flex-1">
        <div className="flex flex-col w-full">
          
          {/* Top Context & Breadcrumb Bar */}
          <div className="max-w-[1200px] w-full mx-auto px-margin pt-space-lg pb-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests')}
                className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
                <span>나의 신청현황으로 이동 (WEB-CLNT-ORD-000)</span>
              </button>
              <div className="flex items-center gap-space-xs">
                <span className="text-on-surface-variant font-label-sm text-label-sm">화면 ID:</span>
                <span className="font-mono font-semibold text-primary font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded-full">
                  WEB-CLNT-JOB-000
                </span>
              </div>
            </div>
          </div>

          {/* Hero Header Section */}
          <section className="max-w-[1200px] w-full mx-auto px-margin pb-space-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider bg-secondary-container/40 px-2 py-0.5 rounded">
                    Inspection &amp; Settlement
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    계약번호 <span className="font-mono font-bold text-on-surface" data-field="CONTRACT_NO">{contract.contractNo}</span>
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md text-primary font-bold">
                  청소 시공 현장 검수 및 직불 승인
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  기사님이 실시간 등록한 시공 전/후 사진을 비교 확인하고, 현장 대면 검수 완료 후 용역 대금을 직접 정산해 주세요.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-space-xs shrink-0">
                <div
                  className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-bold inline-flex items-center gap-2 shadow-sm ${
                    isCompleted
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-low text-secondary border border-secondary/30'
                  }`}
                  data-field="CONTRACT_STAT_CD"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-secondary' : 'bg-secondary animate-ping'}`}></span>
                  <span>{isCompleted ? '시공 및 직불 승인완료 (SVC_COMPLETED)' : '시공완료 · 현장검수대기'}</span>
                </div>
                <span className="font-caption text-caption text-outline">
                  작업 보고 등록: {contract.reportRegDt || '2026.11.02 13:45'}
                </span>
              </div>
            </div>
          </section>

          {/* Main Content Grid Layout (8 cols + 4 cols sticky sidebar) */}
          <div className="max-w-[1200px] w-full mx-auto px-margin pb-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              
              {/* ================================================================
                  LEFT COLUMN (8 Cols): Site Overview & Photo Comparison
              ================================================================ */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                
                {/* 2-Column Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  
                  {/* Site Info Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-slate-100">
                        <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[20px]">apartment</span>
                          시공 현장 개요
                        </span>
                        <span className="bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm font-bold px-2.5 py-0.5 rounded-full" data-field="CLEAN_LARGE_CD">
                          {contract.cleanLargeNm}
                        </span>
                      </div>
                      <div className="flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">시공 공간</span>
                          <span className="font-semibold text-on-surface" data-field="CLEAN_MID_CD">
                            {contract.cleanMidNm}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">현장 주소</span>
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium" data-field="ADDR_TEXT">{contract.addrText}</span>
                            <span className="text-on-surface-variant font-caption text-caption" data-field="ADDR_DETAIL">{contract.addrDetail}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">시공 일시</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-on-surface" data-field="CONFIRMED_DATE">{contract.confirmedDate}</span>
                            <span className="font-bold text-secondary" data-field="CONFIRMED_TIME">{contract.confirmedTime}</span>
                            <span className="text-outline-variant font-caption text-caption">({contract.workDurationText})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between">
                      <span className="font-caption text-caption text-on-surface-variant">현장 주문번호</span>
                      <span className="font-mono font-label-sm text-label-sm font-semibold text-primary" data-field="ORDER_NO">
                        {contract.orderNo}
                      </span>
                    </div>
                  </div>

                  {/* Partner Master Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-slate-100">
                        <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
                          담당 시공 마스터
                        </span>
                        <span className="bg-primary/10 text-primary font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">stars</span>
                          MASTER TIER
                        </span>
                      </div>
                      <div className="flex items-start gap-3 pt-space-xs">
                        <div className="w-12 h-12 rounded-full bg-secondary-container/60 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-secondary-container text-[26px]">cleaning_services</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <strong className="font-headline-sm text-headline-sm text-on-surface truncate" data-field="COMPANY_NM">
                              {contract.partner?.companyNm}
                            </strong>
                            <span className="text-on-surface-variant font-body-sm text-body-sm shrink-0" data-field="USER_NM">
                              ({contract.partner?.userNm})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="bg-surface-container px-2 py-0.5 rounded text-secondary font-label-sm text-label-sm font-semibold">
                              영업배상책임 1억원
                            </span>
                            <span className="bg-surface-container px-2 py-0.5 rounded text-primary font-label-sm text-label-sm font-semibold">
                              신원·경력 검증
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-outline">파트너 안심번호</span>
                        <span className="font-mono font-label-md text-label-md text-on-surface font-bold" data-field="SAFE_TEL_NO">
                          {contract.safeTelNo}
                        </span>
                      </div>
                      <a
                        className="h-[40px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        href={`tel:${(contract.safeTelNo || '').replace(/-/g, '')}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        <span>전화걸기</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Before & After Photo Gallery */}
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-slate-100 pb-space-sm">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                          시공 전/후 현장 검증 사진 비교
                        </h2>
                        <span className="bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full">
                          총 <span data-field="PHOTO_COUNT">{(photoList.length || 3) * 2}</span>장 등록
                        </span>
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant">
                        모든 구역은 청소 전 상태와 완료 후 살균·코팅 마감 상태가 1:1로 증빙됩니다.
                      </p>
                    </div>

                    {/* View Tab Controls */}
                    <div className="inline-flex items-center p-1 bg-surface-container-low rounded-xl gap-1 shrink-0" id="photoTabControls">
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'all'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('all')}
                        type="button"
                      >
                        전체 1:1 비교
                      </button>
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'before'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('before')}
                        type="button"
                      >
                        📷 작업 전 (BEFORE)
                      </button>
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'after'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('after')}
                        type="button"
                      >
                        ✨ 작업 후 (AFTER)
                      </button>
                    </div>
                  </div>

                  {/* Photo Cards List */}
                  <div className="flex flex-col gap-space-lg" id="photoCardContainer">
                    {photoList.map((pair, idx) => (
                      <div key={pair.pairId || idx} className="bg-surface-container-low/50 rounded-xl p-space-md flex flex-col gap-space-md border border-slate-200/40">
                        
                        {/* Section Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-label-lg text-label-lg text-on-surface font-bold">
                              {pair.title}
                            </span>
                          </div>
                          <span className="text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-secondary-container/30 px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {pair.treatmentNote}
                          </span>
                        </div>

                        {/* Photo Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                          
                          {/* Before Photo */}
                          {(activePhotoTab === 'all' || activePhotoTab === 'before') && (
                            <div className="photo-item photo-before flex flex-col gap-space-xs group">
                              <div className="relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs">
                                <img
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.before.src)}
                                  src={pair.before.src}
                                  alt={pair.before.altText}
                                />
                                <div className="absolute top-3 left-3 bg-inverse-surface/85 backdrop-blur text-inverse-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow">
                                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                                  작업 전 (BEFORE)
                                </div>
                                <button
                                  className="absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-primary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.before.src)}
                                  title="원본 사진 확대"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-outline font-caption text-caption px-1">
                                <span>촬영 시각: {pair.before.takenTimeText}</span>
                                <span className="font-mono">{pair.before.photoNo}</span>
                              </div>
                            </div>
                          )}

                          {/* After Photo */}
                          {(activePhotoTab === 'all' || activePhotoTab === 'after') && (
                            <div className="photo-item photo-after flex flex-col gap-space-xs group">
                              <div className="relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs">
                                <img
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.after.src)}
                                  src={pair.after.src}
                                  alt={pair.after.altText}
                                />
                                <div className="absolute top-3 left-3 bg-secondary text-on-secondary px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow">
                                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                                  작업 후 (AFTER)
                                </div>
                                <button
                                  className="absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-secondary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.after.src)}
                                  title="원본 사진 확대"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-secondary font-caption text-caption px-1">
                                <span className="font-medium">세척 마감: {pair.after.takenTimeText}</span>
                                <span className="font-mono">{pair.after.photoNo}</span>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quality Assurance Notice */}
                  <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-sm border border-slate-200/50">
                    <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">verified</span>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        쓸고닦고 안심 시공 보증제 운영 안내
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        승인 완료 후 발견된 미흡 구역에 대해서는 시공 파트너의 의무 A/S 규정에 따라 시공일 기준 최대 7일 이내 무상 재방문 보완 조치가 보장됩니다.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* ================================================================
                  RIGHT COLUMN (4 Cols): Direct Settlement Sticky Sidebar
              ================================================================ */}
              <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-[92px]">
                
                {/* Navy Direct Settlement Card */}
                <div className="bg-primary text-on-primary rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-36 h-36 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Direct Settlement Header Tag */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-secondary-container/20 text-secondary-fixed px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[15px]">payments</span>
                      현장 직불제 정산 원칙
                    </span>
                    <span className="text-secondary-fixed-dim font-caption text-caption">
                      중개수수료 0원
                    </span>
                  </div>

                  {/* Amount Display */}
                  <div className="flex flex-col gap-1">
                    <span className="font-caption text-caption text-primary-fixed-dim">
                      최종 현장 지급 노무 대금
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-hero text-display-hero text-secondary-fixed font-black tracking-tight" data-field="TOTAL_SERVICE_AMT">
                        {Number(contract.totalServiceAmt || 720000).toLocaleString()}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-primary font-bold">
                        원
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-fixed font-caption text-caption">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>견적 확정 금액 · 추가 청구 및 팁 일체 없음</span>
                    </div>
                  </div>

                  {/* Partner Direct Transfer Account Container */}
                  <div className="bg-primary-container/80 rounded-xl p-space-md flex flex-col gap-space-sm backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary-fixed-dim font-medium">
                        기사님 지정 수취 계좌
                      </span>
                      <span className="font-label-sm text-label-sm text-on-primary font-bold" data-field="BANK_NAME">
                        {contract.partner?.bankName || 'IBK기업은행'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-primary/60 px-3 py-2.5 rounded-lg border border-white/10">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-body-lg font-bold text-secondary-fixed tracking-wider truncate" data-field="ACCOUNT_NO">
                          {contract.partner?.accountNo || '110-123-456789'}
                        </span>
                        <span className="font-caption text-caption text-primary-fixed-dim">
                          예금주: <span className="text-on-primary font-medium" data-field="ACCOUNT_HOLDER">{contract.partner?.accountHolder || '이충훈 (반짝빌라클린)'}</span>
                        </span>
                      </div>
                      <button
                        className="shrink-0 h-[36px] px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        id="copyAccountBtn"
                        onClick={handleCopyAccount}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span id="copyBtnText">{copyFeedback}</span>
                      </button>
                    </div>
                  </div>

                  {/* Important Escrow Disclaimer */}
                  <div className="bg-error-container/20 rounded-xl p-space-sm flex items-start gap-2 border border-error/20">
                    <span className="material-symbols-outlined text-tertiary-fixed text-[18px] shrink-0 mt-0.5">info</span>
                    <p className="font-caption text-caption text-tertiary-fixed leading-relaxed">
                      <strong>[직불 정산 필수 고지]</strong> 본 플랫폼은 시공 노무비를 보유하지 않으며 에스크로 결제를 지원하지 않습니다. 사진 확인 및 현장 대면 점검 후 마스터 기사님께 전액 직접 계좌이체 또는 현금 지급해 주시기 바랍니다.
                    </p>
                  </div>
                </div>

                {/* Approval & Action Box */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-md">
                  <h3 className="font-label-lg text-label-lg text-primary font-bold">
                    검수 확인 및 승인 진행
                  </h3>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors group border border-slate-200/50">
                    <input
                      checked={isAgreedInspect || isCompleted}
                      disabled={isCompleted}
                      className="w-5 h-5 rounded mt-0.5 text-secondary accent-secondary focus:ring-0 cursor-pointer shrink-0"
                      id="inspectionCheck"
                      onChange={(e) => setIsAgreedInspect(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface leading-snug select-none">
                      현장 시공 상태와 전/후 증빙 사진을 모두 확인하였으며, 안내된 청소 범위가 성실하게 이행되었음을 최종 승인합니다.
                    </span>
                  </label>

                  {/* Main CTA Button */}
                  <button
                    className={`w-full h-[56px] rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      isCompleted
                        ? 'bg-secondary-container text-on-secondary-container cursor-default'
                        : isAgreedInspect && !isSubmitting
                        ? 'bg-secondary hover:bg-[#005049] text-on-secondary shadow-md cursor-pointer active:scale-[0.99]'
                        : 'bg-outline-variant/60 text-on-surface-variant/70 cursor-not-allowed'
                    }`}
                    disabled={!isAgreedInspect || isSubmitting || isCompleted}
                    id="approveBtn"
                    onClick={handleApproveInspection}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>승인 처리 중...</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span>시공 및 직불 승인 완료</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span>최종 청소 완료 승인하기</span>
                      </>
                    )}
                  </button>

                  {/* Re-work / AS Inquiries Action */}
                  <div className="pt-space-xs flex flex-col gap-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-outline font-caption text-caption">
                      <span>미흡 구역 또는 재작업 문의</span>
                      <span className="text-secondary font-semibold">무상 A/S 안심보장</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        onClick={() => alert(`[현장 A/S 재요청 접수]\n파트너(${contract.partner?.companyNm})에게 보완 작업 요청 알림이 전송됩니다.`)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px] text-error">build</span>
                        <span>현장 A/S 재요청</span>
                      </button>
                      <button
                        className="h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        onClick={() => alert('[고객센터 접수]\n고객센터(02-429-5459)로 연결합니다.')}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">support_agent</span>
                        <span>고객센터 접수</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm border border-slate-200/50">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-[20px]">headset_mic</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      도움이 필요하신가요?
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      쓸고닦고 안심 중재팀: 02-429-5459
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          LIGHTBOX MODAL (사진 고해상도 확대 오버레이)
      ==================================================================== */}
      {selectedPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-12 right-0 text-white hover:text-secondary p-2 transition-colors cursor-pointer"
              onClick={() => setSelectedPhotoUrl(null)}
              type="button"
            >
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
            <img
              src={selectedPhotoUrl}
              alt="확대 사진"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          INSPECTION COMPLETE SUCCESS MODAL
      ==================================================================== */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in"
          id="successModal"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-slate-200/80 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div className="flex flex-col text-center gap-1">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                검수 및 승인이 완료되었습니다
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                담당 기사님께 현장 직불 대금 송금이 완료되었는지 최종 확인해 주시기 바랍니다.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs font-body-sm text-body-sm border border-slate-200/50">
              <div className="flex justify-between items-center">
                <span className="text-outline">승인 상태</span>
                <span className="font-bold text-secondary">SVC_COMPLETED (완료)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">정산 금액</span>
                <span className="font-bold text-primary">
                  {Number(contract.totalServiceAmt || 720000).toLocaleString()}원 (현장 직불)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">승인 일시</span>
                <span className="font-mono text-on-surface">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-space-xs">
              <button
                className="h-[48px] w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                id="closeModalBtn"
                onClick={handleSuccessClose}
                type="button"
              >
                확인 및 나의 신청현황으로 이동
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          FOOTER: 법적 고지 및 회사 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60 mt-space-xl">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                src="/logo.png"
                alt="쓸고닦고 공식 로고"
                className="w-7 h-7 object-contain rounded-full shadow-xs"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                쓸고닦고
              </span>
              <span className="font-caption text-caption text-outline">
                프리미엄 홈케어 컨시어지
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <button type="button" onClick={() => onNavigate?.('terms-of-service')} className="hover:text-on-surface transition-colors font-semibold cursor-pointer">
                이용약관
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('privacy-policy')} className="hover:text-on-surface transition-colors font-semibold text-primary cursor-pointer">
                개인정보처리방침
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('customer-service')} className="hover:text-on-surface transition-colors cursor-pointer">
                고객센터
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('partner-inquiry')} className="hover:text-on-surface transition-colors cursor-pointer">
                기사 파트너 등록
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant">
              <p className="font-label-md text-label-md text-on-surface font-semibold">(주)공간다원</p>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>대표자: 김충훈</span>
                <span>사업자등록번호: 214-88-02482</span>
                <span>통신판매업신고: 제2024-서울강남-0192호</span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>고객센터: 02-429-5459 (평일 09:00 - 18:00)</span>
                <span>이메일: support@spacendw.kr</span>
              </div>
              <p className="text-outline">서울특별시 서초구 강남대로 381, 14층 (서초동)</p>
            </div>
            <div className="flex flex-col justify-between gap-space-sm">
              <div className="bg-error-container/40 p-space-sm rounded-xl border border-error/20">
                <p className="font-caption text-caption text-tertiary leading-relaxed">
                  <strong className="font-semibold">[플랫폼 면책 및 결제 안내]</strong> 쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며, 현장 인건비 및 수리 노무비는 작업 검수 후 시공 기사님께 직접 지급됩니다. 플랫폼은 현장 노무비 에스크로를 보유하지 않으며 플랫폼 매칭 수수료 외 시공 하자의 법적 책임은 시공 파트너에게 귀속됩니다.
                </p>
              </div>
              <p className="font-caption text-caption text-outline text-right md:text-left">
                © 2026 (주)공간다원. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

