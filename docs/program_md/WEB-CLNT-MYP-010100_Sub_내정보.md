# [프로그램 상세 명세서] 내정보 관리 및 계정 설정 서브페이지 (WEB-CLNT-MYP-010100)

## 1. 개요 및 목적
- **화면 ID**: `WEB-CLNT-MYP-010100`
- **화면명**: 마이페이지 - 내정보 관리 및 계정 설정 (`My Profile & Account Settings`)
- **목적**:
  - 쓸고딱고 플랫폼의 로그인 사용자가 자신의 기본 프로필, 연락처, 회원식별번호, 배송/시공지 기본 주소 및 알림 수신 설정을 일괄 조회하고 관리합니다.
  - 로그인 세션 역할(`CURRENT_USER.ROLE`: 일반 고객 `C` vs 시공 파트너사 `S`)에 따라 역할별 맞춤형 요약 지표(통계 카드)를 직관적으로 제공합니다.
  - 불필요하거나 중복된 복합 기능(수동 뷰 전환 알약 탭, Contractor Partner Dashboard 영문 문구, 중복 회원등급 배지, 마이페이지 내 시공사 사업자등록증/세금계산서 설정 항목, 2단계 안심 로그인 설정)을 정비하여 사용자 혼선을 최소화하고 간결한 직관적 계정 관리 환경을 제공합니다.
  - 시공사(`S`) 회원인 경우 기존에 상단에 길게 노출되던 와이드 배너를 제거하고, Bento 그리드 4번째 컬럼("받은 고객 평점 및 신뢰도" 우측)에 동일한 규격의 "사업자 인증 상태(인증완료, 사업자번호, 전문분야, 원본 조회, 갱신 안내)" 카드로 재배치하여 화면 공간 효율과 디자인 일관성을 극대화합니다.

---

## 2. 변경 이력 및 비교 대조표 (Before & After)

| 구분 | 변경 전 (Before) | 변경 후 (After) | 변경 사유 및 조치 사항 |
| :--- | :--- | :--- | :--- |
| **타이틀 보조 문구** | "내정보 관리" 옆에 `Contractor Partner Dashboard` (시공사 뷰 시) 노출 | **`Contractor Partner Dashboard` 문구 완전 삭제** | 불필요한 영문 대시보드 텍스트를 제거하여 "내정보 관리" 메인 타이틀의 가독성 제고 |
| **회원등급 배지 노출** | "공간다원" 우측에 `일반 고객 (C)`과 `인증 시공사 (S) · 파트너` 2개 배지가 동시 노출 | **로그인한 회원의 단일 등급 배지만 조건부 출력** (`isContractor ? 인증 시공사 (S) : 일반 고객 (C)`) | 로그인 세션에 일치하는 정확한 회원 상태 1개만 단독 표기하여 정체성 혼선 해소 |
| **회원 메타데이터 정렬** | 회원번호, 이메일, 전화번호, 간편로그인이 한 줄에 여러 개 나열되어 복잡함 | **2단 행(줄바꿈) 구조로 분리 정리**<br>• 1행: 회원번호, 휴대전화번호(인증완료)<br>• 2행: 이메일, 간편로그인(실제 인증 SNS만 출력) | 시각적 위계 확립 및 실제 연동된 SNS(`카카오` 또는 `네이버`) 1개만 간결하게 표시 |
| **상단 설명 문구** | "...사업자등록증 **및 세금계산서 정보**, 수주/시공 통계..." | "...사업자등록증 **정보**, 수주/시공 통계..." | "및 세금계산서" 문구를 제거하여 정책 통일 |
| **사업자 인증 카드 위치** | 상단에 전체 가로폭(`w-full`)의 와이드 배너로 길게 노출됨 | **"받은 고객 평점 및 신뢰도" 우측(Card 4)으로 이동 배치**<br>(평점 박스와 완전히 동일한 규격/크기 적용) | 불필요한 상단 스크롤 점유를 줄이고 4열 Bento 그리드 규격에 완벽히 통합 |
| **시공사 세무 정보 항목** | 보안 및 계정 관리 카드 내 `사업자등록증 & 전자세금계산서 정보` 관리 버튼 노출 | **해당 항목 완전 삭제** | 사업자 정보 관리는 전용 시공사 관리자 포털(`WEB-CLNT-MYP-020100`)로 이관 |
| **2단계 로그인 설정 항목** | 보안 및 계정 관리 카드 내 `2단계 안심 로그인 설정` 토글 노출 | **해당 항목 완전 삭제** | 간편로그인(소셜/단일 통합인증) 정책 통일 및 미지원 기능에 대한 UI 노이즈 제거 |
| **상단 역할 전환 UI** | 타이틀 우측에 `일반 고객 뷰` vs `인증 시공사 뷰` 수동 토글 알약 탭 노출 | **수동 전환 알약 탭 완전 삭제** | 로그인 사용자 인증 세션/토큰의 권한에 따라 뷰가 결정되도록 정책 일원화 |

