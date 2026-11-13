# معماری فعلی UI React

**وضعیت:** تطبیق با کد موجود در `EosParkingReactUi` در 2026-11-04؛ جایگزین پیشنهاد اولیهٔ معماری.
**مرجع الزام‌آور:** [استاندارد مستندسازی و React](00-documentation-standard.md). توصیف رفتار فعلی، تأیید انطباق کامل کد با استاندارد نیست.

## ۱. پشتهٔ موجود

| نیاز | پیاده‌سازی فعلی | منبع |
|---|---|---|
| زبان و UI | React و TypeScript با `strict: true` و `allowJs: false` | `package.json`، `tsconfig.app.json` |
| build | Vite و plugin React | `vite.config.ts` |
| مسیرها | React Router؛ `BrowserRouter` در ریشه و routeهای اصلی و Home | `src/main.tsx`، `src/App.tsx`، `src/pages/HomeFormRoutes.tsx` |
| دادهٔ API | fetch با client مشترک، سرویس و hook اختصاصی؛ در بعضی workspaceها مصرف مستقیم سرویس از component | `src/api/client.ts`، `src/api/management.ts`، `src/features/home` |
| state فرم | state و hookهای React؛ Zod و validation اختصاصی بسته به feature | `ParkingFormFields.tsx`، `MemberManagementWorkspace.tsx`، `src/features/auth` |
| ظاهر | MUI، Emotion، stylis RTL، Theme مشترک و CSS | `src/App.tsx`، `src/theme.ts`، `src/styles.css` |
| جدول | `AppDataGrid` اختصاصی مبتنی بر MUI `Table` | `src/components/AppDataGrid.tsx` |
| تاریخ و ساعت | MUI X Date Pickers و dayjs با کنترل‌های مشترک | `EosDateTimePicker.tsx`، `EosTimeOnDayPicker.tsx` |
| ترجمه | i18next و react-i18next با منابع مستقل فارسی/انگلیسی | `src/i18n/instance.ts`، `src/locales` |
| modal | `AppPopup` و adapterهای `CrudDialog` و `ConfirmDialog` | [سند ۱۰](10-shared-ui-components.md) |
| تست | Vitest، Testing Library و Playwright؛ fixture و mock مرز شبکه | `package.json`، `src/**/*.test.*`، `tests/e2e` |

**رفتار فعلی:** TanStack Query، React Hook Form، Zustand، Redux، Axios، MSW و `@mui/x-data-grid` در `package.json` dependency نیستند. پیشنهادهای قبلی دربارهٔ QueryClient، React Query cache، React Hook Form و MUI Data Grid Community توصیف این برنامه نیستند و مبنای پیاده‌سازی محسوب نمی‌شوند. افزودن dependency تابع سند ۰۰ است.

`noUncheckedIndexedAccess` و `noImplicitOverride` در `tsconfig.app.json` فعلی تنظیم نشده‌اند؛ نمونهٔ پیشنهادی قبلی پیکربندی فعال نبود.

## ۲. راه‌اندازی، پوسته و state

- `src/main.tsx` ابتدا `loadRuntimeConfig()` را اجرا و سپس React را با `StrictMode`، `BrowserRouter` و `NavigationGuardProvider` mount می‌کند.
- `src/App.tsx` مالک state نشست، زبان، مود، palette و shape است؛ `ThemeProvider`، `LocalizationProvider` و cache RTL در همین لایه قرار دارند. `AuthContext` یا `QueryClientProvider` پیشنهادی قبلی در این ساختار وجود ندارد.
- snapshot غیرحساس کاربر در `sessionStorage` برای بازسازی پوسته نگهداری می‌شود؛ cookie نشست مرجع احراز هویت است. جزئیات در [سند ۰۱](01-authentication.md) است.
- `NavigationGuardContext` درخواست جابه‌جایی را برای workflowهای دارای تغییر ذخیره‌نشده هماهنگ می‌کند.
- قرارداد route، permission، tabs/classic و داشبورد فقط در [سند ۲۵](25-home.md) نگهداری می‌شود.

## ۳. داده، API و قرارداد Backend

