import { useEffect, useState } from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import { AppGroupBox } from '../../components/AppGroupBox';
import type { Language } from '../../i18n';
import { tariffService, type MemberKindOption, type TariffListRow } from './tariffService';

type Props = { open: boolean; mode: 'create' | 'edit'; row: TariffListRow | null; parkingId: number; language: Language; onClose: () => void };
type RateRange = { from: string; to: string; costs: string[] };

export function TariffEditorDialog({ open, mode, row, parkingId, language, onClose }: Props) {
  const fa = language === 'fa';
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState(row?.title ?? '');
  const [isMemberTariff, setIsMemberTariff] = useState(row?.isMemberTariff ?? false);
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
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
  const vehicles = fa ? ['وانت و سواری', 'موتورسیکلت', 'ون و مینی‌بوس', 'اتوبوس و کامیون', 'تریلی'] : ['Car and pickup', 'Motorcycle', 'Van and minibus', 'Bus and truck', 'Trailer'];
  const labels = fa ? { create: 'تعرفه جدید', edit: 'ویرایش تعرفه', general: 'تنظیمات عمومی', daily: 'نرخ ساعتی روزانه', overnight: 'نرخ شبانه‌روزی', title: 'عنوان تعرفه', member: 'این تعرفه ویژه اعضاء می‌باشد', active: 'فعال', description: 'توضیحات', memberKinds: 'نوع عضویت', entry: 'ورودی', duration: 'تا', free: 'بازه رایگان', rounding: 'تنظیمات گرد کردن', border: 'مرز گرد کردن', value: 'مقدار گرد کردن', minimumHostelry: 'حداقل توقف برای محاسبه شبانه‌روزی', noHostelryEntry: 'مبلغ ورودی در پارک شبانه‌روزی دریافت نشود', rates: 'نرخ ورود بر اساس نوع وسیله', spaceKind: 'نوع جای پارک', common: 'عمومی', from: 'از', to: 'تا', add: 'افزودن بازه', empty: 'هنوز بازه‌ای ثبت نشده است.', cancel: 'لغو', confirm: 'تأیید' } : { create: 'New tariff', edit: 'Edit tariff', general: 'General settings', daily: 'Daily hourly rates', overnight: 'Overnight rates', title: 'Tariff title', member: 'This tariff is for members', active: 'Active', description: 'Description', memberKinds: 'Membership type', entry: 'Entry', duration: 'Up to', free: 'Free period', rounding: 'Rounding settings', border: 'Rounding border', value: 'Rounding value', minimumHostelry: 'Minimum stay for overnight calculation', noHostelryEntry: 'Do not charge entry fee for overnight parking', rates: 'Entry rate by vehicle type', spaceKind: 'Parking space type', common: 'Common', from: 'From', to: 'To', add: 'Add range', empty: 'No range has been registered.', cancel: 'Cancel', confirm: 'Confirm' };

  useEffect(() => {
    if (!open || !isMemberTariff) return;
    const controller = new AbortController();
    void tariffService.memberKinds(parkingId, controller.signal).then(setMemberKindOptions).catch(() => setMemberKindOptions([]));
    return () => controller.abort();
  }, [open, isMemberTariff, parkingId]);

  const updateEntranceCost = (index: number, value: string) => setEntranceCosts((current) => current.map((cost, costIndex) => costIndex === index ? value : cost));
  const updateRange = (kind: 'daily' | 'overnight', index: number, field: 'from' | 'to' | number, value: string) => {
    const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges;
    setter((current) => current.map((range, rangeIndex) => {
      if (rangeIndex !== index) return range;
      if (typeof field === 'number') return { ...range, costs: range.costs.map((cost, costIndex) => costIndex === field ? value : cost) };
      return { ...range, [field]: value };
    }));
  };
  const addRange = (kind: 'daily' | 'overnight') => {
    const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges;
    setter((current) => [...current, { from: '', to: '', costs: vehicles.map(() => '') }]);
  };
  const removeRange = (kind: 'daily' | 'overnight', index: number) => {
    const setter = kind === 'daily' ? setDailyRanges : setOvernightRanges;
    setter((current) => current.filter((_, rangeIndex) => rangeIndex !== index));
  };
  const renderGeneral = () => <Box className="tariff-editor-body"><Box className="tariff-general-layout"><AppGroupBox title={labels.general} className="tariff-general-info"><TextField autoFocus fullWidth required label={labels.title} value={title} onChange={(event) => setTitle(event.target.value)} /><Box className="tariff-inline-checks"><FormControlLabel control={<Checkbox checked={isMemberTariff} onChange={(event) => setIsMemberTariff(event.target.checked)} />} label={labels.member} /><FormControlLabel control={<Checkbox checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />} label={labels.active} /></Box>{isMemberTariff && <Box className="tariff-member-kind-list" role="group" aria-label={labels.memberKinds}>{memberKindOptions.length === 0 ? <Typography variant="body2" color="text.secondary">{fa ? 'نوع عضویتی برای انتخاب موجود نیست.' : 'No membership type is available.'}</Typography> : memberKindOptions.map((option) => <FormControlLabel key={option.id} control={<Checkbox checked={memberKinds.includes(option.id)} onChange={(event) => setMemberKinds((current) => event.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id))} />} label={option.title} />)}</Box>}<TextField fullWidth multiline minRows={3} label={labels.description} value={description} onChange={(event) => setDescription(event.target.value)} /></AppGroupBox><AppGroupBox title={labels.entry} className="tariff-entry-settings"><Box className="tariff-field-grid"><TextField type="number" label={labels.duration} value={entryDuration} onChange={(event) => setEntryDuration(event.target.value)} /><TextField type="number" label={labels.free} value={entryFreeMinutes} onChange={(event) => setEntryFreeMinutes(event.target.value)} /></Box><Typography variant="caption" color="text.secondary">{labels.rounding}</Typography><Box className="tariff-field-grid"><TextField type="number" label={labels.border} value={roundingBorder} onChange={(event) => setRoundingBorder(event.target.value)} /><TextField type="number" label={labels.value} value={roundingValue} onChange={(event) => setRoundingValue(event.target.value)} /></Box><TextField type="number" label={labels.minimumHostelry} value={maximumHostelryDuration} onChange={(event) => setMaximumHostelryDuration(event.target.value)} /><FormControlLabel control={<Checkbox checked={doNotChargeHostelryEntry} onChange={(event) => setDoNotChargeHostelryEntry(event.target.checked)} />} label={labels.noHostelryEntry} /></AppGroupBox></Box><AppGroupBox title={labels.rates} className="tariff-entry-rates"><Box className="tariff-rate-header">{vehicles.map((vehicle, index) => <TextField key={vehicle} type="number" label={vehicle} value={entranceCosts[index]} onChange={(event) => updateEntranceCost(index, event.target.value)} />)}</Box></AppGroupBox></Box>;
  const renderRanges = (kind: 'daily' | 'overnight') => { const ranges = kind === 'daily' ? dailyRanges : overnightRanges; const valueType = kind === 'daily' ? 'time' : 'number'; return <Box className="tariff-editor-body"><Box className="tariff-rate-toolbar"><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>{labels.spaceKind}</InputLabel><Select label={labels.spaceKind} value={spaceKind} onChange={(event) => setSpaceKind(event.target.value)}><MenuItem value="0">{labels.common}</MenuItem></Select></FormControl><Button variant="outlined" onClick={() => addRange(kind)}>{labels.add}</Button></Box><AppGroupBox title={kind === 'daily' ? labels.daily : labels.overnight} className="tariff-range-group"><Box className="tariff-range-grid" dir={fa ? 'rtl' : 'ltr'}>{ranges.length > 0 && <Box className="tariff-range-grid-header"><Typography>{labels.from}</Typography><Typography>{labels.to}</Typography>{vehicles.map((vehicle) => <Typography key={vehicle}>{vehicle}</Typography>)}<span /></Box>}{ranges.map((range, index) => <Box className="tariff-range-grid-row" key={`${kind}-${index}`}><TextField size="small" type={valueType} label={labels.from} value={range.from} onChange={(event) => updateRange(kind, index, 'from', event.target.value)} /><TextField size="small" type={valueType} label={labels.to} value={range.to} onChange={(event) => updateRange(kind, index, 'to', event.target.value)} />{vehicles.map((vehicle, vehicleIndex) => <TextField size="small" key={vehicle} type="number" label={vehicle} value={range.costs[vehicleIndex]} onChange={(event) => updateRange(kind, index, vehicleIndex, event.target.value)} />)}<IconButton color="error" aria-label={fa ? 'حذف بازه' : 'Delete range'} onClick={() => removeRange(kind, index)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Box>)}</Box>{ranges.length === 0 && <Typography variant="body2" color="text.secondary">{labels.empty}</Typography>}</AppGroupBox></Box>; };

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" slotProps={{ paper: { className: 'crud-dialog-paper tariff-editor-dialog' } }}><DialogTitle>{mode === 'create' ? labels.create : labels.edit}</DialogTitle><DialogContent dividers><Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="fullWidth" aria-label={fa ? 'بخش‌های تعرفه' : 'Tariff sections'}><Tab label={labels.general} /><Tab label={labels.daily} /><Tab label={labels.overnight} /></Tabs>{tab === 0 && renderGeneral()}{tab === 1 && renderRanges('daily')}{tab === 2 && renderRanges('overnight')}</DialogContent><DialogActions><Button onClick={onClose}>{labels.cancel}</Button><Button variant="contained" onClick={onClose}>{labels.confirm}</Button></DialogActions></Dialog>;
}
