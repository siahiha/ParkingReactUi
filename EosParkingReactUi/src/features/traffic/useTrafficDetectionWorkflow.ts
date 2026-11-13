import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventCallback } from '@mui/material/utils';
import type { HshArtifactLoader, HshDetectionEvent } from '../../api/hshDetectionRealtime';
import type { ShahabHistorySnapshot } from '../../api/shahabTrafficRealtime';
import { normalizeHistorySearch } from './plateDetectionHistory';
import { useTrafficDetectionPreview } from './useTrafficDetectionPreview';
import { detectionTrafficImage, readTrafficImageUrl } from './trafficImageCapture';

type Observation = { event: HshDetectionEvent; loadArtifact: HshArtifactLoader };
type Options = { scopeKey: string; plate: string; blocked: boolean; onActivate: (event: HshDetectionEvent) => void };
const keyOf = (event: HshDetectionEvent) => normalizeHistorySearch(event.plateText);
function newer(next: Observation, previous?: Observation) {
  if (!previous) return true;
  const difference = Date.parse(next.event.occurredAtUtc) - Date.parse(previous.event.occurredAtUtc);
  if (difference !== 0) return difference > 0;
  // Legacy capture times can have second precision; compare record IDs without losing long integer precision.
  if (next.event.recordId && previous.event.recordId) return next.event.recordId.localeCompare(previous.event.recordId, 'en', { numeric: true }) > 0;
  return next.event.sequence > previous.event.sequence;
}

