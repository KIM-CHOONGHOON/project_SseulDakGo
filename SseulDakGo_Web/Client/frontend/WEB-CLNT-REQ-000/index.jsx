import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ============================================================================
 * [프론트엔드 모달 화면]
 * 화면 ID: WEB-CLNT-REQ-000
 * 한글 화면명: 청소 서비스 신청 및 발주서 작성 (고객 지정가 확정 발주 모달)
 * 파일 경로: SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx
 * 연동 백엔드 API: POST /api/web/client/req_000
 * ============================================================================
 */

// 네이버 주소 검색 팝업 모달
function NaverAddressSearchModal({ isOpen, onClose, onSelectAddress }) {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = useCallback(async (q) => {
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

  // 모달이 처음 열릴 때(isOpen 변경 시)만 1회 초기화 및 초기 검색 수행 (키보드 입력 중 재실행 방지)
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
      }, 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] bg-inverse-surface/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-surface-container-low border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-xs">N</span>
            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">네이버 지도 주소 검색</h3>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]">
              실시간 지오코딩
            </span>
          </div>
          <button onClick={onClose} type="button" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 검색 입력창 */}
        <div className="p-4 bg-white border-b border-slate-100 flex gap-2">
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
              placeholder="도로명, 건물명, 지번 입력 (예: 삼혜빌딩, 토당로 105)"
              className="w-full h-11 pl-3.5 pr-8 rounded-xl bg-surface-container-low text-[14px] outline-none border border-transparent focus:border-[#03C75A] focus:bg-white transition-all font-medium"
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
            className="px-5 h-11 rounded-xl bg-[#03C75A] hover:bg-[#02b350] active:scale-95 text-white font-bold text-[14px] flex items-center justify-center shrink-0 shadow-sm transition-all"
          >
            검색
          </button>
        </div>

        {/* 추천 검색어 칩 */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto text-[11px] bg-slate-50 border-b border-slate-100">
          <span className="shrink-0 text-slate-400 font-medium">추천:</span>
          {['삼혜빌딩', '마두동 802-1', '토당로 105', '화신로 260', '테헤란로 152', '일산로 200'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setKeyword(chip);
                handleSearch(chip);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#03C75A] text-slate-700 whitespace-nowrap transition-colors shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 검색 결과 목록 */}
        <div className="max-h-[320px] overflow-y-auto p-4 space-y-2 bg-slate-50/50">
          {isLoading ? (
            <div className="py-10 text-center text-slate-400 text-xs">네이버 주소 검색 중...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
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
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              검색 결과가 없습니다. 도로명이나 건물명을 정확히 입력해 주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// TB_COM_CODE 조회 공통 코드 (BLDG_TYPE, CLEAN_LOC)
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
  const [guestNoticeModal, setGuestNoticeModal] = useState({
    isOpen: false,
    tabName: '',
    photoCount: 0,
  });

  const TAB_NAME_MAP = {
    REGULAR: '정기청소',
    MOVEIN: '입주청소',
    APPLIANCE: '계절가전청소',
  };

  const handleConfirmGuestNotice = () => {
    setGuestNoticeModal({ isOpen: false, tabName: '', photoCount: 0 });
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

        // 브라우저 alert() 대신 도메인명(localhost:3000 내용:) 없는 커스텀 안심 안내 모달 표시
        const currentTabName = TAB_NAME_MAP[activeTab] || '청소';
        setGuestNoticeModal({
          isOpen: true,
          tabName: currentTabName,
          photoCount: photoData.length,
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
                                ? 'bg-secondary text-on-secondary font-bold shadow-sm'
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

