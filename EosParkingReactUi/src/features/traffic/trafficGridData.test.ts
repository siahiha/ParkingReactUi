import { describe, expect, it } from 'vitest';
import { membershipText, splitTrafficRows } from './trafficGridData';

const rows = [
  { DumpId: 1, EnterDateTime: '2026-11-10T09:00:00', ExitDateTime: null, MemberFullName: 'علي كريمي', MemberCode: '۱۲۳', MemberNationalCode: '۰۰۱۲۳۴۵۶۷۸', CardNumber: '٥٦٧', AbsolutCarPlate: '۱۲ب۳۴۵۶۷' },
  { DumpId: 2, EnterDateTime: '2026-11-10T10:00:00', ExitDateTime: '0001-01-01T00:00:00', MemberCode: '456' },
  { DumpId: 3, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: '2026-11-10T11:00:00', MemberCode: '789' },
  { DumpId: 4, EnterDateTime: '2026-11-10T07:00:00', ExitDateTime: '2026-11-10T12:00:00' },
];
describe('traffic grid data', () => {
  it('separates open entries from exits and sorts each by its own latest time without mutating source', () => {
    const result = splitTrafficRows(rows, '');
    expect(result.entries.map(row => row.DumpId)).toEqual([2, 1]);
    expect(result.exits.map(row => row.DumpId)).toEqual([4, 3]);
    expect(rows.map(row => row.DumpId)).toEqual([1, 2, 3, 4]);
  });
  it.each(['12 ب-345 67', '٥٦٧', '۱۲۳', 'علی کریمی', '0012345678', 'علی کریمی - 123'])('searches identifiers and names with normalized text: %s', query => {
    expect(splitTrafficRows(rows, query).entries.map(row => row.DumpId)).toEqual([1]);
  });
  it('combines name and membership code like the Windows column', () => {
    expect(membershipText(rows[0])).toBe('علي كريمي - ۱۲۳');
  });
});
