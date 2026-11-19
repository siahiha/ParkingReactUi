# فهرست فشرده و مسیر بارگذاری مستندات

این فایل برای انتخاب حداقل مستندات لازم در هر کار است. ابتدا این فایل و
`00-documentation-standard.md` را بخوانید؛ سپس فقط حوزه‌ی مرتبط و منابع مستقیم آن
را بارگذاری کنید. خواندن کل پوشه‌ی `docs` برای یک feature لازم نیست.

## قواعد مشترک

| موضوع | منبع اصلی | چه زمانی بارگذاری شود |
|---|---|---|
| تفکیک واقعیت، پیشنهاد و ابهام؛ قرارداد API؛ قواعد React | `00-documentation-standard.md` | همیشه |
| معماری کلی و تصمیم‌های تحویل | `16-final-review-and-delivery-gates.md`، `17-react-ui-architecture.md` | تغییر معماری یا تحویل |
| طراحی بصری، RTL، responsive و accessibility | `18-ui-design-system.md` | تغییر UI مشترک یا feature جدید |
| تست و regression | `20-ai-testing-standard.md`، `21-implementation-progress-and-regression-policy.md` | تغییر کد یا تست |
| Home وب، منو، route، داشبورد و permission | `25-home.md` | هر تغییر در Home، navigation یا permission |
| راهنمای داخل برنامه و جستجوی فارسی/انگلیسی | بخش ۱۴ `25-home.md` | تغییر محتوای آموزش، فیلدهای فرم، موضوعات مجاز یا رتبه‌بندی جستجو؛ اتصال Popup در سند ۱۰، معماری در ۱۷ و ظاهر در ۱۸ |

## نگاشت حوزه به سند

