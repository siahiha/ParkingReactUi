import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Tooltip, Typography } from '@mui/material';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { ApiError } from '../../api/client';
import { anprApi, parkingApi, type Camera } from '../../api/management';
import { AnprRealtimeConnection } from '../../api/anprRealtime';
import { appConfig } from '../../config';
import { formatDateTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { ConfirmDialog } from '../ConfirmDialog';
import { CameraStreamPreview } from './CameraStreamPreview';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { unwrapValues, type Language } from './managementTypes';
import { selectAnprRowAfterRefresh } from './anprSelection';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Row = Record<string, unknown>;
type Door = Record<string, unknown>;
const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const field = (row: Row, ...keys: string[]) => keys.map((key) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
const rowsOf = (input: unknown): Row[] => { const value = unwrapValues(input); return Array.isArray(value) ? value.filter((item): item is Row => Boolean(item && typeof item === 'object')) : []; };
const bool = (input: unknown) => input === true || input === 1 || input === '1' || String(input).toLowerCase() === 'true';
const getViewerId = () => {
  const key = 'parking-viewer-id';
  try {
    const current = sessionStorage.getItem(key);
    if (current) return current;
    const next = globalThis.crypto?.randomUUID?.() || `viewer-${Date.now()}`;
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `viewer-${Date.now()}`;
  }
};
const asRecord = (input: unknown): Row | null => input && typeof input === 'object' ? input as Row : null;
const listFromValue = (input: unknown): unknown[] => {
  if (Array.isArray(input)) return input;
  const row = asRecord(input);
  if (!row) return [];
  if (field(row, 'Id', 'DeviceId', 'EquipmentId', 'CameraId', 'DeviceType') !== undefined) return [row];
  return Object.values(row);
};
const linkedEquipmentRows = (input: unknown): Row[] => {
  const unwrapped = unwrapValues(input);
  const root = asRecord(unwrapped);
  const linked = Array.isArray(unwrapped) ? unwrapped : root ? field(root, 'DtoViewEquipments', 'ViewEquipments', 'Equipments') : input;
  const direct = root ? [field(root, 'EnteranceCamera', 'EntranceCamera'), field(root, 'ExitCamera')].filter(Boolean) : [];
  return listFromValue(linked ?? direct).map((item) => {
    const row = asRecord(item);
    if (!row) return null;
    return asRecord(field(row, 'Key', 'Equipment', 'Device')) ?? row;
  }).filter((row): row is Row => Boolean(row));
};
const isCameraType = (input: unknown) => {
  const value = String(input ?? '').toLowerCase();
  return value === '0' || value.includes('camera') || value.includes('دوربین');
};
const equipmentId = (row: Row) => field(row, 'Id', 'DeviceId', 'EquipmentId', 'CameraId');
const toCamera = (row: Row): Camera | null => {
  const id = equipmentId(row);
  if (id === undefined || id === null || id === '') return null;
  if (!isCameraType(field(row, 'DeviceType', 'EquipmentType', 'Type')) && field(row, 'CameraId') === undefined) return null;
  const cameraId = String(field(row, 'CameraId') ?? field(row, 'Id', 'DeviceId', 'EquipmentId'));
  return {
    cameraId,
    name: String(field(row, 'DeviceName', 'CameraName', 'CameraTitle', 'Name') ?? cameraId),
    rtspUrl: String(field(row, 'RtspUrl', 'RTSPUrl', 'RTSPURL') ?? '').trim() || undefined,
    enabled: !bool(field(row, 'Disabled')),
  };
};
const imageMime = (bytes: Uint8Array) => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
  if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'image/webp';
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
  return 'image/jpeg';
};
const bytesToImageSrc = (input: number[]) => {
  if (!input.length || input.some((item) => !Number.isInteger(item) || item < 0 || item > 255)) return '';
  try {
    const bytes = Uint8Array.from(input);
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    return `data:${imageMime(bytes)};base64,${btoa(binary)}`;
  } catch {
    return '';
  }
};
const base64ToImageSrc = (value: string) => {
  const normalized = value.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) return '';
  try {
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return bytesToImageSrc(Array.from(binary, (character) => character.charCodeAt(0)));
  } catch {
    return '';
  }
};
const relativeImageUrl = (value: string) => {
  try {
    return new URL(value.replaceAll('\\', '/'), `${appConfig.apiBaseUrl.replace(/\/$/, '')}/`).toString();
  } catch {
    return '';
  }
};
const imageSrc = (value: unknown): string => {
  if (Array.isArray(value) && value.every((item) => typeof item === 'number')) return bytesToImageSrc(value as number[]);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) return trimmed;
    const dataPrefix = trimmed.match(/^data:[^;]+;base64,(.*)$/is);
    if (dataPrefix) return base64ToImageSrc(dataPrefix[1]);

    // JPEG/PNG payloads from GetAnprPicById are raw Base64 strings. JPEG
    // payloads commonly start with "/9j/", which must not be treated as a
    // relative URL path.
    const normalizedBase64 = trimmed.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64) && normalizedBase64.length > 100) {
      return base64ToImageSrc(trimmed);
    }

    if (trimmed.startsWith('/') || /(?:^|[./\\])[^/\\]+\.(?:jpe?g|png|gif|webp|bmp)(?:[?#].*)?$/i.test(trimmed)) return relativeImageUrl(trimmed);
    return base64ToImageSrc(trimmed);
  }
  const row = asRecord(value);
  if (!row) return '';
  for (const key of ['Data', 'data', 'Bytes', 'bytes', 'Buffer', 'buffer', 'Base64', 'base64', 'Value', 'value', '$binary']) {
    if (row[key] !== undefined && row[key] !== value) {
      const nested = imageSrc(row[key]);
      if (nested) return nested;
    }
  }
  const numericKeys = Object.keys(row).filter((key) => /^\d+$/.test(key)).sort((left, right) => Number(left) - Number(right));
  return numericKeys.length ? imageSrc(numericKeys.map((key) => row[key])) : '';
};
const recordId = (row: Row, index: number) => String(field(row, 'ID', 'Id', 'AnprId') ?? `${field(row, 'InsertTime', 'InsertDateTime', 'GetPlateTime') ?? index}-${field(row, 'Plate', 'CarPlate') ?? ''}-${field(row, 'Camera', 'CameraName', 'CameraTitle') ?? ''}`);
const anprRecordId = (row: Row) => field(row, 'ID', 'Id', 'AnprId');
const withoutRecordPictures = (row: Row): Row => {
  const copy = { ...row };
  Object.keys(copy).forEach((key) => {
    if (/^(car|plate)(pic|image)/i.test(key)) delete copy[key];
  });
  return copy;
};
const preserveCachedPictures = (row: Row, cached: Row | undefined): Row => {
  if (!cached) return row;
  const result = { ...row };
  ['CarPic', 'PlatePic', 'CarImageName', 'PlateImageName'].forEach((key) => {
    if (cached[key] !== undefined) result[key] = cached[key];
  });
  return result;
};
const stableRecordKey = (row: Row) => recordId(row, 0);
const mergeAnprRows = (current: Row[], incoming: Row[], limit: number) => {
  const cachedByKey = new Map(current.map((row) => [stableRecordKey(row), row]));
  const unique = new Map<string, Row>();
  [...incoming.map((row) => preserveCachedPictures(row, cachedByKey.get(stableRecordKey(row)))), ...current].forEach((row) => {
    const key = stableRecordKey(row);
    if (!unique.has(key)) unique.set(key, row);
  });
  return [...unique.entries()]
    .sort((left, right) => {
      const rightTime = Date.parse(String(field(right[1], 'InsertTime', 'InsertDateTime', 'GetPlateTime') ?? ''));
      const leftTime = Date.parse(String(field(left[1], 'InsertTime', 'InsertDateTime', 'GetPlateTime') ?? ''));
      if (Number.isNaN(rightTime) || Number.isNaN(leftTime)) return 0;
      return rightTime - leftTime;
    })
    .slice(0, limit)
    .map(([, row]) => row);
};

export function AnprMonitoringWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [doorCameras, setDoorCameras] = useState<Camera[]>([]);
  const [memberPlates, setMemberPlates] = useState<string[]>([]);
  const [source, setSource] = useState(false);
  const [doorId, setDoorId] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [pictureError, setPictureError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const requestRef = useRef(false);
  const pictureRequestRef = useRef(new Set<string>());
  const pendingResetRef = useRef(false);
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const [viewer] = useState(() => getViewerId());
  const rowsRef = useRef<Row[]>([]);
  const selectedKeyRef = useRef<string | null>(null);
  const selectRecord = useCallback((row: Row | null) => {
    selectedKeyRef.current = row ? stableRecordKey(row) : null;
    setSelected(row);
  }, []);

  const loadRecords = useCallback(async (reset = false) => {
    if (requestRef.current) {
      if (reset) pendingResetRef.current = true;
      return;
    }
    requestRef.current = true;
    setRefreshing(true);
    const requestSource = sourceRef.current;
    if (reset) {
      rowsRef.current = [];
      setRows([]);
      selectRecord(null);
    }
    try {
      // This is a one-time initial snapshot only; live changes arrive through SignalR.
      const nextRows = rowsOf(await anprApi.listRecent(requestSource)).map(withoutRecordPictures);
      if (sourceRef.current !== requestSource) return;
      const previousRows = rowsRef.current;
      const updatedRows = reset ? nextRows : mergeAnprRows(previousRows, nextRows, 20);
      rowsRef.current = updatedRows;
      setRows(updatedRows);
      selectRecord(selectAnprRowAfterRefresh(previousRows, updatedRows, selectedKeyRef.current, reset, stableRecordKey));
      setError('');
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده تشخیص پلاک مجاز نیست.', 'ANPR monitoring access is forbidden.') : text(language, 'دریافت رکوردهای تشخیص پلاک ناموفق بود.', 'ANPR records could not be loaded.'));
    } finally {
      requestRef.current = false;
      setLoading(false);
      setRefreshing(false);
      if (pendingResetRef.current) {
        pendingResetRef.current = false;
        void loadRecords(true);
      }
    }
  }, [language, selectRecord]);

  const loadDoorCameras = useCallback(async (isCancelled: () => boolean = () => false) => {
    setDoorCameras([]);
    setCameraError('');
    if (!doorId) return;
    const selectedDoorId = Number(doorId);
    if (!Number.isFinite(selectedDoorId) || selectedDoorId <= 0) return;
    setLoadingCameras(true);
    let failedRequests = 0;
    const safeRequest = async (request: Promise<unknown>) => {
      try {
        return await request;
      } catch {
        failedRequests += 1;
        return null;
      }
    };
    try {
      const [doorResponse, deviceResponse, equipmentResponse] = await Promise.all([
        safeRequest(parkingApi.getDoor(selectedDoorId)),
        safeRequest(parkingApi.getDoorDevices(selectedDoorId)),
        safeRequest(parkingApi.getEquipments(parkingId)),
      ]);
      const equipmentRows = rowsOf(equipmentResponse);
      const equipmentById = new Map(equipmentRows.map((row) => [String(equipmentId(row) ?? ''), row]));
      const linkedRows = [...linkedEquipmentRows(doorResponse), ...linkedEquipmentRows(deviceResponse)];
      const mergedRows = linkedRows.map((row) => {
        const linkedId = equipmentId(row);
        const equipment = linkedId == null ? undefined : equipmentById.get(String(linkedId));
        return equipment ? { ...equipment, ...row } : row;
      });
      const nextCameras = mergedRows.map(toCamera).filter((camera): camera is Camera => Boolean(camera && camera.enabled !== false)).filter((camera, index, list) => list.findIndex((item) => item.cameraId === camera.cameraId) === index);
      if (isCancelled()) return;
      setDoorCameras(nextCameras);
      if (failedRequests > 0) {
        setCameraError(text(language, 'اطلاعات دوربین‌های این درب به‌طور کامل از API دریافت نشد.', 'Camera information for this door could not be loaded completely from the API.'));
      }
    } finally {
      if (!isCancelled()) setLoadingCameras(false);
    }
  }, [doorId, language, parkingId]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        const [doorResponse, platesResponse] = await Promise.all([parkingApi.getDoors(parkingId), anprApi.listMemberPlates()]);
        if (cancelled) return;
        const doorRows = rowsOf(doorResponse);
        setDoors(doorRows);
        setMemberPlates(rowsOf(platesResponse).map((row) => String(field(row, 'Plate', 'CarPlate') ?? '')).filter(Boolean));
      } catch (cause) {
        if (!cancelled) setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی دریافت درب‌ها مجاز نیست.', 'Door access is forbidden.') : text(language, 'اطلاعات اولیه مانیتورینگ دریافت نشد.', 'Initial monitoring data could not be loaded.'));
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, [language, parkingId]);

  useEffect(() => {
    pictureRequestRef.current.clear();
    setPictureError('');
    void loadRecords(true);
  }, [loadRecords, source]);

  useEffect(() => {
    let active = true;
    const realtime = new AnprRealtimeConnection();
    void realtime.start(source, (incoming) => {
      if (!active) return;
      const previousRows = rowsRef.current;
      const updatedRows = mergeAnprRows(previousRows, [incoming], 20);
      rowsRef.current = updatedRows;
      setRows(updatedRows);
      setLoading(false);
      setRefreshing(false);
      selectRecord(selectAnprRowAfterRefresh(previousRows, updatedRows, selectedKeyRef.current, false, stableRecordKey));
      setError('');
    }, (cause) => {
      if (active) setError(text(language, 'اتصال زنده تشخیص پلاک برقرار نشد.', 'Live ANPR connection failed.'));
      console.warn('ANPR SignalR error', cause);
    });
    return () => {
      active = false;
      realtime.stop();
    };
  }, [language, selectRecord, source]);
  useEffect(() => {
    rowsRef.current = rows;
    setSelected((current) => {
      const next = current && rows.some((row) => stableRecordKey(row) === stableRecordKey(current)) ? current : rows[0] ?? null;
      selectedKeyRef.current = next ? stableRecordKey(next) : null;
      return next;
    });
  }, [rows]);
  useEffect(() => {
    if (!selected) {
      setLoadingPicture(false);
      return;
    }

    const selectedRecord = selected;
    const pictureId = anprRecordId(selectedRecord);
    if (pictureId === undefined || pictureId === null || pictureId === '') {
      setLoadingPicture(false);
      return;
    }

    const selectedKey = stableRecordKey(selectedRecord);
    if (field(selectedRecord, 'CarPic', 'CarImage', 'PlatePic', 'PlateImage') !== undefined) {
      setLoadingPicture(false);
      return;
    }
    const requestKey = `${source}:${String(pictureId)}`;
    if (pictureRequestRef.current.has(requestKey)) return;

    pictureRequestRef.current.add(requestKey);
    let cancelled = false;
    setLoadingPicture(true);
    setPictureError('');

    void anprApi.getPictureById(String(pictureId), source)
      .then((response) => {
        const picture = asRecord(unwrapValues(response));
        if (!picture) throw new Error('ANPR picture response is empty.');

        const picturePatch: Row = {
          CarPic: field(picture, 'CarPic', 'CarImage', 'CarImageBase64', 'CarImageUrl'),
          PlatePic: field(picture, 'PlatePic', 'PlateImage', 'PlateImageBase64', 'PlateImageUrl'),
          CarImageName: field(picture, 'CarImageName'),
          PlateImageName: field(picture, 'PlateImageName'),
        };
        setRows((current) => current.map((row) => stableRecordKey(row) === selectedKey ? { ...row, ...picturePatch } : row));
        setSelected((current) => current && stableRecordKey(current) === selectedKey ? { ...current, ...picturePatch } : current);
      })
      .catch(() => {
        pictureRequestRef.current.delete(requestKey);
        if (!cancelled) setPictureError(text(language, 'دریافت تصویر رکورد ناموفق بود.', 'The selected record image could not be loaded.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingPicture(false);
      });

    return () => { cancelled = true; };
  }, [language, selected, source]);
  useEffect(() => {
    let cancelled = false;
    void loadDoorCameras(() => cancelled);
    return () => { cancelled = true; };
  }, [loadDoorCameras]);

  const visibleRows = rows;
  const isMemberPlate = (row: Row) => memberPlates.includes(String(field(row, 'Plate', 'CarPlate') ?? '').replaceAll('-', ''));
  const image = (row: Row | null, ...keys: string[]) => row ? keys.map((key) => imageSrc(field(row, key))).find(Boolean) ?? '' : '';
  const doorName = (row: Row) => String(field(row, 'DoorTitle', 'DoorName', 'ParkingDoorTitle') ?? '—');
  const columns = [
    { key: 'Plate', label: text(language, 'پلاک', 'Plate'), render: (row: Row) => <Box component="span" dir="ltr" sx={{ color: isMemberPlate(row) ? 'success.main' : 'inherit', fontWeight: isMemberPlate(row) ? 700 : 400 }}>{String(field(row, 'Plate', 'CarPlate') ?? '—')}</Box> },
    { key: 'Camera', label: text(language, 'دوربین', 'Camera'), render: (row: Row) => String(field(row, 'Camera', 'CameraName', 'CameraTitle') ?? '—') },
    { key: 'Door', label: text(language, 'درب', 'Door'), render: doorName },
    { key: 'InsertTime', label: text(language, 'زمان ثبت', 'Detected at'), render: (row: Row) => formatDateTime(field(row, 'InsertTime', 'InsertDateTime', 'GetPlateTime'), language) },
    { key: 'IsMember', label: text(language, 'عضو', 'Member'), filterable: false, render: (row: Row) => <FiberManualRecordRoundedIcon fontSize="small" color={isMemberPlate(row) ? 'success' : 'disabled'} aria-label={isMemberPlate(row) ? text(language, 'پلاک عضو', 'Member plate') : text(language, 'پلاک غیرعضو', 'Non-member plate')} /> },
  ];

  const removeOldPictures = async () => { setDeleting(true); try { await anprApi.deleteOldPictures(source); setConfirmOpen(false); await loadRecords(true); } catch { setError(text(language, 'حذف تصاویر قدیمی انجام نشد.', 'Old pictures could not be deleted.')); } finally { setDeleting(false); } };
  const selectedPicturePanel = (label: string, keys: string[]) => {
    const src = image(selected, ...keys);
    return <Box sx={{ display: 'flex', minWidth: 0, minHeight: 0 }}><>{src ? <Box component="img" src={src} alt={label} sx={{ display: 'block', width: '100%', height: '100%', minHeight: 0, objectFit: 'contain', bgcolor: 'grey.900', border: 1, borderColor: 'divider' }} /> : <Box sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">{loadingPicture ? text(language, 'در حال دریافت تصویر...', 'Loading image...') : text(language, 'تصویر موجود نیست', 'Image unavailable')}</Typography></Box>}</></Box>;
  };

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={refreshing} onRefresh={() => { void loadRecords(true); }} headingActions={<>
    <FormControl size="small" sx={{ width: 136 }}><InputLabel>{text(language, 'منبع تشخیص', 'ANPR source')}</InputLabel><Select label={text(language, 'منبع تشخیص', 'ANPR source')} value={source ? 'elmo' : 'shahab'} onChange={(event) => setSource(event.target.value === 'elmo')}><MenuItem value="shahab">{text(language, 'شهاب', 'Shahab')}</MenuItem><MenuItem value="elmo">{text(language, 'الموصنعت', 'Elmo Sanat')}</MenuItem></Select></FormControl>
    <Tooltip title={text(language, 'حذف تصاویر قدیمی', 'Delete old pictures')} arrow><span><IconButton className="workspace-refresh-button" color="error" aria-label={text(language, 'حذف تصاویر قدیمی', 'Delete old pictures')} onClick={() => setConfirmOpen(true)} disabled={deleting}><DeleteSweepRoundedIcon /></IconButton></span></Tooltip>
  </>}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {pictureError && <Alert severity="warning" sx={{ mb: 1.5 }}>{pictureError}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: { xs: 0.5, sm: 1.5 }, mb: 2, alignItems: 'stretch', minWidth: 0, height: { md: 300 }, maxHeight: { md: 300 }, overflow: { md: 'hidden' } }}>
      <Paper variant="outlined" sx={{ p: 0.5, minWidth: 0, minHeight: 0, height: '100%', overflow: 'hidden' }}>
        <FormControl size="small" fullWidth sx={{ mb: 0.5, '& .MuiInputBase-root': { height: 30, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' }, '& .MuiInputBase-input': { py: 0.25, px: 0.75 } }}>
          <InputLabel>{text(language, 'درب دوربین', 'Camera door')}</InputLabel>
          <Select label={text(language, 'درب دوربین', 'Camera door')} value={doorId} onChange={(event) => setDoorId(event.target.value)}>
            <MenuItem value="">{text(language, 'انتخاب درب', 'Select a door')}</MenuItem>
            {doors.map((door, index) => <MenuItem key={String(field(door, 'Id') ?? index)} value={String(field(door, 'Id') ?? '')}>{String(field(door, 'Title', 'DoorTitle') ?? '—')}</MenuItem>)}
          </Select>
        </FormControl>
        {cameraError && <Alert severity="error" sx={{ mb: 1 }}>{cameraError}</Alert>}
        {loadingCameras && <Box className="inline-status-row"><CircularProgress size={18} /><Typography variant="body2">{text(language, 'در حال دریافت دوربین...', 'Loading camera...')}</Typography></Box>}
        {!loadingCameras && !cameraError && !doorId && <Typography variant="body2" color="text.secondary">{text(language, 'برای نمایش تصویر زنده یک درب را انتخاب کنید.', 'Select a door to view the live camera.')}</Typography>}
        {!loadingCameras && !cameraError && doorId && doorCameras.length === 0 && <Typography variant="body2" color="text.secondary">{text(language, 'برای این درب دوربین فعالی پیدا نشد.', 'No active camera was found for this door.')}</Typography>}
        {!loadingCameras && doorCameras.length > 0 && <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0, minHeight: 0, overflow: 'hidden' }}>{doorCameras.map((camera) => <CameraStreamPreview key={camera.cameraId} camera={camera} language={language} viewer={viewer} size={{ width: '100%', height: 190 }} showRoiAction={false} compact />)}</Box>}
      </Paper>
      <Paper variant="outlined" sx={{ p: 0.5, minWidth: 0, minHeight: 0, height: '100%', display: 'grid', gridTemplateRows: { xs: '100px minmax(220px, 1fr)', md: 'minmax(72px, 0.65fr) minmax(180px, 1.35fr)' }, gap: 0.5, overflow: 'hidden' }}>
        {selectedPicturePanel(text(language, 'پلاک خودرو', 'Vehicle plate'), ['PlatePic', 'PlateImage', 'PlateImageBase64', 'PlateImageUrl', 'PlateImageName'])}
        {selectedPicturePanel(text(language, 'فریم خودرو', 'Vehicle frame'), ['CarPic', 'CarImage', 'CarImageBase64', 'CarImageUrl', 'CarImageName'])}
      </Paper>
    </Box>
    <Paper variant="outlined" sx={{ minWidth: 0, minHeight: { md: 'calc(100vh - 430px)' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {loading && <Box className="inline-status-row" sx={{ px: 1.5, pt: 1.5 }}><CircularProgress size={18} /><Typography variant="body2">{text(language, 'در حال دریافت رکوردها...', 'Loading ANPR records...')}</Typography></Box>}
      <Box sx={{ overflowX: 'auto', flex: '1 1 auto', minHeight: 0, '& .app-data-grid-wrapper': { height: '100%' } }}><AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={visibleRows} columns={columns} rowKey={recordId} selectedKey={selected ? recordId(selected, 0) : null} onRowClick={selectRecord} onRowFocus={selectRecord} defaultFilterOpen /></Box>
      {!loading && visibleRows.length === 0 && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, py: 1 }}>{text(language, 'در یک ساعت گذشته رکورد تشخیص پلاکی وجود ندارد.', 'No ANPR records were detected in the last hour.')}</Typography>}
    </Paper>
    <ConfirmDialog open={confirmOpen} busy={deleting} title={text(language, 'حذف تصاویر قدیمی', 'Delete old pictures')} message={text(language, 'تصاویر قدیمی ANPR حذف می‌شوند. این عملیات قابل بازگشت نیست.', 'Old ANPR pictures will be deleted. This action cannot be undone.')} cancelLabel={text(language, 'لغو', 'Cancel')} confirmLabel={text(language, 'حذف', 'Delete')} onClose={() => setConfirmOpen(false)} onConfirm={() => { void removeOldPictures(); }} />
  </ManagementWorkspaceFrame>;
}
