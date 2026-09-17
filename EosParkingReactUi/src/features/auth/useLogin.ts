import { useState } from 'react';
import { ApiError } from '../../api/client';
import { login } from './authService';

export function useLogin(labels: { invalid: string; requestFailed: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (username: string, password: string) => {
    setLoading(true); setError('');
    try { return await login(username, password); }
    catch (cause) { setError(cause instanceof ApiError && cause.status === 401 ? labels.invalid : labels.requestFailed); return null; }
    finally { setLoading(false); }
  };
  return { loading, error, setError, submit };
}
