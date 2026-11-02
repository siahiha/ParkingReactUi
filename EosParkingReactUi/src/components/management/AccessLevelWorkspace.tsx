import { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { accessLevelApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { AppDataGrid } from '../AppDataGrid';
import { AccessLevelFormFields } from './AccessLevelFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import i18n from '../../i18n/instance';
import { asBigInt, asRows, accessPermissionTotals, emptyAccessLevelForm, markAccessNodes, normalizeAccessNodes, recordValue, setAccessNodeState, type AccessLevelForm, type AccessPermissionNode, type Language, type RecordValue } from './managementTypes';

type Props = { title: string; pageTitle?: string; language: Language };

export function AccessLevelWorkspace({ title, pageTitle, language }: Props) {
  const text = i18n.getFixedT(language);
  const copy = { add: text('accessWorkspace.add'), edit: text('accessWorkspace.edit'), remove: text('accessWorkspace.remove'), cancel: text('accessWorkspace.cancel'), save: text('accessWorkspace.save'), createTitle: text('accessWorkspace.createTitle'), editTitle: text('accessWorkspace.editTitle'), required: text('accessWorkspace.required'), systemDelete: text('accessWorkspace.systemDelete'), saveError: text('accessWorkspace.saveError'), saved: text('accessWorkspace.saved'), name: text('accessWorkspace.name'), description: text('accessWorkspace.description'), permissions: text('accessWorkspace.permissions'), selectDescendants: text('accessWorkspace.selectDescendants'), loading: text('accessWorkspace.loading'), empty: text('accessWorkspace.empty'), system: text('accessWorkspace.system'), yes: text('accessWorkspace.yes'), no: text('accessWorkspace.no'), loadError: text('accessWorkspace.loadError') };
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
  const [deleteRows, setDeleteRows] = useState<RecordValue[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setError(copy.loadError);
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

  const requestRemove = () => {
    const removable = rows.filter((row, index) => selectedIds.includes(Number(recordValue(row, 'Id') ?? index)) && !Boolean(recordValue(row, 'IsSystemType')) && Number(recordValue(row, 'Id') ?? 0) > 0);
    if (removable.length === 0) {
      setError(copy.systemDelete);
      return;
    }
    setDeleteRows(removable);
    setDeleteDialogOpen(true);
  };

  const confirmRemove = async () => {
    setDeleting(true);
    try {
      for (const row of deleteRows) await accessLevelApi.remove(Number(recordValue(row, 'Id')));
      setSelectedId(null);
      setSelectedIds([]);
      await load();
      setDeleteDialogOpen(false);
      setDeleteRows([]);
    } catch {
      setError(copy.saveError);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => void load()} toolbar={<><Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip><Tooltip title={copy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.edit} onClick={() => { const row = rows.find((item, index) => Number(recordValue(item, 'Id') ?? index) === selectedId); if (row) edit(row); }} disabled={!selectedId || selectedIds.length !== 1}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={copy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={copy.remove} onClick={requestRemove} disabled={selectedIds.length === 0}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></>}>
      <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving} maxWidth="lg" direction={language === 'fa' ? 'rtl' : 'ltr'}>
        <AccessLevelFormFields form={form} setForm={setForm} message={message} nodes={nodes} cascade={cascade} onCascadeChange={setCascade} onToggle={(key, checked) => setNodes((current) => setAccessNodeState(current, key, checked, cascade))} labels={{ saved: copy.saved, name: copy.name, description: copy.description, permissions: copy.permissions, selectDescendants: copy.selectDescendants }} />
      </CrudDialog>
      <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
        <AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => Number(recordValue(row, 'Id') ?? index)} selectedKey={selectedId} selectedKeys={selectedIds} onSelectionChange={(keys) => { const ids = keys.map(Number); setSelectedIds(ids); setSelectedId(ids.length === 1 ? ids[0] : null); }} onRowClick={(row, index) => { const id = Number(recordValue(row, 'Id') ?? index); setSelectedId(id); setSelectedIds([id]); }} onRowDoubleClick={(row) => edit(row)} columns={[{ key: 'Name', label: copy.name, render: (row) => String(recordValue(row, 'Name') ?? '—') }, { key: 'Description', label: copy.description, render: (row) => String(recordValue(row, 'Description') ?? '—') }, { key: 'IsSystemType', label: copy.system, render: (row) => Boolean(recordValue(row, 'IsSystemType')) ? copy.yes : copy.no }]} />
      </ResourceState>
      <ConfirmDialog open={deleteDialogOpen} title={copy.remove} message={deleteRows.length > 1 ? i18n.t('access.deleteManyConfirm', { count: deleteRows.length, lng: language }) : i18n.t('access.deleteConfirm', { lng: language })} cancelLabel={copy.cancel} confirmLabel={copy.remove} busy={deleting} onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteRows([]); } }} onConfirm={() => void confirmRemove()} />
    </ManagementWorkspaceFrame>
  );
}
