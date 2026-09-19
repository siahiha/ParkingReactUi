# راهنمای پیاده‌سازی UI دوربین‌های RTSP

این سند برای عامل هوش مصنوعی یا توسعه‌دهنده‌ی React نوشته شده است تا UI مدیریت دوربین‌های RTSP را بر اساس امکانات سرویس پیاده‌سازی کند.

## هدف

UI باید بتواند:

- چند دوربین را هم‌زمان نمایش دهد.
- اتصال هر دوربین را جداگانه شروع و متوقف کند.
- وضعیت اتصال را به کاربر نشان دهد.
- تصویر را pause، play و mute/unmute کند.
- روی تصویر ROI مستطیلی رسم کند.
- برای ROI رنگ و متن تنظیم کند.
- در صورت قطع اتصال، خطا را نمایش دهد و امکان تلاش مجدد داشته باشد.
- هنگام خروج از صفحه یا حذف دوربین، اتصال را به‌درستی آزاد کند.

## محدودیت مهم پخش

دوربین مستقیماً RTSP ارائه می‌کند، اما مرورگرهای معمولی RTSP را مستقیماً پخش نمی‌کنند. سرویس Windows دو خروجی برای UI فراهم می‌کند:

- WebRTC/WHEP برای حالت پیش‌فرض و کم‌تاخیر؛
- HLS با FFmpeg برای سازگاری و fallback.

در UI فعلی، حالت پیش‌فرض WebRTC است و کاربر می‌تواند از Toolbar کامپوننت به HLS سوییچ کند.

برای Chrome و Edge از `hls.js` استفاده شود. Safari معمولاً HLS را به‌صورت native پشتیبانی می‌کند.

```bash
npm install hls.js
```

## کامپوننت استاندارد `CameraStreamPreview`

کامپوننت قابل استفاده‌ی مجدد دوربین در این مسیر قرار دارد:

```text
Persentation/EosParkingReactUi/src/components/management/CameraStreamPreview.tsx
```

نمونه‌ی استفاده:

```tsx
import { CameraStreamPreview } from "./components/management/CameraStreamPreview";

<CameraStreamPreview
  camera={camera}
  language={language}
  viewer={viewerId}
  size={200}
/>
```

### قرارداد ظاهری و رفتاری کامپوننت

- اندازه‌ی پیش‌فرض `200x200` است و کامپوننت نباید به‌صورت پیش‌فرض کل عرض container را پر کند.
- با `size={240}` اندازه‌ی مربعی `240x240` ساخته می‌شود.
- برای اندازه‌ی غیرمربع از `size={{ width: 320, height: 200 }}` استفاده شود.
- بالای تصویر فقط نام دوربین و آیکون وضعیت نمایش داده می‌شود؛ متن وضعیت مثل «متصل» در UI نمایش داده نمی‌شود.
- آیکون وضعیت از نوع دوشاخه است و با توجه به وضعیت، حالت متصل یا جدا را نشان می‌دهد و با رنگ وضعیت را مشخص می‌کند:
  - سبز: `Connected`
  - زرد: `Connecting` یا `Stopping`
  - قرمز: `Failed`
  - خاکستری: `Disconnected`
- در حالت `Connected` از آیکون دوشاخه‌ی متصل (`PowerRounded`) و در سایر حالت‌ها از آیکون دوشاخه‌ی جدا (`PowerOffRounded`) استفاده می‌شود.
- Tooltip آیکون وضعیت باید متن خطا را نشان دهد. خطا نباید در Alert یا Box جداگانه داخل کامپوننت نمایش داده شود.
- Toolbar در زیر تصویر قرار دارد و شامل دکمه‌های آیکونی است؛ متن دکمه‌ها فقط در Tooltip نمایش داده می‌شود.
- دکمه‌ی اتصال و قطع اتصال یک دکمه‌ی toggle است.
- تغییر پروتکل با یک فلش کوچک انجام می‌شود و از WebRTC به HLS یا برعکس سوییچ می‌کند.
- کنترل‌های native ویدئو، دکمه‌ی Play/Pause و نوار Progress به‌صورت پیش‌فرض مخفی هستند.
- ROI و همه‌ی دکمه‌ها باید مستقل از هم قابل نمایش یا مخفی‌شدن باشند.

### Props قابل تنظیم

