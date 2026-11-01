/**
 * @file SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010/route.js
 * @description 통합 회원가입 및 4대 약관 정독 백엔드 API (WEB-CLNT-ATH-010)
 *              - 일반 이메일 회원가입 및 SNS(카카오, 네이버, Google, Apple) 연동 가입 지원
 *              - 자필 전자서명 Base64 디코딩 후 PNG 파일 디렉토리 자동 생성 및 물리 저장
 *              - 약관별 개별 동의 일자/시간(시분초) 및 서명 증적 파일 메타데이터 영구 보관
 * 
 * 테이블:
 * - TB_USER: 회원 기본 정보 마스터 (SIGN_IMG_URL 저장)
 * - TB_TERMS_MASTER: 약관 마스터
 * - TB_TERMS_AGREE_SIGN: 회원별 약관 동의 일시 및 자필 전자서명 증적 파일 관리 원장
 * - TB_MEMBER_AGREE_SIGN: 구버전 호환 증적 테이블
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * TB_USER 테이블 USER_NO 첫 1바이트 접두어 결정 함수
 * - 고객(Customer): 'C'
 * - 용역/시공사(Partner/Master): 'S'
 * - 관리자(Admin): 'A'
 */
function getRolePrefix(roleCd) {
  if (!roleCd) return 'C';
  const r = String(roleCd).toUpperCase();
  if (r.startsWith('S') || r.includes('PARTNER') || r.includes('MASTER')) return 'S';
  if (r.startsWith('A') || r.includes('ADMIN')) return 'A';
  return 'C';
}

/**
 * 비밀번호 Salt & PBKDF2 해싱 함수
 */
