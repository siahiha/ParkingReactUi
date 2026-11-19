# استاندارد عمومی گزارش‌ها و خروجی‌ها

**وضعیت فعلی — ۲۰۲۶/۱۱/۱۷:** با درخواست صریح کاربر، ساخت و رندر گزارش‌های پنج workspace به API منتقل شد. فهرست گزارش‌ها و مسیرهای Home در [سند ۲۵، بخش ۷](25-home.md) مرجع هستند. این سند قرارداد مشترک آماده‌سازی، نمایش، خروجی و نگهداری را شرح می‌دهد.

## خلاصهٔ وضعیت فعلی

| موضوع | رفتار فعلی و میزان تأیید |
|---|---|
| آماده‌سازی | دریافت داده، قالب و رندر در API؛ React فیلتر می‌فرستد و شناسهٔ نتیجه می‌گیرد |
| نمایش پیش‌فرض | کنترل HTML5 `StiWebViewer` در صفحهٔ ASP.NET میزبانی‌شده در IIS |
| نمایش جایگزین | انتخاب دستی «نمایش PDF» با همان نتیجهٔ آماده و Export قبلی؛ بدون Prepare دوباره |
| نسخه و لایسنس | DLLهای محلی .NET نسخهٔ `2018.2.2.0` و کلید موجود در helper؛ Reports.JS و لایسنس مرورگر استفاده نمی‌شوند |
| نصب و انتشار | فایل‌های ویور روی IIS محلی اعمال و در قالب Publish ثبت شده‌اند؛ `shadowCopyBinAssemblies=false` در هر انتشار نوشته می‌شود |
| شواهد تأیید | کاربر رفع خطای گزارش و موفقیت مسیر PDF را پس از تغییر Shadow Copy تأیید کرد؛ ساخت UI/API موفق است؛ مرورگر، چاپ و خروجی ویور بومی تازه هنوز تأیید عملی نشده‌اند |

بخش تشخیص ۵۰۰ در ادامه، تاریخچهٔ علت‌یابی است؛ وضعیت نهایی همان تأیید مسیر PDF با تنظیم بارگذاری فعلی است. بررسی جداگانهٔ DLL رسمی، به‌معنی تغییر نسخه یا کلید نصب نیست.

## ۱. موتور، قالب و لایسنس

**رفتار پیاده‌شده:** API از DLLهای محلی `ShareBinary/StimulSoft` با نسخهٔ اسمبلی `2018.2.2.0` استفاده می‌کند. این فایل‌ها نسخهٔ ۲۰۲۳.۱ نیستند. `PreparedReportRenderer` همان `ReportHelper.GetReport` برنامهٔ ویندوزی را فراخوانی می‌کند؛ بنابراین کلید .NET موجود در helper مشترک اعمال می‌شود. کلید در این سند تکرار نمی‌شود و کلید JavaScript ارائه‌شدهٔ قبلی استفاده نمی‌شود. فایل `.env.local` دیگر تنظیم `VITE_STIMULSOFT_LICENSE` ندارد؛ نمونهٔ آن و وابستگی Reports.JS از UI حذف شدند؛ اسکریپت‌های HTML5 کنترل وب از DLL میزبان IIS ارائه می‌شوند.

سیزده قالب مورد استفاده به `Infrastructure/EosParking.Core/Reports/Templates` منتقل و با نام resource ثابت در اسمبلی Core جاسازی شده‌اند. منبع business object تکراری حذف و schema، expression و DataBand به جدول `DB.MainTable` یکسان متصل شده‌اند. جدول و رابطهٔ پیوست حمل بار حفظ شده‌اند. نام نوع خودرو در سرور آماده می‌شود. قالب، script، مسیر فایل و ردیف دلخواه از درخواست UI پذیرفته نمی‌شوند.

| کتابخانه یا لایه | نقش در مسیر فعلی |
|---|---|
| `Stimulsoft.Base.dll` | زیرساخت مشترک موتور و تنظیم کلید .NET |
| `Stimulsoft.Report.dll` | `StiReport`، رندر سند و خروجی؛ برای نمایش وب هم لازم است |
| `Stimulsoft.Report.Web.dll` | کنترل HTML5 `StiWebViewer` در صفحهٔ ASP.NET روی IIS |
| `Stimulsoft.Report.Mvc.dll` | فایل موجود در ShareBinary؛ در این اتصال صفحهٔ ASP.NET reference نشده و جایگزین موتور Report نیست |
| React | ارسال فیلتر، نگهداری مشخصات نتیجه و انتخاب قاب Stimulsoft/PDF؛ بدون اجرای موتور گزارش |

مسیر اجرا: workspace ← `usePreparedReport` ← `preparedReportApi` ← client مشترک ← `ReportController.Prepare` ← دریافت داده از actionهای موجود همان کنترلر ← قالب ثابت ← `Render(false)` ← سند آمادهٔ فشرده و PDF. ساخت گزارش و تبدیل خروجی داخل قفل مشترک موتور قدیمی انجام می‌شوند؛ فراخوانی پنجرهٔ WinForms یا وابستگی به `HttpContext`/MVC Viewer در این مسیر وجود ندارد.

