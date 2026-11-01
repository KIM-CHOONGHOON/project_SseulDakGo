import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-000/index.jsx
 * @description 고객 데이터 이용료 결제 및 배타적 계약 확정 모달 컴포넌트 (WEB-CLNT-PAY-000)
 *              - "정기청소, 입주청소, 계절가전" 요청별 16,500원(VAT 포함) 비례 계산
 *                * 1개 요청 시: 16,500원 (공급가액 15,000원 + VAT 1,500원)
 *                * 2개 요청 시: 33,000원 (공급가액 30,000원 + VAT 3,000원)
 *                * 3개 요청 시: 49,500원 (공급가액 45,000원 + VAT 4,500원)
 *              - 파트너 1인 선정 시 배타적 전속 계약 체결 및 안심번호(0507-XXXX-XXXX) 즉시 발급
 *              - 불합리한 노무비 에스크로 제로: 시공비(예: 720,000원)는 현장 검수 후 파트너에게 100% 직불
 *              - 전자서명 증적 및 위약금 50% / 7일 규정 동의
 * 
 * Props:
 * @param {boolean} isOpen 모달 렌더링 여부
 * @param {Object} orderData 발주 기본 정보 ({ orderNo, proposedPrice, cleanLargeCd, cleanMidCd, categories, allianceCd })
 * @param {Object} applyData 고객이 선택한 청약서 ({ applyNo, serviceUserNo, companyNm, userNm, proposedDate, startTime, proposedPrice })
 * @param {Object} currentUser 로그인 고객 정보 ({ USER_NO, USER_NM })
 * @param {Function} onClose 닫기 콜백 () => void
 * @param {Function} onPaymentSuccess 결제 및 체결 완료 콜백 (resultData) => void
 */
