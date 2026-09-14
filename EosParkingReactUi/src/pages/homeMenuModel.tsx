import type { ReactNode } from 'react';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
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

export type ManagementSection = 'list' | 'users' | 'access' | 'reports' | 'exit';
export type HomeMenuItem = { key: string; label: string; icon: ReactNode };
export type HomeMenuGroup = { key: string; title: string; items: HomeMenuItem[] };

export const parkingCrudItems = new Set(['space-types', 'floors', 'zones', 'member-kinds']);

export function createManagementItems(labels: { listMenu: string; users: string; accessLevels: string; reports: string; exitPermission: string }): Array<HomeMenuItem & { key: ManagementSection }> {
  return [
    { key: 'list', label: labels.listMenu, icon: <LocalParkingRoundedIcon /> },
    { key: 'users', label: labels.users, icon: <PeopleAltRoundedIcon /> },
    { key: 'access', label: labels.accessLevels, icon: <SecurityRoundedIcon /> },
    { key: 'reports', label: labels.reports, icon: <AssessmentRoundedIcon /> },
    { key: 'exit', label: labels.exitPermission, icon: <LoginRoundedIcon /> },
  ];
}

export function createParkingMenuGroups(language: Language): HomeMenuGroup[] {
  if (language === 'fa') {
    return [
      { key: 'definitions', title: 'تعاریف و تنظیمات پارکینگ', items: [{ key: 'parking-details', label: 'مشخصات پارکینگ', icon: <SettingsRoundedIcon /> }, { key: 'equipment', label: 'تجهیزات', icon: <DevicesOtherRoundedIcon /> }, { key: 'space-types', label: 'انواع جای پارک', icon: <ViewModuleRoundedIcon /> }, { key: 'floors', label: 'طبقات و تقسیمات', icon: <LayersRoundedIcon /> }, { key: 'zones', label: 'زون‌های پارکینگ', icon: <GridViewRoundedIcon /> }, { key: 'doors', label: 'درب‌های پارکینگ', icon: <DoorFrontRoundedIcon /> }, { key: 'member-kinds', label: 'انواع عضویت', icon: <BadgeRoundedIcon /> }, { key: 'tariffs', label: 'تعرفه', icon: <SellRoundedIcon /> }, { key: 'cards', label: 'مدیریت کارت‌ها', icon: <CreditCardRoundedIcon /> }, { key: 'members', label: 'عضویت و ثبت‌نام', icon: <PeopleAltRoundedIcon /> }, { key: 'traffic-control-list', label: 'کنترل تردد خودروها', icon: <TrafficRoundedIcon /> }] },
      { key: 'operations', title: 'عملیات پارکینگ', items: [{ key: 'monitoring', label: 'مانیتورینگ', icon: <MonitorHeartRoundedIcon /> }, { key: 'shifts', label: 'اختصاص شیفت', icon: <BadgeRoundedIcon /> }, { key: 'manual-traffic', label: 'کنترل ورود و خروج', icon: <LoginRoundedIcon /> }, { key: 'traffic-records', label: 'مدیریت ورودها و خروج‌ها', icon: <TrafficRoundedIcon /> }, { key: 'anpr-monitoring', label: 'مانیتورینگ تشخیص پلاک', icon: <MonitorHeartRoundedIcon /> }] },
      { key: 'integrations', title: 'یکپارچه‌سازی سامانه‌ها', items: [{ key: 'integration-settings', label: 'تنظیم ارتباط با سیستم‌ها', icon: <SettingsRoundedIcon /> }, { key: 'ets-import', label: 'به‌روزرسانی اعضا از ETS', icon: <SyncRoundedIcon /> }, { key: 'excel-import', label: 'دریافت اطلاعات پرسنلی از Excel', icon: <UploadFileRoundedIcon /> }] },
      { key: 'reports', title: 'گزارش‌های پارکینگ', items: [{ key: 'member-reports', label: 'گزارش اعضا و عضویت', icon: <PeopleAltRoundedIcon /> }, { key: 'traffic-reports', label: 'گزارش ورود و خروج خودروها', icon: <TrafficRoundedIcon /> }, { key: 'door-traffic-reports', label: 'تعداد تردد روزانه درب‌ها', icon: <BarChartRoundedIcon /> }, { key: 'parking-income', label: 'درآمد پارکینگ', icon: <ReceiptLongRoundedIcon /> }, { key: 'member-cash', label: 'گردش مالی اعضا', icon: <ReceiptLongRoundedIcon /> }, { key: 'user-performance', label: 'عملکرد مالی کاربران', icon: <BarChartRoundedIcon /> }, { key: 'membership-income', label: 'ریز درآمد فروش حق عضویت', icon: <ReceiptLongRoundedIcon /> }] },
    ];
  }
  return [
    { key: 'definitions', title: 'Parking definitions and settings', items: [{ key: 'parking-details', label: 'Parking details', icon: <SettingsRoundedIcon /> }, { key: 'equipment', label: 'Equipment', icon: <DevicesOtherRoundedIcon /> }, { key: 'space-types', label: 'Parking space types', icon: <ViewModuleRoundedIcon /> }, { key: 'floors', label: 'Floors and divisions', icon: <LayersRoundedIcon /> }, { key: 'zones', label: 'Parking zones', icon: <GridViewRoundedIcon /> }, { key: 'doors', label: 'Parking doors', icon: <DoorFrontRoundedIcon /> }, { key: 'member-kinds', label: 'Membership types', icon: <BadgeRoundedIcon /> }, { key: 'tariffs', label: 'Tariffs', icon: <SellRoundedIcon /> }, { key: 'cards', label: 'Card management', icon: <CreditCardRoundedIcon /> }, { key: 'members', label: 'Membership and registration', icon: <PeopleAltRoundedIcon /> }, { key: 'traffic-control-list', label: 'Vehicle traffic control', icon: <TrafficRoundedIcon /> }] },
    { key: 'operations', title: 'Parking operations', items: [{ key: 'monitoring', label: 'Monitoring', icon: <MonitorHeartRoundedIcon /> }, { key: 'shifts', label: 'Assign shift', icon: <BadgeRoundedIcon /> }, { key: 'manual-traffic', label: 'Entry and exit control', icon: <LoginRoundedIcon /> }, { key: 'traffic-records', label: 'Manage entries and exits', icon: <TrafficRoundedIcon /> }, { key: 'anpr-monitoring', label: 'ANPR monitoring', icon: <MonitorHeartRoundedIcon /> }] },
    { key: 'integrations', title: 'System integrations', items: [{ key: 'integration-settings', label: 'Integration settings', icon: <SettingsRoundedIcon /> }, { key: 'ets-import', label: 'Update members from ETS', icon: <SyncRoundedIcon /> }, { key: 'excel-import', label: 'Import personnel from Excel', icon: <UploadFileRoundedIcon /> }] },
    { key: 'reports', title: 'Parking reports', items: [{ key: 'member-reports', label: 'Member and membership reports', icon: <PeopleAltRoundedIcon /> }, { key: 'traffic-reports', label: 'Vehicle entry and exit reports', icon: <TrafficRoundedIcon /> }, { key: 'door-traffic-reports', label: 'Daily door traffic', icon: <BarChartRoundedIcon /> }, { key: 'parking-income', label: 'Parking income', icon: <ReceiptLongRoundedIcon /> }, { key: 'member-cash', label: 'Member cash flow', icon: <ReceiptLongRoundedIcon /> }, { key: 'user-performance', label: 'User financial performance', icon: <BarChartRoundedIcon /> }, { key: 'membership-income', label: 'Membership sales income', icon: <ReceiptLongRoundedIcon /> }] },
  ];
}

