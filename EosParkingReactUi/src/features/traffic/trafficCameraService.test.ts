import { beforeEach, expect, it, vi } from 'vitest';
import { parkingApi } from '../../api/management';
import { trafficCameraService } from './trafficCameraService';
vi.mock('../../api/management', () => ({ parkingApi: { getDoor: vi.fn(), getDoorDevices: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
const labels = { entry: 'Entry camera', exit: 'Exit camera' };
it.each([false, true])('reads the controller equipment pairs when the optional device request fails: %s', async (devicesFail) => {
  // ParkingDoorEntity ignores the camera navigation properties in JSON. The
  // controller includes dedicated cameras as Key/Value pairs instead.
  vi.mocked(parkingApi.getDoor).mockResolvedValue({ ResponseResultType: 1, Values: {
    Id: 8, EnteranceCameraId: 17, ExitCameraId: 18,
    DtoViewEquipments: [
      { Key: { Id: 9, DeviceType: 1, DeviceName: 'Gate' }, Value: 0 },
      { Key: { Id: 18, DeviceType: 0, DeviceName: 'North exit', DetectionServerAddress: 'shahab://exit' }, Value: 1 },
      { Key: { Id: 17, DeviceType: 0, DeviceName: 'North entry', DetectionServerAddress: 'shahab://entry' }, Value: 0 },
    ],
  } });
  if (devicesFail) vi.mocked(parkingApi.getDoorDevices).mockRejectedValue(new Error('Device lookup unavailable'));
  else vi.mocked(parkingApi.getDoorDevices).mockResolvedValue({ ResponseResultType: 1, Values: [{ DeviceId: 9, DeviceType: 1 }] });

  const result = await trafficCameraService.load(8, labels);
  expect(result.entry).toMatchObject({ cameraId: '17', name: 'North entry', direction: 'entry', detectionServerAddress: 'shahab://entry' });
  expect(result.exit).toMatchObject({ cameraId: '18', name: 'North exit', direction: 'exit', detectionServerAddress: 'shahab://exit' });
});

it('retains raw device arrays instead of reading Array.prototype.values as a response envelope', async () => {
  vi.mocked(parkingApi.getDoor).mockResolvedValue({ Values: { Id: 8 } });
  vi.mocked(parkingApi.getDoorDevices).mockResolvedValue([{ DeviceId: 20, DeviceType: 0 }, { DeviceId: 21, DeviceType: 0 }]);
  const result = await trafficCameraService.load(8, labels);
  expect(result.entry?.cameraId).toBe('20');
  expect(result.exit?.cameraId).toBe('21');
});

it('prefers explicitly configured entry and exit cameras over fallback devices', async () => {
  vi.mocked(parkingApi.getDoor).mockResolvedValue({ Values: { EnteranceCamera: { Id: 10, DeviceName: 'In' }, ExitCamera: { Id: 11, DeviceName: 'Out' } } });
  vi.mocked(parkingApi.getDoorDevices).mockResolvedValue({ Values: [{ Id: 20, DeviceType: 0 }] });
  const result = await trafficCameraService.load(8, labels);
  expect(result.entry).toMatchObject({ cameraId: '10', name: 'In', direction: 'entry' });
  expect(result.exit).toMatchObject({ cameraId: '11', name: 'Out', direction: 'exit' });
});
it('reads a wrapped device list and assigns translated fallback labels', async () => {
  vi.mocked(parkingApi.getDoor).mockResolvedValue({ Values: { Id: 8 } });
  vi.mocked(parkingApi.getDoorDevices).mockResolvedValue({ Values: [{ Id: 20, DeviceType: 0 }, { Id: 21, DeviceType: 0 }] });
  const result = await trafficCameraService.load(8, labels);
  expect(result.entry).toMatchObject({ cameraId: '20', name: labels.entry });
  expect(result.exit).toMatchObject({ cameraId: '21', name: labels.exit });
});
