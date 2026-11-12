import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AnprRealtimeConnection } from './anprRealtime';

const transport = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('jquery', () => ({ default: { hubConnection: transport.create } }));
vi.mock('signalr', () => ({}));

function connection() {
  const callbacks = { disconnected: () => {}, error: (_cause: unknown) => {} };
  const proxy = { on: vi.fn(), invoke: vi.fn().mockResolvedValue(undefined) };
  const hub = { state: 1, start: vi.fn().mockResolvedValue(undefined), stop: vi.fn(),
    createHubProxy: vi.fn().mockReturnValue(proxy),
    disconnected: (handler: () => void) => { callbacks.disconnected = handler; },
    error: (handler: (cause: unknown) => void) => { callbacks.error = handler; } };
  return { hub, proxy, callbacks };
}

beforeEach(() => { vi.stubEnv('MODE', 'development'); transport.create.mockReset(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

it('reports disconnection and clears the warning after a successful resubscription without waiting for a plate', async () => {
  vi.useFakeTimers();
  const first = connection(); const second = connection();
  transport.create.mockReturnValueOnce(first.hub).mockReturnValueOnce(second.hub);
  const error = vi.fn(); const connected = vi.fn();
  const live = new AnprRealtimeConnection('/signalr');
  await live.start(false, vi.fn(), error, connected);
  expect(connected).toHaveBeenCalledOnce();
  first.callbacks.disconnected();
  expect(error).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(2000);
  expect(second.proxy.invoke).toHaveBeenCalledWith('subscribe', false);
  expect(connected).toHaveBeenCalledTimes(2);
  first.callbacks.error(new Error('late failure'));
  expect(error).toHaveBeenCalledOnce();
  live.stop();
  second.callbacks.disconnected();
  await vi.advanceTimersByTimeAsync(4000);
  expect(transport.create).toHaveBeenCalledTimes(2);
});
