import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { useId, type ReactNode } from 'react';

type Props = { onNavigate: (path: string) => void };

export function HomeDashboardLower({ onNavigate }: Props) {
  const { t } = useTranslation();
  const headingId = useId();

  return <Box className="home3-lower">
    <Box component="section" aria-labelledby={headingId} className="home3-quick-panel">
      <Box className="home3-quick-heading">
        <span className="home3-quick-emblem" aria-hidden="true"><BoltRoundedIcon /></span>
        <Typography component="h2" id={headingId} className="home3-panel-title">{t('home.quickActions')}</Typography>
      </Box>
      <Box className="home3-quick-actions">
        <QuickAction tone="traffic" icon={<DirectionsCarRoundedIcon />} label={t('home.openTraffic')} onClick={() => onNavigate('/parking/traffic-records')} />
        <QuickAction tone="members" icon={<GroupsRoundedIcon />} label={t('home.openMembers')} onClick={() => onNavigate('/parking/members')} />
        <QuickAction tone="monitoring" icon={<MonitorHeartRoundedIcon />} label={t('home.openMonitoring')} onClick={() => onNavigate('/parking/monitoring')} />
        <QuickAction tone="reports" icon={<AssessmentRoundedIcon />} label={t('home.openReports')} onClick={() => onNavigate('/parking/traffic-reports-list')} />
      </Box>
    </Box>
  </Box>;
}

function QuickAction({ icon, label, tone, onClick }: { icon: ReactNode; label: string; tone: string; onClick: () => void }) {
  return <Button className={`home3-quick-tile home3-quick-${tone}`} onClick={onClick}>
    <span className="home3-quick-orb" aria-hidden="true">{icon}</span>
    <span className="home3-quick-label">{label}</span>
    <span className="home3-quick-arrow" aria-hidden="true"><ArrowOutwardRoundedIcon /></span>
  </Button>;
}



