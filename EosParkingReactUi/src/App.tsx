import { useLayoutEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { type Language, translations } from './i18n';
import { parseAuthSession, resolveCanManageDashboard } from './api/contracts';
import { setAuthToken } from './api/client';
import { Home } from './pages/Home';
import type { HomeUser } from './pages/homeTypes';
import { LoginPage } from './pages/LoginPage';
import { useNavigationGuard } from './pages/NavigationGuardContext';
import { createAppTheme, defaultThemeShape, getPaletteTokens, type ThemeMode, type ThemeShapeSettings } from './theme';

type PaletteName = 'blue' | 'green' | 'slate';
const themeStorageKey = 'eos-parking-theme';
const authSessionStorageKey = 'eos-parking-auth-session';
const lightPaletteStorageKey = 'eos-parking-light-palette';
const darkPaletteStorageKey = 'eos-parking-dark-palette';
const shapeStorageKey = 'eos-parking-theme-shape';
const cacheRtl = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });

type RTLProps = { locale: Language; children: ReactNode };
const RTL = ({ locale, children }: RTLProps) => locale === 'fa' ? <CacheProvider value={cacheRtl}>{children}</CacheProvider> : <>{children}</>;

function readAuthSession(): { token: string | null; user: HomeUser } | null {
  try {
    const stored = window.sessionStorage.getItem(authSessionStorageKey);
    if (!stored) return null;
    const session = parseAuthSession(JSON.parse(stored));
    if (!session) return null;
    return { token: session.token, user: { ...session.user, canManageDashboard: resolveCanManageDashboard(session.user) } };
  } catch { return null; }
}

function initializeAuthSession() {
  const session = readAuthSession();
  // Route children start their data effects immediately after mount. Set the
  // request token during initialization so a restored session never issues an
  // unauthenticated first request after a browser refresh.
  setAuthToken(session?.token ?? null);
  return session;
}

export function App() {
  const [initialAuthSession] = useState(initializeAuthSession);
  const [language, setLanguage] = useState<Language>('fa');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light');
  const [lightPalette, setLightPalette] = useState<PaletteName>(() => (window.localStorage.getItem(lightPaletteStorageKey) as PaletteName | null) ?? 'blue');
  const [darkPalette, setDarkPalette] = useState<PaletteName>(() => (window.localStorage.getItem(darkPaletteStorageKey) as PaletteName | null) ?? 'blue');
  const [shapeSettings, setShapeSettings] = useState<ThemeShapeSettings>(() => {
    try { const stored = JSON.parse(window.localStorage.getItem(shapeStorageKey) ?? 'null'); return stored && typeof stored === 'object' ? { ...defaultThemeShape, ...stored } : defaultThemeShape; } catch { return defaultThemeShape; }
  });
  const [authenticated, setAuthenticated] = useState(Boolean(initialAuthSession));
  const [homeUser, setHomeUser] = useState<HomeUser | null>(initialAuthSession?.user ?? null);
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const direction = translations[language].direction;
  const activePalette = themeMode === 'light' ? lightPalette : darkPalette;
  const activeTokens = getPaletteTokens(themeMode, activePalette);
  const theme = useMemo(() => createAppTheme(direction, themeMode, activePalette, shapeSettings), [direction, themeMode, activePalette, shapeSettings]);

  useLayoutEffect(() => {
    window.localStorage.setItem(themeStorageKey, themeMode);
    window.localStorage.setItem(lightPaletteStorageKey, lightPalette);
    window.localStorage.setItem(darkPaletteStorageKey, darkPalette);
    window.localStorage.setItem(shapeStorageKey, JSON.stringify(shapeSettings));
  }, [themeMode, lightPalette, darkPalette, shapeSettings]);
  const authenticate = ({ token, user }: { token: string | null; user: HomeUser }) => {
    setAuthToken(token);
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ token, user }));
    setAuthenticated(true);
    setHomeUser(user);
    requestNavigation(() => navigate('/home'));
  };
  const logout = () => requestNavigation(() => { setAuthenticated(false); setHomeUser(null); setAuthToken(null); window.sessionStorage.removeItem(authSessionStorageKey); navigate('/'); });
  const toggleLanguage = () => setLanguage((current) => current === 'fa' ? 'en' : 'fa');

  const themeVars = themeMode === 'dark'
    ? { surface: '#29333d', shell: '#202830', text: '#f3f5f7', mutedText: '#b7c1ca', border: '#3d4b58', input: '#202b35' }
    : { surface: '#ffffff', shell: '#f3f5f7', text: '#18212b', mutedText: '#687482', border: '#d7dce2', input: '#fbfcfd' };
  return <Box className={`app-root app-theme-${themeMode}`} data-theme-mode={themeMode} data-palette={`${themeMode}-${activePalette}`} dir={direction} lang={language} sx={{ '--app-primary': activeTokens.primary, '--app-primary-hover': activeTokens.hover, '--app-primary-soft': activeTokens.soft, '--app-surface': themeVars.surface, '--app-shell': themeVars.shell, '--app-text': themeVars.text, '--app-muted-text': themeVars.mutedText, '--app-divider': themeVars.border, '--app-input': themeVars.input, '--app-control-radius': `${shapeSettings.controlRadius}px`, '--app-button-radius': `${shapeSettings.buttonRadius}px`, '--app-popup-radius': `${shapeSettings.popupRadius}px` } as CSSProperties}><RTL locale={language}><ThemeProvider theme={theme}><CssBaseline /><Routes>
    <Route path="/home/*" element={authenticated && homeUser ? <Home language={language} user={homeUser} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={setShapeSettings} onThemeToggle={() => setThemeMode((mode) => mode === 'light' ? 'dark' : 'light')} onLightPaletteChange={setLightPalette} onDarkPaletteChange={setDarkPalette} onLogout={logout} onToggleLanguage={toggleLanguage} /> : <Navigate to="/" replace />} />
    <Route path="/" element={<LoginPage language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="*" element={<Navigate to={authenticated ? '/home' : '/'} replace />} />
  </Routes></ThemeProvider></RTL></Box>;
}
