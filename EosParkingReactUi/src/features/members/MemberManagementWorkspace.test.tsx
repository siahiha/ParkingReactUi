import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { MemberManagementWorkspace } from './MemberManagementWorkspace';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

const member = {
  Id: 10,
  Name: 'علی',
  Family: 'رضایی',
  Code: 'M-100',
  NationalCode: '',
  PhoneNumber: '',
  Address: '',
  FaceTag: '',
  IsMemberBlock: false,
  CardNumber: '',
  ExitPermissionAccepter: 0,
  CashAmount: 80_000,
  Cars: [],
  MemberRegisters: [],
  MemberParkSpaces: [],
};

describe('member membership registration', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('previews the Backend calculation before confirming the final membership registration', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('GetMemberRegisterKindsByParkingId')) {
        return Promise.resolve(jsonResponse({ Values: [{ Id: 7, Title: 'ماهانه', MembershipFee: 100_000, DurationDays: 30, TaxValue: 9_000, MembershipCreditType: 0, MembershipType: 0 }] }));
      }
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [member] }));
      if (url.includes('AddMemberRegister')) {
        const payload = JSON.parse(String(init?.body));
        return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: payload.DoSave ? { Id: 92, CreditAmount: 100_000, Tax: 9_000, TransferAmount: 80_000, TotalAmount: 29_000 } : { Id: 0, CreditAmount: 100_000, Tax: 9_000, TransferAmount: 80_000, TotalAmount: 29_000 } }));
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><MemberManagementWorkspace title="عضویت و ثبت نام" parkingId={3} language="fa" /></ThemeProvider>);

    await user.dblClick((await screen.findAllByText('علی رضایی'))[0]);
    await user.click(screen.getByRole('tab', { name: 'عضویت' }));
    await user.click(screen.getByRole('button', { name: 'ثبت عضویت' }));
    await user.click(await screen.findByRole('combobox', { name: 'نوع عضویت' }));
    await user.click(await screen.findByRole('option', { name: 'ماهانه' }));
    await user.click(screen.getByRole('button', { name: 'تأیید پرداخت' }));

    expect(await screen.findByText(/مبلغ قابل پرداخت/)).toBeVisible();
    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes('AddMemberRegister') && JSON.parse(String(init?.body)).DoSave === false)).toBe(true));

    await user.click(screen.getByRole('button', { name: 'تأیید پرداخت و ثبت عضویت' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes('AddMemberRegister') && JSON.parse(String(init?.body)).DoSave === true)).toBe(true));
    const finalPayload = fetchMock.mock.calls
      .filter(([input, init]) => String(input).includes('AddMemberRegister') && JSON.parse(String(init?.body)).DoSave === true)
      .map(([, init]) => JSON.parse(String(init?.body)))[0];
    expect(finalPayload.TransferCreditAmount).toBe(80_000);
    expect(finalPayload.StartDate).toMatch(/T00:00:00(?:\.000)?Z$/);
    expect(finalPayload.EndDate).toMatch(/T00:00:00(?:\.000)?Z$/);
  });

  it('checks current credit before sending a selected cancellation reason', async () => {
    const user = userEvent.setup();
    const activeMember = {
      ...member,
      MemberRegisters: [{ Id: 21, MemberId: 10, MemberRegisterKindId: 7, MemberRegisterKindTitle: 'ماهانه', CreditAmount: 100_000, TransferCreditAmount: 0, TaxValue: 9_000, RoundingValue: 0, StartDate: '2026-09-01T00:00:00', EndDate: '2026-10-01T00:00:00', PersistOn: '2026-09-01T00:00:00', IsActive: true }],
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [activeMember] }));
      if (url.includes('GetMemberCurrentCreditInfo')) return Promise.resolve(jsonResponse({ Values: [{ MemberRegisterId: 21, IsActive: true, MembershipCreditType: 0 }] }));
      if (url.includes('MembershipCreditCancellation')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><MemberManagementWorkspace title="عضویت و ثبت نام" parkingId={3} language="fa" /></ThemeProvider>);

    await screen.findAllByText('M-100');
    await user.click(screen.getByRole('tab', { name: 'عضویت' }));
    await user.click(await screen.findByRole('button', { name: 'لغو عضویت: ماهانه' }));
    expect(await screen.findByText('نوع اعتبار: اعتباری')).toBeVisible();
    await user.click(screen.getByRole('combobox', { name: 'نوع لغو عضویت' }));
    await user.click(screen.getByRole('option', { name: 'عودت وجه' }));
    await user.click(screen.getByRole('button', { name: 'لغو عضویت' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('api/Member/MembershipCreditCancellation'), expect.objectContaining({ method: 'POST' })));
    const call = fetchMock.mock.calls.find(([input]) => String(input).includes('MembershipCreditCancellation'));
    expect(JSON.parse(String(call?.[1]?.body))).toEqual(expect.objectContaining({ Id: 21, CancellingMembershipType: 1 }));
  });

  it('moves an available parking space into the member draft and persists the final assignment list', async () => {
    const user = userEvent.setup();
    const memberWithFixedSpace = {
      ...member,
      MemberRegisters: [{ Id: 21, MemberId: 10, MemberRegisterKindId: 7, MemberRegisterKindTitle: 'جای پارک مشخص', CreditAmount: 100_000, TransferCreditAmount: 0, TaxValue: 9_000, RoundingValue: 0, StartDate: '2026-09-01T00:00:00', EndDate: '2026-10-01T00:00:00', PersistOn: '2026-09-01T00:00:00', IsActive: true }],
      MemberParkSpaces: [{ Id: 81, ParkSpaceId: 55, FloorId: 4, FloorTitle: 'طبقه ۱', ParkSpaceTitle: '۱-۰۱' }],
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('GetMemberRegisterKindsByParkingId')) {
        return Promise.resolve(jsonResponse({ Values: [{ Id: 7, Title: 'جای پارک مشخص', MembershipFee: 100_000, DurationDays: 30, TaxValue: 9_000, MembershipCreditType: 0, MembershipType: 1 }] }));
      }
      if (url.includes('GetParkingParkSpacesById')) {
        return Promise.resolve(jsonResponse({ Values: [{ Id: 0, ParkSpaceId: 77, FloorId: 4, FloorTitle: 'طبقه ۱', ParkSpaceTitle: '۱-۰۲' }] }));
      }
      if (url.includes('api/Member/Save')) return Promise.resolve(jsonResponse({ Values: 10 }));
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [memberWithFixedSpace] }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><MemberManagementWorkspace title="عضویت و ثبت نام" parkingId={3} language="fa" /></ThemeProvider>);

    await user.dblClick((await screen.findAllByText('علی رضایی'))[0]);
    await user.click(screen.getByRole('tab', { name: 'جای پارک‌های عضو' }));
    expect(screen.getAllByRole('checkbox', { name: 'انتخاب ردیف' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'تخصیص جای پارک: ۱-۰۲' }));
    await user.click((await screen.findAllByRole('checkbox', { name: 'انتخاب ردیف' }))[0]);
    await user.click(await screen.findByRole('button', { name: 'آزادسازی جای پارک' }));
    await user.click(screen.getByRole('button', { name: 'ذخیره عضو' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => String(input).includes('api/Member/Save') && JSON.parse(String(init?.body)).MemberParkSpaces.every((space: { Id: number; ParkSpaceId: number }) => space.ParkSpaceId !== 55) && JSON.parse(String(init?.body)).MemberParkSpaces.some((space: { Id: number; ParkSpaceId: number }) => space.Id === 0 && space.ParkSpaceId === 77))).toBe(true));
  });

  it('does not expose assignment actions for an active membership without a fixed parking space', async () => {
    const user = userEvent.setup();
    const memberWithoutFixedSpace = {
      ...member,
      MemberRegisters: [{ Id: 21, MemberId: 10, MemberRegisterKindId: 7, MemberRegisterKindTitle: 'بدون جای پارک مشخص', CreditAmount: 100_000, TransferCreditAmount: 0, TaxValue: 9_000, RoundingValue: 0, StartDate: '2026-09-01T00:00:00', EndDate: '2026-10-01T00:00:00', PersistOn: '2026-09-01T00:00:00', IsActive: true }],
    };
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetMemberRegisterKindsByParkingId')) {
        return Promise.resolve(jsonResponse({ Values: [{ Id: 7, Title: 'بدون جای پارک مشخص', MembershipFee: 100_000, DurationDays: 30, TaxValue: 9_000, MembershipCreditType: 0, MembershipType: 2 }] }));
      }
      if (url.includes('GetParkingParkSpacesById')) return Promise.resolve(jsonResponse({ Values: [{ Id: 0, ParkSpaceId: 77, FloorId: 4, FloorTitle: 'طبقه ۱', ParkSpaceTitle: '۱-۰۲' }] }));
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [memberWithoutFixedSpace] }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><MemberManagementWorkspace title="عضویت و ثبت نام" parkingId={3} language="fa" /></ThemeProvider>);

    await user.dblClick((await screen.findAllByText('علی رضایی'))[0]);
    await user.click(screen.getByRole('tab', { name: 'جای پارک‌های عضو' }));
    expect(await screen.findByText('تخصیص جای پارک فقط برای عضویت فعالِ دارای جای پارک مشخص امکان‌پذیر است.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'تخصیص جای پارک' })).not.toBeInTheDocument();
  });
});
