import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box } from '@mui/material';
import type { Language } from '../i18n/instance';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeShapeSettings } from '../theme';
import { HomeFormRoutes } from './HomeFormRoutes';
import { createManagementItems, createParkingMenuGroups, flattenParkingMenuItems, visibleManagementItems as filterManagementItems, visibleParkingGroups, type ManagementSection } from './homeMenuModel';
import type { HomeUser, NavigationMode, ThemeMode } from './homeTypes';
import { useParkingSelections } from '../features/home/useParkingSelections';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';
import { useNavigationGuard } from './NavigationGuardContext';
import type { HomeTab } from './homeTypes';
import { HomeDashboard } from './HomeDashboard';
import { HomeShell } from './HomeShell';

export type { HomeUser } from './homeTypes';

type HomeProps = { language: Language; user: HomeUser; themeMode: ThemeMode; lightPalette: PaletteName; darkPalette: PaletteName; shapeSettings: ThemeShapeSettings; themeSettingsEnabled: boolean; onShapeSettingsChange: (settings: ThemeShapeSettings) => void; onThemeToggle: () => void; onLightPaletteChange: (palette: PaletteName) => void; onDarkPaletteChange: (palette: PaletteName) => void; onLogout: () => void; onToggleLanguage: () => void; unknownRoute?: boolean; basePath?: '/home' };
const navigationModeStorageKey = 'eos-parking-navigation-mode';

function hasBit(value: string | number | undefined, bit: bigint) {
  try { return (BigInt(String(value ?? 0)) & bit) === bit; } catch { return false; }
}

