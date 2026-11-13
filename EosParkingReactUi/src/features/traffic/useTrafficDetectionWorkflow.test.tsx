import { useState } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import type { ShahabHistorySnapshot } from '../../api/shahabTrafficRealtime';
import { useTrafficDetectionWorkflow } from './useTrafficDetectionWorkflow';

const a = '12ب34567'; const b = '22ب45678'; const c = '33ب56789';
function event(id: number, plateText = a, repeated = false): HshDetectionEvent {
  return { eventId: `shahab:${id}`, sequence: id, eventType: 'plate.detected', occurredAtUtc: new Date(Date.UTC(2026, 10, 13, 8, 0, id)).toISOString(),
    source: { cameraId: '17', direction: 'entry' }, plateText, suppressAutomaticInput: repeated, matched: true,
    matchingTriggerIds: [], confidence: null, artifacts: [], raw: {} };
}
const pictures = (id: number) => vi.fn(async (kind?: string) => `data:${id}:${kind}`);
function harness(initialPlate = '', paused = false) {
  const activated = vi.fn();
  const hook = renderHook(({ scope }) => {
    const [plate, setPlate] = useState(initialPlate);
    const [blocked, setBlocked] = useState(paused);
    const workflow = useTrafficDetectionWorkflow({ scopeKey: scope, plate, blocked: blocked || Boolean(plate),
      onActivate: incoming => { activated(incoming.plateText); setPlate(incoming.plateText); } });
    return { ...workflow, plate, setPlate, setBlocked,
      finish: () => { workflow.finishPlate(plate); setPlate(''); },
      cancel: () => { workflow.cancelPlate(plate); setPlate(''); } };
  }, { initialProps: { scope: '7:8' } });
  return { ...hook, activated };
}
function snapshot(items: HshDetectionEvent[], serverTimeUtc: string, loadArtifact = vi.fn(async (id: string, kind?: string) => `data:history:${id}:${kind}`)): ShahabHistorySnapshot {
  return { items, serverTimeUtc, dayStartUtc: '2026-11-13T00:00:00Z', dayEndUtc: '2026-11-14T00:00:00Z', loadArtifact };
}
afterEach(cleanup);

