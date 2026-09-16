import { useEffect, useMemo, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { z } from 'zod';
import { ApiError } from '../../api/client';
import { memberApi, parkingApi, trafficApi } from '../../api/management';
import { AppDataGrid } from '../../components/AppDataGrid';
import { AppGroupBox } from '../../components/AppGroupBox';
import { IranianPlateInput, isValidIranianPlate } from '../../components/IranianPlateInput';
import { MoneyTextField } from '../../components/MoneyTextField';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import { ResourceState } from '../../components/management/ResourceState';
import type { Language } from '../../components/management/managementTypes';
import { formatDateTime, formatMoney } from '../../utils/formatters';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };

type Car = {
  Id: number;
  Plate: string;
  CarType: string;
  Name: string;
  DtoViewCarModelTitle: string;
  DtoViewCarColorTitle: string;
};

type Membership = {
  Id: number;
  MemberId: number;
  MemberRegisterKindId: number;
  MemberRegisterKindTitle: string;
  CreditAmount: number;
  TransferCreditAmount: number;
  TaxValue: number;
  RoundingValue: number;
  StartDate: string;
  EndDate: string | null;
  PersistOn: string;
  IsActive: boolean;
};

type ParkingSpace = {
  /** MemberParkSpace relation identifier; 0 is a new local assignment. */
  Id: number;
  /** Physical parking-space identifier, used to prevent duplicate assignments. */
  ParkSpaceId: number;
  FloorId: number;
  FloorTitle: string;
  ParkSpaceTitle: string;
};

type Member = {
  key: string;
  raw: Record<string, unknown>;
  Id: number;
  Name: string;
  Family: string;
  Code: string;
  NationalCode: string;
  PhoneNumber: string;
  Address: string;
  FaceTag: string;
  IsMemberBlock: boolean;
  CardNumber: string;
  ExitPermissionAccepter: number | '';
  CashAmount: number;
  Cars: Car[];
  MemberRegisters: Membership[];
  MemberParkSpaces: ParkingSpace[];
};

type RegisterKind = {
  Id: number;
  Title: string;
  MembershipFee: number;
  DurationDays: number;
  TaxValue: number;
  MembershipCreditType: number;
  MembershipType: number;
};

type RegistrationDraft = {
  MemberId: number;
  MemberRegisterKindId: number;
  MemberRegisterKindTitle: string;
  CreditAmount: number;
  TaxValue: number;
  StartDate: string;
  EndDate: string | null;
  IsActive: boolean;
};

type RegistrationPreview = {
  Id: number;
  TotalAmount: number;
  TransferAmount: number;
  Tax: number;
  CreditAmount: number;
};

type CreditInfo = { MemberRegisterId: number; IsActive: boolean; MembershipCreditType: number };

const membershipSchema = z.object({
  Id: z.number(),
  MemberId: z.number(),
  MemberRegisterKindId: z.number(),
  MemberRegisterKindTitle: z.string(),
  CreditAmount: z.number(),
  TransferCreditAmount: z.number(),
  TaxValue: z.number(),
  RoundingValue: z.number(),
  StartDate: z.string(),
  EndDate: z.string().nullable(),
  PersistOn: z.string(),
  IsActive: z.boolean(),
});

const memberSchema = z.object({
  Id: z.number(),
  Name: z.string(),
  Family: z.string(),
  Code: z.string(),
  NationalCode: z.string(),
  PhoneNumber: z.string(),
  Address: z.string(),
  FaceTag: z.string(),
  IsMemberBlock: z.boolean(),
  CardNumber: z.string(),
  ExitPermissionAccepter: z.union([z.number(), z.literal('')]),
  CashAmount: z.number(),
  Cars: z.array(z.object({
    Id: z.number(),
    Plate: z.string(),
    CarType: z.string(),
    Name: z.string(),
    DtoViewCarModelTitle: z.string(),
    DtoViewCarColorTitle: z.string(),
  })),
  MemberRegisters: z.array(membershipSchema),
  MemberParkSpaces: z.array(z.object({
    Id: z.number(),
    ParkSpaceId: z.number(),
    FloorId: z.number(),
    FloorTitle: z.string(),
    ParkSpaceTitle: z.string(),
  })),
});

const recordOf = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const valueOf = (record: Record<string, unknown>, key: string) => record[key] ?? record[key.charAt(0).toLowerCase() + key.slice(1)];
const text = (value: unknown) => value === null || value === undefined ? '' : String(value);
const nullableText = (value: unknown) => value === null || value === undefined || value === '' ? null : String(value);
const number = (value: unknown) => Number(value ?? 0) || 0;
const bool = (value: unknown) => value === true || value === 1 || String(value).toLowerCase() === 'true';

function responseValue(input: unknown): unknown {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(text(valueOf(response, 'Message')) || text(valueOf(response, 'RealMessage')));
  }
  return valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input;
}

const values = (input: unknown): unknown[] => {
  const value = responseValue(input);
  return Array.isArray(value) ? value : [];
};

function parseMembership(value: unknown): Membership {
  const item = recordOf(value);
  return membershipSchema.parse({
    Id: number(valueOf(item, 'Id')),
    MemberId: number(valueOf(item, 'MemberId')),
    MemberRegisterKindId: number(valueOf(item, 'MemberRegisterKindId')),
    MemberRegisterKindTitle: text(valueOf(item, 'MemberRegisterKindTitle')),
    CreditAmount: number(valueOf(item, 'CreditAmount')),
    TransferCreditAmount: number(valueOf(item, 'TransferCreditAmount')),
    TaxValue: number(valueOf(item, 'TaxValue')),
    RoundingValue: number(valueOf(item, 'RoundingValue')),
    StartDate: text(valueOf(item, 'StartDate')),
    EndDate: nullableText(valueOf(item, 'EndDate')),
    PersistOn: text(valueOf(item, 'PersistOn')),
    IsActive: bool(valueOf(item, 'IsActive')),
  });
}

function parseParkingSpaces(input: unknown): ParkingSpace[] {
  return values(input).flatMap((item) => {
    const value = recordOf(item);
    const id = number(valueOf(value, 'Id'));
    const parkSpaceId = number(valueOf(value, 'ParkSpaceId'));
    const title = text(valueOf(value, 'ParkSpaceTitle') ?? valueOf(value, 'Title'));
    return parkSpaceId > 0 && title ? [{
      Id: id,
      ParkSpaceId: parkSpaceId,
      FloorId: number(valueOf(value, 'FloorId') ?? valueOf(value, 'ParkingFloorId')),
      FloorTitle: text(valueOf(value, 'FloorTitle')),
      ParkSpaceTitle: title,
    }] : [];
  });
}