**دامنه:** ۱۷ حالت در پنج خانوادهٔ اعضا، تردد، مالی، مدیریت و حمل بار پوشش داده شده‌اند. آیتم سابقهٔ عضویت در منو وجود دارد، اما طبق HomeFormRoutes هنوز workspace مستقل ندارد و مشمول ویورهای این سند نیست. endpointهای قدیمی دریافت داده برای مصرف‌کنندگان قبلی حفظ شده‌اند؛ کنترل مجوز این سند به Prepare/Export، دریافت مسیر ویور و تمام درخواست‌های نمایشگر وب مربوط است.

## ۲. قرارداد آماده‌سازی گزارش

**پوشش API: کامل از روی پیاده‌سازی؛ کاربر موفقیت مسیر PDF را پس از اصلاح Shadow Copy تأیید کرده است. گردش مرورگری ویور بومی تازه هنوز تأیید عملی نشده است.**

`POST api/Report/Prepare` با cookie نشست موجود و JSON زیر فراخوانی می‌شود:

```json
{
  "Kind": "traffic-details",
  "Language": "fa",
  "Parameters": {
    "Filters": {
      "ParkingId": 7,
      "StartDateTime": "2026-11-01T00:00:00",
      "EndDateTime": "2026-11-17T23:59:59",
      "Plate": "",
      "MemberCode": "",
      "CarType": null,
      "OnlyPresence": false,
      "WithImage": true
    }
  }
}
```

`Language` فقط `fa/en` است. schema هر Parameters با DTO فعلی منبع داده تطبیق دارد؛ درخواست جدید دادهٔ گزارش را برنمی‌گرداند.

| Kind | Parameters و منبع دادهٔ داخلی | مجوز `AccessReportItemTypes` |
|---|---|---|
| `members-all/active/inactive` | `PageFilterModel<BaseFilterModel>` به‌علاوهٔ `ParkingId` بیرونی؛ `GetMemberReport`؛ GridFilter اختیاری عنوان حق عضویت | `Members/ActiveMembers/DeactiveMembers` |
| `traffic-details` | `PageFilterModel<DumpFilterModel>`؛ `GetTrafficReport` | `IOCar` |
| `traffic-daily` | `PageFilterModel<TrafficStatisticFilterModel>`؛ `GetTrafficStatisticReport` | `DoorTrafficNumber` |
| `traffic-average` | Filters با `ParkingId` و تاریخ؛ `GetOccupedHourlyParkByParkingId` | `AverageParkTime` |
| `parking-income` | `PageFilterModel<TrafficStatisticFilterModel>`؛ `GetParkingDailyIncomingReport` | `Incomming` |
| `monthly-income/monthly-income-comparison` | همان page، با `ParkingIds`؛ `GetParkingMonthlyIncomingReport` | `MountlyIncommingCompair` |
| `income-comparison/yearly-income-comparison` | همان page، با `ParkingIds/SolarYears`؛ `GetParkingYearIncomingReport` | به‌ترتیب `Incomming/MountlyIncommingCompair` |
| `member-cash` | `PageFilterModel<ReportMemberFilterModel>`؛ `GetMemberCach` | `MemberTurnover` |
| `membership-income` | `ReportMemberFilterModel`؛ `GetMembershipIncomingDetails` | `MountlyIncommingCompair` |
| `user-performance/management-user-performance` | تاریخ شروع/پایان و `UserId` در ریشه؛ `GetUserActivity` | `UserFinancialCash` |
| `cargo` | `CargoFilterModel`، شامل `IsNeedAttachment`؛ `GetCargoIOReport` | `CargoIODetails` |
| `free-parking-income` | `PageFilterModel<ReportDumpParkingsFilterModels>` با `ListParkingId`؛ `GetIncomingDetailsReport` | `Incomming` |

API سقف صفحه را خودش روی ۱۰۰۰۰۱ قرار می‌دهد تا بیش از ۱۰۰۰۰۰ ردیف را با خطا رد کند؛ اندازهٔ صفحه، ترتیب و نام property دلخواه client مبنا نیستند. فیلترهای grid فقط در گزارش اعضا، برای شناسهٔ پارکینگ تحمیل‌شده توسط سرور و پیشوند عنوان حق عضویت بازسازی می‌شوند. فعال/غیرفعال‌بودن اعضا در سرور از `IsActive` واقعی فیلتر می‌شود. بازهٔ سال‌های مقایسه با `PersianCalendar` سرور محاسبه می‌شود؛ جستجوی قبلی سال در JavaScript حذف شد.

پاسخ موفق HTTP 200:

