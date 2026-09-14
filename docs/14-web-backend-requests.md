# درخواست‌های Backend برای پیاده‌سازی نسخه وب

## وضعیت سند

این سند رفتار فعلی برنامه نیست. موارد زیر قابلیت‌هایی هستند که در source فعلی به‌صورت کامل وجود ندارند و باید برای استفاده‌ی UI وب توسط تیم Backend/Windows Service ایجاد یا تکمیل شوند.

**تصمیم محصول:** پروژه‌ی وب فقط UI React است. UI نباید اتصال مستقیم به تجهیزات داشته باشد. تیم Backend باید روش معماری و قرارداد رسمی کنترل و مانیتورینگ تجهیزات را طراحی و تحویل دهد؛ UI فقط مصرف‌کننده‌ی API و eventهای تأییدشده خواهد بود.

مرجع رفتار مشاهده‌شده در scope مستندات: [مستند فرم کنترل تردد](12-manual-traffic-control-form.md) و [ممیزی سورس Windows](15-windows-source-audit.md). قرارداد Backend باید به‌صورت OpenAPI نسخه‌دار از تیم Backend تحویل شود.

## اولویت‌ها

| اولویت | مفهوم |
|---|---|
| P0 | بدون آن توسعه یا اجرای امن UI وب ممکن نیست |
| P1 | برای workflow کامل عملیاتی لازم است |
| P2 | برای کیفیت، مقیاس‌پذیری و تجربه کاربری لازم است |

## ۱. تولید OpenAPI/Swagger — P0

### هدف

تبدیل Controllerهای موجود به قرارداد قابل مصرف برای تولید client و مدل‌های TypeScript.

### درخواست از Backend

- فعال‌سازی Swagger برای تمام Controllerها؛
- ثبت request و response واقعی؛
- ثبت enumها و مقدار عددی/متنی آن‌ها؛
- ثبت Header `UserToken`؛
- ثبت خطاهای HTTP و `ResponseResultType`؛
- ارائه فایل نسخه‌دار مانند `openapi-v1.json`.

### معیار پذیرش

- UI بتواند client را بدون خواندن سورس C# تولید کند؛
- همه endpointهای تردد، پرداخت، پارکینگ، عضو و تجهیزات در فایل باشند؛
- مثال موفق و خطا برای هر endpoint وجود داشته باشد.

## ۲. قرارداد خطای پایدار — P0

### هدف

UI بتواند خطاهای فنی، احراز هویت و خطاهای کسب‌وکاری را از هم تفکیک کند.

### قرارداد پیشنهادی

```json
{
  "code": "TRAFFIC_ALREADY_EXITED",
  "message": "این تردد قبلاً خروج خورده است",
  "category": "business",
  "retryable": false,
  "fieldErrors": [],
  "traceId": "uuid",
  "details": null
}
```

### الزامات

- `code` ثابت و انگلیسی؛
- `message` قابل نمایش؛
- `retryable` برای تصمیم retry؛
- `fieldErrors` برای خطای فرم؛
- `traceId` برای پشتیبانی؛
- حذف اطلاعات حساس از خطای داخلی؛
- تعیین تکلیف استفاده از HTTP 200 wrapper فعلی یا مهاجرت تدریجی به status code استاندارد.

## ۳. CORS، HTTPS و دسترسی شبکه — P0

### درخواست

- تعریف originهای مجاز UI؛
- اجازه‌ی Header `UserToken`؛
- پشتیبانی preflight؛
- اجرای API روی HTTPS؛
- محدودکردن سرویس ویندوزی به شبکه امن؛
- جلوگیری از exposeکردن IP و پورت تجهیزات به Browser؛
- ثبت سیاست محیط‌های development، staging و production.

### معیار پذیرش

UI وب از Browser واقعی بتواند login و درخواست‌های authenticated را اجرا کند و درخواست مستقیم به تجهیزات نداشته باشد.

## ۴. context عملیاتی صفحه — P0

### endpoint پیشنهادی

```http
GET api/traffic/GetManualTrafficContext
```

### خروجی مورد نیاز

