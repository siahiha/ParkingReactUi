# اعضا، عضویت و کارت‌ها

## فرم‌ها

- `MemberForm`
- `MemberKindForm`
- `ParkingCardForm`
- `ImportMembersForm`
- `ControlListForm`

## مدل مفهومی

```text
نوع عضویت → عضو → خودرو/پلاک → کارت → اعتبار و ثبت عضویت
```

## MemberForm

قابلیت‌های اصلی:

- جستجو و نمایش اعضای پارکینگ
- ایجاد و ویرایش اطلاعات عضو
- ثبت نوع عضویت
- ثبت خودرو و پلاک
- تخصیص کارت
- تخصیص جای پارک
- مشاهده‌ی اعتبار یا گردش مالی
- حذف عضو با کنترل وابستگی‌ها

## ParkingCardForm

- مشاهده‌ی کارت‌های پارکینگ
- ثبت کارت جدید یا گروهی
- مشاهده‌ی وضعیت کارت
- تخصیص کارت به عضو
- فعال یا غیرفعال‌کردن کارت

## ImportMembersForm

```text
انتخاب فایل/منبع خارجی → خواندن داده → بررسی اعضا → نمایش مغایرت‌ها → ثبت یا به‌روزرسانی
```

## APIهای مشاهده‌شده

- `MemberApi.GetByParkingId`
- `MemberApi.GetById`
- `MemberApi.Save`
- `MemberApi.AddMemberRegister`
- `MemberApi.DeleteById`
- `MemberApi.GetMemberRegisterKindsByParkingId`
- `MemberApi.ImportMembersExternalSource`
- `MemberApi.UpdatingMembersThroughExternalSource`
- `CardApi.GetByParkingId`
- `CardApi.Save`
- `CardApi.SaveAll`
- `CardApi.GetCardStatus`
- `ParkingApi.GetParkingParkSpacesById`

## نیازمندی نسخه‌ی وب

- جدول اعضا با جستجو و فیلتر
- صفحه‌ی جزئیات عضو با tabهای اطلاعات، خودرو، کارت، عضویت و اعتبار
- import با preview و گزارش خطا برای هر ردیف
- نمایش وضعیت کارت و جلوگیری از تخصیص کارت نامعتبر
