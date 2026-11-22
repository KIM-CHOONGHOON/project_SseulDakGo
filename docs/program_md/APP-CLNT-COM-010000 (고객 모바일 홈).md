# [SseulDakGo (쓸고닦고)] APP-CLNT-COM-010000 (고객 모바일 홈) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `APP-CLNT-COM-010000` |
| **화면명** | 고객 모바일 홈 (Client Mobile Home Hub - Capacitor / WebView Hybrid) |
| **지원 채널** | Mobile App (iOS / Android / Mobile Web) |
| **아키텍처 방식** | **웹뷰 기반 하이브리드 앱 (Capacitor / WebView Shell)**<br>순수 웹용 React(Next.js / Vite)로 개발한 반응형 웹페이지를 네이티브 웹뷰 껍데기 안에 패키징 |
| **도메인 역할** | `Client` (고객 전용 모바일 메인 포털 허브) |
| **프론트엔드 파일** | [`SseulDakGo_App/Client/screens/APP-CLNT-COM-010000/index.tsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-COM-010000/index.tsx)<br>[`SseulDakGo_App/Client/screens/APP-CLNT-COM-010000/index.jsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-COM-010000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_App/Client/backend/api_APP_CLNT_COM_010000/route.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_App/Client/backend/api_APP_CLNT_COM_010000/route.js) |
| **API 엔드포인트** | `POST /api/app/client/com_010000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **Capacitor / WebView 네이티브 브릿지 지원**:
   - iOS/Android 단말 Safe Area Insets (`pt-safe`, `pb-safe`) 적용 및 햅틱 진동 연동.
2. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 모바일 전용 홈 데이터(고객 정보, 피드, 카테고리 메타데이터)는 오직 `POST /api/app/client/com_010000`에서 전담.
3. **공식 브랜드 아이덴티티 준수**:
   - 공식 상표 로고([`/logo.png`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/public/logo.png)) 적용, 100% 고객 지정 확정가 정찰제, 현장 직불 및 3개월 안심보증 명시.
4. **플로팅 패스트 발주 CTA 바**:
   - 하단 고정 `[ + 우리 집 청소 요청 등록하기 ]` 터치 시 발주 신청 모달(`APP-CLNT-REQ-010100`)을 호출.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_USER` | 회원 마스터 | 고객(C) 식별, 인증회원 배지 표시, 거래제한(`SUSPEND_EXPIRE_DT`, `USER_STAT_CD`) 조회 |
| `TB_COM_CODE` | 공통코드 마스터 | 3대 청소 대분류 코드(`GRP_CD = 'CLEAN_LARGE'`) 메타데이터 조회 |
| `TB_ORDER_MSTR` | 주발주 마스터 | 선택 지역 내 실시간 발주 오더 목록 5건 및 상태 조회 |
| `TB_ORDER_DTL` | 발주 상세 | 오더별 대/중분류 코드 및 세부 시공 규격 조인 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 구성 요소
1. **Top Brand & GNB Header Box**:
   - 브랜드 로고, `쓸고닦고` 타이틀, `고객용` 역할 태그
   - 우측 액션: `알람 종 아이콘` -> `로그인` -> `회원가입` (로그인 시 `사용자명` -> `로그아웃`)
2. **Hero Section (메인 타이틀 & 3대 청소 퀵 카드)**:
   - **건물 정기관리 (`REGULAR`)**: 최소 3개월(90일) 락, 계단/복도/외곽 케어 (카드 클릭 시 정기청소 선택 모달 오픈)
   - **가전 분해청소 (`APPLIANCE`)**: 에어컨/세탁기 고압스팀 살균 (카드 클릭 시 가전청소 선택 모달 오픈)
   - **입주/이사 대청소 (`MOVEIN`)**: 실내 전용공간 미세분진/찌든때 정밀케어 (카드 클릭 시 입주청소 선택 모달 오픈)
3. **쓸고딱고 배너**:
   - "시공사 청약이 완료되면 시공사의 별점, 후기글을 참고하세요. 청소 요청 전체에 대해 최대 3회 시공사를 변경할 수 있습니다."
4. **실시간 접수 정보 (Live Feed - 5건)**:
   - 실시간 접수 상태(`청약접수중`, `청약확정`, `시공완료`), 서비스 분류, 시공 주소, 청소 희망 일시, 확정 제안금액 표출.
5. **하단 고정 플로팅 바**:
   - 플로팅 CTA: **`+ 우리 집 청소 요청 등록하기`**

---

### 3.2 '우리 집 청소 요청 등록하기' 터치 시 인터랙션 및 프론트엔드 처리 기준

