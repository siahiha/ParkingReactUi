import { useTranslation } from 'react-i18next';
import { Box, Skeleton, Typography } from '@mui/material';

const metricRows = ['occupancy', 'traffic', 'gates', 'spaces'];

export function HomeLoadingState() {
  const { t } = useTranslation();

  return <Box className="home3-loading-state" role="status" aria-live="polite" aria-label={t('common.loading')}>
    <Box className="home3-loading-hero">
      <Box className="home3-loading-copy">
        <Typography className="home3-loading-status">{t('common.loading')}</Typography>
        <Skeleton className="home3-loading-hero-line" variant="text" width="42%" />
        <Skeleton className="home3-loading-hero-title" variant="text" width="78%" />
        <Skeleton className="home3-loading-hero-meta" variant="text" width="56%" />
      </Box>
      <Box className="home3-loading-actions"><Skeleton variant="rounded" height={40} /><Skeleton variant="rounded" height={40} /></Box>
    </Box>
    <Box className="home3-loading-overview">
      <Box className="home3-loading-metrics">{metricRows.map((key) => <Box className="home3-loading-metric" key={key}><Skeleton variant="rounded" width={30} height={30} /><Box className="home3-loading-metric-copy"><Skeleton variant="text" width="68%" /><Skeleton variant="text" width="48%" /><Skeleton variant="text" width="76%" /></Box></Box>)}</Box>
      <HomeLoadingPanel className="home3-loading-map" lines={5} />
      <HomeLoadingPanel className="home3-loading-activity" lines={4} />
    </Box>
    <Box className="home3-loading-lower">
      <HomeLoadingPanel className="home3-loading-gates" lines={4} />
      <HomeLoadingPanel className="home3-loading-quick" lines={3} />
    </Box>
  </Box>;
}

function HomeLoadingPanel({ className, lines }: { className: string; lines: number }) {
  return <Box className={`home3-loading-panel ${className}`}>
    <Box className="home3-loading-panel-heading"><Box><Skeleton variant="text" width={84} /><Skeleton variant="text" width={142} /></Box><Skeleton variant="rounded" width={30} height={30} /></Box>
    <Skeleton className="home3-loading-divider" variant="rectangular" height={1} />
    <Box className="home3-loading-panel-body">{Array.from({ length: lines }, (_, index) => <Skeleton key={index} variant="rounded" height={index === 0 ? 84 : 18} width={index === 0 ? '100%' : `${72 - index * 8}%`} />)}</Box>
  </Box>;
}




