import { ReportPreview } from './ReportPreview';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IranianPlateInput, isValidIranianPlate, type VehiclePlateType } from '../../components/IranianPlateInput';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem, Select, TextField } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { usePreparedReport } from './usePreparedReport';
import { parkingApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';

type TrafficReportKind = 'details' | 'daily' | 'average';
type Props = { title: string; parkingId: number; language: Language; kind: TrafficReportKind };
type Door = { id: number; title: string };

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

const kindLabel = (kind: TrafficReportKind, language: Language) => {
  if (language === 'en') return kind === 'details' ? 'Vehicle entry and exit' : kind === 'daily' ? 'Daily door traffic' : 'Average vehicle parking time';
  return kind === 'details' ? 'ورود و خروج خودروها' : kind === 'daily' ? 'تعداد تردد روزانه درب‌ها' : 'متوسط مدت پارک خودرو';
};

const carTypes = [
  { value: 0, fa: 'سواری و وانت', en: 'Car and pickup' },
  { value: 1, fa: 'موتورسیکلت', en: 'Motorcycle' },
  { value: 2, fa: 'ون و مینی‌بوس', en: 'Van and minibus' },
  { value: 3, fa: 'اتوبوس و کامیون', en: 'Bus and truck' },
  { value: 4, fa: 'تریلی', en: 'Trailer' },
];

export function TrafficReportWorkspace({ title, parkingId, language, kind }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousMonth = useMemo(() => { const date = new Date(); date.setMonth(date.getMonth() - 1); return dateValue(date); }, []);
  const [fromDate, setFromDate] = useState(previousMonth);
  const [toDate, setToDate] = useState(today);
  const [plate, setPlate] = useState('');
  const [plateCarType, setPlateCarType] = useState<VehiclePlateType>('0');
  const [memberCode, setMemberCode] = useState('');
  const [carType, setCarType] = useState('');
  const [onlyPresence, setOnlyPresence] = useState(false);
  const [withImage, setWithImage] = useState(false);
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoorIds, setSelectedDoorIds] = useState<number[]>([]);
  const [loadingDoors, setLoadingDoors] = useState(false);
  const { report, loadingReport, error, setError, run } = usePreparedReport(`${parkingId}:${kind}`, language);

  useEffect(() => {
    if (kind !== 'daily') return;
    let current = true;
    setLoadingDoors(true);
    void parkingApi.getDoors(parkingId).then((response) => {
      if (!current) return;
      const values = responseValues(response).flatMap((item) => {
        const row = recordOf(item);
        const id = numberOf(valueOf(row, 'Id'));
        const doorTitle = textOf(valueOf(row, 'Title'));
        return id > 0 && doorTitle ? [{ id, title: doorTitle }] : [];
      });
      setDoors(values);
      setSelectedDoorIds(values.map((door) => door.id));
    }).catch((reason: unknown) => {
      if (current) setError(reason instanceof Error ? reason.message : (fa ? 'دریافت فهرست درب‌ها ناموفق بود.' : 'Doors could not be loaded.'));
    }).finally(() => { if (current) setLoadingDoors(false); });
    return () => { current = false; };
  }, [kind, parkingId, fa]);



  const runReport = () => {
    if (kind === 'details' && plate && !isValidIranianPlate(plate, plateCarType)) { setError(t('reportFilters.invalidPlate')); return; }
    if (fromDate > toDate) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    run(`traffic-${kind}`, { Filters: {
      StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`,
      ParkingId: parkingId, ParkingIds: [parkingId], DoorIds: selectedDoorIds,
      Plate: plate.trim(), MemberCode: memberCode.trim(), WithImage: withImage,
      OnlyPresence: onlyPresence, CarType: carType === '' ? null : Number(carType),
    } });
  };

  const toolbar = <Box className="report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    {kind === 'details' && <>
      <Box className="report-plate-filter"><IranianPlateInput language={language} label={t('reportFilters.plate')} value={plate} carType={plateCarType} onChange={setPlate} onCarTypeChange={setPlateCarType} disabled={loadingReport} /></Box>
      <TextField size="small" label={fa ? 'کد عضو' : 'Member code'} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} sx={{ minWidth: 0 }} />
      <TextField select size="small" label={fa ? 'نوع خودرو' : 'Vehicle type'} value={carType} onChange={(event) => setCarType(event.target.value)} sx={{ minWidth: 0 }}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{carTypes.map((item) => <MenuItem key={item.value} value={item.value}>{fa ? item.fa : item.en}</MenuItem>)}</TextField>
      <FormControlLabel control={<Checkbox checked={onlyPresence} onChange={(event) => setOnlyPresence(event.target.checked)} />} label={fa ? 'فقط حاضرین' : 'Only present'} />
      <FormControlLabel control={<Checkbox checked={withImage} onChange={(event) => setWithImage(event.target.checked)} />} label={fa ? 'با تصویر' : 'With image'} />
    </>}
    {kind === 'daily' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'درب‌ها' : 'Doors'}</InputLabel><Select multiple value={selectedDoorIds} label={fa ? 'درب‌ها' : 'Doors'} disabled={loadingDoors} onChange={(event) => setSelectedDoorIds(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={(selected) => (selected as number[]).map((id) => doors.find((door) => door.id === id)?.title).filter(Boolean).join('، ') || (fa ? 'هیچ‌کدام' : 'None')}>{doors.map((door) => <MenuItem key={door.id} value={door.id}><Checkbox checked={selectedDoorIds.includes(door.id)} /><ListItemText primary={door.title} /></MenuItem>)}</Select></FormControl>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingDoors} sx={{ minHeight: 40 }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {report === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {report !== null && <ReportPreview title={title} language={language} report={report} viewerId={`traffic-report-viewer-${kind}`} count={report.Count} resultKey={report} busy={loadingReport} />}
  </ManagementWorkspaceFrame>;
}
