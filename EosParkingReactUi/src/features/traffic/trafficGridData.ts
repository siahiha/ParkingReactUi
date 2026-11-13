import { recordValue, type RecordValue } from '../../utils/records';

export type TrafficGridRow = RecordValue;
export const trafficId = (row: TrafficGridRow) => String(recordValue(row, 'DumpId') ?? recordValue(row, 'Id'));
export const trafficField = (row: TrafficGridRow, key: string) => recordValue(row, key);

export function normalizeTrafficSearch(value: unknown): string {
  return String(value ?? '')
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\s\-\u200c]/g, '').toLocaleLowerCase();
}

export function membershipText(row: TrafficGridRow): string {
  return [trafficField(row, 'MemberFullName'), trafficField(row, 'MemberCode')]
    .map(value => String(value ?? '').trim()).filter(Boolean).join(' - ');
}

function timestamp(value: unknown): number {
  const raw = String(value ?? '');
  if (!raw || raw.startsWith('0001-01-01')) return -Infinity;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : -Infinity;
}

export function splitTrafficRows(rows: TrafficGridRow[], search: string) {
  const query = normalizeTrafficSearch(search);
  const matching = rows.filter(row => !query || [
    'AbsolutCarPlate', 'CarPlate', 'CarPlateReversed', 'CardNumber',
    'MemberCode', 'MemberFullName', 'MemberNationalCode',
  ].some(key => normalizeTrafficSearch(trafficField(row, key)).includes(query))
    || normalizeTrafficSearch(membershipText(row)).includes(query));
  const hasExit = (row: TrafficGridRow) => timestamp(trafficField(row, 'ExitDateTime')) > -Infinity;
  const newest = (key: string) => (a: TrafficGridRow, b: TrafficGridRow) =>
    timestamp(trafficField(b, key)) - timestamp(trafficField(a, key)) || trafficId(a).localeCompare(trafficId(b));
  return {
    entries: matching.filter(row => !hasExit(row)).sort(newest('EnterDateTime')),
    exits: matching.filter(hasExit).sort(newest('ExitDateTime')),
  };
}
