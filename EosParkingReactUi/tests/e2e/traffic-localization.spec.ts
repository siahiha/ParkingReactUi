import { expect, test } from '@playwright/test';
import en from '../../src/locales/en';

test('uses English resources for the live console, cargo popup and a legacy Persian bill', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'en');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  let exits = 0; let payments = 0;
  const bill = { DumpId: 42, CarId: 10, Plate: '12ب34567', CarPlate: '12ب34567', CardId: 12, CardNumber: '1234', MemberId: 0, MemberTariffId: 13,
    EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: '2026-11-10T10:00:00', PayType: 0, CommonCost: 3000, MemberCost: 0,
    TotalCost: 3000, CommonDuration: 120, FormatedDuration: 'دو ساعت', TarrifTitle: 'Daily' };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url()); let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'Central', IsCommercialParking: true }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'Main gate' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, DoorType: 2 };
    if (url.pathname.endsWith('/GetTraffics')) value = [{ ...bill, ExitDateTime: exits ? bill.ExitDateTime : null }];
    if (url.pathname.endsWith('/GetCarTrafficInfo')) value = { ...bill, ExitDateTime: null };
    if (url.pathname.endsWith('/DoExitDump')) { exits++; value = bill; }
    if (url.pathname.endsWith('/PayDump')) { payments++; value = 'receipt'; }
    if (url.pathname.endsWith('/GetCargoRequiredData')) value = { Drivers: [{ Id: 1, FullName: 'Driver' }], Merchandises: [{ Id: 2, Title: 'Goods' }], companyDetails: [{ SectionId: 3, CompanyName: 'Company', SectionName: 'Origin' }] };
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(page.getByRole('status', { name: en.trafficLayout.doorType })).toContainText(en.trafficLayout.doorTypes[2]);
  const console = page.locator('.traffic-control-console');
  await expect(console.getByRole('button', { name: en.plateInput.motorcycle, exact: true })).toBeVisible();
  await expect(console.getByRole('textbox', { name: 'Plate - first two digits', exact: true })).toBeVisible();
  const card = console.getByRole('textbox', { name: en.trafficWorkspace.card, exact: true });
  await card.fill('1234'); await card.press('Enter');
  await console.getByRole('button', { name: en.trafficOperation.exit, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: en.trafficPayment.title, exact: true });
  await expect(dialog.getByRole('region', { name: en.trafficPayment.totalStay })).toContainText('0d 2h 0m');
  await expect(dialog).not.toContainText('دو ساعت');
  await dialog.getByRole('button', { name: en.trafficPayment.close, exact: true }).click();
  expect(exits).toBe(1); expect(payments).toBe(0);
  const exitsGrid = page.getByRole('region', { name: /^Exits/ });
  await exitsGrid.getByRole('row').filter({ hasText: '12ب34567' }).click();
  await exitsGrid.getByRole('button', { name: en.trafficGrid.cargo, exact: true }).click();
  await page.getByRole('menuitem', { name: en.trafficGrid.outboundCargo, exact: true }).click();
  const cargo = page.getByRole('dialog', { name: en.trafficCargo.outboundTitle, exact: true });
  await expect(cargo).toContainText(en.trafficCargo.driver);
  await expect(cargo.getByRole('button', { name: en.trafficCargo.register, exact: true })).toBeVisible();
});
