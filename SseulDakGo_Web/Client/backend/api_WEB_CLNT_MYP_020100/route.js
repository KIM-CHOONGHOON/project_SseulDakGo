/**
 * ============================================================================
 * [백엔드 API] 화면 ID: WEB-CLNT-MYP-020100 / APP-CLNT-MYP-020100
 * 파일 경로: SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_020100/route.js
 * 설명:
 *   - 시공사 파트너 전문 자격증 · 수료증 · 경력 검증 관리 및 신뢰 뱃지 자동 부여 엔진
 *   - 테이블: TB_USER, TB_SERVICE_CERT, TB_SERVICE_BADGE, TB_COM_CODE, TB_COM_CODE_GRP
 *   - 5대 엔드포인트:
 *     1) GET   /api/v1/common-codes/certifications
 *     2) GET   /api/v1/services/:srvcNo/certifications
 *     3) POST  /api/v1/services/:srvcNo/certifications/upload
 *     4) PUT   /api/v1/services/:srvcNo/certifications (Batch Sync / Upsert & Transaction)
 *     5) PATCH /api/v1/admin/services/certifications/:certSeq/review (심사 승인/반려 & 뱃지 산정)
 * ============================================================================
 */

import path from 'path';
import fs from 'fs';
import { executeQuery, executeTransaction } from '../../../../lib/db.js';

// ============================================================================
// 1. 공통 코드 조회 API
// GET /api/v1/common-codes/certifications?srvcNo=...&mainServiceCat=...
// ============================================================================
export async function getCertificationCommonCodes({ mainServiceCat = 'APPLIANCE', srvcNo = null } = {}) {
  try {
    let targetCat = mainServiceCat;
    if (srvcNo) {
      const userRows = await executeQuery(
        'SELECT MAIN_CLEAN_LARGE_CD FROM TB_USER WHERE USER_NO = ? LIMIT 1',
        [srvcNo]
      );
      if (userRows.length > 0 && userRows[0].MAIN_CLEAN_LARGE_CD) {
        targetCat = userRows[0].MAIN_CLEAN_LARGE_CD;
      }
    }

    const allCodes = await executeQuery(`
      SELECT GRP_CD, COM_CD, COM_NM, PARENT_COM_CD, ATTR_VAL1, ATTR_VAL2, SORT_ORD, USE_YN
      FROM TB_COM_CODE
      WHERE GRP_CD IN ('CERT_DOC_TYPE', 'BADGE_TYPE', 'REVIEW_STATUS', 'CERT_MASTER_CODE')
        AND USE_YN = 'Y'
      ORDER BY GRP_CD, SORT_ORD ASC
    `);

    const docTypes = allCodes.filter((c) => c.GRP_CD === 'CERT_DOC_TYPE');
    const badgeTypes = allCodes.filter((c) => c.GRP_CD === 'BADGE_TYPE');
    const reviewStatuses = allCodes.filter((c) => c.GRP_CD === 'REVIEW_STATUS');
    const rawMasterList = allCodes.filter((c) => c.GRP_CD === 'CERT_MASTER_CODE');

    // 정렬 우선순위:
    // 1) PARENT_COM_CD = targetCat
    // 2) 기타 카테고리 (단, ETC_DIRECT_INPUT 제외)
    // 3) ETC_DIRECT_INPUT (항상 맨 마지막)
    const certMasterList = [...rawMasterList].sort((a, b) => {
      if (a.COM_CD === 'ETC_DIRECT_INPUT') return 1;
      if (b.COM_CD === 'ETC_DIRECT_INPUT') return -1;
      if (a.PARENT_COM_CD === targetCat && b.PARENT_COM_CD !== targetCat) return -1;
      if (a.PARENT_COM_CD !== targetCat && b.PARENT_COM_CD === targetCat) return 1;
      return (a.SORT_ORD || 0) - (b.SORT_ORD || 0);
    });

    return {
      success: true,
      data: {
        docTypes,
        badgeTypes,
        reviewStatuses,
        certMasterList,
        targetCategory: targetCat,
      },
    };
  } catch (err) {
    console.error('❌ [getCertificationCommonCodes Error]:', err);
    return { success: false, code: 'ERR_FETCH_CODES', message: err.message };
  }
}

