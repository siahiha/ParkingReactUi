import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

type Bill = Record<string, unknown>;
async function setup(page: Page, billOverrides: Bill = {}, config: Bill = {}, devices = false, checkout: { commercial?: boolean; history?: boolean; invalidParkingFlag?: boolean } = {}) {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'fa');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', ...config } }));
  const bill = {
    DumpId: 42, CarId: 10, CarPlate: '12ب34567', CardNumber: '1234', MemberCode: '76101', MemberId: 0,
    CardId: 12, MemberTariffId: 13, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: '2026-11-10T10:00:00',
    PayType: 0, CommonCost: 3000, MemberCost: 7000, TotalCost: 10000, MemberDuration: 60, CommonDuration: 60,
    TaxValue: 300, TarrifTitle: 'تعرفه روزانه', ExitPermission: true, ...billOverrides,
  };
  const state = { commercial: checkout.commercial ?? true, exits: 0, payments: 0, paid: false, receipt: 'receipt-42', paymentType: 1, delayPayment: false, releasePayment: () => {}, lookups: 0 };
  await page.route('**/backend/api/**', async route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    let resultType = 1;
    if (url.pathname.endsWith('/Parking/Get')) value = [
      { Id: 7, ParkingName: 'پارکینگ مرکزی', IsCommercialParking: checkout.invalidParkingFlag ? 'true' : state.commercial },
      { Id: 9, ParkingName: 'پارکینگ دوم', IsCommercialParking: true },
    ];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, DoorType: 2, ...(devices ? { PcPos: { Disabled: false }, HaveLcdPrice: true } : {}) };
    const row = { ...bill, ExitDateTime: state.exits ? bill.ExitDateTime : null, PayType: state.paid ? 1 : bill.PayType };
    if (url.pathname.endsWith('/GetTraffics')) value = [row];
    if (url.pathname.endsWith('/GetAllTraffics')) value = { Items: [row], TotalCount: 1 };
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      state.lookups++;
      value = { ...bill, Plate: bill.CarPlate, CardNumber: url.searchParams.get('memberCard') || '1234', ExitDateTime: null };
    }
    if (url.pathname.endsWith('/DoExitDump')) { state.exits++; state.paid = bill.CommonCost === 0 || bill.PayType === 1; value = bill; }
    if (url.pathname.endsWith('/PayDump')) {
      state.payments++;
      expect(url.searchParams.get('payType')).toBe('1');
      expect(url.searchParams.get('dumpId')).toBe('42');
      expect(state.exits).toBeGreaterThan(0);
      if (state.delayPayment) await new Promise<void>(resolve => { state.releasePayment = resolve; });
      resultType = state.paymentType;
      value = state.receipt;
      if (resultType === 1 && state.receipt.trim()) state.paid = true;
    }
    return route.fulfill({ json: { ResponseResultType: resultType, Values: value } });
  });
  await page.goto(`/home/parking/${checkout.history ? 'traffic-records' : 'manual-traffic'}`);
  return state;
}
const payment = (page: Page) => page.getByRole('dialog', { name: fa.trafficPayment.title, exact: true });
const card = (page: Page) => page.getByRole('textbox', { name: 'شماره کارت', exact: true });
async function exit(page: Page) {
  await card(page).fill('1234');
  await card(page).press('Enter');
  await page.locator('.traffic-operation-actions').getByRole('button', { name: 'خروج', exact: true }).click();
  await page.mouse.move(0, 0);
}

for (const member of [false, true]) test(`non-commercial exit settles immediately without a popup for member=${member}`, async ({ page }) => {
  const state = await setup(page, { MemberCode: member ? '76101' : '' }, {}, false, { commercial: false });
  state.delayPayment = true;
  await exit(page);
  await expect.poll(() => state.payments).toBe(1);
  await expect(payment(page)).toHaveCount(0);
  await expect(card(page)).toBeDisabled();
  await expect(page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation.exit, exact: true })).toBeDisabled();
  expect(state.exits).toBe(1);
  state.releasePayment();
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.exitSettled })).toBeVisible();
  await expect(card(page)).toHaveValue('');
  await expect(card(page)).toBeEnabled();
  await expect(payment(page)).toHaveCount(0);
  await expect(page.locator('.traffic-split-panel').nth(1).locator('tbody tr')).toContainText(fa.trafficGrid.paymentTypes[1]);
  expect(state.payments).toBe(1);
});

