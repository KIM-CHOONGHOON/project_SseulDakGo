import React from 'react';

/**
 * 화면 ID: WEB-CLNT-COM-010300
 * 화면명: 쓸고딱고 브랜드 로고 뷰어 (Modal)
 */
export default function WebClntCom010300({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-56 h-56 rounded-full overflow-hidden border border-slate-200 shadow-sm">
          <img
            src="/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg"
            alt="쓸고딱고 로고"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold shadow-sm transition cursor-pointer"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
