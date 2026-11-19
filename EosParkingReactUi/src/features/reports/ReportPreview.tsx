import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import { useTranslation } from 'react-i18next';
import { PreparedReportViewer } from './PreparedReportViewer';
import type { PreparedReport } from './preparedReportApi';
import { AppPopup } from '../../components/AppPopup';
import type { Language } from '../../i18n/instance';
import './reportPreview.css';

type Props = {
  title: string;
  language: Language;
  report: PreparedReport | null;
  viewerId: string;
  count: number;
  busy: boolean;
  resultKey: object;
};

/** The report stays in its workspace; closing the viewer never reruns its API request. */
export function ReportPreview({ title, language, report, viewerId, count, busy, resultKey }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const [dismissed, setDismissed] = useState<{ report: PreparedReport; resultKey: object } | null>(null);
  const open = Boolean(report && dismissed?.report !== report && dismissed?.resultKey !== resultKey);
  const heading = t('reportPreview.title', { name: title });
  const records = t('reportPreview.records', { value: count.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US') });

  if (!report) return null;
  return <>
    <Box className="report-preview-result">
      <Typography variant="body2" color="text.secondary">{records}</Typography>
      <Button variant="outlined" startIcon={<FullscreenRoundedIcon />} disabled={busy} onClick={() => setDismissed(null)}>{t('reportPreview.reopen')}</Button>
    </Box>
    <AppPopup open={open} fullScreen className="report-preview-popup" dir={language === 'fa' ? 'rtl' : 'ltr'}
      ariaLabel={heading} onClose={() => setDismissed({ report, resultKey })} actions={[]}
      title={<Box component="span" className="report-preview-heading">
        <Box component="span" className="report-preview-title">
          <Typography component="span" sx={{ fontWeight: 700 }}>{heading}</Typography>
          <Typography component="span" variant="caption" color="text.secondary">{records}</Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<CloseRoundedIcon />} onClick={() => setDismissed({ report, resultKey })}>{t('reportPreview.close')}</Button>
      </Box>}>
      <Box className="report-preview-viewer"><PreparedReportViewer id={viewerId} report={report} language={language} title={title} /></Box>
    </AppPopup>
  </>;
}