for (const history of [false, true]) test(`non-commercial failed settlement keeps exit and retries payment without another exit, history=${history}`, async ({ page }) => {
  const state = await setup(page, {}, {}, false, { commercial: false, history });
  state.receipt = '';
  if (history) {
    await card(page).fill('1234');
    await page.getByRole('button', { name: fa.trafficOperation.lookup, exact: true }).click();
    await page.getByRole('button', { name: fa.trafficWorkspace.calculateExit, exact: true }).click();
    await page.mouse.move(0, 0);
  } else await exit(page);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.autoSettlementFailed })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(1);
  state.receipt = 'receipt-42';
  const grid = history ? page.locator('.traffic-records-grid') : page.locator('.traffic-split-panel').nth(1);
  await grid.locator('tbody tr').click();
  await grid.getByRole('button', { name: fa.trafficGrid.pay, exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.settled })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(2);
  expect(state.paid).toBe(true);
});

test('commercial history exit preserves the bill popup without automatic payment', async ({ page }) => {
  const state = await setup(page, {}, {}, false, { commercial: true, history: true });
  await card(page).fill('1234');
  await page.getByRole('button', { name: fa.trafficOperation.lookup, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficWorkspace.calculateExit, exact: true }).click();
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(0);
});

test('non-commercial history exit also settles without opening the bill', async ({ page }) => {
  const state = await setup(page, {}, {}, false, { commercial: false, history: true });
  await card(page).fill('1234');
  await page.getByRole('button', { name: fa.trafficOperation.lookup, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficWorkspace.calculateExit, exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.exitSettled })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(1);
});

for (const overrides of [{ CommonCost: 0 }, { CommonCost: 0, MemberCode: '' }, { PayType: 1 }]) test(`non-commercial free or already settled exit avoids a duplicate payment ${JSON.stringify(overrides)}`, async ({ page }) => {
  const state = await setup(page, overrides, {}, false, { commercial: false });
  await exit(page);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.exitSettled })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(0);
});

test('uses the selected parking mode after changing from non-commercial to commercial', async ({ page }) => {
  const state = await setup(page, {}, {}, false, { commercial: false });
  await page.getByRole('combobox', { name: fa.home.chooseParking, exact: true }).click();
  await page.getByRole('option', { name: 'پارکینگ دوم', exact: true }).click();
  await exit(page);
  await expect(payment(page)).toBeVisible();
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(0);
});

test('reloads changed commercial settings when returning to traffic in the same session', async ({ page }) => {
  const state = await setup(page);
  await expect(card(page)).toBeVisible();
  await page.getByRole('tab', { name: fa.home.menuHome, exact: true }).click();
  state.commercial = false;
  await page.getByRole('tab', { name: fa.homeMenu.items['manual-traffic'], exact: true }).click();
  await exit(page);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.exitSettled })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.payments).toBe(1);
});

test('does not commit an exit when the parking checkout mode is invalid', async ({ page }) => {
  const state = await setup(page, {}, {}, false, { invalidParkingFlag: true });
  await exit(page);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.parkingSettingsUnavailable })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(0);
  expect(state.payments).toBe(0);
});

