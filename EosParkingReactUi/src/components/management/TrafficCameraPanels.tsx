import { useTrafficCameras } from '../../features/traffic/useTrafficCameras';
import { useTrafficCameraDetection } from '../../features/traffic/useTrafficCameraDetection';
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import type { CameraFrameCapture, TrafficCameraCapture } from '../../features/traffic/trafficImageCapture';
import { Box, CircularProgress, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { ConnectionStatusIndicator } from '../ConnectionStatusIndicator';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import TabRoundedIcon from '@mui/icons-material/TabRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { useTranslation } from 'react-i18next';
import { AppToast } from '../AppToast';
import type { Camera } from '../../api/management';
import type { HshDetectionHandler } from '../../api/hshDetectionRealtime';
import { CameraStreamPreview } from './CameraStreamPreview';
import { useShahabTrafficDetection } from '../../features/traffic/useShahabTrafficDetection';
import type { Language } from './managementTypes';
import { formatDateTime } from '../../utils/formatters';
import type { ShahabHistorySnapshot, ShahabHistoryStatus } from '../../api/shahabTrafficRealtime';

type Props = {
  captureRef?: Ref<TrafficCameraCapture>;
  operationDirection?: 'entry' | 'exit';
  doorId: string;
  language: Language;
  onDetection?: HshDetectionHandler;
  onHistory?: (snapshot: ShahabHistorySnapshot) => void;
  onHistoryStatus?: (status: ShahabHistoryStatus) => void;
  historyOpen?: boolean;
};
type CameraTab = 'entry' | 'exit';


function viewerId() {
  const key = 'parking-viewer-id';
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next = globalThis.crypto?.randomUUID?.() ?? `traffic-control-${Date.now()}`;
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return globalThis.crypto?.randomUUID?.() ?? `traffic-control-${Date.now()}`;
  }
}

