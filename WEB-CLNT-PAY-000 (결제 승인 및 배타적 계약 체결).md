# [SseulDakGo (쓸고닦고)] WEB-CLNT-PAY-000 (결제 승인 및 배타적 계약 체결) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-PAY-000` |
| **화면명** | 데이터 이용료 결제 및 배타적 전자계약 체결 (Payment & Exclusive Contract Execution) |
| **지원 채널** | Web [Y] / Mobile Web [Y] (보안 결제 모달 오버레이) |
| **도메인 역할** | `Client` (고객 전용 결제 및 파트너 배타적 배차 확정) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/pay_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 데이터 이용료 결제 승인과 계약 체결 트랜잭션은 오직 `POST /api/web/client/pay_000`에서 전담합니다.
2. **동적 데이터 이용료 과금 연산 원칙**:
   - 청소 유형(정기청소/가전청소/입주청소) 요청 개수에 따라 건당 16,500원(VAT 포함)으로 동적 산정됩니다.
     - **1개 유형 요청 시**: 16,500원 (공급가액 15,000원 + VAT 1,500원)
     - **2개 유형 요청 시**: 33,000원 (공급가액 30,000원 + VAT 3,000원)
     - **3개 유형 요청 시**: 49,500원 (공급가액 45,000원 + VAT 4,500원)
3. **6개 테이블 원자적 트랜잭션 (Atomic 6-Table Transaction)**:
   - 결제 성공 시 `TB_CLEAN_CONTRACT`, `TB_DATA_FEE_PAY`, `TB_ORDER_MSTR`, `TB_ORDER_DTL`, `TB_QUOTE_APPLY`, `TB_ALLIANCE_SETTLE_DTL` 6개 테이블을 단일 DB 트랜잭션으로 커밋하여 데이터 정합성을 100% 보장합니다.
4. **배타적 청약 마감 (Exclusive Winner-Takes-All)**:
   - 채택된 파트너의 청약서는 `ACCEPTED`로 갱신되고 계약이 체결되며, 동일 발주에 접수된 타 파트너 청약서는 즉시 `REJECTED` 처리되어 중복 배차를 원천 방지합니다.
5. **현장 직불제 고지 의무 (`.cursorrules` 준수)**:
   - 플랫폼이 수취하는 것은 "데이터 매칭 수수료(16,500원~)"이며, "시공 노무비 본금(예: 720,000원)"은 현장 시공 검수 후 기사님 계좌로 직접 지급됨을 명시합니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 트랜잭션 수행 작업 |
| :--- | :--- | :--- |
| `TB_CLEAN_CONTRACT` | 체결 계약 마스터 | 신규 계약서 레코드 INSERT (`CONTRACT_NO = CNTYYYYMMDD#####`) |
| `TB_DATA_FEE_PAY` | 데이터 이용료 결제원장 | 결제 승인 원장 INSERT (`PAY_NO = PAYYYYYMMDD#####`, 결제금액, 공급가, VAT, PG승인번호) |
| `TB_ORDER_MSTR` | 주발주 마스터 | 발주 상태 변경 UPDATE (`ORDER_STATUS = 'CNTR_CONFIRMED'`) |
| `TB_ORDER_DTL` | 발주 상세 | 채택 상세 품목은 `APPR_CONTRACT`, 타 상세 품목은 `WAIT_CLOSED` 마감 UPDATE |
| `TB_QUOTE_APPLY` | 파트너 청약서 | 채택 청약은 `ACCEPTED`, 탈락 청약은 `REJECTED` 일괄 UPDATE |
| `TB_ALLIANCE_SETTLE_DTL` | 제휴사 정산 내역 | 제휴 유입 고객 건일 경우 공급가액의 15% 정산 레코드 INSERT |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 구성 요소
1. **상단 모달 헤더**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 및 `"매칭 확정 및 데이터 이용료 결제"` 타이틀
2. **선택한 시공 파트너 요약 카드**:
   - 업체명(`COMPANY_NM`), 대표 마스터명, 안심번호 통화 연결 링크, 시공 평점, 방문 확정 일시
3. **결제 금액 명세표 (Dynamic Pricing Breakdown)**:
   - 포함된 청소 서비스 유형 태그 (예: `[정기청소 1건]`, `[가전청소 1건]`)
   - 공급가액, 부가가치세(10%), 총 결제 금액(₩16,500원 / ₩33,000원 / ₩49,500원) 실시간 계산 표출
