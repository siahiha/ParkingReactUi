import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, IconButton, InputAdornment, MenuItem, Paper, Popover, Select, TextField, Tooltip, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { ApiError } from '../api/client';
import { parkingApi, trafficApi } from '../api/management';
import { formatDateTime } from '../utils/formatters';
import { AppDataGrid } from './AppDataGrid';
import { WorkspaceToolbar } from './WorkspaceToolbar';

type Language = 'fa' | 'en';
type ExitPermissionRow = Record<string, unknown>;

function unwrap(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const value = input as Record<string, unknown>;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}

function rowsOf(input: unknown): ExitPermissionRow[] {
  const value = unwrap(input);
  return Array.isArray(value) ? value.filter((row): row is ExitPermissionRow => Boolean(row && typeof row === 'object')) : [];
}

function valueOf(row: ExitPermissionRow, key: string): unknown {
  return row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
}

function isLeapGregorian(year: number) { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }
function latinDigits(value: string) { return value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))); }
function jalaliToGregorian(input: string): string | null {
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(latinDigits(input.trim()));
  if (!match) return null;
  const jy = Number(match[1]); const jm = Number(match[2]); const jd = Number(match[3]);
  if (jm < 1 || jm > 12 || jd < 1 || jd > (jm <= 6 ? 31 : jm <= 11 ? 30 : 30)) return null;
  const y = jy + 1595;
  let days = -355668 + (365 * y) + Math.floor(y / 33) * 8 + Math.floor(((y % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 1) * 30 + 6);
  let gy = 400 * Math.floor(days / 146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gm = 0; let gd = days + 1;
  const monthDays = [31, isLeapGregorian(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  while (gm < 12 && gd > monthDays[gm]) { gd -= monthDays[gm]; gm++; }
  return `${String(gy).padStart(4, '0')}-${String(gm + 1).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

function gregorianToJalali(input: string): string {
  const [gy, gm, gd] = input.split('-').map(Number);
  if (!gy || !gm || !gd) return '';
  const gMonthDays = [0, 31, isLeapGregorian(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let days = 365 * (gy - 1600) + Math.floor((gy - 1600 + 3) / 4) - Math.floor((gy - 1600 + 99) / 100) + Math.floor((gy - 1600 + 399) / 400) - 80 + gd;
  for (let month = 1; month < gm; month++) days += gMonthDays[month];
  let jy = 979 + 33 * Math.floor(days / 12053); days %= 12053;
  jy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return `${String(jy).padStart(4, '0')}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

function jalaliMonthDays(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  const start = jalaliToGregorian(`${year}/01/01`);
  const next = jalaliToGregorian(`${year + 1}/01/01`);
  return start && next && Math.round((Date.parse(`${next}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) === 366 ? 30 : 29;
}

function isoDate(year: number, month: number, day: number) { return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }

function DatePickerField({ language, label, value, onChange }: { language: Language; label: string; value: string; onChange: (value: string) => void }) {
  const isPersian = language === 'fa';
  const today = new Date();
  const initial = value ? (isPersian ? gregorianToJalali(value).split('/').map(Number) : value.split('-').map(Number)) : (isPersian ? gregorianToJalali(isoDate(today.getFullYear(), today.getMonth() + 1, today.getDate())).split('/').map(Number) : [today.getFullYear(), today.getMonth() + 1]);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [viewYear, setViewYear] = useState(initial[0]);
  const [viewMonth, setViewMonth] = useState(initial[1]);
  useEffect(() => {
    if (!open) return;
    const current = value ? (isPersian ? gregorianToJalali(value).split('/').map(Number) : value.split('-').map(Number)) : initial;
    setViewYear(current[0]); setViewMonth(current[1]);
  }, [open, value, language]);
  const monthNames = isPersian ? ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekNames = isPersian ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstGregorian = isPersian ? jalaliToGregorian(`${viewYear}/${String(viewMonth).padStart(2, '0')}/01`) : isoDate(viewYear, viewMonth, 1);
  const firstWeekday = firstGregorian ? new Date(`${firstGregorian}T00:00:00Z`).getUTCDay() : 0;
  const offset = isPersian ? (firstWeekday + 1) % 7 : firstWeekday;
  const days = isPersian ? jalaliMonthDays(viewYear, viewMonth) : new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
  const selectedDay = value ? Number((isPersian ? gregorianToJalali(value).split('/')[2] : value.split('-')[2])) : 0;
  const changeMonth = (amount: number) => { let nextMonth = viewMonth + amount; let nextYear = viewYear; if (nextMonth < 1) { nextMonth = 12; nextYear--; } if (nextMonth > 12) { nextMonth = 1; nextYear++; } setViewMonth(nextMonth); setViewYear(nextYear); };
  const selectDay = (day: number) => { onChange(isPersian ? (jalaliToGregorian(`${viewYear}/${String(viewMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`) ?? '') : isoDate(viewYear, viewMonth, day)); setOpen(false); };
  const displayValue = value ? (isPersian ? gregorianToJalali(value) : value) : '';
  return <>
    <TextField size="small" label={label} value={displayValue} placeholder={isPersian ? '۱۴۰۴/۰۱/۰۱' : 'YYYY-MM-DD'} slotProps={{ input: { readOnly: true, endAdornment: <InputAdornment position="end"><IconButton size="small" aria-label={label} onClick={(event) => { setAnchor(event.currentTarget); setOpen(true); }}><CalendarMonthRoundedIcon /></IconButton></InputAdornment> } }} onClick={(event) => { setAnchor(event.currentTarget); setOpen(true); }} />
    <Popover open={open} anchorEl={anchor} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box dir={isPersian ? 'rtl' : 'ltr'} sx={{ p: 1.5, width: 280 }}>
        <Box className="inline-status-row" sx={{ justifyContent: 'space-between', mb: 1 }}>
          <IconButton size="small" onClick={() => changeMonth(isPersian ? 1 : -1)}><ChevronLeftRoundedIcon /></IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{monthNames[viewMonth - 1]} {viewYear}</Typography>
          <IconButton size="small" onClick={() => changeMonth(isPersian ? -1 : 1)}><ChevronRightRoundedIcon /></IconButton>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, textAlign: 'center' }}>
          {weekNames.map((day, index) => <Typography key={`${day}-${index}`} variant="caption" color="text.secondary" sx={{ p: 0.5, fontWeight: 800 }}>{day}</Typography>)}
          {Array.from({ length: offset + days }, (_, index) => index < offset ? <Box key={`empty-${index}`} /> : <Button key={index} size="small" onClick={() => selectDay(index - offset + 1)} variant={selectedDay === index - offset + 1 ? 'contained' : 'text'} sx={{ minWidth: 0, p: 0.5 }}>{index - offset + 1}</Button>)}
        </Box>
      </Box>
    </Popover>
  </>;
}

export function ExitPermissionWorkspace({ parkingId, language, userId, pageTitle }: { parkingId: number; language: Language; userId: number; pageTitle: string }) {
  const [rows, setRows] = useState<ExitPermissionRow[]>([]);
  const [doors, setDoors] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>('pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const copy = language === 'fa'
    ? { title: 'مجوز خروج', refresh: 'به‌روزرسانی', apply: 'اعمال فیلتر', start: 'از تاریخ', end: 'تا تاریخ', all: 'همه', pending: 'در انتظار مجوز', approved: 'مجوز داده‌شده', loading: 'در حال دریافت...', empty: 'ترددی برای نمایش وجود ندارد.', approve: 'تأیید مجوز خروج', reject: 'رد مجوز خروج', plate: 'پلاک', member: 'عضو', enter: 'زمان ورود', exit: 'زمان خروج', status: 'وضعیت مجوز', approvedLabel: 'تأیید شده', rejectedLabel: 'رد شده', pendingLabel: 'در انتظار', saved: 'وضعیت مجوز خروج ثبت شد.', error: 'دریافت یا ثبت مجوز خروج ناموفق بود.' }
    : { title: 'Exit permission', refresh: 'Refresh', apply: 'Apply filters', start: 'From date', end: 'To date', all: 'All', pending: 'Pending', approved: 'Approved', loading: 'Loading...', empty: 'No traffic records found.', approve: 'Approve exit', reject: 'Reject exit', plate: 'Plate', member: 'Member', enter: 'Entry time', exit: 'Exit time', status: 'Permission status', approvedLabel: 'Approved', rejectedLabel: 'Rejected', pendingLabel: 'Pending', saved: 'Exit permission saved.', error: 'Loading or saving exit permission failed.' };


  const load = async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const doorsResponse = await parkingApi.getDoors(parkingId);
      const doorIds = rowsOf(doorsResponse).map((row) => Number(valueOf(row, 'Id') ?? 0)).filter((id) => id > 0);
      setDoors(doorIds);
      const responses = await Promise.all(doorIds.map((doorId) => trafficApi.getExitPermissions(doorId, { status, startDate, endDate })));
      const unique = new Map<number, ExitPermissionRow>();
      responses.flatMap(rowsOf).forEach((row) => { const id = Number(valueOf(row, 'DumpId') ?? valueOf(row, 'Id') ?? 0); if (id > 0) unique.set(id, row); });
      setRows(Array.from(unique.values())); setSelectedId(null);
    } catch (cause) {
      setRows([]); setError(cause instanceof ApiError && cause.status === 403 ? (language === 'fa' ? 'دسترسی مشاهده‌ی مجوز خروج برای این کاربر مجاز نیست.' : 'The current user cannot view exit permissions.') : copy.error);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [parkingId, status]);

  const selected = useMemo(() => rows.find((row) => Number(valueOf(row, 'DumpId') ?? valueOf(row, 'Id')) === selectedId), [rows, selectedId]);
  const updatePermission = async (allowed: boolean) => {
    if (!selected) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const dumpId = Number(valueOf(selected, 'DumpId') ?? valueOf(selected, 'Id'));
      await trafficApi.updateExitPermission(dumpId, allowed, userId);
      setMessage(copy.saved); await load();
    } catch { setError(copy.error); } finally { setSaving(false); }
  };

  const permissionState = (row: ExitPermissionRow) => {
    const value = valueOf(row, 'ExitPermission');
    return value === true || value === 1 || value === 'true' || value === 'True' ? copy.approvedLabel : value === false || value === 0 || value === 'false' || value === 'False' ? copy.rejectedLabel : copy.pendingLabel;
  };

  return <Paper className="home-workspace parking-management-workspace exit-permission-workspace" elevation={0}>
    <Box className="workspace-heading workspace-heading-unified">
      <Box className="workspace-page-context"><Typography component="h1" variant="h1">{pageTitle}</Typography><Typography component="span" className="workspace-heading-separator">-</Typography><Typography variant="h6">{copy.title}</Typography><Typography variant="body2" color="text.secondary">{rows.length} {language === 'fa' ? 'رکورد' : 'records'}</Typography></Box>
      <Tooltip title={copy.refresh} arrow><IconButton className="workspace-refresh-button" aria-label={copy.refresh} disabled={loading} onClick={() => void load()}><RefreshRoundedIcon /></IconButton></Tooltip>
    </Box>
    <WorkspaceToolbar ariaLabel={language === 'fa' ? 'ابزارهای مجوز خروج' : 'Exit permission actions'}>
        <Tooltip title={copy.approve} arrow><span><IconButton color="success" aria-label={copy.approve} disabled={!selected || saving} onClick={() => void updatePermission(true)}><CheckRoundedIcon /></IconButton></span></Tooltip>
        <Tooltip title={copy.reject} arrow><span><IconButton color="error" aria-label={copy.reject} disabled={!selected || saving} onClick={() => void updatePermission(false)}><CloseRoundedIcon /></IconButton></span></Tooltip>
      </WorkspaceToolbar>
    <Divider sx={{ my: 2 }} />
    <Box className="exit-permission-toolbar" sx={{ mb: 2 }}>
      <DatePickerField language={language} label={copy.start} value={startDate} onChange={setStartDate} />
      <DatePickerField language={language} label={copy.end} value={endDate} onChange={setEndDate} />
      <Select size="small" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label={copy.status}>
        <MenuItem value="pending">{copy.pending}</MenuItem><MenuItem value="approved">{copy.approved}</MenuItem><MenuItem value="all">{copy.all}</MenuItem>
      </Select>
      <Button variant="outlined" onClick={() => void load()} disabled={loading}>{copy.apply}</Button>
    </Box>
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loading && <Box className="inline-status-row"><CircularProgress size={20} /><Typography variant="body2">{copy.loading}</Typography></Box>}
    {!loading && !error && rows.length === 0 && <Alert severity="info">{copy.empty}</Alert>}
    {!loading && rows.length > 0 && <AppDataGrid
      direction={language === 'fa' ? 'rtl' : 'ltr'}
      rows={rows}
      rowKey={(row, index) => Number(valueOf(row, 'DumpId') ?? valueOf(row, 'Id') ?? index)}
      selectedKey={selectedId}
      onRowClick={(row, index) => setSelectedId(Number(valueOf(row, 'DumpId') ?? valueOf(row, 'Id') ?? index))}
      columns={[
        { key: 'plate', label: copy.plate, render: (row) => String(valueOf(row, 'CarPlate') ?? valueOf(row, 'AbsolutCarPlate') ?? '—') },
        { key: 'member', label: copy.member, render: (row) => String(valueOf(row, 'MemberFullName') ?? valueOf(row, 'MemberCode') ?? '—') },
        { key: 'enter', label: copy.enter, render: (row) => formatDateTime(valueOf(row, 'EnterDateTime'), language) },
        { key: 'exit', label: copy.exit, render: (row) => formatDateTime(valueOf(row, 'ExitDateTime'), language) },
        { key: 'status', label: copy.status, render: (row) => permissionState(row) },
      ]}
    />}
    {doors.length === 0 && !loading && !error && <Typography variant="caption" color="text.secondary">{language === 'fa' ? 'برای این پارکینگ دربی ثبت نشده است.' : 'No doors are configured for this parking.'}</Typography>}
  </Paper>;
}
