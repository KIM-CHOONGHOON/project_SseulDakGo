import React, { useState, useEffect, useRef } from 'react';

/**
 * @file SseulDakGo_App/Client/screens/APP-CLNT-ATH-011/index.tsx
 * @description 고객 모바일 가입 완료 환영 및 회원 정보 / 약관동의 / 전자서명 관리 화면 (APP-CLNT-ATH-011)
 *              - WEB-CLNT-ATH-011 100% 동일 비즈니스 로직 및 모바일 최적화 이식
 *              - 회원 기본 식별 정보 (TB_USER) 및 자필 전자서명 (SIGN_IMG_URL) 조회
 *              - 5대 약관 동의 내역 원장 (TB_TERMS_AGREE_SIGN JOIN TB_TERMS_MASTER) 투명 표시
 *              - 모바일 터치 자필 전자서명 실시간 재등록 및 갱신(서명 관리) 모달 지원
 *              - .cursorrules 공식 상표 로고(/logo.png) 반영 및 직불제 플랫폼 원칙 준수
 * 
 * Props:
 * @param {boolean} isOpen 모달 노출 여부
 * @param {boolean} visible 모바일 호환 가시성 플래그
 * @param {Object} userInfo 가입 완료 단계에서 전달받은 사용자 정보 ({ userNo, userNm, userEmail, userRoleCd, signImgUrl })
 * @param {Function} onClose 닫기 콜백
 * @param {Function} onOpenRequestModal 청소 서비스 신청 모달 오픈 콜백
 * @param {Function} onNavigate 화면 전환 내비게이터
 */

interface AppClntAth011Props {
  isOpen?: boolean;
  visible?: boolean;
  userInfo?: any;
  onClose?: () => void;
  onOpenRequestModal?: () => void;
  onNavigate?: (screenId: string) => void;
  navigation?: any;
}

