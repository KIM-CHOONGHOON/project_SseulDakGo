# ADMN-SYS-03 : 공지사항 / FAQ 관리 및 리치 에디터 모달

본 문서는 **SsulDak (쓸고닦고)** 플랫폼 관리자 웹(Web)의 **공지사항 및 FAQ 콘텐츠 관리 화면 (`ADMN-SYS-03`)** 및 **WYSIWYG 리치 텍스트 에디터 모달**의 기능, 데이터베이스 연동 명세, 아키텍처 규칙, 프론트엔드/백엔드 구현 및 검증 결과를 기술합니다.

---

## 1. 화면 및 아키텍처 개요

### 1.1 기본 정보
- **화면 식별자**: `ADMN-SYS-03`
- **화면 국문 명칭**: 공지사항 / FAQ 콘텐츠 관리 (홈 팝업 배너 및 연계 쿠폰 설정)
- **지원 채널**: 관리자 웹 (`Web [Y]` / `App [N]`)
- **프론트엔드 엔트리**:
  - `SsulDak_Web/Admin/frontend/ADMN-SYS-03/index.tsx` (메인 컴포넌트)
  - `SsulDak_Web/Admin/frontend/ADMN-SYS-03/index.jsx` (Re-export 엔트리)
- **백엔드 독립 라우터**: `SsulDak_Web/Admin/backend/api_ADMN_SYS_03/route.ts`
- **독립 엔드포인트 URL**: `POST /api/admin/admn_sys_03`
- **데이터베이스**: `ssuldak_db` (MySQL 8.0 / InnoDB / utf8mb4_0900_ai_ci)
- **호출 부모 화면**: `ADMN-DSH-00` (어드민 메인 대시보드)
- **연계 소비자 화면**: `USER-COM-00` (홈 팝업 배너 모달), `USER-MYP-03` (고객센터 공지/FAQ 목록)

### 1.2 핵심 아키텍처 규칙 준수 (`.cursorrules`)
1. **물리적 격리 (Strict Role Isolation)**:
   - `SsulDak_Web/Admin` 디렉터리 내에서 프론트엔드와 백엔드를 완결.
   - 사용자(`User`) 및 파트너(`Partner`) 도메인의 파일/라우터와 코드를 절대 공유하지 않음.
2. **1:1 매핑 및 공통화 절대 배제 (Strict Non-Sharing Rule)**:
   - 화면 ID `ADMN-SYS-03`과 백엔드 `api_ADMN_SYS_03` 1:1 매핑.
   - 타 화면과 API/쿼리를 공유하지 않고 오직 이 화면 전용 SQL 식별자(`ADMN-SYS-03-SQL-001` ~ `007`) 사용.
3. **공식 브랜드 로고 준수**:
   - 공식 로고 심볼(`쓸고딱고 로고.png` / `/logo.png`)을 사이드바에 일관 적용.
4. **비즈니스 엔진 및 팝업/쿠폰 정책 연동**:
   - **분류 구분**: `CATEGORY_CD` (`EVENT`, `POLICY`, `SERVICE`, `FAQ`).
   - **홈 팝업 배너 즉시 토글**: `IS_POPUP_YN` (`Y`/`N`). 활성화 시 모바일/웹 메인 레이어 팝업으로 노출.
   - **Optimistic UI Update**: 홈 팝업 On/Off 스위치 클릭 시 즉시 UI를 변경하고 백엔드 비동기 통신.
   - **쿠폰 다운로드 연동**: 이벤트 공지 등록 시 `ATTACH_COUPON_NO`를 지정하면 본문에 `[쿠폰 즉시 발급받기]` 액션 카드가 생성되어 고객이 원클릭 수령 가능.
   - **논리 삭제 (Soft Delete)**: 영구 보존용 `DEL_YN = 'Y'` 플래그 처리.
   - **감사 추적 컬럼**: 생성 시 `REG_DT`, `REG_ID`, 갱신 시 `MOD_DT = NOW()`, `MOD_ID = adminId` 자동 기록.

---

## 2. 데이터베이스 스키마 및 전용 SQL 명세

