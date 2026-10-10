import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import type { Language } from '../i18n';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeShapeSettings } from '../theme';
import { HomeDashboard } from './HomeDashboard';
import { HomeFormRoutes } from './HomeFormRoutes';
import { HomeHeader, type NavigationMode } from './HomeHeader';
import { HomeSidebar } from './HomeSidebar';
import { homeCopy, navigationModeCopy } from './homeCopy';
import { createManagementItems, createParkingMenuGroups, visibleManagementItems as filterManagementItems, visibleParkingGroups, type ManagementSection } from './homeMenuModel';
import type { HomeUser, ThemeMode } from './homeTypes';
import { parkingApi } from '../api/management';
import { asRows, recordValue } from '../components/management/managementTypes';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';
import { useNavigationGuard } from './NavigationGuardContext';
import { HomeTabs, type HomeTab } from './HomeTabs';

export type { HomeUser } from './homeTypes';
export type { HomeLabels } from './homeCopy';

type HomeProps = { language: Language; user: HomeUser; themeMode: ThemeMode; lightPalette: PaletteName; darkPalette: PaletteName; shapeSettings: ThemeShapeSettings; onShapeSettingsChange: (settings: ThemeShapeSettings) => void; onThemeToggle: () => void; onLightPaletteChange: (palette: PaletteName) => void; onDarkPaletteChange: (palette: PaletteName) => void; onLogout: () => void; onToggleLanguage: () => void };
const navigationModeStorageKey = 'eos-parking-navigation-mode';
type ParkingOption = { id: number; name: string };

function hasBit(value: string | number | undefined, bit: bigint) {
  try { return (BigInt(String(value ?? 0)) & bit) === bit; } catch { return false; }
}

