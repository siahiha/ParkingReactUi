# یکپارچه‌سازی تشخیص پلاک و Trigger در UI وب

## وضعیت سند

| مورد | مقدار |
|---|---|
| وضعیت | پیاده‌سازی UI انجام شده؛ قرارداد و تنظیمات runtime سرویس تشخیص نیازمند تأیید مالک سرویس است |
| نوع اتصال | SignalR به `HshDetectionService` و دریافت رخداد `detection` |
| دامنه | تنظیمات دوربین، کنترل تردد دستی، پرکردن پلاک/زمان/تصویر |
| منبع UI | `EosParkingReactUi/src/api/hshDetectionRealtime.ts`، `TrafficCameraPanels.tsx`، `TrafficRecordsWorkspace.tsx`، `CameraEquipmentWorkspace.tsx` |
| منبع قرارداد سرویس | راهنمای اتصال پروژه مشتری به Trigger سرویس تشخیص پلاک و endpointهای runtime سرویس |

برچسب «رفتار فعلی» از کد و تست اتصال استخراج شده است. مواردی که به تنظیمات سرویس، CORS، API key یا قرارداد نهایی Backend وابسته‌اند با برچسب «ناقص/نیازمند تأیید» ثبت شده‌اند.

## ۱. هدف و جایگاه قابلیت

این قابلیت رخداد تشخیص پلاک را از سرویس مستقل `HshDetectionService` دریافت می‌کند و در صفحهٔ کنترل تردد دستی برای دوربین ورودی یا خروجی به‌صورت خودکار این داده‌ها را پر می‌کند:

- متن پلاک؛
- زمان تشخیص؛
- تصویر کامل رخداد (`FullFrameRaw`)؛
- تصویر برش پلاک (`PlateCrop`).

منطق تشخیص پلاک، Trigger، confidence و شرط دوربین در سرویس تشخیص باقی می‌ماند. UI فقط رخدادهای Triggerشده و شناسه‌های Trigger مجاز را مصرف می‌کند.

## ۲. مسیرهای UI و نقش‌ها

### تنظیم Trigger روی دوربین

مسیر تنظیمات تجهیزات دوربین در بخش مدیریت تجهیزات است. مقدار در فیلد «سرویس تشخیص پلاک» ذخیره می‌شود و الگوی آن چنین است:

```text
Eos|http://127.0.0.1:5080|90c31121d7974a439e363a1d81af6562
```

سه بخش مقدار:

| بخش | معنا |
|---|---|
| `Eos` | نوع سرویس؛ در parser فعلی باید دقیقاً `Eos` باشد |
| بخش دوم | `ServiceBaseUrl` سرویس تشخیص، بدون مسیر Hub |
| بخش سوم | یک یا چند شناسهٔ Trigger مجاز؛ چند شناسه با `,` جدا می‌شوند |

این فیلد فقط در صورتی معتبر است که سه بخش داشته باشد، URL از نوع `http` یا `https` باشد و حداقل یک Trigger ID وجود داشته باشد.

### مصرف رخداد

صفحهٔ `home/parking/manual-traffic` دوربین ورودی و خروجی درب جاری را می‌خواند. جهت دوربین از رابطهٔ درب/تجهیزات تعیین می‌شود:

- رخداد دوربین ورودی، زمان ورود را پر می‌کند؛
- رخداد دوربین خروجی، زمان خروج را پر می‌کند.

مجوز مشاهده و تنظیم این قابلیت باید از مجوزهای مدیریت تجهیزات و کنترل تردد جاری تبعیت کند. authorization سمت UI جایگزین authorization سمت Backend یا سرویس تشخیص نیست.

## ۳. جریان اتصال

1. UI اطلاعات درب و تجهیزات دوربین را از API مدیریت پارکینگ می‌گیرد.
2. مقدار `DetectionServerAddress` هر دوربین parse می‌شود.
3. برای هر دوربین ورودی/خروجی دارای مقدار معتبر، connection به مسیر زیر ساخته می‌شود:

   ```text
   {ServiceBaseUrl}/hubs/detections
   ```

4. handlerهای `replayStarted`، `detection`، `replayCompleted` و `cursorExpired` ثبت می‌شوند.
5. پس از `Start`، متد زیر فراخوانی می‌شود:

   ```text
   Subscribe(lastSequence, subscription)
   ```

