import { expect, test, type Page, type Locator } from '@playwright/test';
import fa from '../../src/locales/fa';
import en from '../../src/locales/en';
import { formatDateTime } from '../../src/utils/formatters';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
// The network boundary is replaced; the production connection, hook and form still run.
const mockedTransport = `
const feeds = [];
const pendingPictures = [];
let picturesReleased = false;
window.addEventListener('shahab-test-release-pictures', () => {
  picturesReleased = true;
  pendingPictures.splice(0).forEach(resolve => resolve('${png}'));
});
window.addEventListener('shahab-test-push', event => {
  const detail = event.detail;
  const feed = detail.previous ? feeds[0] : feeds[feeds.length - 1];
  if (!feed) return;
  feed.handlers.trafficPlateDetected?.({
    RequestId: feed.requestId, DoorId: feed.doorId, CameraId: feed.doorId === 8 ? '17' : '27',
    DetectorCameraId: feed.doorId === 8 ? 3 : 5, Direction: 'entry',
    EventId: 'shahab:' + detail.id, RecordId: String(detail.id), PlateText: detail.plate || '12ب34567',
    OccurredAtUtc: new Date(Date.now() - (detail.old ? 180000 : 0)).toISOString(), ServerTimeUtc: new Date().toISOString(),
    ...(detail.overrides || {})
  });
});
window.__shahabTestFeeds = feeds;
window.__shahabHistoryReads = 0;
window.__shahabPictureReads = [];
window.addEventListener('shahab-test-connection-error', () => feeds.at(-1)?.onError?.());
window.addEventListener('shahab-test-state', event => {
  const feed = feeds.at(-1);
  feed?.handlers.trafficDetectionState?.({ RequestId: feed.requestId, DoorId: feed.doorId, Code: event.detail });
});
export async function loadLegacySignalRClient() {
  return { hubConnection(url, options) {
    const feed = { handlers: {}, stopped: false, url, options };
    const proxy = {
      on(name, handler) { feed.handlers[name] = handler; return proxy; },
      async invoke(method, ...args) {
        if (method === 'getPicture') {
          window.__shahabPictureReads.push({ recordId: args[1], kind: args[2] });
          return picturesReleased ? '${png}' : new Promise(resolve => pendingPictures.push(resolve));
        }
        if (method === 'getHistory') {
          window.__shahabHistoryReads++;
          const now = new Date(); const start = new Date(now); start.setHours(0, 0, 0, 0);
          const end = new Date(start); end.setDate(end.getDate() + 1);
          const count = window.__shahabHistorySeed || 0;
          return { RequestId: args[1], DoorId: args[0], ServerTimeUtc: now.toISOString(), DayStartUtc: start.toISOString(), DayEndUtc: end.toISOString(),
            Items: Array.from({ length: Math.min(count, 100) }, (_, index) => ({ RequestId: args[1], DoorId: args[0], CameraId: args[0] === 8 ? '17' : '27',
              DetectorCameraId: args[0] === 8 ? 3 : 5, Direction: 'entry', EventId: 'shahab:' + (count - index), RecordId: String(count - index),
              PlateText: '12ب' + String(count - index).padStart(3, '0') + '67', OccurredAtUtc: new Date(now.getTime() - (index + 1) * 1000).toISOString(),
              ServerTimeUtc: now.toISOString(), IsRepeated: index % 5 === 0 })) };
        }
        feed.doorId = args[0]; feed.requestId = args[1];
        return { RequestId: args[1], DoorId: args[0], CameraCount: 2, ServerTimeUtc: new Date().toISOString() };
      }
    };
    feeds.push(feed);
    return { start: async () => {}, stop: () => { feed.stopped = true; }, createHubProxy: () => proxy,
      disconnected: () => {}, reconnecting: () => {}, reconnected: () => {}, error: handler => { feed.onError = handler; } };
  }};
}`;

async function push(page: Page, detail: Record<string, unknown>) {
  await page.evaluate(detail => window.dispatchEvent(new CustomEvent('shahab-test-push', { detail })), detail);
}

