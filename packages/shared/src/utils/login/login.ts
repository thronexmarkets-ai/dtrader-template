// packages/shared/src/utils/login/login.ts
import { getApiBaseUrl, getHomeUrl } from '../brand';

// ---------------------------------------------------------------------------
// OAuth configuration (fallback to environment variables)
// ---------------------------------------------------------------------------
const getOAuthAppId = (): string => process.env.OAUTH_APP_ID || '';
const getOAuthClientId = (): string => process.env.OAUTH_CLIENT_ID || '';
const getOAuthRedirectUri = (): string => process.env.OAUTH_REDIRECT_URI || '';

// Auth base URL – use the API base (assumes same domain)
const getAuthBaseUrl = (): string => getApiBaseUrl();

// Signup URL – construct from home URL
const getSignupUrl = (): string => `${getHomeUrl()}/signup`;

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const PKCE_VERIFIER_KEY = 'oauth_code_verifier';
const PKCE_EXPIRY_KEY = 'oauth_code_verifier_timestamp';

const storePKCEVerifier = (verifier: string): void => {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_EXPIRY_KEY, String(Date.now()));
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const redirectToLogin = async (_language?: string): Promise<void> => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    storePKCEVerifier(verifier);

    const csrf_token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    sessionStorage.setItem('oauth_csrf_token', csrf_token);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: getOAuthClientId(),
        redirect_uri: getOAuthRedirectUri(),
        scope: 'trade',
        state: csrf_token,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    });
    const oauth_app_id = getOAuthAppId();
    if (oauth_app_id) params.set('app_id', oauth_app_id);

    const auth_url = `${getAuthBaseUrl()}/oauth2/auth?${params}`;
    window.location.replace(auth_url);
};

export const redirectToSignUp = (_language?: string): void => {
    const signup_url = getSignupUrl();
    if (signup_url) window.open(signup_url, '_blank', 'noopener,noreferrer');
};