describe('current plate preview and pending identification', () => {
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
  it('captures only the selected plate and direction, with detector priority over the camera', async () => {
    const { result } = harness();
    const load = vi.fn(async () => `data:image/png;base64,${png}`);
    await act(async () => result.current.receiveDetection(event(1), load));
    await act(async () => result.current.receiveDetection(event(2, b), pictures(2)));
    expect(await result.current.capturePlateImage(a, 'entry', 'camera')).toBe(png);
    expect(await result.current.capturePlateImage(a, 'exit', 'exit-camera')).toBe('exit-camera');
    expect(await result.current.capturePlateImage(c, 'entry', 'camera')).toBe('camera');
  });
  it('snapshots the image source at submission and invalidates an old door capture', async () => {
    const { result, rerender } = harness();
    let release!: (image: string | null) => void;
    const load = vi.fn(() => new Promise<string | null>(resolve => { release = resolve; }));
    await act(async () => result.current.receiveDetection(event(1), load));
    const saving = result.current.capturePlateImage(a, 'entry', 'camera');
    await act(async () => { await Promise.resolve(); result.current.receiveDetection(event(2, b), pictures(2)); });
    // Let the new submit request finish without using the next plate's source.
    release(`data:image/png;base64,${png}`);
    expect(await saving).toBe(png);
    const delayed = result.current.capturePlateImage(a, 'entry', 'camera');
    await act(async () => { await Promise.resolve(); rerender({ scope: '7:9' }); });
    release(`data:image/png;base64,${png}`);
    expect(await delayed).toBeNull();
  });
  it('uses the last valid photo of the same plate, then the camera when that plate has no photo', async () => {
    const { result } = harness();
    await act(async () => result.current.receiveDetection(event(1), async () => `data:image/png;base64,${png}`));
    await act(async () => result.current.receiveDetection(event(2), async () => null));
    expect(await result.current.capturePlateImage(a, 'entry', 'camera')).toBe(png);
    await act(async () => result.current.cancel());
    await act(async () => result.current.receiveDetection(event(3, b), async () => null));
    expect(await result.current.capturePlateImage(b, 'entry', 'camera')).toBe('camera');
  });
  it('cancels the backlog and jumps directly to its latest detection without returning to skipped plates', async () => {
    const { result, activated } = harness();
    const skipped = pictures(2); const latest = pictures(3);
    await act(async () => result.current.receiveDetection(event(1), pictures(1)));
    await act(async () => {
      result.current.receiveDetection(event(2, b), skipped);
      result.current.receiveDetection(event(3, c), latest);
    });
    await act(async () => result.current.cancel());
    expect(result.current.plate).toBe(c);
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:3:FullFrameRaw');
    expect(skipped).not.toHaveBeenCalled();
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe('');
    expect(activated.mock.calls).toEqual([[a], [c]]);
    await act(async () => result.current.receiveDetection(event(4, b), pictures(4)));
    expect(result.current.plate).toBe(b);
  });
  it('uses capture time rather than queue position for cancel and still waits for form readiness', async () => {
    const { result, activated } = harness(a, true);
    await act(async () => {
      result.current.receiveDetection(event(2, b), pictures(2));
      result.current.receiveDetection(event(4, b, true), pictures(4));
      result.current.receiveDetection(event(3, c), pictures(3));
    });
    await act(async () => result.current.cancel());
    expect(result.current.plate).toBe('');
    expect(result.current.latestDetection).toBeNull();
    expect(activated).not.toHaveBeenCalled();
    await act(async () => result.current.setBlocked(false));
    expect(result.current.plate).toBe(b);
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:4:FullFrameRaw');
    await act(async () => result.current.cancel());
    expect(result.current.plate).toBe('');
    expect(result.current.latestDetection).toBeNull();
    expect(activated.mock.calls).toEqual([[b]]);
  });
  it('pins the current plate, refreshes its latest photo and handles every other plate in arrival order', async () => {
    const { result, activated } = harness();
    const first = pictures(1); const next = pictures(2); const third = pictures(3); const repeatedNext = pictures(4); const latestCurrent = pictures(5);
    await act(async () => result.current.receiveDetection(event(1), first));
    expect(result.current.plate).toBe(a);
    await act(async () => {
      result.current.receiveDetection(event(2, b), next);
      result.current.receiveDetection(event(3, c), third);
      result.current.receiveDetection(event(4, b, true), repeatedNext);
      result.current.receiveDetection(event(5, a, true), latestCurrent);
    });
    expect(result.current.plate).toBe(a);
    expect(activated.mock.calls).toEqual([[a]]);
    expect(result.current.latestDetection).toMatchObject({ event: event(5, a, true), fullFrameUrl: 'data:5:FullFrameRaw' });
    expect(next).not.toHaveBeenCalled(); expect(third).not.toHaveBeenCalled(); expect(repeatedNext).not.toHaveBeenCalled();
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe(b);
    expect(result.current.latestDetection).toMatchObject({ event: event(4, b, true), fullFrameUrl: 'data:4:FullFrameRaw' });
    expect(repeatedNext).toHaveBeenCalledTimes(2);
    await act(async () => result.current.receiveDetection(event(6, a, true), pictures(6)));
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe(c);
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe('');
    expect(activated.mock.calls).toEqual([[a], [b], [c]]);
  });
  it('holds pending identification while a bill, operation or history interaction blocks the form', async () => {
    const { result, activated } = harness(a, true);
    await act(async () => result.current.receiveDetection(event(1, b), pictures(1)));
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe('');
    expect(activated).not.toHaveBeenCalled();
    await act(async () => result.current.setBlocked(false));
    expect(result.current.plate).toBe(b);
    expect(activated).toHaveBeenCalledExactlyOnceWith(b);
  });
  it('keeps current work and pending plates until success or explicit dismissal', async () => {
    const { result, activated } = harness();
    await act(async () => result.current.receiveDetection(event(1), pictures(1)));
    await act(async () => {
      result.current.setBlocked(true);
      result.current.receiveDetection(event(2, b), pictures(2));
    });
    await act(async () => result.current.setBlocked(false));
    expect(result.current.plate).toBe(a);
    expect(activated.mock.calls).toEqual([[a]]);
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe(b);
  });
  it('does not automatically replay the initial history, but loads the selected historical plate image', async () => {
    const { result, activated } = harness();
    const load = vi.fn(async (id: string, kind?: string) => `data:history:${id}:${kind}`);
    await act(async () => result.current.receiveSnapshot(snapshot([event(1), event(2, b)], '2026-11-13T08:01:00Z', load)));
    expect(activated).not.toHaveBeenCalled(); expect(load).not.toHaveBeenCalled();
    await act(async () => { result.current.selectPlate(a); result.current.setPlate(a); });
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:history:shahab:1:FullFrameRaw');
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('recovers new missed detections from later snapshots without reintroducing resolved work', async () => {
    const { result, activated } = harness(a, true);
    await act(async () => result.current.receiveSnapshot(snapshot([event(1)], '2026-11-13T08:01:00Z')));
    await act(async () => result.current.receiveSnapshot(snapshot([event(1), event(61, b)], '2026-11-13T08:01:02Z')));
    await act(async () => { result.current.finish(); result.current.setBlocked(false); });
    expect(result.current.plate).toBe(b);
    await act(async () => result.current.finish());
    await act(async () => result.current.receiveSnapshot(snapshot([event(1), event(61, b)], '2026-11-13T08:01:03Z')));
    expect(result.current.plate).toBe('');
    expect(activated.mock.calls).toEqual([[b]]);
  });
  it('preserves unresolved current work when the operator selects a different plate', async () => {
    const { result, activated } = harness();
    await act(async () => result.current.receiveDetection(event(1), pictures(1)));
    await act(async () => result.current.receiveDetection(event(2, b), pictures(2)));
    await act(async () => { result.current.selectPlate(b); result.current.setPlate(b); });
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe(a);
    expect(activated.mock.calls).toEqual([[a], [a]]);
  });
  it('retains more pending vehicles than the 100-row browsing history', async () => {
    const { result, activated } = harness('', true);
    await act(async () => {
      for (let id = 1; id <= 105; id++) result.current.receiveDetection(event(id, `12ب${String(id).padStart(3, '0')}67`), pictures(id));
    });
    await act(async () => result.current.setBlocked(false));
    await act(async () => result.current.receiveDetection(event(0, '12ب00167'), pictures(0)));
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:1:FullFrameRaw');
    for (let id = 1; id <= 105; id++) {
      expect(result.current.plate).toBe(`12ب${String(id).padStart(3, '0')}67`);
      await act(async () => result.current.finish());
    }
    expect(activated).toHaveBeenCalledTimes(105);
    expect(result.current.plate).toBe('');
  });
  it('rejects old door callbacks and does not carry another door pending work into the form', async () => {
    const { result, rerender } = harness('', true);
    const receiveOld = result.current.receiveDetection;
    await act(async () => result.current.receiveDetection(event(1), pictures(1)));
    rerender({ scope: '7:9' });
    await act(async () => { receiveOld(event(2, b), pictures(2)); result.current.setBlocked(false); });
    expect(result.current.plate).toBe('');
    expect(result.current.latestDetection).toBeNull();
    await act(async () => result.current.receiveDetection(event(3, c), pictures(3)));
    expect(result.current.plate).toBe(c);
  });
  it('does not allow an older observation of the current plate to replace its latest photo', async () => {
    const { result } = harness();
    await act(async () => result.current.receiveDetection(event(5), pictures(5)));
    await act(async () => result.current.receiveDetection(event(2), pictures(2)));
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:5:FullFrameRaw');
  });
  it('chooses the newest historical record when capture timestamps are identical', async () => {
    const { result } = harness(a, true);
    const first = { ...event(1), recordId: '90071992547409930', sequence: 0 };
    const latest = { ...first, eventId: 'shahab:2', recordId: '90071992547409931' };
    await act(async () => result.current.receiveSnapshot(snapshot([first, latest], '2026-11-13T08:01:00Z')));
    expect(result.current.latestDetection?.fullFrameUrl).toBe('data:history:shahab:2:FullFrameRaw');
  });
  it('never displays a completed plate picture that arrives after the next plate has been activated', async () => {
    const { result } = harness();
    let full!: (url: string) => void; let crop!: (url: string) => void;
    const frame = new Promise<string>(resolve => { full = resolve; });
    const plateImage = new Promise<string>(resolve => { crop = resolve; });
    const load = (kind?: string) => kind === 'FullFrameRaw' ? frame : plateImage;
    await act(async () => result.current.receiveDetection(event(1), load));
    await act(async () => result.current.receiveDetection(event(2, b), pictures(2)));
    await act(async () => result.current.finish());
    expect(result.current.plate).toBe(b);
    await act(async () => { full('data:old-full'); crop('data:old-plate'); });
    expect(result.current.latestDetection).toMatchObject({ event: event(2, b), fullFrameUrl: 'data:2:FullFrameRaw', plateImageUrl: 'data:2:PlateCrop' });
  });
});