export function TrafficCameraPanels({ doorId, language, onDetection, onHistory, onHistoryStatus, historyOpen, captureRef, operationDirection }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const panelRef = useRef<HTMLElement>(null);
  const [enlargeError, setEnlargeError] = useState(false);
  const { entryCamera, exitCamera, loading: cameraLoading, error } = useTrafficCameras(doorId, language);
  const [activeTab, setActiveTab] = useState<CameraTab>('entry');
  const [simultaneousView, setSimultaneousView] = useState(false);
  const [viewer] = useState(viewerId);
  const entryCapture = useRef<CameraFrameCapture>(null);
  const exitCapture = useRef<CameraFrameCapture>(null);
  useImperativeHandle(captureRef, () => ({
    capture: direction => (direction === 'entry' ? entryCapture : exitCapture).current?.capture() ?? null,
  }), [doorId]);
  const { status: shahabStatus, lastMessageAt } = useShahabTrafficDetection(doorId, entryCamera, exitCamera, onDetection, onHistory, onHistoryStatus, historyOpen);

  useEffect(() => { setActiveTab(entryCamera ? 'entry' : 'exit'); }, [entryCamera, exitCamera]);
  useEffect(() => {
    if (operationDirection && (operationDirection === 'entry' ? entryCamera : exitCamera)) setActiveTab(operationDirection);
  }, [operationDirection, entryCamera, exitCamera]);
  const detectionFailure = useTrafficCameraDetection(entryCamera, exitCamera, onDetection);
  const detectionError = detectionFailure ? t(detectionFailure === 'configuration' ? 'trafficLayout.detectionConfigError' : 'trafficLayout.detectionError') : '';

  const activeCamera = activeTab === 'entry' ? entryCamera : exitCamera;
  const hasBothCameras = Boolean(entryCamera && exitCamera);
  const showBothCameras = simultaneousView && hasBothCameras;
  const viewActionLabel = t(showBothCameras ? 'trafficLayout.showCameraTabs' : 'trafficLayout.showBothCameras');
  // Stable keys preserve the active preview; distinct viewers keep the backend from ejecting the other camera.
  const visibleCameras = [entryCamera, exitCamera].filter((camera): camera is Camera => Boolean(camera && (showBothCameras || camera === activeCamera)));
  const shahabPending = shahabStatus === 'connecting' || shahabStatus === 'reconnecting';
  const shahabLabel = shahabStatus ? t('trafficLayout.shahabStatus', { status: t(`trafficLayout.shahabStates.${shahabStatus}`) }) : '';

  return <Box ref={panelRef} className="traffic-camera-panel" sx={{ minWidth: 0, height: '100%' }}>
    <Paper variant="outlined" sx={{ p: 1, minWidth: 0, height: '100%', boxSizing: 'border-box' }}>
      <Box className="traffic-camera-toolbar">
      <Box className="traffic-camera-view-heading">
      {hasBothCameras && !showBothCameras && <Tabs value={activeTab} onChange={(_event, value: CameraTab) => setActiveTab(value)} variant="fullWidth" sx={{ minHeight: 34, mb: 0.5 }}>
        <Tab value="entry" label={t('trafficLayout.entry')} sx={{ minHeight: 34, py: 0.25 }} />
        <Tab value="exit" label={t('trafficLayout.exit')} sx={{ minHeight: 34, py: 0.25 }} />
      </Tabs>}
      {showBothCameras && <Typography variant="caption" noWrap>{t('trafficLayout.bothCameras')}</Typography>}
      </Box>
      <Tooltip title={t('trafficLayout.enlarge')}><span><IconButton size="small" disabled={!activeCamera} aria-label={t('trafficLayout.enlarge')}
        onClick={() => {
          const request = panelRef.current?.requestFullscreen?.();
          if (request) void request.catch(() => setEnlargeError(true));
          else setEnlargeError(true);
        }}><FullscreenRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
      {shahabStatus && <Tooltip describeChild title={<Box>
        <Typography variant="inherit">{shahabLabel}</Typography>
        <Typography variant="inherit">{lastMessageAt
          ? t('trafficLayout.shahabLastMessage', { time: formatDateTime(lastMessageAt, language) })
          : t('trafficLayout.shahabNoMessage')}</Typography>
      </Box>}>
        <IconButton size="small" color={shahabStatus === 'connected' ? 'success' : shahabPending ? 'warning' : 'error'} aria-label={shahabLabel}>
          {shahabStatus === 'connected' ? <WifiRoundedIcon fontSize="small" /> : shahabPending ? <SyncRoundedIcon fontSize="small" /> : <WifiOffRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>}
      {detectionError && <Tooltip title={detectionError}>
        <IconButton size="small" color="warning" aria-label={detectionError}><WarningAmberRoundedIcon fontSize="small" /></IconButton>
      </Tooltip>}
      <ConnectionStatusIndicator message={error} />
      {hasBothCameras && <Tooltip title={viewActionLabel}>
        <IconButton size="small" color={showBothCameras ? 'primary' : 'default'} aria-label={viewActionLabel} aria-pressed={showBothCameras}
          onClick={() => setSimultaneousView(value => !value)}>
          {showBothCameras ? <TabRoundedIcon fontSize="small" /> : <ViewColumnRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>}
      </Box>
      <AppToast message={enlargeError ? t('trafficLayout.enlargeError') : ''} severity="warning" onClose={() => setEnlargeError(false)} />
      {cameraLoading && <Box className="inline-status-row"><CircularProgress size={18} /><Typography variant="body2">{t('trafficLayout.cameraLoading')}</Typography></Box>}
      {!cameraLoading && !error && !entryCamera && !exitCamera && <Typography variant="body2" color="text.secondary">{t('trafficLayout.noCamera')}</Typography>}
      {!cameraLoading && visibleCameras.length > 0 && <Box className={`traffic-camera-preview-box${showBothCameras ? ' is-simultaneous' : ''}`} sx={{ minWidth: 0, width: '100%', p: 0, m: 0 }}>
        {visibleCameras.map(camera => <Box key={`${doorId}-${camera.direction}-${camera.cameraId}`} role="group"
          aria-label={t(camera.direction === 'exit' ? 'trafficLayout.exitCamera' : 'trafficLayout.entryCamera')} sx={{ minWidth: 0, p: 0, m: 0 }}>
          <CameraStreamPreview camera={{ ...camera, name: `${t(camera.direction === 'exit' ? 'trafficLayout.exitCamera' : 'trafficLayout.entryCamera')}: ${camera.name}` }}
            frameCaptureRef={camera.direction === 'exit' ? exitCapture : entryCapture}
            language={language} viewer={`${viewer}-${doorId}-${camera.direction}-${camera.cameraId}`}
            size={{ width: '100%', height: 210 }} showConnectionButton={false} showModeSwitcher={false} showRoiAction={false} autoConnect compact />
        </Box>)}
      </Box>}
      {!cameraLoading && !activeCamera && (entryCamera || exitCamera) && <Typography variant="body2" color="text.secondary">{t('trafficLayout.cameraUnavailable')}</Typography>}
    </Paper>
  </Box>;
}