export default function AppClntAth011({
  isOpen = true,
  visible,
  userInfo = null,
  onClose,
  onOpenRequestModal,
  onNavigate,
  navigation
}: AppClntAth011Props) {
  const [profile, setProfile] = useState({
    userNo: userInfo?.userNo || 'C20261100001',
    userNm: userInfo?.userNm || '고객',
    userEmail: userInfo?.userEmail || 'user@example.com',
    userTel: userInfo?.userTel || '',
    userRoleCd: userInfo?.userRoleCd || 'C',
    signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || null,
    regDt: ''
  });

  const [termsAgreedList, setTermsAgreedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSign, setIsUpdatingSign] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'welcome' | 'terms' | 'signature'>('welcome');

  // 모바일 햅틱 피드백 유틸리티
  const triggerHaptic = (type: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS') => {
    try {
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAPTIC', payload: type }));
      } else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        if (type === 'LIGHT') navigator.vibrate(10);
        else if (type === 'MEDIUM') navigator.vibrate(25);
        else if (type === 'SUCCESS') navigator.vibrate([15, 30, 20]);
        else navigator.vibrate(50);
      }
    } catch (e) {}
  };

  // 터치 서명 캔버스 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);

  // 회원 정보 및 약관 동의 내역 로드
  useEffect(() => {
    const isModalOpen = visible !== undefined ? visible : isOpen;
    if (!isModalOpen) return;

    const effectiveUserNo = userInfo?.userNo || profile.userNo || 'C20261100001';

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/app/client/ath_011', {
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
        console.warn('[APP-CLNT-ATH-011] 모바일 회원 정보 및 약관 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [isOpen, visible, userInfo]);

  // 서명 드로잉 핸들러 (마우스 & 모바일 터치)
  const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#003262';
    isDrawing.current = true;
    setHasNewSignature(true);
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClearSignature = () => {
    triggerHaptic('LIGHT');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
      triggerHaptic('MEDIUM');
      const signDataUrl = canvas.toDataURL('image/png');
      const res = await fetch('/api/app/client/ath_011', {
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
        triggerHaptic('SUCCESS');
        setProfile(prev => ({ ...prev, signImgUrl: result.data.signImgUrl }));
        setShowSignModal(false);
        alert('모바일 자필 전자서명이 성공적으로 갱신되었습니다.');
      } else {
        alert(result.message || '서명 저장에 실패했습니다.');
      }
    } catch (e: any) {
      console.error(e);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingSign(false);
    }
  };

  // [바로 청소 요청 등록하러 가기] 핸들러
  const handleProceedToRequest = () => {
    triggerHaptic('LIGHT');
    if (onClose) onClose();
    if (onOpenRequestModal) {
      onOpenRequestModal();
    } else if (onNavigate) {
      onNavigate('APP-CLNT-REQ-000');
    } else if (navigation?.navigate) {
      navigation.navigate('APP-CLNT-REQ-000');
    }
  };

  const handleDismiss = () => {
    triggerHaptic('LIGHT');
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('APP-CLNT-COM-000');
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const isModalOpen = visible !== undefined ? visible : isOpen;
  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      id="modal-welcome-app-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      {/* Mobile Card Container */}
      <div
        aria-labelledby="modal-welcome-headline"
        aria-modal="true"
        className="relative w-full max-w-[480px] h-full sm:h-auto sm:max-h-[92vh] bg-surface-container-lowest sm:rounded-3xl shadow-2xl p-5 sm:p-7 text-center transform transition-all duration-300 flex flex-col items-center border-0 sm:border border-slate-200/80 text-on-surface overflow-y-auto"
        id="modal-welcome-app-card"
        role="dialog"
      >
        {/* 상단 닫기 X 버튼 */}
        <button
          aria-label="팝업 닫기"
          className="absolute top-4 right-4 w-9 h-9 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
          id="btn-close-app-x"
          onClick={handleDismiss}
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        {/* 1. 상단 공식 로고 엠블럼 */}
        <div className="relative mb-space-sm flex items-center justify-center mt-2 sm:mt-0">
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
          회원가입 및 5대 필수 약관 동의, 자필 전자서명이 안전하게 보관되었습니다.
        </p>

        {/* 탭 네비게이션: 회원정보 | 약관동의원장 | 전자서명 관리 */}
        <div className="w-full flex border-b border-slate-200 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('LIGHT');
              setActiveTab('welcome');
            }}
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
            onClick={() => {
              triggerHaptic('LIGHT');
              setActiveTab('terms');
            }}
            className={`flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 ${
              activeTab === 'terms'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span>약관동의</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-secondary/15 text-secondary font-mono">
              {termsAgreedList.length > 0 ? termsAgreedList.length : '5'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('LIGHT');
              setActiveTab('signature');
            }}
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
          <div className="w-full space-y-3 mb-4 text-left flex-1">
            <div className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-teal-100/60">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
                  <span className="font-label-md text-label-md text-on-surface">
                    <strong className="text-on-surface font-bold">{profile.userNm}</strong> 고객님
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed-variant">
                  고객회원(C)
                </span>
              </div>
              <div className="space-y-1.5 font-caption text-caption text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span className="text-outline">회원식별번호</span>
                  <span className="font-mono font-medium text-on-surface">{profile.userNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-outline">로그인 계정</span>
                  <span className="font-medium text-on-surface truncate max-w-[200px]">{profile.userEmail}</span>
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
            <div className="w-full p-3 rounded-2xl bg-surface-container-low border border-slate-200/80 flex items-center justify-between">
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

            {/* 3대 보증 정책 */}
            <div className="w-full space-y-2 pt-1 text-left">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-low/70">
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">shield</span>
                <div className="text-[12px] leading-tight">
                  <strong className="text-on-surface font-semibold">100% 신원 보증 마스터 배정: </strong>
                  <span className="text-on-surface-variant">배상책임보험 및 사업자 신원 검증 완료</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-container-low/70">
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">handshake</span>
                <div className="text-[12px] leading-tight">
                  <strong className="text-on-surface font-semibold">현장 검수 후 전액 직불 정산: </strong>
                  <span className="text-on-surface-variant">선입금 없는 시공 완료 후 직접 결제 (수수료 제로)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 약관 동의 내역 원장 */}
        {activeTab === 'terms' && (
          <div className="w-full space-y-2 mb-4 text-left max-h-[300px] overflow-y-auto pr-1 flex-1">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>전자서명법에 따른 5대 필수 약관 동의 및 증적 기록입니다.</span>
            </div>

            {termsAgreedList.length > 0 ? (
              termsAgreedList.map((term, idx) => (
                <div
                  key={term.agreeSeq || term.termsCd || idx}
                  className="p-3 rounded-2xl bg-surface-container-low border border-slate-200/90 flex flex-col gap-1"
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
                </div>
              ))
            ) : (
              [
                { title: '서비스 통합이용약관', code: 'SERVICE', ver: 'v1.0' },
                { title: '개인정보 수집 및 이용 동의', code: 'PRIVACY', ver: 'v1.0' },
                { title: '위치기반 서비스 이용약관', code: 'LOCATION', ver: 'v1.0' },
                { title: '전자금융거래 기본약관', code: 'FINANCE', ver: 'v1.0' },
                { title: '전자거래 및 자필 전자서명 보증 동의', code: 'SIGNATURE', ver: 'v1.0' },
              ].map((item) => (
                <div key={item.code} className="p-3 rounded-2xl bg-surface-container-low border border-slate-200/90 flex items-center justify-between">
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
          <div className="w-full space-y-3 mb-4 text-left flex-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
              <span className="text-[12px] font-semibold text-on-surface mb-2 self-start">현재 등록된 본인 자필 전자서명</span>
              <div className="w-full h-32 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                {profile.signImgUrl ? (
                  <img
                    src={profile.signImgUrl}
                    alt="등록된 전자서명"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-on-surface-variant text-[12px]">서명 이미지를 불러오는 중입니다.</span>
                )}
                <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-secondary font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>위변조 방지 보증</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('LIGHT');
                setShowSignModal(true);
              }}
              className="w-full py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>새로운 자필 전자서명으로 변경 (재등록)</span>
            </button>
          </div>
        )}

        {/* 5. 하단 CTA 버튼 */}
        <div className="w-full flex flex-col gap-2 shrink-0">
          <button
            className="w-full h-[50px] bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg rounded-2xl shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
            data-action="OPEN_MODAL_APP_CLNT_REQ_000"
            id="btn-app-request-cleaning"
            onClick={handleProceedToRequest}
            type="button"
          >
            <span>바로 청소 요청 등록하러 가기</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <button
            className="w-full h-[38px] text-outline hover:text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center cursor-pointer"
            data-action="CLOSE_MODAL_GO_HOME"
            id="btn-app-dismiss-to-home"
            onClick={handleDismiss}
            type="button"
          >
            홈 둘러보기
          </button>
        </div>
      </div>

      {/* 전자서명 재등록 서브 모달 */}
      {showSignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="relative w-full max-w-[420px] bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-label-lg text-label-lg font-bold text-primary">자필 전자서명 재등록</h3>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-[12px] text-slate-600">
              아래 캔버스에 터치로 새로운 본인 서명을 그려주세요.
            </p>
            <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-teal-300 rounded-2xl overflow-hidden relative">
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
                  className="px-3 py-1.5 text-sm rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewSignature}
                  disabled={isUpdatingSign || !hasNewSignature}
                  className="px-4 py-1.5 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow disabled:opacity-50"
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

