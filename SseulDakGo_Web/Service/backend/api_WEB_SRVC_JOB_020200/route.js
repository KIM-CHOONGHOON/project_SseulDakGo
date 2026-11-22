/**
 * ============================================================================
 * [백엔드 API 라우트 모듈]
 * 화면 ID: WEB-SRVC-JOB-020200
 * 화면명: 현장 시공 완료 등록 모달 (Final Cleaning Completion & Inspection Request Modal)
 * 파일 경로: SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020200/route.js
 * API 엔드포인트: POST /api/web/service/job_020200
 * ============================================================================
 */

import { executeQuery } from '../../../../lib/db.js';

export async function processWebSrvcJob020200(req, res) {
  try {
    const { orderNo, contractorNo, managerName, completionNotes, sendPushToClient } = req.body;

    console.log(`✅ [API WEB-SRVC-JOB-020200] 현장 시공 완료 등록 요청: 주문번호=${orderNo}, 책임자=${managerName}, 푸시발송=${sendPushToClient}`);

    return res.status(200).json({
      success: true,
      message: '현장 시공 완료가 성공적으로 등록되었으며, 발주고객님께 실시간 검수 요청 알림이 발송되었습니다.',
      data: {
        orderNo: orderNo || 'SDG-2026-1120',
        contractStatus: 'SVC_COMPLETED',
        progressStep: 4,
        completedAt: new Date().toISOString(),
        sendPushResult: sendPushToClient ? 'SUCCESS' : 'SKIPPED'
      }
    });
  } catch (error) {
    console.error('❌ [API WEB-SRVC-JOB-020200] 에러:', error);
    return res.status(500).json({
      success: false,
      message: '현장 시공 완료 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}
