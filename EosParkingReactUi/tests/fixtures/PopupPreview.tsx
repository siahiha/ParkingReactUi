import { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppPopup } from '../../src/components/AppPopup';
import { CrudDialog } from '../../src/components/CrudDialog';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';

export function PopupPreview() {
  const { t, i18n } = useTranslation();
  const [kind, setKind] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const close = () => setKind(null);
  const direction = i18n.dir() === 'rtl' ? 'rtl' : 'ltr';
  const content = <Box sx={{ display: 'grid', gap: 2 }}>
    <TextField label={t('parkingForm.name')} />
    <FormControlLabel label="Busy" control={<Checkbox checked={busy} onChange={event => setBusy(event.target.checked)} />} />
    <Box sx={{ maxHeight: '35vh', overflow: 'auto' }}>{Array.from({ length: 20 }, (_, index) => <p key={index}>{t('parkingForm.address')} — {index + 1}</p>)}</Box>
  </Box>;
  return <Box sx={{ p: 3 }}>
    {['crud', 'confirm', 'custom'].map(value => <Button key={value} data-testid={`open-${value}`} onClick={() => { setBusy(false); setKind(value); }}>{value}</Button>)}
    <output data-testid="popup-result">{result}</output>
    <CrudDialog open={kind === 'crud'} title={t('parkingForm.editTitle')} direction={direction} busy={busy}
      onClose={close} onConfirm={() => setResult('saved')} cancelLabel={t('popup.cancel')} confirmLabel={t('popup.confirm')}>{content}</CrudDialog>
    <ConfirmDialog open={kind === 'confirm'} title={t('parkingForm.remove')} message={t('parking.deleteConfirm')}
      onClose={close} onConfirm={() => setResult('removed')} cancelLabel={t('popup.cancel')} confirmLabel={t('popup.confirm')} />
    <AppPopup open={kind === 'custom'} title={t('parkingForm.settingsTab')} busy={busy} onClose={close} actions={[
      { id: 'cancel', label: t('popup.cancel'), onClick: close },
      { id: 'preview', label: 'Preview', onClick: () => setResult('preview'), variant: 'outlined' },
      { id: 'confirm', label: t('popup.confirm'), onClick: () => setResult('confirmed'), variant: 'contained' },
    ]}>{content}</AppPopup>
  </Box>;
}
