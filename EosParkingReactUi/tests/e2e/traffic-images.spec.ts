import { expect, test, type Page } from '@playwright/test';
import fa from '../../src/locales/fa';

const plate = '12ب34567';
const nextPlate = '22ب45678';
const transport = `
let feed;
const pictures = new Map();
const waiting = [];
let held = true;
window.addEventListener('traffic-image-release', () => { held = false; waiting.splice(0).forEach(done => done()); });
window.addEventListener('traffic-image-detect', ({detail}) => {
  pictures.set(String(detail.id), detail.image || null);
  feed.handlers.trafficPlateDetected?.({RequestId: feed.requestId, DoorId: 8,
    CameraId: detail.direction === 'exit' ? '18' : '17', DetectorCameraId: detail.direction === 'exit' ? 4 : 3,
    Direction: detail.direction || 'entry', EventId: 'shahab:' + detail.id, RecordId: String(detail.id), PlateText: detail.plate,
    OccurredAtUtc: new Date(Date.now() + detail.id).toISOString(), ServerTimeUtc: new Date().toISOString()});
});
export async function loadLegacySignalRClient() {
  return {hubConnection() {
    feed = {handlers:{}};
    const proxy = {on(name, handler) {feed.handlers[name] = handler;}, async invoke(method, ...args) {
      if (method === 'getPicture') {
        if (held) await new Promise(resolve => waiting.push(resolve));
        return pictures.get(String(args[1])) || null;
      }
      if (method === 'getHistory') {
        window.__trafficImagesSubscribed = true;
        const now = new Date(); const start = new Date(now); start.setHours(0,0,0,0); const end = new Date(start); end.setDate(end.getDate()+1);
        return {RequestId:args[1], DoorId:8, Items:[], ServerTimeUtc:now.toISOString(), DayStartUtc:start.toISOString(), DayEndUtc:end.toISOString()};
      }
      feed.requestId = args[1];
      return {RequestId:args[1], DoorId:8, CameraCount:2, ServerTimeUtc:new Date().toISOString()};
    }};
    return {start:async()=>{},stop:()=>{},createHubProxy:()=>proxy,disconnected:()=>{},reconnecting:()=>{},reconnected:()=>{},error:()=>{}};
  }};
}`;

// Replace only media transport. Real video playback and canvas frame capture still run.
const media = `
window.MediaMTXWebRTCReader = class {
  constructor(options) {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 48;
    const context = canvas.getContext('2d');
    const draw = () => {context.fillStyle = options.url.includes('/18/') ? 'rgb(0,0,255)' : 'rgb(255,0,0)';context.fillRect(0,0,64,48);};
    draw(); this.canvas = canvas; this.stream = canvas.captureStream(10); this.timer = setInterval(draw, 50);
    queueMicrotask(() => options.onTrack({streams:[this.stream]}));
  }
  close() {clearInterval(this.timer); this.stream.getTracks().forEach(track => track.stop());}
};
export {};
`;

async function setup(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: { id: 7, userName: 'operator', currentParking: 7, permissions: [], canManageDashboard: true } }));
    localStorage.setItem('locale', 'fa');
  });
  await page.route('**/src/api/legacySignalRClient.ts', route => route.fulfill({ contentType: 'application/javascript', body: transport }));
  await page.route('**/src/vendor/mediamtx-reader.js*', route => route.fulfill({ contentType: 'application/javascript', body: media }));
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend', anprSignalRUrl: '' } }));
  const saved: Record<string, unknown>[] = [];
  let entered = false; let exited = false;
  const connected = new Set<string>();
  const row = { DumpId: 42, Plate: plate, CarPlate: plate, CarId: 10, CardId: 12, CardNumber: '1234', MemberTariffId: 13,
    EnterDateTime: '2026-11-13T08:00:00', ExitDateTime: null, ExitPermission: true, PayType: 0, CommonCost: 3000 };
  await page.route('**/backend/api/**', route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let value: unknown = [];
    if (path.endsWith('/Parking/Get')) value = [{ Id: 7, ParkingName: 'پارکینگ', IsCommercialParking: true }];
    if (path.endsWith('/GetParkingDoors')) value = [{ Id: 8, Title: 'درب اصلی' }];
    if (path.endsWith('/GetParkingDoor')) value = { Id: 8, DoorType: 2, EntryAuthorizaitionType: 2,
      DtoViewEquipments: [17, 18].map((id, index) => ({ Key: { Id: id, DeviceType: 0, DeviceName: String(id), DetectionServerAddress: `db://cameraid=${index + 3}` }, Value: index })) };
    if (path.endsWith('/GetCarTrafficInfo')) {
      const selected = url.searchParams.get('plate') || plate;
      value = { ...row, Plate: selected, CarPlate: selected, DumpId: entered && selected === plate ? 42 : 0, EnterDateTime: entered && selected === plate ? row.EnterDateTime : null };
    }
    if (path.endsWith('/GetTraffics')) value = entered ? [{ ...row, ExitDateTime: exited ? '2026-11-13T10:00:00' : null }] : [];
    if (path.endsWith('/CreateEnterDump')) { saved.push(route.request().postDataJSON()); entered = true; value = { Id: 42 }; }
    if (path.endsWith('/DoExitDump')) { saved.push(route.request().postDataJSON()); exited = true; value = { ...row, ExitDateTime: '2026-11-13T10:00:00' }; }
    if (path.includes('/rtspcamera/')) {
      const cameraId = path.endsWith('/connect') ? String(route.request().postDataJSON().cameraId) : url.searchParams.get('cameraId') || '17';
      if (path.endsWith('/connect')) connected.add(cameraId);
      if (path.endsWith('/disconnect')) connected.delete(cameraId);
      if (path.endsWith('/connect') || path.includes('/status')) value = { status: { cameraId, state: connected.has(cameraId) ? 'Connected' : 'Disconnected', viewerCount: connected.has(cameraId) ? 1 : 0 }, webRtcUrl: `/api/rtspcamera/webrtc/${cameraId}/whep/viewer` };
    }
    return route.fulfill({ json: { ResponseResultType: 1, Values: value } });
  });
  await page.goto('/home/parking/manual-traffic');
  await expect.poll(() => page.evaluate(() => Boolean((window as unknown as { __trafficImagesSubscribed?: boolean }).__trafficImagesSubscribed))).toBe(true);
  return saved;
}