// ============================================================================
// 2. 시공사 자격 및 서류 목록 조회 API
// GET /api/v1/services/:srvcNo/certifications
// ============================================================================
export async function getServiceCertifications(srvcNo) {
  if (!srvcNo) {
    return { success: false, code: 'ERR_INVALID_PARAM', message: '시공사 회원번호(srvcNo)가 필요합니다.' };
  }

  try {
    // 1. 시공사 유효성 검증
    const userRows = await executeQuery(
      `SELECT USER_NO, USER_ROLE_CD, USER_NM, COMPANY_NM, BIZ_NO, MAIN_CLEAN_LARGE_CD, CERT_BADGE_CODES
       FROM TB_USER
       WHERE USER_NO = ? AND USER_ROLE_CD = 'S'
       LIMIT 1`,
      [srvcNo]
    );

    if (!userRows || userRows.length === 0) {
      return { success: false, code: 'ERR_SERVICE_NOT_FOUND', message: '등록된 인증 시공사(S) 계정을 찾을 수 없습니다.' };
    }

    const user = userRows[0];

    // 2. 활성 뱃지 목록 조회 (TB_SERVICE_BADGE)
    const badgeRows = await executeQuery(
      `SELECT BADGE_TYPE_CD, SOURCE_CERT_SEQ, GRANTED_DT
       FROM TB_SERVICE_BADGE
       WHERE SRVC_NO = ? AND ACTIVE_YN = 'Y'
       ORDER BY BADGE_SEQ ASC`,
      [srvcNo]
    );
    const activeBadges = badgeRows.map((b) => b.BADGE_TYPE_CD);

    // 3. 자격/수료증 목록 조회 (TB_SERVICE_CERT)
    const certRows = await executeQuery(
      `SELECT 
         CERT_SEQ, SRVC_NO, DOC_TYPE_CD, CERT_MASTER_CD, CUSTOM_CERT_NM,
         ISSUER_NM, ISSUED_YM, STORAGE_PATH, FILE_URL, LOGICAL_FILE_NM,
         PHYSICAL_FILE_NM, FILE_EXT, FILE_SIZE_BYTE, PRIVACY_MASK_YN,
         REVIEW_STAT_CD, REJECT_REASON, REVIEW_ADMIN_ID, REVIEW_DT, REG_DT
       FROM TB_SERVICE_CERT
       WHERE SRVC_NO = ?
       ORDER BY CERT_SEQ ASC`,
      [srvcNo]
    );

    const certifications = certRows.map((row) => ({
      certSeq: row.CERT_SEQ,
      srvcNo: row.SRVC_NO,
      docType: row.DOC_TYPE_CD,
      certCode: row.CERT_MASTER_CD,
      customCertName: row.CUSTOM_CERT_NM,
      issuerName: row.ISSUER_NM,
      issuedDate: row.ISSUED_YM,
      storagePath: row.STORAGE_PATH,
      fileUrl: row.FILE_URL,
      fileName: row.LOGICAL_FILE_NM,
      fileExt: row.FILE_EXT,
      fileSize: row.FILE_SIZE_BYTE,
      privacyMaskYn: row.PRIVACY_MASK_YN,
      reviewStatus: row.REVIEW_STAT_CD,
      rejectReason: row.REJECT_REASON,
      reviewAdminId: row.REVIEW_ADMIN_ID,
      reviewDate: row.REVIEW_DT ? new Date(row.REVIEW_DT).toISOString().slice(0, 10) : null,
      registeredDate: row.REG_DT ? new Date(row.REG_DT).toISOString().slice(0, 10) : null,
    }));

    return {
      success: true,
      data: {
        srvcNo: user.USER_NO,
        companyNm: user.COMPANY_NM || '(주)공간다원',
        bizNo: user.BIZ_NO || '214-88-02482',
        userName: user.USER_NM || '공간다원',
        mainCleanLargeCd: user.MAIN_CLEAN_LARGE_CD || 'APPLIANCE',
        bizVerifiedYn: 'Y',
        bizVerifiedDate: '2026-11-15',
        badges: activeBadges,
        certBadgeCodes: user.CERT_BADGE_CODES,
        certifications,
      },
    };
  } catch (err) {
    console.error('❌ [getServiceCertifications Error]:', err);
    return { success: false, code: 'ERR_FETCH_CERTS', message: err.message };
  }
}

