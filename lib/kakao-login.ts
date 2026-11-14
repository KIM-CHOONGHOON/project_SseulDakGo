/**
 * ============================================================================
 * [카카오 로그인 (Kakao Login OAuth 2.0) 공통 표준 모듈]
 * 파일 경로: lib/kakao-login.ts
 * 
 * [카카오 디벨로퍼스 공식 등록 명세]
 * - Application 이름: 쓸고딱고
 * - App ID: 1650108 (원본: 1650098, 비즈 앱)
 * - REST API 키: 335fba662bb52a43ffa73785a325c599
 * - JavaScript 키: d3c92872eaf3baa40716568b09553df3
 * - 네이티브 앱 키: 54025371a1f0217af1e8b71177c56435
 * - Callback URL: https://sseuldakgo.kr/api/auth/kakao/callback
 *                 http://localhost:3000/api/auth/kakao/callback
 * - 안드로이드 패키지: kr.sseuldakgo.android
 * - iOS Bundle ID: kr.sseuldakgo.iOS
 * ============================================================================
 */

import crypto from 'crypto';

export const KAKAO_LOGIN_CONFIG = {
  appName: process.env.KAKAO_LOGIN_APP_NAME || '쓸고딱고',
  appId: process.env.KAKAO_LOGIN_APP_ID || '1650108',
  restApiKey: process.env.KAKAO_LOGIN_REST_API_KEY || '335fba662bb52a43ffa73785a325c599',
  javascriptKey: process.env.KAKAO_LOGIN_JAVASCRIPT_KEY || 'd3c92872eaf3baa40716568b09553df3',
  nativeAppKey: process.env.KAKAO_LOGIN_NATIVE_APP_KEY || '54025371a1f0217af1e8b71177c56435',
  callbackUrl: process.env.KAKAO_LOGIN_CALLBACK_URL || 'https://sseuldakgo.kr/api/auth/kakao/callback',
  devCallbackUrl: process.env.KAKAO_LOGIN_DEV_CALLBACK_URL || 'http://localhost:3000/api/auth/kakao/callback',
  androidPackage: process.env.KAKAO_LOGIN_ANDROID_PACKAGE || 'kr.sseuldakgo.android',
  iosBundleId: process.env.KAKAO_LOGIN_IOS_BUNDLE_ID || 'kr.sseuldakgo.iOS',
};

/**
 * 프론트엔드 및 모바일 클라이언트에 노출 가능한 안전한 공개 설정 (REST API 키 엄격 제외)
 */
export function getPublicKakaoLoginConfig(origin: string = '') {
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('172.');
  const activeCallback = isLocal ? KAKAO_LOGIN_CONFIG.devCallbackUrl : KAKAO_LOGIN_CONFIG.callbackUrl;

  return {
    appName: KAKAO_LOGIN_CONFIG.appName,
    appId: KAKAO_LOGIN_CONFIG.appId,
    javascriptKey: KAKAO_LOGIN_CONFIG.javascriptKey,
    nativeAppKey: KAKAO_LOGIN_CONFIG.nativeAppKey,
    callbackUrl: activeCallback,
    androidPackage: KAKAO_LOGIN_CONFIG.androidPackage,
    iosBundleId: KAKAO_LOGIN_CONFIG.iosBundleId,
  };
}

/**
 * CSRF 방지를 위한 상태 토큰(State) 생성
 */
export function generateKakaoStateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 카카오 OAuth 2.0 인증 요청 인가 URL 생성
 */
export function getKakaoAuthUrl(options: {
  state?: string;
  redirectUri?: string;
  userRoleCd?: 'C' | 'S' | 'A';
} = {}) {
  const state = options?.state || generateKakaoStateToken();
  const redirectUri = options?.redirectUri || KAKAO_LOGIN_CONFIG.callbackUrl;
  const roleParam = options?.userRoleCd ? `&userRoleCd=${options.userRoleCd}` : '';

  const encodedRedirect = encodeURIComponent(`${redirectUri}${redirectUri.includes('?') ? '&' : '?'}${roleParam}`);
  const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_LOGIN_CONFIG.restApiKey}&redirect_uri=${encodedRedirect}&state=${encodeURIComponent(state)}`;

  return {
    url: authUrl,
    state,
  };
}

/**
 * 카카오 인가 코드(Code)를 Access Token으로 교환
 */
export async function exchangeKakaoToken(params: {
  code: string;
  redirectUri?: string;
}) {
  const { code, redirectUri } = params;
  const tokenUrl = 'https://kauth.kakao.com/oauth/token';

  const bodyParams = new URLSearchParams();
  bodyParams.append('grant_type', 'authorization_code');
  bodyParams.append('client_id', KAKAO_LOGIN_CONFIG.restApiKey);
  bodyParams.append('redirect_uri', redirectUri || KAKAO_LOGIN_CONFIG.callbackUrl);
  bodyParams.append('code', code);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Accept': 'application/json',
    },
    body: bodyParams.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[KAKAO_TOKEN_EXCHANGE_FAIL] Status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`[KAKAO_OAUTH_ERROR] ${data.error}: ${data.error_description || ''}`);
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    tokenType: data.token_type as string,
    expiresIn: Number(data.expires_in),
  };
}

/**
 * 카카오 Access Token을 통한 사용자 프로필(회원 정보) 조회
 */
export async function getKakaoUserProfile(accessToken: string) {
  const profileUrl = 'https://kapi.kakao.com/v2/user/me';

  const response = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[KAKAO_PROFILE_FETCH_FAIL] Status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const kakaoAccount = data.kakao_account || {};
  const profile = kakaoAccount.profile || {};

  // 한국 전화번호 포맷 정규화 (+82 10-1234-5678 -> 010-1234-5678)
  let normalizedPhone = kakaoAccount.phone_number || null;
  if (normalizedPhone) {
    normalizedPhone = normalizedPhone
      .replace(/^\+82\s?/, '0')
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  }

  return {
    id: String(data.id),
    email: kakaoAccount.email || null,
    name: kakaoAccount.name || profile.nickname || null,
    nickname: profile.nickname || null,
    mobile: normalizedPhone,
    profileImage: profile.profile_image_url || null,
  };
}

/**
 * 카카오 OAuth 인가 콜백 통합 처리기
 */
export async function processKakaoAuthCallback(params: {
  code: string;
  state?: string;
  userRoleCd?: 'C' | 'S' | 'A';
  redirectUri?: string;
}) {
  const { code, userRoleCd = 'C', redirectUri } = params;

  // 1. 토큰 교환
  const tokenResult = await exchangeKakaoToken({ code, redirectUri });

  // 2. 프로필 조회
  const profile = await getKakaoUserProfile(tokenResult.accessToken);

  return {
    success: true,
    isRegisteredUser: false,
    profile: {
      ...profile,
      userRoleCd,
      provider: 'KAKAO',
    },
    message: '카카오 계정 인증이 성공적으로 완료되었습니다.',
  };
}

