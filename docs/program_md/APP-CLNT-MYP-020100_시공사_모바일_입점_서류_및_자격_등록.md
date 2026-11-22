# [화면 명세서] APP-CLNT-MYP-020100 시공사 모바일 입점 서류 및 전문 자격 등록

---

## 1. 화면 개요
- **화면 ID**: `APP-CLNT-MYP-020100` (웹 대응: `WEB-CLNT-MYP-020100`)
- **화면 구분**: `Sub / Main`
- **화면명**: 시공사 모바일 입점 서류 및 전문 자격 · 수료증 · 경력 등록
- **접근 URL**: 하이브리드 앱 웹뷰 라우트 `/app/client/myp_020100` (로컬 프리뷰: `http://localhost:3000/app_myp_020100.html`)
- **담당 도메인 / 역할**: Client / 시공사 파트너(S) 전용
- **개요**: 
  1. 모바일 앱 환경에서 시공사 파트너의 전문 자격증, 기술 수료증, 제조사 서비스센터 경력증명서(최대 5건)를 간편하게 등록하고 심사 요청.
  2. 모바일 터치 및 네이티브 카메라 촬영(`capture="environment"`), 사진 앨범, PDF 파일 첨부 지원.
  3. 자격 종목 선택을 위한 모바일 전용 바텀 시트(Bottom Sheet) 인터페이스 제공.
  4. 관리자 심사 승인(`APPROVED`) 시 모바일 프로필에 3대 신뢰 뱃지(`BADGE_PRO_EDU`, `BADGE_CERTIFIED`, `BADGE_MASTER`) 실시간 활성화.
  5. 모바일 햅틱 피드백(`triggerHaptic`) 및 안전영역(`pt-safe`, `pb-safe`) 지원.

---

## 2. 프론트엔드 명세
- **컴포넌트 파일 경로**: `SseulDakGo_App/Client/screens/APP-CLNT-MYP-020100/index.tsx`
- **프레임워크 / 라이브러리**: React 18, TypeScript, Tailwind CSS, Material Symbols Outlined, Capacitor Bridge Fallback
- **공식 브랜드 로고**: `/storage/project/brand/Logo_쓸고딱고.jpg` (`C:\SseulDakGo_Storage\project\brand\Logo_쓸고딱고.jpg` 직결 서빙)
- **Props 인터페이스**:
  ```typescript
  export interface AppClntMyp020100Props {
    srvcNo?: string;                         // 시공사 회원번호 (기본: 'S20261100001')
    onBack?: () => void;                     // 뒤로 가기 핸들러
    onSkip?: () => void;                     // 건너뛰기 핸들러
    onComplete?: () => void;                 // 등록/심사 요청 완료 콜백
    onNavigate?: (screenId: string) => void; // 화면 전환 핸들러
  }
  ```
- **주요 UI 컴포넌트**:
  1. **고정 모바일 상단 바**: 뒤로 가기, 화면 타이틀 `입점 서류 및 자격 등록`, 단계 인디케이터 `2/3`, 프로필 아바타
  2. **사업자 인증 정보 카드**: 국세청 홈택스 진위확인 완료 배지, 상호명, 대표자명, 사업자번호, 주력 전문 분야
  3. **신뢰 뱃지 혜택 배너 & 가로 스크롤 스트립**: `BADGE_PRO_EDU`, `BADGE_CERTIFIED`, `BADGE_MASTER` 실시간 활성화 배지
  4. **반복 자격증 카드 (Repeater Cards)**:
     - 3-Way Segmented Control: `자격증`, `교육 수료증`, `제조사 경력`
     - 자격 종목 바텀 시트 트리거 (터치 시 바텀 시트 열림)
     - `기타 직접 입력` 선택 시 종목명 인풋 활성화
     - 발급기관명 / 수료 년월 (`YYYY. MM`)
     - 모바일 간편 첨부 3버튼: 카메라 촬영 / 사진 앨범 / 파일(PDF)
     - 개인정보 보호 경고 및 `주민등록번호 뒷자리 마스킹 확인 (PRIVACY_MASK_YN = 'Y')` 체크박스
  5. **항목 추가 버튼**: 최대 5건 등록 제한
  6. **하단 고정 인터랙션 바**: 건너뛰기, 저장 및 심사 요청 버튼, 심사 안내 문구

---

## 3. 백엔드 API 명세
- **API 물리 경로**: `SseulDakGo_App/Client/backend/api_APP_CLNT_MYP_020100/route.js`
- **1:1 독립 엔드포인트 원칙 준수**: `WEB-CLNT-MYP-020100` 백엔드와 동일한 트랜잭션 및 비즈니스 룰을 독립 모듈로 구현
- **단일 DB 풀 인프라**: `lib/db.js` (`executeQuery`, `executeTransaction`)

### 3.1 모바일 액션 목록 (`POST /api/app/client/myp_020100`)

| Action 명칭 | 설명 | 파라미터 |
| :--- | :--- | :--- |
| `GET_COMMON_CODES` | 모바일 공통 코드 목록 조회 | `mainServiceCat`, `srvcNo` |
| `GET_CERTIFICATIONS` | 시공사 기본 정보, 활성 뱃지 및 등록 자격증 목록 조회 | `srvcNo` |
| `UPLOAD_CERT_FILE` | 모바일 서류 파일 업로드 (Base64 / Multipart) | `srvcNo`, `fileData`, `fileName`, `fileSize` |
| `SAVE_CERTIFICATIONS` | 자격증 배치 동기화 (Upsert/Delete/트랜잭션) | `srvcNo`, `certifications` (배열) |
| `REVIEW_CERTIFICATION` | 관리자 심사 승인/반려 & 뱃지 자동 산정 | `certSeq`, `reviewStatus`, `rejectReason` |

### 3.2 뱃지 자동 계산 엔진 규칙
- `TB_SERVICE_CERT`의 `APPROVED` 상태 분석:
  1. `DOC_TYPE_CD = 'COMPLETION'` 1건 이상 ➡️ `BADGE_PRO_EDU` 활성화
  2. `DOC_TYPE_CD = 'LICENSE'` 1건 이상 ➡️ `BADGE_CERTIFIED` 활성화
  3. `DOC_TYPE_CD = 'CAREER'` 1건 이상 ➡️ `BADGE_MASTER` 활성화
- `TB_SERVICE_BADGE`의 `ACTIVE_YN` 갱신 및 `TB_USER.CERT_BADGE_CODES` 콤마 분리 문자열 캐시 자동 반영.

---

## 4. 데이터베이스 연동 테이블
- `TB_USER`: 시공사 기본 정보 (`USER_NO`, `COMPANY_NM`, `BIZ_NO`, `MAIN_CLEAN_LARGE_CD`, `CERT_BADGE_CODES`)
- `TB_SERVICE_CERT`: 자격증 및 수료증 등록 상세 (`CERT_SEQ`, `SRVC_NO`, `DOC_TYPE_CD`, `CERT_MASTER_CD`, `FILE_URL`, `REVIEW_STAT_CD`, ...)
- `TB_SERVICE_BADGE`: 시공사 활성 뱃지 마스터 (`BADGE_SEQ`, `SRVC_NO`, `BADGE_TYPE_CD`, `SOURCE_CERT_SEQ`, `ACTIVE_YN`, ...)
- `TB_COM_CODE`: `CERT_DOC_TYPE`, `BADGE_TYPE`, `CERT_MASTER_CODE`, `REVIEW_STATUS`
- `TB_SERVICE_DOC`: 사업자등록증 검증 상태 연계
