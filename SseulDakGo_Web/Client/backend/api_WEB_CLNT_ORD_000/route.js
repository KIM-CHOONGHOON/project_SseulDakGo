/**
 * @file SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_000/route.js
 * @description 고객 나의 청소 신청 현황 목록 조회 API (WEB-CLNT-ORD-000)
 *              - 7일 경과 미체결 공고 자동 만료('BID_EXPIRED') 일괄 배치 동기화
 *              - 신청 현황 요약 통계(전체, 청약접수중, 계약체결/진행중, 완료) 집계
 *              - 발주 오더 목록 및 시공 파트너 청약(BID) 건수 서브쿼리 조회
 *              - 엄격한 1:1 독립 매핑 원칙 (Strict Non-Sharing & SRP) 준수
 * 
 * 테이블:
 * - TB_ORDER_MSTR: 주발주 마스터
 * - TB_ORDER_DTL: 발주 상세 (대/중분류, 시공 일정 등)
 * - TB_QUOTE_APPLY: 파트너 청약서 접수 원장
 * - TB_USER: 고객 회원 마스터
 */

/**
 * 샌드박스/오프라인 환경용 시뮬레이션 데이터 생성
 */
function getMockData(userNo) {
  const now = new Date();
  const formatDt = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const reg1 = new Date(now.getTime() - (1.4 * 24 * 60 * 60 * 1000));
  const exp1 = new Date(reg1.getTime() + (7 * 24 * 60 * 60 * 1000));

  const reg2 = new Date(now.getTime() - (2.2 * 24 * 60 * 60 * 1000));
  const exp2 = new Date(reg2.getTime() + (7 * 24 * 60 * 60 * 1000));

  const reg3 = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000));
  const reg4 = new Date(now.getTime() - (20 * 24 * 60 * 60 * 1000));

  const allOrders = [
    {
      orderNo: 'ORD2026103100001',
      clientUserNo: userNo,
      orderStatus: 'BID_OPEN',
      cleanLargeCd: 'REGULAR',
      cleanLargeNm: '정기청소',
      cleanMidCd: 'VILLA_COMM',
      cleanMidNm: '빌라/상가 공용부 주 1회 관리',
      detailDesc: '지하 1층 ~ 지상 4층 계단 청소, 창틀 먼지 제거, 우편함 정돈, 1층 분리수거장 주 1회 물청소 포함',
      addrText: '경기 고양시 일산동구 마두동 123-45',
      addrDetail: '한빛빌라 1~4층 계단, 복도 및 전면 필로티 주차장 구역',
      proposedPrice: 720000,
      priceUnitText: '/ 월 정액',
      serviceStartDt: '2026-11-05',
      serviceScheduleText: '매주 수요일 동일 시간대 정기 루틴 (오전 09:00 고정 방문)',
      bidExpireDt: formatDt(exp1),
      regDt: formatDt(reg1),
      applyCount: 3,
      contractMaster: null
    },
    {
      orderNo: 'ORD2026103000003',
      clientUserNo: userNo,
      orderStatus: 'BID_OPEN',
      cleanLargeCd: 'APPLIANCE',
      cleanLargeNm: '가전청소',
      cleanMidCd: 'AIRCON_4WAY',
      cleanMidNm: '시스템 4Way 에어컨 완전분해 세척 2대',
      detailDesc: '드레인팬, 송풍팬 분해 고압 살균 세척 및 친환경 핀세정제 도포, 피톤치드 훈증 포함',
      addrText: '경기 고양시 일산동구 백석동 88-12',
      addrDetail: '화이트팰리스 오피스텔 804호 (방문 주차 지원 가능)',
      proposedPrice: 260000,
      priceUnitText: ' (2대 합산)',
      serviceStartDt: '2026-11-08',
      serviceScheduleText: '주말 단기 집중 케어 (오후 14:00 방문)',
      bidExpireDt: formatDt(exp2),
      regDt: formatDt(reg2),
      applyCount: 1,
      contractMaster: null
    },
    {
      orderNo: 'ORD2026102500002',
      clientUserNo: userNo,
      orderStatus: 'CNTR_CONFIRMED',
      cleanLargeCd: 'MOVE_IN',
      cleanLargeNm: '입주청소',
      cleanMidCd: 'APT_32PY',
      cleanMidNm: '32평형 아파트 신축 입주 이사청소',
      detailDesc: '방 3개, 욕실 2개, 베란다 2개소, 빌트인 수납장 전체 탈거 세척 및 친환경 피톤치드 연무 시공',
      addrText: '경기 고양시 일산서구 주엽동 45-8',
      addrDetail: '문촌마을 3단지 304동 1202호',
      proposedPrice: 384000,
      priceUnitText: '',
      serviceStartDt: '2026-11-02',
      serviceScheduleText: '오전 08:30 시작 (예상 소요시간: 5시간 30분 내외)',
      dDayText: 'D-2',
      bidExpireDt: null,
      regDt: formatDt(reg3),
      applyCount: 4,
      contractMaster: {
        masterNm: '김진수 팀장',
        companyNm: '클린마스터 일산지점',
        licenseNm: '국가공인 방역소독사',
        rating: 4.96,
        safePhone: '0504-1234-5678'
      }
    },
    {
      orderNo: 'ORD2026101000001',
      clientUserNo: userNo,
      orderStatus: 'SVC_COMPLETED',
      cleanLargeCd: 'REGULAR',
      cleanLargeNm: '정기청소',
      cleanMidCd: 'OFFICE_WAX',
      cleanMidNm: '사무실 바닥 왁스코팅 및 정기 관리 (10월분)',
      detailDesc: '바닥 박리 세척 작업 후 2회 고광택 수지왁스 도포, 회의실 유리 파티션 지문 세정',
      addrText: '경기 고양시 일산동구 장항동 771',
      addrDetail: '라페스타 타워B 503호 (주)원더랩스 연구실',
      proposedPrice: 450000,
      priceUnitText: '',
      serviceStartDt: '2026-10-15',
      serviceScheduleText: '검수 확인자: 홍길동 (서명 확인 완료)',
      bidExpireDt: null,
      regDt: formatDt(reg4),
      applyCount: 2,
      contractMaster: {
        masterNm: '박상현 대표',
        companyNm: '에이스클린 고양본점',
        rating: 5.0
      }
    }
  ];

  return allOrders;
}

