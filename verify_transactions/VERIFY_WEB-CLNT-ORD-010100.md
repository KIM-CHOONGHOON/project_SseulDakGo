# [거래검증 기준서] WEB-CLNT-ORD-010100 : 청소 요청 상세 및 용역 청약서 비교/선택

## 1. 화면 및 트랜잭션 개요
- **화면 ID**: `WEB-CLNT-ORD-010100`
- **화면명**: 청소 요청 상세 및 시공사 청약서 비교/선택
- **사용자 역할**: 고객 (`CLIENT`, `USER_ROLE_CD = 'C'`)
- **프론트엔드 소스**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010100/index.jsx)
- **프리뷰 URL**: `http://localhost:3000/preview_client/WEB-CLNT-ORD-010100.html`
- **백엔드 API 엔드포인트**: `POST /api/web/client/ord_010100`
- **백엔드 소스**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010100/route.js)

---

## 2. 연관 DB 테이블 명세 및 정합성 기준

| 테이블명 | 작업 유형 | 필수 검증 컬럼 및 기대값 | 비고 |
| :--- | :---: | :--- | :--- |
| **`TB_ORDER_MSTR`** | `SELECT` | • `ORDER_NO`: 조회할 발주번호<br/>• `CLIENT_USER_NO`: 로그인 사용자 일치 (타인 발주 열람 차단)<br/>• `ORDER_STATUS`: `'BID_OPEN'`, `'CNTR_CONFIRMED'` 등<br/>• `PROPOSED_PRICE`: 고객 지정 제안가<br/>• `BID_EXPIRE_DT`: 청약 마감 일시 | 발주 마스터 원장 |
| **`TB_ORDER_DTL`** | `JOIN SELECT` | • `ORDER_DTL_NO`, `CLEAN_LARGE_CD`, `CLEAN_MID_CD`<br/>• `HOPE_CLEAN_DATE`: 용역 개시 희망일<br/>• `WEEK_CLEAN_FREQ`, `CLEAN_DAYS_CONFIG`, `SUPPLY_PYEONG` | 발주 상세 내역 |
| **`TB_QUOTE_APPLY`** | `SELECT` (복수건) | • `APPLY_NO`: 시공사 청약서 고유번호 (예: `APPLY202611...`)<br/>• `SERVICE_USER_NO`: 시공사 회원번호 (`S...`)<br/>• `PROPOSED_DATE`: 시공 제안 일자<br/>• `TIME_SLOT_TYPE`: `'MORNING'`(오전) / `'AFTERNOON'`(오후)<br/>• `ASSIGN_STAFF_CNT`: 투입 인원수 (예: 2명)<br/>• `APPEAL_MSG`: 시공사 각오 및 특화 장비 소개<br/>• `CONFIRMED_PRICE`: 고객 지정 대금 수용 확정액 (`= PROPOSED_PRICE`)<br/>• `APPLY_STAT_CD`: `'APPLIED'` (유효 청약) | 접수된 시공사 청약서 목록 |
| **`TB_USER`** | `JOIN SELECT` | • `USER_NM`: 시공사 대표자명 (성명 마스킹, 예: `박*훈`)<br/>• `COMPANY_OR_ORG_NM`: 시공 상호명 (예: `에이스클린 고양본점`) | 시공사 프로필 정보 |

---

## 3. 프론트엔드 비교 및 선택 검증 기준

1. **상단 발주 원장 정보 카드**:
   - 발주번호, 청소 카테고리 뱃지, 시공지 주소, 고객 지정 월/건 용역 대금 정확히 표출.
2. **시공사 청약서 카드 비교 목록**:
   - 접수된 시공사들의 **투입인원, 제안시간대, 보유장비/자격증(방역소독, 친환경 등), 어필메시지, 평점/리뷰수**가 카드 형태로 나열.
   - 각 카드 우측에 `[이 시공사 선택 및 결제 진행]` CTA 버튼 배치.
3. **선택 시 다음 단계 연계**:
   - 시공사 카드의 선택 버튼 클릭 시 `WEB-CLNT-PAY-010100` (데이터 이용료 16,500원 결제 모달)을 즉시 호출.
   - 선택된 `applyNo`, `serviceUserNo`, `companyNm`이 결제 모달로 안전하게 전달되어야 함.

---

## 4. 거래 테스트 시나리오

### 시나리오: 특정 발주 건에 대한 청약서 목록 조회 및 시공사 선택
1. **수행 절차**:
   - 파라미터로 발주번호 전달 (`orderNo: 'ORD2026111600002'`, `clientUserNo: 'C20261100001'`).
   - `POST /api/web/client/ord_010100` 호출.
2. **검증 결과 확인**:
   - 발주 마스터/상세 정보가 응답 객체 `data.orderMaster`에 정상 반환됨.
   - `data.applyList`에 접수된 시공사 청약서 정보가 배열로 반환됨.
   - 시공사 선택 버튼 클릭 시 결제 모달(`WEB-CLNT-PAY-010100`) 파라미터가 유효하게 바인딩됨.

---

## 5. 자동 검증 스크립트 (CLI One-liner)

```powershell
node -e "
fetch('http://localhost:3000/api/web/client/ord_010100', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderNo: 'ORD2026111600002', clientUserNo: 'C20261100001' })
}).then(r => r.json()).then(data => {
  console.log('발주 마스터:', data.data?.orderMaster?.orderNo, data.data?.orderMaster?.proposedPrice);
  console.log('접수 청약서 수:', data.data?.applyList?.length);
  if (data.data?.applyList?.length > 0) {
    console.log('첫번째 시공사:', data.data.applyList[0].companyNm, data.data.applyList[0].applyNo);
  }
}).catch(console.error);
"
```
