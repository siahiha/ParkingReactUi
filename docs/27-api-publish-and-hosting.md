# انتشار یک بستهٔ Release برای Windows Service و IIS

## ۱. وضعیت و محدوده

**رفتار فعلی پیاده‌سازی‌شده:** Publish پروژهٔ `EosParkingApiWindowsService` در ویژوال‌استودیو یک پوشهٔ کامل با دو ورودی اجرا تولید می‌کند: EXE برای Windows Service و DLL برای IIS. هر دو از همان سورس و با تنظیمات مشترک ساخته می‌شوند. این راهنما برای Backend است؛ ساخت UI React و پوشهٔ `dist` آن مستقل است.

منابع مستقیم: `Services/EosParkingApiWindowsService/EosParkingApiWindowsService.csproj`، `Hosting/DualHostPublish.targets`، `Hosting/Publish-Package.ps1` و `Hosting/README.md`. این تغییر به درخواست صریح کاربر شامل مسیر بسته‌سازی Backend شده است.

## اتصال مستقیم UI و رفع CORS تکراری — ۲۰۲۶/۱۱/۱۷

**تکمیل برای دوربین — ۲۰۲۶/۱۱/۱۹:** مسیر WHEP دوربین در handler مشترک اکنون PATCH و If-Match را می‌پذیرد و Location/Link/ETag/Accept-Patch را expose می‌کند. OPTIONS واقعی WHEP به gateway می‌رسد؛ preflight همچنان پیش از routing پاسخ می‌گیرد. هدرهای مستقل CORS کنترلر دوربین حذف شدند تا allowlist همان `UiOrigin` مرجع بماند. پس از ساخت بستهٔ Release در `obj/CameraCorsFix` و موفقیت آزمون‌های CORS و اتصال تجهیزات، فقط اسمبلی IIS با پشتیبان‌گیری در `obj/CameraCorsFix/InstalledBackup` و تطبیق نسخهٔ وابستگی‌های نصب تعویض شد. فایل maintenance حذف شده است. تست مستقیم Edge با API نصب‌شده برای دو دوربین واقعی، تصویر ۱۲۸۰×۷۲۰ و دریافت فریم بدون خطای reader را تأیید کرد؛ مشخصات اتصال و رمز دوربین تغییر نکردند. باینری Windows Service در حال اجرا تعویض نشد.

**رفتار پیاده‌شده:** UI محلی مستقیماً از `http://localhost:5173` به API روی `http://localhost:8050/` متصل می‌شود. `UiOrigin` باید مبدأ UI باشد، نه آدرس API؛ چند مبدأ دقیق با `;` جدا می‌شوند. پاسخ دارای cookie باید دقیقاً یک `Access-Control-Allow-Origin` با مبدأ مجاز و یک `Access-Control-Allow-Credentials: true` داشته باشد.

**علت خطای مشاهده‌شده:** middleware عمومی OWIN و `CustomHeaderHandler` هر دو روی `/api` هدر CORS اضافه می‌کردند. پاسخ GET واقعی دو مقدار یکسان Origin و Credentials داشت؛ preflight نیز در OWIN متوقف می‌شد و مجموعهٔ methodهای Web API را نداشت. HTTP 200 در این حالت برای مجازشدن پاسخ در مرورگر کافی نبود.

**اصلاح:** CORS در OWIN فقط به شاخهٔ `/signalr` محدود شده است. مسیرهای `/api`، از جمله OPTIONS قبل از routing و پاسخ 401، توسط handler مشترک وب‌API مدیریت می‌شوند. handler پیش از مقداردهی، هدرهای احتمالی فیلتر قدیمی را یکسان می‌کند و `Vary: Origin` را تکرار نمی‌کند. allowlist دقیق مبدأها و احراز هویت با cookie حفظ شده‌اند؛ wildcard اضافه نشده است.

