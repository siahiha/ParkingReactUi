import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnprMonitoringWorkspace } from './AnprMonitoringWorkspace';
import { anprApi, parkingApi } from '../../api/management';

vi.mock('../../api/management', async () => {
  const actual = await vi.importActual<typeof import('../../api/management')>('../../api/management');
  return {
    ...actual,
    anprApi: {
      ...actual.anprApi,
      listRecent: vi.fn(),
      getPictureById: vi.fn(),
      getLastId: vi.fn(),
      deleteOldPictures: vi.fn(),
      listMemberPlates: vi.fn(),
    },
    parkingApi: {
      ...actual.parkingApi,
      getDoors: vi.fn(),
      getDoor: vi.fn(),
      getDoorDevices: vi.fn(),
      getEquipments: vi.fn(),
    },
  };
});

const mockedAnprApi = vi.mocked(anprApi);
const mockedParkingApi = vi.mocked(parkingApi);

describe('AnprMonitoringWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedParkingApi.getDoors.mockResolvedValue({ Values: [{ Id: 7, Title: 'Gate 7' }] });
    mockedParkingApi.getDoor.mockResolvedValue({ Values: { DtoViewEquipments: [] } });
    mockedParkingApi.getDoorDevices.mockResolvedValue({ Values: [] });
    mockedParkingApi.getEquipments.mockResolvedValue({ Values: [] });
    mockedAnprApi.listMemberPlates.mockResolvedValue({ Values: [{ Plate: '12الف345' }] });
    mockedAnprApi.getLastId.mockResolvedValue({ Values: 10 });
    mockedAnprApi.listRecent.mockResolvedValue({ Values: [{ Id: 10, Plate: '12الف345', InsertTime: '2026-09-25T10:00:00Z' }] });
    mockedAnprApi.getPictureById.mockResolvedValue({ Values: { Id: 10, CarPic: [], PlatePic: [] } });
  });

  it('loads the recent record grid and member status workflow', async () => {
    render(<AnprMonitoringWorkspace title="ANPR monitoring" parkingId={1} language="en" />);

    expect(screen.getByText('ANPR monitoring')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('12الف345')).toBeInTheDocument());
    expect(mockedAnprApi.getLastId).toHaveBeenCalled();
    expect(mockedAnprApi.listRecent).toHaveBeenCalled();
    expect(mockedAnprApi.getPictureById).toHaveBeenCalledWith('10', false);
  });

  it('shows a camera API error when only part of the door lookup fails', async () => {
    mockedParkingApi.getDoor.mockRejectedValueOnce(new Error('door lookup failed'));
    const user = userEvent.setup();
    render(<AnprMonitoringWorkspace title="ANPR monitoring" parkingId={1} language="en" />);

    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(1));
    const doorSelect = screen.getAllByRole('combobox')[1];
    await user.click(doorSelect);
    await user.click(await screen.findByRole('option', { name: 'Gate 7' }));

    await waitFor(() => expect(screen.getByText(/could not be loaded completely from the API/)).toBeInTheDocument());
  });

});
