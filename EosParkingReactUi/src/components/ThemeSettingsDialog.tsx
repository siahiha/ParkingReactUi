import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { Box } from '@mui/material';
import type { PaletteName, ThemeDialogProps } from './homeProfileTypes';

export function ThemeSettingsDialog({ open, labels, lightPalette, darkPalette, onLightPaletteChange, onDarkPaletteChange, onClose }: ThemeDialogProps) {
  const paletteLabels: Record<PaletteName, string> = {
    blue: labels.bluePalette,
    green: labels.greenPalette,
    slate: labels.slatePalette,
  };
  const palettes = Object.keys(paletteLabels) as PaletteName[];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{labels.themeTitle}</DialogTitle>
      <DialogContent>
        <Box className="form-field-column" sx={{ mt: 1 }}>
          <Typography variant="subtitle2">{labels.lightPalette}</Typography>
          <RadioGroup value={lightPalette} onChange={(event) => onLightPaletteChange(event.target.value as PaletteName)}>
            {palettes.map((palette) => <FormControlLabel key={`light-${palette}`} value={palette} control={<Radio />} label={paletteLabels[palette]} />)}
          </RadioGroup>
          <Typography variant="subtitle2">{labels.darkPalette}</Typography>
          <RadioGroup value={darkPalette} onChange={(event) => onDarkPaletteChange(event.target.value as PaletteName)}>
            {palettes.map((palette) => <FormControlLabel key={`dark-${palette}`} value={palette} control={<Radio />} label={paletteLabels[palette]} />)}
          </RadioGroup>
        </Box>
      </DialogContent>
      <DialogActions><Button variant="contained" onClick={onClose}>{labels.close}</Button></DialogActions>
    </Dialog>
  );
}