**شواهد اجرا:** ساخت Release موفق بود. میزبان IIS نصب‌شده در پوشهٔ `publish/bin` با اصلاح جدید و referenceهای همان نصب کامپایل و جایگزین شد؛ فایل قبلی در پوشهٔ آماده‌سازی موقت پشتیبان دارد. روی پورت ۸۰۵۰، GET تنظیمات 200، OPTIONS گزارش 200، Export بدون cookie برابر 401 و negotiate ارتباط زنده 200 شدند؛ هر چهار پاسخ فقط یک Origin و یک Credentials داشتند. ورود با نشست کاربر و گردش کامل فرم‌ها در این بررسی انجام نشده است. فایل‌های تنظیم نصب و اسمبلی‌های وابستهٔ آن جایگزین نشدند؛ در Publish بعدی، سورس اصلاح‌شده برای هر دو میزبان مبناست.

## انتقال گزارش به API — ۲۰۲۶/۱۱/۱۷

**رفتار پیاده‌شده / نیاز انتشار:** نسخهٔ جدید UI به `Report/Prepare`، `Report/Viewer` و `Report/Export` نیاز دارد؛ API و UI باید با هم به‌روزرسانی شوند. پیش‌فرض، کنترل HTML5 وب Stimulsoft روی IIS است و PDF به‌صورت انتخابی باقی است. Core قالب‌ها را به‌صورت EmbeddedResource دارد؛ کپی پوشهٔ MRT کنار UI لازم نیست. DLLهای موتور از `ShareBinary/StimulSoft` خوانده می‌شوند و نسخهٔ فعلی آن‌ها `2018.2.2.0` است. لایسنس همان کلید .NET موجود در `ReportHelper` است؛ متغیر یا کلید مرورگری مورد نیاز نیست.

میزبان API reference صریح Copy Local به `Stimulsoft.Base/Controls/Data/Report/Report.Web/Map`، `Svg` و `LibExcel` دارد تا وابستگی‌های کامپایل قالب، export و کنترل وب در خروجی و manifest بسته قرار بگیرند. بسته‌ساز همان وابستگی‌های resolveشده را هم در ریشهٔ سرویس و هم در `bin` IIS قرار می‌دهد و `Hosting/Reports` را به `Reports` مقصد کپی می‌کند. صفحهٔ ویور از نوع ASP.NET است؛ تغییر پروژه به MVC یا افزودن مسیر تازه به Home React انجام نشده است.

قالب‌ها از فونت‌های Windows استفاده می‌کنند؛ فونت‌های واقعی قالب، دسترسی پردازش سرویس/Application Pool به فونت‌ها و امکان کامپایل C# و نوشتن در temp حساب اجرایی باید در محیط نصب موجود باشند. .NET موتور قدیمی از System.Drawing استفاده می‌کند و میزبانی آن در همین Windows است. نصب فونت یا تغییر دسترسی سیستم به‌صورت خودکار انجام نشده است.

نتیجهٔ آماده در حافظهٔ همان process حداکثر ۱۵ دقیقه می‌ماند؛ restart/recycle یا حذف به‌علت سقف حافظه، Export و دسترسی به ویور را 404 می‌کند و کاربر گزارش را دوباره می‌سازد. در اجرای چند instance، Prepare، Viewer، صفحه/درخواست‌های داخلی ویور و Export باید به همان instance برسند یا store مشترک پیاده شود. فایل‌ها و پاسخ‌ها با نشست معتبر دریافت می‌شوند؛ نباید پوشهٔ خصوصی DLL یا منبع MRT را به‌صورت فایل عمومی منتشر کرد.

**حدود تأیید فعلی:** build Release میزبان و build UI موفق‌اند؛ کاربر رفع خطای گزارش و موفقیت PDF را پس از تغییر Shadow Copy تأیید کرده است. کنترلر، میزبان IIS، DLL وب و فایل‌های ویور محلی با پشتیبان‌گیری نصب شده‌اند. گردش مرورگری Stimulsoft، چاپ، فونت و خروجی‌های آن هنوز تأیید عملی نشده‌اند. شواهد قدیمی بسته‌سازی در بخش ۸، آزمون تازهٔ ویور محسوب نمی‌شوند. قرارداد کامل در [سند ۰۸](08-reports.md) است.

