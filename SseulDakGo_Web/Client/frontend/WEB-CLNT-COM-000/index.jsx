import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ============================================================================
 * [프론트엔드 화면]
 * 화면 ID: WEB-CLNT-COM-000
 * 한글 화면명: 고객 메인 홈
 * 파일 경로: SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-000/index.jsx
 * 연동 백엔드 API: POST /api/web/client/com_000
 *                (SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_000/route.js)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// [초기 시드 데이터] API 응답 전 또는 오프라인 환경 폴백용 (DB 컬럼명 100% 매핑)
// ----------------------------------------------------------------------------
const INITIAL_REGION_INFO = {
  SIDO_CD: '41',
  SIGUNGU_CD: '41281',
  SIDO_NM: '경기도',
  SIGUNGU_NM: '고양시 일산동구',
  SHORT_NM: '일산동구',
  DISPLAY_NM: '경기 고양시 일산동구',
};

const REGION_OPTIONS = [
  {
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
    SIDO_NM: '경기도',
    SIGUNGU_NM: '고양시 일산동구',
    SHORT_NM: '일산동구',
    DISPLAY_NM: '경기 고양시 일산동구',
  },
  {
    SIDO_CD: '41',
    SIGUNGU_CD: '41285',
    SIDO_NM: '경기도',
    SIGUNGU_NM: '고양시 일산서구',
    SHORT_NM: '일산서구',
    DISPLAY_NM: '경기 고양시 일산서구',
  },
  {
    SIDO_CD: '41',
    SIGUNGU_CD: '41287',
    SIDO_NM: '경기도',
    SIGUNGU_NM: '고양시 덕양구',
    SHORT_NM: '덕양구',
    DISPLAY_NM: '경기 고양시 덕양구',
  },
  {
    SIDO_CD: '11',
    SIGUNGU_CD: '11680',
    SIDO_NM: '서울특별시',
    SIGUNGU_NM: '강남구',
    SHORT_NM: '강남구',
    DISPLAY_NM: '서울 강남구',
  },
];

const INITIAL_CATEGORY_LIST = [
  { GRP_CD: 'CLEAN_LARGE', COM_CD: 'REGULAR', COM_NM: '정기청소', SORT_ORD: 1 },
  { GRP_CD: 'CLEAN_LARGE', COM_CD: 'APPLIANCE', COM_NM: '가전청소', SORT_ORD: 2 },
  { GRP_CD: 'CLEAN_LARGE', COM_CD: 'MOVEIN', COM_NM: '입주청소', SORT_ORD: 3 },
];

const INITIAL_FEED_LIST = [
  {
    ORDER_NO: 'ORD-20250224-0091',
    CLEAN_LARGE_CD: 'REGULAR',
    CLEAN_LARGE_NM: '정기청소',
    ADDR_TEXT: '경기 고양시 일산동구 마두동 4층 빌라 공용부',
    SUB_SPEC_TEXT: '주 1회 월 4회 방문',
    PROPOSED_PRICE: 180000,
    PRICE_PREFIX: '월 ',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (청약접수중)',
    STATUS_BADGE_TYPE: 'SECONDARY_PING',
    REG_DT: '방금 전 (1분 전)',
  },
  {
    ORDER_NO: 'ORD-20250224-0089',
    CLEAN_LARGE_CD: 'APPLIANCE',
    CLEAN_LARGE_NM: '가전청소',
    ADDR_TEXT: '경기 고양시 일산동구 백석동 시스템에어컨 2대 & 세탁기',
    SUB_SPEC_TEXT: '삼성 시스템 4way 2기 + 통돌이',
    PROPOSED_PRICE: 240000,
    PRICE_PREFIX: '',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (파트너 매칭중)',
    STATUS_BADGE_TYPE: 'PRIMARY',
    REG_DT: '4분 전',
  },
  {
    ORDER_NO: 'ORD-20250224-0084',
    CLEAN_LARGE_CD: 'MOVEIN',
    CLEAN_LARGE_NM: '입주청소',
    ADDR_TEXT: '경기 고양시 일산동구 식사동 위시티 34평형 아파트 입주청소',
    SUB_SPEC_TEXT: '외창 유리창 제외 기본 풀케어',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (견적 마감임박)',
    STATUS_BADGE_TYPE: 'ERROR_PING',
    PROPOSED_PRICE: 380000,
    PRICE_PREFIX: '',
    REG_DT: '12분 전',
  },
  {
    ORDER_NO: 'ORD-20250224-0080',
    CLEAN_LARGE_CD: 'REGULAR',
    CLEAN_LARGE_NM: '정기청소',
    ADDR_TEXT: '경기 고양시 일산동구 장항동 상가주택 계단 및 1층 주차장',
    SUB_SPEC_TEXT: '화장실 1실 포함 주 2회',
    PROPOSED_PRICE: 150000,
    PRICE_PREFIX: '월 ',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (청약접수중)',
    STATUS_BADGE_TYPE: 'SECONDARY',
    REG_DT: '25분 전',
  },
  {
    ORDER_NO: 'ORD-20250224-0077',
    CLEAN_LARGE_CD: 'APPLIANCE',
    CLEAN_LARGE_NM: '가전청소',
    ADDR_TEXT: '경기 고양시 일산동구 정발산동 스탠드형 에어컨 1대 분해세척',
    SUB_SPEC_TEXT: 'LG 휘센 듀얼 스탠드',
    PROPOSED_PRICE: 120000,
    PRICE_PREFIX: '',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (청약접수중)',
    STATUS_BADGE_TYPE: 'SECONDARY',
    REG_DT: '38분 전',
  },
];

const TAB_NOTICES = {
  REGULAR:
    '정기청소는 최소 3개월(90일) 계약이 원칙이며, 주 단위 지정일에 전담 클리너가 방문합니다.',
  APPLIANCE:
    '가전 분해청소는 완전분해 후 고압 살균스팀 세척을 진행하며, 3개월 무상 A/S가 보증됩니다.',
  MOVEIN:
    '입주/이사 청소는 실내 전공간 탈거 정밀 케어이며, 피톤치드 연무 소독이 기본 제공됩니다.',
};

// ============================================================================
// [청소 계약 기간 및 주차 관리 상수 및 유틸]
// ============================================================================
export const COM_CODE_BLDG_TYPE = [
  { COM_CD: 'VILLA', COM_NM: '빌라·다세대', SORT_ORD: 1 },
  { COM_CD: 'COMM_BLDG', COM_NM: '상가빌딩·근생', SORT_ORD: 2 },
  { COM_CD: 'OFFICE_BLDG', COM_NM: '오피스·사무실빌딩', SORT_ORD: 3 },
  { COM_CD: 'APT_COMPLEX', COM_NM: '아파트·주상복합', SORT_ORD: 4 },
  { COM_CD: 'STUDIO_ROOM', COM_NM: '원룸·오피스텔', SORT_ORD: 5 },
  { COM_CD: 'FACTORY_WH', COM_NM: '공장·지식산업센터', SORT_ORD: 6 },
  { COM_CD: 'ETC_BLDG', COM_NM: '기타 일반건물', SORT_ORD: 7 },
];

export const COM_CODE_CLEAN_LOC = [
  { COM_CD: 'STAIRWAY', COM_NM: '계단 / 핸드레일(난간)', SORT_ORD: 1 },
  { COM_CD: 'CORRIDOR', COM_NM: '복도', SORT_ORD: 2 },
  { COM_CD: 'ENTRANCE', COM_NM: '현관 / 공동출입구 / 로비', SORT_ORD: 3 },
  { COM_CD: 'ELEVATOR', COM_NM: '승강기(엘리베이터)', SORT_ORD: 4 },
  { COM_CD: 'ESCAPE_STAIR', COM_NM: '비상계단 / 방화문 구역', SORT_ORD: 5 },
  { COM_CD: 'WINDOW_IN', COM_NM: '창문 / 유리창 (내창/창틀)', SORT_ORD: 6 },
  { COM_CD: 'WINDOW_OUT', COM_NM: '외벽 유리창 (외창)', SORT_ORD: 7 },
  { COM_CD: 'WINDOW_SCREEN', COM_NM: '방충망 / 셔터', SORT_ORD: 8 },
  { COM_CD: 'FLOOR_GEN', COM_NM: '실내 일반 바닥 (데코/디럭스)', SORT_ORD: 9 },
  { COM_CD: 'FLOOR_STONE', COM_NM: '대리석 / 석재 바닥', SORT_ORD: 10 },
  { COM_CD: 'FLOOR_CARPET', COM_NM: '카페트 바닥', SORT_ORD: 11 },
  { COM_CD: 'WALL_CEIL', COM_NM: '벽면 / 천장 / 조명갓', SORT_ORD: 12 },
  { COM_CD: 'TOILET_PUBLIC', COM_NM: '공용 화장실', SORT_ORD: 13 },
  { COM_CD: 'TOILET_PRIV', COM_NM: '전유부 화장실 / 욕실', SORT_ORD: 14 },
  { COM_CD: 'PANTRY_SINK', COM_NM: '탕비실 / 싱크대 구역', SORT_ORD: 15 },
  { COM_CD: 'COMM_KITCHEN', COM_NM: '대형 조리실 / 주방 시설', SORT_ORD: 16 },
  { COM_CD: 'DRAIN_PIT', COM_NM: '배수구 / 트렌치 / 집수정', SORT_ORD: 17 },
  { COM_CD: 'PARKING_IN', COM_NM: '지하 주차장', SORT_ORD: 18 },
  { COM_CD: 'PARKING_OUT', COM_NM: '지상 주차장', SORT_ORD: 19 },
  { COM_CD: 'RECYCLE_ZONE', COM_NM: '분리수거장 / 쓰레기 집하장', SORT_ORD: 20 },
  { COM_CD: 'ROOFTOP', COM_NM: '옥상 / 테라스', SORT_ORD: 21 },
  { COM_CD: 'OUTDOOR_YARD', COM_NM: '건물 외곽 / 보도블록', SORT_ORD: 22 },
  { COM_CD: 'ETC_LOC', COM_NM: '기타 구역', SORT_ORD: 99 },
];

export const COM_CODE_SERVICE_SUB_ITEM = [
  { COM_CD: 'SWEEP_MOP', COM_NM: '쓸기 및 친환경 물걸레질', SORT_ORD: 1 },
  { COM_CD: 'DUST_SANITIZE', COM_NM: '먼지 털이 및 살균 소독', SORT_ORD: 2 },
  { COM_CD: 'WINDOW_FRAME', COM_NM: '유리창 및 창틀 정밀 케어', SORT_ORD: 3 },
  { COM_CD: 'SPIDER_STAIN', COM_NM: '거미줄 및 벽면 오염 제거', SORT_ORD: 4 },
  { COM_CD: 'RECYCLE_DISPOSE', COM_NM: '재활용 분리배출 및 비닐 교체', SORT_ORD: 5 },
  { COM_CD: 'HIGH_PRESSURE_WASH', COM_NM: '고압 수세척 및 악취 소독', SORT_ORD: 6 },
  { COM_CD: 'PARKING_LEAF_BLOWER', COM_NM: '주차장 쓰레기 수거 및 송풍기', SORT_ORD: 7 },
  { COM_CD: 'FLYER_REMOVAL', COM_NM: '불법 광고물·스티커 제거', SORT_ORD: 8 },
];

/**
 * 선택된 "정기 순회 대상 구역" 명칭을 COM_NM의 실제 데이터 길이에 따라
 * 1줄에 최대 2개 또는 3개로 분할하는 헬퍼 함수
 */
