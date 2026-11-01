/**
 * @file SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_011/route.js
 * @description 고객 회원 정보 조회 및 이용약관 동의 / 전자서명 관리 백엔드 API (WEB-CLNT-ATH-011)
 *              - 회원 기본 식별 정보 (TB_USER) 및 자필 전자서명 (SIGN_IMG_URL) 조회
 *              - 회원별 5대 약관 동의 내역 원장 (TB_TERMS_AGREE_SIGN)과 약관 마스터 (TB_TERMS_MASTER) JOIN 조회
 *              - 회원 전자서명 갱신(재서명) 처리 및 증적 파일 디스크 저장 지원
 * 
 * 테이블:
 * - TB_USER: 회원 기본 정보 마스터
 * - TB_TERMS_MASTER: 약관 마스터 원장 (SERVICE, PRIVACY, LOCATION, FINANCE, SIGNATURE)
 * - TB_TERMS_AGREE_SIGN: 약관 동의 내역 및 전자서명 증적 관리
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * 자필 전자서명 PNG 파일 디스크 저장 함수
 */
function saveSignaturePng(signDataUrl, userNo) {
  if (!signDataUrl || typeof signDataUrl !== 'string' || !signDataUrl.includes('base64,')) {
    return { fileName: null, filePath: null, fileUrl: null };
  }

  try {
    const base64Data = signDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const date = new Date();
    const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures', yyyymm);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `sign_${userNo}_${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/signatures/${yyyymm}/${fileName}`;
    return { fileName, filePath, fileUrl };
  } catch (err) {
    console.error('[SIGNATURE_SAVE_FAIL_WEB_011]', err);
    return { fileName: null, filePath: null, fileUrl: null };
  }
}

