import { expect, test, type Locator, type Page } from '@playwright/test';
import en from '../../src/locales/en';
import fa from '../../src/locales/fa';

const reportGroupKeys = ['member-reports', 'traffic-reports', 'financial-reports', 'other-reports', 'management-reports'] as const;

async function prepareNavigation(page: Page, language: 'fa' | 'en', collapsed = false) {
  await page.addInitScript(({ language, collapsed }) => {
    sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({ user: {
      id: 7, userName: 'operator', currentParking: 7, permissions: [],
      permissionPart1: '18446744073709551615', permissionPart2: '18446744073709551615', canManageDashboard: false,
    } }));
    localStorage.setItem('locale', language);
    localStorage.setItem('eos-parking-sidebar-collapsed', String(collapsed));
  }, { language, collapsed });
  await page.route('**/config.json', route => route.fulfill({ json: { apiBaseUrl: '/backend' } }));
  await page.route('**/backend/api/**', route => route.fulfill({ json: {
    ResponseResultType: 1,
    Values: new URL(route.request().url()).pathname.endsWith('/Parking/Get')
      ? [{ Id: 7, ParkingName: 'Parking 7' }] : [],
  } }));
}

async function wheelToBottom(page: Page, scrollArea: Locator) {
  await expect(scrollArea).toBeVisible();
  await expect.poll(() => scrollArea.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);
  const bounds = (await scrollArea.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, -10_000);
  await expect.poll(() => scrollArea.evaluate(element => element.scrollTop)).toBe(0);
  await page.mouse.wheel(0, 10_000);
  await expect.poll(() => scrollArea.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
}

for (const scenario of [
  { name: 'short desktop RTL', width: 1024, language: 'fa', drawer: false },
  { name: 'short desktop LTR', width: 1024, language: 'en', drawer: false },
  { name: 'short mobile drawer', width: 390, language: 'fa', drawer: true },
] as const) {
  test(`scrolls the menu and opens the last report on ${scenario.name}`, async ({ page }, testInfo) => {
    const copy = scenario.language === 'fa' ? fa : en;
    await page.setViewportSize({ width: scenario.width, height: 600 });
    await prepareNavigation(page, scenario.language);
    await page.goto('/home/parking/member-report');
    await expect(page.locator('.home3-shell')).toHaveAttribute('data-language', scenario.language);
    if (scenario.drawer) {
      await page.locator('.home3-header').getByRole('button', { name: copy.home.navigation, exact: true }).click();
    }
    const navigation = page.locator(scenario.drawer ? '.home3-drawer .MuiDrawer-paper' : 'aside.home3-navigation');
    const scrollArea = navigation.locator('.home3-nav-scroll');
    for (const key of reportGroupKeys) {
      const branch = navigation.getByRole('button', { name: copy.homeMenu.groups[key], exact: true })
        .and(navigation.locator('.home3-nav-branch'));
      if (await branch.getAttribute('aria-expanded') !== 'true') await branch.click();
      await expect(branch).toHaveAttribute('aria-expanded', 'true');
    }
    const heading = navigation.locator('.home3-nav-heading');
    const headingBefore = (await heading.boundingBox())!;
    const windowScrollBefore = await page.evaluate(() => window.scrollY);
    await wheelToBottom(page, scrollArea);
    const finalReport = navigation.getByRole('button', { name: copy.homeMenu.items['management-free-parking-income'], exact: true });
    await expect(finalReport).toBeInViewport({ ratio: 1 });
    await expect(heading).toBeInViewport({ ratio: 1 });
    const headingAfter = (await heading.boundingBox())!;
    expect(Math.abs(headingAfter.y - headingBefore.y)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.scrollY)).toBe(windowScrollBefore);
    const scrollBounds = (await scrollArea.boundingBox())!;
    expect(scrollBounds.y + scrollBounds.height).toBeLessThanOrEqual(600);
    await page.screenshot({ path: testInfo.outputPath('scrolled-navigation.png') });
    await finalReport.click();
    await expect(page).toHaveURL(/\/home\/parking\/management-free-parking-income$/);
    await expect(page.locator('.home-workspace .workspace-resource-heading').getByText(copy.homeMenu.items['management-free-parking-income'], { exact: true })).toBeVisible();
    if (scenario.drawer) await expect(navigation).toBeHidden();
  });
}

test('keeps the last compact menu icon accessible on a very short desktop', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1024, height: 300 });
  await prepareNavigation(page, 'fa', true);
  await page.goto('/home/parking/floors');
  const navigation = page.locator('aside.home3-navigation');
  await expect(navigation).toHaveClass(/is-collapsed/);
  await wheelToBottom(page, navigation.locator('.home3-nav-scroll'));
  const reports = navigation.getByRole('button', { name: fa.home.reports, exact: true });
  const geometry = await navigation.evaluate(element => {
    const scrollArea = element.querySelector('.home3-nav-scroll')!;
    const compact = element.querySelector('.home3-nav-compact')!;
    const lastIcon = compact.lastElementChild!;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollArea: scrollArea.getBoundingClientRect().toJSON(),
      scrollHeight: scrollArea.scrollHeight,
      scrollTop: scrollArea.scrollTop,
      clientHeight: scrollArea.clientHeight,
      compact: compact.getBoundingClientRect().toJSON(),
      lastIcon: lastIcon.getBoundingClientRect().toJSON(),
    };
  });
  await page.screenshot({ path: testInfo.outputPath('scrolled-compact-navigation.png') });
  await testInfo.attach('compact-menu-geometry', { body: JSON.stringify(geometry, null, 2), contentType: 'application/json' });
  await expect(reports, `Last compact icon must fit fully in the scroll area: ${JSON.stringify(geometry)}`).toBeInViewport({ ratio: 1 });
  await reports.click();
  await expect(navigation).not.toHaveClass(/is-collapsed/);
  await expect(navigation.getByRole('button', { name: fa.home.reports, exact: true })).toHaveAttribute('aria-expanded', 'true');
});
