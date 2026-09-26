import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraStreamPreview } from './CameraStreamPreview';
import { cameraApi } from '../../api/management';

vi.mock('../../api/management', async () => {
  const actual = await vi.importActual<typeof import('../../api/management')>('../../api/management');
  return {
    ...actual,
    cameraApi: {
      ...actual.cameraApi,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getStatus: vi.fn(),
      getRois: vi.fn(),
    },
  };
});

const mockedCameraApi = vi.mocked(cameraApi);
const camera = { cameraId: 'gate-1', name: 'Gate 1' };

describe('CameraStreamPreview lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCameraApi.disconnect.mockResolvedValue(undefined);
    mockedCameraApi.getStatus.mockResolvedValue({ cameraId: camera.cameraId, state: 'Disconnected', error: null, viewerCount: 0, streamUrl: '', webRtcUrl: '', lastStateChangeUtc: '' });
    mockedCameraApi.getRois.mockResolvedValue([]);
  });

  it('disconnects a session that finishes connecting after the preview unmounts', async () => {
    let resolveConnect: (value: unknown) => void = () => undefined;
    mockedCameraApi.connect.mockReturnValue(new Promise((resolve) => { resolveConnect = resolve; }));

    const view = render(<CameraStreamPreview camera={camera} language="en" viewer="viewer-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));
    await waitFor(() => expect(mockedCameraApi.connect).toHaveBeenCalledTimes(1));

    view.unmount();
    await act(async () => {
      resolveConnect({ streamUrl: '/stream.m3u8', webRtcUrl: '/whep' });
    });

    await waitFor(() => expect(mockedCameraApi.disconnect.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(mockedCameraApi.getRois).not.toHaveBeenCalled();
  });
});
