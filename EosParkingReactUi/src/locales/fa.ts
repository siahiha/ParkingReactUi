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
  profile: {
    changePassword: 'تغییر رمز عبور', saving: 'در حال ذخیره...', currentPassword: 'رمز عبور فعلی', newPassword: 'رمز عبور جدید', confirmPassword: 'تکرار رمز عبور جدید', passwordRequired: 'هر سه فیلد رمز عبور را کامل کنید.', passwordMismatch: 'تکرار رمز عبور با رمز جدید یکسان نیست.', passwordChanged: 'رمز عبور با موفقیت تغییر کرد.', passwordError: 'تغییر رمز عبور انجام نشد. اطلاعات واردشده یا اتصال سرویس را بررسی کنید.',
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
    dayMode: 'حالت روز', nightMode: 'حالت شب',
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
brandKicker: 'EOS / OPERATIONS', brandTitle: 'سیستم مدیریت پارکینگ', online: 'سامانه آنلاین', healthy: 'تمام سرویس‌ها پایدار هستند', currentParking: 'پارکینگ فعال', chooseParking: 'انتخاب پارکینگ', navigation: 'ناوبری', collapse: 'جمع کردن ناوبری', expand: 'باز کردن ناوبری', language: 'تغییر زبان', appearance: 'تغییر حالت نمایش', profile: 'پروفایل کاربر', changePassword: 'تغییر رمز عبور', theme: 'تنظیمات ظاهر', logout: 'خروج', commandCenter: 'مرکز فرمان', managementPrefix: 'مدیریت', commandSubtitle: 'تصویر زنده‌ی عملیات و شاخص‌های کلیدی پارکینگ', liveOverview: 'نمای زنده', operationalPulse: 'نبض عملیات', lastSync: 'آخرین همگام‌سازی همین حالا', capacity: 'ظرفیت کل', occupied: 'اشغال‌شده', available: 'آزاد', trafficVolume: 'تردد امروز', trafficToday: 'تردد امروز', lastTraffic: 'آخرین تردد', gateStatus: 'وضعیت درب‌ها', doorCount: 'تعداد درب‌ها', serverTime: 'زمان سرور', deviceInfo: 'اطلاعات دستگاه', deviceInfoUnavailable: 'اطلاعاتی ثبت نشده است', parkingInfoLoadError: 'به‌روزرسانی اطلاعات پارکینگ ناموفق بود.', refresh: 'به‌روزرسانی اطلاعات', allGatesReady: 'همه درب‌ها آماده‌به‌کار', openGates: 'درب فعال', spaceMap: 'نقشه جایگاه‌ها', freeSpace: 'جایگاه آزاد', occupiedSpace: 'جایگاه اشغال‌شده', selectedSpace: 'جایگاه انتخاب‌شده', selectedBay: 'جایگاه انتخابی', quickActions: 'عملیات سریع', openTraffic: 'مشاهده تردد', openMembers: 'مدیریت اعضا', openMonitoring: 'باز کردن مانیتورینگ', openReports: 'گزارش‌های عملیاتی', today: 'امروز', comparedToYesterday: 'نسبت به دیروز', increase: 'افزایش', entry: 'ورود', exit: 'خروج', peakHour: 'ساعت اوج', activity: 'فعالیت اخیر', activityOne: 'ثبت تردد جدید در درب شمالی', activityTwo: 'عضویت یک خودرو تمدید شد', activityThree: 'گزارش روزانه آماده دریافت است', justNow: 'همین حالا', minutesAgo: 'دقیقه پیش', hourAgo: 'یک ساعت پیش', viewAllActivity: 'مشاهده همه فعالیت‌ها', tabs: 'تب‌های باز', closeTab: 'بستن تب', home: 'داشبورد', systemStatus: 'وضعیت سامانه', commandCode: 'COMMAND / 02', mapLegend: 'راهنمای نقشه', gateNorth: 'درب شمالی', gateSouth: 'درب جنوبی', stable: 'پایدار', attention: 'نیازمند بررسی', noParking: 'پارکینگی برای نمایش وجود ندارد.', parkingLoadError: 'دریافت فهرست پارکینگ‌ها ناموفق بود.', retry: 'تلاش مجدد', selectAction: 'انتخاب عملیات', occupancyRate: 'نرخ اشغال', freeCount: 'جایگاه باقی‌مانده', totalTraffic: 'مجموع تردد', monitoring: 'مانیتورینگ', systemMenu: 'مدیریت سامانه', parkingDefinitions: 'تعاریف پارکینگ', reports: 'گزارش‌ها', menuHome: 'خانه', modeTabs: 'حالت تب‌ها', modeClassic: 'حالت کلاسیک',
    smartInfrastructure: 'زیرساخت هوشمند تردد و پارکینگ',
  },
  home3Menu: {
    groups: { definitions: 'تعاریف و تنظیمات پارکینگ', operations: 'عملیات پارکینگ', integrations: 'یکپارچه‌سازی سامانه‌ها', reports: 'گزارش‌ها', 'member-reports': 'گزارش اعضا', 'traffic-reports': 'گزارش تردد', 'financial-reports': 'گزارش‌های مالی', 'other-reports': 'سایر', 'management-reports': 'گزارش‌های مدیریتی' },
    items: { list: 'پارکینگ‌ها', users: 'کاربران و دسترسی', access: 'سطوح دسترسی', exit: 'مجوز خروج', 'parking-details': 'مشخصات پارکینگ', equipment: 'تجهیزات', 'space-types': 'انواع جای پارک', floors: 'طبقات و تقسیمات', zones: 'زون‌های پارکینگ', doors: 'درب‌های پارکینگ', 'member-kinds': 'انواع عضویت', tariffs: 'تعرفه', cards: 'مدیریت کارت‌ها', members: 'عضویت و ثبت‌نام', monitoring: 'مانیتورینگ', shifts: 'اختصاص شیفت', 'manual-traffic': 'کنترل ورود و خروج', 'traffic-records': 'مدیریت ورودها و خروج‌ها', 'anpr-monitoring': 'مانیتورینگ تشخیص پلاک', 'integration-settings': 'تنظیم ارتباط با سیستم‌ها', 'ets-import': 'به‌روزرسانی اعضا از ETS', 'excel-import': 'دریافت اطلاعات پرسنلی از Excel', 'member-report': 'گزارش اعضا', 'active-member-report': 'گزارش اعضای دارای عضویت فعال', 'inactive-member-report': 'گزارش اعضای فاقد عضویت فعال', 'member-register-history': 'سابقه عضویت اعضا', 'traffic-reports-list': 'ورود و خروج خودروها', 'door-traffic-reports': 'تعداد تردد روزانه درب‌ها', 'average-parking-time': 'متوسط مدت پارک خودرو', 'parking-income': 'درآمد پارکینگ', 'monthly-parking-income': 'مقایسه درآمد ماهیانه پارکینگ', 'member-cash': 'گردش مالی اعضا', 'user-performance': 'عملکرد مالی کاربران', 'membership-income': 'ریز درآمد فروش حق عضویت', 'cargo-details': 'گزارش جزئیات حمل بار', 'management-monthly-income-comparison': 'مقایسه درآمد ماهانه پارکینگ‌ها', 'management-income-comparison': 'مقایسه درآمد پارکینگ‌ها', 'management-yearly-income-comparison': 'مقایسه درآمد سالانه پارکینگ‌ها', 'management-user-performance': 'عملکرد مالی کاربران', 'management-free-parking-income': 'ریز درآمد پارک آزاد خودروها' },
  },
} as const;

export default fa;
