import '../../i18n/instance';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import type { PreparedReport } from './preparedReportApi';
import { ReportPreview } from './ReportPreview';

const { viewer } = vi.hoisted(() => ({ viewer: vi.fn() }));
vi.mock('./PreparedReportViewer', () => ({
  PreparedReportViewer: (props: unknown) => { viewer(props); return <div data-testid="report-engine">Rendered pages</div>; },
}));
const first: PreparedReport = { Id: 'first', Count: 42, PageCount: 2, ExpiresAt: '2099-01-01T00:00:00Z' };
const second: PreparedReport = { ...first, Id: 'second' };
const props = { title: 'گزارش اعضا', language: 'fa' as const, report: first, viewerId: 'test-report', count: 42, busy: false, resultKey: {} };
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('opens a ready report in the shared full-screen popup with the prepared server result', () => {
  render(<ReportPreview {...props} />);
  const dialog = screen.getByRole('dialog', { name: 'پیش‌نمایش گزارش: گزارش اعضا' });
  expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
  expect(within(dialog).getByText('۴۲ رکورد')).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0]).toMatchObject({ report: first, language: 'fa' });
});

it('closes and reopens the same report without replacing it, and opens a new result automatically', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<ReportPreview {...props} />);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'بستن گزارش' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  rerender(<ReportPreview {...props} count={42} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'نمایش دوباره گزارش' }));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0]).toMatchObject({ report: first });
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  rerender(<ReportPreview {...props} report={second} count={42} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  rerender(<ReportPreview {...props} report={second} resultKey={{}} count={0} />);
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(within(screen.getByRole('dialog')).getByText('۰ رکورد')).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0]).toMatchObject({ report: second });
});

it('does not open a popup for absent, loading or failed report results', () => {
  const { rerender } = render(<ReportPreview {...props} report={null} busy />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(viewer).not.toHaveBeenCalled();
  rerender(<ReportPreview {...props} report={null} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('uses the English labels for the viewer when requested', () => {
  render(<ReportPreview {...props} title="Members" language="en" />);
  expect(screen.getByRole('dialog', { name: 'Report preview: Members' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Close report' })).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0].language).toBe('en');
});
