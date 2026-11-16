import { appConfig } from '../config';
import { loadLegacySignalRClient, type LegacySignalRConnection, type LegacySignalRProxy } from './legacySignalRClient';

export type DeviceConnectionStatus = {
  equipmentId: number;
  deviceName: string;
  deviceType: string;
  connected: boolean | null;
  updatedAtUtc: string | null;
};

export type DeviceRecordEvent = {
  eventId: string;
  deviceId: number;
  eventType: string;
  identifier: string;
  occurredAt: string | null;
};

function readStatus(value: unknown): DeviceConnectionStatus | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const equipmentId = Number(item.equipmentId ?? item.EquipmentId);
  if (!Number.isFinite(equipmentId) || equipmentId <= 0) return null;
  const connectedValue = item.connected ?? item.Connected;
  return {
    equipmentId,
    deviceName: String(item.deviceName ?? item.DeviceName ?? ''),
    deviceType: String(item.deviceType ?? item.DeviceType ?? ''),
    connected: typeof connectedValue === 'boolean' ? connectedValue : null,
    updatedAtUtc: typeof (item.updatedAtUtc ?? item.UpdatedAtUtc) === 'string'
      ? String(item.updatedAtUtc ?? item.UpdatedAtUtc) : null,
  };
}

function readSnapshot(value: unknown) {
  return Array.isArray(value) ? value.map(readStatus).filter((item): item is DeviceConnectionStatus => item !== null) : [];
}

function readDeviceEvent(value: unknown): DeviceRecordEvent | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const deviceId = Number(item.deviceId ?? item.DeviceId);
  const identifier = item.identifier ?? item.Identifier;
  const eventType = item.eventType ?? item.EventType;
  if (!Number.isFinite(deviceId) || deviceId <= 0 || typeof identifier !== 'string' || typeof eventType !== 'string') return null;
  return {
    eventId: String(item.eventId ?? item.EventId ?? ''),
    deviceId,
    eventType,
    identifier,
    occurredAt: typeof (item.occurredAt ?? item.OccurredAt) === 'string'
      ? String(item.occurredAt ?? item.OccurredAt) : null,
  };
}

export class DeviceStatusRealtimeConnection {
  private connection: LegacySignalRConnection | null = null;
  private proxy: LegacySignalRProxy | null = null;
  private disposed = false;
  private refreshTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private connecting = false;
  private refreshInFlight = false;
  private doorId = 0;
  private onSnapshot: (statuses: DeviceConnectionStatus[]) => void = () => undefined;
  private onStatus: (status: DeviceConnectionStatus) => void = () => undefined;
  private onDeviceEvent: (event: DeviceRecordEvent) => void = () => undefined;
  private onError: (error: unknown) => void = () => undefined;
  private readonly seenEventIds = new Set<string>();

  async start(doorId: number, onSnapshot: (statuses: DeviceConnectionStatus[]) => void,
    onStatus: (status: DeviceConnectionStatus) => void, onError: (error: unknown) => void,
    onDeviceEvent: (event: DeviceRecordEvent) => void = () => undefined) {
    this.doorId = doorId;
    this.onSnapshot = onSnapshot;
    this.onStatus = onStatus;
    this.onDeviceEvent = onDeviceEvent;
    this.onError = onError;
    this.disposed = false;
    if (import.meta.env.MODE === 'test') return;

    await this.connect();
  }

  private async connect() {
    if (this.disposed || this.connecting) return;
    this.connecting = true;
    try {
      const signalR = await loadLegacySignalRClient();
      if (this.disposed) return;
      const hubUrl = `${appConfig.apiBaseUrl.trim().replace(/\/+$/, '')}/signalr`;
      const connection = signalR.hubConnection(hubUrl, {
        useDefaultPath: false,
        withCredentials: true,
      });
      const proxy = connection.createHubProxy('deviceEventsHub');
      proxy.on('deviceStatusUpdated', value => {
        if (!this.disposed) {
          const status = readStatus(value);
          if (status) this.onStatus(status);
        }
      });
      proxy.on('deviceEventReceived', value => {
        if (this.disposed) return;
        const event = readDeviceEvent(value);
        if (!event) return;
        if (event.eventId && this.seenEventIds.has(event.eventId)) return;
        if (event.eventId) {
          this.seenEventIds.add(event.eventId);
          if (this.seenEventIds.size > 512) this.seenEventIds.delete(this.seenEventIds.values().next().value as string);
        }
        this.onDeviceEvent(event);
      });
      connection.error(error => { if (!this.disposed) this.onError(error); });
      connection.reconnecting(() => { if (!this.disposed) this.onError(new Error('reconnecting')); });
      connection.reconnected(() => {
        if (!this.disposed && this.connection === connection) void this.subscribeAndRefresh(proxy);
      });
      connection.disconnected(() => {
        if (this.disposed || this.connection !== connection) return;
        this.connection = null;
        this.proxy = null;
        this.stopRefreshTimer();
        this.onError(new Error('disconnected'));
        this.scheduleReconnect();
      });
      this.connection = connection;
      this.proxy = proxy;
      await connection.start();
      if (this.disposed) { connection.stop(); return; }
      await this.subscribeAndRefresh(proxy);
      if (!this.disposed && this.refreshTimer === null) {
        this.refreshTimer = window.setInterval(() => { void this.refreshStatuses(proxy); }, 5000);
      }
    } catch (error) {
      if (!this.disposed) {
        this.onError(error);
        this.scheduleReconnect();
      }
    } finally {
      this.connecting = false;
    }
  }

  private scheduleReconnect() {
    if (this.disposed || this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, 2000);
  }

  private stopRefreshTimer() {
    if (this.refreshTimer !== null) window.clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  private async subscribeAndRefresh(proxy: LegacySignalRProxy) {
    await proxy.invoke('subscribe', this.doorId);
    await this.refreshStatuses(proxy);
  }

  private async refreshStatuses(proxy: LegacySignalRProxy) {
    if (this.disposed || this.proxy !== proxy || this.refreshInFlight) return;
    this.refreshInFlight = true;
    try {
      const result = await proxy.invoke('getDeviceStatuses', this.doorId);
      if (!this.disposed && this.proxy === proxy) this.onSnapshot(readSnapshot(result));
    } catch (error) {
      if (!this.disposed) this.onError(error);
    } finally {
      this.refreshInFlight = false;
    }
  }

  stop() {
    this.disposed = true;
    this.stopRefreshTimer();
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    const proxy = this.proxy;
    const connection = this.connection;
    this.proxy = null;
    this.connection = null;
    if (proxy) void proxy.invoke('unsubscribe', this.doorId).catch(() => undefined);
    connection?.stop();
  }
}
