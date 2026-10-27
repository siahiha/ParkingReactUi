import type { ReactNode } from 'react';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import DevicesOtherRoundedIcon from '@mui/icons-material/DevicesOtherRounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import type { Language } from '../i18n';
import { permissionNames } from '../api/contracts';
import type { HomeUser } from './homeTypes';

export type ManagementSection = 'list' | 'users' | 'access' | 'exit';
export type HomeMenuItem = { key: string; label: string; icon: ReactNode };
export type HomeMenuGroup = { key: string; title: string; items: HomeMenuItem[]; subgroups?: HomeMenuGroup[] };

export const parkingCrudItems = new Set(['space-types', 'floors', 'zones', 'member-kinds']);

export function createManagementItems(labels: { listMenu: string; users: string; accessLevels: string; exitPermission: string }): Array<HomeMenuItem & { key: ManagementSection }> {
  return [
    { key: 'list', label: labels.listMenu, icon: <LocalParkingRoundedIcon /> },
    { key: 'users', label: labels.users, icon: <PeopleAltRoundedIcon /> },
    { key: 'access', label: labels.accessLevels, icon: <SecurityRoundedIcon /> },
    { key: 'exit', label: labels.exitPermission, icon: <LoginRoundedIcon /> },
  ];
}

function createReportGroups(language: Language): HomeMenuGroup[] {
  if (language === 'fa') {
    return [
      { key: 'member-reports', title: 'گزارش اعضا', items: [
        { key: 'member-report', label: 'گزارش اعضا', icon: <PeopleAltRoundedIcon /> },
        { key: 'active-member-report', label: 'گزارش اعضای دارای عضویت فعال', icon: <PeopleAltRoundedIcon /> },
        { key: 'inactive-member-report', label: 'گزارش اعضای فاقد عضویت فعال', icon: <PeopleAltRoundedIcon /> },
        { key: 'member-register-history', label: 'سابقه عضویت اعضا', icon: <PeopleAltRoundedIcon /> },
      ] },
      { key: 'traffic-reports', title: 'گزارش تردد', items: [
        { key: 'traffic-reports-list', label: 'ورود و خروج خودروها', icon: <TrafficRoundedIcon /> },
        { key: 'door-traffic-reports', label: 'تعداد تردد روزانه درب‌ها', icon: <BarChartRoundedIcon /> },
        { key: 'average-parking-time', label: 'متوسط مدت پارک خودرو', icon: <BarChartRoundedIcon /> },
      ] },
      { key: 'financial-reports', title: 'گزارش‌های مالی', items: [
        { key: 'parking-income', label: 'درآمد پارکینگ', icon: <ReceiptLongRoundedIcon /> },
        { key: 'monthly-parking-income', label: 'مقایسه درآمد ماهیانه پارکینگ', icon: <BarChartRoundedIcon /> },
        { key: 'member-cash', label: 'گردش مالی اعضا', icon: <ReceiptLongRoundedIcon /> },
        { key: 'user-performance', label: 'عملکرد مالی کاربران', icon: <BarChartRoundedIcon /> },
        { key: 'membership-income', label: 'ریز درآمد فروش حق عضویت', icon: <ReceiptLongRoundedIcon /> },
      ] },
      { key: 'other-reports', title: 'سایر', items: [
        { key: 'cargo-details', label: 'گزارش جزئیات حمل بار', icon: <TrafficRoundedIcon /> },
      ] },
      { key: 'management-reports', title: 'گزارش‌های مدیریتی', items: [
        { key: 'management-monthly-income-comparison', label: 'مقایسه درآمد ماهانه پارکینگ‌ها', icon: <BarChartRoundedIcon /> },
        { key: 'management-income-comparison', label: 'مقایسه درآمد پارکینگ‌ها', icon: <BarChartRoundedIcon /> },
        { key: 'management-yearly-income-comparison', label: 'مقایسه درآمد سالانه پارکینگ‌ها', icon: <BarChartRoundedIcon /> },
        { key: 'management-user-performance', label: 'عملکرد مالی کاربران', icon: <BarChartRoundedIcon /> },
        { key: 'management-free-parking-income', label: 'ریز درآمد پارک آزاد خودروها', icon: <ReceiptLongRoundedIcon /> },
      ] },
    ];
  }

  return [
    { key: 'member-reports', title: 'Member reports', items: [
      { key: 'member-report', label: 'Member report', icon: <PeopleAltRoundedIcon /> },
      { key: 'active-member-report', label: 'Members with active membership', icon: <PeopleAltRoundedIcon /> },
      { key: 'inactive-member-report', label: 'Members without active membership', icon: <PeopleAltRoundedIcon /> },
      { key: 'member-register-history', label: 'Member membership history', icon: <PeopleAltRoundedIcon /> },
    ] },
    { key: 'traffic-reports', title: 'Traffic reports', items: [
      { key: 'traffic-reports-list', label: 'Vehicle entry and exit', icon: <TrafficRoundedIcon /> },
      { key: 'door-traffic-reports', label: 'Daily door traffic', icon: <BarChartRoundedIcon /> },
      { key: 'average-parking-time', label: 'Average vehicle parking time', icon: <BarChartRoundedIcon /> },
    ] },
    { key: 'financial-reports', title: 'Financial reports', items: [
      { key: 'parking-income', label: 'Parking income', icon: <ReceiptLongRoundedIcon /> },
      { key: 'monthly-parking-income', label: 'Monthly parking income comparison', icon: <BarChartRoundedIcon /> },
      { key: 'member-cash', label: 'Member cash flow', icon: <ReceiptLongRoundedIcon /> },
      { key: 'user-performance', label: 'User financial performance', icon: <BarChartRoundedIcon /> },
      { key: 'membership-income', label: 'Membership sales income details', icon: <ReceiptLongRoundedIcon /> },
    ] },
    { key: 'other-reports', title: 'Other', items: [
      { key: 'cargo-details', label: 'Cargo details report', icon: <TrafficRoundedIcon /> },
    ] },
    { key: 'management-reports', title: 'Management reports', items: [
      { key: 'management-monthly-income-comparison', label: 'Monthly parking income comparison', icon: <BarChartRoundedIcon /> },
      { key: 'management-income-comparison', label: 'Parking income comparison', icon: <BarChartRoundedIcon /> },
      { key: 'management-yearly-income-comparison', label: 'Yearly parking income comparison', icon: <BarChartRoundedIcon /> },
      { key: 'management-user-performance', label: 'User financial performance', icon: <BarChartRoundedIcon /> },
      { key: 'management-free-parking-income', label: 'Free-parking income details', icon: <ReceiptLongRoundedIcon /> },
    ] },
  ];
}

