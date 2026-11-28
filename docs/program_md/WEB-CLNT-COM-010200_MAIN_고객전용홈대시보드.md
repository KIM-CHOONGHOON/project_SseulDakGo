# WEB-CLNT-COM-010200 고객 전용 홈 대시보드

## ① 아키텍처 개요
- **Frontend**: `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010200/index.jsx` (및 `WEB-CLNT-COM-010000/index.jsx` 내 `WebClntCom010200` 연동)
- **Backend**: `SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010200/route.js` (`GET /api/clnt/com/010200`)
- **특징**: 타 화면과 백엔드 모듈을 공유하지 않는 1:1 독립 엔드포인트. `lib/db.js`의 `executeQuery` 커넥션 풀만 사용.

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| 고객(`C`) 로그인 후 화면 | `WEB-CLNT-COM-010000` 메인 홈 유지 | `WEB-CLNT-COM-010200` 고객 전용 홈 대시보드 호출 |
| 백엔드 API | 미존재 | `GET /api/clnt/com/010200` 독립 엔드포인트 신설 |

## ③ UI / State 연동 명세
- `dateFrom`, `dateTo`: 조회기간 (`YYYY.MM.DD`, 기본 365일 범위)
- `orderStatus`: 진행상태 필터 (`ALL`, `REQ_APPLY`, `APPLY_CMPL`, `PAY_WAIT`, `JOB_ING`, `JOB_INSPECT`, `JOB_CMPL`, `ORDER_CANCEL`)
- `page`: 현재 페이지 (페이지당 10건)
- `dashboardData`: `clientProfile`, `filterMeta`, `pagination`, `orders`, `categoryPriceGuides`

## ④ API Request / Response 명세
- **Endpoint**: `GET /api/clnt/com/010200?userNo=&dateFrom=&dateTo=&orderStatus=&page=&pageSize=10`
- **Validation**: `dateFrom`~`dateTo` 365일 초과 또는 역전 시 `400 Bad Request` (`ERR_INVALID_DATE_RANGE`)
- **Response**: `{ success: true, screenId: 'WEB-CLNT-COM-010200', data: { clientProfile, filterMeta, pagination, orders, categoryPriceGuides } }`

## ⑤ 연동 DB 테이블·컬럼 명세
- `TB_USER` (`USER_NO`, `USER_NM`, `USER_ROLE_CD`, `USER_STAT_CD`)
- `TB_USER_NOTIFICATION` (`USER_NO`, `READ_YN`)
- `TB_COM_CODE` (`CODE_GRP_CD = 'ORDER_STATUS'`, `COM_CD`, `COM_NM`, `USE_YN`, `SORT_ORD`)
- `TB_ORDER_MSTR` (`ORDER_NO`, `CLIENT_USER_NO`, `CLEAN_LARGE_CD`, `ORDER_STATUS`, `ADDR_TEXT`, `PROPOSED_PRICE`, `HOPE_DT`, `SAFE_TEL_SERVICE`, `REG_DT`)

## ⑥ 테스트 체크리스트
- [x] `GET /api/clnt/com/010200` 365일 초과 시 400 `ERR_INVALID_DATE_RANGE` 반환
- [x] 고객(`C`) 로그인 시 `WEB-CLNT-COM-010200` 화면 전환
- [x] `node scripts/build-preview.js` 및 `node --check preview/web_clnt_com_000.js` 정상 빌드

## ⑦ 유지보수 가이드
- 상태별 CTA 버튼 매핑은 `route.js`의 `buildCtaAction(statCd)`에서 일괄 관리합니다.

- **2026-11-28 (로그아웃 연동, 미확인 푸시 알림 건수 필터링, GNB 문구 삭제)**
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`: `WebClntCom010200`에 `onLogout` 핸들러 전달하여 로그아웃 시 세션/스토리지 초기화 및 게스트(`home`) 전환 처리.
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010200/index.jsx` & `WEB-CLNT-COM-010000/index.jsx`: GNB 로고 우측 `CLIENT PORTAL`, `공간 맞춤 직불 매칭` 문구 삭제.
  - `SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010200/route.js`: 벨 아이콘 미확인 알림 건수(`unreadNotiCnt`)를 시공사의 청약등록·데이터이용료 결제 완료·청소 용역 청약 취소(`NOTI_TYPE IN ('QUOTE_APPLY', 'PAY_COMPLETE', 'ORDER_CANCEL', 'BID_APPLY', 'PAYMENT_COMPLETE', 'BID_CANCEL')`) 중 미확인(`READ_YN = 'N' OR IS_READ = 'N'`) 건수만 카운트하도록 수정.