```json
{
  "user": {},
  "parking": {},
  "door": {},
  "shift": {},
  "permissions": [],
  "tariffs": [],
  "features": {},
  "devices": [],
  "settings": {}
}
```

### معیار پذیرش

UI با یک درخواست بتواند پارکینگ، درب، شیفت، مجوزها، تعرفه‌ها، قابلیت‌ها و وضعیت اولیه تجهیزات را دریافت کند.

## ۵. API وضعیت زنده تجهیزات — P0

### endpoint پیشنهادی

```http
GET api/device/GetDoorHealth?doorId={doorId}
GET api/device/GetDeviceHealth?deviceId={deviceId}
```

### خروجی مورد نیاز

- شناسه و نام دستگاه؛
- نوع دستگاه؛
- online/offline؛
- زمان آخرین اتصال؛
- زمان آخرین event؛
- firmware؛
- خطای آخر؛
- `ProcessByServer`؛
- `ByService`؛
- شناسه Windows Service؛
- زمان آخرین heartbeat.

### معیار پذیرش

UI بدون دسترسی به SDK یا IP بتواند وضعیت دستگاه را نمایش دهد و قطع ارتباط را تشخیص دهد.

## ۶. API فرمان راهبند — P0

### endpoint پیشنهادی

```http
POST api/device/OpenGate
```

### request

```json
{
  "doorId": 10,
  "trafficId": 500,
  "direction": "entry",
  "reason": "manual_traffic"
}
```

### response

```json
{
  "commandId": "uuid",
  "status": "opened",
  "deviceId": 20,
  "requestedAt": "...",
  "completedAt": "...",
  "errorCode": null,
  "message": "درب باز شد"
}
```

### الزامات

- Backend خودش device و relay را تعیین کند؛
- UI فقط `doorId` و context عملیاتی را بفرستد؛
- command دارای شناسه یکتا باشد؛
- فرمان تکراری کنترل شود؛
- نتیجه واقعی دستگاه از نتیجه‌ی صرفاً ارسال درخواست جدا باشد؛
- audit ثبت شود.

## ۷. realtime تجهیزات و تردد — P0

یکی از SignalR، WebSocket یا SSE برای ارسال eventها ایجاد شود.

### eventهای لازم

```text
plate.detected
card.detected
traffic.updated
traffic.entered
traffic.exited
payment.updated
device.status_changed
gate.command_status_changed
session.revoked
```

### payload مشترک

```json
{
  "eventId": "uuid",
  "eventType": "card.detected",
  "parkingId": 1,
  "doorId": 10,
  "deviceId": 20,
  "occurredAt": "...",
  "payload": {}
}
```

### الزامات

- subscription بر اساس `parkingId` و `doorId`؛
- عدم ارسال event پارکینگ دیگر؛
- replay یا snapshot پس از reconnect؛
- heartbeat کانال؛
- اعلام disconnect؛
- اعتبارسنجی permission برای subscription.

## ۸. idempotency و operation tracking — P0

برای ورود، خروج، پرداخت و فرمان راهبند لازم است:

```http
Idempotency-Key: uuid
```

و در response:

```json
{
  "operationId": "uuid",
  "status": "processing"
}
```

### endpoint پیگیری

```http
GET api/operations/{operationId}
```

### معیار پذیرش

- refresh صفحه باعث اجرای دوباره عملیات نشود؛
- retry شبکه باعث ثبت دوباره ورود/خروج نشود؛
- نتیجه عملیات بعد از بسته‌شدن Browser قابل پیگیری باشد؛
- وضعیت‌های `processing`، `succeeded`، `failed`، `timeout` و `cancelled` تعریف شوند.

### قرارداد حذف گروهی در payload

**تصمیم محصول:** هر entity با `Id < 0` در payload یعنی حذف entity با شناسه‌ی قدرمطلق؛ برای مثال `Id = -42` یعنی حذف رکورد `42`. حذف به‌صورت پیش‌فرض فیزیکی از دیتابیس است؛ soft delete/archive فقط با تصمیم و مستند صریح همان entity مجاز است. Backend باید این convention را برای endpointهای گروهیِ تأییدشده پیاده و در OpenAPI مستند کند؛ رکورد منفی نباید به‌عنوان ایجاد یا ویرایش تفسیر شود. کنترل مجوز، وابستگی‌ها و audit حذف با Backend است.

