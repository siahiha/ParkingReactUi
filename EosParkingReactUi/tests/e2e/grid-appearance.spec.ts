import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

for (const language of ['fa', 'en']) for (const mode of ['light', 'dark']) {
  test(`grid keeps compact geometry and readable interaction (${language} ${mode})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(({ language, mode }) => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
      localStorage.setItem('locale', language);
      localStorage.setItem('eos-parking-theme', mode);
      localStorage.setItem('eos-parking-palette', 'green');
    }, { language, mode });
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
    await page.route('**/backend/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      let Values: unknown = [];
      if (path.endsWith('/Parking/Get')) Values = [{ Id: 7, ParkingName: 'پارکینگ مرکزی', IsCommercialParking: true, HasUserShifts: false }];
      if (path.endsWith('/GetParkingEquipments')) Values = Array.from({ length: 6 }, (_, index) => ({
        Id: 42 + index, ParkingId: 7, DeviceName: `Gate ${index + 1}`, DeviceType: 1, ConnectionType: 1,
        Ip: `192.0.2.${10 + index}`, Port: 1001 + index, Disabled: index === 4,
      }));
      return route.fulfill({ json: { ResponseResultType: 1, Values } });
    });
    await page.goto('/home/parking/equipment');
    const grid = page.locator('.app-data-grid');
    await expect(grid.locator('tbody tr')).toHaveCount(6);
    await page.evaluate(() => document.fonts.ready);
    const geometry = () => grid.evaluate(table => [...table.querySelectorAll('tr')].map(row => ({
      height: row.getBoundingClientRect().height,
      widths: [...row.children].map(cell => cell.getBoundingClientRect().width),
    })));
    const initial = await geometry();
    await writeFile(testInfo.outputPath('geometry.json'), JSON.stringify(initial, null, 2));
    await testInfo.attach('geometry', { body: JSON.stringify(initial, null, 2), contentType: 'application/json' });
    await grid.locator('tbody tr').nth(1).click();
    await expect(grid.locator('tbody tr').nth(1)).toHaveClass(/Mui-selected/);
    await grid.locator('tbody tr').nth(1).press('Tab');
    await page.keyboard.press('Tab');
    await expect(grid.locator('tbody tr').nth(2)).toBeFocused();
    expect(await grid.locator('tbody tr').nth(2).evaluate(row => getComputedStyle(row).outlineStyle)).toBe('solid');
    await grid.locator('tbody tr').nth(2).press('Enter');
    await expect(grid.locator('tbody tr').nth(2)).toHaveClass(/Mui-selected/);
    await grid.locator('tbody tr').nth(1).click();
    await grid.locator('tbody tr').nth(3).hover();
    expect(await geometry()).toEqual(initial);
    await page.locator('.parking-management-workspace').screenshot({ path: testInfo.outputPath(`${language}-${mode}-grid.png`), animations: 'disabled' });
  });
}
