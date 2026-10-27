import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Viewer, Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { memberApi, reportApi, userApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import parkingIncomeTemplate from '../../assets/report-templates/ParkingIncomingChartReport - Copy.mrt?raw';
import monthlyIncomeTemplate from '../../assets/report-templates/ParkingMonthlyIncomingChartReport.mrt?raw';
import memberCashTemplate from '../../assets/report-templates/MemberCashReport.mrt?raw';
import userCashTemplate from '../../assets/report-templates/UserCashReport.mrt?raw';
import membershipIncomeTemplate from '../../assets/report-templates/MembershipInfoIncomingDetailsReport.mrt?raw';

type FinancialReportKind = 'parking-income' | 'monthly-income' | 'member-cash' | 'user-performance' | 'membership-income';
type Props = { title: string; parkingId: number; language: Language; kind: FinancialReportKind };
type ReportRow = Record<string, unknown>;
type Member = { code: string; title: string };
type User = { id: number; title: string };
type RegisterKind = { id: number; title: string };

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

function normalizeStatistics(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    return {
      Amount: numberOf(valueOf(row, 'Amount')),
      Lable: textOf(valueOf(row, 'Lable') ?? valueOf(row, 'Label')),
      TariffTitle: textOf(valueOf(row, 'TariffTitle')),
      MemberRegisterTitle: textOf(valueOf(row, 'MemberRegisterTitle')),
      TaxValue: numberOf(valueOf(row, 'TaxValue')),
      RoundingValue: numberOf(valueOf(row, 'RoundingValue')),
      Number: numberOf(valueOf(row, 'Number')),
      ParkingTitle: textOf(valueOf(row, 'ParkingTitle')),
      SolarPersistOn: textOf(valueOf(row, 'SolarPersistOn') ?? valueOf(row, 'PersistOn')),
      PersistOn: valueOf(row, 'PersistOn') ?? null,
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

function normalizeMembership(input: unknown): ReportRow[] {
  return responseValues(input).map((item) => {
    const row = recordOf(item);
    const date = valueOf(row, 'Date');
    return {
      Code: textOf(valueOf(row, 'Code')),
      Name: textOf(valueOf(row, 'Name')),
      Family: textOf(valueOf(row, 'Family')),
      MemberRegisterKindTitle: textOf(valueOf(row, 'MemberRegisterKindTitle')),
      Amount: numberOf(valueOf(row, 'Amount')),
      Date: date,
      SolarDate: textOf(valueOf(row, 'SolarDate') ?? date),
    };
  });
}

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

async function createReport(rows: ReportRow[], kind: FinancialReportKind, language: Language, titleDescription: string) {
  const licenseKey = import.meta.env.VITE_STIMULSOFT_LICENSE;
  if (licenseKey) Stimulsoft.Base.StiLicense.key = licenseKey;
  const dataSet = new Stimulsoft.System.Data.DataSet('DB');
  dataSet.readJson(JSON.stringify({ MainTable: rows }));
  const report = new Stimulsoft.Report.StiReport();
  report.regData('DB', 'DB', dataSet);
  report.dictionary.synchronize();
  if (kind === 'parking-income') {
    report.load(parkingIncomeTemplate);
    patchLegacyTemplate(report, ['Chart2', 'Chart3', 'DataBand1', 'Text1', 'Text2', 'Text5', 'Text6', 'Text7', 'Text8', 'Text14']);
  } else if (kind === 'monthly-income') {
    report.load(monthlyIncomeTemplate);
    patchLegacyTemplate(report, ['Chart2', 'DataBand1', 'Text8']);
  } else if (kind === 'member-cash') {
    report.load(memberCashTemplate);
    patchLegacyTemplate(report, ['DataBand1', 'Text1', 'Text2', 'Text5', 'Text6', 'Text7', 'Text14', 'Text15', 'Text16', 'Text17', 'Text19']);
  } else if (kind === 'user-performance') {
    report.load(userCashTemplate);
    patchLegacyTemplate(report, ['DataBand1', 'Text1', 'Text2', 'Text5', 'Text6', 'Text15', 'Text19']);
  } else {
    report.load(membershipIncomeTemplate);
    patchLegacyTemplate(report, ['GroupHeaderBand1', 'DataBand1', 'Text1', 'Text2', 'Text5', 'Text6', 'Text7', 'Text8', 'Text9', 'Text10', 'Text12', 'Text15', 'Text16', 'Text17', 'Text20', 'Text22']);
    report.setVariable('TitleDescription', titleDescription);
  }
  report.setVariable('ReportDateTime', new Date().toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'));
  await report.renderAsync2();
  return report;
}

export function FinancialReportWorkspace({ title, parkingId, language, kind }: Props) {
  const fa = language === 'fa';
  const today = useMemo(() => dateValue(new Date()), []);
  const previousMonth = useMemo(() => { const date = new Date(); date.setMonth(date.getMonth() - 1); return dateValue(date); }, []);
  const [fromDate, setFromDate] = useState(previousMonth);
  const [toDate, setToDate] = useState(today);
  const [memberCode, setMemberCode] = useState('');
  const [memberRegisterKindId, setMemberRegisterKindId] = useState('');
  const [userId, setUserId] = useState('0');
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [registerKinds, setRegisterKinds] = useState<RegisterKind[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [renderingReport, setRenderingReport] = useState(false);
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [report, setReport] = useState<Stimulsoft.Report.StiReport | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    const needsMembers = kind === 'member-cash' || kind === 'membership-income';
    const needsUsers = kind === 'user-performance';
    const needsKinds = kind === 'membership-income';
    if (!needsMembers && !needsUsers) { setMembers([]); setUsers([]); setRegisterKinds([]); return () => { current = false; }; }
    setLoadingLookups(true);
    setError('');
    const tasks: Array<Promise<void>> = [];
    if (needsMembers) tasks.push(memberApi.list(parkingId).then((response) => {
      if (!current) return;
      setMembers(responseValues(response).flatMap((item) => { const row = recordOf(item); const code = textOf(valueOf(row, 'Code')); const name = `${textOf(valueOf(row, 'Name'))} ${textOf(valueOf(row, 'Family'))}`.trim(); return code ? [{ code, title: `${code} - ${name}` }] : []; }));
    }));
    if (needsKinds) tasks.push(memberApi.listRegisterKinds(parkingId).then((response) => {
      if (!current) return;
      setRegisterKinds(responseValues(response).flatMap((item) => { const row = recordOf(item); const id = numberOf(valueOf(row, 'Id')); const titleValue = textOf(valueOf(row, 'Title')); return id > 0 && titleValue ? [{ id, title: titleValue }] : []; }));
    }));
    if (needsUsers) tasks.push(userApi.list().then((response) => {
      if (!current) return;
      setUsers(responseValues(response).flatMap((item) => { const row = recordOf(item); const id = numberOf(valueOf(row, 'Id')); const titleValue = textOf(valueOf(row, 'UserName')); return id > 0 && titleValue ? [{ id, title: titleValue }] : []; }));
    }));
    void Promise.all(tasks).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'دریافت فهرست فیلترها ناموفق بود.' : 'Report filters could not be loaded.')); }).finally(() => { if (current) setLoadingLookups(false); });
    return () => { current = false; };
  }, [kind, parkingId, fa]);

  const titleDescription = useMemo(() => fa ? `از تاریخ ${fromDate} تا تاریخ ${toDate}` : `From ${fromDate} to ${toDate}`, [fromDate, toDate, fa]);
  useEffect(() => {
    let current = true;
    if (rows === null) { setReport(null); setRenderingReport(false); return () => { current = false; }; }
    setReport(null); setRenderingReport(true);
    void createReport(rows, kind, language, titleDescription).then((renderedReport) => { if (current) setReport(renderedReport); }).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : (fa ? 'رندر گزارش مالی ناموفق بود.' : 'The financial report could not be rendered.')); }).finally(() => { if (current) setRenderingReport(false); });
    return () => { current = false; };
  }, [rows, kind, language, titleDescription, fa]);

  const viewerOptions = useMemo(() => {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%'; options.height = '100%'; options.appearance.fullScreenMode = false; options.appearance.rightToLeft = fa;
    options.toolbar.showOpenButton = false; options.toolbar.showSaveButton = false; options.toolbar.showSendEmailButton = false;
    return options;
  }, [fa]);

  const runReport = () => {
    if (fromDate > toDate) { setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.'); return; }
    if (kind === 'member-cash' && !memberCode) { setError(fa ? 'برای گزارش گردش مالی، یک عضو انتخاب کنید.' : 'Select a member for the member cash report.'); return; }
    setLoadingReport(true); setError(''); setRows(null);
    const statisticPage = { Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, ParkingIds: [parkingId], DoorIds: [], SolarYears: [] }, GridFilters: [], PageNumber: 1, PageSize: 1000000 };
    let request: Promise<unknown>;
    if (kind === 'parking-income') request = reportApi.parkingDailyIncome(statisticPage);
    else if (kind === 'monthly-income') request = reportApi.parkingMonthlyIncome(statisticPage);
    else if (kind === 'member-cash') request = reportApi.memberCash({ Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, ParkingId: parkingId, MemberCode: memberCode }, GridFilters: [], PageNumber: 1, PageSize: 1000000 });
    else if (kind === 'user-performance') request = reportApi.userActivity(fromDate, toDate, Number(userId));
    else request = reportApi.membershipIncome({ StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59`, ParkingId: parkingId, MemberCode: memberCode, MemberRegisterKindId: Number(memberRegisterKindId || 0) });
    void request.then((response) => setRows(kind === 'parking-income' || kind === 'monthly-income' ? normalizeStatistics(response) : kind === 'membership-income' ? normalizeMembership(response) : normalizeCash(response))).catch((reason: unknown) => { setRows(null); setError(reason instanceof Error ? reason.message : (fa ? 'دریافت گزارش مالی ناموفق بود.' : 'The financial report could not be loaded.')); }).finally(() => setLoadingReport(false));
  };

  const toolbar = <Box className="report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'از تاریخ' : 'From date'} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={fa ? 'تا تاریخ' : 'To date'} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    {kind === 'member-cash' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'عضو' : 'Member'}</InputLabel><Select value={memberCode} label={fa ? 'عضو' : 'Member'} disabled={loadingLookups} onChange={(event) => setMemberCode(event.target.value)}><MenuItem value="">{fa ? 'انتخاب عضو' : 'Select member'}</MenuItem>{members.map((member) => <MenuItem key={member.code} value={member.code}>{member.title}</MenuItem>)}</Select></FormControl>}
    {kind === 'membership-income' && <><TextField size="small" label={fa ? 'کد عضو' : 'Member code'} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} sx={{ minWidth: 0 }} /><FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'نوع حق عضویت' : 'Membership type'}</InputLabel><Select value={memberRegisterKindId} label={fa ? 'نوع حق عضویت' : 'Membership type'} disabled={loadingLookups} onChange={(event) => setMemberRegisterKindId(event.target.value)}><MenuItem value="">{fa ? 'همه' : 'All'}</MenuItem>{registerKinds.map((item) => <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)}</Select></FormControl></>}
    {kind === 'user-performance' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{fa ? 'کاربر' : 'User'}</InputLabel><Select value={userId} label={fa ? 'کاربر' : 'User'} disabled={loadingLookups} onChange={(event) => setUserId(event.target.value)}><MenuItem value="0">{fa ? 'کاربر جاری' : 'Current user'}</MenuItem>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.title}</MenuItem>)}</Select></FormControl>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups} sx={{ minHeight: 40 }}>{fa ? 'نمایش گزارش' : 'Show report'}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport || renderingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {rows === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {rows !== null && <Box className="stimulsoft-financial-report-viewer" sx={{ height: 'min(760px, calc(100vh - 330px))', minHeight: 520, width: '100%', overflow: 'hidden' }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{fa ? `${rows.length.toLocaleString('fa-IR')} رکورد` : `${rows.length.toLocaleString('en-US')} records`}</Typography>{report && <Viewer id={`financial-report-viewer-${kind}`} report={report} options={viewerOptions} visible />}</Box>}
  </ManagementWorkspaceFrame>;
}