const permissionBits: Record<string, { part: 1 | 2; bit: bigint }> = {
  'parking-details': { part: 1, bit: 1n << 1n }, equipment: { part: 1, bit: 1n << 4n }, 'space-types': { part: 1, bit: 1n << 50n }, floors: { part: 1, bit: 1n << 7n }, zones: { part: 1, bit: 1n << 10n }, doors: { part: 1, bit: 1n << 13n }, 'member-kinds': { part: 1, bit: 1n << 47n }, tariffs: { part: 1, bit: 1n << 19n }, cards: { part: 1, bit: 1n << 22n }, members: { part: 1, bit: 1n << 25n }, 'traffic-control-list': { part: 1, bit: 1n << 28n }, monitoring: { part: 1, bit: 1n << 45n }, shifts: { part: 1, bit: 1n << 39n }, 'manual-traffic': { part: 1, bit: 1n << 42n }, 'traffic-records': { part: 1, bit: 1n << 46n }, 'anpr-monitoring': { part: 1, bit: 1n << 56n }, 'excel-import': { part: 1, bit: 1n << 55n }, 'member-reports': { part: 2, bit: 1n << 3n }, 'traffic-reports': { part: 2, bit: 1n << 7n }, 'door-traffic-reports': { part: 2, bit: 1n << 8n }, 'parking-income': { part: 2, bit: 1n << 14n }, 'member-cash': { part: 2, bit: 1n << 17n }, 'user-performance': { part: 2, bit: 1n << 17n }, 'membership-income': { part: 2, bit: 1n << 15n },
};

export function visibleParkingGroups(user: HomeUser, groups: HomeMenuGroup[], hasPart1: (bit: bigint, permissionName?: string) => boolean, hasPart2: (bit: bigint) => boolean) {
  return user.canManageDashboard ? groups : groups.map((group) => ({ ...group, items: group.items.filter((item) => { const permission = permissionBits[item.key]; return permission ? (permission.part === 1 ? hasPart1(permission.bit) : hasPart2(permission.bit)) : false; }) })).filter((group) => group.items.length > 0);
}

export function visibleManagementItems(user: HomeUser, items: Array<HomeMenuItem & { key: ManagementSection }>, hasPart1: (bit: bigint, permissionName?: string) => boolean, hasPart2: (bit: bigint) => boolean) {
  return items.filter((item) => {
    if (user.canManageDashboard) return true;
    if (item.key === 'users') return hasPart1(1n << 34n, permissionNames.manageUsers);
    if (item.key === 'access') return hasPart1(1n << 29n, permissionNames.manageAccess);
    if (item.key === 'reports') return hasPart2(1n << 3n) || user.permissions.includes(permissionNames.viewReports);
    if (item.key === 'exit') return user.userType === 3;
    return false;
  });
}
