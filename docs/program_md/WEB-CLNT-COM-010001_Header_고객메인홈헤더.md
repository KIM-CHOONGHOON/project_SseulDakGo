# WEB-CLNT-COM-010001_Header_고객메인홈헤더

## ① 아키텍처 개요
- **컴포넌트 ID**: `WEB-CLNT-COM-010001` (`WebClntCom010001Header`)
- **역할**: 비회원 및 로그아웃 복귀 시 고객 메인 홈(`WEB-CLNT-COM-010000`) 상단 GNB 렌더링.

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| Header 위치 | `WebClntCom010000` 내부 인라인 `<header>` | 독립 컴포넌트 `WebClntCom010001Header` 호출 |

## ③ UI / State 연동 명세
- Props: `userInfo`, `onLogoClick`, `onOpenReqModal`, `onScrollLiveMatching`, `onOpenAboutModal`, `onOpenLoginModal`, `onOpenSignupModal`, `onLogout`.

## ④ 백엔드 API 명세
- 없음 (순수 UI Header 컴포넌트).

## ⑤ 연동 데이터베이스 명세
- 없음.

## ⑥ 테스트 체크리스트
- [x] 비회원/로그아웃 시 `WebClntCom010001Header` 렌더링
- [x] `node scripts/build-preview.js; node --check preview/web_clnt_com_000.js` 정상 빌드

## ⑦ 유지보수 가이드
- 본문(`<main>`, `<footer>`)과 분리되어 있으므로 메뉴 수정 시 `WebClntCom010001Header`만 수정합니다.
- **2026-11-28 (Header 가로 폭 메인 히어로 배너와 동일 정렬)**: `max-w-[1440px] w-full mx-auto px-margin-mobile lg:px-margin` 컨테이너를 적용하여 히어로 배너 가로 크기에 맞춤.
