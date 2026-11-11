import { z } from 'zod';
import { apiRequest } from '../../api/client';
import { trafficResult } from './trafficOperationService';
import { trafficBoolean } from './trafficPolicy';

export type TrafficDoorType = 0 | 1 | 2 | 3;
export type TrafficAuthorizationType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TrafficDoor = { id: number; type: TrafficDoorType; authorizationType?: TrafficAuthorizationType; posConfigured?: boolean; hasPriceDisplay?: boolean };
const doorSchema = z.object({
  id: z.coerce.number().int().positive(),
  type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  authorizationType: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
});

export async function fetchTrafficDoor(doorId: number, signal: AbortSignal): Promise<TrafficDoor> {
  const raw = z.record(z.string(), z.unknown()).parse(trafficResult(await apiRequest<unknown>(
    `api/Parking/GetParkingDoor?doorId=${doorId}`, { signal },
  )));
  const type = raw.DoorType ?? raw.doorType;
  const authorizationType = raw.EntryAuthorizaitionType ?? raw.entryAuthorizaitionType;
  const door = doorSchema.parse({ id: raw.Id ?? raw.id, type: typeof type === 'string' && /^[0-3]$/.test(type) ? Number(type) : type,
    ...(authorizationType != null ? { authorizationType: typeof authorizationType === 'string' && /^[0-6]$/.test(authorizationType) ? Number(authorizationType) : authorizationType } : {}),
  });
  if (door.id !== doorId) throw new Error('Door mismatch');
  const pos = raw.PcPos ?? raw.pcPos;
  return { ...door,
    ...('PcPos' in raw || 'pcPos' in raw ? { posConfigured: Boolean(pos && typeof pos === 'object' && !Array.isArray(pos) && !trafficBoolean((pos as Record<string, unknown>).Disabled ?? (pos as Record<string, unknown>).disabled)) } : {}),
    ...('HaveLcdPrice' in raw || 'haveLcdPrice' in raw ? { hasPriceDisplay: trafficBoolean(raw.HaveLcdPrice ?? raw.haveLcdPrice) } : {}),
  };
}
