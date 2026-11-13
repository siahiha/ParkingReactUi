import '../../i18n/instance';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnprMonitoringWorkspace } from './AnprMonitoringWorkspace';
import { anprApi, parkingApi } from '../../api/management';

const live = vi.hoisted(() => ({ error: (_cause: unknown) => {}, connected: () => {} }));
vi.mock('../../api/anprRealtime', () => ({
  AnprRealtimeConnection: class {
    start(_source: boolean, _record: unknown, error: (cause: unknown) => void, connected: () => void) {
      live.error = error; live.connected = connected; return Promise.resolve();
    }
    stop() {}
  },
}));

vi.mock('../../api/management', async () => {
  const actual = await vi.importActual<typeof import('../../api/management')>('../../api/management');
  return {
    ...actual,
    anprApi: {
      ...actual.anprApi,
      listRecent: vi.fn(),
      getPictureById: vi.fn(),
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
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mockedParkingApi.getDoors.mockResolvedValue({ Values: [{ Id: 7, Title: 'Gate 7' }] });
    mockedParkingApi.getDoor.mockResolvedValue({ Values: { DtoViewEquipments: [] } });
    mockedParkingApi.getDoorDevices.mockResolvedValue({ Values: [] });
    mockedParkingApi.getEquipments.mockResolvedValue({ Values: [] });
    mockedAnprApi.listMemberPlates.mockResolvedValue({ Values: [{ Plate: '12الف345' }] });
    mockedAnprApi.listRecent.mockResolvedValue({ Values: [{ Id: 10, Plate: '12الف345', InsertTime: '2026-09-25T10:00:00Z' }] });
    mockedAnprApi.getPictureById.mockResolvedValue({ Values: { Id: 10, CarPic: [], PlatePic: [] } });
  });

  it('keeps live connection errors in the heading and does not erase a separate load error on reconnect', async () => {
    mockedAnprApi.listRecent.mockRejectedValueOnce(new Error('snapshot failed'));
    const user = userEvent.setup();
    render(<AnprMonitoringWorkspace title="ANPR monitoring" parkingId={1} language="en" />);
    const loadError = await screen.findByRole('alert');
    expect(loadError).toHaveTextContent('ANPR records could not be loaded.');
    act(() => live.error(new Error('disconnected')));
    const indicator = screen.getByRole('img', { name: 'Live ANPR connection failed.' });
    expect(screen.queryByText('Live ANPR connection failed.')).not.toBeInTheDocument();
    await user.hover(indicator);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Live ANPR connection failed.');
    act(() => live.connected());
    expect(screen.queryByRole('img', { name: 'Live ANPR connection failed.' })).not.toBeInTheDocument();
    expect(loadError).toHaveTextContent('ANPR records could not be loaded.');
  });

  it('loads the recent record grid and member status workflow', async () => {
    render(<AnprMonitoringWorkspace title="ANPR monitoring" parkingId={1} language="en" />);

    expect(screen.getByText('ANPR monitoring')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('12الف345')).toBeInTheDocument());
    expect(mockedAnprApi.listRecent).toHaveBeenCalled();
    expect(mockedAnprApi.getPictureById).toHaveBeenCalledWith('10', false);
  });

  it('keeps a detection visible when its optional picture row is absent', async () => {
    mockedAnprApi.getPictureById.mockResolvedValue({ Values: { Id: 10, Plate: '12الف345', CarPic: null, PlatePic: null } });
    const user = userEvent.setup();
    render(<AnprMonitoringWorkspace title="ANPR monitoring" parkingId={1} language="en" />);
    await screen.findByText('12الف345');
    await user.click(screen.getAllByRole('combobox')[0]);
    await user.click(await screen.findByRole('option', { name: 'Elmo Sanat' }));
    await waitFor(() => expect(mockedAnprApi.getPictureById).toHaveBeenCalledWith('10', true));
    await waitFor(() => expect(screen.getAllByText('Image unavailable')).toHaveLength(2));
    expect(screen.getByText('12الف345')).toBeInTheDocument();
    expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
