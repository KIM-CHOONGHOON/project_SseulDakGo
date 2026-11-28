import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { executeQuery, executeTransaction } from '../../../../lib/db.ts';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const STORAGE_ROOT = 'C:\\SseulDakGo_Storage\\project\\partner_logo';

function sanitizeFileName(rawName) {
  const base = path.basename(String(rawName || 'logo.png')).replace(/[\\/:*?"<>|]/g, '_');
  return base || 'logo.png';
}

function buildStoredFileName(userNo, ext) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LOGO_${userNo}_${ts}_${rand}.${ext}`;
}

export async function handleGetPartnerLogo(userNo) {
  const rows = await executeQuery(
    `SELECT U.USER_NO, U.USER_ROLE_CD, U.USER_STAT_CD, U.USER_NM AS COMPANY_NM, U.PROFILE_IMG_URL,
            DATE_FORMAT(U.MOD_DT, '%Y-%m-%d %H:%i:%s') AS updatedAt
       FROM TB_USER U
      WHERE U.USER_NO = ?
      LIMIT 1`,
    [userNo]
  );
  if (!rows || rows.length === 0) {
    return { status: 404, body: { success: false, message: '시공사 회원 정보를 찾을 수 없습니다.' } };
  }
  const u = rows[0];
  return {
    status: 200,
    body: {
      success: true,
      logoUrl: u.PROFILE_IMG_URL || null,
      data: {
        userNo: u.USER_NO,
        companyNm: u.COMPANY_NM || '(주)클린파트너스',
        currentLogoUrl: u.PROFILE_IMG_URL || null,
        origFileName: null,
        storedFileName: null,
        fileSize: null,
        updatedAt: u.updatedAt || null,
      },
    },
  };
}

export async function handleUploadPartnerLogo({ userNo, origName, mimeType, buffer }) {
  if (!userNo) {
    return { status: 401, body: { success: false, message: '로그인이 필요합니다.' } };
  }
  let userRows = await executeQuery(
    `SELECT USER_NO, USER_ROLE_CD, USER_STAT_CD FROM TB_USER WHERE USER_NO = ? LIMIT 1`,
    [userNo]
  );
  if ((!userRows || userRows.length === 0) && userNo.startsWith('S')) {
    await executeQuery(
      `INSERT IGNORE INTO TB_USER (USER_NO, USER_ROLE_CD, USER_NM, USER_STAT_CD, REG_ID, MOD_ID)
       VALUES (?, 'S', '시공사 파트너', 'NORMAL', ?, ?)`,
      [userNo, userNo, userNo]
    );
    userRows = await executeQuery(
      `SELECT USER_NO, USER_ROLE_CD, USER_STAT_CD FROM TB_USER WHERE USER_NO = ? LIMIT 1`,
      [userNo]
    );
  }
  if (!userRows || userRows.length === 0 || !['S', 'SERVICE'].includes(userRows[0].USER_ROLE_CD) || ['SUSPENDED', 'WITHDRAWN', 'BLOCKED'].includes(userRows[0].USER_STAT_CD)) {
    return { status: 403, body: { success: false, message: '정상 상태의 시공사 회원만 대표 로고를 변경할 수 있습니다.' } };
  }
  if (!buffer || buffer.length === 0) {
    return { status: 400, body: { success: false, message: '업로드할 로고 이미지 파일이 없습니다.' } };
  }
  if (buffer.length > MAX_LOGO_BYTES) {
    return { status: 400, body: { success: false, code: 'ERR_LOGO_SIZE_EXCEEDED', message: '파일 크기는 5MB 이하만 업로드 됩니다' } };
  }

  const safeOrig = sanitizeFileName(origName);
  const ext = path.extname(safeOrig).replace('.', '').toLowerCase() || 'png';
  if (!ALLOWED_EXTS.has(ext) || (mimeType && !ALLOWED_MIMES.has(mimeType))) {
    return { status: 400, body: { success: false, message: 'JPG, PNG, WEBP 형식의 이미지 파일만 허용됩니다.' } };
  }

  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const targetDir = path.join(STORAGE_ROOT, yyyymm, userNo);
  fs.mkdirSync(targetDir, { recursive: true });

  const storedFileName = buildStoredFileName(userNo, ext);
  const physPath = path.join(targetDir, storedFileName);
  const logoImgUrl = `/storage/project/partner_logo/${yyyymm}/${userNo}/${storedFileName}`;

  fs.writeFileSync(physPath, buffer);

  let oldPhysPath = null;
  try {
    await executeTransaction(async (conn) => {
      const [existing] = await conn.execute(
        `SELECT USER_NO, LOGO_PHYS_PATH FROM TB_SERVICE_DOC WHERE USER_NO = ? LIMIT 1`,
        [userNo]
      );
      if (existing && existing.length > 0) {
        oldPhysPath = existing[0].LOGO_PHYS_PATH;
        await conn.execute(
          `UPDATE TB_SERVICE_DOC
              SET LOGO_ORIG_FILE_NM = ?, LOGO_STORED_FILE_NM = ?, LOGO_PHYS_PATH = ?, LOGO_FILE_SIZE = ?, LOGO_EXT = ?,
                  MOD_ID = ?, MOD_DT = NOW()
            WHERE USER_NO = ?`,
          [safeOrig, storedFileName, physPath, buffer.length, ext, userNo, userNo]
        );
      } else {
        await conn.execute(
          `INSERT INTO TB_SERVICE_DOC
             (USER_NO, COMP_NM, CEO_NM, BIZ_REG_NO, VERIFY_YN,
              LOGO_ORIG_FILE_NM, LOGO_STORED_FILE_NM, LOGO_PHYS_PATH, LOGO_FILE_SIZE, LOGO_EXT, REG_DT, REG_ID, MOD_ID, MOD_DT)
           VALUES (?, '시공사 파트너', '대표자', '000-00-00000', 'Y', ?, ?, ?, ?, ?, NOW(), ?, ?, NOW())`,
          [userNo, safeOrig, storedFileName, physPath, buffer.length, ext, userNo, userNo]
        );
      }

      await conn.execute(
        `UPDATE TB_USER SET PROFILE_IMG_URL = ?, MOD_ID = ?, MOD_DT = NOW() WHERE USER_NO = ?`,
        [logoImgUrl, userNo, userNo]
      );
    });
  } catch (err) {
    if (fs.existsSync(physPath)) {
      fs.unlinkSync(physPath);
    }
    throw err;
  }

  if (oldPhysPath && oldPhysPath !== physPath && fs.existsSync(oldPhysPath)) {
    try {
      fs.unlinkSync(oldPhysPath);
    } catch (_) {}
  }

  const pad = (n) => String(n).padStart(2, '0');
  const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return {
    status: 200,
    body: {
      success: true,
      message: '파트너 대표 로고 이미지가 성공적으로 변경되었습니다.',
      data: {
        userNo,
        logoImgUrl,
        origFileName: safeOrig,
        storedFileName,
        fileSize: buffer.length,
        updatedAt,
      },
    },
  };
}

export async function handleResetPartnerLogo(userNo) {
  if (!userNo) {
    return { status: 401, body: { success: false, message: '로그인이 필요합니다.' } };
  }
  let oldPhysPath = null;
  await executeTransaction(async (conn) => {
    const [existing] = await conn.execute(
      `SELECT USER_NO, LOGO_PHYS_PATH FROM TB_SERVICE_DOC WHERE USER_NO = ? LIMIT 1`,
      [userNo]
    );
    if (existing && existing.length > 0) {
      oldPhysPath = existing[0].LOGO_PHYS_PATH;
      await conn.execute(
        `UPDATE TB_SERVICE_DOC
            SET LOGO_ORIG_FILE_NM = NULL, LOGO_STORED_FILE_NM = NULL, LOGO_PHYS_PATH = NULL, LOGO_FILE_SIZE = NULL, LOGO_EXT = NULL,
                MOD_ID = ?, MOD_DT = NOW()
          WHERE USER_NO = ?`,
        [userNo, userNo]
      );
    }
    await conn.execute(
      `UPDATE TB_USER SET PROFILE_IMG_URL = NULL, MOD_ID = ?, MOD_DT = NOW() WHERE USER_NO = ?`,
      [userNo, userNo]
    );
  });

  if (oldPhysPath && fs.existsSync(oldPhysPath)) {
    try {
      fs.unlinkSync(oldPhysPath);
    } catch (_) {}
  }

  return {
    status: 200,
    body: {
      success: true,
      message: '기본 공간다원 인증 파트너 뱃지로 초기화되었습니다.',
      data: { logoImgUrl: null },
    },
  };
}
