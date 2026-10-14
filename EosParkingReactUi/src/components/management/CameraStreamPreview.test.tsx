import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraStreamPreview } from './CameraStreamPreview';
import { cameraApi } from '../../api/management';
import { ApiError } from '../../api/client';

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

  it('reuses an active camera session when the backend reports another RTSP URL', async () => {
    let statusCalls = 0;
    mockedCameraApi.getStatus.mockImplementation(async () => {
      statusCalls += 1;
      return statusCalls === 1
        ? { cameraId: camera.cameraId, state: 'Disconnected', error: null, viewerCount: 0, streamUrl: '', webRtcUrl: '', lastStateChangeUtc: '' }
        : { cameraId: camera.cameraId, state: 'Connected', error: null, viewerCount: 1, streamUrl: '/shared/playlist.m3u8', webRtcUrl: '', lastStateChangeUtc: '' };
    });
    mockedCameraApi.connect.mockRejectedValue(new ApiError(500, { ExceptionMessage: 'The camera is already registered with another RTSP URL.' }));

    render(<CameraStreamPreview camera={{ ...camera, rtspUrl: 'rtsp://camera/another-path' }} language="en" viewer="viewer-2" />);
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument());
    expect(mockedCameraApi.connect).toHaveBeenCalledTimes(1);
    expect(mockedCameraApi.getRois).toHaveBeenCalledWith(camera.cameraId, 'viewer-2');
  });
});
