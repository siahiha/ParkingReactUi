import { anprSignalRUrl } from '../config';
import { loadLegacySignalRClient, type LegacySignalRConnection, type LegacySignalRProxy } from './legacySignalRClient';
import { parseParkingMapError, parseParkingMapUpdate, type ParkingMapPage, type ParkingMapQuery, type ParkingMapStatus } from '../features/home/parkingMapService';

let requestSequence = 0;

export class ParkingMapRealtimeConnection {
  private connection: LegacySignalRConnection | null = null;
  private proxy: LegacySignalRProxy | null = null;
  private stopped = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private freshnessTimer: ReturnType<typeof setTimeout> | null = null;
  private retries = 0;
  private lastGeneratedAt = 0;
  private readonly requestId = `map-${Date.now()}-${++requestSequence}`;

  constructor(
    private readonly query: ParkingMapQuery,
    private readonly onPage: (page: ParkingMapPage) => void,
    private readonly onStatus: (status: ParkingMapStatus) => void,
  ) {}

  async start() {
    if (this.stopped) return;
    this.onStatus(this.retries ? 'reconnecting' : 'connecting');
    try {
      const client = await loadLegacySignalRClient();
      if (this.stopped) return;
      const connection = client.hubConnection(anprSignalRUrl().replace(/\/$/, ''), { useDefaultPath: false, withCredentials: true });
      const proxy = connection.createHubProxy('parkingMapHub');
      this.connection = connection;
      this.proxy = proxy;
      proxy.on('parkingMapUpdated', payload => { if (this.connection === connection) this.receive(payload); });
      proxy.on('parkingMapError', payload => {
        const status = parseParkingMapError(payload, this.requestId);
        if (!this.stopped && this.connection === connection && status) {
          this.onStatus(status);
          if (status === 'unauthorized' || status === 'forbidden' || status === 'notFound') this.stop();
        }
      });
      connection.reconnecting(() => { if (!this.stopped && this.connection === connection) this.onStatus('reconnecting'); });
      connection.reconnected(() => { if (this.connection === connection) void this.subscribe(); });
      connection.disconnected(() => { if (this.connection === connection) this.scheduleReconnect(); });
      connection.error(() => { if (!this.stopped && this.connection === connection) this.onStatus('unavailable'); });
      // Never fall back to browser long polling for this map.
      await connection.start({ transport: ['webSockets', 'serverSentEvents'] });
      if (this.stopped) { connection.stop(); return; }
      await this.subscribe();
    } catch {
      if (!this.stopped) {
        this.onStatus('unavailable');
        this.scheduleReconnect();
      }
    }
  }

  private async subscribe() {
    if (this.stopped || !this.proxy) return;
    const proxy = this.proxy;
    try {
      const { parkingId, sectionId, page, pageSize } = this.query;
      const response = await proxy.invoke('subscribe', parkingId, sectionId, page, pageSize, this.requestId);
      if (this.proxy === proxy) this.receive(response);
    } catch (error) {
      if (this.stopped || this.proxy !== proxy) return;
      const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
      const status = ['unauthorized', 'forbidden', 'notFound'].find(code => message.includes(code)) as ParkingMapStatus | undefined;
      this.onStatus(status ?? 'unavailable');
      if (status) this.stop();
      else this.scheduleReconnect();
    }
  }

  private receive(payload: unknown) {
    if (this.stopped) return;
    try {
      const page = parseParkingMapUpdate(payload, this.requestId, this.query.parkingId);
      if (!page) return;
      const generatedAt = Date.parse(page.generatedAtUtc);
      if (generatedAt < this.lastGeneratedAt) return;
      this.lastGeneratedAt = generatedAt;
      this.retries = 0;
      if (this.retryTimer !== null) clearTimeout(this.retryTimer);
      this.retryTimer = null;
      if (this.freshnessTimer !== null) clearTimeout(this.freshnessTimer);
      this.freshnessTimer = setTimeout(() => { if (!this.stopped) this.onStatus('unavailable'); }, 45000);
      this.onPage(page);
      this.onStatus('connected');
    } catch { this.onStatus('unavailable'); }
  }

  private scheduleReconnect() {
    if (this.stopped || this.retryTimer !== null) return;
    this.onStatus('reconnecting');
    this.retryTimer = setTimeout(() => {
      const previous = this.connection;
      this.connection = null;
      this.proxy = null;
      previous?.stop();
      this.retryTimer = null;
      void this.start();
    }, Math.min(2000 * 2 ** this.retries++, 30000));
  }

  stop() {
    this.stopped = true;
    if (this.retryTimer !== null) clearTimeout(this.retryTimer);
    if (this.freshnessTimer !== null) clearTimeout(this.freshnessTimer);
    this.retryTimer = null;
    this.proxy = null;
    this.connection?.stop();
    this.connection = null;
  }
}
