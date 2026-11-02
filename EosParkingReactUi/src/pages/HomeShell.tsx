import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import type { Language } from '../i18n/instance';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeMode, ThemeShapeSettings } from '../theme';
import type { HomeTab, HomeUser } from './homeTypes';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';
import { HomeHeader } from './HomeHeader';
import { HomeLoadingState } from './HomeLoadingState';
import { HomeNavigation } from './HomeNavigation';
import { HomeTabs } from './HomeTabs';

type Props = {
  children: ReactNode;
  isLoading: boolean;
  language: Language;
  user: HomeUser;
  direction: 'rtl' | 'ltr';
  themeMode: ThemeMode;
  lightPalette: PaletteName;
  darkPalette: PaletteName;
  shapeSettings: ThemeShapeSettings;
  themeSettingsEnabled: boolean;
  onShapeSettingsChange: (settings: ThemeShapeSettings) => void;
  onThemeToggle: () => void;
  onLightPaletteChange: (palette: PaletteName) => void;
  onDarkPaletteChange: (palette: PaletteName) => void;
  onLogout: () => void;
  onToggleLanguage: () => void;
  parkingOptions: Array<{ id: number; name: string }>;
  selectedParkingId: number;
  onParkingChange: (id: number) => void;
  openTabs: HomeTab[];
  activePath: string;
  homePath: string;
  navigationMode: 'tabs' | 'classic';
  onNavigationModeChange: (mode: 'tabs' | 'classic') => void;
  onHome: () => void;
  onNavigate: (path: string) => void;
  onCloseTab: (path: string) => void;
  onNavigationOpen: () => void;
  onNavigationToggle: () => void;
  basePath: '/home' | '/home';
  visibleManagementItems: Array<HomeMenuItem & { key: ManagementSection }>;
  visibleParkingMenuGroups: HomeMenuGroup[];
  activeParkingMenu: string | null;
  managementSection?: ManagementSection;
  canManageDashboard: boolean;
  sidebarCollapsed: boolean;
  onSidebarCollapsedChange: (collapsed: boolean) => void;
  mobileNavigationOpen: boolean;
  onMobileNavigationClose: () => void;
};

export function HomeShell({ children, isLoading, language, user, direction, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, openTabs, activePath, homePath, navigationMode, onNavigationModeChange, onHome, onNavigate, onCloseTab, onNavigationOpen, onNavigationToggle, basePath, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, canManageDashboard, sidebarCollapsed, onSidebarCollapsedChange, mobileNavigationOpen, onMobileNavigationClose }: Props) {
  const { t } = useTranslation();
  const navigationModeLabel = navigationMode === 'tabs' ? t('home.modeClassic') : t('home.modeTabs');
  return <Box className={`home3-shell ${sidebarCollapsed ? 'home3-shell-sidebar-collapsed' : ''}`} dir={direction} data-language={language}>
    <HomeHeader user={user} direction={direction} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} themeSettingsEnabled={themeSettingsEnabled} onShapeSettingsChange={onShapeSettingsChange} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={onParkingChange} onHome={onHome} onNavigationOpen={onNavigationOpen} onNavigationToggle={onNavigationToggle} isNavigationCollapsed={sidebarCollapsed} navigationMode={navigationMode} navigationModeLabel={navigationModeLabel} onNavigationModeChange={onNavigationModeChange} />
    <Box className="home3-layout">
      <HomeNavigation appName={t('home.brandTitle')} direction={direction} basePath={basePath} systemMenu={t('home.systemMenu')} currentParkingSectionTitle={t('home.parkingDefinitions')} reportsSectionTitle={t('home.reports')} visibleManagementItems={visibleManagementItems} visibleParkingMenuGroups={visibleParkingMenuGroups} activeParkingMenu={activeParkingMenu} managementSection={managementSection} canManageDashboard={canManageDashboard} collapsed={sidebarCollapsed} onCollapsedChange={onSidebarCollapsedChange} mobileOpen={mobileNavigationOpen} onMobileClose={onMobileNavigationClose} onNavigate={onNavigate} />
      <Box component="main" className="home3-main" aria-busy={isLoading}>
        {navigationMode === 'tabs' && <HomeTabs tabs={openTabs} activePath={activePath} homePath={homePath} homeLabel={t('home.menuHome')} closeLabel={t('home.closeTab')} direction={direction} onSelect={onNavigate} onClose={onCloseTab} />}
        {isLoading ? <HomeLoadingState /> : children}
      </Box>
    </Box>
  </Box>;
}



