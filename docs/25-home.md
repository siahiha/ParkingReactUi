# قرارداد مرجع Home وب

**وضعیت:** مرجع قطعی قرارداد نسخه React وب

**دامنه:** route، پوسته، منوها، داشبورد، گزارش‌ها، permission، ترجمه و APIهای مرتبط با Home در `EosParkingReactUi`

این سند تنها محل ثبت قرارداد Home وب است. سندهای دیگر می‌توانند به این سند ارجاع دهند، اما نباید فهرست منوها، routeها، گزارش‌ها یا رفتار داشبورد را دوباره تعریف کنند.

## ۱. مرز محصول وب و ویندوز

`DashboardForm` ویندوز و `Home`/`HomeDashboard` وب دو نرم‌افزار/کلاینت مستقل هستند. ممکن است قابلیت‌ها، مفاهیم دامنه، نقش‌ها یا endpointهای مشابه داشته باشند، اما این اشتراک الزاماً به معنی یکسان‌بودن ظاهر، layout، ترتیب منوها، navigation، تراکم اطلاعات یا interaction نیست.

نسخه وب باید متناسب با مرورگر، responsive behavior، route و دسترس‌پذیری خود طراحی شود. تطبیق وب با ویندوز فقط در مواردی الزامی است که صریحاً در قرارداد قابلیت، permission، route یا API تعیین شده باشد. `DashboardForm` مرجع رفتار نسخه ویندوز است، نه الگوی بصری یا layout برای Home وب.

جزئیات اختصاصی `DashboardForm` ویندوز در [سند ۰۲](02-dashboard-and-navigation.md) باقی می‌ماند.

## ۲. route و چرخه ورود

- برنامه فقط یک Home دارد: route محافظت‌شده‌ی `/home/*`.
- route یا variant مستقلی با نام `/home3` وجود ندارد.
- پس از ورود موفق، مقصد نسخه وب `/home` است.
- کاربر بدون session یا با session منقضی به Login برمی‌گردد؛ این تنها redirect خودکار Home به Login است.
- route ناشناخته داخل پوسته Home باقی می‌ماند، URL را تغییر نمی‌دهد و پیام «این مسیر وجود ندارد» نمایش می‌دهد.
- route شناخته‌شده اما غیرمجاز داخل پوسته Home باقی می‌ماند و workspace پیام عدم دسترسی و مسیر بازگشت به Home را نمایش می‌دهد.

مسیرهای Login و جزئیات احراز هویت در [سند ۰۱](01-authentication.md) ثبت شده‌اند؛ قرارداد مقصد و پوسته Home فقط در همین سند معتبر است.

## ۳. پوسته و ساختار UI

`HomeShell` این اجزا را ترکیب می‌کند:

- `HomeHeader`؛
- `HomeNavigation`؛
- `HomeTabs` در حالت tabs؛
- loading state؛
- محتوای route، شامل `HomeDashboard` یا workspace انتخاب‌شده.

قواعد ظاهری و رفتاری فعلی:

- برند، لوگو و عنوان سامانه در `HomeHeader` قرار دارند؛ لوگو از `public/eos-parking-logo.png` خوانده می‌شود و CSS filter رنگی ندارد.
- ارتفاع پایه Header/Toolbar برابر `64px` است.
- Header شامل navigation trigger، انتخاب‌گر پارکینگ جاری، خانه، تغییر تم و منوی کاربر است.
- منوی کاربر تغییر رمز، تنظیمات ظاهر، تغییر زبان، انتخاب حالت tabs/classic و خروج را ارائه می‌کند.
- در دسکتاپ navigation باز `264px` و فشرده `76px` است؛ در موبایل به Drawer تبدیل می‌شود.
- `HomeTabs` فقط در حالت tabs نمایش داده می‌شود؛ تب Home بسته نمی‌شود و تب‌های مسیرهای دیگر قابل بستن هستند.
- جهت rail، Drawer، Header و workspace باید با `dir` زبان فعال هماهنگ باشد و در RTL/LTR overlap یا اسکرول افقی ایجاد نشود.