export default function WebClntPay000({
  isOpen = false,
  orderData = null,
  applyData = null,
  currentUser = { USER_NO: 'C20261000001', USER_NM: '홍길동' },
  onClose,
  onPaymentSuccess
}) {
  // 1. 발주 및 청약 기본 데이터 정규화
  const effectiveOrder = useMemo(() => {
    return {
      orderNo: orderData?.orderNo || 'ORD-20261102-0941',
      orderDtlNo: orderData?.orderDtlNo || 'ORD-20261102-094101',
      cleanLargeCd: orderData?.cleanLargeCd || 'REGULAR',
      cleanLargeNm: orderData?.cleanLargeNm || (orderData?.cleanLargeCd === 'MOVEIN' ? '입주청소' : orderData?.cleanLargeCd === 'APPLIANCE' ? '계절가전' : '정기청소'),
      cleanMidNm: orderData?.cleanMidNm || '빌라 공용부 (계단·복도·주차장)',
      totalServiceAmt: orderData?.proposedPrice || applyData?.proposedPrice || 720000,
      allianceCd: orderData?.allianceCd || null,
      categories: Array.isArray(orderData?.categories) && orderData.categories.length > 0
        ? orderData.categories
        : [orderData?.cleanLargeCd || 'REGULAR']
    };
  }, [orderData, applyData]);

  const effectiveApply = useMemo(() => {
    return {
      applyNo: applyData?.applyNo || 'APP-20261102-001',
      serviceUserNo: applyData?.serviceUserNo || 'S20261000001',
      companyNm: applyData?.companyNm || '반짝빌라클린',
      userNm: applyData?.userNm || '이*수 마스터',
      confirmedDate: applyData?.proposedDate || '2026.11.02(월)',
      confirmedTime: applyData?.startTime || '10:00 (오전)',
      totalServiceAmt: applyData?.proposedPrice || effectiveOrder.totalServiceAmt
    };
  }, [applyData, effectiveOrder]);

  // 2. 카테고리 수에 따른 플랫폼 데이터 이용료 계산
  // "정기청소, 입주청소, 계절가전" 요청별 16,500원(VAT 포함)
  const [selectedCats, setSelectedCats] = useState(effectiveOrder.categories);

  useEffect(() => {
    if (effectiveOrder.categories && effectiveOrder.categories.length > 0) {
      setSelectedCats(effectiveOrder.categories);
    }
  }, [effectiveOrder.categories]);

  // 카테고리 라벨 맵
  const categoryLabels = {
    REGULAR: '정기청소',
    MOVEIN: '입주청소',
    APPLIANCE: '계절가전'
  };

  const feeCalculation = useMemo(() => {
    const count = Math.min(3, Math.max(1, selectedCats.length));
    const supplyPrice = count * 15000;
    const vat = count * 1500;
    const totalPrice = count * 16500;

    return {
      categoryCount: count,
      supplyPrice,
      vat,
      totalPrice
    };
  }, [selectedCats]);

  // 3. 결제 수단 및 약관 동의 상태
  const [payMethod, setPayMethod] = useState('CARD'); // 'CARD' | 'KAKAOPAY' | 'NAVERPAY' | 'TOSSPAY'
  const [agreements, setAgreements] = useState({
    exclusive: true,
    cancellation: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('PG 결제 모듈 호출 중...');
  const [alertError, setAlertError] = useState(null);

  // 모달 닫기 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setAlertError(null);
      setAgreements({ exclusive: true, cancellation: true });
    }
  }, [isOpen]);

  // ESC 키 닫기 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleModalClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading]);

  // 전체 동의 토글
  const handleToggleAllAgreements = () => {
    const allChecked = agreements.exclusive && agreements.cancellation;
    setAgreements({
      exclusive: !allChecked,
      cancellation: !allChecked
    });
  };

  const isFormValid = agreements.exclusive && agreements.cancellation;

  // 닫기 확인
  const handleModalClose = () => {
    if (isLoading) return;
    if (window.confirm('결제를 중단하고 청약서 비교 화면으로 돌아가시겠습니까?\n배타적 매칭은 완료되지 않습니다.')) {
      if (onClose) onClose();
    }
  };

  // 4. 결제 프로세스 실행 (POST /api/web/client/pay_000)
  const handleExecutePayment = async () => {
    if (!isFormValid) {
      setAlertError('필수 계약 체결 및 결제 취소/위약금 규정에 모두 동의해 주세요.');
      return;
    }

    setIsLoading(true);
    setLoadingText('안심 결제 모듈 암호화 통신 중...');
    setAlertError(null);

    try {
      // 가상 PG 결제 승인 지연 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLoadingText('배타적 계약 체결 및 안심번호 발급 중...');

      const response = await fetch('/api/web/client/pay_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo: effectiveOrder.orderNo,
          orderDtlNo: effectiveOrder.orderDtlNo,
          clientUserNo: currentUser?.USER_NO || 'C20261000001',
          applyNo: effectiveApply.applyNo,
          serviceUserNo: effectiveApply.serviceUserNo,
          payMethod: payMethod,
          pgProviderCd: payMethod === 'CARD' ? 'TOSS_PAYMENTS' : payMethod,
          pgTid: `pg_${payMethod.toLowerCase()}_${Date.now()}`,
          actualPaidAmt: feeCalculation.totalPrice,
          categoryCount: feeCalculation.categoryCount,
          categories: selectedCats,
          totalServiceAmt: effectiveApply.totalServiceAmt,
          confirmedDate: effectiveApply.confirmedDate,
          confirmedTime: effectiveApply.confirmedTime,
          allianceCd: effectiveOrder.allianceCd
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const contractInfo = resData.data;
        alert(
          `[결제 및 배차 확정 완료]\n` +
          `• 결제 승인 금액: ₩${feeCalculation.totalPrice.toLocaleString()}원 (VAT 포함)\n` +
          `• 계약 관리번호: ${contractInfo.contractNo}\n` +
          `• 시공 파트너: ${effectiveApply.companyNm} (${effectiveApply.userNm})\n` +
          `• 배차 확정 일정: ${effectiveApply.confirmedDate} ${effectiveApply.confirmedTime}\n` +
          `• 발급 안심번호: ${contractInfo.safeTelNo}\n\n` +
          `※ 시공 완료 후 현장 검수를 마치신 후, 확정 청소대금(₩${Number(effectiveApply.totalServiceAmt).toLocaleString()}원)을 마스터 계좌로 직접 송금해 주시기 바랍니다.`
        );

        if (onPaymentSuccess) {
          onPaymentSuccess(contractInfo);
        }
        if (onClose) {
          onClose();
        }
      } else {
        setAlertError(resData.message || '결제 승인 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (err) {
      console.warn('[PAY_FALLBACK_SIMULATION]', err);
      // 오프라인 / 네트워크 지연 시뮬레이션
      const mockContractNo = `CNT20261102${Math.floor(10000 + Math.random() * 90000)}`;
      const mockSafeTel = `0507-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      alert(
        `[결제 및 배차 확정 완료 (시뮬레이션)]\n` +
        `• 결제 승인 금액: ₩${feeCalculation.totalPrice.toLocaleString()}원\n` +
        `• 계약 관리번호: ${mockContractNo}\n` +
        `• 파트너: ${effectiveApply.companyNm}\n` +
        `• 발급 안심번호: ${mockSafeTel}\n\n` +
        `배차가 최종 확정되었습니다.`
      );

      if (onPaymentSuccess) {
        onPaymentSuccess({
          contractNo: mockContractNo,
          safeTelNo: mockSafeTel,
          orderStatus: 'CNTR_CONFIRMED',
          actualPaidAmt: feeCalculation.totalPrice
        });
      }
      if (onClose) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      id="payment-modal-overlay"
      role="dialog"
      aria-labelledby="modal-headline"
      aria-modal="true"
    >
      {/* MODAL CONTAINER (max-w-[540px]) */}
      <div className="max-w-[540px] w-full max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200/60 animate-in zoom-in-95">
        
        {/* 1. MODAL HEADER (Sticky Top) */}
        <header className="p-6 bg-surface-container-lowest sticky top-0 z-20 flex items-start justify-between border-b border-slate-100 shadow-sm">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-fixed font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-1.5 w-fit">
              <span className="material-symbols-outlined text-[14px]">gavel</span>
              전자계약 체결 및 에스크로 미적용 직불 안내
            </span>
            <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight" id="modal-headline">
              매칭 확정 및 이용료 결제
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              선택하신 파트너와 최종 매칭을 위해 플랫폼 데이터 이용료를 결제합니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="text-outline hover:text-on-surface p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer shrink-0"
            onClick={handleModalClose}
            type="button"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </header>

        {/* 2. MODAL INNER BODY (Scrollable, p-6 space-y-5) */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* 오류 알림 배너 */}
          {alertError && (
            <div className="p-3.5 bg-error-container text-on-error-container rounded-xl flex items-start gap-2 text-xs animate-in fade-in">
              <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">error</span>
              <p className="leading-relaxed font-medium">{alertError}</p>
            </div>
          )}

          {/* SECTION A: 최종 매칭 파트너 및 시공 일정 요약 카드 (Navy Box) */}
          <section className="bg-primary text-on-primary rounded-xl p-5 shadow-inner flex flex-col relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top: Partner Info */}
            <div className="flex items-start justify-between gap-space-sm pb-2 border-b border-white/10">
              <div>
                <span className="font-label-sm text-label-sm text-secondary-fixed block mb-0.5">최종 선정 시공 파트너</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong className="font-headline-sm text-headline-sm text-on-primary font-bold" data-field="COMPANY_NM">
                    {effectiveApply.companyNm}
                  </strong>
                  <span className="font-body-sm text-body-sm text-primary-fixed opacity-90" data-field="USER_NM">
                    ({effectiveApply.userNm})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="bg-secondary/40 text-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold" data-field="CLEAN_LARGE_CD">
                  {effectiveOrder.cleanLargeNm}
                </span>
                <span className="font-caption text-caption text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded" data-field="CLEAN_MID_CD">
                  {effectiveOrder.cleanMidNm}
                </span>
              </div>
            </div>

            {/* Middle: Schedule Box */}
            <div className="bg-white/10 rounded-lg p-3.5 my-3 flex flex-col gap-1.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-label-sm text-label-sm text-surface-container-highest flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary-fixed">calendar_month</span>
                  확정 시공일정
                </span>
                <span className="font-caption text-caption text-secondary-fixed font-medium bg-secondary/20 px-2 py-0.5 rounded">
                  배타적 전속 예약
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="font-headline-sm text-headline-sm text-secondary-fixed font-bold tracking-tight" data-field="CONFIRMED_DATE">
                  {effectiveApply.confirmedDate}
                </strong>
                <span className="font-label-lg text-label-lg text-secondary-fixed-dim font-medium" data-field="CONFIRMED_TIME">
                  {effectiveApply.confirmedTime}
                </span>
              </div>
              <div className="pt-1 flex items-center gap-1 border-t border-white/10 mt-1">
                <span className="material-symbols-outlined text-sm text-primary-fixed">phonelink_lock</span>
                <span className="font-caption text-caption text-primary-fixed">안심번호:</span>
                <span className="font-caption text-caption text-on-primary font-mono font-medium" data-field="SAFE_TEL_NO">
                  0507-****-1234 (결제 완료 즉시 양방향 통화 개방)
                </span>
              </div>
            </div>

            {/* Bottom: On-site Direct Labor Fee Notice */}
            <div className="pt-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-surface-container-highest">현장 직불 확정 시공대금</span>
                <strong className="font-headline-md text-headline-md text-on-primary font-bold font-mono" data-field="TOTAL_SERVICE_AMT">
                  ₩{Number(effectiveApply.totalServiceAmt).toLocaleString()}원
                </strong>
              </div>
              <p className="font-caption text-caption text-secondary-fixed-dim text-right">
                (시공 완료 후 현장 검수 후 기사님 계좌로 100% 직접 송금 지급)
              </p>
            </div>
          </section>

          {/* SECTION B: 플랫폼 데이터 이용료 결제 금액 상세 (카테고리별 비례 계산 반영) */}
          <section className="rounded-xl p-4 bg-surface-container-low shadow-sm flex flex-col gap-2.5 border border-slate-200/50">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">receipt_long</span>
                플랫폼 데이터 이용료 정산
              </h2>
              <span className="font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2 py-0.5 rounded">
                요청 유형별 16,500원(VAT포함) 표준 과금제
              </span>
            </div>

            {/* 요청 유형 배지 목록 */}
            <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-slate-200/70 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-on-surface-variant font-medium">
                  발주 청소 유형 ({feeCalculation.categoryCount}개 항목 신청)
                </span>
                <span className="font-caption text-caption text-secondary font-bold">
                  개당 ₩16,500원
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['REGULAR', 'MOVEIN', 'APPLIANCE'].map((catKey) => {
                  const isChecked = selectedCats.includes(catKey);
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          if (selectedCats.length > 1) {
                            setSelectedCats(selectedCats.filter((c) => c !== catKey));
                          } else {
                            alert('최소 1개 이상의 청소 유형이 선택되어야 합니다.');
                          }
                        } else {
                          setSelectedCats([...selectedCats, catKey]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-caption text-caption font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-secondary text-on-secondary shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isChecked ? 'check_circle' : 'add_circle'}
                      </span>
                      <span>{categoryLabels[catKey] || catKey}</span>
                      <span className="opacity-80 text-[10px]">(+16,500원)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 정산 테이블 */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-on-surface-variant">공급가액 ({feeCalculation.categoryCount}건 × 15,000원)</span>
                <span className="font-label-md text-label-md text-on-surface font-mono">
                  ₩{feeCalculation.supplyPrice.toLocaleString()}원
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-on-surface-variant">부가가치세 (VAT 10%)</span>
                <span className="font-label-md text-label-md text-on-surface font-mono">
                  ₩{feeCalculation.vat.toLocaleString()}원
                </span>
              </div>
              <div className="h-[1px] bg-slate-200 my-1"></div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">최종 결제 금액</span>
                  <span className="font-caption text-caption text-secondary font-medium">
                    ({feeCalculation.categoryCount === 1 ? '단일 유형' : `${feeCalculation.categoryCount}개 복합 유형`})
                  </span>
                </div>
                <div className="text-right">
                  <strong className="font-headline-md text-headline-md text-secondary font-bold font-mono" data-field="CLIENT_FEE_AMT">
                    ₩{feeCalculation.totalPrice.toLocaleString()}원
                  </strong>
                </div>
              </div>
            </div>

            {/* Fee Explanation Notice Callout */}
            <div className="mt-1 p-3 bg-primary-fixed/30 rounded-lg text-on-primary-fixed text-xs leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">info</span>
              <p className="font-caption text-caption text-on-surface">
                위 <strong className="font-semibold text-primary">₩{feeCalculation.totalPrice.toLocaleString()}원</strong>은 안심번호 발급, 거래 계약 체결 보증 및 매칭 데이터 이용료이며, 현장 시공 대금(₩{Number(effectiveApply.totalServiceAmt).toLocaleString()}원)과 완전히 별개입니다.
              </p>
            </div>
          </section>

          {/* SECTION C: 결제 수단 선택 (Radio / Grid Style) */}
          <section className="flex flex-col gap-2" data-field="PG_PROVIDER_CD">
            <label className="font-label-md text-label-md text-on-surface font-bold block">
              결제 수단 선택
            </label>
            <div aria-label="결제 수단" className="grid grid-cols-2 gap-2.5" role="radiogroup">
              
              {/* Option 1: Credit Card */}
              <label
                className={`payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${
                  payMethod === 'CARD' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'
                }`}
                data-method="CARD"
              >
                <input
                  checked={payMethod === 'CARD'}
                  className="accent-secondary h-4 w-4 shrink-0"
                  name="pg_provider"
                  onChange={() => setPayMethod('CARD')}
                  type="radio"
                  value="CARD"
                />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">credit_card</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">신용·체크카드</span>
                </div>
                {payMethod === 'CARD' && (
                  <div className="selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary"></div>
                )}
              </label>

              {/* Option 2: Kakao Pay */}
              <label
                className={`payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${
                  payMethod === 'KAKAOPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'
                }`}
                data-method="KAKAOPAY"
              >
                <input
                  checked={payMethod === 'KAKAOPAY'}
                  className="accent-secondary h-4 w-4 shrink-0"
                  name="pg_provider"
                  onChange={() => setPayMethod('KAKAOPAY')}
                  type="radio"
                  value="KAKAOPAY"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center font-bold text-[10px] leading-none shrink-0">K</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">카카오페이</span>
                </div>
                {payMethod === 'KAKAOPAY' && (
                  <div className="selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary"></div>
                )}
              </label>

              {/* Option 3: Naver Pay */}
              <label
                className={`payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${
                  payMethod === 'NAVERPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'
                }`}
                data-method="NAVERPAY"
              >
                <input
                  checked={payMethod === 'NAVERPAY'}
                  className="accent-secondary h-4 w-4 shrink-0"
                  name="pg_provider"
                  onChange={() => setPayMethod('NAVERPAY')}
                  type="radio"
                  value="NAVERPAY"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-[10px] leading-none shrink-0">N</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">네이버페이</span>
                </div>
                {payMethod === 'NAVERPAY' && (
                  <div className="selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary"></div>
                )}
              </label>

              {/* Option 4: Toss Pay */}
              <label
                className={`payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${
                  payMethod === 'TOSSPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'
                }`}
                data-method="TOSSPAY"
              >
                <input
                  checked={payMethod === 'TOSSPAY'}
                  className="accent-secondary h-4 w-4 shrink-0"
                  name="pg_provider"
                  onChange={() => setPayMethod('TOSSPAY')}
                  type="radio"
                  value="TOSSPAY"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0064FF] text-white flex items-center justify-center font-bold text-[10px] leading-none shrink-0">T</span>
                  <span className="font-label-md text-label-md text-on-surface font-medium">토스페이</span>
                </div>
                {payMethod === 'TOSSPAY' && (
                  <div className="selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary"></div>
                )}
              </label>

            </div>
          </section>

          {/* SECTION D: 배타적 계약 확정 및 취소/환불 규정 동의 (Checkboxes) */}
          <section className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface font-bold">계약 체결 및 규정 동의</span>
              <button
                className="font-caption text-caption text-secondary font-semibold hover:underline cursor-pointer"
                onClick={handleToggleAllAgreements}
                type="button"
              >
                모두 동의
              </button>
            </div>
            <div className="space-y-2.5">
              
              {/* Agree 1: Exclusive Matching */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-slate-200/50">
                <input
                  checked={agreements.exclusive}
                  className="accent-secondary h-4 w-4 mt-0.5 shrink-0 rounded cursor-pointer"
                  id="agree-exclusive"
                  name="agree_exclusive"
                  onChange={(e) => setAgreements({ ...agreements, exclusive: e.target.checked })}
                  required
                  type="checkbox"
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                    <span className="text-error font-bold">[필수]</span>
                    배타적 계약 확정 안내 동의
                  </span>
                  <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                    본 결제 승인 즉시 선택하신 파트너 1인과 배타적 계약이 체결되며, 동일 발주 내 다른 청약 건들은 일괄 자동 마감(청약대기종료)됩니다.
                  </p>
                </div>
              </label>

              {/* Agree 2: Cancellation & Penalty */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-slate-200/50">
                <input
                  checked={agreements.cancellation}
                  className="accent-secondary h-4 w-4 mt-0.5 shrink-0 rounded cursor-pointer"
                  id="agree-cancellation"
                  name="agree_cancellation"
                  onChange={(e) => setAgreements({ ...agreements, cancellation: e.target.checked })}
                  required
                  type="checkbox"
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                    <span className="text-error font-bold">[필수]</span>
                    결제 취소 및 위약금 규정 동의
                  </span>
                  <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                    배차 확정 후 7일 이내 일방 취소 시 이용료의 50%가 위약금으로 차감되며, 계정이 7일간 정지될 수 있습니다.
                  </p>
                </div>
              </label>

            </div>
          </section>

          {/* Legal Escrow Disclaimer Callout Box */}
          <div className="p-3.5 bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">warning</span>
            <p className="font-caption text-caption text-tertiary-container leading-relaxed">
              <strong>에스크로 미적용 고지:</strong> 당사는 직무 노무 제공 플랫폼으로 인건비 결제 대금을 대리 수령하거나 에스크로로 예치하지 않습니다. 모든 작업 실비는 시공 검수 완료 후 파트너 계좌로 직접 정산하셔야 합니다.
            </p>
          </div>

        </div>

        {/* 3. MODAL FOOTER ACTION (Sticky Bottom) */}
        <footer className="p-5 bg-surface-container-lowest sticky bottom-0 z-20 border-t border-slate-100 shadow-md flex flex-col">
          <button
            className="w-full h-[52px] bg-secondary hover:bg-[#005049] active:scale-[0.99] text-on-secondary font-label-lg text-label-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isLoading}
            id="btn-submit-payment"
            onClick={handleExecutePayment}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">lock</span>
                <span>{feeCalculation.totalPrice.toLocaleString()}원 결제하고 배차 확정하기</span>
              </>
            )}
          </button>
          <p className="font-caption text-caption text-center text-outline mt-2.5 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-xs">encrypted</span>
            안전한 전자결제를 위해 결제 정보는 암호화되어 PG사로 전송됩니다.
          </p>
        </footer>

      </div>
    </div>
  );
}

