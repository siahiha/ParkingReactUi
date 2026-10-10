import type { Language, ParkingForm } from './managementTypes';
import { timeMinutes } from './managementTypes';

export function parkingCopy(language: Language) {
  return language === 'fa'
    ? { tabs: 'تب‌های مشخصات پارکینگ', informationTab: 'مشخصات', settingsTab: 'تنظیمات', shiftsTab: 'شیفت‌ها', commercialParking: 'پارکینگ تجاری', userShifts: 'شیفت کاربران', name: 'نام پارکینگ', address: 'آدرس', phone: 'تلفن', tax: 'درصد مالیات', cardCost: 'مبلغ مفقودی کارت', credit: 'حداکثر اعتبار قابل انتقال', hostelry: 'تعرفه شبانه‌روزی', minHostelry: 'حداقل توقف تعرفه شبانه‌روزی (ساعت)', minUnknown: 'حداقل دریافتی خودرو با ورود نامشخص', billControl: 'امکان ثبت فیش کنترلی', roundingBorder: 'مرز گرد کردن مبالغ', roundingValue: 'مقدار گرد کردن مبالغ', shift1: 'شیفت اول', shift2: 'شیفت دوم', shift3: 'شیفت سوم', from: 'از', to: 'تا', save: 'ذخیره پارکینگ', saved: 'اطلاعات پارکینگ ذخیره شد.', required: 'نام پارکینگ الزامی است.', shiftRequired: 'زمان شروع و پایان شیفت اول الزامی است.', invalidTime: 'فرمت زمان باید معتبر باشد.', invalidRange: 'زمان پایان باید بعد از زمان شروع باشد.', shiftGap: 'شروع هر شیفت باید یک دقیقه بعد از پایان شیفت قبل باشد.', overlap: 'بازه‌های شیفت‌ها نباید با هم هم‌پوشانی داشته باشند.', optionalShift: 'برای فعال‌سازی هر شیفت، زمان شروع و پایان را کامل کنید.', saveError: 'ذخیره اطلاعات پارکینگ ناموفق بود.', add: 'پارکینگ جدید', edit: 'ویرایش', remove: 'حذف', removeConfirm: 'آیا از حذف این پارکینگ مطمئن هستید؟', cancel: 'انصراف', createTitle: 'افزودن پارکینگ', editTitle: 'ویرایش پارکینگ' }
    : { tabs: 'Parking details tabs', informationTab: 'Information', settingsTab: 'Settings', shiftsTab: 'Shifts', commercialParking: 'Commercial parking', userShifts: 'User shifts', name: 'Parking name', address: 'Address', phone: 'Phone', tax: 'Tax rate', cardCost: 'Lost card cost', credit: 'Maximum transferable credit', hostelry: 'Hostelry tariff', minHostelry: 'Minimum hostelry duration (hours)', minUnknown: 'Minimum charge for unknown entry', billControl: 'Control bill support', roundingBorder: 'Rounding money border', roundingValue: 'Rounding money value', shift1: 'Shift 1', shift2: 'Shift 2', shift3: 'Shift 3', from: 'From', to: 'To', save: 'Save parking', saved: 'Parking information saved.', required: 'Parking name is required.', shiftRequired: 'Shift 1 start and end are required.', invalidTime: 'Enter a valid time.', invalidRange: 'Shift end must be after its start.', shiftGap: 'Each shift must start one minute after the previous shift ends.', overlap: 'Shift ranges must not overlap.', optionalShift: 'Complete both start and end times to enable a shift.', saveError: 'Saving parking information failed.', add: 'New parking', edit: 'Edit', remove: 'Delete', removeConfirm: 'Are you sure you want to delete this parking?', cancel: 'Cancel', createTitle: 'Add parking', editTitle: 'Edit parking' };
}

export type ParkingCopy = ReturnType<typeof parkingCopy>;

export function validateParkingForm(form: ParkingForm, copy: ParkingCopy): string | null {
  if (!form.ParkingName.trim()) return copy.required;
  if (!form.HasUserShifts) return null;
  const timeFields = [
    form.Shift1FromTime,
    form.Shift1ToTime,
    ...(form.IsShift2Enabled ? [form.Shift2FromTime, form.Shift2ToTime] : []),
    ...(form.IsShift3Enabled ? [form.Shift3FromTime, form.Shift3ToTime] : []),
  ];
  if (timeFields.some((value) => value && timeMinutes(value) === null)) return copy.invalidTime;
  if (!form.Shift1FromTime || !form.Shift1ToTime) return copy.shiftRequired;
  if (form.IsShift3Enabled && !form.IsShift2Enabled) return copy.optionalShift;
  const optionalRows = [
    ...(form.IsShift2Enabled ? [[form.Shift2FromTime, form.Shift2ToTime] as const] : []),
    ...(form.IsShift3Enabled ? [[form.Shift3FromTime, form.Shift3ToTime] as const] : []),
  ];
  if (optionalRows.some(([from, to]) => !from || !to)) return copy.optionalShift;

  const shifts = [
    [form.Shift1FromTime, form.Shift1ToTime] as const,
    ...(form.IsShift2Enabled ? [[form.Shift2FromTime, form.Shift2ToTime] as const] : []),
    ...(form.IsShift3Enabled ? [[form.Shift3FromTime, form.Shift3ToTime] as const] : []),
  ];
  const parsedShifts = shifts.map(([from, to]) => [timeMinutes(from), timeMinutes(to)] as const);
  if (parsedShifts.some(([from, to]) => from === null || to === null)) return copy.optionalShift;
  if (parsedShifts.some(([from, to]) => from! >= to!)) return copy.invalidRange;
  for (let index = 1; index < parsedShifts.length; index += 1) {
    if (parsedShifts[index][0] !== parsedShifts[index - 1][1]! + 1) return copy.shiftGap;
  }
  for (let index = 0; index < parsedShifts.length; index += 1) {
    for (let next = index + 1; next < parsedShifts.length; next += 1) {
      const first = parsedShifts[index];
      const second = parsedShifts[next];
      if (first[0]! < second[1]! && second[0]! < first[1]!) return copy.overlap;
    }
  }
  return null;
}
