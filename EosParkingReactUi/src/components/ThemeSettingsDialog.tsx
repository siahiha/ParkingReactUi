import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from '@mui/material';
import { Box } from '@mui/material';
import type { PaletteName, ThemeDialogProps } from './homeProfileTypes';
import { getPaletteTokens } from '../theme';

export function ThemeSettingsDialog({ open, labels, lightPalette, darkPalette, onLightPaletteChange, onDarkPaletteChange, shapeSettings, onShapeSettingsChange, onClose }: ThemeDialogProps) {
  const paletteLabels: Record<PaletteName, string> = {
    blue: labels.bluePalette,
    green: labels.greenPalette,
    slate: labels.slatePalette,
  };
  const palettes = Object.keys(paletteLabels) as PaletteName[];
  const radiusOptions = [{ value: 3, label: labels.radiusCompact ?? 'Compact' }, { value: 6, label: labels.radiusStandard ?? 'Standard' }, { value: 10, label: labels.radiusSoft ?? 'Soft' }];
  const updateShape = (key: keyof typeof shapeSettings) => (value: number) => onShapeSettingsChange({ ...shapeSettings, [key]: value });
  const palettePicker = (mode: 'light' | 'dark', value: PaletteName, onChange: (palette: PaletteName) => void) => (
    <RadioGroup value={value} onChange={(event) => onChange(event.target.value as PaletteName)} aria-label={mode === 'light' ? labels.lightPalette : labels.darkPalette}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {palettes.map((palette) => {
          const tokens = getPaletteTokens(mode, palette);
          return <Box key={`${mode}-${palette}`} component="label" className={`theme-palette-option ${value === palette ? 'is-selected' : ''}`}>
            <Radio value={palette} aria-label={paletteLabels[palette]} sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
            <Box className="theme-palette-swatches"><Box className="theme-palette-swatch" sx={{ bgcolor: tokens.primary }} /><Box className="theme-palette-swatch" sx={{ bgcolor: tokens.soft }} /></Box>
            <Typography variant="caption">{paletteLabels[palette]}</Typography>
          </Box>;
        })}
      </Stack>
    </RadioGroup>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{labels.themeSettings}</DialogTitle>
      <DialogContent>
        <Box className="form-field-column" sx={{ mt: 1 }}>
          <Typography variant="subtitle2">{labels.themeColors ?? labels.themeSettings}</Typography>
          <Typography variant="caption" color="text.secondary">{labels.lightPalette}</Typography>
          {palettePicker('light', lightPalette, onLightPaletteChange)}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>{labels.darkPalette}</Typography>
          {palettePicker('dark', darkPalette, onDarkPaletteChange)}
          <Typography variant="subtitle2" sx={{ mt: 2 }}>{labels.themeShape ?? 'Shape'}</Typography>
          <Stack spacing={1}>
            {([[labels.controlRadius ?? 'Control radius', 'controlRadius'], [labels.buttonRadius ?? 'Button radius', 'buttonRadius'], [labels.popupRadius ?? 'Popup radius', 'popupRadius']] as const).map(([label, key]) => <FormControl key={key} size="small" fullWidth>
              <InputLabel>{label}</InputLabel><Select value={shapeSettings[key]} label={label} onChange={(event) => updateShape(key)(Number(event.target.value))}>{radiusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</Select>
            </FormControl>)}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions><Button variant="contained" onClick={onClose}>{labels.close}</Button></DialogActions>
    </Dialog>
  );
}
