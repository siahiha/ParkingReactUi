# وضعیت پیاده‌سازی UI و سیاست جلوگیری از Regression

## وضعیت سند

این سند وضعیت واقعی تغییرات انجام‌شده در UI React تا این مرحله را ثبت می‌کند. هر تغییر بعدی باید علاوه بر اضافه‌کردن قابلیت جدید، رفتار و ظاهر قابلیت‌های قبلی را حفظ کند.

## محدوده فعلی پروژه

پروژه در مسیر `EosParkingReactUi` یک SPA مبتنی بر React و TypeScript است. در این مرحله، صفحه‌های زیر در UI وجود دارند:

- Login؛
- Home؛
- منوی مدیریت پارکینگ‌ها؛
- منوهای تعاریف، عملیات، ارتباط با سیستم‌ها و گزارشات پارکینگ؛
- تنظیمات theme، زبان و palette؛
- تغییر رمز عبور در UI.

برخی menu itemها هنوز placeholder هستند؛ بررسی تکمیل آن‌ها در این snapshot عمداً خارج از
دامنه است. موارد زیر فقط وضعیت قابلیت‌هایی را ثبت می‌کنند که در کد فعلی route یا workspace
واقعی دارند.

## قرارداد اجباری ترجمهٔ UI

این پروژه برای ترجمهٔ UI فقط از `i18next` و `react-i18next` استفاده می‌کند. resource هر
زبان باید در فایل مستقل خود در `src/locales/` قرار گیرد و از طریق instance مشترک در
`src/i18n/instance.ts` بارگذاری شود. componentها باید از `useTranslation()`/`t()` و کد
خارج از React از `i18n.t()` استفاده کنند.

الگوهای زیر مجاز نیستند و نباید در کد جدید یا refactor باقی‌مانده استفاده شوند:

- انتخاب متن با `language === 'fa' ? '...' : '...'` یا هر شرط زبان مشابه؛
- helperهایی مانند `text(fa, en)` یا سیستم resource/ترجمهٔ موازی؛
- متن نمایشی hard-code در JSX، hook، handler و مدل view؛
- fallback متنی inline برای مخفی‌کردن کلید مفقود یا ساخت کلید ترجمه در runtime.

شرط زبان فقط برای direction، formatter و منطق فنی مجاز است. route، API key، enum،
identifier، URL، کد خطا و نام پروتکل مقدار فنی هستند و از این قرارداد مستثنا هستند؛ اما
اگر به کاربر نمایش داده شوند، متن نمایشی آن‌ها نیز باید از resource بیاید.

افزودن زبان جدید فقط با ساخت resource مستقل و تکمیل همان قرارداد کلیدها، ثبت زبان در
`supportedLngs` و تعیین fallback رسمی انجام می‌شود. وجود کلید مفقود، resource ناقص،
متن hard-code یا روش ترجمهٔ جایگزین، blocker تحویل و regression محسوب می‌شود و باید در
بازبینی، type-check و تست missing-key کنترل شود. تا زمان انتقال کامل موارد پراکندهٔ
قبلی، مهاجرت ترجمه پایان‌یافته تلقی نمی‌شود.

برای حذف تکی و گروهی، `window.confirm` و دیالوگ native مرورگر ممنوع است. تمام workspaceها
باید از `ConfirmDialog` مشترک استفاده کنند؛ انتخاب رکورد یا رکوردها در state موقت نگهداری
شود، حذف فقط در `onConfirm` انجام شود و هنگام درخواست async با `busy` از بستن یا تأیید
مجدد جلوگیری شود. باقی‌ماندن هر `window.confirm` برای حذف، خطای قرارداد UI و blocker تحویل
است.

## آخرین تطبیق مستندات با کد UI

این بخش نتیجه‌ی تطبیق مستقیم مستندات با مسیرها و componentهای موجود در
`EosParkingReactUi` است. موارد زیر «رفتار فعلی» هستند و نباید به‌عنوان قابلیت
تکمیل‌شده تلقی شوند مگر آنکه در وضعیت آن‌ها صریحاً چنین چیزی نوشته شده باشد.

