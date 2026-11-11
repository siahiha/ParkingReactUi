import { useState } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import { useTranslation } from 'react-i18next';
import { AppPopup } from '../../components/AppPopup';
import { formatDateTime } from '../../utils/formatters';
import type { Language } from '../../i18n/instance';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';

type Detection = { event: HshDetectionEvent; fullFrameUrl: string | null; plateImageUrl: string | null };
export function TrafficDetectionPanel({ detection, language }: { detection: Detection | null; language: Language }) {
  const { t } = useTranslation(undefined, { lng: language });
  const [zoom, setZoom] = useState<{ src: string; label: string } | null>(null);
  const preview = (src: string | null, label: string, className: string) => <Box className={className}>
    {src ? <>
      <Box component="img" src={src} alt={label} />
      <Tooltip title={t('trafficLayout.enlarge')}><IconButton size="small" aria-label={`${t('trafficLayout.enlarge')} — ${label}`} onClick={() => setZoom({ src, label })}><ZoomInRoundedIcon fontSize="small" /></IconButton></Tooltip>
    </> : <Typography variant="caption" color="text.secondary">{t('trafficLayout.imageUnavailable')}</Typography>}
  </Box>;
  return <Paper variant="outlined" className="traffic-last-traffic-inline">
    <Typography variant="subtitle2">{t('trafficLayout.latestDetection')}</Typography>
    {detection ? <>
      <Typography variant="caption" color="text.secondary">{formatDateTime(detection.event.occurredAtUtc, language)}</Typography>
      {preview(detection.fullFrameUrl, t('trafficLayout.fullFrame'), 'traffic-fullframe-preview')}
      {preview(detection.plateImageUrl, t('trafficLayout.plateImage'), 'traffic-plate-preview')}
      <Typography variant="body2" dir="ltr" className="traffic-detection-plate">{detection.event.plateText || '—'}</Typography>
    </> : <Box className="traffic-last-traffic-placeholder"><Typography variant="caption" color="text.secondary">{t('trafficLayout.detectionUnavailable')}</Typography></Box>}
    <AppPopup open={Boolean(zoom)} title={zoom?.label ?? t('trafficLayout.latestDetection')} onClose={() => setZoom(null)} cancelLabel={t('trafficIdentity.close')} maxWidth="lg" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {zoom && <Box component="img" src={zoom.src} alt={zoom.label} sx={{ display: 'block', inlineSize: '100%', maxBlockSize: '70dvh', objectFit: 'contain' }} />}
    </AppPopup>
  </Paper>;
}
