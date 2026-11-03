# قرارداد معماری منوها

قرارداد قطعی منوهای Home وب، شامل ریشه‌ها، زیرگروه‌ها، آیتم‌ها، routeها، گزارش‌ها، visibility، ترجمه و رفتار responsive، در [سند مرجع Home](25-home.md) ثبت می‌شود.

این سند عمداً جزئیات قرارداد را تکرار نمی‌کند. هر تغییری در مدل منو یا route باید ابتدا در سند ۲۵ و سپس در کد زیر اعمال و بررسی شود:

- `EosParkingReactUi/src/pages/HomeNavigation.tsx`
- `EosParkingReactUi/src/pages/homeMenuModel.tsx`
- `EosParkingReactUi/src/pages/Home.tsx`
- `EosParkingReactUi/src/pages/HomeFormRoutes.tsx`

اصول عمومی قابل اعمال:

- متن نمایشی فقط از resourceهای `i18next` خوانده شود؛ hard-code فارسی یا انگلیسی در مدل منو و JSX مجاز نیست.
- آیتم جدید باید کلید، label ترجمه‌شده، route، visibility و workspace یا وضعیت placeholder مشخص داشته باشد.
- renderer مشترک `HomeNavigation` باید reuse شود و برای یک آیتم CSS یا variant مستقل ساخته نشود.
- مسیر غیرمجاز باید در پوسته Home پیام unauthorized نشان دهد و نباید صرفاً با نمایش URL قابل استفاده یا mutation شود.
- authorization نهایی همیشه بر عهده Backend است و UI navigation جایگزین آن نیست.

برای جزئیات کامل به [قرارداد مرجع Home وب](25-home.md) مراجعه کنید.