## ۴. ساختار قطعی منو

Home سه ریشه دارد:

1. **مدیریت سامانه**
2. **تعاریف و تنظیمات پارکینگ**
3. **گزارش‌ها**

منوی مدیریت سامانه:

- پارکینگ‌ها — فقط فهرست و مدیریت رکوردهای پارکینگ؛ route: `/home/management/list`؛ کلید: `list`
- کاربران و دسترسی
- سطوح دسترسی
- مجوز خروج

منوی تعاریف و تنظیمات پارکینگ:

- مشخصات پارکینگ
- تجهیزات
- انواع جای پارک
- طبقات و تقسیمات
- زون‌های پارکینگ
- درب‌های پارکینگ
- انواع عضویت
- تعرفه
- مدیریت کارت‌ها
- عضویت و ثبت‌نام

زیرگروه **عملیات پارکینگ**:

- مانیتورینگ
- اختصاص شیفت
- کنترل ورود و خروج
- مدیریت ورودها و خروج‌ها
- مانیتورینگ تشخیص پلاک

زیرگروه **یکپارچه‌سازی سامانه‌ها**:

- تنظیم ارتباط با سیستم‌ها
- به‌روزرسانی اعضا از ETS
- دریافت اطلاعات پرسنلی از Excel

هر آیتم باید route مستقل داشته باشد، از renderer مشترک `HomeNavigation` استفاده کند و visibility آن از مدل permission عبور کند. عنوان‌ها و متن‌های نمایشی فقط از resourceهای `i18next` در `src/locales/` خوانده می‌شوند؛ متن فارسی یا انگلیسی در مدل منو، JSX، hook یا handler مجاز نیست.

## ۵. قرارداد route

الگوی routeهای Home به‌صورت زیر است:

| حوزه | الگو | کلیدهای فعلی |
|---|---|---|
| Home | `/home` | نمای داشبورد Home |
| مدیریت سامانه | `/home/management/:section` | `list`، `users`، `access`، `exit` |
| تعاریف پارکینگ | `/home/parking/:itemKey` | `parking-details`، `equipment`، `space-types`، `floors`، `zones`، `doors`، `member-kinds`، `tariffs`، `cards`، `members` |
| عملیات پارکینگ | `/home/parking/:itemKey` | `monitoring`، `shifts`، `manual-traffic`، `traffic-records`، `anpr-monitoring` |
| یکپارچه‌سازی | `/home/parking/:itemKey` | `integration-settings`، `ets-import`، `excel-import` |
| گزارش‌ها | `/home/parking/:itemKey` | کلیدهای ۱۸ گزارش بخش بعد |

`HomeFormRoutes.tsx` routeهای `management/:section` و `parking/:itemKey` را resolve می‌کند. کلید ناشناخته یا خارج از الگو به UnknownRoute می‌رسد؛ کلید شناخته‌شده اما غیرمجاز به AccessDenied می‌رسد و URL حفظ می‌شود.

## ۶. فهرست قطعی ۱۸ گزارش

منوی گزارش‌ها پنج زیرگروه و دقیقاً ۱۸ آیتم دارد:

### گزارش اعضا — ۴ آیتم

1. گزارش اعضا — `member-report`
2. گزارش اعضای دارای عضویت فعال — `active-member-report`
3. گزارش اعضای فاقد عضویت فعال — `inactive-member-report`
4. سابقه عضویت اعضا — `member-register-history`

### گزارش تردد — ۳ آیتم

1. ورود و خروج خودروها — `traffic-reports-list`
2. تعداد تردد روزانه درب‌ها — `door-traffic-reports`
3. متوسط مدت پارک خودرو — `average-parking-time`

### گزارش‌های مالی — ۵ آیتم

1. درآمد پارکینگ — `parking-income`
2. مقایسه درآمد ماهیانه پارکینگ — `monthly-parking-income`
3. گردش مالی اعضا — `member-cash`
4. عملکرد مالی کاربران — `user-performance`
5. ریز درآمد فروش حق عضویت — `membership-income`

