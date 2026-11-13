import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { trafficOperationService } from './trafficOperationService';
import { useTrafficOperations } from './useTrafficOperations';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('locks exit and settlement together until payment finishes', async () => {
  const bill = { DumpId: 42, ExitDateTime: '2026-11-10T10:00:00', CommonCost: 5000, PayType: 0 };
  const exit = vi.spyOn(trafficOperationService, 'exit').mockResolvedValue(bill);
  let release!: (receipt: string) => void;
  const pay = vi.spyOn(trafficOperationService, 'pay').mockImplementation(() => new Promise(resolve => { release = resolve; }));
  const { result } = renderHook(useTrafficOperations);
  const input = { parkingId: 7, doorId: 8, plate: '12ب34567', carType: 0, info: {} };
  let completion!: ReturnType<typeof result.current.completeExit>;
  await act(async () => { completion = result.current.completeExit(input, null, false); });
  expect(result.current.pending).toBe(true);
  await act(async () => {
    await expect(result.current.completeExit(input, null, false)).rejects.toThrow();
    await expect(result.current.settleDirectly(bill)).rejects.toThrow();
  });
  expect(exit).toHaveBeenCalledTimes(1);
  expect(pay).toHaveBeenCalledTimes(1);
  await act(async () => { release('receipt-42'); await completion; });
  expect(result.current.pending).toBe(false);
});
