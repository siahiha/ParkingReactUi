import { expect, test } from '@playwright/test';
import fa from '../../src/locales/fa';

const groups = [
  { key: 'member-reports', items: ['member-report', 'active-member-report', 'inactive-member-report', 'member-register-history'] },
  { key: 'traffic-reports', items: ['traffic-reports-list', 'door-traffic-reports', 'average-parking-time'] },
  { key: 'financial-reports', items: ['parking-income', 'monthly-parking-income', 'member-cash', 'user-performance', 'membership-income'] },
  { key: 'other-reports', items: ['cargo-details'] },
  { key: 'management-reports', items: ['management-monthly-income-comparison', 'management-income-comparison', 'management-yearly-income-comparison', 'management-user-performance', 'management-free-parking-income'] },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], permissionPart1: '18446744073709551615', permissionPart2: '18446744073709551615', canManageDashboard: false } }));
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  await page.route('**/backend/api/**', route => route.fulfill({ json: { ResponseResultType: 1, Values: new URL(route.request().url()).pathname.endsWith('/Parking/Get') ? [{ Id: 7, ParkingName: 'پارکینگ آزمایش' }] : [] } }));
});

for (const group of groups) {
  for (const key of group.items) {
    test(`report menu opens ${key}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${process.env.UI_TEST_BASE_URL ?? ''}/home/parking/floors`);
      const nav = page.locator('aside.home3-navigation');
      await nav.getByRole('button', { name: fa.home.reports, exact: true }).click();
      await nav.locator('.home3-nav-branch').getByText(fa.homeMenu.groups[group.key], { exact: true }).click();
      await nav.locator('.home3-nav-leaf').getByText(fa.homeMenu.items[key], { exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/home/parking/${key}$`));
      await expect(page.locator('.home-workspace .workspace-resource-heading').getByText(fa.homeMenu.items[key], { exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}
