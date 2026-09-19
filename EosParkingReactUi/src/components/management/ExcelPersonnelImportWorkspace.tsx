import { useMemo, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { ApiError } from '../../api/client';
import { memberApi } from '../../api/management';
import { AppDataGrid } from '../AppDataGrid';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import type { Language } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type Member = { MemberCode: string; CardNumber: string; FirstName: string; LastName: string; Address: string; NationalCode: string; PhoneNumber: string };
type CheckedMember = Member & { Id: string; StatusType?: unknown; Status?: unknown; Message?: unknown; raw: Record<string, unknown> };
const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const unwrap = (input: unknown): unknown => { if (!input || typeof input !== 'object') return input; const root = input as Record<string, unknown>; return root.Values ?? root.values ?? root.Data ?? root.data ?? input; };
const asRows = (input: unknown): Record<string, unknown>[] => { const value = unwrap(input); return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object')) : []; };
const value = (row: Record<string, unknown>, ...keys: string[]) => keys.map((key) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)]).find((item) => item !== undefined && item !== null);
const asMember = (row: Record<string, unknown>): Member => ({ MemberCode: String(value(row, 'MemberCode') ?? ''), CardNumber: String(value(row, 'CardNumber') ?? ''), FirstName: String(value(row, 'FirstName') ?? ''), LastName: String(value(row, 'LastName') ?? ''), Address: String(value(row, 'Address') ?? ''), NationalCode: String(value(row, 'NationalCode') ?? ''), PhoneNumber: String(value(row, 'PhoneNumber') ?? '') });
const parseSpreadsheet = async (buffer: ArrayBuffer): Promise<Member[]> => {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array', cellText: true, cellDates: false });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0] ?? ''];
  if (!firstSheet) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '', raw: false });
  return rows.map((cells) => cells.map((cell) => String(cell ?? '').trim())).filter((cells) => cells.length >= 7 && cells.some(Boolean)).map((cells) => ({ MemberCode: cells[0] ?? '', CardNumber: cells[1] ?? '', FirstName: cells[2] ?? '', LastName: cells[3] ?? '', Address: cells[4] ?? '', NationalCode: cells[5] ?? '', PhoneNumber: cells[6] ?? '' }));
};
const isError = (row: CheckedMember) => { const status = String(value(row.raw, 'StatusType', 'Status', 'Message') ?? '').toLowerCase(); return status.includes('error') || status.includes('invalid') || status.includes('خطا') || status.includes('نامعتبر'); };

