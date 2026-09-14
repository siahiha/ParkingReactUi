import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';

type Labels = {
  liveStatus: string; allSystemsNormal: string; lastSync: string; overviewLabel: string;
  freeSpaces: string; occupiedSpaces: string; activeSpace: string; controlPanel: string;
  parkingOperations: string; gateReady: string; stableConnection: string; capacityLabel: string;
  openGates: string; quickAccess: string; traffic: string; users: string; occupancy: string;
  yesterdayComparison: string; todayTraffic: string; registeredTraffic: string; rawNote: string;
};

type Props = { labels: Labels; selectedParkingName: string; selectedParkingId: number };

export function HomeDashboard({ labels: t, selectedParkingName, selectedParkingId }: Props) {
  return (
    <Box className="home-command-center">
      <Paper className="home-status-strip" elevation={0}>
        <Box className="home-status-summary"><Box className="status-icon status-icon-success"><CheckCircleRoundedIcon /></Box><Box><Typography className="home-section-label">{t.liveStatus}</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{t.allSystemsNormal}</Typography></Box></Box>
        <Typography variant="caption" color="text.secondary">{t.lastSync}</Typography>
      </Paper>
      <Box className="home-command-grid">
        <Paper className="home-parking-map" elevation={0}>
          <Box className="map-heading"><Box><Typography className="home-section-label">{t.overviewLabel}</Typography><Typography variant="h6">{selectedParkingName}</Typography></Box><Typography className="map-heading-code">PARK / 0{selectedParkingId}</Typography></Box>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,.14)' }} />
          <Box className="home-map-canvas"><Box className="map-route map-route-one" /><Box className="map-route map-route-two" /><Box className="map-gate-mark"><MeetingRoomRoundedIcon /><Typography>GATE 01</Typography></Box><Box className="home-bay-grid">{['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'].map((slot, index) => <Box key={slot} className={`home-bay ${slot === 'A1' ? 'is-active' : ''} ${[2, 3, 5, 6, 9].includes(index) ? 'is-occupied' : ''}`}><Typography>{slot}</Typography><DirectionsCarRoundedIcon /></Box>)}</Box><Box className="map-live-pulse" /></Box>
          <Box className="map-legend"><Typography><Box component="span" className="legend-dot legend-free" />{t.freeSpaces}</Typography><Typography><Box component="span" className="legend-dot legend-occupied" />{t.occupiedSpaces}</Typography><Typography><Box component="span" className="legend-dot legend-active" />{t.activeSpace}</Typography></Box>
        </Paper>
        <Paper className="home-control-panel" elevation={0}>
          <Box className="control-panel-heading"><Box className="workspace-heading-mark"><LocalActivityRoundedIcon /></Box><Box><Typography className="home-section-label">{t.controlPanel}</Typography><Typography variant="h6">{t.parkingOperations}</Typography></Box></Box>
          <Box className="control-signal"><CheckCircleRoundedIcon /><Box><Typography variant="body2" sx={{ fontWeight: 800 }}>{t.gateReady}</Typography><Typography variant="caption" color="text.secondary">{t.stableConnection}</Typography></Box></Box>
          <Box className="control-stats"><Box><Typography variant="caption" color="text.secondary">{t.capacityLabel}</Typography><Typography variant="h6">320</Typography></Box><Box><Typography variant="caption" color="text.secondary">{t.openGates}</Typography><Typography variant="h6">4 / 4</Typography></Box></Box>
          <Divider sx={{ my: 2 }} /><Typography className="home-section-label">{t.quickAccess}</Typography><Box className="home-quick-actions"><Button variant="contained" startIcon={<TrafficRoundedIcon />}>{t.traffic}</Button><Button variant="outlined" startIcon={<PeopleAltRoundedIcon />}>{t.users}</Button></Box>
        </Paper>
      </Box>
      <Box className="home-metrics-grid">
        <Paper className="home-metric-card" elevation={0}><Box className="metric-icon metric-icon-blue"><LocalParkingRoundedIcon /></Box><Box><Typography variant="caption" color="text.secondary">{t.occupancy}</Typography><Typography variant="h2">68%</Typography><Typography variant="caption" color="success.main">{t.yesterdayComparison}</Typography></Box></Paper>
        <Paper className="home-metric-card" elevation={0}><Box className="metric-icon metric-icon-green"><DirectionsCarRoundedIcon /></Box><Box><Typography variant="caption" color="text.secondary">{t.todayTraffic}</Typography><Typography variant="h2">1,284</Typography><Typography variant="caption" color="text.secondary">{t.registeredTraffic}</Typography></Box></Paper>
        <Paper className="home-metric-card" elevation={0}><Box className="metric-icon metric-icon-amber"><MeetingRoomRoundedIcon /></Box><Box><Typography variant="caption" color="text.secondary">{t.openGates}</Typography><Typography variant="h2">4 / 4</Typography><Typography variant="caption" color="success.main">{t.stableConnection}</Typography></Box></Paper>
      </Box>
      <Paper className="home-workspace home-quick-workspace" elevation={0}><Box className="workspace-heading"><Box><Typography variant="h6">{t.quickAccess}</Typography><Typography variant="body2" color="text.secondary">{t.rawNote}</Typography></Box><Box className="workspace-heading-mark"><LocalActivityRoundedIcon /></Box></Box><Divider sx={{ my: 2 }} /><Box className="home-quick-actions home-quick-actions-inline"><Button variant="contained" startIcon={<TrafficRoundedIcon />}>{t.traffic}</Button><Button variant="outlined" startIcon={<PeopleAltRoundedIcon />}>{t.users}</Button></Box></Paper>
    </Box>
  );
}
