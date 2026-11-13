import { MAX_TRAFFIC_IMAGE_BYTES, imageMime, trafficImage } from './trafficImages';

export type CameraFrameCapture = { capture: () => string | null };
export type TrafficCameraCapture = { capture: (direction: 'entry' | 'exit') => string | null };

/** Canvas is used only to read media pixels, never to manage React's visible UI. */
function encodeFrame(source: CanvasImageSource, width: number, height: number): string | null {
  if (width <= 0 || height <= 0) return null;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  let scale = Math.min(1, 1600 / Math.max(width, height));
  while (Math.min(width, height) * scale >= 16) {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.75, 0.55]) {
      const image = trafficImage(canvas.toDataURL('image/jpeg', quality));
      if (image) return image.base64;
    }
    scale *= 0.7;
  }
  return null;
}

export function captureVideoFrame(video: HTMLVideoElement | null): string | null {
  try {
    if (!video || video.readyState < 2 || video.paused || video.ended) return null;
    return encodeFrame(video, video.videoWidth, video.videoHeight);
  } catch { return null; } // Includes unreadable cross-origin media and disconnected tracks.
}

/** Artifact loaders supply local blob/data URLs; arbitrary remote URLs are not fetched here. */
export async function readTrafficImageUrl(url: string): Promise<string | null> {
  const direct = trafficImage(url);
  // Normalize WebP for the server's existing System.Drawing JPEG compressor.
  if (direct && !direct.url.startsWith('data:image/webp;')) return direct.base64;
  if (!url.startsWith('blob:') && !url.startsWith('data:image/')) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const mime = imageMime(new Uint8Array(await blob.slice(0, 16).arrayBuffer()));
    if (!mime) return null;
    if (blob.size <= MAX_TRAFFIC_IMAGE_BYTES && mime !== 'image/webp') {
      return trafficImage(Array.from(new Uint8Array(await blob.arrayBuffer())))?.base64 ?? null;
    }
    if (blob.size > 20 * 1024 * 1024) return null;
    const bitmap = await createImageBitmap(blob);
    try { return encodeFrame(bitmap, bitmap.width, bitmap.height); }
    finally { bitmap.close(); }
  } catch { return null; }
}

export async function detectionTrafficImage(load: () => Promise<string | null>, timeoutMs = 5000): Promise<string | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const image = Promise.resolve().then(load).then(async url => {
    if (!url) return null;
    try { return await readTrafficImageUrl(url); }
    finally { if (url.startsWith('blob:')) URL.revokeObjectURL(url); }
  }).catch(() => null);
  try {
    return await Promise.race([image, new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), timeoutMs); })]);
  } finally { clearTimeout(timer); }
}
