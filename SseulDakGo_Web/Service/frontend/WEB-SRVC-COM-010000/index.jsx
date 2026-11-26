import React, { useState, useEffect, useCallback } from 'react';

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  const dd = String(lastDay).padStart(2, '0');
  return {
    from: `${year}.${mm}.01`,
    to: `${year}.${mm}.${dd}`,
  };
}

function PaginationBar({ page, totalPages, onPageChange }) {
  const safeTotal = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page || 1), safeTotal);
  const startPage = Math.floor((safePage - 1) / 5) * 5 + 1;
  const endPage = Math.min(safeTotal, startPage + 4);
  const pages = [];
  for (let p = startPage; p <= endPage; p += 1) {
    pages.push(p);
  }

  const btnBase =
    'px-2.5 py-1.5 rounded-lg border border-slate-300 bg-surface-container-lowest text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer';

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-4 mt-auto border-t border-slate-200">
      <button type="button" onClick={() => onPageChange(1)} disabled={safePage <= 1} className={btnBase}>
        맨처음
      </button>
      <button type="button" onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1} className={btnBase}>
        이전페이지
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`min-w-[32px] px-2.5 py-1.5 rounded-lg border text-label-sm font-bold transition cursor-pointer ${
            p === safePage
              ? 'bg-primary text-on-primary border-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface border-slate-300 hover:bg-surface-container-low'
          }`}
        >
          {p}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(safePage + 1)} disabled={safePage >= safeTotal} className={btnBase}>
        다음페이지
      </button>
      <button type="button" onClick={() => onPageChange(safeTotal)} disabled={safePage >= safeTotal} className={btnBase}>
        마지막페이지
      </button>
      <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant font-medium">
        전체 {safeTotal}페이지
      </span>
    </div>
  );
}

/**
 * 화면 ID: WEB-SRVC-COM-010000
 * 화면명: 시공사 파트너 메인 대시보드
 */
