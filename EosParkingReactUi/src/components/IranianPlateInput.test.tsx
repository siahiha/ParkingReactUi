import '../i18n/instance';
import { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IranianPlateInput, isValidIranianPlate, parseIranianPlate, toIranianPlateValue } from './IranianPlateInput';

function ControlledPlate({ initialValue = '', onComplete }: { initialValue?: string; onComplete?: () => void } = {}) {
  const [value, setValue] = useState(initialValue);
  const [carType, setCarType] = useState('0');
  return <><IranianPlateInput label="پلاک" value={value} carType={carType} onChange={setValue} onCarTypeChange={setCarType} onComplete={onComplete} /><input aria-label="فیلد بعدی" /></>;
}

describe('IranianPlateInput value helpers', () => {
  afterEach(cleanup);
  it('localizes vehicle actions and segment names when English is explicitly selected', () => {
    const props = { label: 'Plate', value: '', carType: '0', onChange: vi.fn(), onCarTypeChange: vi.fn() };
    const view = render(<IranianPlateInput {...props} language="en" />);
    expect(screen.getByRole('button', { name: 'Motorcycle' })).toHaveAttribute('title', 'Motorcycle');
    expect(screen.getByRole('textbox', { name: 'Plate - first two digits' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Plate - middle three digits' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Car / pickup' })).toBeVisible();
    view.rerender(<IranianPlateInput {...props} language="en" carType="1" />);
    expect(screen.getByRole('textbox', { name: 'Plate - first three motorcycle digits' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Plate - last five motorcycle digits' })).toBeVisible();
  });
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

  it('returns to the preceding empty segment with Backspace', async () => {
    const user = userEvent.setup();
    render(<ControlledPlate />);
    await user.click(screen.getByLabelText('پلاک - کد منطقه'));
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('پلاک - سه رقم میانی')).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('پلاک - حرف پلاک')).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.getByLabelText('پلاک - دو رقم اول')).toHaveFocus();
  });

  it.each([['12ب34567', 1], ['12ب3456', 0]] as const)('only completes a valid plate with Enter: %s', async (initialValue, calls) => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ControlledPlate initialValue={initialValue} onComplete={onComplete} />);
    await user.click(screen.getByLabelText('پلاک - کد منطقه'));
    await user.keyboard('{Enter}');
    expect(onComplete).toHaveBeenCalledTimes(calls);
  });
});