```
[사용자: '+ 우리 집 청소 요청 등록하기' 터치]
           │
           ▼
[1. 고객 세션 및 거래제한 여부 검증]
 ├─ 비로그인 상태인 경우 ──> [로그인 모달 (APP-CLNT-ATH-010100)] 오픈
 ├─ 거래 제한 고객 (8일 정지 또는 10회 영구 정지) ──> [거래제한 안내 바텀시트] 출력 후 진입 차단
 └─ 정상 로그인 고객 ──> 다음 단계 진행
           │
           ▼
[2. 모바일 청소 서비스 신청 모달 (APP-CLNT-REQ-010100) 오픈]
 ├─ ★ 3개 카테고리 중 단 1개만 단일 선택 (택 1: REGULAR / MOVEIN / APPLIANCE)
 ├─ 네이버 도로명 주소 검색 (MobileNaverAddressSearchModal)
 ├─ ★ 청소 희망 일자(HOPE_CLEAN_DATE) 및 시작 시각(HOPE_CLEAN_TIME, 예: 14:00) 필수 지정
 ├─ 선택 유형별 세부 스펙 입력 (정기 90일 의무 락 / 입주 공급평수 / 가전 기기 대수)
 └─ 확정 용역 대금 (100% 현장 직불 지정가, PROPOSED_PRICE > 0) 입력
           │
           ▼
[3. 발주 등록 요청 전송 (POST /api/app/client/req_010100)]
 ├─ TB_ORDER_MSTR 1건 생성 (ORDER_STATUS = 'BID_OPEN')
 ├─ TB_ORDER_DTL 1건 생성 (ORDER_DTL_NO = {ORDER_NO}01, SERVICE_STATUS = 'WAIT_BID')
 └─ 해당 지역 시공사 대상 일감 푸시 알림 발송 트리거
           │
           ▼
[4. 등록 완료 후 처리]
 ├─ 등록 완료 알림 토스트 ("공고가 등록되었습니다. 시공사 청약 대기 중")
 └─ 모바일 홈 실시간 피드에 신규 발주 공고 1순위 반영
```

---

### 3.3 ★ 없어진 기능 (완전 삭제된 기능 명세)

| 구분 | 없어진 기능 | 삭제 사유 및 변경된 기준 |
| :--- | :--- | :--- |
| **기능 삭제** | **복수 청소 카테고리 동시 신청 탭 기능** | 고객 혼선 방지 및 단일 책임 계약 원칙에 따라, **"정기청소", "입주청소", "계절가전청소" 중 오직 1개만 선택(택 1)**하여 발주하도록 일원화됨. |
| **화면/모달 삭제** | **동일 시공 현장 주소 확인 모달 (`WEB-CLNT-REQ-010101`)** | 과거 복수 탭 작성 시 주소 중복을 확인하던 기능으로, **단일 선택 발주 체계 전환에 따라 해당 모달 및 연동 로직 완전 삭제**. |
| **백엔드/DB 삭제** | **다건 `ORDER_DTL` 생성 및 합산 로직** | 발주 1건당 상세 품목(`TB_ORDER_DTL`)은 오직 **1건(`{ORDER_NO}01`)만 단일 생성**되며, 복수 서비스 합산 로직 삭제. |
| **용어 삭제** | **"전담 마스터 배차" 용어 삭제** | 플랫폼의 자율 청약 및 고객 선택 구조에 맞추어 **'청약 확정'**으로 표준화하고 '배차' 용어 삭제. |

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/app/client/com_010000`
- **구현 함수**: `processAppClntCom010000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "clientUserNo": "C20261100001",
  "sidoCd": "41",
  "sigunguCd": "41281"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "userInfo": {
      "userNo": "C20261100001",
      "userNm": "홍길동",
      "userRoleCd": "C",
      "userStatCd": "NORMAL",
      "suspendExpireDt": null,
      "cancelAccumulatedCnt": 0,
      "isGuest": false,
      "isCertified": true
    },
    "categoryList": [
      { "GRP_CD": "CLEAN_LARGE", "COM_CD": "REGULAR", "COM_NM": "정기청소", "SORT_ORD": 1 },
      { "GRP_CD": "CLEAN_LARGE", "COM_CD": "APPLIANCE", "COM_NM": "가전청소", "SORT_ORD": 2 },
      { "GRP_CD": "CLEAN_LARGE", "COM_CD": "MOVEIN", "COM_NM": "입주청소", "SORT_ORD": 3 }
    ],
    "feedList": [
      {
        "orderNo": "ORD2026111500001",
        "cleanLargeCd": "MOVEIN",
        "cleanLargeNm": "입주청소",
        "addrText": "서울 강남구 역삼동 34평 아파트",
        "hopeCleanDate": "2026-11-20",
        "hopeCleanTime": "14:00",
        "proposedPrice": 500000,
        "orderStatus": "BID_OPEN",
        "orderStatusLabel": "청약접수중",
        "regDtText": "방금 전"
      }
    ],
    "serverTime": "2026-11-15T14:35:00.000Z"
  }
}
```

---

## 5. 검증 및 테스트 결과

1. **플로팅 CTA 터치 검증**: `+ 우리 집 청소 요청 등록하기` 터치 시 `APP-CLNT-REQ-010100` 모달이 오픈되며 단 1개의 카테고리만 선택 가능함을 확인.
2. **거래제한 고객 차단 검증**: 제재 중인 고객이 등록 시도 시 제재 만료일 안내 및 등록 차단 확인.
3. **삭제된 기능 검증**: 주소 중복 확인 팝업(`010101`) 호출 없이 단일 폼에서 즉시 등록 완료됨을 확인.
