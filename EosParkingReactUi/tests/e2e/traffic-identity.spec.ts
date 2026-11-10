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
      permissions: [], permissionPart1: ((1n << 42n) | (canEdit ? 1n << 43n : 0n)).toString(), canManageDashboard: false } }));
    localStorage.setItem('locale', 'fa');
  }, { canEdit });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', trafficRequireExitPermission: true } }));
  const state = { control: 0, action: 0, inactive: false, approved: true, open: false, added: false, edited: '', lookups: 0, mutations: [] as { path: string; payload: Record<string, unknown> }[] };
  await page.route('**/backend/api/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    let value: unknown = [];
    const allCars = state.added ? [...cars, { ...cars[0], Id: 30, Plate: '33ب56789', Name: 'دنا' }] : cars;
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, Title: 'درب اصلی' };
    if (url.pathname.endsWith('/GetTrafficBill')) value = { DumpId: 42, ParkingId: 8, PayType: 0, CarPlate: cars[0].Plate };
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      state.lookups++;
      const plate = url.searchParams.get('plate') || (state.open ? cars[0].Plate : '');
      const car = allCars.find(item => item.Plate === plate);
      value = { DumpId: state.open ? 42 : 0, EnterDateTime: state.open ? '2026-11-10T08:00:00' : null, Plate: plate, CarId: car?.Id ?? 0,
        MemberId: 11, MemberCode: '76101', MemberFullName: 'علی رضایی', MemberNationalCode: '1234567890', CardNumber: '1234', CardId: 12,
        MemberTariffId: 13, CarName: state.edited || car?.Name, CarColor: car?.DtoViewCarColorTitle, CarModel: car?.DtoViewCarModelTitle,
        ControlType: state.control, ControlListActionType: state.action, Description: 'پیام کنترل', IsMemberBlock: state.inactive,
        ExitPermission: state.approved, MemberCars: allCars, MemberPersonalPhoto: png, EnteranceImage: png };
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
  await field.fill(card);
  await field.press('Tab');
  await expect(page.getByRole('button', { name: fa.trafficIdentity.refreshIdentity, exact: true })).toBeEnabled();
}

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
  const enter = page.getByRole('button', { name: 'ثبت ورود', exact: true });
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
  const exit = page.getByRole('button', { name: 'محاسبه مبلغ و ثبت خروج', exact: true });
  const refresh = page.getByRole('button', { name: fa.trafficIdentity.refreshIdentity, exact: true });
  await expect(exit).toBeDisabled();
  await expect(page.getByText(fa.trafficIdentity.blacklisted, { exact: false })).toBeVisible();
  state.control = 0; state.inactive = true;
  await refresh.click();
  await expect(page.getByText(fa.trafficIdentity.inactiveMember, { exact: true })).toBeVisible();
  await expect(exit).toBeDisabled();
  state.inactive = false; state.control = 3;
  await refresh.click();
  await expect(page.getByText(fa.trafficIdentity.stolen, { exact: false })).toBeVisible();
  await expect(exit).toBeDisabled();
  state.control = 2; state.approved = false;
  await refresh.click();
  await expect(page.getByText(fa.trafficIdentity.observation, { exact: false })).toBeVisible();
  await expect(page.getByText(fa.trafficIdentity.exitNotApproved, { exact: true })).toBeVisible();
  await expect(exit).toBeDisabled();
  expect(state.mutations).toHaveLength(0);
  state.approved = true;
  await refresh.click();
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
  await expect(page.getByRole('textbox', { name: 'شماره کارت', exact: true })).toHaveValue('1234');
  await page.getByRole('button', { name: fa.trafficIdentity.editVehicle, exact: true }).click();
  let dialog = page.getByRole('dialog', { name: fa.trafficIdentity.editVehicle });
  await dialog.getByRole('textbox', { name: fa.trafficIdentity.vehicleName }).fill('پژو جدید');
  await dialog.getByRole('button', { name: fa.trafficIdentity.saveVehicle }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => state.edited).toBe('پژو جدید');
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
