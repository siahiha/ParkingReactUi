import '../../i18n/instance';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import type { Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import { ReportPreview } from './ReportPreview';

const { viewer, setLocalization } = vi.hoisted(() => ({ viewer: vi.fn(), setLocalization: vi.fn() }));
vi.mock('stimulsoft-reports-js-react/viewer', () => ({
  Stimulsoft: {
    Base: { Localization: { StiLocalization: { setLocalization } } },
    Viewer: { StiViewerOptions: class { appearance = {}; toolbar = {}; }, StiZoomMode: { PageWidth: -1 } },
  },
  Viewer: (props: unknown) => { viewer(props); return <div data-testid="report-engine">Rendered pages</div>; },
}));
const first = { reportName: 'first' } as unknown as Stimulsoft.Report.StiReport;
const second = { reportName: 'second' } as unknown as Stimulsoft.Report.StiReport;
const props = { title: 'گزارش اعضا', language: 'fa' as const, report: first, viewerId: 'test-report', count: 42, busy: false, resultKey: {} };
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('opens a ready report in the shared full-screen popup with a fixed toolbar configuration', () => {
  render(<ReportPreview {...props} />);
  const dialog = screen.getByRole('dialog', { name: 'پیش‌نمایش گزارش: گزارش اعضا' });
  expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
  expect(within(dialog).getByText('۴۲ رکورد')).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0]).toMatchObject({ report: first, options: {
    width: '100%', height: '100%', appearance: { scrollbarsMode: true, rightToLeft: true, fullScreenMode: false },
    toolbar: { autoHide: false, showFullScreenButton: false, showPrintButton: true, showSaveButton: true, zoom: -1 },
  } });
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

it('uses the English labels and LTR options when requested', () => {
  render(<ReportPreview {...props} title="Members" language="en" />);
  expect(screen.getByRole('dialog', { name: 'Report preview: Members' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Close report' })).toBeVisible();
  expect(viewer.mock.calls.at(-1)?.[0].options.appearance.rightToLeft).toBe(false);
});

it('changes the engine language before mounting the viewer and restores English after Persian', () => {
  const { rerender } = render(<ReportPreview {...props} />);
  expect(setLocalization.mock.calls.at(-1)?.[0]).toContain('<PrintReport>چاپ</PrintReport>');
  expect(setLocalization.mock.invocationCallOrder.at(-1)).toBeLessThan(viewer.mock.invocationCallOrder[0]);
  rerender(<ReportPreview {...props} language="en" />);
  expect(setLocalization.mock.calls.at(-1)?.[0]).toContain('<PrintReport>Print</PrintReport>');
  expect(setLocalization.mock.calls.at(-1)?.[0]).toContain('cultureName="en"');
  expect(viewer.mock.calls.at(-1)?.[0].options.appearance.rightToLeft).toBe(false);
});
