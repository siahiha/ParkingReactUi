import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { ApiError } from '../../api/client';
import { parkingApi, trafficApi } from '../../api/management';
import { AppDataGrid } from '../AppDataGrid';
import { ConfirmDialog } from '../ConfirmDialog';
import { EosDateTimePicker } from '../EosDateTimePicker';
import { IranianPlateInput, isValidIranianPlate, type VehiclePlateType } from '../IranianPlateInput';
import { WorkspaceToolbar } from '../WorkspaceToolbar';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, recordValue, type Language, type RecordValue } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Option = { id: number; label: string };
type TrafficRow = RecordValue;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const dateTime = (value: unknown, isPersian: boolean) => { const parsed = new Date(String(value ?? '')); return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString(isPersian ? 'fa-IR' : 'en-US'); };
const inputDateTime = (value: unknown) => { const parsed = new Date(String(value ?? '')); return Number.isNaN(parsed.getTime()) ? '' : `${isoDate(parsed)}T${parsed.toISOString().slice(11, 16)}`; };
const apiDateTime = (value: string) => value ? `${value.replace('T', ' ')}:00` : null;
const valueOf = (row: RecordValue, key: string) => recordValue(row, key);
const numberOf = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };

function responsePage(input: unknown) {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const wrapped = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  if (Array.isArray(wrapped)) return { items: wrapped.filter((row): row is RecordValue => Boolean(row && typeof row === 'object')) };
  const page = wrapped && typeof wrapped === 'object' ? wrapped as Record<string, unknown> : {};
  const items = page.Items ?? page.items ?? page.Values ?? page.values;
  return { items: Array.isArray(items) ? items.filter((row): row is RecordValue => Boolean(row && typeof row === 'object')) : [] };
}

function optionRows(input: unknown): Option[] {
  return asRows(input).map((row) => ({ id: numberOf(valueOf(row, 'Id')), label: String(valueOf(row, 'Title') ?? valueOf(row, 'Name') ?? valueOf(row, 'DoorName') ?? '') })).filter((option) => option.id > 0 && option.label);
}

