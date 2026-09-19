import type { Dispatch, SetStateAction } from 'react';
import type { ThemeShapeSettings } from '../theme';

export type PasswordValues = { current: string; next: string; confirm: string };
export type PaletteName = 'blue' | 'green' | 'slate';
export type ProfileDialogLabels = {
  changePassword: string; themeTitle: string; themeSettings: string; close: string; save: string; saving: string;
  currentPassword: string; newPassword: string; confirmPassword: string; passwordMismatch: string;
  lightPalette: string; darkPalette: string; bluePalette: string; greenPalette: string; slatePalette: string;
  themeColors?: string; themeShape?: string; controlRadius?: string; buttonRadius?: string; popupRadius?: string;
  radiusCompact?: string; radiusStandard?: string; radiusSoft?: string;
};
export type PasswordDialogProps = {
  open: boolean;
  labels: ProfileDialogLabels;
  values: PasswordValues;
  setValues: Dispatch<SetStateAction<PasswordValues>>;
  message: string;
  messageSeverity: 'info' | 'success' | 'error';
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
};
export type ThemeDialogProps = {
  open: boolean;
  labels: ProfileDialogLabels;
  lightPalette: PaletteName;
  darkPalette: PaletteName;
  onLightPaletteChange: (palette: PaletteName) => void;
  onDarkPaletteChange: (palette: PaletteName) => void;
  shapeSettings: ThemeShapeSettings;
  onShapeSettingsChange: (settings: ThemeShapeSettings) => void;
  onClose: () => void;
};
