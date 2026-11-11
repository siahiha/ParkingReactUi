import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
const cars = [
  { Id: 10, Plate: '12ب34567', Name: 'پژو', CarType: 0, DtoViewCarColorTitle: 'سفید', DtoViewCarModelTitle: '۱۴۰۰' },
  { Id: 20, Plate: '22ب45678', Name: 'سمند', CarType: 0, DtoViewCarColorTitle: 'آبی', DtoViewCarModelTitle: '۱۴۰۲' },
];
function qrCode(value: string) {
  const checksum = [...value.replace(/#/g, '')].reduce((sum, digit) => sum + Number(digit), 0) % 9;
  const reversed = [...value].reverse().join('');
  return `!@^${reversed.slice(0, 3)}${checksum}${reversed.slice(3)}!@^`;
}
async function setup(page: Page, canEdit = true) {
  await page.addInitScript(({ canEdit }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7,
      permissions: [], permissionPart1: ((1n << 42n) | (1n << 46n) | (canEdit ? 1n << 43n : 0n)).toString(), canManageDashboard: false } }));
    localStorage.setItem('locale', 'fa');
  }, { canEdit });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', trafficRequireExitPermission: true } }));
  const state = { control: 0, action: 0, inactive: false, approved: true, open: false, added: false, edited: '', lookups: 0,
    photo: png as string | null, entranceImage: png as string | null, mutations: [] as { path: string; payload: Record<string, unknown> }[] };
  await page.route('**/backend/api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    let value: unknown = [];
    const allCars = state.added ? [...cars, { ...cars[0], Id: 30, Plate: '33ب56789', Name: 'دنا' }] : cars;
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, Title: 'درب اصلی', DoorType: 2 };
    if (url.pathname.endsWith('/GetTrafficBill')) value = { DumpId: 42, ParkingId: 8, PayType: 0, CarPlate: cars[0].Plate };
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      state.lookups++;
      const plate = url.searchParams.get('plate') || (state.open ? cars[0].Plate : '');
      const car = allCars.find(item => item.Plate === plate);
      value = { DumpId: state.open ? 42 : 0, EnterDateTime: state.open ? '2026-11-10T08:00:00' : null, Plate: plate, CarId: car?.Id ?? 0,
        MemberId: 11, MemberCode: '76101', MemberFullName: 'علی رضایی', MemberNationalCode: '1234567890', CardNumber: '1234', CardId: 12,
        MemberTariffId: 13, CarName: state.edited || car?.Name, CarColor: car?.DtoViewCarColorTitle, CarModel: car?.DtoViewCarModelTitle,
        ControlType: state.control, ControlListActionType: state.action, Description: 'پیام کنترل', IsMemberBlock: state.inactive,
        ExitPermission: state.approved, MemberCars: allCars, MemberPersonalPhoto: state.photo, EnteranceImage: state.entranceImage };
    }
    if (url.pathname.endsWith('/GetMemberCurrentCreditInfo')) value = [true, false].map((active, index) => ({
      MemberRegisterId: index + 1, Title: active ? 'اشتراک جاری' : 'اشتراک آینده', CashAmount: active ? 9000 : 12000,
      RegisterStartDateTime: '2026-01-01', RegisterEndDateTime: '2027-01-01', IsActive: active, MembershipCreditType: 0,
    }));
    if (url.pathname.endsWith('/AddMemberCar')) {
      state.mutations.push({ path: url.pathname, payload: Object.fromEntries(url.searchParams) });
      if (url.searchParams.get('plate') === '33ب56789') state.added = true;
      else state.edited = url.searchParams.get('CarName') ?? '';
      value = state.added ? 30 : 10;
    }
    if (url.pathname.endsWith('/CreateEnterDump') || url.pathname.endsWith('/DoExitDump')) {
      state.mutations.push({ path: url.pathname, payload: request.postDataJSON() });
      value = url.pathname.endsWith('/CreateEnterDump') ? { Id: 50, EnterDateTime: '2026-11-10T09:00:00' }
        : { DumpId: 42, CarPlate: cars[0].Plate, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: '2026-11-10T09:00:00', CommonCost: 3000, MemberCost: 7000, TotalCost: 10000 };
    }
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(page.getByRole('textbox', { name: 'شماره کارت', exact: true })).toBeVisible();
  return state;
}
async function lookupCard(page: Page, card = '1234') {
  const field = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await field.fill('');
  await field.fill(card);
  await field.press('Tab');
  await expect(page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true })).toBeVisible();
}