### 2.1 테이블 정의

#### 1) `TB_SYS_NOTICE` (공지사항 및 FAQ 원장)
```sql
CREATE TABLE IF NOT EXISTS TB_SYS_NOTICE (
  ARTICLE_SEQ       BIGINT        NOT NULL AUTO_INCREMENT COMMENT '게시글 순번',
  CATEGORY_CD       VARCHAR(20)   NOT NULL COMMENT '분류 (EVENT, POLICY, SERVICE, FAQ)',
  TITLE             VARCHAR(200)  NOT NULL COMMENT '제목',
  CONTENT_HTML      LONGTEXT      NOT NULL COMMENT '리치 텍스트 본문 HTML',
  VIEW_CNT          INT           NOT NULL DEFAULT 0 COMMENT '조회수',
  IS_POPUP_YN       CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '홈 팝업 배너 노출 여부 (Y/N)',
  POPUP_START_DT    DATETIME      NULL COMMENT '팝업 시작일시',
  POPUP_END_DT      DATETIME      NULL COMMENT '팝업 종료일시',
  ATTACH_COUPON_NO  VARCHAR(30)   NULL COMMENT '연계 프로모션 쿠폰 ID',
  DEL_YN            CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N)',
  REG_DT            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  REG_ID            VARCHAR(50)   NOT NULL DEFAULT 'admin01' COMMENT '등록자 ID',
  MOD_DT            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  MOD_ID            VARCHAR(50)   NOT NULL DEFAULT 'admin01' COMMENT '수정자 ID',
  PRIMARY KEY (ARTICLE_SEQ),
  INDEX IDX_NOTICE_CATEGORY (CATEGORY_CD, DEL_YN),
  INDEX IDX_NOTICE_POPUP (IS_POPUP_YN, DEL_YN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='공지사항 및 FAQ 콘텐츠 원장';
```

#### 2) `TB_PROMO_CAMPAIGN` (프로모션 마스터 - 연동 쿠폰)
```sql
CREATE TABLE IF NOT EXISTS TB_PROMO_CAMPAIGN (
  CAMPAIGN_NO     VARCHAR(30)   NOT NULL COMMENT '캠페인 번호',
  CAMPAIGN_NM     VARCHAR(100)  NOT NULL COMMENT '캠페인 명칭',
  TARGET_ROLE_CD  VARCHAR(20)   NOT NULL DEFAULT 'USER' COMMENT '대상 역할 (USER, ALL)',
  DISCOUNT_AMT    DECIMAL(10,2) NOT NULL DEFAULT 5000.00 COMMENT '할인 금액',
  VALID_DAYS      INT           NOT NULL DEFAULT 30 COMMENT '유효 일수',
  IS_ACTIVE_YN    CHAR(1)       NOT NULL DEFAULT 'Y' COMMENT '활성화 여부 (Y/N)',
  START_DT        DATETIME      NOT NULL COMMENT '시작 일시',
  END_DT          DATETIME      NOT NULL COMMENT '종료 일시',
  REG_DT          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (CAMPAIGN_NO)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='프로모션 캠페인 원장';
```

---

### 2.2 전용 SQL 쿼리 ID 및 쿼리문

- **`ADMN-SYS-03-SQL-001` (게시글 목록 페이징 및 필터 검색)**
  ```sql
  SELECT 
    ARTICLE_SEQ AS articleSeq,
    CATEGORY_CD AS categoryCd,
    TITLE AS title,
    VIEW_CNT AS viewCnt,
    IS_POPUP_YN AS isPopupYn,
    ATTACH_COUPON_NO AS attachCouponNo,
    DATE_FORMAT(REG_DT, '%Y.%m.%d') AS formattedRegDate,
    DATE_FORMAT(REG_DT, '%Y.%m.%d %H:%i') AS fullRegDate,
    POPUP_START_DT AS popupStartDt,
    POPUP_END_DT AS popupEndDt,
    REG_DT AS regDt
  FROM TB_SYS_NOTICE
  WHERE DEL_YN = 'N'
    AND (? = 'ALL' OR CATEGORY_CD = ?)
    AND (? = '' OR TITLE LIKE CONCAT('%', ?, '%'))
  ORDER BY ARTICLE_SEQ DESC
  LIMIT ? OFFSET ?;
  ```

