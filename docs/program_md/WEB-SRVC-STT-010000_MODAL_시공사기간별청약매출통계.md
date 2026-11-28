# WEB-SRVC-STT-010000_MODAL_시공사기간별청약매출통계

## ① 아키텍처 개요
- **Frontend**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-STT-010000/index.jsx` (및 `WEB-CLNT-COM-010000/index.jsx` 내 `WebSrvcStt010000Modal` 연동)
- **Backend**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_STT_010000/route.js` (`GET /api/srvc/stt/010000`)
- **특징**: 타 화면과 백엔드 모듈을 공유하지 않는 1:1 독립 엔드포인트. `lib/db.js`의 `executeQuery` 사용.

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| 내 활동 통계 메뉴 | 이동 대상 미구현 | `WEB-SRVC-STT-010000` 모달 오픈 및 실시간 통계 조회 |
| 백엔드 API | 미존재 | `GET /api/srvc/stt/010000` 독립 엔드포인트 신설 |

## ③ UI / State 연동 명세
- `dateFrom`, `dateTo`: 조회 시작/종료 년월 (`YYYY.MM`)
- `activePreset`: 빠른 기간 버튼 (`1`, `3`, `6`, `12`개월)
- `summary`: `appliedCount`, `appliedCleaningAmt`, `cancelledCount`, `cancelledCleaningAmt` (0건/0원 기본 처리 및 천 단위 콤마 포맷)
- `validation`: 12개월 초과 및 시작월 > 종료월 차단 안내 메시지

## ④ 백엔드 API 명세
- **Endpoint**: `GET /api/srvc/stt/010000?userNo=&dateFrom=&dateTo=`
- **Validation**:
  - `fromYm > toYm` → `400 Bad Request` (`ERR_INVALID_MONTH_ORDER`)
  - `monthCount > 12` → `400 Bad Request` (`ERR_EXCEED_MAX_1YEAR`)
- **Response**: `{ success: true, screenId: 'WEB-SRVC-STT-010000', data: { serviceUserNo, period, summaryBoxes } }`

## ⑤ 연동 데이터베이스 명세
- `TB_QUOTE_APPLY` (`SERVICE_USER_NO`, `ORDER_NO`, `QUOTE_STAT_CD`, `REG_DT`)
- `TB_ORDER_MSTR` (`ORDER_NO`, `FIXED_SERVICE_AMT`)

## ⑥ 테스트 체크리스트
- [x] `GET /api/srvc/stt/010000` 12개월 초과 시 400 `ERR_EXCEED_MAX_1YEAR` 반환
- [x] 0건 기간 조회 시 `0건`, `0원` 정상 표시
- [x] `node scripts/build-preview.js; node --check preview/web_clnt_com_000.js` 정상 빌드

## ⑦ 유지보수 가이드
- 상단 메뉴 `"내 활동 통계"` 클릭 시 `activeNavPath === 'WEB-SRVC-STT-010000'`로 모달이 열립니다.
