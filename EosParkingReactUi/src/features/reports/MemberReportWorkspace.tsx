import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Viewer, Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { memberApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import memberReportTemplate from '../../assets/report-templates/MembersReport.mrt?raw';

type MemberReportState = 'all' | 'active' | 'inactive';
type Props = { title: string; pageTitle?: string; parkingId: number; language: Language; state: MemberReportState };
type RegisterKind = { id: number; title: string };
type ReportRow = Record<string, unknown>;

const dateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const recordOf = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const valueOf = (row: Record<string, unknown>, key: string) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
const textOf = (value: unknown) => value === null || value === undefined ? '' : String(value);
const boolOf = (value: unknown) => value === true || value === 1 || String(value).toLowerCase() === 'true';

function responseValues(input: unknown): unknown[] {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || 'پاسخ سرویس معتبر نیست.');
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
}

function normalizeReportRows(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    return {
      Code: textOf(valueOf(row, 'Code')),
      Name: textOf(valueOf(row, 'Name')),
      Family: textOf(valueOf(row, 'Family')),
      NationalCode: textOf(valueOf(row, 'NationalCode')),
      Address: textOf(valueOf(row, 'Address')),
      PhoneNumber: Number(valueOf(row, 'PhoneNumber') ?? 0),
      IsActive: boolOf(valueOf(row, 'IsActive')),
      CashAmount: Number(valueOf(row, 'CashAmount') ?? 0),
      Cars: valueOf(row, 'Cars') ?? [],
      MemberRegisters: valueOf(row, 'MemberRegisters') ?? [],
      MemberCards: valueOf(row, 'MemberCards') ?? [],
      ParkingId: Number(valueOf(row, 'ParkingId') ?? 0),
      Description: textOf(valueOf(row, 'Description')),
      MemberParkSpaces: valueOf(row, 'MemberParkSpaces') ?? [],
      CardNumber: textOf(valueOf(row, 'CardNumber')),
      MemberRegisterKindTitle: textOf(valueOf(row, 'MemberRegisterKindTitle')),
      Id: Number(valueOf(row, 'Id') ?? 0),
      PersistOn: valueOf(row, 'PersistOn') ?? null,
    };
  });
}

function stateLabel(state: MemberReportState, language: Language) {
  if (language === 'en') return state === 'all' ? 'All members' : state === 'active' ? 'Members with active membership' : 'Members without active membership';
  return state === 'all' ? 'همه اعضا' : state === 'active' ? 'اعضای دارای عضویت فعال' : 'اعضای فاقد عضویت فعال';
}