function parseMembers(input: unknown): Member[] {
  return values(input).map((item, index) => {
    const raw = recordOf(item);
    const cars = values(valueOf(raw, 'Cars')).map((car) => {
      const value = recordOf(car);
      return {
        Id: number(valueOf(value, 'Id')),
        Plate: text(valueOf(value, 'Plate')),
        CarType: text(valueOf(value, 'CarType')),
        Name: text(valueOf(value, 'Name')),
        DtoViewCarModelTitle: text(valueOf(value, 'DtoViewCarModelTitle')),
        DtoViewCarColorTitle: text(valueOf(value, 'DtoViewCarColorTitle')),
      };
    });
    const registers = values(valueOf(raw, 'MemberRegisters')).map(parseMembership);
    const spaces = parseParkingSpaces(valueOf(raw, 'MemberParkSpaces'));
    const parsed = memberSchema.parse({
      Id: number(valueOf(raw, 'Id')),
      Name: text(valueOf(raw, 'Name')),
      Family: text(valueOf(raw, 'Family')),
      Code: text(valueOf(raw, 'Code')),
      NationalCode: text(valueOf(raw, 'NationalCode')),
      PhoneNumber: text(valueOf(raw, 'PhoneNumber')),
      Address: text(valueOf(raw, 'Address')),
      FaceTag: text(valueOf(raw, 'FaceTag')),
      IsMemberBlock: bool(valueOf(raw, 'IsMemberBlock')),
      CardNumber: text(valueOf(raw, 'CardNumber') ?? valueOf(raw, 'MemberCard')),
      ExitPermissionAccepter: number(valueOf(raw, 'ExitPermissionAccepter')) || '',
      CashAmount: number(valueOf(raw, 'CashAmount')),
      Cars: cars,
      MemberRegisters: registers,
      MemberParkSpaces: spaces,
    });
    return { ...parsed, key: `member-${parsed.Id || index}`, raw };
  });
}

function parseRegisterKinds(input: unknown): RegisterKind[] {
  return values(input).flatMap((item) => {
    const value = recordOf(item);
    const id = number(valueOf(value, 'Id'));
    const title = text(valueOf(value, 'Title'));
    return id > 0 && title ? [{
      Id: id,
      Title: title,
      MembershipFee: number(valueOf(value, 'MembershipFee')),
      DurationDays: number(valueOf(value, 'DurationDays')),
      TaxValue: number(valueOf(value, 'TaxValue')),
      MembershipCreditType: number(valueOf(value, 'MembershipCreditType')),
      MembershipType: number(valueOf(value, 'MembershipType')),
    }] : [];
  });
}

function parseRegistrationPreview(input: unknown): RegistrationPreview {
  const value = recordOf(responseValue(input));
  return {
    Id: number(valueOf(value, 'Id')),
    TotalAmount: number(valueOf(value, 'TotalAmount')),
    TransferAmount: number(valueOf(value, 'TransferAmount')),
    Tax: number(valueOf(value, 'Tax')),
    CreditAmount: number(valueOf(value, 'CreditAmount')),
  };
}

function parseCreditInfo(input: unknown): CreditInfo[] {
  return values(input).flatMap((item) => {
    const value = recordOf(item);
    const id = number(valueOf(value, 'MemberRegisterId'));
    return id > 0 ? [{
      MemberRegisterId: id,
      IsActive: bool(valueOf(value, 'IsActive')),
      MembershipCreditType: number(valueOf(value, 'MembershipCreditType')),
    }] : [];
  });
}

const emptyMember = (): Member => ({
  key: `new-${crypto.randomUUID()}`,
  raw: {},
  Id: 0,
  Name: '',
  Family: '',
  Code: '',
  NationalCode: '',
  PhoneNumber: '',
  Address: '',
  FaceTag: '',
  IsMemberBlock: false,
  CardNumber: '',
  ExitPermissionAccepter: '',
  CashAmount: 0,
  Cars: [],
  MemberRegisters: [],
  MemberParkSpaces: [],
});

