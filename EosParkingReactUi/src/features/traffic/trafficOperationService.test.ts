import { afterEach, describe, expect, it, vi } from 'vitest';
import { trafficOperationService, trafficResult, hasOpenTraffic } from './trafficOperationService';

const json = (Values: unknown, ResponseResultType: unknown = 1, Message = '') => new Response(JSON.stringify({ Values, ResponseResultType, Message }), { headers: { 'content-type': 'application/json' } });
const input = { parkingId: 7, doorId: 8, userId: 9, plate: '12ب34567', carType: 0, info: { CarId: 10, MemberId: 11, CardId: 12, MemberTariffId: 13 } };
const openInfo = { ...input.info, DumpId: 42, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: null, ExitPermission: true };

describe('traffic registration contract', () => {
  afterEach(() => vi.restoreAllMocks());
  it.each([1, '1'])('accepts the documented success value %j with either envelope casing', resultType => {
    expect(trafficResult({ ResponseResultType: resultType, Values: 42 })).toBe(42);
    expect(trafficResult({ responseResultType: resultType, values: 42 })).toBe(42);
  });
  it.each(['ok', 'OK', 'Ok', 0, 2, 9, '', null, undefined, true])('rejects an uncontracted success value %j', resultType => {
    expect(() => trafficResult({ ResponseResultType: resultType, Values: { Id: 42 } })).toThrow('Traffic operation failed');
  });
  it('does not confirm a payment from an uncontracted ok result, even with a receipt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(json('receipt-42', 'ok'));
    await expect(trafficOperationService.pay(42)).rejects.toThrow('Traffic operation failed');
  });
  it('rejects entry at exit-only/internal doors and exit at entry-only/internal doors before sending a mutation', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    for (const doorType of [1, 3] as const) await expect(trafficOperationService.enter({ ...input, doorType })).rejects.toHaveProperty('messageKey', 'directionUnavailable');
    for (const doorType of [0, 3] as const) await expect(trafficOperationService.exit({ ...input, info: openInfo, doorType }, null)).rejects.toHaveProperty('messageKey', 'directionUnavailable');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('posts a live entry with resolved identifiers and lets the server set entry time', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ Id: 42, EnterDateTime: '2026-11-10T08:00:00' }));
    expect(await trafficOperationService.enter(input)).toHaveProperty('Id', 42);
    expect(fetch.mock.calls[0][0]).toContain('/api/traffic/CreateEnterDump');
    expect(fetch.mock.calls[0][1]?.method).toBe('POST');
    const payload = JSON.parse(String(fetch.mock.calls[0][1]?.body));
    expect(payload).toMatchObject({ Id: 0, DoorId: 8, CarId: 10, MemberId: 11, CardId: 12, TariffId: 13, PersistBy: 9, SourceType: 2, DoSave: true });
    expect(payload).not.toHaveProperty('EnterDateTime');
    expect(payload).not.toHaveProperty('ExitDateTime');
  });
  it('uses this parking’s current tariff for a non-member exit and commits before payment', async () => {
    const bill = { DumpId: 42, ExitDateTime: '2026-11-10T10:00:00', CommonCost: 5000 };
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json([{ Id: 20, IsCurrent: false }, { Id: 21, IsCurrent: true }])).mockResolvedValueOnce(json(bill));
    expect(await trafficOperationService.exit({ ...input, info: { ...openInfo, MemberTariffId: 0 } }, null)).toEqual(bill);
    expect(fetch.mock.calls[0][0]).toContain('GetByParkingId?parkingId=7');
    expect(fetch.mock.calls[1][0]).toContain('/DoExitDump');
    const payload = JSON.parse(String(fetch.mock.calls[1][1]?.body));
    expect(payload).toMatchObject({ Id: 42, ExitDoorId: 8, TariffId: 21, DoSave: true, ExitDateTime: null, EnterDateTime: openInfo.EnterDateTime });
    expect(payload).not.toHaveProperty('DoorId');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('rejects backend failures even when HTTP is 200 and retains the public validation message', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => json(null, 7, 'ورودی یافت نشد'));
    await expect(trafficOperationService.exit({ ...input, info: openInfo }, null)).rejects.toHaveProperty('userMessage', 'ورودی یافت نشد');
    await expect(trafficOperationService.enter(input)).rejects.toHaveProperty('userMessage', 'ورودی یافت نشد');
    await expect(trafficOperationService.pay(42)).rejects.toHaveProperty('userMessage', 'ورودی یافت نشد');
  });
  it('does not expose internal errors or accept malformed success results', async () => {
    expect(() => trafficResult({ ResponseResultType: 2, RealMessage: 'database credentials' })).toThrow('Traffic operation failed');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => json({}));
    await expect(trafficOperationService.lookup(7, input.plate, '', '')).rejects.toThrow();
    await expect(trafficOperationService.enter(input)).rejects.toThrow();
    await expect(trafficOperationService.exit({ ...input, info: openInfo }, null)).rejects.toThrow();
  });
  it('requires a nonempty receipt before confirming a cash payment', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json('receipt-42'));
    expect(await trafficOperationService.pay(42)).toBe('receipt-42');
    expect(fetch.mock.calls[0][0]).toContain('/PayDump?dumpId=42&payType=1&transactionResponse=');
    for (const result of [null, '', ' ', true, {}]) {
      fetch.mockResolvedValueOnce(json(result));
      await expect(trafficOperationService.pay(42)).rejects.toThrow();
    }
  });
  it('recognizes a null or DateTime.MinValue exit as an open entry and prevents duplicate entry', async () => {
    expect(hasOpenTraffic({ ...openInfo, ExitDateTime: '0001-01-01T00:00:00' })).toBe(true);
    expect(hasOpenTraffic({ ...openInfo, EnterDateTime: '0001-01-01T00:00:00' })).toBe(false);
    const fetch = vi.spyOn(globalThis, 'fetch');
    await expect(trafficOperationService.enter({ ...input, info: openInfo })).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
