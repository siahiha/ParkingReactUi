import '../../i18n/instance';
import { useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { parkingApi } from '../../api/management';
import { ParkingDetailsWorkspace } from './ParkingDetailsWorkspace';
import { ParkingFormFields } from './ParkingFormFields';
import { parkingCopy } from './parkingCopy';
import { emptyParkingForm } from './managementTypes';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const row = { Id: 7, ParkingName: 'پارکینگ مرکزی', Address: 'خیابان اصلی', PhonNumber: '02112345678', IsCommercialParking: true, HasUserShifts: true, TaxRate: 9, Shift1FromTime: '07:00:00', Shift1ToTime: '15:00:00' };
const copy = parkingCopy('fa');

function renderDetails(flags = {}) {
  vi.spyOn(parkingApi, 'getById').mockResolvedValue({ Values: { ...row, ...flags } });
  render(<ThemeProvider theme={appTheme}><LocalizationProvider dateAdapter={AdapterDayjs}><ParkingDetailsWorkspace title="مشخصات پارکینگ" parkingId={7} language="fa" /></LocalizationProvider></ThemeProvider>);
}

it('shows all three sections together without a tab list and saves the original payload contract', async () => {
  const save = vi.spyOn(parkingApi, 'save').mockResolvedValue({ Values: 7 });
  renderDetails();
  await screen.findByDisplayValue('پارکینگ مرکزی');
  expect(screen.queryByRole('tablist')).toBeNull();
  for (const name of [copy.informationTab, copy.settingsTab, copy.shiftsTab]) expect(screen.getByRole('region', { name })).toBeVisible();
  expect(screen.getByRole('spinbutton', { name: copy.tax })).toHaveValue(9);
  const name = screen.getByRole('textbox', { name: copy.name });
  await userEvent.setup().clear(name);
  await userEvent.setup().type(name, 'پارکینگ جدید');
  await userEvent.setup().click(screen.getByRole('button', { name: copy.save }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ Id: 7, ParkingName: 'پارکینگ جدید', TaxRate: 9, IsCommercialParking: true, HasUserShifts: true, Shift1FromTime: '07:00:00', Shift1ToTime: '15:00:00' })));
});

it('keeps inactive sections visible and preserves their values when toggled back on', async () => {
  renderDetails({ IsCommercialParking: false, HasUserShifts: false });
  await screen.findByDisplayValue('پارکینگ مرکزی');
  expect(screen.getByRole('region', { name: copy.settingsTab })).toBeVisible();
  const tax = screen.getByRole('spinbutton', { name: copy.tax });
  expect(tax).toBeDisabled();
  expect(tax).toHaveValue(9);
  expect(screen.getByRole('checkbox', { name: copy.shift2 })).toBeDisabled();
  await userEvent.setup().click(screen.getByRole('checkbox', { name: copy.commercialParking }));
  await userEvent.setup().click(screen.getByRole('checkbox', { name: copy.userShifts }));
  expect(tax).toBeEnabled();
  expect(tax).toHaveValue(9);
  expect(screen.getByRole('checkbox', { name: copy.shift2 })).toBeEnabled();
});

it('retains the default tabbed form used by the parking directory popup', () => {
  function Preview() {
    const [form, setForm] = useState({ ...emptyParkingForm });
    return <ParkingFormFields form={form} setForm={setForm} copy={copy} saveMessage="" language="fa" />;
  }
  render(<ThemeProvider theme={appTheme}><Preview /></ThemeProvider>);
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
});
