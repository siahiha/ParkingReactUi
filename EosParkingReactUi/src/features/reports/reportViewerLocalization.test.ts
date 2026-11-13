import { expect, it } from 'vitest';
import { Stimulsoft } from 'stimulsoft-reports-js-react/viewer';
import fa from '../../locales/reportViewer/fa';
import en from '../../locales/reportViewer/en';
import i18n from '../../i18n/instance';
import { reportViewerLocalizationXml } from './reportViewerLocalization';

it('provides every resource requested by the installed viewer in both languages', () => {
  const localization = Stimulsoft.Base.Localization.StiLocalization;
  const original = localization.get;
  const requested = new Set<string>();
  localization.get = (category, key) => {
    requested.add(`${category}.${key}`);
    return original.call(localization, category, key);
  };
  try { Stimulsoft.Viewer.StiCollectionsHelper.getLocalizationItems(); }
  finally { localization.get = original; }
  expect(requested.size).toBeGreaterThan(400);
  for (const language of ['fa', 'en'] as const) {
    const resources = (language === 'fa' ? fa : en) as Record<string, Record<string, string>>;
    localization.setLocalization(reportViewerLocalizationXml(language));
    for (const path of requested) {
      const [category, key] = path.split('.');
      expect(resources[category]?.[key], path).toBeTruthy();
      expect(localization.get(category, key), `${language}.${path}`).toBe(resources[category][key]);
    }
  }
});

it('preserves native engine placeholders and translates all human labels into Persian', () => {
  const persian = fa as Record<string, Record<string, string>>;
  const english = en as Record<string, Record<string, string>>;
  for (const [category, values] of Object.entries(persian)) {
    for (const [key, value] of Object.entries(values)) {
      expect(value.match(/\{\d+\}/g) ?? [], `${category}.${key}`).toEqual(english[category][key].match(/\{\d+\}/g) ?? []);
      if (`${category}.${key}` !== 'A_WebViewer.PrintToPdf') expect(value, `${category}.${key}`).toMatch(/[\u0600-\u06ff]/);
    }
  }
});

it('escapes translation content without corrupting XML or native placeholders', () => {
  const path = 'reportViewerEngine.A_WebViewer.PrintReport';
  const previous = i18n.getResource('en', 'translation', path);
  try {
    i18n.addResource('en', 'translation', path, '<Print> & "Save" {0}');
    const xml = reportViewerLocalizationXml('en');
    expect(xml).toContain('<PrintReport>&lt;Print&gt; &amp; &quot;Save&quot; {0}</PrintReport>');
    Stimulsoft.Base.Localization.StiLocalization.setLocalization(xml);
    expect(Stimulsoft.Base.Localization.StiLocalization.get('A_WebViewer', 'PrintReport')).toBe('<Print> & "Save" {0}');
  } finally {
    i18n.addResource('en', 'translation', path, previous);
    Stimulsoft.Base.Localization.StiLocalization.setLocalization(reportViewerLocalizationXml('en'));
  }
});
