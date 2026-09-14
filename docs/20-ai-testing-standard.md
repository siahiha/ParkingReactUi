# استاندارد تست UI برای عامل هوش مصنوعی

## هدف

این سند قرارداد اجرای تست برای عامل هوش مصنوعی است. عامل باید ابتدا تست‌های خودکار موجود را اجرا کند، سپس سناریوهای این سند را با داده‌ی mock یا محیط staging اجرا کند و هر مورد ناقص را با شواهد، نه با حدس، گزارش دهد.

## دستورات اجباری

در پوشه‌ی `EosParkingReactUi`:

```text
npm ci
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

اگر محیط Backend یا مرورگر در دسترس نبود، عامل باید همان مورد را به‌عنوان `blocked-by-environment` گزارش کند؛ حذف یا skip کردن تست بدون دلیل مجاز نیست.

## مرز تست‌ها

| لایه | مسئولیت | ابزار |
|---|---|---|
| قرارداد و helper | parsing پاسخ، permission، خطا، timeout و formatter | Vitest |
| component | validation فرم، stateهای loading/error، keyboard و accessibility پایه | Vitest + RTL |
| workflow | ورود، session، logout، تغییر رمز و navigation | Playwright |
| integration | قرارداد واقعی endpoint، 401/403، timeout و پاسخ malformed | staging یا MSW |

## قواعد داده‌ی تست

- تست واحد نباید به شبکه، ساعت واقعی، credential واقعی یا تجهیزات متصل باشد.
- هر تست باید fixture مستقل و قابل تکرار داشته باشد.
- موفقیت Login فقط وقتی معتبر است که response type صریح، user معتبر و token معتبر وجود داشته باشد.
- پاسخ ناقص، token خالی، 401، 403، timeout، قطع شبکه و JSON نامعتبر باید سناریوی مستقل داشته باشند.
- permissionها باید با نام پایدار مانند `system.parking.manage` بررسی شوند؛ تست نباید به عدد bitmask یا شناسه‌ی سطح دسترسی وابسته باشد.
- مقدارهای mock صفحه Home نباید به‌عنوان داده‌ی واقعی یا معیار صحت API تلقی شوند.

## سناریوهای حداقلی پذیرش

### Login و session

1. submit با هر دو فیلد خالی، بدون درخواست شبکه، خطای هر دو فیلد را نمایش می‌دهد.
2. پاسخ 401 پیام احراز هویت ناموفق را نمایش می‌دهد.
3. پاسخ malformed یا بدون token موفق تلقی نمی‌شود.
4. ورود موفق فقط با permission نام‌دار، منوی مربوط را قابل مشاهده می‌کند.
5. session نامعتبر پس از refresh صفحه به Login برمی‌گردد.
6. logout token، session و route محافظت‌شده را پاک می‌کند.

### API و پایداری

1. درخواست JSON header درست و token جاری را ارسال می‌کند.
2. پاسخ 204، JSON معتبر و متن غیر JSON رفتار مشخص دارند.
3. خطای HTTP شامل status و body قابل بررسی است.
4. درخواست طولانی با timeout لغو می‌شود.
5. لغو درخواست توسط component باعث state update بعد از unmount نمی‌شود.

### کیفیت UI

1. تمام actionهای icon-only دارای `aria-label` هستند.
2. مسیرهای اصلی با keyboard قابل اجرا هستند.
3. حالت loading دکمه‌ی mutation را قفل می‌کند.
4. صفحه در فارسی/انگلیسی و RTL/LTR بدون overflow افقی کار می‌کند.
5. برای هر صفحه‌ی متصل به API، loading، empty، error و unauthorized جداگانه قابل مشاهده است.

## موارد خارج از اختیار UI

این موارد تا تحویل Backend قابل تست production نیستند:

- refresh/revoke واقعی session؛
- permission و authorization server-side؛
- idempotency و operation tracking؛
- قرارداد رسمی پرداخت و تجهیزات؛
- حذف رمزنگاری legacy از Browser؛
- realtime تجهیزات و تصاویر؛
- داده‌ی واقعی KPIها و صفحات workflow.

عامل باید این موارد را `backend-contract-required` گزارش کند، نه اینکه با mock موفقیت آن‌ها را تأییدشده اعلام کند.
