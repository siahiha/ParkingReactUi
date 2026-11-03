import { z } from 'zod';

const id = z.number().int().positive();
const sectionId = z.union([id, z.literal(-1)]).nullable();
const spaceSchema = z.object({
  id, title: z.string(), floorId: id, floorTitle: z.string(),
  sectionId: id.nullable(), sectionTitle: z.string().nullable(), kindTitle: z.string().nullable(),
  isActive: z.boolean(), isAssigned: z.boolean(), occupancyStatus: z.literal('Unknown'),
});
const pageSchema = z.object({
  parkingId: id, sectionId, page: z.number().int().positive(), pageSize: z.number().int().min(1).max(48),
  totalCount: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(),
  unsectionedCount: z.number().int().nonnegative(), generatedAtUtc: z.iso.datetime(),
  sections: z.array(z.object({ id, title: z.string(), spaceCount: z.number().int().nonnegative() })),
  items: z.array(spaceSchema).max(48),
}).superRefine((page, context) => {
  if (page.items.length > page.pageSize || page.totalPages !== Math.ceil(page.totalCount / page.pageSize)
    || page.page > Math.max(1, page.totalPages)) {
    context.addIssue({ code: 'custom', message: 'Inconsistent parking-map page.' });
  }
});

export type ParkingMapPage = z.infer<typeof pageSchema>;
export type ParkingMapSpace = z.infer<typeof spaceSchema>;
export type ParkingMapQuery = { parkingId: number; sectionId: number | null; page: number; pageSize: number };
export type ParkingMapStatus = 'connecting' | 'connected' | 'reconnecting' | 'unavailable' | 'unauthorized' | 'forbidden' | 'notFound';

// SignalR and Web API may use different casing; normalize only at the boundary.
function camelKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key.charAt(0).toLowerCase() + key.slice(1), camelKeys(item)]));
  }
  return value;
}

export function parseParkingMapUpdate(input: unknown, requestId: string, parkingId: number): ParkingMapPage | null {
  const envelope = z.object({ requestId: z.string(), page: z.unknown() }).parse(camelKeys(input));
  if (envelope.requestId !== requestId) return null;
  const result = pageSchema.parse(envelope.page);
  if (result.parkingId !== parkingId) return null;
  return result;
}

export function parseParkingMapError(input: unknown, requestId: string): ParkingMapStatus | null {
  const envelope = z.object({ requestId: z.string(), code: z.string() }).safeParse(camelKeys(input));
  if (!envelope.success || envelope.data.requestId !== requestId) return null;
  const code = envelope.data.code;
  return code === 'unauthorized' || code === 'forbidden' || code === 'notFound' ? code : 'unavailable';
}
