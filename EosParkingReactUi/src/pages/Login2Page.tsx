import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { translations, type Language } from '../i18n';
import { useLogin } from '../features/auth/useLogin';
import { beginSsoLogin } from '../features/auth/sso';
import { appConfig } from '../config';
import type { LoginResult } from '../features/auth/authService';
import { ParkingControlLogo } from '../components/ParkingControlLogo';

type Props = { language: Language; toggleLanguage: () => void; onAuthenticated: (session: LoginResult) => void };
type FormErrors = { username?: string; password?: string };
const rememberedUsernameKey = 'eos-parking-remembered-username';

const copy = {
  fa: {
    headlineMain: 'پارکینگ',
    headlineSecondary: 'مدیریت هوشمند تردد',
    description: 'شرکت علم و صنعت',
    live: 'سامانه آنلاین است',
    capacity: 'امنیت و دسترسی',
    slots: 'دقت و سرعت',
    protected: 'مدیریت و یکپارچگی',
    access: 'برای ورود به داشبورد عملیاتی اطلاعات خود را وارد کنید.',
    usernameHint: 'نام کاربری سازمانی',
    passwordHint: 'رمز عبور خود را وارد کنید',
    secure: 'مرکز کنترل پارکینگ',
    ssoStarting: 'در حال آماده‌سازی ورود یکپارچه…',
    ssoFailed: 'راه‌اندازی ورود یکپارچه با مشکل روبه‌رو شد.',
    login: 'ورود به سیستم',
    checking: 'در حال بررسی دسترسی...',
    footer: 'EOS Parking OS  •  مدیریت هوشمند پارکینگ',
  },
  en: {
    headlineMain: 'Parking',
    headlineSecondary: 'management system',
    description: 'Elmosanat Company',
    live: 'System online',
    capacity: 'Security and access',
    slots: 'Accuracy and speed',
    protected: 'Management and integrity',
    access: 'Enter your details to open the operations dashboard.',
    usernameHint: 'Your organization username',
    passwordHint: 'Enter your password',
    secure: 'Parking Control Center',
    ssoStarting: 'Preparing single sign-on…',
    ssoFailed: 'Single sign-on could not be started.',
    login: 'Sign in',
    checking: 'Checking access...',
    footer: 'EOS Parking OS  •  Smart parking management',
  },
} as const;