export function Home({ language, user, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, unknownRoute = false, basePath = '/home' }: HomeProps) {
  const { i18n: translationInstance } = useTranslation();
  const t = useMemo(() => translationInstance.getFixedT(language), [translationInstance, language]);
  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const location = useLocation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const guardedNavigate = (path: string, options?: NavigateOptions) => requestNavigation(() => navigate(path, options));
  const homePath = (suffix = '') => `${basePath}${suffix}`;
  const managementRoute = location.pathname.match(new RegExp(`^${basePath}/management/([^/]+)`))?.[1];
  const activeParkingMenu = location.pathname.match(new RegExp(`^${basePath}/parking/([^/]+)`))?.[1] ?? null;
  const parkingSettingsScope = activeParkingMenu ?? managementRoute ?? '';
  const managementSection = managementRoute as ManagementSection | undefined;
  const showManagement = Boolean(managementSection);
  const { options: parkingOptions, selectedParkingId, setSelectedParkingId, loading: parkingLoading, failed: parkingFailed } = useParkingSelections(user.currentParking, language, parkingSettingsScope);
  const parkingLoadError = parkingFailed ? t('home.parkingLoadError') : '';
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const storedValue = window.localStorage.getItem('eos-parking-sidebar-collapsed');
    return storedValue === null ? true : storedValue === 'true';
  });
  const hasPart1 = (bit: bigint, normalizedName?: string) => Boolean(normalizedName && user.permissions.includes(normalizedName)) || hasBit(user.permissionPart1, bit);
  const hasPart2 = (bit: bigint) => hasBit(user.permissionPart2, bit);
  const managementItems = useMemo(() => createManagementItems(language), [language]);
  const allParkingMenuGroups = useMemo(() => createParkingMenuGroups(language), [language]);
  const allParkingMenuItems = useMemo(() => flattenParkingMenuItems(allParkingMenuGroups), [allParkingMenuGroups]);
  const isKnownHomePath = location.pathname === homePath()
    || managementItems.some((item) => location.pathname === homePath(`/management/${item.key}`))
    || allParkingMenuItems.some((item) => location.pathname === homePath(`/parking/${item.key}`));
  const isOutsideAppRoutes = window.location.pathname !== '/' && window.location.pathname !== '/sso/callback' && !window.location.pathname.startsWith(basePath);
  const shouldShowUnknownRoute = unknownRoute || isOutsideAppRoutes || !isKnownHomePath;
  const visibleManagement = filterManagementItems(user, managementItems, hasPart1, hasPart2);
  const selectedParking = parkingLoading ? undefined : parkingOptions.find((parking) => parking.id === selectedParkingId);
  const visibleParking = visibleParkingGroups(user, allParkingMenuGroups, hasPart1, hasPart2, selectedParking?.hasUserShifts, selectedParking?.isCommercialParking);
  const visibleParkingMenuItems = flattenParkingMenuItems(visibleParking);
  const firstVisibleParkingItem = visibleParkingMenuItems[0];
  const [openTabs, setOpenTabs] = useState<HomeTab[]>([{ path: homePath(), label: t('home.menuHome') }]);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>(() => window.localStorage.getItem(navigationModeStorageKey) === 'classic' ? 'classic' : 'tabs');
  const labelForPath = (path: string) => {
    if (path === homePath()) return t('home.menuHome');
    const managementItem = managementItems.find((item) => path === homePath(`/management/${item.key}`));
    if (managementItem) return managementItem.label;
    const parkingItem = allParkingMenuItems.find((item) => path === homePath(`/parking/${item.key}`));
    return parkingItem?.label ?? t('home.menuHome');
  };
  const openNavigationTab = (path: string) => {
    if (navigationMode === 'tabs') setOpenTabs((current) => current.some((tab) => tab.path === path) ? current : [...current, { path, label: labelForPath(path) }]);
    guardedNavigate(path);
  };
  const closeNavigationTab = (path: string) => {
    const index = openTabs.findIndex((tab) => tab.path === path);
    if (index < 0 || path === homePath()) return;
    const remaining = openTabs.filter((tab) => tab.path !== path);
    setOpenTabs(remaining);
    if (location.pathname === path) guardedNavigate(remaining[Math.max(0, index - 1)]?.path ?? homePath());
  };

  useEffect(() => {
    const isKnownHomePath = location.pathname === homePath()
      || managementItems.some((item) => location.pathname === homePath(`/management/${item.key}`))
      || allParkingMenuItems.some((item) => location.pathname === homePath(`/parking/${item.key}`));
    if (navigationMode === 'tabs' && isKnownHomePath) {
      setOpenTabs((current) => current.some((tab) => tab.path === location.pathname) ? current : [...current, { path: location.pathname, label: labelForPath(location.pathname) }]);
    }
  }, [location.pathname, navigationMode, managementItems, allParkingMenuItems]);
  useEffect(() => { window.localStorage.setItem(navigationModeStorageKey, navigationMode); }, [navigationMode]);

  useEffect(() => {
    if (!shouldShowUnknownRoute && !user.canManageDashboard && !activeParkingMenu && !showManagement && firstVisibleParkingItem) guardedNavigate(homePath(`/parking/${firstVisibleParkingItem.key}`), { replace: true });
  }, [shouldShowUnknownRoute, user.canManageDashboard, activeParkingMenu, showManagement, firstVisibleParkingItem, navigate, requestNavigation]);
  useEffect(() => { window.localStorage.setItem('eos-parking-sidebar-collapsed', String(sidebarCollapsed)); }, [sidebarCollapsed]);

  const routeLabels = {
    parkingManagement: t('home.parkingManagement'),
    listMenu: t('homeMenu.items.list'),
    placeholder: t('home.placeholder'),
    accessDeniedTitle: t('home.accessDeniedTitle'),
    accessDeniedMessage: t('home.accessDeniedMessage'),
    unknownRouteTitle: t('home.unknownRouteTitle'),
    unknownRouteMessage: t('home.unknownRouteMessage'),
    backHome: t('home.backHome'),
  };
  const pageContent = shouldShowUnknownRoute ? <Alert severity="warning" role="alert">{t('home.unknownRouteTitle')}: {t('home.unknownRouteMessage')}</Alert> : (showManagement || activeParkingMenu) ? <Box className="home-content-section"><HomeFormRoutes basePath={basePath} language={language} user={user} labels={routeLabels} selectedParkingId={selectedParkingId} isCommercialParking={selectedParking?.isCommercialParking} visibleManagementItems={visibleManagement} allManagementItems={managementItems} visibleParkingMenuItems={visibleParkingMenuItems} allParkingMenuItems={allParkingMenuItems} hasPart1={hasPart1} /></Box> : (!user.canManageDashboard && visibleManagement.length === 0) ? <Alert severity="info">{t('home.noAccess')}</Alert> : selectedParking ? <HomeDashboard language={language} selectedParkingName={selectedParking.name} selectedParkingId={selectedParking.id} basePath={basePath} onNavigate={openNavigationTab} /> : <Alert severity="info">{t('home.noParking')}</Alert>;


  return <HomeShell isLoading={parkingLoading && !showManagement && !activeParkingMenu && !shouldShowUnknownRoute} language={language} user={user} direction={direction} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} themeSettingsEnabled={themeSettingsEnabled} onShapeSettingsChange={onShapeSettingsChange} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={setSelectedParkingId} openTabs={openTabs} activePath={location.pathname} homePath={homePath()} navigationMode={navigationMode} onNavigationModeChange={setNavigationMode} onHome={() => openNavigationTab(homePath())} onNavigate={openNavigationTab} onCloseTab={closeNavigationTab} onNavigationOpen={() => setMobileNavigationOpen(true)} onNavigationToggle={() => setSidebarCollapsed((current) => !current)} basePath={basePath} visibleManagementItems={visibleManagement} visibleParkingMenuGroups={visibleParking} activeParkingMenu={activeParkingMenu} managementSection={managementSection} canManageDashboard={user.canManageDashboard} sidebarCollapsed={sidebarCollapsed} onSidebarCollapsedChange={setSidebarCollapsed} mobileNavigationOpen={mobileNavigationOpen} onMobileNavigationClose={() => setMobileNavigationOpen(false)}><>{parkingLoadError && <Alert severity="warning" className="home3-route-alert">{parkingLoadError}</Alert>}{pageContent}</></HomeShell>;

}
