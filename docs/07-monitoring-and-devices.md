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
هر ۳ ثانیه `GetLastMaxAnprId` را فراخوانی می‌کند. اگر شناسه‌ی آخر تغییر کرده باشد،
`GetAnprRecordWithPicTop20LastHour` دوباره فراخوانی شده و گرید با رکوردهای جدید merge
می‌شود. هنگام تغییر منبع، شمارنده و گرید reset شده و polling با منبع جدید ادامه پیدا
می‌کند؛ هنگام خروج component نیز timer متوقف می‌شود.
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
| آخرین رکوردهای دارای تصویر | `GET api/Anpr/GetAnprRecordWithPicTop20LastHour?isEosAnpr={bool}` | نام endpoint مشخص؛ schema تصویر/خطا/مجوز ناقص |
| تصویر رکورد انتخاب‌شده | `GET api/Anpr/GetAnprPicById?anprId={id}&isEosAnpr={bool}` | در UI به‌صورت lazy مصرف می‌شود؛ schema تصویر و خطا نیازمند تأیید |
| آخرین شناسه ANPR | `GET api/Anpr/GetLastMaxAnprId?isEosAnpr={bool}` | نام endpoint مشخص؛ نوع wrapper و خطا نیازمند تأیید |
| بررسی رکوردهای جدید | `GET api/Anpr/GetLastMaxAnprId?isEosAnpr={bool}` و در صورت تغییر `GET api/Anpr/GetAnprRecordWithPicTop20LastHour?isEosAnpr={bool}` | polling دوره‌ای ۳ ثانیه‌ای در UI |
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
