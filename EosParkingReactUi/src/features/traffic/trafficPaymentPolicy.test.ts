import { describe, expect, it } from 'vitest';
import { trafficPaymentPolicy } from './trafficPaymentPolicy';

const member = { MemberCode: '76101', CommonCost: 3000, TotalCost: 10000 };

describe('traffic payment presentation policy', () => {
  it('gives every non-member exit bill twenty seconds, including visitors with cards', () => {
    for (const CommonCost of [3000, 0]) {
      expect(trafficPaymentPolicy({ CommonCost }, 'exit').timeoutSeconds).toBe(20);
      expect(trafficPaymentPolicy({ CardNumber: '1234', MemberCode: '', CommonCost }, 'exit').timeoutSeconds).toBe(20);
    }
  });
  it('uses the remaining amount and twenty seconds for a member with an outstanding balance', () => {
    expect(trafficPaymentPolicy(member, 'exit')).toEqual({ modal: true, amount: 3000, timeoutSeconds: 20 });
  });
  it('gives a free member bill five seconds, independently of the total cost', () => {
    expect(trafficPaymentPolicy({ ...member, CommonCost: '0' }, 'exit')).toEqual({ modal: false, amount: 0, timeoutSeconds: 5 });
    expect(trafficPaymentPolicy({ MemberId: 11, CommonCost: 0 }, 'exit').timeoutSeconds).toBe(5);
  });
  it('preserves explicit grid payment without a positive-amount timer', () => {
    expect(trafficPaymentPolicy(member, 'grid')).toEqual({ modal: true, amount: 3000, timeoutSeconds: 0 });
    expect(trafficPaymentPolicy({ CommonCost: 0 }, 'grid')).toEqual({ modal: false, amount: 0, timeoutSeconds: 5 });
  });
  it.each([undefined, null, '', ' ', 'invalid', false, Infinity])('rejects malformed remaining amount %j instead of treating it as free', CommonCost => {
    expect(() => trafficPaymentPolicy({ ...member, CommonCost }, 'exit')).toThrow();
  });
});
