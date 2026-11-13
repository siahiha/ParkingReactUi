import { afterEach, expect, it, vi } from 'vitest';
import { captureVideoFrame, detectionTrafficImage, readTrafficImageUrl } from './trafficImageCapture';
import { MAX_TRAFFIC_IMAGE_BYTES } from './trafficImages';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it('keeps valid detector bytes and reads blob artifacts without sending a URL as an image', async () => {
  expect(await readTrafficImageUrl(`data:image/png;base64,${png}`)).toBe(png);
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(Uint8Array.from(atob(png), value => value.charCodeAt(0))));
  expect(await readTrafficImageUrl('blob:detector')).toBe(png);
  expect(fetch).toHaveBeenCalledExactlyOnceWith('blob:detector');
  expect(await readTrafficImageUrl('https://unrelated.example/photo')).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('bounds detection wait and handles missing or failed artifacts', async () => {
  vi.useFakeTimers();
  const result = detectionTrafficImage(() => new Promise(() => undefined));
  await vi.advanceTimersByTimeAsync(5000);
  expect(await result).toBeNull();
  expect(await detectionTrafficImage(async () => null)).toBeNull();
  expect(await detectionTrafficImage(async () => { throw new Error('unavailable'); })).toBeNull();
});

it('captures a ready video, reduces oversized frames and respects the database byte limit', () => {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  const huge = `data:image/png;base64,${btoa('\x89PNG\r\n\x1a\n' + 'a'.repeat(MAX_TRAFFIC_IMAGE_BYTES))}`;
  const encode = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValueOnce(huge).mockReturnValue(`data:image/png;base64,${png}`);
  const video = document.createElement('video');
  Object.defineProperties(video, { readyState: { value: 2 }, paused: { value: false }, videoWidth: { value: 3840 }, videoHeight: { value: 2160 } });
  expect(captureVideoFrame(video)).toBe(png);
  expect(drawImage.mock.calls[0].slice(1)).toEqual([0, 0, 1600, 900]);
  expect(encode).toHaveBeenCalledTimes(2);
});

it('does not capture empty, paused or unreadable camera frames', () => {
  const video = document.createElement('video');
  expect(captureVideoFrame(video)).toBeNull();
  expect(captureVideoFrame(null)).toBeNull();
  Object.defineProperties(video, { readyState: { value: 2 }, paused: { value: false }, videoWidth: { value: 640 }, videoHeight: { value: 480 } });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => { throw new DOMException('tainted', 'SecurityError'); });
  expect(captureVideoFrame(video)).toBeNull();
});
