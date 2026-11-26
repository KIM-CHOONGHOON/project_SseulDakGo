import React, { useState, useEffect } from 'react';

/**
 * [ID: WEB-SRVC-QOT-020200]
 * 화면명: 시공사 청약진행상태 및 청소 요청 상세 (Modal)
 * API: GET /api/srvc/qot/020200?userNo=...&orderNo=...
 */
export default function WebSrvcQot020200Modal({
  isOpen = false,
  userNo = '',
  target = null,
  onClose,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !target?.orderNo) return;
    let mounted = true;
    setLoading(true);
    fetch(`/api/srvc/qot/020200?userNo=${encodeURIComponent(userNo)}&orderNo=${encodeURIComponent(target.orderNo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        if (data?.success && data.detail) {
          setDetail(data.detail);
        } else {
          setDetail(null);
        }
      })
      .catch(() => {
        if (mounted) setDetail(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen, userNo, target?.orderNo]);

  if (!isOpen || !target) return null;

  const orderNo = detail?.orderNo || target.orderNo;
  const statusLabel = detail?.statusLabel || target.statusLabel || '청약 접수중 (고객 승인 대기)';
  const category = detail?.category || target.category || '입주청소';
  const fixedPrice = detail?.fixedPrice ?? target.fixedPrice ?? 420000;
  const isApproved = Boolean(detail?.isApproved);
  const addrDisplay = isApproved
    ? `${detail?.addrText || target.shortAddr} ${detail?.addrDetail || ''}`.trim()
    : detail?.shortAddr || target.shortAddr || '경기 고양시 일산동구';
  const cleanScope = detail?.cleanScope || target.cleanScope || '';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-[520px] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        {/* 1. Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 id="modalTitle" className="text-[19px] font-bold text-[#191c1e] tracking-tight leading-snug">
            청약진행상태 및 청소 요청 상세
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate-500 py-6 text-center">상세 정보를 조회하고 있습니다...</p>
          ) : (
            <>
              {/* 2. Top Status Summary Banner */}
              <div className="bg-gradient-to-r from-blue-50/80 to-teal-50/80 border border-blue-100/90 rounded-xl p-4 flex items-center justify-between shadow-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-700 text-[20px]">receipt_long</span>
                  <div className="text-sm font-semibold text-slate-800 tracking-tight truncate">
                    <span className="text-slate-500 font-normal">발주번호:</span> {orderNo}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-[#003d9b] shadow-sm shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                  {statusLabel}
                </div>
              </div>

              {/* 3. Body Detail Grid */}
              <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-4 divide-y divide-slate-200/60">
                <div className="grid grid-cols-2 gap-4 pb-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">cleaning_services</span>
                      청소요청구분
                    </span>
                    <div className="text-[15px] font-bold text-slate-900 pl-0.5">{category}</div>
                  </div>
                  <div className="space-y-1.5 pl-2 border-l border-slate-200/60">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">payments</span>
                      고객 확정 지정가
                    </span>
                    <div className="text-[17px] font-bold text-[#006a61] tracking-tight pl-0.5 flex items-baseline gap-0.5">
                      {Number(fixedPrice).toLocaleString()}
                      <span className="text-xs font-semibold text-[#006a61]/80">원</span>
                    </div>
                  </div>
                </div>

                <div className="py-3.5 space-y-1.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                    현장주소
                  </span>
                  <div className="text-[14px] font-semibold text-slate-800 pl-0.5 flex flex-wrap items-center gap-1.5">
                    <span>{addrDisplay}</span>
                    {!isApproved && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                        상세주소는 수락 후 공개
                      </span>
                    )}
                  </div>
                </div>

                {isApproved && detail?.contactTel && (
                  <div className="py-3.5 space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                      고객 연락처 (안심번호)
                    </span>
                    <div className="text-[14px] font-bold text-[#003d9b] pl-0.5">
                      {detail.contactPersonNm ? `${detail.contactPersonNm} · ` : ''}
                      {detail.contactTel}
                    </div>
                  </div>
                )}

                <div className="pt-3.5 space-y-1.5">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">space_dashboard</span>
                    청소범위
                  </span>
                  <div className="text-[13.5px] leading-relaxed text-slate-700 font-medium pl-0.5 bg-white/70 border border-slate-200/50 rounded-lg p-3">
                    {cleanScope}
                  </div>
                </div>
              </div>

              {!isApproved && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-50/50 border border-blue-100/60 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">info</span>
                  <p className="leading-relaxed">
                    고객 승인 완료 시 등록하신 대표 연락처 및 카카오 알림톡으로 현장 최종 상세 주소 및 고객 안심번호가 즉시 전송됩니다.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="w-full sm:w-auto min-w-[140px] px-8 py-2.5 rounded-lg bg-[#003d9b] hover:bg-[#002f78] text-white text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center justify-center"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
