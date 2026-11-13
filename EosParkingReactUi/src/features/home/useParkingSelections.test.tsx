import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { parkingApi } from '../../api/management';
import { useParkingSelections } from './useParkingSelections';
import { parkingSettingsChangedEvent } from './parkingSelectionService';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const envelope = (commercial: boolean) => ({ ResponseResultType: 1, Values: [
  { Id: 7, ParkingName: 'First', IsCommercialParking: commercial },
  { Id: 9, ParkingName: 'Second', IsCommercialParking: false },
] });
it('refreshes checkout settings on return while preserving the selected parking', async () => {
  const list = vi.spyOn(parkingApi, 'list').mockResolvedValue(envelope(false));
  const { result, rerender } = renderHook(({ scope }) => useParkingSelections(7, 'fa', scope), { initialProps: { scope: '' } });
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.setSelectedParkingId(9));
  list.mockResolvedValue(envelope(true));
  rerender({ scope: 'manual-traffic' });
  await waitFor(() => expect(result.current.options[0].isCommercialParking).toBe(true));
  expect(result.current.selectedParkingId).toBe(9);
  expect(result.current.failed).toBe(false);
});
it('ignores an old settings response after a new route request has completed', async () => {
  let release!: (value: unknown) => void;
  vi.spyOn(parkingApi, 'list').mockImplementationOnce(() => new Promise(resolve => { release = resolve; })).mockResolvedValue(envelope(true));
  const { result, rerender } = renderHook(({ scope }) => useParkingSelections(7, 'fa', scope), { initialProps: { scope: '' } });
  rerender({ scope: 'manual-traffic' });
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => release(envelope(false)));
  expect(result.current.options[0].isCommercialParking).toBe(true);
});
it('refreshes the shift setting immediately after parking settings are saved', async () => {
  const list = vi.spyOn(parkingApi, 'list').mockResolvedValue({ ResponseResultType: 1, Values: [{ Id: 7, ParkingName: 'First', HasUserShifts: true }] });
  const { result } = renderHook(() => useParkingSelections(7, 'fa', 'parking-details'));
  await waitFor(() => expect(result.current.options[0]?.hasUserShifts).toBe(true));
  list.mockResolvedValue({ ResponseResultType: 1, Values: [{ Id: 7, ParkingName: 'First', HasUserShifts: false }] });
  act(() => window.dispatchEvent(new Event(parkingSettingsChangedEvent)));
  await waitFor(() => expect(result.current.options[0]?.hasUserShifts).toBe(false));
  expect(result.current.selectedParkingId).toBe(7);
});