// ============================================================================
// 3. 자격 서류 파일 업로드 처리기
// POST /api/v1/services/:srvcNo/certifications/upload
// 보관 폴더 규칙: C:\SseulDakGo_Storage\{USER_NO}\{DOC_TYPE}\ (LICENSE, COMPLETION, CAREER)
// ============================================================================
export async function uploadCertificationFile({ srvcNo, docType = 'LICENSE', fileData, fileName, mimeType, fileSize }) {
  if (!srvcNo || !fileData) {
    return { success: false, code: 'ERR_MISSING_FILE', message: '업로드할 파일 데이터가 누락되었습니다.' };
  }

  try {
    // 10MB 크기 제한
    const MAX_SIZE = 10 * 1024 * 1024;
    const actualSize = fileSize || fileData.length;
    if (actualSize > MAX_SIZE) {
      return { success: false, code: 'ERR_FILE_TOO_LARGE', message: '파일 크기는 최대 10MB 이하만 허용됩니다.' };
    }

    const extMatch = (fileName || '').match(/\.([a-zA-Z0-9]+)$/);
    const fileExt = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(fileExt)) {
      return { success: false, code: 'ERR_UNSUPPORTED_TYPE', message: 'JPG, PNG, PDF 형식만 업로드 가능합니다.' };
    }

    // 증빙구분별 하위 폴더 결정 (LICENSE / COMPLETION / CAREER)
    const validDocType = ['LICENSE', 'COMPLETION', 'CAREER'].includes(docType) ? docType : 'LICENSE';

    // 저장 디렉터리: C:\SseulDakGo_Storage\{srvcNo}\{validDocType}\
    const storageRoot = process.env.STORAGE_LOCAL_ROOT || 'C:\\SseulDakGo_Storage';
    const relDir = path.join(srvcNo, validDocType);
    const targetDir = path.join(storageRoot, relDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = Date.now();
    const physicalFileNm = `${validDocType.toLowerCase()}_${srvcNo}_${timestamp}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const targetFilePath = path.join(targetDir, physicalFileNm);

    // base64 또는 Buffer 변환
    let fileBuffer;
    if (Buffer.isBuffer(fileData)) {
      fileBuffer = fileData;
    } else if (typeof fileData === 'string') {
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new Error('올바른 파일 버퍼 또는 base64 데이터가 아닙니다.');
    }

    fs.writeFileSync(targetFilePath, fileBuffer);

    const storagePath = path.join(relDir, physicalFileNm).replace(/\\/g, '/');
    const fileUrl = `/storage/${storagePath}`;

    return {
      success: true,
      data: {
        storagePath,
        fileUrl,
        logicalFileNm: fileName || physicalFileNm,
        physicalFileNm,
        fileExt,
        fileSizeByte: fileBuffer.length,
      },
    };
  } catch (err) {
    console.error('❌ [uploadCertificationFile Error]:', err);
    return { success: false, code: 'ERR_UPLOAD_FAILED', message: err.message };
  }
}

// ============================================================================
// 4. 자격증 배치 동기화 (Upsert / Delete / 상태 리셋 / 트랜잭션)
// PUT /api/v1/services/:srvcNo/certifications
// ============================================================================
export async function saveServiceCertifications(srvcNo, { certifications = [] } = {}) {
  if (!srvcNo) {
    return { success: false, code: 'ERR_INVALID_PARAM', message: '시공사 회원번호(srvcNo)가 필요합니다.' };
  }

  // 1. 최대 5건 제한
  if (!Array.isArray(certifications) || certifications.length > 5) {
    return { success: false, code: 'ERR_EXCEEDS_LIMIT', message: '자격증 및 수료증은 최대 5건까지 등록 가능합니다.' };
  }

  // 2. 입력값 유효성 사전 검증
  for (let idx = 0; idx < certifications.length; idx++) {
    const item = certifications[idx];
    if (!['LICENSE', 'COMPLETION', 'CAREER'].includes(item.docType)) {
      return { success: false, code: 'ERR_INVALID_DOCTYPE', message: `항목 #${idx + 1}의 증빙 구분이 올바르지 않습니다.` };
    }
    if (!item.certCode) {
      return { success: false, code: 'ERR_EMPTY_CERTCODE', message: `항목 #${idx + 1}의 자격/수료명을 선택해주세요.` };
    }
    if (item.certCode === 'ETC_DIRECT_INPUT' && (!item.customCertName || !item.customCertName.trim())) {
      return { success: false, code: 'ERR_CUSTOM_NAME_REQUIRED', message: `항목 #${idx + 1}의 직접 입력 자격명을 입력해주세요.` };
    }
    if (!item.issuerName || !item.issuerName.trim()) {
      return { success: false, code: 'ERR_ISSUER_REQUIRED', message: `항목 #${idx + 1}의 발급기관명을 입력해주세요.` };
    }
    if (item.privacyMaskYn !== 'Y') {
      return { success: false, code: 'ERR_PRIVACY_MASK_REQUIRED', message: `항목 #${idx + 1}의 주민등록번호 뒷자리 마스킹 확인에 동의하셔야 합니다.` };
    }
  }

  // 3. 트랜잭션 내에서 Upsert 및 뱃지 재계산
  try {
    const result = await executeTransaction(async (conn) => {
      // (1) 기존 DB 등록 항목 조회
      const [existingRows] = await conn.execute(
        `SELECT CERT_SEQ, DOC_TYPE_CD, CERT_MASTER_CD, FILE_URL, REVIEW_STAT_CD
         FROM TB_SERVICE_CERT
         WHERE SRVC_NO = ?`,
        [srvcNo]
      );
      const existingMap = new Map();
      existingRows.forEach((r) => existingMap.set(Number(r.CERT_SEQ), r));

      const incomingSeqs = new Set();

      // (2) 들어온 항목별 신규 삽입 or 변경 처리
      for (const item of certifications) {
        const certSeq = item.certSeq ? Number(item.certSeq) : null;
        const customName = item.certCode === 'ETC_DIRECT_INPUT' ? (item.customCertName || '').trim() : null;

        if (certSeq && existingMap.has(certSeq)) {
          incomingSeqs.add(certSeq);
          const oldRow = existingMap.get(certSeq);

          // 상태 리셋 정책:
          // - 반려(REJECTED) 상태였던 항목을 파트너가 수정 시 -> PENDING으로 리셋, 반려사유 제거
          // - 승인(APPROVED) 상태였던 항목의 핵심 내용(구분, 자격명, 파일) 변경 시 -> PENDING으로 리셋
          let nextStatus = oldRow.REVIEW_STAT_CD;
          let resetReject = false;

          if (oldRow.REVIEW_STAT_CD === 'REJECTED') {
            nextStatus = 'PENDING';
            resetReject = true;
          } else if (
            oldRow.REVIEW_STAT_CD === 'APPROVED' &&
            (oldRow.DOC_TYPE_CD !== item.docType ||
              oldRow.CERT_MASTER_CD !== item.certCode ||
              oldRow.FILE_URL !== (item.fileUrl || ''))
          ) {
            nextStatus = 'PENDING';
          }

          await conn.execute(
            `UPDATE TB_SERVICE_CERT
             SET DOC_TYPE_CD = ?,
                 CERT_MASTER_CD = ?,
                 CUSTOM_CERT_NM = ?,
                 ISSUER_NM = ?,
                 ISSUED_YM = ?,
                 STORAGE_PATH = COALESCE(?, STORAGE_PATH),
                 FILE_URL = COALESCE(?, FILE_URL),
                 LOGICAL_FILE_NM = COALESCE(?, LOGICAL_FILE_NM),
                 PHYSICAL_FILE_NM = COALESCE(?, PHYSICAL_FILE_NM),
                 FILE_EXT = COALESCE(?, FILE_EXT),
                 FILE_SIZE_BYTE = COALESCE(?, FILE_SIZE_BYTE),
                 PRIVACY_MASK_YN = 'Y',
                 REVIEW_STAT_CD = ?,
                 REJECT_REASON = CASE WHEN ? THEN NULL ELSE REJECT_REASON END,
                 MOD_DT = NOW(),
                 MOD_ID = ?
             WHERE CERT_SEQ = ? AND SRVC_NO = ?`,
            [
              item.docType,
              item.certCode,
              customName,
              item.issuerName.trim(),
              item.issuedDate || null,
              item.storagePath || null,
              item.fileUrl || null,
              item.fileName || null,
              item.physicalFileNm || null,
              item.fileExt || null,
              item.fileSize || null,
              nextStatus,
              resetReject,
              srvcNo,
              certSeq,
              srvcNo,
            ]
          );
        } else {
          // 신규 추가 (INSERT) -> 무조건 PENDING
          const [insResult] = await conn.execute(
            `INSERT INTO TB_SERVICE_CERT (
               SRVC_NO, DOC_TYPE_CD, CERT_MASTER_CD, CUSTOM_CERT_NM,
               ISSUER_NM, ISSUED_YM, STORAGE_PATH, FILE_URL, LOGICAL_FILE_NM,
               PHYSICAL_FILE_NM, FILE_EXT, FILE_SIZE_BYTE, PRIVACY_MASK_YN,
               REVIEW_STAT_CD, REG_DT, REG_ID, MOD_DT, MOD_ID
             ) VALUES (
               ?, ?, ?, ?,
               ?, ?, COALESCE(?, '/storage/certs/dummy.pdf'), COALESCE(?, '/logo.png'), COALESCE(?, '자격서류.pdf'),
               COALESCE(?, 'dummy.pdf'), COALESCE(?, 'pdf'), COALESCE(?, 1024), 'Y',
               'PENDING', NOW(), ?, NOW(), ?
             )`,
            [
              srvcNo,
              item.docType,
              item.certCode,
              customName,
              item.issuerName.trim(),
              item.issuedDate || null,
              item.storagePath || null,
              item.fileUrl || null,
              item.fileName || null,
              item.physicalFileNm || null,
              item.fileExt || null,
              item.fileSize || null,
              srvcNo,
              srvcNo,
            ]
          );
          incomingSeqs.add(insResult.insertId);
        }
      }

      // (3) 삭제된 항목 정리 (기존 DB에는 있으나 요청에서 제외된 항목)
      for (const [seq] of existingMap) {
        if (!incomingSeqs.has(seq)) {
          // 삭제 전 연결된 뱃지 정리
          await conn.execute(
            `UPDATE TB_SERVICE_BADGE SET ACTIVE_YN = 'N', MOD_DT = NOW(), MOD_ID = 'SYSTEM'
             WHERE SRVC_NO = ? AND SOURCE_CERT_SEQ = ?`,
            [srvcNo, seq]
          );
          await conn.execute('DELETE FROM TB_SERVICE_CERT WHERE CERT_SEQ = ? AND SRVC_NO = ?', [seq, srvcNo]);
        }
      }

      // (4) 뱃지 자동 평가 및 동기화 엔진 실행
      const activeBadges = await recalculatePartnerBadgesInTx(conn, srvcNo);

      return {
        savedCount: incomingSeqs.size,
        activeBadges,
      };
    });

    return {
      success: true,
      message: '자격증 및 수료증 서류가 안전하게 저장되었습니다.',
      data: result,
    };
  } catch (err) {
    console.error('❌ [saveServiceCertifications Error]:', err);
    return { success: false, code: 'ERR_SAVE_FAILED', message: err.message };
  }
}