| کلیدواژه/حوزه | سند اصلی | منابع تکمیلی |
|---|---|---|
| login، session، Home وب | `01-authentication.md`، `25-home.md` | `02-dashboard-and-navigation.md` برای Dashboard ویندوز |
| هدر فشرده، دراور، ارتفاع آیتم، گرادیانت انتخاب و افکت نوری | بخش ۳ `25-home.md` | بخش ۲ `18-ui-design-system.md` برای توکن‌ها؛ ابتدای سند ۲۱ برای نتایج آزمون و کامیت‌های بازگشت |
| هلپ، Help، HelpTopicId، آموزش فیلد، مترادف، غلط تایپی | بخش ۱۴ `25-home.md` | ۱۴.۳ نگاشت ۳۱ موضوع؛ ۱۴.۴ منابع محتوا؛ ۱۴.۵ جستجو؛ ۱۴.۷ روش افزودن/اصلاح؛ ۱۴.۸ وضعیت تأیید |
| MainForm، permission، parking context | `03-main-form-overview.md` | `04-users-and-access.md`، `16-final-review-and-delivery-gates.md` |
| parking، floor، section، space، zone | `03-parking-configuration.md`، `23-parking-zones.md` | `11-remaining-forms.md` |
| user، access level | `04-1-access-level-form.md`، `04-2-users-form.md` | `04-users-and-access.md` |
| شیفت کاربران اختیاری، HasUserShifts، شرط تخصیص/ساعت | `03-parking-configuration.md` | `25-home.md` برای منو/route؛ `04-users-and-access.md` و سند ۲۱ برای مجوز و شواهد اجرا |
| member، membership، card | `05-members-and-cards.md` | `10-shared-ui-components.md`، `11-remaining-forms.md` |
| traffic، payment، exit، manual traffic | `06-traffic-and-payment.md`، `12-manual-traffic-control-form.md` | `14-web-backend-requests.md` |
| وضعیت لحظه‌ای تجهیزات درب، SignalR `deviceEventsHub`، ورود خودکار کارتخوان | بخش ۳.۸.۱ `12-manual-traffic-control-form.md` | `DeviceEventsHub.cs` و `deviceStatusRealtime.ts`؛ مجوزها و تازگی status در همان بخش |
| روش مجوز تردد، EntryAuthorizaitionType، کارت و عکس، کارت و پلاک، کارت یا پلاک، QR | بخش ۳.۶.۲ `12-manual-traffic-control-form.md` | `trafficAuthorization.ts` برای کنترل ورودی؛ سند ۶ برای عکس و سند ۲۱ برای نتیجهٔ آزمون |
| پلاک‌های اخیر، نبض دریافت جدید/تکراری، گوشهٔ دکمه، reduced motion | بخش ۳.۵.۲ `12-manual-traffic-control-form.md` | `FloatingPlateHistory.tsx` و `plateDetectionHistory.css`؛ سند ۲۱ برای شواهد و حدود اعتبارسنجی |
| SOLID، تفکیک کنترل تردد و سوابق، resource متن تردد | بخش ۱۹ `12-manual-traffic-control-form.md` | `17-react-ui-architecture.md` و نتیجهٔ آزمون در سند ۲۱ |
| اولویت تصویر، چیدمان دوربین و عملیات | بخش ۳.۶.۴ `12-manual-traffic-control-form.md` | بخش ۳.۶.۱ برای چینش فعلی؛ بخش ۳.۵.۲ برای دستیار پلاک‌های اخیر |
| ذخیرهٔ عکس ورود/خروج، TrafficDumpImages، زیر ۲۰ کیلوبایت، کاهش ابعاد و فشرده‌سازی | بخش ۳.۵.۴ `12-manual-traffic-control-form.md` | اولویت عکس همان پلاک، DTO موجود، تفاوت سقف ورودی و ذخیره؛ سند ۲۴ برای فریم و سند ۲۷ برای انتشار |
| پلاکخوان، db:// | بخش ۳.۵.۱ `12-manual-traffic-control-form.md` | `24-rtsp-camera-ui-integration.md` برای تصویر زنده |
| قفل عکس پلاک جاری، صف تعیین‌تکلیف، بازیابی پس از قطعی | بخش ۳.۵.۳ `12-manual-traffic-control-form.md` | `06-traffic-and-payment.md` برای مرور کلی؛ سند ۲۱ برای شواهد اجرا و محدودیت‌ها |
| Hsh، Eos\|، Trigger قدیمی، cursor | `26-legacy-hsh-plate-detection.md` | `12-manual-traffic-control-form.md` برای تفاوت با مسیر هدف پلاکخوان |
| Publish، Release، Rebuild، IIS، Windows Service | `27-api-publish-and-hosting.md` | `Services/EosParkingApiWindowsService/Hosting/README.md` برای راهنمای فنی میزبان |
| تعریف تجهیزات، CRUD، تست اتصال سرویس و انواع فاقد درایور | `28-parking-equipment.md` | بخش EquipmentForm سند ۳ برای Windows؛ قرارداد مستقل `POST api/Equipment/TestConnection` در سند ۲۸ |
| monitoring، RTSP، WebRTC، HLS، ROI | `07-monitoring-and-devices.md`، `24-rtsp-camera-ui-integration.md` | `11-remaining-forms.md` |
| reports | `25-home.md`، `08-reports.md` | `11-remaining-forms.md` برای workflowهای تخصصی |
| Stimulsoft، StiWebViewer، نمایش پیش‌فرض، Prepare/Viewer/Export، انتخاب PDF | بخش ۴ `08-reports.md` | سند ۱۰ برای قرارداد component، سند ۱۷ برای مرز React/API/IIS، سند ۱۸ برای ظاهر و سند ۲۷ برای استقرار |
| لایسنس Windows، DLL محلی ۲۰۱۸، قالب MRT، رندر سمت API | بخش ۱ `08-reports.md` | قالب جاسازی‌شده، کلید مشترک، مجوز و نگهداری نتیجه؛ Reports.JS و کلید مرورگر استفاده نمی‌شوند |
| خطای 0x80131045، Shadow Copy، shadowCopyBinAssemblies، قفل DLL | بخش تشخیص تاریخی `08-reports.md` و بخش ۶ `27-api-publish-and-hosting.md` | تأیید کاربر دربارهٔ رفع خطای PDF پس از تغییر config؛ نتیجهٔ ویور بومی جدا ثبت می‌شود |
| پنهان‌شدن گزارش درآمد پارکینگ غیرتجاری، IsCommercialParking، دسترسی مستقیم گزارش | بخش ۶ `25-home.md` | `03-parking-configuration.md` برای تنظیم؛ `08-reports.md` برای قرارداد گزارش؛ سند ۲۱ برای نتیجهٔ آزمون |
| فیلتر پلاک گزارش، IranianPlateInput | `08-reports.md` | `10-shared-ui-components.md` برای کنترل مشترک؛ سند ۲۱ برای شواهد اجرا |
| گزارش بریده‌شده، پیش‌نمایش تمام‌صفحه، چاپ و خروجی، ReportPreview | `08-reports.md` | `25-home.md` برای نگاشت گزارش‌ها؛ سند ۲۱ برای شواهد اجرا |
| shared components، grid، filter، plate، money | `10-shared-ui-components.md` | `18-ui-design-system.md` |
| خطای ارتباط زنده، Tooltip، SignalR، polling | قانون مشترک خطاهای ارتباط زنده در `00-documentation-standard.md` | `ConnectionStatusIndicator` در سند ۱۰؛ اسناد ۷، ۱۲ و ۲۵ برای مصرف‌کننده‌ها |
| backend contract، missing endpoint، status code | `14-web-backend-requests.md` | سند تخصصی همان feature |
| Windows audit و scope | `15-windows-source-audit.md` | `03-main-form-overview.md`، `16-final-review-and-delivery-gates.md` |

## وضعیت منابع

- `00` مرجع قواعد است، نه شرح یک feature.
- `25` تنها مرجع قرارداد Home وب، منوها، routeها، داشبورد، گزارش‌های Home، راهنمای داخل برنامه، permission و APIهای مرتبط است. بخش ۱۴ قرارداد محتوا، محدودهٔ منو، جستجو، نگهداری و موارد باز راهنما را نگه می‌دارد.
- `21` مرجع خلاصه‌ی وضعیت پیاده‌سازی UI و موارد باز است و قرارداد Home را تکرار نمی‌کند.
- `23` و `24` اسناد تطبیق تخصصیِ به‌روز برای زون و دوربین هستند.
- `27` راهنمای انتشار بستهٔ مشترک Backend است؛ ساخت UI React را توصیف نمی‌کند.
- اگر دو سند درباره‌ی status یک feature اختلاف داشتند، سند تخصصیِ جدیدتر و سپس
  کد فعلی مرجع بررسی است؛ اختلاف باید در `21` ثبت شود.
- **تصمیم محصول برای کنترل ورود و خروج:** در تطبیق رفتار فعلی، سورس جاری بر شرح
  قدیمی اسناد تقدم دارد؛ بخش ۹ سند ۱۲ قرارداد API موجود را از Controllerها ثبت
  می‌کند. قراردادها و چیدمان‌های پیشنهادی جایگزین رفتار پیاده‌شده نیستند. اصلاح
  اختلاف‌های این حوزه نیز در سند ۲۱ ثبت می‌شود.
