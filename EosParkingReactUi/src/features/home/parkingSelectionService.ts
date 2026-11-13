import { z } from 'zod';
import { parkingApi } from '../../api/management';
import { unwrapValues } from '../../utils/records';

const rowSchema = z.record(z.string(), z.unknown());
const optionSchema = z.object({ id: z.coerce.number().int().positive(), name: z.string().trim().min(1) });
// Older parking responses omit this Boolean; their existing form default is non-commercial.
const commercialSchema = z.boolean().optional().default(false);
export const parkingSettingsChangedEvent = 'eos-parking-settings-changed';
export type ParkingSelection = { id: number; name: string; isCommercialParking: boolean; hasUserShifts: boolean };

export function parseParkingSelections(response: unknown): ParkingSelection[] {
  if (!Array.isArray(response)) {
    const envelope = rowSchema.parse(response);
    const result = envelope.ResponseResultType ?? envelope.responseResultType;
    if (result !== 1 && result !== '1') throw new Error('Parking list failed.');
  }
  return z.array(rowSchema).parse(unwrapValues(response)).flatMap(row => {
    const option = optionSchema.safeParse({ id: row.Id ?? row.id, name: row.ParkingName ?? row.parkingName });
    if (!option.success) return [];
    const commercial = Object.hasOwn(row, 'IsCommercialParking') ? row.IsCommercialParking : row.isCommercialParking;
    const shifts = Object.hasOwn(row, 'HasUserShifts') ? row.HasUserShifts : row.hasUserShifts;
    return [{ ...option.data, isCommercialParking: commercialSchema.parse(commercial), hasUserShifts: commercialSchema.parse(shifts) }];
  });
}

export async function fetchParkingSelections() {
  return parseParkingSelections(await parkingApi.list());
}
