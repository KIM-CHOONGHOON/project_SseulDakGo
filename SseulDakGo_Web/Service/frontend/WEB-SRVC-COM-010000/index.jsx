import React, { useState } from 'react';

const ACTIVITY_ORDERS = [
  { id: 'ACT-01', type: 'REGULAR', badge: '정기청소 3개월', badgeCls: 'text-tertiary', icon: 'repeat', iconBg: 'bg-surface-container-high text-tertiary', title: '서울 은평구 응암동 근린생활시설', desc: '5층 상가 계단, 복도 및 1층 필로티 주차장 (주 1회 정기관리) | 기간: 2026-12-01 ~ 2027-02-28 (90일 계약)', priceLabel: '고객 확정 지정가 (월)', price: '300,000원' },
  { id: 'ACT-02', type: 'MOVE_IN', badge: '입주·이사 청소', badgeCls: 'text-secondary', icon: 'cleaning_services', iconBg: 'bg-secondary-fixed text-secondary', title: '경기 고양시 일산서구 주엽동 강선마을', desc: '아파트 34평형 확장형 전체 분해 청소, 베란다 곰팡이 제거 요청 | 희망 시공일: 2026-12-02 (전일 협의 가능)', priceLabel: '고객 확정 지정가', price: '400,000원' },
  { id: 'ACT-03', type: 'APPLIANCE', badge: '계절가전 분해케어', badgeCls: 'text-primary', icon: 'wash', iconBg: 'bg-primary-fixed text-primary', title: '경기 고양시 덕양구 행신동 햇빛마을', desc: '드럼세탁기 1대 + 스탠드 에어컨 1대 종합 살균 분해케어 요청 | 희망 시공일: 2026-11-29 (오후 선호)', priceLabel: '고객 확정 지정가', price: '170,000원' },
];

/**
 * 화면 ID: WEB-SRVC-COM-010000
 * 화면명: 시공사 파트너 메인 대시보드
 */
