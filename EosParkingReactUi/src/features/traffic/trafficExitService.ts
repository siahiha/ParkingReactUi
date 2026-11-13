import { z } from 'zod';
import { recordValue, type RecordValue } from '../../utils/records';
import { hasTrafficTime, trafficOperationService, TrafficOperationError, type TrafficOperationInput } from './trafficOperationService';
import { trafficPaymentAmount } from './trafficPaymentPolicy';

type ExitResult = { bill: RecordValue; settlement: 'notRequested' | 'settled' }
  | { bill: RecordValue; settlement: 'failed'; cause: unknown };

const numericValue = z.union([z.number(), z.string().trim().min(1)]).transform(Number);
const settlementSchema = z.object({
  dumpId: numericValue.pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER)),
  payType: numericValue.pipe(z.number().int().min(0).max(9)),
  exitDateTime: z.unknown().refine(hasTrafficTime),
});

export const trafficExitService = {
  async settle(bill: RecordValue) {
    const { dumpId, payType } = settlementSchema.parse({
      dumpId: recordValue(bill, 'DumpId'),
      payType: recordValue(bill, 'PayType'),
      exitDateTime: recordValue(bill, 'ExitDateTime'),
    });
    const amount = trafficPaymentAmount(bill);
    if (amount < 0 || amount > 0 && payType === 5) throw new TrafficOperationError();
    // DoExitDump already settles free exits; paid/park-attendant bills must not be charged again.
    if (amount === 0 || (payType !== 0 && payType !== 9)) return;
    await trafficOperationService.pay(dumpId);
  },
  async complete(input: TrafficOperationInput, exitDateTime: string | null, isCommercialParking: boolean): Promise<ExitResult> {
    const bill = await trafficOperationService.exit(input, exitDateTime);
    if (isCommercialParking) return { bill, settlement: 'notRequested' };
    try {
      await trafficExitService.settle(bill);
      return { bill, settlement: 'settled' };
    } catch (cause) {
      // Exit has already committed. Payment failure must not offer another exit mutation.
      return { bill, settlement: 'failed', cause };
    }
  },
};