async function setup(page: Page, authorizationType = 2, language: 'fa' | 'en' = 'fa', dark = false, historySeed = 0) {
  await page.addInitScript(({ language, dark, historySeed }) => {
    (window as unknown as { __shahabHistorySeed: number }).__shahabHistorySeed = historySeed;
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-theme', dark ? 'dark' : 'light');
    localStorage.setItem('eos-parking-sidebar-collapsed', 'true');
  }, { language, dark, historySeed });
  await page.route('**/src/api/legacySignalRClient.ts', route => route.fulfill({ contentType: 'application/javascript', body: mockedTransport }));
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
  const state = { lookups: [] as string[], saved: [] as Record<string, unknown>[] };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    let value: unknown = [];
    if (url.pathname.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ مرکزی', IsCommercialParking: true }];
    if (url.pathname.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }, { Id: 9, Title: 'درب دوم' }];
    if (url.pathname.endsWith('/GetParkingDoor')) {
      const second = url.searchParams.get('doorId') === '9';
      value = { Id: second ? 9 : 8, DoorType: 2, EntryAuthorizaitionType: authorizationType,
        DtoViewEquipments: [
          { Key: { Id: second ? 27 : 17, DeviceType: 0, DeviceName: 'ورود', DetectionServerAddress: `db://cameraid=${second ? 5 : 3}` }, Value: 0 },
          { Key: { Id: second ? 28 : 18, DeviceType: 0, DeviceName: 'خروج', DetectionServerAddress: `db://cameraid=${second ? 6 : 4}` }, Value: 1 },
        ] };
    }
    if (url.pathname.endsWith('/GetCarTrafficInfo')) {
      const plate = url.searchParams.get('plate')!; state.lookups.push(plate);
      value = { DumpId: 0, Plate: plate, CarId: 10, MemberId: 11, MemberCode: '76101', MemberFullName: 'علی رضایی',
        CardId: 12, CardNumber: '1234', MemberTariffId: 13, ControlType: 0, ControlListActionType: 0, IsMemberBlock: false,
        MemberCars: [{ Id: 10, Plate: plate, Name: 'پژو', CarType: 0 }] };
    }
    if (url.pathname.endsWith('/GetParkingEquipments')) value = [{ Id: 17, DeviceName: 'دوربین ورود', DeviceType: 0, ConnectionType: 1, Ip: '192.168.1.20', Port: 554, DetectionServerAddress: state.saved.at(-1)?.DetectionServerAddress ?? '' }];
    if (url.pathname.endsWith('/SaveParkingEquipment')) { state.saved.push(route.request().postDataJSON()); value = 17; }
    if (url.pathname.endsWith('/rtspcamera/connect')) value = { status: { cameraId: route.request().postDataJSON().cameraId, state: 'Connected', viewerCount: 1 } };
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  return state;
}

async function openHistorySearch(page: Page, history: Locator, language: 'fa' | 'en' = 'fa') {
  const labels = language === 'fa' ? fa : en;
  await history.getByRole('button', { name: `${labels.grid.columnMenu}: ${labels.trafficGrid.plate}`, exact: true }).click();
  await page.getByRole('menuitem', { name: labels.grid.showColumnSearch, exact: true }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  return history.getByRole('textbox', { name: labels.trafficGrid.plate, exact: true });
}

test('bounds picture work during a burst, preserves every observation and does not rerender unchanged traffic grids', async ({ page }, testInfo) => {
  await setup(page);
  await page.addInitScript(() => { Object.assign(window, { __trafficGridRenders: 0 }); });
  let instrumented = false;
  await page.route('**/src/features/traffic/TrafficControlGrids.tsx', async route => {
    const response = await route.fetch();
    const body = await response.text();
    const signature = /function TrafficControlGrids\([\s\S]*?\) \{/;
    instrumented = signature.test(body);
    await route.fulfill({ response, body: body.replace(signature, '$& globalThis.__trafficGridRenders++;') });
  });
  let freezePolling = false;
  let releasePolling!: () => void;
  const pollingReady = new Promise<void>(resolve => { releasePolling = resolve; });
  await page.route('**/backend/api/traffic/GetTraffics?**', async route => {
    if (freezePolling) await pollingReady;
    await route.fulfill({ json: { ResponseResultType: 1, Values: Array.from({ length: 100 }, (_, index) => ({
      DumpId: index + 1, CarPlate: '12ب34567', MemberFullName: 'عضو آزمایشی', MemberCode: String(index + 1),
      EnterDateTime: '2026-11-12T08:00:00', ExitDateTime: null,
    })) } });
  });
  const counters = () => page.evaluate(() => {
    const state = window as unknown as { __shahabPictureReads: { recordId: string; kind: string }[]; __trafficGridRenders: number };
    return { pictures: state.__shahabPictureReads, gridRenders: state.__trafficGridRenders };
  });
  try {
    await page.goto('/home/parking/manual-traffic');
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads)).toBe(1);
    await expect(page.locator('.traffic-split-panel').first().locator('tbody tr')).toHaveCount(100);
    expect(instrumented).toBe(true);
    // Keep identification locked while every observation still updates the preview and history.
    const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
    await card.fill('1234');
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    freezePolling = true;
    const before = await counters();
    for (let id = 1000; id < 1020; id++) {
      await push(page, { id, plate: '12ب34567' });
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    }
    const during = await counters();
    expect(during.pictures).toHaveLength(2);
    expect(during.pictures.map(picture => picture.recordId)).toEqual(['1000', '1000']);
    expect(during.gridRenders).toBe(before.gridRenders);
    await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
    await expect(page.locator('.traffic-fullframe-preview img')).toBeVisible();
    await expect.poll(async () => (await counters()).pictures.length).toBe(4);
    const after = await counters();
    expect(after.pictures.map(picture => picture.recordId)).toEqual(['1000', '1000', '1019', '1019']);
    expect(after.gridRenders).toBe(before.gridRenders);
    await expect(card).toHaveValue('1234');
    await page.getByRole('button', { name: fa.plateHistory.title, exact: true }).hover();
    await expect(page.getByRole('region', { name: fa.plateHistory.title, exact: true }).locator('tbody tr')).toHaveCount(20);
    expect((await page.evaluate(() => (window as unknown as { __shahabTestFeeds: { stopped: boolean }[] }).__shahabTestFeeds)).filter(feed => !feed.stopped)).toHaveLength(1);
    await testInfo.attach('bounded-picture-work.json', { body: JSON.stringify({ rows: 100, observations: 20, before, during, after }), contentType: 'application/json' });
  } finally { releasePolling(); }
});

