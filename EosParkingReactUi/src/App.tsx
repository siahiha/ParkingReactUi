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
import { Login2Page } from './pages/Login2Page';
import { SsoCallbackPage } from './pages/SsoCallbackPage';
import type { LoginResult } from './features/auth/authService';
import { isSsoEnabled } from './config';
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
  const hasSsoThemeCache = isSsoEnabled && Boolean(initialAuthSession);
  const [language, setLanguage] = useState<Language>(() => (!isSsoEnabled || hasSsoThemeCache) ? normalizeLanguage(window.localStorage.getItem(ssoLocaleStorageKey)) ?? 'fa' : 'fa');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (hasSsoThemeCache) return normalizeThemeMode(window.localStorage.getItem(ssoThemeStorageKey)) ?? 'light';
    if (isSsoEnabled) return 'light';
    return normalizeThemeMode(window.localStorage.getItem(themeStorageKey)) ?? 'light';
  });
  const [lightPalette, setLightPalette] = useState<PaletteName>(() => hasSsoThemeCache || !isSsoEnabled ? (window.localStorage.getItem(lightPaletteStorageKey) as PaletteName | null) ?? 'blue' : 'blue');
  const [darkPalette, setDarkPalette] = useState<PaletteName>(() => hasSsoThemeCache || !isSsoEnabled ? (window.localStorage.getItem(darkPaletteStorageKey) as PaletteName | null) ?? 'blue' : 'blue');
  const [themeColors, setThemeColors] = useState<unknown>(() => hasSsoThemeCache ? readJsonStorage(ssoThemeColorsStorageKey) : undefined);
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
  const activeThemeColors = isSsoEnabled ? resolveThemeColorOverrides(themeColors, themeMode) : {};
  const activeTokens = getPaletteTokens(themeMode, activePalette, activeThemeColors);
  const theme = useMemo(() => createAppTheme(direction, themeMode, activePalette, shapeSettings, activeThemeColors), [direction, themeMode, activePalette, shapeSettings, activeThemeColors]);
  const pickerLocaleText = useMemo(() => {
    const localeText = (language === 'fa' ? faIR : enUS).components.MuiLocalizationProvider.defaultProps.localeText;
    return { ...localeText, fieldHoursPlaceholder: () => 'HH', fieldMinutesPlaceholder: () => 'mm' };
  }, [language]);

  useEffect(() => {
    void i18n.changeLanguage(language);
    window.localStorage.setItem(shapeStorageKey, JSON.stringify(shapeSettings));
    if (isSsoEnabled) {
      if (authenticated) {
        window.localStorage.setItem(lightPaletteStorageKey, lightPalette);
        window.localStorage.setItem(darkPaletteStorageKey, darkPalette);
        window.localStorage.setItem(ssoLocaleStorageKey, language);
        window.localStorage.setItem(ssoThemeStorageKey, themeMode);
        if (themeColors === undefined) window.localStorage.removeItem(ssoThemeColorsStorageKey);
        else window.localStorage.setItem(ssoThemeColorsStorageKey, JSON.stringify(themeColors));
      } else {
        window.localStorage.removeItem(ssoThemeStorageKey);
        window.localStorage.removeItem(ssoThemeColorsStorageKey);
        window.localStorage.removeItem(ssoLocaleStorageKey);
        window.localStorage.removeItem(lightPaletteStorageKey);
        window.localStorage.removeItem(darkPaletteStorageKey);
      }
    } else {
      window.localStorage.setItem(lightPaletteStorageKey, lightPalette);
      window.localStorage.setItem(darkPaletteStorageKey, darkPalette);
      window.localStorage.setItem(ssoLocaleStorageKey, language);
      window.localStorage.setItem(themeStorageKey, themeMode);
      window.localStorage.removeItem(ssoThemeStorageKey);
      window.localStorage.removeItem(ssoThemeColorsStorageKey);
    }
  }, [authenticated, themeMode, lightPalette, darkPalette, shapeSettings, language, themeColors]);
  const clearLocalSession = () => {
    sessionInvalidationHandled.current = true;
    setAuthenticated(false);
    setHomeUser(null);
    window.sessionStorage.removeItem(authSessionStorageKey);
    if (isSsoEnabled) {
      setThemeMode('light');
      setLightPalette('blue');
      setDarkPalette('blue');
      setThemeColors(undefined);
      setLanguage('fa');
      window.localStorage.removeItem(ssoThemeStorageKey);
      window.localStorage.removeItem(ssoThemeColorsStorageKey);
      window.localStorage.removeItem(ssoLocaleStorageKey);
      window.localStorage.removeItem(lightPaletteStorageKey);
      window.localStorage.removeItem(darkPaletteStorageKey);
    }
    navigate('/', { replace: true });
  };
  useEffect(() => registerSessionInvalidationHandler(() => {
    if (sessionInvalidationHandled.current) return;
    clearLocalSession();
  }), [navigate]);
  const authenticate = ({ user, preferences }: LoginResult) => {
    if (isSsoEnabled) {
      const nextTheme = normalizeThemeMode(preferences?.theme);
      setThemeMode(nextTheme ?? 'light');
      const nextLanguage = normalizeLanguage(preferences?.locale);
      if (nextLanguage) setLanguage(nextLanguage);
      if (preferences?.themeColors === undefined) {
        setThemeColors(undefined);
        setLightPalette('blue');
        setDarkPalette('blue');
      } else {
        setThemeColors(preferences.themeColors);
        const palettes = resolvePaletteNames(preferences.themeColors);
        setLightPalette(palettes.light ?? 'blue');
        setDarkPalette(palettes.dark ?? 'blue');
      }
    }
    // The token is set by the Backend as an HttpOnly cookie. Only the
    // non-sensitive user snapshot is kept to restore the shell after refresh.
    window.sessionStorage.setItem(authSessionStorageKey, JSON.stringify({ user }));
    sessionInvalidationHandled.current = false;
    setAuthenticated(true);
    setHomeUser(user);
    requestNavigation(() => navigate('/home', { replace: true }));
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
    ? { surface: activeThemeColors.surface ?? activeTokens.surface, shell: activeThemeColors.shell ?? activeTokens.shell, text: activeThemeColors.text ?? '#f3f5f7', mutedText: activeThemeColors.mutedText ?? '#b7c1ca', border: activeThemeColors.border ?? activeTokens.border, input: activeThemeColors.input ?? activeTokens.input }
    : { surface: activeThemeColors.surface ?? activeTokens.surface, shell: activeThemeColors.shell ?? activeTokens.shell, text: activeThemeColors.text ?? '#18212b', mutedText: activeThemeColors.mutedText ?? '#687482', border: activeThemeColors.border ?? activeTokens.border, input: activeThemeColors.input ?? activeTokens.input };
  const homeElement = (options: { basePath?: '/home' | '/home2'; variant?: 'default' | 'home2'; unknownRoute?: boolean } = {}) => {
    const basePath = options.basePath ?? '/home';
    const isOutsideHomeRoutes = location.pathname !== '/' && location.pathname !== '/sso/callback' && !location.pathname.startsWith(basePath);
    return authenticated && homeUser ? <Home language={language} user={homeUser} themeMode={themeMode} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} themeSettingsEnabled={!isSsoEnabled} onShapeSettingsChange={setShapeSettings} onThemeToggle={() => setThemeMode((mode) => mode === 'light' ? 'dark' : 'light')} onLightPaletteChange={setLightPalette} onDarkPaletteChange={setDarkPalette} onLogout={logout} onToggleLanguage={toggleLanguage} basePath={basePath} variant={options.variant ?? 'default'} unknownRoute={options.unknownRoute || isOutsideHomeRoutes} /> : <Navigate to="/" replace />;
  };
  return <Box className={`app-root app-theme-${themeMode}`} data-theme-mode={themeMode} data-palette={`${themeMode}-${activePalette}`} dir={direction} lang={language} sx={{ '--app-primary': activeTokens.primary, '--app-primary-hover': activeTokens.hover, '--app-primary-soft': activeTokens.soft, '--app-surface': themeVars.surface, '--app-shell': themeVars.shell, '--app-text': themeVars.text, '--app-muted-text': themeVars.mutedText, '--app-divider': themeVars.border, '--app-input': themeVars.input, '--app-control-radius': `${shapeSettings.controlRadius}px`, '--app-button-radius': `${shapeSettings.buttonRadius}px`, '--app-popup-radius': `${shapeSettings.popupRadius}px` } as CSSProperties}><RTL locale={language}><ThemeProvider theme={theme}><LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language} localeText={pickerLocaleText}><CssBaseline /><Routes>
    <Route path="/home/*" element={homeElement()} />
    <Route path="/home2/*" element={homeElement({ basePath: '/home2', variant: 'home2' })} />
    <Route path="/sso/callback" element={<SsoCallbackPage language={language} onAuthenticated={authenticate} />} />
    <Route path="/login2" element={<LoginPage language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="/login" element={<Login2Page language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="/" element={<Login2Page language={language} toggleLanguage={toggleLanguage} onAuthenticated={authenticate} />} />
    <Route path="*" element={homeElement({ unknownRoute: true })} />
  </Routes></LocalizationProvider></ThemeProvider></RTL></Box>;
}
