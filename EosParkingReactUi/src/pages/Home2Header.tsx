import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBar, Avatar, Box, Divider, FormControl, IconButton, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip, Typography } from '@mui/material';
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
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { ThemeSettingsDialog } from '../components/ThemeSettingsDialog';
import { useChangePassword } from '../hooks/useChangePassword';
import type { PaletteName } from '../components/homeProfileTypes';
import type { ThemeMode, ThemeShapeSettings } from '../theme';
import type { HomeLabels } from './homeCopy';
import type { HomeUser } from './homeTypes';

type Props = {
  labels: HomeLabels;
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
  navigationLabel: string;
  navigationToggleLabel: string;
  navigationMode: 'tabs' | 'classic';
  onNavigationModeChange: (mode: 'tabs' | 'classic') => void;
};

export function Home2Header({ labels, user, direction, themeMode, lightPalette, darkPalette, shapeSettings, themeSettingsEnabled, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, onHome, onNavigationOpen, onNavigationToggle, navigationLabel, navigationToggleLabel, navigationMode, onNavigationModeChange }: Props) {
  const { t } = useTranslation();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialog, setProfileDialog] = useState<'password' | 'theme' | null>(null);
  const { values, setValues, message, messageSeverity, saving, save, resetMessage } = useChangePassword(user, labels);
  const selectedParking = parkingOptions.find((parking) => parking.id === selectedParkingId);

  return <AppBar className="home2-header" position="sticky" elevation={0} dir={direction}>
    <Toolbar className="home2-toolbar">
      <Box className="home2-brand-lockup">
        <Box className="home2-brand-symbol" aria-hidden="true"><span>EO</span><span>S</span></Box>
        <Box className="home2-brand-copy"><Typography className="home2-brand-kicker">{t('home2.brandKicker')}</Typography><Typography className="home2-brand-title">{t('home2.brandTitle')}</Typography></Box>
      </Box>
      <Tooltip title={navigationToggleLabel} arrow><IconButton className="home2-menu-button home2-desktop-menu" onClick={onNavigationToggle} aria-label={navigationToggleLabel}><MenuRoundedIcon /></IconButton></Tooltip>
      <Tooltip title={navigationLabel} arrow><IconButton className="home2-menu-button home2-mobile-menu" onClick={onNavigationOpen} aria-label={navigationLabel}><MenuRoundedIcon /></IconButton></Tooltip>
      <Box className="home2-header-divider" />
      <Box className="home2-parking-context">
        <Typography className="home2-context-label">{t('home2.currentParking')}</Typography>
        <FormControl size="small" className="home2-parking-select">
          <Select value={parkingOptions.some((parking) => parking.id === selectedParkingId) ? selectedParkingId : ''} onChange={(event) => onParkingChange(Number(event.target.value))} displayEmpty inputProps={{ 'aria-label': t('home2.chooseParking') }}>
            <MenuItem value="" disabled>{t('home2.chooseParking')}</MenuItem>
            {parkingOptions.map((parking) => <MenuItem key={parking.id} value={parking.id}>{parking.name}</MenuItem>)}
          </Select>
        </FormControl>
        {selectedParking && <Typography className="home2-parking-id" dir="ltr">P-{String(selectedParking.id).padStart(2, '0')}</Typography>}
      </Box>
      <Box className="home2-header-spacer" />
      <Box className="home2-live-indicator"><RadioButtonCheckedRoundedIcon /><Box><Typography>{t('home2.online')}</Typography><Typography>{t('home2.lastSync')}</Typography></Box></Box>
      <Tooltip title={labels.home} arrow><IconButton className="home2-action-button" onClick={onHome} aria-label={labels.home}><HomeRoundedIcon /></IconButton></Tooltip>
      {themeSettingsEnabled && <Tooltip title={t('home2.appearance')} arrow><IconButton className="home2-action-button" onClick={onThemeToggle} aria-label={t('home2.appearance')}>{themeMode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton></Tooltip>}
      <Tooltip title={`${t('home2.profile')}: ${user.userName}`} arrow><IconButton className="home2-profile-button" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={`${t('home2.profile')}: ${user.userName}`} aria-controls={userMenuAnchor ? 'home2-profile-menu' : undefined} aria-haspopup="true" aria-expanded={userMenuAnchor ? 'true' : undefined}><Avatar><AccountCircleRoundedIcon /></Avatar></IconButton></Tooltip>
      <Menu id="home2-profile-menu" anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'right' : 'left' }} transformOrigin={{ vertical: 'top', horizontal: direction === 'rtl' ? 'right' : 'left' }}>
        <MenuItem onClick={() => { setUserMenuAnchor(null); resetMessage(); setProfileDialog('password'); }}><ListItemIcon><KeyRoundedIcon fontSize="small" /></ListItemIcon>{t('home2.changePassword')}</MenuItem>
        {themeSettingsEnabled && <MenuItem onClick={() => { setUserMenuAnchor(null); setProfileDialog('theme'); }}><ListItemIcon><PaletteRoundedIcon fontSize="small" /></ListItemIcon>{t('home2.theme')}</MenuItem>}
        <MenuItem onClick={() => { setUserMenuAnchor(null); onNavigationModeChange(navigationMode === 'tabs' ? 'classic' : 'tabs'); }}><ListItemIcon><SwapHorizRoundedIcon fontSize="small" /></ListItemIcon>{navigationMode === 'tabs' ? t('home2.modeClassic') : t('home2.modeTabs')}</MenuItem>
        <MenuItem onClick={() => { setUserMenuAnchor(null); onToggleLanguage(); }}><ListItemIcon><TranslateRoundedIcon fontSize="small" /></ListItemIcon>{t('home2.language')}</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setUserMenuAnchor(null); onLogout(); }}><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>{t('home2.logout')}</MenuItem>
      </Menu>
      <ChangePasswordDialog open={profileDialog === 'password'} labels={labels} values={values} setValues={setValues} message={message} messageSeverity={messageSeverity} saving={saving} onSave={() => void save()} onClose={() => setProfileDialog(null)} />
      <ThemeSettingsDialog open={themeSettingsEnabled && profileDialog === 'theme'} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={onShapeSettingsChange} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onClose={() => setProfileDialog(null)} />
    </Toolbar>
  </AppBar>;
}
