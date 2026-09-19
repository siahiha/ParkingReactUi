import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { ApiError } from '../../api/client';
import { anprApi, parkingApi } from '../../api/management';
import { formatDateTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { ConfirmDialog } from '../ConfirmDialog';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { unwrapValues, type Language } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Row = Record<string, unknown>;
type Door = Record<string, unknown>;
const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const field = (row: Row, ...keys: string[]) => keys.map((key) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
const rowsOf = (input: unknown): Row[] => { const value = unwrapValues(input); return Array.isArray(value) ? value.filter((item): item is Row => Boolean(item && typeof item === 'object')) : []; };
const imageSrc = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) return value.startsWith('data:') || value.startsWith('http') || value.startsWith('/') ? value : `data:image/jpeg;base64,${value}`;
  if (Array.isArray(value) && value.every((item) => typeof item === 'number')) {
    try { let binary = ''; value.forEach((item) => { binary += String.fromCharCode(item as number); }); return `data:image/jpeg;base64,${btoa(binary)}`; } catch { return ''; }
  }
  return '';
};
const recordId = (row: Row, index: number) => String(field(row, 'Id', 'AnprId') ?? `${field(row, 'InsertTime', 'InsertDateTime') ?? index}-${field(row, 'Plate') ?? ''}`);

