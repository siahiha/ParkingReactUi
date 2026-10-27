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

  it('restores the non-sensitive user shell while the cookie authenticates API calls after refresh', async () => {
    window.history.replaceState({}, '', '/home/management/access');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      user: { id: 7, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 1 },
    }));
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ Values: [] }), { status: 200, headers: { 'content-type': 'application/json' } }));

    renderApp();

    expect(await screen.findByRole('heading', { name: 'سطوح دسترسی' }, { timeout: 5000 })).toBeVisible();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.credentials).toBe('include');
      expect(new Headers(init?.headers).get('UserToken')).toBeNull();
    }
  });

  it('keeps an authenticated user in Home and opens the denied route tab', async () => {
    window.history.replaceState({}, '', '/home/management/users');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      token: 'operator-token',
      user: { id: 9, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 2 },
    }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ Values: [] }), { status: 200, headers: { 'content-type': 'application/json' } }));

    renderApp();

    expect(await screen.findByRole('heading', { name: 'دسترسی به این بخش مجاز نیست' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'کاربران و دسترسی' })).toBeVisible();
    expect(window.location.pathname).toBe('/home/management/users');
    expect(screen.queryByLabelText('نام کاربری')).not.toBeInTheDocument();
  });

  it('clears the local session and redirects to login after an HTTP 401', async () => {
    window.history.replaceState({}, '', '/home/management/access');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      user: { id: 7, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 1 },
    }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));

    renderApp();

    expect(await screen.findByTestId('login2-submit')).toBeVisible();
    expect(window.location.pathname).toBe('/');
    expect(window.sessionStorage.getItem('eos-parking-auth-session')).toBeNull();
  });

  it('clears the local session and redirects to login for ResponseResultType=11', async () => {
    window.history.replaceState({}, '', '/home/management/access');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      user: { id: 7, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 1 },
    }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 11 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    renderApp();

    expect(await screen.findByTestId('login2-submit')).toBeVisible();
    expect(window.location.pathname).toBe('/');
    expect(window.sessionStorage.getItem('eos-parking-auth-session')).toBeNull();
  });

  it('keeps Home mounted for an unknown route without navigating away', async () => {
    window.history.replaceState({}, '', '/not-a-real-route');
    window.sessionStorage.setItem('eos-parking-auth-session', JSON.stringify({
      token: 'operator-token',
      user: { id: 9, userName: 'operator', currentParking: 1, permissions: [], legacyAccessLevelId: 1, canManageDashboard: true },
    }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ Values: [] }), { status: 200, headers: { 'content-type': 'application/json' } }));

    renderApp();

    expect(window.location.pathname).toBe('/not-a-real-route');
    expect(await screen.findByText(/این مسیر وجود ندارد/)).toBeVisible();
    expect(screen.getByRole('tab', { name: 'خانه' })).toBeVisible();
    expect(window.location.pathname).toBe('/not-a-real-route');
    expect(screen.queryByLabelText('نام کاربری')).not.toBeInTheDocument();
  });

  it('shows field errors and does not call the API for empty credentials', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('login2-submit'));

    expect(screen.getByText('نام کاربری را وارد کنید.')).toBeVisible();
    expect(screen.getByText('رمز عبور را وارد کنید.')).toBeVisible();
  });

  it('serves the primary login route and navigates to Home after a valid login', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));

    renderApp();

    expect(screen.getByTestId('login2-username-input')).toBeVisible();
    await user.type(screen.getByTestId('login2-username-input'), 'operator');
    await user.type(screen.getByTestId('login2-password-input'), 'secret');
    await user.click(screen.getByTestId('login2-submit'));

    expect(await screen.findByText('خانه')).toBeVisible();
    expect(window.location.pathname).toBe('/home');
  });

  it('accepts the Windows login response shape with ResponseResultType=1', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/login2');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1, Permissions: ['legacy.permission'] },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));

    expect(await screen.findByText('خانه')).toBeVisible();
    expect(screen.queryByText('اطلاعات و عملیات پارکینگ انتخاب‌شده در این صفحه نمایش داده می‌شود.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'مدیریت سامانه' }));
    expect(screen.getByText('مدیریت سامانه')).toBeVisible();
  });

  it('renders a parking workspace after clicking a parking menu item', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/login2');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));
    await user.click(await screen.findByRole('button', { name: 'تعاریف و تنظیمات پارکینگ' }));
    await user.click(screen.getByRole('button', { name: 'تجهیزات' }));

    expect(window.location.pathname).toBe('/home/parking/equipment');
    expect(
      await screen.findByText('تجهیزات', { selector: '.workspace-resource-heading h6' }),
    ).toBeVisible();
  });

  it('renders the parking directory after clicking the management menu item', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', '/login2');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      ResponseResultType: 1,
      Values: { Id: 7, UserName: 'operator', CurrentParking: 1, UserToken: 'token-1', UserAccessLevelId: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    renderApp();

    await user.type(screen.getByTestId('login-username-input'), 'operator');
    await user.type(screen.getByTestId('login-password-input'), 'secret');
    await user.click(screen.getByTestId('login-submit'));
    await user.click(await screen.findByRole('button', { name: 'مدیریت سامانه' }));
    await user.click(await screen.findByRole('button', { name: 'پارکینگ‌ها' }));

    expect(window.location.pathname).toBe('/home/management/list');
    expect(await screen.findByRole('heading', { name: 'پارکینگ‌ها' })).toBeVisible();
  });
});
