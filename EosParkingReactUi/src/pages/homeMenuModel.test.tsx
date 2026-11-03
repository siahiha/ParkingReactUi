import { describe, expect, it } from 'vitest';
import { createManagementItems, createParkingMenuGroups } from './homeMenuModel';

describe('home menu model', () => {
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