```ts
type CameraStreamPreviewProps = {
  camera: Camera;
  language: Language;
  viewer: string;
  size?: number | { width: number | string; height: number | string };
  showPlaybackControls?: boolean; // پیش‌فرض false
  showStatus?: boolean;            // پیش‌فرض true
  showConnectionButton?: boolean;  // پیش‌فرض true
  showModeSwitcher?: boolean;      // پیش‌فرض true
  showRoiAction?: boolean;         // پیش‌فرض true
};
```

برای استفاده فقط به‌عنوان نمایشگر WebRTC بدون Toolbar:

```tsx
<CameraStreamPreview
  camera={camera}
  language={language}
  viewer={viewerId}
  showConnectionButton={false}
  showModeSwitcher={false}
  showRoiAction={false}
  showPlaybackControls={false}
/>
```

برای نمایش کنترل‌های native مرورگر:

```tsx
<CameraStreamPreview
  camera={camera}
  language={language}
  viewer={viewerId}
  showPlaybackControls
/>
```

### رفتار فعلی اتصال و reconnect

`CameraStreamPreview` هنگام اجرای `connect` ابتدا session قبلی همان `cameraId` و `viewerId` را با `disconnect` آزاد می‌کند و تا حدود ۱٫۵ ثانیه برای رسیدن وضعیت به `Disconnected` بررسی می‌کند. این کار برای reconnect بعد از بستن صفحه یا قطع اتصال قبلی ضروری است.

- در صورت دریافت خطای ثبت‌شدن قبلی دوربین، کامپوننت session قبلی را دوباره آزاد می‌کند و حداکثر سه بار با فاصله‌ی افزایشی تلاش می‌کند.
- در صورت شکست نهایی، state به `Failed` می‌رود و متن خطا فقط در Tooltip آیکون وضعیت نمایش داده می‌شود.
- WebRTC فقط وقتی `status.state === "Connected"` باشد reader را ایجاد می‌کند و در cleanup با `reader.close()` می‌بندد.
- HLS قبل از ساخت player، manifest را حداکثر ۳۰ ثانیه با فاصله‌ی ۵۰۰ میلی‌ثانیه بررسی می‌کند تا خطای زودهنگام «stream آماده نشد» ایجاد نشود.
- در زمان فعال‌بودن stream، اگر وضعیت `Connected` باشد وضعیت Backend هر ۱۵ ثانیه refresh می‌شود تا فشار روی API کم بماند؛ در وضعیت‌های `Connecting`، `Stopping` یا `Failed` فاصله‌ی بررسی ۲٫۵ ثانیه است. در وضعیت `Failed` آدرس‌های stream پاک و player متوقف می‌شوند.

این رفتارها باید هنگام استخراج منطق اتصال به hook یا کامپوننت دیگری نیز حفظ شوند.

در صفحه‌ی `CameraEquipmentWorkspace`، شناسه‌ی viewer برای تست دوربین بین reloadها در `localStorage` و `sessionStorage` نگه‌داری می‌شود؛ بنابراین برای هر tab یا نمونه‌ی مستقل، در صورت نیاز باید viewer اختصاصی ارسال شود.

## تنظیم Base URL

Base URL سرویس را در configuration پروژه‌ی React قرار دهید:

```env
VITE_PARKING_SERVICE_URL=http://localhost:3001
```

یا در صورت استفاده از Create React App:

```env
REACT_APP_PARKING_SERVICE_URL=http://localhost:3001
```

همه‌ی endpointهای این سند نسبت به همین Base URL هستند.

## مدل داده‌ی دوربین

UI برای هر دوربین حداقل اطلاعات زیر را نگه‌داری کند:

```ts
type Camera = {
  cameraId: string;
  name: string;
  rtspUrl: string;
  enabled?: boolean;
};
```

`cameraId` باید یکتا باشد و فقط شامل حروف انگلیسی، عدد، `_`، `-`، `.`، `:` باشد.

مثال:

```json
{
  "cameraId": "gate-entrance-1",
  "name": "دوربین ورودی اصلی",
  "rtspUrl": "rtsp://user:password@192.168.1.20:554/stream1"
}
```

## viewerId

هر نمونه‌ی UI که به دوربین وصل می‌شود باید یک `viewerId` داشته باشد. این شناسه برای شمارش clientهای متصل استفاده می‌شود.

ویژگی‌های `viewerId`:

- در طول عمر همان tab ثابت باشد.
- بین دو tab متفاوت باشد.
- برای هر دوربین در همان tab می‌تواند یکسان باشد.
- اطلاعات حساس داخل آن قرار نگیرد.

