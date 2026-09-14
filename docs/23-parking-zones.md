# مستند کامل زون‌های پارکینگ (`ParkingSectionForm`)

**وضعیت سند:** تطبیق‌شده با سورس Windows، Controller/DTO/Repository و کد React موجود

**وضعیت پیاده‌سازی فعلی:** کد React این workflow درست است و تست رگرسیون دارد.

این سند رفتار زون‌های پارکینگ را بین سه منبع تطبیق می‌دهد: فرم Windows، قرارداد واقعی Backend و پیاده‌سازی React. برچسب‌ها مطابق [استاندارد مستندسازی](00-documentation-standard.md) هستند.

## ۱. هدف و مدل مفهومی

زون (`ParkingSection`) گروهی از جای‌پارک‌های یک پارکینگ است. ارتباط جای‌پارک با زون در `ParkingParkSpaceEntity.ParkingSectionId` نگهداری می‌شود.

```text
Parking
  └── ParkingFloor
        └── ParkingParkSpace
              └── ParkingSection (اختیاری)
```

زون مالک جای‌پارک جدید نیست؛ ذخیره‌ی زون، رابطه‌ی جای‌پارک‌های انتخاب‌شده با زون را تغییر می‌دهد.

## ۲. منابع قطعی

| لایه | فایل | کاربرد |
|---|---|---|
| Windows UI | `Persentation/EosParkingProfessional/EosForms/ParkingSectionForm.cs` | workflow، گرید، انتخاب و مجوز |
| Controller | `Infrastructure/EosParking.Controllers/Controllers/ParkingController.cs` | endpoint و wrapper پاسخ |
| DTO زون | `DataPersistance/EosParking.Data/EF/Dto/ParkingSectionDto.cs` | `ParkSpaces` زون |
| DTO flat | `DataPersistance/EosParking.Data/EF/Dto/ParkSpaceDto.cs` | جای‌پارک‌های مربوط به عضو؛ منبع گرید زون نیست |
| Entityها | `DataPersistance/EosParking.Data/EF/Entities/ParkingSectionEntity.cs` و `ParkingParkSpaceEntity.cs` | مدل ارتباطی |
| Repository | `DataPersistance/EosParking.Data/EF/Repository/ParkingRepository.cs` | Include، ذخیره و حذف رابطه |
| React | `Persentation/EosParkingReactUi/src/components/ParkingDefinitionsCrudWorkspace.tsx` | popup، state و API |
| Grid | `Persentation/EosParkingReactUi/src/components/AppDataGrid.tsx` | انتخاب مستقل ردیف‌ها |
| Test | `Persentation/EosParkingReactUi/src/components/ParkingDefinitionsCrudWorkspace.test.tsx` | تست تیک‌های `ParkSpaces` |

## ۳. مسیر دسترسی و مجوز

در Windows، گزینه‌ی «زون‌های پارکینگ» از `MainForm`، فرم `ParkingSectionForm(_parking)` را باز می‌کند.

مجوزهای مشاهده‌شده:

| عملیات | مجوز | اثر |
|---|---|---|
| حذف | `ParkingZoonDelete` | نمایش/مخفی‌کردن عملیات حذف |
| ایجاد و ویرایش | `ParkingZoonAddOrEdit` | اعتبارسنجی قبل از ذخیره |

React در context پارکینگ جاری با `kind="zones"` اجرا می‌شود. **ناقص/نیازمند تأیید:** mapping رسمی permissionهای Windows به وب در checkout وجود ندارد؛ enforce نهایی باید در Backend باشد.

## ۴. ساختار UI

### فهرست اصلی

- جدول زون‌ها؛
- انتخاب ردیف؛
- عملیات ایجاد، ویرایش، حذف و refresh؛
- ویرایش فقط با انتخاب دقیقاً یک زون؛
- حذف بعد از تأیید کاربر.

### Popup