## اعمال اصلاح عکس تردد و فشرده‌سازی — ۲۰۲۶/۱۱/۱۳

**رفتار پیاده‌شده / نیاز انتشار:** ثبت عکس تردد و سقف زیر ۲۰٬۰۰۰ بایت به نسخهٔ هماهنگ UI و API نیاز دارند. خروجی جدید UI ارسال DTO عکس و تبدیل WebP را دارد؛ بستهٔ جدید API باید وابستگی‌های به‌روز `EosParking.Core` و `EosParking.Data` شامل helper فشرده‌سازی و فراخوانی آن در هر دو مسیر ورود/خروج را داشته باشد. Build موفقِ این پروژه‌ها به‌تنهایی به‌معنای تعویض باینری سرویس یا IIS نصب‌شده نیست؛ بستهٔ کامل طبق همین راهنما منتشر و میزبان مربوطه با نسخهٔ جدید اجرا می‌شود.

این تغییر برای `TrafficDumpImages` migration جدید یا پاک‌سازی/تبدیل دسته‌ای سوابق ندارد. با مهاجرت جدول تصاویر **تشخیص** در بخش بعد اشتباه نشود؛ مجوز پاک‌سازی آن مهاجرت به عکس‌های تردد تعمیم ندارد. عکس‌های جدید پس از انتشار از سیاست فشرده‌سازی پیروی می‌کنند. پس از نصب، ثبت ورود و خروج با عکس تشخیص و با فریم دوربین همان جهت بررسی و قالب JPEG، اندازهٔ کمتر از ۲۰٬۰۰۰ بایت و ارتباط `TrafficDumpId` کنترل شود. اجرای این بررسی روی نصب واقعی در گزارش آزمون فعلی ادعا نشده است. قرارداد و منابع در بخش ۳.۵.۴ [سند فرم](12-manual-traffic-control-form.md) و شواهد ساخت/آزمون در [گزارش فشرده‌سازی](../../_verification/traffic-image-compression/result.json) قرار دارند.

## مهاجرت تصاویر تشخیص به جدول مستقل

**محدودهٔ مجاز / تغییر ۲۰۲۶/۱۱/۱۲:** این مهاجرت به درخواست صریح کاربر، رکوردهای
قدیمی `PlateDetectionRecord` را در همان سیستمِ در حال ارتقا یک بار پاک می‌کند؛
داده و عکس قبلی کپی نمی‌شوند. این رفتار مجوز پاک‌سازی کامل در کار عادی برنامه
نیست. نسخهٔ مرحله `20261112_PlateDetectionPictures_v1` در
`dbo.__ParkingSchemaMigrations` ثبت می‌شود؛ تاریخچهٔ مدل/ایندکس‌ها همچنان با EF6
مدیریت می‌شود. مرحلهٔ آماده‌سازی، فقط در حضور ستون‌های عکس قدیمی اجرا می‌شود و
شناسهٔ بعدی را بالاتر از high-water mark نگه می‌دارد. نصب تازه یا دیتابیسِ قبلاً
تفکیک‌شده پاک نمی‌شود. `spSelectPlate` نصب موجود برای این تغییر بازنویسی نمی‌شود.

1. پیش از استقرار، همهٔ نسخه‌های قدیمی API/IIS/Windows Service و نویسنده‌های
   تشخیص همان دیتابیس متوقف شوند؛ اجرای هم‌زمان مدل قدیمی و جدید پشتیبانی نمی‌شود.
2. بستهٔ کامل شامل Data، Controllers و API جدید نصب شود. اتصال باید مجوز مهاجرت
   schema، ساخت جدول/ایندکس و مرحلهٔ آماده‌سازی را داشته باشد.
3. یک میزبان API راه‌اندازی شود تا مرحلهٔ آماده‌سازی و مهاجرت EF کامل شوند؛ سپس
   میزبان‌ها و سرویس تشخیص مجاز دوباره راه‌اندازی شوند. وجود جدول عکس به‌تنهایی
   اثبات اتمام نیست؛ حذف ستون‌های عکس از metadata، FK اختیاری و ایندکس‌ها نیز
   بررسی شوند.
