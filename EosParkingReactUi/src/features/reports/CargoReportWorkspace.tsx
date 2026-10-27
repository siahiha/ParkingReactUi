import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Viewer, Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { cargoApi, reportApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { IranianPlateInput } from '../../components/IranianPlateInput';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import cargoReportTemplate from '../../assets/report-templates/CargoIoReport.mrt?raw';

type Props = { title: string; language: Language };
type ReportRow = Record<string, unknown>;
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
const boolOf = (value: unknown) => value === true || value === 1 || String(value).toLowerCase() === 'true';

function responseValues(input: unknown): unknown[] {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || 'پاسخ سرویس معتبر نیست.');
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
}

function normalizeCargoRows(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    return {
      CargoId: numberOf(valueOf(row, 'CargoId')),
      DumpId: numberOf(valueOf(row, 'DumpId')),
      IsOutBoundCargo: boolOf(valueOf(row, 'IsOutBoundCargo')),
      Plate: textOf(valueOf(row, 'Plate')),
      CarPlateReversed: textOf(valueOf(row, 'CarPlateReversed') ?? valueOf(row, 'Plate')),
      EnterDateTime: valueOf(row, 'EnterDateTime') ?? null,
      ExitDateTime: valueOf(row, 'ExitDateTime') ?? null,
      DriverId: numberOf(valueOf(row, 'DriverId')),
      DriverFirstName: textOf(valueOf(row, 'DriverFirstName')),
      DriverLastName: textOf(valueOf(row, 'DriverLastName')),
      MerchandiseId: numberOf(valueOf(row, 'MerchandiseId')),
      Merchandise: textOf(valueOf(row, 'Merchandise')),
      OriginCompanyName: textOf(valueOf(row, 'OriginCompanyName')),
      OriginSectionName: textOf(valueOf(row, 'OriginSectionName')),
      DestinationCompanyName: textOf(valueOf(row, 'DestinationCompanyName')),
      DestinationSectionName: textOf(valueOf(row, 'DestinationSectionName')),
      Reason: textOf(valueOf(row, 'Reason')),
      Count: numberOf(valueOf(row, 'Count')),
      Weight: numberOf(valueOf(row, 'Weight')),
      Description: textOf(valueOf(row, 'Description')),
      SolarEnterDate: textOf(valueOf(row, 'SolarEnterDate')),
      SolarEndDate: textOf(valueOf(row, 'SolarEndDate')),
      Documents: Array.isArray(valueOf(row, 'Documents')) ? valueOf(row, 'Documents') : [],
    };
  });
}

function requiredData(input: unknown) {
  const response = recordOf(input);
  const value = recordOf(valueOf(response, 'Values') ?? input);
  const options = (key: string) => Array.isArray(valueOf(value, key)) ? (valueOf(value, key) as unknown[]).map((item) => recordOf(item)) : [];
  const drivers = options('Drivers').flatMap((row) => { const id = numberOf(valueOf(row, 'Id')); const title = `${textOf(valueOf(row, 'FirstName'))} ${textOf(valueOf(row, 'LastName'))}`.trim(); return id > 0 && title ? [{ id, title }] : []; });
  const merchandises = options('Merchandises').flatMap((row) => { const id = numberOf(valueOf(row, 'Id')); const title = textOf(valueOf(row, 'MerchandiseTitle')); return id > 0 && title ? [{ id, title }] : []; });
  const companies = options('companyDetails').flatMap((row) => { const id = numberOf(valueOf(row, 'SectionId')); const title = `${textOf(valueOf(row, 'CompanyName'))} - ${textOf(valueOf(row, 'SectionName'))}`.trim(); return id > 0 && title ? [{ id, title, isOrigin: Boolean(valueOf(row, 'IsOriginSection')), isDestination: Boolean(valueOf(row, 'IsDestinationSection')) }] : []; });
  return { drivers, merchandises, companies };
}

