/**
 * ============================================================================
 * [백엔드 API 라우트 모듈]
 * 화면 ID: WEB-SRVC-JOB-020000
 * 화면명: 시공 파트너 현장 진행 현황 (Contractor On-Site Progress Dashboard)
 * 파일 경로: SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020000/route.js
 * API 엔드포인트: GET /api/web/service/job_020000
 * ============================================================================
 */

import { executeQuery } from '../../../../lib/db.js';

export async function processWebSrvcJob020000(req, res) {
  try {
    const contractorNo = req.query.contractorNo || 'S20261100001';
    const status = req.query.status || 'IN_PROGRESS';

    // 1. 현장 진행 현황 기본 목업/DB 데이터 조립
    const jobData = {
      orderNo: 'SDG-2026-1120',
      contractNo: 'CNT-2026-112001',
      clientName: '김충훈',
      clientSafePhone: '0504-1234-5678',
      siteAddress: '경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)',
      serviceType: '프리미엄 입주/상가 정기청소 + 피톤치드 살균',
      orderDate: '2026-11-20 14:00',
      progressStep: 3, // 1: 예약확정, 2: 현장도착, 3: 시공진행중, 4: 현장최종검수, 5: 서명및완료
      progressRate: 72,
      steps: [
        { step: 1, label: '예약 확정', time: '10:00 완료', isCompleted: true },
        { step: 2, label: '현장 도착', time: '13:45 체크', isCompleted: true },
        { step: 3, label: '시공 진행중', time: '현재 72% 진행', isCurrent: true },
        { step: 4, label: '현장 최종검수', time: '17:00 예정', isPending: true },
        { step: 5, label: '서명 및 완료', time: '안심정산', isPending: true }
      ],
      contractor: {
        companyName: '공간다원 시공팀',
        managerName: '김태호 팀장',
        license: '1급 위생관리사',
        rating: 4.98,
        profileImg: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
      },
      photos: {
        beforeCount: 4,
        ingCount: 4,
        afterCount: 0,
        totalCount: 8
      },
      checklists: [
        { id: 1, text: '상가 1~2층 복도 및 계단실 바닥 먼지 흡입 및 왁싱 건조', checked: true },
        { id: 2, text: '남녀 화장실 2개소 고온 스팀 살균 및 위생 소모품 교체', checked: true },
        { id: 3, text: '1층 로비 출입문 유리창 지문 제거 및 피톤치드 분무 소독', checked: false },
        { id: 4, text: '수거된 재활용 쓰레기 규격 봉투 분리 배출 완료', checked: false }
      ]
    };

    return res.status(200).json({
      success: true,
      message: '시공 파트너 현장 진행 현황이 정상 조회되었습니다.',
      data: jobData
    });
  } catch (error) {
    console.error('❌ [API WEB-SRVC-JOB-020000] 에러:', error);
    return res.status(500).json({
      success: false,
      message: '현장 진행 현황 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
}