### سایر — ۱ آیتم

1. گزارش جزئیات حمل بار — `cargo-details`

### گزارش‌های مدیریتی — ۵ آیتم

1. مقایسه درآمد ماهانه پارکینگ‌ها — `management-monthly-income-comparison`
2. مقایسه درآمد پارکینگ‌ها — `management-income-comparison`
3. مقایسه درآمد سالانه پارکینگ‌ها — `management-yearly-income-comparison`
4. عملکرد مالی کاربران — `management-user-performance`
5. ریز درآمد پارک آزاد خودروها — `management-free-parking-income`

تکرار عنوان «عملکرد مالی کاربران» در دو گروه به معنی یکسان‌بودن route نیست؛ کلیدهای route مستقل هستند.

## ۷. اتصال گزارش‌ها به کد و API

در وضعیت فعلی ۱۷ گزارش به workspace و منطق واقعی گزارش متصل‌اند. `member-register-history` در منو و route وجود دارد، اما در `HomeFormRoutes.tsx` هنوز به workspace مستقل سابقه عضویت متصل نشده است.

| گروه | گزارش‌ها و اتصال فعلی |
|---|---|
| اعضا | سه گزارش اول به `MemberReportWorkspace` و `api/Report/GetMemberReport` متصل‌اند؛ فیلتر تاریخ، نوع عضویت و وضعیت عضو دارند؛ قالب مرجع `MembersReport.mrt` است. سابقه عضویت هنوز pending است. |
| تردد | ورود و خروج خودروها: `api/Report/GetTrafficReport` با `TrafficReport.mrt`/`TrafficWithImageReport.mrt`؛ تعداد تردد روزانه درب‌ها: `api/Report/GetTrafficStatisticReport` با `TrafficStatisticChartReport.mrt`؛ متوسط مدت پارک: `api/Report/GetOccupedHourlyParkByParkingId` با `TotalHourParkingReport.mrt`. |
| مالی | درآمد پارکینگ: `GetParkingDailyIncomingReport`؛ مقایسه درآمد ماهیانه: `GetParkingMonthlyIncomingReport`؛ گردش مالی اعضا: `GetMemberCach`؛ عملکرد مالی کاربران: `GetUserActivity`؛ ریز درآمد فروش حق عضویت: `GetMembershipIncomingDetails`. قالب‌ها در `features/reports` و resources گزارش قرار دارند. |
| سایر | گزارش جزئیات حمل بار به `api/Report/GetCargoIOReport` متصل است؛ داده‌های کمکی از `api/Cargo/GetCargoRequiredData` می‌آیند؛ قالب `CargoIoReport.mrt` استفاده می‌شود. |
| مدیریتی | مقایسه ماهانه، مقایسه کلی و مقایسه سالانه از endpointهای `GetParkingMonthlyIncomingReport` و `GetParkingYearIncomingReport` استفاده می‌کنند؛ عملکرد مالی کاربران از `GetUserActivity` و ریز درآمد پارک آزاد از `GetIncomingDetailsReport` استفاده می‌کند. |

قالب‌های MRT با Viewer وب و `renderAsync2` نمایش داده می‌شوند. برای قالب‌های legacy، binding جدول‌های `MainTable`/`MainTable2` باید در لایه وب حفظ شود. نگاشت فعلی «مقایسه درآمد پارکینگ‌ها» که endpoint سالانه را با قالب ماهانه استفاده می‌کند، رفتار مشاهده‌شده است و تا تصمیم محصول/backend نباید خودسرانه تغییر کند.

جزئیات عمومی فیلترها، خروجی و استاندارد گزارش در [سند ۰۸](08-reports.md) است؛ فهرست و اتصال گزارش‌های Home فقط همین بخش مرجع را دارد.

## ۸. داشبورد Home و داده‌های پارکینگ

`HomeDashboard` برای پارکینگ انتخاب‌شده endpoint زیر را فراخوانی می‌کند:

