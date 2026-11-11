import '../i18n/instance';
import { useState } from 'react';
import { Button, TextField, ThemeProvider } from '@mui/material';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { createAppTheme } from '../theme';
import { AppPopup } from './AppPopup';
import { CrudDialog } from './CrudDialog';
import { ConfirmDialog } from './ConfirmDialog';

afterEach(cleanup);

it('renders arbitrary content, an accessible title and translated default buttons', async () => {
  const confirm = vi.fn(); const close = vi.fn();
  render(<AppPopup open title="آزمون" onClose={close} onConfirm={confirm}><TextField label="نام" /></AppPopup>);
  expect(screen.getByRole('dialog', { name: 'آزمون' })).toBeVisible();
  await userEvent.setup().type(screen.getByRole('textbox', { name: 'نام' }), 'پارکینگ');
  await userEvent.setup().click(screen.getByRole('button', { name: 'تأیید' }));
  expect(confirm).toHaveBeenCalledOnce();
  expect(close).not.toHaveBeenCalled();
  await userEvent.setup().click(screen.getByRole('button', { name: 'لغو' }));
  expect(close).toHaveBeenCalledOnce();
});

it('supports ordered custom actions, independent disabled state and an empty footer', async () => {
  const print = vi.fn(); const blocked = vi.fn();
  const { rerender } = render(<AppPopup open title="جزئیات" onClose={vi.fn()} actions={[
    { id: 'print', label: 'چاپ', onClick: print },
    { id: 'blocked', label: 'ذخیره', onClick: blocked, disabled: true, variant: 'contained' },
  ]}>محتوا</AppPopup>);
  expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual(['چاپ', 'ذخیره']);
  await userEvent.setup().click(screen.getByRole('button', { name: 'چاپ' }));
  expect(screen.getByRole('button', { name: 'ذخیره' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'ذخیره' }));
  expect(print).toHaveBeenCalledOnce(); expect(blocked).not.toHaveBeenCalled();
  rerender(<AppPopup open title="جزئیات" onClose={vi.fn()} actions={[]}>محتوا</AppPopup>);
  expect(screen.queryByRole('button')).toBeNull();
});

it('locks every action, Escape and backdrop while busy, then restores dismissal', async () => {
  const close = vi.fn(); const confirm = vi.fn();
  const { rerender } = render(<AppPopup open busy title="ذخیره" onClose={close} onConfirm={confirm}>محتوا</AppPopup>);
  screen.getAllByRole('button').forEach(button => expect(button).toBeDisabled());
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  const container = screen.getByRole('dialog').parentElement!;
  fireEvent.mouseDown(container); fireEvent.click(container);
  expect(close).not.toHaveBeenCalled(); expect(confirm).not.toHaveBeenCalled();
  rerender(<AppPopup open title="ذخیره" onClose={close} onConfirm={confirm}>محتوا</AppPopup>);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  expect(close).toHaveBeenCalledOnce();
});

it('restores keyboard focus to the opener after closing', async () => {
  function Preview() {
    const [open, setOpen] = useState(false);
    return <><Button onClick={() => setOpen(true)}>بازکردن</Button><AppPopup open={open} title="آزمون" onClose={() => setOpen(false)}>محتوا</AppPopup></>;
  }
  render(<Preview />);
  const opener = screen.getByRole('button', { name: 'بازکردن' });
  await userEvent.setup().click(opener);
  await userEvent.setup().click(screen.getByRole('button', { name: 'لغو' }));
  await waitFor(() => expect(opener).toHaveFocus());
});

it('uses the same shell for CRUD and destructive confirmation under a dark RTL theme', () => {
  const theme = createAppTheme('rtl', 'dark', 'green');
  const close = vi.fn();
  const { rerender } = render(<ThemeProvider theme={theme}><CrudDialog open title="ویرایش" direction="rtl" onClose={close} onConfirm={close} cancelLabel="لغو" confirmLabel="ذخیره">فرم</CrudDialog></ThemeProvider>);
  expect(screen.getByRole('dialog')).toHaveClass('app-popup-paper');
  expect(screen.getByRole('dialog').closest('[dir]')).toHaveAttribute('dir', 'rtl');
  rerender(<ThemeProvider theme={theme}><ConfirmDialog open title="حذف" message="اطمینان دارید؟" onClose={close} onConfirm={close} cancelLabel="لغو" confirmLabel="حذف" /></ThemeProvider>);
  expect(screen.getByRole('dialog')).toHaveClass('app-popup-paper');
  expect(screen.getByRole('button', { name: 'حذف' })).toHaveClass('MuiButton-colorError');
});

it('keeps all application modal shells centralized', () => {
  const sources = import.meta.glob<string>('../**/*.tsx', { eager: true, query: '?raw', import: 'default' });
  const exceptions = Object.entries(sources).filter(([path, source]) => !path.endsWith('.test.tsx') && !path.endsWith('/AppPopup.tsx') && /<(Dialog|Modal)\b/.test(source));
  expect(exceptions.map(([path]) => path)).toEqual([]);
});

it('allows background keyboard input in a modeless popup and scopes Escape to the popup', async () => {
  const close = vi.fn();
  const { rerender } = render(<><TextField label="شناسه بعدی" /><AppPopup open modal={false} compact width={336} title="هزینه" onClose={close}>جزئیات</AppPopup></>);
  expect(document.querySelector('.MuiBackdrop-root')).toBeNull();
  const input = screen.getByRole('textbox', { name: 'شناسه بعدی' });
  await userEvent.setup().type(input, '1234');
  expect(input).toHaveFocus();
  expect(input).toHaveValue('1234');
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(close).toHaveBeenCalledOnce();
  close.mockClear();
  rerender(<AppPopup open modal={false} busy title="هزینه" onClose={close}>جزئیات</AppPopup>);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'لغو' }));
  expect(close).not.toHaveBeenCalled();
});

it('uses a stable accessible label when the visual title includes changing status or another action', () => {
  render(<AppPopup open title={<>هزینه <span>۵ ثانیه</span><Button>نمایش مبلغ</Button></>} ariaLabel="پرداخت" onClose={vi.fn()}>جزئیات</AppPopup>);
  expect(screen.getByRole('dialog', { name: 'پرداخت' })).toBeVisible();
});
