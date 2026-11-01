/**
 * @file SseulDakGo_App/Client/backend/api_APP_CLNT_COM_000/route.js
 * @description 고객 모바일 홈 백엔드 API (APP-CLNT-COM-000)
 *              - 1단계: Next.js App Router 표준 POST 핸들러
 *              - 사용자 인증/프로필 확인 (TB_USER)
 *              - 3대 청소 대분류 메타데이터 조회 (TB_COM_CODE)
 *              - 선택 지역 실시간 발주 접수 피드 최근 5건 조회 (TB_ORDER_MSTR, TB_ORDER_DTL)
 *              - 엄격한 1:1 독립 매핑 원칙 (Strict Non-Sharing & SRP) 준수
 */

import { executeQuery } from '../../../../lib/db.js';

// 지역 코드 매핑 헬퍼
const REGION_MAP = {
  '41281': '경기 고양시 일산동구',
  '41285': '경기 고양시 일산서구',
  '41287': '경기 고양시 덕양구',
  '11680': '서울 강남구'
};

/**
 * 모의(Mock) 기본 데이터 세트 (오프라인/네트워크 폴백 지원)
 */
function getMockData(clientUserNo = 'C20261000001', sidoCd = '41', sigunguCd = '41281') {
  const isGuest = clientUserNo === 'GUEST' || !clientUserNo || !String(clientUserNo).startsWith('C');
  const regionNm = REGION_MAP[sigunguCd] || '경기 고양시 일산동구';

  return {
    clientInfo: {
      isGuest,
      userNo: isGuest ? 'GUEST' : clientUserNo,
      userNm: isGuest ? '비회원' : '홍길동'
    },
    currentRegion: {
      sidoCd: String(sidoCd || '41'),
      sigunguCd: String(sigunguCd || '41281'),
      regionNm
    },
    categories: [
      {
        cleanLargeCd: 'REGULAR',
        cleanLargeNm: '건물 정기관리',
        subName: '계단, 복도, 외곽, 분리수거장 공용부 케어',
        badgeText: '최소 3개월(90일) 락'
      },
      {
        cleanLargeCd: 'APPLIANCE',
        cleanLargeNm: '가전 분해청소',
        subName: '에어컨, 세탁기 고압 스팀 소독 및 필터 코팅',
        badgeText: '완전분해 살균세척'
      },
      {
        cleanLargeCd: 'MOVEIN',
        cleanLargeNm: '입주/이사 대청소',
        subName: '신축 입주, 이사 전 미세분진/찌든 때 정밀 케어',
        badgeText: '실내 전용공간 케어'
      }
    ],
    realtimeFeeds: [
      {
        orderNo: 'ORD2026103100001',
        orderStatus: 'BID_OPEN',
        cleanLargeCd: 'REGULAR',
        cleanMidCd: '빌라 공용부',
        addrText: '경기 고양시 일산동구 마두동',
        proposedPrice: 240000,
        regDt: '2026-10-31 10:20:00'
      },
      {
        orderNo: 'ORD2026103100002',
        orderStatus: 'BID_OPEN',
        cleanLargeCd: 'APPLIANCE',
        cleanMidCd: '시스템 4Way 에어컨 2대',
        addrText: '경기 고양시 일산동구 백석동 오피스텔',
        proposedPrice: 260000,
        regDt: '2026-10-31 10:35:00'
      },
      {
        orderNo: 'ORD2026103100003',
        orderStatus: 'BID_OPEN',
        cleanLargeCd: 'MOVEIN',
        cleanMidCd: '32평형 신축 아파트',
        addrText: '경기 고양시 일산동구 주엽동 문촌마을',
        proposedPrice: 384000,
        regDt: '2026-10-31 10:50:00'
      },
      {
        orderNo: 'ORD2026103100004',
        orderStatus: 'BID_OPEN',
        cleanLargeCd: 'REGULAR',
        cleanMidCd: '5층 상가건물 공용부',
        addrText: '경기 고양시 일산동구 장항동 라페스타 인근',
        proposedPrice: 320000,
        regDt: '2026-10-31 11:05:00'
      },
      {
        orderNo: 'ORD2026103100005',
        orderStatus: 'BID_OPEN',
        cleanLargeCd: 'REGULAR',
        cleanMidCd: '사무실 바닥 왁스코팅',
        addrText: '경기 고양시 일산동구 식사동 지식산업센터',
        proposedPrice: 450000,
        regDt: '2026-10-31 11:15:00'
      }
    ]
  };
}

