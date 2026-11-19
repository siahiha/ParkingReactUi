import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

async function setup(page: Page, language: 'fa' | 'en') {
  await page.addInitScript(language => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    if (!localStorage.getItem('theme-test-initialized')) {
      localStorage.setItem('eos-parking-light-palette', 'green');
      localStorage.setItem('eos-parking-dark-palette', 'blue');
      localStorage.setItem('eos-parking-theme', 'dark');
      localStorage.setItem('theme-test-initialized', 'true');
    }
  }, language);
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
  await page.route('**/backend/api/**', route => {
    const Values = new URL(route.request().url()).pathname.endsWith('/Parking/Get')
      ? [{ Id: 7, ParkingName: 'Parking', IsCommercialParking: true, HasUserShifts: false }] : [];
    return route.fulfill({ json: { ResponseResultType: 1, Values } });
  });
  await page.goto('/home/parking/equipment');
}

for (const language of ['fa', 'en'] as const) {
  test(`selects one palette for both modes, migrates and persists preferences (${language})`, async ({ page }) => {
    const labels = language === 'fa' ? fa : en;
    await page.setViewportSize({ width: 1280, height: 720 });
    await setup(page, language);
    const root = page.locator('.app-root');
    await expect(root).toHaveAttribute('data-palette', 'dark-green');
    const open = async () => {
      await page.getByRole('button', { name: `${labels.home.profile}: operator`, exact: true }).click();
      await page.getByRole('menuitem', { name: labels.theme.settings, exact: true }).click();
      await expect(page.getByRole('dialog', { name: labels.theme.settings })).toBeVisible();
      await expect(page.locator('.MuiMenu-root')).toHaveCount(0);
    };
    await open();
    const dialog = page.getByRole('dialog', { name: labels.theme.settings });
    await expect(dialog.getByRole('radiogroup', { name: labels.theme.palette })).toHaveCount(1);
    await expect(dialog.getByRole('radio')).toHaveCount(6);
    await expect(dialog.getByRole('radio', { name: labels.theme.greenPalette, exact: true })).toBeChecked();
    await dialog.getByRole('radio', { name: labels.theme.violetPalette, exact: true }).check();
    await expect(root).toHaveAttribute('data-palette', 'dark-green');
    await dialog.getByRole('button', { name: labels.theme.apply, exact: true }).click();
    await expect(root).toHaveAttribute('data-palette', 'dark-violet');
    await page.getByRole('button', { name: labels.theme.dayMode, exact: true }).click();
    await expect(root).toHaveAttribute('data-palette', 'light-violet');
    await page.reload();
    await expect(root).toHaveAttribute('data-palette', 'light-violet');
    const stored = await page.evaluate(() => ({ palette: localStorage.getItem('eos-parking-palette'), light: localStorage.getItem('eos-parking-light-palette'), dark: localStorage.getItem('eos-parking-dark-palette') }));
    expect(stored).toEqual({ palette: 'violet', light: null, dark: null });
    await open();
    await dialog.getByRole('radio', { name: labels.theme.amberPalette, exact: true }).check();
    await dialog.getByRole('button', { name: labels.theme.cancel, exact: true }).click();
    await open();
    await expect(dialog.getByRole('radio', { name: labels.theme.violetPalette, exact: true })).toBeChecked();
    await expect(root).toHaveAttribute('data-palette', 'light-violet');
    await expect(dialog.getByRole('button', { name: labels.theme.apply, exact: true })).toBeInViewport();
    expect(await dialog.locator('.MuiDialogContent-root').evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: test.info().outputPath(`theme-${language}-light.png`), animations: 'disabled' });
    await dialog.getByRole('button', { name: labels.theme.cancel, exact: true }).click();
    await page.getByRole('button', { name: labels.theme.nightMode, exact: true }).click();
    await open();
    await expect(root).toHaveAttribute('data-palette', 'dark-violet');
    await expect(dialog.locator('.theme-settings-section').first()).toHaveCSS('color', 'rgb(243, 245, 247)');
    await page.screenshot({ path: test.info().outputPath(`theme-${language}-dark.png`), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog).toBeInViewport();
    await expect(dialog.getByRole('button', { name: labels.theme.apply, exact: true })).toBeInViewport();
    expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: test.info().outputPath(`theme-${language}-mobile.png`), animations: 'disabled' });
  });
}
