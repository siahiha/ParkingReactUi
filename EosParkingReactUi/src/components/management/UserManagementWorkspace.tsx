import { useEffect, useState } from 'react';
import { Alert, IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { encryptLegacyPassword } from '../../api/client';
import { userApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { AppDataGrid } from '../AppDataGrid';
import { UserFormFields, type UserFormLabels } from './UserFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, emptyUserForm, recordValue, type Language, type RecordValue, type UserForm, userTypeOptions } from './managementTypes';
import i18n from '../../i18n/instance';

type Props = { title: string; pageTitle?: string; language: Language };

export function UserManagementWorkspace({ title, pageTitle, language }: Props) {
  const text = i18n.getFixedT(language);
  const copy = { add: text('userWorkspace.add'), edit: text('userWorkspace.edit'), remove: text('userWorkspace.remove'), cancel: text('userWorkspace.cancel'), save: text('userWorkspace.save'), createTitle: text('userWorkspace.createTitle'), editTitle: text('userWorkspace.editTitle'), required: text('userWorkspace.required'), invalidNumber: text('userWorkspace.invalidNumber'), systemDelete: text('userWorkspace.systemDelete'), saveError: text('userWorkspace.saveError'), saved: text('userWorkspace.saved'), loading: text('userWorkspace.loading'), empty: text('userWorkspace.empty'), loadError: text('userWorkspace.loadError') };
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [accessLevels, setAccessLevels] = useState<RecordValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<UserForm>({ ...emptyUserForm });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteRows, setDeleteRows] = useState<RecordValue[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [userResponse, accessResponse] = await Promise.all([userApi.list(), userApi.getAccessLevels()]);
      const loadedRows = asRows(userResponse);
      setRows(loadedRows);
      setAccessLevels(asRows(accessResponse));
      setSelectedId((current) => loadedRows.some((row, index) => Number(recordValue(row, 'Id') ?? index) === current) ? current : null);
      setSelectedIds((current) => current.filter((id) => loadedRows.some((row, index) => Number(recordValue(row, 'Id') ?? index) === id)));
    } catch {
      setRows([]);
      setError(copy.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [language]);

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...emptyUserForm });
    setMessage('');
    setEditorOpen(true);
  };

  const edit = (row: RecordValue) => {
    const id = Number(recordValue(row, 'Id') ?? 0);
    setEditingId(id);
    setMessage('');
    setForm({
      Id: id,
      UserName: String(recordValue(row, 'UserName') ?? ''),
      UserPass: '',
      StoredUserPass: String(recordValue(row, 'UserPass') ?? ''),
      FirstName: String(recordValue(row, 'FirstName') ?? ''),
      LastName: String(recordValue(row, 'LastName') ?? ''),
      FatherName: String(recordValue(row, 'FatherName') ?? ''),
      NationalCode: String(recordValue(row, 'NationalCode') ?? ''),
      Address: String(recordValue(row, 'Address') ?? ''),
      Description: String(recordValue(row, 'Description') ?? ''),
      TellNumber: String(recordValue(row, 'TellNumber') ?? ''),
      PhonNumber: String(recordValue(row, 'PhonNumber') ?? ''),
      UserAccessLevelId: String(recordValue(row, 'UserAccessLevelId') ?? ''),
      UserType: String(recordValue(row, 'UserType') ?? ''),
      IsActive: Boolean(recordValue(row, 'IsActive')),
      IsSystemType: Boolean(recordValue(row, 'IsSystemType')),
    });
    setEditorOpen(true);
  };

  const save = async () => {
    if (!form.UserName.trim() || (!editingId && !form.UserPass) || !form.UserAccessLevelId || !form.UserType) {
      setMessage(copy.required);
      return;
    }
    if ((form.TellNumber && !/^\d+$/.test(form.TellNumber)) || (form.PhonNumber && !/^\d+$/.test(form.PhonNumber))) {
      setMessage(copy.invalidNumber);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await userApi.save({
        Id: form.Id,
        UserName: form.UserName.trim(),
        ...(form.UserPass || form.StoredUserPass ? { UserPass: form.UserPass ? encryptLegacyPassword(form.UserPass) : form.StoredUserPass, UserPassEncrypted: true } : {}),
        FirstName: form.FirstName,
        LastName: form.LastName,
        FatherName: form.FatherName,
        NationalCode: form.NationalCode,
        Address: form.Address,
        Description: form.Description,
        TellNumber: Number(form.TellNumber) || 0,
        PhonNumber: Number(form.PhonNumber) || 0,
        UserAccessLevelId: Number(form.UserAccessLevelId),
        UserType: Number(form.UserType),
        IsActive: form.IsActive,
        IsSystemType: form.IsSystemType,
        PersistOn: new Date().toISOString(),
      });
      await load();
      setMessage(copy.saved);
      setEditorOpen(false);
      setEditingId(null);
      setForm({ ...emptyUserForm });
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
      for (const row of deleteRows) await userApi.remove(Number(recordValue(row, 'Id')));
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

  const labels: UserFormLabels = {
    saved: copy.saved,
    name: text('userWorkspace.name'), password: text('userWorkspace.password'), accessLevel: text('userWorkspace.accessLevel'), userType: text('userWorkspace.userType'), firstName: text('userWorkspace.firstName'), lastName: text('userWorkspace.lastName'), fatherName: text('userWorkspace.fatherName'), nationalCode: text('userWorkspace.nationalCode'), telephone: text('userWorkspace.telephone'), mobile: text('userWorkspace.mobile'), address: text('userWorkspace.address'), description: text('userWorkspace.description'), disable: text('userWorkspace.disable'), accessTitle: text('userWorkspace.accessTitle'), personalTitle: text('userWorkspace.personalTitle'),
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => void load()} toolbar={<><Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip><Tooltip title={copy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.edit} onClick={() => { const row = rows.find((item, index) => Number(recordValue(item, 'Id') ?? index) === selectedId); if (row) edit(row); }} disabled={!selectedId || selectedIds.length > 1}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={copy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={copy.remove} onClick={requestRemove} disabled={selectedIds.length === 0}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></>}>
      <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving} maxWidth="lg" direction={language === 'fa' ? 'rtl' : 'ltr'}>
        <UserFormFields form={form} setForm={setForm} message={message} editingId={editingId} accessLevels={accessLevels} userTypes={userTypeOptions} language={language} labels={labels} />
      </CrudDialog>
      <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
        <AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => Number(recordValue(row, 'Id') ?? index)} selectedKey={selectedId} selectedKeys={selectedIds} isRowSelectable={(row) => !Boolean(recordValue(row, 'IsSystemType'))} onSelectionChange={(keys) => { const ids = keys.map(Number); setSelectedIds(ids); setSelectedId(ids.length === 1 ? ids[0] : null); }} onRowClick={(row, index) => { const id = Number(recordValue(row, 'Id') ?? index); setSelectedId(id); setSelectedIds([id]); }} onRowDoubleClick={(row) => edit(row)} columns={[
          { key: 'UserName', label: labels.name, render: (row) => String(recordValue(row, 'UserName') ?? '—') },
          { key: 'Name', label: text('userWorkspace.fullName'), render: (row) => `${String(recordValue(row, 'FirstName') ?? '')} ${String(recordValue(row, 'LastName') ?? '')}`.trim() || '—' },
          { key: 'AccessLevel', label: labels.accessLevel, render: (row) => { const levelId = String(recordValue(row, 'UserAccessLevelId') ?? ''); const level = accessLevels.find((item) => String(recordValue(item, 'Id') ?? '') === levelId); return String(recordValue(level ?? {}, 'Name') ?? recordValue(level ?? {}, 'Title') ?? '—'); } },
          { key: 'UserType', label: labels.userType, render: (row) => { const option = userTypeOptions.find((item) => item.value === String(recordValue(row, 'UserType') ?? '')); const labelsByType = [text('userWorkspace.operator'), text('userWorkspace.parkban'), text('userWorkspace.driver'), text('userWorkspace.exitPermission')]; return option ? labelsByType[Number(option.value)] ?? '—' : '—'; } },
          { key: 'IsActive', label: text('userWorkspace.status'), trueLabel: text('userWorkspace.active'), falseLabel: text('userWorkspace.inactive') },
        ]} />
      </ResourceState>
      <ConfirmDialog open={deleteDialogOpen} title={copy.remove} message={deleteRows.length > 1 ? i18n.t('users.deleteManyConfirm', { count: deleteRows.length, lng: language }) : i18n.t('users.deleteConfirm', { lng: language })} cancelLabel={copy.cancel} confirmLabel={copy.remove} busy={deleting} onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteRows([]); } }} onConfirm={() => void confirmRemove()} />
    </ManagementWorkspaceFrame>
  );
}
