/**
 * ============================================================================
 * [백엔드 API] 화면 ID: WEB-CLNT-COM-010200 (고객 전용 홈 대시보드)
 * 파일 경로: SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010200/route.js
 * 엔드포인트: GET /api/clnt/com/010200
 * ============================================================================
 */
import { executeQuery } from '../../../../lib/db.js';

const DEFAULT_STATUS_OPTIONS = [
  { code: 'ALL', label: '전체 (ALL)' },
  { code: 'REQ_APPLY', label: '청소 청약 (REQ_APPLY)' },
  { code: 'APPLY_CMPL', label: '단독 청약 접수 완료 (APPLY_CMPL)' },
  { code: 'PAY_WAIT', label: '1차 이용료 결제대기 (PAY_WAIT)' },
  { code: 'JOB_ING', label: '시공 확정/진행중 (JOB_ING)' },
  { code: 'JOB_INSPECT', label: '시공 사진 검수/승인대기 (JOB_INSPECT)' },
  { code: 'JOB_CMPL', label: '시공 완료 (JOB_CMPL)' },
  { code: 'ORDER_CANCEL', label: '발주 취소 (ORDER_CANCEL)' },
];

const DEFAULT_PRICE_GUIDES = {
  REGULAR: { minAmt: 240000, maxAmt: 300000, defaultAmt: 270000 },
  APPLIANCE: { minAmt: 90000, maxAmt: 190000, defaultAmt: 150000 },
  MOVEOUT: { minAmt: 300000, maxAmt: 450000, defaultAmt: 350000 },
};

const SEED_ORDERS = [
  {
    orderNo: 'ORD-202611-0082',
    cleanCatCd: 'MOVEOUT',
    cleanCatNm: '입주·이사 청소',
    orderStatCd: 'APPLY_CMPL',
    orderStatNm: '단독 청약 접수 완료',
    locationSummary: '경기 고양시 덕양구 화정동 · 32평형 (방3/화2)',
    scheduleSummary: '희망일: 2026.11.20 (금) 오전',
    fixedServiceAmt: 380000,
    photoCount: 0,
    matchingInfo: {
      hasQuote: true,
      companyNm: '(주)클린파워 시공마스터',
      teamNm: '입주클린 1팀',
      teamLeaderNm: '박준영 마스터',
      safeTelService: null,
      ceoTel: null,
      teamLeaderTel: null,
    },
  },
  {
    orderNo: 'ORD-202611-0079',
    cleanCatCd: 'APPLIANCE',
    cleanCatNm: '계절가전 분해케어',
    orderStatCd: 'PAY_WAIT',
    orderStatNm: '1차 이용료 결제대기',
    locationSummary: '경기 고양시 일산동구 마두동 · 시스템에어컨 2대 분해살균',
    scheduleSummary: '희망일: 2026.11.23 (월) 14:00',
    fixedServiceAmt: 180000,
    photoCount: 0,
    matchingInfo: {
      hasQuote: true,
      companyNm: '한결홈케어',
      teamNm: '가전케어 전담팀',
      teamLeaderNm: '이민호 마스터',
      safeTelService: null,
      ceoTel: null,
      teamLeaderTel: null,
    },
  },
  {
    orderNo: 'ORD-202611-0065',
    cleanCatCd: 'REGULAR',
    cleanCatNm: '정기청소 (3개월 계약)',
    orderStatCd: 'JOB_INSPECT',
    orderStatNm: '시공 사진 검수요청',
    locationSummary: '서울 서대문구 창천동 · 빌라 계단·주차장 1회차 완료',
    scheduleSummary: '현장 전·후 검수사진 8장 등록 완료',
    fixedServiceAmt: 270000,
    photoCount: 8,
    matchingInfo: {
      hasQuote: true,
      companyNm: '(주)클린파워 시공마스터',
      teamNm: '정기관리 1팀',
      teamLeaderNm: '박준영 마스터',
      safeTelService: '0507-1330-8841',
      ceoTel: '010-4210-8841',
      teamLeaderTel: '010-9120-5512',
    },
  },
];

