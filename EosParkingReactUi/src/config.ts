type RuntimeSsoConfig = {
  enabled?: unknown;
  ssoUiBaseUrl?: unknown;
  clientId?: unknown;
  Enabled?: unknown;
  SsoUiBaseUrl?: unknown;
  ClientId?: unknown;
};

type RuntimeConfigFile = {
  apiBaseUrl?: unknown;
  anprSignalRUrl?: unknown;
  hshDetectionApiKey?: unknown;
  parkingServiceUrl?: unknown;
};

type ClientConfigResponse = {
  Values?: RuntimeConfigFile & { Sso?: RuntimeSsoConfig; sso?: RuntimeSsoConfig };
  values?: RuntimeConfigFile & { Sso?: RuntimeSsoConfig; sso?: RuntimeSsoConfig };
};

export type AppConfig = {
  apiBaseUrl: string;
  anprSignalRUrl: string;
  hshDetectionApiKey: string;
  parkingServiceUrl: string;
  ssoUiBaseUrl: string;
  ssoClientId: string;
};

const compileTimeConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  anprSignalRUrl: import.meta.env.VITE_ANPR_SIGNALR_URL || 'http://localhost:3012/signalr',
  hshDetectionApiKey: import.meta.env.VITE_HSH_DETECTION_API_KEY || '',
  parkingServiceUrl: import.meta.env.VITE_PARKING_SERVICE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/',
  ssoUiBaseUrl: '',
  ssoClientId: '',
};

export let appConfig: AppConfig = compileTimeConfig;
export let isSsoEnabled = false;

function stringValue(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function nonEmptyStringValue(value: unknown, fallback: string) {
  const result = stringValue(value, fallback);
  return result.trim() ? result : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.trim().toLowerCase() === 'true') return true;
    if (value.trim().toLowerCase() === 'false') return false;
  }
  return fallback;
}

function runtimeConfigUrl() {
  return `${import.meta.env.BASE_URL}config.json`;
}

function apiClientConfigUrl(apiBaseUrl: string) {
  return `${apiBaseUrl.replace(/\/$/, '')}/api/Utils/GetClientConfig`;
}

function readConfigValue(source: RuntimeConfigFile | undefined, lowerName: keyof RuntimeConfigFile) {
  if (!source) return undefined;
  const upperName = `${lowerName.charAt(0).toUpperCase()}${lowerName.slice(1)}` as keyof RuntimeConfigFile;
  return source[lowerName] ?? source[upperName];
}

function readSsoConfig(source: RuntimeConfigFile | undefined) {
  if (!source) return undefined;
  const config = source as RuntimeConfigFile & { Sso?: RuntimeSsoConfig; sso?: RuntimeSsoConfig };
  return config.Sso ?? config.sso;
}

function readSsoValue(source: RuntimeSsoConfig, lowerName: 'enabled' | 'ssoUiBaseUrl' | 'clientId') {
  const upperName = `${lowerName.charAt(0).toUpperCase()}${lowerName.slice(1)}` as keyof RuntimeSsoConfig;
  return source[lowerName] ?? source[upperName];
}

async function fetchJson<T>(url: string, timeoutMs = 10_000): Promise<T | undefined> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { cache: 'no-store', credentials: 'include', signal: controller.signal });
    if (!response.ok) return undefined;
    return await response.json() as T;
  } catch {
    return undefined;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

/**
 * Loads the bootstrap API address from the file beside the built frontend and
 * receives public client settings from the API before React is mounted.
 * SSO is intentionally fail-closed: if the API configuration cannot be read,
 * the regular username/password login remains available.
 */
export async function loadRuntimeConfig() {
  const bootstrap = await fetchJson<RuntimeConfigFile>(runtimeConfigUrl()) ?? {};
  const bootstrapApiBaseUrl = nonEmptyStringValue(readConfigValue(bootstrap, 'apiBaseUrl'), compileTimeConfig.apiBaseUrl);
  const apiResponse = await fetchJson<ClientConfigResponse>(apiClientConfigUrl(bootstrapApiBaseUrl));
  const apiConfig = apiResponse?.Values ?? apiResponse?.values;
  const runtimeSso = readSsoConfig(apiConfig) ?? {};
  const ssoUiBaseUrl = stringValue(readSsoValue(runtimeSso, 'ssoUiBaseUrl'), '');
  const ssoClientId = stringValue(readSsoValue(runtimeSso, 'clientId'), '');
  const ssoEnabled = booleanValue(readSsoValue(runtimeSso, 'enabled'), false) && Boolean(ssoUiBaseUrl.trim()) && Boolean(ssoClientId.trim());

  appConfig = {
    apiBaseUrl: nonEmptyStringValue(readConfigValue(apiConfig, 'apiBaseUrl'), bootstrapApiBaseUrl),
    anprSignalRUrl: stringValue(readConfigValue(apiConfig, 'anprSignalRUrl'), stringValue(readConfigValue(bootstrap, 'anprSignalRUrl'), compileTimeConfig.anprSignalRUrl)),
    hshDetectionApiKey: stringValue(readConfigValue(apiConfig, 'hshDetectionApiKey'), stringValue(readConfigValue(bootstrap, 'hshDetectionApiKey'), compileTimeConfig.hshDetectionApiKey)),
    parkingServiceUrl: stringValue(readConfigValue(apiConfig, 'parkingServiceUrl'), stringValue(readConfigValue(bootstrap, 'parkingServiceUrl'), compileTimeConfig.parkingServiceUrl)),
    ssoUiBaseUrl: ssoEnabled ? ssoUiBaseUrl : '',
    ssoClientId: ssoEnabled ? ssoClientId : '',
  };
  isSsoEnabled = ssoEnabled;
}
