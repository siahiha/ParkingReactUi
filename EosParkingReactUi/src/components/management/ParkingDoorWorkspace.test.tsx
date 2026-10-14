import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { ParkingDoorWorkspace } from './ParkingDoorWorkspace';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

const doors = [{ Id: 7, Title: 'درب ورودی', DoorType: 0, EntryAuthorizaitionType: 2, DoorCode: 11, DtoViewParkingDoorDevices: [] }];
const equipment = [{ Id: 21, DeviceName: 'راهبند ورودی', DeviceType: 1, Disabled: false }, { Id: 22, DeviceName: 'دوربین ورودی', DeviceType: 0, Disabled: false }];

describe('parking door workspace', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('shows CRUD buttons, creates a door, and sends the door payload', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('GetParkingDoors?')) return Promise.resolve(jsonResponse({ Values: doors }));
      if (url.includes('GetParkingEquipments')) return Promise.resolve(jsonResponse({ Values: equipment }));
      if (url.includes('SaveParkingDoor')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: 12 }));
      return Promise.reject(new Error(`Unexpected request: ${url} ${init?.method ?? 'GET'}`));
    });

    render(<ThemeProvider theme={appTheme}><ParkingDoorWorkspace title="درب‌های پارکینگ" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);

    expect(await screen.findByText('درب ورودی')).toBeVisible();
    expect(screen.getByRole('button', { name: 'جدید' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'ویرایش' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'حذف' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'جدید' }));
    await user.type(screen.getByRole('textbox', { name: 'عنوان درب' }), 'درب خروجی');
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => String(input).includes('SaveParkingDoor'))).toBe(true));
    const saveCall = fetchMock.mock.calls.find(([input]) => String(input).includes('SaveParkingDoor'));
    expect(JSON.parse(String(saveCall?.[1]?.body))).toEqual(expect.objectContaining({ Id: 0, ParkingId: 3, Title: 'درب خروجی', DoorType: 0 }));
  });

  it('enables edit/delete after selection and confirms delete through the API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetParkingDoors?')) return Promise.resolve(jsonResponse({ Values: doors }));
      if (url.includes('GetParkingEquipments')) return Promise.resolve(jsonResponse({ Values: equipment }));
      if (url.includes('DeleteParkingDoor')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
      return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
    });

    render(<ThemeProvider theme={appTheme}><ParkingDoorWorkspace title="درب‌های پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.click(await screen.findByText('درب ورودی'));
    expect(screen.getByRole('button', { name: 'ویرایش' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'حذف' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'ویرایش' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('ویرایش درب');
    await user.click(screen.getByRole('button', { name: 'لغو' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'حذف' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('حذف درب');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'حذف' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => String(input).includes('DeleteParkingDoor?doorId=7'))).toBe(true));
  });
});
