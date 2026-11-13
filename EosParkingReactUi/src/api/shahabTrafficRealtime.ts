import { z } from 'zod';
import { anprSignalRUrl } from '../config';
import { loadLegacySignalRClient, type LegacySignalRConnection, type LegacySignalRProxy } from './legacySignalRClient';
import type { HshDetectionEvent, HshDetectionHandler } from './hshDetectionRealtime';
import { trafficImage } from '../features/traffic/trafficImages';

export type ShahabTrafficStatus = 'connecting' | 'connected' | 'reconnecting' | 'unavailable' | 'unauthorized' | 'forbidden' | 'notFound' | 'invalidConfiguration';
export type ShahabHistoryStatus = 'loading' | 'ready' | 'error';
export type ShahabHistorySnapshot = { items: HshDetectionEvent[]; serverTimeUtc: string; dayStartUtc: string; dayEndUtc: string;
  loadArtifact?: (eventId: string, kind?: string) => Promise<string | null> };
const id = z.string().regex(/^[1-9]\d*$/);
const envelope = z.object({ RequestId: z.string(), DoorId: z.number().int().positive() });
const detectionSchema = envelope.extend({
  CameraId: id, DetectorCameraId: z.number().int().positive(), Direction: z.enum(['entry', 'exit']),
  EventId: z.string().min(1), RecordId: id, PlateText: z.string().trim().min(1),
  OccurredAtUtc: z.string().datetime({ offset: true }), ServerTimeUtc: z.string().datetime({ offset: true }),
});
const stateSchema = envelope.extend({ Code: z.enum(['connected', 'unavailable', 'unauthorized', 'forbidden', 'notFound', 'invalidConfiguration']) });
const replySchema = envelope.extend({ CameraCount: z.number().int().nonnegative(), ServerTimeUtc: z.string().datetime({ offset: true }) });
const historySchema = envelope.extend({
  ServerTimeUtc: z.string().datetime({ offset: true }), DayStartUtc: z.string().datetime({ offset: true }), DayEndUtc: z.string().datetime({ offset: true }),
  Items: z.array(detectionSchema.extend({ IsRepeated: z.boolean() })).max(100),
});
const canonical = (input: unknown) => {
  const row = z.record(z.string(), z.unknown()).parse(input);
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.charAt(0).toUpperCase() + key.slice(1), value]));
};
let requestSequence = 0;

export class ShahabTrafficRealtimeConnection {
  private connection: LegacySignalRConnection | null = null;
  private proxy: LegacySignalRProxy | null = null;
  private stopped = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private historyTimer: ReturnType<typeof setTimeout> | null = null;
  private historyRevision = 0;
  private historyInFlight: LegacySignalRProxy | null = null;
  private subscribedProxy: LegacySignalRProxy | null = null;
  private lastHistoryReadAt = -Infinity;
  private retries = 0;
  private sequence = 0;
  private readonly seen = new Set<string>();
  private readonly plates = new Map<string, number>();
  private readonly requestId = `traffic-${Date.now()}-${++requestSequence}`;

  constructor(
    private readonly doorId: number,
    private readonly onDetection: HshDetectionHandler,
    private readonly onStatus: (status: ShahabTrafficStatus) => void,
    private readonly onMessage?: (receivedAt: string) => void,
    private readonly onHistory?: (snapshot: ShahabHistorySnapshot) => void,
    private readonly onHistoryStatus?: (status: ShahabHistoryStatus) => void,
  ) {}

  async start() {
    if (this.stopped) return;
    this.subscribedProxy = null;
    this.onStatus(this.retries ? 'reconnecting' : 'connecting');
    try {
      const client = await loadLegacySignalRClient();
      if (this.stopped) return;
      const connection = client.hubConnection(anprSignalRUrl().replace(/\/$/, ''), { useDefaultPath: false, withCredentials: true });
      const proxy = connection.createHubProxy('shahabTrafficHub');
      this.connection = connection;
      this.proxy = proxy;
      proxy.on('trafficPlateDetected', payload => {
        if (this.connection === connection && !this.stopped) this.receive(payload);
      });
      proxy.on('trafficDetectionState', payload => {
        if (this.connection !== connection || this.stopped) return;
        const result = stateSchema.safeParse(this.safeCanonical(payload));
        if (result.success && this.matches(result.data)) {
          this.messageReceived();
          this.status(result.data.Code);
        }
      });
      connection.reconnecting(() => { if (this.connection === connection && !this.stopped) { this.subscribedProxy = null; this.onStatus('reconnecting'); } });
      connection.reconnected(() => { if (this.connection === connection) void this.subscribe(); });
      connection.disconnected(() => {
        if (this.connection === connection && !this.stopped) {
          this.subscribedProxy = null;
          this.onStatus('unavailable');
          this.scheduleReconnect();
        }
      });
      connection.error(() => { if (this.connection === connection && !this.stopped) this.onStatus('unavailable'); });
      await connection.start({ transport: ['webSockets', 'serverSentEvents', 'longPolling'] });
      if (this.stopped) { connection.stop(); return; }
      await this.subscribe();
    } catch { if (!this.stopped) { this.onStatus('unavailable'); this.scheduleReconnect(); } }
  }