## ۹. اصلاح قرارداد پرداخت — P1

قرارداد فعلی `PayDump` با GET کار می‌کند. برای وب endpoint POST پیشنهاد می‌شود:

```http
POST api/traffic/PayDump
```

```json
{
  "dumpId": 500,
  "payType": "PosPay",
  "transactionResponse": "...",
  "idempotencyKey": "uuid"
}
```

### خروجی لازم

- وضعیت پرداخت؛
- مبلغ تأییدشده؛
- شماره پیگیری؛
- پاسخ POS؛
- شماره رسید؛
- زمان پرداخت؛
- وضعیت نهایی تردد.

### مرز مسئولیت محاسبه

**تصمیم محصول:** UI React هیچ مبلغ، مالیات، گردکردن، اعتبار عضو یا نتیجه پرداختی را محاسبه یا اصلاح نمی‌کند. UI فقط ورودی‌های مورد نیاز را به API می‌فرستد و خروجی authoritative Backend را نمایش می‌دهد. بنابراین Backend باید همه اجزای مبلغ و قواعد مؤثر را در پاسخ برگرداند تا UI نیازی به بازسازی فرمول نداشته باشد.

قرارداد فعلی باید برای backward compatibility تا زمان مهاجرت حفظ شود.

### تصمیم UX برای ابهام پرداخت POS

اگر POS پرداخت را موفق اعلام کند اما UI پاسخ قطعی از API دریافت نکند، UI **نباید** خودکار استعلام یا ثبت مجدد پرداخت را انجام دهد. باید یک خطای عملیاتی برجسته نمایش دهد و کنترل تصمیم و پیگیری را به اپراتور واگذار کند.

پیام باید حداقل `dumpId`، مبلغ، زمان، شماره پیگیری/پاسخ POS در صورت وجود، و `traceId` درخواست UI را نشان دهد. دکمه‌های UI در این حالت فقط «بستن/ثبت یادداشت برای پیگیری» هستند، نه «پرداخت مجدد» یا «باز کردن راهبند». نیاز Backend به idempotency همچنان برای جلوگیری از دوباره‌کاری ناشی از refresh، دوبارکلیک یا خطاهای دیگر برقرار است.

## ۱۰. upload و دریافت تصاویر — P1

### درخواست

قرارداد مستقل برای تصویر ورود، خروج، پلاک و عضو ایجاد شود:

```http
POST api/files/traffic-image
GET  api/files/{fileId}
```

### نیازمندی‌ها

- multipart upload یا upload امن؛
- محدودیت حجم و فرمت؛
- شناسه فایل؛
- URL موقت؛
- کنترل مجوز؛
- ثبت ارتباط فایل با تردد؛
- retention policy؛
- عدم ارسال byte array بزرگ در هر request تردد.

### تصمیم محصول: نمایش زنده، reconnect و مصرف حافظه

- UI باید تا حد امکان تصویر زنده‌ی خود دوربین را نمایش دهد؛ Browser فقط stream/URL امن ارائه‌شده از Backend یا Service را مصرف می‌کند و به IP/credential دوربین دسترسی ندارد.
- در قطع stream، UI باید وضعیت قطع را نشان دهد و reconnect خودکار با backoff انجام دهد؛ پس از reconnect، آخرین frame معتبر و وضعیت اتصال تازه شود.
- UI فقط تعداد محدودی frame/thumbnail اخیر نگه می‌دارد و هنگام خروج از صفحه، تغییر درب یا بسته‌شدن پنل، stream، object URL و bufferهای تصویر را آزاد می‌کند. نگهداری نامحدود تصویر در RAM مرورگر ممنوع است.
- نمایش زنده یا reconnect نباید ورود، خروج، پرداخت یا فرمان راهبند را خودکار اجرا کند.

### تنظیمات قابل مدیریت تصاویر و دوربین

