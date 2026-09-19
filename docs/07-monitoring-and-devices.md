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
پلاک، تصویر خودرو و تصویر پلاک را نمایش می‌دهد. دریافت رکوردها با polling سه‌ثانیه‌ای و
مقایسه با آخرین شناسه انجام می‌شود؛ هنگام خروج component، timer متوقف می‌شود. حذف تصاویر
قدیمی فقط پس از تأیید صریح کاربر انجام می‌شود و خطاهای 403 و خطاهای عمومی به وضعیت قابل
نمایش تبدیل می‌شوند.

**وضعیت پوشش API:** نام endpointهای مصرف‌شده از Windows source استخراج شده است، اما schema
رسمی DTO تصاویر، نوع دقیق `CarPic`/`PlatePic`، قرارداد خطا و مجوز حذف هنوز
**ناقص/نیازمند تأیید** است. UI پاسخ را در boundary به‌صورت untrusted نرمال می‌کند و در
صورت نبود تصویر، وضعیت «تصویر موجود نیست» نشان می‌دهد؛ اتصال مستقیم به دوربین یا حدس
زدن قرارداد stream در این صفحه انجام نشده است.

| عملیات | مسیر | وضعیت |
|---|---|---|
| آخرین رکوردهای دارای تصویر | `GET api/Anpr/GetAnprRecordWithPicTop20LastHour?isEosAnpr={bool}` | نام endpoint مشخص؛ schema تصویر/خطا/مجوز ناقص |
| آخرین شناسه ANPR | `GET api/Anpr/GetLastMaxAnprId?isEosAnpr={bool}` | نام endpoint مشخص؛ نوع wrapper و خطا نیازمند تأیید |
| حذف تصاویر قدیمی | `GET api/Anpr/DeleteOldAnprPics?isEosAnpr={bool}` | نام endpoint مشخص؛ retention، مجوز و اثر حذف نیازمند تأیید |
| پلاک‌های اعضا | `POST api/Member/GetAllMembersPlates` | نام endpoint مشخص؛ request/response رسمی نیازمند تأیید |
| درب‌های پارکینگ | `GET api/Parking/GetParkingDoors?parkingId={id}` | در UI موجود و endpoint مشخص؛ مدل کامل نیازمند تأیید |

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
