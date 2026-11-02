import { useEffect, useState } from 'react';
import { Alert, Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import type { Language } from './managementTypes';
import i18n from '../../i18n/instance';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };

const unwrapParking = (input: unknown): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object') return null;
  const root = input as Record<string, unknown>;
  const value = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  if (Array.isArray(value)) return value[0] && typeof value[0] === 'object' ? value[0] as Record<string, unknown> : null;
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
};

const valueOf = (row: Record<string, unknown> | null, key: string) => row?.[key] ?? row?.[key.charAt(0).toLowerCase() + key.slice(1)];
export function IntegrationSettingsWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const text = i18n.getFixedT(language);
  const [parking, setParking] = useState<Record<string, unknown> | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const record = unwrapParking(await parkingApi.getById(parkingId));
      if (record) {
        setParking(record);
        setUrl(String(valueOf(record, 'EtsDataProviderURL') ?? ''));
        setDirty(false);
      }
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? text('integration.forbiddenRead') : text('integration.loadError'));
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [parkingId, language]);

  const validateUrl = () => {
    const candidate = url.trim();
    if (!candidate) return null;
    try {
      const parsed = new URL(candidate);
      if (!['http:', 'https:'].includes(parsed.protocol)) return text('integration.invalidProtocol');
    } catch { return text('integration.invalidUrl'); }
    return null;
  };

  const save = async () => {
    const validationError = validateUrl();
    if (validationError) { setMessage(validationError); return; }
    setSaving(true);
    setMessage('');
    try {
      await parkingApi.save({ ...(parking ?? { Id: parkingId }), Id: parkingId, EtsDataProviderURL: url.trim() || null });
      setMessage(text('integration.saved'));
      await load();
    } catch (cause) {
      setMessage(cause instanceof ApiError && cause.status === 403 ? text('integration.forbiddenSave') : text('integration.saveError'));
    } finally { setSaving(false); }
  };

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={() => { void load(); }}>
    <ResourceState loading={loading} error={error} empty={false} loadingLabel={text('integration.loading')} emptyLabel="">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); void save(); }} sx={{ maxWidth: 720, display: 'grid', gap: 2 }}>
        <Alert severity="info" icon={<LinkRoundedIcon />}>
          <Typography variant="body2">{text('integration.description')}</Typography>
        </Alert>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <TextField size="small" fullWidth label={text('integration.label')} value={url} onChange={(event) => { setUrl(event.target.value); setDirty(true); setMessage(''); }} placeholder="https://..." dir="ltr" slotProps={{ htmlInput: { inputMode: 'url' } }} helperText={text('integration.helper')} />
          {dirty && <Typography variant="caption" color="warning.main">{text('integration.dirty')}</Typography>}
        </Box>
        {message && <Alert severity={message === text('integration.saved') ? 'success' : 'warning'}>{message}</Alert>}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={saving || loading}>{saving ? text('integration.saving') : text('integration.save')}</Button>
          <Button type="button" variant="outlined" onClick={() => { setUrl(String(valueOf(parking, 'EtsDataProviderURL') ?? '')); setDirty(false); setMessage(''); }} disabled={!dirty || saving}>{text('integration.discard')}</Button>
          <Tooltip title={text('integration.testHint')} arrow><span><Button type="button" variant="outlined" startIcon={<LinkRoundedIcon />} disabled>{text('integration.test')}</Button></span></Tooltip>
        </Box>
        <Alert severity="warning">{text('integration.warning')}</Alert>
      </Box>
    </ResourceState>
  </ManagementWorkspaceFrame>;
}
