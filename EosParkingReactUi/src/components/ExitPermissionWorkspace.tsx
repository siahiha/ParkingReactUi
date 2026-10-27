import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Divider, IconButton, MenuItem, Paper, Select, Tooltip, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ApiError } from '../api/client';
import { parkingApi, trafficApi } from '../api/management';
import { formatDateTime } from '../utils/formatters';
import { AppDataGrid } from './AppDataGrid';
import { EosDateTimePicker } from './EosDateTimePicker';

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

export function ExitPermissionWorkspace({ parkingId, language }: { parkingId: number; language: Language }) {
  const [rows, setRows] = useState<ExitPermissionRow[]>([]);
  const [doors, setDoors] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>('pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const copy = language === 'fa'
    ? { title: 'مجوز خروج', refresh: 'به‌روزرسانی', apply: 'اعمال فیلتر', start: 'از تاریخ', end: 'تا تاریخ', all: 'همه', pending: 'در انتظار مجوز', approved: 'مجوز داده‌شده', loading: 'در حال دریافت...', empty: 'ترددی برای نمایش وجود ندارد.', plate: 'پلاک', member: 'عضو', enter: 'زمان ورود', exit: 'زمان خروج', status: 'وضعیت مجوز', approvedLabel: 'تأیید شده', rejectedLabel: 'رد شده', pendingLabel: 'در انتظار', error: 'دریافت یا ثبت مجوز خروج ناموفق بود.' }
    : { title: 'Exit permission', refresh: 'Refresh', apply: 'Apply filters', start: 'From date', end: 'To date', all: 'All', pending: 'Pending', approved: 'Approved', loading: 'Loading...', empty: 'No traffic records found.', plate: 'Plate', member: 'Member', enter: 'Entry time', exit: 'Exit time', status: 'Permission status', approvedLabel: 'Approved', rejectedLabel: 'Rejected', pendingLabel: 'Pending', error: 'Loading or saving exit permission failed.' };


  const load = async () => {
    setLoading(true); setError('');
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

  const permissionState = (row: ExitPermissionRow) => {
    const value = valueOf(row, 'ExitPermission');
    return value === true || value === 1 || value === 'true' || value === 'True' ? copy.approvedLabel : value === false || value === 0 || value === 'false' || value === 'False' ? copy.rejectedLabel : copy.pendingLabel;
  };

  return <Paper className="home-workspace parking-management-workspace exit-permission-workspace" elevation={0}>
    <Box className="workspace-heading">
      <Box className="workspace-resource-heading"><Typography variant="h6">{copy.title}</Typography><Typography variant="body2" color="text.secondary">{rows.length} {language === 'fa' ? 'رکورد' : 'records'}</Typography></Box>
      <Tooltip title={copy.refresh} arrow><IconButton className="workspace-refresh-button" aria-label={copy.refresh} disabled={loading} onClick={() => void load()}><RefreshRoundedIcon /></IconButton></Tooltip>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Box className="exit-permission-toolbar" sx={{ mb: 2 }}>
      <EosDateTimePicker language={language} label={copy.start} value={startDate} onChange={setStartDate} dateOnly size="small" />
      <EosDateTimePicker language={language} label={copy.end} value={endDate} onChange={setEndDate} dateOnly size="small" />
      <Select size="small" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label={copy.status}>
        <MenuItem value="pending">{copy.pending}</MenuItem><MenuItem value="approved">{copy.approved}</MenuItem><MenuItem value="all">{copy.all}</MenuItem>
      </Select>
      <Tooltip title={copy.apply} arrow><span><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.apply} onClick={() => void load()} disabled={loading}><SearchRoundedIcon /></IconButton></span></Tooltip>
    </Box>
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
