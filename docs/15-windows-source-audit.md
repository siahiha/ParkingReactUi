# ممیزی سورس Windows برای بازسازی نسخه وب

**تاریخ بررسی:** ۱۰ شهریور ۱۴۰۵  
**هدف:** ثبت رفتارهای قابل اتکا، ریسک‌های مشاهده‌شده و ابهام‌های باقی‌مانده در سورس WinForms، به‌نحوی که مبنای دقیق‌تری برای ساخت UI نسخه وب با React باشد.

**تصمیم قطعی محصول:** scope این پروژه فقط UI React است. Backend پیاده‌سازی نمی‌شود؛ هر API فاقد قرارداد تأییدشده یا قابلیت سروریِ غایب باید به‌صورت درخواست مشخص به تیم Backend تحویل شود.

## دامنه و مرز اطمینان

این سند فقط از دو پوشه‌ی در scope استخراج شده است: `EosParkingProfessional` و `EosParkingTools`.

این دو پروژه به assemblyها و پروژه‌های بیرونی reference دارند، اما سورس آن وابستگی‌ها جزو scope مستندات نیست. بنابراین نام `ApiAddress`، DTOها و Entityهای استفاده‌شده در call siteها ثبت می‌شوند، ولی route قطعی، Controller، Repository و منطق واقعی سرور فقط با OpenAPI نسخه‌دار Backend قابل تأیید هستند.

هر مورد زیر یکی از این برچسب‌ها را دارد:

- **قطعی از سورس:** مستقیم در فایل موجود دیده می‌شود.
- **ریسک مشاهده‌شده:** پیامد محتمل از کد موجود است و باید با تست یا Backend تأیید شود.
- **ابهام:** از کد فعلی قابل تعیین نیست.

## ۱. نقشه‌ی اجراییِ قطعی

### شروع برنامه و context سراسری

- **قطعی از سورس:** برنامه culture رابط کاربری را `fa-IR` می‌گذارد، سپس `Splash` و بعد `LoginForm` را اجرا می‌کند. منبع: `EosParkingProfessional/Program.cs`.
- **قطعی از سورس:** `Splash` فونت را بررسی می‌کند، تنظیمات را از `App.config` می‌خواند، اتصال سرویس قفل را شروع می‌کند، endpoint سلامت `api/Utils/hi?key=asd` را فراخوانی و سپس مدل/رنگ خودرو را پیش‌بارگذاری می‌کند. منبع: `EosParkingProfessional/Splash.cs`.
- **قطعی از سورس:** وضعیت جاری در staticهای `PublicVariables` نگهداری می‌شود: کاربر، آدرس سرور، مدل و رنگ خودرو، تنظیم چاپ و timeout پیام. منبع: `EosParkingProfessional/Models/PublicVariables.cs`.
- **نیاز نسخه وب:** این state باید به session/context صریح تبدیل شود و هیچ داده‌ای از context کاربر یا پارکینگ صرفاً از UI قابل اعتماد نباشد.

### ورود و مسیرهای کاربر

- **قطعی از سورس:** ورود، `UserDto` با `UserName` و رمز رمز‌شده را به `UserApi.Login` ارسال می‌کند. بعد از پاسخ موفق، token پاسخ در `WebHelper.UserToken` و کاربر در `PublicVariables.CurrentUser` قرار می‌گیرد. منبع: `EosParkingProfessional/EosForms/LoginForm.cs`.
- **قطعی از سورس:** Dashboard بر اساس `UserType` رفتار متفاوت دارد: `ExitPermissionManager` فقط مسیر مجوز خروج را می‌بیند؛ `Parkban` بعضی Tileها را نمی‌بیند؛ کاربر با پارکینگ جاری و بدون مجوز مدیریت dashboard مستقیماً به همان پارکینگ منتقل می‌شود. منبع: `EosParkingProfessional/EosForms/DashboardForm.cs`.
- **قطعی از سورس:** کنترل مجوز در کلاینت با bitmask و دو مقدار `AccessPermissionValuePart1/Part2` انجام می‌شود؛ تابع عمومی `CheckUserAccess` فقط بخش اول را بررسی می‌کند. منبع: `PublicVariables.cs` و `MainForm.cs`.

### قراردادهای کلاینتی قابل استخراج

