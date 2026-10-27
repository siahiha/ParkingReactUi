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
  home2: {
    brandKicker: 'EOS / OPERATIONS', brandTitle: 'اتاق فرمان پارکینگ', online: 'سامانه آنلاین', healthy: 'تمام سرویس‌ها پایدار هستند', currentParking: 'پارکینگ فعال', chooseParking: 'انتخاب پارکینگ', navigation: 'ناوبری', collapse: 'جمع کردن ناوبری', expand: 'باز کردن ناوبری', language: 'تغییر زبان', appearance: 'تغییر حالت نمایش', profile: 'پروفایل کاربر', changePassword: 'تغییر رمز عبور', theme: 'تنظیمات ظاهر', logout: 'خروج', commandCenter: 'مرکز فرمان', commandSubtitle: 'تصویر زنده‌ی عملیات و شاخص‌های کلیدی پارکینگ', liveOverview: 'نمای زنده', operationalPulse: 'نبض عملیات', lastSync: 'آخرین همگام‌سازی همین حالا', capacity: 'ظرفیت کل', occupied: 'اشغال‌شده', available: 'آزاد', trafficVolume: 'تردد امروز', gateStatus: 'وضعیت درب‌ها', allGatesReady: 'همه درب‌ها آماده‌به‌کار', openGates: 'درب فعال', spaceMap: 'نقشه جایگاه‌ها', freeSpace: 'جایگاه آزاد', occupiedSpace: 'جایگاه اشغال‌شده', selectedSpace: 'جایگاه انتخاب‌شده', selectedBay: 'جایگاه انتخابی', quickActions: 'عملیات سریع', openTraffic: 'مشاهده تردد', openMembers: 'مدیریت اعضا', openMonitoring: 'باز کردن مانیتورینگ', openReports: 'گزارش‌های عملیاتی', today: 'امروز', comparedToYesterday: 'نسبت به دیروز', increase: 'افزایش', entry: 'ورود', exit: 'خروج', peakHour: 'ساعت اوج', activity: 'فعالیت اخیر', activityOne: 'ثبت تردد جدید در درب شمالی', activityTwo: 'عضویت یک خودرو تمدید شد', activityThree: 'گزارش روزانه آماده دریافت است', justNow: 'همین حالا', minutesAgo: 'دقیقه پیش', hourAgo: 'یک ساعت پیش', viewAllActivity: 'مشاهده همه فعالیت‌ها', tabs: 'تب‌های باز', closeTab: 'بستن تب', home: 'داشبورد', systemStatus: 'وضعیت سامانه', commandCode: 'COMMAND / 02', mapLegend: 'راهنمای نقشه', gateNorth: 'درب شمالی', gateSouth: 'درب جنوبی', stable: 'پایدار', attention: 'نیازمند بررسی', noParking: 'پارکینگی برای نمایش وجود ندارد.', parkingLoadError: 'دریافت فهرست پارکینگ‌ها ناموفق بود.', retry: 'تلاش مجدد', selectAction: 'انتخاب عملیات', occupancyRate: 'نرخ اشغال', freeCount: 'جایگاه باقی‌مانده', totalTraffic: 'مجموع تردد', monitoring: 'مانیتورینگ', systemMenu: 'مدیریت سامانه', parkingDefinitions: 'تعاریف پارکینگ', reports: 'گزارش‌ها', menuHome: 'خانه', modeTabs: 'حالت تب‌ها', modeClassic: 'حالت کلاسیک',
  },
} as const;

export default fa;
