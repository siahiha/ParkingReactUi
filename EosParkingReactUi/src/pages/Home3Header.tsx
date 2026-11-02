import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBar, Avatar, Box, Divider, FormControl, IconButton, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { ThemeSettingsDialog } from '../components/ThemeSettingsDialog';
import { ParkingControlLogo } from '../components/ParkingControlLogo';
import type { PaletteName } from '../components/homeProfileTypes';
import { useChangePassword } from '../hooks/useChangePassword';
import type { HomeUser, ThemeMode } from './homeTypes';
import type { ThemeShapeSettings } from '../theme';
import type { ProfileDialogLabels } from '../components/homeProfileTypes';

type Props = {
  user: HomeUser;
  direction: 'rtl' | 'ltr';
  themeMode: ThemeMode;
  lightPalette: PaletteName;
  darkPalette: PaletteName;
  shapeSettings: ThemeShapeSettings;
  themeSettingsEnabled: boolean;
  onShapeSettingsChange: (settings: ThemeShapeSettings) => void;
  onThemeToggle: () => void;
  onLightPaletteChange: (palette: PaletteName) => void;
  onDarkPaletteChange: (palette: PaletteName) => void;
  onLogout: () => void;
  onToggleLanguage: () => void;
  parkingOptions: Array<{ id: number; name: string }>;
  selectedParkingId: number;
  onParkingChange: (id: number) => void;
  onHome: () => void;
  onNavigationOpen: () => void;
  onNavigationToggle: () => void;
  isNavigationCollapsed: boolean;
  navigationMode: 'tabs' | 'classic';
  navigationModeLabel: string;
  onNavigationModeChange: (mode: 'tabs' | 'classic') => void;
};
type Home3Labels = ProfileDialogLabels & { app: string; home: string; user: string; nightMode: string; dayMode: string; changeLanguage: string; logout: string; passwordRequired: string; passwordError: string; passwordChanged: string };

