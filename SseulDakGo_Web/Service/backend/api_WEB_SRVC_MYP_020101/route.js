import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { executeQuery } from '../../../../lib/db.ts';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const { createWorker } = require('tesseract.js');

async function extractPdfText(buffer) {
  let text = '';
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    text = (data?.text || '').replace(/\r/g, '');
  } catch (_) {}

  if (!text.trim()) {
    try {
      const worker = await createWorker('kor+eng');
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      text = (data?.text || '').replace(/\r/g, '');
    } catch (_) {}
  }
  return text;
}

function parseHometaxPdfText(text) {
  const issueNo = (text.match(/(\d{4}\s*-\s*\d{3}\s*-\s*\d{4}\s*-\s*\d{3})/) || [])[1]?.replace(/\s+/g, '') || '';
  const bizNo = (text.match(/(\d{3}\s*-\s*\d{2}\s*-\s*\d{5})/) || [])[1]?.replace(/\s+/g, '') || '';
  const taxType = (text.match(/(일반과세자|간이과세자|면세사업자|법인사업자)/) || [])[1] || '일반과세자';
  const openDate = (text.match(/개\s*업\s*일[^\d]*(\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일)/) || text.match(/(\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일)/) || [])[1]?.replace(/\s+/g, ' ').trim() || '';
  const bizName = (text.match(/상\s*호\s*\(\s*법\s*인\s*명\s*\)\s*([^\r\n]+)/) || [])[1]?.trim() || '';
  const ceoName = (text.match(/대\s*표\s*자\s*성\s*명[^\r\n]*?\)\s*([^\r\n]+)/) || [])[1]?.trim() || '';
  const bizType = (text.match(/업\s*태\s*([^\r\n]+)/) || [])[1]?.trim() || '';
  const bizItem = (text.match(/종\s*목\s*([^\r\n]+)/) || [])[1]?.trim() || '';

  return {
    issueNo,
    bizName,
    ceoName,
    bizNo,
    openDateAndType: openDate ? `${openDate} (${taxType})` : `(${taxType})`,
    industryCode: '',
    industryName: [bizType, bizItem].filter(Boolean).join(' / '),
  };
}

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const STORAGE_ROOT = 'C:\\SseulDakGo_Storage\\project\\service_docs';

