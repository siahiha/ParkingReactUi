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

بخش زیادی از menu itemها هنوز placeholder هستند و به workflow و API واقعی متصل نشده‌اند.

## آخرین تطبیق مستندات با کد UI

این بخش نتیجه‌ی تطبیق مستقیم مستندات با مسیرها و componentهای موجود در
`EosParkingReactUi` است. موارد زیر «رفتار فعلی» هستند و نباید به‌عنوان قابلیت
تکمیل‌شده تلقی شوند مگر آنکه در وضعیت آن‌ها صریحاً چنین چیزی نوشته شده باشد.

| حوزه | وضعیت فعلی در UI | منبع کد/مستند | وضعیت تحویل |
|---|---|---|---|
| Login، session و Home | پیاده‌سازی شده و تست regression دارد | `src/App.tsx`، `src/features/auth`، `src/pages/Home.tsx` | قابل استفاده با قرارداد فعلی |
| فهرست پارکینگ‌ها | CRUD پیاده‌سازی شده | `ParkingDirectoryWorkspace.tsx` | پیاده‌سازی UI؛ API کامل نیازمند تأیید Backend |
| کاربران و سطوح دسترسی | CRUD پیاده‌سازی شده | `UserManagementWorkspace.tsx`، `AccessLevelWorkspace.tsx` | پیاده‌سازی UI؛ مجوز نهایی با Backend |
| مشخصات پارکینگ، کارت‌ها و تجهیزات | workflow اصلی پیاده‌سازی شده | `ParkingDetailsWorkspace.tsx`، `CardManagementWorkspace.tsx`، `CameraEquipmentWorkspace.tsx` | API و مجوزهای رسمی هنوز نیازمند تأیید |
| انواع جای‌پارک، طبقات، زون‌ها و انواع عضویت | CRUD و حالت‌های اصلی پیاده‌سازی شده | `ParkingDefinitionsCrudWorkspace.tsx` | زون‌ها طبق سند ۲۳ تطبیق شده‌اند؛ خطاهای رسمی API ناقص است |
| تعرفه‌ها و اعضا | workflow ایجاد، ویرایش، حذف و ثبت/لغو اصلی پیاده‌سازی شده | `features/tariffs`، `features/members` | قراردادهای خطا، مجوز و برخی عملیات Windows ناقص است |
| مجوز خروج | فهرست، فیلتر و تغییر مجوز پیاده‌سازی شده | `ExitPermissionWorkspace.tsx` | قرارداد Backend و audit نیازمند تأیید |
| درب‌ها و کنترل فهرست خودرو | عمدتاً read-only | `ReadOnlyModuleWorkspace.tsx` | عملیات کامل پیاده‌سازی نشده است |
| شیفت، تردد دستی، مدیریت تردد، مانیتورینگ و ANPR | placeholder یا فاقد workflow کامل | `HomeFormRoutes.tsx`، `ReadOnlyModuleWorkspace.tsx` | باز و خارج از وضعیت تکمیل |
| یکپارچه‌سازی، ETS و Excel | placeholder یا فاقد endpoint قابل اتکا | `homeMenuModel.tsx`، `ReadOnlyModuleWorkspace.tsx` | باز و نیازمند قرارداد Backend/تصمیم محصول |
| گزارش‌های پارکینگ | آیتم‌های منو وجود دارند، اما مقصدها عمدتاً placeholder/read-only هستند | `homeMenuModel.tsx`، `HomeFormRoutes.tsx` | باز و نیازمند تکمیل مستقل |
| دوربین RTSP | اتصال WebRTC/HLS، وضعیت، lifecycle و overlay ROI پایه پیاده‌سازی شده | سند ۲۴ و `CameraStreamPreview.tsx` | drag/edit/delete تعاملی ROI هنوز انجام نشده است |

### نقص route guard

