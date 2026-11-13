import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseShahabDetectionConfig } from './shahabDetectionConfig';
import { ShahabTrafficRealtimeConnection } from './shahabTrafficRealtime';
import { loadLegacySignalRClient, type LegacySignalRConnection, type LegacySignalRProxy } from './legacySignalRClient';

vi.mock('./legacySignalRClient', () => ({ loadLegacySignalRClient: vi.fn() }));

function transport() {
  const handlers: Record<string, (value?: unknown) => void> = {};
  let requestId = '';
  const proxy: LegacySignalRProxy = {
    on: vi.fn((name, handler) => { handlers[name] = handler; return proxy; }),
    invoke: vi.fn(async (method, ...args) => {
      if (method === 'getPicture') return 'iVBORw0KGgo=';
      if (method === 'getHistory') return { RequestId: requestId, DoorId: args[0], ServerTimeUtc: '2026-11-11T12:00:00Z',
        DayStartUtc: '2026-11-11T00:00:00Z', DayEndUtc: '2026-11-12T00:00:00Z', Items: [] };
      requestId = String(args[1]);
      return { RequestId: requestId, DoorId: args[0], CameraCount: 2, ServerTimeUtc: '2026-11-11T12:00:00Z' };
    }),
  };
  const connection: LegacySignalRConnection = {
    start: vi.fn(async () => undefined), stop: vi.fn(() => handlers.disconnected?.()), createHubProxy: vi.fn(() => proxy),
    disconnected: handler => { handlers.disconnected = handler; }, reconnecting: handler => { handlers.reconnecting = handler; },
    reconnected: handler => { handlers.reconnected = handler; }, error: handler => { handlers.error = handler; },
  };
  const hubConnection = vi.fn(() => connection);
  vi.mocked(loadLegacySignalRClient).mockResolvedValue({ hubConnection } as unknown as Awaited<ReturnType<typeof loadLegacySignalRClient>>);
  return { handlers, proxy, connection, hubConnection, record: (overrides = {}) => ({
    RequestId: requestId, DoorId: 8, CameraId: '17', DetectorCameraId: 3, Direction: 'entry',
    EventId: 'shahab:3:21:entry', RecordId: '21', PlateText: '12ب34567',
    OccurredAtUtc: '2026-11-11T12:00:00Z', ServerTimeUtc: '2026-11-11T12:00:01Z', ...overrides,
  }) };
}

describe('desktop-compatible Shahab activation', () => {
  it('uses the same db:// camera setting, including legacy extra fields, without reading SQL credentials', () => {
    expect(parseShahabDetectionConfig('db://cameraid=3')).toEqual({ cameraId: 3 });
    expect(parseShahabDetectionConfig(' DB://ip=server;port=1433;user=legacy;cameraid=003;imageport=9002; ')).toEqual({ cameraId: 3 });
    for (const value of ['', 'ws://cameraid=3', 'db://ip=server', 'db://cameraid=0', 'db://cameraid=1x', 'db://cameraid=1;cameraid=2', 'db://cameraid=2147483648']) {
      expect(parseShahabDetectionConfig(value)).toBeNull();
    }
  });
});