function hashPassword(password) {
  if (!password) return { salt: null, hash: null };
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

/**
 * 자필 전자서명 Base64 PNG 파일 디스크 저장 함수
 * 저장 경로: public/uploads/signatures/{YYYYMM}/sign_{userNo}_{timestamp}.png
 * 보관 폴더가 미존재할 경우 재귀적 자동 생성(mkdirSync recursive) 보장
 */
function saveSignaturePng(signDataUrl, userNo) {
  if (!signDataUrl || typeof signDataUrl !== 'string' || !signDataUrl.includes('base64,')) {
    return { fileName: null, filePath: null, fileUrl: null };
  }

  try {
    const base64Data = signDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. 연월(YYYYMM) 단위 체계적 보관 폴더 자동 생성 로직
    const date = new Date();
    const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures', yyyymm);

    // 보관 폴더 자동 생성 확인 및 디렉토리 보장
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 [FOLDER_AUTO_CREATED] 서명 물리 보관 폴더 자동 생성 완료: ${uploadDir}`);
    }

    // 2. 고유 서명 파일명 및 물리 경로 생성
    const fileName = `sign_${userNo}_${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // 3. 웹 접근 URL 생성
    const fileUrl = `/uploads/signatures/${yyyymm}/${fileName}`;

    console.log(`✅ [SIGNATURE_SAVED] ${fileName} (${buffer.length} bytes) 저장 완료 -> ${filePath}`);
    return { fileName, filePath, fileUrl };
  } catch (err) {
    console.error('[SIGNATURE_SAVE_FAIL]', err);
    return { fileName: null, filePath: null, fileUrl: null };
  }
}

/**
 * 신규 회원 식별번호(USER_NO) 채번
 * 규칙: (C/S) + YYYYMM + 5자리 일련번호 (총 12자리)
 * - YYYYMM 뒤 5자리는 1부터 시작하며 0으로 왼쪽 패딩(padStart(5, '0'))되어 채번 (예: C20261100001)
 */
async function generateUserNo(roleCd, db) {
  const prefix = (roleCd === 'S' ? 'S' : 'C');
  const now = new Date();
  // 한국 표준시 (KST = UTC+9) 반영
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kstTime.getUTCFullYear();
  const mm = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
  const yyyymm = `${yyyy}${mm}`;
  const baseKey = `${prefix}${yyyymm}`;

  if (db && typeof db.executeQuery === 'function') {
    try {
      const rows = await db.executeQuery(
        `SELECT USER_NO FROM TB_USER 
         WHERE USER_NO LIKE ? 
         ORDER BY USER_NO DESC LIMIT 1`,
        [`${baseKey}%`]
      );
      if (rows && rows.length > 0 && rows[0]?.USER_NO) {
        const lastSeqStr = rows[0].USER_NO.slice(-5);
        const lastSeq = parseInt(lastSeqStr, 10);
        const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
        return `${baseKey}${String(nextSeq).padStart(5, '0')}`;
      } else {
        // 해당 연월 최초 회원: 1부터 시작하여 5자리 0 왼쪽 패딩 -> 00001
        return `${baseKey}00001`;
      }
    } catch (e) {
      console.warn('[GEN_USER_NO_WARN]', e.message);
    }
  }

  // Fallback 시에도 규칙 준수 (00001)
  return `${baseKey}00001`;
}

/**
 * 회원가입 비즈니스 로직 처리 함수
 * @param {Object} payload 
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processWebClntAth010(payload = {}) {
  const {
    action = 'REGISTER', // 'CHECK_EMAIL' | 'REGISTER'
    userRoleCd = 'C',
    userEmail,
    userPwd,
    userPwdConfirm,
    userNm,
    userTel,
    socialProvider = null, // KAKAO, NAVER, GOOGLE, APPLE (SNS 연동 가입 시)
    socialUid = null,
    socialEmail = null,
    signDataUrl = null, // 자필 서명 Canvas Base64 Data URL
    agreedTermsDetail = null, // [{ termsCd, termsVer, agreeYn, agreedAt }] 약관별 동의 일자/시간 상세
    agreedTerms = [] // ['SERVICE', 'PRIVACY', 'LOCATION', 'FINANCE', 'SIGNATURE']
  } = payload;

  const normalizedRole = userRoleCd === 'S' ? 'S' : 'C';

  let db = null;
  try {
    db = await import('../../../../lib/db.js');
  } catch (e) {
    db = await import('../../lib/db.js').catch(() => null);
  }

  // =========================================================================
  // 1. 이용약관 마스터 목록 조회 (action === 'GET_TERMS')
  // =========================================================================
  if (action === 'GET_TERMS') {
    if (db && typeof db.executeQuery === 'function') {
      try {
        const terms = await db.executeQuery(
          `SELECT TERMS_CD, TERMS_VER, TERMS_TITLE, TERMS_CONTENT, MANDATORY_YN, EFFECTIVE_DT
           FROM TB_TERMS_MASTER
           WHERE USE_YN = 'Y'
           ORDER BY TERMS_CD ASC`
        );
        return {
          status: 200,
          data: {
            success: true,
            code: 'OK',
            data: terms,
            message: '이용약관 마스터 목록을 성공적으로 조회했습니다.'
          }
        };
      } catch (err) {
        console.warn('[GET_TERMS_WARN_WEB]', err.message);
      }
    }

    return {
      status: 200,
      data: {
        success: true,
        code: 'OK',
        data: [
          { TERMS_CD: 'SERVICE', TERMS_VER: 'v1.0', TERMS_TITLE: '서비스 통합이용약관', MANDATORY_YN: 'Y' },
          { TERMS_CD: 'PRIVACY', TERMS_VER: 'v1.0', TERMS_TITLE: '개인정보 수집 및 이용 동의', MANDATORY_YN: 'Y' },
          { TERMS_CD: 'LOCATION', TERMS_VER: 'v1.0', TERMS_TITLE: '위치기반 서비스 이용약관', MANDATORY_YN: 'Y' },
          { TERMS_CD: 'FINANCE', TERMS_VER: 'v1.0', TERMS_TITLE: '전자금융거래 기본약관', MANDATORY_YN: 'Y' },
          { TERMS_CD: 'SIGNATURE', TERMS_VER: 'v1.0', TERMS_TITLE: '전자거래 및 자필 전자서명 보증 동의', MANDATORY_YN: 'Y' }
        ]
      }
    };
  }

  // =========================================================================
  // 2. 이메일 중복 확인 (action === 'CHECK_EMAIL')
  // =========================================================================
  if (action === 'CHECK_EMAIL') {
    if (!userEmail || !userEmail.includes('@')) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'ERR_INVALID_EMAIL',
          message: '올바른 형식의 이메일 주소를 입력해 주세요.'
        }
      };
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const rolePrefix = getRolePrefix(userRoleCd);
    const roleNm = rolePrefix === 'S' ? '용역/시공사' : (rolePrefix === 'A' ? '관리자' : '고객');

    if (db && typeof db.executeQuery === 'function') {
      try {
        // TB_USER의 USER_NO 컬럼 첫 1바이트가 고객 'C', 용역 'S', 관리 'A' 이면서
        // USER_EMAIL 값이 동일한 정보가 있는지 중복 여부 정합성 검증
        const rows = await db.executeQuery(
          `SELECT USER_NO, USER_ROLE_CD, USER_EMAIL 
           FROM TB_USER 
           WHERE SUBSTRING(USER_NO, 1, 1) = ? 
             AND LOWER(TRIM(USER_EMAIL)) = ? 
           LIMIT 1`,
          [rolePrefix, cleanEmail]
        );
        if (rows && rows.length > 0) {
          return {
            status: 200,
            data: {
              success: false,
              isAvailable: false,
              code: 'ERR_DUPLICATE_EMAIL',
              message: `이미 가입된 ${roleNm} 이메일 주소입니다. 다른 이메일을 사용해 주세요.`
            }
          };
        }
      } catch (dbErr) {
        console.warn('[CHECK_EMAIL_DB_ERR_WEB]', dbErr.message);
      }
    }

    return {
      status: 200,
      data: {
        success: true,
        isAvailable: true,
        code: 'OK',
        message: '사용 가능한 안전한 이메일 주소입니다.'
      }
    };
  }

  // =========================================================================
  // 2. 통합 회원가입 처리 (action === 'REGISTER')
  // =========================================================================
  if (!userEmail || !userEmail.includes('@')) {
    return {
      status: 400,
      data: {
        success: false,
        code: 'ERR_INVALID_EMAIL',
        message: '유효한 로그인 이메일을 입력해 주세요.'
      }
    };
  }

  // 일반 가입 시 비밀번호 필수 검증 (SNS 가입 시 비밀번호 생략 가능)
  const isSocial = Boolean(socialProvider && socialUid);
  if (!isSocial) {
    if (!userPwd || userPwd.length < 6) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'ERR_INVALID_PASSWORD',
          message: '비밀번호는 최소 6자 이상(영문, 숫자, 특수문자 조합)이어야 합니다.'
        }
      };
    }

    if (userPwdConfirm && userPwd !== userPwdConfirm) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'ERR_PASSWORD_MISMATCH',
          message: '비밀번호와 비밀번호 확인 값이 일치하지 않습니다.'
        }
      };
    }
  }

  if (!userNm || !userNm.trim()) {
    return {
      status: 400,
      data: {
        success: false,
        code: 'ERR_NAME_REQUIRED',
        message: '실명을 입력해 주세요.'
      }
    };
  }

  if (!userTel || !userTel.trim()) {
    return {
      status: 400,
      data: {
        success: false,
        code: 'ERR_TEL_REQUIRED',
        message: '휴대폰 본인인증 번호를 입력해 주세요.'
      }
    };
  }

  // 4대 필수 약관 동의 검증
  const mandatoryCodes = ['SERVICE', 'PRIVACY', 'LOCATION', 'FINANCE'];
  let passedCodes = [];
  if (Array.isArray(agreedTermsDetail) && agreedTermsDetail.length > 0) {
    passedCodes = agreedTermsDetail.filter(item => item.agreeYn !== 'N').map(item => item.termsCd);
  } else if (Array.isArray(agreedTerms)) {
    passedCodes = agreedTerms.map(t => (typeof t === 'string' ? t : t.termsCd));
  }

  const hasAllMandatory = mandatoryCodes.every((code) => passedCodes.includes(code));
  if (!hasAllMandatory) {
    return {
      status: 400,
      data: {
        success: false,
        code: 'ERR_MANDATORY_TERMS_NOT_AGREED',
        message: '필수 4대 이용약관(서비스, 개인정보, 위치기반, 전자금융거래)에 모두 동의해야 가입할 수 있습니다.'
      }
    };
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  const cleanNm = userNm.trim();
  const cleanTel = userTel.trim();

  // DB 등록 처리
  try {
    if (db && typeof db.executeQuery === 'function') {
      // 2-1. SNS 계정 기가입 여부 검증 (SNS 연동 시)
      if (isSocial) {
        const socialRows = await db.executeQuery(
          'SELECT USER_NO FROM TB_USER WHERE SOCIAL_PROVIDER = ? AND SOCIAL_UID = ? LIMIT 1',
          [socialProvider, socialUid]
        );
        if (socialRows && socialRows.length > 0) {
          return {
            status: 409,
            data: {
              success: false,
              code: 'ERR_DUPLICATE_SOCIAL',
              message: `이미 ${socialProvider} 계정으로 가입된 회원입니다. 로그인해 주세요.`
            }
          };
        }
      }

      // 2-2. 이메일 중복 최종 확인 (USER_NO 첫 1바이트가 고객 'C', 용역 'S', 관리 'A' 이면서 USER_EMAIL 동일 여부)
      const rolePrefix = getRolePrefix(normalizedRole);
      const roleNm = rolePrefix === 'S' ? '용역/시공사' : (rolePrefix === 'A' ? '관리자' : '고객');

      const existRows = await db.executeQuery(
        `SELECT USER_NO, USER_ROLE_CD, USER_EMAIL 
         FROM TB_USER 
         WHERE SUBSTRING(USER_NO, 1, 1) = ? 
           AND LOWER(TRIM(USER_EMAIL)) = ? 
         LIMIT 1`,
        [rolePrefix, cleanEmail]
      );
      if (existRows && existRows.length > 0) {
        return {
          status: 409,
          data: {
            success: false,
            code: 'ERR_DUPLICATE_EMAIL',
            message: `이미 가입된 ${roleNm} 이메일 계정입니다.`
          }
        };
      }

      // 채번 및 해싱
      const userNo = await generateUserNo(normalizedRole, db);
      const { salt, hash } = userPwd ? hashPassword(userPwd) : { salt: null, hash: null };

      // 자필 전자서명 PNG 파일 디스크 저장 (보관 폴더 자동 생성 포함)
      const { fileName: signFileName, filePath: signFilePath, fileUrl: signFileUrl } = saveSignaturePng(signDataUrl, userNo);

      // TB_USER INSERT
      await db.executeQuery(
        `INSERT INTO TB_USER (
          USER_NO, USER_ROLE_CD, USER_EMAIL, USER_PWD_HASH, PWD_SALT,
          USER_NM, USER_TEL, SOCIAL_PROVIDER, SOCIAL_UID,
          USER_STAT_CD, ACTIVE_STATUS_YN, SIGN_IMG_URL,
          REG_ID, MOD_ID, REG_DT, MOD_DT
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NORMAL', 'Y', ?, ?, ?, NOW(), NOW())`,
        [
          userNo,
          normalizedRole,
          cleanEmail,
          hash,
          salt,
          cleanNm,
          cleanTel,
          socialProvider || null,
          socialUid || null,
          signFileUrl || null,
          userNo,
          userNo
        ]
      );

      // 2-3. 약관 마스터(TB_TERMS_MASTER) 기준 유효 버전 동기화
      const masterTermsMap = {};
      try {
        const masterRows = await db.executeQuery(
          `SELECT TERMS_CD, TERMS_VER FROM TB_TERMS_MASTER WHERE USE_YN = 'Y'`
        );
        if (masterRows && masterRows.length > 0) {
          masterRows.forEach((r) => {
            masterTermsMap[r.TERMS_CD] = r.TERMS_VER;
          });
        }
      } catch (mErr) {
        console.warn('[TERMS_MASTER_MAP_WARN_WEB]', mErr.message);
      }

      // 5대 약관 기본 항목 정의 (SERVICE, PRIVACY, LOCATION, FINANCE, SIGNATURE)
      const defaultTermsCodes = ['SERVICE', 'PRIVACY', 'LOCATION', 'FINANCE', 'SIGNATURE'];
      const termMap = {};

      if (Array.isArray(agreedTermsDetail) && agreedTermsDetail.length > 0) {
        agreedTermsDetail.forEach((t) => {
          if (t && t.termsCd) {
            termMap[t.termsCd] = t;
          }
        });
      }

      const termItemsToSave = defaultTermsCodes.map((code) => {
        const item = termMap[code];
        const masterVer = masterTermsMap[code] || 'v1.0';
        return {
          termsCd: code,
          termsVer: masterVer,
          agreeYn: item?.agreeYn || 'Y',
          agreedAt: item?.agreedAt || new Date().toISOString()
        };
      });

      for (const item of termItemsToSave) {
        const termCd = item.termsCd;
        const termVer = item.termsVer;
        const agreeYn = item.agreeYn || 'Y';
        // 프론트엔드에서 전달된 약관별 정확한 동의 일시(agreedAt) 반영
        const agreeDt = item.agreedAt ? new Date(item.agreedAt) : new Date();

        await db.executeQuery(
          `INSERT INTO TB_TERMS_AGREE_SIGN (
            USER_ROLE_CD, USER_NO, TERMS_CD, TERMS_VER, AGREE_YN, AGREE_DT,
            SIGN_FILE_NM, SIGN_FILE_PATH, SIGN_FILE_URL,
            CLIENT_IP, DEVICE_INFO, REG_ID, MOD_ID, REG_DT, MOD_DT
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '127.0.0.1', ?, ?, ?, NOW(), NOW())`,
          [
            normalizedRole,
            userNo,
            termCd,
            termVer,
            agreeYn,
            agreeDt,
            signFileName || null,
            signFilePath || null,
            signFileUrl || null,
            isSocial ? `SNS_${socialProvider}` : 'Web Standard Browser',
            userNo,
            userNo
          ]
        );
      }

      return {
        status: 200,
        data: {
          success: true,
          code: 'OK',
          data: {
            userNo,
            userNm: cleanNm,
            userEmail: cleanEmail,
            userRoleCd: normalizedRole,
            userTel: cleanTel,
            socialProvider: socialProvider || null,
            signFileName: signFileName || null,
            signFilePath: signFilePath || null,
            signFileUrl: signFileUrl || null,
            agreedTerms: termItemsToSave.map(t => ({
              termsCd: t.termsCd,
              termsVer: t.termsVer || 'v1.0',
              agreeYn: t.agreeYn || 'Y',
              agreedAt: t.agreedAt || new Date().toISOString()
            }))
          },
          message: isSocial
            ? `${socialProvider} 계정으로 회원가입 및 전자서명이 완료되었습니다.`
            : '쓸고닦고 통합 회원가입 및 전자서명이 성공적으로 접수되었습니다.'
        }
      };
    } else {
      throw new Error('데이터베이스 인스턴스(db)를 로드할 수 없습니다.');
    }
  } catch (dbErr) {
    console.error('❌ [REGISTER_DB_FAIL_WEB]', dbErr);
    return {
      status: 500,
      data: {
        success: false,
        code: 'ERR_DB_INSERT',
        message: `데이터베이스 등록 중 오류가 발생했습니다: ${dbErr.message || dbErr}`
      }
    };
  }
}

/**
 * Next.js App Router POST 핸들러
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processWebClntAth010(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_WEB_CLNT_ATH_010_ERR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '서버 회원가입 처리 중 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
