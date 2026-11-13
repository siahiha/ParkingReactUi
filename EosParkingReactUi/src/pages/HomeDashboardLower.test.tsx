import '../i18n/instance';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { HomeDashboardLower } from './HomeDashboardLower';

afterEach(cleanup);

it.each([
  ['کنترل ورود و خروج', '/parking/manual-traffic'],
  ['مدیریت اعضا', '/parking/members'],
  ['باز کردن مانیتورینگ', '/parking/monitoring'],
  ['گزارش‌های عملیاتی', '/parking/traffic-reports-list'],
])('quick action %s opens its existing destination by keyboard', async (label, route) => {
  const onNavigate = vi.fn();
  render(<HomeDashboardLower onNavigate={onNavigate} />);
  expect(screen.getByRole('region', { name: 'عملیات سریع' })).toBeVisible();
  screen.getByRole('button', { name: label }).focus();
  await userEvent.setup().keyboard('{Enter}');
  expect(onNavigate).toHaveBeenCalledExactlyOnceWith(route);
});
