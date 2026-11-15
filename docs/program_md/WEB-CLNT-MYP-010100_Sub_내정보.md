# [화면 명세서] WEB-CLNT-MYP-010100_Sub_내정보

---

## 1. 화면 개요
- **화면 ID**: `WEB-CLNT-MYP-010100`
- **화면 구분**: `Sub`
- **화면명**: 내정보 (프로필 상세 및 통계 대시보드)
- **접근 URL**: `https://sseuldakgo.kr/client/mypage` (로컬 프리뷰: `http://localhost:3000/preview/myp_010100.html`)
- **담당 도메인 / 역할**: Client 도메인 / 고객(C) 및 시공사(S) 공통 접근
- **개요**: 회원 기본 프로필, 고객(C)/시공사(S) 듀얼 페르소나 뷰 스위처, 시공사 인증 배너, 4대 요약 통계 Bento 그리드, 진행 중인 공간 케어 5단계 타임라인, 계정/보안 설정(전화번호/비밀번호/사업자등록증 관리 서브 모달 연계)을 제공하는 통합 대시보드.

---

## 2. 프론트엔드 명세
- **컴포넌트 파일 경로**: `SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010100/index.jsx`
- **프레임워크 / 라이브러리**: React 19 (또는 React 18 UMD), Tailwind CSS 3.4+, Material Symbols Outlined
- **Props 인터페이스**:
  ```typescript
  interface WebClntMyp010100Props {
    onNavigate?: (path: string) => void;
    onOpenPhoneModal?: () => void;       // WEB-CLNT-MYP-010200 연계
    onOpenPasswordModal?: () => void;    // WEB-CLNT-MYP-010300 연계
    onOpenBizModal?: () => void;         // WEB-CLNT-MYP-020100 연계
    onLogout?: () => void;
    currentUser?: {
      USER_NO: string;
      USER_NM: string;
      USER_ROLE_CD: 'C' | 'S';
      EMAIL?: string;
      PHONE?: string;
    };
  }
  ```
- **주요 State**:
  - `activeRoleView`: `'client'` | `'contractor'` (듀얼 페르소나 뷰 전환)
  - `profileData`: 회원 기본정보, 포인트, 누적 통계, 사업자등록 번호/상호
  - `twoFactorAuth`: 2단계 인증 On/Off 토글
  - `toast`: `{ show: boolean, message: string }` 피드백 토스트

---

## 3. 백엔드 API 명세
- **API ID**: `api_WEB_CLNT_MYP_010100`
- **물리 경로**: `SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_010100/route.js`
- **HTTP Method & URL**: `GET /api/web/client/myp_010100?userNo={USER_NO}` (또는 `POST /api/web/client/myp_010100`)
- **요청 파라미터 (Request Query / Body)**:
  ```json
  {
    "userNo": "C20261100001"
  }
  ```
- **응답 명세 (Response Body)**:
  ```json
  {
    "success": true,
    "data": {
      "userNo": "C20261100001",
      "userName": "김충훈",
      "userRoleCd": "C",
      "email": "ch.kim@sseuldakgo.com",
      "phone": "010-8942-9114",
      "points": 15000,
      "ongoingCount": 2,
      "completedCount": 14,
      "rating": 4.9,
      "ratingTotal": 28,
      "bizNo": "120-88-29401",
      "bizName": "공간다원",
      "bizVerifiedDt": "2026-11-15"
    }
  }
  ```

---

## 4. 연동 데이터베이스
- **대상 테이블**:
  - `TB_USER`: 사용자 기본 정보(USER_NO, USER_NM, USER_ROLE_CD, EMAIL, PHONE_NO)
  - `TB_ORDER_MSTR`: 고객 의뢰 진행(BID_OPEN, CNTR_CONFIRMED) 및 완료(SVC_COMPLETED) 건수 집계
  - `TB_CLEAN_CONTRACT`: 시공사 수주 진행 및 완료 건수 집계
  - `TB_SERVICE_DOC`: 시공사 사업자등록증 진위 및 등록 정보(BIZ_REG_NO, CORP_NM, VERIFIED_DT)

---

## 5. 비즈니스 룰 및 예외 처리 정책
1. **역할별 메뉴 및 콘텐츠 노출 통제 (Role-based Dynamic View)**:
   - **고객(C)**:
     - 프로필 뱃지: `일반 고객 (C)` 단독 표출.
     - 사업자 인증 상태 배너(`contractorBanner`): **완전 숨김**.
     - 하단 계정 및 보안 관리: **"사업자등록증 & 전자세금계산서 정보" 메뉴 비노출 (숨김)**.
     - 환불/예치금 계좌: `환불 및 예치금 계좌 관리` (예금주: 고객 성명).
   - **시공사(S)**:
     - 프로필 뱃지: `인증 시공사 (S) · 파트너` 단독 표출.
     - 사업자 인증 상태 배너: **노출 및 강조 링 활성화**.
     - 하단 계정 및 보안 관리: **"사업자등록증 & 전자세금계산서 정보 (시공사 전용)" 메뉴 활성화 노출 (`showBizMenu: true`)**.
     - 정산 계좌: `시공 용역 대금 및 정산 계좌 관리` (예금주: 상호명/대표자).

2. **서브 모달 트리거**:
   - 휴대폰 번호 변경 클릭 ➔ `onOpenPhoneModal` (`WEB-CLNT-MYP-010200`)
   - 비밀번호 변경 클릭 ➔ `onOpenPasswordModal` (`WEB-CLNT-MYP-010300`)
   - 사업자등록증 관리 클릭 ➔ `onOpenBizModal` (`WEB-CLNT-MYP-020100`, 시공사 전용)

3. **네트워크 장애 폴백 (Smart Fallback)**:
   - 외부 DB 연결 지연 또는 오프라인 환경에서도 컴포넌트가 중단되지 않고 회원 구분(C/S)에 부합하는 표준 기본 데이터를 자동으로 분기 제공하여 UX 연속성 보장.
