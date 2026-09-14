# گزارش‌ها و خروجی‌ها

## محل دسترسی

گزارش‌ها از `DashboardForm` یا بخش گزارش‌های `MainForm` انتخاب می‌شوند و ابتدا filter panel مناسب نمایش داده می‌شود.

## گروه‌های گزارش

| گروه | Filter Panel یا قالب مرتبط |
|---|---|
| تردد | `TrafficFilterPanel`, `TrafficDetailsFilterPanel` |
| اعضا | `MembersFilterPanel`, `MembershipFilterPanel` |
| ثبت‌نام عضویت | `MemberRegisterHistoryFilterPanel` |
| گردش مالی اعضا | `MemberCashFilterPanel` |
| فعالیت کاربران | `UserFilterPanel` |
| درآمد | `IncomeFilterPanel` |
| باربری | `CargoDetailsFilterPanel` |

## شاخص‌های قابل مشاهده

- تعداد ورود و خروج
- درآمد در بازه‌های روزانه، ماهانه و سالانه
- مدت توقف
- اشغال و میانگین اشغال
- نسبت چرخش جای پارک
- جزئیات تردد با تصویر
- ثبت‌نام و درآمد اعضا
- فعالیت مالی کاربران
- ورود و خروج خودروهای باری

## فیلترهای عمومی

- تاریخ و ساعت شروع و پایان
- پارکینگ
- درب
- نوع تردد
- نوع خودرو
- عضو یا کاربر
- نمایش تصویر، در صورت پشتیبانی گزارش

## خروجی

- نمایش در صفحه
- چاپ
- قالب‌های گزارش موجود در `EosParkingTools/EosControls/ReportDesign`

## نیازمندی نسخه‌ی وب

- صفحه‌ی انتخاب گزارش
- filter schema قابل تنظیم برای هر گزارش
- نمایش loading، empty state و خطای گزارش
- جدول، کارت KPI و نمودار بر اساس نوع گزارش
- export و print با حفظ فیلترهای اعمال‌شده