- **`ADMN-SYS-03-SQL-002` (전체 게시글 수 카운트)**
  ```sql
  SELECT COUNT(*) AS totalCnt
  FROM TB_SYS_NOTICE
  WHERE DEL_YN = 'N'
    AND (? = 'ALL' OR CATEGORY_CD = ?)
    AND (? = '' OR TITLE LIKE CONCAT('%', ?, '%'));
  ```

- **`ADMN-SYS-03-SQL-003` (홈 팝업 배너 On/Off 즉시 토글)**
  ```sql
  UPDATE TB_SYS_NOTICE
  SET 
    IS_POPUP_YN = ?,
    MOD_DT = NOW(),
    MOD_ID = ?
  WHERE ARTICLE_SEQ = ? AND DEL_YN = 'N';
  ```

- **`ADMN-SYS-03-SQL-004` (게시글 상세 조회: TB_SYS_NOTICE + TB_PROMO_CAMPAIGN)**
  ```sql
  SELECT 
    n.ARTICLE_SEQ AS articleSeq,
    n.CATEGORY_CD AS categoryCd,
    n.TITLE AS title,
    n.CONTENT_HTML AS contentHtml,
    n.VIEW_CNT AS viewCnt,
    n.IS_POPUP_YN AS isPopupYn,
    DATE_FORMAT(n.POPUP_START_DT, '%Y-%m-%d %H:%i:%s') AS popupStartDt,
    DATE_FORMAT(n.POPUP_END_DT, '%Y-%m-%d %H:%i:%s') AS popupEndDt,
    n.ATTACH_COUPON_NO AS attachCouponNo,
    DATE_FORMAT(n.REG_DT, '%Y.%m.%d %H:%i:%s') AS regDtFormatted,
    n.REG_ID AS regId,
    DATE_FORMAT(n.MOD_DT, '%Y.%m.%d %H:%i:%s') AS modDtFormatted,
    n.MOD_ID AS modId,
    c.CAMPAIGN_NM AS attachCouponNm
  FROM TB_SYS_NOTICE n
  LEFT JOIN TB_PROMO_CAMPAIGN c ON n.ATTACH_COUPON_NO = c.CAMPAIGN_NO
  WHERE n.ARTICLE_SEQ = ? AND n.DEL_YN = 'N';
  ```

- **`ADMN-SYS-03-SQL-005` (신규 공지글 등록 INSERT)**
  ```sql
  INSERT INTO TB_SYS_NOTICE (
    CATEGORY_CD, TITLE, CONTENT_HTML, VIEW_CNT, IS_POPUP_YN,
    POPUP_START_DT, POPUP_END_DT, ATTACH_COUPON_NO, DEL_YN,
    REG_DT, REG_ID, MOD_DT, MOD_ID
  ) VALUES (
    ?, ?, ?, 0, ?,
    ?, ?, ?, 'N',
    NOW(), ?, NOW(), ?
  );
  ```

- **`ADMN-SYS-03-SQL-006` (기존 공지글 수정 UPDATE)**
  ```sql
  UPDATE TB_SYS_NOTICE
  SET 
    CATEGORY_CD = ?,
    TITLE = ?,
    CONTENT_HTML = ?,
    IS_POPUP_YN = ?,
    POPUP_START_DT = ?,
    POPUP_END_DT = ?,
    ATTACH_COUPON_NO = ?,
    MOD_DT = NOW(),
    MOD_ID = ?
  WHERE ARTICLE_SEQ = ? AND DEL_YN = 'N';
  ```

- **`ADMN-SYS-03-SQL-007` (게시글 논리 삭제 UPDATE)**
  ```sql
  UPDATE TB_SYS_NOTICE
  SET 
    DEL_YN = 'Y',
    MOD_DT = NOW(),
    MOD_ID = ?
  WHERE ARTICLE_SEQ = ?;
  ```

