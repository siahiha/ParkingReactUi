import jquery from 'jquery';

export type LegacySignalRProxy = {
  on: (method: string, handler: (payload: unknown) => void) => LegacySignalRProxy;
  invoke: (method: string, ...args: unknown[]) => Promise<unknown>;
};

export type LegacySignalRConnection = {
  start: (options?: { transport: string[] }) => Promise<unknown>;
  stop: () => void;
  createHubProxy: (name: string) => LegacySignalRProxy;
  disconnected: (handler: () => void) => void;
  reconnecting: (handler: () => void) => void;
  reconnected: (handler: () => void) => void;
  error: (handler: (error: unknown) => void) => void;
};

type SignalRJQuery = typeof jquery & {
  hubConnection: (url: string, options: { useDefaultPath: boolean; withCredentials: boolean }) => LegacySignalRConnection;
};

export async function loadLegacySignalRClient(): Promise<SignalRJQuery> {
  const root = globalThis as typeof globalThis & { jQuery?: typeof jquery; $?: typeof jquery };
  root.jQuery = jquery;
  root.$ = jquery;
  // The existing ASP.NET SignalR 2 transport is a jQuery plugin, not the Core client.
  await import('signalr');
  return root.jQuery as SignalRJQuery;
}
