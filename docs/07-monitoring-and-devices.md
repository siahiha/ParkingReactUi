# مانیتورینگ و تجهیزات

## فرم‌ها و اجزا

- `MonitoringForm`
- `MonitoringAnprForm`
- `EquipmentForm`
- `EosIpCamView`
- کنترل‌های دستگاه داخل `ManualTrafficControlForm`

## MonitoringForm

- نمایش ترددهای زنده
- فیلتر بر اساس نوع تردد، درب و تعداد رکورد
- نمایش وضعیت زنده‌ی درب‌ها و پارکینگ
- به‌روزرسانی دوره‌ای اطلاعات

## MonitoringAnprForm

### ذخیره‌سازی اختیاری تصاویر تشخیص — ۲۰۲۶/۱۱/۱۲

**تصمیم محصول / پیاده‌سازی در سورس:** درخواست صریح کاربر در این قابلیت شامل مدل و
مهاجرت Backend نیز است. ادغام با `ANPR/AnprPics` انجام نمی‌شود. اطلاعات تشخیص در
`dbo.PlateDetectionRecord` و تصاویر در `dbo.PlateDetectionRecordPic` قرار می‌گیرند.

| جدول | داده و رابطه |
|---|---|
| `PlateDetectionRecord` | شناسهٔ Identity، پلاک، دوربین، ROI، confidence، `PersistOn` و اطلاعات پایه؛ فاقد `CarImage/PlateImage` |
| `PlateDetectionRecordPic` | کلید `PlateDetectionRecordId` هم PK و هم FK به تشخیص؛ دو ستون nullable برای `CarImage/PlateImage`؛ حذف وابسته به حذف تشخیص |

هر تشخیص **صفر یا یک** رکورد عکس دارد. نبود کامل ردیف عکس، یا نبود یکی از دو عکس،
معتبر است؛ عکس‌های null/آرایهٔ خالی در ورودی، به‌تنهایی ردیف عکس ایجاد نمی‌کنند.
ذخیرهٔ graph تشخیص و عکسِ موجود با یک `SaveChanges` و تراکنش EF انجام می‌شود.
قرارداد ورودی `PlateDetectionRecordDto` و خروجی `AnprWithPics` حفظ شده است.
`GetAnprPicById` برای تشخیص موجودِ بدون عکس، همان متادیتا با تصاویر null برمی‌گرداند؛
برای شناسهٔ ناموجود نتیجه null است. گرید، رخداد زنده و تاریخچه، تشخیص بدون عکس را
حفظ می‌کنند و نمایشگر عکس حالت «تصویر موجود نیست» دارد. در نسخهٔ Windows نیز
`ByteArrayToImage` ورودی null/خالی را به null تبدیل می‌کند؛ این سازگاری از کد بررسی
شده و اجرای GUI ویندوز بخشی از آزمون این تغییر نیست.

ایندکس‌های مدل EF عبارت‌اند از `IX_PlateDetectionRecord_CameraTime` روی
`(CameraId, PersistOn, Id)` و `IX_PlateDetectionRecord_Time` روی `(PersistOn, Id)`؛
PK جدول عکس جستجوی عکس با شناسهٔ تشخیص را پوشش می‌دهد. تصاویر وارد این ایندکس‌ها
نمی‌شوند. فهرست یک ساعت ابتدا فقط متادیتا را می‌خواند، قانون تکرار ۱۵۰ ثانیه‌ای
فعلی را اعمال و ۲۰ نتیجه را انتخاب می‌کند؛ تصاویر فقط برای همان نتایج خوانده
می‌شوند. مسیر `GetHistory` کنترل تردد نیز صرفاً متادیتا است. `GetPicture` آن Hub
با تشخیص منبع فعال پروسیجر، برای منبع جدید از جدول عکس جدید و برای منبع قدیمی از
`AnprPics` می‌خواند؛ نبود عکس null است و محدودیت دوربین مجاز حفظ می‌شود.

**پاک‌سازی عادی:** سیاست یک ماهِ مسیر `isEosAnpr=true` حفظ شده، اما حذف در دسته‌های
۱۰۰تایی و تراکنش‌های جداگانه، با cutoff ثابت مبتنی بر ساعت SQL Server انجام می‌شود.
عکس‌های وابسته با FK حذف می‌شوند؛ تشخیص بدون عکس نیز حذف‌پذیر است. این مسیر هرگز
`TRUNCATE` یا حذف بدون شرط زمانی اجرا نمی‌کند. رفتار مسیر قدیمی `ANPR/AnprPics`
در این تغییر بازنویسی نشده است.

