import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { CardManagementWorkspace } from './CardManagementWorkspace';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

describe('card management workspace', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('renders the Windows-like grid workflow without a popup and saves a new card through SaveAll', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [{ Id: 7, CardNumber: '1001', MemberCode: 'M-1', MemberFullName: 'علی رضایی', IsBlock: false, PersistOn: '2026-09-15', Description: '' }] }));
      if (url.includes('SaveAll')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
      return Promise.reject(new Error(`Unexpected request: ${url} ${init?.method ?? 'GET'}`));
    });

    render(<ThemeProvider theme={appTheme}><CardManagementWorkspace title="مدیریت کارت‌ها" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);

    expect(await screen.findByText('1001')).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'فیلتر شماره کارت' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox', { name: 'شماره کارت' })).toHaveLength(2);
    await user.type(screen.getAllByRole('textbox', { name: 'شماره کارت' })[0], '1002');
    await user.click(screen.getByRole('button', { name: 'افزودن کارت' }));
    expect(screen.getByText('1002')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('api/Card/SaveAll'), expect.objectContaining({ method: 'POST' })));
    const saveCall = fetchMock.mock.calls.find(([input]) => String(input).includes('SaveAll'));
    expect(saveCall).toBeDefined();
    expect(JSON.parse(String(saveCall?.[1]?.body))).toEqual(expect.arrayContaining([expect.objectContaining({ Id: 0, CardNumber: '1002', ParkingId: 3 })]));
  });

  it('opens the selected card in edit mode on row double-click and asks before switching with dirty changes', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [
        { Id: 7, CardNumber: '1001', MemberCode: '', MemberFullName: '', IsBlock: false, PersistOn: '', Description: '' },
        { Id: 8, CardNumber: '1002', MemberCode: '', MemberFullName: '', IsBlock: false, PersistOn: '', Description: '' },
      ] }));
      return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
    });

    render(<ThemeProvider theme={appTheme}><CardManagementWorkspace title="مدیریت کارت‌ها" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.dblClick(await screen.findByText('1001'));
    expect(screen.getByRole('button', { name: 'اعمال ویرایش' })).toBeVisible();
    const cardInputs = screen.getAllByRole('textbox', { name: 'شماره کارت' });
    await user.clear(cardInputs[0]);
    await user.type(cardInputs[0], '1003');
    await user.click(screen.getByRole('button', { name: 'اعمال ویرایش' }));
    await user.dblClick(screen.getByText('1002'));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByText('تغییرات ذخیره‌نشده')).toBeVisible();
  });

  it('confirms deletion inline above the grid and sends the negative id deletion payload', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('GetByParkingId')) return Promise.resolve(jsonResponse({ Values: [{ Id: 7, CardNumber: '1001', MemberCode: '', MemberFullName: '', IsBlock: false, PersistOn: '', Description: '' }] }));
      if (url.includes('SaveAll')) return Promise.resolve(jsonResponse({ ResponseResultType: 1, Values: true }));
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(<ThemeProvider theme={appTheme}><CardManagementWorkspace title="مدیریت کارت‌ها" pageTitle="مدیریت پارکینگ" parkingId={3} language="fa" /></ThemeProvider>);
    await user.click(await screen.findByText('1001'));
    await user.click(screen.getByRole('button', { name: 'حذف کارت' }));
    expect(screen.getByText('حذف رکورد انتخاب‌شده در انتظار تأیید است.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'حذف' }));
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }));

    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => String(input).includes('SaveAll'))).toBe(true));
    const saveCall = fetchMock.mock.calls.find(([input]) => String(input).includes('SaveAll'));
    expect(JSON.parse(String(saveCall?.[1]?.body))).toEqual([{ Id: -7 }]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
