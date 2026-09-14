import { useState } from 'react';
import { ApiError } from '../api/client';
import { userApi } from '../api/management';
import type { PasswordValues } from '../components/homeProfileTypes';

type User = { id: number; userName: string };
type Labels = { passwordRequired: string; passwordMismatch: string; passwordError: string; passwordChanged: string };

export function useChangePassword(user: User, labels: Labels) {
  const [values, setValues] = useState<PasswordValues>({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<'info' | 'success' | 'error'>('info');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const { current, next, confirm } = values;
    if (!current || !next || !confirm) {
      setMessageSeverity('error');
      setMessage(labels.passwordRequired);
      return;
    }
    if (next !== confirm || next === current) {
      setMessageSeverity('error');
      setMessage(next !== confirm ? labels.passwordMismatch : labels.passwordError);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const result = await userApi.changePassword(user, current, next) as { ResponseResultType?: string | number; responseResultType?: string | number; Message?: string; message?: string };
      const responseType = String(result.ResponseResultType ?? result.responseResultType ?? '').toLowerCase();
      if (responseType && !['ok', 'success', '0', '1'].includes(responseType)) throw new Error(labels.passwordError);
      setMessageSeverity('success');
      setMessage(labels.passwordChanged);
      setValues({ current: '', next: '', confirm: '' });
    } catch (error) {
      setMessageSeverity('error');
      setMessage(error instanceof ApiError && typeof error.body === 'object' && error.body !== null
        ? String((error.body as { Message?: string; message?: string }).Message ?? (error.body as { message?: string }).message ?? labels.passwordError)
        : labels.passwordError);
    } finally {
      setSaving(false);
    }
  };

  const resetMessage = () => setMessage('');
  return { values, setValues, message, messageSeverity, saving, save, resetMessage };
}
