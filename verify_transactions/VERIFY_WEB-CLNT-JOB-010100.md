# [거래검증 기준서] WEB-CLNT-JOB-010100 : 청소 시공 검수 및 현장 직불 완료 승인

## 1. 화면 및 트랜잭션 개요
- **화면 ID**: `WEB-CLNT-JOB-010100`
- **화면명**: 청소 시공 검수 및 현장 직불 완료 승인
- **사용자 역할**: 고객 (`CLIENT`, `USER_ROLE_CD = 'C'`)
- **프론트엔드 소스**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-010100/index.jsx)
- **프리뷰 URL**: `http://localhost:3000/preview_client/WEB-CLNT-JOB-010100.html`
- **백엔드 API 엔드포인트**:
  - `GET /api/web/client/job_010100`: 시공 전/후 사진 및 검수 상태 조회
  - `POST /api/web/client/job_010100`: 고객 최종 검수 완료 승인 (`action: 'COMPLETE_INSPECT'`)
- **백엔드 소스**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_010100/route.js)

---

## 2. 연관 DB 테이블 명세 및 정합성 기준

| 테이블명 | 작업 유형 | 필수 검증 컬럼 및 기대값 | 비고 |
| :--- | :---: | :--- | :--- |
| **`TB_CLEAN_CONTRACT`** | `UPDATE` (1건) | • `CONTRACT_STAT_CD`: `'COMPLETED'` (계약 종료)<br/>• `MOD_DT`: `NOW()` | 계약 완료 처리 |
| **`TB_ORDER_MSTR`** | `UPDATE` (1건) | • `ORDER_STATUS`: `'SVC_COMPLETED'` (시공 완료)<br/>• `COMPLETED_DT`: `NOW()` | 발주 최종 완료 |
| **`TB_ORDER_DTL`** | `UPDATE` (1건) | • `SERVICE_STATUS`: `'COMPLETED'` | 상세 품목 완료 |
| **`TB_ORDER_PHOTO`** | `SELECT` | • `PHOTO_TIMING_CD`: `'BEFORE'`(시공 전) vs `'AFTER'`(시공 후)<br/>• 시공사가 업로드한 시공 후 사진 검수 | 전/후 사진 비교 |
| **`TB_USER_NOTIFICATION`** | `INSERT` (1건) | • `USER_NO`: 시공사 회원번호<br/>• `NOTI_TYPE`: `'SERVICE_COMPLETED'`<br/>• `TITLE`: `[시공 검수 완료] 고객님이 시공 완료를 승인하셨습니다.`<br/>• `CONTENT`: 고객 확정 대금 현장 수령 안내 | 시공사 대상 알림 |

---

## 3. 프론트엔드 검수 및 직불 안내 검증 기준

1. **시공 전/후 사진 슬라이더 / 갤러리 비교**:
   - 동일 구역(예: 1층 로비, 계단 난간, 화장실 등)의 시공 전(`BEFORE`)과 시공 후(`AFTER`) 사진을 나란히 비교 표출.
2. **시공사 확인 서명 및 시공 체크리스트 표출**:
   - 시공사가 체크한 소독, 약품 세정, 왁스 도포 등 세부 작업 항목 확인.
3. **현장 직불 대금 안내 카드**:
   - 플랫폼을 통한 2차 결제가 아닌, **시공 현장에서 고객이 시공사에게 약정 대금을 직접 지급(계좌이체 또는 현금)**하도록 명확한 직불 가이드 및 계좌 정보 표출.
4. **최종 승인 버튼 클릭 시**:
   - `[검수 완료 승인 및 대금 직불 확인]` 클릭 시 확인 팝업 후 즉시 DB 3대 테이블의 상태가 `COMPLETED`로 원자적 전이.

---

## 4. 거래 테스트 시나리오

### 시나리오: 시공 후 사진 검수 후 완료 승인
1. **수행 절차**:
   - 계약번호(`contractNo: 'CT2026111600001'`), 고객번호(`clientUserNo: 'C20261100001'`) 전달.
   - `POST /api/web/client/job_010100` 호출 (`action: 'COMPLETE_INSPECT'`).
2. **검증 결과 확인**:
   - `TB_CLEAN_CONTRACT.CONTRACT_STAT_CD`가 `'COMPLETED'`로 변경 확인.
   - `TB_ORDER_MSTR.ORDER_STATUS`가 `'SVC_COMPLETED'`로 변경되고 `COMPLETED_DT` 기록 확인.
   - `TB_ORDER_DTL.SERVICE_STATUS`가 `'COMPLETED'`로 변경 확인.
   - 화면에 "청소 완료 승인이 정상 처리되었습니다. 파트너에게 대금을 직접 지급해 주세요." 완료 안내 노출.

---

## 5. 자동 검증 스크립트 (CLI One-liner)

```powershell
node -e "
fetch('http://localhost:3000/api/web/client/job_010100', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'COMPLETE_INSPECT',
    contractNo: 'CT2026111600001',
    clientUserNo: 'C20261100001'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
"
```
