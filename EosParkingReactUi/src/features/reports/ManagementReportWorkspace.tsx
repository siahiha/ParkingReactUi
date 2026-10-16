import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControl, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Viewer, Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { parkingApi, reportApi, userApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { IranianPlateInput } from '../../components/IranianPlateInput';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import monthlyIncomeTemplate from '../../../../EosParkingTools/EosControls/ReportDesign/ParkingMonthlyIncomingChartReport.mrt?raw';
import yearlyIncomeTemplate from '../../../../EosParkingTools/EosControls/ReportDesign/ParkingYearlyComparIncomingChartReport.mrt?raw';
import freeParkingIncomeTemplate from '../../../../EosParkingTools/EosControls/ReportDesign/TrafficIncomingDetailsReport.mrt?raw';

type ManagementReportKind = 'monthly-income-comparison' | 'income-comparison' | 'yearly-income-comparison' | 'user-performance' | 'free-parking-income';
type Props = { title: string; language: Language; kind: ManagementReportKind };
type ReportRow = Record<string, unknown>;
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
const boolOf = (value: unknown) => value === true || value === 1 || String(value).toLowerCase() === 'true';

function responseValues(input: unknown): unknown[] {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || 'پاسخ سرویس معتبر نیست.');
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
}

function normalizeStatistics(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    const persistOn = valueOf(row, 'PersistOn');
    return {
      Amount: numberOf(valueOf(row, 'Amount')),
      Lable: textOf(valueOf(row, 'Lable') ?? valueOf(row, 'Label')),
      TariffTitle: textOf(valueOf(row, 'TariffTitle')),
      MemberRegisterTitle: textOf(valueOf(row, 'MemberRegisterTitle')),
      TaxValue: numberOf(valueOf(row, 'TaxValue')),
      RoundingValue: numberOf(valueOf(row, 'RoundingValue')),
      Number: numberOf(valueOf(row, 'Number')),
      ParkingTitle: textOf(valueOf(row, 'ParkingTitle')),
      SolarPersistOn: textOf(valueOf(row, 'SolarPersistOn') ?? persistOn),
      PersistOn: persistOn ?? null,
    };
  });
}

function normalizeCash(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    const cashDateTime = valueOf(row, 'CashDateTime');
    return {
      MemberName: textOf(valueOf(row, 'MemberName')),
      MemberCode: textOf(valueOf(row, 'MemberCode')),
      Plate: textOf(valueOf(row, 'Plate')),
      Title: textOf(valueOf(row, 'Title')),
      CashDateTime: cashDateTime,
      SolarCashDateTime: textOf(valueOf(row, 'SolarCashDateTime') ?? cashDateTime),
      Amount: numberOf(valueOf(row, 'Amount')),
      CashType: numberOf(valueOf(row, 'CashType')),
      Description: textOf(valueOf(row, 'Description')),
    };
  });
}

function normalizeFreeParkingIncome(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    const enterDateTime = valueOf(row, 'EnterDateTime');
    const exitDateTime = valueOf(row, 'ExitDateTime');
    return {
      MemberCode: textOf(valueOf(row, 'MemberCode')),
      CarPlate: textOf(valueOf(row, 'CarPlate')),
      AbsolutCarPlate: textOf(valueOf(row, 'AbsolutCarPlate') ?? valueOf(row, 'CarPlate')),
      CardNumber: textOf(valueOf(row, 'CardNumber')),
      CarType: numberOf(valueOf(row, 'CarType')),
      CarTypeTitle: textOf(valueOf(row, 'CarTypeTitle') ?? valueOf(row, 'CarType')),
      FormatedDuration: textOf(valueOf(row, 'FormatedDuration')),
      SolarEnterDateTime: textOf(valueOf(row, 'SolarEnterDateTime') ?? enterDateTime),
      SolarExitDateTime: textOf(valueOf(row, 'SolarExitDateTime') ?? exitDateTime),
      TotalCost: numberOf(valueOf(row, 'TotalCost')),
      CommonCost: numberOf(valueOf(row, 'CommonCost')),
      TaxValue: numberOf(valueOf(row, 'TaxValue')),
      Date: valueOf(row, 'Date') ?? exitDateTime ?? enterDateTime,
      SolarDate: textOf(valueOf(row, 'SolarDate') ?? valueOf(row, 'Date') ?? exitDateTime ?? enterDateTime),
      EnterDoorTitle: textOf(valueOf(row, 'EnterDoorTitle')),
      ExitDoorTitle: textOf(valueOf(row, 'ExitDoorTitle')),
    };
  });
}

