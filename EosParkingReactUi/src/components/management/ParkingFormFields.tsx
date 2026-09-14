import type { Dispatch, SetStateAction } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { AppGroupBox } from '../AppGroupBox';

export type ParkingFormState = {
  ParkingName: string; Address: string; PhonNumber: string; TaxRate: string; CostOfCard: string;
  MaxTransferCredit: string; MinOfHostelryHours: string; MinOfNotFoundEnterCar: string;
  HasHostelryTariff: boolean; HasBillControl: boolean; RoundingMoneyBorder: string; RoundingMoneyValue: string;
  Shift1FromTime: string; Shift1ToTime: string; Shift2FromTime: string; Shift2ToTime: string; Shift3FromTime: string; Shift3ToTime: string;
};
export type ParkingFormCopy = {
  name: string; address: string; phone: string; tax: string; cardCost: string; credit: string; hostelry: string;
  minHostelry: string; minUnknown: string; billControl: string; roundingBorder: string; roundingValue: string;
  shift1: string; shift2: string; shift3: string; from: string; to: string; saved: string;
};

type Props = { form: ParkingFormState; setForm: Dispatch<SetStateAction<ParkingFormState>>; copy: ParkingFormCopy; saveMessage: string; language: 'fa' | 'en' };

export function ParkingFormFields({ form, setForm, copy, saveMessage, language }: Props) {
  return <Box className="form-section-column">
    {saveMessage && <Alert severity={saveMessage === copy.saved ? 'success' : 'error'}>{saveMessage}</Alert>}
    <AppGroupBox title={language === 'fa' ? 'مشخصات' : 'Information'}>
      <Box className="parking-form-fields">
        <TextField label={copy.name} value={form.ParkingName} onChange={(event) => setForm({ ...form, ParkingName: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} required autoFocus />
        <TextField label={copy.address} value={form.Address} onChange={(event) => setForm({ ...form, Address: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} />
        <TextField label={copy.phone} value={form.PhonNumber} onChange={(event) => setForm({ ...form, PhonNumber: event.target.value })} slotProps={{ htmlInput: { maxLength: 15 } }} />
      </Box>
    </AppGroupBox>
    <AppGroupBox title={language === 'fa' ? 'تنظیمات' : 'Settings'}>
      <Box className="parking-form-fields">
        <TextField label={copy.tax} type="number" value={form.TaxRate} onChange={(event) => setForm({ ...form, TaxRate: event.target.value })} slotProps={{ htmlInput: { maxLength: 3, min: 0 } }} />
        <TextField label={copy.cardCost} type="number" value={form.CostOfCard} onChange={(event) => setForm({ ...form, CostOfCard: event.target.value })} />
        <TextField label={copy.credit} type="number" value={form.MaxTransferCredit} onChange={(event) => setForm({ ...form, MaxTransferCredit: event.target.value })} />
        <TextField label={copy.minUnknown} type="number" value={form.MinOfNotFoundEnterCar} onChange={(event) => setForm({ ...form, MinOfNotFoundEnterCar: event.target.value })} />
        <TextField label={copy.roundingBorder} type="number" value={form.RoundingMoneyBorder} onChange={(event) => setForm({ ...form, RoundingMoneyBorder: event.target.value })} />
        <TextField label={copy.roundingValue} type="number" value={form.RoundingMoneyValue} onChange={(event) => setForm({ ...form, RoundingMoneyValue: event.target.value })} />
        <FormControlLabel control={<Checkbox checked={form.HasHostelryTariff} onChange={(event) => setForm({ ...form, HasHostelryTariff: event.target.checked })} />} label={copy.hostelry} />
        <TextField label={copy.minHostelry} type="number" disabled={!form.HasHostelryTariff} value={form.MinOfHostelryHours} onChange={(event) => setForm({ ...form, MinOfHostelryHours: event.target.value })} />
        <FormControlLabel control={<Checkbox checked={form.HasBillControl} onChange={(event) => setForm({ ...form, HasBillControl: event.target.checked })} />} label={copy.billControl} />
      </Box>
    </AppGroupBox>
    <AppGroupBox title={language === 'fa' ? 'شیفت‌ها' : 'Shifts'} className="parking-shifts">
      <Typography variant="subtitle2">{copy.shift1}</Typography>
      <Box className="parking-shift-row"><TextField label={copy.from} type="time" value={form.Shift1FromTime} onChange={(event) => setForm({ ...form, Shift1FromTime: event.target.value })} required /><TextField label={copy.to} type="time" value={form.Shift1ToTime} onChange={(event) => setForm({ ...form, Shift1ToTime: event.target.value })} required /></Box>
      <Typography variant="subtitle2">{copy.shift2}</Typography>
      <Box className="parking-shift-row"><TextField label={copy.from} type="time" value={form.Shift2FromTime} onChange={(event) => setForm({ ...form, Shift2FromTime: event.target.value })} /><TextField label={copy.to} type="time" value={form.Shift2ToTime} onChange={(event) => setForm({ ...form, Shift2ToTime: event.target.value })} /></Box>
      <Typography variant="subtitle2">{copy.shift3}</Typography>
      <Box className="parking-shift-row"><TextField label={copy.from} type="time" disabled={!form.Shift2FromTime || !form.Shift2ToTime} value={form.Shift3FromTime} onChange={(event) => setForm({ ...form, Shift3FromTime: event.target.value })} /><TextField label={copy.to} type="time" disabled={!form.Shift2FromTime || !form.Shift2ToTime} value={form.Shift3ToTime} onChange={(event) => setForm({ ...form, Shift3ToTime: event.target.value })} /></Box>
    </AppGroupBox>
  </Box>;
}
