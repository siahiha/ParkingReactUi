import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { ApiError } from '../../api/client';
import { parkingApi, userApi } from '../../api/management';
import { asRows, recordValue, type Language, type RecordValue } from './managementTypes';
import { AppDataGrid } from '../AppDataGrid';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { WorkspaceToolbar } from '../WorkspaceToolbar';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Option = { id: number; label: string };
type ShiftRow = RecordValue & {
  ParkingDoorId: number;
  WorkDate: string;
  UserIdOnShift1: number | null;
  UserIdOnShift2: number | null;
  UserIdOnShift3: number | null;
};
type ShiftField = 'UserIdOnShift1' | 'UserIdOnShift2' | 'UserIdOnShift3';

const today = () => new Date().toISOString().slice(0, 10);

function numeric(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNumeric(value: unknown) {
  const parsed = numeric(value);
  return parsed > 0 ? parsed : null;
}

function dateValue(value: unknown) {
  const text = String(value ?? '');
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(text)) return text.replaceAll('/', '-');
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function apiDate(value: string) {
  return value.replaceAll('-', '/');
}

function toShiftRow(row: RecordValue, fallbackDoorId: number): ShiftRow {
  return {
    ...row,
    ParkingDoorId: numeric(recordValue(row, 'ParkingDoorId')) || fallbackDoorId,
    WorkDate: dateValue(recordValue(row, 'WorkDate')),
    UserIdOnShift1: optionalNumeric(recordValue(row, 'UserIdOnShift1')),
    UserIdOnShift2: optionalNumeric(recordValue(row, 'UserIdOnShift2')),
    UserIdOnShift3: optionalNumeric(recordValue(row, 'UserIdOnShift3')),
  };
}

function optionRows(input: unknown, labelKeys: string[]): Option[] {
  return asRows(input).map((row) => {
    const id = numeric(recordValue(row, 'Id'));
    const label = labelKeys.map((key) => recordValue(row, key)).find((value) => value !== undefined && value !== null && value !== '') ?? id;
    return { id, label: String(label) };
  }).filter((option) => option.id > 0);
}

export function ShiftAssignmentWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const isPersian = language === 'fa';
  const [doors, setDoors] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [doorId, setDoorId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(() => { const value = new Date(); value.setDate(value.getDate() + 30); return value.toISOString().slice(0, 10); });
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyToDate, setCopyToDate] = useState(endDate);
  const [copyShift1, setCopyShift1] = useState(true);
  const [copyShift2, setCopyShift2] = useState(true);
  const [copyShift3, setCopyShift3] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const copy = isPersian
    ? { count: 'روز', chooseDoor: 'درب را انتخاب کنید', start: 'از تاریخ', end: 'تا تاریخ', show: 'نمایش', save: 'ذخیره', copy: 'رونوشت به دیگر روزها', copyTitle: 'رونوشت به دیگر روزها', copyFrom: 'رونوشت از', copyTo: 'رونوشت تا', applyCopy: 'اعمال رونوشت', cancel: 'انصراف', selectRow: 'ابتدا یک روز را از جدول انتخاب کنید.', loading: 'در حال دریافت...', empty: 'برای این درب و بازه، تخصیصی برای نمایش وجود ندارد.', noOptions: 'درب یا کاربری برای انتخاب وجود ندارد.', saved: 'تخصیص شیفت‌ها ذخیره شد.', past: 'روزهای گذشته قابل ویرایش نیستند.', loadError: 'دریافت اطلاعات اختصاص شیفت ناموفق بود.', saveError: 'ذخیره اختصاص شیفت ناموفق بود.', date: 'تاریخ', shift1: 'شیفت اول', shift2: 'شیفت دوم', shift3: 'شیفت سوم' }
    : { count: 'days', chooseDoor: 'Select a door', start: 'Start date', end: 'End date', show: 'Show', save: 'Save', copy: 'Copy to other days', copyTitle: 'Copy to other days', copyFrom: 'Copy from', copyTo: 'Copy to', applyCopy: 'Apply copy', cancel: 'Cancel', selectRow: 'Select a day from the table first.', loading: 'Loading...', empty: 'No assignments found for this door and date range.', noOptions: 'No door or user is available.', saved: 'Shift assignments saved.', past: 'Past dates cannot be edited.', loadError: 'Failed to load shift assignments.', saveError: 'Failed to save shift assignments.', date: 'Date', shift1: 'Shift 1', shift2: 'Shift 2', shift3: 'Shift 3' };

  useEffect(() => {
    let cancelled = false;
    setLoadingOptions(true);
    Promise.all([parkingApi.getDoors(parkingId), userApi.list()]).then(([doorResponse, userResponse]) => {
      if (cancelled) return;
      const nextDoors = optionRows(doorResponse, ['Title', 'Name']);
      setDoors(nextDoors);
      setUsers(optionRows(userResponse, ['UserName', 'FullName', 'Name']));
      setDoorId((current) => current || nextDoors[0]?.id || '');
    }).catch(() => { if (!cancelled) setError(copy.loadError); }).finally(() => { if (!cancelled) setLoadingOptions(false); });
    return () => { cancelled = true; };
  }, [parkingId]);

  const loadRows = async () => {
    if (!doorId || !startDate || !endDate || startDate > endDate) return;
    setLoadingRows(true); setError(''); setNotice('');
    try {
      const response = await userApi.getWorkShifts(Number(doorId), apiDate(startDate), apiDate(endDate));
      setRows(asRows(response).map((row) => toShiftRow(row, Number(doorId))));
      setDirtyKeys(new Set());
      setSelectedRowKey(null);
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? (isPersian ? 'دسترسی مشاهده یا ویرایش اختصاص شیفت برای کاربر فعلی مجاز نیست.' : 'The current user is not allowed to view or edit shift assignments.') : copy.loadError);
    } finally { setLoadingRows(false); }
  };

  const updateRow = (row: ShiftRow, field: keyof ShiftRow, value: number | null) => {
    const key = `${row.ParkingDoorId}-${row.WorkDate}`;
    setRows((current) => current.map((candidate) => candidate === row ? { ...candidate, [field]: value } : candidate));
    setDirtyKeys((current) => new Set(current).add(key));
  };

  const save = async () => {
    const payload = rows.filter((row) => dirtyKeys.has(`${row.ParkingDoorId}-${row.WorkDate}`)).map((row) => ({ ...row, WorkDate: apiDate(row.WorkDate) }));
    if (!payload.length) return;
    setSaving(true); setError(''); setNotice('');
    try { await userApi.saveWorkShifts(payload); setDirtyKeys(new Set()); setNotice(copy.saved); } catch (cause) { setError(cause instanceof ApiError && cause.status === 403 ? (isPersian ? 'دسترسی ذخیره اختصاص شیفت برای کاربر فعلی مجاز نیست.' : 'The current user is not allowed to save shift assignments.') : copy.saveError); } finally { setSaving(false); }
  };

  const selectedRow = rows.find((row) => `${row.ParkingDoorId}-${row.WorkDate}` === selectedRowKey);
  const openCopyDialog = () => {
    if (!selectedRow) { setError(copy.selectRow); return; }
    setCopyToDate(endDate);
    setCopyShift1(true); setCopyShift2(true); setCopyShift3(true);
    setCopyDialogOpen(true);
  };

  const applyCopy = () => {
    if (!selectedRow) return;
    if (!copyToDate || copyToDate < selectedRow.WorkDate) { setError(isPersian ? 'تاریخ پایان کپی باید بعد از تاریخ ردیف انتخاب‌شده باشد.' : 'The copy end date must be on or after the selected row.'); return; }
    const copiedFields: ShiftField[] = [];
    if (copyShift1) copiedFields.push('UserIdOnShift1');
    if (copyShift2) copiedFields.push('UserIdOnShift2');
    if (copyShift3) copiedFields.push('UserIdOnShift3');
    if (!copiedFields.length) return;
    const sourceDate = new Date(`${selectedRow.WorkDate}T00:00:00Z`);
    const targetDate = new Date(`${copyToDate}T00:00:00Z`);
    const copiedKeys = new Set<string>();
    setRows((current) => {
      const byKey = new Map(current.map((row) => [`${row.ParkingDoorId}-${row.WorkDate}`, row]));
      for (const cursor = new Date(sourceDate); cursor <= targetDate; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        const workDate = cursor.toISOString().slice(0, 10);
        if (workDate < today()) continue;
        const key = `${selectedRow.ParkingDoorId}-${workDate}`;
        const existing = byKey.get(key) ?? { Id: 0, ParkingDoorId: selectedRow.ParkingDoorId, WorkDate: workDate, UserIdOnShift1: null, UserIdOnShift2: null, UserIdOnShift3: null } as ShiftRow;
        const next = { ...existing };
        copiedFields.forEach((field) => { next[field] = selectedRow[field]; });
        byKey.set(key, next);
        copiedKeys.add(key);
      }
      return [...byKey.values()].sort((first, second) => first.WorkDate.localeCompare(second.WorkDate));
    });
    setDirtyKeys((current) => new Set([...current, ...copiedKeys]));
    setCopyDialogOpen(false);
    setNotice(isPersian ? 'کپی اختصاص شیفت روی جدول اعمال شد؛ برای ثبت نهایی «ذخیره» را بزنید.' : 'The assignments were copied to the grid; click Save to persist them.');
  };

  const userOptions = useMemo(() => [{ id: 0, label: isPersian ? 'بدون تخصیص' : 'Unassigned' }, ...users], [isPersian, users]);
  const userSelect = (row: ShiftRow, field: keyof ShiftRow) => <Select size="small" value={String(row[field] ?? 0)} onChange={(event) => updateRow(row, field, Number(event.target.value) || null)} disabled={row.WorkDate < today()} aria-label={copy.chooseDoor}>{userOptions.map((option) => <MenuItem key={option.id} value={String(option.id)}>{option.label}</MenuItem>)}</Select>;
  const columns = [
    { key: 'WorkDate', label: copy.date, render: (row: ShiftRow) => <Typography variant="body2" dir="ltr">{row.WorkDate}</Typography> },
    { key: 'FullNameOnShift1', label: copy.shift1, render: (row: ShiftRow) => userSelect(row, 'UserIdOnShift1'), getFilterValue: (row: ShiftRow) => row.FullNameOnShift1 ?? '' },
    { key: 'FullNameOnShift2', label: copy.shift2, render: (row: ShiftRow) => userSelect(row, 'UserIdOnShift2'), getFilterValue: (row: ShiftRow) => row.FullNameOnShift2 ?? '' },
    { key: 'FullNameOnShift3', label: copy.shift3, render: (row: ShiftRow) => userSelect(row, 'UserIdOnShift3'), getFilterValue: (row: ShiftRow) => row.FullNameOnShift3 ?? '' },
  ];

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${copy.count}`} language={language} loading={loadingRows} onRefresh={doorId ? () => void loadRows() : undefined} toolbar={<WorkspaceToolbar className="shift-assignment-toolbar" ariaLabel={isPersian ? 'فیلتر و عملیات اختصاص شیفت' : 'Shift assignment filters and actions'}><FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{copy.chooseDoor}</InputLabel><Select label={copy.chooseDoor} value={String(doorId)} onChange={(event) => setDoorId(Number(event.target.value) || '')}>{doors.map((door) => <MenuItem key={door.id} value={String(door.id)}>{door.label}</MenuItem>)}</Select></FormControl><TextField size="small" type="date" label={copy.start} value={startDate} onChange={(event) => setStartDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField size="small" type="date" label={copy.end} value={endDate} onChange={(event) => setEndDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><Button variant="outlined" onClick={() => void loadRows()} disabled={loadingRows || !doorId || startDate > endDate}>{copy.show}</Button><Button variant="outlined" sx={{ whiteSpace: 'nowrap' }} startIcon={<ContentCopyRoundedIcon />} onClick={openCopyDialog} disabled={!selectedRow}>{copy.copy}</Button><Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void save()} disabled={saving || dirtyKeys.size === 0}>{saving ? copy.loading : copy.save}</Button></WorkspaceToolbar>}>
    {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loadingOptions && <ResourceState loading error="" empty={false} loadingLabel={copy.loading} emptyLabel="">{null}</ResourceState>}
    {!loadingOptions && (!doors.length || !users.length) && <Alert severity="info">{copy.noOptions}</Alert>}
    {!loadingOptions && doors.length > 0 && users.length > 0 && <ResourceState loading={loadingRows} error="" empty={rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}><AppDataGrid<ShiftRow> direction={isPersian ? 'rtl' : 'ltr'} rows={rows} columns={columns} rowKey={(row) => `${row.ParkingDoorId}-${row.WorkDate}`} selectedKey={selectedRowKey} onRowClick={(row) => setSelectedRowKey(`${row.ParkingDoorId}-${row.WorkDate}`)} /></ResourceState>}
    {rows.some((row) => row.WorkDate < today()) && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{copy.past}</Typography>}
    <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} fullWidth maxWidth="xs"><DialogTitle>{copy.copyTitle}</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>{selectedRow ? `${copy.copyFrom}: ${selectedRow.WorkDate}` : copy.selectRow}</Typography><TextField fullWidth size="small" type="date" label={copy.copyTo} value={copyToDate} onChange={(event) => setCopyToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><FormControlLabel control={<Checkbox checked={copyShift1} onChange={(event) => setCopyShift1(event.target.checked)} />} label={copy.shift1} /><FormControlLabel control={<Checkbox checked={copyShift2} onChange={(event) => setCopyShift2(event.target.checked)} />} label={copy.shift2} /><FormControlLabel control={<Checkbox checked={copyShift3} onChange={(event) => setCopyShift3(event.target.checked)} />} label={copy.shift3} /></DialogContent><DialogActions><Button onClick={() => setCopyDialogOpen(false)}>{copy.cancel}</Button><Button variant="contained" onClick={applyCopy}>{copy.applyCopy}</Button></DialogActions></Dialog>
  </ManagementWorkspaceFrame>;
}
