export type { Language } from '../i18n/instance';
export type Primitive = string | number | boolean | null | undefined;
export type RecordValue = Record<string, Primitive>;

export function unwrapValues(input: unknown): unknown {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'object') return input;
  const value = input as Record<string, unknown>;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}

export function asRows(input: unknown): RecordValue[] {
  const value = unwrapValues(input);
  if (Array.isArray(value)) return value.filter((row): row is RecordValue => Boolean(row && typeof row === 'object'));
  return value && typeof value === 'object' ? [value as RecordValue] : [];
}

export function recordValue(row: RecordValue, key: string): Primitive {
  return row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
}
