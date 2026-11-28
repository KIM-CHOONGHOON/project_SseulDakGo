import React, { useState, useEffect } from 'react';

const INITIAL_CERTS = [
  { id: 1, name: '가전관리사 1급', org: '한국청소위생협회', cat: '계절가전 분해케어', catCls: 'bg-blue-50 text-blue-700 border-blue-100', level: '1급', date: '2023.05.14', certNo: '제2023-C-0842호', status: '검수완료', statusCls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500', icon: 'award_star', iconBg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 2, name: '방역소독전문가 1급', org: '사단법인 한국방역협회', cat: '입주·이사 청소', catCls: 'bg-teal-50 text-teal-700 border-teal-100', level: '전문가', date: '2022.11.20', certNo: '제2022-DS-1093호', status: '심사대기', statusCls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-500', icon: 'license', iconBg: 'bg-blue-50 text-blue-700 border-blue-200' },
];

/**
 * 화면 ID: WEB-SRVC-MYP-020100
 * 화면명: 사업자등록 및 자격증·수료증 통합 관리
 */
export default function WebSrvcMyp020100({ userInfo, onBack }) {
  const [bizName, setBizName] = useState(userInfo?.USER_NM || '(주)클린파트너스');
  const [ceoName, setCeoName] = useState('김태호');
  const [bizNo, setBizNo] = useState('120-88-29401');
  const [docType, setDocType] = useState('ALL');
  const [serviceCat, setServiceCat] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [certs, setCerts] = useState([]);
  const [cleanServiceTypes, setCleanServiceTypes] = useState([]);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [showEmptyBizModal, setShowEmptyBizModal] = useState(!bizNo || !bizName);
  const [certPage, setCertPage] = useState(1);
  const pageSize = 5;
  const totalCertPages = Math.max(1, Math.ceil(certs.length / pageSize));
  const pagedCerts = certs.slice((certPage - 1) * pageSize, certPage * pageSize);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const uNo = userInfo?.USER_NO || userInfo?.userNo || 'S20261100002';
    fetch(`/api/srvc/myp/020101?userNo=${encodeURIComponent(uNo)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json.data) {
          if (json.data.COMP_NM) setBizName(json.data.COMP_NM);
          if (json.data.CEO_NM) setCeoName(json.data.CEO_NM);
          if (json.data.BIZ_REG_NO) setBizNo(json.data.BIZ_REG_NO);
        }
      })
      .catch(() => { });
    fetch(`/api/srvc/myp/020100?userNo=${encodeURIComponent(uNo)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.certs)) {
          setCerts(
            json.certs.map((c, idx) => ({
              id: c.CERT_SEQ || idx + 1,
              name: c.CERT_NM || '',
              org: c.ISSUER_ORG || '',
              cat: c.SERVICE_CAT || '공통',
              catCls: 'bg-blue-50 text-blue-700 border-blue-100',
              level: c.CERT_LEVEL || '1급',
              date: c.issueDt || '',
              certNo: c.CERT_NO || '',
              status: c.VERIFY_STAT_CD === 'APPROVED' ? '검수완료' : '심사대기',
              statusCls: c.VERIFY_STAT_CD === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
              dotCls: c.VERIFY_STAT_CD === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500',
              icon: 'award_star',
              iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
            }))
          );
        }
      })
      .catch(() => { });
  }, [userInfo]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <main className="w-full pt-[72px] bg-[#f7f9fb] text-slate-800 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 flex flex-col gap-6">
        {/* 상단 헤더 */}
          <header className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-blue-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold tracking-wide border border-blue-100">WEB-SRVC-MYP-020100</span>
                <span className="text-xs text-slate-400 font-medium">통합 입점/자격 심사 관리</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">사업자등록 및 자격증·수료증 등록</h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl">
                국세청 진위확인, 홈택스 PDF OCR 자동 파싱 및 표준 자격·수료 항목 검색/등록(최대 5건)을 원스톱으로 처리합니다.
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2 shrink-0 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                인증 파트너 심사 연동
              </span>
              <span className="text-[11px] text-slate-400 font-medium">공공 데이터 API 실시간 연결됨</span>
            </div>
          </header>

          {/* 1. 사업자등록 및 국세청 진위확인 */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-500 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. 사업자등록 및 국세청 진위확인</h2>
                  <p className="text-xs text-slate-500">사업자 정보 입력 및 국세청 휴·폐업 및 진위확인 실시간 대조</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOcrModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-slate-600">document_scanner</span>
                사업자 등록증 업로드
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">상호명 (법인명) <span className="text-rose-500">*</span></label>
                <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">대표자 성명 <span className="text-rose-500">*</span></label>
                <input type="text" value={ceoName} onChange={(e) => setCeoName(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">사업자등록번호 (10자리) <span className="text-rose-500">*</span></label>
                <input type="text" value={bizNo} onChange={(e) => setBizNo(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                <span><strong>국세청 전산 확인 완료:</strong> 정상 계속사업자 (일반과세자, 개업일: 2021-03-15)</span>
              </div>
              <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">인증 유효</span>
            </div>
          </section>

          {/* 2. 청소 용역 구분 */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-500 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">cleaning_services</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">2. 청소 용역 구분</h2>
                  <p className="text-xs text-slate-500">시공 가능한 청소 용역 분야를 선택하세요 (복수 선택 가능)</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {['정기청소', '입주청소', '계절가전 청소'].map((item) => {
                const checked = cleanServiceTypes.includes(item);
                return (
                  <label key={item} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setCleanServiceTypes((prev) =>
                          prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
                        )
                      }
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">{item}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 3. 표준 자격·수료 항목 검색 및 등록 */}
          <section className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-500 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-100">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">3. 표준 자격·수료 항목 검색 및 등록</h2>

                  </div>
                  <p className="text-xs text-slate-500">본사 심사 승인 시 고객 대시보드 및 상세 견적 프로필에 공식 인증 마크 부여</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">filter_list</span>

              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">문서 구분 (CERT_DOC_TYPE)</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700">
                  <option value="ALL">전체 구분 (전체 문서)</option>
                  <option value="LICENSE">국가/민간 자격증</option>
                  <option value="COMPLETION">협회 수료증</option>
                  <option value="BUSINESS">위생관리용역업 신고증</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">서비스 전문 분야</label>
                <select value={serviceCat} onChange={(e) => setServiceCat(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700">
                  <option value="ALL">전체 분야 (주력 우선)</option>
                  <option value="MOVE_IN">입주·이사 청소</option>
                  <option value="APPLIANCE">계절가전 분해케어</option>
                  <option value="REGULAR">정기청소</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">자격·수료증 명칭</label>
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 방역소독, 가전관리" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => showToast('표준 자격 항목 검색을 완료했습니다.')} className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                  <span className="material-symbols-outlined text-base">search</span>
                  항목 검색
                </button>
              </div>
            </div>

            {/* 등록 자격·수료증 목록 */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <div className="flex items-center justify-between text-xs mb-3 pb-2.5 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-teal-600 text-lg">verified</span>등록 자격·수료증
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">({certs.length}건 등록됨)</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">잔여 <strong className="text-blue-600 font-bold">{Math.max(0, 5 - certs.length)}건</strong> 추가 가능</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {pagedCerts.map((c) => (
                  <div key={c.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border shrink-0 ${c.iconBg}`}>
                        <span className="material-symbols-outlined text-sm">{c.icon}</span>
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${c.catCls}`}>{c.cat}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">{c.level}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 text-[11px]">취득일: {c.date}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 text-[11px]">발급기관: {c.org} ({c.certNo})</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${c.statusCls}`}>
                        <span className={`w-1 h-1 rounded-full ${c.dotCls}`} />{c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => showToast(`${c.name} 증빙 사진을 확인합니다.`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer">
                        <span className="material-symbols-outlined text-sm text-slate-500">image</span>자격증사진
                      </button>
                      <button type="button" onClick={() => setCerts((prev) => prev.filter((x) => x.id !== c.id))} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">delete</span>삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 (페이지당 최대 5건) */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/70">
                <span className="text-xs text-slate-500">
                  총 <strong className="text-slate-800">{certs.length}</strong>건 (페이지 {certPage}/{totalCertPages})
                </span>
                <nav aria-label="자격·수료증 목록 페이지 이동" className="inline-flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
                  <button type="button" disabled={certPage === 1} onClick={() => setCertPage(1)} title="맨앞페이지" className="h-7 px-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 text-xs font-bold cursor-pointer">&lt;&lt;</button>
                  <button type="button" disabled={certPage === 1} onClick={() => setCertPage((p) => Math.max(1, p - 1))} title="전페이지" className="h-7 px-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 text-xs font-bold cursor-pointer">&lt;</button>
                  {Array.from({ length: totalCertPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} type="button" onClick={() => setCertPage(p)} className={`h-7 min-w-[28px] px-2 inline-flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${certPage === p ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}>
                      {p}
                    </button>
                  ))}
                  <button type="button" disabled={certPage === totalCertPages} onClick={() => setCertPage((p) => Math.min(totalCertPages, p + 1))} title="다음페이지" className="h-7 px-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 text-xs font-bold cursor-pointer">&gt;</button>
                  <button type="button" disabled={certPage === totalCertPages} onClick={() => setCertPage(totalCertPages)} title="맨뒤페이지" className="h-7 px-2 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 disabled:text-slate-400 disabled:opacity-50 text-xs font-bold cursor-pointer">&gt;&gt;</button>
                </nav>
              </div>
            </div>

            {/* 하단 저장 및 돌아가기 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                등록된 정보는 플랫폼 본사 전문 검수팀에 의해 영업일 기준 24시간 이내 승인됩니다.
              </p>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button type="button" onClick={onBack} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  취소 및 돌아가기
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/srvc/myp/020100', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userNo: userInfo?.USER_NO || 'S20261100002',
                          bizName,
                          ceoName,
                          bizNo,
                          certs,
                        }),
                      });
                      const json = await res.json();
                      showToast(json?.message || '사업자 및 자격·수료 정보가 저장되었습니다.');
                    } catch {
                      showToast('저장 요청 중 오류가 발생했습니다.');
                    }
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  내 정보 저장
                </button>
              </div>
            </div>
          </section>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <WebSrvcMyp020101
        isOpen={isOcrModalOpen}
        userInfo={userInfo}
        onClose={() => setIsOcrModalOpen(false)}
        onApplyData={(data) => {
          if (data?.bizName) setBizName(data.bizName);
          if (data?.ceoName) setCeoName(data.ceoName);
          if (data?.bizNo) setBizNo(data.bizNo);
          showToast('OCR 추출 정보가 사업자등록 폼에 반영되었습니다.');
        }}
      />

      {showEmptyBizModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">info</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              사업자 등록 및 자격증·수료 정보를 입력하세요.
            </p>
            <button
              type="button"
              onClick={() => setShowEmptyBizModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
