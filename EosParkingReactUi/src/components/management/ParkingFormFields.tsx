import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, Tab, Tabs, TextField, Typography } from '@mui/material';
import { AppGroupBox } from '../AppGroupBox';
import { MoneyTextField } from '../MoneyTextField';
import { EosTimeOnDayPicker } from '../EosTimeOnDayPicker';
import { nextMinuteTime } from './managementTypes';

export type ParkingFormState = {
  Id: number; ParkingName: string; IsCommercialParking: boolean; HasUserShifts: boolean; IsShift2Enabled: boolean; IsShift3Enabled: boolean; Address: string; PhonNumber: string; TaxRate: string; CostOfCard: string;
  MaxTransferCredit: string; MinOfHostelryHours: string; MinOfNotFoundEnterCar: string;
  HasHostelryTariff: boolean; HasBillControl: boolean; RoundingMoneyBorder: string; RoundingMoneyValue: string;
  Shift1FromTime: string; Shift1ToTime: string; Shift2FromTime: string; Shift2ToTime: string; Shift3FromTime: string; Shift3ToTime: string;
};
export type ParkingFormCopy = {
  tabs: string; informationTab: string; settingsTab: string; shiftsTab: string; commercialParking: string; userShifts: string;
  name: string; address: string; phone: string; tax: string; cardCost: string; credit: string; hostelry: string;
  minHostelry: string; minUnknown: string; billControl: string; roundingBorder: string; roundingValue: string;
  shift1: string; shift2: string; shift3: string; from: string; to: string; saved: string;
};

type Props = { form: ParkingFormState; setForm: Dispatch<SetStateAction<ParkingFormState>>; copy: ParkingFormCopy; saveMessage: string; language: 'fa' | 'en'; layout?: 'tabs' | 'sections' };
type ShiftNumber = 1 | 2 | 3;
type ShiftPart = 'From' | 'To';
type ShiftTimeField = `Shift${ShiftNumber}${ShiftPart}Time`;

function timeToSeconds(value: string): number | null {
  const match = /^(\d{2}):([0-5]\d)$/.exec(value);
  if (!match || Number(match[1]) > 23) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60;
}

