import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { ApiError } from '../../api/client';
import { cameraApi, type Camera, parkingApi } from '../../api/management';
import { AppDataGrid } from '../AppDataGrid';
import { ConfirmDialog } from '../ConfirmDialog';
import { CrudDialog } from '../CrudDialog';
import { CameraStreamPreview } from './CameraStreamPreview';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, recordValue, type Language, type RecordValue } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Draft = { id: number; name: string; deviceType: string; connectionType: string; ip: string; port: string; username: string; password: string; rtspUrl: string; comPort: string; relay: string; baudRate: string; readTimeout: string; writeTimeout: string; controlByServer: boolean; pcCheck: boolean; byService: boolean; disabled: boolean; detectionServerAddress: string; detectionLeft: string; detectionTop: string; detectionWidth: string; detectionHeight: string; raw: RecordValue | null };
const emptyDraft: Draft = { id: 0, name: 'جدید', deviceType: '0', connectionType: '1', ip: '', port: '554', username: '', password: '', rtspUrl: '', comPort: '', relay: '0', baudRate: '9600', readTimeout: '3000', writeTimeout: '3000', controlByServer: false, pcCheck: false, byService: false, disabled: false, detectionServerAddress: '', detectionLeft: '200', detectionTop: '400', detectionWidth: '350', detectionHeight: '250', raw: null };
const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const value = (row: RecordValue, key: string) => recordValue(row, key);
const bool = (input: unknown) => input === true || input === 1 || input === '1' || String(input).toLowerCase() === 'true';

function getViewerId() {
  const key = 'parking-viewer-id';
  try {
    const persistent = localStorage.getItem(key);
    if (persistent) return persistent;
    const previous = sessionStorage.getItem(key);
    const next = previous || globalThis.crypto?.randomUUID?.() || `viewer-${Date.now()}`;
    localStorage.setItem(key, next);
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `viewer-${Date.now()}`;
  }
}

function fromRow(row: RecordValue): Draft {
  return { id: Number(value(row, 'Id') ?? 0), name: String(value(row, 'DeviceName') ?? ''), deviceType: String(value(row, 'DeviceType') ?? 0), connectionType: String(value(row, 'ConnectionType') ?? 1), ip: String(value(row, 'Ip') ?? ''), port: String(value(row, 'Port') ?? (String(value(row, 'DeviceType') ?? 0) === '0' ? '554' : '1001')), username: String(value(row, 'CameraUserName') ?? ''), password: '', rtspUrl: String(value(row, 'RtspUrl') ?? value(row, 'RTSPUrl') ?? value(row, 'RtspURL') ?? ''), comPort: String(value(row, 'ComPort') ?? ''), relay: String(value(row, 'Relay') ?? 0), baudRate: String(value(row, 'BoudRate') ?? 9600), readTimeout: String(value(row, 'ReadTimeOut') ?? 3000), writeTimeout: String(value(row, 'WriteTimeOut') ?? 3000), controlByServer: bool(value(row, 'ControlByServer')), pcCheck: bool(value(row, 'IsPcCheck')), byService: bool(value(row, 'ByService')), disabled: bool(value(row, 'Disabled')), detectionServerAddress: String(value(row, 'DetectionServerAddress') ?? ''), detectionLeft: String(value(row, 'DetectionLeft') ?? 200), detectionTop: String(value(row, 'DetectionTop') ?? 400), detectionWidth: String(value(row, 'DetectionWidth') ?? 350), detectionHeight: String(value(row, 'DetectionHeight') ?? 250), raw: row };
}

function toCamera(draft: Draft): Camera {
  const cameraId = draft.id > 0 ? String(draft.id) : draft.name.trim().replace(/[^A-Za-z0-9_.:-]+/g, '-') || 'camera';
  const rawUrl = draft.rtspUrl.trim() || `rtsp://${draft.ip.trim()}:${draft.port.trim()}`;
  let rtspUrl = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (draft.username.trim()) parsed.username = draft.username.trim();
    if (draft.password) parsed.password = draft.password;
    rtspUrl = parsed.toString();
  } catch { /* The API will return the connection validation error. */ }
  return { cameraId, name: draft.name.trim() || cameraId, rtspUrl, enabled: !draft.disabled };
}

