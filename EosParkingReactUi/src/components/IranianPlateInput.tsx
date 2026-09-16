import { useId, useRef, type ChangeEvent, type RefObject } from 'react';
import AirportShuttleRoundedIcon from '@mui/icons-material/AirportShuttleRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import RvHookupRoundedIcon from '@mui/icons-material/RvHookupRounded';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';
import { Autocomplete, IconButton, InputBase, TextField, Typography } from '@mui/material';

const plateLetters = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی', '♿', 'D', 'S'] as const;
const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

export type IranianPlateParts = { left: string; letter: string; middle: string; region: string };
export type VehiclePlateType = '0' | '1' | '2' | '3' | '4';

const vehicleTypes: { value: VehiclePlateType; title: string; Icon: typeof DirectionsCarRoundedIcon }[] = [
  { value: '1', title: 'موتور', Icon: TwoWheelerRoundedIcon },
  { value: '4', title: 'تریلی', Icon: RvHookupRoundedIcon },
  { value: '3', title: 'اتوبوس - کامیون', Icon: LocalShippingRoundedIcon },
  { value: '2', title: 'ون - مینی‌بوس', Icon: AirportShuttleRoundedIcon },
  { value: '0', title: 'سواری و وانت', Icon: DirectionsCarRoundedIcon },
];

const englishDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)));
const digits = (value: string, length: number) => englishDigits(value).replace(/\D/g, '').slice(0, length);
const toPersianDigits = (value: string) => value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);

export function parseIranianPlate(value: string): IranianPlateParts {
  const normalized = englishDigits(value).replace(/[\s|-]/g, '');
  if (normalized.length < 2) return { left: digits(normalized, 2), letter: '', middle: '', region: '' };

  const left = digits(normalized.slice(0, 2), 2);
  const tail = normalized.slice(2);
  const letter = [...plateLetters].sort((a, b) => b.length - a.length).find((item) => tail.startsWith(item)) ?? '';
  const numeric = letter ? tail.slice(letter.length) : '';
  return { left, letter, middle: digits(numeric.slice(0, 3), 3), region: digits(numeric.slice(3, 5), 2) };
}

export function toIranianPlateValue(parts: IranianPlateParts) {
  return `${digits(parts.left, 2)}${parts.letter}${digits(parts.middle, 3)}${digits(parts.region, 2)}`;
}

const isMotorType = (carType?: string) => carType === '1' || carType?.toLowerCase() === 'motor';

export function isValidIranianPlate(value: string, carType?: string) {
  if (isMotorType(carType)) return digits(value, 8).length === 8;
  const { left, letter, middle, region } = parseIranianPlate(value);
  return left.length === 2 && plateLetters.includes(letter as typeof plateLetters[number]) && middle.length === 3 && region.length === 2;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  carType: string;
  onCarTypeChange: (carType: VehiclePlateType) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
};

