/**
 * ============================================================================
 * [네이버 아이디로 로그인 (Naver Login OAuth 2.0) 공통 표준 모듈]
 * 파일 경로: lib/naver-login.js (컴파일: lib/naver-login.js)
 * 
 * [네이버 오픈API 애플리케이션 등록 명세]
 * - Application 이름: 쓸고닦고
 * - Client ID: IFXxPCUqMk1EUp2OqRIp
 * - Client Secret: 5s2v8d14Gt
 * - Callback URL: https://sseuldakgo.kr/api/auth/naver/callback
 *                 http://localhost:3000/api/auth/naver/callback
 * - 안드로이드 패키지: kr.sseuldakgo.android
 * - iOS Bundle ID: kr.sseuldakgo.iOS
 * - URL Scheme: sseuldakgo
 * ============================================================================
 */

import crypto from 'crypto';

export const NAVER_LOGIN_CONFIG = {
  appName: process.env.NAVER_LOGIN_APP_NAME || '쓸고닦고',
  clientId: process.env.NAVER_LOGIN_CLIENT_ID || 'IFXxPCUqMk1EUp2OqRIp',
  clientSecret: process.env.NAVER_LOGIN_CLIENT_SECRET || '5s2v8d14Gt',
  callbackUrl: process.env.NAVER_LOGIN_CALLBACK_URL || 'https://sseuldakgo.kr/api/auth/naver/callback',
  devCallbackUrl: process.env.NAVER_LOGIN_DEV_CALLBACK_URL || 'http://localhost:3000/api/auth/naver/callback',
  appScheme: process.env.NAVER_LOGIN_APP_SCHEME || 'sseuldakgo',
  androidPackage: process.env.NAVER_LOGIN_ANDROID_PACKAGE || 'kr.sseuldakgo.android',
  iosBundleId: process.env.NAVER_LOGIN_IOS_BUNDLE_ID || 'kr.sseuldakgo.iOS',
};

/**
 * 프론트엔드 및 모바일 클라이언트에 노출 가능한 안전한 공개 설정 (Client Secret 엄격 제외)
 */
export function getPublicNaverLoginConfig(origin = '') {
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('172.');
  const activeCallback = isLocal ? NAVER_LOGIN_CONFIG.devCallbackUrl : NAVER_LOGIN_CONFIG.callbackUrl;

  return {
    appName: NAVER_LOGIN_CONFIG.appName,
    clientId: NAVER_LOGIN_CONFIG.clientId,
    callbackUrl: activeCallback,
    appScheme: NAVER_LOGIN_CONFIG.appScheme,
    androidPackage: NAVER_LOGIN_CONFIG.androidPackage,
    iosBundleId: NAVER_LOGIN_CONFIG.iosBundleId,
  };
}

/**
 * CSRF 방지를 위한 상태 토큰(State) 생성
 */
export function generateNaverStateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 네이버 OAuth 2.0 인증 요청 URL 생성
 */
export function getNaverAuthUrl(options = {}) {
  const state = options?.state || generateNaverStateToken();
  const redirectUri = options?.redirectUri || NAVER_LOGIN_CONFIG.callbackUrl;
  const roleParam = options?.userRoleCd ? `&userRoleCd=${options.userRoleCd}` : '';

  const encodedRedirect = encodeURIComponent(`${redirectUri}${redirectUri.includes('?') ? '&' : '?'}${roleParam}`);
  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_LOGIN_CONFIG.clientId}&redirect_uri=${encodedRedirect}&state=${encodeURIComponent(state)}`;

  return {
    url: authUrl,
    state,
  };
}

/**
 * 네이버 인가 코드(Code)를 Access Token으로 교환
 */
export async function exchangeNaverToken(params = {}) {
  const { code, state, redirectUri } = params;

  const tokenUrl = new URL('https://nid.naver.com/oauth2.0/token');
  tokenUrl.searchParams.set('grant_type', 'authorization_code');
  tokenUrl.searchParams.set('client_id', NAVER_LOGIN_CONFIG.clientId);
  tokenUrl.searchParams.set('client_secret', NAVER_LOGIN_CONFIG.clientSecret);
  tokenUrl.searchParams.set('code', code);
  tokenUrl.searchParams.set('state', state);
  if (redirectUri) {
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
  }

  const response = await fetch(tokenUrl.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[NAVER_TOKEN_EXCHANGE_FAIL] Status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`[NAVER_OAUTH_ERROR] ${data.error}: ${data.error_description || ''}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    expiresIn: Number(data.expires_in),
  };
}

