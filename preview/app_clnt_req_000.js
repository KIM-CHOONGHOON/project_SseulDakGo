(function() {
const { useState, useEffect, useCallback, useRef } = window.React;
const React = window.React;
// 햅틱 피드백 헬퍼
function triggerHaptic(style = 'LIGHT') {
    try {
        if (typeof window !== 'undefined') {
            const Haptics = window.Capacitor?.Plugins?.Haptics;
            if (Haptics) {
                if (style === 'SUCCESS') {
                    Haptics.notification({ type: 'SUCCESS' }).catch(() => { });
                }
                else {
                    Haptics.impact({ style }).catch(() => { });
                }
                return;
            }
            if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
                navigator.vibrate(style === 'HEAVY' ? 40 : 15);
            }
        }
    }
    catch {
        // 햅틱 미지원 무시
    }
}
function MobileNaverAddressSearchModal({ isOpen, onClose, onSelectAddress, }) {
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef(null);
    const handleSearch = useCallback(async (q) => {
        const targetQ = String(q !== undefined ? q : (inputRef.current?.value || keyword)).trim();
        if (!targetQ)
            return;
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
                }
                else {
                    setSearchResults([]);
                }
            }
        }
        catch (err) {
            console.warn('Address search failed', err);
        }
        finally {
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
    if (!isOpen)
        return null;
    return (React.createElement("div", { "aria-modal": "true", className: "fixed inset-0 z-70 bg-inverse-surface/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in", onClick: (e) => {
            if (e.target === e.currentTarget)
                onClose();
        }, role: "dialog" },
        React.createElement("div", { className: "relative w-full max-w-lg bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 pb-safe animate-in slide-in-from-bottom duration-200" },
            React.createElement("div", { className: "p-4 bg-surface-container-low border-b border-slate-200 flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("span", { className: "w-6 h-6 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-xs" }, "N"),
                    React.createElement("h3", { className: "font-headline-sm text-[16px] text-on-surface font-bold" }, "\uB124\uC774\uBC84 \uC9C0\uB3C4 \uC8FC\uC18C \uAC80\uC0C9"),
                    React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]" }, "\uC2E4\uC2DC\uAC04 \uC9C0\uC624\uCF54\uB529")),
                React.createElement("button", { onClick: onClose, type: "button", className: "w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface cursor-pointer" },
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "close"))),
            React.createElement("div", { className: "p-3 bg-white border-b border-slate-100 flex gap-2" },
                React.createElement("div", { className: "relative flex-1" },
                    React.createElement("input", { ref: inputRef, type: "text", value: keyword, onChange: (e) => setKeyword(e.target.value), onKeyDown: (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e.currentTarget.value);
                            }
                        }, placeholder: "\uB3C4\uB85C\uBA85, \uAC74\uBB3C\uBA85, \uC9C0\uBC88 \uC785\uB825 (\uC608: \uC0BC\uD61C\uBE4C\uB529)", className: "w-full h-11 pl-3.5 pr-8 rounded-xl bg-surface-container-low text-[14px] outline-none border border-transparent focus:border-[#03C75A] font-medium" }),
                    keyword && (React.createElement("button", { type: "button", onClick: () => {
                            setKeyword('');
                            inputRef.current?.focus();
                        }, className: "absolute right-2.5 top-3 text-slate-400 hover:text-slate-600" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "cancel")))),
                React.createElement("button", { onClick: () => handleSearch(keyword), type: "button", className: "px-4 h-11 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-bold text-[14px] flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform" }, "\uAC80\uC0C9")),
            React.createElement("div", { className: "flex items-center gap-1.5 px-3.5 py-2 overflow-x-auto text-[11px] bg-slate-50 border-b border-slate-100" },
                React.createElement("span", { className: "shrink-0 text-slate-400 font-medium" }, "\uCD94\uCC9C:"),
                ['삼혜빌딩', '마두동 802-1', '토당로 105', '화신로 260', '테헤란로 152'].map((chip) => (React.createElement("button", { key: chip, type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setKeyword(chip);
                        handleSearch(chip);
                    }, className: "px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#03C75A] text-slate-700 whitespace-nowrap transition-colors shadow-xs" }, chip)))),
            React.createElement("div", { className: "max-h-[320px] overflow-y-auto p-3 space-y-2 bg-slate-50/50" }, isLoading ? (React.createElement("div", { className: "py-10 text-center text-slate-400 text-xs" }, "\uB124\uC774\uBC84 \uC8FC\uC18C \uAC80\uC0C9 \uC911...")) : searchResults.length > 0 ? (searchResults.map((item, idx) => (React.createElement("div", { key: idx, onClick: () => {
                    triggerHaptic('LIGHT');
                    onSelectAddress(item);
                    onClose();
                }, className: "p-3 rounded-xl bg-white border border-slate-200 hover:border-[#03C75A] hover:shadow-sm cursor-pointer transition-all text-left" },
                React.createElement("div", { className: "text-[13px] font-bold text-slate-800" }, item.roadAddress),
                item.jibunAddress && (React.createElement("div", { className: "text-[11px] text-slate-500 mt-0.5" },
                    "\uC9C0\uBC88: ",
                    item.jibunAddress)),
                item.bldNm && item.bldNm !== item.roadAddress && (React.createElement("div", { className: "text-[11px] text-[#1F497D] font-medium mt-0.5" },
                    "\uAC74\uBB3C: ",
                    item.bldNm)))))) : hasSearched ? (React.createElement("div", { className: "py-10 text-center text-slate-400 text-xs" }, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB3C4\uB85C\uBA85\uC774\uB098 \uAC74\uBB3C\uBA85\uC744 \uC815\uD655\uD788 \uC785\uB825\uD574 \uC8FC\uC138\uC694.")) : null))));
}
// ============================================================================
// TB_COM_CODE 공통 코드 (BLDG_TYPE, CLEAN_LOC)
// ============================================================================
const COM_CODE_BLDG_TYPE = [
    { COM_CD: 'VILLA', COM_NM: '빌라·다세대', SORT_ORD: 1 },
    { COM_CD: 'COMM_BLDG', COM_NM: '상가빌딩·근생', SORT_ORD: 2 },
    { COM_CD: 'OFFICE_BLDG', COM_NM: '오피스·사무실빌딩', SORT_ORD: 3 },
    { COM_CD: 'APT_COMPLEX', COM_NM: '아파트·주상복합', SORT_ORD: 4 },
    { COM_CD: 'STUDIO_ROOM', COM_NM: '원룸·오피스텔', SORT_ORD: 5 },
    { COM_CD: 'FACTORY_WH', COM_NM: '공장·지식산업센터', SORT_ORD: 6 },
    { COM_CD: 'ETC_BLDG', COM_NM: '기타 일반건물', SORT_ORD: 7 },
];
const COM_CODE_CLEAN_LOC = [
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
// 계절가전청소 총 9개 세부 품목 카탈로그 정의 (모바일 최적화)
const APPLIANCE_CATALOG = [
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
        if (startDay < 1)
            startDay = 1;
        let endDay = (w - 1) * 7 + (7 - firstDay);
        if (endDay > totalDays)
            endDay = totalDays;
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
// 브라우저 Canvas 기반 고해상도 이미지 압축 (최대 1024px, JPEG 0.75, 장당 약 80~120KB)
// -> 10장 업로드 시에도 localStorage 5MB 한도(약 1MB 사용) 내 안전하게 직렬화 저장 가능
function compressImageToDataUrl(file, maxWidth = 1024, quality = 0.75) {
    return new Promise((resolve) => {
        if (!file)
            return resolve('');
        if (typeof file === 'string' && file.startsWith('data:'))
            return resolve(file);
        if (typeof file === 'string' && file.startsWith('http'))
            return resolve(file);
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
                    }
                    else {
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
                }
                else {
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
function AppClntReq000({ visible = true, initialTab = 'REGULAR', onClose, onOpenLogin, onNavigate, navigation, route, onSuccess, }) {
    const paramTab = route?.params?.category || initialTab;
    const [activeTab, setActiveTab] = useState(paramTab === 'APPLIANCE' || paramTab === 'MOVEIN' ? paramTab : 'REGULAR');
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [startYearMonth, setStartYearMonth] = useState('2026-11');
    const [startWeek, setStartWeek] = useState(2);
    const [customMidCdText, setCustomMidCdText] = useState('');
    const [photoFiles, setPhotoFiles] = useState([
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
    const [submitSuccessResult, setSubmitSuccessResult] = useState(null);
    const [guestNoticeModal, setGuestNoticeModal] = useState({
        isOpen: false,
        message: '',
    });
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
        else if (onNavigate) {
            onNavigate('APP-CLNT-ATH-000', { hasTempReq: true, activeTab });
        }
        else if (navigation?.navigate) {
            navigation.navigate('APP-CLNT-ATH-000', { hasTempReq: true, activeTab });
        }
        window.dispatchEvent(new CustomEvent('OPEN_LOGIN_MODAL', {
            detail: { hasTempReq: true, activeTab },
        }));
    };
    const fileInputRef = useRef(null);
    // 1. 초기 탭 동기화
    useEffect(() => {
        if (paramTab === 'REGULAR' || paramTab === 'MOVEIN' || paramTab === 'APPLIANCE') {
            setActiveTab(paramTab);
        }
    }, [paramTab]);
    // 2. 비회원 LocalStorage 자동 복원 (Hydration: 사진 10장 Base64 및 전체 폼 데이터 복원)
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        try {
            const savedDraft = localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ');
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.activeTab)
                        setActiveTab(parsed.activeTab);
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
                    if (parsed.startYearMonth)
                        setStartYearMonth(parsed.startYearMonth);
                    if (parsed.startWeek)
                        setStartWeek(parsed.startWeek);
                    if (parsed.customMidCdText)
                        setCustomMidCdText(parsed.customMidCdText);
                    if (Array.isArray(parsed.photos) && parsed.photos.length > 0) {
                        setPhotoFiles(parsed.photos);
                    }
                    console.log('✅ [APP-CLNT-REQ-000] 비회원 임시 저장 발주서 및 현장 사진 복원 완료');
                }
            }
        }
        catch (err) {
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
            const AppPlugin = window.Capacitor?.Plugins?.App;
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
    if (!visible)
        return null;
    // --------------------------------------------------------------------------
    // 핸들러 함수들
    // --------------------------------------------------------------------------
    const handleClose = () => {
        triggerHaptic('LIGHT');
        if (onClose) {
            onClose();
        }
        else if (navigation?.goBack) {
            navigation.goBack();
        }
        else if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        }
    };
    // 개시년월 변경 핸들러
    const handleStartYmChange = (newYm) => {
        setStartYearMonth(newYm);
        const [yStr, mStr] = newYm.split('-');
        const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
        if (startWeek > weeks.length) {
            setStartWeek(weeks.length);
        }
    };
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    // 정기청소 시작일 변경 시 90일 후 종료일 자동 계산 (WEB-CLNT-REQ-000 동일)
    const handleStartDateChange = (newStartDt) => {
        if (!newStartDt)
            return;
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
    const handleServiceItemToggle = (itemVal) => {
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
    const handleCleanMidToggle = (midVal) => {
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
    const handleCleanDayToggle = (dayVal) => {
        triggerHaptic('LIGHT');
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
        triggerHaptic('LIGHT');
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
    // 가전 품목 대수 추가 (+)
    const handleApplianceAdd = (typeId) => {
        triggerHaptic('LIGHT');
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
        triggerHaptic('LIGHT');
        setFormData((prev) => {
            const currentDetails = prev.applianceDetails || {};
            const currentList = currentDetails[typeId] || [];
            if (currentList.length === 0)
                return prev;
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
            if (!currentList[index])
                return prev;
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
            triggerHaptic('SUCCESS');
            const newItems = await Promise.all(filesToAdd.map(async (file, idx) => {
                const dataUrl = await compressImageToDataUrl(file);
                return {
                    seq: Date.now() + idx,
                    title: file.name,
                    url: dataUrl || URL.createObjectURL(file),
                    dataUrl: dataUrl || URL.createObjectURL(file),
                    fileObj: file,
                };
            }));
            setPhotoFiles((prev) => [...prev, ...newItems]);
            e.target.value = '';
        }
    };
    // 사진 삭제
    const handlePhotoDelete = (seq) => {
        triggerHaptic('MEDIUM');
        setPhotoFiles((prev) => prev.filter((p) => p.seq !== seq));
    };
    // 금액 천단위 포맷팅 핸들러
    const handlePriceChange = (val) => {
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
    const handleSubmit = async (e) => {
        if (e)
            e.preventDefault();
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
                alert(`방문 희망 요일을 주간 방문 빈도(주 ${formData.weekCleanFreq}회)에 맞춰 ${formData.weekCleanFreq}개 선택해 주세요.\n(현재 ${safeDays.length}개 선택됨)`);
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
            if ((formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) &&
                customMidCdText.trim()) {
                effectiveNote = `[기타 순회 대상 구역: ${customMidCdText.trim()}]\n${effectiveNote}`;
            }
        }
        else if (activeTab === 'MOVEIN') {
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
        }
        else if (activeTab === 'APPLIANCE') {
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
                        }
                        else {
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
        let currentAuthUserNo = null;
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
        }
        catch {
            // ignore
        }
        // 4-5. 비회원일 경우: 사진 10장(Base64) 포함 로컬스토리지 안전 보관 후 로그인 모달 유도
        if (!currentAuthUserNo) {
            try {
                const photoData = await Promise.all(photoFiles.map(async (p, idx) => ({
                    seq: p.seq || Date.now() + idx,
                    title: p.title,
                    url: p.dataUrl || (await compressImageToDataUrl(p.fileObj)) || p.url,
                    dataUrl: p.dataUrl || (await compressImageToDataUrl(p.fileObj)) || p.url,
                })));
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
            }
            catch (err) {
                console.warn('Failed to save to localStorage', err);
                alert('로컬 저장소 용량 초과로 사진 일부를 저장할 수 없습니다. 사진 수를 줄여 다시 시도해 주세요.');
            }
            return;
        }
        // 4-6. 로그인 회원일 경우: 백엔드 API 호출하여 DB 정식 등록
        // 계절가전 세부 통계 및 작업시간대 계산
        const details = formData.applianceDetails || {};
        const airconCnt = (details.WALL_MOUNTED || []).length +
            (details.STAND || []).length +
            (details.CEILING_SYS || []).length;
        const washerCnt = (details.TUB_WASHER || []).length +
            (details.DRUM_WASHER || []).length +
            (details.DRYER || []).length;
        const kitchenCnt = (details.FRIDGE_STEAM || []).length +
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
            selectedSrvItems: activeTab === 'REGULAR'
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
            supplyPyeong: activeTab === 'MOVEIN' ? formData.moveinPyeong : formData.supplyPyeong || null,
            cleanMidCd: activeTab === 'APPLIANCE'
                ? 'APPLIANCE_ALL'
                : formData.cleanMidCdList[0] || 'STAIR_HANDRAIL',
            workTimeSlot: activeTab === 'MOVEIN' || activeTab === 'APPLIANCE' ? workTimeSlotStr : null,
            applianceDetails: activeTab === 'APPLIANCE' ? formData.applianceDetails : null,
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
                }
                catch {
                    // ignore
                }
                setSubmitSuccessResult(result.data);
            }
            else {
                alert(result.message || '발주 등록에 실패했습니다.');
            }
        }
        catch (err) {
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
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // --------------------------------------------------------------------------
    // 5. 렌더링 (모바일 터치 최적화 레이아웃)
    // --------------------------------------------------------------------------
    return (React.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen" },
        React.createElement("header", { className: "fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-100" },
            React.createElement("div", { className: "h-14 px-margin-mobile flex items-center justify-between" },
                React.createElement("button", { type: "button", "aria-label": "\uB2EB\uAE30", onClick: handleClose, className: "w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer" },
                    React.createElement("span", { className: "material-symbols-outlined text-[24px]" }, "close")),
                React.createElement("div", { className: "flex flex-col items-center" },
                    React.createElement("span", { className: "font-caption text-[10px] text-secondary font-bold tracking-wider" }, "\uD655\uC815 \uC9C0\uC815\uAC00 \uBC1C\uC8FC \uC2DC\uC2A4\uD15C"),
                    React.createElement("h1", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uCCAD\uC18C \uC11C\uBE44\uC2A4 \uC2E0\uCCAD \uBC0F \uBC1C\uC8FC\uC11C")),
                React.createElement("button", { type: "button", id: "modal-reset-action", onClick: handleReset, className: "h-11 px-space-xs flex items-center justify-center font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors cursor-pointer" }, "\uCD08\uAE30\uD654"))),
        React.createElement("main", { className: "flex flex-col relative w-full pt-16 pb-[200px] px-margin-mobile bg-surface min-h-screen overflow-y-auto overscroll-contain" },
            React.createElement("form", { onSubmit: handleSubmit, className: "flex flex-col w-full space-y-space-md pt-2" },
                React.createElement("nav", { "aria-label": "\uCCAD\uC18C \uC720\uD615 \uC120\uD0DD", className: "bg-surface-container-low p-1 rounded-xl shadow-sm" },
                    React.createElement("div", { className: "grid grid-cols-3 gap-1", "data-field": "CLEAN_LARGE_CD", role: "tablist" },
                        React.createElement("button", { type: "button", id: "tab-btn-regular", role: "tab", "aria-selected": activeTab === 'REGULAR', onClick: () => {
                                triggerHaptic('LIGHT');
                                setActiveTab('REGULAR');
                                handleFieldChange('contractTypeCd', 'REGULAR');
                            }, className: `py-2.5 rounded-lg font-label-md text-label-md flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${activeTab === 'REGULAR'
                                ? 'bg-secondary text-white shadow-sm font-bold'
                                : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}` },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'REGULAR' ? 'text-white' : 'text-secondary'}` }, "update"),
                                React.createElement("span", null, "\uC815\uAE30\uCCAD\uC18C")),
                            React.createElement("span", { className: `px-1.5 py-0.2 rounded-full font-caption text-[10px] font-bold ${activeTab === 'REGULAR'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-secondary-fixed text-on-secondary-fixed'}` }, "\uCD5C\uC18C 90\uC77C")),
                        React.createElement("button", { type: "button", id: "tab-btn-movein", role: "tab", "aria-selected": activeTab === 'MOVEIN', onClick: () => {
                                triggerHaptic('LIGHT');
                                setActiveTab('MOVEIN');
                                handleFieldChange('contractTypeCd', 'ONEOFF');
                            }, className: `py-2.5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-all cursor-pointer ${activeTab === 'MOVEIN'
                                ? 'bg-secondary text-white shadow-sm font-bold'
                                : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}` },
                            React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'MOVEIN' ? 'text-white' : 'text-on-surface-variant'}` }, "home_work"),
                            React.createElement("span", null, "\uC785\uC8FC/\uC774\uC0AC")),
                        React.createElement("button", { type: "button", id: "tab-btn-appliance", role: "tab", "aria-selected": activeTab === 'APPLIANCE', onClick: () => {
                                triggerHaptic('LIGHT');
                                setActiveTab('APPLIANCE');
                                handleFieldChange('contractTypeCd', 'ONEOFF');
                            }, className: `py-2.5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-all cursor-pointer ${activeTab === 'APPLIANCE'
                                ? 'bg-secondary text-white shadow-sm font-bold'
                                : 'bg-transparent text-on-surface-variant hover:bg-surface-container'}` },
                            React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'APPLIANCE' ? 'text-white' : 'text-on-surface-variant'}` }, "mode_fan"),
                            React.createElement("span", null, "\uACC4\uC808\uAC00\uC804\uCCAD\uC18C")))),
                React.createElement("section", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100" },
                    React.createElement("div", { className: "flex items-center justify-between pb-1 border-b border-slate-100" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "w-6 h-6 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "1"),
                            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uAE30\uBCF8 \uC2DC\uACF5 \uD604\uC7A5 \uC815\uBCF4")),
                        React.createElement("span", { className: "font-caption text-caption text-error flex items-center gap-0.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "check_circle"),
                            React.createElement("span", null, "* \uD544\uC218\uC785\uB825"))),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-left" },
                        React.createElement("div", { className: "space-y-1.5" },
                            React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface font-semibold" },
                                "\uD76C\uB9DD \uCCAB \uBC29\uBB38/\uCC29\uC218\uC77C ",
                                React.createElement("span", { className: "text-error" }, "*")),
                            React.createElement("input", { type: "date", value: formData.hopeVisitDt, onChange: (e) => handleFieldChange('hopeVisitDt', e.target.value), className: "w-full h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl outline-none cursor-pointer" })),
                        React.createElement("div", { className: "bg-surface-container-low p-2 px-3 rounded-xl flex flex-col justify-center gap-1.5 text-left border border-slate-200/60" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uD604\uC7A5 \uC8FC\uCC28 \uC5EC\uAC74"),
                                React.createElement("span", { className: "font-caption text-[11px] text-secondary" }, "\uC7A5\uBE44\uCC28\uB7C9 \uD0D1\uC7AC")),
                            React.createElement("div", { className: "grid grid-cols-3 gap-1.5" }, [
                                { id: 'FREE', label: '무료 주차' },
                                { id: 'PAID', label: '유료 주차' },
                                { id: 'UNKNOWN', label: '확인 필요' },
                            ].map((p) => (React.createElement("label", { key: p.id, onClick: () => {
                                    triggerHaptic('LIGHT');
                                    handleFieldChange('parkingAvailCd', p.id);
                                }, className: `h-8 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors text-[11px] ${formData.parkingAvailCd === p.id
                                    ? 'bg-secondary text-white font-bold shadow-sm'
                                    : 'bg-surface-container-lowest text-on-surface-variant font-medium'}` },
                                React.createElement("input", { type: "radio", name: "PARKING_AVAIL_CD", checked: formData.parkingAvailCd === p.id, onChange: () => handleFieldChange('parkingAvailCd', p.id), className: "sr-only" }),
                                React.createElement("span", null, p.label))))))),
                    React.createElement("div", { className: "space-y-2 text-left pt-1" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" },
                                    "\uC2DC\uACF5 \uD604\uC7A5 \uC8FC\uC18C ",
                                    React.createElement("span", { className: "text-error" }, "*")),
                                React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]" }, "\uB124\uC774\uBC84 \uC8FC\uC18C \uC5F0\uB3D9")),
                            React.createElement("span", { className: "font-caption text-caption text-secondary flex items-center gap-0.5" },
                                React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "my_location"),
                                formData.sidoNm,
                                " ",
                                formData.sigunguNm)),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("button", { type: "button", onClick: () => {
                                    triggerHaptic('LIGHT');
                                    setIsAddrModalOpen(true);
                                }, className: "h-11 px-3.5 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-label-md text-label-md shrink-0 transition-colors shadow-sm flex items-center gap-1.5 font-bold cursor-pointer active:scale-95" },
                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "search"),
                                React.createElement("span", null, "\uB124\uC774\uBC84 \uAC80\uC0C9")),
                            React.createElement("input", { type: "text", readOnly: true, value: formData.addrText, className: "h-11 flex-1 rounded-xl bg-surface-container-low px-3.5 font-body-md text-body-md text-on-surface shadow-inner border border-slate-200 select-none cursor-not-allowed" })),
                        React.createElement("input", { type: "text", value: formData.addrDetail, onChange: (e) => handleFieldChange('addrDetail', e.target.value), placeholder: "\uC0C1\uC138\uC8FC\uC18C \uBC0F \uB3D9/\uD638\uC218 \uC785\uB825", className: "w-full h-11 rounded-xl bg-surface-container-low/50 focus:bg-surface-container-lowest px-3.5 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:border-secondary transition-colors" })),
                    activeTab === 'REGULAR' && (React.createElement("div", { className: "space-y-3 pt-1" },
                        React.createElement("div", { className: "space-y-1.5 text-left" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface font-semibold" },
                                    "\uC815\uAE30 \uCCAD\uC18C \uAC74\uBB3C \uC885\uB958 ",
                                    React.createElement("span", { className: "text-error" }, "*")),
                                React.createElement("span", { className: "text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded" }, "BLDG_TYPE")),
                            React.createElement("div", { className: "relative" },
                                React.createElement("select", { value: formData.facilityTypeCd, onChange: (e) => handleFieldChange('facilityTypeCd', e.target.value), className: "w-full h-11 px-3 pr-8 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl outline-none appearance-none font-medium cursor-pointer" }, COM_CODE_BLDG_TYPE.map((bldg) => (React.createElement("option", { key: bldg.COM_CD, value: bldg.COM_CD }, bldg.COM_NM)))),
                                React.createElement("span", { className: "material-symbols-outlined absolute right-2.5 top-3 text-outline pointer-events-none text-[18px]" }, "expand_more"))),
                        React.createElement("div", { className: "space-y-1.5 text-left" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface font-semibold" },
                                    "\uC815\uAE30 \uC21C\uD68C \uB300\uC0C1 \uAD6C\uC5ED ",
                                    React.createElement("span", { className: "text-secondary font-medium" }, "(\uBCF5\uC218 \uC120\uD0DD \uAC00\uB2A5)")),
                                React.createElement("span", { className: "text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded" }, "CLEAN_LOC (23\uC885)")),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto p-2 bg-surface-container-low/40 rounded-xl border border-slate-200/70 shadow-inner" }, COM_CODE_CLEAN_LOC.map((loc) => {
                                const isChecked = formData.cleanMidCdList.includes(loc.COM_CD);
                                return (React.createElement("label", { key: loc.COM_CD, onClick: () => handleCleanMidToggle(loc.COM_CD), className: `flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-left ${isChecked
                                        ? 'bg-secondary-container/40 text-on-secondary-container font-semibold ring-1 ring-secondary/40 shadow-xs'
                                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200/40'}` },
                                    React.createElement("input", { type: "checkbox", checked: isChecked, onChange: () => { }, className: "w-4 h-4 accent-secondary rounded shrink-0" }),
                                    React.createElement("span", { className: "text-[12px] truncate leading-tight font-medium" }, loc.COM_NM)));
                            })),
                            (formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) && (React.createElement("div", { className: "mt-2 text-left" },
                                React.createElement("input", { type: "text", value: customMidCdText, onChange: (e) => setCustomMidCdText(e.target.value), placeholder: "\uAE30\uD0C0 \uC21C\uD68C \uB300\uC0C1 \uAD6C\uC5ED \uBA85\uCE6D\uC744 \uC9C1\uC811 \uC785\uB825\uD574 \uC8FC\uC138\uC694 (\uC608: \uC625\uC0C1 \uD14C\uB77C\uC2A4, \uC9C0\uD558 \uCC3D\uACE0 \uB4F1)", className: "w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-outline/70 shadow-sm" }))))))),
                React.createElement("section", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100" },
                    activeTab === 'REGULAR' && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "flex items-center justify-between pb-1 border-b border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uC11C\uBE44\uC2A4 \uC138\uBD80 \uC870\uAC74 \uC124\uC815 (\uC815\uAE30\uCCAD\uC18C \uD2B9\uD654)")),
                            React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold" }, "90\uC77C \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uACE0\uC815")),
                        React.createElement("div", { className: "bg-surface-container-low p-4 rounded-xl space-y-3 text-left" },
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-space-sm" },
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between" },
                                        React.createElement("span", null,
                                            "\uC6A9\uC5ED \uAC1C\uC2DC\uB144\uC6D4 / \uC8FC\uCC28 ",
                                            React.createElement("span", { className: "text-error" }, "*")),
                                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" }, "\uAC1C\uC2DC \uAE30\uC900 \uC2DC\uC810")),
                                    React.createElement("div", { className: "grid grid-cols-5 gap-1.5" },
                                        React.createElement("div", { className: "col-span-3" },
                                            React.createElement("select", { value: startYearMonth, onChange: (e) => handleStartYmChange(e.target.value), className: "w-full h-11 px-2.5 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none border border-slate-200 cursor-pointer" }, AVAILABLE_START_MONTHS.map((m) => (React.createElement("option", { key: m.value, value: m.value }, m.label))))),
                                        React.createElement("div", { className: "col-span-2" },
                                            React.createElement("select", { value: startWeek, onChange: (e) => setStartWeek(Number(e.target.value)), className: "w-full h-11 px-2 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface outline-none border border-slate-200 cursor-pointer" }, (() => {
                                                const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                                const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                                                return weeks.map((w) => (React.createElement("option", { key: w.week, value: w.week }, w.shortLabel)));
                                            })()))),
                                    React.createElement("div", { className: "font-caption text-[11px] text-outline text-left pt-0.5" }, (() => {
                                        const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                        const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                                        const curWeek = weeks.find((w) => w.week === startWeek) || weeks[0];
                                        return curWeek ? `${mStr}월 ${curWeek.startDay}일 ~ ${mStr}월 ${curWeek.endDay}일 시작` : '';
                                    })())),
                                React.createElement("div", { className: "space-y-1" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface font-semibold" }, "\uC6A9\uC5ED \uB9CC\uB8CC\uC77C (90\uC77C \uB9CC\uAE30)"),
                                        React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-[10px] font-bold" }, "3\uAC1C\uC6D4 \uC790\uB3D9 \uACC4\uC0B0")),
                                    (() => {
                                        const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                        const { endYear, endMonth, endWeek, endWeekInfo } = calcThreeMonthsLater(parseInt(yStr, 10), parseInt(mStr, 10), startWeek);
                                        return (React.createElement(React.Fragment, null,
                                            React.createElement("div", { className: "h-11 rounded-xl bg-surface-container-lowest/80 px-3 flex items-center justify-between font-body-sm text-body-sm text-primary font-bold border border-slate-200 select-none" },
                                                React.createElement("span", null,
                                                    endYear,
                                                    "\uB144 ",
                                                    String(endMonth).padStart(2, '0'),
                                                    "\uC6D4 ",
                                                    endWeek,
                                                    "\uC8FC\uCC28"),
                                                React.createElement("span", { className: "font-caption text-caption text-outline font-normal" }, "(90\uC77C \uB9CC\uAE30)")),
                                            React.createElement("div", { className: "font-caption text-[11px] text-outline text-left pt-0.5" },
                                                endMonth,
                                                "\uC6D4 ",
                                                endWeekInfo.startDay,
                                                "\uC77C ~ ",
                                                endMonth,
                                                "\uC6D4 ",
                                                endWeekInfo.endDay,
                                                "\uC77C \uB9CC\uAE30")));
                                    })())),
                            React.createElement("div", { className: "flex items-start gap-2 p-3 bg-secondary-container/20 rounded-lg text-left" },
                                React.createElement("span", { className: "material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5" }, "verified_user"),
                                React.createElement("p", { className: "font-caption text-caption text-on-secondary-container leading-relaxed" },
                                    React.createElement("strong", { className: "font-semibold" }, "\uCD5C\uC18C 3\uAC1C\uC6D4(90\uC77C) \uB77D \uBCF4\uC7A5\uC81C:"),
                                    " \uC815\uAE30 \uCCAD\uC18C\uB294 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC758 \uC2A4\uCF00\uC904 \uACE0\uC815\uACFC \uC9C0\uC18D\uC801\uC778 \uC704\uC0DD \uD004\uB9AC\uD2F0\uB97C \uC720\uC9C0\uD558\uAE30 \uC704\uD574 \uBD84\uAE30(90\uC77C) \uB2E8\uC704\uB85C \uC758\uB8B0\uB418\uBA70, \uAC1C\uC2DC \uC2DC\uC810 \uAE30\uC900 3\uAC1C\uC6D4 \uD6C4\uAC00 \uC790\uB3D9 \uC0B0\uCD9C\uB429\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "space-y-3 text-left" },
                            React.createElement("div", { className: "bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uC8FC\uAC04 \uBC29\uBB38 \uBE48\uB3C4"),
                                React.createElement("div", { className: "grid grid-cols-4 gap-1.5" }, [1, 2, 3, 5].map((f) => (React.createElement("button", { key: f, type: "button", onClick: () => handleFreqChange(f), className: `py-2 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${formData.weekCleanFreq === f
                                        ? 'bg-primary text-on-primary font-bold shadow-sm'
                                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'}` },
                                    "\uC8FC ",
                                    f,
                                    "\uD68C"))))),
                            React.createElement("div", { className: "bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uBC29\uBB38 \uD76C\uB9DD \uC694\uC77C"),
                                    React.createElement("span", { className: "font-caption text-caption text-secondary font-bold" },
                                        (Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig.length : 0),
                                        " / ",
                                        formData.weekCleanFreq,
                                        "\uAC1C \uC120\uD0DD\uB428")),
                                React.createElement("div", { className: "grid grid-cols-7 gap-1" }, [
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
                                    return (React.createElement("button", { key: day.code, type: "button", onClick: () => handleCleanDayToggle(day.code), className: `flex flex-col items-center justify-center py-2.5 rounded-lg font-label-sm text-label-sm cursor-pointer transition-all ${isDayChecked
                                            ? 'bg-secondary text-on-secondary font-bold shadow-sm ring-1 ring-secondary'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}` },
                                        React.createElement("span", null, day.label)));
                                })))),
                        React.createElement("div", { className: "flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl text-left" },
                            React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uAC74\uBB3C \uC2E4\uD3C9\uC218 / \uAD00\uB9AC \uBA74\uC801 (\uC120\uD0DD)"),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("input", { type: "number", value: formData.supplyPyeong, onChange: (e) => handleFieldChange('supplyPyeong', e.target.value), className: "w-20 h-9 rounded-lg bg-surface-container-lowest px-2.5 text-right font-label-md text-label-md font-mono text-on-surface outline-none border border-slate-200" }),
                                React.createElement("span", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uD3C9"))))),
                    activeTab === 'MOVEIN' && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "flex items-center justify-between pb-1 border-b border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uC785\uC8FC/\uC774\uC0AC \uCCAD\uC18C \uC138\uBD80 \uC870\uAC74 \uC124\uC815")),
                            React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold" }, "1\uD68C\uC131 \uC9D1\uC911 \uD480\uCF00\uC5B4")),
                        React.createElement("div", { className: "bg-surface-container-low p-4 rounded-xl space-y-4 text-left border border-slate-200/60" },
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-space-sm" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" },
                                        "\uC8FC\uAC70 \uAC74\uBB3C \uD615\uD0DC ",
                                        React.createElement("span", { className: "text-error" }, "*")),
                                    React.createElement("select", { value: formData.moveinBuildingType || 'APT', onChange: (e) => handleFieldChange('moveinBuildingType', e.target.value), className: "h-11 w-full rounded-xl bg-surface-container-lowest px-3 font-body-md text-body-md border border-slate-200 outline-none font-medium cursor-pointer" },
                                        React.createElement("option", { value: "APT" }, "\uC544\uD30C\uD2B8 (\uACF5\uB3D9\uC8FC\uD0DD)"),
                                        React.createElement("option", { value: "OFFICETEL" }, "\uC624\uD53C\uC2A4\uD154 / \uB3C4\uC2DC\uD615 \uC0DD\uD65C\uC8FC\uD0DD"),
                                        React.createElement("option", { value: "VILLA" }, "\uBE4C\uB77C / \uB2E4\uC138\uB300\u00B7\uC5F0\uB9BD"),
                                        React.createElement("option", { value: "HOUSE" }, "\uB2E8\uB3C5\uC8FC\uD0DD / \uC804\uC6D0\uC8FC\uD0DD"),
                                        React.createElement("option", { value: "STUDIO" }, "\uC6D0\uB8F8 / \uD22C\uB8F8"))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" },
                                        "\uACF5\uAE09 \uD3C9\uC218 (\uBD84\uC591 \uD3C9\uC218) ",
                                        React.createElement("span", { className: "text-error" }, "*")),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("input", { type: "number", value: formData.moveinPyeong, onChange: (e) => handleFieldChange('moveinPyeong', e.target.value), placeholder: "34", className: "h-11 w-full rounded-xl bg-surface-container-lowest px-3 font-body-md text-body-md font-mono border border-slate-200 outline-none text-right font-bold" }),
                                        React.createElement("span", { className: "font-body-md text-body-md text-on-surface-variant shrink-0" }, "\uD3C9")))),
                            React.createElement("div", { className: "grid grid-cols-3 gap-2" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1 font-semibold" }, "\uBC29 \uAC1C\uC218"),
                                    React.createElement("select", { value: formData.moveinRoomCount || 3, onChange: (e) => handleFieldChange('moveinRoomCount', Number(e.target.value)), className: "h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none" },
                                        React.createElement("option", { value: 1 }, "1\uAC1C"),
                                        React.createElement("option", { value: 2 }, "2\uAC1C"),
                                        React.createElement("option", { value: 3 }, "3\uAC1C"),
                                        React.createElement("option", { value: 4 }, "4\uAC1C"),
                                        React.createElement("option", { value: 5 }, "5\uAC1C+"))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1 font-semibold" }, "\uC695\uC2E4 \uC218"),
                                    React.createElement("select", { value: formData.moveinBathCount || 2, onChange: (e) => handleFieldChange('moveinBathCount', Number(e.target.value)), className: "h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none" },
                                        React.createElement("option", { value: 1 }, "1\uAC1C"),
                                        React.createElement("option", { value: 2 }, "2\uAC1C"),
                                        React.createElement("option", { value: 3 }, "3\uAC1C+"))),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1 font-semibold" }, "\uBC1C\uCF54\uB2C8"),
                                    React.createElement("select", { value: formData.moveinBalconyExt || 'Y', onChange: (e) => handleFieldChange('moveinBalconyExt', e.target.value), className: "h-10 w-full rounded-xl bg-surface-container-lowest px-2 font-body-sm text-body-sm border border-slate-200 outline-none" },
                                        React.createElement("option", { value: "Y" }, "\uD655\uC7A5\uD615"),
                                        React.createElement("option", { value: "N" }, "\uBE44\uD655\uC7A5\uD615")))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" }, "\uD76C\uB9DD \uC791\uC5C5 \uC2DC\uAC04\uB300"),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2" },
                                    React.createElement("div", { className: `p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${!formData.workTimeNegotiable
                                            ? 'bg-surface-container-lowest border border-slate-300 shadow-xs'
                                            : 'bg-surface-container-low/60 border border-slate-200 opacity-50'}` },
                                        React.createElement("span", { className: "text-xs font-bold text-slate-700 shrink-0 pl-1" }, "\uC2DC\uC791\uC2DC\uAC04"),
                                        React.createElement("div", { className: "flex items-center gap-1.5 justify-end" },
                                            React.createElement("select", { disabled: formData.workTimeNegotiable, value: formData.workStartTimeType || '오전', onChange: (e) => handleFieldChange('workStartTimeType', e.target.value), className: "h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed" },
                                                React.createElement("option", { value: "\uC624\uC804" }, "\uC624\uC804"),
                                                React.createElement("option", { value: "\uC624\uD6C4" }, "\uC624\uD6C4")),
                                            React.createElement("input", { type: "text", disabled: formData.workTimeNegotiable, placeholder: "08:00", value: formData.workStartTime || '08:00', onChange: (e) => handleFieldChange('workStartTime', e.target.value), className: "h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed" }))),
                                    React.createElement("div", { className: `p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${!formData.workTimeNegotiable
                                            ? 'bg-surface-container-lowest border border-slate-300 shadow-xs'
                                            : 'bg-surface-container-low/60 border border-slate-200 opacity-50'}` },
                                        React.createElement("span", { className: "text-xs font-bold text-slate-700 shrink-0 pl-1" }, "\uC885\uB8CC\uC2DC\uAC04"),
                                        React.createElement("div", { className: "flex items-center gap-1.5 justify-end" },
                                            React.createElement("select", { disabled: formData.workTimeNegotiable, value: formData.workEndTimeType || '오후', onChange: (e) => handleFieldChange('workEndTimeType', e.target.value), className: "h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed" },
                                                React.createElement("option", { value: "\uC624\uC804" }, "\uC624\uC804"),
                                                React.createElement("option", { value: "\uC624\uD6C4" }, "\uC624\uD6C4")),
                                            React.createElement("input", { type: "text", disabled: formData.workTimeNegotiable, placeholder: "05:00", value: formData.workEndTime || '05:00', onChange: (e) => handleFieldChange('workEndTime', e.target.value), className: "h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed" }))),
                                    React.createElement("button", { type: "button", onClick: () => {
                                            triggerHaptic('LIGHT');
                                            const nextNeg = !formData.workTimeNegotiable;
                                            setFormData((prev) => ({
                                                ...prev,
                                                workTimeNegotiable: nextNeg,
                                                moveinTimeSlot: nextNeg
                                                    ? 'FLEXIBLE'
                                                    : `${prev.workStartTimeType || '오전'} ${prev.workStartTime || '08:00'} ~ ${prev.workEndTimeType || '오후'} ${prev.workEndTime || '05:00'}`,
                                            }));
                                        }, className: `h-11 sm:h-auto rounded-xl font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${formData.workTimeNegotiable
                                            ? 'bg-primary text-on-primary font-bold shadow-sm'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-slate-200'}` },
                                        React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, formData.workTimeNegotiable ? 'check_circle' : 'handshake'),
                                        React.createElement("span", null, "\uC2DC\uACF5\uC0AC\uC640 \uD611\uC758 \uAC00\uB2A5"))))))),
                    activeTab === 'APPLIANCE' && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "flex items-center justify-between pb-1 border-b border-slate-100" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-6 h-6 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uACC4\uC808\uAC00\uC804\uCCAD\uC18C \uC138\uBD80 \uC870\uAC74 \uC124\uC815")),
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary text-white font-caption text-[11px] font-bold" },
                                    "\uCD1D ",
                                    APPLIANCE_CATALOG.reduce((acc, cur) => acc + ((formData.applianceDetails?.[cur.id] || []).length), 0),
                                    "\uB300 \uC120\uD0DD\uB428"),
                                React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold" }, "\uC644\uC804\uBD84\uD574 \u00B7 \uACE0\uC555\uC0B4\uADE0"))),
                        React.createElement("div", { className: "max-h-[390px] sm:max-h-[430px] overflow-y-auto overscroll-contain pr-1 space-y-2.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-inner" }, APPLIANCE_CATALOG.map((item) => {
                            const instList = formData.applianceDetails?.[item.id] || [];
                            const count = instList.length;
                            return (React.createElement("div", { key: item.id, className: `bg-surface-container-lowest p-3.5 rounded-xl border transition-all text-left ${count > 0 ? 'border-secondary/40 shadow-sm ring-1 ring-secondary/20' : 'border-slate-200/80 shadow-xs'}` },
                                React.createElement("div", { className: "flex items-center justify-between gap-2" },
                                    React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" },
                                        React.createElement("span", { className: "w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, item.icon)),
                                        React.createElement("div", { className: "flex flex-col min-w-0" },
                                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                                React.createElement("span", { className: `text-[10px] px-1.5 py-0.2 rounded border font-bold ${item.catColor}` }, item.category),
                                                React.createElement("span", { className: "font-label-md text-label-md font-bold text-slate-900 truncate" }, item.name)),
                                            React.createElement("span", { className: "text-[11px] text-slate-400 truncate mt-0.5" }, item.subDesc))),
                                    React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                                        React.createElement("button", { type: "button", onClick: () => handleApplianceRemove(item.id), disabled: count === 0, className: "w-8 h-8 rounded-lg bg-surface-container-low border border-slate-200 font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors" }, "-"),
                                        React.createElement("span", { className: `w-8 text-center font-mono font-bold text-[14px] ${count > 0 ? 'text-secondary' : 'text-slate-400'}` }, count),
                                        React.createElement("button", { type: "button", onClick: () => handleApplianceAdd(item.id), className: "w-8 h-8 rounded-lg bg-secondary text-white font-bold hover:bg-secondary/90 flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-95" }, "+"))),
                                count > 0 && (React.createElement("div", { className: "mt-3 pt-2.5 border-t border-slate-100 space-y-2" },
                                    React.createElement("div", { className: "flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1" },
                                        React.createElement("span", null, "\uAC1C\uBCC4 \uAE30\uAE30 \uC21C\uBC88"),
                                        React.createElement("span", null,
                                            "\uC138\uBD80 \uADDC\uACA9 (",
                                            item.unit,
                                            ") \uC785\uB825")),
                                    instList.map((inst, idx) => (React.createElement("div", { key: inst.seq || idx, className: "flex items-center justify-between bg-surface-container-low/70 px-3 py-1.5 rounded-lg border border-slate-200/60" },
                                        React.createElement("div", { className: "flex items-center gap-1.5" },
                                            React.createElement("span", { className: "w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[11px] font-bold font-mono flex items-center justify-center" }, idx + 1),
                                            React.createElement("span", { className: "text-xs font-bold text-slate-700" },
                                                idx + 1,
                                                "\uD638\uAE30")),
                                        item.inputType === 'select' ? (React.createElement("div", { className: "flex items-center gap-1.5" },
                                            React.createElement("select", { value: inst.spec || 'QUEEN', onChange: (e) => handleApplianceSpecChange(item.id, idx, e.target.value), className: "h-8 px-2 text-xs font-semibold text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer" }, item.options?.map((opt) => (React.createElement("option", { key: opt.val, value: opt.val }, opt.label)))),
                                            inst.spec === 'CUSTOM' && (React.createElement("input", { type: "text", value: inst.customSize || '', onChange: (e) => handleApplianceSpecChange(item.id, idx, inst.spec, e.target.value), placeholder: "\uADDC\uACA9 \uC9C1\uC811\uC785\uB825", className: "w-28 h-8 px-2 text-xs font-medium text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" })))) : (React.createElement("div", { className: "flex items-center gap-1.5" },
                                            React.createElement("input", { type: "number", min: 1, value: inst.spec || '', onChange: (e) => handleApplianceSpecChange(item.id, idx, e.target.value), placeholder: item.placeholder || '0', className: "w-20 h-8 px-2 text-right text-xs font-mono font-bold text-slate-900 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" }),
                                            React.createElement("span", { className: "text-xs font-semibold text-slate-600 shrink-0" }, item.unit))))))))));
                        }))))),
                React.createElement("section", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md border border-slate-100" },
                    React.createElement("div", { className: "flex items-center justify-between pb-1 border-b border-slate-100" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "w-6 h-6 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "3"),
                            React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold" }, "\uBC1C\uC8FC \uAE08\uC561 \uBC0F \uD604\uC7A5 \uD2B9\uC774\uC0AC\uD56D")),
                        React.createElement("span", { className: "font-label-sm text-label-sm text-secondary flex items-center gap-1 font-bold" },
                            React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "bolt"),
                            React.createElement("span", null, "100% \uACE0\uAC1D \uC9C0\uC815\uAC00"))),
                    React.createElement("div", { className: "bg-surface-container-low p-4 rounded-xl space-y-3 text-left" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "font-headline-sm text-[16px] text-on-surface font-bold" },
                                    "\uACE0\uAC1D \uD655\uC815 \uC9C0\uC815 ",
                                    activeTab === 'REGULAR' ? '월 ' : '',
                                    "\uC6A9\uC5ED \uB300\uAE08 ",
                                    React.createElement("span", { className: "text-error" }, "*")),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-0.5" }, "\uB9E4\uC6D4 \uC2DC\uACF5\uC0AC\uC5D0 \uC9C0\uAE09\uD558\uB294 \uAE08\uC561(VAT \uD3EC\uD568)\uC744 \uC791\uC131\uD569\uB2C8\uB2E4.")),
                            React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold shrink-0" }, "\uD604\uC7A5 \uC9C1\uBD88 \uACC4\uC57D \uC6D0\uCE59")),
                        React.createElement("div", { className: "relative flex items-center" },
                            React.createElement("input", { type: "text", value: formData.proposedPrice, onChange: (e) => handlePriceChange(e.target.value), className: "w-full h-14 rounded-xl bg-surface-container-lowest px-4 font-headline-md text-headline-md font-bold text-primary font-mono tracking-tight shadow-inner border border-slate-200 focus:outline-none focus:border-secondary pr-20" }),
                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold absolute right-4 pointer-events-none" },
                                "\uC6D0 ",
                                activeTab === 'REGULAR' ? '/ 월' : '')),
                        activeTab === 'REGULAR' && (React.createElement("div", { className: "flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-secondary/20 shadow-xs" },
                            React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "90\uC77C(3\uAC1C\uC6D4) \uCD1D \uACC4\uC57D\uC561"),
                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-secondary font-bold font-mono" },
                                "\u20A9",
                                new Intl.NumberFormat('ko-KR').format(getQuarterlyPrice()))))),
                    React.createElement("div", { className: "space-y-1.5 text-left" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uCD94\uAC00 \uC694\uCCAD \uC0AC\uD56D \uBC0F \uD2B9\uC774\uC0AC\uD56D"),
                            React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD604\uC7A5 \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uC804\uB2EC\uC6A9")),
                        React.createElement("textarea", { rows: 3, value: formData.detailReqNote, onChange: (e) => handleFieldChange('detailReqNote', e.target.value), placeholder: "\uD604\uC7A5 \uD2B9\uC774\uC0AC\uD56D, \uBC29\uBB38 \uD76C\uB9DD \uC2DC\uAC04\uB300, \uC911\uC810 \uAD00\uB9AC \uC694\uCCAD \uAD6C\uC5ED\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.", className: "w-full rounded-xl bg-surface-container-low/50 focus:bg-surface-container-lowest p-3.5 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:border-secondary resize-none transition-colors" })),
                    React.createElement("div", { className: "space-y-2 text-left" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5" },
                                React.createElement("span", null, "\uD604\uC7A5 \uC0AC\uC9C4 \uCCA8\uBD80"),
                                React.createElement("span", { className: "font-caption text-caption text-outline font-normal" }, "(\uCD5C\uB300 10\uC7A5)")),
                            React.createElement("span", { className: "font-caption text-caption text-secondary font-bold" },
                                photoFiles.length,
                                " / 10\uC7A5 \uB4F1\uB85D\uB428")),
                        React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handlePhotoAdd, className: "sr-only" }),
                        React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-5 gap-2.5" },
                            photoFiles.map((photo) => (React.createElement("div", { key: photo.seq, className: "relative group aspect-square rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col justify-end p-2 border border-slate-200" },
                                React.createElement("div", { className: "bg-cover bg-center absolute inset-0", style: { backgroundImage: `url('${photo.url}')` } }),
                                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent" }),
                                React.createElement("span", { className: "relative font-caption text-caption text-white truncate text-[11px]" }, photo.title),
                                React.createElement("button", { type: "button", "aria-label": "\uC0AD\uC81C", onClick: () => handlePhotoDelete(photo.seq), className: "absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-inverse-surface/80 hover:bg-error text-white flex items-center justify-center transition-colors cursor-pointer" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "close"))))),
                            photoFiles.length < 10 && (React.createElement("button", { type: "button", onClick: () => {
                                    triggerHaptic('LIGHT');
                                    fileInputRef.current?.click();
                                }, className: "aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-secondary flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm border border-dashed border-slate-300" },
                                React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "add_a_photo"),
                                React.createElement("span", { className: "font-label-sm text-label-sm font-semibold" }, "+ \uCD94\uAC00 \uB4F1\uB85D"),
                                React.createElement("span", { className: "font-caption text-caption text-outline" },
                                    photoFiles.length,
                                    " / 10"))))),
                    React.createElement("div", { className: "p-4 rounded-xl bg-secondary-container/25 text-on-surface shadow-sm space-y-2 text-left border border-secondary/20" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "verified")),
                                React.createElement("div", null,
                                    React.createElement("h4", { className: "font-label-md text-label-md text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0 \uC548\uC2EC \uB9E4\uCE6D \uBCF4\uC99D\uB8CC"),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uBC30\uCC28 \uC131\uACF5 \uBC0F 1:1 \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uD655\uC815 \uBC30\uC815 \uC2DC\uC5D0\uB9CC \uBD80\uACFC")))),
                        React.createElement("div", { className: "p-3 bg-error-container/30 rounded-lg text-on-error-container font-caption text-caption flex items-start gap-2 leading-relaxed" },
                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5" }, "notification_important"),
                            React.createElement("span", null,
                                React.createElement("strong", null, "[\uD604\uC7A5 \uC9C1\uBD88 \uACF5\uC9C0]"),
                                " \uC778\uAC74\uBE44 \uBC0F \uC6A9\uC5ED\uBE44(",
                                formData.proposedPrice,
                                "\uC6D0)\uB294 \uC2DC\uACF5 \uC644\uB8CC \uD6C4 \uC0AC\uC9C4 \uB610\uB294 \uAC80\uC218\uD6C4 \uC2DC\uACF5\uC790\uC5D0\uAC8C \uC9C1\uC811 \uACB0\uC81C\uD569\uB2C8\uB2E4. \uD50C\uB7AB\uD3FC\uC740 \uC778\uAC74\uBE44 \uC5D0\uC2A4\uD06C\uB85C\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C \uD604\uC7A5 \uAC80\uC218 \uD6C4 \uC9C1\uC811 \uC815\uC0B0\uD558\uC5EC \uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4."))),
                    React.createElement("div", { className: "h-16" })))),
        React.createElement("footer", { className: "fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] border-t border-slate-100" },
            React.createElement("div", { className: "p-margin-mobile flex flex-col gap-2" },
                React.createElement("div", { className: "flex items-center justify-between px-1" },
                    React.createElement("div", { className: "flex items-center gap-1.5 text-on-surface-variant" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "cloud_done"),
                        React.createElement("span", { className: "font-caption text-caption" }, "\uC784\uC2DC\uC800\uC7A5 \uBCF4\uD638 \uC911")),
                    React.createElement("div", { className: "text-right" },
                        React.createElement("span", { className: "font-caption text-caption text-outline mr-1" }, activeTab === 'REGULAR' ? '월 확정가' : '확정가'),
                        React.createElement("span", { className: "font-label-lg text-label-lg font-bold text-primary font-mono" },
                            formData.proposedPrice,
                            "\uC6D0"))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", { type: "button", onClick: handleClose, className: "h-[50px] px-5 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-bold transition-colors cursor-pointer" }, "\uCDE8\uC18C"),
                    React.createElement("button", { type: "button", id: "modal-submit-action", disabled: isSubmitting, onClick: () => handleSubmit(), className: "flex-1 h-[50px] bg-secondary text-on-secondary hover:bg-secondary/90 active:scale-[0.99] font-label-lg text-label-lg font-bold rounded-xl flex items-center justify-center gap-space-xs shadow-md shadow-secondary/20 transition-all cursor-pointer disabled:opacity-60" }, isSubmitting ? (React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined animate-spin text-[20px]" }, "progress_activity"),
                        React.createElement("span", null, "\uBC1C\uC8FC \uB4F1\uB85D \uC911..."))) : (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "assignment_turned_in"),
                        React.createElement("span", null, "+ \uCCAD\uC18C \uC11C\uBE44\uC2A4 \uC2E0\uCCAD \uC644\uB8CC (\uD655\uC815 \uBC1C\uC8FC)"))))))),
        React.createElement(MobileNaverAddressSearchModal, { isOpen: isAddrModalOpen, onClose: () => setIsAddrModalOpen(false), onSelectAddress: (item) => {
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
            } }),
        submitSuccessResult && (React.createElement("div", { className: "fixed inset-0 z-70 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" },
            React.createElement("div", { className: "w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200 border border-slate-100" },
                React.createElement("div", { className: "w-14 h-14 rounded-full bg-secondary/15 text-secondary mx-auto flex items-center justify-center" },
                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "check_circle")),
                React.createElement("div", { className: "space-y-1" },
                    React.createElement("h3", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uD655\uC815 \uBC1C\uC8FC\uC11C\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4!"),
                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" },
                        "\uBC1C\uC8FC\uBC88\uD638: ",
                        React.createElement("strong", { className: "text-secondary font-mono" }, submitSuccessResult.orderNo))),
                React.createElement("div", { className: "p-3 bg-surface-container-low rounded-xl text-left text-body-sm space-y-1" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-outline" }, "\uD655\uC815 \uC6A9\uC5ED \uB300\uAE08"),
                        React.createElement("span", { className: "font-bold text-primary font-mono" },
                            Number(submitSuccessResult.proposedPrice).toLocaleString(),
                            "\uC6D0")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-outline" }, "\uC2DC\uACF5 \uD604\uC7A5"),
                        React.createElement("span", { className: "font-bold text-on-surface truncate max-w-[180px]" }, submitSuccessResult.addrText))),
                React.createElement("p", { className: "font-caption text-caption text-outline" }, "1:1 \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uBC30\uCC28 \uAD00\uC81C\uAC00 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4!"),
                React.createElement("button", { type: "button", onClick: () => {
                        triggerHaptic('LIGHT');
                        setSubmitSuccessResult(null);
                        handleClose();
                        if (typeof onSuccess === 'function') {
                            onSuccess(submitSuccessResult);
                        }
                        if (onNavigate) {
                            onNavigate('APP-CLNT-ORD-000', { orderNo: submitSuccessResult.orderNo });
                        }
                        else if (navigation?.navigate) {
                            navigation.navigate('APP-CLNT-ORD-000', { orderNo: submitSuccessResult.orderNo });
                        }
                    }, className: "w-full h-12 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md font-bold hover:bg-secondary/90 transition-colors cursor-pointer shadow-sm" }, "\uB098\uC758 \uC2E0\uCCAD \uD604\uD669 \uD655\uC778\uD558\uAE30")))),
        guestNoticeModal.isOpen && (React.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" },
            React.createElement("div", { className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col items-center text-center" },
                React.createElement("div", { className: "w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4" },
                    React.createElement("span", { className: "material-symbols-outlined text-3xl" }, "verified_user")),
                React.createElement("h3", { className: "text-lg font-bold text-on-surface mb-2" }, "[\uC4F8\uACE0\uB2E6\uACE0 \uC548\uC2EC \uC548\uB0B4]"),
                React.createElement("div", { className: "text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-left w-full" }, guestNoticeModal.message),
                React.createElement("button", { type: "button", onClick: handleConfirmGuestNotice, className: "w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2" },
                    React.createElement("span", null, "\uD655\uC778 (\uB85C\uADF8\uC778 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9)"),
                    React.createElement("span", { className: "material-symbols-outlined text-sm" }, "arrow_forward")))))));
}
AppClntReq000;

if (typeof window !== 'undefined') {
  window.AppClntReq000 = AppClntReq000;
  console.log('✅ APP-CLNT-REQ-000 Mobile Screen registered to window.AppClntReq000');
}

})();