در وضعیت فعلی، `ParkingPage` آیتم‌های پارکینگ را با فهرست قابل مشاهده تطبیق می‌دهد،
اما `ManagementPage` برای مسیرهای `users`، `access` و `exit` پیش از render بررسی
نمی‌کند که بخش در `visibleManagementItems` وجود دارد. بنابراین ورود مستقیم به URL
می‌تواند صفحه‌ی مدیریت را در UI باز کند، حتی اگر آیتم در منوی کاربر نمایش داده
نشود. این موضوع جایگزین authorization سمت Backend نیست، اما با الزام route guard
و action guard استاندارد سازگار نیست.

**وضعیت:** ناقص/نیازمند اصلاح UI. تا زمان اصلاح، تست مستقیم URL برای کاربر بدون
مجوز باید در معیار تحویل باقی بماند و Backend باید مجوز نهایی را enforce کند.

### JavaScript خام و استثنای فنی

`src/vendor/mediamtx-reader.js` در `CameraStreamPreview.tsx` استفاده می‌شود. این فایل
برای اتصال WebRTC یک وابستگی فنی خارجی/خام محسوب می‌شود و با خط قرمز JavaScript خام
در بخش ۱۰.۱۰ استاندارد تعارض دارد.

**وضعیت:** ناقص/نیازمند تصمیم. یکی از این دو اقدام باید انجام شود:

1. wrapper و کد قابل نگهداری به TypeScript منتقل شود؛ یا
2. استثنای فنی با مالک، دلیل، محدوده و برنامه‌ی حذف/جایگزینی در همین سند ثبت شود.

تا تعیین تکلیف، این مورد مانع تأیید کامل feature دوربین است.

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

- ۱۲ فایل تست و ۳۹ تست خودکار موفق است؛
- `typecheck` موفق است؛
- `build` موفق است؛
- build یک هشدار non-blocking برای chunkهای بزرگ‌تر از ۵۰۰KB دارد؛ بزرگ‌ترین chunk
  فعلی حدود ۷۹۳KB است و باید در بررسی performance/lazy-loading پیگیری شود؛
- تست E2E از نظر کد آماده است، اما اجرای آن به نصب Chromium وابسته است و دانلود مرورگر در محیط فعلی با خطای منطقه‌ای `403` متوقف شده است؛
- اتصال واقعی Backend، session refresh، permission server-side، idempotency، تجهیزات و workflowهای اصلی هنوز نیازمند قرارداد Backend هستند.

## تصمیم تثبیت‌شده

«تکمیل یک قابلیت جدید» زمانی قابل قبول است که قابلیت‌های قبلی همچنان کار کنند. سرعت توسعه، ساده‌سازی معماری یا سخت‌گیرترکردن validation مجوز تغییر رفتار موجود بدون تست regression نیست.

## ثبت اصلاحات خطوط قرمز React

در بازبینی اخیر، موارد زیر برای انطباق با بخش ۱۰.۱۰ استاندارد اصلاح شدند:

- درخواست Login از صفحه خارج و به `features/auth/authService.ts` و hook اختصاصی منتقل شد؛
- مدیریت theme و direction از دستکاری `document` به state، props و ThemeProvider/DOM declarative منتقل شد؛
- routeهای workspace با `lazy` و `Suspense` بارگذاری می‌شوند؛
- gradient، حرکت نمایشی کارت‌ها و shadowهای سنگین از styleهای اصلی حذف یا محدود شدند؛
- کلید رمزنگاری Legacy دیگر در source قرار ندارد و فقط از پیکربندی محیطی خوانده می‌شود؛ نبودن آن باید با خطای امن متوقف شود؛
- password در هیچ storage مرورگر ذخیره نمی‌شود. مقادیر موجود در test setup صرفاً fixture تستی هستند و نباید وارد production شوند.

موارد باز این بازبینی—route guard مدیریت، تعیین تکلیف `mediamtx-reader.js`، تکمیل
workflowهای placeholder و بهینه‌سازی chunkهای بزرگ—هنوز اصلاح نشده‌اند و نباید به‌عنوان
موارد انجام‌شده گزارش شوند.

این تغییرات باید در هر feature جدید نیز رعایت شوند؛ هر دستکاری imperative UI، secret ثابت، ذخیره password یا API مستقیم در page، مانع تحویل است.