export default function WebSrvcCom010000({ userInfo, onNavigate }) {
  const partnerName = userInfo?.USER_NM || '클린마스터 김태호';
  const [activeTab, setActiveTab] = useState('waiting-bid');
  const [cleaningType, setCleaningType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('2025.11.20');
  const [dateTo, setDateTo] = useState('2026.11.20');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const filteredActivities = cleaningType === 'ALL'
    ? ACTIVITY_ORDERS
    : ACTIVITY_ORDERS.filter((o) => o.type === cleaningType);

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
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-10 w-full">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-28 h-28 rounded-xl border border-slate-200 bg-surface-container-lowest p-3 shadow-sm flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-on-surface truncate max-w-[90px]">(주)클린파트너스</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('로고 이미지를 선택해 주세요.')}
                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-300 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface text-label-sm font-semibold transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                <span>로고변경</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-xs max-w-2xl">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">WEB-SRVC-COM-010000 · PARTNER DASHBOARD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">실시간 운영 모드</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                {partnerName} 파트너님, 환영합니다
              </h1>
              <div className="flex flex-col gap-2 mt-1">
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
              </div>
              <div className="flex flex-wrap items-center gap-space-sm mt-space-2xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-full font-label-md text-label-md text-tertiary">
                  <span className="material-symbols-outlined text-[17px] text-primary">location_on</span>
                  <span>활동 권역: 경기 고양시 덕양구 · 일산동구 · 서울 서대문구</span>
                  <span className="text-secondary font-semibold ml-1">(3/10개 구역 설정)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('WEB-SRVC-MYP-020100') : showToast('지역 설정 관리 페이지(WEB-SRVC-MYP-020100)로 이동합니다.')}
                  className="font-label-sm text-label-sm text-primary hover:underline font-semibold flex items-center cursor-pointer"
                >
                  권역 수정 <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 3-Column Partner Status & Trust Summary Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">금일 예정 시공</span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-metric-num-lg text-metric-num-lg text-primary font-black tracking-tight">2</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">건</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[26px]">assignment_turned_in</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant">
              <span className="font-body-sm text-body-sm text-tertiary">현장 5단계 시공 관리 프로세스</span>
              <span className="font-label-sm text-label-sm text-primary font-bold flex items-center">관리 <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">진행 중 청약 / 2차 결제대기</span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-metric-num-lg text-metric-num-lg text-secondary font-black tracking-tight">1</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">건</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[26px]">handshake</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant">
              <span className="font-body-sm text-body-sm text-tertiary">단독 청약 접수 및 2차 구간이용료 확인</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold flex items-center">결제확인 <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">보유 인증 뱃지 · 직불 수령</span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-metric-num-sm text-metric-num-sm text-on-surface font-extrabold tracking-tight">인증 파트너</span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">LV.1 마스터</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-sm flex flex-wrap items-center gap-space-xs">
              <span className="inline-flex items-center gap-1 bg-secondary-fixed/50 text-on-secondary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                <span className="material-symbols-outlined text-[13px]">badge</span> 사업자 인증완료
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-tertiary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                <span className="material-symbols-outlined text-[13px]">military_tech</span> 전문자격 보유
              </span>
            </div>
          </div>
        </section>

        {/* Section 4: 통합 시공·청약 공정 관리 */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" id="section-quote-process">
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
                { id: 'waiting-bid', icon: 'assignment_late', label: '청약대기', count: 3 },
                { id: 'waiting-payment', icon: 'credit_card', label: '결제대기', count: 2 },
                { id: 'waiting-cleaning', icon: 'cleaning_services', label: '청소완료대기', count: 2 },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
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

          {activeTab === 'waiting-bid' && (
            <div className="flex flex-col gap-space-sm">
              <div className="bg-surface-container-low px-space-md py-2 rounded-lg flex items-center justify-between text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                  <span>이용자가 신규 등록했거나, 시공사 취소/이용자 변경 요청으로 재오픈되어 즉시 단독 청약이 가능한 목록입니다.</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold hidden sm:inline-block">선착순 1개사 즉시 매칭</span>
              </div>
              {[
                { badge: '계절가전 분해케어', title: '경기 고양시 덕양구 화정동 백양마을', tag: '신규 등록', desc: '시스템에어컨 2대 분해세척 | 희망 시공일: 2026-11-28 (오후) | 사유: 이용자 신규 등록 오더 (청약 가능)', price: '180,000원', icon: 'mode_fan' },
                { badge: '입주·이사 청소', title: '서울 은평구 응암동 신축빌라', tag: '시공사 취소 재오픈', desc: '28평형 신축빌라 입주청소 전체 | 희망 시공일: 2026-12-01 (오전) | 상태: 이전 시공사 청약 취소로 긴급 재오픈', price: '340,000원', icon: 'apartment' },
                { badge: '정기청소 3개월', title: '경기 고양시 일산동구 마두동', tag: '시공자 재배정 요청', desc: '4층 빌라 계단 관리 정기청소 | 계약 기간: 2026-12-01 ~ 2027-02-28 | 상태: 이용자의 시공자 재배정 요청 건', price: '270,000원', icon: 'repeat' },
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors">
                  <div className="flex items-start md:items-center gap-space-md">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-label-sm text-label-sm bg-surface-container-lowest text-primary font-bold px-2 py-0.5 rounded">{item.badge}</span>
                        <span className="font-title-md text-title-md font-bold text-on-surface">{item.title}</span>
                        <span className="font-label-sm text-label-sm bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{item.tag}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0">
                    <div className="flex flex-col md:items-end">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">고객 확정 지정가</span>
                      <span className="font-title-md text-title-md font-black text-primary">{item.price}</span>
                    </div>
                    <button type="button" onClick={() => showToast(`${item.title} 단독 청약 신청서로 이동합니다.`)} className="bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition cursor-pointer">
                      단독 청약하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'waiting-payment' && (
            <div className="flex flex-col gap-space-sm">
              <div className="bg-surface-container-low px-space-md py-2 rounded-lg flex items-center justify-between text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
                  <span>고객이 1차 데이터 이용료를 납부 완료한 건입니다. 시공사 2차 구간이용료를 결제하면 최종 배정 및 계약이 확정됩니다.</span>
                </div>
                <span className="font-label-sm text-label-sm text-error font-bold hidden sm:flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">alarm</span> 결제 기한 내 미납 시 자동 취소</span>
              </div>
              {[
                { badge: '정기청소 (3개월 계약)', title: '경기 고양시 일산동구 마두동 · 4층 빌라 계단', desc: '고객 1차 결제 완료 (2026-11-20) | 고객 확정 용역비: 270,000원 (현장 직불 100%)', fee: '16,500원', btn: '2차 데이터 이용료 결제 (계약 확정)' },
                { badge: '계절가전 분해케어', title: '서울 서대문구 창천동 신촌르메이에르', desc: '시스템에어컨 2대 분해세척 | 고객 확정 용역비: 180,000원 (현장 직불)', fee: '16,500원', btn: '2차 데이터 이용료 결제' },
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm bg-surface-container-lowest text-secondary font-bold px-2 py-0.5 rounded">{item.badge}</span>
                      <span className="font-title-md text-title-md font-bold text-on-surface">{item.title}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0">
                    <div className="flex flex-col md:items-end">
                      <span className="font-label-sm text-label-sm text-secondary font-bold">시공사 구간이용료 (2차)</span>
                      <span className="font-title-md text-title-md font-black text-secondary">{item.fee}</span>
                    </div>
                    <button type="button" onClick={() => showToast('2차 데이터 이용료 결제 및 계약 확정 페이지로 이동합니다.')} className="bg-secondary hover:opacity-90 text-on-secondary font-title-md text-title-md font-bold px-space-md py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">credit_card</span>
                      {item.btn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'waiting-cleaning' && (
            <div className="flex flex-col gap-space-sm">
              <div className="bg-surface-container-low px-space-md py-2 rounded-lg flex items-center justify-between text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">task_alt</span>
                  <span>계약이 최종 체결되어 현장 시공이 진행 중인 목록입니다. 시공 완료 후 [청소 사진 등록]을 완료해야 고객 검수 및 정산이 진행됩니다.</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold hidden sm:inline-block">현장 직불 100% 보장</span>
              </div>
              {[
                { badge: '입주·이사 청소', title: '경기 고양시 덕양구 화정동 백양마을 (32평형)', desc: '고객: 김*훈 고객님 (0504-****-1982 안심번호) | 시공 시간: 10:00 시작 (진행률 60%)', price: '380,000원' },
                { badge: '계절가전 분해케어', title: '서울 서대문구 연희동 단독주택 · 스탠드+벽걸이 2in1', desc: '고객: 이*영 고객님 (0504-****-8321 안심번호) | 예약 시간: 14:30 예정', price: '190,000원' },
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm bg-primary text-on-primary font-bold px-2 py-0.5 rounded">{item.badge}</span>
                      <span className="font-title-md text-title-md font-bold text-on-surface">{item.title}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-space-lg shrink-0">
                    <div className="flex flex-col md:items-end">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">현장 직불 수령 예정액</span>
                      <span className="font-title-md text-title-md font-black text-primary">{item.price}</span>
                    </div>
                    <button type="button" onClick={() => showToast('현장 청소 사진 등록 모달을 호출합니다.')} className="bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                      청소 사진 등록
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: 내 활동 내역 */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" id="section-activity-history">
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
                  <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_today</span><span>조회기간</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-32 sm:w-36 px-3 py-2 text-center text-body-sm font-medium text-on-surface bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:border-primary" />
                  <span className="text-on-surface-variant font-bold">~</span>
                  <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-32 sm:w-36 px-3 py-2 text-center text-body-sm font-medium text-on-surface bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 font-title-md text-title-md font-bold text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">filter_list</span><span>청소 유형</span>
                </div>
                <select value={cleaningType} onChange={(e) => setCleaningType(e.target.value)} className="bg-surface-container-low border border-slate-200 rounded-lg px-space-md py-space-xs font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary cursor-pointer">
                  <option value="ALL">전체</option>
                  <option value="REGULAR">정기 청소</option>
                  <option value="MOVE_IN">입주 청소</option>
                  <option value="APPLIANCE">계절가전 청소</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => { setCleaningType('ALL'); setDateFrom('2025.11.20'); setDateTo('2026.11.20'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">restart_alt</span><span>초기화</span>
              </button>
              <button type="button" onClick={() => showToast('활동 내역을 조회했습니다.')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold shadow-sm transition cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">search</span><span>조회</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            {filteredActivities.map((act) => (
              <div key={act.id} className="bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors">
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
                  <button type="button" onClick={() => showToast('활동 내역 상세 조회 페이지로 이동합니다.')} className="bg-surface-container-lowest hover:bg-surface-container border border-slate-300 text-on-surface font-title-md text-title-md font-bold px-space-lg py-2.5 rounded-lg shadow-sm transition cursor-pointer">
                    상세 조회
                  </button>
                </div>
              </div>
            ))}
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
              <div className="font-label-md text-label-md font-bold text-primary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">price_check</span>역경매 ZERO</div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">고객 확정 지정가 100% 보장</span>
            </div>
            <div className="bg-surface-container-lowest/90 rounded-lg p-space-sm flex flex-col gap-0.5">
              <div className="font-label-md text-label-md font-bold text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">how_to_reg</span>선착순 1개사 청약</div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">중복 투찰 스트레스 없는 매칭</span>
            </div>
            <div className="bg-surface-container-lowest/90 rounded-lg p-space-sm flex flex-col gap-0.5">
              <div className="font-label-md text-label-md font-bold text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">payments</span>100% 현장 직불</div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">검수 완료 후 고객 즉시 정산</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
