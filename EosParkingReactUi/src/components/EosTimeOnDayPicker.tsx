import dayjs, { type Dayjs } from 'dayjs';
import type { TextFieldProps } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { translations, type Language } from '../i18n';

export type EosTimeOnDayUnit = 'seconds' | 'minutes' | 'hours';

type PickerTextFieldProps = Pick<TextFieldProps, 'label' | 'disabled' | 'required' | 'error' | 'helperText' | 'size' | 'fullWidth' | 'variant' | 'sx'>;

export type EosTimeOnDayPickerProps = PickerTextFieldProps & {
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: EosTimeOnDayUnit;
  language?: Language;
  clearable?: boolean;
  readOnly?: boolean;
};

function minuteOfDay(value: number | null, unit: EosTimeOnDayUnit): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  const minutes = unit === 'seconds' ? Math.floor(value / 60) : unit === 'hours' ? Math.round(value * 60) : Math.round(value);
  return minutes >= 0 && minutes < 24 * 60 ? minutes : null;
}

function fromMinuteOfDay(minutes: number, unit: EosTimeOnDayUnit): number {
  if (unit === 'seconds') return minutes * 60;
  if (unit === 'hours') return Number((minutes / 60).toFixed(10));
  return minutes;
}

export function EosTimeOnDayPicker({ value, onChange, unit = 'minutes', language = 'fa', clearable = true, label, disabled = false, readOnly = true, required, error, helperText, size, fullWidth, variant, sx }: EosTimeOnDayPickerProps) {
  const labels = translations[language];
  const pickerLabel = String(label ?? labels.chooseTime);
  const currentMinute = minuteOfDay(value, unit);
  const pickerValue = currentMinute === null
    ? null
    : dayjs().hour(Math.floor(currentMinute / 60)).minute(currentMinute % 60).second(0).millisecond(0);

  const handleChange = (nextValue: Dayjs | null) => {
    if (!nextValue || !nextValue.isValid()) {
      onChange(null);
      return;
    }

    const minutes = nextValue.hour() * 60 + nextValue.minute();
    onChange(minutes >= 0 && minutes < 24 * 60 ? fromMinuteOfDay(minutes, unit) : null);
  };

  return <TimePicker
    label={label ?? labels.chooseTime}
    value={pickerValue}
    onChange={handleChange}
    ampm={false}
    views={['hours', 'minutes']}
    openTo="hours"
    format="HH:mm"
    timeSteps={{ minutes: 1 }}
    disabled={disabled}
    slotProps={{
      field: { clearable, readOnly, 'aria-label': pickerLabel },
      textField: {
        label: label ?? labels.chooseTime,
        required,
        error,
        helperText,
        size: size ?? 'small',
        fullWidth: fullWidth ?? true,
        variant: variant ?? 'outlined',
        sx,
      },
    }}
  />;
}
