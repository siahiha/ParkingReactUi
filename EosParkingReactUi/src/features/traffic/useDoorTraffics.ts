import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { fetchDoorTraffics } from './trafficGridService';
import type { TrafficGridRow } from './trafficGridData';

export const TRAFFIC_REFRESH_MS = 3000;
type State = { doorId: number; rows: TrafficGridRow[]; loading: boolean; error: 'loadError' | 'forbidden' | ''; updatedAt: Date | null };

export function useDoorTraffics(doorId: number, enabled: boolean) {
  const [state, setState] = useState<State>({ doorId, rows: [], loading: false, error: '', updatedAt: null });
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const refresh = useCallback(() => refreshRef.current(), []);

  useEffect(() => {
    let active = true;
    let pending: Promise<void> | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let canPoll = true;
    const controller = new AbortController();
    setState({ doorId, rows: [], loading: enabled && doorId > 0, error: '', updatedAt: null });
    if (!enabled || doorId <= 0) {
      refreshRef.current = async () => {};
      return () => controller.abort();
    }
    const refreshRows = (): Promise<void> => {
      if (pending) return pending;
      canPoll = true;
      clearTimeout(timer);
      pending = (async () => {
        try {
          const rows = await fetchDoorTraffics(doorId, controller.signal);
          if (active) setState({ doorId, rows, loading: false, error: '', updatedAt: new Date() });
        } catch (error) {
          const forbidden = error instanceof ApiError && [401, 403].includes(error.status);
          canPoll = !forbidden;
          if (active) setState(current => ({ ...current, loading: false,
            rows: forbidden ? [] : current.rows, updatedAt: forbidden ? null : current.updatedAt,
            error: forbidden ? 'forbidden' : 'loadError',
          }));
        } finally {
          pending = null;
          if (active && canPoll) timer = setTimeout(() => void refreshRows(), TRAFFIC_REFRESH_MS);
        }
      })();
      return pending;
    };
    refreshRef.current = refreshRows;
    void refreshRows();
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      refreshRef.current = async () => {};
    };
  }, [doorId, enabled]);

  return { ...state, rows: state.doorId === doorId && enabled ? state.rows : [], refresh };
}