| حوزه | وضعیت فعلی در UI | منبع کد/مستند | وضعیت تحویل |
|---|---|---|---|
| Login، session و Home | پیاده‌سازی شده و تست regression دارد؛ نمای Login و متن‌های فارسی/انگلیسی در لایه‌ی i18next نگهداری می‌شوند | `src/pages/LoginPage.tsx`، `src/i18n/instance.ts`، `src/locales/fa.ts`، `src/locales/en.ts`، `src/styles.css`، `src/features/auth`، `src/pages/Home.tsx`؛ جزئیات Login در سندهای ۰۱ و ۱۹ | قابل استفاده با قرارداد فعلی؛ دیاگرام پارکینگ نمایشی است و داده‌ی زنده نیست |
| فهرست پارکینگ‌ها | CRUD پیاده‌سازی شده | `ParkingDirectoryWorkspace.tsx` | پیاده‌سازی UI؛ API کامل نیازمند تأیید Backend |
| کاربران و سطوح دسترسی | CRUD پیاده‌سازی شده | `UserManagementWorkspace.tsx`، `AccessLevelWorkspace.tsx` | پیاده‌سازی UI؛ مجوز نهایی با Backend |
| مشخصات پارکینگ | فرم تب‌بندی‌شده با گزینه‌های فعال‌سازی تب‌ها و `EosTimeOnDayPicker` برای ساعت‌های روزانه‌ی شیفت | `ParkingFormFields.tsx`، `EosTimeOnDayPicker.tsx`، `ParkingDetailsWorkspace.tsx`، `ParkingDirectoryWorkspace.tsx`؛ جزئیات در سند ۰۳ | propertyهای `IsCommercialParking` و `HasUserShifts` به `ParkingEntity` در سورس Backend افزوده شده و دیتابیس با EF automatic migrations به‌روز می‌شود؛ اعمال در محیط اجرا نیازمند build/deploy Backend است. ذخیره‌ی پارکینگ بدون شیفت همچنان به‌علت non-null بودن ساعت شیفت اول نیازمند تصمیم Backend است |
| کارت‌ها و تجهیزات | workflow اصلی پیاده‌سازی شده | `CardManagementWorkspace.tsx`، `CameraEquipmentWorkspace.tsx` | API و مجوزهای رسمی هنوز نیازمند تأیید |
| انواع جای‌پارک، طبقات، زون‌ها و انواع عضویت | CRUD و حالت‌های اصلی پیاده‌سازی شده | `ParkingDefinitionsCrudWorkspace.tsx` | زون‌ها طبق سند ۲۳ تطبیق شده‌اند؛ خطاهای رسمی API ناقص است |
| تعرفه‌ها و اعضا | workflow ایجاد، ویرایش، حذف و ثبت/لغو اصلی پیاده‌سازی شده | `features/tariffs`، `features/members` | قراردادهای خطا، مجوز و برخی عملیات Windows ناقص است |
| مجوز خروج | فهرست، فیلتر و تغییر مجوز پیاده‌سازی شده | `ExitPermissionWorkspace.tsx` | قرارداد Backend و audit نیازمند تأیید |
| درب‌ها و کنترل فهرست خودرو | عمدتاً read-only | `ReadOnlyModuleWorkspace.tsx` | عملیات کامل پیاده‌سازی نشده است |
| اختصاص شیفت، مدیریت تردد، مانیتورینگ و ANPR | workspace و wiring route/API در کد موجود است؛ ANPR شامل SSE event-driven، merge رکورد، lazy image، مدیریت خطای جزئی تجهیزات و workflow حذف تصویر است | `HomeFormRoutes.tsx`، `ShiftAssignmentWorkspace.tsx`، `TrafficRecordsWorkspace.tsx`، `AnprMonitoringWorkspace.tsx`، `management.ts` | قرارداد رسمی API، تصویر و deployment stream نیازمند تأیید Backend |
| یکپارچه‌سازی، ETS و Excel | placeholder یا فاقد endpoint قابل اتکا | `homeMenuModel.tsx`، `ReadOnlyModuleWorkspace.tsx` | باز و نیازمند قرارداد Backend/تصمیم محصول |
| گزارش‌های پارکینگ | آیتم‌های منو وجود دارند، اما مقصدها عمدتاً placeholder/read-only هستند | `homeMenuModel.tsx`، `HomeFormRoutes.tsx` | باز و نیازمند تکمیل مستقل |
| دوربین RTSP | اتصال WebRTC/HLS، وضعیت، lifecycle مقاوم در برابر unmount و overlay ROI پایه پیاده‌سازی شده | سند ۲۴، `CameraStreamPreview.tsx` و تست lifecycle | drag/edit/delete تعاملی ROI هنوز انجام نشده است |