export function ExcelPersonnelImportWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [checkedRows, setCheckedRows] = useState<CheckedMember[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile); setMembers([]); setCheckedRows([]); setSelectedKeys([]); setError(''); setMessage('');
    if (!selectedFile) return;
    try {
      const parsed = await parseSpreadsheet(await selectedFile.arrayBuffer());
      if (parsed.length === 0) { setError(text(language, 'فایل داده‌ی قابل خواندن با قالب هفت‌ستونه ندارد.', 'The file has no readable seven-column records.')); return; }
      setMembers(parsed);
      setMessage(text(language, `${parsed.length} رکورد برای بررسی آماده شد.`, `${parsed.length} records are ready for validation.`));
    } catch { setError(text(language, 'خواندن فایل Excel ناموفق بود.', 'The Excel file could not be read.')); }
  };

  const check = async () => {
    if (members.length === 0) { setError(text(language, 'ابتدا یک فایل CSV/TSV معتبر انتخاب کنید.', 'Select a valid CSV/TSV file first.')); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      const rows = asRows(await memberApi.checkExternalMembers(parkingId, members as unknown as Record<string, unknown>[]));
      const normalized = rows.map((row, index) => ({ ...asMember(row), Id: String(value(row, 'Id') ?? index), StatusType: value(row, 'StatusType'), Status: value(row, 'Status'), Message: value(row, 'Message'), raw: row }));
      setCheckedRows(normalized); setSelectedKeys(normalized.filter((row) => !isError(row)).map((row) => row.Id));
      setMessage(text(language, 'بررسی رکوردها انجام شد؛ رکوردهای بدون خطا انتخاب شده‌اند.', 'Records were checked; valid records are selected.'));
    } catch (cause) { setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'مجوز بررسی اطلاعات اعضا را ندارید.', 'You are not allowed to validate member data.') : text(language, 'بررسی اطلاعات فایل ناموفق بود.', 'File validation failed.')); }
    finally { setLoading(false); }
  };

  const importSelected = async () => {
    const selected = checkedRows.filter((row) => selectedKeys.includes(row.Id) && !isError(row));
    if (selected.length === 0) { setError(text(language, 'حداقل یک رکورد معتبر را انتخاب کنید.', 'Select at least one valid record.')); return; }
    setImporting(true); setError(''); setMessage('');
    try { await memberApi.importExternalMembers(parkingId, selected.map(({ raw, ...member }) => ({ ...member, ...asMember(raw) }))); setMessage(text(language, 'اطلاعات پرسنلی با موفقیت دریافت شد.', 'Personnel information was imported successfully.')); }
    catch (cause) { setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'مجوز ثبت اطلاعات اعضا را ندارید.', 'You are not allowed to import member data.') : text(language, 'ثبت اطلاعات پرسنلی ناموفق بود.', 'Importing personnel information failed.')); }
    finally { setImporting(false); }
  };

  const columns = useMemo(() => [
    { key: 'MemberCode', label: text(language, 'کد عضویت', 'Member code'), render: (row: CheckedMember) => <span dir="ltr">{row.MemberCode || '—'}</span> },
    { key: 'CardNumber', label: text(language, 'شماره کارت', 'Card number'), render: (row: CheckedMember) => <span dir="ltr">{row.CardNumber || '—'}</span> },
    { key: 'FirstName', label: text(language, 'نام', 'First name') },
    { key: 'LastName', label: text(language, 'نام خانوادگی', 'Last name') },
    { key: 'NationalCode', label: text(language, 'کد ملی', 'National code'), render: (row: CheckedMember) => <span dir="ltr">{row.NationalCode || '—'}</span> },
    { key: 'Status', label: text(language, 'وضعیت بررسی', 'Validation status'), render: (row: CheckedMember) => <Typography variant="caption" color={isError(row) ? 'error.main' : 'success.main'}>{String(value(row.raw, 'Message', 'Status', 'StatusType') ?? text(language, 'معتبر', 'Valid'))}</Typography> },
  ], [language]);

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={text(language, 'بررسی و دریافت اطلاعات پرسنلی از فایل Excel', 'Validate and import personnel data from Excel')} language={language} loading={loading || importing}>
    <Stack spacing={2}>
      <Alert severity="info">{text(language, 'ترتیب ستون‌های فایل مطابق فرم Windows: کد عضویت، شماره کارت، نام، نام خانوادگی، آدرس، کد ملی، تلفن.', 'Column order follows the Windows form: member code, card number, first name, last name, address, national code, phone.')}</Alert>
      <Paper variant="outlined" sx={{ p: 1.5 }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}><Button component="label" variant="outlined" startIcon={<CloudUploadRoundedIcon />}>{text(language, 'انتخاب فایل Excel', 'Choose Excel file')}<input hidden type="file" accept=".xls,.xlsx,.csv,.tsv" onChange={(event) => { void readFile(event); }} /></Button><Typography variant="body2" color="text.secondary" dir="ltr">{file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : text(language, 'فایلی انتخاب نشده است.', 'No file selected.')}</Typography><Box sx={{ flex: 1 }} /><Button variant="contained" startIcon={<CheckCircleOutlineRoundedIcon />} onClick={() => void check()} disabled={loading || members.length === 0}>{text(language, 'بررسی اطلاعات', 'Check data')}</Button></Stack></Paper>
      {message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
      <Divider />
      <Box sx={{ minWidth: 0, overflowX: 'auto' }}><AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={checkedRows} columns={columns} rowKey={(row) => row.Id} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} isRowSelectable={(row) => !isError(row)} defaultFilterOpen /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}><Typography variant="caption" color="text.secondary">{text(language, `${selectedKeys.length} رکورد انتخاب شده از ${checkedRows.length}`, `${selectedKeys.length} of ${checkedRows.length} records selected`)}</Typography><Button variant="contained" color="success" startIcon={<DoneAllRoundedIcon />} onClick={() => void importSelected()} disabled={importing || checkedRows.length === 0}>{text(language, 'دریافت رکوردهای انتخاب‌شده', 'Import selected records')}</Button></Box>
    </Stack>
  </ManagementWorkspaceFrame>;
}
