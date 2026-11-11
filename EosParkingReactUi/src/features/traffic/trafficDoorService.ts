import { z } from 'zod';
import { apiRequest } from '../../api/client';
import { trafficResult } from './trafficOperationService';

export type TrafficDoorType = 0 | 1 | 2 | 3;
export type TrafficDoor = { id: number; type: TrafficDoorType };
const doorSchema = z.object({ id: z.coerce.number().int().positive(), type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]) });

export async function fetchTrafficDoor(doorId: number, signal: AbortSignal): Promise<TrafficDoor> {
  const raw = z.record(z.string(), z.unknown()).parse(trafficResult(await apiRequest<unknown>(
    `api/Parking/GetParkingDoor?doorId=${doorId}`, { signal },
  )));
  const type = raw.DoorType ?? raw.doorType;
  const door = doorSchema.parse({ id: raw.Id ?? raw.id, type: typeof type === 'string' && /^[0-3]$/.test(type) ? Number(type) : type });
  if (door.id !== doorId) throw new Error('Door mismatch');
  return door;
}
