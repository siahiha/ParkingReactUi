import { apiRequest, ApiError } from '../../api/client';
import type { Language } from '../../i18n/instance';
import { appConfig } from '../../config';

export type PreparedReport = { Id: string; Count: number; PageCount: number; ExpiresAt: string };
export const reportFormats = ['pdf', 'xlsx', 'docx', 'csv', 'xls', 'rtf', 'txt', 'ods', 'odt', 'pptx', 'xml', 'html', 'mht', 'svg', 'png', 'jpeg', 'tiff', 'dbf', 'dif', 'sylk', 'xps'] as const;
export type ReportFormat = typeof reportFormats[number];
export type PreparedReportKind = 'members-all' | 'members-active' | 'members-inactive' |
  'traffic-details' | 'traffic-daily' | 'traffic-average' | 'parking-income' | 'monthly-income' |
  'member-cash' | 'user-performance' | 'membership-income' | 'cargo' | 'monthly-income-comparison' |
  'income-comparison' | 'yearly-income-comparison' | 'management-user-performance' | 'free-parking-income';

export async function prepareReport(kind: PreparedReportKind, parameters: Record<string, unknown>, language: Language, signal?: AbortSignal) {
  const response = await apiRequest<{ ResponseResultType: number; Values: PreparedReport }>('api/Report/Prepare', {
    method: 'POST', body: JSON.stringify({ Kind: kind, Parameters: parameters, Language: language }), timeoutMs: 120_000, signal,
  });
  if (response.ResponseResultType !== 1 || !response.Values?.Id) throw new Error(language === 'fa' ? 'آماده‌سازی گزارش ناموفق بود.' : 'The report could not be prepared.');
  return response.Values;
}

export async function exportReport(report: PreparedReport, format: ReportFormat, signal?: AbortSignal) {
  const blob = await apiRequest<Blob>(`api/Report/Export?id=${encodeURIComponent(report.Id)}&format=${format}`, {
    responseType: 'blob', timeoutMs: 120_000, signal,
  });
  // A proxy's HTML error/login page must never become an executable preview.
  if (format === 'pdf' && blob.type.split(';')[0].toLowerCase() !== 'application/pdf') throw new Error('Invalid report file.');
  return blob;
}

export async function getStimulsoftViewerUrl(report: PreparedReport, signal?: AbortSignal) {
  const response = await apiRequest<{ ResponseResultType: number; Values: { Path: string } }>(`api/Report/Viewer?id=${encodeURIComponent(report.Id)}`, { signal });
  if (response.ResponseResultType !== 1 || !response.Values?.Path) throw new Error('Invalid report viewer response.');
  const apiUrl = new URL(appConfig.apiBaseUrl, window.location.href);
  const url = new URL(response.Values.Path, apiUrl);
  if (url.origin !== apiUrl.origin || !['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid report viewer origin.');
  return url.href;
}

export function reportError(reason: unknown, language: Language) {
  const fa = language === 'fa';
  if (reason instanceof ApiError) {
    switch (reason.status) {
      case 400: return fa ? 'فیلترهای گزارش معتبر نیستند.' : 'The report filters are invalid.';
      case 401: return fa ? 'برای مشاهدهٔ گزارش دوباره وارد شوید.' : 'Sign in again to view the report.';
      case 403: return fa ? 'اجازهٔ مشاهدهٔ این گزارش را ندارید.' : 'You do not have permission to view this report.';
      case 404: return fa ? 'گزارش دیگر در دسترس نیست. دوباره نمایش گزارش را بزنید.' : 'The report is no longer available. Select Show report again.';
      case 413: return fa ? 'حجم گزارش زیاد است. بازهٔ تاریخ یا فیلترها را محدود کنید.' : 'The report is too large. Narrow the date range or filters.';
      case 429: return fa ? 'آماده‌سازی گزارش دیگری در جریان است. کمی بعد دوباره تلاش کنید.' : 'Other reports are being prepared. Try again shortly.';
      case 501: return fa ? 'نمایشگر Stimulsoft در این میزبان در دسترس نیست. از نمایش PDF استفاده کنید.' : 'The Stimulsoft viewer is unavailable on this host. Use PDF view.';
    }
  }
  return fa ? 'دریافت گزارش ناموفق بود. دوباره تلاش کنید.' : 'The report could not be loaded. Please try again.';
}
