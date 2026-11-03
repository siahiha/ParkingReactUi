import { expect, test } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

for (const config of [
  { name: 'desktop-light', width: 1440, language: 'fa', mode: 'light' },
  { name: 'desktop-dark', width: 1440, language: 'fa', mode: 'dark' },
  { name: 'desktop-ltr', width: 1440, language: 'en', mode: 'light' },
  { name: 'mobile', width: 390, language: 'fa', mode: 'light' },
]) {
  test(`parking details sections ${config.name}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: config.width, height: 900 });
    await page.addInitScript(({ language, mode }) => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
      localStorage.setItem('locale', language); localStorage.setItem('eos-parking-theme', mode);
    }, config);
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
    const parking = { Id: 7, ParkingName: 'پارکینگ مرکزی', Address: 'خیابان ولیعصر، روبه‌روی پارک ملت', PhonNumber: '02122001234', IsCommercialParking: true, HasUserShifts: true, TaxRate: 9, CostOfCard: 50000, MaxTransferCredit: 1000000, MinOfNotFoundEnterCar: 10000, HasHostelryTariff: true, MinOfHostelryHours: 12, Shift1FromTime: '07:00:00', Shift1ToTime: '15:00:00' };
    await page.route('**/backend/api/**', route => {
      const url = new URL(route.request().url());
      const value = url.pathname.endsWith('/Parking/Get') ? (url.searchParams.has('id') ? parking : [parking]) : [];
      return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
    });
    await page.goto('/home/parking/parking-details');
    const copy = (config.language === 'fa' ? fa : en).parkingForm;
    const fields = page.locator('.parking-details-fields');
    await expect(fields.getByRole('textbox', { name: copy.name, exact: true })).toHaveValue(parking.ParkingName);
    await expect(fields.getByRole('tablist')).toHaveCount(0);
    for (const name of [copy.informationTab, copy.settingsTab, copy.shiftsTab]) await expect(fields.getByRole('region', { name, exact: true })).toBeVisible();
    await expect(fields.getByRole('spinbutton', { name: copy.tax, exact: true })).toBeEnabled();
    await fields.getByRole('checkbox', { name: copy.commercialParking, exact: true }).uncheck();
    await expect(fields.getByRole('spinbutton', { name: copy.tax, exact: true })).toBeDisabled();
    await fields.getByRole('checkbox', { name: copy.commercialParking, exact: true }).check();
    await expect(fields.getByRole('spinbutton', { name: copy.tax, exact: true })).toHaveValue('9');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (config.width > 1050) {
      const settings = (await fields.getByRole('region', { name: copy.settingsTab }).boundingBox())!;
      const shifts = (await fields.getByRole('region', { name: copy.shiftsTab }).boundingBox())!;
      expect(settings.y).toBe(shifts.y);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`${config.name}-parking-details.png`), fullPage: true });
    expect(errors).toEqual([]);
  });
}
