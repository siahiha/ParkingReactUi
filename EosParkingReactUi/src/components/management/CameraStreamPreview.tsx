import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import PowerOffRoundedIcon from '@mui/icons-material/PowerOffRounded';
import PowerRoundedIcon from '@mui/icons-material/PowerRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Hls from 'hls.js';
import '../../vendor/mediamtx-reader.js';
import { ApiError } from '../../api/client';
import { cameraApi, type Camera, type CameraRoi, type CameraStatus, type CameraStatusState } from '../../api/management';
import { appConfig } from '../../config';
import type { Language } from './managementTypes';

export type CameraStreamMode = 'Hls' | 'WebRTC';
export type CameraStreamSize = number | { width: number | string; height: number | string };

export type CameraStreamPreviewProps = {
  camera: Camera;
  language: Language;
  viewer: string;
  /** Preview size. A number creates a square preview; default is 200x200. */
  size?: CameraStreamSize;
  /** Native video play/pause and progress controls. Hidden by default. */
  showPlaybackControls?: boolean;
  /** Shows the status icon and its error tooltip. */
  showStatus?: boolean;
  /** Shows the combined connect/disconnect toolbar button. */
  showConnectionButton?: boolean;
  /** Shows the small protocol-switch arrow in the toolbar. */
  showModeSwitcher?: boolean;
  /** Allows the caller to hide ROI action while keeping the preview reusable. */
  showRoiAction?: boolean;
};

const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;

function statusLabel(state: CameraStatusState, language: Language) {
  const labels: Record<CameraStatusState, [string, string]> = {
    Disconnected: ['قطع شده', 'Disconnected'],
    Connecting: ['در حال اتصال', 'Connecting'],
    Connected: ['متصل', 'Connected'],
    Failed: ['خطا', 'Failed'],
    Stopping: ['در حال قطع اتصال', 'Stopping'],
  };
  return (labels[state] ?? labels.Disconnected)[language === 'fa' ? 0 : 1];
}

function statusColor(state: CameraStatusState) {
  if (state === 'Connected') return 'success.main';
  if (state === 'Connecting' || state === 'Stopping') return 'warning.main';
  if (state === 'Failed') return 'error.main';
  return 'text.disabled';
}

function asRois(input: unknown): CameraRoi[] {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const data = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  return Array.isArray(data) ? data.filter((item): item is CameraRoi => Boolean(item && typeof item === 'object')) : [];
}

function normalizeStatus(input: unknown, fallback: CameraStatus): CameraStatus {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const data = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  const response = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const candidate = response.status && typeof response.status === 'object' ? response.status as Record<string, unknown> : response;
  const state = String(candidate.state ?? candidate.State ?? fallback.state) as CameraStatusState;
  const validState: CameraStatusState = ['Disconnected', 'Connecting', 'Connected', 'Failed', 'Stopping'].includes(state) ? state : fallback.state;
  return {
    ...fallback,
    ...candidate,
    cameraId: String(candidate.cameraId ?? candidate.CameraId ?? fallback.cameraId),
    state: validState,
    error: candidate.error == null ? fallback.error : String(candidate.error),
    viewerCount: Number(candidate.viewerCount ?? candidate.ViewerCount ?? fallback.viewerCount),
    streamUrl: String(candidate.streamUrl ?? candidate.StreamUrl ?? fallback.streamUrl ?? ''),
    webRtcUrl: String(candidate.webRtcUrl ?? candidate.WebRtcUrl ?? fallback.webRtcUrl ?? ''),
    lastStateChangeUtc: String(candidate.lastStateChangeUtc ?? candidate.LastStateChangeUtc ?? fallback.lastStateChangeUtc ?? ''),
  } as CameraStatus;
}

