import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import { translations, type Language } from '../i18n';
import { useLogin } from '../features/auth/useLogin';
import type { HomeUser } from './homeTypes';

type Props = { language: Language; toggleLanguage: () => void; onAuthenticated: (session: { token: string | null; user: HomeUser }) => void };
type FormErrors = { username?: string; password?: string };
const rememberedUsernameKey = 'eos-parking-remembered-username';

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

  return <Box className="login-page" dir={t.direction}>
    <Box className="login-ambient" aria-hidden="true"><Box className="login-ambient-line login-ambient-line-one" /><Box className="login-ambient-line login-ambient-line-two" /></Box>
    <Button className="language-button" variant="text" size="small" onClick={toggleLanguage} startIcon={<TranslateRoundedIcon />} aria-label={t.languageName}>{t.languageName}</Button>
    <Box className="login-layout">
      <Box className="login-showcase"><Box className="showcase-brand"><Box className="showcase-brand-mark"><LocalParkingRoundedIcon /></Box><Box><Typography className="showcase-brand-name">EOS</Typography><Typography className="showcase-brand-caption">PARKING OPERATIONS</Typography></Box></Box><Typography className="showcase-number" aria-hidden="true">01</Typography><Box className="showcase-copy"><Typography className="showcase-eyebrow">{t.artEyebrow}</Typography><Typography variant="h2">{t.artTitle}<br /><span>{t.artTitleAccent}</span></Typography><Typography variant="body2">{t.artDescription}</Typography></Box><Box className="parking-diagram" aria-hidden="true"><Box className="diagram-parking-field"><Box className="diagram-slot is-active">A1</Box><Box className="diagram-slot">A2</Box><Box className="diagram-slot is-occupied">A3</Box><Box className="diagram-slot">A4</Box><Box className="diagram-slot">B1</Box><Box className="diagram-slot is-occupied">B2</Box><Box className="diagram-slot">B3</Box><Box className="diagram-slot">B4</Box></Box><Box className="diagram-road diagram-road-one" /><Box className="diagram-road diagram-road-two" /><Box className="diagram-gate"><Box className="diagram-gate-arm" /></Box><Box className="diagram-car diagram-car-one"><DirectionsCarRoundedIcon /></Box><Box className="diagram-car diagram-car-two"><DirectionsCarRoundedIcon /></Box><Box className="diagram-node diagram-node-one" /><Box className="diagram-node diagram-node-two" /><Typography className="diagram-label diagram-label-one">GATE 01</Typography><Typography className="diagram-label diagram-label-two">ZONE A</Typography></Box><Box className="showcase-features"><Box><ShieldRoundedIcon /><Typography variant="caption">{t.artSecurity}</Typography></Box><Box><SpeedRoundedIcon /><Typography variant="caption">{t.artSpeed}</Typography></Box><Box><SensorsRoundedIcon /><Typography variant="caption">{t.artDevices}</Typography></Box></Box><Typography className="showcase-footer">EOS PARKING SYSTEM <span>•</span> 2026</Typography></Box>
      <Paper className="login-card" elevation={0}><Box className="login-card-kicker"><Box className="brand-mark" aria-hidden="true"><LocalParkingRoundedIcon /></Box><Typography variant="caption">SECURE ACCESS</Typography></Box><Typography component="h1" variant="h1" className="login-title">{t.title}</Typography><Typography variant="body2" color="text.secondary" className="login-subtitle">{t.subtitle}</Typography><Box component="form" onSubmit={submit} noValidate sx={{ mt: 3 }}><Box className="login-form-fields">{apiMessage && <Alert severity={apiMessageSeverity}>{apiMessage}</Alert>}<TextField data-testid="login-username" label={t.username} value={username} onChange={(event) => setUsername(event.target.value)} error={Boolean(errors.username)} helperText={errors.username} autoComplete="username" autoFocus slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login-username-input' } }} /><TextField data-testid="login-password" label={t.password} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} error={Boolean(errors.password)} helperText={errors.password} autoComplete="current-password" slotProps={{ htmlInput: { dir: 'ltr', 'data-testid': 'login-password-input' }, input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((visible) => !visible)} onMouseDown={(event) => event.preventDefault()} aria-label={showPassword ? t.hidePassword : t.showPassword} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> } }} /><FormControlLabel className="remember-control" control={<Checkbox checked={rememberMe} onChange={(event) => { const checked = event.target.checked; setRememberMe(checked); if (!checked) window.localStorage.removeItem(rememberedUsernameKey); }} color="primary" />} label={t.rememberMe} /><Button data-testid="login-submit" type="submit" variant="contained" size="large" startIcon={loginRequest.loading ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />} disabled={loginRequest.loading} fullWidth>{loginRequest.loading ? t.checking : t.login}</Button></Box></Box><Typography variant="caption" color="text.secondary" className="login-footer">{t.productVersion}</Typography></Paper>
    </Box>
  </Box>;
}
