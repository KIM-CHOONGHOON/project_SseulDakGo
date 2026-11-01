/**
 * ============================================================================
 * [백엔드 API] 화면 ID: WEB-CLNT-COM-000 (고객 메인 홈)
 * 파일 경로: SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_000/route.js
 * 엔드포인트: POST /api/web/client/com_000
 * 설명:
 *   1. 고객 회원(C) 인증/정보 조회 (TB_USER) 및 비회원(GUEST) 판별
 *   2. 3대 청소 대분류 카테고리 메타 조회 (TB_COM_CODE: GRP_CD = 'CLEAN_LARGE')
 *   3. 선택 지역(SIDO_CD, SIGUNGU_CD) 내 실시간 청소 요청 피드 최근 5건 조회
 *      (TB_ORDER_MSTR INNER JOIN TB_ORDER_DTL)
 *   4. 모든 입출력 필드는 DB 물리 컬럼명(UPPER_SNAKE_CASE)과 100% 일치
 * ============================================================================
 */

// ============================================================================
// [네이버 지도 및 주소 검색 (NCP Maps & Geocoding) 공통 모듈 연동]
// - lib/naver-map.ts (lib/naver-map.js) 공통 모듈에서 searchNaverAddress 및 설정 임포트
// ============================================================================
import { searchNaverAddress as searchNaverAddressCommon, NAVER_MAP_CONFIG } from '../../../../lib/naver-map.js';
export { NAVER_MAP_CONFIG };

/**
 * 네이버 주소 검색 API 연동 함수 (공통 모듈 위임)
 */
export async function searchNaverAddress({ query = '' }) {
  return await searchNaverAddressCommon({ query });
}

// ============================================================================
// [SQL 쿼리 정의] (.cursorrules 및 데이터베이스 스키마 100% 준수)
// ============================================================================

/**
 * 1. 고객 회원(USER_ROLE_CD = 'C') 정보 조회 쿼리 (TB_USER)
 */
export const SQL_SELECT_CLIENT_USER = `
  SELECT
    USER_NO,
    USER_NM,
    USER_ROLE_CD
  FROM TB_USER
  WHERE USER_NO = ?
    AND USER_ROLE_CD = 'C'
    AND USE_YN = 'Y'
  LIMIT 1;
`;

/**
 * 2. 3대 청소 대분류 공통코드 메타 조회 쿼리 (TB_COM_CODE)
 */
export const SQL_SELECT_CLEAN_LARGE_CODES = `
  SELECT
    GRP_CD,
    COM_CD,
    COM_NM,
    SORT_ORD
  FROM TB_COM_CODE
  WHERE GRP_CD = 'CLEAN_LARGE'
    AND COM_CD IN ('REGULAR', 'APPLIANCE', 'MOVEIN')
    AND USE_YN = 'Y'
  ORDER BY SORT_ORD ASC;
`;

/**
 * 2-1. 건물 정기관리 상세 공통코드 조회 (청소대상, 청소위치, 세부시공내용)
 */
export const SQL_SELECT_REGULAR_DETAIL_CODES = `
  SELECT
    GRP_CD,
    COM_CD,
    COM_NM,
    SORT_ORD
  FROM TB_COM_CODE
  WHERE GRP_CD IN ('BLDG_TYPE', 'CLEAN_LOC', 'SERVICE_SUB_ITEM')
    AND USE_YN = 'Y'
  ORDER BY GRP_CD, SORT_ORD ASC;
`;

/**
 * 3. 지역 실시간 청소 요청 피드 최근 5건 조회 쿼리 (TB_ORDER_MSTR + TB_ORDER_DTL)
 */
export const SQL_SELECT_REALTIME_ORDER_FEED = `
  SELECT 
    M.ORDER_NO,
    D.CLEAN_LARGE_CD,
    M.ADDR_TEXT,
    M.PROPOSED_PRICE,
    M.ORDER_STATUS,
    M.REG_DT
  FROM TB_ORDER_MSTR M
  INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
  WHERE M.ORDER_STATUS = 'BID_OPEN'
    AND M.BID_EXPIRE_DT > NOW()
    AND M.SIDO_CD = ? AND M.SIGUNGU_CD = ?
  ORDER BY M.REG_DT DESC
  LIMIT 5;
`;

