import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { AppDataGrid } from '../AppDataGrid';
import { ConfirmDialog } from '../ConfirmDialog';
import { CrudDialog } from '../CrudDialog';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { WorkspaceToolbar } from '../WorkspaceToolbar';
import { asRows, type Language, type RecordValue } from './managementTypes';
import { ensureApiSuccess } from '../definitions/definitionDomain';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language; canEdit?: boolean; canDelete?: boolean };
type UnknownRecord = Record<string, unknown>;
type EquipmentOption = { id: number; label: string; deviceType: number; disabled: boolean };
type DoorDeviceDraft = { id: number; equipmentId: number; equipmentTitle: string; trafficType: string; raw: UnknownRecord | null };
type DoorDraft = {
  id: number;
  title: string;
  description: string;
  doorType: string;
  entryAuthorizationType: string;
  gateEntranceDeviceId: string;
  gateExitDeviceId: string;
  qrEntranceDeviceId: string;
  qrExitDeviceId: string;
  entranceCameraId: string;
  exitCameraId: string;
  pcPosId: string;
  uhfReaderId: string;
  cardReaderId: string;
  haveLcdPrice: boolean;
  lcdPricePort: string;
  doorCode: string;
  devices: DoorDeviceDraft[];
  raw: UnknownRecord | null;
};

const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const value = (row: UnknownRecord, key: string): unknown => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
const numberValue = (input: unknown, fallback = 0) => {
  const next = Number(input);
  return Number.isFinite(next) ? next : fallback;
};
const boolValue = (input: unknown) => input === true || input === 1 || input === '1' || String(input).toLowerCase() === 'true';
const objectValue = (input: unknown): UnknownRecord => input && typeof input === 'object' && !Array.isArray(input) ? input as UnknownRecord : {};
const objectRows = (input: unknown): UnknownRecord[] => {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is UnknownRecord => Boolean(item && typeof item === 'object' && !Array.isArray(item)));
};

const doorTypes = (language: Language) => [
  ['0', text(language, 'ورود', 'Entrance')],
  ['1', text(language, 'خروج', 'Exit')],
  ['2', text(language, 'ورود و خروج', 'Entrance and exit')],
  ['3', text(language, 'درب داخلی', 'Internal door')],
];

const authorizationTypes = (language: Language) => [
  ['0', text(language, 'کارت', 'Card')],
  ['1', text(language, 'کارت و عکس', 'Card and picture')],
  ['2', text(language, 'تشخیص پلاک', 'Plate recognition')],
  ['3', text(language, 'کارت و تشخیص پلاک', 'Card and plate recognition')],
  ['4', text(language, 'کارت یا تشخیص پلاک', 'Card or plate recognition')],
  ['5', text(language, 'QR Code', 'QR Code')],
  ['6', text(language, 'QR Code و تشخیص پلاک', 'QR Code and plate recognition')],
];

const trafficTypes = (language: Language) => [
  ['0', text(language, 'همه', 'Everyone')],
  ['1', text(language, 'فقط اعضا', 'Members only')],
  ['2', text(language, 'فقط غیر اعضا', 'Non-members only')],
];

function emptyDraft(): DoorDraft {
  return {
    id: 0,
    title: '',
    description: '',
    doorType: '0',
    entryAuthorizationType: '0',
    gateEntranceDeviceId: '',
    gateExitDeviceId: '',
    qrEntranceDeviceId: '',
    qrExitDeviceId: '',
    entranceCameraId: '',
    exitCameraId: '',
    pcPosId: '',
    uhfReaderId: '',
    cardReaderId: '',
    haveLcdPrice: false,
    lcdPricePort: '0',
    doorCode: '0',
    devices: [],
    raw: null,
  };
}

function normalizeDevices(row: UnknownRecord): DoorDeviceDraft[] {
  const source = value(row, 'DtoViewParkingDoorDevices') ?? value(row, 'ParkingDoorDevices');
  return objectRows(source).map((device) => ({
    id: numberValue(value(device, 'Id')),
    equipmentId: numberValue(value(device, 'EquipmentId')),
    equipmentTitle: String(value(device, 'EquipmentTitle') ?? value(device, 'DeviceName') ?? '—'),
    trafficType: String(numberValue(value(device, 'TrafficType'))),
    raw: device,
  })).filter((device) => device.equipmentId > 0);
}

