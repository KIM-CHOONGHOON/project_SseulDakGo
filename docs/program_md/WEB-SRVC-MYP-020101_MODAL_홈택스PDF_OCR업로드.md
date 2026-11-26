# WEB-SRVC-MYP-020101_MODAL_홈택스PDF_OCR업로드

## ① 아키텍처 개요
- **화면 ID**: `WEB-SRVC-MYP-020101` (대칭 APP ID: `APP-SRVC-MYP-020101`)
- **상위 화면**: `WEB-SRVC-MYP-020100` (사업자등록 및 자격증·수료증 통합 관리)
- **백엔드 엔드포인트**: `POST / PUT / DELETE /api/srvc/myp/020101` (`SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_020101/route.js`)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-MYP-020101/index.jsx`

## ② Before / After 대조표
| 구분 | Before | After |
| :--- | :--- | :--- |
| 홈택스 PDF OCR 버튼 | 토스트 안내만 출력 | `WEB-SRVC-MYP-020101` 모달 호출 |
| 사업자 정보 입력 | 수동 입력만 가능 | PDF 업로드 후 OCR 추출 결과 자동 바인딩 |

## ③ UI / State 연동 명세
- `isOcrModalOpen`: `WEB-SRVC-MYP-020100`에서 모달 오픈 제어
- `onApplyData(ocrData)`: 모달에서 `인식 정보 화면에 자동 반영하기` 클릭 시 부모 화면의 `bizName`, `ceoName`, `bizNo` 상태 즉시 갱신

## ④ API 입출력 JSON
- `POST /api/srvc/myp/020101` (`multipart/form-data`: `userNo`, `file`) → `{ success: true, data: { fileUrl, ocrResult } }`
- `PUT /api/srvc/myp/020101` (`application/json`: `{ userNo, ocrData }`) → `{ success: true, data }`
- `DELETE /api/srvc/myp/020101?fileUrl=...` → `{ success: true }`

## ⑤ 연동 DB 및 스토리지 명세
- `TB_USER`: `USER_NO`, `USER_ROLE_CD = 'S'`, `USER_STAT_CD = 'NORMAL'` 권한 검증 (`lib/db.ts` `executeQuery` 사용)
- 로컬 스토리지: `C:\SseulDakGo_Storage\project\service_docs\{YYYYMM}\{USER_NO}\{파일명}.pdf`

## ⑥ 테스트 체크리스트
- [x] `WEB-SRVC-MYP-020100`에서 `홈택스 PDF OCR 업로드` 버튼 클릭 시 `WEB-SRVC-MYP-020101` 모달 오픈
- [x] 모달 내 `인식 정보 화면에 자동 반영하기` 클릭 시 부모 폼에 상호명/대표자/사업자번호 반영

## ⑦ 유지보수 가이드
- PDF 용량 제한(`10MB`) 및 `%PDF-` 시그니처 검증은 `api_WEB_SRVC_MYP_020101/route.js` 상단 상수로 관리합니다.