  private async subscribe() {
    const proxy = this.proxy;
    if (this.stopped || !proxy) return;
    try {
      const reply = replySchema.parse(this.safeCanonical(await proxy.invoke('subscribe', this.doorId, this.requestId)));
      if (!this.stopped && this.proxy === proxy && this.matches(reply)) {
        this.messageReceived();
        this.status('connected');
        this.subscribedProxy = proxy;
        if (this.onHistory) void this.refreshHistory(true);
      }
    } catch (error) {
      if (this.stopped || this.proxy !== proxy) return;
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
      const terminal = ['unauthorized', 'forbidden', 'notFound', 'invalidConfiguration'].find(code => message.includes(code)) as ShahabTrafficStatus | undefined;
      if (terminal) this.status(terminal);
      else { this.onStatus('unavailable'); this.scheduleReconnect(); }
    }
  }

  private safeCanonical(payload: unknown) {
    try { return canonical(payload); } catch { return null; }
  }

  async refreshHistory(force = false) {
    const proxy = this.proxy;
    if (this.stopped || !proxy || this.subscribedProxy !== proxy || !this.onHistory || this.historyInFlight === proxy
      || (!force && Date.now() - this.lastHistoryReadAt < 2000)) return;
    this.historyInFlight = proxy;
    const revision = ++this.historyRevision;
    if (this.historyTimer !== null) clearTimeout(this.historyTimer);
    this.onHistoryStatus?.('loading');
    try {
      const raw = this.safeCanonical(await proxy.invoke('getHistory', this.doorId, this.requestId));
      const reply = historySchema.parse(raw && { ...raw, Items: Array.isArray(raw.Items) ? raw.Items.map(item => this.safeCanonical(item)) : raw.Items });
      if (this.stopped || this.proxy !== proxy || revision !== this.historyRevision) return;
      if (!this.matches(reply)) throw new Error('History subscription mismatch');
      const start = Date.parse(reply.DayStartUtc); const end = Date.parse(reply.DayEndUtc); const now = Date.parse(reply.ServerTimeUtc);
      if (start > now || end <= now || end <= start || end - start > 48 * 3600000
        || reply.Items.some(item => !this.matches(item) || Date.parse(item.OccurredAtUtc) < start || Date.parse(item.OccurredAtUtc) > now)) throw new Error('Invalid history window');
      this.onHistory({ serverTimeUtc: reply.ServerTimeUtc, dayStartUtc: reply.DayStartUtc, dayEndUtc: reply.DayEndUtc,
        loadArtifact: (eventId, kind) => {
          const record = reply.Items.find(item => item.EventId === eventId);
          return record ? this.picture(record.RecordId, kind ?? 'FullFrameRaw') : Promise.resolve(null);
        },
        items: reply.Items.map(record => ({ eventId: record.EventId, recordId: record.RecordId, sequence: 0, eventType: 'plate.detected', occurredAtUtc: record.OccurredAtUtc,
          source: { cameraId: record.CameraId, direction: record.Direction }, plateText: record.PlateText, matched: true, confidence: null,
          matchingTriggerIds: [], artifacts: [], raw: {}, suppressAutomaticInput: record.IsRepeated })) });
      this.onHistoryStatus?.('ready');
      this.lastHistoryReadAt = Date.now();
      this.historyTimer = setTimeout(() => { void this.refreshHistory(true); }, Math.max(1000, end - now + 50));
    } catch (error) {
      if (this.stopped || this.proxy !== proxy || revision !== this.historyRevision) return;
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
      this.onHistoryStatus?.('error');
      const terminal = ['unauthorized', 'forbidden', 'notFound', 'invalidConfiguration'].find(code => message.includes(code)) as ShahabTrafficStatus | undefined;
      if (terminal) this.status(terminal);
      else this.historyTimer = setTimeout(() => { void this.refreshHistory(true); }, message.includes('dayChanged') ? 1000 : 15000);
    } finally { if (this.historyInFlight === proxy) this.historyInFlight = null; }
  }

