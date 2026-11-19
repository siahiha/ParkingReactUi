import { useEffect, useRef, useState } from 'react';
import type { Language } from '../../i18n/instance';
import { prepareReport, reportError, type PreparedReport, type PreparedReportKind } from './preparedReportApi';

/** One result belongs to one filter submission. Editing filters never mutates it. */
export function usePreparedReport(scope: string, language: Language) {
  const [report, setReport] = useState<PreparedReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current?.abort();
    active.current = null;
    setReport(null); setLoadingReport(false); setError('');
    return () => { active.current?.abort(); active.current = null; };
  }, [scope]);

  const run = (kind: PreparedReportKind, parameters: Record<string, unknown>) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setReport(null); setError(''); setLoadingReport(true);
    void prepareReport(kind, parameters, language, controller.signal).then((result) => {
      if (active.current === controller) setReport(result);
    }).catch((reason: unknown) => {
      if (active.current === controller && !controller.signal.aborted) setError(reportError(reason, language));
    }).finally(() => {
      if (active.current === controller) { setLoadingReport(false); active.current = null; }
    });
  };
  return { report, loadingReport, error, setError, run };
}
