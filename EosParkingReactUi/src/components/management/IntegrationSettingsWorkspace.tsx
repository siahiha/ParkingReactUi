import { useEffect, useState } from 'react';
import { Alert, Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import type { Language } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };

const unwrapParking = (input: unknown): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object') return null;
  const root = input as Record<string, unknown>;
  const value = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  if (Array.isArray(value)) return value[0] && typeof value[0] === 'object' ? value[0] as Record<string, unknown> : null;
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
};

const valueOf = (row: Record<string, unknown> | null, key: string) => row?.[key] ?? row?.[key.charAt(0).toLowerCase() + key.slice(1)];
const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;

export function IntegrationSettingsWorkspace({ title, pageTitle, parkingId, language }: Props) {
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
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده تنظیمات ارتباط مجاز نیست.', 'Integration settings access is forbidden.') : text(language, 'دریافت تنظیمات ارتباط ناموفق بود.', 'Integration settings could not be loaded.'));
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [parkingId, language]);

  const validateUrl = () => {
    const candidate = url.trim();
    if (!candidate) return null;
    try {
      const parsed = new URL(candidate);
      if (!['http:', 'https:'].includes(parsed.protocol)) return text(language, 'آدرس باید با http یا https شروع شود.', 'The address must use http or https.');
    } catch { return text(language, 'آدرس وب‌سرویس معتبر نیست.', 'Enter a valid web-service URL.'); }
    return null;
  };

  const save = async () => {
    const validationError = validateUrl();
    if (validationError) { setMessage(validationError); return; }
    setSaving(true);
    setMessage('');
    try {
      await parkingApi.save({ ...(parking ?? { Id: parkingId }), Id: parkingId, EtsDataProviderURL: url.trim() || null });
      setMessage(text(language, 'تنظیمات ارتباط با موفقیت ذخیره شد.', 'Integration settings were saved.'));
      await load();
    } catch (cause) {
      setMessage(cause instanceof ApiError && cause.status === 403 ? text(language, 'مجوز ذخیره تنظیمات ارتباط را ندارید.', 'You are not allowed to save integration settings.') : text(language, 'ذخیره تنظیمات ارتباط ناموفق بود.', 'Saving integration settings failed.'));
    } finally { setSaving(false); }
  };

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={text(language, 'پیکربندی اتصال پارکینگ جاری به سرویس ETS', 'Configure the current parking connection to ETS')} language={language} loading={loading} onRefresh={() => { void load(); }}>
    <ResourceState loading={loading} error={error} empty={false} loadingLabel={text(language, 'در حال دریافت تنظیمات...', 'Loading settings...')} emptyLabel="">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); void save(); }} sx={{ maxWidth: 720, display: 'grid', gap: 2 }}>
        <Alert severity="info" icon={<LinkRoundedIcon />}>
          <Typography variant="body2">{text(language, 'این تنظیم، آدرس وب‌سرویس ETS را برای پارکینگ جاری نگه‌داری می‌کند. اتصال مستقیم مرورگر به ETS انجام نمی‌شود.', 'This setting stores the ETS web-service address for the current parking. The browser does not connect directly to ETS.')}</Typography>
        </Alert>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <TextField size="small" fullWidth label={text(language, 'آدرس وب‌سرویس ETS', 'ETS web-service URL')} value={url} onChange={(event) => { setUrl(event.target.value); setDirty(true); setMessage(''); }} placeholder="https://..." dir="ltr" slotProps={{ htmlInput: { inputMode: 'url' } }} helperText={text(language, 'اختیاری است؛ برای پاک‌کردن اتصال، مقدار را خالی ذخیره کنید.', 'Optional. Save an empty value to clear the connection.')} />
          {dirty && <Typography variant="caption" color="warning.main">{text(language, 'تغییرات ذخیره‌نشده است.', 'You have unsaved changes.')}</Typography>}
        </Box>
        {message && <Alert severity={message.includes(text(language, 'موفقیت', 'saved')) ? 'success' : 'warning'}>{message}</Alert>}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={saving || loading}>{saving ? text(language, 'در حال ذخیره...', 'Saving...') : text(language, 'ذخیره تنظیمات', 'Save settings')}</Button>
          <Button type="button" variant="outlined" onClick={() => { setUrl(String(valueOf(parking, 'EtsDataProviderURL') ?? '')); setDirty(false); setMessage(''); }} disabled={!dirty || saving}>{text(language, 'لغو تغییرات', 'Discard changes')}</Button>
          <Tooltip title={text(language, 'برای فعال‌شدن، endpoint تست ارتباط ETS باید توسط Backend ارائه شود.', 'Backend must provide an ETS connection-test endpoint before this action can be enabled.')} arrow><span><Button type="button" variant="outlined" startIcon={<LinkRoundedIcon />} disabled>{text(language, 'تست ارتباط', 'Test connection')}</Button></span></Tooltip>
        </Box>
        <Alert severity="warning">{text(language, 'تست واقعی اتصال ETS در نسخه وب تا زمان ارائه endpoint رسمی Backend در دسترس نیست.', 'A real ETS connection test is unavailable in the web version until Backend provides an official endpoint.')}</Alert>
      </Box>
    </ResourceState>
  </ManagementWorkspaceFrame>;
}
