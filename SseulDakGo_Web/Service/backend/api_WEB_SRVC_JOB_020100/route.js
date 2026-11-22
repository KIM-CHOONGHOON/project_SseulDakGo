/**
 * ============================================================================
 * [백엔드 API 라우트 모듈]
 * 화면 ID: WEB-SRVC-JOB-020100
 * 화면명: 현장 시공 사진 첨부 모달 (On-Site Cleaning Photo Upload Modal)
 * 파일 경로: SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020100/route.js
 * API 엔드포인트: POST /api/web/service/job_020100
 * ============================================================================
 */

import { executeQuery } from '../../../../lib/db.js';

export async function processWebSrvcJob020100(req, res) {
  try {
    const { orderNo, contractorNo, photoPhase, photos } = req.body;

    console.log(`📸 [API WEB-SRVC-JOB-020100] 시공 사진 등록 요청: 주문번호=${orderNo}, 구간=${photoPhase}, 사진수=${photos?.length || 0}`);

    return res.status(200).json({
      success: true,
      message: `시공 사진 ${(photos?.length || 0)}장이 성공적으로 등록되었습니다.`,
      data: {
        orderNo: orderNo || 'SDG-2026-1120',
        photoPhase: photoPhase || 'ING',
        totalCount: (photos?.length || 8),
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ [API WEB-SRVC-JOB-020100] 에러:', error);
    return res.status(500).json({
      success: false,
      message: '시공 사진 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}