```json
{
  "ResponseResultType": 1,
  "Values": {
    "Id": "شناسهٔ تصادفی نتیجه",
    "Count": 42,
    "PageCount": 2,
    "ExpiresAt": "2026-11-17T09:30:00.0000000Z"
  }
}
```

`Count` تعداد ردیف اصلی پس از فیلتر است؛ تعداد پیوست‌ها جدا به آن افزوده نمی‌شود. صفر ردیف هم نتیجهٔ معتبر دارد. پاسخ حاوی DTOهای اعضا/تردد، کلید لایسنس یا قالب نیست.

## ۳. مجوز، خطا و نگهداری نتیجه

actionهای Prepare، Export و Viewer از `AthunticationFilter` موجود استفاده می‌کنند؛ صفحهٔ ویور نیز کنترل نشست را در هر درخواست تکرار می‌کند. کاربر فعال و غیرراننده باید بیت گزارش در `AccessPermissionPart2` را داشته باشد. مدیر دارای `DashbordManaging` در Part1، مطابق visibility فعلی Home به همهٔ گروه‌های گزارش دسترسی دارد؛ عنوان گروه مدیریتی مجوز اضافه‌ای بر بیت گزارش تحمیل نمی‌کند. پارکینگ دقیق مورد استفادهٔ query با همان قواعد موجود `CanReadParkingMap` بررسی می‌شود؛ تعویض `ParkingIds` با `ParkingId` در payload این کنترل را دور نمی‌زند. در گردش حساب عضو، تعلق کد عضو به پارکینگ درخواست‌شده نیز کنترل می‌شود. حساب ویژهٔ داخلی `long.MaxValue` همان استثنای موجود محصول را دارد.

**محدودهٔ رفتار فعلی:** گزارش کاربر و حمل بار از queryهای سراسری موجود خود استفاده می‌کنند؛ مجوز گزارش مبناست و پارکینگ تازه‌ای به query آن‌ها افزوده نشده است. `UserId=0` در هر دو گزارش عملکرد مالی به کاربر جاری برمی‌گردد؛ عنوان گزینهٔ مدیریتی نیز با این رفتار اصلاح شده است.

سند آماده و PDF فقط در حافظهٔ همان process نگهداری می‌شوند: عمر ثابت ۱۵ دقیقه، حداکثر چهار نتیجه برای هر کاربر و مجموعاً ۱۲۸MiB. سقف هر نتیجه ۶۴MiB و سقف پاسخ خروجی ۶۴MiB است. timer هر دقیقه موارد منقضی را خارج می‌کند؛ کمبود ظرفیت، قدیمی‌ترین نتیجه را کنار می‌گذارد. دو عملیات هم‌زمان پذیرفته می‌شوند و موتور قدیمی اجرای رندر/تبدیل را سری می‌کند. برای چند instance نیاز به چسبندگی نشست یا محل نگهداری مشترک است؛ restart/recycle نتیجه‌های موجود را از بین می‌برد.

| HTTP | معنی و اثر UI |
|---|---|
| 400 | نوع گزارش، فرمت یا فیلتر نامعتبر؛ اصلاح ورودی |
| 401 | نشست نامعتبر؛ ابطال نشست در client مشترک |
| 403 | نداشتن مجوز گزارش/پارکینگ؛ پیام دسترسی |
| 404 در Export | نتیجه منقضی، حذف‌شده یا متعلق به کاربر دیگر؛ نمایش دوبارهٔ گزارش لازم است |
| 413 | تعداد/حجم بیش از سقف؛ محدودکردن فیلترها |
| 429 | ظرفیت اجرای هم‌زمان پر است؛ تلاش مجدد |
| 500 | خطای دریافت داده یا موتور؛ پیام عمومی، بدون جزئیات داخلی |

پیش‌نمایش و خروجی `Cache-Control: no-store` دارند؛ شناسه به‌تنهایی مجوز دسترسی نیست. در Export مالک و مجوز فعلی دوباره بررسی می‌شوند.

### سابقهٔ تشخیص خطای ۵۰۰ و اصلاح بارگذاری — ۲۰۲۶/۱۱/۱۷

**وضعیت نهایی این رخداد:** کاربر پس از درج `shadowCopyBinAssemblies=false` موفقیت گزارش را تأیید کرد. لاگ‌ها، بررسی کلید و محدودیت‌های زیر مربوط به مراحل پیش از این تأیید هستند؛ تأیید مسیر PDF به‌معنی تأیید ویور بومیِ اضافه‌شده پس از آن نیست.

**رفتار پیاده‌شده:** خطای غیرمنتظرهٔ Prepare/Export اکنون در پاسخ فقط پیام عمومی و `ErrorId` دارد. `ReportErrorLog` همان شناسه، نوع گزارش، مرحلهٔ `validate/authorize/data/render/store` یا فرمت export و exception پالایش‌شده را در فایل خصوصی `App_Data/report-errors.log` ثبت می‌کند؛ payload، cookie، ردیف گزارش و لایسنس عمداً ثبت نمی‌شوند و رشته‌های شبیه credential از متن exception حذف می‌شوند. پس از عبور فایل از ۲MiB، یک نسخهٔ قبلی نگهداری و فایل جاری از نو آغاز می‌شود. حساب میزبان باید روی App_Data دسترسی نوشتن داشته باشد؛ شکست ثبت فایل، پاسخ اصلی را خراب نمی‌کند. جزئیات خطای منبع دادهٔ قدیمی فقط برای همین ثبت خصوصی حفظ می‌شود و به مرورگر برنمی‌گردد.