---

## 3. 화면 UI 구조 및 3단 레이아웃 아키텍처

```
+-----------------------------------------------------------------------------------+
| [TOP] 고정 상단 네비게이션 헤더 (Header - Sticky, h-[72px], z-50)                    |
| - 로고 (localStorage 'brandLogo' 연동), 글로벌 메뉴, 알림센터 벨아이콘(N건 배지)        |
+-----------------------------------------------------------------------------------+
| [MIDDLE] 본문 스크롤 컨테이너 (Main Body - flex-1, overflow-y-auto, pb-24)          |
|                                                                                   |
|  1. 헤더 타이틀 블록                                                                |
|     - "내정보 관리" (단독 깔끔한 타이틀)                                             |
|     - 설명문 ("시공 파트너 계정 정보, 사업자등록증 정보, 수주/시공 통계...")           |
|                                                                                   |
|  2. 프로필 히어로 카드 (Profile Hero Card)                                         |
|     - 아바타 이미지 + 카메라 변경 버튼                                              |
|     - 회원이름 (예: "공간다원 대표 김충훈" or "김충훈") + 단일 인증 배지              |
|     - 메타데이터 (2단 구성):                                                        |
|       * [Line 1]: [회원번호 + 복사버튼]  [휴대전화번호 (인증완료)]                    |
|       * [Line 2]: [이메일 주소]  [간편로그인 : 네이버 (또는 카카오)]                  |
|     - 우측 액션: [프로필 사진 변경], [기본 정보 수정], [안심번호 발급중]             |
|                                                                                   |
|  3. 통계 요약 카드 그리드 (4 Bento Grid Columns - 동일 높이 및 동일 폭)             |
|     +-------------------+-------------------+-------------------+-------------------+
|     | Card 1: 수주/진행 | Card 2: 시공완료  | Card 3: 평점/신뢰 | Card 4:           |
|     | • 고객: 진행 의뢰 | • 고객: 완료 시공 | • 고객: 작성 평점 | • 시공사: 인증상태|
|     | • 시공: 수주 진행 | • 시공: 시공 실적 | • 시공: 고객 평점 |   (사업자/전문분야)|
|     |                   |                   |   및 신뢰도       | • 고객: 쿠폰/포인트|
|     +-------------------+-------------------+-------------------+-------------------+
|                                                                                   |
|  4. 상세 설정 2열 그리드 (Settings Grid)                                           |
|     +-----------------------------------+-----------------------------------+     |
|     | [좌측] 기본 계정 정보               | [우측] 보안 및 알림 설정            |     |
|     | - 이름 / 닉네임 입력필드          | - 비밀번호 변경 (모달 연동)         |     |
|     | - 휴대폰번호 (인증완료)           | - PUSH 알림 수신 동의 (토글)        |     |
|     | - 이메일 계정                     | - 마케팅 혜택 알림 동의 (토글)      |     |
|     | - 기본 시공/배송 주소지 + [변경]   | - [회원 탈퇴 신청] (하단 링크)      |     |
|     +-----------------------------------+-----------------------------------+     |
|                                                                                   |
|  5. 하단 액션 바: [변경사항 저장하기] (Primary Navy Button)                         |
+-----------------------------------------------------------------------------------+
| [BOTTOM] 고정 하단 푸터 (Footer - Sticky, h-[88px], z-40)                          |
| - 사업자 정보, 고객지원 1588-7824, 이용약관, 개인정보처리방침, Copyright             |
+-----------------------------------------------------------------------------------+
```

---

## 4. 프론트엔드 컴포넌트 상세 명세

### 4.1 대상 소스 파일
- **JSX 메인 컴포넌트**: `SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010100/index.jsx`
- **단독 미리보기 파일**: `preview/myp_010100.html`, `preview_client/myp_010100.html`
- **통합 미리보기 파일**: `preview/index.html`, `preview_client/index.html`, `preview_client/WEB-CLNT-COM-010000.html`

