import { useEffect, useRef, useState } from 'react';
import type { Camera } from '../../api/management';
import type { HshDetectionHandler } from '../../api/hshDetectionRealtime';
import { parseShahabDetectionConfig } from '../../api/shahabDetectionConfig';
import { ShahabTrafficRealtimeConnection, type ShahabTrafficStatus, type ShahabHistorySnapshot, type ShahabHistoryStatus } from '../../api/shahabTrafficRealtime';

export function useShahabTrafficDetection(doorId: string, entry: Camera | null, exit: Camera | null, onDetection?: HshDetectionHandler,
  onHistory?: (snapshot: ShahabHistorySnapshot) => void, onHistoryStatus?: (status: ShahabHistoryStatus) => void, historyOpen = false) {
  const [status, setStatus] = useState<ShahabTrafficStatus | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const connectionRef = useRef<ShahabTrafficRealtimeConnection | null>(null);
  const camerasRef = useRef<(Camera | null)[]>([entry, exit]);
  useEffect(() => { camerasRef.current = [entry, exit]; }, [entry, exit]);
  useEffect(() => {
    setStatus(null);
    setLastMessageAt(null);
    if (!onDetection || !doorId) { onHistoryStatus?.('ready'); return; }
    let active = true;
    onHistoryStatus?.('loading');
    // The hub authorizes this door and its configured readers. Camera preview
    // metadata only supplies names; it must not delay or discard initial history.
    const cameraName = (cameraId: string | undefined, direction: string | undefined) => camerasRef.current
      .find(camera => camera?.cameraId === cameraId && camera?.direction === direction)?.name;
    const connection = new ShahabTrafficRealtimeConnection(Number(doorId), (event, loadArtifact) => {
      if (active) return onDetection({ ...event, source: { ...event.source, cameraName: cameraName(event.source.cameraId, event.source.direction) } }, loadArtifact);
    }, next => {
      if (!active) return;
      setStatus(next);
      if (['unavailable', 'unauthorized', 'forbidden', 'notFound', 'invalidConfiguration'].includes(next)) onHistoryStatus?.('error');
    }, receivedAt => { if (active) setLastMessageAt(receivedAt); },
    onHistory ? snapshot => {
      if (!active) return;
      onHistory({ ...snapshot, items: snapshot.items.map(event => ({ ...event,
        source: { ...event.source, cameraName: cameraName(event.source.cameraId, event.source.direction) } })) });
    } : undefined, next => { if (active) onHistoryStatus?.(next); });
    connectionRef.current = connection;
    void connection.start();
    return () => { active = false; if (connectionRef.current === connection) connectionRef.current = null; connection.stop(); };
  }, [doorId, onDetection, onHistory, onHistoryStatus]);
  useEffect(() => { if (historyOpen) void connectionRef.current?.refreshHistory(); }, [historyOpen]);
  const hasConfiguredReader = [entry, exit].some(camera => camera && camera.enabled !== false && parseShahabDetectionConfig(camera.detectionServerAddress));
  return { status: hasConfiguredReader ? status : null, lastMessageAt };
}
