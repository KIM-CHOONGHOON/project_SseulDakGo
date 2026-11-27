# WEB-SRVC-MYP-020101 (사업자 등록증 업로드 Modal)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-MYP-020101` (APP: `APP-SRVC-MYP-020101`)
- **프론트엔드 파일**: `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\frontend\WEB-SRVC-MYP-020101\index.jsx`
- **백엔드 파일**: `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\backend\api_WEB_SRVC_MYP_020101\route.js`
- **API 엔드포인트**: `POST / PUT / DELETE /api/srvc/myp/020101` (`preview/server.js` 어댑터 연동)

## 2. 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)

| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| PDF 텍스트 추출 | `pdf-parse` 단독 사용 (스캔본 PDF 시 빈 문자열 반환) | `pdf-parse` 우선 추출 후 빈 문자열 시 `tesseract.js` (`kor+eng`) OCR 폴백 수행 |
| 정규식 파싱 | 고정 공백 패턴으로 `사업자등록번호`, `개업일` 누락 가능 | 하이픈 주변 공백 및 `개 업 일`~날짜 사이 공백/개행 허용 정규식 적용 |
| 국세청 진위확인 | 미연동 | `PUT /api/srvc/myp/020101` 저장 전 국세청 `validate` API(`NTS_API_BASE_URL`, `NTS_API_SERVICE_KEY`) 실시간 검증 후 계속사업자(`01`)만 `TB_SERVICE_DOC` 저장 허용 |
| 부모 화면 연동 | `홈택스 PDF OCR 업로드` 버튼명 | `사업자 등록증 업로드` / `내 정보 등록`으로 버튼명 변경 (`WEB-SRVC-MYP-020100`) |

## 3. 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- `fileInfo`: 업로드된 PDF 파일명, 크기, 발급번호
- `ocrData`: `bizName`, `ceoName`, `bizNo`, `openDateAndType`, `industryCode`, `industryName`, `bizStatCd`
- 업로드 성공 시 `setOcrData`로 추출 결과를 바인딩하고 `onApplyData`를 통해 부모 화면(`WEB-SRVC-MYP-020100`)에 반영.

## 4. 백엔드 API 명세 (`POST /api/srvc/myp/020101`)
- **Request**: `multipart/form-data` (`userNo`, `file`: PDF, 최대 10MB)
- **Response JSON**: `{ success: true, data: { issueNo, ocrResult: { bizName, ceoName, bizNo, openDateAndType, industryCode, industryName, bizStatCd } } }`

## 5. 연동 데이터베이스 명세
- `TB_USER` (`USER_NO`, `USER_ROLE_CD`, `USER_STAT_CD`)
- `TB_SERVICE_DOC` (`USER_NO`, `COMP_NM`, `CEO_NM`, `BIZ_REG_NO`, `OPEN_DT`, `TAX_TYPE_NM`, `IND_CD`, `IND_NM`, `OCR_PDF_PATH`, `OCR_RAW_JSON`, `VERIFY_YN`)

## 6. 테스트 및 검증 체크리스트
- [x] `tesseract.js` 패키지 설치 및 `api_WEB_SRVC_MYP_020101/route.js` OCR 폴백 반영
- [x] `TB_USER` 시공사 계정(`S20261100002`) 확인 및 `POST /api/srvc/myp/020101` 연동 확인
- [x] `node scripts/build-preview.js` & `node --check preview/web_clnt_com_000.js` 통과

## 7. 프로그램 유지보수 가이드
- Express 프리뷰 서버(`preview/server.js`)는 `app.all('/api/srvc/myp/020101')`에서 Web `Request`로 변환하여 `route.js`를 호출합니다.