### 4.2 프로필 메타데이터 2단 행 구조
```jsx
{/* Metadata Pill Badges (2단 줄바꿈 구성) */}
<div className="flex flex-col gap-1.5 text-slate-600 text-xs">
  {/* Line 1: 회원번호 & 휴대전화번호 */}
  <div className="flex flex-wrap items-center gap-2">
    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
      <span className="text-slate-500 font-bold uppercase text-[10px]">회원번호</span>
      <span className="font-mono font-bold text-slate-900">{profileData.userNo}</span>
      <button
        className="text-slate-400 hover:text-[#003d9b] transition-colors flex items-center cursor-pointer"
        onClick={handleCopyMemberNo}
        title="회원번호 복사"
        type="button"
      >
        <span className="material-symbols-outlined text-[14px]">content_copy</span>
      </button>
    </div>
    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
      <span className="material-symbols-outlined text-[16px] text-[#006a61]">check_circle</span>
      <span>{profileData.phone}</span>
      <span className="text-[11px] text-[#006a61] font-bold">(인증완료)</span>
    </div>
  </div>
  {/* Line 2: 이메일 & 간편로그인 (실제 간편인증 SNS만 출력) */}
  <div className="flex flex-wrap items-center gap-2">
    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
      <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
      <span>{profileData.email}</span>
    </div>
    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80">
      <span className="text-slate-500 text-[10px] font-bold">간편로그인 :</span>
      {profileData.snsProvider === 'KAKAO' ? (
        <span className="px-2 py-0.5 rounded text-[10px] bg-[#fee500] text-[#3c1e1e] font-extrabold leading-tight">카카오</span>
      ) : (
        <span className="px-2 py-0.5 rounded text-[10px] bg-[#03c75a] text-white font-extrabold leading-tight">네이버</span>
      )}
    </div>
  </div>
</div>
```

### 4.3 Card 4 (시공사 사업자 인증 상태 카드 - Card 3 동일 크기)
```jsx
{/* Card 4: 시공사일 때 '사업자 인증 상태' (Card 3과 동일 크기), 일반 고객일 때 '보유 쿠폰/포인트' */}
{isContractor ? (
  <div className="bg-emerald-50/50 rounded-2xl p-6 shadow-sm border border-emerald-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#006a61]"></div>
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900">사업자 인증 상태: 인증완료</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-[#006a61]">
            인증일 2026-11-15
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#006a61] text-white flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-xs text-slate-600 mt-1">
        <div>
          사업자등록번호: <strong className="text-slate-800 font-bold">120-88-29401</strong> (공간다원)
        </div>
        <p className="text-[11px] text-slate-500 line-clamp-2 flex items-start gap-1 mt-1 leading-snug" title="전문분야: 특수 입주청소 · 상가 바닥 왁싱 코팅 · 피톤치드 살균 소독 방역">
          <span className="material-symbols-outlined text-[14px] text-[#006a61] shrink-0 mt-0.5">workspace_premium</span>
          <span>전문분야: 특수 입주청소 · 상가 바닥 왁싱 코팅 · 피톤치드 살균 소독 방역</span>
        </p>
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-emerald-100/90 flex items-center justify-between text-xs font-bold">
      <button
        type="button"
        onClick={() => onOpenBizModal ? onOpenBizModal() : showToast('사업자등록증 원본 모달을 호출합니다.')}
        className="text-[#006a61] hover:text-[#004f48] flex items-center gap-1 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[15px]">visibility</span>
        <span>사업자등록증 원본 조회</span>
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        onClick={() => showToast('인증 갱신 가이드 안내문이 발송되었습니다.')}
        className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px]"
      >
        인증 갱신 안내
      </button>
    </div>
  </div>
) : (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
    {/* 일반 고객 보유 쿠폰/포인트 */}
    ...
  </div>
)}
```

### 4.4 시공 파트너 현장 진행 현황 카드 및 화면 라우팅 연계 (`WEB-SRVC-JOB-020000`)
- **수주 일감 관리 바로가기 (Card 1)**: 시공사(`isContractor`)인 경우 클릭 시 `onNavigate('WEB-SRVC-JOB-020000')`을 호출하여 전용 현장 진행 현황 대시보드로 이동합니다.
- **Section 5 헤더 액션**:
  - `시공 파트너 현장 진행 현황` 타이틀 우측에 `[현장 진행 현황 바로가기 >]` 버튼을 배치하여, 클릭 시 `WEB-SRVC-JOB-020000` 화면으로 즉시 전환됩니다.
- **실시간 시공 사진 확인 버튼**:
  - 클릭 시 `WEB-SRVC-JOB-020000` 메인 화면으로 이동하며, 하위 종속 모달인 `WEB-SRVC-JOB-020100`(시공사진첨부) 및 `WEB-SRVC-JOB-020200`(시공완료등록)을 즉시 이용할 수 있습니다.
- **공통 GNB 네비게이션**:
  - 상단 GNB의 `[현장 진행 현황]` 메뉴 클릭 시 메인 홈 fallback 없이 `WEB-SRVC-JOB-020000` 대시보드 화면이 정확하게 렌더링됩니다.

