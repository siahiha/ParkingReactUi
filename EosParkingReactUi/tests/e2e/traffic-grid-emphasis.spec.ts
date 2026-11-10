import { expect, test, type Locator } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

async function expectFittedGrid(panel: Locator) {
  await expect.poll(() => panel.evaluate(element => {
    const wrapper = element.querySelector<HTMLElement>('.app-data-grid-wrapper');
    const table = element.querySelector<HTMLElement>('table');
    if (!wrapper || !table) return ['missing table'];
    const problems: string[] = [];
    const wrapperBounds = wrapper.getBoundingClientRect();
    if (wrapper.scrollWidth > wrapper.clientWidth + 1 || table.scrollWidth > wrapper.clientWidth + 1
      || table.getBoundingClientRect().width > wrapperBounds.width + 1) problems.push('horizontal overflow');
    for (const cell of table.querySelectorAll<HTMLElement>('th, td')) {
      const bounds = cell.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.left < wrapperBounds.left - 1 || bounds.right > wrapperBounds.right + 1) {
        problems.push(`column outside grid: ${cell.textContent}`);
      }
      if (cell.scrollWidth > cell.clientWidth + 1 || cell.scrollHeight > cell.clientHeight + 1) {
        problems.push(`clipped cell: ${cell.textContent}`);
      }
      const label = cell.querySelector<HTMLElement>('.app-data-grid-header-content > span');
      if (label && (label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1)) {
        problems.push(`clipped header: ${label.textContent}`);
      }
      // Text can overflow an inline descendant without changing its own clientWidth.
      const textNodes = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      let node = textNodes.nextNode();
      while (node) {
        if (node.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const textBounds of range.getClientRects()) {
            if (textBounds.left < bounds.left - 1 || textBounds.right > bounds.right + 1
              || textBounds.top < bounds.top - 1 || textBounds.bottom > bounds.bottom + 1) {
              problems.push(`text outside cell: ${node.textContent}`);
            }
          }
        }
        node = textNodes.nextNode();
      }
    }
    return problems;
  })).toEqual([]);
}

