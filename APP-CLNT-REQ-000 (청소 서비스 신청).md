# [SseulDakGo (쓸고닦고)] APP-CLNT-REQ-000 (청소 서비스 신청 및 발주서 작성) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `APP-CLNT-REQ-000` |
| **화면명** | 청소 서비스 신청 및 발주서 작성 (Cleaning Service Request Mobile Screen) |
| **지원 채널** | Mobile App (Capacitor / Hybrid WebView 반응형 스크린 & 전체화면 모달) |
| **참조 원본** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx) |
| **모바일 프론트엔드 파일** | [`SseulDakGo_App/Client/screens/APP-CLNT-REQ-000/index.tsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-REQ-000/index.tsx) |
| **모바일 백엔드 라우터** | [`SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_000/route.js) |
| **API 엔드포인트** | `POST /api/app/client/req_000` |
| **네이버 주소 검색 연동** | `POST /api/web/client/search_address` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **연관 테이블** | `TB_ORDER_MSTR`, `TB_ORDER_DTL`, `TB_ORDER_PHOTO`, `TB_COM_CODE` |

---

## 2. 핵심 비즈니스 로직 및 기능 매핑 (WEB-CLNT-REQ-000 100% 동일)

1. **네이버 주소 검색 및 지오코딩 연동**:
   - `MobileNaverAddressSearchModal` 팝업을 통해 네이버 Geocoding/주소 검색 API 실시간 호출.
   - 검색 결과 선택 시 `addrText`(도로명), `sidoCd`, `sigunguCd`, `sidoNm`, `sigunguNm`, `addrDetail`(건물명 자동 부착) 자동 반영.
2. **3대 카테고리 탭 스위처 (`CLEAN_LARGE_CD`)**:
   - `REGULAR`: 정기청소 (`최소 90일` 락 뱃지, icon: `update`)
   - `MOVEIN`: 입주/이사 청소 (icon: `home_work`)
   - `APPLIANCE`: 계절가전/단독시공 (icon: `mode_fan`)
3. **정기청소 개시년월 / 주차 선택 및 3개월 만기 자동 계산 캘린더**:
   - 용역 개시년월(YYYY-MM)과 주차(해당 월의 1주차 ~ 4/5주차 달력 동적 계산) 선택.
   - 용역 만료일은 **개시 시점 기준 정확히 3개월 후의 종료년월 및 주차**로 자동 산출되어 읽기 전용으로 출력.
   - `최소 3개월(90일) 락 보장제` 안내 카드 노출.
   - 90일 미만 계약 시 접수 차단 유효성 검증.
4. **정기 순회 대상 구역 (`cleanMidCdList`) & 방문 주기 및 요일**:
   - 7종 순회 구역: 계단/난간, 복도 및 창틀, 분리수거장, 엘리베이터, 공용 화장실, 외곽 주차면, **기타 (직접 입력란 제공)**.
   - 주간 방문 빈도: 주 1회 / 2회 / 3회 / 5회 버튼 셀렉터.
   - 방문 희망 요일: 선택한 주간 방문 빈도(주 N회)에 맞춰 최대 N개 요일만 선택 가능 (초과 선택 시 안내 팝업, 요일 수 불일치 시 유효성 검증 차단).
   - 관리 면적: 실평수(평) 입력.
5. **입주/이사 및 계절가전 특화 스펙**:
   - 입주청소: 실 공급 평수 (`moveinPyeong`), 희망 작업 시간대 (`MORNING_08`, `AFTERNOON_13`).
   - 가전분해: 천장형 4Way 에어컨 대수, 벽걸이형 에어컨 대수.
6. **발주 금액 및 90일 분기 총액 계산 (시공사 직불 안내)**:
   - 안내 문구: "시공사과의 별도 흥정이 없는 매월 시공사에 지급하는 금액을 작성합니다."
   - 3개월(90일) 분할 지급: "매월 시공 마감 검수 후 해당 월분을 시공사에게 직접 지급합니다."
   - 과세 기준: "부가세 포함" (VAT 포함 표기 통일).
   - 정기청소 시 **90일(3개월) 총 계약액 자동 계산** (`₩540,000원`).
