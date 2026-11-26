# WEB-SRVC-MYP-010100: 시공사 내정보 및 서비스 지역 관리 (Main)

## ① 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-MYP-010100` (APP 대칭: `APP-SRVC-MYP-010100`)
- **화면명**: 시공사 내정보 및 서비스 지역 관리 (Main)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-MYP-010100/index.jsx`
- **백엔드 모듈**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010100/route.js`
- **API 엔드포인트**: `GET/PATCH /api/srvc/myp/010100`
- **연관 탈회 모달**:
  - `WEB-SRVC-MYP-010200` (`GET /api/srvc/myp/010200`): `SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010200/route.js`
  - `WEB-SRVC-MYP-010201` (`PATCH /api/srvc/myp/010201`): `SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010201/route.js`

## ② 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)
| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 화면 분리 | `WEB-CLNT-MYP-010100`에서 고객/시공사 공용 처리 | `WEB-SRVC-MYP-010100` 시공사 전용 페이지로 독립 분리 |
| 고객 홈 내 시공사 분기 | `WEB-CLNT-COM-010000` 내 `WebSrvcJob020000` 전환 포함 | 고객 홈(`WEB-CLNT-COM-010000`)에서 시공자 홈페이지 분기 제거 |
| 로고 참조 | 텍스트/아이콘 로고 | 공식 로고 `/storage/project/brand/Logo_쓸고딱고.jpg` 출력 |
| 하단 제어 버튼 | 로그아웃/회원탈퇴 위치 혼재 | `계정 및 보안 관리` 하단 `로그아웃 → 탈회(#D32F2F) → 회원탈회 안내` |

## ③ 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- **상단 헤더**: 공식 로고, 시공사 네비게이션(대시보드, 청소·시공 청약, 현장 진행 현황, 내정보 및 지역관리), 인증 시공사(S) 배지.
- **요약 Bento 카드 4종**: 배정 진행 시공, 누적 완공 실적(정산 잔액), 고객 평가 평점, 사업자 인증 상태(등록/갱신 모달 연결).
- **서비스 활동 지역 관리**: 최대 10개 활동 지역 추가/삭제 및 `PATCH /api/srvc/myp/010100` 동기화.
- **계정 및 보안 관리**: 휴대폰 번호 관리, 비밀번호 변경, 하단 `로그아웃 → 탈회(#D32F2F) → 회원탈회 안내`.
- **탈회 모달 연동**: `WEB-SRVC-MYP-010200` (진행 중 용역 검증, 존재 시 버튼 비활성화 및 툴팁 표시) → `WEB-SRVC-MYP-010201` ("회원 탈회를 정말 원하십니까?" [네/아니오]).

## ④ 백엔드 API 명세
- `GET /api/srvc/myp/010100?userNo=...`: 시공사 기본 프로필(`TB_USER`) 및 활동 지역(`TB_SERVICE_REGION`) 조회.
- `PATCH /api/srvc/myp/010100`: 활동 지역 목록(최대 10개) 트랜잭션 갱신.
- `GET /api/srvc/myp/010200?userNo=...`: 미종료 청약/시공 건(`TB_QUOTE_APPLY` + `TB_ORDER_MSTR`) 조회.
- `PATCH /api/srvc/myp/010201`: 미종료 용역 재검증 후 `TB_USER.USER_STAT_CD = 'WITHDRAWN'`, `USER_TEL = NULL`, `USER_EMAIL = NULL` 및 세션 만료 처리.

## ⑤ 연동 데이터베이스 명세
- `TB_USER`, `TB_SERVICE_REGION`, `TB_QUOTE_APPLY`, `TB_ORDER_MSTR`, `TB_USER_SESSION`

## ⑥ 테스트 및 검증 체크리스트
- [x] `WEB-SRVC-MYP-010100/index.jsx` 생성 완료
- [x] `api_WEB_SRVC_MYP_010100`, `010200`, `010201` `route.js` 생성 완료
- [x] `WEB-CLNT-COM-010000/index.jsx` 내 시공자 홈페이지 전환 로직 제거 완료

## ⑦ 프로그램 유지보수 가이드 및 개발자 주의사항
- 모든 백엔드 DB 작업은 반드시 `lib/db.ts`의 `executeQuery`, `executeTransaction`을 사용해야 합니다.

---
## [2026-11-24 업데이트] 알림 센터(WEB-CLNT-COM-010100) 및 바로 청약(WEB-SRVC-QOT-010100) 연동
- 상단 종 아이콘 클릭 시 WEB-CLNT-COM-010100 알림 센터 모달이 열리며 GET /api/common/notifications?userNo=...로 수신된 푸시메시지 목록과 미확인 배지 숫자를 표시합니다.
- 미청약 발주 알림의 [바로 청약하기] 클릭 시 WEB-SRVC-QOT-010100 (확정가 청소용역 청약 신청 모달)을 호출해 POST /api/srvc/qot/010100으로 바로 청약 처리합니다.