for (const config of [
  { name: 'desktop-rtl', width: 1366, height: 768, language: 'fa' },
  { name: 'desktop-ltr', width: 1280, height: 720, language: 'en' },
  { name: 'short-rtl', width: 1024, height: 600, language: 'fa' },
  { name: 'mobile-rtl', width: 390, height: 844, language: 'fa' },
]) {
  test(`traffic grids always show every column with restrained pointer and keyboard emphasis on ${config.name}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.addInitScript(({ language }) => {
      sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: {
        id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true,
      } }));
      localStorage.setItem('locale', language);
      localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
    }, config);
    await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
    const rows = Array.from({ length: 32 }, (_, index) => ({
      DumpId: index + 1, CarId: index + 101, CardId: index + 201,
      CarPlate: `12ب${String(index).padStart(3, '0')}67`, CardNumber: String(3000 + index),
      MemberFullName: `عضو ${index + 1} VeryLongUnbrokenMembershipLabelForTheTrafficGrid`,
      MemberCode: `12345678901234567890${index + 1}`, MemberNationalCode: String(3000000000 + index),
      EnterDateTime: new Date(Date.UTC(2026, 10, 10, 8, index)).toISOString(),
      ExitDateTime: index >= 16 ? new Date(Date.UTC(2026, 10, 10, 10, index)).toISOString() : null,
      PayType: 9, CommonCost: 1234567890, MemberTariffId: 13, TarrifIds: [1], ExitPermission: true,
    }));
    let refreshes = 0;
    let hasNewEntry = false;
    let lookups = 0;
    await page.route('**/backend/api/**', route => {
      const url = new URL(route.request().url());
      let value: unknown = [];
      if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی' }];
      if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
      if (url.pathname.endsWith('/GetParkingDoor')) value = { Id: 8, Title: 'درب اصلی' };
      if (url.pathname.endsWith('/GetTraffics')) {
        refreshes++;
        value = hasNewEntry ? [...rows, { ...rows[0], DumpId: 33, EnterDateTime: '2026-11-10T12:00:00Z' }] : rows;
      }
      if (url.pathname.endsWith('/GetCarTrafficInfo')) {
        lookups++;
        const row = rows.find(item => item.CarPlate === url.searchParams.get('plate')) ?? rows[0];
        value = { ...row, Plate: row.CarPlate };
      }
      return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
    });
    await page.goto('/home/parking/manual-traffic');
    const copy = (config.language === 'fa' ? fa : en).trafficGrid;
    const layout = page.locator('.traffic-split-grid-layout');
    const entries = page.getByRole('region', { name: new RegExp(`^${copy.entries}`) });
    const exits = page.getByRole('region', { name: new RegExp(`^${copy.exits}`) });
    await expect(entries.locator('tbody tr')).toHaveCount(16);
    await expect(exits.locator('tbody tr')).toHaveCount(16);
    await page.evaluate(() => document.fonts.ready);
    await expect(entries).toBeFocused();
    await expect(entries.getByRole('columnheader')).toHaveCount(5);
    await expect(exits.getByRole('columnheader')).toHaveCount(7);

    const expectBothFitted = async () => {
      await expectFittedGrid(entries);
      await expectFittedGrid(exits);
    };

    const expectEmphasized = async (active: Locator, other: Locator, key: 'entries' | 'exits') => {
      await expect(layout).toHaveAttribute('data-active-grid', key);
      await expect(active).toHaveClass(/is-emphasized/);
      await expect(other).not.toHaveClass(/is-emphasized/);
      if (config.width > 900) {
        const widthRatio = async () => {
          const activeBounds = await active.boundingBox();
          const otherBounds = await other.boundingBox();
          return activeBounds && otherBounds ? activeBounds.width / otherBounds.width : 0;
        };
        await expect.poll(widthRatio).toBeGreaterThan(1.4);
        await expect.poll(widthRatio).toBeLessThan(1.65);
      }
      await expectBothFitted();
    };

    await expectEmphasized(entries, exits, 'entries');
    await entries.getByRole('heading').hover();
    await expectEmphasized(entries, exits, 'entries');

    // Keyboard focus must win even while the pointer remains over the other grid.
    const firstExit = exits.locator('tbody tr').first();
    await firstExit.focus();
    await expect(firstExit).toBeFocused();
    await expectEmphasized(exits, entries, 'exits');

    const entryRow = entries.locator('tbody tr').first();
    await entryRow.focus();
    const selectedMember = await entryRow.locator('td').first().textContent();
    await expectEmphasized(entries, exits, 'entries');
    const exitAction = entryRow.getByRole('button', { name: copy.exit, exact: true });
    const exitBounds = (await exitAction.boundingBox())!;
    expect(exitBounds.width).toBeGreaterThanOrEqual(24);
    expect(exitBounds.height).toBeGreaterThanOrEqual(24);
    const lookupsBefore = lookups;
    await exitAction.click();
    await expect.poll(() => lookups).toBeGreaterThan(lookupsBefore);
    await expectBothFitted();

    // Refreshing records must keep the selected traffic when its row index changes.
    const beforeRefresh = refreshes;
    hasNewEntry = true;
    await expect.poll(() => refreshes, { timeout: 10000 }).toBeGreaterThan(beforeRefresh);
    await expect(entries.locator('tbody tr')).toHaveCount(17);
    await expect(entries.locator('tr.Mui-selected td').first()).toHaveText(selectedMember!);
    await expectBothFitted();

    // A newer pointer interaction may take space from the keyboard-focused grid.
    const selectedEntry = entries.locator('tr.Mui-selected');
    await selectedEntry.focus();
    await expect(selectedEntry).toBeFocused();
    await exits.getByRole('heading').hover();
    await expectEmphasized(exits, entries, 'exits');
    await firstExit.focus();
    const cargo = firstExit.getByRole('button', { name: copy.cargo, exact: true });
    const pay = firstExit.getByRole('button', { name: copy.pay, exact: true });
    for (const control of [cargo, pay]) {
      await expect(control).toBeVisible();
      await control.click({ trial: true });
    }
    await cargo.focus();
    await cargo.press('Enter');
    await expect(page.getByRole('menuitem', { name: copy.inboundCargo, exact: true })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: copy.outboundCargo, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(cargo).toBeFocused();
    await expectBothFitted();

    // Leaving both grids returns space to entries without making either table scroll.
    await page.mouse.move(0, 0);
    await page.getByRole('textbox', { name: copy.search, exact: true }).focus();
    await expectEmphasized(entries, exits, 'entries');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`traffic-grid-emphasis-${config.name}.png`), fullPage: true });
  });
}
