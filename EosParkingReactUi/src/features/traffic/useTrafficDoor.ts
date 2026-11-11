import { useCallback, useEffect, useState } from 'react';
import { fetchTrafficDoor, type TrafficDoor } from './trafficDoorService';

export function useTrafficDoor(doorId: number, enabled: boolean) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ doorId: number; door: TrafficDoor | null; loading: boolean; error: boolean }>({ doorId: 0, door: null, loading: false, error: false });
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ doorId, door: null, loading: enabled && doorId > 0, error: false });
    if (enabled && doorId > 0) {
      void fetchTrafficDoor(doorId, controller.signal).then(door => {
        if (!controller.signal.aborted) setState({ doorId, door, loading: false, error: false });
      }).catch(() => {
        if (!controller.signal.aborted) setState({ doorId, door: null, loading: false, error: true });
      });
    }
    return () => controller.abort();
  }, [doorId, enabled, revision]);
  const current = enabled && state.doorId === doorId;
  return { door: current ? state.door : null, loading: enabled && doorId > 0 && (!current || state.loading), error: current && state.error, refresh };
}