Backend باید تنظیمات schema‌دار و versioned با scope پارکینگ/درب ارائه کند و UI یک صفحه تنظیمات مجاز برای مشاهده/ویرایش آن‌ها داشته باشد. مقادیر حداقلی:

- فعال/غیرفعال‌بودن نمایش زنده و تصویر ورود/خروج؛
- کیفیت یا حداکثر resolution قابل نمایش، سقف حجم فایل و فرمت‌های مجاز؛
- حداکثر تعداد frame/thumbnail نگهداری‌شده در UI و سیاست آزادسازی buffer؛
- timeout اتصال، تعداد تلاش reconnect و backoff؛
- مدت نگهداری تصویر در سرور و زمان/سیاست پاک‌سازی فیزیکی؛
- محل/نوع ذخیره‌سازی که Backend انتخاب می‌کند (UI فقط یک identifier یا گزینه مجاز می‌بیند، نه path یا credential)؛
- permissionهای مشاهده، دانلود، حذف و مدیریت retention؛
- فعال/غیرفعال‌بودن حذف دستی و الزام ثبت دلیل/audit برای حذف.

Backend باید این تنظیمات را enforce کند؛ UI صرفاً آن‌ها را نمایش و برای کاربران مجاز ویرایش می‌کند. حذف تصویر، در صورت مجازبودن، مطابق سیاست پیش‌فرض حذف فیزیکی انجام می‌شود.

## ۱۱. pagination و فیلتر ترددها — P1

برای `GetTraffics` نسخه صفحه‌بندی‌شده ارائه شود:

```http
GET api/traffic/GetTraffics?page=1&pageSize=50&doorId=10&status=open&search=...
```

