import { executeQuery } from '../../../../lib/db.ts';

/**
 * [ID: WEB-SRVC-QOT-020200]
 * API: GET /api/srvc/qot/020200?userNo=...&orderNo=...
 * 설명: 시공사 청약진행상태 및 청소 요청 상세 조회
 *       - 이용자 청약 승인 전(isApproved=false): 시/도/시군구까지만 부분 출력, 상세주소·연락처 비공개
 *       - 이용자 청약 승인 후(isApproved=true): 전체 상세주소 및 연락처 전체 출력
 */
export async function processWebSrvcQot020200(query = {}) {
  const { userNo, orderNo } = query;
  if (!userNo || !orderNo) {
    return { status: 400, success: false, message: 'userNo와 orderNo가 필요합니다.' };
  }

  const rows = await executeQuery(
    `SELECT M.ORDER_NO,
            M.ORDER_STATUS,
            M.PROPOSED_PRICE,
            M.ADDR_TEXT,
            M.ADDR_DETAIL,
            M.CONTACT_PERSON_NM,
            M.CONTACT_TEL,
            D.CLEAN_LARGE_CD,
            D.SELECTED_SRV_ITEMS,
            D.SUPPLY_PYEONG,
            Q.APPLY_STAT_CD,
            Q.START_TIME,
            Q.ASSIGN_STAFF_CNT
       FROM TB_ORDER_MSTR M
       JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
       LEFT JOIN TB_QUOTE_APPLY Q
         ON M.ORDER_NO = Q.ORDER_NO AND Q.SERVICE_USER_NO = ?
      WHERE M.ORDER_NO = ?
      LIMIT 1`,
    [userNo, orderNo]
  );

  const row = rows?.[0];
  if (!row) {
    return { status: 200, success: true, detail: null };
  }

  const approvedStatuses = new Set(['CNTR_CONFIRMED', 'SVC_PROGRESS', 'SVC_COMPLETED', 'SETTL_COMPLETED']);
  const isApproved = row.APPLY_STAT_CD === 'ACCEPTED' || approvedStatuses.has(row.ORDER_STATUS);

  const catMap = { REGULAR: '정기청소', MOVEIN: '입주청소', APPLIANCE: '계절가전청소' };
  const shortAddr = String(row.ADDR_TEXT || '').split(/\s+/).slice(0, 3).join(' ');

  return {
    status: 200,
    success: true,
    detail: {
      orderNo: row.ORDER_NO,
      isApproved,
      statusLabel: isApproved ? '고객 승인 완료 (계약 확정)' : '청약 접수중 (고객 승인 대기)',
      category: catMap[row.CLEAN_LARGE_CD] || '입주청소',
      fixedPrice: row.PROPOSED_PRICE,
      shortAddr,
      addrText: isApproved ? row.ADDR_TEXT : shortAddr,
      addrDetail: isApproved ? row.ADDR_DETAIL : null,
      contactPersonNm: isApproved ? row.CONTACT_PERSON_NM : null,
      contactTel: isApproved ? row.CONTACT_TEL : null,
      cleanScope: row.SELECTED_SRV_ITEMS || (row.SUPPLY_PYEONG ? `공급 ${row.SUPPLY_PYEONG}평형` : '청소 요청 상세'),
    },
  };
}
