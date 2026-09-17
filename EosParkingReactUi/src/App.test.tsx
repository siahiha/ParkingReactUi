import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { appTheme } from './theme';

function renderApp() {
  return render(
    <ThemeProvider theme={appTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>,
  );
}

describe('login', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); window.sessionStorage.clear(); window.history.replaceState({}, '', '/'); });

  it('restores the token before loading an authenticated route after refresh', async () => {
    const token = 'restored-token';
    window.history.replaceState({}, '', '/home/management/access');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      token,
      user: { id: 7, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 1 },
    }));
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const requestToken = new Headers(init?.headers).get('UserToken');
      if (requestToken !== token) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
      return new Response(JSON.stringify({ Values: [] }), { status: 200, headers: { 'content-type': 'application/json' } });
    });

    renderApp();

    expect(await screen.findByRole('heading', { name: 'سطوح دسترسی' })).toBeVisible();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('دریافت سطوح دسترسی از API ناموفق بود.')).not.toBeInTheDocument();
  });

  it('shows field errors and does not call the API for empty credentials', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('نام کاربری را وارد کنید.')).toBeVisible();
    expect(screen.getByText('رمز عبور را وارد کنید.')).toBeVisible();
  });

  it('accepts the Windows login response shape with ResponseResultType=1', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1, Permissions: ['legacy.permission'] },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));

    expect(await screen.findByText('خانه')).toBeVisible();
    expect(screen.getByText('مدیریت سامانه')).toBeVisible();
  });

  it('renders a parking workspace after clicking a parking menu item', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));
    await user.click(await screen.findByRole('button', { name: 'تعاریف و تنظیمات پارکینگ جاری' }));
    await user.click(screen.getByRole('button', { name: 'تجهیزات' }));

    expect(window.location.pathname).toBe('/home/parking/equipment');
    expect(
      await screen.findByText('تجهیزات', { selector: '.workspace-resource-heading h6' }),
    ).toBeVisible();
  });

  it('renders the parking directory after clicking the management menu item', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));
    await user.click(await screen.findByRole('button', { name: 'پارکینگ‌ها' }));

    expect(window.location.pathname).toBe('/home/management/list');
    expect(await screen.findByRole('heading', { name: 'پارکینگ‌ها' })).toBeVisible();
  });
});