function fromRow(row: RecordValue): DoorDraft {
  const source = row as UnknownRecord;
  return {
    id: numberValue(value(source, 'Id')),
    title: String(value(source, 'Title') ?? ''),
    description: String(value(source, 'Description') ?? ''),
    doorType: String(numberValue(value(source, 'DoorType'))),
    entryAuthorizationType: String(numberValue(value(source, 'EntryAuthorizaitionType'))),
    gateEntranceDeviceId: String(value(source, 'GateEntranceDeviceId') ?? ''),
    gateExitDeviceId: String(value(source, 'GateExitDeviceId') ?? ''),
    qrEntranceDeviceId: String(value(source, 'QrEntranceDeviceId') ?? ''),
    qrExitDeviceId: String(value(source, 'QrExitDeviceId') ?? ''),
    entranceCameraId: String(value(source, 'EnteranceCameraId') ?? ''),
    exitCameraId: String(value(source, 'ExitCameraId') ?? ''),
    pcPosId: String(value(source, 'PcPosId') ?? ''),
    uhfReaderId: String(value(source, 'UHF_LongRangeReaderId') ?? ''),
    cardReaderId: String(value(source, 'CardReaderId') ?? ''),
    haveLcdPrice: boolValue(value(source, 'HaveLcdPrice')),
    lcdPricePort: String(value(source, 'LcdPricePort') ?? '0'),
    doorCode: String(value(source, 'DoorCode') ?? '0'),
    devices: normalizeDevices(source),
    raw: source,
  };
}

function toEquipmentOptions(input: unknown): EquipmentOption[] {
  return asRows(input).map((row) => {
    const source = row as UnknownRecord;
    return {
      id: numberValue(value(source, 'Id')),
      label: String(value(source, 'DeviceName') ?? value(source, 'Title') ?? ''),
      deviceType: numberValue(value(source, 'DeviceType')),
      disabled: boolValue(value(source, 'Disabled')),
    };
  }).filter((item) => item.id > 0 && item.label);
}