در scan استاتیک ۵۳ operation متمایز با نوع پاسخ generic و ۹۲ call site پیدا شد؛ از جمله Login، پارکینگ، اعضا، کارت، تعرفه، تردد، گزارش، ANPR و باربری. افزون بر آن، چند فراخوانی به‌دلیل نوع generic پیچیده یا wrapper متفاوت در این شمارش نیستند.

**محدودیت قطعی:** از call site فقط می‌توان فهمید عملیات با helper GET یا POST صدا زده شده است؛ route واقعی، headerها، schema JSON نهایی، status code، authorization سمت سرور و transaction semantics بدون سورس `ApiAddress` و Backend قطعی نیستند.

### ضمیمه A: inventory عملیات‌های typed در کلاینت

در جدول، `GET-helper` و `POST-helper` نام helper کلاینت هستند و **نباید** به عنوان method رسمی HTTP در OpenAPI کپی شوند. نوع ستون پاسخ، `T` در `ResponseResultWeb<T>` در call site است. نوع requestِ POST باید از همان handler و DTO بیرون کشیده شود؛ در این checkout برای همه‌ی عملیات قابل تعیین نیست.

| حوزه | operation مشاهده‌شده | helper / پاسخ |
|---|---|---|
| کاربر و دسترسی | `UserApi.Login`، `UserApi.Save`، `UserApi.DeleteById`، `UserApi.SaveUserWorkShifts` | POST / `object`، `long`، GET / `bool`، POST / `bool` |
| دسترسی | `AccessLevelApi.AccessLevelSave`، `Save`، `DeleteById` | POST / `AccessLevelEntity` یا `long`، GET / `bool` |
| عضو | `GetById`، `Save`، `DeleteById`، `AddMemberRegister`، `MembershipCreditCancellation`، `SaveMemberRegisterKind`، `DeleteMemberRegisterKindById`، `IsParkingMember` | GET / `MemberDto` یا `bool`؛ POST / `long`، `MemberRegisterResultDto` یا `bool` |
| عضو / import | `ImportMembersExternalSource`، `UpdatingMembersThroughExternalSource` | POST / `bool` |
| کارت | `GetCardStatus`، `Save`، `SaveAll` | GET / `CardStatuses`؛ POST / `long` یا `bool` |
| پارکینگ | `GetInfoById`، `GetParkingDoor`، `GetParkingFloorById` | GET / `ParkingInfoDto`، `ParkingDoorEntity`، `ParkingFloorDto` |
| پارکینگ / ذخیره | `Save`، `SaveAllParkingParkSpaceKind`، `SaveControlListCars`، `SaveParkingDoor`، `SaveParkingEquipment`، `SaveParkingFloor`، `SaveParkingSection` | POST / `bool` یا `long` |
| پارکینگ / حذف | `DeleteEquipmentById`، `DeleteParkingDoor`، `DeleteParkingFloor`، `DeleteParkingSectionById` | GET / `bool` |
| تعرفه | `AddMemberCar`، `DeleteById`، `Save`، `SetActive`، `SetCurrent` | GET / `long` یا `bool`؛ POST / `long` |
| تردد | `GetCarTrafficInfo`، `GetTrafficBill`، `PayDump` | GET / `CarTrafficInfoDto`، `ExitBillDto`، `string` |
| تردد / تغییر | `CreateEnterDump`، `DoExitDump`، `Save`، `DeleteById` | POST / `EnterDumpRecordSavedDto`، `ExitBillDto`، `long`؛ GET / `bool` |
| باربری | `CargoRequiredData`، `GetCarInfo`، `IsCargoRegistered`، `Save`، `SetCarInfo` | GET / `CargoRequiredData`، `CarInfoDto` یا `bool`؛ POST / `bool` |
| ANPR | `GetLastMaxAnprId`، `DeleteOldAnprPics` | GET / `long` یا `bool` |

عملیات‌های گزارش، list-loading و monitoring نیز در کد وجود دارند، ولی همه به‌دلیل generic تو در تو در جدول typed بالا ظاهر نشده‌اند. نام‌های قابل مشاهده شامل `ReportApi.GetTrafficReport`، `GetIncomingDetailsReport`، `GetMemberReport`، `GetMembershipIncomingDetails`، `GetMemberCach`، `GetUserActivity`، `GetCargoIOReport`، `GetParkingDailyIncomingReport`، `GetParkingMonthlyIncomingReport`، `GetParkingYearIncomingReport`، `GetTrafficStatisticReport` و `GetOccupedHourlyParkByParkingId` است.

