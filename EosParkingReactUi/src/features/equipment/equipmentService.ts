import { z } from 'zod';
import { ApiError, apiRequest } from '../../api/client';

const envelope = z.object({ ResponseResultType: z.number(), Values: z.unknown() });
const equipment = z.object({ Id: z.number().int().positive(), DeviceName: z.string().nullable(), DeviceType: z.number().int() }).passthrough();
const connectionResult = z.object({
  Status: z.enum(['connected', 'disconnected', 'unsupported', 'invalid-config', 'timeout', 'busy', 'error', 'unavailable']),
  Connected: z.boolean(), CheckedAtUtc: z.iso.datetime(),
}).refine(value => value.Connected === (value.Status === 'connected'));

function result<T>(body: unknown, schema: z.ZodType<T>): T {
  const parsed = envelope.parse(body);
  if (parsed.ResponseResultType !== 1) {
    const status = [11, 12].includes(parsed.ResponseResultType) ? 401
      : [16, 22, 23].includes(parsed.ResponseResultType) ? 403 : 400;
    throw new ApiError(status, { ResponseResultType: parsed.ResponseResultType });
  }
  return schema.parse(parsed.Values);
}

export type EquipmentConnectionSettings = {
  ParkingId: number; DeviceType: number; ConnectionType: number; Ip: string; Port: number;
  ComPort: number | null; BoudRate: number; ReadTimeOut: number; WriteTimeOut: number;
};
export type EquipmentConnectionResult = z.infer<typeof connectionResult>;
export const serviceDeviceTypes = new Set(['1', '3', '4', '5', '9']);

export const equipmentService = {
  async getAll(parkingId: number, signal?: AbortSignal) {
    const body = await apiRequest<unknown>(`api/Parking/GetParkingEquipments?parkingId=${parkingId}`, { signal });
    return result(body, z.array(equipment));
  },
  async save(payload: Record<string, unknown>) {
    const body = await apiRequest<unknown>('api/Parking/SaveParkingEquipment', { method: 'POST', body: JSON.stringify(payload) });
    return result(body, z.number().int().positive());
  },
  async delete(equipmentId: number) {
    const body = await apiRequest<unknown>(`api/Parking/DeleteEquipmentById?equipmentId=${equipmentId}`);
    return result(body, z.literal(true));
  },
  async testConnection(settings: EquipmentConnectionSettings, signal: AbortSignal): Promise<EquipmentConnectionResult> {
    const body = await apiRequest<unknown>('api/Equipment/TestConnection', {
      method: 'POST', body: JSON.stringify(settings), signal, timeoutMs: 15_000,
    });
    return connectionResult.parse(body);
  },
};
