import { ReportPreview } from './ReportPreview';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { usePreparedReport } from './usePreparedReport';
import { cargoApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { IranianPlateInput, isValidIranianPlate } from '../../components/IranianPlateInput';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';

type Props = { title: string; language: Language };
type SelectOption = { id: number; title: string };

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

function requiredData(input: unknown) {
  const response = recordOf(input);
  const value = recordOf(valueOf(response, 'Values') ?? input);
  const options = (key: string) => Array.isArray(valueOf(value, key)) ? (valueOf(value, key) as unknown[]).map((item) => recordOf(item)) : [];
  const drivers = options('Drivers').flatMap((row) => { const id = numberOf(valueOf(row, 'Id')); const title = `${textOf(valueOf(row, 'FirstName'))} ${textOf(valueOf(row, 'LastName'))}`.trim(); return id > 0 && title ? [{ id, title }] : []; });
  const merchandises = options('Merchandises').flatMap((row) => { const id = numberOf(valueOf(row, 'Id')); const title = textOf(valueOf(row, 'MerchandiseTitle')); return id > 0 && title ? [{ id, title }] : []; });
  const companies = options('companyDetails').flatMap((row) => { const id = numberOf(valueOf(row, 'SectionId')); const title = `${textOf(valueOf(row, 'CompanyName'))} - ${textOf(valueOf(row, 'SectionName'))}`.trim(); return id > 0 && title ? [{ id, title, isOrigin: Boolean(valueOf(row, 'IsOriginSection')), isDestination: Boolean(valueOf(row, 'IsDestinationSection')) }] : []; });
  return { drivers, merchandises, companies };
}

export function CargoReportWorkspace({ title, language }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousMonth = useMemo(() => { const date = new Date(); date.setMonth(date.getMonth() - 1); return dateValue(date); }, []);
  const [fromDate, setFromDate] = useState(previousMonth);
  const [toDate, setToDate] = useState(today);
  const [plate, setPlate] = useState('');
  const [carType, setCarType] = useState<'0' | '1' | '2' | '3' | '4'>('0');
  const [driverId, setDriverId] = useState('');
  const [merchandiseId, setMerchandiseId] = useState('');
  const [originSectionId, setOriginSectionId] = useState('');
  const [destinationSectionId, setDestinationSectionId] = useState('');
  const [withAttachments, setWithAttachments] = useState(false);
  const [drivers, setDrivers] = useState<SelectOption[]>([]);
  const [merchandises, setMerchandises] = useState<SelectOption[]>([]);
  const [originSections, setOriginSections] = useState<SelectOption[]>([]);
  const [destinationSections, setDestinationSections] = useState<SelectOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const { report, loadingReport, error, setError, run } = usePreparedReport('cargo', language);

  useEffect(() => {
    let current = true;
    setLoadingLookups(true);
    void cargoApi.getRequiredData().then((response) => {
      if (!current) return;
      const data = requiredData(response);
      setDrivers(data.drivers); setMerchandises(data.merchandises);
      setOriginSections(data.companies.filter((item) => item.isOrigin));
      setDestinationSections(data.companies.filter((item) => item.isDestination));
    }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'دریافت اطلاعات حمل بار ناموفق بود.' : 'Cargo filter data could not be loaded.')); }).finally(() => { if (current) setLoadingLookups(false); });
    return () => { current = false; };
  }, [fa]);



  const runReport = () => {
    if (plate && !isValidIranianPlate(plate, carType)) { setError(t('reportFilters.invalidPlate')); return; }
    if (fromDate > toDate) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    run('cargo', { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`,
      Plate: plate.trim(), DriverId: driverId ? Number(driverId) : null,
      MerchandiseId: merchandiseId ? Number(merchandiseId) : null,
      OriginSectionId: originSectionId ? Number(originSectionId) : null,
      DestinationSectionId: destinationSectionId ? Number(destinationSectionId) : null, IsNeedAttachment: withAttachments });
  };

  const optionSelect = (label: string, value: string, onChange: (value: string) => void, options: SelectOption[]) => <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{label}</InputLabel><Select value={value} label={label} disabled={loadingLookups} onChange={(event) => onChange(event.target.value)}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{options.map((option) => <MenuItem key={option.id} value={option.id}>{option.title}</MenuItem>)}</Select></FormControl>;
  const toolbar = <Box className="report-filter-toolbar cargo-report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    <Box className="report-plate-filter"><IranianPlateInput language={language} label={t('reportFilters.plate')} value={plate} carType={carType} onChange={setPlate} onCarTypeChange={setCarType} disabled={loadingReport} /></Box>
    {optionSelect(fa ? 'راننده' : 'Driver', driverId, setDriverId, drivers)}
    {optionSelect(fa ? 'کالا' : 'Merchandise', merchandiseId, setMerchandiseId, merchandises)}
    {optionSelect(fa ? 'مبدا' : 'Origin', originSectionId, setOriginSectionId, originSections)}
    {optionSelect(fa ? 'مقصد' : 'Destination', destinationSectionId, setDestinationSectionId, destinationSections)}
    <TextField select size="small" label={fa ? 'پیوست‌ها' : 'Attachments'} value={withAttachments ? 'yes' : 'no'} onChange={(event) => setWithAttachments(event.target.value === 'yes')}><MenuItem value="no">{fa ? 'بدون پیوست' : 'Without attachments'}</MenuItem><MenuItem value="yes">{fa ? 'با پیوست' : 'With attachments'}</MenuItem></TextField>
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {report === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {report !== null && <ReportPreview title={title} language={language} report={report} viewerId={'cargo-report-viewer'} count={report.Count} resultKey={report} busy={loadingReport} />}
  </ManagementWorkspaceFrame>;
}
