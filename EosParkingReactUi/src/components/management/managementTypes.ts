import type { Language } from '../../i18n';

export type { Language };
export type Primitive = string | number | boolean | null | undefined;
export type RecordValue = Record<string, Primitive>;

export type ParkingForm = {
  Id: number;
  ParkingName: string;
  Address: string;
  PhonNumber: string;
  TaxRate: string;
  CostOfCard: string;
  MaxTransferCredit: string;
  MinOfHostelryHours: string;
  MinOfNotFoundEnterCar: string;
  HasHostelryTariff: boolean;
  HasBillControl: boolean;
  RoundingMoneyBorder: string;
  RoundingMoneyValue: string;
  Shift1FromTime: string;
  Shift1ToTime: string;
  Shift2FromTime: string;
  Shift2ToTime: string;
  Shift3FromTime: string;
  Shift3ToTime: string;
};

export type UserForm = {
  Id: number;
  UserName: string;
  UserPass: string;
  StoredUserPass: string;
  FirstName: string;
  LastName: string;
  FatherName: string;
  NationalCode: string;
  Address: string;
  Description: string;
  TellNumber: string;
  PhonNumber: string;
  UserAccessLevelId: string;
  UserType: string;
  IsActive: boolean;
  IsSystemType: boolean;
};

export type AccessLevelForm = {
  Id: number;
  Name: string;
  Description: string;
  AccessPermissionPart1: string;
  AccessPermissionPart2: string;
  IsSystemType: boolean;
};

export type AccessPermissionNode = {
  Title: string;
  Childs: AccessPermissionNode[];
  AccessPermissionPart1: string;
  AccessPermissionPart2: string;
  isVisible: boolean;
  checked: boolean;
};

export type ModuleDefinition = {
  path: (parkingId: number) => string;
  columns: Array<{ key: string; fa: string; en: string }>;
};

export const emptyParkingForm: ParkingForm = {
  Id: 0,
  ParkingName: '',
  Address: '',
  PhonNumber: '',
  TaxRate: '0',
  CostOfCard: '0',
  MaxTransferCredit: '0',
  MinOfHostelryHours: '0',
  MinOfNotFoundEnterCar: '0',
  HasHostelryTariff: false,
  HasBillControl: false,
  RoundingMoneyBorder: '0',
  RoundingMoneyValue: '0',
  Shift1FromTime: '',
  Shift1ToTime: '',
  Shift2FromTime: '',
  Shift2ToTime: '',
  Shift3FromTime: '',
  Shift3ToTime: '',
};

export const emptyUserForm: UserForm = {
  Id: 0,
  UserName: '',
  UserPass: '',
  StoredUserPass: '',
  FirstName: '',
  LastName: '',
  FatherName: '',
  NationalCode: '',
  Address: '',
  Description: '',
  TellNumber: '',
  PhonNumber: '',
  UserAccessLevelId: '',
  UserType: '',
  IsActive: true,
  IsSystemType: false,
};

export const emptyAccessLevelForm: AccessLevelForm = {
  Id: 0,
  Name: '',
  Description: '',
  AccessPermissionPart1: '0',
  AccessPermissionPart2: '0',
  IsSystemType: false,
};

export const userTypeOptions = [
  { value: '0', fa: 'معمولی', en: 'Default user' },
  { value: '1', fa: 'پارکبان', en: 'Parkban' },
  { value: '2', fa: 'راننده', en: 'Driver' },
  { value: '3', fa: 'صدور مجوز', en: 'Exit permission manager' },
];

