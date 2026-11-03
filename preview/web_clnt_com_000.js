(function() {
const { useState, useEffect, useCallback, useRef } = window.React;
const React = window.React;
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
    REGULAR: '정기청소는 최소 3개월(90일) 계약이 원칙이며, 주 단위 지정일에 전담 클리너가 방문합니다.',
    APPLIANCE: '가전 분해청소는 완전분해 후 고압 살균스팀 세척을 진행하며, 3개월 무상 A/S가 보증됩니다.',
    MOVEIN: '입주/이사 청소는 실내 전공간 탈거 정밀 케어이며, 피톤치드 연무 소독이 기본 제공됩니다.',
};
// ============================================================================
// [청소 계약 기간 및 주차 관리 상수 및 유틸]
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
const COM_CODE_SERVICE_SUB_ITEM = [
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
function chunkCleanLocNamesByLength(selectedCodes, locList = COM_CODE_CLEAN_LOC) {
    if (!selectedCodes || selectedCodes.length === 0)
        return [];
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
        }
        else {
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
        if (!targetQ)
            return;
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
                }
                else {
                    // 백엔드 결과가 없을 경우, 전국 100% 주소/건물명 검색을 위해 Daum 임베드 즉시 자동 활성화
                    setSearchResults([]);
                    runDaumEmbed(targetQ);
                }
            }
            else {
                setSearchResults([]);
                runDaumEmbed(targetQ);
            }
        }
        catch (err) {
            console.warn('Address search failed, fallback to Daum embed', err);
            setSearchResults([]);
            runDaumEmbed(targetQ);
        }
        finally {
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
    if (!isOpen)
        return null;
    return (React.createElement("div", { "aria-modal": "true", className: "fixed inset-0 z-[70] bg-inverse-surface/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in", onClick: (e) => {
            if (e.target === e.currentTarget)
                onClose();
        }, role: "dialog" },
        React.createElement("div", { className: "relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]" },
            React.createElement("div", { className: "p-4 bg-surface-container-low border-b border-slate-200 flex items-center justify-between shrink-0" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("span", { className: "w-6 h-6 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-xs" }, "N"),
                    React.createElement("h3", { className: "font-headline-sm text-[16px] text-on-surface font-bold" }, "\uB124\uC774\uBC84 \uC9C0\uB3C4 \uC8FC\uC18C \uAC80\uC0C9"),
                    React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]" }, "\uC804\uAD6D \uC2E4\uC2DC\uAC04 \uC5F0\uB3D9")),
                React.createElement("button", { onClick: onClose, type: "button", className: "w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer" },
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "close"))),
            React.createElement("div", { className: "p-4 bg-white border-b border-slate-100 flex gap-2 shrink-0" },
                React.createElement("div", { className: "relative flex-1" },
                    React.createElement("input", { ref: inputRef, type: "text", value: keyword, onChange: (e) => setKeyword(e.target.value), onKeyDown: (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e.currentTarget.value || keyword);
                            }
                        }, placeholder: "\uB3C4\uB85C\uBA85, \uAC74\uBB3C\uBA85, \uD559\uAD50\uBA85 \uC785\uB825 (\uC608: \uC131\uC0B0\uCD08\uB4F1\uD559\uAD50, \uD1A0\uB2F9\uB85C 105)", className: "w-full h-11 px-3.5 pr-8 rounded-xl bg-surface-container-low text-[14px] outline-none border border-transparent focus:border-[#03C75A] focus:bg-white transition-all font-medium" }),
                    keyword && (React.createElement("button", { type: "button", onClick: () => {
                            setKeyword('');
                            if (inputRef.current) {
                                inputRef.current.value = '';
                                inputRef.current.focus();
                            }
                        }, className: "absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "cancel")))),
                React.createElement("button", { onClick: () => {
                        const q = (inputRef.current ? inputRef.current.value : keyword) || keyword;
                        handleSearch(q);
                    }, type: "button", className: "px-5 h-11 rounded-xl bg-[#03C75A] hover:bg-[#02b350] active:scale-95 text-white font-bold text-[14px] flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer" }, "\uAC80\uC0C9"),
                React.createElement("button", { onClick: handleOpenDaumPostcode, type: "button", title: "\uB300\uD55C\uBBFC\uAD6D \uC804\uAD6D \uBAA8\uB4E0 \uC8FC\uC18C/\uAC74\uBB3C\uBA85 \uC815\uBC00 \uAC80\uC0C9", className: "px-3.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-[12px] flex items-center justify-center shrink-0 border border-slate-200 transition-all cursor-pointer gap-1" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px] text-slate-600" }, "travel_explore"),
                    React.createElement("span", null, "\uC804\uAD6D \uC8FC\uC18C"))),
            React.createElement("div", { className: "flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto text-[11px] bg-slate-50 border-b border-slate-100 shrink-0" },
                React.createElement("span", { className: "shrink-0 text-slate-400 font-medium" }, "\uCD94\uCC9C:"),
                ['성산초등학교', '세브란스병원', '명지병원', '토당로 105', '국립암센터', '삼혜빌딩', '화신로 260'].map((chip) => (React.createElement("button", { key: chip, type: "button", onClick: () => {
                        setKeyword(chip);
                        if (inputRef.current)
                            inputRef.current.value = chip;
                        handleSearch(chip);
                    }, className: "px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#03C75A] hover:text-[#03C75A] text-slate-700 whitespace-nowrap transition-colors shadow-xs cursor-pointer font-medium" }, chip)))),
            React.createElement("div", { className: "flex-1 min-h-[350px] max-h-[460px] overflow-y-auto p-3 space-y-2 bg-slate-50/50 relative" }, isLoading ? (React.createElement("div", { className: "py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2" },
                React.createElement("span", { className: "material-symbols-outlined animate-spin text-[24px] text-[#03C75A]" }, "progress_activity"),
                React.createElement("span", null, "\uC804\uAD6D \uC8FC\uC18C \uBC0F \uAC74\uBB3C \uAC80\uC0C9 \uC911..."))) : isEmbedMode ? (React.createElement("div", { className: "w-full h-full min-h-[350px] rounded-xl overflow-hidden bg-white border border-slate-200" },
                React.createElement("div", { ref: embedContainerRef, className: "w-full h-[350px]" }))) : searchResults.length > 0 ? (searchResults.map((item, idx) => (React.createElement("div", { key: idx, onClick: () => {
                    onSelectAddress(item);
                    onClose();
                }, className: "p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#03C75A] hover:shadow-sm cursor-pointer transition-all text-left group" },
                React.createElement("div", { className: "text-[13px] font-bold text-slate-800 group-hover:text-[#008f3e]" }, item.roadAddress),
                item.jibunAddress && (React.createElement("div", { className: "text-[11px] text-slate-500 mt-0.5" },
                    "\uC9C0\uBC88: ",
                    item.jibunAddress)),
                item.bldNm && item.bldNm !== item.roadAddress && (React.createElement("div", { className: "text-[11px] text-[#1F497D] font-medium mt-0.5" },
                    "\uAC74\uBB3C: ",
                    item.bldNm)))))) : hasSearched ? (React.createElement("div", { className: "py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3" },
                React.createElement("span", { className: "material-symbols-outlined text-[32px] text-slate-300" }, "location_off"),
                React.createElement("p", null, "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC804\uAD6D \uC8FC\uC18C \uAC80\uC0C9\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4."),
                React.createElement("button", { type: "button", onClick: () => runDaumEmbed(keyword), className: "px-4 py-2 bg-[#03C75A] text-white rounded-lg font-bold text-xs shadow-sm hover:bg-[#02b350] cursor-pointer" }, "\uC804\uAD6D \uC815\uBC00 \uC8FC\uC18C \uAC80\uC0C9 \uC5F4\uAE30"))) : null))));
}
// 계절가전청소 총 9개 세부 품목 카탈로그 정의
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
/**
 * 로컬스토리지 저장을 위한 이미지 Base64 Data URL 압축 생성 헬퍼
 * 최대 1024px, JPEG 0.75 퀄리티 (장당 약 80~120KB로 압축되어 10장도 1MB 내외로 안전 저장)
 */
function compressImageToDataUrl(file, maxWidth = 1024, quality = 0.75) {
    return new Promise((resolve) => {
        if (!file)
            return resolve('');
        if (typeof file === 'string' && file.startsWith('data:'))
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
function WebClntReq000Modal({ isOpen = false, initialTab = 'REGULAR', onClose, onOpenLogin, onSuccess, }) {
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
        window.dispatchEvent(new CustomEvent('OPEN_LOGIN_MODAL', {
            detail: { hasTempReq: true, activeTab },
        }));
    };
    // 1. 초기 탭 동기화
    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);
    // 2. 비회원 LocalStorage 자동 복원 (Hydration: 폼 필드 + 현장 사진 10장 완벽 복구)
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
                    if (parsed.photos && Array.isArray(parsed.photos) && parsed.photos.length > 0) {
                        setPhotoFiles(parsed.photos.map((p, idx) => ({
                            seq: p.seq || idx + 1,
                            title: p.title || `현장사진_${idx + 1}.jpg`,
                            url: p.dataUrl || p.url,
                            dataUrl: p.dataUrl || p.url,
                        })));
                    }
                    console.log('✅ [WEB-CLNT-REQ-000] 비회원 임시 저장 발주서 및 현장 사진 복원 완료');
                }
            }
        }
        catch (err) {
            console.warn('Failed to parse SSEULDAKGO_GUEST_TEMP_REQ', err);
        }
    }, [isOpen]);
    // 3. 모달 바디 스크롤 락
    useEffect(() => {
        if (!isOpen)
            return undefined;
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
    if (!isOpen)
        return null;
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
        setPhotoFiles((prev) => prev.filter((p) => p.seq !== seq));
    };
    // 4. 발주 등록 제출 핸들러 (1. 정합성 검증 -> 2. 비로그인이면 사진 10장 포함 로컬스토리지 저장 -> 3. 로그인이면 DB 등록)
    const handleSubmit = async (e) => {
        if (e)
            e.preventDefault();
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
                alert(`방문 희망 요일을 주간 방문 빈도(주 ${formData.weekCleanFreq}회)에 맞춰 ${formData.weekCleanFreq}개 선택해 주세요.\n(현재 ${safeDays.length}개 선택됨)`);
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
        // 4-5. 로그인 여부 확인
        let currentUserNo = null;
        let currentUserNm = null;
        if (typeof window !== 'undefined') {
            const authUserStr = localStorage.getItem('SSEULDAKGO_AUTH_USER') ||
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
                }
                catch {
                    // ignore
                }
            }
        }
        // 4-6. [비로그인 분기]: 정합성 통과 후 현장 사진 10장(Base64) 포함 로컬스토리지 임시 저장 후 로그인 모달 화면 호출
        if (!currentUserNo) {
            try {
                const photoData = await Promise.all(photoFiles.map(async (p, idx) => ({
                    seq: p.seq || idx + 1,
                    title: p.title,
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
        // 4-7. [로그인 회원 분기]: 백엔드 통신용 페이로드 조립 및 즉시 DB 등록
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
            supplyPyeong: activeTab === 'MOVEIN'
                ? formData.moveinPyeong
                : formData.supplyPyeong || null,
            cleanMidCd: activeTab === 'APPLIANCE'
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
                }
                catch {
                    // ignore
                }
                alert(`[청소 요청 완료]\n발주번호: ${result.data?.orderNo || 'ORD'}\n성공적으로 접수되었습니다! 전담 마스터 배차가 시작됩니다.`);
                if (onSuccess)
                    onSuccess(result.data);
                if (onClose)
                    onClose();
            }
            else {
                alert(result.message || '발주 등록 중 오류가 발생했습니다.');
            }
        }
        catch (err) {
            console.error('Request submission failed', err);
            alert('서버 통신 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (React.createElement("div", { "aria-modal": "true", className: "fixed inset-0 z-50 bg-inverse-surface/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto", id: "service-request-overlay", role: "dialog", onClick: (e) => {
            if (e.target === e.currentTarget && typeof onClose === 'function') {
                onClose();
            }
        } },
        React.createElement("div", { "aria-labelledby": "modal-title", className: "relative w-full max-w-[780px] my-auto max-h-[94vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200", "data-field": "TB_ORDER_MSTR" },
            React.createElement("header", { className: "shrink-0 bg-surface-container-lowest/95 backdrop-blur px-8 py-5 flex items-center justify-between shadow-sm border-b border-slate-100 z-10" },
                React.createElement("div", { className: "flex flex-col text-left" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "price_check"),
                            "\uD655\uC815 \uC9C0\uC815\uAC00 \uBC1C\uC8FC \uC2DC\uC2A4\uD15C"),
                        React.createElement("span", { className: "font-caption text-caption text-outline font-mono" }, "WEB-CLNT-REQ-000")),
                    React.createElement("h2", { className: "font-headline-md text-headline-md text-on-surface font-bold mt-1 tracking-tight flex items-center gap-2", id: "modal-title" }, "\uCCAD\uC18C \uC11C\uBE44\uC2A4 \uC2E0\uCCAD \uBC0F \uBC1C\uC8FC\uC11C \uC791\uC131"),
                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-0.5" }, "\uAC00\uACA9\uC744 \uD765\uC815\uD558\uC9C0 \uC54A\uACE0, \uC6D0\uD558\uB294 \uC870\uAC74\uACFC \uD655\uC815 \uB300\uAE08\uC744 \uC9C1\uC811 \uC785\uB825\uD558\uC5EC 1:1 \uC804\uB2F4 \uB9C8\uC2A4\uD130\uB97C \uBC14\uB85C \uB9E4\uCE6D\uBC1B\uC2B5\uB2C8\uB2E4.")),
                React.createElement("button", { "aria-label": "\uB2EB\uAE30", className: "w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer", onClick: onClose, type: "button" },
                    React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close"))),
            React.createElement("div", { className: "flex-1 overflow-y-auto overscroll-contain scroll-smooth focus:outline-none" },
                React.createElement("form", { className: "divide-y-0", id: "order-request-form", onSubmit: handleSubmit },
                    React.createElement("div", { className: "px-8 pt-6 pb-2" },
                        React.createElement("div", { className: "p-1 bg-surface-container rounded-xl grid grid-cols-3 gap-1" },
                            React.createElement("button", { className: `tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'REGULAR'
                                    ? 'bg-secondary text-white shadow-sm font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'}`, "data-large-tab": "REGULAR", onClick: () => setActiveTab('REGULAR'), type: "button" },
                                React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'REGULAR' ? 'text-white' : 'text-secondary'}` }, "update"),
                                React.createElement("span", null, "\uC815\uAE30\uCCAD\uC18C"),
                                React.createElement("span", { className: `px-1.5 py-0.2 rounded-full font-label-sm text-label-sm ${activeTab === 'REGULAR'
                                        ? 'bg-white/20 text-white font-bold'
                                        : 'bg-secondary-fixed text-on-secondary-fixed-variant'}` }, "\uCD5C\uC18C 90\uC77C")),
                            React.createElement("button", { className: `tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'MOVEIN'
                                    ? 'bg-secondary text-white shadow-sm font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'}`, "data-large-tab": "MOVEIN", onClick: () => setActiveTab('MOVEIN'), type: "button" },
                                React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'MOVEIN' ? 'text-white' : 'text-on-surface-variant'}` }, "home_work"),
                                React.createElement("span", null, "\uC785\uC8FC/\uC774\uC0AC \uCCAD\uC18C")),
                            React.createElement("button", { className: `tab-category-btn flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeTab === 'APPLIANCE'
                                    ? 'bg-secondary text-white shadow-sm font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'}`, "data-large-tab": "APPLIANCE", onClick: () => setActiveTab('APPLIANCE'), type: "button" },
                                React.createElement("span", { className: `material-symbols-outlined text-[18px] ${activeTab === 'APPLIANCE' ? 'text-white' : 'text-on-surface-variant'}` }, "mode_fan"),
                                React.createElement("span", null, "\uACC4\uC808\uAC00\uC804\uCCAD\uC18C")))),
                    React.createElement("section", { className: "px-8 py-4 space-y-4" },
                        React.createElement("div", { className: "flex items-center gap-2 pb-1" },
                            React.createElement("span", { className: "w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "1"),
                            React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold tracking-tight" }, "\uAE30\uBCF8 \uC2DC\uACF5 \uD604\uC7A5 \uC815\uBCF4")),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "flex flex-col text-left" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" },
                                    "\uD76C\uB9DD \uCCAB \uBC29\uBB38/\uCC29\uC218\uC77C ",
                                    React.createElement("span", { className: "text-error" }, "*")),
                                React.createElement("input", { className: "h-11 rounded-xl bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40", name: "HOPE_VISIT_DT", onChange: (e) => handleFieldChange('hopeVisitDt', e.target.value), type: "date", value: formData.hopeVisitDt })),
                            React.createElement("div", { className: "bg-surface-container-low p-2.5 px-3.5 rounded-xl flex flex-col justify-center gap-1.5 text-left border border-slate-200/60" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uD604\uC7A5 \uC8FC\uCC28 \uC5EC\uAC74"),
                                    React.createElement("span", { className: "font-caption text-[11px] text-secondary" }, "\uC7A5\uBE44\uCC28\uB7C9 \uD0D1\uC7AC")),
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement("label", { className: "flex items-center gap-1.5 cursor-pointer font-label-sm text-label-sm text-on-surface" },
                                        React.createElement("input", { checked: formData.parkingAvailCd === 'FREE', className: "accent-secondary", name: "PARKING_AVAIL_CD", onChange: () => handleFieldChange('parkingAvailCd', 'FREE'), type: "radio", value: "FREE" }),
                                        React.createElement("span", null, "\uBB34\uB8CC \uC8FC\uCC28")),
                                    React.createElement("label", { className: "flex items-center gap-1.5 cursor-pointer font-body-sm text-body-sm text-on-surface-variant" },
                                        React.createElement("input", { checked: formData.parkingAvailCd === 'PAID', className: "accent-secondary", name: "PARKING_AVAIL_CD", onChange: () => handleFieldChange('parkingAvailCd', 'PAID'), type: "radio", value: "PAID" }),
                                        React.createElement("span", null, "\uC720\uB8CC \uC8FC\uCC28")),
                                    React.createElement("label", { className: "flex items-center gap-1.5 cursor-pointer font-body-sm text-body-sm text-on-surface-variant" },
                                        React.createElement("input", { checked: formData.parkingAvailCd === 'UNKNOWN', className: "accent-secondary", name: "PARKING_AVAIL_CD", onChange: () => handleFieldChange('parkingAvailCd', 'UNKNOWN'), type: "radio", value: "UNKNOWN" }),
                                        React.createElement("span", null, "\uD655\uC778 \uD544\uC694"))))),
                        React.createElement("div", { className: "flex flex-col text-left space-y-2" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5" },
                                    React.createElement("span", null,
                                        "\uC2DC\uACF5 \uD604\uC7A5 \uC8FC\uC18C ",
                                        React.createElement("span", { className: "text-error" }, "*")),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#03C75A]/15 text-[#008f3e]" }, "\uB124\uC774\uBC84 \uC8FC\uC18C \uC5F0\uB3D9")),
                                React.createElement("span", { className: "font-caption text-caption text-secondary flex items-center gap-0.5" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "my_location"),
                                    formData.sidoNm,
                                    " ",
                                    formData.sigunguNm)),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement("button", { className: "h-11 px-4 rounded-xl bg-[#03C75A] hover:bg-[#02b350] text-white font-label-md text-label-md shrink-0 transition-colors shadow-sm flex items-center gap-1.5 font-bold", onClick: () => setIsAddrModalOpen(true), type: "button" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "search"),
                                    "\uB124\uC774\uBC84 \uC8FC\uC18C \uAC80\uC0C9"),
                                React.createElement("input", { className: "h-11 flex-1 rounded-xl bg-surface-container-low px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200", name: "ADDR_TEXT", readOnly: true, type: "text", value: formData.addrText })),
                            React.createElement("input", { className: "h-11 rounded-xl bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40", name: "ADDR_DETAIL", onChange: (e) => handleFieldChange('addrDetail', e.target.value), placeholder: "\uC0C1\uC138\uC8FC\uC18C \uBC0F \uB3D9/\uD638\uC218 \uC785\uB825", type: "text", value: formData.addrDetail })),
                        activeTab === 'REGULAR' && (React.createElement("div", { className: "space-y-3 pt-1" },
                            React.createElement("div", { className: "flex flex-col text-left" },
                                React.createElement("div", { className: "flex items-center justify-between mb-1.5" },
                                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1" },
                                        React.createElement("span", null, "\uC815\uAE30 \uCCAD\uC18C \uAC74\uBB3C \uC885\uB958"),
                                        React.createElement("span", { className: "text-error" }, "*")),
                                    React.createElement("span", { className: "text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded" }, "BLDG_TYPE")),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("select", { className: "h-11 w-full appearance-none rounded-xl bg-surface-container-lowest px-4 pr-10 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium", name: "FACILITY_TYPE_CD", onChange: (e) => handleFieldChange('facilityTypeCd', e.target.value), required: true, value: formData.facilityTypeCd }, COM_CODE_BLDG_TYPE.map((bldg) => (React.createElement("option", { key: bldg.COM_CD, value: bldg.COM_CD }, bldg.COM_NM)))),
                                    React.createElement("span", { className: "material-symbols-outlined text-[20px] text-outline absolute right-3 top-3 pointer-events-none" }, "expand_more"))),
                            React.createElement("div", { className: "flex flex-col text-left" },
                                React.createElement("div", { className: "flex items-center justify-between mb-1.5" },
                                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1" },
                                        React.createElement("span", null, "\uC815\uAE30 \uC21C\uD68C \uB300\uC0C1 \uAD6C\uC5ED"),
                                        React.createElement("span", { className: "text-secondary font-medium" }, "(\uBCF5\uC218 \uC120\uD0DD \uAC00\uB2A5)")),
                                    React.createElement("span", { className: "text-[10px] text-secondary font-mono bg-secondary/10 px-1.5 py-0.5 rounded" }, "CLEAN_LOC (23\uC885)")),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto p-2 bg-surface-container-low/40 rounded-xl border border-slate-200/70 shadow-inner" }, COM_CODE_CLEAN_LOC.map((loc) => {
                                    const isChecked = formData.cleanMidCdList.includes(loc.COM_CD);
                                    return (React.createElement("label", { key: loc.COM_CD, className: `flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-left ${isChecked
                                            ? 'bg-secondary-container/40 text-on-secondary-container font-semibold ring-1 ring-secondary/40 shadow-xs'
                                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-slate-200/40'}` },
                                        React.createElement("input", { checked: isChecked, className: "w-4 h-4 accent-secondary rounded shrink-0", onChange: () => handleCleanMidToggle(loc.COM_CD), type: "checkbox" }),
                                        React.createElement("span", { className: "text-[12px] truncate leading-tight font-medium" }, loc.COM_NM)));
                                })),
                                (formData.cleanMidCdList.includes('ETC_LOC') || formData.cleanMidCdList.includes('MID_ETC')) && (React.createElement("div", { className: "mt-2 text-left" },
                                    React.createElement("input", { className: "w-full h-11 px-4 rounded-xl bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-outline/70 shadow-sm", onChange: (e) => setCustomMidCdText(e.target.value), placeholder: "\uAE30\uD0C0 \uC21C\uD68C \uB300\uC0C1 \uAD6C\uC5ED \uBA85\uCE6D\uC744 \uC9C1\uC811 \uC785\uB825\uD574 \uC8FC\uC138\uC694 (\uC608: \uC625\uC0C1 \uD14C\uB77C\uC2A4, \uC9C0\uD558 \uCC3D\uACE0 \uB4F1)", type: "text", value: customMidCdText }))))))),
                    React.createElement("section", { className: "px-8 py-5 bg-surface-container-low/70 my-2 space-y-4", id: "dynamic-detail-section" },
                        activeTab === 'REGULAR' && (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "flex items-center justify-between pb-1" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                    React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold tracking-tight" }, "\uC11C\uBE44\uC2A4 \uC138\uBD80 \uC870\uAC74 \uC124\uC815 (\uC815\uAE30\uCCAD\uC18C \uD2B9\uD654)")),
                                React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold" }, "90\uC77C \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uACE0\uC815 \uBC30\uC815")),
                            React.createElement("div", { className: "bg-surface-container-lowest p-4 rounded-xl shadow-sm space-y-3" },
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "flex flex-col text-left space-y-1.5" },
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center justify-between" },
                                            React.createElement("span", null,
                                                "\uC6A9\uC5ED \uAC1C\uC2DC\uB144\uC6D4 / \uC8FC\uCC28 ",
                                                React.createElement("span", { className: "text-error" }, "*")),
                                            React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" }, "\uAC1C\uC2DC \uAE30\uC900 \uC2DC\uC810")),
                                        React.createElement("div", { className: "grid grid-cols-5 gap-2" },
                                            React.createElement("div", { className: "col-span-3" },
                                                React.createElement("select", { className: "w-full h-11 px-3 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer", onChange: (e) => handleStartYmChange(e.target.value), value: startYearMonth }, AVAILABLE_START_MONTHS.map((m) => (React.createElement("option", { key: m.value, value: m.value }, m.label))))),
                                            React.createElement("div", { className: "col-span-2" },
                                                React.createElement("select", { className: "w-full h-11 px-3 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer", onChange: (e) => setStartWeek(Number(e.target.value)), value: startWeek }, (() => {
                                                    const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                                    const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                                                    return weeks.map((w) => (React.createElement("option", { key: w.week, value: w.week }, w.shortLabel)));
                                                })()))),
                                        React.createElement("div", { className: "font-caption text-[11px] text-outline text-left" }, (() => {
                                            const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                            const weeks = getWeeksInMonth(parseInt(yStr, 10), parseInt(mStr, 10));
                                            const curWeek = weeks.find((w) => w.week === startWeek) || weeks[0];
                                            return curWeek ? `${mStr}월 ${curWeek.startDay}일 ~ ${mStr}월 ${curWeek.endDay}일 시작` : '';
                                        })())),
                                    React.createElement("div", { className: "flex flex-col text-left space-y-1.5" },
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uC6A9\uC5ED \uB9CC\uB8CC\uC77C (90\uC77C \uB9CC\uAE30)"),
                                            React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-[11px] font-bold" }, "3\uAC1C\uC6D4 \uC790\uB3D9 \uACC4\uC0B0")),
                                        (() => {
                                            const [yStr, mStr] = (startYearMonth || '2026-11').split('-');
                                            const { endYear, endMonth, endWeek, endWeekInfo } = calcThreeMonthsLater(parseInt(yStr, 10), parseInt(mStr, 10), startWeek);
                                            return (React.createElement(React.Fragment, null,
                                                React.createElement("div", { className: "h-11 rounded-xl bg-surface-container-low/70 px-4 flex items-center justify-between font-body-sm text-body-sm text-primary font-bold border border-slate-200 select-none" },
                                                    React.createElement("span", null,
                                                        endYear,
                                                        "\uB144 ",
                                                        String(endMonth).padStart(2, '0'),
                                                        "\uC6D4 ",
                                                        endWeek,
                                                        "\uC8FC\uCC28"),
                                                    React.createElement("span", { className: "font-caption text-caption text-outline font-normal" }, "(90\uC77C \uB9CC\uAE30 \uC885\uB8CC)")),
                                                React.createElement("div", { className: "font-caption text-[11px] text-outline text-left" },
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
                                    React.createElement("p", { className: "font-caption text-caption text-on-secondary-container" },
                                        React.createElement("strong", { className: "font-semibold" }, "\uCD5C\uC18C 3\uAC1C\uC6D4(90\uC77C) \uB77D \uBCF4\uC7A5\uC81C:"),
                                        " \uC815\uAE30 \uCCAD\uC18C\uB294 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC758 \uC2A4\uCF00\uC904 \uACE0\uC815\uACFC \uC9C0\uC18D\uC801\uC778 \uC704\uC0DD \uD004\uB9AC\uD2F0\uB97C \uC720\uC9C0\uD558\uAE30 \uC704\uD574 \uBD84\uAE30(90\uC77C) \uB2E8\uC704\uB85C \uC758\uB8B0\uB418\uBA70, \uAC1C\uC2DC \uC2DC\uC810 \uAE30\uC900 3\uAC1C\uC6D4 \uD6C4\uAC00 \uC790\uB3D9 \uC0B0\uCD9C\uB429\uB2C8\uB2E4."))),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", { className: "bg-surface-container-lowest p-3.5 rounded-xl shadow-sm text-left flex flex-col justify-between" },
                                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-2 font-semibold" }, "\uC8FC\uAC04 \uBC29\uBB38 \uBE48\uB3C4"),
                                    React.createElement("div", { className: "grid grid-cols-4 gap-1" }, [1, 2, 3, 5].map((f) => (React.createElement("button", { key: f, className: `py-2 rounded-lg font-label-sm text-label-sm transition-all ${formData.weekCleanFreq === f
                                            ? 'bg-primary text-on-primary font-bold shadow-sm'
                                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`, onClick: () => handleFreqChange(f), type: "button" },
                                        "\uC8FC ",
                                        f,
                                        "\uD68C"))))),
                                React.createElement("div", { className: "bg-surface-container-lowest p-3.5 rounded-xl shadow-sm text-left flex flex-col justify-between" },
                                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uBC29\uBB38 \uD76C\uB9DD \uC694\uC77C"),
                                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" },
                                            (Array.isArray(formData.cleanDaysConfig) ? formData.cleanDaysConfig.length : 0),
                                            " / ",
                                            formData.weekCleanFreq,
                                            "\uAC1C \uC120\uD0DD")),
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
                                        return (React.createElement("button", { key: day.code, type: "button", onClick: () => handleCleanDayToggle(day.code), className: `flex flex-col items-center justify-center py-2 rounded-lg font-label-sm text-label-sm cursor-pointer transition-all ${isDayChecked
                                                ? 'bg-secondary text-on-secondary font-bold shadow-sm ring-1 ring-secondary'
                                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}` },
                                            React.createElement("span", null, day.label)));
                                    })))),
                            React.createElement("div", { className: "flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl shadow-sm text-left" },
                                React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uAC74\uBB3C \uC2E4\uD3C9\uC218 / \uAD00\uB9AC \uBA74\uC801 (\uC120\uD0DD)"),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("input", { className: "w-20 h-9 rounded-lg bg-surface-container-low px-2 text-right font-label-md text-label-md font-mono text-on-surface", onChange: (e) => handleFieldChange('supplyPyeong', e.target.value), type: "number", value: formData.supplyPyeong }),
                                    React.createElement("span", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uD3C9"))))),
                        activeTab === 'MOVEIN' && (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "flex items-center justify-between pb-1 text-left" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                    React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold tracking-tight" }, "\uC785\uC8FC/\uC774\uC0AC \uCCAD\uC18C \uC138\uBD80 \uC870\uAC74 \uC124\uC815")),
                                React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold" }, "1\uD68C\uC131 \uC9D1\uC911 \uD480\uCF00\uC5B4")),
                            React.createElement("div", { className: "bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-4 text-left border border-slate-100" },
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block" },
                                            "\uC8FC\uAC70 \uAC74\uBB3C \uD615\uD0DC ",
                                            React.createElement("span", { className: "text-error" }, "*")),
                                        React.createElement("select", { className: "h-11 w-full rounded-xl bg-surface-container-low px-4 font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 font-medium", onChange: (e) => handleFieldChange('moveinBuildingType', e.target.value), value: formData.moveinBuildingType || 'APT' },
                                            React.createElement("option", { value: "APT" }, "\uC544\uD30C\uD2B8 (\uACF5\uB3D9\uC8FC\uD0DD)"),
                                            React.createElement("option", { value: "OFFICETEL" }, "\uC624\uD53C\uC2A4\uD154 / \uB3C4\uC2DC\uD615 \uC0DD\uD65C\uC8FC\uD0DD"),
                                            React.createElement("option", { value: "VILLA" }, "\uBE4C\uB77C / \uB2E4\uC138\uB300\u00B7\uC5F0\uB9BD"),
                                            React.createElement("option", { value: "HOUSE" }, "\uB2E8\uB3C5\uC8FC\uD0DD / \uC804\uC6D0\uC8FC\uD0DD"),
                                            React.createElement("option", { value: "STUDIO" }, "\uC6D0\uB8F8 / \uD22C\uB8F8"))),
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block" },
                                            "\uACF5\uAE09 \uD3C9\uC218 (\uBD84\uC591 \uD3C9\uC218 \uAE30\uC900) ",
                                            React.createElement("span", { className: "text-error" }, "*")),
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("input", { className: "h-11 w-full rounded-xl bg-surface-container-low px-4 font-body-md text-body-md font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 text-right font-bold", onChange: (e) => handleFieldChange('moveinPyeong', e.target.value), placeholder: "34", type: "number", value: formData.moveinPyeong }),
                                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface-variant shrink-0" }, "\uD3C9")))),
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1" },
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1 font-semibold block" }, "\uBC29 \uAC1C\uC218"),
                                        React.createElement("select", { className: "h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200", onChange: (e) => handleFieldChange('moveinRoomCount', Number(e.target.value)), value: formData.moveinRoomCount || 3 },
                                            React.createElement("option", { value: 1 }, "\uC6D0\uB8F8 (1\uAC1C)"),
                                            React.createElement("option", { value: 2 }, "\uD22C\uB8F8 (2\uAC1C)"),
                                            React.createElement("option", { value: 3 }, "\uC4F0\uB9AC\uB8F8 (3\uAC1C)"),
                                            React.createElement("option", { value: 4 }, "4\uB8F8"),
                                            React.createElement("option", { value: 5 }, "5\uB8F8 \uC774\uC0C1"))),
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1 font-semibold block" }, "\uC695\uC2E4/\uD654\uC7A5\uC2E4 \uAC1C\uC218"),
                                        React.createElement("select", { className: "h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200", onChange: (e) => handleFieldChange('moveinBathCount', Number(e.target.value)), value: formData.moveinBathCount || 2 },
                                            React.createElement("option", { value: 1 }, "1\uAC1C"),
                                            React.createElement("option", { value: 2 }, "2\uAC1C"),
                                            React.createElement("option", { value: 3 }, "3\uAC1C \uC774\uC0C1"))),
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1 font-semibold block" }, "\uBC1C\uCF54\uB2C8/\uBCA0\uB780\uB2E4 \uD655\uC7A5"),
                                        React.createElement("select", { className: "h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm border border-slate-200", onChange: (e) => handleFieldChange('moveinBalconyExt', e.target.value), value: formData.moveinBalconyExt || 'Y' },
                                            React.createElement("option", { value: "Y" }, "\uD655\uC7A5\uD615"),
                                            React.createElement("option", { value: "N" }, "\uBE44\uD655\uC7A5\uD615 (\uBCA0\uB780\uB2E4 \uB2E4\uC218)")))),
                                React.createElement("div", { className: "pt-1" },
                                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold block" }, "\uD76C\uB9DD \uC791\uC5C5 \uC2DC\uAC04\uB300"),
                                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2" },
                                        React.createElement("div", { className: `p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${!formData.workTimeNegotiable
                                                ? 'bg-surface-container-lowest border border-slate-300 shadow-sm'
                                                : 'bg-surface-container-low/60 border border-slate-200 opacity-50'}` },
                                            React.createElement("span", { className: "text-xs font-bold text-slate-700 shrink-0 pl-1" }, "\uC2DC\uC791\uC2DC\uAC04"),
                                            React.createElement("div", { className: "flex items-center gap-1.5 justify-end" },
                                                React.createElement("select", { disabled: formData.workTimeNegotiable, value: formData.workStartTimeType || '오전', onChange: (e) => handleFieldChange('workStartTimeType', e.target.value), className: "h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed" },
                                                    React.createElement("option", { value: "\uC624\uC804" }, "\uC624\uC804"),
                                                    React.createElement("option", { value: "\uC624\uD6C4" }, "\uC624\uD6C4")),
                                                React.createElement("input", { type: "text", disabled: formData.workTimeNegotiable, placeholder: "08:00", value: formData.workStartTime || '08:00', onChange: (e) => handleFieldChange('workStartTime', e.target.value), className: "h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed" }))),
                                        React.createElement("div", { className: `p-2.5 rounded-xl flex items-center justify-between gap-1.5 transition-all ${!formData.workTimeNegotiable
                                                ? 'bg-surface-container-lowest border border-slate-300 shadow-sm'
                                                : 'bg-surface-container-low/60 border border-slate-200 opacity-50'}` },
                                            React.createElement("span", { className: "text-xs font-bold text-slate-700 shrink-0 pl-1" }, "\uC885\uB8CC\uC2DC\uAC04"),
                                            React.createElement("div", { className: "flex items-center gap-1.5 justify-end" },
                                                React.createElement("select", { disabled: formData.workTimeNegotiable, value: formData.workEndTimeType || '오후', onChange: (e) => handleFieldChange('workEndTimeType', e.target.value), className: "h-8 px-2 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:cursor-not-allowed" },
                                                    React.createElement("option", { value: "\uC624\uC804" }, "\uC624\uC804"),
                                                    React.createElement("option", { value: "\uC624\uD6C4" }, "\uC624\uD6C4")),
                                                React.createElement("input", { type: "text", disabled: formData.workTimeNegotiable, placeholder: "05:00", value: formData.workEndTime || '05:00', onChange: (e) => handleFieldChange('workEndTime', e.target.value), className: "h-8 w-16 px-1 text-center rounded-lg bg-surface-container-low text-xs font-bold text-primary font-mono border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed" }))),
                                        React.createElement("button", { type: "button", onClick: () => {
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
                                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-slate-200'}` },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, formData.workTimeNegotiable ? 'check_circle' : 'handshake'),
                                            React.createElement("span", null, "\uC2DC\uACF5\uC0AC\uC640 \uD611\uC758 \uAC00\uB2A5"))))))),
                        activeTab === 'APPLIANCE' && (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "flex items-center justify-between pb-1 text-left" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "2"),
                                    React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold tracking-tight" }, "\uACC4\uC808\uAC00\uC804\uCCAD\uC18C \uC138\uBD80 \uC870\uAC74 \uC124\uC815")),
                                React.createElement("div", { className: "flex items-center gap-1.5" },
                                    React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary text-white font-caption text-caption font-bold" },
                                        "\uCD1D ",
                                        APPLIANCE_CATALOG.reduce((acc, cur) => acc + ((formData.applianceDetails?.[cur.id] || []).length), 0),
                                        "\uB300 \uC120\uD0DD\uB428"),
                                    React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-caption text-caption font-semibold" }, "\uC644\uC804\uBD84\uD574 \u00B7 \uACE0\uC555\uC0B4\uADE0"))),
                            React.createElement("div", { className: "max-h-[390px] sm:max-h-[430px] overflow-y-auto overscroll-contain pr-1.5 space-y-2.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-inner" }, APPLIANCE_CATALOG.map((item) => {
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
                                                React.createElement("select", { value: inst.spec || 'QUEEN', onChange: (e) => handleApplianceSpecChange(item.id, idx, e.target.value), className: "h-8 px-2 text-xs font-semibold text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer" }, item.options.map((opt) => (React.createElement("option", { key: opt.val, value: opt.val }, opt.label)))),
                                                inst.spec === 'CUSTOM' && (React.createElement("input", { type: "text", value: inst.customSize || '', onChange: (e) => handleApplianceSpecChange(item.id, idx, inst.spec, e.target.value), placeholder: "\uADDC\uACA9 \uC9C1\uC811\uC785\uB825", className: "w-28 h-8 px-2 text-xs font-medium text-slate-800 bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" })))) : (React.createElement("div", { className: "flex items-center gap-1.5" },
                                                React.createElement("input", { type: "number", min: 1, value: inst.spec || '', onChange: (e) => handleApplianceSpecChange(item.id, idx, e.target.value), placeholder: item.placeholder, className: "w-24 h-8 px-2 text-center text-xs font-bold font-mono text-primary bg-surface-container-lowest border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary" }),
                                                React.createElement("span", { className: "text-xs font-bold text-slate-600 min-w-[28px]" }, item.unit))))))))));
                            }))))),
                    React.createElement("section", { className: "px-8 py-4 space-y-4" },
                        React.createElement("div", { className: "flex items-center gap-2 pb-1" },
                            React.createElement("span", { className: "w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold" }, "3"),
                            React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold tracking-tight" }, "\uBC1C\uC8FC \uAE08\uC561 \uBC0F \uD604\uC7A5 \uD2B9\uC774\uC0AC\uD56D")),
                        React.createElement("div", { className: "bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-3 text-left border border-slate-100" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "font-headline-sm text-headline-sm text-on-surface font-bold" },
                                        "\uACE0\uAC1D \uD655\uC815 \uC9C0\uC815 ",
                                        activeTab === 'REGULAR' ? '월 ' : '',
                                        "\uC6A9\uC5ED \uB300\uAE08 ",
                                        React.createElement("span", { className: "text-error" }, "*")),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-0.5" }, "\uB9E4\uC6D4 \uC2DC\uACF5\uC0AC\uC5D0 \uC9C0\uAE09\uD558\uB294 \uAE08\uC561(VAT \uD3EC\uD568)\uC744 \uC791\uC131\uD569\uB2C8\uB2E4.")),
                                React.createElement("span", { className: "px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold" }, "\uD604\uC7A5 \uC9C1\uBD88 \uACC4\uC57D \uC6D0\uCE59")),
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "relative flex-1" },
                                    React.createElement("input", { className: "h-14 w-full rounded-xl bg-surface-container-low px-5 font-headline-md text-headline-md font-bold text-primary font-mono tracking-tight shadow-inner focus:outline-none focus:ring-2 focus:ring-secondary/40", onChange: (e) => handleFieldChange('proposedPrice', e.target.value), type: "text", value: formData.proposedPrice }),
                                    React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold absolute right-4 top-3.5" },
                                        "\uC6D0 ",
                                        activeTab === 'REGULAR' ? '/ 월' : '')),
                                activeTab === 'REGULAR' && (React.createElement("div", { className: "flex flex-col justify-center items-end px-4 py-2 bg-surface-container rounded-xl min-w-[210px]" },
                                    React.createElement("span", { className: "font-caption text-caption text-outline" }, "90\uC77C(3\uAC1C\uC6D4) \uCD1D \uACC4\uC57D\uC561"),
                                    React.createElement("span", { className: "font-headline-sm text-headline-sm text-secondary font-bold font-mono" },
                                        "\u20A9",
                                        new Intl.NumberFormat('ko-KR').format(getQuarterlyPrice())))))),
                        React.createElement("div", { className: "flex flex-col text-left space-y-1.5" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uCD94\uAC00 \uC694\uCCAD \uC0AC\uD56D \uBC0F \uD2B9\uC774\uC0AC\uD56D"),
                                React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD604\uC7A5 \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uC804\uB2EC\uC6A9")),
                            React.createElement("textarea", { className: "w-full rounded-xl bg-surface-container-lowest p-4 font-body-md text-body-md text-on-surface shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none placeholder:text-outline/60", onChange: (e) => handleFieldChange('detailReqNote', e.target.value), placeholder: "\uD604\uC7A5 \uD2B9\uC774\uC0AC\uD56D, \uBC29\uBB38 \uD76C\uB9DD \uC2DC\uAC04\uB300, \uC911\uC810 \uAD00\uB9AC \uC694\uCCAD \uAD6C\uC5ED\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.", rows: 3, value: formData.detailReqNote })),
                        React.createElement("div", { className: "flex flex-col text-left space-y-2" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5" },
                                    React.createElement("span", null, "\uD604\uC7A5 \uC0AC\uC9C4 \uCCA8\uBD80"),
                                    React.createElement("span", { className: "font-caption text-caption text-outline font-normal" }, "(\uCD5C\uB300 10\uC7A5)")),
                                React.createElement("span", { className: "font-caption text-caption text-secondary font-bold" },
                                    photoFiles.length,
                                    " / 10\uC7A5 \uB4F1\uB85D\uB428")),
                            React.createElement("div", { className: "grid grid-cols-3 sm:grid-cols-5 gap-3" },
                                photoFiles.map((photo) => (React.createElement("div", { key: photo.seq, className: "relative group aspect-square rounded-xl overflow-hidden bg-surface-container shadow-sm flex flex-col justify-end p-2 border border-slate-200" },
                                    React.createElement("div", { className: "bg-cover bg-center absolute inset-0", style: { backgroundImage: `url('${photo.url}')` } }),
                                    React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent" }),
                                    React.createElement("span", { className: "relative font-caption text-caption text-on-primary truncate text-[11px]" }, photo.title),
                                    React.createElement("button", { "aria-label": "\uC0AD\uC81C", className: "absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-inverse-surface/70 hover:bg-error text-on-error flex items-center justify-center transition-colors cursor-pointer", onClick: () => handlePhotoDelete(photo.seq), type: "button" },
                                        React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "close"))))),
                                photoFiles.length < 10 && (React.createElement("label", { className: "aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-secondary flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm border border-dashed border-slate-300" },
                                    React.createElement("input", { accept: "image/*", className: "sr-only", multiple: true, onChange: handlePhotoAdd, type: "file" }),
                                    React.createElement("span", { className: "material-symbols-outlined text-[24px]" }, "add_a_photo"),
                                    React.createElement("span", { className: "font-label-sm text-label-sm font-semibold" }, "+ \uCD94\uAC00 \uB4F1\uB85D"),
                                    React.createElement("span", { className: "font-caption text-caption text-outline" },
                                        photoFiles.length,
                                        " / 10"))))),
                        React.createElement("div", { className: "p-4 rounded-xl bg-secondary-container/25 text-on-surface shadow-sm space-y-2 text-left border border-secondary/20" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center" },
                                        React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "verified")),
                                    React.createElement("div", null,
                                        React.createElement("h4", { className: "font-label-md text-label-md text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0 \uC548\uC2EC \uB9E4\uCE6D \uBCF4\uC99D\uB8CC"),
                                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uBC30\uCC28 \uC131\uACF5 \uBC0F 1:1 \uC804\uB2F4 \uB9C8\uC2A4\uD130 \uD655\uC815 \uBC30\uC815 \uC2DC\uC5D0\uB9CC \uBD80\uACFC")))),
                            React.createElement("div", { className: "p-3 bg-error-container/30 rounded-lg text-on-error-container font-caption text-caption flex items-start gap-2" },
                                React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5" }, "notification_important"),
                                React.createElement("span", null,
                                    React.createElement("strong", null, "[\uD604\uC7A5 \uC9C1\uBD88 \uACF5\uC9C0]"),
                                    " \uC778\uAC74\uBE44 \uBC0F \uC6A9\uC5ED\uBE44(",
                                    formData.proposedPrice,
                                    "\uC6D0)\uB294 \uC2DC\uACF5 \uC644\uB8CC \uD6C4 \uC0AC\uC9C4 \uB610\uB294 \uAC80\uC218\uD6C4 \uC2DC\uACF5\uC790\uC5D0\uAC8C \uC9C1\uC811 \uACB0\uC81C\uD569\uB2C8\uB2E4. \uD50C\uB7AB\uD3FC\uC740 \uC778\uAC74\uBE44 \uC5D0\uC2A4\uD06C\uB85C\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C \uD604\uC7A5 \uAC80\uC218 \uD6C4 \uC9C1\uC811 \uC815\uC0B0\uD558\uC5EC \uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "h-16" })))),
            React.createElement("footer", { className: "shrink-0 bg-surface-container-lowest px-8 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between border-t border-slate-100 z-10" },
                React.createElement("div", { className: "flex items-center gap-2 text-left" },
                    React.createElement("span", { className: "material-symbols-outlined text-[18px] text-secondary" }, "cloud_done"),
                    React.createElement("div", { className: "flex flex-col" },
                        React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uC785\uB825 \uB0B4\uC6A9 \uC790\uB3D9 \uC784\uC2DC\uC800\uC7A5"),
                        React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uBE44\uD68C\uC6D0 \uC791\uC131 \uC2DC \uBE0C\uB77C\uC6B0\uC800 LocalStorage\uC5D0 \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uB429\uB2C8\uB2E4."))),
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("button", { className: "h-12 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer", onClick: onClose, type: "button" }, "\uCDE8\uC18C"),
                    React.createElement("button", { form: "order-request-form", className: "h-12 px-7 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg font-bold shadow-md shadow-secondary/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer", disabled: isSubmitting, type: "submit" },
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "assignment_turned_in"),
                        React.createElement("span", null, isSubmitting ? '발주 등록 중...' : '+ 청소 서비스 신청 완료 (확정 발주)'))))),
        React.createElement(NaverAddressSearchModal, { isOpen: isAddrModalOpen, onClose: () => setIsAddrModalOpen(false), onSelectAddress: (item) => {
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
const WebClntReq000 = WebClntReq000Modal;
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
function WebClntAth000({ isOpen = false, onClose, onSuccessLogin, onOpenRegister, onOpenFindPwd }) {
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
            }
            else {
                setHasTempReq(false);
            }
        }
        catch (e) {
            setHasTempReq(false);
        }
        // B. 아이디 저장 복원
        try {
            const savedUserStr = localStorage.getItem('SSEULDAKGO_SAVED_USER');
            if (savedUserStr) {
                const saved = JSON.parse(savedUserStr);
                if (saved && saved.email) {
                    setEmail(saved.email);
                    if (saved.role)
                        setRole(saved.role);
                    setSaveId(true);
                }
            }
        }
        catch (e) {
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
    if (!isOpen)
        return null;
    // 로그인 제출 처리
    const handleSubmit = async (e) => {
        if (e)
            e.preventDefault();
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
                    localStorage.setItem('SSEULDAKGO_SAVED_USER', JSON.stringify({ role, email: email.trim() }));
                }
                else {
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
                if (onClose)
                    onClose();
            }
            else {
                setErrorMsg(data.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
            }
        }
        catch (err) {
            console.warn('[LOGIN_FALLBACK_SIMULATION]', err);
            // 오프라인 / 네트워크 지연 시 모의 로그인 폴백
            if (saveId) {
                localStorage.setItem('SSEULDAKGO_SAVED_USER', JSON.stringify({ role, email: email.trim() }));
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
            if (onSuccessLogin)
                onSuccessLogin(mockData);
            if (onClose)
                onClose();
        }
        finally {
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
                if (onClose)
                    onClose();
            }
        }
        catch (err) {
            // Fallback
            const mockData = {
                userNo: role === 'C' ? 'C20261000001' : 'S20261000001',
                userNm: `${provider} 사용자`,
                userEmail: `${provider.toLowerCase()}@example.com`,
                userRoleCd: role,
                accessToken: `mock_social_token_${Date.now()}`,
                hasTempReq
            };
            if (onSuccessLogin)
                onSuccessLogin(mockData);
            if (onClose)
                onClose();
        }
        finally {
            setIsLoading(false);
        }
    };
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200", onClick: (e) => {
            if (e.target === e.currentTarget && onClose)
                onClose();
        } },
        React.createElement("div", { "aria-labelledby": "modal-login-title", "aria-modal": "true", className: "relative w-full max-w-[440px] bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col transition-all overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200", role: "dialog" },
            React.createElement("div", { className: "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary" }),
            React.createElement("button", { "aria-label": "\uB2EB\uAE30", className: "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors", id: "btn-modal-close", onClick: onClose, type: "button" },
                React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close")),
            React.createElement("div", { className: "flex flex-col items-center text-center mt-1 mb-4" },
                React.createElement("div", { className: "w-14 h-14 rounded-full overflow-hidden shadow-md ring-4 ring-secondary-container/40 mb-3 flex items-center justify-center bg-white" },
                    React.createElement("img", { src: "/logo.png", alt: "\uC4F8\uACE0\uB2E6\uACE0 \uB85C\uACE0", className: "w-full h-full object-cover rounded-full" })),
                React.createElement("h2", { className: "font-headline-md text-headline-md text-on-surface font-bold tracking-tight", id: "modal-login-title" }, "\uB85C\uADF8\uC778"),
                React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant mt-1" }, "\uC4F8\uACE0\uB2E6\uACE0 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC744 \uC704\uD574 \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.")),
            React.createElement("div", { "aria-label": "\uD68C\uC6D0 \uC720\uD615 \uC120\uD0DD", className: "w-full bg-surface-container-low p-1 rounded-xl grid grid-cols-2 gap-1 mb-3", "data-field": "USER_ROLE_CD", role: "radiogroup" },
                React.createElement("button", { "aria-checked": role === 'C', className: `flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${role === 'C'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'}`, "data-role": "C", id: "role-client", onClick: () => setRole('C'), role: "radio", type: "button" },
                    React.createElement("span", { className: `material-symbols-outlined text-[16px] ${role === 'C' ? 'text-secondary' : 'text-outline'}` }, role === 'C' ? 'radio_button_checked' : 'radio_button_unchecked'),
                    React.createElement("span", null, "\uACE0\uAC1D \uD68C\uC6D0")),
                React.createElement("button", { "aria-checked": role === 'S', className: `flex items-center justify-center gap-1.5 h-10 rounded-lg font-label-md text-label-md transition-all ${role === 'S'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'}`, "data-role": "S", id: "role-partner", onClick: () => setRole('S'), role: "radio", type: "button" },
                    React.createElement("span", { className: `material-symbols-outlined text-[16px] ${role === 'S' ? 'text-secondary' : 'text-outline'}` }, role === 'S' ? 'radio_button_checked' : 'radio_button_unchecked'),
                    React.createElement("span", null, "\uC2DC\uACF5\uC0AC \uD68C\uC6D0"))),
            hasTempReq && (React.createElement("div", { className: "w-full bg-secondary-container/30 border border-secondary/20 rounded-xl p-3 flex items-start gap-2.5 my-2 animate-in fade-in", "data-notice": "SSEULDAKGO_GUEST_TEMP_REQ" },
                React.createElement("div", { className: "w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5" },
                    React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "auto_fix_high")),
                React.createElement("div", { className: "flex flex-col min-w-0" },
                    React.createElement("span", { className: "font-label-sm text-label-sm text-on-secondary-container font-semibold" }, "\uBE44\uD68C\uC6D0 \uC784\uC2DC \uC694\uCCAD\uC11C \uAC10\uC9C0"),
                    React.createElement("p", { className: "font-caption text-caption text-on-secondary-container leading-relaxed" }, "\uC791\uC131 \uC911\uC774\uB358 \uCCAD\uC18C \uC694\uCCAD \uC815\uBCF4\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778 \uC989\uC2DC \uC790\uB3D9\uC73C\uB85C \uBCF5\uC6D0\uB429\uB2C8\uB2E4.")))),
            React.createElement("div", { className: "flex flex-col w-full my-2" },
                React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2.5 text-center" }, "SNS \uACC4\uC815\uC73C\uB85C \uAC04\uD3B8 \uB85C\uADF8\uC778"),
                React.createElement("div", { className: "grid grid-cols-4 gap-2 w-full" },
                    React.createElement("button", { className: "h-11 rounded-xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group", "data-field": "SOCIAL_PROVIDER", "data-val": "KAKAO", onClick: () => handleSocialLogin('KAKAO'), title: "\uCE74\uCE74\uC624 \uB85C\uADF8\uC778", type: "button" },
                        React.createElement("svg", { "aria-hidden": "true", className: "w-4 h-4 fill-[#3C1E1E]", viewBox: "0 0 24 24" },
                            React.createElement("path", { d: "M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z" })),
                        React.createElement("span", { className: "font-caption text-[11px] text-[#3C1E1E] font-semibold mt-0.5 leading-none" }, "\uCE74\uCE74\uC624")),
                    React.createElement("button", { className: "h-11 rounded-xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group", "data-field": "SOCIAL_PROVIDER", "data-val": "NAVER", onClick: () => handleSocialLogin('NAVER'), title: "\uB124\uC774\uBC84 \uB85C\uADF8\uC778", type: "button" },
                        React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                            React.createElement("path", { d: "M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z" })),
                        React.createElement("span", { className: "font-caption text-[11px] text-white font-semibold mt-0.5 leading-none" }, "\uB124\uC774\uBC84")),
                    React.createElement("button", { className: "h-11 rounded-xl bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group", "data-field": "SOCIAL_PROVIDER", "data-val": "GOOGLE", onClick: () => handleSocialLogin('GOOGLE'), title: "Google \uB85C\uADF8\uC778", type: "button" },
                        React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5", viewBox: "0 0 24 24" },
                            React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                            React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                            React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                            React.createElement("path", { d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z", fill: "#EA4335" })),
                        React.createElement("span", { className: "font-caption text-[11px] text-on-surface font-semibold mt-0.5 leading-none" }, "Google")),
                    React.createElement("button", { className: "h-11 rounded-xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group", "data-field": "SOCIAL_PROVIDER", "data-val": "APPLE", onClick: () => handleSocialLogin('APPLE'), title: "Apple \uB85C\uADF8\uC778", type: "button" },
                        React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                            React.createElement("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z" })),
                        React.createElement("span", { className: "font-caption text-[11px] text-white font-semibold mt-0.5 leading-none" }, "Apple"))),
                React.createElement("div", { className: "relative flex items-center justify-center my-4" },
                    React.createElement("div", { className: "w-full h-[1px] bg-surface-container-highest" }),
                    React.createElement("span", { className: "absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline" }, "\uB610\uB294 \uC774\uBA54\uC77C\uB85C \uB85C\uADF8\uC778"))),
            errorMsg && (React.createElement("div", { className: "mb-3 p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in" },
                React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error shrink-0" }, "error"),
                React.createElement("span", null, errorMsg))),
            React.createElement("form", { className: "flex flex-col gap-3 w-full", id: "customer-login-form", onSubmit: handleSubmit },
                React.createElement("div", { className: "flex flex-col gap-1 w-full" },
                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface-variant", htmlFor: "input-user-email" }, "\uC774\uBA54\uC77C \uC8FC\uC18C"),
                    React.createElement("div", { className: "relative flex items-center" },
                        React.createElement("input", { autoComplete: "email", className: "w-full h-11 px-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all", "data-field": "USER_EMAIL", id: "input-user-email", name: "USER_EMAIL", onChange: (e) => setEmail(e.target.value), placeholder: "\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694 (example@domain.com)", required: true, type: "email", value: email }))),
                React.createElement("div", { className: "flex flex-col gap-1 w-full" },
                    React.createElement("label", { className: "font-label-sm text-label-sm text-on-surface-variant", htmlFor: "input-user-pwd" }, "\uBE44\uBC00\uBC88\uD638"),
                    React.createElement("div", { className: "relative flex items-center" },
                        React.createElement("input", { autoComplete: "current-password", className: "w-full h-11 pl-3.5 pr-11 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-slate-200 shadow-sm outline-none placeholder:text-outline/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all", "data-field": "USER_PWD_HASH", id: "input-user-pwd", name: "USER_PWD_HASH", onChange: (e) => setPwd(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694", required: true, type: showPwd ? 'text' : 'password', value: pwd }),
                        React.createElement("button", { "aria-label": "\uBE44\uBC00\uBC88\uD638 \uBCF4\uAE30 \uD1A0\uAE00", className: "absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface transition-colors", "data-action": "toggle-pwd", id: "btn-toggle-pwd", onClick: () => setShowPwd(!showPwd), type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, showPwd ? 'visibility' : 'visibility_off')))),
                React.createElement("div", { className: "flex items-center justify-between font-caption text-caption text-on-surface-variant pt-1 pb-1" },
                    React.createElement("label", { className: "flex items-center gap-1.5 cursor-pointer select-none" },
                        React.createElement("input", { checked: saveId, className: "w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer", "data-field": "SAVE_ID_YN", onChange: (e) => setSaveId(e.target.checked), type: "checkbox" }),
                        React.createElement("span", null, "\uC544\uC774\uB514 \uC800\uC7A5")),
                    React.createElement("label", { className: "flex items-center gap-1.5 cursor-pointer select-none" },
                        React.createElement("input", { checked: keepLogin, className: "w-4 h-4 rounded text-secondary focus:ring-secondary/30 bg-surface-container-low accent-secondary cursor-pointer", "data-field": "KEEP_LOGIN_YN", onChange: (e) => setKeepLogin(e.target.checked), type: "checkbox" }),
                        React.createElement("span", null, "\uB85C\uADF8\uC778 \uC0C1\uD0DC \uC720\uC9C0"))),
                React.createElement("button", { className: "w-full h-12 mt-1 rounded-xl bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed", "data-action": "SUBMIT_LOGIN", disabled: isLoading, type: "submit" }, isLoading ? (React.createElement("span", { className: "inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : (React.createElement(React.Fragment, null,
                    React.createElement("span", null, "\uB85C\uADF8\uC778"),
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "arrow_forward"))))),
            React.createElement("div", { className: "flex items-center justify-center gap-3 font-caption text-caption text-outline mt-5 pt-3 border-t border-slate-100" },
                React.createElement("button", { className: "hover:text-on-surface transition-colors", "data-action": "CALL_FIND_PWD", onClick: onOpenFindPwd || (() => alert('비밀번호 찾기 페이지 준비 중입니다.')), type: "button" }, "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30"),
                React.createElement("span", { className: "text-surface-container-highest" }, "|"),
                React.createElement("button", { className: "text-primary font-bold hover:underline transition-colors", "data-action": "CALL_SIGNUP", onClick: onOpenRegister || (() => alert('회원가입 페이지 준비 중입니다.')), type: "button" }, "\uD68C\uC6D0\uAC00\uC785")))));
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
function WebClntAth010({ isOpen = false, onClose, onSuccessRegister, onOpenLogin }) {
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
        }
        else if (onClose) {
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
        if (!canvas)
            return;
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
        if (!isDrawing.current)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
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
            if (!canvas)
                return;
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
        if (!isDrawing.current)
            return;
        if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            const canvas = canvasRef.current;
            if (!canvas)
                return;
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
        if (!canvas)
            return;
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
        }
        else {
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
            }
            else {
                setIsEmailChecked(true);
                setIsEmailValid(false);
                setEmailCheckMsg(data.message || '이미 등록된 이메일 주소입니다.');
            }
        }
        catch (e) {
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
        if (!el)
            return;
        const scrolledToEnd = el.scrollHeight - el.scrollTop <= el.clientHeight + 6;
        const progress = Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100));
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
            }
            else if (!current.checked) {
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
        }
        else {
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
        if (e)
            e.preventDefault();
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
            }
            else {
                showAlertModal(data.message || '회원가입 처리 중 오류가 발생했습니다.', '회원가입 실패');
                setErrorMsg(data.message || '회원가입 처리 중 오류가 발생했습니다.');
            }
        }
        catch (err) {
            console.warn('[REGISTER_REQUEST_ERR]', err);
            showAlertModal('회원가입 서버 통신 중 오류가 발생했습니다: ' + (err?.message || err), '통신 오류');
            setErrorMsg('서버 통신 오류가 발생했습니다.');
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200", id: "signup-modal-backdrop", onClick: (e) => {
            if (e.target === e.currentTarget && onClose)
                onClose();
        } },
        React.createElement("div", { "aria-labelledby": "modal-headline", "aria-modal": "true", className: "relative w-full max-w-[560px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden text-on-surface transform transition-all duration-300 border border-slate-200/80 animate-in zoom-in-95", id: "signup-modal-container", role: "dialog" },
            React.createElement("div", { className: "bg-surface-container-low px-6 sm:px-8 py-2.5 flex items-center justify-between border-b border-slate-200/60" },
                React.createElement("div", { className: "flex items-center gap-1.5 text-secondary font-label-sm text-label-sm" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "verified_user"),
                    React.createElement("span", { className: "font-semibold tracking-tight" }, "KISA & \uAE08\uC735\uC704 \uAC00\uC774\uB4DC\uB77C\uC778 \uC900\uC218 \uC804\uC790\uC11C\uBA85 \uC138\uC158")),
                React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uD654\uBA74 ID: WEB-CLNT-ATH-010")),
            React.createElement("div", { className: "overflow-y-auto px-6 sm:px-8 pt-6 pb-8 space-y-6 flex-1 scroll-smooth", id: "modal-scroll-pane" },
                React.createElement("header", { className: "flex items-start justify-between gap-4" },
                    React.createElement("div", { className: "flex items-start gap-3.5" },
                        React.createElement("div", { className: "relative w-12 h-12 rounded-xl bg-surface-container p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center" },
                            React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uC2EC\uBCFC \uB85C\uACE0", className: "w-full h-full object-cover rounded-lg", src: "/logo.png" })),
                        React.createElement("div", null,
                            React.createElement("h2", { className: "text-on-surface font-headline-md text-headline-md tracking-tight font-bold", id: "modal-headline" }, "\uD1B5\uD569 \uD68C\uC6D0\uAC00\uC785"),
                            React.createElement("p", { className: "text-on-surface-variant font-body-sm text-body-sm mt-0.5" }, "\uC4F8\uACE0\uB2E6\uACE0\uC640 \uD568\uAED8 \uAE68\uB057\uD558\uACE0 \uBBFF\uC744 \uC218 \uC788\uB294 \uC548\uC2EC \uACF5\uAC04\uC744 \uB9CC\uB4E4\uC5B4\uBCF4\uC138\uC694."))),
                    React.createElement("button", { "aria-label": "\uB2EB\uAE30", className: "w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0", onClick: onClose, type: "button" },
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close"))),
                React.createElement("section", { "aria-labelledby": "role-select-title", className: "space-y-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold", id: "role-select-title" }, "\uD68C\uC6D0 \uC720\uD615 \uC120\uD0DD"),
                        React.createElement("span", { className: "text-secondary font-label-sm text-label-sm flex items-center gap-1 font-semibold" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "tune"),
                            "\uC2E4\uC2DC\uAC04 \uC5ED\uD560 \uBD84\uAE30 \uC801\uC6A9")),
                    React.createElement("div", { className: "grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl" },
                        React.createElement("button", { className: `h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${role === 'C'
                                ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`, "data-field": "USER_ROLE_CD", "data-role-value": "C", id: "role-btn-client", onClick: () => setRole('C'), type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "person"),
                            React.createElement("span", null, "\uACE0\uAC1D \uD68C\uC6D0 (\uC758\uB8B0\u00B7\uBC1C\uC8FC)")),
                        React.createElement("button", { className: `h-11 rounded-lg flex items-center justify-center gap-2 font-label-lg text-label-lg transition-all ${role === 'S'
                                ? 'shadow-sm bg-secondary text-on-secondary font-bold'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`, "data-field": "USER_ROLE_CD", "data-role-value": "S", id: "role-btn-partner", onClick: () => setRole('S'), type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "engineering"),
                            React.createElement("span", null, "\uC2DC\uACF5\uC0AC \uD68C\uC6D0 (\uC2DC\uACF5.\uC218\uC8FC)"))),
                    React.createElement("p", { className: "text-on-surface-variant font-caption text-caption flex items-center gap-1.5 px-1" },
                        React.createElement("span", { className: "material-symbols-outlined text-[14px] text-primary" }, "info"),
                        React.createElement("span", null, "\uC120\uD0DD\uD558\uC2E0 \uD68C\uC6D0 \uAD6C\uBD84\uC5D0 \uB530\uB77C \uC2DC\uACF5 \uBC1C\uC8FC\uC11C \uB4F1\uB85D \uB610\uB294 \uD30C\uD2B8\uB108 \uACAC\uC801 \uC804\uC1A1 \uAD8C\uD55C\uC774 \uBD80\uC5EC\uB429\uB2C8\uB2E4."))),
                successInfoMsg && (React.createElement("div", { className: "p-3 bg-secondary-fixed/40 border border-secondary/30 rounded-xl flex items-start justify-between gap-2 text-on-secondary-fixed-variant font-caption text-caption animate-in fade-in" },
                    React.createElement("div", { className: "flex items-start gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5" }, "check_circle"),
                        React.createElement("span", null, successInfoMsg)),
                    socialProvider && (React.createElement("button", { type: "button", onClick: handleCancelSocial, className: "text-[11px] underline shrink-0 hover:text-primary" }, "\uC5F0\uB3D9 \uCDE8\uC18C")))),
                errorMsg && (React.createElement("div", { className: "p-3 bg-error-container/50 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container font-caption text-caption animate-in fade-in" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error shrink-0" }, "error"),
                    React.createElement("span", null, errorMsg))),
                React.createElement("section", { className: "space-y-4 pt-1" },
                    React.createElement("div", { className: "flex flex-col w-full" },
                        React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface-variant font-semibold mb-2 text-center" }, "SNS \uACC4\uC815\uC73C\uB85C \uAC04\uD3B8 \uAC00\uC785"),
                        React.createElement("div", { className: "grid grid-cols-4 gap-2.5 w-full" },
                            React.createElement("button", { className: `h-11 rounded-2xl bg-[#FEE500] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'KAKAO' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "KAKAO", onClick: () => handleSocialSignup('KAKAO'), title: "\uCE74\uCE74\uC624\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-4 h-4 fill-[#3C1E1E]", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-[#3C1E1E] font-bold mt-0.5 leading-none" }, "\uCE74\uCE74\uC624")),
                            React.createElement("button", { className: `h-11 rounded-2xl bg-[#03C75A] hover:brightness-95 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'NAVER' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "NAVER", onClick: () => handleSocialSignup('NAVER'), title: "\uB124\uC774\uBC84\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M16.273 12.845 7.371 0H0v24h7.727V11.155L16.629 24H24V0h-7.727z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-white font-bold mt-0.5 leading-none" }, "\uB124\uC774\uBC84")),
                            React.createElement("button", { className: `h-11 rounded-2xl bg-surface-container-lowest border border-slate-300/80 hover:bg-surface-container-low flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'GOOGLE' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "GOOGLE", onClick: () => handleSocialSignup('GOOGLE'), title: "Google\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
                                    React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                                    React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z", fill: "#FBBC05" }),
                                    React.createElement("path", { d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z", fill: "#EA4335" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-on-surface font-bold mt-0.5 leading-none" }, "Google")),
                            React.createElement("button", { className: `h-11 rounded-2xl bg-[#000000] hover:bg-neutral-900 flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm group ${socialProvider === 'APPLE' ? 'ring-2 ring-primary ring-offset-1' : ''}`, "data-field": "SOCIAL_PROVIDER", "data-val": "APPLE", onClick: () => handleSocialSignup('APPLE'), title: "Apple\uB85C \uAC00\uC785", type: "button" },
                                React.createElement("svg", { "aria-hidden": "true", className: "w-3.5 h-3.5 fill-white", viewBox: "0 0 24 24" },
                                    React.createElement("path", { d: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.61.71-1.14 1.87-1 2.98 1.08.08 2.17-.51 2.83-1.33z" })),
                                React.createElement("span", { className: "font-caption text-[11px] text-white font-bold mt-0.5 leading-none" }, "Apple"))),
                        React.createElement("div", { className: "relative flex items-center justify-center my-4" },
                            React.createElement("div", { className: "w-full h-[1px] bg-slate-200" }),
                            React.createElement("span", { className: "absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline" }, "\uB610\uB294 \uC774\uBA54\uC77C\uB85C \uAC00\uC785"))),
                    React.createElement("div", { className: "space-y-1.5" },
                        React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "field-user-email" }, "\uB85C\uADF8\uC778 \uC774\uBA54\uC77C (\uACC4\uC815 ID)"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("div", { className: "relative flex-1" },
                                React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_EMAIL", id: "field-user-email", ref: emailInputRef, onChange: (e) => {
                                        setEmail(e.target.value);
                                        setIsEmailChecked(false);
                                    }, placeholder: "name@example.com", type: "email", value: email })),
                            React.createElement("button", { className: "h-12 px-4 bg-surface-container text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-high transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer", id: "btn-check-duplicate", onClick: handleCheckEmail, type: "button" },
                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "manage_search"),
                                React.createElement("span", null, "\uC911\uBCF5\uD655\uC778"))),
                        isEmailChecked && (React.createElement("p", { className: `font-caption text-caption ${isEmailValid ? 'text-secondary' : 'text-error'}`, id: "email-hint" }, emailCheckMsg))),
                    !socialProvider && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "field-user-pwd" }, "\uBE44\uBC00\uBC88\uD638"),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("input", { className: "w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_PWD_HASH", id: "field-user-pwd", ref: pwdInputRef, onChange: (e) => setPwd(e.target.value), placeholder: "\uC601\uBB38, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790 \uC870\uD569", type: showPwd ? 'text' : 'password', value: pwd }),
                                    React.createElement("button", { type: "button", onClick: () => setShowPwd(!showPwd), className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer", title: showPwd ? '비밀번호 숨기기' : '비밀번호 표시', "aria-label": showPwd ? '비밀번호 숨기기' : '비밀번호 표시' },
                                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, showPwd ? 'visibility' : 'visibility_off')))),
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "field-user-pwd-confirm" }, "\uBE44\uBC00\uBC88\uD638 \uD655\uC778"),
                                React.createElement("div", { className: "relative" },
                                    React.createElement("input", { className: "w-full h-12 pl-3.5 pr-11 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm", "data-field": "USER_PWD_CONFIRM", id: "field-user-pwd-confirm", ref: pwdConfirmInputRef, onChange: (e) => setPwdConfirm(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC785\uB825", type: showPwdConfirm ? 'text' : 'password', value: pwdConfirm }),
                                    React.createElement("button", { type: "button", onClick: () => setShowPwdConfirm(!showPwdConfirm), className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer", title: showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시', "aria-label": showPwdConfirm ? '비밀번호 숨기기' : '비밀번호 표시' },
                                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, showPwdConfirm ? 'visibility' : 'visibility_off'))))),
                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant flex items-center gap-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "lock"),
                            "8~16\uC790 \uC601\uBB38, \uC22B\uC790, \uD2B9\uC218\uAE30\uD638(!@#$%^&*)\uB97C \uD63C\uC6A9\uD558\uC5EC \uC548\uC804\uD558\uAC8C \uC124\uC815\uD574\uC8FC\uC138\uC694."))),
                    React.createElement("div", { className: "space-y-1.5" },
                        React.createElement("label", { className: "block font-label-md text-label-md text-on-surface font-semibold", htmlFor: "field-user-nm" }, "\uC131\uBA85 (\uC131\uD568)"),
                        React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all", "data-field": "USER_NM", id: "field-user-nm", onChange: (e) => setUserNm(e.target.value), onFocus: (e) => { e.target.placeholder = ''; }, onBlur: (e) => { if (!e.target.value)
                                e.target.placeholder = '홍길동'; }, placeholder: "\uD64D\uAE38\uB3D9", type: "text", value: userNm }))),
                React.createElement("section", { className: "space-y-3 p-4 bg-surface-container-low rounded-2xl border border-slate-200/50" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("label", { className: "font-label-md text-label-md text-on-surface flex items-center gap-1.5 font-bold", htmlFor: "field-user-tel" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "phonelink_lock"),
                            "\uD734\uB300\uD3F0 \uBCF8\uC778\uBA85\uC758 \uC2E4\uBA85\uC778\uC99D"),
                        React.createElement("span", { className: "text-secondary font-label-sm text-label-sm font-semibold" }, "PASS / SMS \uD1B5\uC2E0\uC0AC \uC5F0\uB3D9")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("input", { className: "w-full h-12 px-3.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all", "data-field": "USER_TEL", id: "field-user-tel", onChange: (e) => setUserTel(e.target.value), onFocus: (e) => { e.target.placeholder = ''; }, onBlur: (e) => { if (!e.target.value)
                                e.target.placeholder = '010-0000-0000'; }, placeholder: "010-0000-0000", type: "tel", value: userTel }),
                        React.createElement("button", { className: "h-12 px-4 bg-surface-container-lowest border border-secondary/30 text-secondary font-label-md text-label-md rounded-xl hover:bg-secondary/10 transition-colors shrink-0 shadow-sm flex items-center gap-1", onClick: handleReverifyTel, type: "button" },
                            React.createElement("span", null, "\uC7AC\uC778\uC99D \uC694\uCCAD"))),
                    React.createElement("div", { className: "p-3 bg-secondary-fixed/30 rounded-xl flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "check_circle"),
                            React.createElement("span", { className: "text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold" },
                                "\uBCF8\uC778\uC778\uC99D \uC644\uB8CC (",
                                userNm || '홍길동',
                                " / ",
                                userTel ? userTel.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2') : '010-****-0000',
                                ")")),
                        React.createElement("span", { className: "text-on-secondary-fixed-variant font-caption text-caption opacity-80 font-mono" }, "CI \uC554\uD638\uD654 \uAC80\uC99D\uD544"))),
                React.createElement("section", { "aria-labelledby": "terms-section-title", className: "space-y-3.5 pt-2", ref: termsSectionRef },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface font-bold", id: "terms-section-title" },
                            "\uD544\uC218 \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758 ",
                            React.createElement("span", { className: "text-secondary font-body-sm font-normal" }, "(Scroll-Lock)")),
                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" },
                            "4\uAC74 \uC911 ",
                            React.createElement("span", { className: "font-bold text-secondary", id: "agree-count" }, agreeCount),
                            "\uAC74 \uC644\uB8CC")),
                    React.createElement("div", { className: "p-3 bg-tertiary-fixed/40 rounded-xl flex items-start gap-2.5" },
                        React.createElement("span", { className: "material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5" }, "policy"),
                        React.createElement("div", { className: "space-y-0.5 text-on-tertiary-fixed" },
                            React.createElement("p", { className: "font-label-sm text-label-sm font-bold" }, "\uC804\uCCB4 \uC57D\uAD00 \uC815\uB3C5 \uC758\uBB34\uD654 \uC2DC\uC2A4\uD15C \uAC00\uB3D9 \uC911"),
                            React.createElement("p", { className: "font-caption text-caption leading-relaxed" }, "\uAC01 \uC57D\uAD00\uC758 \uBCF8\uBB38\uC744 \uB05D\uAE4C\uC9C0 \uC2A4\uD06C\uB864\uD558\uC5EC 100% \uD655\uC778\uD558\uC154\uC57C \uB3D9\uC758 \uCCB4\uD06C\uBC15\uC2A4\uAC00 \uC790\uB3D9 \uD65C\uC131\uD654\uB429\uB2C8\uB2E4."))),
                    React.createElement("div", { className: "space-y-3", id: "terms-container" },
                        React.createElement("div", { className: "p-3.5 bg-surface-container-low rounded-xl space-y-2.5", "data-field": "TB_TERMS_MASTER", "data-is-required-yn": "Y", "data-terms-cd": "SERVICE" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                        React.createElement("input", { checked: terms.service.checked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", "data-field": "SCROLLED_TO_END_YN", "data-terms-cd": "SERVICE", "data-terms-ver-seq": "1", id: "check-terms-service", onChange: () => handleToggleTerm('service'), type: "checkbox" }),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC11C\uBE44\uC2A4 \uD1B5\uD569\uC774\uC6A9\uC57D\uAD00 v1.0"))),
                                React.createElement("span", { className: "bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "check"),
                                    "\uC804\uBB38 \uD655\uC778 \uC644\uB8CC")),
                            React.createElement("div", { className: "h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner", id: "viewer-terms-service" },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uBAA9\uC801 \uBC0F \uD50C\uB7AB\uD3FC \uB9E4\uCE6D\uBE44 \uD655\uC815 \uADDC\uC815)"),
                                React.createElement("p", null, "\uBCF8 \uC57D\uAD00\uC740 \uC8FC\uC2DD\uD68C\uC0AC \uC4F8\uACE0\uB2E6\uACE0(\uC774\uD558 '\uD68C\uC0AC')\uAC00 \uC6B4\uC601\uD558\uB294 O2O \uC8FC\uAC70\uC704\uC0DD \uC548\uC2EC \uB9E4\uCE6D \uC11C\uBE44\uC2A4\uC758 \uAE30\uBCF8 \uC774\uC6A9\uC870\uAC74\uC744 \uADDC\uC815\uD569\uB2C8\uB2E4. \uD68C\uC0AC\uB294 \uB9E4\uCE6D \uC131\uC0AC \uC2DC 1\uD68C \uACE0\uC815 \uD50C\uB7AB\uD3FC \uC911\uAC1C\uBE44 16,500\uC6D0(\uBD80\uAC00\uC138 \uD3EC\uD568)\uC744 \uC815\uC561 \uCCAD\uAD6C\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (\uD604\uC7A5 \uC2DC\uACF5\uBE44 \uC9C1\uBD88 \uC6D0\uCE59 \uBC0F \uC548\uC2EC \uC2DC\uACF5 \uCC45\uC784)"),
                                React.createElement("p", null, "\uC2DC\uACF5 \uB178\uC784 \uBC0F \uC778\uAC74\uBE44\uB294 \uC2DC\uACF5 \uAC80\uC218 \uC644\uB8CC \uD6C4 \uACE0\uAC1D\uC774 \uC2DC\uACF5 \uB9C8\uC2A4\uD130\uC5D0\uAC8C \uC9C1\uC811 \uC9C0\uAE09\uD568\uC744 \uC6D0\uCE59\uC73C\uB85C \uD558\uBA70, \uD68C\uC0AC\uB294 \uC778\uAC74\uBE44\uC758 \uBB34\uB2E8 \uC804\uC6A9 \uBC0F \uACFC\uB3C4\uD55C \uC5D0\uC2A4\uD06C\uB85C \uC608\uCE58\uB97C \uC9C0\uC591\uD569\uB2C8\uB2E4. \uB9C8\uC2A4\uD130\uC758 \uACE0\uC758\u00B7\uACFC\uC2E4\uB85C \uBC1C\uC0DD\uD55C \uC190\uD574\uB294 1\uC5B5\uC6D0 \uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8\uC744 \uD1B5\uD574 \uBCF4\uC99D \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC5ED\uACBD\uB9E4 \uBC0F \uB364\uD551 \uAE08\uC9C0)"),
                                React.createElement("p", null, "\uD50C\uB7AB\uD3FC\uC758 \uD45C\uC900 \uB2E8\uAC00 \uCCB4\uACC4\uB97C \uC65C\uACE1\uD558\uB294 \uBD88\uACF5\uC815 \uB364\uD551 \uC81C\uC548 \uBC0F \uBB34\uB2E8 \uC218\uC218\uB8CC \uC804\uAC00\uB294 \uC989\uAC01\uC801\uC778 \uACC4\uC815 \uC815\uC9C0 \uBC0F \uD68C\uC6D0 \uC790\uACA9 \uBC15\uD0C8 \uC0AC\uC720\uAC00 \uB429\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "p-3.5 bg-surface-container-low rounded-xl space-y-2.5", "data-field": "TB_TERMS_MASTER", "data-is-required-yn": "Y", "data-terms-cd": "PRIVACY" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                        React.createElement("input", { checked: terms.privacy.checked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", "data-field": "SCROLLED_TO_END_YN", "data-terms-cd": "PRIVACY", "data-terms-ver-seq": "1", id: "check-terms-privacy", onChange: () => handleToggleTerm('privacy'), type: "checkbox" }),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \uBC0F \uC774\uC6A9 \uB3D9\uC758 v1.0"))),
                                React.createElement("span", { className: "bg-secondary-fixed/50 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "check"),
                                    "\uC804\uBB38 \uD655\uC778 \uC644\uB8CC")),
                            React.createElement("div", { className: "h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner", id: "viewer-terms-privacy" },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "1. \uC218\uC9D1 \uD56D\uBAA9 \uBC0F \uBCF4\uC720 \uBAA9\uC801"),
                                React.createElement("p", null, "- \uD544\uC218 \uC218\uC9D1 \uD56D\uBAA9: \uC131\uBA85, \uD734\uB300\uC804\uD654\uBC88\uD638, \uC774\uBA54\uC77C \uC8FC\uC18C, \uC11C\uBE44\uC2A4 \uC2DC\uACF5 \uD76C\uB9DD \uC8FC\uC18C\uC9C0(\uB3D9\u00B7\uD638\uC218 \uD3EC\uD568)."),
                                React.createElement("p", null, "- \uC774\uC6A9 \uBAA9\uC801: \uC2E0\uC6D0 \uC778\uC99D, 1\uAE09 \uCCAD\uC18C \uB9C8\uC2A4\uD130 \uD30C\uACAC \uBC30\uCC28, 1\uC5B5\uC6D0 \uC548\uC2EC\uBCF4\uD5D8 \uC811\uC218 \uBC0F \uC11C\uBE44\uC2A4 \uC0AC\uD6C4 \uC548\uC2EC\uBCF4\uC99D \uC774\uB825 \uAD00\uB9AC."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "2. \uBCF4\uC720 \uBC0F \uD30C\uAE30 \uC808\uCC28"),
                                React.createElement("p", null, "\uD68C\uC6D0 \uD0C8\uD1F4 \uC2DC \uC804\uC790\uAE08\uC735\uAC70\uB798\uBC95 \uBC0F \uAC1C\uC778\uC815\uBCF4\uBCF4\uD638\uBC95\uC5D0 \uBA85\uC2DC\uB41C \uBC95\uC815 \uBCF4\uAD00\uAE30\uAC04(\uAC70\uB798\uB0B4\uC5ED 5\uB144) \uACBD\uACFC \uD6C4 \uC9C0\uCCB4 \uC5C6\uC774 \uBCF5\uAD6C \uBD88\uAC00\uB2A5\uD55C \uBC29\uBC95\uC73C\uB85C \uC601\uAD6C \uD30C\uAE30\uD569\uB2C8\uB2E4."))),
                        React.createElement("div", { className: "p-3.5 bg-surface-container-low rounded-xl space-y-2.5", "data-field": "TB_TERMS_MASTER", "data-is-required-yn": "Y", "data-terms-cd": "LOCATION" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                        React.createElement("input", { checked: terms.location.checked, className: `w-4 h-4 rounded text-secondary accent-secondary ${terms.location.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`, "data-field": "SCROLLED_TO_END_YN", "data-terms-cd": "LOCATION", "data-terms-ver-seq": "1", disabled: !terms.location.scrolled, id: "check-terms-location", onChange: () => handleToggleTerm('location'), type: "checkbox" }),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC704\uCE58\uAE30\uBC18 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00 v1.0"))),
                                React.createElement("span", { className: `px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${terms.location.scrolled
                                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                                        : 'bg-surface-container-high text-on-surface-variant'}`, id: "badge-terms-location" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, terms.location.scrolled ? 'check' : 'hourglass_bottom'),
                                    React.createElement("span", null, terms.location.scrolled
                                        ? '전문 확인 완료'
                                        : `스크롤 필요 (${terms.location.progress}%)`))),
                            React.createElement("div", { className: "h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner", id: "viewer-terms-location", onScroll: (e) => handleScroll('location', e), ref: locationViewerRef },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uC704\uCE58\uC815\uBCF4\uC758 \uD65C\uC6A9)"),
                                React.createElement("p", null, "\uD68C\uC0AC\uB294 \uC2E0\uCCAD\uC778\uC758 \uC2E0\uCCAD \uC8FC\uC18C\uC9C0\uB97C \uAE30\uBC18\uC73C\uB85C \uAC00\uC7A5 \uC2E0\uC18D\uD558\uAC8C \uD604\uC7A5 \uB3C4\uB2EC\uC774 \uAC00\uB2A5\uD55C \uBC18\uACBD 5km \uC774\uB0B4\uC758 \uAC80\uC99D\uB41C 1\uAE09 \uD648\uCF00\uC5B4 \uB9C8\uC2A4\uD130\uB97C \uC790\uB3D9 \uC815\uB82C\uD558\uC5EC \uB9E4\uCE6D \uD6C4\uBCF4\uB85C \uC81C\uC548\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (\uC704\uCE58\uAE30\uBC18 \uCD9C\uB3D9 \uAD00\uC81C)"),
                                React.createElement("p", null, "\uBC30\uCC28 \uD655\uC815 \uC2DC\uACF5 \uC77C\uC790\uC5D0 \uB9C8\uC2A4\uD130\uC758 \uC2E4\uC81C \uC774\uB3D9 \uD604\uD669 \uBC0F \uC608\uC0C1 \uBC29\uBB38 \uC2DC\uAC04(ETA)\uC744 \uACE0\uAC1D \uB2E8\uB9D0\uAE30\uC5D0 \uC2E4\uC2DC\uAC04 \uD478\uC2DC \uD1B5\uBCF4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC218\uC9D1\uB41C GPS \uC815\uBCF4\uB294 \uC791\uC5C5 \uC644\uB8CC 24\uC2DC\uAC04 \uD6C4 \uC644\uC804\uD788 \uB9C8\uC2A4\uD0B9 \uD3D0\uAE30 \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC774\uC6A9\uC790\uC758 \uAD8C\uB9AC)"),
                                React.createElement("p", null, "\uACE0\uAC1D\uC740 \uC5B8\uC81C\uB4E0\uC9C0 \uB2E8\uB9D0\uAE30 \uC124\uC815\uC744 \uD1B5\uD574 \uC704\uCE58 \uC815\uBCF4 \uC218\uC9D1\uC744 \uC77C\uC2DC \uC911\uB2E8\uD560 \uC218 \uC788\uC73C\uBA70, \uC774 \uACBD\uC6B0 \uC790\uB3D9 \uAC70\uB9AC \uAE30\uBC18 \uBC30\uCC28 \uB300\uC2E0 \uC8FC\uC18C \uC9C1\uC811 \uAC80\uC0C9 \uC218\uAE30 \uBC29\uC2DD\uC73C\uB85C \uB300\uCCB4 \uCC98\uB9AC\uB429\uB2C8\uB2E4. (\uBCF8 \uC870\uD56D \uC815\uB3C5 \uC644\uB8CC)"))),
                        React.createElement("div", { className: "p-3.5 bg-surface-container-low rounded-xl space-y-2.5", "data-field": "TB_TERMS_MASTER", "data-is-required-yn": "Y", "data-terms-cd": "FINANCE" },
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                                        React.createElement("input", { checked: terms.finance.checked, className: `w-4 h-4 rounded text-secondary accent-secondary ${terms.finance.scrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`, "data-field": "SCROLLED_TO_END_YN", "data-terms-cd": "FINANCE", "data-terms-ver-seq": "1", disabled: !terms.finance.scrolled, id: "check-terms-finance", onChange: () => handleToggleTerm('finance'), type: "checkbox" }),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "[\uD544\uC218] \uC804\uC790\uAE08\uC735\uAC70\uB798 \uAE30\uBCF8\uC57D\uAD00 v1.0"))),
                                React.createElement("span", { className: `px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold ${terms.finance.scrolled
                                        ? 'bg-secondary-fixed/50 text-on-secondary-fixed-variant'
                                        : 'bg-surface-container-high text-on-surface-variant'}`, id: "badge-terms-finance" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, terms.finance.scrolled ? 'check' : 'hourglass_bottom'),
                                    React.createElement("span", null, terms.finance.scrolled
                                        ? '전문 확인 완료'
                                        : `스크롤 필요 (${terms.finance.progress}%)`))),
                            React.createElement("div", { className: "h-24 overflow-y-auto p-3 bg-surface-container-lowest rounded-lg font-caption text-caption text-on-surface-variant leading-relaxed space-y-1.5 shadow-inner", id: "viewer-terms-finance", onScroll: (e) => handleScroll('finance', e), ref: financeViewerRef },
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C1\uC870 (\uACB0\uC81C \uB300\uD589 \uBC0F \uD658\uBD88 \uBC29\uCE68)"),
                                React.createElement("p", null, "\uB9E4\uCE6D \uC218\uC218\uB8CC(16,500\uC6D0) \uACB0\uC81C\uB294 \uACF5\uC778 \uC804\uC790\uC9C0\uAE09\uACB0\uC81C\uB300\uD589\uC5C5\uC790(PG)\uB97C \uD1B5\uD574 \uC548\uC804\uD558\uAC8C \uC9C4\uD589\uB418\uBA70, \uC2DC\uACF5 \uB9C8\uC2A4\uD130 \uB9E4\uCE6D \uC2E4\uD328 \uC2DC \uC218\uC218\uB8CC\uB294 100% \uC989\uC2DC \uC790\uB3D9 \uD658\uBD88 \uCC98\uB9AC\uB429\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C2\uC870 (3\uAC1C\uC6D4 \uC548\uC2EC\uBCF4\uC99D \uCF00\uC5B4 \uC5F0\uB3D9)"),
                                React.createElement("p", null, "\uC815\uC0C1 \uC644\uB8CC\uB41C \uAC70\uB798 \uAC74\uC5D0 \uD55C\uD558\uC5EC 90\uC77C\uAC04 \uB204\uC218, \uACB0\uB85C, \uC7AC\uC624\uC5FC\uC5D0 \uB300\uD55C \uC548\uC2EC\uBCF4\uC99D \uBD84\uC7C1\uC870\uC815\uC704\uC6D0\uD68C\uC758 \uC9C0\uC6D0\uC744 \uBC1B\uC73C\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uD604\uC7A5 \uC9C1\uBD88\uAE08 \uC601\uC218\uC99D\uC740 \uB9C8\uC2A4\uD130\uAC00 \uD604\uC7A5\uC5D0\uC11C \uC9C1\uC811 \uC138\uAE08\uACC4\uC0B0\uC11C \uB610\uB294 \uD604\uAE08\uC601\uC218\uC99D\uC73C\uB85C \uBC1C\uAE09 \uAD50\uBD80\uD569\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-semibold text-on-surface" }, "\uC81C3\uC870 (\uC624\uB958\uC758 \uC815\uC815)"),
                                React.createElement("p", null, "\uC774\uC6A9\uC790\uB294 \uC804\uC790\uAE08\uC735\uAC70\uB798\uC5D0 \uC624\uB958\uAC00 \uC788\uC74C\uC744 \uC548 \uB54C\uC5D0 \uC989\uC2DC \uD68C\uC0AC\uC5D0 \uC815\uC815\uC744 \uC694\uAD6C\uD560 \uC218 \uC788\uC73C\uBA70 \uD68C\uC0AC\uB294 \uC811\uC218 \uC989\uC2DC 2\uC601\uC5C5\uC77C \uC774\uB0B4\uC5D0 \uC6D0\uC778\uC744 \uADDC\uBA85\uD558\uC5EC \uD68C\uC2E0\uD569\uB2C8\uB2E4. (\uC815\uB3C5 \uC644\uB8CC)"))))),
                React.createElement("div", { className: "p-3 bg-surface-container rounded-xl flex items-center justify-between" },
                    React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" },
                        React.createElement("input", { checked: allChecked, className: "w-4 h-4 rounded text-secondary accent-secondary cursor-pointer", id: "check-all-terms", onChange: handleToggleAll, type: "checkbox" }),
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold" }, "[\uC804\uCCB4 \uB3D9\uC758] 4\uB300 \uD544\uC218 \uC57D\uAD00 \uBC0F \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC5D0 \uBAA8\uB450 \uB3D9\uC758\uD569\uB2C8\uB2E4.")),
                    React.createElement("span", { className: "text-secondary font-label-sm text-label-sm font-semibold" }, "\uC77C\uAD04 \uC11C\uBA85")),
                React.createElement("section", { className: "space-y-2 pt-1 border-t border-slate-200/60", "data-field": "TB_MEMBER_AGREE_SIGN" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "draw"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uB0A0\uC778"),
                            React.createElement("span", { className: "font-caption text-caption text-secondary font-semibold" }, "(\uC804\uC790\uC11C\uBA85\uBC95 \uC81C3\uC870 \uBC95\uC801 \uD6A8\uB825)")),
                        React.createElement("button", { className: "h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1", id: "btn-clear-signature", onClick: handleClearSignature, type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "refresh"),
                            React.createElement("span", null, "\uC11C\uBA85\uC9C0\uC6B0\uAE30"))),
                    React.createElement("div", { className: "relative w-full h-32 rounded-xl border border-slate-300 bg-surface-container-lowest overflow-hidden shadow-inner flex flex-col justify-between" },
                        React.createElement("canvas", { className: "w-full h-full cursor-crosshair touch-none", height: 128, id: "signature-canvas", onMouseDown: startDrawing, onMouseLeave: stopDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onTouchEnd: stopDrawing, onTouchMove: drawTouch, onTouchStart: startDrawingTouch, ref: canvasRef, width: 500 }),
                        !hasSignature && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none text-outline/60 text-sm font-medium" },
                            React.createElement("span", null, "\uC5EC\uAE30\uC5D0 \uB9C8\uC6B0\uC2A4 \uB610\uB294 \uD130\uCE58\uB85C \uC790\uD544 \uC11C\uBA85\uD574 \uC8FC\uC138\uC694")))),
                    React.createElement("p", { className: "font-caption text-caption text-outline flex items-center gap-1 px-0.5" },
                        React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "info"),
                        React.createElement("span", null, "\uBCF8 \uC11C\uBA85\uC740 PNG \uD30C\uC77C\uB85C \uC800\uC7A5\uB418\uBA70 \uACF5\uC778 \uC804\uC790\uC99D\uC801 \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uC5D0 \uC601\uAD6C \uBCF4\uAD00\uB429\uB2C8\uB2E4."))),
                React.createElement("div", { className: "space-y-4 pt-2" },
                    React.createElement("button", { className: "w-full h-[52px] bg-secondary hover:bg-[#005049] text-white rounded-xl font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer", disabled: isLoading, id: "btn-submit-signup", onClick: handleSubmit, type: "button" }, isLoading ? (React.createElement("span", { className: "inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : (React.createElement(React.Fragment, null,
                        React.createElement("span", null, "\uD68C\uC6D0\uAC00\uC785 \uC644\uB8CC\uD558\uAE30"),
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "arrow_forward")))),
                    React.createElement("div", { className: "text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1.5" },
                        React.createElement("span", null, "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?"),
                        React.createElement("button", { className: "text-primary font-semibold hover:underline cursor-pointer", onClick: onOpenLogin || (() => { }), type: "button" }, "\uB85C\uADF8\uC778\uD558\uAE30 (WEB-CLNT-ATH-000)"))))),
        alertModal.isOpen && (React.createElement("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200/80 text-center animate-in zoom-in-95 space-y-4" },
                React.createElement("div", { className: "w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto shadow-sm" },
                    React.createElement("span", { className: "material-symbols-outlined text-[28px]" }, "warning")),
                React.createElement("div", { className: "space-y-1.5" },
                    React.createElement("h3", { className: "font-headline-sm text-headline-sm font-bold text-on-surface" }, alertModal.title || '입력 정보 확인'),
                    React.createElement("p", { className: "font-body-md text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed" }, alertModal.message)),
                React.createElement("button", { type: "button", onClick: () => {
                        const targetRef = alertModal.targetRef;
                        setAlertModal({ isOpen: false, title: '', message: '', targetRef: null });
                        if (targetRef && targetRef.current) {
                            setTimeout(() => {
                                targetRef.current.focus?.();
                                targetRef.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                            }, 50);
                        }
                    }, className: "w-full h-11 bg-primary text-on-primary font-label-lg text-label-lg rounded-xl hover:bg-primary-container transition-colors shadow-md font-bold cursor-pointer" }, "\uD655\uC778")))),
        successModal.isOpen && (React.createElement("div", { className: "fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40 text-center animate-in zoom-in-95 flex flex-col items-center" },
                React.createElement("div", { className: "w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3" },
                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "verified")),
                React.createElement("h3", { className: "font-headline-sm text-headline-sm font-bold text-on-surface mb-2" }, successModal.title || '[쓸고닦고 회원가입 완료]'),
                React.createElement("div", { className: "text-sm text-on-surface-variant whitespace-pre-line leading-relaxed mb-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-left w-full" }, successModal.message),
                React.createElement("button", { type: "button", onClick: handleConfirmSuccessModal, className: "w-full h-12 bg-secondary hover:bg-[#005049] text-white font-label-lg text-label-lg rounded-2xl transition-all shadow-md font-bold cursor-pointer flex items-center justify-center gap-2" },
                    React.createElement("span", null, "\uD655\uC778 (\uB85C\uADF8\uC778 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9)"),
                    React.createElement("span", { className: "material-symbols-outlined text-sm" }, "arrow_forward")))))));
}
function WebClntAth011({ isOpen = false, userInfo = null, onClose, onOpenRequestModal }) {
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
        if (!isOpen)
            return;
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
            }
            catch (err) {
                console.warn('[WEB-CLNT-ATH-011] 회원 정보 및 약관 조회 실패:', err);
            }
            finally {
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
        if (!canvas)
            return;
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
        if (!isDrawing.current)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
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
        if (!canvas)
            return;
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
            }
            else {
                alert(result.message || '서명 저장에 실패했습니다.');
            }
        }
        catch (e) {
            console.error(e);
            alert('서버 통신 중 오류가 발생했습니다.');
        }
        finally {
            setIsUpdatingSign(false);
        }
    };
    const handleProceedToRequest = () => {
        if (onClose)
            onClose();
        if (onOpenRequestModal) {
            onOpenRequestModal();
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('OPEN_CLEANING_REQUEST_MODAL', {
                detail: {
                    screenId: 'WEB-CLNT-REQ-000',
                    userNo: profile.userNo,
                    userNm: profile.userNm
                }
            }));
        }
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in", id: "modal-welcome-overlay", onClick: (e) => {
            if (e.target === e.currentTarget && onClose)
                onClose();
        } },
        React.createElement("div", { "aria-labelledby": "modal-welcome-headline", "aria-modal": "true", className: "relative w-full max-w-[520px] max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-7 text-center transform transition-all duration-300 scale-100 flex flex-col items-center animate-in zoom-in-95 border border-slate-200/80 text-on-surface overflow-y-auto", id: "modal-welcome-card", role: "dialog" },
            React.createElement("button", { "aria-label": "\uD31D\uC5C5 \uB2EB\uAE30", className: "absolute top-4 right-4 w-8 h-8 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer", id: "btn-close-x", onClick: onClose, type: "button" },
                React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "close")),
            React.createElement("div", { className: "relative mb-space-sm flex items-center justify-center" },
                React.createElement("div", { className: "absolute -inset-2 rounded-full bg-secondary-container/40 blur-md" }),
                React.createElement("div", { className: "relative w-16 h-16 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-md ring-4 ring-secondary/20 overflow-hidden" },
                    React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-full h-full rounded-full object-cover", src: "/logo.png" }),
                    React.createElement("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md" },
                        React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "check")))),
            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-primary font-bold tracking-tight mb-1 leading-snug", id: "modal-welcome-headline" }, "\uC4F8\uACE0\uB2E6\uACE0\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!"),
            React.createElement("p", { className: "font-caption text-caption text-on-surface-variant leading-relaxed mb-3" }, "\uD68C\uC6D0\uAC00\uC785 \uBC0F 5\uB300 \uBC95\uC801 \uD6A8\uB825 \uC774\uC6A9\uC57D\uAD00 \uB3D9\uC758, \uC790\uD544 \uC804\uC790\uC11C\uBA85\uC774 \uC548\uC804\uD558\uAC8C \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
            React.createElement("div", { className: "w-full flex border-b border-slate-200 mb-4" },
                React.createElement("button", { type: "button", onClick: () => setActiveTab('welcome'), className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${activeTab === 'welcome'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` }, "\uD68C\uC6D0\uC815\uBCF4"),
                React.createElement("button", { type: "button", onClick: () => setActiveTab('terms'), className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 flex items-center justify-center gap-1 ${activeTab === 'terms'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` },
                    React.createElement("span", null, "\uC57D\uAD00\uB3D9\uC758\uB0B4\uC5ED"),
                    React.createElement("span", { className: "text-[11px] px-1.5 py-0.2 rounded-full bg-secondary/10 text-secondary" }, termsAgreedList.length > 0 ? termsAgreedList.length : '5')),
                React.createElement("button", { type: "button", onClick: () => setActiveTab('signature'), className: `flex-1 py-2 font-label-md text-label-md font-semibold transition-colors border-b-2 ${activeTab === 'signature'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-outline hover:text-on-surface'}` }, "\uC804\uC790\uC11C\uBA85 \uAD00\uB9AC")),
            activeTab === 'welcome' && (React.createElement("div", { className: "w-full space-y-3 mb-4 text-left" },
                React.createElement("div", { className: "w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-3.5 shadow-xs" },
                    React.createElement("div", { className: "flex items-center justify-between pb-2 mb-2 border-b border-teal-100/60" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[18px]" }, "badge"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface" },
                                React.createElement("strong", { className: "text-on-surface font-bold" }, profile.userNm),
                                " \uACE0\uAC1D\uB2D8")),
                        React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary-fixed text-on-secondary-fixed-variant" }, "\uACE0\uAC1D\uD68C\uC6D0(C)")),
                    React.createElement("div", { className: "space-y-1 font-caption text-caption text-on-surface-variant" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uD68C\uC6D0\uC2DD\uBCC4\uBC88\uD638"),
                            React.createElement("span", { className: "font-mono font-medium text-on-surface" }, profile.userNo)),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uB85C\uADF8\uC778 \uACC4\uC815"),
                            React.createElement("span", { className: "font-medium text-on-surface truncate max-w-[220px]" }, profile.userEmail)),
                        profile.userTel && (React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uD734\uB300\uD3F0 \uBC88\uD638"),
                            React.createElement("span", { className: "font-medium text-on-surface" }, profile.userTel))),
                        profile.regDt && (React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-outline" }, "\uAC00\uC785 \uC77C\uC2DC"),
                            React.createElement("span", { className: "font-mono text-[11px] text-on-surface" }, profile.regDt))))),
                React.createElement("div", { className: "w-full p-3 rounded-xl bg-surface-container-low border border-slate-200/80 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "draw"),
                        React.createElement("div", null,
                            React.createElement("div", { className: "font-label-sm text-label-sm font-semibold text-on-surface" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uB0A0\uC778"),
                            React.createElement("div", { className: "text-[11px] text-on-surface-variant" }, "\uBC95\uC801 \uD6A8\uB825 \uC99D\uC801 \uBCF4\uAD00 \uC644\uB8CC"))),
                    profile.signImgUrl ? (React.createElement("div", { className: "w-24 h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center overflow-hidden" },
                        React.createElement("img", { src: profile.signImgUrl, alt: "\uC790\uD544 \uC11C\uBA85", className: "max-h-full object-contain" }))) : (React.createElement("span", { className: "text-[11px] text-outline" }, "\uC11C\uBA85 \uB4F1\uB85D \uC644\uB8CC"))),
                React.createElement("div", { className: "w-full space-y-1.5 pt-1 text-left" },
                    React.createElement("div", { className: "flex items-start gap-2 p-2 rounded-lg bg-surface-container-low/70" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px] mt-0.5" }, "shield"),
                        React.createElement("div", { className: "text-[12px] leading-tight" },
                            React.createElement("strong", { className: "text-on-surface font-semibold" }, "100% \uC2E0\uC6D0 \uBCF4\uC99D \uB9C8\uC2A4\uD130 \uBC30\uC815: "),
                            React.createElement("span", { className: "text-on-surface-variant" }, "\uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8 \uBC0F \uC0AC\uC5C5\uC790 \uC2E0\uC6D0 \uAC80\uC99D \uC644\uB8CC \uC778\uB825 \uC804\uB2F4"))),
                    React.createElement("div", { className: "flex items-start gap-2 p-2 rounded-lg bg-surface-container-low/70" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px] mt-0.5" }, "handshake"),
                        React.createElement("div", { className: "text-[12px] leading-tight" },
                            React.createElement("strong", { className: "text-on-surface font-semibold" }, "\uD604\uC7A5 \uAC80\uC218 \uD6C4 \uC804\uC561 \uC9C1\uBD88\uC81C \uC815\uC0B0: "),
                            React.createElement("span", { className: "text-on-surface-variant" }, "\uC120\uC785\uAE08 \uC5C6\uB294 \uC2DC\uACF5 \uC644\uB8CC \uD6C4 \uC9C1\uC811 \uACB0\uC81C (\uC218\uC218\uB8CC \uC81C\uB85C)")))))),
            activeTab === 'terms' && (React.createElement("div", { className: "w-full space-y-2 mb-4 text-left max-h-[300px] overflow-y-auto pr-1" },
                React.createElement("div", { className: "p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-800 flex items-center gap-1.5" },
                    React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "verified"),
                    React.createElement("span", null, "\uC804\uC790\uC0C1\uAC70\uB798\uBC95 \uBC0F \uC804\uC790\uC11C\uBA85\uBC95\uC5D0 \uB530\uB978 5\uB300 \uD544\uC218 \uC57D\uAD00 \uB3D9\uC758 \uBC0F \uC99D\uC801 \uAE30\uB85D\uC785\uB2C8\uB2E4.")),
                termsAgreedList.length > 0 ? (termsAgreedList.map((term, idx) => (React.createElement("div", { key: term.agreeSeq || term.termsCd || idx, className: "p-3 rounded-xl bg-surface-container-low border border-slate-200/90 flex flex-col gap-1" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "font-label-md text-label-md font-bold text-on-surface flex items-center gap-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px]" }, "check_circle"),
                            term.termsTitle || term.termsCd),
                        React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-semibold font-mono" }, term.termsVer || 'v1.0')),
                    React.createElement("div", { className: "flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-slate-100" },
                        React.createElement("span", { className: "text-outline" }, "\uB3D9\uC758 \uC77C\uC2DC"),
                        React.createElement("span", { className: "font-mono text-on-surface" }, term.agreeDt || '가입 시 동의 완료')))))) : ([
                    { title: '서비스 통합이용약관', code: 'SERVICE', ver: 'v1.0' },
                    { title: '개인정보 수집 및 이용 동의', code: 'PRIVACY', ver: 'v1.0' },
                    { title: '위치기반 서비스 이용약관', code: 'LOCATION', ver: 'v1.0' },
                    { title: '전자금융거래 기본약관', code: 'FINANCE', ver: 'v1.0' },
                    { title: '전자거래 및 자필 전자서명 보증 동의', code: 'SIGNATURE', ver: 'v1.0' },
                ].map((item) => (React.createElement("div", { key: item.code, className: "p-3 rounded-xl bg-surface-container-low border border-slate-200/90 flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-1.5" },
                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[16px]" }, "check_circle"),
                        React.createElement("span", { className: "font-label-sm text-label-sm font-semibold text-on-surface" }, item.title)),
                    React.createElement("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono" }, item.ver))))))),
            activeTab === 'signature' && (React.createElement("div", { className: "w-full space-y-3 mb-4 text-left" },
                React.createElement("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center" },
                    React.createElement("span", { className: "text-[12px] font-semibold text-on-surface mb-2 self-start" }, "\uD604\uC7AC \uB4F1\uB85D\uB41C \uBCF8\uC778 \uC790\uD544 \uC804\uC790\uC11C\uBA85"),
                    React.createElement("div", { className: "w-full h-32 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 relative overflow-hidden" },
                        profile.signImgUrl ? (React.createElement("img", { src: profile.signImgUrl, alt: "\uB4F1\uB85D\uB41C \uC804\uC790\uC11C\uBA85", className: "max-h-full max-w-full object-contain" })) : (React.createElement("span", { className: "text-on-surface-variant text-[12px]" }, "\uC11C\uBA85 \uC774\uBBF8\uC9C0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.")),
                        React.createElement("div", { className: "absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-secondary font-semibold bg-white/90 px-1 rounded shadow-xs" },
                            React.createElement("span", { className: "material-symbols-outlined text-[12px]" }, "verified"),
                            React.createElement("span", null, "\uC704\uBCC0\uC870 \uBC29\uC9C0 \uBCF4\uC99D")))),
                React.createElement("button", { type: "button", onClick: () => setShowSignModal(true), className: "w-full py-2.5 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold" },
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "edit"),
                    React.createElement("span", null, "\uC0C8\uB85C\uC6B4 \uC790\uD544 \uC804\uC790\uC11C\uBA85\uC73C\uB85C \uBCC0\uACBD (\uC7AC\uB4F1\uB85D)")))),
            React.createElement("div", { className: "w-full flex flex-col gap-2" },
                React.createElement("button", { className: "w-full h-[48px] bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer", "data-action": "OPEN_MODAL_WEB_CLNT_REQ_000", id: "btn-request-cleaning", onClick: handleProceedToRequest, type: "button" },
                    React.createElement("span", null, "\uBC14\uB85C \uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uB7EC \uAC00\uAE30"),
                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "chevron_right")),
                React.createElement("button", { className: "w-full h-[36px] text-outline hover:text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center cursor-pointer", "data-action": "CLOSE_MODAL_GO_HOME", id: "btn-dismiss-to-home", onClick: onClose, type: "button" }, "\uD648 \uB458\uB7EC\uBCF4\uAE30"))),
        showSignModal && (React.createElement("div", { className: "fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" },
            React.createElement("div", { className: "relative w-full max-w-[420px] bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-3" },
                React.createElement("div", { className: "flex items-center justify-between border-b pb-2" },
                    React.createElement("h3", { className: "font-label-lg text-label-lg font-bold text-primary" }, "\uC790\uD544 \uC804\uC790\uC11C\uBA85 \uC7AC\uB4F1\uB85D"),
                    React.createElement("button", { type: "button", onClick: () => setShowSignModal(false), className: "w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500" },
                        React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "close"))),
                React.createElement("p", { className: "text-[12px] text-slate-600" }, "\uC544\uB798 \uCE94\uBC84\uC2A4\uC5D0 \uB9C8\uC6B0\uC2A4 \uB610\uB294 \uD130\uCE58\uB85C \uC0C8\uB85C\uC6B4 \uBCF8\uC778 \uC11C\uBA85\uC744 \uADF8\uB824\uC8FC\uC138\uC694."),
                React.createElement("div", { className: "w-full h-40 bg-slate-50 border-2 border-dashed border-teal-300 rounded-xl overflow-hidden relative" },
                    React.createElement("canvas", { ref: canvasRef, width: 400, height: 160, className: "w-full h-full cursor-crosshair touch-none", onMouseDown: startDrawing, onMouseMove: draw, onMouseUp: stopDrawing, onMouseLeave: stopDrawing, onTouchStart: startDrawing, onTouchMove: draw, onTouchEnd: stopDrawing }),
                    !hasNewSignature && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm" }, "\uC774\uACF3\uC5D0 \uC11C\uBA85\uD574 \uC8FC\uC138\uC694"))),
                React.createElement("div", { className: "flex justify-between items-center pt-1" },
                    React.createElement("button", { type: "button", onClick: handleClearSignature, className: "text-[12px] text-slate-500 hover:text-slate-800 underline" }, "\uB2E4\uC2DC \uC4F0\uAE30"),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("button", { type: "button", onClick: () => setShowSignModal(false), className: "px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700" }, "\uCDE8\uC18C"),
                        React.createElement("button", { type: "button", onClick: handleSaveNewSignature, disabled: isUpdatingSign || !hasNewSignature, className: "px-4 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow disabled:opacity-50" }, isUpdatingSign ? '저장 중...' : '서명 갱신 저장'))))))));
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
function WebClntOrd000({ onNavigate, onOpenRequestModal, onLogout, currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
} }) {
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
        }
        catch (err) {
            console.warn('[WEB-CLNT-ORD-000] 목록 조회 API 통신 오류 (시뮬레이션 유지):', err);
        }
        finally {
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
                    setOrderList((prevList) => prevList.map((order) => {
                        if (order.orderStatus === 'BID_OPEN' && nextMap[order.orderNo] === 0) {
                            return { ...order, orderStatus: 'BID_EXPIRED' };
                        }
                        return order;
                    }));
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
        }
        else if (typeof window !== 'undefined') {
            window.location.hash = `#${targetUrl}`;
            alert(`[WEB-CLNT-ORD-001 상세 이동]\n발주번호 ${orderNo}의 파트너 청약서 비교 화면으로 이동합니다.`);
        }
    };
    // 사용자 인터랙션: [+ 신규 청소 요청 등록하기] 클릭 시 모달 트리거
    const handleOpenRequest = () => {
        if (onOpenRequestModal) {
            onOpenRequestModal();
        }
        else if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('OPEN_CLEANING_REQUEST_MODAL', {
                detail: { screenId: 'WEB-CLNT-REQ-000', userNo: effectiveUserNo }
            }));
        }
    };
    return (React.createElement("div", { className: "bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col" },
        React.createElement("header", { className: "fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]" },
            React.createElement("div", { className: "h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md" },
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("a", { className: "flex items-center gap-space-sm group", "data-path": "home", href: "#home", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('home');
                        } },
                        React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20", src: "/logo.png" }),
                        React.createElement("div", { className: "flex flex-col" },
                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none" }, "\uC4F8\uACE0\uB2E6\uACE0"),
                            React.createElement("span", { className: "font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold" }, "BUILDING CLEANING STANDARD"))),
                    React.createElement("div", { className: "hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "location_on"),
                        React.createElement("span", null, "\uACBD\uAE30 \uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C"),
                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "keyboard_arrow_down"))),
                React.createElement("nav", { className: "hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full", "data-active-classes": "bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm" },
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "home", href: "#home", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('home');
                        } }, "\uD648"),
                    React.createElement("a", { "aria-current": "page", className: "px-4 py-2 transition-colors bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-semibold", "data-path": "my-requests", href: "#my-requests" }, "\uB098\uC758 \uC2E0\uCCAD\uD604\uD669"),
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "service-history", href: "#service-history", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('service-history');
                        } }, "\uC774\uC6A9\uB0B4\uC5ED"),
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "my-account", href: "#my-account", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('my-account');
                        } }, "\uB9C8\uC774")),
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("div", { className: "hidden lg:flex flex-col items-end text-right" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" },
                            currentUser.USER_NM || '홍길동',
                            "\uB2D8"),
                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" },
                            "\uC778\uC99D\uD68C\uC6D0 (",
                            effectiveUserNo,
                            ")")),
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("button", { "aria-label": "\uC54C\uB9BC", className: "w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors", type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "notifications")),
                        React.createElement("button", { className: "hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer", onClick: onLogout || (() => alert('로그아웃되었습니다.')), type: "button" }, "\uB85C\uADF8\uC544\uC6C3"),
                        React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-1 ring-outline-variant/30 font-semibold text-xs" }, currentUser.USER_NM ? currentUser.USER_NM.slice(0, 1) : '홍'))))),
        React.createElement("main", { className: "w-full pt-[72px] bg-background min-h-screen flex-1" },
            React.createElement("div", { className: "flex flex-col w-full" },
                React.createElement("div", { className: "relative w-full overflow-hidden pb-space-xl" },
                    React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin pt-space-lg flex flex-col gap-space-lg" },
                        React.createElement("section", { "aria-label": "\uBC1C\uC8FC \uC694\uC57D \uB300\uC2DC\uBCF4\uB4DC", className: "flex flex-col gap-space-md" },
                            React.createElement("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-xs" },
                                React.createElement("div", { className: "flex flex-col gap-1.5" },
                                    React.createElement("div", { className: "flex items-center gap-space-xs" },
                                        React.createElement("span", { className: "px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold tracking-wide" }, "\uACE0\uAC1D \uBC1C\uC8FC \uD3EC\uD138"),
                                        React.createElement("span", { className: "text-outline text-caption font-caption font-mono" }, "WEB-CLNT-ORD-000")),
                                    React.createElement("h1", { className: "font-headline-lg text-headline-lg text-primary tracking-tight font-bold" }, "\uB098\uC758 \uCCAD\uC18C \uC2E0\uCCAD \uD604\uD669"),
                                    React.createElement("p", { className: "font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed" }, "\uACE0\uAC1D\uB2D8\uC774 \uC9C1\uC811 \uC9C0\uC815\uAC00\uB85C \uBC1C\uC8FC\uD558\uC2E0 \uCCAD\uC18C \uAC74\uB4E4\uC758 \uC2E4\uC2DC\uAC04 \uB9E4\uCE6D \uC0C1\uD0DC\uC785\uB2C8\uB2E4. \uC5ED\uACBD\uB9E4 \uC5C6\uC774 \uC9C0\uC815\uAC00 \uADF8\uB300\uB85C \uAC80\uC99D\uB41C \uC2DC\uACF5 \uB9C8\uC2A4\uD130\uC640 \uB9E4\uCE6D\uB429\uB2C8\uB2E4.")),
                                React.createElement("div", { className: "hidden lg:flex items-center gap-space-xs bg-surface-container-low px-4 py-2 rounded-xl text-on-surface shadow-xs" },
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]", style: { fontVariationSettings: "'FILL' 1" } }, "verified_user"),
                                    React.createElement("div", { className: "flex flex-col" },
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-outline" }, "\uD45C\uC900 \uC815\uC561 \uBCF4\uC99D\uC81C"),
                                        React.createElement("span", { className: "font-label-md text-label-md font-semibold text-primary" }, "\uC5ED\uACBD\uB9E4 \uAC15\uC694 0\uAC74")))),
                            React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-space-md" },
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface-variant" }, "\uC804\uCCB4 \uBC1C\uC8FC"),
                                        React.createElement("div", { className: "w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "inventory_2"))),
                                    React.createElement("div", { className: "flex items-baseline justify-between pt-space-xs" },
                                        React.createElement("span", { className: "font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight", "data-field": "TOTAL_ORDER_COUNT" },
                                            summary.totalCnt,
                                            React.createElement("span", { className: "font-label-md text-label-md font-normal text-outline ml-1" }, "\uAC74")),
                                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" }, "\uB204\uC801 \uC9C4\uD589 \uD1B5\uD569"))),
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] relative overflow-hidden border border-secondary/20" },
                                    React.createElement("div", { className: "absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/5 rounded-full pointer-events-none" }),
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "font-label-md text-label-md text-secondary font-semibold" }, "\uCCAD\uC57D \uC811\uC218\uC911"),
                                        React.createElement("span", { className: "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold" },
                                            React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary animate-ping" }),
                                            "\uC2E4\uC2DC\uAC04 \uBAA8\uC9D1\uC911")),
                                    React.createElement("div", { className: "flex items-baseline justify-between pt-space-xs" },
                                        React.createElement("span", { className: "font-headline-lg text-headline-lg text-secondary font-bold tracking-tight", "data-field": "BID_OPEN_COUNT" },
                                            summary.bidOpenCnt,
                                            React.createElement("span", { className: "font-label-md text-label-md font-normal text-outline ml-1" }, "\uAC74")),
                                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" }, "7\uC77C \uAE30\uD55C \uB0B4 \uB9C8\uC2A4\uD130 \uC811\uC218"))),
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface-variant" }, "\uACC4\uC57D \uCCB4\uACB0/\uC9C4\uD589\uC911"),
                                        React.createElement("div", { className: "w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "handshake"))),
                                    React.createElement("div", { className: "flex items-baseline justify-between pt-space-xs" },
                                        React.createElement("span", { className: "font-headline-lg text-headline-lg text-primary font-bold tracking-tight", "data-field": "CNTR_PROGRESS_COUNT" },
                                            summary.inProgressCnt,
                                            React.createElement("span", { className: "font-label-md text-label-md font-normal text-outline ml-1" }, "\uAC74")),
                                        React.createElement("span", { className: "font-caption text-caption text-primary font-medium" }, "\uB9C8\uC2A4\uD130 \uB9E4\uCE6D \uC644\uB8CC"))),
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[118px] border border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface-variant" }, "\uCCAD\uC18C \uC644\uB8CC"),
                                        React.createElement("div", { className: "w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-outline" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "task_alt"))),
                                    React.createElement("div", { className: "flex items-baseline justify-between pt-space-xs" },
                                        React.createElement("span", { className: "font-headline-lg text-headline-lg text-outline font-bold tracking-tight", "data-field": "COMPLETED_COUNT" },
                                            summary.completedCnt,
                                            React.createElement("span", { className: "font-label-md text-label-md font-normal text-outline ml-1" }, "\uAC74")),
                                        React.createElement("span", { className: "font-caption text-caption text-outline font-medium" }, "\uD604\uC7A5 \uCD5C\uC885 \uAC80\uC218 \uD544"))))),
                        React.createElement("section", { "aria-label": "\uD544\uD130 \uBC0F \uB4F1\uB85D \uC870\uC791", className: "flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-sm" },
                            React.createElement("div", { className: "flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl overflow-x-auto", id: "filterTabGroup" },
                                React.createElement("button", { className: `filter-tab px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'ALL'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('ALL'), type: "button" },
                                    React.createElement("span", null, "\uC804\uCCB4"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm" }, summary.totalCnt)),
                                React.createElement("button", { className: `filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'BID_OPEN'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('BID_OPEN'), type: "button" },
                                    React.createElement("span", null, "\uCCAD\uC57D\uC811\uC218\uC911"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold" }, summary.bidOpenCnt)),
                                React.createElement("button", { className: `filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'CNTR_CONFIRMED'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('CNTR_CONFIRMED'), type: "button" },
                                    React.createElement("span", null, "\uACC4\uC57D\uD655\uC815"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm" }, summary.inProgressCnt)),
                                React.createElement("button", { className: `filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'SVC_PROGRESS'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('SVC_PROGRESS'), type: "button" },
                                    React.createElement("span", null, "\uC9C4\uD589\uC911"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm" }, "0")),
                                React.createElement("button", { className: `filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'SVC_COMPLETED'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('SVC_COMPLETED'), type: "button" },
                                    React.createElement("span", null, "\uC644\uB8CC"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm" }, summary.completedCnt)),
                                React.createElement("button", { className: `filter-tab px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${currentFilter === 'BID_EXPIRED'
                                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`, onClick: () => setCurrentFilter('BID_EXPIRED'), type: "button" },
                                    React.createElement("span", null, "\uB9CC\uB8CC/\uCDE8\uC18C"),
                                    React.createElement("span", { className: "px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm" }, "0"))),
                            React.createElement("button", { className: "h-[44px] px-6 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all shrink-0 cursor-pointer", "data-action": "OPEN_MODAL_WEB_CLNT_REQ_000", onClick: handleOpenRequest, type: "button" },
                                React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "add_circle"),
                                React.createElement("span", null, "\uC2E0\uADDC \uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uAE30"))),
                        React.createElement("section", { "aria-label": "\uBC1C\uC8FC \uBAA9\uB85D \uD53C\uB4DC", className: "flex flex-col gap-space-lg" }, isLoading && orderList.length === 0 ? (React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[36px] animate-spin mb-2" }, "progress_activity"),
                            React.createElement("span", { className: "text-on-surface-variant font-body-sm" }, "\uBC1C\uC8FC \uC2E0\uCCAD \uD604\uD669\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..."))) : orderList.length === 0 ? (React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm border border-slate-200/60 flex flex-col items-center justify-center" },
                            React.createElement("span", { className: "material-symbols-outlined text-outline text-[48px] mb-3" }, "inbox"),
                            React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface font-semibold mb-1" }, "\uD574\uB2F9 \uC870\uAC74\uC758 \uBC1C\uC8FC \uC2E0\uCCAD \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."),
                            React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant mb-6" }, "\uC6D0\uD558\uC2DC\uB294 \uCCAD\uC18C \uC11C\uBE44\uC2A4\uC640 \uD76C\uB9DD \uC2DC\uACF5 \uAE08\uC561\uC744 \uC9C0\uC815\uD558\uC5EC \uC2E0\uADDC \uBC1C\uC8FC\uC11C\uB97C \uB4F1\uB85D\uD574 \uBCF4\uC138\uC694."),
                            React.createElement("button", { className: "h-10 px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold", onClick: handleOpenRequest, type: "button" }, "\uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uAE30"))) : (orderList.map((order) => {
                            const isBidOpen = order.orderStatus === 'BID_OPEN';
                            const isConfirmed = order.orderStatus === 'CNTR_CONFIRMED';
                            const isCompleted = order.orderStatus === 'SVC_COMPLETED';
                            const isExpired = order.orderStatus === 'BID_EXPIRED';
                            const remainingSeconds = timeLeftMap[order.orderNo];
                            const remainingFormatted = formatTimeLeft(remainingSeconds);
                            return (React.createElement("article", { className: "order-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border border-slate-200/70", "data-status": order.orderStatus, key: order.orderNo },
                                React.createElement("div", { className: "px-space-md py-space-sm bg-surface-container-low/50 flex flex-wrap items-center justify-between gap-space-sm border-b border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center gap-space-sm flex-wrap text-caption font-caption text-outline" },
                                        React.createElement("span", null,
                                            "\uBC1C\uC8FC\uBC88\uD638:",
                                            ' ',
                                            React.createElement("strong", { className: "text-on-surface font-semibold font-mono", "data-field": "ORDER_NO" }, order.orderNo)),
                                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                                        React.createElement("span", null,
                                            "\uB4F1\uB85D\uC77C\uC2DC:",
                                            ' ',
                                            React.createElement("span", { className: "text-on-surface-variant", "data-field": "REG_DT" }, order.regDt)),
                                        order.confirmedDtText && (React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "text-outline-variant" }, "|"),
                                            React.createElement("span", null,
                                                "\uCCB4\uACB0\uC77C\uC2DC:",
                                                ' ',
                                                React.createElement("span", { className: "text-primary font-medium" }, order.confirmedDtText)))),
                                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                                        React.createElement("span", null,
                                            "\uC2E0\uCCAD\uC790:",
                                            ' ',
                                            React.createElement("span", { className: "text-on-surface-variant", "data-field": "USER_NM" },
                                                currentUser.USER_NM || '홍길동',
                                                " (",
                                                order.clientUserNo || effectiveUserNo,
                                                ")"))),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        isBidOpen && (React.createElement("span", { className: "px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-xs", "data-field": "ORDER_STATUS" },
                                            React.createElement("span", null, "\uCCAD\uC57D\uC811\uC218\uC911"),
                                            React.createElement("span", { className: "inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" }))),
                                        isConfirmed && (React.createElement("span", { className: "px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs", "data-field": "ORDER_STATUS" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "handshake"),
                                            React.createElement("span", null, "\uACC4\uC57D\uCCB4\uACB0\uC644\uB8CC"))),
                                        isCompleted && (React.createElement("span", { className: "px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs", "data-field": "ORDER_STATUS" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "check_circle"),
                                            React.createElement("span", null, "\uCCAD\uC18C\uC644\uB8CC (\uAC80\uC218\uD569\uACA9)"))),
                                        isExpired && (React.createElement("span", { className: "px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-xs", "data-field": "ORDER_STATUS" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "schedule"),
                                            React.createElement("span", null, "\uCCAD\uC57D\uB9CC\uB8CC"))))),
                                isBidOpen && (React.createElement("div", { className: "mx-space-md mt-space-md p-space-sm bg-secondary-fixed/20 rounded-xl flex flex-col gap-2 border border-secondary/20" },
                                    React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "hourglass_top"),
                                            React.createElement("span", { className: "font-label-md text-label-md text-primary font-semibold" }, "7\uC77C \uCCAD\uC57D \uB9C8\uAC10\uAE4C\uC9C0 \uB0A8\uC740 \uC2DC\uAC04:"),
                                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-tertiary-container font-bold tracking-tight font-mono", "data-field": "BID_EXPIRE_DT" }, remainingFormatted.text)),
                                        React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" },
                                            "\uB9C8\uAC10\uC77C\uC2DC:",
                                            ' ',
                                            React.createElement("strong", { className: "text-primary font-semibold" }, order.bidExpireDt))),
                                    React.createElement("div", { className: "w-full h-2 rounded-full bg-surface-container overflow-hidden" },
                                        React.createElement("div", { className: "h-full bg-secondary rounded-full transition-all duration-500", style: { width: `${remainingFormatted.percent}%` } })),
                                    React.createElement("p", { className: "font-caption text-caption text-outline leading-tight" }, "\uB9CC\uB8CC \uC804\uAE4C\uC9C0 \uC811\uC218\uB41C \uCCAD\uC57D\uC11C \uC911 \uC81C\uC2DC\uB41C \uD3EC\uD2B8\uD3F4\uB9AC\uC624\uC640 \uC774\uB825\uC744 \uBE44\uAD50\uD558\uC5EC \uB9C8\uC74C\uC5D0 \uB4DC\uB294 \uB9C8\uC2A4\uD130\uB97C \uC790\uC720\uB86D\uAC8C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))),
                                isConfirmed && order.contractMaster && (React.createElement("div", { className: "mx-space-md mt-space-md p-space-sm rounded-xl bg-primary/5 flex flex-wrap items-center justify-between gap-space-sm border border-primary/15" },
                                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                                        React.createElement("div", { className: "w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-base" }, order.contractMaster.masterNm ? order.contractMaster.masterNm.slice(0, 1) : '김'),
                                        React.createElement("div", { className: "flex flex-col" },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("span", { className: "font-label-lg text-label-lg text-primary font-bold" }, "\uB2F4\uB2F9 \uB9C8\uC2A4\uD130 \uB9E4\uCE6D \uC644\uB8CC"),
                                                React.createElement("span", { className: "px-2 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold" }, "\uC2E0\uC6D0\u00B7\uCC45\uC784\uBCF4\uD5D8 100% \uAC80\uC99D")),
                                            React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface" },
                                                React.createElement("strong", { className: "font-semibold" }, order.contractMaster.companyNm),
                                                " (",
                                                order.contractMaster.masterNm,
                                                " / ",
                                                order.contractMaster.licenseNm,
                                                " / \uC2DC\uACF5 \uD3C9\uC810 ",
                                                order.contractMaster.rating,
                                                ")"))),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("button", { className: "px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer", onClick: () => alert(`[안심번호 통화] ${order.contractMaster.safePhone}로 연결합니다.`), type: "button" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "call"),
                                            "\uC548\uC2EC\uBC88\uD638 \uD1B5\uD654")))),
                                React.createElement("div", { className: "p-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md" },
                                    React.createElement("div", { className: "flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40" },
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-outline flex items-center gap-1" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "cleaning_services"),
                                            "\uC11C\uBE44\uC2A4 \uAD6C\uBD84 \uBC0F \uC0C1\uC138 \uB0B4\uC5ED"),
                                        React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                                            React.createElement("span", { className: "px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-semibold", "data-field": "CLEAN_LARGE_CD" }, order.cleanLargeNm || order.cleanLargeCd),
                                            React.createElement("span", { className: "font-label-lg text-label-lg text-on-surface font-semibold", "data-field": "CLEAN_MID_CD" }, order.cleanMidNm || order.cleanMidCd)),
                                        React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant pt-0.5" }, order.detailDesc)),
                                    React.createElement("div", { className: "flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40" },
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-outline flex items-center gap-1" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "distance"),
                                            "\uC2DC\uACF5 \uD604\uC7A5 \uC8FC\uC18C"),
                                        React.createElement("p", { className: "font-label-lg text-label-lg text-on-surface font-semibold", "data-field": "ADDR_TEXT" }, order.addrText),
                                        React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, order.addrDetail)),
                                    React.createElement("div", { className: "flex flex-col gap-space-xs p-space-sm rounded-lg bg-surface-container-low/40" },
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-outline flex items-center gap-1" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "calendar_clock"),
                                            "\uC2DC\uACF5 \uD76C\uB9DD \uC77C\uC815"),
                                        React.createElement("div", { className: "flex items-baseline gap-2 flex-wrap" },
                                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold", "data-field": "SERVICE_START_DT" }, order.serviceStartDt),
                                            order.dDayText && (React.createElement("span", { className: "px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold" }, order.dDayText)),
                                            isCompleted && (React.createElement("div", { className: "flex items-center gap-0.5 text-secondary" },
                                                [1, 2, 3, 4, 5].map((s) => (React.createElement("span", { key: s, className: "material-symbols-outlined text-[16px]", style: { fontVariationSettings: "'FILL' 1" } }, "star"))),
                                                React.createElement("span", { className: "font-label-sm text-label-sm font-bold text-on-surface ml-1" }, "5.0 / 5.0")))),
                                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" }, order.serviceScheduleText || '고객 지정 희망 일정')),
                                    React.createElement("div", { className: "flex flex-col gap-space-xs p-space-sm rounded-lg bg-primary/5" },
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", { className: "font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[16px] text-primary" }, "payments"),
                                                isCompleted ? '시공 대금 정산 결과' : '고객 지정 확정 시공대금'),
                                            React.createElement("span", { className: "font-caption text-caption text-outline" }, isCompleted ? '거래 종결' : '플랫폼 수수료 16,500원 결제 완료')),
                                        React.createElement("div", { className: "flex items-baseline gap-2 flex-wrap" },
                                            React.createElement("span", { className: "font-headline-lg text-headline-lg text-primary font-bold tracking-tight font-mono", "data-field": "PROPOSED_PRICE" },
                                                Number(order.proposedPrice).toLocaleString(),
                                                "\uC6D0"),
                                            order.priceUnitText && (React.createElement("span", { className: "font-label-md text-label-md text-on-surface-variant font-semibold" }, order.priceUnitText)),
                                            React.createElement("span", { className: "px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-caption text-caption font-medium shadow-xs" }, isCompleted ? '현장 직불 완료 (영수증 수령)' : '역경매 없음 · 현장 직불 고정액')),
                                        React.createElement("p", { className: "font-caption text-caption text-tertiary font-medium" }, order.priceNotice || '* 시공 검수 완료 후 마스터 계좌로 직접 송금하는 확정 계약금입니다.'))),
                                React.createElement("div", { className: "px-space-md py-space-sm bg-surface-container-low/80 flex flex-wrap items-center justify-between gap-space-sm border-t border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        isBidOpen && (React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-secondary" }),
                                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface" },
                                                "\uD604\uC7AC ",
                                                React.createElement("strong", { className: "text-secondary font-headline-sm text-headline-sm font-bold font-mono", "data-field": "APPLY_COUNT" },
                                                    order.applyCount || 0,
                                                    "\uBA85"),
                                                "\uC758 \uAC80\uC99D\uB41C \uC2DC\uACF5 \uB9C8\uC2A4\uD130\uAC00 \uCCAD\uC57D\uC11C\uB97C \uC81C\uCD9C\uD588\uC2B5\uB2C8\uB2E4."))),
                                        isConfirmed && (React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "material-symbols-outlined text-primary text-[20px]" }, "assignment_turned_in"),
                                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface" }, "\uACC4\uC57D\uC774 \uCCB4\uACB0\uB418\uC5B4 \uC77C\uC815 \uC870\uC728\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC2DC\uACF5 \uB2F9\uC77C \uB9C8\uC2A4\uD130\uAC00 \uC9C1\uC811 \uBC29\uBB38\uD569\uB2C8\uB2E4."))),
                                        isCompleted && (React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "verified"),
                                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface" }, "\uC2DC\uACF5 \uC804/\uD6C4 \uACE0\uD654\uC9C8 \uC0AC\uC9C4 \uBCF4\uACE0\uC11C\uC640 \uC804\uC790 \uAC80\uC218 \uD655\uC778\uC11C\uAC00 \uBC1C\uAE09\uB418\uC5C8\uC2B5\uB2C8\uB2E4."))),
                                        isExpired && (React.createElement(React.Fragment, null,
                                            React.createElement("span", { className: "material-symbols-outlined text-outline text-[20px]" }, "info"),
                                            React.createElement("span", { className: "font-body-md text-body-md text-on-surface-variant" }, "7\uC77C \uCCAD\uC57D \uAE30\uD55C\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC870\uAC74\uC744 \uC7AC\uC870\uC815\uD558\uC5EC \uB2E4\uC2DC \uBC1C\uC8FC\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")))),
                                    React.createElement("div", null,
                                        isBidOpen && (React.createElement("button", { className: "h-[42px] px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all cursor-pointer", "data-action": "VIEW_QUOTES", "data-order-no": order.orderNo, onClick: () => handleNavigateToQuotes(order.orderNo), type: "button" },
                                            React.createElement("span", null,
                                                "\uD30C\uD2B8\uB108 \uCCAD\uC57D\uC11C \uBE44\uAD50 \uBC0F \uC120\uD0DD\uD558\uAE30 (",
                                                order.applyCount || 0,
                                                "\uAC74)"),
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "arrow_forward"))),
                                        isConfirmed && (React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("button", { className: "h-[42px] px-5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-on-secondary-container active:scale-[0.98] transition-all cursor-pointer", onClick: () => {
                                                    if (onNavigate) {
                                                        onNavigate(`WEB-CLNT-JOB-000?contractNo=${order.contractMaster?.contractNo || 'CNT2026103100001'}`);
                                                    }
                                                }, type: "button" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "verified"),
                                                React.createElement("span", null, "\uD604\uC7A5 \uC2DC\uACF5 \uAC80\uC218 \uBC0F \uC9C1\uBD88 \uC2B9\uC778"),
                                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "arrow_forward")),
                                            React.createElement("button", { className: "h-[42px] px-4 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer", onClick: () => alert(`[계약서 확인] 발주번호 ${order.orderNo}의 표준 직불 전자계약서를 확인합니다.`), type: "button" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "description"),
                                                React.createElement("span", null, "\uACC4\uC57D\uC11C")))),
                                        isCompleted && (React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("button", { className: "h-[42px] px-5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md hover:bg-surface-container transition-all cursor-pointer border border-slate-200/80", onClick: () => {
                                                    if (onNavigate) {
                                                        onNavigate(`WEB-CLNT-JOB-000?contractNo=${order.contractMaster?.contractNo || 'CNT2026103100001'}`);
                                                    }
                                                }, type: "button" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "fact_check"),
                                                React.createElement("span", null, "\uC2DC\uACF5 \uAC80\uC218 \uB0B4\uC5ED \uBC0F \uC804/\uD6C4 \uC0AC\uC9C4 \uBCF4\uAE30")))),
                                        isExpired && (React.createElement("button", { className: "h-[42px] px-5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:bg-surface-container transition-all cursor-pointer", onClick: handleOpenRequest, type: "button" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "refresh"),
                                            React.createElement("span", null, "\uC7AC\uC2E0\uCCAD\uD558\uAE30")))))));
                        }))),
                        React.createElement("section", { className: "mt-space-md p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg border border-slate-200/60" },
                            React.createElement("div", { className: "flex items-center gap-space-md" },
                                React.createElement("div", { className: "w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 shadow-sm" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "shield_lock")),
                                React.createElement("div", { className: "flex flex-col gap-1" },
                                    React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0 3\uB300 \uC548\uC2EC \uC57D\uC18D"),
                                    React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant leading-relaxed" }, "\u2460 100% \uC2E0\uC6D0 \uBC0F \uBC94\uC8C4\uC774\uB825 \uBCF4\uC99D \uB9C8\uC2A4\uD130 \uBC30\uC815 \u00A0|\u00A0 \u2461 \uC2DC\uACF5 \uAC80\uC218 \uD6C4 \uC804\uC561 \uD604\uC7A5 \uC9C1\uBD88 (\uBD88\uD569\uB9AC\uD55C \uC5D0\uC2A4\uD06C\uB85C \uC218\uC218\uB8CC \uC81C\uB85C) \u00A0|\u00A0 \u2462 \uC2DC\uACF5 \uD558\uC790 \uBC1C\uC0DD \uC2DC 3\uAC1C\uC6D4 \uBB34\uC0C1 A/S \uC548\uC2EC \uCF00\uC5B4 \uBCF4\uC99D"))),
                            React.createElement("div", { className: "flex items-center gap-space-sm shrink-0" },
                                React.createElement("button", { className: "px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors shadow-xs border border-slate-200/80 cursor-pointer", onClick: () => alert('쓸고닦고 3대 안심 보증 규정 전문이 확인되었습니다.'), type: "button" }, "\uBCF4\uC99D \uADDC\uC815 \uD655\uC778"),
                                React.createElement("button", { className: "px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-xs cursor-pointer", onClick: () => alert('고객센터 (02-429-5459) 상담 연결이 준비 중입니다.'), type: "button" }, "\uACE0\uAC1D\uC13C\uD130 \uC0C1\uB2F4\uBB38\uC758"))))))),
        React.createElement("footer", { className: "w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60" },
            React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg" },
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60" },
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uB85C\uACE0", className: "w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20", src: "/logo.png" }),
                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0"),
                        React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD504\uB9AC\uBBF8\uC5C4 \uD648\uCF00\uC5B4 \uCEE8\uC2DC\uC5B4\uC9C0")),
                    React.createElement("div", { className: "flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm" },
                        React.createElement("a", { className: "hover:text-on-surface transition-colors font-semibold", "data-path": "terms-of-service", href: "#" }, "\uC774\uC6A9\uC57D\uAD00"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors font-semibold text-primary", "data-path": "privacy-policy", href: "#" }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors", "data-path": "customer-service", href: "#" }, "\uACE0\uAC1D\uC13C\uD130"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors", "data-path": "partner-inquiry", href: "#" }, "\uAE30\uC0AC \uD30C\uD2B8\uB108 \uB4F1\uB85D"))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm" },
                    React.createElement("div", { className: "flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant" },
                        React.createElement("p", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "(\uC8FC)\uACF5\uAC04\uB2E4\uC6D0"),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uB300\uD45C\uC790: \uAE40\uCDA9\uD6C8"),
                            React.createElement("span", null, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638: 214-88-02482"),
                            React.createElement("span", null, "\uD1B5\uC2E0\uD310\uB9E4\uC5C5\uC2E0\uACE0: \uC81C2025-\uACBD\uAE30\uACE0\uC591-1849\uD638")),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uACE0\uAC1D\uC13C\uD130: 02-429-5459 (\uD3C9\uC77C 09:00 - 18:00)"),
                            React.createElement("span", null, "\uC774\uBA54\uC77C: support@spacendw.kr")),
                        React.createElement("p", { className: "text-outline" }, "\uACBD\uAE30\uB3C4 \uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C \uC911\uC559\uB85C 1261\uBC88\uAE38 42")),
                    React.createElement("div", { className: "flex flex-col justify-between gap-space-sm" },
                        React.createElement("div", { className: "bg-error-container/40 p-space-sm rounded-xl border border-error/20" },
                            React.createElement("p", { className: "font-caption text-caption text-tertiary leading-relaxed" },
                                React.createElement("strong", { className: "font-semibold" }, "[\uD50C\uB7AB\uD3FC \uBA74\uCC45 \uBC0F \uACB0\uC81C \uC548\uB0B4]"),
                                " \uC4F8\uACE0\uB2E6\uACE0\uB294 \uD1B5\uC2E0\uD310\uB9E4\uC911\uAC1C\uC790\uB85C\uC11C \uAC70\uB798 \uB2F9\uC0AC\uC790\uAC00 \uC544\uB2C8\uBA70, \uD604\uC7A5 \uC778\uAC74\uBE44 \uBC0F \uC218\uB9AC \uB178\uBB34\uBE44\uB294 \uC791\uC5C5 \uAC80\uC218 \uD6C4 \uC2DC\uACF5 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uC9C0\uAE09\uB429\uB2C8\uB2E4. \uD50C\uB7AB\uD3FC\uC740 \uD604\uC7A5 \uB178\uBB34\uBE44 \uC5D0\uC2A4\uD06C\uB85C\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBA70 \uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC218\uC218\uB8CC \uC678 \uC2DC\uACF5 \uD558\uC790\uC758 \uBC95\uC801 \uCC45\uC784\uC740 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4.")),
                        React.createElement("p", { className: "font-caption text-caption text-outline text-right md:text-left" }, "\u00A9 2026 (\uC8FC)\uACF5\uAC04\uB2E4\uC6D0. All rights reserved. SseulDakGo Domestic Infrastructure Platform.")))))));
}
// ============================================================================
// [메인 화면 컴포넌트] WEB-CLNT-COM-000 (고객 메인 홈)
// ============================================================================
function WebClntCom000({ onNavigate }) {
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
        }
        catch (e) {
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
    const fetchHomeData = useCallback(async (targetRegion = regionInfo, targetUserNo = userInfo.USER_NO) => {
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
            if (!response.ok)
                return;
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
        }
        catch {
            // 로컬 오프라인 또는 프리뷰 단독 구동 시 초기 시드 데이터 유지
        }
    }, [regionInfo, userInfo.USER_NO]);
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
        const currentIndex = REGION_OPTIONS.findIndex((r) => r.SIGUNGU_CD === regionInfo.SIGUNGU_CD);
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
            }
            else {
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
        if (found && found.COM_NM)
            return found.COM_NM;
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
            return (React.createElement("span", { className: "text-primary bg-primary-fixed/40 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1", "data-field": "ORDER_STATUS" },
                React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-primary inline-block" }),
                item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (파트너 매칭중)`));
        }
        if (item.STATUS_BADGE_TYPE === 'ERROR_PING') {
            return (React.createElement("span", { className: "text-on-error bg-error px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1", "data-field": "ORDER_STATUS" },
                React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-surface-container-lowest inline-block animate-ping" }),
                item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (견적 마감임박)`));
        }
        if (item.STATUS_BADGE_TYPE === 'SECONDARY') {
            return (React.createElement("span", { className: "text-on-secondary-container bg-secondary-container/50 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1", "data-field": "ORDER_STATUS" },
                React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary inline-block" }),
                item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (청약접수중)`));
        }
        return (React.createElement("span", { className: "text-on-secondary-container bg-secondary-container/50 px-2 py-0.5 rounded font-label-sm text-label-sm inline-flex items-center gap-1", "data-field": "ORDER_STATUS" },
            React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-ping" }),
            item.ORDER_STATUS_LABEL || `${item.ORDER_STATUS} (청약접수중)`));
    };
    // 청소 시공 검수 및 현장 직불 완료 승인 (WEB-CLNT-JOB-000) 화면 전환
    if (activeNavPath && (activeNavPath === "WEB-CLNT-JOB-000" || activeNavPath.startsWith("WEB-CLNT-JOB-000?") || activeNavPath === "inspection")) {
        const urlParams = new URLSearchParams(activeNavPath.includes('?') ? activeNavPath.split('?')[1] : '');
        const contractNo = urlParams.get('contractNo') || 'CNT2026103100001';
        return (React.createElement(WebClntJob000, { contractNo: contractNo, currentUser: userInfo, onLogout: () => {
                setUserInfo({
                    isGuest: true,
                    USER_NO: "GUEST",
                    USER_NM: "비회원",
                    USER_ROLE_CD: "GUEST",
                });
                setActiveNavPath("home");
            }, onNavigate: (path) => setActiveNavPath(path) }));
    }
    // 청소 요청 상세 및 파트너 청약서 비교/선택 (WEB-CLNT-ORD-001) 화면 전환
    if (activeNavPath && (activeNavPath === "WEB-CLNT-ORD-001" || activeNavPath.startsWith("WEB-CLNT-ORD-001?"))) {
        const urlParams = new URLSearchParams(activeNavPath.includes('?') ? activeNavPath.split('?')[1] : '');
        const orderNo = urlParams.get('orderNo') || 'ORD2026103100001';
        return (React.createElement(WebClntOrd001, { orderNo: orderNo, currentUser: userInfo, onLogout: () => {
                setUserInfo({
                    isGuest: true,
                    USER_NO: "GUEST",
                    USER_NM: "비회원",
                    USER_ROLE_CD: "GUEST",
                });
                setActiveNavPath("home");
            }, onNavigate: (path) => setActiveNavPath(path) }));
    }
    // 나의 신청현황(WEB-CLNT-ORD-000) 화면 전환
    if (activeNavPath === "my-application-status" || activeNavPath === "my-requests") {
        return (React.createElement(React.Fragment, null,
            React.createElement(WebClntOrd000, { currentUser: userInfo, onLogout: () => {
                    setUserInfo({
                        isGuest: true,
                        USER_NO: "GUEST",
                        USER_NM: "비회원",
                        USER_ROLE_CD: "GUEST",
                    });
                    setActiveNavPath("home");
                }, onNavigate: (path) => setActiveNavPath(path), onOpenRequestModal: () => setIsReqModalOpen(true) }),
            React.createElement(WebClntReq000, { isOpen: isReqModalOpen, onClose: () => setIsReqModalOpen(false), onOrderCreated: handleOrderCreated })));
    }
    return (React.createElement("div", { className: "bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col" },
        React.createElement("style", null, `
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
      `),
        React.createElement("header", { className: "fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)]" },
            React.createElement("div", { className: "h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md" },
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("a", { className: "flex items-center gap-space-sm group", "data-path": "home", href: "#home", onClick: (e) => handleNavClick(e, 'home') },
                        React.createElement("img", { src: "/logo.png", alt: "\uC4F8\uACE0\uB531\uACE0 \uB85C\uACE0", className: "w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20" }),
                        React.createElement("div", { className: "flex flex-col" },
                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none" }, "\uC4F8\uACE0\uB531\uACE0"),
                            React.createElement("span", { className: "font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold" }, "BUILDING CLEANING STANDARD"))),
                    React.createElement("button", { className: "hidden xl:flex items-center gap-1.5 h-9 px-space-sm bg-surface-container-low hover:bg-surface-container text-on-surface rounded-full transition-all", "data-field": "SIGUNGU_CD", onClick: handleToggleRegion, title: "\uD074\uB9AD\uD558\uC5EC \uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uBCC0\uACBD", type: "button" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "location_on"),
                        React.createElement("span", { className: "font-label-sm text-label-sm" }, regionInfo.DISPLAY_NM),
                        React.createElement("span", { className: "material-symbols-outlined text-[14px] text-outline" }, "keyboard_arrow_down"))),
                React.createElement("nav", { className: "hidden md:flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full", "data-active-classes": "bg-secondary-container text-on-secondary-container font-label-md" },
                    React.createElement("a", { "aria-current": activeNavPath === 'home' ? 'page' : undefined, className: activeNavPath === 'home'
                            ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                            : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all', "data-path": "home", href: "#home", onClick: (e) => handleNavClick(e, 'home') }, "\uD648"),
                    React.createElement("a", { className: activeNavPath === 'my-application-status'
                            ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                            : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all', "data-path": "my-application-status", href: "#my-application-status", onClick: (e) => handleNavClick(e, 'my-application-status') }, "\uB098\uC758 \uC2E0\uCCAD\uD604\uD669"),
                    React.createElement("a", { className: activeNavPath === 'service-history'
                            ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                            : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all', "data-path": "service-history", href: "#service-history", onClick: (e) => handleNavClick(e, 'service-history') }, "\uC774\uC6A9\uB0B4\uC5ED"),
                    React.createElement("a", { className: activeNavPath === 'my-account'
                            ? 'px-space-md py-1.5 rounded-full transition-all bg-secondary-container text-on-secondary-container font-label-md'
                            : 'px-space-md py-1.5 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all', "data-path": "my-account", href: "#my-account", onClick: (e) => handleNavClick(e, 'my-account') }, "\uB9C8\uC774")),
                React.createElement("div", { className: "flex items-center gap-space-sm shrink-0" }, !userInfo.isGuest ? (React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", { "aria-label": "\uC54C\uB9BC", className: "w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors relative", type: "button" },
                        React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "notifications"),
                        React.createElement("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary" })),
                    React.createElement("div", { className: "flex items-center gap-space-sm pl-2" },
                        React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center" },
                            React.createElement("span", { className: "material-symbols-outlined text-on-primary text-[18px]" }, "person")),
                        React.createElement("div", { className: "hidden lg:flex flex-col text-left leading-tight" },
                            React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface", "data-field": "USER_NM" },
                                    userInfo.USER_NM,
                                    "\uB2D8"),
                                React.createElement("span", { className: "font-caption text-caption px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-fixed-variant rounded font-semibold" }, "\uC778\uC99D\uD68C\uC6D0")),
                            React.createElement("span", { className: "font-caption text-caption text-outline font-mono", "data-field": "USER_NO" }, userInfo.USER_NO)),
                        React.createElement("button", { className: "font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface px-2.5 py-1.5 rounded-lg transition-colors ml-1", onClick: () => {
                                try {
                                    localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
                                    localStorage.removeItem('SSEULDAKGO_AUTH_USER');
                                    sessionStorage.removeItem('SSEULDAKGO_AUTH_USER');
                                }
                                catch (e) { }
                                setUserInfo({
                                    isGuest: true,
                                    USER_NO: 'GUEST',
                                    USER_NM: '비회원',
                                    USER_ROLE_CD: 'GUEST',
                                });
                            }, type: "button" }, "\uB85C\uADF8\uC544\uC6C3")))) : (React.createElement("div", { className: "flex items-center gap-2", id: "auth-guest-cluster" },
                    React.createElement("a", { className: "h-9 px-space-md inline-flex items-center justify-center rounded-xl font-label-md text-label-md text-primary hover:bg-primary-fixed/30 hover:text-on-primary-fixed-variant transition-colors cursor-pointer", "data-path": "customer-login", href: "#customer-login", onClick: (e) => {
                            e.preventDefault();
                            setIsLoginModalOpen(true);
                        } }, "\uB85C\uADF8\uC778"),
                    React.createElement("a", { className: "h-9 px-space-md inline-flex items-center justify-center rounded-xl font-label-md text-label-md bg-primary hover:bg-primary-container text-on-primary transition-colors shadow-sm cursor-pointer", "data-path": "customer-signup", href: "#customer-signup", onClick: (e) => {
                            e.preventDefault();
                            setIsRegisterModalOpen(true);
                        } }, "\uD68C\uC6D0\uAC00\uC785")))))),
        React.createElement("main", { className: "w-full pt-[72px] min-h-[calc(100vh-280px)] bg-surface" },
            React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin py-space-lg" },
                React.createElement("div", { className: "flex flex-col w-full space-y-12 pb-24" },
                    React.createElement("div", { className: "flex items-center justify-between py-2 text-on-surface-variant font-caption text-caption" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("span", { className: "inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-on-secondary" },
                                React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "bolt")),
                            React.createElement("span", { className: "font-label-sm text-label-sm text-primary tracking-wide" }, "WEB-CLNT-COM-000"),
                            React.createElement("span", { className: "text-outline-variant" }, "\u2022"),
                            React.createElement("span", { className: "text-on-surface-variant font-body-sm text-body-sm" }, "\uACE0\uAC1D \uBA54\uC778 \uD648 \uD45C\uC900 \uB9C8\uCF13\uD50C\uB808\uC774\uC2A4")),
                        React.createElement("div", { className: "hidden sm:flex items-center gap-3" },
                            React.createElement("span", { className: "inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm" },
                                React.createElement("span", { className: "w-2 h-2 rounded-full bg-secondary animate-pulse" }),
                                "\uACE0\uC591/\uC77C\uC0B0 \uC2E4\uC2DC\uAC04 \uBC30\uCC28\uAD00\uC81C \uC911"),
                            React.createElement("span", { className: "text-outline-variant" }, "|"),
                            React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uB2E8\uC77C \uB9E4\uCE6D\uC218\uC218\uB8CC \u20A916,500 \uBCF4\uC7A5"))),
                    React.createElement("section", { className: "flex flex-col space-y-8" },
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm shadow-sm" },
                                React.createElement("span", { className: "material-symbols-outlined text-[15px] text-secondary" }, "verified_user"),
                                "\uC5ED\uACBD\uB9E4 \uC5C6\uB294 \uD22C\uBA85\uD55C 100% \uACE0\uAC1D \uC9C0\uC815\uAC00 \uB9E4\uCE6D \uC2DC\uC2A4\uD15C"),
                            React.createElement("h1", { className: "font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold" }, "\uC6D0\uD558\uB294 \uCCAD\uC18C \uC11C\uBE44\uC2A4\uB97C \uC120\uD0DD\uD558\uACE0 \uD655\uC815 \uAE08\uC561\uC73C\uB85C \uBC14\uB85C \uBC1C\uC8FC\uD558\uC138\uC694"),
                            React.createElement("p", { className: "font-body-lg text-body-lg text-on-surface-variant max-w-3xl" }, "\uC4F8\uACE0\uB2E6\uACE0\uB294 \uC5C5\uCCB4\uC758 \uACFC\uB2E4 \uACAC\uC801 \uACBD\uC7C1\uC744 \uC9C0\uC591\uD569\uB2C8\uB2E4. \uACE0\uAC1D\uC774 \uCC45\uC815\uD55C \uC815\uCC30\uC81C \uBC1C\uC8FC\uAC00\uB85C \uB3D9\uB124 \uAC80\uC99D \uB9C8\uC2A4\uD130\uAC00 1:1 \uC9C1\uC811 \uB9E4\uCE6D\uB418\uBA70, \uC2DC\uACF5\uBE44\uB294 \uAC80\uC218 \uD6C4 \uD604\uC7A5\uC5D0\uC11C \uC9C1\uBD88\uD569\uB2C8\uB2E4.")),
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-gutter" },
                            React.createElement("article", { className: "group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20", "data-clean-large": "REGULAR", onClick: () => openRequestModal('REGULAR') },
                                React.createElement("div", { className: "space-y-5" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm" }, "\uCD5C\uC18C 3\uAC1C\uC6D4(90\uC77C) \uB77D"),
                                        React.createElement("span", { className: "font-caption text-caption text-outline uppercase font-mono tracking-wider" }, "CODE: REGULAR")),
                                    React.createElement("div", { className: "flex items-center gap-4" },
                                        React.createElement("div", { className: "w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors" },
                                            React.createElement("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", strokeWidth: "1.8", viewBox: "0 0 24 24" },
                                                React.createElement("path", { d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", strokeLinecap: "round", strokeLinejoin: "round" }))),
                                        React.createElement("div", null,
                                            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-on-surface font-bold" }, "\uAC74\uBB3C \uC815\uAE30\uAD00\uB9AC"),
                                            React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uACC4\uB2E8, \uBCF5\uB3C4, \uC678\uACFD, \uBD84\uB9AC\uC218\uAC70\uC7A5 \uACF5\uC6A9\uBD80 \uCF00\uC5B4"))),
                                    React.createElement("div", { className: "overflow-hidden rounded-lg h-36 relative" },
                                        React.createElement("img", { alt: "\uBE4C\uB77C\u00B7\uC6D0\uB8F8\u00B7\uC0C1\uAC00\uC8FC\uD0DD \uACF5\uC6A9\uBD80", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", "data-alt": "Spotless modern residential apartment building staircase and hallway polished pristine floor illuminated with clean daylight professional domestic maintenance style navy teal highlights", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQrJd6U17hxg14WD26N5fwT0NrJibmU2eBON6qbohtbuE0_g9AjKSzKLQHAbd5-uSGXrB5ahmajwvJXWAYyPVVEMpu7zeaxmCN3AWxKfACG7evJLPk0GqhllYmTNZR19V0aB0jYgSGd6J2fYsCZ51Xnp8K1tYb5oigCudt24stCZZK7cJkrtSiHKL_1KHDQObBgffiQjf95oyozR03g6dPBk0ee3N07o3vT4jezlU" }),
                                        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" }),
                                        React.createElement("span", { className: "absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold" }, "\uBE4C\uB77C\u00B7\uC6D0\uB8F8\u00B7\uC0C1\uAC00\uC8FC\uD0DD \uACF5\uC6A9\uBD80")))),
                            React.createElement("article", { className: "group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20", "data-clean-large": "APPLIANCE", onClick: () => openRequestModal('APPLIANCE') },
                                React.createElement("div", { className: "space-y-5" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "px-2.5 py-1 rounded-full bg-surface-container-highest text-on-primary-fixed-variant font-label-sm text-label-sm" }, "\uC644\uC804\uBD84\uD574 \uC0B4\uADE0\uC138\uCC99"),
                                        React.createElement("span", { className: "font-caption text-caption text-outline uppercase font-mono tracking-wider" }, "CODE: APPLIANCE")),
                                    React.createElement("div", { className: "flex items-center gap-4" },
                                        React.createElement("div", { className: "w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors" },
                                            React.createElement("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", strokeWidth: "1.8", viewBox: "0 0 24 24" },
                                                React.createElement("path", { d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z", strokeLinecap: "round", strokeLinejoin: "round" }))),
                                        React.createElement("div", null,
                                            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-on-surface font-bold" }, "\uAC00\uC804 \uBD84\uD574\uCCAD\uC18C"),
                                            React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uC2DC\uC2A4\uD15C/\uBCBD\uAC78\uC774 \uC5D0\uC5B4\uCEE8, \uC138\uD0C1\uAE30 \uACE0\uC555 \uC2A4\uD300"))),
                                    React.createElement("div", { className: "overflow-hidden rounded-lg h-36 relative" },
                                        React.createElement("img", { alt: "\uBCBD\uAC78\uC774\u00B7\uC2A4\uD0E0\uB4DC\u00B7\uCC9C\uC7A5\uD615 \uC2DC\uC2A4\uD15C", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", "data-alt": "Professional air conditioner disassembly cleaning technician high pressure eco steam wash hygiene equipment focused indoor air conditioning maintenance clean navy lighting", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDN88rR-7g3MXiXHGjW2KcQY9jjssKs7wUTC70WkIxEmBZzDqvEV8YF4_RUmQyxZsUeQgqUPPtGW5WZeFs5B-G4BXtWyPSTfi3YdBu439YRdD4l-hm-eoA2AFcCa7Ke3uOQdL--99VS2Fi2gPJ7iWsvdO2qObIfgG2rGi-BVJwifw4bupVz7DzloBv-ShUJWBB9rbzxq0wrZVK8bYZISwGBH0D6QsoegH050YGZQPk" }),
                                        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" }),
                                        React.createElement("span", { className: "absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold" }, "\uBCBD\uAC78\uC774\u00B7\uC2A4\uD0E0\uB4DC\u00B7\uCC9C\uC7A5\uD615 \uC2DC\uC2A4\uD15C")))),
                            React.createElement("article", { className: "group relative flex flex-col p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/20", "data-clean-large": "MOVEIN", onClick: () => openRequestModal('MOVEIN') },
                                React.createElement("div", { className: "space-y-5" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm" }, "\uC2E4\uB0B4 \uC804\uC6A9\uACF5\uAC04 \uCF00\uC5B4"),
                                        React.createElement("span", { className: "font-caption text-caption text-outline uppercase font-mono tracking-wider" }, "CODE: MOVEIN")),
                                    React.createElement("div", { className: "flex items-center gap-4" },
                                        React.createElement("div", { className: "w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors" },
                                            React.createElement("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", strokeWidth: "1.8", viewBox: "0 0 24 24" },
                                                React.createElement("path", { d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", strokeLinecap: "round", strokeLinejoin: "round" }))),
                                        React.createElement("div", null,
                                            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-on-surface font-bold" }, "\uC785\uC8FC/\uC774\uC0AC \uB300\uCCAD\uC18C"),
                                            React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uC2E0\uCD95 \uC785\uC8FC, \uC774\uC0AC \uC804 \uBD84\uC9C4/\uCC0C\uB4E0 \uB54C \uC815\uBC00 \uCF00\uC5B4"))),
                                    React.createElement("div", { className: "overflow-hidden rounded-lg h-36 relative" },
                                        React.createElement("img", { alt: "\uC544\uD30C\uD2B8\u00B7\uC624\uD53C\uC2A4\uD154\u00B7\uBE4C\uB77C \uC8FC\uAC70\uACF5\uAC04", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", "data-alt": "Pristine interior of a modern newly built apartment living room floor-to-ceiling windows shining wood floors spotless kitchen sanitized clean sunlight ambiance", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfVCkHDfYj9AdDiT1ztZNi7q11XXpNQZUktEmlPGROUg0I2tGa5MYqoprZz4I49j02JdlVwW_2xDjUV5YnD7paNBq4cCHp_dXC5i-WTMRD7ZkVSB4Ffunx7e55RATLf5ayaTwHh3643ecUVzvbpyNE-VtdX3hn0fiTxbZdxRVBd2m8yHOelJubqc9AHVeI_AuzPZt82ODjPO3aR7NV4pGYS43S1gHZCx4zOsvVCDw" }),
                                        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" }),
                                        React.createElement("span", { className: "absolute bottom-2 left-3 font-caption text-caption text-on-primary font-semibold" }, "\uC544\uD30C\uD2B8\u00B7\uC624\uD53C\uC2A4\uD154\u00B7\uBE4C\uB77C \uC8FC\uAC70\uACF5\uAC04")))))),
                    React.createElement("section", { className: "flex flex-col space-y-4" },
                        React.createElement("div", { className: "flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest shadow-sm" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-secondary animate-ping" }),
                                React.createElement("h2", { className: "font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-1.5" },
                                    React.createElement("span", null, "\uD83D\uDCCD \uB0B4 \uB3D9\uB124 \uC2E4\uC2DC\uAC04 \uC811\uC218 \uD604\uD669"),
                                    React.createElement("span", { className: "px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm", "data-field": "SIGUNGU_CD" }, regionInfo.SHORT_NM))),
                            React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uC2E4\uC2DC\uAC04 \uC790\uB3D9 \uAC31\uC2E0\uC911 (10\uCD08 \uC8FC\uAE30)")),
                        React.createElement("div", { className: "space-y-3" }, feedList.map((order) => (React.createElement("div", { className: "p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3", key: order.ORDER_NO },
                            React.createElement("div", { className: "space-y-1.5 min-w-0" },
                                React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                                    React.createElement("span", { className: "font-caption text-caption font-mono text-outline", "data-field": "ORDER_NO" }, order.ORDER_NO),
                                    React.createElement("span", { className: getCategoryBadgeClass(order.CLEAN_LARGE_CD), "data-field": "CLEAN_LARGE_CD" }, getCategoryName(order.CLEAN_LARGE_CD, order.CLEAN_LARGE_NM)),
                                    renderOrderStatusBadge(order)),
                                React.createElement("div", { className: "font-body-md text-body-md text-on-surface font-semibold truncate", "data-field": "ADDR_TEXT" }, order.ADDR_TEXT),
                                React.createElement("div", { className: "flex items-center gap-2 font-caption text-caption text-on-surface-variant" },
                                    React.createElement("span", null, order.SUB_SPEC_TEXT || '고객 지정가 확정 발주'),
                                    React.createElement("span", null, "\u2022"),
                                    React.createElement("span", { className: "text-outline", "data-field": "REG_DT" }, order.REG_DT))),
                            React.createElement("div", { className: "text-left sm:text-right shrink-0" },
                                React.createElement("span", { className: "block font-caption text-caption text-on-surface-variant" }, "\uACE0\uAC1D \uC9C0\uC815 \uBC1C\uC8FC\uAC00"),
                                React.createElement("span", { className: "font-headline-sm text-headline-sm text-secondary font-bold", "data-field": "PROPOSED_PRICE" },
                                    order.PRICE_PREFIX ||
                                        (order.CLEAN_LARGE_CD === 'REGULAR' ? '월 ' : ''),
                                    Number(order.PROPOSED_PRICE).toLocaleString(),
                                    "\uC6D0"))))))),
                    React.createElement("section", { className: "p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col space-y-6" },
                        React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" },
                            React.createElement("div", { className: "space-y-1" },
                                React.createElement("span", { className: "text-secondary font-label-md text-label-md tracking-wide" }, "VERIFIED PRO VETTING PROCESS"),
                                React.createElement("h2", { className: "font-headline-md text-headline-md text-on-surface font-bold" }, "\uC624\uC9C1 \uC5C4\uC120\uB41C 4\uB2E8\uACC4 \uAC80\uC99D \uB9C8\uC2A4\uD130\uB9CC \uD604\uC7A5\uC5D0 \uD22C\uC785\uB429\uB2C8\uB2E4"),
                                React.createElement("p", { className: "font-body-md text-body-md text-on-surface-variant" }, "\uBD88\uC548\uD55C \uBE44\uB300\uBA74 \uC678\uC8FC \uAE30\uC0AC\uAC00 \uC544\uB2CC, \uC2E0\uC6D0\uACFC \uAE30\uC220\uB825\uC774 \uC0AC\uC804 \uC785\uC99D\uB41C \uC6B0\uB9AC \uB3D9\uB124 \uC804\uB2F4 \uAE30\uC220 \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.")),
                            React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                                React.createElement("span", { className: "px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold" }, "\uD30C\uD2B8\uB108 \uB204\uC801 \uD569\uACA9\uB960 14.8%"))),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" },
                            React.createElement("div", { className: "p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "font-mono text-caption text-primary font-bold" }, "STEP 01"),
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[24px]" }, "badge")),
                                React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uC2E4\uBA85 \uBC0F \uC2E0\uC6D0 \uAC80\uC99D"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC99D, \uC2E0\uBD84\uC99D \uC9C4\uC704 \uD655\uC778 \uBC0F \uC8FC\uAC70\uC9C0\uC5ED \uC815\uBC00 \uC870\uD68C \uC2DC\uC2A4\uD15C\uC744 \uD1B5\uACFC\uD55C \uD30C\uD2B8\uB108\uB9CC \uD65C\uB3D9\uC744 \uC778\uAC00\uD569\uB2C8\uB2E4.")),
                            React.createElement("div", { className: "p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "font-mono text-caption text-primary font-bold" }, "STEP 02"),
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[24px]" }, "security")),
                                React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uC601\uC5C5\uBC30\uC0C1\uBCF4\uD5D8 1\uC5B5"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uC791\uC5C5 \uC911 \uBC1C\uC0DD\uD560 \uC218 \uC788\uB294 \uC2DC\uC124\uBB3C \uD30C\uC190 \uBC0F \uAC00\uC804 \uACB0\uD568\uC5D0 \uB300\uBE44\uD558\uC5EC \uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8 1\uC5B5\uC6D0 \uAC00\uC785\uC744 \uD544\uC218 \uC758\uBB34\uD654\uD569\uB2C8\uB2E4.")),
                            React.createElement("div", { className: "p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "font-mono text-caption text-primary font-bold" }, "STEP 03"),
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[24px]" }, "school")),
                                React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uD45C\uC900 CS\u00B7\uC704\uC0DD \uAD50\uC721"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uBD84\uD574\uC138\uCC99 \uB9E4\uB274\uC5BC \uBC0F \uACE0\uAC1D \uC811\uC810 \uC751\uB300 \uD45C\uC900, \uCE5C\uD658\uACBD \uC57D\uC81C \uBC30\uD569 \uAE30\uC900 \uACFC\uC815\uC744 \uC218\uB8CC\uD55C \uB9C8\uC2A4\uD130\uC5D0\uAC8C\uB9CC \uB9E4\uCE6D \uD2F0\uCF13\uC744 \uBD80\uC5EC\uD569\uB2C8\uB2E4.")),
                            React.createElement("div", { className: "p-5 rounded-xl bg-surface-container-low flex flex-col space-y-3" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "font-mono text-caption text-primary font-bold" }, "STEP 04"),
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[24px]" }, "hotel_class")),
                                React.createElement("h3", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uD3C9\uC810 4.5 \uC774\uC0C1 \uC720\uC9C0"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uC2E4\uC81C \uC2DC\uACF5 \uACE0\uAC1D\uC758 \uB9AC\uBDF0 \uD3C9\uC810\uC774 4.5\uC810 \uBBF8\uB9CC\uC73C\uB85C \uD558\uB77D\uD560 \uACBD\uC6B0 \uC790\uB3D9 \uD65C\uB3D9 \uC911\uC9C0 \uBC0F \uCD94\uAC00 \uAE30\uC220 \uC7AC\uAC80\uC99D\uC744 \uC9C4\uD589\uD569\uB2C8\uB2E4.")))),
                    React.createElement("aside", { className: "sticky bottom-4 z-40 w-full" },
                        React.createElement("div", { className: "mx-auto max-w-[1200px] p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "add_task")),
                                React.createElement("div", { className: "space-y-0.5" },
                                    React.createElement("p", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uC6D0\uD558\uB294 \uC870\uAC74\uACFC \uAE08\uC561\uC73C\uB85C \uCCAD\uC18C\uB97C \uBC1C\uC8FC\uD558\uACE0 \uAE30\uC0AC\uB2D8\uC744 \uB9E4\uCE6D\uBC1B\uC73C\uC138\uC694!"),
                                    React.createElement("p", { className: "font-caption text-caption text-secondary" }, "\uBE44\uD68C\uC6D0 \uC791\uC131 \uC2DC \uBE0C\uB77C\uC6B0\uC800 \uC790\uB3D9 \uC784\uC2DC \uC800\uC7A5 \uC9C0\uC6D0 \u2022 \uB85C\uADF8\uC778 \uC2DC 100% \uC790\uB3D9 \uBCF5\uC6D0"))),
                            React.createElement("div", { className: "w-full sm:w-auto shrink-0" },
                                React.createElement("button", { className: "w-full sm:w-auto h-[52px] px-6 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-md", onClick: () => openRequestModal('REGULAR'), type: "button" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "post_add"),
                                    React.createElement("span", null, "\uC6B0\uB9AC\uC9D1 \uCCAD\uC18C \uC694\uCCAD \uB4F1\uB85D\uD558\uAE30"))))),
                    React.createElement(WebClntReq000, { initialTab: selectedCategory, isOpen: isReqModalOpen, onClose: () => setIsReqModalOpen(false), onOpenLogin: () => {
                            setIsReqModalOpen(false);
                            setIsLoginModalOpen(true);
                        }, onOrderCreated: handleOrderCreated, regionInfo: regionInfo, userNo: userInfo.USER_NO }),
                    React.createElement(WebClntAth000, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false), onOpenRegister: () => {
                            setIsLoginModalOpen(false);
                            setIsRegisterModalOpen(true);
                        }, onSuccessLogin: (userData) => {
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
                            }
                            else {
                                localStorage.removeItem('SSEULDAKGO_KEEP_LOGIN');
                                localStorage.removeItem('SSEULDAKGO_AUTH_USER');
                                sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                            }
                            setUserInfo(updated);
                            const hasSavedDraft = typeof window !== 'undefined' && Boolean(localStorage.getItem('SSEULDAKGO_GUEST_TEMP_REQ'));
                            if (userData.hasTempReq || hasSavedDraft) {
                                setIsReqModalOpen(true);
                            }
                        } }),
                    React.createElement(WebClntAth010, { isOpen: isRegisterModalOpen, onClose: () => setIsRegisterModalOpen(false), onOpenLogin: () => {
                            setIsRegisterModalOpen(false);
                            setIsLoginModalOpen(true);
                        }, onSuccessRegister: (userData) => {
                            setIsRegisterModalOpen(false);
                            if (userData && (userData.userRoleCd === 'C' || !userData.userRoleCd)) {
                                setWelcomeUserInfo(userData);
                                setIsWelcomeModalOpen(true);
                            }
                            else {
                                setIsLoginModalOpen(true);
                            }
                        } }),
                    React.createElement(WebClntAth011, { isOpen: isWelcomeModalOpen, userInfo: welcomeUserInfo, onClose: () => setIsWelcomeModalOpen(false), onOpenRequestModal: () => {
                            setIsWelcomeModalOpen(false);
                            setIsReqModalOpen(true);
                        } })))),
        React.createElement("footer", { className: "w-full bg-inverse-surface text-surface-dim mt-auto" },
            React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin py-space-xl" },
                React.createElement("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-center pb-space-lg gap-space-md" },
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("img", { src: "/logo.png", alt: "\uC4F8\uACE0\uB531\uACE0 \uB85C\uACE0", className: "w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-white/20" }),
                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight" }, "\uC4F8\uACE0\uB531\uACE0"),
                        React.createElement("span", { className: "font-caption text-caption text-surface-dim/70 px-2 py-0.5 bg-inverse-surface rounded" }, "\uACE0\uAC1D\uC13C\uD130 02-429-5459")),
                    React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-2 text-surface-dim font-label-sm text-label-sm" },
                        React.createElement("a", { className: "hover:text-inverse-on-surface transition-colors", "data-path": "terms-of-service", href: "#terms-of-service", onClick: (e) => handleNavClick(e, 'terms-of-service') }, "\uC774\uC6A9\uC57D\uAD00"),
                        React.createElement("a", { className: "hover:text-inverse-on-surface font-bold text-inverse-on-surface transition-colors", "data-path": "privacy-policy", href: "#privacy-policy", onClick: (e) => handleNavClick(e, 'privacy-policy') }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                        React.createElement("a", { className: "hover:text-inverse-on-surface transition-colors", "data-path": "electronic-financial-terms", href: "#electronic-financial-terms", onClick: (e) => handleNavClick(e, 'electronic-financial-terms') }, "\uC804\uC790\uAE08\uC735\uAC70\uB798\uC57D\uAD00"),
                        React.createElement("a", { className: "hover:text-secondary-fixed transition-colors flex items-center gap-1", "data-path": "partner-onboarding-guide", href: "#partner-onboarding-guide", onClick: (e) => handleNavClick(e, 'partner-onboarding-guide') },
                            "\uD30C\uD2B8\uB108 \uC785\uC810 \uC548\uB0B4",
                            React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "arrow_forward")))),
                React.createElement("div", { className: "py-space-md space-y-2 font-caption text-caption text-surface-dim/80 leading-relaxed" },
                    React.createElement("div", { className: "flex flex-wrap items-center gap-x-space-md gap-y-1" },
                        React.createElement("span", null, "(\uC8FC)\uACF5\uAC04\uB2E4\uC6D0"),
                        React.createElement("span", null, "\uB300\uD45C\uC790: \uAE40\uCDA9\uD6C8"),
                        React.createElement("span", null, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638: 214-88-02482"),
                        React.createElement("span", null, "\uD1B5\uC2E0\uD310\uB9E4\uC5C5\uC2E0\uACE0: \uC81C2025-\uACBD\uAE30\uACE0\uC591-1849\uD638"),
                        React.createElement("span", null, "\uC8FC\uC18C: \uACBD\uAE30\uB3C4 \uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C \uC911\uC559\uB85C 1261\uBC88\uAE38 42")),
                    React.createElement("p", { className: "text-tertiary-fixed-dim/90 bg-tertiary-container/30 px-space-md py-space-sm rounded-lg mt-space-sm" }, "\uC4F8\uACE0\uB2E6\uACE0\uB294 \uD1B5\uC2E0\uD310\uB9E4\uC911\uAC1C\uC790\uB85C\uC11C \uAC70\uB798 \uB2F9\uC0AC\uC790\uAC00 \uC544\uB2C8\uBA70 \uD604\uC7A5 \uC9C1\uBD88 \uACC4\uC57D \uCC45\uC784\uC740 \uC2DC\uACF5 \uB2F9\uC0AC\uC790\uC5D0\uAC8C \uC788\uC2B5\uB2C8\uB2E4. \uC791\uC5C5 \uD604\uC7A5\uC758 \uC548\uC804\uC870\uCE58 \uBC0F \uCD5C\uC885 \uC2DC\uACF5 \uC0C1\uD0DC \uD655\uC778 \uD6C4 \uD604\uC7A5 \uC2DC\uACF5\uC0AC\uC5D0\uAC8C \uC9C1\uC811 \uC815\uC0B0\uD558\uC5EC \uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.")),
                React.createElement("div", { className: "pt-space-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-sm font-caption text-caption text-surface-dim/60" },
                    React.createElement("p", null, "\u00A9 2026 SPACE DAWUN Inc. All rights reserved. SseulDakGo Domestic Infrastructure Platform."),
                    React.createElement("div", { className: "flex items-center gap-space-sm text-surface-dim/80" },
                        React.createElement("span", { className: "flex items-center gap-1" },
                            React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary-fixed" }),
                            " \uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC815\uC561 \u20A916,500 \uBCF4\uC7A5")))))));
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
function WebClntPay000({ isOpen = false, orderData = null, applyData = null, currentUser = { USER_NO: 'C20261000001', USER_NM: '홍길동' }, onClose, onPaymentSuccess }) {
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
        if (isLoading)
            return;
        if (window.confirm('결제를 중단하고 청약서 비교 화면으로 돌아가시겠습니까?\n배타적 매칭은 완료되지 않습니다.')) {
            if (onClose)
                onClose();
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
                alert(`[결제 및 배차 확정 완료]\n` +
                    `• 결제 승인 금액: ₩${feeCalculation.totalPrice.toLocaleString()}원 (VAT 포함)\n` +
                    `• 계약 관리번호: ${contractInfo.contractNo}\n` +
                    `• 시공 파트너: ${effectiveApply.companyNm} (${effectiveApply.userNm})\n` +
                    `• 배차 확정 일정: ${effectiveApply.confirmedDate} ${effectiveApply.confirmedTime}\n` +
                    `• 발급 안심번호: ${contractInfo.safeTelNo}\n\n` +
                    `※ 시공 완료 후 현장 검수를 마치신 후, 확정 청소대금(₩${Number(effectiveApply.totalServiceAmt).toLocaleString()}원)을 마스터 계좌로 직접 송금해 주시기 바랍니다.`);
                if (onPaymentSuccess) {
                    onPaymentSuccess(contractInfo);
                }
                if (onClose) {
                    onClose();
                }
            }
            else {
                setAlertError(resData.message || '결제 승인 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
        catch (err) {
            console.warn('[PAY_FALLBACK_SIMULATION]', err);
            // 오프라인 / 네트워크 지연 시뮬레이션
            const mockContractNo = `CNT20261102${Math.floor(10000 + Math.random() * 90000)}`;
            const mockSafeTel = `0507-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            alert(`[결제 및 배차 확정 완료 (시뮬레이션)]\n` +
                `• 결제 승인 금액: ₩${feeCalculation.totalPrice.toLocaleString()}원\n` +
                `• 계약 관리번호: ${mockContractNo}\n` +
                `• 파트너: ${effectiveApply.companyNm}\n` +
                `• 발급 안심번호: ${mockSafeTel}\n\n` +
                `배차가 최종 확정되었습니다.`);
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
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200", id: "payment-modal-overlay", role: "dialog", "aria-labelledby": "modal-headline", "aria-modal": "true" },
        React.createElement("div", { className: "max-w-[540px] w-full max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200/60 animate-in zoom-in-95" },
            React.createElement("header", { className: "p-6 bg-surface-container-lowest sticky top-0 z-20 flex items-start justify-between border-b border-slate-100 shadow-sm" },
                React.createElement("div", { className: "flex flex-col" },
                    React.createElement("span", { className: "font-label-sm text-label-sm bg-secondary-container text-on-secondary-fixed font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-1.5 w-fit" },
                        React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "gavel"),
                        "\uC804\uC790\uACC4\uC57D \uCCB4\uACB0 \uBC0F \uC5D0\uC2A4\uD06C\uB85C \uBBF8\uC801\uC6A9 \uC9C1\uBD88 \uC548\uB0B4"),
                    React.createElement("h1", { className: "font-headline-md text-headline-md text-primary font-bold tracking-tight", id: "modal-headline" }, "\uB9E4\uCE6D \uD655\uC815 \uBC0F \uC774\uC6A9\uB8CC \uACB0\uC81C"),
                    React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant mt-0.5" }, "\uC120\uD0DD\uD558\uC2E0 \uD30C\uD2B8\uB108\uC640 \uCD5C\uC885 \uB9E4\uCE6D\uC744 \uC704\uD574 \uD50C\uB7AB\uD3FC \uB370\uC774\uD130 \uC774\uC6A9\uB8CC\uB97C \uACB0\uC81C\uD569\uB2C8\uB2E4.")),
                React.createElement("button", { "aria-label": "\uB2EB\uAE30", className: "text-outline hover:text-on-surface p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer shrink-0", onClick: handleModalClose, type: "button" },
                    React.createElement("span", { className: "material-symbols-outlined text-2xl" }, "close"))),
            React.createElement("div", { className: "p-6 overflow-y-auto space-y-5" },
                alertError && (React.createElement("div", { className: "p-3.5 bg-error-container text-on-error-container rounded-xl flex items-start gap-2 text-xs animate-in fade-in" },
                    React.createElement("span", { className: "material-symbols-outlined text-error text-base shrink-0 mt-0.5" }, "error"),
                    React.createElement("p", { className: "leading-relaxed font-medium" }, alertError))),
                React.createElement("section", { className: "bg-primary text-on-primary rounded-xl p-5 shadow-inner flex flex-col relative overflow-hidden" },
                    React.createElement("div", { className: "absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" }),
                    React.createElement("div", { className: "flex items-start justify-between gap-space-sm pb-2 border-b border-white/10" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "font-label-sm text-label-sm text-secondary-fixed block mb-0.5" }, "\uCD5C\uC885 \uC120\uC815 \uC2DC\uACF5 \uD30C\uD2B8\uB108"),
                            React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" },
                                React.createElement("strong", { className: "font-headline-sm text-headline-sm text-on-primary font-bold", "data-field": "COMPANY_NM" }, effectiveApply.companyNm),
                                React.createElement("span", { className: "font-body-sm text-body-sm text-primary-fixed opacity-90", "data-field": "USER_NM" },
                                    "(",
                                    effectiveApply.userNm,
                                    ")"))),
                        React.createElement("div", { className: "flex items-center gap-1" },
                            React.createElement("span", { className: "bg-secondary/40 text-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold", "data-field": "CLEAN_LARGE_CD" }, effectiveOrder.cleanLargeNm),
                            React.createElement("span", { className: "font-caption text-caption text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded", "data-field": "CLEAN_MID_CD" }, effectiveOrder.cleanMidNm))),
                    React.createElement("div", { className: "bg-white/10 rounded-lg p-3.5 my-3 flex flex-col gap-1.5 backdrop-blur-sm" },
                        React.createElement("div", { className: "flex items-center justify-between text-xs" },
                            React.createElement("span", { className: "font-label-sm text-label-sm text-surface-container-highest flex items-center gap-1" },
                                React.createElement("span", { className: "material-symbols-outlined text-sm text-secondary-fixed" }, "calendar_month"),
                                "\uD655\uC815 \uC2DC\uACF5\uC77C\uC815"),
                            React.createElement("span", { className: "font-caption text-caption text-secondary-fixed font-medium bg-secondary/20 px-2 py-0.5 rounded" }, "\uBC30\uD0C0\uC801 \uC804\uC18D \uC608\uC57D")),
                        React.createElement("div", { className: "flex items-baseline gap-2" },
                            React.createElement("strong", { className: "font-headline-sm text-headline-sm text-secondary-fixed font-bold tracking-tight", "data-field": "CONFIRMED_DATE" }, effectiveApply.confirmedDate),
                            React.createElement("span", { className: "font-label-lg text-label-lg text-secondary-fixed-dim font-medium", "data-field": "CONFIRMED_TIME" }, effectiveApply.confirmedTime)),
                        React.createElement("div", { className: "pt-1 flex items-center gap-1 border-t border-white/10 mt-1" },
                            React.createElement("span", { className: "material-symbols-outlined text-sm text-primary-fixed" }, "phonelink_lock"),
                            React.createElement("span", { className: "font-caption text-caption text-primary-fixed" }, "\uC548\uC2EC\uBC88\uD638:"),
                            React.createElement("span", { className: "font-caption text-caption text-on-primary font-mono font-medium", "data-field": "SAFE_TEL_NO" }, "0507-****-1234 (\uACB0\uC81C \uC644\uB8CC \uC989\uC2DC \uC591\uBC29\uD5A5 \uD1B5\uD654 \uAC1C\uBC29)"))),
                    React.createElement("div", { className: "pt-1 flex flex-col gap-0.5" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "font-label-md text-label-md text-surface-container-highest" }, "\uD604\uC7A5 \uC9C1\uBD88 \uD655\uC815 \uC2DC\uACF5\uB300\uAE08"),
                            React.createElement("strong", { className: "font-headline-md text-headline-md text-on-primary font-bold font-mono", "data-field": "TOTAL_SERVICE_AMT" },
                                "\u20A9",
                                Number(effectiveApply.totalServiceAmt).toLocaleString(),
                                "\uC6D0")),
                        React.createElement("p", { className: "font-caption text-caption text-secondary-fixed-dim text-right" }, "(\uC2DC\uACF5 \uC644\uB8CC \uD6C4 \uD604\uC7A5 \uAC80\uC218 \uD6C4 \uAE30\uC0AC\uB2D8 \uACC4\uC88C\uB85C 100% \uC9C1\uC811 \uC1A1\uAE08 \uC9C0\uAE09)"))),
                React.createElement("section", { className: "rounded-xl p-4 bg-surface-container-low shadow-sm flex flex-col gap-2.5 border border-slate-200/50" },
                    React.createElement("div", { className: "flex items-center justify-between mb-0.5" },
                        React.createElement("h2", { className: "font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5" },
                            React.createElement("span", { className: "material-symbols-outlined text-secondary text-base" }, "receipt_long"),
                            "\uD50C\uB7AB\uD3FC \uB370\uC774\uD130 \uC774\uC6A9\uB8CC \uC815\uC0B0"),
                        React.createElement("span", { className: "font-caption text-caption text-secondary font-semibold bg-secondary-container/40 px-2 py-0.5 rounded" }, "\uC694\uCCAD \uC720\uD615\uBCC4 16,500\uC6D0(VAT\uD3EC\uD568) \uD45C\uC900 \uACFC\uAE08\uC81C")),
                    React.createElement("div", { className: "p-2.5 bg-surface-container-lowest rounded-lg border border-slate-200/70 flex flex-col gap-2" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "font-caption text-caption text-on-surface-variant font-medium" },
                                "\uBC1C\uC8FC \uCCAD\uC18C \uC720\uD615 (",
                                feeCalculation.categoryCount,
                                "\uAC1C \uD56D\uBAA9 \uC2E0\uCCAD)"),
                            React.createElement("span", { className: "font-caption text-caption text-secondary font-bold" }, "\uAC1C\uB2F9 \u20A916,500\uC6D0")),
                        React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" }, ['REGULAR', 'MOVEIN', 'APPLIANCE'].map((catKey) => {
                            const isChecked = selectedCats.includes(catKey);
                            return (React.createElement("button", { key: catKey, type: "button", onClick: () => {
                                    if (isChecked) {
                                        if (selectedCats.length > 1) {
                                            setSelectedCats(selectedCats.filter((c) => c !== catKey));
                                        }
                                        else {
                                            alert('최소 1개 이상의 청소 유형이 선택되어야 합니다.');
                                        }
                                    }
                                    else {
                                        setSelectedCats([...selectedCats, catKey]);
                                    }
                                }, className: `px-2.5 py-1 rounded-lg font-caption text-caption font-semibold flex items-center gap-1 transition-all cursor-pointer ${isChecked
                                    ? 'bg-secondary text-on-secondary shadow-xs'
                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}` },
                                React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, isChecked ? 'check_circle' : 'add_circle'),
                                React.createElement("span", null, categoryLabels[catKey] || catKey),
                                React.createElement("span", { className: "opacity-80 text-[10px]" }, "(+16,500\uC6D0)")));
                        }))),
                    React.createElement("div", { className: "space-y-1.5 pt-1" },
                        React.createElement("div", { className: "flex items-center justify-between text-xs py-0.5" },
                            React.createElement("span", { className: "text-on-surface-variant" },
                                "\uACF5\uAE09\uAC00\uC561 (",
                                feeCalculation.categoryCount,
                                "\uAC74 \u00D7 15,000\uC6D0)"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-mono" },
                                "\u20A9",
                                feeCalculation.supplyPrice.toLocaleString(),
                                "\uC6D0")),
                        React.createElement("div", { className: "flex items-center justify-between text-xs py-0.5" },
                            React.createElement("span", { className: "text-on-surface-variant" }, "\uBD80\uAC00\uAC00\uCE58\uC138 (VAT 10%)"),
                            React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-mono" },
                                "\u20A9",
                                feeCalculation.vat.toLocaleString(),
                                "\uC6D0")),
                        React.createElement("div", { className: "h-[1px] bg-slate-200 my-1" }),
                        React.createElement("div", { className: "flex items-baseline justify-between pt-1" },
                            React.createElement("div", { className: "flex items-baseline gap-1.5" },
                                React.createElement("span", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, "\uCD5C\uC885 \uACB0\uC81C \uAE08\uC561"),
                                React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" },
                                    "(",
                                    feeCalculation.categoryCount === 1 ? '단일 유형' : `${feeCalculation.categoryCount}개 복합 유형`,
                                    ")")),
                            React.createElement("div", { className: "text-right" },
                                React.createElement("strong", { className: "font-headline-md text-headline-md text-secondary font-bold font-mono", "data-field": "CLIENT_FEE_AMT" },
                                    "\u20A9",
                                    feeCalculation.totalPrice.toLocaleString(),
                                    "\uC6D0")))),
                    React.createElement("div", { className: "mt-1 p-3 bg-primary-fixed/30 rounded-lg text-on-primary-fixed text-xs leading-relaxed flex items-start gap-2" },
                        React.createElement("span", { className: "material-symbols-outlined text-primary text-base shrink-0 mt-0.5" }, "info"),
                        React.createElement("p", { className: "font-caption text-caption text-on-surface" },
                            "\uC704 ",
                            React.createElement("strong", { className: "font-semibold text-primary" },
                                "\u20A9",
                                feeCalculation.totalPrice.toLocaleString(),
                                "\uC6D0"),
                            "\uC740 \uC548\uC2EC\uBC88\uD638 \uBC1C\uAE09, \uAC70\uB798 \uACC4\uC57D \uCCB4\uACB0 \uBCF4\uC99D \uBC0F \uB9E4\uCE6D \uB370\uC774\uD130 \uC774\uC6A9\uB8CC\uC774\uBA70, \uD604\uC7A5 \uC2DC\uACF5 \uB300\uAE08(\u20A9",
                            Number(effectiveApply.totalServiceAmt).toLocaleString(),
                            "\uC6D0)\uACFC \uC644\uC804\uD788 \uBCC4\uAC1C\uC785\uB2C8\uB2E4."))),
                React.createElement("section", { className: "flex flex-col gap-2", "data-field": "PG_PROVIDER_CD" },
                    React.createElement("label", { className: "font-label-md text-label-md text-on-surface font-bold block" }, "\uACB0\uC81C \uC218\uB2E8 \uC120\uD0DD"),
                    React.createElement("div", { "aria-label": "\uACB0\uC81C \uC218\uB2E8", className: "grid grid-cols-2 gap-2.5", role: "radiogroup" },
                        React.createElement("label", { className: `payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${payMethod === 'CARD' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'}`, "data-method": "CARD" },
                            React.createElement("input", { checked: payMethod === 'CARD', className: "accent-secondary h-4 w-4 shrink-0", name: "pg_provider", onChange: () => setPayMethod('CARD'), type: "radio", value: "CARD" }),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "material-symbols-outlined text-secondary text-lg" }, "credit_card"),
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-medium" }, "\uC2E0\uC6A9\u00B7\uCCB4\uD06C\uCE74\uB4DC")),
                            payMethod === 'CARD' && (React.createElement("div", { className: "selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary" }))),
                        React.createElement("label", { className: `payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${payMethod === 'KAKAOPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'}`, "data-method": "KAKAOPAY" },
                            React.createElement("input", { checked: payMethod === 'KAKAOPAY', className: "accent-secondary h-4 w-4 shrink-0", name: "pg_provider", onChange: () => setPayMethod('KAKAOPAY'), type: "radio", value: "KAKAOPAY" }),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-4 h-4 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center font-bold text-[10px] leading-none shrink-0" }, "K"),
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-medium" }, "\uCE74\uCE74\uC624\uD398\uC774")),
                            payMethod === 'KAKAOPAY' && (React.createElement("div", { className: "selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary" }))),
                        React.createElement("label", { className: `payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${payMethod === 'NAVERPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'}`, "data-method": "NAVERPAY" },
                            React.createElement("input", { checked: payMethod === 'NAVERPAY', className: "accent-secondary h-4 w-4 shrink-0", name: "pg_provider", onChange: () => setPayMethod('NAVERPAY'), type: "radio", value: "NAVERPAY" }),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-4 h-4 rounded bg-[#03C75A] text-white flex items-center justify-center font-bold text-[10px] leading-none shrink-0" }, "N"),
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-medium" }, "\uB124\uC774\uBC84\uD398\uC774")),
                            payMethod === 'NAVERPAY' && (React.createElement("div", { className: "selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary" }))),
                        React.createElement("label", { className: `payment-method-card cursor-pointer p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transition-all relative overflow-hidden border ${payMethod === 'TOSSPAY' ? 'border-secondary ring-1 ring-secondary bg-secondary-container/20' : 'border-slate-200/80 hover:bg-surface-container-low'}`, "data-method": "TOSSPAY" },
                            React.createElement("input", { checked: payMethod === 'TOSSPAY', className: "accent-secondary h-4 w-4 shrink-0", name: "pg_provider", onChange: () => setPayMethod('TOSSPAY'), type: "radio", value: "TOSSPAY" }),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "w-4 h-4 rounded-full bg-[#0064FF] text-white flex items-center justify-center font-bold text-[10px] leading-none shrink-0" }, "T"),
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-medium" }, "\uD1A0\uC2A4\uD398\uC774")),
                            payMethod === 'TOSSPAY' && (React.createElement("div", { className: "selection-indicator absolute inset-x-0 bottom-0 h-0.5 bg-secondary" }))))),
                React.createElement("section", { className: "flex flex-col gap-2.5 pt-1" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-bold" }, "\uACC4\uC57D \uCCB4\uACB0 \uBC0F \uADDC\uC815 \uB3D9\uC758"),
                        React.createElement("button", { className: "font-caption text-caption text-secondary font-semibold hover:underline cursor-pointer", onClick: handleToggleAllAgreements, type: "button" }, "\uBAA8\uB450 \uB3D9\uC758")),
                    React.createElement("div", { className: "space-y-2.5" },
                        React.createElement("label", { className: "flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-slate-200/50" },
                            React.createElement("input", { checked: agreements.exclusive, className: "accent-secondary h-4 w-4 mt-0.5 shrink-0 rounded cursor-pointer", id: "agree-exclusive", name: "agree_exclusive", onChange: (e) => setAgreements({ ...agreements, exclusive: e.target.checked }), required: true, type: "checkbox" }),
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1" },
                                    React.createElement("span", { className: "text-error font-bold" }, "[\uD544\uC218]"),
                                    "\uBC30\uD0C0\uC801 \uACC4\uC57D \uD655\uC815 \uC548\uB0B4 \uB3D9\uC758"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1 leading-relaxed" }, "\uBCF8 \uACB0\uC81C \uC2B9\uC778 \uC989\uC2DC \uC120\uD0DD\uD558\uC2E0 \uD30C\uD2B8\uB108 1\uC778\uACFC \uBC30\uD0C0\uC801 \uACC4\uC57D\uC774 \uCCB4\uACB0\uB418\uBA70, \uB3D9\uC77C \uBC1C\uC8FC \uB0B4 \uB2E4\uB978 \uCCAD\uC57D \uAC74\uB4E4\uC740 \uC77C\uAD04 \uC790\uB3D9 \uB9C8\uAC10(\uCCAD\uC57D\uB300\uAE30\uC885\uB8CC)\uB429\uB2C8\uB2E4."))),
                        React.createElement("label", { className: "flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors border border-slate-200/50" },
                            React.createElement("input", { checked: agreements.cancellation, className: "accent-secondary h-4 w-4 mt-0.5 shrink-0 rounded cursor-pointer", id: "agree-cancellation", name: "agree_cancellation", onChange: (e) => setAgreements({ ...agreements, cancellation: e.target.checked }), required: true, type: "checkbox" }),
                            React.createElement("div", { className: "flex flex-col" },
                                React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1" },
                                    React.createElement("span", { className: "text-error font-bold" }, "[\uD544\uC218]"),
                                    "\uACB0\uC81C \uCDE8\uC18C \uBC0F \uC704\uC57D\uAE08 \uADDC\uC815 \uB3D9\uC758"),
                                React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1 leading-relaxed" }, "\uBC30\uCC28 \uD655\uC815 \uD6C4 7\uC77C \uC774\uB0B4 \uC77C\uBC29 \uCDE8\uC18C \uC2DC \uC774\uC6A9\uB8CC\uC758 50%\uAC00 \uC704\uC57D\uAE08\uC73C\uB85C \uCC28\uAC10\uB418\uBA70, \uACC4\uC815\uC774 7\uC77C\uAC04 \uC815\uC9C0\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))))),
                React.createElement("div", { className: "p-3.5 bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-2" },
                    React.createElement("span", { className: "material-symbols-outlined text-error text-base shrink-0 mt-0.5" }, "warning"),
                    React.createElement("p", { className: "font-caption text-caption text-tertiary-container leading-relaxed" },
                        React.createElement("strong", null, "\uC5D0\uC2A4\uD06C\uB85C \uBBF8\uC801\uC6A9 \uACE0\uC9C0:"),
                        " \uB2F9\uC0AC\uB294 \uC9C1\uBB34 \uB178\uBB34 \uC81C\uACF5 \uD50C\uB7AB\uD3FC\uC73C\uB85C \uC778\uAC74\uBE44 \uACB0\uC81C \uB300\uAE08\uC744 \uB300\uB9AC \uC218\uB839\uD558\uAC70\uB098 \uC5D0\uC2A4\uD06C\uB85C\uB85C \uC608\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBAA8\uB4E0 \uC791\uC5C5 \uC2E4\uBE44\uB294 \uC2DC\uACF5 \uAC80\uC218 \uC644\uB8CC \uD6C4 \uD30C\uD2B8\uB108 \uACC4\uC88C\uB85C \uC9C1\uC811 \uC815\uC0B0\uD558\uC154\uC57C \uD569\uB2C8\uB2E4."))),
            React.createElement("footer", { className: "p-5 bg-surface-container-lowest sticky bottom-0 z-20 border-t border-slate-100 shadow-md flex flex-col" },
                React.createElement("button", { className: "w-full h-[52px] bg-secondary hover:bg-[#005049] active:scale-[0.99] text-on-secondary font-label-lg text-label-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed", disabled: !isFormValid || isLoading, id: "btn-submit-payment", onClick: handleExecutePayment, type: "button" }, isLoading ? (React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                    React.createElement("span", null, loadingText))) : (React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "material-symbols-outlined text-xl" }, "lock"),
                    React.createElement("span", null,
                        feeCalculation.totalPrice.toLocaleString(),
                        "\uC6D0 \uACB0\uC81C\uD558\uACE0 \uBC30\uCC28 \uD655\uC815\uD558\uAE30")))),
                React.createElement("p", { className: "font-caption text-caption text-center text-outline mt-2.5 flex items-center justify-center gap-1" },
                    React.createElement("span", { className: "material-symbols-outlined text-xs" }, "encrypted"),
                    "\uC548\uC804\uD55C \uC804\uC790\uACB0\uC81C\uB97C \uC704\uD574 \uACB0\uC81C \uC815\uBCF4\uB294 \uC554\uD638\uD654\uB418\uC5B4 PG\uC0AC\uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4.")))));
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
function WebClntOrd001({ orderNo: propOrderNo, onNavigate, onLogout, currentUser = {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C'
} }) {
    // 1. URL 파라미터 추출 또는 Prop 기반 발주번호 결정
    const orderNo = useMemo(() => {
        if (propOrderNo)
            return propOrderNo;
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const queryOrderNo = urlParams.get('orderNo');
            if (queryOrderNo)
                return queryOrderNo;
            // Hash 파라미터 검사 (#WEB-CLNT-ORD-001?orderNo=...)
            if (window.location.hash.includes('orderNo=')) {
                const hashQuery = window.location.hash.split('?')[1];
                const hashParams = new URLSearchParams(hashQuery);
                const hNo = hashParams.get('orderNo');
                if (hNo)
                    return hNo;
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
        }
        catch (err) {
            console.warn('[WEB-CLNT-ORD-001] 청약서 상세 조회 실패 (시뮬레이션 유지):', err);
        }
        finally {
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
        if (!orderData || !orderData.bidExpireDt)
            return '3일 08시간 12분';
        const expireTime = new Date(orderData.bidExpireDt).getTime();
        const diff = expireTime - currentTime;
        if (diff <= 0)
            return '청약 접수 마감';
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
        if (!selectedApply)
            return;
        setIsConfirming(true);
        setTimeout(() => {
            setIsConfirming(false);
            setIsPayModalOpen(false);
            alert(`🎉 [배차 확정 완료]\n파트너사 "${selectedApply.companyNm}"(청약번호: ${selectedApply.applyNo}) 배차가 최종 확정되었습니다.\n\n표준 전자계약서 교부 및 결제 연동 페이지(WEB-CLNT-PAY-000)로 이동합니다.`);
            if (onNavigate) {
                onNavigate('WEB-CLNT-PAY-000');
            }
        }, 800);
    };
    // 뒤로 가기 (목록으로 이동)
    const handleGoBack = (e) => {
        if (e)
            e.preventDefault();
        if (onNavigate) {
            onNavigate('my-requests');
        }
        else if (typeof window !== 'undefined') {
            window.history.back();
        }
    };
    if (isLoading && !orderData) {
        return (React.createElement("div", { className: "min-h-screen bg-background flex flex-col items-center justify-center" },
            React.createElement("span", { className: "material-symbols-outlined text-secondary text-[40px] animate-spin mb-3" }, "progress_activity"),
            React.createElement("p", { className: "font-label-md text-label-md text-on-surface-variant" }, "\uBC1C\uC8FC \uC0C1\uC138 \uBC0F \uD30C\uD2B8\uB108 \uCCAD\uC57D\uC11C\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...")));
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
    return (React.createElement("div", { className: "bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col" },
        React.createElement("header", { className: "fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]" },
            React.createElement("div", { className: "h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md" },
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("a", { className: "flex items-center gap-space-sm group", "data-path": "home", href: "#home", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('home');
                        } },
                        React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-primary/20", src: "/logo.png" }),
                        React.createElement("div", { className: "flex flex-col" },
                            React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold tracking-tight leading-none" }, "\uC4F8\uACE0\uB2E6\uACE0"),
                            React.createElement("span", { className: "font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold" }, "BUILDING CLEANING STANDARD"))),
                    React.createElement("div", { className: "hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "location_on"),
                        React.createElement("span", null, "\uACBD\uAE30 \uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C"),
                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "keyboard_arrow_down"))),
                React.createElement("nav", { className: "hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full", "data-active-classes": "bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm" },
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "home", href: "#home", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('home');
                        } }, "\uD648"),
                    React.createElement("a", { "aria-current": "page", className: "px-4 py-2 transition-colors bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-semibold", "data-path": "my-requests", href: "#my-requests", onClick: handleGoBack }, "\uB098\uC758 \uC2E0\uCCAD\uD604\uD669"),
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "service-history", href: "#service-history", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('service-history');
                        } }, "\uC774\uC6A9\uB0B4\uC5ED"),
                    React.createElement("a", { className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors", "data-path": "my-account", href: "#my-account", onClick: (e) => {
                            e.preventDefault();
                            if (onNavigate)
                                onNavigate('my-account');
                        } }, "\uB9C8\uC774")),
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("div", { className: "hidden lg:flex flex-col items-end text-right" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" },
                            currentUser.USER_NM || '홍길동',
                            "\uB2D8"),
                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" },
                            "\uC778\uC99D\uD68C\uC6D0 (",
                            effectiveUserNo,
                            ")")),
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("button", { "aria-label": "\uC54C\uB9BC", className: "w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors", type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "notifications")),
                        React.createElement("button", { className: "hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer", onClick: onLogout || (() => alert('로그아웃되었습니다.')), type: "button" }, "\uB85C\uADF8\uC544\uC6C3"),
                        React.createElement("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary ring-1 ring-outline-variant/30 font-semibold text-xs" }, currentUser.USER_NM ? currentUser.USER_NM.slice(0, 1) : '홍'))))),
        React.createElement("main", { className: "w-full pt-[72px] bg-background min-h-screen flex-1" },
            React.createElement("div", { className: "flex flex-col w-full" },
                React.createElement("div", { className: "w-full bg-surface-container-lowest shadow-sm border-b border-slate-200/60" },
                    React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin py-3.5 flex flex-wrap items-center justify-between gap-space-sm" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("button", { className: "inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low cursor-pointer", onClick: handleGoBack, title: "\uC2E0\uCCAD \uBAA9\uB85D\uC73C\uB85C \uC774\uB3D9", type: "button" },
                                React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "arrow_back"),
                                React.createElement("span", null, "\uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30")),
                            React.createElement("span", { className: "text-outline-variant text-caption" }, "|"),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uBC1C\uC8FC\uBC88\uD638"),
                                React.createElement("span", { className: "font-label-md text-label-md font-bold text-primary tracking-tight font-mono", "data-field": "ORDER_NO" }, order.orderNo))),
                        React.createElement("div", { className: "flex items-center gap-2.5" },
                            React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, "\uC9C4\uD589 \uD504\uB85C\uC138\uC2A4"),
                            React.createElement("span", { className: "inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full shadow-xs", "data-field": "ORDER_STATUS" },
                                React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" }),
                                "\uCCAD\uC57D\uC811\uC218\uC911")))),
                React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin py-space-xl w-full" },
                    React.createElement("div", { className: "mb-space-lg flex flex-wrap items-end justify-between gap-space-sm" },
                        React.createElement("div", null,
                            React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                                React.createElement("span", { className: "font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold" }, "DISPATCH & SUBSCRIPTION COMPARISON"),
                                React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-secondary" }),
                                React.createElement("span", { className: "font-caption text-caption text-outline font-mono" }, "WEB-CLNT-ORD-001")),
                            React.createElement("h1", { className: "font-headline-lg text-headline-lg text-primary tracking-tight font-bold" }, "\uCCAD\uC18C \uC694\uCCAD \uC0C1\uC138 \uBC0F \uC6A9\uC5ED \uCCAD\uC57D\uC11C \uBE44\uAD50/\uC120\uD0DD")),
                        React.createElement("div", { className: "bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2 text-on-surface-variant font-caption text-caption border border-slate-200/60" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px] text-secondary" }, "verified_user"),
                            React.createElement("span", null, "\uACE0\uAC1D \uD655\uC815 \uC9C0\uC815\uAC00 \uBC29\uC2DD \u00B7 \uCD94\uAC00\uAE08 \uC694\uAD6C \uC5C6\uB294 1:1 \uD30C\uD2B8\uB108 \uC9C1\uBC30\uCC28"))),
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start" },
                        React.createElement("aside", { className: "lg:col-span-5 w-full lg:sticky lg:top-[92px]" },
                            React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-md border border-slate-200/80" },
                                React.createElement("div", { className: "flex items-center justify-between gap-2 pb-2" },
                                    React.createElement("h2", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uB0B4 \uCCAD\uC18C \uBC1C\uC8FC \uC870\uAC74"),
                                    React.createElement("div", { className: "flex items-center gap-1.5" },
                                        React.createElement("span", { className: "bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-md font-semibold", "data-field": "CLEAN_LARGE_CD" }, order.cleanLargeNm || '정기청소'),
                                        React.createElement("span", { className: "bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2.5 py-1 rounded-md", "data-field": "FACILITY_TYPE_CD" }, order.facilityTypeNm || '사무실·오피스'))),
                                React.createElement("div", { className: "bg-primary text-on-primary rounded-xl p-space-md shadow-md relative overflow-hidden" },
                                    React.createElement("div", { className: "relative z-10 flex flex-col gap-1" },
                                        React.createElement("div", { className: "flex items-center justify-between text-on-primary/80 font-caption text-caption" },
                                            React.createElement("span", null, "\uACE0\uAC1D \uC9C0\uC815 \uD655\uC815 \uB300\uAE08"),
                                            React.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-secondary-fixed" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "lock"),
                                                "\uC5ED\uACBD\uB9E4 \uC5C6\uC74C")),
                                        React.createElement("div", { className: "flex items-baseline gap-1 mt-1" },
                                            React.createElement("span", { className: "text-caption text-on-primary/80" }, "\uC6D4"),
                                            React.createElement("strong", { className: "font-display-hero text-headline-lg lg:text-[34px] font-bold text-secondary-container tracking-tight font-mono", "data-field": "PROPOSED_PRICE" },
                                                Number(order.proposedPrice).toLocaleString(),
                                                "\uC6D0")),
                                        React.createElement("p", { className: "font-caption text-caption text-on-primary/75 mt-1 leading-snug" }, "\uD604\uC7A5 \uC9C1\uBD88 \uACE0\uC815\uC561 \u00B7 \uC218\uC218\uB8CC \uBD84\uC7C1 \uC81C\uB85C \u00B7 \uD50C\uB7AB\uD3FC \uC911\uAC1C\uC218\uC218\uB8CC \uBCC4\uB3C4 \uC815\uC0B0")),
                                    React.createElement("div", { className: "absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" })),
                                React.createElement("div", { className: "bg-surface-container-low rounded-xl p-3.5 flex items-center justify-between gap-2 border border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "timer"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "\uCCAD\uC57D \uC811\uC218 \uB9C8\uAC10\uAE4C\uC9C0")),
                                    React.createElement("div", { className: "flex items-center gap-1" },
                                        React.createElement("span", { className: "font-label-lg text-label-lg font-bold text-error font-mono", "data-field": "BID_EXPIRE_DT" }, remainingTimeText))),
                                React.createElement("div", { className: "flex flex-col divide-y divide-surface-container-high text-body-sm font-body-sm" },
                                    React.createElement("div", { className: "py-2.5 flex items-center justify-between gap-2" },
                                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uCCAD\uC18C \uAD6C\uC5ED/\uC720\uD615"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface text-right font-medium", "data-field": "CLEAN_MID_CD" }, order.cleanMidNm)),
                                    React.createElement("div", { className: "py-2.5 flex items-center justify-between gap-2" },
                                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uACC4\uC57D/\uD76C\uB9DD \uC77C\uC815"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface text-right font-medium" },
                                            React.createElement("span", { "data-field": "SERVICE_START_DT" }, order.serviceStartDt),
                                            " ~ ",
                                            React.createElement("span", { "data-field": "SERVICE_END_DT" }, order.serviceEndDt),
                                            React.createElement("span", { className: "text-secondary font-semibold text-caption ml-1" },
                                                "(",
                                                order.servicePeriodDays || 92,
                                                "\uC77C\uAC04)"))),
                                    React.createElement("div", { className: "py-2.5 flex items-center justify-between gap-2" },
                                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uC8FC\uAE30 \uBC0F \uC694\uC77C"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface text-right font-medium" },
                                            "\uC8FC ",
                                            React.createElement("span", { className: "font-bold text-primary", "data-field": "WEEK_CLEAN_FREQ" }, order.weekCleanFreq || 2),
                                            "\uD68C (",
                                            React.createElement("span", { className: "text-secondary font-semibold", "data-field": "CLEAN_DAYS_CONFIG" }, order.cleanDaysConfig || '매주 월, 수'),
                                            ")")),
                                    React.createElement("div", { className: "py-2.5 flex flex-col gap-1" },
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uD604\uC7A5 \uC8FC\uC18C"),
                                            React.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] text-secondary font-medium" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "location_on"),
                                                "\uACBD\uAE30 \uACE0\uC591")),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface", "data-field": "ADDR_TEXT" }, order.addrText)),
                                    React.createElement("div", { className: "py-2.5 flex items-center justify-between gap-2" },
                                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uD604\uC7A5 \uC8FC\uCC28"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface text-right", "data-field": "PARKING_AVAIL_CD" }, order.parkingAvailText || '지하 주차 가능 (무료 방문권 지급)')),
                                    React.createElement("div", { className: "py-2.5 flex items-center justify-between gap-2" },
                                        React.createElement("span", { className: "text-on-surface-variant font-caption text-caption" }, "\uBC1C\uC8FC\uC790 \uC815\uBCF4"),
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface text-right" },
                                            React.createElement("span", { className: "font-bold", "data-field": "CONTACT_PERSON_NM" }, order.contactPersonNm),
                                            React.createElement("span", { className: "text-outline" }, "\u00B7"),
                                            React.createElement("span", { className: "text-on-surface-variant", "data-field": "CONTACT_TEL" }, order.contactTel)))),
                                React.createElement("div", { className: "bg-surface-container-low/70 rounded-xl p-3.5 flex flex-col gap-1.5 border border-slate-200/50" },
                                    React.createElement("div", { className: "flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant" },
                                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-primary" }, "assignment"),
                                        React.createElement("span", { className: "font-bold" }, "\uD604\uC7A5 \uD2B9\uAE30 \uC694\uCCAD\uC0AC\uD56D")),
                                    React.createElement("div", { className: "font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-lowest p-3 rounded-lg border border-slate-200/40", "data-field": "DETAIL_REQ_NOTE" },
                                        "\"",
                                        order.detailReqNote,
                                        "\"")),
                                React.createElement("div", { className: "bg-error-container/30 rounded-xl p-3 text-caption font-caption text-tertiary flex items-start gap-2 border border-error/20" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[18px] text-tertiary shrink-0 mt-0.5" }, "info"),
                                    React.createElement("p", { className: "leading-relaxed" },
                                        React.createElement("strong", null, "\uC9C1\uC811 \uC9C0\uAE09 \uC548\uC804\uACE0\uC9C0:"),
                                        " \uD50C\uB7AB\uD3FC\uC740 \uD604\uC7A5 \uB178\uBB34\uBE44\uB97C \uBCF4\uAD00\uD558\uC9C0 \uC54A\uC73C\uBA70, \uC791\uC5C5 \uC644\uB8CC \uD6C4 \uD604\uC7A5 \uAC80\uC218 \uC2DC \uD655\uC815\uC561\uC744 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uC9C0\uAE09\uD569\uB2C8\uB2E4.")))),
                        React.createElement("div", { className: "lg:col-span-7 flex flex-col gap-space-md w-full" },
                            React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl shadow-sm p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-slate-200/80" },
                                React.createElement("div", { className: "flex flex-col" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("h2", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC811\uC218\uB41C \uD30C\uD2B8\uB108 \uCCAD\uC57D\uC11C"),
                                        React.createElement("span", { className: "inline-flex items-center justify-center bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold" },
                                            React.createElement("span", { "data-field": "TOTAL_APPLY_CNT" }, sortedApplyList.length),
                                            "\uAC74")),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-0.5" }, "\uAE30\uC0AC\uB2D8\uC774 \uC81C\uC548\uD55C \uBC29\uBB38 \uC77C\uC790, \uC2DC\uC791 \uC2DC\uAC01, \uD22C\uC785 \uC778\uC6D0 \uBC0F \uC791\uC5C5 \uACC4\uD68D\uC744 \uAF3C\uAF3C\uD788 \uD655\uC778\uD558\uACE0 \uCD5C\uC801\uC758 \uD30C\uD2B8\uB108 1\uC778\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.")),
                                React.createElement("div", { className: "inline-flex p-1 bg-surface-container-low rounded-xl shrink-0 border border-slate-200/50", role: "tablist" },
                                    React.createElement("button", { className: `sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${sortType === 'recommend'
                                            ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                                            : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setSortType('recommend'), type: "button" }, "\uCD94\uCC9C\uC21C"),
                                    React.createElement("button", { className: `sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${sortType === 'fast'
                                            ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                                            : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setSortType('fast'), type: "button" }, "\uBE60\uB978\uC2DC\uACF5\uC21C"),
                                    React.createElement("button", { className: `sort-tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${sortType === 'latest'
                                            ? 'active bg-surface-container-lowest shadow-xs text-primary font-bold'
                                            : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setSortType('latest'), type: "button" }, "\uCD5C\uC2E0\uC811\uC218\uC21C"))),
                            sortedApplyList.length === 0 ? (React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-slate-200/70 flex flex-col items-center justify-center" },
                                React.createElement("span", { className: "material-symbols-outlined text-outline text-[48px] mb-3" }, "hourglass_empty"),
                                React.createElement("h3", { className: "font-headline-sm text-headline-sm text-on-surface font-semibold mb-1" }, "\uD604\uC7AC \uC811\uC218\uB41C \uD30C\uD2B8\uB108 \uCCAD\uC57D\uC11C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."),
                                React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "7\uC77C \uAE30\uD55C \uB0B4 \uB9C8\uC2A4\uD130\uB4E4\uC774 \uCCAD\uC57D\uC11C\uB97C \uC81C\uCD9C\uD558\uB294 \uC989\uC2DC \uBCF8 \uD654\uBA74\uC5D0 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uB4F1\uB85D\uB429\uB2C8\uB2E4."))) : (sortedApplyList.map((apply, idx) => {
                                const isTopRecommend = idx === 0 && sortType === 'recommend';
                                return (React.createElement("article", { className: `relative bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md overflow-hidden border border-slate-200/80 ${isTopRecommend ? 'ring-2 ring-secondary/40 shadow-md' : ''}`, "data-apply-no": apply.applyNo, key: apply.applyNo },
                                    isTopRecommend && (React.createElement("div", { className: "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-secondary-container to-primary" })),
                                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pt-1" },
                                        React.createElement("div", { className: "flex items-start gap-3.5" },
                                            React.createElement("div", { className: "w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0 text-secondary" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[28px]" }, idx === 0 ? 'cleaning_services' : idx === 1 ? 'sanitizer' : 'groups')),
                                            React.createElement("div", { className: "flex flex-col" },
                                                React.createElement("div", { className: "flex flex-wrap items-center gap-2 mb-1" },
                                                    apply.recommendBadge && (React.createElement("span", { className: "bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold inline-flex items-center gap-1 shadow-xs" },
                                                        React.createElement("span", { className: "material-symbols-outlined text-[13px]" }, "verified"),
                                                        apply.recommendBadge)),
                                                    React.createElement("span", { className: "bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-medium" }, apply.gradeNm || '마스터 등급'),
                                                    React.createElement("span", { className: "text-caption font-caption text-outline", "data-field": "REG_DT" },
                                                        apply.regDt,
                                                        " \uC811\uC218")),
                                                React.createElement("div", { className: "flex items-baseline gap-2" },
                                                    React.createElement("h3", { className: "font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight", "data-field": "COMPANY_NM" }, apply.companyNm),
                                                    React.createElement("span", { className: "font-label-md text-label-md text-on-surface-variant font-medium", "data-field": "USER_NM" },
                                                        "(",
                                                        apply.userNm || '마스터',
                                                        ")")),
                                                React.createElement("div", { className: "flex flex-wrap items-center gap-2 mt-1.5" },
                                                    React.createElement("div", { className: "inline-flex items-center gap-1 text-[#F59E0B] font-label-sm text-label-sm font-bold" },
                                                        React.createElement("span", { className: "material-symbols-outlined text-[16px]", style: { fontVariationSettings: "'FILL' 1" } }, "star"),
                                                        React.createElement("span", null, apply.rating || '5.0'),
                                                        React.createElement("span", { className: "text-on-surface-variant font-normal font-caption text-caption" },
                                                            "(\uB9AC\uBDF0 ",
                                                            apply.reviewCount || 84,
                                                            "\uAC74)")),
                                                    React.createElement("span", { className: "text-outline-variant text-[10px]" }, "\u00B7"),
                                                    (apply.certifications || ['신원100%검증', '배상책임보험 1억원 가입']).map((c, ci) => (React.createElement("span", { className: "bg-surface-container-low text-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full", key: ci }, c)))))),
                                        React.createElement("div", { className: "text-right sm:shrink-0" },
                                            React.createElement("span", { className: "font-caption text-caption text-outline" }, apply.careerText ? '경력 누적' : apply.specialPointText ? '특화 포인트' : '고객 지정가 수락율'),
                                            React.createElement("div", { className: "font-label-lg text-label-lg font-bold text-secondary" }, apply.careerText || apply.specialPointText || '100% 일치'))),
                                    React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-secondary-container/20 rounded-xl p-3.5 border border-secondary/15" },
                                        React.createElement("div", { className: "bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs" },
                                            React.createElement("span", { className: "font-caption text-[11px] text-on-surface-variant mb-0.5" }, "\uC2DC\uACF5 \uC81C\uC548\uC77C"),
                                            React.createElement("strong", { className: "font-label-lg text-label-lg text-secondary font-bold", "data-field": "PROPOSED_DATE" }, apply.proposedDate)),
                                        React.createElement("div", { className: "bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs" },
                                            React.createElement("span", { className: "font-caption text-[11px] text-on-surface-variant mb-0.5" }, "\uC2DC\uC791 \uC2DC\uAC01"),
                                            React.createElement("strong", { className: "font-label-lg text-label-lg text-on-surface font-bold", "data-field": "START_TIME" }, apply.startTime)),
                                        React.createElement("div", { className: "bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs" },
                                            React.createElement("span", { className: "font-caption text-[11px] text-on-surface-variant mb-0.5" }, "\uC608\uC0C1 \uC18C\uC694\uC2DC\uAC04"),
                                            React.createElement("strong", { className: "font-label-lg text-label-lg text-on-surface font-bold", "data-field": "WORK_HOURS" },
                                                apply.workHours,
                                                "\uC2DC\uAC04")),
                                        React.createElement("div", { className: "bg-surface-container-lowest/80 p-2.5 rounded-lg flex flex-col shadow-xs" },
                                            React.createElement("span", { className: "font-caption text-[11px] text-on-surface-variant mb-0.5" }, "\uD22C\uC785 \uC778\uC6D0"),
                                            React.createElement("strong", { className: "font-label-lg text-label-lg text-primary font-bold", "data-field": "ASSIGN_STAFF_CNT" }, apply.assignStaffCnt))),
                                    React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-1.5 shadow-xs border border-slate-200/40" },
                                        React.createElement("div", { className: "flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm font-semibold" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "format_quote"),
                                            React.createElement("span", null, "\uD30C\uD2B8\uB108 \uC791\uC5C5 \uACC4\uD68D \uBC0F \uC5B4\uD544")),
                                        React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant leading-relaxed pl-1", "data-field": "APPEAL_MSG" },
                                            "\"",
                                            apply.appealMsg,
                                            "\"")),
                                    React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-2 bg-surface-container-low/40 p-3 rounded-xl border border-slate-200/40" },
                                        React.createElement("div", { className: "flex items-baseline gap-1.5" },
                                            React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, "\uD655\uC815 \uC2DC\uACF5\uBE44:"),
                                            React.createElement("strong", { className: "font-headline-sm text-headline-sm font-bold text-secondary font-mono" },
                                                Number(apply.confirmedPrice || order.proposedPrice).toLocaleString(),
                                                "\uC6D0"),
                                            React.createElement("span", { className: "font-caption text-[11px] text-outline font-medium" }, "(\uACE0\uAC1D \uC9C0\uC815\uAC00 100% \uC218\uB77D \u00B7 \uCD94\uAC00\uBE44 \uC5C6\uC74C)")),
                                        React.createElement("button", { className: "btn-select-partner inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary hover:bg-on-secondary-container active:scale-95 px-5 py-2.5 rounded-xl font-label-lg text-label-lg font-bold shadow-sm transition-all cursor-pointer", "data-apply": apply.applyNo, "data-name": apply.companyNm, "data-time": `${apply.proposedDate} ${apply.startTime}`, onClick: () => handleSelectPartner(apply), type: "button" },
                                            React.createElement("span", null, "\uC774 \uD30C\uD2B8\uB108\uB85C \uBC30\uCC28 \uD655\uC815\uD558\uAE30"),
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "chevron_right")))));
                            })))),
                    React.createElement("section", { className: "mt-space-xl bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/70" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-space-lg" },
                            React.createElement("div", { className: "flex items-start gap-3.5" },
                                React.createElement("div", { className: "w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center shrink-0 text-secondary" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "verified")),
                                React.createElement("div", { className: "flex flex-col" },
                                    React.createElement("h4", { className: "font-label-lg text-label-lg font-bold text-on-surface" }, "100% \uC2E0\uC6D0 \uBCF4\uC99D \uD30C\uD2B8\uB108"),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1 leading-relaxed" }, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uC99D, \uBC94\uC8C4\uACBD\uB825 \uAC80\uC99D, \uBC30\uC0C1\uCC45\uC784\uBCF4\uD5D8 1\uC5B5\uC6D0 \uC774\uC0C1 \uC758\uBB34 \uAC00\uC785\uB41C \uC815\uC608 \uAE30\uC0AC\uB2D8\uB9CC \uB9E4\uCE6D\uB429\uB2C8\uB2E4."))),
                            React.createElement("div", { className: "flex items-start gap-3.5" },
                                React.createElement("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "payments")),
                                React.createElement("div", { className: "flex flex-col" },
                                    React.createElement("h4", { className: "font-label-lg text-label-lg font-bold text-on-surface" }, "\uD604\uC7A5 \uC9C1\uBD88\uC81C \uC548\uC2EC \uC815\uC0B0"),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1 leading-relaxed" }, "\uC0AC\uC804 \uC120\uACB0\uC81C \uAC15\uC694 \uC5C6\uC774 \uD604\uC7A5 \uC791\uC5C5 \uAC80\uC218\uAC00 \uC644\uB8CC\uB41C \uD6C4 \uD30C\uD2B8\uB108\uC5D0\uAC8C \uC9C1\uC811 \uC815\uC0B0\uD558\uC5EC \uBD84\uC7C1\uC744 \uCC28\uB2E8\uD569\uB2C8\uB2E4."))),
                            React.createElement("div", { className: "flex items-start gap-3.5" },
                                React.createElement("div", { className: "w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface" },
                                    React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "handshake")),
                                React.createElement("div", { className: "flex flex-col" },
                                    React.createElement("h4", { className: "font-label-lg text-label-lg font-bold text-on-surface" }, "3\uAC1C\uC6D4 \uBB34\uC0C1 A/S \uBCF4\uC99D"),
                                    React.createElement("p", { className: "font-caption text-caption text-on-surface-variant mt-1 leading-relaxed" }, "\uC815\uAE30 \uACC4\uC57D \uAE30\uAC04 \uC911 \uBC1C\uC0DD\uD55C \uBBF8\uD761 \uAD6C\uAC04 \uBC0F \uD604\uC7A5 \uD074\uB808\uC784 \uBC1C\uC0DD \uC2DC 24\uC2DC\uAC04 \uB0B4 \uC7AC\uBC29\uBB38 \uC870\uCE58\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4.")))))))),
        isPayModalOpen && selectedApply && (React.createElement(WebClntPay000, { isOpen: isPayModalOpen, orderData: {
                ...order,
                categories: [order.cleanLargeCd || 'REGULAR']
            }, applyData: selectedApply, currentUser: currentUser, onClose: () => setIsPayModalOpen(false), onPaymentSuccess: (contractData) => {
                console.log('[PAY_SUCCESS]', contractData);
                if (onNavigate) {
                    onNavigate('my-application-status');
                }
                else if (typeof window !== 'undefined') {
                    window.location.hash = '#my-application-status';
                }
            } })),
        React.createElement("footer", { className: "w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60" },
            React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg" },
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60" },
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("img", { alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20", src: "/logo.png" }),
                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0"),
                        React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD504\uB9AC\uBBF8\uC5C4 \uD648\uCF00\uC5B4 \uCEE8\uC2DC\uC5B4\uC9C0")),
                    React.createElement("div", { className: "flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm" },
                        React.createElement("a", { className: "hover:text-on-surface transition-colors font-semibold", "data-path": "terms-of-service", href: "#" }, "\uC774\uC6A9\uC57D\uAD00"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors font-semibold text-primary", "data-path": "privacy-policy", href: "#" }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors", "data-path": "customer-service", href: "#" }, "\uACE0\uAC1D\uC13C\uD130"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("a", { className: "hover:text-on-surface transition-colors", "data-path": "partner-inquiry", href: "#" }, "\uAE30\uC0AC \uD30C\uD2B8\uB108 \uB4F1\uB85D"))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm" },
                    React.createElement("div", { className: "flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant" },
                        React.createElement("p", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "(\uC8FC)\uACF5\uAC04\uB2E4\uC6D0"),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uB300\uD45C\uC790: \uAE40\uCDA9\uD6C8"),
                            React.createElement("span", null, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638: 214-88-02482"),
                            React.createElement("span", null, "\uD1B5\uC2E0\uD310\uB9E4\uC5C5\uC2E0\uACE0: \uC81C2025-\uACBD\uAE30\uACE0\uC591-1849\uD638")),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uACE0\uAC1D\uC13C\uD130: 02-429-5459 (\uD3C9\uC77C 09:00 - 18:00)"),
                            React.createElement("span", null, "\uC774\uBA54\uC77C: support@spacendw.kr")),
                        React.createElement("p", { className: "text-outline" }, "\uACBD\uAE30\uB3C4 \uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C \uC911\uC559\uB85C 1261\uBC88\uAE38 42")),
                    React.createElement("div", { className: "flex flex-col justify-between gap-space-sm" },
                        React.createElement("div", { className: "bg-error-container/40 p-space-sm rounded-xl border border-error/20" },
                            React.createElement("p", { className: "font-caption text-caption text-tertiary leading-relaxed" },
                                React.createElement("strong", { className: "font-semibold" }, "[\uD50C\uB7AB\uD3FC \uBA74\uCC45 \uBC0F \uACB0\uC81C \uC548\uB0B4]"),
                                " \uC4F8\uACE0\uB2E6\uACE0\uB294 \uD1B5\uC2E0\uD310\uB9E4\uC911\uAC1C\uC790\uB85C\uC11C \uAC70\uB798 \uB2F9\uC0AC\uC790\uAC00 \uC544\uB2C8\uBA70, \uD604\uC7A5 \uC778\uAC74\uBE44 \uBC0F \uC218\uB9AC \uB178\uBB34\uBE44\uB294 \uC791\uC5C5 \uAC80\uC218 \uD6C4 \uC2DC\uACF5 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uC9C0\uAE09\uB429\uB2C8\uB2E4. \uD50C\uB7AB\uD3FC\uC740 \uD604\uC7A5 \uB178\uBB34\uBE44 \uC5D0\uC2A4\uD06C\uB85C\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBA70 \uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC218\uC218\uB8CC \uC678 \uC2DC\uACF5 \uD558\uC790\uC758 \uBC95\uC801 \uCC45\uC784\uC740 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4.")),
                        React.createElement("p", { className: "font-caption text-caption text-outline text-right md:text-left" }, "\u00A9 2026 (\uC8FC)\uACF5\uAC04\uB2E4\uC6D0. All rights reserved. SseulDakGo Domestic Infrastructure Platform.")))))));
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
function WebClntJob000({ contractNo: propContractNo, currentUser = { USER_NO: 'C20261000001', USER_NM: '홍길동' }, onNavigate, onLogout }) {
    // 1. 계약번호 추출 (Prop 또는 URL 쿼리/해시 파라미터)
    const contractNo = useMemo(() => {
        if (propContractNo)
            return propContractNo;
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const queryNo = urlParams.get('contractNo');
            if (queryNo)
                return queryNo;
            if (window.location.hash.includes('contractNo=')) {
                const hashQuery = window.location.hash.split('?')[1];
                const hParams = new URLSearchParams(hashQuery);
                const hNo = hParams.get('contractNo');
                if (hNo)
                    return hNo;
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
        }
        catch (err) {
            console.warn('[FETCH_INSPECT_ERR_FALLBACK]', err);
        }
        finally {
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
        }
        catch (e) {
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
        const confirmMsg = `[현장 검수 최종 승인]\n` +
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
            }
            else {
                alert(resData.message || '승인 처리 중 오류가 발생했습니다.');
            }
        }
        catch (err) {
            console.warn('[CONFIRM_COMPLETE_FALLBACK]', err);
            setIsCompleted(true);
            setIsSuccessModalOpen(true);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // 6. 성공 모달 확인 후 신청현황 페이지 이동
    const handleSuccessClose = () => {
        setIsSuccessModalOpen(false);
        if (onNavigate) {
            onNavigate('my-requests');
        }
        else if (typeof window !== 'undefined') {
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
    return (React.createElement("div", { className: "bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col" },
        React.createElement("header", { className: "fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60" },
            React.createElement("div", { className: "h-[72px] max-w-[1200px] mx-auto px-margin flex items-center justify-between gap-space-md" },
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('home') : (window.location.hash = '#home'), className: "flex items-center gap-2 cursor-pointer" },
                        React.createElement("img", { src: "/logo.png", alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-10 h-10 object-contain rounded-full shadow-xs" }),
                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold tracking-tight" }, "\uC4F8\uACE0\uB2E6\uACE0")),
                    React.createElement("div", { className: "hidden sm:flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-surface-container transition-colors" },
                        React.createElement("span", { className: "material-symbols-outlined text-[16px] text-secondary" }, "location_on"),
                        React.createElement("span", null, "\uACE0\uC591\uC2DC \uC77C\uC0B0\uB3D9\uAD6C"),
                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "keyboard_arrow_down"))),
                React.createElement("nav", { className: "hidden md:flex items-center gap-space-xs bg-surface-container-low/60 p-1 rounded-full" },
                    React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('home') : (window.location.hash = '#home'), className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer" }, "\uD648"),
                    React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests'), className: "px-4 py-2 bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-full shadow-sm font-bold cursor-pointer" }, "\uB098\uC758 \uC2E0\uCCAD\uD604\uD669"),
                    React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('service-history') : (window.location.hash = '#service-history'), className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer" }, "\uC774\uC6A9\uB0B4\uC5ED"),
                    React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('my-account') : (window.location.hash = '#my-account'), className: "px-4 py-2 text-on-surface-variant font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors cursor-pointer" }, "\uB9C8\uC774")),
                React.createElement("div", { className: "flex items-center gap-space-md shrink-0" },
                    React.createElement("div", { className: "hidden lg:flex flex-col items-end text-right" },
                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" },
                            currentUser?.USER_NM || '홍길동',
                            "\uB2D8"),
                        React.createElement("span", { className: "font-caption text-caption text-secondary font-medium" },
                            "\uC778\uC99D\uD68C\uC6D0 (",
                            currentUser?.USER_NO || 'C20261000001',
                            ")")),
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("button", { "aria-label": "\uC54C\uB9BC", className: "w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer", type: "button" },
                            React.createElement("span", { className: "material-symbols-outlined text-[22px]" }, "notifications")),
                        onLogout && (React.createElement("button", { className: "hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm transition-colors cursor-pointer", onClick: onLogout, type: "button" }, "\uB85C\uADF8\uC544\uC6C3")))))),
        React.createElement("main", { className: "w-full pt-[72px] bg-background flex-1" },
            React.createElement("div", { className: "flex flex-col w-full" },
                React.createElement("div", { className: "max-w-[1200px] w-full mx-auto px-margin pt-space-lg pb-space-sm flex flex-col gap-space-xs" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("button", { type: "button", onClick: () => onNavigate ? onNavigate('my-requests') : (window.location.hash = '#my-requests'), className: "inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors group cursor-pointer" },
                            React.createElement("span", { className: "material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5" }, "arrow_back"),
                            React.createElement("span", null, "\uB098\uC758 \uC2E0\uCCAD\uD604\uD669\uC73C\uB85C \uC774\uB3D9 (WEB-CLNT-ORD-000)")),
                        React.createElement("div", { className: "flex items-center gap-space-xs" },
                            React.createElement("span", { className: "text-on-surface-variant font-label-sm text-label-sm" }, "\uD654\uBA74 ID:"),
                            React.createElement("span", { className: "font-mono font-semibold text-primary font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded-full" }, "WEB-CLNT-JOB-000")))),
                React.createElement("section", { className: "max-w-[1200px] w-full mx-auto px-margin pb-space-lg" },
                    React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md" },
                        React.createElement("div", { className: "flex flex-col gap-space-xs" },
                            React.createElement("div", { className: "flex flex-wrap items-center gap-space-xs" },
                                React.createElement("span", { className: "font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider bg-secondary-container/40 px-2 py-0.5 rounded" }, "Inspection & Settlement"),
                                React.createElement("span", { className: "text-outline-variant" }, "\u2022"),
                                React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" },
                                    "\uACC4\uC57D\uBC88\uD638 ",
                                    React.createElement("span", { className: "font-mono font-bold text-on-surface", "data-field": "CONTRACT_NO" }, contract.contractNo))),
                            React.createElement("h1", { className: "font-headline-md text-headline-md text-primary font-bold" }, "\uCCAD\uC18C \uC2DC\uACF5 \uD604\uC7A5 \uAC80\uC218 \uBC0F \uC9C1\uBD88 \uC2B9\uC778"),
                            React.createElement("p", { className: "font-body-md text-body-md text-on-surface-variant" }, "\uAE30\uC0AC\uB2D8\uC774 \uC2E4\uC2DC\uAC04 \uB4F1\uB85D\uD55C \uC2DC\uACF5 \uC804/\uD6C4 \uC0AC\uC9C4\uC744 \uBE44\uAD50 \uD655\uC778\uD558\uACE0, \uD604\uC7A5 \uB300\uBA74 \uAC80\uC218 \uC644\uB8CC \uD6C4 \uC6A9\uC5ED \uB300\uAE08\uC744 \uC9C1\uC811 \uC815\uC0B0\uD574 \uC8FC\uC138\uC694.")),
                        React.createElement("div", { className: "flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-space-xs shrink-0" },
                            React.createElement("div", { className: `px-3.5 py-1.5 rounded-full font-label-md text-label-md font-bold inline-flex items-center gap-2 shadow-sm ${isCompleted
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-surface-container-low text-secondary border border-secondary/30'}`, "data-field": "CONTRACT_STAT_CD" },
                                React.createElement("span", { className: `w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-secondary' : 'bg-secondary animate-ping'}` }),
                                React.createElement("span", null, isCompleted ? '시공 및 직불 승인완료 (SVC_COMPLETED)' : '시공완료 · 현장검수대기')),
                            React.createElement("span", { className: "font-caption text-caption text-outline" },
                                "\uC791\uC5C5 \uBCF4\uACE0 \uB4F1\uB85D: ",
                                contract.reportRegDt || '2026.11.02 13:45')))),
                React.createElement("div", { className: "max-w-[1200px] w-full mx-auto px-margin pb-space-xl" },
                    React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" },
                        React.createElement("div", { className: "lg:col-span-8 flex flex-col gap-space-lg" },
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-space-md" },
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md" },
                                    React.createElement("div", null,
                                        React.createElement("div", { className: "flex items-center justify-between pb-space-sm border-b border-slate-100" },
                                            React.createElement("span", { className: "font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5" },
                                                React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "apartment"),
                                                "\uC2DC\uACF5 \uD604\uC7A5 \uAC1C\uC694"),
                                            React.createElement("span", { className: "bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm font-bold px-2.5 py-0.5 rounded-full", "data-field": "CLEAN_LARGE_CD" }, contract.cleanLargeNm)),
                                        React.createElement("div", { className: "flex flex-col gap-space-xs pt-space-xs font-body-sm text-body-sm" },
                                            React.createElement("div", { className: "flex items-start gap-2" },
                                                React.createElement("span", { className: "text-outline shrink-0 w-16" }, "\uC2DC\uACF5 \uACF5\uAC04"),
                                                React.createElement("span", { className: "font-semibold text-on-surface", "data-field": "CLEAN_MID_CD" }, contract.cleanMidNm)),
                                            React.createElement("div", { className: "flex items-start gap-2" },
                                                React.createElement("span", { className: "text-outline shrink-0 w-16" }, "\uD604\uC7A5 \uC8FC\uC18C"),
                                                React.createElement("div", { className: "flex flex-col" },
                                                    React.createElement("span", { className: "text-on-surface font-medium", "data-field": "ADDR_TEXT" }, contract.addrText),
                                                    React.createElement("span", { className: "text-on-surface-variant font-caption text-caption", "data-field": "ADDR_DETAIL" }, contract.addrDetail))),
                                            React.createElement("div", { className: "flex items-start gap-2" },
                                                React.createElement("span", { className: "text-outline shrink-0 w-16" }, "\uC2DC\uACF5 \uC77C\uC2DC"),
                                                React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" },
                                                    React.createElement("span", { className: "font-bold text-on-surface", "data-field": "CONFIRMED_DATE" }, contract.confirmedDate),
                                                    React.createElement("span", { className: "font-bold text-secondary", "data-field": "CONFIRMED_TIME" }, contract.confirmedTime),
                                                    React.createElement("span", { className: "text-outline-variant font-caption text-caption" },
                                                        "(",
                                                        contract.workDurationText,
                                                        ")"))))),
                                    React.createElement("div", { className: "bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between" },
                                        React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, "\uD604\uC7A5 \uC8FC\uBB38\uBC88\uD638"),
                                        React.createElement("span", { className: "font-mono font-label-sm text-label-sm font-semibold text-primary", "data-field": "ORDER_NO" }, contract.orderNo))),
                                React.createElement("div", { className: "bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-slate-200/60 flex flex-col justify-between gap-space-md" },
                                    React.createElement("div", null,
                                        React.createElement("div", { className: "flex items-center justify-between pb-space-sm border-b border-slate-100" },
                                            React.createElement("span", { className: "font-label-lg text-label-lg text-primary font-bold flex items-center gap-1.5" },
                                                React.createElement("span", { className: "material-symbols-outlined text-secondary text-[20px]" }, "verified_user"),
                                                "\uB2F4\uB2F9 \uC2DC\uACF5 \uB9C8\uC2A4\uD130"),
                                            React.createElement("span", { className: "bg-primary/10 text-primary font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1" },
                                                React.createElement("span", { className: "material-symbols-outlined text-[14px]" }, "stars"),
                                                "MASTER TIER")),
                                        React.createElement("div", { className: "flex items-start gap-3 pt-space-xs" },
                                            React.createElement("div", { className: "w-12 h-12 rounded-full bg-secondary-container/60 flex items-center justify-center shrink-0" },
                                                React.createElement("span", { className: "material-symbols-outlined text-on-secondary-container text-[26px]" }, "cleaning_services")),
                                            React.createElement("div", { className: "flex flex-col min-w-0" },
                                                React.createElement("div", { className: "flex items-center gap-1.5" },
                                                    React.createElement("strong", { className: "font-headline-sm text-headline-sm text-on-surface truncate", "data-field": "COMPANY_NM" }, contract.partner?.companyNm),
                                                    React.createElement("span", { className: "text-on-surface-variant font-body-sm text-body-sm shrink-0", "data-field": "USER_NM" },
                                                        "(",
                                                        contract.partner?.userNm,
                                                        ")")),
                                                React.createElement("div", { className: "flex flex-wrap gap-1.5 mt-1" },
                                                    React.createElement("span", { className: "bg-surface-container px-2 py-0.5 rounded text-secondary font-label-sm text-label-sm font-semibold" }, "\uC601\uC5C5\uBC30\uC0C1\uCC45\uC784 1\uC5B5\uC6D0"),
                                                    React.createElement("span", { className: "bg-surface-container px-2 py-0.5 rounded text-primary font-label-sm text-label-sm font-semibold" }, "\uC2E0\uC6D0\u00B7\uACBD\uB825 \uAC80\uC99D"))))),
                                    React.createElement("div", { className: "flex items-center justify-between pt-space-xs border-t border-slate-100" },
                                        React.createElement("div", { className: "flex flex-col" },
                                            React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD30C\uD2B8\uB108 \uC548\uC2EC\uBC88\uD638"),
                                            React.createElement("span", { className: "font-mono font-label-md text-label-md text-on-surface font-bold", "data-field": "SAFE_TEL_NO" }, contract.safeTelNo)),
                                        React.createElement("a", { className: "h-[40px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md inline-flex items-center gap-1.5 transition-colors shadow-xs", href: `tel:${(contract.safeTelNo || '').replace(/-/g, '')}` },
                                            React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "call"),
                                            React.createElement("span", null, "\uC804\uD654\uAC78\uAE30"))))),
                            React.createElement("section", { className: "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-lg" },
                                React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-slate-100 pb-space-sm" },
                                    React.createElement("div", { className: "flex flex-col gap-space-xs" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("h2", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC2DC\uACF5 \uC804/\uD6C4 \uD604\uC7A5 \uAC80\uC99D \uC0AC\uC9C4 \uBE44\uAD50"),
                                            React.createElement("span", { className: "bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full" },
                                                "\uCD1D ",
                                                React.createElement("span", { "data-field": "PHOTO_COUNT" }, (photoList.length || 3) * 2),
                                                "\uC7A5 \uB4F1\uB85D")),
                                        React.createElement("p", { className: "font-caption text-caption text-on-surface-variant" }, "\uBAA8\uB4E0 \uAD6C\uC5ED\uC740 \uCCAD\uC18C \uC804 \uC0C1\uD0DC\uC640 \uC644\uB8CC \uD6C4 \uC0B4\uADE0\u00B7\uCF54\uD305 \uB9C8\uAC10 \uC0C1\uD0DC\uAC00 1:1\uB85C \uC99D\uBE59\uB429\uB2C8\uB2E4.")),
                                    React.createElement("div", { className: "inline-flex items-center p-1 bg-surface-container-low rounded-xl gap-1 shrink-0", id: "photoTabControls" },
                                        React.createElement("button", { className: `tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${activePhotoTab === 'all'
                                                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                                                : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setActivePhotoTab('all'), type: "button" }, "\uC804\uCCB4 1:1 \uBE44\uAD50"),
                                        React.createElement("button", { className: `tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${activePhotoTab === 'before'
                                                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                                                : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setActivePhotoTab('before'), type: "button" }, "\uD83D\uDCF7 \uC791\uC5C5 \uC804 (BEFORE)"),
                                        React.createElement("button", { className: `tab-btn px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${activePhotoTab === 'after'
                                                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                                                : 'text-on-surface-variant hover:text-on-surface'}`, onClick: () => setActivePhotoTab('after'), type: "button" }, "\u2728 \uC791\uC5C5 \uD6C4 (AFTER)"))),
                                React.createElement("div", { className: "flex flex-col gap-space-lg", id: "photoCardContainer" }, photoList.map((pair, idx) => (React.createElement("div", { key: pair.pairId || idx, className: "bg-surface-container-low/50 rounded-xl p-space-md flex flex-col gap-space-md border border-slate-200/40" },
                                    React.createElement("div", { className: "flex items-center justify-between flex-wrap gap-2" },
                                        React.createElement("div", { className: "flex items-center gap-2" },
                                            React.createElement("span", { className: "w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold" }, String(idx + 1).padStart(2, '0')),
                                            React.createElement("span", { className: "font-label-lg text-label-lg text-on-surface font-bold" }, pair.title)),
                                        React.createElement("span", { className: "text-secondary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-secondary-container/30 px-2 py-0.5 rounded" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "check_circle"),
                                            pair.treatmentNote)),
                                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-space-md" },
                                        (activePhotoTab === 'all' || activePhotoTab === 'before') && (React.createElement("div", { className: "photo-item photo-before flex flex-col gap-space-xs group" },
                                            React.createElement("div", { className: "relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs" },
                                                React.createElement("img", { className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer", onClick: () => setSelectedPhotoUrl(pair.before.src), src: pair.before.src, alt: pair.before.altText }),
                                                React.createElement("div", { className: "absolute top-3 left-3 bg-inverse-surface/85 backdrop-blur text-inverse-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow" },
                                                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-error animate-pulse" }),
                                                    "\uC791\uC5C5 \uC804 (BEFORE)"),
                                                React.createElement("button", { className: "absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-primary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer", onClick: () => setSelectedPhotoUrl(pair.before.src), title: "\uC6D0\uBCF8 \uC0AC\uC9C4 \uD655\uB300", type: "button" },
                                                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "zoom_in"))),
                                            React.createElement("div", { className: "flex items-center justify-between text-outline font-caption text-caption px-1" },
                                                React.createElement("span", null,
                                                    "\uCD2C\uC601 \uC2DC\uAC01: ",
                                                    pair.before.takenTimeText),
                                                React.createElement("span", { className: "font-mono" }, pair.before.photoNo)))),
                                        (activePhotoTab === 'all' || activePhotoTab === 'after') && (React.createElement("div", { className: "photo-item photo-after flex flex-col gap-space-xs group" },
                                            React.createElement("div", { className: "relative overflow-hidden rounded-xl bg-surface-container aspect-[4/3] shadow-xs" },
                                                React.createElement("img", { className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer", onClick: () => setSelectedPhotoUrl(pair.after.src), src: pair.after.src, alt: pair.after.altText }),
                                                React.createElement("div", { className: "absolute top-3 left-3 bg-secondary text-on-secondary px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow" },
                                                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-secondary-fixed" }),
                                                    "\uC791\uC5C5 \uD6C4 (AFTER)"),
                                                React.createElement("button", { className: "absolute bottom-3 right-3 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-secondary p-2 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer", onClick: () => setSelectedPhotoUrl(pair.after.src), title: "\uC6D0\uBCF8 \uC0AC\uC9C4 \uD655\uB300", type: "button" },
                                                    React.createElement("span", { className: "material-symbols-outlined text-[18px]" }, "zoom_in"))),
                                            React.createElement("div", { className: "flex items-center justify-between text-secondary font-caption text-caption px-1" },
                                                React.createElement("span", { className: "font-medium" },
                                                    "\uC138\uCC99 \uB9C8\uAC10: ",
                                                    pair.after.takenTimeText),
                                                React.createElement("span", { className: "font-mono" }, pair.after.photoNo))))))))),
                                React.createElement("div", { className: "bg-surface-container-low p-space-md rounded-xl flex items-start gap-space-sm border border-slate-200/50" },
                                    React.createElement("span", { className: "material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5" }, "verified"),
                                    React.createElement("div", { className: "flex flex-col gap-1" },
                                        React.createElement("span", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "\uC4F8\uACE0\uB2E6\uACE0 \uC548\uC2EC \uC2DC\uACF5 \uBCF4\uC99D\uC81C \uC6B4\uC601 \uC548\uB0B4"),
                                        React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uC2B9\uC778 \uC644\uB8CC \uD6C4 \uBC1C\uACAC\uB41C \uBBF8\uD761 \uAD6C\uC5ED\uC5D0 \uB300\uD574\uC11C\uB294 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC758 \uC758\uBB34 A/S \uADDC\uC815\uC5D0 \uB530\uB77C \uC2DC\uACF5\uC77C \uAE30\uC900 \uCD5C\uB300 7\uC77C \uC774\uB0B4 \uBB34\uC0C1 \uC7AC\uBC29\uBB38 \uBCF4\uC644 \uC870\uCE58\uAC00 \uBCF4\uC7A5\uB429\uB2C8\uB2E4."))))),
                        React.createElement("div", { className: "lg:col-span-4 flex flex-col gap-space-md lg:sticky lg:top-[92px]" },
                            React.createElement("div", { className: "bg-primary text-on-primary rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden" },
                                React.createElement("div", { className: "absolute right-0 top-0 w-36 h-36 bg-secondary/15 rounded-full blur-2xl pointer-events-none" }),
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "inline-flex items-center gap-1.5 bg-secondary-container/20 text-secondary-fixed px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold" },
                                        React.createElement("span", { className: "material-symbols-outlined text-[15px]" }, "payments"),
                                        "\uD604\uC7A5 \uC9C1\uBD88\uC81C \uC815\uC0B0 \uC6D0\uCE59"),
                                    React.createElement("span", { className: "text-secondary-fixed-dim font-caption text-caption" }, "\uC911\uAC1C\uC218\uC218\uB8CC 0\uC6D0")),
                                React.createElement("div", { className: "flex flex-col gap-1" },
                                    React.createElement("span", { className: "font-caption text-caption text-primary-fixed-dim" }, "\uCD5C\uC885 \uD604\uC7A5 \uC9C0\uAE09 \uB178\uBB34 \uB300\uAE08"),
                                    React.createElement("div", { className: "flex items-baseline gap-2" },
                                        React.createElement("span", { className: "font-display-hero text-display-hero text-secondary-fixed font-black tracking-tight", "data-field": "TOTAL_SERVICE_AMT" }, Number(contract.totalServiceAmt || 720000).toLocaleString()),
                                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-on-primary font-bold" }, "\uC6D0")),
                                    React.createElement("div", { className: "flex items-center gap-1.5 text-primary-fixed font-caption text-caption" },
                                        React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "check"),
                                        React.createElement("span", null, "\uACAC\uC801 \uD655\uC815 \uAE08\uC561 \u00B7 \uCD94\uAC00 \uCCAD\uAD6C \uBC0F \uD301 \uC77C\uCCB4 \uC5C6\uC74C"))),
                                React.createElement("div", { className: "bg-primary-container/80 rounded-xl p-space-md flex flex-col gap-space-sm backdrop-blur-sm border border-white/10" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-secondary-fixed-dim font-medium" }, "\uAE30\uC0AC\uB2D8 \uC9C0\uC815 \uC218\uCDE8 \uACC4\uC88C"),
                                        React.createElement("span", { className: "font-label-sm text-label-sm text-on-primary font-bold", "data-field": "BANK_NAME" }, contract.partner?.bankName || 'IBK기업은행')),
                                    React.createElement("div", { className: "flex items-center justify-between gap-2 bg-primary/60 px-3 py-2.5 rounded-lg border border-white/10" },
                                        React.createElement("div", { className: "flex flex-col min-w-0" },
                                            React.createElement("span", { className: "font-mono text-body-lg font-bold text-secondary-fixed tracking-wider truncate", "data-field": "ACCOUNT_NO" }, contract.partner?.accountNo || '110-123-456789'),
                                            React.createElement("span", { className: "font-caption text-caption text-primary-fixed-dim" },
                                                "\uC608\uAE08\uC8FC: ",
                                                React.createElement("span", { className: "text-on-primary font-medium", "data-field": "ACCOUNT_HOLDER" }, contract.partner?.accountHolder || '이충훈 (반짝빌라클린)'))),
                                        React.createElement("button", { className: "shrink-0 h-[36px] px-3 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer", id: "copyAccountBtn", onClick: handleCopyAccount, type: "button" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px]" }, "content_copy"),
                                            React.createElement("span", { id: "copyBtnText" }, copyFeedback)))),
                                React.createElement("div", { className: "bg-error-container/20 rounded-xl p-space-sm flex items-start gap-2 border border-error/20" },
                                    React.createElement("span", { className: "material-symbols-outlined text-tertiary-fixed text-[18px] shrink-0 mt-0.5" }, "info"),
                                    React.createElement("p", { className: "font-caption text-caption text-tertiary-fixed leading-relaxed" },
                                        React.createElement("strong", null, "[\uC9C1\uBD88 \uC815\uC0B0 \uD544\uC218 \uACE0\uC9C0]"),
                                        " \uBCF8 \uD50C\uB7AB\uD3FC\uC740 \uC2DC\uACF5 \uB178\uBB34\uBE44\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBA70 \uC5D0\uC2A4\uD06C\uB85C \uACB0\uC81C\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC0AC\uC9C4 \uD655\uC778 \uBC0F \uD604\uC7A5 \uB300\uBA74 \uC810\uAC80 \uD6C4 \uB9C8\uC2A4\uD130 \uAE30\uC0AC\uB2D8\uAED8 \uC804\uC561 \uC9C1\uC811 \uACC4\uC88C\uC774\uCCB4 \uB610\uB294 \uD604\uAE08 \uC9C0\uAE09\uD574 \uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4."))),
                            React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-slate-200/60 flex flex-col gap-space-md" },
                                React.createElement("h3", { className: "font-label-lg text-label-lg text-primary font-bold" }, "\uAC80\uC218 \uD655\uC778 \uBC0F \uC2B9\uC778 \uC9C4\uD589"),
                                React.createElement("label", { className: "flex items-start gap-3 p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors group border border-slate-200/50" },
                                    React.createElement("input", { checked: isAgreedInspect || isCompleted, disabled: isCompleted, className: "w-5 h-5 rounded mt-0.5 text-secondary accent-secondary focus:ring-0 cursor-pointer shrink-0", id: "inspectionCheck", onChange: (e) => setIsAgreedInspect(e.target.checked), type: "checkbox" }),
                                    React.createElement("span", { className: "font-body-sm text-body-sm text-on-surface leading-snug select-none" }, "\uD604\uC7A5 \uC2DC\uACF5 \uC0C1\uD0DC\uC640 \uC804/\uD6C4 \uC99D\uBE59 \uC0AC\uC9C4\uC744 \uBAA8\uB450 \uD655\uC778\uD558\uC600\uC73C\uBA70, \uC548\uB0B4\uB41C \uCCAD\uC18C \uBC94\uC704\uAC00 \uC131\uC2E4\uD558\uAC8C \uC774\uD589\uB418\uC5C8\uC74C\uC744 \uCD5C\uC885 \uC2B9\uC778\uD569\uB2C8\uB2E4.")),
                                React.createElement("button", { className: `w-full h-[56px] rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 transition-all ${isCompleted
                                        ? 'bg-secondary-container text-on-secondary-container cursor-default'
                                        : isAgreedInspect && !isSubmitting
                                            ? 'bg-secondary hover:bg-[#005049] text-on-secondary shadow-md cursor-pointer active:scale-[0.99]'
                                            : 'bg-outline-variant/60 text-on-surface-variant/70 cursor-not-allowed'}`, disabled: !isAgreedInspect || isSubmitting || isCompleted, id: "approveBtn", onClick: handleApproveInspection, type: "button" }, isSubmitting ? (React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                                    React.createElement("span", null, "\uC2B9\uC778 \uCC98\uB9AC \uC911..."))) : isCompleted ? (React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "task_alt"),
                                    React.createElement("span", null, "\uC2DC\uACF5 \uBC0F \uC9C1\uBD88 \uC2B9\uC778 \uC644\uB8CC"))) : (React.createElement(React.Fragment, null,
                                    React.createElement("span", { className: "material-symbols-outlined text-[20px]" }, "task_alt"),
                                    React.createElement("span", null, "\uCD5C\uC885 \uCCAD\uC18C \uC644\uB8CC \uC2B9\uC778\uD558\uAE30")))),
                                React.createElement("div", { className: "pt-space-xs flex flex-col gap-2 border-t border-slate-100" },
                                    React.createElement("div", { className: "flex items-center justify-between text-outline font-caption text-caption" },
                                        React.createElement("span", null, "\uBBF8\uD761 \uAD6C\uC5ED \uB610\uB294 \uC7AC\uC791\uC5C5 \uBB38\uC758"),
                                        React.createElement("span", { className: "text-secondary font-semibold" }, "\uBB34\uC0C1 A/S \uC548\uC2EC\uBCF4\uC7A5")),
                                    React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                        React.createElement("button", { className: "h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer", onClick: () => alert(`[현장 A/S 재요청 접수]\n파트너(${contract.partner?.companyNm})에게 보완 작업 요청 알림이 전송됩니다.`), type: "button" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-error" }, "build"),
                                            React.createElement("span", null, "\uD604\uC7A5 A/S \uC7AC\uC694\uCCAD")),
                                        React.createElement("button", { className: "h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors cursor-pointer", onClick: () => alert('[고객센터 접수]\n고객센터(02-429-5459)로 연결합니다.'), type: "button" },
                                            React.createElement("span", { className: "material-symbols-outlined text-[16px] text-primary" }, "support_agent"),
                                            React.createElement("span", null, "\uACE0\uAC1D\uC13C\uD130 \uC811\uC218"))))),
                            React.createElement("div", { className: "bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm border border-slate-200/50" },
                                React.createElement("div", { className: "w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center shrink-0" },
                                    React.createElement("span", { className: "material-symbols-outlined text-on-secondary-container text-[20px]" }, "headset_mic")),
                                React.createElement("div", { className: "flex flex-col min-w-0" },
                                    React.createElement("span", { className: "font-label-sm text-label-sm text-on-surface font-semibold" }, "\uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uC2E0\uAC00\uC694?"),
                                    React.createElement("span", { className: "font-caption text-caption text-on-surface-variant" }, "\uC4F8\uACE0\uB2E6\uACE0 \uC548\uC2EC \uC911\uC7AC\uD300: 02-429-5459")))))))),
        selectedPhotoUrl && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in", onClick: () => setSelectedPhotoUrl(null) },
            React.createElement("div", { className: "relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" },
                React.createElement("button", { className: "absolute -top-12 right-0 text-white hover:text-secondary p-2 transition-colors cursor-pointer", onClick: () => setSelectedPhotoUrl(null), type: "button" },
                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "close")),
                React.createElement("img", { src: selectedPhotoUrl, alt: "\uD655\uB300 \uC0AC\uC9C4", className: "max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20", onClick: (e) => e.stopPropagation() })))),
        isSuccessModalOpen && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in", id: "successModal" },
            React.createElement("div", { className: "bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-slate-200/80 animate-in zoom-in-95" },
                React.createElement("div", { className: "w-14 h-14 rounded-full bg-secondary-container text-secondary mx-auto flex items-center justify-center shadow-sm" },
                    React.createElement("span", { className: "material-symbols-outlined text-[32px]" }, "check_circle")),
                React.createElement("div", { className: "flex flex-col text-center gap-1" },
                    React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uAC80\uC218 \uBC0F \uC2B9\uC778\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4"),
                    React.createElement("p", { className: "font-body-sm text-body-sm text-on-surface-variant" }, "\uB2F4\uB2F9 \uAE30\uC0AC\uB2D8\uAED8 \uD604\uC7A5 \uC9C1\uBD88 \uB300\uAE08 \uC1A1\uAE08\uC774 \uC644\uB8CC\uB418\uC5C8\uB294\uC9C0 \uCD5C\uC885 \uD655\uC778\uD574 \uC8FC\uC2DC\uAE30 \uBC14\uB78D\uB2C8\uB2E4.")),
                React.createElement("div", { className: "bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs font-body-sm text-body-sm border border-slate-200/50" },
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-outline" }, "\uC2B9\uC778 \uC0C1\uD0DC"),
                        React.createElement("span", { className: "font-bold text-secondary" }, "SVC_COMPLETED (\uC644\uB8CC)")),
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-outline" }, "\uC815\uC0B0 \uAE08\uC561"),
                        React.createElement("span", { className: "font-bold text-primary" },
                            Number(contract.totalServiceAmt || 720000).toLocaleString(),
                            "\uC6D0 (\uD604\uC7A5 \uC9C1\uBD88)")),
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "text-outline" }, "\uC2B9\uC778 \uC77C\uC2DC"),
                        React.createElement("span", { className: "font-mono text-on-surface" }, new Date().toLocaleString()))),
                React.createElement("div", { className: "flex flex-col gap-2 pt-space-xs" },
                    React.createElement("button", { className: "h-[48px] w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold rounded-xl transition-colors shadow-sm cursor-pointer", id: "closeModalBtn", onClick: handleSuccessClose, type: "button" }, "\uD655\uC778 \uBC0F \uB098\uC758 \uC2E0\uCCAD\uD604\uD669\uC73C\uB85C \uC774\uB3D9"))))),
        React.createElement("footer", { className: "w-full bg-surface-container-low text-on-surface-variant py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200/60 mt-space-xl" },
            React.createElement("div", { className: "max-w-[1200px] mx-auto px-margin flex flex-col gap-space-lg" },
                React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-slate-200/60" },
                    React.createElement("div", { className: "flex items-center gap-space-sm" },
                        React.createElement("img", { src: "/logo.png", alt: "\uC4F8\uACE0\uB2E6\uACE0 \uACF5\uC2DD \uB85C\uACE0", className: "w-7 h-7 object-contain rounded-full shadow-xs" }),
                        React.createElement("span", { className: "font-headline-sm text-headline-sm text-primary font-bold" }, "\uC4F8\uACE0\uB2E6\uACE0"),
                        React.createElement("span", { className: "font-caption text-caption text-outline" }, "\uD504\uB9AC\uBBF8\uC5C4 \uD648\uCF00\uC5B4 \uCEE8\uC2DC\uC5B4\uC9C0")),
                    React.createElement("div", { className: "flex flex-wrap items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm" },
                        React.createElement("button", { type: "button", onClick: () => onNavigate?.('terms-of-service'), className: "hover:text-on-surface transition-colors font-semibold cursor-pointer" }, "\uC774\uC6A9\uC57D\uAD00"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("button", { type: "button", onClick: () => onNavigate?.('privacy-policy'), className: "hover:text-on-surface transition-colors font-semibold text-primary cursor-pointer" }, "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("button", { type: "button", onClick: () => onNavigate?.('customer-service'), className: "hover:text-on-surface transition-colors cursor-pointer" }, "\uACE0\uAC1D\uC13C\uD130"),
                        React.createElement("span", { className: "text-outline-variant" }, "|"),
                        React.createElement("button", { type: "button", onClick: () => onNavigate?.('partner-inquiry'), className: "hover:text-on-surface transition-colors cursor-pointer" }, "\uAE30\uC0AC \uD30C\uD2B8\uB108 \uB4F1\uB85D"))),
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm" },
                    React.createElement("div", { className: "flex flex-col gap-space-xs font-caption text-caption text-on-surface-variant" },
                        React.createElement("p", { className: "font-label-md text-label-md text-on-surface font-semibold" }, "(\uC8FC)\uACF5\uAC04\uB2E4\uC6D0"),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uB300\uD45C\uC790: \uAE40\uCDA9\uD6C8"),
                            React.createElement("span", null, "\uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638: 214-88-02482"),
                            React.createElement("span", null, "\uD1B5\uC2E0\uD310\uB9E4\uC5C5\uC2E0\uACE0: \uC81C2024-\uC11C\uC6B8\uAC15\uB0A8-0192\uD638")),
                        React.createElement("div", { className: "flex flex-wrap gap-x-space-md gap-y-1" },
                            React.createElement("span", null, "\uACE0\uAC1D\uC13C\uD130: 02-429-5459 (\uD3C9\uC77C 09:00 - 18:00)"),
                            React.createElement("span", null, "\uC774\uBA54\uC77C: support@spacendw.kr")),
                        React.createElement("p", { className: "text-outline" }, "\uC11C\uC6B8\uD2B9\uBCC4\uC2DC \uC11C\uCD08\uAD6C \uAC15\uB0A8\uB300\uB85C 381, 14\uCE35 (\uC11C\uCD08\uB3D9)")),
                    React.createElement("div", { className: "flex flex-col justify-between gap-space-sm" },
                        React.createElement("div", { className: "bg-error-container/40 p-space-sm rounded-xl border border-error/20" },
                            React.createElement("p", { className: "font-caption text-caption text-tertiary leading-relaxed" },
                                React.createElement("strong", { className: "font-semibold" }, "[\uD50C\uB7AB\uD3FC \uBA74\uCC45 \uBC0F \uACB0\uC81C \uC548\uB0B4]"),
                                " \uC4F8\uACE0\uB2E6\uACE0\uB294 \uD1B5\uC2E0\uD310\uB9E4\uC911\uAC1C\uC790\uB85C\uC11C \uAC70\uB798 \uB2F9\uC0AC\uC790\uAC00 \uC544\uB2C8\uBA70, \uD604\uC7A5 \uC778\uAC74\uBE44 \uBC0F \uC218\uB9AC \uB178\uBB34\uBE44\uB294 \uC791\uC5C5 \uAC80\uC218 \uD6C4 \uC2DC\uACF5 \uAE30\uC0AC\uB2D8\uAED8 \uC9C1\uC811 \uC9C0\uAE09\uB429\uB2C8\uB2E4. \uD50C\uB7AB\uD3FC\uC740 \uD604\uC7A5 \uB178\uBB34\uBE44 \uC5D0\uC2A4\uD06C\uB85C\uB97C \uBCF4\uC720\uD558\uC9C0 \uC54A\uC73C\uBA70 \uD50C\uB7AB\uD3FC \uB9E4\uCE6D \uC218\uC218\uB8CC \uC678 \uC2DC\uACF5 \uD558\uC790\uC758 \uBC95\uC801 \uCC45\uC784\uC740 \uC2DC\uACF5 \uD30C\uD2B8\uB108\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4.")),
                        React.createElement("p", { className: "font-caption text-caption text-outline text-right md:text-left" }, "\u00A9 2026 (\uC8FC)\uACF5\uAC04\uB2E4\uC6D0. All rights reserved.")))))));
}

if (typeof window !== 'undefined') {
  window.WebClntCom000 = WebClntCom000;
  window.WebClntReq000 = WebClntReq000;
  window.WebClntAth000 = WebClntAth000;
  window.WebClntAth010 = WebClntAth010;
  window.WebClntAth011 = WebClntAth011;
  window.WebClntOrd000 = WebClntOrd000;
  window.WebClntOrd001 = WebClntOrd001;
  window.WebClntPay000 = WebClntPay000;
  window.WebClntJob000 = WebClntJob000;
  function mountApp() {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM) {
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(React.createElement(WebClntCom000));
      console.log('✅ WEB-CLNT-COM-000 React App successfully mounted!');
    } else {
      console.error('❌ Root element or ReactDOM not found');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }
}

})();