4. ثبت تشخیص بدون عکس و با عکس، انتخاب آن در نظارت، دریافت زنده و گرید تاریخچه
   بررسی شوند. پاک‌سازی عادی، فقط retention یک ماه را در دسته‌های محدود اجرا
   می‌کند. پاک‌کردن marker مهاجرت یا بازنشانی دستی Identity بخشی از نگهداری عادی نیست.

ساختار مخلوط یا FK ناشناخته به جدول قدیمی، مهاجرت پاک‌کننده را متوقف می‌کند و
نباید با حذف خودکار constraint جبران شود. بازگرداندن باینری قدیمی پس از ایجاد
دادهٔ جدید به برنامهٔ مستقل rollback نیاز دارد؛ مهاجرت معکوس خودکاری برای
برگرداندن عکس‌ها به ستون‌های قبلی تعریف نشده است.

اعتبارسنجی مستقل از دیتابیس فعال، از ریشهٔ workspace:

```powershell
powershell.exe -NoProfile -File Services/EosParkingApiWindowsService/Hosting/Tests/Verify-PlateDetectionStorage.ps1 -Rebuild -BuildDirectory Services/EosParkingApiWindowsService/obj/PlatePictureSplitVerifyBuild -ServiceConfigPath Services/EosParkingApiWindowsService/publish/web.config
```

runner فقط از تنظیم موجود برای اتصال به SQL استفاده می‌کند؛ همهٔ نوشتن‌ها در
دیتابیس‌های موقت با نام کنترل‌شده انجام و پس از آزمون همان‌ها حذف می‌شوند. این
فرمان، انتشار یا مهاجرت دیتابیس پیکربندی‌شده را انجام نمی‌دهد.

## ۲. تفاوت Release، Rebuild و Publish

| مورد | نتیجه در این پروژه |
|---|---|
| انتخاب Release | تنظیمات کامپایل بهینه را انتخاب می‌کند؛ به‌تنهایی بستهٔ نصب تولید نمی‌کند. |
| Build یا Rebuild | برنامه و وابستگی‌ها را کامپایل می‌کند؛ پوشهٔ `bin/Release` به‌تنهایی بستهٔ کامل IIS نیست. |
| Publish | ساخت لازم را انجام می‌دهد و EXE، DLL مخصوص IIS، وابستگی‌ها، Tools و تنظیمات را در یک پوشه جمع می‌کند. Rebuild جداگانه لازم نیست. |

**قاعدهٔ بستهٔ نهایی:** حتی اگر Debug در محیط انتخاب شده باشد، فایل‌های اجرایی اصلی بسته با **Release/AnyCPU** ساخته می‌شوند. خروجی خصوصی ساخت در `obj/DualHostRelease` است؛ پوشهٔ قابل انتقال همان مقصد نهایی Publish است.

## ۳. مراحل Publish از ویژوال‌استودیو

1. پس از تغییر فایل پروژه، آن را Reload کنید یا پروژه/solution را ببندید و دوباره باز کنید تا import جدید خوانده شود.
2. روی پروژهٔ `EosParkingApiWindowsService` راست‌کلیک و Publish را انتخاب کنید؛ Publish صفحهٔ Properties همان پروژه نیز قابل استفاده است.
3. در Publishing Folder Location یک پوشهٔ محلی یا UNC انتخاب کنید. مقصد پیش‌فرض `publish` کنار پروژه است. برای اولین انتشار، مقصد خالی باشد؛ بستهٔ تولیدشدهٔ قبلی را می‌توان دوباره منتشر کرد.
4. Publish را اجرا کنید و در Output منتظر پیام زیر بمانید:

```text
Parking API Release package published to: <selected-folder>
```

5. محتویات **کل همین پوشه** را برای نصب منتقل کنید. وجود `setup.exe` به‌تنهایی نشانهٔ ساخت بستهٔ IIS نیست؛ فایل‌های جدول بخش بعد باید وجود داشته باشند.