پیشنهاد:

```ts
const viewerId = sessionStorage.getItem("parking-viewer-id")
  ?? crypto.randomUUID();

sessionStorage.setItem("parking-viewer-id", viewerId);
```

اگر `crypto.randomUUID()` در محیط هدف موجود نیست، از یک UUID یا مقدار تصادفی پایدار استفاده شود.

## API اتصال

### شروع اتصال

```http
POST /api/rtspcamera/connect
Content-Type: application/json
```

Request:

```json
{
  "cameraId": "gate-entrance-1",
  "rtspUrl": "rtsp://user:password@192.168.1.20:554/stream1",
  "viewerId": "browser-tab-123",
  "streamMode": "WebRTC"
}
```

نمونه‌ی TypeScript:

در کلاینت از `cameraApi.connect(camera, viewerId, streamMode)` استفاده شود؛
پیاده‌سازی مستقیم `fetch` در page یا component feature مجاز نیست. پاسخ باید
`status` و در صورت موجودبودن `streamUrl` و `webRtcUrl` را مصرف کند.

Response:

```json
{
  "status": {
    "cameraId": "gate-entrance-1",
    "state": "Connecting",
    "error": null,
    "viewerCount": 1,
    "streamUrl": "/api/rtspcamera/stream/gate-entrance-1/playlist.m3u8",
    "webRtcUrl": "/api/rtspcamera/webrtc/gate-entrance-1/whep/browser-tab-123",
    "lastStateChangeUtc": "2026-09-16T10:00:00Z"
  },
  "streamUrl": "/api/rtspcamera/stream/gate-entrance-1/playlist.m3u8",
  "webRtcUrl": "/api/rtspcamera/webrtc/gate-entrance-1/whep/browser-tab-123"
}
```

آدرس HLS کامل با ترکیب Base URL و `streamUrl` ساخته شود:

```ts
const hlsUrl = new URL(result.streamUrl, baseUrl).toString();
```

در شروع اتصال، وضعیت معمولاً `Connecting` است. UI باید قبل از شروع player، وضعیت را بررسی کند یا player را با retry محدود راه‌اندازی کند.

`streamMode` فقط دو مقدار معتبر دارد:

```ts
type StreamMode = "WebRTC" | "Hls";
```

اگر مقدار ارسال نشود، برای سازگاری با کلاینت‌های قدیمی، Backend آن را HLS در نظر می‌گیرد؛ کلاینت جدید باید صریحاً `WebRTC` ارسال کند.

## پخش WebRTC/WHEP

در حالت WebRTC، UI نباید مستقیماً به پورت MediaMTX یا آدرس RTSP وصل شود. از `webRtcUrl` پاسخ Connect استفاده کنید:

```text
/api/rtspcamera/webrtc/{cameraId}/whep/{viewerId}
```

این endpoint از متدهای زیر پشتیبانی می‌کند و همه‌ی آن‌ها باید به همان URL عمومی/proxy ارسال شوند:

| Method | کاربرد |
|---|---|
| `OPTIONS` | دریافت تنظیمات ICE/WHEP؛ session لازم نیست ایجاد شده باشد |
| `POST` | ارسال SDP offer و ایجاد session پخش |
| `PATCH` | ارسال trickle ICE candidateها |
| `DELETE` | بستن session WebRTC |

در پروژه‌ی فعلی از reader رسمی موجود در `src/vendor/mediamtx-reader.js` استفاده شده است:

```tsx
new window.MediaMTXWebRTCReader({
  url: resolveStreamUrl(webRtcUrl),
  onTrack: (event) => {
    video.srcObject = event.streams[0];
    void video.play();
  },
  onError: (error) => setError(String(error)),
});
```

reader باید در cleanup با `reader.close()` بسته شود. هنگام disconnect نیز ابتدا reader بسته شود و سپس API disconnect فراخوانی شود. WebRTC به‌دلیل استفاده از session مستقل برای هر viewer، pause یا قطع یک client نباید تصویر client دیگر را متوقف کند.

### قطع اتصال

```http
POST /api/rtspcamera/disconnect?cameraId=gate-entrance-1&viewerId=browser-tab-123
```

نمونه:

```ts
await fetch(
  `${baseUrl}/api/rtspcamera/disconnect?cameraId=${encodeURIComponent(camera.cameraId)}&viewerId=${encodeURIComponent(viewerId)}`,
  { method: "POST" }
);
```

