import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * [프론트엔드 모달 화면]
 * 화면 ID: WEB-CLNT-REQ-010101
 * 한글 화면명: 동일 시공 현장 주소 확인 및 변경 안내 모달
 * 파일 경로: SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010101/index.jsx
 * 상위 부모 화면: WEB-CLNT-REQ-010100 (청소 서비스 신청 및 발주서 작성)
 * 연동 백엔드 API: POST /api/web/client/req_010101
 * ============================================================================
 */
export default function WebClntReq010101Modal({
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
}) {
  const [step, setStep] = useState('CONFIRM'); // 'CONFIRM' | 'SELECT_TAB'

  // 모달 오픈 시 기본 단계 'CONFIRM'으로 초기화
  useEffect(() => {
    if (isOpen) {
      setStep('CONFIRM');
    }
  }, [isOpen]);

  if (!isOpen || !duplicateTabs || duplicateTabs.length === 0) return null;

  const firstDupTab = duplicateTabs[0];
  const sampleAddr = tabAddresses[firstDupTab] || {};
  const duplicateTabNames = duplicateTabs.map((t) => tabNameMap[t] || t);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      id="modal-web-clnt-req-010101"
      onClick={(e) => {
        // 백드롭 클릭으로 임의 닫힘 방지
        e.stopPropagation();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left animate-in zoom-in-95 duration-150">
        {step === 'CONFIRM' ? (
          <>
            {/* 1. 상단 안내 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <span className="material-symbols-outlined text-2xl">pin_drop</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    WEB-CLNT-REQ-010101
                  </span>
                  <span className="text-xs text-slate-400">정합성 검증</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                  동일 시공 현장 주소 확인
                </h3>
              </div>
            </div>

            {/* 2. 감지된 탭 및 동일 주소 정보 박스 */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-amber-900 mb-2">
                입력된 청소 요청 탭 목록:
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {duplicateTabs.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 border border-amber-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {t === 'REGULAR' ? 'update' : t === 'MOVEIN' ? 'home_work' : 'mode_fan'}
                    </span>
                    {tabNameMap[t] || t}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200/60">
                <div className="font-bold text-slate-900">
                  {sampleAddr.addrText || '입력된 주소'}
                </div>
                {sampleAddr.addrDetail && (
                  <div className="text-slate-500 mt-0.5">
                    {sampleAddr.addrDetail}
                  </div>
                )}
              </div>
            </div>

            {/* 3. 질문 문구 */}
            <p className="text-sm font-bold text-slate-800 text-center mb-6 leading-relaxed">
              입력하신 [{duplicateTabNames.join(', ')}] 탭의 시공 주소가 동일합니다.<br />
              <span className="text-secondary font-extrabold">동일한 주소로 계속 등록하시겠습니까?</span>
            </p>

            {/* 4. 액션 버튼 (아니요 / 네) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep('SELECT_TAB')}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all cursor-pointer text-center active:scale-[0.98]"
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
                className="py-3 px-4 rounded-xl bg-secondary hover:bg-on-secondary-container text-white font-bold text-sm shadow-md transition-all cursor-pointer text-center active:scale-[0.98]"
              >
                네 (계속 등록)
              </button>
            </div>
          </>
        ) : (
          <>
            {/* SELECT_TAB 단계: 주소 변경할 탭 선택 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">edit_location</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">
                  WEB-CLNT-REQ-010101
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                  주소 변경할 청소 탭 선택
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  주소를 다르게 지정할 청소 서비스를 선택해 주세요.
                </p>
              </div>
            </div>

            {/* 탭 선택 리스트 */}
            <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto">
              {duplicateTabs.map((t) => {
                const currentAddr = tabAddresses[t] || {};
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      if (typeof onSelectChangeTab === 'function') {
                        onSelectChangeTab(t);
                      }
                    }}
                    className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-secondary hover:bg-secondary/5 text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 group-hover:text-secondary">
                        <span className="material-symbols-outlined text-[18px]">
                          {t === 'REGULAR' ? 'update' : t === 'MOVEIN' ? 'home_work' : 'mode_fan'}
                        </span>
                        <span>{tabNameMap[t] || t} 주소 변경</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 pl-6 line-clamp-1">
                        현재: {currentAddr.addrText} {currentAddr.addrDetail || ''}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-secondary text-[20px] shrink-0">
                      arrow_forward_ios
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 이전으로 돌아가기 버튼 */}
            <button
              type="button"
              onClick={() => setStep('CONFIRM')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer text-center transition-colors"
            >
              ← 이전 질문으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const WebClntReq010101 = WebClntReq010101Modal;

