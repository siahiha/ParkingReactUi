import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import type { Language } from '../i18n';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeMode, ThemeShapeSettings } from '../theme';
import type { HomeUser } from './homeTypes';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';
import type { HomeTab } from './HomeTabs';
import { Home3Header } from './Home3Header';
import { Home3LoadingState } from './Home3LoadingState';
import { Home3Navigation } from './Home3Navigation';
import { Home3Tabs } from './Home3Tabs';

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
  basePath: '/home' | '/home2' | '/home3';
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

export function Home3Shell({ children, isLoading, language, user, direction, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, openTabs, activePath, homePath, navigationMode, onNavigationModeChange, onHome, onNavigate, onCloseTab, onNavigationOpen, onNavigationToggle, basePath, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, canManageDashboard, sidebarCollapsed, onSidebarCollapsedChange, mobileNavigationOpen, onMobileNavigationClose }: Props) {
  const { t } = useTranslation();
  const navigationModeLabel = navigationMode === 'tabs' ? t('home2.modeClassic') : t('home2.modeTabs');
  return <Box className={`home3-shell ${sidebarCollapsed ? 'home3-shell-sidebar-collapsed' : ''}`} dir={direction} data-language={language}>
    <Home3Header user={user} direction={direction} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} themeSettingsEnabled={themeSettingsEnabled} onShapeSettingsChange={onShapeSettingsChange} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={onParkingChange} onHome={onHome} onNavigationOpen={onNavigationOpen} onNavigationToggle={onNavigationToggle} isNavigationCollapsed={sidebarCollapsed} navigationMode={navigationMode} navigationModeLabel={navigationModeLabel} onNavigationModeChange={onNavigationModeChange} />
    <Box className="home3-layout">
      <Home3Navigation appName={t('home2.brandTitle')} direction={direction} basePath={basePath} systemMenu={t('home2.systemMenu')} currentParkingSectionTitle={t('home2.parkingDefinitions')} reportsSectionTitle={t('home2.reports')} visibleManagementItems={visibleManagementItems} visibleParkingMenuGroups={visibleParkingMenuGroups} activeParkingMenu={activeParkingMenu} managementSection={managementSection} canManageDashboard={canManageDashboard} collapsed={sidebarCollapsed} onCollapsedChange={onSidebarCollapsedChange} mobileOpen={mobileNavigationOpen} onMobileClose={onMobileNavigationClose} onNavigate={onNavigate} />
      <Box component="main" className="home3-main" aria-busy={isLoading}>
        {navigationMode === 'tabs' && <Home3Tabs tabs={openTabs} activePath={activePath} homePath={homePath} homeLabel={t('home2.menuHome')} closeLabel={t('home2.closeTab')} direction={direction} onSelect={onNavigate} onClose={onCloseTab} />}
        {isLoading ? <Home3LoadingState /> : children}
      </Box>
    </Box>
  </Box>;
}
