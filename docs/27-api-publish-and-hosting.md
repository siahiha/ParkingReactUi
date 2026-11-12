# انتشار یک بستهٔ Release برای Windows Service و IIS

## ۱. وضعیت و محدوده

**رفتار فعلی پیاده‌سازی‌شده:** Publish پروژهٔ `EosParkingApiWindowsService` در ویژوال‌استودیو یک پوشهٔ کامل با دو ورودی اجرا تولید می‌کند: EXE برای Windows Service و DLL برای IIS. هر دو از همان سورس و با تنظیمات مشترک ساخته می‌شوند. این راهنما برای Backend است؛ ساخت UI React و پوشهٔ `dist` آن مستقل است.

منابع مستقیم: `Services/EosParkingApiWindowsService/EosParkingApiWindowsService.csproj`، `Hosting/DualHostPublish.targets`، `Hosting/Publish-Package.ps1` و `Hosting/README.md`. این تغییر به درخواست صریح کاربر شامل مسیر بسته‌سازی Backend شده است.

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

وابستگی‌های native موجود به فرایند ۶۴ بیتی نیاز دارند. تنظیمات اتصال دیتابیس و برنامه در دو فایل مشترک ویرایش می‌شوند. حساب اجرایی هر میزبان باید مجوزهای لازم دیتابیس/شبکه و نوشتن پوشه‌های runtime را داشته باشد. در هر نصب یک میزبان مالک کارهای پس‌زمینه و تجهیزات باشد؛ اجرای هم‌زمان دو نسخه برای یک نصب روش استفاده از این بسته نیست.

IIS همان `/signalr` را روی آدرس سایت میزبانی می‌کند؛ تنظیم listener سرویس، Binding سایت IIS را تعیین نمی‌کند. برای شهاب، `EnableBackgroundWorkers=true` لازم است. در UI، `anprSignalRUrl` خالی از آدرس پایهٔ API به‌اضافهٔ `/signalr` استفاده می‌کند؛ listener مستقل Windows Service آدرس صریح خودش را لازم دارد. جزئیات نصب سرویس، pool و دسترسی‌ها در `Services/EosParkingApiWindowsService/Hosting/README.md` آمده‌اند.

## ۶. انتشار مجدد، تنظیمات و برگشت نسخه

**رفتار فعلی بسته‌ساز:** ابتدا بسته در پوشهٔ staging تازه کامل می‌شود. هنگام انتشار مجدد در یک مقصد شناخته‌شده:

- `appSettings.config` و `connectionStrings.config` موجود بدون تغییر محتوا حفظ می‌شوند؛ مقدار پیش‌فرض جدید خودکار با تنظیم نصب ادغام نمی‌شود. کلیدهای جدیدِ لازم را هنگام ارتقا بررسی و اضافه کنید.
- محتوای `App_Data` و `RtspStreams` حفظ می‌شود. این تضمین شامل هر فایل دلخواه دیگری در ریشه نیست؛ سایر فایل‌های لازم باید در قرارداد بسته‌سازی تعریف شوند.
- DLLها و کد قدیمی به بستهٔ جدید منتقل نمی‌شوند؛ وابستگی‌های ساخت جاری مبنا هستند.
- پوشهٔ قبلی به‌صورت `.نام‌مقصد.backup-GUID` کنار مقصد نگه داشته و مسیر آن در Output اعلام می‌شود. نسخه‌های پشتیبان را خصوصی نگه دارید و پس از پایان نیاز به rollback مدیریت کنید.

بسته‌ساز خودش Windows Service یا سایت IIS را Stop/Start نمی‌کند. برای نصب فعال، انتشار و تعویض نسخه را در زمان نگهداری و با توقف میزبان مربوط انجام دهید؛ قفل فایل‌ها می‌تواند انتشار را ناموفق کند. اگر ساخت بسته کامل نشود، موفقیت اعلام نمی‌شود؛ در شکست جابه‌جایی نهایی، چنانچه مقصد ایجاد نشده باشد، نسخهٔ قبلی به جای خود برگردانده می‌شود. برای rollback دستی نیز میزبان را متوقف و کل نسخهٔ پشتیبان را به مسیر اصلی برگردانید.

## ۷. کنترل نتیجه و رفع اشکال

| نشانه | بررسی لازم |
|---|---|
| فقط `setup.exe` و `Application Files` تازه شده‌اند | پروژه را Reload و import فایل `Hosting/DualHostPublish.targets` و پیام پایان بستهٔ Release را بررسی کنید. |
| مقصد غیرفعال/نامعتبر یا غیرخالی و ناشناخته اعلام می‌شود | یک پوشهٔ خالی انتخاب کنید؛ برای مقصد قدیمی، ابتدا محتوای آن را حفظ کنید. فایل marker را برای دورزدن بررسی مقصد دستی نسازید. |
| خروجی در پوشهٔ دیگری دیده می‌شود | `DualHostPublishDir` صریح، سپس `PublishUrl` و تفاوت آن‌ها با `PublishDir` را بررسی کنید. |
| انتشار مجدد مقدار جدید App.config را نشان نمی‌دهد | تنظیمات نصب عمداً حفظ شده‌اند؛ دو فایل تنظیم مشترک مقصد را بررسی کنید. |
| IIS فایل‌های اجرا را پیدا نمی‌کند | Physical Path باید ریشهٔ بسته باشد؛ وجود `web.config`، `Global.asax` و DLL داخل `bin` را بررسی کنید. |
| SignalR عمومی پاسخ می‌دهد ولی شهاب وصل نیست | وجود `shahabTrafficHub` در `/signalr/hubs` و موفقیت negotiate با `connectionData=[{"name":"shahabTrafficHub"}]` را بررسی کنید؛ negotiate عمومی وجود این هاب را ثابت نمی‌کند. |

## ۸. مسیر ساخت و حدود اعتبارسنجی

target استاندارد `Publish` بازنویسی نشده است. `PublishDualHostPackage` پس از `PublishOnly` در هر دو مسیر IDE و خط فرمان اجرا و ساخت جداگانهٔ Release را به `BuildDualHostPackage` واگذار می‌کند. Rebuild معمولی این مرحلهٔ بسته‌سازی را اجرا نمی‌کند.

**تأیید انجام‌شده:** `Hosting/Tests/Verify-VisualStudioPublish.ps1` با Windows PowerShell 5.1 و پروژهٔ کپی‌شده، Publish و republish واقعی IDE را در هر دو حالت Debug و Release آزموده است؛ بهینه‌سازی EXE/DLL، مقصد انتخابی، حفظ تنظیمات/داده‌ها و حذف DLL قدیمی بررسی شده‌اند. خروجی IDE با `Verify-Package.ps1` در هاست سرویس و IIS Express آزمایش شد؛ کشف Controller، مذاکرهٔ نام‌دار شهاب، shutdown، مالکیت انحصاری نصب و فیلتر فایل‌های خصوصی موفق بودند.

در تست اجرا، workerها و دستگاه‌ها غیرفعال بودند؛ نصب سرویس در SCM، عملیات SQL نصب واقعی و تجهیزات واقعی در این نتیجه تأیید نشده‌اند. این حدود باید از موفقیت بسته‌سازی و تست میزبان جدا بمانند.