مقصد بسته به‌ترتیب از `DualHostPublishDir` صریح، `PublishUrl` انتخاب‌شده در IDE و در نبود هر دو، `publish` تعیین می‌شود. مسیر نسبی نسبت به پوشهٔ پروژه محاسبه می‌شود. `PublishDir` محل staging مربوط به ClickOnce است و مقصد بستهٔ اجرایی را تغییر نمی‌دهد. انتخاب HTTP/FTP برای مقصد این بسته پشتیبانی نمی‌شود.

## ۴. محتوای پوشهٔ خروجی

```text
publish/
├── EosParkingApiWindowsService.exe
├── EosParkingApiWindowsService.exe.config
├── web.config
├── Global.asax
├── appSettings.config
├── connectionStrings.config
├── .parking-dualhost-package
├── bin/
│   ├── EosParkingApiWindowsService.Iis.dll
│   └── dependencies...
├── Reports/
│   ├── Viewer.aspx
│   └── Localization/
│       ├── fa.xml
│       ├── en.xml
│       └── SOURCE.txt
├── Tools/
└── App_Data/
```

وابستگی‌های حالت سرویس کنار EXE ریشه نیز کپی می‌شوند. `RtspStreams` در صورت وجود دادهٔ قبلی حفظ می‌شود و می‌تواند در زمان اجرا ایجاد شود.

| بخش | کاربرد |
|---|---|
| EXE ریشه و وابستگی‌های کنار آن | ورودی نصب Windows Service |
| `bin/EosParkingApiWindowsService.Iis.dll` | ورودی کد API در IIS |
| `web.config` و `Global.asax` | راه‌اندازی میزبان IIS |
| `appSettings.config` و `connectionStrings.config` | تنظیمات مشترک هر دو روش اجرا |
| `.parking-dualhost-package` | نشانگر بستهٔ تولیدشده؛ انتشار مجدد آن را برای تشخیص مقصد می‌شناسد. |

صفحهٔ Publish پروژهٔ کلاسیک، فایل‌های سازگاری ClickOnce مانند `setup.exe`، `.application` و `Application Files` را هم منتقل می‌کند. این فایل‌ها ورودی نصب سرویس یا اجرای IIS نیستند و ممکن است به تنظیم Debug/Release خود IDE مربوط باشند؛ فایل‌های اصلی ریشه و `bin` بستهٔ Release هستند. دسترسی HTTP به فایل‌های خصوصی در `web.config` مسدود شده است.

## ۵. استفاده از همان بسته در دو میزبان

| روش اجرا | اقدام نصب | تنظیم آدرس و پیش‌نیاز |
|---|---|---|
| Windows Service | کل بسته را کپی و EXE ریشه را به‌عنوان سرویس نصب و Start کنید؛ نام ثبت‌شدهٔ سرویس `EosParkingApi` است. بازکردن عادی EXE، ویرایشگر تنظیمات موجود را اجرا می‌کند. | تنظیمات listener از جمله `ServiceBaseUrl`، `ServiceHttpPort` و `AnprSignalRAddress` از تنظیم سرویس خوانده می‌شوند. |
| IIS | کل بسته را کپی و Physical Path سایت/application را روی **ریشهٔ پوشه** قرار دهید، نه `bin`. | میزبان ASP.NET 4.x با pool از نوع Integrated، CLR v4.0 و `Enable 32-Bit Applications=False`؛ آدرس و پورت از Binding سایت می‌آیند. |

وابستگی‌های native موجود به فرایند ۶۴ بیتی نیاز دارند. تنظیمات اتصال دیتابیس و برنامه در دو فایل مشترک ویرایش می‌شوند. حساب اجرایی هر میزبان باید مجوزهای لازم دیتابیس/شبکه و نوشتن پوشه‌های runtime را داشته باشد. اجرای هم‌زمان Windows Service و IIS برای **یک نقش** مجاز نیست؛ اجرای split-role پشتیبانی می‌شود تا IIS مالک API/background workerها و Windows Service مالک اتصال تجهیزات باشد. قفل‌های مستقل در `App_Data` از مالکیت تکراری هر نقش جلوگیری می‌کنند.

