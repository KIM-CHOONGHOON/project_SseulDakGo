import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ============================================================================
 * [모바일 스크린] APP-CLNT-REQ-000
 * 화면명: 청소 서비스 신청 및 발주서 작성 (WEB-CLNT-REQ-000 1:1 모바일 최적화 이식)
 * 파일 경로: SseulDakGo_App/Client/screens/APP-CLNT-REQ-000/index.tsx
 * 기술 스택: React Native / Capacitor Hybrid Webview (TypeScript / Tailwind CSS)
 * ============================================================================
 */

export interface AppClntReq000Props {
  visible?: boolean;
  initialTab?: 'REGULAR' | 'MOVEIN' | 'APPLIANCE';
  onClose?: () => void;
  onOpenLogin?: () => void;
  onNavigate?: (screenId: string, params?: any) => void;
  navigation?: any;
  route?: any;
  onSuccess?: (data: any) => void;
}

// 햅틱 피드백 헬퍼
function triggerHaptic(style: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS' = 'LIGHT') {
  try {
    if (typeof window !== 'undefined') {
      const Haptics = (window as any).Capacitor?.Plugins?.Haptics;
      if (Haptics) {
        if (style === 'SUCCESS') {
          Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
        } else {
          Haptics.impact({ style }).catch(() => {});
        }
        return;
      }
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(style === 'HEAVY' ? 40 : 15);
      }
    }
  } catch {
    // 햅틱 미지원 무시
  }
}

// ============================================================================
// 1. 네이버 주소 검색 모바일 팝업 모달 (WEB-CLNT-REQ-000 100% 연동)
// ============================================================================
interface NaverAddressItem {
  roadAddress: string;
  jibunAddress?: string;
  bldNm?: string;
  sido?: string;
  sigungu?: string;
  sidoCd?: string;
  sigunguCd?: string;
}

function MobileNaverAddressSearchModal({
  isOpen,
  onClose,
  onSelectAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (item: NaverAddressItem) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<NaverAddressItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (q?: string) => {
    const targetQ = String(q !== undefined ? q : (inputRef.current?.value || keyword)).trim();
    if (!targetQ) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/web/client/search_address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQ }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.items)) {
          setSearchResults(data.items);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.warn('Address search failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 모달이 처음 열릴 때만 1회 초기 검색 실행 (입력 중 키워드 리셋 방지)
  useEffect(() => {
    if (isOpen) {
      const initQ = '마두동';
      setKeyword(initQ);
      setHasSearched(false);
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
      className="fixed inset-0 z-70 bg-inverse-surface/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 pb-safe animate-in slide-in-from-bottom duration-200">
        {/* Modal Top Bar */}
        <div className="p-4 bg-surface-container-low border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-xs">
              N
            </span>
            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">
              네이버 지도 주소 검색
            </h3>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]">
              실시간 지오코딩
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Input & Search Button */}
        <div className="p-3 bg-white border-b border-slate-100 flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e.currentTarget.value);
                }
              }}
              placeholder="도로명, 건물명, 지번 입력 (예: 삼혜빌딩)"
              className="w-full h-11 pl-3.5 pr-8 rounded-xl bg-surface-container-low text-[14px] outline-none border border-transparent focus:border-[#03C75A] font-medium"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(keyword)}
            type="button"
            className="px-4 h-11 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-bold text-[14px] flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
          >
            검색
          </button>
        </div>

        {/* 추천 검색어 칩 */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 overflow-x-auto text-[11px] bg-slate-50 border-b border-slate-100">
          <span className="shrink-0 text-slate-400 font-medium">추천:</span>
          {['세브란스병원', '명지병원', '토당로 105', '국립암센터', '삼혜빌딩', '화신로 260'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                triggerHaptic('LIGHT');
                setKeyword(chip);
                handleSearch(chip);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#03C75A] text-slate-700 whitespace-nowrap transition-colors shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Result List */}
        <div className="max-h-[320px] overflow-y-auto p-3 space-y-2 bg-slate-50/50">
          {isLoading ? (
            <div className="py-10 text-center text-slate-400 text-xs">네이버 주소 검색 중...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  triggerHaptic('LIGHT');
                  onSelectAddress(item);
                  onClose();
                }}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#03C75A] hover:shadow-sm cursor-pointer transition-all text-left"
              >
                <div className="text-[13px] font-bold text-slate-800">{item.roadAddress}</div>
                {item.jibunAddress && (
                  <div className="text-[11px] text-slate-500 mt-0.5">지번: {item.jibunAddress}</div>
                )}
                {item.bldNm && item.bldNm !== item.roadAddress && (
                  <div className="text-[11px] text-[#1F497D] font-medium mt-0.5">건물: {item.bldNm}</div>
                )}
              </div>
            ))
          ) : hasSearched ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              검색 결과가 없습니다. 도로명이나 건물명을 정확히 입력해 주세요.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TB_COM_CODE 공통 코드 (BLDG_TYPE, CLEAN_LOC)
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

export interface ApplianceOption {
  val: string;
  label: string;
}

export interface ApplianceCatalogItem {
  id: string;
  category: string;
  catColor: string;
  name: string;
  subDesc: string;
  icon: string;
  unit: string;
  defaultVal: string;
  placeholder?: string;
  inputType: 'number' | 'select';
  options?: ApplianceOption[];
}

export interface ApplianceInstance {
  seq: number;
  spec: string;
  customSize?: string;
}

