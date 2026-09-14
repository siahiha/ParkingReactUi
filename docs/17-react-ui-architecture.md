# معماری پیشنهادی UI React

**وضعیت:** تصمیم پیشنهادی برای شروع پروژه UI.  
**اصل انتخاب:** ساده‌ترین ابزارِ بالغی که مسئله را حل می‌کند انتخاب شود. هر وابستگی باید یک نیاز مشخص را پوشش دهد؛ کتابخانه‌های هم‌پوشان، state management سنگین و abstractionهای زودهنگام ممنوع‌اند.

## ۱. Stack نهایی پیشنهادی

| نیاز | انتخاب | دلیل |
|---|---|---|
| زبان و UI | React + TypeScript (`strict`) | type-safe بودن فرم‌ها، DTOها، enumها و عملیات حساس تردد/پرداخت؛ خوانایی و refactor امن‌تر |
| build | Vite | راه‌اندازی و build ساده و سریع برای یک SPA داخلی |
| مسیرها | React Router | layout، route guard و lazy loading صفحه‌ها |
| داده API | TanStack Query (React Query) | cache، loading/error، invalidate، pagination و refresh داده‌های سرور |
| فرم‌ها | React Hook Form + Zod | فرم‌های بزرگ با validation واضح و type-safe |
| ظاهر | MUI با theme RTL و فونت فارسی | دکمه، dialog، form و table استاندارد؛ مناسب UI اداری/عملیاتی |
| جدول | MUI Data Grid Community | جدول‌های اعضا، کارت، تردد و گزارش، بدون ساخت component اختصاصی از ابتدا |
| Mock | MSW | توسعه مستقل UI تا تحویل قرارداد واقعی Backend |
| تست | Vitest + React Testing Library + Playwright | تست واحد/component و سناریوی کامل مرورگر |

### مواردی که عمداً استفاده نمی‌شوند

- **Redux/Redux Toolkit:** در شروع نیاز نیست. داده‌های سرور با React Query و state کوچک UI با `useState`/`useReducer` یا Context مدیریت می‌شود.
- **Zustand:** فقط اگر بعداً state مشترک و پیچیده‌ی UI شکل گرفت؛ در شروع اضافه نشود.
- **Axios:** `fetch` استاندارد مرورگر و یک wrapper کوچک API کافی است.
- **چند design system یا چند table/form library:** فقط MUI Data Grid و React Hook Form/Zod استفاده شود.
- **SSR/Next.js:** برای dashboard داخلیِ authenticated و Backend جدا، در شروع نیازی نیست. Vite SPA انتخاب ساده‌تر است.
- **PWA/offline queue:** خارج از scope است؛ سامانه فقط آنلاین است.

## ۲. چرا TypeScript الزامی است

این UI با entityهای متعدد، enum، دسترسی، پرداخت، تردد و قراردادهای Backend کار می‌کند. TypeScript باید اجباری باشد تا خطاهای نوعی مانند ارسال فیلد اشتباه، استفاده از مبلغ با نوع نادرست یا اشتباه در وضعیت عملیات، پیش از اجرا مشخص شوند.

تنظیمات حداقلی:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

از `any` استفاده نشود. پاسخ API ابتدا با type/schema اعتبارسنجی و سپس وارد UI شود.

## ۳. نقش React Query

React Query برای **داده‌های سرور** استفاده می‌شود، نه برای همه stateهای برنامه:

- لیست‌ها و جزئیات: اعضا، کارت‌ها، تعرفه‌ها، پارکینگ، تردد، گزارش و تنظیمات؛
- cache و invalidate پس از ذخیره/حذف؛
- pagination، filter و refetch کنترل‌شده؛
- snapshot وضعیت تجهیزات و تصاویر metadata؛
- نمایش یکپارچه‌ی `pending`، `error` و `success`.

### تنظیمات ایمن و ساده

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});
```

- `GET`های غیرحساس می‌توانند یک retry محدود داشته باشند.
- mutationهای ورود، خروج، پرداخت، حذف و فرمان تجهیز **retry خودکار ندارند**.
- هر retry برای mutation حساس فقط بعد از قرارداد `idempotencyKey` و تصمیم صریح Backend فعال می‌شود.
- React Query جای WebSocket/SSE نیست؛ realtime تجهیزات در یک hook کوچک جداگانه مصرف می‌شود و پس از دریافت event فقط queryهای مرتبط را invalidate می‌کند.

## ۴. ساختار پوشه‌ها

```text
src/
  app/                 # router، providerها، theme و QueryClient
  layouts/             # AppLayout، AuthLayout
  features/
    auth/
    dashboard/
    parking/
    members/
    cards/
    traffic/
    payments/
    monitoring/
    reports/
    settings/
  shared/
    api/               # fetch wrapper و client تولیدشده از OpenAPI
    ui/                # componentهای کوچک و reusable مبتنی بر MUI
    lib/               # تاریخ شمسی، فرمت مبلغ، error mapping
    types/             # typeهای مشترک
  mocks/               # handlerهای MSW و داده نمونه