for (const timezoneId of ['Asia/Tehran', 'UTC']) {
  test.describe(`server exit time in ${timezoneId}`, () => {
    test.use({ timezoneId });

    for (const isCommercialParking of [true, false]) test(`uses server time for a detected exit and preserves the detection timestamp, commercial=${isCommercialParking}`, async ({ page }) => {
      const detectedAt = '2026-11-12T10:00:45.000Z';
      const serverExitTime = '2026-11-12T13:32:10';
      await page.clock.setFixedTime(new Date(detectedAt));
      await setup(page);
      await page.route('**/backend/api/Parking/Get', route => route.fulfill({ json: {
        ResponseResultType: 1, Values: [{ Id: 7, ParkingName: 'پارکینگ مرکزی', IsCommercialParking: isCommercialParking }],
      } }));
      const info = { DumpId: 42, Plate: '12ب34567', CarPlate: '12ب34567', CarId: 10,
        MemberId: 0, MemberCode: '', CardId: 12, CardNumber: '1234', MemberTariffId: 13,
        EnterDateTime: '2026-11-12T12:00:00', ExitDateTime: null, ExitPermission: true };
      const bill = { ...info, ExitDateTime: serverExitTime, PayType: 0, CommonCost: 5000 };
      const exits: Record<string, unknown>[] = [];
      let payments = 0;
      await page.route('**/backend/api/traffic/**', route => {
        const path = new URL(route.request().url()).pathname;
        let value: unknown;
        if (path.endsWith('/GetCarTrafficInfo')) value = info;
        else if (path.endsWith('/GetTraffics')) value = exits.length ? [bill] : [info];
        else if (path.endsWith('/DoExitDump')) {
          exits.push(route.request().postDataJSON());
          value = bill;
        } else if (path.endsWith('/PayDump')) {
          payments++;
          value = 'receipt-42';
        } else return route.fallback();
        return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
      });
      await page.goto('/home/parking/manual-traffic');
      await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
      await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorTypes[2]);
      await push(page, { id: 51, overrides: { CameraId: '18', DetectorCameraId: 4, Direction: 'exit' } });
      const latest = page.locator('.traffic-last-traffic-inline');
      const detectionText = new Date(detectedAt).toLocaleString('fa-IR', { timeZone: timezoneId });
      await expect(latest).toContainText(detectionText);
      const exit = page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation.exit, exact: true });
      await expect(exit).toBeEnabled();
      expect(exits).toHaveLength(0);
      await page.clock.setFixedTime(new Date('2026-11-12T10:02:10Z'));
      await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
      await exit.click();
      await expect.poll(() => exits.length).toBe(1);
      expect(exits[0]).toMatchObject({ Id: 42, ExitDoorId: 8, EnterDateTime: info.EnterDateTime, ExitDateTime: null, DoSave: true });
      expect(exits[0].DtoViewTrafficImages).toEqual([{ Id: 0, TrafficImage: png }]);
      const payment = page.getByRole('dialog', { name: fa.trafficPayment.title, exact: true });
      if (isCommercialParking) {
        await expect(payment).toContainText(formatDateTime(serverExitTime, 'fa'));
        await payment.getByRole('button', { name: fa.trafficPayment.close, exact: true }).click();
        expect(payments).toBe(0);
      } else {
        await expect(page.getByRole('alert').filter({ hasText: fa.trafficOperation.exitSettled })).toBeVisible();
        await expect(payment).toHaveCount(0);
        expect(payments).toBe(1);
      }
      await expect(page.locator('.traffic-split-panel').nth(1).locator('tbody tr')).toHaveCount(1);
      await expect(latest).toContainText(detectionText);
      await page.getByRole('button', { name: fa.plateHistory.title, exact: true }).hover();
      const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
      await expect(history.locator('tbody time')).toHaveAttribute('datetime', detectedAt);
    });
  });
}

