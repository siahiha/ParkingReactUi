import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { createAppTheme, getPaletteTokens, paletteNames, readPaletteName, resolvePaletteNames } from './theme';

describe('paired application palettes', () => {
  for (const name of paletteNames) {
    for (const mode of ['light', 'dark'] as const) {
      it(`keeps ${name} ${mode} text and primary actions readable`, () => {
        const { palette } = createAppTheme('rtl', mode, name);
        const tokens = getPaletteTokens(mode, name);
        for (const background of [tokens.surface, tokens.shell, tokens.input, tokens.soft]) {
          expect(getContrastRatio(palette.text.primary, background)).toBeGreaterThanOrEqual(4.5);
          expect(getContrastRatio(palette.text.secondary, background)).toBeGreaterThanOrEqual(4.5);
          expect(getContrastRatio(palette.primary.main, background)).toBeGreaterThanOrEqual(4.5);
        }
        for (const background of [palette.primary.main, tokens.hover]) {
          expect(getContrastRatio(palette.primary.contrastText, background)).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }

  it('rejects stale or invalid local preferences', () => {
    for (const value of ['unknown', '__proto__', 'constructor', {}, null, undefined]) expect(readPaletteName(value)).toBeUndefined();
    expect(readPaletteName('violet')).toBe('violet');
  });

  it('retains the centrally supplied SSO palette contract', () => {
    expect(resolvePaletteNames('rose')).toEqual({ light: 'rose', dark: 'rose' });
    expect(resolvePaletteNames({ lightPalette: 'green', darkPalette: 'blue' })).toEqual({ light: 'green', dark: 'blue' });
    const theme = createAppTheme('ltr', 'light', 'blue', undefined, { primary: '#fcd34d' });
    expect(getContrastRatio(theme.palette.primary.main, theme.palette.primary.contrastText)).toBeGreaterThanOrEqual(4.5);
  });
});