/** Pending plates retain metadata/loaders only; images belong exclusively to the current plate. */
export function useTrafficDetectionWorkflow({ scopeKey, plate, blocked, onActivate }: Options) {
  const preview = useTrafficDetectionPreview(scopeKey);
  const [revision, setRevision] = useState(0);
  const state = useRef({ scopeKey, mounted: false, selected: '', mayAdvance: true, shown: '', shownPlate: '',
    pending: new Map<string, Observation>(), recent: new Map<string, Observation>(), seen: new Set<string>(), snapshotTime: null as number | null });
  const activate = useEventCallback(onActivate);
  useEffect(() => {
    const current = state.current;
    current.scopeKey = scopeKey;
    current.mounted = true;
    current.selected = ''; current.shown = ''; current.shownPlate = ''; current.mayAdvance = true;
    current.pending.clear(); current.recent.clear(); current.seen.clear(); current.snapshotTime = null;
    return () => { current.mounted = false; current.pending.clear(); current.recent.clear(); current.seen.clear(); };
  }, [scopeKey]);
  const cache = useCallback((observation: Observation) => {
    const current = state.current;
    const key = keyOf(observation.event);
    if (!newer(observation, current.recent.get(key) ?? current.pending.get(key))) return false;
    current.recent.delete(key);
    current.recent.set(key, observation);
    if (current.recent.size > 100) {
      const oldest = [...current.recent.keys()].find(item => item !== current.selected);
      if (oldest) current.recent.delete(oldest);
    }
    return true;
  }, []);
  const show = useCallback((observation: Observation, accepted = false) => {
    const current = state.current;
    if (current.shown === observation.event.eventId) return;
    const key = keyOf(observation.event);
    preview.receiveDetection(observation.event, accepted, observation.loadArtifact, current.shownPlate === key);
    current.shown = observation.event.eventId;
    current.shownPlate = key;
  }, [preview.receiveDetection]);
  const observe = useEventCallback((event: HshDetectionEvent, loadArtifact: HshArtifactLoader) => {
    const current = state.current;
    const key = keyOf(event);
    if (!key || current.seen.has(event.eventId)) return;
    current.seen.add(event.eventId);
    if (current.seen.size > 512) current.seen.delete(current.seen.values().next().value!);
    const observation = { event, loadArtifact };
    if (!cache(observation)) return;
    const selected = normalizeHistorySearch(plate) || current.selected;
    if (key === selected) show(observation);
    else {
      // Updating a queued plate keeps its original position while replacing its photo source.
      if (current.pending.has(key) || !event.suppressAutomaticInput) current.pending.set(key, observation);
      if (!selected) show(observation);
    }
    setRevision(value => value + 1);
  });
  const receiveDetection = useCallback((event: HshDetectionEvent, loadArtifact: HshArtifactLoader) => {
    if (state.current.mounted && state.current.scopeKey === scopeKey) observe(event, loadArtifact);
  }, [scopeKey, observe]);
  const receiveSnapshot = useCallback((snapshot: ShahabHistorySnapshot) => {
    const current = state.current;
    if (!current.mounted || current.scopeKey !== scopeKey) return;
    const since = current.snapshotTime;
    current.snapshotTime = Math.max(since ?? -Infinity, Date.parse(snapshot.serverTimeUtc));
    for (const event of [...snapshot.items].sort((a, b) => Date.parse(a.occurredAtUtc) - Date.parse(b.occurredAtUtc))) {
      const loader: HshArtifactLoader = kind => snapshot.loadArtifact?.(event.eventId, kind) ?? Promise.resolve(null);
      // The first snapshot is a browsing baseline, never a replay of all today's traffic.
      if (since !== null && Date.parse(event.occurredAtUtc) > since) receiveDetection(event, loader);
      else {
        const observation = { event, loadArtifact: loader };
        if (cache(observation) && keyOf(event) === current.selected) show(observation);
      }
    }
    setRevision(value => value + 1);
  }, [scopeKey, cache, receiveDetection, show]);
  const selectPlate = useCallback((nextPlate: string) => {
    const current = state.current;
    const key = normalizeHistorySearch(nextPlate);
    if (current.selected && current.selected !== key) {
      const previous = current.recent.get(current.selected);
      if (previous) current.pending = new Map([[current.selected, previous], ...current.pending]);
    }
    current.selected = key;
    current.mayAdvance = false;
    const pending = current.pending.get(key);
    const recent = current.recent.get(key);
    const observation = recent && (!pending || newer(recent, pending)) ? recent : pending;
    current.pending.delete(key);
    if (observation) { cache(observation); show(observation); }
    else { preview.clearPreview(); current.shown = ''; current.shownPlate = ''; }
  }, [cache, show, preview.clearPreview]);
  const finishPlate = useCallback((resolvedPlate: string) => {
    const current = state.current;
    const key = normalizeHistorySearch(resolvedPlate) || current.selected;
    current.pending.delete(key);
    current.recent.delete(key);
    current.selected = ''; current.mayAdvance = true;
    setRevision(value => value + 1);
  }, []);
  const cancelPlate = useCallback((resolvedPlate: string) => {
    const current = state.current;
    const key = normalizeHistorySearch(resolvedPlate) || current.selected;
    let latest: Observation | undefined;
    for (const [pendingKey, pending] of current.pending) {
      const recent = current.recent.get(pendingKey);
      const observation = recent && newer(recent, pending) ? recent : pending;
      if (pendingKey !== key && newer(observation, latest)) latest = observation;
    }
    // Cancel abandons the backlog; successful registration still advances in arrival order.
    current.pending.clear();
    if (latest) current.pending.set(keyOf(latest.event), latest);
    current.recent.delete(key);
    current.selected = ''; current.mayAdvance = true;
    preview.clearPreview(); current.shown = ''; current.shownPlate = '';
    setRevision(value => value + 1);
  }, [preview.clearPreview]);
  useEffect(() => {
    const current = state.current;
    if (!current.mounted || current.scopeKey !== scopeKey) return;
    const key = normalizeHistorySearch(plate);
    if (key) {
      if (key !== current.selected) selectPlate(plate);
      return;
    }
    if (blocked || !current.mayAdvance) return;
    const next = current.pending.entries().next().value;
    if (!next) return;
    const recent = current.recent.get(next[0]);
    const observation = recent && newer(recent, next[1]) ? recent : next[1];
    current.pending.delete(next[0]);
    current.selected = next[0]; current.mayAdvance = false;
    cache(observation);
    show(observation, true);
    activate(observation.event);
  }, [scopeKey, plate, blocked, revision, selectPlate, cache, show, activate]);
  const capturePlateImage = useEventCallback(async (currentPlate: string, direction: 'entry' | 'exit', fallback: string | null) => {
    const current = state.current;
    if (!current.mounted || current.scopeKey !== scopeKey) return null;
    // Snapshot the observation at submit time; later detections cannot change this record's photo.
    const observation = current.recent.get(normalizeHistorySearch(currentPlate));
    if (!observation || observation.event.source.direction && observation.event.source.direction !== direction) return fallback;
    const displayed = preview.latestDetection;
    const previous = displayed?.fullFrameUrl && keyOf(displayed.event) === keyOf(observation.event)
      ? readTrafficImageUrl(displayed.fullFrameUrl) : Promise.resolve(null);
    const image = await detectionTrafficImage(() => observation.loadArtifact('FullFrameRaw'));
    const selectedImage = image ?? await previous ?? fallback;
    return current.mounted && current.scopeKey === scopeKey ? selectedImage : null;
  });
  return { latestDetection: preview.latestDetection, receiveDetection, receiveSnapshot, selectPlate, finishPlate, cancelPlate, capturePlateImage };
}
