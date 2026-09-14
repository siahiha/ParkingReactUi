import { describe, expect, it } from 'vitest';
import {
  isSuccessfulLegacyResponse,
  parseAuthSession,
  parseLoginResponse,
  permissionNames,
  readLoginPermissions,
  resolveCanManageDashboard,
} from './contracts';

describe('API contracts', () => {
  it('rejects malformed login responses instead of silently accepting them', () => {
    expect(() => parseLoginResponse({ Values: { Id: 'not-a-number' } })).toThrow();
  });

  it('recognizes the Windows Ok values and rejects unknown values', () => {
    expect(isSuccessfulLegacyResponse('success')).toBe(true);
    expect(isSuccessfulLegacyResponse(1)).toBe(true);
    expect(isSuccessfulLegacyResponse('unexpected')).toBe(false);
  });

  it('reads named permissions from the normalized login response', () => {
    const response = parseLoginResponse({
      ResponseResultType: 'success',
      Values: { Id: 7, Permissions: [permissionNames.manageParking] },
    });
    expect(readLoginPermissions(response, response.Values ?? null)).toEqual([permissionNames.manageParking]);
  });

  it('rejects invalid persisted sessions', () => {
    expect(parseAuthSession({ token: 'x', user: { id: 1 } })).toBeNull();
  });

  it('keeps the legacy manager fallback when the backend also sends unrelated permissions', () => {
    expect(resolveCanManageDashboard({ permissions: ['legacy.permission'], legacyAccessLevelId: 1, permissionPart1: '0' })).toBe(true);
    expect(resolveCanManageDashboard({ permissions: [], legacyAccessLevelId: 0, permissionPart1: String(1n << 32n) })).toBe(true);
    expect(resolveCanManageDashboard({ permissions: ['legacy.permission'], legacyAccessLevelId: 0, permissionPart1: '0' })).toBe(false);
  });

  it('accepts 64-bit permission masks returned as strings', () => {
    const response = parseLoginResponse({
      ResponseResultType: 1,
      Values: { Id: 7, AccessPermissionValuePart1: String(1n << 56n) },
    });
    expect(response.Values?.AccessPermissionValuePart1).toBe(String(1n << 56n));
  });
});