| کنترل | مدل | اجباری | رفتار |
|---|---|---:|---|
| عنوان | `Title` | بله | نباید خالی باشد |
| توضیحات | `Description` | خیر | چندخطی و اختیاری |
| طبقه | `zoneFloorId` | بله | از طبقات پارکینگ پر می‌شود |
| گرید جای‌پارک | `selectedZoneSpaceIds` | در صورت وجود | چندانتخابی |
| ذخیره/انصراف | — | — | ارسال یا بستن بدون ذخیره |

ستون‌های گرید: عنوان، نوع جای‌پارک و وضعیت تخصیص. کلید ردیف، شناسه‌ی واقعی جای‌پارک است.

## ۵. رفتار ایجاد

1. Popup با `Id = 0` و انتخاب خالی باز می‌شود.
2. کاربر عنوان و طبقه را وارد می‌کند؛ عنوان و طبقه برای ذخیره الزامی هستند.
3. پس از انتخاب طبقه، جای‌پارک‌های آزاد آن طبقه در گرید می‌آیند.
4. جای‌پارک‌های متصل به زون‌های دیگر قابل انتخاب نیستند.
5. کاربر چند ردیف را تیک می‌زند.
6. در ذخیره، فقط ردیف‌های انتخاب‌شده داخل `ParkSpaces` ارسال می‌شوند.

## ۶. رفتار ویرایش و قانون تیک‌ها

1. `ParkSpaces` زون جاری از رکورد `ParkingSection` خوانده می‌شود.
2. طبقه از `ParkingFloorId` اولین جای‌پارک زون تعیین می‌شود.
3. اگر زون جای‌پارک داشته باشد، ComboBox طبقه مانند Windows غیرفعال می‌شود.
4. جای‌پارک‌های طبقه و `ParkSpaces` زون جاری به‌صورت زیر union می‌شوند:

```text
جای‌پارک‌های آزاد طبقه
    ∪
جای‌پارک‌های ParkSpaces زون جاری
```

5. هر ردیف با شناسه‌ی واقعی `ParkingParkSpaceEntity.Id` key می‌شود.
6. تمام شناسه‌های `ParkSpaces` زون جاری که در گرید حضور دارند، هنگام ساخت گرید تیک می‌خورند.
7. جای‌پارک‌های زون‌های دیگر به گرید قابل انتخاب اضافه نمی‌شوند.
8. برداشتن تیک، همان شناسه را از `selectedZoneSpaceIds` حذف می‌کند.

### علت باگ قبلی

تابع parsing پاسخ، آرایه را قبل از بررسی wrapper تشخیص نمی‌داد. آرایه در JavaScript یک متد داخلی به نام `values` دارد؛ بنابراین `Array.values` به‌جای آرایه‌ی `ParkSpaces` خوانده می‌شد و نتیجه خالی بود. پیامد آن، تعیین‌نشدن طبقه و تیک‌نخوردن ردیف‌ها بود. اکنون `unwrap` ابتدا آرایه را مستقیماً برمی‌گرداند.

## ۷. بارگذاری فعلی React

```text
GetParkingFloors?parkingId={parkingId}
        └── فهرست طبقات و fallback

GetParkingFloorById?Id={floorId}
        └── جای‌پارک‌های واقعی طبقه

GetParkingSections?parkingId={parkingId}
        └── زون‌ها به‌همراه ParkSpaces
```

در ساخت گرید، داده‌ها normalize می‌شوند، تخصیص با `HasSection`/`ParkingSectionId` تشخیص داده می‌شود، union ساخته و بر اساس عنوان مرتب می‌شود. `zoneFloorSpaceCount` تعداد واقعی کل جای‌پارک‌های طبقه را نگه می‌دارد؛ `selectedZoneSpaceIds` از تقاطع `ParkSpaces` زون و ردیف‌های گرید ساخته می‌شود.

### endpointی که منبع اصلی گرید زون نیست

