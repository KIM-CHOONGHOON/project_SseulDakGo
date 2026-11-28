# WEB-SRVC-MYP-020100 (사업자등록 및 자격증·수료증 통합 관리)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-MYP-020100` (APP: `APP-SRVC-MYP-020100`)
- **프론트엔드 파일**:
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\frontend\WEB-SRVC-MYP-020100\index.jsx`
  - `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Client\frontend\WEB-CLNT-COM-010000\index.jsx` (임베디드 `WebSrvcMyp020100`)
- **백엔드 API**: `GET / PUT /api/srvc/myp/020100`, `GET /api/srvc/myp/020101` (`preview/server.js`)

## 2. 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)

| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 사업자 정보 조회 | 하드코딩된 초기값(`김태호`, `120-88-29401`) | `GET /api/srvc/myp/020101?userNo=...`로 `TB_SERVICE_DOC` 실 데이터 조회 |
| 자격·수료증 목록 | `INITIAL_CERTS` 목업 배열 출력 | `GET /api/srvc/myp/020100?userNo=...`로 `TB_SERVICE_CERT` 실 데이터 조회 |
| 등록 건수 제한 문구 | `최대 5건`, `주력 분야 우선 정렬`, `(N/5건 등록됨)` | 건수 제한 문구 삭제, `(N건 등록됨)` 출력 |
| 버튼명 | `홈택스 PDF OCR 업로드`, `사업자 및 자격·수료 정보 저장` | `사업자 등록증 업로드`, `내 정보 저장` |

## 3. 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- `bizName`, `ceoName`, `bizNo`: `TB_SERVICE_DOC` 연동 상태
- `certs`: `TB_SERVICE_CERT` 연동 배열 상태 (`[]` 초기화 후 API 조회 바인딩)
- `isOcrModalOpen`: `WEB-SRVC-MYP-020101` 모달 호출 상태

## 4. 백엔드 API 명세
- `GET /api/srvc/myp/020100?userNo=...` → `{ success: true, certs: [...] }`
- `PUT /api/srvc/myp/020100` → `{ userNo, bizName, ceoName, bizNo, certs }` 저장

## 5. 연동 데이터베이스 명세
- `TB_SERVICE_DOC` (`USER_NO`, `COMP_NM`, `CEO_NM`, `BIZ_REG_NO`, `OPEN_DT`, `TAX_TYPE_NM`, `IND_CD`, `IND_NM`, `VERIFY_YN`)
- `TB_SERVICE_CERT` (`CERT_SEQ`, `USER_NO`, `CERT_NM`, `ISSUER_ORG`, `SERVICE_CAT`, `CERT_LEVEL`, `ISSUE_DT`, `CERT_NO`, `VERIFY_STAT_CD`)

## 6. 테스트 및 검증 체크리스트
- [x] `PUT /api/srvc/myp/020100` 실 DB 저장 확인 (`200 true`)
- [x] `GET /api/srvc/myp/020100` / `GET /api/srvc/myp/020101` 실 DB 조회 확인

## 7. 프로그램 유지보수 가이드
- `WEB-SRVC-MYP-020100/index.jsx` 수정 시 `WEB-CLNT-COM-010000/index.jsx` 임베디드 `WebSrvcMyp020100`도 동일하게 동기화해야 합니다.

- **2026-11-28 (청소 용역 구분 섹션 추가 및 섹션 박스 파랑색 외곽선 적용)**
  - `SseulDakGo_Web/Service/frontend/WEB-SRVC-MYP-020100/index.jsx`:
    - `1. 사업자등록 및 국세청 진위확인` 섹션 박스 외곽선을 파랑색(`border-2 border-blue-500`)으로 변경.
    - `2. 청소 용역 구분` 섹션 신설(파랑색 외곽선 `border-2 border-blue-500`), 내부에 `정기청소`, `입주청소`, `계절가전 청소` 체크박스(전체 또는 개별 선택 가능) 추가.
    - 기존 `2. 표준 자격·수료 항목 검색 및 등록` 제목을 `3. 표준 자격·수료 항목 검색 및 등록`으로 변경하고 박스 외곽선을 파랑색(`border-2 border-blue-500`)으로 변경.
- **2026-11-28 (홈택스 PDF OCR 모달 초기 사업자 정보 동기화)**
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`: `WebSrvcMyp020101` 모달이 `WebSrvcMyp020100`에서 조회된 `bizName`, `ceoName`, `bizNo`를 `initialBizData`로 전달받아 모달 오픈 시 `ocrData`에 동기화하도록 수정(하드코딩된 `120-88-29401` 불일치 해소).
- **2026-11-28 (청소 용역 구분 및 자격·수료 다건 저장/조회 API 연동 보완)**
  - `preview/server.js`: `PUT /api/srvc/myp/020100`에서 `cleanServiceTypes`(청소 용역 구분) 및 `certs` 배열(다건)을 `TB_PARTNER_BIZ` / `TB_SERVICE_CERT` / `TB_PARTNER_CERT`에 저장하도록 보완하고, `GET /api/srvc/myp/020100`에서 `certs` 및 `cleanServiceTypes`를 함께 반환하도록 수정.
  - `SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`: `"내 정보 저장"` 클릭 시 `cleanServiceTypes`와 `certs` 배열을 함께 전송하도록 수정.
