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

## وضعیت پیاده‌سازی منوی «مدیریت ورودها و خروج‌ها» در نسخه وب

**رفتار فعلی نسخه وب:**

- آیتم منو در مسیر `/home/parking/traffic-records` به `TrafficRecordsWorkspace` متصل است و دیگر به صفحهٔ read-only عمومی نمی‌رود.
- صفحه دقیقاً از دو بخش تشکیل می‌شود: بخش بالایی «ثبت تردد» و بخش پایینی «ریز تردد».
- بخش «ثبت تردد» در دو ردیف نمایش داده می‌شود: ردیف اول پلاک، شماره کارت و کد عضو؛ ردیف دوم نام درب، تاریخ و زمان ورود، تاریخ و زمان خروج و دکمه «ثبت». جستجوی پلاک/کارت/کد عضو برای تکمیل اطلاعات خودرو از `GetCarTrafficInfo` استفاده می‌کند.
- بخش «ریز تردد» بازهٔ زمانی، نوع منبع، درب و جستجوی محلی بر اساس پلاک/کد عضو/نام عضو را در اختیار کاربر می‌گذارد.
- Grid فشردهٔ تردد شامل کد عضویت، پلاک، عضو، زمان ورود، زمان خروج، وضعیت پرداخت، مبلغ و درب است و از فیلتر ستونی مشترک `AppDataGrid` استفاده می‌کند.
- عملیات موجود شامل نمایش/refresh، ثبت تردد دستی، ویرایش زمان ورود و خروج و حذف رکورد با تأیید کاربر است.
- ورودی پلاک از `IranianPlateInput` و تمام ورودی‌های تاریخ/زمان از `EosDateTimePicker` مشترک استفاده می‌کنند؛ مقدار پلاک پیش از submit با قرارداد نوع خودرو اعتبارسنجی می‌شود.
- عملیات ویرایش و حذف فقط برای رکورد انتخاب‌شده فعال می‌شوند. حذف بدون تأیید انجام نمی‌شود.
- حالت‌های loading، empty، error، unauthorized و success در scope صفحه نمایش داده می‌شوند.
- ثبت تردد دستی در UI مقدار نوع خودرو را مطابق مقدار پیش‌فرض فرم Windows (`Car`) ارسال می‌کند؛ انتخاب نوع خودرو و قرارداد کامل این فیلد نیازمند تأیید Backend/محصول است.

**وضعیت پوشش API:** APIها از نام operationهای موجود در `ManageTrafficRecordForm` استخراج و در client مصرف شده‌اند، اما قرارداد رسمی route، request/response، status code، مجوز و خطا از Controller/OpenAPI تأیید نشده است؛ بنابراین وضعیت این صفحه «API ناقص/نیازمند تأیید» است و اتصال production نهایی تلقی نمی‌شود.

| عملیات | endpoint مصرف‌شده در UI | وضعیت |
|---|---|---|
| دریافت ترددها | `POST api/traffic/GetAllTraffics` | نام endpoint مشخص؛ schema صفحه‌بندی و فیلترها نیازمند تأیید |
| ثبت تردد دستی | `GET api/traffic/CreateManualDump` | نام endpoint مشخص؛ استفاده از GET برای عملیات تغییردهنده و قرارداد نوع خودرو نیازمند تأیید |
| ویرایش رکورد | `POST api/traffic/Save` | نام endpoint مشخص؛ مدل کامل و مجوز قابل ویرایش نیازمند تأیید |
| حذف رکورد | `GET api/traffic/DeleteById?id={dumpId}` | نام endpoint مشخص؛ method، authorization، audit و محدودیت حذف نیازمند تأیید |

**منابع پیاده‌سازی:** `Persentation/EosParkingReactUi/src/components/management/TrafficRecordsWorkspace.tsx`، `Persentation/EosParkingReactUi/src/components/ParkingManagementWorkspace.tsx`، `Persentation/EosParkingReactUi/src/api/management.ts` و رفتار مرجع `EosParkingProfessional/EosForms/ManageTrafficRecordForm.cs`.