### رفتار route guard و مسیرهای غیرمجاز

**وضعیت:** اصلاح‌شده در UI.

- نبودن یا انقضای session همچنان کاربر را به Login می‌فرستد؛ این تنها حالت redirect به Login است.
- route ناشناخته یا خارج از قرارداد `/home/*` بدون تغییر URL داخل پوسته‌ی Home نمایش داده می‌شود و پیام «این مسیر وجود ندارد» می‌گیرد؛ به این ترتیب Home unmount نمی‌شود و تب‌های باز از بین نمی‌روند.
- route شناخته‌شده اما غیرمجاز، داخل پوسته‌ی Home باقی می‌ماند؛ تب آن route باز می‌شود و workspace به‌جای داده، پیام «شما به این قسمت دسترسی ندارید» و مسیر بازگشت به Home را نمایش می‌دهد.
- این guard فقط کنترل UX و navigation است و جایگزین authorization سمت Backend نیست؛ پاسخ‌های 401/403 همچنان باید در API client و featureها مدیریت شوند.
- تست مستقیم URL برای کاربر بدون مجوز باید در معیار تحویل باقی بماند.

### JavaScript خام و استثنای فنی مصوب

`src/vendor/mediamtx-reader.js` در `CameraStreamPreview.tsx` استفاده می‌شود. این فایل
برای اتصال WebRTC یک وابستگی فنی خارجی/خام محسوب می‌شود و با خط قرمز JavaScript خام
در بخش ۱۰.۱۰ استاندارد تعارض دارد.

**وضعیت:** استثنای فنی مصوب؛ فعلاً بدون تغییر کد.

انتقال کامل این reader به TypeScript در این مرحله انجام نمی‌شود؛ زیرا فایل فقط یک
helper ساده نیست و منطق WHEP/WebRTC، مذاکره‌ی SDP و codec، ICE، authentication،
retry و مدیریت session را در بر می‌گیرد. بازنویسی بدون تست معادل می‌تواند اتصال
دوربین، سازگاری codec یا cleanup session را دچار regression کند. reader رسمی
MediaMTX برای همین سناریو در نظر گرفته شده و مسیر HLS نیز به‌عنوان fallback در UI
وجود دارد.

مشخصات استثنا:

- **دلیل فنی:** استفاده از reader رسمی MediaMTX برای پخش WHEP/WebRTC در مرورگر؛
  API native مرورگر به‌تنهایی WHEP و منطق signaling این سرویس را فراهم نمی‌کند.
- **محدوده:** فقط `src/vendor/mediamtx-reader.js` و فقط مسیر پخش WebRTC در
  `CameraStreamPreview.tsx`؛ این استثنا مجوز افزودن JavaScript خام جدید در سایر
  بخش‌های پروژه نیست.
- **مالک:** تیم Frontend با هماهنگی مالک زیرساخت و سرویس MediaMTX.
- **ریسک‌ها:** وابستگی به نسخه و API reader، تفاوت پشتیبانی codec/مرورگر،
  مدیریت retry و احتمال باقی‌ماندن session در صورت cleanup ناقص.
- **کنترل‌ها:** نگهداری فایل در مسیر vendor، حفظ declaration TypeScript، بستن
  reader در unmount/disconnect، استفاده از HLS به‌عنوان fallback، و اجرای تست
  lifecycle دوربین پیش از تحویل.
- **برنامه بازبینی:** در صورت تغییر نسخه MediaMTX، تغییر WHEP endpoint، رخداد
  امنیتی یا نیاز به کنترل بیشتر روی lifecycle، adapter TypeScript و جایگزینی
  reader دوباره ارزیابی شود. تا آن زمان فایل خام عمداً بازنویسی نمی‌شود.

## تغییرات انجام‌شده تا این مرحله