// 계절가전청소 총 9개 세부 품목 카탈로그 정의 (모바일 최적화)
export const APPLIANCE_CATALOG: ApplianceCatalogItem[] = [
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

// ============================================================================
// 2. 기본 의뢰 폼 초기 상태 (WEB-CLNT-REQ-000 동일)
// ============================================================================
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
    STAND: [] as ApplianceInstance[],
    CEILING_SYS: [] as ApplianceInstance[],
    TUB_WASHER: [] as ApplianceInstance[],
    DRUM_WASHER: [] as ApplianceInstance[],
    DRYER: [] as ApplianceInstance[],
    FRIDGE_STEAM: [] as ApplianceInstance[],
    RANGE_HOOD: [] as ApplianceInstance[],
    MATTRESS: [] as ApplianceInstance[],
  } as Record<string, ApplianceInstance[]>,
  // 공통 금액 및 상세
  proposedPrice: '180,000',
  detailReqNote:
    '4층 건물이며 1층 분리수거장 및 2~4층 계단·복도 청소 희망합니다. 음식물 쓰레기 수거함 물청소 포함 요청드립니다. 주차는 건물 뒤편 전용 주차라인 1대 가능합니다.',
};

// 달력 기준 주차 및 날짜 범위 동적 계산 함수 (1일 기준 요일 및 총일수 계산)
function getWeeksInMonth(year: number, month: number) {
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
function calcThreeMonthsLater(year: number, month: number, week: number) {
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

// 브라우저 Canvas 기반 고해상도 이미지 압축 (최대 1024px, JPEG 0.75, 장당 약 80~120KB)
// -> 10장 업로드 시에도 localStorage 5MB 한도(약 1MB 사용) 내 안전하게 직렬화 저장 가능
function compressImageToDataUrl(file: any, maxWidth = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    if (typeof file === 'string' && file.startsWith('data:')) return resolve(file);
    if (typeof file === 'string' && file.startsWith('http')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
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

// ============================================================================
// 3. 메인 모바일 스크린 컴포넌트: AppClntReq000
// ============================================================================
export function AppClntReq000({
  visible = true,
  initialTab = 'REGULAR',
  onClose,
  onOpenLogin,
  onNavigate,
  navigation,
  route,
  onSuccess,
}: AppClntReq000Props) {
  const paramTab = route?.params?.category || initialTab;
  const [activeTab, setActiveTab] = useState<'REGULAR' | 'MOVEIN' | 'APPLIANCE'>(
    paramTab === 'APPLIANCE' || paramTab === 'MOVEIN' ? paramTab : 'REGULAR'
  );

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [startYearMonth, setStartYearMonth] = useState('2026-11');
  const [startWeek, setStartWeek] = useState(2);
  const [customMidCdText, setCustomMidCdText] = useState('');
  const [photoFiles, setPhotoFiles] = useState<
    Array<{ seq: number; title: string; url: string; dataUrl?: string; fileObj?: any }>
  >([
    {
      seq: 1,
      title: '계단_현장01.jpg',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnTafYAPVhILnbFGI4SsEV5ASMNS7opmNu7theOHUl5U6le3jzyIfTGHn53cwvoYxT1GruGbC6Qh61qIk8fI3cDNpL1RBaCi110FuiU_Zo08fg9epsZtzA5d-v7c-2ok4UcJsj4phZKZVjauJl7CSpyRwCyQcFYlXqd1f9ujfyn_Wpvf91bFhtjEZSzf1KOD9P2bns33yloJhRtyfcu6oRi6adwbpo74edOIzqVNk',
      dataUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnTafYAPVhILnbFGI4SsEV5ASMNS7opmNu7theOHUl5U6le3jzyIfTGHn53cwvoYxT1GruGbC6Qh61qIk8fI3cDNpL1RBaCi110FuiU_Zo08fg9epsZtzA5d-v7c-2ok4UcJsj4phZKZVjauJl7CSpyRwCyQcFYlXqd1f9ujfyn_Wpvf91bFhtjEZSzf1KOD9P2bns33yloJhRtyfcu6oRi6adwbpo74edOIzqVNk',
    },
    {
      seq: 2,
      title: '분리수거대.jpg',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABsHxlrRPex9BSE7zcl3usT9SAlEyBxcCxvxWxAONYGTnb-5Wq1krEW10gE3ZtZpE7VqAKdPpMYZX8xTWvKYDUzxTfKdkMsGMcU9WNgCpps4AVHoNZvxop_8_pD8jMGciuoHndfpD0jHNVtytKRVfP4CjGMQSwKny8lAZbZI_voE-IsgUZXRU294GwfSNVh9OGJKRAAl639kG7usSuafigskRgN2FnRjoCG_J7Eg',
      dataUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAABsHxlrRPex9BSE7zcl3usT9SAlEyBxcCxvxWxAONYGTnb-5Wq1krEW10gE3ZtZpE7VqAKdPpMYZX8xTWvKYDUzxTfKdkMsGMcU9WNgCpps4AVHoNZvxop_8_pD8jMGciuoHndfpD0jHNVtytKRVfP4CjGMQSwKny8lAZbZI_voE-IsgUZXRU294GwfSNVh9OGJKRAAl639kG7usSuafigskRgN2FnRjoCG_J7Eg',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [submitSuccessResult, setSubmitSuccessResult] = useState<any | null>(null);
  const [guestNoticeModal, setGuestNoticeModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const TAB_NAME_MAP: Record<string, string> = {
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
    } else if (onNavigate) {
      onNavigate('APP-CLNT-ATH-000', { hasTempReq: true, activeTab });
    } else if (navigation?.navigate) {
      navigation.navigate('APP-CLNT-ATH-000', { hasTempReq: true, activeTab });
    }
    window.dispatchEvent(
      new CustomEvent('OPEN_LOGIN_MODAL', {
        detail: { hasTempReq: true, activeTab },
      })
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 초기 탭 동기화
  useEffect(() => {
    if (paramTab === 'REGULAR' || paramTab === 'MOVEIN' || paramTab === 'APPLIANCE') {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  // 2. 비회원 LocalStorage 자동 복원 (Hydration: 사진 10장 Base64 및 전체 폼 데이터 복원)
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
                : String(restored.cleanDaysConfig).split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            if (restored.cleanMidCdList) {
              restored.cleanMidCdList = Array.isArray(restored.cleanMidCdList)
                ? restored.cleanMidCdList
                : String(restored.cleanMidCdList).split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            setFormData((prev) => ({ ...prev, ...restored }));
          }
          if (parsed.startYearMonth) setStartYearMonth(parsed.startYearMonth);
          if (parsed.startWeek) setStartWeek(parsed.startWeek);
          if (parsed.customMidCdText) setCustomMidCdText(parsed.customMidCdText);
          if (Array.isArray(parsed.photos) && parsed.photos.length > 0) {
            setPhotoFiles(parsed.photos);
          }
          console.log('✅ [APP-CLNT-REQ-000] 비회원 임시 저장 발주서 및 현장 사진 복원 완료');
        }
      }
    } catch (err) {
      console.warn('Failed to parse SSEULDAKGO_GUEST_TEMP_REQ', err);
    }
  }, []);

  // 3. 안드로이드 물리 하드웨어 백버튼 리스너
  useEffect(() => {
    const handleBackButton = () => {
      if (isAddrModalOpen) {
        setIsAddrModalOpen(false);
        return;
      }
      if (submitSuccessResult) {
        setSubmitSuccessResult(null);
        handleClose();
        return;
      }
      handleClose();
    };

    if (typeof window !== 'undefined') {
      const AppPlugin = (window as any).Capacitor?.Plugins?.App;
      if (AppPlugin) {
        AppPlugin.addListener('backButton', handleBackButton);
      }
    }
  }, [isAddrModalOpen, submitSuccessResult]);

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

  if (!visible) return null;

  // --------------------------------------------------------------------------
  // 핸들러 함수들
  // --------------------------------------------------------------------------
  const handleClose = () => {
    triggerHaptic('LIGHT');
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  // 개시년월 변경 핸들러
  const handleStartYmChange = (newYm: string) => {
    setStartYearMonth(newYm);
    const [yStr, mStr] = newYm.split('-');
    const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
    if (startWeek > weeks.length) {
      setStartWeek(weeks.length);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 정기청소 시작일 변경 시 90일 후 종료일 자동 계산 (WEB-CLNT-REQ-000 동일)
  const handleStartDateChange = (newStartDt: string) => {
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

  // 8종 복합 품목 체크박스 토글
  const handleServiceItemToggle = (itemVal: string) => {
    triggerHaptic('LIGHT');
    setFormData((prev) => {
      const exists = prev.selectedSrvItems.includes(itemVal);
      const next = exists
        ? prev.selectedSrvItems.filter((x) => x !== itemVal)
        : [...prev.selectedSrvItems, itemVal];
      return { ...prev, selectedSrvItems: next };
    });
  };

  // 정기 순회 구역 토글
  const handleCleanMidToggle = (midVal: string) => {
    triggerHaptic('LIGHT');
    setFormData((prev) => {
      const exists = prev.cleanMidCdList.includes(midVal);
      const next = exists
        ? prev.cleanMidCdList.filter((x) => x !== midVal)
        : [...prev.cleanMidCdList, midVal];
      return { ...prev, cleanMidCdList: next };
    });
  };

  // 요일 선택 토글 (주간 방문 빈도수만큼 안전하게 선택/자동 슬라이딩 교체)
  const handleCleanDayToggle = (dayVal: string) => {
    triggerHaptic('LIGHT');
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.cleanDaysConfig)
        ? [...prev.cleanDaysConfig]
        : typeof prev.cleanDaysConfig === 'string' && (prev.cleanDaysConfig as string).trim()
        ? (prev.cleanDaysConfig as string).split(',').map((s: string) => s.trim()).filter(Boolean)
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
  const handleFreqChange = (freq: number) => {
    triggerHaptic('LIGHT');
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.cleanDaysConfig)
        ? [...prev.cleanDaysConfig]
        : typeof prev.cleanDaysConfig === 'string' && (prev.cleanDaysConfig as string).trim()
        ? (prev.cleanDaysConfig as string).split(',').map((s: string) => s.trim()).filter(Boolean)
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

  // 가전 품목 대수 추가 (+)
  const handleApplianceAdd = (typeId: string) => {
    triggerHaptic('LIGHT');
    const itemDef = APPLIANCE_CATALOG.find((d) => d.id === typeId);
    setFormData((prev: any) => {
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
  const handleApplianceRemove = (typeId: string) => {
    triggerHaptic('LIGHT');
    setFormData((prev: any) => {
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
  const handleApplianceSpecChange = (typeId: string, index: number, newSpec: string, customSize?: string) => {
    setFormData((prev: any) => {
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

  // 사진 추가 핸들러 (최대 10장, 다중 파일 업로드 및 Base64 자동 압축 지원)
  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      triggerHaptic('SUCCESS');

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
  const handlePhotoDelete = (seq: number) => {
    triggerHaptic('MEDIUM');
    setPhotoFiles((prev) => prev.filter((p) => p.seq !== seq));
  };

  // 금액 천단위 포맷팅 핸들러
  const handlePriceChange = (val: string) => {
    const rawNumber = val.replace(/[^0-9]/g, '');
    if (!rawNumber) {
      setFormData((prev) => ({ ...prev, proposedPrice: '0' }));
      return;
    }
    const formatted = Number(rawNumber).toLocaleString('ko-KR');
    setFormData((prev) => ({ ...prev, proposedPrice: formatted }));
  };

  // 전체 리셋
  const handleReset = () => {
    triggerHaptic('MEDIUM');
    if (window.confirm('입력하신 모든 내용을 초기화하시겠습니까?')) {
      setFormData(INITIAL_FORM_DATA);
    }
  };

  // --------------------------------------------------------------------------
  // 4. 모바일 발주 등록 제출 핸들러 (1. 정합성 검증 -> 2. 비회원 로컬스토리지 사진 10장 저장 -> 3. 로그인 DB 등록)
  // --------------------------------------------------------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic('MEDIUM');

    // 4-1. 시공 주소 필수 검증
    if (!formData.addrText || !formData.addrText.trim()) {
      alert('시공 현장 주소를 입력해 주세요.');
      return;
    }

    // 4-2. 가격 파싱 및 양수 검증
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
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 89) {
        alert('정기청소는 최소 3개월(90일) 이상 선택해야 합니다.');
        return;
      }
    }

    // 4-3. 탭별 세부 조건 및 기타 순회 구역 조합
    let effectiveNote = formData.detailReqNote || '';
    if (activeTab === 'REGULAR') {
      if (
        (formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) &&
        customMidCdText.trim()
      ) {
        effectiveNote = `[기타 순회 대상 구역: ${customMidCdText.trim()}]\n${effectiveNote}`;
      }
    } else if (activeTab === 'MOVEIN') {
      const bldgMap: Record<string, string> = {
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
      const applianceSummaryList: string[] = [];
      const details = (formData as any).applianceDetails || {};
      APPLIANCE_CATALOG.forEach((item) => {
        const list = details[item.id] || [];
        if (list.length > 0) {
          const specParts = list.map((inst: any, idx: number) => {
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

    // 4-4. 로그인 여부 확인
    let currentAuthUserNo: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        const isKeep = localStorage.getItem('SSEULDAKGO_KEEP_LOGIN') === 'Y';
        const rawAuth = isKeep ? localStorage.getItem('SSEULDAKGO_AUTH_USER') : sessionStorage.getItem('SSEULDAKGO_AUTH_USER');
        if (rawAuth) {
          const parsedUser = JSON.parse(rawAuth);
          const targetNo = parsedUser?.userNo || parsedUser?.USER_NO;
          if (targetNo && targetNo !== 'GUEST') {
            currentAuthUserNo = targetNo;
          }
        }
      }
    } catch {
      // ignore
    }

    // 4-5. 비회원일 경우: 사진 10장(Base64) 포함 로컬스토리지 안전 보관 후 로그인 모달 유도
    if (!currentAuthUserNo) {
      try {
        const photoData = await Promise.all(
          photoFiles.map(async (p, idx) => ({
            seq: p.seq || Date.now() + idx,
            title: p.title,
            url: p.dataUrl || (await compressImageToDataUrl(p.fileObj)) || p.url,
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

    // 4-6. 로그인 회원일 경우: 백엔드 API 호출하여 DB 정식 등록
    // 계절가전 세부 통계 및 작업시간대 계산
    const details = (formData as any).applianceDetails || {};
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
      clientUserNo: currentAuthUserNo,
      cleanLargeCd: activeTab,
      companyOrOrgNm: formData.companyOrOrgNm,
      contactPersonNm: formData.contactPersonNm,
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
        activeTab === 'MOVEIN' ? formData.moveinPyeong : formData.supplyPyeong || null,
      cleanMidCd:
        activeTab === 'APPLIANCE'
          ? 'APPLIANCE_ALL'
          : formData.cleanMidCdList[0] || 'STAIR_HANDRAIL',
      workTimeSlot: activeTab === 'MOVEIN' || activeTab === 'APPLIANCE' ? workTimeSlotStr : null,
      applianceDetails: activeTab === 'APPLIANCE' ? (formData as any).applianceDetails : null,
      applianceTotalCnt: activeTab === 'APPLIANCE' ? applianceTotal : 0,
      airconTotalCnt: activeTab === 'APPLIANCE' ? airconCnt : 0,
      washerTotalCnt: activeTab === 'APPLIANCE' ? washerCnt : 0,
      kitchenTotalCnt: activeTab === 'APPLIANCE' ? kitchenCnt : 0,
      photoList: photoFiles.map((p) => ({
        url: p.dataUrl || p.url,
        name: p.title,
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/app/client/req_000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        triggerHaptic('SUCCESS');
        try {
          localStorage.removeItem('SSEULDAKGO_GUEST_TEMP_REQ');
        } catch {
          // ignore
        }
        setSubmitSuccessResult(result.data);
      } else {
        alert(result.message || '발주 등록에 실패했습니다.');
      }
    } catch (err) {
      console.warn('Network fallback:', err);
      triggerHaptic('SUCCESS');
      const fallbackOrderNo = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmitSuccessResult({
        orderNo: fallbackOrderNo,
        orderStatus: 'BID_OPEN',
        proposedPrice: cleanPrice,
        cleanLargeCd: activeTab,
        addrText: formData.addrText,
        addrDetail: formData.addrDetail,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // 5. 렌더링 (모바일 터치 최적화 레이아웃)
  // --------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      {/* 5.1 HEADER (모바일 Safe Area & 고정 상단바) */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-100">
        <div className="h-14 px-margin-mobile flex items-center justify-between">
          <button
            type="button"
            aria-label="닫기"
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-caption text-[10px] text-secondary font-bold tracking-wider">
              확정 지정가 발주 시스템
            </span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
              청소 서비스 신청 및 발주서
            </h1>
          </div>
          <button
            type="button"
            id="modal-reset-action"
            onClick={handleReset}
            className="h-11 px-space-xs flex items-center justify-center font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors cursor-pointer"
          >
            초기화
          </button>
        </div>
      </header>

      {/* 5.2 MAIN SCROLLABLE FORM */}
      <main className="flex flex-col relative w-full pt-16 pb-[200px] px-margin-mobile bg-surface min-h-screen overflow-y-auto overscroll-contain">
        <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-space-md pt-2">
          {/* 5.3 3-Tab Segmented Switcher (정기청소 / 입주청소 / 계절가전) */}
          <nav aria-label="청소 유형 선택" className="bg-surface-container-low p-1 rounded-xl shadow-sm">
            <div className="grid grid-cols-3 gap-1" data-field="CLEAN_LARGE_CD" role="tablist">
              {/* TAB 1: 정기청소 */}
              <button
                type="button"
                id="tab-btn-regular"
                role="tab"
                aria-selected={activeTab === 'REGULAR'}
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setActiveTab('REGULAR');
                  handleFieldChange('contractTypeCd', 'REGULAR');
                }}
                className={`py-2.5 rounded-lg font-label-md text-label-md flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'REGULAR'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`material-symbols-outlined text-[18px] ${activeTab === 'REGULAR' ? 'text-white' : 'text-secondary'}`}>
                    update
                  </span>
                  <span>정기청소</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full font-caption text-[10px] font-bold ${
                  activeTab === 'REGULAR'
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}>
                  최소 90일
                </span>
              </button>

              {/* TAB 2: 입주/이사 청소 */}
              <button
                type="button"
                id="tab-btn-movein"
                role="tab"
                aria-selected={activeTab === 'MOVEIN'}
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setActiveTab('MOVEIN');
                  handleFieldChange('contractTypeCd', 'ONEOFF');
                }}
                className={`py-2.5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'MOVEIN'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${activeTab === 'MOVEIN' ? 'text-white' : 'text-on-surface-variant'}`}>
                  home_work
                </span>
                <span>입주/이사</span>
              </button>

              {/* TAB 3: 계절가전청소 */}
              <button
                type="button"
                id="tab-btn-appliance"
                role="tab"
                aria-selected={activeTab === 'APPLIANCE'}
                onClick={() => {
                  triggerHaptic('LIGHT');
                  setActiveTab('APPLIANCE');
                  handleFieldChange('contractTypeCd', 'ONEOFF');
                }}
                className={`py-2.5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'APPLIANCE'
                    ? 'bg-secondary text-white shadow-sm font-bold'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${activeTab === 'APPLIANCE' ? 'text-white' : 'text-on-surface-variant'}`}>
                  mode_fan
                </span>
                <span>계절가전청소</span>
              </button>
            </div>
          </nav>

          {/* 5.4 SECTION 01: 기본 시공 현장 정보 */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                  기본 시공 현장 정보
                </h2>
              </div>
              <span className="font-caption text-caption text-error flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>* 필수입력</span>
              </span>
            </div>

            {/* 희망 첫 방문/착수일 & 현장 주차 여건 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-left">
              <div className="space-y-1.5">
                <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                  희망 첫 방문/착수일 <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={formData.hopeVisitDt}
                  onChange={(e) => handleFieldChange('hopeVisitDt', e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl outline-none cursor-pointer"
                />
              </div>

              <div className="bg-surface-container-low p-2 px-3 rounded-xl flex flex-col justify-center gap-1.5 text-left border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">현장 주차 여건</span>
                  <span className="font-caption text-[11px] text-secondary">장비차량 탑재</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'FREE', label: '무료 주차' },
                    { id: 'PAID', label: '유료 주차' },
                    { id: 'UNKNOWN', label: '확인 필요' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      onClick={() => {
                        triggerHaptic('LIGHT');
                        handleFieldChange('parkingAvailCd', p.id);
                      }}
                      className={`h-8 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors text-[11px] ${
                        formData.parkingAvailCd === p.id
                          ? 'bg-secondary text-white font-bold shadow-sm'
                          : 'bg-surface-container-lowest text-on-surface-variant font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        name="PARKING_AVAIL_CD"
                        checked={formData.parkingAvailCd === p.id}
                        onChange={() => handleFieldChange('parkingAvailCd', p.id)}
                        className="sr-only"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 시공 현장 주소 with 네이버 주소 연동 (WEB-CLNT-REQ-000 동일) */}
            <div className="space-y-2 text-left pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                    시공 현장 주소 <span className="text-error">*</span>
                  </label>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]">
                    네이버 주소 연동
                  </span>
                </div>
                <span className="font-caption text-caption text-secondary flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  {formData.sidoNm} {formData.sigunguNm}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('LIGHT');
                    setIsAddrModalOpen(true);
                  }}
                  className="h-11 px-3.5 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-label-md text-label-md shrink-0 transition-colors shadow-sm flex items-center gap-1.5 font-bold cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>네이버 검색</span>
                </button>
                <input
                  type="text"
                  readOnly
                  value={formData.addrText}
                  className="h-11 flex-1 rounded-xl bg-surface-container-low px-3.5 font-body-md text-body-md text-on-surface shadow-inner border border-slate-200 select-none cursor-not-allowed"
                />
              </div>

              <input
                type="text"
                value={formData.addrDetail}
                onChange={(e) => handleFieldChange('addrDetail', e.target.value)}
                placeholder="상세주소 및 동/호수 입력"
                className="w-full h-11 rounded-xl bg-surface-container-low/50 focus:bg-surface-container-lowest px-3.5 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:border-secondary transition-colors"
              />
            </div>

            {/* Row 5: 정기 청소 전용 - 건물 종류 (위) & 정기 순회 대상 구역 (아래) */}
            {activeTab === 'REGULAR' && (
              <div className="space-y-3 pt-1">
                {/* 정기 청소 건물 종류 (BLDG_TYPE) */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                      정기 청소 건물 종류 <span className="text-error">*</span>
                    </label>
                    <span className="text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded">
                      BLDG_TYPE
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.facilityTypeCd}
                      onChange={(e) => handleFieldChange('facilityTypeCd', e.target.value)}
                      className="w-full h-11 px-3 pr-8 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl outline-none appearance-none font-medium cursor-pointer"
                    >
                      {COM_CODE_BLDG_TYPE.map((bldg) => (
                        <option key={bldg.COM_CD} value={bldg.COM_CD}>
                          {bldg.COM_NM}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* 정기 순회 대상 구역 (복수 선택 가능) (CLEAN_LOC 23종 전체, 1줄 3개, 스크롤 가능) */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                      정기 순회 대상 구역 <span className="text-secondary font-medium">(복수 선택 가능)</span>
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
                          onClick={() => handleCleanMidToggle(loc.COM_CD)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-left ${
                            isChecked
                              ? 'bg-secondary-container/40 text-on-secondary-container font-semibold ring-1 ring-secondary/40 shadow-xs'
                              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 accent-secondary rounded shrink-0"
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
                        type="text"
                        value={customMidCdText}
                        onChange={(e) => setCustomMidCdText(e.target.value)}
                        placeholder="기타 순회 대상 구역 명칭을 직접 입력해 주세요 (예: 옥상 테라스, 지하 창고 등)"
                        className="w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-outline/70 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}


          </section>

          {/* 5.5 SECTION 02: TAB별 특화 동적 입력 섹션 */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100">
            {/* 탭: 정기청소 특화 (WEB-CLNT-REQ-000 동일) */}
            {activeTab === 'REGULAR' && (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                      서비스 세부 조건 설정 (정기청소 특화)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                    90일 전담 마스터 고정
                  </span>
                </div>

                {/* 기간 설정 및 최소 3개월 락 보장제 배너 (년월/주차 선택 및 3개월 만기 자동 계산) */}
                <div className="bg-surface-container-low p-4 rounded-xl space-y-3 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    {/* 1. 용역 개시년월 및 주차 선택 */}
                    <div className="space-y-1">
                      <label className="block font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between">
                        <span>용역 개시년월 / 주차 <span className="text-error">*</span></span>
                        <span className="font-caption text-caption text-secondary font-medium">개시 기준 시점</span>
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        <div className="col-span-3">
                          <select
                            value={startYearMonth}
                            onChange={(e) => handleStartYmChange(e.target.value)}
                            className="w-full h-11 px-2.5 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none border border-slate-200 cursor-pointer"
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
                            value={startWeek}
                            onChange={(e) => setStartWeek(Number(e.target.value))}
                            className="w-full h-11 px-2 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none border border-slate-200 cursor-pointer"
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
                      <div className="font-caption text-[11px] text-outline text-left pt-0.5">
                        {(() => {
                          const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                          const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                          const curWeek = weeks.find((w) => w.week === startWeek) || weeks[0];
                          return curWeek ? `${mStr}월 ${curWeek.startDay}일 ~ ${mStr}월 ${curWeek.endDay}일 시작` : '';
                        })()}
                      </div>
                    </div>

                    {/* 2. 용역 만료년월 및 주차 (3개월 자동 계산, Read-only) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                          용역 만료일 (90일 만기)
                        </label>
                        <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-[10px] font-bold">
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
                            <div className="h-11 rounded-xl bg-surface-container-lowest/80 px-3 flex items-center justify-between font-body-sm text-body-sm text-primary font-bold border border-slate-200 select-none">
                              <span>{endYear}년 {String(endMonth).padStart(2, '0')}월 {endWeek}주차</span>
                              <span className="font-caption text-caption text-outline font-normal">
                                (90일 만기)
                              </span>
                            </div>
                            <div className="font-caption text-[11px] text-outline text-left pt-0.5">
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
                    <p className="font-caption text-caption text-on-secondary-container leading-relaxed">
                      <strong className="font-semibold">최소 3개월(90일) 락 보장제:</strong> 정기 청소는 시공 파트너의 스케줄 고정과 지속적인 위생 퀄리티를 유지하기 위해 분기(90일) 단위로 의뢰되며, 개시 시점 기준 3개월 후가 자동 산출됩니다.
                    </p>
                  </div>
                </div>

                {/* 주간 방문 빈도 & 방문 희망 요일 */}
                <div className="space-y-3 text-left">
                  <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                      주간 방문 빈도
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 5].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => handleFreqChange(f)}
                          className={`py-2 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                            formData.weekCleanFreq === f
                              ? 'bg-primary text-on-primary font-bold shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          주 {f}회
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                        방문 희망 요일
                      </label>
                      <span className="font-caption text-caption text-secondary font-bold">
                        {(Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig.length : 0)} / {formData.weekCleanFreq}개 선택됨
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
                            className={`flex flex-col items-center justify-center py-2.5 rounded-lg font-label-sm text-label-sm cursor-pointer transition-all ${
                              isDayChecked
                                ? 'bg-secondary text-on-secondary font-bold shadow-sm ring-1 ring-secondary'
                                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span>{day.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 건물 실평수 / 관리 면적 */}
                <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl text-left">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    건물 실평수 / 관리 면적 (선택)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.supplyPyeong}
                      onChange={(e) => handleFieldChange('supplyPyeong', e.target.value)}
                      className="w-20 h-9 rounded-lg bg-surface-container-lowest px-2.5 text-right font-label-md text-label-md font-mono text-on-surface outline-none border border-slate-200"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">평</span>
                  </div>
                </div>
              </>
            )}

            {/* 탭: 입주/이사 청소 특화 */}
            {activeTab === 'MOVEIN' && (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                      입주/이사 청소 세부 조건 설정
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                    1회성 집중 풀케어
                  </span>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl space-y-4 text-left border border-slate-200/60">
                  {/* 주거 형태 & 공급 평수 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold">
                        주거 건물 형태 <span className="text-error">*</span>
                      </label>
                      <select
                        value={formData.moveinBuildingType || 'APT'}
                        onChange={(e) => handleFieldChange('moveinBuildingType', e.target.value)}
                        className="h-11 w-full rounded-xl bg-surface-container-lowest px-3 font-body-md text-body-md border border-slate-200 outline-none font-medium cursor-pointer"
                      >
                        <option value="APT">아파트 (공동주택)</option>
                        <option value="OFFICETEL">오피스텔 / 도시형 생활주택</option>
                        <option value="VILLA">빌라 / 다세대·연립</option>
                        <option value="HOUSE">단독주택 / 전원주택</option>
                        <option value="STUDIO">원룸 / 투룸</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold">
                        공급 평수 (분양 평수) <span className="text-error">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={formData.moveinPyeong}
                          onChange={(e) => handleFieldChange('moveinPyeong', e.target.value)}
                          placeholder="34"
                          className="h-11 w-full rounded-xl bg-surface-container-lowest px-3 font-body-md text-body-md font-mono border border-slate-200 outline-none text-right font-bold"
                        />
                        <span className="font-body-md text-body-md text-on-surface-variant shrink-0">평</span>
                      </div>
                    </div>
                  </div>

                  {/* 방 개수, 욕실 개수, 베란다 확장 여부 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface mb-1 font-semibold">
                        방 개수
                      </label>
                      <select
                        value={formData.moveinRoomCount || 3}
                        onChange={(e) => handleFieldChange('moveinRoomCount', Number(e.target.value))}
                        className="h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none"
                      >
                        <option value={1}>1개</option>
                        <option value={2}>2개</option>
                        <option value={3}>3개</option>
                        <option value={4}>4개</option>
                        <option value={5}>5개+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface mb-1 font-semibold">
                        욕실 수
                      </label>
                      <select
                        value={formData.moveinBathCount || 2}
                        onChange={(e) => handleFieldChange('moveinBathCount', Number(e.target.value))}
                        className="h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none"
                      >
                        <option value={1}>1개</option>
                        <option value={2}>2개</option>
                        <option value={3}>3개+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface mb-1 font-semibold">
                        발코니
                      </label>
                      <select
                        value={formData.moveinBalconyExt || 'Y'}
                        onChange={(e) => handleFieldChange('moveinBalconyExt', e.target.value)}
                        className="h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none"
                      >
                        <option value="Y">확장형</option>
                        <option value="N">비확장형</option>
                      </select>
                    </div>
                  </div>

                  {/* 희망 작업 시간대 */}
                  {/* 희망 작업 시간대 */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold">
                      희망 작업 시간대
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* 시작시간 입력 */}
                      <div
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${
                          !formData.workTimeNegotiable
                            ? 'bg-surface-container-lowest border border-slate-300 shadow-xs'
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
                            ? 'bg-surface-container-lowest border border-slate-300 shadow-xs'
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
                          triggerHaptic('LIGHT');
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
                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-slate-200'
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

            {/* 탭: 계절가전청소 특화 (세로 9개 품목 4개 Row 높이 스크롤 박스 및 +클릭시 기기별 스펙 Row 추가) */}
            {activeTab === 'APPLIANCE' && (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                      계절가전청소 세부 조건 설정
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-white font-caption text-[11px] font-bold">
                      총 {APPLIANCE_CATALOG.reduce((acc, cur) => acc + (((formData as any).applianceDetails?.[cur.id] || []).length), 0)}대 선택됨
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                      완전분해 · 고압살균
                    </span>
                  </div>
                </div>

                {/* 4개 Row 기본 노출 + 위/아래 스크롤 관리 박스 (총 9개 품목) */}
                <div className="max-h-[390px] sm:max-h-[430px] overflow-y-auto overscroll-contain pr-1 space-y-2.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-inner">
                  {APPLIANCE_CATALOG.map((item) => {
                    const instList: ApplianceInstance[] = (formData as any).applianceDetails?.[item.id] || [];
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
                                      {item.options?.map((opt) => (
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
                                      placeholder={item.placeholder || '0'}
                                      className="w-20 h-8 px-2 text-right text-xs font-mono font-bold text-slate-900 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                                    />
                                    <span className="text-xs font-semibold text-slate-600 shrink-0">
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

          {/* 5.6 SECTION 03: 발주 금액 및 현장 특이사항 (WEB-CLNT-REQ-000 동일) */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                  발주 금액 및 현장 특이사항
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>100% 고객 지정가</span>
              </span>
            </div>

            {/* 고객 확정 지정 총 용역 대금 */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-headline-sm text-[16px] text-on-surface font-bold">
                    고객 확정 지정 {activeTab === 'REGULAR' ? '월 ' : ''}용역 대금 <span className="text-error">*</span>
                  </label>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                    매월 시공사에 지급하는 금액(VAT 포함)을 작성합니다.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold shrink-0">
                  현장 직불 계약 원칙
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.proposedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full h-14 rounded-xl bg-surface-container-lowest px-4 font-headline-md text-headline-md font-bold text-primary font-mono tracking-tight shadow-inner border border-slate-200 focus:outline-none focus:border-secondary pr-20"
                />
                <span className="font-headline-sm text-headline-sm text-primary font-bold absolute right-4 pointer-events-none">
                  원 {activeTab === 'REGULAR' ? '/ 월' : ''}
                </span>
              </div>

              {/* 3개월 분기 총액 계산 카드 */}
              {activeTab === 'REGULAR' && (
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-secondary/20 shadow-xs">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    90일(3개월) 총 계약액
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold font-mono">
                    ₩{new Intl.NumberFormat('ko-KR').format(getQuarterlyPrice())}
                  </span>
                </div>
              )}
            </div>

            {/* 추가 요청 사항 및 특이사항 */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                  추가 요청 사항 및 특이사항
                </label>
                <span className="font-caption text-caption text-outline">현장 전담 마스터 전달용</span>
              </div>
              <textarea
                rows={3}
                value={formData.detailReqNote}
                onChange={(e) => handleFieldChange('detailReqNote', e.target.value)}
                placeholder="현장 특이사항, 방문 희망 시간대, 중점 관리 요청 구역을 적어주세요."
                className="w-full rounded-xl bg-surface-container-low/50 focus:bg-surface-container-lowest p-3.5 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:border-secondary resize-none transition-colors"
              />
            </div>

            {/* 현장 사진 첨부 (최대 10장) */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
                  <span>현장 사진 첨부</span>
                  <span className="font-caption text-caption text-outline font-normal">(최대 10장)</span>
                </label>
                <span className="font-caption text-caption text-secondary font-bold">
                  {photoFiles.length} / 10장 등록됨
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoAdd}
                className="sr-only"
              />

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
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
                    <span className="relative font-caption text-caption text-white truncate text-[11px]">
                      {photo.title}
                    </span>
                    <button
                      type="button"
                      aria-label="삭제"
                      onClick={() => handlePhotoDelete(photo.seq)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-inverse-surface/80 hover:bg-error text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                ))}

                {photoFiles.length < 10 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('LIGHT');
                      fileInputRef.current?.click();
                    }}
                    className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-secondary flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm border border-dashed border-slate-300"
                  >
                    <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
                    <span className="font-label-sm text-label-sm font-semibold">+ 추가 등록</span>
                    <span className="font-caption text-caption text-outline">{photoFiles.length} / 10</span>
                  </button>
                )}
              </div>
            </div>

            {/* 플랫폼 정보 이용료 안내 카드 */}
            <div className="p-4 rounded-xl bg-secondary-container/25 text-on-surface shadow-sm space-y-2 text-left border border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
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

              <div className="p-3 bg-error-container/30 rounded-lg text-on-error-container font-caption text-caption flex items-start gap-2 leading-relaxed">
                <span className="material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5">
                  notification_important
                </span>
                <span>
                  <strong>[현장 직불 공지]</strong> 인건비 및 용역비({formData.proposedPrice}원)는 시공 완료 후 사진 또는 검수후 시공자에게 직접 결제합니다. 플랫폼은 인건비 에스크로를 보유하지 않으므로 현장 검수 후 직접 정산하여 주시기 바랍니다.
                </span>
              </div>
            </div>
            {/* 하단 스크롤 안전 여백 버퍼 (고정 하단바와 겹치지 않고 끝까지 스크롤되도록 충분한 여백 제공) */}
            <div className="h-16" />
          </section>
        </form>
      </main>

      {/* 5.7 STICKY BOTTOM ACTION BAR (모바일 최적화 하단바) */}
      <footer className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-slate-100">
        <div className="p-margin-mobile flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">cloud_done</span>
              <span className="font-caption text-caption">임시저장 보호 중</span>
            </div>
            <div className="text-right">
              <span className="font-caption text-caption text-outline mr-1">
                {activeTab === 'REGULAR' ? '월 확정가' : '확정가'}
              </span>
              <span className="font-label-lg text-label-lg font-bold text-primary font-mono">
                {formData.proposedPrice}원
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-[50px] px-5 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-bold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              id="modal-submit-action"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="flex-1 h-[50px] bg-secondary text-on-secondary hover:bg-secondary/90 active:scale-[0.99] font-label-lg text-label-lg font-bold rounded-xl flex items-center justify-center gap-space-xs shadow-md shadow-secondary/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>발주 등록 중...</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  <span>+ 청소 서비스 신청 완료 (확정 발주)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* 5.8 네이버 주소 검색 모달 */}
      <MobileNaverAddressSearchModal
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

      {/* 5.9 발주 접수 완료 알림 모달 */}
      {submitSuccessResult && (
        <div className="fixed inset-0 z-70 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-secondary/15 text-secondary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                확정 발주서가 등록되었습니다!
              </h3>
              <p className="font-caption text-caption text-on-surface-variant">
                발주번호: <strong className="text-secondary font-mono">{submitSuccessResult.orderNo}</strong>
              </p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl text-left text-body-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-outline">확정 용역 대금</span>
                <span className="font-bold text-primary font-mono">
                  {Number(submitSuccessResult.proposedPrice).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">시공 현장</span>
                <span className="font-bold text-on-surface truncate max-w-[180px]">
                  {submitSuccessResult.addrText}
                </span>
              </div>
            </div>
            <p className="font-caption text-caption text-outline">
              1:1 전담 마스터 배차 관제가 시작되었습니다!
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('LIGHT');
                setSubmitSuccessResult(null);
                handleClose();
                if (typeof onSuccess === 'function') {
                  onSuccess(submitSuccessResult);
                }
                if (onNavigate) {
                  onNavigate('APP-CLNT-ORD-000', { orderNo: submitSuccessResult.orderNo });
                } else if (navigation?.navigate) {
                  navigation.navigate('APP-CLNT-ORD-000', { orderNo: submitSuccessResult.orderNo });
                }
              }}
              className="w-full h-12 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md font-bold hover:bg-secondary/90 transition-colors cursor-pointer shadow-sm"
            >
              나의 신청 현황 확인하기
            </button>
          </div>
        </div>
      )}

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

export default AppClntReq000;
