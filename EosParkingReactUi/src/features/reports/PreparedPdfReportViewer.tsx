import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n/instance';
import { exportReport, reportError, reportFormats, type PreparedReport, type ReportFormat } from './preparedReportApi';

type Props = { id: string; report: PreparedReport; language: Language; title: string };

/** Displays server-rendered pages. The browser never receives a template or a report dataset. */
export function PreparedPdfReportViewer({ id, report, language, title }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [downloading, setDownloading] = useState(false);
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const requests = useRef(new Set<AbortController>());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const pending = requests.current;
    return () => { mounted.current = false; pending.forEach(controller => controller.abort()); pending.clear(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    setLoading(true); setUrl(''); setError('');
    void exportReport(report, 'pdf', controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reportError(reason, language));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [report, attempt]);

  useEffect(() => {
    if (!download) return;
    // A React-owned anchor performs the browser download after the blob URL has mounted.
    link.current?.click();
    return () => URL.revokeObjectURL(download.url);
  }, [download]);

  const save = () => {
    setDownloading(true); setError('');
    const controller = new AbortController(); requests.current.add(controller);
    void exportReport(report, format, controller.signal).then(blob => {
      if (mounted.current && !controller.signal.aborted) setDownload({ url: URL.createObjectURL(blob), name: `report-${report.Id}.${format}` });
    }).catch((reason: unknown) => {
      if (mounted.current && !controller.signal.aborted) setError(reportError(reason, language));
    }).finally(() => { requests.current.delete(controller); if (mounted.current) setDownloading(false); });
  };
  const print = () => {
    try { frame.current?.contentWindow?.focus(); frame.current?.contentWindow?.print(); }
    catch { setError(t('reportPreview.printFallback')); }
  };

  return <Box className="prepared-report" id={id}>
    <Box className="prepared-report-toolbar" role="toolbar" aria-label={t('reportPreview.tools')}>
      <TextField select size="small" label={t('reportPreview.format')} value={format} onChange={event => setFormat(event.target.value as ReportFormat)} disabled={downloading} sx={{ minWidth: 120 }}>
        {reportFormats.map(value => <MenuItem key={value} value={value}>{value === 'xlsx' ? 'Excel (XLSX)' : value === 'docx' ? 'Word (DOCX)' : value.toUpperCase()}</MenuItem>)}
      </TextField>
      <Button onClick={save} disabled={downloading || loading} startIcon={downloading ? <CircularProgress size={16} /> : <DownloadRoundedIcon />}>{t('reportPreview.download')}</Button>
      <Button onClick={print} disabled={!url} startIcon={<PrintRoundedIcon />}>{t('reportPreview.print')}</Button>
      {url && <Button component="a" href={url} target="_blank" rel="noopener noreferrer" startIcon={<OpenInNewRoundedIcon />}>{t('reportPreview.openFile')}</Button>}
      <Typography variant="caption" color="text.secondary">{t('reportPreview.pages', { count: report.PageCount })}</Typography>
      <a ref={link} href={download?.url} download={download?.name} hidden aria-hidden="true" />
    </Box>
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setAttempt(value => value + 1)}>{t('reportPreview.retry')}</Button>}>{error}</Alert>}
    {loading && <Box className="prepared-report-loading" role="status"><CircularProgress size={28} /><Typography>{t('reportPreview.loading')}</Typography></Box>}
    {url && <iframe ref={frame} className="prepared-report-frame" title={title} src={`${url}#view=FitH`} />}
  </Box>;
}