**رفتار فعلی:** `src/api/client.ts` مسئول base URL، fetch، cookie با مقدار پیش‌فرض `credentials: include`، timeout، cancellation و parse پاسخ است. ابطال نشست برای HTTP 401 و `ResponseResultType = 11` به handler ثبت‌شده اعلام می‌شود. parserها در `src/api/contracts.ts` و سرویس‌های feature قرار دارند؛ وجود آن‌ها به‌معنای اعتبارسنجی یکسان همهٔ پاسخ‌ها نیست.

دادهٔ سرور در state محلی hook/workspace نگهداری می‌شود و cache عمومی React Query وجود ندارد. برای نمونه، `useHomeParkingInfo` بارگذاری، refresh، cancellation، polling و retry محدود اختصاصی دارد؛ این رفتار عمومی همهٔ endpointها نیست و قرارداد دقیق آن در سند ۲۵ است.

**قاعدهٔ توسعه:** مسیر مرجع `UI → custom hook → feature service → src/api/client.ts → External Backend API` است. **ناقص/نیازمند اصلاح:** بعضی workspaceهای فعلی، از جمله `ParkingDetailsWorkspace.tsx` و `MemberManagementWorkspace.tsx`، API را از همان component فراخوانی می‌کنند؛ وجود این الگو مجوز استفاده در قابلیت جدید نیست.

پروژه مصرف‌کنندهٔ Backend است؛ قرارداد ناقص باید در [درخواست‌های Backend](14-web-backend-requests.md) ثبت شود. mock تست، schema مصرف‌شده یا type کلاینت جایگزین تأیید رسمی قرارداد نیست.

## ۴. ساختار فعلی source

```text
src/
  main.tsx, App.tsx, config.ts, theme.ts, styles.css
  api/                  # client، قراردادها، APIهای مدیریت و realtime
  components/           # کنترل‌ها و پوسته‌های مشترک
    definitions/
    management/         # workspaceها و فرم‌های مدیریت
  features/
    auth/
    home/
    home3/              # پوشهٔ موجود؛ به‌معنای route مستقل نیست
    members/
    reports/
    tariffs/
    traffic/            # کنترل زنده، سوابق، بار، صورتحساب، serviceها و hookهای مستقل
  hooks/
  i18n/, locales/
  pages/                # route، پوسته و navigation
  utils/, assets/, test/, vendor/
tests/
  e2e/
  fixtures/
```

پوشه‌های `app/`، `layouts/`، `shared/` و `mocks/` در نمودار پیشنهادی قبلی ساختار فعلی نیستند. معماری موجود ترکیبی از featureها و workspaceهای `components/management` است؛ انتقال کامل به معماری feature-based انجام‌شده تلقی نمی‌شود.

## ۵. فرم، جدول و modal

**به‌روزرسانی کنترل تردد — ۲۰۲۶/۱۱/۱۲:** دو منوی کنترل زنده و سوابق به‌ترتیب از `features/traffic/TrafficControlWorkspace.tsx` و `TrafficHistoryWorkspace.tsx` استفاده می‌کنند. فایل قبلی `components/management/TrafficRecordsWorkspace.tsx` adapter سازگاری route است. APIهای سوابق، درب، ثبت بار و انتخاب دوربین از hook به service منتقل شده‌اند؛ پرداخت و draft بار hook مستقل دارند. helperهای رکورد به `utils/records.ts` منتقل شده‌اند تا service به workspace رابط وابسته نباشد. نگاشت کامل مسئولیت‌ها و متن‌های ترجمه‌شده در بخش ۱۹ سند ۱۲ ثبت شده است؛ این تغییر ادعای بازآرایی سایر workspaceهای برنامه نیست.

- state فرم با React مدیریت می‌شود و validation بسته به feature از Zod یا تابع اختصاصی می‌آید؛ فرم جدید تابع سند ۰۰ است.
- `AppDataGrid` ردیف‌ها را از مصرف‌کننده می‌گیرد؛ فیلتر مشترک روی ردیف‌های دریافت‌شده با AND اعمال می‌شود. server-side pagination/filter/sort قابلیت عمومی خودکار این component نیست؛ هر مورد نیازمند قرارداد API خودش است.
- پوستهٔ modalهای کسب‌وکاری `AppPopup` است؛ عنوان، footer، دکمه‌ها و busy در آن کنترل می‌شوند. محتوا، validation و mutation متعلق به feature هستند. قرارداد، استثناها و اسکرول جدول در [سند ۱۰](10-shared-ui-components.md) ثبت شده‌اند.
- `ParkingFormFields` دو layout دارد: popup فهرست پارکینگ‌ها tabbed و صفحهٔ مشخصات دارای sectionهای هم‌زمان است؛ جزئیات در [سند ۰۳](03-parking-configuration.md) است.

