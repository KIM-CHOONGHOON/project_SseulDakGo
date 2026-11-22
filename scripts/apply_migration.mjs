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

  // 1. 공통 테이블 보존 확인 (절대 변경/삭제 금지)
  console.log('\n[안전 점검] 공통 테이블 데이터 및 스키마 보존 확인...');
  const commonTables = ['TB_COM_CODE_GRP', 'TB_COM_CODE', 'TB_SYS_POLICY_CONFIG', 'TB_TERMS_MASTER'];
  for (const tbl of commonTables) {
    const [[{ cnt }]] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tbl};`);
    console.log(`- 공통 테이블 ${tbl}: ${cnt}개 레코드 보존 유지`);
  }

  // 2. TB_USER 컬럼 추가 (CANCEL_ACCUMULATED_CNT)
  console.log('\n[테이블 수정] 1. TB_USER 컬럼 확인 및 추가...');
  const [userCols] = await connection.query('DESCRIBE TB_USER;');
  const userColNames = userCols.map(c => c.Field);
  if (!userColNames.includes('CANCEL_ACCUMULATED_CNT')) {
    await connection.query(`
      ALTER TABLE TB_USER 
      ADD COLUMN CANCEL_ACCUMULATED_CNT INT NOT NULL DEFAULT 0 COMMENT '발주/청약 취소 누적 횟수 (10회 도달 시 영구 정지)' AFTER SUSPEND_EXPIRE_DT;
    `);
    console.log('-> TB_USER.CANCEL_ACCUMULATED_CNT 컬럼 추가 완료');
  } else {
    console.log('-> TB_USER.CANCEL_ACCUMULATED_CNT 이미 존재함');
  }

  // 3. TB_ORDER_MSTR 컬럼 추가 (CHANGE_CONTRACTOR_CNT)
  console.log('\n[테이블 수정] 2. TB_ORDER_MSTR 컬럼 확인 및 추가...');
  const [mstrCols] = await connection.query('DESCRIBE TB_ORDER_MSTR;');
  const mstrColNames = mstrCols.map(c => c.Field);
  if (!mstrColNames.includes('CHANGE_CONTRACTOR_CNT')) {
    await connection.query(`
      ALTER TABLE TB_ORDER_MSTR 
      ADD COLUMN CHANGE_CONTRACTOR_CNT INT NOT NULL DEFAULT 0 COMMENT '고객의 시공사 변경 누적 횟수 (최대 3회)' AFTER PROPOSED_PRICE;
    `);
    console.log('-> TB_ORDER_MSTR.CHANGE_CONTRACTOR_CNT 컬럼 추가 완료');
  } else {
    console.log('-> TB_ORDER_MSTR.CHANGE_CONTRACTOR_CNT 이미 존재함');
  }

  // 4. TB_ORDER_DTL 컬럼 추가 (HOPE_CLEAN_DATE, HOPE_CLEAN_TIME, ESTIMATED_DURATION_HOURS)
  console.log('\n[테이블 수정] 3. TB_ORDER_DTL 컬럼 확인 및 추가...');
  const [dtlCols] = await connection.query('DESCRIBE TB_ORDER_DTL;');
  const dtlColNames = dtlCols.map(c => c.Field);

  if (!dtlColNames.includes('HOPE_CLEAN_DATE')) {
    await connection.query(`
      ALTER TABLE TB_ORDER_DTL 
      ADD COLUMN HOPE_CLEAN_DATE DATE NOT NULL COMMENT '고객 확정 요청 청소 일자' AFTER SERVICE_STATUS;
    `);
    console.log('-> TB_ORDER_DTL.HOPE_CLEAN_DATE 컬럼 추가 완료');
  }

  if (!dtlColNames.includes('HOPE_CLEAN_TIME')) {
    await connection.query(`
      ALTER TABLE TB_ORDER_DTL 
      ADD COLUMN HOPE_CLEAN_TIME CHAR(5) NOT NULL COMMENT '고객 확정 요청 청소 시작 시각 (HH:mm, 예: 14:00)' AFTER HOPE_CLEAN_DATE;
    `);
    console.log('-> TB_ORDER_DTL.HOPE_CLEAN_TIME 컬럼 추가 완료');
  }

  if (!dtlColNames.includes('ESTIMATED_DURATION_HOURS')) {
    await connection.query(`
      ALTER TABLE TB_ORDER_DTL 
      ADD COLUMN ESTIMATED_DURATION_HOURS INT NOT NULL DEFAULT 4 COMMENT '예상 소요 시간 (시간 단위)' AFTER HOPE_CLEAN_TIME;
    `);
    console.log('-> TB_ORDER_DTL.ESTIMATED_DURATION_HOURS 컬럼 추가 완료');
  }

  // 5. 신규 테이블 생성 (TB_USER_SANCTION_HIST)
  console.log('\n[신규 테이블 생성] 4. TB_USER_SANCTION_HIST (거래제한 이력 원장)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TB_USER_SANCTION_HIST (
        SANCTION_SEQ        BIGINT AUTO_INCREMENT NOT NULL COMMENT '이력 일련번호 (PK)',
        USER_NO             CHAR(12)        NOT NULL    COMMENT '대상 회원번호 (FK: TB_USER)',
        USER_ROLE_CD        CHAR(1)         NOT NULL    COMMENT '회원구분 (C: 고객, S: 시공사)',
        ORDER_NO            CHAR(16)        NOT NULL    COMMENT '취소 연관 발주번호',
        CANCEL_STAGE        VARCHAR(20)     NOT NULL    COMMENT '취소 단계 (BEFORE_PAY: 결제전취소, AFTER_PAY: 청약확정후취소, BID_CANCEL: 시공사청약취소)',
        CANCEL_REASON       VARCHAR(255)    NULL        COMMENT '취소 사유',
        ACCUMULATED_CNT     INT             NOT NULL DEFAULT 1 COMMENT '해당 회원의 누적 취소 건수',
        SANCTION_TYPE       VARCHAR(20)     NOT NULL    COMMENT '제한 유형 (SUSPEND_8D: 8일정지, PERMANENT_BLOCK: 10회영구정지)',
        SANCTION_START_DT   DATETIME        NOT NULL    COMMENT '거래 제한 시작일시',
        SANCTION_EXPIRE_DT  DATETIME        NULL        COMMENT '거래 제한 해제 예정일시 (영구정지는 NULL)',
        RELEASE_YN          CHAR(1)         DEFAULT 'N' NOT NULL COMMENT '관리자 수동 해제 여부 (Y/N)',
        RELEASE_DT          DATETIME        NULL        COMMENT '수동 해제 일시',
        RELEASE_ADMIN_ID    VARCHAR(50)     NULL        COMMENT '수동 해제 처리 관리자 ID',
        REG_DT              DATETIME        DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '등록일시',
        PRIMARY KEY (SANCTION_SEQ),
        CONSTRAINT FK_SANCTION_USER FOREIGN KEY (USER_NO) REFERENCES TB_USER (USER_NO) ON DELETE CASCADE,
        KEY IDX_USER_SANCTION (USER_NO, SANCTION_TYPE, RELEASE_YN)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 발주/청약 취소 거래제한 이력 원장';
  `);
  console.log('-> TB_USER_SANCTION_HIST 생성 완료');

  // 6. 신규 테이블 생성 (TB_USER_SESSION)
  console.log('\n[신규 테이블 생성] 5. TB_USER_SESSION (디바이스 세션 관리)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TB_USER_SESSION (
        SESSION_ID          VARCHAR(50)     NOT NULL    COMMENT '세션 고유 식별값 (PK)',
        USER_NO             CHAR(12)        NOT NULL    COMMENT '회원번호 (FK)',
        DEVICE_TYPE         VARCHAR(10)     NOT NULL    COMMENT '기기구분 (APP / WEB)',
        DEVICE_ID           VARCHAR(100)    NOT NULL    COMMENT '기기 고유 식별자 (UUID / Fingerprint)',
        REFRESH_TOKEN       VARCHAR(255)    NOT NULL    COMMENT '자동로그인용 암호화 토큰',
        EXPIRE_DT           DATETIME        NOT NULL    COMMENT '토큰 만료일시 (접속 시마다 +30일 슬라이딩)',
        IS_ACTIVE           CHAR(1)         DEFAULT 'Y' NOT NULL COMMENT '활성 여부 (Y: 정상, N: 타기기 접속으로 만료)',
        LOGIN_IP            VARCHAR(50)     DEFAULT NULL COMMENT '접속 IP',
        LAST_ACTIVE_DT      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종 활동일시',
        PRIMARY KEY (SESSION_ID),
        CONSTRAINT FK_SESSION_USER FOREIGN KEY (USER_NO) REFERENCES TB_USER (USER_NO) ON DELETE CASCADE,
        KEY IDX_USER_DEV (USER_NO, DEVICE_TYPE, IS_ACTIVE)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='로그인 세션 및 기기 관리 테이블';
  `);
  console.log('-> TB_USER_SESSION 생성 완료');

  // 7. 신규 테이블 생성 (TB_USER_PUSH_TOKEN)
  console.log('\n[신규 테이블 생성] 6. TB_USER_PUSH_TOKEN (푸시 토큰 관리)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TB_USER_PUSH_TOKEN (
        TOKEN_ID            BIGINT AUTO_INCREMENT NOT NULL COMMENT '토큰 일련번호 (PK)',
        USER_NO             CHAR(12)        NOT NULL    COMMENT '회원번호 (FK)',
        DEVICE_TYPE         VARCHAR(10)     NOT NULL    COMMENT '기기구분 (APP / WEB)',
        PUSH_TOKEN          TEXT            NOT NULL    COMMENT 'FCM 토큰 또는 Web Push Subscription JSON',
        DEVICE_MODEL        VARCHAR(100)    DEFAULT NULL COMMENT '기기 모델명 (예: Galaxy S24, Chrome on Windows)',
        IS_ACTIVE           CHAR(1)         DEFAULT 'Y' NOT NULL COMMENT '토큰 유효 상태 (Y/N)',
        UPD_DT              DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '갱신일시',
        PRIMARY KEY (TOKEN_ID),
        CONSTRAINT FK_PUSH_USER FOREIGN KEY (USER_NO) REFERENCES TB_USER (USER_NO) ON DELETE CASCADE,
        KEY IDX_USER_PUSH (USER_NO, DEVICE_TYPE, IS_ACTIVE)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='회원 푸시 메시지 발송용 디바이스 토큰';
  `);
  console.log('-> TB_USER_PUSH_TOKEN 생성 완료');

  // 8. 신규 테이블 생성 (TB_USER_NOTI_SETTING)
  console.log('\n[신규 테이블 생성] 7. TB_USER_NOTI_SETTING (알림 수신 환경설정)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TB_USER_NOTI_SETTING (
        USER_NO             CHAR(12)        NOT NULL    COMMENT '회원번호 (PK)',
        NOTI_SOUND_TYPE     VARCHAR(10)     DEFAULT 'BELL' NOT NULL COMMENT '수신방식 (BELL: 벨소리, VIBE: 진동, MUTE: 무음)',
        DO_NOT_DISTURB_YN   CHAR(1)         DEFAULT 'N' NOT NULL    COMMENT '방해금지모드 여부 (Y/N)',
        DND_START_TIME      VARCHAR(4)      DEFAULT '2200' NOT NULL COMMENT '방해금지 시작시간 (HHmm)',
        DND_END_TIME        VARCHAR(4)      DEFAULT '0800' NOT NULL COMMENT '방해금지 종료시간 (HHmm)',
        UPD_DT              DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
        PRIMARY KEY (USER_NO),
        CONSTRAINT FK_NOTI_SETTING_USER FOREIGN KEY (USER_NO) REFERENCES TB_USER(USER_NO) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 알림 수신 환경설정';
  `);
  console.log('-> TB_USER_NOTI_SETTING 생성 완료');

  // 9. 신규 테이블 생성 (TB_USER_NOTIFICATION)
  console.log('\n[신규 테이블 생성] 8. TB_USER_NOTIFICATION (알림 메시지 내역)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS TB_USER_NOTIFICATION (
        NOTI_ID             VARCHAR(20)     NOT NULL    COMMENT '알림 고유 ID (PK, NT20261100001)',
        USER_NO             CHAR(12)        NOT NULL    COMMENT '수신 회원번호 (FK)',
        NOTI_TYPE           VARCHAR(20)     NOT NULL    COMMENT '알림유형 (QUOTE, JOB_STEP, PAY, NOTICE 등)',
        TITLE               VARCHAR(100)    NOT NULL    COMMENT '알림 제목',
        CONTENT             VARCHAR(500)    NOT NULL    COMMENT '알림 상세 내용',
        TARGET_URL          VARCHAR(200)    DEFAULT NULL COMMENT '클릭 시 이동할 프론트엔드 라우트',
        IS_READ             CHAR(1)         DEFAULT 'N' NOT NULL COMMENT '읽음여부 (N: 미확인, Y: 확인완료)',
        READ_DT             DATETIME        DEFAULT NULL COMMENT '확인 일시',
        REG_DT              DATETIME        DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '알림 발생 일시',
        PRIMARY KEY (NOTI_ID),
        CONSTRAINT FK_NOTI_USER FOREIGN KEY (USER_NO) REFERENCES TB_USER (USER_NO) ON DELETE CASCADE,
        KEY IDX_USER_READ (USER_NO, IS_READ)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사용자 알림 메시지 내역';
  `);
  console.log('-> TB_USER_NOTIFICATION 생성 완료');

  // 최종 점검: 전체 테이블 목록
  const [allTables] = await connection.query('SHOW TABLES;');
  console.log('\n=== 마이그레이션 후 전체 테이블 목록 (총 ' + allTables.length + '개) ===');
  console.log(allTables.map(t => Object.values(t)[0]));

  await connection.end();
  console.log('\n=== 모든 DB 수정 및 신규 테이블 생성이 안전하게 완료되었습니다! ===');
}

main().catch(err => {
  console.error('Migration Error:', err);
  process.exit(1);
});
