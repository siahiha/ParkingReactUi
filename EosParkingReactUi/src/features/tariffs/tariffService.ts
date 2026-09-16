import { z } from 'zod';
import { apiRequest } from '../../api/client';

export type TariffListRow = {
  id: number;
  title: string;
  isActive: boolean;
  isCurrent: boolean;
  isMemberTariff: boolean;
  persistedOn: string | null;
  raw: Record<string, unknown>;
};
export type MemberKindOption = { id: number; title: string };

const responseSchema = z.union([
  z.array(z.unknown()),
  z.object({ Values: z.unknown().optional(), values: z.unknown().optional(), Data: z.unknown().optional(), data: z.unknown().optional() }).passthrough(),
]);
const recordSchema = z.record(z.string(), z.unknown());

function valueOf(record: Record<string, unknown>, key: string) {
  return record[key] ?? record[key.charAt(0).toLowerCase() + key.slice(1)];
}

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'True';
}

function rowsFromResponse(input: unknown) {
  const response = responseSchema.safeParse(input);
  if (!response.success) return [];
  if (Array.isArray(response.data)) return response.data;
  return response.data.Values ?? response.data.values ?? response.data.Data ?? response.data.data ?? [];
}

export function parseTariffList(input: unknown): TariffListRow[] {
  const records = rowsFromResponse(input);
  if (!Array.isArray(records)) return [];

  return records.flatMap((item) => {
    const record = recordSchema.safeParse(item);
    if (!record.success) return [];
    const id = Number(valueOf(record.data, 'Id'));
    return [{
      id: Number.isFinite(id) ? id : 0,
      title: String(valueOf(record.data, 'Title') ?? ''),
      isActive: asBoolean(valueOf(record.data, 'IsActive')),
      isCurrent: asBoolean(valueOf(record.data, 'IsCurrent')),
      isMemberTariff: asBoolean(valueOf(record.data, 'IsMemberRegisterKindTariff')),
      persistedOn: valueOf(record.data, 'PersistOn') ? String(valueOf(record.data, 'PersistOn')) : null,
      raw: record.data,
    }];
  });
}

export const tariffService = {
  async list(parkingId: number, signal?: AbortSignal) {
    const response = await apiRequest<unknown>(`api/Tariff/GetByParkingId?parkingId=${parkingId}`, { signal });
    return parseTariffList(response);
  },
  async memberKinds(parkingId: number, signal?: AbortSignal): Promise<MemberKindOption[]> {
    const response = await apiRequest<unknown>(`api/Member/GetMemberRegisterKindsByParkingId?parkingId=${parkingId}`, { signal });
    const rows = rowsFromResponse(response);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((item: unknown) => {
      const record = recordSchema.safeParse(item);
      if (!record.success) return [];
      const id = Number(valueOf(record.data, 'Id'));
      const title = String(valueOf(record.data, 'Title') ?? '');
      return Number.isFinite(id) && title ? [{ id, title }] : [];
    });
  },
  save(payload: Record<string, unknown>) {
    return apiRequest<unknown>('api/Tariff/Save', { method: 'POST', body: JSON.stringify(payload) });
  },
  remove(id: number) {
    return apiRequest<unknown>(`api/Tariff/Delete?id=${id}`);
  },
};
