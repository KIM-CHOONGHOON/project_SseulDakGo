import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '5.104.87.214',
    port: 3306,
    user: 'ssuldak',
    password: 'Ch72337528',
    database: 'ssuldak_db'
  });

  console.log('=== DB 접속 성공 (ssuldak_db) ===');

  // 1. 기존 TB_USER 데이터 백업
  const [existingUsers] = await connection.query('SELECT * FROM TB_USER;');
  console.log(`[백업] 기존 TB_USER 레코드 ${existingUsers.length}건 백업 완료`);

  // 2. 외래키 체크 비활성화
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
  console.log('[설정] SET FOREIGN_KEY_CHECKS = 0;');

  // 3. DROP TABLES
  console.log('\n[DROP TABLE 실행]');
  await connection.query('DROP TABLE IF EXISTS TB_ORDER_DTL;');
  console.log('-> DROP TABLE IF EXISTS TB_ORDER_DTL 완료');
  await connection.query('DROP TABLE IF EXISTS TB_ORDER_MSTR;');
  console.log('-> DROP TABLE IF EXISTS TB_ORDER_MSTR 완료');
  await connection.query('DROP TABLE IF EXISTS TB_USER;');
  console.log('-> DROP TABLE IF EXISTS TB_USER 완료');

  // 4. CREATE TB_USER
  console.log('\n[CREATE TABLE 실행: 1. TB_USER]');
  await connection.query(`
    CREATE TABLE TB_USER (
        USER_NO             CHAR(12)        NOT NULL    COMMENT '사용자 번호 (C/S/A + YYYYMM + 5자리)',
        USER_ROLE_CD        CHAR(1)         NOT NULL    COMMENT '회원 구분: C(고객), S(용역), A(관리)',
        USER_EMAIL          VARCHAR(100)    NOT NULL    COMMENT '로그인 이메일 주소',
        USER_PWD_HASH       VARCHAR(255)    NULL        COMMENT '비밀번호 해시',
        PWD_SALT            VARCHAR(64)     NULL        COMMENT '암호화 솔트',
        USER_NM             VARCHAR(50)     NOT NULL    COMMENT '실명 또는 담당자명',
        USER_TEL            VARCHAR(20)     NOT NULL    COMMENT '휴대폰 번호 (010-0000-0000)',
        SIGN_IMG_URL        VARCHAR(500)    NULL        COMMENT '전자거래 서명패드 자필 전자서명 이미지 웹 URL',
        SOCIAL_PROVIDER     VARCHAR(20)     NULL        COMMENT 'KAKAO, NAVER, GOOGLE, APPLE',
        SOCIAL_UID          VARCHAR(100)    NULL        COMMENT '소셜 고유 식별값',
        COMPANY_NM          VARCHAR(100)    NULL        COMMENT '상호/업체명 (용역 및 법인고객)',
        BIZ_NO              VARCHAR(20)     NULL        COMMENT '사업자등록번호 10자리 (용역회원 필수)',
        USER_STAT_CD        VARCHAR(20)     NOT NULL DEFAULT 'NORMAL' COMMENT 'NORMAL, SUSPENDED_8D, PERMANENT_BLOCKED, WITHDRAWN',
        SUSPEND_EXPIRE_DT   DATETIME        NULL        COMMENT '선취소 8일 거래제한 만료 일시',
        CANCEL_ACCUMULATED_CNT INT          NOT NULL DEFAULT 0 COMMENT '발주/청약 취소 누적 횟수 (10회 도달 시 영구 정지)',
        ACTIVE_STATUS_YN    CHAR(1)         NOT NULL DEFAULT 'Y' COMMENT '영업 On/Off 상태 (용역 전용)',
        ALLIANCE_CD         VARCHAR(30)     NULL        COMMENT '유입 제휴사 코드 (제휴 가입자 트래킹)',
        LAST_LOGIN_DT       DATETIME        NULL,
        REG_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        REG_ID              VARCHAR(50)     NOT NULL DEFAULT 'SYSTEM',
        MOD_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        MOD_ID              VARCHAR(50)     NOT NULL DEFAULT 'SYSTEM',
        CONSTRAINT PK_TB_USER PRIMARY KEY (USER_NO),
        CONSTRAINT UQ_ROLE_EMAIL UNIQUE (USER_ROLE_CD, USER_EMAIL),
        INDEX IDX_VERIFY_DUP (USER_TEL, USER_EMAIL, SOCIAL_PROVIDER, SOCIAL_UID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='통합 사용자 마스터 테이블';
  `);
  console.log('-> CREATE TABLE TB_USER 완료');

  // 백업된 회원 데이터 복원
  if (existingUsers.length > 0) {
    for (const u of existingUsers) {
      await connection.query(`
        INSERT INTO TB_USER (
          USER_NO, USER_ROLE_CD, USER_EMAIL, USER_PWD_HASH, PWD_SALT,
          USER_NM, USER_TEL, SIGN_IMG_URL, SOCIAL_PROVIDER, SOCIAL_UID,
          COMPANY_NM, BIZ_NO, USER_STAT_CD, SUSPEND_EXPIRE_DT, CANCEL_ACCUMULATED_CNT,
          ACTIVE_STATUS_YN, ALLIANCE_CD, LAST_LOGIN_DT, REG_DT, REG_ID, MOD_DT, MOD_ID
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        u.USER_NO, u.USER_ROLE_CD, u.USER_EMAIL, u.USER_PWD_HASH, u.PWD_SALT,
        u.USER_NM, u.USER_TEL, u.SIGN_IMG_URL, u.SOCIAL_PROVIDER, u.SOCIAL_UID,
        u.COMPANY_NM, u.BIZ_NO, u.USER_STAT_CD, u.SUSPEND_EXPIRE_DT, u.CANCEL_ACCUMULATED_CNT || 0,
        u.ACTIVE_STATUS_YN, u.ALLIANCE_CD, u.LAST_LOGIN_DT, u.REG_DT, u.REG_ID, u.MOD_DT, u.MOD_ID
      ]);
    }
    console.log(`-> 기존 사용자 ${existingUsers.length}건 데이터 복원 완료`);
  }

  // 5. CREATE TB_ORDER_MSTR
  console.log('\n[CREATE TABLE 실행: 2. TB_ORDER_MSTR]');
  await connection.query(`
    CREATE TABLE TB_ORDER_MSTR (
        ORDER_NO            CHAR(16)        NOT NULL    COMMENT '주발주 관리번호 (ORD+YYYYMMDD+5자리)',
        CLIENT_USER_NO      CHAR(12)        NOT NULL    COMMENT '발주 고객 회원번호 (C로 시작, FK)',
        ORDER_STATUS        VARCHAR(20)     NOT NULL DEFAULT 'BID_OPEN' COMMENT 'ORD_REG, BID_OPEN, CNTR_WAIT_FEE, CNTR_CONFIRMED, SVC_PROGRESS, SVC_COMPLETED, SETTL_COMPLETED, BID_EXPIRED, ORD_CANCEL',
        PROPOSED_PRICE      INT             NOT NULL    COMMENT '고객 확정 지정 청소 대금 (역경매 불가 고정금액)',
        CHANGE_CONTRACTOR_CNT INT           NOT NULL DEFAULT 0 COMMENT '고객의 시공사 변경 누적 횟수 (최대 3회)',
        COMPANY_OR_ORG_NM   VARCHAR(100)    NULL        COMMENT '의뢰 업체·기관명',
        CONTACT_PERSON_NM   VARCHAR(50)     NOT NULL    COMMENT '현장 담당자명',
        CONTACT_TEL         VARCHAR(20)     NOT NULL    COMMENT '현장 담당자 연락처',
        CONTACT_EMAIL       VARCHAR(100)    NULL        COMMENT '담당자 이메일',
        FACILITY_TYPE_CD    VARCHAR(30)     NOT NULL DEFAULT 'OFFICE' COMMENT '시설 유형 (사무실, 상가, 학교 등)',
        PARKING_AVAIL_CD    VARCHAR(20)     NOT NULL DEFAULT 'YES' COMMENT '주차 여부 (YES, NO, UNKNOWN)',
        SIDO_CD             VARCHAR(20)     NOT NULL    COMMENT '시/도 코드',
        SIGUNGU_CD          VARCHAR(20)     NOT NULL    COMMENT '시/군/구 코드',
        ADDR_TEXT           VARCHAR(200)    NOT NULL    COMMENT '기본 현장 주소 (동/리 노출용)',
        ADDR_DETAIL         VARCHAR(200)    NULL        COMMENT '상세 주소 (체결 후 용역에 공개)',
        DETAIL_REQ_NOTE     TEXT            NULL        COMMENT '상세 요청사항',
        ALLIANCE_CD         VARCHAR(30)     NULL        COMMENT '유입 제휴사 코드 (제휴 발주 트래킹)',
        BID_EXPIRE_DT       DATETIME        NOT NULL    COMMENT '청약 만료 일시 (발주일 + 7일)',
        CONFIRMED_DT        DATETIME        NULL        COMMENT '계약 확정 일시',
        COMPLETED_DT        DATETIME        NULL        COMMENT '청소 완료 일시',
        REG_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MOD_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT PK_TB_ORDER_MSTR PRIMARY KEY (ORDER_NO),
        CONSTRAINT FK_ORD_CLIENT FOREIGN KEY (CLIENT_USER_NO) REFERENCES TB_USER (USER_NO),
        INDEX IDX_ORD_STATUS_EXPIRE (ORDER_STATUS, BID_EXPIRE_DT)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='주발주 마스터 테이블';
  `);
  console.log('-> CREATE TABLE TB_ORDER_MSTR 완료');

  // 6. CREATE TB_ORDER_DTL
  console.log('\n[CREATE TABLE 실행: 3. TB_ORDER_DTL]');
  await connection.query(`
    CREATE TABLE TB_ORDER_DTL (
        ORDER_DTL_NO            CHAR(18)        NOT NULL    COMMENT '발주 상세번호 (ORDER_NO 16자리 + 순번 2자리)',
        ORDER_NO                CHAR(16)        NOT NULL    COMMENT '주발주 관리번호 (TB_ORDER_MSTR FK)',
        CLEAN_LARGE_CD          VARCHAR(30)     NOT NULL    COMMENT '대분류 (REGULAR: 정기청소, MOVEIN: 입주이사, APPLIANCE: 계절가전 택1)',
        CLEAN_MID_CD            VARCHAR(30)     NOT NULL    COMMENT '중분류 대표 코드',
        SERVICE_STATUS          VARCHAR(20)     NOT NULL DEFAULT 'WAIT_BID' COMMENT '시공상태 (WAIT_BID, APPR_WAIT_FEE, APPR_CONTRACT, SVC_PROGRESS, SVC_COMPLETED, BID_CANCEL)',
        HOPE_CLEAN_DATE         DATE            NOT NULL    COMMENT '고객 확정 요청 청소 일자',
        HOPE_CLEAN_TIME         CHAR(5)         NOT NULL    COMMENT '고객 확정 요청 청소 시작 시각 (HH:mm, 예: 14:00)',
        ESTIMATED_DURATION_HOURS INT            NOT NULL DEFAULT 4 COMMENT '예상 소요 시간 (시간 단위)',
        CONTRACT_TYPE_CD        VARCHAR(20)     NOT NULL DEFAULT '1회성 단독 시공' COMMENT '계약 형태',
        SELECTED_SRV_ITEMS      VARCHAR(500)    NULL        COMMENT '선택된 필요 서비스 코드 목록 (콤마 구분)',
        CONTRACT_TERM_DAYS      INT             NULL DEFAULT 90 COMMENT '정기청소 90일 락 일수',
        WEEK_CLEAN_FREQ         INT             NULL DEFAULT 1  COMMENT '주간 방문 횟수 (1, 2, 3, 5회)',
        CLEAN_DAYS_CONFIG       VARCHAR(50)     NULL        COMMENT '방문 희망 요일 (예: MON,WED,FRI)',
        SUPPLY_PYEONG           DECIMAL(5,1)    NULL        COMMENT '입주/이사청소 실평수/공급평수',
        APPLIANCE_TOTAL_CNT     INT             NOT NULL DEFAULT 0 COMMENT '계절가전 총 의뢰 기기 대수 합계',
        AIRCON_TOTAL_CNT        INT             NOT NULL DEFAULT 0 COMMENT '에어컨 전체 총 대수 합계',
        WASHER_TOTAL_CNT        INT             NOT NULL DEFAULT 0 COMMENT '세탁기 전체 총 대수 합계',
        KITCHEN_TOTAL_CNT       INT             NOT NULL DEFAULT 0 COMMENT '주방 및 생활가전 전체 총 개수 합계',
        WORK_TIME_SLOT          VARCHAR(50)     NULL        COMMENT '희망 작업 시간대 안내문구',
        SELECTED_SERVICE_USER_NO CHAR(12)       NULL        COMMENT '최종 확정 배정된 시공사 회원번호 (S로 시작)',
        REG_DT                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        REG_ID                  VARCHAR(50)     NOT NULL DEFAULT 'CLIENT',
        MOD_DT                  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        MOD_ID                  VARCHAR(50)     NOT NULL DEFAULT 'CLIENT',
        CONSTRAINT PK_TB_ORDER_DTL PRIMARY KEY (ORDER_DTL_NO),
        CONSTRAINT FK_DTL_ORD FOREIGN KEY (ORDER_NO) REFERENCES TB_ORDER_MSTR (ORDER_NO) ON DELETE CASCADE,
        INDEX IDX_DTL_LARGE_STATUS (CLEAN_LARGE_CD, SERVICE_STATUS)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='발주 서비스 상세 및 계절가전 마스터 원장';
  `);
  console.log('-> CREATE TABLE TB_ORDER_DTL 완료');

  // 7. 외래키 체크 재활성화
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('\n[설정] SET FOREIGN_KEY_CHECKS = 1;');

  // 8. 구조 및 카운트 검증
  for (const tbl of ['TB_USER', 'TB_ORDER_MSTR', 'TB_ORDER_DTL']) {
    const [[{ cnt }]] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tbl};`);
    const [cols] = await connection.query(`DESCRIBE ${tbl};`);
    console.log(`\n=== 검증: ${tbl} (${cnt}개 행, ${cols.length}개 컬럼) ===`);
    cols.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
  }

  await connection.end();
  console.log('\n=== TB_USER, TB_ORDER_MSTR, TB_ORDER_DTL Drop & Create 재성공 완료! ===');
}

main().catch(err => {
  console.error('Error during Drop & Create:', err);
  process.exit(1);
});