function secondsToTime(value: number | null): string {
  if (value === null) return '';
  const minutes = Math.floor(value / 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function ParkingFormFields({ form, setForm, copy, saveMessage, language, layout = 'tabs' }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const showSections = layout === 'sections';
  const settingsDisabled = !form.IsCommercialParking;
  const shiftsDisabled = !form.HasUserShifts;

  const updateShiftTime = (shift: ShiftNumber, part: ShiftPart, value: number | null) => {
    const field = `Shift${shift}${part}Time` as ShiftTimeField;
    const nextTime = secondsToTime(value);
    setForm((current) => {
      const updated = { ...current, [field]: nextTime };
      if (shift === 1 && current.IsShift2Enabled) updated.Shift2FromTime = nextMinuteTime(updated.Shift1ToTime);
      if (shift === 2 && part === 'To' && current.IsShift3Enabled) updated.Shift3FromTime = nextMinuteTime(updated.Shift2ToTime);
      return updated;
    });
  };

  const toggleOptionalShift = (shift: 2 | 3, enabled: boolean) => {
    setForm((current) => {
      if (shift === 2) {
        return {
          ...current,
          IsShift2Enabled: enabled,
          Shift2FromTime: enabled ? nextMinuteTime(current.Shift1ToTime) : '',
          Shift2ToTime: '',
          ...(enabled ? {} : { IsShift3Enabled: false, Shift3FromTime: '', Shift3ToTime: '' }),
        };
      }
      return {
        ...current,
        IsShift3Enabled: enabled,
        Shift3FromTime: enabled ? nextMinuteTime(current.Shift2ToTime) : '',
        Shift3ToTime: '',
      };
    });
  };

  useEffect(() => {
    setActiveTab(0);
  }, [form.Id]);

  useEffect(() => {
    if ((activeTab === 1 && !form.IsCommercialParking) || (activeTab === 2 && !form.HasUserShifts)) setActiveTab(0);
  }, [activeTab, form.IsCommercialParking, form.HasUserShifts]);

  return <Box className={`form-section-column${showSections ? ' parking-details-fields' : ''}`}>
    {saveMessage && <Alert severity={saveMessage === copy.saved ? 'success' : 'error'}>{saveMessage}</Alert>}
    {!showSections && <Tabs value={activeTab} onChange={(_event, value: number) => setActiveTab(value)} aria-label={copy.tabs} variant="fullWidth">
      <Tab id="parking-tab-information" aria-controls="parking-tabpanel-information" label={copy.informationTab} />
      <Tab id="parking-tab-settings" aria-controls="parking-tabpanel-settings" label={copy.settingsTab} disabled={!form.IsCommercialParking} />
      <Tab id="parking-tab-shifts" aria-controls="parking-tabpanel-shifts" label={copy.shiftsTab} disabled={!form.HasUserShifts} />
    </Tabs>}
    {(showSections || activeTab === 0) && (
      <Box className="parking-details-information" role={showSections ? 'region' : 'tabpanel'} id="parking-tabpanel-information" aria-labelledby={showSections ? undefined : 'parking-tab-information'} aria-label={showSections ? copy.informationTab : undefined}>
        <AppGroupBox title={copy.informationTab}>
          <Box className="parking-form-fields">
            <TextField label={copy.name} value={form.ParkingName} onChange={(event) => setForm({ ...form, ParkingName: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} required autoFocus />
            <TextField label={copy.address} value={form.Address} onChange={(event) => setForm({ ...form, Address: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} />
            <TextField label={copy.phone} value={form.PhonNumber} onChange={(event) => setForm({ ...form, PhonNumber: event.target.value })} slotProps={{ htmlInput: { maxLength: 15 } }} />
            <FormControlLabel control={<Checkbox checked={form.IsCommercialParking} onChange={(event) => setForm({ ...form, IsCommercialParking: event.target.checked })} />} label={copy.commercialParking} />
            <FormControlLabel control={<Checkbox checked={form.HasUserShifts} onChange={(event) => setForm({ ...form, HasUserShifts: event.target.checked })} />} label={copy.userShifts} />
          </Box>
        </AppGroupBox>
      </Box>
    )}
    {(showSections || (activeTab === 1 && form.IsCommercialParking)) && (
      <Box role={showSections ? 'region' : 'tabpanel'} id="parking-tabpanel-settings" aria-labelledby={showSections ? undefined : 'parking-tab-settings'} aria-label={showSections ? copy.settingsTab : undefined}>
        <AppGroupBox title={copy.settingsTab}>
          <Box className="parking-form-fields">
            <TextField label={copy.tax} disabled={settingsDisabled} type="number" value={form.TaxRate} onChange={(event) => setForm({ ...form, TaxRate: event.target.value })} slotProps={{ htmlInput: { maxLength: 3, min: 0 } }} />
            <MoneyTextField label={copy.cardCost} disabled={settingsDisabled} value={form.CostOfCard} onValueChange={(value) => setForm({ ...form, CostOfCard: value })} />
            <MoneyTextField label={copy.credit} disabled={settingsDisabled} value={form.MaxTransferCredit} onValueChange={(value) => setForm({ ...form, MaxTransferCredit: value })} />
            <MoneyTextField label={copy.minUnknown} disabled={settingsDisabled} value={form.MinOfNotFoundEnterCar} onValueChange={(value) => setForm({ ...form, MinOfNotFoundEnterCar: value })} />
            <MoneyTextField label={copy.roundingBorder} disabled={settingsDisabled} value={form.RoundingMoneyBorder} onValueChange={(value) => setForm({ ...form, RoundingMoneyBorder: value })} />
            <MoneyTextField label={copy.roundingValue} disabled={settingsDisabled} value={form.RoundingMoneyValue} onValueChange={(value) => setForm({ ...form, RoundingMoneyValue: value })} />
            <FormControlLabel control={<Checkbox disabled={settingsDisabled} checked={form.HasHostelryTariff} onChange={(event) => setForm({ ...form, HasHostelryTariff: event.target.checked })} />} label={copy.hostelry} />
            <TextField label={copy.minHostelry} type="number" disabled={settingsDisabled || !form.HasHostelryTariff} value={form.MinOfHostelryHours} onChange={(event) => setForm({ ...form, MinOfHostelryHours: event.target.value })} />
            <FormControlLabel control={<Checkbox disabled={settingsDisabled} checked={form.HasBillControl} onChange={(event) => setForm({ ...form, HasBillControl: event.target.checked })} />} label={copy.billControl} />
          </Box>
        </AppGroupBox>
      </Box>
    )}
    {(showSections || (activeTab === 2 && form.HasUserShifts)) && (
      <Box role={showSections ? 'region' : 'tabpanel'} id="parking-tabpanel-shifts" aria-labelledby={showSections ? undefined : 'parking-tab-shifts'} aria-label={showSections ? copy.shiftsTab : undefined}>
        <AppGroupBox title={copy.shiftsTab} className="parking-shifts">
          <Typography variant="subtitle2">{copy.shift1}</Typography>
          <Box className="parking-shift-row"><EosTimeOnDayPicker label={copy.from} disabled={shiftsDisabled} value={timeToSeconds(form.Shift1FromTime)} onChange={(value) => updateShiftTime(1, 'From', value)} unit="seconds" language={language} required /><EosTimeOnDayPicker label={copy.to} disabled={shiftsDisabled} value={timeToSeconds(form.Shift1ToTime)} onChange={(value) => updateShiftTime(1, 'To', value)} unit="seconds" language={language} required /></Box>
          <FormControlLabel control={<Checkbox disabled={shiftsDisabled} checked={form.IsShift2Enabled} onChange={(event) => toggleOptionalShift(2, event.target.checked)} />} label={copy.shift2} />
          <Box className="parking-shift-row"><EosTimeOnDayPicker label={copy.from} disabled={shiftsDisabled || !form.IsShift2Enabled} value={timeToSeconds(form.Shift2FromTime)} onChange={(value) => updateShiftTime(2, 'From', value)} unit="seconds" language={language} /><EosTimeOnDayPicker label={copy.to} disabled={shiftsDisabled || !form.IsShift2Enabled} value={timeToSeconds(form.Shift2ToTime)} onChange={(value) => updateShiftTime(2, 'To', value)} unit="seconds" language={language} /></Box>
          <FormControlLabel control={<Checkbox checked={form.IsShift3Enabled} disabled={shiftsDisabled || (!form.IsShift3Enabled && (!form.IsShift2Enabled || !form.Shift2FromTime || !form.Shift2ToTime))} onChange={(event) => toggleOptionalShift(3, event.target.checked)} />} label={copy.shift3} />
          <Box className="parking-shift-row"><EosTimeOnDayPicker label={copy.from} disabled={shiftsDisabled || !form.IsShift3Enabled} value={timeToSeconds(form.Shift3FromTime)} onChange={(value) => updateShiftTime(3, 'From', value)} unit="seconds" language={language} /><EosTimeOnDayPicker label={copy.to} disabled={shiftsDisabled || !form.IsShift3Enabled} value={timeToSeconds(form.Shift3ToTime)} onChange={(value) => updateShiftTime(3, 'To', value)} unit="seconds" language={language} /></Box>
        </AppGroupBox>
      </Box>
    )}
  </Box>;
}
