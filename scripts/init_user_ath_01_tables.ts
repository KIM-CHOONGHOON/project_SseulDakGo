import { executeQuery } from '../lib/db';

async function initTables() {
  console.log('--- Initializing TB_USER, TB_TERMS_MASTER, TB_MEMBER_AGREE_SIGN, TB_SALES_MEMBER, TB_PROMO_CAMPAIGN, TB_USER_COUPON ---');

  // 1. TB_USER 생성
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_USER (
      USER_NO             CHAR(12)        NOT NULL    COMMENT '이용자 회원 식별번호 (규격: U + YYYYMM + 5자리 순번)',
      USER_EMAIL          VARCHAR(100)    NOT NULL    COMMENT '이용자 이메일 계정',
      USER_PWD_HASH       VARCHAR(255)    NULL        COMMENT '단방향 암호화 해시 비밀번호 (소셜 간편가입 시 NULL)',
      PWD_SALT            VARCHAR(64)     NULL        COMMENT '비밀번호 암호화 솔트(Salt) 값',
      PWD_CHG_DT          DATETIME        NULL        COMMENT '비밀번호 최종 변경 일시',
      USER_NM             VARCHAR(50)     NOT NULL    COMMENT '이용자 실명',
      USER_TEL            VARCHAR(20)     NOT NULL    COMMENT '휴대폰 번호 (SMS 본인인증 완료 번호)',
      SIGN_IMG_URL        VARCHAR(500)    NULL        COMMENT '전자거래 서명패드 자필 전자서명 이미지 파일 기본 URL',
      
      -- SNS 연동 관련 컬럼
      SOCIAL_PROVIDER     VARCHAR(20)     NULL        COMMENT '소셜 연동 제공자 (KAKAO, NAVER, GOOGLE, APPLE)',
      SOCIAL_UID          VARCHAR(100)    NULL        COMMENT '소셜 플랫폼 회원 고유 식별값',
      SOCIAL_EMAIL        VARCHAR(100)    NULL        COMMENT '소셜 계정 연동 이메일 주소',
      PROFILE_IMG_URL     VARCHAR(500)    NULL        COMMENT '프로필 이미지 URL',
      SOCIAL_ACCESS_TOKEN VARCHAR(500)    NULL        COMMENT '소셜 API 액세스 토큰',
      SOCIAL_REFRESH_TOKEN VARCHAR(500)   NULL        COMMENT '소셜 API 리프레시 토큰',
      SOCIAL_LINKED_DT    DATETIME        NULL        COMMENT '소셜 계정 연동 일시',
      
      JOIN_PATH_CD        VARCHAR(20)     NOT NULL DEFAULT 'DIRECT' COMMENT '가입 경로 (DIRECT, KAKAO, NAVER, GOOGLE)',
      RECOMMENDER_CODE    VARCHAR(20)     NULL        COMMENT '가입 시 추천인 코드',
      USER_STAT_CD        VARCHAR(20)     NOT NULL DEFAULT 'NORMAL' COMMENT '회원 상태 (NORMAL, SUSPENDED_7D, BLOCKED, WITHDRAWN)',
      SUSPEND_EXPIRE_DT   DATETIME        NULL        COMMENT '선 취소 패널티 7일 정지 만료 일시',
      CANCEL_ACCUM_CNT    INT             NOT NULL DEFAULT 0 COMMENT '선 취소 누적 횟수',
      MKT_AGREE_YN        CHAR(1)         NOT NULL DEFAULT 'N' COMMENT '마케팅 정보 수신 동의 여부 (Y/N)',
      LAST_LOGIN_DT       DATETIME        NULL        COMMENT '최종 로그인 일시',
      REG_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '최초 가입 일시',
      REG_ID              VARCHAR(50)     NOT NULL    COMMENT '최초 등록자 식별번호 (본인 USER_NO)',
      MOD_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종 수정 일시',
      MOD_ID              VARCHAR(50)     NOT NULL    COMMENT '최종 수정자 식별번호',
      PRIMARY KEY (USER_NO),
      UNIQUE KEY UQ_USER_EMAIL (USER_EMAIL),
      KEY IX_USER_SOCIAL (SOCIAL_PROVIDER, SOCIAL_UID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='이용자(고객) 마스터';
  `);
  console.log('✓ TB_USER table created/ensured');

  // 2. TB_TERMS_MASTER 생성
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_TERMS_MASTER (
      TERMS_CD            VARCHAR(30)     NOT NULL    COMMENT '약관 구분 코드 (SERVICE, PRIVACY, SIGNATURE, MARKETING)',
      TERMS_VER           VARCHAR(20)     NOT NULL    COMMENT '약관 버전 (예: v1.0)',
      TERMS_TITLE         VARCHAR(150)    NOT NULL    COMMENT '약관 명칭',
      TERMS_CONTENT       LONGTEXT        NOT NULL    COMMENT '약관 상세 본문 내용',
      MANDATORY_YN        CHAR(1)         NOT NULL DEFAULT 'Y' COMMENT '필수 동의 여부 (Y: 필수, N: 선택)',
      EFFECTIVE_DT        DATE            NOT NULL    COMMENT '약관 발효 시행 일자',
      USE_YN              CHAR(1)         NOT NULL DEFAULT 'Y' COMMENT '현재 사용 여부 (Y/N)',
      REG_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
      REG_ID              VARCHAR(50)     NOT NULL DEFAULT 'SYSTEM',
      MOD_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      MOD_ID              VARCHAR(50)     NOT NULL DEFAULT 'SYSTEM',
      PRIMARY KEY (TERMS_CD, TERMS_VER)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='이용약관 마스터';
  `);
  console.log('✓ TB_TERMS_MASTER table ensured');

  // 기본 약관 시드 데이터 등록
  await executeQuery(`
    INSERT INTO TB_TERMS_MASTER (TERMS_CD, TERMS_VER, TERMS_TITLE, TERMS_CONTENT, MANDATORY_YN, EFFECTIVE_DT, USE_YN)
    VALUES 
    (
      'SERVICE', 'v1.0', '서비스 이용약관', 
      '제1조 (목적)\n본 약관은 SsulDak(쓸고닦고)이 제공하는 건물 청소 및 가전 분해 살균 중개 플랫폼 서비스의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (공정거래 및 최저 하한선 보장)\n회사는 덤핑 역경매를 금지하며 시장 실사 기반 최저 하한선(Floor Price) 이상의 확정 청약 제도를 운영합니다.\n\n제3조 (회원의 의무)\n회원은 청소 현장에 대한 정확한 정보를 제공해야 하며 허위 정보를 기재하여 발생한 분쟁에 대해 책임을 집니다.\n\n제4조 (계약 체결 및 취소)\n이용자가 청약을 확정하고 데이터 이용료를 결제함으로써 시공 계약이 성립되며 시공 24시간 전 취소 시 위약금이 발생할 수 있습니다.', 
      'Y', '2026-01-01', 'Y'
    ),
    (
      'PRIVACY', 'v1.0', '개인정보 수집 및 이용 동의', 
      '제1조 (수집 항목)\n회사는 회원가입 및 견적 중개를 위해 이메일, 이름, 휴대폰번호, 서비스 신청 주소, 자필 전자서명 이미지를 수집합니다.\n\n제2조 (이용 목적)\n1. 회원 식별 및 본인 확인\n2. 청소 시공 견적 매칭 및 계약서 교부\n3. 고객 분쟁 해결 및 법적 분쟁 증빙 보관\n\n제3조 (보유 및 이용 기간)\n회원 탈퇴 시까지 보관하며 관계 법령에 따라 전자상거래 계약 및 결제 기록은 5년간 보관합니다.', 
      'Y', '2026-01-01', 'Y'
    ),
    (
      'SIGNATURE', 'v1.0', '전자거래 및 자필 전자서명 보증 동의', 
      '제1조 (전자서명의 법적 효력)\n회원이 서명패드에 자필로 날인한 전자서명은 전자서명법 제3조에 의거하여 종이 문서에 날인한 자필 서명 또는 인감 날인과 동일한 법적 효력을 가집니다.\n\n제2조 (서명 원본의 보관)\n회사는 체결된 전자서명 이미지 파일 원본 및 메타데이터(IP, 일시, 기기정보)를 공증용 증적 데이터베이스에 영구 암호화하여 보관합니다.', 
      'Y', '2026-01-01', 'Y'
    ),
    (
      'MARKETING', 'v1.0', '이벤트 및 혜택 알림 마케팅 수신 동의', 
      '제1조 (마케팅 정보의 수신)\n회원은 쓸고닦고에서 제공하는 시즌 정기 할인 쿠폰, 신규 청소 상품 안내, 파트너 특가 혜택 정보를 SMS, 앱 푸시, 이메일로 수신하는 데 동의합니다. 동의하지 않아도 기본 서비스 이용에 제한은 없습니다.', 
      'N', '2026-01-01', 'Y'
    )
    ON DUPLICATE KEY UPDATE 
      TERMS_TITLE = VALUES(TERMS_TITLE),
      TERMS_CONTENT = VALUES(TERMS_CONTENT),
      MANDATORY_YN = VALUES(MANDATORY_YN);
  `);
  console.log('✓ TB_TERMS_MASTER seed terms inserted/updated');

  // 3. TB_MEMBER_AGREE_SIGN 생성 (서명 파일 원본 파일명 및 디렉토리 PATH 포함)
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_MEMBER_AGREE_SIGN (
      AGREE_SEQ           BIGINT AUTO_INCREMENT NOT NULL COMMENT '동의 및 서명 이력 일련번호 PK',
      MEMBER_ROLE_CD      VARCHAR(10)     NOT NULL    COMMENT '회원 역할 구분 (USER: 이용자, PARTNER: 파트너)',
      MEMBER_NO           CHAR(12)        NOT NULL    COMMENT '회원 식별번호 (USER_NO 또는 PTNR_NO)',
      TERMS_CD            VARCHAR(30)     NOT NULL    COMMENT '약관 구분 코드 (SERVICE, PRIVACY, SIGNATURE, MARKETING)',
      TERMS_VER           VARCHAR(20)     NOT NULL    COMMENT '약관 버전 (예: v1.0)',
      AGREE_YN            CHAR(1)         NOT NULL DEFAULT 'Y' COMMENT '동의 여부 (Y: 동의, N: 미동의)',
      SIGN_FILE_NM        VARCHAR(255)    NULL        COMMENT '서명 그림 파일 원본 파일명',
      SIGN_FILE_PATH      VARCHAR(500)    NULL        COMMENT '서명 그림 파일 관리 서버 디렉토리 절대/상대 경로',
      SIGN_FILE_URL       VARCHAR(500)    NULL        COMMENT '전자서명 패드 자필 서명 이미지 웹 접근 URL',
      CLIENT_IP           VARCHAR(50)     NULL        COMMENT '동의 당시 접속 클라이언트 IP 주소',
      DEVICE_INFO         VARCHAR(255)    NULL        COMMENT '접속 기기 정보 (User-Agent 등)',
      AGREE_DT            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '약관 동의 및 서명 완료 일시',
      REG_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '최초 등록 일시',
      REG_ID              VARCHAR(50)     NOT NULL    COMMENT '최초 등록자 식별번호 (본인 MEMBER_NO)',
      MOD_DT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종 수정 일시',
      MOD_ID              VARCHAR(50)     NOT NULL    COMMENT '최종 수정자 식별번호',
      PRIMARY KEY (AGREE_SEQ),
      KEY IX_MEMBER_AGREE (MEMBER_NO, TERMS_CD)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='회원별 약관 동의 및 전자서명 증적 파일 관리';
  `);
  console.log('✓ TB_MEMBER_AGREE_SIGN table created/ensured');

  // 4. TB_SALES_MEMBER
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_SALES_MEMBER (
      REFERRAL_CODE      VARCHAR(20)   NOT NULL COMMENT '영업회원 고유 추천인 코드',
      MEMBER_NM          VARCHAR(50)   NOT NULL COMMENT '영업회원 실명',
      SALES_STAT_CD      VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' COMMENT '활동 상태 (ACTIVE, INACTIVE)',
      TOTAL_RECRUIT_CNT  INT           NOT NULL DEFAULT 0 COMMENT '유치 회원 누적 수',
      REG_DT             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      MOD_DT             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      MOD_ID             VARCHAR(50)   NOT NULL DEFAULT 'SYSTEM',
      PRIMARY KEY (REFERRAL_CODE)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='영업회원 마스터';
  `);
  console.log('✓ TB_SALES_MEMBER table ensured');

  // 테스트 추천인 코드 삽입
  await executeQuery(`
    INSERT INTO TB_SALES_MEMBER (REFERRAL_CODE, MEMBER_NM, SALES_STAT_CD, TOTAL_RECRUIT_CNT)
    VALUES ('SSULDAK8', '쓸딱본사마케팅', 'ACTIVE', 12)
    ON DUPLICATE KEY UPDATE SALES_STAT_CD = 'ACTIVE';
  `);
  console.log('✓ Sample referral code SSULDAK8 inserted');

  // 5. TB_PROMO_CAMPAIGN
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_PROMO_CAMPAIGN (
      CAMPAIGN_NO     VARCHAR(30)   NOT NULL COMMENT '캠페인 번호',
      CAMPAIGN_NM     VARCHAR(100)  NOT NULL COMMENT '캠페인 명칭',
      TARGET_ROLE_CD  VARCHAR(20)   NOT NULL DEFAULT 'USER' COMMENT '대상 역할 (USER, PARTNER, ALL)',
      DISCOUNT_AMT    DECIMAL(10,2) NOT NULL DEFAULT 5000.00 COMMENT '할인 혜택 금액',
      VALID_DAYS      INT           NOT NULL DEFAULT 30 COMMENT '쿠폰 유효 일수',
      IS_ACTIVE_YN    CHAR(1)       NOT NULL DEFAULT 'Y' COMMENT '활성화 여부',
      START_DT        DATETIME      NOT NULL COMMENT '시작 일시',
      END_DT          DATETIME      NOT NULL COMMENT '종료 일시',
      REG_DT          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (CAMPAIGN_NO)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='프로모션 캠페인 마스터';
  `);
  console.log('✓ TB_PROMO_CAMPAIGN table ensured');

  // 테스트 웰컴 캠페인 삽입
  await executeQuery(`
    INSERT INTO TB_PROMO_CAMPAIGN (
      CAMPAIGN_NO, CAMPAIGN_NM, TARGET_ROLE_CD, DISCOUNT_AMT, VALID_DAYS, IS_ACTIVE_YN, START_DT, END_DT
    )
    VALUES (
      'CMP202610WELCOME', '신규가입 웰컴 5,000원 즉시할인 쿠폰', 'USER', 5000, 30, 'Y', 
      '2026-01-01 00:00:00', '2026-12-31 23:59:59'
    )
    ON DUPLICATE KEY UPDATE IS_ACTIVE_YN = 'Y';
  `);
  console.log('✓ Sample welcome campaign CMP202610WELCOME inserted');

  // 6. TB_USER_COUPON
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_USER_COUPON (
      U_COUPON_NO       VARCHAR(30)   NOT NULL COMMENT '쿠폰 발급 번호',
      USER_NO           CHAR(12)      NOT NULL COMMENT '이용자 식별자 (CHAR(12))',
      CAMPAIGN_NO       VARCHAR(30)   NOT NULL COMMENT '캠페인 번호',
      COUPON_SERIAL_CD  VARCHAR(30)   NOT NULL COMMENT '고유 시리얼 코드',
      COUPON_STAT_CD    VARCHAR(20)   NOT NULL DEFAULT 'AVAILABLE' COMMENT '쿠폰 상태 (AVAILABLE, USED, EXPIRED)',
      EXPIRE_DT         DATETIME      NOT NULL COMMENT '만료 일시',
      REG_DT            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      REG_ID            VARCHAR(50)   NOT NULL DEFAULT 'SYSTEM',
      MOD_DT            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      MOD_ID            VARCHAR(50)   NOT NULL DEFAULT 'SYSTEM',
      PRIMARY KEY (U_COUPON_NO),
      UNIQUE KEY UK_COUPON_SERIAL (COUPON_SERIAL_CD),
      KEY IX_USER_COUPON (USER_NO, COUPON_STAT_CD)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='이용자 쿠폰 보유 원장';
  `);
  // 7. TB_SMS_AUTH_LOG 생성 (휴대폰 SMS 인증번호 발송 원장)
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS TB_SMS_AUTH_LOG (
      AUTH_SEQ      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '인증 일련번호',
      RECV_TEL      VARCHAR(20) NOT NULL COMMENT '수신 휴대폰 번호',
      AUTH_TYPE_CD  VARCHAR(20) NOT NULL DEFAULT 'JOIN_AUTH' COMMENT '인증 구분 (JOIN_AUTH: 가입인증, PWD_RESET: 비밀번호재설정)',
      AUTH_CODE     CHAR(6) NOT NULL COMMENT '6자리 인증번호',
      EXPIRE_DT     DATETIME NOT NULL COMMENT '만료 일시 (발송 3분 후)',
      VERIFY_YN     CHAR(1) NOT NULL DEFAULT 'N' COMMENT '인증 성공 여부 (Y/N)',
      REG_DT        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '발송 일시',
      KEY IX_TEL_AUTH (RECV_TEL, AUTH_TYPE_CD, VERIFY_YN, EXPIRE_DT)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='휴대폰 인증번호 발송 원장';
  `);
  console.log('✓ TB_SMS_AUTH_LOG table ensured');

  console.log('=== All tables and seed data initialized successfully! ===');
  process.exit(0);
}

initTables().catch((e) => {
  console.error('Init error:', e);
  process.exit(1);
});