const isSameInstant = (first: string, second: string | null) => second !== null && new Date(first).getTime() === new Date(second).getTime();
const isCurrentMembership = (item: Membership) => item.IsActive && (!item.EndDate || isSameInstant(item.StartDate, item.EndDate) || new Date(item.EndDate).getTime() >= Date.now());
const byMostRecent = (first: Membership, second: Membership) => new Date(second.PersistOn || second.StartDate).getTime() - new Date(first.PersistOn || first.StartDate).getTime();
const sortParkingSpaces = (items: ParkingSpace[]) => [...items].sort((first, second) => first.FloorTitle.localeCompare(second.FloorTitle) || first.ParkSpaceTitle.localeCompare(second.ParkSpaceTitle));
const parkingSpaceKey = (space: ParkingSpace) => String(space.ParkSpaceId || space.Id);
const addDays = (dateValue: string, days: number) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
const copy = (language: Language) => language === 'fa'
  ? {
      subtitle: 'مدیریت عضو، خودرو، عضویت و جای پارک', new: 'عضو جدید', edit: 'ویرایش', save: 'ذخیره عضو', remove: 'حذف عضو', details: 'مشخصات عضو', cars: 'خودروهای عضو', membership: 'عضویت', spaces: 'جای پارک‌های عضو', availableSpaces: 'جای‌پارک‌های آزاد', assignedSpaces: 'جای‌پارک‌های عضو', floor: 'طبقه/قسمت', parkingSpace: 'جای پارک', assignSpace: 'تخصیص جای پارک', releaseSpace: 'آزادسازی جای پارک', spacesLoading: 'در حال دریافت جای‌پارک‌های آزاد...', availableSpacesEmpty: 'جای‌پارک آزادی برای تخصیص وجود ندارد.', editMemberSpaces: 'برای تخصیص یا آزادسازی جای پارک، ویرایش عضو را انتخاب کنید.', saveMemberSpaces: 'ابتدا عضو را ذخیره کنید.', spacesRequireActiveMembership: 'تخصیص جای پارک فقط برای عضویت فعالِ دارای جای پارک مشخص امکان‌پذیر است.', spacesKindUnavailable: 'نوع عضویت فعال برای بررسی تخصیص جای پارک یافت نشد.', spacesLoadError: 'دریافت جای‌پارک‌های آزاد ناموفق بود.', retry: 'تلاش مجدد', name: 'نام', fullName: 'نام و نام خانوادگی', family: 'نام خانوادگی', code: 'کد عضویت', national: 'کد ملی', phone: 'تلفن', address: 'نشانی', card: 'کارت عضو', face: 'کد چهره', exit: 'تأییدکننده خروج', inactive: 'غیرفعال است', carsEmpty: 'خودرویی ثبت نشده است.', membershipEmpty: 'سابقه عضویتی ثبت نشده است.', spacesEmpty: 'جای پارکی تخصیص داده نشده است.', type: 'نوع عضویت', credit: 'حق عضویت', start: 'زمان شروع', end: 'زمان اتمام', status: 'وضعیت', active: 'فعال', addCar: 'افزودن خودرو', addMembership: 'ثبت عضویت', balance: 'مانده اعتبار عضویت فعال', rial: 'ریال', tax: 'مالیات ارزش افزوده', transfer: 'مبلغ انتقال اعتبار', payable: 'مبلغ قابل پرداخت', payment: 'تأیید پرداخت', confirmPayment: 'تأیید پرداخت و ثبت عضویت', paymentDescription: 'پس از تأیید، ثبت عضویت و سند مالی آن ایجاد می‌شود.', replacementTitle: 'عضویت فعال موجود است', replacementMessage: 'عضویت فعال قبلی لغو و اعتبار آن طبق محاسبهٔ سامانه منتقل شود؟', makeReservation: 'ثبت به‌صورت رزرو', replaceMembership: 'لغو عضویت قبلی و ادامه', saveFirstTitle: 'ثبت مشخصات عضو', saveFirstMessage: 'برای ثبت عضویت، ابتدا مشخصات عضو ذخیره شود؟', saveAndContinue: 'ذخیره و ادامه', saveMemberFirst: 'ابتدا مشخصات عضو را ذخیره کنید.', reservedMembership: 'هر عضو فقط می‌تواند یک عضویت رزرو داشته باشد.', noMembershipKinds: 'نوع عضویتی برای این پارکینگ تعریف نشده است.', registrationError: 'ثبت عضویت انجام نشد.', registrationSaved: 'عضویت با موفقیت ثبت شد.', cancellation: 'لغو عضویت', cancelMembership: 'لغو عضویت', cancellationType: 'نوع لغو عضویت', cancellationUnavailable: 'لغو عضویت برای اعتبارهای به‌اتمام‌رسیده ممکن نیست.', cancellationSaved: 'عضویت مورد نظر لغو شد.', cancellationError: 'لغو عضویت انجام نشد.', refund: 'عودت وجه', settlement: 'تسویه اعتبار', terminate: 'سوختن اعتبار', creditStatus: 'وضعیت اعتبار', creditType: 'نوع اعتبار', creditTypeCredit: 'اعتباری', creditTypeLongTime: 'مدت‌دار', creditTypeLongTimeCredit: 'اعتباری و مدت‌دار', actions: 'عملیات', listLoading: 'در حال دریافت اعضا...', listEmpty: 'عضوی برای نمایش وجود ندارد.', loadError: 'دریافت اعضا ناموفق بود.', saveError: 'ذخیره عضو ناموفق بود.', saved: 'اطلاعات عضو ذخیره شد.', required: 'نام و کد عضویت الزامی هستند.', nationalInvalid: 'کد ملی باید ۱۰ رقم باشد.', plateInvalid: 'پلاک را با فرمت کامل ایرانی وارد کنید.', deleteTitle: 'حذف عضو', deleteMessage: 'آیا از حذف این عضو مطمئن هستید؟', cancel: 'انصراف', confirm: 'حذف', add: 'افزودن', plate: 'پلاک', carName: 'نام خودرو', model: 'مدل', color: 'رنگ', forbidden: 'دسترسی به اطلاعات اعضا مجاز نیست.', kindRequired: 'نوع عضویت را انتخاب کنید.', creditInvalid: 'مبلغ حق عضویت نمی‌تواند منفی باشد.', memberKindSpaceMessage: 'با ثبت این نوع عضویت، همهٔ جای پارک‌های عضو آزاد می‌شود. ادامه می‌دهید؟', confirmSpaceRelease: 'ادامه و آزادسازی جای پارک‌ها',
    }
  : {
      subtitle: 'Manage member, vehicle, membership, and parking spaces', new: 'New member', edit: 'Edit', save: 'Save member', remove: 'Delete member', details: 'Member details', cars: 'Member vehicles', membership: 'Membership', spaces: 'Member parking spaces', availableSpaces: 'Available parking spaces', assignedSpaces: 'Member parking spaces', floor: 'Floor/section', parkingSpace: 'Parking space', assignSpace: 'Assign parking space', releaseSpace: 'Release parking space', spacesLoading: 'Loading available parking spaces...', availableSpacesEmpty: 'No available parking space can be assigned.', editMemberSpaces: 'Edit the member to assign or release a parking space.', saveMemberSpaces: 'Save the member before assigning a parking space.', spacesRequireActiveMembership: 'Parking spaces can only be assigned to an active membership with a fixed parking space.', spacesKindUnavailable: 'The active membership type could not be found for parking-space assignment.', spacesLoadError: 'Loading available parking spaces failed.', retry: 'Retry', name: 'First name', fullName: 'Full name', family: 'Family name', code: 'Membership code', national: 'National ID', phone: 'Phone', address: 'Address', card: 'Member card', face: 'Face code', exit: 'Exit approver', inactive: 'Inactive', carsEmpty: 'No vehicle has been registered.', membershipEmpty: 'No membership history has been registered.', spacesEmpty: 'No parking space has been assigned.', type: 'Membership type', credit: 'Membership fee', start: 'Start date', end: 'End date', status: 'Status', active: 'Active', addCar: 'Add vehicle', addMembership: 'Register membership', balance: 'Active membership balance', rial: 'Rial', tax: 'VAT', transfer: 'Transferred credit', payable: 'Amount due', payment: 'Confirm payment', confirmPayment: 'Confirm payment and register', paymentDescription: 'Confirmation creates the membership registration and its financial record.', replacementTitle: 'An active membership exists', replacementMessage: 'Cancel the prior active membership and apply the system credit transfer?', makeReservation: 'Create reservation', replaceMembership: 'Replace active membership', saveFirstTitle: 'Save member information', saveFirstMessage: 'Save the member information before registering membership?', saveAndContinue: 'Save and continue', saveMemberFirst: 'Save the member information first.', reservedMembership: 'A member may only have one reserved membership.', noMembershipKinds: 'No membership type is defined for this parking.', registrationError: 'Membership registration failed.', registrationSaved: 'Membership registered successfully.', cancellation: 'Cancel membership', cancelMembership: 'Cancel', cancellationType: 'Cancellation type', cancellationUnavailable: 'Expired credit cannot be cancelled.', cancellationSaved: 'Membership cancelled.', cancellationError: 'Membership cancellation failed.', refund: 'Refund', settlement: 'Settle credit', terminate: 'Forfeit credit', creditStatus: 'Credit status', creditType: 'Credit type', creditTypeCredit: 'Credit', creditTypeLongTime: 'Term', creditTypeLongTimeCredit: 'Credit and term', actions: 'Actions', listLoading: 'Loading members...', listEmpty: 'No members to display.', loadError: 'Loading members failed.', saveError: 'Saving the member failed.', saved: 'Member information was saved.', required: 'Name and membership code are required.', nationalInvalid: 'National ID must contain 10 digits.', plateInvalid: 'Enter a complete Iranian license plate.', deleteTitle: 'Delete member', deleteMessage: 'Are you sure you want to delete this member?', cancel: 'Cancel', confirm: 'Delete', add: 'Add', plate: 'Plate', carName: 'Vehicle name', model: 'Model', color: 'Color', forbidden: 'The current user cannot access members.', kindRequired: 'Select a membership type.', creditInvalid: 'The membership fee cannot be negative.', memberKindSpaceMessage: 'This membership type releases every member parking space. Continue?', confirmSpaceRelease: 'Continue and release spaces',
    };

