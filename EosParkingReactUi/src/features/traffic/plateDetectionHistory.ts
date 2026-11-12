import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import type { ShahabHistorySnapshot } from '../../api/shahabTrafficRealtime';
import { normalizeIranianPlateValue } from '../../components/IranianPlateInput';
import { normalizeDigits } from '../../utils/formatters';

export type PlateHistoryItem = {
  id: string; plate: string; occurredAt: string; receivedAt: number;
  cameraId?: string; cameraName?: string; direction?: 'entry' | 'exit'; repeated: boolean;
};
export const normalizeHistorySearch = (value: string) => normalizeIranianPlateValue(normalizeDigits(value)).replace(/[\s-]/g, '');

function historyItem(event: HshDetectionEvent, receivedAt: number): PlateHistoryItem {
  return { id: event.eventId, plate: normalizeIranianPlateValue(normalizeDigits(event.plateText)), occurredAt: event.occurredAtUtc, receivedAt,
    cameraId: event.source.cameraId, cameraName: event.source.cameraName, direction: event.source.direction, repeated: event.suppressAutomaticInput === true };
}
function latestItems(items: readonly PlateHistoryItem[]) {
  return [...new Map(items.map(item => [item.id, item])).values()]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || b.id.localeCompare(a.id, 'en', { numeric: true })).slice(0, 100);
}
export function appendPlateHistory(items: readonly PlateHistoryItem[], event: HshDetectionEvent, receivedAt: number): readonly PlateHistoryItem[] {
  if (!event.eventId.startsWith('shahab:') || !event.plateText.trim() || items.some(item => item.id === event.eventId)) return items;
  return latestItems([...items, historyItem(event, receivedAt)]);
}
export function mergePlateHistory(items: readonly PlateHistoryItem[], snapshot: ShahabHistorySnapshot, receivedAt: number) {
  const start = Date.parse(snapshot.dayStartUtc); const end = Date.parse(snapshot.dayEndUtc); const serverTime = Date.parse(snapshot.serverTimeUtc);
  const currentDay = items.filter(item => Date.parse(item.occurredAt) >= start && Date.parse(item.occurredAt) < end);
  const historical = snapshot.items.map(event => historyItem(event, receivedAt - Math.max(0, serverTime - Date.parse(event.occurredAtUtc))));
  // Keep live messages that arrived while the snapshot was being read; never replay them into the form.
  return latestItems([...currentDay, ...historical]);
}
export function plateHistoryFreshness(latest: PlateHistoryItem | undefined, now: number) {
  if (!latest) return 'empty';
  const age = Math.max(0, now - latest.receivedAt);
  return age < 60000 ? 'recent' : age < 300000 ? 'aging' : 'old';
}
