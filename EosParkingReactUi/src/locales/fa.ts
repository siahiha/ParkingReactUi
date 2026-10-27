const fa = {
  common: {
    floor: 'طبقه',
    parkingSpace: 'جای‌پارک',
    parkingSpaces: 'جای‌پارک‌ها',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    loading: 'در حال بارگذاری...',
    save: 'ذخیره',
    cancel: 'لغو',
    close: 'بستن',
    backHome: 'بازگشت به خانه',
  },
  auth: {
    ssoLoading: 'در حال تکمیل ورود با سیستم مرکزی...',
    ssoFailed: 'خطا در ورود با سیستم مرکزی. دوباره تلاش کنید.',
  },
  theme: {
    settings: 'تنظیمات ظاهر',
    colors: 'رنگ‌بندی',
    lightPalette: 'رنگ‌بندی حالت روشن',
    darkPalette: 'رنگ‌بندی حالت تاریک',
    bluePalette: 'آبی سازمانی',
    greenPalette: 'سبز عملیاتی',
    slatePalette: 'خاکستری صنعتی',
    shape: 'گردی گوشه‌ها',
    controlRadius: 'گردی کنترل‌ها',
    buttonRadius: 'گردی دکمه‌ها',
    popupRadius: 'گردی پنجره‌ها',
    radiusCompact: 'کم',
    radiusStandard: 'استاندارد',
    radiusMedium: 'میانه',
    radiusExpanded: 'باز',
    radiusSoft: 'زیاد',
    cancel: 'انصراف',
    apply: 'اعمال تغییرات',
  },
  access: {
    deleteConfirm: 'آیا از حذف این سطح دسترسی مطمئن هستید؟',
    deleteManyConfirm: 'آیا از حذف {{count}} سطح دسترسی انتخاب‌شده مطمئن هستید؟',
  },
  parking: {
    deleteConfirm: 'آیا از حذف این پارکینگ مطمئن هستید؟',
  },
  users: {
    deleteConfirm: 'آیا از حذف این کاربر مطمئن هستید؟',
    deleteManyConfirm: 'آیا از حذف {{count}} کاربر انتخاب‌شده مطمئن هستید؟',
  },
  definitions: {
    add: 'جدید', edit: 'ویرایش', remove: 'حذف', refresh: 'به‌روزرسانی', save: 'ذخیره', cancel: 'انصراف', create: 'افزودن {{title}}', update: 'ویرایش {{title}}', empty: 'رکوردی برای نمایش وجود ندارد.', loading: 'در حال دریافت اطلاعات...', error: 'دریافت اطلاعات این بخش ناموفق بود.', required: 'عنوان الزامی است.', removeConfirm: 'آیا از حذف رکورد انتخاب‌شده مطمئن هستید؟', used: 'این طبقه جای‌پارک استفاده‌شده دارد و حذف آن مجاز نیست.', memberKindUsed: 'حذف نوع عضویت استفاده‌شده مجاز نیست.', saved: 'اطلاعات با موفقیت ذخیره شد.', deleted: 'رکورد حذف شد.', title: 'عنوان', description: 'توضیحات', fee: 'حق عضویت', duration: 'مدت عضویت (روز)', creditType: 'نوع اعتبار', membershipType: 'نوع عضویت', refund: 'مهلت استرداد (روز)', tariffs: 'تعرفه‌های مرتبط', creditValues: ['اعتباری', 'مدت‌دار', 'اعتباری و مدت‌دار'], membershipValues: ['مالک', 'دارای جای پارک مشخص', 'فاقد جای پارک مشخص'], using: 'در حال استفاده',
  },
} as const;

export default fa;