function toOptionalId(input: string) {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function selectedEquipment(draft: DoorDraft, key: keyof Pick<DoorDraft, 'gateEntranceDeviceId' | 'gateExitDeviceId' | 'qrEntranceDeviceId' | 'qrExitDeviceId' | 'entranceCameraId' | 'exitCameraId' | 'pcPosId' | 'uhfReaderId' | 'cardReaderId'>) {
  return toOptionalId(draft[key]);
}

export function ParkingDoorWorkspace({ title, pageTitle, parkingId, language, canEdit = true, canDelete = true }: Props) {
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [draft, setDraft] = useState<DoorDraft>(emptyDraft);
  const [original, setOriginal] = useState<DoorDraft>(emptyDraft);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RecordValue | null>(null);
  const [pendingClose, setPendingClose] = useState(false);
  const [newEquipmentId, setNewEquipmentId] = useState('');
  const [newTrafficType, setNewTrafficType] = useState('0');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [doorResponse, equipmentResponse] = await Promise.all([parkingApi.getDoors(parkingId), parkingApi.getEquipments(parkingId)]);
      setRows(asRows(doorResponse));
      setEquipment(toEquipmentOptions(equipmentResponse));
      setSelectedKeys([]);
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403
        ? text(language, 'دسترسی مشاهده درب‌ها مجاز نیست.', 'Door access is forbidden.')
        : text(language, 'دریافت درب‌های پارکینگ ناموفق بود.', 'Loading parking doors failed.'));
    } finally {
      setLoading(false);
    }
  }, [language, parkingId]);

  useEffect(() => { void load(); }, [load]);

  const selectedRow = useMemo(() => rows.find((row, index) => selectedKeys.includes(String(value(row as UnknownRecord, 'Id') ?? index))), [rows, selectedKeys]);
  const dirty = dialogOpen && JSON.stringify(draft) !== JSON.stringify(original);
  const update = <K extends keyof DoorDraft>(key: K, next: DoorDraft[K]) => setDraft((current) => ({ ...current, [key]: next }));

  const openCreate = () => {
    setError('');
    setMessage('');
    const next = emptyDraft();
    setDraft(next);
    setOriginal(next);
    setNewEquipmentId('');
    setNewTrafficType('0');
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!selectedRow) return;
    setError('');
    setMessage('');
    const next = fromRow(selectedRow);
    setDraft(next);
    setOriginal(next);
    setNewEquipmentId('');
    setNewTrafficType('0');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (dirty) {
      setPendingClose(true);
      return;
    }
    setDialogOpen(false);
  };

  const addDevice = () => {
    const equipmentId = Number(newEquipmentId);
    const option = equipment.find((item) => item.id === equipmentId);
    if (!option || draft.devices.some((item) => item.equipmentId === equipmentId)) return;
    update('devices', [...draft.devices, { id: 0, equipmentId, equipmentTitle: option.label, trafficType: newTrafficType, raw: null }]);
    setNewEquipmentId('');
    setNewTrafficType('0');
  };

  const removeDevice = (equipmentId: number) => update('devices', draft.devices.filter((device) => device.equipmentId !== equipmentId));

  const save = async () => {
    const titleValue = draft.title.trim();
    const doorType = Number(draft.doorType);
    const doorCode = Number(draft.doorCode);
    const lcdPort = Number(draft.lcdPricePort);
    const entranceGate = selectedEquipment(draft, 'gateEntranceDeviceId');
    const exitGate = selectedEquipment(draft, 'gateExitDeviceId');
    const entranceQr = selectedEquipment(draft, 'qrEntranceDeviceId');
    const exitQr = selectedEquipment(draft, 'qrExitDeviceId');
    if (!titleValue) {
      setError(text(language, 'عنوان درب الزامی است.', 'Door title is required.'));
      return;
    }
    if (![0, 1, 2, 3].includes(doorType)) {
      setError(text(language, 'نوع درب را انتخاب کنید.', 'Select a door type.'));
      return;
    }
    if (entranceGate && entranceGate === exitGate) {
      setError(text(language, 'راهبند ورود و خروج نمی‌تواند یکسان باشد.', 'Entrance and exit gates cannot be the same.'));
      return;
    }
    if (entranceQr && entranceQr === exitQr) {
      setError(text(language, 'تجهیز QR ورود و خروج نمی‌تواند یکسان باشد.', 'Entrance and exit QR devices cannot be the same.'));
      return;
    }
    if (!Number.isInteger(doorCode) || doorCode < 0 || (draft.haveLcdPrice && (!Number.isInteger(lcdPort) || lcdPort < 0))) {
      setError(text(language, 'کد درب و پورت نمایشگر باید عدد صحیح نامنفی باشند.', 'Door code and display port must be non-negative integers.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const entranceEnabled = doorType !== 1;
      const exitEnabled = doorType !== 0;
      const payload: Record<string, unknown> = {
        Id: draft.id,
        ParkingId: parkingId,
        Title: titleValue,
        Description: draft.description.trim(),
        DoorType: doorType,
        EntryAuthorizaitionType: Number(draft.entryAuthorizationType),
        GateEntranceDeviceId: entranceEnabled ? entranceGate : null,
        GateExitDeviceId: exitEnabled ? exitGate : null,
        QrEntranceDeviceId: entranceEnabled ? entranceQr : null,
        QrExitDeviceId: exitEnabled ? exitQr : null,
        EnteranceCameraId: entranceEnabled ? selectedEquipment(draft, 'entranceCameraId') : null,
        ExitCameraId: exitEnabled ? selectedEquipment(draft, 'exitCameraId') : null,
        PcPosId: selectedEquipment(draft, 'pcPosId'),
        UHF_LongRangeReaderId: selectedEquipment(draft, 'uhfReaderId'),
        CardReaderId: selectedEquipment(draft, 'cardReaderId'),
        HaveLcdPrice: draft.haveLcdPrice,
        LcdPricePort: draft.haveLcdPrice ? lcdPort : 0,
        DoorCode: doorCode,
        DtoViewParkingDoorDevices: draft.devices.map((device) => ({ ...(device.raw ?? {}), Id: device.id, DoorId: draft.id, EquipmentId: device.equipmentId, TrafficType: Number(device.trafficType) })),
      };
      const response = await parkingApi.saveDoor(payload);
      ensureApiSuccess(response);
      setMessage(text(language, 'درب با موفقیت ذخیره شد.', 'Door saved successfully.'));
      setDialogOpen(false);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? `HTTP ${cause.status}` : cause instanceof Error ? cause.message : text(language, 'ذخیره درب ناموفق بود.', 'Saving the door failed.'));
    } finally {
      setBusy(false);
    }
  };

  const deleteDoor = async () => {
    if (!pendingDelete) return;
    const id = numberValue(value(pendingDelete as UnknownRecord, 'Id'));
    if (id <= 0) return;
    setBusy(true);
    setError('');
    try {
      const response = await parkingApi.deleteDoor(id);
      ensureApiSuccess(response);
      const result = value(objectValue(response), 'Values');
      if (result === false || result === 'false') throw new Error(text(language, 'حذف درب توسط API تأیید نشد.', 'The API did not confirm door deletion.'));
      setPendingDelete(null);
      setMessage(text(language, 'درب با موفقیت حذف شد.', 'Door deleted successfully.'));
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409
        ? text(language, 'این درب وابستگی دارد و حذف نشد.', 'This door has dependencies and was not deleted.')
        : cause instanceof Error ? cause.message : text(language, 'حذف درب ناموفق بود.', 'Deleting the door failed.'));
    } finally {
      setBusy(false);
    }
  };

  const equipmentFor = (types: number[]) => equipment.filter((item) => types.includes(item.deviceType) && !item.disabled);
  const assignedIds = new Set(draft.devices.map((device) => device.equipmentId));
  const availableDevices = equipment.filter((item) => !item.disabled && !assignedIds.has(item.id) && ![1, 0, 6].includes(item.deviceType));
  const field = (key: keyof DoorDraft, label: string, options?: { type?: string; dir?: 'ltr' | 'rtl'; disabled?: boolean; required?: boolean }) => <TextField fullWidth size="small" label={label} value={String(draft[key])} type={options?.type} dir={options?.dir} disabled={options?.disabled || busy} required={options?.required} onChange={(event: ChangeEvent<HTMLInputElement>) => update(key, event.target.value as never)} />;
  const equipmentField = (key: keyof Pick<DoorDraft, 'gateEntranceDeviceId' | 'gateExitDeviceId' | 'qrEntranceDeviceId' | 'qrExitDeviceId' | 'entranceCameraId' | 'exitCameraId' | 'pcPosId' | 'uhfReaderId' | 'cardReaderId'>, label: string, types: number[], disabled = false) => <TextField select fullWidth size="small" label={label} value={draft[key]} disabled={disabled || busy} onChange={(event) => update(key, event.target.value)}><MenuItem value="">{text(language, 'انتخاب نشده', 'Not selected')}</MenuItem>{equipmentFor(types).map((item) => <MenuItem key={item.id} value={String(item.id)}>{item.label}</MenuItem>)}</TextField>;

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${text(language, 'درب', 'doors')}`} language={language} loading={loading || busy} onRefresh={() => void load()}>
    <WorkspaceToolbar ariaLabel={text(language, 'عملیات درب‌های پارکینگ', 'Parking door actions')}>
      {canEdit && <Tooltip title={text(language, 'جدید', 'New')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={text(language, 'جدید', 'New')} onClick={openCreate} disabled={busy}><AddRoundedIcon /></IconButton></span></Tooltip>}
      {canEdit && <Tooltip title={text(language, 'ویرایش', 'Edit')} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={text(language, 'ویرایش', 'Edit')} onClick={openEdit} disabled={!selectedRow || busy}><EditRoundedIcon /></IconButton></span></Tooltip>}
      {canDelete && <Tooltip title={text(language, 'حذف', 'Delete')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={text(language, 'حذف', 'Delete')} onClick={() => setPendingDelete(selectedRow ?? null)} disabled={!selectedRow || busy}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip>}
    </WorkspaceToolbar>
    {message && <Alert severity="success" sx={{ mb: 1 }}>{message}</Alert>}
    {error && rows.length > 0 && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
    <ResourceState loading={loading} error={rows.length === 0 ? error : ''} empty={!error && rows.length === 0} loadingLabel={text(language, 'در حال دریافت درب‌ها...', 'Loading doors...')} emptyLabel={text(language, 'دربی برای نمایش وجود ندارد.', 'No doors found.')}>
      <AppDataGrid<RecordValue>
        direction={language === 'fa' ? 'rtl' : 'ltr'}
        defaultFilterOpen
        rows={rows}
        rowKey={(row, index) => String(value(row as UnknownRecord, 'Id') ?? index)}
        selectedKey={selectedKeys[0] ?? null}
        onSelectionChange={(keys) => setSelectedKeys(keys.map(String))}
        onRowClick={(row, index) => setSelectedKeys([String(value(row as UnknownRecord, 'Id') ?? index)])}
        onRowDoubleClick={canEdit ? (row) => { const next = fromRow(row); setDraft(next); setOriginal(next); setDialogOpen(true); } : undefined}
        columns={[
          { key: 'Title', label: text(language, 'عنوان درب', 'Door title'), render: (row) => String(value(row as UnknownRecord, 'Title') ?? '—') },
          { key: 'DoorType', label: text(language, 'نوع درب', 'Door type'), render: (row) => doorTypes(language).find(([key]) => key === String(numberValue(value(row as UnknownRecord, 'DoorType'))))?.[1] ?? '—' },
          { key: 'EntryAuthorizaitionType', label: text(language, 'روش مجوز تردد', 'Entry authorization'), render: (row) => authorizationTypes(language).find(([key]) => key === String(numberValue(value(row as UnknownRecord, 'EntryAuthorizaitionType'))))?.[1] ?? '—' },
          { key: 'DoorCode', label: text(language, 'کد درب', 'Door code'), render: (row) => <span dir="ltr">{String(value(row as UnknownRecord, 'DoorCode') ?? '0')}</span> },
          { key: 'Devices', label: text(language, 'تجهیزات متصل', 'Connected equipment'), filterable: false, render: (row) => String(normalizeDevices(row as UnknownRecord).length) },
        ]}
      />
    </ResourceState>
    <CrudDialog open={dialogOpen} title={draft.id ? text(language, 'ویرایش درب', 'Edit door') : text(language, 'ایجاد درب', 'Create door')} onClose={closeDialog} onConfirm={() => void save()} cancelLabel={text(language, 'لغو', 'Cancel')} confirmLabel={text(language, 'ذخیره', 'Save')} busy={busy} maxWidth="lg">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box component="section" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {field('title', text(language, 'عنوان درب', 'Door title'), { required: true })}
          <TextField select fullWidth size="small" label={text(language, 'نوع درب', 'Door type')} value={draft.doorType} disabled={busy} onChange={(event) => update('doorType', event.target.value)}>{doorTypes(language).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
          <TextField select fullWidth size="small" label={text(language, 'روش مجوز تردد', 'Entry authorization')} value={draft.entryAuthorizationType} disabled={busy} onChange={(event) => update('entryAuthorizationType', event.target.value)}>{authorizationTypes(language).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
          {field('doorCode', text(language, 'کد درب', 'Door code'), { type: 'number', dir: 'ltr' })}
          {field('description', text(language, 'توضیحات', 'Description'))}
          <Box sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Checkbox size="small" checked={draft.haveLcdPrice} disabled={busy} onChange={(event) => update('haveLcdPrice', event.target.checked)} />} label={text(language, 'نمایشگر قیمت دارد', 'Has price display')} /></Box>
          {field('lcdPricePort', text(language, 'پورت نمایشگر قیمت', 'Price display port'), { type: 'number', dir: 'ltr', disabled: !draft.haveLcdPrice })}
        </Box>
        <Box component="fieldset" sx={{ minWidth: 0, m: 0, px: 2, pb: 2, border: 1, borderColor: 'divider', borderRadius: 0.5 }}>
          <Box component="legend" sx={{ px: 1, fontSize: '0.875rem', fontWeight: 700, color: 'text.secondary' }}>{text(language, 'تجهیزات اختصاصی درب', 'Door equipment assignments')}</Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {equipmentField('gateEntranceDeviceId', text(language, 'راهبند ورودی', 'Entrance gate'), [1], draft.doorType === '1')}
            {equipmentField('gateExitDeviceId', text(language, 'راهبند خروجی', 'Exit gate'), [1], draft.doorType === '0')}
            {equipmentField('qrEntranceDeviceId', text(language, 'QR ورودی', 'Entrance QR'), [9], draft.doorType === '1')}
            {equipmentField('qrExitDeviceId', text(language, 'QR خروجی', 'Exit QR'), [9], draft.doorType === '0')}
            {equipmentField('entranceCameraId', text(language, 'دوربین ورودی', 'Entrance camera'), [0], draft.doorType === '1')}
            {equipmentField('exitCameraId', text(language, 'دوربین خروجی', 'Exit camera'), [0], draft.doorType === '0')}
            {equipmentField('pcPosId', 'POS', [6])}
            {equipmentField('uhfReaderId', text(language, 'آنتن UHF', 'UHF reader'), [7])}
            {equipmentField('cardReaderId', text(language, 'کارت‌خوان', 'Card reader'), [8])}
          </Box>
        </Box>
        <Box component="section" sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="subtitle2">{text(language, 'تجهیزات متصل به درب', 'Equipment connected to the door')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(180px, 0.45fr) auto' }, gap: 1, alignItems: 'center' }}>
            <TextField select size="small" label={text(language, 'تجهیز', 'Equipment')} value={newEquipmentId} disabled={busy || availableDevices.length === 0} onChange={(event) => setNewEquipmentId(event.target.value)}><MenuItem value="">{text(language, 'انتخاب تجهیز', 'Select equipment')}</MenuItem>{availableDevices.map((item) => <MenuItem key={item.id} value={String(item.id)}>{item.label}</MenuItem>)}</TextField>
            <TextField select size="small" label={text(language, 'محدوده تردد', 'Traffic scope')} value={newTrafficType} disabled={busy || !newEquipmentId} onChange={(event) => setNewTrafficType(event.target.value)}>{trafficTypes(language).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField>
            <Tooltip title={text(language, 'افزودن تجهیز', 'Add equipment')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={text(language, 'افزودن تجهیز', 'Add equipment')} onClick={addDevice} disabled={busy || !newEquipmentId}><AddRoundedIcon /></IconButton></span></Tooltip>
          </Box>
          <AppDataGrid<DoorDeviceDraft> direction={language === 'fa' ? 'rtl' : 'ltr'} filterable={false} rows={draft.devices} rowKey={(row, index) => `${row.equipmentId}-${index}`} columns={[{ key: 'EquipmentTitle', label: text(language, 'تجهیز', 'Equipment'), render: (row) => row.equipmentTitle }, { key: 'TrafficType', label: text(language, 'محدوده تردد', 'Traffic scope'), render: (row) => trafficTypes(language).find(([key]) => key === row.trafficType)?.[1] ?? '—' }, { key: 'actions', label: text(language, 'عملیات', 'Actions'), filterable: false, render: (row) => <Tooltip title={text(language, 'حذف تجهیز', 'Remove equipment')} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" size="small" aria-label={`${text(language, 'حذف تجهیز', 'Remove equipment')}: ${row.equipmentTitle}`} onClick={(event) => { event.stopPropagation(); removeDevice(row.equipmentId); }}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip> }]} />
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </CrudDialog>
    <ConfirmDialog open={Boolean(pendingDelete)} title={text(language, 'حذف درب', 'Delete door')} message={text(language, 'آیا از حذف درب انتخاب‌شده مطمئن هستید؟ سوابق تردد نباید با این عملیات حذف شوند.', 'Are you sure you want to delete the selected door? Traffic records must not be removed by this operation.')} cancelLabel={text(language, 'انصراف', 'Cancel')} confirmLabel={text(language, 'حذف', 'Delete')} busy={busy} onClose={() => setPendingDelete(null)} onConfirm={() => void deleteDoor()} />
    <ConfirmDialog open={pendingClose} title={text(language, 'تغییرات ذخیره‌نشده', 'Unsaved changes')} message={text(language, 'تغییرات ذخیره‌نشده حذف شوند؟', 'Discard unsaved changes?')} cancelLabel={text(language, 'ماندن', 'Stay')} confirmLabel={text(language, 'حذف تغییرات', 'Discard changes')} onClose={() => setPendingClose(false)} onConfirm={() => { setPendingClose(false); setDialogOpen(false); }} />
  </ManagementWorkspaceFrame>;
}
