# WEB-CLNT-COM-010300 (쓸고딱고 브랜드 로고 뷰어 Modal)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-CLNT-COM-010300` (APP: `APP-CLNT-COM-010300`)
- **프론트엔드 파일**:
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Client\frontend\WEB-CLNT-COM-010300\index.jsx`
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Client\frontend\WEB-CLNT-COM-010000\index.jsx` (임베디드 `WebClntCom010300`)

## 2. 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)

| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 좌상단 로고 클릭 | 역할별 홈 이동 | `WEB-CLNT-COM-010300` 모달로 `Logo_쓸고딱고.jpg` 그림만 여백 없이 출력 + 하단 `닫기` 버튼 |
| GNB `홈` 버튼 | 없음 | `통합 시공·청약 공정 관리` 앞(및 GNB 최좌측)에 `홈` 버튼 추가: 비로그인(`WEB-CLNT-COM-010000`), 이용자(`WEB-CLNT-COM-010200`), 시공사(`WEB-SRVC-COM-010000`) |

## 3. 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- `isBrandLogoModalOpen` (`boolean`): 좌상단 로고 클릭 시 `true`, `닫기` 버튼 또는 배경 클릭 시 `false`.

## 4. 백엔드 API 명세
- 정적 이미지 `/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg` (`C:\SseulDakGo_Storage\sseuldakgo\logo\Logo_쓸고딱고.jpg`) 직접 서빙.

## 5. 연동 데이터베이스 명세
- 해당 없음 (UI 전용 모달).

## 6. 테스트 및 검증 체크리스트
- [x] `node scripts/build-preview.js` & `node --check preview/web_clnt_com_000.js` 통과

## 7. 프로그램 유지보수 가이드
- `Logo_쓸고딱고.jpg`는 플랫폼 공식 로고이므로 수정하지 않고 `object-cover scale-110`으로 여백 없이 렌더링합니다.
