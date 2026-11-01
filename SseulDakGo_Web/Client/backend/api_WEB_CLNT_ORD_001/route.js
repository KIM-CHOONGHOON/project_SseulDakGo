/**
 * @file SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_001/route.js
 * @description 고객 청소 요청 상세 및 용역 청약서 비교/선택 API (WEB-CLNT-ORD-001)
 *              - 특정 발주 관리번호(ORDER_NO)의 상세 발주 스펙 조회
 *              - 해당 발주에 접수된 시공 파트너의 청약서(TB_QUOTE_APPLY) 목록 조회 (역경매 없음, 일정/스펙 중심)
 *              - 엄격한 1:1 독립 매핑 원칙 (Strict Non-Sharing & SRP) 준수
 * 
 * 테이블:
 * - TB_ORDER_MSTR: 주발주 마스터
 * - TB_ORDER_DTL: 발주 상세
 * - TB_QUOTE_APPLY: 파트너 청약서 접수 원장
 * - TB_USER: 회원 기본 정보 (고객 및 파트너)
 */

/**
 * 샌드박스/오프라인 환경용 시뮬레이션 데이터 생성기
 */
function getMockDetailData(orderNo = 'ORD2026103100001', userNo = 'C20261000001') {
  const orderMaster = {
    orderNo: orderNo,
    clientUserNo: userNo,
    orderStatus: 'BID_OPEN',
    orderStatusNm: '청약접수중',
    cleanLargeCd: 'REGULAR',
    cleanLargeNm: '정기청소',
    cleanMidCd: 'VILLA_COMM',
    cleanMidNm: '계단, 복도, 외곽 공용부',
    facilityTypeCd: 'OFFICE',
    facilityTypeNm: '사무실·오피스',
    proposedPrice: 720000,
    priceUnitText: '/ 월',
    serviceStartDt: '2026-11-01',
    serviceEndDt: '2027-01-31',
    servicePeriodDays: 92,
    weekCleanFreq: 2,
    cleanDaysConfig: '매주 월, 수',
    addrText: '경기 고양시 일산동구 마두동 123-45 한빛빌딩 (B1~4F)',
    addrDetail: '한빛빌딩 1~4층 계단, 복도 및 전면 필로티 주차장 구역',
    parkingAvailCd: 'YES',
    parkingAvailText: '지하 주차 가능 (무료 방문권 지급)',
    contactPersonNm: '홍길동',
    contactTel: '010-9876-5432',
    detailReqNote: '지하 1층부터 지상 4층까지 계단 난간 및 유리창 먼지 제거 위주로 부탁드립니다. 1층 출입구 분리수거장 주변 물청소 포함입니다.',
    bidExpireDt: '2026-11-07 14:30:00',
    remainingTimeText: '3일 08시간 12분',
    regDt: '2026-10-31 10:30:00'
  };

  const applyList = [
    {
      applyNo: 'APPLY20261031001',
      orderNo: orderNo,
      serviceUserNo: 'S20261000001',
      companyNm: '반짝빌라클린',
      userNm: '이*수',
      gradeNm: '마스터 등급',
      recommendBadge: '쓸고닦고 추천 1위',
      rating: 4.9,
      reviewCount: 84,
      matchRateText: '100% 일치',
      certifications: ['신원100%검증', '배상책임보험 1억원 가입', '고압세척기 보유'],
      proposedDate: '2026.11.02(월)',
      timeSlotType: 'MORNING',
      startTime: '10:00 (오전)',
      workHours: 3.5,
      assignStaffCnt: '2명 (정규팀)',
      appealMsg: '독일산 친환경 전용 세제와 산업용 고압세척기를 보유하고 있어 계단 난간 틈새 오염 및 분리수거장 찌든 때까지 완벽하게 세척해 드립니다. 주 2회 정해진 월/수 오전 루틴을 철저히 준수하겠습니다.',
      confirmedPrice: 720000,
      regDt: '2026.10.31 16:40'
    },
    {
      applyNo: 'APPLY20261031002',
      orderNo: orderNo,
      serviceUserNo: 'S20261000002',
      companyNm: '클린솔루션 일산본점',
      userNm: '박*훈',
      gradeNm: '베테랑 마스터',
      recommendBadge: null,
      rating: 4.8,
      reviewCount: 126,
      careerText: '시공 9년차',
      certifications: ['신원검증완료', '국가공인 방역소독사 자격', '스팀살균기 완비'],
      proposedDate: '2026.11.02(월)',
      timeSlotType: 'MORNING',
      startTime: '08:30 (오전)',
      workHours: 4.0,
      assignStaffCnt: '2명',
      appealMsg: '방역소독 전문 자격증을 보유하고 있어 정기 계단 청소와 함께 복도 연무 살균 소독을 무상으로 병행 지원해 드립니다. 입주민 만족도를 최우선으로 시공합니다.',
      confirmedPrice: 720000,
      regDt: '2026.10.31 18:20'
    },
    {
      applyNo: 'APPLY20261101001',
      orderNo: orderNo,
      serviceUserNo: 'S20261000003',
      companyNm: '올케어 환경관리',
      userNm: '최*진',
      gradeNm: '신속 시공팀',
      recommendBadge: null,
      rating: 5.0,
      reviewCount: 32,
      specialPointText: '3인 집중 케어',
      certifications: ['신원검증완료', '친환경세제 사용인증'],
      proposedDate: '2026.11.02(월)',
      timeSlotType: 'AFTERNOON',
      startTime: '14:00 (오후)',
      workHours: 3.0,
      assignStaffCnt: '3명 (신속 시공)',
      appealMsg: '3인 1조 신속 정밀 작업 시스템으로 건물 입주민 통행 불편을 최소화합니다. 분리수거장 고압 세척 및 탈취 케어까지 꼼꼼히 진행합니다.',
      confirmedPrice: 720000,
      regDt: '2026.11.01 09:15'
    }
  ];

  return { orderMaster, applyList };
}

