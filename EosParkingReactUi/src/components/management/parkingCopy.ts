import type { Language, ParkingForm } from './managementTypes';
import { timeMinutes } from './managementTypes';
import i18n from '../../i18n/instance';

export function parkingCopy(language: Language) {
  const text = i18n.getFixedT(language);
  const keys = ['tabs', 'informationTab', 'settingsTab', 'shiftsTab', 'commercialParking', 'userShifts', 'commercialEnabled', 'commercialDisabled', 'shiftsEnabled', 'shiftsDisabled', 'name', 'address', 'phone', 'tax', 'cardCost', 'credit', 'hostelry', 'minHostelry', 'minUnknown', 'billControl', 'roundingBorder', 'roundingValue', 'shift1', 'shift2', 'shift3', 'from', 'to', 'save', 'saved', 'required', 'shiftRequired', 'invalidTime', 'invalidRange', 'shiftGap', 'overlap', 'optionalShift', 'saveError', 'add', 'edit', 'remove', 'removeConfirm', 'cancel', 'createTitle', 'editTitle'] as const;
  return Object.fromEntries(keys.map((key) => [key, text(`parkingForm.${key}`)])) as { [K in typeof keys[number]]: string };
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
