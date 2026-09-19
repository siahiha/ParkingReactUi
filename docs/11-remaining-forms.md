# مستندات فرم‌های باقی‌مانده

**دامنه:** این سند همه‌ی فرم‌های باقی‌مانده‌ی محصول را پوشش می‌دهد، به‌جز فرم اصلی کنترل تردد که در سند مستقل خود بررسی می‌شود. جزئیات از فایل فرم، Designer و endpointهای مصرف‌شده استخراج شده است؛ method رسمی HTTP و schema کامل API هرجا در پروژه موجود نبوده، با وضعیت ناقص ثبت شده است.

## ۱. ساختار پارکینگ

### `ParkingFloorForm`

- هدف: مدیریت طبقات پارکینگ و جای‌پارک‌های وابسته.
- ورودی: `ParkingEntity` و شناسه پارکینگ.
- UI: جدول طبقات، پنل ایجاد/ویرایش، انتخاب نوع جای‌پارک و عملیات جدید، ویرایش، حذف و لغو.
- جای‌پارک‌ها در فرم طبقه قابل افزودن، ویرایش و حذف هستند. برای ساخت گروهی نیز الگوی بازه‌ای وجود دارد؛ با واردکردن پیشوند و عدد شروع/پایان، نام‌هایی مانند `A1` تا `A10` ساخته می‌شوند و عنوان‌های تکراری پذیرفته نمی‌شوند.
- workflow: دریافت طبقات و انواع جای‌پارک، انتخاب ردیف، ویرایش، مدیریت جای‌پارک‌های وابسته، اعتبارسنجی، ذخیره و refresh جدول.
- APIها: `GetParkingFloors`، `GetParkingFloorById`، `GetParkingParkSpaceKinds`، `SaveParkingFloor`، `DeleteParkingFloor`، `CheckUsedParkingSpace`.
- قواعد: حذف طبقه در صورت استفاده‌ی جای‌پارک باید کنترل شود؛ وابستگی قبل از حذف بررسی می‌شود.
- مجوزهای مشاهده‌شده: ایجاد/ویرایش و حذف طبقه؛ نام نهایی permission نیازمند registry رسمی است.
- وضعیت پوشش: UI و endpointها مشخص؛ مدل وابستگی، status code، خطای کامل و pagination ناقص.

### `ParkingSectionForm`

- هدف: مدیریت بخش/زون پارکینگ در context پارکینگ جاری.
- UI: فهرست بخش‌ها، Popup ایجاد/ویرایش، عنوان، توضیحات، انتخاب طبقه و جدول انتخاب چندتایی جای‌پارک‌های آزاد همان طبقه.
- در حالت ویرایش، طبقه و جای‌پارک‌های تخصیص‌یافته از `ParkSpaces` رکورد زون خوانده می‌شوند؛ جای‌پارک‌های متعلق به زون‌های دیگر قابل انتخاب نیستند.
- workflow: دریافت طبقات به‌همراه `ParkSpaces`، دریافت بخش‌ها، انتخاب طبقه/بخش، انتخاب یا لغو تخصیص جای‌پارک، ایجاد یا ویرایش و حذف پس از تأیید.
- APIها: `GetParkingFloors`، `GetParkingSections`، `SaveParkingSection`، `DeleteParkingSectionById`.
- بدنه‌ی ذخیره شامل `ParkingId`، `Title`، `Description` و آرایه‌ی `ParkSpaces` با شناسه‌ی جای‌پارک‌های انتخاب‌شده است.
- وابستگی: بخش به طبقه و پارکینگ وابسته است؛ حذف وابسته و اثر آن بر تردد باید backend کنترل شود.
- جزئیات تطبیق Windows/Backend/React: [مستند کامل زون‌های پارکینگ](23-parking-zones.md).
- وضعیت پوشش: Popup وب و workflow اصلی CRUD پیاده‌سازی شده؛ schema رسمی خطا و مجوز backend همچنان نیازمند تأیید است.

### `ParkingParkSpaceKindForm`