function resolveStreamUrl(streamUrl: string): string | null {
  const resource = streamUrl.trim();
  if (!resource) return null;
  try {
    if (/^https?:\/\//i.test(resource)) return new URL(resource).toString();
    const base = appConfig.parkingServiceUrl.trim();
    if (base.startsWith('/')) {
      const path = resource.startsWith(base) ? resource : `${base.replace(/\/$/, '')}/${resource.replace(/^\/+/, '')}`;
      return new URL(path, globalThis.location.origin).toString();
    }
    return new URL(resource, base.endsWith('/') ? base : `${base}/`).toString();
  } catch {
    return null;
  }
}

function connectResponse(input: unknown, fallback: CameraStatus) {
  const root = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const data = root.Values ?? root.values ?? root.Data ?? root.data ?? input;
  const response = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const status = response.status ?? response.Status;
  const streamUrl = response.streamUrl ?? response.StreamUrl;
  const webRtcUrl = response.webRtcUrl ?? response.WebRtcUrl;
  return {
    status: status ? normalizeStatus(status, fallback) : undefined,
    streamUrl: typeof streamUrl === 'string' ? streamUrl : '',
    webRtcUrl: typeof webRtcUrl === 'string' ? webRtcUrl : '',
  };
}

function backendErrorMessage(cause: unknown, language: Language) {
  if (!(cause instanceof ApiError) || !cause.body || typeof cause.body !== 'object') return null;
  const body = cause.body as Record<string, unknown>;
  const rawMessage = String(body.ExceptionMessage ?? body.Message ?? '').trim();
  if (rawMessage.toLowerCase().includes('already registered')) {
    return text(language, 'این دوربین با یک آدرس RTSP دیگر در حال استفاده است. اتصال قبلی را قطع کنید و دوباره تلاش کنید.', 'This camera is already registered with another RTSP URL. Disconnect the previous session and try again.');
  }
  return rawMessage || null;
}

export function CameraStreamPreview({ camera, language, viewer, size = 200, showPlaybackControls = false, showStatus = true, showConnectionButton = true, showModeSwitcher = true, showRoiAction = true }: CameraStreamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const readerRef = useRef<{ close: () => void } | null>(null);
  const sessionStarted = useRef(false);
  const statusRef = useRef<CameraStatus | null>(null);
  const initialStatus: CameraStatus = { cameraId: camera.cameraId, state: 'Disconnected', error: null, viewerCount: 0, streamUrl: '', webRtcUrl: '', lastStateChangeUtc: '' };
  const [status, setStatus] = useState<CameraStatus>(initialStatus);
  const [streamMode, setStreamMode] = useState<CameraStreamMode>('WebRTC');
  const [streamUrl, setStreamUrl] = useState('');
  const [webRtcUrl, setWebRtcUrl] = useState('');
  const [error, setError] = useState('');
  const [rois, setRois] = useState<CameraRoi[]>([]);
  const [videoReady, setVideoReady] = useState(false);
  statusRef.current = status;

  const connect = async (requestedMode: CameraStreamMode = streamMode) => {
    setStreamMode(requestedMode);
    setError('');
    setVideoReady(false);
    setStatus((current) => ({ ...current, state: 'Connecting' }));
    const releasePreviousSession = async () => {
      await cameraApi.disconnect(camera.cameraId, viewer).catch(() => undefined);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const current = await cameraApi.getStatus(camera.cameraId).then((response) => normalizeStatus(response, initialStatus)).catch(() => null);
        if (!current || current.state === 'Disconnected') return;
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
    };
    let lastCause: unknown = null;
    try {
      await releasePreviousSession();
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const result = connectResponse(await cameraApi.connect(camera, viewer, requestedMode), initialStatus);
          sessionStarted.current = true;
          const nextStatus = result.status ?? await cameraApi.getStatus(camera.cameraId).then((response) => normalizeStatus(response, { ...initialStatus, state: 'Connecting', viewerCount: 1, streamUrl: result.streamUrl, webRtcUrl: result.webRtcUrl })).catch(() => ({ ...initialStatus, state: 'Connecting' as CameraStatusState, viewerCount: 1, streamUrl: result.streamUrl, webRtcUrl: result.webRtcUrl }));
          setStatus(nextStatus);
          setError(nextStatus.error || '');
          setStreamUrl(nextStatus.state === 'Failed' ? '' : result.streamUrl || nextStatus.streamUrl || '');
          setWebRtcUrl(nextStatus.state === 'Failed' ? '' : result.webRtcUrl || nextStatus.webRtcUrl || '');
          setRois(asRois(await cameraApi.getRois(camera.cameraId, viewer)));
          return;
        } catch (cause) {
          lastCause = cause;
          if (!backendErrorMessage(cause, language) || attempt === 2) throw cause;
          await releasePreviousSession();
          await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    } catch (cause) {
      setStatus((current) => ({ ...current, state: 'Failed' }));
      setError(backendErrorMessage(lastCause ?? cause, language) ?? (cause instanceof ApiError ? `HTTP ${cause.status}` : text(language, 'ارتباط با دوربین برقرار نشد.', 'Camera connection failed.')));
    }
  };

  const disconnect = async () => {
    setStatus((current) => ({ ...current, state: 'Stopping' }));
    readerRef.current?.close();
    readerRef.current = null;
    await cameraApi.disconnect(camera.cameraId, viewer).catch(() => undefined);
    setStreamUrl('');
    setWebRtcUrl('');
    setVideoReady(false);
    setStatus((current) => ({ ...current, state: 'Disconnected' }));
  };

  useEffect(() => () => {
    readerRef.current?.close();
    readerRef.current = null;
    if (sessionStarted.current) void cameraApi.disconnect(camera.cameraId, viewer).catch(() => undefined);
  }, [camera.cameraId, viewer]);

  useEffect(() => {
    if (!streamUrl && !webRtcUrl) return undefined;
    const statusPollingInterval = status.state === 'Connected' ? 15000 : 2500;
    const timer = window.setInterval(() => {
      void cameraApi.getStatus(camera.cameraId).then((response) => {
        const next = normalizeStatus(response, statusRef.current ?? initialStatus);
        setStatus(next);
        setError(next.error || (next.state === 'Failed' ? text(language, 'Stream دوربین با خطا متوقف شد.', 'The camera stream failed.') : ''));
        if (next.state === 'Failed') {
          setStreamUrl('');
          setWebRtcUrl('');
        }
      }).catch(() => undefined);
    }, statusPollingInterval);
    return () => window.clearInterval(timer);
  }, [camera.cameraId, language, status.state, streamUrl, webRtcUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || streamMode !== 'WebRTC' || !webRtcUrl || status.state !== 'Connected') return undefined;
    setVideoReady(false);
    const url = resolveStreamUrl(webRtcUrl);
    if (!url || !window.MediaMTXWebRTCReader) {
      setError(text(language, 'WebRTC در مرورگر آماده نیست.', 'WebRTC is not available in this browser.'));
      return undefined;
    }
    let cancelled = false;
    const reader = new window.MediaMTXWebRTCReader({
      url,
      onError: (cause) => { if (!cancelled) setError(typeof cause === 'string' ? cause : text(language, 'اتصال WebRTC برقرار نشد.', 'WebRTC connection failed.')); },
      onTrack: (event) => {
        if (cancelled) return;
        video.srcObject = event.streams[0];
        setVideoReady(true);
        void video.play().catch(() => undefined);
      },
    });
    readerRef.current = reader;
    return () => {
      cancelled = true;
      if (readerRef.current === reader) readerRef.current = null;
      reader.close();
      video.pause();
      video.srcObject = null;
    };
  }, [language, status.state, streamMode, webRtcUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || streamMode !== 'Hls' || !streamUrl || status.state !== 'Connected') return undefined;
    setVideoReady(false);
    const url = resolveStreamUrl(streamUrl);
    if (!url) {
      setError(text(language, 'آدرس stream دریافتی از Backend معتبر نیست.', 'The stream URL returned by the Backend is invalid.'));
      return undefined;
    }
    let cancelled = false;
    let hls: Hls | undefined;
    const waitForManifest = async () => {
      for (let attempt = 0; attempt < 60 && !cancelled; attempt += 1) {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          const body = await response.text();
          if (response.ok && body.includes('#EXTINF:')) return true;
        } catch { /* Retry while FFmpeg creates the first segment. */ }
        await new Promise((resolve) => window.setTimeout(resolve, 500));
      }
      return false;
    };
    const start = async () => {
      if (!(await waitForManifest()) || cancelled) {
        if (!cancelled) setError(text(language, 'فهرست تصویر دوربین آماده نشد.', 'The camera stream playlist did not become ready in time.'));
        return;
      }
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true, liveSyncDurationCount: 1, liveMaxLatencyDurationCount: 3, maxLiveSyncPlaybackRate: 1.5, maxBufferLength: 3, backBufferLength: 0, manifestLoadingMaxRetry: 10, manifestLoadingRetryDelay: 1000 });
        hlsRef.current = hls;
        hls.on(Hls.Events.ERROR, (_event, data) => { if (data?.fatal && !cancelled) setError(text(language, 'خطای دریافت یا decode تصویر دوربین.', 'Camera stream or decode error.')); });
        hls.on(Hls.Events.MANIFEST_PARSED, () => { void video.play().catch(() => undefined); });
        hls.attachMedia(video);
        hls.loadSource(url);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        void video.play().catch(() => undefined);
      } else {
        setError(text(language, 'مرورگر از HLS پشتیبانی نمی‌کند.', 'This browser does not support HLS.'));
      }
    };
    void start();
    return () => {
      cancelled = true;
      if (hlsRef.current === hls) hlsRef.current = null;
      hls?.destroy();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [language, status.state, streamMode, streamUrl]);

  const saveRoi = async () => {
    const roi = await cameraApi.saveRoi({ cameraId: camera.cameraId, viewerId: viewer, id: '', text: text(language, 'محدوده تشخیص', 'Detection region'), color: '#2e7d32', x: 0.2, y: 0.2, width: 0.4, height: 0.3 }).catch(() => null);
    if (roi) setRois((current) => [...current, roi]);
  };

  const seekToLiveEdge = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.seekable.length > 0) {
        const end = video.seekable.end(video.seekable.length - 1);
        const start = video.seekable.start(video.seekable.length - 1);
        video.currentTime = Math.max(start, end - 0.15);
      }
    } catch { /* The media may not have a seekable range yet. */ }
  };
  const resumeLive = () => { if (streamMode === 'Hls') { hlsRef.current?.startLoad(-1); seekToLiveEdge(); } };
  const pauseLive = () => { if (streamMode === 'Hls') hlsRef.current?.stopLoad(); };
  const activeStream = streamMode === 'WebRTC' ? webRtcUrl : streamUrl;
  const isConnected = status.state === 'Connected';
  const isBusy = status.state === 'Connecting' || status.state === 'Stopping';
  const statusDetails = error || status.error || statusLabel(status.state, language);
  const previewSize = typeof size === 'number' ? { width: size, height: size } : size;
  const hasToolbar = showConnectionButton || showModeSwitcher || showRoiAction;
  const switchMode = () => void connect(streamMode === 'WebRTC' ? 'Hls' : 'WebRTC');

  return <Paper variant="outlined" sx={{ mt: 1.5, width: previewSize.width, maxWidth: '100%', p: 0.75, borderRadius: 1.5, overflow: 'hidden' }}>
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minHeight: 24, overflow: 'hidden' }}>
      {showStatus && <Tooltip title={statusDetails} arrow>
        <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, color: statusColor(status.state), cursor: 'help' }}>
          {status.state === 'Connected' ? <PowerRoundedIcon sx={{ fontSize: 20 }} /> : <PowerOffRoundedIcon sx={{ fontSize: 20 }} />}
        </Box>
      </Tooltip>}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{camera.name}</Typography>
      </Box>
    </Stack>

    {activeStream ? <Box sx={{ mt: 0.75, position: 'relative', width: previewSize.width, height: previewSize.height, maxWidth: '100%', bgcolor: 'common.black', borderRadius: 0.75, overflow: 'hidden' }}>
      <video ref={videoRef} autoPlay muted controls={showPlaybackControls} playsInline onPlay={resumeLive} onPause={pauseLive} onLoadedData={() => setVideoReady(true)} onCanPlay={() => setVideoReady(true)} onPlaying={() => setVideoReady(true)} onDoubleClick={() => { void videoRef.current?.parentElement?.requestFullscreen?.(); }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      {!videoReady && <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }}><Typography variant="caption" color="common.white">{text(language, 'در حال دریافت تصویر...', 'Receiving video...')}</Typography></Box>}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{rois.map((roi) => <Box key={roi.id} sx={{ position: 'absolute', left: `${roi.x * 100}%`, top: `${roi.y * 100}%`, width: `${roi.width * 100}%`, height: `${roi.height * 100}%`, border: `2px solid ${roi.color || '#2e7d32'}` }} />)}</Box>
    </Box> : <Box sx={{ mt: 0.75, width: previewSize.width, height: previewSize.height, maxWidth: '100%', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', borderRadius: 0.75 }}><Typography variant="caption" color="text.secondary" align="center">{text(language, 'پیش‌نمایش فعال نیست.', 'Preview is not running.')}</Typography></Box>}

    {hasToolbar && <Stack direction="row" spacing={0.25} sx={{ mt: 0.5, minHeight: 28, alignItems: 'center', justifyContent: 'center' }}>
      {showConnectionButton && <Tooltip title={isConnected ? text(language, 'قطع اتصال', 'Disconnect') : text(language, 'اتصال به دوربین', 'Connect to camera')} arrow>
        <span><IconButton size="small" color={isConnected ? 'error' : 'primary'} aria-label={isConnected ? 'Disconnect' : 'Connect'} onClick={() => void (isConnected ? disconnect() : connect())} disabled={isBusy} sx={{ p: 0.35 }}>
          {isConnected ? <LinkOffRoundedIcon sx={{ fontSize: 18 }} /> : <LinkRoundedIcon sx={{ fontSize: 18 }} />}
        </IconButton></span>
      </Tooltip>}
      {showModeSwitcher && <Tooltip title={text(language, `تغییر به ${streamMode === 'WebRTC' ? 'HLS' : 'WebRTC'}`, `Switch to ${streamMode === 'WebRTC' ? 'HLS' : 'WebRTC'}`)} arrow>
        <span><IconButton size="small" aria-label="Switch stream protocol" onClick={switchMode} disabled={isBusy} sx={{ p: 0.35 }}><KeyboardArrowDownRoundedIcon sx={{ fontSize: 19 }} /></IconButton></span>
      </Tooltip>}
      {showRoiAction && <Tooltip title={text(language, 'افزودن ROI', 'Add ROI')} arrow><span><IconButton size="small" aria-label="Add ROI" onClick={() => void saveRoi()} disabled={!activeStream} sx={{ p: 0.35 }}><TuneRoundedIcon sx={{ fontSize: 18 }} /></IconButton></span></Tooltip>}
    </Stack>}
  </Paper>;
}
