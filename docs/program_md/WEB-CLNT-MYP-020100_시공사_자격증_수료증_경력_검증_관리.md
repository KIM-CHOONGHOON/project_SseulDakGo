# [프로그램 및 화면 명세서] WEB-CLNT-MYP-020100 시공사 자격증 · 수료증 · 경력 검증 관리

---

## 1. 프로그램 및 화면 개요

* **화면 ID**: `WEB-CLNT-MYP-020100` (반응형 모바일 대응: `APP-CLNT-MYP-020100`)
* **화면 구분**: 마이페이지 시공사 파트너 전용 서브 화면 (전체화면 Page 모드 및 모달 팝업 Modal 모드 100% 호환)
* **화면명**: 시공사 파트너 사업자등록증 검증 & 자격증 · 수료증 · 경력 검증 관리 (신뢰 인증 뱃지 자동 부여)
* **접근 URL**: `https://sseuldakgo.kr/client/mypage/certifications` (로컬 프리뷰: `http://localhost:3000/preview_client/WEB-CLNT-MYP-020100.html`)
* **담당 도메인 / 사용자 권한**: Client(클라이언트) / 시공사 파트너(`S`) 전용
* **주요 목적 및 기능**:
  1. **사업자등록 정보 진위확인 및 주력 시공 분야 관리**: 국세청 홈택스 실시간 스크래핑/연동 검증 정보 노출 및 주력 시공 분야(`LARGE_CD`) 인라인/팝업 즉시 변경 지원.
  2. **3대 탭(Tab) 기반 자격·경력 증빙 체계**: `자격증 (국가/민간)`, `교육/기술 수료증`, `제조사 경력증명`으로 분리된 탭 UI를 통해 동적 Row 추가/삭제 및 관리 (최대 5건).
  3. **증빙 서류 1:1 결합 및 전용 스토리지 분리 보관**: 항목별 서류 사본을 1:1 매칭하고 `C:\SseulDakGo_Storage\{USER_NO}\{DOC_TYPE}\` 디렉터리에 물리적 분리 저장.
  4. **3대 신뢰 뱃지 자동 산정**: 본사 검증팀 서류 대조 후 승인(`APPROVED`) 시 고객 견적서 및 프로필에 `BADGE_PRO_EDU`, `BADGE_CERTIFIED`, `BADGE_MASTER` 자동 노출.
  5. **개인정보보호 마스킹 필수 강제**: 증빙 서류 내 주민등록번호 뒷자리 마스킹 처리 확인(`PRIVACY_MASK_YN = 'Y'`) 필수 검증.

---

## 2. 화면 인터페이스 및 변경 반영 명세

### 2.1 상단 Step Flow 진행바 (3단계)
| 단계 | 단계명 | 상태 | 표시 텍스트 및 로직 |
| :--- | :--- | :--- | :--- |
| **1단계** | 사업자등록 정보 | 완료 (검증완료) | 국세청 홈택스 진위확인 완료 상태. 클릭 시 사업자 정보 수정 팝업 오픈 |
| **2단계** | 자격증 · 수료증 · 경력 | **현재 단계 (진행중)** | 파트너 신뢰 뱃지 부여를 위한 필수/선택 서류 검토 단계 |
| **3단계** | 자격증, 수료증 검토(선택) | **다음 단계 (대기)** | **`자격증, 수료증 검토(선택)`** (기존 "정산계좌 및 계약 완료"에서 명칭 변경 완료) |

---

### 2.2 사업자등록 검증 정보 영역 (Section 1)
* **노출 정보**: 상호명(`COMPANY_NM`), 사업자등록번호(`BIZ_NO`), 대표자명(`USER_NM`), 주력 시공 분야(`LARGE_CD`)
* **하단 상태 라벨**: `회원식별자: S20261100001 | 사업자등록증 원본 서류: 확인완료 (2026-11-15)` (기존 `TB_SERVICE_DOC 승인완료`에서 **`확인완료`**로 변경)
* **주력 시공 분야 (LARGE_CD) 입력 및 변경 방법**:
  1. **인라인 빠른 변경**: 카드의 `[선택/변경]` 링크 클릭 시 모달 열림.
  2. **사업자 정보 등록/수정 팝업 모달 (`isBizEditOpen`)**:
     * 상단 `[사업자 정보 등록/수정]` 버튼 클릭 시 오픈.
     * 사업자유형(개인/법인), 사업자번호, 홈택스 진위확인, 상호명, 대표자명, 사업자등록증 사본 첨부 기능 제공.
     * **주력 시공 분야 체크박스 리스트** 제공 (3대 시공 분야 중복 선택 가능):
       * `정기청소` (`REGULAR`)
       * `입주청소` (`MOVE_IN`)
       * `계절가전청소` (`APPLIANCE_SEASON`)
     * 체크박스 다중 선택 후 `저장 및 인증 요청` 제출 시 `TB_USER.MAIN_CLEAN_LARGE_CD` 및 화면 뱃지가 실시간 동기화됨.

---

### 2.3 3대 탭(Tab) 인터페이스 및 자격 분류 명세 (Section 3)

화면 Section 3은 **3대 탭 버튼 바**로 구성되며, 탭 전환 시 해당 분류의 서류 카드 목록만 필터링하여 노출합니다.

```
[ 탭 1: 1. 자격증 (국가/민간) (N건) ]  [ 탭 2: 2. 교육/기술 수료증 (N건) ]  [ 탭 3: 3. 제조사 경력증명 (N건) ]
```

#### (1) Tab 1: 자격증 (국가/민간) (`DOC_TYPE = 'LICENSE'`)
* 기존 "민간자격증" 단일 분류에서 **"자격증"**으로 승격하고 국가자격증도 함께 등록할 수 있도록 구현.
* **자격증 분류 선택 라디오 버튼** 제공:
  * **`[● 국가기술/전문자격 (Q-Net 등)]` (`subType = 'NATIONAL'`)**:
    * 한국산업인력공단(Q-Net) 주관 공인 자격증 목록 연동:
      * `공조냉동기계기사 / 산업기사 / 기능사 (Q-Net)`
      * `전기공사기사 / 전기기사 / 기능사 (Q-Net)`
      * `대기환경기사 / 실내환경관리사 (Q-Net)`
      * `건축설비기사 / 설비보전기능사 (Q-Net)`
      * `에너지관리기사 / 기능사`
      * `기타 국가공인 자격증 직접 입력 (ETC_DIRECT_INPUT)`
    * 선택 시 발급기관명에 `한국산업인력공단`이 자동 완성됨.
  * **`[○ 공인/등록 민간자격 (협회 등)]` (`subType = 'PRIVATE'`)**:
    * 주무부처 및 한국직업능력연구원 등록 민간자격증 목록 연동:
      * `냉난방기/시스템에어컨 종합세척관리사` (발급처: 한국시스템에어컨유지보수관리협회(KSAMA))
      * `건축위생관리사 1급/2급` (발급처: 한국건물위생관리협회)
      * `공간바닥코팅마스터 자격인증` (발급처: 한국코팅방수기술협회)
      * `홈케어 매트리스/패브릭 클리닝 전문가` (발급처: 한국홈케어마스터협회)
      * `병원/상업공간 멸균소독전문가` (발급처: 한국실내위생검증원)
      * `기타 민간자격증 직접 입력 (ETC_DIRECT_INPUT)`

#### (2) Tab 2: 교육/기술 수료증 (`DOC_TYPE = 'COMPLETION'`)
* 전문 기술 아카데미 및 법정 의무교육 이수증 등록:
  * `건물위생관리업 법정교육 수료` (발급처: 한국건물위생관리협회)
  * `한국방역협회 소독업무 종사자 교육` (발급처: 사단법인 한국방역협회)
  * `시스템/스탠드 에어컨 완전분해 실무과정` (발급처: 한국냉난방기술학원)
  * `고소작업 및 산업안전보건 교육 이수` (발급처: 안전보건공단)
  * `기타 기술/교육과정 직접 입력 (ETC_DIRECT_INPUT)`

#### (3) Tab 3: 제조사 경력증명 (`DOC_TYPE = 'CAREER'`)
* 대기업 가전 제조사 및 공조 전문기업 서비스 엔지니어 출신 경력 증빙:
  * `삼성전자서비스/로지텍 서비스엔지니어 경력` (발급처: 삼성전자서비스(주))
  * `LG전자 하이엠솔루텍/서비스센터 경력` (발급처: LG전자 하이엠솔루텍)
  * `캐리어/위니아 공조 엔지니어 경력` (발급처: 오텍캐리어/위니아에이드)
  * `전문 위생관리법인 현장 팀장/소장 3년 이상` (발급처: 종합위생관리법인)
  * `기타 제조사/공조회사 경력 직접 입력 (ETC_DIRECT_INPUT)`

---

### 2.4 동적 Row 추가/삭제 및 1:1 서류 사본 첨부 규칙

1. **Row 동적 추가 (`handleAddCertForTab`)**:
   * 각 탭 하단의 `+ [현재 탭명] 추가하기` 버튼 클릭 시 현재 탭의 속성(`docType`, `subType`, 기본 자격명, 기본 발급기관)이 바인딩된 Row가 신규 생성됨.
   * 전체 항목 합계 최대 **5건**까지 등록 가능.
2. **Row 삭제 (`handleRemoveCert`)**:
   * 각 카드 우측 상단의 `삭제` 버튼 클릭 시 확인 알림창 후 삭제 처리.
   * 심사 승인(`APPROVED`)된 서류는 임의 삭제가 제한되며 안내 메시지 출력.
3. **증빙 사본 1:1 결합 관리**:
   * 각 Row마다 독립된 파일 업로더가 1:1로 결합되어 관리됨.
   * 지원 파일: `JPG`, `PNG`, `PDF` (파일당 최대 10MB).
   * 파일 첨부 시 원본 파일명, 파일 용량, 서명 검증 상태 및 `[미리보기]` 버튼 노출.
   * **개인정보 마스킹 확인 체크**: `[확인완료] 증빙 서류에 표기된 주민등록번호 뒷자리(7자리)를 완전히 마스킹(가림) 처리했음을 확인합니다.` 필수 체크.

---

## 3. 물리적 스토리지 저장 및 디렉터리 경로 규칙

파트너가 업로드한 자격/수료/경력 증빙 서류는 보안 및 규정에 따라 로그인한 시공사 회원식별번호(`USER_NO`)별 하위 분류 디렉터리로 물리적 분리 보관됩니다.

### 3.1 파일 시스템 보관 디렉터리 구조
```
C:\SseulDakGo_Storage\
 └── {USER_NO}\               (예: S20261100001, S20261100002)
      ├── LICENSE\             (국가자격증 및 공인 민간자격증 증빙 사본)
      │    └── CERT_SYS_AC_20261118_S20261100001.pdf
      ├── COMPLETION\          (교육 이수증 및 전문 기술 수료증 증빙 사본)
      │    └── COMPL_DISINFECT_20261119_S20261100001.jpg
      └── CAREER\              (제조사 서비스 경력증명서 사본)
           └── CAREER_SAMSUNG_20261119_S20261100001.pdf
