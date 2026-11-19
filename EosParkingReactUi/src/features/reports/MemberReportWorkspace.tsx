import { ReportPreview } from './ReportPreview';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { usePreparedReport } from './usePreparedReport';
import { memberApi } from '../../api/management';
import { EosDateTimePicker } from '../../components/EosDateTimePicker';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import type { Language } from '../../components/management/managementTypes';
import { asRows } from '../../components/management/managementTypes';

type MemberReportState = 'all' | 'active' | 'inactive';
type Props = { title: string; pageTitle?: string; parkingId: number; language: Language; state: MemberReportState };
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

function responseValues(input: unknown): unknown[] {
  const response = recordOf(input);
  const responseType = valueOf(response, 'ResponseResultType');
  if (responseType !== undefined && responseType !== null && responseType !== '' && Number(responseType) !== 1 && String(responseType).toLowerCase() !== 'ok') {
    throw new Error(textOf(valueOf(response, 'Message') ?? valueOf(response, 'RealMessage')) || 'پاسخ سرویس معتبر نیست.');
  }
  return asRows(valueOf(response, 'Values') ?? valueOf(response, 'Data') ?? input);
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
  const { report, loadingReport, error, setError, run } = usePreparedReport(`${parkingId}:${state}`, language);
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


  const runReport = () => {
    if (fromDate > toDate) {
      setError(fa ? 'تاریخ شروع نباید بعد از تاریخ پایان باشد.' : 'The start date cannot be after the end date.');
      return;
    }
    run(`members-${state}`, {
      ParkingId: parkingId,
      Filters: { StartDateTime: `${fromDate}T00:00:00`, EndDateTime: `${toDate}T23:59:59` },
      GridFilters: [{ ColumnName: 'MemberRegisterKindTitle', Phrase: kindTitle, Type: 1 }],
    });
  };

  const viewerId = `member-report-viewer-${state}`;

  return <ManagementWorkspaceFrame title={title} language={language} loading={loadingReport} onRefresh={runReport} toolbar={<Box className="report-filter-toolbar">
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
    {report === null && !error && <Alert severity="info" icon={<AssessmentRoundedIcon />}>{fa ? 'فیلترها را انتخاب کنید و نمایش گزارش را بزنید.' : 'Choose the filters and select Show report.'}</Alert>}
    {report !== null && <ReportPreview title={title} language={language} report={report} viewerId={viewerId} count={report.Count} resultKey={report} busy={loadingReport} />}
  </ManagementWorkspaceFrame>;
}
