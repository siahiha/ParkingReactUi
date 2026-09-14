import type { Language } from '../i18n';

export function formatDateTime(value: unknown, language: Language): string {
  if (!value) return '—';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
}

export function formatTime(value: Date, language: Language): string {
  return value.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US');
}
