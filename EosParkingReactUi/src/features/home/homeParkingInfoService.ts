import { z } from 'zod';
import { parkingApi } from '../../api/management';

const numberField = z.union([z.number(), z.string()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value) && value >= 0);

const dateField = z.union([z.string(), z.number()]).nullable();
const doorStatusSchema = z.object({
  doorId: numberField,
  doorTitle: z.string(),
  trafficCount: numberField,
  lastTrafficDateTime: dateField,
  isActive: z.boolean(),
});

const parkingInfoSchema = z.object({
  totalCapacity: numberField,
  occupied: numberField,
  available: numberField,
  doorCount: numberField,
  serverDateTime: dateField,
  deviceInfo: z.string().nullable(),
  doorStatuses: z.array(doorStatusSchema),
});

export type HomeParkingInfo = z.infer<typeof parkingInfoSchema>;

function unwrapValues(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const record = input as Record<string, unknown>;
  return record.Values ?? record.values ?? record.Data ?? record.data;
}

function readField(record: Record<string, unknown>, name: string) {
  return record[name] ?? record[name.charAt(0).toLowerCase() + name.slice(1)];
}

export async function fetchHomeParkingInfo(parkingId: number, signal?: AbortSignal): Promise<HomeParkingInfo> {
  const response = await parkingApi.getInfoById(parkingId, signal);
  const values = unwrapValues(response);
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new Error('Parking information response is missing Values.');
  }

  const record = values as Record<string, unknown>;
  const doorStatuses = readField(record, 'DoorStatuses');
  const doorRecords = Array.isArray(doorStatuses)
    ? doorStatuses.filter((door): door is Record<string, unknown> => Boolean(door && typeof door === 'object' && !Array.isArray(door)))
    : [];
  return parkingInfoSchema.parse({
    totalCapacity: readField(record, 'TotalParkSpaces'),
    occupied: readField(record, 'OccupiedParkSpaceCount'),
    available: readField(record, 'FreeParkSpaceCount'),
    doorCount: readField(record, 'DoorCount'),
    serverDateTime: readField(record, 'ServerDateTime') ?? readField(record, 'SolarServerDateTime') ?? null,
    deviceInfo: (readField(record, 'DeviceProcInfo') as string | null | undefined) ?? null,
    doorStatuses: doorRecords.map((item) => {
      return {
        doorId: readField(item, 'DoorId'),
        doorTitle: readField(item, 'DoorTitle'),
        trafficCount: readField(item, 'TrafficCount'),
        lastTrafficDateTime: readField(item, 'LastTrafficDateTime') ?? null,
        isActive: readField(item, 'IsActive'),
      };
    }),
  });
}

export function occupancyPercentage(info: HomeParkingInfo | null) {
  if (!info || info.totalCapacity <= 0) return null;
  return Math.round((info.occupied / info.totalCapacity) * 100);
}