---

## 3. 백엔드 처리 모드 명세 (`POST /api/admin/admn_sys_03`)

| 요청 모드 (`mode`) | 주요 전달 파라미터 | 반환 내용 및 비즈니스 처리 |
| :--- | :--- | :--- |
| `GET_ARTICLE_LIST` | `category`, `searchKeyword`, `page`, `limit` | 게시글 페이징 목록(`articles`), 전체 건수(`totalCnt`), 4대 KPI 집계 통계 반환 |
| `TOGGLE_POPUP_STATUS` | `articleSeq`, `isPopupYn` ('Y'/'N') | `IS_POPUP_YN` 및 감사일시 갱신, Optimistic UI 상태 성공 응답 |
| `GET_ARTICLE_DETAIL` | `articleSeq` | 공지글 원문 HTML 및 연계 프로모션 쿠폰명 상세 반환 (에디터 로딩용) |
| `SAVE_ARTICLE` | `articleSeq`(신규: null), `categoryCd`, `title`, `contentHtml`, `isPopupYn`, `attachCouponNo` | 제목 필수 검증 후 신규 INSERT(SQL-005) 또는 수정 UPDATE(SQL-006) |
| `DELETE_ARTICLE` | `articleSeq` | 논리 삭제 `DEL_YN='Y'` 및 수정 감사 컬럼 기록 |
| `GET_COUPON_LIST` | - | 에디터 쿠폰 연동 드롭다운용 활성 캠페인 목록(`TB_PROMO_CAMPAIGN`) 반환 |

---

## 4. 프론트엔드 UI/UX 구성

### 4.1 메인 콘텐츠 관리 대시보드
- **상단 브레드크럼 & 접속자 정보**: 관리자 로그인 식별자(`admin01`) 및 실시간 세션 표시.
- **헤더 & 액션 버튼**: "공지사항 및 FAQ 콘텐츠 관리" 및 `[+ 공지글 등록]`(Dark Navy `#0F172A`) 버튼.
- **4대 KPI 요약 카드**:
  1. 전체 게시글 수 (건)
  2. 홈 레이어 팝업 노출 중 (건 ON)
  3. 프로모션 이벤트 공지 (건)
  4. 누적 콘텐츠 조회수 (회)
- **카테고리 필터 탭**: `[전체]`, `[이벤트]`, `[정책]`, `[서비스]`, `[FAQ]`
- **실시간 제목 검색 바**: 키워드 입력 및 엔터키 즉시 검색, 초기화(X) 버튼.
- **데이터 테이블**:
  - `[No]`: 게시글 번호
  - `[분류]`: 색상 구분 뱃지 (이벤트: Pink/Rose, 정책: Blue, 서비스: Indigo, FAQ: Emerald)
  - `[제목]`: 쿠폰 연동 아이콘 뱃지 및 클릭 시 에디터 모달 열기
  - `[작성일]`: `YYYY.MM.DD`
  - `[조회수]`: 천 단위 콤마 포맷
  - `[팝업 배너 설정]`: `[홈 팝업 ON]`(Emerald) / `[OFF]`(Slate Gray) 원클릭 즉시 토글
  - `[관리]`: `[수정]`, `[삭제]`(확인 다이얼로그 후 논리 삭제)
- **페이징 컨트롤**: 이전 / 1, 2, 3 / 다음

---

### 4.2 WYSIWYG 리치 텍스트 에디터 모달 (HTML 원본 100% React 변환)
- **모달 헤더**:
  - `edit_note` 심볼 뱃지, "공지글 등록 및 편집" 타이틀, `WYSIWYG Editor` 뱃지.
  - 문서 번호: `NOTC-202610-XXX`, 버전: `Rev 1.2 (최종 수정: admin01)`.
  - 전체화면 토글 및 닫기 버튼.