export function CameraEquipmentWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [original, setOriginal] = useState<Draft>(emptyDraft);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RecordValue | null>(null);
  const [pendingClose, setPendingClose] = useState(false);
  const [preview, setPreview] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [viewer] = useState(getViewerId);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(asRows(await parkingApi.getEquipments(parkingId)));
      setSelectedKeys([]);
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده تجهیزات مجاز نیست.', 'Equipment access is forbidden.') : text(language, 'دریافت تجهیزات ناموفق بود.', 'Loading equipment failed.'));
    } finally {
      setLoading(false);
    }
  }, [language, parkingId]);

  useEffect(() => { void load(); }, [load]);

  const selectedRow = useMemo(() => rows.find((row, index) => selectedKeys.includes(String(value(row, 'Id') ?? index))), [rows, selectedKeys]);
  const dirty = dialogOpen && JSON.stringify(draft) !== JSON.stringify(original);
  const update = <K extends keyof Draft>(key: K, next: Draft[K]) => setDraft((current) => ({ ...current, [key]: next }));

  const openCreate = () => { setError(''); setDraft(emptyDraft); setOriginal(emptyDraft); setDialogOpen(true); };
  const openEdit = () => { if (!selectedRow) return; const next = fromRow(selectedRow); setError(''); setDraft(next); setOriginal(next); setDialogOpen(true); };
  const closeDialog = () => { if (dirty) { setPendingClose(true); return; } setDialogOpen(false); };

  const save = async () => {
    if (!draft.name.trim() || !draft.ip.trim() || !/^\d+$/.test(draft.port) || Number(draft.port) < 1 || Number(draft.port) > 65535) {
      setError(text(language, 'نام، IP و پورت معتبر الزامی است.', 'Name, IP and a valid port are required.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { ...(draft.raw ?? {}), Id: draft.id, ParkingId: parkingId, DeviceName: draft.name.trim(), DeviceType: Number(draft.deviceType), ConnectionType: Number(draft.connectionType), Ip: draft.ip.trim(), Port: Number(draft.port), ControlByServer: draft.controlByServer, Disabled: draft.disabled, DetectionServerAddress: draft.detectionServerAddress.trim(), DetectionLeft: Number(draft.detectionLeft) || 0, DetectionTop: Number(draft.detectionTop) || 0, DetectionWidth: Number(draft.detectionWidth) || 0, DetectionHeight: Number(draft.detectionHeight) || 0, BoudRate: Number(draft.baudRate) || 0, ComPort: Number(draft.comPort) || 0 };
      if (draft.deviceType === '0') {
        payload.CameraUserName = draft.username.trim();
        if (draft.password) payload.CameraPassword = draft.password;
        if (draft.rtspUrl.trim()) payload.RtspUrl = draft.rtspUrl.trim();
      } else {
        payload.Relay = Number(draft.relay) || 0;
        payload.ReadTimeOut = Number(draft.readTimeout) || 0;
        payload.WriteTimeOut = Number(draft.writeTimeout) || 0;
        payload.IsPcCheck = draft.pcCheck;
        payload.ByService = draft.byService;
      }
      await parkingApi.saveEquipment(payload);
      setMessage(text(language, 'تجهیز ذخیره شد.', 'Equipment saved.'));
      setDialogOpen(false);
      setDraft((current) => ({ ...current, password: '' }));
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? `HTTP ${cause.status}` : text(language, 'ذخیره تجهیز ناموفق بود.', 'Saving equipment failed.'));
    } finally {
      setBusy(false);
    }
  };

  const deleteEquipment = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await parkingApi.deleteEquipment(Number(value(pendingDelete, 'Id')));
      setPendingDelete(null);
      setMessage(text(language, 'تجهیز حذف شد.', 'Equipment deleted.'));
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409 ? text(language, 'تجهیز وابستگی دارد و حذف نشد.', 'Equipment has dependencies and was not deleted.') : text(language, 'حذف تجهیز ناموفق بود.', 'Deleting equipment failed.'));
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof Draft, label: string, options?: { dir?: 'ltr' | 'rtl'; type?: string }) => <TextField label={label} value={String(draft[key])} type={options?.type} dir={options?.dir} onChange={(event: ChangeEvent<HTMLInputElement>) => update(key, event.target.value as never)} />;
  const camera = draft.deviceType === '0';

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${text(language, 'تجهیز', 'equipment')}`} language={language} loading={loading || busy} onRefresh={() => void load()}>
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}><Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={openCreate}>{text(language, 'جدید', 'New')}</Button><Button size="small" startIcon={<EditRoundedIcon />} onClick={openEdit} disabled={!selectedRow || busy}>{text(language, 'ویرایش', 'Edit')}</Button><Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(selectedRow ?? null)} disabled={!selectedRow || busy}>{text(language, 'حذف', 'Delete')}</Button></Box>
    {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}{error && rows.length > 0 && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
    <ResourceState loading={loading} error={rows.length === 0 ? error : ''} empty={!error && rows.length === 0} loadingLabel={text(language, 'در حال دریافت تجهیزات...', 'Loading equipment...')} emptyLabel={text(language, 'تجهیزی برای نمایش وجود ندارد.', 'No equipment found.')}><AppDataGrid<RecordValue> direction={language === 'fa' ? 'rtl' : 'ltr'} defaultFilterOpen rows={rows} rowKey={(row, index) => String(value(row, 'Id') ?? index)} selectedKeys={selectedKeys} selectedKey={selectedKeys[0] ?? null} onSelectionChange={(keys) => setSelectedKeys(keys.map(String))} onRowClick={(row, index) => setSelectedKeys([String(value(row, 'Id') ?? index)])} onRowDoubleClick={(row) => { const next = fromRow(row); setDraft(next); setOriginal(next); setDialogOpen(true); }} columns={[{ key: 'DeviceName', label: text(language, 'نام تجهیز', 'Device name'), render: (row) => String(value(row, 'DeviceName') ?? '—') }, { key: 'DeviceType', label: text(language, 'نوع تجهیز', 'Device type'), render: (row) => String(value(row, 'DeviceType') ?? '—') === '0' ? text(language, 'دوربین شبکه', 'IP camera') : text(language, 'دستگاه تردد', 'Traffic device') }, { key: 'Ip', label: 'IP', render: (row) => <span dir="ltr">{String(value(row, 'Ip') ?? '—')}</span> }, { key: 'Port', label: text(language, 'پورت', 'Port'), render: (row) => <span dir="ltr">{String(value(row, 'Port') ?? '—')}</span> }, { key: 'Disabled', label: text(language, 'وضعیت', 'Status'), boolean: true, getBooleanValue: (row) => !bool(value(row, 'Disabled')), trueLabel: text(language, 'فعال', 'Active'), falseLabel: text(language, 'غیرفعال', 'Disabled') }]} /></ResourceState>
    <CrudDialog open={dialogOpen} title={draft.id ? text(language, 'ویرایش تجهیز', 'Edit equipment') : text(language, 'ایجاد تجهیز', 'Create equipment')} onClose={closeDialog} onConfirm={() => void save()} cancelLabel={text(language, 'لغو', 'Cancel')} confirmLabel={text(language, 'تأیید', 'Save')} busy={busy} maxWidth="lg"><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>{field('name', text(language, 'نام دستگاه', 'Device name'))}<TextField select label={text(language, 'نوع دستگاه', 'Device type')} value={draft.deviceType} onChange={(event) => update('deviceType', event.target.value)}><MenuItem value="0">{text(language, 'دوربین تحت شبکه', 'IP camera')}</MenuItem><MenuItem value="1">POS</MenuItem><MenuItem value="2">{text(language, 'کارت‌خوان', 'Card reader')}</MenuItem><MenuItem value="3">{text(language, 'راهبند', 'Gate')}</MenuItem><MenuItem value="4">{text(language, 'سایر', 'Other')}</MenuItem></TextField><TextField select label={text(language, 'نوع ارتباط', 'Connection type')} value={draft.connectionType} onChange={(event) => update('connectionType', event.target.value)}><MenuItem value="0">{text(language, 'سریال', 'Serial')}</MenuItem><MenuItem value="1">TCP/IP</MenuItem></TextField>{field('ip', 'IP', { dir: 'ltr' })}{field('port', text(language, 'پورت', 'Port'), { dir: 'ltr' })}{camera ? <>{field('username', text(language, 'نام کاربری دوربین', 'Camera username'), { dir: 'ltr' })}{field('password', text(language, 'رمز عبور دوربین', 'Camera password'), { dir: 'ltr', type: 'password' })}{field('rtspUrl', 'RTSP URL', { dir: 'ltr' })}</> : <>{field('comPort', 'COM', { dir: 'ltr' })}{field('relay', text(language, 'رله', 'Relay'), { dir: 'ltr' })}{field('baudRate', text(language, 'نرخ انتقال', 'Transfer rate'), { dir: 'ltr' })}{field('readTimeout', text(language, 'انتظار خواندن', 'Read timeout'), { dir: 'ltr' })}{field('writeTimeout', text(language, 'انتظار نوشتن', 'Write timeout'), { dir: 'ltr' })}</>}{field('detectionServerAddress', text(language, 'سرویس تشخیص پلاک', 'Plate detection service'), { dir: 'ltr' })}{field('detectionLeft', text(language, 'چپ محدوده', 'Detection left'), { dir: 'ltr' })}{field('detectionTop', text(language, 'بالای محدوده', 'Detection top'), { dir: 'ltr' })}{field('detectionWidth', text(language, 'عرض تصویر', 'Detection width'), { dir: 'ltr' })}{field('detectionHeight', text(language, 'ارتفاع تصویر', 'Detection height'), { dir: 'ltr' })}</Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>{([['controlByServer', text(language, 'کنترل از سرور', 'Control by server')], ['pcCheck', text(language, 'کنترل PC', 'PC check')], ['byService', text(language, 'کنترل از سرویس', 'By service')], ['disabled', text(language, 'غیرفعال', 'Disabled')] ] as Array<[keyof Draft, string]>).map(([key, label]) => <FormControlLabel key={String(key)} control={<Checkbox size="small" checked={Boolean(draft[key])} onChange={(event) => update(key, event.target.checked as never)} />} label={label} />)}</Box>{camera && <><Button size="small" startIcon={<VideocamRoundedIcon />} onClick={() => setPreview(toCamera(draft))}>{text(language, 'تست ارتباط دوربین', 'Test camera connection')}</Button>{preview && <CameraStreamPreview camera={preview} language={language} viewer={viewer} size={200} />}</>}{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</CrudDialog>
    <ConfirmDialog open={Boolean(pendingDelete)} title={text(language, 'حذف تجهیز', 'Delete equipment')} message={text(language, 'آیا از حذف تجهیز انتخاب‌شده مطمئن هستید؟', 'Are you sure you want to delete the selected equipment?')} cancelLabel={text(language, 'انصراف', 'Cancel')} confirmLabel={text(language, 'حذف', 'Delete')} busy={busy} onClose={() => setPendingDelete(null)} onConfirm={() => void deleteEquipment()} />
    <ConfirmDialog open={pendingClose} title={text(language, 'تغییرات ذخیره‌نشده', 'Unsaved changes')} message={text(language, 'تغییرات ذخیره‌نشده حذف شوند؟', 'Discard unsaved changes?')} cancelLabel={text(language, 'ماندن', 'Stay')} confirmLabel={text(language, 'حذف تغییرات', 'Discard changes')} onClose={() => setPendingClose(false)} onConfirm={() => { setPendingClose(false); setDialogOpen(false); }} />
  </ManagementWorkspaceFrame>;
}
