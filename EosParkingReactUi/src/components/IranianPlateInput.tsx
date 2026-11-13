import { useTranslation } from 'react-i18next';
import type { Language } from '../i18n/instance';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import AirportShuttleRoundedIcon from "@mui/icons-material/AirportShuttleRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import RvHookupRoundedIcon from "@mui/icons-material/RvHookupRounded";
import TwoWheelerRoundedIcon from "@mui/icons-material/TwoWheelerRounded";
import {
  Autocomplete,
  IconButton,
  InputBase,
  TextField,
  Typography,
} from "@mui/material";

const plateLetters = [
  "الف",
  "ب",
  "پ",
  "ت",
  "ث",
  "ج",
  "چ",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "ژ",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ک",
  "گ",
  "ل",
  "م",
  "ن",
  "و",
  "ه",
  "ی",
  "♿",
  "D",
  "S",
] as const;
const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

export type IranianPlateParts = {
  left: string;
  letter: string;
  middle: string;
  region: string;
};
export type VehiclePlateType = "0" | "1" | "2" | "3" | "4";

const vehicleTypes: {
  value: VehiclePlateType;
  title: 'motorcycle' | 'trailer' | 'busTruck' | 'vanMinibus' | 'carPickup';
  Icon: typeof DirectionsCarRoundedIcon;
}[] = [
  { value: "1", title: 'motorcycle', Icon: TwoWheelerRoundedIcon },
  { value: "4", title: 'trailer', Icon: RvHookupRoundedIcon },
  { value: "3", title: 'busTruck', Icon: LocalShippingRoundedIcon },
  { value: "2", title: 'vanMinibus', Icon: AirportShuttleRoundedIcon },
  { value: "0", title: 'carPickup', Icon: DirectionsCarRoundedIcon },
];

const englishDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)));
const digits = (value: string, length: number) =>
  englishDigits(value).replace(/\D/g, "").slice(0, length);
const toPersianDigits = (value: string) =>
  value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
