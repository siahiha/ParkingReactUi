import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraStreamPreview } from './CameraStreamPreview';
import { cameraApi } from '../../api/management';
import { ApiError } from '../../api/client';
import { appConfig } from '../../config';

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
const originalConfig = { ...appConfig };
afterEach(() => { cleanup(); Object.assign(appConfig, originalConfig); });

describe('CameraStreamPreview lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCameraApi.disconnect.mockResolvedValue(undefined);
    mockedCameraApi.getStatus.mockResolvedValue({ cameraId: camera.cameraId, state: 'Disconnected', error: null, viewerCount: 0, streamUrl: '', webRtcUrl: '', lastStateChangeUtc: '' });
    mockedCameraApi.getRois.mockResolvedValue([]);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
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

  it.each([
    { api: 'http://localhost:8050', media: '', expected: 'http://localhost:8050/api/rtspcamera/webrtc/gate-1/whep/viewer-1' },
    { api: '/backend', media: '', expected: `${window.location.origin}/backend/api/rtspcamera/webrtc/gate-1/whep/viewer-1` },
    { api: '/backend', media: '  ', expected: `${window.location.origin}/backend/api/rtspcamera/webrtc/gate-1/whep/viewer-1` },
    { api: '/backend', media: 'http://localhost:8051', expected: 'http://localhost:8051/api/rtspcamera/webrtc/gate-1/whep/viewer-1' },
  ])('plays WebRTC using the effective media base: $api / $media', async ({ api, media, expected }) => {
    appConfig.apiBaseUrl = api;
    appConfig.parkingServiceUrl = media;
    const reader = vi.spyOn(window, 'MediaMTXWebRTCReader').mockImplementation(function () { return { close: vi.fn() }; });
    mockedCameraApi.connect.mockResolvedValue({ status: { state: 'Connected' }, webRtcUrl: '/api/rtspcamera/webrtc/gate-1/whep/viewer-1' });
    render(<CameraStreamPreview camera={camera} language="en" viewer="viewer-1" autoConnect />);
    await waitFor(() => expect(reader).toHaveBeenCalledWith(expect.objectContaining({ url: expected })));
  });

  it('preserves an absolute WebRTC URL returned by the backend', async () => {
    appConfig.apiBaseUrl = '/backend';
    appConfig.parkingServiceUrl = 'http://localhost:8051';
    const reader = vi.spyOn(window, 'MediaMTXWebRTCReader').mockImplementation(function () { return { close: vi.fn() }; });
    mockedCameraApi.connect.mockResolvedValue({ status: { state: 'Connected' }, webRtcUrl: 'https://media.example/camera/whep' });
    render(<CameraStreamPreview camera={camera} language="en" viewer="viewer-1" autoConnect />);
    await waitFor(() => expect(reader).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://media.example/camera/whep' })));
  });

  it.each([
    { media: '', expected: `${window.location.origin}/backend/api/rtspcamera/stream/gate-1/playlist.m3u8` },
    { media: 'http://localhost:8051', expected: 'http://localhost:8051/api/rtspcamera/stream/gate-1/playlist.m3u8' },
  ])('loads the HLS playlist using the effective media base: $media', async ({ media, expected }) => {
    appConfig.apiBaseUrl = '/backend';
    appConfig.parkingServiceUrl = media;
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('#EXTM3U\n#EXTINF:1,\nsegment.ts'));
    mockedCameraApi.connect.mockResolvedValue({ status: { state: 'Connected' }, streamUrl: '/api/rtspcamera/stream/gate-1/playlist.m3u8' });
    render(<CameraStreamPreview camera={camera} language="en" viewer="viewer-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch stream protocol' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expected, { cache: 'no-store' }));
  });
});
