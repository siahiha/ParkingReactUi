import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

async function setup(page: Page, canSearch = true) {
  await page.addInitScript(({ canSearch }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7,
      permissions: [], permissionPart1: ((1n << 42n) | (canSearch ? 1n << 46n : 0n)).toString(), canManageDashboard: false } }));
    localStorage.setItem('locale', 'fa');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  }, { canSearch });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  const state = { open: false, doorTypeMissing: false, authorizationType: undefined as number | undefined, lookups: 0, historyReads: 0, registrations: 0 };
  const doors = ['ورودی', 'خروجی', 'دوطرفه', 'داخلی'].map((name, type) => ({ Id: type + 8, Title: `درب ${name}`, DoorType: type }));
  const record = { DumpId: 42, CarPlate: '12ب34567', EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: null };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = doors;
    if (url.pathname.endsWith('/GetParkingDoor')) {
      const door = doors.find(item => item.Id === Number(url.searchParams.get('doorId')))!;
      value = state.doorTypeMissing ? { Id: door.Id, Title: door.Title } : { ...door, EntryAuthorizaitionType: state.authorizationType };
    }
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      state.lookups++;
      value = { ...record, DumpId: state.open ? 42 : 0, EnterDateTime: state.open ? record.EnterDateTime : null,
        Plate: record.CarPlate, CardNumber: '1234', CardId: 12, CarId: 10, MemberId: 0, MemberTariffId: 13 };
    }
    if (url.pathname.endsWith('/GetAllTraffics')) { state.historyReads++; value = { Items: [record], TotalCount: 1 }; }
    if (url.pathname.endsWith('/CreateEnterDump') || url.pathname.endsWith('/DoExitDump')) state.registrations++;
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(page.getByRole('textbox', { name: 'شماره کارت', exact: true })).toBeVisible();
  return state;
}

async function identify(page: Page) {
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await card.fill('1234');
  await card.press('Tab');
  await expect(page.getByRole('button', { name: fa.trafficIdentity.details, exact: true })).toBeVisible();
  await expect(card).toBeEnabled();
}

test('uses the door and current entry to show and enable the four actions', async ({ page }) => {
  const state = await setup(page);
  const actions = page.locator('.traffic-operation-actions');
  for (const type of [0, 1, 2, 3]) {
    await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
    await page.getByRole('option', { name: ['درب ورودی', 'درب خروجی', 'درب دوطرفه', 'درب داخلی'][type], exact: true }).click();
    await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorTypes[type]);
    for (const open of [false, true]) {
      state.open = open;
      await identify(page);
      const enter = actions.getByRole('button', { name: fa.trafficOperation.enter, exact: true });
      const exit = actions.getByRole('button', { name: fa.trafficOperation.exit, exact: true });
      const search = actions.getByRole('button', { name: fa.trafficOperation.search, exact: true });
      if ([0, 2].includes(type)) {
        if (open) await expect(enter).toBeDisabled(); else await expect(enter).toBeEnabled();
      } else await expect(enter).toHaveCount(0);
      if ([1, 2].includes(type)) {
        if (open) await expect(exit).toBeEnabled(); else await expect(exit).toBeDisabled();
      } else await expect(exit).toHaveCount(0);
      if (type === 0 || !open) await expect(search).toBeEnabled(); else await expect(search).toHaveCount(0);
      const focusedAction = open && (type === 1 || type === 2) ? exit
        : !open && (type === 0 || type === 2) ? enter
          : type === 0 || !open ? search : actions.getByRole('button', { name: fa.trafficOperation.cancel, exact: true });
      await expect(focusedAction).toBeFocused();
      expect(state.registrations).toBe(0);
      await expect(actions.getByRole('button', { name: fa.trafficIdentity.refreshIdentity, exact: true })).toHaveCount(0);
      await actions.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'شماره کارت', exact: true })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true })).toBeFocused();
      await expect(search).toHaveCount(0);
    }
  }
});

