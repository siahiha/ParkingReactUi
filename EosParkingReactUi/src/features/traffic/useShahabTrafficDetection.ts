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
  useEffect(() => {
    setStatus(null);
    setLastMessageAt(null);
    const cameras = [entry, exit].filter((camera): camera is Camera => Boolean(camera && camera.enabled !== false && parseShahabDetectionConfig(camera.detectionServerAddress)));
    if (!onDetection || !doorId || cameras.length === 0) { onHistoryStatus?.('ready'); return; }
    let active = true;
    const connection = new ShahabTrafficRealtimeConnection(Number(doorId), (event, loadArtifact) => {
      const camera = cameras.find(camera => camera.cameraId === event.source.cameraId && camera.direction === event.source.direction);
      if (active && camera) return onDetection({ ...event, source: { ...event.source, cameraName: camera.name } }, loadArtifact);
    }, next => {
      if (!active) return;
      setStatus(next);
      if (['unavailable', 'unauthorized', 'forbidden', 'notFound', 'invalidConfiguration'].includes(next)) onHistoryStatus?.('error');
    }, receivedAt => { if (active) setLastMessageAt(receivedAt); },
    onHistory ? snapshot => {
      if (!active) return;
      onHistory({ ...snapshot, items: snapshot.items.filter(event => cameras.some(camera => camera.cameraId === event.source.cameraId && camera.direction === event.source.direction))
        .map(event => ({ ...event, source: { ...event.source, cameraName: cameras.find(camera => camera.cameraId === event.source.cameraId && camera.direction === event.source.direction)?.name } })) });
    } : undefined, next => { if (active) onHistoryStatus?.(next); });
    connectionRef.current = connection;
    void connection.start();
    return () => { active = false; if (connectionRef.current === connection) connectionRef.current = null; connection.stop(); };
  }, [doorId, entry, exit, onDetection, onHistory, onHistoryStatus]);
  useEffect(() => { if (historyOpen) void connectionRef.current?.refreshHistory(); }, [historyOpen]);
  return { status, lastMessageAt };
}
