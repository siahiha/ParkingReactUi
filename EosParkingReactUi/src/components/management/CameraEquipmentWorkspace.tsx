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
const equipmentTypeLabel = (input: unknown, language: Language) => {
  const labels: Record<string, [string, string]> = {
    '0': ['دوربین', 'Camera'], '1': ['راهبند', 'Gate'], '2': ['دستگاه صدور کارت', 'Card dispenser'],
    '3': ['کنترل‌کننده تردد Shine', 'Shine traffic controller'], '4': ['کنترل‌کننده تردد Poro', 'Poro traffic controller'],
    '5': ['کنترل‌کننده تردد چهره', 'Face traffic controller'], '6': ['POS', 'POS'],
    '7': ['خوانشگر UHF برد بلند', 'UHF long-range reader'], '8': ['کارت‌خوان', 'Card reader'], '9': ['QR آنلاین', 'Online QR code'],
  };
  const label = labels[String(input)];
  return label ? text(language, label[0], label[1]) : text(language, `نوع ${String(input)}`, `Type ${String(input)}`);
};

function getViewerId() {
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
}

function fromRow(row: RecordValue): Draft {
  return { id: Number(value(row, 'Id') ?? 0), name: String(value(row, 'DeviceName') ?? ''), deviceType: String(value(row, 'DeviceType') ?? 0), connectionType: String(value(row, 'ConnectionType') ?? 1), ip: String(value(row, 'Ip') ?? ''), port: String(value(row, 'Port') ?? (String(value(row, 'DeviceType') ?? 0) === '0' ? '554' : '1001')), username: String(value(row, 'CameraUserName') ?? ''), password: '', rtspUrl: String(value(row, 'RtspUrl') ?? value(row, 'RTSPUrl') ?? value(row, 'RtspURL') ?? ''), comPort: String(value(row, 'ComPort') ?? ''), relay: String(value(row, 'Relay') ?? 0), baudRate: String(value(row, 'BoudRate') ?? 9600), readTimeout: String(value(row, 'ReadTimeOut') ?? 3000), writeTimeout: String(value(row, 'WriteTimeOut') ?? 3000), controlByServer: bool(value(row, 'ControlByServer')), pcCheck: bool(value(row, 'IsPcCheck')), byService: bool(value(row, 'ByService')), disabled: bool(value(row, 'Disabled')), detectionServerAddress: String(value(row, 'DetectionServerAddress') ?? ''), detectionLeft: String(value(row, 'DetectionLeft') ?? 200), detectionTop: String(value(row, 'DetectionTop') ?? 400), detectionWidth: String(value(row, 'DetectionWidth') ?? 350), detectionHeight: String(value(row, 'DetectionHeight') ?? 250), raw: row };
}

