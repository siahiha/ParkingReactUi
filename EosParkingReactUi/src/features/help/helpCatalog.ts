import { helpTopicIds, type HelpTopicId } from './helpTypes';

type Topic = { group: 'start' | 'operations' | 'definitions' | 'management' | 'reports'; menus: string[]; related: HelpTopicId[]; public?: boolean };
export const helpCatalog: Record<HelpTopicId, Topic> = {
  home: { group: 'start', menus: [], related: ['traffic', 'members', 'concepts'], public: true },
  parking: { group: 'definitions', menus: ['management/list', 'parking/parking-details'], related: ['shifts', 'tariffs', 'doors'] },
  spaceTypes: { group: 'definitions', menus: ['parking/space-types'], related: ['floors', 'zones'] },
  floors: { group: 'definitions', menus: ['parking/floors'], related: ['spaceTypes', 'zones', 'members'] },
  zones: { group: 'definitions', menus: ['parking/zones'], related: ['floors', 'spaceTypes'] },
  membershipKinds: { group: 'definitions', menus: ['parking/member-kinds'], related: ['members', 'tariffs', 'concepts'] },
  equipment: { group: 'definitions', menus: ['parking/equipment'], related: ['doors', 'plateReader', 'problems'] },
  doors: { group: 'definitions', menus: ['parking/doors'], related: ['equipment', 'traffic', 'shifts'] },
  tariffs: { group: 'definitions', menus: ['parking/tariffs'], related: ['payment', 'membershipKinds', 'parking'] },
  members: { group: 'definitions', menus: ['parking/members'], related: ['cards', 'membershipKinds', 'importMembers'] },
  cards: { group: 'definitions', menus: ['parking/cards'], related: ['members', 'traffic'] },
  traffic: { group: 'operations', menus: ['parking/manual-traffic'], related: ['payment', 'history', 'cargo', 'concepts'] },
  payment: { group: 'operations', menus: ['parking/manual-traffic', 'parking/traffic-records'], related: ['traffic', 'history', 'concepts'] },
  history: { group: 'operations', menus: ['parking/traffic-records', 'parking/manual-traffic'], related: ['traffic', 'payment', 'trafficReports'] },
  monitoring: { group: 'operations', menus: ['parking/monitoring'], related: ['plateReader', 'traffic', 'equipment'] },
  plateReader: { group: 'operations', menus: ['parking/anpr-monitoring'], related: ['traffic', 'equipment', 'monitoring'] },
  shifts: { group: 'operations', menus: ['parking/shifts'], related: ['parking', 'users', 'doors'] },
  users: { group: 'management', menus: ['management/users'], related: ['access', 'shifts', 'concepts'] },
  access: { group: 'management', menus: ['management/access'], related: ['users', 'shifts'] },
  exitPermission: { group: 'management', menus: ['management/exit'], related: ['traffic', 'history'] },
  integration: { group: 'definitions', menus: ['parking/integration-settings'], related: ['importMembers', 'members'] },
  importMembers: { group: 'definitions', menus: ['parking/excel-import'], related: ['members', 'cards'] },
  memberReports: { group: 'reports', menus: ['parking/member-report', 'parking/active-member-report', 'parking/inactive-member-report'], related: ['members', 'concepts'] },
  trafficReports: { group: 'reports', menus: ['parking/traffic-reports-list', 'parking/door-traffic-reports', 'parking/average-parking-time'], related: ['history', 'concepts'] },
  financialReports: { group: 'reports', menus: ['parking/parking-income', 'parking/monthly-parking-income', 'parking/member-cash', 'parking/user-performance', 'parking/membership-income'], related: ['payment', 'members'] },
  managementReports: { group: 'reports', menus: ['parking/management-monthly-income-comparison', 'parking/management-income-comparison', 'parking/management-yearly-income-comparison', 'parking/management-user-performance', 'parking/management-free-parking-income'], related: ['financialReports', 'concepts'] },
  cargoReport: { group: 'reports', menus: ['parking/cargo-details'], related: ['cargo', 'history'] },
  cargo: { group: 'operations', menus: ['parking/manual-traffic', 'parking/traffic-records'], related: ['traffic', 'cargoReport'] },
  concepts: { group: 'start', menus: [], related: ['home', 'problems'], public: true },
  problems: { group: 'start', menus: [], related: ['traffic', 'payment', 'equipment'], public: true },
  unavailable: { group: 'start', menus: ['parking/ets-import', 'parking/member-register-history'], related: ['home', 'members'] },
};

export function getHelpMenuKey(path: string): string {
  return path.split(/[?#]/)[0].replace(/^\/home\/?/, '').replace(/\/+$/, '');
}

export function getAvailableHelpTopics(menuKeys: readonly string[]): HelpTopicId[] {
  const allowed = new Set(menuKeys);
  return helpTopicIds.filter(id => helpCatalog[id].public || helpCatalog[id].menus.some(menu => allowed.has(menu)));
}

export function getContextHelpTopic(path: string, available: readonly HelpTopicId[]): HelpTopicId | null {
  const menu = getHelpMenuKey(path);
  if (!menu) return 'home';
  // Specific form articles precede supporting topics such as payment and cargo.
  return available.find(id => id !== 'payment' && id !== 'cargo' && helpCatalog[id].menus.includes(menu)) ?? null;
}
