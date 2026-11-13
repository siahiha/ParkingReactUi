import { describe, expect, it } from 'vitest';
import { parseParkingSelections } from './parkingSelectionService';

describe('parking selection and commercial checkout mode', () => {
  it('retains the Boolean for each parking and supports either API casing', () => {
    expect(parseParkingSelections({ ResponseResultType: 1, Values: [
      { Id: 7, ParkingName: ' Commercial ', IsCommercialParking: true, HasUserShifts: true },
      { id: 8, parkingName: 'Other', isCommercialParking: false, hasUserShifts: false },
    ] })).toEqual([
      { id: 7, name: 'Commercial', isCommercialParking: true, hasUserShifts: true },
      { id: 8, name: 'Other', isCommercialParking: false, hasUserShifts: false },
    ]);
  });
  it('uses the existing non-commercial default for an omitted flag', () => {
    expect(parseParkingSelections([{ Id: 7, ParkingName: 'Legacy' }])[0].isCommercialParking).toBe(false);
    expect(parseParkingSelections([{ Id: 7, ParkingName: 'Legacy' }])[0].hasUserShifts).toBe(false);
  });
  it.each(['false', 'true', 0, 1, null])('rejects an invalid user shifts flag %j', flag => {
    expect(() => parseParkingSelections([{ Id: 7, ParkingName: 'Parking', HasUserShifts: flag }])).toThrow();
  });
  it.each(['false', 'true', 0, 1, null])('does not guess an invalid commercial flag %j', flag => {
    expect(() => parseParkingSelections([{ Id: 7, ParkingName: 'Parking', IsCommercialParking: flag }])).toThrow();
  });
  it('rejects failed or malformed responses and filters unusable selections', () => {
    expect(() => parseParkingSelections({ ResponseResultType: 7, Values: [{ Id: 7, ParkingName: 'Parking' }] })).toThrow();
    expect(() => parseParkingSelections({ ResponseResultType: 1, Values: {} })).toThrow();
    expect(parseParkingSelections([{ Id: 0, ParkingName: 'Invalid' }, { Id: 7, ParkingName: '' }])).toEqual([]);
  });
});