export function Login2Page({ language, toggleLanguage, onAuthenticated }: Props) {
  const t = translations[language];
  const c = copy[language];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiMessage, setApiMessage] = useState('');
  const loginRequest = useLogin({ invalid: t.loginInvalid, requestFailed: t.loginRequestFailed });
  const ssoStarted = useRef(false);

  useEffect(() => {
    const rememberedUsername = window.localStorage.getItem(rememberedUsernameKey);
    if (rememberedUsername) { setUsername(rememberedUsername); setRememberMe(true); }
  }, []);

  useEffect(() => {
    if (!appConfig.ssoUiBaseUrl.trim() || ssoStarted.current) return;
    ssoStarted.current = true;
    void beginSsoLogin().catch(() => setApiMessage(c.ssoFailed));
  }, [c.ssoFailed]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiMessage('');
    const nextErrors: FormErrors = {};
    if (!username.trim()) nextErrors.username = t.usernameRequired;
    if (!password) nextErrors.password = t.passwordRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const result = await loginRequest.submit(username.trim(), password);
    if (!result) { setApiMessage(loginRequest.error || t.loginInvalid); return; }
    if (rememberMe) window.localStorage.setItem(rememberedUsernameKey, username.trim());
    else window.localStorage.removeItem(rememberedUsernameKey);
    onAuthenticated(result);
  };

  if (appConfig.ssoUiBaseUrl.trim()) {
    return <Box className="login2-page" dir={t.direction}>
      <Box className="login2-topbar"><Box className="login2-logo"><ParkingControlLogo className="parking-control-logo" /><span>EOS</span></Box><Button className="login2-language" onClick={toggleLanguage} startIcon={<TranslateRoundedIcon />} aria-label={t.languageName}>{t.languageName}</Button></Box>
      <Paper className="login2-sso-card" elevation={0}><Box className="login2-lock"><ShieldRoundedIcon /></Box><Typography component="h1" variant="h1">{t.title}</Typography><Typography color="text.secondary">{c.ssoStarting}</Typography>{apiMessage ? <Alert severity="error">{apiMessage}</Alert> : <CircularProgress size={24} />}</Paper>
    </Box>;
  }

  return <Box className="login2-page" dir={t.direction}>
    <Box className="login2-grid" aria-hidden="true" />
    <Box className="login2-orbit login2-orbit-one" aria-hidden="true" />
    <Box className="login2-orbit login2-orbit-two" aria-hidden="true" />
    <Box className="login2-topbar">
      <Box className="login2-topbar-actions"><Button className="login2-language" onClick={toggleLanguage} startIcon={<TranslateRoundedIcon />} aria-label={t.languageName}>{t.languageName}</Button></Box>
    </Box>
    <Box className="login2-content">
      <Box className="login2-story">
        <Typography component="h1" className="login2-headline"><span className="login2-headline-main">{c.headlineMain}</span><span className="login2-headline-secondary">{c.headlineSecondary}</span></Typography>
        <Typography className="login2-description">{c.description}</Typography>
        <Box className="login2-stats"><Box className="login2-stat-item"><ShieldRoundedIcon /><Typography>{c.capacity}</Typography></Box><Box className="login2-stat-item"><SpeedRoundedIcon /><Typography>{c.slots}</Typography></Box><Box className="login2-stat-item login2-stat-status"><LockRoundedIcon /><Typography>{c.protected}</Typography></Box></Box>
        <Box className="login2-visual" aria-hidden="true">
          <Box className="login2-map-toolbar"><Typography>LIVE PARKING MAP</Typography><Box><span /> OPEN</Box></Box>
          <Box className="login2-entry-lane"><Typography>ENTRY</Typography><ArrowForwardRoundedIcon /></Box>
          <Box className="login2-map-gate"><Box className="login2-map-gate-post" /><Box className="login2-map-gate-arm" /><Box className="login2-map-gate-beacon" /><Typography>GATE 01</Typography></Box>
          <Box className="login2-map-parking-grid">{['A1', 'A2', 'A3', 'B1', 'B2', 'B3'].map((bay, index) => <Box key={bay} className={`login2-map-bay ${index === 1 || index === 4 ? 'is-available' : ''} ${index === 2 ? 'is-active' : ''}`}><Typography>{bay}</Typography></Box>)}</Box>
          <Box className="login2-map-sensor login2-map-sensor-one"><SensorsRoundedIcon /></Box><Box className="login2-map-sensor login2-map-sensor-two"><SensorsRoundedIcon /></Box>
          <Typography className="login2-map-zone-label">ZONE A  /  LEVEL 01</Typography>
        </Box>
      </Box>
      <Paper className="login2-card" elevation={0}>
        <Box className="login2-card-top"><Box className="login2-card-icon"><ParkingControlLogo className="parking-control-logo" /></Box><Typography className="login2-card-kicker">{c.secure}</Typography></Box>
        <Typography className="login2-form-description">{c.access}</Typography>
        <Box component="form" onSubmit={submit} noValidate className="login2-form">
          {apiMessage && <Alert severity="error">{apiMessage}</Alert>}
          <TextField data-testid="login2-username" label={t.username} placeholder={c.usernameHint} value={username} onChange={(event) => { setUsername(event.target.value); if (errors.username) setErrors((current) => ({ ...current, username: undefined })); }} error={Boolean(errors.username)} helperText={errors.username} autoComplete="username" autoFocus slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login2-username-input' } }} />
          <TextField data-testid="login2-password" label={t.password} placeholder={c.passwordHint} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); if (errors.password) setErrors((current) => ({ ...current, password: undefined })); }} error={Boolean(errors.password)} helperText={errors.password} autoComplete="current-password" slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login2-password-input' }, input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((visible) => !visible)} onMouseDown={(event) => event.preventDefault()} aria-label={showPassword ? t.hidePassword : t.showPassword} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> } }} />
          <Box className="login2-form-options"><FormControlLabel control={<Checkbox checked={rememberMe} onChange={(event) => { const checked = event.target.checked; setRememberMe(checked); if (!checked) window.localStorage.removeItem(rememberedUsernameKey); }} />} label={t.rememberMe} /><Typography className="login2-recovery"><LockRoundedIcon /> {c.protected.split(' ')[0]}</Typography></Box>
          <Button data-testid="login2-submit" type="submit" className="login2-submit" variant="contained" size="large" endIcon={loginRequest.loading ? <CircularProgress size={18} color="inherit" /> : null} disabled={loginRequest.loading}>{loginRequest.loading ? c.checking : c.login}</Button>
        </Box>
        <Typography className="login2-footer">{c.footer}</Typography>
      </Paper>
    </Box>
  </Box>;
}
