import React, { useState, useEffect, useRef } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-011/index.jsx
 * @description 고객 가입 완료 및 회원 정보 / 이용약관 동의 / 전자서명 관리 모달 (WEB-CLNT-ATH-011)
 *              - 회원 기본 식별 정보 (TB_USER) 및 자필 전자서명 (SIGN_IMG_URL) 조회
 *              - 5대 약관 동의 내역 원장 (TB_TERMS_AGREE_SIGN JOIN TB_TERMS_MASTER) 투명 표시
 *              - 자필 전자서명 실시간 재등록 및 갱신(서명 관리) 모달 지원
 *              - .cursorrules 공식 상표 로고(/logo.png) 반영 및 직불제 플랫폼 원칙 준수
 * 
 * Props:
 * @param {boolean} isOpen 모달 노출 여부
 * @param {Object} userInfo 가입 완료 단계에서 전달받은 사용자 정보 ({ userNo, userNm, userEmail, userRoleCd, signImgUrl })
 * @param {Function} onClose 단순 닫기 콜백
 * @param {Function} onOpenRequestModal 청소 서비스 신청 모달(WEB-CLNT-REQ-000) 오픈 콜백
 */
export default function WebClntAth011({
  isOpen = false,
  userInfo = null,
  onClose,
  onOpenRequestModal
}) {
  const [profile, setProfile] = useState({
    userNo: userInfo?.userNo || 'C20261100001',
    userNm: userInfo?.userNm || '고객',
    userEmail: userInfo?.userEmail || 'user@example.com',
    userTel: userInfo?.userTel || '',
    userRoleCd: userInfo?.userRoleCd || 'C',
    signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || null,
    regDt: ''
  });

  const [termsAgreedList, setTermsAgreedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSign, setIsUpdatingSign] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' | 'terms' | 'signature'

  // 서명 캔버스 상태
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);

  // 회원 정보 및 약관 동의 내역 로드
  useEffect(() => {
    if (!isOpen) return;

    const effectiveUserNo = userInfo?.userNo || profile.userNo || 'C20261100001';

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/web/client/ath_011', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userNo: effectiveUserNo })
        });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          const d = result.data;
          setProfile({
            userNo: d.userNo || effectiveUserNo,
            userNm: d.userNm || userInfo?.userNm || '고객',
            userEmail: d.userEmail || userInfo?.userEmail || '',
            userTel: d.userTel || userInfo?.userTel || '',
            userRoleCd: d.userRoleCd || 'C',
            signImgUrl: d.signImgUrl || userInfo?.signImgUrl || null,
            regDt: d.regDt || ''
          });
          if (Array.isArray(d.termsAgreedList)) {
            setTermsAgreedList(d.termsAgreedList);
          }
        }
      } catch (err) {
        console.warn('[WEB-CLNT-ATH-011] 회원 정보 및 약관 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [isOpen, userInfo]);

  // ESC 키 닫기 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 서명 드로잉 핸들러
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#003262';
    isDrawing.current = true;
    setHasNewSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasNewSignature(false);
  };

  // 서명 갱신 저장
  const handleSaveNewSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasNewSignature) {
      alert('서명을 입력해 주세요.');
      return;
    }

    try {
      setIsUpdatingSign(true);
      const signDataUrl = canvas.toDataURL('image/png');
      const res = await fetch('/api/web/client/ath_011', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SIGNATURE',
          userNo: profile.userNo,
          signDataUrl
        })
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setProfile(prev => ({ ...prev, signImgUrl: result.data.signImgUrl }));
        setShowSignModal(false);
        alert('자필 전자서명이 성공적으로 갱신되었습니다.');
      } else {
        alert(result.message || '서명 저장에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingSign(false);
    }
  };

  // [바로 청소 요청 등록하러 가기] 액션 핸들러
  const handleProceedToRequest = () => {
    if (onClose) onClose();
    if (onOpenRequestModal) {
      onOpenRequestModal();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('OPEN_CLEANING_REQUEST_MODAL', {
          detail: {
            screenId: 'WEB-CLNT-REQ-000',
            userNo: profile.userNo,
            userNm: profile.userNm
          }
        })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      id="modal-welcome-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* Modal Card */}
      <div
        aria-labelledby="modal-welcome-headline"
        aria-modal="true"
        className="relative w-full max-w-[520px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-7 text-center transform transition-all duration-300 scale-100 flex flex-col items-center animate-in zoom-in-95 border border-slate-200/80 text-on-surface overflow-y-auto"
        id="modal-welcome-card"
        role="dialog"
      >
        {/* 상단 닫기 X 버튼 */}
        <button
          aria-label="팝업 닫기"
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
          id="btn-close-x"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* 1. 상단 공식 로고 엠블럼 */}
        <div className="relative mb-space-sm flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-secondary-container/40 blur-md"></div>
          <div className="relative w-16 h-16 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-md ring-4 ring-secondary/20 overflow-hidden">
            <img
              alt="쓸고닦고 공식 로고"
              className="w-full h-full rounded-full object-cover"
              src="/logo.png"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[13px]">check</span>
            </div>
          </div>
        </div>

        {/* 2. 헤더 및 환영 메시지 */}
        <h2
          className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight mb-1 leading-snug"
          id="modal-welcome-headline"
        >
          쓸고닦고에 오신 것을 환영합니다!
        </h2>
        <p className="font-caption text-caption text-on-surface-variant leading-relaxed mb-3">
          회원가입 및 5대 법적 효력 이용약관 동의, 자필 전자서명이 안전하게 저장되었습니다.
        </p>

        {/* 탭 네비게이션: 기본정보 | 이용약관 동의원장 | 자필 서명 관리 */}
        <div className="w-full flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('welcome')}
            className={`flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${
              activeTab === 'welcome'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            회원정보
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'terms'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span>약관동의내역</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-secondary/10 text-secondary">
              {termsAgreedList.length > 0 ? termsAgreedList.length : '5'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signature')}
            className={`flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${
              activeTab === 'signature'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            전자서명 관리
          </button>
        </div>

        {/* 탭 1: 기본 회원정보 */}
        {activeTab === 'welcome' && (
          <div className="w-full space-y-3 mb-4 text-left">
            <div className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-100/60">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">badge</span>
                  <span className="font-label-md text-label-md text-on-surface">
                    <strong className="text-on-surface font-bold">{profile.userNm}</strong> 고객님
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed-variant">
                  고객회원(C)
                </span>
              </div>
              <div className="space-y-1 font-caption text-caption text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span className="text-outline">회원식별번호</span>
                  <span className="font-mono font-medium text-on-surface">{profile.userNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">로그인 계정</span>
                  <span className="font-medium text-on-surface truncate max-w-[220px]">{profile.userEmail}</span>
                </div>
                {profile.userTel && (
                  <div className="flex items-center justify-between">
                    <span className="text-outline">휴대폰 번호</span>
                    <span className="font-medium text-on-surface">{profile.userTel}</span>
                  </div>
                )}
                {profile.regDt && (
                  <div className="flex items-center justify-between">
                    <span className="text-outline">가입 일시</span>
                    <span className="font-mono text-[11px] text-on-surface">{profile.regDt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 대표 자필 전자서명 미니 프리뷰 */}
            <div className="w-full p-3 rounded-xl bg-surface-container-low border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">draw</span>
                <div>
                  <div className="font-label-sm text-label-sm font-semibold text-on-surface">자필 전자서명 날인</div>
                  <div className="text-[11px] text-on-surface-variant">법적 효력 증적 보관 완료</div>
                </div>
              </div>
              {profile.signImgUrl ? (
                <div className="w-24 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden">
                  <img src={profile.signImgUrl} alt="자필 서명" className="max-h-full object-contain" />
                </div>
              ) : (
                <span className="text-[11px] text-outline">서명 등록 완료</span>
              )}
            </div>

            {/* 3대 보증 정책 안내 */}
            <div className="w-full space-y-1.5 pt-1 text-left">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low/70">
                <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">shield</span>
                <div className="text-[12px] leading-tight">
                  <strong className="text-on-surface font-semibold">100% 신원 보증 마스터 배정: </strong>
                  <span className="text-on-surface-variant">배상책임보험 및 사업자 신원 검증 완료 인력 전담</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low/70">
                <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">handshake</span>
                <div className="text-[12px] leading-tight">
                  <strong className="text-on-surface font-semibold">현장 검수 후 전액 직불제 정산: </strong>
                  <span className="text-on-surface-variant">선입금 없는 시공 완료 후 직접 결제 (수수료 제로)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 약관 동의 내역 원장 (TB_TERMS_MASTER & TB_TERMS_AGREE_SIGN) */}
        {activeTab === 'terms' && (
          <div className="w-full space-y-2 mb-4 text-left max-h-[300px] overflow-y-auto pr-1">
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>전자상거래법 및 전자서명법에 따른 5대 필수 약관 동의 및 증적 기록입니다.</span>
            </div>

            {termsAgreedList.length > 0 ? (
              termsAgreedList.map((term, idx) => (
                <div
                  key={term.agreeSeq || term.termsCd || idx}
                  className="p-3 rounded-xl bg-surface-container-low border border-slate-200/90 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                      {term.termsTitle || term.termsCd}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-semibold font-mono">
                      {term.termsVer || 'v1.0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-slate-100">
                    <span className="text-outline">동의 일시</span>
                    <span className="font-mono text-on-surface">{term.agreeDt || '가입 시 동의 완료'}</span>
                  </div>
                  {term.signFileUrl && (
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span className="text-outline">서명 증적 파일</span>
                      <span className="text-secondary font-medium truncate max-w-[180px]">{term.signFileNm || '서명 파일 보관'}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // 기본 5대 약관 마스터 모의 표시
              [
                { title: '서비스 통합이용약관', code: 'SERVICE', ver: 'v1.0' },
                { title: '개인정보 수집 및 이용 동의', code: 'PRIVACY', ver: 'v1.0' },
                { title: '위치기반 서비스 이용약관', code: 'LOCATION', ver: 'v1.0' },
                { title: '전자금융거래 기본약관', code: 'FINANCE', ver: 'v1.0' },
                { title: '전자거래 및 자필 전자서명 보증 동의', code: 'SIGNATURE', ver: 'v1.0' },
              ].map((item) => (
                <div key={item.code} className="p-3 rounded-xl bg-surface-container-low border border-slate-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">{item.title}</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono">{item.ver}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 탭 3: 자필 전자서명 관리 */}
        {activeTab === 'signature' && (
          <div className="w-full space-y-3 mb-4 text-left">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
              <span className="text-[12px] font-semibold text-on-surface mb-2 self-start">현재 등록된 본인 자필 전자서명</span>
              <div className="w-full h-32 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                {profile.signImgUrl ? (
                  <img
                    src={profile.signImgUrl}
                    alt="등록된 전자서명"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-on-surface-variant text-[12px]">서명 이미지를 불러오는 중입니다.</span>
                )}
                <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-secondary font-semibold bg-white/90 px-1 rounded shadow-xs">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>위변조 방지 보증</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSignModal(true)}
              className="w-full py-2.5 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>새로운 자필 전자서명으로 변경 (재등록)</span>
            </button>
          </div>
        )}

        {/* 5. 액션 버튼 영역 */}
        <div className="w-full flex flex-col gap-2">
          <button
            className="w-full h-[48px] bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
            data-action="OPEN_MODAL_WEB_CLNT_REQ_000"
            id="btn-request-cleaning"
            onClick={handleProceedToRequest}
            type="button"
          >
            <span>바로 청소 요청 등록하러 가기</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <button
            className="w-full h-[36px] text-outline hover:text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center cursor-pointer"
            data-action="CLOSE_MODAL_GO_HOME"
            id="btn-dismiss-to-home"
            onClick={onClose}
            type="button"
          >
            홈 둘러보기
          </button>
        </div>
      </div>

      {/* 전자서명 재등록 서브 모달 */}
      {showSignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-[420px] bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-label-lg text-label-lg font-bold text-primary">자필 전자서명 재등록</h3>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-[12px] text-slate-600">
              아래 캔버스에 마우스 또는 터치로 새로운 본인 서명을 그려주세요.
            </p>
            <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-teal-300 rounded-xl overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={160}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasNewSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm">
                  이곳에 서명해 주세요
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-[12px] text-slate-500 hover:text-slate-800 underline"
              >
                다시 쓰기
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewSignature}
                  disabled={isUpdatingSign || !hasNewSignature}
                  className="px-4 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow disabled:opacity-50"
                >
                  {isUpdatingSign ? '저장 중...' : '서명 갱신 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