```text
GET api/Parking/GetInfoById?id={parkingId}
```

داده‌های مصرف‌شده شامل ظرفیت کل، ظرفیت اشغال‌شده، جای خالی، تعداد درب، زمان سرور و وضعیت درب‌هاست. سرویس Home این فیلدها را اعتبارسنجی و normalize می‌کند. نقشه جایگاه‌ها در وضعیت فعلی نمای شماتیک تعاملی با خانه‌های ثابت است و occupancy هر خانه را از API دریافت نمی‌کند.

حالت‌های UI:

- loading فهرست پارکینگ؛
- loading اطلاعات داشبورد؛
- نبود پارکینگ انتخاب‌شده (`noParking`)؛
- خطای دریافت اطلاعات؛
- refresh دستی؛
- مسیر ناشناخته؛
- مسیر شناخته‌شده اما غیرمجاز.

قرارداد رسمی response، خطا و status code این endpoint هنوز از Backend تأیید نشده است؛ بنابراین اعداد نمونه یا schema قطعی نباید به‌عنوان قرارداد نهایی ثبت شوند.

## ۹. polling، retry و cancellation

- refresh دوره‌ای هر `30` ثانیه انجام می‌شود.
- polling فقط زمانی فعال است که تب مرورگر visible باشد.
- hidden شدن تب، interval و درخواست جاری را لغو می‌کند.
- visible شدن دوباره، یک refresh فوری و سپس polling دوره‌ای ایجاد می‌کند.
- تغییر پارکینگ و unmount نیز درخواست جاری و زمان‌بندی polling را لغو می‌کنند.
- خطاهای شبکه، timeout، `408`، `429` و `5xx` حداکثر دو بار با backoffهای `1s` و `3s` retry می‌شوند.
- خطاهای `4xx` به‌صورت خودکار retry نمی‌شوند.
- لغو ناشی از lifecycle نباید به‌عنوان خطای قابل نمایش به کاربر ثبت شود.

پیاده‌سازی مرجع در `src/features/home/useHomeParkingInfo.ts` و تست آن در `src/features/home/useHomeParkingInfo.test.ts` است.

## ۱۰. permission و route guard

Home برای مدیر و کاربر عادی یک `HomeShell` مشترک دارد. تفاوت از این داده‌ها و تصمیم‌ها می‌آید:

- `visibleManagementItems`؛
- `visibleParkingGroups`؛
- `canManageDashboard`؛
- permissionهای نام‌دار؛
- fallback سازگاری با `UserAccessLevelId === 1` در Backend قدیمی؛
- ریشه‌ی اولیه‌ی navigation.

فهرست منو فقط کنترل تجربه کاربر است و جایگزین authorization سمت Backend نیست. API باید مستقل از visibility UI پاسخ‌های `401` و `403` را کنترل کند. دسترسی مستقیم به route غیرمجاز نباید امکان استفاده یا mutation را فراهم کند.

## ۱۱. قرارداد ترجمه

- resourceهای فارسی و انگلیسی در `src/locales/fa.ts` و `src/locales/en.ts` نگهداری می‌شوند.
- componentها از `useTranslation()`/`t()` و کد خارج از React از instance مشترک `src/i18n/instance.ts` استفاده می‌کند.
- متن نمایشی hard-code در Home، مدل منو، hook، handler یا JSX ممنوع است.
- شرط `language === 'fa' ? ... : ...`، helper ترجمه موازی و fallback متنی inline ممنوع است.
- route، API key، enum، identifier و URL مقدار فنی هستند؛ اگر به کاربر نمایش داده شوند، label آن‌ها نیز باید از resource بیاید.

## ۱۲. وضعیت API و موارد باز

### endpointهای پایه‌ی Home

