import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { enUS, faIR } from '@mui/x-date-pickers/locales';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import 'dayjs/locale/fa';
import { prefixer } from 'stylis';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { type Language, translations } from './i18n';
import { parseAuthSession, resolveCanManageDashboard, type SsoUserPreferences } from './api/contracts';
import { apiRequest, registerSessionInvalidationHandler } from './api/client';
import { Home } from './pages/Home';
import type { HomeUser } from './pages/homeTypes';
import { LoginPage } from './pages/LoginPage';
import { SsoCallbackPage } from './pages/SsoCallbackPage';
import type { LoginResult } from './features/auth/authService';
import { useNavigationGuard } from './pages/NavigationGuardContext';
import i18n from './i18n/instance';
import { createAppTheme, defaultThemeShape, getPaletteTokens, resolvePaletteNames, resolveThemeColorOverrides, type ThemeMode, type ThemeShapeSettings } from './theme';

type PaletteName = 'blue' | 'green' | 'slate';
const themeStorageKey = 'eos-parking-theme';
const authSessionStorageKey = 'eos-parking-auth-session';
const lightPaletteStorageKey = 'eos-parking-light-palette';
const darkPaletteStorageKey = 'eos-parking-dark-palette';
const shapeStorageKey = 'eos-parking-theme-shape';
const ssoThemeStorageKey = 'theme';
const ssoThemeColorsStorageKey = 'themeColors';
const ssoLocaleStorageKey = 'locale';
const cacheRtl = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });

type RTLProps = { locale: Language; children: ReactNode };
const RTL = ({ locale, children }: RTLProps) => locale === 'fa' ? <CacheProvider value={cacheRtl}>{children}</CacheProvider> : <>{children}</>;

function readAuthSession(): { user: HomeUser } | null {
  try {
    const stored = window.sessionStorage.getItem(authSessionStorageKey);
    if (!stored) return null;
    const session = parseAuthSession(JSON.parse(stored));
    if (!session) return null;
    // Migrate sessions created by the previous implementation: remove the
    // legacy token while retaining only the non-sensitive user snapshot.
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ user: session.user }));
    return { user: { ...session.user, canManageDashboard: resolveCanManageDashboard(session.user) } };
  } catch { return null; }
}

function initializeAuthSession() {
  return readAuthSession();
}

function normalizeLanguage(value: unknown): Language | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'fa' || normalized.startsWith('fa-') || normalized === 'persian') return 'fa';
  if (normalized === 'en' || normalized.startsWith('en-') || normalized === 'english') return 'en';
  return undefined;
}

function normalizeThemeMode(value: unknown): ThemeMode | undefined {
  if (value === 'light' || value === 'dark') return value;
  return undefined;
}

