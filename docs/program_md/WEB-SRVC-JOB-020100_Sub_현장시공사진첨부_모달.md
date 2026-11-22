# [프로그램 상세 명세서] 현장 시공 사진 첨부 모달 (WEB-SRVC-JOB-020100)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-JOB-020100`
- **화면명**: 현장 시공 사진 첨부 모달 (`On-Site Cleaning Photo Upload Modal`)
- **화면 구분**: Sub 화면 (모달 - 메인 `WEB-SRVC-JOB-020000`의 중분류 01번 채번)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020100/index.jsx`
- **백엔드 모듈 경로**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020100/route.js`
- **API 엔드포인트**: `POST /api/web/service/job_020100`
- **호출 트리거**: `WEB-SRVC-JOB-020000` 화면의 `[시공사진첨부]` 버튼 클릭 시 호출

---

## 2. 주요 기능 및 UI/UX 명세
1. **발주 현장 요약 헤더**:
   - 발주번호(예: `SDG-2026-1120`), 고객명(`김충훈 님`), 현장 주소 요약 표시.
2. **3단 작업 구간 탭**:
   - `시공 전 (Before)` / `시공 중 (Ing)` / `시공 후 (After)` 선택 탭 제공.
3. **사진 업로드 영역**:
   - Drag & Drop 드롭존 및 파일 선택기 지원 (최대 20장, 장당 15MB 제한).
   - 모바일/태블릿 접속 시 현장 즉시 카메라 촬영 업로드 연동.
4. **썸네일 그리드 및 관리**:
   - 업로드된 이미지 썸네일 그리드 표출, 대표 사진 지정 뱃지 및 삭제 버튼.
5. **하단 액션 바**:
   - 현재 등록 장수 카운터 (예: `현재 8장 / 최대 20장 등록됨`)
   - `[취소/닫기]`, `[사진 등록 완료]` (클릭 시 이미지 스토리지 업로드 및 DB 적재 후 부모 화면 갱신).

---

## 3. 백엔드 API 규격 (`POST /api/web/service/job_020100`)
- **Request (Multipart/form-data 또는 JSON)**:
```json
{
  "orderNo": "SDG202611200001",
  "contractorNo": "S20261100001",
  "photoPhase": "ING",
  "photos": [
    { "fileUrl": "/storage/orders/SDG202611200001/photo_ing_01.jpg", "caption": "상가 2층 복도 왁싱" }
  ]
}
```
- **Response JSON**:
```json
{
  "success": true,
  "message": "시공 사진 8장이 성공적으로 등록되었습니다.",
  "totalCount": 8
}
```

---

## 4. 연동 데이터베이스 명세
- `TB_ORDER_PHOTO`:
  - `PHOTO_ID`: 사진 고유 식별자
  - `ORDER_NO`: 발주 주문번호
  - `PHASE_CODE`: 'BEFORE', 'ING', 'AFTER'
  - `FILE_PATH`: 로컬 스토리지 또는 S3 파일 경로
  - `IS_REPRESENTATIVE`: 대표 사진 여부 ('Y'/'N')
  - `UPLOAD_DT`: 업로드 일시