describe('Shahab traffic SignalR lifecycle', () => {
  let feed: ShahabTrafficRealtimeConnection;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { feed?.stop(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it('loads today’s bounded snapshot separately from live detection and refreshes it after reconnect', async () => {
    const mock = transport(); const detected = vi.fn(); const snapshot = vi.fn(); const historyStatus = vi.fn();
    const original = mock.proxy.invoke;
    mock.proxy.invoke = vi.fn(async (method, ...args) => method === 'getHistory'
      ? { RequestId: mock.record().RequestId, DoorId: 8, ServerTimeUtc: '2026-11-11T12:00:00Z',
        DayStartUtc: '2026-11-11T00:00:00Z', DayEndUtc: '2026-11-12T00:00:00Z',
        Items: [mock.record({ OccurredAtUtc: '2026-11-11T08:00:00Z', IsRepeated: true })] }
      : original(method, ...args));
    feed = new ShahabTrafficRealtimeConnection(8, detected, vi.fn(), undefined, snapshot, historyStatus);
    await feed.start(); await Promise.resolve();
    expect(snapshot).toHaveBeenCalledWith(expect.objectContaining({ items: [expect.objectContaining({ plateText: '12ب34567', suppressAutomaticInput: true })] }));
    expect(detected).not.toHaveBeenCalled();
    expect(historyStatus).toHaveBeenLastCalledWith('ready');
    expect(vi.mocked(mock.proxy.invoke).mock.calls.filter(call => call[0] === 'getPicture')).toHaveLength(0);
    const history = snapshot.mock.calls[0][0];
    await expect(history.loadArtifact('shahab:3:21:entry', 'PlateCrop')).resolves.toMatch(/^data:image\/png/);
    expect(mock.proxy.invoke).toHaveBeenLastCalledWith('getPicture', 8, '21', 'PlateCrop');
    await expect(history.loadArtifact('missing-record', 'PlateCrop')).resolves.toBeNull();
    mock.handlers.reconnected(); await vi.advanceTimersByTimeAsync(0);
    expect(snapshot).toHaveBeenCalledTimes(2);
    feed.stop();
    await expect(history.loadArtifact('shahab:3:21:entry', 'FullFrameRaw')).resolves.toBeNull();
  });

  it('rejects out-of-day snapshots and never presents them as successful history', async () => {
    const mock = transport(); const snapshot = vi.fn(); const historyStatus = vi.fn(); const original = mock.proxy.invoke;
    mock.proxy.invoke = vi.fn(async (method, ...args) => method === 'getHistory'
      ? { RequestId: mock.record().RequestId, DoorId: 8, ServerTimeUtc: '2026-11-11T12:00:00Z', DayStartUtc: '2026-11-11T00:00:00Z', DayEndUtc: '2026-11-12T00:00:00Z',
        Items: [mock.record({ OccurredAtUtc: '2026-11-10T23:59:59Z', IsRepeated: false })] } : original(method, ...args));
    feed = new ShahabTrafficRealtimeConnection(8, vi.fn(), vi.fn(), undefined, snapshot, historyStatus);
    await feed.start(); await Promise.resolve();
    expect(snapshot).not.toHaveBeenCalled();
    expect(historyStatus).toHaveBeenLastCalledWith('error');
  });

  it('refreshes the snapshot at server midnight without replaying historical plates', async () => {
    const mock = transport(); const snapshot = vi.fn(); const detected = vi.fn(); const original = mock.proxy.invoke;
    let reads = 0;
    mock.proxy.invoke = vi.fn(async (method, ...args) => {
      if (method !== 'getHistory') return original(method, ...args);
      reads++;
      return { RequestId: mock.record().RequestId, DoorId: 8, Items: [],
        ServerTimeUtc: reads === 1 ? '2026-11-11T23:59:59Z' : '2026-11-12T00:00:01Z',
        DayStartUtc: reads === 1 ? '2026-11-11T00:00:00Z' : '2026-11-12T00:00:00Z',
        DayEndUtc: reads === 1 ? '2026-11-12T00:00:00Z' : '2026-11-13T00:00:00Z' };
    });
    feed = new ShahabTrafficRealtimeConnection(8, detected, vi.fn(), undefined, snapshot);
    await feed.start(); await vi.advanceTimersByTimeAsync(1050);
    expect(snapshot).toHaveBeenCalledTimes(2);
    expect(snapshot).toHaveBeenLastCalledWith(expect.objectContaining({ dayStartUtc: '2026-11-12T00:00:00Z' }));
    expect(detected).not.toHaveBeenCalled();
  });

  it('timestamps actual messages, including idle heartbeats, but not retries, errors or invalid messages', async () => {
    vi.setSystemTime(new Date('2026-11-12T10:00:00Z'));
    const mock = transport(); const onMessage = vi.fn(); const onDetection = vi.fn(); const status = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, onDetection, status, onMessage);
    await feed.start();
    expect(onMessage).toHaveBeenLastCalledWith('2026-11-12T10:00:00.000Z');
    await vi.advanceTimersByTimeAsync(15000);
    const state = { RequestId: mock.record().RequestId, DoorId: 8, Code: 'connected' };
    mock.handlers.trafficDetectionState(state);
    expect(onMessage).toHaveBeenLastCalledWith('2026-11-12T10:00:15.000Z');
    expect(onDetection).not.toHaveBeenCalled();
    mock.handlers.trafficDetectionState({ ...state, RequestId: 'old-request' });
    mock.handlers.trafficDetectionState({ ...state, DoorId: 9 });
    mock.handlers.trafficDetectionState({ ...state, Code: 'unknown' });
    mock.handlers.trafficPlateDetected(mock.record({ EventId: 'stale', ServerTimeUtc: '2026-11-11T12:01:00Z' }));
    mock.handlers.error();
    mock.handlers.reconnecting();
    expect(onMessage).toHaveBeenCalledTimes(2);
    mock.handlers.trafficDetectionState({ ...state, Code: 'unavailable' });
    await vi.advanceTimersByTimeAsync(1000);
    mock.handlers.trafficPlateDetected(mock.record());
    expect(onMessage).toHaveBeenLastCalledWith('2026-11-12T10:00:16.000Z');
    expect(status).toHaveBeenLastCalledWith('unavailable');
    const count = onMessage.mock.calls.length;
    feed.stop();
    mock.handlers.trafficDetectionState(state);
    mock.handlers.trafficPlateDetected(mock.record({ EventId: 'after-stop' }));
    expect(onMessage).toHaveBeenCalledTimes(count);
  });

  it('expires silent connections after 45 seconds and reports disconnect immediately', async () => {
    const mock = transport(); const status = vi.fn(); const onMessage = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, vi.fn(), status, onMessage);
    await feed.start();
    await vi.advanceTimersByTimeAsync(30000);
    mock.handlers.trafficDetectionState({ RequestId: mock.record().RequestId, DoorId: 8, Code: 'connected' });
    await vi.advanceTimersByTimeAsync(44999);
    expect(status).toHaveBeenLastCalledWith('connected');
    await vi.advanceTimersByTimeAsync(1);
    expect(status).toHaveBeenLastCalledWith('unavailable');
    expect(onMessage).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);
    expect(status).toHaveBeenLastCalledWith('connected');
    mock.handlers.disconnected();
    expect(status).toHaveBeenLastCalledWith('unavailable');
  });

  it('subscribes once per door with cookies and delivers metadata before requesting either image', async () => {
    const mock = transport(); const onDetection = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, onDetection, vi.fn());
    await feed.start();
    expect(mock.hubConnection).toHaveBeenCalledWith(expect.any(String), { useDefaultPath: false, withCredentials: true });
    expect(mock.connection.createHubProxy).toHaveBeenCalledWith('shahabTrafficHub');
    expect(mock.proxy.invoke).toHaveBeenCalledWith('subscribe', 8, expect.any(String));
    mock.handlers.trafficPlateDetected(mock.record());
    expect(onDetection).toHaveBeenCalledWith(expect.objectContaining({ plateText: '12ب34567', source: { cameraId: '17', direction: 'entry' } }), expect.any(Function));
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(1);
    const loadImage = onDetection.mock.calls[0][1];
    expect(await loadImage('PlateCrop')).toBe('data:image/png;base64,iVBORw0KGgo=');
    await loadImage('PlateCrop');
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(2);
    expect(mock.proxy.invoke).toHaveBeenLastCalledWith('getPicture', 8, '21', 'PlateCrop');
    await vi.advanceTimersByTimeAsync(10000);
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(2);
  });

  it('ignores other requests, old records, malformed messages and duplicate deliveries without using the PC clock', async () => {
    const mock = transport(); const onDetection = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, onDetection, vi.fn()); await feed.start();
    mock.handlers.trafficPlateDetected(mock.record({ DoorId: 9 }));
    mock.handlers.trafficPlateDetected(mock.record({ RequestId: 'old-door' }));
    mock.handlers.trafficPlateDetected(mock.record({ OccurredAtUtc: '2026-11-11T11:57:00Z' }));
    mock.handlers.trafficPlateDetected(mock.record({ RecordId: -1 }));
    mock.handlers.trafficPlateDetected('invalid');
    expect(onDetection).not.toHaveBeenCalled();
    mock.handlers.trafficPlateDetected(mock.record()); mock.handlers.trafficPlateDetected(mock.record());
    expect(onDetection).toHaveBeenCalledTimes(1);
  });

  it('keeps repeated observations visible while suppressing automatic input separately for each camera and direction', async () => {
    const mock = transport(); const onDetection = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, onDetection, vi.fn()); await feed.start();
    mock.handlers.trafficPlateDetected(mock.record());
    mock.handlers.trafficPlateDetected(mock.record({ EventId: 'second', RecordId: '22' }));
    mock.handlers.trafficPlateDetected(mock.record({ EventId: 'exit', RecordId: '23', CameraId: '18', DetectorCameraId: 4, Direction: 'exit' }));
    expect(onDetection.mock.calls.map(call => call[0].suppressAutomaticInput)).toEqual([false, true, false]);
  });

  it('re-subscribes after reconnect and stops retrying or delivering after access denial or disposal', async () => {
    const mock = transport(); const onDetection = vi.fn(); const status = vi.fn();
    feed = new ShahabTrafficRealtimeConnection(8, onDetection, status); await feed.start();
    mock.handlers.reconnected(); await Promise.resolve();
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(2);
    mock.handlers.disconnected(); await vi.advanceTimersByTimeAsync(2000);
    expect(mock.hubConnection).toHaveBeenCalledTimes(2);
    const record = mock.record();
    mock.handlers.trafficDetectionState({ RequestId: record.RequestId, DoorId: 8, Code: 'forbidden' });
    expect(status).toHaveBeenLastCalledWith('forbidden');
    mock.handlers.trafficPlateDetected(record); await vi.advanceTimersByTimeAsync(60000);
    expect(onDetection).not.toHaveBeenCalled();
    expect(mock.hubConnection).toHaveBeenCalledTimes(2);
  });
});
