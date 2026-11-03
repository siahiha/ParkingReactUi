import '../i18n/instance';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { appTheme } from '../theme';
import i18n from '../i18n/instance';
import { ParkingDefinitionsCrudWorkspace } from './ParkingDefinitionsCrudWorkspace';
import { MemberManagementWorkspace } from '../features/members/MemberManagementWorkspace';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('opens a new floor and its nested parking-space editor without crashing', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ Values: [] }), { status: 200 }));
  render(<ThemeProvider theme={appTheme}><LocalizationProvider dateAdapter={AdapterDayjs}><ParkingDefinitionsCrudWorkspace kind="floors" parkingId={7} language="fa" title="طبقات و تقسیمات" pageTitle="پارکینگ" /></LocalizationProvider></ThemeProvider>);
  await userEvent.setup().click(screen.getByRole('button', { name: i18n.t('definitions.add') }));
  expect(screen.getByRole('dialog')).toBeVisible();
  await userEvent.setup().click(screen.getByRole('button', { name: 'جای‌پارک جدید' }));
  expect(screen.getByRole('textbox', { name: i18n.t('definitions.title') })).toBeVisible();
});

it('opens a new member without blanking the workspace', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ Values: [] }), { status: 200 }));
  render(<ThemeProvider theme={appTheme}><LocalizationProvider dateAdapter={AdapterDayjs}><MemberManagementWorkspace parkingId={7} language="fa" title="عضویت و ثبت نام" /></LocalizationProvider></ThemeProvider>);
  await waitFor(() => expect(screen.getByRole('button', { name: /جدید/ })).toBeEnabled());
  await userEvent.setup().click(screen.getByRole('button', { name: /جدید/ }));
  expect(screen.getByRole('textbox', { name: 'نام' })).toBeVisible();
});