export function createParkingMenuGroups(language: Language): HomeMenuGroup[] {
  if (language === 'fa') {
    return [
      { key: 'definitions', title: 'تعاریف و تنظیمات پارکینگ', items: [{ key: 'parking-details', label: 'مشخصات پارکینگ', icon: <SettingsRoundedIcon /> }, { key: 'equipment', label: 'تجهیزات', icon: <DevicesOtherRoundedIcon /> }, { key: 'space-types', label: 'انواع جای پارک', icon: <ViewModuleRoundedIcon /> }, { key: 'floors', label: 'طبقات و تقسیمات', icon: <LayersRoundedIcon /> }, { key: 'zones', label: 'زون‌های پارکینگ', icon: <GridViewRoundedIcon /> }, { key: 'doors', label: 'درب‌های پارکینگ', icon: <DoorFrontRoundedIcon /> }, { key: 'member-kinds', label: 'انواع عضویت', icon: <BadgeRoundedIcon /> }, { key: 'tariffs', label: 'تعرفه', icon: <SellRoundedIcon /> }, { key: 'cards', label: 'مدیریت کارت‌ها', icon: <CreditCardRoundedIcon /> }, { key: 'members', label: 'عضویت و ثبت‌نام', icon: <PeopleAltRoundedIcon /> }] },
      { key: 'operations', title: 'عملیات پارکینگ', items: [{ key: 'monitoring', label: 'مانیتورینگ', icon: <MonitorHeartRoundedIcon /> }, { key: 'shifts', label: 'اختصاص شیفت', icon: <BadgeRoundedIcon /> }, { key: 'manual-traffic', label: 'کنترل ورود و خروج', icon: <LoginRoundedIcon /> }, { key: 'traffic-records', label: 'مدیریت ورودها و خروج‌ها', icon: <TrafficRoundedIcon /> }, { key: 'anpr-monitoring', label: 'مانیتورینگ تشخیص پلاک', icon: <MonitorHeartRoundedIcon /> }] },
      { key: 'integrations', title: 'یکپارچه‌سازی سامانه‌ها', items: [{ key: 'integration-settings', label: 'تنظیم ارتباط با سیستم‌ها', icon: <SettingsRoundedIcon /> }, { key: 'ets-import', label: 'به‌روزرسانی اعضا از ETS', icon: <SyncRoundedIcon /> }, { key: 'excel-import', label: 'دریافت اطلاعات پرسنلی از Excel', icon: <UploadFileRoundedIcon /> }] },
      { key: 'reports', title: 'گزارش‌ها', items: [], subgroups: createReportGroups(language) },
    ];
  }
  return [
    { key: 'definitions', title: 'Parking definitions and settings', items: [{ key: 'parking-details', label: 'Parking details', icon: <SettingsRoundedIcon /> }, { key: 'equipment', label: 'Equipment', icon: <DevicesOtherRoundedIcon /> }, { key: 'space-types', label: 'Parking space types', icon: <ViewModuleRoundedIcon /> }, { key: 'floors', label: 'Floors and divisions', icon: <LayersRoundedIcon /> }, { key: 'zones', label: 'Parking zones', icon: <GridViewRoundedIcon /> }, { key: 'doors', label: 'Parking doors', icon: <DoorFrontRoundedIcon /> }, { key: 'member-kinds', label: 'Membership types', icon: <BadgeRoundedIcon /> }, { key: 'tariffs', label: 'Tariffs', icon: <SellRoundedIcon /> }, { key: 'cards', label: 'Card management', icon: <CreditCardRoundedIcon /> }, { key: 'members', label: 'Membership and registration', icon: <PeopleAltRoundedIcon /> }] },
    { key: 'operations', title: 'Parking operations', items: [{ key: 'monitoring', label: 'Monitoring', icon: <MonitorHeartRoundedIcon /> }, { key: 'shifts', label: 'Assign shift', icon: <BadgeRoundedIcon /> }, { key: 'manual-traffic', label: 'Entry and exit control', icon: <LoginRoundedIcon /> }, { key: 'traffic-records', label: 'Manage entries and exits', icon: <TrafficRoundedIcon /> }, { key: 'anpr-monitoring', label: 'ANPR monitoring', icon: <MonitorHeartRoundedIcon /> }] },
    { key: 'integrations', title: 'System integrations', items: [{ key: 'integration-settings', label: 'Integration settings', icon: <SettingsRoundedIcon /> }, { key: 'ets-import', label: 'Update members from ETS', icon: <SyncRoundedIcon /> }, { key: 'excel-import', label: 'Import personnel from Excel', icon: <UploadFileRoundedIcon /> }] },
    { key: 'reports', title: 'Reports', items: [], subgroups: createReportGroups(language) },
  ];
}

