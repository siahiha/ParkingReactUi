import { expect, test } from '@playwright/test';

for (const config of [
  { name: 'light-rtl', width: 1440, query: '' },
  { name: 'dark-rtl', width: 1440, query: '&dark=1&palette=green' },
  { name: 'light-ltr', width: 1440, query: '&language=en' },
  { name: 'dark-ltr', width: 1440, query: '&language=en&dark=1' },
  { name: 'mobile-rtl', width: 390, query: '' },
]) {
  test(`parking directory cards ${config.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: config.width, height: 900 });
    const english = config.query.includes('language=en');
    await page.route('**/api/Parking/Get', route => route.fulfill({ json: { Values: [
      { Id: 7, ParkingName: english ? 'Central Parking' : 'پارکینگ مرکزی', Address: english ? 'Main street, opposite the city park' : 'خیابان ولیعصر، روبه‌روی پارک ملت', PhonNumber: '02122001234', IsCommercialParking: true, HasUserShifts: true },
      { Id: 12, ParkingName: english ? 'West Terminal' : 'پارکینگ پایانه غرب', Address: english ? 'West terminal, entrance two' : 'میدان آزادی، پایانه غرب، ورودی شماره دو', PhonNumber: '02144005678', IsCommercialParking: false, HasUserShifts: true },
      { Id: 28, ParkingName: english ? 'North Campus' : 'پارکینگ پردیس شمالی', Address: '', PhonNumber: '', IsCommercialParking: true, HasUserShifts: false },
      { Id: 31, ParkingName: english ? 'Long parking name for the international exhibition and convention center' : 'پارکینگ مجموعه نمایشگاه‌های بین‌المللی و مرکز همایش‌های شهر', Address: english ? 'A long address to check wrapping on smaller screens without pushing actions outside the card' : 'بزرگراه شهید چمران، مسیر شمال به جنوب، ورودی مجموعه نمایشگاه‌های بین‌المللی، جنب مرکز همایش‌ها', PhonNumber: '02112345678', IsCommercialParking: false, HasUserShifts: false },
    ] } }));
    await page.goto(`/tests/fixtures/parking-map-preview.html?directory=1${config.query}`);
    const cards = page.locator('.parking-directory-card--atelier');
    await expect(cards).toHaveCount(4);
    await expect(cards.first().getByRole('heading')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const card of await cards.all()) {
      const bounds = (await card.boundingBox())!;
      for (const button of await card.getByRole('button').all()) {
        const box = (await button.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(bounds.x);
        expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
      }
    }
    await page.screenshot({ path: testInfo.outputPath(`${config.name}-directory.png`), fullPage: true });
    const box = (await cards.first().boundingBox())!;
    await page.screenshot({ path: testInfo.outputPath(`${config.name}-card.png`), clip: box });
    await cards.first().getByRole('button').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').screenshot({ path: testInfo.outputPath(`${config.name}-editor-popup.png`), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await cards.first().getByRole('button').last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(cards).toHaveCount(4);
  });
}
