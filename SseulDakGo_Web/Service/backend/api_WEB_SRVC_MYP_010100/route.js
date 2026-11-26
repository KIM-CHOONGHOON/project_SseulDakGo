import { executeQuery, executeTransaction } from '../../../../lib/db.ts';

/**
 * [ID: WEB-SRVC-MYP-010100]
 * API: GET/PATCH /api/srvc/myp/010100
 * 설명: 시공사 내정보 및 서비스 활동 지역(최대 10개) 조회/수정
 */
export async function processWebSrvcMyp010100(body = {}, query = {}, method = 'GET') {
  const userNo = query?.userNo || body?.userNo;
  if (!userNo) {
    return { status: 400, success: false, message: 'userNo가 필요합니다.' };
  }

  if (method === 'GET') {
    const users = await executeQuery(
      `SELECT USER_NO, USER_NM, USER_EMAIL, USER_TEL, USER_ROLE_CD, USER_STAT_CD
         FROM TB_USER
        WHERE USER_NO = ?`,
      [userNo]
    );
    const regions = await executeQuery(
      `SELECT REGION_NM
         FROM TB_SERVICE_REGION
        WHERE USER_NO = ?
        ORDER BY REGION_SEQ ASC`,
      [userNo]
    );
    return {
      status: 200,
      success: true,
      profile: users?.[0] || null,
      regions: (regions || []).map((r) => r.REGION_NM),
    };
  }

  if (method === 'PATCH') {
    const regions = Array.isArray(body?.regions) ? body.regions.slice(0, 10) : null;
    if (regions) {
      await executeTransaction(async (conn) => {
        await conn.execute('DELETE FROM TB_SERVICE_REGION WHERE USER_NO = ?', [userNo]);
        for (let i = 0; i < regions.length; i += 1) {
          await conn.execute(
            'INSERT INTO TB_SERVICE_REGION (USER_NO, REGION_SEQ, REGION_NM) VALUES (?, ?, ?)',
            [userNo, i + 1, regions[i]]
          );
        }
      });
    }
    return { status: 200, success: true, regions: regions || [] };
  }

  return { status: 405, success: false, message: 'Method Not Allowed' };
}
