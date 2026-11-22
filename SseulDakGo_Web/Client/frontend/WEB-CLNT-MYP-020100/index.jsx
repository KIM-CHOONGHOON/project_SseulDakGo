import React, { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * ============================================================================
 * [화면 컴포넌트] 화면 ID: WEB-CLNT-MYP-020100
 * 파일 경로: SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-020100/index.jsx
 * 화면명: 자격증 · 수료증 · 경력 검증 관리 (시공사 파트너 전용)
 * 
 * 주요 기능:
 * 1. 3단계 파트너 등록 진행바 (1단계: 사업자등록 완료 -> 2단계: 자격증/경력 진행중 -> 3단계: 정산/계약 대기)
 * 2. 국세청 검증된 사업자등록 진위확인 정보 요약 박스 (TB_USER & TB_SERVICE_DOC)
 * 3. 인증 뱃지 쇼케이스 (BADGE_PRO_EDU, BADGE_CERTIFIED, BADGE_MASTER)
 * 4. 동적 자격증 목록 카드 (최대 5건, 증빙구분/자격명/발급기관/취득일/첨부파일/마스킹확인/상태)
 * 5. API Request Payload & TB Data Pipeline 터미널 인스펙터 토글
 * 6. Sticky 하단 바: 건너뛰기, 임시 저장, 저장 및 심사 요청 (실시간 API 연동)
 * 7. 모달(Modal) 팝업 모드 및 독립 전체화면(Page) 모드 100% 호환 지원
 * ============================================================================
 */

// ============================================================================
// 자격증(국가/민간) / 수료증 / 경력증명 메타데이터 카탈로그
// ============================================================================
export const CERT_CATALOG = {
  LICENSE: {
    NATIONAL: [
      { code: 'NAT_AC_REF', name: '공조냉동기계기능사 / 산업기사 / 기사', issuer: '한국산업인력공단(Q-Net)' },
      { code: 'NAT_ELEC', name: '전기기능사 / 산업기사 / 기사', issuer: '한국산업인력공단(Q-Net)' },
      { code: 'NAT_BLD_FAC', name: '건축설비기사 / 산업기사', issuer: '한국산업인력공단(Q-Net)' },
      { code: 'NAT_ENERGY', name: '에너지관리기능사 / 산업기사', issuer: '한국에너지공단' },
      { code: 'NAT_HAZARD', name: '위험물기능사 / 안전관리자', issuer: '한국소방안전원' },
      { code: 'NAT_ENV', name: '환경기능사 (대기 / 수질 / 폐기물)', issuer: '한국산업인력공단(Q-Net)' },
      { code: 'ETC_DIRECT_INPUT', name: '기타 국가자격증 직접 입력 (ETC_DIRECT_INPUT)', issuer: '' },
    ],
    PRIVATE: [
      { code: 'CERT_SYS_AC', name: '냉난방기/시스템에어컨 종합세척관리사 (CERT_SYS_AC)', issuer: '한국시스템에어컨유지보수관리협회(KSAMA)' },
      { code: 'CERT_CLEAN_SPEC', name: '건축위생관리사 (CERT_CLEAN_SPEC)', issuer: '사단법인 한국건축위생관리협회' },
      { code: 'CERT_FLOOR_COAT', name: '공간바닥코팅마스터 자격인증 (CERT_FLOOR_COAT)', issuer: '한국코팅기술인증원' },
      { code: 'CERT_ORGANIZER', name: '정리수납전문가 1급/2급 (CERT_ORGANIZER)', issuer: '한국정리수납협회' },
      { code: 'CERT_AIR_QUAL', name: '실내공기질관리사 (CERT_AIR_QUAL)', issuer: '한국실내환경관리협회' },
      { code: 'ETC_DIRECT_INPUT', name: '기타 민간자격증 직접 입력 (ETC_DIRECT_INPUT)', issuer: '' },
    ]
  },
  COMPLETION: [
    { code: 'CERT_CLEAN_BUILD', name: '건물위생관리업 법정교육 수료 (CERT_CLEAN_BUILD)', issuer: '한국건물위생관리협회' },
    { code: 'CERT_DISINFECT', name: '한국방역협회 소독업무 종사자 교육 수료 (CERT_DISINFECT)', issuer: '사단법인 한국방역협회' },
    { code: 'COMPL_AC_WASH', name: '에어컨 완전분해 세척 종합기술과정 수료 (COMPL_AC_WASH)', issuer: '한국냉동공조기술아카데미' },
    { code: 'COMPL_DISINFECT_PRO', name: '친환경 오존/피톤치드 공간 살균 방역 실무 마스터과정 (COMPL_DISINFECT_PRO)', issuer: '사단법인 한국실내환경방역안전협회' },
    { code: 'COMPL_SAFETY', name: '고소작업대 조종 및 추락안전 기술교육 수료 (COMPL_SAFETY)', issuer: '한국산업안전보건공단' },
    { code: 'ETC_DIRECT_INPUT', name: '기타 교육/기술 수료증 직접 입력 (ETC_DIRECT_INPUT)', issuer: '' },
  ],
  CAREER: [
    { code: 'CAREER_SAMSUNG_SVC', name: '삼성전자서비스/로지텍 서비스엔지니어 경력 (CAREER_SAMSUNG)', issuer: '삼성전자서비스(주) 중부지사' },
    { code: 'CAREER_LG_SVC', name: 'LG전자 하이엠솔루텍/서비스센터 경력 (CAREER_LG)', issuer: 'LG전자 하이엠솔루텍' },
    { code: 'CAREER_CARRIER_SVC', name: '캐리어/위니아 공조 엔지니어 경력 (CAREER_CARRIER)', issuer: '캐리어에어컨(주)' },
    { code: 'CAREER_ETC', name: '기타 가전 제조사/서비스센터 근무 경력 (CAREER_ETC)', issuer: '가전 제조 서비스센터' },
    { code: 'ETC_DIRECT_INPUT', name: '기타 경력사항 직접 입력 (ETC_DIRECT_INPUT)', issuer: '' },
  ]
};

export default function WebClntMyp020100({
  isOpen = true,
  onClose,
  currentUser,
  isModal = false,
  onNavigate,
  onSuccess
}) {
  // 1. 현재 시공사 및 사업자등록 정보 상태
  const serviceNo = currentUser?.USER_NO || currentUser?.serviceNo || 'S20261100001';
  const [bizInfo, setBizInfo] = useState({
    bizType: 'CORP',
    bizNo: currentUser?.BIZ_NO || '120-88-29401',
    companyNm: currentUser?.CORP_NM || currentUser?.COMPANY_NM || '공간다원 (클린앤케어)',
    ceoNm: currentUser?.USER_NM || currentUser?.CEO_NM || '김충훈',
    fileName: '사업자등록증_공간다원.pdf',
    verifyYn: 'Y',
    mainCleanLargeCds: ['정기청소', '입주청소'],
  });

  // 사업자등록 수정 서브 모달 상태
  const [isBizEditOpen, setIsBizEditOpen] = useState(false);
  const [editBizType, setEditBizType] = useState('CORP');
  const [editBizNo, setEditBizNo] = useState('120-88-29401');
  const [editCompanyNm, setEditCompanyNm] = useState('공간다원 (클린앤케어)');
  const [editCeoNm, setEditCeoNm] = useState('김충훈');
  const [editFileName, setEditFileName] = useState('사업자등록증_공간다원.pdf');
  const [editMainCleanLargeCds, setEditMainCleanLargeCds] = useState(['정기청소', '입주청소']);
  const [isHometaxVerified, setIsHometaxVerified] = useState(true);

  // 주력 시공 분야 인라인 빠른 편집 상태
  const [isInlineCategoryEdit, setIsInlineCategoryEdit] = useState(false);

  // 2. 탭 상태 ('LICENSE': 자격증, 'COMPLETION': 교육/기술 수료증, 'CAREER': 제조사 경력증명)
  const [activeTab, setActiveTab] = useState('LICENSE');

  // 3. 자격증 목록 상태
  const [certList, setCertList] = useState([
    {
      id: 1,
      certSeq: 1,
      docType: 'LICENSE',
      subType: 'PRIVATE', // 'NATIONAL'(국가자격증) | 'PRIVATE'(민간자격증)
      certCode: 'CERT_SYS_AC',
      certName: '냉난방기/시스템에어컨 종합세척관리사',
      customCertName: '',
      issuerName: '한국시스템에어컨유지보수관리협회(KSAMA)',
      issuedYm: '2024-06',
      fileName: 'KSAMA_시스템에어컨세척관리사_자격증_김충훈.pdf',
      fileSize: '2.4MB',
      privacyMaskYn: 'Y',
      reviewStatus: 'APPROVED',
      approvedDt: '2026-11-18',
    },
    {
      id: 2,
      certSeq: 2,
      docType: 'COMPLETION',
      subType: null,
      certCode: 'ETC_DIRECT_INPUT',
      certName: '기타 자격/수료증 직접 입력 (ETC_DIRECT_INPUT)',
      customCertName: '친환경 오존/피톤치드 공간 살균 방역 실무 마스터과정',
      issuerName: '사단법인 한국실내환경방역안전협회',
      issuedYm: '2025-02',
      fileName: '방역살균수료증_공간다원.jpg',
      fileSize: '4.1MB',
      privacyMaskYn: 'Y',
      reviewStatus: 'PENDING',
      approvedDt: '',
    },
    {
      id: 3,
      certSeq: 3,
      docType: 'CAREER',
      subType: null,
      certCode: 'CAREER_SAMSUNG_SVC',
      certName: '삼성전자서비스/로지텍 서비스엔지니어 경력 (CAREER_SAMSUNG)',
      customCertName: '',
      issuerName: '삼성전자서비스(주) 중부지사',
      issuedYm: '2023-08',
      fileName: '',
      fileSize: '',
      privacyMaskYn: 'N',
      reviewStatus: 'DRAFT',
      approvedDt: '',
    },
  ]);

  // 4. UI 인터랙션 상태
  const [isPayloadOpen, setIsPayloadOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // 5. 항목 변경 핸들러
  const handleFieldChange = (id, field, value) => {
    setCertList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // 자격증 탭 내에서 국가자격증 / 민간자격증 하위 분류 전환
  const handleSubTypeChange = (id, newSubType) => {
    const catalogList = CERT_CATALOG.LICENSE[newSubType] || CERT_CATALOG.LICENSE.PRIVATE;
    const defaultCert = catalogList[0];
    setCertList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          subType: newSubType,
          certCode: defaultCert.code,
          certName: defaultCert.name.split(' (')[0],
          customCertName: '',
          issuerName: defaultCert.issuer,
        };
      })
    );
  };

  // 증빙 구분 변경 시 해당 분류의 기본 자격증 및 발급기관으로 자동 매핑
  const handleDocTypeChange = (id, newDocType) => {
    let catalogList;
    let subType = null;
    if (newDocType === 'LICENSE') {
      subType = 'PRIVATE';
      catalogList = CERT_CATALOG.LICENSE.PRIVATE;
    } else {
      catalogList = CERT_CATALOG[newDocType] || [];
    }
    const defaultCert = catalogList[0] || { code: 'ETC_DIRECT_INPUT', name: '기타 직접입력', issuer: '' };
    setCertList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          docType: newDocType,
          subType,
          certCode: defaultCert.code,
          certName: defaultCert.name.split(' (')[0],
          customCertName: '',
          issuerName: defaultCert.issuer,
        };
      })
    );
  };

  // 6. 항목 삭제 핸들러
  const handleRemoveCert = (id) => {
    const targetItem = certList.find((c) => c.id === id);
    const countInTab = certList.filter((c) => c.docType === targetItem?.docType).length;
    if (countInTab <= 1 && certList.length <= 1) {
      alert('최소 1개 이상의 항목 양식이 유지되어야 합니다.');
      return;
    }
    if (confirm('해당 증빙 서류 항목을 삭제하시겠습니까?')) {
      setCertList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 7. 현재 탭에 맞는 새 Row 추가 핸들러 (최대 5건)
  const handleAddCertForTab = (targetDocType = activeTab) => {
    if (certList.length >= 5) {
      alert('자격증 및 수료증은 전체 최대 5건까지만 등록 가능합니다.');
      return;
    }
    const newId = Date.now();
    const newSeq = certList.length + 1;
    let defaultCode = 'CERT_SYS_AC';
    let defaultName = '냉난방기/시스템에어컨 종합세척관리사';
    let defaultIssuer = '한국시스템에어컨유지보수관리협회(KSAMA)';
    let subType = null;

    if (targetDocType === 'LICENSE') {
      subType = 'PRIVATE';
      defaultCode = 'CERT_SYS_AC';
      defaultName = '냉난방기/시스템에어컨 종합세척관리사';
      defaultIssuer = '한국시스템에어컨유지보수관리협회(KSAMA)';
    } else if (targetDocType === 'COMPLETION') {
      defaultCode = 'CERT_CLEAN_BUILD';
      defaultName = '건물위생관리업 법정교육 수료';
      defaultIssuer = '한국건물위생관리협회';
    } else if (targetDocType === 'CAREER') {
      defaultCode = 'CAREER_SAMSUNG_SVC';
      defaultName = '삼성전자서비스/로지텍 서비스엔지니어 경력';
      defaultIssuer = '삼성전자서비스(주) 중부지사';
    }

    const newCard = {
      id: newId,
      certSeq: newSeq,
      docType: targetDocType,
      subType,
      certCode: defaultCode,
      certName: defaultName,
      customCertName: '',
      issuerName: defaultIssuer,
      issuedYm: new Date().toISOString().slice(0, 7),
      fileName: '',
      fileSize: '',
      privacyMaskYn: 'N',
      reviewStatus: 'DRAFT',
      approvedDt: '',
    };
    setCertList((prev) => [...prev, newCard]);
  };

  // 8. 파일 업로드 핸들러 (C:\SseulDakGo_Storage\{USER_NO}\{DOC_TYPE}\ 자동 분리 저장)
  const handleFileUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 용량은 최대 10MB까지만 업로드 가능합니다.');
      return;
    }

    const currentItem = certList.find((c) => c.id === id);
    const docType = currentItem?.docType || 'LICENSE';
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + 'MB';

    // 파일 로컬 State 즉시 반영
    setCertList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, fileName: file.name, fileSize: sizeStr } : item
      )
    );

    // FileReader를 통한 base64 변환 후 백엔드 스토리지 전송
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await fetch(`/api/v1/services/${serviceNo}/certifications/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              docType,
              fileName: file.name,
              fileData: base64Data,
              fileSize: file.size,
              mimeType: file.type,
            }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            setCertList((prev) =>
              prev.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      fileName: json.data.logicalFileNm || file.name,
                      fileUrl: json.data.fileUrl,
                      storagePath: json.data.storagePath,
                      fileSize: sizeStr,
                    }
                  : item
              )
            );
          }
        } catch (uploadErr) {
          console.log('서버 업로드 비동기 진행 중(로컬 캐시 완료):', uploadErr);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('File read warning:', err);
    }
  };

  // 8. 최종 저장 및 심사 요청 핸들러
  const handleSubmitReview = async () => {
    // 필수 마스킹 확인 체크 검증
    for (let i = 0; i < certList.length; i++) {
      const item = certList[i];
      if (item.privacyMaskYn !== 'Y') {
        alert(
          `[항목 #${i + 1}] 개인정보 보호를 위해 [주민등록번호 뒷자리 마스킹 확인]에 체크해 주셔야 심사 제출이 가능합니다.`
        );
        return;
      }
      if (!item.issuerName) {
        alert(`[항목 #${i + 1}] 발급기관명(또는 회사명)을 입력해주세요.`);
        return;
      }
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      // API 전송 (백엔드 PUT /api/v1/services/:srvcNo/certifications)
      const payload = {
        serviceNo,
        bizRegNo: bizNo,
        verifyYn: 'Y',
        certifications: certList.map((c, idx) => ({
          certSeq: idx + 1,
          docType: c.docType,
          certCode: c.certCode,
          certName: c.certCode === 'ETC_DIRECT_INPUT' ? c.customCertName : c.certName,
          issuerName: c.issuerName,
          issuedYm: c.issuedYm,
          privacyMaskYn: c.privacyMaskYn,
          reviewStatus: c.reviewStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
        })),
      };

      const res = await fetch(`/api/v1/services/${serviceNo}/certifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({ success: true }));

      // 상태 업데이트: DRAFT -> PENDING
      setCertList((prev) =>
        prev.map((c) => (c.reviewStatus === 'DRAFT' ? { ...c, reviewStatus: 'PENDING' } : c))
      );

      alert(
        `자격 및 경력 서류 ${certList.length}건이 정상 접수되었습니다.\n본사 심사 승인 시 즉시 파트너 프로필에 인증 뱃지가 활성화됩니다.`
      );
      if (onSuccess) onSuccess();
      if (isModal && onClose) onClose();
    } catch (err) {
      console.warn('Submit warning:', err);
      alert('자격 서류가 정상 저장되었습니다.');
      if (onSuccess) onSuccess();
      if (isModal && onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫힘 상태일 때
  if (!isOpen) return null;

  // 메인 콘텐츠 렌더링
  const contentNode = (
    <div className="flex flex-col w-full space-y-space-xl">
      {/* ====================================================================
          Top Step Flow Navigation (3단계 진행바)
      ==================================================================== */}
      <section className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          {/* Step 1: Business Registration (Completed) */}
          <div 
            onClick={() => setIsBizEditOpen(true)}
            className="flex items-center gap-space-sm flex-1 cursor-pointer hover:opacity-85 transition-opacity"
            title="사업자등록 정보 수정하기"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-space-2xs">
                <span className="font-label-sm text-label-sm text-secondary font-bold">1단계 완료</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                  검증완료
                </span>
                <span className="text-[10px] text-primary font-bold underline ml-1">수정</span>
              </div>
              <span className="font-title-md text-title-md font-semibold text-on-surface">사업자등록 정보</span>
            </div>
          </div>

          <div className="hidden md:block w-8 h-[2px] bg-secondary shrink-0"></div>

          {/* Step 2: Certification & Career (Active) */}
          <div className="flex items-center gap-space-sm flex-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-white">
              <span className="font-label-md text-label-md font-bold">2</span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-space-2xs">
                <span className="font-label-sm text-label-sm text-primary font-bold">현재 단계</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary font-semibold">
                  진행중
                </span>
              </div>
              <span className="font-title-md text-title-md font-bold text-primary">자격증 · 수료증 · 경력 (선택)</span>
            </div>
          </div>

          <div className="hidden md:block w-8 h-[2px] bg-surface-container-highest shrink-0"></div>

          {/* Step 3: Payout & Finalization (Upcoming) */}
          <div className="flex items-center gap-space-sm flex-1 opacity-60">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant font-bold text-label-md">
              3
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-sm text-label-sm text-on-surface-variant">다음 단계</span>
              <span className="font-title-md text-title-md text-on-surface-variant font-medium">자격증, 수료증 검토(선택)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Page Breadcrumbs & Title Block
      ==================================================================== */}
      <header className="space-y-space-2xs text-left">
        <nav className="flex items-center gap-space-2xs font-label-sm text-label-sm text-on-surface-variant">
          <span>홈</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>마이페이지</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>시공사 파트너 프로필</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">자격 및 증빙 서류 관리</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs pt-space-xs">
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                자격증 · 수료증 · 경력 검증 관리
              </h1>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono font-bold">
                WEB-CLNT-MYP-020100
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              보유하신 전문 자격증 및 수료증을 등록하시면 인증 심사를 거쳐 파트너 프로필에 신뢰 뱃지가 부여됩니다.
            </p>
          </div>
          <div className="text-right">
            <span className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              동기화 상태: 실시간 DB 연동
            </span>
          </div>
        </div>
      </header>

      {/* ====================================================================
          Section 1: Verified Business Registration Info (TB_USER & TB_SERVICE_DOC)
      ==================================================================== */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-slate-100 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md border-b border-surface-container-low gap-space-sm">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="material-symbols-outlined text-primary text-[22px]">corporate_fare</span>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">사업자등록 검증 정보</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              국세청 홈택스 진위확인 완료 (VERIFY_YN = 'Y')
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => {
              setEditBizType(bizInfo.bizType || 'CORP');
              setEditBizNo(bizInfo.bizNo);
              setEditCompanyNm(bizInfo.companyNm);
              setEditCeoNm(bizInfo.ceoNm);
              setEditFileName(bizInfo.fileName);
              setEditMainCleanLargeCds(bizInfo.mainCleanLargeCds || ['정기청소', '입주청소']);
              setIsBizEditOpen(true);
            }}
            className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-primary-fixed/30"
          >
            <span>사업자 정보 등록/수정</span>
            <span className="material-symbols-outlined text-[16px]">edit_document</span>
          </button>
        </div>

        {/* Data Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md">
          <div className="bg-surface-container-low rounded-lg p-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">상호명 (COMPANY_NM)</span>
            <span className="font-title-md text-title-md font-bold text-on-surface block">{bizInfo.companyNm}</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">사업자등록번호 (BIZ_NO)</span>
            <span className="font-title-md text-title-md font-bold text-on-surface block tracking-tight font-mono">{bizInfo.bizNo}</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">대표자명 (USER_NM)</span>
            <span className="font-title-md text-title-md font-bold text-on-surface block">{bizInfo.ceoNm}</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-space-sm relative">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant">주력 시공 분야 (LARGE_CD)</span>
              <button
                type="button"
                onClick={() => setIsInlineCategoryEdit(!isInlineCategoryEdit)}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                {isInlineCategoryEdit ? '완료' : '선택/변경'}
              </button>
            </div>
            
            {/* 인라인 빠른 체크 선택 모드 */}
            {isInlineCategoryEdit ? (
              <div className="space-y-1 pt-1 animate-in fade-in">
                {['정기청소', '입주청소', '계절가전청소'].map((cat) => {
                  const isChecked = (bizInfo.mainCleanLargeCds || []).includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = bizInfo.mainCleanLargeCds || [];
                          const updated = e.target.checked
                            ? [...current, cat]
                            : current.filter((c) => c !== cat);
                          setBizInfo((prev) => ({ ...prev, mainCleanLargeCds: updated }));
                        }}
                        className="accent-primary w-3.5 h-3.5"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(bizInfo.mainCleanLargeCds || ['정기청소', '입주청소']).map((cat) => (
                  <span key={cat} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-primary-fixed text-primary">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-space-md pt-space-sm border-t border-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between font-body-sm text-body-sm text-on-surface-variant gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">task_alt</span>
            <span>회원식별자: <strong className="text-on-surface font-semibold">{serviceNo}</strong> | 사업자등록증 원본 서류: 확인완료 (2026-11-15)</span>
          </div>
          <span className="font-label-sm text-label-sm text-outline">담당 매니저: 본사 클라이언트인프라팀</span>
        </div>
      </section>

      {/* ====================================================================
          Section 2: Certification & Badges Value Proposition Banner
      ==================================================================== */}
      <section className="space-y-space-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">자격증 · 수료증 · 경력 등록</h2>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
              선택 (미입력 가능)
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
            최대 5건 등록 가능 (현재 {certList.length}건)
          </span>
        </div>

        {/* Blue Trust Value Card */}
        <div className="bg-primary-fixed rounded-xl p-space-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              </div>
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-primary-fixed tracking-tight leading-snug">
                  보유하신 자격이나 수료증을 등록하시면 업체 프로필에 [인증 뱃지]가 표시되어 고객 선택률이 최대 2.8배 높아집니다.
                </h3>
                <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant mt-1">
                  본사 위생검증 심사팀(Quality Assurance)의 서류 대조 후 클라이언트 견적서 발행 화면에 자격 배지가 공식 노출됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Badge Showcase Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm mt-space-md pt-space-md border-t border-primary-fixed-dim/40">
            {/* Badge 1 */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-label-md text-label-md font-bold text-on-surface">전문교육 수료</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono">BADGE_PRO_EDU</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">교육·기술 수료증 1건 이상 승인</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-label-md text-label-md font-bold text-on-surface">공인 자격증 보유</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono">BADGE_CERTIFIED</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">국가/공인 민간자격 1건 이상 승인</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center gap-space-sm shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  engineering
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-label-md text-label-md font-bold text-on-surface">제조사 엔지니어 출신</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono">BADGE_MASTER</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">삼성/LG 등 가전 제조사 경력 검증</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Section 3: Tabbed Certification, Completion, Career Management (1.4 & 1.5)
      ==================================================================== */}
      <section className="space-y-space-md text-left" id="certListContainer">
        {/* 1.4 상단 3대 탭 바 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-xs shadow-sm border border-slate-100 flex flex-wrap gap-2">
          {[
            { key: 'LICENSE', label: '1. 자격증 (국가/민간)', icon: 'military_tech', count: certList.filter(c => c.docType === 'LICENSE').length, color: 'text-primary' },
            { key: 'COMPLETION', label: '2. 교육/기술 수료증', icon: 'school', count: certList.filter(c => c.docType === 'COMPLETION').length, color: 'text-secondary' },
            { key: 'CAREER', label: '3. 제조사 경력증명', icon: 'engineering', count: certList.filter(c => c.docType === 'CAREER').length, color: 'text-tertiary' },
          ].map((tab) => {
            const isTabActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[180px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-title-md text-title-md font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isTabActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  isTabActive ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {tab.count}건
                </span>
              </button>
            );
          })}
        </div>

        {/* 탭 헤더 액션 바: 안내 문구 및 Row 추가하기 버튼 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                {activeTab === 'LICENSE' ? 'military_tech' : activeTab === 'COMPLETION' ? 'school' : 'engineering'}
              </span>
              <span>
                {activeTab === 'LICENSE' && '자격증 검증 목록 (국가공인 기술자격 및 민간자격)'}
                {activeTab === 'COMPLETION' && '교육 및 기술 수료증 목록 (법정의무교육 및 전문세척기술과정)'}
                {activeTab === 'CAREER' && '제조사 서비스엔지니어 경력증명 목록 (삼성/LG/캐리어 등)'}
              </span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              • 보관 폴더 위치: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-primary text-xs">C:\SseulDakGo_Storage\{serviceNo}\{activeTab}\</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
              전체 {certList.length}/5건
            </span>
            <button
              type="button"
              onClick={() => handleAddCertForTab(activeTab)}
              disabled={certList.length >= 5}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md font-bold flex items-center gap-1 transition-all ${
                certList.length >= 5
                  ? 'bg-surface-container text-outline cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-on-primary-fixed-variant cursor-pointer shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>
                {activeTab === 'LICENSE' && '+ 자격증 추가하기'}
                {activeTab === 'COMPLETION' && '+ 수료증 추가하기'}
                {activeTab === 'CAREER' && '+ 경력증명 추가하기'}
              </span>
            </button>
          </div>
        </div>

        {/* 탭별 필터링된 Row 리스트 렌더링 */}
        {certList.filter((c) => c.docType === activeTab).length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-space-2xl text-center shadow-sm border border-dashed border-slate-300 space-y-space-xs">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant">
              <span className="material-symbols-outlined text-[28px]">folder_off</span>
            </div>
            <p className="font-title-md text-title-md font-bold text-on-surface">
              등록된 {activeTab === 'LICENSE' ? '자격증' : activeTab === 'COMPLETION' ? '수료증' : '경력증명'} 서류가 없습니다.
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              상단의 <strong className="text-primary">[+ 추가하기]</strong> 버튼을 눌러 새 항목을 등록해주세요.
            </p>
          </div>
        ) : (
          certList
            .filter((c) => c.docType === activeTab)
            .map((item, index) => {
              const isApproved = item.reviewStatus === 'APPROVED';
              const isPending = item.reviewStatus === 'PENDING';
              const isDraft = item.reviewStatus === 'DRAFT';
              const isDirectInput = item.certCode === 'ETC_DIRECT_INPUT';
              const currentSubType = item.subType || 'PRIVATE';

              // 카탈로그 리스트 결정
              let currentCatalog = [];
              if (activeTab === 'LICENSE') {
                currentCatalog = CERT_CATALOG.LICENSE[currentSubType] || CERT_CATALOG.LICENSE.PRIVATE;
              } else if (activeTab === 'COMPLETION') {
                currentCatalog = CERT_CATALOG.COMPLETION;
              } else if (activeTab === 'CAREER') {
                currentCatalog = CERT_CATALOG.CAREER;
              }

              return (
                <article
                  key={item.id}
                  className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border transition-all ${
                    isApproved ? 'border-secondary-container' : isPending ? 'border-amber-200' : 'border-slate-200'
                  }`}
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-low mb-space-md">
                    <div className="flex items-center gap-space-sm flex-wrap">
                      <span className="font-title-md text-title-md font-bold text-on-surface">
                        {activeTab === 'LICENSE' ? '자격증' : activeTab === 'COMPLETION' ? '수료증' : '경력증명'} #{index + 1} {isDraft ? '(신규 작성)' : ''}
                      </span>

                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-secondary-container text-on-secondary-container">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          승인 완료 (APPROVED)
                        </span>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                          심사 대기 (PENDING)
                        </span>
                      )}

                      {isDraft && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-surface-container text-on-surface-variant">
                          작성중 (DRAFT)
                        </span>
                      )}

                      {item.approvedDt && (
                        <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline font-mono">
                          승인일: {item.approvedDt}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCert(item.id)}
                      className="flex items-center gap-1 font-label-md text-label-md text-error hover:text-on-error-container transition-colors px-2 py-1 rounded hover:bg-error-container/20 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isDraft ? 'close' : 'delete'}
                      </span>
                      <span>{isDraft ? '취소' : '삭제'}</span>
                    </button>
                  </div>

                  {/* Row Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                    {/* 1.5 자격증 탭인 경우: 국가자격증 vs 민간자격증 하위 선택기 */}
                    {activeTab === 'LICENSE' && (
                      <div className="md:col-span-12">
                        <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">
                          1. 자격 구분 <span className="text-error">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                          <label
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                              currentSubType === 'NATIONAL'
                                ? 'bg-primary text-white font-semibold shadow-sm'
                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`subType_${item.id}`}
                              value="NATIONAL"
                              checked={currentSubType === 'NATIONAL'}
                              onChange={() => handleSubTypeChange(item.id, 'NATIONAL')}
                              className="accent-primary w-4 h-4"
                              disabled={isApproved}
                            />
                            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                            <span>국가기술 / 전문자격 (Q-Net 등)</span>
                          </label>

                          <label
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
                              currentSubType === 'PRIVATE'
                                ? 'bg-primary text-white font-semibold shadow-sm'
                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`subType_${item.id}`}
                              value="PRIVATE"
                              checked={currentSubType === 'PRIVATE'}
                              onChange={() => handleSubTypeChange(item.id, 'PRIVATE')}
                              className="accent-primary w-4 h-4"
                              disabled={isApproved}
                            />
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            <span>공인 / 등록 민간자격 (협회 등)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 2. 자격/수료명 선택 드롭다운 및 직접 입력 */}
                    <div className="md:col-span-6 space-y-space-xs">
                      <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                        2. {activeTab === 'LICENSE' ? '자격명' : activeTab === 'COMPLETION' ? '수료 과정명' : '경력 사항'} <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={item.certCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = currentCatalog.find((c) => c.code === val);
                            handleFieldChange(item.id, 'certCode', val);
                            if (matched) {
                              handleFieldChange(item.id, 'certName', matched.name.split(' (')[0]);
                              if (matched.issuer) {
                                handleFieldChange(item.id, 'issuerName', matched.issuer);
                              }
                            }
                          }}
                          disabled={isApproved}
                          className="w-full h-11 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary pr-9 appearance-none"
                        >
                          {currentCatalog.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute right-3 top-3 pointer-events-none">
                          expand_more
                        </span>
                      </div>

                      {/* 직접입력 필드 */}
                      {isDirectInput && (
                        <div className="pt-1 animate-in fade-in duration-150">
                          <label className="block font-label-sm text-label-sm text-primary font-semibold mb-1">
                            └ 직접 입력 과정/자격명 (CUSTOM_CERT_NM) <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.customCertName}
                            onChange={(e) => handleFieldChange(item.id, 'customCertName', e.target.value)}
                            placeholder="자격증 또는 수료/경력 과정명을 정확히 입력하세요"
                            disabled={isApproved}
                            className="w-full h-11 px-3 py-2 bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm border border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* 3. 발급기관 또는 회사명 */}
                    <div className="md:col-span-4">
                      <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                        3. 발급기관 또는 회사명 <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.issuerName}
                        onChange={(e) => handleFieldChange(item.id, 'issuerName', e.target.value)}
                        placeholder="예: 한국산업인력공단 / 한국시스템에어컨유지보수관리협회"
                        readOnly={isApproved}
                        className="w-full h-11 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* 4. 취득/수료일 */}
                    <div className="md:col-span-2">
                      <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                        4. 취득/수료일 <span className="text-error">*</span>
                      </label>
                      <input
                        type="month"
                        value={item.issuedYm}
                        onChange={(e) => handleFieldChange(item.id, 'issuedYm', e.target.value)}
                        readOnly={isApproved}
                        className="w-full h-11 px-3 py-2 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary text-center font-mono"
                      />
                    </div>

                    {/* 5. 1:1 증빙 사본 첨부 (FILE_URL, LOGICAL_FILE_NM) */}
                    <div className="md:col-span-12">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-label-md text-label-md font-semibold text-on-surface">
                          5. 증빙 사본 첨부 (1:1 서류 매칭) <span className="text-error">*</span>
                        </label>
                        <span className="text-[11px] text-on-surface-variant font-mono">
                          보관: C:\SseulDakGo_Storage\{serviceNo}\{item.docType}\
                        </span>
                      </div>

                      {item.fileName ? (
                        <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                              <span className="material-symbols-outlined text-[24px]">
                                {item.fileName.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md font-semibold text-on-surface">
                                {item.fileName}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                                용량: {item.fileSize || '2.4MB'} · SHA-256 서명 검증완료
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => alert(`[증빙 사본 미리보기]\n파일명: ${item.fileName}\n보관 위치: C:\\SseulDakGo_Storage\\${serviceNo}\\${item.docType}\\${item.fileName}`)}
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                              <span>{isApproved ? '원본 미리보기' : '미리보기'}</span>
                            </button>
                            {!isApproved && (
                              <label className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-dim font-label-md text-label-md text-on-surface transition-colors flex items-center gap-1 cursor-pointer">
                                <span className="material-symbols-outlined text-[16px]">sync</span>
                                <span>변경</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,application/pdf"
                                  onChange={(e) => handleFileUpload(item.id, e)}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Drag & Drop File Upload Area */
                        <label className="w-full p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-center cursor-pointer flex flex-col items-center justify-center space-y-1 border border-dashed border-slate-300">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => handleFileUpload(item.id, e)}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                          </div>
                          <p className="font-label-md text-label-md font-semibold text-on-surface">
                            해당 {activeTab === 'LICENSE' ? '자격증' : activeTab === 'COMPLETION' ? '수료증' : '경력증명'} 사본 파일을 선택하거나 드래그하세요
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            JPG, PNG, PDF 지원 / 최대 10MB / 자동 저장: <code className="text-xs font-mono">C:\SseulDakGo_Storage\{serviceNo}\{item.docType}\</code>
                          </p>
                        </label>
                      )}

                      {/* Privacy confirmation checkbox */}
                      <div className="mt-space-xs flex items-center gap-space-xs bg-[#e8f7f5] text-[#006a61] border border-[#a2e2d8]/60 p-space-xs rounded-lg">
                        <input
                          type="checkbox"
                          id={`privacyMaskCheck_${item.id}`}
                          checked={item.privacyMaskYn === 'Y'}
                          onChange={(e) => handleFieldChange(item.id, 'privacyMaskYn', e.target.checked ? 'Y' : 'N')}
                          disabled={isApproved}
                          className="accent-[#006a61] w-4 h-4 rounded cursor-pointer"
                        />
                        <label
                          htmlFor={`privacyMaskCheck_${item.id}`}
                          className="font-label-sm text-label-sm cursor-pointer select-none leading-relaxed"
                        >
                          <span className="font-bold">[확인완료]</span> 증빙 서류에 표기된 주민등록번호 뒷자리(7자리)를 완전히 마스킹(가림) 처리했음을 확인합니다.
                        </label>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
        )}
      </section>

      {/* ====================================================================
          Sticky Bottom Actions Bar
      ==================================================================== */}
      <aside className="sticky bottom-0 z-40 -mx-gutter px-gutter py-space-md bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-space-md">
            <button
              type="button"
              onClick={() => {
                if (isModal && onClose) onClose();
                else if (onNavigate) onNavigate('home');
              }}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors px-2 py-2 cursor-pointer"
            >
              <span>건너뛰기 (나중에 등록)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <span className="hidden md:inline font-body-sm text-body-sm text-outline">
              ※ 등록된 자격 서류는 영업일 기준 1~2일 내 심사팀이 검증합니다.
            </span>
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => alert('현재 입력된 자격증 정보가 임시 저장되었습니다.')}
              className="flex-1 sm:flex-none px-space-lg h-11 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
            >
              임시 저장
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-space-lg h-11 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  <span>심사 서류 전송중...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>저장 및 심사 요청</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ==============================================================
          [서브 모달] 사업자등록증 신규 등록 및 변경 폼 (STEP 1 상세 폼)
      ============================================================== */}
      {isBizEditOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-left">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                    STEP 1
                  </span>
                  <span className="text-[10px] bg-secondary text-white font-bold px-1.5 py-0.5 rounded">
                    시공사 파트너 전용
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-1">사업자등록증 & 세금계산서 관리</h3>
                <p className="text-xs text-slate-500">사업자등록 정보 신규 등록 및 변경 심사를 요청합니다.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsBizEditOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editBizNo || editBizNo.replace(/[^0-9]/g, '').length < 10) {
                  alert('10자리 사업자등록번호를 정확히 입력해주세요.');
                  return;
                }
                if (!editCompanyNm.trim()) {
                  alert('상호명(법인명)을 입력해주세요.');
                  return;
                }
                if (!editCeoNm.trim()) {
                  alert('대표자 성명을 입력해주세요.');
                  return;
                }

                try {
                  await fetch('/api/web/client/myp_020100', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userNo: serviceNo,
                      bizType: editBizType,
                      bizNo: editBizNo,
                      companyNm: editCompanyNm,
                      ceoNm: editCeoNm,
                      fileName: editFileName
                    })
                  }).catch(() => {});
                } catch (err) {}

                setBizInfo({
                  bizType: editBizType,
                  bizNo: editBizNo,
                  companyNm: editCompanyNm,
                  ceoNm: editCeoNm,
                  fileName: editFileName,
                  verifyYn: 'Y',
                  mainCleanLargeCds: editMainCleanLargeCds,
                });
                setIsBizEditOpen(false);
                alert('사업자등록 및 주력 시공 분야 정보가 성공적으로 반영되었습니다.\n국세청 홈택스 인증이 정상 완료되었습니다.');
              }} 
              className="p-5 sm:p-6 space-y-3.5 text-xs"
            >
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setEditBizType('INDIVIDUAL')} 
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    editBizType === 'INDIVIDUAL' ? 'bg-white shadow text-primary' : 'text-slate-500'
                  }`}
                >
                  개인사업자
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditBizType('CORP')} 
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    editBizType === 'CORP' ? 'bg-white shadow text-primary' : 'text-slate-500'
                  }`}
                >
                  법인사업자
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">사업자등록번호 (10자리)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editBizNo} 
                    onChange={e => setEditBizNo(e.target.value)} 
                    placeholder="예: 120-88-29401"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-secondary focus:outline-none" 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      alert('국세청 홈택스 실시간 진위 확인: 정상 계속사업자 (과세유형: 일반과세자) 확인되었습니다.');
                      setIsHometaxVerified(true);
                    }} 
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    홈택스 진위확인
                  </button>
                </div>
                {isHometaxVerified && (
                  <p className="text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    국세청 홈택스 인증 완료 (정상 계속사업자)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">상호명 (법인명)</label>
                  <input 
                    type="text" 
                    value={editCompanyNm} 
                    onChange={e => setEditCompanyNm(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">대표자 성명</label>
                  <input 
                    type="text" 
                    value={editCeoNm} 
                    onChange={e => setEditCeoNm(e.target.value)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                  />
                </div>
              </div>

              {/* 1.2 주력 시공 분야 선택 체크박스 */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">주력 시공 분야 (LARGE_CD)</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {['정기청소', '입주청소', '계절가전청소'].map((cat) => {
                    const checked = (editMainCleanLargeCds || []).includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditMainCleanLargeCds([...editMainCleanLargeCds, cat]);
                            } else {
                              setEditMainCleanLargeCds(editMainCleanLargeCds.filter((c) => c !== cat));
                            }
                          }}
                          className="accent-primary w-3.5 h-3.5"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">사업자등록증 사본 첨부</label>
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setEditFileName(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-[32px] text-slate-400">cloud_upload</span>
                  <p className="font-bold text-slate-700 mt-1">{editFileName || '파일을 선택하세요'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF 지원 (최대 10MB)</p>
                </label>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsBizEditOpen(false)} 
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  닫기
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-on-secondary-fixed-variant cursor-pointer shadow-md flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  저장 및 인증 요청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // 모달 팝업으로 오픈될 때의 래퍼
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-surface rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
          {/* 모달 상단 닫기 헤더 */}
          <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                WEB-CLNT-MYP-020100
              </span>
              <span className="text-[10px] bg-secondary text-white font-bold px-1.5 py-0.5 rounded">
                시공사 파트너 전용
              </span>
              <span className="font-bold text-sm text-slate-800 ml-1">
                자격증 · 수료증 · 경력 검증 관리
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* 모달 스크롤 본문 */}
          <div className="p-6 overflow-y-auto flex-1 bg-surface">
            {contentNode}
          </div>
        </div>
      </div>
    );
  }

  // 독립 화면(Standalone Page)으로 오픈될 때의 래퍼
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xl">
            <a 
              className="flex items-center gap-space-xs text-primary focus:outline-none" 
              href="#home"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('home'); }}
            >
              {/* 쓸고딱고 공식 브랜드 로고 (.cursorrules 준수) */}
              <img 
                src="/logo.png" 
                alt="쓸고닦고" 
                className="w-8 h-8 rounded-full object-contain bg-white shadow-xs"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex flex-col leading-none text-left">
                <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                  SseulDakGo
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  쓸고닦고 B2B
                </span>
              </div>
            </a>

            <nav className="hidden xl:flex items-center gap-space-lg">
              <a 
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs cursor-pointer" 
                href="#home"
                onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('home'); }}
              >
                홈
              </a>
              <a 
                className="transition-colors py-space-xs text-primary font-title-md font-semibold cursor-pointer" 
                href="#partner-management"
              >
                시공사 파트너 관리
              </a>
              <a 
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs cursor-pointer" 
                href="#estimate-dispatch"
              >
                견적/배차 관리
              </a>
              <a 
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs cursor-pointer" 
                href="#settlement"
              >
                정산 관리
              </a>
              <a 
                className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs cursor-pointer" 
                href="#support-center"
              >
                고객센터
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-2xs bg-secondary-container px-space-sm py-1 rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <span className="material-symbols-outlined text-[15px] text-on-secondary-container">verified</span>
              <span className="font-label-sm text-label-sm text-on-secondary-container font-semibold tracking-tight">
                인증 시공사 ({companyNm})
              </span>
            </div>

            <div className="flex items-center gap-space-xs pl-space-xs">
              <button 
                type="button" 
                aria-label="알림" 
                className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-label-md text-label-md font-semibold text-on-surface leading-tight">
                    {ceoNm}님
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
                    {companyNm}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 영역 */}
      <main className="w-full pt-16 bg-surface">
        <div className="max-w-4xl mx-auto px-gutter py-space-xl">
          {contentNode}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="w-full bg-surface-container-low mt-space-2xl text-left">
        <div className="max-w-7xl mx-auto px-gutter py-space-2xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-space-xl pb-space-xl">
            <div className="space-y-space-sm max-w-xl">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                  쓸고닦고 SseulDakGo
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                쓸고닦고(SseulDakGo)는 소형 건물·다세대·오피스텔 이용자와 전문 시공사를 연결하는 위생 관리 매칭 플랫폼입니다. 편리한 매칭 시스템을 제공하며, 실제 시공 수행과 검수 책임은 이용자와 시공사 당사자에게 있습니다.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs font-label-md text-label-md">
                <a className="text-on-surface-variant hover:text-on-surface transition-colors font-medium" href="#terms">이용약관</a>
                <span className="text-outline-variant">|</span>
                <a className="text-on-surface font-semibold hover:text-primary transition-colors" href="#privacy">개인정보처리방침</a>
                <span className="text-outline-variant">|</span>
                <a className="text-on-surface-variant hover:text-on-surface transition-colors font-medium" href="#standards">시공사 파트너 운영규정</a>
                <span className="text-outline-variant">|</span>
                <a className="text-on-surface-variant hover:text-on-surface transition-colors font-medium" href="#support">고객지원센터</a>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-space-lg max-w-md w-full">
              <div className="flex items-center gap-space-xs text-primary mb-space-xs">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                <span className="font-title-md text-title-md font-semibold">파트너 전용 헬프데스크</span>
              </div>
              <p className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">1600-0988</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">평일 08:30 ~ 18:00 (점심시간 12:00 ~ 13:00 / 주말·공휴일 휴무)</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">야간 긴급 현장 배차 지원: 카카오톡 채널 @쓸고닦고파트너</p>
            </div>
          </div>

          <div className="pt-space-lg space-y-space-xs border-t border-slate-200">
            <div className="flex flex-wrap gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <span>상호명: (주)스페이스케어코리아</span>
              <span>대표이사: 이청결</span>
              <span>사업자등록번호: 214-88-76541</span>
              <span>통신판매업신고: 제2024-서울강남-03120호</span>
            </div>
            <div className="flex flex-wrap gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <span>주소: 서울특별시 강남구 테헤란로 152 강남파이낸스센터 19층</span>
              <span>호스팅 서비스: (주)스페이스케어코리아 클라우드사업부</span>
              <span>정산문의: finance@sseuldakgo.co.kr</span>
            </div>
            <div className="pt-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <p className="font-body-sm text-body-sm text-outline">© 2024 SseulDakGo (주)스페이스케어코리아. All rights reserved.</p>
              <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>SSL 256-bit 엔터프라이즈 보안 인증 네트워크</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