**شواهد ثبت‌شده:** اجرای گزارش اعضا با `Kind=members-all` در IIS در مرحلهٔ `render` با `FileLoadException` هنگام بارگذاری `Stimulsoft.Report, Version=2018.2.2.0` شکست خورد. پس از اصلاح پالایش log، دو اجرای بعدی پیام صریح `Strong name signature could not be verified` و کد `0x80131045` را ثبت کردند؛ بنابراین شکست بررسی امضا علت تأییدشدهٔ خطای ثبت‌شده در آن مرحله بود. بررسی مستقل با `sn.exe -vf` امضای strong-name فایل‌های `Stimulsoft.Base.dll` و `Stimulsoft.Report.dll` نصب‌شده را نامعتبر تشخیص داد؛ فایل Report در نصب و ShareBinary یکسان است. موفقیت رندر مستقیم خارج از IIS با همین فایل‌ها، تأیید قابلیت بارگذاری آن‌ها در IIS نیست. پالایش log اصلاح شد تا `PublicKeyToken` اسمبلی اشتباهاً به‌عنوان credential حذف نشود.

**بازتولید تفاوت Windows و ASP.NET، به درخواست بررسی کاربر:** SHA-256 هر دو DLL Base و Report در ShareBinary، خروجی Debug و Release کلاینت Windows و `publish/bin` یکسان است؛ نسخهٔ همه `2018.2.2.0` است. وجود همان کلید `ReportHelper` در Core کامپایل‌شدهٔ هر سه خروجی نیز بدون چاپ مقدار کلید تأیید شد. در فرایندهای موقت ۶۴ بیتی و Full Trust، نتایج زیر ثبت شدند:

| شرایط بارگذاری | نتیجه |
|---|---|
| فرایند عادی دسکتاپ، بدون Shadow Copy | DLL فعلی بارگذاری و `StiReport` ساخته شد |
| AppDomain مستقل، `ShadowCopyFiles=false` | همان نتیجهٔ موفق، هم در SingleDomain و هم MultiDomainHost |
| همان AppDomain با `ShadowCopyFiles=true` | Controls معتبر از cache بارگذاری شد؛ Report فعلی با `0x80131045` رد شد؛ نوع LoaderOptimization نتیجه را تغییر نداد |
| میزبان موقت `ApplicationHost.CreateApplicationHost` با تنظیمات معمول ASP.NET | `IsHosted=true`، `ShadowCopyFiles=true` و بارگذاری Controls از Temporary ASP.NET Files؛ Report فعلی با همان خطای IIS رد شد |
| فرایند موقت دسکتاپ با الزام بررسی امضا (`bypassTrustedAppStrongNames=false` فقط در config همان برنامهٔ تشخیصی) | Report فعلی با `Strong name validation failed` و کد `0x8013141A` رد شد |
| همان میزبان موقت ASP.NET با جفت رسمی Base و Report هم‌نسخه | با Shadow Copy فعال، بارگذاری و ساخت `StiReport` موفق شد؛ این مورد تأیید فعال‌شدن لایسنس یا رندر نیست |

