import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import type { Language } from '../../i18n/instance';
import { PreparedPdfReportViewer } from './PreparedPdfReportViewer';
import { getStimulsoftViewerUrl, reportError, type PreparedReport } from './preparedReportApi';

type Props = { id: string; report: PreparedReport; language: Language; title: string };

/** Both views use the same prepared report; only IIS hosts the Stimulsoft control. */
export function PreparedReportViewer(props: Props) {
  const { t } = useTranslation(undefined, { lng: props.language });
  const [mode, setMode] = useState<'stimulsoft' | 'pdf'>('stimulsoft');
  useEffect(() => { setMode('stimulsoft'); }, [props.report.Id]);

  return <Box className="prepared-report" id={props.id}>
    <Box className="prepared-report-toolbar">
      <ToggleButtonGroup size="small" exclusive value={mode} aria-label={t('reportPreview.viewerMode')}
        onChange={(_, value: 'stimulsoft' | 'pdf' | null) => { if (value) setMode(value); }}>
        <ToggleButton value="stimulsoft">{t('reportPreview.stimulsoftView')}</ToggleButton>
        <ToggleButton value="pdf">{t('reportPreview.pdfView')}</ToggleButton>
      </ToggleButtonGroup>
    </Box>
    {mode === 'pdf'
      ? <PreparedPdfReportViewer {...props} id={`${props.id}-pdf`} />
      : <StimulsoftReportViewer {...props} />}
  </Box>;
}

function StimulsoftReportViewer({ report, language, title }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const frame = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setUrl(''); setError(''); setLoading(true);
    void getStimulsoftViewerUrl(report, controller.signal).then(value => {
      if (!controller.signal.aborted) setUrl(value);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) { setError(reportError(reason, language)); setLoading(false); }
    });
    return () => { controller.abort(); };
  }, [report, language, attempt]);

  useEffect(() => {
    if (!url) return;
    const receive = (event: MessageEvent<unknown>) => {
      if (event.source !== frame.current?.contentWindow || event.origin !== new URL(url).origin || !event.data || typeof event.data !== 'object') return;
      const message = event.data as { type?: unknown; reportId?: unknown; status?: unknown };
      if (message.type !== 'parking-report-viewer-error' || message.reportId !== report.Id || typeof message.status !== 'number') return;
      setError(reportError(new ApiError(message.status, null), language)); setLoading(false);
    };
    window.addEventListener('message', receive);
    return () => { window.removeEventListener('message', receive); };
  }, [url, report.Id, language]);

  return <Box className="prepared-stimulsoft-viewer">
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setAttempt(value => value + 1)}>{t('reportPreview.retry')}</Button>}>{error}</Alert>}
    {loading && <Box className="prepared-report-loading prepared-stimulsoft-loading" role="status"><CircularProgress size={28} /><Typography>{t('reportPreview.loading')}</Typography></Box>}
    {url && !error && <iframe ref={frame} className="prepared-report-frame prepared-stimulsoft-frame" title={title} src={url}
      onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(reportError(new Error('Viewer unavailable'), language)); }} />}
  </Box>;
}