export function Home3Header({ user, direction, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, onHome, onNavigationOpen, onNavigationToggle, isNavigationCollapsed, navigationMode, navigationModeLabel, onNavigationModeChange }: Props) {
  const { t } = useTranslation();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialog, setProfileDialog] = useState<'password' | 'theme' | null>(null);
  const isMobile = useMediaQuery('(max-width:899px)');
  const labels: Home3Labels = {
    app: t('home2.brandTitle'), home: t('home2.menuHome'), user: t('home2.profile'), nightMode: t('theme.nightMode'), dayMode: t('theme.dayMode'), changeLanguage: t('home2.language'), logout: t('home2.logout'),
    changePassword: t('profile.changePassword'), themeTitle: t('theme.settings'), themeSettings: t('theme.settings'), close: t('common.close'), save: t('common.save'), saving: t('profile.saving'), currentPassword: t('profile.currentPassword'), newPassword: t('profile.newPassword'), confirmPassword: t('profile.confirmPassword'), passwordMismatch: t('profile.passwordMismatch'), passwordRequired: t('profile.passwordRequired'), passwordError: t('profile.passwordError'), passwordChanged: t('profile.passwordChanged'), lightPalette: t('theme.lightPalette'), darkPalette: t('theme.darkPalette'), bluePalette: t('theme.bluePalette'), greenPalette: t('theme.greenPalette'), slatePalette: t('theme.slatePalette'),
  };
  const { values, setValues, message, messageSeverity, saving, save, resetMessage } = useChangePassword(user, labels);
  const selectedParking = parkingOptions.find((parking) => parking.id === selectedParkingId);
  const modeLabel = navigationModeLabel;
  const navigationLabel = t('home2.navigation');
  const navigationToggleLabel = isNavigationCollapsed ? t('home2.expand') : t('home2.collapse');

  return <AppBar className="home3-header" position="sticky" elevation={0} dir={direction}>
    <Toolbar className="home3-toolbar">
      <Box className="home3-brand"><Box className="home3-brand-mark"><ParkingControlLogo className="parking-control-logo home3-brand-logo" /></Box><Box><Typography className="home3-brand-kicker">{t('home2.brandKicker')}</Typography><Typography className="home3-brand-title">{labels.app}</Typography></Box></Box>
      <Tooltip title={isMobile ? navigationLabel : navigationToggleLabel} arrow><IconButton className="home3-menu-button" onClick={isMobile ? onNavigationOpen : onNavigationToggle} aria-label={isMobile ? navigationLabel : navigationToggleLabel}><MenuRoundedIcon /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem className="home3-header-divider" />
      <Box className="home3-context"><Typography className="home3-context-label">{t('home2.currentParking')}</Typography><FormControl size="small" className="home3-parking-select"><Select value={parkingOptions.some((parking) => parking.id === selectedParkingId) ? selectedParkingId : ''} onChange={(event) => onParkingChange(Number(event.target.value))} displayEmpty disabled={parkingOptions.length === 0} inputProps={{ 'aria-label': t('home2.chooseParking') }}><MenuItem value="" disabled>{t('home2.chooseParking')}</MenuItem>{parkingOptions.map((parking) => <MenuItem key={parking.id} value={parking.id}>{parking.name}</MenuItem>)}</Select></FormControl>{selectedParking && <Typography className="home3-parking-code" dir="ltr">P-{String(selectedParking.id).padStart(2, '0')}</Typography>}</Box>
      <Box className="home3-header-spacer" />
      <Tooltip title={labels.home} arrow><IconButton className="home3-action" onClick={onHome} aria-label={labels.home}><HomeRoundedIcon /></IconButton></Tooltip>
      {themeSettingsEnabled && <Tooltip title={themeMode === 'light' ? labels.nightMode : labels.dayMode} arrow><IconButton className="home3-action" onClick={onThemeToggle} aria-label={themeMode === 'light' ? labels.nightMode : labels.dayMode}>{themeMode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton></Tooltip>}
      <Tooltip title={`${labels.user}: ${user.userName}`} arrow><IconButton className="home3-profile" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={`${labels.user}: ${user.userName}`} aria-controls={userMenuAnchor ? 'home3-profile-menu' : undefined} aria-haspopup="true" aria-expanded={userMenuAnchor ? 'true' : undefined}><Avatar><AccountCircleRoundedIcon /></Avatar></IconButton></Tooltip>
      <Menu id="home3-profile-menu" anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'right' : 'left' }} transformOrigin={{ vertical: 'top', horizontal: direction === 'rtl' ? 'right' : 'left' }}>
        <MenuItem onClick={() => { setUserMenuAnchor(null); resetMessage(); setProfileDialog('password'); }}><ListItemIcon><KeyRoundedIcon fontSize="small" /></ListItemIcon>{labels.changePassword}</MenuItem>
        {themeSettingsEnabled && <MenuItem onClick={() => { setUserMenuAnchor(null); setProfileDialog('theme'); }}><ListItemIcon><PaletteRoundedIcon fontSize="small" /></ListItemIcon>{labels.themeSettings}</MenuItem>}
        <MenuItem onClick={() => { setUserMenuAnchor(null); onNavigationModeChange(navigationMode === 'tabs' ? 'classic' : 'tabs'); }}><ListItemIcon><SwapHorizRoundedIcon fontSize="small" /></ListItemIcon>{modeLabel}</MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); onToggleLanguage(); }}><ListItemIcon><TranslateRoundedIcon fontSize="small" /></ListItemIcon>{labels.changeLanguage}</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setUserMenuAnchor(null); onLogout(); }}><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>{labels.logout}</MenuItem>
      </Menu>
      <ChangePasswordDialog open={profileDialog === 'password'} labels={labels} values={values} setValues={setValues} message={message} messageSeverity={messageSeverity} saving={saving} onSave={() => void save()} onClose={() => setProfileDialog(null)} />
      <ThemeSettingsDialog open={themeSettingsEnabled && profileDialog === 'theme'} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={onShapeSettingsChange} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onClose={() => setProfileDialog(null)} />
    </Toolbar>
  </AppBar>;
}
