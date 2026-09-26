import { useEffect, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { Language } from '../i18n';
import { loginWithSso } from '../features/auth/authService';
import { consumeSsoCallback } from '../features/auth/sso';
import type { LoginResult } from '../features/auth/authService';

type Props = {
  language: Language;
  onAuthenticated: (session: LoginResult) => void;
};

export function SsoCallbackPage({ language, onAuthenticated }: Props) {
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const authenticate = async () => {
      try {
        const callback = consumeSsoCallback();
        const result = await loginWithSso(callback);
        onAuthenticated(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'خطا در ورود با SSO');
      }
    };
    void authenticate();
  }, [onAuthenticated]);

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }} dir={language === 'fa' ? 'rtl' : 'ltr'}>
    <Box sx={{ width: 'min(460px, 100%)', textAlign: 'center' }}>
      {error ? <Alert severity="error">{error}</Alert> : <><CircularProgress /><Typography sx={{ mt: 2 }}>در حال تکمیل ورود با سیستم مرکزی...</Typography></>}
    </Box>
  </Box>;
}
