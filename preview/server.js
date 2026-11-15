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
import { processWebClntMyp010100 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_010100/route.js';
import { processAppClntCom010000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_COM_010000/route.js';
import { processAppClntReq010100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010100/route.js';
import { processAppClntReq010101 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010101/route.js';
import { processAppClntAth010200100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010100/route.js';
import { processAppClntAth010200200 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010200/route.js';
import { processAppClntAth010200201 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010201/route.js';
import { searchNaverAddress, getPublicNaverMapConfig } from '../lib/naver-map.js';
import { getNaverAuthUrl, getPublicNaverLoginConfig, processNaverAuthCallback, NAVER_LOGIN_CONFIG } from '../lib/naver-login.js';
import { getKakaoAuthUrl, getPublicKakaoLoginConfig, processKakaoAuthCallback, KAKAO_LOGIN_CONFIG } from '../lib/kakao-login.js';
import { getGoogleAuthUrl, getPublicGoogleLoginConfig, processGoogleAuthCallback, GOOGLE_LOGIN_CONFIG } from '../lib/google-login.js';
import { sendSms, ALIGO_CONFIG } from '../lib/sms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// CORS 및 캐시 방지 헤더 설정 (file:/// 로컬 뷰어 및 크로스 오리진 완벽 지원)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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

// =============================================================================
// [API 라우트] GET /api/common/kakao_login_config (프론트/모바일 카카오 로그인 공개 설정)
// =============================================================================
app.get('/api/common/kakao_login_config', (req, res) => {
  const origin = req.headers.origin || req.headers.referer || '';
  res.json({
    success: true,
    config: getPublicKakaoLoginConfig(origin),
  });
});

// =============================================================================
// [API 라우트] GET /api/auth/kakao/authorize (카카오 로그인 OAuth 인증 URL 발급/리다이렉트)
// =============================================================================
app.get('/api/auth/kakao/authorize', (req, res) => {
  const { userRoleCd = 'C', mode = 'redirect' } = req.query;
  const protocol = req.protocol;
  const host = req.get('host');
  const defaultCallback = `${protocol}://${host}/api/auth/kakao/callback`;

  const { url, state } = getKakaoAuthUrl({
    userRoleCd: userRoleCd === 'S' ? 'S' : 'C',
    redirectUri: defaultCallback,
  });

  if (mode === 'json') {
    return res.json({
      success: true,
      authUrl: url,
      state,
      appId: KAKAO_LOGIN_CONFIG.appId,
      javascriptKey: KAKAO_LOGIN_CONFIG.javascriptKey,
    });
  }

  res.redirect(url);
});

// =============================================================================
// [API 라우트] GET/POST /api/auth/kakao/callback (카카오 OAuth 인증 인가코드 콜백 처리기)
// =============================================================================
app.all(['/api/auth/kakao/callback', '/api/app/auth/kakao/callback'], async (req, res) => {
  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;
  const error = req.query.error || req.body?.error;
  const errorDescription = req.query.error_description || req.body?.error_description;
  const userRoleCd = (req.query.userRoleCd || req.body?.userRoleCd || 'C') === 'S' ? 'S' : 'C';

  if (error) {
    console.error('❌ [KAKAO_LOGIN_CALLBACK_ERR]', error, errorDescription);
    if (req.method === 'POST') {
      return res.status(400).json({ success: false, code: error, message: errorDescription });
    }
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>카카오 인증 실패</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">카카오 로그인이 취소되었거나 오류가 발생했습니다.</h3>
        <p>${error}: ${errorDescription || ''}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#FEE500;color:#3C1E1E;font-weight:bold;cursor:pointer;">창 닫기</button>
      </body></html>
    `);
  }

  if (!code) {
    if (req.method === 'POST') {
      return res.status(400).json({ success: false, message: '인가 코드(code)가 전달되지 않았습니다.' });
    }
    return res.status(400).send('<p>인가 코드(code) 누락</p>');
  }

  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/kakao/callback`;

    const authResult = await processKakaoAuthCallback({
      code,
      state,
      userRoleCd,
      redirectUri,
    });

    if (req.method === 'POST') {
      return res.json(authResult);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>카카오 인증 완료 - 쓸고닦고</title>
      </head>
      <body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa;">
        <div style="background:#fff;padding:32px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;max-width:380px;">
          <div style="width:48px;height:48px;background:#FEE500;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg style="width:24px;height:24px;fill:#3C1E1E;" viewBox="0 0 24 24">
              <path d="M12 3C6.477 3 2 6.48 2 10.772c0 2.76 1.848 5.178 4.636 6.53l-.946 3.52c-.084.312.247.568.52.387l4.22-2.793c.516.052 1.042.086 1.57.086 5.523 0 10-3.48 10-7.772C22 6.48 17.523 3 12 3z"></path>
            </svg>
          </div>
          <h3 style="margin:0 0 8px;color:#1e293b;">카카오 계정 연동 완료</h3>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px;">인증 정보가 쓸고닦고에 안전하게 전달되었습니다.<br>잠시 후 창이 자동으로 닫힙니다.</p>
        </div>
        <script>
          const authData = ${JSON.stringify(authResult)};
          if (window.opener) {
            window.opener.postMessage({
              type: authData.isRegisteredUser ? 'KAKAO_AUTH_SUCCESS' : 'KAKAO_AUTH_NEW_USER',
              provider: 'KAKAO',
              profile: authData.profile
            }, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            sessionStorage.setItem('SSEULDAKGO_KAKAO_PREFILL', JSON.stringify(authData.profile));
            window.location.href = '/client/?action=register&provider=kakao';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ [KAKAO_AUTH_CALLBACK_EXCEPTION]', err);
    if (req.method === 'POST') {
      return res.status(500).json({ success: false, code: 'ERR_KAKAO_AUTH', message: err.message });
    }
    return res.status(500).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>카카오 연동 처리 오류</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">카카오 로그인 처리 중 오류가 발생했습니다.</h3>
        <p>${err.message}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#FEE500;color:#3C1E1E;font-weight:bold;cursor:pointer;">창 닫기</button>
      </body></html>
    `);
  }
});

// =============================================================================
// [API 라우트] GET /api/common/google_login_config (프론트/모바일 구글 로그인 공개 설정)
// =============================================================================
app.get('/api/common/google_login_config', (req, res) => {
  const origin = req.headers.origin || req.headers.referer || '';
  res.json({
    success: true,
    config: getPublicGoogleLoginConfig(origin),
  });
});

// =============================================================================
// [API 라우트] GET /api/auth/google/authorize (구글 로그인 OAuth 인증 URL 발급/리다이렉트)
// =============================================================================
app.get('/api/auth/google/authorize', (req, res) => {
  const { userRoleCd = 'C', mode = 'redirect' } = req.query;
  const protocol = req.protocol;
  const host = req.get('host');
  const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;

  const { url, state } = getGoogleAuthUrl({
    userRoleCd: userRoleCd === 'S' ? 'S' : 'C',
    redirectUri: defaultCallback,
  });

  if (mode === 'json') {
    return res.json({
      success: true,
      authUrl: url,
      state,
      clientId: GOOGLE_LOGIN_CONFIG.clientId,
    });
  }

  res.redirect(url);
});

// =============================================================================
// [API 라우트] GET/POST /api/auth/google/callback (구글 OAuth 인증 인가코드 콜백 처리기)
// =============================================================================
app.all(['/api/auth/google/callback', '/api/app/auth/google/callback'], async (req, res) => {
  const code = req.query.code || req.body?.code;
  const state = req.query.state || req.body?.state;
  const error = req.query.error || req.body?.error;
  const errorDescription = req.query.error_description || req.body?.error_description;
  const userRoleCd = (req.query.userRoleCd || req.body?.userRoleCd || 'C') === 'S' ? 'S' : 'C';

  if (error) {
    console.error('❌ [GOOGLE_LOGIN_CALLBACK_ERR]', error, errorDescription);
    if (req.method === 'POST') {
      return res.status(400).json({ success: false, code: error, message: errorDescription });
    }
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Google 인증 실패</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">Google 로그인이 취소되었거나 오류가 발생했습니다.</h3>
        <p>${error}: ${errorDescription || ''}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#4285F4;color:#fff;font-weight:bold;cursor:pointer;">창 닫기</button>
      </body></html>
    `);
  }

  if (!code) {
    if (req.method === 'POST') {
      return res.status(400).json({ success: false, message: '인가 코드(code)가 전달되지 않았습니다.' });
    }
    return res.status(400).send('<p>인가 코드(code) 누락</p>');
  }

  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const authResult = await processGoogleAuthCallback({
      code,
      state,
      userRoleCd,
      redirectUri,
    });

    if (req.method === 'POST') {
      return res.json(authResult);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Google 인증 완료 - 쓸고닦고</title>
      </head>
      <body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa;">
        <div style="background:#fff;padding:32px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;max-width:380px;">
          <div style="width:48px;height:48px;background:#4285F4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#fff;font-weight:bold;font-size:24px;">G</div>
          <h3 style="margin:0 0 8px;color:#1e293b;">Google 계정 연동 완료</h3>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px;">인증 정보가 쓸고닦고에 안전하게 전달되었습니다.<br>잠시 후 창이 자동으로 닫힙니다.</p>
        </div>
        <script>
          const authData = ${JSON.stringify(authResult)};
          if (window.opener) {
            window.opener.postMessage({
              type: authData.isRegisteredUser ? 'GOOGLE_AUTH_SUCCESS' : 'GOOGLE_AUTH_NEW_USER',
              provider: 'GOOGLE',
              profile: authData.profile
            }, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            sessionStorage.setItem('SSEULDAKGO_GOOGLE_PREFILL', JSON.stringify(authData.profile));
            window.location.href = '/client/?action=register&provider=google';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ [GOOGLE_AUTH_CALLBACK_EXCEPTION]', err);
    if (req.method === 'POST') {
      return res.status(500).json({ success: false, code: 'ERR_GOOGLE_AUTH', message: err.message });
    }
    return res.status(500).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Google 연동 처리 오류</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h3 style="color:#d32f2f;">Google 로그인 처리 중 오류가 발생했습니다.</h3>
        <p>${err.message}</p>
        <button onclick="window.close()" style="padding:10px 20px;border-radius:6px;border:none;background:#4285F4;color:#fff;font-weight:bold;cursor:pointer;">창 닫기</button>
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
// [API 라우트] 휴대폰 SMS 인증번호 발송 & 검증 (알리고 ALIGO 연동, 유효시간 3분)
// ============================================================================
const phoneVerificationStore = new Map();

app.post(['/api/auth/phone/send-code', '/api/common/send_sms_auth'], async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: '휴대폰 번호를 입력해 주세요.' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: '올바른 휴대폰 번호(10~11자리)를 입력해 주세요.' });
    }

    // 6자리 난수 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 180 * 1000; // 3분

    phoneVerificationStore.set(cleanPhone, {
      code,
      expiresAt,
      verified: false
    });

    console.log(`📱 [ALIGO_SMS_SEND] 수신번호: ${cleanPhone}, 인증번호: ${code}, 유효시간: 3분`);

    // 알리고 실제 SMS 발송 호출
    const smsResult = await sendSms({
      receiver: cleanPhone,
      message: `[${ALIGO_CONFIG.senderName}] 본인확인 인증번호는 [${code}]입니다. 3분 이내에 입력해 주세요.`,
      title: `[${ALIGO_CONFIG.senderName}] 인증번호 안내`
    });

    console.log(`📱 [ALIGO_RESULT]:`, smsResult);

    const isAligoSuccess = smsResult && (smsResult.result_code === 1 || smsResult.result_code === '1');
    if (!isAligoSuccess) {
      console.log(`\n======================================================================`);
      console.log(`🔔 [SMS 개발모드 폴백] 알리고 API 응답 오류 (코드: ${smsResult?.result_code})`);
      console.log(`📱 [수신번호]: ${cleanPhone}`);
      console.log(`🔑 [발급된 6자리 인증번호]: >>> [ ${code} ] <<<`);
      console.log(`⏰ [유효시간]: 3분 (180초)`);
      console.log(`💡 알리고 IP 미등록 상태에서도 화면/터미널 인증번호로 정상 테스트 가능합니다.`);
      console.log(`======================================================================\n`);

      // 개발/테스트 환경 폴백: 알리고 발송이 차단되어도 화면 및 콘솔에 인증번호를 제공하여 테스트 진행 지원
      return res.json({
        success: true,
        isDevFallback: true,
        devCode: code,
        message: `[개발모드] 알리고 문자 발송 제한(IP 미등록 등)으로 인증번호 [${code}]가 자동 발급되었습니다.`,
        expiresAt,
        aligoResult: smsResult
      });
    }

    return res.json({
      success: true,
      isDevFallback: false,
      message: '인증번호 6자리가 문자로 발송되었습니다. (3분 이내 입력)',
      expiresAt,
      aligoResult: smsResult,
      devCode: code
    });
  } catch (error) {
    console.error('❌ SMS 발송 오류:', error);
    return res.status(500).json({
      success: false,
      message: '인증번호 발송 중 서버 오류가 발생했습니다: ' + error.message
    });
  }
});

app.post(['/api/auth/phone/verify-code', '/api/common/verify_sms_auth'], async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: '휴대폰 번호와 인증번호를 모두 입력해 주세요.' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanCode = code.toString().trim();

    const record = phoneVerificationStore.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ success: false, message: '인증번호를 먼저 발송해 주세요.' });
    }

    if (Date.now() > record.expiresAt) {
      phoneVerificationStore.delete(cleanPhone);
      return res.status(400).json({ success: false, message: '인증 유효시간(3분)이 만료되었습니다. 다시 발송해 주세요.' });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({ success: false, message: '인증번호가 일치하지 않습니다. 다시 확인해 주세요.' });
    }

    record.verified = true;
    return res.json({
      success: true,
      message: '휴대폰 본인실명인증이 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('❌ SMS 인증 오류:', error);
    return res.status(500).json({
      success: false,
      message: '인증번호 확인 중 서버 오류가 발생했습니다: ' + error.message
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
// [API 라우트] ALL /api/web/client/myp_010100 (WEB-CLNT-MYP-010100 내정보 프로필 및 통계)
// ============================================================================
app.all('/api/web/client/myp_010100', async (req, res) => {
  try {
    const userNo = req.query.userNo || req.body?.userNo || 'C20261100001';
    const result = await processWebClntMyp010100({ userNo });
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/myp_010100):', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_INTERNAL_SERVER',
      message: error?.message || '내정보 조회 중 오류가 발생했습니다.',
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
app.use('/preview', express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/preview_client', express.static(path.join(__dirname, '../preview_client')));

// C 드라이브 외부 스토리지 마운트 서빙 (업계 표준 스토리지 격리 원칙)
const externalStoragePath = process.env.STORAGE_LOCAL_ROOT || 'C:\\SseulDakGo_Storage';
import fs from 'fs';
if (fs.existsSync(externalStoragePath)) {
  app.use('/storage', express.static(externalStoragePath));
  console.log(`📦 [Storage] 외부 로컬 스토리지 마운트 완료: ${externalStoragePath} -> /storage`);
}

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
