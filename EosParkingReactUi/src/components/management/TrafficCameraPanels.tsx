import { useEffect, useRef, useState } from 'react';
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
import { parkingApi, type Camera } from '../../api/management';
import {
  HshDetectionConnection,
  parseHshDetectionConfig,
  type HshDetectionHandler,
  type HshDetectionStatus,
} from '../../api/hshDetectionRealtime';
import { CameraStreamPreview } from './CameraStreamPreview';
import { parseShahabDetectionConfig } from '../../api/shahabDetectionConfig';
import { useShahabTrafficDetection } from '../../features/traffic/useShahabTrafficDetection';
import type { Language } from './managementTypes';
import { formatDateTime } from '../../utils/formatters';
import type { ShahabHistorySnapshot, ShahabHistoryStatus } from '../../api/shahabTrafficRealtime';

type Props = {
  doorId: string;
  language: Language;
  onDetection?: HshDetectionHandler;
  onHistory?: (snapshot: ShahabHistorySnapshot) => void;
  onHistoryStatus?: (status: ShahabHistoryStatus) => void;
  historyOpen?: boolean;
};
type RecordValue = Record<string, unknown>;
type CameraTab = 'entry' | 'exit';


function unwrap(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const value = input as RecordValue;
  return value.Values ?? value.values ?? value.Data ?? value.data ?? input;
}

function record(input: unknown): RecordValue | null {
  const value = unwrap(input);
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : null;
}

function field(row: RecordValue | null, ...keys: string[]) {
  return keys.map((key) => row?.[key] ?? row?.[key.charAt(0).toLowerCase() + key.slice(1)]).find((value) => value !== undefined && value !== null);
}

function listFrom(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  const row = record(input);
  if (!row) return [];
  if (field(row, 'Id', 'DeviceId', 'EquipmentId', 'CameraId', 'DeviceType') !== undefined) return [row];
  return Object.values(row);
}

function isCamera(row: RecordValue) {
  const type = String(field(row, 'DeviceType', 'EquipmentType', 'Type') ?? '').toLowerCase();
  return type === '0' || type.includes('camera') || type.includes('دوربین') || field(row, 'CameraId') !== undefined;
}

function linkedCameraRows(input: unknown): Array<{ row: RecordValue; trafficType: unknown }> {
  const root = record(input);
  const linked = root ? field(root, 'DtoViewEquipments', 'ViewEquipments', 'Equipments') : input;
  const rows = listFrom(linked).map((item): { row: RecordValue; trafficType: unknown } | null => {
    const pair = record(item);
    if (!pair) return null;
    const row = record(field(pair, 'Key', 'Equipment', 'Device')) ?? pair;
    return isCamera(row) ? { row, trafficType: field(pair, 'Value', 'TrafficType') as unknown } : null;
  });
  return rows.filter((item): item is { row: RecordValue; trafficType: unknown } => item !== null);
}

function cameraFrom(input: unknown, fallbackName: string, direction: Camera['direction']): Camera | null {
  const initial = record(input);
  const row = record(field(initial, 'Key', 'Equipment', 'Device')) ?? initial;
  if (!row) return null;
  const id = field(row, 'CameraId', 'Id', 'DeviceId', 'EquipmentId');
  if (id === undefined || id === null || id === '') return null;
  return {
    cameraId: String(id),
    name: String(field(row, 'DeviceName', 'CameraName', 'CameraTitle', 'Name') ?? fallbackName),
    rtspUrl: String(field(row, 'RtspUrl', 'RTSPUrl', 'RTSPURL') ?? '').trim() || undefined,
    enabled: field(row, 'Disabled') !== true && String(field(row, 'Disabled') ?? '').toLowerCase() !== 'true',
    detectionServerAddress: String(field(row, 'DetectionServerAddress') ?? ''),
    direction,
  };
}

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

