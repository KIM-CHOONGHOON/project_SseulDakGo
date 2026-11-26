import { executeQuery } from '../../../../lib/db.ts';

/**
 * [ID: WEB-SRVC-MYP-010200]
 * API: GET /api/srvc/myp/010200
 * 설명: 시공사 회원 탈회 조건 검증 (청약·진행 중인 용역 목록 조회)
 */
export async function processWebSrvcMyp010200(query = {}) {
  const userNo = query?.userNo;
  if (!userNo) {
    return { status: 400, success: false, canWithdraw: false, ongoingList: [], message: 'userNo가 필요합니다.' };
  }

  const ongoingList = await executeQuery(
    `SELECT Q.ORDER_NO AS orderNo, M.ORDER_STATUS_CD AS statusNm
       FROM TB_QUOTE_APPLY Q
       JOIN TB_ORDER_MSTR M ON Q.ORDER_NO = M.ORDER_NO
      WHERE Q.SERVICE_USER_NO = ?
        AND M.ORDER_STATUS_CD NOT IN ('COMPLETED', 'CANCELLED')`,
    [userNo]
  );

  const list = Array.isArray(ongoingList) ? ongoingList : [];
  return {
    status: 200,
    success: true,
    canWithdraw: list.length === 0,
    ongoingList: list,
  };
}