function currentPersianYear() {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', timeZone: 'UTC' }).formatToParts(new Date());
  return Number(parts.find((part) => part.type === 'year')?.value ?? new Date().getFullYear() - 621);
}

function persianDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).formatToParts(date);
  return { year: Number(parts.find((part) => part.type === 'year')?.value), month: Number(parts.find((part) => part.type === 'month')?.value), day: Number(parts.find((part) => part.type === 'day')?.value) };
}

function persianYearStart(year: number) {
  const candidate = new Date(Date.UTC(year - 621, 2, 19));
  for (let index = 0; index < 370; index += 1) {
    const date = new Date(candidate);
    date.setUTCDate(candidate.getUTCDate() + index);
    const parts = persianDateParts(date);
    if (parts.year === year && parts.month === 1 && parts.day === 1) return date;
  }
  return candidate;
}

const isoDate = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
const yearDateRange = (years: number[]) => {
  const sorted = [...years].sort((left, right) => left - right);
  const start = persianYearStart(sorted[0]);
  const end = new Date(persianYearStart(sorted[sorted.length - 1] + 1));
  end.setUTCSeconds(end.getUTCSeconds() - 1);
  return { start: `${isoDate(start)}T00:00:00`, end: `${isoDate(end)}T23:59:59` };
};

function patchLegacyTemplate(report: Stimulsoft.Report.StiReport, componentNames: string[]) {
  let sourceName = 'MainTable';
  try {
    if (report.dictionary.dataSources.getByName('MainTable2')) sourceName = 'MainTable2';
  } catch {
    sourceName = 'MainTable';
  }
  const dataBand = report.getComponentByName('DataBand1') as { dataSourceName?: string } | null;
  if (dataBand) dataBand.dataSourceName = sourceName;
  for (const componentName of componentNames) {
    const component = report.getComponentByName(componentName) as unknown as Record<string, unknown> | null;
    if (!component) continue;
    for (const property of ['text', 'condition', 'beforePrintEvent', 'dataColumn', 'argumentDataColumn', 'valueDataColumn']) {
      const current = component[property];
      if (typeof current === 'string' && sourceName === 'MainTable2') component[property] = current.replace(/MainTable\.(?!2\.)/g, 'MainTable2.');
    }
  }
}