for (const width of [1440, 390]) {
  test(`shows Shahab health and last heartbeat in a toolbar tooltip at ${width}px`, async ({ page }) => {
    const receivedAt = new Date('2026-11-12T10:00:00Z');
    await page.clock.setFixedTime(receivedAt);
    await page.setViewportSize({ width, height: 900 });
    await setup(page);
    await page.goto('/home/parking/manual-traffic');
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
    const panel = page.locator('.traffic-camera-panel');
    const statusLabel = (status: string) => fa.trafficLayout.shahabStatus.replace('{{status}}', status);
    const connected = panel.getByRole('button', { name: statusLabel(fa.trafficLayout.shahabStates.connected), exact: true });
    await expect(connected).toBeVisible();
    await connected.hover();
    const lastMessage = (date: Date) => fa.trafficLayout.shahabLastMessage.replace('{{time}}', formatDateTime(date.toISOString(), 'fa'));
    await expect(page.getByRole('tooltip')).toContainText(lastMessage(receivedAt));
    const heartbeatAt = new Date('2026-11-12T10:00:15Z');
    await page.clock.setFixedTime(heartbeatAt);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('shahab-test-state', { detail: 'connected' })));
    await expect(page.getByRole('tooltip')).toContainText(lastMessage(heartbeatAt));
    await expect(page.locator('.traffic-detection-plate')).toHaveCount(0);
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const preview = panel.locator('.traffic-camera-preview-box');
    await expect(preview).toBeVisible();
    const before = (await preview.boundingBox())!;
    await page.clock.setFixedTime(new Date('2026-11-12T10:00:20Z'));
    await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-connection-error')));
    const warning = panel.getByRole('button', { name: statusLabel(fa.trafficLayout.shahabStates.unavailable), exact: true });
    const errorTooltip = page.getByRole('tooltip').filter({ hasText: fa.trafficLayout.detectionError });
    await expect(warning).toBeVisible();
    await expect(panel.getByRole('alert')).toHaveCount(0);
    await expect(page.getByText(fa.trafficLayout.detectionError, { exact: true })).toHaveCount(0);
    const enlarge = panel.getByRole('button', { name: fa.trafficLayout.enlarge, exact: true });
    const enlargeBounds = (await enlarge.boundingBox())!;
    const warningBounds = (await warning.boundingBox())!;
    expect(Math.abs(warningBounds.y - enlargeBounds.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(warningBounds.x - enlargeBounds.x)).toBeLessThanOrEqual(40);
    const after = (await preview.boundingBox())!;
    expect(after.y).toBeCloseTo(before.y, 0);
    expect(after.height).toBeCloseTo(before.height, 0);
    await warning.hover();
    await expect(errorTooltip).toContainText(fa.trafficLayout.detectionError);
    await expect(errorTooltip).toContainText(lastMessage(heartbeatAt));
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await enlarge.focus();
    await page.keyboard.press('Tab');
    await expect(warning).toBeFocused();
    await expect(errorTooltip).toContainText(fa.trafficLayout.detectionError);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('shahab-test-state', { detail: 'connected' })));
    await expect(warning).toHaveCount(0);
    await expect(connected).toBeVisible();
    await expect(page.getByRole('tooltip').filter({ hasText: statusLabel(fa.trafficLayout.shahabStates.connected) })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('activates from the camera setting, fills before images, preserves ongoing work and releases a previous door', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const state = await setup(page);
  await page.goto('/home/parking/manual-traffic');
  const feeds = () => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number; stopped: boolean }[] }).__shahabTestFeeds ?? []);
  await expect.poll(async () => (await feeds()).filter(feed => feed.doorId === 8 && !feed.stopped).length).toBe(1);
  const latest = page.locator('.traffic-detection-plate');
  await push(page, { id: 21 });
  await expect(latest).toHaveText('12ب34567');
  await expect.poll(() => state.lookups).toContain('12ب34567');
  await expect(page.locator('.traffic-fullframe-preview img')).toHaveCount(0);
  const member = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await expect(member).toBeVisible();
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await card.fill('7777');
  const before = state.lookups.length;
  await push(page, { id: 22, plate: '22ب45678', overrides: { CameraId: '18', DetectorCameraId: 4, Direction: 'exit' } });
  await expect(latest).toHaveText('12ب34567');
  await expect(card).toBeFocused(); await expect(card).toHaveValue('7777');
  expect(state.lookups).toHaveLength(before);
  await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
  await expect(page.locator('.traffic-fullframe-preview img')).toBeVisible();
  await expect(latest).toHaveText('12ب34567');
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect.poll(() => state.lookups).toContain('22ب45678');
  await push(page, { id: 23, plate: '33ب56789', overrides: { CameraId: '18', DetectorCameraId: 4, Direction: 'exit' } });
  await expect(latest).toHaveText('22ب45678');
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect.poll(() => state.lookups).toContain('33ب56789');
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  const count = state.lookups.length;
  await push(page, { id: 24, plate: '33ب56789', overrides: { CameraId: '18', DetectorCameraId: 4, Direction: 'exit' } });
  await expect(latest).toHaveText('33ب56789');
  await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
  await page.getByRole('option', { name: 'درب دوم', exact: true }).click();
  await expect.poll(async () => (await feeds()).filter(feed => feed.doorId === 9 && !feed.stopped).length).toBe(1);
  expect((await feeds()).filter(feed => feed.doorId === 8).every(feed => feed.stopped)).toBe(true);
  await push(page, { id: 25, previous: true });
  await push(page, { id: 26, old: true });
  await expect(latest).toHaveCount(0);
  expect(state.lookups).toHaveLength(count);
  await push(page, { id: 27, plate: '44ب67890' });
  await expect(latest).toHaveText('44ب67890');
  await expect.poll(() => state.lookups).toContain('44ب67890');
  await expect(page.getByText(fa.trafficLayout.detectionConfigError, { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const commercial of [true, false]) test(`pins current plate photos and advances all waiting plates after entry and exit, commercial=${commercial}`, async ({ page }) => {
  await setup(page);
  const plates = ['12ب34567', '22ب45678', '33ب56789'];
  const lookups: string[] = [];
  const mutations: string[] = [];
  let releasePayment!: () => void;
  const paymentReady = new Promise<void>(resolve => { releasePayment = resolve; });
  await page.route('**/backend/api/Parking/Get', route => route.fulfill({ json: { ResponseResultType: 1,
    Values: [{ Id: 7, ParkingName: 'پارکینگ مرکزی', IsCommercialParking: commercial }] } }));
  await page.route('**/backend/api/traffic/**', async route => {
    const url = new URL(route.request().url());
    const plate = url.searchParams.get('plate') || plates[0];
    const info = { Plate: plate, CarPlate: plate, CarId: 10, MemberId: 0, MemberCode: '', CardId: 12, CardNumber: '1234',
      MemberTariffId: 13, DumpId: plate === plates[1] ? 42 : 0,
      EnterDateTime: plate === plates[1] ? '2026-11-13T08:00:00' : null, ExitDateTime: null, ExitPermission: true };
    let value: unknown = [];
    if (url.pathname.endsWith('/GetCarTrafficInfo')) { lookups.push(plate); value = info; }
    else if (url.pathname.endsWith('/CreateEnterDump')) {
      mutations.push('entry'); value = { Id: 41, EnterDateTime: '2026-11-13T08:30:00' };
    } else if (url.pathname.endsWith('/DoExitDump')) {
      mutations.push('exit'); value = { ...info, DumpId: 42, PayType: 0, CommonCost: 3000, ExitDateTime: '2026-11-13T09:00:00' };
    } else if (url.pathname.endsWith('/PayDump')) {
      mutations.push('payment'); await paymentReady; value = 'receipt-42';
    } else return route.fallback();
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorTypes[2]);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads)).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
  const latest = page.locator('.traffic-detection-plate');
  const actions = page.locator('.traffic-operation-actions');
  await push(page, { id: 201, plate: plates[0] });
  await expect.poll(() => lookups).toEqual([plates[0]]);
  await expect(actions.getByRole('button', { name: fa.trafficOperation.enter, exact: true })).toBeEnabled();
  await expect(page.locator('.traffic-fullframe-preview img')).toBeVisible();
  await push(page, { id: 202, plate: plates[1] });
  await push(page, { id: 203, plate: plates[2] });
  await push(page, { id: 204, plate: plates[0] });
  await push(page, { id: 205, plate: plates[1] });
  await expect(latest).toHaveText(plates[0]);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabPictureReads: { recordId: string }[] }).__shahabPictureReads.map(item => item.recordId)))
    .toEqual(['201', '201', '204', '204']);
  expect(lookups).toEqual([plates[0]]);
  await actions.getByRole('button', { name: fa.trafficOperation.enter, exact: true }).click();
  await expect.poll(() => lookups).toEqual([plates[0], plates[1]]);
  await expect(latest).toHaveText(plates[1]);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabPictureReads: { recordId: string }[] }).__shahabPictureReads.slice(-2).map(item => item.recordId)))
    .toEqual(['205', '205']);
  await actions.getByRole('button', { name: fa.trafficOperation.exit, exact: true }).click();
  const bill = page.getByRole('dialog', { name: fa.trafficPayment.title, exact: true });
  if (commercial) {
    await expect(bill).toBeVisible();
    expect(lookups).toEqual([plates[0], plates[1]]);
    await bill.getByRole('button', { name: fa.trafficPayment.confirmPay, exact: true }).click();
  } else await expect(bill).toHaveCount(0);
  await expect.poll(() => mutations).toEqual(['entry', 'exit', 'payment']);
  expect(lookups).toEqual([plates[0], plates[1]]);
  releasePayment();
  await expect(bill).toHaveCount(0);
  await expect.poll(() => lookups).toEqual(plates);
  await expect(latest).toHaveText(plates[2]);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabPictureReads: { recordId: string }[] }).__shahabPictureReads.slice(-2).map(item => item.recordId)))
    .toEqual(['203', '203']);
  await push(page, { id: 206, plate: plates[0] });
  await actions.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'پلاک - دو رقم اول', exact: true })).toHaveValue('');
  await expect(latest).toHaveCount(0);
  expect(lookups).toEqual(plates);
  expect(mutations).toEqual(['entry', 'exit', 'payment']);
});