export function TrafficRecordsWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const isPersian = language === 'fa';
  const [doors, setDoors] = useState<Option[]>([]);
  const [rows, setRows] = useState<TrafficRow[]>([]);
  const [startDate, setStartDate] = useState(() => { const value = new Date(); value.setMonth(value.getMonth() - 1); return isoDate(value); });
  const [endDate, setEndDate] = useState(() => isoDate(new Date()));
  const [sourceType, setSourceType] = useState('0');
  const [doorId, setDoorId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editEnter, setEditEnter] = useState('');
  const [editExit, setEditExit] = useState('');
  const [plate, setPlate] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [carType, setCarType] = useState<VehiclePlateType>('0');
  const [entryDoorId, setEntryDoorId] = useState('');
  const [entryDateTime, setEntryDateTime] = useState('');
  const [exitDateTime, setExitDateTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const copy = isPersian ? { count: 'رکورد', registerTitle: 'ثبت تردد', detailsTitle: 'ریز تردد', plate: 'پلاک', card: 'شماره کارت', memberCode: 'کد عضو', door: 'نام درب', entry: 'تاریخ و زمان ورود', exit: 'تاریخ و زمان خروج', register: 'ثبت', start: 'ورود از', end: 'تا', source: 'نوع منبع', all: 'همه', allDoors: 'همه درب‌ها', search: 'جستجوی پلاک یا عضو', show: 'نمایش', edit: 'ویرایش', remove: 'حذف', cancel: 'انصراف', empty: 'ترددی برای نمایش وجود ندارد.', loading: 'در حال دریافت ترددها...', loadError: 'دریافت ترددها ناموفق بود.', saveError: 'عملیات تردد ناموفق بود.', saved: 'تردد با موفقیت ثبت شد.', updated: 'تغییرات تردد ذخیره شد.', deleted: 'رکورد تردد حذف شد.', deleteConfirm: 'آیا از حذف رکورد انتخاب‌شده مطمئن هستید؟', editTitle: 'ویرایش مشخصات ورود و خروج', required: 'پلاک، درب و زمان ورود را کامل کنید.' } : { count: 'records', registerTitle: 'Register traffic', detailsTitle: 'Traffic details', plate: 'Plate', card: 'Card number', memberCode: 'Member code', door: 'Door', entry: 'Entry date and time', exit: 'Exit date and time', register: 'Register', start: 'Entry from', end: 'To', source: 'Source type', all: 'All', allDoors: 'All doors', search: 'Search plate or member', show: 'Show', edit: 'Edit', remove: 'Delete', cancel: 'Cancel', empty: 'No traffic records found.', loading: 'Loading traffic records...', loadError: 'Failed to load traffic records.', saveError: 'Traffic operation failed.', saved: 'Traffic was registered.', updated: 'Traffic changes saved.', deleted: 'Traffic record deleted.', deleteConfirm: 'Delete the selected traffic record?', editTitle: 'Edit entry and exit details', required: 'Plate, door and entry time are required.' };

  useEffect(() => { parkingApi.getDoors(parkingId).then((response) => { const next = optionRows(response); setDoors(next); setEntryDoorId(String(next[0]?.id ?? '')); }).catch(() => setError(copy.loadError)); }, [parkingId]);
  const load = async () => { setLoading(true); setError(''); setNotice(''); try { const response = await trafficApi.getAllTraffics({ PageNumber: 1, PageSize: 500, Filters: { StartDateTime: `${startDate}T00:00:00`, EndDateTime: `${endDate}T23:59:59`, DumpType: Number(sourceType), ParkingId: parkingId } }); setRows(responsePage(response).items); setSelectedId(null); } catch (cause) { setRows([]); setError(cause instanceof ApiError && cause.status === 403 ? (isPersian ? 'دسترسی مشاهده ترددها مجاز نیست.' : 'The current user is not allowed to view traffic records.') : copy.loadError); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [parkingId]);
  const lookupCar = async () => { if (!plate && !cardNumber && !memberCode) return; try { const response = await trafficApi.getCarTrafficInfo(parkingId, plate, cardNumber, memberCode); const values = response && typeof response === 'object' ? ((response as Record<string, unknown>).Values ?? response) : {}; if (values && typeof values === 'object') { const info = values as RecordValue; setPlate(String(valueOf(info, 'Plate') ?? plate)); setCardNumber(String(valueOf(info, 'CardNumber') ?? cardNumber)); setMemberCode(String(valueOf(info, 'MemberCode') ?? memberCode)); } } catch { /* Lookup is advisory; registration reports the API result. */ } };
  const visibleRows = useMemo(() => { const query = search.trim().toLocaleLowerCase(); return rows.filter((row) => (!doorId || String(valueOf(row, 'DoorId') ?? valueOf(row, 'EnterDoorId') ?? '') === doorId) && (!query || [valueOf(row, 'CarPlate'), valueOf(row, 'CarPlateReversed'), valueOf(row, 'MemberCode'), valueOf(row, 'MemberFullName')].some((value) => String(value ?? '').toLocaleLowerCase().includes(query)))); }, [rows, doorId, search]);
  const selected = rows.find((row) => numberOf(valueOf(row, 'DumpId')) === selectedId);
  const registerTraffic = async () => { if (!isValidIranianPlate(plate, carType) || !entryDoorId || !entryDateTime) { setError(copy.required); return; } setWorking(true); setError(''); try { await trafficApi.createManualDump({ plate, parkingId, carType: Number(carType), enterDateTime: apiDateTime(entryDateTime), exitDateTime: apiDateTime(exitDateTime), doorId: Number(entryDoorId) }); setNotice(copy.saved); setPlate(''); setCardNumber(''); setMemberCode(''); setEntryDateTime(''); setExitDateTime(''); await load(); } catch { setError(copy.saveError); } finally { setWorking(false); } };
  const updateTraffic = async () => { if (!selected) return; setWorking(true); try { await trafficApi.saveTraffic({ Id: selectedId, CarPlate: valueOf(selected, 'CarPlate'), SourceType: valueOf(selected, 'SourceType'), EnterDateTime: apiDateTime(editEnter), ExitDateTime: apiDateTime(editExit) }); setEditOpen(false); setNotice(copy.updated); await load(); } catch { setError(copy.saveError); } finally { setWorking(false); } };
  const removeTraffic = async () => { if (!selectedId) return; setWorking(true); try { await trafficApi.deleteTraffic(selectedId); setDeleteOpen(false); setNotice(copy.deleted); await load(); } catch { setError(copy.saveError); } finally { setWorking(false); } };
  const columns = [{ key: 'MemberCode', label: isPersian ? 'کد عضویت' : 'Member code' }, { key: 'CarPlate', label: copy.plate, getFilterValue: (row: TrafficRow) => valueOf(row, 'CarPlateReversed') ?? valueOf(row, 'CarPlate') }, { key: 'MemberFullName', label: isPersian ? 'عضو' : 'Member' }, { key: 'EnterDateTime', label: isPersian ? 'ورود' : 'Entry', render: (row: TrafficRow) => dateTime(valueOf(row, 'EnterDateTime'), isPersian) }, { key: 'ExitDateTime', label: isPersian ? 'خروج' : 'Exit', render: (row: TrafficRow) => dateTime(valueOf(row, 'ExitDateTime'), isPersian) }, { key: 'PayType', label: isPersian ? 'وضعیت پرداخت' : 'Payment status' }, { key: 'CommonCost', label: isPersian ? 'مبلغ' : 'Amount' }, { key: 'DoorName', label: copy.door }];

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${visibleRows.length} ${copy.count}`} language={language} loading={loading} onRefresh={() => void load()}>
    {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box className="traffic-entry-section"><Typography variant="subtitle2" className="traffic-section-title">{copy.registerTitle}</Typography><Box className="traffic-entry-layout"><Box className="traffic-entry-identity"><Box onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) void lookupCar(); }}><IranianPlateInput label={copy.plate} value={plate} carType={carType} onCarTypeChange={setCarType} onChange={setPlate} error={Boolean(plate) && !isValidIranianPlate(plate, carType)} helperText={Boolean(plate) && !isValidIranianPlate(plate, carType) ? (isPersian ? 'قالب پلاک کامل نیست.' : 'Complete the plate format.') : undefined} /></Box><TextField label={copy.card} value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} onBlur={() => void lookupCar()} /><TextField label={copy.memberCode} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} onBlur={() => void lookupCar()} /></Box><Box className="traffic-entry-operation"><FormControl><InputLabel>{copy.door}</InputLabel><Select label={copy.door} value={entryDoorId} onChange={(event) => setEntryDoorId(event.target.value)}>{doors.map((door) => <MenuItem key={door.id} value={String(door.id)}>{door.label}</MenuItem>)}</Select></FormControl><EosDateTimePicker language={language} label={copy.entry} value={entryDateTime} onChange={setEntryDateTime} /><EosDateTimePicker language={language} label={copy.exit} value={exitDateTime} onChange={setExitDateTime} /><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => void registerTraffic()} disabled={working}>{copy.register}</Button></Box></Box></Box>
    <Box className="traffic-details-section"><Typography variant="subtitle2" className="traffic-section-title">{copy.detailsTitle}</Typography><WorkspaceToolbar ariaLabel={isPersian ? 'فیلتر و عملیات ریز تردد' : 'Traffic details filters and actions'}><EosDateTimePicker language={language} dateOnly size="small" label={copy.start} value={startDate} onChange={setStartDate} /><EosDateTimePicker language={language} dateOnly size="small" label={copy.end} value={endDate} onChange={setEndDate} /><FormControl size="small"><InputLabel>{copy.source}</InputLabel><Select label={copy.source} value={sourceType} onChange={(event) => setSourceType(event.target.value)}><MenuItem value="0">{copy.all}</MenuItem><MenuItem value="1">{isPersian ? 'ورود ناقص' : 'Incomplete entry'}</MenuItem><MenuItem value="2">{isPersian ? 'خروج ناقص' : 'Incomplete exit'}</MenuItem><MenuItem value="3">{isPersian ? 'ویرایش‌شده' : 'Edited'}</MenuItem></Select></FormControl><FormControl size="small"><InputLabel>{copy.door}</InputLabel><Select label={copy.door} value={doorId} onChange={(event) => setDoorId(event.target.value)}><MenuItem value="">{copy.allDoors}</MenuItem>{doors.map((door) => <MenuItem key={door.id} value={String(door.id)}>{door.label}</MenuItem>)}</Select></FormControl><TextField size="small" label={copy.search} value={search} onChange={(event) => setSearch(event.target.value)} /><Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()}>{copy.show}</Button><Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => { if (selected) { setEditEnter(inputDateTime(valueOf(selected, 'EnterDateTime'))); setEditExit(inputDateTime(valueOf(selected, 'ExitDateTime'))); setEditOpen(true); } }} disabled={!selected}>{copy.edit}</Button><Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setDeleteOpen(true)} disabled={!selected || working}>{copy.remove}</Button></WorkspaceToolbar><ResourceState loading={loading} error="" empty={visibleRows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}><AppDataGrid<TrafficRow> direction={isPersian ? 'rtl' : 'ltr'} rows={visibleRows} columns={columns} rowKey={(row) => String(valueOf(row, 'DumpId') ?? valueOf(row, 'Id'))} selectedKey={selectedId} onRowClick={(row) => setSelectedId(numberOf(valueOf(row, 'DumpId') ?? valueOf(row, 'Id')))} /></ResourceState></Box>
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{copy.editTitle}</DialogTitle><DialogContent><EosDateTimePicker language={language} label={copy.entry} value={editEnter} onChange={setEditEnter} sx={{ mt: 1 }} /><EosDateTimePicker language={language} label={copy.exit} value={editExit} onChange={setEditExit} sx={{ mt: 2 }} /></DialogContent><DialogActions><Button onClick={() => setEditOpen(false)}>{copy.cancel}</Button><Button variant="contained" onClick={() => void updateTraffic()} disabled={working}>{copy.register}</Button></DialogActions></Dialog><ConfirmDialog open={deleteOpen} title={copy.remove} message={copy.deleteConfirm} cancelLabel={copy.cancel} confirmLabel={copy.remove} busy={working} onClose={() => setDeleteOpen(false)} onConfirm={() => void removeTraffic()} />
  </ManagementWorkspaceFrame>;
}