- 알림 모달 헤더의 [ID: WEB-CLNT-COM-010100] 문구를 제거하고, 1줄(청소요청구분·발주번호) / 2줄(시·도·군까지만 표기된 현장주소·청소범위·바로청약하기 또는 청약진행상태 버튼) 형식으로 개편했습니다.

- 청약 신청 모달(WEB-SRVC-QOT-010100) 상단의 [ID: WEB-SRVC-QOT-010100] 문구를 제거했습니다.

- 토스트 알림(z-[150])을 청약 모달(z-[100]) 위에 출력되도록 수정하고, 청약 성공 시 알림 목록의 해당 발주 건 상태를 isQuoted: true(청약진행상태)로 즉시 갱신합니다.
- pi_WEB_SRVC_QOT_010100/route.js가 TB_QUOTE_APPLY 실제 DDL(APPLY_NO, ORDER_DTL_NO, PROPOSED_DATE, TIME_SLOT_TYPE, START_TIME, WORK_HOURS, ASSIGN_STAFF_CNT, APPEAL_MSG, APPLY_STAT_CD, REG_ID, MOD_ID) 및 고객 알림(TB_USER_NOTIFICATION)까지 원자적으로 INSERT하도록 보완했습니다.

- pi_WEB_SRVC_QOT_010100/route.js DDL 최종 정합성 반영: D.HOPE_CLEAN_DATE(TB_ORDER_DTL), M.CLIENT_USER_NO(TB_ORDER_MSTR), TB_USER_NOTIFICATION(NOTI_ID, USER_NO, NOTI_TYPE, TITLE, CONTENT, IS_READ).

- 재로그인 시 중복 청약 방지: GET /api/common/notifications에서 TB_QUOTE_APPLY 및 청약 이력을 조회해 이미 청약된 발주건은 isQuoted: true(청약진행상태)로 반환하며, POST /api/srvc/qot/010100에서도 중복 청약 요청 시 409 Conflict로 차단합니다.

- 종 아이콘 미확인 알림 건수(unreadCount) 계산 시 IS_READ === 'N' / isRead === 'N' / READ_YN === 'N' / isRead === false를 모두 포함해 카운트하며, unreadCount > 0일 때만 종 아이콘 우측에 숫자 배지를 출력하도록 수정했습니다.

- 미확인 푸시메시지 건수(unreadCount) 계산 시 IS_READ = 'N' 건수가 0인 경우에도 미청약 발주 알림(!isQuoted) 건수를 반영해 종 아이콘 우측에 건수가 출력되도록 보완했습니다.

- Header 공식 로고(Logo_쓸고딱고.jpg)의 바깥 여백을 제거하고 원형 엠블럼이 선명하게 보이도록 w-12 h-12 rounded-full ring-2 ring-[#006a61]/25 + object-cover scale-125 스타일을 적용했습니다.

- GET /api/common/notifications 및 POST /api/srvc/qot/010100에서 목업 데이터/메모리 fallback을 전면 제거하고, TB_ORDER_MSTR, TB_ORDER_DTL, TB_QUOTE_APPLY 실 데이터만 조회·저장하도록 수정했습니다.

- 프론트엔드(WEB-SRVC-MYP-010100/index.jsx) 내 잔여 목업 발주번호 fallback(ORD-202611-001 등)을 전면 제거하여 실제 DB 조회 결과만 사용하도록 정리했습니다.

- 선착순 1개 시공사 단독 청약 반영: pi_WEB_SRVC_QOT_010100/route.js에서 FOR UPDATE 잠금 검증 후 TB_QUOTE_APPLY INSERT, TB_ORDER_MSTR.ORDER_STATUS = 'CNTR_WAIT_FEE' UPDATE, TB_ORDER_DTL.SERVICE_STATUS = 'APPR_WAIT_FEE' 및 SELECTED_SERVICE_USER_NO UPDATE, TB_USER_NOTIFICATION 고객 알림 INSERT를 원자적으로 처리하며, 프론트엔드에서는 청약 성공 시 unreadCount를 1 감소시킵니다.

- 상단 헤더 종 아이콘 좌측에 라이트/다크 테마 전환 버튼(light_mode/dark_mode)을 추가하고, localStorage.SSEULDAKGO_THEME에 저장해 화이트/다크 배경색 전환이 가능하도록 구현했습니다.
