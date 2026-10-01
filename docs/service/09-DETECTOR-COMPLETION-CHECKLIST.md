# الزام تکمیل هر تشخیص جدید

این سند برای جلوگیری از ناقص ماندن یک modality مانند Palm، Face یا Plate الزام‌آور است. هیچ تشخیص جدیدی «کامل» محسوب نمی‌شود مگر اینکه تمام موارد این چک‌لیست در backend، وب، Windows و مستندات پیاده‌سازی و آزمون شده باشند.

## قانون پذیرش

برای هر تشخیص جدید، Pull Request باید یک ماتریس parity با ستون‌های زیر داشته باشد:

| بخش | الزام پذیرش |
| --- | --- |
| مدل و runtime | `AnalysisKind`/capability، تنظیمات task، model catalog، license و pipeline ثبت و اجرا شود. |
| Identity | person/sample CRUD، تصویر sample، move/delete، health/backup و similarity/search در API و UI موجود باشد. |
| Event contract | component مستقل در payload با `kind`, `label`, `confidence`, `threshold`, `trackId`, `bounds` و در صورت شناسایی `recognitionStatus`, `personId`, `name`, `personNumber`, `isUnknown`, `similarity`, `minimumSimilarity`, `matchedSampleId` تولید شود. |
| Artifact | crop اختصاصی با نام ثابت (`<Detector>Crop`) ذخیره، retention و download شود. اگر aligned/normalized image دارد، artifact مستقل داشته باشد. |
| Event type/scenario | حالت‌های recognized/unknown، standalone و associationهای پشتیبانی‌شده نام‌گذاری و در backend، API، وب و Windows یکسان استفاده شوند. |
| Association | association با هر modality سازگار موجود (حداقل Plate و modalityهای identity) در same-frame، temporal و standalone بررسی شود؛ اگر از نظر دامنه معتبر نیست، دلیل در قرارداد نوشته شود. |
| Trigger | فیلتر نوع تشخیص، recognized/unknown، label، identity، confidence، similarity، camera/task/ROI و cooldown/history key پشتیبانی شود. UI نباید تنها راه تنظیم modality باشد؛ runtime باید آن را مستقل ارزیابی کند. |
| Client subscription | mode، required، include/exclude و unknown policy برای modality اضافه شود؛ eventِ فقط همان modality باید از REST و SignalR تحویل بگیرد. |
| Invocation | event type، فیلترها، sourceهای JSON، sourceهای باینری/Base64 و crop اختصاصی در mapping editor و delivery runtime موجود باشد. |
| Web UI | Dashboard، Events، Event detail، search/filter، preview artifact، Trigger editor، Client Subscription و Invocation editor نمایش و تنظیم شوند. |
| Windows UI | live event، history/rebuild، trigger، invocation، association و identity tools modality را با نام و وضعیت درست نمایش دهند. هیچ متن hardcode‌شدهٔ Face/Plate نباید برای modality جدید استفاده شود. |
| API/SDK types | مدل‌های TypeScript و C#، queryهای legacy، serialization و backward compatibility به‌روزرسانی شوند. |
| Documentation | event contract، API، triggers، invocations، README و این چک‌لیست به‌روزرسانی شوند و نمونهٔ payload واقعی اضافه شود. |
| Tests | حداقل unit/integration برای payload، subscriptionِ standalone، trigger recognized/unknown، cooldown key، invocation crop و هر دو UI build اجرا شود. |

## ترتیب اجباری پیاده‌سازی

1. ابتدا قرارداد نام‌ها و payload در `07-DETECTION-EVENT-CONTRACT.md` ثبت شود.
2. سپس runtime و event store پیاده‌سازی شود.
3. بعد API، SignalR subscription، trigger و invocation تکمیل شود.
4. سپس API types و هر دو UI به‌صورت هم‌زمان تکمیل شوند.
5. در پایان تست‌ها، build وب/Windows و مستندات اجرا و در همان Pull Request ثبت شوند.

## قواعد جلوگیری از فراموشی

- اضافه کردن capability یا task بدون تکمیل این ماتریس ممنوع است.
- استفاده از `else => plate`، fallback متن `Face` یا شرط‌های محدود به `hasPlate || hasFace` در مسیر عمومی event ممنوع است؛ مسیر عمومی باید modality جدید را صریحاً پوشش دهد یا از registry مشترک استفاده کند.
- هر modality باید حداقل یک رویداد standalone در fixture تست داشته باشد؛ تست فقط association با Face یا Plate کافی نیست.
- هر نام جدید باید در یک جدول مرکزی ثبت شود: component key، `AnalysisKind`، event types، scenarioها، artifactها، sourceهای Invocation و modeهای subscription.
- اگر modality جدید identity دارد، similarity و unknown/known behavior از روز اول بخشی از Definition of Done است، نه کار بعدی.

## ماتریس فعلی

| Modality | Component | Event types | Artifact | Subscription mode | Association |
| --- | --- | --- | --- | --- | --- |
| Plate | `plate` | `PlateDetected` | `PlateCrop` | `Plate` | Face/Palm |
| Face | `face` | `FaceRecognized`, `FaceUnknown` | `DetectionCrop`, `FaceAlignedCrop` | `KnownFace` | Plate |
| Palm | `palm` | `PalmRecognized`, `PalmUnknown` | `PalmCrop` | `Palm`, `KnownPalm` | Plate |

هر تغییر در این جدول باید هم‌زمان با تغییر کد و fixtureهای تست انجام شود.
