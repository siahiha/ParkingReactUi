import { apiRequest, ApiError, encryptLegacyPassword } from '../../api/client';
import { isSuccessfulLegacyResponse, parseLoginResponse, readLoginPermissions, readLoginToken, readLoginUser, resolveCanManageDashboard } from '../../api/contracts';
import type { HomeUser } from '../../pages/homeTypes';

export type LoginResult = { token: string | null; user: HomeUser };

export async function login(username: string, password: string): Promise<LoginResult> {
  const raw = await apiRequest<unknown>('api/user/Login', {
    method: 'POST',
    body: JSON.stringify({ UserName: username, UserPass: encryptLegacyPassword(password), UserPassEncrypted: true }),
  });
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
    user: {
      id: userId,
      userName: String(value.UserName ?? value.userName ?? username),
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
