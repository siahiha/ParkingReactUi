import { describe, expect, it } from 'vitest';
import { trafficActionState } from './trafficActionState';
import type { TrafficDoorType } from './trafficDoorService';

const outside = { DumpId: 0, Plate: '12ب34567', EnterDateTime: null };
const inside = { ...outside, DumpId: 42, EnterDateTime: '2026-11-10T08:00:00', ExitDateTime: null };

describe('manual traffic actions', () => {
  it.each([
    [0, false, 'enter', true, false, true],
    [0, true, 'enter', false, false, true],
    [1, false, 'exit', false, false, true],
    [1, true, 'exit', false, true, false],
    [2, false, 'enter', true, false, true],
    [2, true, 'exit', false, true, false],
    [3, false, null, false, false, true],
    [3, true, null, false, false, false],
  ] as const)('restricts door %i with existing entry %s', (type, open, direction, canEnter, canExit, showSearch) => {
    expect(trafficActionState(type, open ? inside : outside)).toEqual({ direction, canEnter, canExit, showSearch,
      showEnter: type === 0 || type === 2, showExit: type === 1 || type === 2 });
  });
  it('does not authorize unidentified traffic or an unknown door', () => {
    for (const type of [0, 1, 2, 3] as TrafficDoorType[]) {
      expect(trafficActionState(type, null)).toMatchObject({ canEnter: false, canExit: false, showSearch: false });
    }
    expect(trafficActionState(undefined, inside)).toEqual({ direction: null, showEnter: false, showExit: false, canEnter: false, canExit: false, showSearch: false });
  });
  it('treats legacy empty times consistently and requires a valid open record for exit', () => {
    expect(trafficActionState(2, { ...outside, EnterDateTime: '0001-01-01T00:00:00' })).toEqual(trafficActionState(2, outside));
    expect(trafficActionState(2, { ...inside, DumpId: 0 }).canExit).toBe(false);
    expect(trafficActionState(2, { ...inside, ExitDateTime: '2026-11-10T09:00:00' })).toMatchObject({ direction: 'enter', canEnter: true, canExit: false });
  });
});
