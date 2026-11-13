import { beforeEach, expect, it, vi } from 'vitest';
import { parkingApi, trafficApi } from '../../api/management';
import { trafficRecordsService } from './trafficRecordsService';

vi.mock('../../api/management', () => ({ parkingApi: { getDoors: vi.fn() }, trafficApi: { getAllTraffics: vi.fn(), saveTraffic: vi.fn(), deleteTraffic: vi.fn(), getMemberCurrentCreditInfo: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());
it('keeps the existing history filter and unwraps a paged response', async () => {
  vi.mocked(trafficApi.getAllTraffics).mockResolvedValue({ ResponseResultType: 1, Values: { Items: [{ DumpId: 42, CommonCost: 3000 }] } });
  expect(await trafficRecordsService.list({ parkingId: 7, startDate: '2026-11-01', endDate: '2026-11-12', sourceType: '0' })).toEqual([{ DumpId: 42, CommonCost: 3000 }]);
  expect(trafficApi.getAllTraffics).toHaveBeenCalledWith({ PageNumber: 1, PageSize: 500, Filters: { ParkingId: 7, StartDateTime: '2026-11-01T00:00:00', EndDateTime: '2026-11-12T23:59:59', DumpType: 0 } });
});
it.each([[4, 3], [1, 5], [3, 3]])('preserves the edit source mapping %s to %s', async (source, expected) => {
  vi.mocked(trafficApi.saveTraffic).mockResolvedValue({ ResponseResultType: 1 });
  await trafficRecordsService.update({ DumpId: 42, CarPlate: '12ب34567', SourceType: source, ExitDateTime: null }, '2026-11-01 08:00:00', '2026-11-01 10:00:00');
  expect(trafficApi.saveTraffic).toHaveBeenCalledWith({ Id: 42, CarPlate: '12ب34567', SourceType: expected, EnterDateTime: '2026-11-01 08:00:00', ExitDateTime: '2026-11-01 10:00:00' });
});
it('does not treat HTTP-success business errors as a successful deletion or empty door list', async () => {
  vi.mocked(trafficApi.deleteTraffic).mockResolvedValue({ ResponseResultType: 7, Values: false });
  await expect(trafficRecordsService.remove(42)).rejects.toThrow();
  vi.mocked(parkingApi.getDoors).mockResolvedValue({ ResponseResultType: 7 });
  await expect(trafficRecordsService.doors(7)).rejects.toThrow();
});