### زیرساخت تست

- اضافه‌شدن Vitest و React Testing Library؛
- اضافه‌شدن Playwright و تست پایه‌ی E2E؛
- اضافه‌شدن scriptهای `typecheck`، `test`، `test:watch`، `test:e2e` و `build`؛
- اضافه‌شدن selectorهای پایدار برای فیلدها و دکمه‌های Login؛
- اضافه‌شدن fixture و تست برای Login، API client و قرارداد پاسخ‌ها؛
- تعریف استاندارد اجرای تست عامل هوش مصنوعی در `20-ai-testing-standard.md`.

### API client و قرارداد داده

- اضافه‌شدن timeout پیش‌فرض API؛
- پشتیبانی از cancellation با `AbortController`؛
- مدیریت پاسخ‌های JSON، متن و `204`؛
- اضافه‌شدن parser مبتنی بر Zod برای پاسخ Login و session؛
- ردکردن کاربر نامعتبر یا شناسه کاربر صفر؛
- نگهداری سازگاری با `ResponseResultTypes.Ok = 1` در Backend قدیمی؛
- حفظ سازگاری با پاسخ‌های Legacy که `ResponseResultType` را ارسال نمی‌کنند، مشروط به معتبر بودن user.

### نشست و نگهداری token

- token نشست از Login و SSO توسط Backend در cookie `EosSession` صادر می‌شود؛ cookie
  `HttpOnly` و `SameSite=Lax` است و production باید `AuthCookieSecure=true` و HTTPS
  داشته باشد؛
- UI token را در `sessionStorage`/`localStorage` ذخیره نمی‌کند و در header یا query
  string ارسال نمی‌کند؛ client مشترک همه requestها را با `credentials: include` می‌فرستد؛
- snapshot غیرحساس کاربر در `sessionStorage` فقط برای بازسازی سریع پوسته نگهداری
  می‌شود و اعتبار نشست را تعیین نمی‌کند؛
- Backend برای گذار کم‌ریسک header `UserToken` را موقتاً می‌پذیرد، اما این مسیر
  legacy نباید در قابلیت جدید یا کد UI استفاده شود؛
- CORS باید origin دقیق UI را allow کند؛ استفاده از `Access-Control-Allow-Origin: *`
  همراه credential ممنوع است.

### Permission و Home

- permission نام‌دار به‌عنوان مسیر اصلی مجوز UI اضافه شده است؛
- برای Backend قدیمی، fallback به `UserAccessLevelId === 1` حفظ شده است؛
- sessionهای قبلی که permission جدید ندارند، در صورت وجود `canManageDashboard` یا سطح دسترسی قدیمی، همچنان layout مدیریتی را دریافت می‌کنند؛
- Home برای مدیر و کاربر عادی دو layout متفاوت دارد و تشخیص نقش نباید بدون تست تغییر کند.

## Regressionهای شناسایی‌شده و اصلاح‌شده

### خرابی Login

در یک تغییر، پاسخ Login بیش از حد سخت‌گیرانه تفسیر شد:

- نبودن `ResponseResultType` ناموفق تلقی شد؛
- وجود token اجباری شد.

این رفتار با Backend قدیمی سازگار نبود. شرط Login با قرارداد واقعی Windows تطبیق داده شد و تست پاسخ `ResponseResultType = 1` اضافه شد.

### خرابی Home

در یک تغییر، تشخیص مدیر فقط بر اساس permission نام‌دار انجام شد. Backend فعلی permission نام‌دار ارسال نمی‌کند و از `UserAccessLevelId` استفاده می‌کند. نتیجه، حذف sidebar و منوی مدیریت از Home بود.

Fallback قدیمی برگردانده شد و تست نمایش منوی مدیریت برای کاربر مدیر اضافه شد.

## سیاست اجباری جلوگیری از Regression

هیچ تغییر جدیدی نباید قابلیت، ظاهر یا رفتار قبلی را بدون تصمیم صریح محصول حذف یا خراب کند.

قبل از تحویل هر تغییر، حداقل این موارد باید بررسی شوند:

