import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchTrafficDoor } from './trafficDoorService';

describe('manual traffic door contract', () => {
  afterEach(() => vi.restoreAllMocks());
  it('accepts numeric door types and forwards cancellation', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: { id: 8, doorType: '1' } }), { headers: { 'content-type': 'application/json' } }));
    const controller = new AbortController();
    expect(await fetchTrafficDoor(8, controller.signal)).toEqual({ id: 8, type: 1 });
    expect(fetch.mock.calls[0][0]).toContain('GetParkingDoor?doorId=8');
    expect(fetch.mock.calls[0][1]?.signal).toBeDefined();
  });
  it.each([{}, { Id: 8 }, { Id: 8, DoorType: null }, { Id: 8, DoorType: 9 }, { Id: 9, DoorType: 0 }])('rejects missing, invalid or mismatched door context: %j', async values => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: values }), { headers: { 'content-type': 'application/json' } }));
    await expect(fetchTrafficDoor(8, new AbortController().signal)).rejects.toThrow();
  });
  it.each([3, '3'])('reads the existing card-and-plate authorization setting: %s', async authorizationType => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: { Id: 8, DoorType: 2, EntryAuthorizaitionType: authorizationType } }), { headers: { 'content-type': 'application/json' } }));
    expect(await fetchTrafficDoor(8, new AbortController().signal)).toEqual({ id: 8, type: 2, authorizationType: 3 });
  });
  it('rejects an unsupported authorization setting', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: { Id: 8, DoorType: 2, EntryAuthorizaitionType: 8 } }), { headers: { 'content-type': 'application/json' } }));
    await expect(fetchTrafficDoor(8, new AbortController().signal)).rejects.toThrow();
  });
  it.each([false, true])('reads device availability without retaining the hardware configuration (disabled=%s)', async Disabled => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: { Id: 8, DoorType: 2, PcPos: { Disabled, Address: 'private-device-address' }, HaveLcdPrice: true } }), { headers: { 'content-type': 'application/json' } }));
    expect(await fetchTrafficDoor(8, new AbortController().signal)).toEqual({ id: 8, type: 2, posConfigured: !Disabled, hasPriceDisplay: true });
  });
});