// ============================================================================
// [기본 초기/시드 데이터] (DB 미연결 개발 환경에서도 100% 동일 스키마로 즉시 응답)
// ============================================================================

const DEFAULT_USER_MAP = {
  C20261000001: {
    USER_NO: 'C20261000001',
    USER_NM: '홍길동',
    USER_ROLE_CD: 'C',
  },
};

const DEFAULT_CLEAN_LARGE_CODES = [
  {
    GRP_CD: 'CLEAN_LARGE',
    COM_CD: 'REGULAR',
    COM_NM: '정기청소',
    SORT_ORD: 1,
  },
  {
    GRP_CD: 'CLEAN_LARGE',
    COM_CD: 'APPLIANCE',
    COM_NM: '가전청소',
    SORT_ORD: 2,
  },
  {
    GRP_CD: 'CLEAN_LARGE',
    COM_CD: 'MOVEIN',
    COM_NM: '입주청소',
    SORT_ORD: 3,
  },
];

const DEFAULT_BLDG_TYPE_CODES = [
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'VILLA', COM_NM: '빌라·다세대', SORT_ORD: 1 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'COMM_BLDG', COM_NM: '상가빌딩·근생', SORT_ORD: 2 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'OFFICE_BLDG', COM_NM: '오피스·사무실빌딩', SORT_ORD: 3 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'APT_COMPLEX', COM_NM: '아파트·주상복합', SORT_ORD: 4 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'STUDIO_ROOM', COM_NM: '원룸·오피스텔', SORT_ORD: 5 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'FACTORY_WH', COM_NM: '공장·지식산업센터', SORT_ORD: 6 },
  { GRP_CD: 'BLDG_TYPE', COM_CD: 'ETC_BLDG', COM_NM: '기타 일반건물', SORT_ORD: 7 },
];

const DEFAULT_CLEAN_LOC_CODES = [
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'STAIRWAY', COM_NM: '계단 / 핸드레일(난간)', SORT_ORD: 1 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'CORRIDOR', COM_NM: '복도', SORT_ORD: 2 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'ENTRANCE', COM_NM: '현관 / 공동출입구 / 로비', SORT_ORD: 3 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'ELEVATOR', COM_NM: '승강기(엘리베이터)', SORT_ORD: 4 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'ESCAPE_STAIR', COM_NM: '비상계단 / 방화문 구역', SORT_ORD: 5 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'WINDOW_IN', COM_NM: '창문 / 유리창 (내창/창틀)', SORT_ORD: 6 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'WINDOW_OUT', COM_NM: '외벽 유리창 (외창)', SORT_ORD: 7 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'WINDOW_SCREEN', COM_NM: '방충망 / 셔터', SORT_ORD: 8 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'FLOOR_GEN', COM_NM: '실내 일반 바닥 (데코/디럭스)', SORT_ORD: 9 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'FLOOR_STONE', COM_NM: '대리석 / 석재 바닥', SORT_ORD: 10 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'FLOOR_CARPET', COM_NM: '카페트 바닥', SORT_ORD: 11 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'WALL_CEIL', COM_NM: '벽면 / 천장 / 조명갓', SORT_ORD: 12 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'TOILET_PUBLIC', COM_NM: '공용 화장실', SORT_ORD: 13 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'TOILET_PRIV', COM_NM: '전유부 화장실 / 욕실', SORT_ORD: 14 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'PANTRY_SINK', COM_NM: '탕비실 / 싱크대 구역', SORT_ORD: 15 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'COMM_KITCHEN', COM_NM: '대형 조리실 / 주방 시설', SORT_ORD: 16 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'DRAIN_PIT', COM_NM: '배수구 / 트렌치 / 집수정', SORT_ORD: 17 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'PARKING_IN', COM_NM: '지하 주차장', SORT_ORD: 18 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'PARKING_OUT', COM_NM: '지상 주차장', SORT_ORD: 19 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'RECYCLE_ZONE', COM_NM: '분리수거장 / 쓰레기 집하장', SORT_ORD: 20 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'ROOFTOP', COM_NM: '옥상 / 테라스', SORT_ORD: 21 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'OUTDOOR_YARD', COM_NM: '건물 외곽 / 보도블록', SORT_ORD: 22 },
  { GRP_CD: 'CLEAN_LOC', COM_CD: 'ETC_LOC', COM_NM: '기타 구역', SORT_ORD: 99 },
];

