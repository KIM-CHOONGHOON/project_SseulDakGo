# [SseulDakGo (쓸고닦고)] WEB-CLNT-COM-010000 (고객/시공사 메인 홈 & 공통 GNB 헤더) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-COM-010000` |
| **화면 구분** | `Main` (공통 GNB 헤더 네비게이션 및 고객/시공사 포털 메인 허브) |
| **화면명** | 고객/시공사 메인 홈 & 공통 GNB 알림센터 (Client/Contractor Main Home Hub & Common GNB Notification Center) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` / `Contractor` / `Common` (고객 및 시공사 공통 GNB 헤더 및 메인 뷰) |
| **헤더 아키텍처** | **플랫폼 최상단 공통 GNB 단일 적용 (내정보 관리 화면 등 하위 화면의 자체 헤더는 일체 사용하지 않음)** |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx)<br/>[`preview/index.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/index.html)<br/>[`preview_client/WEB-CLNT-COM-010000.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview_client/WEB-CLNT-COM-010000.html)<br/>[`preview_client/index.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview_client/index.html) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js)<br/>[`preview/server.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/server.js) |
| **API 엔드포인트** | `POST /api/web/client/com_010000` (메인 피드 및 역할별 메뉴/랜딩 데이터)<br/>`GET /api/common/notifications` (미확인 건수 및 알림 목록 조회)<br/>`POST /api/common/notifications/read` (단건 읽음 처리)<br/>`POST /api/common/notifications/read-all` (전체 모두 읽음 처리)<br/>`POST /api/contractor/bid/apply` (시공사 청약 신청 및 발주 상태 갱신 / 고객 실시간 푸시 발송) |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

---

## 2. 핵심 아키텍처 및 UI/UX 변경 규격

### 2.1 [최신 수정] 상단 브레드크럼 리본 UI 정돈 (화면 ID, 아이콘, 배차관제 문구 삭제)
> [!IMPORTANT]
> **상단 브레드크럼 리본(Top Visual Accent & Breadcrumb Ribbon)의 시각적 잡음 완전 제거**
> 1. **개발용 화면 ID 및 선행 아티클(번개 아이콘) 삭제**:
>    - 기존 좌측에 노출되던 원형 번개 아이콘(`<span className="material-symbols-outlined">bolt</span>`) 및 개발용 화면 식별자 **`"WEB-CLNT-COM-010000"`** 텍스트, 그리고 뒤따르는 구분점(`•`)을 완전히 삭제(DOM 제거).
> 2. **우측 "고양/일산 실시간 배차관제 중" 문구 삭제**:
>    - 기존 우측에 노출되던 녹색 펄스 애니메이션 점 및 **`"고양/일산 실시간 배차관제 중"`** 텍스트 요소를 완전히 삭제(DOM 제거).
> 3. **수정 후 상단 리본 구성**:
>    - 불필요한 개발용 텍스트와 부가 문구가 사라지고, **`고객 메인 홈`** (또는 `시공사 메인 홈`) 역할 레이블과 **`[📍 경기 고양시 일산동구]`** 지역 뱃지만 직관적이고 깔끔하게 단일 행으로 표출.
>    - 플랫폼 사용자의 시선이 첫 화면 핵심 CTA인 3대 청소 대분류 퀵 선택 카드로 자연스럽게 유도되는 효과 달성.

---

### 2.2 [공통 헤더] 브랜드 로고 연동, 로그아웃 버튼, 홈 캡슐 제거 및 주소 버튼 삭제
1. **화면 왼쪽 최상단 로고 이미지 스토리지 경로 표준화**:
   - 단순 아이콘 폰트(`auto_awesome`)를 완전 배제하고, 공식 브랜드 원형 심볼인 **`C:\SseulDakGo_Storage\sseuldakgo\logo\Logo_쓸고딱고.jpg`** 파일이 상단 좌측 로고 영역에 직접 출력되도록 수정.
   - 서버 경로 `/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg` 정적 라우팅 및 `/logo.jpg` fallback 지원.
2. **좌측 브랜드 로고 우측 현위치 주소 캡슐 삭제**:
   - 로고 바로 오른쪽에 위치하던 `[📍 경기 고양시 일산동구 ∨]` 캡슐 버튼을 완전히 삭제하여 상단 GNB의 여백과 간결성을 확보.
3. **화면 오른쪽 상단 맨 끝 '로그아웃' 버튼 추가**:
   - 시공사/고객 프로필 칩 우측 맨 끝에 고정된 **`[로그아웃]` 버튼을 상시 노출**.
   - 클릭 시 사용자 컨펌(`handleConfirmLogout`) 후 로컬/세션 스토리지를 정리하고 비회원 마켓플레이스로 안전하게 복귀.
4. **GNB '홈' 캡슐 버튼 제거 및 브랜드 로고 클릭 인터랙션 일원화**:
   - GNB 중앙 네비게이션의 첫 번째 항목이었던 별도의 `[홈]` 알약 캡슐 버튼을 완전 삭제.
   - 화면 좌상단 공식 로고 클릭 시 홈 기능으로 일원화 (로그인 시 `내정보 관리 WEB-CLNT-MYP-010100`, 비로그인 시 `메인 피드`).
5. **회원 구분 토글 삭제 및 역할별 자동 분기 렌더링**:
   - 헤더의 수동 `[일반 고객 / 시공사 파트너]` 전환 토글을 삭제하고, 로그인한 계정의 `TB_USER.USER_ROLE_CD`('C' 고객, 'S' 시공사)에 따라 페이지가 자동 분기 렌더링.
6. **시공사 대시보드 정리**:
   - 시공사 회원 화면에서 불필요했던 `정산 예치금 / 수익 포인트 (15,000P)` 카드 영역 완전 삭제.
7. **3단 분할 레이아웃 (푸터 바닥 고정 및 본문 독립 스크롤)**:
   - 상단 헤더(`fixed top-0`)와 하단 푸터(`shrink-0`)를 화면 상·하단에 고정.
   - 중간 본문 영역(`flex-1 overflow-y-auto`)만 상하 독립 스크롤되어 푸터의 법적 고지 및 고객센터 번호(1588-7824) 상시 노출.

---

### 2.3 [신규 기능] 알림 상세 모달 "이 발주에 청약 신청하기" 원클릭 연동 및 고객 푸시
- 신규 발주 푸시 알림 모달에서 시공사가 **`[이 발주에 청약 신청하기]`** 클릭 시:
  1. `TB_ORDER_MSTR`: `ORDER_STATUS = 'BID_APPLIED'` (청약 접수 완료) 갱신
  2. `TB_ORDER_DTL`: `SERVICE_STATUS = 'BID_APPLIED'`, `SELECTED_SERVICE_USER_NO = 'S20261100001'` 갱신
  3. `TB_QUOTE_APPLY`: 시공사 청약서 원장 레코드(`APPLY_STAT_CD = 'APPLIED'`) 생성
  4. `TB_USER_NOTIFICATION`: 발주를 등록한 고객(`CLIENT_USER_NO`)에게 실시간 청약 도착 푸시(`NOTI_TYPE = 'QUOTE_MATCH'`, `IS_READ = 'N'`) 자동 발송
  5. 모달 내에 에메랄드 성공 안내 배너 표출 및 `[확인 완료]` 버튼 전환

---

### 2.4 [비교 대조표] 삭제/수정 전 내용 vs 수정된 내용

| 구분 | 삭제/수정 전 내용 (Before) | 수정된 내용 (After) | 수정 사유 및 효과 |
| :--- | :--- | :--- | :--- |
| **상단 화면 ID 표기** | 리본 좌측에 `[번개 아이콘] WEB-CLNT-COM-010000 •` 노출 | **화면 ID 텍스트, 번개 아이콘, 구분점 완전 삭제** | 불필요한 개발용 코드 노출 제거, 정돈된 사용자 친화적 UI 구축 |
| **상단 배차관제 문구** | 리본 우측에 `● 고양/일산 실시간 배차관제 중` 텍스트 노출 | **우측 배차관제 문구 및 애니메이션 점 완전 삭제** | 불필요한 시각적 잡음 제거 및 콘텐츠 집중도 극대화 |
| **상단 리본 최종 구성** | 아이콘 + 화면ID + 구분점 + 홈레이블 + 지역뱃지 + 배차관제문구 | **`고객/시공사 메인 홈` 레이블 + `[📍 경기 고양시 일산동구]` 뱃지만 표출** | 직관적이고 깔끔한 단일 행 브레드크럼 완성 |
| **로고 우측 현위치 주소** | 로고 바로 오른쪽에 `[📍 경기 고양시 일산동구 ∨]` 캡슐 버튼 노출 | **현위치 주소 캡슐 버튼 완전 삭제 (DOM 제거)** | 헤더 시각적 잡음 제거, 간결하고 정돈된 브랜드 헤더 디자인 정립 |
| **좌상단 로고 이미지** | 단순 아이콘 폰트(`auto_awesome`) 또는 미스매칭 경로 | **`C:\SseulDakGo_Storage\sseuldakgo\logo\Logo_쓸고딱고.jpg` 직접 출력** | 실제 공식 브랜드 원형 심볼 로고로 통일 |
| **우측 상단 로그아웃** | 프로필 칩까지만 노출되고 로그아웃 버튼 부재 | **화면 오른쪽 상단 맨 끝에 `[로그아웃]` 버튼 추가** | 사용자가 언제든 원클릭으로 세션을 안전하게 종료 가능 |
| **GNB '홈' 버튼** | GNB 메뉴 첫 번째 항목으로 `<a href="#home">홈</a>` 버튼 노출 | **GNB '홈' 버튼 완전 삭제 (DOM 제거)** | 현대 웹 표준(웹앱) UX 준수 및 중앙 GNB 메뉴 시인성 향상 |
| **홈 기능 인터랙션** | GNB 중앙의 `홈` 버튼 클릭 | **화면 좌상단 브랜드 로고(`[로고] 쓸고닦고`) 클릭으로 이관** | 로고를 클릭하여 홈/메인으로 복귀하는 글로벌 UX 표준 확립 |
| **회원 구분 선택** | 헤더에 `[일반 고객 / 시공사 파트너]` 수동 전환 토글 노출 | **토글 완전 삭제, 로그인 계정(`USER_ROLE_CD`) 기반 자동 렌더링** | 불필요한 수동 조작 방지 및 보안/권한 격리 강화 |
| **화면 레이아웃 구조** | 푸터가 문서 최하단에 위치하여 페이지 전체가 함께 스크롤됨 | **Header 고정 + Footer 바닥 고정 + Main 중간 내용만 독립 스크롤** | 푸터 법적 고지/고객센터 번호 상시 노출 및 정돈된 웹앱 UX 완성 |

---

### 2.5 [수정 후 소스 마크업] 상단 브레드크럼 리본 구조

```jsx
{/* Top Visual Accent & Breadcrumb Ribbon (정리 완료) */}
<div className="flex items-center justify-between py-2 text-on-surface-variant font-caption text-caption">
  <div className="flex items-center gap-2">
    <span className="text-on-surface-variant font-body-sm text-body-sm font-semibold">
      {userInfo?.USER_ROLE_CD === 'S' ? '시공사 메인 홈' : '고객 메인 홈'}
    </span>
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-xs font-medium ml-1 border border-secondary/20">
      <span className="material-symbols-outlined text-[14px]">location_on</span>
      {regionInfo.DISPLAY_NM}
    </span>
  </div>
</div>
```

---

## 3. 백엔드 (BackEnd) API 명세

### 3.1 메인 홈 포털 데이터 조회 API
- **Endpoint**: `POST /api/web/client/com_010000`
- **Request Body**:
  ```json
  {
    "userRoleCd": "S",
    "regionCd": "41281"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "userRoleCd": "S",
      "mainLandingView": "WEB-CLNT-MYP-010100",
      "brandLogoUrl": "/storage/sseuldakgo/logo/Logo_쓸고딱고.jpg"
    }
  }
  ```

### 3.2 시공 청약 신청 및 고객 푸시 발송 API
- **Endpoint**: `POST /api/contractor/bid/apply`
- **Request Body**:
  ```json
  {
    "orderNo": "ORD-20261116-0001",
    "contractorUserNo": "S20261100001",
    "contractorNm": "공간다원",
    "notiId": "NT202611160001001"
  }
  ```

---

## 4. 연동 데이터베이스

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_USER` | 회원 마스터 | 사용자 기본 정보 및 회원 구분(`USER_ROLE_CD`: 'C' 고객, 'S' 시공사) |
| `TB_ORDER_MSTR` | 주발주 마스터 | 실시간 발주 피드 및 발주 진행 상태(`ORDER_STATUS`) 관리 |
| `TB_ORDER_DTL` | 발주 상세 | 청소 세부 품목 및 용역 진행 상태(`SERVICE_STATUS`) 동기화 |
| `TB_QUOTE_APPLY` | 파트너 청약서 | 시공사 청약서 접수 원장(`APPLY_STAT_CD = 'APPLIED'`) 관리 |
| `TB_USER_NOTIFICATION` | 사용자 알림 원장 | 헤더 알림 센터 건수 집계 및 고객/시공사 푸시메시지 수신 이력 |

