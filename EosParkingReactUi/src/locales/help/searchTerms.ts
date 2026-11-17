import type { HelpSearchConfig } from '../../features/help/helpTypes';

/** Bilingual search vocabulary; these are matching terms, never generated answers. */
export const helpSearchTerms: HelpSearchConfig = {
  stopWords: ['از', 'به', 'در', 'را', 'با', 'برای', 'این', 'آن', 'یک', 'چه', 'چرا', 'چگونه', 'چطور', 'چجوری', 'من', 'ما', 'است', 'هست', 'کنم', 'کنیم', 'کردن', 'باید', 'میشه', 'می', 'شود', 'شد', 'رو', 'که', 'و', 'یا', 'درباره', 'مورد', 'لطفا', 'دکمه', 'فیلد', 'گزینه', 'فرم', 'صفحه', 'بزنم', 'کنه', 'a', 'an', 'the', 'and', 'or', 'to', 'for', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'it', 'i', 'my', 'me', 'do', 'does', 'how', 'why', 'what', 'can', 'please', 'with', 'this', 'that', 'about', 'button', 'field', 'form'],
  synonyms: [
    ['پرداخت', 'تسویه', 'تسویه حساب', 'تصفیه', 'تسويه', 'payment', 'settlement', 'settle', 'pay'],
    ['عضویت', 'اشتراک', 'عضويت', 'membership', 'subscription'],
    ['کارتخوان', 'کارت خوان', 'کارت‌خوان', 'cardreader', 'card reader', 'card-reader'],
    ['پلاکخوان', 'پلاک خوان', 'پلاک‌خوان', 'platereader', 'plate reader', 'plate-reader'],
    ['گردکردن', 'گرد کردن', 'رند کردن', 'رندکردن', 'rounding', 'round', 'round off'],
    ['کد عضویت', 'کد عضو', 'شماره عضویت', 'کدعضویت', 'member code', 'membership code', 'member number'],
    ['غیرفعال', 'فعال نیست', 'کار نمیکند', 'کار نمی کند', 'کار نمیکنه', 'کار نمی کنه', 'نمیزند', 'نمی زند', 'نمیزنه', 'نمی زنه', 'نمیشه', 'نمی شود', 'نمیتوانم', 'نمی توانم', 'نمیتونم', 'نمی تونم', 'disabled', 'not working', 'cannot', 'cant', 'not enabled'],
    ['ناموفق', 'انجام نشد', 'ثبت نشد', 'خطا داد', 'failed', 'unsuccessful', 'not completed'],
    ['تصویر', 'عکس', 'image', 'picture', 'photo'], ['درب', 'دروازه', 'گیت', 'door', 'gateway'],
    ['جایپارک', 'جای پارک', 'جای‌پارک', 'جایگاه', 'space', 'parking space', 'bay'],
    ['راهنما', 'هلپ', 'کمک', 'help', 'guide'], ['رمز', 'پسورد', 'گذرواژه', 'رمزعبور', 'password', 'passcode'],
    ['خالی', 'چیزی ندارد', 'پیدا نمیشود', 'پیدا نمی شود', 'empty', 'nothing found', 'no results'],
  ],
};
