import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { ApiError } from '../../api/client';
import type { Camera } from '../../api/management';
import { equipmentService } from '../../features/equipment/equipmentService';
import { EquipmentConnectionTest } from '../../features/equipment/EquipmentConnectionTest';
import { parseHshDetectionConfig } from '../../api/hshDetectionRealtime';
import { parseShahabDetectionConfig } from '../../api/shahabDetectionConfig';
import { useTranslation } from 'react-i18next';
import { AppDataGrid } from '../AppDataGrid';
import { AppGroupBox } from '../AppGroupBox';
import { ConfirmDialog } from '../ConfirmDialog';
import { CrudDialog } from '../CrudDialog';
import { CameraStreamPreview } from './CameraStreamPreview';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { WorkspaceToolbar } from '../WorkspaceToolbar';
import { asRows, recordValue, type Language, type RecordValue } from './managementTypes';
import i18n from '../../i18n/instance';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Draft = { id: number; name: string; deviceType: string; connectionType: string; ip: string; port: string; username: string; password: string; rtspUrl: string; comPort: string; relay: string; baudRate: string; readTimeout: string; writeTimeout: string; controlByServer: boolean; pcCheck: boolean; byService: boolean; disabled: boolean; detectionServerAddress: string; detectionLeft: string; detectionTop: string; detectionWidth: string; detectionHeight: string; raw: RecordValue | null };
const emptyDraft: Draft = { id: 0, name: '', deviceType: '0', connectionType: '1', ip: '', port: '554', username: '', password: '', rtspUrl: '', comPort: '', relay: '0', baudRate: '9600', readTimeout: '3000', writeTimeout: '3000', controlByServer: false, pcCheck: false, byService: false, disabled: false, detectionServerAddress: '', detectionLeft: '200', detectionTop: '400', detectionWidth: '350', detectionHeight: '250', raw: null };
const value = (row: RecordValue, key: string) => recordValue(row, key);
const bool = (input: unknown) => input === true || input === 1 || input === '1' || String(input).toLowerCase() === 'true';
const equipmentTypeLabel = (input: unknown, language: Language) => {
  const keys = { '0': 'camera.typeCamera', '1': 'camera.typeGate', '2': 'camera.typeCardDispenser', '3': 'camera.typeShine', '4': 'camera.typePoro', '5': 'camera.typeFace', '6': 'camera.typePos', '7': 'camera.typeUhf', '8': 'camera.typeCardReader', '9': 'camera.typeQr' } as const;
  return i18n.getFixedT(language)(keys[String(input) as keyof typeof keys] ?? 'camera.typeUnknown', { value: String(input) });
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
  // The explicit endpoint is required when testing a newly entered camera
  // before it has been persisted as equipment. The Backend also supports
  // resolving a saved camera by its persisted equipment id.
  const rtspUrl = draft.rtspUrl.trim();
  return { cameraId, name: draft.name.trim() || cameraId, enabled: !draft.disabled, ...(rtspUrl ? { rtspUrl } : {}) };
}

