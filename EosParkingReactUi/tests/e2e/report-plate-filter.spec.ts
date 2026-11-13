import { expect, test } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

const reports = ['traffic-reports-list', 'management-free-parking-income', 'cargo-details'] as const;
for (const report of reports) for (const language of ['fa', 'en'] as const) {
  test(`shared plate filter ${report} ${language}`, async ({ page }, testInfo) => {
    const copy = language === 'fa' ? fa : en;
    const label = (key: 'first' | 'middle' | 'region' | 'letter' | 'motorFirst' | 'motorSecond') => copy.plateInput[key].replace('{{label}}', copy.reportFilters.plate);
    await page.setViewportSize({ width: language === 'fa' ? 390 : 1280, height: 800 });
    await page.addInitScript(language => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
      localStorage.setItem('locale', language);
    }, language);
    const requests: Record<string, unknown>[] = [];
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
    await page.route('**/backend/api/**', route => {
      if (route.request().url().includes('/Report/')) {
        requests.push(route.request().postDataJSON());
        // Keep the filter available for all three submissions; the report engine is outside this test.
        return route.fulfill({ status: 422, json: { Message: 'Report boundary test' } });
      }
      return route.fulfill({ json: { ResponseResultType: 1, Values: route.request().url().includes('/Parking/Get') ? [{ Id: 7, ParkingName: 'پارکینگ' }] : [] } });
    });
    await page.goto(`/home/parking/${report}`);
    const filter = page.locator('.report-plate-filter');
    const submit = page.getByRole('button', { name: language === 'fa' ? 'نمایش گزارش' : 'Show report', exact: true });
    await expect(filter.locator('.iranian-plate-control')).toBeVisible({ timeout: 20000 });
    const plateSize = await filter.locator('.iranian-plate-control').boundingBox();
    expect(plateSize?.width).toBe(190);
    expect(plateSize?.height).toBe(56);
    await filter.getByRole('textbox', { name: label('first'), exact: true }).fill('۱۲');
    await submit.click();
    await expect(page.getByRole('alert').filter({ hasText: copy.reportFilters.invalidPlate })).toBeVisible();
    expect(requests).toHaveLength(0);
    await filter.getByRole('combobox', { name: label('letter'), exact: true }).fill('ب');
    await page.getByRole('option', { name: 'ب', exact: true }).click();
    await filter.getByRole('textbox', { name: label('middle'), exact: true }).fill('۳۴۵');
    await filter.getByRole('textbox', { name: label('region'), exact: true }).fill('۶۷');
    await page.screenshot({ path: testInfo.outputPath('report-plate-filter.png') });
    const submittedPlate = () => {
      const body = requests.at(-1)!;
      return ((body.Filters as Record<string, unknown> | undefined) ?? body).Plate;
    };
    await submit.click();
    await expect.poll(() => requests.length).toBe(1);
    expect(submittedPlate()).toBe('12ب34567');
    await expect(submit).toBeEnabled();
    await filter.getByRole('button', { name: copy.plateInput.motorcycle, exact: true }).click();
    expect((await filter.locator('.iranian-plate-control').boundingBox())?.width).toBe(190);
    await filter.getByRole('textbox', { name: label('motorFirst'), exact: true }).fill('۱۲۳');
    await filter.getByRole('textbox', { name: label('motorSecond'), exact: true }).fill('۴۵۶۷۸');
    await submit.click();
    await expect.poll(() => requests.length).toBe(2);
    expect(submittedPlate()).toBe('12345678');
    await expect(submit).toBeEnabled();
    await filter.getByRole('button', { name: copy.plateInput.carPickup, exact: true }).click();
    await submit.click();
    await expect.poll(() => requests.length).toBe(3);
    expect(submittedPlate()).toBe('');
    if (report !== 'cargo-details') expect((requests.at(-1)!.Filters as Record<string, unknown>).CarType).toBeNull();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