async function createReport(rows: ReportRow[], language: Language, titleDescription: string, withAttachments: boolean) {
  const licenseKey = import.meta.env.VITE_STIMULSOFT_LICENSE;
  if (licenseKey) Stimulsoft.Base.StiLicense.key = licenseKey;
  const attachmentRows = withAttachments ? rows.flatMap((row) => (Array.isArray(row.Documents) ? row.Documents : []).map((document) => { const doc = recordOf(document); return { CargoId: numberOf(row.CargoId), Attachment: valueOf(doc, 'Attachment') ?? null }; })) : [];
  const dataSet = new Stimulsoft.System.Data.DataSet('DB');
  dataSet.readJson(JSON.stringify({ MainTable: rows.map(({ Documents: _documents, ...row }) => row), AttachmentTable: attachmentRows }));
  const report = new Stimulsoft.Report.StiReport();
  report.regData('DB', 'DB', dataSet);
  report.dictionary.synchronize();
  report.load(cargoReportTemplate);
  report.setVariable('ReportDateTime', new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'));
  report.setVariable('TitleDescription', titleDescription);
  await report.renderAsync2();
  return report;
}

export function CargoReportWorkspace({ title, language }: Props) {
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
  const [loadingReport, setLoadingReport] = useState(false);
  const [renderingReport, setRenderingReport] = useState(false);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [report, setReport] = useState<Stimulsoft.Report.StiReport | null>(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    let current = true;
    if (rows === null) { setReport(null); setRenderingReport(false); return () => { current = false; }; }
    setReport(null); setRenderingReport(true);
    void createReport(rows, language, fa ? `از تاریخ ${fromDate} تا تاریخ ${toDate}` : `From ${fromDate} to ${toDate}`, withAttachments).then((renderedReport) => { if (current) setReport(renderedReport); }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'رندر گزارش حمل بار ناموفق بود.' : 'The cargo report could not be rendered.')); }).finally(() => { if (current) setRenderingReport(false); });
    return () => { current = false; };
  }, [rows, language, fromDate, toDate, withAttachments, fa]);

  const viewerOptions = useMemo(() => {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%'; options.height = '100%'; options.appearance.fullScreenMode = false; options.appearance.rightToLeft = fa;
    options.toolbar.showOpenButton = false; options.toolbar.showSaveButton = false; options.toolbar.showSendEmailButton = false;
    return options;
  }, [fa]);

  const runReport = () => {
    if (fromDate > toDate) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    setLoadingReport(true); setError(''); setRows(null);
    void reportApi.cargoDetails({ StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, Plate: plate.trim(), DriverId: driverId ? Number(driverId) : null, MerchandiseId: merchandiseId ? Number(merchandiseId) : null, OriginSectionId: originSectionId ? Number(originSectionId) : null, DestinationSectionId: destinationSectionId ? Number(destinationSectionId) : null, IsNeedAttachment: withAttachments }).then((response) => setRows(normalizeCargoRows(response))).catch((reason: unknown) => { setRows(null); setError(reason instanceof Error ? reason.message : (fa ? 'دریافت گزارش حمل بار ناموفق بود.' : 'The cargo report could not be loaded.')); }).finally(() => setLoadingReport(false));
  };

  const optionSelect = (label: string, value: string, onChange: (value: string) => void, options: SelectOption[]) => <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{label}</InputLabel><Select value={value} label={label} disabled={loadingLookups} onChange={(event) => onChange(event.target.value)}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{options.map((option) => <MenuItem key={option.id} value={option.id}>{option.title}</MenuItem>)}</Select></FormControl>;
  const toolbar = <Box className="report-filter-toolbar cargo-report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    <Box className="cargo-report-plate"><IranianPlateInput label={fa ? 'پلاک' : 'Plate'} value={plate} carType={carType} onChange={setPlate} onCarTypeChange={setCarType} disabled={loadingReport} /></Box>
    {optionSelect(fa ? 'راننده' : 'Driver', driverId, setDriverId, drivers)}
    {optionSelect(fa ? 'کالا' : 'Merchandise', merchandiseId, setMerchandiseId, merchandises)}
    {optionSelect(fa ? 'مبدا' : 'Origin', originSectionId, setOriginSectionId, originSections)}
    {optionSelect(fa ? 'مقصد' : 'Destination', destinationSectionId, setDestinationSectionId, destinationSections)}
    <TextField select size="small" label={fa ? 'پیوست‌ها' : 'Attachments'} value={withAttachments ? 'yes' : 'no'} onChange={(event) => setWithAttachments(event.target.value === 'yes')}><MenuItem value="no">{fa ? 'بدون پیوست' : 'Without attachments'}</MenuItem><MenuItem value="yes">{fa ? 'با پیوست' : 'With attachments'}</MenuItem></TextField>
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport || renderingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {rows === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {rows !== null && <Box className="stimulsoft-cargo-report-viewer" sx={{ height: 'min(760px, calc(100vh - 330px))', minHeight: 520, width: '100%', overflow: 'hidden' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{fa ? `${rows.length.toLocaleString('fa-IR')} رکورد` : `${rows.length.toLocaleString('en-US')} records`}</Typography>{report && <Viewer id="cargo-report-viewer" report={report} options={viewerOptions} visible />}</Box>}
  </ManagementWorkspaceFrame>;
}