```

### 3.2 물리 경로 매핑 로직 (`route.js`)
* 업로드 호출 시 요청 바디의 `docType`(`LICENSE` | `COMPLETION` | `CAREER`)을 전달받아 저장 경로를 분기:
  ```javascript
  const validDocType = ['LICENSE', 'COMPLETION', 'CAREER'].includes(docType) ? docType : 'LICENSE';
  const uploadDir = path.join('C:', 'SseulDakGo_Storage', srvcNo, validDocType);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  ```
* 데이터베이스 `TB_SERVICE_CERT.FILE_URL`에는 웹 접근 경로(`/storage/{USER_NO}/{DOC_TYPE}/{FILE_NM}`)가 저장되고, `PHYSICAL_PATH`에는 실제 로컬 파일 절대 경로가 기록됩니다.

---

## 4. 데이터베이스 테이블 및 컬럼 매핑

### 4.1 TB_USER (회원 및 시공사 기본 정보)
| 컬럼명 | 타입 | 필수 | 설명 |
| :--- | :--- | :---: | :--- |
| `USER_NO` | VARCHAR(20) | PK | 시공사 고유 식별번호 (예: `S20261100001`) |
| `COMPANY_NM` | VARCHAR(100) | Y | 상호명 (예: 공간다원 (클린앤케어)) |
| `BIZ_NO` | VARCHAR(14) | Y | 사업자등록번호 (10자리, 예: `120-88-29401`) |
| `USER_NM` | VARCHAR(50) | Y | 대표자명 (예: 김충훈) |
| `MAIN_CLEAN_LARGE_CD` | VARCHAR(100) | Y | 주력 시공 분야 (JSON 또는 콤마 구분자, 예: `정기청소,입주청소`) |
| `CERT_BADGE_CODES` | VARCHAR(100) | N | 활성화된 인증 뱃지 코드 캐시 (예: `BADGE_CERTIFIED,BADGE_PRO_EDU`) |

### 4.2 TB_SERVICE_CERT (자격증 · 수료증 · 경력 상세)
| 컬럼명 | 타입 | 필수 | 설명 |
| :--- | :--- | :---: | :--- |
| `CERT_SEQ` | INT | PK | 일련번호 (1 ~ 5) |
| `SRVC_NO` | VARCHAR(20) | PK, FK | 시공사 식별번호 (`TB_USER.USER_NO`) |
| `DOC_TYPE_CD` | VARCHAR(20) | Y | 증빙 구분 (`LICENSE`: 자격증, `COMPLETION`: 수료증, `CAREER`: 경력증명) |
| `CERT_SUB_TYPE_CD` | VARCHAR(20) | N | 자격증 하위 분류 (`NATIONAL`: 국가자격, `PRIVATE`: 민간자격) |
| `CERT_MASTER_CD` | VARCHAR(50) | Y | 마스터 공통 코드 (`CERT_SYS_AC`, `QNET_HVAC_ENG`, `ETC_DIRECT_INPUT` 등) |
| `CERT_NM` | VARCHAR(100) | Y | 자격증명 / 수료과정명 / 경력사항명 |
| `CUSTOM_CERT_NM` | VARCHAR(100) | N | 직접 입력 시 사용자가 작성한 상세 명칭 |
| `ISSUER_NM` | VARCHAR(100) | Y | 발급기관명 또는 근무 회사명 |
| `ACQUIRE_YM` | VARCHAR(7) | Y | 취득년월 / 수료년월 (형식: `YYYY-MM`) |
| `FILE_URL` | VARCHAR(255) | Y | 첨부 서류 웹 접근 URL |
| `LOGICAL_FILE_NM` | VARCHAR(255) | Y | 원본 파일명 (예: `KSAMA_시스템에어컨세척관리사_자격증_김충훈.pdf`) |
| `PHYSICAL_PATH` | VARCHAR(500) | Y | 실제 스토리지 경로 (`C:\SseulDakGo_Storage\{USER_NO}\{DOC_TYPE}\...`) |
| `PRIVACY_MASK_YN` | CHAR(1) | Y | 주민등록번호 마스킹 확인 여부 (`Y` / `N`) |
| `REVIEW_STAT_CD` | VARCHAR(20) | Y | 심사 상태 (`DRAFT`: 작성중, `PENDING`: 심사대기, `APPROVED`: 승인완료, `REJECTED`: 반려) |
| `APPROVED_DT` | DATETIME | N | 본사 검증 승인 일시 |

### 4.3 TB_SERVICE_BADGE (파트너 신뢰 뱃지 마스터)
| 뱃지 코드 | 뱃지 명칭 | 부여 기준 규칙 |
| :--- | :--- | :--- |
| `BADGE_CERTIFIED` | **공인 자격증 보유** | `DOC_TYPE_CD = 'LICENSE'` (국가기술 또는 공인 민간자격) 1건 이상 `APPROVED` 시 |
| `BADGE_PRO_EDU` | **전문교육 수료** | `DOC_TYPE_CD = 'COMPLETION'` (전문 교육/기술 수료증) 1건 이상 `APPROVED` 시 |
| `BADGE_MASTER` | **제조사 엔지니어 출신** | `DOC_TYPE_CD = 'CAREER'` (삼성/LG/캐리어 등 제조사 경력) 1건 이상 `APPROVED` 시 |

---

## 5. 백엔드 API 명세

* **API 물리 파일 위치**: `SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_020100/route.js`
* **프리뷰 목업 서버**: `preview/server.js`

### 5.1 REST API 엔드포인트 목록

| Method | 엔드포인트 URL | 역할 및 처리 내용 |
| :--- | :--- | :--- |
| `GET` | `/api/v1/common-codes/certifications` | 자격증/수료증/경력 마스터 카탈로그 목록 조회 (국가자격, 민간자격, 수료증, 경력 분기) |
| `GET` | `/api/v1/services/:srvcNo/certifications` | 특정 시공사의 기본 정보, 주력 시공 분야, 등록된 자격 서류 목록(최대 5건) 및 뱃지 조회 |
| `POST` | `/api/v1/services/:srvcNo/certifications/upload` | **증빙 서류 파일 업로드**: `docType`별 하위 폴더 분기 저장 및 물리 파일 생성 |
| `PUT` | `/api/v1/services/:srvcNo/certifications` | **자격증 배치 동기화**: 항목 전체 Upsert/Delete, 상태 리셋 및 트랜잭션 일괄 저장 |
| `POST` | `/api/web/client/myp_020100` | **사업자등록 정보 및 주력 시공 분야(`LARGE_CD`) 변경/저장** |
| `PATCH` | `/api/v1/admin/services/certifications/:certSeq/review` | 본사 관리자 검증 심사 승인(`APPROVED`)/반려(`REJECTED`) 및 뱃지 자동 계산 엔진 실행 |

### 5.2 자격 서류 일괄 저장 (`PUT`) 요청 페이로드 예시
```json
{
  "serviceNo": "S20261100001",
  "bizRegNo": "120-88-29401",
  "verifyYn": "Y",
  "certifications": [
    {
      "certSeq": 1,
      "docType": "LICENSE",
      "subType": "PRIVATE",
      "certCode": "CERT_SYS_AC",
      "certName": "냉난방기/시스템에어컨 종합세척관리사",
      "issuerName": "한국시스템에어컨유지보수관리협회(KSAMA)",
      "issuedYm": "2024-06",
      "fileName": "KSAMA_시스템에어컨세척관리사_자격증_김충훈.pdf",
      "storagePath": "C:\\SseulDakGo_Storage\\S20261100001\\LICENSE\\KSAMA_시스템에어컨세척관리사_자격증_김충훈.pdf",
      "privacyMaskYn": "Y",
      "reviewStatus": "APPROVED",
      "approvedDt": "2026-11-18"
    },
    {
      "certSeq": 2,
      "docType": "COMPLETION",
      "subType": null,
      "certCode": "ETC_DIRECT_INPUT",
      "certName": "기타 자격/수료증 직접 입력",
      "customCertName": "친환경 오존/피톤치드 공간 살균 방역 실무 마스터과정",
      "issuerName": "사단법인 한국실내환경방역안전협회",
      "issuedYm": "2025-02",
      "fileName": "방역살균수료증_공간다원.jpg",
      "storagePath": "C:\\SseulDakGo_Storage\\S20261100001\\COMPLETION\\방역살균수료증_공간다원.jpg",
      "privacyMaskYn": "Y",
      "reviewStatus": "PENDING"
    },
    {
      "certSeq": 3,
      "docType": "CAREER",
      "subType": null,
      "certCode": "CAREER_SAMSUNG_SVC",
      "certName": "삼성전자서비스/로지텍 서비스엔지니어 경력",
      "issuerName": "삼성전자서비스(주) 중부지사",
      "issuedYm": "2023-08",
      "fileName": "삼성전자서비스_경력증명서_공간다원.pdf",
      "storagePath": "C:\\SseulDakGo_Storage\\S20261100001\\CAREER\\삼성전자서비스_경력증명서_공간다원.pdf",
      "privacyMaskYn": "Y",
      "reviewStatus": "DRAFT"
    }
  ]
}
```

---

## 6. 소스 파일 구조 및 참조 링크

* **React 프론트엔드 컴포넌트**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-020100/index.jsx)
* **백엔드 라우트 및 스토리지 업로드 핸들러**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_020100/route.js)
* **독립형 프리뷰 화면 (HTML)**: [preview/myp_020100.html](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/myp_020100.html)
* **Client 배포용 프리뷰 파일**: [preview_client/WEB-CLNT-MYP-020100.html](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview_client/WEB-CLNT-MYP-020100.html)
* **내정보 통합 모달 연동 파일**: [preview/index.html](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/index.html)
* **로컬 프리뷰 서버**: [preview/server.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/server.js)

---

## 7. 향후 프로그램 수정 시 주의사항 (Checklist)

1. **Step Flow 네이밍 일관성 유지**:
   * 3단계 제목은 반드시 **`자격증, 수료증 검토(선택)`**으로 유지할 것.
2. **주력 시공 분야(`LARGE_CD`) 업데이트 시**:
   * `TB_USER.MAIN_CLEAN_LARGE_CD` 컬럼에 다중 선택된 시공 카테고리가 누락 없이 반영되어야 하며, 파트너 배차 및 견적 매칭 엔진(`WEB-CLNT-ORD-010100`)과 직결되므로 유효성을 검증할 것.
3. **자격증 분류 분기**:
   * 국가자격증(`NATIONAL`)과 민간자격증(`PRIVATE`)은 발급기관 및 공인 여부(`Q-Net` 연계)가 다르므로, 라디오 전환 시 해당 카탈로그가 올바르게 바인딩되어야 함.
4. **스토리지 디렉터리 경로 규칙 엄수**:
   * 서류 업로드 시 반드시 `C:\SseulDakGo_Storage\{USER_NO}\{DOC_TYPE}\` 구조를 준수해야 하며, 디렉터리가 없을 경우 자동 생성(`recursive: true`) 처리할 것.
5. **개인정보보호 마스킹 확인**:
   * 주민등록번호 뒷자리 마스킹 동의(`PRIVACY_MASK_YN = 'Y'`)가 체크되지 않은 항목은 심사 요청(`SUBMIT`)을 차단할 것.
