import { useState } from 'react';
import { AppBar, Box, Button, Divider, FormControl, IconButton, InputBase, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
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
  onNavigationClose: () => void;
  onNavigationToggle: () => void;
  sidebarCollapsed: boolean;
  mobileNavigationOpen: boolean;
  navigationLabel: string;
  navigationToggleLabel: string;
  navigationMode: NavigationMode;
  navigationModeLabel: string;
  onNavigationModeChange: (mode: NavigationMode) => void;
  direction: 'rtl' | 'ltr';
};

export function HomeHeader({ labels: t, user, themeMode, lightPalette, darkPalette, shapeSettings, onShapeSettingsChange, onThemeToggle, onLightPaletteChange, onDarkPaletteChange, onLogout, onToggleLanguage, parkingOptions, selectedParkingId, onParkingChange, onHome, onNavigationOpen, onNavigationClose, onNavigationToggle, sidebarCollapsed, mobileNavigationOpen, navigationLabel, navigationToggleLabel, navigationMode, navigationModeLabel, onNavigationModeChange, direction }: Props) {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileDialog, setProfileDialog] = useState<'password' | 'theme' | null>(null);
  const isMobile = useMediaQuery('(max-width:899px)');
  const { values, setValues, message, messageSeverity, saving, save, resetMessage } = useChangePassword(user, t);
  const showNavigationBrand = isMobile ? mobileNavigationOpen : !sidebarCollapsed;
  return <AppBar position="static" color="transparent" elevation={0} className="home-header" dir={direction}>
    <Toolbar className="home-toolbar" dir={direction}>
      {showNavigationBrand ? <Box className="home-sidebar-brand-box">
        <Box component="img" className="home-sidebar-brand-image" src="/parking-logo.png" alt="" />
        <Typography className="home-sidebar-brand-title">{t.app}</Typography>
        <Tooltip title={t.collapseNavigation}>
          <IconButton className="home-sidebar-collapse-button" onClick={isMobile ? onNavigationClose : onNavigationToggle} aria-label={t.collapseNavigation}>
            <MenuOpenRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box> : !isMobile && <Box className="home-sidebar-mini-header">
        <Tooltip title={navigationToggleLabel} placement={direction === 'rtl' ? 'left' : 'right'}>
          <IconButton className="home-sidebar-open-button" onClick={onNavigationToggle} aria-label={navigationToggleLabel}>
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>}
      <Box className="home-toolbox-search" role="search"><SearchRoundedIcon aria-hidden="true" /><InputBase readOnly placeholder={t.selectCurrentParking} inputProps={{ 'aria-label': t.selectCurrentParking }} /></Box>
      <FormControl size="small" className="home-header-parking-select"><Select value={selectedParkingId} onChange={(event) => onParkingChange(Number(event.target.value))} displayEmpty inputProps={{ 'aria-label': t.selectCurrentParking }}>{parkingOptions.map((parking) => <MenuItem key={parking.id} value={parking.id}>{parking.name}</MenuItem>)}</Select></FormControl>
      <Box className="home-user-area">
        <Tooltip title={t.home} arrow><Button size="small" variant="outlined" className="home-header-action home-header-home-button" onClick={onHome} aria-label={t.home}><HomeRoundedIcon /></Button></Tooltip>
        <Tooltip title={themeMode === 'light' ? t.nightMode : t.dayMode} arrow><IconButton className="home-header-theme-toggle" onClick={onThemeToggle} aria-label={themeMode === 'light' ? t.nightMode : t.dayMode}>{themeMode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}</IconButton></Tooltip>
        <Tooltip title={`${t.user}: ${user.userName}`} arrow><Button size="small" variant="outlined" className="home-header-action home-user-menu-trigger" onClick={(event) => setUserMenuAnchor(event.currentTarget)} aria-label={`${t.user}: ${user.userName}`} aria-controls={userMenuAnchor ? 'user-profile-menu' : undefined} aria-haspopup="true" aria-expanded={userMenuAnchor ? 'true' : undefined}><AccountCircleRoundedIcon className="home-user-account-icon" /><ExpandMoreRoundedIcon className={`${userMenuAnchor ? 'open ' : ''}home-user-menu-arrow`} /></Button></Tooltip>
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
      {isMobile && !mobileNavigationOpen && <Tooltip title={navigationLabel} arrow><IconButton className="home-header-navigation-button" dir={direction} onClick={onNavigationOpen} aria-label={navigationLabel}><MenuRoundedIcon /></IconButton></Tooltip>}
    </Toolbar>
  </AppBar>;
}
