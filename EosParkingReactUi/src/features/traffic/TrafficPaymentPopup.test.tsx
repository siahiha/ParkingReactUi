import i18n from '../../i18n/instance';
import fa from '../../locales/fa';
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TrafficPaymentPopup, type TrafficPaymentPresentation } from './TrafficPaymentPopup';

afterEach(() => { cleanup(); vi.useRealTimers(); });
it('has explicit payment translations in both supported languages without relying on fallback', () => {
  for (const language of ['fa', 'en']) {
    for (const key of Object.keys(fa.trafficPayment)) {
      expect(i18n.getResource(language, 'translation', `trafficPayment.${key}`)).toEqual(expect.any(String));
    }
  }
});
const bill = { DumpId: 42, CommonCost: 0, MemberCost: 7000, MemberDuration: 60, CommonDuration: 0, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: '2026-11-10T09:00:00', TarrifTitle: 'تعرفه روزانه' };
const presentation: TrafficPaymentPresentation = { modal: false, amount: 0, timeoutSeconds: 5, door: null };
function setup(overrides: Partial<TrafficPaymentPresentation> = {}) {
  const close = vi.fn(); const pay = vi.fn();
  render(<TrafficPaymentPopup bill={bill} presentation={{ ...presentation, ...overrides }} language="fa" busy={false} error="" paperRef={createRef()} onClose={close} onPay={pay} />);
  return { close, pay };
}
it('automatically closes a free member bill at five seconds without requesting payment', () => {
  vi.useFakeTimers();
  const { close, pay } = setup();
  expect(screen.getByRole('button', { name: 'تأیید' })).toBeEnabled();
  expect(screen.getByRole('region', { name: 'حق عضویت استفاده شده' })).toBeVisible();
  expect(screen.queryByRole('region', { name: 'دریافتی' })).toBeNull();
  act(() => vi.advanceTimersByTime(4999));
  expect(close).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(close).toHaveBeenCalledOnce();
  expect(pay).not.toHaveBeenCalled();
});
it('automatically closes a chargeable bill at twenty seconds without requesting payment', () => {
  vi.useFakeTimers();
  const { close, pay } = setup({ amount: 3000, modal: true, timeoutSeconds: 20 });
  act(() => vi.advanceTimersByTime(19999));
  expect(close).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(close).toHaveBeenCalledOnce();
  expect(pay).not.toHaveBeenCalled();
});
it('confirms a free bill without calling the payment endpoint', () => {
  const { close, pay } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'تأیید' }));
  expect(close).toHaveBeenCalledOnce();
  expect(pay).not.toHaveBeenCalled();
});
it('permanently stops the timeout on interaction, including after the pointer leaves', () => {
  vi.useFakeTimers();
  const { close } = setup();
  fireEvent.mouseEnter(screen.getByRole('dialog'));
  fireEvent.mouseLeave(screen.getByRole('dialog'));
  act(() => vi.advanceTimersByTime(30000));
  expect(close).not.toHaveBeenCalled();
  expect(screen.queryByRole('timer')).toBeNull();
});
it.each(['pointer', 'keyboard'])('cancels the twenty-second timeout after %s interaction', interaction => {
  vi.useFakeTimers();
  const { close, pay } = setup({ amount: 3000, modal: true, timeoutSeconds: 20 });
  act(() => vi.advanceTimersByTime(10000));
  if (interaction === 'pointer') fireEvent.pointerDown(screen.getByRole('dialog'), { pointerType: 'touch' });
  else fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
  act(() => vi.advanceTimersByTime(30000));
  expect(close).not.toHaveBeenCalled();
  expect(pay).not.toHaveBeenCalled();
  expect(screen.queryByRole('timer')).toBeNull();
});
it('does not start an automatic timer for a positive bill opened from the grid', () => {
  vi.useFakeTimers();
  const { close } = setup({ amount: 3000, modal: true, timeoutSeconds: 0, door: { id: 8, type: 2, posConfigured: true, hasPriceDisplay: true } });
  expect(screen.getByRole('button', { name: 'تأیید و پرداخت' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'پرداخت با POS' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'نمایش مجدد مبلغ روی LCD' })).toBeDisabled();
  act(() => vi.advanceTimersByTime(60000));
  expect(close).not.toHaveBeenCalled();
});

it('locks dismissal while payment is pending and keeps the timer stopped after a failed payment', () => {
  vi.useFakeTimers();
  const close = vi.fn(); const pay = vi.fn();
  const pendingPresentation = { ...presentation, modal: true, amount: 3000, timeoutSeconds: 1 };
  const { rerender } = render(<TrafficPaymentPopup bill={bill} presentation={pendingPresentation} language="fa" busy error="" paperRef={createRef()} onClose={close} onPay={pay} />);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'خروج' })).toBeDisabled();
  act(() => vi.advanceTimersByTime(10000));
  expect(close).not.toHaveBeenCalled();
  rerender(<TrafficPaymentPopup bill={bill} presentation={pendingPresentation} language="fa" busy={false} error="پرداخت ناموفق بود" paperRef={createRef()} onClose={close} onPay={pay} />);
  act(() => vi.advanceTimersByTime(10000));
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('پرداخت ناموفق بود');
  expect(screen.getByRole('button', { name: 'تأیید و پرداخت' })).toBeEnabled();
});
