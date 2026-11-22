# [거래검증 기준서] WEB-CLNT-ORD-010000 : 나의 청소 신청 현황 (발주 목록)

## 1. 화면 및 트랜잭션 개요
- **화면 ID**: `WEB-CLNT-ORD-010000`
- **화면명**: 나의 청소 신청 현황 (발주 목록 메인)
- **사용자 역할**: 고객 (`CLIENT`, `USER_ROLE_CD = 'C'`)
- **프론트엔드 소스**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010000/index.jsx)
- **프리뷰 URL**: `http://localhost:3000/preview_client/WEB-CLNT-ORD-010000.html`
- **백엔드 API 엔드포인트**: `POST /api/web/client/ord_010000`
- **백엔드 소스**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010000/route.js)

---

## 2. 연관 DB 테이블 명세 및 정합성 기준

| 테이블명 | 작업 유형 | 필수 검증 컬럼 및 기대값 | 비고 |
| :--- | :---: | :--- | :--- |
| **`TB_ORDER_MSTR`** | `UPDATE`<br/>(자동 만료 배치) | • `ORDER_STATUS`: 만료일시(`BID_EXPIRE_DT < NOW()`) 도래 시 `'BID_OPEN'` → `'BID_EXPIRED'`로 자동 전환 | 조회 시점 자동 동기화 |
| **`TB_ORDER_MSTR`** | `SELECT` | • `ORDER_NO`: 고객 소유 발주 목록<br/>• `CLIENT_USER_NO`: 로그인 사용자 번호 일치<br/>• `ORDER_STATUS`: `'BID_OPEN'`, `'CNTR_CONFIRMED'`, `'SVC_PROGRESS'`, `'SVC_COMPLETED'`, `'BID_EXPIRED'`<br/>• `PROPOSED_PRICE`: 고객 지정 제안 금액 | 발주 기본 정보 |
| **`TB_ORDER_DTL`** | `JOIN SELECT` | • `CLEAN_LARGE_CD`: 카테고리 뱃지 (`정기청소`, `입주이사`, `계절가전`)<br/>• `HOPE_CLEAN_DATE`: 시공 시작/희망일자<br/>• `WEEK_CLEAN_FREQ`, `CONTRACT_TERM_DAYS`: 정기청소 부가 정보 | 발주 상세 내역 |
| **`TB_QUOTE_APPLY`** | `SUBQUERY SELECT` | • `APPLY_COUNT`: `COUNT(APPLY_NO)` (시공사가 제출한 유효 청약서 건수, `APPLY_STAT_CD = 'APPLIED'`) | 입찰 건수 뱃지 표출 |

---

## 3. 프론트엔드 표출 및 상태 필터 검증 기준

1. **상태 요약 카드 4종 검증**:
   - `전체 신청`: `totalCnt`
   - `청약 대기`: `bidOpenCnt` (`ORDER_STATUS = 'BID_OPEN'`)
   - `진행 중 (계약/시공)`: `inProgressCnt` (`CNTR_CONFIRMED`, `SVC_PROGRESS`)
   - `시공 완료`: `completedCnt` (`SVC_COMPLETED`)
2. **청약 만료 7일 카운트다운 타이머**:
   - `ORDER_STATUS = 'BID_OPEN'` 건에 대해 `BID_EXPIRE_DT` 기준 남은 일/시/분 실시간 카운트다운 표출.
   - 7일 경과 시 `'청약 모집 마감(만료)'` 뱃지 및 재신청 유도.
3. **시공사 청약서 수신 뱃지 (`applyCount`)**:
   - `applyCount > 0`인 경우 `N명의 시공사 청약서 접수됨` 강조 뱃지 노출 및 클릭 시 `WEB-CLNT-ORD-010100`으로 네비게이션.

---

## 4. 거래 테스트 시나리오

### 시나리오: 발주 등록 후 현황 목록 실시간 조회
1. **수행 절차**:
   - `WEB-CLNT-REQ-010100`에서 발주서 등록 완료 (`C20261100001`).
   - `WEB-CLNT-ORD-010000` 화면 진입.
2. **검증 결과 확인**:
   - 목록 최상단에 방금 등록한 발주번호(`ORD...`)가 정확히 노출됨.
   - 상태가 `청약 대기 (WAIT_BID / BID_OPEN)`로 표시되고, 타이머가 약 `6일 23시간...`으로 카운트다운 시작됨.
   - 시공사 견적이 아직 없는 경우 `청약서 0건 (시공사 매칭 중)` 표출.

---

## 5. 자동 검증 스크립트 (CLI One-liner)

```powershell
node -e "
fetch('http://localhost:3000/api/web/client/ord_010000', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clientUserNo: 'C20261100001', statusFilter: 'ALL' })
}).then(r => r.json()).then(data => {
  console.log('요약 통계:', data.data?.summary);
  console.log('발주 건수:', data.data?.orders?.length);
  if (data.data?.orders?.length > 0) {
    console.log('최신 발주 1건:', data.data.orders[0]);
  }
}).catch(console.error);
"
```