export function AnprMonitoringWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [memberPlates, setMemberPlates] = useState<string[]>([]);
  const [source, setSource] = useState(false);
  const [doorId, setDoorId] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [lastId, setLastId] = useState(0);
  const lastIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const requestRef = useRef(false);

  const loadRecords = useCallback(async (reset = false) => {
    if (requestRef.current) return;
    requestRef.current = true;
    setRefreshing(true);
    try {
      const nextIdValue = await anprApi.getLastId(source);
      const nextIdRows = rowsOf(nextIdValue);
      const nextId = Number(nextIdRows[0] ? field(nextIdRows[0], 'Value', 'Id') : unwrapValues(nextIdValue)) || 0;
      if (reset || nextId !== lastIdRef.current || nextId === 0) {
        const nextRows = rowsOf(await anprApi.listRecent(source));
        setRows(nextRows);
        setSelected((current) => current && nextRows.some((row, index) => recordId(row, index) === recordId(current, 0)) ? current : nextRows[0] ?? null);
        lastIdRef.current = nextId;
        setLastId(nextId);
      }
      setError('');
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده تشخیص پلاک مجاز نیست.', 'ANPR monitoring access is forbidden.') : text(language, 'دریافت رکوردهای تشخیص پلاک ناموفق بود.', 'ANPR records could not be loaded.'));
    } finally { requestRef.current = false; setLoading(false); setRefreshing(false); }
  }, [language, source]);

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
      if (!cancelled) await loadRecords(true);
    };
    void initialize();
    return () => { cancelled = true; };
  }, [language, loadRecords, parkingId]);

  useEffect(() => { const timer = window.setInterval(() => { void loadRecords(false); }, 3000); return () => window.clearInterval(timer); }, [loadRecords]);
  useEffect(() => { lastIdRef.current = 0; setLastId(0); void loadRecords(true); }, [loadRecords, source]);

  const visibleRows = useMemo(() => rows.filter((row) => !doorId || String(field(row, 'DoorId', 'ParkingDoorId')) === doorId), [doorId, rows]);
  const isMemberPlate = (row: Row) => memberPlates.includes(String(field(row, 'Plate', 'CarPlate') ?? '').replaceAll('-', ''));
  const image = (row: Row | null, ...keys: string[]) => imageSrc(row ? field(row, ...keys) : null);
  const doorName = (row: Row) => String(field(row, 'DoorName', 'ParkingDoorTitle') ?? '—');
  const columns = [
    { key: 'Plate', label: text(language, 'پلاک', 'Plate'), render: (row: Row) => <Box component="span" dir="ltr" sx={{ color: isMemberPlate(row) ? 'success.main' : 'inherit', fontWeight: isMemberPlate(row) ? 700 : 400 }}>{String(field(row, 'Plate', 'CarPlate') ?? '—')}</Box> },
    { key: 'Camera', label: text(language, 'دوربین', 'Camera'), render: (row: Row) => String(field(row, 'Camera', 'CameraName', 'CameraTitle') ?? '—') },
    { key: 'Door', label: text(language, 'درب', 'Door'), render: doorName },
    { key: 'InsertTime', label: text(language, 'زمان ثبت', 'Detected at'), render: (row: Row) => formatDateTime(field(row, 'InsertTime', 'InsertDateTime', 'GetPlateTime'), language) },
    { key: 'IsMember', label: text(language, 'عضو', 'Member'), filterable: false, render: (row: Row) => <FiberManualRecordRoundedIcon fontSize="small" color={isMemberPlate(row) ? 'success' : 'disabled'} aria-label={isMemberPlate(row) ? text(language, 'پلاک عضو', 'Member plate') : text(language, 'پلاک غیرعضو', 'Non-member plate')} /> },
  ];

  const removeOldPictures = async () => { setDeleting(true); try { await anprApi.deleteOldPictures(source); setConfirmOpen(false); await loadRecords(true); } catch { setError(text(language, 'حذف تصاویر قدیمی انجام نشد.', 'Old pictures could not be deleted.')); } finally { setDeleting(false); } };

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={text(language, 'رکوردهای زنده تشخیص پلاک و تصاویر مرتبط', 'Live ANPR records and related images')} language={language} loading={refreshing} onRefresh={() => { void loadRecords(true); }} toolbar={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
    <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>{text(language, 'منبع تشخیص', 'ANPR source')}</InputLabel><Select label={text(language, 'منبع تشخیص', 'ANPR source')} value={source ? 'elmo' : 'shahab'} onChange={(event) => setSource(event.target.value === 'elmo')}><MenuItem value="shahab">{text(language, 'شهاب', 'Shahab')}</MenuItem><MenuItem value="elmo">{text(language, 'الموصنعت', 'Elmo Sanat')}</MenuItem></Select></FormControl>
    <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>{text(language, 'درب', 'Door')}</InputLabel><Select label={text(language, 'درب', 'Door')} value={doorId} onChange={(event) => setDoorId(event.target.value)}><MenuItem value="">{text(language, 'همه درب‌ها', 'All doors')}</MenuItem>{doors.map((door, index) => <MenuItem key={String(field(door, 'Id') ?? index)} value={String(field(door, 'Id') ?? '')}>{String(field(door, 'Title', 'DoorTitle') ?? '—')}</MenuItem>)}</Select></FormControl>
    <Button color="error" variant="outlined" startIcon={<DeleteSweepRoundedIcon />} onClick={() => setConfirmOpen(true)} disabled={deleting}>{text(language, 'حذف تصاویر قدیمی', 'Delete old pictures')}</Button>
  </Stack>}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.4fr) minmax(260px, .6fr)' }, gap: 2 }}>
      <Paper variant="outlined" sx={{ minWidth: 0, overflow: 'hidden' }}><ResourceState loading={loading && rows.length === 0} error="" empty={visibleRows.length === 0} loadingLabel={text(language, 'در حال دریافت رکوردها...', 'Loading ANPR records...')} emptyLabel={text(language, 'در یک ساعت گذشته رکورد تشخیص پلاکی وجود ندارد.', 'No ANPR records were detected in the last hour.')}><Box sx={{ overflowX: 'auto' }}><AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={visibleRows} columns={columns} rowKey={recordId} selectedKey={selected ? recordId(selected, 0) : null} onRowClick={(row) => setSelected(row)} defaultFilterOpen /></Box></ResourceState></Paper>
      <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0 }}><Typography variant="subtitle2" sx={{ mb: 1 }}>{text(language, 'تصاویر رکورد انتخاب‌شده', 'Selected record images')}</Typography>{selected ? <Box sx={{ display: 'grid', gap: 1.5 }}><Typography variant="body2" dir="ltr" sx={{ fontWeight: 700 }}>{String(field(selected, 'Plate', 'CarPlate') ?? '—')}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{[['CarPic', text(language, 'خودرو', 'Vehicle')], ['PlatePic', text(language, 'پلاک', 'Plate')]].map(([key, label]) => { const src = image(selected, key, key === 'CarPic' ? 'CarImage' : 'PlateImage'); return <Box key={key} sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">{label}</Typography>{src ? <Box component="img" src={src} alt={String(label)} sx={{ display: 'block', width: '100%', height: 150, objectFit: 'contain', bgcolor: 'grey.900', border: 1, borderColor: 'divider' }} /> : <Box sx={{ height: 150, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">{text(language, 'تصویر موجود نیست', 'Image unavailable')}</Typography></Box>}</Box>; })}</Box><Typography variant="caption" color="text.secondary">{doorName(selected)} · {formatDateTime(field(selected, 'InsertTime', 'InsertDateTime', 'GetPlateTime'), language)}</Typography></Box> : <Typography variant="body2" color="text.secondary">{text(language, 'برای مشاهده تصویر یک رکورد را انتخاب کنید.', 'Select a record to view its images.')}</Typography>}</Paper>
    </Box>
    <ConfirmDialog open={confirmOpen} busy={deleting} title={text(language, 'حذف تصاویر قدیمی', 'Delete old pictures')} message={text(language, 'تصاویر قدیمی ANPR حذف می‌شوند. این عملیات قابل بازگشت نیست.', 'Old ANPR pictures will be deleted. This action cannot be undone.')} cancelLabel={text(language, 'لغو', 'Cancel')} confirmLabel={text(language, 'حذف', 'Delete')} onClose={() => setConfirmOpen(false)} onConfirm={() => { void removeOldPictures(); }} />
  </ManagementWorkspaceFrame>;
}
