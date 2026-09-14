import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParkingDefinitionsCrudWorkspace } from './ParkingDefinitionsCrudWorkspace';
import { appTheme } from '../theme';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

describe('parking zone editor', () => {
  afterEach(() => cleanup());

  it('checks the current zone ParkSpaces after its floor grid loads', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetParkingSections')) return Promise.resolve(jsonResponse({ Values: [{
        Id: 91,
        Title: 'زون A',
        Description: '',
        ParkSpaces: [{ Id: 101, ParkingFloorId: 5 }, { Id: 103, ParkingFloorId: 5 }],
      }] }));
      if (url.includes('GetParkingFloors')) return Promise.resolve(jsonResponse({ Values: [{ Id: 5, Title: 'طبقه ۱' }] }));
      if (url.includes('GetParkingFloorById')) return Promise.resolve(jsonResponse({ Values: {
        Id: 5,
        ParkSpaces: [
          { Id: 101, Title: 'A1', ParkingFloorId: 5, ParkingSectionId: 91 },
          { Id: 102, Title: 'A2', ParkingFloorId: 5, ParkingSectionId: null },
          { Id: 103, Title: 'A3', ParkingFloorId: 5, ParkingSectionId: 91 },
        ],
      } }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><ParkingDefinitionsCrudWorkspace kind="zones" parkingId={7} language="fa" title="زون‌های پارکینگ" pageTitle="مدیریت پارکینگ" /></ThemeProvider>);

    await user.click(await screen.findByText('زون A'));
    await user.click(screen.getAllByRole('button', { name: 'ویرایش' })[0]);
    const dialog = await screen.findByRole('dialog');

    expect(await within(dialog).findByText('A1')).toBeInTheDocument();
    expect(within(dialog).getByText(/تعداد جای‌پارک‌های طبقه: 3/)).toBeInTheDocument();
    await waitFor(() => {
      const checkedBoxes = within(dialog).getAllByLabelText('انتخاب ردیف').filter((checkbox) => (checkbox as HTMLInputElement).checked);
      expect(checkedBoxes).toHaveLength(2);
    });
  });
});

describe('membership type editor', () => {
  afterEach(() => cleanup());

  it('applies membership rules and keeps type fields immutable while editing', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetMemberRegisterKindsByParkingId')) return Promise.resolve(jsonResponse({ Values: [{
        Id: 12,
        Title: 'اشتراک سازمانی',
        Description: 'توضیح',
        MembershipFee: 1000,
        DurationDays: 30,
        MembershipCreditType: 1,
        MembershipType: 1,
        RefundDeadlineDayCount: 7,
        Tariffs: [{ Key: 4, Value: 'تعرفه سازمانی' }],
      }] }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><ParkingDefinitionsCrudWorkspace kind="member-kinds" parkingId={7} language="fa" title="انواع عضویت" pageTitle="مدیریت پارکینگ" /></ThemeProvider>);

    await user.click(await screen.findByText('اشتراک سازمانی'));
    await user.click(screen.getAllByRole('button', { name: 'ویرایش' })[0]);
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).queryByDisplayValue('توضیح')).not.toBeInTheDocument();
    expect(within(dialog).getByText('تعرفه سازمانی')).toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'نوع عضویت' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(within(dialog).getByRole('combobox', { name: 'نوع اعتبار' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('GetMemberRegisterKindsByParkingId'), expect.anything());
  });

  it('forces owner memberships to long-time credit and rejects an invalid duration', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetMemberRegisterKindsByParkingId')) return Promise.resolve(jsonResponse({ Values: [] }));
      if (url.includes('SaveMemberRegisterKind')) return Promise.resolve(jsonResponse({ Values: 21, ResponseResultType: 1 }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><ParkingDefinitionsCrudWorkspace kind="member-kinds" parkingId={7} language="fa" title="انواع عضویت" pageTitle="مدیریت پارکینگ" /></ThemeProvider>);

    await user.click(await screen.findByRole('button', { name: 'جدید' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('textbox', { name: 'عنوان' }), 'مالک اصلی');
    await user.click(within(dialog).getByRole('combobox', { name: 'نوع عضویت' }));
    await user.click(await screen.findByRole('option', { name: 'مالک' }));

    expect(within(dialog).getByRole('combobox', { name: 'نوع اعتبار' })).toHaveTextContent('مدت‌دار');
    expect(within(dialog).getByRole('combobox', { name: 'نوع اعتبار' })).toHaveAttribute('aria-disabled', 'true');
    await user.clear(within(dialog).getByRole('spinbutton', { name: 'مدت عضویت (روز)' }));
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    expect(await within(dialog).findByText('برای این نوع اعتبار، مدت باید بزرگ‌تر از صفر باشد.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith('api/Member/SaveMemberRegisterKind', expect.anything());
  });
});