const DEFAULT_SERVICE_SUB_ITEM_CODES = [
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'SWEEP_MOP', COM_NM: '쓸기 및 친환경 물걸레질', SORT_ORD: 1 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'DUST_SANITIZE', COM_NM: '먼지 털이 및 살균 소독', SORT_ORD: 2 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'WINDOW_FRAME', COM_NM: '유리창 및 창틀 정밀 케어', SORT_ORD: 3 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'SPIDER_STAIN', COM_NM: '거미줄 및 벽면 오염 제거', SORT_ORD: 4 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'RECYCLE_DISPOSE', COM_NM: '재활용 분리배출 및 비닐 교체', SORT_ORD: 5 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'HIGH_PRESSURE_WASH', COM_NM: '고압 수세척 및 악취 소독', SORT_ORD: 6 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'PARKING_LEAF_BLOWER', COM_NM: '주차장 쓰레기 수거 및 송풍기', SORT_ORD: 7 },
  { GRP_CD: 'SERVICE_SUB_ITEM', COM_CD: 'FLYER_REMOVAL', COM_NM: '불법 광고물·스티커 제거', SORT_ORD: 8 },
];

const DEFAULT_REALTIME_FEED = [
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
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
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
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
  },
  {
    ORDER_NO: 'ORD-20250224-0084',
    CLEAN_LARGE_CD: 'MOVEIN',
    CLEAN_LARGE_NM: '입주청소',
    ADDR_TEXT: '경기 고양시 일산동구 식사동 위시티 34평형 아파트 입주청소',
    SUB_SPEC_TEXT: '외창 유리창 제외 기본 풀케어',
    PROPOSED_PRICE: 380000,
    PRICE_PREFIX: '',
    ORDER_STATUS: 'BID_OPEN',
    ORDER_STATUS_LABEL: 'BID_OPEN (견적 마감임박)',
    STATUS_BADGE_TYPE: 'ERROR_PING',
    REG_DT: '12분 전',
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
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
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
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
    SIDO_CD: '41',
    SIGUNGU_CD: '41281',
  },
];

// ============================================================================
// [공통 DB 모듈 (lib/db.ts) 연동 헬퍼]
// - 각 route에서 개별 mysql.createConnection()을 금지하고
// - lib/db.ts의 싱글톤 커넥션 풀(executeQuery)을 호출하여 쿼리를 수행합니다.
// ============================================================================
async function executeDatabaseQueries({ userNo, sidoCd, sigunguCd }) {
  try {
    const dbModule = await import('../../../../lib/db.js');
    const executeQuery = dbModule?.executeQuery;

    if (!executeQuery) {
      return null;
    }

    // 1. 사용자 인증/정보 확인 (TB_USER)
    let userRow = null;
    if (userNo && userNo !== 'GUEST' && String(userNo).startsWith('C')) {
      const userRows = await executeQuery(SQL_SELECT_CLIENT_USER, [userNo]);
      if (Array.isArray(userRows) && userRows.length > 0) {
        userRow = userRows[0];
      }
    }

    // 2. 3대 카테고리 메타 조회 (TB_COM_CODE)
    const categoryRows = await executeQuery(SQL_SELECT_CLEAN_LARGE_CODES);

    // 2-1. 정기관리 상세 공통코드 (청소대상, 청소위치, 세부시공내용) 조회
    const regularDetailRows = await executeQuery(SQL_SELECT_REGULAR_DETAIL_CODES);

    // 3. 지역 실시간 청소 요청 피드 최근 5건 조회 (TB_ORDER_MSTR + TB_ORDER_DTL)
    const feedRows = await executeQuery(SQL_SELECT_REALTIME_ORDER_FEED, [
      sidoCd,
      sigunguCd,
    ]);

    return {
      userRow,
      categoryRows: Array.isArray(categoryRows) ? categoryRows : [],
      regularDetailRows: Array.isArray(regularDetailRows) ? regularDetailRows : [],
      feedRows: Array.isArray(feedRows) ? feedRows : [],
    };
  } catch (dbErr) {
    console.warn('[api_WEB_CLNT_COM_000] lib/db.ts 쿼리 실행 실패(시드 데이터 사용):', dbErr.message);
    return null;
  }
}

