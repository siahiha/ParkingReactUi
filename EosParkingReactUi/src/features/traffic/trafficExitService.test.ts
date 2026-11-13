import { afterEach, describe, expect, it, vi } from 'vitest';
import { trafficExitService } from './trafficExitService';
import { trafficOperationService } from './trafficOperationService';

const input = { parkingId: 7, doorId: 8, userId: 9, plate: '12ب34567', carType: 0,
  info: { CarId: 10, MemberTariffId: 13, DumpId: 42, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: null, ExitPermission: true } };
const bill = { DumpId: 42, ExitDateTime: '2026-11-10T10:00:00', CommonCost: 5000, PayType: 0 };
const response = (Values: unknown, ResponseResultType = 1) => new Response(JSON.stringify({ Values, ResponseResultType }), { headers: { 'content-type': 'application/json' } });

describe('parking exit and settlement policy', () => {
  afterEach(() => vi.restoreAllMocks());
  it('commits non-commercial exit before cash settlement and waits for the receipt', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(bill)).mockResolvedValueOnce(response('receipt-42'));
    await expect(trafficExitService.complete(input, null, false)).resolves.toEqual({ bill, settlement: 'settled' });
    expect(fetch.mock.calls.map(call => String(call[0]))).toEqual([
      expect.stringContaining('/DoExitDump'), expect.stringContaining('/PayDump?dumpId=42&payType=1&transactionResponse='),
    ]);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({ Id: 42, DoSave: true, ExitDateTime: null });
  });
  it('preserves commercial popup checkout and an explicitly supplied history exit time', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(bill));
    await expect(trafficExitService.complete(input, '2026-11-10 10:00:00', true)).resolves.toEqual({ bill, settlement: 'notRequested' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).ExitDateTime).toBe('2026-11-10 10:00:00');
  });
  it.each([0, 9])('settles an unpaid bill with pay type %i', async PayType => {
    const pay = vi.spyOn(trafficOperationService, 'pay').mockResolvedValue('receipt-42');
    await trafficExitService.settle({ ...bill, PayType });
    expect(pay).toHaveBeenCalledExactlyOnceWith(42);
  });
  it.each([{ CommonCost: 0 }, { PayType: 1 }, { PayType: 2 }, { PayType: 3 }, { PayType: 8 }])('avoids another charge for free or paid bills %j', overrides => {
    const pay = vi.spyOn(trafficOperationService, 'pay');
    return trafficExitService.settle({ ...bill, ...overrides }).then(() => expect(pay).not.toHaveBeenCalled());
  });
  it.each([null, '', ' ', { receipt: 'invalid' }])('keeps the committed exit when the receipt is invalid %j', async receipt => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(bill)).mockResolvedValueOnce(response(receipt));
    const result = await trafficExitService.complete(input, null, false);
    expect(result).toMatchObject({ bill, settlement: 'failed' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('does not request payment when exit fails', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(null, 7));
    await expect(trafficExitService.complete(input, null, false)).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([{ CommonCost: null }, { CommonCost: -1 }, { DumpId: 0 }, { DumpId: true }, { ExitDateTime: null }, { PayType: 99 }, { PayType: 5 }, { PayType: null }, { PayType: '' }])('rejects an invalid bill before payment %j', async overrides => {
    const pay = vi.spyOn(trafficOperationService, 'pay');
    await expect(trafficExitService.settle({ ...bill, ...overrides })).rejects.toThrow();
    expect(pay).not.toHaveBeenCalled();
  });
});
