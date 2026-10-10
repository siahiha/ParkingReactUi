import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import { translations, type Language } from '../i18n';
import { useLogin } from '../features/auth/useLogin';
import { beginSsoLogin } from '../features/auth/sso';
import { appConfig } from '../config';
import type { HomeUser } from './homeTypes';

type Props = { language: Language; toggleLanguage: () => void; onAuthenticated: (session: { token: string | null; user: HomeUser }) => void };
type FormErrors = { username?: string; password?: string };
const rememberedUsernameKey = 'eos-parking-remembered-username';

function TopDownCarIcon() {
  return <svg viewBox="0 0 48 27" aria-hidden="true" focusable="false">
    <g fill="#0b2941">
      <rect x="11" y=".6" width="7" height="6" rx="1.6" />
      <rect x="30" y=".6" width="7" height="6" rx="1.6" />
      <rect x="11" y="20.4" width="7" height="6" rx="1.6" />
      <rect x="30" y="20.4" width="7" height="6" rx="1.6" />
    </g>
    <path d="M12 2.2h24c3 0 4.5 1.5 5.1 4.3l1.1 5.2v1.6l-1.1 5.2c-.6 2.8-2.1 4.3-5.1 4.3H12c-3 0-4.5-1.5-5.1-4.3L5.8 13.3v-1.6l1.1-5.2c.6-2.8 2.1-4.3 5.1-4.3Z" fill="#f7fbff" stroke="#a9c7dc" strokeWidth=".8" />
    <path d="M13.4 5h4.8v16h-4.8c-1.5 0-2.4-.7-3-2.1L8.6 13l1.8-5.9c.6-1.4 1.5-2.1 3-2.1Zm16.4 0h4.8c1.5 0 2.4.7 3 2.1l1.8 5.9-1.8 5.9c-.6 1.4-1.5 2.1-3 2.1h-4.8V5Z" fill="#91b1c5" />
    <path d="M19.4 4.5h9.2v17h-9.2z" fill="#dbe8ef" />
    <path d="M18.7 5v16m10.6-16v16" stroke="#163c5e" strokeWidth=".8" opacity=".75" />
    <path d="M40.4 7.3h1.4v2.8h-1.4zm0 8.6h1.4v2.8h-1.4z" fill="#e7c985" />
    <path d="M6.2 7.6h1.2v2.6H5.7l.5-2.6Zm0 8.2h1.2v2.6H5.7l.5-2.6Z" fill="#d77b72" />
    <g fill="#0b2941">
      <rect x="11" y=".6" width="7" height="6" rx="1.6" />
      <rect x="30" y=".6" width="7" height="6" rx="1.6" />
      <rect x="11" y="20.4" width="7" height="6" rx="1.6" />
      <rect x="30" y="20.4" width="7" height="6" rx="1.6" />
    </g>
    <g fill="#7994a7">
      <rect x="12.1" y="1.6" width="4.8" height="4" rx="1" />
      <rect x="31.1" y="1.6" width="4.8" height="4" rx="1" />
      <rect x="12.1" y="21.4" width="4.8" height="4" rx="1" />
      <rect x="31.1" y="21.4" width="4.8" height="4" rx="1" />
    </g>
  </svg>;
}