for (const width of [1440, 390]) {
  test(`keeps all four actions on one row and returns from traffic history at width ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const state = await setup(page);
    await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
    await page.getByRole('option', { name: 'درب دوطرفه', exact: true }).click();
    await identify(page);
    const actions = page.locator('.traffic-operation-actions');
    await expect(actions.getByRole('button')).toHaveText(['ورود', 'خروج', 'جستجو', 'لغو']);
    const actionsBounds = (await actions.boundingBox())!;
    const informationBounds = (await page.locator('.traffic-operation-information').boundingBox())!;
    expect(actionsBounds.y + actionsBounds.height).toBeLessThanOrEqual(informationBounds.y);
    const bounds = await actions.getByRole('button').evaluateAll(buttons => buttons.map(button => { const box = button.getBoundingClientRect(); return { y: box.y, height: box.height, clipped: button.scrollWidth > button.clientWidth }; }));
    expect(bounds.every(box => box.y === bounds[0].y && box.height === bounds[0].height && !box.clipped)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('traffic-four-actions.png'), fullPage: true, animations: 'disabled' });
    await actions.screenshot({ path: testInfo.outputPath('traffic-actions-detail.png'), animations: 'disabled' });
    await actions.getByRole('button', { name: 'جستجو', exact: true }).click();
    const history = page.getByRole('dialog', { name: fa.homeMenu.items['traffic-records'], exact: true });
    await expect(history).toBeVisible();
    await expect.poll(() => state.historyReads).toBeGreaterThan(0);
    await expect(history.getByRole('textbox', { name: 'شماره کارت', exact: true })).toHaveValue('1234');
    await expect(history.locator('tbody tr')).toHaveCount(1);
    state.open = true;
    const before = state.lookups;
    await history.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
    await expect(history).toHaveCount(0);
    await expect.poll(() => state.lookups).toBeGreaterThan(before);
    await expect(actions.getByRole('button', { name: 'خروج', exact: true })).toBeEnabled();
    await expect(actions.getByRole('button', { name: 'ورود', exact: true })).toBeDisabled();
    await expect(actions.getByRole('button', { name: 'جستجو', exact: true })).toHaveCount(0);
  });
}

test('does not open traffic history without its existing permission', async ({ page }) => {
  const state = await setup(page, false);
  await identify(page);
  await expect(page.locator('.traffic-operation-actions').getByRole('button', { name: 'جستجو', exact: true })).toBeDisabled();
  expect(state.historyReads).toBe(0);
});

test('does not allow registration when door type is missing', async ({ page }) => {
  const state = await setup(page);
  state.doorTypeMissing = true;
  await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
  await page.getByRole('option', { name: 'درب خروجی', exact: true }).click();
  await identify(page);
  await expect(page.getByText(fa.trafficIdentity.doorError, { exact: true })).toBeVisible();
  await expect(page.locator('.traffic-operation-actions').getByRole('button')).toHaveText(['لغو']);
  await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorUnknown);
});

test('requires the complementary card or plate, navigates backwards and keeps identification separate from registration', async ({ page }) => {
  const state = await setup(page);
  state.authorizationType = 3;
  await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
  await page.getByRole('option', { name: 'درب دوطرفه', exact: true }).click();
  await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorTypes[2]);
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  const member = page.getByRole('textbox', { name: 'کد عضو', exact: true });
  const first = page.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true });
  const letter = page.getByRole('combobox', { name: 'پلاک - حرف پلاک', exact: true });
  const middle = page.getByRole('textbox', { name: 'پلاک - سه رقم میانی', exact: true });
  const region = page.getByRole('textbox', { name: 'پلاک - کد منطقه', exact: true });
  const actions = page.locator('.traffic-operation-actions');
  const enter = actions.getByRole('button', { name: fa.trafficOperation.enter, exact: true });
  const cancel = actions.getByRole('button', { name: fa.trafficOperation.cancel, exact: true });
  const fillPlate = async () => {
    await first.fill('12');
    await expect(letter).toBeFocused();
    await letter.fill('ب');
    await page.getByRole('option', { name: 'ب', exact: true }).click();
    await expect(middle).toBeFocused();
    await middle.fill('345');
    await expect(region).toBeFocused();
    await region.fill('67');
  };
  await region.focus();
  await region.press('Tab');
  await expect(card).toBeFocused();
  await card.press('Tab');
  await expect(member).toBeFocused();
  await member.press('Shift+Tab');
  await expect(card).toBeFocused();
  expect(state.lookups).toBe(0);
  await card.fill('1234');
  await card.press('Enter');
  await expect(first).toBeFocused();
  expect(state.lookups).toBe(0);
  await fillPlate();
  await expect(enter).toBeFocused();
  expect(state.lookups).toBe(1);
  await enter.press('Tab');
  await expect(actions.getByRole('button', { name: fa.trafficOperation.search, exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(enter).toBeFocused();
  await enter.press('Shift+Tab');
  await expect(member).toBeFocused();
  await member.press('Shift+Tab');
  await expect(card).toBeFocused();
  await card.press('Shift+Tab');
  await expect(region).toBeFocused();
  expect(state.lookups).toBe(1);
  await cancel.click();
  await fillPlate();
  await expect(card).toBeFocused();
  expect(state.lookups).toBe(1);
  await card.fill('1234');
  await card.press('Enter');
  await expect(enter).toBeFocused();
  expect(state.lookups).toBe(2);
  await cancel.click();
  await member.fill('76101');
  await member.press('Enter');
  await expect(enter).toBeFocused();
  expect(state.lookups).toBe(3);
  expect(state.registrations).toBe(0);
});
