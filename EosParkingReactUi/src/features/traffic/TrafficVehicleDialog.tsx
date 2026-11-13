import { useEffect, useState } from 'react';
import { Alert, Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppPopup } from '../../components/AppPopup';
import { IranianPlateInput, isValidIranianPlate, type VehiclePlateType } from '../../components/IranianPlateInput';
import type { Language } from '../../i18n/instance';
import type { VehicleDraft } from './trafficIdentityService';

type Props = { draft: VehicleDraft | null; editing: boolean; language: Language; busy: boolean; error: string; onClose: () => void; onSave: (draft: VehicleDraft) => void };
export function TrafficVehicleDialog({ draft, editing, language, busy, error, onClose, onSave }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const [form, setForm] = useState<VehicleDraft>({ plate: '', name: '', carType: 0, color: '', model: '' });
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { if (draft) { setForm(draft); setInvalid(false); } }, [draft]);
  const save = () => {
    if (!isValidIranianPlate(form.plate, String(form.carType) as VehiclePlateType) || !form.name.trim()) { setInvalid(true); return; }
    onSave({ ...form, name: form.name.trim(), color: form.color.trim(), model: form.model.trim() });
  };
  return <AppPopup open={Boolean(draft)} title={t(editing ? 'trafficIdentity.editVehicle' : 'trafficIdentity.addVehicle')}
    onClose={onClose} onConfirm={save} busy={busy} maxWidth="sm" confirmLabel={t('trafficIdentity.saveVehicle')}>
    <Box sx={{ display: 'grid', gap: 1.5, pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {invalid && <Alert severity="error">{t('trafficIdentity.vehicleRequired')}</Alert>}
      <Box>
        <IranianPlateInput language={language} label={t('trafficGrid.plate')} value={form.plate} carType={String(form.carType) as VehiclePlateType} disabled={editing || busy}
          onChange={plate => setForm(previous => ({ ...previous, plate }))}
          onCarTypeChange={carType => setForm(previous => ({ ...previous, carType: Number(carType) }))} />
      </Box>
      <TextField size="small" required label={t('trafficIdentity.vehicleName')} value={form.name} disabled={busy}
        slotProps={{ htmlInput: { maxLength: 15 } }} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} />
      <TextField size="small" label={t('trafficIdentity.color')} value={form.color} disabled={busy} onChange={event => setForm(previous => ({ ...previous, color: event.target.value }))} />
      <TextField size="small" label={t('trafficIdentity.model')} value={form.model} disabled={busy} onChange={event => setForm(previous => ({ ...previous, model: event.target.value }))} />
    </Box>
  </AppPopup>;
}
