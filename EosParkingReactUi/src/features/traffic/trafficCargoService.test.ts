import { beforeEach, expect, it, vi } from 'vitest';
import { cargoApi } from '../../api/management';
import { trafficCargoService, type CargoOptions, type CargoFormState } from './trafficCargoService';

vi.mock('../../api/management', () => ({ cargoApi: { getRequiredData: vi.fn(), isRegistered: vi.fn(), save: vi.fn() } }));
const api = vi.mocked(cargoApi);
const data: CargoOptions = { drivers: [{ Id: 1, FirstName: 'Driver' }], merchandises: [{ Id: 2 }], companies: [{ SectionId: 3 }, { SectionId: 4 }] };
const form: CargoFormState = { driverId: '1', merchandiseId: '2', originId: '3', destinationId: '4', weight: '120', count: '2', reason: 'Delivery', description: '' };
beforeEach(() => {
  vi.resetAllMocks();
  api.isRegistered.mockResolvedValue({ ResponseResultType: 1, Values: false });
  api.save.mockResolvedValue({ ResponseResultType: 1, Values: 9 });
});
it('saves the existing cargo contract only after checking the traffic and direction', async () => {
  await trafficCargoService.save({ DumpId: 42, CarPlate: '12ب34567' }, true, form, data);
  expect(api.isRegistered).toHaveBeenCalledWith(42, true);
  expect(api.save).toHaveBeenCalledWith({
    CargoIOsId: 0, IsOutBoundCargo: true, TrafficDumpId: 42, Plate: '12ب34567', cargoDrivers: data.drivers[0], CargoMerchandises: data.merchandises[0],
    companyDetailsList: [{ SectionId: 3, IsOriginSection: true, IsDestinationSection: false }, { SectionId: 4, IsOriginSection: false, IsDestinationSection: true }],
    Weight: 120, Count: 2, Resason: 'Delivery', Description: '',
  });
});
it('rejects equal origin and destination before making a request', async () => {
  await expect(trafficCargoService.save({ DumpId: 42 }, false, { ...form, destinationId: '3' }, data)).rejects.toMatchObject({ key: 'required' });
  expect(api.isRegistered).not.toHaveBeenCalled();
});
it('does not save an already registered cargo', async () => {
  api.isRegistered.mockResolvedValue({ ResponseResultType: 1, Values: true });
  await expect(trafficCargoService.save({ DumpId: 42 }, false, form, data)).rejects.toMatchObject({ key: 'alreadyRegistered' });
  expect(api.save).not.toHaveBeenCalled();
});
it('does not treat a failed duplicate check or save as success', async () => {
  api.isRegistered.mockResolvedValueOnce({ ResponseResultType: 7, Values: false });
  await expect(trafficCargoService.save({ DumpId: 42 }, false, form, data)).rejects.toThrow();
  expect(api.save).not.toHaveBeenCalled();
  api.save.mockResolvedValue({ ResponseResultType: 7, Message: 'Rejected' });
  await expect(trafficCargoService.save({ DumpId: 42 }, false, form, data)).rejects.toThrow();
});
it('validates and maps the cargo lookup response', async () => {
  api.getRequiredData.mockResolvedValue({ ResponseResultType: 1, Values: { Drivers: data.drivers, Merchandises: data.merchandises, companyDetails: data.companies } });
  expect(await trafficCargoService.load()).toEqual(data);
  api.getRequiredData.mockResolvedValue({ ResponseResultType: 1, Values: { Drivers: 'invalid' } });
  await expect(trafficCargoService.load()).rejects.toThrow();
});
