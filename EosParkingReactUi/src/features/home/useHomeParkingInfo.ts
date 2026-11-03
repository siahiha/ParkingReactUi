import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { fetchHomeParkingInfo, type HomeParkingInfo } from './homeParkingInfoService';

const refreshIntervalMs = 30_000;
const retryDelaysMs = [1_000, 3_000] as const;

type LoadState = {
  data: HomeParkingInfo | null;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
};

function isRetryableError(cause: unknown, signal: AbortSignal) {
  if (signal.aborted) return false;
  if (cause instanceof ApiError) return cause.status === 408 || cause.status === 429 || cause.status >= 500;
  if (cause instanceof DOMException) return cause.name === 'AbortError';
  return cause instanceof TypeError;
}

function waitForRetry(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, delayMs);
    const abort = () => {
      window.clearTimeout(timeoutId);
      signal.removeEventListener('abort', abort);
      reject(new DOMException('The request was aborted.', 'AbortError'));
    };
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

export function useHomeParkingInfo(parkingId: number) {
  const [state, setState] = useState<LoadState>({ data: null, loading: true, refreshing: false, error: false });
  const requestRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current || parkingId <= 0) return;
    inFlightRef.current = true;
    const operationController = new AbortController();
    requestRef.current = operationController;
    setState((current) => ({ ...current, loading: current.data === null, refreshing: current.data !== null, error: false }));

    try {
      for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
        try {
          const data = await fetchHomeParkingInfo(parkingId, operationController.signal);
          setState({ data, loading: false, refreshing: false, error: false });
          return;
        } catch (cause) {
          const retryDelay = retryDelaysMs[attempt];
          if (!retryDelay || !isRetryableError(cause, operationController.signal)) throw cause;
          await waitForRetry(retryDelay, operationController.signal);
        }
      }
    } catch (cause) {
      if (!operationController.signal.aborted) {
        setState((current) => ({ ...current, loading: false, refreshing: false, error: true }));
      }
    } finally {
      if (requestRef.current === operationController) {
        requestRef.current = null;
        inFlightRef.current = false;
      }
    }
  }, [parkingId]);

  useEffect(() => {
    let disposed = false;
    let intervalId: number | null = null;
    setState({ data: null, loading: true, refreshing: false, error: false });

    const stopPolling = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      requestRef.current?.abort();
      requestRef.current = null;
      inFlightRef.current = false;
    };
    const startPolling = () => {
      if (disposed || document.visibilityState === 'hidden' || intervalId !== null) return;
      void refresh();
      intervalId = window.setInterval(() => { void refresh(); }, refreshIntervalMs);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopPolling();
      else startPolling();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [parkingId, refresh]);

  return { ...state, refresh };
}

