# WEB-SRVC-COM-010000 (시공사 파트너 메인 대시보드)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-COM-010000`
- **프론트엔드 파일**:
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\frontend\WEB-SRVC-COM-010000\index.jsx`
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Client\frontend\WEB-CLNT-COM-010000\index.jsx` (임베디드 `WebSrvcCom010000`)
- **백엔드 API**: `GET /api/srvc/com/010000` (`c:\GongGanDaWon_Project\project_SseulDakGo\preview\server.js`)

## 2. 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)

| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 박스 외곽선 | `section-quote-process`, `section-activity-history` 외곽선 없음 | `section-quote-process`는 굵은 파랑색(`border-2 border-blue-500`), `section-activity-history`는 굵은 분홍색(`border-2 border-pink-500`) 외곽선 적용 |
| 목록 크기 유지 | 목록 건수에 따라 박스 높이 가변 | `min-h-[780px]` 고정으로 10건 미만이어도 10건 출력 크기 유지 |
| 페이징 기능 | 없음 | 우측 하단 `맨처음 / 이전페이지 / 1..5 / 다음페이지 / 마지막페이지` 및 `전체 N페이지` 출력 |
| 탭 건수 및 목록 조회 | 하드코딩된 목업 배열 및 건수(3, 2, 2) | `TB_ORDER_MSTR`, `TB_ORDER_DTL` 실 DB 쿼리로 탭 건수 및 10건 단위 페이징 목록 조회 (주소는 도/시까지만 출력) |
| 내 활동 내역 초기 기간 | 고정 문자열 (`2025.11.20` ~ `2026.11.20`) | 시스템 일자 기준 당월 `01일` ~ 당월 `말일` 자동 조립, 최대 1년까지만 조회 가능 |
| 내 활동 내역 조회 | 전체 발주 조회 | 로그인 시공사(`userNo`)의 `TB_QUOTE_APPLY` 실 활동 내역만 조회 |

## 3. 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- `activeTab`: `'waiting-bid' | 'waiting-payment' | 'waiting-cleaning'`
- `tabPage`, `tabTotalPages`, `tabCounts`, `tabItems`: 공정 관리 탭별 건수 및 10건 단위 페이징 상태
- `dateFrom`, `dateTo`, `cleaningType`, `actPage`, `actTotalPages`, `activityItems`: 내 활동 내역 조회 조건 및 페이징 상태

## 4. 백엔드 API 명세 (`GET /api/srvc/com/010000`)
- **Query Parameters**: `tab`, `page`, `pageSize` (기본 10), `actPage`, `cleaningType`, `dateFrom`, `dateTo`
- **Response JSON**:
  - `success`: `boolean`
  - `tabCounts`: `{ waitingBid, waitingPayment, waitingCleaning }`
  - `tabData`: `{ items, totalCount, page, totalPages }`
  - `activityData`: `{ items, totalCount, page, totalPages }`

## 5. 연동 데이터베이스 명세
- `TB_ORDER_MSTR` (`ORDER_NO`, `ORDER_STATUS`, `PROPOSED_PRICE`, `ADDR_TEXT`, `REG_DT`)
- `TB_ORDER_DTL` (`ORDER_NO`, `CLEAN_LARGE_CD`, `SELECTED_SRV_ITEMS`, `SUPPLY_PYEONG`)

## 6. 테스트 및 검증 체크리스트
- [x] `node scripts/build-preview.js` 빌드 성공
- [x] `node --check preview/web_clnt_com_000.js` 문법 검사 통과

## 7. 프로그램 유지보수 가이드
- `WEB-SRVC-COM-010000/index.jsx` 수정 시 `WEB-CLNT-COM-010000/index.jsx` 내 임베디드 `WebSrvcCom010000`도 동일하게 동기화 후 `node scripts/build-preview.js`를 재실행해야 합니다.
