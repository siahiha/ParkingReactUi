import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

const plate = '12ب34567';
const scan = (value: string) => {
  const sum = [...value.replace(/#/g, '')].reduce((total, digit) => total + Number(digit), 0) % 9;
  const reversed = [...value].reverse().join('');
  return `!@^${reversed.slice(0, 3)}${sum}${reversed.slice(3)}!@^`;
};
const cardField = (page: Page) => page.getByRole('textbox', { name: fa.trafficWorkspace.card, exact: true });
const firstPlateField = (page: Page) => page.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true });
const action = (page: Page, direction: 'enter' | 'exit') => page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation[direction], exact: true });

async function setup(page: Page, authorizationType: number, open = false) {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'fa');
  });
  const state = { lookups: [] as URL[], bills: 0, mutations: [] as Record<string, unknown>[], responsePlate: undefined as string | undefined, responseCard: undefined as string | undefined };
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ', IsCommercialParking: true }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, DoorType: 2, EntryAuthorizaitionType: authorizationType };
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      state.lookups.push(url);
      value = { DumpId: open ? 42 : 0, EnterDateTime: open ? '2026-11-13T08:00:00' : null, ExitDateTime: null,
        Plate: state.responsePlate ?? url.searchParams.get('plate'), CardNumber: state.responseCard ?? url.searchParams.get('memberCard'),
        CarId: 10, CardId: 12, MemberId: 0, MemberTariffId: 13 };
    }
    if (url.pathname.endsWith('/GetTrafficBill')) { state.bills++; value = { DumpId: 42, PayType: 0, CarPlate: plate }; }
    if (url.pathname.endsWith('/CreateEnterDump')) { state.mutations.push(route.request().postDataJSON()); value = { Id: 42 }; }
    if (url.pathname.endsWith('/DoExitDump')) {
      state.mutations.push(route.request().postDataJSON());
      value = { DumpId: 42, ExitDateTime: '2026-11-13T10:00:00', CommonCost: 0, PayType: 0 };
    }
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(cardField(page)).toBeEnabled();
  return state;
}

async function fillPlate(page: Page) {
  await firstPlateField(page).fill('12');
  await page.getByRole('combobox', { name: 'پلاک - حرف پلاک', exact: true }).fill('ب');
  await page.getByRole('option', { name: 'ب', exact: true }).click();
  await page.getByRole('textbox', { name: 'پلاک - سه رقم میانی', exact: true }).fill('345');
  await page.getByRole('textbox', { name: 'پلاک - کد منطقه', exact: true }).fill('67');
}

for (const first of ['card', 'plate'] as const) {
  test(`card and plate waits for both, with ${first} entered first`, async ({ page }) => {
    const state = await setup(page, 3);
    if (first === 'card') {
      await cardField(page).fill('1234');
      await cardField(page).press('Enter');
      await expect(firstPlateField(page)).toBeFocused();
      expect(state.lookups).toHaveLength(0);
      await fillPlate(page);
    } else {
      await fillPlate(page);
      await expect(cardField(page)).toBeFocused();
      expect(state.lookups).toHaveLength(0);
      await cardField(page).fill('1234');
      await cardField(page).press('Enter');
    }
    await expect(action(page, 'enter')).toBeFocused();
    expect(state.lookups).toHaveLength(1);
    await action(page, 'enter').click();
    await expect.poll(() => state.mutations.length).toBe(1);
  });
}

for (const source of ['card', 'plate'] as const) {
  for (const open of [false, true]) {
    test(`card or plate accepts only ${source} for ${open ? 'exit' : 'entry'}`, async ({ page }) => {
      const state = await setup(page, 4, open);
      if (source === 'card') { await cardField(page).fill('1234'); await cardField(page).press('Enter'); }
      else await fillPlate(page);
      const direction = open ? 'exit' : 'enter';
      await expect(action(page, direction)).toBeEnabled();
      expect(state.lookups).toHaveLength(1);
      await action(page, direction).click();
      await expect.poll(() => state.mutations.length).toBe(1);
      expect(state.mutations[0].CarPlate).toBe(source === 'card' ? '' : plate);
    });
  }
}

for (const open of [false, true]) {
  for (const missing of ['card', 'plate'] as const) {
    test(`rechecks missing ${missing} immediately before ${open ? 'exit' : 'entry'}`, async ({ page }) => {
      const state = await setup(page, 3, open);
      if (missing === 'card') state.responseCard = ''; else state.responsePlate = '';
      await cardField(page).fill('1234');
      await cardField(page).press('Enter');
      await fillPlate(page);
      const direction = open ? 'exit' : 'enter';
      await expect(action(page, direction)).toBeEnabled();
      await action(page, direction).click();
      await expect(page.getByRole('alert')).toContainText(missing === 'card' ? fa.trafficIdentity.cardRequired : fa.trafficIdentity.plateRequired);
      await expect(missing === 'card' ? cardField(page) : firstPlateField(page)).toBeFocused();
      expect(state.mutations).toHaveLength(0);
    });
  }
}

for (const authorizationType of [5, 6]) {
  test(`method ${authorizationType} analyzes a complete Windows QR without Enter and retains it for exit`, async ({ page }) => {
    const state = await setup(page, authorizationType, true);
    await cardField(page).fill(scan('42#120134567#76101#1234'));
    await expect(action(page, 'exit')).toBeFocused();
    await expect(cardField(page)).toHaveValue('1234');
    await expect(firstPlateField(page)).toHaveValue('۱۲');
    expect(state.bills).toBe(1);
    expect(state.lookups).toHaveLength(1);
    expect(state.lookups[0].searchParams.get('memberCard')).toBe('1234');
    expect(state.lookups[0].searchParams.get('plate')).toBe(plate);
    await action(page, 'exit').click();
    await expect.poll(() => state.mutations.length).toBe(1);
    await expect(cardField(page)).toHaveValue('');
    await cardField(page).fill('1234');
    await cardField(page).press('Enter');
    await expect(cardField(page)).toBeFocused();
    expect(state.lookups).toHaveLength(1);
  });
}

test('does not identify by member code when card and plate are missing', async ({ page }) => {
  const state = await setup(page, 3);
  const member = page.getByRole('textbox', { name: fa.trafficWorkspace.memberCode, exact: true });
  await member.fill('76101');
  await member.press('Enter');
  await expect(cardField(page)).toBeFocused();
  expect(state.lookups).toHaveLength(0);
});

test('rejects corrupt QR before making any identification or bill request', async ({ page }) => {
  const state = await setup(page, 5);
  await cardField(page).fill('!@^broken!@^');
  await cardField(page).press('Enter');
  await expect(page.getByRole('alert')).toContainText(fa.trafficIdentity.invalidQr);
  expect(state.bills).toBe(0);
  expect(state.lookups).toHaveLength(0);
});

for (const open of [false, true]) {
  test(`card and picture blocks ${open ? 'exit' : 'entry'} without an operation image`, async ({ page }) => {
    const state = await setup(page, 1, open);
    await cardField(page).fill('1234');
    await cardField(page).press('Enter');
    const direction = open ? 'exit' : 'enter';
    await expect(action(page, direction)).toBeEnabled();
    await action(page, direction).click();
    await expect(page.getByRole('alert')).toContainText(fa.trafficIdentity.trafficImageRequired);
    expect(state.mutations).toHaveLength(0);
  });
}
