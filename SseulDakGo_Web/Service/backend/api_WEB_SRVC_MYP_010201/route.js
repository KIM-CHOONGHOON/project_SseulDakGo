import { executeTransaction } from '../../../../lib/db.ts';

/**
 * [ID: WEB-SRVC-MYP-010201]
 * API: PATCH /api/srvc/myp/010201
 * 설명: 시공사 회원 탈회 최종 확인 처리 (USER_STAT_CD = 'WITHDRAWN', USER_TEL/USER_EMAIL NULL 처리)
 */
export async function processWebSrvcMyp010201(body = {}) {
  const userNo = body?.userNo;
  if (!userNo) {
    return { status: 400, success: false, message: 'userNo가 필요합니다.' };
  }

  const result = await executeTransaction(async (conn) => {
    const [ongoing] = await conn.execute(
      `SELECT Q.ORDER_NO
         FROM TB_QUOTE_APPLY Q
         JOIN TB_ORDER_MSTR M ON Q.ORDER_NO = M.ORDER_NO
        WHERE Q.SERVICE_USER_NO = ?
          AND M.ORDER_STATUS_CD NOT IN ('COMPLETED', 'CANCELLED')`,
      [userNo]
    );
    if (Array.isArray(ongoing) && ongoing.length > 0) {
      return { blocked: true };
    }

    await conn.execute(
      `UPDATE TB_USER
          SET USER_STAT_CD = 'WITHDRAWN',
              USER_TEL = NULL,
              USER_EMAIL = NULL
        WHERE USER_NO = ?
          AND USER_STAT_CD <> 'WITHDRAWN'`,
      [userNo]
    );

    await conn.execute(
      `UPDATE TB_USER_SESSION
          SET IS_ACTIVE = 'N'
        WHERE USER_NO = ?`,
      [userNo]
    );

    return { blocked: false };
  });

  if (result.blocked) {
    return { status: 409, success: false, message: '진행 중인 용역이 있어 탈회가 불가합니다.' };
  }

  return { status: 200, success: true, message: '회원 탈회가 완료되었습니다.' };
}
