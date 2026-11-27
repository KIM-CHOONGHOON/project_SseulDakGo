import React, { useState, useEffect, useRef } from 'react';

/**
 * 화면 ID: WEB-SRVC-COM-010100
 * 화면명: 파트너 대표 로고 이미지 변경 (Modal)
 */
export default function WebSrvcCom010100({ isOpen, userInfo, onClose, onSuccess }) {
  const userNo = userInfo?.USER_NO || userInfo?.userNo || 'S20261100001';
  const companyNm = userInfo?.COMPANY_NM || userInfo?.USER_NM || '(주)클린파트너스';

  const fileInputRef = useRef(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [stagedMeta, setStagedMeta] = useState({ name: '선택된 파일 없음', sizeText: 'JPG, PNG, WEBP (최대 5MB)' });
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch(`/api/srvc/com/010100?userNo=${encodeURIComponent(userNo)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.success) return;
        setCurrentLogoUrl(data.data?.currentLogoUrl || null);
      })
      .catch(() => {});

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, userNo, onClose]);

  if (!isOpen) return null;

  const processFile = (file) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('지원되지 않는 파일 형식입니다. (PNG, JPG, WEBP만 가능)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('파일 크기는 5MB 이하만 업로드 됩니다');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setStagedMeta({
      name: file.name,
      sizeText: `(${Math.round(file.size / 1024)} KB)`,
    });
    showToast(`새 로고 파일 [${file.name}]이(가) 정상적으로 로드되었습니다.`);
  };

  const handleResetDefault = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/srvc/com/010100?userNo=${encodeURIComponent(userNo)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCurrentLogoUrl(null);
        setStagedMeta({ name: '공식 파트너 기본 뱃지 (시스템 표준)', sizeText: '(Default Vector)' });
        showToast('기본 공간다원 인증 파트너 뱃지로 초기화되었습니다.');
        if (onSuccess) onSuccess(null);
      } else {
        showToast(data?.message || '초기화 처리 중 오류가 발생했습니다.');
      }
    } catch {
      showToast('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLogo = async () => {
    if (!selectedFile) {
      showToast('변경할 대표 로고 이미지 파일을 먼저 선택해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userNo', userNo);
      formData.append('logoFile', selectedFile);

      const res = await fetch('/api/srvc/com/010100', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        showToast('대표 로고 이미지가 성공적으로 변경되었습니다.');
        if (onSuccess) onSuccess(data.data?.logoImgUrl || previewUrl);
        setTimeout(() => {
          if (onClose) onClose();
        }, 800);
      } else {
        showToast(data?.message || '로고 저장 중 오류가 발생했습니다.');
      }
    } catch {
      showToast('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-60 bg-white/95 border border-emerald-300 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-slate-800">
          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        <header className="px-6 sm:px-7 py-5 border-b border-slate-100 bg-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold font-mono bg-sky-50 text-sky-700 border border-sky-200">
                WEB-SRVC-COM-010100
              </span>
              <span className="text-slate-300 text-xs font-bold">·</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                <span className="material-symbols-outlined text-[15px] text-teal-600">verified</span>
                시공사 프로필 브랜딩 관리
              </span>
            </div>
            <h1 id="modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              파트너 대표 로고 이미지 변경
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              고객이 청약 시공사를 선택할 때 프로필 카드와 상세 견적서에 노출되는 우리 업체만의 대표 로고 이미지를 등록·변경합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 -mr-1.5 -mt-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>

        <div className="overflow-y-auto p-6 sm:p-7 flex flex-col gap-6">
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-sky-600">compare</span>
                현재 로고 vs 변경 미리보기
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">플랫폼 공통 규격: 1:1 원형 렌더링</span>
            </div>

            <div className="bg-gradient-to-b from-slate-50/90 to-slate-100/70 border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex items-center justify-around gap-4 shadow-inner">
              <div className="flex flex-col items-center text-center gap-2 flex-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                  {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="현재 대표 로고" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-2 text-slate-600">
                      <span className="material-symbols-outlined text-3xl text-slate-400">apartment</span>
                      <span className="text-[10px] font-extrabold text-slate-500 mt-0.5 truncate max-w-[72px]">{companyNm}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-600">현재 대표 로고</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-sky-600 text-lg">arrow_forward</span>
              </div>

              <div className="flex flex-col items-center text-center gap-2 flex-1">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-teal-500 ring-4 ring-teal-500/15 shadow-md flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="새 로고 미리보기" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex flex-col items-center justify-center p-2 text-white">
                        <span className="material-symbols-outlined text-3xl">cleaning_services</span>
                        <span className="text-[10px] font-black uppercase">CLEAN PRO</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold border border-white">
                    NEW
                  </span>
                </div>
                <span className="text-xs font-bold text-teal-700">변경 적용 미리보기</span>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-sky-600">cloud_upload</span>
                새 대표 로고 이미지 파일 등록
              </h2>
              <span className="text-[11px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                권장 400 × 400px 이상
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                processFile(f);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                processFile(e.dataTransfer.files?.[0]);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                isDragging ? 'border-sky-500 bg-sky-100/40 scale-[1.01]' : 'border-sky-300 hover:border-sky-500 bg-sky-50/25'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">변경할 파트너 대표 로고 이미지를 드래그하거나 클릭하여 선택하세요</p>
                <p className="text-xs text-slate-500 mt-1">
                  권장 비율: 1:1 정사각형 · 지원 형식: <span className="font-mono">JPG, PNG, WEBP</span> (최대 5MB)
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-sky-600">folder_open</span>
                  <span>이미지 파일 선택하기</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>기본 파트너 뱃지로 초기화</span>
                </button>
              </div>
            </div>

            <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate">
                선택된 파일: <strong className="font-mono text-slate-900">{stagedMeta.name}</strong>{' '}
                <span className="text-slate-400 font-mono text-[11px]">{stagedMeta.sizeText}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                규격 적합
              </span>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-teal-600">visibility</span>
                고객 청약 선택 화면 노출 미리보기
              </h2>
              <span className="text-[11px] font-mono text-slate-400">WEB-CLNT-ORD-010100 연동</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full border-2 border-teal-500 bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white overflow-hidden shrink-0">
                  {previewUrl || currentLogoUrl ? (
                    <img src={previewUrl || currentLogoUrl} alt="고객 노출 미리보기" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl">cleaning_services</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{companyNm}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      사업자 인증완료
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">★ 4.9 · 단독 청약 체결 128건 · 입주청소 1급</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                고객 발주서 뷰
              </span>
            </div>
          </section>
        </div>

        <footer className="px-6 sm:px-7 py-4 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-600">POST</span>
            <span>/api/srvc/com/010100</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300/80 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitLogo}
              className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">check_circle</span>
              <span>{isSubmitting ? '저장 중...' : '대표 로고 이미지 저장하기'}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