export function Home({ language, user, themeMode, lightPalette, darkPalette, shapeSettings, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage }: HomeProps) {
  const t = homeCopy[language];
  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const location = useLocation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const guardedNavigate = (path: string, options?: NavigateOptions) => requestNavigation(() => navigate(path, options));
  const managementRoute = location.pathname.match(/^\/home\/management\/([^/]+)/)?.[1];
  const activeParkingMenu = location.pathname.match(/^\/home\/parking\/([^/]+)/)?.[1] ?? null;
  const managementSection = managementRoute as ManagementSection | undefined;
  const showManagement = Boolean(managementSection);
  const [parkingOptions, setParkingOptions] = useState<ParkingOption[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState(user.currentParking);
  const [parkingLoadError, setParkingLoadError] = useState('');
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const storedValue = window.localStorage.getItem('eos-parking-sidebar-collapsed');
    return storedValue === null ? true : storedValue === 'true';
  });
  const hasPart1 = (bit: bigint, normalizedName?: string) => Boolean(normalizedName && user.permissions.includes(normalizedName)) || hasBit(user.permissionPart1, bit);
  const hasPart2 = (bit: bigint) => hasBit(user.permissionPart2, bit);
  const managementItems = createManagementItems(t);
  const visibleManagement = filterManagementItems(user, managementItems, hasPart1, hasPart2);
  const menuGroups = createParkingMenuGroups(language);
  const visibleParking = visibleParkingGroups(user, menuGroups, hasPart1, hasPart2);
  const activeParkingMenuItem = visibleParking.flatMap((group) => group.items).find((item) => item.key === activeParkingMenu);
  const hasSidebar = user.canManageDashboard || visibleManagement.length > 0 || visibleParking.length > 0;
  const firstVisibleParkingItem = visibleParking.flatMap((group) => group.items)[0];
  const selectedParking = parkingOptions.find((parking) => parking.id === selectedParkingId);
  const [openTabs, setOpenTabs] = useState<HomeTab[]>([{ path: '/home', label: t.home }]);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>(() => window.localStorage.getItem(navigationModeStorageKey) === 'classic' ? 'classic' : 'tabs');
  const labelForPath = (path: string) => {
    if (path === '/home') return t.home;
    const managementItem = visibleManagement.find((item) => path === `/home/management/${item.key}`);
    if (managementItem) return managementItem.label;
    const parkingItem = visibleParking.flatMap((group) => group.items).find((item) => path === `/home/parking/${item.key}`);
    return parkingItem?.label ?? t.home;
  };
  const openNavigationTab = (path: string) => {
    if (navigationMode === 'tabs') setOpenTabs((current) => current.some((tab) => tab.path === path) ? current : [...current, { path, label: labelForPath(path) }]);
    guardedNavigate(path);
  };
  const closeNavigationTab = (path: string) => {
    const index = openTabs.findIndex((tab) => tab.path === path);
    if (index < 0 || path === '/home') return;
    const remaining = openTabs.filter((tab) => tab.path !== path);
    setOpenTabs(remaining);
    if (location.pathname === path) guardedNavigate(remaining[Math.max(0, index - 1)]?.path ?? '/home');
  };

  useEffect(() => {
    if (navigationMode === 'tabs' && location.pathname.startsWith('/home')) {
      setOpenTabs((current) => current.some((tab) => tab.path === location.pathname) ? current : [...current, { path: location.pathname, label: labelForPath(location.pathname) }]);
    }
  }, [location.pathname, navigationMode]);
  useEffect(() => { window.localStorage.setItem(navigationModeStorageKey, navigationMode); }, [navigationMode]);

  useEffect(() => {
    let isCurrent = true;
    setParkingLoadError('');
    void parkingApi.list().then((response) => {
      if (!isCurrent) return;
      const options = asRows(response).flatMap((row) => {
        const id = Number(recordValue(row, 'Id'));
        const name = String(recordValue(row, 'ParkingName') ?? '').trim();
        return Number.isSafeInteger(id) && id > 0 && name ? [{ id, name }] : [];
      });
      setParkingOptions(options);
      setSelectedParkingId((current) => options.some((parking) => parking.id === user.currentParking)
        ? user.currentParking
        : options.some((parking) => parking.id === current)
          ? current
          : options[0]?.id ?? 0);
    }).catch(() => {
      if (!isCurrent) return;
      setParkingOptions([]);
      setParkingLoadError(language === 'fa' ? 'دریافت فهرست پارکینگ‌ها ناموفق بود.' : 'Loading the parking list failed.');
    });
    return () => { isCurrent = false; };
  }, [user.currentParking, language]);

  useEffect(() => {
    if (!user.canManageDashboard && !activeParkingMenu && !showManagement && firstVisibleParkingItem) guardedNavigate(`/home/parking/${firstVisibleParkingItem.key}`, { replace: true });
  }, [user.canManageDashboard, activeParkingMenu, showManagement, firstVisibleParkingItem, navigate, requestNavigation]);
  useEffect(() => { window.localStorage.setItem('eos-parking-sidebar-collapsed', String(sidebarCollapsed)); }, [sidebarCollapsed]);

  return <Box className={`home-shell ${hasSidebar ? 'home-shell-with-sidebar' : ''} ${sidebarCollapsed ? 'home-shell-sidebar-collapsed' : ''}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
    <HomeHeader labels={t} user={user} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={onShapeSettingsChange} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={setSelectedParkingId} onHome={() => openNavigationTab('/home')} onNavigationOpen={() => setMobileNavigationOpen(true)} onNavigationToggle={() => setSidebarCollapsed((current) => !current)} navigationLabel={t.openNavigation} navigationToggleLabel={sidebarCollapsed ? t.expandNavigation : t.collapseNavigation} navigationMode={navigationMode} navigationModeLabel={`${navigationModeCopy[language].switchMode}: ${navigationMode === 'tabs' ? navigationModeCopy[language].classic : navigationModeCopy[language].tabs}`} onNavigationModeChange={setNavigationMode} direction={direction} />
    {navigationMode === 'tabs' && <HomeTabs tabs={openTabs} activePath={location.pathname} homeLabel={t.home} closeLabel={t.close} direction={direction} onSelect={openNavigationTab} onClose={closeNavigationTab} />}
    <Box className={`home-body ${!hasSidebar ? 'home-body-no-sidebar' : ''}`}>
      {hasSidebar && <HomeSidebar appName={t.app} systemMenu={t.systemMenu} currentParkingSectionTitle={language === 'fa' ? 'تعاریف و تنظیمات پارکینگ جاری' : 'Current parking definitions and settings'} reportsSectionTitle={language === 'fa' ? 'گزارش‌ها' : 'Reports'} direction={language === 'fa' ? 'rtl' : 'ltr'} visibleManagementItems={visibleManagement} visibleParkingMenuGroups={visibleParking} activeParkingMenu={activeParkingMenu} managementSection={managementSection} onNavigate={openNavigationTab} canManageDashboard={user.canManageDashboard} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} mobileOpen={mobileNavigationOpen} onMobileClose={() => setMobileNavigationOpen(false)} />}
      <Box component="main" className="home-main">
        {!showManagement && !activeParkingMenu && <Box className="home-page-header"><Box className="home-page-heading-copy"><h1 className="home-page-title">{t.homeTitle}</h1><p className="home-page-description">{t.homeDescription}</p></Box></Box>}
        {parkingLoadError && <Alert severity="warning" sx={{ m: 2 }}>{parkingLoadError}</Alert>}
        {(showManagement || activeParkingMenu) ? <Box className="home-content-section"><HomeFormRoutes language={language} user={user} labels={t} selectedParkingId={selectedParkingId} visibleManagementItems={visibleManagement} visibleParkingMenuItems={visibleParking.flatMap((group) => group.items)} hasPart1={hasPart1} /></Box> : (!user.canManageDashboard && visibleManagement.length === 0) ? <Alert severity="info">{t.noAccess}</Alert> : selectedParking ? <HomeDashboard labels={t} selectedParkingName={selectedParking.name} selectedParkingId={selectedParking.id} /> : <Alert severity="info">{language === 'fa' ? 'پارکینگی برای نمایش در دسترس نیست.' : 'No parking is available to display.'}</Alert>}
      </Box>
    </Box>
  </Box>;
}