async function createReport(rows: ReportRow[], language: Language) {
  const licenseKey = import.meta.env.VITE_STIMULSOFT_LICENSE;
  if (licenseKey) Stimulsoft.Base.StiLicense.key = licenseKey;

  // The Windows client registers the DB/MainTable dataset before loading the
  // MRT.  MembersReport.mrt contains a DataTableSource named MainTable that
  // points to that dataset; clearing the databases after loading the MRT
  // leaves the viewer with a valid-looking report but no bound data band.
  const dataSet = new Stimulsoft.System.Data.DataSet('DB');
  dataSet.readJson(JSON.stringify({
    MainTable: rows.map((row) => ({
      Code: row.Code,
      Name: row.Name,
      Family: row.Family,
      NationalCode: row.NationalCode,
      Address: row.Address,
      PhoneNumber: row.PhoneNumber,
      IsActive: row.IsActive,
      CashAmount: row.CashAmount,
      ParkingId: row.ParkingId,
      Description: row.Description,
      CardNumber: row.CardNumber,
      MemberRegisterKindTitle: row.MemberRegisterKindTitle,
      Id: row.Id,
      PersistOn: row.PersistOn,
    })),
  }));

  const report = new Stimulsoft.Report.StiReport();
  report.regData('DB', 'DB', dataSet);
  report.dictionary.synchronize();
  report.load(memberReportTemplate);

  // The legacy MRT keeps both a BusinessObjectSource (MainTable) and the
  // actual DataTableSource (MainTable2). The Windows engine resolves that
  // legacy alias automatically; Reports.JS does not do so consistently, so
  // bind the data band and its expressions to the concrete table explicitly.
  const dataBand = report.getComponentByName('DataBand1') as { dataSourceName?: string } | null;
  if (dataBand) dataBand.dataSourceName = 'MainTable2';
  for (const componentName of ['Text1', 'Text2', 'Text5', 'Text6', 'Text7']) {
    const component = report.getComponentByName(componentName) as { text?: string } | null;
    if (component?.text) component.text = component.text.replaceAll('MainTable.', 'MainTable2.');
  }
  report.setVariable('ReportDateTime', new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'));
  await report.renderAsync2();
  return report;
}

export function MemberReportWorkspace({ title, parkingId, language, state }: Props) {
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousYear = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return dateValue(date);
  }, []);
  const [fromDate, setFromDate] = useState(previousYear);
  const [toDate, setToDate] = useState(today);
  const [kindTitle, setKindTitle] = useState('');
  const [registerKinds, setRegisterKinds] = useState<RegisterKind[]>([]);
  const [loadingKinds, setLoadingKinds] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [renderingReport, setRenderingReport] = useState(false);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState('');
  const [kindError, setKindError] = useState('');

  useEffect(() => {
    let current = true;
    setLoadingKinds(true);
    setKindError('');
    setRegisterKinds([]);
    setKindTitle('');
    void memberApi.listRegisterKinds(parkingId).then((response) => {
      if (!current) return;
      const kinds = responseValues(response).flatMap((item) => {
        const row = recordOf(item);
        const id = Number(valueOf(row, 'Id') ?? 0);
        const titleValue = textOf(valueOf(row, 'Title'));
        return id > 0 && titleValue ? [{ id, title: titleValue }] : [];
      });
      setRegisterKinds(kinds);
    }).catch((reason: unknown) => {
      if (!current) return;
      setKindError(reason instanceof Error ? reason.message : (fa ? 'دریافت انواع حق عضویت ناموفق بود.' : 'Membership types could not be loaded.'));
    }).finally(() => {
      if (current) setLoadingKinds(false);
    });
    return () => { current = false; };
  }, [parkingId, fa]);

  const [report, setReport] = useState<Stimulsoft.Report.StiReport | null>(null);
  useEffect(() => {
    let current = true;
    if (rows === null) {
      setReport(null);
      setRenderingReport(false);
      return () => { current = false; };
    }
    setReport(null);
    setRenderingReport(true);
    void createReport(rows, language).then((renderedReport) => {
      if (current) setReport(renderedReport);
    }).catch((reason: unknown) => {
      if (current) setError(reason instanceof Error ? reason.message : (fa ? 'رندر گزارش اعضا ناموفق بود.' : 'The member report could not be rendered.'));
    }).finally(() => {
      if (current) setRenderingReport(false);
    });
    return () => { current = false; };
  }, [rows, language, fa]);
  const viewerOptions = useMemo(() => {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%';
    options.height = '100%';
    options.appearance.fullScreenMode = false;
    options.appearance.rightToLeft = fa;
    options.toolbar.showOpenButton = false;
    options.toolbar.showSaveButton = false;
    options.toolbar.showSendEmailButton = false;
    return options;
  }, [fa]);

  const runReport = () => {
    if (fromDate > toDate) {
      setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.');
      return;
    }
    setLoadingReport(true);
    setError('');
    const gridFilters = [
      { ColumnName: 'ParkingId', Phrase: String(parkingId), Type: 2 },
      { ColumnName: 'MemberRegisterKindTitle', Phrase: kindTitle, Type: 1 },
    ];
    void memberApi.report({
      Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59` },
      GridFilters: gridFilters,
      SortFields: [
        { ColumnName: 'Family', Direction: 1 },
        { ColumnName: 'Name', Direction: 1 },
      ],
      PageNumber: 1,
      PageSize: 1000000,
      ReturnAllRecords: false,
    }).then((response) => {
      const receivedRows = normalizeReportRows(response);
      // The legacy endpoint applies GridFilters by converting Boolean values
      // to strings. Keep status filtering deterministic in the web client
      // after receiving the real IsActive Boolean from the response.
      const visibleRows = state === 'all'
        ? receivedRows
        : receivedRows.filter((row) => boolOf(row.IsActive) === (state === 'active'));
      setRows(visibleRows);
    }).catch((reason: unknown) => {
      setRows(null);
      setError(reason instanceof Error ? reason.message : (fa ? 'دریافت گزارش اعضا ناموفق بود.' : 'The member report could not be loaded.'));
    }).finally(() => setLoadingReport(false));
  };

  const viewerId = `member-report-viewer-${state}`;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport || renderingReport} onRefresh={runReport} toolbar={<Box className="report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تاریخ ثبت از' : 'Registered from'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تاریخ ثبت تا' : 'Registered to'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    <TextField select size="small" label={fa ? 'حق عضویت' : 'Membership type'} value={kindTitle} onChange={(event) => setKindTitle(event.target.value)} disabled={loadingKinds} sx={{ minWidth: 0 }}>
      <MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>
      {registerKinds.map((kind) => <MenuItem key={kind.id} value={kind.title}>{kind.title}</MenuItem>)}
    </TextField>
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingKinds} sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>}>
    {kindError && <Alert severity="warning" sx={{ mb: 2 }}>{kindError}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {rows === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {rows !== null && <Box className="stimulsoft-member-report-viewer" sx={{ height: 'min(760px, calc(100vh - 330px))', minHeight: 520, width: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{fa ? `${rows.length.toLocaleString('fa-IR')} رکورد` : `${rows.length.toLocaleString('en-US')} records`}</Typography>
      {report && <Viewer id={viewerId} report={report} options={viewerOptions} visible />}
    </Box>}
  </ManagementWorkspaceFrame>;
}