async function verifyContractorSession(userNo) {
  if (!userNo) return { ok: false, status: 401, message: '로그인이 필요합니다.' };
  const rows = await executeQuery(
    `SELECT USER_NO, USER_ROLE_CD, USER_STAT_CD FROM TB_USER WHERE USER_NO = ? LIMIT 1`,
    [userNo]
  );
  if (!rows || rows.length === 0) {
    return { ok: false, status: 404, message: '회원 정보를 찾을 수 없습니다.' };
  }
  const user = rows[0];
  if (user.USER_ROLE_CD !== 'S' || user.USER_STAT_CD !== 'NORMAL') {
    return { ok: false, status: 403, message: '정상 상태의 시공사 회원만 이용 가능합니다.' };
  }
  return { ok: true, user };
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userNo = url.searchParams.get('userNo') || '';
    if (!userNo) {
      return Response.json({ success: false, message: 'userNo가 필요합니다.' }, { status: 400 });
    }
    const rows = await executeQuery(
      `SELECT USER_NO, COMP_NM, CEO_NM, BIZ_REG_NO, OPEN_DT, TAX_TYPE_NM, IND_CD, IND_NM, VERIFY_YN
         FROM TB_SERVICE_DOC
        WHERE USER_NO = ?
        LIMIT 1`,
      [userNo]
    );
    return Response.json({ success: true, data: rows?.[0] || null });
  } catch (err) {
    console.error('[GET /api/srvc/myp/020101] 오류:', err);
    return Response.json({ success: false, message: '사업자 정보 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userNo = String(formData.get('userNo') || '');
    const file = formData.get('file');

    const auth = await verifyContractorSession(userNo);
    if (!auth.ok) {
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }

    if (!file || typeof file === 'string') {
      return Response.json({ success: false, message: 'PDF 파일을 첨부해 주세요.' }, { status: 400 });
    }
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return Response.json({ success: false, message: 'PDF 원본 파일만 업로드 가능합니다.' }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return Response.json({ success: false, message: '파일 용량은 최대 10MB까지 가능합니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
      return Response.json({ success: false, message: '유효한 PDF 전자발급본이 아닙니다.' }, { status: 400 });
    }

    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const saveDir = path.join(STORAGE_ROOT, yyyymm, userNo);
    fs.mkdirSync(saveDir, { recursive: true });
    const safeName = `hometax_${Date.now()}.pdf`;
    fs.writeFileSync(path.join(saveDir, safeName), buffer);

    const extractedText = await extractPdfText(buffer);
    const parsed = parseHometaxPdfText(extractedText);

    // 국세청 사업자 상태(정상/휴업/폐업) 조회 연동
    let bizStatNm = '정상';
    let bizStatCd = 'ACTIVE';
    const cleanBizNo = (parsed.bizNo || '').replace(/-/g, '');
    if (cleanBizNo && process.env.NTS_API_KEY) {
      try {
        const ntsRes = await fetch(
          `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(process.env.NTS_API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ b_no: [cleanBizNo] }),
          }
        );
        const ntsJson = await ntsRes.json();
        const sttCd = ntsJson?.data?.[0]?.b_stt_cd;
        if (sttCd === '02') { bizStatNm = '휴업'; bizStatCd = 'SUSPENDED'; }
        else if (sttCd === '03') { bizStatNm = '폐업'; bizStatCd = 'CLOSED'; }
      } catch {
        // fallback to 정상
      }
    }

    await executeQuery(
      `INSERT INTO TB_PARTNER_BIZ (USER_NO, BIZ_NM, CEO_NM, BIZ_REG_NO, BIZ_STAT_CD, REG_DT, MOD_DT)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE BIZ_NM = VALUES(BIZ_NM), CEO_NM = VALUES(CEO_NM), BIZ_REG_NO = VALUES(BIZ_REG_NO), BIZ_STAT_CD = VALUES(BIZ_STAT_CD), MOD_DT = NOW()`,
      [userNo, parsed.bizName || '', parsed.ceoName || '', parsed.bizNo || '', bizStatCd]
    ).catch(() => {});

    return Response.json({
      success: true,
      data: {
        fileUrl: `/storage/project/service_docs/${yyyymm}/${userNo}/${safeName}`,
        issueNo: parsed.issueNo || '전자발급본 OCR 판독 완료',
        ocrResult: { ...parsed, bizStatNm, bizStatCd },
      },
    });
  } catch (err) {
    return Response.json({ success: false, message: err?.message || 'PDF OCR 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const userNo = body?.userNo || 'S20261100002';
    const auth = await verifyContractorSession(userNo);
    if (!auth.ok) {
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }
    const d = body?.ocrData || body || {};
    const compNm = String(d.bizName || '').replace(/\s*-\s*(정상|휴업|폐업).*$/, '').trim() || '공간다원';
    const ceoNm = String(d.ceoName || '').trim() || '대표자';
    const bizRegNo = String(d.bizNo || '').trim() || '000-00-00000';
    const openRaw = String(d.openDateAndType || '');
    const dtMatch = openRaw.match(/(\d{4})[년.\-\s]+(\d{1,2})[월.\-\s]+(\d{1,2})/);
    const openDt = dtMatch ? `${dtMatch[1]}-${dtMatch[2].padStart(2, '0')}-${dtMatch[3].padStart(2, '0')}` : null;
    const taxMatch = openRaw.match(/\(([^)]+)\)/);
    const taxTypeNm = taxMatch ? taxMatch[1].trim() : '일반과세자';
    const indCd = String(d.industryCode || '').trim() || null;
    const indNm = String(d.industryName || '').trim() || null;

    const ntsBaseUrl = process.env.NTS_API_BASE_URL || 'https://api.odcloud.kr/api/nts-businessman/v1';
    const ntsServiceKey = process.env.NTS_API_SERVICE_KEY || 'b1780c93f90e1cbf0caf0ad328692fe985dd4231417a0c432b6f5a1aac666291';
    const cleanBizNo = bizRegNo.replace(/[^0-9]/g, '');
    const cleanOpenDt = (openDt || '').replace(/[^0-9]/g, '');

    if (cleanBizNo.length !== 10 || cleanOpenDt.length !== 8 || !ceoNm) {
      return Response.json(
        { success: false, message: '국세청 진위확인을 위해 사업자등록번호(10자리), 개업일자(8자리), 대표자 성명이 필요합니다.' },
        { status: 400 }
      );
    }

    const ntsRes = await fetch(`${ntsBaseUrl}/validate?serviceKey=${encodeURIComponent(ntsServiceKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        businesses: [
          {
            b_no: cleanBizNo,
            start_dt: cleanOpenDt,
            p_nm: ceoNm,
            p_nm2: '',
            b_nm: compNm,
            corp_no: '',
            b_sector: '',
            b_type: '',
          },
        ],
      }),
    });
    const ntsData = await ntsRes.json();
    const ntsItem = ntsData?.data?.[0];

    if (ntsData?.status_code !== 'OK' || !ntsItem) {
      return Response.json({ success: false, message: '국세청 사업자등록정보 진위확인 API 호출에 실패했습니다.' }, { status: 502 });
    }
    if (ntsItem.valid !== '01') {
      return Response.json(
        { success: false, message: '국세청 등록 정보와 일치하지 않습니다. 사업자등록번호, 대표자 성명, 개업연월일을 확인해 주세요.' },
        { status: 400 }
      );
    }
    if (ntsItem.status?.b_stt_cd === '02') {
      return Response.json({ success: false, message: '현재 휴업 상태인 사업자는 시공사 등록이 불가합니다.' }, { status: 400 });
    }
    if (ntsItem.status?.b_stt_cd === '03' || ntsItem.status?.b_stt_cd !== '01') {
      return Response.json({ success: false, message: '폐업 처리된 사업자등록번호는 등록할 수 없습니다.' }, { status: 400 });
    }

    const verifiedTaxType = ntsItem.status?.tax_type || taxTypeNm;

    await executeQuery(
      `INSERT INTO TB_SERVICE_DOC
         (USER_NO, COMP_NM, CEO_NM, BIZ_REG_NO, OPEN_DT, TAX_TYPE_NM, IND_CD, IND_NM, VERIFY_YN, REG_DT, REG_ID, MOD_DT, MOD_ID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Y', NOW(), ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE
         COMP_NM = VALUES(COMP_NM),
         CEO_NM = VALUES(CEO_NM),
         BIZ_REG_NO = VALUES(BIZ_REG_NO),
         OPEN_DT = COALESCE(VALUES(OPEN_DT), OPEN_DT),
         TAX_TYPE_NM = VALUES(TAX_TYPE_NM),
         IND_CD = COALESCE(VALUES(IND_CD), IND_CD),
         IND_NM = COALESCE(VALUES(IND_NM), IND_NM),
         VERIFY_YN = 'Y',
         MOD_DT = NOW(),
         MOD_ID = VALUES(MOD_ID)`,
      [userNo, compNm, ceoNm, bizRegNo, openDt, verifiedTaxType, indCd, indNm, userNo, userNo]
    );

    return Response.json({ success: true, message: '사업자 정보가 TB_SERVICE_DOC에 정상 저장되었습니다.', data: d });
  } catch (err) {
    return Response.json({ success: false, message: err?.message || '반영 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('fileUrl') || '';
    if (fileUrl.startsWith('/storage/project/service_docs/')) {
      const rel = fileUrl.replace('/storage/project/service_docs/', '');
      const fullPath = path.join(STORAGE_ROOT, rel);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    return Response.json({ success: true, message: '업로드된 PDF 파일이 삭제되었습니다.' });
  } catch (err) {
    return Response.json({ success: false, message: err?.message || '삭제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
