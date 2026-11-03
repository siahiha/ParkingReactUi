import { expect, test, type Locator } from '@playwright/test';

function luminance(rgb: number[]) {
  const linear = rgb.slice(0, 3).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

function contrast(first: number[], second: number[]) {
  const a = luminance(first); const b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

async function readMapColors(map: Locator) {
  return map.evaluate(element => {
    const context = document.createElement('canvas').getContext('2d')!;
    const rgb = (color: string) => {
      context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const style = getComputedStyle(element);
    const card = style.getPropertyValue('--map-card');
    const states = [...element.querySelectorAll('.home3-space-tile')].slice(0, 5).map(tile => {
      const tone = getComputedStyle(tile).getPropertyValue('--space-tone');
      return {
        title: rgb(getComputedStyle(tile.querySelector('.home3-space-title')!).color),
        label: rgb(getComputedStyle(tile.querySelector('.home3-space-assignment')!).color),
        start: rgb(`color-mix(in srgb, ${tone} 8%, ${card})`),
      };
    });
    const connected = style.getPropertyValue('--map-connected');
    return { primary: rgb(style.getPropertyValue('--app-primary')), assigned: rgb(style.getPropertyValue('--map-assigned')),
      canvas: rgb(style.getPropertyValue('--map-canvas')), card: rgb(card), states,
      connected: { text: rgb(connected), background: rgb(`color-mix(in srgb, ${connected} 8%, ${card})`) } };
  });
}

const mockedTransport = `
export async function loadLegacySignalRClient() {
  return { hubConnection() {
    const callbacks = {};
    let stopped = false;
    const proxy = {
      on(name, handler) { callbacks[name] = handler; return proxy; },
      async invoke(method, parkingId, sectionId, page, pageSize, requestId) {
        const empty = new URLSearchParams(window.location.search).has('empty');
        const sections = empty ? [] : [{ id: 10, title: 'زون الف', spaceCount: 40 }, { id: 20, title: 'زون ب', spaceCount: 40 }];
        const all = Array.from({ length: empty ? 0 : 85 }, (_, i) => ({
          id: i + 1, title: 'P-' + String(i + 1).padStart(3, '0'), floorId: i < 40 ? 1 : 2,
          floorTitle: i < 40 ? 'همکف' : 'طبقه اول', sectionId: i < 40 ? 10 : i < 80 ? 20 : null,
          sectionTitle: i < 40 ? 'زون الف' : i < 80 ? 'زون ب' : null,
          kindTitle: 'عمومی', isActive: i % 9 !== 0, isAssigned: i % 3 === 0, occupancyStatus: 'Unknown'
        }));
        const items = sectionId === -1 ? all.filter(s => s.sectionId === null) : sectionId ? all.filter(s => s.sectionId === sectionId) : all;
        const snapshot = { RequestId: requestId, Page: {
          parkingId, sectionId, page, pageSize, totalCount: items.length, totalPages: Math.ceil(items.length / pageSize),
          unsectionedCount: empty ? 0 : 5, generatedAtUtc: new Date().toISOString(), sections, items: items.slice((page - 1) * pageSize, page * pageSize)
        }};
        window.addEventListener('map-test-push', () => {
          if (!stopped) callbacks.parkingMapUpdated?.({ ...snapshot, Page: { ...snapshot.Page, generatedAtUtc: new Date().toISOString(), items: snapshot.Page.items.map(s => ({ ...s, isAssigned: true })) } });
        });
        return snapshot;
      }
    };
    return { start: async () => {}, stop: () => { stopped = true; }, createHubProxy: () => proxy,
      disconnected: () => {}, reconnecting: () => {}, reconnected: () => {}, error: () => {} };
  }};
}`;

test.beforeEach(async ({ page }) => {
  await page.route('**/src/api/legacySignalRClient.ts', route => route.fulfill({ contentType: 'application/javascript', body: mockedTransport }));
  await page.route('**/api/Parking/GetInfoById*', route => route.fulfill({ json: { Values: {
    TotalParkSpaces: 85, OccupiedParkSpaceCount: 32, FreeParkSpaceCount: 53, DoorCount: 0,
    ServerDateTime: '2026-11-03T10:00:00Z', DeviceProcInfo: null, DoorStatuses: [],
  } } }));
});

test('pages and filters actual visible cards, and accepts a background push', async ({ page }) => {
  await page.goto('/tests/fixtures/parking-map-preview.html');
  const map = page.getByLabel('نقشه جایگاه‌ها', { exact: true });
  await expect(map.locator('.home3-space-tile')).toHaveCount(20);
  await expect(map.getByText('P-001', { exact: true })).toBeVisible();
  await map.getByRole('button', { name: 'صفحه بعد' }).click();
  await expect(map.getByText('P-021', { exact: true })).toBeVisible();
  await expect(map.getByText('P-001', { exact: true })).toHaveCount(0);
  await map.getByRole('combobox', { name: 'زون', exact: true }).click();
  await page.getByRole('option', { name: 'زون ب · ۴۰' }).click();
  await expect(map.getByText('P-041', { exact: true })).toBeVisible();
  await expect(map.locator('.home3-space-tile')).toHaveCount(20);
  await page.evaluate(() => window.dispatchEvent(new Event('map-test-push')));
  await expect(map.locator('.home3-space-tile.is-unassigned')).toHaveCount(0);
  await expect(map.locator('.home3-map-gate')).toHaveCount(0);
});

for (const config of [
  { name: 'desktop-rtl', width: 1440, height: 900, query: '' },
  { name: 'desktop-tall-rtl', width: 1920, height: 1080, query: '?expanded=1' },
  { name: 'desktop-short-rtl', width: 1366, height: 768, query: '?expanded=1' },
  { name: 'desktop-classic', width: 1280, height: 720, query: '?classic=1' },
  { name: 'mobile-rtl', width: 390, height: 844, query: '' },
  { name: 'desktop-dark-ltr', width: 1440, height: 900, query: '?language=en&dark=1' },
]) {
  test(`parking map layout ${config.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.goto(`/tests/fixtures/parking-map-preview.html${config.query}`);
    const map = page.locator('.home3-space-map');
    await expect(map.locator('.home3-space-tile')).toHaveCount(20);
    const grid = await map.locator('.home3-space-grid').evaluate(element => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
      rows: getComputedStyle(element).gridTemplateRows.split(' ').length,
    }));
    expect(grid).toEqual({ columns: 5, rows: 4 });
    const innerOverflow = await map.locator('.home3-space-map-body').evaluate(element => element.scrollHeight - element.clientHeight);
    expect(innerOverflow).toBeLessThanOrEqual(1);
    await expect(map.locator('.home3-map-pagination')).toBeVisible();
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(fits).toBe(true);
    const box = await map.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(361);
    if (config.width > 900) {
      const scroll = await page.evaluate(() => ({
        document: document.documentElement.scrollHeight - window.innerHeight,
        main: document.querySelector('.home3-main')!.scrollHeight - document.querySelector('.home3-main')!.clientHeight,
      }));
      expect(scroll.document).toBeLessThanOrEqual(1);
      expect(scroll.main).toBeLessThanOrEqual(1);
      const hero = await page.locator('.home3-intro').boundingBox();
      const overview = await page.locator('.home3-overview').boundingBox();
      expect(hero!.y + hero!.height).toBeLessThanOrEqual(overview!.y);
      const quickPanel = await page.locator('.home3-quick-panel').boundingBox();
      for (const button of await page.locator('.home3-quick-actions button').all()) {
        const bounds = await button.boundingBox();
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(quickPanel!.y + quickPanel!.height);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(config.height);
      }
      await map.locator('.home3-space-tile').first().click();
      expect((await map.boundingBox())!.height).toBe(box!.height);
      await map.locator('.home3-space-tile').first().click();
    }
    await map.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`${config.name}.png`), fullPage: true });
    await map.screenshot({ path: testInfo.outputPath(`${config.name}-map.png`) });
    await page.locator('.home3-quick-panel').screenshot({ path: testInfo.outputPath(`${config.name}-quick-actions.png`) });
  });
}

test('empty parking shows an explicitly illustrative 20-bay diagram without real selectable cards', async ({ page }, testInfo) => {
  await page.goto('/tests/fixtures/parking-map-preview.html?empty=1');
  const map = page.locator('.home3-space-map');
  await expect(map.getByRole('img', { name: 'نمای شماتیک جایگاه‌ها' })).toBeVisible();
  await expect(map.locator('.home3-schematic-bay')).toHaveCount(20);
  await expect(map.locator('.home3-space-tile')).toHaveCount(0);
  await expect(map.getByText('۰ جایگاه', { exact: true })).toBeVisible();
  await expect(map.getByRole('button', { name: 'صفحه بعد' })).toBeDisabled();
  expect((await map.boundingBox())!.height).toBeLessThanOrEqual(361);
  await map.screenshot({ path: testInfo.outputPath('empty-map.png') });
});

for (const mode of ['light', 'dark']) {
  test(`parking map theme ${mode}`, async ({ page }, testInfo) => {
    const accents: number[][] = [];
    for (const palette of ['blue', 'green', 'slate']) {
      await page.goto(`/tests/fixtures/parking-map-preview.html?palette=${palette}&dark=${mode === 'dark' ? 1 : 0}`);
      const map = page.locator('.home3-space-map');
      await expect(map.locator('.home3-space-tile')).toHaveCount(20);
      const colors = await readMapColors(map);
      expect(colors.assigned).toEqual(colors.primary);
      expect(contrast(colors.connected.text, colors.connected.background)).toBeGreaterThanOrEqual(4.5);
      accents.push(colors.assigned);
      if (mode === 'light') expect(luminance(colors.canvas)).toBeGreaterThan(.7);
      else expect(luminance(colors.canvas)).toBeLessThan(.15);
      for (const state of colors.states) {
        for (const background of [colors.card, state.start]) {
          expect(contrast(state.title, background)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(state.label, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
      await map.screenshot({ path: testInfo.outputPath(`${mode}-${palette}-map.png`) });
    }
    expect(new Set(accents.map(color => color.join(','))).size).toBe(3);
  });
}

test('switching theme in place keeps the selected bay, data and compact height', async ({ page }) => {
  await page.goto('/tests/fixtures/parking-map-preview.html');
  const map = page.locator('.home3-space-map');
  await expect(map.locator('.home3-space-tile')).toHaveCount(20);
  const tile = map.locator('.home3-space-tile.is-assigned').first();
  await tile.click();
  const original = await readMapColors(map);
  const originalBox = await map.boundingBox();
  await page.getByRole('button', { name: 'حالت شب', exact: true }).click();
  await expect(page.locator('.app-root')).toHaveClass(/app-theme-dark/);
  const dark = await readMapColors(map);
  expect(dark.canvas).not.toEqual(original.canvas);
  await expect(tile).toHaveAttribute('aria-pressed', 'true');
  expect((await map.boundingBox())!.height).toBe(originalBox!.height);
  await page.getByRole('button', { name: 'حالت روز', exact: true }).click();
  await expect(page.locator('.app-root')).toHaveClass(/app-theme-light/);
  expect((await readMapColors(map)).canvas).toEqual(original.canvas);
  await expect(tile).toHaveAttribute('aria-pressed', 'true');
});

test('empty schematic follows the dark green theme', async ({ page }, testInfo) => {
  await page.goto('/tests/fixtures/parking-map-preview.html?empty=1&dark=1&palette=green');
  const map = page.locator('.home3-space-map');
  await expect(map.getByRole('img', { name: 'نمای شماتیک جایگاه‌ها' })).toBeVisible();
  expect(luminance((await readMapColors(map)).canvas)).toBeLessThan(.15);
  await map.screenshot({ path: testInfo.outputPath('empty-dark-map.png') });
});
