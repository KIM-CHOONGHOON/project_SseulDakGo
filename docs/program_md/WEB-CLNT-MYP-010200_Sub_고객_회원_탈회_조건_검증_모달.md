# WEB-CLNT-MYP-010200: 고객 회원 탈회 조건 검증 모달

## ① 화면 및 아키텍처 개요
- **화면 ID**: `WEB-CLNT-MYP-010200` (APP 대칭: `APP-CLNT-MYP-010200`)
- **화면명**: 고객 회원 탈회 조건 검증 모달 (중분류+1)
- **프론트엔드 경로**: `SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010200/MemberLeaveModal.jsx`
- **백엔드 모듈**: `SseulDakGo_Web/Service/backend/api_WEB_CLNT_MYP_010200/index.js`
- **API 엔드포인트**: `GET /api/clnt/myp/010200`

## ② 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)
| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 화면 ID | `WEB-CLNT-MYP-010101` | `WEB-CLNT-MYP-010200` |
| 백엔드 폴더 | `WEB-CLNT-MYP-010101` | `api_WEB_CLNT_MYP_010200` |
| 호출 조건 | 내정보 `WEB-CLNT-MYP-010100` 에서 호출 | 동일 (중분류 +1 규칙 준수) |

- 사용자(고객)가 청소 용역 요청 중 ‘완전 종료되지 않은’ 항목 목록을 조회하여 표시합니다.
- 진행 중인 용역이 1건이라도 존재하면 `[회원탈회]` 버튼을 비활성화하고 툴팁 `"진행 중인 용역이 있어 탈회가 불가합니다"`를 표시합니다.
- 모든 용역이 종료된 상태에서 `[회원탈회]` 클릭 시 `WEB-CLNT-MYP-010201` 확인 모달을 호출하며, `[취소]` 클릭 시 내정보 화면으로 복귀합니다.

## ③ 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- 모달 헤더: 회원 탈회 안내
- 본문: 미종료 용역 목록 테이블/리스트 또는 "진행 중인 용역이 없습니다" 안내
- 하단 버튼: `[회원탈회]` (진행 중 용역 존재 시 `disabled`, 색상 `#D32F2F`), `[취소]`

## ④ 백엔드 API 명세
- **Endpoint**: `GET /api/clnt/myp/010200`
- **Response JSON**: `{ success: true, canWithdraw: boolean, ongoingOrders: [...] }`

## ⑤ 연동 데이터베이스 명세
- `TB_USER`: 회원 상태 확인 (`USER_NO`, `USER_STAT_CD`)
- `TB_ORDER_MSTR`: 미종료 발주 건 조회 (`ORDER_STATUS_CD NOT IN ('COMPLETED', 'CANCELLED')`)

## ⑥ 테스트 및 검증 체크리스트
- [x] `WEB-CLNT-MYP-010200` 폴더 및 파일 이동 확인
- [x] `guide/05_WEB_화면목록_및_기능명세.md` 및 `guide/06_APP_화면목록_및_기능명세.md` 동기화 확인

## ⑦ 프로그램 유지보수 가이드 및 개발자 주의사항
- APP 버전(`APP-CLNT-MYP-010200`)과 동일한 미종료 용역 검증 쿼리를 유지해야 합니다.
