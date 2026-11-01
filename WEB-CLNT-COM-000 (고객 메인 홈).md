# [SseulDakGo (쓸고닦고)] WEB-CLNT-COM-000 (고객 메인 홈) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-COM-000` |
| **화면명** | 고객 메인 홈 (Client Main Home Hub) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` (고객 전용 메인 포털 허브) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/com_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 매핑**:
   - `WEB-CLNT-COM-000` 화면은 오직 `POST /api/web/client/com_000` 백엔드 엔드포인트와 통신하며, 타 도메인(Partner, Admin)이나 타 화면과 API를 공유하지 않습니다.
2. **공식 브랜드 아이덴티티 준수 (`.cursorrules` 2.5)**:
   - 상단 헤더, 모바일 네비게이션, 푸터에 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png))를 일관되게 사용합니다.
   - 쿠폰 유인 문구를 일체 배제하고 정찰제 현장 직불 및 3대 안심 보증(신원 검증, 영업배상책임 1억원, 현장 직불제 정산)을 표기합니다.
3. **네이버 지도 및 주소 검색 연동**:
   - Naver Cloud Platform (NCP) Maps 및 Geocoding 공통 모듈([`lib/naver-map.js`](file:///Users/handsupbus/project_SseulDakGo/lib/naver-map.js))과 연동하여 실시간 행정구역(시·도, 시·군·구) 전환 및 주소 검색을 지원합니다.
4. **실시간 피드 폴링 및 양방향 이벤트 라우팅**:
   - 10초 주기의 실시간 발주 피드 백그라운드 폴링을 수행하며, 발주 신청(`WEB-CLNT-REQ-000`), 로그인(`WEB-CLNT-ATH-000`), 회원가입(`WEB-CLNT-ATH-010`), 나의 신청현황(`WEB-CLNT-ORD-000`), 견적 상세(`WEB-CLNT-ORD-001`), 시공 검수(`WEB-CLNT-JOB-000`)와의 유기적 모달 및 페이지 전환을 총괄합니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_USER` | 회원 마스터 | 고객(USER_ROLE_CD = 'C') 및 비회원(GUEST) 세션 식별 |
| `TB_COM_CODE` | 공통코드 마스터 | 3대 청소 대분류 코드(`GRP_CD = 'CLEAN_LARGE'` : `REGULAR`, `APPLIANCE`, `MOVEIN`) 메타데이터 조회 |
| `TB_ORDER_MSTR` | 주발주 마스터 | 선택 행정구역 내 최신 발주 공고 목록 피드 5건 조회 |
| `TB_ORDER_DTL` | 발주 상세 | 공고별 시공 상세 규격, 제안가, 공정 상세 정보 조인 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 주요 UI/UX 컴포넌트 구조
1. **GNB 헤더 (`<header>`)**:
   - 공식 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 및 브랜드명 `"쓸고닦고"`
   - 실시간 지역 선택 칩 (기본값: 경기 고양시 일산동구 -> 일산서구 -> 덕양구 -> 서울 강남구 순환 토글)
   - 네비게이션 링크: `홈`, `나의 신청현황`, `이용내역`, `마이`
   - 회원 프로필 및 로그인/로그아웃 버튼
2. **Hero 배너 섹션**:
   - 타이틀: `"정찰제 현장 직불 매칭, 쓸고닦고"`
   - 서브 카피: 거품 없는 투명한 가격과 100% 신원 보증 마스터 직불 매칭
   - 메인 CTA: `[ 견적 요청서 작성하기 ]` -> `WEB-CLNT-REQ-000` 모달 오픈
3. **3대 핵심 청소 서비스 카테고리 카드 (3-Card Grid)**:
   - **정기청소 (`REGULAR`)**: 빌라·원룸·상가 공용부 정기 클리닝 (최소 3개월 보장)
   - **가전청소 (`APPLIANCE`)**: 에어컨, 세탁기 등 계절 가전 분해 살균 세척
   - **입주청소 (`MOVEIN`)**: 이사·입주 전 고온 스팀 방역 및 1:1 맞춤 케어
4. **실시간 발주 현황 라이브 피드 (`Live Request Feed`)**:
   - 선택된 지역의 최근 5건 발주 공고 카드 (발주번호, 서비스명, 주소, 희망 일정, 고객 제안가, 상태 뱃지)
   - 실시간 `BID_OPEN` 핑(Ping) 애니메이션
