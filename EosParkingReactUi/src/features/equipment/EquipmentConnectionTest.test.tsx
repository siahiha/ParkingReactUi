import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n/instance';
import { equipmentService } from './equipmentService';
import { EquipmentConnectionTest } from './EquipmentConnectionTest';

vi.mock('./equipmentService', async importOriginal => ({ ...await importOriginal<typeof import('./equipmentService')>(), equipmentService: { testConnection: vi.fn() } }));
const settings = { ParkingId: 7, DeviceType: 1, ConnectionType: 1, Ip: '192.0.2.10', Port: 1001, ComPort: null, BoudRate: 9600, ReadTimeOut: 3000, WriteTimeOut: 3000 };
const testConnection = vi.mocked(equipmentService.testConnection);
beforeEach(() => { vi.clearAllMocks(); testConnection.mockResolvedValue({ Status: 'connected', Connected: true, CheckedAtUtc: '2026-11-18T08:00:00Z' }); });
afterEach(cleanup);

describe('independent equipment test controls', () => {
  it.each([2, 6, 7, 8, 99])('separates unsupported type %s without sending requests', DeviceType => {
    render(<EquipmentConnectionTest settings={{ ...settings, DeviceType }} language="en" />);
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    expect(screen.getByText('Connection testing is not yet supported for this device type.')).toBeVisible();
    expect(testConnection).not.toHaveBeenCalled();
  });

  it('tests unsaved settings without selecting a door or saving equipment', async () => {
    render(<EquipmentConnectionTest settings={settings} language="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Test connection' }));
    await waitFor(() => expect(testConnection).toHaveBeenCalledTimes(1));
    expect(testConnection.mock.calls[0][0]).toEqual(settings);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await screen.findByRole('img', { name: 'The device connection test succeeded.' })).toBeVisible();
  });

  it('prevents duplicate clicks while the single request is pending and allows cancellation', async () => {
    testConnection.mockReturnValueOnce(new Promise(() => undefined));
    render(<EquipmentConnectionTest settings={settings} language="en" />);
    const start = screen.getByRole('button', { name: 'Test connection' });
    fireEvent.click(start); fireEvent.click(start);
    expect(start).toBeDisabled();
    expect(testConnection).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel test' }));
    expect(testConnection.mock.calls[0][1].aborted).toBe(true);
    expect(screen.getByRole('img', { name: 'Connection test cancelled.' })).toBeVisible();
  });
});
