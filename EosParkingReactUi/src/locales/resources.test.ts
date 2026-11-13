import { expect, it } from 'vitest';
import i18n from '../i18n/instance';
import fa from './fa';
import en from './en';

function leaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  return Object.fromEntries(Object.entries(value as object).flatMap(([key, child]) => Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key))));
}
it('provides every key and interpolation in both locales without fallback', () => {
  const persian = leaves(fa); const english = leaves(en);
  expect(Object.keys(english).sort()).toEqual(Object.keys(persian).sort());
  for (const key of Object.keys(persian)) {
    for (const language of ['fa', 'en']) expect(i18n.getResource(language, 'translation', key), `${language}:${key}`).toBeTruthy();
    const placeholders = (value: string) => [...value.matchAll(/{{\s*([^}]+)\s*}}/g)].map(match => match[1].trim()).sort();
    expect(placeholders(english[key]), key).toEqual(placeholders(persian[key]));
  }
});
