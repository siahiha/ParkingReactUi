import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import '../../src/i18n/instance';
import i18n from '../../src/i18n/instance';
import { createAppTheme, defaultThemeShape, type ThemeMode } from '../../src/theme';
import type { PaletteName } from '../../src/components/homeProfileTypes';
import { HomeDashboard } from '../../src/pages/HomeDashboard';
import { HomeShell } from '../../src/pages/HomeShell';
import '../../src/styles.css';

const params = new URLSearchParams(location.search);
const language = params.get('language') === 'en' ? 'en' : 'fa';
const direction = language === 'fa' ? 'rtl' : 'ltr';
void i18n.changeLanguage(language);
const cache = createCache({ key: direction, stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer] });
const noop = () => undefined;
const parkingName = language === 'fa' ? 'پارکینگ مرکزی' : 'Central Parking';

function ParkingMapPreview() {
  const [mode, setMode] = useState<ThemeMode>(params.get('dark') === '1' ? 'dark' : 'light');
  const [palette, setPalette] = useState<PaletteName>(params.get('palette') === 'green' ? 'green' : params.get('palette') === 'slate' ? 'slate' : 'blue');
  const theme = createAppTheme(direction, mode, palette);

  return <CacheProvider value={cache}><ThemeProvider theme={theme}><CssBaseline />
  <Box className={`app-root app-theme-${mode}`} data-theme-mode={mode} lang={language} sx={{
    '--app-primary': theme.palette.primary.main, '--app-primary-hover': theme.palette.primary.dark,
    '--app-primary-soft': theme.palette.action.hover, '--app-surface': theme.palette.background.paper,
    '--app-shell': theme.palette.background.default, '--app-text': theme.palette.text.primary,
    '--app-muted-text': theme.palette.text.secondary, '--app-divider': theme.palette.divider,
    '--app-input': theme.palette.background.paper, '--app-on-primary': theme.palette.primary.contrastText,
    '--app-success': theme.palette.success.main, '--app-warning': theme.palette.warning.main, '--app-info': theme.palette.info.main,
  }}><HomeShell isLoading={false} language={language} direction={direction} themeMode={mode}
    user={{ id: 1, userName: 'Operator', currentParking: 7, permissions: [], canManageDashboard: true }}
    lightPalette={palette} darkPalette={palette} shapeSettings={defaultThemeShape} themeSettingsEnabled={true}
    onShapeSettingsChange={noop} onThemeToggle={() => setMode(current => current === 'light' ? 'dark' : 'light')} onLightPaletteChange={setPalette} onDarkPaletteChange={setPalette}
    onLogout={noop} onToggleLanguage={noop} parkingOptions={[{ id: 7, name: parkingName }]}
    selectedParkingId={7} onParkingChange={noop} openTabs={[{ path: '/home', label: 'Home' }]}
    activePath="/home" homePath="/home" navigationMode={params.get('classic') === '1' ? 'classic' : 'tabs'}
    onNavigationModeChange={noop} onHome={noop} onNavigate={noop} onCloseTab={noop}
    onNavigationOpen={noop} onNavigationToggle={noop} basePath="/home" visibleManagementItems={[]}
    visibleParkingMenuGroups={[]} activeParkingMenu={null} canManageDashboard={true}
    sidebarCollapsed={params.get('expanded') !== '1'} onSidebarCollapsedChange={noop}
    mobileNavigationOpen={false} onMobileNavigationClose={noop}>
    <HomeDashboard language={language} selectedParkingName={parkingName} selectedParkingId={7} basePath="/home" onNavigate={noop} />
  </HomeShell></Box>
</ThemeProvider></CacheProvider>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><ParkingMapPreview /></React.StrictMode>);
