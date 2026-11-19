import { ReportPreview } from './ReportPreview';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControl, InputLabel, ListItemText, MenuItem, Select, TextField } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { usePreparedReport } from './usePreparedReport';
import { parkingApi, userApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { IranianPlateInput, isValidIranianPlate } from '../../components/IranianPlateInput';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';

type ManagementReportKind = 'monthly-income-comparison' | 'income-comparison' | 'yearly-income-comparison' | 'user-performance' | 'free-parking-income';
type Props = { title: string; language: Language; kind: ManagementReportKind };
type Parking = { id: number; title: string };
type User = { id: number; title: string };

const dateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const recordOf = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const valueOf = (row: Record<string, unknown>, key: string) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
const textOf = (value: unknown) => value === null || value === undefined ? '' : String(value);
const numberOf = (value: unknown) => Number(value ?? 0);

function responseValues(input: unknown): unknown[] {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || 'پاسخ سرویس معتبر نیست.');
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
}

function currentPersianYear() {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', timeZone: 'UTC' }).formatToParts(new Date());
  return Number(parts.find((part) => part.type === 'year')?.value ?? new Date().getFullYear() - 621);
}

const carTypes = [
  { value: 0, fa: 'سواری و وانت', en: 'Car and pickup' },
  { value: 1, fa: 'موتورسیکلت', en: 'Motorcycle' },
  { value: 2, fa: 'ون و مینی‌بوس', en: 'Van and minibus' },
  { value: 3, fa: 'اتوبوس و کامیون', en: 'Bus and truck' },
  { value: 4, fa: 'تریلی', en: 'Trailer' },
];