  private matches(value: z.infer<typeof envelope>) { return value.RequestId === this.requestId && value.DoorId === this.doorId; }

  private receive(payload: unknown) {
    const result = detectionSchema.safeParse(this.safeCanonical(payload));
    if (!result.success || !this.matches(result.data)) return;
    const record = result.data;
    const detectedAt = Date.parse(record.OccurredAtUtc);
    // Compare server timestamps: an operator PC with a skewed clock must still work.
    const age = Date.parse(record.ServerTimeUtc) - detectedAt;
    if (age < -1000 || age > 10000 || this.seen.has(record.EventId)) return;
    this.seen.add(record.EventId);
    if (this.seen.size > 256) this.seen.delete(this.seen.values().next().value!);
    const plateKey = `${record.DetectorCameraId}:${record.Direction}:${record.PlateText.replace(/[\s-]/g, '')}`;
    const previous = this.plates.get(plateKey);
    const repeated = previous !== undefined && detectedAt - previous < 45000;
    if (!repeated) this.plates.set(plateKey, detectedAt);
    for (const [key, time] of this.plates) if (Date.parse(record.ServerTimeUtc) - time > 45000) this.plates.delete(key);
    const event: HshDetectionEvent = {
      eventId: record.EventId, recordId: record.RecordId, sequence: ++this.sequence, eventType: 'plate.detected', occurredAtUtc: record.OccurredAtUtc,
      source: { cameraId: record.CameraId, direction: record.Direction }, matched: true, matchingTriggerIds: [],
      plateText: record.PlateText, confidence: null, artifacts: [], raw: canonical(payload), suppressAutomaticInput: repeated,
    };
    const pictures = new Map<string, Promise<string | null>>();
    // A plate from one camera must not hide an unavailable state for the other camera.
    this.messageReceived();
    void Promise.resolve(this.onDetection(event, kind => {
      const type = kind ?? 'FullFrameRaw';
      if (this.stopped || !this.proxy || !['FullFrameRaw', 'PlateCrop'].includes(type)) return Promise.resolve(null);
      let picture = pictures.get(type);
      if (!picture) {
        picture = this.picture(record.RecordId, type);
        pictures.set(type, picture);
      }
      return picture;
    })).catch(() => { if (!this.stopped) this.onStatus('unavailable'); });
  }

  private picture(recordId: string, type: string): Promise<string | null> {
    const proxy = this.proxy;
    if (this.stopped || !proxy || !['FullFrameRaw', 'PlateCrop'].includes(type)) return Promise.resolve(null);
    return proxy.invoke('getPicture', this.doorId, recordId, type)
      .then(value => !this.stopped && this.proxy === proxy ? trafficImage(value)?.url ?? null : null).catch(() => null);
  }

  private status(status: ShahabTrafficStatus) {
    if (this.stopped) return;
    this.onStatus(status);
    if (['unauthorized', 'forbidden', 'notFound', 'invalidConfiguration'].includes(status)) { this.stop(); return; }
    if (status !== 'connected') return;
    this.retries = 0;
    if (this.retryTimer !== null) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private messageReceived() {
    this.onMessage?.(new Date().toISOString());
    if (this.heartbeatTimer !== null) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = setTimeout(() => { if (!this.stopped) { this.onStatus('unavailable'); this.scheduleReconnect(); } }, 45000);
  }

  private scheduleReconnect() {
    if (this.stopped || this.retryTimer !== null) return;
    this.retryTimer = setTimeout(() => {
      const previous = this.connection;
      this.connection = null;
      this.proxy = null;
      previous?.stop();
      this.retryTimer = null;
      void this.start();
    }, Math.min(2000 * 2 ** this.retries++, 15000));
  }

  stop() {
    this.stopped = true;
    this.historyRevision++;
    this.subscribedProxy = null;
    if (this.historyTimer !== null) clearTimeout(this.historyTimer);
    this.historyTimer = null;
    if (this.retryTimer !== null) clearTimeout(this.retryTimer);
    if (this.heartbeatTimer !== null) clearTimeout(this.heartbeatTimer);
    this.retryTimer = null;
    this.heartbeatTimer = null;
    this.proxy = null;
    const previous = this.connection;
    this.connection = null;
    previous?.stop();
  }
}