## ۲. قواعد کسب‌وکار قابل استخراج از فرم کنترل تردد

### ثبت ورود

- **قطعی از سورس:** بر اساس `EntryAuthorizaitionType`، کارت، پلاک، یا تصویر برای ورود الزامی می‌شود. حالت‌های صریح در کد: `Card`، `Plate`، `CardAndPictur` و `CardAndPlate`. منبع: `ManualTrafficControlForm.cs`، حدود خطوط ۲۰۳۰ تا ۲۰۷۳.
- **قطعی از سورس:** قبل از ورود، لیست کنترلی خودرو بررسی می‌شود؛ سپس یک `TrafficDumpEntity` با درب، عضو، کارت، پلاک، خودرو، تعرفه، تصویر، کاربر ثبت‌کننده، منبع `UserManual` و نوع قبض ساخته و با `TrafficApi.CreateEnterDump` ارسال می‌شود. منبع: همان فایل، حدود خطوط ۲۰۸۱ تا ۲۱۲۰.
- **قطعی از سورس:** پس از پاسخ موفق، در حالت قبض کنترلی، شماره قبض چاپ و فرمان بازکردن چند مسیر راهبند اجرا می‌شود. منبع: همان فایل، حدود خطوط ۲۱۳۴ تا ۲۱۵۹.
- **ریسک مشاهده‌شده:** ایجاد رکورد و بازکردن راهبند دو عملیات مستقل هستند؛ در کد کلاینت تضمین اتمی، شناسه درخواست یا جبران خطا دیده نمی‌شود. نسخه وب باید نتیجه‌ی هر دو مرحله را جداگانه و قابل پیگیری نشان دهد.

### ثبت خروج و پرداخت

- **قطعی از سورس:** خروج، تصویر می‌گیرد، اعتبارسنجی نوع ورود را اعمال می‌کند، لیست کنترلی و وجود ورود را بررسی می‌کند، سپس `TrafficApi.DoExitDump` را فراخوانی می‌کند. منبع: `ManualTrafficControlForm.cs`، حدود خطوط ۳۱۶۷ تا ۳۲۹۸.
- **قطعی از سورس:** پس از محاسبه/پاسخ خروج، فرم پرداخت باز می‌شود؛ راهبند فقط هنگامی باز می‌شود که رسید پرداخت وجود داشته باشد یا مبلغ صفر باشد. منبع: همان فایل، حدود خطوط ۳۳۰۲ تا ۳۳۳۳.
- **قطعی از سورس:** گزینه «خروج بدون ورود» در کد دیده می‌شود، اما شاخه‌ی مربوطه قبل از ساخت رکورد با `return` متوقف می‌شود. منبع: همان فایل، حدود خطوط ۳۲۵۷ تا ۳۲۶۸. **تصمیم محصول نسخه وب:** خروج متوقف و صفحه مدیریت ورود/خروج برای تعیین ورود توسط اپراتور باز می‌شود؛ UI ورود ساختگی خودکار ایجاد نمی‌کند و API مجوز را نهایی تعیین می‌کند.
- **ریسک مشاهده‌شده:** در ثبت خروج، وقتی دوربین خروج متصل است، بعد از capture آن از buffer دوربین ورود خوانده می‌شود. این می‌تواند تصویر نامربوط ثبت کند و باید با تست عملی تأیید شود. منبع: همان فایل، خطوط ۳۱۷۶ تا ۳۱۸۱.

### پرداخت، کارت و تکرار عملیات

