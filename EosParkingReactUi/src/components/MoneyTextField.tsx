import { TextField, type TextFieldProps } from '@mui/material';
import { formatMoneyInput, normalizeMoneyInput } from '../utils/formatters';

type MoneyTextFieldProps = Omit<TextFieldProps, 'onChange' | 'type' | 'value'> & {
  value: string | number | null | undefined;
  onValueChange: (value: string) => void;
};

export function MoneyTextField({ value, onValueChange, slotProps, ...props }: MoneyTextFieldProps) {
  return (
    <TextField
      {...props}
      type="text"
      value={formatMoneyInput(value)}
      onChange={(event) => onValueChange(normalizeMoneyInput(event.target.value))}
      slotProps={{
        ...slotProps,
        htmlInput: {
          ...slotProps?.htmlInput,
          dir: 'ltr',
          inputMode: 'numeric',
          pattern: '[0-9]*',
        },
      }}
    />
  );
}
