# [SseulDakGo (쓸고닦고)] WEB-CLNT-ATH-010 (통합 회원가입 및 약관동의 서명) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-ATH-010` |
| **화면명** | 통합 회원가입 및 4대 약관 정독/전자서명 모달 (Integrated Member Registration & Signature) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` & `Partner` (신규 회원 가입 및 법적 전자서명 증적 생성) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010/route.js) |
| **API 엔드포인트** | `POST /api/web/client/ath_010` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **서명 저장소** | 로컬 디스크 물리 저장 (`public/uploads/signatures/{YYYYMM}/`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 가입 검증, 암호화, 서명 파일 디스크 저장, 약관 동의 원장 적재는 오직 `POST /api/web/client/ath_010`에서 일괄 수행합니다.
2. **4대 필수 법적 약관 스크롤 정독 검증 (Scroll-to-Bottom Enforcement)**:
   - ① 서비스 이용약관, ② 개인정보 수집 및 이용 동의, ③ 위치기반서비스 이용약관, ④ 전자금융거래 이용약관
   - 사용자가 약관 박스의 스크롤을 100% 최하단까지 정독하지 않으면 개별 체크박스 활성화를 차단하여 법적 분쟁을 원천 방지합니다.
3. **HTML5 캔버스 자필 전자서명 패드 및 서명 파일 관리**:
   - 마우스 드래그 및 모바일 터치 기반 고해상도 자필 서명 입력 패드 제공.
   - Base64 PNG 이미지 데이터 디코딩 후 연월별 보관 폴더(`public/uploads/signatures/YYYYMM/`)에 자동 저장.
   - 보관 디렉토리가 미존재할 경우 서버가 재귀적(`mkdirSync recursive`)으로 자동 생성합니다.
4. **약관별 개별 동의 일자/시간 및 서명 증적 영구 보관**:
   - `TB_TERMS_AGREE_SIGN` 테이블에 각 약관 코드별 동의 시각(`AGREE_DT = NOW()`)과 서명 파일의 물리 경로 및 웹 접근 URL을 분리하여 영구 보존합니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

### 2.1 `TB_USER` (회원 마스터)
- `USER_NO`: 고객 번호(`C` + `YYYYMM` + `5자리 일련번호`, 총 12자리)
- `SIGN_IMG_URL`: 기본 대표 자필 서명 웹 접근 경로 (`/uploads/signatures/{YYYYMM}/sign_...png`)
- `USER_PWD_HASH`, `PWD_SALT`: PBKDF2 SHA-512 단방향 암호화 값

### 2.2 `TB_TERMS_AGREE_SIGN` (약관별 동의 일시 및 서명 증적 관리)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `AGREE_SIGN_SEQ` | BIGINT | PK (AI) | 고유 증적 식별자 |
| `USER_NO` | VARCHAR(20) | NOT NULL | 회원 식별번호 (FK: `TB_USER`) |
| `TERMS_CD` | VARCHAR(50) | NOT NULL | 약관 식별 코드 (`TERMS_SERVICE`, `PRIVACY_POLICY` 등) |
| `AGREE_YN` | CHAR(1) | NOT NULL | 동의 여부 (`Y`) |
| `AGREE_DT` | DATETIME | NOT NULL | 동의 일시 (`NOW()`) |
| `SIGN_FILE_PATH` | VARCHAR(500) | NOT NULL | 서버 로컬 물리 저장 절대 경로 |
| `SIGN_FILE_URL` | VARCHAR(300) | NOT NULL | 브라우저 서빙용 상대 웹 URL |
| `SIGN_IP` | VARCHAR(50) | NULL | 동의 당시 접속 클라이언트 IP |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 인터랙션 설계
1. **헤더 및 브랜드 로고**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png))와 `"통합 회원가입"` 헤딩
2. **계정 정보 입력 영역**:
   - 이메일 실시간 중복 검사 및 정규식 검증
   - 비밀번호 & 비밀번호 확인 필드:
     - 우측 눈 아이콘 클릭 시 `type="text"` vs `type="password"` 토글
     - 두 필드의 입력값 일치 여부 실시간 안내
3. **4대 필수 약관 아코디언 & 스크롤 리스너**:
   - 약관 박스 내부 스크롤 이벤트 감지: `e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 2`
   - 최하단 도달 시에만 `[V] 약관을 끝까지 읽었으며 이에 동의합니다` 체크박스 언락
4. **자필 전자서명 캔버스 (Signature Canvas)**:
   - 300x120 픽셀 캔버스에 서명 패드 렌더링
   - `[지우기]` 버튼 클릭 시 캔버스 초기화
   - 빈 서명 상태 제출 방지 (`isCanvasBlank` 검증)
5. **가입 완료 제출 버튼**:
   - 4대 약관 완독 + 서명 입력 완료 시 `[ 회원가입 완료하기 ]` 활성화
   - 성공 시 가입 완료 환영 모달(`WEB-CLNT-ATH-011`) 자동 호출

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/ath_010`
- **구현 함수**: `processWebClntAth010(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "userRoleCd": "C",
  "userEmail": "newclient@sseuldakgo.kr",
  "userPwd": "SecurePassword123!",
  "userNm": "김고객",
  "userTel": "010-1234-5678",
  "signDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "termsAgreedList": [
    { "termsCd": "TERMS_SERVICE", "agreeYn": "Y" },
    { "termsCd": "PRIVACY_POLICY", "agreeYn": "Y" },
    { "termsCd": "LOCATION_TERMS", "agreeYn": "Y" },
    { "termsCd": "ELECTRONIC_FINANCE", "agreeYn": "Y" }
  ]
}
```

### 4.3 서명 디렉토리 자동 생성 및 저장 로직
```javascript
// 연월 폴더 자동 생성
const date = new Date();
const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures', yyyymm);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileName = `sign_${userNo}_${Date.now()}.png`;
const filePath = path.join(uploadDir, fileName);
fs.writeFileSync(filePath, buffer);
const fileUrl = `/uploads/signatures/${yyyymm}/${fileName}`;
```

### 4.4 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "userNo": "C20261000002",
    "userNm": "김고객",
    "userEmail": "newclient@sseuldakgo.kr",
    "userRoleCd": "C",
    "signFileUrl": "/uploads/signatures/202610/sign_C20261000002_1730349600000.png"
  },
  "message": "회원가입 및 전자서명 등록이 완료되었습니다."
}
```

---

## 5. 검증 및 테스트 결과

1. **서명 폴더 자동 생성**: `public/uploads/signatures/202610/` 디렉토리가 미존재 시에도 에러 없이 자동 생성 및 PNG 파일 저장 확인.
2. **약관 정독 유효성 검사**: 스크롤을 끝까지 내리지 않은 상태에서 체크 시도 시 차단 및 경고 모달 노출 확인.
3. **비밀번호 눈 아이콘**: 토글 시 비밀번호 평문/마스킹 정상 전환 확인.
4. **증적 테이블 기록**: `TB_TERMS_AGREE_SIGN` 테이블에 4개 약관 동의 일시 및 서명 파일 URL이 정확히 적재됨을 확인.

