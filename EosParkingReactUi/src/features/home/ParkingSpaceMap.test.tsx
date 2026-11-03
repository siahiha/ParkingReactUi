import '../../i18n/instance';
import { ThemeProvider } from '@mui/material';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import { ParkingSpaceMap } from './ParkingSpaceMap';
import { parkingMapFixture } from './parkingMapFixtures.test-support';
import type { ParkingMapPage, ParkingMapQuery, ParkingMapStatus } from './parkingMapService';

const boundary = vi.hoisted(() => ({ connections: [] as { query: ParkingMapQuery; page: (value: ParkingMapPage) => void; status: (value: ParkingMapStatus) => void; stop: ReturnType<typeof vi.fn> }[] }));
vi.mock('../../api/parkingMapRealtime', () => ({
  ParkingMapRealtimeConnection: class {
    stop = vi.fn();
    constructor(query: ParkingMapQuery, page: (value: ParkingMapPage) => void, status: (value: ParkingMapStatus) => void) { boundary.connections.push({ query, page, status, stop: this.stop }); }
    start() { return Promise.resolve(); }
  },
}));

function renderMap() { return render(<ThemeProvider theme={appTheme}><ParkingSpaceMap parkingId={7} language="fa" /></ThemeProvider>); }
function deliver(page = parkingMapFixture()) { act(() => boundary.connections.at(-1)!.page(page)); }

describe('paged parking-space map', () => {
  beforeEach(() => { boundary.connections.length = 0; });
  afterEach(() => cleanup());

  it('groups by zone, shows assignment details and contains no gate labels', async () => {
    renderMap(); deliver();
    expect(screen.getByText('زون الف')).toBeVisible();
    const tile = screen.getByRole('button', { name: 'جایگاه B4، همکف، تخصیص‌یافته' });
    await userEvent.click(tile);
    expect(tile).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('وضعیت اشغال: نامشخص')).toBeVisible();
    expect(screen.queryByText('درب شمالی')).not.toBeInTheDocument();
  });

  it('requests the next server page and ignores stale callbacks after changing parking', async () => {
    const view = renderMap(); deliver();
    const old = boundary.connections[0];
    await userEvent.click(screen.getByRole('button', { name: 'صفحه بعد' }));
    expect(boundary.connections.at(-1)?.query).toMatchObject({ page: 2, pageSize: 20 });
    expect(old.stop).toHaveBeenCalled();
    act(() => old.page(parkingMapFixture()));
    expect(screen.queryByText('B4')).not.toBeInTheDocument();
    view.rerender(<ThemeProvider theme={appTheme}><ParkingSpaceMap parkingId={8} language="fa" /></ThemeProvider>);
    expect(boundary.connections.at(-1)?.query).toMatchObject({ parkingId: 8, page: 1, sectionId: null });
  });

  it('filters the server subscription by zone and resets the page', async () => {
    renderMap(); deliver();
    await userEvent.click(screen.getByRole('combobox', { name: 'زون' }));
    await userEvent.click(screen.getByRole('option', { name: 'زون الف · ۲۰' }));
    await waitFor(() => expect(boundary.connections.at(-1)?.query).toMatchObject({ sectionId: 10, page: 1 }));
  });

  it('shows all paged spaces without a zone selector when there are no zones', () => {
    renderMap();
    const fixture = parkingMapFixture();
    deliver({ ...fixture, sections: [], unsectionedCount: 21, items: [{ ...fixture.items[0], sectionId: null, sectionTitle: null }] });
    expect(screen.queryByRole('combobox', { name: 'زون' })).not.toBeInTheDocument();
    expect(screen.getByText('B4')).toBeVisible();
    expect(screen.getByText('۱–۲۰ از ۲۱')).toBeVisible();
  });

  it('changes the server page size without loading every space', async () => {
    renderMap(); deliver();
    await userEvent.click(screen.getByRole('combobox', { name: 'در هر صفحه' }));
    await userEvent.click(screen.getByRole('option', { name: '۳۰' }));
    expect(boundary.connections.at(-1)?.query).toMatchObject({ pageSize: 30, page: 1 });
    expect(screen.queryByText('B4')).not.toBeInTheDocument();
  });

  it('keeps data marked stale on disconnect and clears it on access revocation', () => {
    renderMap(); deliver();
    act(() => boundary.connections.at(-1)!.status('reconnecting'));
    expect(screen.getByText('B4')).toBeVisible();
    expect(screen.getByText('اطلاعات نمایش‌داده‌شده ممکن است به‌روز نباشد.')).toBeVisible();
    act(() => boundary.connections.at(-1)!.status('forbidden'));
    expect(screen.queryByText('B4')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('دسترسی به جایگاه‌های این پارکینگ مجاز نیست.');
  });

  it('renders an empty snapshot and releases the connection on unmount', () => {
    const view = renderMap();
    deliver(parkingMapFixture({ items: [], sections: [], totalCount: 0, totalPages: 0, unsectionedCount: 0 }));
    expect(screen.getByText('جایگاهی برای نمایش وجود ندارد.')).toBeVisible();
    expect(screen.getByRole('img', { name: 'نمای شماتیک جایگاه‌ها' })).toBeVisible();
    expect(view.container.querySelectorAll('.home3-schematic-bay')).toHaveLength(20);
    expect(view.container.querySelectorAll('.home3-space-tile')).toHaveLength(0);
    deliver();
    expect(screen.queryByRole('img', { name: 'نمای شماتیک جایگاه‌ها' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'جایگاه B4، همکف، تخصیص‌یافته' })).toBeVisible();
    view.unmount();
    expect(boundary.connections.at(-1)?.stop).toHaveBeenCalled();
  });
});
