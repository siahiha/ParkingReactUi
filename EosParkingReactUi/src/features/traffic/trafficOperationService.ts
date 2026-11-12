import { z } from 'zod';
import { apiRequest } from '../../api/client';
import { trafficApi } from '../../api/management';
import { recordValue, type RecordValue } from '../../components/management/managementTypes';
import { appConfig } from '../../config';
import { trafficAlerts, type TrafficAlert } from './trafficPolicy';
import type { TrafficDoorType } from './trafficDoorService';

export class TrafficOperationError extends Error {
  constructor(public readonly userMessage = '', public readonly messageKey: TrafficAlert['key'] | 'invalidQr' | 'vehicleForbidden' | 'selectVehicle' | 'directionUnavailable' | '' = '') { super('Traffic operation failed'); }
}

const envelopeSchema = z.object({
  ResponseResultType: z.union([z.number(), z.string()]).optional(),
  responseResultType: z.union([z.number(), z.string()]).optional(),
  Message: z.string().nullable().optional(), message: z.string().nullable().optional(),
  Values: z.unknown().optional(), values: z.unknown().optional(),
});
const recordSchema = z.record(z.string(), z.unknown());
const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export function trafficResult(response: unknown): unknown {
  const parsed = envelopeSchema.safeParse(response);
  if (!parsed.success) throw new TrafficOperationError();
  const result = parsed.data;
  const resultType = result.ResponseResultType ?? result.responseResultType;
  if (resultType !== 1 && resultType !== '1') {
    // Message is the backend's public validation message; RealMessage may contain internal diagnostics.
    throw new TrafficOperationError(result.Message ?? result.message ?? '');
  }
  return result.Values ?? result.values;
}

function trafficRecord(value: unknown): RecordValue {
  const parsed = recordSchema.safeParse(value);
  if (!parsed.success) throw new TrafficOperationError();
  return Object.fromEntries(Object.entries(parsed.data).flatMap(([key, value]) => {
    const scalar = scalarSchema.safeParse(value);
    return scalar.success ? [[key, scalar.data]] : [];
  }));
}

const idOf = (row: RecordValue, key: string) => Number(recordValue(row, key)) || 0;
export function hasTrafficTime(value: unknown) {
  return Boolean(value) && !String(value).startsWith('0001-01-01') && Number.isFinite(Date.parse(String(value)));
}
export function hasOpenTraffic(info: RecordValue) {
  return idOf(info, 'DumpId') > 0 && hasTrafficTime(recordValue(info, 'EnterDateTime')) && !hasTrafficTime(recordValue(info, 'ExitDateTime'));
}

export type TrafficOperationInput = {
  parkingId: number; doorId: number; doorType?: TrafficDoorType; userId?: number; plate: string; carType: number; info: RecordValue;
};

async function tariffIdFor(input: TrafficOperationInput): Promise<number> {
  const memberTariff = idOf(input.info, 'MemberTariffId');
  if (memberTariff > 0) return memberTariff;
  const values = trafficResult(await apiRequest<unknown>(`api/Tariff/GetByParkingId?parkingId=${input.parkingId}`));
  const tariffs = z.array(recordSchema).parse(values);
  const current = tariffs.find(row => [true, 1, '1', 'true'].includes(recordValue(trafficRecord(row), 'IsCurrent') ?? false));
  const id = current ? idOf(trafficRecord(current), 'Id') : 0;
  if (id <= 0) throw new TrafficOperationError();
  return id;
}

async function dumpPayload(input: TrafficOperationInput) {
  if (input.doorId <= 0 || input.parkingId <= 0) throw new TrafficOperationError();
  return {
    CardId: idOf(input.info, 'CardId') || null, MemberId: idOf(input.info, 'MemberId') || null,
    CarId: idOf(input.info, 'CarId') || null, CarPlate: input.plate, CarType: input.carType,
    TariffId: await tariffIdFor(input), SourceType: 2, IdOnDevice: 0,
    PersistBy: input.userId || null, DoSave: true, BillControlType: 0,
    DtoViewCarColorTitle: recordValue(input.info, 'CarColor') ?? '',
    DtoViewCarModelTitle: recordValue(input.info, 'CarModel') ?? '',
  };
}

function checkTraffic(input: TrafficOperationInput, direction: 'enter' | 'exit') {
  if (input.doorType !== undefined && input.doorType !== 2 && input.doorType !== (direction === 'enter' ? 0 : 1)) {
    throw new TrafficOperationError('', 'directionUnavailable');
  }
  const blocked = trafficAlerts(input.info, direction, appConfig.trafficRequireExitPermission).find(alert => alert.blocked);
  if (blocked) throw new TrafficOperationError('', blocked.key);
}

export const trafficOperationService = {
  async lookup(parkingId: number, plate: string, card: string, member: string) {
    const info = trafficRecord(trafficResult(await trafficApi.getCarTrafficInfo(parkingId, plate, card, member)));
    const dumpId = recordValue(info, 'DumpId');
    if (dumpId === undefined || dumpId === null || !Number.isFinite(Number(dumpId)) || Number(dumpId) < 0) throw new TrafficOperationError();
    return info;
  },
  async enter(input: TrafficOperationInput) {
    checkTraffic(input, 'enter');
    if (hasOpenTraffic(input.info)) throw new TrafficOperationError();
    const payload = { ...await dumpPayload(input), Id: 0, DoorId: input.doorId };
    const saved = trafficRecord(trafficResult(await trafficApi.createEnterDump(payload)));
    if (idOf(saved, 'Id') <= 0) throw new TrafficOperationError();
    return saved;
  },
  async exit(input: TrafficOperationInput, exitDateTime: string | null) {
    checkTraffic(input, 'exit');
    if (!hasOpenTraffic(input.info)) throw new TrafficOperationError();
    const payload = {
      ...await dumpPayload(input), Id: idOf(input.info, 'DumpId'), ExitDoorId: input.doorId,
      EnterDateTime: recordValue(input.info, 'EnterDateTime'), ExitDateTime: exitDateTime,
    };
    const bill = trafficRecord(trafficResult(await trafficApi.doExitDump(payload)));
    if (idOf(bill, 'DumpId') !== payload.Id || !hasTrafficTime(recordValue(bill, 'ExitDateTime'))) throw new TrafficOperationError();
    return bill;
  },
  async pay(dumpId: number) {
    if (dumpId <= 0) throw new TrafficOperationError();
    const receipt = trafficResult(await trafficApi.payDump(dumpId, 1));
    if (typeof receipt !== 'string' || !receipt.trim()) throw new TrafficOperationError();
    return receipt;
  },
};