- **قطعی از سورس:** `PayForm` ابتدا پرداخت را با `transactionResponse` می‌فرستد و در ناموفق بودن/نبود پاسخ، پس از ۵۰۰ms همان پرداخت را بدون `transactionResponse` تکرار می‌کند. منبع: `PayForm.cs`، خطوط ۴۸ تا ۶۸.
- **ریسک P0:** retry پرداخت شناسه یکتای درخواست ندارد. اگر درخواست اول در سرور ثبت شده ولی پاسخ به کلاینت نرسیده باشد، درخواست دوم ممکن است دوباره اثر مالی ایجاد کند. قرارداد وب باید `Idempotency-Key` و lookup وضعیت تراکنش داشته باشد.
- **ریسک مشاهده‌شده:** در شاخه‌ی خطای `PayDump`، `response` می‌تواند `null` باشد ولی در انتها `response.Values` خوانده می‌شود؛ احتمال خطای NullReference و از دست‌رفتن علت اصلی خطا وجود دارد. منبع: `PayForm.cs`، خطوط ۵۳ تا ۶۷.
- **ریسک P0 قطعی:** دکمه OK فرم کارت یک بار `SaveAll` را sync اجرا می‌کند و بلافاصله همان مجموعه را بار دیگر در یک Task ارسال می‌کند. این رفتار تکراری است و بدون idempotency ممکن است ثبت/حذف تکراری رخ دهد. منبع: `ParkingCardForm.cs`، خطوط ۶۰۴ تا ۶۱۶. مسیر Apply فقط یک بار ارسال می‌کند (خطوط ۴۱۳ تا ۴۳۰).
- **قطعی از سورس:** حذف کارت در payload به صورت `CardEntity { Id = -originalId }` نمایش داده می‌شود. منبع: `ParkingCardForm.cs`، خطوط ۴۲۴ تا ۴۲۵ و ۶۰۹ تا ۶۱۰. **تصمیم محصول:** این قرارداد برای entityهای UI یعنی حذف فیزیکی entity با شناسه‌ی قدرمطلق است، نه ایجاد یا ویرایش؛ soft delete/archive فقط استثنای مستند است. Backend باید آن را برای endpointهای پشتیبانی‌شده مستند و enforce کند.

## ۳. ریسک‌های فنی و امنیتی که نباید به وب منتقل شوند

### امنیت و داده حساس

- **ریسک P0 قطعی:** فایل پیکربندی نمونه شامل آدرس‌های شبکه، اتصال HTTP، credential پایگاه‌داده و تنظیمات تجهیز است. نباید هیچ secret، رمز دستگاه، اطلاعات اتصال DB یا IP داخلی در frontend وب، bundle، log یا browser ذخیره شود. منبع: `EosParkingProfessional/App.config`.
- **قطعی از سورس:** دوربین با IP، port، username و password از کلاینت WinForms متصل می‌شود. Browser نباید جایگزین این اتصال مستقیم باشد؛ یک Agent/Windows Service امن باید مالک ارتباط دستگاه باشد. منبع: `ManualTrafficControlForm.cs`، حدود خطوط ۶۸۴ تا ۷۵۰.
- **ریسک مشاهده‌شده:** نام کاربری ورود در `localsetting.dat` ذخیره می‌شود؛ مکانیزم ذخیره‌سازی فایل ساده است و خطاها را می‌بلعد. نسخه وب فقط می‌تواند preference غیرحساس را ذخیره کند؛ token و رمز نباید در آن الگو منتقل شود. منبع: `PublicVariables.cs`، خطوط ۱۳۸ تا ۱۸۲ و `LoginForm.cs`.
- **ریسک مشاهده‌شده:** رمز کاربر در فرم مدیریت کاربران decrypt و در UI نمایش داده می‌شود. این نشان می‌دهد طرح رمز موجود احتمالاً reversible است؛ نسخه وب باید reset-password/one-way hash داشته باشد و هرگز رمز اصلی را برنگرداند. منبع: `UsersForm.cs`، حدود خطوط ۱۱۹ و ۱۷۷.

### پایداری، هم‌زمانی و مشاهده‌پذیری

