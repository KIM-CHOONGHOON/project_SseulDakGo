# 쓸고닦고 '내정보' 메뉴 체계 ID 채번 및 Stitch AI 화면 생성 프롬프트 명세서

---

## 1. 개요 및 변경 목적
- **헤더 명칭 변경**: 기존 우측 상단 `마이` 메뉴를 직관적인 **`내정보`** 로 변경.
- **역할 기반 하위 메뉴 분기**:
  - **고객(C)**: 전화번호 변경, 비밀번호 변경, 내정보 (총 3개)
  - **시공사(S)**: 사업자등록증 등록, 전화번호 변경, 비밀번호 변경, 내정보 (총 4개)
- **표준 ID 채번 규칙**:
  - Frontend 화면 ID: `WEB-CLNT-MYP-[대분류 2자리][중분류 2자리][소분류 2자리]`
  - Backend API ID: `api_WEB_CLNT_MYP_[대분류 2자리][중분류 2자리][소분류 2자리]`

---

## 2. 사용자별 메뉴 및 표준 ID 채번표

| 대상 | 메뉴명 | FrontEnd ID | BackEnd API ID | 비고 / 기능 구분 |
| :--- | :--- | :--- | :--- | :--- |
| **공통** | **내정보 (기본 프로필)** | `WEB-CLNT-MYP-010100` | `api_WEB_CLNT_MYP_010100` | 기본 인적사항, 역할(C/S) 뱃지, 가입일, 상태 조회 |
| **공통** | **전화번호 변경** | `WEB-CLNT-MYP-010200` | `api_WEB_CLNT_MYP_010200` | SMS 휴대폰 본인인증 팝업 및 번호 갱신 |
| **공통** | **비밀번호 변경** | `WEB-CLNT-MYP-010300` | `api_WEB_CLNT_MYP_010300` | 현재 비밀번호 검증 + 신규 비밀번호 규칙(영문/숫자/특수문자 8~16자) 검증 |
| **시공사** | **사업자등록증 등록** | `WEB-CLNT-MYP-020100` | `api_WEB_CLNT_MYP_020100` | 사업자등록번호 검증, 상호명/대표자명, 사업자등록증 사본(PDF/JPG) 업로드 |

---

## 3. Stitch AI 화면 생성용 정밀 프롬프트 명세서

### [ID: WEB-CLNT-MYP-010100] 내정보 (프로필 상세 및 통계 대시보드)
```text
Role: Top-tier UI/UX Designer specialized in Clean Modern Enterprise Portals.
Project: SseulDakGo (Professional Cleaning & Space Management Platform).
Screen: [WEB-CLNT-MYP-010100] User Profile & Activity Summary (내정보).

[Design Requirements]:
- Theme: Clean White & Emerald Blue Accent (#0052cc / #0d9488), Modern Card Layout with subtle border shadows (Tailwind border-slate-200).
- Top Section:
  * User Avatar with Edit Badge, Name ("김충훈" for Client, "공간다원" for Contractor).
  * Role Badge: Blue badge "일반 고객 (C)" or Emerald Green badge "인증 시공사 (S)".
  * Account Metadata: User No ("C20261100001" / "S20261100001"), Email, Social Link icon (Naver/Kakao badge).
- Middle Section:
  * Quick Summary Metric Cards: [진행 중인 의뢰: 2건], [완료된 시공: 14건], [작성/받은 후기: 4.9★].
  * For Contractor: Show "사업자 인증 상태: 인증완료 (인증일 2026-11-15)" banner.
- Bottom Action Area:
  * Quick Navigation Buttons with icons: "전화번호 변경", "비밀번호 변경", (If Contractor: "사업자등록증 관리"), "로그아웃", "회원탈퇴".
- Responsive: Mobile-first responsive card layout with 12-column grid on desktop.
```

---

