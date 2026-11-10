import { z } from 'zod';
import { trafficApi } from '../../api/management';
import type { TrafficGridRow } from './trafficGridData';

const scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const recordSchema = z.record(z.string(), z.unknown());
const rowSchema = z.object({
  DumpId: scalar.optional(), dumpId: scalar.optional(), Id: scalar.optional(), id: scalar.optional(),
  EnterDateTime: z.string().nullable().optional(), enterDateTime: z.string().nullable().optional(),
  ExitDateTime: z.string().nullable().optional(), exitDateTime: z.string().nullable().optional(),
}).catchall(z.unknown()).refine(row => {
  const id = row.DumpId ?? row.dumpId ?? row.Id ?? row.id;
  return id !== null && id !== undefined && Number.isFinite(Number(id)) && Number(id) > 0;
}, 'Traffic identifier is missing').transform(row => {
  // ExitBillDto also contains arrays such as TarrifIds; this grid consumes scalar fields only.
  const result: TrafficGridRow = {};
  for (const [key, value] of Object.entries(row)) {
    const parsed = scalar.safeParse(value);
    if (parsed.success) result[key] = parsed.data;
  }
  return result;
});

function unwrap(value: unknown): unknown {
  if (Array.isArray(value)) return value;
  const root = recordSchema.parse(value);
  return root.Values ?? root.values ?? root.Data ?? root.data ?? root.Items ?? root.items ?? value;
}

export async function fetchDoorTraffics(doorId: number, signal: AbortSignal): Promise<TrafficGridRow[]> {
  const response = await trafficApi.getTraffics(doorId, signal);
  return z.array(rowSchema).parse(unwrap(unwrap(response)));
}
