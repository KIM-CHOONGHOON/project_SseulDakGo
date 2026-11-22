# [거래검증 기준서] WEB-CLNT-PAY-010100 : 데이터 이용료 결제 및 시공사 낙점 (배타적 단일 계약)

## 1. 화면 및 트랜잭션 개요
- **화면 ID**: `WEB-CLNT-PAY-010100`
- **화면명**: 고객 데이터 이용료 결제 및 시공사 낙점 모달 (계약 체결)
- **사용자 역할**: 고객 (`CLIENT`, `USER_ROLE_CD = 'C'`)
- **프론트엔드 소스**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-010100/index.jsx)
- **프리뷰 URL**: `http://localhost:3000/preview_client/WEB-CLNT-ORD-010100.html` (모달 팝업)
- **백엔드 API 엔드포인트**: `POST /api/web/client/pay_010100`
- **백엔드 소스**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_010100/route.js)

---

## 2. 연관 DB 테이블 명세 및 정합성 기준

| 테이블명 | 작업 유형 | 필수 검증 컬럼 및 기대값 | 비고 |
| :--- | :---: | :--- | :--- |
| **`TB_CLEAN_CONTRACT`** | `INSERT` (1건) | • `CONTRACT_NO`: `CT` + `YYYYMMDD` + 5자리 (예: `CT2026111600001`)<br/>• `ORDER_NO`, `ORDER_DTL_NO`, `APPLY_NO`<br/>• `CLIENT_USER_NO`, `SERVICE_USER_NO`: 계약 당사자 회원번호<br/>• `TOTAL_SERVICE_AMT`: 확정 청소 용역 대금<br/>• `CLIENT_FEE_AMT`: 데이터 이용료 `16,500원`<br/>• `CLIENT_PAID_YN`: `'Y'`<br/>• `CONTRACT_STAT_CD`: `'CONFIRMED'` (계약 확정) | 청소 위탁 계약 원장 |
| **`TB_DATA_FEE_PAY`** | `INSERT` (1건) | • `PAY_NO`: `PAY` + `YYYYMMDD` + 5자리<br/>• `CONTRACT_NO`: 상위 계약번호<br/>• `PAYER_TYPE_CD`: `'USER'`<br/>• `ACTUAL_PAID_AMT`: `16500` (원)<br/>• `PG_PROVIDER_CD`: `'TOSS_PAYMENTS'`, `'KAKAOPAY'` 등<br/>• `PAY_STAT_CD`: `'COMPLETED'` | 데이터 이용료 결제 원장 |
| **`TB_ORDER_MSTR`** | `UPDATE` (1건) | • `ORDER_STATUS`: `'CNTR_CONFIRMED'` (계약 확정 완료)<br/>• `CONFIRMED_DT`: `NOW()` | 주발주 상태 전이 |
| **`TB_ORDER_DTL`** | `UPDATE` (1건) | • `SERVICE_STATUS`: `'APPR_CONTRACT'` (계약 승인)<br/>• `SELECTED_SERVICE_USER_NO`: 낙점된 시공사 회원번호 세팅 | 배타적 단일 시공 확정 |
| **`TB_QUOTE_APPLY`** | `UPDATE` (선택건) | • `APPLY_STAT_CD`: `'ACCEPTED'` (낙점 채택) | 낙점 시공사 청약서 |
| **`TB_QUOTE_APPLY`** | `UPDATE` (타건) | • `APPLY_STAT_CD`: `'REJECTED'` (미선택 자동 탈락) | 동일 발주 내 타 청약서 일괄 탈락 |
| **`TB_USER_NOTIFICATION`** | `INSERT` (1건) | • `USER_NO`: 낙점 시공사 (`SERVICE_USER_NO`)<br/>• `NOTI_TYPE`: `'CONTRACT_CONFIRMED'`<br/>• `TITLE`: `[계약 확정] 고객님이 사장님의 청약서를 선택하셨습니다!`<br/>• `CONTENT`: 시공사 2차 수수료 결제 및 시공 착수 안내 | 시공사 대상 축하 푸시 |

---

## 3. 프론트엔드 모달 제어 검증 기준

1. **고정 데이터 이용료 (16,500원, VAT 포함)**:
   - 금액 변동 없이 `16,500원` 고정 표출.
   - 공급가액 15,000원 + 부가세 1,500원 명시.
2. **모달 내 3대 핵심 액션 버튼**:
   - `[결제 및 계약 확정]`: PG 간편결제(토스, 카카오, 네이버, 카드) 승인 후 배타적 단일 계약 체결.
   - `[시공사 변경]`: 청소 요청당 최대 3회 허용 (초과 시 불가 안내).
   - `[용역 취소]`: 결제 전 전면 취소 (취소 시 8일간 신청 제재 페널티 안내).
3. **배타적 단일 계약 원칙 (Locking)**:
   - 1개 발주 건에는 오직 1명의 시공사만 매칭되며, 결제 완료 즉시 타 시공사는 자동 탈락(`REJECTED`) 처리됨.

---

## 4. 거래 테스트 시나리오

### 시나리오: 시공사 선택 후 16,500원 결제 완료 및 계약 체결
1. **수행 절차**:
   - 발주(`ORD2026111600002`)의 청약서 중 1건(`APPLY20261031002`)을 선택.
   - `POST /api/web/client/pay_010100` 호출 (`paidAmt: 16500`, `pgProviderCd: 'TOSS_PAYMENTS'`).
2. **검증 결과 확인**:
   - `TB_CLEAN_CONTRACT`에 `CT...` 레코드 1건 생성 확인.
   - `TB_DATA_FEE_PAY`에 `PAY...` 레코드 1건 생성 확인.
   - `TB_ORDER_MSTR.ORDER_STATUS`가 `'CNTR_CONFIRMED'`로 변경 확인.
   - 채택된 청약서는 `'ACCEPTED'`, 나머지 청약서는 `'REJECTED'`로 변경 확인.
   - 시공사(`S...`)에게 계약 체결 알림 발송 확인.

---

## 5. 자동 검증 스크립트 (CLI One-liner)

```powershell
node -e "
fetch('http://localhost:3000/api/web/client/pay_010100', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNo: 'ORD2026111600002',
    clientUserNo: 'C20261100001',
    serviceUserNo: 'S20261100001',
    applyNo: 'APPLY20261031002',
    paidAmt: 16500,
    pgProviderCd: 'TOSS_PAYMENTS'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
"
```
