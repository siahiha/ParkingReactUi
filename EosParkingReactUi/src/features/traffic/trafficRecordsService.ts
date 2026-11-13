import { z } from 'zod';
import { parkingApi, trafficApi } from '../../api/management';
import { recordValue, type RecordValue } from '../../utils/records';
import { trafficResult } from './trafficOperationService';

const record = z.record(z.string(), z.unknown());
const records = z.array(record);
export type TrafficDoorOption = { id: number; label: string };
export type TrafficHistoryFilter = { parkingId: number; startDate: string; endDate: string; sourceType: string };

export const trafficRecordsService = {
  async doors(parkingId: number): Promise<TrafficDoorOption[]> {
    return records.parse(trafficResult(await parkingApi.getDoors(parkingId))).map(row => ({
      id: Number(row.Id ?? row.id),
      label: String(row.Title ?? row.title ?? row.Name ?? row.name ?? row.DoorName ?? row.doorName ?? ''),
    })).filter(door => door.id > 0 && door.label);
  },
  async list(filter: TrafficHistoryFilter): Promise<RecordValue[]> {
    const value = trafficResult(await trafficApi.getAllTraffics({
      PageNumber: 1, PageSize: 500,
      Filters: { StartDateTime: `${filter.startDate}T00:00:00`, EndDateTime: `${filter.endDate}T23:59:59`, DumpType: Number(filter.sourceType), ParkingId: filter.parkingId },
    }));
    const page = Array.isArray(value) ? value : record.parse(value);
    return records.parse(Array.isArray(page) ? page : page.Items ?? page.items ?? page.Values ?? page.values ?? []) as RecordValue[];
  },
  async credit(memberId: number): Promise<RecordValue | null> {
    const value = trafficResult(await trafficApi.getMemberCurrentCreditInfo(memberId));
    if (value == null) return null;
    return (Array.isArray(value) ? records.parse(value)[0] ?? null : record.parse(value)) as RecordValue | null;
  },
  async create(input: Parameters<typeof trafficApi.createManualDump>[0]) {
    trafficResult(await trafficApi.createManualDump(input));
  },
  async update(selected: RecordValue, enter: string | null, exit: string | null) {
    const source = Number(recordValue(selected, 'SourceType')) || 0;
    const nextSource = source === 4 ? 3 : [0, 1, 2].includes(source) && !recordValue(selected, 'ExitDateTime') ? 5 : source;
    trafficResult(await trafficApi.saveTraffic({
      Id: recordValue(selected, 'DumpId') ?? recordValue(selected, 'Id'), CarPlate: recordValue(selected, 'CarPlate'),
      SourceType: nextSource, EnterDateTime: enter, ExitDateTime: exit,
    }));
  },
  async remove(dumpId: number) { trafficResult(await trafficApi.deleteTraffic(dumpId)); },
};
