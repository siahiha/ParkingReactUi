import { useLayoutEffect, useState } from 'react';
import { Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import type { Language } from '../../i18n/instance';
import { reportViewerLocalizationXml } from './reportViewerLocalization';

export function useReportViewerOptions(language: Language) {
  const [ready, setReady] = useState<{ language: Language; options: Stimulsoft.Viewer.StiViewerOptions } | null>(null);
  useLayoutEffect(() => {
    // The SDK reads its global localization when creating viewer options. Apply it
    // before mounting the viewer, including an explicit reset when returning to English.
    Stimulsoft.Base.Localization.StiLocalization.setLocalization(reportViewerLocalizationXml(language));
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.width = '100%'; options.height = '100%';
    options.appearance.fullScreenMode = false;
    options.appearance.scrollbarsMode = true;
    options.appearance.rightToLeft = language === 'fa';
    options.toolbar.autoHide = false;
    options.toolbar.showPinToolbarButton = false;
    options.toolbar.showFullScreenButton = false;
    options.toolbar.showOpenButton = false;
    options.toolbar.showSendEmailButton = false;
    options.toolbar.showPrintButton = true;
    options.toolbar.showSaveButton = true;
    options.toolbar.zoom = Stimulsoft.Viewer.StiZoomMode.PageWidth;
    setReady({ language, options });
  }, [language]);
  return ready?.language === language ? ready.options : null;
}
