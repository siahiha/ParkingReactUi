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
import type { Language } from '../i18n/instance';
import i18n from '../i18n/instance';
import { permissionNames } from '../api/contracts';
import type { HomeUser } from './homeTypes';

export type ManagementSection = 'list' | 'users' | 'access' | 'exit';
export type HomeMenuItem = { key: string; label: string; icon: ReactNode };
export type HomeMenuGroup = { key: string; title: string; items: HomeMenuItem[]; subgroups?: HomeMenuGroup[] };

export const parkingCrudItems = new Set(['space-types', 'floors', 'zones', 'member-kinds']);

export function createManagementItems(language: Language): Array<HomeMenuItem & { key: ManagementSection }> {
  const t = i18n.getFixedT(language);
  return [
    { key: 'list', label: t('homeMenu.items.list'), icon: <LocalParkingRoundedIcon /> },
    { key: 'users', label: t('homeMenu.items.users'), icon: <PeopleAltRoundedIcon /> },
    { key: 'access', label: t('homeMenu.items.access'), icon: <SecurityRoundedIcon /> },
    { key: 'exit', label: t('homeMenu.items.exit'), icon: <LoginRoundedIcon /> },
  ];
}

function createReportGroups(language: Language): HomeMenuGroup[] {
  const t = i18n.getFixedT(language);
  const translate = t as unknown as (key: string) => string;
  const item = (key: string, icon: ReactNode): HomeMenuItem => ({ key, label: translate(`homeMenu.items.${key}`), icon });
  return [
    { key: 'member-reports', title: translate('homeMenu.groups.member-reports'), items: [item('member-report', <PeopleAltRoundedIcon />), item('active-member-report', <PeopleAltRoundedIcon />), item('inactive-member-report', <PeopleAltRoundedIcon />), item('member-register-history', <PeopleAltRoundedIcon />)] },
    { key: 'traffic-reports', title: translate('homeMenu.groups.traffic-reports'), items: [item('traffic-reports-list', <TrafficRoundedIcon />), item('door-traffic-reports', <BarChartRoundedIcon />), item('average-parking-time', <BarChartRoundedIcon />)] },
    { key: 'financial-reports', title: translate('homeMenu.groups.financial-reports'), items: [item('parking-income', <ReceiptLongRoundedIcon />), item('monthly-parking-income', <BarChartRoundedIcon />), item('member-cash', <ReceiptLongRoundedIcon />), item('user-performance', <BarChartRoundedIcon />), item('membership-income', <ReceiptLongRoundedIcon />)] },
    { key: 'other-reports', title: translate('homeMenu.groups.other-reports'), items: [item('cargo-details', <TrafficRoundedIcon />)] },
    { key: 'management-reports', title: translate('homeMenu.groups.management-reports'), items: [item('management-monthly-income-comparison', <BarChartRoundedIcon />), item('management-income-comparison', <BarChartRoundedIcon />), item('management-yearly-income-comparison', <BarChartRoundedIcon />), item('management-user-performance', <BarChartRoundedIcon />), item('management-free-parking-income', <ReceiptLongRoundedIcon />)] },
  ];
}

export function createParkingMenuGroups(language: Language): HomeMenuGroup[] {
  const t = i18n.getFixedT(language);
  const translate = t as unknown as (key: string) => string;
  const item = (key: string, icon: ReactNode): HomeMenuItem => ({ key, label: translate(`homeMenu.items.${key}`), icon });
  return [
    { key: 'definitions', title: translate('homeMenu.groups.definitions'), items: [item('parking-details', <SettingsRoundedIcon />), item('equipment', <DevicesOtherRoundedIcon />), item('space-types', <ViewModuleRoundedIcon />), item('floors', <LayersRoundedIcon />), item('zones', <GridViewRoundedIcon />), item('doors', <DoorFrontRoundedIcon />), item('member-kinds', <BadgeRoundedIcon />), item('tariffs', <SellRoundedIcon />), item('cards', <CreditCardRoundedIcon />), item('members', <PeopleAltRoundedIcon />)] },
    { key: 'operations', title: translate('homeMenu.groups.operations'), items: [item('monitoring', <MonitorHeartRoundedIcon />), item('shifts', <BadgeRoundedIcon />), item('manual-traffic', <LoginRoundedIcon />), item('traffic-records', <TrafficRoundedIcon />), item('anpr-monitoring', <MonitorHeartRoundedIcon />)] },
    { key: 'integrations', title: translate('homeMenu.groups.integrations'), items: [item('integration-settings', <SettingsRoundedIcon />), item('ets-import', <SyncRoundedIcon />), item('excel-import', <UploadFileRoundedIcon />)] },
    { key: 'reports', title: translate('homeMenu.groups.reports'), items: [], subgroups: createReportGroups(language) },
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