---

## 5. 테스트 및 검증 체크리스트

| 번호 | 테스트 항목 | 기대 결과 | 검증 여부 |
| :---: | :--- | :--- | :---: |
| 1 | **상단 화면 ID 텍스트 미노출** | `"WEB-CLNT-COM-010000"` 글귀가 화면 상단에 노출되지 않는가? | **PASS** |
| 2 | **선행 번개 아이콘 미노출** | 화면 ID 앞의 원형 번개 아이콘(`bolt`) 및 구분점이 완전히 삭제되었는가? | **PASS** |
| 3 | **배차관제 문구 미노출** | 우측 `"고양/일산 실시간 배차관제 중"` 텍스트 및 애니메이션 점이 완전히 삭제되었는가? | **PASS** |
| 4 | **상단 리본 기본 구성 유지** | `고객 메인 홈` 텍스트 레이블과 `[📍 경기 고양시 일산동구]` 뱃지가 정상 노출되는가? | **PASS** |
| 5 | **좌상단 로고 이미지 출력** | `C:\SseulDakGo_Storage\sseuldakgo\logo\Logo_쓸고딱고.jpg` 파일이 상단 좌측에 선명하게 원형 심볼로 출력되는가? | **PASS** |
| 6 | **우측 상단 로그아웃 버튼** | 화면 오른쪽 상단 맨 끝에 `[로그아웃]` 버튼이 상시 노출되고, 클릭 시 안전하게 로그아웃되는가? | **PASS** |
| 7 | **GNB '홈' 버튼 미노출** | GNB 네비게이션 내 별도의 '홈' 텍스트 캡슐 버튼이 완전히 보이지 않는가? | **PASS** |
| 8 | **브랜드 로고 클릭 인터랙션** | 브랜드 로고를 클릭했을 때 '홈' 기능(로그인 시 내정보 유지, 비로그인 시 피드 유지)이 정상 작동하는가? | **PASS** |
| 9 | **하단 푸터 고정 및 본문 독립 스크롤** | 상단 헤더와 하단 푸터가 화면에 고정되고, 중간 본문 영역만 상하로 부드럽게 스크롤되는가? | **PASS** |
| 10 | **청약 신청 시 용역 상태 및 푸시 연동** | 알림 모달에서 청약 신청 시 `TB_ORDER_MSTR`, `TB_ORDER_DTL`이 `BID_APPLIED`로 갱신되고 고객에게 푸시가 전송되는가? | **PASS** |

