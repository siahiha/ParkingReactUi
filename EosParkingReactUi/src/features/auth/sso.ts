import { apiRequest } from '../../api/client';
import { appConfig } from '../../config';

const pendingSsoKey = 'eos-parking-pending-sso';
const pendingLifetimeMs = 10 * 60 * 1000;

type PendingSso = {
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  state: string;
  createdAt: number;
};

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function randomBase64Url(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

async function getSsoPkcePair() {
  const raw = await apiRequest<unknown>('api/user/SsoPkce', { method: 'POST' });
  type PkceValue = {
    CodeVerifier?: unknown;
    codeVerifier?: unknown;
    CodeVerifierChallenge?: unknown;
    codeVerifierChallenge?: unknown;
  };
  const response = raw as {
    Values?: PkceValue | null;
    values?: PkceValue | null;
    Message?: string | null;
    message?: string | null;
    RealMessage?: string | null;
    realMessage?: string | null;
  };
  const value = response.Values ?? response.values;
  const codeVerifier = value?.CodeVerifier ?? value?.codeVerifier;
  const codeVerifierChallenge = value?.CodeVerifierChallenge ?? value?.codeVerifierChallenge;

  if (typeof codeVerifier !== 'string' || typeof codeVerifierChallenge !== 'string' ||
      !codeVerifier || !codeVerifierChallenge) {
    throw new Error(response.Message || response.message || response.RealMessage || response.realMessage ||
      'اطلاعات PKCE از API دریافت نشد.');
  }

  return { codeVerifier, codeVerifierChallenge };
}

export async function beginSsoLogin() {
  const baseUrl = appConfig.ssoUiBaseUrl.trim();
  const clientId = appConfig.ssoClientId.trim();
  if (!baseUrl) throw new Error('SSO is not configured.');
  if (!clientId) throw new Error('SSO client id is not configured.');

  const { codeVerifier, codeVerifierChallenge } = await getSsoPkcePair();
  const state = randomBase64Url(24);
  const redirectUri = `${window.location.origin}/sso/callback`;

  const pending: PendingSso = {
    clientId,
    redirectUri,
    codeVerifier,
    state,
    createdAt: Date.now(),
  };
  window.sessionStorage.setItem(pendingSsoKey, JSON.stringify(pending));

  const authorizationUrl = new URL('sso', normalizeBaseUrl(baseUrl));
  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('code_challenge', codeVerifierChallenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');
  authorizationUrl.searchParams.set('operation', 'authorize');
  window.location.assign(authorizationUrl.toString());
}

export function consumeSsoCallback() {
  const query = new URLSearchParams(window.location.search);
  const error = query.get('error');
  if (error) throw new Error(query.get('error_description') || error);

  // Accept the current provider name and the older OAuth callback name.
  const authorizationCode = query.get('authorizationCode') ?? query.get('code');
  if (!authorizationCode) throw new Error('SSO authorization code was not returned.');

  const rawPending = window.sessionStorage.getItem(pendingSsoKey);
  if (!rawPending) throw new Error('The SSO login request has expired.');

  let pending: PendingSso;
  try {
    pending = JSON.parse(rawPending) as PendingSso;
  } catch {
    throw new Error('The SSO login request is invalid.');
  }

  if (!pending.codeVerifier || !pending.clientId || !pending.redirectUri ||
      Date.now() - pending.createdAt > pendingLifetimeMs) {
    throw new Error('The SSO login request has expired.');
  }

  // The current SSO callback does not echo state. If it is returned by a
  // newer provider version, validate it; PKCE still binds this code to the
  // verifier stored in this browser session.
  const returnedState = query.get('state');
  if (returnedState && returnedState !== pending.state) {
    throw new Error('The SSO state is invalid.');
  }

  return { authorizationCode, ...pending };
}

export function clearPendingSso() {
  window.sessionStorage.removeItem(pendingSsoKey);
}
