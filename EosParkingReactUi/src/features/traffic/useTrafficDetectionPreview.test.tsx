import { StrictMode, type PropsWithChildren } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import { useTrafficDetectionPreview } from './useTrafficDetectionPreview';

function event(id: number): HshDetectionEvent {
  return { eventId: `shahab:${id}`, sequence: id, eventType: 'plate.detected',
    occurredAtUtc: '2026-11-13T08:00:00Z', source: { cameraId: '17', direction: 'entry' },
    plateText: '12ب34567', matched: true, matchingTriggerIds: [], confidence: null, artifacts: [], raw: {} };
}

function deferred() {
  let resolve!: (value: string | null) => void;
  let reject!: (cause: Error) => void;
  const promise = new Promise<string | null>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function pictures() {
  const fullFrame = deferred();
  const plate = deferred();
  const load = vi.fn((kind?: string) => kind === 'FullFrameRaw' ? fullFrame.promise : plate.promise);
  return { fullFrame, plate, load };
}

const revoke = vi.fn();
describe('traffic detection preview workload and image lifetime', () => {
  beforeEach(() => {
    revoke.mockClear();
    vi.stubGlobal('URL', class extends URL { static revokeObjectURL = revoke; });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('shows metadata immediately and loads only the first and newest pictures during a burst', async () => {
    const { result } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const jobs = Array.from({ length: 20 }, pictures);
    await act(async () => {
      jobs.forEach((job, index) => result.current.receiveDetection(event(index + 1), false, job.load));
    });
    expect(result.current.latestDetection).toMatchObject({ event: event(20), acceptedForInput: false, fullFrameUrl: null, plateImageUrl: null });
    expect(jobs[0].load).toHaveBeenCalledTimes(2);
    for (const job of jobs.slice(1)) expect(job.load).not.toHaveBeenCalled();
    await act(async () => {
      jobs[0].fullFrame.resolve('blob:old-full'); jobs[0].plate.resolve('blob:old-plate');
    });
    for (const job of jobs.slice(1, -1)) expect(job.load).not.toHaveBeenCalled();
    expect(jobs[19].load).toHaveBeenCalledTimes(2);
    expect(revoke).toHaveBeenCalledWith('blob:old-full');
    expect(revoke).toHaveBeenCalledWith('blob:old-plate');
    await act(async () => {
      jobs[19].fullFrame.resolve('blob:new-full'); jobs[19].plate.resolve('blob:new-plate');
    });
    expect(result.current.latestDetection).toMatchObject({ event: event(20), fullFrameUrl: 'blob:new-full', plateImageUrl: 'blob:new-plate' });
  });

  it('waits for both pictures before starting another pair and tolerates a picture failure', async () => {
    const { result } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const first = pictures(); const next = pictures();
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      result.current.receiveDetection(event(2), false, next.load);
      first.fullFrame.reject(new Error('Image unavailable'));
    });
    expect(next.load).not.toHaveBeenCalled();
    await act(async () => { first.plate.resolve(null); });
    expect(next.load).toHaveBeenCalledTimes(2);
    await act(async () => { next.fullFrame.resolve(null); next.plate.resolve('blob:plate'); });
    expect(result.current.latestDetection).toMatchObject({ event: event(2), fullFrameUrl: null, plateImageUrl: 'blob:plate' });
  });

  it('retains the current plate pictures during a refresh and keeps them if a new picture fails', async () => {
    const { result } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const first = pictures(); const next = pictures();
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      first.fullFrame.resolve('blob:current-full'); first.plate.resolve('blob:current-plate');
    });
    await act(async () => result.current.receiveDetection(event(2), false, next.load, true));
    expect(result.current.latestDetection?.fullFrameUrl).toBe('blob:current-full');
    expect(revoke).not.toHaveBeenCalled();
    await act(async () => { next.fullFrame.resolve(null); next.plate.resolve('blob:new-plate'); });
    expect(result.current.latestDetection).toMatchObject({ fullFrameUrl: 'blob:current-full', plateImageUrl: 'blob:new-plate' });
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:current-plate');
  });

  it('clears pending work on cancel and never restores old pictures', async () => {
    const { result } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const first = pictures(); const waiting = pictures();
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      result.current.receiveDetection(event(2), false, waiting.load);
      result.current.clearPreview();
    });
    expect(result.current.latestDetection).toBeNull();
    await act(async () => { first.fullFrame.resolve('blob:old-full'); first.plate.resolve('blob:old-plate'); });
    expect(waiting.load).not.toHaveBeenCalled();
    expect(result.current.latestDetection).toBeNull();
    expect(revoke).toHaveBeenCalledTimes(2);
  });

  it('keeps the concurrency limit across door changes and rejects callbacks from the old door', async () => {
    const { result, rerender } = renderHook(({ door }) => useTrafficDetectionPreview(door), { initialProps: { door: '7:8' } });
    const first = pictures(); const waiting = pictures(); const current = pictures();
    const oldReceive = result.current.receiveDetection;
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      result.current.receiveDetection(event(2), false, waiting.load);
    });
    rerender({ door: '7:9' });
    expect(result.current.latestDetection).toBeNull();
    await act(async () => {
      oldReceive(event(3), false, waiting.load);
      result.current.receiveDetection(event(4), true, current.load);
    });
    expect(current.load).not.toHaveBeenCalled();
    await act(async () => { first.fullFrame.resolve('blob:old-full'); first.plate.resolve(null); });
    expect(waiting.load).not.toHaveBeenCalled();
    expect(current.load).toHaveBeenCalledTimes(2);
    await act(async () => { current.fullFrame.resolve('blob:current'); current.plate.resolve(null); });
    expect(result.current.latestDetection).toMatchObject({ event: event(4), acceptedForInput: true, fullFrameUrl: 'blob:current' });
  });

  it('releases displayed blob URLs on a new observation, cancel and unmount', async () => {
    const { result, unmount } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const first = pictures(); const second = pictures(); const third = pictures();
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      first.fullFrame.resolve('blob:first'); first.plate.resolve('data:image/png;base64,aaa');
    });
    await act(async () => {
      result.current.receiveDetection(event(2), false, second.load);
      second.fullFrame.resolve('blob:second'); second.plate.resolve(null);
    });
    expect(revoke).toHaveBeenCalledWith('blob:first');
    act(() => result.current.clearPreview());
    expect(revoke).toHaveBeenCalledWith('blob:second');
    await act(async () => {
      result.current.receiveDetection(event(3), true, third.load);
      third.fullFrame.resolve('blob:third'); third.plate.resolve(null);
    });
    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:third');
    expect(revoke).toHaveBeenCalledTimes(3);
  });

  it('discards in-flight results and waiting requests after unmount', async () => {
    const { result, unmount } = renderHook(() => useTrafficDetectionPreview('7:8'));
    const first = pictures(); const waiting = pictures();
    await act(async () => {
      result.current.receiveDetection(event(1), true, first.load);
      result.current.receiveDetection(event(2), false, waiting.load);
    });
    unmount();
    await act(async () => { first.fullFrame.resolve('blob:late'); first.plate.resolve(null); });
    expect(revoke).toHaveBeenCalledWith('blob:late');
    expect(waiting.load).not.toHaveBeenCalled();
  });

  it('works after StrictMode effect cleanup and handles a synchronous loader failure', async () => {
    const wrapper = ({ children }: PropsWithChildren) => <StrictMode>{children}</StrictMode>;
    const { result } = renderHook(() => useTrafficDetectionPreview('7:8'), { wrapper });
    const load = vi.fn(() => { throw new Error('Disconnected'); });
    await act(async () => result.current.receiveDetection(event(1), true, load));
    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.latestDetection).toMatchObject({ event: event(1), acceptedForInput: true, fullFrameUrl: null, plateImageUrl: null });
  });
});
