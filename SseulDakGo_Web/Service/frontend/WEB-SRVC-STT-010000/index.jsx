import React, { useState, useEffect, useCallback } from 'react';

/**
 * 화면 ID: WEB-SRVC-STT-010000
 * 화면명: 기간별 청약·청소금액 통계 요약 모달
 */
export default function WebSrvcStt010000({ isOpen = true, onClose, userInfo }) {
  const getYmRange = (months) => {
    const now = new Date();
    const toYm = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fromD = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const fromYm = `${fromD.getFullYear()}.${String(fromD.getMonth() + 1).padStart(2, '0')}`;
    return { fromYm, toYm };
  };

  const initial = getYmRange(12);
  const [dateFrom, setDateFrom] = useState(initial.fromYm);
  const [dateTo, setDateTo] = useState(initial.toYm);
  const [activePreset, setActivePreset] = useState(12);
  const [summary, setSummary] = useState({
    appliedCount: 0,
    appliedCleaningAmt: 0,
    cancelledCount: 0,
    cancelledCleaningAmt: 0,
  });
  const [validation, setValidation] = useState({
    type: 'info',
    text: `조회 기준일: ${initial.fromYm} ~ ${initial.toYm} (총 12개월) · 12개월 초과 입력 시 조회가 제한됩니다.`,
  });

  const fetchStats = useCallback(async (fromYm, toYm) => {
    const fromParts = String(fromYm).trim().split('.');
    const toParts = String(toYm).trim().split('.');
    if (fromParts.length !== 2 || toParts.length !== 2) {
      setValidation({ type: 'error', text: '조회 년월은 YYYY.MM 형식으로 입력해 주세요.' });
      return;
    }
    const fromMonths = Number(fromParts[0]) * 12 + Number(fromParts[1]);
    const toMonths = Number(toParts[0]) * 12 + Number(toParts[1]);
    const diff = toMonths - fromMonths + 1;
    if (Number.isNaN(diff) || diff < 1) {
      setValidation({ type: 'error', text: '조회 시작월(From)은 종료월(To)보다 클 수 없습니다.' });
      return;
    }
    if (diff > 12) {
      setValidation({ type: 'error', text: `선택한 기간이 ${diff}개월입니다. 최대 1년(12개월) 범위 내에서만 조회할 수 있습니다.` });
      return;
    }

    try {
      const uNo = userInfo?.USER_NO || 'S20261100001';
      const qs = new URLSearchParams({ userNo: uNo, dateFrom: fromYm, dateTo: toYm });
      const res = await fetch(`/api/srvc/stt/010000?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setValidation({ type: 'error', text: json?.message || '통계 조회 중 오류가 발생했습니다.' });
        return;
      }
      const boxes = json.data?.summaryBoxes || {};
      setSummary({
        appliedCount: Number(boxes.appliedCount || 0),
        appliedCleaningAmt: Number(boxes.appliedCleaningAmt || 0),
        cancelledCount: Number(boxes.cancelledCount || 0),
        cancelledCleaningAmt: Number(boxes.cancelledCleaningAmt || 0),
      });
      setValidation({
        type: 'success',
        text: `조회 기준일: ${fromYm} ~ ${toYm} (총 ${diff}개월) · 정상 조회되었습니다.`,
      });
    } catch {
      setValidation({ type: 'error', text: '통계 서버 연결 중 오류가 발생했습니다.' });
    }
  }, [userInfo?.USER_NO]);

  useEffect(() => {
    if (isOpen) {
      fetchStats(dateFrom, dateTo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreset = (months) => {
    const { fromYm, toYm } = getYmRange(months);
    setDateFrom(fromYm);
    setDateTo(toYm);
    setActivePreset(months);
    fetchStats(fromYm, toYm);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 bg-white flex items-start sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md tracking-wider">WEB-SRVC-STT-010000</span>
              <span className="text-xs font-semibold text-slate-500">시공사 파트너 통계</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">기간별 청약·청소금액 통계 요약</h2>
            <p className="text-xs text-slate-500 mt-0.5">조회 시작월(From)부터 종료월(To)까지 최대 1년(12개월) 범위 내의 청약 및 취소 실적을 합산하여 보여줍니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col gap-5 overflow-y-auto">
          <div className="p-4 sm:p-5 bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-900">
                <span className="material-symbols-outlined text-[18px] text-blue-600">calendar_month</span>
                <span className="text-sm font-bold">조회 기간 설정 (월 단위)</span>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">※ 최대 1년(12개월) 범위 내에서만 조회 가능</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input type="text" maxLength={7} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="YYYY.MM" className="w-28 sm:w-32 text-center text-sm font-semibold text-slate-900 bg-slate-100 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums" />
                <span className="text-sm font-bold text-slate-400">~</span>
                <input type="text" maxLength={7} value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="YYYY.MM" className="w-28 sm:w-32 text-center text-sm font-semibold text-slate-900 bg-slate-100 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums" />
              </div>
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                {[
                  { m: 1, label: '당월 (1개월)' },
                  { m: 3, label: '최근 3개월' },
                  { m: 6, label: '최근 6개월' },
                  { m: 12, label: '최근 1년 (12개월)' },
                ].map((p) => (
                  <button
                    key={p.m}
                    type="button"
                    onClick={() => handlePreset(p.m)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activePreset === p.m ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setActivePreset(0); fetchStats(dateFrom, dateTo); }} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>통계 조회</span>
              </button>
            </div>
            <div className={`text-xs flex items-center gap-1.5 ${validation.type === 'error' ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
              <span className={`material-symbols-outlined text-[15px] ${validation.type === 'error' ? 'text-rose-600' : validation.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`}>
                {validation.type === 'error' ? 'error' : validation.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span>{validation.text}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">청약건수</span>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">정상·진행 청약</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-blue-600 tabular-nums">{summary.appliedCount.toLocaleString()}</span>
                <span className="text-base font-bold text-slate-500 ml-1">건</span>
              </div>
              <p className="text-xs text-slate-500">선택 기간 내 유효 청약 신청 합계</p>
            </div>

            <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">청소금액</span>
                </div>
                <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full">확정 지정가 합계</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-teal-700 tabular-nums">{summary.appliedCleaningAmt.toLocaleString()}</span>
                <span className="text-base font-bold text-slate-500 ml-1">원</span>
              </div>
              <p className="text-xs text-slate-500">선택 기간 내 청약 건의 고객 확정 지정가 총액</p>
            </div>

            <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">청약취소건수</span>
                </div>
                <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full">취소 처리 건</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-rose-600 tabular-nums">{summary.cancelledCount.toLocaleString()}</span>
                <span className="text-base font-bold text-slate-500 ml-1">건</span>
              </div>
              <p className="text-xs text-slate-500">선택 기간 내 청약 및 계약 취소 발생 합계</p>
            </div>

            <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-200/80 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">money_off</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">청약취소청소금액</span>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">취소 건 용역가</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-700 tabular-nums">{summary.cancelledCleaningAmt.toLocaleString()}</span>
                <span className="text-base font-bold text-slate-500 ml-1">원</span>
              </div>
              <p className="text-xs text-slate-500">선택 기간 내 취소된 청약 건의 지정가 총액</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 text-xs text-slate-600 flex items-start sm:items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">policy</span>
            <span>※ 금액은 고객 확정 지정가 기준이며, 취소 위약금 및 거래제한(8일 정지 / 10회 영구정지) 상세 내역은 &apos;내 청약 내역(WEB-SRVC-QOT-020000)&apos;에서 확인할 수 있습니다.</span>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button type="button" onClick={() => handlePreset(12)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 cursor-pointer">기간 초기화</button>
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white shadow-sm cursor-pointer">확인 (닫기)</button>
        </div>
      </div>
    </div>
  );
}
