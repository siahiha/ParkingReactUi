import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ParkingMapRealtimeConnection } from './parkingMapRealtime';
import { loadLegacySignalRClient, type LegacySignalRConnection, type LegacySignalRProxy } from './legacySignalRClient';
import { parkingMapFixture } from '../features/home/parkingMapFixtures.test-support';

vi.mock('./legacySignalRClient', () => ({ loadLegacySignalRClient: vi.fn() }));

function transport() {
  const handlers: Record<string, (value?: unknown) => void> = {};
  const proxy: LegacySignalRProxy = {
    on: vi.fn((name, handler) => { handlers[name] = handler; return proxy; }),
    invoke: vi.fn(async (_method, ...args) => ({ RequestId: args[4], Page: parkingMapFixture() })),
  };
  const connection: LegacySignalRConnection = {
    start: vi.fn(async () => undefined), stop: vi.fn(() => handlers.disconnected?.()), createHubProxy: vi.fn(() => proxy),
    disconnected: handler => { handlers.disconnected = handler; }, reconnecting: handler => { handlers.reconnecting = handler; },
    reconnected: handler => { handlers.reconnected = handler; }, error: handler => { handlers.error = handler; },
  };
  const hubConnection = vi.fn(() => connection);
  vi.mocked(loadLegacySignalRClient).mockResolvedValue({ hubConnection } as unknown as Awaited<ReturnType<typeof loadLegacySignalRClient>>);
  return { handlers, proxy, connection, hubConnection };
}

describe('parking-map SignalR lifecycle', () => {
  let map: ParkingMapRealtimeConnection;
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { map?.stop(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it('subscribes using cookies and push transports, without 15-second client polling', async () => {
    const mock = transport(); const onPage = vi.fn();
    map = new ParkingMapRealtimeConnection({ parkingId: 7, sectionId: 10, page: 2, pageSize: 16 }, onPage, vi.fn());
    await map.start();
    expect(mock.hubConnection).toHaveBeenCalledWith(expect.any(String), { useDefaultPath: false, withCredentials: true });
    expect(mock.connection.start).toHaveBeenCalledWith({ transport: ['webSockets', 'serverSentEvents'] });
    expect(mock.proxy.invoke).toHaveBeenCalledWith('subscribe', 7, 10, 2, 16, expect.any(String));
    await vi.advanceTimersByTimeAsync(30000);
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(1);
    expect(onPage).toHaveBeenCalledTimes(1);
    const requestId = vi.mocked(mock.proxy.invoke).mock.calls[0][5];
    mock.handlers.parkingMapUpdated({ RequestId: requestId, Page: parkingMapFixture({ items: [] }) });
    expect(onPage).toHaveBeenCalledTimes(2);
  });

  it('re-subscribes on reconnect and replaces disconnected connections without duplicate retry loops', async () => {
    const mock = transport();
    map = new ParkingMapRealtimeConnection({ parkingId: 7, sectionId: null, page: 1, pageSize: 16 }, vi.fn(), vi.fn());
    await map.start();
    mock.handlers.reconnected(); await Promise.resolve();
    expect(mock.proxy.invoke).toHaveBeenCalledTimes(2);
    mock.handlers.disconnected();
    await vi.advanceTimersByTimeAsync(2000);
    expect(mock.hubConnection).toHaveBeenCalledTimes(2);
    expect(mock.connection.stop).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10000);
    expect(mock.hubConnection).toHaveBeenCalledTimes(2);
  });

  it('stops retries on access denial and ignores late pushes after unmount', async () => {
    const mock = transport(); const onPage = vi.fn(); const onStatus = vi.fn();
    map = new ParkingMapRealtimeConnection({ parkingId: 7, sectionId: null, page: 1, pageSize: 16 }, onPage, onStatus);
    await map.start();
    const requestId = vi.mocked(mock.proxy.invoke).mock.calls[0][5];
    mock.handlers.parkingMapError({ RequestId: requestId, Code: 'forbidden' });
    expect(onStatus).toHaveBeenLastCalledWith('forbidden');
    mock.handlers.parkingMapUpdated({ RequestId: requestId, Page: parkingMapFixture() });
    await vi.advanceTimersByTimeAsync(60000);
    expect(onPage).toHaveBeenCalledTimes(1);
    expect(mock.hubConnection).toHaveBeenCalledTimes(1);
  });

  it('marks a silent feed stale and recovers on the next push', async () => {
    const mock = transport(); const onStatus = vi.fn();
    map = new ParkingMapRealtimeConnection({ parkingId: 7, sectionId: null, page: 1, pageSize: 16 }, vi.fn(), onStatus);
    await map.start(); await vi.advanceTimersByTimeAsync(45000);
    expect(onStatus).toHaveBeenLastCalledWith('unavailable');
    const requestId = vi.mocked(mock.proxy.invoke).mock.calls[0][5];
    mock.handlers.parkingMapUpdated({ RequestId: requestId, Page: parkingMapFixture() });
    expect(onStatus).toHaveBeenLastCalledWith('connected');
  });

  it('does not overwrite a recent snapshot with an older push', async () => {
    const mock = transport(); const onPage = vi.fn();
    map = new ParkingMapRealtimeConnection({ parkingId: 7, sectionId: null, page: 1, pageSize: 16 }, onPage, vi.fn());
    await map.start();
    const requestId = vi.mocked(mock.proxy.invoke).mock.calls[0][5];
    mock.handlers.parkingMapUpdated({ RequestId: requestId, Page: parkingMapFixture({ generatedAtUtc: '2026-11-03T09:59:00Z' }) });
    expect(onPage).toHaveBeenCalledTimes(1);
  });
});
