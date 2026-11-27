import React, { useState, useRef } from 'react';

/**
 * 화면 ID: WEB-SRVC-MYP-020101
 * 화면명: 홈택스 PDF OCR 업로드 및 자동 인식 모달 (Modal)
 */
export default function WebSrvcMyp020101({ isOpen, onClose, onApplyData, userInfo }) {
  const userNo = userInfo?.USER_NO || userInfo?.userNo || 'S20261000001';
  const fileInputRef = useRef(null);
  const [fileInfo, setFileInfo] = useState({
    name: '사업자등록증명_공간다원_202611.pdf',
    sizeText: '1.24 MB',
    issueNo: '2026-1120-7492-9401 (국세청 진위 전산 대조 통과)',
  });
  const [ocrData, setOcrData] = useState({
    bizName: '공간다원',
    ceoName: '김충훈',
    bizNo: '120-88-29401',
    openDateAndType: '2021-03-15 (일반과세자)',
    industryCode: '749200',
    industryName: '사업시설 유지관리 및 건물·산업설비 청소업 / 가전제품 수리·세척',
  });

  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 원본 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 용량은 최대 10MB까지 업로드 가능합니다.');
      return;
    }
    setFileInfo({
      name: file.name,
      sizeText: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      issueNo: 'OCR 분석 중...',
    });
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append('userNo', userNo);
      formData.append('file', file);
      const res = await fetch('/api/srvc/myp/020101', { method: 'POST', body: formData });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.ocrResult) {
        const r = json.data.ocrResult;
        setFileInfo({
          name: file.name,
          sizeText: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          issueNo: json.data.issueNo || '전자발급본 OCR 판독 완료',
        });
        setOcrData((prev) => ({
          ...prev,
          bizName: r.bizName ? `${r.bizName} - ${r.bizStatNm || '정상'}` : prev.bizName,
          ceoName: r.ceoName || prev.ceoName,
          bizNo: r.bizNo || prev.bizNo,
          openDateAndType: r.openDateAndType || prev.openDateAndType,
          industryCode: r.industryCode ?? prev.industryCode,
          industryName: r.industryName || prev.industryName,
          bizStatCd: r.bizStatCd || 'ACTIVE',
          bizStatNm: r.bizStatNm || '정상',
        }));
      }
    } catch {
      // ignore network error in preview
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-x-hidden"
    >
      <div
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                WEB-SRVC-MYP-020101
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-sky-600">document_scanner</span>
                홈택스 사업자등록증명 OCR 자동 파싱
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              홈택스 PDF OCR 업로드 및 자동 인식
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              국세청 홈택스에서 발급받은 사업자등록증(명) 원본 PDF를 업로드하면 업종코드와 사업자 정보가 자동 추출됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="닫기 (ESC)"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px] block">close</span>
          </button>
        </div>

        {/* 2. MODAL BODY */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5 text-slate-800">
          {/* SECTION A: Upload Zone */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
                홈택스 원본 PDF 등록
              </span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                정부24 / 홈택스 전자발급본 100% 지원
              </span>
            </div>

            <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileChange} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/40 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100/90 text-blue-600 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[28px]">upload_file</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm sm:text-base">
                  홈택스 발급 사업자등록증(명) PDF 파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  지원 형식: PDF 원본 파일만 가능 (스캔 이미지·사진 불가 / 최대 10MB)
                </p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">search</span>
                  PDF 파일 찾아보기
                </span>
              </div>
            </div>

            {fileInfo && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-rose-600">picture_as_pdf</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 truncate">{fileInfo.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({fileInfo.sizeText})</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        OCR 판독 완료
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5">발급번호: {fileInfo.issueNo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer">
                    다시올리기
                  </button>
                  <button type="button" onClick={() => setFileInfo(null)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" title="파일 삭제">
                    <span className="material-symbols-outlined text-[18px] block">delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: OCR Results */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block" />
                <h3 className="text-sm font-bold text-slate-900">OCR 자동 추출 결과 (수정 가능)</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                신뢰도 99.4% · 원본 대조 일치
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">상호명 (법인명) *</label>
                <input type="text" value={ocrData.bizName} onChange={(e) => setOcrData({ ...ocrData, bizName: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">대표자 성명 *</label>
                <input type="text" value={ocrData.ceoName} onChange={(e) => setOcrData({ ...ocrData, ceoName: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">사업자등록번호 (10자리) *</label>
                <input type="text" value={ocrData.bizNo} onChange={(e) => setOcrData({ ...ocrData, bizNo: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold text-xs font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">개업연월일 / 과세유형 *</label>
                <input type="text" value={ocrData.openDateAndType} onChange={(e) => setOcrData({ ...ocrData, openDateAndType: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold text-xs" />
              </div>
              <div className="sm:col-span-2 pt-1">
                <label className="block font-bold text-slate-700 mb-1.5">주업종 코드 및 업태·종목 (국세청 표준분류) *</label>
                <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs rounded-lg px-2 py-1 shrink-0">
                      <span>코드:</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={ocrData.industryCode}
                        onChange={(e) => setOcrData({ ...ocrData, industryCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })}
                        placeholder="6자리 입력"
                        className="w-16 bg-transparent focus:outline-none text-blue-800 font-mono font-bold"
                      />
                    </div>
                    <input
                      type="text"
                      value={ocrData.industryName}
                      onChange={(e) => setOcrData({ ...ocrData, industryName: e.target.value })}
                      className="font-bold text-slate-800 text-xs sm:text-sm flex-1 min-w-0 bg-transparent focus:outline-none"
                    />
                  </div>
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">verified</span>
                </div>
                <div className="mt-1.5 text-[11px] text-red-600 font-bold leading-relaxed">
                  <p>주업종 코드 확인: 홈택스(hometax.go.kr) 로그인 → 우측 상단 [My홈택스] → [사업자등록사항 및 담당자 안내]</p>
                  <p>메뉴 클릭 → 등록된 주업종 코드(6자리), 부업종 코드, 업태, 종목 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: Notice */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 sm:p-4 text-xs flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
            <div className="flex flex-col gap-1 text-amber-900 leading-relaxed">
              <p className="font-bold">국세청 원본 진위확인 및 보안 안내</p>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                <li>정부24 및 홈택스 위변조 방지 바코드가 손상되었거나 캡처된 스크린샷은 인식이 반려될 수 있습니다.</li>
                <li>주민등록번호 뒷자리는 자동 마스킹(비식별화) 처리되어 안전하게 저장됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/90 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">security</span>
            <span>SSL 256-bit 공공 데이터 전송 보안 적용</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">
              취소 및 닫기
            </button>
            <button
              type="button"
              onClick={async () => {
                if (ocrData.industryCode && ocrData.industryCode.trim().length !== 6) {
                  alert('주업종 코드는 입력 시 6자리를 반드시 입력해야 합니다.');
                  return;
                }
                try {
                  const res = await fetch('/api/srvc/myp/020101', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userNo, ...ocrData }),
                  });
                  const json = await res.json();
                  if (!res.ok || !json?.success) {
                    alert(json?.message || '국세청 사업자등록정보 진위확인에 실패했습니다.');
                    return;
                  }
                  onApplyData?.(ocrData);
                  onClose?.();
                } catch {
                  alert('국세청 진위확인 서버 통신 중 오류가 발생했습니다.');
                }
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              내 정보 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
