# [SseulDakGo (쓸고닦고)] APP-CLNT-COM-000 (고객 모바일 홈) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `APP-CLNT-COM-000` |
| **화면명** | 고객 모바일 홈 (Client Mobile Home Hub - Capacitor / WebView Hybrid) |
| **지원 채널** | Mobile App (iOS / Android / Mobile Web) |
| **아키텍처 방식** | **웹뷰 기반 하이브리드 앱 (Capacitor / WebView Shell)**<br>순수 웹용 React(Next.js / Vite)로 개발한 반응형 웹페이지를 네이티브 웹뷰 껍데기 안에 패키징 |
| **도메인 역할** | `Client` (고객 전용 모바일 메인 포털 허브) |
| **프론트엔드 파일** | [`SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.tsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.tsx)<br>[`SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_App/Client/backend/api_APP_CLNT_COM_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_App/Client/backend/api_APP_CLNT_COM_000/route.js) |
| **API 엔드포인트** | `POST /api/app/client/com_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **Capacitor / WebView 네이티브 브릿지 완벽 지원**:
   - iOS/Android 단말 노치 및 인디케이터 바 대응을 위한 Safe Area Insets (`pt-safe`, `pb-safe`, `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) 적용.
   - 단말 햅틱 진동 피드백(`Haptics.impact({ style: 'LIGHT' })`), 스테이터스 바 설정(`StatusBar`), 안드로이드 하드웨어 뒤로가기 버튼(`App.addListener('backButton')`) 완벽 연동.
   - 브라우저 및 웹 프리뷰 구동 시에도 에러 없이 자동 Fallback되는 브릿지 추상화 계층 내장.
2. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 모바일 전용 홈 데이터(고객 정보, 피드, 카테고리 메타데이터, 실시간 매칭 통계)는 오직 `POST /api/app/client/com_000`에서 전담합니다.
3. **공식 브랜드 아이덴티티 및 3대 핵심 가치**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 및 공식 엠블럼 적용.
   - 역경매 입찰(덤핑) 배제, 100% 고객 지정 확정가 정찰제, 에스크로 없는 현장 직불 및 3개월 안심보증 명시.
