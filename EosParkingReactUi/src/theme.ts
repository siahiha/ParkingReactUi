import { createTheme } from '@mui/material/styles';
import type { PaletteName } from './components/homeProfileTypes';

export type AppDirection = 'rtl' | 'ltr';
export type ThemeMode = 'light' | 'dark';
export type ThemeShapeSettings = { controlRadius: number; buttonRadius: number; popupRadius: number };
export type ThemeColorOverrides = {
  primary?: string; hover?: string; soft?: string; secondary?: string;
  background?: string; paper?: string; surface?: string; shell?: string;
  text?: string; mutedText?: string; border?: string; input?: string;
};

export const defaultThemeShape: ThemeShapeSettings = { controlRadius: 4, buttonRadius: 3, popupRadius: 5 };

export const paletteTokens: Record<ThemeMode, Record<PaletteName, { primary: string; hover: string; soft: string }>> = {
  light: { blue: { primary: '#234b78', hover: '#193a60', soft: '#edf2f7' }, green: { primary: '#286b5a', hover: '#1d5144', soft: '#eaf4f0' }, slate: { primary: '#4b5563', hover: '#374151', soft: '#eef0f2' } },
  dark: { blue: { primary: '#8aa4bd', hover: '#b2c8da', soft: '#304252' }, green: { primary: '#79b9a5', hover: '#9bd1bf', soft: '#29453d' }, slate: { primary: '#b2bcc8', hover: '#d4dbe3', soft: '#39434d' } },
};

function colorValue(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (typeof source[key] === 'string' && source[key].trim()) return source[key].trim();
  }
  return undefined;
}

function colorSource(raw: unknown, mode: ThemeMode): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const root = raw as Record<string, unknown>;
  const modeValue = mode === 'light'
    ? root.light ?? root.lightMode ?? root.day ?? root.dayMode
    : root.dark ?? root.darkMode ?? root.night ?? root.nightMode;
  return modeValue && typeof modeValue === 'object' && !Array.isArray(modeValue)
    ? modeValue as Record<string, unknown>
    : root;
}

export function resolveThemeColorOverrides(raw: unknown, mode: ThemeMode): ThemeColorOverrides {
  const source = colorSource(raw, mode);
  return {
    primary: colorValue(source, 'primary', 'primaryColor', 'main', 'mainColor'),
    hover: colorValue(source, 'hover', 'primaryHover', 'primaryDark'),
    soft: colorValue(source, 'soft', 'primarySoft', 'backgroundSoft'),
    secondary: colorValue(source, 'secondary', 'secondaryColor'),
    background: colorValue(source, 'background', 'backgroundColor', 'pageBackground'),
    paper: colorValue(source, 'paper', 'surface', 'surfaceColor', 'cardBackground'),
    surface: colorValue(source, 'surface', 'surfaceColor', 'paper', 'cardBackground'),
    shell: colorValue(source, 'shell', 'shellColor', 'layoutBackground'),
    text: colorValue(source, 'text', 'textColor', 'foreground'),
    mutedText: colorValue(source, 'mutedText', 'mutedColor', 'secondaryText'),
    border: colorValue(source, 'border', 'borderColor', 'divider'),
    input: colorValue(source, 'input', 'inputBackground', 'fieldBackground'),
  };
}