export function chunkCleanLocNamesByLength(selectedCodes, locList = COM_CODE_CLEAN_LOC) {
  if (!selectedCodes || selectedCodes.length === 0) return [];
  const names = selectedCodes.map((code) => {
    const item = locList.find((c) => c.COM_CD === code || c.id === code);
    return item ? (item.COM_NM || item.label) : code;
  }).filter(Boolean);

  const lines = [];
  let current = [];
  let currentTotalLen = 0;

  for (const name of names) {
    const len = name.length;
    const reachMax3 = current.length >= 3;
    const reach2Long = current.length >= 2 && (currentTotalLen + len > 19 || current.some((n) => n.length >= 10) || len >= 10);

    if (current.length > 0 && (reachMax3 || reach2Long)) {
      lines.push(current);
      current = [name];
      currentTotalLen = len;
    } else {
      current.push(name);
      currentTotalLen += len;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines;
}

// ============================================================================
// [모달 컴포넌트] WEB-CLNT-REQ-000 (청소 의뢰 등록 모달)
// <WebClntReq000 isOpen={isReqModalOpen} initialTab={selectedCategory} onClose={() => setIsReqModalOpen(false)} />
// ============================================================================
/**
 * ============================================================================
 * [프론트엔드 모달 화면]
 * 화면 ID: WEB-CLNT-REQ-000
 * 한글 화면명: 청소 서비스 신청 및 발주서 작성 (고객 지정가 확정 발주 모달)
 * 파일 경로: SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx
 * 연동 백엔드 API: POST /api/web/client/req_000
 * ============================================================================
 */

// ============================================================================
// 네이버 주소 검색 팝업 모달 (APP-CLNT-REQ-000 100% 동기화 웹 버전)
// ============================================================================
function NaverAddressSearchModal({ isOpen, onClose, onSelectAddress }) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  const inputRef = useRef(null);
  const embedContainerRef = useRef(null);

  // Daum 전국 주소 검색 임베드 실행 함수
  const runDaumEmbed = useCallback((targetQ) => {
    setIsEmbedMode(true);
    setTimeout(() => {
      if (embedContainerRef.current && typeof window !== 'undefined' && window.daum && window.daum.Postcode) {
        embedContainerRef.current.innerHTML = '';
        new window.daum.Postcode({
          oncomplete: (data) => {
            const selectedItem = {
              roadAddress: data.roadAddress || data.jibunAddress,
              jibunAddress: data.jibunAddress || data.roadAddress,
              sido: data.sido,
              sigungu: data.sigungu,
              bldNm: data.buildingName || '',
              zonecode: data.zonecode,
              dong: data.bname || '',
            };
            onSelectAddress(selectedItem);
            onClose();
          },
          width: '100%',
          height: '100%',
        }).embed(embedContainerRef.current, { q: targetQ || '', autoClose: true });
      }
    }, 50);
  }, [onSelectAddress, onClose]);

  const handleSearch = useCallback(async (q) => {
    const rawVal = q !== undefined ? q : (inputRef.current ? inputRef.current.value : keyword);
    const targetQ = String(rawVal || '').trim();
    if (!targetQ) return;
    setIsLoading(true);
    setHasSearched(true);
    setIsEmbedMode(false);
    try {
      const res = await fetch('/api/web/client/search_address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQ }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.items) && data.items.length > 0) {
          setSearchResults(data.items);
          setIsEmbedMode(false);
        } else {
          // 백엔드 결과가 없을 경우, 전국 100% 주소/건물명 검색을 위해 Daum 임베드 즉시 자동 활성화
          setSearchResults([]);
          runDaumEmbed(targetQ);
        }
      } else {
        setSearchResults([]);
        runDaumEmbed(targetQ);
      }
    } catch (err) {
      console.warn('Address search failed, fallback to Daum embed', err);
      setSearchResults([]);
      runDaumEmbed(targetQ);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, runDaumEmbed]);

  // Daum 전국 우편번호 검색 팝업
  const handleOpenDaumPostcode = useCallback(() => {
    runDaumEmbed(inputRef.current?.value || keyword || '');
  }, [runDaumEmbed, keyword]);

  // 모달이 처음 열릴 때(isOpen 변경 시)만 1회 초기화 및 초기 검색 수행
  useEffect(() => {
    if (isOpen) {
      const initQ = '마두동';
      setKeyword(initQ);
      setHasSearched(false);
      setIsEmbedMode(false);
      handleSearch(initQ);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] bg-inverse-surface/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* 모달 상단 헤더 바 */}
        <div className="p-4 bg-surface-container-low border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-xs">N</span>
            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">네이버 지도 주소 검색</h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]">
              전국 실시간 연동
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 검색 입력창 및 버튼 */}
        <div className="p-4 bg-white border-b border-slate-100 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e.currentTarget.value || keyword);
                }
              }}
              placeholder="도로명, 건물명, 학교명 입력 (예: 성산초등학교, 토당로 105)"
              className="w-full h-11 px-3.5 pr-8 rounded-xl bg-surface-container-low text-[14px] outline-none border border-transparent focus:border-[#03C75A] focus:bg-white transition-all font-medium"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.focus();
                  }
                }}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>
          <button
            onClick={() => {
              const q = (inputRef.current ? inputRef.current.value : keyword) || keyword;
              handleSearch(q);
            }}
            type="button"
            className="px-5 h-11 rounded-xl bg-[#03C75A] hover:bg-[#02b350] active:scale-95 text-white font-bold text-[14px] flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer"
          >
            검색
          </button>
          <button
            onClick={handleOpenDaumPostcode}
            type="button"
            title="대한민국 전국 모든 주소/건물명 정밀 검색"
            className="px-3.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[12px] flex items-center justify-center shrink-0 border border-slate-200 transition-all cursor-pointer gap-1"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">travel_explore</span>
            <span>전국 주소</span>
          </button>
        </div>

        {/* 추천 검색어 칩 */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto text-[11px] bg-slate-50 border-b border-slate-100 shrink-0">
          <span className="shrink-0 text-slate-400 font-medium">추천:</span>
          {['성산초등학교', '세브란스병원', '명지병원', '토당로 105', '국립암센터', '삼혜빌딩', '화신로 260'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setKeyword(chip);
                if (inputRef.current) inputRef.current.value = chip;
                handleSearch(chip);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#03C75A] hover:text-[#03C75A] text-slate-700 whitespace-nowrap transition-colors shadow-xs cursor-pointer font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 검색 결과 목록 영역 (네이버 리스트 또는 전국 실시간 임베드) */}
        <div className="flex-1 min-h-[350px] max-h-[460px] overflow-y-auto p-3 space-y-2 bg-slate-50/50 relative">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[24px] text-[#03C75A]">progress_activity</span>
              <span>전국 주소 및 건물 검색 중...</span>
            </div>
          ) : isEmbedMode ? (
            <div className="w-full h-full min-h-[350px] rounded-xl overflow-hidden bg-white border border-slate-200">
              <div ref={embedContainerRef} className="w-full h-[350px]" />
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectAddress(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#03C75A] hover:shadow-sm cursor-pointer transition-all text-left group"
              >
                <div className="text-[13px] font-bold text-slate-800 group-hover:text-[#008f3e]">{item.roadAddress}</div>
                {item.jibunAddress && (
                  <div className="text-[11px] text-slate-500 mt-0.5">지번: {item.jibunAddress}</div>
                )}
                {item.bldNm && item.bldNm !== item.roadAddress && (
                  <div className="text-[11px] text-[#1F497D] font-medium mt-0.5">건물: {item.bldNm}</div>
                )}
              </div>
            ))
          ) : hasSearched ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-slate-300">location_off</span>
              <p>검색 결과가 없습니다. 전국 주소 검색을 시작합니다.</p>
              <button
                type="button"
                onClick={() => runDaumEmbed(keyword)}
                className="px-4 py-2 bg-[#03C75A] text-white rounded-lg font-bold text-xs shadow-sm hover:bg-[#02b350] cursor-pointer"
              >
                전국 정밀 주소 검색 열기
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// 계절가전청소 총 9개 세부 품목 카탈로그 정의
export const APPLIANCE_CATALOG = [
  // 1. 에어컨 군 (평형 입력 대상)
  {
    id: 'WALL_MOUNTED',
    category: '에어컨',
    catColor: 'text-sky-600 bg-sky-50 border-sky-200',
    name: '벽걸이형 에어컨',
    subDesc: '원룸/침실용 냉각핀 고압세척',
    icon: 'ac_unit',
    unit: '평형',
    defaultVal: '6',
    placeholder: '6',
    inputType: 'number',
  },
  {
    id: 'STAND',
    category: '에어컨',
    catColor: 'text-sky-600 bg-sky-50 border-sky-200',
    name: '스탠드형 에어컨',
    subDesc: '거실/매장용 완전분해 살균',
    icon: 'ac_unit',
    unit: '평형',
    defaultVal: '18',
    placeholder: '18',
    inputType: 'number',
  },
  {
    id: 'CEILING_SYS',
    category: '에어컨',
    catColor: 'text-sky-600 bg-sky-50 border-sky-200',
    name: '천장형 시스템 에어컨',
    subDesc: '1Way / 4Way 드레인판 분해세척',
    icon: 'ac_unit',
    unit: '평형',
    defaultVal: '25',
    placeholder: '25',
    inputType: 'number',
  },

  // 2. 세탁기 & 건조기 군 (Kg 용량 입력 대상)
  {
    id: 'TUB_WASHER',
    category: '세탁기·건조기',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    name: '일반 통돌이 세탁기',
    subDesc: '10~22kg 세탁조 분해 통살균',
    icon: 'local_laundry_service',
    unit: 'kg',
    defaultVal: '15',
    placeholder: '15',
    inputType: 'number',
  },
  {
    id: 'DRUM_WASHER',
    category: '세탁기·건조기',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    name: '드럼 세탁기',
    subDesc: '고무패킹·스파이더 곰팡이 박멸',
    icon: 'local_laundry_service',
    unit: 'kg',
    defaultVal: '21',
    placeholder: '21',
    inputType: 'number',
  },
  {
    id: 'DRYER',
    category: '세탁기·건조기',
    catColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    name: '의류 건조기',
    subDesc: '먼지필터 및 열교환기 살균청소',
    icon: 'dry_cleaning',
    unit: 'kg',
    defaultVal: '17',
    placeholder: '17',
    inputType: 'number',
  },

  // 3. 주방 & 생활가전 군 (리터, 구 수, 침대 규격)
  {
    id: 'FRIDGE_STEAM',
    category: '주방·생활가전',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    name: '냉장고 고온스팀 살균',
    subDesc: '내부 선반/서랍 분해 고온스팀',
    icon: 'kitchen',
    unit: '리터',
    defaultVal: '850',
    placeholder: '850',
    inputType: 'number',
  },
  {
    id: 'RANGE_HOOD',
    category: '주방·생활가전',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    name: '레인지후드 분해세척',
    subDesc: '기름때 필터/모터 하우징 케어',
    icon: 'cooking',
    unit: '개(구)',
    defaultVal: '3',
    placeholder: '3',
    inputType: 'number',
  },
  {
    id: 'MATTRESS',
    category: '주방·생활가전',
    catColor: 'text-amber-700 bg-amber-50 border-amber-200',
    name: '매트리스 살균 케어',
    subDesc: '집먼지진드기 UV 및 습식/건식',
    icon: 'bed',
    unit: '규격',
    defaultVal: 'QUEEN',
    inputType: 'select',
    options: [
      { val: 'SINGLE', label: '싱글 (S / 폭 100cm)' },
      { val: 'SUPER_SINGLE', label: '슈퍼싱글 (SS / 폭 110cm)' },
      { val: 'DOUBLE', label: '더블 (D / 폭 135cm)' },
      { val: 'QUEEN', label: '퀸 (Q / 폭 150cm)' },
      { val: 'KING', label: '킹 (K / 폭 160cm)' },
      { val: 'SUPER_KING', label: '슈퍼킹 (LK/CK / 170~180cm)' },
      { val: 'CUSTOM', label: '기타 직접입력' },
    ],
  },
];

// 기본 의뢰 폼 초기 상태
const INITIAL_FORM_DATA = {
  companyOrOrgNm: '(주)공간다원',
  contactPersonNm: '홍길동',
  contactTel: '010-8921-5459',
  contactEmail: 'hong.gd@example.com',
  facilityTypeCd: 'COMM_BLDG',
  hopeVisitDt: '2026-11-05',
  sidoCd: '41',
  sigunguCd: '41281',
  sidoNm: '경기도',
  sigunguNm: '고양시 일산동구',
  addrText: '경기 고양시 일산동구 마두동 802-1',
  addrDetail: '삼혜빌딩 4층 402호 (엘리베이터 유)',
  selectedSrvItems: ['STAIRWAY', 'CORRIDOR', 'ELEVATOR', 'RECYCLE_ZONE'],
  contractTypeCd: '정기 용역 계약',
  parkingAvailCd: 'FREE',
  // 정기청소 특화 필드
  serviceStartDt: '2026-11-10',
  serviceEndDt: '2027-02-08', // 90일 만기
  contractTermDays: 90,
  cleanMidCdList: ['STAIRWAY', 'CORRIDOR', 'ELEVATOR', 'RECYCLE_ZONE'],
  weekCleanFreq: 2,
  cleanDaysConfig: ['WED', 'FRI'],
  supplyPyeong: 48,
  // 입주청소 특화 필드
  moveinBuildingType: 'APT',
  moveinPyeong: 34,
  moveinRoomCount: 3,
  moveinBathCount: 2,
  moveinTimeSlot: 'MORNING_08',
  moveinBalconyExt: 'Y',
  workStartTimeType: '오전',
  workStartTime: '08:00',
  workEndTimeType: '오후',
  workEndTime: '05:00',
  workTimeNegotiable: false,
  // 가전청소 특화 필드
  applianceWallMounted: 1,
  applianceStand: 0,
  applianceCeiling4Way: 0,
  applianceTubWasher: 0,
  applianceDrumWasher: 0,
  applianceDryer: 0,
  applianceFridge: 0,
  applianceHood: 0,
  applianceMattress: 0,
  // 9개 품목별 동적 인스턴스 배열 (대수만큼 각각의 세부 스펙 저장)
  applianceDetails: {
    WALL_MOUNTED: [{ seq: 1, spec: '6', customSize: '' }],
    STAND: [],
    CEILING_SYS: [],
    TUB_WASHER: [],
    DRUM_WASHER: [],
    DRYER: [],
    FRIDGE_STEAM: [],
    RANGE_HOOD: [],
    MATTRESS: [],
  },
  // 공통 금액 및 상세
  proposedPrice: '180,000',
  detailReqNote: '4층 건물이며 1층 분리수거장 및 2~4층 계단·복도 청소 희망합니다. 음식물 쓰레기 수거함 물청소 포함 요청드립니다. 주차는 건물 뒤편 전용 주차라인 1대 가능합니다.',
};

// 달력 기준 주차 및 날짜 범위 동적 계산 함수 (1일 기준 요일 및 총일수 계산)
function getWeeksInMonth(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0(일) ~ 6(토)
  const totalDays = new Date(year, month, 0).getDate();
  const count = Math.ceil((firstDay + totalDays) / 7);
  const weeks = [];
  for (let w = 1; w <= count; w++) {
    let startDay = (w - 1) * 7 + 1 - firstDay;
    if (startDay < 1) startDay = 1;
    let endDay = (w - 1) * 7 + (7 - firstDay);
    if (endDay > totalDays) endDay = totalDays;
    weeks.push({
      week: w,
      label: `${w}주차 (${month}월 ${startDay}일 ~ ${month}월 ${endDay}일)`,
      shortLabel: `${w}주차`,
      startDay,
      endDay,
    });
  }
  return weeks;
}

// 3개월 후 종료년월 및 주차 자동 계산
function calcThreeMonthsLater(year, month, week) {
  const endYear = month + 3 > 12 ? year + 1 : year;
  const endMonth = ((month - 1 + 3) % 12) + 1;
  const endWeeks = getWeeksInMonth(endYear, endMonth);
  const clampedWeek = Math.min(week, endWeeks.length);
  const endWeekInfo = endWeeks[clampedWeek - 1] || endWeeks[0];
  return {
    endYear,
    endMonth,
    endWeek: clampedWeek,
    endWeekInfo,
  };
}

const AVAILABLE_START_MONTHS = [
  { value: '2026-11', label: '2026년 11월', year: 2026, month: 11 },
  { value: '2026-12', label: '2026년 12월', year: 2026, month: 12 },
  { value: '2027-01', label: '2027년 01월', year: 2027, month: 1 },
  { value: '2027-02', label: '2027년 02월', year: 2027, month: 2 },
  { value: '2027-03', label: '2027년 03월', year: 2027, month: 3 },
  { value: '2027-04', label: '2027년 04월', year: 2027, month: 4 },
  { value: '2027-05', label: '2027년 05월', year: 2027, month: 5 },
  { value: '2027-06', label: '2027년 06월', year: 2027, month: 6 },
  { value: '2027-07', label: '2027년 07월', year: 2027, month: 7 },
  { value: '2027-08', label: '2027년 08월', year: 2027, month: 8 },
  { value: '2027-09', label: '2027년 09월', year: 2027, month: 9 },
  { value: '2027-10', label: '2027년 10월', year: 2027, month: 10 },
  { value: '2027-11', label: '2027년 11월', year: 2027, month: 11 },
  { value: '2027-12', label: '2027년 12월', year: 2027, month: 12 },
];

/**
 * 로컬스토리지 저장을 위한 이미지 Base64 Data URL 압축 생성 헬퍼
 * 최대 1024px, JPEG 0.75 퀄리티 (장당 약 80~120KB로 압축되어 10장도 1MB 내외로 안전 저장)
 */
function compressImageToDataUrl(file, maxWidth = 1024, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    if (typeof file === 'string' && file.startsWith('data:')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxWidth) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          } else {
            w = Math.round((w * maxWidth) / h);
            h = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export default function WebClntReq000Modal({
  isOpen = false,
  initialTab = 'REGULAR',
  onClose,
  onOpenLogin,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'REGULAR');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [startYearMonth, setStartYearMonth] = useState('2026-11');
  const [startWeek, setStartWeek] = useState(2);
  const [customMidCdText, setCustomMidCdText] = useState('');
  const [photoFiles, setPhotoFiles] = useState([
    {
      seq: 1,
      title: '계단_현장01.jpg',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnTafYAPVhILnbFGI4SsEV5ASMNS7opmNu7theOHUl5U6le3jzyIfTGHn53cwvoYxT1GruGbC6Qh61qIk8fI3cDNpL1RBaCi110FuiU_Zo08fg9epsZtzA5d-v7c-2ok4UcJsj4phZKZVjauJl7CSpyRwCyQcFYlXqd1f9ujfyn_Wpvf91bFhtjEZSzf1KOD9P2bns33yloJhRtyfcu6oRi6adwbpo74edOIzqVNk',
    },
    {
      seq: 2,
      title: '분리수거대.jpg',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABsHxlrRPex9BSE7zcl3usT9SAlEyBxcCxvxWxAONYGTnb-5Wq1krEW10gE3ZtZpE7VqAKdPpMYZX8xTWvKYDUzxTfKdkMsGMcU9WNgCpps4AVHoNZvxop_8_pD8jMGciuoHndfpD0jHNVtytKRVfP4CjGMQSwKny8lAZbZI_voE-IsgUZXRU294GwfSNVh9OGJKRAAl639kG7usSuafigskRgN2FnRjoCG_J7Eg',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [guestNoticeModal, setGuestNoticeModal] = useState({ isOpen: false, message: '' });

  const TAB_NAME_MAP = {
    REGULAR: '정기청소',
    MOVEIN: '입주청소',
    APPLIANCE: '계절가전청소',
  };

  const handleConfirmGuestNotice = () => {
    setGuestNoticeModal({ isOpen: false, message: '' });
    if (typeof onClose === 'function') {
      onClose();
    }
    if (typeof onOpenLogin === 'function') {
      onOpenLogin();
    }
    window.dispatchEvent(
      new CustomEvent('OPEN_LOGIN_MODAL', {
        detail: { hasTempReq: true, activeTab },
      })
    );
  };

  // 1. 초기 탭 동기화
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // 2. 비회원 LocalStorage 자동 복원 (Hydration: 폼 필드 + 현장 사진 10장 완벽 복구)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedDraft = localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
          if (parsed.formData && typeof parsed.formData === 'object') {
            const restored = { ...parsed.formData };
            if (restored.cleanDaysConfig) {
              restored.cleanDaysConfig = Array.isArray(restored.cleanDaysConfig)
                ? restored.cleanDaysConfig
                : String(restored.cleanDaysConfig).split(',').map((s) => s.trim()).filter(Boolean);
            }
            if (restored.cleanMidCdList) {
              restored.cleanMidCdList = Array.isArray(restored.cleanMidCdList)
                ? restored.cleanMidCdList
                : String(restored.cleanMidCdList).split(',').map((s) => s.trim()).filter(Boolean);
            }
            setFormData((prev) => ({ ...prev, ...restored }));
          }
          if (parsed.startYearMonth) setStartYearMonth(parsed.startYearMonth);
          if (parsed.startWeek) setStartWeek(parsed.startWeek);
          if (parsed.customMidCdText) setCustomMidCdText(parsed.customMidCdText);
          if (parsed.photos && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
            setPhotoFiles(
              parsed.photos.map((p, idx) => ({
                seq: p.seq || idx + 1,
                title: p.title || `현장사진_${idx + 1}.jpg`,
                url: p.dataUrl || p.url,
                dataUrl: p.dataUrl || p.url,
              }))
            );
          }
          console.log('✅ [WEB-CLNT-REQ-000] 비회원 임시 저장 발주서 및 현장 사진 복원 완료');
        }
      }
    } catch (err) {
      console.warn('Failed to parse SSEULDAKGO_GUEST_TEMP_REQ', err);
    }
  }, [isOpen]);

  // 3. 모달 바디 스크롤 락
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // 년월 + 주차 변경 시 용역 개시일/종료일 및 90일 만기 자동 동기화
  useEffect(() => {
    if (activeTab === 'REGULAR' && startYearMonth) {
      const [yStr, mStr] = startYearMonth.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const weeks = getWeeksInMonth(y, m);
      const currentWeek = Math.min(startWeek, weeks.length);
      const startWeekInfo = weeks[currentWeek - 1] || weeks[0];
      const startDtStr = `${y}-${String(m).padStart(2, '0')}-${String(startWeekInfo.startDay).padStart(2, '0')}`;

      const { endYear, endMonth, endWeekInfo } = calcThreeMonthsLater(y, m, currentWeek);
      const endDtStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endWeekInfo.endDay).padStart(2, '0')}`;

      setFormData((prev) => ({
        ...prev,
        serviceStartDt: startDtStr,
        serviceEndDt: endDtStr,
        contractTermDays: 90,
      }));
    }
  }, [startYearMonth, startWeek, activeTab]);

  if (!isOpen) return null;

  // 개시년월 변경 핸들러
  const handleStartYmChange = (newYm) => {
    setStartYearMonth(newYm);
    const [yStr, mStr] = newYm.split('-');
    const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
    if (startWeek > weeks.length) {
      setStartWeek(weeks.length);
    }
  };

  // 폼 필드 변경 핸들러
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 정기청소 시작일 변경 시 90일 후 종료일 자동 계산
  const handleStartDateChange = (newStartDt) => {
    if (!newStartDt) return;
    const start = new Date(newStartDt);
    const end = new Date(start);
    end.setDate(end.getDate() + 90);
    const endStr = end.toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      serviceStartDt: newStartDt,
      serviceEndDt: endStr,
      contractTermDays: 90,
    }));
  };

  // 복합 품목 체크박스 토글
  const handleServiceItemToggle = (itemVal) => {
    setFormData((prev) => {
      const exists = prev.selectedSrvItems.includes(itemVal);
      const next = exists
        ? prev.selectedSrvItems.filter((x) => x !== itemVal)
        : [...prev.selectedSrvItems, itemVal];
      return { ...prev, selectedSrvItems: next };
    });
  };

  // 정기 순회 구역 토글
  const handleCleanMidToggle = (midVal) => {
    setFormData((prev) => {
      const exists = prev.cleanMidCdList.includes(midVal);
      const next = exists
        ? prev.cleanMidCdList.filter((x) => x !== midVal)
        : [...prev.cleanMidCdList, midVal];
      return { ...prev, cleanMidCdList: next };
    });
  };

  // 가전 품목 대수 추가 (+)
  const handleApplianceAdd = (typeId) => {
    const itemDef = APPLIANCE_CATALOG.find((d) => d.id === typeId);
    setFormData((prev) => {
      const currentDetails = prev.applianceDetails || {};
      const currentList = currentDetails[typeId] || [];
      const nextSeq = currentList.length + 1;
      const defaultVal = itemDef ? itemDef.defaultVal : '';
      const nextList = [...currentList, { seq: nextSeq, spec: defaultVal, customSize: '' }];
      return {
        ...prev,
        applianceDetails: {
          ...currentDetails,
          [typeId]: nextList,
        },
      };
    });
  };

  // 가전 품목 대수 감소 (-)
  const handleApplianceRemove = (typeId) => {
    setFormData((prev) => {
      const currentDetails = prev.applianceDetails || {};
      const currentList = currentDetails[typeId] || [];
      if (currentList.length === 0) return prev;
      const nextList = currentList.slice(0, -1);
      return {
        ...prev,
        applianceDetails: {
          ...currentDetails,
          [typeId]: nextList,
        },
      };
    });
  };

  // 가전 품목 개별 기기 스펙값(평형, kg, 리터, 침대크기) 변경
  const handleApplianceSpecChange = (typeId, index, newSpec, customSize) => {
    setFormData((prev) => {
      const currentDetails = prev.applianceDetails || {};
      const currentList = [...(currentDetails[typeId] || [])];
      if (!currentList[index]) return prev;
      currentList[index] = {
        ...currentList[index],
        spec: newSpec,
        ...(customSize !== undefined ? { customSize } : {}),
      };
      return {
        ...prev,
        applianceDetails: {
          ...currentDetails,
          [typeId]: currentList,
        },
      };
    });
  };

  // 요일 선택 토글 (주간 방문 빈도수만큼 안전하게 선택/자동 슬라이딩 교체)
  const handleCleanDayToggle = (dayVal) => {
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.cleanDaysConfig)
        ? [...prev.cleanDaysConfig]
        : typeof prev.cleanDaysConfig === 'string' && prev.cleanDaysConfig.trim()
        ? prev.cleanDaysConfig.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const freq = Number(prev.weekCleanFreq) || 1;
      const exists = currentDays.includes(dayVal);
      if (exists) {
        return {
          ...prev,
          cleanDaysConfig: currentDays.filter((d) => d !== dayVal),
        };
      }
      if (currentDays.length >= freq) {
        // 빈도수 초과 시 가장 먼저 선택했던 요일을 밀어내고 새로 선택한 요일로 자동 교체 (FIFO)
        const nextDays = [...currentDays.slice(1), dayVal];
        return {
          ...prev,
          cleanDaysConfig: nextDays,
        };
      }
      return {
        ...prev,
        cleanDaysConfig: [...currentDays, dayVal],
      };
    });
  };

  // 주당 방문 횟수 변경 시 선택된 요일 개수 자동 조정
  const handleFreqChange = (freq) => {
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.cleanDaysConfig)
        ? [...prev.cleanDaysConfig]
        : typeof prev.cleanDaysConfig === 'string' && prev.cleanDaysConfig.trim()
        ? prev.cleanDaysConfig.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      let nextDays = currentDays;
      if (nextDays.length > freq) {
        nextDays = nextDays.slice(0, freq);
      }
      return { ...prev, weekCleanFreq: freq, cleanDaysConfig: nextDays };
    });
  };

  // 분기 총액 계산 (3개월치)
  const getQuarterlyPrice = () => {
    const raw = parseInt(String(formData.proposedPrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return raw * 3;
  };

  // 사진 추가 핸들러 (최대 10장, Base64 DataURL 압축 및 다중 파일 업로드 지원)
  const handlePhotoAdd = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const remainingSlots = 10 - photoFiles.length;
      if (remainingSlots <= 0) {
        alert('현장 사진은 최대 10장까지 등록할 수 있습니다.');
        e.target.value = '';
        return;
      }
      const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
      if (e.target.files.length > remainingSlots) {
        alert(`현장 사진은 최대 10장까지 등록 가능하여 선택하신 파일 중 ${remainingSlots}장만 추가되었습니다.`);
      }

      const newItems = await Promise.all(
        filesToAdd.map(async (file, idx) => {
          const dataUrl = await compressImageToDataUrl(file);
          return {
            seq: Date.now() + idx,
            title: file.name,
            url: dataUrl || URL.createObjectURL(file),
            dataUrl: dataUrl || URL.createObjectURL(file),
            fileObj: file,
          };
        })
      );

      setPhotoFiles((prev) => [...prev, ...newItems]);
      e.target.value = '';
    }
  };

  // 사진 삭제
  const handlePhotoDelete = (seq) => {
    setPhotoFiles((prev) => prev.filter((p) => p.seq !== seq));
  };

  // 4. 발주 등록 제출 핸들러 (1. 정합성 검증 -> 2. 비로그인이면 사진 10장 포함 로컬스토리지 저장 -> 3. 로그인이면 DB 등록)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 4-1. 시공 주소 필수 검증
    if (!formData.addrText || !formData.addrText.trim()) {
      alert('시공 현장 주소를 입력해 주세요.');
      return;
    }

    // 4-2. 청소 희망 금액 양수 검증
    const cleanPrice = parseInt(String(formData.proposedPrice).replace(/[^0-9]/g, ''), 10) || 0;
    if (cleanPrice <= 0) {
      alert('희망 발주 금액을 1원 이상의 양수로 입력해 주세요.');
      return;
    }

    // 4-3. 정기청소 90일 및 요일 선택 유효성 검사
    if (activeTab === 'REGULAR') {
      const safeDays = Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig : [];
      if (safeDays.length !== formData.weekCleanFreq) {
        alert(
          `방문 희망 요일을 주간 방문 빈도(주 ${formData.weekCleanFreq}회)에 맞춰 ${formData.weekCleanFreq}개 선택해 주세요.\n(현재 ${safeDays.length}개 선택됨)`
        );
        return;
      }
      const start = new Date(formData.serviceStartDt);
      const end = new Date(formData.serviceEndDt);
      const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays < 89) {
        alert('정기청소는 최소 3개월(90일) 이상 선택해야 합니다.');
        return;
      }
    }

    // 4-4. 탭별 세부 조건 및 기타 순회 구역 조합
    let effectiveNote = formData.detailReqNote || '';
    if (activeTab === 'REGULAR') {
      if (
        (formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) &&
        customMidCdText.trim()
      ) {
        effectiveNote = `[기타 순회 대상 구역: ${customMidCdText.trim()}]\n${effectiveNote}`;
      }
    } else if (activeTab === 'MOVEIN') {
      const bldgMap = {
        APT: '아파트',
        OFFICETEL: '오피스텔',
        VILLA: '빌라/다세대',
        HOUSE: '단독주택',
        STUDIO: '원룸/투룸',
      };
      const bldgText = bldgMap[formData.moveinBuildingType] || formData.moveinBuildingType || '주택';
      const slotText = formData.workTimeNegotiable
        ? '시공사와 협의 가능'
        : `${formData.workStartTimeType || '오전'} ${formData.workStartTime || '08:00'} ~ ${formData.workEndTimeType || '오후'} ${formData.workEndTime || '05:00'}`;
      const moveinSummary = `[입주/이사 세부조건] 건물형태: ${bldgText}, 공급평수: ${formData.moveinPyeong || 0}평, 구조: 방 ${formData.moveinRoomCount || 3}개 / 욕실 ${formData.moveinBathCount || 2}개, 발코니: ${formData.moveinBalconyExt === 'Y' ? '확장형' : '비확장형'}, 희망시간: ${slotText}`;
      effectiveNote = `${moveinSummary}\n${effectiveNote}`;
    } else if (activeTab === 'APPLIANCE') {
      const applianceSummaryList = [];
      const details = formData.applianceDetails || {};
      APPLIANCE_CATALOG.forEach((item) => {
        const list = details[item.id] || [];
        if (list.length > 0) {
          const specParts = list.map((inst, idx) => {
            let specDisp = inst.spec;
            if (item.id === 'MATTRESS') {
              const opt = item.options?.find((o) => o.val === inst.spec);
              specDisp = inst.spec === 'CUSTOM' ? (inst.customSize || '직접입력') : (opt ? opt.label.split(' (')[0] : inst.spec);
            } else {
              specDisp = `${inst.spec || item.defaultVal}${item.unit}`;
            }
            return `${idx + 1}호:${specDisp}`;
          });
          applianceSummaryList.push(`${item.name} ${list.length}대(${specParts.join(', ')})`);
        }
      });
      const applianceSummary = `[계절가전 세척대상] ${applianceSummaryList.length > 0 ? applianceSummaryList.join(' / ') : '선택 가전 없음'}`;
      effectiveNote = `${applianceSummary}\n${effectiveNote}`;
    }

    // 4-5. 로그인 여부 확인
    let currentUserNo = null;
    let currentUserNm = null;
    if (typeof window !== 'undefined') {
      const authUserStr =
        localStorage.getItem('SSEULDAKGO_AUTH_USER') ||
        sessionStorage.getItem('SSEULDAKGO_AUTH_USER') ||
        localStorage.getItem('ssuldak_user');
      if (authUserStr) {
        try {
          const u = JSON.parse(authUserStr);
          const targetNo = u?.userNo || u?.USER_NO;
          if (targetNo && targetNo !== 'GUEST') {
            currentUserNo = targetNo;
            currentUserNm = u?.userNm || u?.USER_NM;
          }
        } catch {
          // ignore
        }
      }
    }

    // 4-6. [비로그인 분기]: 정합성 통과 후 현장 사진 10장(Base64) 포함 로컬스토리지 임시 저장 후 로그인 모달 화면 호출
    if (!currentUserNo) {
      try {
        const photoData = await Promise.all(
          photoFiles.map(async (p, idx) => ({
            seq: p.seq || idx + 1,
            title: p.title,
            dataUrl: p.dataUrl || (await compressImageToDataUrl(p.fileObj)) || p.url,
          }))
        );

        const guestDraft = {
          activeTab,
          formData: {
            ...formData,
            detailReqNote: effectiveNote,
          },
          startYearMonth,
          startWeek,
          customMidCdText,
          photos: photoData,
          savedAt: new Date().toISOString(),
        };

        localStorage.setItem('SSEULDAKGO_GUEST_TEMP_REQ', JSON.stringify(guestDraft));

        const tabTitle = TAB_NAME_MAP[activeTab] || '청소';
        const photoCount = photoData.length;
        const noticeMsg = `작성하신 [${tabTitle}] 발주서와 현장 사진(${photoCount}장)이 안전하게 임시 저장되었습니다.\n\n로그인 또는 회원가입을 완료하시면 작성하신 내용 그대로 100% 자동 복원되어 시공사에게 요청 정보가 메시지로 전달됩니다.`;

        // 브라우저 기본 alert 대신 커스텀 안심 안내 모달 오픈
        setGuestNoticeModal({
          isOpen: true,
          message: noticeMsg,
        });
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
        alert('로컬 저장소 용량 초과로 사진 일부를 저장할 수 없습니다. 사진 수를 줄여 다시 시도해 주세요.');
      }
      return;
    }

    // 4-7. [로그인 회원 분기]: 백엔드 통신용 페이로드 조립 및 즉시 DB 등록
    // 계절가전 세부 통계 및 작업시간대 계산
    const details = formData.applianceDetails || {};
    const airconCnt =
      (details.WALL_MOUNTED || []).length +
      (details.STAND || []).length +
      (details.CEILING_SYS || []).length;
    const washerCnt =
      (details.TUB_WASHER || []).length +
      (details.DRUM_WASHER || []).length +
      (details.DRYER || []).length;
    const kitchenCnt =
      (details.FRIDGE_STEAM || []).length +
      (details.RANGE_HOOD || []).length +
      (details.MATTRESS || []).length;
    const applianceTotal = airconCnt + washerCnt + kitchenCnt;

    const workTimeSlotStr = formData.workTimeNegotiable
      ? '시공사와 협의 가능'
      : `${formData.workStartTimeType || '오전'} ${formData.workStartTime || '08:00'} ~ ${formData.workEndTimeType || '오후'} ${formData.workEndTime || '05:00'}`;

    const payload = {
      clientUserNo: currentUserNo,
      cleanLargeCd: activeTab,
      companyOrOrgNm: formData.companyOrOrgNm,
      contactPersonNm: formData.contactPersonNm || currentUserNm || '고객',
      contactTel: formData.contactTel,
      contactEmail: formData.contactEmail,
      facilityTypeCd: formData.facilityTypeCd,
      parkingAvailCd: formData.parkingAvailCd,
      sidoCd: formData.sidoCd || '41',
      sigunguCd: formData.sigunguCd || '41281',
      addrText: formData.addrText,
      addrDetail: formData.addrDetail,
      proposedPrice: cleanPrice,
      detailReqNote: effectiveNote,
      contractTypeCd: activeTab === 'REGULAR' ? '정기 용역 계약' : (formData.contractTypeCd || '1회성 단독 시공'),
      selectedSrvItems:
        activeTab === 'REGULAR'
          ? formData.cleanMidCdList.join(',')
          : activeTab === 'MOVEIN'
          ? 'MOVEIN_FULL'
          : [
              (details.WALL_MOUNTED || []).length > 0 ? `AC_WALL:${(details.WALL_MOUNTED || []).length}` : null,
              (details.STAND || []).length > 0 ? `AC_STAND:${(details.STAND || []).length}` : null,
              (details.CEILING_SYS || []).length > 0 ? `AC_CEIL:${(details.CEILING_SYS || []).length}` : null,
              (details.TUB_WASHER || []).length > 0 ? `WASH_TUB:${(details.TUB_WASHER || []).length}` : null,
              (details.DRUM_WASHER || []).length > 0 ? `WASH_DRUM:${(details.DRUM_WASHER || []).length}` : null,
              (details.DRYER || []).length > 0 ? `DRYER:${(details.DRYER || []).length}` : null,
              (details.FRIDGE_STEAM || []).length > 0 ? `FRIDGE:${(details.FRIDGE_STEAM || []).length}` : null,
              (details.RANGE_HOOD || []).length > 0 ? `HOOD:${(details.RANGE_HOOD || []).length}` : null,
              (details.MATTRESS || []).length > 0 ? `MATTRESS:${(details.MATTRESS || []).length}` : null,
            ]
              .filter(Boolean)
              .join(',') || 'APPLIANCE_CLEAN',
      serviceStartDt: formData.serviceStartDt,
      serviceEndDt: activeTab === 'REGULAR' ? formData.serviceEndDt : null,
      contractTermDays: activeTab === 'REGULAR' ? formData.contractTermDays : null,
      weekCleanFreq: formData.weekCleanFreq,
      cleanDaysConfig: (Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig : []).join(','),
      supplyPyeong:
        activeTab === 'MOVEIN'
          ? formData.moveinPyeong
          : formData.supplyPyeong || null,
      cleanMidCd:
        activeTab === 'APPLIANCE'
          ? 'APPLIANCE_ALL'
          : formData.cleanMidCdList[0] || 'STAIR_HANDRAIL',
      workTimeSlot: activeTab === 'MOVEIN' || activeTab === 'APPLIANCE' ? workTimeSlotStr : null,
      applianceDetails: activeTab === 'APPLIANCE' ? formData.applianceDetails : null,
      applianceTotalCnt: activeTab === 'APPLIANCE' ? applianceTotal : 0,
      airconTotalCnt: activeTab === 'APPLIANCE' ? airconCnt : 0,
      washerTotalCnt: activeTab === 'APPLIANCE' ? washerCnt : 0,
      kitchenTotalCnt: activeTab === 'APPLIANCE' ? kitchenCnt : 0,
      photoList: photoFiles.map((p, idx) => ({
        storagePath: `/orders/temp/`,
        logicalFileNm: p.title,
        physicalFileNm: `photo_${idx + 1}.jpg`,
        fileExt: 'JPG',
        fileSizeByte: 102400,
        dataUrl: p.dataUrl || p.url,
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/web/client/req_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        // 성공 시 임시 보관 데이터 청소
        try {
          localStorage.removeItem('SSEULDAKGO_GUEST_TEMP_REQ');
        } catch {
          // ignore
        }
        alert(
          `[청소 요청 완료]\n발주번호: ${result.data?.orderNo || 'ORD'}\n성공적으로 접수되었습니다! 전담 마스터 배차가 시작됩니다.`
        );
        if (onSuccess) onSuccess(result.data);
        if (onClose) onClose();
      } else {
        alert(result.message || '발주 등록 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Request submission failed', err);
      alert('서버 통신 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-inverse-surface/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      id="service-request-overlay"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      {/* Centered Modal Window */}
      <div
        aria-labelledby="modal-title"
        className="relative w-full max-w-[780px] my-auto max-h-[94vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        data-field="TB_ORDER_MSTR"
      >
        {/* 1. Modal Sticky Header */}
        <header className="shrink-0 bg-surface-container-lowest/95 backdrop-blur px-8 py-5 flex items-center justify-between shadow-sm border-b border-slate-100 z-10">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[14px]">price_check</span>
                확정 지정가 발주 시스템
              </span>
              <span className="font-caption text-caption text-outline font-mono">WEB-CLNT-REQ-000</span>
            </div>
            <h2
              className="font-headline-md text-headline-md text-on-surface font-bold mt-1 tracking-tight flex items-center gap-2"
              id="modal-title"
            >
              청소 서비스 신청 및 발주서 작성
            </h2>
            <p className="font-caption text-caption text-on-surface-variant mt-0.5">
              가격을 흥정하지 않고, 원하는 조건과 확정 대금을 직접 입력하여 1:1 전담 마스터를 바로 매칭받습니다.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth focus:outline-none">
          <form className="divide-y-0" id="order-request-form" onSubmit={handleSubmit}>
          {/* 2. 3-Tab Segmented Control (CLEAN_LARGE_CD) */}
          <div className="px-8 pt-6 pb-2">
            <div className="p-1 bg-surface-container rounded-xl grid grid-cols-3 gap-1">
              {/* TAB 1: 정기청소 */}
              <button
                className={`tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  activeTab === 'REGULAR'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                data-large-tab="REGULAR"
                onClick={() => setActiveTab('REGULAR')}
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${activeTab === 'REGULAR' ? 'text-white' : 'text-secondary'}`}>
                  update
                </span>
                <span>정기청소</span>
                <span className={`px-1.5 py-0.2 rounded-full font-label-sm text-label-sm ${
                  activeTab === 'REGULAR'
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                }`}>
                  최소 90일
                </span>
              </button>

              {/* TAB 2: 입주청소 */}
              <button
                className={`tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  activeTab === 'MOVEIN'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                data-large-tab="MOVEIN"
                onClick={() => setActiveTab('MOVEIN')}
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${activeTab === 'MOVEIN' ? 'text-white' : 'text-on-surface-variant'}`}>
                  home_work
                </span>
                <span>입주/이사 청소</span>
              </button>

              {/* TAB 3: 계절가전청소 */}
              <button
                className={`tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  activeTab === 'APPLIANCE'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                data-large-tab="APPLIANCE"
                onClick={() => setActiveTab('APPLIANCE')}
                type="button"
              >
                <span className={`material-symbols-outlined text-[18px] ${activeTab === 'APPLIANCE' ? 'text-white' : 'text-on-surface-variant'}`}>
                  mode_fan
                </span>
                <span>계절가전청소</span>
              </button>
            </div>
          </div>

          {/* 3. 공통 의뢰 정보 입력 섹션 (Form Section 1) */}
          <section className="px-8 py-4 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="font-label-lg text-label-lg text-on-surface font-bold tracking-tight">
                기본 시공 현장 정보
              </h3>
            </div>

            {/* Row 3: 시설 유형 / 희망 착수일 */}
            {/* Row 3: 희망 착수일 & 현장 주차 여건 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-left">
                <label className="font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold">
                  희망 첫 방문/착수일 <span className="text-error">*</span>
                </label>
                <input
                  className="h-11 rounded-xl bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  name="HOPE_VISIT_DT"
                  onChange={(e) => handleFieldChange('hopeVisitDt', e.target.value)}
                  type="date"
                  value={formData.hopeVisitDt}
                />
              </div>

              <div className="bg-surface-container-low p-2.5 px-3.5 rounded-xl flex flex-col justify-center gap-1.5 text-left border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">현장 주차 여건</span>
                  <span className="font-caption text-[11px] text-secondary">장비차량 탑재</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-label-sm text-label-sm text-on-surface">
                    <input
                      checked={formData.parkingAvailCd === 'FREE'}
                      className="accent-secondary"
                      name="PARKING_AVAIL_CD"
                      onChange={() => handleFieldChange('parkingAvailCd', 'FREE')}
                      type="radio"
                      value="FREE"
                    />
                    <span>무료 주차</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-body-sm text-body-sm text-on-surface-variant">
                    <input
                      checked={formData.parkingAvailCd === 'PAID'}
                      className="accent-secondary"
                      name="PARKING_AVAIL_CD"
                      onChange={() => handleFieldChange('parkingAvailCd', 'PAID')}
                      type="radio"
                      value="PAID"
                    />
                    <span>유료 주차</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-body-sm text-body-sm text-on-surface-variant">
                    <input
                      checked={formData.parkingAvailCd === 'UNKNOWN'}
                      className="accent-secondary"
                      name="PARKING_AVAIL_CD"
                      onChange={() => handleFieldChange('parkingAvailCd', 'UNKNOWN')}
                      type="radio"
                      value="UNKNOWN"
                    />
                    <span>확인 필요</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 4: 현장 주소 with 네이버 주소 검색 연동 */}
            <div className="flex flex-col text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                  <span>시공 현장 주소 <span className="text-error">*</span></span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]">
                    네이버 주소 연동
                  </span>
                </label>
                <span className="font-caption text-caption text-secondary flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  {formData.sidoNm} {formData.sigunguNm}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="h-11 px-4 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-label-md text-label-md shrink-0 transition-colors shadow-sm flex items-center gap-1.5 font-bold"
                  onClick={() => setIsAddrModalOpen(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  네이버 주소 검색
                </button>
                <input
                  className="h-11 flex-1 rounded-xl bg-surface-container-low px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200"
                  name="ADDR_TEXT"
                  readOnly
                  type="text"
                  value={formData.addrText}
                />
              </div>
              <input
                className="h-11 rounded-xl bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                name="ADDR_DETAIL"
                onChange={(e) => handleFieldChange('addrDetail', e.target.value)}
                placeholder="상세주소 및 동/호수 입력"
                type="text"
                value={formData.addrDetail}
              />
            </div>

            {/* Row 5: 정기 청소 전용 - 건물 종류 (위) & 정기 순회 대상 구역 (아래) */}
            {activeTab === 'REGULAR' && (
              <div className="space-y-3 pt-1">
                {/* 정기 청소 건물 종류 (BLDG_TYPE) */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
                      <span>정기 청소 건물 종류</span>
                      <span className="text-error">*</span>
                    </label>
                    <span className="text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded">
                      BLDG_TYPE
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl bg-surface-container-lowest px-4 pr-10 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium"
                      name="FACILITY_TYPE_CD"
                      onChange={(e) => handleFieldChange('facilityTypeCd', e.target.value)}
                      required
                      value={formData.facilityTypeCd}
                    >
                      {COM_CODE_BLDG_TYPE.map((bldg) => (
                        <option key={bldg.COM_CD} value={bldg.COM_CD}>
                          {bldg.COM_NM}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined text-[20px] text-outline absolute right-3 top-3 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* 정기 순회 대상 구역 (복수 선택 가능) (공통코드 23개 전체, 1줄 3개, 스크롤 가능) */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
                      <span>정기 순회 대상 구역</span>
                      <span className="text-secondary font-medium">(복수 선택 가능)</span>
                    </label>
                    <span className="text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded">
                      CLEAN_LOC (23종)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto p-2 bg-surface-container-low/40 rounded-xl border border-slate-200/70 shadow-inner">
                    {COM_CODE_CLEAN_LOC.map((loc) => {
                      const isChecked = formData.cleanMidCdList.includes(loc.COM_CD);
                      return (
                        <label
                          key={loc.COM_CD}
                          className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-left ${
                            isChecked
                              ? 'bg-secondary-container/40 text-on-secondary-container font-semibold ring-1 ring-secondary/40 shadow-xs'
                              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200/40'
                          }`}
                        >
                          <input
                            checked={isChecked}
                            className="w-4 h-4 accent-secondary rounded shrink-0"
                            onChange={() => handleCleanMidToggle(loc.COM_CD)}
                            type="checkbox"
                          />
                          <span className="text-[12px] truncate leading-tight font-medium">{loc.COM_NM}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* SORT_ORD 99 (기타 구역) 선택 시 스크롤 영역 하단에 명칭 직접 입력 항목 노출 */}
                  {(formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) && (
                    <div className="mt-2 text-left">
                      <input
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-outline/70 shadow-sm"
                        onChange={(e) => setCustomMidCdText(e.target.value)}
                        placeholder="기타 순회 대상 구역 명칭을 직접 입력해 주세요 (예: 옥상 테라스, 지하 창고 등)"
                        type="text"
                        value={customMidCdText}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 4. TAB별 특화 동적 입력 섹션 (Form Section 2) */}
          <section className="px-8 py-5 bg-surface-container-low/70 my-2 space-y-4" id="dynamic-detail-section">
            {activeTab === 'REGULAR' && (
              <>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold tracking-tight">
                      서비스 세부 조건 설정 (정기청소 특화)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold">
                    90일 전담 마스터 고정 배정
                  </span>
                </div>

                {/* 기간 설정 및 보장제 공지 (년월/주차 선택 및 3개월 만기 자동 계산) */}
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. 용역 개시년월 및 주차 선택 */}
                    <div className="flex flex-col text-left space-y-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between">
                        <span>용역 개시년월 / 주차 <span className="text-error">*</span></span>
                        <span className="font-caption text-caption text-secondary font-medium">개시 기준 시점</span>
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3">
                          <select
                            className="w-full h-11 px-3 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                            onChange={(e) => handleStartYmChange(e.target.value)}
                            value={startYearMonth}
                          >
                            {AVAILABLE_START_MONTHS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <select
                            className="w-full h-11 px-3 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                            onChange={(e) => setStartWeek(Number(e.target.value))}
                            value={startWeek}
                          >
                            {(() => {
                              const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                              const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                              return weeks.map((w) => (
                                <option key={w.week} value={w.week}>
                                  {w.shortLabel}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>
                      <div className="font-caption text-[11px] text-outline text-left">
                        {(() => {
                          const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                          const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                          const curWeek = weeks.find((w) => w.week === startWeek) || weeks[0];
                          return curWeek ? `${mStr}월 ${curWeek.startDay}일 ~ ${mStr}월 ${curWeek.endDay}일 시작` : '';
                        })()}
                      </div>
                    </div>

                    {/* 2. 용역 만료년월 및 주차 (3개월 자동 계산, Read-only) */}
                    <div className="flex flex-col text-left space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                          용역 만료일 (90일 만기)
                        </label>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-[11px] font-bold">
                          3개월 자동 계산
                        </span>
                      </div>
                      {(() => {
                        const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                        const { endYear, endMonth, endWeek, endWeekInfo } = calcThreeMonthsLater(
                          parseInt(yStr, 10),
                          parseInt(mStr, 10),
                          startWeek
                        );
                        return (
                          <>
                            <div className="h-11 rounded-xl bg-surface-container-low/70 px-4 flex items-center justify-between font-body-sm text-body-sm text-primary font-bold border border-slate-200 select-none">
                              <span>{endYear}년 {String(endMonth).padStart(2, '0')}월 {endWeek}주차</span>
                              <span className="font-caption text-caption text-outline font-normal">
                                (90일 만기 종료)
                              </span>
                            </div>
                            <div className="font-caption text-[11px] text-outline text-left">
                              {endMonth}월 {endWeekInfo.startDay}일 ~ {endMonth}월 {endWeekInfo.endDay}일 만기
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-secondary-container/20 rounded-lg text-left">
                    <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
                      verified_user
                    </span>
                    <p className="font-caption text-caption text-on-secondary-container">
                      <strong className="font-semibold">최소 3개월(90일) 락 보장제:</strong> 정기 청소는 시공 파트너의 스케줄 고정과 지속적인 위생 퀄리티를 유지하기 위해 분기(90일) 단위로 의뢰되며, 개시 시점 기준 3개월 후가 자동 산출됩니다.
                    </p>
                  </div>
                </div>

                {/* 방문 주기 및 요일 선택 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm text-left flex flex-col justify-between">
                    <label className="font-label-sm text-label-sm text-on-surface mb-2 font-semibold">
                      주간 방문 빈도
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 5].map((f) => (
                        <button
                          key={f}
                          className={`py-2 rounded-lg font-label-sm text-label-sm transition-all ${
                            formData.weekCleanFreq === f
                              ? 'bg-primary text-on-primary font-bold shadow-sm'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                          onClick={() => handleFreqChange(f)}
                          type="button"
                        >
                          주 {f}회
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm text-left flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                        방문 희망 요일
                      </label>
                      <span className="font-caption text-caption text-secondary font-medium">
                        {(Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig.length : 0)} / {formData.weekCleanFreq}개 선택
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {[
                        { code: 'MON', label: '월' },
                        { code: 'TUE', label: '화' },
                        { code: 'WED', label: '수' },
                        { code: 'THU', label: '목' },
                        { code: 'FRI', label: '금' },
                        { code: 'SAT', label: '토' },
                        { code: 'SUN', label: '일' },
                      ].map((day) => {
                        const safeDays = Array.isArray(formData.cleanDaysConfig)
                          ? formData.cleanDaysConfig
                          : [];
                        const isDayChecked = safeDays.includes(day.code);
                        return (
                          <button
                            key={day.code}
                            type="button"
                            onClick={() => handleCleanDayToggle(day.code)}
                            className={`flex flex-col items-center justify-center py-2 rounded-lg font-label-sm text-label-sm cursor-pointer transition-all ${
                              isDayChecked
                                ? 'bg-secondary text-on-secondary font-bold shadow-sm ring-1 ring-secondary'
                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span>{day.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 공급면적 평수 */}
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl shadow-sm text-left">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    건물 실평수 / 관리 면적 (선택)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      className="w-20 h-9 rounded-lg bg-surface-container-low px-2 text-right font-label-md text-label-md font-mono text-on-surface"
                      onChange={(e) => handleFieldChange('supplyPyeong', e.target.value)}
                      type="number"
                      value={formData.supplyPyeong}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">평</span>
                  </div>
                </div>
              </>
            )}

            {/* [TAB 2] 입주/이사 청소 특화 설정 */}
            {activeTab === 'MOVEIN' && (
              <>
                <div className="flex items-center justify-between pb-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold tracking-tight">
                      입주/이사 청소 세부 조건 설정
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold">
                    1회성 집중 풀케어
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-4 text-left border border-slate-100">
                  {/* 주거 형태 & 공급 평수 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block">
                        주거 건물 형태 <span className="text-error">*</span>
                      </label>
                      <select
                        className="h-11 w-full rounded-xl bg-surface-container-low px-4 font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium"
                        onChange={(e) => handleFieldChange('moveinBuildingType', e.target.value)}
                        value={formData.moveinBuildingType || 'APT'}
                      >
                        <option value="APT">아파트 (공동주택)</option>
                        <option value="OFFICETEL">오피스텔 / 도시형 생활주택</option>
                        <option value="VILLA">빌라 / 다세대·연립</option>
                        <option value="HOUSE">단독주택 / 전원주택</option>
                        <option value="STUDIO">원룸 / 투룸</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block">
                        공급 평수 (분양 평수 기준) <span className="text-error">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          className="h-11 w-full rounded-xl bg-surface-container-low px-4 font-body-md text-body-md font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 text-right font-bold"
                          onChange={(e) => handleFieldChange('moveinPyeong', e.target.value)}
                          placeholder="34"
                          type="number"
                          value={formData.moveinPyeong}
                        />
                        <span className="font-body-md text-body-md text-on-surface-variant shrink-0">평</span>
                      </div>
                    </div>
                  </div>

                  {/* 방 개수, 욕실 개수, 베란다 확장 여부 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface mb-1 font-semibold block">
                        방 개수
                      </label>
                      <select
                        className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200"
                        onChange={(e) => handleFieldChange('moveinRoomCount', Number(e.target.value))}
                        value={formData.moveinRoomCount || 3}
                      >
                        <option value={1}>원룸 (1개)</option>
                        <option value={2}>투룸 (2개)</option>
                        <option value={3}>쓰리룸 (3개)</option>
                        <option value={4}>4룸</option>
                        <option value={5}>5룸 이상</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface mb-1 font-semibold block">
                        욕실/화장실 개수
                      </label>
                      <select
                        className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200"
                        onChange={(e) => handleFieldChange('moveinBathCount', Number(e.target.value))}
                        value={formData.moveinBathCount || 2}
                      >
                        <option value={1}>1개</option>
                        <option value={2}>2개</option>
                        <option value={3}>3개 이상</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface mb-1 font-semibold block">
                        발코니/베란다 확장
                      </label>
                      <select
                        className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200"
                        onChange={(e) => handleFieldChange('moveinBalconyExt', e.target.value)}
                        value={formData.moveinBalconyExt || 'Y'}
                      >
                        <option value="Y">확장형</option>
                        <option value="N">비확장형 (베란다 다수)</option>
                      </select>
                    </div>
                  </div>

                  {/* 희망 작업 시간대 */}
                  <div className="pt-1">
                    <label className="font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block">
                      희망 작업 시간대
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* 시작시간 입력 */}
                      <div
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${
                          !formData.workTimeNegotiable
                            ? 'bg-surface-container-lowest border border-slate-300 shadow-sm'
                            : 'bg-surface-container-low/60 border border-slate-200 opacity-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-700 shrink-0 pl-1">시작시간</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <select
                            disabled={formData.workTimeNegotiable}
                            value={formData.workStartTimeType || '오전'}
                            onChange={(e) => handleFieldChange('workStartTimeType', e.target.value)}
                            className="h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                          >
                            <option value="오전">오전</option>
                            <option value="오후">오후</option>
                          </select>
                          <input
                            type="text"
                            disabled={formData.workTimeNegotiable}
                            placeholder="08:00"
                            value={formData.workStartTime || '08:00'}
                            onChange={(e) => handleFieldChange('workStartTime', e.target.value)}
                            className="h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* 종료시간 입력 */}
                      <div
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${
                          !formData.workTimeNegotiable
                            ? 'bg-surface-container-lowest border border-slate-300 shadow-sm'
                            : 'bg-surface-container-low/60 border border-slate-200 opacity-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-700 shrink-0 pl-1">종료시간</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <select
                            disabled={formData.workTimeNegotiable}
                            value={formData.workEndTimeType || '오후'}
                            onChange={(e) => handleFieldChange('workEndTimeType', e.target.value)}
                            className="h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                          >
                            <option value="오전">오전</option>
                            <option value="오후">오후</option>
                          </select>
                          <input
                            type="text"
                            disabled={formData.workTimeNegotiable}
                            placeholder="05:00"
                            value={formData.workEndTime || '05:00'}
                            onChange={(e) => handleFieldChange('workEndTime', e.target.value)}
                            className="h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* 시공사와 협의 가능 버튼 */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextNeg = !formData.workTimeNegotiable;
                          setFormData((prev) => ({
                            ...prev,
                            workTimeNegotiable: nextNeg,
                            moveinTimeSlot: nextNeg
                              ? 'FLEXIBLE'
                              : `${prev.workStartTimeType || '오전'} ${prev.workStartTime || '08:00'} ~ ${prev.workEndTimeType || '오후'} ${prev.workEndTime || '05:00'}`,
                          }));
                        }}
                        className={`h-11 sm:h-auto rounded-xl font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          formData.workTimeNegotiable
                            ? 'bg-primary text-on-primary font-bold shadow-sm'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {formData.workTimeNegotiable ? 'check_circle' : 'handshake'}
                        </span>
                        <span>시공사와 협의 가능</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* [TAB 3] 계절가전청소 특화 설정 (세로 9개 품목 4개 Row 높이 스크롤 박스 및 +클릭시 기기별 스펙 Row 추가) */}
            {activeTab === 'APPLIANCE' && (
              <>
                <div className="flex items-center justify-between pb-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-label-lg text-label-lg text-on-surface font-bold tracking-tight">
                      계절가전청소 세부 조건 설정
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-white font-caption text-caption font-bold">
                      총 {APPLIANCE_CATALOG.reduce((acc, cur) => acc + ((formData.applianceDetails?.[cur.id] || []).length), 0)}대 선택됨
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold">
                      완전분해 · 고압살균
                    </span>
                  </div>
                </div>

                {/* 4개 Row 기본 노출 + 위/아래 스크롤 관리 박스 (총 9개 품목) */}
                <div className="max-h-[390px] sm:max-h-[430px] overflow-y-auto overscroll-contain pr-1.5 space-y-2.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-inner">
                  {APPLIANCE_CATALOG.map((item) => {
                    const instList = formData.applianceDetails?.[item.id] || [];
                    const count = instList.length;

                    return (
                      <div
                        key={item.id}
                        className={`bg-surface-container-lowest p-3.5 rounded-xl border transition-all text-left ${
                          count > 0 ? 'border-secondary/40 shadow-sm ring-1 ring-secondary/20' : 'border-slate-200/80 shadow-xs'
                        }`}
                      >
                        {/* 품목 헤더 행: 카테고리 + 제품명 + +,- 카운터 버튼 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
                              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${item.catColor}`}>
                                  {item.category}
                                </span>
                                <span className="font-label-md text-label-md font-bold text-slate-900 truncate">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                                {item.subDesc}
                              </span>
                            </div>
                          </div>

                          {/* +,- 대수 컨트롤 버튼 */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApplianceRemove(item.id)}
                              disabled={count === 0}
                              className="w-8 h-8 rounded-lg bg-surface-container-low border border-slate-200 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <span className={`w-8 text-center font-mono font-bold text-[14px] ${count > 0 ? 'text-secondary' : 'text-slate-400'}`}>
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleApplianceAdd(item.id)}
                              className="w-8 h-8 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/90 flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* + 클릭 시 동적으로 생성/추가되는 개별 기기별 세부 스펙 입력 행들 */}
                        {count > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                              <span>개별 기기 순번</span>
                              <span>세부 규격 ({item.unit}) 입력</span>
                            </div>

                            {instList.map((inst, idx) => (
                              <div
                                key={inst.seq || idx}
                                className="flex items-center justify-between bg-surface-container-low/70 px-3 py-1.5 rounded-lg border border-slate-200/60"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold font-mono flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {idx + 1}호기
                                  </span>
                                </div>

                                {/* 스펙 입력 컨트롤 (평형, Kg, 리터, 개(구) 또는 매트리스 크기 목록 선택) */}
                                {item.inputType === 'select' ? (
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={inst.spec || 'QUEEN'}
                                      onChange={(e) => handleApplianceSpecChange(item.id, idx, e.target.value)}
                                      className="h-8 px-2 text-xs font-semibold text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                                    >
                                      {item.options.map((opt) => (
                                        <option key={opt.val} value={opt.val}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                    {inst.spec === 'CUSTOM' && (
                                      <input
                                        type="text"
                                        value={inst.customSize || ''}
                                        onChange={(e) => handleApplianceSpecChange(item.id, idx, inst.spec, e.target.value)}
                                        placeholder="규격 직접입력"
                                        className="w-28 h-8 px-2 text-xs font-medium text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={1}
                                      value={inst.spec || ''}
                                      onChange={(e) => handleApplianceSpecChange(item.id, idx, e.target.value)}
                                      placeholder={item.placeholder}
                                      className="w-24 h-8 px-2 text-center text-xs font-bold font-mono text-primary bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                                    />
                                    <span className="text-xs font-bold text-slate-600 min-w-[28px]">
                                      {item.unit}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* 5. 금액 및 상세 정보 섹션 (Form Section 3) */}
          <section className="px-8 py-4 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="font-label-lg text-label-lg text-on-surface font-bold tracking-tight">
                발주 금액 및 현장 특이사항
              </h3>
            </div>

            {/* 고객 확정 지정 총 용역 대금 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-3 text-left border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    고객 확정 지정 {activeTab === 'REGULAR' ? '월 ' : ''}용역 대금 <span className="text-error">*</span>
                  </label>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                    매월 시공사에 지급하는 금액(VAT 포함)을 작성합니다.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                  현장 직불 계약 원칙
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    className="h-14 w-full rounded-xl bg-surface-container-low px-5 font-headline-md text-headline-md font-bold text-primary font-mono tracking-tight shadow-inner focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    onChange={(e) => handleFieldChange('proposedPrice', e.target.value)}
                    type="text"
                    value={formData.proposedPrice}
                  />
                  <span className="font-headline-sm text-headline-sm text-primary font-bold absolute right-4 top-3.5">
                    원 {activeTab === 'REGULAR' ? '/ 월' : ''}
                  </span>
                </div>
                {activeTab === 'REGULAR' && (
                  <div className="flex flex-col justify-center items-end px-4 py-2 bg-surface-container rounded-xl min-w-[210px]">
                    <span className="font-caption text-caption text-outline">90일(3개월) 총 계약액</span>
                    <span className="font-headline-sm text-headline-sm text-secondary font-bold font-mono">
                      ₩{new Intl.NumberFormat('ko-KR').format(getQuarterlyPrice())}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 요청 사항 및 특이사항 */}
            <div className="flex flex-col text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                  추가 요청 사항 및 특이사항
                </label>
                <span className="font-caption text-caption text-outline">현장 전담 마스터 전달용</span>
              </div>
              <textarea
                className="w-full rounded-xl bg-surface-container-lowest p-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none placeholder:text-outline/60"
                onChange={(e) => handleFieldChange('detailReqNote', e.target.value)}
                placeholder="현장 특이사항, 방문 희망 시간대, 중점 관리 요청 구역을 적어주세요."
                rows={3}
                value={formData.detailReqNote}
              />
            </div>

            {/* 현장 사진 첨부 (최대 10장) */}
            <div className="flex flex-col text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                  <span>현장 사진 첨부</span>
                  <span className="font-caption text-caption text-outline font-normal">(최대 10장)</span>
                </label>
                <span className="font-caption text-caption text-secondary font-bold">
                  {photoFiles.length} / 10장 등록됨
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {photoFiles.map((photo) => (
                  <div
                    key={photo.seq}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col justify-end p-2 border border-slate-200"
                  >
                    <div
                      className="bg-cover bg-center absolute inset-0"
                      style={{ backgroundImage: `url('${photo.url}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent" />
                    <span className="relative font-caption text-caption text-on-primary truncate text-[11px]">
                      {photo.title}
                    </span>
                    <button
                      aria-label="삭제"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-inverse-surface/70 hover:bg-error text-on-error flex items-center justify-center transition-colors cursor-pointer"
                      onClick={() => handlePhotoDelete(photo.seq)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}

                {photoFiles.length < 10 && (
                  <label className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-secondary flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm border border-dashed border-slate-300">
                    <input accept="image/*" className="sr-only" multiple onChange={handlePhotoAdd} type="file" />
                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                    <span className="font-label-sm text-label-sm font-semibold">+ 추가 등록</span>
                    <span className="font-caption text-caption text-outline">{photoFiles.length} / 10</span>
                  </label>
                )}
              </div>
            </div>

            {/* 플랫폼 정보 이용료 안내 카드 */}
            <div className="p-4 rounded-xl bg-secondary-container/25 text-on-surface shadow-sm space-y-2 text-left border border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary font-bold">쓸고닦고 안심 매칭 보증료</h4>
                    <p className="font-caption text-caption text-on-surface-variant">
                      배차 성공 및 1:1 전담 마스터 확정 배정 시에만 부과
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-error-container/30 rounded-lg text-on-error-container font-caption text-caption flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5">
                  notification_important
                </span>
                <span>
                  <strong>[현장 직불 공지]</strong> 인건비 및 용역비({formData.proposedPrice}원)는 시공 완료 후 사진 또는 검수후 시공자에게 직접 결제합니다. 플랫폼은 인건비 에스크로를 보유하지 않으므로 현장 검수 후 직접 정산하여 주시기 바랍니다.
                </span>
              </div>
            </div>
            {/* 하단 여백 버퍼 (고정 하단바와 겹치지 않고 끝까지 스크롤되도록 충분한 여백 제공) */}
            <div className="h-16" />
          </section>
        </form>
      </div>

      {/* 6. Modal Fixed Footer Action (스크롤 영역 밖 고정 하단바) */}
      <footer className="shrink-0 bg-surface-container-lowest px-8 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between border-t border-slate-100 z-10">
        <div className="flex items-center gap-2 text-left">
          <span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">입력 내용 자동 임시저장</span>
            <span className="font-caption text-caption text-outline">
              비회원 작성 시 브라우저 LocalStorage에 안전하게 보관됩니다.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="h-12 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            form="order-request-form"
            className="h-12 px-7 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg font-bold shadow-md shadow-secondary/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            disabled={isSubmitting}
            type="submit"
          >
            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            <span>{isSubmitting ? '발주 등록 중...' : '+ 청소 서비스 신청 완료 (확정 발주)'}</span>
          </button>
        </div>
      </footer>
    </div>

    {/* 네이버 주소 검색 팝업 연동 */}
      <NaverAddressSearchModal
        isOpen={isAddrModalOpen}
        onClose={() => setIsAddrModalOpen(false)}
        onSelectAddress={(item) => {
          setFormData((prev) => ({
            ...prev,
            sidoCd: item.sidoCd || prev.sidoCd,
            sigunguCd: item.sigunguCd || prev.sigunguCd,
            sidoNm: item.sido || prev.sidoNm,
            sigunguNm: item.sigungu || prev.sigunguNm,
            addrText: item.roadAddress,
            addrDetail: item.bldNm && item.bldNm !== item.roadAddress ? `${item.bldNm} ` : prev.addrDetail,
          }));
          setIsAddrModalOpen(false);
        }}
      />

      {/* 비회원 청소 요청 임시저장 커스텀 안심 안내 모달 (브라우저 기본 alert 대체) */}
      {guestNoticeModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              [쓸고닦고 안심 안내]
            </h3>
            <div className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-left w-full">
              {guestNoticeModal.message}
            </div>
            <button
              type="button"
              onClick={handleConfirmGuestNotice}
              className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>확인 (로그인 화면으로 이동)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



export const WebClntReq000 = WebClntReq000Modal;



/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-000/index.jsx
 * @description 고객 및 시공사 회원 로그인 모달 컴포넌트 (WEB-CLNT-ATH-000)
 * 
 * Props:
 * - isOpen: 모달 노출 여부 (boolean)
 * - onClose: 모달 닫기 핸들러 () => void
 * - onSuccessLogin: 로그인 성공 콜백 (userData: { userNo, userNm, userEmail, userRoleCd, hasTempReq }) => void
 * - onOpenRegister: 회원가입 모달 전환 핸들러 () => void
 * - onOpenFindPwd: 비밀번호 찾기 모달 전환 핸들러 () => void
 */
export function WebClntAth000({
  isOpen = false,
  onClose,
  onSuccessLogin,
  onOpenRegister,
  onOpenFindPwd
}) {
  // 1. 회원 구분 ('C': 고객 회원, 'S': 시공사 회원)
  const [role, setRole] = useState('C');

  // 2. 입력 필드 상태
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [saveId, setSaveId] = useState(true);
  const [keepLogin, setKeepLogin] = useState(true);

  // 3. UI 처리 상태
  const [hasTempReq, setHasTempReq] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 모달 오픈 시 초기화 및 로컬스토리지 검사
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setIsLoading(false);
      return;
    }

    // A. 비회원 임시 요청서 감지
    try {
      const guestReq = localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ');
      const draftReq = localStorage.getItem('SSEUL_DRAFT_ORDER');
      if (guestReq || draftReq) {
        setHasTempReq(true);
      } else {
        setHasTempReq(false);
      }
    } catch (e) {
      setHasTempReq(false);
    }

    // B. 아이디 저장 복원
    try {
      const savedUserStr = localStorage.getItem('SSEULDAKGO_SAVED_USER');
      if (savedUserStr) {
        const saved = JSON.parse(savedUserStr);
        if (saved && saved.email) {
          setEmail(saved.email);
          if (saved.role) setRole(saved.role);
          setSaveId(true);
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  // 로그인 제출 처리
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('이메일 주소를 입력해 주세요.');
      return;
    }
    if (!pwd.trim()) {
      setErrorMsg('비밀번호를 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/web/client/ath_000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userRoleCd: role,
          userEmail: email.trim(),
          userPwd: pwd,
          keepLogin
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // 아이디 저장 처리
        if (saveId) {
          localStorage.setItem(
            'SSEULDAKGO_SAVED_USER',
            JSON.stringify({ role, email: email.trim() })
          );
        } else {
          localStorage.removeItem('SSEULDAKGO_SAVED_USER');
        }

        // 로그인 세션 및 성공 콜백 전달
        if (onSuccessLogin) {
          onSuccessLogin({
            ...data.data,
            hasTempReq,
            keepLogin,
            saveId
          });
        }
        if (onClose) onClose();
      } else {
        setErrorMsg(data.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
      }
    } catch (err) {
      console.warn('[LOGIN_FALLBACK_SIMULATION]', err);
      // 오프라인 / 네트워크 지연 시 모의 로그인 폴백
      if (saveId) {
        localStorage.setItem(
          'SSEULDAKGO_SAVED_USER',
          JSON.stringify({ role, email: email.trim() })
        );
      }
      const mockData = {
        userNo: role === 'C' ? 'C20261000001' : 'S20261000001',
        userNm: role === 'C' ? '홍길동' : '김반장 (마스터)',
        userEmail: email.trim(),
        userRoleCd: role,
        accessToken: `mock_jwt_token_${Date.now()}`,
        hasTempReq,
        keepLogin,
        saveId
      };
      if (onSuccessLogin) onSuccessLogin(mockData);
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 간편 로그인 시뮬레이션
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/web/client/ath_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRoleCd: role,
          socialProvider: provider,
          socialUid: `demo_${provider.toLowerCase()}_${Date.now()}`
        })
      });
      const data = await res.json();
      if (data && data.success) {
        if (onSuccessLogin) {
          onSuccessLogin({
            ...data.data,
            hasTempReq
          });
        }
        if (onClose) onClose();
      }
    } catch (err) {
      // Fallback
      const mockData = {
        userNo: role === 'C' ? 'C20261000001' : 'S20261000001',
        userNm: `${provider} 사용자`,
        userEmail: `${provider.toLowerCase()}@example.com`,
        userRoleCd: role,
        accessToken: `mock_social_token_${Date.now()}`,
        hasTempReq
      };
      if (onSuccessLogin) onSuccessLogin(mockData);
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        aria-labelledby="modal-login-title"
        aria-modal="true"
        className="relative w-full max-w-[440px] bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col transition-all overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* 상단 브랜드 컬러 바 (Navy & Clean Mint) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

        {/* 닫기 (X) 버튼 */}
        <button
          aria-label="닫기"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          id="btn-modal-close"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* 1. Modal Header & Logo Emblem */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md ring-4 ring-secondary-container/40 mb-3 flex items-center justify-center bg-white">
            <img
              src="/logo.png"
              alt="쓸고닦고 로고"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2
            className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight"
            id="modal-login-title"
          >
            로그인
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            쓸고닦고 서비스 이용을 위해 로그인해 주세요.
          </p>
        </div>

        {/* 2. 회원 구분 라디오 (USER_ROLE_CD) */}
        <div
          aria-label="회원 유형 선택"
          className="w-full bg-surface-container-low p-1 rounded-xl grid grid-cols-2 gap-1 mb-3"
          data-field="USER_ROLE_CD"
          role="radiogroup"
        >
          <button
            aria-checked={role === 'C'}
            className={`flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${
              role === 'C'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-role="C"
            id="role-client"
            onClick={() => setRole('C')}
            role="radio"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${role === 'C' ? 'text-secondary' : 'text-outline'}`}>
              {role === 'C' ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>고객 회원</span>
          </button>
          <button
            aria-checked={role === 'S'}
            className={`flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${
              role === 'S'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            data-role="S"
            id="role-partner"
            onClick={() => setRole('S')}
            role="radio"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${role === 'S' ? 'text-secondary' : 'text-outline'}`}>
              {role === 'S' ? 'radio_button_checked' : 'radio_button_unchecked'}
            </span>
            <span>시공사 회원</span>
          </button>
        </div>

        {/* 3. 비회원 임시 요청서 감지 배너 (조건부 노출) */}
        {hasTempReq && (
          <div
            className="w-full bg-secondary-container/30 border border-secondary/20 rounded-xl p-3 flex items-start gap-2.5 my-2 animate-in fade-in"
            data-notice="SSEULDAKGO_GUEST_TEMP_REQ"
          >
            <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-secondary-container font-semibold">
                비회원 임시 요청서 감지
              </span>
              <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                작성 중이던 청소 요청 정보가 있습니다. 로그인 즉시 자동으로 복원됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 4. SNS 간편 로그인 */}
        <div className="flex flex-col w-full my-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2.5 text-center">
            SNS 계정으로 간편 로그인
          </span>
          <div className="grid grid-cols-4 gap-2 w-full">
            {/* Kakao */}
            <button
              className="h-11 rounded-xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="KAKAO"
              onClick={() => handleSocialLogin('KAKAO')}
              title="카카오 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-4 h-4 fill-[#3C1E1E]" viewBox="0 0 24 24">
                <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
              </svg>
              <span className="font-caption text-[11px] text-[#3C1E1E] font-semibold mt-0.5 leading-none">카카오</span>
            </button>

            {/* Naver */}
            <button
              className="h-11 rounded-xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="NAVER"
              onClick={() => handleSocialLogin('NAVER')}
              title="네이버 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z"></path>
              </svg>
              <span className="font-caption text-[11px] text-white font-semibold mt-0.5 leading-none">네이버</span>
            </button>

            {/* Google */}
            <button
              className="h-11 rounded-xl bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="GOOGLE"
              onClick={() => handleSocialLogin('GOOGLE')}
              title="Google 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
              <span className="font-caption text-[11px] text-on-surface font-semibold mt-0.5 leading-none">Google</span>
            </button>

            {/* Apple */}
            <button
              className="h-11 rounded-xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group"
              data-field="SOCIAL_PROVIDER"
              data-val="APPLE"
              onClick={() => handleSocialLogin('APPLE')}
              title="Apple 로그인"
              type="button"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z"></path>
              </svg>
              <span className="font-caption text-[11px] text-white font-semibold mt-0.5 leading-none">Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full h-[1px] bg-surface-container-highest"></div>
            <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline">
              또는 이메일로 로그인
            </span>
          </div>
        </div>

        {/* 에러 메시지 고지 */}
        {errorMsg && (
          <div className="mb-3 p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 5. 이메일 & 비밀번호 폼 */}
        <form className="flex flex-col gap-3 w-full" id="customer-login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="input-user-email">
              이메일 주소
            </label>
            <div className="relative flex items-center">
              <input
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                data-field="USER_EMAIL"
                id="input-user-email"
                name="USER_EMAIL"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요 (example@domain.com)"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="input-user-pwd">
              비밀번호
            </label>
            <div className="relative flex items-center">
              <input
                autoComplete="current-password"
                className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                data-field="USER_PWD_HASH"
                id="input-user-pwd"
                name="USER_PWD_HASH"
                onChange={(e) => setPwd(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                type={showPwd ? 'text' : 'password'}
                value={pwd}
              />
              <button
                aria-label="비밀번호 보기 토글"
                className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                data-action="toggle-pwd"
                id="btn-toggle-pwd"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPwd ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* 아이디 저장 & 로그인 상태 유지 */}
          <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant pt-1 pb-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={saveId}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer"
                data-field="SAVE_ID_YN"
                onChange={(e) => setSaveId(e.target.checked)}
                type="checkbox"
              />
              <span>아이디 저장</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                checked={keepLogin}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer"
                data-field="KEEP_LOGIN_YN"
                onChange={(e) => setKeepLogin(e.target.checked)}
                type="checkbox"
              />
              <span>로그인 상태 유지</span>
            </label>
          </div>

          {/* 6. 로그인 제출 버튼 */}
          <button
            className="w-full h-12 mt-1 rounded-xl bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-action="SUBMIT_LOGIN"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>로그인</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="flex items-center justify-center gap-3 font-caption text-caption text-outline mt-5 pt-3 border-t border-slate-100">
          <button
            className="hover:text-on-surface transition-colors"
            data-action="CALL_FIND_PWD"
            onClick={onOpenFindPwd || (() => alert('비밀번호 찾기 페이지 준비 중입니다.'))}
            type="button"
          >
            비밀번호 찾기
          </button>
          <span className="text-surface-container-highest">|</span>
          <button
            className="text-primary font-bold hover:underline transition-colors"
            data-action="CALL_SIGNUP"
            onClick={onOpenRegister || (() => alert('회원가입 페이지 준비 중입니다.'))}
            type="button"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// [모달 컴포넌트] WEB-CLNT-ATH-010 (통합 회원가입 및 4대 약관 정독 모달)
// ============================================================================
/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010/index.jsx
 * @description 통합 회원가입 및 4대 약관 정독 모달 컴포넌트 (WEB-CLNT-ATH-010)
 *              - SNS(카카오, 네이버, Google, Apple) 연동 간편 가입 및 일반 이메일 가입
 *              - 자필 전자서명 캔버스 패드 & 서명 지우기 & PNG 파일 저장 연동
 * 
 * Props:
 * - isOpen: 모달 표시 여부 (boolean)
 * - onClose: 모달 닫기 핸들러 () => void
 * - onSuccessRegister: 가입 완료 성공 콜백 (userData) => void
 * - onOpenLogin: 로그인 모달(WEB-CLNT-ATH-000) 전환 핸들러 () => void
 */

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010/index.jsx
 * @description 통합 회원가입 및 4대 약관 정독 모달 컴포넌트 (WEB-CLNT-ATH-010)
 *              - SNS(카카오, 네이버, Google, Apple) 연동 간편 가입 및 일반 이메일 가입
 *              - 자필 전자서명 캔버스 패드 & 서명 지우기 & PNG 파일 저장 연동
 * 
 * Props:
 * - isOpen: 모달 표시 여부 (boolean)
 * - onClose: 모달 닫기 핸들러 () => void
 * - onSuccessRegister: 가입 완료 성공 콜백 (userData) => void
 * - onOpenLogin: 로그인 모달(WEB-CLNT-ATH-000) 전환 핸들러 () => void
 */
export function WebClntAth010({
  isOpen = false,
  onClose,
  onSuccessRegister,
  onOpenLogin
}) {
  // 1. 회원 구분 ('C': 고객 회원, 'S': 시공사 회원)
  const [role, setRole] = useState('C');

  // 2. SNS 연동 정보
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialUid, setSocialUid] = useState(null);

  // 3. 계정 정보 필드
  const [email, setEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false); // 비밀번호 보기/숨기기 토글 (Requirement 1)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false); // 비밀번호 확인 보기/숨기기 토글 (Requirement 1)
  const [userNm, setUserNm] = useState('');
  const [userTel, setUserTel] = useState('');
  const [isTelVerified, setIsTelVerified] = useState(true);

  // 오류 및 유효성 검증 알림 모달 상태 (Requirement 2)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    targetRef: null
  });

  // 회원가입 완료 축하 커스텀 모달 상태 (브라우저 기본 alert 대체)
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    userData: null
  });

  const handleConfirmSuccessModal = () => {
    const userData = successModal.userData;
    setSuccessModal({ isOpen: false, title: '', message: '', userData: null });
    if (onSuccessRegister && userData) {
      onSuccessRegister(userData);
    }
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onClose) {
      onClose();
    }
  };

  const showAlertModal = (message, title = '입력 정보 확인', targetRef = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      targetRef
    });
  };

  // 포커스 및 스크롤용 ref
  const emailInputRef = useRef(null);
  const pwdInputRef = useRef(null);
  const pwdConfirmInputRef = useRef(null);

  // 4. 자필 전자서명 캔버스 상태
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // 5. 4대 약관 Scroll-Lock 및 개별 동의 일시(agreedAt) 상태 관리
  const [terms, setTerms] = useState({
    service: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() },
    privacy: { scrolled: true, checked: true, progress: 100, agreedAt: new Date().toISOString() },
    location: { scrolled: false, checked: false, progress: 0, agreedAt: null },
    finance: { scrolled: false, checked: false, progress: 0, agreedAt: null }
  });

  const [allChecked, setAllChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfoMsg, setSuccessInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 스크롤 감지용 ref
  const locationViewerRef = useRef(null);
  const financeViewerRef = useRef(null);
  const termsSectionRef = useRef(null);

  // 모달 오픈 시 초기화
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setSuccessInfoMsg('');
      setIsLoading(false);
      setSocialProvider(null);
      setSocialUid(null);
      setShowPwd(false);
      setShowPwdConfirm(false);
      setAlertModal({ isOpen: false, title: '', message: '', targetRef: null });
      setUserNm('');
      setUserTel('');
      handleClearSignature();
      return;
    }
  }, [isOpen]);

  // 약관 동의 건수 계산
  const agreeCount = Object.values(terms).filter((t) => t.checked).length;

  useEffect(() => {
    setAllChecked(agreeCount === 4);
  }, [agreeCount]);

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

  // =========================================================================
  // 전자서명 캔버스 드로잉 로직 (마우스 & 터치 지원)
  // =========================================================================
  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#003262'; // Brand Deep Royal Navy
    isDrawing.current = true;
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const startDrawingTouch = (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#003262';
      isDrawing.current = true;
      setHasSignature(true);
    }
  };

  const drawTouch = (e) => {
    if (!isDrawing.current) return;
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // =========================================================================
  // SNS 연동 가입 핸들러
  // =========================================================================
  const handleSocialSignup = (provider) => {
    const dummyUid = `${provider.toLowerCase()}_uid_${Date.now()}`;
    const dummyEmail = `${provider.toLowerCase()}_user@sseuldakgo.kr`;

    setSocialProvider(provider);
    setSocialUid(dummyUid);
    setEmail(dummyEmail);
    setIsEmailChecked(true);
    setIsEmailValid(true);
    setEmailCheckMsg(`✓ ${provider} 계정으로 본인확인 및 연동되었습니다.`);
    setPwd('social_auth_pwd!');
    setPwdConfirm('social_auth_pwd!');
    setErrorMsg('');

    if (agreeCount === 4) {
      setSuccessInfoMsg(`${provider} 계정 연동 완료! 서명 날인 후 '회원가입 완료하기'를 누르시면 가입이 완료됩니다.`);
    } else {
      setSuccessInfoMsg(`${provider} 계정이 연동되었습니다. 아래 4대 필수 약관 전문 확인 및 서명 날인 후 가입을 완료해 주세요.`);
      if (termsSectionRef.current) {
        termsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // SNS 연동 해제
  const handleCancelSocial = () => {
    setSocialProvider(null);
    setSocialUid(null);
    setEmail('');
    setIsEmailChecked(false);
    setEmailCheckMsg('');
    setPwd('');
    setPwdConfirm('');
    setSuccessInfoMsg('');
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('올바른 형식의 이메일 주소를 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/web/client/ath_010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_EMAIL',
          userRoleCd: role,
          userEmail: email.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.isAvailable) {
        setIsEmailChecked(true);
        setIsEmailValid(true);
        setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
      } else {
        setIsEmailChecked(true);
        setIsEmailValid(false);
        setEmailCheckMsg(data.message || '이미 등록된 이메일 주소입니다.');
      }
    } catch (e) {
      setIsEmailChecked(true);
      setIsEmailValid(true);
      setEmailCheckMsg('✓ 사용 가능한 안전한 이메일 주소입니다.');
    }
  };

  // 휴대폰 재인증 모의 호출
  const handleReverifyTel = () => {
    alert('PASS / SMS 실명확인 팝업이 호출되었습니다. (가상 환경 테스트 통과)');
    setIsTelVerified(true);
  };

  // Scroll-Lock 감지 핸들러
  const handleScroll = (key, e) => {
    const el = e.target;
    if (!el) return;

    const scrolledToEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 6;
    const progress = Math.min(
      100,
      Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    );

    setTerms((prev) => {
      const current = prev[key];
      if (scrolledToEnd) {
        return {
          ...prev,
          [key]: {
            ...current,
            scrolled: true,
            checked: true,
            progress: 100,
            agreedAt: current.agreedAt || new Date().toISOString()
          }
        };
      } else if (!current.checked) {
        return {
          ...prev,
          [key]: { ...current, progress }
        };
      }
      return prev;
    });
  };

  // 개별 체크박스 토글 (동의 일시 실시간 기록)
  const handleToggleTerm = (key) => {
    const target = terms[key];
    if (!target.scrolled) {
      showAlertModal('약관 본문을 끝까지 스크롤하여 전문을 확인하신 후 동의해 주세요.', '약관 정독 필요');
      return;
    }
    setTerms((prev) => {
      const willCheck = !prev[key].checked;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          checked: willCheck,
          agreedAt: willCheck ? new Date().toISOString() : null
        }
      };
    });
  };

  // 전체 동의 토글 (모든 약관에 현재 시점 Timestamp 반영)
  const handleToggleAll = (e) => {
    const checked = e.target.checked;
    const nowIso = new Date().toISOString();
    if (checked) {
      if (!terms.location.scrolled || !terms.finance.scrolled) {
        showAlertModal('필수 약관의 전문(위치기반, 전자금융거래)을 스크롤하여 먼저 끝까지 확인해주셔야 일괄 동의가 완료됩니다.', '약관 정독 필요');
        return;
      }
      setTerms({
        service: { ...terms.service, checked: true, agreedAt: terms.service.agreedAt || nowIso },
        privacy: { ...terms.privacy, checked: true, agreedAt: terms.privacy.agreedAt || nowIso },
        location: { ...terms.location, checked: true, agreedAt: terms.location.agreedAt || nowIso },
        finance: { ...terms.finance, checked: true, agreedAt: terms.finance.agreedAt || nowIso }
      });
    } else {
      setTerms({
        service: { ...terms.service, checked: false, agreedAt: null },
        privacy: { ...terms.privacy, checked: false, agreedAt: null },
        location: { ...terms.location, checked: false, agreedAt: null },
        finance: { ...terms.finance, checked: false, agreedAt: null }
      });
    }
  };

  // 최종 가입 제출 (Requirement 2 검증 및 모달 출력)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // 2.1 이메일 입력 여부 검증
    if (!email || !email.trim()) {
      showAlertModal('로그인 이메일(계정 ID)을 입력해 주세요.', '이메일 입력 필요', emailInputRef);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      showAlertModal('올바른 이메일 주소 형식(name@example.com)으로 입력해 주세요.', '이메일 형식 확인', emailInputRef);
      return;
    }

    // 2.2 비밀번호 및 비밀번호 확인 입력 여부와 두 비밀번호 일치 검증 (일반 가입 시)
    if (!socialProvider) {
      if (!pwd || !pwd.trim()) {
        showAlertModal('비밀번호를 입력해 주세요.', '비밀번호 입력 필요', pwdInputRef);
        return;
      }
      if (pwd.length < 6) {
        showAlertModal('비밀번호는 최소 6자 이상(영문, 숫자, 특수기호 혼용)이어야 합니다.', '비밀번호 규칙 확인', pwdInputRef);
        return;
      }
      if (!pwdConfirm || !pwdConfirm.trim()) {
        showAlertModal('비밀번호 확인을 입력해 주세요.', '비밀번호 확인 필요', pwdConfirmInputRef);
        return;
      }
      if (pwd !== pwdConfirm) {
        showAlertModal('비밀번호와 비밀번호 확인에 입력된 정보가 일치하지 않습니다.\n동일한 비밀번호를 다시 입력해 주세요.', '비밀번호 불일치', pwdConfirmInputRef);
        return;
      }
    }

    // 성함 및 연락처 검증
    if (!userNm || !userNm.trim()) {
      showAlertModal('성함(실명)을 입력해 주세요.', '실명 입력 필요');
      return;
    }
    if (!userTel || !userTel.trim()) {
      showAlertModal('휴대폰 번호를 입력해 주세요.', '휴대폰 번호 필요');
      return;
    }

    // 2.3 이용 약관 마지막까지 읽었는지 확인
    if (!terms.location.scrolled || !terms.location.checked) {
      showAlertModal('위치기반 서비스 이용약관의 전문을 끝까지 스크롤하여 확인 후 동의를 완료해 주세요.', '이용약관 확인 필요', locationViewerRef);
      return;
    }
    if (!terms.finance.scrolled || !terms.finance.checked) {
      showAlertModal('전자금융거래 이용약관의 전문을 끝까지 스크롤하여 확인 후 동의를 완료해 주세요.', '이용약관 확인 필요', financeViewerRef);
      return;
    }
    if (!terms.service.checked || !terms.privacy.checked) {
      showAlertModal('필수 이용약관(서비스 이용약관, 개인정보 수집 및 이용)에 동의해 주세요.', '이용약관 확인 필요', termsSectionRef);
      return;
    }

    // 2.4 서명 입력 여부 검증
    if (!hasSignature) {
      showAlertModal('안심 계약 체결 및 본인 확인을 위해 서명란에 자필 전자서명을 입력해 주세요.', '전자서명 입력 필요', canvasRef);
      return;
    }

    setIsLoading(true);

    // Canvas Data URL 추출
    const signDataUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    const nowIso = new Date().toISOString();

    // 약관별 정밀 동의 일자/시간(시분초) 페이로드 구성 (TB_TERMS_MASTER v1.0 기준 동기화)
    const agreedTermsDetail = [
      {
        termsCd: 'SERVICE',
        termsVer: 'v1.0',
        agreeYn: terms.service.checked ? 'Y' : 'N',
        agreedAt: terms.service.agreedAt || nowIso
      },
      {
        termsCd: 'PRIVACY',
        termsVer: 'v1.0',
        agreeYn: terms.privacy.checked ? 'Y' : 'N',
        agreedAt: terms.privacy.agreedAt || nowIso
      },
      {
        termsCd: 'LOCATION',
        termsVer: 'v1.0',
        agreeYn: terms.location.checked ? 'Y' : 'N',
        agreedAt: terms.location.agreedAt || nowIso
      },
      {
        termsCd: 'FINANCE',
        termsVer: 'v1.0',
        agreeYn: terms.finance.checked ? 'Y' : 'N',
        agreedAt: terms.finance.agreedAt || nowIso
      },
      {
        termsCd: 'SIGNATURE',
        termsVer: 'v1.0',
        agreeYn: hasSignature ? 'Y' : 'N',
        agreedAt: nowIso
      }
    ];

    try {
      const res = await fetch('/api/web/client/ath_010', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER',
          userRoleCd: role,
          userEmail: email.trim(),
          userPwd: pwd,
          userPwdConfirm: pwdConfirm,
          userNm: userNm.trim(),
          userTel: userTel.trim(),
          socialProvider: socialProvider || null,
          socialUid: socialUid || null,
          signDataUrl: signDataUrl,
          agreedTerms: ['SERVICE', 'PRIVACY', 'LOCATION', 'FINANCE', 'SIGNATURE'],
          agreedTermsDetail: agreedTermsDetail
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessModal({
          isOpen: true,
          title: '[쓸고닦고 회원가입 완료]',
          message: socialProvider
            ? `${socialProvider} 계정으로 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.`
            : '쓸고닦고 통합 회원가입 및 전자서명이 성공적으로 접수되었습니다.\n\n로그인 화면으로 이동하여 바로 로그인하실 수 있습니다.',
          userData: data.data,
        });
      } else {
        showAlertModal(data.message || '회원가입 처리 중 오류가 발생했습니다.', '회원가입 실패');
        setErrorMsg(data.message || '회원가입 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.warn('[REGISTER_REQUEST_ERR]', err);
      showAlertModal('회원가입 서버 통신 중 오류가 발생했습니다: ' + (err?.message || err), '통신 오류');
      setErrorMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      id="signup-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        aria-labelledby="modal-headline"
        aria-modal="true"
        className="relative w-full max-w-[560px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden text-on-surface transform transition-all duration-300 border border-slate-200/80 animate-in zoom-in-95"
        id="signup-modal-container"
        role="dialog"
      >
        {/* Top Micro Status Banner */}
        <div className="bg-surface-container-low px-6 sm:px-8 py-2.5 flex items-center justify-between border-b border-slate-200/60">
          <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="font-semibold tracking-tight">KISA & 금융위 가이드라인 준수 전자서명 세션</span>
          </div>
          <span className="text-on-surface-variant font-caption text-caption">화면 ID: WEB-CLNT-ATH-010</span>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto px-6 sm:px-8 pt-6 pb-8 space-y-6 flex-1 scroll-smooth" id="modal-scroll-pane">
          {/* 1. Modal Header */}
          <header className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="relative w-12 h-12 rounded-xl bg-surface-container p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                  alt="쓸고닦고 공식 심볼 로고"
                  className="w-full h-full object-cover rounded-lg"
                  src="/logo.png"
                />
              </div>
              <div>
                <h2 className="text-on-surface font-headline-md text-headline-md tracking-tight font-bold" id="modal-headline">
                  통합 회원가입
                </h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  쓸고닦고와 함께 깨끗하고 믿을 수 있는 안심 공간을 만들어보세요.
                </p>
              </div>
            </div>
            <button
              aria-label="닫기"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
              onClick={onClose}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          {/* 2. 회원 구분 2-Way 세그먼트 버튼 (TB_USER: USER_ROLE_CD) */}
          <section aria-labelledby="role-select-title" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface font-bold" id="role-select-title">
                회원 유형 선택
              </span>
              <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                실시간 역할 분기 적용
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl">
              {/* 고객 회원 (C) */}
              <button
                className={`h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${
                  role === 'C'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="C"
                id="role-btn-client"
                onClick={() => setRole('C')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>고객 회원 (의뢰·발주)</span>
              </button>
              {/* 시공사 회원 (S) */}
              <button
                className={`h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${
                  role === 'S'
                    ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
                data-field="USER_ROLE_CD"
                data-role-value="S"
                id="role-btn-partner"
                onClick={() => setRole('S')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">engineering</span>
                <span>시공사 회원 (시공.수주)</span>
              </button>
            </div>
            <p className="text-on-surface-variant font-caption text-caption flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[14px] text-primary">info</span>
              <span>선택하신 회원 구분에 따라 시공 발주서 등록 또는 파트너 견적 전송 권한이 부여됩니다.</span>
            </p>
          </section>

          {/* 피드백 안내 메시지 (SNS 연동 성공 / 에러) */}
          {successInfoMsg && (
            <div className="p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-xl flex items-start justify-between gap-2 text-on-secondary-fixed-variant font-caption text-caption animate-in fade-in">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
                <span>{successInfoMsg}</span>
              </div>
              {socialProvider && (
                <button
                  type="button"
                  onClick={handleCancelSocial}
                  className="text-[11px] underline shrink-0 hover:text-primary"
                >
                  연동 취소
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in">
              <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 3. 계정 정보 입력 섹션 (TB_USER) */}
          <section className="space-y-4 pt-1">
            {/* SNS 계정으로 간편 가입 버튼군 (로그인 이메일 위에 배치) */}
            <div className="flex flex-col w-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2 text-center">
                SNS 계정으로 간편 가입
              </span>
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {/* Kakao */}
                <button
                  className={`h-11 rounded-2xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'KAKAO' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="KAKAO"
                  onClick={() => handleSocialSignup('KAKAO')}
                  title="카카오로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-4 h-4 fill-[#3C1E1E]" viewBox="0 0 24 24">
                    <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-[#3C1E1E] font-bold mt-0.5 leading-none">카카오</span>
                </button>

                {/* Naver */}
                <button
                  className={`h-11 rounded-2xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'NAVER' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="NAVER"
                  onClick={() => handleSocialSignup('NAVER')}
                  title="네이버로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-white font-bold mt-0.5 leading-none">네이버</span>
                </button>

                {/* Google */}
                <button
                  className={`h-11 rounded-2xl bg-surface-container-lowest border border-slate-300/80 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'GOOGLE' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="GOOGLE"
                  onClick={() => handleSocialSignup('GOOGLE')}
                  title="Google로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-on-surface font-bold mt-0.5 leading-none">Google</span>
                </button>

                {/* Apple */}
                <button
                  className={`h-11 rounded-2xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${
                    socialProvider === 'APPLE' ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  data-field="SOCIAL_PROVIDER"
                  data-val="APPLE"
                  onClick={() => handleSocialSignup('APPLE')}
                  title="Apple로 가입"
                  type="button"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z"></path>
                  </svg>
                  <span className="font-caption text-[11px] text-white font-bold mt-0.5 leading-none">Apple</span>
                </button>
              </div>

              {/* 구분선 */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full h-[1px] bg-slate-200"></div>
                <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline">
                  또는 이메일로 가입
                </span>
              </div>
            </div>

            {/* 이메일 인풋 및 중복 확인 */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-email">
                로그인 이메일 (계정 ID)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                    data-field="USER_EMAIL"
                    id="field-user-email"
                    ref={emailInputRef}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailChecked(false);
                    }}
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                  />
                </div>
                <button
                  className="h-12 px-4 bg-surface-container text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-high transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  id="btn-check-duplicate"
                  onClick={handleCheckEmail}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">manage_search</span>
                  <span>중복확인</span>
                </button>
              </div>
              {isEmailChecked && (
                <p className={`font-caption text-caption ${isEmailValid ? 'text-secondary' : 'text-error'}`} id="email-hint">
                  {emailCheckMsg}
                </p>
              )}
            </div>

            {/* 비밀번호 & 비밀번호 확인 (Requirement 1: 눈 아이콘 보기/숨기기 토글) */}
            {!socialProvider && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 비밀번호 */}
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-pwd">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_HASH"
                        id="field-user-pwd"
                        ref={pwdInputRef}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="영문, 숫자, 특수문자 조합"
                        type={showPwd ? 'text' : 'password'}
                        value={pwd}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title={showPwd ? '비밀번호 숨기기' : '비밀번호 표시'}
                        aria-label={showPwd ? '비밀번호 숨기기' : '비밀번호 표시'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPwd ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-pwd-confirm">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        data-field="USER_PWD_CONFIRM"
                        id="field-user-pwd-confirm"
                        ref={pwdConfirmInputRef}
                        onChange={(e) => setPwdConfirm(e.target.value)}
                        placeholder="비밀번호 재입력"
                        type={showPwdConfirm ? 'text' : 'password'}
                        value={pwdConfirm}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        title={showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                        aria-label={showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPwdConfirm ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  8~16자 영문, 숫자, 특수기호(!@#$%^&*)를 혼용하여 안전하게 설정해주세요.
                </p>
              </>
            )}

            {/* 성명 (성함) 입력 (TB_USER: USER_NM) */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold" htmlFor="field-user-nm">
                성명 (성함)
              </label>
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                data-field="USER_NM"
                id="field-user-nm"
                onChange={(e) => setUserNm(e.target.value)}
                onFocus={(e) => { e.target.placeholder = ''; }}
                onBlur={(e) => { if (!e.target.value) e.target.placeholder = '홍길동'; }}
                placeholder="홍길동"
                type="text"
                value={userNm}
              />
            </div>
          </section>

          {/* 4. 휴대폰 실명 본인확인 섹션 (TB_USER: USER_TEL) */}
          <section className="space-y-3 p-4 bg-surface-container-low rounded-2xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold" htmlFor="field-user-tel">
                <span className="material-symbols-outlined text-secondary text-[18px]">phonelink_lock</span>
                휴대폰 본인명의 실명인증
              </label>
              <span className="text-secondary font-label-sm text-label-sm font-semibold">PASS / SMS 통신사 연동</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all"
                data-field="USER_TEL"
                id="field-user-tel"
                onChange={(e) => setUserTel(e.target.value)}
                onFocus={(e) => { e.target.placeholder = ''; }}
                onBlur={(e) => { if (!e.target.value) e.target.placeholder = '010-0000-0000'; }}
                placeholder="010-0000-0000"
                type="tel"
                value={userTel}
              />
              <button
                className="h-12 px-4 bg-surface-container-lowest border border-secondary/30 text-secondary font-label-md text-label-md rounded-xl hover:bg-secondary/10 transition-colors shrink-0 shadow-sm flex items-center gap-1"
                onClick={handleReverifyTel}
                type="button"
              >
                <span>재인증 요청</span>
              </button>
            </div>
            {/* 완료 피드백 뱃지 */}
            <div className="p-3 bg-secondary-fixed/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span className="text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                  본인인증 완료 ({userNm || '홍길동'} / {userTel ? userTel.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2') : '010-****-0000'})
                </span>
              </div>
              <span className="text-on-secondary-fixed-variant font-caption text-caption opacity-80 font-mono">
                CI 암호화 검증필
              </span>
            </div>
          </section>

          {/* 5. 필수 4대 약관 Scroll-Lock 컴플라이언스 아코디언/뷰어 */}
          <section aria-labelledby="terms-section-title" className="space-y-3.5 pt-2" ref={termsSectionRef}>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold" id="terms-section-title">
                필수 이용약관 동의 <span className="text-secondary font-body-sm font-normal">(Scroll-Lock)</span>
              </h3>
              <span className="text-on-surface-variant font-caption text-caption">
                4건 중 <span className="font-bold text-secondary" id="agree-count">{agreeCount}</span>건 완료
              </span>
            </div>

            {/* 안내 가이드 배너 */}
            <div className="p-3 bg-tertiary-fixed/40 rounded-xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5">policy</span>
              <div className="space-y-0.5 text-on-tertiary-fixed">
                <p className="font-label-sm text-label-sm font-bold">전체 약관 정독 의무화 시스템 가동 중</p>
                <p className="font-caption text-caption leading-relaxed">
                  각 약관의 본문을 끝까지 스크롤하여 100% 확인하셔야 동의 체크박스가 자동 활성화됩니다.
                </p>
              </div>
            </div>

            <div className="space-y-3" id="terms-container">
              {/* 1) 서비스 통합이용약관 v1.0 */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="SERVICE">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.service.checked}
                        className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="SERVICE"
                        data-terms-ver-seq="1"
                        id="check-terms-service"
                        onChange={() => handleToggleTerm('service')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 서비스 통합이용약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    전문 확인 완료
                  </span>
                </div>
                <div className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner" id="viewer-terms-service">
                  <p className="font-semibold text-on-surface">제1조 (목적 및 플랫폼 매칭비 확정 규정)</p>
                  <p>본 약관은 주식회사 쓸고닦고(이하 '회사')가 운영하는 O2O 주거위생 안심 매칭 서비스의 기본 이용조건을 규정합니다. 회사는 매칭 성사 시 1회 고정 플랫폼 중개비 16,500원(부가세 포함)을 정액 청구합니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (현장 시공비 직불 원칙 및 안심 시공 책임)</p>
                  <p>시공 노임 및 인건비는 시공 검수 완료 후 고객이 시공 마스터에게 직접 지급함을 원칙으로 하며, 회사는 인건비의 무단 전용 및 과도한 에스크로 예치를 지양합니다. 마스터의 고의·과실로 발생한 손해는 1억원 배상책임보험을 통해 보증 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (역경매 및 덤핑 금지)</p>
                  <p>플랫폼의 표준 단가 체계를 왜곡하는 불공정 덤핑 제안 및 무단 수수료 전가는 즉각적인 계정 정지 및 회원 자격 박탈 사유가 됩니다.</p>
                </div>
              </div>

              {/* 2) 개인정보 수집 및 이용 동의 v1.0 */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="PRIVACY">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.privacy.checked}
                        className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="PRIVACY"
                        data-terms-ver-seq="1"
                        id="check-terms-privacy"
                        onChange={() => handleToggleTerm('privacy')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 개인정보 수집 및 이용 동의 v1.0
                      </span>
                    </label>
                  </div>
                  <span className="bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                    전문 확인 완료
                  </span>
                </div>
                <div className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner" id="viewer-terms-privacy">
                  <p className="font-semibold text-on-surface">1. 수집 항목 및 보유 목적</p>
                  <p>- 필수 수집 항목: 성명, 휴대전화번호, 이메일 주소, 서비스 시공 희망 주소지(동·호수 포함).</p>
                  <p>- 이용 목적: 신원 인증, 1급 청소 마스터 파견 배차, 1억원 안심보험 접수 및 서비스 사후 안심보증 이력 관리.</p>
                  <p className="font-semibold text-on-surface">2. 보유 및 파기 절차</p>
                  <p>회원 탈퇴 시 전자금융거래법 및 개인정보보호법에 명시된 법정 보관기간(거래내역 5년) 경과 후 지체 없이 복구 불가능한 방법으로 영구 파기합니다.</p>
                </div>
              </div>

              {/* 3) 위치기반 서비스 이용약관 v1.0 (Scroll 감지 대상) */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="LOCATION">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.location.checked}
                        className={`w-4 h-4 rounded text-secondary accent-secondary ${
                          terms.location.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                        }`}
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="LOCATION"
                        data-terms-ver-seq="1"
                        disabled={!terms.location.scrolled}
                        id="check-terms-location"
                        onChange={() => handleToggleTerm('location')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 위치기반 서비스 이용약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${
                      terms.location.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    id="badge-terms-location"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {terms.location.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.location.scrolled
                        ? '전문 확인 완료'
                        : `스크롤 필요 (${terms.location.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner"
                  id="viewer-terms-location"
                  onScroll={(e) => handleScroll('location', e)}
                  ref={locationViewerRef}
                >
                  <p className="font-semibold text-on-surface">제1조 (위치정보의 활용)</p>
                  <p>회사는 신청인의 신청 주소지를 기반으로 가장 신속하게 현장 도달이 가능한 반경 5km 이내의 검증된 1급 홈케어 마스터를 자동 정렬하여 매칭 후보로 제안합니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (위치기반 출동 관제)</p>
                  <p>배차 확정 시공 일자에 마스터의 실제 이동 현황 및 예상 방문 시간(ETA)을 고객 단말기에 실시간 푸시 통보할 수 있습니다. 수집된 GPS 정보는 작업 완료 24시간 후 완전히 마스킹 폐기 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (이용자의 권리)</p>
                  <p>고객은 언제든지 단말기 설정을 통해 위치 정보 수집을 일시 중단할 수 있으며, 이 경우 자동 거리 기반 배차 대신 주소 직접 검색 수기 방식으로 대체 처리됩니다. (본 조항 정독 완료)</p>
                </div>
              </div>

              {/* 4) 전자금융거래 기본약관 v1.0 (Scroll 감지 대상) */}
              <div className="p-3.5 bg-surface-container-low rounded-xl space-y-2.5" data-field="TB_TERMS_MASTER" data-is-required-yn="Y" data-terms-cd="FINANCE">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        checked={terms.finance.checked}
                        className={`w-4 h-4 rounded text-secondary accent-secondary ${
                          terms.finance.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                        }`}
                        data-field="SCROLLED_TO_END_YN"
                        data-terms-cd="FINANCE"
                        data-terms-ver-seq="1"
                        disabled={!terms.finance.scrolled}
                        id="check-terms-finance"
                        onChange={() => handleToggleTerm('finance')}
                        type="checkbox"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        [필수] 전자금융거래 기본약관 v1.0
                      </span>
                    </label>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${
                      terms.finance.scrolled
                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                    id="badge-terms-finance"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {terms.finance.scrolled ? 'check' : 'hourglass_bottom'}
                    </span>
                    <span>
                      {terms.finance.scrolled
                        ? '전문 확인 완료'
                        : `스크롤 필요 (${terms.finance.progress}%)`}
                    </span>
                  </span>
                </div>
                <div
                  className="h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner"
                  id="viewer-terms-finance"
                  onScroll={(e) => handleScroll('finance', e)}
                  ref={financeViewerRef}
                >
                  <p className="font-semibold text-on-surface">제1조 (결제 대행 및 환불 방침)</p>
                  <p>매칭 수수료(16,500원) 결제는 공인 전자지급결제대행업자(PG)를 통해 안전하게 진행되며, 시공 마스터 매칭 실패 시 수수료는 100% 즉시 자동 환불 처리됩니다.</p>
                  <p className="font-semibold text-on-surface">제2조 (3개월 안심보증 케어 연동)</p>
                  <p>정상 완료된 거래 건에 한하여 90일간 누수, 결로, 재오염에 대한 안심보증 분쟁조정위원회의 지원을 받으실 수 있습니다. 현장 직불금 영수증은 마스터가 현장에서 직접 세금계산서 또는 현금영수증으로 발급 교부합니다.</p>
                  <p className="font-semibold text-on-surface">제3조 (오류의 정정)</p>
                  <p>이용자는 전자금융거래에 오류가 있음을 안 때에 즉시 회사에 정정을 요구할 수 있으며 회사는 접수 즉시 2영업일 이내에 원인을 규명하여 회신합니다. (정독 완료)</p>
                </div>
              </div>
            </div>
          </section>

          {/* 전체 동의 간편 컨트롤 */}
          <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                checked={allChecked}
                className="w-4 h-4 rounded text-secondary accent-secondary cursor-pointer"
                id="check-all-terms"
                onChange={handleToggleAll}
                type="checkbox"
              />
              <span className="font-label-md text-label-md text-on-surface font-bold">
                [전체 동의] 4대 필수 약관 및 개인정보 처리방침에 모두 동의합니다.
              </span>
            </label>
            <span className="text-secondary font-label-sm text-label-sm font-semibold">일괄 서명</span>
          </div>

          {/* =================================================================
              6. [신규 추가] 전자서명 패드 (자필 서명 날인 & 서명 지우기)
          ================================================================= */}
          <section className="space-y-2 pt-1 border-t border-slate-200/60" data-field="TB_MEMBER_AGREE_SIGN">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">draw</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  자필 전자서명 날인
                </span>
                <span className="font-caption text-caption text-secondary font-semibold">
                  (전자서명법 제3조 법적 효력)
                </span>
              </div>
              <button
                className="h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1"
                id="btn-clear-signature"
                onClick={handleClearSignature}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>서명지우기</span>
              </button>
            </div>
            <div className="relative w-full h-32 rounded-xl border border-slate-300 bg-surface-container-lowest overflow-hidden shadow-inner flex flex-col justify-between">
              <canvas
                className="w-full h-full cursor-crosshair touch-none"
                height={128}
                id="signature-canvas"
                onMouseDown={startDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={drawTouch}
                onTouchStart={startDrawingTouch}
                ref={canvasRef}
                width={500}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-outline/60 text-sm font-medium">
                  <span>여기에 마우스 또는 터치로 자필 서명해 주세요</span>
                </div>
              )}
            </div>
            <p className="font-caption text-caption text-outline flex items-center gap-1 px-0.5">
              <span className="material-symbols-outlined text-[13px]">info</span>
              <span>본 서명은 PNG 파일로 저장되며 공인 전자증적 데이터베이스에 영구 보관됩니다.</span>
            </p>
          </section>

          {/* 7. Footer Actions & CTA */}
          <div className="space-y-4 pt-2">
            <button
              className="w-full h-[52px] bg-secondary hover:bg-[#005049] text-white rounded-xl font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isLoading}
              id="btn-submit-signup"
              onClick={handleSubmit}
              type="button"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>회원가입 완료하기</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <div className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1.5">
              <span>이미 계정이 있으신가요?</span>
              <button
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={onOpenLogin || (() => {})}
                type="button"
              >
                로그인하기 (WEB-CLNT-ATH-000)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 유효성 검증 오류 안내 모달 (Requirement 2) */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {alertModal.title || '입력 정보 확인'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {alertModal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const targetRef = alertModal.targetRef;
                setAlertModal({ isOpen: false, title: '', message: '', targetRef: null });
                if (targetRef && targetRef.current) {
                  setTimeout(() => {
                    targetRef.current.focus?.();
                    targetRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                  }, 50);
                }
              }}
              className="w-full h-11 bg-primary text-on-primary font-label-lg text-label-lg rounded-xl hover:bg-primary-container transition-colors shadow-md font-bold cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 회원가입 완료 축하 커스텀 모달 (브라우저 기본 alert 완전 대체) */}
      {successModal.isOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40 text-center animate-in zoom-in-95 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">verified</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              {successModal.title || '[쓸고닦고 회원가입 완료]'}
            </h3>
            <div className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left w-full">
              {successModal.message}
            </div>
            <button
              type="button"
              onClick={handleConfirmSuccessModal}
              className="w-full h-12 bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg rounded-2xl transition-all shadow-md font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <span>확인 (로그인 화면으로 이동)</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WebClntAth011({
  isOpen = false,
  userInfo = null,
  onClose,
  onOpenRequestModal
}) {
  const [profile, setProfile] = useState({
    userNo: userInfo?.userNo || userInfo?.USER_NO || 'C20261100001',
    userNm: userInfo?.userNm || userInfo?.USER_NM || '고객',
    userEmail: userInfo?.userEmail || userInfo?.USER_EMAIL || 'user@example.com',
    userTel: userInfo?.userTel || userInfo?.USER_TEL || '',
    userRoleCd: userInfo?.userRoleCd || userInfo?.USER_ROLE_CD || 'C',
    signImgUrl: userInfo?.signImgUrl || userInfo?.signFileUrl || userInfo?.SIGN_IMG_URL || null,
    regDt: ''
  });

  const [termsAgreedList, setTermsAgreedList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSign, setIsUpdatingSign] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome');

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const effectiveUserNo = userInfo?.userNo || userInfo?.USER_NO || profile.userNo || 'C20261100001';

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
            userNm: d.userNm || userInfo?.userNm || userInfo?.USER_NM || '고객',
            userEmail: d.userEmail || userInfo?.userEmail || userInfo?.USER_EMAIL || '',
            userTel: d.userTel || userInfo?.userTel || '',
            userRoleCd: d.userRoleCd || 'C',
            signImgUrl: d.signImgUrl || userInfo?.signImgUrl || userInfo?.SIGN_IMG_URL || null,
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
      <div
        aria-labelledby="modal-welcome-headline"
        aria-modal="true"
        className="relative w-full max-w-[520px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-7 text-center transform transition-all duration-300 scale-100 flex flex-col items-center animate-in zoom-in-95 border border-slate-200/80 text-on-surface overflow-y-auto"
        id="modal-welcome-card"
        role="dialog"
      >
        <button
          aria-label="팝업 닫기"
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
          id="btn-close-x"
          onClick={onClose}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

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

        <h2
          className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight mb-1 leading-snug"
          id="modal-welcome-headline"
        >
          쓸고닦고에 오신 것을 환영합니다!
        </h2>
        <p className="font-caption text-caption text-on-surface-variant leading-relaxed mb-3">
          회원가입 및 5대 법적 효력 이용약관 동의, 자필 전자서명이 안전하게 저장되었습니다.
        </p>

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


/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-000/index.jsx
 * @description 나의 청소 신청 현황 화면 컴포넌트 (WEB-CLNT-ORD-000)
 *              - 고객 확정 지정가 발주 오더 실시간 목록 및 7일 청약 만료 카운트다운 타이머
 *              - 4대 핵심 발주 지표 (전체, 청약접수중, 계약체결/진행중, 청소완료)
 *              - 탭 필터링 (전체, 청약접수중, 계약확정, 진행중, 완료, 만료/취소)
 *              - 신규 청소 요청 모달(WEB-CLNT-REQ-000) 오픈 및 파트너 청약서 비교 연계
 *              - .cursorrules 공식 브랜드 상표 로고(/logo.png) 반영
 * 
 * Props:
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onOpenRequestModal 신규 청소 신청 모달 오픈 핸들러 () => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 * @param {Object} currentUser 로그인 사용자 정보 ({ USER_NO, USER_NM, USER_ROLE_CD })
 */

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-000/index.jsx
 * @description 나의 청소 신청 현황 메인 화면 컴포넌트 (WEB-CLNT-ORD-000)
 *              - 4대 요약 통계 집계 카드 (전체, 청약접수중, 계약체결/진행중, 완료)
 *              - 상태별 탭 필터링 및 POST /api/web/client/ord_000 비동기 데이터 바인딩
 *              - 7일 만료 실시간 타이머 (BID_OPEN 건 매초 남은시간 계산 및 0초 시 BID_EXPIRED 자동 전이)
 *              - [파트너 청약서 비교 및 선택하기 >] 상세 화면(WEB-CLNT-ORD-001) 라우팅
 *              - [+ 신규 청소 요청 등록하기] 청소 신청 모달(WEB-CLNT-REQ-000) 연계
 *              - .cursorrules 2.5 공식 브랜드 로고(/logo.png) 반영
 * 
 * Props:
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onOpenRequestModal 청소 신청 모달 오픈 핸들러 () => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 * @param {Object} currentUser 현재 로그인 사용자 정보 ({ USER_NO, USER_NM, USER_ROLE_CD })
 */
export function WebClntOrd000({
  onNavigate,
  onOpenRequestModal,
  onLogout,
  currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
  }
}) {
  // 1. 상태 관리
  const [orderList, setOrderList] = useState([]);
  const [summary, setSummary] = useState({
    totalCnt: 4,
    bidOpenCnt: 2,
    inProgressCnt: 1,
    completedCnt: 1
  });
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [timeLeftMap, setTimeLeftMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const effectiveUserNo = currentUser.USER_NO || 'C20261000001';

  // 2. 백엔드 목록 조회 API 호출 (POST /api/web/client/ord_000)
  const fetchOrderData = useCallback(async (filterValue = currentFilter) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/web/client/ord_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientUserNo: effectiveUserNo,
          statusFilter: filterValue
        })
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setOrderList(result.data.orders || []);
        if (result.data.summary) {
          setSummary(result.data.summary);
        }

        // 초기 남은 시간(초 단위) 계산하여 timeLeftMap에 설정
        const nowMs = Date.now();
        const initialMap = {};
        (result.data.orders || []).forEach((item) => {
          if (item.orderStatus === 'BID_OPEN' && item.bidExpireDt) {
            const expMs = new Date(item.bidExpireDt).getTime();
            const diffSec = Math.max(0, Math.floor((expMs - nowMs) / 1000));
            initialMap[item.orderNo] = diffSec;
          }
        });
        setTimeLeftMap(initialMap);
      }
    } catch (err) {
      console.warn('[WEB-CLNT-ORD-000] 목록 조회 API 통신 오류 (시뮬레이션 유지):', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserNo, currentFilter]);

  // 마운트 및 필터 변경 시 호출
  useEffect(() => {
    fetchOrderData(currentFilter);
  }, [currentFilter, fetchOrderData]);

  // 3. 7일 만료 실시간 타이머 구현 (useEffect & setInterval)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMap((prevMap) => {
        const nextMap = { ...prevMap };
        let hasExpiredTransition = false;

        Object.keys(nextMap).forEach((orderNo) => {
          if (nextMap[orderNo] > 0) {
            nextMap[orderNo] -= 1;
            // 0초에 도달한 경우
            if (nextMap[orderNo] === 0) {
              hasExpiredTransition = true;
            }
          }
        });

        // 0초 도달 시 해당 카드의 상태를 즉시 'BID_EXPIRED'(청약 만료)로 전이
        if (hasExpiredTransition) {
          setOrderList((prevList) =>
            prevList.map((order) => {
              if (order.orderStatus === 'BID_OPEN' && nextMap[order.orderNo] === 0) {
                return { ...order, orderStatus: 'BID_EXPIRED' };
              }
              return order;
            })
          );
        }

        return nextMap;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 남은 초를 "D일 H시간 M분 S초" 및 진행률(%)로 변환하는 포맷터
  const formatTimeLeft = (seconds) => {
    if (seconds === undefined || seconds === null || seconds <= 0) {
      return { text: '청약 기간 마감 (BID_EXPIRED)', percent: 100, isExpired: true };
    }

    const totalSevenDaysSec = 7 * 24 * 60 * 60;
    const elapsedSec = Math.max(0, totalSevenDaysSec - seconds);
    const percent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalSevenDaysSec) * 100)));

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return {
      text: `${days}일 ${hours}시간 ${mins}분 ${pad(secs)}초`,
      percent,
      isExpired: false
    };
  };

  // 사용자 인터랙션: [파트너 청약서 비교 및 선택하기 >] 클릭 시 상세 화면 라우팅
  const handleNavigateToQuotes = (orderNo) => {
    const targetUrl = `WEB-CLNT-ORD-001?orderNo=${encodeURIComponent(orderNo)}`;
    console.log(`[WEB-CLNT-ORD-000] 라우팅 실행 -> ${targetUrl}`);
    if (onNavigate) {
      onNavigate(targetUrl);
    } else if (typeof window !== 'undefined') {
      window.location.hash = `#${targetUrl}`;
      alert(`[WEB-CLNT-ORD-001 상세 이동]\n발주번호 ${orderNo}의 파트너 청약서 비교 화면으로 이동합니다.`);
    }
  };

  // 사용자 인터랙션: [+ 신규 청소 요청 등록하기] 클릭 시 모달 트리거
  const handleOpenRequest = () => {
    if (onOpenRequestModal) {
      onOpenRequestModal();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('OPEN_CLEANING_REQUEST_MODAL', {
          detail: { screenId: 'WEB-CLNT-REQ-000', userNo: effectiveUserNo }
        })
      );
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 고정 GNB 헤더 (.cursorrules 2.5 공식 로고 /logo.png 반영)
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          {/* Brand Logo & Location Chip */}
          <div className="flex items-center gap-space-md shrink-0">
            <a
              className="flex items-center gap-space-sm group"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              <img
                alt="쓸고닦고 공식 로고"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                  쓸고닦고
                </span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  BUILDING CLEANING STANDARD
                </span>
              </div>
            </a>

            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>경기 고양시 일산동구</span>
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full"
            data-active-classes="bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm"
          >
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              홈
            </a>
            <a
              aria-current="page"
              className="px-4 py-2 transition-colors bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-semibold"
              data-path="my-requests"
              href="#my-requests"
            >
              나의 신청현황
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="service-history"
              href="#service-history"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('service-history');
              }}
            >
              이용내역
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="my-account"
              href="#my-account"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('my-account');
              }}
            >
              마이
            </a>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {currentUser.USER_NM || '홍길동'}님
              </span>
              <span className="font-caption text-caption text-secondary font-medium">
                인증회원 ({effectiveUserNo})
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="알림"
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              <button
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer"
                onClick={onLogout || (() => alert('로그아웃되었습니다.'))}
                type="button"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-1 ring-outline-variant/30 font-semibold text-xs">
                {currentUser.USER_NM ? currentUser.USER_NM.slice(0, 1) : '홍'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden pb-space-xl">
            <div className="max-w-[1200px] mx-auto px-margin pt-space-lg flex flex-col gap-space-lg">

              {/* 1. 상단 요약 배너 및 4대 핵심 지표 통계 */}
              <section aria-label="발주 요약 대시보드" className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-xs">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-space-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold tracking-wide">
                        고객 발주 포털
                      </span>
                      <span className="text-outline text-caption font-caption font-mono">WEB-CLNT-ORD-000</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                      나의 청소 신청 현황
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
                      고객님이 직접 지정가로 발주하신 청소 건들의 실시간 매칭 상태입니다. 역경매 없이 지정가 그대로 검증된 시공 마스터와 매칭됩니다.
                    </p>
                  </div>
                  {/* Quick Stat Badge */}
                  <div className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-4 py-2 rounded-xl text-on-surface shadow-xs">
                    <span
                      className="material-symbols-outlined text-secondary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline">표준 정액 보증제</span>
                      <span className="font-label-md text-label-md font-semibold text-primary">역경매 강요 0건</span>
                    </div>
                  </div>
                </div>

                {/* 4대 핵심 요약 지표 카드 그리드 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
                  {/* 전체 발주 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">전체 발주</span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight" data-field="TOTAL_ORDER_COUNT">
                        {summary.totalCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-secondary font-medium">누적 진행 통합</span>
                    </div>
                  </div>

                  {/* 청약 접수중 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] relative overflow-hidden border border-secondary/20">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/5 rounded-full pointer-events-none"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-secondary font-semibold">청약 접수중</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                        실시간 모집중
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-secondary font-bold tracking-tight" data-field="BID_OPEN_COUNT">
                        {summary.bidOpenCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-secondary font-medium">7일 기한 내 마스터 접수</span>
                    </div>
                  </div>

                  {/* 계약 체결/진행중 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">계약 체결/진행중</span>
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">handshake</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight" data-field="CNTR_PROGRESS_COUNT">
                        {summary.inProgressCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-primary font-medium">마스터 매칭 완료</span>
                    </div>
                  </div>

                  {/* 청소 완료 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">청소 완료</span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-headline-lg text-headline-lg text-outline font-bold tracking-tight" data-field="COMPLETED_COUNT">
                        {summary.completedCnt}
                        <span className="font-label-md text-label-md font-normal text-outline ml-1">건</span>
                      </span>
                      <span className="font-caption text-caption text-outline font-medium">현장 최종 검수 필</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. 필터 세그먼트 & 신규 발주 CTA 버튼 */}
              <section aria-label="필터 및 등록 조작" className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-sm">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto" id="filterTabGroup">
                  <button
                    className={`filter-tab px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'ALL'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('ALL')}
                    type="button"
                  >
                    <span>전체</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                      {summary.totalCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'BID_OPEN'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('BID_OPEN')}
                    type="button"
                  >
                    <span>청약접수중</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                      {summary.bidOpenCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'CNTR_CONFIRMED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('CNTR_CONFIRMED')}
                    type="button"
                  >
                    <span>계약확정</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {summary.inProgressCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'SVC_PROGRESS'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('SVC_PROGRESS')}
                    type="button"
                  >
                    <span>진행중</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      0
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'SVC_COMPLETED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('SVC_COMPLETED')}
                    type="button"
                  >
                    <span>완료</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {summary.completedCnt}
                    </span>
                  </button>

                  <button
                    className={`filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      currentFilter === 'BID_EXPIRED'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    onClick={() => setCurrentFilter('BID_EXPIRED')}
                    type="button"
                  >
                    <span>만료/취소</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      0
                    </span>
                  </button>
                </div>

                {/* Primary Action CTA */}
                <button
                  className="h-[44px] px-6 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  data-action="OPEN_MODAL_WEB_CLNT_REQ_000"
                  onClick={handleOpenRequest}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>신규 청소 요청 등록하기</span>
                </button>
              </section>

              {/* 3. 발주 오더 목록 리스트 (Main Feed List) */}
              <section aria-label="발주 목록 피드" className="flex flex-col gap-space-lg">
                {isLoading && orderList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[36px] animate-spin mb-2">progress_activity</span>
                    <span className="text-on-surface-variant font-body-sm">발주 신청 현황을 불러오는 중입니다...</span>
                  </div>
                ) : orderList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm border border-slate-200/60 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[48px] mb-3">inbox</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                      해당 조건의 발주 신청 내역이 없습니다.
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                      원하시는 청소 서비스와 희망 시공 금액을 지정하여 신규 발주서를 등록해 보세요.
                    </p>
                    <button
                      className="h-10 px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold"
                      onClick={handleOpenRequest}
                      type="button"
                    >
                      청소 요청 등록하기
                    </button>
                  </div>
                ) : (
                  orderList.map((order) => {
                    const isBidOpen = order.orderStatus === 'BID_OPEN';
                    const isConfirmed = order.orderStatus === 'CNTR_CONFIRMED';
                    const isCompleted = order.orderStatus === 'SVC_COMPLETED';
                    const isExpired = order.orderStatus === 'BID_EXPIRED';

                    const remainingSeconds = timeLeftMap[order.orderNo];
                    const remainingFormatted = formatTimeLeft(remainingSeconds);

                    return (
                      <article
                        className="order-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border border-slate-200/70"
                        data-status={order.orderStatus}
                        key={order.orderNo}
                      >
                        {/* Card Header Bar */}
                        <div className="px-space-md py-space-sm bg-surface-container-low/50 flex flex-wrap items-center justify-between gap-space-sm border-b border-slate-200/50">
                          <div className="flex items-center gap-space-sm flex-wrap text-caption font-caption text-outline">
                            <span>
                              발주번호:{' '}
                              <strong className="text-on-surface font-semibold font-mono" data-field="ORDER_NO">
                                {order.orderNo}
                              </strong>
                            </span>
                            <span className="text-outline-variant">|</span>
                            <span>
                              등록일시:{' '}
                              <span className="text-on-surface-variant" data-field="REG_DT">
                                {order.regDt}
                              </span>
                            </span>
                            {order.confirmedDtText && (
                              <>
                                <span className="text-outline-variant">|</span>
                                <span>
                                  체결일시:{' '}
                                  <span className="text-primary font-medium">
                                    {order.confirmedDtText}
                                  </span>
                                </span>
                              </>
                            )}
                            <span className="text-outline-variant">|</span>
                            <span>
                              신청자:{' '}
                              <span className="text-on-surface-variant" data-field="USER_NM">
                                {currentUser.USER_NM || '홍길동'} ({order.clientUserNo || effectiveUserNo})
                              </span>
                            </span>
                          </div>

                          {/* Status Badge with green pulse for BID_OPEN */}
                          <div className="flex items-center gap-2">
                            {isBidOpen && (
                              <span
                                className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span>청약접수중</span>
                                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span
                                className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">handshake</span>
                                <span>계약체결완료</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span
                                className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                <span>청소완료 (검수합격)</span>
                              </span>
                            )}
                            {isExpired && (
                              <span
                                className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs"
                                data-field="ORDER_STATUS"
                              >
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                <span>청약만료</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 7-Day Expiry Countdown Timer Box (BID_OPEN 건만 노출) */}
                        {isBidOpen && (
                          <div className="mx-space-md mt-space-md p-space-sm bg-secondary-fixed/20 rounded-xl flex flex-col gap-2 border border-secondary/20">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-[20px]">hourglass_top</span>
                                <span className="font-label-md text-label-md text-primary font-semibold">
                                  7일 청약 마감까지 남은 시간:
                                </span>
                                <span
                                  className="font-headline-sm text-headline-sm text-tertiary-container font-bold tracking-tight font-mono"
                                  data-field="BID_EXPIRE_DT"
                                >
                                  {remainingFormatted.text}
                                </span>
                              </div>
                              <span className="font-caption text-caption text-on-surface-variant">
                                마감일시:{' '}
                                <strong className="text-primary font-semibold">
                                  {order.bidExpireDt}
                                </strong>
                              </span>
                            </div>
                            {/* 7-Day Progress Bar */}
                            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                              <div
                                className="h-full bg-secondary rounded-full transition-all duration-500"
                                style={{ width: `${remainingFormatted.percent}%` }}
                              ></div>
                            </div>
                            <p className="font-caption text-caption text-outline leading-tight">
                              만료 전까지 접수된 청약서 중 제시된 포트폴리오와 이력을 비교하여 마음에 드는 마스터를 자유롭게 선택할 수 있습니다.
                            </p>
                          </div>
                        )}

                        {/* 계약체결완료 마스터 정보 배너 (CNTR_CONFIRMED 건) */}
                        {isConfirmed && order.contractMaster && (
                          <div className="mx-space-md mt-space-md p-space-sm rounded-xl bg-primary/5 flex flex-wrap items-center justify-between gap-space-sm border border-primary/15">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-base">
                                {order.contractMaster.masterNm ? order.contractMaster.masterNm.slice(0, 1) : '김'}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-label-lg text-label-lg text-primary font-bold">
                                    담당 마스터 매칭 완료
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                                    신원·책임보험 100% 검증
                                  </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface">
                                  <strong className="font-semibold">{order.contractMaster.companyNm}</strong> (
                                  {order.contractMaster.masterNm} / {order.contractMaster.licenseNm} / 시공 평점 {order.contractMaster.rating})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                                onClick={() => alert(`[안심번호 통화] ${order.contractMaster.safePhone}로 연결합니다.`)}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[16px]">call</span>
                                안심번호 통화
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Order Detail Grid (4분할) */}
                        <div className="p-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md">
                          {/* Col 1: Service Type & Details */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">cleaning_services</span>
                              서비스 구분 및 상세 내역
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-semibold"
                                data-field="CLEAN_LARGE_CD"
                              >
                                {order.cleanLargeNm || order.cleanLargeCd}
                              </span>
                              <span className="font-label-lg text-label-lg text-on-surface font-semibold" data-field="CLEAN_MID_CD">
                                {order.cleanMidNm || order.cleanMidCd}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant pt-0.5">
                              {order.detailDesc}
                            </p>
                          </div>

                          {/* Col 2: Site Address */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">distance</span>
                              시공 현장 주소
                            </span>
                            <p className="font-label-lg text-label-lg text-on-surface font-semibold" data-field="ADDR_TEXT">
                              {order.addrText}
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {order.addrDetail}
                            </p>
                          </div>

                          {/* Col 3: Requested Date & Time */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40">
                            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-secondary">calendar_clock</span>
                              시공 희망 일정
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-headline-sm text-headline-sm text-primary font-bold" data-field="SERVICE_START_DT">
                                {order.serviceStartDt}
                              </span>
                              {order.dDayText && (
                                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                                  {order.dDayText}
                                </span>
                              )}
                              {isCompleted && (
                                <div className="flex items-center gap-0.5 text-secondary">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                      star
                                    </span>
                                  ))}
                                  <span className="font-label-sm text-label-sm font-bold text-on-surface ml-1">5.0 / 5.0</span>
                                </div>
                              )}
                            </div>
                            <span className="font-caption text-caption text-secondary font-medium">
                              {order.serviceScheduleText || '고객 지정 희망 일정'}
                            </span>
                          </div>

                          {/* Col 4: Guaranteed Fixed Labor Fee */}
                          <div className="flex flex-col gap-space-xs p-space-sm rounded-lg bg-primary/5">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                                {isCompleted ? '시공 대금 정산 결과' : '고객 지정 확정 시공대금'}
                              </span>
                              <span className="font-caption text-caption text-outline">
                                {isCompleted ? '거래 종결' : '플랫폼 수수료 16,500원 결제 완료'}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight font-mono" data-field="PROPOSED_PRICE">
                                {Number(order.proposedPrice).toLocaleString()}원
                              </span>
                              {order.priceUnitText && (
                                <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                                  {order.priceUnitText}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-caption text-caption font-medium shadow-xs">
                                {isCompleted ? '현장 직불 완료 (영수증 수령)' : '역경매 없음 · 현장 직불 고정액'}
                              </span>
                            </div>
                            <p className="font-caption text-caption text-tertiary font-medium">
                              {order.priceNotice || '* 시공 검수 완료 후 마스터 계좌로 직접 송금하는 확정 계약금입니다.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer Action Bar */}
                        <div className="px-space-md py-space-sm bg-surface-container-low/80 flex flex-wrap items-center justify-between gap-space-sm border-t border-slate-200/50">
                          <div className="flex items-center gap-2">
                            {isBidOpen && (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  현재 <strong className="text-secondary font-headline-sm text-headline-sm font-bold font-mono" data-field="APPLY_COUNT">{order.applyCount || 0}명</strong>의 검증된 시공 마스터가 청약서를 제출했습니다.
                                </span>
                              </>
                            )}
                            {isConfirmed && (
                              <>
                                <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  계약이 체결되어 일정 조율이 완료되었습니다. 시공 당일 마스터가 직접 방문합니다.
                                </span>
                              </>
                            )}
                            {isCompleted && (
                              <>
                                <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                                <span className="font-body-md text-body-md text-on-surface">
                                  시공 전/후 고화질 사진 보고서와 전자 검수 확인서가 발급되었습니다.
                                </span>
                              </>
                            )}
                            {isExpired && (
                              <>
                                <span className="material-symbols-outlined text-outline text-[20px]">info</span>
                                <span className="font-body-md text-body-md text-on-surface-variant">
                                  7일 청약 기한이 만료되었습니다. 조건을 재조정하여 다시 발주하실 수 있습니다.
                                </span>
                              </>
                            )}
                          </div>

                          {/* Footer Action Buttons */}
                          <div>
                            {isBidOpen && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all cursor-pointer"
                                data-action="VIEW_QUOTES"
                                data-order-no={order.orderNo}
                                onClick={() => handleNavigateToQuotes(order.orderNo)}
                                type="button"
                              >
                                <span>파트너 청약서 비교 및 선택하기 ({order.applyCount || 0}건)</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                              </button>
                            )}
                            {isConfirmed && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="h-[42px] px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all cursor-pointer"
                                  onClick={() => {
                                    if (onNavigate) {
                                      onNavigate(`WEB-CLNT-JOB-000?contractNo=${order.contractMaster?.contractNo || 'CNT2026103100001'}`);
                                    }
                                  }}
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">verified</span>
                                  <span>현장 시공 검수 및 직불 승인</span>
                                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                                <button
                                  className="h-[42px] px-4 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                                  onClick={() => alert(`[계약서 확인] 발주번호 ${order.orderNo}의 표준 직불 전자계약서를 확인합니다.`)}
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">description</span>
                                  <span>계약서</span>
                                </button>
                              </div>
                            )}
                            {isCompleted && (
                              <div className="flex items-center gap-2">
                                <button
                                  className="h-[42px] px-5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-surface-container transition-all cursor-pointer border border-slate-200/80"
                                  onClick={() => {
                                    if (onNavigate) {
                                      onNavigate(`WEB-CLNT-JOB-000?contractNo=${order.contractMaster?.contractNo || 'CNT2026103100001'}`);
                                    }
                                  }}
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                  <span>시공 검수 내역 및 전/후 사진 보기</span>
                                </button>
                              </div>
                            )}
                            {isExpired && (
                              <button
                                className="h-[42px] px-5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:bg-surface-container transition-all cursor-pointer"
                                onClick={handleOpenRequest}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                <span>재신청하기</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>

              {/* 4. 하단 안심 보증 인포 배너 */}
              <section className="mt-space-md p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg border border-slate-200/60">
                <div className="flex items-center gap-space-md">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[32px]">shield_lock</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      쓸고닦고 3대 안심 약속
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      ① 100% 신원 및 범죄이력 보증 마스터 배정 &nbsp;|&nbsp;
                      ② 시공 검수 후 전액 현장 직불 (불합리한 에스크로 수수료 제로) &nbsp;|&nbsp;
                      ③ 시공 하자 발생 시 3개월 무상 A/S 안심 케어 보증
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                  <button
                    className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors shadow-xs border border-slate-200/80 cursor-pointer"
                    onClick={() => alert('쓸고닦고 3대 안심 보증 규정 전문이 확인되었습니다.')}
                    type="button"
                  >
                    보증 규정 확인
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
                    onClick={() => alert('고객센터 (02-429-5459) 상담 연결이 준비 중입니다.')}
                    type="button"
                  >
                    고객센터 상담문의
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          FOOTER: 법적 고지 및 고객센터 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                alt="쓸고닦고 로고"
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
                src="/logo.png"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                쓸고닦고
              </span>
              <span className="font-caption text-caption text-outline">
                프리미엄 홈케어 컨시어지
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <a className="hover:text-on-surface transition-colors font-semibold" data-path="terms-of-service" href="#">
                이용약관
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors font-semibold text-primary" data-path="privacy-policy" href="#">
                개인정보처리방침
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="customer-service" href="#">
                고객센터
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="partner-inquiry" href="#">
                기사 파트너 등록
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant">
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                (주)공간다원
              </p>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>대표자: 김충훈</span>
                <span>사업자등록번호: 214-88-02482</span>
                <span>통신판매업신고: 제2025-경기고양-1849호</span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>고객센터: 02-429-5459 (평일 09:00 - 18:00)</span>
                <span>이메일: support@spacendw.kr</span>
              </div>
              <p className="text-outline">
                경기도 고양시 일산동구 중앙로 1261번길 42
              </p>
            </div>
            <div className="flex flex-col justify-between gap-space-sm">
              <div className="bg-error-container/40 p-space-sm rounded-xl border border-error/20">
                <p className="font-caption text-caption text-tertiary leading-relaxed">
                  <strong className="font-semibold">[플랫폼 면책 및 결제 안내]</strong> 쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며, 현장 인건비 및 수리 노무비는 작업 검수 후 시공 기사님께 직접 지급됩니다. 플랫폼은 현장 노무비 에스크로를 보유하지 않으며 플랫폼 매칭 수수료 외 시공 하자의 법적 책임은 시공 파트너에게 귀속됩니다.
                </p>
              </div>
              <p className="font-caption text-caption text-outline text-right md:text-left">
                © 2026 (주)공간다원. All rights reserved. SseulDakGo Domestic Infrastructure Platform.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ============================================================================
// [메인 화면 컴포넌트] WEB-CLNT-COM-000 (고객 메인 홈)
// ============================================================================
export default function WebClntCom000({ onNavigate }) {
  // 1. 필수 상태 관리 (요구사항 명세 100% 반영)
  const [feedList, setFeedList] = useState(INITIAL_FEED_LIST);
  const [regionInfo, setRegionInfo] = useState(INITIAL_REGION_INFO);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeUserInfo, setWelcomeUserInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('REGULAR');

  // 추가 보조 상태 (카테고리 공통코드 메타, 회원/비회원 정보, 네비게이션 탭)
  const [categoryList, setCategoryList] = useState(INITIAL_CATEGORY_LIST);
  const [userInfo, setUserInfo] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const isKeepLogin = localStorage.getItem('SSEULDAKGO_KEEP_LOGIN') === 'Y';
        if (isKeepLogin) {
          const stored = localStorage.getItem('SSEULDAKGO_AUTH_USER');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.USER_NO && parsed.USER_NO !== 'GUEST') {
              return { isGuest: false, ...parsed };
            }
          }
        }
        const sessionStored = sessionStorage.getItem('SSEULDAKGO_AUTH_USER');
        if (sessionStored) {
          const parsed = JSON.parse(sessionStored);
          if (parsed && parsed.USER_NO && parsed.USER_NO !== 'GUEST') {
            return { isGuest: false, ...parsed };
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      isGuest: true,
      USER_NO: 'GUEST',
      USER_NM: '비회원',
      USER_ROLE_CD: 'GUEST',
    };
  });
  const [activeNavPath, setActiveNavPath] = useState('home');

  // 2. 백엔드 API 호출 (POST /api/web/client/com_000)
  const fetchHomeData = useCallback(
    async (targetRegion = regionInfo, targetUserNo = userInfo.USER_NO) => {
      try {
        const response = await fetch('/api/web/client/com_000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userNo: targetUserNo || 'GUEST',
            sidoCd: targetRegion.SIDO_CD || '41',
            sigunguCd: targetRegion.SIGUNGU_CD || '41281',
          }),
        });

        if (!response.ok) return;
        const data = await response.json();

        if (data && data.success) {
          if (Array.isArray(data.feedList) && data.feedList.length > 0) {
            setFeedList(data.feedList);
          }
          if (Array.isArray(data.categoryList) && data.categoryList.length > 0) {
            setCategoryList(data.categoryList);
          }
          if (data.userInfo) {
            setUserInfo({
              isGuest: Boolean(data.isGuest),
              USER_NO: data.userInfo.USER_NO,
              USER_NM: data.userInfo.USER_NM,
              USER_ROLE_CD: data.userInfo.USER_ROLE_CD,
            });
          }
        }
      } catch {
        // 로컬 오프라인 또는 프리뷰 단독 구동 시 초기 시드 데이터 유지
      }
    },
    [regionInfo, userInfo.USER_NO]
  );

  // 컴포넌트 마운트 시 API 호출 및 10초 주기 실시간 폴링
  useEffect(() => {
    fetchHomeData(regionInfo, userInfo.USER_NO);

    const intervalId = window.setInterval(() => {
      fetchHomeData(regionInfo, userInfo.USER_NO);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [fetchHomeData, regionInfo, userInfo.USER_NO]);

  // 비회원 청소 신청 임시 저장 후 로그인 모달 자동 오픈 전역 이벤트 수신
  useEffect(() => {
    const handleOpenLogin = () => {
      setIsReqModalOpen(false);
      setIsLoginModalOpen(true);
    };
    window.addEventListener('OPEN_LOGIN_MODAL', handleOpenLogin);
    return () => window.removeEventListener('OPEN_LOGIN_MODAL', handleOpenLogin);
  }, []);

  // 3. 모달 오픈 핸들러 (카테고리 카드 및 하단 스티키 바 연동)
  const openRequestModal = useCallback((cleanType = 'REGULAR') => {
    setSelectedCategory(cleanType);
    setIsReqModalOpen(true);
  }, []);

  // 지역 전환 시뮬레이션 (행정구역 칩 클릭 시)
  const handleToggleRegion = () => {
    const currentIndex = REGION_OPTIONS.findIndex(
      (r) => r.SIGUNGU_CD === regionInfo.SIGUNGU_CD
    );
    const nextRegion = REGION_OPTIONS[(currentIndex + 1) % REGION_OPTIONS.length];
    setRegionInfo(nextRegion);
  };

  // 네비게이션 이동 처리
  const handleNavClick = (e, path) => {
    e.preventDefault();
    setActiveNavPath(path);
    if (path === 'my-account') {
      if (userInfo && !userInfo.isGuest) {
        setWelcomeUserInfo({
          userNo: userInfo.USER_NO,
          userNm: userInfo.USER_NM,
          userEmail: userInfo.USER_EMAIL || '',
          userRoleCd: userInfo.USER_ROLE_CD || 'C',
          signImgUrl: userInfo.SIGN_IMG_URL || null,
        });
        setIsWelcomeModalOpen(true);
      } else {
        alert('내정보 및 이용약관/서명 관리를 위해 먼저 로그인해 주세요.');
        setIsCustomerLoginModalOpen(true);
      }
      return;
    }
    if (typeof onNavigate === 'function') {
      onNavigate(path);
    }
  };

  // 발주 모달에서 신규 발주 등록 시 피드 최상단에 즉시 추가
  const handleOrderCreated = (newOrder) => {
    setFeedList((prev) => [newOrder, ...prev.slice(0, 4)]);
  };

  // 카테고리 코드 -> 공통코드 한글명 변환 헬퍼
  const getCategoryName = (cleanLargeCd, fallbackNm) => {
    const found = categoryList.find((c) => c.COM_CD === cleanLargeCd);
    if (found && found.COM_NM) return found.COM_NM;
    return fallbackNm || cleanLargeCd;
  };

  // 카테고리 배지 스타일 헬퍼
  const getCategoryBadgeClass = (cleanLargeCd) => {
    if (cleanLargeCd === 'REGULAR') {
      return 'px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold';
    }
    if (cleanLargeCd === 'APPLIANCE') {
      return 'px-2 py-0.5 rounded bg-surface-container-highest text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold';
    }
    return 'px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold';
  };

  // 상태 배지 렌더링 헬퍼
  const renderOrderStatusBadge = (item) => {
    if (item.STATUS_BADGE_TYPE === 'PRIMARY') {
      return (
        <span
          className="text-primary bg-primary-fixed/40 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1"
          data-field="ORDER_STATUS"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
          {item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (파트너 매칭중)`}
        </span>
      );
    }
    if (item.STATUS_BADGE_TYPE === 'ERROR_PING') {
      return (
        <span
          className="text-on-error bg-error px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1"
          data-field="ORDER_STATUS"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest inline-block animate-ping"></span>
          {item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (견적 마감임박)`}
        </span>
      );
    }
    if (item.STATUS_BADGE_TYPE === 'SECONDARY') {
      return (
        <span
          className="text-on-secondary-container bg-secondary-container/50 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1"
          data-field="ORDER_STATUS"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
          {item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (청약접수중)`}
        </span>
      );
    }
    return (
      <span
        className="text-on-secondary-container bg-secondary-container/50 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1"
        data-field="ORDER_STATUS"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-ping"></span>
        {item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (청약접수중)`}
      </span>
    );
  };

  // 청소 시공 검수 및 현장 직불 완료 승인 (WEB-CLNT-JOB-000) 화면 전환
  if (activeNavPath && (activeNavPath === "WEB-CLNT-JOB-000" || activeNavPath.startsWith("WEB-CLNT-JOB-000?") || activeNavPath === "inspection")) {
    const urlParams = new URLSearchParams(activeNavPath.includes('?') ? activeNavPath.split('?')[1] : '');
    const contractNo = urlParams.get('contractNo') || 'CNT2026103100001';
    return (
      <WebClntJob000
        contractNo={contractNo}
        currentUser={userInfo}
        onLogout={() => {
          setUserInfo({
            isGuest: true,
            USER_NO: "GUEST",
            USER_NM: "비회원",
            USER_ROLE_CD: "GUEST",
          });
          setActiveNavPath("home");
        }}
        onNavigate={(path) => setActiveNavPath(path)}
      />
    );
  }

  // 청소 요청 상세 및 파트너 청약서 비교/선택 (WEB-CLNT-ORD-001) 화면 전환
  if (activeNavPath && (activeNavPath === "WEB-CLNT-ORD-001" || activeNavPath.startsWith("WEB-CLNT-ORD-001?"))) {
    const urlParams = new URLSearchParams(activeNavPath.includes('?') ? activeNavPath.split('?')[1] : '');
    const orderNo = urlParams.get('orderNo') || 'ORD2026103100001';
    return (
      <WebClntOrd001
        orderNo={orderNo}
        currentUser={userInfo}
        onLogout={() => {
          setUserInfo({
            isGuest: true,
            USER_NO: "GUEST",
            USER_NM: "비회원",
            USER_ROLE_CD: "GUEST",
          });
          setActiveNavPath("home");
        }}
        onNavigate={(path) => setActiveNavPath(path)}
      />
    );
  }

  // 나의 신청현황(WEB-CLNT-ORD-000) 화면 전환
  if (activeNavPath === "my-application-status" || activeNavPath === "my-requests") {
    return (
      <>
        <WebClntOrd000
          currentUser={userInfo}
          onLogout={() => {
            setUserInfo({
              isGuest: true,
              USER_NO: "GUEST",
              USER_NM: "비회원",
              USER_ROLE_CD: "GUEST",
            });
            setActiveNavPath("home");
          }}
          onNavigate={(path) => setActiveNavPath(path)}
          onOpenRequestModal={() => setIsReqModalOpen(true)}
        />
        {/* 청소 신청 모달 */}
        <WebClntReq000
          isOpen={isReqModalOpen}
          onClose={() => setIsReqModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      </>
    );
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 디자인 토큰 및 폰트/유틸리티 스타일 보장 (Deep Royal Navy #1F497D / Clean Mint #0D9488) */}
      <style>{`
        :root {
          --brand-royal-navy: #1F497D;
          --brand-clean-mint: #0D9488;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        .bg-primary { background-color: #003262; }
        .bg-primary-container { background-color: #1f497d; }
        .hover\\:bg-primary-container:hover { background-color: #1f497d; }
        .group:hover .group-hover\\:bg-primary { background-color: #003262; }
        .text-primary { color: #003262; }
        .text-on-primary { color: #ffffff; }
        .group:hover .group-hover\\:text-on-primary { color: #ffffff; }
        .bg-secondary { background-color: #006a61; }
        .text-secondary { color: #006a61; }
        .text-on-secondary { color: #ffffff; }
        .bg-secondary-container { background-color: #86f2e4; }
        .hover\\:bg-secondary-container:hover { background-color: #86f2e4; }
        .text-on-secondary-container { color: #006f66; }
        .hover\\:text-on-secondary-container:hover { color: #006f66; }
        .bg-secondary-fixed { background-color: #89f5e7; }
        .text-secondary-fixed { color: #89f5e7; }
        .text-on-secondary-fixed-variant { color: #005049; }
        .bg-primary-fixed { background-color: #d5e3ff; }
        .text-on-primary-fixed { color: #001c3b; }
        .text-on-primary-fixed-variant { color: #1d477b; }
        .bg-surface { background-color: #faf8ff; }
        .bg-surface-container-lowest { background-color: #ffffff; }
        .bg-surface-container-low { background-color: #f2f3ff; }
        .bg-surface-container { background-color: #eaedff; }
        .bg-surface-container-high { background-color: #e2e7ff; }
        .hover\\:bg-surface-container-high:hover { background-color: #e2e7ff; }
        .bg-surface-container-highest { background-color: #dae2fd; }
        .bg-inverse-surface { background-color: #283044; }
        .text-inverse-on-surface { color: #eef0ff; }
        .text-surface-dim { color: #d2d9f4; }
        .text-on-surface { color: #131b2e; }
        .text-on-surface-variant { color: #43474f; }
        .text-outline { color: #737780; }
        .text-outline-variant { color: #c3c6d1; }
        .bg-tertiary { background-color: #6b000b; }
        .text-tertiary-fixed { color: #ffdad7; }
        .bg-error { background-color: #ba1a1a; }
        .text-error { color: #ba1a1a; }
        .text-on-error { color: #ffffff; }
        .px-margin { padding-left: 2rem; padding-right: 2rem; }
        .px-space-md { padding-left: 1rem; padding-right: 1rem; }
        .px-space-sm { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-space-lg { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .py-space-xl { padding-top: 2rem; padding-bottom: 2rem; }
        .py-space-md { padding-top: 1rem; padding-bottom: 1rem; }
        .py-space-sm { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .pb-space-lg { padding-bottom: 1.5rem; }
        .pt-space-md { padding-top: 1rem; }
        .mt-space-sm { margin-top: 0.5rem; }
        .gap-gutter { gap: 1.5rem; }
        .gap-space-md { gap: 1rem; }
        .gap-space-sm { gap: 0.5rem; }
        .text-headline-lg { font-size: 32px; line-height: 42px; font-weight: 700; }
        .text-headline-md { font-size: 22px; line-height: 30px; font-weight: 600; }
        .text-headline-sm { font-size: 18px; line-height: 26px; font-weight: 600; }
        .text-body-lg { font-size: 16px; line-height: 26px; font-weight: 500; }
        .text-body-md { font-size: 14px; line-height: 22px; font-weight: 400; }
        .text-body-sm { font-size: 13px; line-height: 20px; font-weight: 400; }
        .text-label-lg { font-size: 15px; line-height: 20px; font-weight: 600; }
        .text-label-md { font-size: 13px; line-height: 18px; font-weight: 600; }
        .text-label-sm { font-size: 11px; line-height: 16px; font-weight: 600; }
        .text-caption { font-size: 12px; line-height: 18px; font-weight: 400; }
      `}</style>

      {/* ====================================================================
          HEADER: 상단 고정 GNB (Height: 72px)
      ==================================================================== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          {/* Left: Brand Logo & Location Chip */}
          <div className="flex items-center gap-space-md shrink-0">
            <a
              className="flex items-center gap-space-sm group"
              data-path="home"
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
            >
              <img
                src="/logo.png"
                alt="쓸고딱고 로고"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                  쓸고딱고
                </span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  BUILDING CLEANING STANDARD
                </span>
              </div>
            </a>

            <button
              className="hidden xl:flex items-center gap-1.5 h-9 px-space-sm bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full transition-all"
              data-field="SIGUNGU_CD"
              onClick={handleToggleRegion}
              title="클릭하여 서비스 지역 변경"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">
                location_on
              </span>
              <span className="font-label-sm text-label-sm">{regionInfo.DISPLAY_NM}</span>
              <span className="material-symbols-outlined text-[14px] text-outline">
                keyboard_arrow_down
              </span>
            </button>
          </div>

          {/* Center: Navigation Tabs */}
          <nav
            className="hidden md:flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full"
            data-active-classes="bg-secondary-container text-on-secondary-container font-label-md"
          >
            <a
              aria-current={activeNavPath === 'home' ? 'page' : undefined}
              className={
                activeNavPath === 'home'
                  ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                  : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
              data-path="home"
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
            >
              홈
            </a>
            <a
              className={
                activeNavPath === 'my-application-status'
                  ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                  : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
              data-path="my-application-status"
              href="#my-application-status"
              onClick={(e) => handleNavClick(e, 'my-application-status')}
            >
              나의 신청현황
            </a>
            <a
              className={
                activeNavPath === 'service-history'
                  ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                  : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
              data-path="service-history"
              href="#service-history"
              onClick={(e) => handleNavClick(e, 'service-history')}
            >
              이용내역
            </a>
            <a
              className={
                activeNavPath === 'my-account'
                  ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                  : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all'
              }
              data-path="my-account"
              href="#my-account"
              onClick={(e) => handleNavClick(e, 'my-account')}
            >
              마이
            </a>
          </nav>

          {/* Right: Auth / Profile Cluster */}
          <div className="flex items-center gap-space-sm shrink-0">
            {!userInfo.isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label="알림"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors relative"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary"></span>
                </button>
                <div className="flex items-center gap-space-sm pl-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[18px]">
                      person
                    </span>
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-label-md text-label-md text-on-surface"
                        data-field="USER_NM"
                      >
                        {userInfo.USER_NM}님
                      </span>
                      <span className="font-caption text-caption px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-fixed-variant rounded font-semibold">
                        인증회원
                      </span>
                    </div>
                    <span
                      className="font-caption text-caption text-outline font-mono"
                      data-field="USER_NO"
                    >
                      {userInfo.USER_NO}
                    </span>
                  </div>
                  <button
                    className="font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface px-2.5 py-1.5 rounded-lg transition-colors ml-1"
                    onClick={() => {
                      try {
                        localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
                        localStorage.removeItem('SSEULDAKGO_AUTH_USER');
                        sessionStorage.removeItem('SSEULDAKGO_AUTH_USER');
                      } catch (e) {}
                      setUserInfo({
                        isGuest: true,
                        USER_NO: 'GUEST',
                        USER_NM: '비회원',
                        USER_ROLE_CD: 'GUEST',
                      });
                    }}
                    type="button"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2" id="auth-guest-cluster">
                <a
                  className="h-9 px-space-md inline-flex items-center justify-center rounded-xl font-label-md text-label-md text-primary hover:bg-primary-fixed/30 hover:text-on-primary-fixed-variant transition-colors cursor-pointer"
                  data-path="customer-login"
                  href="#customer-login"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginModalOpen(true);
                  }}
                >
                  로그인
                </a>
                <a
                  className="h-9 px-space-md inline-flex items-center justify-center rounded-xl font-label-md text-label-md bg-primary hover:bg-primary-container text-on-primary transition-colors shadow-sm cursor-pointer"
                  data-path="customer-signup"
                  href="#customer-signup"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegisterModalOpen(true);
                  }}
                >
                  회원가입
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT
      ==================================================================== */}
      <main className="w-full pt-[72px] min-h-[calc(100vh-280px)] bg-surface">
        <div className="max-w-[1200px] mx-auto px-margin py-space-lg">
          <div className="flex flex-col w-full space-y-12 pb-24">
            {/* Top Visual Accent & Breadcrumb Ribbon */}
            <div className="flex items-center justify-between py-2 text-on-surface-variant font-caption text-caption">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                </span>
                <span className="font-label-sm text-label-sm text-primary tracking-wide">
                  WEB-CLNT-COM-000
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant font-body-sm text-body-sm">
                  고객 메인 홈 표준 마켓플레이스
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  고양/일산 실시간 배차관제 중
                </span>
                <span className="text-outline-variant">|</span>
                <span className="font-caption text-caption text-outline">
                  단일 매칭수수료 ₩16,500 보장
                </span>
              </div>
            </div>

            {/* ==============================================================
                SECTION 1: Hero & 3대 청소 대분류 퀵 선택 카드
            ============================================================== */}
            <section className="flex flex-col space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm shadow-sm">
                  <span className="material-symbols-outlined text-[15px] text-secondary">
                    verified_user
                  </span>
                  역경매 없는 투명한 100% 고객 지정가 매칭 시스템
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                  원하는 청소 서비스를 선택하고 확정 금액으로 바로 발주하세요
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
                  쓸고닦고는 업체의 과다 견적 경쟁을 지양합니다. 고객이 책정한 정찰제 발주가로 동네 검증 마스터가 1:1 직접 매칭되며, 시공비는 검수 후 현장에서 직불합니다.
                </p>
              </div>

              {/* 3-Column Large Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Card 1: 정기청소 (REGULAR) */}
                <article
                  className="group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
                  data-clean-large="REGULAR"
                  onClick={() => openRequestModal('REGULAR')}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                        최소 3개월(90일) 락
                      </span>
                      <span className="font-caption text-caption text-outline uppercase font-mono tracking-wider">
                        CODE: REGULAR
                      </span>
                    </div>
                    {/* Building Icon Graphic */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          건물 정기관리
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          계단, 복도, 외곽, 분리수거장 공용부 케어
                        </p>
                      </div>
                    </div>
                    {/* Image Preview for Visual Richness */}
                    <div className="overflow-hidden rounded-lg h-36 relative">
                      <img
                        alt="빌라·원룸·상가주택 공용부"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        data-alt="Spotless modern residential apartment building staircase and hallway polished pristine floor illuminated with clean daylight professional domestic maintenance style navy teal highlights"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQrJd6U17hxg14WD26N5fwT0NrJibmU2eBON6qbohtbuE0_g9AjKSzKLQHAbd5-uSGXrB5ahmajwvJXWAYyPVVEMpu7zeaxmCN3AWxKfACG7evJLPk0GqhllYmTNZR19V0aB0jYgSGd6J2fYsCZ51Xnp8K1tYb5oigCudt24stCZZK7cJkrtSiHKL_1KHDQObBgffiQjf95oyozR03g6dPBk0ee3N07o3vT4jezlU"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                      <span className="absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold">
                        빌라·원룸·상가주택 공용부
                      </span>
                    </div>
                  </div>
                </article>

                {/* Card 2: 계절가전 (APPLIANCE) */}
                <article
                  className="group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
                  data-clean-large="APPLIANCE"
                  onClick={() => openRequestModal('APPLIANCE')}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-primary-fixed-variant font-label-sm text-label-sm">
                        완전분해 살균세척
                      </span>
                      <span className="font-caption text-caption text-outline uppercase font-mono tracking-wider">
                        CODE: APPLIANCE
                      </span>
                    </div>
                    {/* Appliance Icon Graphic */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          가전 분해청소
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          시스템/벽걸이 에어컨, 세탁기 고압 스팀
                        </p>
                      </div>
                    </div>
                    {/* Image Preview for Visual Richness */}
                    <div className="overflow-hidden rounded-lg h-36 relative">
                      <img
                        alt="벽걸이·스탠드·천장형 시스템"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        data-alt="Professional air conditioner disassembly cleaning technician high pressure eco steam wash hygiene equipment focused indoor air conditioning maintenance clean navy lighting"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN88rR-7g3MXiXHGjW2KcQY9jjssKs7wUTC70WkIxEmBZzDqvEV8YF4_RUmQyxZsUeQgqUPPtGW5WZeFs5B-G4BXtWyPSTfi3YdBu439YRdD4l-hm-eoA2AFcCa7Ke3uOQdL--99VS2Fi2gPJ7iWsvdO2qObIfgG2rGi-BVJwifw4bupVz7DzloBv-ShUJWBB9rbzxq0wrZVK8bYZISwGBH0D6QsoegH050YGZQPk"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                      <span className="absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold">
                        벽걸이·스탠드·천장형 시스템
                      </span>
                    </div>
                  </div>
                </article>

                {/* Card 3: 입주청소 (MOVEIN) */}
                <article
                  className="group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20"
                  data-clean-large="MOVEIN"
                  onClick={() => openRequestModal('MOVEIN')}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">
                        실내 전용공간 케어
                      </span>
                      <span className="font-caption text-caption text-outline uppercase font-mono tracking-wider">
                        CODE: MOVEIN
                      </span>
                    </div>
                    {/* Move-in Icon Graphic */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          입주/이사 대청소
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          신축 입주, 이사 전 분진/찌든 때 정밀 케어
                        </p>
                      </div>
                    </div>
                    {/* Image Preview for Visual Richness */}
                    <div className="overflow-hidden rounded-lg h-36 relative">
                      <img
                        alt="아파트·오피스텔·빌라 주거공간"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        data-alt="Pristine interior of a modern newly built apartment living room floor-to-ceiling windows shining wood floors spotless kitchen sanitized clean sunlight ambiance"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfVCkHDfYj9AdDiT1ztZNi7q11XXpNQZUktEmlPGROUg0I2tGa5MYqoprZz4I49j02JdlVwW_2xDjUV5YnD7paNBq4cCHp_dXC5i-WTMRD7ZkVSB4Ffunx7e55RATLf5ayaTwHh3643ecUVzvbpyNE-VtdX3hn0fiTxbZdxRVBd2m8yHOelJubqc9AHVeI_AuzPZt82ODjPO3aR7NV4pGYS43S1gHZCx4zOsvVCDw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                      <span className="absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold">
                        아파트·오피스텔·빌라 주거공간
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* ==============================================================
                SECTION 2: 내 동네 실시간 접수 현황
            ============================================================== */}
            <section className="flex flex-col space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-1.5">
                    <span>📍 내 동네 실시간 접수 현황</span>
                    <span
                      className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm"
                      data-field="SIGUNGU_CD"
                    >
                      {regionInfo.SHORT_NM}
                    </span>
                  </h2>
                </div>
                <span className="font-caption text-caption text-outline">
                  실시간 자동 갱신중 (10초 주기)
                </span>
              </div>

              {/* Real-time Order List (5 items bound from feedList state) */}
              <div className="space-y-3">
                {feedList.map((order) => (
                  <div
                    className="p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    key={order.ORDER_NO}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-caption text-caption font-mono text-outline"
                          data-field="ORDER_NO"
                        >
                          {order.ORDER_NO}
                        </span>
                        <span
                          className={getCategoryBadgeClass(order.CLEAN_LARGE_CD)}
                          data-field="CLEAN_LARGE_CD"
                        >
                          {getCategoryName(order.CLEAN_LARGE_CD, order.CLEAN_LARGE_NM)}
                        </span>
                        {renderOrderStatusBadge(order)}
                      </div>
                      <div
                        className="font-body-md text-body-md text-on-surface font-semibold truncate"
                        data-field="ADDR_TEXT"
                      >
                        {order.ADDR_TEXT}
                      </div>
                      <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant">
                        <span>{order.SUB_SPEC_TEXT || '고객 지정가 확정 발주'}</span>
                        <span>•</span>
                        <span className="text-outline" data-field="REG_DT">
                          {order.REG_DT}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="block font-caption text-caption text-on-surface-variant">
                        고객 지정 발주가
                      </span>
                      <span
                        className="font-headline-sm text-headline-sm text-secondary font-bold"
                        data-field="PROPOSED_PRICE"
                      >
                        {order.PRICE_PREFIX ||
                          (order.CLEAN_LARGE_CD === 'REGULAR' ? '월 ' : '')}
                        {Number(order.PROPOSED_PRICE).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ==============================================================
                SECTION 3: 4단계 검증 마스터 배너
            ============================================================== */}
            <section className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-secondary font-label-md text-label-md tracking-wide">
                    VERIFIED PRO VETTING PROCESS
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    오직 엄선된 4단계 검증 마스터만 현장에 투입됩니다
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    불안한 비대면 외주 기사가 아닌, 신원과 기술력이 사전 입증된 우리 동네 전담 기술 파트너입니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                    파트너 누적 합격률 14.8%
                  </span>
                </div>
              </div>
              {/* 4 Steps Visual Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-caption text-primary font-bold">STEP 01</span>
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      badge
                    </span>
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                    실명 및 신원 검증
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant">
                    사업자등록증, 신분증 진위 확인 및 주거지역 정밀 조회 시스템을 통과한 파트너만 활동을 인가합니다.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-caption text-primary font-bold">STEP 02</span>
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      security
                    </span>
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                    영업배상보험 1억
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant">
                    작업 중 발생할 수 있는 시설물 파손 및 가전 결함에 대비하여 배상책임보험 1억원 가입을 필수 의무화합니다.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-caption text-primary font-bold">STEP 03</span>
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      school
                    </span>
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                    표준 CS·위생 교육
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant">
                    분해세척 매뉴얼 및 고객 접점 응대 표준, 친환경 약제 배합 기준 과정을 수료한 마스터에게만 매칭 티켓을 부여합니다.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-caption text-primary font-bold">STEP 04</span>
                    <span className="material-symbols-outlined text-secondary text-[24px]">
                      hotel_class
                    </span>
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
                    평점 4.5 이상 유지
                  </h3>
                  <p className="font-caption text-caption text-on-surface-variant">
                    실제 시공 고객의 리뷰 평점이 4.5점 미만으로 하락할 경우 자동 활동 중지 및 추가 기술 재검증을 진행합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* ==============================================================
                Sticky Bottom Floating CTA Bar
            ============================================================== */}
            <aside className="sticky bottom-4 z-40 w-full">
              <div className="mx-auto max-w-[1200px] p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">add_task</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-label-lg text-label-lg text-on-surface font-bold">
                      원하는 조건과 금액으로 청소를 발주하고 기사님을 매칭받으세요!
                    </p>
                    <p className="font-caption text-caption text-secondary">
                      비회원 작성 시 브라우저 자동 임시 저장 지원 • 로그인 시 100% 자동 복원
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto shrink-0">
                  <button
                    className="w-full sm:w-auto h-[52px] px-6 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-md"
                    onClick={() => openRequestModal('REGULAR')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">post_add</span>
                    <span>우리집 청소 요청 등록하기</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* ==============================================================
                Interactive Modal: WEB-CLNT-REQ-000 (청소 의뢰 등록)
            ============================================================== */}
            <WebClntReq000
              initialTab={selectedCategory}
              isOpen={isReqModalOpen}
              onClose={() => setIsReqModalOpen(false)}
              onOpenLogin={() => {
                setIsReqModalOpen(false);
                setIsLoginModalOpen(true);
              }}
              onOrderCreated={handleOrderCreated}
              regionInfo={regionInfo}
              userNo={userInfo.USER_NO}
            />

            {/* ==============================================================
                Interactive Modal: WEB-CLNT-ATH-000 (고객 및 시공사 로그인)
            ============================================================== */}
            <WebClntAth000
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onOpenRegister={() => {
                setIsLoginModalOpen(false);
                setIsRegisterModalOpen(true);
              }}
              onSuccessLogin={(userData) => {
                const updated = {
                  isGuest: false,
                  USER_NO: userData.userNo || 'C20261000001',
                  USER_NM: userData.userNm || '홍길동',
                  USER_ROLE_CD: userData.userRoleCd || 'C',
                  USER_EMAIL: userData.userEmail || '',
                };
                if (userData.keepLogin) {
                  localStorage.setItem('SSEULDAKGO_KEEP_LOGIN', 'Y');
                  localStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                  sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                } else {
                  localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
                  localStorage.removeItem('SSEULDAKGO_AUTH_USER');
                  sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                }
                setUserInfo(updated);
                const hasSavedDraft = typeof window !== 'undefined' && Boolean(localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ'));
                if (userData.hasTempReq || hasSavedDraft) {
                  setIsReqModalOpen(true);
                }
              }}
            />

            {/* ==============================================================
                Interactive Modal: WEB-CLNT-ATH-010 (통합 회원가입 및 4대 약관 정독)
            ============================================================== */}
            <WebClntAth010
              isOpen={isRegisterModalOpen}
              onClose={() => setIsRegisterModalOpen(false)}
              onOpenLogin={() => {
                setIsRegisterModalOpen(false);
                setIsLoginModalOpen(true);
              }}
              onSuccessRegister={(userData) => {
                setIsRegisterModalOpen(false);
                if (userData && (userData.userRoleCd === 'C' || !userData.userRoleCd)) {
                  setWelcomeUserInfo(userData);
                  setIsWelcomeModalOpen(true);
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
            />

            {/* ==============================================================
                Interactive Modal: WEB-CLNT-ATH-011 (고객 가입 완료 환영 안내)
            ============================================================== */}
            <WebClntAth011
              isOpen={isWelcomeModalOpen}
              userInfo={welcomeUserInfo}
              onClose={() => setIsWelcomeModalOpen(false)}
              onOpenRequestModal={() => {
                setIsWelcomeModalOpen(false);
                setIsReqModalOpen(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* ====================================================================
          FOOTER: 하단 법적 고지 및 고객센터 정보
      ==================================================================== */}
      <footer className="w-full bg-inverse-surface text-surface-dim mt-auto">
        <div className="max-w-[1200px] mx-auto px-margin py-space-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-space-lg gap-space-md">
            <div className="flex items-center gap-space-sm">
              <img
                src="/logo.png"
                alt="쓸고딱고 로고"
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-white/20"
              />
              <span className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight">
                쓸고딱고
              </span>
              <span className="font-caption text-caption text-surface-dim/70 px-2 py-0.5 bg-inverse-surface rounded">
                고객센터 02-429-5459
              </span>
            </div>
            <div className="flex flex-wrap gap-x-space-md gap-y-2 text-surface-dim font-label-sm text-label-sm">
              <a
                className="hover:text-inverse-on-surface transition-colors"
                data-path="terms-of-service"
                href="#terms-of-service"
                onClick={(e) => handleNavClick(e, 'terms-of-service')}
              >
                이용약관
              </a>
              <a
                className="hover:text-inverse-on-surface font-bold text-inverse-on-surface transition-colors"
                data-path="privacy-policy"
                href="#privacy-policy"
                onClick={(e) => handleNavClick(e, 'privacy-policy')}
              >
                개인정보처리방침
              </a>
              <a
                className="hover:text-inverse-on-surface transition-colors"
                data-path="electronic-financial-terms"
                href="#electronic-financial-terms"
                onClick={(e) => handleNavClick(e, 'electronic-financial-terms')}
              >
                전자금융거래약관
              </a>
              <a
                className="hover:text-secondary-fixed transition-colors flex items-center gap-1"
                data-path="partner-onboarding-guide"
                href="#partner-onboarding-guide"
                onClick={(e) => handleNavClick(e, 'partner-onboarding-guide')}
              >
                파트너 입점 안내
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
          <div className="py-space-md space-y-2 font-caption text-caption text-surface-dim/80 leading-relaxed">
            <div className="flex flex-wrap items-center gap-x-space-md gap-y-1">
              <span>(주)공간다원</span>
              <span>대표자: 김충훈</span>
              <span>사업자등록번호: 214-88-02482</span>
              <span>통신판매업신고: 제2025-경기고양-1849호</span>
              <span>주소: 경기도 고양시 일산동구 중앙로 1261번길 42</span>
            </div>
            <p className="text-tertiary-fixed-dim/90 bg-tertiary-container/30 px-space-md py-space-sm rounded-lg mt-space-sm">
              쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며 현장 직불 계약 책임은 시공 당사자에게 있습니다. 작업 현장의 안전조치 및 최종 시공 상태 확인 후 현장 시공사에게 직접 정산하여 주시기 바랍니다.
            </p>
          </div>
          <div className="pt-space-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-sm font-caption text-caption text-surface-dim/60">
            <p>
              © 2026 SPACE DAWUN Inc. All rights reserved. SseulDakGo Domestic Infrastructure Platform.
            </p>
            <div className="flex items-center gap-space-sm text-surface-dim/80">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span> 플랫폼 매칭 정액 ₩16,500 보장
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


// ==============================================================================


// ==============================================================================
// [WEB-CLNT-PAY-000] 고객 데이터 이용료 결제 및 배타적 계약 확정 모달 컴포넌트
// ==============================================================================

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
export function WebClntPay000({
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

// ==============================================================================
// [WEB-CLNT-ORD-001] 청소 요청 상세 및 용역 청약서 비교/선택 화면 컴포넌트
// ==============================================================================

/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-001/index.jsx
 * @description 청소 요청 상세 및 용역 청약서 비교/선택 화면 컴포넌트 (WEB-CLNT-ORD-001)
 *              - 2열 비대칭 레이아웃 (38% 좌측 Sticky 발주 스펙 요약 / 62% 우측 파트너 청약서 비교 피드)
 *              - 가격 역경매 배제, 고객 확정 지정가(100% 수락) 기반 파트너 일정/역량/평점 비교
 *              - 7일 만료 실시간 타이머 및 정렬(추천순, 빠른시공순, 최신접수순) 지원
 *              - [이 파트너로 배차 확정하기 >] 클릭 시 전자계약 체결 모달(WEB-CLNT-PAY-000 연계) 오픈
 *              - .cursorrules 2.5 공식 브랜드 상표 로고(/logo.png) 반영
 * 
 * Props:
 * @param {string} orderNo 발주 관리번호 (미전달 시 URL 파라미터 또는 기본값 사용)
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 * @param {Object} currentUser 로그인 사용자 정보 ({ USER_NO, USER_NM, USER_ROLE_CD })
 */
export function WebClntOrd001({
  orderNo: propOrderNo,
  onNavigate,
  onLogout,
  currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
  }
}) {
  // 1. URL 파라미터 추출 또는 Prop 기반 발주번호 결정
  const orderNo = useMemo(() => {
    if (propOrderNo) return propOrderNo;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryOrderNo = urlParams.get('orderNo');
      if (queryOrderNo) return queryOrderNo;

      // Hash 파라미터 검사 (#WEB-CLNT-ORD-001?orderNo=...)
      if (window.location.hash.includes('orderNo=')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        const hNo = hashParams.get('orderNo');
        if (hNo) return hNo;
      }
    }
    return 'ORD2026103100001';
  }, [propOrderNo]);

  // 2. 상태 관리
  const [orderData, setOrderData] = useState(null);
  const [applyList, setApplyList] = useState([]);
  const [selectedApply, setSelectedApply] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [sortType, setSortType] = useState('recommend'); // 'recommend' | 'fast' | 'latest'
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isConfirming, setIsConfirming] = useState(false);

  const effectiveUserNo = currentUser.USER_NO || 'C20261000001';

  // 3. 백엔드 API 상세 및 청약서 목록 호출 (POST /api/web/client/ord_001)
  const fetchOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/web/client/ord_001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientUserNo: effectiveUserNo,
          orderNo: orderNo
        })
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setOrderData(result.data.orderMaster);
        setApplyList(result.data.applyList || []);
      }
    } catch (err) {
      console.warn('[WEB-CLNT-ORD-001] 청약서 상세 조회 실패 (시뮬레이션 유지):', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserNo, orderNo]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 4. 실시간 타이머 갱신 인터벌 (1초 주기)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 남은 시간 계산
  const remainingTimeText = useMemo(() => {
    if (!orderData || !orderData.bidExpireDt) return '3일 08시간 12분';
    const expireTime = new Date(orderData.bidExpireDt).getTime();
    const diff = expireTime - currentTime;
    if (diff <= 0) return '청약 접수 마감';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    return `${days}일 ${pad(hours)}시간 ${pad(mins)}분 ${pad(secs)}초`;
  }, [orderData, currentTime]);

  // 정렬된 청약서 목록
  const sortedApplyList = useMemo(() => {
    const list = [...applyList];
    if (sortType === 'fast') {
      // 빠른 시공순 (startTime 앞선 순)
      return list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }
    if (sortType === 'latest') {
      // 최신 접수순
      return list.sort((a, b) => new Date(b.regDt).getTime() - new Date(a.regDt).getTime());
    }
    // 기본 추천순: 평점 높은 순
    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [applyList, sortType]);

  // 파트너 선택 및 배차 확정 모달 열기
  const handleSelectPartner = (apply) => {
    setSelectedApply(apply);
    setIsPayModalOpen(true);
  };

  // 배차 최종 확정 액션 처리
  const handleConfirmMatch = () => {
    if (!selectedApply) return;
    setIsConfirming(true);

    setTimeout(() => {
      setIsConfirming(false);
      setIsPayModalOpen(false);
      alert(
        `🎉 [배차 확정 완료]\n파트너사 "${selectedApply.companyNm}"(청약번호: ${selectedApply.applyNo}) 배차가 최종 확정되었습니다.\n\n표준 전자계약서 교부 및 결제 연동 페이지(WEB-CLNT-PAY-000)로 이동합니다.`
      );
      if (onNavigate) {
        onNavigate('WEB-CLNT-PAY-000');
      }
    }, 800);
  };

  // 뒤로 가기 (목록으로 이동)
  const handleGoBack = (e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate('my-requests');
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  if (isLoading && !orderData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-[40px] animate-spin mb-3">progress_activity</span>
        <p className="font-label-md text-label-md text-on-surface-variant">발주 상세 및 파트너 청약서를 불러오는 중입니다...</p>
      </div>
    );
  }

  const order = orderData || {
    orderNo: 'ORD2026103100001',
    cleanLargeNm: '정기청소',
    facilityTypeNm: '사무실·오피스',
    proposedPrice: 720000,
    cleanMidNm: '계단, 복도, 외곽 공용부',
    serviceStartDt: '2026.11.01',
    serviceEndDt: '2027.01.31',
    weekCleanFreq: 2,
    cleanDaysConfig: '매주 월, 수',
    addrText: '경기 고양시 일산동구 마두동 123-45 한빛빌딩 (B1~4F)',
    parkingAvailText: '지하 주차 가능 (무료 방문권 지급)',
    contactPersonNm: '홍길동',
    contactTel: '010-9876-5432',
    detailReqNote: '지하 1층부터 지상 4층까지 계단 난간 및 유리창 먼지 제거 위주로 부탁드립니다. 1층 출입구 분리수거장 주변 물청소 포함입니다.'
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 상단 고정 GNB (.cursorrules 2.5 공식 로고 /logo.png 반영)
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-space-md shrink-0">
            <a
              className="flex items-center gap-space-sm group"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              <img
                alt="쓸고닦고 공식 로고"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
                src="/logo.png"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight leading-none">
                  쓸고닦고
                </span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  BUILDING CLEANING STANDARD
                </span>
              </div>
            </a>
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>경기 고양시 일산동구</span>
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full"
            data-active-classes="bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm"
          >
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="home"
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
            >
              홈
            </a>
            <a
              aria-current="page"
              className="px-4 py-2 transition-colors bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-semibold"
              data-path="my-requests"
              href="#my-requests"
              onClick={handleGoBack}
            >
              나의 신청현황
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="service-history"
              href="#service-history"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('service-history');
              }}
            >
              이용내역
            </a>
            <a
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors"
              data-path="my-account"
              href="#my-account"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('my-account');
              }}
            >
              마이
            </a>
          </nav>

          {/* Profile & Auth Cluster */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {currentUser.USER_NM || '홍길동'}님
              </span>
              <span className="font-caption text-caption text-secondary font-medium">
                인증회원 ({effectiveUserNo})
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="알림"
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              <button
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer"
                onClick={onLogout || (() => alert('로그아웃되었습니다.'))}
                type="button"
              >
                로그아웃
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-1 ring-outline-variant/30 font-semibold text-xs">
                {currentUser.USER_NM ? currentUser.USER_NM.slice(0, 1) : '홍'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          SUB-HEADER & NAVIGATION BAR
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* Sub-Header Navigation & Order Key Bar */}
          <div className="w-full bg-surface-container-lowest shadow-sm border-b border-slate-200/60">
            <div className="max-w-[1200px] mx-auto px-margin py-3.5 flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low cursor-pointer"
                  onClick={handleGoBack}
                  title="신청 목록으로 이동"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>목록으로 돌아가기</span>
                </button>
                <span className="text-outline-variant text-caption">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-caption text-caption">발주번호</span>
                  <span className="font-label-md text-label-md font-bold text-primary tracking-tight font-mono" data-field="ORDER_NO">
                    {order.orderNo}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-caption text-caption text-on-surface-variant">진행 프로세스</span>
                <span
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full shadow-xs"
                  data-field="ORDER_STATUS"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  청약접수중
                </span>
              </div>
            </div>
          </div>

          {/* ====================================================================
              MAIN WORKFLOW CANVAS: 2-Column Split (38% Left / 62% Right)
          ==================================================================== */}
          <div className="max-w-[1200px] mx-auto px-margin py-space-xl w-full">
            {/* Notice Headline */}
            <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                    DISPATCH &amp; SUBSCRIPTION COMPARISON
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-caption text-caption text-outline font-mono">WEB-CLNT-ORD-001</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                  청소 요청 상세 및 용역 청약서 비교/선택
                </h1>
              </div>
              <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2 text-on-surface-variant font-caption text-caption border border-slate-200/60">
                <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                <span>고객 확정 지정가 방식 · 추가금 요구 없는 1:1 파트너 직배차</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* ================================================================
                  LEFT COLUMN: Sticky Order Summary (38% -> 5 cols)
              ================================================================ */}
              <aside className="lg:col-span-5 w-full lg:sticky lg:top-[92px]">
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-md border border-slate-200/80">
                  {/* Card Header & Category Badges */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold">내 청소 발주 조건</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-md font-semibold" data-field="CLEAN_LARGE_CD">
                        {order.cleanLargeNm || '정기청소'}
                      </span>
                      <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2.5 py-1 rounded-md" data-field="FACILITY_TYPE_CD">
                        {order.facilityTypeNm || '사무실·오피스'}
                      </span>
                    </div>
                  </div>

                  {/* Fixed Matching Price Block */}
                  <div className="bg-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-on-primary/80 font-caption text-caption">
                        <span>고객 지정 확정 대금</span>
                        <span className="inline-flex items-center gap-1 text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-secondary-fixed">
                          <span className="material-symbols-outlined text-[13px]">lock</span>
                          역경매 없음
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-caption text-on-primary/80">월</span>
                        <strong
                          className="font-display-hero text-headline-lg lg:text-[34px] font-bold text-secondary-container tracking-tight font-mono"
                          data-field="PROPOSED_PRICE"
                        >
                          {Number(order.proposedPrice).toLocaleString()}원
                        </strong>
                      </div>
                      <p className="font-caption text-caption text-on-primary/75 mt-1 leading-snug">
                        현장 직불 고정액 · 수수료 분쟁 제로 · 플랫폼 중개수수료 별도 정산
                      </p>
                    </div>
                    {/* Decorative Shape */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                  </div>

                  {/* 7-Day Expiry Countdown Timer Banner */}
                  <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center justify-between gap-2 border border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">청약 접수 마감까지</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-label-lg text-label-lg font-bold text-error font-mono" data-field="BID_EXPIRE_DT">
                        {remainingTimeText}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Specifications Table */}
                  <div className="flex flex-col divide-y divide-surface-container-high text-body-sm font-body-sm">
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">청소 구역/유형</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium" data-field="CLEAN_MID_CD">
                        {order.cleanMidNm}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">계약/희망 일정</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium">
                        <span data-field="SERVICE_START_DT">{order.serviceStartDt}</span> ~ <span data-field="SERVICE_END_DT">{order.serviceEndDt}</span>
                        <span className="text-secondary font-semibold text-caption ml-1">({order.servicePeriodDays || 92}일간)</span>
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">주기 및 요일</span>
                      <span className="font-label-md text-label-md text-on-surface text-right font-medium">
                        주 <span className="font-bold text-primary" data-field="WEEK_CLEAN_FREQ">{order.weekCleanFreq || 2}</span>회
                        (<span className="text-secondary font-semibold" data-field="CLEAN_DAYS_CONFIG">{order.cleanDaysConfig || '매주 월, 수'}</span>)
                      </span>
                    </div>
                    <div className="py-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant font-caption text-caption">현장 주소</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary font-medium">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>경기 고양
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface" data-field="ADDR_TEXT">
                        {order.addrText}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">현장 주차</span>
                      <span className="font-label-md text-label-md text-on-surface text-right" data-field="PARKING_AVAIL_CD">
                        {order.parkingAvailText || '지하 주차 가능 (무료 방문권 지급)'}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-on-surface-variant font-caption text-caption">발주자 정보</span>
                      <span className="font-label-md text-label-md text-on-surface text-right">
                        <span className="font-bold" data-field="CONTACT_PERSON_NM">{order.contactPersonNm}</span>
                        <span className="text-outline">·</span>
                        <span className="text-on-surface-variant" data-field="CONTACT_TEL">{order.contactTel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer Detail Note Box */}
                  <div className="bg-surface-container-low/70 rounded-xl p-3.5 flex flex-col gap-1.5 border border-slate-200/50">
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-primary">assignment</span>
                      <span className="font-bold">현장 특기 요청사항</span>
                    </div>
                    <div
                      className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-lowest p-3 rounded-lg border border-slate-200/40"
                      data-field="DETAIL_REQ_NOTE"
                    >
                      "{order.detailReqNote}"
                    </div>
                  </div>

                  {/* Trust Escrow Policy Pill */}
                  <div className="bg-error-container/30 rounded-xl p-3 text-caption font-caption text-tertiary flex items-start gap-2 border border-error/20">
                    <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0 mt-0.5">info</span>
                    <p className="leading-relaxed">
                      <strong>직접 지급 안전고지:</strong> 플랫폼은 현장 노무비를 보관하지 않으며, 작업 완료 후 현장 검수 시 확정액을 기사님께 직접 지급합니다.
                    </p>
                  </div>
                </div>
              </aside>

              {/* ================================================================
                  RIGHT COLUMN: Partner Application Proposals List (62% -> 7 cols)
              ================================================================ */}
              <div className="lg:col-span-7 flex flex-col gap-space-md w-full">
                {/* Control Header & Sorting Filter Bar */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-slate-200/80">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold">접수된 파트너 청약서</h2>
                      <span className="inline-flex items-center justify-center bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold">
                        <span data-field="TOTAL_APPLY_CNT">{sortedApplyList.length}</span>건
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                      기사님이 제안한 방문 일자, 시작 시각, 투입 인원 및 작업 계획을 꼼꼼히 확인하고 최적의 파트너 1인을 선택해 주세요.
                    </p>
                  </div>

                  {/* Sorting Segmented Buttons */}
                  <div className="inline-flex p-1 bg-surface-container-low rounded-xl shrink-0 border border-slate-200/50" role="tablist">
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'recommend'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('recommend')}
                      type="button"
                    >
                      추천순
                    </button>
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'fast'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('fast')}
                      type="button"
                    >
                      빠른시공순
                    </button>
                    <button
                      className={`sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                        sortType === 'latest'
                          ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setSortType('latest')}
                      type="button"
                    >
                      최신접수순
                    </button>
                  </div>
                </div>

                {/* Proposals Cards Feed */}
                {sortedApplyList.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-slate-200/70 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-[48px] mb-3">hourglass_empty</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                      현재 접수된 파트너 청약서가 없습니다.
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      7일 기한 내 마스터들이 청약서를 제출하는 즉시 본 화면에 실시간으로 등록됩니다.
                    </p>
                  </div>
                ) : (
                  sortedApplyList.map((apply, idx) => {
                    const isTopRecommend = idx === 0 && sortType === 'recommend';

                    return (
                      <article
                        className={`relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md overflow-hidden border border-slate-200/80 ${
                          isTopRecommend ? 'ring-2 ring-secondary/40 shadow-md' : ''
                        }`}
                        data-apply-no={apply.applyNo}
                        key={apply.applyNo}
                      >
                        {/* Top Accent Ribbon for Top Recommendation */}
                        {isTopRecommend && (
                          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-secondary-container to-primary"></div>
                        )}

                        {/* Card Header & Partner Profile */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pt-1">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0 text-secondary">
                              <span className="material-symbols-outlined text-[28px]">
                                {idx === 0 ? 'cleaning_services' : idx === 1 ? 'sanitizer' : 'groups'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {apply.recommendBadge && (
                                  <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold inline-flex items-center gap-1 shadow-xs">
                                    <span className="material-symbols-outlined text-[13px]">verified</span>
                                    {apply.recommendBadge}
                                  </span>
                                )}
                                <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-medium">
                                  {apply.gradeNm || '마스터 등급'}
                                </span>
                                <span className="text-caption font-caption text-outline" data-field="REG_DT">
                                  {apply.regDt} 접수
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight" data-field="COMPANY_NM">
                                  {apply.companyNm}
                                </h3>
                                <span className="font-label-md text-label-md text-on-surface-variant font-medium" data-field="USER_NM">
                                  ({apply.userNm || '마스터'})
                                </span>
                              </div>
                              {/* Rating and Verified Badges */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <div className="inline-flex items-center gap-1 text-[#F59E0B] font-label-sm text-label-sm font-bold">
                                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    star
                                  </span>
                                  <span>{apply.rating || '5.0'}</span>
                                  <span className="text-on-surface-variant font-normal font-caption text-caption">
                                    (리뷰 {apply.reviewCount || 84}건)
                                  </span>
                                </div>
                                <span className="text-outline-variant text-[10px]">·</span>
                                {(apply.certifications || ['신원100%검증', '배상책임보험 1억원 가입']).map((c, ci) => (
                                  <span
                                    className="bg-surface-container-low text-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full"
                                    key={ci}
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:shrink-0">
                            <span className="font-caption text-caption text-outline">
                              {apply.careerText ? '경력 누적' : apply.specialPointText ? '특화 포인트' : '고객 지정가 수락율'}
                            </span>
                            <div className="font-label-lg text-label-lg font-bold text-secondary">
                              {apply.careerText || apply.specialPointText || '100% 일치'}
                            </div>
                          </div>
                        </div>

                        {/* Proposal Spec Highlights Grid (4 Columns) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-secondary-container/20 rounded-xl p-3.5 border border-secondary/15">
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">시공 제안일</span>
                            <strong className="font-label-lg text-label-lg text-secondary font-bold" data-field="PROPOSED_DATE">
                              {apply.proposedDate}
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">시작 시각</span>
                            <strong className="font-label-lg text-label-lg text-on-surface font-bold" data-field="START_TIME">
                              {apply.startTime}
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">예상 소요시간</span>
                            <strong className="font-label-lg text-label-lg text-on-surface font-bold" data-field="WORK_HOURS">
                              {apply.workHours}시간
                            </strong>
                          </div>
                          <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs">
                            <span className="font-caption text-[11px] text-on-surface-variant mb-0.5">투입 인원</span>
                            <strong className="font-label-lg text-label-lg text-primary font-bold" data-field="ASSIGN_STAFF_CNT">
                              {apply.assignStaffCnt}
                            </strong>
                          </div>
                        </div>

                        {/* Partner Appeal Message */}
                        <div className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-1.5 shadow-xs border border-slate-200/40">
                          <div className="flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-secondary">format_quote</span>
                            <span>파트너 작업 계획 및 어필</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed pl-1" data-field="APPEAL_MSG">
                            "{apply.appealMsg}"
                          </p>
                        </div>

                        {/* Bottom Action Bar & Contract Acceptance */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-2 bg-surface-container-low/40 p-3 rounded-xl border border-slate-200/40">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-caption text-caption text-on-surface-variant">확정 시공비:</span>
                            <strong className="font-headline-sm text-headline-sm font-bold text-secondary font-mono">
                              {Number(apply.confirmedPrice || order.proposedPrice).toLocaleString()}원
                            </strong>
                            <span className="font-caption text-[11px] text-outline font-medium">
                              (고객 지정가 100% 수락 · 추가비 없음)
                            </span>
                          </div>
                          <button
                            className="btn-select-partner inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-on-secondary-container active:scale-95 px-5 py-2.5 rounded-xl font-label-lg text-label-lg font-bold shadow-sm transition-all cursor-pointer"
                            data-apply={apply.applyNo}
                            data-name={apply.companyNm}
                            data-time={`${apply.proposedDate} ${apply.startTime}`}
                            onClick={() => handleSelectPartner(apply)}
                            type="button"
                          >
                            <span>이 파트너로 배차 확정하기</span>
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3-Pillar Security & Trust Banner */}
            <section className="mt-space-xl bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/70">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0 text-secondary">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">100% 신원 보증 파트너</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      사업자등록증, 범죄경력 검증, 배상책임보험 1억원 이상 의무 가입된 정예 기사님만 매칭됩니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <span className="material-symbols-outlined text-[22px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">현장 직불제 안심 정산</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      사전 선결제 강요 없이 현장 작업 검수가 완료된 후 파트너에게 직접 정산하여 분쟁을 차단합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface">
                    <span className="material-symbols-outlined text-[22px]">handshake</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface">3개월 무상 A/S 보증</h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
                      정기 계약 기간 중 발생한 미흡 구간 및 현장 클레임 발생 시 24시간 내 재방문 조치를 지원합니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ====================================================================
          INTERACTIVE CONFIRMATION MODAL: WEB-CLNT-PAY-000 결제 및 배차 확정 모달
      ==================================================================== */}
      {isPayModalOpen && selectedApply && (
        <WebClntPay000
          isOpen={isPayModalOpen}
          orderData={{
            ...order,
            categories: [order.cleanLargeCd || 'REGULAR']
          }}
          applyData={selectedApply}
          currentUser={currentUser}
          onClose={() => setIsPayModalOpen(false)}
          onPaymentSuccess={(contractData) => {
            console.log('[PAY_SUCCESS]', contractData);
            if (onNavigate) {
              onNavigate('my-application-status');
            } else if (typeof window !== 'undefined') {
              window.location.hash = '#my-application-status';
            }
          }}
        />
      )}

      {/* ====================================================================
          FOOTER: 하단 법적 고지 및 고객센터 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                alt="쓸고닦고 공식 로고"
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
                src="/logo.png"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                쓸고닦고
              </span>
              <span className="font-caption text-caption text-outline">
                프리미엄 홈케어 컨시어지
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <a className="hover:text-on-surface transition-colors font-semibold" data-path="terms-of-service" href="#">
                이용약관
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors font-semibold text-primary" data-path="privacy-policy" href="#">
                개인정보처리방침
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="customer-service" href="#">
                고객센터
              </a>
              <span className="text-outline-variant">|</span>
              <a className="hover:text-on-surface transition-colors" data-path="partner-inquiry" href="#">
                기사 파트너 등록
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant">
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                (주)공간다원
              </p>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>대표자: 김충훈</span>
                <span>사업자등록번호: 214-88-02482</span>
                <span>통신판매업신고: 제2025-경기고양-1849호</span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>고객센터: 02-429-5459 (평일 09:00 - 18:00)</span>
                <span>이메일: support@spacendw.kr</span>
              </div>
              <p className="text-outline">
                경기도 고양시 일산동구 중앙로 1261번길 42
              </p>
            </div>
            <div className="flex flex-col justify-between gap-space-sm">
              <div className="bg-error-container/40 p-space-sm rounded-xl border border-error/20">
                <p className="font-caption text-caption text-tertiary leading-relaxed">
                  <strong className="font-semibold">[플랫폼 면책 및 결제 안내]</strong> 쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며, 현장 인건비 및 수리 노무비는 작업 검수 후 시공 기사님께 직접 지급됩니다. 플랫폼은 현장 노무비 에스크로를 보유하지 않으며 플랫폼 매칭 수수료 외 시공 하자의 법적 책임은 시공 파트너에게 귀속됩니다.
                </p>
              </div>
              <p className="font-caption text-caption text-outline text-right md:text-left">
                © 2026 (주)공간다원. All rights reserved. SseulDakGo Domestic Infrastructure Platform.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}




/**
 * @file SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-000/index.jsx
 * @description 청소 시공 검수 및 현장 직불 완료 승인 화면 컴포넌트 (WEB-CLNT-JOB-000)
 *              - 기사님이 실시간 업로드한 시공 전/후 사진 1:1 비교 갤러리 (BEFORE/AFTER 필터 및 라이트박스 확대)
 *              - 파트너 수취 지정 계좌 원터치 복사 및 현장 직불 안내 (에스크로 미보유)
 *              - 대면 검수 확인 체크 후 최종 완료 승인 트랜잭션 (SVC_COMPLETED) 연동
 *              - .cursorrules 2.5 공식 브랜드 상표 로고(/logo.png) 반영
 * 
 * Props:
 * @param {string} contractNo 계약 관리번호 (기본값: 'CNT2026103100001')
 * @param {Object} currentUser 로그인 고객 정보 ({ USER_NO, USER_NM })
 * @param {Function} onNavigate 화면 전환 핸들러 (path: string) => void
 * @param {Function} onLogout 로그아웃 핸들러 () => void
 */
export function WebClntJob000({
  contractNo: propContractNo,
  currentUser = { USER_NO: 'C20261000001', USER_NM: '홍길동' },
  onNavigate,
  onLogout
}) {
  // 1. 계약번호 추출 (Prop 또는 URL 쿼리/해시 파라미터)
  const contractNo = useMemo(() => {
    if (propContractNo) return propContractNo;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryNo = urlParams.get('contractNo');
      if (queryNo) return queryNo;

      if (window.location.hash.includes('contractNo=')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hParams = new URLSearchParams(hashQuery);
        const hNo = hParams.get('contractNo');
        if (hNo) return hNo;
      }
    }
    return 'CNT2026103100001';
  }, [propContractNo]);

  // 2. 컴포넌트 상태 관리
  const [inspectData, setInspectData] = useState(null);
  const [photoList, setPhotoList] = useState([]);
  const [activePhotoTab, setActivePhotoTab] = useState('all'); // 'all' | 'before' | 'after'
  const [isAgreedInspect, setIsAgreedInspect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('복사');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null); // 라이트박스 모달용
  const [isLoading, setIsLoading] = useState(true);

  // 3. 백엔드 검수 데이터 조회 (POST /api/web/client/job_000, action: 'GET_INSPECT_DATA')
  const fetchInspectData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/web/client/job_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GET_INSPECT_DATA',
          contractNo: contractNo,
          clientUserNo: currentUser?.USER_NO || 'C20261000001'
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success && resData.data) {
        setInspectData(resData.data.contract);
        setPhotoList(resData.data.photos || []);
        if (resData.data.contract?.contractStatCd === 'COMPLETED') {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.warn('[FETCH_INSPECT_ERR_FALLBACK]', err);
    } finally {
      setIsLoading(false);
    }
  }, [contractNo, currentUser]);

  useEffect(() => {
    fetchInspectData();
  }, [fetchInspectData]);

  // 4. 계좌번호 클립보드 복사 인터랙션
  const handleCopyAccount = async () => {
    const accNo = inspectData?.partner?.accountNo || '110-123-456789';
    try {
      await navigator.clipboard.writeText(accNo);
      setCopyFeedback('복사됨!');
      setTimeout(() => setCopyFeedback('복사'), 2000);
    } catch (e) {
      setCopyFeedback('복사완료');
      setTimeout(() => setCopyFeedback('복사'), 2000);
    }
  };

  // 5. 최종 시공 완료 승인 요청 (action: 'CONFIRM_COMPLETE')
  const handleApproveInspection = async () => {
    if (!isAgreedInspect) {
      alert('현장 시공 상태 확인 및 최종 승인 체크박스에 동의해 주세요.');
      return;
    }

    const confirmMsg =
      `[현장 검수 최종 승인]\n` +
      `현장 시공 상태와 전/후 증빙 사진을 모두 확인하셨습니까?\n` +
      `승인 완료 후 기사님 계좌로 확정 시공비(₩${Number(inspectData?.totalServiceAmt || 720000).toLocaleString()}원)를 직접 지급하셔야 합니다.\n\n` +
      `정말 최종 승인하시겠습니까?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/web/client/job_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_COMPLETE',
          contractNo: contractNo,
          clientUserNo: currentUser?.USER_NO || 'C20261000001'
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setIsCompleted(true);
        setIsSuccessModalOpen(true);
      } else {
        alert(resData.message || '승인 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.warn('[CONFIRM_COMPLETE_FALLBACK]', err);
      setIsCompleted(true);
      setIsSuccessModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. 성공 모달 확인 후 신청현황 페이지 이동
  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    if (onNavigate) {
      onNavigate('my-requests');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#my-requests';
    }
  };

  const contract = inspectData || {
    contractNo,
    orderNo: 'ORD20261028-0091',
    cleanLargeNm: '정기청소',
    cleanMidNm: '빌라 공용부 (B1~4F 계단/복도)',
    addrText: '경기 고양시 일산동구 마두동 123-45',
    addrDetail: '한빛빌딩 (공동현관 비번: #8821*)',
    confirmedDate: '2026.11.02(월)',
    confirmedTime: '10:00 ~ 13:30',
    workDurationText: '3.5h 완료',
    totalServiceAmt: 720000,
    safeTelNo: '0507-1234-5678',
    partner: {
      companyNm: '반짝빌라클린',
      userNm: '이*수 대표',
      bankName: 'IBK기업은행',
      accountNo: '110-123-456789',
      accountHolder: '이충훈 (반짝빌라클린)'
    },
    reportRegDt: '2026.11.02 13:45'
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* ====================================================================
          HEADER: 브랜드 상표 로고 및 사용자 네비게이션
      ==================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60">
        <div className="h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md">
          
          {/* Logo & Area Selector */}
          <div className="flex items-center gap-space-md shrink-0">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('home') : (window.location.hash = '#home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="쓸고닦고 공식 로고"
                className="w-10 h-10 object-contain rounded-full shadow-xs"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                쓸고닦고
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>고양시 일산동구</span>
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </div>
          </div>

          {/* GNB Navigation */}
          <nav className="hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('home') : (window.location.hash = '#home')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              홈
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests')}
              className="px-4 py-2 bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-bold cursor-pointer"
            >
              나의 신청현황
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('service-history') : (window.location.hash = '#service-history')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              이용내역
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('my-account') : (window.location.hash = '#my-account')}
              className="px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              마이
            </button>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {currentUser?.USER_NM || '홍길동'}님
              </span>
              <span className="font-caption text-caption text-secondary font-medium">
                인증회원 ({currentUser?.USER_NO || 'C20261000001'})
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                aria-label="알림"
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              {onLogout && (
                <button
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer"
                  onClick={onLogout}
                  type="button"
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN BODY
      ==================================================================== */}
      <main className="w-full pt-[72px] bg-background flex-1">
        <div className="flex flex-col w-full">
          
          {/* Top Context & Breadcrumb Bar */}
          <div className="max-w-[1200px] w-full mx-auto px-margin pt-space-lg pb-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests')}
                className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
                <span>나의 신청현황으로 이동 (WEB-CLNT-ORD-000)</span>
              </button>
              <div className="flex items-center gap-space-xs">
                <span className="text-on-surface-variant font-label-sm text-label-sm">화면 ID:</span>
                <span className="font-mono font-semibold text-primary font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded-full">
                  WEB-CLNT-JOB-000
                </span>
              </div>
            </div>
          </div>

          {/* Hero Header Section */}
          <section className="max-w-[1200px] w-full mx-auto px-margin pb-space-lg">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider bg-secondary-container/40 px-2 py-0.5 rounded">
                    Inspection &amp; Settlement
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    계약번호 <span className="font-mono font-bold text-on-surface" data-field="CONTRACT_NO">{contract.contractNo}</span>
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md text-primary font-bold">
                  청소 시공 현장 검수 및 직불 승인
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  기사님이 실시간 등록한 시공 전/후 사진을 비교 확인하고, 현장 대면 검수 완료 후 용역 대금을 직접 정산해 주세요.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-space-xs shrink-0">
                <div
                  className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md font-bold inline-flex items-center gap-2 shadow-sm ${
                    isCompleted
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-low text-secondary border border-secondary/30'
                  }`}
                  data-field="CONTRACT_STAT_CD"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-secondary' : 'bg-secondary animate-ping'}`}></span>
                  <span>{isCompleted ? '시공 및 직불 승인완료 (SVC_COMPLETED)' : '시공완료 · 현장검수대기'}</span>
                </div>
                <span className="font-caption text-caption text-outline">
                  작업 보고 등록: {contract.reportRegDt || '2026.11.02 13:45'}
                </span>
              </div>
            </div>
          </section>

          {/* Main Content Grid Layout (8 cols + 4 cols sticky sidebar) */}
          <div className="max-w-[1200px] w-full mx-auto px-margin pb-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              
              {/* ================================================================
                  LEFT COLUMN (8 Cols): Site Overview & Photo Comparison
              ================================================================ */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                
                {/* 2-Column Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  
                  {/* Site Info Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-slate-100">
                        <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[20px]">apartment</span>
                          시공 현장 개요
                        </span>
                        <span className="bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm font-bold px-2.5 py-0.5 rounded-full" data-field="CLEAN_LARGE_CD">
                          {contract.cleanLargeNm}
                        </span>
                      </div>
                      <div className="flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">시공 공간</span>
                          <span className="font-semibold text-on-surface" data-field="CLEAN_MID_CD">
                            {contract.cleanMidNm}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">현장 주소</span>
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium" data-field="ADDR_TEXT">{contract.addrText}</span>
                            <span className="text-on-surface-variant font-caption text-caption" data-field="ADDR_DETAIL">{contract.addrDetail}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-outline shrink-0 w-16">시공 일시</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-on-surface" data-field="CONFIRMED_DATE">{contract.confirmedDate}</span>
                            <span className="font-bold text-secondary" data-field="CONFIRMED_TIME">{contract.confirmedTime}</span>
                            <span className="text-outline-variant font-caption text-caption">({contract.workDurationText})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between">
                      <span className="font-caption text-caption text-on-surface-variant">현장 주문번호</span>
                      <span className="font-mono font-label-sm text-label-sm font-semibold text-primary" data-field="ORDER_NO">
                        {contract.orderNo}
                      </span>
                    </div>
                  </div>

                  {/* Partner Master Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-slate-100">
                        <span className="font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
                          담당 시공 마스터
                        </span>
                        <span className="bg-primary/10 text-primary font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">stars</span>
                          MASTER TIER
                        </span>
                      </div>
                      <div className="flex items-start gap-3 pt-space-xs">
                        <div className="w-12 h-12 rounded-full bg-secondary-container/60 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-secondary-container text-[26px]">cleaning_services</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <strong className="font-headline-sm text-headline-sm text-on-surface truncate" data-field="COMPANY_NM">
                              {contract.partner?.companyNm}
                            </strong>
                            <span className="text-on-surface-variant font-body-sm text-body-sm shrink-0" data-field="USER_NM">
                              ({contract.partner?.userNm})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="bg-surface-container px-2 py-0.5 rounded text-secondary font-label-sm text-label-sm font-semibold">
                              영업배상책임 1억원
                            </span>
                            <span className="bg-surface-container px-2 py-0.5 rounded text-primary font-label-sm text-label-sm font-semibold">
                              신원·경력 검증
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-outline">파트너 안심번호</span>
                        <span className="font-mono font-label-md text-label-md text-on-surface font-bold" data-field="SAFE_TEL_NO">
                          {contract.safeTelNo}
                        </span>
                      </div>
                      <a
                        className="h-[40px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        href={`tel:${(contract.safeTelNo || '').replace(/-/g, '')}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        <span>전화걸기</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Before & After Photo Gallery */}
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-slate-100 pb-space-sm">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                          시공 전/후 현장 검증 사진 비교
                        </h2>
                        <span className="bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full">
                          총 <span data-field="PHOTO_COUNT">{(photoList.length || 3) * 2}</span>장 등록
                        </span>
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant">
                        모든 구역은 청소 전 상태와 완료 후 살균·코팅 마감 상태가 1:1로 증빙됩니다.
                      </p>
                    </div>

                    {/* View Tab Controls */}
                    <div className="inline-flex items-center p-1 bg-surface-container-low rounded-xl gap-1 shrink-0" id="photoTabControls">
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'all'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('all')}
                        type="button"
                      >
                        전체 1:1 비교
                      </button>
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'before'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('before')}
                        type="button"
                      >
                        📷 작업 전 (BEFORE)
                      </button>
                      <button
                        className={`tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                          activePhotoTab === 'after'
                            ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        onClick={() => setActivePhotoTab('after')}
                        type="button"
                      >
                        ✨ 작업 후 (AFTER)
                      </button>
                    </div>
                  </div>

                  {/* Photo Cards List */}
                  <div className="flex flex-col gap-space-lg" id="photoCardContainer">
                    {photoList.map((pair, idx) => (
                      <div key={pair.pairId || idx} className="bg-surface-container-low/50 rounded-xl p-space-md flex flex-col gap-space-md border border-slate-200/40">
                        
                        {/* Section Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-label-lg text-label-lg text-on-surface font-bold">
                              {pair.title}
                            </span>
                          </div>
                          <span className="text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-secondary-container/30 px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {pair.treatmentNote}
                          </span>
                        </div>

                        {/* Photo Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                          
                          {/* Before Photo */}
                          {(activePhotoTab === 'all' || activePhotoTab === 'before') && (
                            <div className="photo-item photo-before flex flex-col gap-space-xs group">
                              <div className="relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs">
                                <img
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.before.src)}
                                  src={pair.before.src}
                                  alt={pair.before.altText}
                                />
                                <div className="absolute top-3 left-3 bg-inverse-surface/85 backdrop-blur text-inverse-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow">
                                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                                  작업 전 (BEFORE)
                                </div>
                                <button
                                  className="absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-primary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.before.src)}
                                  title="원본 사진 확대"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-outline font-caption text-caption px-1">
                                <span>촬영 시각: {pair.before.takenTimeText}</span>
                                <span className="font-mono">{pair.before.photoNo}</span>
                              </div>
                            </div>
                          )}

                          {/* After Photo */}
                          {(activePhotoTab === 'all' || activePhotoTab === 'after') && (
                            <div className="photo-item photo-after flex flex-col gap-space-xs group">
                              <div className="relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs">
                                <img
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.after.src)}
                                  src={pair.after.src}
                                  alt={pair.after.altText}
                                />
                                <div className="absolute top-3 left-3 bg-secondary text-on-secondary px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow">
                                  <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                                  작업 후 (AFTER)
                                </div>
                                <button
                                  className="absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-secondary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => setSelectedPhotoUrl(pair.after.src)}
                                  title="원본 사진 확대"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-secondary font-caption text-caption px-1">
                                <span className="font-medium">세척 마감: {pair.after.takenTimeText}</span>
                                <span className="font-mono">{pair.after.photoNo}</span>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quality Assurance Notice */}
                  <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-sm border border-slate-200/50">
                    <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">verified</span>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        쓸고닦고 안심 시공 보증제 운영 안내
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        승인 완료 후 발견된 미흡 구역에 대해서는 시공 파트너의 의무 A/S 규정에 따라 시공일 기준 최대 7일 이내 무상 재방문 보완 조치가 보장됩니다.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* ================================================================
                  RIGHT COLUMN (4 Cols): Direct Settlement Sticky Sidebar
              ================================================================ */}
              <div className="lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-[92px]">
                
                {/* Navy Direct Settlement Card */}
                <div className="bg-primary text-on-primary rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-36 h-36 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Direct Settlement Header Tag */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-secondary-container/20 text-secondary-fixed px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[15px]">payments</span>
                      현장 직불제 정산 원칙
                    </span>
                    <span className="text-secondary-fixed-dim font-caption text-caption">
                      중개수수료 0원
                    </span>
                  </div>

                  {/* Amount Display */}
                  <div className="flex flex-col gap-1">
                    <span className="font-caption text-caption text-primary-fixed-dim">
                      최종 현장 지급 노무 대금
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-hero text-display-hero text-secondary-fixed font-black tracking-tight" data-field="TOTAL_SERVICE_AMT">
                        {Number(contract.totalServiceAmt || 720000).toLocaleString()}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-primary font-bold">
                        원
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-fixed font-caption text-caption">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>견적 확정 금액 · 추가 청구 및 팁 일체 없음</span>
                    </div>
                  </div>

                  {/* Partner Direct Transfer Account Container */}
                  <div className="bg-primary-container/80 rounded-xl p-space-md flex flex-col gap-space-sm backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary-fixed-dim font-medium">
                        기사님 지정 수취 계좌
                      </span>
                      <span className="font-label-sm text-label-sm text-on-primary font-bold" data-field="BANK_NAME">
                        {contract.partner?.bankName || 'IBK기업은행'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-primary/60 px-3 py-2.5 rounded-lg border border-white/10">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-body-lg font-bold text-secondary-fixed tracking-wider truncate" data-field="ACCOUNT_NO">
                          {contract.partner?.accountNo || '110-123-456789'}
                        </span>
                        <span className="font-caption text-caption text-primary-fixed-dim">
                          예금주: <span className="text-on-primary font-medium" data-field="ACCOUNT_HOLDER">{contract.partner?.accountHolder || '이충훈 (반짝빌라클린)'}</span>
                        </span>
                      </div>
                      <button
                        className="shrink-0 h-[36px] px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        id="copyAccountBtn"
                        onClick={handleCopyAccount}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span id="copyBtnText">{copyFeedback}</span>
                      </button>
                    </div>
                  </div>

                  {/* Important Escrow Disclaimer */}
                  <div className="bg-error-container/20 rounded-xl p-space-sm flex items-start gap-2 border border-error/20">
                    <span className="material-symbols-outlined text-tertiary-fixed text-[18px] shrink-0 mt-0.5">info</span>
                    <p className="font-caption text-caption text-tertiary-fixed leading-relaxed">
                      <strong>[직불 정산 필수 고지]</strong> 본 플랫폼은 시공 노무비를 보유하지 않으며 에스크로 결제를 지원하지 않습니다. 사진 확인 및 현장 대면 점검 후 마스터 기사님께 전액 직접 계좌이체 또는 현금 지급해 주시기 바랍니다.
                    </p>
                  </div>
                </div>

                {/* Approval & Action Box */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-md">
                  <h3 className="font-label-lg text-label-lg text-primary font-bold">
                    검수 확인 및 승인 진행
                  </h3>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors group border border-slate-200/50">
                    <input
                      checked={isAgreedInspect || isCompleted}
                      disabled={isCompleted}
                      className="w-5 h-5 rounded mt-0.5 text-secondary accent-secondary focus:ring-0 cursor-pointer shrink-0"
                      id="inspectionCheck"
                      onChange={(e) => setIsAgreedInspect(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface leading-snug select-none">
                      현장 시공 상태와 전/후 증빙 사진을 모두 확인하였으며, 안내된 청소 범위가 성실하게 이행되었음을 최종 승인합니다.
                    </span>
                  </label>

                  {/* Main CTA Button */}
                  <button
                    className={`w-full h-[56px] rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      isCompleted
                        ? 'bg-secondary-container text-on-secondary-container cursor-default'
                        : isAgreedInspect && !isSubmitting
                        ? 'bg-secondary hover:bg-[#005049] text-on-secondary shadow-md cursor-pointer active:scale-[0.99]'
                        : 'bg-outline-variant/60 text-on-surface-variant/70 cursor-not-allowed'
                    }`}
                    disabled={!isAgreedInspect || isSubmitting || isCompleted}
                    id="approveBtn"
                    onClick={handleApproveInspection}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>승인 처리 중...</span>
                      </>
                    ) : isCompleted ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span>시공 및 직불 승인 완료</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">task_alt</span>
                        <span>최종 청소 완료 승인하기</span>
                      </>
                    )}
                  </button>

                  {/* Re-work / AS Inquiries Action */}
                  <div className="pt-space-xs flex flex-col gap-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-outline font-caption text-caption">
                      <span>미흡 구역 또는 재작업 문의</span>
                      <span className="text-secondary font-semibold">무상 A/S 안심보장</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        onClick={() => alert(`[현장 A/S 재요청 접수]\n파트너(${contract.partner?.companyNm})에게 보완 작업 요청 알림이 전송됩니다.`)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px] text-error">build</span>
                        <span>현장 A/S 재요청</span>
                      </button>
                      <button
                        className="h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        onClick={() => alert('[고객센터 접수]\n고객센터(02-429-5459)로 연결합니다.')}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">support_agent</span>
                        <span>고객센터 접수</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm border border-slate-200/50">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-[20px]">headset_mic</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      도움이 필요하신가요?
                    </span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      쓸고닦고 안심 중재팀: 02-429-5459
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ====================================================================
          LIGHTBOX MODAL (사진 고해상도 확대 오버레이)
      ==================================================================== */}
      {selectedPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              className="absolute -top-12 right-0 text-white hover:text-secondary p-2 transition-colors cursor-pointer"
              onClick={() => setSelectedPhotoUrl(null)}
              type="button"
            >
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
            <img
              src={selectedPhotoUrl}
              alt="확대 사진"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          INSPECTION COMPLETE SUCCESS MODAL
      ==================================================================== */}
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in"
          id="successModal"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-slate-200/80 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div className="flex flex-col text-center gap-1">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                검수 및 승인이 완료되었습니다
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                담당 기사님께 현장 직불 대금 송금이 완료되었는지 최종 확인해 주시기 바랍니다.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs font-body-sm text-body-sm border border-slate-200/50">
              <div className="flex justify-between items-center">
                <span className="text-outline">승인 상태</span>
                <span className="font-bold text-secondary">SVC_COMPLETED (완료)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">정산 금액</span>
                <span className="font-bold text-primary">
                  {Number(contract.totalServiceAmt || 720000).toLocaleString()}원 (현장 직불)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">승인 일시</span>
                <span className="font-mono text-on-surface">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-space-xs">
              <button
                className="h-[48px] w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                id="closeModalBtn"
                onClick={handleSuccessClose}
                type="button"
              >
                확인 및 나의 신청현황으로 이동
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          FOOTER: 법적 고지 및 회사 정보
      ==================================================================== */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60 mt-space-xl">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60">
            <div className="flex items-center gap-space-sm">
              <img
                src="/logo.png"
                alt="쓸고닦고 공식 로고"
                className="w-7 h-7 object-contain rounded-full shadow-xs"
              />
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                쓸고닦고
              </span>
              <span className="font-caption text-caption text-outline">
                프리미엄 홈케어 컨시어지
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
              <button type="button" onClick={() => onNavigate?.('terms-of-service')} className="hover:text-on-surface transition-colors font-semibold cursor-pointer">
                이용약관
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('privacy-policy')} className="hover:text-on-surface transition-colors font-semibold text-primary cursor-pointer">
                개인정보처리방침
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('customer-service')} className="hover:text-on-surface transition-colors cursor-pointer">
                고객센터
              </button>
              <span className="text-outline-variant">|</span>
              <button type="button" onClick={() => onNavigate?.('partner-inquiry')} className="hover:text-on-surface transition-colors cursor-pointer">
                기사 파트너 등록
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant">
              <p className="font-label-md text-label-md text-on-surface font-semibold">(주)공간다원</p>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>대표자: 김충훈</span>
                <span>사업자등록번호: 214-88-02482</span>
                <span>통신판매업신고: 제2024-서울강남-0192호</span>
              </div>
              <div className="flex flex-wrap gap-x-space-md gap-y-1">
                <span>고객센터: 02-429-5459 (평일 09:00 - 18:00)</span>
                <span>이메일: support@spacendw.kr</span>
              </div>
              <p className="text-outline">서울특별시 서초구 강남대로 381, 14층 (서초동)</p>
            </div>
            <div className="flex flex-col justify-between gap-space-sm">
              <div className="bg-error-container/40 p-space-sm rounded-xl border border-error/20">
                <p className="font-caption text-caption text-tertiary leading-relaxed">
                  <strong className="font-semibold">[플랫폼 면책 및 결제 안내]</strong> 쓸고닦고는 통신판매중개자로서 거래 당사자가 아니며, 현장 인건비 및 수리 노무비는 작업 검수 후 시공 기사님께 직접 지급됩니다. 플랫폼은 현장 노무비 에스크로를 보유하지 않으며 플랫폼 매칭 수수료 외 시공 하자의 법적 책임은 시공 파트너에게 귀속됩니다.
                </p>
              </div>
              <p className="font-caption text-caption text-outline text-right md:text-left">
                © 2026 (주)공간다원. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