`GetParkingParkSpacesById` خروجی `ParkSpaceDto` می‌دهد. این DTO شناسه را در `ParkSpaceId` دارد و رابطه‌ی `ParkingSectionId` را برای تشخیص زون برنمی‌گرداند؛ بنابراین برای گرید زون مناسب نیست و کد فعلی از آن استفاده نمی‌کند.

## ۸. انتخاب گرید و محدودیت ارتفاع

قرارداد مشترک گریدهای popup:

- حداکثر ارتفاع تقریباً برابر ۱۰ ردیف؛
- اسکرول عمودی برای داده‌ی بیشتر؛
- header چسبان؛
- انتخاب مستقل هر ردیف؛
- انتخاب همه فقط ردیف‌های قابل انتخاب را تغییر می‌دهد.

پیاده‌سازی:

```css
.crud-dialog-paper .app-data-grid-wrapper {
  max-height: 307px;
  overflow: auto;
}
```

## ۹. مدل داده و نگاشت state

### `ParkingSectionDto`

```text
Id: long
Title: string
Description: string
ParkingId: long
ParkSpaces: List<ParkingParkSpaceEntity>
```

### `ParkingParkSpaceEntity`

```text
Id: long
Title: string
IsActive: bool
ParkingFloorId: long
ParkingSectionId: long?
ParkingParkSpaceKindId: long
HasSection: bool (NotMapped)
ParkingParkSpaceKindTitle: string (NotMapped)
```

| state React | معنا |
|---|---|
| `editingZone` | زون جاری در popup |
| `editingZoneId` | شناسه زون |
| `zoneFloorId` | طبقه انتخاب‌شده |
| `zoneFloorSpaces` | ردیف‌های آماده نمایش |
| `zoneFloorSpaceCount` | تعداد کل جای‌پارک طبقه |
| `selectedZoneSpaceIds` | شناسه‌ی واقعی ردیف‌های تیک‌خورده |
| `zoneFloorSpacesLoading` | وضعیت loading گرید |

## ۱۰. APIهای واقعی

**وضعیت پوشش:** مسیر، method، Controller، DTO و Repository بررسی شده‌اند؛ OpenAPI رسمی و catalog خطا هنوز **ناقص/نیازمند تأیید** است.

### دریافت طبقات

```http
GET api/Parking/GetParkingFloors?parkingId={parkingId}
```

پاسخ: `ResponseResultWeb<List<ParkingFloorDto>>`. Repository طبقات را با `ParkingParkSpaces` بارگذاری می‌کند.

### جزئیات طبقه

```http
GET api/Parking/GetParkingFloorById?Id={floorId}
```

پاسخ: `ResponseResultWeb<ParkingFloorDto>` با `ParkSpaces` طبقه.

### فهرست زون‌ها

```http
GET api/Parking/GetParkingSections?parkingId={parkingId}
```

پاسخ: `ResponseResultWeb<List<ParkingSectionDto>>`. Repository رابطه‌ی `FloorSections.ParkSpaces` را Include می‌کند.

### ذخیره زون

```http
POST api/Parking/SaveParkingSection
Content-Type: application/json
```

نمونه‌ی بدنه:

```json
{
  "Id": 91,
  "Title": "زون A",
  "Description": "",
  "ParkingId": 7,
  "ParkSpaces": [{ "Id": 101 }, { "Id": 103 }]
}
```

در Repository، برای ویرایش، relationهای قبلی که در request نیستند null می‌شوند و relationهای موجود به `section.Id` متصل می‌شوند. برای زون جدید ابتدا زون ساخته و سپس جای‌پارک‌های انتخاب‌شده attach می‌شوند. پاسخ `ResponseResultWeb<long>` و `Values` شناسه زون است.

### حذف زون

```http
GET api/Parking/DeleteParkingSectionById?sectionId={sectionId}
```

ابتدا `ParkingSectionId` جای‌پارک‌ها null و سپس زون حذف می‌شود. پاسخ `ResponseResultWeb<bool>` است. این GET برای mutation رفتار legacy فعلی است و **پیشنهاد نسخه وب** انتقال به `DELETE` یا endpoint versioned است.

