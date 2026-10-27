import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocalActivityRoundedIcon from '@mui/icons-material/LocalActivityRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';

type Labels = {
  homeTitle: string;
  liveStatus: string; allSystemsNormal: string; lastSync: string; overviewLabel: string;
  freeSpaces: string; occupiedSpaces: string; activeSpace: string; controlPanel: string;
  parkingOperations: string; gateReady: string; stableConnection: string; capacityLabel: string;
  openGates: string; quickAccess: string; traffic: string; users: string; occupancy: string;
  yesterdayComparison: string; todayTraffic: string; registeredTraffic: string;
  parkingMap: string;
};

type Props = { labels: Labels; selectedParkingName: string; selectedParkingId: number; basePath: '/home' | '/home2'; onNavigate: (path: string) => void };

const slots = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
const occupiedSlots = new Set(['A3', 'A4', 'B2', 'B3', 'C2']);

export function HomeDashboard2({ labels: t, selectedParkingName, selectedParkingId, basePath, onNavigate }: Props) {
  return (
    <Box className="home2-command-desk">
      <Paper className="home2-system-bar" elevation={0}>
        <Box className="home2-system-title">
          <Typography className="home2-system-code">PARKING CONTROL / 02</Typography>
          <Typography variant="h4">{t.homeTitle}</Typography>
          <Typography variant="body2" color="text.secondary">{selectedParkingName} · {t.lastSync}</Typography>
        </Box>
        <Box className="home2-system-status"><span className="home2-status-mark"><CheckCircleRoundedIcon /></span><Box><Typography className="home-section-label">{t.liveStatus}</Typography><Typography variant="body2">{t.allSystemsNormal}</Typography></Box></Box>
        <Box className="home2-system-actions"><Button variant="contained" startIcon={<TrafficRoundedIcon />} onClick={() => onNavigate(`${basePath}/parking/monitoring`)}>{t.traffic}</Button><Button variant="outlined" startIcon={<PeopleAltRoundedIcon />} onClick={() => onNavigate(`${basePath}/management/users`)}>{t.users}</Button></Box>
      </Paper>

      <Box className="home2-board-grid">
        <Paper className="home2-map-panel" elevation={0}>
          <Box className="home2-panel-heading"><Box><Typography className="home2-panel-kicker">{t.overviewLabel}</Typography><Typography variant="h6">{t.parkingMap}</Typography><Typography variant="body2" color="text.secondary">{selectedParkingName}</Typography></Box><Typography className="home2-map-code" dir="ltr">PARK / 0{selectedParkingId}</Typography></Box>
          <Divider />
          <Box className="home2-map-canvas" aria-label={t.parkingMap}>
            <Box className="home2-map-lane home2-map-lane-one" /><Box className="home2-map-lane home2-map-lane-two" />
            <Box className="home2-map-gate"><MeetingRoomRoundedIcon /><Typography variant="caption">{t.openGates}</Typography></Box>
            <Box className="home2-bay-grid">{slots.map((slot, index) => <Box key={slot} className={`home2-bay ${slot === 'A1' ? 'is-active' : ''} ${occupiedSlots.has(slot) ? 'is-occupied' : ''}`}><Typography variant="caption">{slot}</Typography>{occupiedSlots.has(slot) && <DirectionsCarRoundedIcon />}<Box className="home2-bay-light" /></Box>)}</Box>
            <Box className="home2-map-scan-line" />
          </Box>
          <Box className="home2-map-footer"><Typography><span className="home2-legend-dot free" />{t.freeSpaces}</Typography><Typography><span className="home2-legend-dot occupied" />{t.occupiedSpaces}</Typography><Typography><span className="home2-legend-dot active" />{t.activeSpace}</Typography></Box>
        </Paper>

        <Box className="home2-side-rail">
          <Paper className="home2-operations-panel" elevation={0}>
            <Box className="home2-panel-heading"><Box className="home2-panel-icon"><LocalActivityRoundedIcon /></Box><Box><Typography className="home2-panel-kicker">{t.controlPanel}</Typography><Typography variant="h6">{t.parkingOperations}</Typography></Box></Box>
            <Box className="home2-ready-row"><CheckCircleRoundedIcon /><Box><Typography variant="body2">{t.gateReady}</Typography><Typography variant="caption" color="text.secondary">{t.stableConnection}</Typography></Box></Box>
            <Box className="home2-control-readout"><Box><Typography variant="caption" color="text.secondary">{t.capacityLabel}</Typography><Typography variant="h5">320</Typography></Box><Box><Typography variant="caption" color="text.secondary">{t.openGates}</Typography><Typography variant="h5">4 / 4</Typography></Box></Box>
            <Divider />
            <Typography className="home2-panel-kicker">{t.quickAccess}</Typography>
            <Box className="home2-quick-actions"><Button variant="contained" startIcon={<TrafficRoundedIcon />} onClick={() => onNavigate(`${basePath}/parking/traffic-records`)}>{t.traffic}</Button><Button variant="outlined" startIcon={<PeopleAltRoundedIcon />} onClick={() => onNavigate(`${basePath}/parking/members`)}>{t.users}</Button></Box>
          </Paper>

          <Paper className="home2-insight-panel" elevation={0}>
            <Typography className="home2-panel-kicker">{t.todayTraffic}</Typography>
            <Box className="home2-insight-value"><Typography variant="h3">1,284</Typography><Typography variant="caption">{t.registeredTraffic}</Typography></Box>
            <Box className="home2-insight-bar"><span /></Box>
            <Box className="home2-insight-footer"><span>{t.occupancy}</span><strong>68%</strong><span className="positive">{t.yesterdayComparison}</span></Box>
          </Paper>
        </Box>
      </Box>

      <Box className="home2-metric-line" aria-label={t.todayTraffic}>
        <Box><LocalParkingRoundedIcon /><Typography><span>{t.capacityLabel}</span><strong>320</strong></Typography></Box>
        <Box><DirectionsCarRoundedIcon /><Typography><span>{t.todayTraffic}</span><strong>1,284</strong></Typography></Box>
        <Box><MeetingRoomRoundedIcon /><Typography><span>{t.openGates}</span><strong>4 / 4</strong></Typography></Box>
        <Box><CheckCircleRoundedIcon /><Typography><span>{t.liveStatus}</span><strong>{t.stableConnection}</strong></Typography></Box>
      </Box>
    </Box>
  );
}
