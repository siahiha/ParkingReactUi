import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from '@mui/material';
import { Box } from '@mui/material';
import type { PaletteName, ThemeDialogProps } from './homeProfileTypes';
import { getPaletteTokens } from '../theme';

type ThemeDraft = {
  lightPalette: PaletteName;
  darkPalette: PaletteName;
  shapeSettings: ThemeDialogProps['shapeSettings'];
};

export function ThemeSettingsDialog({ open, lightPalette, darkPalette, onLightPaletteChange, onDarkPaletteChange, shapeSettings, onShapeSettingsChange, onClose }: ThemeDialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ThemeDraft>({ lightPalette, darkPalette, shapeSettings });

  useEffect(() => {
    if (open) setDraft({ lightPalette, darkPalette, shapeSettings });
  }, [open, lightPalette, darkPalette, shapeSettings]);

  const paletteLabels: Record<PaletteName, string> = {
    blue: t('theme.bluePalette'),
    green: t('theme.greenPalette'),
    slate: t('theme.slatePalette'),
  };
  const palettes = Object.keys(paletteLabels) as PaletteName[];
  const radiusOptions = [
    { value: 3, label: t('theme.radiusCompact') },
    { value: 4, label: t('theme.radiusStandard') },
    { value: 5, label: t('theme.radiusMedium') },
    { value: 6, label: t('theme.radiusExpanded') },
    { value: 10, label: t('theme.radiusSoft') },
  ];
  const updateShape = (key: keyof ThemeDraft['shapeSettings']) => (value: number) => setDraft((current) => ({ ...current, shapeSettings: { ...current.shapeSettings, [key]: value } }));
  const handleCancel = () => {
    setDraft({ lightPalette, darkPalette, shapeSettings });
    onClose();
  };
  const handleApply = () => {
    onLightPaletteChange(draft.lightPalette);
    onDarkPaletteChange(draft.darkPalette);
    onShapeSettingsChange(draft.shapeSettings);
    onClose();
  };
  const palettePicker = (mode: 'light' | 'dark', value: PaletteName, onChange: (palette: PaletteName) => void) => (
    <RadioGroup value={value} onChange={(event) => onChange(event.target.value as PaletteName)} aria-label={mode === 'light' ? t('theme.lightPalette') : t('theme.darkPalette')}>
      <Stack className="theme-palette-grid" direction="row" spacing={1} useFlexGap>
        {palettes.map((palette) => {
          const tokens = getPaletteTokens(mode, palette);
          return <Box key={`${mode}-${palette}`} component="label" className={`theme-palette-option ${value === palette ? 'is-selected' : ''}`}>
            <Radio value={palette} aria-label={paletteLabels[palette]} />
            <Box className="theme-palette-swatches"><Box className="theme-palette-swatch" sx={{ bgcolor: tokens.primary }} /><Box className="theme-palette-swatch" sx={{ bgcolor: tokens.soft }} /></Box>
            <Typography variant="caption">{paletteLabels[palette]}</Typography>
          </Box>;
        })}
      </Stack>
    </RadioGroup>
  );

  return (
    <Dialog className="theme-settings-dialog" open={open} onClose={handleCancel} fullWidth maxWidth="xs">
      <DialogTitle>{t('theme.settings')}</DialogTitle>
      <DialogContent>
        <Box className="theme-settings-content">
          <Box className="theme-settings-section">
            <Typography className="theme-settings-section-title" variant="subtitle2">{t('theme.colors')}</Typography>
            <Typography className="theme-settings-section-label" variant="caption" color="text.secondary">{t('theme.lightPalette')}</Typography>
            {palettePicker('light', draft.lightPalette, (palette) => setDraft((current) => ({ ...current, lightPalette: palette })))}
            <Typography className="theme-settings-section-label" variant="caption" color="text.secondary">{t('theme.darkPalette')}</Typography>
            {palettePicker('dark', draft.darkPalette, (palette) => setDraft((current) => ({ ...current, darkPalette: palette })))}
          </Box>
          <Box className="theme-settings-section">
            <Typography className="theme-settings-section-title" variant="subtitle2">{t('theme.shape')}</Typography>
            <Stack className="theme-settings-shape-grid" spacing={1}>
              {([[t('theme.controlRadius'), 'controlRadius'], [t('theme.buttonRadius'), 'buttonRadius'], [t('theme.popupRadius'), 'popupRadius']] as const).map(([label, key]) => <FormControl key={key} size="small" fullWidth>
                <InputLabel>{label}</InputLabel><Select value={draft.shapeSettings[key]} label={label} onChange={(event) => updateShape(key)(Number(event.target.value))}>{radiusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select>
              </FormControl>)}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('theme.cancel')}</Button>
        <Button variant="contained" onClick={handleApply}>{t('theme.apply')}</Button>
      </DialogActions>
    </Dialog>
  );
}