5. **플랫폼 3대 핵심 안심 보증 배너**:
   - 마스터 신원 검증 & 영업배상책임보험 1억원
   - 에스크로 수수료 없는 현장 직불제 정산
   - 3개월 무상 A/S 보증 안내
6. **푸터 (`<footer>`)**:
   - 회사 정보((주)공간다원, 사업자번호, 통신판매업, 고객센터 02-429-5459)
   - 플랫폼 면책 고지(통신판매중개자로서 거래 당사자가 아니며 에스크로 미보유, 현장 직불 원칙 명시)

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/com_000`
- **구현 함수**: `processWebClntCom000(payload)` 및 Next.js `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "userNo": "C20261000001",
  "sidoCd": "41",
  "sigunguCd": "41281"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "isGuest": false,
  "userInfo": {
    "USER_NO": "C20261000001",
    "USER_NM": "홍길동",
    "USER_ROLE_CD": "C"
  },
  "categoryList": [
    { "GRP_CD": "CLEAN_LARGE", "COM_CD": "REGULAR", "COM_NM": "정기청소", "SORT_ORD": 1 },
    { "GRP_CD": "CLEAN_LARGE", "COM_CD": "APPLIANCE", "COM_NM": "가전청소", "SORT_ORD": 2 },
    { "GRP_CD": "CLEAN_LARGE", "COM_CD": "MOVEIN", "COM_NM": "입주청소", "SORT_ORD": 3 }
  ],
  "feedList": [
    {
      "ORDER_NO": "ORD-20250224-0091",
      "CLEAN_LARGE_CD": "REGULAR",
      "CLEAN_LARGE_NM": "정기청소",
      "ADDR_TEXT": "경기 고양시 일산동구 마두동 4층 빌라 공용부",
      "SUB_SPEC_TEXT": "주 1회 월 4회 방문",
      "PROPOSED_PRICE": 180000,
      "PRICE_PREFIX": "월 ",
      "ORDER_STATUS": "BID_OPEN",
      "ORDER_STATUS_LABEL": "BID_OPEN (청약접수중)",
      "STATUS_BADGE_TYPE": "SECONDARY_PING",
      "REG_DT": "방금 전"
    }
  ],
  "serverTime": "2026-10-31T04:55:00.000Z"
}
```

### 4.4 주요 SQL 쿼리
```sql
-- 1. 고객 회원 식별 쿼리
SELECT USER_NO, USER_NM, USER_ROLE_CD
  FROM TB_USER
 WHERE USER_NO = ? AND USER_ROLE_CD = 'C' AND USE_YN = 'Y'
 LIMIT 1;

-- 2. 3대 청소 대분류 코드 조회
SELECT GRP_CD, COM_CD, COM_NM, SORT_ORD
  FROM TB_COM_CODE
 WHERE GRP_CD = 'CLEAN_LARGE'
   AND COM_CD IN ('REGULAR', 'APPLIANCE', 'MOVEIN')
   AND USE_YN = 'Y'
 ORDER BY SORT_ORD ASC;

-- 3. 지역 내 실시간 발주 피드 조회 (최신 5건)
SELECT 
    M.ORDER_NO,
    D.CLEAN_LARGE_CD,
    C.COM_NM AS CLEAN_LARGE_NM,
    M.ADDR_TEXT,
    D.CLEAN_MID_CD,
    M.ORDER_STATUS,
    M.PROPOSED_PRICE,
    M.REG_DT
  FROM TB_ORDER_MSTR M
 INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
  LEFT JOIN TB_COM_CODE C ON C.GRP_CD = 'CLEAN_LARGE' AND C.COM_CD = D.CLEAN_LARGE_CD
 WHERE M.DEL_YN = 'N'
   AND M.ORDER_STATUS IN ('BID_OPEN', 'CNTR_CONFIRMED')
 ORDER BY M.REG_DT DESC
 LIMIT 5;
```

---

## 5. 검증 및 테스트 결과

1. **빌드 검증**: `preview/web_clnt_com_000.js` 정상 컴파일 완료 (React 18 단독 실행 지원).
2. **로컬 폴백 검증**: MySQL 원격 서버 미연결 시 사전 정의된 시드 데이터를 즉시 공급하여 UI 렌더링 중단 방지.
3. **네비게이션 연동**:
   - `[나의 신청현황]` 클릭 시 `WEB-CLNT-ORD-000` 화면 즉시 렌더링 확인.
   - `[청소 요청하기]` 클릭 시 `WEB-CLNT-REQ-000` 모달 오버레이 확인.