## ۶. realtime، تصویر و تجهیزات

آداپتورهای realtime در `src/api` و hookهای feature قرار دارند؛ رفتار و cleanup هر صفحه باید از همان قابلیت استخراج شود. قرارداد نقشهٔ Home در سند ۲۵، مانیتورینگ در [سند ۰۷](07-monitoring-and-devices.md) و پخش دوربین در [سند ۲۴](24-rtsp-camera-ui-integration.md) است. reader جاوااسکریپتی MediaMTX استثنای ثبت‌شده در [سند ۲۱](21-implementation-progress-and-regression-policy.md) است.

**عکس ثبت تردد:** `useTrafficDetectionWorkflow.capturePlateImage` منبع همان پلاک را هنگام ثبت ثابت می‌کند؛ فریم جایگزین از ref React دوربین همان جهت گرفته می‌شود. `trafficImageCapture.ts` فقط decode/خواندن پیکسل و آماده‌سازی رسانه را انجام می‌دهد و DOM ظاهری یا state کسب‌وکار را مدیریت نمی‌کند. `trafficOperationService` عکس را در DTO موجود ارسال می‌کند؛ تضمین حجم نهایی زیر ۲۰٬۰۰۰ بایت، مسئولیت helper بک‌اند در دو مسیر Repository است. سقف ورودی UI با سقف ذخیره یکی نیست. جدول مراحل، دامنهٔ عکس‌های جدید و مرز سوابق/عکس عضو در بخش ۳.۵.۴ [سند فرم](12-manual-traffic-control-form.md) مرجع‌اند.

## ۷. کیفیت و فاصله با استاندارد

**رفتار فعلی:** scriptهای `typecheck`، `test`، `test:watch`، `test:e2e` و `build` در `package.json` وجود دارند. script فعلی `lint` فقط `tsc -b --pretty false` است؛ اجرای آن تأیید ESLint یا Prettier محسوب نمی‌شود. این دو ابزار در dependencyهای فعلی ثبت نشده‌اند؛ الزام استاندارد به آن‌ها با وضعیت نصب متفاوت است.

تست‌ها در این تطبیق مستندات اجرا نشده‌اند. وجود تست، lazy workspace، guard یا parser به‌تنهایی تأیید کامل کیفیت، accessibility، قرارداد API یا پوشش همهٔ workflowها نیست. پوشش سناریوهای جدید در [سند ۱۹](19-ui-visual-review-and-progress.md) و سیاست تحویل در سندهای ۰۰، ۲۰ و ۲۱ ثبت شده است.

## ۸. جلوگیری از چند نمونهٔ React در محیط توسعه

**رفتار فعلی:** `vite.config.ts` با `resolve.dedupe` مسیر React/React DOM و وابستگی‌های contextمحور MUI/Emotion را یکسان نگه می‌دارد. `optimizeDeps.entries` sourceهای برنامه، از جمله workspaceهای lazy، را اسکن می‌کند و runtimeهای React و ورودی‌های مشترک MUI صریحاً pre-bundle می‌شوند.

سرور توسعه از `node_modules/.vite` استفاده می‌کند؛ سرور Playwright با متغیر `EOS_PARKING_VITE_CACHE_DIR` کش مستقل `node_modules/.vite-playwright` دارد. اجرای هم‌زمان دو سرور با کش مشترک می‌تواند graph بهینه‌شده را جایگزین و خطای `Invalid hook call` ایجاد کند. پس از تغییر تنظیمات، سرور باید آن‌ها را بارگیری کند و تب قدیمی refresh کامل شود. `tests/e2e/create-forms.spec.ts` بازماندن برنامه، نبود page error و استفاده از یک module URL برای React را هنگام افزودن طبقه/عضو بررسی می‌کند؛ نتیجهٔ اجرای تازه در این بازبینی ثبت نشده است.
