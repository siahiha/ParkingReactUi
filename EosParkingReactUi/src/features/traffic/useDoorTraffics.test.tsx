import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDoorTraffics, TRAFFIC_REFRESH_MS } from './useDoorTraffics';

const json = (Values: unknown, status = 200) => new Response(JSON.stringify({ Values }), { status, headers: { 'content-type': 'application/json' } });
const row = (DumpId: number) => ({ DumpId, EnterDateTime: '2026-11-10T09:00:00', ExitDateTime: null, TarrifIds: [1, 2] });
describe('door traffic refresh', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('refreshes every three seconds, retains rows on transient failure, and recovers', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json([row(1)]))
      .mockRejectedValueOnce(new Error('offline')).mockResolvedValue(json([row(2)]));
    const { result } = renderHook(() => useDoorTraffics(7, true));
    await act(async () => {});
    expect(result.current.rows[0].DumpId).toBe(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(TRAFFIC_REFRESH_MS); });
    expect(result.current.rows[0].DumpId).toBe(1);
    expect(result.current.error).toBe('loadError');
    expect(result.current.loading).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(TRAFFIC_REFRESH_MS); });
    expect(result.current.rows[0].DumpId).toBe(2);
    expect(result.current.error).toBe('');
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('aborts obsolete requests and ignores late responses after a door change', async () => {
    let release: (response: Response) => void = () => {};
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() => new Promise(resolve => { release = resolve; }))
      .mockResolvedValue(json([row(2)]));
    const { result, rerender, unmount } = renderHook(({ door }) => useDoorTraffics(door, true), { initialProps: { door: 7 } });
    const firstSignal = fetch.mock.calls[0][1]?.signal;
    rerender({ door: 8 });
    await act(async () => {});
    expect(firstSignal?.aborted).toBe(true);
    await act(async () => { release(json([row(1)])); });
    expect(result.current.rows[0].DumpId).toBe(2);
    unmount();
    await vi.advanceTimersByTimeAsync(10000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('does not overlap polling with a pending request or a manual refresh', async () => {
    let release: (response: Response) => void = () => {};
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => { release = resolve; }));
    const { result } = renderHook(() => useDoorTraffics(7, true));
    await act(async () => { await vi.advanceTimersByTimeAsync(6000); });
    void result.current.refresh();
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => { release(json([row(1)])); });
  });
  it('clears inaccessible rows and stops automatic requests on forbidden responses', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json([row(1)])).mockResolvedValue(json(null, 403));
    const { result } = renderHook(() => useDoorTraffics(7, true));
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(result.current.rows).toEqual([]);
    expect(result.current.error).toBe('forbidden');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
