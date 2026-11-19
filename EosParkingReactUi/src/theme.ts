import { alpha, createTheme, darken, getContrastRatio, lighten, type Theme } from '@mui/material/styles';
import type { PaletteName } from './components/homeProfileTypes';

export type AppDirection = 'rtl' | 'ltr';
export type ThemeMode = 'light' | 'dark';
export type ThemeShapeSettings = { controlRadius: number; buttonRadius: number; popupRadius: number };
export type ThemeColorOverrides = {
  primary?: string; hover?: string; soft?: string; secondary?: string;
  background?: string; paper?: string; surface?: string; shell?: string;
  text?: string; mutedText?: string; border?: string; input?: string;
};

type PaletteTokenSet = {
  primary: string;
  hover: string;
  soft: string;
  surface: string;
  shell: string;
  border: string;
  input: string;
};

export const defaultThemeShape: ThemeShapeSettings = { controlRadius: 4, buttonRadius: 3, popupRadius: 5 };

export const themeTextColors = {
  light: { primary: '#18212b', secondary: '#5b6674' },
  dark: { primary: '#f3f5f7', secondary: '#b7c1ca' },
};

export const paletteTokens: Record<ThemeMode, Record<PaletteName, PaletteTokenSet>> = {
  light: {
    blue: { primary: '#1d4ed8', hover: '#1e40af', soft: '#eaf1ff', surface: '#ffffff', shell: '#f2f5fb', border: '#d5deed', input: '#f8faff' },
    green: { primary: '#047857', hover: '#065f46', soft: '#e4f5ed', surface: '#ffffff', shell: '#f1f7f4', border: '#cbded5', input: '#f7fcf9' },
    violet: { primary: '#6d28d9', hover: '#5b21b6', soft: '#f1eaff', surface: '#ffffff', shell: '#f6f3fb', border: '#ddd4ed', input: '#fbf9ff' },
    amber: { primary: '#a94b08', hover: '#92400e', soft: '#fff1d6', surface: '#fffefd', shell: '#faf6ef', border: '#e6d9c4', input: '#fffbf5' },
    rose: { primary: '#be123c', hover: '#9f1239', soft: '#ffe9ef', surface: '#ffffff', shell: '#fbf3f5', border: '#ead2da', input: '#fff8fa' },
    slate: { primary: '#475569', hover: '#334155', soft: '#e9eef4', surface: '#ffffff', shell: '#f2f4f7', border: '#d4dce5', input: '#f8fafc' },
  },
  dark: {
    blue: { primary: '#93c5fd', hover: '#bfdbfe', soft: '#243853', surface: '#1c2736', shell: '#111827', border: '#3d5068', input: '#162131' },
    green: { primary: '#6ee7b7', hover: '#a7f3d0', soft: '#203f35', surface: '#1a2b25', shell: '#10211b', border: '#385c4b', input: '#14251e' },
    violet: { primary: '#c4b5fd', hover: '#ddd6fe', soft: '#35294e', surface: '#282137', shell: '#1b1628', border: '#514465', input: '#211b30' },
    amber: { primary: '#fcd34d', hover: '#fde68a', soft: '#44341b', surface: '#2e261b', shell: '#211a10', border: '#635135', input: '#271f14' },
    rose: { primary: '#fda4af', hover: '#fecdd3', soft: '#492a35', surface: '#30222a', shell: '#21161d', border: '#65404e', input: '#281c23' },
    slate: { primary: '#cbd5e1', hover: '#e2e8f0', soft: '#303e4d', surface: '#25303c', shell: '#17212b', border: '#47596b', input: '#1d2834' },
  },
};

export const paletteNames = Object.keys(paletteTokens.light) as PaletteName[];

export function readPaletteName(value: unknown): PaletteName | undefined {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(paletteTokens.light, value)
    ? value as PaletteName : undefined;
}

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
  const result: { light?: PaletteName; dark?: PaletteName } = {};
  const read = readPaletteName;
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
  if (overrides.surface) tokens.surface = overrides.surface;
  if (overrides.shell) tokens.shell = overrides.shell;
  if (overrides.border) tokens.border = overrides.border;
  if (overrides.input) tokens.input = overrides.input;
  return tokens;
}