export function LoginPage({ language, toggleLanguage, onAuthenticated }: Props) {
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiMessage, setApiMessage] = useState('');
  const [apiMessageSeverity, setApiMessageSeverity] = useState<'info' | 'success' | 'error'>('info');
  const loginRequest = useLogin({ invalid: t.loginInvalid, requestFailed: t.loginRequestFailed });
  const ssoStarted = useRef(false);

  useEffect(() => {
    if (!appConfig.ssoBaseUrl.trim() || ssoStarted.current) return;
    ssoStarted.current = true;
    void beginSsoLogin().catch(() => {
      setApiMessage(t.loginSsoFailed);
      setApiMessageSeverity('error');
    });
  }, [t.loginSsoFailed]);

  useEffect(() => {
    const rememberedUsername = window.localStorage.getItem(rememberedUsernameKey);
    if (rememberedUsername) { setUsername(rememberedUsername); setRememberMe(true); }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiMessage('');
    const nextErrors: FormErrors = {};
    if (!username.trim()) nextErrors.username = t.usernameRequired;
    if (!password) nextErrors.password = t.passwordRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const result = await loginRequest.submit(username.trim(), password);
    if (!result) {
      setApiMessage(loginRequest.error || t.loginInvalid);
      setApiMessageSeverity('error');
      return;
    }
    const nextUser: HomeUser = result.user;
    if (rememberMe) window.localStorage.setItem(rememberedUsernameKey, username.trim()); else window.localStorage.removeItem(rememberedUsernameKey);
    onAuthenticated({ token: result.token, user: nextUser });
  };

  if (appConfig.ssoBaseUrl.trim()) {
    return <Box className="login-page login-page-sso" dir={t.direction}>
      <Box className="login-page-toolbar"><Button className="language-button" variant="text" size="small" onClick={toggleLanguage} startIcon={<TranslateRoundedIcon />} aria-label={t.languageName}>{t.languageName}</Button></Box>
      <Paper className="login-card" elevation={0}>
        <Box className="login-card-kicker"><ShieldRoundedIcon aria-hidden="true" /><Typography variant="caption">{t.secureAccess}</Typography></Box>
        <Typography component="h1" variant="h1" className="login-title">{t.title}</Typography>
        <Typography variant="body2" color="text.secondary" className="login-subtitle">{t.subtitle}</Typography>
        <Box className="login-sso-state" role={apiMessage ? undefined : 'status'} aria-live="polite">
          {apiMessage ? <Alert severity="error">{apiMessage}</Alert> : <><CircularProgress size={20} /><Typography variant="body2">{t.ssoStarting}</Typography></>}
        </Box>
      </Paper>
    </Box>;
  }

  return <Box className="login-page" dir={t.direction}>
    <Box className="login-ambient" aria-hidden="true"><Box className="login-ambient-line login-ambient-line-one" /><Box className="login-ambient-line login-ambient-line-two" /></Box>
    <Box className="login-page-toolbar"><Button className="language-button" variant="text" size="small" onClick={toggleLanguage} startIcon={<TranslateRoundedIcon />} aria-label={t.languageName}>{t.languageName}</Button></Box>
    <Box className="login-layout">
      <Box className="login-showcase">
        <Box className="showcase-brand">
          <Box className="showcase-brand-mark" aria-hidden="true"><LocalParkingRoundedIcon /></Box>
          <Box><Typography className="showcase-brand-name">EOS</Typography><Typography className="showcase-brand-caption">{t.brandCaption}</Typography></Box>
        </Box>
        <Typography className="showcase-number" aria-hidden="true">{t.artNumber}</Typography>
        <Box className="showcase-copy">
          <Typography className="showcase-eyebrow">{t.artEyebrow}</Typography>
          <Typography variant="h2" component="p" className="showcase-title">{t.artTitle}<br /><span>{t.artTitleAccent}</span></Typography>
          <Typography variant="body2">{t.artDescription}</Typography>
        </Box>
        <Box className="parking-diagram" aria-hidden="true">
          <Box className="diagram-parking-field">{t.artBays.map((bay) => <Box key={bay} className="diagram-slot">{bay}</Box>)}</Box>
          <Box className="diagram-road diagram-road-one" /><Box className="diagram-road diagram-road-two" />
          <Box className="diagram-gate"><Box className="diagram-gate-arm" /></Box>
          <Box className="diagram-car diagram-car-one"><TopDownCarIcon /></Box><Box className="diagram-car diagram-car-two"><TopDownCarIcon /></Box>
          <Box className="diagram-node diagram-node-one" /><Box className="diagram-node diagram-node-two" />
          <Typography className="diagram-label diagram-label-one">{t.artGate}</Typography><Typography className="diagram-label diagram-label-two">{t.artZone}</Typography>
        </Box>
        <Box className="showcase-features">
          <Box><ShieldRoundedIcon aria-hidden="true" /><Typography variant="caption">{t.artSecurity}</Typography></Box>
          <Box><SpeedRoundedIcon aria-hidden="true" /><Typography variant="caption">{t.artSpeed}</Typography></Box>
          <Box><SensorsRoundedIcon aria-hidden="true" /><Typography variant="caption">{t.artDevices}</Typography></Box>
        </Box>
        <Typography className="showcase-footer">{t.showcaseFooter}</Typography>
      </Box>
      <Paper className="login-card" elevation={0}>
        <Box className="login-card-kicker"><ShieldRoundedIcon aria-hidden="true" /><Typography variant="caption">{t.secureAccess}</Typography></Box>
        <Typography component="h1" variant="h1" className="login-title">{t.title}</Typography>
        <Typography variant="body2" color="text.secondary" className="login-subtitle">{t.subtitle}</Typography>
        <Box component="form" onSubmit={submit} noValidate sx={{ mt: 3 }}>
          <Box className="login-form-fields">
            {apiMessage && <Alert severity={apiMessageSeverity}>{apiMessage}</Alert>}
            <TextField data-testid="login-username" label={t.username} value={username} onChange={(event) => setUsername(event.target.value)} error={Boolean(errors.username)} helperText={errors.username} autoComplete="username" autoFocus slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login-username-input' } }} />
            <TextField data-testid="login-password" label={t.password} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} error={Boolean(errors.password)} helperText={errors.password} autoComplete="current-password" slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login-password-input' }, input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((visible) => !visible)} onMouseDown={(event) => event.preventDefault()} aria-label={showPassword ? t.hidePassword : t.showPassword} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> } }} />
            <FormControlLabel className="remember-control" control={<Checkbox checked={rememberMe} onChange={(event) => { const checked = event.target.checked; setRememberMe(checked); if (!checked) window.localStorage.removeItem(rememberedUsernameKey); }} color="primary" />} label={t.rememberMe} />
            <Button data-testid="login-submit" type="submit" variant="contained" size="large" startIcon={loginRequest.loading ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />} disabled={loginRequest.loading} fullWidth>{loginRequest.loading ? t.checking : t.login}</Button>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" className="login-footer">{t.productVersion}</Typography>
      </Paper>
    </Box>
  </Box>;
}