**مهاجرت یک‌باره:** `PlateDetectionPictureMigration` پیش از مهاجرت خودکار EF6 اجرا
می‌شود و مرحلهٔ `20261112_PlateDetectionPictures_v1` را در
`dbo.__ParkingSchemaMigrations` ثبت می‌کند. تنها وقتی مرحله قبلاً ثبت نشده و جدول
قدیمی هنوز ستون عکس دارد، همان جدول یک بار خالی می‌شود؛ تصاویر قبلی کپی نمی‌شوند.
شناسهٔ بعدی بالاتر از high-water mark قبلی تنظیم می‌شود تا cursorهای زنده عقب
نروند. سپس EF ستون‌های قدیمی را حذف و جدول اختیاری عکس/ایندکس‌ها را ایجاد می‌کند.
نصب جدید از مدل تازه ساخته می‌شود؛ دیتابیسِ از قبل تفکیک‌شده، اجرای مجدد برنامه و
اجرای دوبارهٔ مهاجرت، دادهٔ جدید را پاک نمی‌کنند. ساختار مخلوط (وجود هم‌زمان جدول
عکس و ستون‌های قدیمی) یا FK ناشناخته به جدول قدیمی، مهاجرت پاک‌کننده را متوقف
می‌کند. مرحلهٔ آماده‌سازی با تراکنش و قفل نسخهٔ مهاجرت محافظت می‌شود؛ شکست آن
بدون ثبت مرحله/پاک‌سازی ناقص rollback می‌شود. استقرار باید با توقف نویسنده‌های
قدیمی انجام شود؛ مراحل در [سند انتشار](27-api-publish-and-hosting.md) آمده است.

**منابع و آزمون:** entityها، DTO و repository در `EosParking.Data` و متدهای
`ReadHistory/ReadPicture` در `ShahabTrafficStore`؛
`Hosting/Tests/PlateDetectionStorageChecks.cs` مهاجرت واقعی EF/SQL، اجرای مجدد،
نصب تازه، حفظ شناسه، نبود/نقص عکس، retention و کنترل دوربین را روی دیتابیس‌های
موقت بررسی می‌کند. `Verify-PlateDetectionStorage.ps1` ساخت مستقل و اجرای قابل
تکرار آن را فراهم می‌کند؛ تنظیم اتصال در حافظه خوانده می‌شود و عملیات نوشتن فقط
روی دیتابیس‌های موقت `EosPlatePicChecks_<guid>` است. استقرار و سنجش سرعت حذف روی
دیتابیس مشتری هنوز انجام نشده‌اند.

### قابلیت‌ها

- نمایش رکوردهای اخیر تشخیص پلاک
- نمایش تصویر پلاک
- انتخاب منبع ANPR
- انتخاب درب
- دریافت فهرست پلاک‌های اعضا
- حذف تصاویر قدیمی

### وضعیت پیاده‌سازی نسخه وب