### [ID: WEB-CLNT-MYP-010200] 전화번호 변경 (SMS 본인인증 모달)
```text
Role: Top-tier UI/UX Designer specialized in Fintech Authentication Flow.
Project: SseulDakGo (Professional Cleaning & Space Management Platform).
Screen: [WEB-CLNT-MYP-010200] Phone Number Change Modal (전화번호 변경).

[Design Requirements]:
- Modal Type: Centered overlay modal with backdrop blur (bg-black/50 backdrop-blur-sm), max-width 480px, rounded-2xl.
- Header:
  * Title: "전화번호 변경", Subtitle: "안전한 거래 및 알림 수신을 위해 새 휴대폰 번호로 인증해주세요."
- Input Form Step:
  1. Current Registered Number: Disabled field displaying masked number (e.g., "010-82**-3457").
  2. New Phone Number Input:
     * Numeric input with clean border, Placeholder "010-XXXX-XXXX".
     * Right-aligned button: "인증번호 요청" (Primary Teal #0d9488).
  3. Verification Code Input:
     * 6-digit verification code input with countdown timer (e.g., "03:00" in red text).
     * Right-aligned button: "확인".
- Footer Buttons:
  * "취소" (Ghost/Secondary button, gray border).
  * "변경 완료" (Active full-width CTA button, disabled until code is verified).
- States: Validation error helper text ("인증번호가 일치하지 않습니다"), Success feedback toast notification.
```

---

### [ID: WEB-CLNT-MYP-010300] 비밀번호 변경 (보안 강화 모달)
```text
Role: Top-tier UI/UX Designer specialized in Cybersecurity & Identity Portals.
Project: SseulDakGo (Professional Cleaning & Space Management Platform).
Screen: [WEB-CLNT-MYP-010300] Password Change Modal (비밀번호 변경).

[Design Requirements]:
- Modal Type: Centered security dialog, max-width 480px, rounded-2xl with padlock security icon at top.
- Notice Banner:
  * If user logged in via Social OAuth (Naver/Kakao): Informative info box "소셜 연동 계정(네이버/카카오)은 해당 포털의 보안 설정을 따르며, 자체 로그인용 비밀번호를 별도 생성할 수 있습니다."
- Input Fields:
  1. Current Password: Password input with eye toggle icon (Show/Hide).
  2. New Password: Password input with real-time password strength meter (Weak / Moderate / Strong).
  3. Confirm New Password: Password input with match indicator checkmark (Green "비밀번호 일치").
- Password Policy Checklist (Interactive checkmarks):
  * [✓] 8~16자 영문 대/소문자
  * [✓] 숫자 포함
  * [✓] 특수문자(!@#$%^&*) 1개 이상 포함
- Footer Buttons:
  * "취소" and "비밀번호 변경하기" CTA (Primary Brand Color).
```

---

### [ID: WEB-CLNT-MYP-020100] 시공사 전용 사업자등록증 등록/관리
```text
Role: Top-tier UI/UX Designer specialized in B2B Partner Onboarding Portals.
Project: SseulDakGo (Professional Cleaning & Space Management Platform).
Screen: [WEB-CLNT-MYP-020100] Contractor Business Registration Modal (사업자등록증 등록).

[Design Requirements]:
- Modal Type: Centered wide business modal, max-width 600px, rounded-2xl, enterprise tone.
- Status Badge at Top:
  * "미등록" (Gray) / "심사 대기중" (Amber) / "인증 완료" (Emerald Green: "정상 시공 파트너").
- Form Fields:
  1. 사업자 유형 선택: Segmented control [개인사업자] / [법인사업자].
  2. 상호명 (법인명): Read-only or editable text field (예: "공간다원").
  3. 사업자등록번호: 10자리 숫자 입력 (XXX-XX-XXXXX) + "국세청 홈택스 실시간 진위 확인" 버튼 (Blue-600).
  4. 대표자 성명: 텍스트 입력 (예: "김충훈").
  5. 개업 연월일: Date picker (YYYY-MM-DD).
  6. 사업자등록증 사본 첨부 (Drag & Drop File Upload Zone):
     * File drop area with cloud upload icon, dashed border.
     * Accepted formats: JPG, PNG, PDF (Max 10MB).
     * File preview thumbnail with delete/re-upload action.
- Compliance Notice:
  * "전자상거래법 및 개인정보보호법에 의거하여 사업자 신원 확인 목적으로만 이용되며 안전하게 암호화 보관됩니다."
- Footer Buttons:
  * "닫기" and "등록 및 인증 요청" CTA Button.
```
