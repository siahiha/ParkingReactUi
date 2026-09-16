import { useEffect, useState } from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import { AppGroupBox } from '../../components/AppGroupBox';
import { MoneyTextField } from '../../components/MoneyTextField';
import type { Language } from '../../i18n';
import { tariffService, type MemberKindOption, type TariffListRow } from './tariffService';

type Props = { open: boolean; mode: 'create' | 'edit'; row: TariffListRow | null; parkingId: number; language: Language; onClose: () => void; onSaved: () => void };
type RateRange = { id: number; from: string; to: string; costs: string[]; parkSpaceId: number | null; details: Record<string, unknown>[] };

const recordOf = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const valueOf = (record: Record<string, unknown>, key: string) => record[key] ?? record[key.charAt(0).toLowerCase() + key.slice(1)];
const records = (value: unknown) => Array.isArray(value) ? value.map(recordOf) : [];
const number = (value: unknown) => Number(value ?? 0) || 0;
const text = (value: unknown) => value === null || value === undefined ? '' : String(value);
const timeInput = (value: unknown) => text(value).slice(0, 5);
const money = (value: string) => number(value.replace(/,/g, ''));

function durationText(value: unknown) {
  const minutes = Math.max(0, Math.trunc(number(value)));
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function durationMinutes(value: string, maxHours?: number): number | null {
  const match = value.trim().match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || (maxHours !== undefined && hours > maxHours) || !Number.isInteger(minutes) || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeDurationInput(value: string, maxHours?: number) {
  const sanitized = value.replace(/[^\d:]/g, '');
  const [hours = '', minutes] = sanitized.split(':');
  const boundedHours = maxHours === undefined ? hours : hours.slice(0, String(maxHours).length);
  return minutes === undefined ? boundedHours : `${boundedHours}:${minutes.slice(0, 2)}`;
}

type DurationFieldProps = { label: string; value: string; maxHours?: number; onChange: (value: string) => void };

function DurationField({ label, value, maxHours, onChange }: DurationFieldProps) {
  return <TextField size="small" label={label} value={value} onChange={(event) => onChange(normalizeDurationInput(event.target.value, maxHours))} onBlur={() => { const parsed = durationMinutes(value, maxHours); if (parsed !== null) onChange(durationText(parsed)); }} placeholder="00:00" slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9:]*', dir: 'ltr', maxLength: maxHours === undefined ? undefined : String(maxHours).length + 3 } }} />;
}

function durationValue(value: unknown) {
  const source = text(value);
  if (source.includes(':')) {
    const [hours = '0', minutes = '0'] = source.split(':');
    return `${String(Number(hours) || 0).padStart(2, '0')}:${String(Number(minutes) || 0).padStart(2, '0')}`;
  }
  return durationText(value);
}

function parseRanges(value: unknown, hostelry: boolean, vehicleCount: number): RateRange[] {
  return records(value).map((range) => {
    const details = hostelry ? [range] : records(valueOf(range, 'TariffRangeDetails'));
    const detail = details[0] ?? {};
    return {
      id: number(valueOf(range, 'Id')),
      from: hostelry ? String(number(valueOf(range, 'FromDay'))) : durationValue(valueOf(range, 'StartTime')),
      to: hostelry ? String(number(valueOf(range, 'ToDay'))) : durationValue(valueOf(range, 'EndTime')),
      parkSpaceId: number(valueOf(range, hostelry ? 'ParkSpaceKindId' : 'ParkSpaceId')) || null,
      details,
      costs: [valueOf(detail, 'CarOneMinuteCost'), valueOf(detail, 'MotorOneMinuteCost'), valueOf(detail, 'MiniBusOneMinuteCost'), valueOf(detail, 'TruckOneMinuteCost'), valueOf(detail, 'TrailyOneMinuteCost')].slice(0, vehicleCount).map((cost) => cost === undefined ? '' : String(cost)),
    };
  });
}

function responseValue(input: unknown): unknown {
  const response = recordOf(input);
  const resultType = valueOf(response, 'ResponseResultType');
  if (resultType !== undefined && resultType !== null && resultType !== '' && Number(resultType) !== 1 && String(resultType).toLowerCase() !== 'ok') throw new Error(text(valueOf(response, 'Message')) || text(valueOf(response, 'RealMessage')));
  return valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input;
}

export function TariffEditorDialog({ open, mode, row, parkingId, language, onClose, onSaved }: Props) {
  const fa = language === 'fa';
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState('');
  const [isMemberTariff, setIsMemberTariff] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [entryDuration, setEntryDuration] = useState('0');
  const [entryFreeMinutes, setEntryFreeMinutes] = useState('0');
  const [roundingBorder, setRoundingBorder] = useState('0');
  const [roundingValue, setRoundingValue] = useState('0');
  const [maximumHostelryDuration, setMaximumHostelryDuration] = useState('0');
  const [doNotChargeHostelryEntry, setDoNotChargeHostelryEntry] = useState(false);
  const [memberKinds, setMemberKinds] = useState<number[]>([]);
  const [memberKindOptions, setMemberKindOptions] = useState<MemberKindOption[]>([]);
  const [entranceCosts, setEntranceCosts] = useState<string[]>(['', '', '', '', '']);
  const [dailyRanges, setDailyRanges] = useState<RateRange[]>([]);
  const [overnightRanges, setOvernightRanges] = useState<RateRange[]>([]);
  const [spaceKind, setSpaceKind] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const vehicles = fa ? ['وانت و سواری', 'موتورسیکلت', 'ون و مینی‌بوس', 'اتوبوس و کامیون', 'تریلی'] : ['Car and pickup', 'Motorcycle', 'Van and minibus', 'Bus and truck', 'Trailer'];
  const labels = fa ? { create: 'تعرفه جدید', edit: 'ویرایش تعرفه', general: 'تنظیمات عمومی', daily: 'نرخ ساعتی روزانه', overnight: 'نرخ شبانه‌روزی', title: 'عنوان تعرفه', member: 'این تعرفه ویژه اعضاء می‌باشد', active: 'فعال', description: 'توضیحات', memberKinds: 'نوع عضویت', entry: 'ورودی', duration: 'تا', free: 'بازه رایگان', rounding: 'تنظیمات گرد کردن', border: 'مرز گرد کردن', value: 'مقدار گرد کردن', minimumHostelry: 'حداقل توقف برای محاسبه شبانه‌روزی', noHostelryEntry: 'مبلغ ورودی در پارک شبانه‌روزی دریافت نشود', rates: 'نرخ ورود بر اساس نوع وسیله', spaceKind: 'نوع جای پارک', common: 'عمومی', from: 'از', to: 'تا', add: 'افزودن بازه', empty: 'هنوز بازه‌ای ثبت نشده است.', cancel: 'لغو', confirm: 'ذخیره', requiredTitle: 'عنوان تعرفه الزامی است.', requiredHostelry: 'حداقل توقف شبانه‌روزی باید بزرگ‌تر از صفر باشد.', requiredDaily: 'حداقل یک بازهٔ روزانه ثبت کنید.', requiredOvernight: 'حداقل یک بازهٔ شبانه‌روزی ثبت کنید.', invalidDaily: 'بازهٔ روزانه را به‌صورت ساعت:دقیقه وارد کنید؛ ساعت بین ۰۰ تا ۹۹۹ و دقیقه بین ۰۰ تا ۵۹ باشد و پایان بعد از شروع قرار بگیرد.', invalidOvernight: 'بازهٔ شبانه‌روزی را به‌صورت عدد روز وارد کنید؛ مقدارها نامنفی و پایان نباید قبل از شروع باشد.', memberKindsEmpty: 'نوع عضویتی برای انتخاب موجود نیست.' } : { create: 'New tariff', edit: 'Edit tariff', general: 'General settings', daily: 'Daily hourly rates', overnight: 'Overnight rates', title: 'Tariff title', member: 'This tariff is for members', active: 'Active', description: 'Description', memberKinds: 'Membership type', entry: 'Entry', duration: 'Up to', free: 'Free period', rounding: 'Rounding settings', border: 'Rounding border', value: 'Rounding value', minimumHostelry: 'Minimum stay for overnight calculation', noHostelryEntry: 'Do not charge entry fee for overnight parking', rates: 'Entry rate by vehicle type', spaceKind: 'Parking space type', common: 'Common', from: 'From', to: 'To', add: 'Add range', empty: 'No range has been registered.', cancel: 'Cancel', confirm: 'Save', requiredTitle: 'Tariff title is required.', requiredHostelry: 'Minimum overnight duration must be greater than zero.', requiredDaily: 'Add at least one daily range.', requiredOvernight: 'Add at least one overnight range.', invalidDaily: 'Enter daily ranges as hours:minutes; hours must be 0–999, minutes 00–59, and the end must be after the start.', invalidOvernight: 'Enter overnight ranges as numeric days; values must be non-negative and the end cannot be before the start.', memberKindsEmpty: 'No membership type is available.' };

  useEffect(() => {
    if (!open) return;
    const raw = row?.raw ?? {};
    setTab(0); setTitle(mode === 'edit' ? row?.title ?? '' : ''); setIsMemberTariff(mode === 'edit' ? Boolean(row?.isMemberTariff) : false); setIsActive(mode === 'edit' ? row?.isActive ?? true : true); setIsCurrent(mode === 'edit' ? row?.isCurrent ?? false : false); setDescription(text(valueOf(raw, 'Description'))); setEntryDuration(String(number(valueOf(raw, 'EntranceDurationMinutes')))); setEntryFreeMinutes(String(number(valueOf(raw, 'EntranceFreeMinutes')))); setRoundingBorder(String(number(valueOf(raw, 'RoundingBorder')))); setRoundingValue(String(number(valueOf(raw, 'RoundingValue')))); setMaximumHostelryDuration(mode === 'create' ? '8' : String(number(valueOf(raw, 'MaximumHostelryDuration') ?? valueOf(raw, 'DayHoursBorder')))); setDoNotChargeHostelryEntry(valueOf(raw, 'GetEnteranceInHostelryPark') === false);
    setEntranceCosts([valueOf(raw, 'EntranceCarOneMinuteCost'), valueOf(raw, 'EntranceMotorOneMinuteCost'), valueOf(raw, 'EntranceMiniBusOneMinuteCost'), valueOf(raw, 'EntranceTruckOneMinuteCost'), valueOf(raw, 'EntranceTrailyOneMinuteCost')].map((value) => value === undefined ? '' : String(value)));
    setMemberKinds(records(valueOf(raw, 'MemberRegisterKinds')).map((kind) => number(valueOf(kind, 'Id'))).filter((id) => id > 0)); setDailyRanges(mode === 'create' ? [{ id: 0, from: '00:00', to: '01:00', costs: vehicles.map(() => '0'), parkSpaceId: null, details: [] }] : parseRanges(valueOf(raw, 'TariffRanges'), false, vehicles.length)); setOvernightRanges(mode === 'create' ? [{ id: 0, from: '0', to: '0', costs: vehicles.map(() => '0'), parkSpaceId: null, details: [] }] : parseRanges(valueOf(raw, 'TariffHostelryDetails'), true, vehicles.length)); setSpaceKind('0'); setError('');
  }, [open, mode, row, vehicles.length]);

  useEffect(() => {
    if (!open || !isMemberTariff) return;
    const controller = new AbortController();
    void tariffService.memberKinds(parkingId, controller.signal).then(setMemberKindOptions).catch(() => setMemberKindOptions([]));
    return () => controller.abort();
  }, [open, isMemberTariff, parkingId]);

  const updateEntranceCost = (index: number, value: string) => setEntranceCosts((current) => current.map((cost, costIndex) => costIndex === index ? value : cost));
  const updateRange = (kind: 'daily' | 'overnight', index: number, field: 'from' | 'to' | number, value: string) => { const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges; setter((current) => current.map((range, rangeIndex) => rangeIndex !== index ? range : typeof field === 'number' ? { ...range, costs: range.costs.map((cost, costIndex) => costIndex === field ? value : cost) } : { ...range, [field]: value })); };
  const addRange = (kind: 'daily' | 'overnight') => { const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges; setter((current) => [...current, { id: 0, from: kind === 'overnight' ? '0' : '', to: kind === 'overnight' ? '1' : '', costs: vehicles.map(() => ''), parkSpaceId: null, details: [] }]); };
  const removeRange = (kind: 'daily' | 'overnight', index: number) => { const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges; setter((current) => current.filter((_, rangeIndex) => rangeIndex !== index)); };
  const rangeDetails = (range: RateRange, tariffId: number) => (range.details.length ? range.details : [{}]).map((detail, index) => index === 0 ? { ...detail, Id: number(valueOf(detail, 'Id')), TariffRangeId: number(valueOf(detail, 'TariffRangeId')), FromMinute: number(valueOf(detail, 'FromMinute')), ToMinute: number(valueOf(detail, 'ToMinute')), CarOneMinuteCost: money(range.costs[0] ?? ''), MotorOneMinuteCost: money(range.costs[1] ?? ''), MiniBusOneMinuteCost: money(range.costs[2] ?? ''), TruckOneMinuteCost: money(range.costs[3] ?? ''), TrailyOneMinuteCost: money(range.costs[4] ?? ''), TariffId: tariffId } : detail);

  const tariffPayload = () => {
    const tariffId = row?.id ?? 0;
    return { Id: tariffId, ParkingId: parkingId, Title: title.trim(), Description: description, IsMemberRegisterKindTariff: isMemberTariff, IsActive: isActive, IsCurrent: isCurrent, PersistOn: new Date().toISOString(), EntranceDurationMinutes: number(entryDuration), EntranceFreeMinutes: number(entryFreeMinutes), EntranceCarOneMinuteCost: money(entranceCosts[0] ?? ''), EntranceMotorOneMinuteCost: money(entranceCosts[1] ?? ''), EntranceMiniBusOneMinuteCost: money(entranceCosts[2] ?? ''), EntranceTruckOneMinuteCost: money(entranceCosts[3] ?? ''), EntranceTrailyOneMinuteCost: money(entranceCosts[4] ?? ''), RoundingBorder: money(roundingBorder), RoundingValue: money(roundingValue), MaximumHostelryDuration: number(maximumHostelryDuration), DayHoursBorder: number(maximumHostelryDuration), GetEnteranceInHostelryPark: !doNotChargeHostelryEntry, TariffRanges: dailyRanges.map((range) => ({ Id: range.id, TariffId: tariffId, StartTime: `${range.from || '00:00'}:00`, EndTime: `${range.to || '00:00'}:00`, ParkSpaceId: range.parkSpaceId, CalculateCostRange: 0, TariffRangeDetails: rangeDetails(range, tariffId) })), TariffHostelryDetails: overnightRanges.map((range) => ({ Id: range.id, TariffId: tariffId, FromDay: number(range.from), ToDay: number(range.to), ParkSpaceKindId: range.parkSpaceId, CarOneMinuteCost: money(range.costs[0] ?? ''), MotorOneMinuteCost: money(range.costs[1] ?? ''), MiniBusOneMinuteCost: money(range.costs[2] ?? ''), TruckOneMinuteCost: money(range.costs[3] ?? ''), TrailyOneMinuteCost: money(range.costs[4] ?? '') })), MemberRegisterKinds: memberKinds.map((id) => ({ Id: id })) };
  };

  const save = async () => {
    if (!title.trim()) { setError(labels.requiredTitle); setTab(0); return; }
    if (number(maximumHostelryDuration) <= 0) { setError(labels.requiredHostelry); setTab(0); return; }
    if (dailyRanges.length === 0) { setError(labels.requiredDaily); setTab(1); return; }
    if (overnightRanges.length === 0) { setError(labels.requiredOvernight); setTab(2); return; }
    if (dailyRanges.some((range) => { const from = durationMinutes(range.from, 999); const to = durationMinutes(range.to, 999); return from === null || to === null || to <= from; })) { setError(labels.invalidDaily); setTab(1); return; }
    if (overnightRanges.some((range) => { const from = Number(range.from); const to = Number(range.to); return !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || to < from; })) { setError(labels.invalidOvernight); setTab(2); return; }
    setSaving(true); setError('');
    try { const id = number(responseValue(await tariffService.save(tariffPayload()))); if (!id) throw new Error(fa ? 'ذخیره تعرفه ناموفق بود.' : 'Saving tariff failed.'); onSaved(); onClose(); } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : (fa ? 'ذخیره تعرفه ناموفق بود.' : 'Saving tariff failed.')); } finally { setSaving(false); }
  };

  const renderGeneral = () => <Box className="tariff-editor-body"><Box className="tariff-general-layout"><AppGroupBox title={labels.general} className="tariff-general-info"><TextField autoFocus fullWidth required label={labels.title} value={title} onChange={(event) => setTitle(event.target.value)} /><Box className="tariff-inline-checks"><FormControlLabel control={<Checkbox checked={isMemberTariff} onChange={(event) => setIsMemberTariff(event.target.checked)} />} label={labels.member} /><FormControlLabel control={<Checkbox checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />} label={labels.active} /></Box>{isMemberTariff && <Box className="tariff-member-kind-list" role="group" aria-label={labels.memberKinds}>{memberKindOptions.length === 0 ? <Typography variant="body2" color="text.secondary">{labels.memberKindsEmpty}</Typography> : memberKindOptions.map((option) => <FormControlLabel key={option.id} control={<Checkbox checked={memberKinds.includes(option.id)} onChange={(event) => setMemberKinds((current) => event.target.checked ? [...new Set([...current, option.id])] : current.filter((id) => id !== option.id))} />} label={option.title} />)}</Box>}<TextField fullWidth multiline minRows={3} label={labels.description} value={description} onChange={(event) => setDescription(event.target.value)} /></AppGroupBox><AppGroupBox title={labels.entry} className="tariff-entry-settings"><Box className="tariff-field-grid"><TextField type="number" label={labels.duration} value={entryDuration} onChange={(event) => setEntryDuration(event.target.value)} /><TextField type="number" label={labels.free} value={entryFreeMinutes} onChange={(event) => setEntryFreeMinutes(event.target.value)} /></Box><Typography variant="caption" color="text.secondary">{labels.rounding}</Typography><Box className="tariff-field-grid"><MoneyTextField label={labels.border} value={roundingBorder} onValueChange={setRoundingBorder} /><MoneyTextField label={labels.value} value={roundingValue} onValueChange={setRoundingValue} /></Box><TextField type="number" label={labels.minimumHostelry} value={maximumHostelryDuration} onChange={(event) => setMaximumHostelryDuration(event.target.value)} /><FormControlLabel control={<Checkbox checked={doNotChargeHostelryEntry} onChange={(event) => setDoNotChargeHostelryEntry(event.target.checked)} />} label={labels.noHostelryEntry} /></AppGroupBox></Box><AppGroupBox title={labels.rates} className="tariff-entry-rates"><Box className="tariff-rate-header">{vehicles.map((vehicle, index) => <MoneyTextField key={vehicle} label={vehicle} value={entranceCosts[index]} onValueChange={(value) => updateEntranceCost(index, value)} />)}</Box></AppGroupBox></Box>;
  const renderRanges = (kind: 'daily' | 'overnight') => { const ranges = kind === 'daily' ? dailyRanges : overnightRanges; const maxHours = kind === 'daily' ? 999 : undefined; return <Box className="tariff-editor-body"><Box className="tariff-rate-toolbar"><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>{labels.spaceKind}</InputLabel><Select label={labels.spaceKind} value={spaceKind} onChange={(event) => setSpaceKind(String(event.target.value))}><MenuItem value="0">{labels.common}</MenuItem></Select></FormControl><Button variant="outlined" onClick={() => addRange(kind)}>{labels.add}</Button></Box><AppGroupBox title={kind === 'daily' ? labels.daily : labels.overnight} className="tariff-range-group"><Box className="tariff-range-grid" dir={fa ? 'rtl' : 'ltr'}>{ranges.length > 0 && <Box className="tariff-range-grid-header"><Typography>{labels.from}</Typography><Typography>{labels.to}</Typography>{vehicles.map((vehicle) => <Typography key={vehicle}>{vehicle}</Typography>)}<span /></Box>}{ranges.map((range, index) => <Box className="tariff-range-grid-row" key={`${kind}-${range.id || index}`}>{kind === 'daily' ? <DurationField maxHours={maxHours} label={labels.from} value={range.from} onChange={(value) => updateRange(kind, index, 'from', value)} /> : <TextField size="small" type="number" label={labels.from} value={range.from} onChange={(event) => updateRange(kind, index, 'from', event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} />}{kind === 'daily' ? <DurationField maxHours={maxHours} label={labels.to} value={range.to} onChange={(value) => updateRange(kind, index, 'to', value)} /> : <TextField size="small" type="number" label={labels.to} value={range.to} onChange={(event) => updateRange(kind, index, 'to', event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} />}{vehicles.map((vehicle, vehicleIndex) => <MoneyTextField size="small" key={vehicle} label={vehicle} value={range.costs[vehicleIndex] ?? ''} onValueChange={(value) => updateRange(kind, index, vehicleIndex, value)} />)}<IconButton color="error" aria-label={fa ? 'حذف بازه' : 'Delete range'} onClick={() => removeRange(kind, index)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Box>)}</Box>{ranges.length === 0 && <Typography variant="body2" color="text.secondary">{labels.empty}</Typography>}</AppGroupBox></Box>; };

  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="lg" slotProps={{ paper: { className: 'crud-dialog-paper tariff-editor-dialog' } }}><DialogTitle>{mode === 'create' ? labels.create : labels.edit}</DialogTitle><DialogContent dividers>{error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}<Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="fullWidth" aria-label={fa ? 'بخش‌های تعرفه' : 'Tariff sections'}><Tab label={labels.general} /><Tab label={labels.daily} /><Tab label={labels.overnight} /></Tabs>{tab === 0 && renderGeneral()}{tab === 1 && renderRanges('daily')}{tab === 2 && renderRanges('overnight')}</DialogContent><DialogActions><Button onClick={onClose} disabled={saving}>{labels.cancel}</Button><Button variant="contained" onClick={() => void save()} disabled={saving}>{labels.confirm}</Button></DialogActions></Dialog>;
}
