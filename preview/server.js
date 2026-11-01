import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processWebClntCom000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_000/route.js';
import { processWebClntReq000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_000/route.js';
import { processWebClntAth000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_000/route.js';
import { processWebClntAth010 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010/route.js';
import { processWebClntAth011 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_011/route.js';
import { processWebClntOrd000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_000/route.js';
import { processWebClntOrd001 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_001/route.js';
import { processWebClntPay000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_000/route.js';
import { processWebClntJob000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_000/route.js';
import { processAppClntCom000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_COM_000/route.js';
import { processAppClntReq000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_000/route.js';
import { processAppClntAth000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_000/route.js';
import { processAppClntAth010 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010/route.js';
import { processAppClntAth011 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_011/route.js';
import { searchNaverAddress, getPublicNaverMapConfig } from '../lib/naver-map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// 캐시 방지 헤더 설정 및 간이 요청 로거 (개발 중 즉각 반영)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!req.url.startsWith('/public') && !req.url.includes('.png') && !req.url.includes('.jpg')) {
    console.log(`📡 [HTTP] ${req.method} ${req.url}`);
  }
  next();
});

// ============================================================================
// [API 라우트] GET /api/common/naver_map_config (프론트/모바일 네이버 지도 공개 설정)
// ============================================================================
app.get('/api/common/naver_map_config', (req, res) => {
  return res.status(200).json({
    success: true,
    config: getPublicNaverMapConfig(),
  });
});

// ============================================================================
// [API 라우트] POST /api/web/client/search_address (네이버 주소 검색 API 연동)
// ============================================================================
app.post('/api/web/client/search_address', async (req, res) => {
  try {
    const result = await searchNaverAddress({
      query: req.body?.query || req.body?.keyword || '',
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/search_address):', error);
    return res.status(500).json({
      success: false,
      message: error?.message || '네이버 주소 검색 중 오류가 발생했습니다.',
    });
  }
});
app.post('/api/web/client/com_000', async (req, res) => {
  try {
    const payload = await processWebClntCom000(req.body || {});
    return res.status(200).json(payload);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/com_000):', error);
    return res.status(500).json({
      success: false,
      screenId: 'WEB-CLNT-COM-000',
      message: error?.message || '서버 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/req_000 (WEB-CLNT-REQ-000 청소 서비스 신청)
// ============================================================================
app.post('/api/web/client/req_000', async (req, res) => {
  try {
    const { status, body } = await processWebClntReq000(req.body || {});
    return res.status(status).json(body);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/req_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '서버 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_000 (WEB-CLNT-ATH-000 고객 및 시공사 로그인)
// ============================================================================
app.post('/api/web/client/ath_000', async (req, res) => {
  try {
    const result = await processWebClntAth000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '로그인 인증 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_010 (WEB-CLNT-ATH-010 통합 회원가입 및 약관동의)
// ============================================================================
app.post('/api/web/client/ath_010', async (req, res) => {
  try {
    const result = await processWebClntAth010(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_010):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '회원가입 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_011 (WEB-CLNT-ATH-011 고객 가입 환영 안내)
// ============================================================================
app.post('/api/web/client/ath_011', async (req, res) => {
  try {
    const result = await processWebClntAth011(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_011):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '고객 정보 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ord_000 (WEB-CLNT-ORD-000 나의 청소 신청 현황)
// ============================================================================
app.post('/api/web/client/ord_000', async (req, res) => {
  try {
    const result = await processWebClntOrd000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ord_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '청소 신청 현황 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ord_001 (WEB-CLNT-ORD-001 청소 요청 상세 및 용역 청약서 비교/선택)
// ============================================================================
app.post('/api/web/client/ord_001', async (req, res) => {
  try {
    const result = await processWebClntOrd001(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ord_001):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '청약서 비교 정보 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/pay_000 (WEB-CLNT-PAY-000 결제 승인 및 배타적 계약 체결)
// ============================================================================
app.post('/api/web/client/pay_000', async (req, res) => {
  try {
    const result = await processWebClntPay000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/pay_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '결제 승인 및 배차 확정 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/job_000 (WEB-CLNT-JOB-000 청소 시공 검수 및 현장 직불 완료 승인)
// ============================================================================
app.post('/api/web/client/job_000', async (req, res) => {
  try {
    const result = await processWebClntJob000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/job_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '시공 검수 및 완료 승인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/com_000 (APP-CLNT-COM-000 고객 모바일 앱 홈)
// ============================================================================
app.post('/api/app/client/com_000', async (req, res) => {
  try {
    const result = await processAppClntCom000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/com_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 홈 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/req_000 (APP-CLNT-REQ-000 청소 서비스 신청)
// ============================================================================
app.post('/api/app/client/req_000', async (req, res) => {
  try {
    const result = await processAppClntReq000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/req_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 청소 요청 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_000 (APP-CLNT-ATH-000 고객 및 시공사 로그인)
// ============================================================================
app.post('/api/app/client/ath_000', async (req, res) => {
  try {
    const result = await processAppClntAth000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 로그인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_010 (APP-CLNT-ATH-010 통합 회원가입 및 약관동의)
// ============================================================================
app.post('/api/app/client/ath_010', async (req, res) => {
  try {
    const result = await processAppClntAth010(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_010):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 회원가입 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_011 (APP-CLNT-ATH-011 모바일 고객 가입 환영 / 회원정보 / 약관 및 서명 관리)
// ============================================================================
app.post('/api/app/client/ath_011', async (req, res) => {
  try {
    const result = await processAppClntAth011(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_011):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 고객 정보 조회 중 오류가 발생했습니다.',
    });
  }
});

// 정적 파일 서빙
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 모바일 하이브리드 앱 웹뷰 프리뷰 라우트
app.get(['/app', '/app/client/com_000', '/app/client/req_000', '/preview/app', '/preview/app.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// 모든 HTML 요청에 대해 프리뷰 index.html 반환 (Express 5 호환)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 [SseulDakGo] WEB-CLNT-COM-000 고객 메인 홈 프리뷰 서버 실행 중`);
  console.log(`🔗 로컬 접속 URL: http://localhost:${PORT}`);
  console.log(`===============================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`⚠️ 포트 ${PORT} 사용 중 -> 포트 ${nextPort}로 재시도합니다.`);
    app.listen(nextPort, () => {
      console.log(`🚀 [SseulDakGo] WEB-CLNT-COM-000 프리뷰 서버 접속 URL: http://localhost:${nextPort}`);
    });
  } else {
    console.error('서버 오류:', err);
  }
});