- هدف: تعریف انواع جای‌پارک.
- UI: فهرست/ویرایش انواع جای‌پارک و ذخیره‌ی گروهی.
- APIها: `GetParkingParkSpaceKinds` و `SaveAllParkingParkSpaceKind`.
- workflow: بارگذاری انواع، تغییر مجموعه، تأیید و ارسال کل مجموعه.
- وضعیت پوشش: endpoint و عملیات گروهی مشخص؛ validation، حذف مستقل، مدل response و خطای ردیفی نیازمند بررسی است.

## ۲. درب و تعرفه

### `ParkingDoorForm`

- هدف: تعریف درب پارکینگ و اتصال تجهیزات آن.
- UI: جدول درب‌ها، پنل مشخصات، نام/کاربر/رمز، راهبند ورود و خروج، نوع درب، وضعیت و جدول تجهیزات متصل.
- عملیات: ایجاد، ویرایش، حذف با تأیید، افزودن تجهیز، حذف تجهیز از درب، لغو.
- اعتبارسنجی‌های مشاهده‌شده: مجوز ایجاد/ویرایش؛ نام کاربری و رمز؛ یکسان نبودن راهبند ورود و خروج؛ انتخاب نوع درب.
- APIها: `GetParkingDoors`، `GetParkingEquipments`، `SaveParkingDoor`، `DeleteParkingDoor`.
- وابستگی: `EquipmentForm` منبع تجهیزات قابل اتصال است؛ حذف درب نباید سوابق تردد را حذف کند.
- وضعیت‌ها: جدول loading/empty، پنل غیرفعال، خطای API، خطای validation و unsaved changes در قرارداد کامل نیست.
- وضعیت پوشش: endpointها و UI اصلی مشخص؛ schema `ParkingDoorEntity`، قوانین اتصال تجهیز و status code ناقص.

### `ParkingTariffForm`

