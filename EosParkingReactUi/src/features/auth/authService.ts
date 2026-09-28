import { apiRequest, ApiError, encryptLegacyPassword, isLegacyPasswordEncryptionConfigured } from '../../api/client';
import { isSuccessfulLegacyResponse, parseLoginResponse, parseSsoUserPreferences, readLoginPermissions, readLoginToken, readLoginUser, resolveCanManageDashboard, type SsoUserPreferences } from '../../api/contracts';
import type { HomeUser } from '../../pages/homeTypes';

export type LoginResult = { token: string | null; user: HomeUser; preferences?: SsoUserPreferences };

function parseUserLoginResponse(raw: unknown, fallbackUsername: string): LoginResult {
  const response = parseLoginResponse(raw);
  const value = readLoginUser(response);
  const responseType = response.ResponseResultType ?? response.responseResultType;
  const userId = value?.Id ?? value?.id ?? 0;
  if ((!isSuccessfulLegacyResponse(responseType) && !(responseType === undefined && Boolean(value))) || !value || userId === 0) {
    throw new ApiError(401, { message: response.Message ?? response.message ?? response.RealMessage ?? response.realMessage });
  }
  const permissions = readLoginPermissions(response, value);
  const permissionPart1 = String(value.AccessPermissionValuePart1 ?? value.accessPermissionValuePart1 ?? 0);
  const legacyAccessLevelId = Number(value.UserAccessLevelId ?? value.userAccessLevelId ?? 0);
  return {
    token: readLoginToken(response, value),
    preferences: parseSsoUserPreferences(value.PreferencesJson ?? value.preferencesJson ?? response.PreferencesJson ?? response.preferencesJson),
    user: {
      id: userId,
      userName: String(value.UserName ?? value.userName ?? fallbackUsername),
      currentParking: Number(value.CurrentParking ?? value.currentParking ?? 0),
      userType: Number(value.UserType ?? value.userType ?? 0),
      permissions,
      permissionPart1,
      permissionPart2: String(value.AccessPermissionValuePart2 ?? value.accessPermissionValuePart2 ?? 0),
      legacyAccessLevelId,
      canManageDashboard: resolveCanManageDashboard({ permissions, permissionPart1, legacyAccessLevelId, canManageDashboard: value.CanManageDashboard ?? value.canManageDashboard }),
    },
  };
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const passwordPayload = isLegacyPasswordEncryptionConfigured()
    ? { UserPass: encryptLegacyPassword(password), UserPassEncrypted: true }
    : { UserPass: password, UserPassEncrypted: false };
  const raw = await apiRequest<unknown>('api/user/Login', {
    method: 'POST',
    body: JSON.stringify({ UserName: username, ...passwordPayload }),
  });
  return parseUserLoginResponse(raw, username);
}

export async function loginWithSso(input: {
  issueCode: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<LoginResult> {
  const raw = await apiRequest<unknown>('api/user/SsoLogin', {
    method: 'POST',
    body: JSON.stringify({
      IssueCode: input.issueCode,
      ClientId: input.clientId,
      RedirectUri: input.redirectUri,
      CodeVerifier: input.codeVerifier,
    }),
  });
  return parseUserLoginResponse(raw, '');
}