/**
 * 발주 목록 및 요약 집계 비즈니스 로직
 * @param {Object} payload 
 * @param {string} payload.clientUserNo 고객 회원번호 (기본값: 'C20261000001')
 * @param {string} payload.statusFilter 필터 ('ALL', 'BID_OPEN', 'CNTR_CONFIRMED', 'SVC_PROGRESS', 'SVC_COMPLETED', 'BID_EXPIRED')
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processWebClntOrd000(payload = {}) {
  const clientUserNo = payload.clientUserNo || payload.userNo || 'C20261000001';
  const statusFilter = payload.statusFilter || payload.filter || 'ALL';

  let db = null;
  try {
    db = await import('../../../../lib/db.js');
  } catch (e) {
    db = await import('../../lib/db.js').catch(() => null);
  }

  try {
    if (db && typeof db.executeQuery === 'function') {
      // 1. 자동 만료 배치 동기화 (7일 경과 처리)
      await db.executeQuery(
        `UPDATE TB_ORDER_MSTR
         SET ORDER_STATUS = 'BID_EXPIRED'
         WHERE CLIENT_USER_NO = ? AND ORDER_STATUS = 'BID_OPEN' AND BID_EXPIRE_DT < NOW()`,
        [clientUserNo]
      );

      // 2. 신청 현황 요약 통계 집계
      const summaryRows = await db.executeQuery(
        `SELECT 
           COUNT(*) AS TOTAL_CNT,
           SUM(CASE WHEN ORDER_STATUS = 'BID_OPEN' THEN 1 ELSE 0 END) AS BID_OPEN_CNT,
           SUM(CASE WHEN ORDER_STATUS IN ('CNTR_CONFIRMED', 'SVC_PROGRESS') THEN 1 ELSE 0 END) AS IN_PROGRESS_CNT,
           SUM(CASE WHEN ORDER_STATUS = 'SVC_COMPLETED' THEN 1 ELSE 0 END) AS COMPLETED_CNT
         FROM TB_ORDER_MSTR
         WHERE CLIENT_USER_NO = ?`,
        [clientUserNo]
      );

      const rawSummary = summaryRows[0] || {};
      const summary = {
        totalCnt: Number(rawSummary.TOTAL_CNT || 0),
        bidOpenCnt: Number(rawSummary.BID_OPEN_CNT || 0),
        inProgressCnt: Number(rawSummary.IN_PROGRESS_CNT || 0),
        completedCnt: Number(rawSummary.COMPLETED_CNT || 0)
      };

      // 3. 발주 목록 및 청약 건수 서브쿼리 조회
      const orderRows = await db.executeQuery(
        `SELECT 
           M.ORDER_NO,
           M.CLIENT_USER_NO,
           M.ORDER_STATUS,
           M.PROPOSED_PRICE,
           M.ADDR_TEXT,
           M.ADDR_DETAIL,
           DATE_FORMAT(M.BID_EXPIRE_DT, '%Y-%m-%d %H:%i:%s') AS BID_EXPIRE_DT,
           DATE_FORMAT(M.REG_DT, '%Y-%m-%d %H:%i:%s') AS REG_DT,
           D.CLEAN_LARGE_CD,
           D.CLEAN_MID_CD,
           D.SERVICE_STATUS,
           DATE_FORMAT(D.SERVICE_START_DT, '%Y-%m-%d') AS SERVICE_START_DT,
           D.DETAIL_REQ_NOTE,
           (SELECT COUNT(*) FROM TB_QUOTE_APPLY Q WHERE Q.ORDER_NO = M.ORDER_NO AND Q.APPLY_STAT_CD = 'APPLIED') AS APPLY_COUNT
         FROM TB_ORDER_MSTR M
         INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
         WHERE M.CLIENT_USER_NO = ?
           AND (? = 'ALL' OR M.ORDER_STATUS = ?)
         ORDER BY M.REG_DT DESC`,
        [clientUserNo, statusFilter, statusFilter]
      );

      const orders = orderRows.map((r) => ({
        orderNo: r.ORDER_NO,
        clientUserNo: r.CLIENT_USER_NO,
        orderStatus: r.ORDER_STATUS,
        cleanLargeCd: r.CLEAN_LARGE_CD,
        cleanLargeNm: r.CLEAN_LARGE_CD === 'REGULAR' ? '정기청소' : r.CLEAN_LARGE_CD === 'APPLIANCE' ? '가전청소' : '입주청소',
        cleanMidCd: r.CLEAN_MID_CD,
        cleanMidNm: r.CLEAN_MID_CD,
        detailDesc: r.DETAIL_REQ_NOTE || '',
        addrText: r.ADDR_TEXT,
        addrDetail: r.ADDR_DETAIL || '',
        proposedPrice: Number(r.PROPOSED_PRICE),
        serviceStartDt: r.SERVICE_START_DT,
        bidExpireDt: r.BID_EXPIRE_DT,
        regDt: r.REG_DT,
        applyCount: Number(r.APPLY_COUNT || 0)
      }));

      return {
        status: 200,
        data: {
          success: true,
          code: 'OK',
          data: {
            summary,
            orders
          },
          message: '발주 신청 현황 조회가 완료되었습니다.'
        }
      };
    }
  } catch (dbErr) {
    console.warn('[API_WEB_CLNT_ORD_000] DB 조회 시뮬레이션 폴백:', dbErr.message);
  }

  // 샌드박스 / 오프라인 가상 환경 Fallback
  const allOrders = getMockData(clientUserNo);

  // 7일 지난 발주 건 가상 만료 처리
  const nowMs = Date.now();
  allOrders.forEach((o) => {
    if (o.orderStatus === 'BID_OPEN' && o.bidExpireDt) {
      const expMs = new Date(o.bidExpireDt).getTime();
      if (expMs <= nowMs) {
        o.orderStatus = 'BID_EXPIRED';
      }
    }
  });

  const totalCnt = allOrders.length;
  const bidOpenCnt = allOrders.filter((o) => o.orderStatus === 'BID_OPEN').length;
  const inProgressCnt = allOrders.filter((o) => ['CNTR_CONFIRMED', 'SVC_PROGRESS'].includes(o.orderStatus)).length;
  const completedCnt = allOrders.filter((o) => o.orderStatus === 'SVC_COMPLETED').length;

  const filteredOrders = statusFilter === 'ALL'
    ? allOrders
    : allOrders.filter((o) => o.orderStatus === statusFilter);

  return {
    status: 200,
    data: {
      success: true,
      code: 'OK',
      data: {
        summary: {
          totalCnt,
          bidOpenCnt,
          inProgressCnt,
          completedCnt
        },
        orders: filteredOrders
      },
      message: '발주 신청 현황 조회가 완료되었습니다. (시뮬레이션 모드)'
    }
  };
}

/**
 * Next.js App Router 표준 POST 핸들러
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processWebClntOrd000(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_WEB_CLNT_ORD_000_POST_ERR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '서버 목록 조회 처리 중 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