test('matches the Windows detail sequence and keeps the modal open on missing receipt or failed payment', async ({ page }, testInfo) => {
  const state = await setup(page, {}, {}, true);
  await exit(page);
  const dialog = payment(page);
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.locator('.traffic-payment-amount')).toHaveText('۳٬۰۰۰');
  await expect(dialog.getByRole('region').locator('> p')).toHaveText(['مجموع حضور:', 'حق عضویت استفاده شده:', 'دریافتی:']);
  await expect(dialog.getByRole('region', { name: fa.trafficPayment.totalStay })).toContainText('۱۰٬۰۰۰');
  await expect(dialog.getByRole('region', { name: fa.trafficPayment.membershipUsed })).toContainText('۷٬۰۰۰');
  await expect(dialog.getByRole('region', { name: fa.trafficPayment.receivable })).toContainText('۳۰۰');
  await expect(dialog.getByText('تعرفه روزانه')).toBeVisible();
  await expect(dialog.getByRole('button', { name: fa.trafficPayment.posPay })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: fa.trafficPayment.showPrice })).toBeDisabled();
  const confirm = dialog.getByRole('button', { name: fa.trafficPayment.confirmPay });
  const close = dialog.getByRole('button', { name: fa.trafficPayment.close, exact: true });
  const pos = dialog.getByRole('button', { name: fa.trafficPayment.posPay });
  const bounds = await Promise.all([confirm, close, pos].map(button => button.boundingBox()));
  expect(bounds[0]!.x).toBeLessThan(bounds[1]!.x);
  expect(bounds[1]!.x).toBeLessThan(bounds[2]!.x);
  expect(bounds[0]!.y).toBe(bounds[2]!.y);
  await page.screenshot({ path: testInfo.outputPath('payment-desktop.png'), animations: 'disabled' });
  state.receipt = '';
  await confirm.click();
  await expect(dialog.getByRole('alert')).toContainText(fa.trafficOperation.paymentFailed);
  await expect(dialog).toBeVisible();
  state.paymentType = 7;
  await confirm.click();
  await expect.poll(() => state.payments).toBe(2);
  await expect(confirm).toBeEnabled();
  state.paymentType = 1; state.receipt = 'receipt-42'; state.delayPayment = true;
  await confirm.click();
  await expect.poll(() => state.payments).toBe(3);
  await expect(close).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  state.releasePayment();
  await expect(dialog).toHaveCount(0);
  expect(state.exits).toBe(1);
});

test('free member bill is modeless, preserves its snapshot, and times out without paying or stealing focus', async ({ page }) => {
  const state = await setup(page, { CommonCost: 0, CommonDuration: 0, TotalCost: 7000 });
  await page.clock.install();
  await exit(page);
  const dialog = payment(page);
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByRole('button', { name: fa.popup.confirm, exact: true })).toBeEnabled();
  await expect(dialog.getByRole('timer')).toContainText('۵');
  await card(page).fill('5678');
  await card(page).press('Enter');
  await expect.poll(() => state.lookups).toBe(2);
  const activeExit = page.locator('.traffic-operation-actions').getByRole('button', { name: 'خروج', exact: true });
  await expect(activeExit).toBeEnabled();
  // A second payment request activates the existing form instead of registering another exit.
  await activeExit.click();
  await expect(dialog).toBeFocused();
  expect(state.exits).toBe(1);
  await card(page).focus();
  await page.mouse.move(0, 0);
  await page.clock.runFor(4000);
  await expect(dialog).toBeVisible();
  await page.clock.runFor(1000);
  await expect(dialog).toHaveCount(0);
  await expect(card(page)).toHaveValue('5678');
  await expect(card(page)).toBeFocused();
  expect(state.payments).toBe(0);
});

test('hover permanently stops a free bill timer', async ({ page }) => {
  const state = await setup(page, { CommonCost: 0 });
  await page.clock.install();
  await exit(page);
  await payment(page).hover();
  await page.mouse.move(0, 0);
  await page.clock.runFor(30000);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toHaveCount(0);
  expect(state.payments).toBe(0);
});

test('a free member bill keeps the five-second rule even with stale runtime settings', async ({ page }) => {
  await setup(page, { CommonCost: 0 }, { trafficExitMode: 1, trafficPaymentTimeoutSeconds: 15 });
  await page.clock.install();
  await exit(page);
  await expect(payment(page).getByRole('timer')).toContainText('۵');
  await page.clock.runFor(4000);
  await expect(payment(page)).toBeVisible();
  await page.clock.runFor(1000);
  await expect(payment(page)).toHaveCount(0);
});