/** Shared surfaces also travel with MUI portals, which cannot inherit the app root's CSS variables. */
export function getThemeSurfaceVariables(theme: Theme) {
  const { primary, background, text, divider, mode, success, warning, info } = theme.palette;
  const mix = (percent: number) => `color-mix(in srgb, ${primary.main} ${percent}%, ${background.paper})`;
  const selectionDepth = mode === 'dark' ? lighten(primary.dark, .55) : darken(primary.dark, .55);
  // A visibly different stop, without sacrificing text contrast for custom palettes.
  const selectionEnd = getContrastRatio(primary.contrastText, selectionDepth) >= 4.5 ? selectionDepth : primary.main;
  const onChrome = mode === 'dark' ? text.primary : theme.palette.getContrastText(primary.dark);
  const headerDepth = darken(primary.dark, .45);
  return {
    '--app-primary': primary.main,
    '--app-primary-hover': primary.dark,
    '--app-primary-soft': mix(mode === 'dark' ? 12 : 8),
    '--app-on-primary': primary.contrastText,
    '--app-surface': background.paper,
    '--app-shell': background.default,
    '--app-text': text.primary,
    '--app-muted-text': text.secondary,
    '--app-divider': divider,
    '--app-success': success.main,
    '--app-warning': warning.main,
    '--app-info': info.main,
    '--app-chrome': mode === 'dark' ? mix(22) : primary.dark,
    '--app-on-chrome': onChrome,
    '--app-header-height': '56px',
    '--app-header-start': mode === 'dark' ? mix(8) : getContrastRatio(onChrome, headerDepth) >= 4.5 ? headerDepth : primary.dark,
    '--app-header-middle': mode === 'dark' ? mix(30) : getContrastRatio(onChrome, primary.main) >= 4.5 ? primary.main : primary.dark,
    '--app-header-end': mode === 'dark' ? mix(16) : primary.dark,
    '--app-nav-surface': mix(mode === 'dark' ? 15 : 10),
    '--app-nav-glow': mix(mode === 'dark' ? 24 : 18),
    '--app-nav-end': mix(mode === 'dark' ? 6 : 3),
    '--app-nav-item-height': '30px',
    '--app-nav-group-height': '34px',
    '--app-nav-touch-height': '40px',
    '--app-nav-selection-start': selectionEnd,
    '--app-nav-selection-middle': primary.main,
    '--app-nav-selection-end': primary.dark,
    '--app-nav-open-start': mix(mode === 'dark' ? 32 : 28),
    '--app-section-surface': mix(mode === 'dark' ? 12 : 8),
    '--app-table-head': mix(mode === 'dark' ? 16 : 12),
  };
}

export function createAppTheme(direction: AppDirection = 'rtl', mode: ThemeMode = 'light', paletteName: PaletteName = 'blue', shape: ThemeShapeSettings = defaultThemeShape, overrides: ThemeColorOverrides = {}) {
  const tokens = getPaletteTokens(mode, paletteName, overrides);
  return createTheme({
  direction,
  palette: {
    mode,
    contrastThreshold: 4.5,
    primary: { main: tokens.primary, dark: tokens.hover, contrastText: getContrastRatio(tokens.primary, '#ffffff') >= 4.5 ? '#ffffff' : '#101827' },
    secondary: { main: overrides.secondary ?? (mode === 'dark' ? '#b6c2d0' : '#687482') },
    success: { main: mode === 'dark' ? '#81c995' : '#2e7d32' },
    warning: { main: mode === 'dark' ? '#f5c66d' : '#a86600' },
    error: { main: mode === 'dark' ? '#f28b82' : '#c62828' },
    info: { main: mode === 'dark' ? '#8ab4f8' : '#28658a' },
    background: { default: overrides.background ?? tokens.shell, paper: overrides.paper ?? tokens.surface },
    divider: overrides.border ?? tokens.border,
    text: { primary: overrides.text ?? themeTextColors[mode].primary, secondary: overrides.mutedText ?? themeTextColors[mode].secondary },
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
          backgroundColor: tokens.input,
          '& .MuiOutlinedInput-root': {
            minHeight: 34,
            transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            backgroundColor: tokens.surface,
            boxShadow: `0 0 0 3px ${alpha(tokens.primary, .12)}`,
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
