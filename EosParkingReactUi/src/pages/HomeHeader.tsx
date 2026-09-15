import { useState } from 'react';
import { AppBar, Box, Button, Divider, FormControl, IconButton, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip } from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { ThemeSettingsDialog } from '../components/ThemeSettingsDialog';
import type { PaletteName } from '../components/homeProfileTypes';
import { useChangePassword } from '../hooks/useChangePassword';
import type { HomeLabels } from './homeCopy';
import type { HomeUser, ThemeMode } from './homeTypes';

type Props = {
  labels: HomeLabels;
  user: HomeUser;
  themeMode: ThemeMode;
  lightPalette: PaletteName;
  darkPalette: PaletteName;
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
  navigationLabel: string;
};

export function HomeHeader({ labels: t, user, themeMode, lightPalette, darkPalette, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, onHome, onNavigationOpen, navigationLabel }: Props) {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialog, setProfileDialog] = useState<'password' | 'theme' | null>(null);
  const { values, setValues, message, messageSeverity, saving, save, resetMessage } = useChangePassword(user, t);
  return <AppBar position="static" color="transparent" elevation={0} className="home-header">
    <Toolbar className="home-toolbar">
      <FormControl size="small" className="home-header-parking-select"><Select value={selectedParkingId} onChange={(event) => onParkingChange(Number(event.target.value))} displayEmpty inputProps={{ 'aria-label': t.selectCurrentParking }}>{parkingOptions.map((parking) => <MenuItem key={parking.id} value={parking.id}>{parking.name}</MenuItem>)}</Select></FormControl>
      <Box className="home-user-area">
        <Tooltip title={t.home} arrow><Button size="small" variant="outlined" className="home-header-action home-header-home-button" onClick={onHome} aria-label={t.home}><HomeRoundedIcon /></Button></Tooltip>
        <Tooltip title={themeMode === 'light' ? t.nightMode : t.dayMode} arrow><IconButton className="home-header-theme-toggle" onClick={onThemeToggle} aria-label={themeMode === 'light' ? t.nightMode : t.dayMode}>{themeMode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton></Tooltip>
        <Tooltip title={`${t.user}: ${user.userName}`} arrow><Button size="small" variant="outlined" className="home-header-action home-user-menu-trigger" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={`${t.user}: ${user.userName}`} aria-controls={userMenuAnchor ? 'user-profile-menu' : undefined} aria-haspopup="true" aria-expanded={userMenuAnchor ? 'true' : undefined}><AccountCircleRoundedIcon className="home-user-account-icon" /><ExpandMoreRoundedIcon className={`${userMenuAnchor ? 'open ' : ''}home-user-menu-arrow`} /></Button></Tooltip>
        <Menu id="user-profile-menu" anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={() => { setUserMenuAnchor(null); resetMessage(); setProfileDialog('password'); }}><ListItemIcon><KeyRoundedIcon fontSize="small" /></ListItemIcon>{t.changePassword}</MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); setProfileDialog('theme'); }}><ListItemIcon><PaletteRoundedIcon fontSize="small" /></ListItemIcon>{t.themeSettings}</MenuItem>
          <MenuItem onClick={() => { setUserMenuAnchor(null); onToggleLanguage(); }}><ListItemIcon><TranslateRoundedIcon fontSize="small" /></ListItemIcon>{t.changeLanguage}</MenuItem>
          <Divider />
          <MenuItem onClick={() => { setUserMenuAnchor(null); onLogout(); }}><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>{t.logout}</MenuItem>
        </Menu>
        <ChangePasswordDialog open={profileDialog === 'password'} labels={t} values={values} setValues={setValues} message={message} messageSeverity={messageSeverity} saving={saving} onSave={() => void save()} onClose={() => setProfileDialog(null)} />
        <ThemeSettingsDialog open={profileDialog === 'theme'} labels={t} lightPalette={lightPalette} darkPalette={darkPalette} onLightPaletteChange={onLightPaletteChange} onDarkPaletteChange={onDarkPaletteChange} onClose={() => setProfileDialog(null)} />
      </Box>
      <Tooltip title={navigationLabel} arrow><IconButton className="home-header-navigation-button" onClick={onNavigationOpen} aria-label={navigationLabel}><MenuRoundedIcon /></IconButton></Tooltip>
    </Toolbar>
  </AppBar>;
}
