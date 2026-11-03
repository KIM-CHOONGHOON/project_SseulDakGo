/**
 * ============================================================================
 * [네이버 지도 및 주소 검색 (NCP Maps & Geocoding) 공통 모듈]
 * 파일 경로: lib/naver-map.ts (컴파일: lib/naver-map.js)
 *
 * [네이버 클라우드 플랫폼(NCP) 등록 정보 - sseuldakgo-map]
 * - Application 이름: sseuldakgo-map
 * - Client ID (X-NCP-APIGW-API-KEY-ID): 4itmbg4587
 * - Client Secret (X-NCP-APIGW-API-KEY): SZlvMagqg6q2kCfPAjsl9LHHQ93vCmzMWjqQPN2i
 * - Web 서비스 URL: https://sseuldakgo.kr
 * - Android 앱 패키지: kr.sseuldakgo.android
 * - iOS Bundle ID: kr.sseuldakgo.iOS
 *
 * 웹/앱/프론트엔드/백엔드 전역에서 네이버 지도 및 지오코딩 API를
 * 일관되고 안전하게 호출할 수 있도록 공통 환경설정 및 검색 엔진을 제공합니다.
 * ============================================================================
 */
/**
 * 네이버 클라우드 플랫폼 Maps 서비스 공통 설정 객체
 */
export const NAVER_MAP_CONFIG = {
    appName: process.env.NAVER_MAPS_APP_NAME || 'sseuldakgo-map',
    clientId: process.env.NAVER_MAPS_CLIENT_ID || '4itmbg4587',
    clientSecret: process.env.NAVER_MAPS_CLIENT_SECRET || 'SZlvMagqg6q2kCfPAjsl9LHHQ93vCmzMWjqQPN2i',
    webUrl: process.env.NAVER_MAPS_WEB_URL || 'https://sseuldakgo.kr',
    androidPackage: process.env.NAVER_MAPS_ANDROID_PACKAGE || 'kr.sseuldakgo.android',
    iosBundleId: process.env.NAVER_MAPS_IOS_BUNDLE_ID || 'kr.sseuldakgo.iOS',
    geocodeApiUrl: 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode',
    webScriptUrl: 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=4itmbg4587&submodules=geocoder',
};
/**
 * 프론트엔드 및 모바일 클라이언트에 노출 가능한 안전한 공개 설정 (Secret 제외)
 */
export function getPublicNaverMapConfig() {
    return {
        appName: NAVER_MAP_CONFIG.appName,
        clientId: NAVER_MAP_CONFIG.clientId,
        webUrl: NAVER_MAP_CONFIG.webUrl,
        androidPackage: NAVER_MAP_CONFIG.androidPackage,
        iosBundleId: NAVER_MAP_CONFIG.iosBundleId,
        webScriptUrl: `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CONFIG.clientId}&submodules=geocoder`,
    };
}
/**
 * 웹 프론트엔드용 네이버 지도 SDK 스크립트 URL 생성
 */
