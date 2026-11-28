import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processWebClntCom010000 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js';
import { processWebClntCom010200 } from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010200/route.js';
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
import { processWebSrvcJob020000 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020000/route.js';
import { processWebSrvcJob020100 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020100/route.js';
import { processWebSrvcJob020200 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020200/route.js';
import { processWebSrvcMyp010100 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010100/route.js';
import { processWebSrvcMyp010200 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010200/route.js';
import { processWebSrvcMyp010201 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_010201/route.js';
import { processWebSrvcQot010100 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_QOT_010100/route.js';
import { processWebSrvcQot020200 } from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_QOT_020200/route.js';
import {
  processWebClntMyp020100,
  getCertificationCommonCodes,
  getServiceCertifications,
  uploadCertificationFile,
  saveServiceCertifications,
  reviewServiceCertification,
} from '../SseulDakGo_Web/Client/backend/api_WEB_CLNT_MYP_020100/route.js';
import { processAppClntCom010000 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_COM_010000/route.js';
import { processAppClntReq010100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010100/route.js';
import { processAppClntReq010101 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_REQ_010101/route.js';
import { processAppClntAth010200100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010100/route.js';
import { processAppClntAth010200200 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010200/route.js';
import { processAppClntAth010200201 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_ATH_010201/route.js';
import { processAppClntMyp020100 } from '../SseulDakGo_App/Client/backend/api_APP_CLNT_MYP_020100/route.js';
import { searchNaverAddress, getPublicNaverMapConfig } from '../lib/naver-map.js';
import { executeQuery } from '../lib/db.js';
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
app.get('/api/clnt/com/010200', async (req, res) => {
  try {
    const { status, body } = await processWebClntCom010200(req.query || {});
    return res.status(status).json(body);
  } catch (error) {
    console.error('❌ API Error (/api/clnt/com/010200):', error);
    return res.status(500).json({
      success: false,
      screenId: 'WEB-CLNT-COM-010200',
      message: error?.message || '서버 오류가 발생했습니다.',
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
// [API 라우트] 푸시 알림 센터 (TB_USER_NOTIFICATION 조회 / 읽음 처리)
// ============================================================================
app.get(['/api/common/notifications', '/api/web/client/notifications', '/api/app/client/notifications'], async (req, res) => {
  try {
    const userNo = req.query.userNo;
    if (!userNo) {
      return res.status(200).json({ success: true, unreadCount: 0, list: [] });
    }

    // 1. 시공사(S)인 경우, 실제 TB_ORDER_MSTR + TB_ORDER_DTL 실 데이터만 조회하여 반환 (목업 데이터 배제)
    if (userNo.startsWith('S')) {
      const orders = await executeQuery(
        `SELECT M.ORDER_NO,
                M.PROPOSED_PRICE,
                M.ADDR_TEXT,
                M.ORDER_STATUS,
                DATE_FORMAT(M.REG_DT, '%Y-%m-%d %H:%i:%s') AS regDt,
                D.CLEAN_LARGE_CD,
                D.SELECTED_SRV_ITEMS,
                D.SUPPLY_PYEONG,
                Q.APPLY_NO
           FROM TB_ORDER_MSTR M
           JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
           LEFT JOIN TB_QUOTE_APPLY Q
             ON M.ORDER_NO = Q.ORDER_NO AND Q.SERVICE_USER_NO = ?
          WHERE M.ORDER_STATUS = 'BID_OPEN' OR Q.APPLY_NO IS NOT NULL
          ORDER BY M.REG_DT DESC
          LIMIT 30`,
        [userNo]
      );

      const catMap = { REGULAR: '정기청소', MOVEIN: '입주청소', APPLIANCE: '계절가전청소' };
      const realList = (orders || []).map((o, idx) => {
        const cleanTypeNm = catMap[o.CLEAN_LARGE_CD] || '정기청소';
        const shortAddr = String(o.ADDR_TEXT || '').split(/\s+/).slice(0, 3).join(' ');
        const cleanScope = o.SELECTED_SRV_ITEMS || (o.SUPPLY_PYEONG ? `공급 ${o.SUPPLY_PYEONG}평형` : cleanTypeNm);
        const isQuoted = Boolean(o.APPLY_NO);
        return {
          notiId: `ORD_${o.ORDER_NO}_${idx}`,
          orderNo: o.ORDER_NO,
          CLEAN_TYPE_NM: cleanTypeNm,
          SITE_ADDR: shortAddr,
          CLEAN_SCOPE: cleanScope,
          FIXED_PRICE: o.PROPOSED_PRICE,
          title: `[신규 청소 발주] ${cleanTypeNm}`,
          content: `발주번호: ${o.ORDER_NO} 현장: ${shortAddr} • ${cleanScope}`,
          isRead: isQuoted ? 'Y' : 'N',
          regDt: o.regDt,
          isQuoted,
          IS_QUOTED: isQuoted,
        };
      });

      const unreadCount = realList.filter((item) => !item.isQuoted).length;
      return res.status(200).json({
        success: true,
        unreadCount,
        list: realList,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message, unreadCount: 0, list: [] });
  }
});
// 단건 읽음 처리
app.post(['/api/common/notifications/read', '/api/web/client/notifications/read', '/api/app/client/notifications/read'], async (req, res) => {
  try {
    const { notiId, userNo } = req.body || {};
    if (notiId) {
      await executeQuery(
        `UPDATE TB_USER_NOTIFICATION 
         SET IS_READ = 'Y', READ_DT = NOW() 
         WHERE NOTI_ID = ?` + (userNo ? ' AND USER_NO = ?' : ''),
        userNo ? [notiId, userNo] : [notiId]
      );
    }
    return res.status(200).json({ success: true, message: '알림이 확인 처리되었습니다.' });
  } catch (error) {
    console.error('❌ [NOTI_READ_ERR]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 전체 모두 읽음 처리
app.post(['/api/common/notifications/read-all', '/api/web/client/notifications/read-all', '/api/app/client/notifications/read-all'], async (req, res) => {
  try {
    const { userNo } = req.body || {};
    if (userNo) {
      await executeQuery(
        `UPDATE TB_USER_NOTIFICATION 
         SET IS_READ = 'Y', READ_DT = NOW() 
         WHERE USER_NO = ? AND IS_READ = 'N'`,
        [userNo]
      );
    }
    return res.status(200).json({ success: true, message: '모든 알림이 확인 완료되었습니다.' });
  } catch (error) {
    console.error('❌ [NOTI_READ_ALL_ERR]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// [API 라우트] 시공사 발주 청약 신청 및 고객 푸시 발송 API
// - 시공사/이용자의 청소 용역 상태를 '청약(BID_APPLIED)'으로 관련 테이블 갱신
// - TB_ORDER_MSTR.ORDER_STATUS = 'BID_APPLIED'
// - TB_ORDER_DTL.SERVICE_STATUS = 'BID_APPLIED', SELECTED_SERVICE_USER_NO = {contractorUserNo}
// - TB_QUOTE_APPLY.APPLY_STAT_CD = 'APPLIED'
// - TB_USER_NOTIFICATION 이용자(고객)에게 실시간 청약 도착 푸시 INSERT
// ============================================================================
app.post([
  '/api/contractor/bid/apply',
  '/api/web/contractor/bid_apply',
  '/api/common/notifications/bid-apply'
], async (req, res) => {
  try {
    const {
      orderNo = 'ORD-20261116-0001',
      contractorUserNo = 'S20261100001',
      contractorNm = '공간다원',
      notiId = 'NT202611160001001'
    } = req.body || {};

    // 16자리 표준 규격 맞춤 (대시 제거)
    const cleanOrderNo = String(orderNo).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const orderDtlNo = (cleanOrderNo.slice(0, 16) + '01').slice(0, 18);

    let clientUserNo = 'C20261100001';
    let addrText = '경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)';
    let proposedPrice = 450000;

    // 1. 발주 마스터 및 상세 상태 조회/갱신
    try {
      const orderRows = await executeQuery(
        'SELECT ORDER_NO, CLIENT_USER_NO, PROPOSED_PRICE, ADDR_TEXT FROM TB_ORDER_MSTR WHERE ORDER_NO = ? LIMIT 1',
        [cleanOrderNo]
      );

      if (!orderRows || orderRows.length === 0) {
        // 발주 레코드가 없는 경우 신규 등록 (상태: BID_APPLIED)
        await executeQuery(
          `INSERT INTO TB_ORDER_MSTR (
            ORDER_NO, CLIENT_USER_NO, ORDER_STATUS, PROPOSED_PRICE, 
            CONTACT_PERSON_NM, CONTACT_TEL, SIDO_CD, SIGUNGU_CD,
            ADDR_TEXT, ADDR_DETAIL, BID_EXPIRE_DT, REG_DT, MOD_DT
          ) VALUES (?, ?, 'BID_APPLIED', ?, '홍길동', '010-1234-5678', '41', '41281', ?, '백석 상가빌딩 1~2층', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), NOW())
          ON DUPLICATE KEY UPDATE ORDER_STATUS = 'BID_APPLIED', MOD_DT = NOW()`,
          [cleanOrderNo, clientUserNo, proposedPrice, addrText]
        );
        await executeQuery(
          `INSERT INTO TB_ORDER_DTL (
            ORDER_DTL_NO, ORDER_NO, CLEAN_LARGE_CD, CLEAN_MID_CD, SERVICE_STATUS, 
            HOPE_CLEAN_DATE, HOPE_CLEAN_TIME, SELECTED_SERVICE_USER_NO, REG_DT, MOD_DT
          ) VALUES (?, ?, 'REGULAR', 'COMM_BUILDING', 'BID_APPLIED', CURDATE(), '09:00', ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE SERVICE_STATUS = 'BID_APPLIED', SELECTED_SERVICE_USER_NO = VALUES(SELECTED_SERVICE_USER_NO), MOD_DT = NOW()`,
          [orderDtlNo, cleanOrderNo, contractorUserNo]
        );
      } else {
        clientUserNo = orderRows[0].CLIENT_USER_NO || 'C20261100001';
        addrText = orderRows[0].ADDR_TEXT || addrText;
        proposedPrice = orderRows[0].PROPOSED_PRICE || proposedPrice;

        // 발주 마스터 상태 -> 'BID_APPLIED' (청약)
        await executeQuery(
          `UPDATE TB_ORDER_MSTR 
           SET ORDER_STATUS = 'BID_APPLIED', MOD_DT = NOW() 
           WHERE ORDER_NO = ?`,
          [cleanOrderNo]
        );
        // 발주 상세 상태 -> 'BID_APPLIED' (청약) 및 시공사 매핑
        await executeQuery(
          `UPDATE TB_ORDER_DTL 
           SET SERVICE_STATUS = 'BID_APPLIED', SELECTED_SERVICE_USER_NO = ?, MOD_DT = NOW() 
           WHERE ORDER_NO = ?`,
          [contractorUserNo, cleanOrderNo]
        );
      }

      // 2. TB_QUOTE_APPLY (시공 파트너 청약서 접수 원장) 생성/갱신 (18자리 이내)
      const applyNo = `AP${Date.now().toString().slice(-14)}`;

      await executeQuery(
        `INSERT INTO TB_QUOTE_APPLY (
          APPLY_NO, ORDER_NO, ORDER_DTL_NO, SERVICE_USER_NO, PROPOSED_DATE, 
          TIME_SLOT_TYPE, START_TIME, WORK_HOURS, ASSIGN_STAFF_CNT, 
          APPEAL_MSG, APPLY_STAT_CD, REG_DT, REG_ID, MOD_DT, MOD_ID
        ) VALUES (?, ?, ?, ?, CURDATE(), 'MORNING', '09:00', 3.5, 2, ?, 'APPLIED', NOW(), ?, NOW(), ?)
        ON DUPLICATE KEY UPDATE APPLY_STAT_CD = 'APPLIED', MOD_DT = NOW()`,
        [applyNo, cleanOrderNo, orderDtlNo, contractorUserNo, `[${contractorNm}] 전문 시공 청약 신청 완료`, contractorUserNo, contractorUserNo]
      );

      // 3. 기존 시공사 수신 발주 알림 읽음 처리
      if (notiId) {
        await executeQuery(
          'UPDATE TB_USER_NOTIFICATION SET IS_READ = "Y", READ_DT = NOW() WHERE NOTI_ID = ?',
          [notiId]
        );
      }

      // 4. 이용자(고객)에게 시공사 청약 접수 푸시 알림 INSERT (20자리 이내)
      const clientNotiId = `NT${Date.now().toString().slice(-16)}`;
      const clientNotiTitle = `[청약 접수] 전문 시공사(${contractorNm})에서 청약 신청을 완료하였습니다.`;
      const clientNotiContent = `[쓸고닦고] 발주번호: ${orderNo}\n시공사: ${contractorNm}\n현장: ${addrText}\n\n고객님이 의뢰하신 청소 발주에 대해 [${contractorNm}] 시공사 파트너가 청약 신청을 완료하였습니다.\n지금 바로 청약서 상세 스펙을 비교 확인하시고 계약을 진행해 보세요!`;
      const targetUrl = `/preview_client/WEB-CLNT-ORD-010100.html?orderNo=${cleanOrderNo}`;

      await executeQuery(
        `INSERT INTO TB_USER_NOTIFICATION (
          NOTI_ID, USER_NO, NOTI_TYPE, TITLE, CONTENT, TARGET_URL, IS_READ, REG_DT
        ) VALUES (?, ?, 'QUOTE_MATCH', ?, ?, ?, 'N', NOW())
        ON DUPLICATE KEY UPDATE TITLE = VALUES(TITLE), CONTENT = VALUES(CONTENT), IS_READ = 'N'`,
        [clientNotiId, clientUserNo, clientNotiTitle, clientNotiContent, targetUrl]
      );

      console.log(`✅ [BID_APPLY_SUCCESS] 발주(${cleanOrderNo}) 청약 완료: 시공사(${contractorUserNo}), 고객(${clientUserNo}) 푸시 전송 완료`);

      return res.status(200).json({
        success: true,
        message: '시공 청약 신청이 성공적으로 접수되었으며, 이용자(고객)에게 청약 도착 푸시 알림이 발송되었습니다.',
        data: {
          orderNo: cleanOrderNo,
          rawOrderNo: orderNo,
          orderStatus: 'BID_APPLIED',
          serviceStatus: 'BID_APPLIED',
          applyStatCd: 'APPLIED',
          contractorUserNo,
          contractorNm,
          targetClientUserNo: clientUserNo,
          clientNotiId,
          clientNotiTitle
        }
      });
    } catch (dbErr) {
      console.error('❌ [BID_APPLY_DB_ERR]', dbErr);
      return res.status(500).json({
        success: false,
        message: '청약 처리 중 데이터베이스 오류가 발생했습니다: ' + dbErr.message
      });
    }
  } catch (err) {
    console.error('❌ [BID_APPLY_ERR]', err);
    return res.status(500).json({
      success: false,
      message: err.message || '청약 신청 처리 중 오류가 발생했습니다.'
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
// [API 라우트] GET /api/web/service/job_020000 (시공 파트너 현장 진행 현황 대시보드)
// [API 라우트] POST /api/web/service/job_020100 (현장 시공 사진 첨부 모달)
// [API 라우트] POST /api/web/service/job_020200 (현장 시공 완료 등록 모달)
// ============================================================================
app.get('/api/web/service/job_020000', processWebSrvcJob020000);
app.post('/api/web/service/job_020100', processWebSrvcJob020100);
app.post('/api/web/service/job_020200', processWebSrvcJob020200);

// ============================================================================
// [API 라우트] WEB-SRVC-MYP-010100 / 010200 / 010201 (시공사 내정보·지역관리·회원탈회)
// ============================================================================
app.get('/api/srvc/myp/020100', async (req, res) => {
  try {
    const userNo = String(req.query?.userNo || '').trim();
    if (!userNo) {
      return res.status(200).json({ success: true, certs: [], cleanServiceTypes: [] });
    }
    let rows = [];
    try {
      rows = await executeQuery(
        `SELECT CERT_SEQ, USER_NO, CERT_NM, ISSUER_ORG, SERVICE_CAT, CERT_LEVEL,
                DATE_FORMAT(ISSUE_DT, '%Y.%m.%d') AS issueDt, CERT_NO, VERIFY_STAT_CD
           FROM TB_SERVICE_CERT
          WHERE USER_NO = ?
          ORDER BY REG_DT DESC`,
        [userNo]
      );
    } catch {
      rows = [];
    }
    let cleanServiceTypes = [];
    try {
      const bizRows = await executeQuery(
        `SELECT CLEAN_SERVICE_TYPES FROM TB_PARTNER_BIZ WHERE USER_NO = ? LIMIT 1`,
        [userNo]
      );
      const rawTypes = bizRows?.[0]?.CLEAN_SERVICE_TYPES || '';
      if (rawTypes) {
        cleanServiceTypes = String(rawTypes).split(',').map((s) => s.trim()).filter(Boolean);
      }
    } catch {}
    return res.status(200).json({ success: true, certs: rows || [], cleanServiceTypes });
  } catch (err) {
    console.error('[GET /api/srvc/myp/020100] 오류:', err);
    return res.status(500).json({ success: false, message: '자격·수료증 조회 중 오류가 발생했습니다.' });
  }
});

app.put('/api/srvc/myp/020100', async (req, res) => {
  try {
    const { userNo, bizName, ceoName, bizNo, cleanServiceTypes, certs } = req.body || {};
    if (!userNo) return res.status(400).json({ success: false, message: 'userNo가 필요합니다.' });
    const cleanTypesStr = Array.isArray(cleanServiceTypes) ? cleanServiceTypes.join(',') : '';
    await executeQuery(
      `INSERT INTO TB_PARTNER_BIZ (USER_NO, BIZ_NM, CEO_NM, BIZ_REG_NO, CLEAN_SERVICE_TYPES, REG_DT, MOD_DT)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE BIZ_NM = VALUES(BIZ_NM), CEO_NM = VALUES(CEO_NM), BIZ_REG_NO = VALUES(BIZ_REG_NO), CLEAN_SERVICE_TYPES = VALUES(CLEAN_SERVICE_TYPES), MOD_DT = NOW()`,
      [userNo, bizName || '', ceoName || '', bizNo || '', cleanTypesStr]
    ).catch(async () => {
      await executeQuery(
        `INSERT INTO TB_PARTNER_BIZ (USER_NO, BIZ_NM, CEO_NM, BIZ_REG_NO, REG_DT, MOD_DT)
         VALUES (?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE BIZ_NM = VALUES(BIZ_NM), CEO_NM = VALUES(CEO_NM), BIZ_REG_NO = VALUES(BIZ_REG_NO), MOD_DT = NOW()`,
        [userNo, bizName || '', ceoName || '', bizNo || '']
      ).catch(() => {});
    });
    if (Array.isArray(certs)) {
      await executeQuery(`DELETE FROM TB_SERVICE_CERT WHERE USER_NO = ?`, [userNo]).catch(() => {});
      await executeQuery(`DELETE FROM TB_PARTNER_CERT WHERE USER_NO = ?`, [userNo]).catch(() => {});
      for (const c of certs.slice(0, 50)) {
        await executeQuery(
          `INSERT INTO TB_SERVICE_CERT (USER_NO, CERT_NM, ISSUER_ORG, SERVICE_CAT, CERT_LEVEL, ISSUE_DT, CERT_NO, VERIFY_STAT_CD, REG_DT)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [userNo, c.name || '', c.org || '', c.cat || '', c.level || '', c.date ? String(c.date).replace(/\./g, '-') : null, c.certNo || '', c.status || '심사대기']
        ).catch(() => {});
        await executeQuery(
          `INSERT INTO TB_PARTNER_CERT (USER_NO, CERT_NM, ISSU_ORG_NM, ACQ_DT, CERT_NO, STAT_CD, REG_DT)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [userNo, c.name || '', c.org || '', c.date || '', c.certNo || '', c.status || '심사대기']
        ).catch(() => {});
      }
    }
    return res.json({ success: true, message: '사업자, 청소 용역 구분 및 자격·수료 정보가 DB에 저장되었습니다.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '저장 오류' });
  }
});

app.all('/api/srvc/myp/020101', async (req, res) => {
  try {
    const { Readable } = await import('stream');
    const mod = await import('../SseulDakGo_Web/Service/backend/api_WEB_SRVC_MYP_020101/route.js');
    const handler = mod[req.method];
    if (!handler) return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const webReq = new Request(fullUrl, {
      method: req.method,
      headers: req.headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : (req.is('application/json') ? JSON.stringify(req.body || {}) : Readable.toWeb(req)),
      duplex: 'half',
    });
    const webRes = await handler(webReq);
    const data = await webRes.json();
    return res.status(webRes.status || 200).json(data);
  } catch (error) {
    console.error('[020101 API ERROR]', error);
    return res.status(500).json({ success: false, message: error?.message || 'PDF OCR 처리 오류' });
  }
});

app.all('/api/srvc/myp/010100', async (req, res) => {
  try {
    const result = await processWebSrvcMyp010100(req.body || {}, req.query || {}, req.method);
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '시공사 내정보 처리 오류' });
  }
});

app.get('/api/srvc/myp/010200', async (req, res) => {
  try {
    const result = await processWebSrvcMyp010200(req.query || {});
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '시공사 탈회 조건 검증 오류' });
  }
});

app.patch('/api/srvc/myp/010201', async (req, res) => {
  try {
    const result = await processWebSrvcMyp010201(req.body || {});
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '시공사 회원 탈회 처리 오류' });
  }
});

app.post('/api/srvc/qot/010100', async (req, res) => {
  try {
    const result = await processWebSrvcQot010100(req.body || {});
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '확정가 청약 신청 오류' });
  }
});

app.get('/api/srvc/qot/020200', async (req, res) => {
  try {
    const result = await processWebSrvcQot020200(req.query || {});
    return res.status(result.status || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || '청약진행상태 상세 조회 오류' });
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
// [API 라우트] WEB-CLNT-MYP-020100 시공사 자격증/수료증/경력 검증 및 뱃지 연동
// ============================================================================

// 1. 통합 액션 디스패처 엔드포인트
app.all('/api/web/client/myp_020100', async (req, res) => {
  try {
    const result = await processWebClntMyp020100(req.body || {}, req.query || {}, req.method);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('❌ API Error (/api/web/client/myp_020100):', error);
    return res.status(500).json({ success: false, code: 'ERR_INTERNAL_SERVER', message: error.message });
  }
});

// 2. 표준 REST API 엔드포인트 5종
// (1) GET /api/v1/common-codes/certifications
app.get('/api/v1/common-codes/certifications', async (req, res) => {
  try {
    const result = await getCertificationCommonCodes({
      mainServiceCat: req.query.mainServiceCat || 'APPLIANCE',
      srvcNo: req.query.srvcNo,
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// (2) GET /api/v1/services/:srvcNo/certifications
app.get('/api/v1/services/:srvcNo/certifications', async (req, res) => {
  try {
    const result = await getServiceCertifications(req.params.srvcNo);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// (3) POST /api/v1/services/:srvcNo/certifications/upload
app.post('/api/v1/services/:srvcNo/certifications/upload', async (req, res) => {
  try {
    const result = await uploadCertificationFile({
      srvcNo: req.params.srvcNo,
      docType: req.body?.docType || 'LICENSE',
      fileData: req.body?.fileData,
      fileName: req.body?.fileName,
      mimeType: req.body?.mimeType,
      fileSize: req.body?.fileSize,
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// (4) PUT /api/v1/services/:srvcNo/certifications (Batch Sync / Upsert)
app.put('/api/v1/services/:srvcNo/certifications', async (req, res) => {
  try {
    const result = await saveServiceCertifications(req.params.srvcNo, {
      certifications: req.body?.certifications || [],
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// (5) PATCH /api/v1/admin/services/certifications/:certSeq/review
app.patch('/api/v1/admin/services/certifications/:certSeq/review', async (req, res) => {
  try {
    const result = await reviewServiceCertification(req.params.certSeq, {
      reviewStatus: req.body?.reviewStatus,
      rejectReason: req.body?.rejectReason,
      adminId: req.body?.adminId || 'ADMIN',
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

// ============================================================================
// [API 라우트] ALL /api/app/client/myp_020100 (APP-CLNT-MYP-020100 모바일 시공사 자격증/수료증 등록)
// ============================================================================
app.all('/api/app/client/myp_020100', async (req, res) => {
  try {
    const result = await processAppClntMyp020100(req.body || {}, req.query || {}, req.method);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('❌ API Error (/api/app/client/myp_020100):', error);
    return res.status(500).json({ success: false, code: 'ERR_INTERNAL_SERVER', message: error.message });
  }
});

// 정적 파일 서빙 (브라우저 강력 캐시 방지 적용: no-store, no-cache)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ============================================================================
// [공식 브랜드 로고 라우트] C:\SseulDakGo_Storage\project\brand\Logo_쓸고딱고.jpg 직결 서빙
// ============================================================================
const BRAND_STORAGE_DIR = 'C:\\SseulDakGo_Storage\\sseuldakgo\\logo';
const BRAND_STORAGE_DIR_LEGACY = 'C:\\SseulDakGo_Storage\\project\\brand';
const BRAND_LOGO_FILE = path.join(BRAND_STORAGE_DIR, 'Logo_쓸고딱고.jpg');

const serveBrandLogo = (req, res) => {
  if (fs.existsSync(BRAND_LOGO_FILE)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.sendFile(BRAND_LOGO_FILE);
  }
  const legacyLogo = path.join(BRAND_STORAGE_DIR_LEGACY, 'Logo_쓸고딱고.jpg');
  if (fs.existsSync(legacyLogo)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.sendFile(legacyLogo);
  }
  return res.sendFile(path.join(__dirname, 'logo.jpg'));
};

app.get([
  '/logo.png',
  '/logo.jpg',
  '/brand/logo',
  '/brand/logo.jpg',
  '/brand/Logo_쓸고딱고.jpg',
  '/storage/project/brand/Logo_쓸고딱고.jpg',
  '/storage/project/brand/Logo_%EC%93%B8%EA%B3%A0%EB%94%B1%EA%B3%A0.jpg'
], serveBrandLogo);

app.use(express.static(__dirname, { etag: false, lastModified: false }));
app.use('/preview', express.static(__dirname, { etag: false, lastModified: false }));
app.use('/public', express.static(path.join(__dirname, '../public'), { etag: false, lastModified: false }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), { etag: false, lastModified: false }));
app.use('/preview_client', express.static(path.join(__dirname, '../preview_client'), { etag: false, lastModified: false }));

// C 드라이브 외부 스토리지 마운트 서빙 (업계 표준 스토리지 격리 원칙)
const externalStoragePath = process.env.STORAGE_LOCAL_ROOT || 'C:\\SseulDakGo_Storage';
import fs from 'fs';
if (fs.existsSync(externalStoragePath)) {
  app.use('/storage', express.static(externalStoragePath));
  console.log(`📦 [Storage] 외부 로컬 스토리지 마운트 완료: ${externalStoragePath} -> /storage`);
}

// WEB-CLNT-MYP-020100 파트너 자격증 및 경력 검증 관리 프리뷰 라우트
app.get(['/myp_020100', '/myp_020100.html', '/preview/myp_020100', '/preview/myp_020100.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'myp_020100.html'));
});

// WEB-SRVC-JOB-020000 시공 파트너 현장 진행 현황 프리뷰 라우트
app.get(['/job_020000', '/job_020000.html', '/preview/job_020000', '/preview/job_020000.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'job_020000.html'));
});

// APP-CLNT-MYP-020100 모바일 파트너 자격증 및 경력 등록 프리뷰 라우트
app.get(['/app_myp_020100', '/app_myp_020100.html', '/preview/app_myp_020100', '/preview/app_myp_020100.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'app_myp_020100.html'));
});

// [WEB-SRVC-COM-010000] 시공사 파트너 메인 대시보드 통합 조회 (탭 건수, 탭 목록 10건 페이징, 내 활동 내역 조회)
app.get('/api/srvc/com/010000', async (req, res) => {
  try {
    const tab = String(req.query.tab || 'waiting-bid');
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, Math.min(50, parseInt(req.query.pageSize, 10) || 10));
    const actPage = Math.max(1, parseInt(req.query.actPage, 10) || 1);
    const cleaningType = String(req.query.cleaningType || 'ALL');

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0');
    const normDate = (val, fallback) => {
      const cleaned = String(val || '').trim().replace(/\./g, '-');
      return /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ? cleaned : fallback;
    };
    const dateFrom = normDate(req.query.dateFrom, `${y}-${m}-01`);
    const dateTo = normDate(req.query.dateTo, `${y}-${m}-${lastDay}`);

    const fromObj = new Date(`${dateFrom}T00:00:00`);
    const toObj = new Date(`${dateTo}T00:00:00`);
    const maxToObj = new Date(fromObj);
    maxToObj.setFullYear(maxToObj.getFullYear() + 1);
    if (fromObj > toObj || toObj > maxToObj) {
      return res.status(400).json({ success: false, message: '조회기간은 최대 1년까지만 조회 가능합니다.' });
    }

    const countRows = await executeQuery(
      `SELECT
         SUM(CASE WHEN M.ORDER_STATUS = 'BID_OPEN' THEN 1 ELSE 0 END) AS waitingBidCount,
         SUM(CASE WHEN M.ORDER_STATUS IN ('BID_APPLIED', 'PAY_WAIT_1', 'PAY_WAIT_2', 'PAYMENT_WAITING') THEN 1 ELSE 0 END) AS waitingPaymentCount,
         SUM(CASE WHEN M.ORDER_STATUS IN ('CONTRACTED', 'IN_PROGRESS', 'SVC_IN_PROGRESS', 'CLEANING_WAITING') THEN 1 ELSE 0 END) AS waitingCleaningCount
       FROM TB_ORDER_MSTR M`
    );
    const counts = countRows?.[0] || {};
    const tabCounts = {
      waitingBid: Number(counts.waitingBidCount || 0),
      waitingPayment: Number(counts.waitingPaymentCount || 0),
      waitingCleaning: Number(counts.waitingCleaningCount || 0),
    };

    const statusConditionMap = {
      'waiting-bid': "M.ORDER_STATUS = 'BID_OPEN'",
      'waiting-payment': "M.ORDER_STATUS IN ('BID_APPLIED', 'PAY_WAIT_1', 'PAY_WAIT_2', 'PAYMENT_WAITING')",
      'waiting-cleaning': "M.ORDER_STATUS IN ('CONTRACTED', 'IN_PROGRESS', 'SVC_IN_PROGRESS', 'CLEANING_WAITING')",
    };
    const statusWhere = statusConditionMap[tab] || statusConditionMap['waiting-bid'];
    const totalTabCount =
      tab === 'waiting-payment'
        ? tabCounts.waitingPayment
        : tab === 'waiting-cleaning'
          ? tabCounts.waitingCleaning
          : tabCounts.waitingBid;
    const totalTabPages = Math.max(1, Math.ceil(totalTabCount / pageSize));
    const safeTabPage = Math.min(page, totalTabPages);
    const tabOffset = (safeTabPage - 1) * pageSize;

    const tabRows = await executeQuery(
      `SELECT M.ORDER_NO,
              M.ORDER_STATUS,
              M.PROPOSED_PRICE,
              M.ADDR_TEXT,
              DATE_FORMAT(M.REG_DT, '%Y-%m-%d') AS regDate,
              D.CLEAN_LARGE_CD,
              D.SELECTED_SRV_ITEMS,
              D.SUPPLY_PYEONG
         FROM TB_ORDER_MSTR M
         JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
        WHERE ${statusWhere}
        ORDER BY M.REG_DT DESC
        LIMIT ? OFFSET ?`,
      [pageSize, tabOffset]
    );

    const catMap = {
      REGULAR: { badge: '정기청소', icon: 'repeat', iconBg: 'bg-surface-container-high text-tertiary', badgeCls: 'text-tertiary' },
      MOVE_IN: { badge: '입주·이사 청소', icon: 'cleaning_services', iconBg: 'bg-secondary-fixed text-secondary', badgeCls: 'text-secondary' },
      MOVEIN: { badge: '입주·이사 청소', icon: 'cleaning_services', iconBg: 'bg-secondary-fixed text-secondary', badgeCls: 'text-secondary' },
      APPLIANCE: { badge: '계절가전 분해케어', icon: 'mode_fan', iconBg: 'bg-primary-fixed text-primary', badgeCls: 'text-primary' },
    };

    const formatDoSi = (addr) => String(addr || '').trim().split(/\s+/).slice(0, 2).join(' ');
    const formatPrice = (val) => `${Number(val || 0).toLocaleString('ko-KR')}원`;
    const tabItems = (tabRows || []).map((r) => {
      const meta = catMap[r.CLEAN_LARGE_CD] || catMap.REGULAR;
      const scope = r.SELECTED_SRV_ITEMS || (r.SUPPLY_PYEONG ? `공급 ${r.SUPPLY_PYEONG}평형` : meta.badge);
      return {
        orderNo: r.ORDER_NO,
        badge: meta.badge,
        icon: meta.icon,
        title: formatDoSi(r.ADDR_TEXT) || `발주 ${r.ORDER_NO}`,
        tag: r.ORDER_STATUS === 'BID_OPEN' ? '신규 등록' : r.ORDER_STATUS,
        desc: `${scope} | 등록일: ${r.regDate} | 발주번호: ${r.ORDER_NO}`,
        price: formatPrice(r.PROPOSED_PRICE),
        fee: '16,500원',
        btn: '2차 데이터 이용료 결제',
      };
    });

    const userNo = String(req.query.userNo || '').trim();
    const actParams = [dateFrom, dateTo];
    let actWhere = 'DATE(M.REG_DT) BETWEEN ? AND ?';
    if (userNo) {
      actWhere += ' AND EXISTS (SELECT 1 FROM TB_QUOTE_APPLY Q WHERE Q.ORDER_NO = M.ORDER_NO AND Q.SERVICE_USER_NO = ?)';
      actParams.push(userNo);
    }
    if (cleaningType !== 'ALL') {
      if (cleaningType === 'MOVE_IN') {
        actWhere += " AND D.CLEAN_LARGE_CD IN ('MOVE_IN', 'MOVEIN')";
      } else {
        actWhere += ' AND D.CLEAN_LARGE_CD = ?';
        actParams.push(cleaningType);
      }
    }

    const actCountRows = await executeQuery(
      `SELECT COUNT(*) AS cnt
         FROM TB_ORDER_MSTR M
         JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
        WHERE ${actWhere}`,
      actParams
    );
    const totalActCount = Number(actCountRows?.[0]?.cnt || 0);
    const totalActPages = Math.max(1, Math.ceil(totalActCount / pageSize));
    const safeActPage = Math.min(actPage, totalActPages);
    const actOffset = (safeActPage - 1) * pageSize;

    const actRows = await executeQuery(
      `SELECT M.ORDER_NO,
              M.ORDER_STATUS,
              M.PROPOSED_PRICE,
              M.ADDR_TEXT,
              DATE_FORMAT(M.REG_DT, '%Y-%m-%d') AS regDate,
              D.CLEAN_LARGE_CD,
              D.SELECTED_SRV_ITEMS,
              D.SUPPLY_PYEONG
         FROM TB_ORDER_MSTR M
         JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
        WHERE ${actWhere}
        ORDER BY M.REG_DT DESC
        LIMIT ? OFFSET ?`,
      [...actParams, pageSize, actOffset]
    );

    const activities = (actRows || []).map((r) => {
      const meta = catMap[r.CLEAN_LARGE_CD] || catMap.REGULAR;
      const scope = r.SELECTED_SRV_ITEMS || (r.SUPPLY_PYEONG ? `공급 ${r.SUPPLY_PYEONG}평형` : meta.badge);
      return {
        id: r.ORDER_NO,
        type: r.CLEAN_LARGE_CD === 'MOVEIN' ? 'MOVE_IN' : r.CLEAN_LARGE_CD,
        badge: meta.badge,
        badgeCls: meta.badgeCls,
        icon: meta.icon,
        iconBg: meta.iconBg,
        title: r.ADDR_TEXT || `발주 ${r.ORDER_NO}`,
        desc: `${scope} | 등록일: ${r.regDate} | 상태: ${r.ORDER_STATUS}`,
        priceLabel: r.CLEAN_LARGE_CD === 'REGULAR' ? '고객 확정 지정가 (월)' : '고객 확정 지정가',
        price: formatPrice(r.PROPOSED_PRICE),
      };
    });

    let partnerCerts = [];
    if (userNo) {
      try {
        partnerCerts = await executeQuery(
          `SELECT CERT_NM, SERVICE_CAT
             FROM TB_SERVICE_CERT
            WHERE USER_NO = ?
            ORDER BY CASE WHEN CERT_DOC_TYPE = 'LICENSE' THEN 1 WHEN CERT_DOC_TYPE = 'COMPLETION' THEN 2 ELSE 3 END, REG_DT DESC
            LIMIT 12`,
          [userNo]
        );
      } catch (_) {}
    }

    const partnerSpecialties = Array.from(
      new Set((partnerCerts || []).map((c) => c.SERVICE_CAT).filter(Boolean))
    );

    let isBizRestricted = false;
    let partnerCompNm = null;
    if (userNo) {
      try {
        const docRows = await executeQuery(
          `SELECT COMP_NM, BIZ_REG_NO, CEO_NM, VERIFY_YN FROM TB_SERVICE_DOC WHERE USER_NO = ? LIMIT 1`,
          [userNo]
        );
        if (docRows && docRows.length > 0) {
          const doc = docRows[0];
          partnerCompNm = doc.COMP_NM || null;
          const noBizNo = !doc.BIZ_REG_NO || doc.BIZ_REG_NO === '000-00-00000';
          const noCeo = !doc.CEO_NM || doc.CEO_NM === '대표자';
          const badVerify = doc.VERIFY_YN === 'N';
          if (noBizNo || noCeo || badVerify) {
            isBizRestricted = true;
          }
        }
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      isBizRestricted,
      partnerCompNm,
      partnerSpecialties,
      partnerCerts: (partnerCerts || []).map((c) => c.CERT_NM).filter(Boolean),
      tabCounts,
      tabData: {
        items: tabItems,
        totalCount: totalTabCount,
        page: safeTabPage,
        totalPages: totalTabPages,
      },
      activityData: {
        items: activities,
        totalCount: totalActCount,
        page: safeActPage,
        totalPages: totalActPages,
      },
    });
  } catch (err) {
    console.error('[GET /api/srvc/com/010000] 오류:', err);
    return res.status(500).json({ success: false, message: '대시보드 조회 중 오류가 발생했습니다.' });
  }
});

import {
  handleGetPartnerLogo,
  handleUploadPartnerLogo,
  handleResetPartnerLogo,
} from '../SseulDakGo_Web/Service/backend/api_WEB_SRVC_COM_010100/route.js';

function parseMultipartLogo(req) {
  const ct = String(req.headers['content-type'] || '');
  const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!m || !Buffer.isBuffer(req.body)) return {};
  const boundary = `--${m[1] || m[2]}`;
  const raw = req.body.toString('latin1');
  const parts = raw.split(boundary).slice(1, -1);
  let userNo = '';
  let file = null;
  for (const part of parts) {
    const sep = part.indexOf('\r\n\r\n');
    if (sep === -1) continue;
    const header = part.slice(0, sep);
    const bodyStr = part.slice(sep + 4, part.endsWith('\r\n') ? -2 : undefined);
    if (header.includes('name="userNo"')) {
      userNo = Buffer.from(bodyStr, 'latin1').toString('utf8').trim();
    } else if (header.includes('name="logoFile"')) {
      const fnMatch = header.match(/filename="([^"]*)"/i);
      const mtMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
      file = {
        originalname: fnMatch ? Buffer.from(fnMatch[1], 'latin1').toString('utf8') : 'logo.png',
        mimetype: mtMatch ? mtMatch[1].trim() : 'image/png',
        buffer: Buffer.from(bodyStr, 'latin1'),
      };
    }
  }
  return { userNo, file };
}

// [WEB-SRVC-COM-010100] 파트너 대표 로고 이미지 조회 / 업로드 / 초기화
app.get('/api/srvc/com/010100', async (req, res) => {
  try {
    const userNo = String(req.query.userNo || '').trim();
    const result = await handleGetPartnerLogo(userNo);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[GET /api/srvc/com/010100] 오류:', err);
    return res.status(500).json({ success: false, message: '로고 조회 중 오류가 발생했습니다.' });
  }
});

app.post('/api/srvc/com/010100', express.raw({ type: 'multipart/form-data', limit: '6mb' }), async (req, res) => {
  try {
    const { userNo: bodyUserNo, file } = parseMultipartLogo(req);
    const userNo = String(bodyUserNo || req.query?.userNo || '').trim();
    const result = await handleUploadPartnerLogo({
      userNo,
      origName: file?.originalname,
      mimeType: file?.mimetype,
      buffer: file?.buffer,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[POST /api/srvc/com/010100] 오류:', err);
    return res.status(500).json({ success: false, message: '로고 저장 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/srvc/com/010100', async (req, res) => {
  try {
    const userNo = String(req.query.userNo || req.body?.userNo || '').trim();
    const result = await handleResetPartnerLogo(userNo);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[DELETE /api/srvc/com/010100] 오류:', err);
    return res.status(500).json({ success: false, message: '로고 초기화 중 오류가 발생했습니다.' });
  }
});

// 모바일 하이브리드 앱 웹뷰 프리뷰 라우트
app.get(['/app', '/app/client/com_000', '/app/client/req_000', '/preview/app', '/preview/app.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// 모든 HTML 요청에 대해 프리뷰 index.html 반환 (Express 5 호환, 캐시 방지 보장)
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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