test('a failed entry keeps the pinned plate and waits for a successful retry before advancing', async ({ page }) => {
  const state = await setup(page);
  let fail = true;
  let entries = 0;
  await page.route('**/backend/api/traffic/CreateEnterDump', route => {
    entries++;
    return route.fulfill({ json: fail ? { ResponseResultType: 7, Message: 'ثبت ورود انجام نشد' }
      : { ResponseResultType: 1, Values: { Id: 41, EnterDateTime: '2026-11-13T09:00:00' } } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect(page.getByRole('status', { name: fa.trafficLayout.doorType })).toContainText(fa.trafficLayout.doorTypes[2]);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads)).toBe(1);
  await push(page, { id: 301 });
  await expect.poll(() => state.lookups).toEqual(['12ب34567']);
  await push(page, { id: 302, plate: '22ب45678' });
  await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
  const enter = page.locator('.traffic-operation-actions').getByRole('button', { name: fa.trafficOperation.enter, exact: true });
  await enter.click();
  await expect(page.getByRole('alert').filter({ hasText: 'ثبت ورود انجام نشد' })).toBeVisible();
  await expect(page.locator('.traffic-detection-plate')).toHaveText('12ب34567');
  expect(state.lookups).toEqual(['12ب34567']);
  fail = false;
  await enter.click();
  await expect.poll(() => state.lookups).toEqual(['12ب34567', '22ب45678']);
  await expect(page.locator('.traffic-detection-plate')).toHaveText('22ب45678');
  expect(entries).toBe(2);
});

test('saves and clears Shahab activation using the existing camera detection setting', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/home/parking/equipment');
  await page.getByRole('row').filter({ hasText: 'دوربین ورود' }).click();
  await page.getByRole('button', { name: 'ویرایش', exact: true }).click();
  const setting = page.getByRole('textbox', { name: fa.trafficLayout.detectionSettingLabel, exact: true });
  await setting.fill('db://cameraid=0');
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(page.getByRole('dialog').getByText(fa.trafficLayout.detectionSettingError, { exact: true })).toBeVisible();
  expect(state.saved).toHaveLength(0);
  await setting.fill('db://cameraid=3');
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect.poll(() => state.saved.length).toBe(1);
  expect(state.saved[0].DetectionServerAddress).toBe('db://cameraid=3');
  await page.getByRole('row').filter({ hasText: 'دوربین ورود' }).click();
  await page.getByRole('button', { name: 'ویرایش', exact: true }).click();
  await setting.fill('');
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect.poll(() => state.saved.length).toBe(2);
  expect(state.saved[1].DetectionServerAddress).toBe('');
});

test('loads the last 100 detections of today after a reload without performing a vehicle lookup', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-11-12T10:00:00Z'));
  const state = await setup(page, 2, 'fa', false, 105);
  await page.goto('/home/parking/manual-traffic');
  const handle = page.getByRole('button', { name: fa.plateHistory.title, exact: true });
  const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
  const historyReads = () => page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads);
  await expect.poll(historyReads).toBe(1);
  await expect(history).toHaveCount(0);
  await handle.hover();
  await expect(history.locator('tbody tr')).toHaveCount(100);
  await expect(history.locator('tbody tr').first()).toContainText('12ب10567');
  await expect(history.locator('tbody tr').last()).toContainText('12ب00667');
  await expect(history.getByRole('columnheader')).toHaveCount(3);
  await expect(history.getByRole('button', { name: fa.plateHistory.all, exact: true })).toHaveCount(0);
  await expect(history.getByText(fa.plateHistory.repeated, { exact: true })).toHaveCount(0);
  expect(state.lookups).toEqual([]);
  await expect(page.getByRole('textbox', { name: 'شماره کارت', exact: true })).toHaveValue('');
  await page.reload();
  await expect.poll(historyReads).toBe(1);
  await expect(history).toHaveCount(0);
  await handle.hover();
  await expect(history.locator('tbody tr')).toHaveCount(100);
  expect(state.lookups).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('today-history-grid.png'), animations: 'disabled' });
});

