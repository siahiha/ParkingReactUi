import { expect, test } from '@playwright/test';

for (const section of ['floors', 'members']) {
  for (const populated of [false, true]) {
  test(`create ${section} with ${populated ? 'existing' : 'empty'} records keeps the routed application mounted`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.stack ?? error.message));
    await page.addInitScript(() => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], legacyAccessLevelId: 1, canManageDashboard: true } }));
    });
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
    await page.route('**/backend/api/**', route => {
      const url = new URL(route.request().url());
      const values = url.pathname.endsWith('/Parking/Get') ? [{ Id: 7, ParkingName: 'پارکینگ آزمایش' }]
        : url.pathname.endsWith('/GetParkingParkSpaceKinds') ? [{ Id: 1, Title: 'عادی' }]
        : populated && url.pathname.endsWith('/GetParkingFloors') ? [{ Id: 5, Title: 'همکف', ParkSpaces: [] }]
        : populated && url.pathname.endsWith('/Member/GetByParkingId') ? [{ Id: 21, Name: 'عضو آزمایش', Family: '', Code: '1001', Cars: [], MemberRegisters: [], MemberParkSpaces: [] }] : [];
      return route.fulfill({ json: { ResponseResultType: 1, Values: values } });
    });
    await page.goto(`${process.env.UI_TEST_BASE_URL ?? ''}/home/parking/${section}`);
    const add = page.getByRole('button', { name: section === 'floors' ? 'جدید' : 'عضو جدید', exact: true });
    await expect(add).toBeVisible().catch(error => { throw new Error(`${error.message}\nBrowser errors: ${errors.join('\n')}`); });
    if (populated) await expect(page.getByText(section === 'floors' ? 'همکف' : 'عضو آزمایش', { exact: true }).first()).toBeVisible();
    await add.click();
    if (section === 'floors') await expect(page.getByRole('dialog')).toBeVisible();
    else await expect(page.getByRole('textbox', { name: 'نام', exact: true })).toBeVisible();
    const reactModules = await page.evaluate(() => performance.getEntriesByType('resource')
      .map(entry => entry.name).filter(url => /\/deps\/react\.js(?:\?|$)/.test(url)));
    expect(reactModules.length).toBeGreaterThan(0);
    expect(new Set(reactModules).size, 'React must be loaded under one module URL, not mixed optimizer versions').toBe(1);
    expect(errors).toEqual([]);
  });
  }
}
