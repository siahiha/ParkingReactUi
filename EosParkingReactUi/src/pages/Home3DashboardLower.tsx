import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import type { ReactNode } from 'react';

type Props = { onNavigate: (path: string) => void };

export function Home3DashboardLower({ onNavigate }: Props) {
  const { t } = useTranslation();

  return <Box className="home3-lower">
    <Box className="home3-quick-panel">
      <Box className="home3-panel-heading"><Box><Typography className="home3-panel-title">{t('home2.quickActions')}</Typography></Box></Box>
      <Box className="home3-quick-actions"><QuickAction icon={<DirectionsCarRoundedIcon />} label={t('home2.openTraffic')} onClick={() => onNavigate('/parking/traffic-records')} /><QuickAction icon={<GroupsRoundedIcon />} label={t('home2.openMembers')} onClick={() => onNavigate('/parking/members')} /><QuickAction icon={<MonitorHeartRoundedIcon />} label={t('home2.openMonitoring')} onClick={() => onNavigate('/parking/monitoring')} /><QuickAction icon={<AssessmentRoundedIcon />} label={t('home2.openReports')} onClick={() => onNavigate('/parking/traffic-reports-list')} /></Box>
    </Box>
  </Box>;
}

function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <Button onClick={onClick}>{icon}<span>{label}</span><ArrowOutwardRoundedIcon /></Button>;
}