function readJsonStorage(key: string): unknown {
  try {
    const value = window.localStorage.getItem(key);
    return value == null ? undefined : JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function App() {
  const [initialAuthSession] = useState(initializeAuthSession);
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(window.localStorage.getItem(ssoLocaleStorageKey)) ?? 'fa');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => normalizeThemeMode(window.localStorage.getItem(ssoThemeStorageKey)) ?? (window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light'));
  const [lightPalette, setLightPalette] = useState<PaletteName>(() => (window.localStorage.getItem(lightPaletteStorageKey) as PaletteName | null) ?? 'blue');
  const [darkPalette, setDarkPalette] = useState<PaletteName>(() => (window.localStorage.getItem(darkPaletteStorageKey) as PaletteName | null) ?? 'blue');
  const [themeColors, setThemeColors] = useState<unknown>(() => readJsonStorage(ssoThemeColorsStorageKey));
  const [shapeSettings, setShapeSettings] = useState<ThemeShapeSettings>(() => {
    try { const stored = JSON.parse(window.localStorage.getItem(shapeStorageKey) ?? 'null'); return stored && typeof stored === 'object' ? { ...defaultThemeShape, ...stored } : defaultThemeShape; } catch { return defaultThemeShape; }
  });
  const [authenticated, setAuthenticated] = useState(Boolean(initialAuthSession));
  const [homeUser, setHomeUser] = useState<HomeUser | null>(initialAuthSession?.user ?? null);
  const sessionInvalidationHandled = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { requestNavigation } = useNavigationGuard();
  const direction = translations[language].direction;
  const activePalette = themeMode === 'light' ? lightPalette : darkPalette;
  const activeThemeColors = resolveThemeColorOverrides(themeColors, themeMode);
  const activeTokens = getPaletteTokens(themeMode, activePalette, activeThemeColors);
  const theme = useMemo(() => createAppTheme(direction, themeMode, activePalette, shapeSettings, activeThemeColors), [direction, themeMode, activePalette, shapeSettings, activeThemeColors]);
  const pickerLocaleText = useMemo(() => {
    const localeText = (language === 'fa' ? faIR : enUS).components.MuiLocalizationProvider.defaultProps.localeText;
    return { ...localeText, fieldHoursPlaceholder: () => 'HH', fieldMinutesPlaceholder: () => 'mm' };
  }, [language]);

  useEffect(() => {
    void i18n.changeLanguage(language);
    window.localStorage.setItem(themeStorageKey, themeMode);
    window.localStorage.setItem(ssoThemeStorageKey, themeMode);
    window.localStorage.setItem(lightPaletteStorageKey, lightPalette);
    window.localStorage.setItem(darkPaletteStorageKey, darkPalette);
    window.localStorage.setItem(shapeStorageKey, JSON.stringify(shapeSettings));
    window.localStorage.setItem(ssoLocaleStorageKey, language);
    if (themeColors !== undefined) window.localStorage.setItem(ssoThemeColorsStorageKey, JSON.stringify(themeColors));
  }, [themeMode, lightPalette, darkPalette, shapeSettings, language, themeColors]);
  const clearLocalSession = () => {
    sessionInvalidationHandled.current = true;
    setAuthenticated(false);
    setHomeUser(null);
    window.sessionStorage.removeItem(authSessionStorageKey);
    navigate('/', { replace: true });
  };
  useEffect(() => registerSessionInvalidationHandler(() => {
    if (sessionInvalidationHandled.current) return;
    clearLocalSession();
  }), [navigate]);
  const authenticate = ({ user, preferences }: LoginResult) => {
    if (preferences) {
      const nextTheme = normalizeThemeMode(preferences.theme);
      if (nextTheme) setThemeMode(nextTheme);
      const nextLanguage = normalizeLanguage(preferences.locale);
      if (nextLanguage) setLanguage(nextLanguage);
      if (preferences.themeColors !== undefined) {
        setThemeColors(preferences.themeColors);
        const palettes = resolvePaletteNames(preferences.themeColors);
        if (palettes.light) setLightPalette(palettes.light);
        if (palettes.dark) setDarkPalette(palettes.dark);
      }
    }
    // The token is set by the Backend as an HttpOnly cookie. Only the
    // non-sensitive user snapshot is kept to restore the shell after refresh.
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ user }));
    sessionInvalidationHandled.current = false;
    setAuthenticated(true);
    setHomeUser(user);
    requestNavigation(() => navigate('/home'));
  };
  const logout = () => requestNavigation(() => {
    void (async () => {
      try {
        await apiRequest('api/user/Logout', { method: 'POST' });
      } catch {
        // Clear the browser session even if the API or SSO provider is offline.
      } finally {
        clearLocalSession();
      }
    })();
  });
  const toggleLanguage = () => setLanguage((current) => current === 'fa' ? 'en' : 'fa');

  const themeVars = themeMode === 'dark'
    ? { surface: activeThemeColors.surface ?? '#29333d', shell: activeThemeColors.shell ?? '#202830', text: activeThemeColors.text ?? '#f3f5f7', mutedText: activeThemeColors.mutedText ?? '#b7c1ca', border: activeThemeColors.border ?? '#3d4b58', input: activeThemeColors.input ?? '#202b35' }
    : { surface: activeThemeColors.surface ?? '#ffffff', shell: activeThemeColors.shell ?? '#f3f5f7', text: activeThemeColors.text ?? '#18212b', mutedText: activeThemeColors.mutedText ?? '#687482', border: activeThemeColors.border ?? '#d7dce2', input: activeThemeColors.input ?? '#fbfcfd' };
  const isOutsideAppRoutes = location.pathname !== '/' && location.pathname !== '/sso/callback' && !location.pathname.startsWith('/home');
  const homeElement = (unknownRoute = false) => authenticated && homeUser ? <Home language={language} user={homeUser} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={setShapeSettings} onThemeToggle={() => setThemeMode((mode) => mode === 'light' ? 'dark' : 'light')} onLightPaletteChange={setLightPalette} onDarkPaletteChange={setDarkPalette} onLogout={logout} onToggleLanguage={toggleLanguage} unknownRoute={unknownRoute || isOutsideAppRoutes} /> : <Navigate to="/" replace />;
  return <Box className={`app-root app-theme-${themeMode}`} data-theme-mode={themeMode} data-palette={`${themeMode}-${activePalette}`} dir={direction} lang={language} sx={{ '--app-primary': activeTokens.primary, '--app-primary-hover': activeTokens.hover, '--app-primary-soft': activeTokens.soft, '--app-surface': themeVars.surface, '--app-shell': themeVars.shell, '--app-text': themeVars.text, '--app-muted-text': themeVars.mutedText, '--app-divider': themeVars.border, '--app-input': themeVars.input, '--app-control-radius': `${shapeSettings.controlRadius}px`, '--app-button-radius': `${shapeSettings.buttonRadius}px`, '--app-popup-radius': `${shapeSettings.popupRadius}px` } as CSSProperties}><RTL locale={language}><ThemeProvider theme={theme}><LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language} localeText={pickerLocaleText}><CssBaseline /><Routes>
    <Route path="/home/*" element={homeElement()} />
    <Route path="/sso/callback" element={<SsoCallbackPage language={language} onAuthenticated={authenticate} />} />
    <Route path="/" element={<LoginPage language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="*" element={homeElement(true)} />
  </Routes></LocalizationProvider></ThemeProvider></RTL></Box>;
}
