import '../i18n/instance';
import { useState } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { HomeNavigation } from './HomeNavigation';
import { createParkingMenuGroups, visibleParkingGroups } from './homeMenuModel';
import type { HomeUser } from './homeTypes';
import i18n from '../i18n/instance';

afterEach(cleanup);

const user: HomeUser = { id: 7, userName: 'operator', currentParking: 7, canManageDashboard: false, permissions: [] };

it.each([false, true])('opens operations as an independent root without a Home menu item, collapsed=%s', async initiallyCollapsed => {
  const onNavigate = vi.fn();
  function Preview() {
    const [collapsed, setCollapsed] = useState(initiallyCollapsed);
    return <HomeNavigation appName="ناوبری آزمایش" direction="rtl" basePath="/home"
      systemMenu="مدیریت سامانه" currentParkingSectionTitle={i18n.t('home.parkingDefinitions')} reportsSectionTitle={i18n.t('home.reports')}
      visibleManagementItems={[]} visibleParkingMenuGroups={createParkingMenuGroups('fa')} activeParkingMenu="floors" canManageDashboard={false}
      collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={false} onMobileClose={vi.fn()} onNavigate={onNavigate} />;
  }
  render(<Preview />);
  const nav = within(screen.getByRole('complementary'));
  expect(nav.queryByRole('button', { name: i18n.t('home.menuHome') })).not.toBeInTheDocument();
  await userEvent.setup().click(nav.getByRole('button', { name: i18n.t('homeMenu.groups.operations') }));
  const operations = nav.getByRole('button', { name: i18n.t('homeMenu.groups.operations') });
  const definitions = nav.getByRole('button', { name: i18n.t('home.parkingDefinitions') });
  expect(operations).toHaveClass('home3-nav-root');
  expect(operations).toHaveAttribute('aria-expanded', 'true');
  expect(definitions).toHaveAttribute('aria-expanded', 'false');
  expect(operations.closest('.home3-nav-section')?.parentElement).toBe(definitions.closest('.home3-nav-section')?.parentElement);
  await userEvent.setup().click(nav.getByRole('button', { name: i18n.t('homeMenu.items.monitoring') }));
  expect(onNavigate).toHaveBeenCalledExactlyOnceWith('/home/parking/monitoring');
});

it('keeps the requested report root open when expanding a filtered compact menu', async () => {
  const onNavigate = vi.fn();
  function Preview() {
    const [collapsed, setCollapsed] = useState(true);
    const [refresh, setRefresh] = useState(0);
    // Permission filtering deliberately returns fresh arrays, as Home does on every render.
    const groups = visibleParkingGroups(user, createParkingMenuGroups('fa'), () => true, () => true);
    return <><button onClick={() => setRefresh(refresh + 1)}>refresh parent</button><HomeNavigation appName="ناوبری آزمایش" direction="rtl" basePath="/home"
      systemMenu="مدیریت سامانه" currentParkingSectionTitle="تعاریف پارکینگ" reportsSectionTitle={i18n.t('home.reports')}
      visibleManagementItems={[]} visibleParkingMenuGroups={groups} activeParkingMenu="floors" canManageDashboard={false}
      collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={false} onMobileClose={vi.fn()} onNavigate={onNavigate} /></>;
  }
  render(<Preview />);
  const events = userEvent.setup();
  const nav = within(screen.getByRole('complementary'));
  await events.click(nav.getByRole('button', { name: i18n.t('home.reports') }));
  const group = nav.getByRole('button', { name: i18n.t('homeMenu.groups.member-reports') });
  await events.click(group);
  await events.click(screen.getByRole('button', { name: 'refresh parent' }));
  expect(group).toHaveAttribute('aria-expanded', 'true');
  await events.click(nav.getByRole('button', { name: i18n.t('homeMenu.items.active-member-report') }));
  expect(onNavigate).toHaveBeenCalledExactlyOnceWith('/home/parking/active-member-report');
});
