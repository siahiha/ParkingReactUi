import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

async function prepare(page: Page, language: 'fa' | 'en' = 'fa') {
  await page.addInitScript(language => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  }, language);
  let requests = 0;
  let fail = false;
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  await page.route('**/Reports/Viewer.aspx?*', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body>Prepared viewer fixture</body></html>' }));
  await page.route(/(?:\/backend\/api\/|localhost:3001\/api\/)/, route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/Report/Viewer')) return route.fulfill({ json: { ResponseResultType: 1, Values: { Path: '/Reports/Viewer.aspx?id=prepared-report' } } });
    if (path.endsWith('/Report/Export')) return route.fulfill({ contentType: 'application/pdf', body: Buffer.from('JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8ID4+IC9Db250ZW50cyA0IDAgUiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDAgPj4Kc3RyZWFtCgplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDUgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjI2OAolJUVPRgo=', 'base64') });
    if (path.endsWith('/Report/Prepare')) {
      requests++;
      if (fail) return route.fulfill({ status: 500, json: { Message: 'Report test failure' } });
      return route.fulfill({ json: { ResponseResultType: 1, Values: { Id: 'prepared-report', Count: 160, PageCount: 6, ExpiresAt: '2099-01-01T00:00:00Z' } } });
    }
    const values = path.endsWith('/Parking/Get') ? [{ Id: 7, ParkingName: 'پارکینگ آزمایش', IsCommercialParking: true }] : [];
    return route.fulfill({ json: { ResponseResultType: 1, Values: values } });
  });
  return { requests: () => requests, fail: () => { fail = true; } };
}

const cases = [
  { key: 'member-report', width: 1280, height: 600, language: 'fa' },
  { key: 'traffic-reports-list', width: 1280, height: 600, language: 'fa' },
  { key: 'parking-income', width: 1280, height: 600, language: 'fa' },
  { key: 'management-free-parking-income', width: 1280, height: 600, language: 'fa' },
  { key: 'cargo-details', width: 1280, height: 600, language: 'fa' },
  { key: 'member-report', width: 390, height: 700, language: 'fa' },
  { key: 'member-report', width: 1280, height: 600, language: 'en' },
] as const;

for (const scenario of cases) test(`full-screen ${scenario.key} ${scenario.width}px ${scenario.language}`, async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const copy = scenario.language === 'fa' ? fa : en;
  const state = await prepare(page, scenario.language);
  await page.setViewportSize({ width: scenario.width, height: scenario.height });
  await page.goto(`/home/parking/${scenario.key}`);
  const show = page.getByRole('button', { name: scenario.language === 'fa' ? 'نمایش گزارش' : 'Show report', exact: true });
  await expect(show).toBeEnabled();
  const filterValues = () => page.locator('.report-filter-toolbar input').evaluateAll(elements => elements.map(element => (element as HTMLInputElement).value));
  const initialFilters = await filterValues();
  await show.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 30000 });
  await expect(dialog).toHaveClass(/MuiDialog-paperFullScreen/);
  const bounds = (await dialog.boundingBox())!;
  expect(bounds.x).toBeCloseTo(0, 0); expect(bounds.y).toBeCloseTo(0, 0);
  expect(bounds.width).toBe(scenario.width); expect(bounds.height).toBe(scenario.height);
  const viewer = dialog.locator('.report-preview-viewer');
  await expect(viewer.locator('iframe')).toHaveAttribute('src', /\/Reports\/Viewer\.aspx\?id=prepared-report$/);
  await expect(viewer.getByRole('button', { name: copy.reportPreview.stimulsoftView, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await viewer.getByRole('button', { name: copy.reportPreview.pdfView, exact: true }).click();
  await expect(viewer.locator('iframe')).toHaveAttribute('src', /^blob:/);
  const viewerBounds = (await viewer.boundingBox())!;
  expect(viewerBounds.y + viewerBounds.height).toBeLessThanOrEqual(scenario.height + 1);
  await page.screenshot({ path: testInfo.outputPath('full-screen-report.png') });
  await expect(dialog.getByRole('button', { name: copy.reportPreview.close, exact: true })).toBeInViewport();
  await expect(viewer.getByRole('button', { name: copy.reportPreview.print, exact: true })).toBeInViewport();
  await expect(viewer.getByRole('button', { name: copy.reportPreview.download, exact: true })).toBeInViewport();
  const requested = state.requests();
  await dialog.getByRole('button', { name: copy.reportPreview.close, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(show).toBeVisible();
  await page.getByRole('button', { name: copy.reportPreview.reopen, exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /\/Reports\/Viewer\.aspx\?id=prepared-report$/);
  await dialog.getByRole('button', { name: copy.reportPreview.pdfView, exact: true }).click();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /^blob:/);
  expect(state.requests()).toBe(requested);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await filterValues()).toEqual(initialFilters);
  if (scenario.key === 'member-report' && scenario.width === 1280 && scenario.language === 'fa') {
    await show.click();
    await expect(dialog).toBeVisible();
    expect(state.requests()).toBe(requested + 1);
    await dialog.getByRole('button', { name: copy.reportPreview.close, exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
  if (scenario.key === 'traffic-reports-list') {
    await page.getByRole('checkbox', { name: 'با تصویر', exact: true }).check();
    await expect(page.locator('.workspace-refresh-button')).toBeEnabled();
    await expect(dialog).toHaveCount(0);
    expect(state.requests()).toBe(requested);
  }
});

test('a report request error keeps the filters available without opening a preview', async ({ page }) => {
  const state = await prepare(page);
  state.fail();
  await page.goto('/home/parking/member-report');
  await page.getByRole('button', { name: 'نمایش گزارش', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'دریافت گزارش ناموفق بود' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'نمایش گزارش', exact: true })).toBeEnabled();
});
