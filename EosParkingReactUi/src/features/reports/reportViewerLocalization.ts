import i18n, { type Language } from '../../i18n/instance';

type ViewerResources = Record<string, Record<string, string>>;

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

/** Adapt the shared i18next resources to the report engine's public localization API. */
export function reportViewerLocalizationXml(language: Language): string {
  const resources = i18n.getFixedT(language)('reportViewerEngine', { returnObjects: true }) as ViewerResources;
  const categories = Object.entries(resources).map(([category, values]) => {
    const entries = Object.entries(values).map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`).join('');
    return `<${category}>${entries}</${category}>`;
  }).join('');
  const name = language === 'fa' ? 'Farsi' : 'English';
  return `<?xml version="1.0" encoding="utf-8"?><Localization language="${name}" description="${name}" cultureName="${language}">${categories}</Localization>`;
}