async function closeIdentity(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true })).toHaveCount(0);
}

for (const source of ['plate', 'card', 'member'] as const) {
  test(`automatically opens member details from ${source} and respects dismissal until the next identification`, async ({ page }, testInfo) => {
    if (source === 'card') await page.setViewportSize({ width: 390, height: 844 });
    if (source === 'member') {
      await page.setViewportSize({ width: 1024, height: 600 });
      await page.addInitScript(() => localStorage.setItem('eos-parking-theme', 'dark'));
    }
    const state = await setup(page);
    if (source === 'plate') {
      state.photo = null;
      state.entranceImage = null;
      await page.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true }).fill('12');
      await page.getByRole('combobox', { name: 'پلاک - حرف پلاک', exact: true }).fill('ب');
      await page.getByRole('option', { name: 'ب', exact: true }).click();
      await page.getByRole('textbox', { name: 'پلاک - سه رقم میانی', exact: true }).fill('345');
      await page.getByRole('textbox', { name: 'پلاک - کد منطقه', exact: true }).fill('67');
    } else {
      const field = page.getByRole('textbox', { name: source === 'card' ? 'شماره کارت' : 'کد عضو', exact: true });
      await field.fill(source === 'card' ? '1234' : '76101');
      await field.press('Tab');
    }
    const details = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
    await expect(details).toBeVisible();
    await expect(details.getByText('علی رضایی', { exact: true })).toBeVisible();
    if (source === 'plate') await expect(details.getByText(cars[0].Plate, { exact: true })).toHaveCount(0);
    await expect(details.getByText(fa.trafficIdentity.tariff, { exact: true })).toHaveCount(0);
    await expect(details).toBeInViewport({ ratio: 1 });
    await expect(details.getByRole('button', { name: fa.trafficIdentity.close, exact: true })).toBeInViewport({ ratio: 1 });
    await expect(details.getByRole('button', { name: fa.trafficIdentity.addVehicle, exact: true })).toBeInViewport({ ratio: 1 });
    await details.screenshot({ path: testInfo.outputPath(`traffic-member-card-${source}.png`), animations: 'disabled' });
    expect((await details.locator('.traffic-identity-popover-heading').boundingBox())!.height).toBeLessThanOrEqual(34);
    if (source === 'plate') expect((await details.boundingBox())!.height).toBeLessThan(450);
    await details.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
    await expect(details).toHaveCount(0);
    const lookups = state.lookups;
    await page.getByRole('button', { name: fa.trafficOperation.search, exact: true }).click();
    const history = page.getByRole('dialog', { name: fa.homeMenu.items['traffic-records'], exact: true });
    await expect(history).toBeVisible();
    await history.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
    await expect(history).toHaveCount(0);
    await expect.poll(() => state.lookups).toBeGreaterThan(lookups);
    await expect(page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true })).toBeEnabled();
    await expect(details).toHaveCount(0);
    await page.getByRole('button', { name: fa.trafficIdentity.details, exact: true }).click();
    await expect(details).toBeVisible();
    await closeIdentity(page);
    await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
    await lookupCard(page);
    await expect(details).toBeVisible();
  });
}

