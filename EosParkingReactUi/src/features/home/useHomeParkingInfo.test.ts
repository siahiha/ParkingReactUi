import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parkingApi } from '../../api/management';
import { useHomeParkingInfo } from './useHomeParkingInfo';

const parkingResponse = { Values: {
  TotalParkSpaces: 100,
  OccupiedParkSpaceCount: 40,
  FreeParkSpaceCount: 60,
  DoorCount: 2,
  ServerDateTime: '2026-11-03T08:30:00Z',
  DeviceProcInfo: null,
  DoorStatuses: [],
} };

describe('useHomeParkingInfo', () => {
  const originalVisibilityState = document.visibilityState;

  afterEach(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: originalVisibilityState });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pauses polling while the browser tab is hidden and refreshes when visible again', async () => {
    vi.useFakeTimers();
    const getInfoById = vi.spyOn(parkingApi, 'getInfoById').mockResolvedValue(parkingResponse);
    const { unmount } = renderHook(() => useHomeParkingInfo(7));

    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getInfoById).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(getInfoById).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getInfoById).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('retries transient network failures with backoff', async () => {
    vi.useFakeTimers();
    const getInfoById = vi.spyOn(parkingApi, 'getInfoById')
      .mockRejectedValueOnce(new TypeError('Network unavailable'))
      .mockResolvedValueOnce(parkingResponse);
    const { result } = renderHook(() => useHomeParkingInfo(7));

    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getInfoById).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(false);

    await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });
    expect(getInfoById).toHaveBeenCalledTimes(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.data?.totalCapacity).toBe(100);
    expect(result.current.error).toBe(false);
  });
});
