import { parkingApi, type Camera } from '../../api/management';
type RecordValue = Record<string, unknown>;
function unwrap(input: unknown): unknown {
  // Arrays have a built-in `values` method; it is not an API envelope field.
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const value = input as RecordValue;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}

function record(input: unknown): RecordValue | null {
  const value = unwrap(input);
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : null;
}

function field(row: RecordValue | null, ...keys: string[]) {
  return keys.map((key) => row?.[key] ?? row?.[key.charAt(0).toLowerCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
}

function listFrom(input: unknown): unknown[] {
  const value = unwrap(input);
  if (Array.isArray(value)) return value;
  const row = record(value);
  if (!row) return [];
  if (field(row, 'Id', 'DeviceId', 'EquipmentId', 'CameraId', 'DeviceType') !== undefined) return [row];
  return Object.values(row);
}

function isCamera(row: RecordValue) {
  const type = String(field(row, 'DeviceType', 'EquipmentType', 'Type') ?? '').toLowerCase();
  return type === '0' || type.includes('camera') || type.includes('دوربین') || field(row, 'CameraId') !== undefined;
}

function linkedCameraRows(input: unknown): Array<{ row: RecordValue; trafficType: unknown }> {
  const root = record(input);
  const linked = root ? field(root, 'DtoViewEquipments', 'ViewEquipments', 'Equipments') : input;
  const rows = listFrom(linked).map((item): { row: RecordValue; trafficType: unknown } | null => {
    const pair = record(item);
    if (!pair) return null;
    const row = record(field(pair, 'Key', 'Equipment', 'Device')) ?? pair;
    return isCamera(row) ? { row, trafficType: field(pair, 'Value', 'TrafficType') as unknown } : null;
  });
  return rows.filter((item): item is { row: RecordValue; trafficType: unknown } => item !== null);
}

function cameraFrom(input: unknown, fallbackName: string, direction: Camera['direction']): Camera | null {
  const initial = record(input);
  const row = record(field(initial, 'Key', 'Equipment', 'Device')) ?? initial;
  if (!row) return null;
  const id = field(row, 'CameraId', 'Id', 'DeviceId', 'EquipmentId');
  if (id === undefined || id === null || id === '') return null;
  return {
    cameraId: String(id),
    name: String(field(row, 'DeviceName', 'CameraName', 'CameraTitle', 'Name') ?? fallbackName),
    rtspUrl: String(field(row, 'RtspUrl', 'RTSPUrl', 'RTSPURL') ?? '').trim() || undefined,
    enabled: field(row, 'Disabled') !== true && String(field(row, 'Disabled') ?? '').toLowerCase() !== 'true',
    detectionServerAddress: String(field(row, 'DetectionServerAddress') ?? ''),
    direction,
  };
}


export const trafficCameraService = {
  async load(doorId: number, labels: { entry: string; exit: string }) {
    const [response, devicesResponse] = await Promise.all([parkingApi.getDoor(doorId), parkingApi.getDoorDevices(doorId).catch(() => null)]);
    const row = record(response);
    const entryLabel = labels.entry;
    const exitLabel = labels.exit;
    const directEntry = cameraFrom(field(row, 'EnteranceCamera', 'EntranceCamera'), entryLabel, 'entry');
    const directExit = cameraFrom(field(row, 'ExitCamera'), exitLabel, 'exit');
    const linked = linkedCameraRows(response);
    const devices = listFrom(devicesResponse).map((item) => record(item)).filter((item): item is RecordValue => Boolean(item && isCamera(item)));
    const entryLinked = linked.find((item) => String(item.trafficType ?? '') === '0')?.row;
    const exitLinked = linked.find((item) => String(item.trafficType ?? '') === '1')?.row;
    const entry = directEntry ?? cameraFrom(entryLinked ?? devices[0], entryLabel, 'entry');
    const exit = directExit ?? cameraFrom(exitLinked ?? devices[1], exitLabel, 'exit');

    return { entry, exit };
  },
};