export const moduleDefinitions: Record<string, ModuleDefinition> = {
  doors: {
    path: (id) => `api/Parking/GetParkingDoors?parkingId=${id}`,
    columns: [{ key: 'Title', fa: 'عنوان درب', en: 'Door title' }, { key: 'DoorType', fa: 'نوع درب', en: 'Door type' }, { key: 'Id', fa: 'شناسه', en: 'ID' }],
  },
  equipment: {
    path: (id) => `api/Parking/GetParkingEquipments?parkingId=${id}`,
    columns: [{ key: 'DeviceName', fa: 'نام تجهیز', en: 'Device name' }, { key: 'Ip', fa: 'آدرس شبکه', en: 'IP address' }, { key: 'Port', fa: 'پورت', en: 'Port' }, { key: 'Disabled', fa: 'غیرفعال', en: 'Disabled' }],
  },
  tariffs: {
    path: (id) => `api/Tariff/GetByParkingId?parkingId=${id}`,
    columns: [{ key: 'Title', fa: 'عنوان تعرفه', en: 'Tariff title' }, { key: 'IsActive', fa: 'فعال', en: 'Active' }, { key: 'IsCurrent', fa: 'جاری', en: 'Current' }, { key: 'Id', fa: 'شناسه', en: 'ID' }],
  },
  members: {
    path: (id) => `api/Member/GetByParkingId?parkingId=${id}`,
    columns: [{ key: 'Name', fa: 'نام', en: 'Name' }, { key: 'Family', fa: 'نام خانوادگی', en: 'Family' }, { key: 'MemberCode', fa: 'کد عضویت', en: 'Member code' }, { key: 'Id', fa: 'شناسه', en: 'ID' }],
  },
  cards: {
    path: (id) => `api/Card/GetByParkingId?parkingId=${id}`,
    columns: [{ key: 'CardNumber', fa: 'شماره کارت', en: 'Card number' }, { key: 'MemberFullName', fa: 'عضو', en: 'Member' }, { key: 'IsBlock', fa: 'مسدود', en: 'Blocked' }, { key: 'Id', fa: 'شناسه', en: 'ID' }],
  },
  'traffic-control-list': {
    path: () => 'api/Parking/GetAllControlListCars',
    columns: [{ key: 'Plate', fa: 'پلاک', en: 'Plate' }, { key: 'Name', fa: 'عنوان', en: 'Name' }, { key: 'Id', fa: 'شناسه', en: 'ID' }],
  },
  'park-spaces': {
    path: (id) => `api/Parking/GetParkingParkSpacesById?parkingId=${id}&getAllParkSpaces=true`,
    columns: [{ key: 'FloorTitle', fa: 'طبقه', en: 'Floor' }, { key: 'ParkSpaceTitle', fa: 'جای پارک', en: 'Space' }, { key: 'MemberFullName', fa: 'عضو', en: 'Member' }, { key: 'ParkSpaceId', fa: 'شناسه', en: 'ID' }],
  },
};

export function unwrapValues(input: unknown): unknown {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'object') return input;
  const value = input as Record<string, unknown>;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}

export function asRows(input: unknown): RecordValue[] {
  const value = unwrapValues(input);
  if (Array.isArray(value)) return value.filter((row): row is RecordValue => Boolean(row && typeof row === 'object'));
  return value && typeof value === 'object' ? [value as RecordValue] : [];
}

export function recordValue(row: RecordValue, key: string): Primitive {
  return row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
}

