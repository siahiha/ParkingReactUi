import { useCallback, useEffect, useState } from 'react';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import type { ShahabHistorySnapshot, ShahabHistoryStatus } from '../../api/shahabTrafficRealtime';
import { appendPlateHistory, mergePlateHistory, type PlateHistoryItem } from './plateDetectionHistory';

type History = { items: readonly PlateHistoryItem[]; status: ShahabHistoryStatus; start?: number; end?: number; expiresAt?: number };
const emptyHistory: History = { items: [], status: 'loading' };

export function usePlateDetectionHistory(doorKey: string) {
  const [byDoor, setByDoor] = useState<Record<string, History>>({});
  const current = byDoor[doorKey] ?? emptyHistory;
  const recordDetection = useCallback((event: HshDetectionEvent) => {
    const receivedAt = Date.now();
    setByDoor(byDoor => {
      const previous = byDoor[doorKey] ?? emptyHistory;
      const time = Date.parse(event.occurredAtUtc);
      if (previous.start !== undefined && previous.end !== undefined && (time < previous.start || time >= previous.end)) return byDoor;
      const items = appendPlateHistory(previous.items, event, receivedAt);
      return items === previous.items ? byDoor : { ...byDoor, [doorKey]: { ...previous, items } };
    });
  }, [doorKey]);
  const receiveSnapshot = useCallback((snapshot: ShahabHistorySnapshot) => {
    const now = Date.now();
    setByDoor(current => ({ ...current, [doorKey]: {
      items: mergePlateHistory(current[doorKey]?.items ?? [], snapshot, now), status: 'ready',
      start: Date.parse(snapshot.dayStartUtc), end: Date.parse(snapshot.dayEndUtc),
      expiresAt: now + Date.parse(snapshot.dayEndUtc) - Date.parse(snapshot.serverTimeUtc),
    } }));
  }, [doorKey]);
  const setHistoryStatus = useCallback((status: ShahabHistoryStatus) => {
    setByDoor(current => ({ ...current, [doorKey]: { ...(current[doorKey] ?? emptyHistory), status } }));
  }, [doorKey]);
  useEffect(() => {
    if (current.expiresAt === undefined) return;
    const timer = setTimeout(() => {
      setByDoor(current => ({ ...current, [doorKey]: { ...emptyHistory } }));
    }, Math.max(0, current.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [doorKey, current.expiresAt]);
  const expired = current.expiresAt !== undefined && Date.now() >= current.expiresAt;
  return { items: expired ? emptyHistory.items : current.items, status: expired ? 'loading' as const : current.status, recordDetection, receiveSnapshot, setHistoryStatus };
}