export function resolvePaletteNames(raw: unknown): { light?: PaletteName; dark?: PaletteName } {
  const known = new Set<PaletteName>(['blue', 'green', 'slate']);
  const result: { light?: PaletteName; dark?: PaletteName } = {};
  const read = (value: unknown) => typeof value === 'string' && known.has(value as PaletteName) ? value as PaletteName : undefined;
  if (typeof raw === 'string') {
    const palette = read(raw);
    if (palette) return { light: palette, dark: palette };
    return result;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
  const source = raw as Record<string, unknown>;
  const shared = read(source.palette ?? source.paletteName ?? source.name);
  result.light = read(source.lightPalette ?? source.light) ?? shared;
  result.dark = read(source.darkPalette ?? source.dark) ?? shared;
  return result;
}

export function getPaletteTokens(mode: ThemeMode, name: PaletteName, overrides: ThemeColorOverrides = {}) {
  const tokens = { ...paletteTokens[mode][name] };
  if (overrides.primary) tokens.primary = overrides.primary;
  if (overrides.hover) tokens.hover = overrides.hover;
  if (overrides.soft) tokens.soft = overrides.soft;
  return tokens;
}

export function createAppTheme(direction: AppDirection = 'rtl', mode: ThemeMode = 'light', paletteName: PaletteName = 'blue', shape: ThemeShapeSettings = defaultThemeShape, overrides: ThemeColorOverrides = {}) {
  const tokens = getPaletteTokens(mode, paletteName, overrides);
  return createTheme({
  direction,
  palette: {
    mode,
    primary: { main: tokens.primary, dark: tokens.hover, contrastText: '#ffffff' },
    secondary: { main: overrides.secondary ?? '#687482' },
    success: { main: '#2e7d32' },
    warning: { main: '#a86600' },
    error: { main: '#c62828' },
    info: { main: '#28658a' },
    background: { default: overrides.background ?? (mode === 'dark' ? '#202830' : '#f3f5f7'), paper: overrides.paper ?? (mode === 'dark' ? '#29333d' : '#ffffff') },
    divider: overrides.border ?? '#d7dce2',
    text: { primary: overrides.text ?? (mode === 'dark' ? '#f3f5f7' : '#18212b'), secondary: overrides.mutedText ?? (mode === 'dark' ? '#b7c1ca' : '#687482') },
  },
  shape: { borderRadius: shape.controlRadius },
  typography: {
    fontFamily: "var(--app-font-family, 'VazirFD', 'Vazir', Tahoma, Arial, sans-serif)",
    h1: { fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.4 },
    h2: { fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.45 },
    h6: { fontSize: '.9rem', fontWeight: 800, lineHeight: 1.5 },
    body1: { fontSize: '.82rem', lineHeight: 1.6 },
    body2: { fontSize: '.76rem', lineHeight: 1.55 },
    button: { fontSize: '.76rem', fontWeight: 700, letterSpacing: 0 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDrawer: {
      defaultProps: { anchor: direction === 'rtl' ? 'right' : 'left' },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: shape.popupRadius, boxShadow: '0 8px 24px rgba(20, 35, 48, .18)' },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { padding: '12px 16px', fontSize: '.92rem', fontWeight: 800 } } },
    MuiDialogContent: { styleOverrides: { root: { padding: '14px 16px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '8px 12px', gap: 6 } } },
    MuiTextField: {
      defaultProps: { fullWidth: true, variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          backgroundColor: '#fbfcfd',
          '& .MuiOutlinedInput-root': {
            minHeight: 34,
            transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 3px rgba(35, 75, 120, .10)',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.68rem',
            fontWeight: 600,
          },
          '& .MuiInputLabel-root.MuiInputLabel-shrink': {
            fontSize: '0.74rem',
          },
          '& .MuiFormHelperText-root': {
            marginInline: 5,
            marginTop: 3,
            fontSize: '0.68rem',
            lineHeight: 1.45,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: { root: { minHeight: 32, borderRadius: shape.buttonRadius, paddingInline: 11 } },
    },
    MuiIconButton: {
      defaultProps: { disableRipple: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: shape.controlRadius },
        input: {
          fontSize: '.78rem',
          padding: '7px 10px',
          '&::placeholder': {
            fontSize: '0.68rem',
            opacity: 0.72,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { height: 26, borderRadius: shape.controlRadius, fontSize: '.7rem', fontWeight: 700 } },
    },
    MuiFormControlLabel: { styleOverrides: { label: { fontSize: '.74rem' } } },
    MuiAlert: { styleOverrides: { root: { padding: '5px 10px', fontSize: '.74rem' } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: shape.popupRadius } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: shape.popupRadius } } },
  },
  });
}

export const appTheme = createAppTheme('rtl');