- **قطعی از سورس:** در بسیاری از مسیرهای UI از `Application.DoEvents`، `Thread.Sleep`، `Task.Wait(100)` و حلقه انتظار استفاده شده است. این الگو re-entrancy و رفتار غیرقطعی UI ایجاد می‌کند و برای وب نباید ترجمه‌ی مستقیم شود. نمونه‌ها: `Splash.cs`، `MainForm.cs`، `PayForm.cs`، `ParkingCardForm.cs` و `ManualTrafficControlForm.cs`.
- **قطعی از سورس:** تعداد زیادی `catch { }` یا `catch (Exception) { /* ignored */ }` در فرم کنترل تردد و سایر فرم‌ها وجود دارد. در نتیجه نبود داده/دستگاه ممکن است به‌صورت سکوت یا UI ناسازگار ظاهر شود. نسخه وب باید خطای فنی، business error، timeout و cancellation را جدا و با `traceId` ثبت کند.
- **قطعی از سورس:** خلاصه پارکینگ با timer هر ۱۰ ثانیه poll می‌شود. lifecycle، overlap درخواست و سیاست backoff در حد قابل استناد از کد مشخص نیست. منبع: `MainForm.cs`، خطوط ۱۹۶ تا ۲۰۰ و `EosParkingInfoControl.cs`.
- **ریسک مشاهده‌شده:** state حیاتی کاربر/درب/پارکینگ global و mutable است. در نسخه وب باید context از route/session گرفته، در Backend نیز برای هر درخواست authorization شود؛ فقط مخفی‌کردن کنترل کافی نیست.

### دسترسی و کیفیت رفتار

- **قطعی از سورس:** بخشی از مجوزها فقط کنترل UI هستند: controlها با `Tag` و bitmask enabled/visible می‌شوند، و مسیر import صرفاً برای username برابر `admin` visible شده است. منبع: `MainForm.cs`، حدود خطوط ۲۰۵ تا ۲۲۷.
- **ریسک P0:** هیچ استنتاجی از مجوز کلاینت نباید معادل authorization سرور باشد. برای وب باید permissionهای نام‌دار، scope پارکینگ/درب و enforcement در API تعیین شود.
- **ریسک مشاهده‌شده:** شرط‌های طولانی ورود/خروج و اتکا به `currentCarInfo` احتمال null/precedence را بالا برده‌اند؛ از جمله استفاده از `currentCarInfo.ControlType` پیش از اثبات non-null. این مورد بدون اجرای runtime قطعی نیست، اما نسخه وب باید state machine typed داشته باشد تا «داده هنوز بارگذاری نشده» با «خودرو یافت نشد» مخلوط نشود.

## ۴. الزامات مستندی که اکنون باید به اسناد وب افزوده شوند

برای هر فرم، علاوه بر شرح UI، این داده‌ها باید از سورس و سپس از Backend تکمیل شوند:

1. نام دقیق operation، helper مصرف‌شده (GET/POST)، پارامترها و نوع DTO در call site.
2. جدول نگاشت فیلدهای UI به request؛ از جمله null، مقدار پیش‌فرض، enum و تبدیل تاریخ شمسی/میلادی.
3. اثر موفقیت/خطا بر UI، چاپ، راهبند، refresh و navigation.
4. state machine و transitionهای ورود، خروج، پرداخت، مجوز خروج، لغو و retry.
5. مرز مسئولیت دستگاه: Browser، Backend و Windows Service؛ همراه با command id، acknowledgement و timeout.
6. permission matrix واقعی، شامل scope پارکینگ و درب و کنترل server-side.
7. قرارداد idempotency و audit برای `CreateEnterDump`، `DoExitDump`، `PayDump`، `SaveAll کارت`، حذف و import.

## ۵. ابهام‌های باز که سورس موجود پاسخ نمی‌دهد