- هدف: مدیریت تعرفه‌های پارکینگ و جزئیات نرخ ساعتی، شبانه‌روزی و عضویت.
- وضعیت سند: در حال تکمیل؛ مسیرهای فهرست، ذخیره، حذف و انواع عضویت از کنترلر/کلاینت بررسی شده‌اند. schema کامل خطا، status code و مجوزها هنوز نیازمند تأیید Backend است.
- UI فعلی وب: گرید فهرست تعرفه با فیلتر همه/عمومی/اعضا و ستون‌های عنوان، نوع، وضعیت فعال، پیش‌فرض و تاریخ اجرا. انتخاب ردیف، عمل‌های «ایجاد»، «ویرایش» و «حذف» را فعال می‌کند.
- فرم ایجاد/ویرایش: تنظیمات عمومی، هزینه‌های ورود، گردکردن، حداقل توقف شبانه‌روزی، بازه‌های نرخ روزانه، بازه‌های نرخ شبانه‌روزی و نوع‌های عضویت. در ویرایش، DTO کامل موجود در پاسخ فهرست برای hydrate فرم نگه‌داری می‌شود.
- بازه‌های نرخ ساعتی روزانه: فیلدهای «از» و «تا» از نوع ورودی متنی مدت با قالب `HH:mm` هستند؛ ساعت از `۰۰` تا `۹۹۹` و دقیقه از `۰۰` تا `۵۹` است. این ورودی تایم‌پیکر نیست و در payload به `StartTime`/`EndTime` با ثانیه تبدیل می‌شود.
- بازه‌های نرخ شبانه‌روزی: فیلدهای «از روز» و «تا روز» از نوع عدد صحیح نامنفی (`number`) هستند و در payload مستقیماً به `FromDay`/`ToDay` نگاشت می‌شوند.
- پیش‌فرض فرم ایجاد: `MaximumHostelryDuration` برابر `۸`؛ یک بازه‌ی روزانه‌ی `00:00` تا `01:00` با مبالغ صفر؛ و یک بازه‌ی شبانه‌روزی `۰` تا `۰` با مبالغ صفر برای همه‌ی انواع خودرو.
- افزودن بازه: بازه‌ی جدید روزانه با فیلدهای خالی و بازه‌ی جدید شبانه‌روزی با `۰` تا `۱` ایجاد می‌شود؛ حذف بازه از همان ردیف امکان‌پذیر است.
- اعتبارسنجی کلاینت: عنوان الزامی؛ حداقل توقف شبانه‌روزی بزرگ‌تر از صفر؛ حداقل یک بازه‌ی روزانه و شبانه‌روزی؛ پایان بازه‌ی روزانه بزرگ‌تر از شروع؛ قالب روزانه معتبر با دقیقه‌ی حداکثر ۵۹ و ساعت حداکثر ۹۹۹؛ روزهای شبانه‌روزی صحیح و نامنفی و پایان بزرگ‌تر یا مساوی شروع. کنترل هم‌پوشانی و قواعد کسب‌وکار تکمیلی در Backend نیازمند تأیید است.
- جریان ایجاد: بازکردن «ایجاد تعرفه»، اصلاح مقادیر پیش‌فرض در صورت نیاز، اعتبارسنجی و ارسال `POST api/Tariff/Save`؛ پس از موفقیت فرم بسته و گرید دوباره بارگذاری می‌شود.
- جریان ویرایش: انتخاب ردیف، بازکردن «ویرایش تعرفه»، حفظ `Id` و جزئیات بازه‌ها/عضویت، ارسال `POST api/Tariff/Save` و بارگذاری مجدد گرید.
- جریان حذف: انتخاب ردیف، تأیید صریح، ارسال `GET api/Tariff/Delete?id={id}` و بارگذاری مجدد گرید. حذف فیزیکی و کنترل استفاده باید از Backend تعیین شود.
- حالت‌های صفحه: loading در فهرست/ذخیره/حذف، empty، خطای دریافت و عملیات، غیرفعال‌شدن کنترل‌ها هنگام درخواست و لغو بدون تغییر.
- داده‌ی وابسته: انواع عضویت از `GET api/Member/GetMemberRegisterKindsByParkingId?parkingId={id}`؛ انواع جای‌پارک در فرم فعلی وب مصرف نمی‌شود.
- APIهای شناسایی‌شده: `GET api/Tariff/GetByParkingId?parkingId={id}`، `POST api/Tariff/Save`، `GET api/Tariff/Delete?id={id}` و در کنترلر Windows، `GET api/Tariff/SetActive?id={id}&value={bool}` و `GET api/Tariff/SetCurrent?id={id}&value={bool}`.
- قابلیت‌های Windows بدون دکمه‌ی مستقل در وب: فعال‌سازی و تعیین تعرفه‌ی جاری/پیش‌فرض (`SetActive`/`SetCurrent`)؛ وضعیت این قابلیت «ناقص/نیازمند تصمیم محصول» است.
- مدل داده‌ی مصرف‌شده: `Id`, `ParkingId`, `Title`, `Description`, `IsMemberRegisterKindTariff`, `IsActive`, `IsCurrent`, هزینه‌ها و مدت‌های ورود، `RoundingBorder`, `RoundingValue`, `MaximumHostelryDuration`, `TariffRanges`, `TariffHostelryDetails` و `MemberRegisterKinds`.
- وضعیت پوشش API: مسیر و methodهای فهرست، ذخیره، حذف و انواع عضویت در UI مصرف شده‌اند؛ schema دقیق response/error، status code، authorization، محدودیت حذف و قرارداد رسمی `SetActive`/`SetCurrent` ناقص/نیازمند تأیید است.

## ۳. شیفت

### `ParkingUserShiftForm`

- هدف: تخصیص کاربر به شیفت و درب فعال پارکینگ.
- UI: انتخاب کاربر، درب، شیفت/بازه و جدول تخصیص‌ها؛ عملیات ایجاد، ویرایش، حذف و ذخیره.
- APIها: `UserApi.Get`، `ParkingApi.GetParkingDoors`، `UserApi.GetUserWorkShifts`، `UserApi.SaveUserWorkShifts`.
- workflow: دریافت کاربران و درب‌ها، دریافت شیفت‌ها، انتخاب تخصیص، اعتبارسنجی تعارض و ذخیره.
- اثر سیستم: `CurrentUser.CurrentParking` و درب/شیفت تعیین‌شده، پیش‌شرط ورود و خروج دستی است.
- وضعیت پوشش: وابستگی به workflow تردد باید در سند تردد تکمیل شود؛ مدل تخصیص، قوانین تعارض، مجوز و status code ناقص.

