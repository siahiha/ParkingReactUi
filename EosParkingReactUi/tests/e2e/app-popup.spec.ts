import { expect, test } from '@playwright/test';

for (const config of [
  { name: 'light-rtl', query: '', width: 1440 },
  { name: 'light-green', query: '&palette=green', width: 1440 },
  { name: 'light-slate', query: '&palette=slate', width: 1440 },
  { name: 'dark-rtl', query: '&dark=1&palette=green', width: 1440 },
  { name: 'dark-blue', query: '&dark=1', width: 1440 },
  { name: 'dark-slate', query: '&dark=1&palette=slate', width: 1440 },
  { name: 'light-ltr', query: '&language=en', width: 1440 },
  { name: 'mobile-dark', query: '&dark=1', width: 390 },
]) {
  test(`shared popup ${config.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: config.width, height: 800 });
    await page.goto(`/tests/fixtures/parking-map-preview.html?popup=1${config.query}`);
    const styles = [];
    for (const kind of ['crud', 'confirm', 'custom']) {
      const opener = page.getByTestId(`open-${kind}`);
      await opener.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toHaveClass(/app-popup-paper/);
      await expect(dialog).toHaveAccessibleName(/.+/);
      const buttons = dialog.locator('.MuiDialogActions-root button');
      await expect(buttons).toHaveCount(kind === 'custom' ? 3 : 2);
      styles.push(await dialog.evaluate(element => {
        const paper = getComputedStyle(element);
        const title = getComputedStyle(element.querySelector('.MuiDialogTitle-root')!);
        const footer = getComputedStyle(element.querySelector('.MuiDialogActions-root')!);
        return [paper.backgroundColor, paper.borderRadius, title.backgroundColor, title.padding, footer.backgroundColor, footer.padding];
      }));
      if (kind === 'custom') {
        await dialog.getByRole('button', { name: 'Preview', exact: true }).click();
        await expect(page.getByTestId('popup-result')).toHaveText('preview');
        await dialog.getByRole('checkbox', { name: 'Busy' }).check();
        for (const button of await buttons.all()) await expect(button).toBeDisabled();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeVisible();
        await page.mouse.click(2, 2);
        await expect(dialog).toBeVisible();
        await dialog.getByRole('checkbox', { name: 'Busy' }).uncheck();
        await page.evaluate(() => document.fonts.ready);
        await dialog.screenshot({ path: testInfo.outputPath(`${config.name}-popup.png`), animations: 'disabled' });
        const contrast = await dialog.evaluate(element => {
          const canvas = document.createElement('canvas').getContext('2d')!;
          const luminance = (color: string) => {
            canvas.clearRect(0, 0, 1, 1); canvas.fillStyle = color; canvas.fillRect(0, 0, 1, 1);
            const rgb = [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
            return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
          };
          const paper = luminance(getComputedStyle(element).backgroundColor);
          const title = luminance(getComputedStyle(element.querySelector('.MuiDialogTitle-root')!).color);
          const label = element.querySelector('.MuiInputLabel-root')!;
          const labelColor = luminance(getComputedStyle(label).color);
          const labelBackground = luminance(getComputedStyle(label).backgroundColor);
          const ratio = (a: number, b: number) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          return { title: ratio(paper, title), label: ratio(labelColor, labelBackground), paper };
        });
        expect(contrast.title).toBeGreaterThanOrEqual(4.5);
        expect(contrast.label).toBeGreaterThanOrEqual(4.5);
        if (config.query.includes('dark=1')) expect(contrast.paper).toBeLessThan(.15);
        else expect(contrast.paper).toBeGreaterThan(.7);
      }
      const bounds = (await dialog.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(config.width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(800);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(opener).toBeFocused();
    }
    expect(styles[1]).toEqual(styles[0]);
    expect(styles[2]).toEqual(styles[0]);
  });
}
