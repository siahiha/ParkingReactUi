import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import NorthRoundedIcon from '@mui/icons-material/NorthRounded';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { Language } from '../i18n';
import { formatDateTime, formatNumber } from '../utils/formatters';
import { occupancyPercentage, type Home3ParkingInfo } from '../features/home3/home3ParkingInfoService';

type Props = { language: Language; parkingInfo: Home3ParkingInfo | null; refreshing: boolean; onRefresh: () => void; onNavigate: (path: string) => void };
const slots = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
const occupiedSlots = new Set(['A3', 'A4', 'B2', 'B3', 'C2', 'D1', 'D4']);

export function Home3DashboardOverview({ language, parkingInfo, refreshing, onRefresh, onNavigate }: Props) {
  const [selectedSlot, setSelectedSlot] = useState('A1');

  return <Box className="home3-overview">
    <MetricRail language={language} parkingInfo={parkingInfo} />
    <ParkingMap selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
    <DoorStatusPanel language={language} parkingInfo={parkingInfo} refreshing={refreshing} onRefresh={onRefresh} />
  </Box>;
}

function ParkingMap({ selectedSlot, onSelectSlot }: { selectedSlot: string; onSelectSlot: (slot: string) => void }) {
  const { t } = useTranslation();
  return <Paper className="home3-map-panel" elevation={0}>
    <PanelHeading overline={t('home2.liveOverview')} title={t('home2.spaceMap')} icon={<LocalParkingRoundedIcon />} />
    <Divider />
    <Box className="home3-map-stage" aria-label={t('home2.spaceMap')}>
      <Box className="home3-map-axis home3-axis-x"><span>A</span><span>B</span><span>C</span><span>D</span></Box>
      <Box className="home3-map-axis home3-axis-y"><span>01</span><span>02</span><span>03</span><span>04</span></Box>
      <Box className="home3-map-road home3-road-one" /><Box className="home3-map-road home3-road-two" /><Box className="home3-map-road home3-road-three" />
      <Box className="home3-map-gate home3-gate-north"><NorthRoundedIcon /><span>{t('home2.gateNorth')}</span></Box>
      <Box className="home3-map-gate home3-gate-south"><SouthRoundedIcon /><span>{t('home2.gateSouth')}</span></Box>
      <Box className="home3-slot-grid">{slots.map((slot) => { const occupied = occupiedSlots.has(slot); const selected = selectedSlot === slot; return <Button key={slot} className={`home3-slot ${occupied ? 'is-occupied' : 'is-free'} ${selected ? 'is-selected' : ''}`} onClick={() => onSelectSlot(slot)} aria-label={`${t('home2.selectedBay')}: ${slot}`} aria-pressed={selected}><Typography component="span">{slot}</Typography>{occupied && <DirectionsCarRoundedIcon />}</Button>; })}</Box>
    </Box>
    <Box className="home3-map-footer"><Box className="home3-map-legend"><span><i className="is-free" />{t('home2.freeSpace')}</span><span><i className="is-occupied" />{t('home2.occupiedSpace')}</span><span><i className="is-selected" />{t('home2.selectedSpace')}</span></Box><Typography>{t('home2.selectedBay')}: <strong dir="ltr">{selectedSlot}</strong></Typography></Box>
  </Paper>;
}

function DoorStatusPanel({ language, parkingInfo, refreshing, onRefresh }: { language: Language; parkingInfo: Home3ParkingInfo | null; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  return <Box className="home3-gates-panel">
    <Box className="home3-panel-heading"><Box><Typography className="home3-panel-title">{t('home2.gateStatus')}</Typography></Box><Box className="home3-gate-heading-actions"><Tooltip title={t('home2.refresh')}><span><IconButton className="home3-gate-refresh" size="small" aria-label={t('home2.refresh')} onClick={onRefresh} disabled={refreshing}><RefreshRoundedIcon fontSize="small" /></IconButton></span></Tooltip><Chip icon={<DoorFrontRoundedIcon />} label={`${t('home2.doorCount')}: ${formatNumber(parkingInfo?.doorCount, language)}`} /></Box></Box>
    <Box className="home3-gate-list">{parkingInfo?.doorStatuses.map((door) => <DoorStatusItem key={door.doorId} language={language} door={door} />)}</Box>
  </Box>;
}

function MetricRail({ language, parkingInfo }: { language: Language; parkingInfo: Home3ParkingInfo | null }) {
  const { t } = useTranslation();
  return <Box className="home3-metric-rail">
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home2.occupancyRate')} value={`${formatNumber(occupancyPercentage(parkingInfo), language)}%`} note={t('home2.occupied')} />
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home2.capacity')} value={formatNumber(parkingInfo?.totalCapacity, language)} note={t('home2.capacity')} />
    <MetricRow icon={<DirectionsCarRoundedIcon />} label={t('home2.occupied')} value={formatNumber(parkingInfo?.occupied, language)} note={t('home2.occupied')} />
    <MetricRow icon={<LocalParkingRoundedIcon />} label={t('home2.available')} value={formatNumber(parkingInfo?.available, language)} note={t('home2.freeCount')} />
    <MetricRow icon={<DoorFrontRoundedIcon />} label={t('home2.doorCount')} value={formatNumber(parkingInfo?.doorCount, language)} note={t('home2.gateStatus')} />
  </Box>;
}

function PanelHeading({ overline, title, icon }: { overline: string; title: string; icon: ReactNode }) {
  return <Box className="home3-panel-heading"><Box><Typography className="home3-panel-overline">{overline}</Typography><Typography className="home3-panel-title">{title}</Typography></Box>{icon}</Box>;
}

function MetricRow({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: ReactNode }) {
  return <Box className="home3-metric-row"><Box className="home3-metric-icon">{icon}</Box><Box><Typography>{label}</Typography><Typography className="home3-metric-value">{value}</Typography><Typography className="home3-metric-note">{note}</Typography></Box></Box>;
}

function DoorStatusItem({ language, door }: { language: Language; door: Home3ParkingInfo['doorStatuses'][number] }) {
  const { t } = useTranslation();
  return <Box className="home3-gate-item">
    <Box className="home3-gate-icon"><DoorFrontRoundedIcon /></Box>
    <Box className="home3-door-copy"><Typography>{door.doorTitle}</Typography><Typography className={door.isActive ? 'is-active' : 'is-inactive'}>{door.isActive ? t('common.active') : t('common.inactive')}</Typography></Box>
    <Box className="home3-door-metrics"><Typography>{t('home2.trafficToday')}<strong>{formatNumber(door.trafficCount, language)}</strong></Typography><Typography>{t('home2.lastTraffic')}<strong dir="ltr">{door.lastTrafficDateTime ? formatDateTime(door.lastTrafficDateTime, language) : ''}</strong></Typography></Box>
  </Box>;
}