**رفتار فعلی نسخه وب:** آیتم `anpr-monitoring` در مسیر داخلی `/home/parking/anpr-monitoring`
به `AnprMonitoringWorkspace` متصل است. صفحه منبع ANPR، درب، رکوردهای اخیر، وضعیت عضو بودن
پلاک، تصویر خودرو و تصویر پلاک را نمایش می‌دهد. گرید رکوردها حتی در حالت خالی نیز رندر
می‌شود و فقط پیام empty در کنار/زیر گرید نمایش داده می‌شود. پس از بارگذاری اولیه، صفحه
پس از بارگذاری اولیه، UI دیگر به‌صورت دوره‌ای به دیتابیس/API درخواست نمی‌فرستد. سرویس
Windows API یک `AnprPollingService` دارد که برای هر دو منبع پلاکخوان و الموصنعت، هر ۱ ثانیه
متدهای repository متناظر با `GetLastMaxAnprId` و `GetLastMaxEosAnprId` را بررسی می‌کند؛ با تغییر شناسه، رکوردهای جدید را
با `GetAnprPicById` می‌خواند و از طریق SignalR به گروه همان منبع می‌فرستد. UI فقط یک
snapshot اولیه از `GetAnprRecordWithPicTop20LastHour` می‌گیرد و سپس از Hub مسیر
`/signalr`، متد `anprDetected` را دریافت می‌کند. هنگام تغییر منبع، عضویت SignalR بین
گروه‌های منبع جابه‌جا می‌شود و در صورت قطع اتصال، کلاینت تلاش مجدد می‌کند.
حذف تصاویر قدیمی فقط پس از تأیید صریح کاربر انجام می‌شود و خطاهای 403 و خطاهای عمومی به
وضعیت قابل نمایش تبدیل می‌شوند. پس از انتخاب درب، تجهیزات متصل به آن درب از API خوانده
می‌شوند؛ دوربین‌های فعال با `CameraStreamPreview`، اتصال WebRTC/HLS و تصویر زنده نمایش داده
می‌شوند و با خروج یا تغییر درب اتصال آن‌ها آزاد می‌شود. پاسخ‌های دیررسِ بارگذاری دوربین
پس از تغییر درب نادیده گرفته می‌شوند و اگر فقط بخشی از APIهای تجهیزات شکست بخورد، خطا
به‌صورت قابل نمایش باقی می‌ماند و دوربین‌های قابل استخراج همچنان نمایش داده می‌شوند.
با انتخاب یک رکورد، تصویر خودرو و تصویر پلاک در صورت نبودن در فهرست اولیه به‌صورت lazy از
`GetAnprPicById` دریافت می‌شوند و در صورت نبود تصویر، وضعیت «تصویر موجود نیست» نمایش داده
می‌شود.

**وضعیت پوشش API:** نام endpointهای مصرف‌شده از Windows source استخراج شده است، اما schema
رسمی DTO تصاویر، نوع دقیق `CarPic`/`PlatePic`، قرارداد خطا و مجوز حذف هنوز
**ناقص/نیازمند تأیید** است. UI پاسخ را در boundary به‌صورت untrusted نرمال می‌کند و در
صورت نبود تصویر، وضعیت «تصویر موجود نیست» نشان می‌دهد. نگاشت نهایی دوربین به درب و
قرارداد رسمی `GetParkingDoor`/`GetParkingDoorDevices` نیز نیازمند تأیید Backend است؛
پخش stream از قرارداد عمومی RTSP/WebRTC/HLS مستندشده در سند ۲۴ استفاده می‌کند.

| عملیات | مسیر | وضعیت |
|---|---|---|
| آخرین تشخیص‌ها با تصویر اختیاری | `GET api/Anpr/GetAnprRecordWithPicTop20LastHour?isEosAnpr={bool}` | مدل `AnprWithPics` در سورس Backend بررسی شده؛ نبود ردیف عکس تشخیص را حذف نمی‌کند؛ مجوز/خطاهای عمومی همچنان نیازمند تکمیل قراردادند |
| تصویر رکورد انتخاب‌شده | `GET api/Anpr/GetAnprPicById?anprId={id}&isEosAnpr={bool}` | در UI به‌صورت lazy مصرف می‌شود؛ schema تصویر و خطا نیازمند تأیید |
| آخرین شناسه ANPR | `GET api/Anpr/GetLastMaxAnprId?isEosAnpr={bool}` | endpoint قدیمی برای سازگاری؛ بررسی زنده اکنون داخل سرویس SignalR انجام می‌شود |
| دریافت زنده رکوردهای جدید | SignalR `/signalr`, Hub `anprHub`, client event `anprDetected` | Poller سمت سرویس هر ۱ ثانیه شناسه را بررسی و جزئیات را با `GetAnprPicById` منتشر می‌کند |
| حذف تصاویر قدیمی | `GET api/Anpr/DeleteOldAnprPics?isEosAnpr={bool}` | نام endpoint مشخص؛ retention، مجوز و اثر حذف نیازمند تأیید |
| پلاک‌های اعضا | `POST api/Member/GetAllMembersPlates` | نام endpoint مشخص؛ request/response رسمی نیازمند تأیید |
| درب‌های پارکینگ | `GET api/Parking/GetParkingDoors?parkingId={id}` | در UI موجود و endpoint مشخص؛ مدل کامل نیازمند تأیید |
| جزئیات درب | `GET api/Parking/GetParkingDoor?doorId={id}` | نام endpoint مشخص از Windows source؛ schema `DtoViewEquipments` نیازمند تأیید |
| تجهیزات درب | `GET api/Parking/GetParkingDoorDevices?doorId={id}` | نام endpoint مشخص از Windows source؛ مدل ارتباط دوربین و درب نیازمند تأیید |
| اطلاعات تجهیزات پارکینگ | `GET api/Parking/GetParkingEquipments?parkingId={id}` | endpoint مصرف‌شده برای تکمیل مشخصات دوربین؛ schema رسمی نیازمند تأیید |
| اتصال و تصویر دوربین | `POST api/rtspcamera/connect` و `GET api/rtspcamera/status` | پیاده‌سازی مشترک UI موجود؛ قرارداد Backend و دسترسی runtime نیازمند تأیید |

