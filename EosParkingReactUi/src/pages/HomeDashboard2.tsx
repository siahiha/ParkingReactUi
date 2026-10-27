import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Divider, Paper, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import DoorFrontRoundedIcon from '@mui/icons-material/DoorFrontRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import NorthRoundedIcon from '@mui/icons-material/NorthRounded';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { Language } from '../i18n';

type Props = { language: Language; selectedParkingName: string; selectedParkingId: number; basePath: '/home' | '/home2'; onNavigate: (path: string) => void };

const slots = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
const occupiedSlots = new Set(['A3', 'A4', 'B2', 'B3', 'C2', 'D1', 'D4']);

export function HomeDashboard2({ language, selectedParkingName, selectedParkingId, basePath, onNavigate }: Props) {
  const { t } = useTranslation();
  const [selectedSlot, setSelectedSlot] = useState('A1');
  const formatNumber = (value: number) => value.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
  const navigateTo = (path: string) => onNavigate(`${basePath}${path}`);

  return <Box className="home2-dashboard">
    <Box className="home2-hero">
      <Box className="home2-hero-copy"><Typography className="home2-overline">{t('home2.commandCode')} · {t('home2.commandCenter')}</Typography><Typography component="h1" className="home2-hero-title">{t('home2.commandCenter')}</Typography><Typography className="home2-hero-subtitle">{t('home2.commandSubtitle')}</Typography><Box className="home2-hero-meta"><Chip icon={<LocalParkingRoundedIcon />} label={selectedParkingName} /><Typography dir="ltr">P-{String(selectedParkingId).padStart(2, '0')} / LIVE</Typography></Box></Box>
      <Box className="home2-hero-actions"><Button className="home2-primary-action" variant="contained" endIcon={<ArrowOutwardRoundedIcon />} onClick={() => navigateTo('/parking/traffic-records')}>{t('home2.openTraffic')}</Button><Button className="home2-ghost-action" variant="outlined" onClick={() => navigateTo('/parking/monitoring')}>{t('home2.openMonitoring')}</Button></Box>
      <Box className="home2-hero-orbit" aria-hidden="true"><Box className="home2-orbit-ring ring-one" /><Box className="home2-orbit-ring ring-two" /><Box className="home2-orbit-core"><CheckCircleRoundedIcon /><Typography>98%</Typography></Box></Box>
    </Box>

    <Box className="home2-stat-grid">
      <Paper className="home2-stat-card home2-stat-primary" elevation={0}><Box className="home2-stat-icon"><LocalParkingRoundedIcon /></Box><Box><Typography>{t('home2.occupancyRate')}</Typography><Typography className="home2-stat-value">68<span>%</span></Typography><Typography className="home2-stat-note"><TrendingUpRoundedIcon />{t('home2.increase')} 4% {t('home2.comparedToYesterday')}</Typography></Box></Paper>
      <Paper className="home2-stat-card" elevation={0}><Box className="home2-stat-icon"><DirectionsCarRoundedIcon /></Box><Box><Typography>{t('home2.trafficVolume')}</Typography><Typography className="home2-stat-value">{formatNumber(1284)}</Typography><Typography className="home2-stat-note">{t('home2.totalTraffic')}</Typography></Box></Paper>
      <Paper className="home2-stat-card" elevation={0}><Box className="home2-stat-icon"><DoorFrontRoundedIcon /></Box><Box><Typography>{t('home2.gateStatus')}</Typography><Typography className="home2-stat-value">4<span>/4</span></Typography><Typography className="home2-stat-note"><CheckCircleRoundedIcon />{t('home2.allGatesReady')}</Typography></Box></Paper>
      <Paper className="home2-stat-card" elevation={0}><Box className="home2-stat-icon"><LocalParkingRoundedIcon /></Box><Box><Typography>{t('home2.freeCount')}</Typography><Typography className="home2-stat-value">{formatNumber(102)}</Typography><Typography className="home2-stat-note">{t('home2.capacity')} 320</Typography></Box></Paper>
    </Box>

    <Box className="home2-workspace-grid">
      <Paper className="home2-map-card" elevation={0}>
        <Box className="home2-panel-header"><Box><Typography className="home2-panel-overline">{t('home2.liveOverview')}</Typography><Typography className="home2-panel-title">{t('home2.spaceMap')}</Typography></Box><Box className="home2-panel-header-actions"><Typography className="home2-live-label"><span />{t('home2.online')}</Typography><Typography className="home2-map-code" dir="ltr">P-{String(selectedParkingId).padStart(2, '0')}</Typography></Box></Box>
        <Divider />
        <Box className="home2-map-stage" aria-label={t('home2.spaceMap')}>
          <Box className="home2-map-axis axis-x"><span>A</span><span>B</span><span>C</span><span>D</span></Box><Box className="home2-map-axis axis-y"><span>01</span><span>02</span><span>03</span><span>04</span></Box>
          <Box className="home2-map-road road-one" /><Box className="home2-map-road road-two" /><Box className="home2-map-road road-three" />
          <Box className="home2-map-gate gate-north"><NorthRoundedIcon /><span>{t('home2.gateNorth')}</span></Box><Box className="home2-map-gate gate-south"><SouthRoundedIcon /><span>{t('home2.gateSouth')}</span></Box>
          <Box className="home2-slot-grid">{slots.map((slot) => { const occupied = occupiedSlots.has(slot); const selected = selectedSlot === slot; return <Button key={slot} className={`home2-slot ${occupied ? 'is-occupied' : 'is-free'} ${selected ? 'is-selected' : ''}`} onClick={() => setSelectedSlot(slot)} aria-label={`${t('home2.selectedBay')}: ${slot}`} aria-pressed={selected}><Typography component="span">{slot}</Typography>{occupied && <DirectionsCarRoundedIcon />}</Button>; })}</Box>
        </Box>
        <Box className="home2-map-footer"><Box className="home2-map-legend"><span><i className="is-free" />{t('home2.freeSpace')}</span><span><i className="is-occupied" />{t('home2.occupiedSpace')}</span><span><i className="is-selected" />{t('home2.selectedSpace')}</span></Box><Typography className="home2-selection-readout">{t('home2.selectedBay')}: <strong dir="ltr">{selectedSlot}</strong></Typography></Box>
      </Paper>

      <Paper className="home2-activity-card" elevation={0}><Box className="home2-panel-header"><Box><Typography className="home2-panel-overline">{t('home2.operationalPulse')}</Typography><Typography className="home2-panel-title">{t('home2.activity')}</Typography></Box><TimelineRoundedIcon className="home2-panel-header-icon" /></Box><Box className="home2-activity-chart">{[34, 58, 44, 76, 62, 88, 70, 96, 82, 74].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</Box><Box className="home2-activity-summary"><Typography>{t('home2.entry')} <strong>{formatNumber(746)}</strong></Typography><Typography>{t('home2.exit')} <strong>{formatNumber(538)}</strong></Typography><Typography>{t('home2.peakHour')} <strong dir="ltr">18:00</strong></Typography></Box><Divider /><Box className="home2-activity-list"><ActivityItem icon={<DirectionsCarRoundedIcon />} title={t('home2.activityOne')} time={t('home2.justNow')} /><ActivityItem icon={<GroupsRoundedIcon />} title={t('home2.activityTwo')} time={`12 ${t('home2.minutesAgo')}`} /><ActivityItem icon={<AssessmentRoundedIcon />} title={t('home2.activityThree')} time={t('home2.hourAgo')} /></Box><Button className="home2-text-action" onClick={() => navigateTo('/parking/traffic-records')}>{t('home2.viewAllActivity')}<ArrowOutwardRoundedIcon /></Button></Paper>

      <Paper className="home2-gates-card" elevation={0}><Box className="home2-panel-header"><Box><Typography className="home2-panel-overline">{t('home2.systemStatus')}</Typography><Typography className="home2-panel-title">{t('home2.gateStatus')}</Typography></Box><Chip className="home2-status-chip" icon={<CheckCircleRoundedIcon />} label={t('home2.stable')} /></Box><Box className="home2-gate-list"><GateItem icon={<NorthRoundedIcon />} name={t('home2.gateNorth')} value="2 / 2" status={t('home2.stable')} /><GateItem icon={<SouthRoundedIcon />} name={t('home2.gateSouth')} value="2 / 2" status={t('home2.stable')} /></Box><Box className="home2-gate-actions"><Button variant="contained" startIcon={<MonitorHeartRoundedIcon />} onClick={() => navigateTo('/parking/monitoring')}>{t('home2.openMonitoring')}</Button><Button variant="outlined" startIcon={<AssessmentRoundedIcon />} onClick={() => navigateTo('/parking/traffic-reports-list')}>{t('home2.openReports')}</Button></Box></Paper>
    </Box>

    <Box className="home2-quick-section"><Box className="home2-section-heading"><Box><Typography className="home2-panel-overline">{t('home2.selectAction')}</Typography><Typography className="home2-panel-title">{t('home2.quickActions')}</Typography></Box><Typography className="home2-section-heading-note">{t('home2.lastSync')}</Typography></Box><Box className="home2-quick-grid"><QuickAction icon={<DirectionsCarRoundedIcon />} title={t('home2.openTraffic')} subtitle={t('home2.trafficVolume')} onClick={() => navigateTo('/parking/traffic-records')} /><QuickAction icon={<GroupsRoundedIcon />} title={t('home2.openMembers')} subtitle={t('home2.activityTwo')} onClick={() => navigateTo('/parking/members')} /><QuickAction icon={<AssessmentRoundedIcon />} title={t('home2.openReports')} subtitle={t('home2.totalTraffic')} onClick={() => navigateTo('/parking/traffic-reports-list')} /></Box></Box>
  </Box>;
}

function ActivityItem({ icon, title, time }: { icon: ReactNode; title: string; time: string }) {
  return <Box className="home2-activity-item"><Box className="home2-activity-icon">{icon}</Box><Box><Typography>{title}</Typography><Typography>{time}</Typography></Box></Box>;
}

function GateItem({ icon, name, value, status }: { icon: ReactNode; name: string; value: string; status: string }) {
  return <Box className="home2-gate-item"><Box className="home2-gate-icon">{icon}</Box><Box className="home2-gate-name"><Typography>{name}</Typography><Typography>{status}</Typography></Box><Typography className="home2-gate-value" dir="ltr">{value}</Typography></Box>;
}

function QuickAction({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return <Button className="home2-quick-action" onClick={onClick}><Box className="home2-quick-action-icon">{icon}</Box><Box><Typography>{title}</Typography><Typography>{subtitle}</Typography></Box><ArrowOutwardRoundedIcon className="home2-quick-action-arrow" /></Button>;
}
