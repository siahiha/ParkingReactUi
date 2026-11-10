import { useCallback, useRef, useState } from 'react';
import { trafficOperationService, TrafficOperationError, type TrafficOperationInput } from './trafficOperationService';

export function useTrafficOperations() {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    if (locked.current) throw new TrafficOperationError();
    locked.current = true;
    setPending(true);
    try { return await operation(); }
    finally { locked.current = false; setPending(false); }
  }, []);
  return {
    pending,
    lookup: trafficOperationService.lookup,
    enter: (input: TrafficOperationInput) => run(() => trafficOperationService.enter(input)),
    exit: (input: TrafficOperationInput, time: string | null) => run(() => trafficOperationService.exit(input, time)),
    pay: (dumpId: number) => run(() => trafficOperationService.pay(dumpId)),
  };
}
