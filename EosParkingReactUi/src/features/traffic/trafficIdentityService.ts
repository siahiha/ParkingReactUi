import { z } from 'zod';
import { apiRequest } from '../../api/client';
import { recordValue, type RecordValue } from '../../components/management/managementTypes';
import { normalizeIranianPlateValue } from '../../components/IranianPlateInput';
import { trafficResult, TrafficOperationError } from './trafficOperationService';
import { trafficImage } from './trafficImages';
import { normalizeCard, parseTrafficQr } from './trafficQr';

const objectSchema = z.record(z.string(), z.unknown());
const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const idSchema = z.coerce.number().int().nonnegative();
const textSchema = z.string().nullable().optional();
const wireBooleanSchema = z.union([z.boolean(), z.literal(0), z.literal(1), z.enum(['0', '1', 'true', 'false'])]);
const carSchema = z.object({
  Id: idSchema, Plate: z.string(), Name: textSchema, CarType: z.coerce.number().int().min(0).max(4),
  DtoViewCarColorTitle: textSchema, DtoViewCarModelTitle: textSchema,
});
const creditSchema = z.object({
  MemberRegisterId: idSchema.optional(), CashAmount: z.coerce.number().finite(),
  RegisterStartDateTime: z.string(), RegisterEndDateTime: z.string(),
  IsActive: wireBooleanSchema,
  MembershipCreditType: z.coerce.number().int().min(0).max(2), Title: textSchema,
});

export type TrafficVehicle = z.infer<typeof carSchema>;
export type TrafficCredit = z.infer<typeof creditSchema>;
export type VehicleDraft = { plate: string; name: string; carType: number; color: string; model: string };
export type TrafficIdentity = {
  info: RecordValue; cars: TrafficVehicle[]; credits: TrafficCredit[]; creditError: boolean;
  personalPhoto: string | null; entranceImage: string | null;
};

function canonicalFields(value: unknown) {
  const row = objectSchema.parse(value);
  return Object.fromEntries(Object.entries(row).map(([key, item]) => [key.charAt(0).toUpperCase() + key.slice(1), item]));
}

export function parseTrafficIdentity(value: unknown): Omit<TrafficIdentity, 'credits' | 'creditError'> {
  const row = canonicalFields(value);
  const info = Object.fromEntries(Object.entries(row).flatMap(([key, item]) => scalarSchema.safeParse(item).success ? [[key, item]] : [])) as RecordValue;
  idSchema.parse(row.DumpId);
  for (const key of ['CarId', 'MemberId', 'CardId', 'MemberTariffId']) {
    if (row[key] !== undefined && row[key] !== null) idSchema.parse(row[key]);
  }
  for (const key of ['ControlType', 'ControlListActionType']) {
    if (row[key] !== undefined && row[key] !== null) {
      z.coerce.number().int().min(0).max(key === 'ControlType' ? 3 : 2).parse(row[key]);
    }
  }
  for (const key of ['IsMemberBlock', 'ExitPermission']) {
    if (row[key] !== undefined && row[key] !== null) wireBooleanSchema.parse(row[key]);
  }
  const rawCars = row.MemberCars ?? [];
  const cars = z.array(z.unknown()).parse(rawCars).map(car => carSchema.parse(canonicalFields(car)));
  return { info, cars, personalPhoto: trafficImage(row.MemberPersonalPhoto)?.url ?? null, entranceImage: trafficImage(row.EnteranceImage)?.url ?? null };
}

export const trafficIdentityService = {
  async lookup(parkingId: number, plate: string, cardInput: string, memberCode: string, signal?: AbortSignal): Promise<TrafficIdentity> {
    let card = normalizeCard(cardInput);
    let qrDumpId: number | null = null;
    if (card.includes('!@^')) {
      const qr = parseTrafficQr(card);
      if (!qr) throw new TrafficOperationError('', 'invalidQr');
      const bill = canonicalFields(trafficResult(await apiRequest<unknown>(`api/traffic/GetTrafficBill?dumpId=${qr.dumpId}`, { signal })));
      // The legacy GetTrafficBill fills ParkingId with a door ID. Scope is checked by the parking lookup below.
      if (Number(bill.DumpId) !== qr.dumpId || Number(bill.PayType) !== 0
        || normalizeIranianPlateValue(String(bill.AbsolutCarPlate ?? bill.CarPlate ?? '')) !== qr.plate) throw new TrafficOperationError('', 'invalidQr');
      qrDumpId = qr.dumpId;
      plate = qr.plate;
      card = qr.cardNumber;
      memberCode = qr.memberCode;
    }
    const raw = trafficResult(await apiRequest<unknown>(`api/traffic/GetCarTrafficInfo?${new URLSearchParams({ parkingId: String(parkingId), plate, memberCard: card, memberCode })}`, { signal }));
    const identity = parseTrafficIdentity(raw);
    if (qrDumpId !== null && Number(recordValue(identity.info, 'DumpId')) !== qrDumpId) throw new TrafficOperationError('', 'invalidQr');
    let credits: TrafficCredit[] = [];
    let creditError = false;
    const memberId = Number(recordValue(identity.info, 'MemberId')) || 0;
    if (memberId > 0) {
      try {
        const values = trafficResult(await apiRequest<unknown>(`api/traffic/GetMemberCurrentCreditInfo?memberId=${memberId}`, { signal }));
        credits = z.array(z.unknown()).parse(values ?? []).map(item => creditSchema.parse(canonicalFields(item)));
      } catch { creditError = true; }
    }
    return { ...identity, credits, creditError };
  },
  async saveVehicle(memberId: number, draft: VehicleDraft) {
    if (!Number.isSafeInteger(memberId) || memberId < 0) throw new TrafficOperationError();
    const query = new URLSearchParams({ memberId: String(memberId), plate: draft.plate, CarName: draft.name,
      carType: String(draft.carType), carColorTitle: draft.color, carModleTitle: draft.model });
    const id = idSchema.parse(trafficResult(await apiRequest<unknown>(`api/traffic/AddMemberCar?${query}`)));
    if (id <= 0) throw new TrafficOperationError();
    return id;
  },
};
