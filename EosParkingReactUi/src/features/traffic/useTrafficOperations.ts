import { useCallback, useRef, useState } from 'react';
import { trafficOperationService, TrafficOperationError, type TrafficOperationInput } from './trafficOperationService';
import { trafficExitService } from './trafficExitService';
import type { RecordValue } from '../../utils/records';

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
    completeExit: (input: TrafficOperationInput, time: string | null, isCommercialParking: boolean) => run(() => trafficExitService.complete(input, time, isCommercialParking)),
    settleDirectly: (bill: RecordValue) => run(() => trafficExitService.settle(bill)),
    pay: (dumpId: number) => run(() => trafficOperationService.pay(dumpId)),
  };
}