## ۴. مانیتورینگ

### `MonitoringForm`

- هدف: نمایش زنده‌ی ترددها و وضعیت درب‌های پارکینگ.
- UI: فهرست تردد زنده، فیلتر نوع تردد/درب/تعداد، وضعیت درب‌ها و زمان آخرین به‌روزرسانی.
- APIها: `TrafficApi.GetMonitoringTraffics` و `ParkingApi.GetParkingDoorsLive`.
- lifecycle: دریافت اولیه و refresh دوره‌ای؛ توقف timer هنگام بسته‌شدن باید تأیید شود.
- وضعیت‌ها: online، stale، offline، empty و خطای API باید از هم جدا شوند؛ پیاده‌سازی فعلی قرارداد یکپارچه ندارد.
- وضعیت پوشش: UI و endpoint مشخص؛ interval، push/polling، pagination، retry و مدل خطا ناقص.

### `MonitoringAnprForm`

- هدف: نمایش و مدیریت رکوردهای اخیر تشخیص پلاک و تصویر آن‌ها.
- UI: فهرست رکورد، تصویر پلاک، انتخاب منبع ANPR و درب، فهرست پلاک اعضا و عملیات حذف تصاویر قدیمی.
- APIها: `GetAnprRecordWithPicTop20LastHour`، `GetLastMaxAnprId`، `DeleteOldAnprPics`، `GetAllMembersPlates`، `GetParkingDoors`، `GetParkingDoor`.
- workflow: دریافت آخرین شناسه و رکوردهای اخیر، refresh، فیلتر درب/منبع و حذف تصاویر قدیمی.
- وضعیت پوشش: retention، مجوز حذف، حجم تصویر، امنیت تصویر، retry و قرارداد stream ناقص.

### `ImportDataConfigurationForm`

- هدف: تنظیم آدرس وب‌سرویس ETS برای پارکینگ جاری.
- مسیر نسخه وب: آیتم `integration-settings` در زیرگروه «یکپارچه‌سازی سامانه‌ها» و workspace
  `IntegrationSettingsWorkspace`.
- UI نسخه وب: دریافت مقدار `EtsDataProviderURL`، ورودی URL با اعتبارسنجی سمت کلاینت، ذخیره،
  لغو تغییرات و نمایش حالت‌های loading/error/success/unsaved changes. مقدار خالی برای حذف
  تنظیم اتصال مجاز است.
- API قابل اتکا: `GET api/Parking/Get?id={parkingId}` برای دریافت و `POST api/Parking/Save`
  با payload پارکینگ جاری برای ذخیره.
- رفتار Windows که مستقیماً منتقل نشده است: تست واقعی اتصال با `ETSData.TestConnection` و
  `GetMembers` در Windows انجام می‌شود. endpoint رسمی معادل برای Backend وب در کد موجود نیست؛
  اتصال مستقیم Browser به ETS نیز مجاز نیست. این بخش **ناقص/نیازمند تأیید Backend** است.
- وضعیت پوشش API: فهرست و ذخیره endpoint مشخص هستند؛ schema کامل parking DTO، مجوز ذخیره،
  status code و endpoint تست ارتباط نیازمند تأیید رسمی است.

### `ImportMembersForm` در حالت Excel

- هدف: خواندن اطلاعات پرسنلی از فایل و انتقال رکوردهای معتبر به اعضای پارکینگ جاری.
- مسیر نسخه وب: آیتم `excel-import` در زیرگروه «یکپارچه‌سازی سامانه‌ها» و workspace
  `ExcelPersonnelImportWorkspace`.
- UI نسخه وب: انتخاب فایل، نمایش نام/حجم، preview و parsing سبک CSV/TSV، بررسی رکوردها،
  جدول نتیجه با فیلتر ستونی مشترک، انتخاب رکوردهای معتبر و ثبت نهایی. رکوردهای دارای status
  خطا قابل انتخاب نیستند و همه انتخاب‌ها پیش از import به Backend ارسال می‌شوند.