---

## 6. 결론 및 유지보수 가이드
- **시각적 정제 (Visual Polish)**: 상단 브레드크럼 리본에서 개발용 식별자(`WEB-CLNT-COM-010000`), 번개 아이콘, 배차관제 문구를 모두 삭제함으로써 실제 상용 서비스에 적합한 깔끔하고 전문적인 브랜드 인상을 완성하였습니다.
- **컴포넌트 일관성 유지**: 본 수정 사항은 `preview/index.html`, `preview_client/index.html`, `preview_client/WEB-CLNT-COM-010000.html`, `SseulDakGo_Web/.../index.jsx`의 모든 메인 홈 소스에 일관되게 동기화되어 향후 빌드나 개별 파일 실행 시에도 동일한 UI가 보장됩니다.
- **프로그램 유지보수 시 유의사항**: 상단 브레드크럼 리본 영역은 오직 사용자의 현재 접속 역할(`고객 메인 홈` vs `시공사 메인 홈`) 및 현재 설정된 서비스 지역(`regionInfo.DISPLAY_NM`)을 나타내는 경량 인디케이터로만 사용해야 하며, 불필요한 상태 텍스트나 장식성 아이콘의 추가를 지양합니다.

---
## [2026-11-24 업데이트] 시공자 홈페이지 분기 제거
- WEB-CLNT-COM-010000/index.jsx 에서 WebSrvcJob020000 import 및 시공사 현장 진행 현황(WEB-SRVC-JOB-020000) 화면 전환 분기를 제거하여 고객 전용 홈으로 순수화했습니다.
- 시공사 내정보 및 서비스 지역 관리는 WEB-SRVC-MYP-010100으로 독립 분리되었습니다.

- 로그아웃(비회원 GUEST) 상태에서는 상단 종 아이콘 우측의 미확인 푸시메시지 건수 배지를 출력하지 않도록 조건을 보완했습니다.

- [2026-11-26 업데이트] WEB-CLNT-COM-010000/index.jsx 본문을 신규 HTML 레이아웃(Hero + 우리집 청소 요청 등록하기, 3대 청소 용역 대분류, 이용 절차 4단계, 실시간 발주·매칭 현황, 파트너 모집 & 모바일 앱 배너)으로 개편하고 기존 Header/Footer를 유지했습니다.
