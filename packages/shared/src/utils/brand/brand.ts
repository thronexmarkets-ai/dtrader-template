// packages/shared/src/utils/brand/brand.ts
// Patched to accept alphanumeric App IDs and add missing logo fallback

import configData from '../../../../../brand.config.json';

const isProduction = (): boolean => {
    return process.env.NODE_ENV === 'production';
};

export const getBrandName = (): string => {
    return configData.brand_name || 'Thronex Markets';
};

export const getBrandDomain = (): string => {
    return configData.brand_domain || 'trade.thronexmarkets.org';
};

export const getPlatformName = (): string => {
    return configData.platform?.name || 'Thronex Trading';
};

export const getPlatformDescription = (): string => {
    return configData.platform?.description || 'AI-powered trading platform';
};

export const getPlatformLogo = (): string => {
    return configData.brand_logo || '/brand/brand-logo.svg';
};

export const getHomeUrl = (): string => {
    return configData.platform?.home_url || 'https://portal.thronexmarkets.org';
};

export const getHelpCentreUrl = (): string => {
    return configData.platform?.help_centre_url || 'https://portal.thronexmarkets.org/support';
};

export const getAppId = (): string => {
    const app_id = configData.app_id;
    if (!app_id) return '16929';
    const env = isProduction() ? 'production' : 'staging';
    const id = app_id[env];
    return String(id || '16929');
};

export const getOAuthRedirectUri = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    const key = `oauth_redirect_uri_${env}`;
    // @ts-ignore – auth may have these keys
    return configData.auth?.[key] || '';
};

export const getOAuthClientId = (): string => {
    return configData.auth?.oauth_client_id || '';
};

export const getOAuthScopes = (): string[] => {
    return configData.auth?.oauth_scopes || ['trade', 'account_manage'];
};

export const getSignupUrl = (): string => {
    return configData.auth?.signup_url || `${getHomeUrl()}/signup`;
};

export const getTrustedDomainName = (): string => {
    return configData.auth?.trusted_domain || window.location.hostname;
};

export const getDepositUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    // ✅ Fix: use type assertion because staging may not exist
    return (configData.deposit_url as any)?.[env] || configData.deposit_url?.production || '';
};

export const getApiBaseUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    return configData.api?.[env] || 'https://api.thronexmarkets.org';
};

export const getApiCoreUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    return configData.api_core?.[env] || 'https://api.thronexmarkets.org';
};

// Aliases for backward compatibility
export const getWebSocketURL = getApiBaseUrl;
export const getBrandUrl = getHomeUrl;
export const getBrandHomeUrl = getHomeUrl;
export const getAuthBaseUrl = getApiBaseUrl;
export const getOAuthAppId = getAppId;