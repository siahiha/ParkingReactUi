import type { HelpArticles } from '../../features/help/helpTypes';
import { helpSearchTerms } from './searchTerms';
import { faDefinitions } from './faDefinitions';
import { faManagement } from './faManagement';
import { faOperations } from './faOperations';
import { faReports } from './faReports';

const articles: HelpArticles = { ...faDefinitions, ...faManagement, ...faOperations, ...faReports };

export default {
  moreResults: 'نتایج بیشتر',
  title: 'راهنمای کاربر', open: 'راهنما', close: 'بستن راهنما', allTopics: 'همهٔ موضوعات', thisPage: 'راهنمای این صفحه',
  searchLabel: 'جستجو در راهنما', searchPlaceholder: 'نام فیلد، مفهوم یا پرسش خود را بنویسید…', clearSearch: 'پاک کردن جستجو',
  onlyPage: 'فقط این فرم', results: '{{count}} نتیجه', noResults: 'موضوعی پیدا نشد.', noResultsHint: 'نام فیلد یا عبارت کوتاه‌تری بنویسید، یا جستجو را در همهٔ موضوعات انجام دهید.',
  noContext: 'برای این صفحه، موضوع اختصاصی در دسترس نیست. از فهرست یا جستجو استفاده کنید.',
  browseHint: 'یک موضوع را انتخاب کنید یا نام فیلد و مشکل خود را جستجو کنید.',
  backResults: 'بازگشت به نتایج', backTopics: 'بازگشت به موضوعات', related: 'موضوعات مرتبط', contents: 'بخش‌های این راهنما',
  currentPage: 'فرم جاری', approximate: 'نتیجهٔ نزدیک', readSection: 'مشاهدهٔ توضیح', sections: { overview: 'آشنایی با فرم', steps: 'مراحل انجام کار', fields: 'فیلدها و گزینه‌ها', concepts: 'مفهوم‌ها', actions: 'دکمه‌ها و عملیات', problems: 'پرسش‌ها و رفع مشکل' },
  groups: { start: 'شروع کار و مفهوم‌ها', operations: 'عملیات روزانه', definitions: 'تعاریف و تنظیمات', management: 'مدیریت سامانه', reports: 'گزارش‌ها' },
  search: helpSearchTerms, articles,
};
