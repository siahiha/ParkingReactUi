import '../i18n/instance';
import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../theme';
import { parkingApi } from '../api/management';
import { HomeDashboard } from './HomeDashboard';
import { HomeDashboardIntro } from './HomeDashboardIntro';
import { HomeLoadingState } from './HomeLoadingState';

function renderDashboard(onNavigate = vi.fn()) {
  return { onNavigate, ...render(<ThemeProvider theme={appTheme}><HomeDashboard language="fa" selectedParkingName="پارکینگ مرکزی" selectedParkingId={7} basePath="/home" onNavigate={onNavigate} /></ThemeProvider>) };
}

describe('Home dashboard', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('loads parking information and refreshes it from the icon action', async () => {
    const getInfoById = vi.spyOn(parkingApi, 'getInfoById').mockResolvedValue({ Values: {
      TotalParkSpaces: 320,
      OccupiedParkSpaceCount: 218,
      FreeParkSpaceCount: 102,
      DoorCount: 4,
      ServerDateTime: '2026-10-30T08:30:00Z',
      DeviceProcInfo: 'دستگاه‌ها فعال هستند',
      DoorStatuses: [
        { DoorId: 11, DoorTitle: 'درب شمالی', TrafficCount: 18, LastTrafficDateTime: '2026-10-30T08:15:00Z', IsActive: true },
        { DoorId: 12, DoorTitle: 'درب جنوبی', TrafficCount: 4, LastTrafficDateTime: '2026-10-30T04:00:00Z', IsActive: false },
      ],
    } });
    renderDashboard();

    await waitFor(() => expect(screen.getByText('۳۲۰')).toBeVisible());
    expect(screen.getByText('۲۱۸')).toBeVisible();
    expect(screen.getByText('۱۰۲')).toBeVisible();
    expect(screen.getAllByText('درب شمالی').length).toBeGreaterThan(0);
    expect(screen.getAllByText('درب جنوبی').length).toBeGreaterThan(0);
    expect(screen.getAllByText('۱۸').length).toBeGreaterThan(0);
    expect(screen.getAllByText('۴').length).toBeGreaterThan(0);
    expect(getInfoById).toHaveBeenCalledWith(7, expect.any(AbortSignal));

    await userEvent.setup().click(screen.getByRole('button', { name: 'به‌روزرسانی اطلاعات' }));
    await waitFor(() => expect(getInfoById).toHaveBeenCalledTimes(2));
  });

  it('renders the management overview with its operational sections', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'پارکینگ مرکزی' })).toBeVisible();
    expect(screen.getByText('زیرساخت هوشمند تردد و پارکینگ')).toBeVisible();
    expect(screen.getByText('نقشه جایگاه‌ها')).toBeVisible();
    expect(screen.getAllByText('وضعیت درب‌ها').length).toBeGreaterThan(0);
    expect(screen.getByText('عملیات سریع')).toBeVisible();
  });

  it('reads the infrastructure label from the matching language resource', () => {
    const { rerender } = render(<ThemeProvider theme={appTheme}><HomeDashboardIntro language="fa" selectedParkingName="پارکینگ مرکزی" /></ThemeProvider>);
    expect(screen.getByText('زیرساخت هوشمند تردد و پارکینگ')).toBeVisible();

    rerender(<ThemeProvider theme={appTheme}><HomeDashboardIntro language="en" selectedParkingName="Central Parking" /></ThemeProvider>);
    expect(screen.getByText('Smart Traffic and Parking Infrastructure')).toBeVisible();
  });

  it('updates the selected parking bay and navigates from a quick action', async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDashboard();

    await user.click(screen.getByRole('button', { name: 'جایگاه انتخابی: B4' }));
    expect(screen.getByRole('button', { name: 'جایگاه انتخابی: B4' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('B4').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'مدیریت اعضا' }));
    expect(onNavigate).toHaveBeenCalledWith('/home/parking/members');
  });
});

describe('Home loading state', () => {
  afterEach(() => cleanup());

  it('exposes a translated status and skeleton structure', () => {
    const { container } = render(<ThemeProvider theme={appTheme}><HomeLoadingState /></ThemeProvider>);

    expect(screen.getByRole('status', { name: 'در حال بارگذاری...' })).toBeVisible();
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(10);
  });
});


