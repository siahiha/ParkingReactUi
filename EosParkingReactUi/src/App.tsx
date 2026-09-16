import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline } from '@mui/material';
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
import { createAppTheme } from './theme';

type ThemeMode = 'light' | 'dark';
type PaletteName = 'blue' | 'green' | 'slate';
const themeStorageKey = 'eos-parking-theme';
const authSessionStorageKey = 'eos-parking-auth-session';
const lightPaletteStorageKey = 'eos-parking-light-palette';
const darkPaletteStorageKey = 'eos-parking-dark-palette';
const paletteTokens: Record<ThemeMode, Record<PaletteName, { primary: string; hover: string; soft: string }>> = {
  light: { blue: { primary: '#234b78', hover: '#193a60', soft: '#edf2f7' }, green: { primary: '#286b5a', hover: '#1d5144', soft: '#eaf4f0' }, slate: { primary: '#4b5563', hover: '#374151', soft: '#eef0f2' } },
  dark: { blue: { primary: '#8aa4bd', hover: '#b2c8da', soft: '#304252' }, green: { primary: '#79b9a5', hover: '#9bd1bf', soft: '#29453d' }, slate: { primary: '#b2bcc8', hover: '#d4dbe3', soft: '#39434d' } },
};
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
  const [authenticated, setAuthenticated] = useState(Boolean(initialAuthSession));
  const [homeUser, setHomeUser] = useState<HomeUser | null>(initialAuthSession?.user ?? null);
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const direction = translations[language].direction;
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  useLayoutEffect(() => { document.documentElement.lang = language; document.documentElement.dir = direction; }, [language, direction]);
  useLayoutEffect(() => {
    const activePalette = themeMode === 'light' ? lightPalette : darkPalette;
    const tokens = paletteTokens[themeMode][activePalette];
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.dataset.palette = `${themeMode}-${activePalette}`;
    document.documentElement.style.setProperty('--app-primary', tokens.primary);
    document.documentElement.style.setProperty('--app-primary-hover', tokens.hover);
    document.documentElement.style.setProperty('--app-primary-soft', tokens.soft);
    window.localStorage.setItem(themeStorageKey, themeMode);
    window.localStorage.setItem(lightPaletteStorageKey, lightPalette);
    window.localStorage.setItem(darkPaletteStorageKey, darkPalette);
  }, [themeMode, lightPalette, darkPalette]);
  const authenticate = ({ token, user }: { token: string | null; user: HomeUser }) => {
    setAuthToken(token);
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ token, user }));
    setAuthenticated(true);
    setHomeUser(user);
    requestNavigation(() => navigate('/home'));
  };
  const logout = () => requestNavigation(() => { setAuthenticated(false); setHomeUser(null); setAuthToken(null); window.sessionStorage.removeItem(authSessionStorageKey); navigate('/'); });
  const toggleLanguage = () => setLanguage((current) => current === 'fa' ? 'en' : 'fa');

  return <RTL locale={language}><ThemeProvider theme={theme}><CssBaseline /><Routes>
    <Route path="/home/*" element={authenticated && homeUser ? <Home language={language} user={homeUser} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} onThemeToggle={() => setThemeMode((mode) => mode === 'light' ? 'dark' : 'light')} onLightPaletteChange={setLightPalette} onDarkPaletteChange={setDarkPalette} onLogout={logout} onToggleLanguage={toggleLanguage} /> : <Navigate to="/" replace />} />
    <Route path="/" element={<LoginPage language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="*" element={<Navigate to={authenticated ? '/home' : '/'} replace />} />
  </Routes></ThemeProvider></RTL>;
}