6. subscription فعلی برای تشخیص پلاک است و `cameraIds` را خالی می‌فرستد؛ زیرا شناسهٔ تجهیز پارکینگ الزاماً با شناسهٔ دوربین Hsh یکسان نیست. فیلتر Trigger در UI انجام می‌شود.
7. پس از reconnect نیز subscription دوباره با cursor ذخیره‌شده ارسال می‌شود.

## ۴. قرارداد رخداد و فیلتر UI

UI رخداد را فقط وقتی برای workflow تردد ارسال می‌کند که همهٔ این شروط برقرار باشد:

- `eventId` وجود داشته باشد؛
- `sequence` عددی باشد؛
- `trigger.matched == true` باشد؛
- اشتراک شناسه‌های تنظیم‌شدهٔ دوربین با `trigger.matchingTriggerIds` غیرتهی باشد.

فیلدهای مورد استفاده:

```text
eventId
sequence
occurredAtUtc
source.cameraId
components.plate.plateText
components.plate.confidence
trigger.matched
trigger.matchingTriggerIds
artifacts
```

`sequence` برای ترتیب و replay است و جایگزین `eventId` نیست. تحویل رخداد از نظر شبکه at-least-once است؛ اجرای exactly-once نباید فرض شود.

## ۵. تصویرها و Artifactها

تصویر معمولاً داخل پیام SignalR به‌صورت Base64 قرار ندارد. UI پس از دریافت رخداد، دو Artifact را lazy دریافت می‌کند:

```text
FullFrameRaw → تصویر کامل فریم
PlateCrop    → تصویر برش پلاک
```

برای URL نسبی سرویس، مسیر نهایی چنین است:

```text
{ServiceBaseUrl}/api/v1/events/{eventId}/artifacts/{artifactId}
```

در صفحهٔ کنترل تردد هر دو تصویر با Object URL موقت نمایش داده و هنگام جایگزینی رخداد یا unmount آزاد می‌شوند. اگر Artifact موجود نباشد یا پاسخ HTTP موفق نباشد، متن پلاک و زمان همچنان قابل نمایش است ولی placeholder تصویر نشان داده می‌شود.

## ۶. Cursor و idempotency

آخرین `sequence` و فهرست محدود `eventId`های پردازش‌شده در `localStorage` با کلید وابسته به URL سرویس، دوربین و Trigger ذخیره می‌شود. cursor بعد از پردازش رخداد جلو می‌رود و رخداد تکراری بر اساس `eventId` دوباره به workflow ارسال نمی‌شود.

این نگهداری مرورگری برای یک UI عملیاتی سبک است و جایگزین Event Store durable برای اکشن سخت‌افزاری یا workflow چندکاربره نیست.

اگر سرویس `cursorExpired` ارسال کند، UI وضعیت خطا/نیاز به همگام‌سازی را گزارش می‌کند. سیاست کامل `ResyncFromAvailable` یا `StopAndAlert` هنوز در UI پیاده‌سازی نشده و «ناقص/نیازمند تأیید» است.

## ۷. CORS، Proxy و استقرار

### رفتار فعلی محیط توسعه

سرویس محلی روی `127.0.0.1:5080` در پاسخ CORS، origin UI را مجاز نمی‌کند. برای حفظ مقدار صحیح تنظیمات و اتصال مستقیم از UI، Vite در محیط توسعه مسیر هم‌مبدأ زیر را proxy می‌کند:

```text
/hsh-detection-service/* → http://127.0.0.1:5080/*
```

این proxy با `ws: true` برای SignalR و با rewrite برای API و Artifact فعال است. UI فقط برای سرویس محلی `localhost/127.0.0.1:5080` این مسیر را استفاده می‌کند؛ URLهای غیرمحلی مستقیم مصرف می‌شوند.

### نیازمندی استقرار

برای production، یکی از این دو تصمیم باید رسمی شود:

1. سرویس تشخیص origin دقیق UI را در CORS مجاز کند و مسیر SignalR، `POST/GET/OPTIONS` و headerهای مورد نیاز را بپذیرد؛ یا
2. reverse proxy هم‌مبدأ در وب‌سرور production برای Hub و Artifactها مستقر شود.

Proxy داخلی Vite راهکار production نیست و فقط بخشی از dev server است.

## ۸. API و وضعیت پوشش