export function ManagementReportWorkspace({ title, language, kind }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousMonth = useMemo(() => { const date = new Date(); date.setMonth(date.getMonth() - 1); return dateValue(date); }, []);
  const [fromDate, setFromDate] = useState(previousMonth);
  const [toDate, setToDate] = useState(today);
  const [parkingOptions, setParkingOptions] = useState<Parking[]>([]);
  const [selectedParkingIds, setSelectedParkingIds] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([currentPersianYear()]);
  const [memberCode, setMemberCode] = useState('');
  const [plate, setPlate] = useState('');
  const [plateCarType, setPlateCarType] = useState<'0' | '1' | '2' | '3' | '4'>('0');
  const [carType, setCarType] = useState('');
  const [userId, setUserId] = useState('0');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const { report, loadingReport, error, setError, run } = usePreparedReport(kind, language);

  const isIncome = kind === 'monthly-income-comparison' || kind === 'income-comparison' || kind === 'yearly-income-comparison';
  const needsUsers = kind === 'user-performance';
  const needsParkingSelection = isIncome || kind === 'free-parking-income';

  useEffect(() => {
    let current = true;
    setLoadingLookups(true);
    const tasks: Array<Promise<void>> = [];
    if (needsParkingSelection) tasks.push(parkingApi.list().then((response) => {
      if (!current) return;
      const options = responseValues(response).flatMap((item) => { const row = recordOf(item); const id = numberOf(valueOf(row, 'Id')); const titleValue = textOf(valueOf(row, 'ParkingName') ?? valueOf(row, 'Title')); return id > 0 && titleValue ? [{ id, title: titleValue }] : []; });
      setParkingOptions(options);
      setSelectedParkingIds(options.map((item) => item.id));
    }));
    if (needsUsers) tasks.push(userApi.list().then((response) => {
      if (!current) return;
      setUsers(responseValues(response).flatMap((item) => { const row = recordOf(item); const id = numberOf(valueOf(row, 'Id')); const titleValue = textOf(valueOf(row, 'UserName')); return id > 0 && titleValue ? [{ id, title: titleValue }] : []; }));
    }));
    void Promise.all(tasks).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'دریافت فهرست فیلترها ناموفق بود.' : 'Report filters could not be loaded.')); }).finally(() => { if (current) setLoadingLookups(false); });
    return () => { current = false; };
  }, [needsParkingSelection, needsUsers, fa]);



  const runReport = () => {
    if (kind === 'free-parking-income' && plate && !isValidIranianPlate(plate, plateCarType)) { setError(t('reportFilters.invalidPlate')); return; }
    if (isIncome && selectedParkingIds.length === 0) { setError(fa ? 'حداقل یک پارکینگ را انتخاب کنید.' : 'Select at least one parking.'); return; }
    if (kind === 'free-parking-income' && selectedParkingIds.length === 0) { setError(fa ? 'هیچ پارکینگی انتخاب نشده است.' : 'No parking was selected.'); return; }
    if (fromDate > toDate && (kind === 'user-performance' || kind === 'free-parking-income')) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    if (isIncome && selectedYears.length === 0) { setError(fa ? 'حداقل یک سال را انتخاب کنید.' : 'Select at least one year.'); return; }
    const dates = { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59` };
    const parameters = isIncome ? { Filters: { ...dates, ParkingIds: selectedParkingIds, SolarYears: selectedYears, DoorIds: [] } }
      : kind === 'user-performance' ? { ...dates, UserId: Number(userId) }
      : { Filters: { ...dates, ListParkingId: selectedParkingIds, MemberCode: memberCode.trim(), Plate: plate.trim(),
        WithImage: false, OnlyPresence: false, CarType: carType === '' ? null : Number(carType) } };
    run(kind === 'user-performance' ? 'management-user-performance' : kind, parameters);
  };

  const parkingSummary = selectedParkingIds.map((id) => parkingOptions.find((item) => item.id === id)?.title).filter(Boolean).join('، ') || (fa ? 'هیچ‌کدام' : 'None');
  const yearSummary = selectedYears.join('، ');
  const yearOptions = Array.from({ length: 21 }, (_, index) => currentPersianYear() - index);
  const toolbar = <Box className="report-filter-toolbar management-report-filter-toolbar">
    {needsParkingSelection && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'پارکینگ‌ها' : 'Parkings'}</InputLabel><Select multiple value={selectedParkingIds} label={fa ? 'پارکینگ‌ها' : 'Parkings'} disabled={loadingLookups} onChange={(event) => setSelectedParkingIds(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={() => parkingSummary}>{parkingOptions.map((item) => <MenuItem key={item.id} value={item.id}><Checkbox checked={selectedParkingIds.includes(item.id)} /><ListItemText primary={item.title} /></MenuItem>)}</Select></FormControl>}
    {kind === 'monthly-income-comparison' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'سال' : 'Year'}</InputLabel><Select value={selectedYears[0] ?? ''} label={fa ? 'سال' : 'Year'} onChange={(event) => setSelectedYears([Number(event.target.value)])}>{yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</Select></FormControl>}
    {(kind === 'income-comparison' || kind === 'yearly-income-comparison') && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'سال‌ها' : 'Years'}</InputLabel><Select multiple value={selectedYears} label={fa ? 'سال‌ها' : 'Years'} onChange={(event) => setSelectedYears(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={() => yearSummary}>{yearOptions.map((year) => <MenuItem key={year} value={year}><Checkbox checked={selectedYears.includes(year)} /><ListItemText primary={year} /></MenuItem>)}</Select></FormControl>}
    {(kind === 'user-performance' || kind === 'free-parking-income') && <><Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box><Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box></>}
    {kind === 'user-performance' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'کاربر' : 'User'}</InputLabel><Select value={userId} label={fa ? 'کاربر' : 'User'} disabled={loadingLookups} onChange={(event) => setUserId(event.target.value)}><MenuItem value="0">{fa ? 'کاربر جاری' : 'Current user'}</MenuItem>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.title}</MenuItem>)}</Select></FormControl>}
    {kind === 'free-parking-income' && <><TextField size="small" label={fa ? 'کد عضو' : 'Member code'} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} /><Box className="report-plate-filter"><IranianPlateInput language={language} label={t('reportFilters.plate')} value={plate} carType={plateCarType} onChange={setPlate} onCarTypeChange={setPlateCarType} disabled={loadingReport} /></Box><TextField select size="small" label={fa ? 'نوع خودرو' : 'Vehicle type'} value={carType} onChange={(event) => setCarType(event.target.value)}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{carTypes.map((item) => <MenuItem key={item.value} value={item.value}>{fa ? item.fa : item.en}</MenuItem>)}</TextField></>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups} sx={{ minHeight: 40 }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {report === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {report !== null && <ReportPreview title={title} language={language} report={report} viewerId={`management-report-viewer-${kind}`} count={report.Count} resultKey={report} busy={loadingReport} />}
  </ManagementWorkspaceFrame>;
}