### اجرای API روی IIS همراه Device Manager در Windows Service

برای این شیوه، هر دو میزبان از همان پوشهٔ package و تنظیمات مشترک استفاده کنند. در `appSettings.config` این مقادیر را تنظیم کنید:

```xml
<add key="EnableWindowsServiceApiHost" value="false" />
<add key="RunDeviceManager" value="true" />
<add key="RunDeviceManagerInIis" value="false" />
<add key="EnableBackgroundWorkers" value="false" />
<add key="EnableIisBackgroundWorkers" value="true" />
<add key="EnableDeviceEventRelay" value="true" />
<add key="DeviceEventApiUrl" value="https://parking.example/api/DeviceEvents/Ingest" />
<add key="DeviceEventSharedSecret" value="یک-راز-خصوصی-یکسان-در-هر-دو-میزبان" />
<add key="ProcessDeviceRecordsLocally" value="false" />
```

سرویس ویندوزی دستگاه‌ها را مدیریت و رویداد رکورد/QR، وضعیت اتصال تجهیزات و موفقیت فرمان راهبند را از outbox محلی به API IIS ارسال می‌کند؛ IIS رویدادهای رکورد/QR/فرمان را با `deviceEventReceived` و وضعیت‌ها را با `deviceStatusUpdated` به مشترکین مجاز `DeviceEventsHub` می‌رساند. در این حالت کلاینت فقط به API/SignalR IIS متصل می‌شود. `Enable<DeviceType>Devices` هم نوع تجهیزات تحت مدیریت Device Manager را جداگانه روشن/خاموش می‌کند. شرح جزئیات و قواعد retry در راهنمای [`EosParkingApiWindowsService/Hosting`](../../Services/EosParkingApiWindowsService/Hosting/README.md) است.

IIS همان `/signalr` را روی آدرس سایت میزبانی می‌کند؛ تنظیم listener سرویس، Binding سایت IIS را تعیین نمی‌کند. برای پلاکخوان، `EnableBackgroundWorkers=true` لازم است. در UI، `anprSignalRUrl` خالی از آدرس پایهٔ API به‌اضافهٔ `/signalr` استفاده می‌کند؛ listener مستقل Windows Service آدرس صریح خودش را لازم دارد. جزئیات نصب سرویس، pool و دسترسی‌ها در `Services/EosParkingApiWindowsService/Hosting/README.md` آمده‌اند.

## ۶. انتشار مجدد، تنظیمات و برگشت نسخه

**رفتار فعلی بسته‌ساز:** ابتدا بسته در پوشهٔ staging تازه کامل می‌شود. هنگام انتشار مجدد در یک مقصد شناخته‌شده:

- `appSettings.config` و `connectionStrings.config` موجود بدون تغییر محتوا حفظ می‌شوند؛ مقدار پیش‌فرض جدید خودکار با تنظیم نصب ادغام نمی‌شود. کلیدهای جدیدِ لازم را هنگام ارتقا بررسی و اضافه کنید.
- `web.config` از قالب `Hosting/Publish-Package.ps1` دوباره تولید و جایگزین فایل قبلی می‌شود. به درخواست کاربر، قالب زیر `system.web` مقدار `<hostingEnvironment shadowCopyBinAssemblies="false" />` را در انتشار اولیه و مجدد می‌نویسد؛ بنابراین مقدار قدیمی این گزینه در مقصد حفظ نمی‌شود. همین مقدار در `publish/web.config` نصب محلی هم درج شد.
- محتوای `App_Data` و `RtspStreams` حفظ می‌شود. این تضمین شامل هر فایل دلخواه دیگری در ریشه نیست؛ سایر فایل‌های لازم باید در قرارداد بسته‌سازی تعریف شوند.
- DLLها و کد قدیمی به بستهٔ جدید منتقل نمی‌شوند؛ وابستگی‌های ساخت جاری مبنا هستند.
- پوشهٔ قبلی به‌صورت `.نام‌مقصد.backup-GUID` کنار مقصد نگه داشته و مسیر آن در Output اعلام می‌شود. نسخه‌های پشتیبان را خصوصی نگه دارید و پس از پایان نیاز به rollback مدیریت کنید.

