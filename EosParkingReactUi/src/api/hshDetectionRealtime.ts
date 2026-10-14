import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { appConfig } from "../config";

export type HshDetectionConfig = {
  serviceBaseUrl: string;
  triggerIds: string[];
};

export type HshDetectionSource = {
  cameraId?: string;
  cameraName?: string;
  taskId?: string;
  roiId?: string;
  direction?: "entry" | "exit";
};

export type HshDetectionArtifact = Record<string, unknown>;

export type HshDetectionEvent = {
  eventId: string;
  sequence: number;
  eventType: string;
  occurredAtUtc: string;
  source: HshDetectionSource;
  matched: boolean;
  matchingTriggerIds: string[];
  plateText: string;
  confidence: number | null;
  artifacts: HshDetectionArtifact[];
  raw: Record<string, unknown>;
};

export type HshDetectionStatus = {
  state:
    | "connecting"
    | "connected"
    | "reconnecting"
    | "replay"
    | "cursor-expired"
    | "disconnected"
    | "error";
  message?: string;
};

export type HshArtifactLoader = (artifactType?: string) => Promise<string | null>;
export type HshDetectionHandler = (
  event: HshDetectionEvent,
  loadArtifact: HshArtifactLoader,
) => void | Promise<void>;

const getValue = (input: unknown, ...keys: string[]) => {
  if (!input || typeof input !== "object") return undefined;
  const row = input as Record<string, unknown>;
  return keys
    .map((key) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)])
    .find((value) => value !== undefined && value !== null);
};

const asRecord = (input: unknown): Record<string, unknown> =>
  input && typeof input === "object" && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};

const asString = (input: unknown) =>
  input === undefined || input === null ? "" : String(input);

/**
 * Parses the persisted camera setting:
 * Eos|http://host:5080|trigger-id
 * Multiple trigger ids may be separated by commas in the last segment.
 */
export function parseHshDetectionConfig(value: string | undefined): HshDetectionConfig | null {
  const normalized = (value ?? "").trim().replace(/^[\u064B-\u065F]+/, "");
  if (!normalized) return null;

  const parts = normalized.split("|").map((part) => part.trim());
  if (parts.length !== 3 || parts[0] !== "Eos") return null;

  let serviceBaseUrl: URL;
  try {
    serviceBaseUrl = new URL(parts[1]);
  } catch {
    return null;
  }
  if (serviceBaseUrl.protocol !== "http:" && serviceBaseUrl.protocol !== "https:")
    return null;

  const triggerIds = parts[2]
    .split(",")
    .map((triggerId) => triggerId.trim())
    .filter(Boolean);
  if (triggerIds.length === 0) return null;

  return {
    serviceBaseUrl: serviceBaseUrl.toString().replace(/\/$/, ""),
    triggerIds,
  };
}

function normalizeEvent(input: unknown): HshDetectionEvent | null {
  const root = asRecord(input);
  const trigger = asRecord(getValue(root, "trigger"));
  const source = asRecord(getValue(root, "source"));
  const components = asRecord(getValue(root, "components"));
  const plate = asRecord(getValue(components, "plate"));
  const eventId = asString(getValue(root, "eventId"));
  const sequence = Number(getValue(root, "sequence"));
  if (!eventId || !Number.isFinite(sequence)) return null;

  const artifacts = getValue(root, "artifacts");
  const matchingTriggerIds = getValue(trigger, "matchingTriggerIds");

  return {
    eventId,
    sequence,
    eventType: asString(getValue(root, "eventType")),
    occurredAtUtc: asString(getValue(root, "occurredAtUtc")),
    source: {
      cameraId: asString(getValue(source, "cameraId")) || undefined,
      cameraName: asString(getValue(source, "cameraName")) || undefined,
      taskId: asString(getValue(source, "taskId")) || undefined,
      roiId: asString(getValue(source, "roiId")) || undefined,
    },
    matched: getValue(trigger, "matched") === true,
    matchingTriggerIds: Array.isArray(matchingTriggerIds)
      ? matchingTriggerIds.map(String)
      : [],
    plateText: asString(getValue(plate, "plateText")),
    confidence:
      Number.isFinite(Number(getValue(plate, "confidence")))
        ? Number(getValue(plate, "confidence"))
        : null,
    artifacts: Array.isArray(artifacts)
      ? artifacts.filter(
          (artifact): artifact is HshDetectionArtifact =>
            Boolean(artifact && typeof artifact === "object"),
        )
      : [],
    raw: root,
  };
}

