/*
 * Frontend ID: WEB‑CLNT‑MYP‑010102 (회원탈회 확인 모달)
 * React component generated from provided HTML.
 * Tailwind CSS classes are preserved; IDs are kept for external control.
 */

import React, { useState, useCallback } from 'react';

/**
 * MemberLeaveConfirmModal
 * Props:
 *   isOpen   – whether the modal should be rendered (default true)
 *   onClose  – callback when the modal is cancelled/closed
 *   onSubmit – callback when the user confirms the withdrawal. Receives a payload object.
 */
const MemberLeaveConfirmModal = ({ isOpen = true, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const handleCancel = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Simulated payload – replace with real data as needed
    const payload = {
      userNo: 'C20261100001',
      clientName: '김충훈',
      reasonCode: 'USER_REQUEST',
      confirmedAt: new Date().toISOString(),
      pointsForfeited: 15000,
      couponsRevokedCount: 2,
      agreeTerms: true,
    };
    if (onSubmit) onSubmit(payload);
    // Simulate async request
    setTimeout(() => {
      setIsSubmitting(false);
      // Optionally trigger a success toast outside the component
    }, 1200);
  }, [isSubmitting, onSubmit]);

  const togglePayload = useCallback(() => {
    setShowPayload((v) => !v);
  }, []);

  if (!isOpen) return null;

  return (
    <div id="modal-backdrop" className="fixed inset-0 z-40 bg-inverse-surface/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col gap-4">
        {/* Main Alert Dialog */}
        <section
          aria-describedby="modal-desc"
          aria-labelledby="modal-title"
          aria-modal="true"
          role="alertdialog"
          className="w-full bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden transform transition-all duration-200"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-surface-container bg-surface-container-low/60">
            <button
              aria-label="닫기"
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={handleCancel}
            >
              <span className="material-symbols-outlined text-[20px] block leading-none">close</span>
            </button>
            <h2
              className="font-headline-sm text-title-md sm:text-headline-sm text-on-surface text-center"
              id="modal-title"
            >
              회원 탈퇴를 정말 원하십니까?
            </h2>
            <span className="font-mono text-[11px] font-semibold text-outline bg-surface-container px-2 py-0.5 rounded tracking-tight">
              WEB-CLNT-MYP-010102
            </span>
          </header>

          {/* Body */}
          <div className="p-6 text-center space-y-4">
            {/* Warning Icon */}
            <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center mx-auto ring-8 ring-error-container/40">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            {/* Heading */}
            <div className="space-y-2">
              <p className="font-title-md text-base font-semibold text-on-surface">계정 탈퇴 최종 확인</p>
              <div
                className="font-title-md text-xs sm:text-sm font-medium text-error bg-error-container/40 border border-error-container py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5"
                id="modal-desc"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>이 작업은 되돌릴 수 없으며 복구되지 않습니다.</span>
              </div>
            </div>
            {/* Details List */}
            <div className="text-left bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/20 space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">cancel</span>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  탈퇴 시 보유 중인 <strong className="text-on-surface font-semibold">포인트 15,000P</strong> 및 <strong className="text-on-surface font-semibold">할인쿠폰 2매</strong>는 전액 즉시 영구 소멸됩니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">history_toggle_off</span>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  기존 진행된 <strong className="text-on-surface font-semibold">시공 보증(A/S) 내역 조회</strong> 및 전자세금계산서 증빙 발행 데이터 조회가 영구 차단됩니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">person_off</span>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  탈퇴 후 <strong className="text-on-surface font-semibold">30일간</strong> 동일 휴대폰 번호 및 본인인증 정보로 재가입이 제한됩니다.
                </p>
              </div>
            </div>
            {/* User Chip */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container border border-surface-container-high text-left">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">김</div>
                <div className="flex flex-col">
                  <span className="font-title-md text-xs text-on-surface">김충훈 (C20261100001)</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">ch.kim@sseuldakgo.com</span>
                </div>
              </div>
              <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                인증 회원
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <footer className="p-4 bg-surface-container-low/80 border-t border-surface-container-high space-y-3">
            <div className="flex items-center justify-end gap-3">
              {/* Cancel */}
              <button
                id="btn-modal-cancel"
                aria-label="탈퇴 취소 및 모달 닫기"
                className="flex-1 py-3 px-4 rounded-xl font-title-md text-sm font-semibold text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                아니오 (취소)
              </button>
              {/* Confirm */}
              <button
                id="btn-modal-confirm"
                aria-label="회원 탈퇴 진행"
                className={`flex-1 py-3 px-4 rounded-xl font-title-md text-sm font-semibold text-on-error bg-error hover:bg-error/90 shadow-md shadow-error/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-error focus:ring-offset-2 ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-[18px]" id="btn-leave-icon" style={{ display: isSubmitting ? 'none' : 'inline' }}>no_accounts</span>
                <svg
                  className={`h-4 w-4 text-on-error animate-spin ${isSubmitting ? 'inline' : 'hidden'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span id="btn-leave-label">{isSubmitting ? '탈퇴 처리 중...' : '네, 탈퇴합니다'}</span>
              </button>
            </div>
          </footer>
        </section>

        {/* API Payload Inspection */}
        <section id="api-payload-box" className={`w-full bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 overflow-hidden transition-all duration-300 ${showPayload ? '' : 'hidden'}`}>
          <div className="flex items-center justify-between px-3 py-2 bg-surface-container border-b border-outline-variant/30">
            <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface">
              <span className="px-1.5 py-0.5 rounded bg-error text-on-error font-bold">POST</span>
              <span>/api/web/client/leave</span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">HTTP/2 200 Spec</span>
          </div>
          <pre className="p-3 bg-inverse-surface text-inverse-on-surface font-mono text-[11px] overflow-x-auto leading-relaxed">
            {`{
  "userNo": "C20261100001",
  "clientName": "김충훈",
  "reasonCode": "USER_REQUEST",
  "confirmedAt": "2026-11-20T14:35:00Z",
  "pointsForfeited": 15000,
  "couponsRevokedCount": 2,
  "agreeTerms": true
}`}
          </pre>
        </section>

        {/* Toggle Payload Button */}
        <div className="flex justify-center mt-2">
          <button
            className="px-3 py-1 rounded-lg text-xs font-mono bg-tertiary-container text-on-tertiary-container hover:bg-tertiary transition-colors flex items-center gap-1"
            onClick={togglePayload}
          >
            <span className="material-symbols-outlined text-[14px]">data_object</span>
            {showPayload ? 'Hide API Payload' : 'Show API Payload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberLeaveConfirmModal;
