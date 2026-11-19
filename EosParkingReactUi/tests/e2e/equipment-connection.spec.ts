import { expect, test, type Page, type Route } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';

type State = { requests: string[]; bodies: Record<string, unknown>[]; pending: Route[]; defer: boolean; status: string; httpStatus: number };
async function setup(page: Page, language: 'fa' | 'en' = 'en', deviceType = 1): Promise<State> {
  await page.addInitScript(language => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  }, language);
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
  const state: State = { requests: [], bodies: [], pending: [], defer: false, status: 'connected', httpStatus: 200 };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url()); state.requests.push(url.pathname + url.search);
    if (url.pathname.endsWith('/Equipment/TestConnection')) {
      state.bodies.push(route.request().postDataJSON());
      if (state.defer) { state.pending.push(route); return; }
      return route.fulfill({ status: state.httpStatus, json: { Status: state.status, Connected: state.status === 'connected', CheckedAtUtc: new Date().toISOString() } });
    }
    if (url.pathname.endsWith('/rtspcamera/connect')) {
      state.bodies.push(route.request().postDataJSON());
      return route.fulfill({ json: { status: { cameraId: '42', state: state.status === 'connected' ? 'Connected' : 'Failed', viewerCount: 1 } } });
    }
    if (url.pathname.endsWith('/rtspcamera/status')) {
      return route.fulfill({ json: { cameraId: '42', state: 'Disconnected', viewerCount: 0 } });
    }
    let Values: unknown = [];
    if (url.pathname === '/backend/api/Parking/Get') Values = [{ Id: 7, ParkingName: 'Parking', IsCommercialParking: true, HasUserShifts: false }];
    if (url.pathname.endsWith('/GetParkingEquipments')) Values = [{ Id: 42, ParkingId: 7, DeviceName: 'Entry gate', DeviceType: deviceType, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, Disabled: false }];
    if (url.pathname.endsWith('/SaveParkingEquipment')) Values = 42;
    if (url.pathname.endsWith('/DeleteEquipmentById')) Values = true;
    return route.fulfill({ json: { ResponseResultType: 1, Values } });
  });
  await page.goto('/home/parking/equipment');
  await page.getByRole('row').filter({ hasText: 'Entry gate' }).click();
  await page.getByRole('button', { name: (language === 'fa' ? fa : en).equipment.edit, exact: true }).click();
  return state;
}