- workflow مشاهده‌شده Windows: Excel با `ImportExcel` خوانده و هر ردیف به ترتیب
  `MemberCode`, `CardNumber`, `FirstName`, `LastName`, `Address`, `NationalCode`,
  `PhoneNumber` نگاشت می‌شود؛ سپس `CheckingExternalMember/{parkingId}` و بعد از انتخاب،
  `ImportMembersExternalSource/{parkingId}` فراخوانی می‌شوند.
- APIهای مصرف‌شده در نسخه وب: `POST api/Member/CheckingExternalMember/{parkingId}` و
  `POST api/Member/ImportMembersExternalSource/{parkingId}`. نام مسیر از `ApiAddress` در
  فرم Windows استخراج شده و schema رسمی request/response، status code، مجوز و audit
  **ناقص/نیازمند تأیید** است.
- پیاده‌سازی وب با parser محدود و feature-local `xlsx` فایل‌های `.xls`، `.xlsx`، `.csv` و
  `.tsv` را در حافظه می‌خواند و فقط هفت ستون قراردادی فرم Windows را به مدل
  `ExternalMember` نگاشت می‌کند؛ فایل به Browser storage یا log نوشته نمی‌شود. upload فایل
  به Backend انجام نمی‌شود و فقط رکوردهای تبدیل‌شده به endpointهای JSON ارسال می‌شوند.
- وضعیت این بخش: UI و parsing فایل آماده است؛ schema رسمی نتیجه‌ی بررسی، status code، مجوز،
  audit و خطاهای ردیفی Backend همچنان **ناقص/نیازمند تأیید** است.

## ۵. اعضا و کارت

### `MemberKindForm`

- هدف: تعریف انواع عضویت.
- UI: جدول انواع عضویت، پنل نام/توضیح و CRUD.
- ترتیب چینش مرجع WinForms در پنل ویرایش، از بالا به پایین: عنوان و نوع عضویت در بخش بالایی؛ GroupBox «حق عضویت / اعتبار» شامل نوع اعتبار، مبلغ، مدت زمان و مهلت عودت وجه؛ جدول تعرفه‌های مرتبط؛ و دکمه‌های تأیید/لغو در نوار پایین فرم. فرم واقعی Windows فیلد توضیحات ندارد؛ بنابراین توضیحات نباید در popup انواع عضویت نمایش داده یا ارسال شود.
- APIها: `GetMemberRegisterKindsByParkingId`، `SaveMemberRegisterKind`، `DeleteMemberRegisterKindById`.
- وضعیت پوشش: مدل، مجوز، محدودیت حذف نوع استفاده‌شده و خطای API نیازمند تکمیل.

### `MemberForm`

- هدف: مدیریت عضو، خودرو، پلاک، کارت، نوع عضویت، اعتبار و ثبت‌نام.
- UI: فهرست اعضا، جستجو، پنل مشخصات، خودروها/پلاک‌ها، کارت‌ها، ثبت‌نام، اعتبار و سوابق.
- APIها: `GetByParkingId`، `GetById`، `Save`، `DeleteById`، `AddMemberRegister`، `MembershipCreditCancellation`، `GetMemberRegisterKindsByParkingId`، `GetActiveCardsByParkingId`، `GetCardStatus`، `GetParkingParkSpacesById`، `GetParkingDoor`، `GetParkingDoorDevices`، `GetParkingEquipments`، `GetMemberCurrentCreditInfo` و `UserApi.Get`.
- workflowها: ایجاد/ویرایش عضو، افزودن خودرو و پلاک، تخصیص کارت و جای‌پارک، ثبت/لغو عضویت و مشاهده اعتبار.
- وضعیت پوشش: به‌دلیل گستردگی فرم نیازمند سند مستقل چندبخشی؛ مدل‌ها، تراکنش‌ها، خطاهای کسب‌وکار، audit و مجوزهای جزئی ناقص.

### `ParkingCardForm`

- هدف: ثبت، مشاهده، تخصیص و مدیریت وضعیت کارت‌های پارکینگ.
- UI نسخه وب: workspace متراکم شبیه فرم Windows با نوار عملیات بالای Grid، Grid مرکزی،
  شمارش رکورد و وضعیت تغییرات. فیلترها فقط از منوی سه‌نقطه و داخل همان سرستون طبق قرارداد
  مشترک `AppDataGrid` ارائه می‌شوند و فیلتر جداگانه‌ای بالای صفحه وجود ندارد.