- **메타 필드 그리드**:
  1. **공지 분류**: 이벤트, 약관/정책 개정, 서비스 이용안내, FAQ 드롭다운.
  2. **노출 대상자**: 일반 사용자 + 파트너(전체), 일반 고객 전용, 마스터 파트너 전용.
  3. **게시 스케줄링**: 예약 일시 입력 인풋 및 `[V] 즉시 게시` 체크박스.
  4. **디스플레이 옵션**:
     - `앱/웹 메인 레이어 팝업 노출` 슬라이드 스위치 토글 (활성화 시 에메랄드 뱃지 및 유효기간 안내).
     - `상단 중요 공지 고정 (Pin to Top)` 체크박스.
- **게시물 제목 필드**:
  - 실시간 글자수 카운터 (`{length} / 100자`).
- **WYSIWYG 서식 툴바**:
  - 스타일: Bold (B), Italic (I), Underline (U), Strikethrough (S)
  - 헤딩: 본문, 제목 1, 제목 2, 제목 3 드롭다운
  - 목록/정렬: 글머리 기호, 번호 매기기, 인용구, 좌측 정렬, 중앙 정렬
  - 인터랙티브 모듈:
    - `이미지 첨부`: 외부 URL 이미지 삽입
    - `쿠폰 다운로드 연동`: 드롭다운에서 프로모션 쿠폰(`CP-SEASON-10` 등) 선택 시 본문에 쿠폰 다운로드 카드 블록 자동 삽입
    - `동영상`: 미디어 링크 삽입
    - `표 삽입`: 그리드 테이블 삽입
- **에디터 본문 캔버스 (`contentEditable`)**:
  - 기본 고객 인사말 및 프로모션 안내문 렌더링.
  - 연계 쿠폰 다운로드 카드 (초록색 선물 아이콘, 쿠폰명, 할인 코드, `[쿠폰 즉시 발급받기]` 버튼, 안내 문구).
  - 프로모션 유의사항 체크리스트 블록.
- **모달 하단 액션 바**:
  - 자동 동기화 인디케이터 (회전 아이콘, 시간 표기, 글자수 카운트).
  - `[임시 저장 (Draft)]`: 세션 임시 저장 토스트.
  - `[미리보기]`: 실제 사용자 화면 레이어 팝업 시뮬레이션 모달 오픈.
  - `[공지글 등록 및 즉시 배포]`: 백엔드 `SAVE_ARTICLE` 호출 후 목록 새로고침.

---

## 5. 검증 및 테스트 결과

| 검증 항목 | 검증 방법 | 결과 | 비고 |
| :--- | :--- | :---: | :--- |
| **백엔드 목록 조회 (`GET_ARTICLE_LIST`)** | `POST /api/admin/admn_sys_03` 호출 | **성공 (HTTP 200)** | 게시글 4건 및 4대 KPI 통계 정상 반환 |
| **홈 팝업 On/Off 토글 (`TOGGLE_POPUP_STATUS`)** | `POST /api/admin/admn_sys_03` (Seq 2, 'Y') | **성공 (HTTP 200)** | 즉시 DB UPDATE 및 Optimistic UI 반영 확인 |
| **게시글 상세 조회 (`GET_ARTICLE_DETAIL`)** | `POST /api/admin/admn_sys_03` (Seq 1) | **성공 (HTTP 200)** | 본문 HTML 및 연계 쿠폰명 조인 정상 조회 |
| **esbuild 번들링 빌드** | `npx esbuild preview/main.tsx` 번들링 | **성공 (71ms, 0 errors)** | 번들 4.3MB 정상 생성 |
| **브라우저 실제 구동 검증** | Chrome 브라우저 `#admn-sys-03` 진입 | **성공** | 테이블, KPI 카드, 사이드바 레이아웃 완벽 렌더링 |
| **에디터 모달 열기 및 서식 검증** | `[+ 공지글 등록]` 버튼 클릭 | **성공** | 헤더, 메타 필드, 제목, 서식 툴바, 쿠폰 블록 완벽 렌더링 |
| **고객 팝업 미리보기 테스트** | `[미리보기]` 버튼 클릭 | **성공** | 실제 모바일/웹 메인 팝업 레이아웃 및 닫기 정상 작동 |