بسته‌ساز خودش Windows Service یا سایت IIS را Stop/Start نمی‌کند. برای نصب فعال، انتشار و تعویض نسخه را در زمان نگهداری و با توقف میزبان مربوط انجام دهید؛ قفل فایل‌ها می‌تواند انتشار را ناموفق کند. اگر ساخت بسته کامل نشود، موفقیت اعلام نمی‌شود؛ در شکست جابه‌جایی نهایی، چنانچه مقصد ایجاد نشده باشد، نسخهٔ قبلی به جای خود برگردانده می‌شود. برای rollback دستی نیز میزبان را متوقف و کل نسخهٔ پشتیبان را به مسیر اصلی برگردانید.

**اثر بارگذاری مستقیم:** با غیرفعال‌شدن Shadow Copy، اسمبلی‌ها مستقیم از `bin` بارگذاری و ممکن است هنگام اجرا قفل شوند؛ پیش از انتشار DLLهای جدید، برنامه/Application Pool مربوط را متوقف کنید. این تنظیم امضای DLL را اصلاح و فعال‌شدن لایسنس را تأیید نمی‌کند. تغییر قالب و کانفیگ محلی در ۲۰۲۶/۱۱/۱۷ انجام شد؛ Publish یا اجرای گزارش واقعی در این تغییر انجام نشده است. شواهد تشخیص تفاوت میزبان‌ها در [سند ۰۸](08-reports.md) آمده‌اند.

## ۷. کنترل نتیجه و رفع اشکال

**نمایشگر گزارش:** Publish علاوه بر موتور، `Stimulsoft.Report.Web.dll` و پوشهٔ `Reports` شامل `Viewer.aspx` و ترجمه‌های fa/en را اضافه می‌کند. پیش‌فرض UI، نمایشگر HTML5 داخل IIS است؛ PDF قابل انتخاب باقی می‌ماند. `UiOrigin` باید مبدأ واقعی UI باشد تا framing، POST و اعلان خطای ویور مجاز باشند. صفحهٔ بومی روی self-host سرویس ارائه نمی‌شود؛ مسیر PDF/Export همچنان کار می‌کند. قرارداد کامل در [سند ۰۸](08-reports.md) است.

| فایل مورد انتظار در بسته | کاربرد |
|---|---|
| `Reports/Viewer.aspx` | ورودی ASP.NET با base class داخل DLL میزبان IIS |
| `Reports/Localization/fa.xml` و `en.xml` | ترجمهٔ بومی با زبان ذخیره‌شدهٔ گزارش |
| `Reports/Localization/SOURCE.txt` | مخزن و revision ثابت منبع ترجمه‌ها |
| `bin/Stimulsoft.Report.Web.dll` | کنترل وب هم‌نسخه با موتور |
| `bin/EosParkingApiWindowsService.Iis.dll` و `bin/EosParking.Controllers.dll` | صفحهٔ میزبان، endpoint جدید و کنترل دسترسی؛ باید هماهنگ منتشر شوند |

| نشانهٔ مربوط به ویور | بررسی لازم |
|---|---|
| PDF کار می‌کند و Viewer برابر ۵۰۱ است | میزبان self-host است؛ PDF را انتخاب یا API را با بستهٔ کامل روی IIS میزبانی کنید |
| صفحهٔ Viewer.aspx پیدا نمی‌شود یا کلاس میزبان بارگذاری نمی‌شود | پوشهٔ Reports و DLL میزبان را از همان Publish، با مسیر application صحیح منتقل کنید |
| صفحهٔ ویور اجازهٔ نمایش در iframe ندارد یا callback رد می‌شود | `UiOrigin` دقیق، scheme/host/port UI و cookie نشست در قاب را بررسی کنید؛ توکن به URL اضافه نشود |
| گزارش قبلی پس از انتشار ۴۰۴ می‌دهد | نتایج حافظه با بارگذاری مجدد حذف شده‌اند؛ UI را تازه و گزارش را دوباره آماده کنید |
| تعویض DLL هنگام Publish خطای قفل دارد | به‌دلیل بارگذاری مستقیم bin، برنامه/Application Pool را برای تعویض فایل‌ها متوقف کنید؛ فایل app_offline موقت پس از نصب نباید باقی بماند |