| حوزه | endpoint مشاهده‌شده | وضعیت قرارداد |
|---|---|---|
| فهرست پارکینگ | `api/Parking/Get` | نام endpoint مشخص؛ schema فهرست، status code و authorization نیازمند تأیید |
| اطلاعات داشبورد | `api/Parking/GetInfoById?id={parkingId}` | نام endpoint مشخص؛ response/error و status code نیازمند تأیید |
| طبقات و تقسیمات | `api/Parking/GetParkingFloors`، `api/Parking/GetParkingSections` | نام endpoint مشخص؛ قرارداد کامل نیازمند تأیید |
| درب‌ها و تجهیزات | `api/Parking/GetParkingDoors`، `api/Parking/GetParkingEquipments` | نام endpoint مشخص؛ قرارداد کامل نیازمند تأیید |
| انواع جای پارک | `api/Parking/GetParkingParkSpaceKinds` | نام endpoint مشخص؛ قرارداد کامل نیازمند تأیید |
| تعرفه و اعضا | `api/Tariff/GetByParkingId`، `api/Member/GetByParkingId` | نام endpoint مشخص؛ schema، خطا و permission نیازمند تأیید |
| کارت‌ها | `api/Card/GetByParkingId` | نام endpoint مشخص؛ قرارداد SaveAll و حذف نیازمند تأیید |
| کاربران و سطوح دسترسی | `api/user/Get`، `api/AccessLevel/Get` | نام endpoint مشخص؛ قرارداد کامل و authorization نیازمند تأیید |
| مجوز خروج | `api/traffic/GetPermissions` | نام endpoint مشخص؛ response، status code، authorization و audit نیازمند تأیید |

Endpointهای workspaceهای تخصصی مانند اختصاص شیفت، مدیریت تردد، ANPR، ETS و Excel در سند تخصصی همان feature ثبت می‌شوند؛ اما جایگاه آن‌ها در منوی Home و وضعیت کلی‌شان در همین سند مرجع است. هیچ endpoint مشاهده‌شده از کد، بدون تأیید Controller/OpenAPI، قرارداد رسمی Backend تلقی نمی‌شود.

| حوزه | وضعیت |
|---|---|
| route و پوسته Home | پیاده‌سازی‌شده و دارای تست regression |
| منو و ۱۸ گزارش | مدل و route موجود؛ ۱۷ گزارش به workflow واقعی متصل؛ سابقه عضویت pending |
| داشبورد پارکینگ | endpoint و مصرف UI موجود؛ schema رسمی response/error نیازمند تأیید Backend |
| polling و retry | پیاده‌سازی‌شده با visibility، cancellation و backoff؛ تست hook موجود |
| permission UI | permission نام‌دار و fallback legacy پیاده‌سازی‌شده؛ authorization نهایی با Backend |
| منوهای ETS و Excel | placeholder یا فاقد endpoint قابل اتکا؛ نیازمند قرارداد Backend/تصمیم محصول |
| گزارش مدیریتی «مقایسه درآمد پارکینگ‌ها» | رفتار legacy حفظ شده؛ نیازمند تصمیم درباره endpoint/قالب نهایی |

## ۱۳. فایل‌های مرجع پیاده‌سازی

- پوسته و route: `EosParkingReactUi/src/pages/Home.tsx`، `HomeShell.tsx`
- Header: `EosParkingReactUi/src/pages/HomeHeader.tsx`
- navigation و مدل منو: `EosParkingReactUi/src/pages/HomeNavigation.tsx`، `homeMenuModel.tsx`
- route mapping: `EosParkingReactUi/src/pages/HomeFormRoutes.tsx`
- داشبورد و داده: `HomeDashboard.tsx`، `features/home/homeParkingInfoService.ts`، `features/home/useHomeParkingInfo.ts`
- گزارش‌ها: `features/reports` و workspaceهای گزارش
- resourceها: `EosParkingReactUi/src/locales/fa.ts`، `en.ts`
- route guard و permission: `Home.tsx`، `features/auth` و `features/home`

هر تغییر در Home، منو، route، گزارش یا قرارداد داشبورد باید ابتدا این سند را به‌روزرسانی کند و سپس کد و تست‌ها با آن تطبیق داده شوند.
