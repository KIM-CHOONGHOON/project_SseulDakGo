import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processWebClntCom010000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js';
import { processWebClntReq010100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010100/route.js';
import { processWebClntReq010101 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js';
import { processWebClntAth010200100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010100/route.js';
import { processWebClntAth010200200 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010200/route.js';
import { processWebClntAth010200201 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010201/route.js';
import { processWebClntOrd010000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010000/route.js';
import { processWebClntOrd010100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010100/route.js';
import { processWebClntPay010100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_010100/route.js';
import { processWebClntJob010100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_010100/route.js';
import { processAppClntCom010000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_COM_010000/route.js';
import { processAppClntReq010100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010100/route.js';
import { processAppClntReq010101 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010101/route.js';
import { processAppClntAth010200100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010100/route.js';
import { processAppClntAth010200200 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010200/route.js';
import { processAppClntAth010200201 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010201/route.js';
import { searchNaverAddress, getPublicNaverMapConfig } from '../lib/naver-map.js';
import { getNaverAuthUrl, getPublicNaverLoginConfig, processNaverAuthCallback, NAVER_LOGIN_CONFIG } from '../lib/naver-login.js';

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
// [API 라우트] GET /api/common/naver_login_config (프론트/모바일 네이버 로그인 공개 설정)
// ============================================================================
app.get('/api/common/naver_login_config', (req, res) => {
  const origin = req.headers.host || '';
  return res.status(200).json({
    success: true,
    config: getPublicNaverLoginConfig(origin),
  });
});

// ============================================================================
// [API 라우트] GET /api/auth/naver/authorize (네이버 로그인 OAuth 인증 URL 발급/리다이렉트)
// ============================================================================
app.get('/api/auth/naver/authorize', (req, res) => {
  const { redirectUri, userRoleCd = 'C' } = req.query;
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  const defaultCallback = `${protocol}://${host}/api/auth/naver/callback`;

  const { url, state } = getNaverAuthUrl({
    redirectUri: redirectUri || defaultCallback,
    userRoleCd: userRoleCd === 'S' ? 'S' : 'C',
  });

  if (req.query.mode === 'redirect') {
    return res.redirect(url);
  }

  return res.status(200).json({
    success: true,
    authUrl: url,
    state,
  });
});

// ============================================================================
// [API 라우트] GET/POST /api/auth/naver/callback (네이버 OAuth 인증 인가코드 콜백 처리기)
// ============================================================================
app.all(['/api/auth/naver/callback', '/api/app/auth/naver/callback'], async (req, res) => {
  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;
  const error = req.query.error || req.body?.error;
  const errorDescription = req.query.error_description || req.body?.error_description;
  const userRoleCd = (req.query.userRoleCd || req.body?.userRoleCd || 'C') === 'S' ? 'S' : 'C';

  if (error) {
    console.error('❌ [NAVER_LOGIN_CALLBACK_ERR]', error, errorDescription);
    if (req.method === 'POST') {
      return res.status(400).json({ success: false, code: error, message: errorDescription });
    }
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>네이버 로그인 오류</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">네이버 로그인 인증에 실패했습니다.</h3>
        <p>${errorDescription || error}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#03C75A;color:white;cursor:pointer;">닫기</button>
      </body></html>
    `);
  }

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      code: 'ERR_MISSING_CODE_OR_STATE',
      message: '인가 코드(code) 또는 상태값(state)이 전달되지 않았습니다.',
    });
  }

  try {
    const authResult = await processNaverAuthCallback({
      code,
      state,
      userRoleCd,
    });

    if (req.method === 'POST' || req.headers.accept?.includes('application/json')) {
      return res.status(200).json(authResult);
    }

    // 웹 브라우저 팝업 및 리다이렉트 브릿지 렌더링
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="utf-8"/>
        <title>네이버 로그인 완료</title>
      </head>
      <body style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#f8f9fa;">
        <div style="max-width:400px;margin:0 auto;background:#fff;padding:30px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="width:48px;height:48px;background:#03C75A;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:24px;margin-bottom:16px;">N</div>
          <h2 style="font-size:18px;color:#111;margin:0 0 8px;">네이버 계정 연동 완료</h2>
          <p style="font-size:14px;color:#666;margin:0 0 20px;">로그인 정보를 확인 중입니다. 잠시만 기다려 주세요...</p>
        </div>
        <script>
          const authData = ${JSON.stringify(authResult)};
          if (window.opener) {
            window.opener.postMessage({
              type: authData.isRegisteredUser ? 'NAVER_AUTH_SUCCESS' : 'NAVER_AUTH_NEW_USER',
              data: authData
            }, '*');
            setTimeout(() => { window.close(); }, 300);
          } else {
            if (authData.isRegisteredUser) {
              localStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(authData.user));
              window.location.href = '/client/';
            } else {
              sessionStorage.setItem('SSEULDAKGO_NAVER_PREFILL', JSON.stringify(authData.profile));
              window.location.href = '/client/?action=register&provider=naver';
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ [NAVER_AUTH_CALLBACK_EXCEPTION]', err);
    if (req.method === 'POST') {
      return res.status(500).json({ success: false, code: 'ERR_NAVER_AUTH', message: err.message });
    }
    return res.status(500).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>네이버 연동 처리 오류</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">네이버 로그인 처리 중 오류가 발생했습니다.</h3>
        <p>${err.message}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#03C75A;color:white;cursor:pointer;">창 닫기</button>
      </body></html>
    `);
  }
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
app.post('/api/web/client/com_010000', async (req, res) => {
  try {
    const payload = await processWebClntCom010000(req.body || {});
    return res.status(200).json(payload);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/com_010000):', error);
    return res.status(500).json({
      success: false,
      screenId: 'WEB-CLNT-COM-010000',
      message: error?.message || '서버 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/req_010100 (WEB-CLNT-REQ-010100 청소 서비스 신청)
// ============================================================================
app.post('/api/web/client/req_010100', async (req, res) => {
  try {
    const { status, body } = await processWebClntReq010100(req.body || {});
    return res.status(status).json(body);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/req_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '서버 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/req_010101 (WEB-CLNT-REQ-010101 동일 주소 확인 모달)
// ============================================================================
app.post('/api/web/client/req_010101', async (req, res) => {
  try {
    const { status, body } = await processWebClntReq010101(req.body || {});
    return res.status(status).json(body);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/req_010101):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '동일 주소 확인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_010100 (WEB-CLNT-ATH-010100 고객 및 시공사 로그인)
// ============================================================================
app.post('/api/web/client/ath_010100', async (req, res) => {
  try {
    const result = await processWebClntAth010200100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '로그인 인증 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_010200 (WEB-CLNT-ATH-010200 통합 회원가입 및 약관동의)
// ============================================================================
app.post('/api/web/client/ath_010200', async (req, res) => {
  try {
    const result = await processWebClntAth010200200(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_010200):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '회원가입 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ath_010200201 (WEB-CLNT-ATH-010200201 고객 가입 환영 안내)
// ============================================================================
app.post(['/api/web/client/ath_010201', '/api/web/client/ath_010200201'], async (req, res) => {
  try {
    const result = await processWebClntAth010200201(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ath_010200201):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '고객 정보 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ord_010000 (WEB-CLNT-ORD-010000 나의 청소 신청 현황)
// ============================================================================
app.post('/api/web/client/ord_010000', async (req, res) => {
  try {
    const result = await processWebClntOrd010000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ord_010000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '청소 신청 현황 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/ord_010100 (WEB-CLNT-ORD-010100 청소 요청 상세 및 용역 청약서 비교/선택)
// ============================================================================
app.post('/api/web/client/ord_010100', async (req, res) => {
  try {
    const result = await processWebClntOrd010100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/ord_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '청약서 비교 정보 조회 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/pay_010100 (WEB-CLNT-PAY-010100 결제 승인 및 배타적 계약 체결)
// ============================================================================
app.post('/api/web/client/pay_010100', async (req, res) => {
  try {
    const result = await processWebClntPay010100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/pay_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '결제 승인 및 배차 확정 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/web/client/job_010100 (WEB-CLNT-JOB-010100 청소 시공 검수 및 현장 직불 완료 승인)
// ============================================================================
app.post('/api/web/client/job_010100', async (req, res) => {
  try {
    const result = await processWebClntJob010100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/job_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '시공 검수 및 완료 승인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/com_010000 (APP-CLNT-COM-010000 고객 모바일 앱 홈)
// ============================================================================
app.post('/api/app/client/com_010000', async (req, res) => {
  try {
    const result = await processAppClntCom010000(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/com_010000):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 홈 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/req_010100 (APP-CLNT-REQ-010100 청소 서비스 신청)
// ============================================================================
app.post('/api/app/client/req_010100', async (req, res) => {
  try {
    const result = await processAppClntReq010100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/req_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 청소 요청 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/req_010101 (APP-CLNT-REQ-010101 동일 주소 확인 모달)
// ============================================================================
app.post('/api/app/client/req_010101', async (req, res) => {
  try {
    const { status, body } = await processAppClntReq010101(req.body || {});
    return res.status(status).json(body);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/req_010101):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 동일 주소 확인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_010100 (APP-CLNT-ATH-010100 고객 및 시공사 로그인)
// ============================================================================
app.post('/api/app/client/ath_010100', async (req, res) => {
  try {
    const result = await processAppClntAth010200100(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 로그인 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_010200 (APP-CLNT-ATH-010200 통합 회원가입 및 약관동의)
// ============================================================================
app.post('/api/app/client/ath_010200', async (req, res) => {
  try {
    const result = await processAppClntAth010200200(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_010200):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '모바일 회원가입 처리 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// [API 라우트] POST /api/app/client/ath_010200201 (APP-CLNT-ATH-010200201 모바일 고객 가입 환영 / 회원정보 / 약관 및 서명 관리)
// ============================================================================
app.post(['/api/app/client/ath_010201', '/api/app/client/ath_010200201'], async (req, res) => {
  try {
    const result = await processAppClntAth010200201(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/ath_010200201):', error);
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
app.use('/preview_client', express.static(path.join(__dirname, '../preview_client')));

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
  console.log(`🚀 [SseulDakGo] WEB-CLNT-COM-010000 고객 메인 홈 프리뷰 서버 실행 중`);
  console.log(`🔗 로컬 접속 URL: http://localhost:${PORT}`);
  console.log(`===============================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`⚠️ 포트 ${PORT} 사용 중 -> 포트 ${nextPort}로 재시도합니다.`);
    app.listen(nextPort, () => {
      console.log(`🚀 [SseulDakGo] WEB-CLNT-COM-010000 프리뷰 서버 접속 URL: http://localhost:${nextPort}`);
    });
  } else {
    console.error('서버 오류:', err);
  }
});