test('preloads today’s history while camera metadata is still loading', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-12T10:00:00Z'));
  const state = await setup(page, 2, 'fa', false, 105);
  let releaseDevices!: () => void;
  const devicesReady = new Promise<void>(resolve => { releaseDevices = resolve; });
  await page.route('**/backend/api/Parking/GetParkingDoorDevices?*', async route => {
    await devicesReady;
    await route.fulfill({ json: { ResponseResultType: 1, Values: [] } });
  });
  try {
    await page.goto('/home/parking/manual-traffic');
    const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads)).toBe(1);
    await expect(history).toHaveCount(0);
    await page.getByRole('button', { name: fa.plateHistory.title, exact: true }).hover();
    await expect(history.locator('tbody tr')).toHaveCount(100);
    expect(state.lookups).toEqual([]);
    releaseDevices();
    await expect(page.locator('.traffic-camera-preview-box')).toBeVisible();
    await expect(history.locator('tbody tr')).toHaveCount(100);
    expect(await page.evaluate(() => (window as unknown as { __shahabHistoryReads: number }).__shahabHistoryReads)).toBe(1);
  } finally { releaseDevices(); }
});

test('retains 100 recent detections with repeated plates, grid search, freshness and guarded selection', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-11-12T10:00:00Z'));
  const state = await setup(page);
  await page.goto('/home/parking/manual-traffic');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await card.fill('7777');
  const handle = page.getByRole('button', { name: fa.plateHistory.title, exact: true });
  const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
  await expect(history).toHaveCount(0);
  await handle.hover();
  await expect(history).toBeVisible();
  await expect(card).toBeFocused();
  await page.evaluate(() => {
    for (let id = 1; id <= 105; id++) window.dispatchEvent(new CustomEvent('shahab-test-push', { detail: { id, plate: `12ب${String(id).padStart(3, '0')}67` } }));
    window.dispatchEvent(new CustomEvent('shahab-test-push', { detail: { id: 106, plate: '12ب10567' } }));
    window.dispatchEvent(new CustomEvent('shahab-test-push', { detail: { id: 106, plate: '12ب10567' } }));
  });
  await expect(history.locator('tbody tr')).toHaveCount(100);
  await expect(history.locator('tbody tr').first()).toHaveClass(/plate-history-repeated/);
  await expect(history.getByRole('columnheader')).toHaveCount(3);
  await expect(history.getByText(fa.plateHistory.repeated, { exact: true })).toHaveCount(0);
  await expect(history.locator('tbody tr').last()).toContainText('12ب00767');
  await page.screenshot({ path: testInfo.outputPath('plate-history-100.png') });
  expect(state.lookups).toEqual([]);
  await expect(card).toHaveValue('7777');
  await expect(card).toBeFocused();
  const list = history.locator('.app-data-grid-wrapper');
  await list.evaluate(element => { element.scrollTop = 330; });
  const readingRow = history.getByRole('row', { name: /12ب09567/ });
  const beforeArrival = (await readingRow.boundingBox())!;
  await push(page, { id: 108, plate: '22ب45667' });
  await expect(history.locator('tbody tr')).toHaveCount(100);
  await expect.poll(async () => (await readingRow.boundingBox())!.y).toBeCloseTo(beforeArrival.y, 0);
  const floating = page.locator('.plate-history-floating');
  await expect(floating).toHaveAttribute('data-freshness', 'recent');
  await page.clock.setFixedTime(new Date('2026-11-12T10:01:01Z'));
  await expect(floating).toHaveAttribute('data-freshness', 'aging');
  await page.clock.setFixedTime(new Date('2026-11-12T10:05:01Z'));
  await expect(floating).toHaveAttribute('data-freshness', 'old');
  const search = await openHistorySearch(page, history);
  await search.fill('۱۰۵');
  await expect(history.locator('tbody tr')).toHaveCount(2);
  await page.mouse.move(0, 0);
  await expect(history).toBeVisible();
  await push(page, { id: 107, plate: '22ب12367' });
  await expect(floating).toHaveAttribute('data-freshness', 'recent');
  await expect(search).toHaveValue('۱۰۵');
  await expect(history.locator('tbody tr')).toHaveCount(2);
  await history.locator('tbody tr').first().click();
  await expect(history.getByText(fa.plateHistory.replacePrompt.replace('{{plate}}', '12ب10567'))).toBeVisible();
  await history.getByRole('button', { name: fa.plateHistory.keepCurrent, exact: true }).click();
  await expect(card).toHaveValue('7777');
  expect(state.lookups).toEqual([]);
  await history.locator('tbody tr').first().click();
  await history.getByRole('button', { name: fa.plateHistory.replace, exact: true }).click();
  await expect.poll(() => state.lookups).toEqual(['12ب10567']);
  await expect(history).toHaveCount(0);
  const member = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
  await page.getByRole('option', { name: 'درب دوم', exact: true }).click();
  await handle.hover();
  await expect(history).toBeVisible();
  await expect(history.locator('tbody tr')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'نام درب', exact: true }).click();
  await page.getByRole('option', { name: 'درب اصلی', exact: true }).click();
  await handle.hover();
  await expect(history.locator('tbody tr')).toHaveCount(100);
});

