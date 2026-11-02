import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHome3ParkingInfo, type Home3ParkingInfo } from './home3ParkingInfoService';

const refreshIntervalMs = 30_000;

type LoadState = {
  data: Home3ParkingInfo | null;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
};

export function useHome3ParkingInfo(parkingId: number) {
  const [state, setState] = useState<LoadState>({ data: null, loading: true, refreshing: false, error: false });
  const requestRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current || parkingId <= 0) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    setState((current) => ({ ...current, loading: current.data === null, refreshing: current.data !== null, error: false }));

    try {
      const data = await fetchHome3ParkingInfo(parkingId, controller.signal);
      setState({ data, loading: false, refreshing: false, error: false });
    } catch (cause) {
      if (!controller.signal.aborted) {
        setState((current) => ({ ...current, loading: false, refreshing: false, error: true }));
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      inFlightRef.current = false;
    }
  }, [parkingId]);

  useEffect(() => {
    setState({ data: null, loading: true, refreshing: false, error: false });
    void refresh();
    const intervalId = window.setInterval(() => { void refresh(); }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
      requestRef.current?.abort();
      requestRef.current = null;
      inFlightRef.current = false;
    };
  }, [parkingId, refresh]);

  return { ...state, refresh };
}
