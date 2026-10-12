import { useEffect, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { Language } from '../i18n';
import { loginWithSso } from '../features/auth/authService';
import { clearPendingSso, consumeSsoCallback } from '../features/auth/sso';
import type { LoginResult } from '../features/auth/authService';
import { useTranslation } from 'react-i18next';
import '../i18n/instance';

type Props = {
  language: Language;
  onAuthenticated: (session: LoginResult) => void;
};

export function SsoCallbackPage({ language, onAuthenticated }: Props) {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => { void i18n.changeLanguage(language); }, [i18n, language]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const authenticate = async () => {
      try {
        const callback = consumeSsoCallback();
        const result = await loginWithSso(callback);
        // Keep the PKCE verifier available while SsoLogin is in flight so a
        // transient backend failure does not turn a retry into "expired".
        clearPendingSso();
        onAuthenticated(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : t('auth.ssoFailed'));
      }
    };
    void authenticate();
  }, [onAuthenticated]);

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }} dir={language === 'fa' ? 'rtl' : 'ltr'}>
    <Box sx={{ width: 'min(460px, 100%)', textAlign: 'center' }}>
      {error ? <Alert severity="error">{error}</Alert> : <><CircularProgress /><Typography sx={{ mt: 2 }}>{t('auth.ssoLoading')}</Typography></>}
    </Box>
  </Box>;
}
