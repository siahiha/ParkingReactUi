import '../../i18n/instance';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MonitoringWorkspace } from './MonitoringWorkspace';
import { parkingApi } from '../../api/management';

vi.mock('../../api/management', () => ({ parkingApi: {
  getDoorsLive: vi.fn(), getMonitoringTraffics: vi.fn(),
} }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('keeps independent live failures in their section headings and clears only the recovered source', async () => {
  vi.mocked(parkingApi.getDoorsLive).mockRejectedValue(new Error('doors offline'));
  vi.mocked(parkingApi.getMonitoringTraffics).mockRejectedValueOnce(new Error('traffic offline')).mockResolvedValue({ Values: [] });
  const user = userEvent.setup();
  render(<MonitoringWorkspace title="Monitoring" parkingId={7} language="en" />);
  const doors = await screen.findByRole('img', { name: 'Loading live doors failed.' });
  expect(await screen.findByRole('img', { name: 'Loading live traffic failed.' })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('Loading live doors failed.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Refresh' }));
  await waitFor(() => expect(screen.queryByRole('img', { name: 'Loading live traffic failed.' })).not.toBeInTheDocument());
  expect(doors).toBeVisible();
  await user.hover(doors);
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Loading live doors failed.');
});
