import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { AppRecordCard } from '../AppRecordCard';
import { ParkingFormFields, type ParkingFormState } from './ParkingFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, emptyParkingForm, parkingFormFromRow, parkingPayload, type Language, type ParkingForm, type RecordValue } from './managementTypes';
import { parkingCopy, validateParkingForm } from './parkingCopy';

type Props = { title: string; pageTitle?: string; language: Language };

export function ParkingDirectoryWorkspace({ title, pageTitle, language }: Props) {
  const copy = parkingCopy(language);
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ParkingForm>({ ...emptyParkingForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(asRows(await parkingApi.list()));
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? (language === 'fa' ? 'دسترسی مشاهده‌ی این بخش برای کاربر فعلی مجاز نیست.' : 'The current user is not allowed to view this module.') : (language === 'fa' ? 'دریافت اطلاعات پارکینگ‌ها ناموفق بود.' : 'Loading parking records failed.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [language]);

  const updateForm: Dispatch<SetStateAction<ParkingFormState>> = (next) => setForm((current) => {
    const value = typeof next === 'function' ? next(current) : next;
    return { ...current, ...value };
  });

  const startCreate = () => {
    setEditingId(null);
    setForm({ ...emptyParkingForm });
    setMessage('');
    setEditorOpen(true);
  };

  const edit = (row: RecordValue) => {
    const next = parkingFormFromRow(row, 0);
    setEditingId(next.Id);
    setForm(next);
    setMessage('');
    setEditorOpen(true);
  };

  const save = async () => {
    const validationError = validateParkingForm(form, copy);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await parkingApi.save(parkingPayload(form));
      setMessage(copy.saved);
      await load();
      setEditingId(null);
      setForm({ ...emptyParkingForm });
      setEditorOpen(false);
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: RecordValue) => {
    const id = Number(row.Id ?? row.id ?? 0);
    if (!id || !window.confirm(copy.removeConfirm)) return;
    setError('');
    try {
      await parkingApi.remove(id);
      await load();
    } catch {
      setError(copy.saveError);
    }
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={`${rows.length} ${language === 'fa' ? 'رکورد' : 'records'}`} language={language} loading={loading} onRefresh={() => void load()} toolbar={<Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip>}>
      <Box className="workspace-resource-content">
        <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving}>
          <ParkingFormFields form={form} setForm={updateForm} copy={copy} saveMessage={message} language={language} />
        </CrudDialog>
        <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={language === 'fa' ? 'در حال دریافت اطلاعات...' : 'Loading...'} emptyLabel={language === 'fa' ? 'رکوردی برای نمایش وجود ندارد.' : 'No records to display.'}>
          <Box className="parking-directory-list">{rows.map((row, index) => {
            const id = Number(row.Id ?? row.id ?? index);
            return <AppRecordCard key={id} className="parking-directory-card" contentClassName="parking-card-content" actionsClassName="parking-card-actions" actions={<><Tooltip title={copy.edit}><IconButton aria-label={copy.edit} onClick={() => edit(row)}><EditRoundedIcon /></IconButton></Tooltip><Tooltip title={copy.remove}><IconButton color="error" aria-label={copy.remove} onClick={() => void remove(row)}><DeleteOutlineRoundedIcon /></IconButton></Tooltip></>}>
              <Typography variant="h6" className="parking-card-title">{String(row.ParkingName ?? row.parkingName ?? (language === 'fa' ? 'پارکینگ بدون نام' : 'Unnamed parking'))}</Typography>
              <Typography variant="body2" color="text.secondary" className="parking-card-address">{String(row.Address ?? row.address ?? '—')}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box className="parking-card-meta"><Box className="parking-card-info-item"><LocalPhoneRoundedIcon /><Box><Typography variant="caption">{copy.phone}</Typography><Typography variant="body2">{String(row.PhonNumber ?? row.phonNumber ?? '—')}</Typography></Box></Box><Box className="parking-card-info-item"><TagRoundedIcon /><Box><Typography variant="caption">{language === 'fa' ? 'شناسه' : 'ID'}</Typography><Typography variant="body2">{id}</Typography></Box></Box></Box>
            </AppRecordCard>;
          })}</Box>
        </ResourceState>
      </Box>
    </ManagementWorkspaceFrame>
  );
}
