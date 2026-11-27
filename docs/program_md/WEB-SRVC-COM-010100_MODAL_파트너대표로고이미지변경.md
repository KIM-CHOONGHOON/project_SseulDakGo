# WEB-SRVC-COM-010100 (파트너 대표 로고 이미지 변경 Modal)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-COM-010100` (APP: `APP-SRVC-COM-010100`)
- **프론트엔드 파일**: `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\frontend\WEB-SRVC-COM-010100\index.jsx`
- **백엔드 파일**: `c:\GongGanDaWon_Project\project_SseulDakGo\SseulDakGo_Web\Service\backend\api_WEB_SRVC_COM_010100\route.js`
- **API 엔드포인트**: `GET / POST / DELETE /api/srvc/com/010100`

## 2. 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)

| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 로고변경 버튼 동작 | 토스트 안내만 출력 | `WEB-SRVC-COM-010100` 모달 오픈 및 실시간 로고 업로드/초기화 |
| 파일 저장 경로 | 미구현 | `C:\SseulDakGo_Storage\project\partner_logo\{YYYYMM}\{USER_NO}\LOGO_{USER_NO}_{YYYYMMDDHHmmss}_{랜덤4자리}.{ext}` |
| 파일 용량 검증 | 5MB 초과 시 안내 후 재선택 불가 가능 | 5MB 초과 시 `"파일 크기는 5MB 이하만 업로드 됩니다"` 안내 및 `<input type="file">` 초기화로 즉시 재업로드 가능 |
| DB 연동 | 미구현 | `TB_USER.PROFILE_IMG_URL` 및 `TB_SERVICE_DOC.LOGO_*` 트랜잭션 저장 |

## 3. 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- `currentLogoUrl`, `previewUrl`, `selectedFile`, `stagedMeta`, `isDragging`, `isSubmitting`
- 파일 선택 시 `URL.createObjectURL()`로 우측 '변경 적용 미리보기' 및 하단 '고객 청약 선택 화면 노출 미리보기' 즉시 렌더링.

## 4. 백엔드 API 명세 (`GET / POST / DELETE /api/srvc/com/010100`)
- `GET`: `TB_USER` + `TB_SERVICE_DOC` 조인 조회 후 `currentLogoUrl`, `origFileName`, `storedFileName` 반환.
- `POST` (`multipart/form-data`, `logoFile`): MIME(`image/jpeg`, `image/png`, `image/webp`) 및 5MB 이하 검증 → 디스크 저장 → `executeTransaction`으로 `TB_SERVICE_DOC` UPSERT & `TB_USER.PROFILE_IMG_URL` UPDATE → 구 파일 삭제.
- `DELETE`: `TB_USER.PROFILE_IMG_URL = NULL` 및 `TB_SERVICE_DOC` 로고 컬럼 `NULL` 초기화 후 물리 파일 삭제.

## 5. 연동 데이터베이스 명세
- `TB_USER`: `PROFILE_IMG_URL`, `MOD_ID`, `MOD_DT`
- `TB_SERVICE_DOC`: `LOGO_ORIG_FILE_NM`, `LOGO_STORED_FILE_NM`, `LOGO_PHYS_PATH`, `LOGO_FILE_SIZE`, `LOGO_EXT`, `MOD_ID`, `MOD_DT`

## 6. 테스트 및 검증 체크리스트
- [x] `POST /api/srvc/com/010100` 가상 이미지 업로드 → `TB_USER`, `TB_SERVICE_DOC` 반영 및 물리 파일 생성 확인
- [x] `GET /api/srvc/com/010100` 조회 확인
- [x] `DELETE /api/srvc/com/010100` 초기화 및 물리 파일 삭제 확인
- [x] `node scripts/build-preview.js` & `node --check preview/web_clnt_com_000.js` 통과

## 7. 프로그램 유지보수 가이드
- 플랫폼 공식 로고(`C:\SseulDakGo_Storage\project\brand\Logo_쓸고딱고.jpg`)는 절대 수정하지 않으며, 시공사 개별 로고는 `partner_logo` 하위에만 저장합니다.
