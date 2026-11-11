import { expect, test } from '@playwright/test';

test('entry and exit buttons persist traffic and retain the form on API business errors', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'fa');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  let entered = false;
  let exited = false;
  let failEntry = true;
  let failExit = true;
  const mutations: { path: string; body: Record<string, unknown> }[] = [];
  const row = { DumpId: 42, CarId: 10, CarPlate: '12ب34567', CardNumber: '1234', CardId: 12, MemberCode: '', MemberTariffId: 13, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: null, PayType: 0, CommonCost: 5000, ExitPermission: true };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    let resultType = 1;
    let message = '';
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, Title: 'درب اصلی', DoorType: 2 };
    if (url.pathname.endsWith('/GetTraffics')) value = entered ? [{ ...row, ExitDateTime: exited ? '2026-11-10T10:00:00' : null }] : [];
    if (url.pathname.endsWith('/GetCarTrafficInfo')) value = { ...row, Plate: row.CarPlate, DumpId: entered ? 42 : 0, EnterDateTime: entered ? row.EnterDateTime : null };
    if (url.pathname.endsWith('/CreateEnterDump')) {
      const body = route.request().postDataJSON();
      mutations.push({ path: url.pathname, body });
      if (failEntry) { resultType = 7; message = 'ظرفیت پارکینگ تکمیل است'; }
      else { entered = true; value = { Id: 42, EnterDateTime: row.EnterDateTime }; }
    }
    if (url.pathname.endsWith('/DoExitDump')) {
      const body = route.request().postDataJSON();
      mutations.push({ path: url.pathname, body });
      if (failExit) { resultType = 7; message = 'مجوز خروج صادر نشده است'; }
      else { exited = body.DoSave === true; value = { ...row, ExitDateTime: '2026-11-10T10:00:00' }; }
    }
    return route.fulfill({ json: { ResponseResultType: resultType, Values: value, Message: message } });
  });
  await page.goto('/home/parking/manual-traffic');
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await card.fill('1234');
  await card.press('Tab');
  const enter = page.locator('.traffic-operation-actions').getByRole('button', { name: 'ورود', exact: true });
  await expect(enter).toBeEnabled();
  const dateInputs = page.getByRole('textbox', { name: /^تاریخ و زمان (ورود|خروج)$/ });
  await expect(dateInputs).toHaveCount(0);
  await enter.click();
  await expect(page.getByRole('alert')).toContainText('ظرفیت پارکینگ تکمیل است');
  await expect(card).toHaveValue('1234');
  failEntry = false;
  await enter.click();
  const entries = page.locator('.traffic-split-panel').nth(0);
  const exits = page.locator('.traffic-split-panel').nth(1);
  await expect(entries.locator('tbody tr')).toHaveCount(1);
  await expect(card).toHaveValue('');
  expect(mutations[1].body).toMatchObject({ DoSave: true, SourceType: 2, DoorId: 8, CardId: 12, PersistBy: 7 });
  expect(mutations[1].body).not.toHaveProperty('EnterDateTime');
  await entries.getByRole('button', { name: 'خروج', exact: true }).click();
  const exit = page.locator('.traffic-operation-actions').getByRole('button', { name: 'خروج', exact: true });
  await expect(exit).toBeEnabled();
  await expect(dateInputs).toHaveCount(0);
  await exit.click();
  await expect(page.getByRole('alert')).toContainText('مجوز خروج صادر نشده است');
  await expect(entries.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  failExit = false;
  await exit.click();
  await expect(page.getByRole('dialog', { name: 'صورتحساب خروج' })).toBeVisible();
  await expect(entries.locator('tbody tr')).toHaveCount(0);
  await expect(exits.locator('tbody tr')).toHaveCount(1);
  expect(mutations.at(-1)?.body).toMatchObject({ DoSave: true, Id: 42, ExitDoorId: 8, ExitDateTime: null });
  expect(mutations.at(-1)?.body).not.toHaveProperty('DoorId');
  await page.getByRole('button', { name: 'انصراف', exact: true }).click();
  await expect(exits.locator('tbody tr')).toHaveCount(1);
  const toast = page.locator('.MuiSnackbar-root');
  await expect(toast).toContainText('خروج خودرو ثبت شد.');
  await expect(page.locator('.traffic-control-workspace > .MuiAlert-root')).toHaveCount(0);
  await toast.hover();
  await page.waitForTimeout(3200);
  await expect(toast).toBeVisible();
  await page.mouse.move(0, 400);
  await expect(toast).toBeHidden({ timeout: 4500 });
});