test('reveals identity with a short fade and slide, including on reopening, and respects reduced motion', async ({ page }) => {
  const samples: { opacity: number; offset: number; finished: boolean }[] = [];
  await page.exposeFunction('captureIdentityMotion', (sample: typeof samples[number]) => samples.push(sample));
  await page.addInitScript(() => {
    document.addEventListener('animationstart', event => {
      const card = event.target;
      if (!(card instanceof HTMLElement) || !card.matches('.traffic-identity-popover')) return;
      let finished = false;
      card.addEventListener('animationend', () => { finished = true; }, { once: true });
      const sample = () => {
        const style = getComputedStyle(card);
        const offset = Number.parseFloat(style.translate.split(' ')[1] ?? '0');
        void (window as unknown as { captureIdentityMotion: (sample: { opacity: number; offset: number; finished: boolean }) => Promise<void> })
          .captureIdentityMotion({ opacity: Number(style.opacity), offset, finished });
        if ((!finished || Number(style.opacity) < 1) && card.isConnected) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await setup(page);
  await lookupCard(page);
  await expect.poll(() => samples.some(sample => sample.opacity > 0 && sample.opacity < 1 && sample.offset > 0)).toBe(true);
  await expect.poll(() => samples.some(sample => sample.finished && sample.opacity === 1 && sample.offset === 0)).toBe(true);
  await closeIdentity(page);
  samples.length = 0;
  await page.getByRole('button', { name: fa.trafficIdentity.details, exact: true }).click();
  await expect.poll(() => samples.some(sample => sample.offset > 0 && sample.opacity < 1)).toBe(true);
  await expect.poll(() => samples.some(sample => sample.finished)).toBe(true);
  await closeIdentity(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  samples.length = 0;
  await page.getByRole('button', { name: fa.trafficIdentity.details, exact: true }).click();
  const details = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await expect(details).toBeVisible();
  await expect.poll(() => details.evaluate(element => element.contains(document.activeElement))).toBe(true);
  expect(await details.evaluate(element => ({ opacity: getComputedStyle(element).opacity, animations: element.getAnimations().length })))
    .toEqual({ opacity: '1', animations: 0 });
  expect(samples).toHaveLength(0);
  await closeIdentity(page);
});

test('does not automatically open member details for a guest or a failed lookup', async ({ page }) => {
  await setup(page);
  let failLookup = false;
  await page.route('**/api/traffic/GetCarTrafficInfo?**', route => route.fulfill({ json: {
    ResponseResultType: failLookup ? 7 : 1,
    Values: { DumpId: 0, MemberId: 0, Plate: cars[0].Plate, CarId: 10 },
    Message: failLookup ? 'عضو یافت نشد' : '',
  } }));
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  const details = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await card.fill('9999');
  await card.press('Tab');
  await expect(page.getByRole('button', { name: fa.trafficOperation.enter, exact: true })).toBeEnabled();
  await expect(details).toHaveCount(0);
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  failLookup = true;
  await card.fill('0000');
  await card.press('Tab');
  await expect(page.getByRole('alert')).toContainText('عضو یافت نشد');
  await expect(details).toHaveCount(0);
});

test('shows complete identity, requires a member vehicle and omits removed capture controls', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await setup(page);
  await expect(page.getByRole('button', { name: 'بارگذاری تصویر آزمایشی', exact: true })).toHaveCount(0);
  await expect(page.getByText('تصویر انتخاب‌شده همراه ثبت ورود یا خروج ارسال می‌شود؛ حداکثر ۵۰۰ کیلوبایت.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'کنترل کارت تکراری', exact: true })).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'بازه (ثانیه)', exact: true })).toHaveCount(0);
  await lookupCard(page);
  await expect(page.getByAltText(fa.trafficIdentity.personalPhoto)).toBeVisible();
  await expect(page.getByAltText(fa.trafficIdentity.entranceImage)).toBeVisible();
  await expect(page.getByText('1234567890', { exact: true })).toBeVisible();
  await expect(page.getByText('اشتراک جاری', { exact: true })).toBeVisible();
  await expect(page.getByText('اشتراک آینده', { exact: true })).toBeVisible();
  await closeIdentity(page);
  const enter = page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation.enter, exact: true });
  await expect(enter).toBeDisabled();
  await page.getByRole('combobox', { name: fa.trafficIdentity.memberVehicle }).click();
  await page.getByRole('option', { name: /22ب45678/ }).click();
  await expect(enter).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('traffic-identity.png'), fullPage: true });
  await enter.click();
  await expect.poll(() => state.mutations.length).toBe(1);
  expect(state.mutations[0].payload).toMatchObject({ CarId: 20, MemberId: 11, CarPlate: cars[1].Plate });
  expect(state.mutations[0].payload).not.toHaveProperty('DtoViewTrafficImages');
  await lookupCard(page);
  expect(state.lookups).toBeGreaterThanOrEqual(3);
});

test('blocks inactive, blacklisted and stolen vehicles, warns for observation and refreshes exit permission', async ({ page }) => {
  const state = await setup(page);
  state.open = true;
  state.control = 1;
  await lookupCard(page);
  await closeIdentity(page);
  const exit = page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation.exit, exact: true });
  await expect(exit).toBeDisabled();
  await expect(page.getByText(fa.trafficIdentity.blacklisted, { exact: false })).toBeVisible();
  state.control = 0; state.inactive = true;
  await lookupCard(page); await closeIdentity(page);
  await expect(page.getByText(fa.trafficIdentity.inactiveMember, { exact: true })).toBeVisible();
  await expect(exit).toBeDisabled();
  state.inactive = false; state.control = 3;
  await lookupCard(page); await closeIdentity(page);
  await expect(page.getByText(fa.trafficIdentity.stolen, { exact: false })).toBeVisible();
  await expect(exit).toBeDisabled();
  state.control = 2; state.approved = false;
  await lookupCard(page); await closeIdentity(page);
  await expect(page.getByText(fa.trafficIdentity.observation, { exact: false })).toBeVisible();
  await expect(page.getByText(fa.trafficIdentity.exitNotApproved, { exact: true })).toBeVisible();
  await expect(exit).toBeDisabled();
  expect(state.mutations).toHaveLength(0);
  state.approved = true;
  await lookupCard(page); await closeIdentity(page);
  await expect(exit).toBeEnabled();
  await exit.click();
  const bill = page.getByRole('dialog', { name: 'صورتحساب خروج' });
  await expect(bill).toBeVisible();
  await expect(bill.getByText('3000', { exact: true })).toHaveCount(2);
});

test('reads Windows QR, adds and edits member vehicles through the permitted form', async ({ page }) => {
  const state = await setup(page);
  state.open = true;
  await lookupCard(page, qrCode('42#120134567#76101#1234'));
  await expect(page.getByLabel('شماره کارت', { exact: true })).toHaveValue('1234');
  await page.getByRole('button', { name: fa.trafficIdentity.editVehicle, exact: true }).click();
  let dialog = page.getByRole('dialog', { name: fa.trafficIdentity.editVehicle });
  await dialog.getByRole('textbox', { name: fa.trafficIdentity.vehicleName }).fill('پژو جدید');
  await dialog.getByRole('button', { name: fa.trafficIdentity.saveVehicle }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => state.edited).toBe('پژو جدید');
  await expect(page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true })).toBeVisible();
  await page.getByRole('button', { name: fa.trafficIdentity.addVehicle, exact: true }).click();
  dialog = page.getByRole('dialog', { name: fa.trafficIdentity.addVehicle });
  await dialog.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true }).fill('33');
  await dialog.getByRole('combobox', { name: 'پلاک - حرف پلاک', exact: true }).fill('ب');
  await page.getByRole('option', { name: 'ب', exact: true }).click();
  await dialog.getByRole('textbox', { name: 'پلاک - سه رقم میانی', exact: true }).fill('567');
  await dialog.getByRole('textbox', { name: 'پلاک - کد منطقه', exact: true }).fill('89');
  await dialog.getByRole('textbox', { name: fa.trafficIdentity.vehicleName }).fill('دنا');
  await dialog.getByRole('button', { name: fa.trafficIdentity.saveVehicle }).click();
  await expect(dialog).toBeHidden();
  expect(state.added).toBe(true);
});

test('keeps vehicle writes unavailable without the vehicle-edit permission', async ({ page }) => {
  const state = await setup(page, false);
  state.open = true;
  await lookupCard(page);
  await expect(page.getByRole('button', { name: fa.trafficIdentity.addVehicle, exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: fa.trafficIdentity.editVehicle, exact: true })).toBeDisabled();
  expect(state.mutations).toHaveLength(0);
});