const artifactId = (artifact: HshDetectionArtifact) =>
  getValue(artifact, "artifactId", "id", "Id");

const artifactUrl = (artifact: HshDetectionArtifact) =>
  getValue(artifact, "downloadUrl", "url", "Url");

function browserServiceBaseUrl(serviceBaseUrl: string) {
  if (!import.meta.env.DEV || typeof window === "undefined") return serviceBaseUrl;

  try {
    const url = new URL(serviceBaseUrl);
    const isLocalHshService =
      (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
      url.port === "5080";
    if (isLocalHshService) return `${window.location.origin}/hsh-detection-service`;
  } catch {
    // Keep the original URL when it cannot be parsed.
  }

  return serviceBaseUrl;
}

export class HshDetectionConnection {
  private connection: HubConnection | null = null;
  private stopped = false;
  private resyncing = false;
  private lastSequence = 0;
  private readonly processedIds = new Set<string>();
  private readonly cursorKey: string;
  private readonly browserBaseUrl: string;

  public constructor(
    private readonly config: HshDetectionConfig,
    private readonly cameraId: string,
  ) {
    this.cursorKey = `eos-hsh-detection:${encodeURIComponent(config.serviceBaseUrl)}:${encodeURIComponent(cameraId)}:${encodeURIComponent(config.triggerIds.join(","))}`;
    this.browserBaseUrl = browserServiceBaseUrl(config.serviceBaseUrl);
    this.loadCursor();
  }

  public async start(
    onEvent: HshDetectionHandler,
    onStatus: (status: HshDetectionStatus) => void,
  ) {
    if (this.stopped) return;
    onStatus({ state: "connecting" });

    const apiKey = appConfig.hshDetectionApiKey;
    const connectionOptions: {
      headers?: Record<string, string>;
      transport?: HttpTransportType;
      withCredentials?: boolean;
    } = { withCredentials: false };

    if (apiKey) {
      connectionOptions.headers = { "X-Hsh-Api-Key": apiKey };
      // Browsers cannot reliably attach custom headers to a WebSocket upgrade.
      // Long polling keeps the documented X-Hsh-Api-Key header available.
      connectionOptions.transport = HttpTransportType.LongPolling;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${this.browserBaseUrl}/hubs/detections`, connectionOptions)
      .withAutomaticReconnect([0, 2000, 5000, 15000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("replayStarted", () => onStatus({ state: "replay" }));
    connection.on("replayCompleted", () => onStatus({ state: "connected" }));
    connection.on("detection", (input: unknown) => {
      void this.handleDetection(input, onEvent, onStatus);
    });
    connection.on("cursorExpired", (input: unknown) => {
      void this.handleCursorExpired(input, onStatus);
    });
    connection.onreconnecting(() => onStatus({ state: "reconnecting" }));
    connection.onreconnected(() => {
      void this.subscribe(onStatus);
    });
    connection.onclose((error) => {
      if (!this.stopped)
        onStatus({ state: error ? "error" : "disconnected", message: "Detection service connection closed." });
    });

    this.connection = connection;
    try {
      await connection.start();
      if (this.stopped) return;
      await this.subscribe(onStatus);
      onStatus({ state: "connected" });
    } catch {
      onStatus({ state: "error", message: "Detection service connection failed." });
      await this.stop();
    }
  }

  private async subscribe(onStatus: (status: HshDetectionStatus) => void) {
    if (!this.connection || this.stopped) return;
    await this.connection.invoke("Subscribe", this.lastSequence, {
      mode: "Plate",
      // The persisted equipment id is not guaranteed to be the Hsh camera id.
      // The requested setting contains TriggerId, so matching is performed by
      // trigger ids in handleDetection instead of narrowing delivery here.
      cameraIds: [],
      roiIds: [],
      faceRequired: false,
      plateRequired: true,
      palmRequired: false,
      includeFace: false,
      includePlate: true,
      includePalm: false,
      includeUnknownFace: true,
      includeUnknownPalm: true,
      includeArtifacts: true,
      windowMs: 1500,
      cooldownSeconds: 0,
    });
    onStatus({ state: "connected" });
  }

  private async handleDetection(
    input: unknown,
    onEvent: HshDetectionHandler,
    onStatus: (status: HshDetectionStatus) => void,
  ) {
    const event = normalizeEvent(input);
    if (!event || this.stopped) return;

    if (this.processedIds.has(event.eventId)) {
      this.saveCursor(event.sequence);
      return;
    }

    const expected =
      event.matched &&
      this.config.triggerIds.some((triggerId) =>
        event.matchingTriggerIds.includes(triggerId),
      );

    try {
      if (expected) {
        await onEvent(event, (artifactType) => this.downloadFirstArtifact(event, artifactType));
      }
      this.processedIds.add(event.eventId);
      this.trimProcessedIds();
      this.saveCursor(event.sequence);
    } catch {
      onStatus({ state: "error", message: "Detection event could not be processed." });
    }
  }

  private async handleCursorExpired(
    input: unknown,
    onStatus: (status: HshDetectionStatus) => void,
  ) {
    const availableFrom = Number(getValue(input, "availableFrom"));
    if (!Number.isFinite(availableFrom) || this.resyncing) {
      onStatus({ state: "cursor-expired", message: "Detection history needs resynchronization." });
      return;
    }
    this.resyncing = true;
    this.lastSequence = Math.max(0, availableFrom - 1);
    this.saveCursor(this.lastSequence);
    try {
      await this.subscribe(onStatus);
    } catch {
      onStatus({ state: "cursor-expired", message: "Detection history needs resynchronization." });
    } finally {
      this.resyncing = false;
    }
  }

  private async downloadFirstArtifact(event: HshDetectionEvent, requestedType?: string) {
    const candidate = (requestedType
      ? event.artifacts.find((artifact) =>
        String(getValue(artifact, "type", "artifactType") ?? "").toLowerCase() === requestedType.toLowerCase(),
      )
      : null) ?? event.artifacts.find((artifact) => artifactUrl(artifact) || artifactId(artifact));
    if (!candidate) return null;

    const directUrl = artifactUrl(candidate);
    const url = directUrl
      ? String(directUrl).startsWith("/")
        ? `${this.browserBaseUrl}${String(directUrl)}`
        : new URL(String(directUrl), `${this.browserBaseUrl}/`).toString()
      : `${this.browserBaseUrl}/api/v1/events/${encodeURIComponent(event.eventId)}/artifacts/${encodeURIComponent(String(artifactId(candidate)))}`;
    const headers: Record<string, string> = {};
    if (appConfig.hshDetectionApiKey) headers["X-Hsh-Api-Key"] = appConfig.hshDetectionApiKey;
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
  }

  private loadCursor() {
    try {
      const raw = localStorage.getItem(this.cursorKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { lastSequence?: number; processedIds?: string[] };
      this.lastSequence = Number.isFinite(saved.lastSequence) ? Number(saved.lastSequence) : 0;
      for (const eventId of saved.processedIds ?? []) this.processedIds.add(String(eventId));
    } catch {
      this.lastSequence = 0;
    }
  }

  private saveCursor(sequence: number) {
    this.lastSequence = Math.max(this.lastSequence, sequence);
    try {
      localStorage.setItem(this.cursorKey, JSON.stringify({
        lastSequence: this.lastSequence,
        processedIds: [...this.processedIds].slice(-500),
      }));
    } catch {
      // Cursor persistence is best effort in a restricted browser context.
    }
  }

  private trimProcessedIds() {
    if (this.processedIds.size <= 500) return;
    const keep = [...this.processedIds].slice(-500);
    this.processedIds.clear();
    for (const eventId of keep) this.processedIds.add(eventId);
  }

  public async stop() {
    this.stopped = true;
    const connection = this.connection;
    this.connection = null;
    if (connection) await connection.stop();
  }
}
