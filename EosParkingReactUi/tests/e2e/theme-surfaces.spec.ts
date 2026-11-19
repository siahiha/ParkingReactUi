import { expect, test, type Locator, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

function luminance(color: number[]) {
  const linear = color.slice(0, 3).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}
function contrast(first: number[], second: number[]) {
  const a = luminance(first); const b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
async function colors(locator: Locator, pseudo?: string) {
  return locator.evaluate((element, pseudo) => {
    const style = getComputedStyle(element, pseudo);
    const canvas = document.createElement('canvas').getContext('2d')!;
    const rgb = (color: string) => {
      canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = color; canvas.fillRect(0, 0, 1, 1);
      return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    return {
      text: rgb(style.color), background: rgb(style.backgroundColor), image: style.backgroundImage,
      primary: rgb(style.getPropertyValue('--app-primary')),
      headerStops: ['--app-header-start', '--app-header-middle', '--app-header-end'].map(key => rgb(style.getPropertyValue(key))),
      separatorStops: ['--app-tabs-separator-start', '--app-tabs-separator-middle', '--app-tabs-separator-end'].map(key => rgb(style.getPropertyValue(key))),
      selectionStops: ['--app-nav-selection-start', '--app-nav-selection-middle', '--app-nav-selection-end'].map(key => rgb(style.getPropertyValue(key))),
      stops: ['--app-nav-glow', '--app-nav-surface', '--app-nav-end'].map(key => rgb(style.getPropertyValue(key))),
    };
  }, pseudo);
}

async function setup(page: Page, language: 'fa' | 'en', mode: string) {
  await page.addInitScript(({ language, mode }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-theme', mode);
    localStorage.setItem('eos-parking-sidebar-collapsed', 'false');
  }, { language, mode });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
  await page.route('**/backend/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    let Values: unknown = [];
    if (path.endsWith('/Parking/Get')) Values = [{ Id: 7, ParkingName: 'Central Parking', IsCommercialParking: true, HasUserShifts: false }];
    if (path.endsWith('/GetParkingEquipments')) Values = [{ Id: 42, ParkingId: 7, DeviceName: 'Entry gate', DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, Disabled: false }];
    return route.fulfill({ json: { ResponseResultType: 1, Values } });
  });
}

for (const language of ['fa', 'en'] as const) for (const mode of ['light', 'dark']) {
  test(`themes the complete shell and portal drawer with readable surfaces (${language} ${mode})`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    const labels = language === 'fa' ? fa : en;
    await setup(page, language, mode);
    const headers: string[] = []; const gradients: string[] = []; const tableHeads: string[] = []; const papers: string[] = [];
    const separators: string[] = [];
    for (const name of ['blue', 'green', 'violet', 'amber', 'rose', 'slate']) {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/home/parking/equipment');
      // Seed the preference and reload so all colors are rendered through the real App theme.
      await page.evaluate(name => localStorage.setItem('eos-parking-palette', name), name);
      await page.reload();
      await expect(page.locator('.app-root')).toHaveAttribute('data-palette', `${mode}-${name}`);
      await expect(page.getByRole('row').filter({ hasText: 'Entry gate' })).toBeVisible();
      const header = await colors(page.locator('.home3-header'));
      expect(contrast(header.text, header.background), `${name} header`).toBeGreaterThanOrEqual(4.5);
      expect(header.image).toContain('linear-gradient');
      expect((await page.locator('.home3-header').boundingBox())!.height).toBe(56);
      for (const stop of header.headerStops) expect(contrast(header.text, stop), `${name} header gradient`).toBeGreaterThanOrEqual(4.5);
      for (const selector of ['.home3-brand-title', '.home3-brand-kicker', '.home3-context-label']) {
        const label = await colors(page.locator(selector));
        for (const stop of header.headerStops) expect(contrast(label.text, stop), `${name} ${selector}`).toBeGreaterThanOrEqual(4.5);
      }
      headers.push(header.background.join(','));
      const avatar = await colors(page.locator('.home3-profile .MuiAvatar-root'));
      expect(contrast(avatar.text, avatar.background), `${name} profile icon`).toBeGreaterThanOrEqual(4.5);
      const title = page.locator('.workspace-resource-heading .MuiTypography-h6');
      papers.push((await colors(page.locator('.parking-management-workspace'))).background.join(','));
      const heading = await colors(page.locator('.parking-management-workspace > .workspace-heading'));
      expect(contrast((await colors(title)).text, heading.background), `${name} form title`).toBeGreaterThanOrEqual(4.5);
      const table = await colors(page.locator('.app-data-grid thead th').first());
      expect(contrast(table.text, table.background), `${name} table heading`).toBeGreaterThanOrEqual(4.5);
      tableHeads.push(table.background.join(','));
      const tab = await colors(page.locator('.home3-tabs .Mui-selected'));
      expect(contrast(tab.text, tab.background), `${name} selected tab`).toBeGreaterThanOrEqual(4.5);
      const separator = await colors(page.locator('.home3-tabs'), '::before');
      expect(separator.image).toContain('linear-gradient');
      expect(separator.separatorStops[1], `${name} separator differs from the theme`).not.toEqual(separator.primary);
      separators.push(separator.image);
      const nav = page.locator('aside.home3-navigation');
      const side = await colors(nav);
      expect((await colors(nav, '::before')).image, `${name} sidebar separator matches tabs`).toBe(separator.image);
      expect(side.image).toContain('linear-gradient'); gradients.push(side.image);
      const active = await colors(nav.locator('.home3-nav-leaf.is-active'));
      expect(contrast(active.text, active.background), `${name} selected menu`).toBeGreaterThanOrEqual(4.5);
      expect(active.image).toContain('linear-gradient');
      for (const stop of active.selectionStops) expect(contrast(active.text, stop), `${name} selected menu gradient`).toBeGreaterThanOrEqual(4.5);
      // Distinct tones must remain visible, rather than passing with nearly identical stops.
      expect(Math.max(...active.selectionStops[0].map((value, index) => Math.abs(value - active.selectionStops[1][index]))), `${name} visible selection gradient`).toBeGreaterThanOrEqual(25);
      expect((await nav.locator('.home3-nav-leaf.is-active').boundingBox())!.height).toBeLessThanOrEqual(30);
      expect((await nav.locator('.home3-nav-root').first().boundingBox())!.height).toBeLessThanOrEqual(34);
      const leaf = await colors(nav.locator('.home3-nav-leaf:not(.is-active)').first());
      for (const stop of side.stops) expect(contrast(leaf.text, stop), `${name} menu on gradient`).toBeGreaterThanOrEqual(4.5);
      if (name === 'green') await page.screenshot({ path: testInfo.outputPath(`${language}-${mode}-desktop.png`), animations: 'disabled' });
      await page.getByRole('row').filter({ hasText: 'Entry gate' }).click();
      await page.getByRole('button', { name: labels.equipment.edit, exact: true }).click();
      const dialog = page.getByRole('dialog');
      const group = await colors(dialog.locator('.app-group-box').first());
      expect(contrast((await colors(dialog.locator('.app-group-box-title').first())).text, group.background), `${name} popup group`).toBeGreaterThanOrEqual(4.5);
      if (name === 'green') await page.screenshot({ path: testInfo.outputPath(`${language}-${mode}-form.png`), animations: 'disabled' });
      await dialog.getByRole('button', { name: labels.equipment.cancel, exact: true }).click();
      await expect(dialog).not.toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      for (const button of await page.locator('.home3-header').getByRole('button').all()) await expect(button).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.home3-header').getByRole('combobox')).toBeInViewport({ ratio: 1 });
      await page.locator('.home3-header').getByRole('button', { name: labels.home.navigation, exact: true }).click();
      const drawer = page.locator('.home3-drawer-surface');
      await expect(drawer).toBeVisible();
      await expect.poll(async () => {
        const bounds = (await drawer.boundingBox())!;
        return Math.abs(language === 'fa' ? bounds.x + bounds.width - 390 : bounds.x);
      }).toBeLessThanOrEqual(1);
      const mobile = await colors(drawer);
      expect((await colors(drawer, '::before')).image, `${name} drawer separator matches tabs`).toBe(separator.image);
      const headerBounds = (await page.locator('.home3-header').boundingBox())!;
      const drawerBounds = (await drawer.boundingBox())!;
      expect(drawerBounds.y).toBe(headerBounds.y + headerBounds.height);
      expect(drawerBounds.y + drawerBounds.height).toBeLessThanOrEqual(844);
      expect(mobile.primary).toEqual(header.primary);
      expect(mobile.image).toBe(side.image);
      const mobileActive = await colors(drawer.locator('.home3-nav-leaf.is-active'));
      expect(contrast(mobileActive.text, mobileActive.background), `${name} drawer selection`).toBeGreaterThanOrEqual(4.5);
      expect(mobileActive.image).toContain('linear-gradient');
      for (const stop of mobileActive.selectionStops) expect(contrast(mobileActive.text, stop), `${name} drawer gradient`).toBeGreaterThanOrEqual(4.5);
      const mobileLeaf = await colors(drawer.locator('.home3-nav-leaf:not(.is-active)').first());
      for (const stop of mobile.stops) expect(contrast(mobileLeaf.text, stop), `${name} drawer text`).toBeGreaterThanOrEqual(4.5);
      expect(await drawer.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      if (name === 'green') await page.screenshot({ path: testInfo.outputPath(`${language}-${mode}-drawer.png`), animations: 'disabled' });
    }
    expect(new Set(headers).size).toBe(6);
    expect(new Set(separators).size).toBe(1);
    expect(new Set(gradients).size).toBe(6);
    expect(new Set(tableHeads).size).toBe(6);
    if (mode === 'dark') expect(new Set(papers).size).toBe(6);
  });
}
