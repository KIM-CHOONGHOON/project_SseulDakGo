# [SseulDakGo (쓸고닦고)] WEB-CLNT-ATH-000 (고객 및 시공사 로그인) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-ATH-000` |
| **화면명** | 고객 및 시공사 통합 로그인 모달 (Client & Partner Authentication Modal) |
| **지원 채널** | Web [Y] / Mobile Web [Y] (레이어 모달 오버레이) |
| **도메인 역할** | `Client` & `Partner` (회원 인증 및 세션 발급) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/ath_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 로그인 인증 로직은 `POST /api/web/client/ath_000`에서 전담 처리합니다.
2. **이원화된 역할(Role) 세그먼트 스위칭**:
   - `userRoleCd = 'C'` (일반 고객 회원) vs `userRoleCd = 'S'` (전문 시공 파트너) 역할을 탭으로 구분하여 단일 모달에서 인증 지원.
3. **보안 암호화 및 솔트(Salt) PBKDF2 검증**:
   - 단방향 해시 알고리즘 `crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')`로 비밀번호 검증.
4. **회원 상태 제어 및 계정 정지 필터링**:
   - `USER_STAT_CD = 'NORMAL'`인 회원만 로그인 허용.
   - `SUSPENDED_7D` (이용 제한) 또는 `WITHDRAWN` (탈퇴) 회원은 적절한 오류 코드 및 잔여 정지 일수 안내와 함께 접속 차단.
5. **임시 견적 요청 자동 연계 (`hasTempReq`)**:
   - 비회원 상태에서 작성된 임시 발주서가 로컬 스토리지에 존재할 경우, 로그인 완료 직후 해당 데이터를 계정으로 마이그레이션할 수 있도록 플래그 제공.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

### `TB_USER` (회원 마스터)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `USER_NO` | VARCHAR(20) | PK | 회원 식별번호 (`C...`: 고객, `S...`: 파트너) |
| `USER_ROLE_CD` | VARCHAR(10) | NOT NULL | 권한 (`C`: 고객, `S`: 시공사) |
| `USER_EMAIL` | VARCHAR(100) | NOT NULL | 계정 이메일 (로그인 ID) |
| `USER_PWD_HASH` | VARCHAR(200) | NULL | PBKDF2 암호화 해시 문자열 |
| `PWD_SALT` | VARCHAR(100) | NULL | 암호화 솔트 |
| `USER_NM` | VARCHAR(50) | NOT NULL | 회원 실명 |
| `USER_STAT_CD` | VARCHAR(20) | NOT NULL | 상태 (`NORMAL`, `SUSPENDED_7D`, `WITHDRAWN`) |
| `SUSPEND_EXPIRE_DT` | DATETIME | NULL | 정지 만료 일시 |
| `LAST_LOGIN_DT` | DATETIME | NULL | 최종 로그인 일시 (`NOW()` 갱신) |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI 구성 요소
1. **상단 모달 헤더**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 및 `"쓸고닦고 로그인"` 타이틀
   - 모달 닫기(`X`) 버튼
2. **역할 선택 세그먼트 (Segmented Switch)**:
   - `[ 고객 회원 로그인 ]` vs `[ 시공 파트너 로그인 ]` 토글
3. **이메일 및 비밀번호 입력 필드**:
   - 실시간 형식 유효성 검사 (이메일 정규식, 빈값 방지)
   - 눈 아이콘(비밀번호 표시/숨김 토글) 적용
   - `[로그인 상태 유지]` 체크박스
4. **소셜 간편 로그인 4종 버튼**:
   - 카카오 (`#FEE500`), 네이버 (`#03C75A`), 구글 (`White`), 애플 (`Black`)
5. **하단 유틸리티 링크**:
   - `[비밀번호 찾기]` | `[통합 회원가입 (WEB-CLNT-ATH-010)]` 전환 링크

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/ath_000`
- **구현 함수**: `processWebClntAth000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "userRoleCd": "C",
  "userEmail": "customer@sseuldakgo.kr",
  "userPwd": "Password123!",
  "keepLogin": true
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
    "hasTempReq": false,
    "lastLoginDt": "2026-10-31 04:55:00"
  },
  "message": "로그인이 성공적으로 완료되었습니다."
}
```

### 4.4 주요 인증 및 상태 갱신 SQL
```sql
-- 1. 회원 정보 조회
SELECT USER_NO, USER_ROLE_CD, USER_EMAIL, USER_PWD_HASH, PWD_SALT, USER_NM, USER_STAT_CD, SUSPEND_EXPIRE_DT
  FROM TB_USER
 WHERE USER_EMAIL = ?
   AND USER_ROLE_CD = ?
 LIMIT 1;

-- 2. 최종 로그인 일시 갱신
UPDATE TB_USER
   SET LAST_LOGIN_DT = NOW()
 WHERE USER_NO = ?;
```

---

## 5. 검증 및 테스트 결과

1. **역할별 인증 분리**: 고객 계정으로 시공사 탭 로그인 시도시 `ERR_USER_NOT_FOUND` 차단 확인.
2. **비밀번호 불일치**: 401 `ERR_PASSWORD_MISMATCH` 및 오류 모달 안내 확인.
3. **회원가입 모달 연계**: `[통합 회원가입]` 클릭 시 로그인 모달이 닫히고 `WEB-CLNT-ATH-010` 모달이 즉시 오픈됨을 확인.