1. route HTTP نهایی، headerهای لازم، همه status codeها، schema واقعی request/response و serialization enumها چیست؟
2. منطق نهایی Backend برای جلوگیری از ورود/خروج/پرداخت تکراری، ظرفیت پارکینگ و rollback چیست؟
3. **تصمیم محصول:** اگر POS موفق باشد ولی API پاسخ قطعی ندهد، UI پرداخت را استعلام یا مجدداً ثبت نمی‌کند؛ هشدار حاوی شناسه تردد و اطلاعات POS به اپراتور می‌دهد و پیگیری با اپراتور است. **ابهام باقی‌مانده:** Backend برای ثبت audit و نمایش/ثبت یادداشت پیگیری چه API یا فرایندی ارائه می‌دهد؟
4. تعریف قطعی تمام permissionها، مقدار bitmask، scope پارکینگ/درب و سیاست backend چیست؟
5. **تصمیم محصول:** `Id = -id` به‌معنای حذف فیزیکی entity با شناسه‌ی قدرمطلق است؛ soft delete/archive فقط استثنای مستند است. **ابهام باقی‌مانده:** کدام endpointهای گروهی این قرارداد را پشتیبانی می‌کنند و در خطای وابستگی/عدم مجوز چه schemaیی برمی‌گردانند؟
6. **تصمیم محصول:** در نبود ورود، UI صفحه مدیریت ورود/خروج را برای تعیین ورود توسط اپراتور باز می‌کند؛ API درباره مجازبودن اقدام تصمیم می‌گیرد. **ابهام باقی‌مانده:** نام endpoint، request/response و پیام/کد دقیق عدم مجوز چیست؟
7. **تصمیم محصول:** UI React نباید مستقیم به device متصل شود؛ Backend باید روش رسمی کنترل و مانیتورینگ تجهیزات را طراحی و تحویل دهد. **ابهام باقی‌مانده برای تیم Backend:** Agent/Service کجا اجرا می‌شود، protocol و contract command/event چیست، acknowledgement و retry چگونه کار می‌کنند و مجوزها چگونه enforce می‌شوند؟
8. **تصمیم محصول برای تصویر پلاک و دوربین:** UI تا حد امکان تصویر realtime خود دوربین را نمایش می‌دهد، در قطع ارتباط reconnect می‌کند و buffer محدود را برای جلوگیری از مصرف زیاد RAM آزاد می‌کند. retention، محل ذخیره‌سازی، دسترسی مشاهده/حذف، حذف دستی و حساسیت حریم خصوصی باید به‌شکل پارامترهای تنظیمات پارکینگ/درب در API تعریف و در Backend enforce شوند. **ابهام باقی‌مانده:** مقدارهای پیش‌فرض هر پارامتر و permissionهای نام‌دار آن چیست؟
9. **تصمیم محصول:** محاسبه تعرفه، مالیات، rounding، اعتبار عضو و مبلغ نهایی فقط مسئولیت Backend است. UI فقط ورودی‌های لازم را ارسال و پاسخ authoritative را نمایش می‌دهد؛ هیچ فرمول یا اصلاح مبلغ در UI پیاده‌سازی نمی‌شود. **ابهام باقی‌مانده برای تیم Backend:** request موردنیاز و schema کامل اجزای مبلغ در پاسخ چیست؟
11. **تصمیم محصول:** نرم‌افزار فقط آنلاین است؛ offline mode، صف محلی عملیات و همگام‌سازی پس از اتصال مجدد خارج از scope هستند. UI در قطع ارتباط وضعیت را نمایش می‌دهد و عملیات حساس را locally retry/queue نمی‌کند. **ابهام باقی‌مانده:** شکل دقیق پیام و وضعیت عملیاتِ قطع‌شده را Backend با چه code/schema برمی‌گرداند؟
12. **تصمیم محصول درباره scope و هم‌ارزی:** UI React باید تا حد امکان تمام قابلیت‌های برنامه Windows را پوشش دهد. دسته‌بندی فرم‌ها مشابه محصول Windows می‌ماند، اما ظاهر و interaction مطابق استانداردهای وب طراحی می‌شود. قابلیت‌های غیرقابل پیاده‌سازی مستقیم در Browser حذف نمی‌شوند و باید با API، Windows Service/Agent یا workflow اپراتور جایگزین شوند. UI فقط مصرف‌کننده است؛ ایجاد یا تأیید endpoint با تیم Backend است. **ابهام باقی‌مانده:** سند ۱۳ قرارداد سیستم موجود است، قرارداد هدف آینده است، یا ترکیبی از هر دو؟

## نتیجه ممیزی

کد Windows منبع مناسبی برای استخراج صفحه‌ها، کنترل‌ها، validationهای محلی، جریان‌های قابل مشاهده و نام operationهاست؛ ولی منبع قابل اتکا برای قرارداد backend یا تصمیم معماری وب نیست. خروجی این مستندات باید UI React و backlog دقیق درخواست‌های Backend باشد، نه کد Backend. پیش از اتصال production، ابهام‌های P0 مربوط به API، پرداخت، idempotency، authorization و تجهیزات باید به قرارداد رسمیِ تحویلی از تیم Backend تبدیل و با تست end-to-end تأیید شوند.
