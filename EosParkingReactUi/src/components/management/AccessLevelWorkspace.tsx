import { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { accessLevelApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { AppDataGrid } from '../AppDataGrid';
import { AccessLevelFormFields } from './AccessLevelFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asBigInt, asRows, accessPermissionTotals, emptyAccessLevelForm, markAccessNodes, normalizeAccessNodes, recordValue, setAccessNodeState, type AccessLevelForm, type AccessPermissionNode, type Language, type RecordValue } from './managementTypes';

type Props = { title: string; pageTitle?: string; language: Language };

function copyFor(language: Language) {
  return language === 'fa'
    ? { add: 'سطح دسترسی جدید', edit: 'ویرایش سطح دسترسی', remove: 'حذف سطح دسترسی', removeConfirm: 'آیا از حذف این سطح دسترسی مطمئن هستید؟', cancel: 'انصراف', save: 'ذخیره سطح دسترسی', createTitle: 'افزودن سطح دسترسی', editTitle: 'ویرایش سطح دسترسی', required: 'نام سطح دسترسی الزامی است.', systemDelete: 'سطح دسترسی سیستمی قابل حذف نیست.', saveError: 'ذخیره سطح دسترسی ناموفق بود.', saved: 'سطح دسترسی با موفقیت ذخیره شد.', name: 'نام سطح دسترسی', description: 'توضیحات', permissions: 'مجوزها' }
    : { add: 'New access level', edit: 'Edit access level', remove: 'Delete access level', removeConfirm: 'Are you sure you want to delete this access level?', cancel: 'Cancel', save: 'Save access level', createTitle: 'Add access level', editTitle: 'Edit access level', required: 'Access level name is required.', systemDelete: 'System access levels cannot be deleted.', saveError: 'Saving the access level failed.', saved: 'Access level saved successfully.', name: 'Access level name', description: 'Description', permissions: 'Permissions' };
}

export function AccessLevelWorkspace({ title, pageTitle, language }: Props) {
  const copy = copyFor(language);
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [nodes, setNodes] = useState<AccessPermissionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AccessLevelForm>({ ...emptyAccessLevelForm });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cascade, setCascade] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [levelsResponse, accessResponse] = await Promise.all([accessLevelApi.list(), accessLevelApi.getAccessList()]);
      const loadedRows = asRows(levelsResponse).filter((row) => !Boolean(recordValue(row, 'IsSystemType')));
      setRows(loadedRows);
      setNodes(normalizeAccessNodes(accessResponse));
      setSelectedId((current) => loadedRows.some((row, index) => Number(recordValue(row, 'Id') ?? index) === current) ? current : null);
      setSelectedIds((current) => current.filter((id) => loadedRows.some((row, index) => Number(recordValue(row, 'Id') ?? index) === id)));
    } catch {
      setRows([]);
      setNodes([]);
      setError(language === 'fa' ? 'دریافت سطوح دسترسی از API ناموفق بود.' : 'Loading access levels from the API failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [language]);

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...emptyAccessLevelForm });
    setNodes((current) => markAccessNodes(current, 0n, 0n));
    setMessage('');
    setEditorOpen(true);
  };

  const edit = (row: RecordValue) => {
    const id = Number(recordValue(row, 'Id') ?? 0);
    const part1 = asBigInt(recordValue(row, 'AccessPermissionPart1'));
    const part2 = asBigInt(recordValue(row, 'AccessPermissionPart2'));
    setEditingId(id);
    setSelectedId(id);
    setForm({ Id: id, Name: String(recordValue(row, 'Name') ?? ''), Description: String(recordValue(row, 'Description') ?? ''), AccessPermissionPart1: part1.toString(), AccessPermissionPart2: part2.toString(), IsSystemType: Boolean(recordValue(row, 'IsSystemType')) });
    setNodes((current) => markAccessNodes(current, part1, part2));
    setMessage('');
    setEditorOpen(true);
  };

  const save = async () => {
    if (!form.Name.trim()) {
      setMessage(copy.required);
      return;
    }
    const totals = accessPermissionTotals(nodes);
    setSaving(true);
    setMessage('');
    try {
      await accessLevelApi.save({ Id: form.Id, Name: form.Name.trim(), Description: form.Description, AccessPermissionPart1: totals.part1.toString(), AccessPermissionPart2: totals.part2.toString(), IsSystemType: form.IsSystemType, PersistOn: new Date().toISOString() });
      await load();
      setMessage(copy.saved);
      setEditorOpen(false);
      setEditingId(null);
      setForm({ ...emptyAccessLevelForm });
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const removable = rows.filter((row, index) => selectedIds.includes(Number(recordValue(row, 'Id') ?? index)) && !Boolean(recordValue(row, 'IsSystemType')) && Number(recordValue(row, 'Id') ?? 0) > 0);
    if (removable.length === 0) {
      setError(copy.systemDelete);
      return;
    }
    const confirmation = removable.length > 1 ? (language === 'fa' ? `آیا از حذف ${removable.length} سطح دسترسی انتخاب‌شده مطمئن هستید؟` : `Delete ${removable.length} selected access levels?`) : copy.removeConfirm;
    if (!window.confirm(confirmation)) return;
    try {
      for (const row of removable) await accessLevelApi.remove(Number(recordValue(row, 'Id')));
      setSelectedId(null);
      setSelectedIds([]);
      await load();
    } catch {
      setError(copy.saveError);
    }
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${language === 'fa' ? 'رکورد' : 'records'}`} language={language} loading={loading} onRefresh={() => void load()} toolbar={<><Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip><Tooltip title={copy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.edit} onClick={() => { const row = rows.find((item, index) => Number(recordValue(item, 'Id') ?? index) === selectedId); if (row) edit(row); }} disabled={!selectedId || selectedIds.length !== 1}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={copy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={copy.remove} onClick={() => void remove()} disabled={selectedIds.length === 0}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></>}>
      <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving} maxWidth="lg">
        <AccessLevelFormFields form={form} setForm={setForm} message={message} nodes={nodes} cascade={cascade} onCascadeChange={setCascade} onToggle={(key, checked) => setNodes((current) => setAccessNodeState(current, key, checked, cascade))} labels={{ saved: copy.saved, name: copy.name, description: copy.description, permissions: copy.permissions, selectDescendants: language === 'fa' ? 'زیرمجموعه‌ها هم انتخاب شوند' : 'Select descendants' }} />
      </CrudDialog>
      <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={language === 'fa' ? 'در حال دریافت اطلاعات...' : 'Loading...'} emptyLabel={language === 'fa' ? 'رکوردی برای نمایش وجود ندارد.' : 'No records to display.'}>
        <AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => Number(recordValue(row, 'Id') ?? index)} selectedKey={selectedId} selectedKeys={selectedIds} onSelectionChange={(keys) => { const ids = keys.map(Number); setSelectedIds(ids); setSelectedId(ids.length === 1 ? ids[0] : null); }} onRowClick={(row, index) => { const id = Number(recordValue(row, 'Id') ?? index); setSelectedId(id); setSelectedIds([id]); }} columns={[{ key: 'Name', label: copy.name, render: (row) => String(recordValue(row, 'Name') ?? '—') }, { key: 'Description', label: copy.description, render: (row) => String(recordValue(row, 'Description') ?? '—') }, { key: 'IsSystemType', label: language === 'fa' ? 'سیستمی' : 'System', render: (row) => Boolean(recordValue(row, 'IsSystemType')) ? (language === 'fa' ? 'بله' : 'Yes') : (language === 'fa' ? 'خیر' : 'No') }]} />
      </ResourceState>
    </ManagementWorkspaceFrame>
  );
}
