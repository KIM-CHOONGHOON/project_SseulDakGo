# WEB-CLNT-COM-010201_Header_고객전용홈대시보드헤더

## ① 아키텍처 개요
- **컴포넌트 ID**: `WEB-CLNT-COM-010201` (`WebClntCom010201Header`)
- **역할**: 이용자(`C`) 로그인 시 고객 전용 홈 대시보드(`WEB-CLNT-COM-010200`) 상단 GNB 렌더링.

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| Header 위치 | `WebClntCom010200` 내부 인라인 `<header>` | 독립 컴포넌트 `WebClntCom010201Header` 호출 |

## ③ UI / State 연동 명세
- Props: `profile` (`userNm`, `badgeLabel`, `roleLabel`, `unreadNotiCnt`), `onNavigate`, `onOpenReqModal`, `onOpenOrderList`, `onOpenInspection`, `onOpenNotification`, `onLogout`.

## ④ 백엔드 API 명세
- `GET /api/clnt/com/010200`의 `clientProfile.unreadNotiCnt`와 연동.

## ⑤ 연동 데이터베이스 명세
- `TB_USER_NOTIFICATION` (미확인 푸시 알림 건수).

## ⑥ 테스트 체크리스트
- [x] 이용자(`C`) 로그인 시 `WebClntCom010201Header` 렌더링
- [x] `node scripts/build-preview.js; node --check preview/web_clnt_com_000.js` 정상 빌드

## ⑦ 유지보수 가이드
- 로고 우측 `CLIENT PORTAL` / `공간 맞춤 직불 매칭` 문구 미포함 상태를 유지합니다.
- **2026-11-28 (Header 가로 폭 통일)**: `WEB-CLNT-COM-010001`과 동일하게 `max-w-[1440px] w-full mx-auto px-margin-mobile lg:px-margin` 컨테이너 적용.
