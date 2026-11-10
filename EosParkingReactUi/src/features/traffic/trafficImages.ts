export const MAX_TRAFFIC_IMAGE_BYTES = 512000;
function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0, 3)) === 'GIF') return 'image/gif';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

export function trafficImage(value: unknown): { base64: string; url: string } | null {
  try {
    let bytes: Uint8Array;
    let base64: string;
    if (typeof value === 'string') {
      base64 = value.replace(/^data:image\/(?:png|jpeg|gif|webp);base64,/, '').replace(/\s/g, '');
      if (!base64 || base64.length > Math.ceil(MAX_TRAFFIC_IMAGE_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) return null;
      bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    } else if (Array.isArray(value) && value.length <= MAX_TRAFFIC_IMAGE_BYTES && value.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255)) {
      bytes = new Uint8Array(value);
      base64 = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
    } else return null;
    const mime = imageMime(bytes);
    if (!mime || bytes.length > MAX_TRAFFIC_IMAGE_BYTES) return null;
    return { base64, url: `data:${mime};base64,${base64}` };
  } catch { return null; }
}
