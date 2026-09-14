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
- UI: جدول تعرفه‌ها، فعال/غیرفعال، تعیین تعرفه پیش‌فرض، پنل اطلاعات، جزئیات بازه‌های روزانه، شبانه‌روزی و نوع عضویت.
- داده‌های وابسته: انواع عضویت و انواع جای‌پارک.
- اعتبارسنجی‌های مشاهده‌شده: نام و حداقل مدت شبانه‌روزی؛ وجود حداقل یک بازه‌ی روزانه و شبانه‌روزی؛ رایگان نبودن بازه از ورودی بیشتر؛ عدم تداخل بازه‌ها.
- عملیات: ایجاد، ویرایش، حذف با کنترل استفاده، فعال‌سازی، تعیین current/default، لغو.
- APIها: `GetByParkingId`، `Save`، `DeleteById`، `SetActive`، `SetCurrent`، `GetMemberRegisterKindsByParkingId`، `GetParkingParkSpaceKinds`.
- قواعد: تغییر تعرفه پیش‌فرض permission جدا دارد؛ تعرفه‌ی استفاده‌شده قابل حذف نیست.
- وضعیت پوشش: UI و endpointها مشخص؛ مدل کامل جزئیات نرخ، هم‌پوشانی timezone/تقویم، خطای ردیفی و قرارداد API ناقص.

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
- UI: جدول کارت‌ها، ورود کارت، وضعیت، تخصیص/عدم تخصیص و عملیات گروهی.
- APIها: `CardApi.GetByParkingId`، `CardApi.Save`، `CardApi.SaveAll`، `ParkingApi.GetParkingDoor`.
- وضعیت پوشش: سیاست کارت تکراری، وضعیت‌های کارت، مجوزها، خطای reader و قرارداد گروهی ناقص.

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
