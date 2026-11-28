# WEB-SRVC-COM-010002_Header_시공사파트너대시보드헤더

## ① 아키텍처 개요
- **컴포넌트 ID**: `WEB-SRVC-COM-010002` (`WebSrvcCom010002Header`)
- **역할**: 시공사(`S`) 로그인 시 시공사 파트너 대시보드(`WEB-SRVC-COM-010000`) 상단 GNB 렌더링.

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| Header 위치 | `WebSrvcCom010000` 내부 인라인 `<header>` | 독립 컴포넌트 `WebSrvcCom010002Header` 호출 |

## ③ UI / State 연동 명세
- Props: `userInfo`, `activeNavPath`, `onNavigate`, `unreadNotiCnt`, `onOpenNotification`, `onLogout`.

## ④ 백엔드 API 명세
- 없음 (부모 대시보드 상태 props 연동).

## ⑤ 연동 데이터베이스 명세
- 없음.

## ⑥ 테스트 체크리스트
- [x] 시공사(`S`) 로그인 시 `WebSrvcCom010002Header` 렌더링
- [x] `node scripts/build-preview.js; node --check preview/web_clnt_com_000.js` 정상 빌드

## ⑦ 유지보수 가이드
- 시공사 GNB 메뉴 수정 시 `WebSrvcCom010002Header`만 수정합니다.
- **2026-11-28 (Header 가로 폭 통일)**: `WEB-CLNT-COM-010001`과 동일하게 `max-w-[1440px] w-full mx-auto px-margin-mobile lg:px-margin` 컨테이너 적용.
- **2026-11-28 (시공사 상단 메뉴 개편 및 내 활동 통계 신규 ID 채번)**
  - `.cursorrules` 6.2: `WEB-SRVC-STT-010000` / `APP-SRVC-STT-010000` (`내 활동 통계`) 신규 채번 등록.
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`: 상단 메뉴를 `통합 시공·청약 공정 관리`(해당 섹션 스크롤), `내 활동 내역`(해당 섹션 스크롤), `내 활동 통계`(`WEB-SRVC-STT-010000`), `내 정보 관리`(`WEB-SRVC-MYP-020100` 호출)로 변경.
- **2026-11-28 (시공사 대시보드 섹션 스크롤 연동, 전문분야·자격증 DB 조회 보완, PARTNER DASHBOARD 배지 삭제)**
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`: `"통합 시공·청약 공정 관리"` 및 `"내 활동 내역"` 클릭 시 `WEB-SRVC-COM-010000` 전환 후 해당 섹션으로 스크롤 이동, `"WEB-SRVC-COM-010000 · PARTNER DASHBOARD"` 문구 삭제, `/api/srvc/myp/020100` 연동을 통해 `청소 전문 분야` 및 `보유 자격 및 수료` 조회 출력 보완.
- **2026-11-28 (우측 상단 시공사 프로필 사진, 대표자성명, 회사명 연동)**: `WebSrvcCom010000`에서 조회된 `logoUrl`, `ceoNm`, `compNm`을 `onPartnerProfileLoaded`로 전달받아 우측 상단 헤더에 동일 로고 사진, 대표자성명(`인증회원`), 회사명을 출력하도록 수정.
