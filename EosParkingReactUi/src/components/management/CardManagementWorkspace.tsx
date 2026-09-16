import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import { z } from 'zod';
import { ApiError } from '../../api/client';
import { cardApi } from '../../api/management';
import { formatDateTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import type { Language } from './managementTypes';
import { useNavigationGuard, type NavigationAction } from '../../pages/NavigationGuardContext';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };

type CardRow = {
  clientKey: string;
  raw: Record<string, unknown>;
  Id: number;
  CardNumber: string;
  MemberCode: string;
  MemberFullName: string;
  IsBlock: boolean;
  PersistOn: string;
  Description: string;
};

type CardDraft = Pick<CardRow, 'Id' | 'CardNumber' | 'IsBlock' | 'Description'>;

const cardWireSchema = z.object({
  Id: z.number(),
  CardNumber: z.string(),
  MemberCode: z.string(),
  MemberFullName: z.string(),
  IsBlock: z.boolean(),
  PersistOn: z.string(),
  Description: z.string(),
}).passthrough();

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
}

function valueOf(row: Record<string, unknown>, key: string): unknown {
  return row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
}

function stringValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function booleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  const normalized = stringValue(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function valuesOf(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  const object = asRecord(input);
  const values = object.Values ?? object.values ?? object.Data ?? object.data;
  return Array.isArray(values) ? values : [];
}

function parseCards(input: unknown): CardRow[] {
  return valuesOf(input).map((value, index) => {
    const raw = asRecord(value);
    const parsed = cardWireSchema.parse({
      ...raw,
      Id: Number(valueOf(raw, 'Id') ?? 0),
      CardNumber: stringValue(valueOf(raw, 'CardNumber')),
      MemberCode: stringValue(valueOf(raw, 'MemberCode')),
      MemberFullName: stringValue(valueOf(raw, 'MemberFullName')),
      IsBlock: booleanValue(valueOf(raw, 'IsBlock')),
      PersistOn: stringValue(valueOf(raw, 'PersistOn')),
      Description: stringValue(valueOf(raw, 'Description')),
    });
    return { ...parsed, raw, clientKey: `card-${parsed.Id > 0 ? parsed.Id : `row-${index}`}` };
  });
}

function responseSucceeded(input: unknown): boolean {
  if (input === undefined || input === null) return true;
  const object = asRecord(input);
  const resultType = object.ResponseResultType ?? object.responseResultType;
  if (resultType !== undefined) {
    const normalized = stringValue(resultType).trim().toLowerCase();
    if (!['ok', 'success', '0', '1'].includes(normalized)) return false;
  }
  const values = object.Values ?? object.values;
  return values === undefined || values === true || values === 1 || values === '1';
}

function copyFor(language: Language) {
  return language === 'fa'
    ? {
      add: 'افزودن کارت', edit: 'ویرایش کارت', applyEdit: 'اعمال ویرایش', cancelEdit: 'لغو ویرایش', remove: 'حذف کارت', save: 'ذخیره تغییرات', discard: 'لغو تغییرات', refresh: 'به‌روزرسانی',
      cardNumber: 'شماره کارت', memberCode: 'کد عضویت', memberName: 'نام عضو', blocked: 'غیرفعال', persistOn: 'تاریخ ثبت', description: 'توضیحات',
      count: 'کارت', loading: 'در حال دریافت کارت‌ها...', empty: 'کارتی برای نمایش وجود ندارد.', loadError: 'دریافت کارت‌ها از API ناموفق بود.', forbidden: 'دسترسی مشاهده یا مدیریت کارت‌ها برای این کاربر مجاز نیست.', required: 'شماره کارت الزامی است.', duplicate: 'کارتی با این شماره قبلاً ثبت شده است.',
      saved: 'تغییرات کارت‌ها با موفقیت ذخیره شد.', saveError: 'ذخیره تغییرات کارت‌ها ناموفق بود.', deleted: 'رکوردهای انتخاب‌شده برای حذف علامت‌گذاری شدند.', pendingDelete: 'حذف رکورد انتخاب‌شده در انتظار تأیید است.', confirmDelete: 'حذف', cancel: 'انصراف', selected: 'انتخاب‌شده', unsaved: 'تغییر ذخیره‌نشده دارید.', noChanges: 'تغییری برای ذخیره وجود ندارد.', unsavedTitle: 'تغییرات ذخیره‌نشده', unsavedMessage: 'در این صفحه تغییرات ذخیره‌نشده دارید. برای ادامه چه کاری انجام شود؟', saveAndContinue: 'ذخیره و ادامه', discardAndContinue: 'ادامه بدون ذخیره', stay: 'ماندن در صفحه',
    }
    : {
      add: 'Add card', edit: 'Edit card', applyEdit: 'Apply edit', cancelEdit: 'Cancel edit', remove: 'Delete card', save: 'Save changes', discard: 'Discard changes', refresh: 'Refresh',
      cardNumber: 'Card number', memberCode: 'Member code', memberName: 'Member name', blocked: 'Inactive', persistOn: 'Registered at', description: 'Description',
      count: 'card(s)', loading: 'Loading cards...', empty: 'No cards to display.', loadError: 'Loading cards from the API failed.', forbidden: 'The current user is not allowed to view or manage cards.', required: 'Card number is required.', duplicate: 'A card with this number already exists.',
      saved: 'Card changes were saved successfully.', saveError: 'Saving card changes failed.', deleted: 'Selected rows are marked for deletion.', pendingDelete: 'Deletion of the selected rows is waiting for confirmation.', confirmDelete: 'Delete', cancel: 'Cancel', selected: 'selected', unsaved: 'You have unsaved changes.', noChanges: 'There are no changes to save.', unsavedTitle: 'Unsaved changes', unsavedMessage: 'This page has unsaved changes. What should happen before continuing?', saveAndContinue: 'Save and continue', discardAndContinue: 'Continue without saving', stay: 'Stay on page',
    };
}

export function CardManagementWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const copy = copyFor(language);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<CardDraft>({ Id: 0, CardNumber: '', IsBlock: false, Description: '' });
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [pendingDelete, setPendingDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingEdit, setPendingEdit] = useState<CardRow | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<NavigationAction | null>(null);
  const { registerNavigationGuard } = useNavigationGuard();

  const load = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      setRows(parseCards(await cardApi.list(parkingId)));
      setSelectedKeys([]);
      setChangedKeys([]);
      setDeletedIds([]);
      setDraft({ Id: 0, CardNumber: '', IsBlock: false, Description: '' });
      setEditorMode('create');
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? copy.forbidden : copy.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [parkingId, language]);

  const dirty = changedKeys.length > 0 || deletedIds.length > 0;
  const selectedRows = useMemo(() => rows.filter((row) => selectedKeys.includes(row.clientKey)), [rows, selectedKeys]);
  const markChanged = (key: string) => setChangedKeys((current) => current.includes(key) ? current : [...current, key]);
  const isDuplicate = (cardNumber: string, ignoredKey?: string) => rows.some((row) => row.clientKey !== ignoredKey && row.CardNumber.trim().toLocaleLowerCase() === cardNumber.trim().toLocaleLowerCase());

  const addCard = () => {
    const cardNumber = draft.CardNumber.trim();
    setError('');
    if (!cardNumber) { setError(copy.required); return; }
    if (isDuplicate(cardNumber)) { setError(copy.duplicate); return; }
    const clientKey = `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setRows((current) => [...current, { clientKey, raw: {}, Id: 0, CardNumber: cardNumber, MemberCode: '', MemberFullName: '', IsBlock: draft.IsBlock, PersistOn: '', Description: draft.Description.trim() }]);
    setChangedKeys((current) => [...current, clientKey]);
    setDraft({ Id: 0, CardNumber: '', IsBlock: false, Description: '' });
    setMessage(copy.add);
  };

  const beginEditNow = (row: CardRow) => {
    setSelectedKeys([row.clientKey]);
    setEditorMode('edit');
    setDraft({ Id: row.Id, CardNumber: row.CardNumber, IsBlock: row.IsBlock, Description: row.Description });
    setError('');
    setMessage('');
  };

  const beginEdit = (row?: CardRow) => {
    const target = row ?? (selectedRows.length === 1 ? selectedRows[0] : undefined);
    if (!target) return;
    if (dirty && (editorMode !== 'edit' || !selectedKeys.includes(target.clientKey))) {
      setPendingEdit(target);
      return;
    }
    beginEditNow(target);
  };

  const cancelEdit = () => {
    setEditorMode('create');
    setDraft({ Id: 0, CardNumber: '', IsBlock: false, Description: '' });
    setError('');
  };

  const applyEdit = () => {
    const selected = selectedRows[0];
    const cardNumber = draft.CardNumber.trim();
    if (!selected) return;
    setError('');
    if (!cardNumber) { setError(copy.required); return; }
    if (isDuplicate(cardNumber, selected.clientKey)) { setError(copy.duplicate); return; }
    setRows((current) => current.map((row) => row.clientKey === selected.clientKey ? { ...row, CardNumber: cardNumber, IsBlock: draft.IsBlock, Description: draft.Description.trim() } : row));
    markChanged(selected.clientKey);
    setMessage(copy.applyEdit);
    cancelEdit();
  };

  const requestDelete = () => {
    if (selectedRows.length === 0) return;
    setPendingDelete(true);
    setMessage(copy.pendingDelete);
  };

  const cancelDelete = () => setPendingDelete(false);

  const confirmDelete = () => {
    const persistedIds = selectedRows.map((row) => row.Id).filter((id) => id > 0);
    const selected = new Set(selectedKeys);
    setRows((current) => current.filter((row) => !selected.has(row.clientKey)));
    setChangedKeys((current) => current.filter((key) => !selected.has(key)));
    setDeletedIds((current) => [...new Set([...current, ...persistedIds])]);
    setSelectedKeys([]);
    setPendingDelete(false);
    cancelEdit();
    setMessage(copy.deleted);
  };

  const discardChanges = () => { void load(); };

  const save = async (): Promise<boolean> => {
    if (!dirty) { setMessage(copy.noChanges); return true; }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const changed = rows.filter((row) => changedKeys.includes(row.clientKey)).map((row) => ({ ...row.raw, Id: row.Id, ParkingId: parkingId, CardNumber: row.CardNumber, IsBlock: row.IsBlock, Description: row.Description, PersistOn: row.PersistOn || new Date().toISOString() }));
      const deletions = deletedIds.map((id) => ({ Id: -id }));
      const response = await cardApi.saveAll([...changed, ...deletions]);
      if (!responseSucceeded(response)) throw new Error(copy.saveError);
      await load();
      setMessage(copy.saved);
      return true;
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : copy.saveError);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => registerNavigationGuard((proceed) => {
    if (!dirty) { proceed(); return; }
    setPendingNavigation(() => proceed);
  }), [dirty, registerNavigationGuard]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      // Browsers may replace this text with their own native wording, but
      // localized returnValue is still used by browsers that allow custom copy.
      event.returnValue = copy.unsavedMessage;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty, language]);

  const cancelPendingAction = () => {
    setPendingEdit(null);
    setPendingNavigation(null);
  };
  const saveAndContinue = async () => {
    const target = pendingEdit;
    const proceed = pendingNavigation;
    const saved = await save();
    if (!saved) return;
    setPendingEdit(null);
    setPendingNavigation(null);
    if (target) beginEditNow(target);
    proceed?.();
  };
  const discardAndContinue = async () => {
    const target = pendingEdit;
    const proceed = pendingNavigation;
    setPendingEdit(null);
    setPendingNavigation(null);
    if (proceed) { proceed(); return; }
    if (target) {
      await load();
      beginEditNow(target);
    }
  };

  const selectedLabel = selectedRows.length > 0 ? `${selectedRows.length} ${copy.selected}` : '';

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${copy.count}`} language={language} loading={loading || saving} onRefresh={() => void load()}>
      <Box className="card-management-toolbar" role="region" aria-label={language === 'fa' ? 'ابزارهای مدیریت کارت' : 'Card management tools'}>
        <Box className="card-management-command-row">
          <TextField size="small" label={copy.cardNumber} value={draft.CardNumber} onChange={(event) => setDraft((current) => ({ ...current, CardNumber: event.target.value }))} disabled={saving} slotProps={{ htmlInput: { dir: 'ltr', maxLength: 100 } }} />
          <TextField size="small" label={copy.description} value={draft.Description} onChange={(event) => setDraft((current) => ({ ...current, Description: event.target.value }))} disabled={saving} />
          <FormControlLabel control={<Checkbox size="small" checked={draft.IsBlock} onChange={(event) => setDraft((current) => ({ ...current, IsBlock: event.target.checked }))} disabled={saving} />} label={copy.blocked} />
          {editorMode === 'create' ? <Button size="small" variant="contained" startIcon={<AddRoundedIcon />} onClick={addCard} disabled={saving}>{copy.add}</Button> : <><Button size="small" variant="contained" startIcon={<CheckRoundedIcon />} onClick={applyEdit} disabled={saving}>{copy.applyEdit}</Button><Button size="small" variant="outlined" startIcon={<CancelRoundedIcon />} onClick={cancelEdit} disabled={saving}>{copy.cancelEdit}</Button></>}
          <Box className="card-management-command-spacer" />
          <Tooltip title={copy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.edit} onClick={() => beginEdit()} disabled={saving || selectedRows.length !== 1}><EditRoundedIcon /></IconButton></span></Tooltip>
          <Tooltip title={copy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={copy.remove} onClick={requestDelete} disabled={saving || selectedRows.length === 0}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip>
          <Tooltip title={copy.save} arrow><span><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.save} onClick={() => void save()} disabled={saving || !dirty}><SaveRoundedIcon /></IconButton></span></Tooltip>
          <Tooltip title={copy.discard} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.discard} onClick={discardChanges} disabled={saving || !dirty}><UndoRoundedIcon /></IconButton></span></Tooltip>
          <Tooltip title={copy.refresh} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.refresh} onClick={() => void load()} disabled={loading || saving}><RefreshRoundedIcon /></IconButton></span></Tooltip>
        </Box>
        <Box className="card-management-status-row">
          <Typography variant="caption" color="text.secondary">{selectedLabel}</Typography>
          {dirty && <Typography variant="caption" color="warning.main">{copy.unsaved}</Typography>}
        </Box>
      </Box>

      {message && <Alert severity={pendingDelete ? 'warning' : 'success'} action={pendingDelete ? <><Button color="inherit" size="small" onClick={cancelDelete}>{copy.cancel}</Button><Button color="error" size="small" variant="contained" onClick={confirmDelete}>{copy.confirmDelete}</Button></> : undefined}>{message}</Alert>}
      {error && rows.length > 0 && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      <Box sx={{ mt: 1 }}>
        <ResourceState loading={loading} error={rows.length === 0 ? error : ''} empty={!error && rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
          <AppDataGrid<CardRow> direction={language === 'fa' ? 'rtl' : 'ltr'} defaultFilterOpen rows={rows} rowKey={(row) => row.clientKey} selectedKeys={selectedKeys} selectedKey={selectedKeys.length === 1 ? selectedKeys[0] : null} onSelectionChange={(keys) => { setSelectedKeys(keys.map(String)); setPendingDelete(false); }} onRowClick={(row) => { setSelectedKeys([row.clientKey]); setPendingDelete(false); }} onRowDoubleClick={(row) => beginEdit(row)} columns={[
            { key: 'CardNumber', label: copy.cardNumber, render: (row) => <span dir="ltr">{row.CardNumber || '—'}</span> },
            { key: 'MemberCode', label: copy.memberCode, render: (row) => <span dir="ltr">{row.MemberCode || '—'}</span> },
            { key: 'MemberFullName', label: copy.memberName, render: (row) => row.MemberFullName || '—' },
            { key: 'IsBlock', label: copy.blocked, compact: true, trueLabel: language === 'fa' ? 'غیرفعال' : 'Inactive', falseLabel: language === 'fa' ? 'فعال' : 'Active' },
            { key: 'PersistOn', label: copy.persistOn, render: (row) => formatDateTime(row.PersistOn, language) },
            { key: 'Description', label: copy.description, render: (row) => row.Description || '—' },
          ]} />
        </ResourceState>
      </Box>
      {saving && <Box className="inline-status-row" sx={{ mt: 1 }}><CircularProgress size={18} /><Typography variant="body2">{language === 'fa' ? 'در حال ذخیره تغییرات...' : 'Saving changes...'}</Typography></Box>}
      {(pendingEdit || pendingNavigation) && <Dialog open onClose={() => { if (!saving) cancelPendingAction(); }} dir={language === 'fa' ? 'rtl' : 'ltr'}>
        <DialogTitle>{copy.unsavedTitle}</DialogTitle>
        <DialogContent><Typography>{copy.unsavedMessage}</Typography>{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}</DialogContent>
        <DialogActions>
          <Button onClick={cancelPendingAction} disabled={saving}>{copy.stay}</Button>
          <Button color="warning" onClick={() => void discardAndContinue()} disabled={saving}>{copy.discardAndContinue}</Button>
          <Button variant="contained" onClick={() => void saveAndContinue()} disabled={saving}>{copy.saveAndContinue}</Button>
        </DialogActions>
      </Dialog>}
    </ManagementWorkspaceFrame>
  );
}