/**
 * 네이버 Access Token을 통한 사용자 프로필(회원 정보) 조회
 */
export async function getNaverUserProfile(accessToken) {
  const profileUrl = 'https://openapi.naver.com/v1/nid/me';

  const response = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[NAVER_PROFILE_FETCH_FAIL] Status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.resultcode !== '00') {
    throw new Error(`[NAVER_PROFILE_ERROR] ${data.resultcode}: ${data.message || '프로필 조회 실패'}`);
  }

  const res = data.response || {};

  return {
    id: res.id,
    email: res.email || null,
    name: res.name || null,
    mobile: res.mobile || null,
    nickname: res.nickname || null,
    profileImage: res.profile_image || null,
    age: res.age || null,
    gender: res.gender || null,
    birthday: res.birthday || null,
    birthyear: res.birthyear || null,
  };
}

/**
 * 네이버 간편 로그인 / 회원가입 통합 처리기
 */
export async function processNaverAuthCallback(params = {}) {
  const { code, state, userRoleCd = 'C', redirectUri } = params;

  // 1. 토큰 교환
  const tokenData = await exchangeNaverToken({ code, state, redirectUri });

  // 2. 프로필 조회
  const profile = await getNaverUserProfile(tokenData.accessToken);

  // 3. DB 연결 및 가입 회원 조회
  let db = null;
  try {
    db = await import('./db.js');
  } catch {
    db = null;
  }

  if (db && typeof db.executeQuery === 'function') {
    const users = await db.executeQuery(
      `SELECT USER_NO, USER_ROLE_CD, USER_EMAIL, USER_NM, USER_TEL, USER_STAT_CD, SUSPEND_EXPIRE_DT
       FROM TB_USER
       WHERE SOCIAL_PROVIDER = 'NAVER' AND SOCIAL_UID = ? AND USER_ROLE_CD = ?
       LIMIT 1`,
      [profile.id, userRoleCd]
    );

    if (users && users.length > 0) {
      const user = users[0];

      if (user.USER_STAT_CD === 'SUSPENDED_7D' && user.SUSPEND_EXPIRE_DT && new Date(user.SUSPEND_EXPIRE_DT) > new Date()) {
        throw new Error(`운영 정책 위반으로 계정이 정지되었습니다. (정지 해제일: ${user.SUSPEND_EXPIRE_DT})`);
      }

      await db.executeQuery('UPDATE TB_USER SET LAST_LOGIN_DT = NOW() WHERE USER_NO = ?', [user.USER_NO]);

      return {
        success: true,
        isRegisteredUser: true,
        user: {
          userNo: user.USER_NO,
          userNm: user.USER_NM,
          userEmail: user.USER_EMAIL,
          userTel: user.USER_TEL,
          userRoleCd: user.USER_ROLE_CD,
          accessToken: `jwt_naver_${user.USER_NO}_${Date.now()}`,
        },
        profile,
        message: '네이버 계정으로 정상 로그인되었습니다.',
      };
    }
  }

  // 가입되지 않은 신규 회원 -> 네이버 프로필 정보 반환
  return {
    success: true,
    isRegisteredUser: false,
    profile,
    message: '네이버 인증이 완료되었습니다. 서비스 이용약관 동의 및 회원가입을 완료해 주세요.',
  };
}