export default function WebSrvcCom010000({ userInfo }) {
  const partnerName = userInfo?.USER_NM || '클린마스터 김태호';
  const defaultRange = getCurrentMonthRange();

  const [activeTab, setActiveTab] = useState('waiting-bid');
  const [tabPage, setTabPage] = useState(1);
  const [tabCounts, setTabCounts] = useState({ waitingBid: 0, waitingPayment: 0, waitingCleaning: 0 });
  const [tabItems, setTabItems] = useState([]);
  const [tabTotalPages, setTabTotalPages] = useState(1);

  const [cleaningType, setCleaningType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [actPage, setActPage] = useState(1);
  const [activityItems, setActivityItems] = useState([]);
  const [actTotalPages, setActTotalPages] = useState(1);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const fetchDashboardData = useCallback(
    async ({ tabVal, tPage, aPage, cType, dFrom, dTo }) => {
      try {
        const params = new URLSearchParams({
          userNo: String(userInfo?.USER_NO || userInfo?.userNo || ''),
          tab: tabVal,
          page: String(tPage),
          pageSize: '10',
          actPage: String(aPage),
          cleaningType: cType,
          dateFrom: dFrom,
          dateTo: dTo,
        });
        const res = await fetch(`/api/srvc/com/010000?${params.toString()}`);
        const data = await res.json();
        if (data?.success) {
          setTabCounts(data.tabCounts || { waitingBid: 0, waitingPayment: 0, waitingCleaning: 0 });
          setTabItems(data.tabData?.items || []);
          setTabTotalPages(data.tabData?.totalPages || 1);
          setActivityItems(data.activityData?.items || []);
          setActTotalPages(data.activityData?.totalPages || 1);
        }
      } catch (err) {
        console.error('[WEB-SRVC-COM-010000] 대시보드 데이터 조회 실패:', err);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboardData({
      tabVal: activeTab,
      tPage: tabPage,
      aPage: actPage,
      cType: cleaningType,
      dFrom: dateFrom,
      dTo: dateTo,
    });
  }, [activeTab, tabPage, actPage, fetchDashboardData]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setTabPage(1);
  };

  const handleSearchActivity = () => {
    const parseYmd = (val) => {
      const m = String(val || '').trim().match(/^(\d{4})[.\-](\d{2})[.\-](\d{2})$/);
      if (!m) return null;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const fromD = parseYmd(dateFrom);
    const toD = parseYmd(dateTo);
    if (!fromD || !toD) {
      showToast('조회기간은 YYYY.MM.DD 형식으로 입력해주세요.');
      return;
    }
    if (fromD > toD) {
      showToast('조회 시작일은 종료일보다 클 수 없습니다.');
      return;
    }
    const maxToD = new Date(fromD);
    maxToD.setFullYear(maxToD.getFullYear() + 1);
    if (toD > maxToD) {
      showToast('조회기간은 최대 1년까지만 입력 가능합니다.');
      return;
    }
    setActPage(1);
    fetchDashboardData({
      tabVal: activeTab,
      tPage: tabPage,
      aPage: 1,
      cType: cleaningType,
      dFrom: dateFrom,
      dTo: dateTo,
    });
    showToast('활동 내역을 조회했습니다.');
  };

  const handleResetActivity = () => {
    const freshRange = getCurrentMonthRange();
    setCleaningType('ALL');
    setDateFrom(freshRange.from);
    setDateTo(freshRange.to);
    setActPage(1);
    fetchDashboardData({
      tabVal: activeTab,
      tPage: tabPage,
      aPage: 1,
      cType: 'ALL',
      dFrom: freshRange.from,
      dTo: freshRange.to,
    });
  };

  return (
    <main className="w-full pt-[70px] bg-surface flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-xl">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">check_circle</span>
          <span className="font-body-md text-body-md font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-xl">
        {/* Section 2: Partner Welcome */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 w-full">
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-28 h-28 rounded-xl border border-slate-200 bg-surface-container-lowest p-3 shadow-sm flex flex-col items-center justify-center gap-1.5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
                  </div>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface truncate max-w-[90px]">(주)클린파트너스</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('[WEB-SRVC-COM-010100] 로고 이미지 변경 모달을 호출합니다.')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-300 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface text-label-sm font-semibold transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  <span>로고변경</span>
                </button>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">WEB-SRVC-COM-010000 · PARTNER DASHBOARD</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">실시간 운영 모드</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                  {partnerName} 파트너님, 환영합니다
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 lg:max-w-xl">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-primary">cleaning_services</span>청소 전문 분야
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-low border border-slate-200 text-on-surface font-label-sm text-label-sm font-medium">정기청소 (상가·계단·사무실)</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-low border border-slate-200 text-on-surface font-label-sm text-label-sm font-medium">입주·이사 청소</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-low border border-slate-200 text-on-surface font-label-sm text-label-sm font-medium">계절가전 분해케어 (에어컨·세탁기)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed/30 text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>보유 자격 및 인증
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest border border-slate-200 text-on-surface-variant font-label-sm text-label-sm">위생관리용역업 등록</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest border border-slate-200 text-on-surface-variant font-label-sm text-label-sm">방역소독전문가 1급</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest border border-slate-200 text-on-surface-variant font-label-sm text-label-sm">가전관리사 수료(한국청소위생협회)</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/20 text-secondary font-label-sm text-label-sm font-semibold">삼성·LG 가전케어 8년 경력</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-full font-label-md text-label-md text-tertiary">
                  <span className="material-symbols-outlined text-[17px] text-primary">location_on</span>
                  <span>활동 권역: 경기 고양시 덕양구 · 일산동구 · 서울 서대문구</span>
                  <span className="text-secondary font-semibold ml-1">(3/10개 구역 설정)</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('[WEB-SRVC-MYP-010100] 시공사 내정보 및 활동 권역 관리 화면을 호출합니다.')}
                  className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center cursor-pointer"
                >
                  권역 수정 <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 통합 시공·청약 공정 관리 */}
        <section
          className="bg-surface-container-lowest border-2 border-blue-500 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md"
          id="section-quote-process"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs border-b border-surface-container-high/60">
            <div className="flex items-center gap-space-xs">
              <div className="w-2.5 h-6 bg-primary rounded-full" />
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">통합 시공·청약 공정 관리</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">청약 접수부터 데이터 이용료 결제, 현장 시공 사진 등록까지 실시간 진행 단계를 관리합니다.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap" role="tablist">
              {[
                { id: 'waiting-bid', icon: 'assignment_late', label: '청약대기', count: tabCounts.waitingBid },
                { id: 'waiting-payment', icon: 'credit_card', label: '결제대기', count: tabCounts.waitingPayment },
                { id: 'waiting-cleaning', icon: 'cleaning_services', label: '청소완료대기', count: tabCounts.waitingCleaning },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-title-md text-title-md font-bold shadow-sm transition-all duration-200 cursor-pointer ${
                      isActive ? 'bg-[#eab308] text-slate-900 ring-2 ring-[#ca8a04]/40' : 'bg-[#003d9b] hover:bg-[#0052cc] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[12px] font-black ${isActive ? 'bg-black/10' : 'bg-white/20'}`}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-lg flex items-center justify-between text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">
                {activeTab === 'waiting-payment' ? 'payments' : activeTab === 'waiting-cleaning' ? 'task_alt' : 'info'}
              </span>
              <span>
                {activeTab === 'waiting-payment'
                  ? '고객이 1차 데이터 이용료를 납부 완료한 건입니다. 시공사 2차 구간이용료를 결제하면 최종 배정 및 계약이 확정됩니다.'
                  : activeTab === 'waiting-cleaning'
                    ? '계약이 최종 체결되어 현장 시공이 진행 중인 목록입니다. 시공 완료 후 [청소 사진 등록]을 완료해야 고객 검수 및 정산이 진행됩니다.'
                    : '이용자가 신규 등록했거나, 시공사 취소/이용자 변경 요청으로 재오픈되어 즉시 단독 청약이 가능한 목록입니다.'}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold hidden sm:inline-block">
              {activeTab === 'waiting-payment'
                ? '결제 기한 내 미납 시 자동 취소'
                : activeTab === 'waiting-cleaning'
                  ? '현장 직불 100% 보장'
                  : '선착순 1개사 즉시 매칭'}
            </span>
          </div>

          <div className="min-h-[780px] flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              {tabItems.length === 0 ? (
                <div className="py-16 text-center text-body-md text-on-surface-variant">조회된 목록이 없습니다.</div>
              ) : (
                tabItems.map((item, idx) => (
                  <div
                    key={item.orderNo || idx}
                    className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-space-md">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <span className="font-label-sm text-label-sm bg-surface-container-lowest text-primary font-bold px-2 py-0.5 rounded">{item.badge}</span>
                          <span className="font-title-md text-title-md font-bold text-on-surface">{item.title}</span>
                          {item.tag && (
                            <span className="font-label-sm text-label-sm bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{item.tag}</span>
                          )}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0">
                      <div className="flex flex-col md:items-end">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {activeTab === 'waiting-payment'
                            ? '시공사 구간이용료 (2차)'
                            : activeTab === 'waiting-cleaning'
                              ? '현장 직불 수령 예정액'
                              : '고객 확정 지정가'}
                        </span>
                        <span className="font-title-md text-title-md font-black text-primary">
                          {activeTab === 'waiting-payment' ? item.fee : item.price}
                        </span>
                      </div>
                      {activeTab === 'waiting-bid' && (
                        <button
                          type="button"
                          onClick={() => {
                            const bizNo = userInfo?.BIZ_REG_NO || userInfo?.bizRegNo;
                            const bizStat = userInfo?.BIZ_STAT_CD || userInfo?.bizStatCd || 'ACTIVE';
                            if (!bizNo || ['CLOSED', 'SUSPENDED', '폐업', '휴업'].includes(bizStat)) {
                              showToast('사업자등록 정보가 미등록되었거나 휴·폐업 상태이므로 청약할 수 없습니다.');
                              return;
                            }
                            showToast('[WEB-SRVC-QOT-010100] 확정가 청소용역 단독 청약 신청 모달을 호출합니다.');
                          }}
                          className="bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          단독 청약하기
                        </button>
                      )}
                      {activeTab === 'waiting-payment' && (
                        <button
                          type="button"
                          onClick={() => showToast('[WEB-SRVC-PAY-010000] 시공사 2차 구간 데이터 이용료 결제 화면을 호출합니다.')}
                          className="bg-secondary hover:opacity-90 text-on-secondary font-title-md text-title-md font-bold px-space-md py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">credit_card</span>
                          {item.btn}
                        </button>
                      )}
                      {activeTab === 'waiting-cleaning' && (
                        <button
                          type="button"
                          onClick={() => showToast('[WEB-SRVC-JOB-020100] 현장 시공 사진 첨부 모달을 호출합니다.')}
                          className="bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                          청소 사진 등록
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <PaginationBar page={tabPage} totalPages={tabTotalPages} onPageChange={(p) => setTabPage(p)} />
          </div>
        </section>

        {/* Section 5: 내 활동 내역 */}
        <section
          className="bg-surface-container-lowest border-2 border-pink-500 rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md"
          id="section-activity-history"
        >
          <div className="flex items-center gap-space-xs">
            <div className="w-2.5 h-6 bg-primary rounded-full" />
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">내 활동 내역</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">조회 기간내 나의 활동 내역을 조회</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 flex-wrap flex-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-title-md text-title-md font-bold text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_today</span>
                  <span>조회기간</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-32 sm:w-36 px-3 py-2 text-center text-body-sm font-medium text-on-surface bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <span className="text-on-surface-variant font-bold">~</span>
                  <input
                    type="text"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-32 sm:w-36 px-3 py-2 text-center text-body-sm font-medium text-on-surface bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-title-md text-title-md font-bold text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">filter_list</span>
                  <span>청소 유형</span>
                </div>
                <select
                  value={cleaningType}
                  onChange={(e) => setCleaningType(e.target.value)}
                  className="bg-surface-container-low border border-slate-200 rounded-lg px-space-md py-space-xs font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ALL">전체</option>
                  <option value="REGULAR">정기 청소</option>
                  <option value="MOVE_IN">입주 청소</option>
                  <option value="APPLIANCE">계절가전 청소</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetActivity}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>초기화</span>
              </button>
              <button
                type="button"
                onClick={handleSearchActivity}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold shadow-sm transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span>조회</span>
              </button>
            </div>
          </div>

          <div className="min-h-[780px] flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              {activityItems.length === 0 ? (
                <div className="py-16 text-center text-body-md text-on-surface-variant">조회된 활동 내역이 없습니다.</div>
              ) : (
                activityItems.map((act) => (
                  <div
                    key={act.id}
                    className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-space-md">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                        <span className="material-symbols-outlined text-[22px]">{act.icon}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <span className={`font-label-sm text-label-sm bg-surface-container-lowest font-bold px-2 py-0.5 rounded ${act.badgeCls}`}>{act.badge}</span>
                          <span className="font-title-md text-title-md font-bold text-on-surface">{act.title}</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{act.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0">
                      <div className="flex flex-col md:items-end">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{act.priceLabel}</span>
                        <span className="font-title-md text-title-md font-black text-primary">{act.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('[WEB-SRVC-COM-010200] 내 활동 내역 상세 조회 모달을 호출합니다.')}
                        className="bg-surface-container-lowest hover:bg-surface-container border border-slate-300 text-on-surface font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        상세 조회
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <PaginationBar page={actPage} totalPages={actTotalPages} onPageChange={(p) => setActPage(p)} />
          </div>
        </section>

        {/* Section 6: Partner Operating Rules & Platform Trust Strip */}
        <section className="bg-secondary-fixed/30 rounded-xl p-space-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">shield_with_heart</span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-title-md text-title-md font-extrabold text-on-secondary-fixed">쓸고딱고 파트너 상생 및 정가 보장 3원칙</h4>
              <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">불필요한 가격 깎기 경쟁 없이 시공 퀄리티와 고객 만족에만 집중하는 플랫폼 환경을 지원합니다.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full md:w-auto">
            <div className="bg-surface-container-lowest/90 rounded-lg p-space-sm flex flex-col gap-0.5">
              <div className="font-label-md text-label-md font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">price_check</span>역경매 ZERO
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">고객 확정 지정가 100% 보장</span>
            </div>
            <div className="bg-surface-container-lowest/90 rounded-lg p-space-sm flex flex-col gap-0.5">
              <div className="font-label-md text-label-md font-bold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>선착순 1개사 청약
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">중복 투찰 스트레스 없는 매칭</span>
            </div>
            <div className="bg-surface-container-lowest/90 rounded-lg p-space-sm flex flex-col gap-0.5">
              <div className="font-label-md text-label-md font-bold text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">payments</span>100% 현장 직불
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">검수 완료 후 고객 즉시 정산</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