test('a non-member bill opens for twenty seconds and times out without settling, while grid payment has no timer', async ({ page }) => {
  const state = await setup(page, { CardNumber: '', MemberCode: '' });
  await page.clock.install();
  await exit(page);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toContainText('۲۰');
  await page.clock.runFor(19000);
  await expect(payment(page)).toBeVisible();
  await page.clock.runFor(1000);
  await expect(payment(page)).toHaveCount(0);
  expect(state.payments).toBe(0);
  const exits = page.locator('.traffic-split-panel').nth(1);
  await exits.locator('tbody tr').click();
  await exits.getByRole('button', { name: fa.trafficGrid.pay, exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toHaveCount(0);
  await page.clock.runFor(30000);
  await expect(payment(page)).toBeVisible();
  expect(state.payments).toBe(0);
});

test('pointer interaction cancels a non-member timer until the operator completes payment', async ({ page }) => {
  const state = await setup(page, { MemberCode: '' }, { trafficPaymentHideNonMembers: true, trafficPaymentTimeoutSeconds: 15 });
  await page.clock.install();
  await exit(page);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toContainText('۲۰');
  await page.clock.runFor(10000);
  await payment(page).dispatchEvent('pointerdown', { pointerType: 'touch' });
  await page.mouse.move(0, 0);
  await page.clock.runFor(30000);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(0);
  await payment(page).getByRole('button', { name: fa.trafficPayment.confirmPay }).click();
  await expect(payment(page)).toHaveCount(0);
  expect(state.payments).toBe(1);
});

test('a malformed amount cannot become a free popup or payment', async ({ page }) => {
  const state = await setup(page, { CommonCost: null });
  await exit(page);
  await expect(page.getByRole('alert').filter({ hasText: fa.trafficPayment.invalidBill })).toBeVisible();
  await expect(payment(page)).toHaveCount(0);
  expect(state.exits).toBe(1);
  expect(state.payments).toBe(0);
});

test('keeps the amount and action row accessible on a narrow short viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await setup(page, {}, {}, true);
  await exit(page);
  await expect(payment(page)).toBeVisible();
  const dialog = payment(page);
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await expect(dialog.locator('.traffic-payment-amount')).toBeInViewport();
  await expect(dialog.getByRole('button', { name: fa.trafficPayment.confirmPay })).toBeInViewport();
  await expect(dialog.getByRole('button', { name: fa.trafficPayment.posPay })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('payment-mobile.png'), animations: 'disabled' });
});

test('keeps the modeless free bill readable in the dark theme', async ({ page }, testInfo) => {
  await setup(page, { CommonCost: 0, CommonDuration: 0, TotalCost: 7000 });
  await page.getByRole('button', { name: 'حالت شب', exact: true }).click();
  await exit(page);
  await expect(payment(page)).toBeVisible();
  await payment(page).hover();
  await expect(payment(page).locator('.traffic-payment-amount')).toHaveText('۰');
  await expect(payment(page).getByRole('button', { name: fa.popup.confirm, exact: true })).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('payment-dark.png'), animations: 'disabled' });
});

test('a member with an amount gets twenty seconds before dismissal without payment', async ({ page }) => {
  const state = await setup(page);
  await page.clock.install();
  await exit(page);
  await expect(payment(page).getByRole('timer')).toContainText('۲۰');
  await page.clock.runFor(19000);
  await expect(payment(page)).toBeVisible();
  await page.clock.runFor(1000);
  await expect(payment(page)).toHaveCount(0);
  expect(state.payments).toBe(0);
});

test('a free member can stop the timer and explicitly confirm without a payment request', async ({ page }) => {
  const state = await setup(page, { CommonCost: 0, CommonDuration: 0, TotalCost: 7000 });
  await page.clock.install();
  await exit(page);
  await payment(page).press('Tab');
  await page.clock.runFor(30000);
  await expect(payment(page)).toBeVisible();
  await expect(payment(page).getByRole('timer')).toHaveCount(0);
  await payment(page).getByRole('button', { name: fa.popup.confirm, exact: true }).click();
  await expect(payment(page)).toHaveCount(0);
  expect(state.payments).toBe(0);
});