// ============================================================================
// 5. 관리자 서류 심사 및 뱃지 자동 연동 엔진
// PATCH /api/v1/admin/services/certifications/:certSeq/review
// ============================================================================
export async function reviewServiceCertification(certSeq, { reviewStatus, rejectReason, adminId = 'ADMIN' } = {}) {
  if (!certSeq) {
    return { success: false, code: 'ERR_INVALID_PARAM', message: '자격 일련번호(certSeq)가 필요합니다.' };
  }
  if (!['APPROVED', 'REJECTED'].includes(reviewStatus)) {
    return { success: false, code: 'ERR_INVALID_STATUS', message: '심사 상태는 APPROVED 또는 REJECTED여야 합니다.' };
  }
  if (reviewStatus === 'REJECTED' && (!rejectReason || !rejectReason.trim())) {
    return { success: false, code: 'ERR_REJECT_REASON_REQUIRED', message: '반려 시에는 반드시 반려 사유를 입력해야 합니다.' };
  }

  try {
    const result = await executeTransaction(async (conn) => {
      // 1. 해당 자격증 존재 여부 및 srvcNo 확인
      const [rows] = await conn.execute(
        'SELECT CERT_SEQ, SRVC_NO, DOC_TYPE_CD FROM TB_SERVICE_CERT WHERE CERT_SEQ = ?',
        [certSeq]
      );
      if (rows.length === 0) {
        throw new Error('심사 대상 자격증 정보를 찾을 수 없습니다.');
      }
      const cert = rows[0];
      const srvcNo = cert.SRVC_NO;

      // 2. 자격증 상태 갱신
      await conn.execute(
        `UPDATE TB_SERVICE_CERT
         SET REVIEW_STAT_CD = ?,
             REJECT_REASON = ?,
             REVIEW_ADMIN_ID = ?,
             REVIEW_DT = NOW(),
             MOD_DT = NOW(),
             MOD_ID = ?
         WHERE CERT_SEQ = ?`,
        [reviewStatus, reviewStatus === 'REJECTED' ? rejectReason.trim() : null, adminId, adminId, certSeq]
      );

      // 3. 뱃지 재계산 엔진 호출
      const activeBadges = await recalculatePartnerBadgesInTx(conn, srvcNo);

      return {
        certSeq,
        srvcNo,
        reviewStatus,
        activeBadges,
      };
    });

    return {
      success: true,
      message: reviewStatus === 'APPROVED' ? '자격증 심사가 승인되었습니다.' : '자격증이 반려 처리되었습니다.',
      data: result,
    };
  } catch (err) {
    console.error('❌ [reviewServiceCertification Error]:', err);
    return { success: false, code: 'ERR_REVIEW_FAILED', message: err.message };
  }
}

