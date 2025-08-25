/**
 * API Token Management Utility
 */

// Get API token from environment or platform
export const getApiToken = (platformToken = null) => {
    // Priority: platform token > environment variable
    const token = platformToken || process.env.REACT_APP_APIFY_API_TOKEN;

    if (!token) {
        console.warn('No API token found. Please set REACT_APP_APIFY_API_TOKEN in your .env file or provide platform token.');
        return null;
    }

    return token;
};

// Validate API token format
export const validateApiToken = (token) => {
    if (!token) return false;

    // Apify API tokens typically start with 'apify_api_'
    const isValidFormat = /^apify_api_[a-zA-Z0-9]+$/.test(token);

    if (!isValidFormat) {
        console.warn('API token format may be invalid. Expected format: apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    }

    return isValidFormat;
};

// Check if API token is configured
export const isApiTokenConfigured = (platformToken = null) => {
    const token = getApiToken(platformToken);
    return !!token;
};

// Get token source for debugging
export const getTokenSource = (platformToken = null) => {
    if (platformToken) {
        return 'platform';
    } else if (process.env.REACT_APP_APIFY_API_TOKEN) {
        return 'environment';
    } else {
        return 'none';
    }
};

// Display token configuration status
export const logTokenStatus = (platformToken = null) => {
    const source = getTokenSource(platformToken);
    const isConfigured = isApiTokenConfigured(platformToken);
    if (!isConfigured) {
        console.warn('To configure API token:');
        console.warn('1. Create .env file in project root');
        console.warn('2. Add: REACT_APP_APIFY_API_TOKEN=your_token_here');
        console.warn('3. Restart development server');
    }
};