قطع اتصال باید در موارد زیر انجام شود:

- کاربر روی دکمه‌ی قطع اتصال کلیک می‌کند.
- component دوربین از صفحه حذف می‌شود.
- کاربر از صفحه‌ی monitoring خارج می‌شود.
- قبل از تغییر دوربین یا RTSP URL.

اگر چند client به یک دوربین متصل باشند، قطع یک client باعث توقف stream مشترک نمی‌شود. stream فقط بعد از قطع آخرین client متوقف خواهد شد.

## وضعیت اتصال

### دریافت وضعیت یک دوربین

```http
GET /api/rtspcamera/status?cameraId=gate-entrance-1
```

### دریافت وضعیت همه‌ی دوربین‌ها

```http
GET /api/rtspcamera/allstatuses
```

مدل وضعیت:

```ts
type CameraStatus = {
  cameraId: string;
  state: "Disconnected" | "Connecting" | "Connected" | "Failed" | "Stopping";
  error: string | null;
  viewerCount: number;
  streamUrl: string;
  webRtcUrl?: string;
  lastStateChangeUtc: string;
};
```

رابط کاربری وضعیت‌ها:

| وضعیت | نمایش پیشنهادی |
|---|---|
| `Disconnected` | قطع شده، دکمه‌ی اتصال |
| `Connecting` | آیکون اتصال زرد و Tooltip وضعیت/خطا |
| `Connected` | آیکون اتصال سبز و تصویر زنده |
| `Failed` | آیکون اتصال قرمز؛ متن خطا فقط در Tooltip |
| `Stopping` | آیکون اتصال زرد |

در صفحه‌ی monitoring، وضعیت دوربین‌های `Connected` هر ۱۵ ثانیه و وضعیت‌های انتقالی یا خطادار هر ۲٫۵ ثانیه refresh شوند. Polling بعد از unmount شدن صفحه حتماً متوقف شود.

## پخش HLS با React

برای HLS نیز از `CameraStreamPreview` استفاده شود و player موازی در page ساخته
نشود. کامپوننت فعلی با `hls.js` کار می‌کند، در Safari از پخش native استفاده می‌کند
و کنترل‌های native با `showPlaybackControls` فعال می‌شوند. lifecycle player باید
در همان component و با cleanup کامل مدیریت شود؛ دستکاری مستقیم video فقط برای
اتصال فنی به API مرورگر مجاز است.

## معماری پیشنهادی UI

پیشنهاد می‌شود این componentها ساخته شوند:

```text
CameraMonitoringPage
├── CameraToolbar
├── CameraGrid
│   └── CameraCard
│       ├── CameraStatusBadge
│       ├── CameraStreamPreview
│       ├── RoiCanvasOverlay
│       └── CameraControls
└── CameraConnectionError
```

و این hookها یا serviceها وجود داشته باشند:

```text
useCameraConnection(camera)
useCameraStatuses(cameraIds)
useCameraRois(cameraId, viewerId)
cameraApi.connect()
cameraApi.disconnect()
cameraApi.getStatus()
cameraApi.getAllStatuses()
cameraApi.getRois()
cameraApi.saveRoi()
cameraApi.deleteRoi()
```

state اتصال هر دوربین باید مستقل باشد؛ قطع یا خطای یک دوربین نباید player دوربین‌های دیگر را reset کند.

## ROI و Overlay

ROI داخل ویدئوی HLS یا WebRTC ذخیره نمی‌شود. کامپوننت فعلی ROIهای دریافت‌شده از Backend را به‌صورت overlay روی تصویر رسم می‌کند. برای پیاده‌سازی عمومی overlay می‌توان از Canvas یا elementهای absolute استفاده کرد:

```text
container position: relative
video     position: absolute; inset: 0
overlay   position: absolute; inset: 0; pointer-events: ...
```

مختصات ROI نسبی هستند و باید بین صفر و یک ذخیره شوند:

```ts
type Roi = {
  id: string;
  cameraId: string;
  viewerId: string;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
```

تبدیل مختصات نسبی به مختصات Canvas:

```ts
const left = roi.x * canvas.width;
const top = roi.y * canvas.height;
const width = roi.width * canvas.width;
const height = roi.height * canvas.height;
```

رسم ROI:

