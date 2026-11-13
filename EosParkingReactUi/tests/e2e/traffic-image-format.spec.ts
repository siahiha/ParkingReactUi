import { expect, test } from '@playwright/test';

test('normalizes native WebP detection photos for the backend JPEG compressor', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    // Exercise the production media adapter with a real browser WebP encoder/decoder.
    const modulePath = '/src/features/traffic/trafficImageCapture.ts';
    const { readTrafficImageUrl } = await import(/* @vite-ignore */ modulePath);
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    const context = canvas.getContext('2d')!; context.fillStyle = 'blue'; context.fillRect(0, 0, 640, 480);
    const webp = canvas.toDataURL('image/webp');
    const base64 = await readTrafficImageUrl(webp);
    const signature = [...atob(base64).slice(0, 3)].map(byte => byte.charCodeAt(0));
    const image = new Image(); image.src = `data:image/jpeg;base64,${base64}`; await image.decode();
    return { inputFormat: webp.split(';')[0], signature, width: image.width, height: image.height };
  });
  expect(result).toEqual({ inputFormat: 'data:image/webp', signature: [255, 216, 255], width: 640, height: 480 });
});
