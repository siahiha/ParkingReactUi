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
