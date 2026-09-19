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
| منو و route | `22-menu-architecture-and-ui-contract.md` | تغییر navigation یا permission |

## نگاشت حوزه به سند

| کلیدواژه/حوزه | سند اصلی | منابع تکمیلی |
|---|---|---|
| login، session، dashboard | `01-authentication.md` | `02-dashboard-and-navigation.md`، `21-implementation-progress-and-regression-policy.md` |
| MainForm، permission، parking context | `03-main-form-overview.md` | `04-users-and-access.md`، `16-final-review-and-delivery-gates.md` |
| parking، floor، section، space، zone | `03-parking-configuration.md`، `23-parking-zones.md` | `11-remaining-forms.md` |
| user، access level | `04-1-access-level-form.md`، `04-2-users-form.md` | `04-users-and-access.md` |
| member، membership، card | `05-members-and-cards.md` | `10-shared-ui-components.md`، `11-remaining-forms.md` |
| traffic، payment، exit، manual traffic | `06-traffic-and-payment.md`، `12-manual-traffic-control-form.md` | `14-web-backend-requests.md` |
| monitoring، equipment، RTSP، WebRTC، HLS، ROI | `07-monitoring-and-devices.md`، `24-rtsp-camera-ui-integration.md` | `11-remaining-forms.md` |
| reports | `08-reports.md` | `02-dashboard-and-navigation.md`، `11-remaining-forms.md` |
| shared components، grid، filter، plate، money | `10-shared-ui-components.md` | `18-ui-design-system.md` |
| backend contract، missing endpoint، status code | `14-web-backend-requests.md` | سند تخصصی همان feature |
| Windows audit و scope | `15-windows-source-audit.md` | `03-main-form-overview.md`، `16-final-review-and-delivery-gates.md` |

## وضعیت منابع

- `00` مرجع قواعد است، نه شرح یک feature.
- `21` تنها مرجع خلاصه‌ی وضعیت فعلی UI و موارد باز است.
- `23` و `24` اسناد تطبیق تخصصیِ به‌روز برای زون و دوربین هستند.
- اگر دو سند درباره‌ی status یک feature اختلاف داشتند، سند تخصصیِ جدیدتر و سپس
  کد فعلی مرجع بررسی است؛ اختلاف باید در `21` ثبت شود.
