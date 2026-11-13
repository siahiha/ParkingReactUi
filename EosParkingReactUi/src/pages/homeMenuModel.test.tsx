import { describe, expect, it } from 'vitest';
import { createManagementItems, createParkingMenuGroups, flattenParkingMenuItems, visibleParkingGroups } from './homeMenuModel';

describe('home menu model', () => {
  it.each([false, true])('limits parking income reports to commercial parkings, manager=%s', canManageDashboard => {
    const user = { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard };
    const groups = createParkingMenuGroups('fa');
    const keys = (commercial?: boolean, permission = true) => flattenParkingMenuItems(visibleParkingGroups(user, groups, () => permission, () => permission, false, commercial)).map(item => item.key);
    const incomeReports = ['parking-income', 'monthly-parking-income', 'management-monthly-income-comparison', 'management-income-comparison', 'management-yearly-income-comparison', 'management-free-parking-income'];
    for (const key of incomeReports) {
      expect(keys(false)).not.toContain(key);
      expect(keys(undefined)).not.toContain(key);
      expect(keys(true)).toContain(key);
      if (!canManageDashboard) expect(keys(true, false)).not.toContain(key);
    }
    for (const key of ['traffic-reports-list', 'membership-income', 'member-cash', 'user-performance']) expect(keys(false)).toContain(key);
    expect(flattenParkingMenuItems(groups).map(item => item.key)).toEqual(expect.arrayContaining(incomeReports));
  });
  it.each([false, true])('hides shift assignment when disabled, including dashboard managers=%s', canManageDashboard => {
    const user = { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard };
    const keys = (enabled: boolean, permission = true) => flattenParkingMenuItems(visibleParkingGroups(user, createParkingMenuGroups('fa'), () => permission, () => permission, enabled)).map(item => item.key);
    expect(keys(false)).not.toContain('shifts');
    expect(keys(true)).toContain('shifts');
    expect(keys(false)).toContain('manual-traffic');
    if (!canManageDashboard) expect(keys(true, false)).not.toContain('shifts');
  });
  it('does not expose general reports under system management', () => {
    const items = createManagementItems('fa');

    expect(items.map((item) => item.key)).toEqual(['list', 'users', 'access', 'exit']);
    expect(items.map((item) => String(item.key))).not.toContain('reports');
  });

  it('keeps management reports in the dedicated reports menu', () => {
    const reportsGroup = createParkingMenuGroups('fa').find((group) => group.key === 'reports');

    expect(reportsGroup?.subgroups?.some((group) => group.key === 'management-reports')).toBe(true);
  });

  it('does not expose vehicle traffic control in parking definitions', () => {
    const definitionsGroup = createParkingMenuGroups('fa').find((group) => group.key === 'definitions');

    expect(definitionsGroup?.items.map((item) => item.key)).not.toContain('traffic-control-list');
  });
});