خروجی:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 50,
  "totalCount": 120,
  "hasNext": true
}
```

قرارداد فعلی فهرست کامل ترددهای بازه را برمی‌گرداند و برای صفحه وب پرترافیک مناسب نیست.

## ۱۲. تنظیمات عملیاتی کاربر — P1

تنظیمات فعلی فرم به رشته‌ی comma-separated وابسته است. برای وب:

```http
GET  api/traffic/GetUserSettings?parkingId={id}&doorId={id}
POST api/traffic/SaveUserSettings
```

### فیلدهای مورد نیاز

- ورود خودکار؛
- خروج خودکار؛
- چاپ فیش ورود؛
- چاپ فیش خروج؛
- بررسی تردد تکراری؛
- بازه تردد تکراری؛
- خروج بدون ورود؛
- ورود چندباره؛
- اجباری‌بودن پلاک؛
- عدم نمایش پرداخت غیرعضو؛
- نادیده‌گرفتن کارت تکراری؛
- صدای راهبند؛
- فرمان سریع G4.

تنظیمات باید schema‌دار، versioned و دارای scope کاربر/پارکینگ/درب باشند.

## ۱۳. قرارداد session و refresh — P1

در کنار `UserToken` فعلی، endpointهای زیر برای وب لازم است:

```http
POST api/user/refresh
POST api/user/logout
GET  api/user/session
```

### الزامات

- تشخیص token منقضی؛
- refresh امن؛
- revoke؛
- اطلاع‌رسانی `session.revoked`؛
- رفتار مشخص هنگام تغییر شیفت یا پارکینگ؛
- عدم نگهداری credential دستگاه در Browser.

## ۱۴. audit عملیاتی — P1

برای عملیات زیر audit اجباری شود:

- استعلام حساس؛
- ثبت ورود؛
- ثبت خروج؛
- خروج بدون ورود؛
- پرداخت؛
- بازکردن راهبند؛
- تغییر تعرفه انتخابی؛
- تغییر مجوز خروج؛
- تنظیم ساعت دستگاه؛
- ثبت بار.

### خروج بدون ورود؛ قرارداد لازم

اگر UI برای یک خروج، ورود متناظر پیدا نکند، باید به صفحه مدیریت ورود/خروج منتقل شود تا اپراتور ورود را تعیین یا ثبت کند. Backend باید endpoint ایجاد/اصلاح ورود دستی را با authorization server-side فراهم کند. در پاسخ عدم مجوز، UI فقط پیام مناسب نمایش می‌دهد و نباید هیچ ورود یا خروجی را خودکار بسازد.

فیلدهای audit:

- کاربر؛
- پارکینگ؛
- درب؛
- دستگاه؛
- تردد؛
- operation/command id؛
- زمان؛
- نتیجه؛
- دلیل عملیات؛
- trace id.

## ۱۵. قرارداد سرویس محلی تجهیزات — P1

اگر UI فقط به Backend مرکزی متصل باشد، Backend باید با Windows Service ارتباط داشته باشد. قرارداد داخلی پیشنهادی:

```http
GET  /local-api/health
GET  /local-api/devices
POST /local-api/devices/{id}/open-gate
POST /local-api/devices/{id}/set-time
POST /local-api/cameras/{id}/reconnect
```

یا Windows Service باید اتصال خروجی دائمی به Backend مرکزی برقرار کند و event/command را با SignalR یا صف امن تبادل کند.

در هر دو مدل:

- احراز هویت Service مستقل از UserToken باشد؛
- Service شناسه یکتا داشته باشد؛
- heartbeat ارسال شود؛
- command acknowledgement وجود داشته باشد؛
- نتیجه واقعی دستگاه گزارش شود؛
- credential تجهیزات فقط در Service نگهداری شود.

### خروجی الزامی تیم Backend

Backend باید علاوه بر endpointها، یک تصمیم معماری مکتوب برای ارتباط تجهیزات تحویل دهد که مشخص کند:

- Agent/Windows Service کجا اجرا می‌شود و مالک اتصال هر تجهیز کدام جزء است؛
- Browser برای monitor و command از چه API/realtime contract استفاده می‌کند؛
- هر فرمان چگونه با `commandId`، وضعیت `accepted/executing/succeeded/failed/timeout` و acknowledgement قابل پیگیری است؛
- در قطع ارتباط UI، Backend یا Agent، چه retry، timeout و جلوگیری از اجرای تکراری اعمال می‌شود؛
- مجوز کنترل تجهیز بر اساس کاربر، پارکینگ و درب چگونه enforce می‌شود؛
- credentialها، IP و port تجهیزات چگونه از UI و Browser پنهان می‌مانند.

## ۱۶. تست و محیط تحویل Backend

### تصمیم اتصال

**تصمیم محصول:** نرم‌افزار فقط آنلاین است. UI در قطع ارتباط نباید عملیات ورود، خروج، پرداخت یا فرمان تجهیز را locally queue یا بعداً همگام‌سازی کند. باید وضعیت قطع ارتباط را نمایش دهد، عملیات جاری را ناموفق/نامشخص اعلام کند و کنترل تصمیم بعدی را به اپراتور واگذار کند.

تیم Backend باید برای UI این موارد را فراهم کند:

- محیط development/staging؛
- داده نمونه پارکینگ، درب، تعرفه، عضو، کارت و تردد؛
- mock برای تجهیزات؛
- سناریوی موفق ورود؛
- سناریوی موفق خروج؛
- کارت نامعتبر؛
- عضو مسدود؛
- تردد تکراری؛
- لیست سیاه؛
- خروج بدون ورود؛
- پرداخت موفق و ناموفق؛
- قطع راهبند؛
- قطع سرویس؛
- انقضای token؛
- عدم مجوز؛
- retry و duplicate request.

## ۱۷. خروجی مورد انتظار برای شروع توسعه UI

قبل از شروع پیاده‌سازی نهایی UI، Backend باید این بسته را ارائه کند:

1. `openapi.json`
2. فایل enumها و مدل‌های TypeScript یا JSON Schema
3. آدرس محیط staging
4. روش login و Header token
5. context نمونه
6. داده تستی کامل
7. قرارداد realtime
8. قرارداد تجهیزات و راهبند
9. کد خطاها
10. سناریوهای تست Postman یا مشابه
11. سیاست CORS و HTTPS
12. راهنمای اتصال Windows Service

تا قبل از آماده‌شدن این بسته، UI می‌تواند با mock توسعه پیدا کند، اما اتصال production و تست واقعی تردد نباید نهایی تلقی شود.
