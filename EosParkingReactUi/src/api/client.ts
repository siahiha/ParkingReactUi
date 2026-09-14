import { appConfig } from '../config';
import CryptoJS from 'crypto-js';

let authToken: string | null = null;

// Compatibility with the existing Windows Login contract.
// The Backend expects UserPassEncrypted=true and this exact legacy AES setup.
const legacyEncryptionPassword = '!Pe56kin01gPar?';
const legacyEncryptionIv = CryptoJS.enc.Hex.parse('410D0D345025252F020278783B766161');

export function encryptLegacyPassword(password: string) {
  const key = CryptoJS.MD5(legacyEncryptionPassword);
  return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(password), key, {
    iv: legacyEncryptionIv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

export type ApiRequestOptions = RequestInit & {
  /** Prevent an operation from hanging forever when the network is unavailable. */
  timeoutMs?: number;
};

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (authToken) headers.set(appConfig.authTokenHeader, authToken);

  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? 15_000;
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const callerSignal = init.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) abortFromCaller();
    else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    const response = await fetch(`${appConfig.apiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
      ...init,
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = await response.text().catch(() => null);
      }
      throw new ApiError(response.status, body);
    }
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) return (await response.text()) as T;
    return response.json() as Promise<T>;
  } finally {
    globalThis.clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
}