1. `npm run typecheck`
2. `npm run test`
3. `npm run build`
4. Login با پاسخ Legacy واقعی یا fixture معادل؛
5. Home برای کاربر مدیر و کاربر عادی؛
6. حفظ sidebar، header، theme، زبان و responsive behavior؛
7. حفظ route و session بعد از refresh؛
8. بررسی اینکه placeholderهای قبلی، menu itemها و navigation بدون تصمیم محصول حذف نشده باشند.

## قواعد تغییر کد

- تغییر قرارداد Backend باید با adapter انجام شود، نه با جایگزینی ناگهانی رفتار قبلی؛
- parser جدید باید پاسخ‌های Legacy ثبت‌شده را پوشش دهد؛
- permission جدید باید تا زمان تحویل Backend، fallback سازگار داشته باشد؛
- تغییر CSS یا theme باید در light/dark، فارسی/انگلیسی، desktop/mobile بررسی شود؛
- عملیات حساس نباید با mock موفقیت‌آمیز به‌عنوان قابلیت واقعی گزارش شوند؛
- هر regression باید با یک تست بازتولیدکننده ثبت و سپس اصلاح شود؛
- تست موفق به‌تنهایی کافی نیست؛ حفظ رفتار قبلی نیز بخشی از معیار پذیرش است.

## وضعیت اعتبارسنجی فعلی

در آخرین بررسی:

- ۱۵ فایل تست و ۴۶ تست خودکار موفق است؛
- `typecheck` موفق است؛
- `build` موفق است؛
- build یک هشدار non-blocking برای chunkهای بزرگ‌تر از ۵۰۰KB دارد؛ chunkهای بزرگ فعلی
  حدود ۸۲۰KB و ۷۳۳KB هستند و باید در بررسی performance/lazy-loading پیگیری شوند؛
- تست E2E از نظر کد آماده است، اما اجرای آن به نصب Chromium وابسته است و دانلود مرورگر در محیط فعلی با خطای منطقه‌ای `403` متوقف شده است؛
- اتصال واقعی Backend، session refresh، permission server-side، idempotency، تجهیزات و workflowهای اصلی هنوز نیازمند قرارداد Backend هستند.

## تصمیم تثبیت‌شده

«تکمیل یک قابلیت جدید» زمانی قابل قبول است که قابلیت‌های قبلی همچنان کار کنند. سرعت توسعه، ساده‌سازی معماری یا سخت‌گیرترکردن validation مجوز تغییر رفتار موجود بدون تست regression نیست.

## ثبت اصلاحات خطوط قرمز React

در بازبینی اخیر، موارد زیر برای انطباق با بخش ۱۰.۱۰ استاندارد اصلاح شدند:

- درخواست Login از صفحه خارج و به `features/auth/authService.ts` و hook اختصاصی منتقل شد؛
- مدیریت theme، direction، زبان و font از دستکاری مستقیم `document.documentElement` به state، props، `ThemeProvider` و ریشهٔ declarative React منتقل شده است؛ `App.tsx` نباید برای این stateهای UI مستقیماً `document` یا style آن را تغییر دهد؛
- routeهای workspace با `lazy` و `Suspense` بارگذاری می‌شوند؛
- gradient، حرکت نمایشی کارت‌ها و shadowهای سنگین از styleهای اصلی حذف یا محدود شدند؛
- کلید رمزنگاری Legacy دیگر در source قرار ندارد و فقط از پیکربندی محیطی خوانده می‌شود؛ نبودن آن باید با خطای امن متوقف شود؛
- password در هیچ storage مرورگر ذخیره نمی‌شود. مقادیر موجود در test setup صرفاً fixture تستی هستند و نباید وارد production شوند.

موارد باز این بازبینی—تکمیل workflowهای خارج از دامنه‌ی این snapshot و بهینه‌سازی
chunkهای بزرگ—هنوز اصلاح نشده‌اند و نباید به‌عنوان موارد انجام‌شده گزارش شوند.
`mediamtx-reader.js` دیگر مورد بلاتکلیف نیست و طبق استثنای فنی مصوب بالا فعلاً
بدون تغییر نگهداری می‌شود.

این تغییرات باید در هر feature جدید نیز رعایت شوند؛ هر دستکاری imperative UI، secret ثابت، ذخیره password یا API مستقیم در page، مانع تحویل است.