4. **결제 수단 선택 탭**:
   - `[신용/체크카드]`, `[네이버페이]`, `[카카오페이]`, `[토스페이]`
5. **현장 직불제 정산 고지 체크박스**:
   - "현장 시공 완료 후 기사님께 노무 대금(₩720,000원)을 직접 정산하는 직불제 원칙을 확인하였습니다."
6. **결제 승인 CTA 버튼**:
   - `[ ₩16,500원 결제 및 계약 확정하기 ]` -> 클릭 시 로딩 스피너 및 백엔드 트랜잭션 호출
   - 성공 시 축하 모달 노출 후 `나의 신청현황(WEB-CLNT-ORD-000)`으로 자동 전환

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/pay_000`
- **구현 함수**: `processWebClntPay000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "orderNo": "ORD2026103100001",
  "applyNo": "APPLY20261031001",
  "clientUserNo": "C20261000001",
  "serviceUserNo": "S20261000001",
  "payMethod": "CARD",
  "categories": ["REGULAR"],
  "totalAmount": 16500,
  "safeTelNo": "0507-1234-5678"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "contractNo": "CNT2026103100001",
    "payNo": "PAY2026103100001",
    "orderNo": "ORD2026103100001",
    "totalAmount": 16500,
    "supplyAmount": 15000,
    "vatAmount": 1500,
    "paidAt": "2026-10-31T04:55:00.000Z"
  },
  "message": "결제 승인 및 배타적 계약 체결이 완료되었습니다."
}
```

### 4.4 트랜잭션 SQL 실행 흐름
```sql
-- 1. 계약서 생성
INSERT INTO TB_CLEAN_CONTRACT (
  CONTRACT_NO, ORDER_NO, ORDER_DTL_NO, CLIENT_USER_NO, SERVICE_USER_NO,
  CONFIRMED_DATE, CONFIRMED_TIME, TOTAL_SERVICE_AMT, SAFE_TEL_NO, CONTRACT_STAT_CD, REG_DT, REG_ID
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', NOW(), ?);

-- 2. 데이터 이용료 결제 원장 생성
INSERT INTO TB_DATA_FEE_PAY (
  PAY_NO, CONTRACT_NO, ORDER_NO, CLIENT_USER_NO, PAY_METHOD,
  PAY_AMOUNT, SUPPLY_AMOUNT, VAT_AMOUNT, PAY_STATUS, PG_APPROVAL_NO, PAID_DT, REG_DT, REG_ID
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, NOW(), NOW(), ?);

-- 3. 주발주 상태를 배차확정으로 전이
UPDATE TB_ORDER_MSTR
   SET ORDER_STATUS = 'CNTR_CONFIRMED', MOD_DT = NOW()
 WHERE ORDER_NO = ?;

-- 4. 발주 상세 공정 상태 갱신
UPDATE TB_ORDER_DTL
   SET SERVICE_STATUS = 'APPR_CONTRACT', DETAIL_STATUS = 'DISPATCH_CONFIRMED', MOD_DT = NOW()
 WHERE ORDER_DTL_NO = ?;

-- 5. 채택된 청약서는 ACCEPTED, 동일 발주의 타 청약서는 REJECTED 일괄 갱신
UPDATE TB_QUOTE_APPLY
   SET APPLY_STATUS = CASE WHEN APPLY_NO = ? THEN 'ACCEPTED' ELSE 'REJECTED' END,
       MOD_DT = NOW()
 WHERE ORDER_NO = ?;
```

---

## 5. 검증 및 테스트 결과

1. **동적 과금 연산 검증**:
   - 1개 카테고리 요청 시 16,500원 결제 승인 확인.
   - 2개 카테고리 요청 시 33,000원 결제 승인 확인.
2. **원자적 롤백 검증**: 트랜잭션 도중 예외 발생 시 결제 원장과 계약서가 모두 롤백되어 무결성이 유지됨을 확인.
3. **타 청약자 배타적 마감**: 1위 청약 채택 시 타 청약서 2건이 즉시 `REJECTED` 처리되어 중복 배차가 차단됨을 확인.

