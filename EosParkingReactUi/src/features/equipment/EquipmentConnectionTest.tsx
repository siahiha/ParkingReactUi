import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n/instance';
import { ConnectionStatusIndicator } from '../../components/ConnectionStatusIndicator';
import { serviceDeviceTypes, type EquipmentConnectionSettings } from './equipmentService';
import { useEquipmentConnectionTest } from './useEquipmentConnectionTest';

type Props = { settings: EquipmentConnectionSettings; busy?: boolean; language: Language; showTitle?: boolean };

export function EquipmentConnectionTest({ settings, busy = false, language, showTitle = true }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const test = useEquipmentConnectionTest(settings);
  const blocked = !serviceDeviceTypes.has(String(settings.DeviceType)) ? 'unsupported' : null;
  const checking = test.phase === 'checking';
  const message = t(`equipmentTest.${blocked ?? test.phase}`);
  const color = test.phase === 'connected' ? 'success'
    : ['disconnected', 'error', 'forbidden', 'invalid-config', 'unavailable'].includes(test.phase) ? 'error'
      : checking ? 'info' : 'warning';

  return <Box component="section" sx={{ display: 'grid', gap: 1, width: '100%' }}>
    {(showTitle || test.phase !== 'idle') && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {showTitle && <Typography component="span" variant="body2">{t('equipmentTest.title')}</Typography>}
      {!blocked && test.phase !== 'idle' && <ConnectionStatusIndicator message={message} color={color} />}
    </Box>}
    {blocked && <Typography variant="body2" color="text.secondary">{message}</Typography>}
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size="small" disabled={Boolean(blocked) || busy || checking} onClick={() => void test.start()}>{t('equipmentTest.start')}</Button>
      {checking && <Button size="small" onClick={test.cancel}>{t('equipmentTest.cancel')}</Button>}
    </Box>
  </Box>;
}
