import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/client';
import { equipmentService, type EquipmentConnectionResult } from './equipmentService';
import { useEquipmentConnectionTest } from './useEquipmentConnectionTest';

vi.mock('./equipmentService', () => ({ equipmentService: { testConnection: vi.fn() } }));
const testConnection = vi.mocked(equipmentService.testConnection);
const settings = { ParkingId: 7, DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, ComPort: null, BoudRate: 9600, ReadTimeOut: 3000, WriteTimeOut: 3000 };
const reply = (Status: EquipmentConnectionResult['Status'] = 'connected'): EquipmentConnectionResult => ({ Status, Connected: Status === 'connected', CheckedAtUtc: '2026-11-18T08:00:00Z' });
beforeEach(() => { vi.clearAllMocks(); testConnection.mockResolvedValue(reply()); });
afterEach(cleanup);

describe('independent equipment connection request', () => {
  it.each(['connected', 'disconnected', 'unsupported', 'invalid-config', 'timeout', 'busy', 'error', 'unavailable'] as const)('returns the one-shot result: %s', async phase => {
    testConnection.mockResolvedValueOnce(reply(phase));
    const { result } = renderHook(() => useEquipmentConnectionTest(settings));
    await act(async () => result.current.start());
    expect(testConnection).toHaveBeenCalledTimes(1);
    expect(testConnection.mock.calls[0][0]).toEqual(settings);
    expect(result.current.phase).toBe(phase);
  });

  it('cancels the HTTP request and ignores a response arriving after cancellation', async () => {
    let resolve!: (value: EquipmentConnectionResult) => void;
    testConnection.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const { result } = renderHook(() => useEquipmentConnectionTest(settings));
    act(() => { void result.current.start(); });
    const signal = testConnection.mock.calls[0][1];
    act(() => result.current.cancel());
    await act(async () => resolve(reply()));
    expect(signal.aborted).toBe(true);
    expect(result.current.phase).toBe('cancelled');
  });

  it('aborts on unmount', async () => {
    testConnection.mockReturnValueOnce(new Promise(() => undefined));
    const { result, unmount } = renderHook(() => useEquipmentConnectionTest(settings));
    act(() => { void result.current.start(); });
    unmount();
    expect(testConnection.mock.calls[0][1].aborted).toBe(true);
  });

  it('resets on changed draft settings and does not accept the old result', async () => {
    let resolve!: (value: EquipmentConnectionResult) => void;
    testConnection.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const { result, rerender } = renderHook(({ input }) => useEquipmentConnectionTest(input), { initialProps: { input: settings } });
    act(() => { void result.current.start(); });
    rerender({ input: { ...settings, Ip: '192.0.2.11' } });
    await act(async () => resolve(reply()));
    expect(result.current.phase).toBe('idle');
    await act(async () => result.current.start());
    expect(testConnection.mock.calls[1][0].Ip).toBe('192.0.2.11');
  });

  it.each([[401, 'forbidden'], [403, 'forbidden'], [400, 'invalid-config'], [503, 'unavailable'], [500, 'error']] as const)('handles HTTP %s as %s', async (status, phase) => {
    testConnection.mockRejectedValueOnce(new ApiError(status, { private: 'server detail' }));
    const { result } = renderHook(() => useEquipmentConnectionTest(settings));
    await act(async () => result.current.start());
    expect(result.current.phase).toBe(phase);
  });

  it('handles the shared client timeout', async () => {
    testConnection.mockRejectedValueOnce(new DOMException('private endpoint', 'AbortError'));
    const { result } = renderHook(() => useEquipmentConnectionTest(settings));
    await act(async () => result.current.start());
    expect(result.current.phase).toBe('timeout');
  });
});
