import { expect, test } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

for (const config of [
  { name: 'desktop-rtl', width: 1366, height: 768, language: 'fa', mode: 'light' },
  { name: 'desktop-dark', width: 1440, height: 900, language: 'fa', mode: 'dark' },
  { name: 'desktop-ltr', width: 1280, height: 720, language: 'en', mode: 'light' },
  { name: 'short-rtl', width: 1024, height: 600, language: 'fa', mode: 'light' },
  { name: 'mobile-rtl', width: 390, height: 844, language: 'fa', mode: 'light' },
]) {
  test(`traffic grids ${config.name}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.addInitScript(({ language, mode, width }) => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
      localStorage.setItem('locale', language);
      localStorage.setItem('eos-parking-theme', mode);
      localStorage.setItem('eos-parking-sidebar-collapsed', String(width !== 1366));
    }, config);
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
    const rows = Array.from({ length: 100 }, (_, index) => ({
      DumpId: index + 1, CarPlate: `12ب${String(index).padStart(3, '0')}67`,
      MemberFullName: `عضو ${index + 1}`, MemberCode: String(1000 + index),
      CardNumber: String(2000 + index), MemberNationalCode: String(3000000000 + index),
      EnterDateTime: new Date(Date.UTC(2026, 10, 10, 8, index)).toISOString(),
      ExitDateTime: index >= 50 ? new Date(Date.UTC(2026, 10, 10, 10, index)).toISOString() : null,
      PayType: 0, CommonCost: 125000, TarrifIds: [1],
    }));
    let refreshes = 0;
    let update = false;
    await page.route('**/backend/api/**', route => {
      const url = new URL(route.request().url());
      let value: unknown = [];
      if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
      if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 7, Title: 'درب اصلی' }];
      if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 7, Title: 'درب اصلی', DoorType: 2, EnteranceCamera: { Id: 17, DeviceName: 'ورودی', Disabled: true }, ExitCamera: { Id: 18, DeviceName: 'خروجی', Disabled: true } };
      if (url.pathname.endsWith('/GetTraffics')) {
        refreshes++;
        value = update ? rows.map(row => row.DumpId === 1 ? { ...row, ExitDateTime: '2026-11-10T14:00:00Z' } : row) : rows;
      }
      if (url.pathname.endsWith('/GetCarTrafficInfo')) value = rows.find(row => row.CarPlate === url.searchParams.get('plate'));
      return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
    });
    await page.goto('/home/parking/manual-traffic');
    const copy = (config.language === 'fa' ? fa : en).trafficGrid;
    const entries = page.getByRole('region', { name: new RegExp(`^${copy.entries}`) });
    const exits = page.getByRole('region', { name: new RegExp(`^${copy.exits}`) });
    await expect(entries.locator('tbody tr')).toHaveCount(50);
    await expect(exits.locator('tbody tr')).toHaveCount(50);
    await expect(entries.getByRole('columnheader')).toHaveText([copy.membership, copy.plate, copy.entryTime, copy.exit, '']);
    await expect(exits.getByRole('columnheader')).toHaveText([copy.membership, copy.plate, copy.exitTime, copy.paymentShort, copy.amountShort, '', '']);
    const exitCell = entries.locator('tbody tr').first().locator('td').nth(3);
    expect((await exitCell.boundingBox())!.width).toBeGreaterThanOrEqual(30);
    await page.getByRole('textbox', { name: copy.search, exact: true }).fill('٣٠٠٠٠٠٠٠٠٩');
    await expect(entries.locator('tbody tr')).toHaveCount(1);
    await expect(exits.locator('tbody tr')).toHaveCount(0);
    await page.getByRole('button', { name: copy.clear, exact: true }).click();
    const selected = entries.locator('tbody tr').nth(10);
    await selected.click();
    const selectedText = await selected.locator('td').first().textContent();
    const scroll = entries.locator('.app-data-grid-wrapper');
    await scroll.evaluate(element => { element.scrollTop = 140; element.scrollLeft = -60; });
    const offset = await scroll.evaluate(element => ({ top: element.scrollTop, left: element.scrollLeft }));
    const before = refreshes;
    update = true;
    await expect.poll(() => refreshes).toBeGreaterThan(before);
    await expect(entries.locator('tbody tr')).toHaveCount(49);
    await expect(exits.locator('tbody tr')).toHaveCount(51);
    await expect(entries.locator('tr.Mui-selected td').first()).toHaveText(selectedText!);
    expect(await scroll.evaluate(element => ({ top: element.scrollTop, left: element.scrollLeft }))).toEqual(offset);
    // Double-click selects a traffic for exit; it must never open the history editor.
    await entries.locator('tbody tr').first().dblclick();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const selectedRow = entries.locator('tr.Mui-selected');
    await selectedRow.getByRole('button', { name: copy.cargo, exact: true }).click();
    await expect(page.getByRole('menuitem', { name: copy.inboundCargo })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: copy.outboundCargo })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await entries.getByRole('heading').click();
    await page.mouse.move(10, 10);
    if (config.width > 900) {
      const a = (await entries.boundingBox())!;
      const b = (await exits.boundingBox())!;
      expect(a.y).toBe(b.y);
      expect(config.language === 'fa' ? a.x > b.x : a.x < b.x).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (config.width > 680) expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    expect(await page.locator('.home3-main').evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    for (const panel of [entries, exits]) {
      const bounds = (await panel.boundingBox())!;
      if (config.width > 680) expect(bounds.y + bounds.height).toBeLessThanOrEqual(config.height);
      expect(bounds.height).toBeGreaterThan(75);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath('traffic-grids.png'), fullPage: true });
    const workspace = (await page.locator('.traffic-control-workspace').boundingBox())!;
    expect(workspace.x).toBeGreaterThanOrEqual(0);
    expect(workspace.x + workspace.width).toBeLessThanOrEqual(config.width);
    expect(errors).toEqual([]);
  });
}