```

هر feature فقط این چهار لایه را کنار هم نگه می‌دارد: `api`، `components`، `pages` و `types`. از ایجاد لایه‌های زیاد مانند service/repository/manager برای هر فرم خودداری شود، مگر منطق مشترک واقعی وجود داشته باشد.

## ۵. قواعد پیاده‌سازی مهم

### API و قرارداد Backend

- یک wrapper کوچک روی `fetch` مسئول base URL، header احراز هویت، parse پاسخ و mapping خطا باشد.
- با تحویل `openapi.json`، type و client API تولید شوند؛ DTOهای دست‌نویس تکراری حذف شوند.
- UI مبلغ را محاسبه نمی‌کند؛ فقط ورودی را ارسال و خروجی authoritative Backend را نمایش می‌دهد.
- برای APIهای تحویل‌نشده، MSW و type موقتِ مشخص استفاده شود؛ mock با برچسب واضح از API واقعی جدا باشد.

### state و مجوز

- `AuthContext` فقط session، کاربر، پارکینگ جاری و درب جاری را نگه دارد.
- داده‌های فهرستی یا entityها در Context/Redux کپی نشوند؛ React Query منبع آن‌هاست.
- route guard فقط تجربه UI را کنترل می‌کند؛ API مرجع نهایی authorization است.

### فرم و جدول

- هر فرم با React Hook Form و schema Zod نوشته شود؛ پیام خطای field از schema یا پاسخ Backend نمایش داده شود.
- فرم‌های CRUD در dialog یا صفحه مستقل، بر اساس پیچیدگی، طراحی شوند؛ برای فرم‌های بزرگ مانند عضو و تعرفه، صفحه مستقل با tab مناسب‌تر است.
- Data Grid باید server-side pagination/filter/sort مصرف کند؛ دریافت همه داده‌ها در Browser ممنوع است.

### realtime، تصویر و تجهیزات

- یک `useDeviceEvents` یا `useRealtimeEvents` کوچک برای اتصال eventها کافی است؛ به store سراسری بزرگ تبدیل نشود.
- stream تصویر در component دوربین مدیریت می‌شود؛ در unmount، تغییر درب و قطع ارتباط، stream و object URL آزاد می‌شوند.
- UI فقط command API را فراخوانی می‌کند و وضعیت `accepted/executing/succeeded/failed/timeout` را نشان می‌دهد؛ ارتباط سخت‌افزاری وظیفه Backend/Agent است.

## ۶. کیفیت، امنیت و تحویل

- ESLint، Prettier و typecheck در CI اجباری باشند.
- تست unit برای فرمت مبلغ/تاریخ، mapping خطا و guardها؛ تست component برای فرم‌ها؛ Playwright برای ورود، ورود خودرو، خروج، پرداخت نامشخص و عدم مجوز.
- token و credential تجهیزات در LocalStorage یا source code ذخیره نشوند. روش session باید مطابق قرارداد Backend باشد.
- routeها lazy-load شوند؛ تصویرهای بزرگ lazy-load شوند؛ buffer تصویر محدود باشد.

## ۷. ترتیب پیشنهادی پیاده‌سازی

1. اسکلت Vite، TypeScript strict، MUI RTL، Router، QueryClient، layout و mock API.
2. Login، session/context، انتخاب پارکینگ و guardها.
3. componentهای مشترک: صفحه، dialog تأیید، فرم، table، error/empty/loading state.
4. CRUDهای ساختار پارکینگ، کاربران، اعضا و کارت‌ها.
5. تردد، مدیریت سوابق، پرداخت و مجوز خروج با mockهای دقیق.
6. مانیتورینگ، تصاویر و تجهیزات پس از تحویل قرارداد Backend.
7. گزارش‌ها، import و تست end-to-end؛ سپس اتصال مرحله‌ای به API واقعی.

## ۸. معیار «ساده و قابل نگهداری»

هر package جدید باید پاسخ این سؤال را داشته باشد: «کدام نیاز مستندشده را حل می‌کند که ابزارهای فعلی حل نمی‌کنند؟» اگر پاسخ روشن نیست، اضافه نشود. هدف، featureهای کوچک، typeهای روشن، queryهای قابل نام‌گذاری و componentهای MUI ساده است؛ نه معماری پیچیده.
