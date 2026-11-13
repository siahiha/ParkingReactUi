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
  await page.route(/(?:\/backend\/api\/|localhost:3001\/api\/)/, route => {
    const path = new URL(route.request().url()).pathname;
    if (/\/Report\//i.test(path)) {
      requests++;
      if (fail) return route.fulfill({ status: 500, json: { Message: 'Report test failure' } });
      const rows = path.endsWith('/GetMemberReport') ? Array.from({ length: 160 }, (_, index) => ({
        Id: index + 1, Code: String(index + 1), Name: 'عضو', Family: `آزمایشی ${index + 1}`, ParkingId: 7, IsActive: true, CardNumber: `900${index + 1}`,
      })) : [];
      return route.fulfill({ json: { ResponseResultType: 1, Values: rows } });
    }
    const values = path.endsWith('/Parking/Get') ? [{ Id: 7, ParkingName: 'پارکینگ آزمایش' }] : [];
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
  await expect.poll(() => viewer.locator('.stiJsViewerPageShadow').count()).toBeGreaterThan(0);
  const viewerBounds = (await viewer.boundingBox())!;
  expect(viewerBounds.y + viewerBounds.height).toBeLessThanOrEqual(scenario.height + 1);
  if (scenario.key === 'member-report' && scenario.width === 1280 && scenario.language === 'fa') {
    const currentPage = viewer.getByRole('textbox');
    await currentPage.fill('6');
    await currentPage.press('Enter');
    await expect(viewer.getByText('آزمایشی 160', { exact: true })).toBeVisible();
    await viewer.getByText('آزمایشی 160', { exact: true }).scrollIntoViewIfNeeded();
    await expect(viewer.getByText('آزمایشی 160', { exact: true })).toBeInViewport();
  }
  await page.screenshot({ path: testInfo.outputPath('full-screen-report.png') });
  await expect(dialog.getByRole('button', { name: copy.reportPreview.close, exact: true })).toBeInViewport();
  if (scenario.key === 'member-report') {
    const print = viewer.getByText(copy.reportViewerEngine.A_WebViewer.PrintReport, { exact: true }).filter({ visible: true });
    await print.scrollIntoViewIfNeeded();
    await expect(print).toBeInViewport();
    const save = viewer.getByText(copy.reportViewerEngine.A_WebViewer.SaveReport, { exact: true }).filter({ visible: true });
    await save.scrollIntoViewIfNeeded();
    await expect(save).toBeInViewport();
    await save.click();
    await expect(viewer.getByText(/PDF/).filter({ visible: true }).first()).toBeVisible();
    if (scenario.language === 'fa') {
      await expect(viewer.getByText('Print', { exact: true }).filter({ visible: true })).toHaveCount(0);
      await expect(viewer.getByText('Save', { exact: true }).filter({ visible: true })).toHaveCount(0);
    }
    await viewer.getByText(/PDF/).filter({ visible: true }).first().click();
    await expect(viewer.getByText(copy.reportViewerEngine.Export.Settings, { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(viewer.getByText(copy.reportViewerEngine.Report.RangeAll, { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(viewer.locator('.stiJsViewerForm').filter({ visible: true })).toHaveCSS('opacity', '1');
    await page.screenshot({ path: testInfo.outputPath('report-export-options.png') });
  }
  const requested = state.requests();
  await dialog.getByRole('button', { name: copy.reportPreview.close, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(show).toBeVisible();
  await page.getByRole('button', { name: copy.reportPreview.reopen, exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.locator('.report-preview-viewer .stiJsViewerPageShadow').count()).toBeGreaterThan(0);
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
  await expect(page.getByRole('alert').filter({ hasText: 'API request failed with status 500' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'نمایش گزارش', exact: true })).toBeEnabled();
});
