import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

async function setup(page: Page, manager: boolean, enabled = false) {
  await page.addInitScript(({ manager, permissions }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: {
      id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: manager, permissionPart1: permissions,
    } }));
    localStorage.setItem('locale', 'fa');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'false');
  }, { manager, permissions: ((1n << 1n) | (1n << 39n) | (1n << 42n)).toString() });
  const parking = { Id: 7, ParkingName: 'پارکینگ بدون شیفت', HasUserShifts: enabled, Shift1FromTime: '00:00:00', Shift1ToTime: '23:59:00' };
  const second = { ...parking, Id: 9, ParkingName: 'پارکینگ دارای شیفت', HasUserShifts: true };
  let shiftRequests = 0;
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  // Cover the compile-time fallback too, so a bootstrap timeout cannot contact a real API.
  await page.route(/(?:\/backend\/api\/|localhost:3001\/api\/)/, async route => {
    const url = new URL(route.request().url());
    if (/UserWorkShifts/i.test(url.pathname)) shiftRequests++;
    if (url.pathname.endsWith('/Parking/Save')) {
      Object.assign(parking, route.request().postDataJSON());
      return route.fulfill({ json: { ResponseResultType: 1, Values: parking.Id } });
    }
    const values = url.pathname.endsWith('/Parking/Get')
      ? url.searchParams.has('id') ? (url.searchParams.get('id') === '9' ? second : parking) : [parking, second]
      : [];
    await route.fulfill({ json: { ResponseResultType: 1, Values: values } });
  });
  return { shiftRequests: () => shiftRequests };
}

async function openOperations(page: Page) {
  const nav = page.locator('.home3-navigation');
  const root = nav.getByRole('button', { name: fa.home.parkingDefinitions, exact: true });
  if (await root.getAttribute('aria-expanded') !== 'true') await root.click();
  const operations = nav.getByRole('button', { name: fa.homeMenu.groups.operations, exact: true });
  if (await operations.getAttribute('aria-expanded') !== 'true') await operations.click();
  return nav;
}

for (const manager of [true, false]) test(`disables shift menu and direct route per parking, manager=${manager}`, async ({ page }) => {
  const state = await setup(page, manager);
  await page.goto('/home/parking/parking-details');
  await expect(page.getByRole('textbox', { name: fa.parkingForm.name, exact: true })).toHaveValue('پارکینگ بدون شیفت');
  let nav = await openOperations(page);
  await expect(nav.getByRole('button', { name: fa.homeMenu.items.shifts, exact: true })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: fa.homeMenu.items['manual-traffic'], exact: true })).toBeVisible();
  await page.goto('/home/parking/shifts');
  await expect(page.getByRole('alert').filter({ hasText: fa.home.accessDeniedTitle })).toBeVisible();
  expect(state.shiftRequests()).toBe(0);
  await page.getByRole('combobox', { name: fa.home.chooseParking, exact: true }).click();
  await page.getByRole('option', { name: 'پارکینگ دارای شیفت', exact: true }).click();
  nav = await openOperations(page);
  await expect(nav.getByRole('button', { name: fa.homeMenu.items.shifts, exact: true })).toBeVisible();
});

test('hides the assignment menu immediately after saving user shifts off', async ({ page }) => {
  await setup(page, true, true);
  await page.goto('/home/parking/parking-details');
  await expect(page.getByRole('textbox', { name: fa.parkingForm.name, exact: true })).toBeVisible();
  let nav = await openOperations(page);
  await expect(nav.getByRole('button', { name: fa.homeMenu.items.shifts, exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: fa.parkingForm.userShifts, exact: true }).uncheck();
  await page.getByRole('button', { name: fa.parkingForm.save, exact: true }).click();
  await expect(page.getByRole('checkbox', { name: fa.parkingForm.userShifts, exact: true })).not.toBeChecked();
  nav = await openOperations(page);
  await expect(nav.getByRole('button', { name: fa.homeMenu.items.shifts, exact: true })).toHaveCount(0);
});