const permissionBits: Record<string, { part: 1 | 2; bit: bigint }> = {
  'parking-details': { part: 1, bit: 1n << 1n }, equipment: { part: 1, bit: 1n << 4n }, 'space-types': { part: 1, bit: 1n << 50n }, floors: { part: 1, bit: 1n << 7n }, zones: { part: 1, bit: 1n << 10n }, doors: { part: 1, bit: 1n << 13n }, 'member-kinds': { part: 1, bit: 1n << 47n }, tariffs: { part: 1, bit: 1n << 19n }, cards: { part: 1, bit: 1n << 22n }, members: { part: 1, bit: 1n << 25n }, monitoring: { part: 1, bit: 1n << 45n }, shifts: { part: 1, bit: 1n << 39n }, 'manual-traffic': { part: 1, bit: 1n << 42n }, 'traffic-records': { part: 1, bit: 1n << 46n }, 'anpr-monitoring': { part: 1, bit: 1n << 56n }, 'excel-import': { part: 1, bit: 1n << 55n },
  'member-report': { part: 2, bit: 1n << 3n }, 'active-member-report': { part: 2, bit: 1n << 4n }, 'inactive-member-report': { part: 2, bit: 1n << 5n }, 'member-register-history': { part: 2, bit: 1n << 6n }, 'traffic-reports-list': { part: 2, bit: 1n << 7n }, 'door-traffic-reports': { part: 2, bit: 1n << 8n }, 'average-parking-time': { part: 2, bit: 1n << 11n }, 'parking-income': { part: 2, bit: 1n << 14n }, 'monthly-parking-income': { part: 2, bit: 1n << 15n }, 'member-cash': { part: 2, bit: 1n << 16n }, 'user-performance': { part: 2, bit: 1n << 17n }, 'membership-income': { part: 2, bit: 1n << 15n }, 'cargo-details': { part: 2, bit: 1n << 18n },
  'management-monthly-income-comparison': { part: 2, bit: 1n << 15n }, 'management-income-comparison': { part: 2, bit: 1n << 14n }, 'management-yearly-income-comparison': { part: 2, bit: 1n << 15n }, 'management-user-performance': { part: 2, bit: 1n << 17n }, 'management-free-parking-income': { part: 2, bit: 1n << 14n },
};

