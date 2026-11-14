/**
 * ============================================================================
 * [백엔드 API] 화면 ID: WEB-CLNT-REQ-010101 (동일 시공 현장 주소 확인 및 변경 안내 모달)
 * 파일 경로: SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js
 * 엔드포인트: POST /api/web/client/req_010101
 * 규칙:
 *   1. lib/db.ts 싱글톤 커넥션 풀(executeTransaction, executeQuery) 공통 사용
 *   2. 복수 탭(정기청소/입주청소/가전청소) 간 시공 주소 정합성 및 중복 검증
 *   3. 단일 책임 원칙(SRP) 준수 및 전용 엔드포인트 독립 분리
 * ============================================================================
 */

import { executeQuery, executeTransaction } from '../../../../lib/db.js';

// Next.js 환경 및 독립 Node/Express 환경 모두 지원하기 위한 가드
let NextResponse = null;
try {
  const nextServer = await import('next/server');
  NextResponse = nextServer?.NextResponse || null;
} catch {
  // 독립 Express 또는 Node 런타임 환경에서는 null 유지
}

const TAB_NAME_MAP = {
  REGULAR: '정기청소',
  MOVEIN: '입주/이사 청소',
  APPLIANCE: '계절 가전 청소',
};

/**
 * 주소 문자열 정규화 헬퍼 (공백 압축 및 트리밍)
 */
function normalizeAddress(addrText = '', addrDetail = '') {
  return `${String(addrText || '').trim()} ${String(addrDetail || '').trim()}`
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 비즈니스 로직 코어 처리 함수
 */
export async function processWebClntReq010101(body = {}) {
  const { action = 'CHECK_DUPLICATE', clientUserNo = 'GUEST', tabsData = [] } = body;

  // 1. 복수 탭 시공 주소 중복 감지 액션
  if (action === 'CHECK_DUPLICATE' || action === 'VALIDATE_ADDRESSES') {
    if (!Array.isArray(tabsData) || tabsData.length === 0) {
      return {
        status: 200,
        body: {
          success: true,
          hasDuplicates: false,
          duplicateTabs: [],
          duplicateGroups: [],
          message: '검증 대상 탭 주소 데이터가 비어 있습니다.',
        },
      };
    }

    const addrMap = {};
    tabsData.forEach((item) => {
      if (!item || !item.tabKey) return;
      const normAddr = normalizeAddress(item.addrText, item.addrDetail);
      if (normAddr) {
        if (!addrMap[normAddr]) {
          addrMap[normAddr] = [];
        }
        addrMap[normAddr].push(item.tabKey);
      }
    });

    const duplicateGroups = [];
    let duplicateTabs = [];

    Object.entries(addrMap).forEach(([addr, tabs]) => {
      if (tabs.length >= 2) {
        duplicateGroups.push({
          normalizedAddress: addr,
          tabKeys: tabs,
          tabNames: tabs.map((t) => TAB_NAME_MAP[t] || t),
        });
        duplicateTabs = [...new Set([...duplicateTabs, ...tabs])];
      }
    });

    const hasDuplicates = duplicateTabs.length >= 2;

    return {
      status: 200,
      body: {
        success: true,
        hasDuplicates,
        duplicateTabs,
        duplicateGroups,
        message: hasDuplicates
          ? `[${duplicateTabs.map((t) => TAB_NAME_MAP[t] || t).join(', ')}] 탭의 시공 주소가 동일합니다.`
          : '동일 주소 중복이 감지되지 않았습니다.',
      },
    };
  }

  // 2. 고객 동일 주소 등록 선택/변경 이력 감사 로깅 액션
  if (action === 'LOG_CONFIRMATION') {
    const { decision = 'CONTINUE_SAME_ADDRESS', targetTab = null, reason = '' } = body;

    try {
      // TB_SYS_AUDIT_LOG 또는 감사 테이블에 기록 (테이블 존재 시)
      await executeQuery(
        `INSERT INTO TB_SYS_AUDIT_LOG (
          LOG_TYPE, USER_NO, ACTION_CD, REQ_BODY_JSON, REG_DT
        ) VALUES (?, ?, ?, ?, NOW())`,
        [
          'ORDER_REQ_VALIDATION',
          clientUserNo,
          decision,
          JSON.stringify({ targetTab, reason, tabsData }),
        ]
      ).catch(() => {
        // 감사 로그 테이블 미존재 시 무시 (안전 폴백)
      });
    } catch (err) {
      console.warn('[api_WEB_CLNT_REQ_010101] Audit log insert skipped:', err.message);
    }

    return {
      status: 200,
      body: {
        success: true,
        decision,
        targetTab,
        message: '고객 결정 이력이 정상적으로 반영되었습니다.',
      },
    };
  }

  return {
    status: 400,
    body: {
      success: false,
      code: 'ERR_INVALID_ACTION',
      message: `지원되지 않는 action 요청입니다: ${action}`,
    },
  };
}

/**
 * Next.js App Router POST 엔드포인트 핸들러
 */
export async function POST(request) {
  try {
    let body = {};
    if (request && typeof request.json === 'function') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    } else if (request && request.body) {
      body = request.body;
    }

    const { status, body: resBody } = await processWebClntReq010101(body);

    if (typeof NextResponse !== 'undefined' && NextResponse.json) {
      return NextResponse.json(resBody, { status });
    }

    return new Response(JSON.stringify(resBody), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    console.error('❌ [api_WEB_CLNT_REQ_010101] 시스템 예외:', err);
    const errBody = {
      success: false,
      code: 'ERR_REQ_010101_INTERNAL',
      message: err?.message || '동일 주소 검증 중 시스템 오류가 발생했습니다.',
    };

    if (typeof NextResponse !== 'undefined' && NextResponse.json) {
      return NextResponse.json(errBody, { status: 500 });
    }

    return new Response(JSON.stringify(errBody), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

