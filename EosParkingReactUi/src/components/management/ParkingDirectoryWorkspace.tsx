import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { CrudDialog } from '../CrudDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { ParkingDirectoryCard } from './ParkingDirectoryCard';
import { ParkingFormFields, type ParkingFormState } from './ParkingFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, emptyParkingForm, parkingFormFromRow, parkingPayload, type Language, type ParkingForm, type RecordValue } from './managementTypes';
import { parkingCopy, validateParkingForm } from './parkingCopy';
import i18n from '../../i18n/instance';
import { parkingSettingsChangedEvent } from '../../features/home/parkingSelectionService';

type Props = { title: string; pageTitle?: string; language: Language };

export function ParkingDirectoryWorkspace({ title, pageTitle, language }: Props) {
  const copy = parkingCopy(language);
  const text = i18n.getFixedT(language);
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ParkingForm>({ ...emptyParkingForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteRow, setDeleteRow] = useState<RecordValue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(asRows(await parkingApi.list()));
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? text('readonlyModule.forbidden') : text('readonlyModule.loadError'));
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
      window.dispatchEvent(new Event(parkingSettingsChangedEvent));
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

  const requestRemove = (row: RecordValue) => {
    const id = Number(row.Id ?? row.id ?? 0);
    if (!id) return;
    setDeleteRow(row);
    setDeleteDialogOpen(true);
  };

  const confirmRemove = async () => {
    const id = Number(deleteRow?.Id ?? deleteRow?.id ?? 0);
    if (!id) return;
    setDeleting(true);
    setError('');
    try {
      await parkingApi.remove(id);
      await load();
      setDeleteDialogOpen(false);
      setDeleteRow(null);
    } catch {
      setError(copy.saveError);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => void load()} toolbar={<Tooltip title={copy.add} arrow><IconButton className="workspace-toolbar-icon-button" color="primary" aria-label={copy.add} onClick={startCreate}><AddRoundedIcon /></IconButton></Tooltip>}>
      <Box className="workspace-resource-content">
        <CrudDialog open={editorOpen} title={editingId ? copy.editTitle : copy.createTitle} onClose={() => setEditorOpen(false)} onConfirm={() => void save()} cancelLabel={copy.cancel} confirmLabel={copy.save} busy={saving} direction={language === 'fa' ? 'rtl' : 'ltr'}>
          <ParkingFormFields form={form} setForm={updateForm} copy={copy} saveMessage={message} language={language} />
        </CrudDialog>
        <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={text('readonlyModule.loading')} emptyLabel={text('readonlyModule.empty')}>
          <Box className="parking-directory-list">{rows.map((row, index) => {
            const id = Number(row.Id ?? row.id ?? index);
            return <ParkingDirectoryCard key={id} id={id} row={row} language={language} onEdit={() => edit(row)} onRemove={() => requestRemove(row)} />;
          })}</Box>
        </ResourceState>
      </Box>
      <ConfirmDialog open={deleteDialogOpen} title={copy.remove} message={i18n.t('parking.deleteConfirm', { lng: language })} cancelLabel={copy.cancel} confirmLabel={copy.remove} busy={deleting} onClose={() => { if (!deleting) { setDeleteDialogOpen(false); setDeleteRow(null); } }} onConfirm={() => void confirmRemove()} />
    </ManagementWorkspaceFrame>
  );
}
