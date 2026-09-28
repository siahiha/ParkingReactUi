export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  anprSignalRUrl: import.meta.env.VITE_ANPR_SIGNALR_URL || 'http://localhost:3012/signalr',
  parkingServiceUrl: import.meta.env.VITE_PARKING_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  authTokenHeader: 'UserToken',
  // A non-empty value switches the web application to SSO-only login.
  ssoBaseUrl: import.meta.env.VITE_SSO_BASE_URL || (import.meta.env.MODE === 'test' ? '' : 'https://etspanel.elmosanat.com/'),
  ssoClientId: import.meta.env.VITE_SSO_CLIENT_ID || (import.meta.env.MODE === 'test' ? '' : 'Hsh123456'),
} as const;
