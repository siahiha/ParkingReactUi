import { z } from 'zod';

const nullableNumber = z.number().nullable().optional();
const nullableString = z.string().nullable().optional();
const nullableNumericValue = z.union([z.number(), z.string()]).nullable().optional();

export const permissionNames = {
  manageParking: 'system.parking.manage',
  manageUsers: 'parking.users.manage',
  manageAccess: 'system.access.manage',
  viewReports: 'parking.reports.view',
} as const;

const loginUserSchema = z.object({
  Id: nullableNumber,
  id: nullableNumber,
  UserName: nullableString,
  userName: nullableString,
  CurrentParking: nullableNumber,
  currentParking: nullableNumber,
  UserAccessLevelId: nullableNumber,
  userAccessLevelId: nullableNumber,
  UserType: nullableNumber,
  userType: nullableNumber,
  // Legacy .NET long values may arrive as JSON numbers or strings. Keep the
  // string form when available so 64-bit permission masks are not rounded.
  AccessPermissionValuePart1: nullableNumericValue,
  accessPermissionValuePart1: nullableNumericValue,
  AccessPermissionValuePart2: nullableNumericValue,
  accessPermissionValuePart2: nullableNumericValue,
  CanManageDashboard: z.boolean().optional(),
  canManageDashboard: z.boolean().optional(),
  UserToken: nullableString,
  userToken: nullableString,
  Token: nullableString,
  token: nullableString,
  Permissions: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
}).passthrough();

export const loginResponseSchema = z.object({
  ResponseResultType: z.union([z.string(), z.number()]).nullable().optional(),
  responseResultType: z.union([z.string(), z.number()]).nullable().optional(),
  Values: loginUserSchema.nullable().optional(),
  values: loginUserSchema.nullable().optional(),
  Message: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  RealMessage: z.string().nullable().optional(),
  realMessage: z.string().nullable().optional(),
  UserToken: z.string().nullable().optional(),
  userToken: z.string().nullable().optional(),
  Token: z.string().nullable().optional(),
  token: z.string().nullable().optional(),
  Permissions: z.array(z.string()).nullable().optional(),
  permissions: z.array(z.string()).nullable().optional(),
}).passthrough();

export type LoginApiResponse = z.infer<typeof loginResponseSchema>;

export type AuthSession = {
  token: string | null;
  user: {
    id: number;
    userName: string;
    currentParking: number;
    userType?: number;
    permissions: string[];
    permissionPart1?: string;
    permissionPart2?: string;
    legacyAccessLevelId?: number;
    canManageDashboard?: boolean;
  };
};

const authSessionSchema = z.object({
  token: z.string().nullable(),
  user: z.object({
    id: z.number().int().nonnegative(),
    userName: z.string().min(1),
    currentParking: z.number().int().nonnegative(),
    permissions: z.array(z.string()).default([]),
    permissionPart1: z.string().optional(),
    permissionPart2: z.string().optional(),
    legacyAccessLevelId: z.number().int().nonnegative().optional(),
    canManageDashboard: z.boolean().optional(),
  }),
});

export function parseLoginResponse(input: unknown): LoginApiResponse {
  return loginResponseSchema.parse(input);
}

export function parseAuthSession(input: unknown): AuthSession | null {
  const result = authSessionSchema.safeParse(input);
  return result.success ? result.data : null;
}

export function isSuccessfulLegacyResponse(responseType: string | number | null | undefined): boolean {
  const normalized = String(responseType ?? '').trim().toLowerCase();
  // The Windows backend uses ResponseResultTypes.Ok = 1. Some legacy successful
  // responses omit the enum wrapper, so the caller must additionally require a
  // valid user before accepting an omitted value.
  return normalized === 'ok' || normalized === 'success' || normalized === '0' || normalized === '1';
}

export function readLoginUser(response: LoginApiResponse) {
  return response.Values ?? response.values ?? null;
}

export function readLoginToken(response: LoginApiResponse, user: ReturnType<typeof readLoginUser>) {
  return response.UserToken ?? response.userToken ?? response.Token ?? response.token
    ?? user?.UserToken ?? user?.userToken ?? user?.Token ?? user?.token ?? null;
}

export function readLoginPermissions(response: LoginApiResponse, user: ReturnType<typeof readLoginUser>): string[] {
  return response.Permissions ?? response.permissions ?? user?.Permissions ?? user?.permissions ?? [];
}

export function resolveCanManageDashboard(input: {
  permissions?: string[];
  legacyAccessLevelId?: number;
  permissionPart1?: string;
  canManageDashboard?: boolean;
}) {
  if (input.canManageDashboard === true) return true;
  if (input.legacyAccessLevelId === 1) return true;
  if (input.permissions?.includes(permissionNames.manageParking)) return true;

  try {
    return (BigInt(input.permissionPart1 ?? '0') & (1n << 32n)) === (1n << 32n);
  } catch {
    return false;
  }
}