- ایجاد، ویرایش، حذف، اعمال تغییرات، لغو تغییرات و refresh فقط از بالای Grid انجام می‌شوند و برای CRUD Popup/Dialog استفاده نمی‌شود.
- ورودی جستجوی همهٔ ستون‌های قابل‌فیلتر در این Grid به‌صورت پیش‌فرض باز است؛ دوبارکلیک ردیف
  ویرایش همان ردیف را آغاز می‌کند. وجود draft تغییرکرده، قبل از ویرایش ردیف دیگر یا تغییر مسیر،
  دیالوگ انتخاب «ذخیره و ادامه»، «ادامه بدون ذخیره» یا «ماندن در صفحه» را فعال می‌کند و ناوبری
  پس از انتخاب ذخیره فقط بعد از موفقیت `SaveAll` انجام می‌شود.
- تغییرات به‌صورت draft در Grid نگه‌داری و با `CardApi.SaveAll` ارسال می‌شوند؛ حذف رکورد موجود پس از تأیید inline با `Id < 0` در payload ثبت می‌شود، مشروط به پشتیبانی رسمی Backend.
- کارت‌خوان، `ParkingApi.GetParkingDoor` و اتصال مستقیم تجهیزات از scope این فرم وب خارج هستند؛ شماره کارت دستی وارد می‌شود. تخصیص کارت به عضو از اطلاعات read-only عضو در Grid نمایش داده می‌شود و قرارداد مستقل آن باید با `MemberForm` هماهنگ باشد.
- APIهای مشاهده‌شده: `CardApi.GetByParkingId`، `CardApi.Save` و `CardApi.SaveAll`.
- وضعیت پوشش: نام endpoint مشخص، اما schema DTO، status code، خطای کارت تکراری، نتیجه‌ی ردیفی، مجوزهای تفکیکی و قرارداد رسمی حذف/گروهی ناقص است.

### `ControlListForm`

- هدف: مدیریت فهرست کنترلی خودروها/پلاک‌ها.
- UI: کنترل پلاک، جدول خودروها، افزودن، حذف و اعمال تغییرات.
- APIها: `GetAllControlListCars` و `SaveControlListCars`.
- وضعیت پوشش: مدل rule، علت کنترل، دسترسی و اثر بر ورود/خروج نیازمند بررسی workflow تردد.

## ۶. پرداخت و مجوز خروج

### `ManageTrafficRecordForm`

- هدف: جستجو و اصلاح سوابق ورود/خروج بدون ورود به workflow زنده‌ی `ManualTrafficControlForm`.
- ورودی: `ParkingEntity`؛ فهرست تعرفه و درب‌ها برای فرم بارگذاری می‌شود.
- UI: فیلتر بازه/درب/تعرفه، جدول صفحه‌بندی‌شده‌ی تردد، جستجوی خودرو با پلاک/کارت/کد عضو، پنل ایجاد یا ویرایش و عملیات حذف.
- ایجاد دستی: پلاک، پارکینگ، نوع خودرو، زمان ورود/خروج و درب با `CreateManualDump` ارسال می‌شود.
- **تصمیم محصول:** اگر اپراتور در workflow خروج، ورود متناظر پیدا نکند، UI همین صفحه را برای تعیین/ثبت ورود باز می‌کند؛ UI نباید ورود ساختگی خودکار ایجاد کند. API باید مجوز این اقدام را کنترل و در صورت نداشتن دسترسی پاسخ منع‌شده برگرداند.
- ویرایش: اطلاعات رکورد با `TrafficApi.Save` ذخیره می‌شود؛ لغو تغییرات پنل را می‌بندد.
- حذف: فقط رکوردهایی که ورود و خروج آن‌ها توسط کاربر ثبت شده باشد قابل حذف‌اند؛ پس از تأیید `TrafficApi.DeleteById` فراخوانی می‌شود.
- APIها: `TariffApi.GetByParkingId`، `ParkingApi.GetParkingDoors`، `TrafficApi.GetAllTraffics`، `GetCarTrafficInfo`، `CreateManualDump`، `Save` و `DeleteById`.
- وضعیت‌ها: loading، empty، validation، خطای API و تعارض حذف؛ status code و مجوز جزئی اصلاح/حذف نیازمند backend است.
- ارتباط با دو فرم مستثناشده: این فرم workflow ثبت زنده‌ی `ManualTrafficControlForm` را اجرا نمی‌کند، اما از مدل تردد و تعرفه/درب مشترک استفاده می‌کند.

