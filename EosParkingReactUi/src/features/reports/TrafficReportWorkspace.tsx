import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Viewer, Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { parkingApi, reportApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import trafficReportTemplate from '../../assets/report-templates/TrafficReport.mrt?raw';
import trafficWithImageTemplate from '../../assets/report-templates/TrafficWithImageReport.mrt?raw';
import trafficStatisticTemplate from '../../assets/report-templates/TrafficStatisticChartReport.mrt?raw';
import totalHourParkingTemplate from '../../assets/report-templates/TotalHourParkingReport.mrt?raw';

type TrafficReportKind = 'details' | 'daily' | 'average';
type Props = { title: string; parkingId: number; language: Language; kind: TrafficReportKind };
type ReportRow = Record<string, unknown>;
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

function normalizeVehicleRows(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    const enterDateTime = valueOf(row, 'EnterDateTime');
    const exitDateTime = valueOf(row, 'ExitDateTime');
    return {
      MemberCode: textOf(valueOf(row, 'MemberCode')),
      CarPlate: textOf(valueOf(row, 'CarPlate')),
      CardNumber: textOf(valueOf(row, 'CardNumber')),
      CarType: numberOf(valueOf(row, 'CarType')),
      CarTypeTitle: textOf(valueOf(row, 'CarTypeTitle') ?? valueOf(row, 'CarType')),
      FormatedDuration: textOf(valueOf(row, 'FormatedDuration')),
      SolarEnterDateTime: textOf(valueOf(row, 'SolarEnterDateTime') ?? enterDateTime),
      SolarExitDateTime: textOf(valueOf(row, 'SolarExitDateTime') ?? exitDateTime),
      TotalCost: numberOf(valueOf(row, 'TotalCost')),
      CommonCost: numberOf(valueOf(row, 'CommonCost')),
      TaxValue: numberOf(valueOf(row, 'TaxValue')),
      Date: valueOf(row, 'Date') ?? enterDateTime,
      SolarDate: textOf(valueOf(row, 'SolarDate')),
      EnterImage: valueOf(row, 'EnterImage') ?? null,
    };
  });
}

function normalizeDailyRows(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    return {
      Lable: textOf(valueOf(row, 'Lable')),
      Number: numberOf(valueOf(row, 'Number')),
      SolarPersistOn: textOf(valueOf(row, 'SolarPersistOn') ?? valueOf(row, 'PersistOn')),
      PersistOn: valueOf(row, 'PersistOn') ?? null,
    };
  });
}

function normalizeAverageRows(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    return {
      TotalParkSpaces: numberOf(valueOf(row, 'TotalParkSpaces')),
      OccupiedCount: numberOf(valueOf(row, 'OccupiedCount')),
      TotalHourlyPark: numberOf(valueOf(row, 'TotalHourlyPark')),
      TotalParkCount: numberOf(valueOf(row, 'TotalParkCount')),
      TotalExitOnPark: numberOf(valueOf(row, 'TotalExitOnPark')),
      Distance: numberOf(valueOf(row, 'Distance')),
      ParkspaceOccupancyPercentage: numberOf(valueOf(row, 'ParkspaceOccupancyPercentage')),
      ParkspaceOccupancyAverage: numberOf(valueOf(row, 'ParkspaceOccupancyAverage')),
      ParkspaceRotationRatio: numberOf(valueOf(row, 'ParkspaceRotationRatio')),
      SolarPersistOn: textOf(valueOf(row, 'SolarPersistOn') ?? valueOf(row, 'Label')),
      ParkingTitle: textOf(valueOf(row, 'ParkingTitle')),
      ParkingId: numberOf(valueOf(row, 'ParkingId')),
    };
  });
}

function patchLegacyTemplate(report: Stimulsoft.Report.StiReport, componentNames: string[]) {
  const dataBand = report.getComponentByName('DataBand1') as { dataSourceName?: string } | null;
  if (dataBand) dataBand.dataSourceName = 'MainTable2';
  for (const componentName of componentNames) {
    const component = report.getComponentByName(componentName) as unknown as Record<string, unknown> | null;
    if (!component) continue;
    for (const property of ['text', 'condition', 'beforePrintEvent', 'dataColumn']) {
      const current = component[property];
      if (typeof current === 'string') component[property] = current.replaceAll('MainTable.', 'MainTable2.');
    }
  }
}

