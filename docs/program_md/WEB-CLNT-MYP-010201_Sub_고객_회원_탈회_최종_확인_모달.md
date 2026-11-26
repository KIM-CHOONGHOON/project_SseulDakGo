# WEB-CLNT-MYP-010201: 고객 회원 탈회 최종 확인 모달

## ① 화면 및 아키텍처 개요
- **화면 ID**: `WEB-CLNT-MYP-010201` (APP 대칭: `APP-CLNT-MYP-010201`)
- **화면명**: 고객 회원 탈회 최종 확인 모달 (소분류+1)
- **프론트엔드 경로**: `SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010201/MemberLeaveConfirmModal.jsx`
- **백엔드 모듈**: `SseulDakGo_Web/Service/backend/api_WEB_CLNT_MYP_010201/index.js`
- **API 엔드포인트**: `PATCH /api/clnt/myp/010201`

## ② 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)
| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 화면 ID | `WEB-CLNT-MYP-010102` | `WEB-CLNT-MYP-010201` |
| 백엔드 폴더 | `WEB-CLNT-MYP-010102` | `api_WEB_CLNT_MYP_010201` |
| 호출 경로 | `WEB-CLNT-MYP-010101` → `010102` | `WEB-CLNT-MYP-010200` → `010201` |

- `"회원 탈회를 정말 원하십니까?"` 문구와 `[네]`, `[아니오]` 두 버튼만 표시합니다.
- `[네]` 클릭 시 `TB_USER`의 `USER_STAT_CD`를 `'WITHDRAWN'`으로 업데이트하고 `USER_TEL`, `USER_EMAIL` 컬럼을 `NULL` 처리하며 `TB_USER_SESSION`을 비활성화합니다.
- `[아니오]` 클릭 시 내정보 관리 화면(`WEB-CLNT-MYP-010100`)으로 복귀합니다.

## ③ 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- 모달 본문: `"회원 탈회를 정말 원하십니까?"`
- 하단 버튼: `[네]` (`#D32F2F`), `[아니오]`

## ④ 백엔드 API 명세
- **Endpoint**: `PATCH /api/clnt/myp/010201`
- **Request JSON**: `{ userNo: string }`
- **Response JSON**: `{ success: true, message: "회원 탈회가 완료되었습니다." }`

## ⑤ 연동 데이터베이스 명세
- `TB_USER`: `USER_STAT_CD = 'WITHDRAWN'`, `USER_TEL = NULL`, `USER_EMAIL = NULL` (사전 `ALTER TABLE`로 NULL 허용 필요)
- `TB_USER_SESSION`: `IS_ACTIVE = 'N'`

## ⑥ 테스트 및 검증 체크리스트
- [x] `WEB-CLNT-MYP-010201` 폴더 및 파일 이동 확인
- [x] `guide/05_WEB_화면목록_및_기능명세.md` 및 `guide/06_APP_화면목록_및_기능명세.md` 동기화 확인

## ⑦ 프로그램 유지보수 가이드 및 개발자 주의사항
- 반드시 `lib/db.ts`의 `executeTransaction`으로 미종료 용역 재검증 → `TB_USER` UPDATE → `TB_USER_SESSION` 만료를 원자적으로 처리해야 합니다.
