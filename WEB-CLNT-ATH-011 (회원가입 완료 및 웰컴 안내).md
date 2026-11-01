# [SseulDakGo (쓸고닦고)] WEB-CLNT-ATH-011 (회원가입 완료 및 웰컴 안내) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-ATH-011` |
| **화면명** | 고객 회원가입 완료 및 환영 안내 모달 (Client Welcome & Onboarding Modal) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` (가입 완료 환영 및 서비스 온보딩 유도) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-011/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-011/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_011/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_011/route.js) |
| **API 엔드포인트** | `POST /api/web/client/ath_011` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 가입 완료 회원의 기본 프로필 검증 및 온보딩 메타데이터 조회는 오직 `POST /api/web/client/ath_011`을 통합니다.
2. **공식 브랜드 아이덴티티 및 가치 제안**:
   - `.cursorrules` 2.5 공식 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 사용.
   - 쿠폰 및 이벤트 유인성 과금 문구를 일체 배제하고 정찰제 현장 직불 및 3대 핵심 안심 보증을 고지합니다.
3. **자연스러운 발주 연계 (Frictionless Onboarding)**:
   - 가입 완료 직후 `[바로 청소 요청 등록하러 가기]` 클릭 시 임시 견적 데이터가 보존된 채 청소 서비스 신청 모달(`WEB-CLNT-REQ-000`)을 즉시 호출합니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

### `TB_USER` (회원 마스터)
| 컬럼명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `USER_NO` | VARCHAR(20) | 고객 고유 회원번호 (`C20261000001`) |
| `USER_ROLE_CD` | VARCHAR(10) | 권한 (`C`: 고객) |
| `USER_NM` | VARCHAR(50) | 고객 실명 |
| `USER_EMAIL` | VARCHAR(100) | 고객 계정 이메일 |
| `REG_DT` | DATETIME | 회원가입 등록 완료 일시 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 구성 요소
1. **상단 환영 비주얼 & 브랜드 로고**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png))와 축하 체크 뱃지
   - `"환영합니다, {USER_NM}님!"` 타이틀 및 맞춤 안내문
2. **발급된 고객 회원 식별 카드**:
   - 고객 식별 번호(`USER_NO`), 가입 이메일(`USER_EMAIL`), 가입 일시 안내
   - 안심 고객 인증 완료 배지
3. **쓸고닦고 3대 안심 가치 안내 그리드**:
   - **100% 신원 검증 마스터**: 경력, 사업자, 범죄이력 결격사유 없는 검증된 기사 배차
   - **영업배상책임 1억원 보험**: 시공 중 발생 가능한 파손 및 손해 전액 보장
   - **에스크로 없는 현장 직불**: 사전 선결제 부담 없이 현장 검수 완료 후 직접 결제
4. **CTA 버튼 그룹**:
   - `[ 바로 청소 요청 등록하러 가기 ]` (메인 CTA - Deep Royal Navy 버튼)
   - `[ 홈으로 이동하기 ]` (서브 버튼)

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/ath_011`
- **구현 함수**: `processWebClntAth011(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "userNo": "C20261000001"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "userNo": "C20261000001",
    "userNm": "홍길동",
    "userEmail": "customer@sseuldakgo.kr",
    "userRoleCd": "C",
    "regDt": "2026-10-31 04:50:00"
  },
  "message": "고객 환영 정보가 성공적으로 조회되었습니다."
}
```

### 4.4 주요 SQL 쿼리
```sql
SELECT USER_NO, USER_ROLE_CD, USER_NM, USER_EMAIL, REG_DT
  FROM TB_USER
 WHERE USER_NO = ?
   AND USER_ROLE_CD = 'C'
 LIMIT 1;
```

---

## 5. 검증 및 테스트 결과

1. **온보딩 모달 체인 검증**: `WEB-CLNT-ATH-010` 회원가입 완료 즉시 `WEB-CLNT-ATH-011` 모달이 오픈되고 신규 가입 고객 정보가 정확히 바인딩됨을 확인.
2. **발주 모달 트리거**: `[바로 청소 요청 등록하러 가기]` 클릭 시 웰컴 모달이 닫히며 `WEB-CLNT-REQ-000` 모달이 바로 열림을 확인.