/**
 * 고객 회원 정보 및 약관 동의 / 서명 조회/관리 비즈니스 로직
 * @param {Object} payload 
 * @param {string} payload.userNo 고객 회원 식별번호 (예: C20261100001)
 * @param {string} [payload.action] 'GET_PROFILE' | 'UPDATE_SIGNATURE'
 * @param {string} [payload.signDataUrl] 갱신할 자필 전자서명 Base64
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function processWebClntAth011(payload = {}) {
  const { action = 'GET_PROFILE', userNo, signDataUrl } = payload;

  if (!userNo || typeof userNo !== 'string') {
    return {
      status: 400,
      data: {
        success: false,
        code: 'ERR_INVALID_PARAMS',
        message: '고객 식별번호(userNo)를 입력해 주세요.'
      }
    };
  }

  const cleanUserNo = userNo.trim();

  let db = null;
  try {
    db = await import('../../../../lib/db.js');
  } catch (e) {
    db = await import('../../lib/db.js').catch(() => null);
  }

  // =========================================================================
  // 1. 전자서명 갱신 (action === 'UPDATE_SIGNATURE')
  // =========================================================================
  if (action === 'UPDATE_SIGNATURE') {
    if (!signDataUrl || !signDataUrl.includes('base64,')) {
      return {
        status: 400,
        data: {
          success: false,
          code: 'ERR_INVALID_SIGNATURE',
          message: '유효한 서명 데이터가 전달되지 않았습니다.'
        }
      };
    }

    try {
      const { fileName, filePath, fileUrl } = saveSignaturePng(signDataUrl, cleanUserNo);
      if (!fileUrl) {
        throw new Error('서명 파일 저장에 실패했습니다.');
      }

      if (db && typeof db.executeQuery === 'function') {
        // 1. TB_USER 서명 이미지 URL 업데이트
        await db.executeQuery(
          `UPDATE TB_USER 
           SET SIGN_IMG_URL = ?, MOD_ID = ?, MOD_DT = NOW() 
           WHERE USER_NO = ?`,
          [fileUrl, cleanUserNo, cleanUserNo]
        );

        // 2. TB_TERMS_AGREE_SIGN의 서명 정보 갱신
        await db.executeQuery(
          `UPDATE TB_TERMS_AGREE_SIGN 
           SET SIGN_FILE_NM = ?, SIGN_FILE_PATH = ?, SIGN_FILE_URL = ?, MOD_ID = ?, MOD_DT = NOW()
           WHERE USER_NO = ? AND TERMS_CD = 'SIGNATURE'`,
          [fileName, filePath, fileUrl, cleanUserNo, cleanUserNo]
        );

        return {
          status: 200,
          data: {
            success: true,
            code: 'OK',
            message: '자필 전자서명이 성공적으로 갱신되었습니다.',
            data: {
              userNo: cleanUserNo,
              signImgUrl: fileUrl,
              signFileNm: fileName,
              updatedAt: new Date().toISOString()
            }
          }
        };
      }
    } catch (err) {
      console.error('[UPDATE_SIGNATURE_ERR_WEB]', err);
      return {
        status: 500,
        data: {
          success: false,
          code: 'ERR_UPDATE_SIGNATURE',
          message: '서명 갱신 중 오류가 발생했습니다: ' + (err.message || err)
        }
      };
    }
  }

  // =========================================================================
  // 2. 고객 회원 정보 및 약관 동의 내역 조회 (action === 'GET_PROFILE' or default)
  // =========================================================================
  try {
    if (db && typeof db.executeQuery === 'function') {
      // 2-1. 회원 기본 정보 조회
      const userRows = await db.executeQuery(
        `SELECT USER_NO, USER_ROLE_CD, USER_NM, USER_EMAIL, USER_TEL, SIGN_IMG_URL, REG_DT, USER_STAT_CD
         FROM TB_USER
         WHERE USER_NO = ?
         LIMIT 1`,
        [cleanUserNo]
      );

      if (userRows && userRows.length > 0) {
        const user = userRows[0];
        let regDtStr = '';
        if (user.REG_DT) {
          const d = new Date(user.REG_DT);
          regDtStr = isNaN(d.getTime())
            ? String(user.REG_DT)
            : d.toISOString().replace('T', ' ').slice(0, 19);
        }

        // 2-2. 약관 동의 및 전자서명 상세 내역 조회 (TB_TERMS_AGREE_SIGN JOIN TB_TERMS_MASTER)
        const termsRows = await db.executeQuery(
          `SELECT 
            a.AGREE_SEQ, a.USER_ROLE_CD, a.USER_NO, a.TERMS_CD, a.TERMS_VER,
            a.AGREE_YN, a.AGREE_DT, a.SIGN_FILE_NM, a.SIGN_FILE_PATH, a.SIGN_FILE_URL,
            a.CLIENT_IP, a.DEVICE_INFO, a.REG_DT as SIGN_REG_DT,
            COALESCE(m.TERMS_TITLE, a.TERMS_CD) as TERMS_TITLE,
            COALESCE(m.MANDATORY_YN, 'Y') as MANDATORY_YN
           FROM TB_TERMS_AGREE_SIGN a
           LEFT JOIN TB_TERMS_MASTER m 
             ON a.TERMS_CD = m.TERMS_CD AND a.TERMS_VER = m.TERMS_VER
           WHERE a.USER_NO = ?
           ORDER BY a.AGREE_SEQ ASC`,
          [cleanUserNo]
        );

        // 약관 리스트 포맷팅
        const termsAgreedList = (termsRows || []).map((t) => {
          let agreeDtStr = '';
          if (t.AGREE_DT) {
            const d = new Date(t.AGREE_DT);
            agreeDtStr = isNaN(d.getTime()) ? String(t.AGREE_DT) : d.toISOString().replace('T', ' ').slice(0, 19);
          }
          return {
            agreeSeq: t.AGREE_SEQ,
            termsCd: t.TERMS_CD,
            termsVer: t.TERMS_VER,
            termsTitle: t.TERMS_TITLE,
            mandatoryYn: t.MANDATORY_YN,
            agreeYn: t.AGREE_YN,
            agreeDt: agreeDtStr,
            signFileNm: t.SIGN_FILE_NM,
            signFileUrl: t.SIGN_FILE_URL
          };
        });

        return {
          status: 200,
          data: {
            success: true,
            code: 'OK',
            data: {
              userNo: user.USER_NO,
              userRoleCd: user.USER_ROLE_CD || 'C',
              userNm: user.USER_NM || '고객',
              userEmail: user.USER_EMAIL || '',
              userTel: user.USER_TEL || '',
              signImgUrl: user.SIGN_IMG_URL || null,
              regDt: regDtStr,
              termsAgreedList,
              termsCount: termsAgreedList.length
            },
            message: '고객 정보 및 이용약관 동의 내역 조회가 완료되었습니다.'
          }
        };
      } else {
        return {
          status: 404,
          data: {
            success: false,
            code: 'ERR_USER_NOT_FOUND',
            message: '고객 회원 정보를 찾을 수 없습니다.'
          }
        };
      }
    }
  } catch (dbErr) {
    console.warn('[API_WEB_CLNT_ATH_011] DB 조회 중 오류:', dbErr.message);
  }

  // 모의 폴백
  return {
    status: 200,
    data: {
      success: true,
      code: 'OK',
      data: {
        userNo: cleanUserNo,
        userRoleCd: 'C',
        userNm: '홍길동',
        userEmail: 'hong.gd@example.com',
        userTel: '010-1234-5678',
        signImgUrl: null,
        regDt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        termsAgreedList: [
          { termsCd: 'SERVICE', termsVer: 'v1.0', termsTitle: '서비스 통합이용약관', mandatoryYn: 'Y', agreeYn: 'Y', agreeDt: new Date().toISOString() },
          { termsCd: 'PRIVACY', termsVer: 'v1.0', termsTitle: '개인정보 수집 및 이용 동의', mandatoryYn: 'Y', agreeYn: 'Y', agreeDt: new Date().toISOString() },
          { termsCd: 'LOCATION', termsVer: 'v1.0', termsTitle: '위치기반 서비스 이용약관', mandatoryYn: 'Y', agreeYn: 'Y', agreeDt: new Date().toISOString() },
          { termsCd: 'FINANCE', termsVer: 'v1.0', termsTitle: '전자금융거래 기본약관', mandatoryYn: 'Y', agreeYn: 'Y', agreeDt: new Date().toISOString() },
          { termsCd: 'SIGNATURE', termsVer: 'v1.0', termsTitle: '전자거래 및 자필 전자서명 보증 동의', mandatoryYn: 'Y', agreeYn: 'Y', agreeDt: new Date().toISOString() }
        ],
        termsCount: 5
      },
      message: '고객 정보 조회가 완료되었습니다. (시뮬레이션 모드)'
    }
  };
}

/**
 * Next.js App Router POST 핸들러
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await processWebClntAth011(payload);
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API_WEB_CLNT_ATH_011_POST_ERR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'ERR_INTERNAL_SERVER',
        message: '서버 내부 오류가 발생했습니다.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