async function createReport(rows: ReportRow[], kind: ManagementReportKind, language: Language, titleDescription: string) {
  const licenseKey = import.meta.env.VITE_STIMULSOFT_LICENSE;
  if (licenseKey) Stimulsoft.Base.StiLicense.key = licenseKey;
  const dataSet = new Stimulsoft.System.Data.DataSet('DB');
  dataSet.readJson(JSON.stringify({ MainTable: rows }));
  const report = new Stimulsoft.Report.StiReport();
  report.regData('DB', 'DB', dataSet);
  report.dictionary.synchronize();
  if (kind === 'free-parking-income') {
    report.load(freeParkingIncomeTemplate);
    patchLegacyTemplate(report, ['GroupHeaderBand1', 'DataBand1', 'Text1', 'Text2', 'Text5', 'Text6', 'Text8', 'Text9', 'Text10', 'Text11', 'Text12', 'Text14', 'Text15', 'Text17', 'Text19', 'Text20', 'Text21', 'Text22', 'Text23', 'Text24', 'Text25', 'Text26', 'Text27', 'Text28', 'Text29', 'Text30', 'Text31', 'Text32', 'Text33', 'Text34', 'Text35']);
    const carTypeText = report.getComponentByName('Text21') as { text?: string } | null;
    if (carTypeText?.text) carTypeText.text = carTypeText.text.replace('GetDescriptionCarType(MainTable2.CarType)', 'MainTable2.CarTypeTitle');
    report.setVariable('TitleDescription', titleDescription);
  } else {
    report.load(kind === 'yearly-income-comparison' ? yearlyIncomeTemplate : monthlyIncomeTemplate);
    patchLegacyTemplate(report, kind === 'yearly-income-comparison' ? ['Chart2', 'DataBand1', 'Text8'] : ['Chart2', 'DataBand1', 'Text8']);
  }
  report.setVariable('ReportDateTime', new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'));
  await report.renderAsync2();
  return report;
}

const carTypes = [
  { value: 0, fa: 'سواری و وانت', en: 'Car and pickup' },
  { value: 1, fa: 'موتورسیکلت', en: 'Motorcycle' },
  { value: 2, fa: 'ون و مینی‌بوس', en: 'Van and minibus' },
  { value: 3, fa: 'اتوبوس و کامیون', en: 'Bus and truck' },
  { value: 4, fa: 'تریلی', en: 'Trailer' },
];

export function ManagementReportWorkspace({ title, language, kind }: Props) {
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
  const [loadingReport, setLoadingReport] = useState(false);
  const [renderingReport, setRenderingReport] = useState(false);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [report, setReport] = useState<Stimulsoft.Report.StiReport | null>(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    let current = true;
    if (rows === null) { setReport(null); setRenderingReport(false); return () => { current = false; }; }
    setReport(null); setRenderingReport(true);
    void createReport(rows, kind, language, fa ? `از تاریخ ${fromDate} تا تاریخ ${toDate}` : `From ${fromDate} to ${toDate}`).then((renderedReport) => { if (current) setReport(renderedReport); }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'رندر گزارش مدیریتی ناموفق بود.' : 'The management report could not be rendered.')); }).finally(() => { if (current) setRenderingReport(false); });
    return () => { current = false; };
  }, [rows, kind, language, fromDate, toDate, fa]);

  const viewerOptions = useMemo(() => {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%'; options.height = '100%'; options.appearance.fullScreenMode = false; options.appearance.rightToLeft = fa;
    options.toolbar.showOpenButton = false; options.toolbar.showSaveButton = false; options.toolbar.showSendEmailButton = false;
    return options;
  }, [fa]);

  const runReport = () => {
    if (isIncome && selectedParkingIds.length === 0) { setError(fa ? 'حداقل یک پارکینگ را انتخاب کنید.' : 'Select at least one parking.'); return; }
    if (kind === 'free-parking-income' && selectedParkingIds.length === 0) { setError(fa ? 'هیچ پارکینگی انتخاب نشده است.' : 'No parking was selected.'); return; }
    if (fromDate > toDate && (kind === 'user-performance' || kind === 'free-parking-income')) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    if (isIncome && selectedYears.length === 0) { setError(fa ? 'حداقل یک سال را انتخاب کنید.' : 'Select at least one year.'); return; }
    setLoadingReport(true); setError(''); setRows(null);
    let request: Promise<unknown>;
    if (kind === 'monthly-income-comparison') {
      const range = yearDateRange(selectedYears);
      request = reportApi.parkingMonthlyIncome({ Filters: { StartDateTime: range.start, EndDateTime: range.end, ParkingIds: selectedParkingIds, DoorIds: [], SolarYears: selectedYears }, GridFilters: [], PageNumber: 1, PageSize: 1000000 });
    } else if (kind === 'income-comparison' || kind === 'yearly-income-comparison') {
      const range = yearDateRange(selectedYears);
      request = reportApi.parkingYearlyIncome({ Filters: { StartDateTime: range.start, EndDateTime: range.end, ParkingIds: selectedParkingIds, DoorIds: [], SolarYears: selectedYears }, GridFilters: [], PageNumber: 1, PageSize: 1000000 });
    } else if (kind === 'user-performance') {
      request = reportApi.userActivity(fromDate, toDate, Number(userId));
    } else {
      request = reportApi.freeParkingIncome({ Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, ListParkingId: selectedParkingIds, MemberCode: memberCode.trim(), Plate: plate.trim(), WithImage: false, OnlyPresence: false, CarType: carType === '' ? null : Number(carType) }, GridFilters: [], PageNumber: 1, PageSize: 1000000 });
    }
    void request.then((response) => setRows(isIncome ? normalizeStatistics(response) : kind === 'user-performance' ? normalizeCash(response) : normalizeFreeParkingIncome(response))).catch((reason: unknown) => { setRows(null); setError(reason instanceof Error ? reason.message : (fa ? 'دریافت گزارش مدیریتی ناموفق بود.' : 'The management report could not be loaded.')); }).finally(() => setLoadingReport(false));
  };

  const parkingSummary = selectedParkingIds.map((id) => parkingOptions.find((item) => item.id === id)?.title).filter(Boolean).join('، ') || (fa ? 'هیچ‌کدام' : 'None');
  const yearSummary = selectedYears.join('، ');
  const yearOptions = Array.from({ length: 21 }, (_, index) => currentPersianYear() - index);
  const toolbar = <Box className="report-filter-toolbar management-report-filter-toolbar">
    {needsParkingSelection && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'پارکینگ‌ها' : 'Parkings'}</InputLabel><Select multiple value={selectedParkingIds} label={fa ? 'پارکینگ‌ها' : 'Parkings'} disabled={loadingLookups} onChange={(event) => setSelectedParkingIds(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={() => parkingSummary}>{parkingOptions.map((item) => <MenuItem key={item.id} value={item.id}><Checkbox checked={selectedParkingIds.includes(item.id)} /><ListItemText primary={item.title} /></MenuItem>)}</Select></FormControl>}
    {kind === 'monthly-income-comparison' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'سال' : 'Year'}</InputLabel><Select value={selectedYears[0] ?? ''} label={fa ? 'سال' : 'Year'} onChange={(event) => setSelectedYears([Number(event.target.value)])}>{yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</Select></FormControl>}
    {(kind === 'income-comparison' || kind === 'yearly-income-comparison') && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'سال‌ها' : 'Years'}</InputLabel><Select multiple value={selectedYears} label={fa ? 'سال‌ها' : 'Years'} onChange={(event) => setSelectedYears(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={() => yearSummary}>{yearOptions.map((year) => <MenuItem key={year} value={year}><Checkbox checked={selectedYears.includes(year)} /><ListItemText primary={year} /></MenuItem>)}</Select></FormControl>}
    {(kind === 'user-performance' || kind === 'free-parking-income') && <><Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box><Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box></>}
    {kind === 'user-performance' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'کاربر' : 'User'}</InputLabel><Select value={userId} label={fa ? 'کاربر' : 'User'} disabled={loadingLookups} onChange={(event) => setUserId(event.target.value)}><MenuItem value="0">{fa ? 'همه کاربران' : 'All users'}</MenuItem>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.title}</MenuItem>)}</Select></FormControl>}
    {kind === 'free-parking-income' && <><TextField size="small" label={fa ? 'کد عضو' : 'Member code'} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} /><Box className="management-report-plate"><IranianPlateInput label={fa ? 'پلاک' : 'Plate'} value={plate} carType={plateCarType} onChange={setPlate} onCarTypeChange={setPlateCarType} disabled={loadingReport} /></Box><TextField select size="small" label={fa ? 'نوع خودرو' : 'Vehicle type'} value={carType} onChange={(event) => setCarType(event.target.value)}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{carTypes.map((item) => <MenuItem key={item.value} value={item.value}>{fa ? item.fa : item.en}</MenuItem>)}</TextField></>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups} sx={{ minHeight: 40 }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport || renderingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {rows === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {rows !== null && <Box className="stimulsoft-management-report-viewer" sx={{ height: 'min(760px, calc(100vh - 330px))', minHeight: 520, width: '100%', overflow: 'hidden' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{fa ? `${rows.length.toLocaleString('fa-IR')} رکورد` : `${rows.length.toLocaleString('en-US')} records`}</Typography>{report && <Viewer id={`management-report-viewer-${kind}`} report={report} options={viewerOptions} visible />}</Box>}
  </ManagementWorkspaceFrame>;
}