export function formatValue(value: Primitive, language: Language) {
  if (typeof value === 'boolean') return value ? (language === 'fa' ? 'بله' : 'Yes') : (language === 'fa' ? 'خیر' : 'No');
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export function parkingTimeValue(value: Primitive): string {
  if (value === null || value === undefined || value === '') return '';
  const text = String(value);
  return text.length >= 5 ? text.slice(0, 5) : text;
}

export function parkingFormFromRow(row: RecordValue, fallbackId: number): ParkingForm {
  return {
    Id: Number(recordValue(row, 'Id') ?? fallbackId),
    ParkingName: String(recordValue(row, 'ParkingName') ?? ''),
    Address: String(recordValue(row, 'Address') ?? ''),
    PhonNumber: String(recordValue(row, 'PhonNumber') ?? ''),
    TaxRate: String(recordValue(row, 'TaxRate') ?? 0),
    CostOfCard: String(recordValue(row, 'CostOfCard') ?? 0),
    MaxTransferCredit: String(recordValue(row, 'MaxTransferCredit') ?? 0),
    MinOfHostelryHours: String(recordValue(row, 'MinOfHostelryHours') ?? 0),
    MinOfNotFoundEnterCar: String(recordValue(row, 'MinOfNotFoundEnterCar') ?? 0),
    HasHostelryTariff: Boolean(recordValue(row, 'HasHostelryTariff')),
    HasBillControl: Boolean(recordValue(row, 'HasBillControl')),
    RoundingMoneyBorder: String(recordValue(row, 'RoundingMoneyBorder') ?? 0),
    RoundingMoneyValue: String(recordValue(row, 'RoundingMoneyValue') ?? 0),
    Shift1FromTime: parkingTimeValue(recordValue(row, 'Shift1FromTime')),
    Shift1ToTime: parkingTimeValue(recordValue(row, 'Shift1ToTime')),
    Shift2FromTime: parkingTimeValue(recordValue(row, 'Shift2FromTime')),
    Shift2ToTime: parkingTimeValue(recordValue(row, 'Shift2ToTime')),
    Shift3FromTime: parkingTimeValue(recordValue(row, 'Shift3FromTime')),
    Shift3ToTime: parkingTimeValue(recordValue(row, 'Shift3ToTime')),
  };
}

export function timeMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function timePayload(value: string): string | null {
  return value ? `${value}:00` : null;
}

export function parkingPayload(form: ParkingForm) {
  return {
    ...form,
    ParkingName: form.ParkingName.trim(),
    TaxRate: Number(form.TaxRate) || 0,
    CostOfCard: Number(form.CostOfCard) || 0,
    MaxTransferCredit: Number(form.MaxTransferCredit) || 0,
    MinOfHostelryHours: Number(form.MinOfHostelryHours) || 0,
    MinOfNotFoundEnterCar: Number(form.MinOfNotFoundEnterCar) || 0,
    RoundingMoneyBorder: Number(form.RoundingMoneyBorder) || 0,
    RoundingMoneyValue: Number(form.RoundingMoneyValue) || 0,
    Shift1FromTime: timePayload(form.Shift1FromTime),
    Shift1ToTime: timePayload(form.Shift1ToTime),
    Shift2FromTime: timePayload(form.Shift2FromTime),
    Shift2ToTime: timePayload(form.Shift2ToTime),
    Shift3FromTime: timePayload(form.Shift3FromTime),
    Shift3ToTime: timePayload(form.Shift3ToTime),
  };
}

export function asBigInt(value: Primitive): bigint {
  try { return BigInt(String(value ?? '0')); } catch { return 0n; }
}

export function normalizeAccessNodes(input: unknown): AccessPermissionNode[] {
  return asRows(input).map((row) => ({
    Title: String(recordValue(row, 'Title') ?? ''),
    Childs: normalizeAccessNodes(row.Childs ?? row.childs ?? []),
    AccessPermissionPart1: String(recordValue(row, 'AccessPermissionPart1') ?? 0),
    AccessPermissionPart2: String(recordValue(row, 'AccessPermissionPart2') ?? 0),
    isVisible: row.isVisible !== false,
    checked: false,
  }));
}

export function setAllAccessNodeState(nodes: AccessPermissionNode[], checked: boolean): AccessPermissionNode[] {
  return nodes.map((node) => ({ ...node, checked, Childs: setAllAccessNodeState(node.Childs, checked) }));
}

export function setAccessNodeState(nodes: AccessPermissionNode[], target: string, checked: boolean, cascade: boolean, prefix = ''): AccessPermissionNode[] {
  return nodes.map((node, index) => {
    const key = `${prefix}${node.Title}-${index}`;
    if (key === target) return { ...node, checked, Childs: cascade ? setAllAccessNodeState(node.Childs, checked) : node.Childs };
    return { ...node, Childs: setAccessNodeState(node.Childs, target, checked, cascade, `${key}/`) };
  });
}

export function accessPermissionTotals(nodes: AccessPermissionNode[]): { part1: bigint; part2: bigint } {
  return nodes.reduce((total, node) => {
    const own = node.checked && !node.Title.startsWith('مشاهده')
      ? { part1: asBigInt(node.AccessPermissionPart1), part2: asBigInt(node.AccessPermissionPart2) }
      : { part1: 0n, part2: 0n };
    const child = accessPermissionTotals(node.Childs);
    return { part1: total.part1 | own.part1 | child.part1, part2: total.part2 | own.part2 | child.part2 };
  }, { part1: 0n, part2: 0n });
}

export function markAccessNodes(nodes: AccessPermissionNode[], part1: bigint, part2: bigint, prefix = ''): AccessPermissionNode[] {
  return nodes.map((node, index) => {
    const key = `${prefix}${node.Title}-${index}`;
    const nodePart1 = asBigInt(node.AccessPermissionPart1);
    const nodePart2 = asBigInt(node.AccessPermissionPart2);
    return {
      ...node,
      checked: (nodePart1 > 0n && (part1 & nodePart1) === nodePart1) || (nodePart2 > 0n && (part2 & nodePart2) === nodePart2),
      Childs: markAccessNodes(node.Childs, part1, part2, `${key}/`),
    };
  });
}
