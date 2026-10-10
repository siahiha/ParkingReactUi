import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material';
import { parkingApi, type Camera } from '../../api/management';
import { CameraStreamPreview } from './CameraStreamPreview';
import type { Language } from './managementTypes';

type Props = { doorId: string; language: Language };
type RecordValue = Record<string, unknown>;
type CameraTab = 'entry' | 'exit';

const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;

function unwrap(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
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
  if (Array.isArray(input)) return input;
  const row = record(input);
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

function cameraFrom(input: unknown, fallbackName: string): Camera | null {
  const initial = record(input);
  const row = record(field(initial, 'Key', 'Equipment', 'Device')) ?? initial;
  if (!row) return null;
  const id = field(row, 'CameraId', 'Id', 'DeviceId', 'EquipmentId');
  if (id === undefined || id === null || id === '') return null;
  return {
    cameraId: String(id),
    name: String(field(row, 'DeviceName', 'CameraName', 'CameraTitle', 'Name') ?? fallbackName),
    enabled: field(row, 'Disabled') !== true && String(field(row, 'Disabled') ?? '').toLowerCase() !== 'true',
  };
}

function viewerId() {
  const key = 'parking-traffic-control-viewer-id';
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next = globalThis.crypto?.randomUUID?.() ?? `traffic-control-${Date.now()}`;
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `traffic-control-${Date.now()}`;
  }
}

export function TrafficCameraPanels({ doorId, language }: Props) {
  const [entryCamera, setEntryCamera] = useState<Camera | null>(null);
  const [exitCamera, setExitCamera] = useState<Camera | null>(null);
  const [activeTab, setActiveTab] = useState<CameraTab>('entry');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewer] = useState(viewerId);

  useEffect(() => {
    let active = true;
    setEntryCamera(null);
    setExitCamera(null);
    setActiveTab('entry');
    setError('');
    if (!doorId) return () => { active = false; };
    setCameraLoading(true);
    Promise.all([parkingApi.getDoor(Number(doorId)), parkingApi.getDoorDevices(Number(doorId)).catch(() => null)]).then(([response, devicesResponse]) => {
      const row = record(response);
      const entryLabel = text(language, 'دوربین ورودی', 'Entry camera');
      const exitLabel = text(language, 'دوربین خروجی', 'Exit camera');
      const directEntry = cameraFrom(field(row, 'EnteranceCamera', 'EntranceCamera'), entryLabel);
      const directExit = cameraFrom(field(row, 'ExitCamera'), exitLabel);
      const linked = linkedCameraRows(response);
      const devices = listFrom(devicesResponse).map((item) => record(item)).filter((item): item is RecordValue => Boolean(item && isCamera(item)));
      const entryLinked = linked.find((item) => String(item.trafficType ?? '') === '0')?.row;
      const exitLinked = linked.find((item) => String(item.trafficType ?? '') === '1')?.row;
      const entry = directEntry ?? cameraFrom(entryLinked ?? devices[0], entryLabel);
      const exit = directExit ?? cameraFrom(exitLinked ?? devices[1], exitLabel);
      if (active) { setEntryCamera(entry); setExitCamera(exit); setActiveTab(entry ? 'entry' : 'exit'); }
    }).catch(() => { if (active) setError(text(language, 'اطلاعات دوربین‌های درب دریافت نشد.', 'Camera information could not be loaded.')); })
      .finally(() => { if (active) setCameraLoading(false); });
    return () => { active = false; };
  }, [doorId, language]);

  const activeCamera = activeTab === 'entry' ? entryCamera : exitCamera;
  const hasBothCameras = Boolean(entryCamera && exitCamera);
  const selectedLabel = activeTab === 'entry' ? text(language, 'دوربین ورودی', 'Entry camera') : text(language, 'دوربین خروجی', 'Exit camera');

  return <Box className="traffic-camera-panel" sx={{ minWidth: 0, height: '100%' }}>
    <Paper variant="outlined" sx={{ p: 1, minWidth: 0, height: '100%', boxSizing: 'border-box' }}>
      {hasBothCameras && <Tabs value={activeTab} onChange={(_event, value: CameraTab) => setActiveTab(value)} variant="fullWidth" sx={{ minHeight: 34, mb: 0.5 }}>
        <Tab value="entry" label={text(language, 'ورودی', 'Entry')} sx={{ minHeight: 34, py: 0.25 }} />
        <Tab value="exit" label={text(language, 'خروجی', 'Exit')} sx={{ minHeight: 34, py: 0.25 }} />
      </Tabs>}
      {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
      {cameraLoading && <Box className="inline-status-row"><CircularProgress size={18} /><Typography variant="body2">{text(language, 'در حال دریافت دوربین...', 'Loading camera...')}</Typography></Box>}
      {!cameraLoading && !error && !entryCamera && !exitCamera && <Typography variant="body2" color="text.secondary">{text(language, 'برای این درب دوربین فعالی تعریف نشده است.', 'No active camera is configured for this door.')}</Typography>}
      {!cameraLoading && activeCamera && <Box className="traffic-camera-preview-box" sx={{ minWidth: 0, width: '100%', p: 0, m: 0 }}><Box sx={{ minWidth: 0, width: '100%', p: 0, m: 0 }}><CameraStreamPreview key={`${doorId}-${activeCamera.cameraId}`} camera={{ ...activeCamera, name: `${selectedLabel}: ${activeCamera.name}` }} language={language} viewer={viewer} size={{ width: '100%', height: 210 }} showConnectionButton={false} showModeSwitcher={false} showRoiAction={false} autoConnect compact /></Box></Box>}
      {!cameraLoading && !activeCamera && (entryCamera || exitCamera) && <Typography variant="body2" color="text.secondary">{text(language, 'تصویر دوربین انتخاب‌شده در دسترس نیست.', 'The selected camera image is unavailable.')}</Typography>}
    </Paper>
  </Box>;
}