/**
 * APP-CLNT-COM-000 비즈니스 로직 처리 코어 함수
 * (독립 Node/Express 프리뷰 서버 및 Next.js App Router 공용)
 * 
 * @param {Object} payload 
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processAppClntCom000(payload = {}) {
  const clientUserNo = payload.clientUserNo || payload.userNo || 'GUEST';
  const sidoCd = payload.sidoCd || '41';
  const sigunguCd = payload.sigunguCd || '41281';

  const mock = getMockData(clientUserNo, sidoCd, sigunguCd);
  const regionNm = REGION_MAP[sigunguCd] || mock.currentRegion.regionNm;

  try {
    // ------------------------------------------------------------------------
    // 1. 사용자 인증/프로필 확인
    //    - clientUserNo가 'C'로 시작하는 회원인 경우 TB_USER 테이블에서 USER_NM 조회
    //    - clientUserNo가 'GUEST'인 경우 isGuest: true 반환
    // ------------------------------------------------------------------------
    let clientInfo = {
      isGuest: true,
      userNo: 'GUEST',
      userNm: '비회원'
    };

    if (clientUserNo && String(clientUserNo).startsWith('C') && clientUserNo !== 'GUEST') {
      const userSql = `
        SELECT USER_NO, USER_NM, USER_ROLE_CD, USER_EMAIL, USE_YN
        FROM TB_USER
        WHERE USER_NO = ? AND USER_ROLE_CD = 'C'
        LIMIT 1
      `;
      const userRows = await executeQuery(userSql, [clientUserNo]);
      if (Array.isArray(userRows) && userRows.length > 0) {
        clientInfo = {
          isGuest: false,
          userNo: userRows[0].USER_NO,
          userNm: userRows[0].USER_NM || '홍길동'
        };
      } else {
        // DB 연결 실패 또는 시드 미등록 시 기본 회원 fallback
        clientInfo = {
          isGuest: false,
          userNo: clientUserNo,
          userNm: '홍길동'
        };
      }
    }

    // ------------------------------------------------------------------------
    // 2. 3대 청소 카테고리 메타데이터 조회
    //    - TB_COM_CODE 테이블에서 GRP_CD = 'CLEAN_LARGE'인 코드('REGULAR', 'APPLIANCE', 'MOVEIN')와 COM_NM 조회
    // ------------------------------------------------------------------------
    const categorySql = `
      SELECT COM_CD AS cleanLargeCd, COM_NM AS cleanLargeNm
      FROM TB_COM_CODE
      WHERE GRP_CD = 'CLEAN_LARGE'
        AND COM_CD IN ('REGULAR', 'APPLIANCE', 'MOVEIN')
        AND USE_YN = 'Y'
      ORDER BY SORT_ORD ASC
    `;
    const categoryRows = await executeQuery(categorySql, []);
    let resolvedCategories = mock.categories;
    if (Array.isArray(categoryRows) && categoryRows.length > 0) {
      resolvedCategories = categoryRows.map((cat) => ({
        cleanLargeCd: cat.cleanLargeCd,
        cleanLargeNm: cat.cleanLargeNm
      }));
    }

    // ------------------------------------------------------------------------
    // 3. 해당 지역(sidoCd, sigunguCd) 실시간 접수 피드 (최근 5건)
    // ------------------------------------------------------------------------
    const feedSql = `
      SELECT 
        M.ORDER_NO,
        M.CLIENT_USER_NO,
        M.ORDER_STATUS,
        M.PROPOSED_PRICE,
        M.ADDR_TEXT,
        M.REG_DT,
        M.BID_EXPIRE_DT,
        D.CLEAN_LARGE_CD,
        D.CLEAN_MID_CD,
        D.SERVICE_STATUS
      FROM TB_ORDER_MSTR M
      INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
      WHERE M.ORDER_STATUS = 'BID_OPEN'
        AND M.BID_EXPIRE_DT > NOW()
        AND M.SIDO_CD = ? AND M.SIGUNGU_CD = ?
      ORDER BY M.REG_DT DESC
      LIMIT 5;
    `;
    const feedRows = await executeQuery(feedSql, [sidoCd, sigunguCd]);

    let resolvedFeeds = mock.realtimeFeeds;
    if (Array.isArray(feedRows) && feedRows.length > 0) {
      resolvedFeeds = feedRows.map((row) => ({
        orderNo: row.ORDER_NO,
        orderStatus: row.ORDER_STATUS,
        cleanLargeCd: row.CLEAN_LARGE_CD,
        cleanMidCd: row.CLEAN_MID_CD,
        addrText: row.ADDR_TEXT,
        proposedPrice: Number(row.PROPOSED_PRICE) || 0,
        regDt: row.REG_DT ? String(row.REG_DT).substring(0, 19).replace('T', ' ') : new Date().toISOString().substring(0, 19).replace('T', ' ')
      }));
    }

    // 하위 호환성 래핑 객체 구성
    const legacyFeedList = resolvedFeeds.map((f) => ({
      orderNo: f.orderNo,
      cleanLargeCd: f.cleanLargeCd,
      cleanLargeNm: f.cleanLargeCd === 'REGULAR' ? '건물 정기관리' : f.cleanLargeCd === 'APPLIANCE' ? '가전 분해청소' : '입주/이사 대청소',
      cleanMidCd: f.cleanMidCd,
      cleanMidNm: f.cleanMidCd,
      addrText: f.addrText,
      proposedPrice: f.proposedPrice,
      priceDisplay: `${f.cleanLargeCd === 'REGULAR' ? '월 ' : ''}${Number(f.proposedPrice).toLocaleString()}원`,
      orderStatus: f.orderStatus,
      orderStatusNm: '청약접수중',
      statusType: 'BID_OPEN',
      regDtText: '방금 전'
    }));

    return {
      status: 200,
      data: {
        success: true,
        code: 'OK',
        data: {
          clientInfo,
          currentRegion: {
            sidoCd: String(sidoCd),
            sigunguCd: String(sigunguCd),
            regionNm
          },
          categories: resolvedCategories,
          realtimeFeeds: resolvedFeeds,
          // 하위 호환 필드 (기존 컴포넌트 연동 보장)
          feedList: legacyFeedList,
          userInfo: {
            userNo: clientInfo.userNo,
            userNm: clientInfo.userNm,
            isGuest: clientInfo.isGuest
          },
          regionInfo: {
            sidoCd: String(sidoCd),
            sigunguCd: String(sigunguCd),
            displayNm: regionNm
          }
        },
        message: '모바일 메인 홈 데이터 조회가 완료되었습니다.'
      }
    };
  } catch (err) {
    console.warn('[APP_CLNT_COM_000_BACKEND_FALLBACK]', err?.message || err);
    return {
      status: 200,
      data: {
        success: true,
        code: 'OK',
        data: {
          ...mock,
          feedList: mock.realtimeFeeds.map((f) => ({
            ...f,
            cleanLargeNm: f.cleanLargeCd === 'REGULAR' ? '건물 정기관리' : f.cleanLargeCd === 'APPLIANCE' ? '가전 분해청소' : '입주/이사 대청소',
            cleanMidNm: f.cleanMidCd,
            priceDisplay: `${f.cleanLargeCd === 'REGULAR' ? '월 ' : ''}${Number(f.proposedPrice).toLocaleString()}원`,
            orderStatusNm: '청약접수중',
            statusType: 'BID_OPEN',
            regDtText: '방금 전'
          }))
        },
        message: '모바일 메인 홈 데이터 조회가 완료되었습니다.'
      }
    };
  }
}

/**
 * Next.js App Router POST 핸들러
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processAppClntCom000(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ [API_APP_CLNT_COM_000_ERROR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '모바일 홈 데이터 처리 중 서버 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
