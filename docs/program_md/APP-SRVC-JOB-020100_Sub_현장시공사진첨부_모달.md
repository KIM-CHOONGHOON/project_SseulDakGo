# [프로그램 상세 명세서] 현장 시공 사진 첨부 모달 (APP-SRVC-JOB-020100)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `APP-SRVC-JOB-020100`
- **화면명**: 현장 시공 사진 첨부 모달/바텀시트 (`On-Site Cleaning Photo Upload Native Modal`)
- **화면 구분**: Sub 화면 (모달/바텀시트 - 메인 `APP-SRVC-JOB-020000`의 중분류 01번 채번)
- **프론트엔드 경로**: `SseulDakGo_App/Service/screens/APP-SRVC-JOB-020100/index.tsx`
- **백엔드 모듈 경로**: `SseulDakGo_App/Service/backend/api_APP_SRVC_JOB_020100/route.js`
- **API 엔드포인트**: `POST /api/app/service/job_020100`
- **호출 트리거**: `APP-SRVC-JOB-020000` 화면의 `[시공사진첨부]` 버튼 터치 시 호출

---

## 2. 주요 기능 및 모바일 UI/UX 명세
1. **발주 현장 요약 헤더**:
   - 발주번호(`SDG-2026-1120`), 고객명(`김충훈 님`), 현장 주소 간략 표출.
2. **3단 작업 구간 세그먼트 탭**:
   - `시공 전 (Before)` / `시공 중 (Ing)` / `시공 후 (After)` 원터치 세그먼트 전환.
3. **모바일 네이티브 카메라 & 갤러리 업로드**:
   - 모바일 기기 카메라 즉시 촬영 (`navigator.mediaDevices.getUserMedia` 또는 Capacitor Camera 플러그인)
   - 사진 갤러리 다중 이미지 선택 (최대 20장, 장당 15MB 제한)
4. **썸네일 그리드 및 관리**:
   - 모바일 3열 썸네일 그리드 표출, 대표 사진 지정 뱃지 및 원터치 삭제 버튼.
5. **하단 액션 바**:
   - 등록 장수 카운터 (`현재 8장 / 최대 20장 등록됨`)
   - `[닫기]`, `[사진 등록 완료]` (업로드 완료 후 햅틱 피드백 및 토스트 알림).

---

## 3. 백엔드 API 규격 (`POST /api/app/service/job_020100`)
- **WEB/APP 백엔드 비즈니스 로직 동등성 원칙**에 따라 `WEB-SRVC-JOB-020100`과 100% 동일한 API 엔드포인트 로직 유지.
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
