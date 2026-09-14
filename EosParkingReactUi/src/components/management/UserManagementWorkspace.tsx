import { useEffect, useState } from 'react';
import { Alert, IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { encryptLegacyPassword } from '../../api/client';
import { userApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { AppDataGrid } from '../AppDataGrid';
import { UserFormFields, type UserFormLabels } from './UserFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, emptyUserForm, recordValue, type Language, type RecordValue, type UserForm, userTypeOptions } from './managementTypes';

type Props = { title: string; pageTitle?: string; language: Language };

function copyFor(language: Language) {
  return language === 'fa'
    ? { add: 'کاربر جدید', edit: 'ویرایش کاربر', remove: 'حذف کاربر', removeConfirm: 'آیا از حذف این کاربر مطمئن هستید؟', cancel: 'انصراف', save: 'ذخیره کاربر', createTitle: 'افزودن کاربر', editTitle: 'ویرایش کاربر', required: 'نام کاربری، کلمه عبور، سطح دسترسی و نوع کاربری الزامی است.', invalidNumber: 'تلفن و همراه باید عددی باشند.', systemDelete: 'امکان حذف کاربر سیستمی وجود ندارد.', saveError: 'ذخیره کاربر ناموفق بود.', saved: 'کاربر با موفقیت ذخیره شد.' }
    : { add: 'New user', edit: 'Edit user', remove: 'Delete user', removeConfirm: 'Are you sure you want to delete this user?', cancel: 'Cancel', save: 'Save user', createTitle: 'Add user', editTitle: 'Edit user', required: 'Username, password, access level and user type are required.', invalidNumber: 'Telephone and mobile must be numeric.', systemDelete: 'System users cannot be deleted.', saveError: 'Saving the user failed.', saved: 'User saved successfully.' };
}

export function UserManagementWorkspace({ title, pageTitle, language }: Props) {
  const copy = copyFor(language);
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
      setError(language === 'fa' ? 'دریافت اطلاعات کاربران از API ناموفق بود.' : 'Loading users from the API failed.');
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

  const remove = async () => {
    const removable = rows.filter((row, index) => selectedIds.includes(Number(recordValue(row, 'Id') ?? index)) && !Boolean(recordValue(row, 'IsSystemType')) && Number(recordValue(row, 'Id') ?? 0) > 0);
    if (removable.length === 0) {
      setError(copy.systemDelete);
      return;
    }
    const confirmation = removable.length > 1 ? (language === 'fa' ? `آیا از حذف ${removable.length} کاربر انتخاب‌شده مطمئن هستید؟` : `Delete ${removable.length} selected users?`) : copy.removeConfirm;
    if (!window.confirm(confirmation)) return;
    try {
      for (const row of removable) await userApi.remove(Number(recordValue(row, 'Id')));
      setSelectedId(null);
      setSelectedIds([]);
      await load();
    } catch {
      setError(copy.saveError);
    }
  };

  const labels: UserFormLabels = {
    saved: copy.saved,
    name: language === 'fa' ? 'نام کاربری' : 'Username',
    password: language === 'fa' ? 'کلمه عبور' : 'Password',
    accessLevel: language === 'fa' ? 'سطح دسترسی' : 'Access level',
    userType: language === 'fa' ? 'نوع کاربری' : 'User type',
    firstName: language === 'fa' ? 'نام' : 'First name',
    lastName: language === 'fa' ? 'نام خانوادگی' : 'Last name',
    fatherName: language === 'fa' ? 'نام پدر' : 'Father name',
    nationalCode: language === 'fa' ? 'کد ملی' : 'National code',
    telephone: language === 'fa' ? 'تلفن' : 'Telephone',
    mobile: language === 'fa' ? 'همراه' : 'Mobile',
    address: language === 'fa' ? 'آدرس' : 'Address',
    description: language === 'fa' ? 'توضیحات' : 'Description',
    disable: language === 'fa' ? 'غیرفعال شود' : 'Disable user',
    accessTitle: language === 'fa' ? 'مشخصات ورود و دسترسی' : 'Login and access',
    personalTitle: language === 'fa' ? 'مشخصات فردی و تماس' : 'Personal and contact information',
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${language === 'fa' ? 'رکورد' : 'records'}`} language={language} loading={loading} onRefresh={() => void load()} toolbar={<><Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip><Tooltip title={copy.edit} arrow><span><IconButton className="workspace-toolbar-icon-button" aria-label={copy.edit} onClick={() => { const row = rows.find((item, index) => Number(recordValue(item, 'Id') ?? index) === selectedId); if (row) edit(row); }} disabled={!selectedId || selectedIds.length > 1}><EditRoundedIcon /></IconButton></span></Tooltip><Tooltip title={copy.remove} arrow><span><IconButton className="workspace-toolbar-icon-button" color="error" aria-label={copy.remove} onClick={() => void remove()} disabled={selectedIds.length === 0}><DeleteOutlineRoundedIcon /></IconButton></span></Tooltip></>}>
      <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving} maxWidth="lg">
        <UserFormFields form={form} setForm={setForm} message={message} editingId={editingId} accessLevels={accessLevels} userTypes={userTypeOptions} language={language} labels={labels} />
      </CrudDialog>
      <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={language === 'fa' ? 'در حال دریافت اطلاعات...' : 'Loading...'} emptyLabel={language === 'fa' ? 'رکوردی برای نمایش وجود ندارد.' : 'No records to display.'}>
        <AppDataGrid direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => Number(recordValue(row, 'Id') ?? index)} selectedKey={selectedId} selectedKeys={selectedIds} isRowSelectable={(row) => !Boolean(recordValue(row, 'IsSystemType'))} onSelectionChange={(keys) => { const ids = keys.map(Number); setSelectedIds(ids); setSelectedId(ids.length === 1 ? ids[0] : null); }} onRowClick={(row, index) => { const id = Number(recordValue(row, 'Id') ?? index); setSelectedId(id); setSelectedIds([id]); }} columns={[
          { key: 'UserName', label: labels.name, render: (row) => String(recordValue(row, 'UserName') ?? '—') },
          { key: 'Name', label: language === 'fa' ? 'نام و نام خانوادگی' : 'Name', render: (row) => `${String(recordValue(row, 'FirstName') ?? '')} ${String(recordValue(row, 'LastName') ?? '')}`.trim() || '—' },
          { key: 'AccessLevel', label: labels.accessLevel, render: (row) => { const levelId = String(recordValue(row, 'UserAccessLevelId') ?? ''); const level = accessLevels.find((item) => String(recordValue(item, 'Id') ?? '') === levelId); return String(recordValue(level ?? {}, 'Name') ?? recordValue(level ?? {}, 'Title') ?? '—'); } },
          { key: 'UserType', label: labels.userType, render: (row) => { const option = userTypeOptions.find((item) => item.value === String(recordValue(row, 'UserType') ?? '')); return option ? (language === 'fa' ? option.fa : option.en) : '—'; } },
          { key: 'IsActive', label: language === 'fa' ? 'وضعیت' : 'Status', render: (row) => { const active = Boolean(recordValue(row, 'IsActive')); const label = active ? (language === 'fa' ? 'فعال' : 'Active') : (language === 'fa' ? 'غیرفعال' : 'Inactive'); return <Tooltip title={label} arrow>{active ? <CheckCircleOutlineRoundedIcon className="status-grid-icon status-grid-icon-active" aria-label={label} fontSize="small" /> : <CloseRoundedIcon className="status-grid-icon status-grid-icon-inactive" aria-label={label} fontSize="small" />}</Tooltip>; } },
        ]} />
      </ResourceState>
    </ManagementWorkspaceFrame>
  );
}