// ============================================================================
// [내부 엔진] 뱃지 자동 계산 트랜잭션 헬퍼
// recalculatePartnerBadgesInTx
// ============================================================================
async function recalculatePartnerBadgesInTx(conn, srvcNo) {
  // 1. 승인된(APPROVED) 모든 자격증 항목 조회
  const [approvedCerts] = await conn.execute(
    `SELECT CERT_SEQ, DOC_TYPE_CD
     FROM TB_SERVICE_CERT
     WHERE SRVC_NO = ? AND REVIEW_STAT_CD = 'APPROVED'`,
    [srvcNo]
  );

  const docTypeMap = {
    COMPLETION: null, // BADGE_PRO_EDU
    LICENSE: null,    // BADGE_CERTIFIED
    CAREER: null,     // BADGE_MASTER
  };

  for (const c of approvedCerts) {
    if (c.DOC_TYPE_CD in docTypeMap && !docTypeMap[c.DOC_TYPE_CD]) {
      docTypeMap[c.DOC_TYPE_CD] = c.CERT_SEQ;
    }
  }

  // 2. 3대 뱃지 활성화/비활성화
  const badgeDefinitions = [
    { type: 'BADGE_PRO_EDU', hasApproved: Boolean(docTypeMap.COMPLETION), certSeq: docTypeMap.COMPLETION },
    { type: 'BADGE_CERTIFIED', hasApproved: Boolean(docTypeMap.LICENSE), certSeq: docTypeMap.LICENSE },
    { type: 'BADGE_MASTER', hasApproved: Boolean(docTypeMap.CAREER), certSeq: docTypeMap.CAREER },
  ];

  const activeBadgeList = [];

  for (const b of badgeDefinitions) {
    if (b.hasApproved) {
      activeBadgeList.push(b.type);
      // 기존 뱃지 존재 여부 확인 후 Upsert
      const [exBadge] = await conn.execute(
        `SELECT BADGE_SEQ FROM TB_SERVICE_BADGE WHERE SRVC_NO = ? AND BADGE_TYPE_CD = ? LIMIT 1`,
        [srvcNo, b.type]
      );
      if (exBadge.length > 0) {
        await conn.execute(
          `UPDATE TB_SERVICE_BADGE
           SET ACTIVE_YN = 'Y',
               SOURCE_CERT_SEQ = ?,
               GRANTED_DT = NOW(),
               MOD_DT = NOW(),
               MOD_ID = 'SYSTEM'
           WHERE BADGE_SEQ = ?`,
          [b.certSeq, exBadge[0].BADGE_SEQ]
        );
      } else {
        await conn.execute(
          `INSERT INTO TB_SERVICE_BADGE (
             SRVC_NO, BADGE_TYPE_CD, SOURCE_CERT_SEQ, ACTIVE_YN, GRANTED_DT, REG_DT, REG_ID, MOD_DT, MOD_ID
           ) VALUES (?, ?, ?, 'Y', NOW(), NOW(), 'SYSTEM', NOW(), 'SYSTEM')`,
          [srvcNo, b.type, b.certSeq]
        );
      }
    } else {
      // 자격이 없으면 비활성화
      await conn.execute(
        `UPDATE TB_SERVICE_BADGE
         SET ACTIVE_YN = 'N', MOD_DT = NOW(), MOD_ID = 'SYSTEM'
         WHERE SRVC_NO = ? AND BADGE_TYPE_CD = ?`,
        [srvcNo, b.type]
      );
    }
  }

  // 3. TB_USER.CERT_BADGE_CODES 캐시 갱신
  const badgeCodesStr = activeBadgeList.length > 0 ? activeBadgeList.join(',') : null;
  await conn.execute(
    `UPDATE TB_USER
     SET CERT_BADGE_CODES = ?,
         MOD_DT = NOW()
     WHERE USER_NO = ?`,
    [badgeCodesStr, srvcNo]
  );

  return activeBadgeList;
}

