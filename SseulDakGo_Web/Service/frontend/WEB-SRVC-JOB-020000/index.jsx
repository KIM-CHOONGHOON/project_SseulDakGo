import React, { useState, useEffect } from 'react';
import WebSrvcJob020100Modal from '../WEB-SRVC-JOB-020100/index.jsx';
import WebSrvcJob020200Modal from '../WEB-SRVC-JOB-020200/index.jsx';

/**
 * ============================================================================
 * [프론트엔드 메인 대시보드 컴포넌트]
 * 화면 ID: WEB-SRVC-JOB-020000
 * 화면명: 시공 파트너 현장 진행 현황 (Contractor On-Site Progress Dashboard)
 * 파일 경로: SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020000/index.jsx
 * 연동 API: GET /api/web/service/job_020000
 * ============================================================================
 */
export default function WebSrvcJob020000({
  currentUser,
  onNavigate,
  onLogout
}) {
  const [jobData, setJobData] = useState({
    orderNo: 'SDG-2026-1120',
    contractNo: 'CNT-2026-112001',
    clientName: '김충훈',
    clientSafePhone: '0504-1234-5678',
    siteAddress: '경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)',
    serviceType: '강남구 역삼동 아펠가모 34평 프리미엄 입주청소 + 피톤치드 살균',
    orderDate: '2026-11-20 14:00',
    progressStep: 3,
    progressRate: 72,
    contractor: {
      companyName: '공간다원 시공팀',
      managerName: '김태호 팀장',
      license: '1급 위생관리사',
      rating: 4.98,
      profileImg: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
    },
    photos: {
      beforeCount: 4,
      ingCount: 4,
      afterCount: 0,
      totalCount: 8
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/web/service/job_020000?contractorNo=S20261100001');
        const json = await res.json();
        if (json.success && json.data) {
          setJobData(json.data);
        }
      } catch (e) {
        console.warn('API 로드 실패, 기본 데이터 유지:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobData();
  }, []);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. GNB Header (시공사 전용 공통 헤더)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <a
              onClick={() => onNavigate?.('home')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#003d9b] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                SDG
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-[#003d9b] tracking-tight leading-none">쓸고닦고</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">BUILDING CLEANING</span>
              </div>
            </a>

            {/* 시공사 GNB 네비게이션 */}
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 text-xs">
              <a
                className="px-3.5 py-1.5 rounded-full font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                onClick={() => onNavigate?.('home')}
              >
                청소·시공 청약
              </a>
              <a
                className="px-3.5 py-1.5 rounded-full font-bold bg-[#003d9b] text-white shadow-xs cursor-pointer"
                onClick={() => onNavigate?.('WEB-SRVC-JOB-020000')}
              >
                현장 진행 현황
              </a>
              <a
                className="px-3.5 py-1.5 rounded-full font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                onClick={() => alert('시공 완료 건에 대한 고객 만족도 및 후기 답글 작성 화면으로 이동합니다.')}
              >
                이용후기 답글 쓰기
              </a>
              <a
                className="px-3.5 py-1.5 rounded-full font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                onClick={() => onNavigate?.('WEB-CLNT-MYP-010100')}
              >
                내 정보
              </a>
              <a
                className="px-3.5 py-1.5 rounded-full font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                onClick={() => alert('쓸고닦고 고객만족센터: 1588-7824')}
              >
                고객센터
              </a>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">
              {currentUser?.USER_NM || '공간다원'} 님
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#006a61]">
                인증 시공사 (S)
              </span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. Main Container
      ───────────────────────────────────────────────────────────── */}
      <main className="w-full flex-1 py-8">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 flex flex-col gap-6">
          {/* Breadcrumb & Section Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <a onClick={() => onNavigate?.('home')} className="hover:text-[#003d9b] cursor-pointer">홈</a>
                <span>&gt;</span>
                <span className="text-slate-900 font-bold">시공 파트너 현장 진행 현황 [WEB-SRVC-JOB-020000]</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>현장 진행 현황</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#006a61]">
                  실시간 관제 중 (D-Day 14:00 예약)
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>주문번호:</span>
              <strong className="font-mono text-slate-900 font-bold">{jobData.orderNo}</strong>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              3. Core Card: 현장 진행 현황 메인 대시보드 카드
          ───────────────────────────────────────────────────────── */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 flex flex-col gap-6">
            {/* 3.1 발주고객 성명 & 현장 주소 헤더 */}
            <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-100">
              <span className="text-lg sm:text-xl font-extrabold text-[#003d9b]">
                {jobData.serviceType}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                <div>
                  발주고객: <strong className="text-slate-900 font-bold">{jobData.clientName} 님</strong>
                  <span className="ml-1.5 inline-flex items-center gap-1 text-[#006a61] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    <span className="material-symbols-outlined text-[13px]">phone_in_talk</span>
                    안심번호 0504 연결 상태 ({jobData.clientSafePhone})
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                  현장주소: <strong className="text-slate-800 font-bold">{jobData.siteAddress}</strong>
                </div>
              </div>
            </div>

            {/* 3.2 5단계 시각화 Stepper */}
            <div className="w-full bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-center relative">
                {/* 1. 예약 확정 */}
                <div className="flex-1 flex flex-col items-center z-10">
                  <div className="w-9 h-9 rounded-full bg-[#006a61] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">예약 확정</span>
                  <span className="text-[11px] text-slate-400">10:00 완료</span>
                </div>

                {/* 2. 현장 도착 */}
                <div className="flex-1 flex flex-col items-center z-10">
                  <div className="w-9 h-9 rounded-full bg-[#006a61] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">현장 도착</span>
                  <span className="text-[11px] text-slate-400">13:45 체크</span>
                </div>

                {/* 3. 시공 진행중 (Active) */}
                <div className="flex-1 flex flex-col items-center z-10">
                  <div className="w-10 h-10 rounded-full bg-[#003d9b] text-white ring-4 ring-blue-100 flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                    <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#003d9b] mt-2">시공 진행중</span>
                  <span className="text-[11px] font-bold text-[#006a61]">현재 {jobData.progressRate}% 진행</span>
                </div>

                {/* 4. 현장 최종검수 */}
                <div className="flex-1 flex flex-col items-center z-10">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <span className="text-xs font-medium text-slate-400 mt-2">현장 최종검수</span>
                  <span className="text-[11px] text-slate-400">17:00 예정</span>
                </div>

                {/* 5. 서명 및 완료 */}
                <div className="flex-1 flex flex-col items-center z-10">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <span className="text-xs font-medium text-slate-400 mt-2">서명 및 완료</span>
                  <span className="text-[11px] text-slate-400">안심정산</span>
                </div>

                {/* Stepper 연결선 */}
                <div className="absolute top-4.5 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0">
                  <div className="h-full bg-[#006a61]" style={{ width: '55%' }}></div>
                </div>
              </div>
            </div>

            {/* 3.3 시공사 담당자 성명 및 우측 [시공사진첨부], [시공완료 등록] 액션 버튼 배치 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
              {/* 좌측: 시공사 담당자 정보 */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-xs shrink-0">
                  <img
                    src={jobData.contractor.profileImg}
                    alt="시공사 담당자"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {jobData.contractor.companyName}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      (담당: {jobData.contractor.managerName})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="text-[#006a61] font-bold">{jobData.contractor.license}</span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      평점 {jobData.contractor.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* 우측: 시공사 담당자 성명 오른쪽에 [시공사진첨부], [시공완료 등록] 버튼 배치 */}
              <div className="flex items-center gap-3 shrink-0">
                {/* 1. 시공사진첨부 버튼 -> WEB-SRVC-JOB-020100 모달 호출 */}
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#006a61] hover:bg-[#004f48] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  <span>시공사진첨부</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                    {jobData.photos.totalCount}장
                  </span>
                </button>

                {/* 2. 시공완료 등록 버튼 -> WEB-SRVC-JOB-020200 모달 호출 */}
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#003d9b] hover:bg-[#002b6e] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>시공완료 등록</span>
                </button>
              </div>
            </div>

            {/* 3.4 보조 영역: 실시간 시공 사진 확인 & 1:1 안심채팅 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setIsPhotoModalOpen(true)}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#006a61] bg-white transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#006a61] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">photo_library</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">실시간 등록 시공 사진 ({jobData.photos.totalCount}장)</h4>
                    <p className="text-[11px] text-slate-500">시공 전 {jobData.photos.beforeCount}장 · 시공 중 {jobData.photos.ingCount}장 등록 완료</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>

              <div
                onClick={() => alert(`발주고객님(${jobData.clientName} 님)과의 1:1 안심 채팅창을 연결합니다.`)}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#003d9b] bg-white transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">고객님과 1:1 안심 채팅</h4>
                    <p className="text-[11px] text-slate-500">안심번호 0504 기반 실시간 소통 채널 가동 중</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. Sub Modals (중분류 01번, 02번 채번)
      ───────────────────────────────────────────────────────────── */}
      {/* 모달 1: 현장 시공 사진 첨부 (WEB-SRVC-JOB-020100) */}
      <WebSrvcJob020100Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        jobData={jobData}
        onSuccess={(count) => {
          setJobData(prev => ({
            ...prev,
            photos: { ...prev.photos, totalCount: count }
          }));
        }}
      />

      {/* 모달 2: 현장 시공 완료 등록 (WEB-SRVC-JOB-020200) */}
      <WebSrvcJob020200Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        jobData={jobData}
        onSuccess={(data) => {
          setJobData(prev => ({
            ...prev,
            progressStep: 4,
            progressRate: 100
          }));
          alert('현장 시공 완료 등록이 반영되었습니다.');
        }}
      />
    </div>
  );
}
