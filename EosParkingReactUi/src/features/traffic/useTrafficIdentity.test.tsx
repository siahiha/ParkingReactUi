import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTrafficIdentity } from './useTrafficIdentity';
import { trafficIdentityService } from './trafficIdentityService';

afterEach(() => vi.restoreAllMocks());
const details = { info: { DumpId: 0 }, cars: [], credits: [], creditError: false, personalPhoto: null, entranceImage: null };
it('allows repeated card reads and cancels old lookups on door change', async () => {
  const lookup = vi.spyOn(trafficIdentityService, 'lookup').mockResolvedValue(details);
  const { result, rerender } = renderHook(({ door }) => useTrafficIdentity(7, door, false), { initialProps: { door: '8' } });
  await act(async () => { await result.current.lookup('', '1234', ''); });
  await expect(result.current.lookup('', '1234', '')).resolves.toEqual(details);
  expect(lookup).toHaveBeenCalledTimes(2);
  const previousSignal = lookup.mock.calls[0][4];
  await act(async () => { await result.current.lookup('', '1234', ''); });
  rerender({ door: '9' });
  expect(previousSignal?.aborted).toBe(true);
  await act(async () => { await result.current.lookup('', '1234', ''); });
  expect(lookup.mock.calls[3][4]?.aborted).toBe(false);
});
it('allows retrying failed reads and refuses vehicle writes without permission', async () => {
  vi.spyOn(trafficIdentityService, 'lookup').mockRejectedValueOnce(new Error()).mockResolvedValue(details);
  const save = vi.spyOn(trafficIdentityService, 'saveVehicle');
  const { result } = renderHook(() => useTrafficIdentity(7, '8', false));
  await expect(result.current.lookup('', '1234', '')).rejects.toThrow();
  await expect(result.current.lookup('', '1234', '')).resolves.toEqual(details);
  await expect(result.current.saveVehicle(11, { plate: '', name: '', carType: 0, color: '', model: '' })).rejects.toHaveProperty('messageKey', 'vehicleForbidden');
  expect(save).not.toHaveBeenCalled();
});