4. **플로팅 패스트 발주 CTA 바 및 바텀시트 모달**:
   - 하단 탭 내비게이션 상단에 `[ + 우리 집 청소 요청 등록하기 (비로그인 가능) ]` 플로팅 바를 스티키 배치하여 전환율을 극대화.
   - 터치 시 카테고리별 맞춤 견적 요청 바텀시트 모달 오픈 후 `APP-CLNT-REQ-000`으로 자연스럽게 진입.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_USER` | 회원 마스터 | 고객(C) 식별, 인증회원 배지 표시, 프로필 사진 URL 매핑 |
| `TB_COM_CODE` | 공통코드 마스터 | 3대 청소 대분류 코드(`GRP_CD = 'CLEAN_LARGE'`) 메타데이터 조회 |
| `TB_ORDER_MSTR` | 주발주 마스터 | 선택 지역 내 실시간 발주 오더 목록 5건 및 상태 조회 |
| `TB_ORDER_DTL` | 발주 상세 | 오더별 대/중분류 코드 및 세부 시공 규격 조인 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 구성 요소
1. **Top Brand & GNB Header Box (통합 상단 헤더)**:
   - 상단 구 헤더(지역 선택 칩, 중앙 엠블럼, 우측 프로필/알림) 및 실시간 매칭 티커 바 삭제 후 일원화
   - 브랜드 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)), `쓸고딱고` 타이틀, `공식인증` 배지, `고객용` 역할 태그
   - 서브 카피: `가격 흥정 없는 100% 고객 확정가 직매칭`
   - 제목 앞 상단 우측 액션 버튼 (정확한 배치 순서):
     1. `알람 종 아이콘` (새 알림 뱃지 포함)
     2. `로그인` 버튼 (`APP-CLNT-ATH-000` 라우팅)
     3. `회원가입` 버튼 (`APP-CLNT-ATH-010` 라우팅)
   - GNB 네비게이션 탭 바:
     - `홈`, `나의 신청현황` (`APP-CLNT-ORD-000`), `이용내역` (`APP-CLNT-JOB-000`), `내정보` (`APP-CLNT-ATH-000`)
2. **Hero Section (메인 타이틀 & 3대 핵심 청소 서비스 카테고리 퀵 카드)**:
   - 제목: `원하는 청소를 선택하고 / 확정 금액으로 바로 발주하세요`
   - 부제목: `수수료 부담 없는 역경매 0원 • 파트너 전담 시공 매칭`
   - **건물 정기관리 (`REGULAR`)**: `최소 3개월(90일) 락`, 계단/복도/외곽 케어, 지정 요일제·사진 보고
   - **가전 분해청소 (`APPLIANCE`)**: `완전분해 살균세척`, 에어컨/세탁기 고압스팀, 130℃ 친환경 스팀
   - **입주/이사 대청소 (`MOVEIN`)**: `실내 전용공간 케어`, 미세분진/찌든때 정밀케어, 피톤치드 연무 무료소독
3. **쓸고딱고 배너 및 수수료 공개 배너**:
   - `쓸고딱고`: "시공사 청약이 완료되면 시공사의 별점, 후기글을 참고하세요. \"건물 정기관리, 가전 분해청소, 입주/이사청소\" 별 각각 3회 시공사를 변경할 수 있습니다" 및 `[이용 약관 보기 >]` 링크
   - 플랫폼 매칭 수수료 안내 (현장 노무비 본금 마진 0원, 직불제 고지)
4. **실시간 접수 정보 (Live Feed - 5건)**:
   - 실시간 접수 상태(`청약접수중`, `매칭완료`, `시공완료`), 서비스 분류, 시공 주소, 확정 제안금액 표출
5. **하단 고정 플로팅 바**:
   - 플로팅 CTA: `+ 우리 집 청소 요청 등록하기 (비로그인 가능)` (하단 바텀 네비게이션 삭제 후 최하단 안전 영역에 밀착 배치)

---

### 3.2 인증 및 세션 영속성 관리 (로그아웃 기본 & 아이디저장/로그인유지)
1. **초기 진입 시 로그아웃 상태 기본 원칙**:
   - 앱/홈페이지가 최초 실행될 때 저장된 `SSEULDAKGO_KEEP_LOGIN = 'Y'` 플래그가 없으면 무조건 **로그아웃 상태(`currentUser = null`)**로 구동됩니다.
   - 상단 액션 클러스터 표출: `알람 종 아이콘` -> `로그인` -> `회원가입` 순서
2. **로그인 모달 (`아이디 저장` vs `로그인 유지`)**:
   - **아이디 저장 (`SAVE_ID_YN`)**: 체크 시 `localStorage.setItem('SSEULDAKGO_SAVED_USER', ...)`에 이메일 계정을 저장하여 다음 로그인 시 자동 완성됩니다. (미체크 시 삭제)
   - **로그인 유지 (`KEEP_LOGIN_YN`)**:
     * **체크 시 (`Y`)**: `localStorage.setItem('SSEULDAKGO_KEEP_LOGIN', 'Y')` 및 사용자 인증 객체를 영구 저장하여, 앱이나 브라우저를 종료 후 재실행해도 **로그인 상태가 그대로 유지**됩니다.
     * **미체크 시 (`N`)**: `localStorage`의 인증 정보를 제거하고 `sessionStorage`에만 세션을 임시 보관하므로, 앱이나 브라우저를 닫고 다시 실행하면 **자동으로 로그아웃 상태**로 초기화됩니다.
3. **로그인 상태 시 UI 변경**:
   - 상단 액션 클러스터: `알람 종 아이콘` -> `사용자명(홍길동님)` -> `로그아웃` 버튼으로 동적 전환
   - `로그아웃` 클릭 시 `localStorage` 및 `sessionStorage` 인증 토큰을 즉시 폐기하고 로그아웃 상태로 안전하게 복귀합니다.

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/app/client/com_000`
- **구현 함수**: `processAppClntCom000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "clientUserNo": "C20261000001", // 비회원일 경우 "GUEST"
  "sidoCd": "41",                 // 기본값: "41" (경기도)
  "sigunguCd": "41281"            // 기본값: "41281" (고양시 일산동구)
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "userInfo": {
      "userNo": "C20261000001",
      "userNm": "홍길동",
      "userRoleCd": "C",
      "isGuest": false,
      "isCertified": true,
      "profileImgUrl": "https://lh3.googleusercontent.com/..."
    },
    "regionInfo": {
      "sidoCd": "41",
      "sigunguCd": "41281",
      "sidoNm": "경기도",
      "sigunguNm": "고양시 일산동구",
      "displayNm": "고양시 일산동구"
    },
    "matchingStats": {
      "locationText": "고양시 일산동구 실시간 매칭 중",
      "avgMatchMinutes": 8.4,
      "activeBiddersCount": 14
    },
    "categoryList": [
      {
        "cleanLargeCd": "REGULAR",
        "cleanLargeNm": "건물 정기관리",
        "badgeText": "최소 3개월(90일) 락",
        "icon": "apartment"
      }
    ],
    "feedList": [
      {
        "orderNo": "ORD20261102001",
        "cleanLargeCd": "REGULAR",
        "cleanLargeNm": "정기청소",
        "cleanMidNm": "빌라 공용부",
        "addrText": "마두동 4층 빌라 (계단/복도)",
        "proposedPrice": 240000,
        "priceDisplay": "월 240,000원",
        "orderStatus": "BID_OPEN",
        "orderStatusNm": "청약접수중",
        "statusType": "BID_OPEN",
        "regDtText": "10분 전"
      }
    ],
    "serverTime": "2026-10-31T05:00:00.000Z"
  },
  "message": "고객 모바일 홈 데이터가 정상 조회되었습니다."
}
```

---

## 5. Capacitor 하이브리드 앱 패키징 가이드

### 5.1 `capacitor.config.ts` 설정 예시
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.co.sseuldakgo.client',
  appName: '쓸고닦고',
  webDir: 'out', // Next.js 정적 빌드 폴더 또는 dist
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Haptics: {},
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAFAF8'
    }
  }
};

export default config;
```

### 5.2 웹뷰 통신 및 햅틱 호출
- 버튼 터치 및 모달 오픈 시 `triggerHaptic('LIGHT')`가 자동으로 호출되어 모바일 네이티브 앱과 동일한 진동 피드백을 전달합니다.
- 모달이 열려있는 상태에서 단말의 하드웨어 뒤로가기 버튼을 누르면 브라우저 히스토리 이동 대신 바텀시트 모달이 먼저 닫힙니다.

---

## 6. 검증 및 테스트 결과

1. **빌드 검증**: `tsc` 기반 TypeScript 구문 검사 및 `preview/app_clnt_com_000.js` 번들 생성 완료.
2. **반응형 모바일 Safe Area 검증**: `pt-safe`, `pb-safe` 적용으로 상단 상태바 및 하단 홈 바와 겹치지 않고 온전하게 레이아웃 렌더링 확인.
3. **API 엔드포인트 연동**: `POST /api/app/client/com_000` 호출 시 5개 실시간 피드 및 고객 프로필 정상 반환 확인.
4. **프리뷰 서버 연동**: `http://localhost:3000/app` 및 `http://localhost:3000/preview/app.html`을 통해 웹뷰 환경 즉시 시뮬레이션 가능.

