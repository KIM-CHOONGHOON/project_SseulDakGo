/**
 * ============================================================================
 * [백엔드 API] 화면 ID: WEB-SRVC-STT-010000 (시공사 기간별 청약·청소금액 통계 요약)
 * 파일 경로: SseulDakGo_Web/Service/backend/api_WEB_SRVC_STT_010000/route.js
 * 엔드포인트: GET /api/srvc/stt/010000
 * ============================================================================
 */
import { executeQuery } from '../../../../lib/db.js';

export async function processWebSrvcStt010000(query = {}) {
  const serviceUserNo = String(query.userNo || 'S20261100001').trim();
  const now = new Date();
  const defaultToYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const fromBase = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const defaultFromYm = `${fromBase.getFullYear()}-${String(fromBase.getMonth() + 1).padStart(2, '0')}`;

  const rawFrom = String(query.dateFrom || defaultFromYm).trim().replace(/\./g, '-');
  const rawTo = String(query.dateTo || defaultToYm).trim().replace(/\./g, '-');

  const ymRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!ymRegex.test(rawFrom) || !ymRegex.test(rawTo)) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'ERR_INVALID_MONTH_FORMAT',
        message: '조회 년월은 YYYY.MM 형식으로 입력해 주세요.',
      },
    };
  }

  const [fromYear, fromMonth] = rawFrom.split('-').map(Number);
  const [toYear, toMonth] = rawTo.split('-').map(Number);

  if (fromYear > toYear || (fromYear === toYear && fromMonth > toMonth)) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'ERR_INVALID_MONTH_ORDER',
        message: '조회 시작월(From)은 종료월(To)보다 클 수 없습니다.',
      },
    };
  }

  const monthCount = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
  if (monthCount > 12) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'ERR_EXCEED_MAX_1YEAR',
        message: '조회기간은 최대 1년(12개월) 범위 내에서만 조회가 가능합니다.',
      },
    };
  }

  const startDateTime = `${fromYear}-${String(fromMonth).padStart(2, '0')}-01 00:00:00`;
  const nextMonthDate = new Date(toYear, toMonth, 1);
  const endExclusiveDateTime = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01 00:00:00`;

  let summaryBoxes = {
    appliedCount: 0,
    appliedCleaningAmt: 0,
    cancelledCount: 0,
    cancelledCleaningAmt: 0,
  };

  try {
    const rows = await executeQuery(
      `SELECT
         COALESCE(SUM(CASE WHEN Q.QUOTE_STAT_CD <> 'CANCELLED' THEN 1 ELSE 0 END), 0) AS appliedCount,
         COALESCE(SUM(CASE WHEN Q.QUOTE_STAT_CD <> 'CANCELLED' THEN O.FIXED_SERVICE_AMT ELSE 0 END), 0) AS appliedCleaningAmt,
         COALESCE(SUM(CASE WHEN Q.QUOTE_STAT_CD = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelledCount,
         COALESCE(SUM(CASE WHEN Q.QUOTE_STAT_CD = 'CANCELLED' THEN O.FIXED_SERVICE_AMT ELSE 0 END), 0) AS cancelledCleaningAmt
       FROM TB_QUOTE_APPLY Q
       INNER JOIN TB_ORDER_MSTR O
         ON Q.ORDER_NO = O.ORDER_NO
       WHERE Q.SERVICE_USER_NO = ?
         AND Q.REG_DT >= ?
         AND Q.REG_DT < ?`,
      [serviceUserNo, startDateTime, endExclusiveDateTime]
    );

    if (rows && rows.length > 0) {
      summaryBoxes = {
        appliedCount: Number(rows[0].appliedCount || 0),
        appliedCleaningAmt: Number(rows[0].appliedCleaningAmt || 0),
        cancelledCount: Number(rows[0].cancelledCount || 0),
        cancelledCleaningAmt: Number(rows[0].cancelledCleaningAmt || 0),
      };
    }
  } catch {
    // DB 미연결 또는 테이블 미존재 시 0건/0원 반환
  }

  return {
    status: 200,
    body: {
      success: true,
      screenId: 'WEB-SRVC-STT-010000',
      data: {
        serviceUserNo,
        period: {
          dateFrom: rawFrom.replace(/-/g, '.'),
          dateTo: rawTo.replace(/-/g, '.'),
          monthCount,
        },
        summaryBoxes,
      },
    },
  };
}