| API/مسیر | مصرف | وضعیت |
|---|---|---|
| `GET api/Parking/GetParkingDoor?doorId=...` | پیدا کردن دوربین‌های مستقیم درب | نام endpoint مشخص؛ قرارداد کامل response نیازمند تأیید Backend |
| `GET api/Parking/GetParkingDoorDevices?doorId=...` | fallback تجهیزات دوربین درب | نام endpoint مشخص؛ قرارداد کامل response نیازمند تأیید Backend |
| `POST api/Parking/SaveParkingEquipment` | ذخیرهٔ `DetectionServerAddress` و تنظیمات دوربین | نام endpoint مشخص؛ validation سمت Backend نیازمند تأیید |
| `POST {ServiceBaseUrl}/hubs/detections/negotiate` | مذاکرهٔ SignalR | قرارداد سرویس طبق راهنمای اتصال؛ auth/CORS محیطی نیازمند تأیید |
| SignalR `Subscribe` و event `detection` | دریافت live/replay | قرارداد سرویس مشخص؛ integration test واقعی باید حفظ شود |
| `GET /api/v1/events/{eventId}/artifacts/{artifactId}` | دریافت تصویر | مسیر مستند؛ retention و auth محیطی نیازمند تأیید |

## ۹. خطاها و عیب‌یابی

| علامت | برداشت |
|---|---|
| `health/ready` یا negotiate timeout/refused | سرویس، IP، پورت یا شبکه در دسترس نیست |
| negotiate برابر `401` | API key وجود ندارد یا معتبر نیست |
| اتصال از PowerShell موفق ولی UI ناموفق | محتمل‌ترین علت CORS یا WebSocket/Proxy است |
| اتصال برقرار ولی پلاک نمی‌آید | رخداد جدید تولید نشده یا Trigger match نشده است |
| `matched=false` یا `matchingTriggerIds=[]` | مشکل در تعریف Trigger سرویس، camera ID، kind، confidence یا cooldown است |
| پلاک و زمان می‌آید ولی تصویر نه | Artifact URL، proxy، مجوز دانلود یا retention را بررسی کنید |
| فقط رخدادهای قدیمی/عدم replay | cursor قدیمی یا `cursorExpired` را بررسی کنید |

برای تست سرویس:

```text
GET http://127.0.0.1:5080/health/ready
GET http://127.0.0.1:5080/health/live
GET http://127.0.0.1:5080/api/v1/service/status
GET http://127.0.0.1:5080/api/v1/triggers
GET http://127.0.0.1:5080/api/v1/events?limit=5
```

در یک تست موفق، سرویس باید `ready=true` و `droppedEventCount=0` داشته باشد و رخداد جدید باید `trigger.matched=true` و Trigger ID مورد انتظار را نشان دهد.

## ۱۰. خطوط قرمز و نکات امنیتی

- API key در log، URL، payload، exception یا پیام کاربر چاپ نشود.
- API key واقعی در source یا `.env` commit نشود.
- Browser-only API key عملاً در اختیار کاربر مرورگر است؛ برای production باید token کوتاه‌عمر، CORS کنترل‌شده یا proxy هم‌مبدأ رسمی تعیین شود.
- UI نباید Trigger، confidence، نوع تشخیص یا سناریوی سرویس را دوباره تفسیر یا بازتعریف کند.
- `TriggerAction.Type = Webhook` را بدون وجود dispatcher واقعی، Webhook قابل‌اعتماد فرض نکنید.
- رخداد SignalR به‌تنهایی به معنای exactly-once نیست؛ `eventId` و idempotency باید حفظ شوند.
- تصویر و اطلاعات پلاک دادهٔ عملیاتی حساس است و نباید در log یا storage دائمی مرورگر نگهداری شود.
- تغییر Backend یا سرویس تشخیص خارج از scope UI است؛ هر تغییر قرارداد باید با مالک سرویس ثبت و version شود.

## ۱۱. موارد باز و نیازمند تصمیم

1. originهای مجاز production و مالک تنظیم CORS مشخص شود.
2. روش رسمی API key/token برای browser تعیین شود.
3. سیاست `cursorExpired` و gap رخدادها برای کنترل تردد تصویب شود.
4. قرارداد دقیق response API تجهیزات و نگاشت `DetectionServerAddress` نسخه‌دار شود.
5. integration test با سرویس واقعی یا fake SignalR برای reconnect، duplicate، Artifact و cursorExpired اضافه شود.
6. مشخص شود آیا هر رخداد باید full frame و plate crop را دریافت کند یا دریافت تصویر فقط با درخواست کاربر انجام شود.

