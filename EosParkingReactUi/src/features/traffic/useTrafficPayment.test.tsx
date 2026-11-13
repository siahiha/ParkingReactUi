import '../../i18n/instance';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTrafficPayment } from './useTrafficPayment';
afterEach(cleanup);
const bill = { DumpId: 42, ExitDateTime: '2026-11-10T10:00:00', CommonCost: 3000, MemberCost: 0, PayType: 0 };
function setup(pay = vi.fn().mockResolvedValue('receipt')) {
  const options = { language: 'en' as const, door: null, pay, onPaid: vi.fn(), onError: vi.fn(), onPendingChange: vi.fn(), onRestoreFocus: vi.fn() };
  return { ...renderHook(() => useTrafficPayment(options)), options };
}
it('keeps an independent bill snapshot and can close it without paying', () => {
  const { result, options } = setup();
  const original = { ...bill };
  act(() => result.current.open(original, 'exit'));
  original.CommonCost = 8000;
  expect(result.current.bill?.CommonCost).toBe(3000);
  act(() => result.current.close());
  expect(result.current.isOpen).toBe(false);
  expect(options.pay).not.toHaveBeenCalled();
});
it('locks payment immediately, keeps the bill after failure, and allows a retry', async () => {
  let fail!: (reason: Error) => void;
  const pay = vi.fn().mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; })).mockResolvedValue('receipt');
  const { result, options } = setup(pay);
  act(() => result.current.open(bill, 'exit'));
  let pending!: Promise<void>;
  act(() => { pending = result.current.settle(); void result.current.settle(); result.current.close(); });
  expect(pay).toHaveBeenCalledTimes(1);
  expect(result.current.isOpen).toBe(true);
  await act(async () => { fail(new Error('offline')); await pending; });
  expect(result.current.isOpen).toBe(true);
  expect(result.current.error).toBeTruthy();
  await act(async () => { await result.current.settle(); });
  expect(pay).toHaveBeenCalledTimes(2);
  expect(options.onPaid).toHaveBeenCalledOnce();
  expect(result.current.isOpen).toBe(false);
});
it('refuses payment from a row without an exit or with a settled bill', () => {
  const { result, options } = setup();
  act(() => result.current.openFromGrid({ ...bill, ExitDateTime: null }));
  expect(options.onError).toHaveBeenLastCalledWith('Register the vehicle exit first.');
  act(() => result.current.openFromGrid({ ...bill, PayType: 1 }));
  expect(options.onError).toHaveBeenLastCalledWith('This traffic has already been paid.');
  expect(result.current.isOpen).toBe(false);
  expect(options.pay).not.toHaveBeenCalled();
});
