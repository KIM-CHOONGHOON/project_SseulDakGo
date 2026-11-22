import React, { useState } from 'react';

/**
 * ============================================================================
 * [프론트엔드 모달 컴포넌트]
 * 화면 ID: WEB-SRVC-JOB-020100
 * 화면명: 현장 시공 사진 첨부 모달 (On-Site Cleaning Photo Upload Modal)
 * 파일 경로: SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020100/index.jsx
 * 연동 API: POST /api/web/service/job_020100
 * ============================================================================
 */
export default function WebSrvcJob020100Modal({
  isOpen,
  onClose,
  jobData,
  onSuccess
}) {
  const [activeTab, setActiveTab] = useState('ING'); // 'BEFORE', 'ING', 'AFTER'
  const [photos, setPhotos] = useState([
    { id: 1, phase: 'BEFORE', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80', caption: '시공 전 상가 복도 바닥 찌든때', isRep: true },
    { id: 2, phase: 'BEFORE', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80', caption: '시공 전 계단실 난간 분진', isRep: false },
    { id: 3, phase: 'ING', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80', caption: '고압 세척 및 바닥 박리 작업 중', isRep: false },
    { id: 4, phase: 'ING', url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&auto=format&fit=crop&q=80', caption: '2층 복도 친환경 왁싱 코팅 중', isRep: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentTabPhotos = photos.filter(p => p.phase === activeTab);

  const handleAddSamplePhoto = () => {
    if (photos.length >= 20) {
      alert('최대 20장까지만 첨부할 수 있습니다.');
      return;
    }
    const sampleUrls = [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80'
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const newPhoto = {
      id: Date.now(),
      phase: activeTab,
      url: randomUrl,
      caption: `${activeTab === 'BEFORE' ? '시공 전' : activeTab === 'ING' ? '시공 중' : '시공 후'} 현장 확인 사진`,
      isRep: photos.length === 0
    };
    setPhotos([...photos, newPhoto]);
  };

  const handleDeletePhoto = (id) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const handleSetRepresentative = (id) => {
    setPhotos(photos.map(p => ({
      ...p,
      isRep: p.id === id
    })));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/web/service/job_020100', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo: jobData?.orderNo || 'SDG-2026-1120',
          contractorNo: 'S20261100001',
          photoPhase: activeTab,
          photos
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || '시공 사진이 안전하게 등록되었습니다.');
        if (onSuccess) onSuccess(photos.length);
        onClose();
      } else {
        alert(data.message || '사진 등록에 실패했습니다.');
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#006a61] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">현장 시공 사진 첨부 [WEB-SRVC-JOB-020100]</h3>
              <p className="text-xs text-slate-500">주문번호: {jobData?.orderNo || 'SDG-2026-1120'} · 고객: {jobData?.clientName || '김충훈'} 님</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 3단 시공 구간 탭 */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-2 bg-white">
          <button
            onClick={() => setActiveTab('BEFORE')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'BEFORE'
                ? 'border-[#006a61] text-[#006a61]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>시공 전 (Before)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {photos.filter(p => p.phase === 'BEFORE').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ING')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ING'
                ? 'border-[#006a61] text-[#006a61]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>시공 중 (Ing)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-[#006a61] font-bold">
              {photos.filter(p => p.phase === 'ING').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('AFTER')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'AFTER'
                ? 'border-[#006a61] text-[#006a61]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>시공 후 (After)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {photos.filter(p => p.phase === 'AFTER').length}
            </span>
          </button>
        </div>

        {/* 모달 본문: 업로드 드롭존 및 썸네일 그리드 */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 업로드 액션 버튼 영역 */}
          <div
            onClick={handleAddSamplePhoto}
            className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-5 text-center cursor-pointer hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[28px] text-[#006a61]">add_photo_alternate</span>
            <p className="text-xs font-bold text-slate-700 mt-1">현장 사진 추가 / 카메라 촬영 등록</p>
            <p className="text-[11px] text-slate-500">클릭하여 사진을 추가합니다 (최대 20장, 장당 15MB 제한)</p>
          </div>

          {/* 사진 썸네일 리스트 */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span>{activeTab === 'BEFORE' ? '시공 전' : activeTab === 'ING' ? '시공 중' : '시공 후'} 등록 사진 목록</span>
              <span className="text-[11px] font-normal text-slate-400">총 {photos.length}장 등록됨 / 최대 20장</span>
            </div>

            {currentTabPhotos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                등록된 사진이 없습니다. 상단 추가 영역을 클릭해 사진을 등록해주세요.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentTabPhotos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs flex flex-col">
                    <div className="h-28 w-full overflow-hidden relative">
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {photo.isRep && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#006a61] text-white text-[10px] font-bold shadow-xs">
                          대표사진
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                    <div className="p-2 bg-white flex flex-col gap-1">
                      <p className="text-[11px] text-slate-700 line-clamp-1 font-medium">{photo.caption}</p>
                      <button
                        type="button"
                        onClick={() => handleSetRepresentative(photo.id)}
                        className={`text-[10px] font-bold text-left ${photo.isRep ? 'text-[#006a61]' : 'text-slate-400 hover:text-slate-700'}`}
                      >
                        {photo.isRep ? '✓ 대표사진 지정됨' : '대표사진으로 지정'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 하단 제어 바 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            전체: <strong className="text-slate-900 font-bold">{photos.length}</strong>장 업로드됨
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006a61] hover:bg-[#004f48] text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>{isSubmitting ? '저장 중...' : '사진 등록 완료'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
