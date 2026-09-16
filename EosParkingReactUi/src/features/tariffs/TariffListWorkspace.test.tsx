import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { TariffListWorkspace } from './TariffListWorkspace';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

const tariff = {
  Id: 7,
  Title: 'عمومی',
  ParkingId: 3,
  IsActive: true,
  IsCurrent: true,
  IsMemberRegisterKindTariff: false,
  PersistOn: '2026-09-14T10:30:00',
  EntranceDurationMinutes: 10,
  EntranceFreeMinutes: 5,
  EntranceCarOneMinuteCost: 1000,
  EntranceMotorOneMinuteCost: 700,
  EntranceMiniBusOneMinuteCost: 1200,
  EntranceTruckOneMinuteCost: 1500,
  EntranceTrailyOneMinuteCost: 1800,
  RoundingBorder: 1000,
  RoundingValue: 1000,
  MaximumHostelryDuration: 24,
  GetEnteranceInHostelryPark: true,
  Description: 'توضیح',
  TariffRanges: [{ Id: 11, StartTime: '08:00:00', EndTime: '20:00:00', ParkSpaceId: null, TariffRangeDetails: [{ Id: 21, FromMinute: 0, ToMinute: 60, CarOneMinuteCost: 1000, MotorOneMinuteCost: 700, MiniBusOneMinuteCost: 1200, TruckOneMinuteCost: 1500, TrailyOneMinuteCost: 1800 }] }],
  TariffHostelryDetails: [{ Id: 12, FromDay: 1, ToDay: 2, ParkSpaceKindId: null, CarOneMinuteCost: 1000, MotorOneMinuteCost: 700, MiniBusOneMinuteCost: 1200, TruckOneMinuteCost: 1500, TrailyOneMinuteCost: 1800 }],
  MemberRegisterKinds: [],
};

describe('tariff management workflow', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('creates a tariff through the editor and sends the complete payload', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('api/Tariff/GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [] }));
      if (url.includes('api/Tariff/Save')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: 19 }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><TariffListWorkspace title="تعرفه" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.click(await screen.findByRole('button', { name: 'ایجاد تعرفه' }));
    await user.type(screen.getByRole('textbox', { name: 'عنوان تعرفه' }), ' تعرفه جدید');
    const minimumHostelry = screen.getByRole('spinbutton', { name: 'حداقل توقف برای محاسبه شبانه‌روزی' });
    expect(minimumHostelry).toHaveValue(8);
    await user.clear(minimumHostelry);
    await user.type(minimumHostelry, '24');
    await user.click(screen.getByRole('tab', { name: 'نرخ ساعتی روزانه' }));
    const dailyFrom = screen.getByRole('textbox', { name: 'از' });
    const dailyTo = screen.getByRole('textbox', { name: 'تا' });
    expect(dailyFrom).toHaveAttribute('type', 'text');
    expect(dailyFrom).toHaveValue('00:00');
    expect(dailyTo).toHaveValue('01:00');
    await user.click(screen.getByRole('tab', { name: 'نرخ شبانه‌روزی' }));
    const overnightFrom = screen.getByRole('spinbutton', { name: 'از' });
    const overnightTo = screen.getByRole('spinbutton', { name: 'تا' });
    expect(overnightFrom).toHaveAttribute('type', 'number');
    expect(overnightFrom).toHaveValue(0);
    expect(overnightTo).toHaveValue(0);
    await user.clear(overnightFrom);
    await user.type(overnightFrom, '1');
    await user.clear(overnightTo);
    await user.type(overnightTo, '2');
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => { const url = String(input); if (!url.includes('api/Tariff/Save')) return false; const body = JSON.parse(String(init?.body)); const daily = body.TariffRanges[0]; const detail = daily.TariffRangeDetails[0]; return body.Title === 'تعرفه جدید' && body.TariffRanges.length === 1 && daily.StartTime === '00:00:00' && daily.EndTime === '01:00:00' && [detail.CarOneMinuteCost, detail.MotorOneMinuteCost, detail.MiniBusOneMinuteCost, detail.TruckOneMinuteCost, detail.TrailyOneMinuteCost].every((cost) => cost === 0) && body.TariffHostelryDetails.length === 1 && body.TariffHostelryDetails[0].FromDay === 1 && body.TariffHostelryDetails[0].ToDay === 2; })).toBe(true));
  });

  it('hydrates the selected tariff for edit and persists changed values', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('api/Tariff/GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [tariff] }));
      if (url.includes('api/Tariff/Save')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: 7 }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><TariffListWorkspace title="تعرفه" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.click(await screen.findByText('عمومی'));
    await user.click(screen.getByRole('button', { name: 'ویرایش تعرفه' }));
    const dialog = await screen.findByRole('dialog');
    const titleInput = within(dialog).getByRole('textbox', { name: 'عنوان تعرفه' });
    await user.clear(titleInput);
    await user.type(titleInput, 'تعرفه ویرایش‌شده');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes('api/Tariff/Save') && JSON.parse(String(init?.body)).Id === 7 && JSON.parse(String(init?.body)).Title === 'تعرفه ویرایش‌شده')).toBe(true));
  });

  it('deletes the selected tariff through the configured delete endpoint', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('api/Tariff/GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [tariff] }));
      if (url.includes('api/Tariff/Delete')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><TariffListWorkspace title="تعرفه" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.click(await screen.findByText('عمومی'));
    await user.click(screen.getByRole('button', { name: 'حذف تعرفه' }));
    await user.click(screen.getByRole('button', { name: 'حذف' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('api/Tariff/Delete?id=7'), expect.anything()));
  });
});