**تفسیر مبتنی بر شواهد:** عامل تعیین‌کنندهٔ بازتولید، Shadow Copy بود؛ این مکانیزم DLLها را برای جلوگیری از قفل‌شدن فایل اصلی به cache می‌برد. در این مسیر، فایل دارای امضای نامعتبر رد می‌شود؛ اجرای عادی Full Trust می‌تواند از بررسی امضا عبور کند. پیش‌فرض `shadowCopyBinAssemblies` در ASP.NET برابر true است و web.config نصب هنگام تشخیص اولیه، override برای آن نداشت. [مرجع Shadow Copy](https://learn.microsoft.com/en-us/dotnet/framework/app-domains/shadow-copy-assemblies)، [پیش‌فرض ASP.NET](https://learn.microsoft.com/en-us/dotnet/api/system.web.configuration.hostingenvironmentsection.shadowcopybinassemblies?view=netframework-4.8.1) و [شرایط عبور Full Trust از بررسی امضا](https://learn.microsoft.com/en-us/dotnet/standard/assembly/create-use-strong-named).

**حدود بررسی:** بازتولید در میزبان موقت ASP.NET و AppDomainهای مستقل انجام شد؛ دسترسی مستقیم به پیکربندی مدیریتی IIS اصلی از حساب فعلی رد شد و خصوصیات AppDomain پردازش w3wp مستقیماً خوانده نشدند. انتساب تفاوت IIS به Shadow Copy بر لاگ واقعی، تنظیمات قابل‌خواندن نصب و بازتولید کنترل‌شدهٔ فوق استوار است. IIS اصلی، رجیستری، DLLهای نصب‌شده، تنظیمات کلاینت Windows و لایسنس در این بررسی تغییر نکردند. SQL و دستگاه واقعی فراخوانی نشدند. موفقیت Windows و خطای IIS با یک DLL و یک کلید سازگارند؛ خطای بارگذاری پیش از اجرای خط تنظیم لایسنس رخ می‌دهد و به‌تنهایی نامعتبر بودن لایسنس کاربر را اثبات نمی‌کند.

**بررسی جداگانهٔ جایگزینی SDK رسمی (اعمال نشد):** دو DLL رسمی از [بستهٔ Stimulsoft.Reports.Net نسخهٔ ۲۰۱۸.۲.۲ در NuGet](https://www.nuget.org/packages/Stimulsoft.Reports.Net/2018.2.2) فقط در پوشهٔ موقت بررسی شدند؛ نسخه و هویت اسمبلی یکسان و امضای هر دو معتبر است. با این جفت رسمی، مسیر فعلی `ReportHelper` پیش از رندر با پیام `The license key is not valid` متوقف می‌شود. این مشاهده دربارهٔ سازگاری کلید با جفت رسمی بود؛ خطای بارگذاری نصب با تغییر Shadow Copy دنبال و سپس موفقیت PDF توسط کاربر تأیید شد. DLL رسمی روی نصب یا ShareBinary جایگزین نشده است. راه استقرار پایدار، کتابخانهٔ رسمیِ سازگار همراه کلید پذیرفته‌شدهٔ همان محصول است؛ غیرفعال‌کردن کنترل امضا راه‌حل استقرار نیست. مقدار هیچ کلیدی در این مستند ثبت نمی‌شود.

**بررسی کلید ارسالی کاربر:** کلید ارائه‌شده برای نسخهٔ ۲۰۲۳.۱ با کلید داخل کد Windows متفاوت است. فراخوانی رسمی `StiLicense.Key` در فرایند تشخیصی موقت، این کلید را هم با نسخهٔ ۲۰۱۸.۲.۲ و هم با موتور رسمی [Stimulsoft.Reports.Engine نسخهٔ ۲۰۲۳.۱.۱](https://www.nuget.org/packages/Stimulsoft.Reports.Engine/2023.1.1) با پیام نامعتبر بودن کلید رد کرد. این نتیجه فقط پذیرش‌نشدن این رشته در کتابخانه‌های بررسی‌شده را اثبات می‌کند؛ دربارهٔ حساب یا مالکیت لایسنس داوری نمی‌کند. در مرحلهٔ بررسی جفت رسمی، فایل اصلی یا کلید معتبر محصول .NET درخواست شده بود؛ نصب فعلی با همان DLL و کلید قبلی و تغییر Shadow Copy ادامه یافت. نسخهٔ SDK نصب‌شده، target framework و کلید کد Windows در این بررسی تغییر نکردند؛ هیچ تست خودکار اضافه یا اجرا نشد.

**اصلاح کانفیگ به درخواست کاربر — ۲۰۲۶/۱۱/۱۷:** پس از بررسی بالا، مقدار `<hostingEnvironment shadowCopyBinAssemblies="false" />` زیر `system.web` در قالب Publish و `publish/web.config` محلی درج شد. هر Publish، web.config جدید را جایگزین نسخهٔ قبلی می‌کند و این مقدار را دوباره می‌نویسد. این تغییر تنظیم بارگذاری بود؛ DLL و کلید تعویض نشدند. پس از اعمال آن، کاربر موفقیت گزارش PDF را تأیید کرد؛ ویور بومی در مرحلهٔ بعد اضافه شد. با بارگذاری مستقیم، تعویض DLLها باید با توقف برنامه/Application Pool انجام شود؛ قرارداد انتشار در [سند ۲۷](27-api-publish-and-hosting.md) ثبت شده است.

## ۴. دریافت فایل، نمایش، چاپ و زبان

### نمایش پیش‌فرض Stimulsoft و مسیر PDF — ۲۰۲۶/۱۱/۱۷

**درخواست محصول / رفتار پیاده‌شده:** کاربر موفقیت گزارش PDF پس از تغییر Shadow Copy را تأیید کرد و سپس حفظ مسیر PDF و پیش‌فرض‌شدن ویور Stimulsoft را خواست. `PreparedReportViewer` اکنون دو گزینهٔ «نمایشگر Stimulsoft» و «نمایش PDF» دارد؛ حالت آغازین و هر شناسهٔ گزارش جدید Stimulsoft است. جابه‌جایی نمایشگر، Prepare یا query دادهٔ گزارش را تکرار نمی‌کند. مسیر PDF و Export قبلی در `PreparedPdfReportViewer` حفظ شده‌اند.

| مسیر | درخواست و پاسخ | کنترل و اثر UI |
|---|---|---|
| `GET api/Report/Viewer?id=<Id>` | cookie نشست؛ ۲۰۰ با envelope فعلی و `Values.Path` شامل مسیر صفحهٔ ویور همان برنامهٔ IIS | مالک، انقضا و مجوز فعلی؛ ۴۰۱/۴۰۳/۴۰۴ مطابق Export؛ در self-host بدون HttpContext مقدار ۵۰۱ و امکان انتخاب PDF |
| `GET/POST Reports/Viewer.aspx?id=<Id>` | HTML و درخواست‌های داخلی کنترل `StiWebViewer` از `Stimulsoft.Report.Web.dll` محلی | نشست، مالک، انقضا و مجوز در **هر درخواست** بررسی می‌شوند؛ Id مجوز نیست و کلید نشست به URL اضافه نمی‌شود |

نمونهٔ پاسخ موفق `Viewer`، با درنظرگرفتن مسیر application در IIS:

```json
{
  "ResponseResultType": 1,
  "Values": {
    "Path": "/Reports/Viewer.aspx?id=0123456789abcdef0123456789abcdef"
  }
}
```

این مسیر با مبدأ `apiBaseUrl` resolve می‌شود؛ پاسخ دارای مبدأ متفاوت یا پروتکل غیر HTTP/HTTPS در React رد می‌شود. در نصب زیرمسیر، Path شامل همان زیرمسیر است. درخواست iframe نشست را با cookie موجود می‌فرستد؛ کلید لایسنس یا UserToken به query اضافه نمی‌شود. آماده‌سازی نتیجه باید در همان instance انجام شده باشد که صفحهٔ ویور را میزبانی می‌کند.

`PreparedReportViewerPage` در IIS سند فشردهٔ آماده را با `LoadPackedDocument` می‌خواند؛ قالب، ردیف‌های خام و لایسنس به React منتقل نمی‌شوند. کنترل HTML5 داخل iframe از HTML/JavaScript همان SDK وب استفاده می‌کند؛ وابستگی Reports.JS یا کلید مرورگر به UI اضافه نشده است. ویور وب از قابلیت صفحه‌بندی، زوم، جستجو، چاپ و خروجی خود نسخهٔ ۲۰۱۸ استفاده می‌کند. Open/Design/Parameters/Resources و عملیات تغییر گزارش، ایمیل، اتصال داده و کدگیری مجاز نیستند؛ Refresh همان سند آماده را دوباره می‌خواند.

Cache مستقل SDK غیرفعال است تا انقضا و مالکیت همان `PreparedReportStore` مرجع بماند. عملیات سنگین ویور از سقف دو درخواست مشترک استفاده می‌کنند؛ سند هر درخواست در پایان آزاد می‌شود. POST باید از مبدأ خود API یا `UiOrigin` باشد. HTML با no-store، nosniff، referrer-policy و frame-ancestors محدود به خود میزبان و مبدأ UI برمی‌گردد. خطای صفحه با status عمومی و پیام postMessage به UI اعلام می‌شود؛ UI مبدأ، پنجره و شناسه را بررسی می‌کند و جزئیات exception نمایش داده نمی‌شود.

ترجمه‌های `fa/en` از [مخزن رسمی Stimulsoft، revision ثابت](https://github.com/stimulsoft/Stimulsoft.Reports.Localization/tree/5e6ed985282eb1bcc702311dcd093be349affc4e) در `Hosting/Reports/Localization` قرار دارند. زبانِ ذخیره‌شده هنگام Prepare مبناست. فایل‌های صفحه/ترجمه و DLL وب در Publish بسته‌بندی می‌شوند؛ Windows Service همچنان Prepare/Export را دارد و صفحهٔ بومی ویور به IIS نیاز دارد.

**شواهد و محدودیت:** ساخت TypeScript/Vite و Release API و ساخت هدفمند میزبان IIS موفق‌اند؛ تست تازه‌ای اجرا یا اضافه نشده است. تأیید کاربر مربوط به مسیر PDF قبلی است؛ نمایش مرورگری، چاپ، خروجی و زبان ویور بومی در محیط کاربر هنوز تأیید عملی نشده‌اند. HTTP ۵۰۱ یا خطای ویور، حالت را خودکار به PDF تغییر نمی‌دهد؛ گزینهٔ PDF همیشه در دسترس است.

**نصب محلی:** کنترلر، میزبان IIS، DLL وب و فایل‌های صفحه/ترجمه با پشتیبان‌گیری روی نصب `publish` اعمال شدند؛ توقف موقت با `app_offline.htm` فقط برای آزادشدن DLLها بود و فایل نگهداری پس از نصب حذف شد. باینری‌های سایر وابستگی‌ها و کلید دست‌نخورده‌اند. بارگذاری مجدد میزبان، نتایج حافظهٔ قبلی را حذف می‌کند؛ UI باید تازه و گزارش دوباره آماده شود. جهت کنترل‌های ویور از زبان گزارش می‌آید و صفحهٔ خطای داخلی SDK نمایش داده نمی‌شود.

### جریان کاربر و حالت‌های نمایشگر

| حالت یا عملیات | رفتار فعلی |
|---|---|
| آغاز نمایش نتیجه | `ReportPreview` نتیجه را در `AppPopup` تمام‌صفحه با عنوان، تعداد رکورد و بستن باز می‌کند؛ آغاز mount و تغییر `report.Id`، حالت Stimulsoft را انتخاب می‌کند |
| دریافت مسیر ویور | spinner و متن انتظار تا دریافت مسیر و بارگذاری iframe؛ `onLoad` پایان انتظار قاب است و تأیید آماده‌شدن محتوای داخلی SDK محسوب نمی‌شود |
| انتخاب PDF یا Stimulsoft | نمای قبلی unmount و نمای انتخاب‌شده با همان Id ساخته می‌شود؛ لغو دریافت قاب/فایل، نتیجهٔ سمت سرور را حذف نمی‌کند؛ انتخاب در state محلی است و تنظیم دائمی کاربر نیست |
| بستن و بازکردن دوباره | فیلتر و نتیجه در workspace حفظ می‌شوند؛ بازکردن دوباره از همان نتیجه استفاده می‌کند، مادامی که منقضی/حذف نشده باشد |
| تلاش مجدد | دریافت مسیر ویور یا فایل PDF را با همان Id تکرار می‌کند؛ گزارش تازه تولید نمی‌کند |
| تغییر زبان UI | برچسب‌های پوسته از زبان UI می‌آیند؛ متن/ترجمهٔ ویور بومی از زبان ذخیره‌شده هنگام Prepare است؛ برای نتیجه با زبان جدید، نمایش گزارش دوباره اجرا می‌شود |
| ۴۰۱ یا ۴۰۳ | نیاز به ورود یا نداشتن دسترسی؛ پیام عمومی از resource فارسی/انگلیسی؛ endpoint مشترک همچنان سیاست نشست خود را دارد |
| ۴۰۴، انقضا یا recycle | تلاش مجدد با همان Id نتیجه را بازنمی‌گرداند؛ کاربر باید از فرم گزارش، نتیجهٔ تازه بسازد |
| ۴۲۹ | ظرفیت عملیات مشترک پر است؛ تلاش مجدد پس از پایان درخواست‌های دیگر |
| ۵۰۱ یا خطای ویور بومی | پیام خطا و تلاش مجدد؛ انتخاب PDF در دسترس می‌ماند؛ تغییر خودکار نمایشگر وجود ندارد |

صفحهٔ ASP.NET فقط GET/POST را می‌پذیرد؛ روش دیگر ۴۰۵ و مبدأ غیرمجاز POST یا نداشتن مجوز ۴۰۳ است. اعلان خطای iframe شامل `type=parking-report-viewer-error`، `reportId` و `status` است. UI علاوه بر `event.origin`، برابری `event.source` با iframe همان صفحه و تطبیق Id را کنترل می‌کند. این کانال، مسیر انتقال گزارش یا کلید نیست. خطاهای غیرمنتظرهٔ صفحه در log خصوصی با مرحلهٔ `viewer-display` و خطای دریافت مسیر با `viewer-access` ثبت می‌شوند.

### دریافت فایل و نمایش PDF

`GET api/Report/Export?id=<Id>&format=pdf` فایل آماده را برمی‌گرداند. فرمت‌های allowlist فعلی: `pdf/xlsx/docx/csv/xls/rtf/txt/ods/odt/pptx/xml/html/mht/svg/png/jpeg/tiff/dbf/dif/sylk/xps`. PDF از نتیجهٔ آماده دریافت می‌شود؛ بقیه با بارگذاری سند فشردهٔ آماده تبدیل می‌شوند و query یا Render دوباره ندارند. تنظیمات خروجی، پیش‌فرض موتور ۲۰۱۸ و تمام صفحات است؛ پنجرهٔ قدیمی تنظیمات اختصاصی هر فرمت وجود ندارد. قالب تصویر و چیدمان خروجی تابع export همان نسخه هستند.

فهرست و تنظیمات بالا قرارداد endpoint Export و نمای PDF است. در نمای بومی، ابزارها و پنجرهٔ تنظیمات خروجی از کنترل وب نسخهٔ ۲۰۱۸ می‌آیند و تبدیل در میزبان API انجام می‌شود؛ برابری همهٔ گزینه‌ها و خروجی‌ها با WinForms ادعا نشده است.

`apiRequest` گزینهٔ `responseType: blob` دارد و نشست، cookie، cancellation و timeout را حفظ می‌کند. timeout عملیات گزارش ۱۲۰ ثانیه است. درخواست لغوشده یا نتیجهٔ مربوط به scope قبلی وارد state نمی‌شود. لغو HTTP در مرورگر الزاماً query یا Render شروع‌شده در سرور را متوقف نمی‌کند.

`ReportPreview` با `AppPopup` تمام‌صفحه، سربرگ ثابت و شمارش رکورد باز می‌شود. فیلترها پس از بستن حفظ می‌شوند؛ «نمایش دوباره» تا وقتی workspace mount است همان Id را باز می‌کند. بازکردن مجدد ممکن است PDF آماده را دوباره دریافت کند ولی گزارش تازه‌ای نمی‌سازد. تغییر فیلتر یا زبان به‌تنهایی گزارش قبلی را بازسازی نمی‌کند؛ دکمهٔ نمایش، snapshot جدیدی می‌سازد. تغییر پارکینگ/نوع گزارش یا unmount درخواست قبلی را لغو و نتیجهٔ محلی را پاک می‌کند.

`PreparedPdfReportViewer` در حالت انتخابی PDF، فایل آماده را در iframe با blob URL نمایش می‌دهد. ابزارهای دریافت فایل، چاپ، بازکردن فایل، تعداد صفحه و خطا از i18next فارسی/انگلیسی می‌آیند. دانلود با لینک تحت مالکیت React انجام و blob URL در lifecycle آزاد می‌شود. iframe این مسیر، HTML دلخواه یا template client را اجرا نمی‌کند. چاپ از نمایشگر PDF مرورگر استفاده می‌کند؛ برای مرورگری که PDF را در iframe نمایش/چاپ نمی‌کند، «بازکردن فایل» و دریافت PDF مسیر جایگزین‌اند. صفحه‌بندی، بزرگ‌نمایی، جستجو و پنجرهٔ چاپ داخلی PDF به قابلیت‌ها و زبان مرورگر وابسته‌اند؛ ترجمهٔ مستقل نوار داخلی PDF یا ترجمهٔ عناوین فارسی MRT ادعا نمی‌شود.

## ۵. نکات حفظ رفتار و موارد باز

- شرط تجاری‌بودن پارکینگ در منو/route همچنان در [بخش ۶ سند Home](25-home.md) مرجع است؛ کنترل مجوز سمت API جایگزین این شرط UI نیست.
- تصاویر تردد از `EnterImage` ردیف اصلی در سرور به `MainTable.EnterImage` متصل‌اند؛ `WithImage=false` قالب بدون تصویر را انتخاب می‌کند. عکس خالی باید خانهٔ خالی داشته باشد.
- پیوست حمل بار با `CargoId` به `AttachmentTable` مرتبط است؛ دریافت آن تابع `IsNeedAttachment` است.
- مقایسهٔ کلی درآمد همچنان query سالانه با قالب ماهانهٔ موجود دارد. گزارش مالی کاربران مدیریتی اکنون قالب دفتر مالی `UserCashReport` دارد؛ اتصال قبلی دادهٔ Cash به نمودار آمار ماهانه سازگار نبود.
- endpointهای دادهٔ فعلی، حدود روز و قواعد مالی خود را حفظ کرده‌اند؛ این تغییر ممیزی مجدد محاسبات مالی یا بازنویسی queryها نیست.
- build UI و Release میزبان API موفق بوده‌اند و کاربر رفع خطای قبلی و موفقیت مسیر PDF را پس از تغییر Shadow Copy تأیید کرده است. فعال‌شدن کلید با DLL رسمی جایگزین، کارکرد مرورگری ویور بومی، فونت، چاپ و فرمت‌های خروجی آن هنوز تأیید نشده‌اند. بررسی امضای DLL و پذیرش‌نشدن کلید با جفت رسمی، شواهد تاریخی جداگانه‌اند؛ DLL/کلید نصب با آن‌ها تعویض نشده است. تست خودکار جدیدی اضافه یا اجرا نشده است؛ fixtureهای موجود نیز تأیید محتوای PDF یا SDK وب محسوب نمی‌شوند.
- برای استقرار، API و UI باید هماهنگ منتشر شوند؛ پیش‌نیازهای DLL، فونت و میزبان در [سند ۲۷](27-api-publish-and-hosting.md) ثبت شده‌اند.

**منابع:** `ReportController.Prepared.cs`، `ReportController.Viewer.cs`، `Reports/PreparedReportStore.cs`، `Reports/ReportErrorLog.cs`، `PreparedReportRenderer.cs`، `ReportHelper.cs`، resourceهای Core، `Hosting/PreparedReportViewerPage.cs`، `Hosting/Reports/Viewer.aspx`، `Hosting/Reports/Localization/SOURCE.txt`، `Hosting/Publish-Package.ps1`، پنج workspace گزارش، `usePreparedReport.ts`، `preparedReportApi.ts`، `PreparedReportViewer.tsx`، `PreparedPdfReportViewer.tsx`، `ReportPreview.tsx` و `reportPreview.css`.