## ۱۱. بدنه‌ی ذخیره React

```text
Id = form.Id
Title = form.Title.trim()
Description = form.Description
ParkingId = parkingId
ParkSpaces = selectedZoneSpaceIds.map(space => {
  Id, Title, IsActive, ParkingFloorId,
  ParkingSectionId, ParkingParkSpaceKindId
})
```

شناسه‌ی `Id` request از همان `rowKey` گرید می‌آید؛ در نتیجه گرید، state و relation Backend از یک شناسه استفاده می‌کنند.

## ۱۲. حالت‌ها و خطاهای UI

| حالت | رفتار |
|---|---|
| loading فهرست | پیام دریافت اطلاعات و غیرفعال‌شدن عملیات وابسته |
| loading گرید | spinner و پیام دریافت جای‌پارک‌ها |
| empty طبقه | پیام نبود جای‌پارک برای طبقه |
| عنوان خالی | توقف ذخیره و پیام الزامی‌بودن عنوان |
| طبقه انتخاب‌نشده | توقف ذخیره و پیام انتخاب طبقه |
| خطای API | پاک‌شدن داده‌ی همان بخش و نمایش پیام خطا |
| unauthorized | نمایش پیام دسترسی در لایه‌ی عمومی API |
| انصراف | بستن popup بدون request ذخیره |
| موفقیت | بستن popup، refresh فهرست و پیام موفقیت |

## ۱۳. تطبیق Windows و React

| موضوع | Windows | React فعلی |
|---|---|---|
| منبع گرید | `ParkingFloorDto.ParkSpaces` | `GetParkingFloorById` و fallback طبقات |
| داده‌ی قابل نمایش | آزادهای طبقه + `section.ParkSpaces` | آزادهای طبقه + `editingZone.ParkSpaces` |
| تشخیص انتخاب | `HasSection`/navigation | `selectedZoneSpaceIds` با شناسه واقعی |
| انتخاب همه | رفتار GridView | `AppDataGrid` با کلیدهای یکتا |
| تغییر طبقه در زون تخصیص‌داده‌شده | غیرفعال | غیرفعال |
| ارتفاع | WinForms | ده ردیف و scroll داخلی |
| حذف | تأیید و GET legacy | تأیید و همان endpoint |

ظاهر popup لازم نیست کپی WinForms باشد؛ اصل، هم‌ارزی قابلیت و workflow است.

## ۱۴. تست و معیار پذیرش

تست `ParkingDefinitionsCrudWorkspace.test.tsx` بررسی می‌کند که:

1. زون با دو `ParkSpaces` دریافت شود؛
2. طبقه با سه جای‌پارک بارگذاری شود؛
3. هر سه ردیف نمایش داده شوند؛
4. شمارنده مقدار ۳ را نشان دهد؛
5. دقیقاً دو ردیف جاری تیک بخورند.

آخرین بررسی:

```text
npm test          → ۱۰ تست موفق
npm run typecheck → موفق
npm run build     → موفق
```

## ۱۵. موارد باز

1. **ناقص/نیازمند تأیید:** OpenAPI رسمی و catalog خطای چهار endpoint.
2. **ناقص/نیازمند تأیید:** mapping رسمی permissionهای Windows به وب.
3. **برداشت تحلیلی:** یک زون در طراحی فعلی یک طبقه دارد؛ Windows با اولین `ParkSpace` طبقه را تعیین و ComboBox را قفل می‌کند.
4. **پیشنهاد نسخه وب:** endpoint حذف از GET به `DELETE` یا endpoint mutation نسخه‌دار منتقل شود.
5. **پیشنهاد نسخه وب:** endpoint سبک و اختصاصی grid زون با `Id`، `ParkingFloorId` و `ParkingSectionId` صریح ارائه شود؛ `ParkSpaceDto` عضو برای این workflow مصرف نشود.

