/** The desktop camera's DetectionServerAddress. SQL credentials are never used by the browser. */
export function parseShahabDetectionConfig(value: string | undefined): { cameraId: number } | null {
  const address = (value ?? '').trim();
  if (!/^db:\/\//i.test(address)) return null;
  const ids = address.slice(5).split(';').flatMap(part => {
    const separator = part.indexOf('=');
    return separator >= 0 && part.slice(0, separator).trim().toLowerCase() === 'cameraid' ? [part.slice(separator + 1).trim()] : [];
  });
  if (ids.length !== 1 || !/^\d+$/.test(ids[0])) return null;
  const cameraId = Number(ids[0]);
  return Number.isSafeInteger(cameraId) && cameraId > 0 && cameraId <= 2147483647 ? { cameraId } : null;
}