/** Iranian private-vehicle plate entry compatible with the Windows EosPlateControl value. */
export function IranianPlateInput({ value, onChange, label, carType, onCarTypeChange, disabled = false, error = false, helperText }: Props) {
  const id = useId();
  const letterInputRef = useRef<HTMLInputElement>(null);
  const middleInputRef = useRef<HTMLInputElement>(null);
  const regionInputRef = useRef<HTMLInputElement>(null);
  const motorSecondInputRef = useRef<HTMLInputElement>(null);
  const parts = parseIranianPlate(value);
  const activeType = vehicleTypes.find((item) => item.value === carType)?.value ?? '0';
  const update = (part: keyof IranianPlateParts, next: string) => {
    const nextParts = { ...parts, [part]: part === 'letter' ? next : digits(next, part === 'middle' ? 3 : 2) };
    onChange(toIranianPlateValue(nextParts));
  };

  const motor = isMotorType(activeType);
  const motorValue = digits(value, 8);
  const letterOptions = plateLetters.map((letter) => ({ label: letter, value: letter }));
  const numericProps = (name: string, maxLength: number, accessibleName: string) => ({ name, inputMode: 'numeric' as const, maxLength, 'aria-label': accessibleName, dir: 'ltr' as const });
  const focusNextTabStop = (source: HTMLElement) => {
    const container = source.closest('[role="dialog"]') ?? document;
    const candidates = Array.from(container.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((item) => item.offsetParent !== null);
    const next = candidates[candidates.indexOf(source) + 1];
    window.setTimeout(() => next?.focus(), 0);
  };
  const handleNumericChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, maxLength: number, setValue: (nextValue: string) => void, nextInput?: RefObject<HTMLInputElement | null>) => {
    const nextValue = digits(event.target.value, maxLength);
    setValue(nextValue);
    if (nextValue.length !== maxLength) return;
    window.setTimeout(() => {
      if (nextInput?.current) nextInput.current.focus();
      else focusNextTabStop(event.target);
    }, 0);
  };

  return <div className="iranian-plate-field">
    <div className={`iranian-plate-control ${error ? 'iranian-plate-control-error' : ''}`}>
      <div className="iranian-plate-toolbar" dir="rtl">
        <Typography component="label" htmlFor={`${id}-left`} className="iranian-plate-title">{vehicleTypes.find((item) => item.value === activeType)?.title}</Typography>
        <div className="iranian-plate-type-actions">{vehicleTypes.map(({ value: type, title, Icon }) => <IconButton key={type} size="small" className={activeType === type ? 'is-selected' : ''} aria-label={title} title={title} disabled={disabled} onClick={() => { onCarTypeChange(type); onChange(''); }}><Icon fontSize="inherit" /></IconButton>)}</div>
      </div>
      <div className="iranian-plate-input" dir="ltr">
        <div className="iranian-plate-flag" aria-hidden="true"><span className="iranian-plate-flag-stripe iranian-plate-flag-green" /><span className="iranian-plate-flag-emblem">●</span><span className="iranian-plate-flag-stripe iranian-plate-flag-red" /><small>I.R<br />IRAN</small></div>
        {motor ? <div className="iranian-plate-main iranian-motor-plate">
          <InputBase id={`${id}-left`} value={toPersianDigits(motorValue.slice(0, 3))} disabled={disabled} onChange={(event) => handleNumericChange(event, 3, (first) => onChange(`${first}${motorValue.slice(3)}`), motorSecondInputRef)} inputProps={numericProps('motorFirst', 3, `${label} - سه رقم اول موتور`)} />
          <InputBase inputRef={motorSecondInputRef} value={toPersianDigits(motorValue.slice(3))} disabled={disabled} onChange={(event) => handleNumericChange(event, 5, (second) => onChange(`${motorValue.slice(0, 3)}${second}`))} inputProps={numericProps('motorSecond', 5, `${label} - پنج رقم دوم موتور`)} />
        </div> : <>
          <div className="iranian-plate-main iranian-car-plate">
            <InputBase id={`${id}-left`} value={toPersianDigits(parts.left)} disabled={disabled} onChange={(event) => handleNumericChange(event, 2, (left) => update('left', left), letterInputRef)} inputProps={numericProps('left', 2, `${label} - دو رقم اول`)} />
            <Autocomplete disableClearable disabled={disabled} options={letterOptions} value={letterOptions.find((item) => item.value === parts.letter)} onChange={(_, option) => { update('letter', option.value); window.setTimeout(() => middleInputRef.current?.focus(), 0); }} renderInput={(params) => <TextField {...params} inputRef={letterInputRef} variant="standard" slotProps={{ ...params.slotProps, htmlInput: { ...params.slotProps.htmlInput, 'aria-label': `${label} - حرف پلاک` } }} />} />
            <InputBase inputRef={middleInputRef} value={toPersianDigits(parts.middle)} disabled={disabled} onChange={(event) => handleNumericChange(event, 3, (middle) => update('middle', middle), regionInputRef)} inputProps={numericProps('middle', 3, `${label} - سه رقم میانی`)} />
          </div>
          <span className="iranian-plate-divider" aria-hidden="true" />
          <div className="iranian-plate-region"><span>ایران</span><InputBase inputRef={regionInputRef} value={toPersianDigits(parts.region)} disabled={disabled} onChange={(event) => handleNumericChange(event, 2, (region) => update('region', region))} inputProps={numericProps('region', 2, `${label} - کد منطقه`)} /></div>
        </>}
      </div>
    </div>
    {helperText && <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>{helperText}</Typography>}
  </div>;
}
