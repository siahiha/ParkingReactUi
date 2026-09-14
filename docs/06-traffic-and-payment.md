# تردد، پرداخت و کنترل ورود و خروج

## فرم‌ها

- `ManualTrafficControlForm`
- `ManageTrafficRecordForm`
- `PayForm`
- `ExitPermissionForm`
- `PlateDetectedList`
- `NewCargoForm`

## جریان ورود

```text
پلاک/کارت/کد عضو → شناسایی خودرو → بررسی عضویت و وضعیت → انتخاب تعرفه و درب → ثبت ورود
```

## جریان خروج

```text
پلاک/کارت/QR/قبض → بازیابی تردد → محاسبه هزینه → پرداخت → مجوز خروج → ثبت خروج
```

## ManualTrafficControlForm

- نمایش ترددهای درب جاری
- ورود دستی یا مبتنی بر پلاک و کارت
- پیشنهاد پلاک‌های مشابه
- بررسی عضو پارکینگ
- دریافت اطلاعات تعرفه و تجهیزات
- ثبت رکورد ورود
- دریافت اعتبار عضو
- ثبت خروج و پرداخت
- دریافت قبض از QR
- کنترل درب و چاپ قبض

## ManageTrafficRecordForm

- جستجوی تردد در بازه‌ی زمانی
- فیلتر بر اساس منبع، درب و خودرو
- مشاهده‌ی جزئیات رکورد
- ایجاد تردد دستی
- ویرایش و حذف رکورد

## PayForm و ExitPermissionForm

- انتخاب نوع پرداخت
- ارسال اطلاعات تراکنش در صورت وجود
- ثبت نتیجه‌ی پرداخت
- بررسی و ثبت مجوز خروج

## APIهای مشاهده‌شده

- `TrafficApi.CreateEnterDump`
- `TrafficApi.DoExitDump`
- `TrafficApi.GetTrafficBill`
- `TrafficApi.PayDump`
- `TrafficApi.GetTraffics`
- `TrafficApi.GetAllTraffics`
- `TrafficApi.GetCarTrafficInfo`
- `TrafficApi.GetMemberCurrentCreditInfo`
- `TrafficApi.CreateManualDump`
- `TrafficApi.Save`
- `TrafficApi.DeleteById`
- `TrafficApi.GetPermissions`
- `TrafficApi.TrafficDumpUpdatePermission`
- `MemberApi.IsParkingMember`
- `ParkingApi.FindSimilarPlate`

## نیازمندی نسخه‌ی وب

- طراحی workflow با وضعیت‌های واضح: در انتظار شناسایی، آماده‌ی ثبت، ثبت‌شده، قابل پرداخت، پرداخت‌شده، خروج‌شده، خطادار
- جلوگیری از ثبت تکراری با نمایش وضعیت آخرین عملیات
- ثبت audit برای عملیات حساس
- نمایش جداگانه‌ی خطای دستگاه، خطای API و خطای کسب‌وکار
- امکان بازبینی قبل از حذف یا اصلاح رکورد
