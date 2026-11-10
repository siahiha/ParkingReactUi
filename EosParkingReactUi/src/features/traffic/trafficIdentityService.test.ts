import { afterEach, describe, expect, it, vi } from 'vitest';
import { trafficIdentityService, parseTrafficIdentity } from './trafficIdentityService';
import { parseTrafficQr } from './trafficQr';
import { trafficAlerts } from './trafficPolicy';
import { trafficOperationService } from './trafficOperationService';
import { trafficImage } from './trafficImages';
import { appConfig } from '../../config';

const json = (Values: unknown) => new Response(JSON.stringify({ ResponseResultType: 1, Values }), { headers: { 'content-type': 'application/json' } });
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
const vehicle = { Id: 10, Plate: '12ب34567', CarType: 0, Name: 'پژو', DtoViewCarColorTitle: 'سفید', DtoViewCarModelTitle: '۱۴۰۰' };
const info = { DumpId: 42, Plate: vehicle.Plate, CarId: 10, MemberId: 11, MemberTariffId: 13, EnterDateTime: '2026-11-10T08:00:00', ExitPermission: true };
const input = { parkingId: 7, doorId: 8, plate: vehicle.Plate, carType: 0, info };
function qrCode(value: string) {
  const checksum = [...value.replace(/#/g, '')].reduce((sum, digit) => sum + Number(digit), 0) % 9;
  const reversed = [...value].reverse().join('');
  return `!@^${reversed.slice(0, 3)}${checksum}${reversed.slice(3)}!@^`;
}
const defaultRequireExitPermission = appConfig.trafficRequireExitPermission;
afterEach(() => { vi.restoreAllMocks(); appConfig.trafficRequireExitPermission = defaultRequireExitPermission; });

describe('traffic safety decisions', () => {
  it.each([
    [{ IsMemberBlock: true }, 'enter', 'inactiveMember', true],
    [{ ControlType: 1, ControlListActionType: 1 }, 'enter', 'blacklisted', true],
    [{ ControlType: 2 }, 'exit', 'observation', false],
    [{ ControlType: 3 }, 'enter', 'stolen', false],
    [{ ControlType: 3 }, 'exit', 'stolen', true],
    [{ ExitPermission: false }, 'exit', 'exitNotApproved', true],
  ] as const)('shows the correct decision for %j during %s', (policy, direction, key, blocked) => {
    expect(trafficAlerts({ ...info, ...policy }, direction, true)).toContainEqual(expect.objectContaining({ key, blocked }));
  });
  it('respects entry/exit scope and disables exit permission checks by default', async () => {
    expect(trafficAlerts({ ControlType: 1, ControlListActionType: 2 }, 'enter', true)).toEqual([]);
    expect(trafficAlerts({ ExitPermission: false }, 'exit', false)).toEqual([]);
    expect(appConfig.trafficRequireExitPermission).toBe(false);
    const bill = { DumpId: 42, ExitDateTime: '2026-11-10T09:00:00' };
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json(bill));
    await expect(trafficOperationService.exit({ ...input, info: { ...info, ExitPermission: false } }, null)).resolves.toEqual(bill);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it.each([
    [{ IsMemberBlock: true }, 'enter'], [{ ControlType: 1 }, 'enter'], [{ ControlType: 3 }, 'exit'], [{ ExitPermission: null }, 'exit'],
  ] as const)('never sends a mutation for a blocked operation', async (policy, direction) => {
    appConfig.trafficRequireExitPermission = true;
    const fetch = vi.spyOn(globalThis, 'fetch');
    await expect(direction === 'enter' ? trafficOperationService.enter({ ...input, info: { ...info, ...policy } })
      : trafficOperationService.exit({ ...input, info: { ...info, ...policy } }, null)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('rich identity and QR', () => {
  it('preserves all vehicles, photos and authoritative policy fields', () => {
    const result = parseTrafficIdentity({ ...info, MemberCars: [vehicle, { ...vehicle, Id: 20 }], MemberPersonalPhoto: png, EnteranceImage: png, ControlType: 2 });
    expect(result.cars).toHaveLength(2);
    expect(result.personalPhoto).toBe(`data:image/png;base64,${png}`);
    expect(result.entranceImage).toBe(result.personalPhoto);
    expect(result.info.ControlType).toBe(2);
    expect(() => parseTrafficIdentity({ ...info, ControlType: 99 })).toThrow();
  });
  it('keeps active and reserved memberships and uses CashAmount', async () => {
    const credit = { CashAmount: 9000, RegisterStartDateTime: '2026-01-01', RegisterEndDateTime: '2027-01-01', IsActive: true, MembershipCreditType: 0 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json({ ...info, MemberCars: [vehicle] }))
      .mockResolvedValueOnce(json([credit, { ...credit, IsActive: false }]));
    const result = await trafficIdentityService.lookup(7, vehicle.Plate, '', '');
    expect(result.credits.map(item => item.IsActive)).toEqual([true, false]);
    expect(result.credits[0].CashAmount).toBe(9000);
  });
  it('decodes the Windows QR and verifies it against both the bill and current parking lookup', async () => {
    const code = qrCode('42#120134567#76101#1234');
    expect(parseTrafficQr(code)).toEqual({ dumpId: 42, plate: vehicle.Plate, memberCode: '76101', cardNumber: '1234' });
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json({ DumpId: 42, ParkingId: 8, PayType: 0, CarPlate: vehicle.Plate }))
      .mockResolvedValueOnce(json({ ...info, MemberId: 0 }));
    expect((await trafficIdentityService.lookup(7, '', code, '')).info.DumpId).toBe(42);
    expect(String(fetch.mock.calls[1][0])).toContain('parkingId=7');
    expect(String(fetch.mock.calls[1][0])).toContain('memberCard=1234');
  });
  it('rejects damaged, settled and mismatched QR codes', async () => {
    const code = qrCode('42#120134567#76101#1234');
    expect(parseTrafficQr('!@^broken!@^')).toBeNull();
    expect(parseTrafficQr(code.replace('!@^', '!@^9'))).toBeNull();
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json({ DumpId: 42, PayType: 1, CarPlate: vehicle.Plate }));
    await expect(trafficIdentityService.lookup(7, '', code, '')).rejects.toHaveProperty('messageKey', 'invalidQr');
    expect(fetch).toHaveBeenCalledTimes(1);
    fetch.mockResolvedValueOnce(json({ DumpId: 42, PayType: 0, CarPlate: vehicle.Plate }))
      .mockResolvedValueOnce(json({ DumpId: 100, MemberId: 0 }));
    await expect(trafficIdentityService.lookup(7, '', code, '')).rejects.toHaveProperty('messageKey', 'invalidQr');
  });
  it('saves a vehicle using the existing encoded contract and checks business errors', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json(10));
    await expect(trafficIdentityService.saveVehicle(11, { plate: vehicle.Plate, name: 'نام & خودرو', carType: 0, color: 'سفید', model: '۱۴۰۰' })).resolves.toBe(10);
    const query = new URL(String(fetch.mock.calls[0][0])).searchParams;
    expect(query.get('CarName')).toBe('نام & خودرو');
    expect(query.get('memberId')).toBe('11');
    fetch.mockResolvedValueOnce(json(0));
    await expect(trafficIdentityService.saveVehicle(11, { plate: vehicle.Plate, name: 'پژو', carType: 0, color: '', model: '' })).rejects.toThrow();
  });
});

describe('traffic images', () => {
  it('rejects non-image, active content and oversized payloads', () => {
    expect(trafficImage('data:image/svg+xml;base64,PHN2Zz4=' )).toBeNull();
    expect(trafficImage(btoa('not an image'))).toBeNull();
    expect(trafficImage('A'.repeat(700000))).toBeNull();
  });
});
