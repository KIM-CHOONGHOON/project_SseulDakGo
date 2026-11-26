import React, { useState } from 'react';

const SAMPLE_ORDERS = [
  { id: 'ORD-202611-0082', type: '입주·이사 청소', badgeBg: 'bg-sky-600', status: '단독 청약 접수 완료', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '경기 고양시 덕양구 화정동 · 32평형 (방3/화2)', date: '희망일: 2026.11.20 (금) 오전', price: '380,000원', priceNote: '(작업 완료 후 현장 직불 100%)', rightTop: '선착순 1:1 청약 도착', rightSub: '(주)클린파워 시공마스터', btnText: '청약 시공사 확인·선택', btnSub: '(WEB-CLNT-ORD-010100)', btnCls: 'bg-[#0284C7] hover:bg-[#0369A1] text-white', action: 'WEB-CLNT-ORD-010100' },
  { id: 'ORD-202611-0079', type: '계절가전 분해케어', badgeBg: 'bg-[#14B8A6]', status: '1차 이용료 결제대기', statusCls: 'text-teal-800 bg-teal-100 border-teal-300', addr: '경기 고양시 일산동구 마두동 · 시스템에어컨 2대 분해살균', date: '희망일: 2026.11.23 (월) 14:00', price: '180,000원', priceNote: '(시공사: 한결홈케어 매칭 확정 대기)', rightTop: '고정 이용료: 16,500원', rightSub: '토스페이먼츠 간편결제', btnText: '데이터 이용료 16,500원 결제', btnSub: '(WEB-CLNT-PAY-010000)', btnCls: 'bg-[#14B8A6] hover:bg-teal-700 text-white', action: 'WEB-CLNT-PAY-010000' },
  { id: 'ORD-202611-0065', type: '정기청소 (3개월 계약)', badgeBg: 'bg-slate-700', status: '시공 사진 검수요청', statusCls: 'text-amber-700 bg-amber-100 border-amber-300', addr: '서울 서대문구 창천동 · 빌라 계단·주차장 1회차 완료', date: '현장 전·후 검수사진 8장 등록 완료', price: '270,000원', priceNote: '검수 승인 후 100% 현장 직불', rightTop: '시공 기사: 박준영 마스터', rightSub: '0507 안심번호 연결 상태', btnText: '전·후 사진 검수 및 완료 확정', btnSub: '(WEB-CLNT-JOB-010000)', btnCls: 'bg-slate-900 hover:bg-slate-800 text-white', action: 'WEB-CLNT-JOB-010000' },
  { id: 'ORD-202611-0058', type: '입주·이사 청소', badgeBg: 'bg-sky-600', status: '청소 청약 접수중', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '경기 파주시 운정동 · 아파트 25평형 (방3/화1)', date: '희망일: 2026.11.27 (금) 09:00', price: '310,000원', priceNote: '(단독 선착순 청약 진행 중)', rightTop: '시공사 열람 중', rightSub: '평균 청약 소요: 18분', btnText: '발주 상세 조회', btnSub: '', btnCls: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
  { id: 'ORD-202611-0052', type: '계절가전 분해케어', badgeBg: 'bg-[#14B8A6]', status: '청소 청약 접수중', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '인천 연수구 송도동 · 드럼세탁기 18kg 분해살균', date: '희망일: 2026.11.28 (토) 10:00', price: '130,000원', priceNote: '(1:1 단독 매칭 대기)', rightTop: '시공사 접수중', rightSub: '검증 마스터 매칭 대기', btnText: '발주 상세 조회', btnSub: '', btnCls: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
  { id: 'ORD-202611-0047', type: '정기청소 (6개월 계약)', badgeBg: 'bg-slate-700', status: '시공 확정/진행중', statusCls: 'text-teal-800 bg-teal-100 border-teal-300', addr: '서울 강남구 역삼동 · 소형 오피스 35평 2회차', date: '시공일시: 2026.11.24 (화) 19:00', price: '350,000원', priceNote: '(작업 완료 후 직불 결제)', rightTop: '담당: 강남클린케어', rightSub: '0507-1330-8841', btnText: '진행상황 확인', btnSub: '', btnCls: 'bg-teal-600 hover:bg-teal-700 text-white', action: 'WEB-CLNT-JOB-010000' },
  { id: 'ORD-202611-0041', type: '입주·이사 청소', badgeBg: 'bg-sky-600', status: '청소 청약 접수중', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '경기 성남시 분당구 정자동 · 오피스텔 18평형', date: '희망일: 2026.11.26 (목) 13:00', price: '240,000원', priceNote: '(단독 선착순 청약 진행 중)', rightTop: '시공사 열람 중', rightSub: '단독 청약 도착 시 즉시 알림', btnText: '발주 상세 조회', btnSub: '', btnCls: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
  { id: 'ORD-202611-0036', type: '입주·이사 청소', badgeBg: 'bg-sky-600', status: '시공 완료 및 정산완료', statusCls: 'text-emerald-600 bg-emerald-50 border-emerald-200/60', addr: '서울 은평구 불광동 · 신축빌라 20평형 입주청소', date: '완료일: 2026.11.18 (수)', price: '260,000원', priceNote: '직불 정상 영수증 발급완료', rightTop: '검수 완료 만족도 ★★★★★', rightSub: '클린스타트 시공팀', btnText: '완료 증빙서류', btnSub: '', btnCls: 'bg-slate-100 hover:bg-slate-200 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
  { id: 'ORD-202611-0029', type: '계절가전 분해케어', badgeBg: 'bg-[#14B8A6]', status: '청소 청약 접수중', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '경기 하남시 미사동 · 벽걸이 에어컨 2대 고압세척', date: '희망일: 2026.11.30 (월) 15:00', price: '160,000원', priceNote: '(단독 매칭 접수 대기)', rightTop: '시공사 열람 중', rightSub: '단독 1:1 청약 접수중', btnText: '발주 상세 조회', btnSub: '', btnCls: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
  { id: 'ORD-202611-0015', type: '정기청소 (3개월 계약)', badgeBg: 'bg-slate-700', status: '청소 청약 접수중', statusCls: 'text-sky-800 bg-sky-100 border-sky-300', addr: '서울 마포구 공덕동 · 빌라 4개 층 복도·계단 정기청소', date: '계약 희망일: 2026.12.01 (화)', price: '250,000원', priceNote: '(단독 선착순 시공사 배정 대기)', rightTop: '시공사 열람 중', rightSub: '평균 소요 25분 내 매칭', btnText: '발주 상세 조회', btnSub: '', btnCls: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700', action: 'WEB-CLNT-ORD-010000' },
];

/**
 * 화면 ID: WEB-CLNT-COM-010200
 * 화면명: 고객 홈 페이지 (Client Main Dashboard)
 */
export default function WebClntCom010200({ userInfo, onOpenReqModal, onNavigate }) {
  const userName = userInfo?.USER_NM || '고객';
  const [dateFrom, setDateFrom] = useState('2025.11.20');
  const [dateTo, setDateTo] = useState('2026.11.20');
  const [orderStatus, setOrderStatus] = useState('REQ_APPLY');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const setPeriodRange = (days) => {
    const toDate = new Date(2026, 10, 20);
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    setDateFrom(fmt(fromDate));
    setDateTo(fmt(toDate));
  };

  const resetFilter = () => {
    setDateFrom('2025.11.20');
    setDateTo('2026.11.20');
    setOrderStatus('REQ_APPLY');
    setCurrentPage(1);
  };

  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, 28);

  return (
    <main className="w-full pt-[72px] bg-slate-50 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col gap-4">
        {/* Section 2: Client Welcome & Primary Action Banner */}
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
              {userName} 고객님, 환영합니다!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              고객님이 <span className="font-bold text-sky-700 underline decoration-sky-300 underline-offset-4">직접 정한 요금 그대로!</span> 흥정·역경매 없는 1:1 단독 선착순 매칭으로 정기청소·입주이사청소·계절가전 분해케어를 간편하게 발주하고 실시간 진행 현황을 확인하세요.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0 flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => onOpenReqModal?.()}
              className="w-full lg:w-auto px-7 py-4 rounded-xl font-bold text-base text-white bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">post_add</span>
              <span>확정 지정가로 청소 발주하기</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Section 3: 3-Column Client Order Status Summary Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">STEP 01</span>
              <span className="p-2 bg-sky-50 text-sky-600 rounded-xl"><span className="material-symbols-outlined text-[22px]">how_to_reg</span></span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-700">청약 대기 / 선택 필요</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#0284C7] tracking-tight">1</span>
              <span className="text-base font-bold text-slate-600">건</span>
              <span className="ml-auto text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">검토 권장</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-sky-500">info</span>
              시공사 단독 청약 도착 시 즉시 확인 가능
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">STEP 02</span>
              <span className="p-2 bg-teal-50 text-teal-600 rounded-xl"><span className="material-symbols-outlined text-[22px]">credit_card</span></span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-700">결제 대기 / 계약 확정</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#14B8A6] tracking-tight">1</span>
              <span className="text-base font-bold text-slate-600">건</span>
              <span className="ml-auto text-[11px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full">토스페이먼츠</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-teal-500">verified</span>
              데이터 이용료 <strong className="text-slate-700">16,500원 고정 결제</strong> (용역비 별도)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">STEP 03</span>
              <span className="p-2 bg-slate-100 text-slate-700 rounded-xl"><span className="material-symbols-outlined text-[22px]">checklist_rtl</span></span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-700">시공 진행 / 사진 검수</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#0F172A] tracking-tight">0</span>
              <span className="text-base font-bold text-slate-600">건</span>
              <span className="ml-auto text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">직불 정산</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-slate-600">photo_library</span>
              전·후 사진 최종 검수 후 <strong className="text-slate-700">100% 현장 직불</strong>
            </p>
          </div>
        </section>

        {/* Section 4: My Active Cleaning Orders & Matching Pipeline */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg"><span className="material-symbols-outlined text-[20px]">sync_alt</span></span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">내 진행 중인 청소 발주 현황</h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">총 28건 (페이지 {currentPage}/{totalPages})</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('WEB-CLNT-ORD-010000')}
              className="text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              전체 발주 목록 보기
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
                    {[
                      { days: 30, label: '최근 1개월' },
                      { days: 90, label: '3개월' },
                      { days: 180, label: '6개월' },
                      { days: 365, label: '1년' },
                    ].map((p) => (
                      <button key={p.days} type="button" onClick={() => setPeriodRange(p.days)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-sky-700 transition-colors cursor-pointer">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">filter_list</span>
                  진행상태
                </label>
                <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer">
                  <option value="ALL">전체 (ALL)</option>
                  <option value="REQ_APPLY">청소 청약 (REQ_APPLY)</option>
                  <option value="APPLY_CMPL">단독 청약 접수 완료 (APPLY_CMPL)</option>
                  <option value="PAY_WAIT">1차 이용료 결제대기 (PAY_WAIT)</option>
                  <option value="JOB_ING">시공 확정/진행중 (JOB_ING)</option>
                  <option value="JOB_INSPECT">시공 사진 검수/승인대기 (JOB_INSPECT)</option>
                  <option value="JOB_CMPL">시공 완료 (JOB_CMPL)</option>
                  <option value="ORDER_CANCEL">발주 취소 (ORDER_CANCEL)</option>
                </select>
              </div>

              <div className="lg:col-span-2 flex items-center gap-2">
                <button type="button" onClick={resetFilter} className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  초기화
                </button>
                <button type="button" onClick={() => setCurrentPage(1)} className="flex-1 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  조회
                </button>
              </div>
            </div>
          </div>

          {/* Orders Pipeline List */}
          <div className="flex flex-col gap-3.5">
            {SAMPLE_ORDERS.map((ord) => (
              <div key={ord.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-sky-50/40 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white ${ord.badgeBg}`}>{ord.type}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${ord.statusCls}`}>{ord.status}</span>
                    <span className="text-xs text-slate-400 font-mono">발주번호: {ord.id}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-slate-800">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>{ord.addr}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="flex items-center gap-1 text-slate-600"><span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>{ord.date}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-slate-500">고객 확정 지정가:</span>
                    <span className="text-base font-extrabold text-[#0284C7]">{ord.price}</span>
                    <span className="text-slate-400 text-[11px]">{ord.priceNote}</span>
                  </div>
                </div>
                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="text-right sm:mr-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">{ord.rightTop}</span>
                    <div className="text-[11px] text-slate-400">{ord.rightSub}</div>
                  </div>
                  <button type="button" onClick={() => onNavigate?.(ord.action)} className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${ord.btnCls}`}>
                    <span>{ord.btnText}</span>
                    {ord.btnSub && <span className="text-[10px] opacity-80 font-mono">{ord.btnSub}</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 select-none">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px] text-slate-400">format_list_bulleted</span>
              <span>전체 <strong className="text-slate-800 font-bold">28</strong>건 중 <strong className="text-sky-700 font-bold">{startItem}-{endItem}</strong>건 표시</span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400">페이지당 10건</span>
            </div>
            <nav aria-label="청소 발주 목록 페이지 이동" className="inline-flex items-center gap-1 rounded-xl bg-slate-50/80 p-1 border border-slate-200/80 shadow-sm">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">&lt;&lt;</button>
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">&lt;</button>
              <div className="inline-flex items-center gap-1 px-1">
                {[1, 2, 3].map((p) => (
                  <button key={p} type="button" onClick={() => setCurrentPage(p)} className={`h-8 min-w-[32px] px-2.5 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === p ? 'shadow-sm bg-[#0284C7] text-white' : 'text-slate-600 hover:bg-white hover:text-sky-700'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">&gt;</button>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 font-mono text-xs font-bold cursor-pointer">&gt;&gt;</button>
            </nav>
          </div>
        </section>

        {/* Section 5: Quick Category Direct Order Cards */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 tracking-wider">DIRECT ORDER CATEGORIES</span>
              <h2 className="text-lg font-bold text-slate-900">원하는 청소 서비스를 선택해 직접 요금을 정하고 발주하세요</h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">※ 역경매·덤핑·추가요금 없는 100% 고객 지정가 등록</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'REGULAR', cat: 'CATEGORY 01', title: '정기청소 (계단·건물관리)', badge: '최소 3개월(90일) 의무 계약', desc: '빌라·상가 계단, 건물주위, 지하주차장 구역별 맞춤 정기 관리. 안정적 관리를 위한 3개월 지정가 직접 입력.', price: '240,000 ~ 300,000원', btn: '정기청소 발주하기', img: '/storage/sseuldakgo/page_main/20261126_v0.01/regular_cleaning_service.jpg' },
              { key: 'APPLIANCE', cat: 'CATEGORY 02', title: '계절가전 분해케어', badge: '완전 분해 고압 살균 세척', desc: '벽걸이·스탠드·시스템 에어컨, 세탁기, 냉장고 완전 분해 고압 살균 세척. 품목 및 수량별 희망 요금 직접 지정.', price: '90,000 ~ 190,000원', btn: '가전 분해케어 발주하기', img: '/storage/sseuldakgo/page_main/20261126_v0.01/appliances_care_service.jpg' },
              { key: 'MOVEIN', cat: 'CATEGORY 03', title: '입주·이사 청소', badge: '친환경 약품 & 스팀 살균', desc: '아파트, 오피스텔, 빌라, 상가 입주·이사 전후 구석구석 정밀 스팀 대청소. 건별 희망 요금을 직접 지정 발주.', price: '300,000 ~ 450,000원', btn: '입주·이사 청소 발주하기', img: '/storage/sseuldakgo/page_main/20261126_v0.01/move_in_cleaning_service.jpg' },
            ].map((c) => (
              <div key={c.key} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col hover:border-sky-300 hover:shadow-md transition-all">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-sky-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">{c.badge}</span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs text-sky-200 font-semibold">{c.cat}</span>
                    <h3 className="text-base font-bold">{c.title}</h3>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">평균 고객 등록 지정가</span>
                    <span className="font-bold text-slate-800">{c.price}</span>
                  </div>
                  <button type="button" onClick={() => onOpenReqModal?.(c.key)} className="w-full py-3 rounded-xl font-bold text-sm bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>{c.btn}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Platform Policy & Safe Transaction Reminder Strip */}
        <section className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-sky-600 text-white rounded-xl flex-shrink-0"><span className="material-symbols-outlined text-[20px]">verified_user</span></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% 고객 직접 확정 지정가</h4>
              <p className="text-xs text-slate-600 mt-0.5">시공사의 일방적 역경매나 덤핑, 현장 부당 추가요금을 원천 차단합니다.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-sky-200" />
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-teal-600 text-white rounded-xl flex-shrink-0"><span className="material-symbols-outlined text-[20px]">handshake</span></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">1개 시공사 단독 선착순 청약</h4>
              <p className="text-xs text-slate-600 mt-0.5">본사 사업자등록증 및 자격 검증을 통과한 파트너가 1:1 책임 청약합니다.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-sky-200" />
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-slate-800 text-white rounded-xl flex-shrink-0"><span className="material-symbols-outlined text-[20px]">fact_check</span></div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">0507 안심번호 &amp; 전·후 사진 검수</h4>
              <p className="text-xs text-slate-600 mt-0.5">시공 사진을 직접 최종 승인한 후, 용역 대금 100%를 현장에서 직불합니다.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