async function cameraReady(page: Page) {
  await expect.poll(() => page.locator('video').evaluateAll(videos => videos.some(video => video.readyState >= 2 && !video.paused))).toBe(true);
}
async function detectorImage(page: Page, color: string) {
  return page.evaluate(color => {
    const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 24;
    const context = canvas.getContext('2d')!; context.fillStyle = color; context.fillRect(0, 0, 32, 24);
    return canvas.toDataURL('image/png').split(',')[1];
  }, color);
}
async function detect(page: Page, detail: Record<string, unknown>) {
  await page.evaluate(detail => window.dispatchEvent(new CustomEvent('traffic-image-detect', { detail })), detail);
}
async function pixel(page: Page, base64: string) {
  return page.evaluate(async value => {
    const image = new Image(); image.src = `data:image/jpeg;base64,${value}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
  }, base64);
}
function savedImage(row: Record<string, unknown>): string {
  const images = row.DtoViewTrafficImages as { Id: number; TrafficImage: string }[];
  expect(images).toHaveLength(1); expect(images[0].Id).toBe(0);
  expect(images[0].TrafficImage).not.toMatch(/^(data:|blob:)/);
  return images[0].TrafficImage;
}

for (const detectedEntry of [true, false]) test(`persists current vehicle images with detection priority and matching camera fallback, detectedEntry=${detectedEntry}`, async ({ page }) => {
  const saved = await setup(page);
  const actions = page.locator('.traffic-operation-actions');
  await cameraReady(page);
  const image = await detectorImage(page, 'lime');
  if (detectedEntry) await detect(page, { id: 1, plate, image });
  else {
    await page.getByRole('textbox', { name: fa.trafficWorkspace.card, exact: true }).fill('1234');
    await page.getByRole('textbox', { name: fa.trafficWorkspace.card, exact: true }).press('Tab');
  }
  const enter = actions.getByRole('button', { name: fa.trafficOperation.enter, exact: true });
  await expect(enter).toBeEnabled();
  await enter.click();
  if (detectedEntry) {
    await detect(page, { id: 2, plate: nextPlate, image: await detectorImage(page, 'yellow') });
    expect(saved).toHaveLength(0);
    await page.evaluate(() => window.dispatchEvent(new Event('traffic-image-release')));
  }
  await expect.poll(() => saved.length).toBe(1);
  if (detectedEntry) {
    expect(savedImage(saved[0])).toBe(image);
    expect(saved[0].CarPlate).toBe(plate);
    await expect(page.locator('.traffic-detection-plate')).toHaveText(nextPlate);
    await actions.getByRole('button', { name: fa.trafficOperation.cancel, exact: true }).click();
  } else {
    const [red, green, blue] = await pixel(page, savedImage(saved[0]));
    expect(red).toBeGreaterThan(245); expect(green).toBeLessThan(10); expect(blue).toBeLessThan(10);
  }
  await page.locator('.traffic-split-panel').first().getByRole('button', { name: fa.trafficOperation.exit, exact: true }).click();
  await cameraReady(page);
  if (!detectedEntry) {
    await page.evaluate(() => window.dispatchEvent(new Event('traffic-image-release')));
    await detect(page, { id: 3, plate, image, direction: 'exit' });
    await expect(page.locator('.traffic-detection-plate')).toHaveText(plate);
  }
  await actions.getByRole('button', { name: fa.trafficOperation.exit, exact: true }).click();
  await expect.poll(() => saved.length).toBe(2);
  expect(saved[1]).toMatchObject({ Id: 42, ExitDoorId: 8 });
  if (!detectedEntry) expect(savedImage(saved[1])).toBe(image);
  else {
    const [red, green, blue] = await pixel(page, savedImage(saved[1]));
    expect(blue).toBeGreaterThan(245); expect(green).toBeLessThan(10); expect(red).toBeLessThan(10);
  }
  await expect(page.getByRole('dialog', { name: fa.trafficPayment.title, exact: true })).toBeVisible();
});
