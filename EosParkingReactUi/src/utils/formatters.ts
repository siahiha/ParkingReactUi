import type { Language } from '../i18n';

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

export function normalizeMoneyInput(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[^0-9]/g, '');
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';

  const canonicalValue = typeof value === 'number' ? String(value) : normalizeMoneyInput(value);
  if (!canonicalValue) return '—';

  const amount = Number(canonicalValue);
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) : '—';
}

export function formatMoneyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';

  const canonicalValue = typeof value === 'number' ? String(value) : normalizeMoneyInput(value);
  return canonicalValue ? formatMoney(canonicalValue) : '';
}

export function formatDateTime(value: unknown, language: Language): string {
  if (!value) return '—';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US');
}

export function formatTime(value: Date, language: Language): string {
  return value.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US');
}