async function createReport(rows: ReportRow[], kind: TrafficReportKind, language: Language, withImage: boolean) {
  const licenseKey = import.meta.env.VITE_STIMULSOFT_LICENSE;
  if (licenseKey) Stimulsoft.Base.StiLicense.key = licenseKey;

  const dataSet = new Stimulsoft.System.Data.DataSet('DB');
  dataSet.readJson(JSON.stringify({ MainTable: rows }));
  const report = new Stimulsoft.Report.StiReport();
  report.regData('DB', 'DB', dataSet);
  report.dictionary.synchronize();

  if (kind === 'details') {
    report.load(withImage ? trafficWithImageTemplate : trafficReportTemplate);
    patchLegacyTemplate(report, withImage
      ? ['Text1', 'Text2', 'Text5', 'Text15', 'Text17', 'Text19', 'Text22', 'Text23', 'Text6']
      : ['Text1', 'Text2', 'Text5', 'Text15', 'Text17', 'Text19', 'Text20', 'Text21', 'Text6']);
    for (const componentName of withImage ? ['Text23'] : ['Text21']) {
      const component = report.getComponentByName(componentName) as { text?: string } | null;
      if (component?.text) component.text = component.text.replace('GetDescriptionCarType(MainTable2.CarType)', 'MainTable2.CarTypeTitle');
    }
  } else if (kind === 'daily') {
    report.load(trafficStatisticTemplate);
    patchLegacyTemplate(report, ['GroupHeaderBand1', 'DataBand1', 'Text1', 'Text2']);
  } else {
    report.load(totalHourParkingTemplate);
    patchLegacyTemplate(report, ['Text1', 'Text2', 'Text5', 'Text6', 'Text7', 'Text15', 'Text17']);
  }

  report.setVariable('ReportDateTime', new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'));
  await report.renderAsync2();
  return report;
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
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousMonth = useMemo(() => { const date = new Date(); date.setMonth(date.getMonth() - 1); return dateValue(date); }, []);
  const [fromDate, setFromDate] = useState(previousMonth);
  const [toDate, setToDate] = useState(today);
  const [plate, setPlate] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [carType, setCarType] = useState('');
  const [onlyPresence, setOnlyPresence] = useState(false);
  const [withImage, setWithImage] = useState(false);
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoorIds, setSelectedDoorIds] = useState<number[]>([]);
  const [loadingDoors, setLoadingDoors] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [renderingReport, setRenderingReport] = useState(false);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [report, setReport] = useState<Stimulsoft.Report.StiReport | null>(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    let current = true;
    if (rows === null) { setReport(null); setRenderingReport(false); return () => { current = false; }; }
    setReport(null);
    setRenderingReport(true);
    void createReport(rows, kind, language, withImage).then((renderedReport) => { if (current) setReport(renderedReport); }).catch((reason: unknown) => {
      if (current) setError(reason instanceof Error ? reason.message : (fa ? 'رندر گزارش تردد ناموفق بود.' : 'The traffic report could not be rendered.'));
    }).finally(() => { if (current) setRenderingReport(false); });
    return () => { current = false; };
  }, [rows, kind, language, withImage, fa]);

  const viewerOptions = useMemo(() => {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%'; options.height = '100%'; options.appearance.fullScreenMode = false; options.appearance.rightToLeft = fa;
    options.toolbar.showOpenButton = false; options.toolbar.showSaveButton = false; options.toolbar.showSendEmailButton = false;
    return options;
  }, [fa]);

  const runReport = () => {
    if (fromDate > toDate) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    setLoadingReport(true); setError(''); setRows(null);
    const page = { Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, ParkingId: parkingId, Plate: plate.trim(), MemberCode: memberCode.trim(), WithImage: withImage, OnlyPresence: onlyPresence, CarType: carType === '' ? null : Number(carType), ParkingIds: [parkingId], DoorIds: selectedDoorIds }, PageNumber: 1, PageSize: 1000000, GridFilters: [] };
    const request = kind === 'details'
      ? reportApi.vehicleTraffic(page)
      : kind === 'daily'
        ? reportApi.dailyDoorTraffic(page)
        : reportApi.occupiedParking(parkingId, fromDate, toDate);
    void request.then((response) => setRows(kind === 'details' ? normalizeVehicleRows(response) : kind === 'daily' ? normalizeDailyRows(response) : normalizeAverageRows(response))).catch((reason: unknown) => {
      setRows(null); setError(reason instanceof Error ? reason.message : (fa ? 'دریافت گزارش تردد ناموفق بود.' : 'The traffic report could not be loaded.'));
    }).finally(() => setLoadingReport(false));
  };

  const toolbar = <Box className="report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    {kind === 'details' && <>
      <TextField size="small" label={fa ? 'پلاک' : 'Plate'} value={plate} onChange={(event) => setPlate(event.target.value)} sx={{ minWidth: 0 }} />
      <TextField size="small" label={fa ? 'کد عضو' : 'Member code'} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} sx={{ minWidth: 0 }} />
      <TextField select size="small" label={fa ? 'نوع خودرو' : 'Vehicle type'} value={carType} onChange={(event) => setCarType(event.target.value)} sx={{ minWidth: 0 }}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{carTypes.map((item) => <MenuItem key={item.value} value={item.value}>{fa ? item.fa : item.en}</MenuItem>)}</TextField>
      <FormControlLabel control={<Checkbox checked={onlyPresence} onChange={(event) => setOnlyPresence(event.target.checked)} />} label={fa ? 'فقط حاضرین' : 'Only present'} />
      <FormControlLabel control={<Checkbox checked={withImage} onChange={(event) => setWithImage(event.target.checked)} />} label={fa ? 'با تصویر' : 'With image'} />
    </>}
    {kind === 'daily' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'درب‌ها' : 'Doors'}</InputLabel><Select multiple value={selectedDoorIds} label={fa ? 'درب‌ها' : 'Doors'} disabled={loadingDoors} onChange={(event) => setSelectedDoorIds(typeof event.target.value === 'string' ? event.target.value.split(',').map(Number) : event.target.value as number[])} renderValue={(selected) => (selected as number[]).map((id) => doors.find((door) => door.id === id)?.title).filter(Boolean).join('، ') || (fa ? 'هیچ‌کدام' : 'None')}>{doors.map((door) => <MenuItem key={door.id} value={door.id}><Checkbox checked={selectedDoorIds.includes(door.id)} /><ListItemText primary={door.title} /></MenuItem>)}</Select></FormControl>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingDoors} sx={{ minHeight: 40 }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport || renderingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {rows === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {rows !== null && <Box className="stimulsoft-traffic-report-viewer" sx={{ height: 'min(760px, calc(100vh - 330px))', minHeight: 520, width: '100%', overflow: 'hidden' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{fa ? `${rows.length.toLocaleString('fa-IR')} رکورد` : `${rows.length.toLocaleString('en-US')} records`}</Typography>{report && <Viewer id={`traffic-report-viewer-${kind}`} report={report} options={viewerOptions} visible />}</Box>}
  </ManagementWorkspaceFrame>;
}
