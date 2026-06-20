// packages/shared/src/utils/brand/brand.ts
// Patched to accept alphanumeric App IDs and add missing logo fallback

import configData from 'root/brand.config.json';

const isProduction = (): boolean => {
    // Detect production environment (you can customize this logic)
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
    return configData.platform?.description || 'AI-powered prop trading platform';
};

export const getPlatformLogo = (): string => {
    // Fallback to brand_logo if platform.logo is missing
    return configData.platform?.logo || configData.brand_logo || '/brand/brand-logo.svg';
};

export const getHomeUrl = (): string => {
    return configData.platform?.home_url || 'https://portal.thronexmarkets.org';
};

export const getHelpCentreUrl = (): string => {
    return configData.platform?.help_centre_url || 'https://portal.thronexmarkets.org/support';
};

export const getAppId = (): string => {
    // ✅ FIXED: Accept alphanumeric App IDs (string)
    const app_id = configData.app_id as { staging: string | number; production: string | number } | undefined;
    if (!app_id) return '16929';
    const env = isProduction() ? 'production' : 'staging';
    const id = app_id[env];
    // Return as string (numbers will be converted to string)
    return String(id || '16929');
};

export const getOAuthRedirectUri = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    const key = `oauth_redirect_uri_${env}` as keyof typeof configData.auth;
    return (configData.auth as any)?.[key] || '';
};

export const getOAuthScopes = (): string[] => {
    return configData.auth?.oauth_scopes || ['trade', 'account_manage'];
};

export const getDepositUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    const key = env as keyof typeof configData.deposit_url;
    return configData.deposit_url?.[key] || '';
};

export const getApiBaseUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    const key = env as keyof typeof configData.api;
    return configData.api?.[key] || 'https://api.thronexmarkets.org';
};

export const getApiCoreUrl = (): string => {
    const env = isProduction() ? 'production' : 'staging';
    const key = env as keyof typeof configData.api_core;
    return configData.api_core?.[key] || 'https://api.thronexmarkets.org';
};
