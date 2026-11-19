import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../api/client';
import { equipmentService } from './equipmentService';

vi.mock('../../api/client', async importOriginal => ({ ...await importOriginal<typeof import('../../api/client')>(), apiRequest: vi.fn() }));
const request = vi.mocked(apiRequest);
const ok = (Values: unknown) => ({ ResponseResultType: 1, Values });
beforeEach(() => vi.clearAllMocks());

describe('equipment API contract', () => {
  it('uses equipmentId for deletion and requires an explicit true result', async () => {
    request.mockResolvedValueOnce(ok(true));
    await expect(equipmentService.delete(42)).resolves.toBe(true);
    expect(request).toHaveBeenCalledWith('api/Parking/DeleteEquipmentById?equipmentId=42');
    request.mockResolvedValueOnce(ok(false));
    await expect(equipmentService.delete(42)).rejects.toThrow();
  });

  it.each([0, -1, null, '42'])('does not report a successful save for Values=%s', async value => {
    request.mockResolvedValueOnce(ok(value));
    await expect(equipmentService.save({ Id: 0 })).rejects.toThrow();
  });

  it('checks the body result even when the server returned HTTP 200', async () => {
    request.mockResolvedValueOnce({ ResponseResultType: 21, Values: 42, RealMessage: 'private SQL detail' });
    await expect(equipmentService.save({ Id: 0 })).rejects.toMatchObject({ status: 400, body: { ResponseResultType: 21 } });
  });

  it('validates the list instead of displaying a failed envelope as an empty list', async () => {
    request.mockResolvedValueOnce({ ResponseResultType: 6, Values: null });
    await expect(equipmentService.getAll(7)).rejects.toThrow();
    request.mockResolvedValueOnce(ok([{ Id: 42, DeviceType: 1, DeviceName: 'Gate' }]));
    await expect(equipmentService.getAll(7)).resolves.toHaveLength(1);
  });

  it('sends the current settings in exactly one independent POST and validates the result', async () => {
    const settings = { ParkingId: 7, DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, ComPort: null, BoudRate: 9600, ReadTimeOut: 3000, WriteTimeOut: 3000 };
    const reply = { Status: 'connected', Connected: true, CheckedAtUtc: '2026-11-18T08:00:00Z' };
    request.mockResolvedValueOnce(reply);
    const signal = new AbortController().signal;
    await expect(equipmentService.testConnection(settings, signal)).resolves.toEqual(reply);
    expect(request).toHaveBeenCalledExactlyOnceWith('api/Equipment/TestConnection', {
      method: 'POST', body: JSON.stringify(settings), signal, timeoutMs: 15_000,
    });
  });

  it.each([
    { Status: 'connected', Connected: false, CheckedAtUtc: '2026-11-18T08:00:00Z' },
    { Status: 'connected', Connected: true, CheckedAtUtc: 'invalid' },
    { Status: 'unknown', Connected: true, CheckedAtUtc: '2026-11-18T08:00:00Z' },
  ])('rejects malformed or contradictory test results: %o', async reply => {
    request.mockResolvedValueOnce(reply);
    await expect(equipmentService.testConnection({ ParkingId: 7, DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, ComPort: null, BoudRate: 9600, ReadTimeOut: 3000, WriteTimeOut: 3000 }, new AbortController().signal)).rejects.toThrow();
  });
});