// ============================================================================
// [코어 비즈니스 로직 처리 함수]
// ============================================================================
export async function processWebClntCom000(body = {}) {
  // 네이버 주소 검색 액션 분기
  if (body.action === 'SEARCH_NAVER_ADDRESS' || body.searchAddress) {
    return await searchNaverAddress({ query: body.query || body.keyword });
  }

  const rawUserNo = body.userNo || body.USER_NO || 'GUEST';
  const sidoCd = body.sidoCd || body.SIDO_CD || '41';
  const sigunguCd = body.sigunguCd || body.SIGUNGU_CD || '41281';

  // 1. 회원 / 비회원(GUEST) 판별 및 Role Prefix('C') 검증
  const isGuest =
    !rawUserNo ||
    String(rawUserNo).toUpperCase() === 'GUEST' ||
    !String(rawUserNo).startsWith('C');

  // DB 조회 시도 (환경변수 존재 시)
  const dbResult = await executeDatabaseQueries({
    userNo: rawUserNo,
    sidoCd,
    sigunguCd,
  });

  // 1) 사용자 정보 조립 (TB_USER 컬럼명 매핑)
  let userInfo = {
    isGuest,
    USER_NO: isGuest ? 'GUEST' : String(rawUserNo),
    USER_NM: isGuest ? '비회원' : '홍길동',
    USER_ROLE_CD: isGuest ? 'GUEST' : 'C',
  };

  if (!isGuest) {
    if (dbResult && dbResult.userRow) {
      userInfo = {
        isGuest: false,
        USER_NO: dbResult.userRow.USER_NO,
        USER_NM: dbResult.userRow.USER_NM,
        USER_ROLE_CD: dbResult.userRow.USER_ROLE_CD,
      };
    } else if (DEFAULT_USER_MAP[rawUserNo]) {
      userInfo = {
        isGuest: false,
        ...DEFAULT_USER_MAP[rawUserNo],
      };
    }
  }

  // 2) 3대 카테고리 메타 조립 (TB_COM_CODE 컬럼명 매핑)
  const categoryList =
    dbResult && dbResult.categoryRows && dbResult.categoryRows.length > 0
      ? dbResult.categoryRows.map((row) => ({
          GRP_CD: row.GRP_CD,
          COM_CD: row.COM_CD,
          COM_NM: row.COM_NM,
          SORT_ORD: row.SORT_ORD,
        }))
      : DEFAULT_CLEAN_LARGE_CODES;

  // 카테고리 코드 -> 한글명 매핑 룩업
  const categoryNameMap = categoryList.reduce((acc, cur) => {
    acc[cur.COM_CD] = cur.COM_NM;
    return acc;
  }, {});

  // 2-1) 건물 정기관리 상세 공통코드 (청소대상, 청소위치, 세부시공내용) 분합
  const rawDetailCodes =
    dbResult && dbResult.regularDetailRows && dbResult.regularDetailRows.length > 0
      ? dbResult.regularDetailRows
      : [...DEFAULT_BLDG_TYPE_CODES, ...DEFAULT_CLEAN_LOC_CODES, ...DEFAULT_SERVICE_SUB_ITEM_CODES];

  const bldgTypeCodes = rawDetailCodes
    .filter((r) => r.GRP_CD === 'BLDG_TYPE')
    .sort((a, b) => a.SORT_ORD - b.SORT_ORD);
  const cleanLocCodes = rawDetailCodes
    .filter((r) => r.GRP_CD === 'CLEAN_LOC')
    .sort((a, b) => a.SORT_ORD - b.SORT_ORD);
  const serviceSubItemCodes = rawDetailCodes
    .filter((r) => r.GRP_CD === 'SERVICE_SUB_ITEM')
    .sort((a, b) => a.SORT_ORD - b.SORT_ORD);

  // 3) 실시간 청소 요청 피드 최근 5건 조립 (TB_ORDER_MSTR + TB_ORDER_DTL 컬럼명 100% 매핑)
  let feedList = [];
  if (dbResult && dbResult.feedRows && dbResult.feedRows.length > 0) {
    feedList = dbResult.feedRows.map((row) => ({
      ORDER_NO: row.ORDER_NO,
      CLEAN_LARGE_CD: row.CLEAN_LARGE_CD,
      CLEAN_LARGE_NM: categoryNameMap[row.CLEAN_LARGE_CD] || row.CLEAN_LARGE_CD,
      ADDR_TEXT: row.ADDR_TEXT,
      PROPOSED_PRICE: Number(row.PROPOSED_PRICE),
      PRICE_PREFIX: row.CLEAN_LARGE_CD === 'REGULAR' ? '월 ' : '',
      ORDER_STATUS: row.ORDER_STATUS,
      ORDER_STATUS_LABEL: 'BID_OPEN (청약접수중)',
      STATUS_BADGE_TYPE: 'SECONDARY_PING',
      REG_DT:
        row.REG_DT instanceof Date
          ? row.REG_DT.toISOString()
          : String(row.REG_DT || ''),
      SIDO_CD: sidoCd,
      SIGUNGU_CD: sigunguCd,
    }));
  } else {
    feedList = DEFAULT_REALTIME_FEED.filter(
      (item) => item.SIDO_CD === String(sidoCd) && item.SIGUNGU_CD === String(sigunguCd)
    );
    if (feedList.length === 0) {
      feedList = DEFAULT_REALTIME_FEED;
    }
  }

  // 4) 최종 JSON 응답 반환
  return {
    success: true,
    screenId: 'WEB-CLNT-COM-000',
    screenNm: '고객 메인 홈',
    isGuest: userInfo.isGuest,
    userInfo: {
      USER_NO: userInfo.USER_NO,
      USER_NM: userInfo.USER_NM,
      USER_ROLE_CD: userInfo.USER_ROLE_CD,
    },
    regionInfo: {
      SIDO_CD: String(sidoCd),
      SIGUNGU_CD: String(sigunguCd),
      SIDO_NM: '경기도',
      SIGUNGU_NM: '고양시 일산동구',
      SHORT_NM: '일산동구',
      DISPLAY_NM: '경기 고양시 일산동구',
    },
    categoryList,
    regularDetailCodes: {
      bldgTypeCodes,
      cleanLocCodes,
      serviceSubItemCodes,
    },
    feedList,
    sqlMeta: {
      userQuery: 'TB_USER (USER_NO, USER_NM, USER_ROLE_CD)',
      codeQuery: "TB_COM_CODE (GRP_CD IN ('CLEAN_LARGE', 'BLDG_TYPE', 'CLEAN_LOC', 'SERVICE_SUB_ITEM'))",
      feedQuery:
        "TB_ORDER_MSTR M INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO WHERE M.ORDER_STATUS = 'BID_OPEN' AND M.BID_EXPIRE_DT > NOW() LIMIT 5",
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// [Next.js App Router 표준 POST 핸들러]
// URL: POST /api/web/client/com_000
// ============================================================================
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const responsePayload = await processWebClntCom000(body);

    if (typeof NextResponse !== 'undefined' && NextResponse.json) {
      return NextResponse.json(responsePayload, { status: 200 });
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('[api_WEB_CLNT_COM_000] POST 처리 오류:', error);
    const errorPayload = {
      success: false,
      screenId: 'WEB-CLNT-COM-000',
      message: error?.message || '고객 메인 홈 데이터를 불러오는 중 오류가 발생했습니다.',
    };

    if (typeof NextResponse !== 'undefined' && NextResponse.json) {
      return NextResponse.json(errorPayload, { status: 500 });
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

