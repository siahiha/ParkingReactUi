import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

async function setup(page: Page, language: 'fa' | 'en', dark: boolean, single = false) {
  await page.addInitScript(({ language, dark }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
    localStorage.setItem('eos-parking-theme', dark ? 'dark' : 'light');
  }, { language, dark });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', parkingServiceUrl: '' } }));
  const connections: { cameraId: string; viewerId: string }[] = [];
  const disconnections: { cameraId: string; viewerId: string }[] = [];
  const roiReads: string[] = [];
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'Parking' }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'Main gate' }];
    if (url.pathname.endsWith('/GetParkingDoor')) value = {
      Id: 8, DoorType: 2, EnteranceCamera: { Id: 17, DeviceName: 'North entry' },
      ...(!single ? { ExitCamera: { Id: 18, DeviceName: 'North exit' } } : {}),
    };
    if (url.pathname.endsWith('/rtspcamera/connect')) {
      const body = route.request().postDataJSON();
      connections.push(body);
      value = { status: { cameraId: body.cameraId, state: 'Connected', viewerCount: 1 } };
    }
    if (url.pathname.endsWith('/rtspcamera/disconnect')) disconnections.push({ cameraId: url.searchParams.get('cameraId')!, viewerId: url.searchParams.get('viewerId')! });
    if (url.pathname.endsWith('/rtspcamera/status')) value = { cameraId: url.searchParams.get('cameraId'), state: 'Disconnected', viewerCount: 0 };
    if (url.pathname.endsWith('/rtspcamera/rois')) roiReads.push(url.searchParams.get('cameraId')!);
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  return { connections, disconnections, roiReads };
}

for (const viewport of [
  { name: 'desktop-rtl', width: 1440, height: 900, language: 'fa' as const, dark: false },
  { name: 'short-ltr-dark', width: 1024, height: 600, language: 'en' as const, dark: true },
  { name: 'mobile-rtl', width: 390, height: 844, language: 'fa' as const, dark: false },
]) {
  test(`switches camera tabs and simultaneous views without reconnecting the surviving preview on ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const labels = viewport.language === 'fa' ? fa.trafficLayout : en.trafficLayout;
    const state = await setup(page, viewport.language, viewport.dark);
    const panel = page.locator('.traffic-camera-panel');
    const entry = panel.getByRole('group', { name: labels.entryCamera, exact: true });
    const exit = panel.getByRole('group', { name: labels.exitCamera, exact: true });
    await expect(entry).toBeVisible();
    await expect(exit).toHaveCount(0);
    await expect.poll(() => state.roiReads.filter(id => id === '17').length).toBeGreaterThan(0);
    const entryConnections = state.connections.filter(item => item.cameraId === '17').length;
    const entryDisconnections = state.disconnections.filter(item => item.cameraId === '17').length;
    const toggle = panel.getByRole('button', { name: labels.showBothCameras, exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const enlargeBounds = (await panel.getByRole('button', { name: labels.enlarge, exact: true }).boundingBox())!;
    const toggleBounds = (await toggle.boundingBox())!;
    expect(Math.abs(toggleBounds.y - enlargeBounds.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(toggleBounds.x - enlargeBounds.x)).toBeLessThanOrEqual(40);
    await toggle.click();
    await expect(entry).toBeVisible();
    await expect(exit).toBeVisible();
    await expect(panel.getByRole('tab')).toHaveCount(0);
    const tabs = panel.getByRole('button', { name: labels.showCameraTabs, exact: true });
    await expect(tabs).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => state.roiReads.filter(id => id === '18').length).toBeGreaterThan(0);
    expect(state.connections.filter(item => item.cameraId === '17')).toHaveLength(entryConnections);
    expect(state.disconnections.filter(item => item.cameraId === '17')).toHaveLength(entryDisconnections);
    expect(state.connections.find(item => item.cameraId === '17')!.viewerId).not.toBe(state.connections.find(item => item.cameraId === '18')!.viewerId);
    const entryBounds = (await entry.boundingBox())!;
    const exitBounds = (await exit.boundingBox())!;
    expect(Math.abs(entryBounds.y - exitBounds.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(entryBounds.width - exitBounds.width)).toBeLessThanOrEqual(1);
    expect(entryBounds.width).toBeGreaterThan(60);
    if (viewport.language === 'fa') expect(entryBounds.x).toBeGreaterThan(exitBounds.x);
    else expect(entryBounds.x).toBeLessThan(exitBounds.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel.screenshot({ path: testInfo.outputPath(`camera-simultaneous-${viewport.name}.png`), animations: 'disabled' });
    await tabs.click();
    await expect(exit).toHaveCount(0);
    await expect(entry).toBeVisible();
    await expect(panel.getByRole('tab', { name: labels.entry, exact: true })).toHaveAttribute('aria-selected', 'true');
    expect(state.connections.filter(item => item.cameraId === '17')).toHaveLength(entryConnections);
    await expect.poll(() => state.disconnections.filter(item => item.cameraId === '18').length).toBeGreaterThan(0);
    await panel.getByRole('tab', { name: labels.exit, exact: true }).click();
    await expect(exit).toBeVisible();
    await expect(entry).toHaveCount(0);
    await panel.getByRole('button', { name: labels.showBothCameras }).click();
    await expect(entry).toBeVisible();
    await panel.getByRole('button', { name: labels.showCameraTabs }).click();
    await expect(entry).toHaveCount(0);
    await expect(exit).toBeVisible();
    await expect(panel.getByRole('tab', { name: labels.exit, exact: true })).toHaveAttribute('aria-selected', 'true');
  });
}

test('shows a single camera without an unavailable layout switch', async ({ page }) => {
  await setup(page, 'fa', false, true);
  const panel = page.locator('.traffic-camera-panel');
  await expect(panel.getByRole('group', { name: fa.trafficLayout.entryCamera, exact: true })).toBeVisible();
  await expect(panel.getByRole('group', { name: fa.trafficLayout.exitCamera, exact: true })).toHaveCount(0);
  await expect(panel.getByRole('button', { name: fa.trafficLayout.showBothCameras })).toHaveCount(0);
  await expect(panel.getByRole('button', { name: fa.trafficLayout.enlarge })).toBeEnabled();
});