function toCamera(draft: Draft): Camera {
  const cameraId = draft.id > 0 ? String(draft.id) : draft.name.trim().replace(/[^A-Za-z0-9_.:-]+/g, '-') || 'camera';
  // The persisted camera id is enough for the Backend to load IP, port and
  // credentials from the database. Do not place those credentials in a
  // browser request or in the component state used for connection testing.
  return { cameraId, name: draft.name.trim() || cameraId, enabled: !draft.disabled };
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
    const camera = draft.deviceType === '0';
    const tcp = draft.connectionType === '1';
    const networkAddress = draft.ip.trim();
    const port = Number(draft.port);
    const hasValidPort = /^\d+$/.test(draft.port) && port >= 1 && port <= 65535;
    const hasValidIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(networkAddress) && networkAddress.split('.').every((part) => Number(part) <= 255);
    if (!draft.name.trim() || (camera && (!networkAddress || !hasValidPort)) || (!camera && tcp && (!hasValidIp || !hasValidPort)) || (!camera && !tcp && !/^\d+$/.test(draft.comPort))) {
      setError(text(language, 'نام و اطلاعات ارتباطی معتبر الزامی است.', 'Name and valid connection details are required.'));
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
  const tcp = draft.connectionType === '1';
  const deviceTypes = [
    ['0', text(language, 'دوربین', 'Camera')],
    ['1', text(language, 'راهبند', 'Gate')],
    ['2', text(language, 'دستگاه صدور کارت', 'Card dispenser')],
    ['3', text(language, 'کنترل‌کننده تردد Shine', 'Shine traffic controller')],
    ['4', text(language, 'کنترل‌کننده تردد Poro', 'Poro traffic controller')],
    ['5', text(language, 'کنترل‌کننده تردد چهره', 'Face traffic controller')],
    ['6', 'POS'],
    ['7', text(language, 'خوانشگر UHF برد بلند', 'UHF long-range reader')],
    ['8', text(language, 'کارت‌خوان', 'Card reader')],
    ['9', text(language, 'QR آنلاین', 'Online QR code')],
  ];

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${text(language, 'تجهیز', 'equipment')}`} language={language} loading={loading || busy} onRefresh={() => void load()}>
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}><Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={openCreate}>{text(language, 'جدید', 'New')}</Button><Button size="small" startIcon={<EditRoundedIcon />} onClick={openEdit} disabled={!selectedRow || busy}>{text(language, 'ویرایش', 'Edit')}</Button><Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(selectedRow ?? null)} disabled={!selectedRow || busy}>{text(language, 'حذف', 'Delete')}</Button></Box>
    {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}{error && rows.length > 0 && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
    <ResourceState loading={loading} error={rows.length === 0 ? error : ''} empty={!error && rows.length === 0} loadingLabel={text(language, 'در حال دریافت تجهیزات...', 'Loading equipment...')} emptyLabel={text(language, 'تجهیزی برای نمایش وجود ندارد.', 'No equipment found.')}><AppDataGrid<RecordValue> direction={language === 'fa' ? 'rtl' : 'ltr'} defaultFilterOpen rows={rows} rowKey={(row, index) => String(value(row, 'Id') ?? index)} selectedKeys={selectedKeys} selectedKey={selectedKeys[0] ?? null} onSelectionChange={(keys) => setSelectedKeys(keys.map(String))} onRowClick={(row, index) => setSelectedKeys([String(value(row, 'Id') ?? index)])} onRowDoubleClick={(row) => { const next = fromRow(row); setDraft(next); setOriginal(next); setDialogOpen(true); }} columns={[{ key: 'DeviceName', label: text(language, 'نام تجهیز', 'Device name'), render: (row) => String(value(row, 'DeviceName') ?? '—') }, { key: 'DeviceType', label: text(language, 'نوع تجهیز', 'Device type'), render: (row) => equipmentTypeLabel(value(row, 'DeviceType'), language) }, { key: 'Ip', label: 'IP', render: (row) => <span dir="ltr">{String(value(row, 'Ip') ?? '—')}</span> }, { key: 'Port', label: text(language, 'پورت', 'Port'), render: (row) => <span dir="ltr">{String(value(row, 'Port') ?? '—')}</span> }, { key: 'Disabled', label: text(language, 'وضعیت', 'Status'), boolean: true, getBooleanValue: (row) => !bool(value(row, 'Disabled')), trueLabel: text(language, 'فعال', 'Active'), falseLabel: text(language, 'غیرفعال', 'Disabled') }]} /></ResourceState>
    <CrudDialog open={dialogOpen} title={draft.id ? text(language, 'ویرایش تجهیز', 'Edit equipment') : text(language, 'ایجاد تجهیز', 'Create equipment')} onClose={closeDialog} onConfirm={() => void save()} cancelLabel={text(language, 'لغو', 'Cancel')} confirmLabel={text(language, 'تأیید', 'Save')} busy={busy} maxWidth="lg">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box component="section" aria-labelledby="equipment-general-settings" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          <Box id="equipment-general-settings" sx={{ gridColumn: { md: '1 / -1' }, borderBottom: 1, borderColor: 'divider', pb: 0.75, fontWeight: 700 }}>{text(language, `مشخصات ${draft.name || 'تجهیز'}`, `Properties of ${draft.name || 'equipment'}`)}</Box>
          {field('name', text(language, 'نام دستگاه', 'Device name'))}
          <TextField select label={text(language, 'نوع دستگاه', 'Device type')} value={draft.deviceType} onChange={(event) => update('deviceType', event.target.value)}>{deviceTypes.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
          <TextField select label={text(language, 'وضعیت دستگاه', 'Device status')} value={String(draft.disabled)} onChange={(event) => update('disabled', event.target.value === 'true')}><MenuItem value="false">{text(language, 'فعال', 'Active')}</MenuItem><MenuItem value="true">{text(language, 'غیرفعال', 'Disabled')}</MenuItem></TextField>
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}><FormControlLabel control={<Checkbox size="small" checked={draft.controlByServer} onChange={(event) => update('controlByServer', event.target.checked)} />} label={text(language, 'کنترل دستگاه به‌صورت اتوماتیک انجام گردد', 'Control device automatically')} /></Box>
        </Box>
        <Box component="fieldset" sx={{ minWidth: 0, m: 0, px: 2, pb: 2, border: 1, borderColor: 'divider', borderRadius: 0.5 }}>
          <Box component="legend" sx={{ px: 1, fontSize: '0.875rem', fontWeight: 700, color: 'text.secondary' }}>{text(language, 'مشخصات دستگاه', 'Device settings')}</Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {!camera && <TextField select label={text(language, 'نوع ارتباط', 'Connection type')} value={draft.connectionType} onChange={(event) => update('connectionType', event.target.value)}><MenuItem value="0">{text(language, 'سریال', 'Serial')}</MenuItem><MenuItem value="1">TCP/IP</MenuItem></TextField>}
            {camera ? <>{field('ip', text(language, 'آدرس دوربین', 'Camera address'), { dir: 'ltr' })}{field('port', text(language, 'پورت دوربین', 'Camera port'), { dir: 'ltr' })}{field('username', text(language, 'نام کاربری', 'Username'), { dir: 'ltr' })}{field('password', text(language, 'رمز عبور', 'Password'), { dir: 'ltr', type: 'password' })}{field('rtspUrl', 'RTSP URL', { dir: 'ltr' })}</> : <>{tcp ? <>{field('ip', text(language, 'آدرس دستگاه', 'Device address'), { dir: 'ltr' })}{field('port', text(language, 'پورت', 'Port'), { dir: 'ltr' })}</> : <>{field('comPort', 'COM', { dir: 'ltr' })}{field('baudRate', text(language, 'نرخ انتقال داده', 'Baud rate'), { dir: 'ltr' })}</>}{field('relay', text(language, 'رله', 'Relay'), { dir: 'ltr' })}{field('readTimeout', text(language, 'انتظار برای خواندن', 'Read timeout'), { dir: 'ltr' })}{field('writeTimeout', text(language, 'انتظار برای نوشتن', 'Write timeout'), { dir: 'ltr' })}{<FormControlLabel control={<Checkbox size="small" checked={draft.pcCheck} onChange={(event) => update('pcCheck', event.target.checked)} />} label={text(language, 'کنترل PC', 'PC check')} />}{draft.deviceType === '1' && <FormControlLabel control={<Checkbox size="small" checked={draft.byService} onChange={(event) => update('byService', event.target.checked)} />} label={text(language, 'کنترل از سرویس', 'By service')} />}</>}
            {camera && <Box sx={{ gridColumn: { md: '1 / -1' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>{field('detectionServerAddress', text(language, 'سرویس تشخیص پلاک', 'Plate detection service'), { dir: 'ltr' })}{field('detectionLeft', text(language, 'چپ محدوده', 'Detection left'), { dir: 'ltr' })}{field('detectionTop', text(language, 'بالای محدوده', 'Detection top'), { dir: 'ltr' })}{field('detectionWidth', text(language, 'عرض تصویر', 'Detection width'), { dir: 'ltr' })}{field('detectionHeight', text(language, 'ارتفاع تصویر', 'Detection height'), { dir: 'ltr' })}</Box>}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            {camera ? <><Button size="small" startIcon={<VideocamRoundedIcon />} onClick={() => setPreview(toCamera(draft))}>{text(language, 'تست ارتباط دوربین', 'Test camera connection')}</Button>{preview && <CameraStreamPreview camera={preview} language={language} viewer={viewer} size={200} />}</> : <Button size="small" onClick={() => setMessage(text(language, 'آماده تست اتصال دستگاه است.', 'The device is ready for connection testing.'))}>{text(language, 'تست اتصال', 'Test connection')}</Button>}
          </Box>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </CrudDialog>
    <ConfirmDialog open={Boolean(pendingDelete)} title={text(language, 'حذف تجهیز', 'Delete equipment')} message={text(language, 'آیا از حذف تجهیز انتخاب‌شده مطمئن هستید؟', 'Are you sure you want to delete the selected equipment?')} cancelLabel={text(language, 'انصراف', 'Cancel')} confirmLabel={text(language, 'حذف', 'Delete')} busy={busy} onClose={() => setPendingDelete(null)} onConfirm={() => void deleteEquipment()} />
    <ConfirmDialog open={pendingClose} title={text(language, 'تغییرات ذخیره‌نشده', 'Unsaved changes')} message={text(language, 'تغییرات ذخیره‌نشده حذف شوند؟', 'Discard unsaved changes?')} cancelLabel={text(language, 'ماندن', 'Stay')} confirmLabel={text(language, 'حذف تغییرات', 'Discard changes')} onClose={() => setPendingClose(false)} onConfirm={() => { setPendingClose(false); setDialogOpen(false); }} />
  </ManagementWorkspaceFrame>;
}