---

## 5. 백엔드 API 연동 규격

### 5.1 회원 프로필 조회 (`GET /api/client/profile`)
- **헤더**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "success": true,
  "data": {
    "userNo": "S20261100001",
    "userName": "공간다원 대표 김충훈",
    "email": "gonggandawon_corp@naver.com",
    "phone": "010-8286-3457",
    "role": "S",
    "snsProvider": "NAVER",
    "bizInfo": {
      "bizNo": "120-88-29401",
      "bizName": "공간다원",
      "bizVerifiedDt": "2026-11-15",
      "specialties": ["특수 입주청소", "상가 바닥 왁싱 코팅", "피톤치드 살균 소독 방역"]
    },
    "stats": {
      "ongoingCount": 2,
      "completedCount": 14,
      "completedAmount": "4,280,000원",
      "rating": 4.9,
      "ratingTotal": 28,
      "perfectRatingCount": 27,
      "trustRate": "99.4%"
    }
  }
}
```

---

## 6. 데이터베이스 테이블 및 컬럼 매핑

```sql
-- 1. 사용자 기본 테이블 (USERS)
CREATE TABLE USERS (
    USER_ID         VARCHAR(32) PRIMARY KEY,     -- 사용자 고유식별자 (USR_2026...)
    USER_NO         VARCHAR(20) UNIQUE NOT NULL, -- 회원번호 (C2026... / S2026...)
    USER_NAME       VARCHAR(50) NOT NULL,        -- 이름 / 대표자명
    EMAIL           VARCHAR(100) UNIQUE NOT NULL,-- 이메일
    PHONE           VARCHAR(20) NOT NULL,        -- 휴대폰번호
    ROLE_CODE       VARCHAR(10) DEFAULT 'C',     -- 'C': 일반고객, 'S': 시공사, 'A': 관리자
    SNS_PROVIDER    VARCHAR(20),                 -- 'KAKAO', 'NAVER' 등 실제 인증 SNS
    PROFILE_IMG_URL VARCHAR(500),                -- 프로필 이미지 경로
    STATUS          VARCHAR(10) DEFAULT 'ACTIVE',-- 상태
    CREATED_AT      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 시공사 사업자 인증 프로필 테이블 (CONTRACTOR_PROFILE)
CREATE TABLE CONTRACTOR_PROFILE (
    CONTRACTOR_ID   VARCHAR(32) PRIMARY KEY,
    USER_ID         VARCHAR(32) NOT NULL,
    BIZ_NAME        VARCHAR(100) NOT NULL,       -- 상호명 (공간다원)
    BIZ_REG_NO      VARCHAR(20) NOT NULL,        -- 사업자등록번호 (120-88-29401)
    REP_NAME        VARCHAR(50) NOT NULL,        -- 대표자명 (김충훈)
    VERIFIED_DATE   DATE NOT NULL,               -- 인증일자 (2026-11-15)
    VERIFY_STATUS   VARCHAR(20) DEFAULT 'VERIFIED', -- 'VERIFIED', 'EXPIRED', 'PENDING'
    SPECIALTIES     VARCHAR(500),                -- 전문분야 텍스트
    FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)
);
```

---

## 7. 프로그램 유지보수 및 점검 가이드 (Checklist)
1. **타이틀 정돈 점검**: 상단에 `Contractor Partner Dashboard` 문구가 노출되지 않고 `내정보 관리` 타이틀만 깨끗하게 표시되는지 확인.
2. **단일 등급 배지 점검**: 로그인 세션이 시공사인 경우 `인증 시공사 (S) · 파트너` 배지만 표기되고, 일반 고객인 경우 `일반 고객 (C)` 배지만 노출되는지 확인 (중복 노출 방지).
3. **2단 메타데이터 점검**:
   - 1행: 회원번호(복사 기능) + 휴대전화번호
   - 2행: 이메일 + 간편로그인: 실제 연동된 SNS(`네이버` 또는 `카카오`)
4. **설명문구 점검**: "시공 파트너 계정 정보, 사업자등록증 정보..."로 수정되었는지 확인 ("및 세금계산서" 제거).
5. **사업자 인증 카드 위치 및 규격 점검**:
   - 상단 와이드 배너가 제거되었는지 확인.
   - Bento 그리드 Card 3("받은 고객 평점 및 신뢰도") 우측(Card 4)에 정확히 동일한 가로/세로 규격으로 배치되었는지 확인.
   - [사업자등록증 원본 조회] 클릭 시 사업자 모달(`WEB-CLNT-MYP-020100`) 정상 연동 확인.
