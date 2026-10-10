import { useState } from 'react';
import { AppBar, Avatar, Box, Divider, FormControl, IconButton, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { ThemeSettingsDialog } from '../components/ThemeSettingsDialog';
import type { PaletteName } from '../components/homeProfileTypes';
import { useChangePassword } from '../hooks/useChangePassword';
import type { HomeLabels } from './homeCopy';
import type { HomeUser, ThemeMode } from './homeTypes';
import type { ThemeShapeSettings } from '../theme';

export type NavigationMode = 'tabs' | 'classic';

type Props = {
  labels: HomeLabels;
  user: HomeUser;
  themeMode: ThemeMode;
  lightPalette: PaletteName;
  darkPalette: PaletteName;
  shapeSettings: ThemeShapeSettings;
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
  navigationMode: NavigationMode;
  navigationModeLabel: string;
  onNavigationModeChange: (mode: NavigationMode) => void;
  direction: 'rtl' | 'ltr';
};

export function HomeHeader({ labels: t, user, themeMode, lightPalette, darkPalette, shapeSettings, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, onHome, onNavigationOpen, onNavigationToggle, navigationLabel, navigationToggleLabel, navigationMode, navigationModeLabel, onNavigationModeChange, direction }: Props) {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialog, setProfileDialog] = useState<'password' | 'theme' | null>(null);
  const isMobile = useMediaQuery('(max-width:899px)');
  const { values, setValues, message, messageSeverity, saving, save, resetMessage } = useChangePassword(user, t);
  return <AppBar position="static" color="transparent" elevation={0} className="home-header" dir={direction}>
    <Toolbar className="home-toolbar" dir={direction}>
      <Box className="home-header-navigation-and-parking">
        <Tooltip title={isMobile ? navigationLabel : navigationToggleLabel} arrow><IconButton className="home-header-utility-button home-header-navigation-button" onClick={isMobile ? onNavigationOpen : onNavigationToggle} aria-label={isMobile ? navigationLabel : navigationToggleLabel}><MenuRoundedIcon /></IconButton></Tooltip>
        <Box className="home-header-parking-control"><FormControl size="small" className="home-header-parking-select"><Select value={parkingOptions.some((parking) => parking.id === selectedParkingId) ? selectedParkingId : ''} onChange={(event) => onParkingChange(Number(event.target.value))} displayEmpty disabled={parkingOptions.length === 0} inputProps={{ 'aria-label': t.selectCurrentParking }}><MenuItem value="" disabled>{t.selectCurrentParking}</MenuItem>{parkingOptions.map((parking) => <MenuItem key={parking.id} value={parking.id}>{parking.name}</MenuItem>)}</Select></FormControl></Box>
      </Box>
      <Box className="home-header-middle-tools">
        <Tooltip title={t.selectCurrentParking} arrow><IconButton className="home-header-utility-button home-header-search-button" aria-label={t.selectCurrentParking}><SearchRoundedIcon /></IconButton></Tooltip>
      </Box>
      <Box className="home-user-area home-header-primary-actions">
        <Tooltip title={t.home} arrow><IconButton className="home-header-utility-button" onClick={onHome} aria-label={t.home}><HomeRoundedIcon /></IconButton></Tooltip>
        <Tooltip title={themeMode === 'light' ? t.nightMode : t.dayMode} arrow><IconButton className="home-header-utility-button" onClick={onThemeToggle} aria-label={themeMode === 'light' ? t.nightMode : t.dayMode}>{themeMode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton></Tooltip>
        <Tooltip title={`${t.user}: ${user.userName}`} arrow><IconButton className="home-header-avatar-button" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={`${t.user}: ${user.userName}`} aria-controls={userMenuAnchor ? 'user-profile-menu' : undefined} aria-haspopup="true" aria-expanded={userMenuAnchor ? 'true' : undefined}><Avatar className="home-header-avatar"><AccountCircleRoundedIcon /></Avatar></IconButton></Tooltip>
      </Box>
      <Box className="home-header-user-menu">
        <Menu id="user-profile-menu" anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'right' : 'left' }} transformOrigin={{ vertical: 'top', horizontal: direction === 'rtl' ? 'right' : 'left' }}>
          <MenuItem onClick={() => { setUserMenuAnchor(null); resetMessage(); setProfileDialog('password'); }}><ListItemIcon><KeyRoundedIcon fontSize="small" /></ListItemIcon>{t.changePassword}</MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); setProfileDialog('theme'); }}><ListItemIcon><PaletteRoundedIcon fontSize="small" /></ListItemIcon>{t.themeSettings}</MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); onNavigationModeChange(navigationMode === 'tabs' ? 'classic' : 'tabs'); }}><ListItemIcon><SwapHorizRoundedIcon fontSize="small" /></ListItemIcon>{navigationModeLabel}</MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); onToggleLanguage(); }}><ListItemIcon><TranslateRoundedIcon fontSize="small" /></ListItemIcon>{t.changeLanguage}</MenuItem>
          <Divider />
          <MenuItem onClick={() => { setUserMenuAnchor(null); onLogout(); }}><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>{t.logout}</MenuItem>
        </Menu>
        <ChangePasswordDialog open={profileDialog === 'password'} labels={t} values={values} setValues={setValues} message={message} messageSeverity={messageSeverity} saving={saving} onSave={() => void save()} onClose={() => setProfileDialog(null)} />
        <ThemeSettingsDialog open={profileDialog === 'theme'} labels={t} lightPalette={lightPalette} darkPalette={darkPalette} shapeSettings={shapeSettings} onShapeSettingsChange={onShapeSettingsChange} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onClose={() => setProfileDialog(null)} />
      </Box>
    </Toolbar>
  </AppBar>;
}
