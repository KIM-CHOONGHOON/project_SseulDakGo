# [SseulDakGo (쓸고닦고)] APP-CLNT-REQ-010100 (청소 서비스 신청 및 발주서 작성) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `APP-CLNT-REQ-010100` |
| **화면명** | 청소 서비스 신청 및 발주서 작성 (Cleaning Service Request Mobile Screen) |
| **지원 채널** | Mobile App (Capacitor / Hybrid WebView 반응형 스크린 & 전체화면 모달) |
| **참조 원본** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010100/index.jsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010100/index.jsx) |
| **모바일 프론트엔드 파일** | [`SseulDakGo_App/Client/screens/APP-CLNT-REQ-010100/index.tsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-REQ-010100/index.tsx) |
| **모바일 백엔드 라우터** | [`SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010100/route.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010100/route.js) |
| **API 엔드포인트** | `POST /api/app/client/req_010100` |
| **네이버 주소 검색 연동** | `POST /api/app/client/search_address` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **연관 테이블** | `TB_ORDER_MSTR`, `TB_ORDER_DTL`, `TB_ORDER_APPLIANCE_ITEM`, `TB_ORDER_PHOTO`, `TB_USER` |

---

## 2. 핵심 비즈니스 로직 및 기능 매핑 (WEB-CLNT-REQ-010100 100% 동일)

1. **3개 청소 유형 중 단 1개만 단일 선택 (택 1 원칙)**:
   - 모바일 화면 상단 세그먼트 셀렉터에서 `REGULAR`(정기청소), `MOVEIN`(입주/이사청소), `APPLIANCE`(계절가전청소) 중 **오직 1개만 단일 선택**.
   - 복수 선택 신청은 원천 차단되며, 1개 신청 당 `TB_ORDER_DTL` 1건(`{ORDER_NO}01`)만 단일 생성.
2. **청소 희망 일자 및 시작 시각 필수 입력 (`HOPE_CLEAN_DATE`, `HOPE_CLEAN_TIME`)**:
   - 모바일 네이티브 날짜/시각 픽커를 통해 청소 희망일자와 시작 시각(예: 14:00)을 필수로 입력.
   - 3단계 시공사 청약 지원 시 **스케줄 중복 청약 원천 차단(`ERR_SCHEDULE_CONFLICT`)** 기준 데이터로 활용.
3. **고객 거래제한(선취소 8일/10회 영구) 사전 검증**:
   - 고객의 `TB_USER.USER_STAT_CD`가 `PERMANENT_BLOCKED`이거나, `SUSPEND_EXPIRE_DT >= NOW()`인 경우 발주서 등록 차단(`ERR_CLIENT_RESTRICTED`, HTTP 403).
4. **네이버 주소 검색 및 지오코딩 연동**:
   - `MobileNaverAddressSearchModal` 팝업을 통해 도로명 주소 및 상세 주소 입력.
5. **정기청소 최소 3개월(90일) 락 검증**:
   - 계약 시작일과 종료일 간격이 90일 미만일 경우 신청 버튼 비활성화 및 경고 토스트 팝업.
6. **확정 제안 금액(지정가) 및 100% 현장 직불 원칙 고지**:
   - 역경매 수수료 없이 고객이 기사님께 직접 현장 지급하는 확정가 입력.
   - 시공사 최종 낙점 시 고객 매칭 이용료 16,500원(고정) 결제 안내.
7. **현장 사진 촬영 및 앨범 첨부 (최대 5장)**:
   - Capacitor Camera 플러그인을 활용한 현장 즉석 촬영 또는 갤러리 업로드 (`TB_ORDER_PHOTO`).
8. **등록 완료 후 푸시 발송 트리거**:
   - 발주 등록 즉시 해당 지역 시공사에게 푸시 메시지 발송 (`[역삼동 34평 입주청소] 11월 20일 14:00 시작, 확정가 500,000원의 청소 일감이 등록되었습니다. 일정을 확인하고 청약하세요!`).