export function MemberManagementWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const t = copy(language);
  const [rows, setRows] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Member | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [carOpen, setCarOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [saveFirstOpen, setSaveFirstOpen] = useState(false);
  const [spaceReleaseOpen, setSpaceReleaseOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [registerKinds, setRegisterKinds] = useState<RegisterKind[]>([]);
  const [availableParkingSpaces, setAvailableParkingSpaces] = useState<ParkingSpace[]>([]);
  const [selectedAvailableParkingSpaces, setSelectedAvailableParkingSpaces] = useState<string[]>([]);
  const [selectedMemberParkingSpaces, setSelectedMemberParkingSpaces] = useState<string[]>([]);
  const [parkingSpacesLoading, setParkingSpacesLoading] = useState(false);
  const [parkingSpacesError, setParkingSpacesError] = useState('');
  const [pendingRegistrationMember, setPendingRegistrationMember] = useState<Member | null>(null);
  const [registration, setRegistration] = useState<RegistrationDraft | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<RegistrationPreview | null>(null);
  const [cancellationTarget, setCancellationTarget] = useState<Membership | null>(null);
  const [cancellationCredit, setCancellationCredit] = useState<CreditInfo | null>(null);
  const [cancellationType, setCancellationType] = useState('');
  const [carDraft, setCarDraft] = useState<Car>({ Id: 0, Plate: '', CarType: '0', Name: '', DtoViewCarModelTitle: '', DtoViewCarColorTitle: '' });

  const selected = useMemo(() => rows.find((row) => row.key === selectedId) ?? null, [rows, selectedId]);
  const content = draft ?? selected;
  const selectedRegisterKind = useMemo(() => registerKinds.find((item) => item.Id === registration?.MemberRegisterKindId) ?? null, [registerKinds, registration?.MemberRegisterKindId]);
  const currentMembership = useMemo(() => content?.MemberRegisters.filter(isCurrentMembership).sort(byMostRecent)[0] ?? null, [content]);
  const currentMembershipKind = useMemo(() => registerKinds.find((item) => item.Id === currentMembership?.MemberRegisterKindId) ?? null, [registerKinds, currentMembership?.MemberRegisterKindId]);
  const canManageParkingSpaces = Boolean(draft?.Id && currentMembershipKind && currentMembershipKind.MembershipType !== 2);
  const parkingSpaceNotice = !draft
    ? t.editMemberSpaces
    : !draft.Id
      ? t.saveMemberSpaces
      : !currentMembership
        ? t.spacesRequireActiveMembership
        : !currentMembershipKind
          ? t.spacesKindUnavailable
          : currentMembershipKind.MembershipType === 2
            ? t.spacesRequireActiveMembership
            : '';
  const carPlateInvalid = Boolean(carDraft.Plate) && !isValidIranianPlate(carDraft.Plate, carDraft.CarType);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const members = parseMembers(await memberApi.list(parkingId));
      setRows(members);
      setSelectedId((current) => members.some((member) => member.key === current) ? current : members[0]?.key ?? null);
    } catch (cause) {
      setRows([]);
      setSelectedId(null);
      setError(cause instanceof ApiError && cause.status === 403 ? t.forbidden : cause instanceof Error && cause.message ? cause.message : t.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [parkingId, language]);

  const update = <K extends keyof Member>(key: K, value: Member[K]) => setDraft((member) => member ? { ...member, [key]: value } : member);
  const startNew = () => { setDraft({ ...emptyMember(), Code: String(1001 + rows.length) }); setSelectedAvailableParkingSpaces([]); setSelectedMemberParkingSpaces([]); setTab(0); setMessage(''); setError(''); };
  const startEdit = (member = selected) => { if (!member) return; setDraft(structuredClone(member)); setSelectedAvailableParkingSpaces([]); setSelectedMemberParkingSpaces([]); setTab(0); setMessage(''); setError(''); };

  const memberPayload = (member: Member) => ({
    ...member.raw,
    Id: member.Id,
    ParkingId: parkingId,
    Name: member.Name.trim(),
    Family: member.Family.trim(),
    Code: member.Code.trim(),
    NationalCode: member.NationalCode,
    PhoneNumber: member.PhoneNumber,
    Address: member.Address.trim(),
    FaceTag: member.FaceTag,
    IsMemberBlock: member.IsMemberBlock,
    Cars: member.Cars,
    MemberRegisters: member.MemberRegisters,
    MemberParkSpaces: member.MemberParkSpaces,
  });

  const saveMember = async (closeEdit: boolean): Promise<Member | null> => {
    if (!draft) return null;
    if (!draft.Name.trim() || !draft.Code.trim()) { setError(t.required); return null; }
    if (draft.NationalCode && !/^\d{10}$/.test(draft.NationalCode)) { setError(t.nationalInvalid); return null; }
    setSaving(true);
    setError('');
    try {
      const savedId = number(responseValue(await memberApi.save(memberPayload(draft))));
      if (!savedId) throw new Error(t.saveError);
      const savedMember = { ...draft, Id: savedId, key: `member-${savedId}`, raw: { ...draft.raw, Id: savedId } };
      await load();
      setDraft(closeEdit ? null : savedMember);
      setMessage(t.saved);
      return savedMember;
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.saveError);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected?.Id) return;
    setSaving(true);
    setError('');
    try {
      const result = responseValue(await memberApi.remove(selected.Id));
      if (!bool(result)) throw new Error(t.saveError);
      setDeleteOpen(false);
      await load();
      setMessage(t.saved);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const addCar = () => {
    if (!draft) return;
    if (!isValidIranianPlate(carDraft.Plate, carDraft.CarType)) { setError(t.plateInvalid); return; }
    if (draft.Cars.some((item) => item.Plate === carDraft.Plate.trim())) { setError(language === 'fa' ? 'خودرو با این شماره پلاک قبلاً ثبت شده است.' : 'A vehicle with this plate has already been added.'); return; }
    update('Cars', [...draft.Cars, { ...carDraft, Plate: carDraft.Plate.trim() }]);
    setCarOpen(false);
    setCarDraft({ Id: 0, Plate: '', CarType: '0', Name: '', DtoViewCarModelTitle: '', DtoViewCarColorTitle: '' });
  };

  const getRegisterKinds = async () => {
    if (registerKinds.length) return registerKinds;
    const kinds = parseRegisterKinds(await memberApi.listRegisterKinds(parkingId));
    if (!kinds.length) throw new Error(t.noMembershipKinds);
    setRegisterKinds(kinds);
    return kinds;
  };

  const loadAvailableParkingSpaces = async () => {
    if (!content?.Id) return;
    setParkingSpacesLoading(true);
    setParkingSpacesError('');
    try {
      const [spaces] = await Promise.all([
        parkingApi.listAvailableParkSpaces(parkingId),
        getRegisterKinds(),
      ]);
      setAvailableParkingSpaces(sortParkingSpaces(parseParkingSpaces(spaces)));
      setSelectedAvailableParkingSpaces([]);
      setSelectedMemberParkingSpaces([]);
    } catch (cause) {
      setAvailableParkingSpaces([]);
      setParkingSpacesError(cause instanceof Error && cause.message ? cause.message : t.spacesLoadError);
    } finally {
      setParkingSpacesLoading(false);
    }
  };

  const selectTab = (nextTab: number) => {
    setTab(nextTab);
    if (nextTab === 3) void loadAvailableParkingSpaces();
  };

  const assignParkingSpace = (space: ParkingSpace) => {
    if (!draft || !canManageParkingSpaces || draft.MemberParkSpaces.some((item) => item.ParkSpaceId === space.ParkSpaceId)) return;
    update('MemberParkSpaces', sortParkingSpaces([...draft.MemberParkSpaces, space]));
    setAvailableParkingSpaces((items) => items.filter((item) => item.ParkSpaceId !== space.ParkSpaceId));
    setSelectedAvailableParkingSpaces((keys) => keys.filter((key) => key !== parkingSpaceKey(space)));
  };

  const releaseParkingSpace = (space: ParkingSpace) => {
    if (!draft || !canManageParkingSpaces) return;
    update('MemberParkSpaces', draft.MemberParkSpaces.filter((item) => item.ParkSpaceId !== space.ParkSpaceId));
    setAvailableParkingSpaces((items) => items.some((item) => item.ParkSpaceId === space.ParkSpaceId) ? items : sortParkingSpaces([...items, space]));
    setSelectedMemberParkingSpaces((keys) => keys.filter((key) => key !== parkingSpaceKey(space)));
  };

  const assignSelectedParkingSpaces = () => {
    if (!draft || !canManageParkingSpaces || selectedAvailableParkingSpaces.length === 0) return;
    const selected = availableParkingSpaces.filter((space) => selectedAvailableParkingSpaces.includes(parkingSpaceKey(space)));
    const existing = new Set(draft.MemberParkSpaces.map((space) => space.ParkSpaceId));
    const additions = selected.filter((space) => !existing.has(space.ParkSpaceId));
    if (!additions.length) return;
    update('MemberParkSpaces', sortParkingSpaces([...draft.MemberParkSpaces, ...additions]));
    setAvailableParkingSpaces((items) => items.filter((space) => !selectedAvailableParkingSpaces.includes(parkingSpaceKey(space))));
    setSelectedAvailableParkingSpaces([]);
  };

  const releaseSelectedParkingSpaces = () => {
    if (!draft || !canManageParkingSpaces || selectedMemberParkingSpaces.length === 0) return;
    const selected = new Set(selectedMemberParkingSpaces);
    const released = draft.MemberParkSpaces.filter((space) => selected.has(parkingSpaceKey(space)));
    if (!released.length) return;
    update('MemberParkSpaces', draft.MemberParkSpaces.filter((space) => !selected.has(parkingSpaceKey(space))));
    setAvailableParkingSpaces((items) => sortParkingSpaces([...items, ...released.filter((space) => !items.some((item) => item.ParkSpaceId === space.ParkSpaceId))]));
    setSelectedMemberParkingSpaces([]);
  };

  const openRegistrationDialog = async (member: Member, isActive: boolean) => {
    setSaving(true);
    setError('');
    try {
      await getRegisterKinds();
      const active = member.MemberRegisters.filter(isCurrentMembership).sort(byMostRecent)[0];
      const startDate = active?.EndDate || new Date().toISOString();
      setRegistration({
        MemberId: member.Id,
        MemberRegisterKindId: 0,
        MemberRegisterKindTitle: '',
        CreditAmount: 0,
        TaxValue: 0,
        StartDate: startDate,
        EndDate: null,
        IsActive: isActive,
      });
      setRegistrationOpen(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.registrationError);
    } finally {
      setSaving(false);
    }
  };

  const openRegistration = async () => {
    if (!draft) return;
    if (!draft.Id) { setSaveFirstOpen(true); return; }
    const active = draft.MemberRegisters.filter(isCurrentMembership).sort(byMostRecent)[0];
    const hasReservation = Boolean(active) && draft.MemberRegisters.some((item) => !item.IsActive && new Date(item.PersistOn || item.StartDate).getTime() > new Date(active.PersistOn || active.StartDate).getTime());
    if (hasReservation) { setError(t.reservedMembership); return; }
    if (active) { setPendingRegistrationMember(draft); setReplaceOpen(true); return; }
    await openRegistrationDialog(draft, true);
  };

  const saveMemberAndOpenRegistration = async () => {
    const member = await saveMember(false);
    if (!member) return;
    setSaveFirstOpen(false);
    await openRegistrationDialog(member, true);
  };

  const selectRegistrationKind = (kindId: number) => {
    const kind = registerKinds.find((item) => item.Id === kindId);
    if (!kind) return;
    setRegistration((current) => current ? {
      ...current,
      MemberRegisterKindId: kind.Id,
      MemberRegisterKindTitle: kind.Title,
      CreditAmount: kind.MembershipFee,
      TaxValue: kind.TaxValue,
      EndDate: addDays(current.StartDate, kind.DurationDays),
    } : current);
  };

  const registrationPayload = () => {
    if (!registration || !selectedRegisterKind) throw new Error(t.kindRequired);
    if (registration.CreditAmount < 0) throw new Error(t.creditInvalid);
    return {
      MemberId: registration.MemberId,
      MemberRegisterKindId: registration.MemberRegisterKindId,
      MemberRegisterKindTitle: registration.MemberRegisterKindTitle,
      CreditAmount: registration.CreditAmount,
      TaxValue: registration.TaxValue,
      StartDate: registration.StartDate,
      EndDate: registration.EndDate,
      IsActive: registration.IsActive,
      PersistOn: new Date().toISOString(),
    };
  };

  const requestPayment = async () => {
    try {
      const payload = registrationPayload();
      if (selectedRegisterKind?.MembershipType === 2) { setSpaceReleaseOpen(true); return; }
      setSaving(true);
      setError('');
      const preview = parseRegistrationPreview(await memberApi.previewRegistration(payload));
      setPaymentPreview(preview);
      setRegistrationOpen(false);
      setPaymentOpen(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.registrationError);
    } finally {
      setSaving(false);
    }
  };

  const requestPaymentAfterSpaceRelease = async () => {
    try {
      const payload = registrationPayload();
      setSaving(true);
      setError('');
      const preview = parseRegistrationPreview(await memberApi.previewRegistration(payload));
      setSpaceReleaseOpen(false);
      setPaymentPreview(preview);
      setRegistrationOpen(false);
      setPaymentOpen(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.registrationError);
    } finally {
      setSaving(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const payload = registrationPayload();
      setSaving(true);
      setError('');
      const result = parseRegistrationPreview(await memberApi.saveRegistration(payload));
      if (!result.Id) throw new Error(t.registrationError);
      setPaymentOpen(false);
      setRegistration(null);
      setPaymentPreview(null);
      await load();
      setDraft(null);
      setMessage(t.registrationSaved);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.registrationError);
    } finally {
      setSaving(false);
    }
  };

  const openCancellation = async (membership: Membership) => {
    if (!content?.Id || !membership.Id) return;
    setSaving(true);
    setError('');
    try {
      const credit = parseCreditInfo(await trafficApi.getMemberCurrentCreditInfo(content.Id)).find((item) => item.MemberRegisterId === membership.Id);
      if (!credit) throw new Error(t.cancellationUnavailable);
      setCancellationTarget({ ...membership, MemberId: content.Id });
      setCancellationCredit(credit);
      setCancellationType('');
      setCancellationOpen(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.cancellationError);
    } finally {
      setSaving(false);
    }
  };

  const confirmCancellation = async () => {
    if (!cancellationTarget || !cancellationType) return;
    setSaving(true);
    setError('');
    try {
      const result = responseValue(await memberApi.cancelRegistration({ ...cancellationTarget, CancellingMembershipType: Number(cancellationType) }));
      if (!bool(result)) throw new Error(t.cancellationError);
      setCancellationOpen(false);
      setCancellationTarget(null);
      setCancellationCredit(null);
      await load();
      setDraft(null);
      setMessage(t.cancellationSaved);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : t.cancellationError);
    } finally {
      setSaving(false);
    }
  };

  const creditTypeLabel = (value: number | undefined) => value === 0 ? t.creditTypeCredit : value === 1 ? t.creditTypeLongTime : t.creditTypeLongTimeCredit;

  return (
    <ManagementWorkspaceFrame
      title={title}
      pageTitle={pageTitle}
      subtitle={t.subtitle}
      language={language}
      loading={loading || saving}
      onRefresh={() => void load()}
      toolbar={<><Button size="small" variant="contained" startIcon={<AddRoundedIcon />} onClick={startNew}>{t.new}</Button><Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => startEdit()} disabled={!selected}>{t.edit}</Button><Tooltip title={t.remove}><span><IconButton color="error" aria-label={t.remove} onClick={() => setDeleteOpen(true)} disabled={!selected}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></>}
    >
      {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Box className="member-management-layout">
        <Box className="member-management-list">
          <ResourceState loading={loading} error={error && rows.length === 0 ? error : ''} empty={!error && !loading && rows.length === 0} loadingLabel={t.listLoading} emptyLabel={t.listEmpty}>
            <Box className="member-management-list-grid">
              <AppDataGrid rows={rows} direction={language === 'fa' ? 'rtl' : 'ltr'} rowKey={(row) => row.key} selectedKey={selectedId} onRowClick={(row) => { setSelectedId(row.key); setDraft(null); }} onRowDoubleClick={(row) => startEdit(row)} columns={[
                { key: 'Code', label: t.code, render: (row) => <span dir="ltr">{row.Code}</span> },
                { key: 'Name', label: t.fullName, render: (row) => `${row.Name} ${row.Family}` },
                { key: 'IsMemberBlock', label: t.status, compact: true, getBooleanValue: (row) => !row.IsMemberBlock, trueLabel: t.active, falseLabel: t.inactive },
              ]} />
            </Box>
          </ResourceState>
        </Box>
        <Box className="member-management-detail">
          {content ? <>
            <Box className="member-detail-heading">
              <Box><Typography variant="subtitle2">{draft ? t.details : `${content.Name} ${content.Family}`}</Typography><Typography variant="caption" color="text.secondary">{t.code}: <span dir="ltr">{content.Code || '—'}</span></Typography></Box>
              {draft && <Stack direction="row" spacing={1}><Button size="small" onClick={() => setDraft(null)}>{t.cancel}</Button><Button size="small" variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void saveMember(true)} disabled={saving}>{t.save}</Button></Stack>}
            </Box>
            <Divider />
            <Tabs value={tab} onChange={(_, value) => selectTab(value)} variant="scrollable" scrollButtons="auto"><Tab label={t.details} /><Tab label={t.cars} /><Tab label={t.membership} /><Tab label={t.spaces} /></Tabs>
            {tab === 0 && <Box className="member-form-grid">
              <TextField size="small" label={t.name} required value={content.Name} disabled={!draft} onChange={(event) => update('Name', event.target.value)} />
              <TextField size="small" label={t.family} value={content.Family} disabled={!draft} onChange={(event) => update('Family', event.target.value)} />
              <TextField size="small" label={t.code} required value={content.Code} disabled={!draft} onChange={(event) => update('Code', event.target.value)} slotProps={{ htmlInput: { dir: 'ltr' } }} />
              <TextField size="small" label={t.national} value={content.NationalCode} disabled={!draft} onChange={(event) => update('NationalCode', event.target.value)} slotProps={{ htmlInput: { dir: 'ltr', maxLength: 10 } }} />
              <TextField size="small" label={t.phone} value={content.PhoneNumber} disabled={!draft} onChange={(event) => update('PhoneNumber', event.target.value)} slotProps={{ htmlInput: { dir: 'ltr' } }} />
              <TextField size="small" label={t.card} value={content.CardNumber} disabled={!draft} onChange={(event) => update('CardNumber', event.target.value)} slotProps={{ htmlInput: { dir: 'ltr' } }} />
              <TextField size="small" label={t.face} value={content.FaceTag} disabled={!draft} onChange={(event) => update('FaceTag', event.target.value)} slotProps={{ htmlInput: { dir: 'ltr' } }} />
              <TextField size="small" label={t.exit} value={content.ExitPermissionAccepter} disabled={!draft} onChange={(event) => update('ExitPermissionAccepter', event.target.value ? Number(event.target.value) : '')} slotProps={{ htmlInput: { dir: 'ltr' } }} />
              <TextField className="member-address-field" size="small" label={t.address} value={content.Address} disabled={!draft} onChange={(event) => update('Address', event.target.value)} multiline minRows={2} />
              <FormControlLabel control={<Switch size="small" checked={content.IsMemberBlock} disabled={!draft} onChange={(event) => update('IsMemberBlock', event.target.checked)} />} label={t.inactive} />
            </Box>}
            {tab === 1 && <MemberCars rows={content.Cars} t={t} editable={Boolean(draft)} onAdd={() => setCarOpen(true)} />}
            {tab === 2 && <Memberships rows={content.MemberRegisters} cashAmount={content.CashAmount} t={t} language={language} editable={Boolean(draft)} onAdd={() => void openRegistration()} onCancel={(membership) => void openCancellation(membership)} />}
            {tab === 3 && <ParkingSpaces rows={content.MemberParkSpaces} availableRows={availableParkingSpaces} t={t} language={language} editable={Boolean(draft)} canManage={canManageParkingSpaces} loading={parkingSpacesLoading} error={parkingSpacesError} notice={parkingSpaceNotice} selectedAvailableKeys={selectedAvailableParkingSpaces} selectedAssignedKeys={selectedMemberParkingSpaces} onAvailableSelectionChange={setSelectedAvailableParkingSpaces} onAssignedSelectionChange={setSelectedMemberParkingSpaces} onAssign={assignParkingSpace} onRelease={releaseParkingSpace} onAssignSelected={assignSelectedParkingSpaces} onReleaseSelected={releaseSelectedParkingSpaces} onRetry={() => void loadAvailableParkingSpaces()} />}
          </> : <Alert severity="info">{t.listEmpty}</Alert>}
        </Box>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'}><DialogTitle>{t.deleteTitle}</DialogTitle><DialogContent><Typography>{t.deleteMessage}</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>{t.cancel}</Button><Button color="error" variant="contained" onClick={() => void remove()} disabled={saving}>{t.confirm}</Button></DialogActions></Dialog>
      <Dialog open={carOpen} onClose={() => setCarOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'} fullWidth maxWidth="sm"><DialogTitle>{t.addCar}</DialogTitle><DialogContent><Box className="member-dialog-grid"><IranianPlateInput label={t.plate} value={carDraft.Plate} carType={carDraft.CarType} onCarTypeChange={(CarType) => setCarDraft((item) => ({ ...item, CarType }))} onChange={(Plate) => setCarDraft((item) => ({ ...item, Plate }))} error={carPlateInvalid} helperText={carPlateInvalid ? t.plateInvalid : undefined} /><TextField size="small" label={t.carName} value={carDraft.Name} onChange={(event) => setCarDraft((item) => ({ ...item, Name: event.target.value }))} /><TextField size="small" label={t.model} value={carDraft.DtoViewCarModelTitle} onChange={(event) => setCarDraft((item) => ({ ...item, DtoViewCarModelTitle: event.target.value }))} /><TextField size="small" label={t.color} value={carDraft.DtoViewCarColorTitle} onChange={(event) => setCarDraft((item) => ({ ...item, DtoViewCarColorTitle: event.target.value }))} /></Box></DialogContent><DialogActions><Button onClick={() => setCarOpen(false)}>{t.cancel}</Button><Button variant="contained" onClick={addCar}>{t.add}</Button></DialogActions></Dialog>
      <Dialog open={saveFirstOpen} onClose={() => setSaveFirstOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'}><DialogTitle>{t.saveFirstTitle}</DialogTitle><DialogContent><Typography>{t.saveFirstMessage}</Typography></DialogContent><DialogActions><Button onClick={() => setSaveFirstOpen(false)}>{t.cancel}</Button><Button variant="contained" onClick={() => void saveMemberAndOpenRegistration()} disabled={saving}>{t.saveAndContinue}</Button></DialogActions></Dialog>
      <Dialog open={replaceOpen} onClose={() => setReplaceOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'}><DialogTitle>{t.replacementTitle}</DialogTitle><DialogContent><Typography>{t.replacementMessage}</Typography></DialogContent><DialogActions><Button onClick={() => { setReplaceOpen(false); if (pendingRegistrationMember) void openRegistrationDialog(pendingRegistrationMember, false); }}>{t.makeReservation}</Button><Button variant="contained" onClick={() => { setReplaceOpen(false); if (pendingRegistrationMember) void openRegistrationDialog(pendingRegistrationMember, true); }}>{t.replaceMembership}</Button></DialogActions></Dialog>
      <Dialog open={registrationOpen} onClose={() => setRegistrationOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'} fullWidth maxWidth="xs"><DialogTitle>{t.addMembership}</DialogTitle><DialogContent><Box className="member-registration-dialog"><TextField select fullWidth size="small" label={t.type} value={registration?.MemberRegisterKindId || ''} onChange={(event) => selectRegistrationKind(Number(event.target.value))}>{registerKinds.map((kind) => <MenuItem key={kind.Id} value={kind.Id}>{kind.Title}</MenuItem>)}</TextField><MoneyTextField fullWidth size="small" label={t.credit} value={registration?.CreditAmount ?? ''} onValueChange={(value) => setRegistration((current) => current ? { ...current, CreditAmount: number(value) } : current)} /><TextField fullWidth size="small" label={t.tax} value={formatMoney(registration?.TaxValue ?? 0)} disabled slotProps={{ htmlInput: { dir: 'ltr' } }} /><TextField fullWidth size="small" type="datetime-local" label={t.start} value={registration ? registration.StartDate.slice(0, 16) : ''} disabled slotProps={{ inputLabel: { shrink: true } }} /><TextField fullWidth size="small" type="datetime-local" label={t.end} value={registration?.EndDate ? registration.EndDate.slice(0, 16) : ''} disabled slotProps={{ inputLabel: { shrink: true } }} /></Box></DialogContent><DialogActions><Button onClick={() => setRegistrationOpen(false)}>{t.cancel}</Button><Button variant="contained" onClick={() => void requestPayment()} disabled={!registration?.MemberRegisterKindId || saving}>{t.payment}</Button></DialogActions></Dialog>
      <Dialog open={spaceReleaseOpen} onClose={() => setSpaceReleaseOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'}><DialogTitle>{t.addMembership}</DialogTitle><DialogContent><Typography>{t.memberKindSpaceMessage}</Typography></DialogContent><DialogActions><Button onClick={() => setSpaceReleaseOpen(false)}>{t.cancel}</Button><Button variant="contained" onClick={() => void requestPaymentAfterSpaceRelease()} disabled={saving}>{t.confirmSpaceRelease}</Button></DialogActions></Dialog>
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'} fullWidth maxWidth="xs"><DialogTitle>{t.payment}</DialogTitle><DialogContent><Box className="member-payment-summary"><Typography>{t.credit}: <strong dir="ltr">{formatMoney(paymentPreview?.CreditAmount ?? registration?.CreditAmount ?? 0)} {t.rial}</strong></Typography><Typography>{t.tax}: <strong dir="ltr">{formatMoney(paymentPreview?.Tax ?? registration?.TaxValue ?? 0)} {t.rial}</strong></Typography><Typography>{t.transfer}: <strong dir="ltr">{formatMoney(paymentPreview?.TransferAmount ?? 0)} {t.rial}</strong></Typography><Divider /><Typography variant="subtitle2">{t.payable}: <span dir="ltr">{formatMoney(paymentPreview?.TotalAmount ?? 0)} {t.rial}</span></Typography><Alert severity="info">{t.paymentDescription}</Alert></Box></DialogContent><DialogActions><Button onClick={() => setPaymentOpen(false)}>{t.cancel}</Button><Button variant="contained" onClick={() => void confirmPayment()} disabled={saving}>{t.confirmPayment}</Button></DialogActions></Dialog>
      <Dialog open={cancellationOpen} onClose={() => setCancellationOpen(false)} dir={language === 'fa' ? 'rtl' : 'ltr'} fullWidth maxWidth="xs"><DialogTitle>{t.cancellation}</DialogTitle><DialogContent><Box className="member-cancellation-dialog"><Typography variant="body2">{t.creditStatus}: {cancellationCredit?.IsActive ? t.active : t.makeReservation}</Typography><Typography variant="body2">{t.creditType}: {creditTypeLabel(cancellationCredit?.MembershipCreditType)}</Typography><TextField select fullWidth size="small" label={t.cancellationType} value={cancellationType} onChange={(event) => setCancellationType(event.target.value)}><MenuItem value="1">{t.refund}</MenuItem><MenuItem value="2">{t.settlement}</MenuItem><MenuItem value="3">{t.terminate}</MenuItem></TextField></Box></DialogContent><DialogActions><Button onClick={() => setCancellationOpen(false)}>{t.cancel}</Button><Button color="error" variant="contained" onClick={() => void confirmCancellation()} disabled={!cancellationType || saving}>{t.cancelMembership}</Button></DialogActions></Dialog>
    </ManagementWorkspaceFrame>
  );
}

function MemberCars({ rows, t, editable, onAdd }: { rows: Car[]; t: ReturnType<typeof copy>; editable: boolean; onAdd: () => void }) {
  return <Box className="member-tab-content">{editable && <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd}>{t.addCar}</Button>}{rows.length ? <AppDataGrid rows={rows} rowKey={(row, index) => row.Id || index} columns={[{ key: 'Plate', label: t.plate, render: (row) => <span dir="ltr">{row.Plate}</span> }, { key: 'CarType', label: t.type, render: (row) => row.CarType || '—' }, { key: 'Name', label: t.carName, render: (row) => row.Name || '—' }, { key: 'DtoViewCarModelTitle', label: t.model, render: (row) => row.DtoViewCarModelTitle || '—' }]} /> : <Typography variant="body2" color="text.secondary">{t.carsEmpty}</Typography>}</Box>;
}

function Memberships({ rows, cashAmount, t, language, editable, onAdd, onCancel }: { rows: Membership[]; cashAmount: number; t: ReturnType<typeof copy>; language: Language; editable: boolean; onAdd: () => void; onCancel: (membership: Membership) => void }) {
  return <Box className="member-tab-content"><Box className="member-membership-toolbar">{editable && <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd}>{t.addMembership}</Button>}<Typography variant="body2" color="text.secondary">{t.balance}: <strong dir="ltr">{formatMoney(cashAmount)} {t.rial}</strong></Typography></Box>{rows.length ? <AppDataGrid rows={rows} direction={language === 'fa' ? 'rtl' : 'ltr'} rowKey={(row, index) => row.Id || index} columns={[{ key: 'MemberRegisterKindTitle', label: t.type, render: (row) => row.MemberRegisterKindTitle || '—' }, { key: 'CreditAmount', label: t.credit, render: (row) => <span dir="ltr">{formatMoney(row.CreditAmount)} {t.rial}</span> }, { key: 'StartDate', label: t.start, render: (row) => formatDateTime(row.StartDate, language) }, { key: 'EndDate', label: t.end, render: (row) => formatDateTime(row.EndDate, language) }, { key: 'IsActive', label: t.status, compact: true, trueLabel: t.active, falseLabel: t.makeReservation }, { key: 'actions', label: t.actions, compact: true, filterable: false, render: (row) => <Tooltip title={t.cancellation}><span><IconButton size="small" color="error" aria-label={`${t.cancellation}: ${row.MemberRegisterKindTitle}`} onClick={() => onCancel(row)} disabled={!row.Id}><CancelOutlinedIcon fontSize="small" /></IconButton></span></Tooltip> }]} /> : <Typography variant="body2" color="text.secondary">{t.membershipEmpty}</Typography>}</Box>;
}

function ParkingSpaces({ rows, availableRows, t, language, editable, canManage, loading, error, notice, selectedAvailableKeys, selectedAssignedKeys, onAvailableSelectionChange, onAssignedSelectionChange, onAssign, onRelease, onAssignSelected, onReleaseSelected, onRetry }: {
  rows: ParkingSpace[];
  availableRows: ParkingSpace[];
  t: ReturnType<typeof copy>;
  language: Language;
  editable: boolean;
  canManage: boolean;
  loading: boolean;
  error: string;
  notice: string;
  selectedAvailableKeys: string[];
  selectedAssignedKeys: string[];
  onAvailableSelectionChange: (keys: string[]) => void;
  onAssignedSelectionChange: (keys: string[]) => void;
  onAssign: (space: ParkingSpace) => void;
  onRelease: (space: ParkingSpace) => void;
  onAssignSelected: () => void;
  onReleaseSelected: () => void;
  onRetry: () => void;
}) {
  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const selectionEnabled = editable && canManage;
  const gridColumns = (action: 'assign' | 'release') => [
    { key: 'FloorTitle', label: t.floor, render: (row: ParkingSpace) => row.FloorTitle || '—' },
    { key: 'ParkSpaceTitle', label: t.parkingSpace, render: (row: ParkingSpace) => row.ParkSpaceTitle || '—' },
    ...(editable && !notice ? [{
      key: 'actions',
      label: t.actions,
      compact: true,
      filterable: false,
      render: (row: ParkingSpace) => action === 'assign'
        ? <Tooltip title={t.assignSpace}><span><IconButton size="small" color="primary" aria-label={`${t.assignSpace}: ${row.ParkSpaceTitle}`} onClick={() => onAssign(row)}><AddRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
        : <Tooltip title={t.releaseSpace}><span><IconButton size="small" color="error" aria-label={`${t.releaseSpace}: ${row.ParkSpaceTitle}`} onClick={() => onRelease(row)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></span></Tooltip>,
    }] : []),
  ];
  const rowKey = (row: ParkingSpace, index: number) => row.ParkSpaceId || row.Id || index;

  return <Box className="member-tab-content member-parking-spaces">
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>{t.retry}</Button>}>{error}</Alert>}
    {notice && <Alert severity="info">{notice}</Alert>}
    <Box className="member-parking-space-grids">
      <AppGroupBox title={`${t.availableSpaces} (${availableRows.length})`} className="member-parking-space-group">
        {selectionEnabled && <Box className="member-parking-space-toolbar"><Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAssignSelected} disabled={!selectedAvailableKeys.length || loading}>{t.assignSpace}</Button></Box>}
        {loading
          ? <Typography variant="body2" color="text.secondary">{t.spacesLoading}</Typography>
          : availableRows.length
            ? <AppDataGrid rows={availableRows} direction={direction} rowKey={rowKey} selectedKeys={selectionEnabled ? selectedAvailableKeys : []} onSelectionChange={selectionEnabled ? (keys) => onAvailableSelectionChange(keys.map(String)) : undefined} columns={gridColumns('assign')} />
            : <Typography variant="body2" color="text.secondary">{t.availableSpacesEmpty}</Typography>}
      </AppGroupBox>
      <AppGroupBox title={`${t.assignedSpaces} (${rows.length})`} className="member-parking-space-group">
        {selectionEnabled && <Box className="member-parking-space-toolbar"><Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={onReleaseSelected} disabled={!selectedAssignedKeys.length}>{t.releaseSpace}</Button></Box>}
        {rows.length
          ? <AppDataGrid rows={rows} direction={direction} rowKey={rowKey} selectedKeys={selectionEnabled ? selectedAssignedKeys : []} onSelectionChange={selectionEnabled ? (keys) => onAssignedSelectionChange(keys.map(String)) : undefined} columns={gridColumns('release')} />
          : <Typography variant="body2" color="text.secondary">{t.spacesEmpty}</Typography>}
      </AppGroupBox>
    </Box>
  </Box>;
}
