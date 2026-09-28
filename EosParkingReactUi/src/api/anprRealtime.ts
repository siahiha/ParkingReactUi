import jquery from 'jquery';
import { appConfig } from '../config';
import { getAuthToken } from './client';

export type AnprRealtimeRecord = Record<string, unknown>;
export type AnprRealtimeErrorHandler = (error: unknown) => void;

type SignalRConnection = {
  state: number;
  start: () => Promise<unknown>;
  stop: () => void;
  createHubProxy: (name: string) => SignalRProxy;
  disconnected: (handler: () => void) => void;
  error: (handler: (error: unknown) => void) => void;
};

type SignalRProxy = {
  on: (methodName: string, handler: (record: AnprRealtimeRecord) => void) => SignalRProxy;
  invoke: (methodName: string, ...args: unknown[]) => Promise<unknown>;
};

type SignalRJQuery = typeof jquery & {
  hubConnection: (url: string, options: { qs: Record<string, string>; useDefaultPath: boolean }) => SignalRConnection;
};

export class AnprRealtimeConnection {
  private readonly url: string;
  private connection: SignalRConnection | null = null;
  private proxy: SignalRProxy | null = null;
  private source = false;
  private disposed = false;
  private reconnectTimer: number | null = null;
  private onRecord: (record: AnprRealtimeRecord) => void = () => undefined;
  private onError: AnprRealtimeErrorHandler = () => undefined;

  public constructor(url = appConfig.anprSignalRUrl) {
    this.url = url.replace(/\/$/, '');
  }

  public async start(isEosAnpr: boolean, onRecord: (record: AnprRealtimeRecord) => void, onError: AnprRealtimeErrorHandler) {
    this.source = isEosAnpr;
    this.onRecord = onRecord;
    this.onError = onError;
    this.disposed = false;
    if (import.meta.env.MODE === 'test') return;
    await this.connect();
  }

  public async changeSource(isEosAnpr: boolean) {
    const previousSource = this.source;
    this.source = isEosAnpr;
    if (!this.proxy) return;
    if (previousSource !== isEosAnpr) await this.proxy.invoke('unsubscribe', previousSource);
    await this.proxy.invoke('subscribe', isEosAnpr);
  }

  private async loadClient() {
    const root = globalThis as typeof globalThis & { jQuery?: typeof jquery; $?: typeof jquery };
    root.jQuery = jquery;
    root.$ = jquery;
    // ASP.NET SignalR 2 is a jQuery plugin and must be loaded after jQuery is global.
    await import('signalr');
    return root.jQuery as SignalRJQuery;
  }

  private async connect() {
    if (this.disposed) return;

    try {
      const signalR = await this.loadClient();
      const connection = signalR.hubConnection(this.url, {
        qs: { UserToken: getAuthToken() || '' },
        useDefaultPath: false,
      });
      const proxy = connection.createHubProxy('anprHub');
      proxy.on('anprDetected', record => this.onRecord(record));
      connection.error(error => this.onError(error));
      connection.disconnected(() => this.scheduleReconnect());
      this.connection = connection;
      this.proxy = proxy;
      await connection.start();
      if (this.disposed) {
        connection.stop();
        return;
      }
      await proxy.invoke('subscribe', this.source);
    } catch (error) {
      this.onError(error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.disposed || this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, 2000);
  }

  public stop() {
    this.disposed = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.proxy = null;
    this.connection?.stop();
    this.connection = null;
  }
}
