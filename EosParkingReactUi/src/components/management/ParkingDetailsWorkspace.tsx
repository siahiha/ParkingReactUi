import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Box, Button } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { ParkingFormFields, type ParkingFormState } from './ParkingFormFields';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { emptyParkingForm, parkingFormFromRow, parkingPayload, type Language, type ParkingForm, type RecordValue } from './managementTypes';
import { parkingCopy, validateParkingForm } from './parkingCopy';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };

export function ParkingDetailsWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const copy = parkingCopy(language);
  const [form, setForm] = useState<ParkingForm>({ ...emptyParkingForm, Id: parkingId });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await parkingApi.getById(parkingId);
      const row = response && typeof response === 'object' && !Array.isArray(response)
        ? ((response as Record<string, unknown>).Values ?? (response as Record<string, unknown>).values ?? (response as Record<string, unknown>).Data ?? response)
        : response;
      const record = Array.isArray(row) ? row[0] : row;
      if (record && typeof record === 'object') setForm(parkingFormFromRow(record as RecordValue, parkingId));
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? (language === 'fa' ? 'دسترسی مشاهده‌ی این بخش برای کاربر فعلی مجاز نیست.' : 'The current user is not allowed to view this module.') : (language === 'fa' ? 'دریافت اطلاعات پارکینگ ناموفق بود.' : 'Loading parking details failed.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [parkingId, language]);

  const updateForm: Dispatch<SetStateAction<ParkingFormState>> = (next) => setForm((current) => {
    const value = typeof next === 'function' ? next(current) : next;
    return { ...current, ...value };
  });

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
    } catch {
      setMessage(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={language === 'fa' ? 'تنظیمات پارکینگ' : 'Parking settings'} language={language} loading={loading} onRefresh={() => void load()}>
      <ResourceState loading={loading} error={error} empty={false} loadingLabel={language === 'fa' ? 'در حال دریافت اطلاعات...' : 'Loading...'} emptyLabel="">
        <Box className="workspace-resource-content"><ParkingFormFields form={form} setForm={updateForm} copy={copy} saveMessage={message} language={language} /><Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => void save()} disabled={saving} aria-busy={saving}>{copy.save}</Button></Box>
      </ResourceState>
    </ManagementWorkspaceFrame>
  );
}
