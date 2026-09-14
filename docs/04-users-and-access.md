# کاربران، نقش‌ها و دسترسی

## فرم‌ها

- `UsersForm`
- `AccessLevelForm`
- `ParkingUserShiftForm`

جزئیات مستقل فرم تعریف سطح دسترسی در [04-1-access-level-form.md](04-1-access-level-form.md) مستند شده است.
جزئیات مستقل فرم مدیریت کاربران در [04-2-users-form.md](04-2-users-form.md) مستند شده است.

## جریان مدیریت دسترسی

```text
ایجاد کاربر → تعیین سطح دسترسی → تخصیص پارکینگ/درب/شیفت → ورود به سیستم
```

## قابلیت‌ها

- فهرست کاربران
- ایجاد و ویرایش کاربر
- تعریف سطح دسترسی
- انتخاب مجوزهای عملیاتی و مدیریتی
- تعیین شیفت و درب فعالیت کاربر
- کنترل منوها و عملیات بر اساس مجوز

## رفتار مورد نیاز

- کاربر بدون مجوز نباید صفحه یا عملیات مربوطه را اجرا کند.
- عدم دسترسی باید با پیام واضح نمایش داده شود.
- سطح دسترسی باید هم در navigation و هم هنگام اجرای عملیات بررسی شود.

## APIهای مشاهده‌شده

- `UserApi.Login`
- `UserApi.Get`
- `AccessLevelApi.Get`
- `AccessLevelApi.Save`
- `AccessLevelApi.DeleteById`
- `ParkingApi.GetParkingDoors`

## نیازمندی نسخه‌ی وب

- مدل پیشنهادی: User، Role/AccessLevel، Permission، ShiftAssignment
- route guard و action guard
- صفحه‌ی ماتریس مجوزها
- نمایش context فعالیت کاربر در header
