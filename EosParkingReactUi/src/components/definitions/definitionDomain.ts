export type DefinitionKind = 'space-types' | 'floors' | 'zones' | 'member-kinds';
export type DefinitionRow = Record<string, unknown>;
export type DefinitionForm = { Id: number; Title: string; Description: string; MembershipFee: string; DurationDays: string; MembershipCreditType: string; MembershipType: string; RefundDeadlineDayCount: string };
export type ParkingSpaceRow = { Id: number; Title: string; IsActive: boolean; ParkingFloorId: number; ParkingSectionId: number | null; ParkingParkSpaceKindId: number };
export type SpaceRangeForm = { prefix: string; from: string; to: string; IsActive: boolean; ParkingParkSpaceKindId: number };

export const emptyDefinitionForm: DefinitionForm = { Id: 0, Title: '', Description: '', MembershipFee: '0', DurationDays: '0', MembershipCreditType: '0', MembershipType: '0', RefundDeadlineDayCount: '0' };
export const emptyParkingSpaceForm: ParkingSpaceRow = { Id: 0, Title: '', IsActive: true, ParkingFloorId: 0, ParkingSectionId: null, ParkingParkSpaceKindId: 0 };
export const emptySpaceRangeForm: SpaceRangeForm = { prefix: '', from: '1', to: '10', IsActive: true, ParkingParkSpaceKindId: 0 };

export function unwrap(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const value = input as DefinitionRow;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}
export function rowsOf(input: unknown): DefinitionRow[] {
  const value = unwrap(input);
  if (Array.isArray(value)) return value.filter((row): row is DefinitionRow => Boolean(row && typeof row === 'object'));
  return value && typeof value === 'object' ? [value as DefinitionRow] : [];
}
export function valueOf(row: DefinitionRow, key: string): unknown { return row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)]; }
export function idOf(row: DefinitionRow, index = 0) { return Number(valueOf(row, 'Id') ?? index); }
export function boolValue(value: unknown) { return value === true || value === 1 || value === '1' || value === 'true' || value === 'True'; }
export function nestedRows(row: DefinitionRow, key: string, alternateKey?: string): DefinitionRow[] { return rowsOf(valueOf(row, key) ?? (alternateKey ? valueOf(row, alternateKey) : undefined)); }
export function tariffsOf(row: DefinitionRow): DefinitionRow[] { return nestedRows(row, 'Tariffs', 'tariffs').map((tariff) => ({ Id: Number(valueOf(tariff, 'Key') ?? valueOf(tariff, 'Id') ?? 0), Title: String(valueOf(tariff, 'Value') ?? valueOf(tariff, 'Title') ?? '') })).filter((tariff) => String(tariff.Title).length > 0); }
export function parkSpacesOf(row: DefinitionRow): DefinitionRow[] { const spaces = nestedRows(row, 'ParkSpaces', 'ParkingParkSpaces'); return spaces.length > 0 ? spaces : nestedRows(row, 'ParkingSpaces'); }
export function parkingSpaceId(row: DefinitionRow, index = 0): number {
  const directId = [valueOf(row, 'ParkSpaceId'), valueOf(row, 'ParkingParkSpaceId'), valueOf(row, 'Id')].map((value) => Number(value ?? 0)).find((value) => value > 0);
  if (directId) return directId;
  const nestedSpace = valueOf(row, 'ParkingParkSpace') ?? valueOf(row, 'ParkSpace');
  return nestedSpace && typeof nestedSpace === 'object' ? parkingSpaceId(nestedSpace as DefinitionRow, index) : index;
}
export function parkSpacesCount(row: DefinitionRow) { const spaces = parkSpacesOf(row); if (spaces.length > 0) return new Set(spaces.map((space, index) => parkingSpaceId(space, index))).size; const count = valueOf(row, 'ParkSpacesCount') ?? valueOf(row, 'ParkingParkSpacesCount') ?? valueOf(row, 'TotalParkSpaces'); return Number.isFinite(Number(count)) ? Number(count) : 0; }
export function spaceSectionId(space: DefinitionRow) { const directId = Number(valueOf(space, 'ParkingSectionId') ?? 0); if (directId > 0) return directId; const section = valueOf(space, 'ParkingSection'); return section && typeof section === 'object' ? Number(valueOf(section as DefinitionRow, 'Id') ?? 0) : 0; }
export function firstPositiveNumber(row: DefinitionRow, keys: string[]) { for (const key of keys) { const value = Number(valueOf(row, key) ?? 0); if (value > 0) return value; } return null; }
export function spaceFloorId(space: DefinitionRow) { const directId = firstPositiveNumber(space, ['ParkingFloorId', 'FloorId']); if (directId) return directId; const floor = valueOf(space, 'ParkingFloor') ?? valueOf(space, 'Floor'); return floor && typeof floor === 'object' ? firstPositiveNumber(floor as DefinitionRow, ['Id']) : null; }
export function normalizeParkingSpace(row: DefinitionRow, index = 0): DefinitionRow { return { ...row, Id: parkingSpaceId(row, index), Title: String(valueOf(row, 'Title') ?? valueOf(row, 'ParkSpaceTitle') ?? ''), ParkingFloorId: spaceFloorId(row) ?? 0, ParkingSectionId: spaceSectionId(row) || null, ParkingParkSpaceKindTitle: valueOf(row, 'ParkingParkSpaceKindTitle') ?? valueOf(row, 'ParkSpaceKindTitle') ?? valueOf(row, 'ParkingParkSpaceKind') }; }
export function hasParkingSection(space: DefinitionRow) { return boolValue(valueOf(space, 'HasSection')) || spaceSectionId(space) > 0; }
export function ensureApiSuccess(input: unknown) { if (!input || typeof input !== 'object') return; const result = input as DefinitionRow; const resultType = valueOf(result, 'ResponseResultType'); if (resultType !== undefined && resultType !== 1 && resultType !== '1' && resultType !== 'Ok') throw new Error(String(valueOf(result, 'Message') ?? valueOf(result, 'RealMessage') ?? 'عملیات با خطا مواجه شد.')); }

export const definitionConfig: Record<DefinitionKind, { get: (parkingId: number) => string; save: string; remove: (id: number) => string }> = {
  'space-types': { get: (id) => `api/Parking/GetParkingParkSpaceKinds?parkingId=${id}`, save: 'api/Parking/SaveParkingParkSpaceKind', remove: (id) => `api/Parking/DeleteParkingParkSpaceKind?parkingParkSpaceKindId=${id}` },
  floors: { get: (id) => `api/Parking/GetParkingFloors?parkingId=${id}`, save: 'api/Parking/SaveParkingFloor', remove: (id) => `api/Parking/DeleteParkingFloor?floorId=${id}` },
  zones: { get: (id) => `api/Parking/GetParkingSections?parkingId=${id}`, save: 'api/Parking/SaveParkingSection', remove: (id) => `api/Parking/DeleteParkingSectionById?sectionId=${id}` },
  'member-kinds': { get: (id) => `api/Member/GetMemberRegisterKindsByParkingId?parkingId=${id}`, save: 'api/Member/SaveMemberRegisterKind', remove: (id) => `api/Member/DeleteMemberRegisterKindById?id=${id}` },
};
