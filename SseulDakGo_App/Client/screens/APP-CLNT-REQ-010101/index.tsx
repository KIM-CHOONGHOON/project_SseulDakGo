import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * [모바일 앱 모달 화면]
 * 화면 ID: APP-CLNT-REQ-010101
 * 한글 화면명: 동일 시공 현장 주소 확인 및 변경 안내 모달
 * 파일 경로: SseulDakGo_App/Client/screens/APP-CLNT-REQ-010101/index.tsx
 * 상위 부모 화면: APP-CLNT-REQ-010100 (청소 서비스 신청)
 * 연동 백엔드 API: POST /api/app/client/req_010101
 * ============================================================================
 */
export interface AppClntReq010101ModalProps {
  isOpen: boolean;
  duplicateTabs: string[];
  tabAddresses: Record<string, { addrText: string; addrDetail?: string }>;
  tabNameMap?: Record<string, string>;
  onConfirmContinue: () => void;
  onSelectChangeTab: (tabKey: string) => void;
  onClose?: () => void;
}

export function AppClntReq010101Modal({
  isOpen = false,
  duplicateTabs = [],
  tabAddresses = {},
  tabNameMap = {
    REGULAR: '정기청소',
    MOVEIN: '입주/이사 청소',
    APPLIANCE: '계절 가전 청소',
  },
  onConfirmContinue,
  onSelectChangeTab,
  onClose,
}: AppClntReq010101ModalProps) {
  const [step, setStep] = useState<'CONFIRM' | 'SELECT_TAB'>('CONFIRM');

  useEffect(() => {
    if (isOpen) {
      setStep('CONFIRM');
    }
  }, [isOpen]);

  if (!isOpen || !duplicateTabs || duplicateTabs.length === 0) return null;

  const firstDupTab = duplicateTabs[0];
  const sampleAddr = tabAddresses[firstDupTab] || { addrText: '' };
  const duplicateTabNames = duplicateTabs.map((t) => tabNameMap[t] || t);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      id="modal-app-clnt-req-010101"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-left animate-in zoom-in-95 duration-150">
        {step === 'CONFIRM' ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <span className="material-symbols-outlined text-2xl">pin_drop</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  APP-CLNT-REQ-010101
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                  동일 시공 현장 주소 확인
                </h3>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-3.5">
              <p className="text-xs font-semibold text-amber-900 mb-1.5">
                입력된 청소 요청 탭 목록:
              </p>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {duplicateTabs.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 border border-amber-200"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {t === 'REGULAR' ? 'update' : t === 'MOVEIN' ? 'home_work' : 'mode_fan'}
                    </span>
                    {tabNameMap[t] || t}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-amber-200/60 leading-relaxed">
                <div className="font-bold text-slate-900">{sampleAddr.addrText}</div>
                {sampleAddr.addrDetail && (
                  <div className="text-slate-500 mt-0.5">{sampleAddr.addrDetail}</div>
                )}
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800 text-center mb-5 leading-relaxed">
              입력하신 [{duplicateTabNames.join(', ')}] 탭의 시공 주소가 동일합니다.<br />
              <span className="text-secondary font-extrabold">동일한 주소로 계속 등록하시겠습니까?</span>
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStep('SELECT_TAB')}
                className="py-3 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                아니요 (주소 변경)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof onConfirmContinue === 'function') {
                    onConfirmContinue();
                  }
                }}
                className="py-3 px-3 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                네 (계속 등록)
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">edit_location</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                  APP-CLNT-REQ-010101
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                  주소 변경할 청소 탭 선택
                </h3>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-[35vh] overflow-y-auto">
              {duplicateTabs.map((t) => {
                const curAddr = tabAddresses[t] || { addrText: '' };
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      if (typeof onSelectChangeTab === 'function') {
                        onSelectChangeTab(t);
                      }
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-secondary hover:bg-secondary/5 text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1 font-bold text-xs text-slate-800 group-hover:text-secondary">
                        <span className="material-symbols-outlined text-[16px]">
                          {t === 'REGULAR' ? 'update' : t === 'MOVEIN' ? 'home_work' : 'mode_fan'}
                        </span>
                        <span>{tabNameMap[t] || t} 주소 변경</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 pl-5 line-clamp-1">
                        현재: {curAddr.addrText}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-secondary text-[18px]">
                      arrow_forward_ios
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep('CONFIRM')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer text-center"
            >
              ← 이전 질문으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AppClntReq010101Modal;