export function flattenParkingMenuItems(groups: HomeMenuGroup[]): HomeMenuItem[] {
  return groups.flatMap((group) => [...group.items, ...(group.subgroups ? flattenParkingMenuItems(group.subgroups) : [])]);
}

function filterVisibleGroup(group: HomeMenuGroup, hasPart1: (bit: bigint, permissionName?: string) => boolean, hasPart2: (bit: bigint) => boolean): HomeMenuGroup | null {
  const items = group.items.filter((item) => {
    const permission = permissionBits[item.key];
    return permission ? (permission.part === 1 ? hasPart1(permission.bit) : hasPart2(permission.bit)) : false;
  });
  const subgroups = group.subgroups?.map((subgroup) => filterVisibleGroup(subgroup, hasPart1, hasPart2)).filter((subgroup): subgroup is HomeMenuGroup => Boolean(subgroup));
  if (items.length === 0 && (!subgroups || subgroups.length === 0)) return null;
  return { ...group, items, ...(group.subgroups ? { subgroups } : {}) };
}

export function visibleParkingGroups(user: HomeUser, groups: HomeMenuGroup[], hasPart1: (bit: bigint, permissionName?: string) => boolean, hasPart2: (bit: bigint) => boolean) {
  return user.canManageDashboard ? groups : groups.map((group) => filterVisibleGroup(group, hasPart1, hasPart2)).filter((group): group is HomeMenuGroup => Boolean(group));
}

export function visibleManagementItems(user: HomeUser, items: Array<HomeMenuItem & { key: ManagementSection }>, hasPart1: (bit: bigint, permissionName?: string) => boolean, hasPart2: (bit: bigint) => boolean) {
  return items.filter((item) => {
    if (user.canManageDashboard) return true;
    if (item.key === 'users') return hasPart1(1n << 34n, permissionNames.manageUsers);
    if (item.key === 'access') return hasPart1(1n << 29n, permissionNames.manageAccess);
    if (item.key === 'exit') return user.userType === 3;
    return false;
  });
}