### `PayForm`

- هدف: دریافت نتیجه‌ی پرداخت برای تردد.
- UI: مبلغ، روش پرداخت، اطلاعات تراکنش، تأیید و لغو؛ جزئیات دقیق از Designer و code-behind باید تکمیل شود.
- API: `TrafficApi.PayDump`.
- وضعیت پوشش: request/response تراکنش، idempotency، خطای پرداخت، rollback و callback ناقص.

### `ExitPermissionForm`

- هدف: مشاهده و ثبت مجوز خروج تردد.
- UI: فهرست/جستجوی ترددهای قابل مجوز، جزئیات و تأیید/رد مجوز.
- APIها: `TrafficApi.GetPermissions`، `GetTraffics` و `TrafficDumpUpdatePermission`.
- مسیر: از Dashboard برای `ExitPermissionManager`؛ ورود مستقیم از MainForm مشاهده نشده است.
- وضعیت پوشش: نقش و endpoint مشخص؛ مدل مجوز، audit، خطای هم‌زمانی و status code ناقص.

## ۷. پلاک، باربری و فرم‌های کمکی

### `PlateDetectedList`

- هدف: نمایش فهرست پلاک‌های تشخیص‌داده‌شده.
- UI/رفتار: فرم بسیار کوچک؛ منطق مستقل قابل‌توجه در code-behind مشاهده نشد.
- وضعیت پوشش: نیازمند تست UI و تعیین workflow واقعی.

### `NewCargoForm`

- هدف: ثبت و مدیریت اطلاعات بار خودرو در workflow تردد.
- APIها: `CargoRequiredData`، `GetCarInfo`، `IsCargoRegistered`، `Save` و `SetCarInfo`.
- وضعیت پوشش: فرم دارای منطق کسب‌وکاری است؛ مدل محموله، اقلام، validation، دسترسی و اثر ثبت بر تردد باید مستقل تکمیل شود.

### `AnprHoliday`

- فایل فرم وجود دارد اما code-behind آن فقط اسکلت است؛ workflow و API قابل مشاهده‌ای ندارد.
- وضعیت: عنصر/فرم بدون workflow فعال؛ نیازمند تصمیم محصول یا حذف از scope.

## ۸. کنترل‌های مشترک وابسته

- `EosParkingInfoControl`: وضعیت خلاصه پارکینگ، API و polling در `MainForm` مستند شده است.
- `EosIpCamView`: نمایش/دریافت تصویر دوربین؛ timeout، reconnect و خطای stream نیازمند تکمیل.
- `FilterPanel`ها و `ReportsViewer`: هر FilterPanel باید schema فیلتر، endpoint، مدل نتیجه و export/print خود را ثبت کند.
- `EosTabControl` و `EosBaseRibbonForm`: lifecycle و dispose عمومی در مستند `MainForm` ثبت شده، اما قرارداد reusable component وب جداگانه است.

## وضعیت نهایی پوشش

فرم‌های باقی‌مانده‌ی دو پروژه‌ی در scope در این سند یا مستندهای تخصصی موجود فهرست و تحلیل شده‌اند. فرم‌های ساختار پارکینگ، درب، تعرفه، شیفت، مانیتورینگ، اعضا، کارت، پرداخت، مجوز خروج و باربری دارای سطح متفاوتی از جزئیات هستند؛ مواردی که به قرارداد بیرونی API یا رفتار runtime نیاز دارند، عمداً با برچسب «ناقص/نیازمند تأیید» باقی مانده‌اند و نباید آماده‌ی اتصال production تلقی شوند.
