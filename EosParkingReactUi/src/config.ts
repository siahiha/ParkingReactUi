const ssoEnabled = import.meta.env.VITE_SSO_ENABLED === 'true'
  || (import.meta.env.VITE_SSO_ENABLED === undefined && import.meta.env.MODE !== 'development' && import.meta.env.MODE !== 'test');

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  anprSignalRUrl: import.meta.env.VITE_ANPR_SIGNALR_URL || 'http://localhost:3012/signalr',
  parkingServiceUrl: import.meta.env.VITE_PARKING_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  // SSO is opt-in for local development and remains enabled by default in production.
  ssoBaseUrl: ssoEnabled ? (import.meta.env.VITE_SSO_BASE_URL || 'https://etspanel.elmosanat.com/') : '',
  ssoClientId: ssoEnabled ? (import.meta.env.VITE_SSO_CLIENT_ID || 'Hsh123456') : '',
} as const;
