import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { Language } from '../i18n/instance';
import { formatDateTime, formatNumber } from '../utils/formatters';
import { occupancyPercentage, type HomeParkingInfo } from '../features/home/homeParkingInfoService';
import { ParkingSpaceMap } from '../features/home/ParkingSpaceMap';

type Props = { parkingId: number; language: Language; parkingInfo: HomeParkingInfo | null; refreshing: boolean; onRefresh: () => void };

export function HomeDashboardOverview({ parkingId, language, parkingInfo, refreshing, onRefresh }: Props) {
  return <Box className="home3-overview">
    <MetricRail language={language} parkingInfo={parkingInfo} />
    <ParkingSpaceMap parkingId={parkingId} language={language} />
    <DoorStatusPanel language={language} parkingInfo={parkingInfo} refreshing={refreshing} onRefresh={onRefresh} />
  </Box>;
}

function DoorStatusPanel({ language, parkingInfo, refreshing, onRefresh }: { language: Language; parkingInfo: HomeParkingInfo | null; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  return <Box className="home3-gates-panel">
    <Box className="home3-panel-heading"><Box><Typography className="home3-panel-title">{t('home.gateStatus')}</Typography></Box><Box className="home3-gate-heading-actions"><Tooltip title={t('home.refresh')}><span><IconButton className="home3-gate-refresh" size="small" aria-label={t('home.refresh')} onClick={onRefresh} disabled={refreshing}><RefreshRoundedIcon fontSize="small" /></IconButton></span></Tooltip><Chip icon={<DoorFrontRoundedIcon />} label={`${t('home.doorCount')}: ${formatNumber(parkingInfo?.doorCount, language)}`} /></Box></Box>
    <Box className="home3-gate-list">{parkingInfo?.doorStatuses.map((door) => <DoorStatusItem key={door.doorId} language={language} door={door} />)}</Box>
  </Box>;
}

function MetricRail({ language, parkingInfo }: { language: Language; parkingInfo: HomeParkingInfo | null }) {
  const { t } = useTranslation();
  return <Box className="home3-metric-rail">
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home.occupancyRate')} value={`${formatNumber(occupancyPercentage(parkingInfo), language)}%`} note={t('home.occupied')} />
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home.capacity')} value={formatNumber(parkingInfo?.totalCapacity, language)} note={t('home.capacity')} />
    <MetricRow icon={<DirectionsCarRoundedIcon />} label={t('home.occupied')} value={formatNumber(parkingInfo?.occupied, language)} note={t('home.occupied')} />
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home.available')} value={formatNumber(parkingInfo?.available, language)} note={t('home.freeCount')} />
    <MetricRow icon={<DoorFrontRoundedIcon />} label={t('home.doorCount')} value={formatNumber(parkingInfo?.doorCount, language)} note={t('home.gateStatus')} />
  </Box>;
}

function MetricRow({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: ReactNode }) {
  return <Box className="home3-metric-row"><Box className="home3-metric-icon">{icon}</Box><Box><Typography>{label}</Typography><Typography className="home3-metric-value">{value}</Typography><Typography className="home3-metric-note">{note}</Typography></Box></Box>;
}

function DoorStatusItem({ language, door }: { language: Language; door: HomeParkingInfo['doorStatuses'][number] }) {
  const { t } = useTranslation();
  return <Box className="home3-gate-item">
    <Box className="home3-gate-icon"><DoorFrontRoundedIcon /></Box>
    <Box className="home3-door-copy"><Typography>{door.doorTitle}</Typography><Typography className={door.isActive ? 'is-active' : 'is-inactive'}>{door.isActive ? t('common.active') : t('common.inactive')}</Typography></Box>
    <Box className="home3-door-metrics"><Typography>{t('home.trafficToday')}<strong>{formatNumber(door.trafficCount, language)}</strong></Typography><Typography>{t('home.lastTraffic')}<strong dir="ltr">{door.lastTrafficDateTime ? formatDateTime(door.lastTrafficDateTime, language) : ''}</strong></Typography></Box>
  </Box>;
}