7. **추가 요청 사항 및 특이사항 & 현장 사진 첨부 (최대 10장)**:
   - "추가 요청 사항 및 특이사항" (우측: "현장 전담 마스터 전달용").
   - "현장 사진 첨부": 최대 10장 다중 파일 업로드(`multiple`) 지원, 장수 카운터(`n / 10장`), 첨부 사진 카드, 타이틀, 삭제(`close`), 카메라 촬영/앨범 선택 지원.
8. **플랫폼 안심 매칭 보증료 (`16,500원`) & 현장 직불 공지**:
   - 매칭 성공 시 보증료 16,500원(VAT 포함) 안내 및 인건비 현장 직불 공지 (시공사 결제).
9. **비회원 임시 저장 자동 복원 (Hydration)**:
   - `SSEULDAKGO_GUEST_TEMP_REQ` 로컬스토리지 임시 보관 및 자동 복원.
10. **모바일 스크롤 안전 영역**:
   - 고정 하단 액션바에 가려지지 않도록 하단 스크롤 안전 버퍼 및 패딩(`pb-[200px]`, buffer spacing) 확보.

---

## 3. 모바일 터치 최적화 레이아웃 (APP Screen UX)

- **상단바**: 뒤로가기(`close`), `확정 지정가 발주 시스템` 서브헤더 및 타이틀, `초기화` 액션 버튼.
- **모바일 폼 흐름**:
  1. `기본 고객 및 시공 현장 정보` (업체명, 담당자명, 연락처, 시설유형, 착수일, 네이버 주소 연동, 8종 복합 품목, 계약형태/주차).
  2. `서비스 세부 조건 설정` (탭별 동적 섹션: 정기 90일 락, 6종 순회구역, 빈도, 요일, 평수 / 입주 평수 및 시간대 / 가전 대수).
  3. `발주 금액 및 현장 특이사항` (확정 월 대금, 3개월 총액, 상세 요청 텍스트, 5장 사진, 16,500원 보증료).
- **하단 고정 바 (Sticky Bottom Action Bar)**:
  - Safe area inset 대응 (`pb-safe`).
  - 현재 확정 금액 표시 & `취소` 버튼 & `+ 청소 서비스 신청 완료 (확정 발주)` 버튼.
  - 접수 완료 시 팝업 노출 및 `나의 신청 현황(APP-CLNT-ORD-000)` 이동.

---

## 4. 백엔드 API 명세 (`POST /api/app/client/req_000`)

### 4.1 요청 명세 (Request JSON)
```json
{
  "clientUserNo": "C20261000001",
  "cleanLargeCd": "REGULAR",
  "companyOrOrgNm": "(주)공간다원",
  "contactPersonNm": "홍길동",
  "contactTel": "010-8921-5459",
  "contactEmail": "hong.gd@example.com",
  "facilityTypeCd": "OFFICE",
  "hopeVisitDt": "2026-11-05",
  "parkingAvailCd": "FREE",
  "sidoCd": "41",
  "sigunguCd": "41281",
  "sidoNm": "경기도",
  "sigunguNm": "고양시 일산동구",
  "addrText": "경기 고양시 일산동구 마두동 802-1",
  "addrDetail": "삼혜빌딩 4층 402호 (엘리베이터 유)",
  "proposedPrice": 180000,
  "detailReqNote": "4층 건물이며 1층 분리수거장 및 2~4층 계단·복도 청소 희망합니다.",
  "contractTypeCd": "REGULAR",
  "selectedSrvItems": "STAIR_COMMON,TRASH_RECYCLE",
  "serviceStartDt": "2026-11-10",
  "serviceEndDt": "2027-02-08",
  "contractTermDays": 90,
  "weekCleanFreq": 2,
  "cleanDaysConfig": "WED,FRI",
  "supplyPyeong": 48,
  "cleanMidCd": "MID_STAIR",
  "photoList": [
    { "url": "https://...", "name": "계단_현장01.jpg" }
  ]
}
```

### 4.2 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "orderNo": "ORD2026103100001",
    "orderStatus": "BID_OPEN",
    "proposedPrice": 180000,
    "cleanLargeCd": "REGULAR",
    "cleanMidCd": "MID_STAIR",
    "addrText": "경기 고양시 일산동구 마두동 802-1",
    "addrDetail": "삼혜빌딩 4층 402호 (엘리베이터 유)",
    "regDt": "2026-10-31T05:00:00.000Z"
  },
  "message": "청소 서비스 요청 및 발주서 등록이 성공적으로 완료되었습니다."
}
```