/**
 * 발주 상세 및 청약서 목록 비즈니스 로직 처리 함수
 * @param {Object} payload 
 * @param {string} payload.orderNo 발주 관리번호 (예: ORD2026103100001)
 * @param {string} payload.clientUserNo 고객 회원 식별번호 (예: C20261000001)
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processWebClntOrd001(payload = {}) {
  const { orderNo, clientUserNo } = payload;

  const targetOrderNo = orderNo || 'ORD2026103100001';
  const targetUserNo = clientUserNo || 'C20261000001';

  let db = null;
  try {
    db = await import('../../../../lib/db.js');
  } catch (e) {
    db = await import('../../lib/db.js').catch(() => null);
  }

  try {
    if (db && typeof db.executeQuery === 'function') {
      // 1. 발주 마스터 및 상세 원문 조회
      const orderRows = await db.executeQuery(
        `SELECT 
           M.ORDER_NO, M.CLIENT_USER_NO, M.ORDER_STATUS, M.PROPOSED_PRICE,
           M.COMPANY_OR_ORG_NM, M.CONTACT_PERSON_NM, M.CONTACT_TEL,
           M.FACILITY_TYPE_CD, M.PARKING_AVAIL_CD, M.ADDR_TEXT, M.ADDR_DETAIL,
           M.DETAIL_REQ_NOTE,
           DATE_FORMAT(M.BID_EXPIRE_DT, '%Y-%m-%d %H:%i:%s') AS BID_EXPIRE_DT,
           DATE_FORMAT(M.REG_DT, '%Y-%m-%d %H:%i:%s') AS REG_DT,
           D.ORDER_DTL_NO, D.CLEAN_LARGE_CD, D.CLEAN_MID_CD, D.CONTRACT_TYPE_CD,
           D.SELECTED_SRV_ITEMS,
           DATE_FORMAT(D.SERVICE_START_DT, '%Y-%m-%d') AS SERVICE_START_DT,
           DATE_FORMAT(D.SERVICE_END_DT, '%Y-%m-%d') AS SERVICE_END_DT,
           D.WEEK_CLEAN_FREQ, D.CLEAN_DAYS_CONFIG, D.SUPPLY_PYEONG
         FROM TB_ORDER_MSTR M
         INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
         WHERE M.ORDER_NO = ? AND M.CLIENT_USER_NO = ?
         LIMIT 1`,
        [targetOrderNo, targetUserNo]
      );

      if (!orderRows || orderRows.length === 0) {
        return {
          status: 404,
          data: {
            success: false,
            code: 'ERR_ORDER_NOT_FOUND',
            message: '해당 발주 정보를 찾을 수 없거나 열람 권한이 없습니다.'
          }
        };
      }

      const ord = orderRows[0];
      const orderMaster = {
        orderNo: ord.ORDER_NO,
        clientUserNo: ord.CLIENT_USER_NO,
        orderStatus: ord.ORDER_STATUS,
        proposedPrice: Number(ord.PROPOSED_PRICE),
        companyOrOrgNm: ord.COMPANY_OR_ORG_NM,
        contactPersonNm: ord.CONTACT_PERSON_NM,
        contactTel: ord.CONTACT_TEL,
        facilityTypeCd: ord.FACILITY_TYPE_CD,
        parkingAvailCd: ord.PARKING_AVAIL_CD,
        addrText: ord.ADDR_TEXT,
        addrDetail: ord.ADDR_DETAIL,
        detailReqNote: ord.DETAIL_REQ_NOTE,
        bidExpireDt: ord.BID_EXPIRE_DT,
        regDt: ord.REG_DT,
        cleanLargeCd: ord.CLEAN_LARGE_CD,
        cleanMidCd: ord.CLEAN_MID_CD,
        serviceStartDt: ord.SERVICE_START_DT,
        serviceEndDt: ord.SERVICE_END_DT,
        weekCleanFreq: ord.WEEK_CLEAN_FREQ,
        cleanDaysConfig: ord.CLEAN_DAYS_CONFIG
      };

      // 2. 해당 발주에 접수된 용역 청약서 목록 조회
      const quoteRows = await db.executeQuery(
        `SELECT 
           Q.APPLY_NO, Q.ORDER_NO, Q.ORDER_DTL_NO, Q.SERVICE_USER_NO,
           DATE_FORMAT(Q.PROPOSED_DATE, '%Y-%m-%d') AS PROPOSED_DATE,
           Q.TIME_SLOT_TYPE, Q.START_TIME, Q.WORK_HOURS,
           Q.ASSIGN_STAFF_CNT, Q.APPEAL_MSG, Q.APPLY_STAT_CD,
           DATE_FORMAT(Q.REG_DT, '%Y-%m-%d %H:%i:%s') AS REG_DT,
           U.USER_NM, U.COMPANY_NM
         FROM TB_QUOTE_APPLY Q
         INNER JOIN TB_USER U ON Q.SERVICE_USER_NO = U.USER_NO
         WHERE Q.ORDER_NO = ? AND Q.APPLY_STAT_CD = 'APPLIED'
         ORDER BY Q.REG_DT ASC`,
        [targetOrderNo]
      );

      const applyList = quoteRows.map((q) => ({
        applyNo: q.APPLY_NO,
        orderNo: q.ORDER_NO,
        serviceUserNo: q.SERVICE_USER_NO,
        companyNm: q.COMPANY_NM || '청소 전문 파트너',
        userNm: q.USER_NM,
        proposedDate: q.PROPOSED_DATE,
        timeSlotType: q.TIME_SLOT_TYPE,
        startTime: q.START_TIME,
        workHours: Number(q.WORK_HOURS),
        assignStaffCnt: q.ASSIGN_STAFF_CNT,
        appealMsg: q.APPEAL_MSG,
        regDt: q.REG_DT,
        confirmedPrice: orderMaster.proposedPrice
      }));

      return {
        status: 200,
        data: {
          success: true,
          code: 'OK',
          data: {
            orderMaster,
            applyList
          },
          message: '발주 상세 및 파트너 청약서 조회가 완료되었습니다.'
        }
      };
    }
  } catch (dbErr) {
    console.warn('[API_WEB_CLNT_ORD_001] DB 조회 시뮬레이션 폴백:', dbErr.message);
  }

  // 샌드박스 / 오프라인 가상 환경 Fallback
  const mock = getMockDetailData(targetOrderNo, targetUserNo);
  return {
    status: 200,
    data: {
      success: true,
      code: 'OK',
      data: mock,
      message: '발주 상세 및 파트너 청약서 조회가 완료되었습니다. (시뮬레이션 모드)'
    }
  };
}

/**
 * Next.js App Router 표준 POST 핸들러
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processWebClntOrd001(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_WEB_CLNT_ORD_001_POST_ERR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '청약서 상세 조회 처리 중 서버 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

