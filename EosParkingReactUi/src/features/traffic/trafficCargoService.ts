import { z } from 'zod';
import { cargoApi } from '../../api/management';
import { recordValue, type RecordValue } from '../../utils/records';
import { trafficResult } from './trafficOperationService';

export type CargoFormState = {
  driverId: string; merchandiseId: string; originId: string; destinationId: string;
  weight: string; count: string; reason: string; description: string;
};
export type CargoOptions = { drivers: RecordValue[]; merchandises: RecordValue[]; companies: RecordValue[] };
export class TrafficCargoError extends Error {
  constructor(public readonly key: 'required' | 'alreadyRegistered') { super(key); }
}
const object = z.record(z.string(), z.unknown());
const options = z.array(object);
const numeric = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

export const trafficCargoService = {
  async load(): Promise<CargoOptions> {
    const data = object.parse(trafficResult(await cargoApi.getRequiredData()));
    return {
      drivers: options.parse(data.Drivers ?? data.drivers ?? []),
      merchandises: options.parse(data.Merchandises ?? data.merchandises ?? []),
      companies: options.parse(data.companyDetails ?? data.CompanyDetails ?? []),
    } as CargoOptions;
  },
  async save(row: RecordValue, outbound: boolean, form: CargoFormState, data: CargoOptions) {
    const driver = data.drivers.find(item => String(recordValue(item, 'Id')) === form.driverId);
    const merchandise = data.merchandises.find(item => String(recordValue(item, 'Id')) === form.merchandiseId);
    const origin = data.companies.find(item => String(recordValue(item, 'SectionId')) === form.originId);
    const destination = data.companies.find(item => String(recordValue(item, 'SectionId')) === form.destinationId);
    if (!driver || !merchandise || !origin || !destination || form.originId === form.destinationId) throw new TrafficCargoError('required');
    const dumpId = numeric(recordValue(row, 'DumpId'));
    if (z.boolean().parse(trafficResult(await cargoApi.isRegistered(dumpId, outbound)))) throw new TrafficCargoError('alreadyRegistered');
    trafficResult(await cargoApi.save({
      CargoIOsId: 0, IsOutBoundCargo: outbound, TrafficDumpId: dumpId, Plate: recordValue(row, 'CarPlate'),
      cargoDrivers: driver, CargoMerchandises: merchandise,
      companyDetailsList: [
        { ...origin, IsOriginSection: true, IsDestinationSection: false },
        { ...destination, IsOriginSection: false, IsDestinationSection: true },
      ],
      Weight: numeric(form.weight), Count: numeric(form.count), Resason: form.reason, Description: form.description,
    }));
  },
};
