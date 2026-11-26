import { executeTransaction } from '../../../../lib/db.ts';

/**
 * [ID: WEB-SRVC-QOT-010100]
 * API: POST /api/srvc/qot/010100
 * 설명: 선착순 1개 시공사 단독 청약 신청 (FOR UPDATE 동시성 잠금 + TB_ORDER_MSTR/DTL 상태 전이)
 */
export async function processWebSrvcQot010100(body = {}) {
  const { userNo, orderNo, visitTime = '10:00', workerCount = 1, appealMsg = '' } = body;
  if (!userNo || !orderNo) {
    return { status: 400, success: false, message: 'userNo와 orderNo가 필요합니다.' };
  }

  const result = await executeTransaction(async (conn) => {
    const [users] = await conn.execute(
      `SELECT USER_STAT_CD, USER_NM FROM TB_USER WHERE USER_NO = ?`,
      [userNo]
    );
    const stat = users?.[0]?.USER_STAT_CD;
    if (stat === 'SUSPENDED_8D' || stat === 'PERMANENT_BLOCKED') {
      return { blocked: true, message: '거래 제한 상태에서는 청약할 수 없습니다.' };
    }

    const [orders] = await conn.execute(
      `SELECT M.CLIENT_USER_NO, M.ORDER_STATUS, D.HOPE_CLEAN_DATE, D.ORDER_DTL_NO
         FROM TB_ORDER_MSTR M
         JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
        WHERE M.ORDER_NO = ?
        LIMIT 1
        FOR UPDATE`,
      [orderNo]
    );
    const orderInfo = orders?.[0];
    if (!orderInfo) {
      return { notFound: true, message: '존재하지 않는 발주번호입니다.' };
    }

    if (orderInfo.ORDER_STATUS !== 'BID_OPEN') {
      return {
        duplicate: true,
        message: '이미 다른 시공사가 선착순 청약을 완료한 발주건입니다.',
      };
    }

    const [dup] = await conn.execute(
      `SELECT APPLY_NO FROM TB_QUOTE_APPLY WHERE ORDER_NO = ? AND SERVICE_USER_NO = ? LIMIT 1`,
      [orderNo, userNo]
    );
    if (Array.isArray(dup) && dup.length > 0) {
      return { duplicate: true, message: '이미 청약이 등록된 발주건입니다.' };
    }

    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand5 = String(Math.floor(10000 + Math.random() * 90000));
    const applyNo = `APP${ymd}${rand5}`;

    const hour = Number(String(visitTime).split(':')[0] || 10);
    const timeSlotType = hour < 12 ? 'MORNING' : 'AFTERNOON';

    // 1. TB_QUOTE_APPLY INSERT
    await conn.execute(
      `INSERT INTO TB_QUOTE_APPLY (
         APPLY_NO, ORDER_NO, ORDER_DTL_NO, SERVICE_USER_NO,
         PROPOSED_DATE, TIME_SLOT_TYPE, START_TIME, WORK_HOURS,
         ASSIGN_STAFF_CNT, APPEAL_MSG, APPLY_STAT_CD, REG_ID, MOD_ID
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPLIED', ?, ?)`,
      [
        applyNo,
        orderNo,
        orderInfo.ORDER_DTL_NO,
        userNo,
        orderInfo.HOPE_CLEAN_DATE,
        timeSlotType,
        String(visitTime).slice(0, 5),
        4.0,
        Number(workerCount) || 1,
        appealMsg || '성실 시공하겠습니다.',
        userNo,
        userNo,
      ]
    );

    // 2. TB_ORDER_MSTR 상태 전이 (BID_OPEN -> CNTR_WAIT_FEE)
    await conn.execute(
      `UPDATE TB_ORDER_MSTR
          SET ORDER_STATUS = 'CNTR_WAIT_FEE'
        WHERE ORDER_NO = ?`,
      [orderNo]
    );

    // 3. TB_ORDER_DTL 상태 전이 (WAIT_BID -> APPR_WAIT_FEE) 및 선착순 시공사 배정
    await conn.execute(
      `UPDATE TB_ORDER_DTL
          SET SERVICE_STATUS = 'APPR_WAIT_FEE',
              SELECTED_SERVICE_USER_NO = ?,
              MOD_ID = ?
        WHERE ORDER_DTL_NO = ?`,
      [userNo, userNo, orderInfo.ORDER_DTL_NO]
    );

    // 4. TB_USER_NOTIFICATION 고객 알림 INSERT
    const notiId = `NT${ymd}${String(Math.floor(10000 + Math.random() * 90000))}`;
    await conn.execute(
      `INSERT INTO TB_USER_NOTIFICATION (
         NOTI_ID, USER_NO, NOTI_TYPE, TITLE, CONTENT, IS_READ
       ) VALUES (?, ?, 'QUOTE', ?, ?, 'N')`,
      [
        notiId,
        orderInfo.CLIENT_USER_NO,
        `[청약 접수] ${orderNo} 신규 청약이 도착했습니다.`,
        `시공사(${users?.[0]?.USER_NM || userNo})가 ${visitTime} 방문(투입 ${workerCount}명)으로 청약을 신청했습니다.`,
      ]
    );

    return { blocked: false, applyNo };
  });

  if (result.blocked) {
    return { status: 403, success: false, message: result.message };
  }
  if (result.duplicate) {
    return { status: 409, success: false, message: result.message };
  }
  if (result.notFound) {
    return { status: 404, success: false, message: result.message };
  }

  return {
    status: 200,
    success: true,
    applyNo: result.applyNo,
    message: '확정가 청약 신청이 완료되었습니다.',
  };
}
