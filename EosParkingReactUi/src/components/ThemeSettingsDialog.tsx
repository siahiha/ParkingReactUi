import { AppPopup } from './AppPopup';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, MenuItem, Radio, RadioGroup, Select, Typography } from '@mui/material';
import { Box } from '@mui/material';
import type { PaletteName, ThemeDialogProps } from './homeProfileTypes';
import { getPaletteTokens, paletteNames, themeTextColors } from '../theme';

type ThemeDraft = {
  palette: PaletteName;
  shapeSettings: ThemeDialogProps['shapeSettings'];
};

export function ThemeSettingsDialog({ open, palette, onPaletteChange, shapeSettings, onShapeSettingsChange, onClose }: ThemeDialogProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ThemeDraft>({ palette, shapeSettings });

  useEffect(() => {
    if (open) setDraft({ palette, shapeSettings });
  }, [open, palette, shapeSettings]);

  const paletteLabels: Record<PaletteName, string> = {
    blue: t('theme.bluePalette'),
    green: t('theme.greenPalette'),
    violet: t('theme.violetPalette'),
    amber: t('theme.amberPalette'),
    rose: t('theme.rosePalette'),
    slate: t('theme.slatePalette'),
  };

  const radiusOptions = [
    { value: 3, label: t('theme.radiusCompact') },
    { value: 4, label: t('theme.radiusStandard') },
    { value: 5, label: t('theme.radiusMedium') },
    { value: 6, label: t('theme.radiusExpanded') },
    { value: 10, label: t('theme.radiusSoft') },
  ];
  const updateShape = (key: keyof ThemeDraft['shapeSettings']) => (value: number) => setDraft((current) => ({ ...current, shapeSettings: { ...current.shapeSettings, [key]: value } }));
  const handleCancel = () => {
    setDraft({ palette, shapeSettings });
    onClose();
  };
  const handleApply = () => {
    onPaletteChange(draft.palette);
    onShapeSettingsChange(draft.shapeSettings);
    onClose();
  };

  return (
    <AppPopup helpTopicId="home" open={open} onClose={handleCancel} onConfirm={handleApply} maxWidth="sm"
      title={t('theme.settings')} cancelLabel={t('theme.cancel')} confirmLabel={t('theme.apply')}>
        <Box className="theme-settings-content" sx={(theme) => ({
          '--app-primary': theme.palette.primary.main,
          '--app-surface': theme.palette.background.paper,
          '--app-shell': theme.palette.background.default,
          '--app-text': theme.palette.text.primary,
          '--app-divider': theme.palette.divider,
          '--app-control-radius': `${shapeSettings.controlRadius}px`,
          '--app-button-radius': `${shapeSettings.buttonRadius}px`,
        })}>
          <Box className="theme-settings-section">
            <Typography className="theme-settings-section-title" variant="subtitle2">{t('theme.colors')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('theme.automaticNight')}</Typography>
            <RadioGroup value={draft.palette} onChange={(event) => setDraft((current) => ({ ...current, palette: event.target.value as PaletteName }))} aria-label={t('theme.palette')}>
              <Box className="theme-palette-grid">
                {paletteNames.map((name) => <Box key={name} component="label" className={`theme-palette-option ${draft.palette === name ? 'is-selected' : ''}`}>
                  <Radio value={name} slotProps={{ input: { 'aria-label': paletteLabels[name] } }} />
                  <Box className="theme-palette-pair" aria-hidden="true">
                    {(['light', 'dark'] as const).map((mode) => {
                      const tokens = getPaletteTokens(mode, name);
                      return <Box key={mode} className="theme-palette-preview" sx={{ bgcolor: tokens.shell, color: themeTextColors[mode].primary }}>
                        <Box className="theme-palette-preview-bar" sx={{ bgcolor: tokens.primary }} />
                        <Box className="theme-palette-preview-line" sx={{ bgcolor: tokens.border }} />
                        <Typography variant="caption">{t(mode === 'light' ? 'theme.dayMode' : 'theme.nightMode')}</Typography>
                      </Box>;
                    })}
                  </Box>
                  <Typography variant="body2">{paletteLabels[name]}</Typography>
                </Box>)}
              </Box>
            </RadioGroup>
          </Box>
          <Box className="theme-settings-section">
            <Typography className="theme-settings-section-title" variant="subtitle2">{t('theme.shape')}</Typography>
            <Box className="theme-settings-shape-grid">
              {([[t('theme.controlRadius'), 'controlRadius'], [t('theme.buttonRadius'), 'buttonRadius'], [t('theme.popupRadius'), 'popupRadius']] as const).map(([label, key]) => <FormControl key={key} size="small" fullWidth>
                <InputLabel>{label}</InputLabel><Select value={draft.shapeSettings[key]} label={label} onChange={(event) => updateShape(key)(Number(event.target.value))}>{radiusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select>
              </FormControl>)}
            </Box>
          </Box>
        </Box>
      </AppPopup>
  );
}