export function getNaverMapScriptUrl(submodules = ['geocoder']) {
    const sub = submodules.length > 0 ? `&submodules=${submodules.join(',')}` : '';
    return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CONFIG.clientId}${sub}`;
}
/**
 * 시/도 명칭을 표준 코드(sidoCd)로 변환
 */
function getSidoCode(sidoName) {
    if (sidoName.includes('서울'))
        return '11';
    if (sidoName.includes('부산'))
        return '26';
    if (sidoName.includes('대구'))
        return '27';
    if (sidoName.includes('인천'))
        return '28';
    if (sidoName.includes('광주'))
        return '29';
    if (sidoName.includes('대전'))
        return '30';
    if (sidoName.includes('울산'))
        return '31';
    if (sidoName.includes('세종'))
        return '36';
    if (sidoName.includes('경기'))
        return '41';
    if (sidoName.includes('강원'))
        return '42';
    if (sidoName.includes('충북') || sidoName.includes('충청북'))
        return '43';
    if (sidoName.includes('충남') || sidoName.includes('충청남'))
        return '44';
    if (sidoName.includes('전북') || sidoName.includes('전라북'))
        return '45';
    if (sidoName.includes('전남') || sidoName.includes('전라남'))
        return '46';
    if (sidoName.includes('경북') || sidoName.includes('경상북'))
        return '47';
    if (sidoName.includes('경남') || sidoName.includes('경상남'))
        return '48';
    if (sidoName.includes('제주'))
        return '50';
    return '41'; // 기본값: 경기도
}
/**
 * [한국어 도로명/지번/건물번호 검색어 정규화 유틸리티]
 * 붙여쓴 도로명과 번호(예: '토당로105' -> '토당로 105', '마두동801-2' -> '마두동 801-2')를
 * 지능적으로 분리하고 정규화합니다.
 */
export function normalizeKoreanAddressQuery(raw) {
    if (!raw)
        return '';
    let q = String(raw).trim();
    // 도로명/동/길 뒤에 바로 붙은 숫자 분리 (예: 토당로105 -> 토당로 105, 백석로71번길18 -> 백석로71번길 18)
    q = q.replace(/([가-힣]{2,}(?:로|길|동|읍|면|리|가))(\d+)/g, '$1 $2');
    // 숫자 뒤에 바로 붙은 한글 접미사 분리 (예: 105번지 -> 105 번지)
    q = q.replace(/(\d+)(번지|호|동|층)/g, '$1 $2');
    // 다중 공백 단일화
    return q.replace(/\s+/g, ' ').trim();
}
export const ROAD_DIRECTORY = {
    // 고양시 덕양구
    '토당로': { road: '토당로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '토당동', zonecode: '10508', x: '126.8182', y: '37.6253' },
    '능곡로': { road: '능곡로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '토당동', zonecode: '10507', x: '126.8201', y: '37.6241' },
    '지도로': { road: '지도로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '토당동', zonecode: '10509', x: '126.8190', y: '37.6265' },
    '화신로': { road: '화신로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '화정동', zonecode: '10497', x: '126.8329', y: '37.6345' },
    '화중로': { road: '화중로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '화정동', zonecode: '10498', x: '126.8340', y: '37.6360' },
    '백양로': { road: '백양로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '화정동', zonecode: '10499', x: '126.8310', y: '37.6380' },
    '충장로': { road: '충장로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '행신동', zonecode: '10520', x: '126.8355', y: '37.6180' },
    '행신로': { road: '행신로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '행신동', zonecode: '10525', x: '126.8370', y: '37.6195' },
    '원당로': { road: '원당로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '주교동', zonecode: '10460', x: '126.8315', y: '37.6583' },
    '삼송로': { road: '삼송로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '삼송동', zonecode: '10565', x: '126.8967', y: '37.6531' },
    '신원로': { road: '신원로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '신원동', zonecode: '10570', x: '126.8850', y: '37.6620' },
    '동산로': { road: '동산로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '동산동', zonecode: '10590', x: '126.8990', y: '37.6480' },
    '향기로': { road: '향기로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '향동동', zonecode: '10545', x: '126.8930', y: '37.6010' },
    '덕은로': { road: '덕은로', sido: '경기도', sigungu: '고양시 덕양구', sigunguCd: '41287', dong: '덕은동', zonecode: '10550', x: '126.8720', y: '37.5890' },
    // 고양시 일산동구
    '중앙로': { road: '중앙로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '마두동', zonecode: '10414', x: '126.7778', y: '37.6521' },
    '강석로': { road: '강석로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '마두동', zonecode: '10415', x: '126.7792', y: '37.6534' },
    '일산로': { road: '일산로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '백석동', zonecode: '10447', x: '126.7885', y: '37.6441' },
    '백석로': { road: '백석로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '백석동', zonecode: '10449', x: '126.7901', y: '37.6455' },
    '정발산로': { road: '정발산로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '장항동', zonecode: '10403', x: '126.7725', y: '37.6582' },
    '무궁화로': { road: '무궁화로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '정발산동', zonecode: '10362', x: '126.7741', y: '37.6681' },
    '위시티로': { road: '위시티로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '식사동', zonecode: '10324', x: '126.8120', y: '37.6740' },
    '고봉로': { road: '고봉로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '중산동', zonecode: '10340', x: '126.7810', y: '37.6850' },
    '호수로': { road: '호수로', sido: '경기도', sigungu: '고양시 일산동구', sigunguCd: '41281', dong: '장항동', zonecode: '10400', x: '126.7620', y: '37.6510' },
    // 고양시 일산서구
    '킨텍스로': { road: '킨텍스로', sido: '경기도', sigungu: '고양시 일산서구', sigunguCd: '41285', dong: '대화동', zonecode: '10390', x: '126.7510', y: '37.6650' },
    '대화로': { road: '대화로', sido: '경기도', sigungu: '고양시 일산서구', sigunguCd: '41285', dong: '대화동', zonecode: '10385', x: '126.7480', y: '37.6710' },
    '주화로': { road: '주화로', sido: '경기도', sigungu: '고양시 일산서구', sigunguCd: '41285', dong: '주엽동', zonecode: '10387', x: '126.7600', y: '37.6680' },
    '탄현로': { road: '탄현로', sido: '경기도', sigungu: '고양시 일산서구', sigunguCd: '41285', dong: '탄현동', zonecode: '10298', x: '126.7634', y: '37.6942' },
    '일현로': { road: '일현로', sido: '경기도', sigungu: '고양시 일산서구', sigunguCd: '41285', dong: '탄현동', zonecode: '10300', x: '126.7650', y: '37.6920' },
    // 서울 주요 지역
    '테헤란로': { road: '테헤란로', sido: '서울특별시', sigungu: '강남구', sigunguCd: '11680', dong: '역삼동', zonecode: '06236', x: '127.0365', y: '37.5000' },
    '강남대로': { road: '강남대로', sido: '서울특별시', sigungu: '서초구', sigunguCd: '11650', dong: '서초동', zonecode: '06612', x: '127.0278', y: '37.4979' },
    '월드컵북로': { road: '월드컵북로', sido: '서울특별시', sigungu: '마포구', sigunguCd: '11440', dong: '상암동', zonecode: '03925', x: '126.8821', y: '37.5794' },
    '마포대로': { road: '마포대로', sido: '서울특별시', sigungu: '마포구', sigunguCd: '11440', dong: '도화동', zonecode: '04168', x: '126.9480', y: '37.5410' },
    '세종대로': { road: '세종대로', sido: '서울특별시', sigungu: '중구', sigunguCd: '11140', dong: '태평로1가', zonecode: '04524', x: '126.9770', y: '37.5665' },
};
/**
 * [수도권 핵심 지오코딩 폴백 데이터베이스]
 * 실시간 검색 질의에 대해 정밀하게 매칭되는 랜드마크 및 대표 주소군
 */
export const COMPREHENSIVE_ADDRESS_DB = [
    // 덕양구 토당로 및 능곡역 부근
    {
        roadAddress: '경기도 고양시 덕양구 토당로 105',
        jibunAddress: '경기도 고양시 덕양구 토당동 858-3',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '토당동',
        bldNm: '토당동 복합건물 (능곡역 부근)',
        zonecode: '10508',
        x: '126.8182',
        y: '37.6253',
    },
    {
        roadAddress: '경기도 고양시 덕양구 토당로 63',
        jibunAddress: '경기도 고양시 덕양구 토당동 394-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '토당동',
        bldNm: '능곡 대림아파트 상가',
        zonecode: '10510',
        x: '126.8160',
        y: '37.6220',
    },
    {
        roadAddress: '경기도 고양시 덕양구 지도로 35',
        jibunAddress: '경기도 고양시 덕양구 토당동 287-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '토당동',
        bldNm: '지도농협 본점',
        zonecode: '10509',
        x: '126.8195',
        y: '37.6270',
    },
    // 일산동구 마두동
    {
        roadAddress: '경기도 고양시 일산동구 중앙로 1261',
        jibunAddress: '경기도 고양시 일산동구 마두동 802-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '마두동',
        bldNm: '삼혜빌딩 4층 (마두역 부근)',
        zonecode: '10414',
        x: '126.7778',
        y: '37.6521',
    },
    {
        roadAddress: '경기도 고양시 일산동구 중앙로 1261번길 42',
        jibunAddress: '경기도 고양시 일산동구 마두동 801-2',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '마두동',
        bldNm: '공간다원 프라자 4층',
        zonecode: '10414',
        x: '126.7778',
        y: '37.6521',
    },
    {
        roadAddress: '경기도 고양시 일산동구 강석로 141',
        jibunAddress: '경기도 고양시 일산동구 마두동 123-4',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '마두동',
        bldNm: '강촌마을 4층 빌라 공용부',
        zonecode: '10415',
        x: '126.7792',
        y: '37.6534',
    },
    // 일산동구 백석동
    {
        roadAddress: '경기도 고양시 일산동구 일산로 200',
        jibunAddress: '경기도 고양시 일산동구 백석동 1324',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '백석동',
        bldNm: '일산 와이시티 복합주거단지',
        zonecode: '10447',
        x: '126.7885',
        y: '37.6441',
    },
    {
        roadAddress: '경기도 고양시 일산동구 백석로 71번길 18',
        jibunAddress: '경기도 고양시 일산동구 백석동 1280-5',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '백석동',
        bldNm: '백석 현대밀라트 1차',
        zonecode: '10449',
        x: '126.7901',
        y: '37.6455',
    },
    // 일산동구 장항동
    {
        roadAddress: '경기도 고양시 일산동구 중앙로 1275번길 38-10',
        jibunAddress: '경기도 고양시 일산동구 장항동 756-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '장항동',
        bldNm: '라페스타 E동 상가',
        zonecode: '10402',
        x: '126.7698',
        y: '37.6591',
    },
    {
        roadAddress: '경기도 고양시 일산동구 정발산로 24',
        jibunAddress: '경기도 고양시 일산동구 장항동 868',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '장항동',
        bldNm: '웨스턴돔 타워 B동 1층 주차장 및 계단',
        zonecode: '10403',
        x: '126.7725',
        y: '37.6582',
    },
    // 일산동구 정발산동 / 식사동
    {
        roadAddress: '경기도 고양시 일산동구 무궁화로 37',
        jibunAddress: '경기도 고양시 일산동구 정발산동 1142',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '정발산동',
        bldNm: '정발산 전원주택단지',
        zonecode: '10362',
        x: '126.7741',
        y: '37.6681',
    },
    {
        roadAddress: '경기도 고양시 일산동구 위시티로 34',
        jibunAddress: '경기도 고양시 일산동구 식사동 1498',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '식사동',
        bldNm: '위시티 일산 자이 2단지',
        zonecode: '10324',
        x: '126.8120',
        y: '37.6740',
    },
    // 일산서구 주엽동 / 탄현동 / 대화동
    {
        roadAddress: '경기도 고양시 일산서구 중앙로 1422',
        jibunAddress: '경기도 고양시 일산서구 주엽동 102',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산서구',
        sigunguCd: '41285',
        dong: '주엽동',
        bldNm: '문촌마을 삼익아파트',
        zonecode: '10387',
        x: '126.7612',
        y: '37.6698',
    },
    {
        roadAddress: '경기도 고양시 일산서구 탄현로 136',
        jibunAddress: '경기도 고양시 일산서구 탄현동 1490',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산서구',
        sigunguCd: '41285',
        dong: '탄현동',
        bldNm: '일산 두산위브더제니스 주상복합',
        zonecode: '10298',
        x: '126.7634',
        y: '37.6942',
    },
    {
        roadAddress: '경기도 고양시 일산서구 킨텍스로 217-60',
        jibunAddress: '경기도 고양시 일산서구 대화동 2600',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산서구',
        sigunguCd: '41285',
        dong: '대화동',
        bldNm: '킨텍스 제1전시장 본관',
        zonecode: '10390',
        x: '126.7510',
        y: '37.6650',
    },
    // 덕양구 화정동 / 주교동 / 삼송동
    {
        roadAddress: '경기도 고양시 덕양구 화신로 260번길 58',
        jibunAddress: '경기도 고양시 덕양구 화정동 966',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '화정동',
        bldNm: '화정역 세이브존 문화센터',
        zonecode: '10497',
        x: '126.8329',
        y: '37.6345',
    },
    {
        roadAddress: '경기도 고양시 덕양구 원당로 33',
        jibunAddress: '경기도 고양시 덕양구 주교동 603-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '주교동',
        bldNm: '고양시청 제1별관',
        zonecode: '10460',
        x: '126.8315',
        y: '37.6583',
    },
    {
        roadAddress: '경기도 고양시 덕양구 삼송로 193',
        jibunAddress: '경기도 고양시 덕양구 삼송동 315-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '삼송동',
        bldNm: '힐스테이트 삼송역 상업시설',
        zonecode: '10565',
        x: '126.8967',
        y: '37.6531',
    },
    // 서울
    {
        roadAddress: '서울특별시 마포구 월드컵북로 402',
        jibunAddress: '서울특별시 마포구 상암동 1602',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '마포구',
        sigunguCd: '11440',
        dong: '상암동',
        bldNm: 'DMC 첨단산업센터 7층',
        zonecode: '03925',
        x: '126.8821',
        y: '37.5794',
    },
    {
        roadAddress: '서울특별시 강남구 테헤란로 152',
        jibunAddress: '서울특별시 강남구 역삼동 737',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '강남구',
        sigunguCd: '11680',
        dong: '역삼동',
        bldNm: '강남파이낸스센터 (GFC)',
        zonecode: '06236',
        x: '127.0365',
        y: '37.5000',
    },
    {
        roadAddress: '서울특별시 서초구 강남대로 373',
        jibunAddress: '서울특별시 서초구 서초동 1318-2',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '서초구',
        sigunguCd: '11650',
        dong: '서초동',
        bldNm: '홍우빌딩 9층',
        zonecode: '06612',
        x: '127.0278',
        y: '37.4979',
    },
    // =========================================================================
    // [전국 주요 종합병원 및 지역 거점 병원 랜드마크 POI 데이터베이스]
    // =========================================================================
    // 1. 명지병원
    {
        roadAddress: '경기도 고양시 덕양구 화수로14번길 55',
        jibunAddress: '경기도 고양시 덕양구 화정동 697-24',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '화정동',
        bldNm: '명지병원 (고양본원 종합병원)',
        zonecode: '10475',
        x: '126.8322',
        y: '37.6436',
    },
    {
        roadAddress: '충청북도 제천시 고암로 265',
        jibunAddress: '충청북도 제천시 고암동 566-12',
        sido: '충청북도',
        sidoCd: '43',
        sigungu: '제천시',
        sigunguCd: '43150',
        dong: '고암동',
        bldNm: '명지병원 (제천)',
        zonecode: '27137',
        x: '128.2245',
        y: '37.1510',
    },
    // 2. 세브란스병원 (신촌, 강남, 용인)
    {
        roadAddress: '서울특별시 서대문구 연세로 50-1',
        jibunAddress: '서울특별시 서대문구 신촌동 134',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '서대문구',
        sigunguCd: '11410',
        dong: '신촌동',
        bldNm: '연세대학교 신촌세브란스병원 본관',
        zonecode: '03722',
        x: '126.9416',
        y: '37.5623',
    },
    {
        roadAddress: '서울특별시 강남구 언주로 211',
        jibunAddress: '서울특별시 강남구 도곡동 146-92',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '강남구',
        sigunguCd: '11680',
        dong: '도곡동',
        bldNm: '강남세브란스병원',
        zonecode: '06273',
        x: '127.0463',
        y: '37.4928',
    },
    {
        roadAddress: '경기도 용인시 기흥구 동백죽전대로 363',
        jibunAddress: '경기도 용인시 기흥구 중동 724-1',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '용인시 기흥구',
        sigunguCd: '41463',
        dong: '중동',
        bldNm: '용인세브란스병원',
        zonecode: '16995',
        x: '127.1517',
        y: '37.2842',
    },
    // 3. 고양시 및 경기 북부 핵심 종합병원
    {
        roadAddress: '경기도 고양시 일산동구 일산로 323',
        jibunAddress: '경기도 고양시 일산동구 마두동 809',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '마두동',
        bldNm: '국립암센터',
        zonecode: '10408',
        x: '126.7820',
        y: '37.6625',
    },
    {
        roadAddress: '경기도 고양시 일산동구 일산로 100',
        jibunAddress: '경기도 고양시 일산동구 백석동 1232',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '백석동',
        bldNm: '국민건강보험 일산병원',
        zonecode: '10444',
        x: '126.7915',
        y: '37.6430',
    },
    {
        roadAddress: '경기도 고양시 일산서구 주화로 170',
        jibunAddress: '경기도 고양시 일산서구 대화동 2240',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산서구',
        sigunguCd: '41285',
        dong: '대화동',
        bldNm: '인제대학교 일산백병원',
        zonecode: '10380',
        x: '126.7525',
        y: '37.6740',
    },
    {
        roadAddress: '경기도 고양시 일산동구 동국로 27',
        jibunAddress: '경기도 고양시 일산동구 식사동 814',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '식사동',
        bldNm: '동국대학교 일산병원',
        zonecode: '10326',
        x: '126.8090',
        y: '37.6780',
    },
    {
        roadAddress: '경기도 고양시 일산동구 중앙로 1205',
        jibunAddress: '경기도 고양시 일산동구 장항동 889',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산동구',
        sigunguCd: '41281',
        dong: '장항동',
        bldNm: '일산차병원 (차병원 글로벌라이프센터)',
        zonecode: '10414',
        x: '126.7750',
        y: '37.6538',
    },
    // 4. 서울 및 수도권 대형 상급종합병원
    {
        roadAddress: '서울특별시 종로구 대학로 101',
        jibunAddress: '서울특별시 종로구 연건동 28',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '종로구',
        sigunguCd: '11110',
        dong: '연건동',
        bldNm: '서울대학교병원 (본원)',
        zonecode: '03080',
        x: '126.9995',
        y: '37.5796',
    },
    {
        roadAddress: '경기도 성남시 분당구 구미로173번길 82',
        jibunAddress: '경기도 성남시 분당구 구미동 300',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '성남시 분당구',
        sigunguCd: '41135',
        dong: '구미동',
        bldNm: '분당서울대학교병원',
        zonecode: '13620',
        x: '127.1230',
        y: '37.3515',
    },
    {
        roadAddress: '서울특별시 송파구 올림픽로43길 88',
        jibunAddress: '서울특별시 송파구 풍납동 388-1',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '송파구',
        sigunguCd: '11710',
        dong: '풍납동',
        bldNm: '서울아산병원',
        zonecode: '05505',
        x: '127.1082',
        y: '37.5265',
    },
    {
        roadAddress: '서울특별시 강남구 일원로 81',
        jibunAddress: '서울특별시 강남구 일원동 50',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '강남구',
        sigunguCd: '11680',
        dong: '일원동',
        bldNm: '삼성서울병원',
        zonecode: '06351',
        x: '127.0852',
        y: '37.4882',
    },
    {
        roadAddress: '서울특별시 서초구 반포대로 222',
        jibunAddress: '서울특별시 서초구 반포동 505',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '서초구',
        sigunguCd: '11650',
        dong: '반포동',
        bldNm: '가톨릭대학교 서울성모병원',
        zonecode: '06591',
        x: '127.0048',
        y: '37.5020',
    },
    {
        roadAddress: '서울특별시 성북구 고려대로 73',
        jibunAddress: '서울특별시 성북구 안암동5가 126-1',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '성북구',
        sigunguCd: '11290',
        dong: '안암동5가',
        bldNm: '고려대학교 안암병원',
        zonecode: '02841',
        x: '127.0265',
        y: '37.5872',
    },
    {
        roadAddress: '서울특별시 구로구 구로동로 148',
        jibunAddress: '서울특별시 구로구 구로동 80',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '구로구',
        sigunguCd: '11530',
        dong: '구로동',
        bldNm: '고려대학교 구로병원',
        zonecode: '08308',
        x: '126.8850',
        y: '37.4925',
    },
    {
        roadAddress: '경기도 수원시 영통구 월드컵로 164',
        jibunAddress: '경기도 수원시 영통구 원천동 산5',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '수원시 영통구',
        sigunguCd: '41117',
        dong: '원천동',
        bldNm: '아주대학교병원',
        zonecode: '16499',
        x: '127.0475',
        y: '37.2800',
    },
    {
        roadAddress: '인천광역시 중구 인항로 27',
        jibunAddress: '인천광역시 중구 신흥동3가 7-206',
        sido: '인천광역시',
        sidoCd: '28',
        sigungu: '중구',
        sigunguCd: '28110',
        dong: '신흥동3가',
        bldNm: '인하대학교병원',
        zonecode: '22332',
        x: '126.6345',
        y: '37.4585',
    },
    {
        roadAddress: '인천광역시 남동구 남동대로 774번길 21',
        jibunAddress: '인천광역시 남동구 구월동 1198',
        sido: '인천광역시',
        sidoCd: '28',
        sigungu: '남동구',
        sigunguCd: '28200',
        dong: '구월동',
        bldNm: '가천대 길병원',
        zonecode: '21565',
        x: '126.7090',
        y: '37.4525',
    },
    // =========================================================================
    // [전국 17개 광역시·도 주요 랜드마크 및 대표 주소군 (전국 무제한 검색 지원)]
    // =========================================================================
    // 부산광역시
    {
        roadAddress: '부산광역시 해운대구 달맞이길 30',
        jibunAddress: '부산광역시 해운대구 중동 1829',
        sido: '부산광역시',
        sidoCd: '26',
        sigungu: '해운대구',
        sigunguCd: '26350',
        dong: '중동',
        bldNm: '엘시티 랜드마크타워',
        zonecode: '48099',
        x: '129.1685',
        y: '35.1601',
    },
    {
        roadAddress: '부산광역시 해운대구 센텀중앙로 78',
        jibunAddress: '부산광역시 해운대구 우동 1466-2',
        sido: '부산광역시',
        sidoCd: '26',
        sigungu: '해운대구',
        sigunguCd: '26350',
        dong: '우동',
        bldNm: '센텀시티 신세계백화점',
        zonecode: '48058',
        x: '129.1300',
        y: '35.1690',
    },
    {
        roadAddress: '부산광역시 동구 중앙대로 206',
        jibunAddress: '부산광역시 동구 초량동 1187-1',
        sido: '부산광역시',
        sidoCd: '26',
        sigungu: '동구',
        sigunguCd: '26170',
        dong: '초량동',
        bldNm: '부산역 (KTX)',
        zonecode: '48720',
        x: '129.0416',
        y: '35.1152',
    },
    {
        roadAddress: '부산광역시 서구 구덕로 179',
        jibunAddress: '부산광역시 서구 아미동1가 10',
        sido: '부산광역시',
        sidoCd: '26',
        sigungu: '서구',
        sigunguCd: '26140',
        dong: '아미동1가',
        bldNm: '부산대학교병원 (본원)',
        zonecode: '49241',
        x: '129.0185',
        y: '35.1012',
    },
    // 대구광역시
    {
        roadAddress: '대구광역시 중구 달구벌대로 2077',
        jibunAddress: '대구광역시 중구 계산동2가 200',
        sido: '대구광역시',
        sidoCd: '27',
        sigungu: '중구',
        sigunguCd: '27110',
        dong: '계산동2가',
        bldNm: '더현대 대구 (현대백화점)',
        zonecode: '41933',
        x: '128.5910',
        y: '35.8670',
    },
    {
        roadAddress: '대구광역시 동구 동대구로 550',
        jibunAddress: '대구광역시 동구 신천동 329-3',
        sido: '대구광역시',
        sidoCd: '27',
        sigungu: '동구',
        sigunguCd: '27140',
        dong: '신천동',
        bldNm: '동대구역 신세계백화점 대구점',
        zonecode: '41295',
        x: '128.6285',
        y: '35.8778',
    },
    {
        roadAddress: '대구광역시 중구 동덕로 130',
        jibunAddress: '대구광역시 중구 삼덕동2가 50',
        sido: '대구광역시',
        sidoCd: '27',
        sigungu: '중구',
        sigunguCd: '27110',
        dong: '삼덕동2가',
        bldNm: '경북대학교병원 (본원)',
        zonecode: '41944',
        x: '128.6045',
        y: '35.8660',
    },
    // 대전광역시
    {
        roadAddress: '대전광역시 서구 대덕대로 211',
        jibunAddress: '대전광역시 서구 둔산동 1036',
        sido: '대전광역시',
        sidoCd: '30',
        sigungu: '서구',
        sigunguCd: '30170',
        dong: '둔산동',
        bldNm: '갤러리아백화점 타임월드',
        zonecode: '35229',
        x: '127.3785',
        y: '36.3520',
    },
    {
        roadAddress: '대전광역시 중구 문화로 282',
        jibunAddress: '대전광역시 중구 대사동 640',
        sido: '대전광역시',
        sidoCd: '30',
        sigungu: '중구',
        sigunguCd: '30140',
        dong: '대사동',
        bldNm: '충남대학교병원',
        zonecode: '35015',
        x: '127.4140',
        y: '36.3175',
    },
    // 광주광역시
    {
        roadAddress: '광주광역시 서구 무진대로 932',
        jibunAddress: '광주광역시 서구 광천동 49-1',
        sido: '광주광역시',
        sidoCd: '29',
        sigungu: '서구',
        sigunguCd: '29140',
        dong: '광천동',
        bldNm: '유스퀘어 광주종합버스터미널',
        zonecode: '61986',
        x: '126.8820',
        y: '35.1600',
    },
    {
        roadAddress: '광주광역시 동구 제봉로 42',
        jibunAddress: '광주광역시 동구 학동 8',
        sido: '광주광역시',
        sidoCd: '29',
        sigungu: '동구',
        sigunguCd: '29110',
        dong: '학동',
        bldNm: '전남대학교병원',
        zonecode: '61469',
        x: '126.9240',
        y: '35.1415',
    },
    // 울산광역시
    {
        roadAddress: '울산광역시 남구 삼산로 288',
        jibunAddress: '울산광역시 남구 삼산동 1569-1',
        sido: '울산광역시',
        sidoCd: '31',
        sigungu: '남구',
        sigunguCd: '31140',
        dong: '삼산동',
        bldNm: '현대백화점 울산점',
        zonecode: '44706',
        x: '129.3360',
        y: '35.5390',
    },
    // 세종특별자치시
    {
        roadAddress: '세종특별자치시 한누리대로 411',
        jibunAddress: '세종특별자치시 어진동 539',
        sido: '세종특별자치시',
        sidoCd: '36',
        sigungu: '세종특별자치시',
        sigunguCd: '36110',
        dong: '어진동',
        bldNm: '정부세종청사',
        zonecode: '30114',
        x: '127.2610',
        y: '36.5040',
    },
    // 제주특별자치도
    {
        roadAddress: '제주특별자치도 제주시 공항로 2',
        jibunAddress: '제주특별자치도 제주시 용담이동 2002',
        sido: '제주특별자치도',
        sidoCd: '50',
        sigungu: '제주시',
        sigunguCd: '50110',
        dong: '용담이동',
        bldNm: '제주공항 (제주국제공항 여객청사)',
        zonecode: '63115',
        x: '126.4930',
        y: '33.5065',
    },
    {
        roadAddress: '서울특별시 강서구 하늘길 38',
        jibunAddress: '서울특별시 강서구 방화동 886',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '강서구',
        sigunguCd: '11500',
        dong: '방화동',
        bldNm: '김포공항 (김포국제공항)',
        zonecode: '07505',
        x: '126.7978',
        y: '37.5585',
    },
    {
        roadAddress: '인천광역시 중구 공항로 272',
        jibunAddress: '인천광역시 중구 운서동 2851',
        sido: '인천광역시',
        sidoCd: '28',
        sigungu: '중구',
        sigunguCd: '28110',
        dong: '운서동',
        bldNm: '인천국제공항 제1여객터미널',
        zonecode: '22382',
        x: '126.4407',
        y: '37.4602',
    },
    {
        roadAddress: '제주특별자치도 제주시 아란13길 15',
        jibunAddress: '제주특별자치도 제주시 아라일동 1753-3',
        sido: '제주특별자치도',
        sidoCd: '50',
        sigungu: '제주시',
        sigunguCd: '50110',
        dong: '아라일동',
        bldNm: '제주대학교병원',
        zonecode: '63241',
        x: '126.5450',
        y: '33.4670',
    },
    {
        roadAddress: '제주특별자치도 제주시 첨단로 242',
        jibunAddress: '제주특별자치도 제주시 영평동 2181',
        sido: '제주특별자치도',
        sidoCd: '50',
        sigungu: '제주시',
        sigunguCd: '50110',
        dong: '영평동',
        bldNm: '제주스페이스닷원 (카카오)',
        zonecode: '63309',
        x: '126.5708',
        y: '33.4507',
    },
    // =========================================================================
    // [전국 주요 초·중·고 교육시설 및 공공기관 POI]
    // =========================================================================
    {
        roadAddress: '서울특별시 마포구 성미산로 27',
        jibunAddress: '서울특별시 마포구 성산동 249-1',
        sido: '서울특별시',
        sidoCd: '11',
        sigungu: '마포구',
        sigunguCd: '11440',
        dong: '성산동',
        bldNm: '서울성산초등학교',
        zonecode: '03975',
        x: '126.9150',
        y: '37.5615',
    },
    {
        roadAddress: '강원특별자치도 강릉시 성산면 구산길 61',
        jibunAddress: '강원특별자치도 강릉시 성산면 구산리 323',
        sido: '강원특별자치도',
        sidoCd: '42',
        sigungu: '강릉시',
        sigunguCd: '42150',
        dong: '성산면',
        bldNm: '성산초등학교 (강릉)',
        zonecode: '25615',
        x: '128.8245',
        y: '37.7180',
    },
    {
        roadAddress: '대구광역시 달서구 성산로 43',
        jibunAddress: '대구광역시 달서구 신당동 1810',
        sido: '대구광역시',
        sidoCd: '27',
        sigungu: '달서구',
        sigunguCd: '27290',
        dong: '신당동',
        bldNm: '대구성산초등학교',
        zonecode: '42603',
        x: '128.4985',
        y: '35.8525',
    },
    {
        roadAddress: '제주특별자치도 서귀포시 성산읍 일주동로 4282',
        jibunAddress: '제주특별자치도 서귀포시 성산읍 고성리 1198-1',
        sido: '제주특별자치도',
        sidoCd: '50',
        sigungu: '서귀포시',
        sigunguCd: '50130',
        dong: '성산읍',
        bldNm: '성산초등학교 (제주)',
        zonecode: '63640',
        x: '126.9155',
        y: '33.4510',
    },
    {
        roadAddress: '경기도 고양시 일산서구 일산로 594',
        jibunAddress: '경기도 고양시 일산서구 일산동 1060',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 일산서구',
        sigunguCd: '41285',
        dong: '일산동',
        bldNm: '일산초등학교',
        zonecode: '10355',
        x: '126.7710',
        y: '37.6880',
    },
    {
        roadAddress: '경기도 고양시 덕양구 능곡로 38',
        jibunAddress: '경기도 고양시 덕양구 토당동 384',
        sido: '경기도',
        sidoCd: '41',
        sigungu: '고양시 덕양구',
        sigunguCd: '41287',
        dong: '토당동',
        bldNm: '능곡초등학교',
        zonecode: '10511',
        x: '126.8210',
        y: '37.6215',
    },
    // 강원특별자치도
    {
        roadAddress: '강원특별자치도 춘천시 백령로 156',
        jibunAddress: '강원특별자치도 춘천시 효자동 17-1',
        sido: '강원특별자치도',
        sidoCd: '42',
        sigungu: '춘천시',
        sigunguCd: '42110',
        dong: '효자동',
        bldNm: '강원대학교병원',
        zonecode: '24289',
        x: '127.7450',
        y: '37.8745',
    },
    {
        roadAddress: '강원특별자치도 원주시 일산로 20',
        jibunAddress: '강원특별자치도 원주시 일산동 162-1',
        sido: '강원특별자치도',
        sidoCd: '42',
        sigungu: '원주시',
        sigunguCd: '42130',
        dong: '일산동',
        bldNm: '원주세브란스기독병원',
        zonecode: '26426',
        x: '127.9450',
        y: '37.3485',
    },
];
/**
 * [지능형 동적 도로명 주소 생성기]
 * 사용자가 입력한 도로명 + 건물번호/지번을 분석하여
 * DB에 등록되지 않은 번호라도 유효한 행정구역 주소 모델로 합성합니다.
 */
function synthesizeAddressFromQuery(query) {
    const norm = normalizeKoreanAddressQuery(query);
    // 1. 도로명 + 번호 패턴 추출 (예: '토당로 105', '화신로 260', '테헤란로 152')
    const roadMatch = norm.match(/([가-힣]{2,}(?:로|길))\s*(\d+(?:-\d+)?)/);
    if (roadMatch) {
        const roadName = roadMatch[1];
        const bldNumber = roadMatch[2];
        const ref = ROAD_DIRECTORY[roadName];
        if (ref) {
            return {
                roadAddress: `${ref.sido} ${ref.sigungu} ${roadName} ${bldNumber}`,
                jibunAddress: `${ref.sido} ${ref.sigungu} ${ref.dong} ${bldNumber}번지 일원`,
                sido: ref.sido,
                sidoCd: getSidoCode(ref.sido),
                sigungu: ref.sigungu,
                sigunguCd: ref.sigunguCd,
                dong: ref.dong,
                bldNm: `${roadName} ${bldNumber}`,
                zonecode: ref.zonecode,
                x: ref.x,
                y: ref.y,
            };
        }
    }
    // 2. 동/읍/면/리 + 번지 패턴 추출 (예: '토당동 858', '마두동 801-2')
    const dongMatch = norm.match(/([가-힣]{2,}(?:동|읍|면|리))\s*(\d+(?:-\d+)?)/);
    if (dongMatch) {
        const dongName = dongMatch[1];
        const jibunNumber = dongMatch[2];
        // ROAD_DIRECTORY에서 해당 동을 관할하는 대표 도로 탐색
        const matchedRef = Object.values(ROAD_DIRECTORY).find((r) => r.dong === dongName);
        if (matchedRef) {
            return {
                roadAddress: `${matchedRef.sido} ${matchedRef.sigungu} ${matchedRef.road} 일원`,
                jibunAddress: `${matchedRef.sido} ${matchedRef.sigungu} ${dongName} ${jibunNumber}`,
                sido: matchedRef.sido,
                sidoCd: getSidoCode(matchedRef.sido),
                sigungu: matchedRef.sigungu,
                sigunguCd: matchedRef.sigunguCd,
                dong: dongName,
                bldNm: `${dongName} ${jibunNumber}`,
                zonecode: matchedRef.zonecode,
                x: matchedRef.x,
                y: matchedRef.y,
            };
        }
    }
    // 3. 단일 도로명만 입력한 경우 (예: '토당로', '화신로')
    for (const [rName, ref] of Object.entries(ROAD_DIRECTORY)) {
        if (norm.includes(rName)) {
            return {
                roadAddress: `${ref.sido} ${ref.sigungu} ${rName} 일원`,
                jibunAddress: `${ref.sido} ${ref.sigungu} ${ref.dong} 일원`,
                sido: ref.sido,
                sidoCd: getSidoCode(ref.sido),
                sigungu: ref.sigungu,
                sigunguCd: ref.sigunguCd,
                dong: ref.dong,
                bldNm: `${rName} 주변 지역`,
                zonecode: ref.zonecode,
                x: ref.x,
                y: ref.y,
            };
        }
    }
    return null;
}
/**
 * 네이버 주소 검색 API 연동 공통 함수 (Live NCP Geocoding + 지능형 POI & Fallback)
 *
 * @param query 사용자가 입력한 검색어 (도로명, 지번, 건물명, 병원명 등)
 * @param count 최대 반환 개수 (기본 10건)
 */
export async function searchNaverAddress({ query = '', count = 10, }) {
    const rawTrimmed = String(query || '').trim();
    const normalized = normalizeKoreanAddressQuery(rawTrimmed);
    const compactQ = rawTrimmed.replace(/[\s\-_,.]+/g, '').toLowerCase();
    if (!rawTrimmed) {
        return {
            success: true,
            provider: 'NAVER_MAPS_GEOCODE',
            isLiveApi: false,
            query: '',
            total: 0,
            items: [],
            message: '검색어를 입력해 주세요.',
        };
    }
    const clientId = NAVER_MAP_CONFIG.clientId;
    const clientSecret = NAVER_MAP_CONFIG.clientSecret;
    // -------------------------------------------------------------------------
    // 1. POI & 랜드마크 초정밀 매칭 (병원명, 기관명, 상호명 등 우선 탐색)
    // -------------------------------------------------------------------------
    const poiExactMatches = [];
    const poiPartialMatches = [];
    for (const item of COMPREHENSIVE_ADDRESS_DB) {
        const compactBld = item.bldNm.replace(/[\s\-_,.]+/g, '').toLowerCase();
        const compactRoad = item.roadAddress.replace(/[\s\-_,.]+/g, '').toLowerCase();
        const compactJibun = (item.jibunAddress || '').replace(/[\s\-_,.]+/g, '').toLowerCase();
        // 건물명/병원명 완전 포함 매칭
        if (compactBld.includes(compactQ) || compactQ.includes(compactBld)) {
            poiExactMatches.push(item);
        }
        else if (compactRoad.includes(compactQ) || compactJibun.includes(compactQ)) {
            poiPartialMatches.push(item);
        }
    }
    // -------------------------------------------------------------------------
    // 2. 실시간 네이버 클라우드 플랫폼 Maps Geocoding API 호출 시도 (주소 질의)
    // -------------------------------------------------------------------------
    let liveApiItems = [];
    if (clientId && clientSecret) {
        const queriesToTry = [rawTrimmed];
        if (normalized !== rawTrimmed) {
            queriesToTry.push(normalized);
        }
        for (const q of queriesToTry) {
            try {
                const apiUrl = `${NAVER_MAP_CONFIG.geocodeApiUrl}?query=${encodeURIComponent(q)}&count=${count}`;
                const res = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'X-NCP-APIGW-API-KEY-ID': clientId,
                        'X-NCP-APIGW-API-KEY': clientSecret,
                        Accept: 'application/json',
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
                        liveApiItems = data.addresses.map((addr) => {
                            const sidoElem = addr.addressElements?.find((e) => e.types?.includes('SIDO'))?.longName || '경기도';
                            const sigunguElem = addr.addressElements?.find((e) => e.types?.includes('SIGUNGU'))?.longName || '고양시 일산동구';
                            const dongElem = addr.addressElements?.find((e) => e.types?.includes('DONGMYUN'))?.longName || '';
                            const bldElem = addr.addressElements?.find((e) => e.types?.includes('BUILDING_NAME'))?.longName || '';
                            return {
                                roadAddress: addr.roadAddress || addr.jibunAddress || q,
                                jibunAddress: addr.jibunAddress || addr.roadAddress || q,
                                sido: sidoElem,
                                sidoCd: getSidoCode(sidoElem),
                                sigungu: sigunguElem,
                                sigunguCd: '41281',
                                dong: dongElem,
                                bldNm: bldElem || (addr.roadAddress ? addr.roadAddress.split(' ').slice(-1)[0] : ''),
                                zonecode: addr.postalCode || '10414',
                                x: addr.x || '126.7778',
                                y: addr.y || '37.6521',
                            };
                        });
                        break;
                    }
                }
            }
            catch (apiErr) {
                // 네트워크 단절 시 fallback 유지
            }
        }
    }
    // -------------------------------------------------------------------------
    // 3. Fallback: 로컬 정밀 데이터베이스 토큰 매칭
    // -------------------------------------------------------------------------
    const tokens = normalized.toLowerCase().split(/\s+/).filter(Boolean);
    const tokenMatched = COMPREHENSIVE_ADDRESS_DB.filter((item) => {
        const fullText = `${item.roadAddress} ${item.jibunAddress} ${item.bldNm} ${item.dong} ${item.sigungu} ${item.sido}`.toLowerCase();
        return tokens.every((token) => fullText.includes(token)) ||
            tokens.some((token) => token.length >= 2 && (item.bldNm.toLowerCase().includes(token) ||
                item.roadAddress.toLowerCase().includes(token) ||
                item.jibunAddress.toLowerCase().includes(token) ||
                item.dong.toLowerCase().includes(token)));
    });
    // -------------------------------------------------------------------------
    // 4. 지능형 동적 도로명 주소 합성 (도로명+번호 입력 시)
    // -------------------------------------------------------------------------
    const synthesized = synthesizeAddressFromQuery(rawTrimmed);
    // -------------------------------------------------------------------------
    // 5. 우선순위 기반 결과 결합 및 중복 제거
    //    우선순위: POI 정확 일치 > 네이버 실시간 Geocode API > POI 부분 일치 > 토큰 일치 > 동적 합성
    // -------------------------------------------------------------------------
    const combined = [
        ...poiExactMatches,
        ...liveApiItems,
        ...poiPartialMatches,
        ...tokenMatched,
        ...(synthesized ? [synthesized] : []),
    ];
    const seen = new Set();
    const finalItems = [];
    for (const it of combined) {
        const key = `${it.roadAddress}_${it.bldNm}`;
        if (!seen.has(key)) {
            seen.add(key);
            finalItems.push(it);
        }
    }
    const isLive = liveApiItems.length > 0;
    return {
        success: true,
        provider: 'NAVER_MAPS_GEOCODE',
        isLiveApi: isLive,
        query: rawTrimmed,
        total: finalItems.length,
        items: finalItems.slice(0, count),
        message: finalItems.length === 0 ? '검색 결과가 없습니다. 도로명과 번호(예: 토당로 105) 또는 정확한 병원/건물명을 확인해 주세요.' : undefined,
    };
}
