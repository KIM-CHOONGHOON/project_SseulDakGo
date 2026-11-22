import React, { useState } from 'react';

/**
 * ============================================================================
 * [프론트엔드 모달 컴포넌트]
 * 화면 ID: WEB-SRVC-JOB-020200
 * 화면명: 현장 시공 완료 등록 모달 (Final Cleaning Completion & Inspection Request Modal)
 * 파일 경로: SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020200/index.jsx
 * 연동 API: POST /api/web/service/job_020200
 * ============================================================================
 */
export default function WebSrvcJob020200Modal({
  isOpen,
  onClose,
  jobData,
  onSuccess
}) {
  const [checklists, setChecklists] = useState([
    { id: 1, text: '상가 1~2층 복도 및 계단실 바닥 먼지 흡입 및 왁싱 건조 완료', checked: true },
    { id: 2, text: '남녀 화장실 2개소 고온 스팀 살균 및 위생 소모품 교체', checked: true },
    { id: 3, text: '1층 로비 출입문 유리창 지문 제거 및 피톤치드 분무 소독', checked: true },
    { id: 4, text: '수거된 재활용 쓰레기 규격 봉투 분리 배출 완료', checked: true },
  ]);
  const [notes, setNotes] = useState('상가 1~2층 복도 왁싱 건조 작업 완료되었습니다. 화장실 소독 및 쓰레기 분리수거 완료했습니다.');
  const [sendPush, setSendPush] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleCheck = (id) => {
    setChecklists(checklists.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const isAllChecked = checklists.every(c => c.checked);

  const handleSubmit = async () => {
    if (!isAllChecked) {
      alert('모든 필수 시공 완료 체크리스트를 확인해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/web/service/job_020200', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo: jobData?.orderNo || 'SDG-2026-1120',
          contractorNo: 'S20261100001',
          managerName: jobData?.contractor?.managerName || '김태호 팀장',
          completionNotes: notes,
          sendPushToClient: sendPush
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || '시공 완료 등록이 정상 처리되었습니다.');
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        alert(data.message || '완료 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">현장 시공 완료 등록 [WEB-SRVC-JOB-020200]</h3>
              <p className="text-xs text-slate-500">주문번호: {jobData?.orderNo || 'SDG-2026-1120'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 현장 요약 카드 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>발주고객</span>
              <strong className="text-slate-900 font-bold">{jobData?.clientName || '김충훈'} 님 (안심번호 0504)</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>현장주소</span>
              <span className="text-slate-800 font-medium text-right line-clamp-1">{jobData?.siteAddress || '경기 고양시 일산동구 백석동 120-1'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>시공담당</span>
              <span className="text-[#006a61] font-bold">{jobData?.contractor?.companyName || '공간다원 시공팀'} ({jobData?.contractor?.managerName || '김태호 팀장'})</span>
            </div>
          </div>

          {/* 4대 완료 체크리스트 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#003d9b]">checklist</span>
                시공 완료 4대 필수 체크리스트
              </label>
              <span className={`text-[11px] font-bold ${isAllChecked ? 'text-[#006a61]' : 'text-amber-600'}`}>
                {checklists.filter(c => c.checked).length} / {checklists.length} 확인됨
              </span>
            </div>
            <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
              {checklists.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 rounded text-[#003d9b] focus:ring-[#003d9b] cursor-pointer"
                  />
                  <span className={`${item.checked ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 인수인계 특이사항 메모 */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              인수인계 및 특이사항 메모 (고객 전달)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="고객님께 전달할 현장 특이사항이나 관리 팁을 작성하세요."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b]"
            />
          </div>

          {/* 실시간 알림 발송 옵션 */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="sendPushCheck"
              checked={sendPush}
              onChange={(e) => setSendPush(e.target.checked)}
              className="rounded text-[#003d9b] focus:ring-[#003d9b] cursor-pointer"
            />
            <label htmlFor="sendPushCheck" className="text-xs text-slate-700 cursor-pointer">
              등록 즉시 고객님({jobData?.clientName || '김충훈'} 님)께 <strong>현장 최종검수 및 서명 요청 알림톡(Push/SMS)</strong>을 발송합니다.
            </label>
          </div>
        </div>

        {/* 하단 제어 바 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isSubmitting || !isAllChecked}
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 ${
              isAllChecked
                ? 'bg-[#003d9b] hover:bg-[#002b6e] cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{isSubmitting ? '처리 중...' : '최종 시공완료 등록'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