for (const language of ['fa', 'en'] as const) {
  test(`starts the camera test on the first click and releases it when closed (${language})`, async ({ page }) => {
    const labels = language === 'fa' ? fa : en;
    const state = await setup(page, language, 0);
    const dialog = page.getByRole('dialog');
    expect(state.bodies).toHaveLength(0);
    await dialog.getByRole('button', { name: labels.equipment.testCameraConnection, exact: true }).click();
    await expect(dialog.getByRole('button', { name: labels.cameraPreview.disconnect, exact: true })).toBeVisible();
    expect(state.bodies).toEqual([{ cameraId: '42', viewerId: expect.any(String), streamMode: 'WebRTC' }]);
    const disconnects = state.requests.filter(path => path.includes('/rtspcamera/disconnect')).length;
    await dialog.getByRole('button', { name: labels.equipment.cancel, exact: true }).click();
    await expect.poll(() => state.requests.filter(path => path.includes('/rtspcamera/disconnect')).length).toBe(disconnects + 1);
    expect(state.requests.some(path => /GetParkingDoors|SaveParkingEquipment/.test(path))).toBe(false);
  });

  test(`tests the edited configuration with one independent request (${language})`, async ({ page }) => {
    const labels = language === 'fa' ? fa : en;
    const state = await setup(page, language);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', { name: labels.equipment.deviceAddress, exact: true }).fill('192.0.2.11');
    await dialog.getByRole('button', { name: labels.equipmentTest.start, exact: true }).click();
    const result = dialog.getByRole('img', { name: labels.equipmentTest.connected });
    await expect(result).toBeVisible();
    expect(state.bodies).toHaveLength(1);
    expect(state.bodies[0]).toMatchObject({ ParkingId: 7, DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.11', Port: 1001 });
    expect(state.bodies[0]).not.toHaveProperty('Id');
    expect(state.bodies[0]).not.toHaveProperty('DoorId');
    expect(state.requests.some(path => /GetParkingDoors|SaveParkingEquipment|Traffic\/|OpenGate/.test(path))).toBe(false);
    await dialog.getByRole('button', { name: labels.equipmentTest.start, exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(result).toBeFocused();
    await expect(page.getByRole('tooltip', { name: labels.equipmentTest.connected })).toBeVisible();
  });
}

test('tests a new device before saving or assigning a door', async ({ page }) => {
  const state = await setup(page);
  await page.getByRole('dialog').getByRole('button', { name: en.equipment.cancel, exact: true }).click();
  await page.getByRole('button', { name: en.equipment.new, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: en.equipment.deviceType, exact: true }).click();
  await page.getByRole('option', { name: en.equipment.gate, exact: true }).click();
  await dialog.getByRole('textbox', { name: en.equipment.deviceAddress, exact: true }).fill('192.0.2.12');
  await dialog.getByRole('button', { name: en.equipmentTest.start, exact: true }).click();
  await expect(dialog.getByRole('img', { name: en.equipmentTest.connected })).toBeVisible();
  expect(state.bodies).toHaveLength(1);
  expect(state.bodies[0].Ip).toBe('192.0.2.12');
  expect(state.requests.some(path => /GetParkingDoors|SaveParkingEquipment/.test(path))).toBe(false);
});

test('keeps unsupported devices separate', async ({ page }) => {
  const state = await setup(page, 'en', 6);
  await expect(page.getByRole('button', { name: en.equipmentTest.start, exact: true })).toBeDisabled();
  await expect(page.getByText(en.equipmentTest.unsupported)).toBeVisible();
  expect(state.bodies).toHaveLength(0);
});

test('cancels the request and permits testing changed settings without saving', async ({ page }) => {
  const state = await setup(page); state.defer = true;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: en.equipmentTest.start, exact: true }).click();
  await expect(dialog.getByRole('button', { name: en.equipmentTest.cancel })).toBeVisible();
  await expect.poll(() => state.bodies.length).toBe(1);
  await dialog.getByRole('button', { name: en.equipmentTest.cancel }).click();
  await expect(dialog.getByRole('img', { name: en.equipmentTest.cancelled })).toBeVisible();
  await dialog.getByRole('textbox', { name: en.equipment.deviceAddress, exact: true }).fill('192.0.2.13');
  state.defer = false; state.status = 'disconnected';
  await dialog.getByRole('button', { name: en.equipmentTest.start, exact: true }).click();
  await expect(dialog.getByRole('img', { name: en.equipmentTest.disconnected })).toBeVisible();
  expect(state.bodies).toHaveLength(2);
  expect(state.bodies[1].Ip).toBe('192.0.2.13');
  await state.pending[0].fulfill({ json: { Status: 'connected', Connected: true, CheckedAtUtc: new Date().toISOString() } }).catch(() => undefined);
  await expect(dialog.getByRole('img', { name: en.equipmentTest.connected })).toHaveCount(0);
});

test('deletes with the documented equipmentId query parameter', async ({ page }) => {
  const state = await setup(page);
  await page.getByRole('dialog').getByRole('button', { name: en.equipment.cancel, exact: true }).click();
  await page.getByRole('button', { name: en.equipment.delete, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: en.equipment.delete, exact: true }).click();
  await expect.poll(() => state.requests.filter(path => path.includes('/DeleteEquipmentById'))).toEqual(['/backend/api/Parking/DeleteEquipmentById?equipmentId=42']);
});
