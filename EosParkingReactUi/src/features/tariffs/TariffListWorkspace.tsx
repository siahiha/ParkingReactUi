import { useEffect, useMemo, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import { ApiError } from '../../api/client';
import { AppDataGrid } from '../../components/AppDataGrid';
import { ManagementWorkspaceFrame } from '../../components/management/ManagementWorkspaceFrame';
import { ResourceState } from '../../components/management/ResourceState';
import type { Language } from '../../i18n';
import { formatDateTime } from '../../utils/formatters';
import { tariffService, type TariffListRow } from './tariffService';
import { TariffEditorDialog } from './TariffEditorDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';

type Filter = 'all' | 'public' | 'member';
type Props = { title: string; pageTitle: string; parkingId: number; language: Language };

export function TariffListWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [rows, setRows] = useState<TariffListRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const copy = language === 'fa'
    ? { count: 'تعرفه', loading: 'در حال دریافت تعرفه‌ها...', empty: 'تعرفه‌ای برای این پارکینگ ثبت نشده است.', error: 'دریافت تعرفه‌ها ناموفق بود.', forbidden: 'دسترسی مشاهدهٔ تعرفه‌ها برای کاربر فعلی مجاز نیست.', filter: 'نمایش', all: 'همه تعرفه‌ها', public: 'تعرفه عمومی', member: 'تعرفه اعضا', type: 'نوع', status: 'وضعیت', current: 'پیش‌فرض', date: 'تاریخ اجرا', active: 'فعال', inactive: 'غیرفعال', yes: 'بله', no: '—' }
    : { count: 'tariffs', loading: 'Loading tariffs...', empty: 'No tariffs are registered for this parking.', error: 'Loading tariffs failed.', forbidden: 'You are not allowed to view tariffs.', filter: 'Show', all: 'All tariffs', public: 'Public tariffs', member: 'Member tariffs', type: 'Type', status: 'Status', current: 'Default', date: 'Effective date', active: 'Active', inactive: 'Inactive', yes: 'Yes', no: '—' };

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      setRows(await tariffService.list(parkingId, signal));
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof ApiError && cause.status === 403 ? copy.forbidden : copy.error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [parkingId, language]);

  const filteredRows = useMemo(() => rows.filter((row) => filter === 'all' || (filter === 'member' ? row.isMemberTariff : !row.isMemberTariff)), [filter, rows]);
  const selectedTariff = rows.find((row) => row.id === selectedTariffId) ?? null;
  const direction = language === 'fa' ? 'rtl' : 'ltr';

  const actionCopy = language === 'fa' ? { add: 'ایجاد تعرفه', edit: 'ویرایش تعرفه', remove: 'حذف تعرفه', removeError: 'حذف تعرفه ناموفق بود.' } : { add: 'Create tariff', edit: 'Edit tariff', remove: 'Delete tariff', removeError: 'Deleting tariff failed.' };

  const responseValue = (input: unknown) => {
    const response = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const resultType = response.ResponseResultType ?? response.responseResultType;
    if (resultType !== undefined && resultType !== null && resultType !== '' && Number(resultType) !== 1 && String(resultType).toLowerCase() !== 'ok') throw new Error(String(response.Message ?? response.message ?? response.RealMessage ?? response.realMessage ?? actionCopy.removeError));
    return response.Values ?? response.values ?? response.Data ?? response.data ?? input;
  };

  const remove = async () => {
    if (!selectedTariff) return;
    setSaving(true);
    setError('');
    try {
      if (!Boolean(responseValue(await tariffService.remove(selectedTariff.id)))) throw new Error(actionCopy.removeError);
      setDeleteOpen(false);
      setSelectedTariffId(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : actionCopy.removeError);
    } finally {
      setSaving(false);
    }
  };

  return <><ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${filteredRows.length} ${copy.count}`} language={language} loading={loading || saving} onRefresh={() => void load()} toolbar={<><Tooltip title={actionCopy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={actionCopy.add} onClick={() => setEditorMode('create')} disabled={saving}><AddRoundedIcon /></IconButton></Tooltip><Tooltip title={actionCopy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={actionCopy.edit} disabled={!selectedTariff || saving} onClick={() => setEditorMode('edit')}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={actionCopy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={actionCopy.remove} disabled={!selectedTariff || saving} onClick={() => setDeleteOpen(true)}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel id="tariff-filter-label">{copy.filter}</InputLabel><Select labelId="tariff-filter-label" label={copy.filter} value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>{[['all', copy.all], ['public', copy.public], ['member', copy.member]].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl></>}>
    <Box className="workspace-resource-content">
      <ResourceState loading={loading} error={error} empty={filteredRows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
        <AppDataGrid direction={direction} rows={filteredRows} rowKey={(row) => row.id} selectedKey={selectedTariffId} onRowClick={(row) => setSelectedTariffId(row.id)} columns={[
          { key: 'title', label: language === 'fa' ? 'عنوان تعرفه' : 'Tariff title', render: (row) => row.title || '—' },
          { key: 'type', label: copy.type, render: (row) => row.isMemberTariff ? copy.member : copy.public },
          { key: 'isActive', label: copy.status, compact: true, boolean: true, trueLabel: copy.active, falseLabel: copy.inactive },
          { key: 'isCurrent', label: copy.current, compact: true, boolean: true, trueLabel: copy.yes, falseLabel: copy.no },
          { key: 'persistedOn', label: copy.date, render: (row) => row.persistedOn ? formatDateTime(new Date(row.persistedOn), language) : '—' },
        ]} />
      </ResourceState>
    </Box>
  </ManagementWorkspaceFrame><TariffEditorDialog open={editorMode !== null} mode={editorMode ?? 'create'} row={editorMode === 'edit' ? selectedTariff : null} parkingId={parkingId} language={language} onClose={() => setEditorMode(null)} onSaved={() => { setEditorMode(null); void load(); }} /><ConfirmDialog open={deleteOpen} title={language === 'fa' ? 'حذف تعرفه' : 'Delete tariff'} message={language === 'fa' ? `آیا از حذف «${selectedTariff?.title ?? ''}» مطمئن هستید؟` : `Delete “${selectedTariff?.title ?? ''}”?`} cancelLabel={language === 'fa' ? 'انصراف' : 'Cancel'} confirmLabel={language === 'fa' ? 'حذف' : 'Delete'} onClose={() => setDeleteOpen(false)} onConfirm={() => void remove()} busy={saving} /></>;
}
