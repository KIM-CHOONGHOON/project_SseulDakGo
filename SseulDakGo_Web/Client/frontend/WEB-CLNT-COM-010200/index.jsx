import React, { useState, useEffect, useCallback } from 'react';

/**
 * 화면 ID: WEB-CLNT-COM-010200
 * 화면명: 쓸고닦고 고객 메인 대시보드
 */
export default function WebClntCom010200({ userInfo, onOpenReqModal, onNavigate, onLogout }) {
  const [dateFrom, setDateFrom] = useState('2025.11.20');
  const [dateTo, setDateTo] = useState('2026.11.20');
  const [orderStatus, setOrderStatus] = useState('REQ_APPLY');
  const [page, setPage] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqType, setReqType] = useState('REGULAR');
  const [reqAddress, setReqAddress] = useState('경기 고양시 덕양구 화정동');
  const [reqPrice, setReqPrice] = useState('270,000');

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const fetchDashboard = useCallback(async (targetPage = page, targetFrom = dateFrom, targetTo = dateTo, targetStatus = orderStatus) => {
    try {
      const uNo = userInfo?.USER_NO || 'C20261100001';
      const qs = new URLSearchParams({
        userNo: uNo,
        dateFrom: targetFrom,
        dateTo: targetTo,
        orderStatus: targetStatus,
        page: String(targetPage),
        pageSize: '10',
      });
      const res = await fetch(`/api/clnt/com/010200?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.success) {
        showToast(json?.message || '조회 중 오류가 발생했습니다.');
        return;
      }
      setDashboardData(json.data);
      if (json.data?.clientProfile?.defaultAddress) {
        setReqAddress(json.data.clientProfile.defaultAddress);
      }
    } catch {
      showToast('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [userInfo?.USER_NO, page, dateFrom, dateTo, orderStatus, showToast]);

  useEffect(() => {
    fetchDashboard(1, dateFrom, dateTo, orderStatus);
  }, [userInfo?.USER_NO]);

  const profile = dashboardData?.clientProfile || {
    userNo: userInfo?.USER_NO || 'C20261100001',
    userNm: userInfo?.USER_NM || '김충훈',
    roleLabel: '일반 회원 (C)',
    badgeLabel: '안심회원',
    unreadNotiCnt: 2,
  };
  const statusOptions = dashboardData?.filterMeta?.statusOptions || [
    { code: 'ALL', label: '전체 (ALL)' },
    { code: 'REQ_APPLY', label: '청소 청약 (REQ_APPLY)' },
    { code: 'APPLY_CMPL', label: '단독 청약 접수 완료 (APPLY_CMPL)' },
    { code: 'PAY_WAIT', label: '1차 이용료 결제대기 (PAY_WAIT)' },
    { code: 'JOB_ING', label: '시공 확정/진행중 (JOB_ING)' },
    { code: 'JOB_INSPECT', label: '시공 사진 검수/승인대기 (JOB_INSPECT)' },
    { code: 'JOB_CMPL', label: '시공 완료 (JOB_CMPL)' },
    { code: 'ORDER_CANCEL', label: '발주 취소 (ORDER_CANCEL)' },
  ];
  const pagination = dashboardData?.pagination || {
    currentPage: page,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    startItem: 0,
    endItem: 0,
  };
  const orders = dashboardData?.orders || [];

  const setPeriodRange = (days) => {
    const toD = new Date();
    const fromD = new Date(toD.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const f = fmt(fromD);
    const t = fmt(toD);
    setDateFrom(f);
    setDateTo(t);
    showToast(`조회기간이 최근 ${days === 30 ? '1개월' : days === 90 ? '3개월' : days === 180 ? '6개월' : '1년'}으로 설정되었습니다.`);
  };

  const handleResetFilter = () => {
    const toD = new Date();
    const fromD = new Date(toD.getTime() - 365 * 24 * 60 * 60 * 1000);
    const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    const f = fmt(fromD);
    const t = fmt(toD);
    setDateFrom(f);
    setDateTo(t);
    setOrderStatus('REQ_APPLY');
    setPage(1);
    fetchDashboard(1, f, t, 'REQ_APPLY');
    showToast('검색 필터 조건이 초기화되었습니다.');
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchDashboard(1, dateFrom, dateTo, orderStatus);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    fetchDashboard(newPage, dateFrom, dateTo, orderStatus);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* [Section 1: Client Global Navigation Bar (GNB)] */}
      <header className="h-[70px] flex-shrink-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-8">
          <button type="button" onClick={() => onNavigate?.('home')} className="flex items-center gap-3 group cursor-pointer">
            <img alt="쓸고닦고 공식 로고" className="h-10 w-auto object-contain rounded" src="/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg" />
          </button>
          <nav className="hidden md:flex items-center gap-1">
            <button type="button" onClick={() => (onOpenReqModal ? onOpenReqModal('REGULAR') : setReqModalOpen(true))} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">post_add</span>
              청소 용역 발주
              <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded">지정가</span>
            </button>
            <button type="button" onClick={() => showToast('내 청소 발주 관리 (WEB-CLNT-ORD-010000) 화면으로 이동합니다.')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
              청소 발주
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
            <button type="button" onClick={() => showToast('시공 전·후 사진 검수 (WEB-CLNT-JOB-010000) 화면을 호출합니다.')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              시공 검수
            </button>
            <button type="button" onClick={() => onNavigate?.('WEB-CLNT-MYP-010100')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">person</span>
              내 정보
            </button>
            <button type="button" onClick={() => showToast('고객센터 및 FAQ 센터 이동')} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              고객센터
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => showToast(`알림 센터 (WEB-CLNT-COM-010100): 읽지 않은 ${profile.unreadNotiCnt}건의 알림이 있습니다.`)} className="relative p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer" title="알림 센터 (WEB-CLNT-COM-010100)">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {profile.unreadNotiCnt > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {profile.unreadNotiCnt}
              </span>
            )}
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 pr-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {(profile.userNm || '김').slice(0, 1)}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{profile.userNm} 고객님</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-1.5 py-0.2 rounded">{profile.badgeLabel}</span>
              </div>
              <span className="text-[10px] text-slate-400">{profile.roleLabel}</span>
            </div>
            <button type="button" onClick={() => (onLogout ? onLogout() : showToast('로그아웃 되었습니다.'))} className="text-xs font-medium text-slate-400 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* [Main Content Area] */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col py-5 gap-4">
          {/* [Section 2: Client Welcome & Primary Action Banner] */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="absolute -right-20 -top-24 w-80 h-80 bg-gradient-to-br from-sky-100/60 to-teal-50/40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 tracking-wider">
                  WEB-CLNT-COM-010200 · CLIENT DASHBOARD
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  실시간 청약 매칭 활성화
                </span>
              </div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                {profile.userNm} 고객님, 환영합니다!
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                고객님이 <span className="font-bold text-sky-700 underline decoration-sky-300 underline-offset-4">직접 정한 요금 그대로!</span> 흥정·역경매 없는 1:1 단독 선착순 매칭으로 정기청소·입주이사청소·계절가전 분해케어를 간편하게 발주하고 실시간 진행 현황을 확인하세요.
              </p>
            </div>
            <div className="relative z-10 flex-shrink-0 flex items-center gap-3 w-full lg:w-auto">
              <button type="button" onClick={() => (onOpenReqModal ? onOpenReqModal('REGULAR') : setReqModalOpen(true))} className="w-full lg:w-auto px-7 py-4 rounded-xl font-bold text-base text-white bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 group cursor-pointer">
                <span className="material-symbols-outlined text-[22px] group-hover:rotate-6 transition-transform">post_add</span>
                <span>확정 지정가로 청소 발주하기</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* [Section 4: My Active Cleaning Orders & Matching Pipeline] */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                  <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                </span>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">내 진행 중인 청소 발주 현황</h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  총 {pagination.totalItems}건 (페이지 {pagination.currentPage}/{pagination.totalPages})
                </span>
              </div>
              <button type="button" onClick={() => showToast('전체 발주 목록 (WEB-CLNT-ORD-010000) 이동')} className="text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 group cursor-pointer">
                전체 발주 목록 보기
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                <span className="text-[10px] text-slate-400 font-mono">(WEB-CLNT-ORD-010000)</span>
              </button>
            </div>

            {/* Search / Filter Bar */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
                <div className="lg:col-span-7 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-slate-500">calendar_today</span>
                      조회기간
                    </label>
                    <span className="text-[11px] text-slate-400">최대 1년(365일) 범위 내에서만 조회가 가능합니다</span>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
                      <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 font-mono text-center" placeholder="YYYY.MM.DD" />
                      <span className="text-slate-400 text-xs font-bold">~</span>
                      <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 font-mono text-center" placeholder="YYYY.MM.DD" />
                    </div>
                    <div className="inline-flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => setPeriodRange(30)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-sky-700 transition-colors cursor-pointer">최근 1개월</button>
                      <button type="button" onClick={() => setPeriodRange(90)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-sky-700 transition-colors cursor-pointer">3개월</button>
                      <button type="button" onClick={() => setPeriodRange(180)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-sky-700 transition-colors cursor-pointer">6개월</button>
                      <button type="button" onClick={() => setPeriodRange(365)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 border border-sky-300 text-sky-700 transition-colors cursor-pointer">1년</button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-500">filter_list</span>
                    진행상태
                  </label>
                  <select id="filter-order-status" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer">
                    {statusOptions.map((opt) => (
                      <option key={opt.code} value={opt.code}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center gap-2">
                  <button type="button" onClick={handleResetFilter} className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    초기화
                  </button>
                  <button type="button" onClick={handleApplyFilter} className="flex-1 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    조회
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Pipeline List */}
            <div className="flex flex-col gap-3.5">
              {orders.map((ord) => (
                <div key={ord.orderNo} className="p-5 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50/80 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-600 text-white">{ord.cleanCatNm}</span>
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">{ord.orderStatNm}</span>
                      <span className="text-xs text-slate-400 font-mono">발주번호: {ord.orderNo}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-slate-800">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>{ord.locationSummary}</span>
                      {ord.scheduleSummary && (
                        <>
                          <span className="hidden sm:inline text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-600"><span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>{ord.scheduleSummary}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <span className="text-slate-500">고객 확정 지정가:</span>
                      <span className="text-base font-extrabold text-[#0284C7]">{Number(ord.fixedServiceAmt || 0).toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {ord.matchingInfo?.companyNm && (
                      <div className="text-right sm:mr-2">
                        <div className="text-xs font-bold text-sky-700">{ord.matchingInfo.companyNm}</div>
                        {ord.matchingInfo.safeTelService && (
                          <div className="text-[11px] text-slate-400">{ord.matchingInfo.safeTelService}</div>
                        )}
                      </div>
                    )}
                    <button type="button" onClick={() => showToast(`[${ord.orderNo}] ${ord.ctaAction?.label || '상세 조회'} (${ord.ctaAction?.targetScreenId || 'WEB-CLNT-ORD-010100'})`)} className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                      <span>{ord.ctaAction?.label || '발주 상세 조회'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-200/80 select-none">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-slate-400">format_list_bulleted</span>
                <span>전체 <strong className="text-slate-800 font-bold">{pagination.totalItems}</strong>건 중 <strong className="text-sky-700 font-bold">{pagination.startItem}-{pagination.endItem}</strong>건 표시</span>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-slate-400">페이지당 10건</span>
              </div>
              <div className="flex items-center justify-end w-full sm:w-auto">
                <nav aria-label="청소 발주 목록 페이지 이동" className="inline-flex items-center gap-1 rounded-xl bg-slate-50/80 p-1 border border-slate-200/80 shadow-sm">
                  <button type="button" disabled={pagination.currentPage <= 1} onClick={() => handlePageChange(1)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">«</button>
                  <button type="button" disabled={pagination.currentPage <= 1} onClick={() => handlePageChange(pagination.currentPage - 1)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">‹</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} type="button" onClick={() => handlePageChange(p)} className={`h-8 min-w-[32px] px-2.5 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${p === pagination.currentPage ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-sky-700'}`}>
                      {p}
                    </button>
                  ))}
                  <button type="button" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => handlePageChange(pagination.currentPage + 1)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">›</button>
                  <button type="button" disabled={pagination.currentPage >= pagination.totalPages} onClick={() => handlePageChange(pagination.totalPages)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">»</button>
                </nav>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* [Fixed Bottom - Section 7: Compact Fixed Footer] */}
      <footer className="h-[56px] flex-shrink-0 z-50 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <img alt="쓸고닦고 푸터 로고" className="h-6 w-auto object-contain rounded" src="/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg" />
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="font-medium text-slate-700">운영사 (주)공간다원</span>
          <span className="hidden md:inline text-slate-400">· 사업자등록번호 120-88-29401</span>
          <span className="hidden lg:inline text-slate-400">· 대표번호 1588-7824 (평일 09:00~18:00)</span>
        </div>
      </footer>

      {toastMsg && (
        <div className="fixed bottom-16 right-6 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-sky-400">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
