import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import type { Language } from '../i18n';
import type { PaletteName } from '../components/homeProfileTypes';
import { HomeDashboard } from './HomeDashboard';
import { HomeFormRoutes } from './HomeFormRoutes';
import { HomeHeader } from './HomeHeader';
import { HomeSidebar } from './HomeSidebar';
import { homeCopy } from './homeCopy';
import { createManagementItems, createParkingMenuGroups, visibleManagementItems as filterManagementItems, visibleParkingGroups, type ManagementSection } from './homeMenuModel';
import type { HomeUser, ThemeMode } from './homeTypes';
import { useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';
import { useNavigationGuard } from './NavigationGuardContext';

export type { HomeUser } from './homeTypes';
export type { HomeLabels } from './homeCopy';

type HomeProps = { language: Language; user: HomeUser; themeMode: ThemeMode; lightPalette: PaletteName; darkPalette: PaletteName; onThemeToggle: () => void; onLightPaletteChange: (palette: PaletteName) => void; onDarkPaletteChange: (palette: PaletteName) => void; onLogout: () => void; onToggleLanguage: () => void };

function hasBit(value: string | number | undefined, bit: bigint) {
  try { return (BigInt(String(value ?? 0)) & bit) === bit; } catch { return false; }
}

export function Home({ language, user, themeMode, lightPalette, darkPalette, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage }: HomeProps) {
  const t = homeCopy[language];
  const location = useLocation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const guardedNavigate = (path: string, options?: NavigateOptions) => requestNavigation(() => navigate(path, options));
  const managementRoute = location.pathname.match(/^\/home\/management\/([^/]+)/)?.[1];
  const activeParkingMenu = location.pathname.match(/^\/home\/parking\/([^/]+)/)?.[1] ?? null;
  const managementSection = managementRoute as ManagementSection | undefined;
  const showManagement = Boolean(managementSection);
  const parkingOptions = [{ id: 1, name: t.parkingOne }, { id: 2, name: t.parkingTwo }];
  const initialParking = parkingOptions.some((parking) => parking.id === user.currentParking) ? user.currentParking : parkingOptions[0].id;
  const [selectedParkingId, setSelectedParkingId] = useState(initialParking);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('eos-parking-sidebar-collapsed') === 'true');
  const hasPart1 = (bit: bigint, normalizedName?: string) => Boolean(normalizedName && user.permissions.includes(normalizedName)) || hasBit(user.permissionPart1, bit);
  const hasPart2 = (bit: bigint) => hasBit(user.permissionPart2, bit);
  const managementItems = createManagementItems(t);
  const visibleManagement = filterManagementItems(user, managementItems, hasPart1, hasPart2);
  const menuGroups = createParkingMenuGroups(language);
  const visibleParking = visibleParkingGroups(user, menuGroups, hasPart1, hasPart2);
  const activeParkingMenuItem = visibleParking.flatMap((group) => group.items).find((item) => item.key === activeParkingMenu);
  const hasSidebar = user.canManageDashboard || visibleManagement.length > 0 || visibleParking.length > 0;
  const firstVisibleParkingItem = visibleParking.flatMap((group) => group.items)[0];
  const selectedParking = parkingOptions.find((parking) => parking.id === selectedParkingId) ?? parkingOptions[0];

  useEffect(() => {
    if (!user.canManageDashboard && !activeParkingMenu && !showManagement && firstVisibleParkingItem) guardedNavigate(`/home/parking/${firstVisibleParkingItem.key}`, { replace: true });
  }, [user.canManageDashboard, activeParkingMenu, showManagement, firstVisibleParkingItem, navigate, requestNavigation]);
  useEffect(() => { window.localStorage.setItem('eos-parking-sidebar-collapsed', String(sidebarCollapsed)); }, [sidebarCollapsed]);

  return <Box className={`home-shell ${hasSidebar ? 'home-shell-with-sidebar' : ''} ${sidebarCollapsed ? 'home-shell-sidebar-collapsed' : ''}`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
    <HomeHeader labels={t} user={user} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={setSelectedParkingId} onHome={() => guardedNavigate('/home')} onNavigationOpen={() => setMobileNavigationOpen(true)} navigationLabel={t.openNavigation} />
    <Box className={`home-body ${!hasSidebar ? 'home-body-no-sidebar' : ''}`}>
      {hasSidebar && <HomeSidebar appName={t.app} systemMenu={t.systemMenu} currentParkingSectionTitle={language === 'fa' ? 'تعاریف و تنظیمات پارکینگ جاری' : 'Current parking definitions and settings'} reportsSectionTitle={language === 'fa' ? 'گزارش‌ها' : 'Reports'} direction={language === 'fa' ? 'rtl' : 'ltr'} collapseLabel={t.collapseNavigation} expandLabel={t.expandNavigation} visibleManagementItems={visibleManagement} visibleParkingMenuGroups={visibleParking} activeParkingMenu={activeParkingMenu} managementSection={managementSection} onNavigate={guardedNavigate} canManageDashboard={user.canManageDashboard} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} mobileOpen={mobileNavigationOpen} onMobileClose={() => setMobileNavigationOpen(false)} />}
      <Box component="main" className="home-main">
        {!showManagement && !activeParkingMenu && <Box className="home-page-header"><Box className="home-page-heading-copy"><h1 className="home-page-title">{t.homeTitle}</h1><p className="home-page-description">{t.homeDescription}</p></Box></Box>}
        {(showManagement || activeParkingMenu) ? <Box className="home-content-section"><HomeFormRoutes language={language} user={user} labels={t} selectedParkingId={selectedParkingId} visibleManagementItems={visibleManagement} visibleParkingMenuItems={visibleParking.flatMap((group) => group.items)} hasPart1={hasPart1} /></Box> : (!user.canManageDashboard && visibleManagement.length === 0) ? <Alert severity="info">{t.noAccess}</Alert> : <HomeDashboard labels={t} selectedParkingName={selectedParking.name} selectedParkingId={selectedParkingId} />}
      </Box>
    </Box>
  </Box>;
}