```ts
ctx.strokeStyle = roi.color || "#ff0000";
ctx.lineWidth = 2;
ctx.strokeRect(left, top, width, height);

ctx.font = "14px sans-serif";
ctx.fillStyle = roi.color || "#ff0000";
ctx.fillText(roi.text || "", left, Math.max(14, top - 5));
```

در نسخه‌ی فعلی `CameraStreamPreview`:

- ROIها بعد از اتصال از `GET /api/rtspcamera/rois` خوانده می‌شوند.
- دکمه‌ی ROI یک ROI نمونه با متن «محدوده تشخیص»، رنگ سبز و مختصات پیش‌فرض ایجاد می‌کند.
- ROIهای موجود به‌صورت مستطیل رنگی نمایش داده می‌شوند.
- رسم با drag، ویرایش متن/رنگ/مختصات و حذف مستقیم ROI هنوز در این کامپوننت پیاده‌سازی نشده و باید به‌عنوان توسعه‌ی بعدی اضافه شود.

**وضعیت پوشش UI:** ناقص/نیازمند تکمیل. overlay و ایجاد ROI نمونه در UI موجود است،
اما این موارد هنوز وجود ندارند:

- رسم محدوده با drag روی تصویر؛
- ویرایش متن، رنگ و مختصات ROI موجود؛
- حذف مستقیم ROI از روی viewer؛
- تست component یا E2E برای چرخه‌ی کامل ایجاد، ویرایش و حذف ROI.

بنابراین معیار «نمایش ROIهای ذخیره‌شده» در وضعیت فعلی برقرار است، اما feature کامل
مدیریت ROI هنوز آماده‌ی تحویل نیست.

برای رسم تعاملی در توسعه‌ی بعدی:

1. pointer down مختصات شروع را ثبت کند.
2. pointer move مستطیل موقت را redraw کند.
3. pointer up مختصات نهایی را محاسبه و normalize کند.
4. در صورت ذخیره، ROI را با API ثبت کند.

ROIهای فعلی در حافظه‌ی سرویس هستند و با restart سرویس از بین می‌روند؛ UI نباید این داده‌ها را تنها منبع دائمی تنظیمات فرض کند.

## API مدیریت ROI

### دریافت ROIها

```http
GET /api/rtspcamera/rois?cameraId=gate-entrance-1&viewerId=browser-tab-123
```

### ایجاد یا ویرایش ROI

```http
POST /api/rtspcamera/roi
Content-Type: application/json
```

```json
{
  "cameraId": "gate-entrance-1",
  "viewerId": "browser-tab-123",
  "id": "roi-1",
  "text": "منطقه ورود",
  "color": "#00ff00",
  "x": 0.2,
  "y": 0.25,
  "width": 0.4,
  "height": 0.3
}
```

برای ایجاد ROI جدید، `id` را خالی بگذارید. سرویس برای آن ID تولید می‌کند.

### حذف ROI

```http
POST /api/rtspcamera/deleteroi?cameraId=gate-entrance-1&roiId=roi-1&viewerId=browser-tab-123
```

## مدیریت lifecycle در React

کامپوننت باید هنگام mount یا شروع اتصال، وضعیت `Connecting` را ثبت کند؛ نتیجه‌ی
اتصال را فقط در صورت لغو‌نشدن effect اعمال کند؛ در خطا `Failed` و پیام محدودشده
نمایش دهد؛ و در cleanup، polling، player، reader و session دوربین را آزاد کند.
تغییر `cameraId` یا `viewerId` باید ابتدا session قبلی را disconnect کند. اتصال‌های
هم‌زمان و retry بی‌نهایت مجاز نیستند.

نکات:

- از connectهای هم‌زمان تکراری برای یک دوربین جلوگیری شود.
- هنگام تغییر `cameraId` ابتدا دوربین قبلی disconnect شود.
- بعد از دریافت `Failed`، retry با فاصله‌ی افزایشی انجام شود؛ مثلاً ۲، ۵ و ۱۰ ثانیه.
- polling و event listenerها هنگام unmount پاک شوند.
- خطای قطع اتصال نباید باعث crash صفحه شود.

## رفتار چند client

اگر Client A و Client B هر دو به `cameraId = gate-1` وصل شوند:

