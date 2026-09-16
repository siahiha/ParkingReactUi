import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyInput, normalizeMoneyInput } from './formatters';

describe('money formatters', () => {
  it('renders monetary values with a three-digit separator and Latin digits', () => {
    expect(formatMoney(1234567)).toBe('1,234,567');
    expect(formatMoney('invalid')).toBe('—');
  });

  it('normalizes Persian and Arabic digits before formatting an editable amount', () => {
    expect(normalizeMoneyInput('۱٬۲۳۴,٥٦٧ ریال')).toBe('1234567');
    expect(formatMoneyInput('۱٬۲۳۴٬۵۶۷')).toBe('1,234,567');
  });
});
