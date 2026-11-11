import { z } from 'zod';
import { recordValue, type RecordValue } from '../../components/management/managementTypes';

const amountSchema = z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().finite());

export type TrafficPaymentSource = 'exit' | 'grid';

export function trafficPaymentAmount(bill: RecordValue) {
  return amountSchema.parse(recordValue(bill, 'CommonCost'));
}

export function trafficPaymentPolicy(bill: RecordValue, source: TrafficPaymentSource) {
  const amount = trafficPaymentAmount(bill);
  // Visitors can have a card too; a member identity qualifies for the shorter timeout.
  const isMember = Number(recordValue(bill, 'MemberId')) > 0 || String(recordValue(bill, 'MemberCode') ?? '').trim().length > 0;
  let timeoutSeconds = 20;
  if (source === 'grid') timeoutSeconds = amount === 0 ? 5 : 0;
  else if (isMember && amount === 0) timeoutSeconds = 5;
  return {
    modal: amount !== 0,
    timeoutSeconds,
    amount,
  };
}