- در حالت HLS، سرویس یک FFmpeg مشترک دارد.
- در حالت WebRTC، MediaMTX یک source مشترک برای دوربین و session مستقل برای هر viewer دارد.
- `viewerCount` برابر ۲ می‌شود.
- در HLS هر دو client از یک playlist استفاده می‌کنند؛ در WebRTC هر client session پخش مستقل دارد.
- pause در Client A فقط ویدئوی Client A را متوقف می‌کند.
- disconnect در Client A باعث قطع Client B نمی‌شود.
- پس از disconnect آخرین client، منبع مربوط به آن پروتکل متوقف یا آزاد می‌شود.

## امنیت و تجربه‌ی کاربری

- RTSP URL را در UI عمومی نمایش ندهید؛ چون ممکن است username/password داشته باشد.
- در log یا error message، password دوربین را نشان ندهید.
- هنگام نمایش خطای اتصال، URL کامل RTSP را به کاربر نشان ندهید.
- برای اتصال، loading state مشخص داشته باشید.
- برای هر کارت دوربین، آیکون وضعیت کابل و Tooltip خطا نمایش دهید؛ متن وضعیت اتصال در بالای کامپوننت لازم نیست.
- اگر تصویر دیر آماده شد، وضعیت `Connecting` را حفظ کنید و صفحه‌ی خالی یا خطای زودهنگام نشان ندهید.

## معیار پذیرش

وضعیت اجرای معیارها در checkout فعلی:

| معیار | وضعیت فعلی |
|---|---|
| اتصال و قطع اتصال دوربین | پیاده‌سازی شده |
| WebRTC پیش‌فرض و سوییچ به HLS | پیاده‌سازی شده |
| پخش HLS/WebRTC و native Safari | پیاده‌سازی شده؛ نیازمند تست محیط واقعی |
| وضعیت‌های اتصال و خطا | پیاده‌سازی شده |
| preview قابل تنظیم و toolbar اختیاری | پیاده‌سازی شده |
| چند دوربین و چند client | منطق UI پیاده‌سازی شده؛ نیازمند تأیید runtime سرویس |
| آزادسازی اتصال هنگام خروج | پیاده‌سازی شده در lifecycle React |
| نمایش overlay ROI | پیاده‌سازی شده |
| ایجاد ROI نمونه | پیاده‌سازی شده |
| drag، ویرایش و حذف تعاملی ROI | پیاده‌سازی نشده |
| تست کامل چرخه ROI | پیاده‌سازی نشده |
| عدم نمایش credential و RTSP URL کامل | رعایت UI؛ قرارداد logging و proxy نیازمند بررسی Backend |

تا زمان تکمیل ردیف‌های «پیاده‌سازی نشده»، وضعیت این feature «در حال تکمیل» است،
نه «آماده‌ی پیاده‌سازی کامل».

پیاده‌سازی UI زمانی کامل است که:

- کاربر بتواند یک دوربین را connect و disconnect کند.
- WebRTC به‌صورت پیش‌فرض استفاده شود و کاربر بتواند با فلش Toolbar به HLS سوییچ کند.
- تصویر HLS در Chrome/Edge با `hls.js` پخش شود.
- تصویر WebRTC با `MediaMTXWebRTCReader` و `webRtcUrl` پخش شود.
- Safari در صورت پشتیبانی native پخش شود.
- وضعیت‌های Connecting، Connected، Failed و Disconnected نمایش داده شوند.
- وضعیت با آیکون دوشاخه‌ی متصل/جدا و رنگی نمایش داده شود و متن خطا فقط در Tooltip آیکون باشد.
- اندازه‌ی پیش‌فرض Preview برابر ۲۰۰×۲۰۰ باشد و Preview کل عرض parent را اشغال نکند.
- دکمه‌های اتصال، سوییچ پروتکل، ROI و کنترل‌های native ویدئو قابل پیکربندی و اختیاری باشند.
- چند دوربین هم‌زمان بدون تداخل نمایش داده شوند.
- چند tab یا client بتوانند یک دوربین را ببینند.
- pause/play/mute روی هر client مستقل باشد.
- خروج از صفحه اتصال را آزاد کند.
- ROIهای ذخیره‌شده با مختصات نسبی، رنگ و متن روی تصویر نمایش داده شوند.
- در نسخه‌ی فعلی، دکمه‌ی ROI یک نمونه‌ی پیش‌فرض ایجاد می‌کند؛ drag، ویرایش و حذف تعاملی ROI هنوز جزو توسعه‌ی بعدی است.
- ROI با refresh وضعیت فعلی سرویس هماهنگ شود.
- خطای stream باعث از کار افتادن کل صفحه نشود.
