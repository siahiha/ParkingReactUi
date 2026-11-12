import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import { appendPlateHistory, mergePlateHistory, normalizeHistorySearch, plateHistoryFreshness, type PlateHistoryItem } from './plateDetectionHistory';
import { usePlateDetectionHistory } from './usePlateDetectionHistory';

const detection = (id: number, overrides: Partial<HshDetectionEvent> = {}): HshDetectionEvent => ({
  eventId: `shahab:${id}`, sequence: id, eventType: 'plate.detected', occurredAtUtc: '2026-11-12T10:00:00Z',
  source: { cameraId: '17', direction: 'entry', cameraName: 'Entrance' }, matched: true, matchingTriggerIds: [],
  plateText: '12ب34567', confidence: null, artifacts: [], raw: {}, ...overrides,
});

describe('operator plate detection history', () => {
  afterEach(() => vi.useRealTimers());
  it('keeps the last 100 detections, including repeated plates, without images or duplicate event deliveries', () => {
    let items: readonly PlateHistoryItem[] = [];
    for (let id = 1; id <= 105; id++) items = appendPlateHistory(items, detection(id, { suppressAutomaticInput: id > 1 }), id);
    expect(items).toHaveLength(100);
    expect(items[0]).toMatchObject({ id: 'shahab:105', repeated: true });
    expect(items.at(-1)?.id).toBe('shahab:6');
    expect(items[0]).not.toHaveProperty('raw');
    expect(items[0]).not.toHaveProperty('artifacts');
    expect(appendPlateHistory(items, detection(105), 999)).toBe(items);
    expect(appendPlateHistory(items, detection(106, { eventId: 'other-service:106' }), 999)).toBe(items);
    expect(appendPlateHistory(items, detection(106, { plateText: ' ' }), 999)).toBe(items);
  });

  it('normalizes grid searches and keeps repetition independent of freshness', () => {
    const items = appendPlateHistory(appendPlateHistory([], detection(1), 1000), detection(2, { suppressAutomaticInput: true }), 2000);
    expect(normalizeHistorySearch('۳۴۵')).toBe('345');
    expect(normalizeHistorySearch('٣٤٥')).toBe('345');
    expect(normalizeHistorySearch('12 ب 345 - 67')).toBe('12ب34567');
    expect(plateHistoryFreshness(undefined, 0)).toBe('empty');
    expect(plateHistoryFreshness(items[0], 2000 + 59999)).toBe('recent');
    expect(plateHistoryFreshness(items[0], 2000 + 60000)).toBe('aging');
    expect(plateHistoryFreshness(items[0], 2000 + 300000)).toBe('old');
  });

  it('merges today’s snapshot without losing a concurrent live record or making old history look fresh', () => {
    const old = detection(1, { occurredAtUtc: '2026-11-11T23:59:59Z' });
    const live = detection(3, { occurredAtUtc: '2026-11-12T10:00:01Z' });
    const snapshot = { serverTimeUtc: '2026-11-12T10:00:02Z', dayStartUtc: '2026-11-12T00:00:00Z', dayEndUtc: '2026-11-13T00:00:00Z',
      items: [detection(2, { occurredAtUtc: '2026-11-12T08:00:00Z', suppressAutomaticInput: true })] };
    const items = mergePlateHistory(appendPlateHistory(appendPlateHistory([], old, 10), live, 20), snapshot, 10000000);
    expect(items.map(item => item.id)).toEqual(['shahab:3', 'shahab:2']);
    expect(items[1].repeated).toBe(true);
    expect(plateHistoryFreshness(items[1], 10000000)).toBe('old');
  });

  it('expires yesterday at the server midnight even if the operator clock is wrong', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2030-01-01T09:00:00Z'));
    const { result } = renderHook(() => usePlateDetectionHistory('7:8'));
    act(() => result.current.receiveSnapshot({ serverTimeUtc: '2026-11-12T23:59:59Z', dayStartUtc: '2026-11-12T00:00:00Z', dayEndUtc: '2026-11-13T00:00:00Z', items: [detection(1)] }));
    expect(result.current.items).toHaveLength(1);
    act(() => result.current.recordDetection(detection(2, { occurredAtUtc: '2026-11-11T10:00:00Z' })));
    expect(result.current.items).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.items).toEqual([]);
    expect(result.current.status).toBe('loading');
  });

  it('separates parking/door histories and retains each history when the operator returns', () => {
    const { result, rerender } = renderHook(({ door }) => usePlateDetectionHistory(door), { initialProps: { door: '7:8' } });
    const previousDoor = result.current.recordDetection;
    act(() => result.current.recordDetection(detection(1)));
    rerender({ door: '7:9' });
    expect(result.current.items).toEqual([]);
    act(() => result.current.recordDetection(detection(2)));
    // A callback captured for the previous subscription cannot write into the current door.
    act(() => previousDoor(detection(3)));
    expect(result.current.items.map(item => item.id)).toEqual(['shahab:2']);
    rerender({ door: '7:8' });
    expect(result.current.items.map(item => item.id)).toEqual(['shahab:3', 'shahab:1']);
    rerender({ door: '9:8' });
    expect(result.current.items).toEqual([]);
  });
});