// ============================================================================
// 통합 진입점 핸들러 (Express Route & API Dispatcher)
// ============================================================================
export async function processWebClntMyp020100(body = {}, query = {}, method = 'GET') {
  const action = body.action || query.action || 'GET_CERTIFICATIONS';
  const srvcNo = body.srvcNo || query.srvcNo || 'S20261100001';

  try {
    switch (action) {
      case 'GET_COMMON_CODES':
        return await getCertificationCommonCodes({
          mainServiceCat: query.mainServiceCat || body.mainServiceCat || 'APPLIANCE',
          srvcNo,
        });

      case 'GET_CERTIFICATIONS':
        return await getServiceCertifications(srvcNo);

      case 'UPLOAD_CERT_FILE':
        return await uploadCertificationFile({
          srvcNo,
          fileData: body.fileData,
          fileName: body.fileName,
          mimeType: body.mimeType,
          fileSize: body.fileSize,
        });

      case 'SAVE_CERTIFICATIONS':
      case 'SYNC_CERTIFICATIONS':
        return await saveServiceCertifications(srvcNo, {
          certifications: body.certifications || [],
        });

      case 'REVIEW_CERTIFICATION':
        return await reviewServiceCertification(body.certSeq || query.certSeq, {
          reviewStatus: body.reviewStatus,
          rejectReason: body.rejectReason,
          adminId: body.adminId || 'ADMIN',
        });

      default:
        // 기본 조회
        return await getServiceCertifications(srvcNo);
    }
  } catch (err) {
    console.error(`❌ [processWebClntMyp020100 Error - action: ${action}]:`, err);
    return {
      success: false,
      code: 'ERR_PROCESS_FAILED',
      message: err.message || '서버 처리 중 오류가 발생했습니다.',
    };
  }
}