function buildCtaAction(statCd) {
  switch (statCd) {
    case 'APPLY_CMPL':
      return { type: 'SELECT_CONTRACTOR', label: '청약 시공사 확인·선택', targetScreenId: 'WEB-CLNT-ORD-010100' };
    case 'PAY_WAIT':
      return { type: 'PAY_DATA_FEE', label: '데이터 이용료 16,500원 결제', feeAmt: 16500, targetScreenId: 'WEB-CLNT-PAY-010000' };
    case 'JOB_INSPECT':
      return { type: 'INSPECT_JOB', label: '전·후 사진 검수 및 완료 확정', targetScreenId: 'WEB-CLNT-JOB-010000' };
    case 'JOB_ING':
      return { type: 'VIEW_PROGRESS', label: '진행상황 확인', targetScreenId: 'WEB-CLNT-JOB-010000' };
    case 'JOB_CMPL':
      return { type: 'VIEW_RECEIPT', label: '완료 증빙서류', targetScreenId: 'WEB-CLNT-ORD-010100' };
    default:
      return { type: 'VIEW_DETAIL', label: '발주 상세 조회', targetScreenId: 'WEB-CLNT-ORD-010100' };
  }
}

export async function processWebClntCom010200(query = {}) {
  const userNo = String(query.userNo || 'C20261100001').trim();
  const orderStatus = String(query.orderStatus || 'REQ_APPLY').trim();
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = 10;

  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const defaultFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const rawFrom = String(query.dateFrom || defaultFrom).replace(/\./g, '-');
  const rawTo = String(query.dateTo || defaultTo).replace(/\./g, '-');

  const fromDate = new Date(rawFrom);
  const toDate = new Date(rawTo);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'ERR_INVALID_DATE_RANGE',
        message: '조회기간은 최대 1년(365일) 범위 내에서만 조회가 가능합니다.',
      },
    };
  }

  const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 365) {
    return {
      status: 400,
      body: {
        success: false,
        code: 'ERR_INVALID_DATE_RANGE',
        message: '조회기간은 최대 1년(365일) 범위 내에서만 조회가 가능합니다.',
      },
    };
  }

  let clientProfile = {
    userNo,
    userNm: '김충훈',
    roleLabel: '일반 회원 (C)',
    badgeLabel: '안심회원',
    unreadNotiCnt: 0,
    defaultAddress: '경기 고양시 덕양구 화정동',
  };

  let statusOptions = DEFAULT_STATUS_OPTIONS;
  let orders = [];
  let totalItems = 0;

  try {
    const userRows = await executeQuery(
      `SELECT USER_NO, USER_NM, USER_ROLE_CD, USER_STAT_CD
         FROM TB_USER
        WHERE USER_NO = ? AND USER_ROLE_CD = 'C'
        LIMIT 1`,
      [userNo]
    );
    if (userRows && userRows.length > 0) {
      clientProfile.userNm = userRows[0].USER_NM || clientProfile.userNm;
      clientProfile.badgeLabel = userRows[0].USER_STAT_CD === 'NORMAL' ? '안심회원' : '일반회원';
    }

    const notiRows = await executeQuery(
      `SELECT COUNT(*) AS unreadNotiCnt
         FROM TB_USER_NOTIFICATION
        WHERE USER_NO = ?
          AND (READ_YN = 'N' OR IS_READ = 'N')
          AND NOTI_TYPE IN ('QUOTE_APPLY', 'PAY_COMPLETE', 'ORDER_CANCEL', 'BID_APPLY', 'PAYMENT_COMPLETE', 'BID_CANCEL')`,
      [userNo]
    ).catch(() => []);
    if (notiRows && notiRows.length > 0) {
      clientProfile.unreadNotiCnt = Number(notiRows[0].unreadNotiCnt || 0);
    }

    const codeRows = await executeQuery(
      `SELECT COM_CD AS code, COM_NM AS label
         FROM TB_COM_CODE
        WHERE CODE_GRP_CD = 'ORDER_STATUS' AND USE_YN = 'Y'
        ORDER BY SORT_ORD ASC`
    ).catch(() => []);
    if (codeRows && codeRows.length > 0) {
      statusOptions = [{ code: 'ALL', label: '전체 (ALL)' }, ...codeRows];
    }

    const statusCond = orderStatus === 'ALL' ? '' : 'AND M.ORDER_STATUS = ?';
    const params = orderStatus === 'ALL'
      ? [userNo, `${rawFrom} 00:00:00`, `${rawTo} 23:59:59`]
      : [userNo, `${rawFrom} 00:00:00`, `${rawTo} 23:59:59`, orderStatus];

    const countRows = await executeQuery(
      `SELECT COUNT(*) AS cnt
         FROM TB_ORDER_MSTR M
        WHERE M.CLIENT_USER_NO = ?
          AND M.REG_DT BETWEEN ? AND ?
          ${statusCond}`,
      params
    ).catch(() => []);
    totalItems = Number(countRows?.[0]?.cnt || 0);

    if (totalItems > 0) {
      const offset = (page - 1) * pageSize;
      const orderRows = await executeQuery(
        `SELECT M.ORDER_NO, M.CLEAN_LARGE_CD, M.ORDER_STATUS, M.ADDR_TEXT, M.PROPOSED_PRICE,
                M.HOPE_DT, M.SAFE_TEL_SERVICE
           FROM TB_ORDER_MSTR M
          WHERE M.CLIENT_USER_NO = ?
            AND M.REG_DT BETWEEN ? AND ?
            ${statusCond}
          ORDER BY M.REG_DT DESC
          LIMIT 10 OFFSET ?`,
        [...params, offset]
      );
      const confirmedSet = new Set(['CONTRACT_CONFIRMED', 'IN_PROGRESS', 'SVC_COMPLETED', 'DONE', 'JOB_ING', 'JOB_INSPECT', 'JOB_CMPL']);
      orders = (orderRows || []).map((r) => {
        const stat = r.ORDER_STATUS || 'REQ_APPLY';
        const isConfirmed = confirmedSet.has(stat);
        return {
          orderNo: r.ORDER_NO,
          cleanCatCd: r.CLEAN_LARGE_CD || 'MOVEOUT',
          cleanCatNm: r.CLEAN_LARGE_CD === 'REGULAR' ? '정기청소 (3개월 계약)' : r.CLEAN_LARGE_CD === 'APPLIANCE' ? '계절가전 분해케어' : '입주·이사 청소',
          orderStatCd: stat,
          orderStatNm: stat,
          locationSummary: r.ADDR_TEXT || '',
          scheduleSummary: r.HOPE_DT ? `희망일: ${String(r.HOPE_DT).slice(0, 10)}` : '',
          fixedServiceAmt: Number(r.PROPOSED_PRICE || 0),
          photoCount: 0,
          matchingInfo: {
            hasQuote: false,
            companyNm: null,
            teamNm: null,
            teamLeaderNm: null,
            safeTelService: isConfirmed ? (r.SAFE_TEL_SERVICE || null) : null,
            ceoTel: null,
            teamLeaderTel: null,
          },
          ctaAction: buildCtaAction(stat),
        };
      });
    }
  } catch {
    // DB 미연결 시 기본 시드 데이터 반환
  }

  if (orders.length === 0) {
    const filtered = orderStatus === 'ALL'
      ? SEED_ORDERS
      : SEED_ORDERS.filter((o) => o.orderStatCd === orderStatus);
    const list = filtered.length > 0 ? filtered : SEED_ORDERS;
    totalItems = list.length;
    orders = list.slice((page - 1) * pageSize, page * pageSize).map((o) => ({
      ...o,
      ctaAction: buildCtaAction(o.orderStatCd),
    }));
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return {
    status: 200,
    body: {
      success: true,
      screenId: 'WEB-CLNT-COM-010200',
      data: {
        clientProfile,
        filterMeta: {
          dateFrom: rawFrom.replace(/-/g, '.'),
          dateTo: rawTo.replace(/-/g, '.'),
          selectedStatus: orderStatus,
          statusOptions,
        },
        pagination: {
          currentPage: page,
          pageSize,
          totalItems,
          totalPages,
          startItem,
          endItem,
        },
        orders,
        categoryPriceGuides: DEFAULT_PRICE_GUIDES,
      },
    },
  };
}
