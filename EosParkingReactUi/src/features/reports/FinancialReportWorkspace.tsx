import { ReportPreview } from './ReportPreview';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { usePreparedReport } from './usePreparedReport';
import { memberApi, userApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';
import i18n from '../../i18n/instance';

type FinancialReportKind = 'parking-income' | 'monthly-income' | 'member-cash' | 'user-performance' | 'membership-income';
type Props = { title: string; parkingId: number; language: Language; kind: FinancialReportKind };
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
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || i18n.t('financialReport.responseError'));
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
}

export function FinancialReportWorkspace({ title, parkingId, language, kind }: Props) {
  const fa = language === 'fa';
  const text = i18n.getFixedT(language);
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
  const { report, loadingReport, error, setError, run } = usePreparedReport(`${parkingId}:${kind}`, language);

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
    void Promise.all(tasks).catch((reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : text('financialReport.lookupError')); }).finally(() => { if (current) setLoadingLookups(false); });
    return () => { current = false; };
  }, [kind, parkingId, fa]);



  const runReport = () => {
    if (fromDate > toDate) { setError(text('financialReport.dateError')); return; }
    if (kind === 'member-cash' && !memberCode) { setError(text('financialReport.memberRequired')); return; }
    const dates = { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59` };
    const statisticPage = { Filters: { ...dates, ParkingIds: [parkingId], DoorIds: [], SolarYears: [] } };
    const parameters = kind === 'parking-income' || kind === 'monthly-income' ? statisticPage
      : kind === 'member-cash' ? { Filters: { ...dates, ParkingId: parkingId, MemberCode: memberCode } }
      : kind === 'user-performance' ? { ...dates, UserId: Number(userId) }
      : { ...dates, ParkingId: parkingId, MemberCode: memberCode, MemberRegisterKindId: Number(memberRegisterKindId || 0) };
    run(kind, parameters);
  };

  const toolbar = <Box className="report-filter-toolbar">
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={text('financialReport.from')} value={fromDate} onChange={setFromDate} language={language} dateOnly size="small" /></Box>
    <Box sx={{ minWidth: 0 }}><EosDateTimePicker label={text('financialReport.to')} value={toDate} onChange={setToDate} language={language} dateOnly size="small" /></Box>
    {kind === 'member-cash' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{text('financialReport.member')}</InputLabel><Select value={memberCode} label={text('financialReport.member')} disabled={loadingLookups} onChange={(event) => setMemberCode(event.target.value)}><MenuItem value="">{text('financialReport.selectMember')}</MenuItem>{members.map((member) => <MenuItem key={member.code} value={member.code}>{member.title}</MenuItem>)}</Select></FormControl>}
    {kind === 'membership-income' && <><TextField size="small" label={text('financialReport.memberCode')} value={memberCode} onChange={(event) => setMemberCode(event.target.value)} sx={{ minWidth: 0 }} /><FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{text('financialReport.membershipType')}</InputLabel><Select value={memberRegisterKindId} label={text('financialReport.membershipType')} disabled={loadingLookups} onChange={(event) => setMemberRegisterKindId(event.target.value)}><MenuItem value="">{text('financialReport.all')}</MenuItem>{registerKinds.map((item) => <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)}</Select></FormControl></>}
    {kind === 'user-performance' && <FormControl size="small" sx={{ minWidth: 0 }}><InputLabel>{text('financialReport.user')}</InputLabel><Select value={userId} label={text('financialReport.user')} disabled={loadingLookups} onChange={(event) => setUserId(event.target.value)}><MenuItem value="0">{text('financialReport.currentUser')}</MenuItem>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.title}</MenuItem>)}</Select></FormControl>}
    <Button variant="contained" startIcon={loadingReport ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />} onClick={runReport} disabled={loadingReport || loadingLookups} sx={{ minHeight: 40 }}>{text('financialReport.show')}</Button>
  </Box>;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport} onRefresh={runReport} toolbar={toolbar}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {report === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{text('financialReport.choose')}</Alert>}
    {report !== null && <ReportPreview title={title} language={language} report={report} viewerId={`financial-report-viewer-${kind}`} count={report.Count} resultKey={report} busy={loadingReport} />}
  </ManagementWorkspaceFrame>;
}
