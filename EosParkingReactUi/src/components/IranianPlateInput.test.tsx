import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { IranianPlateInput, isValidIranianPlate, parseIranianPlate, toIranianPlateValue } from './IranianPlateInput';

function ControlledPlate() {
  const [value, setValue] = useState('');
  const [carType, setCarType] = useState('0');
  return <><IranianPlateInput label="پلاک" value={value} carType={carType} onChange={setValue} onCarTypeChange={setCarType} /><input aria-label="فیلد بعدی" /></>;
}

describe('IranianPlateInput value helpers', () => {
  it('uses the EosPlateControl storage order and normalizes Persian digits', () => {
    const parts = parseIranianPlate('۱۲ ب ۳۴۵ - ۶۷');
    expect(parts).toEqual({ left: '12', letter: 'ب', middle: '345', region: '67' });
    expect(toIranianPlateValue(parts)).toBe('12ب34567');
  });

  it('requires all private-vehicle plate segments', () => {
    expect(isValidIranianPlate('12ب34567')).toBe(true);
    expect(isValidIranianPlate('12ب3456')).toBe(false);
  });

  it('uses the Windows motorcycle plate format of three plus five digits', () => {
    expect(isValidIranianPlate('12345678', '1')).toBe(true);
    expect(isValidIranianPlate('1234567', '1')).toBe(false);
  });

  it('moves to the next plate segment when the current segment is full', async () => {
    const user = userEvent.setup();
    render(<ControlledPlate />);
    await user.type(screen.getByLabelText('پلاک - دو رقم اول'), '۱۲');
    await waitFor(() => expect(screen.getByLabelText('پلاک - حرف پلاک')).toHaveFocus());
  });
});