for (const width of [1440, 390]) {
  test(`moves the floating history, restores its position and stays inside the viewport at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await setup(page);
    await page.addInitScript(() => localStorage.setItem('parking-plate-history-position', JSON.stringify({ x: 1300, y: 800 })));
    await page.goto('/home/parking/manual-traffic');
    const handle = page.getByRole('button', { name: fa.plateHistory.title, exact: true });
    const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
    const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
    await expect(handle).toBeVisible();
    await expect(card).toBeEnabled();
    const detectionBounds = (await page.locator('.traffic-last-traffic-inline').boundingBox())!;
    const defaultBounds = (await handle.boundingBox())!;
    expect(defaultBounds.x).toBe(0);
    expect(defaultBounds.width).toBe(36);
    expect(defaultBounds.y + defaultBounds.height / 2).toBeCloseTo(detectionBounds.y + detectionBounds.height / 2, 0);
    await expect(handle).toHaveText('');
    await card.focus();
    await handle.hover();
    await expect(history).toBeVisible();
    await expect(page.getByRole('tooltip').filter({ hasText: fa.plateHistory.title })).toBeVisible();
    await expect(card).toBeFocused();
    await push(page, { id: 1 });
    await expect(history.locator('tbody tr')).toHaveCount(1);
    const start = (await handle.boundingBox())!;
    await page.mouse.move(start.x + 12, start.y + 20);
    await page.mouse.down();
    await page.mouse.move(width - 240 + 12, 650 + 20, { steps: 12 });
    await page.mouse.up();
    await expect(card).toBeFocused();
    await expect(handle).toHaveAttribute('aria-expanded', 'true');
    const moved = (await handle.boundingBox())!;
    expect(moved.x).toBeCloseTo(width - 240, 0);
    expect(moved.y).toBeCloseTo(650, 0);
    const panel = (await history.boundingBox())!;
    expect(panel.y + panel.height <= moved.y || panel.y >= moved.y + moved.height
      || panel.x + panel.width <= moved.x || panel.x >= moved.x + moved.width).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('floating-plate-history.png') });
    await page.mouse.move(0, 0);
    await expect(history).toHaveCount(0);
    await page.reload();
    await expect(handle).toBeVisible();
    const restored = (await handle.boundingBox())!;
    expect(restored.x).toBeCloseTo(moved.x, 0);
    expect(restored.y).toBeCloseTo(moved.y, 0);
    await page.setViewportSize({ width: 320, height: 400 });
    await expect.poll(async () => (await handle.boundingBox())!.y).toBeLessThanOrEqual(352);
    const resized = (await handle.boundingBox())!;
    expect(resized.x).toBeGreaterThanOrEqual(0);
    expect(resized.x + resized.width).toBeLessThanOrEqual(320);
    await handle.focus();
    await expect(history).toBeVisible();
    await handle.press('ArrowLeft');
    expect((await handle.boundingBox())!.x).toBeLessThanOrEqual(resized.x);
    const bounds = (await history.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(8);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(312);
    expect(bounds.y).toBeGreaterThanOrEqual(8);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(392);
    await handle.press('Escape');
    await expect(history).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('history plate selection respects the door requirement for a card and does not register traffic', async ({ page }) => {
  const state = await setup(page, 3);
  await page.goto('/home/parking/manual-traffic');
  const handle = page.getByRole('button', { name: fa.plateHistory.title, exact: true });
  const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
  await handle.hover();
  await expect(history).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
  await push(page, { id: 1 });
  await expect(history.locator('tbody tr')).toHaveCount(1);
  expect(state.lookups).toEqual([]);
  await history.locator('tbody tr').first().click();
  await expect(history).toHaveCount(0);
  const card = page.getByRole('textbox', { name: 'شماره کارت', exact: true });
  await expect(card).toBeFocused();
  expect(state.lookups).toEqual([]);
  await card.fill('1234');
  await card.press('Enter');
  await expect.poll(() => state.lookups).toEqual(['12ب34567']);
});

test('keeps the floating history readable in English dark mode with reduced motion and removes it on navigation', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page, 2, 'en', true);
  await page.goto('/home/parking/manual-traffic');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
  const handle = page.getByRole('button', { name: en.plateHistory.title, exact: true });
  const history = page.getByRole('region', { name: en.plateHistory.title, exact: true });
  await expect(handle).toHaveText('');
  const edge = (await handle.boundingBox())!;
  expect(edge.x + edge.width).toBe(1024);
  await handle.hover();
  await expect(history).toBeVisible();
  await push(page, { id: 1 });
  await expect(history.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('.plate-history-floating')).toHaveAttribute('dir', 'ltr');
  await (await openHistorySearch(page, history, 'en')).fill('345');
  await expect(history.locator('tbody tr')).toHaveCount(1);
  expect(await page.locator('.plate-history-arrival').evaluate(element => getComputedStyle(element).opacity)).toBe('0');
  await page.screenshot({ path: testInfo.outputPath('floating-history-dark-ltr.png'), animations: 'disabled' });
  await page.goto('/home');
  await expect(page.locator('.plate-history-floating')).toHaveCount(0);
});

test('cancel skips the detection backlog and identifies only the latest pending plate', async ({ page }) => {
  const state = await setup(page);
  await page.goto('/home/parking/manual-traffic');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
  await push(page, { id: 201 });
  const member = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await expect(member).toBeVisible();
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  await push(page, { id: 202, plate: '22ب45678' });
  await push(page, { id: 203, plate: '33ب56789' });
  await expect(page.locator('.traffic-detection-plate')).toHaveText('12ب34567');
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect.poll(() => state.lookups).toEqual(['12ب34567', '33ب56789']);
  await expect(page.locator('.traffic-detection-plate')).toHaveText('33ب56789');
  await page.evaluate(() => window.dispatchEvent(new Event('shahab-test-release-pictures')));
  await expect(page.locator('.traffic-fullframe-preview img')).toBeVisible();
  const pictureIds = await page.evaluate(() => (window as unknown as { __shahabPictureReads: { recordId: string }[] }).__shahabPictureReads.map(item => item.recordId));
  expect(pictureIds).not.toContain('202');
  await expect(member).toBeVisible();
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect(page.locator('.traffic-detection-plate')).toHaveCount(0);
  expect(state.lookups).toEqual(['12ب34567', '33ب56789']);
  await page.getByRole('button', { name: fa.plateHistory.title, exact: true }).click();
  const history = page.getByRole('region', { name: fa.plateHistory.title, exact: true });
  await expect(history).toBeVisible();
  await expect(history.getByRole('row', { name: /22ب45678/ })).toBeVisible();
});

test('does not restore a cancelled detection when its pictures arrive later on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page); await page.goto('/home/parking/manual-traffic');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shahabTestFeeds?: { doorId: number }[] }).__shahabTestFeeds?.some(feed => feed.doorId === 8))).toBe(true);
  await push(page, { id: 41 });
  const member = page.getByRole('dialog', { name: fa.trafficIdentity.detailsTitle, exact: true });
  await expect(member).toBeVisible();
  await member.getByRole('button', { name: fa.trafficIdentity.close, exact: true }).click();
  await page.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  await expect(page.locator('.traffic-detection-plate')).toHaveCount(0);
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('shahab-test-release-pictures'));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expect(page.locator('.traffic-detection-plate')).toHaveCount(0);
  await expect(page.locator('.traffic-fullframe-preview img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