**جمع‌بندی این snapshot:** منوی تشخیص پلاک از نظر route و workflow اصلی UI در کد فعلی
پیاده‌سازی شده است؛ این وضعیت به‌معنی تأیید قرارداد رسمی Backend، کیفیت داده‌ی تصویر،
نگاشت قطعی دوربین به درب یا آماده‌بودن عملیاتی stream نیست.

**تست‌های regression نسخه وب:** رندر صفحه، بارگذاری رکورد اخیر و lazy image در
`AnprMonitoringWorkspace.render.test.tsx` پوشش داده شده‌اند. چرخه‌ی خروج هنگام اتصال
دوربین نیز در `CameraStreamPreview.test.tsx` بررسی می‌شود تا اگر اتصال پس از unmount
تکمیل شد، session آزاد شود.

## قرارداد فعلی نمایش خطاهای زنده در وب

طبق قانون مشترک [استاندارد مستندسازی](00-documentation-standard.md)، خطای دریافت خودکار درب‌ها در عنوان «درب‌های پارکینگ» و خطای ترددهای زنده در عنوان «ترددها» به‌صورت `ConnectionStatusIndicator` با Tooltip هاور/فوکوس نمایش داده می‌شود؛ Alert متنی ندارد. دو state مستقل‌اند و موفقیت ترددها خطای درب‌ها را پاک نمی‌کند. در `AnprMonitoringWorkspace`، خطای SignalR فقط در سربرگ مانیتورینگ است؛ پس از subscribe موفق یا دریافت معتبر رفع می‌شود و موفقیت اتصال، خطای مستقل بارگذاری/حذف را پاک نمی‌کند. در `CameraStreamPreview`، جزئیات خطای پخش در Tooltip نشانگر کنار نام دوربین قرار دارند و با کیبورد نیز قابل خواندن‌اند. خطاهای فرم تجهیزات، حذف، تصویر یک رکورد و دریافت اولیهٔ مستقل از ارتباط زنده، feedback عملیاتی خود را حفظ می‌کنند. منابع: `MonitoringWorkspace.tsx`، `AnprMonitoringWorkspace.tsx`، `anprRealtime.ts` و `CameraStreamPreview.tsx`.

## EquipmentForm

- مشاهده‌ی تجهیزات پارکینگ
- ایجاد، ویرایش و حذف تجهیز
- اتصال تجهیز به پارکینگ یا درب
- بررسی ارتباط با تجهیزات
- نمایش اطلاعات دوربین یا دستگاه

## APIهای مشاهده‌شده

- `TrafficApi.GetMonitoringTraffics`
- `ParkingApi.GetParkingDoorsLive`
- `AnprApi.GetAnprRecordWithPicTop20LastHour`
- `AnprApi.GetAnprPicById`
- `AnprApi.GetLastMaxAnprId`
- `AnprApi.DeleteOldAnprPics`
- `ParkingApi.GetParkingDoorDevices`
- `ParkingApi.GetParkingEquipments`

## نیازمندی نسخه‌ی وب

- صفحه‌ی مانیتورینگ با کارت‌های وضعیت و feed زنده
- نمایش last update و وضعیت اتصال
- نمایش degraded/offline برای تجهیزاتی که پاسخ نمی‌دهند
- امکان drill-down از رکورد تردد به تصویر، درب و جزئیات خودرو
- مدیریت حجم و زمان نگهداری تصاویر ANPR
