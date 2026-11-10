import { expect, test } from '@playwright/test';
import fa from '../../src/locales/fa';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short-desktop', width: 1024, height: 600 },
]) {
test(`keeps both lower grids and usable side controls on ${viewport.name}`, async ({ page }, testInfo) => {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: {
      id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true,
    } }));
    localStorage.setItem('locale', 'fa');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  const row = {
    DumpId: 42, CarId: 10, CarPlate: '12ب34567', CardNumber: '1234', CardId: 12,
    MemberId: 11, MemberCode: '76101', MemberFullName: 'علی رضایی', MemberNationalCode: '1234567890',
    MemberTariffId: 13, EnterDateTime: '2026-11-10T08:00:00',
    ExitDateTime: null, PayType: 0, CommonCost: 5000,
  };
  let lookups = 0;
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = {
      Id: 8, Title: 'درب اصلی',
      EnteranceCamera: { Id: 17, DeviceName: 'ورودی شمال', Disabled: true },
      ExitCamera: { Id: 18, DeviceName: 'خروجی شمال', Disabled: true },
    };
    if (url.pathname.endsWith('/GetTraffics')) value = [row, {
      ...row, DumpId: 43, CarPlate: '22ب45678', ExitDateTime: '2026-11-10T10:00:00',
    }];
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      lookups++;
      value = { ...row, Plate: row.CarPlate, DumpId: 0, EnterDateTime: null,
        MemberCars: [{ Id: 10, Plate: row.CarPlate, Name: 'پژو', CarType: 0 }],
      };
    }
    if (url.pathname.endsWith('/GetMemberCurrentCreditInfo')) value = Array.from({ length: 4 }, (_, index) => ({
      MemberRegisterId: index + 1, Title: `اشتراک ${index + 1}`, CashAmount: 9000,
      RegisterStartDateTime: '2026-01-01', RegisterEndDateTime: '2027-01-01',
      IsActive: index === 0, MembershipCreditType: 0,
    }));
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');

  const consolePanel = page.locator('.traffic-control-console');
  const cameraColumn = page.locator('.traffic-control-camera-column');
  const grids = page.locator('.traffic-split-grids');
  const entries = page.getByRole('region', { name: new RegExp(`^${fa.trafficGrid.entries}`) });
  const exits = page.getByRole('region', { name: new RegExp(`^${fa.trafficGrid.exits}`) });
  await expect(entries.locator('tbody tr')).toHaveCount(1);
  await expect(exits.locator('tbody tr')).toHaveCount(1);
  await expect(cameraColumn.getByText('دوربین ورودی: ورودی شمال', { exact: true })).toBeVisible();
  await cameraColumn.getByRole('tab', { name: 'خروجی', exact: true }).click();
  await expect(cameraColumn.getByText('دوربین خروجی: خروجی شمال', { exact: true })).toBeVisible();
  await cameraColumn.getByRole('tab', { name: 'ورودی', exact: true }).click();

  const card = consolePanel.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await card.fill('1234');
  await card.press('Enter');
  const register = consolePanel.getByRole('button', { name: 'ثبت ورود', exact: true });
  await expect(register).toBeEnabled();
  const refresh = consolePanel.getByRole('button', { name: fa.trafficIdentity.refreshIdentity, exact: true });
  await expect(refresh).toBeEnabled();
  for (const control of [register, refresh]) {
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeInViewport({ ratio: 1 });
    await control.click({ trial: true });
  }
  const beforeRefresh = lookups;
  await refresh.click();
  await expect.poll(() => lookups).toBeGreaterThan(beforeRefresh);
  await expect(refresh).toBeEnabled();

  const consoleBounds = (await consolePanel.boundingBox())!;
  const cameraBounds = (await cameraColumn.boundingBox())!;
  const topBounds = (await page.locator('.traffic-top-grid').boundingBox())!;
  const gridBounds = (await grids.boundingBox())!;
  const entryBounds = (await entries.boundingBox())!;
  const exitBounds = (await exits.boundingBox())!;
  expect(consoleBounds.x).toBeGreaterThanOrEqual(cameraBounds.x + cameraBounds.width);
  expect(Math.abs(gridBounds.x - topBounds.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(gridBounds.width - topBounds.width)).toBeLessThanOrEqual(1);
  expect(gridBounds.y).toBeGreaterThanOrEqual(topBounds.y + topBounds.height);
  expect(entryBounds.y).toBe(exitBounds.y);
  expect(entryBounds.x).toBeGreaterThan(exitBounds.x);
  expect(gridBounds.height).toBeLessThan(topBounds.height);
  expect(entryBounds.y + entryBounds.height).toBeLessThanOrEqual(viewport.height);

  const actions = page.locator('.traffic-operation-actions');
  if (viewport.height > 720) {
    const actionsBounds = (await actions.boundingBox())!;
    expect(actionsBounds.y + actionsBounds.height).toBeLessThanOrEqual(consoleBounds.y + consoleBounds.height + 1);
    const information = page.locator('.traffic-operation-information');
    await information.evaluate(element => { element.scrollTop = element.scrollHeight; });
    expect(await actions.boundingBox()).toEqual(actionsBounds);
  }
  const clear = actions.getByRole('button', { name: fa.trafficIdentity.clear, exact: true });
  await clear.scrollIntoViewIfNeeded();
  await expect(clear).toBeInViewport({ ratio: 1 });
  await clear.click({ trial: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(`traffic-layout-${viewport.name}.png`), fullPage: true });
  await clear.click();
  await expect(card).toHaveValue('');
  await expect(consolePanel.getByRole('textbox', { name: 'کد عضو', exact: true })).toHaveValue('');
  await expect(consolePanel.getByRole('button', { name: fa.trafficOperation.lookup, exact: true })).toBeDisabled();
  await expect(entries.locator('tbody tr')).toHaveCount(1);
  await expect(exits.locator('tbody tr')).toHaveCount(1);
});
}