| نشانه | بررسی لازم |
|---|---|
| فقط `setup.exe` و `Application Files` تازه شده‌اند | پروژه را Reload و import فایل `Hosting/DualHostPublish.targets` و پیام پایان بستهٔ Release را بررسی کنید. |
| چک‌این TFVC برای `useReportViewerOptions.ts` خطای Could not find file می‌دهد | فایل ویور مرورگری عمداً حذف شده بود ولی pending Edit باقی مانده بود؛ وضعیت همین فایل به Delete اصلاح شد. Pending Changes را Refresh کنید. ignore فایل‌های تولیدی، وضعیت یک فایل نسخه‌بندی‌شده را اصلاح نمی‌کند. |
| مقصد غیرفعال/نامعتبر یا غیرخالی و ناشناخته اعلام می‌شود | یک پوشهٔ خالی انتخاب کنید؛ برای مقصد قدیمی، ابتدا محتوای آن را حفظ کنید. فایل marker را برای دورزدن بررسی مقصد دستی نسازید. |
| خروجی در پوشهٔ دیگری دیده می‌شود | `DualHostPublishDir` صریح، سپس `PublishUrl` و تفاوت آن‌ها با `PublishDir` را بررسی کنید. |
| انتشار مجدد مقدار جدید App.config را نشان نمی‌دهد | تنظیمات نصب عمداً حفظ شده‌اند؛ دو فایل تنظیم مشترک مقصد را بررسی کنید. |
| IIS فایل‌های اجرا را پیدا نمی‌کند | Physical Path باید ریشهٔ بسته باشد؛ وجود `web.config`، `Global.asax` و DLL داخل `bin` را بررسی کنید. |
| SignalR عمومی پاسخ می‌دهد ولی پلاکخوان وصل نیست | وجود `shahabTrafficHub` در `/signalr/hubs` و موفقیت negotiate با `connectionData=[{"name":"shahabTrafficHub"}]` را بررسی کنید؛ negotiate عمومی وجود این هاب را ثابت نمی‌کند. |

## ۸. مسیر ساخت و حدود اعتبارسنجی

target استاندارد `Publish` بازنویسی نشده است. `PublishDualHostPackage` پس از `PublishOnly` در هر دو مسیر IDE و خط فرمان اجرا و ساخت جداگانهٔ Release را به `BuildDualHostPackage` واگذار می‌کند. Rebuild معمولی این مرحلهٔ بسته‌سازی را اجرا نمی‌کند.

**تأیید انجام‌شده:** `Hosting/Tests/Verify-VisualStudioPublish.ps1` با Windows PowerShell 5.1 و پروژهٔ کپی‌شده، Publish و republish واقعی IDE را در هر دو حالت Debug و Release آزموده است؛ بهینه‌سازی EXE/DLL، مقصد انتخابی، حفظ تنظیمات/داده‌ها و حذف DLL قدیمی بررسی شده‌اند. خروجی IDE با `Verify-Package.ps1` در هاست سرویس و IIS Express آزمایش شد؛ کشف Controller، مذاکرهٔ نام‌دار پلاکخوان، shutdown، مالکیت انحصاری نصب و فیلتر فایل‌های خصوصی موفق بودند.

در تست اجرا، workerها و دستگاه‌ها غیرفعال بودند؛ نصب سرویس در SCM، عملیات SQL نصب واقعی و تجهیزات واقعی در این نتیجه تأیید نشده‌اند. این حدود باید از موفقیت بسته‌سازی و تست میزبان جدا بمانند.
