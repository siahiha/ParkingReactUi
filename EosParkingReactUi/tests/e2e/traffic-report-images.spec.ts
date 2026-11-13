import { expect, test } from '@playwright/test';

test('renders each traffic report image from its own API row when WithImage is selected', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'fa');
  });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  const requests: Record<string, unknown>[] = [];
  let images: string[] = [];
  await page.route('**/backend/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    let values: unknown = [];
    if (path.endsWith('/Parking/Get')) values = [{ Id: 7, ParkingName: 'پارکینگ آزمایش' }];
    if (path.endsWith('/GetTrafficReport')) {
      const body = route.request().postDataJSON(); requests.push(body);
      values = [0, 1, 2].map(index => ({
        CarPlate: ['12ب34567', '22ب45678', '33ب56789'][index], CardNumber: `10${index}`, MemberCode: '', CarType: 0,
        EnterDateTime: '2026-11-13T08:00:00', ExitDateTime: null,
        EnterImage: body.Filters.WithImage ? images[index] ?? null : null,
      }));
    }
    return route.fulfill({ json: { ResponseResultType: 1, Values: values } });
  });
  await page.goto('/home/parking/traffic-reports-list');
  const show = page.getByRole('button', { name: 'نمایش گزارش', exact: true });
  await expect(show).toBeEnabled({ timeout: 30000 });
  images = await page.evaluate(() => ['red', 'blue'].map(color => {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 32;
    const context = canvas.getContext('2d')!; context.fillStyle = color; context.fillRect(0, 0, 64, 32);
    return canvas.toDataURL('image/png').split(',')[1];
  }));
  const withImage = page.getByRole('checkbox', { name: 'با تصویر', exact: true });
  await withImage.check();
  await show.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 30000 });
  expect((requests[0].Filters as Record<string, unknown>).WithImage).toBe(true);
  const imagePixels = () => dialog.locator('.stiJsViewerPageShadow img').evaluateAll(async elements => {
    return Promise.all(elements.map(async element => {
      const image = element as HTMLImageElement;
      try {
        await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
        const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      } catch { return null; }
    }));
  });
  await expect.poll(imagePixels, { timeout: 20000 }).toContainEqual([255, 0, 0]);
  await expect.poll(imagePixels).toContainEqual([0, 0, 255]);
  await page.screenshot({ path: testInfo.outputPath('traffic-report-with-images.png') });
  await dialog.getByRole('button', { name: 'بستن گزارش', exact: true }).click();
  await withImage.uncheck();
  await show.click();
  await expect(dialog).toBeVisible({ timeout: 30000 });
  expect((requests[1].Filters as Record<string, unknown>).WithImage).toBe(false);
  await expect.poll(() => dialog.locator('.stiJsViewerPageShadow').count()).toBeGreaterThan(0);
  expect(await imagePixels()).not.toContainEqual([255, 0, 0]);
  expect(await imagePixels()).not.toContainEqual([0, 0, 255]);
});