export function CameraEquipmentWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
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
      setRows(asRows(await equipmentService.getAll(parkingId)));
      setSelectedKeys([]);
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? t('equipment.equipmentAccessIsForbidden') : t('equipment.loadingEquipmentFailed'));
    } finally {
      setLoading(false);
    }
  }, [language, parkingId, t]);

  useEffect(() => { void load(); }, [load]);

  const selectedRow = useMemo(() => rows.find((row, index) => selectedKeys.includes(String(value(row, 'Id') ?? index))), [rows, selectedKeys]);
  const dirty = dialogOpen && JSON.stringify(draft) !== JSON.stringify(original);
  const update = <K extends keyof Draft>(key: K, next: Draft[K]) => { setPreview(null); setDraft((current) => ({ ...current, [key]: next })); };

  const openCreate = () => { const next = { ...emptyDraft, name: t('equipment.new') }; setPreview(null); setError(''); setDraft(next); setOriginal(next); setDialogOpen(true); };
  const openEdit = () => { if (!selectedRow) return; setPreview(null); const next = fromRow(selectedRow); setError(''); setDraft(next); setOriginal(next); setDialogOpen(true); };
  const closeDialog = () => { if (dirty) { setPendingClose(true); return; } setDialogOpen(false); };

  const save = async () => {
    const camera = draft.deviceType === '0';
    const tcp = draft.connectionType === '1';
    const networkAddress = draft.ip.trim();
    const port = Number(draft.port);
    const hasValidPort = /^\d+$/.test(draft.port) && port >= 1 && port <= 65535;
    const hasValidIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(networkAddress) && networkAddress.split('.').every((part) => Number(part) <= 255);
    if (!draft.name.trim() || (camera && (!networkAddress || !hasValidPort)) || (!camera && tcp && (!hasValidIp || !hasValidPort)) || (!camera && !tcp && !/^\d+$/.test(draft.comPort))) {
      setError(t('equipment.nameAndValidConnectionDetailsAreRequired'));
      return;
    }
    if (camera && draft.detectionServerAddress.trim() && !parseHshDetectionConfig(draft.detectionServerAddress) && !parseShahabDetectionConfig(draft.detectionServerAddress)) {
      setError(t('trafficLayout.detectionSettingError'));
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
      await equipmentService.save(payload);
      setMessage(t('equipment.equipmentSaved'));
      setDialogOpen(false);
      setDraft((current) => ({ ...current, password: '' }));
      await load();
    } catch (cause) {
      setError(t('equipment.savingEquipmentFailed'));
    } finally {
      setBusy(false);
    }
  };

  const deleteEquipment = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await equipmentService.delete(Number(value(pendingDelete, 'Id')));
      setPendingDelete(null);
      setMessage(t('equipment.equipmentDeleted'));
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409 ? t('equipment.equipmentHasDependenciesAndWasNotDeleted') : t('equipment.deletingEquipmentFailed'));
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof Draft, label: string, options?: { dir?: 'ltr' | 'rtl'; type?: string; placeholder?: string; helperText?: string }) => <TextField fullWidth size="small" label={label} value={String(draft[key])} type={options?.type} slotProps={{ htmlInput: { dir: options?.dir } }} placeholder={options?.placeholder} helperText={options?.helperText} onChange={(event: ChangeEvent<HTMLInputElement>) => update(key, event.target.value as never)} />;
  const camera = draft.deviceType === '0';
  const tcp = draft.connectionType === '1';
  const connectionSettings = {
    ParkingId: parkingId, DeviceType: Number(draft.deviceType), ConnectionType: Number(draft.connectionType),
    Ip: draft.ip.trim(), Port: Number(draft.port), ComPort: draft.comPort ? Number(draft.comPort) : null,
    BoudRate: Number(draft.baudRate), ReadTimeOut: Number(draft.readTimeout), WriteTimeOut: Number(draft.writeTimeout),
  };
  const deviceTypes = [
    ['0', t('equipment.camera')],
    ['1', t('equipment.gate')],
    ['2', t('equipment.cardDispenser')],
    ['3', t('equipment.shineTrafficController')],
    ['4', t('equipment.poroTrafficController')],
    ['5', t('equipment.faceTrafficController')],
    ['6', t('camera.typePos')],
    ['7', t('equipment.uhfLongRangeReader')],
    ['8', t('equipment.cardReader')],
    ['9', t('equipment.onlineQRCode')],
  ];

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading || busy} onRefresh={() => void load()}>
    <WorkspaceToolbar ariaLabel={t('equipment.equipmentActions')}><Tooltip title={t('equipment.new')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={t('equipment.new')} onClick={openCreate} disabled={busy}><AddRoundedIcon /></IconButton></span></Tooltip><Tooltip title={t('equipment.edit')} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={t('equipment.edit')} onClick={openEdit} disabled={!selectedRow || busy}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={t('equipment.delete')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={t('equipment.delete')} onClick={() => setPendingDelete(selectedRow ?? null)} disabled={!selectedRow || busy}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></WorkspaceToolbar>
    {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}{error && rows.length > 0 && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
    <ResourceState loading={loading} error={rows.length === 0 ? error : ''} empty={!error && rows.length === 0} loadingLabel={t('equipment.loadingEquipment')} emptyLabel={t('equipment.noEquipmentFound')}><AppDataGrid<RecordValue> direction={language === 'fa' ? 'rtl' : 'ltr'} defaultFilterOpen rows={rows} rowKey={(row, index) => String(value(row, 'Id') ?? index)} selectedKeys={selectedKeys} selectedKey={selectedKeys[0] ?? null} onSelectionChange={(keys) => setSelectedKeys(keys.map(String))} onRowClick={(row, index) => setSelectedKeys([String(value(row, 'Id') ?? index)])} onRowDoubleClick={(row) => { setPreview(null); const next = fromRow(row); setDraft(next); setOriginal(next); setDialogOpen(true); }} columns={[{ key: 'DeviceName', label: t('equipment.deviceName'), render: (row) => String(value(row, 'DeviceName') ?? '—') }, { key: 'DeviceType', label: t('equipment.deviceType'), render: (row) => equipmentTypeLabel(value(row, 'DeviceType'), language) }, { key: 'Ip', label: t('equipment.ip'), render: (row) => <span dir="ltr">{String(value(row, 'Ip') ?? '—')}</span> }, { key: 'Port', label: t('equipment.port'), render: (row) => <span dir="ltr">{String(value(row, 'Port') ?? '—')}</span> }, { key: 'Disabled', label: t('equipment.status'), boolean: true, getBooleanValue: (row) => !bool(value(row, 'Disabled')), trueLabel: t('equipment.active'), falseLabel: t('equipment.disabled') }]} /></ResourceState>
    <CrudDialog open={dialogOpen} title={draft.id ? t('equipment.editEquipment') : t('equipment.createEquipment')} onClose={closeDialog} onConfirm={() => void save()} cancelLabel={t('equipment.cancel')} confirmLabel={t('equipment.save')} busy={busy} maxWidth="md" direction={language === 'fa' ? 'rtl' : 'ltr'}>
      <Box className="equipment-editor" sx={{ display: 'grid', gap: 1.5,
        '& .app-group-box': { p: 1.5, gap: 1.5, borderRadius: 1, boxSizing: 'border-box' },
        '& .equipment-editor-control': { gap: 0.5 },
        '& .MuiFormControlLabel-root': { m: 0, alignItems: 'flex-start', gap: 0.5 },
        '& .MuiFormControlLabel-label': { pt: 0.75, typography: 'body1' },
      }}>
        <AppGroupBox title={t('equipment.generalSettings')}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'minmax(0, 2fr) repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>{field('name', t('equipment.deviceName'))}</Box>
            <TextField fullWidth size="small" select label={t('equipment.deviceType')} value={draft.deviceType} onChange={(event) => update('deviceType', event.target.value)}>{deviceTypes.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
            <TextField fullWidth size="small" select label={t('equipment.deviceStatus')} value={String(draft.disabled)} onChange={(event) => update('disabled', event.target.value === 'true')}><MenuItem value="false">{t('equipment.active')}</MenuItem><MenuItem value="true">{t('equipment.disabled')}</MenuItem></TextField>
          </Box>
        </AppGroupBox>
        <Box className="equipment-editor-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.7fr) minmax(240px, 1fr)' }, alignItems: 'stretch', gap: 1.5 }}>
          <AppGroupBox title={t('equipment.connectionSettings')}>
            {!camera && <TextField fullWidth size="small" select label={t('equipment.connectionType')} value={draft.connectionType} onChange={(event) => update('connectionType', event.target.value)}><MenuItem value="0">{t('equipment.serial')}</MenuItem><MenuItem value="1">{t('equipment.tcpIp')}</MenuItem></TextField>}
            {camera || tcp ? <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(88px, 1fr)', gap: 2 }}>
              {field('ip', t(camera ? 'equipment.cameraAddress' : 'equipment.deviceAddress'), { dir: 'ltr' })}
              {field('port', t(camera ? 'equipment.cameraPort' : 'equipment.port'), { dir: 'ltr' })}
            </Box> : <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
              {field('comPort', t('equipment.com'), { dir: 'ltr' })}
              {field('baudRate', t('equipment.baudRate'), { dir: 'ltr' })}
            </Box>}
            {camera && <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                {field('username', t('equipment.username'), { dir: 'ltr' })}
                {field('password', t('equipment.password'), { dir: 'ltr', type: 'password' })}
              </Box>
              {field('rtspUrl', t('equipment.rtspUrl'), { dir: 'ltr' })}
            </>}
          </AppGroupBox>
          {camera && <AppGroupBox title={t('equipment.cameraPreview')}>
            {dialogOpen && preview ? <CameraStreamPreview camera={preview} language={language} viewer={viewer} size={{ width: '100%', height: 112 }} compact autoConnect /> : <Box sx={{ height: 112, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary' }}>
              <VideocamRoundedIcon sx={{ fontSize: 28 }} />
              <Typography variant="caption">{t('cameraPreview.inactive')}</Typography>
            </Box>}
            {!preview && <Button fullWidth variant="outlined" size="small" startIcon={<VideocamRoundedIcon />} disabled={busy} onClick={() => setPreview(toCamera(draft))}>{t('equipment.testCameraConnection')}</Button>}
          </AppGroupBox>}
          {!camera && dialogOpen && <AppGroupBox title={t('equipmentTest.title')}>
            <EquipmentConnectionTest key={JSON.stringify(connectionSettings)} settings={connectionSettings} busy={busy} language={language} showTitle={false} />
          </AppGroupBox>}
          {camera ? <AppGroupBox title={t('equipment.detectionSettings')}>
            {field('detectionServerAddress', t('trafficLayout.detectionSettingLabel'), { dir: 'ltr', placeholder: 'db://cameraid=1', helperText: t('trafficLayout.detectionSettingHint') })}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
              {field('detectionLeft', t('equipment.detectionLeft'), { dir: 'ltr' })}
              {field('detectionTop', t('equipment.detectionTop'), { dir: 'ltr' })}
              {field('detectionWidth', t('equipment.detectionWidth'), { dir: 'ltr' })}
              {field('detectionHeight', t('equipment.detectionHeight'), { dir: 'ltr' })}
            </Box>
          </AppGroupBox> : <AppGroupBox title={t('equipment.deviceSettings')}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
              {field('relay', t('equipment.relay'), { dir: 'ltr' })}
              {field('readTimeout', t('equipment.readTimeout'), { dir: 'ltr' })}
              {field('writeTimeout', t('equipment.writeTimeout'), { dir: 'ltr' })}
            </Box>
          </AppGroupBox>}
          <AppGroupBox className="equipment-editor-control" title={t('equipment.controlSettings')}>
            <FormControlLabel control={<Checkbox size="small" checked={draft.controlByServer} onChange={(event) => update('controlByServer', event.target.checked)} />} label={t('equipment.controlDeviceAutomatically')} />
            {!camera && <FormControlLabel control={<Checkbox size="small" checked={draft.pcCheck} onChange={(event) => update('pcCheck', event.target.checked)} />} label={t('equipment.pcCheck')} />}
            {draft.deviceType === '1' && <FormControlLabel control={<Checkbox size="small" checked={draft.byService} onChange={(event) => update('byService', event.target.checked)} />} label={t('equipment.byService')} />}
          </AppGroupBox>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </CrudDialog>
    <ConfirmDialog open={Boolean(pendingDelete)} title={t('equipment.deleteEquipment')} message={t('equipment.areYouSureYouWantToDeleteTheSelectedEquipment')} cancelLabel={t('equipment.cancel')} confirmLabel={t('equipment.delete')} busy={busy} onClose={() => setPendingDelete(null)} onConfirm={() => void deleteEquipment()} />
    <ConfirmDialog open={pendingClose} title={t('equipment.unsavedChanges')} message={t('equipment.discardUnsavedChanges')} cancelLabel={t('equipment.stay')} confirmLabel={t('equipment.discardChanges')} onClose={() => setPendingClose(false)} onConfirm={() => { setPendingClose(false); setDialogOpen(false); }} />
  </ManagementWorkspaceFrame>;
}