const normalizePlateText = (value: string) =>
  englishDigits(value)
    .replace(/[\s\u200e\u200f|_-]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک");

export function parseIranianPlate(value: string): IranianPlateParts {
  const normalized = normalizePlateText(value);
  if (/^\d{9}$/.test(normalized)) {
    const letterIndex = Number(normalized.slice(2, 4));
    const encodedLetter = plateLetters[letterIndex];
    if (encodedLetter)
      return {
        left: normalized.slice(0, 2),
        letter: encodedLetter,
        middle: normalized.slice(4, 7),
        region: normalized.slice(7, 9),
      };
  }
  if (normalized.length < 2)
    return { left: digits(normalized, 2), letter: "", middle: "", region: "" };

  const left = digits(normalized.slice(0, 2), 2);
  const tail = normalized.slice(2);
  const letter =
    [...plateLetters]
      .sort((a, b) => b.length - a.length)
      .find((item) => tail.startsWith(item)) ?? "";
  const numeric = letter ? tail.slice(letter.length) : "";
  if (!letter) {
    const reversedLetter =
      [...plateLetters]
        .sort((a, b) => b.length - a.length)
        .find((item) => normalized.slice(5).startsWith(item)) ?? "";
    if (reversedLetter) {
      const reversedLetterIndex = normalized.indexOf(reversedLetter, 5);
      return {
        left: digits(
          normalized.slice(reversedLetterIndex + reversedLetter.length),
          2,
        ),
        letter: reversedLetter,
        middle: digits(normalized.slice(2, 5), 3),
        region: digits(normalized.slice(0, 2), 2),
      };
    }
  }
  return {
    left,
    letter,
    middle: digits(numeric.slice(0, 3), 3),
    region: digits(numeric.slice(3, 5), 2),
  };
}

export function normalizeIranianPlateValue(value: string) {
  const normalized = normalizePlateText(value);
  const parts = parseIranianPlate(normalized);
  return parts.letter ? toIranianPlateValue(parts) : normalized;
}

export function toIranianPlateValue(parts: IranianPlateParts) {
  return `${digits(parts.left, 2)}${parts.letter}${digits(parts.middle, 3)}${digits(parts.region, 2)}`;
}

const isMotorType = (carType?: string) =>
  carType === "1" || carType?.toLowerCase() === "motor";

export function isValidIranianPlate(value: string, carType?: string) {
  if (isMotorType(carType)) return digits(value, 8).length === 8;
  const { left, letter, middle, region } = parseIranianPlate(value);
  return (
    left.length === 2 &&
    plateLetters.includes(letter as (typeof plateLetters)[number]) &&
    middle.length === 3 &&
    region.length === 2
  );
}

type Props = {
  language?: Language;
  value: string;
  onChange: (value: string) => void;
  label: string;
  carType: string;
  onCarTypeChange: (carType: VehiclePlateType) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onComplete?: () => void;
};

/** Iranian private-vehicle plate entry compatible with the Windows EosPlateControl value. */
export function IranianPlateInput({
  language,
  value,
  onChange,
  label,
  carType,
  onCarTypeChange,
  disabled = false,
  error = false,
  helperText,
  onComplete,
}: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const id = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  const letterInputRef = useRef<HTMLInputElement>(null);
  const middleInputRef = useRef<HTMLInputElement>(null);
  const regionInputRef = useRef<HTMLInputElement>(null);
  const motorSecondInputRef = useRef<HTMLInputElement>(null);
  const parts = parseIranianPlate(value);
  const activeType =
    vehicleTypes.find((item) => item.value === carType)?.value ?? "0";
  const [letterInputValue, setLetterInputValue] = useState(parts.letter);
  useEffect(() => {
    setLetterInputValue(parts.letter);
  }, [parts.letter]);
  const update = (part: keyof IranianPlateParts, next: string) => {
    const nextParts = {
      ...parts,
      [part]:
        part === "letter" ? next : digits(next, part === "middle" ? 3 : 2),
    };
    onChange(toIranianPlateValue(nextParts));
  };

  const motor = isMotorType(activeType);
  const motorValue = digits(value, 8);
  const letterOptions = plateLetters.map((letter) => ({
    label: letter,
    value: letter,
  }));
  const numericProps = (
    name: string,
    maxLength: number,
    accessibleName: string,
  ) => ({
    name,
    inputMode: "numeric" as const,
    maxLength,
    "aria-label": accessibleName,
    dir: "ltr" as const,
  });
  const focusNextTabStop = (source: HTMLElement) => {
    const container = source.closest('[role="dialog"]') ?? document;
    const candidates = Array.from(
      container.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((item) => item.offsetParent !== null);
    const next = candidates[candidates.indexOf(source) + 1];
    window.setTimeout(() => next?.focus(), 0);
  };
  const handleNumericChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    maxLength: number,
    setValue: (nextValue: string) => void,
    nextInput?: RefObject<HTMLInputElement | null>,
  ) => {
    const nextValue = digits(event.target.value, maxLength);
    setValue(nextValue);
    if (nextValue.length !== maxLength) return;
    window.setTimeout(() => {
      if (nextInput?.current) nextInput.current.focus();
      else if (completeRef.current) completeRef.current();
      else focusNextTabStop(event.target);
    }, 0);
  };

  return (
    <div className="iranian-plate-field">
      <div
        className={`iranian-plate-control ${error ? "iranian-plate-control-error" : ""}`}
      >
        <div className="iranian-plate-toolbar" dir="rtl">
          <Typography
            component="label"
            htmlFor={`${id}-left`}
            className="iranian-plate-title"
          >
            {t(`plateInput.${vehicleTypes.find((item) => item.value === activeType)?.title ?? 'carPickup'}`)}
          </Typography>
          <div className="iranian-plate-type-actions">
            {vehicleTypes.map(({ value: type, title, Icon }) => (
              <IconButton
                key={type}
                size="small"
                className={activeType === type ? "is-selected" : ""}
                aria-label={t(`plateInput.${title}`)}
                title={t(`plateInput.${title}`)}
                disabled={disabled}
                onClick={() => {
                  onCarTypeChange(type);
                  onChange("");
                }}
              >
                <Icon fontSize="inherit" />
              </IconButton>
            ))}
          </div>
        </div>
        <div className="iranian-plate-input" dir="ltr">
          <div className="iranian-plate-flag" aria-hidden="true">
            <span className="iranian-plate-flag-stripe iranian-plate-flag-green" />
            <span className="iranian-plate-flag-emblem">●</span>
            <span className="iranian-plate-flag-stripe iranian-plate-flag-red" />
            <small>
              I.R
              <br />
              IRAN
            </small>
          </div>
          {motor ? (
            <div className="iranian-plate-main iranian-motor-plate">
              <InputBase
                inputRef={firstInputRef}
                id={`${id}-left`}
                value={toPersianDigits(motorValue.slice(0, 3))}
                disabled={disabled}
                onChange={(event) =>
                  handleNumericChange(
                    event,
                    3,
                    (first) => onChange(`${first}${motorValue.slice(3)}`),
                    motorSecondInputRef,
                  )
                }
                inputProps={numericProps(
                  "motorFirst",
                  3,
                  t('plateInput.motorFirst', { label }),
                )}
              />
              <InputBase
                inputRef={motorSecondInputRef}
                onKeyDown={event => {
                  if (event.key === 'Backspace' && !motorValue.slice(3)) firstInputRef.current?.focus();
                  if (event.key === 'Enter' && isValidIranianPlate(value, carType)) {
                    event.preventDefault();
                    if (completeRef.current) completeRef.current(); else focusNextTabStop(event.target as HTMLElement);
                  }
                }}
                value={toPersianDigits(motorValue.slice(3))}
                disabled={disabled}
                onChange={(event) =>
                  handleNumericChange(event, 5, (second) =>
                    onChange(`${motorValue.slice(0, 3)}${second}`),
                  )
                }
                inputProps={numericProps(
                  "motorSecond",
                  5,
                  t('plateInput.motorSecond', { label }),
                )}
              />
            </div>
          ) : (
            <>
              <div className="iranian-plate-main iranian-car-plate">
                <InputBase
                  inputRef={firstInputRef}
                  id={`${id}-left`}
                  value={toPersianDigits(parts.left)}
                  disabled={disabled}
                  onChange={(event) =>
                    handleNumericChange(
                      event,
                      2,
                      (left) => update("left", left),
                      letterInputRef,
                    )
                  }
                  inputProps={numericProps("left", 2, t('plateInput.first', { label }))}
                />
                <Autocomplete
                  disabled={disabled}
                  onKeyDown={event => {
                    if (event.key === 'Backspace' && !letterInputValue) firstInputRef.current?.focus();
                    if (event.key === 'Enter' && parts.letter && parts.letter === letterInputValue) {
                      event.preventDefault(); middleInputRef.current?.focus();
                    }
                  }}
                  options={letterOptions}
                  value={letterOptions.find(
                    (item) => item.value === parts.letter,
                  ) ?? null}
                  inputValue={letterInputValue}
                  isOptionEqualToValue={(option, selected) =>
                    option.value === selected.value
                  }
                  onInputChange={(_, nextValue, reason) => {
                    if (reason === "reset") {
                      setLetterInputValue(parts.letter);
                      return;
                    }
                    setLetterInputValue(nextValue);
                  }}
                  onChange={(_, option) => {
                    if (!option) { setLetterInputValue(''); update('letter', ''); return; }
                    setLetterInputValue(option.value);
                    update("letter", option.value);
                    window.setTimeout(() => middleInputRef.current?.focus(), 0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={letterInputRef}
                      variant="standard"
                      slotProps={{
                        ...params.slotProps,
                        htmlInput: {
                          ...params.slotProps.htmlInput,
                          "aria-label": t('plateInput.letter', { label }),
                        },
                      }}
                    />
                  )}
                />
                <InputBase
                  inputRef={middleInputRef}
                  onKeyDown={event => {
                    if (event.key === 'Backspace' && !parts.middle) letterInputRef.current?.focus();
                  }}
                  value={toPersianDigits(parts.middle)}
                  disabled={disabled}
                  onChange={(event) =>
                    handleNumericChange(
                      event,
                      3,
                      (middle) => update("middle", middle),
                      regionInputRef,
                    )
                  }
                  inputProps={numericProps(
                    "middle",
                    3,
                    t('plateInput.middle', { label }),
                  )}
                />
              </div>
              <span className="iranian-plate-divider" aria-hidden="true" />
              <div className="iranian-plate-region">
                <span>ایران</span>
                <InputBase
                  inputRef={regionInputRef}
                  onKeyDown={event => {
                    if (event.key === 'Backspace' && !parts.region) middleInputRef.current?.focus();
                    if (event.key === 'Enter' && isValidIranianPlate(value, carType)) {
                      event.preventDefault();
                      if (completeRef.current) completeRef.current(); else focusNextTabStop(event.target as HTMLElement);
                    }
                  }}
                  value={toPersianDigits(parts.region)}
                  disabled={disabled}
                  onChange={(event) =>
                    handleNumericChange(event, 2, (region) =>
                      update("region", region),
                    )
                  }
                  inputProps={numericProps("region", 2, t('plateInput.region', { label }))}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
        >
          {helperText}
        </Typography>
      )}
    </div>
  );
}
