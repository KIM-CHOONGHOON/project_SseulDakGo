# [프로그램 상세 명세서] 현장 시공 완료 등록 모달 (WEB-SRVC-JOB-020200)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-JOB-020200`
- **화면명**: 현장 시공 완료 등록 모달 (`Final Cleaning Completion & Inspection Request Modal`)
- **화면 구분**: Sub 화면 (모달 - 메인 `WEB-SRVC-JOB-020000`의 중분류 02번 채번)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020200/index.jsx`
- **백엔드 모듈 경로**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020200/route.js`
- **API 엔드포인트**: `POST /api/web/service/job_020200`
- **호출 트리거**: `WEB-SRVC-JOB-020000` 화면의 `[시공완료 등록]` 버튼 클릭 시 호출

---

## 2. 주요 기능 및 UI/UX 명세
1. **시공 현장 및 담당자 정보 카드**:
   - 대상 현장명, 투입 팀장명, 등록된 시공 전/후 사진 총 장수(12장 업로드 OK) 검증 상태 표출.
2. **시공 완료 필수 체크리스트 (4개 항목)**:
   - [x] 상가 1~2층 복도 및 계단실 바닥 먼지 흡입 및 왁싱 건조 완료
   - [x] 남녀 화장실 2개소 고온 스팀 살균 및 위생 소모품 교체
   - [x] 1층 로비 출입문 유리창 지문 제거 및 피톤치드 분무 소독
   - [x] 수거된 재활용 쓰레기 규격 봉투 분리 배출 완료
3. **인수인계 및 특이사항 메모란**:
   - 고객에게 전달할 안내 메모 입력 필드 (300자 이내).
4. **고객 검수 요청 알림 자동 발송 토글**:
   - `등록 즉시 고객님(김충훈 님)께 현장 검수 및 완료 서명 요청 알림톡(Push/SMS)을 발송합니다.` (기본 선택)
5. **하단 액션 버튼**:
   - `[닫기]`, `[최종 시공완료 등록]` (확인 팝업 후 계약 상태를 `SVC_COMPLETED`로 변경 및 고객 알림 발송).

---

## 3. 백엔드 API 규격 (`POST /api/web/service/job_020200`)
- **Request Body**:
```json
{
  "orderNo": "SDG202611200001",
  "contractorNo": "S20261100001",
  "managerName": "김태호",
  "completionNotes": "상가 1~2층 복도 왁싱 건조 작업 완료되었습니다. 화장실 소독 및 쓰레기 분리수거 완료했습니다.",
  "sendPushToClient": true
}
```
- **Response JSON**:
```json
{
  "success": true,
  "message": "시공 완료가 성공적으로 등록되었으며, 고객님께 검수 요청 알림이 전송되었습니다.",
  "status": "SVC_COMPLETED"
}
```

---

## 4. 연동 데이터베이스 명세
- `TB_CLEAN_CONTRACT`: 계약 상태를 `IN_PROGRESS` → `SVC_COMPLETED`로 원자적 전이.
- `TB_JOB_PROGRESS`: 5단계 중 4단계('현장 최종검수 대기') 및 완료 이력 생성.
- `TB_SYS_PUSH_LOG`: 고객 대상 "시공 완료 및 검수 요청" 알림 메시지 발송 로그 적재.
