import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import type { Language } from '../i18n';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeMode, ThemeShapeSettings } from '../theme';
import type { HomeLabels } from './homeCopy';
import type { HomeUser } from './homeTypes';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';
import type { HomeTab } from './HomeTabs';
import { Home2Header } from './Home2Header';
import { Home2Navigation } from './Home2Navigation';
import { Home2Tabs } from './Home2Tabs';

type Props = {
  children: ReactNode;
  language: Language;
  labels: HomeLabels;
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
  navigationLabel: string;
  navigationToggleLabel: string;
  basePath: '/home' | '/home2';
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

export function Home2Shell({ children, language, labels, user, direction, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, openTabs, activePath, homePath, navigationMode, onNavigationModeChange, onHome, onNavigate, onCloseTab, onNavigationOpen, onNavigationToggle, navigationLabel, navigationToggleLabel, basePath, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, canManageDashboard, sidebarCollapsed, onSidebarCollapsedChange, mobileNavigationOpen, onMobileNavigationClose }: Props) {
  const { t } = useTranslation();
  return <Box className="home2-shell" dir={direction} data-language={language}>
    <Home2Header labels={labels} user={user} direction={direction} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} themeSettingsEnabled={themeSettingsEnabled} onShapeSettingsChange={onShapeSettingsChange} onThemeToggle={onThemeToggle} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onLogout={onLogout} onToggleLanguage={onToggleLanguage} parkingOptions={parkingOptions} selectedParkingId={selectedParkingId} onParkingChange={onParkingChange} onHome={onHome} onNavigationOpen={onNavigationOpen} onNavigationToggle={onNavigationToggle} navigationLabel={navigationLabel} navigationToggleLabel={navigationToggleLabel} navigationMode={navigationMode} onNavigationModeChange={onNavigationModeChange} />
    {navigationMode === 'tabs' && <Home2Tabs tabs={openTabs} activePath={activePath} homePath={homePath} direction={direction} onSelect={onNavigate} onClose={onCloseTab} />}
    <Box className="home2-layout">
      <Home2Navigation appName={labels.app} direction={direction} basePath={basePath} systemMenu={t('home2.systemMenu')} currentParkingSectionTitle={t('home2.parkingDefinitions')} reportsSectionTitle={t('home2.reports')} visibleManagementItems={visibleManagementItems} visibleParkingMenuGroups={visibleParkingMenuGroups} activeParkingMenu={activeParkingMenu} managementSection={managementSection} canManageDashboard={canManageDashboard} collapsed={sidebarCollapsed} onCollapsedChange={onSidebarCollapsedChange} mobileOpen={mobileNavigationOpen} onMobileClose={onMobileNavigationClose} onNavigate={onNavigate} />
      <Box component="main" className="home2-main">{children}</Box>
    </Box>
  </Box>;
}
