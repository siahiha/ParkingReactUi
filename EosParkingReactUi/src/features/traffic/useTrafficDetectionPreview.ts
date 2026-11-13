import { useCallback, useEffect, useRef, useState } from 'react';
import type { HshArtifactLoader, HshDetectionEvent } from '../../api/hshDetectionRealtime';

type Pictures = { fullFrameUrl: string | null; plateImageUrl: string | null };
type Preview = Pictures & { event: HshDetectionEvent; acceptedForInput: boolean };
type PictureRequest = { revision: number; preview: Preview; scopeKey: string; loadArtifact: HshArtifactLoader; preservePictures: boolean };
const emptyPictures: Pictures = { fullFrameUrl: null, plateImageUrl: null };

function releasePictures(pictures: Pictures | null, retained?: Pictures) {
  for (const url of [pictures?.fullFrameUrl, pictures?.plateImageUrl]) {
    if (url?.startsWith('blob:') && url !== retained?.fullFrameUrl && url !== retained?.plateImageUrl) URL.revokeObjectURL(url);
  }
}

/** Metadata stays immediate; picture work is one active pair plus the newest waiting observation. */
export function useTrafficDetectionPreview(scopeKey: string) {
  const [latest, setLatest] = useState<{ scopeKey: string; preview: Preview } | null>(null);
  const queue = useRef({ active: false, scopeKey, running: false, revision: 0,
    pending: null as PictureRequest | null, displayed: null as Pictures | null });

  const clearPreview = useCallback(() => {
    const state = queue.current;
    state.revision++;
    state.pending = null;
    releasePictures(state.displayed);
    state.displayed = null;
    setLatest(null);
  }, []);

  useEffect(() => {
    const state = queue.current;
    state.active = true;
    state.scopeKey = scopeKey;
    clearPreview();
    return () => {
      state.active = false;
      state.revision++;
      state.pending = null;
      releasePictures(state.displayed);
      state.displayed = null;
    };
  }, [scopeKey, clearPreview]);

  const drainPictures = useCallback(async () => {
    const state = queue.current;
    if (state.running || !state.active) return;
    state.running = true;
    try {
      while (state.active && state.pending) {
        const request = state.pending;
        state.pending = null;
        const load = (kind: string) => Promise.resolve().then(() => request.loadArtifact(kind)).catch(() => null);
        const [fullFrameUrl, plateImageUrl] = await Promise.all([load('FullFrameRaw'), load('PlateCrop')]);
        const pictures = { fullFrameUrl, plateImageUrl };
        if (state.active && request.revision === state.revision) {
          const next = request.preservePictures ? {
            fullFrameUrl: fullFrameUrl ?? state.displayed?.fullFrameUrl ?? null,
            plateImageUrl: plateImageUrl ?? state.displayed?.plateImageUrl ?? null,
          } : pictures;
          releasePictures(state.displayed, next);
          state.displayed = next;
          setLatest({ scopeKey: request.scopeKey, preview: { ...request.preview, ...next } });
        } else {
          releasePictures(pictures);
        }
      }
    } finally { state.running = false; }
  }, []);

  const receiveDetection = useCallback((event: HshDetectionEvent, acceptedForInput: boolean, loadArtifact: HshArtifactLoader, preservePictures = false) => {
    const state = queue.current;
    if (!state.active || state.scopeKey !== scopeKey) return;
    const preview = { event, acceptedForInput, ...(preservePictures ? state.displayed ?? emptyPictures : emptyPictures) };
    if (!preservePictures) {
      releasePictures(state.displayed);
      state.displayed = null;
    }
    setLatest({ scopeKey, preview });
    state.pending = { revision: ++state.revision, preview, scopeKey, loadArtifact, preservePictures };
    void drainPictures();
  }, [scopeKey, drainPictures]);

  return { latestDetection: latest?.scopeKey === scopeKey ? latest.preview : null, receiveDetection, clearPreview };
}
