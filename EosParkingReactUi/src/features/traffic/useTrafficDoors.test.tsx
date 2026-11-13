import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTrafficDoors } from './useTrafficDoors';
import type { TrafficDoorOption } from './trafficRecordsService';
afterEach(cleanup);
it('ignores a previous parking response and preserves the requested history door', async () => {
  let finishOld!: (doors: TrafficDoorOption[]) => void;
  const service = { doors: vi.fn().mockImplementationOnce(() => new Promise<TrafficDoorOption[]>(resolve => { finishOld = resolve; }))
    .mockResolvedValueOnce([{ id: 20, label: 'First' }, { id: 21, label: 'Requested' }]) };
  const { result, rerender } = renderHook(({ parkingId }) => useTrafficDoors(parkingId, '21', service), { initialProps: { parkingId: 1 } });
  rerender({ parkingId: 2 });
  await waitFor(() => expect(result.current.doorId).toBe('21'));
  await act(async () => { finishOld([{ id: 10, label: 'Old' }]); });
  expect(result.current.doors.map(door => door.id)).toEqual([20, 21]);
  expect(result.current.doorId).toBe('21');
});