export function TrafficCameraPanels({ doorId, language, onDetection, onHistory, onHistoryStatus, historyOpen }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const panelRef = useRef<HTMLElement>(null);
  const [enlargeError, setEnlargeError] = useState(false);
  const [entryCamera, setEntryCamera] = useState<Camera | null>(null);
  const [exitCamera, setExitCamera] = useState<Camera | null>(null);
  const [activeTab, setActiveTab] = useState<CameraTab>('entry');
  const [simultaneousView, setSimultaneousView] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectionError, setDetectionError] = useState('');
  const [viewer] = useState(viewerId);
  const { status: shahabStatus, lastMessageAt } = useShahabTrafficDetection(doorId, entryCamera, exitCamera, onDetection, onHistory, onHistoryStatus, historyOpen);

  useEffect(() => {
    let active = true;
    setEntryCamera(null);
    setExitCamera(null);
    setActiveTab('entry');
    setError('');
    if (!doorId) return () => { active = false; };
    setCameraLoading(true);
    Promise.all([parkingApi.getDoor(Number(doorId)), parkingApi.getDoorDevices(Number(doorId)).catch(() => null)]).then(([response, devicesResponse]) => {
      const row = record(response);
      const entryLabel = t('trafficLayout.entryCamera');
      const exitLabel = t('trafficLayout.exitCamera');
      const directEntry = cameraFrom(field(row, 'EnteranceCamera', 'EntranceCamera'), entryLabel, 'entry');
      const directExit = cameraFrom(field(row, 'ExitCamera'), exitLabel, 'exit');
      const linked = linkedCameraRows(response);
      const devices = listFrom(devicesResponse).map((item) => record(item)).filter((item): item is RecordValue => Boolean(item && isCamera(item)));
      const entryLinked = linked.find((item) => String(item.trafficType ?? '') === '0')?.row;
      const exitLinked = linked.find((item) => String(item.trafficType ?? '') === '1')?.row;
      const entry = directEntry ?? cameraFrom(entryLinked ?? devices[0], entryLabel, 'entry');
      const exit = directExit ?? cameraFrom(exitLinked ?? devices[1], exitLabel, 'exit');
      if (active) { setEntryCamera(entry); setExitCamera(exit); setActiveTab(entry ? 'entry' : 'exit'); }
    }).catch(() => { if (active) setError(t('trafficLayout.cameraError')); })
      .finally(() => { if (active) setCameraLoading(false); });
    return () => { active = false; };
  }, [doorId, language, t]);

  useEffect(() => {
    const cameras = [entryCamera, exitCamera].filter((camera): camera is Camera => Boolean(camera?.cameraId));
    if (!onDetection || cameras.length === 0) return undefined;

    let active = true;
    const connections: HshDetectionConnection[] = [];
    setDetectionError('');

    const start = async () => {
      await Promise.all(cameras.map(async (camera) => {
        const configValue = camera.detectionServerAddress?.trim();
        if (!configValue || camera.enabled === false || parseShahabDetectionConfig(configValue)) return;
        const config = parseHshDetectionConfig(configValue);
        if (!config) {
          if (active) setDetectionError(t('trafficLayout.detectionConfigError'));
          return;
        }
        const connection = new HshDetectionConnection(config, camera.cameraId);
        connections.push(connection);
        const handleDetection: HshDetectionHandler = (event, loadArtifact) => onDetection(
          {
            ...event,
            source: { ...event.source, direction: camera.direction },
          },
          loadArtifact,
        );
        await connection.start(handleDetection, (status: HshDetectionStatus) => {
          if (!active) return;
          if (status.state === 'error' || status.state === 'cursor-expired') {
            setDetectionError(t('trafficLayout.detectionError'));
          } else if (status.state === 'connected') {
            setDetectionError('');
          }
        });
      }));
    };

    void start();
    return () => {
      active = false;
      void Promise.all(connections.map((connection) => connection.stop()));
    };
  }, [entryCamera, exitCamera, language, onDetection, t]);

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
            language={language} viewer={`${viewer}-${doorId}-${camera.direction}-${camera.cameraId}`}
            size={{ width: '100%', height: 210 }} showConnectionButton={false} showModeSwitcher={false} showRoiAction={false} autoConnect compact />
        </Box>)}
      </Box>}
      {!cameraLoading && !activeCamera && (entryCamera || exitCamera) && <Typography variant="body2" color="text.secondary">{t('trafficLayout.cameraUnavailable')}</Typography>}
    </Paper>
  </Box>;
}
