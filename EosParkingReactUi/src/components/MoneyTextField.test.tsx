import { useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { appTheme } from '../theme';
import { MoneyTextField } from './MoneyTextField';

function MoneyFieldFixture() {
  const [value, setValue] = useState('');
  return <><MoneyTextField label="مبلغ" value={value} onValueChange={setValue} /><output>{value}</output></>;
}

describe('MoneyTextField', () => {
  it('formats a typed amount and emits its canonical API value', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider theme={appTheme}><MoneyFieldFixture /></ThemeProvider>);

    await user.type(screen.getByRole('textbox', { name: 'مبلغ' }), '۱۲۳۴۵۶۷');

    expect(screen.getByRole('textbox', { name: 'مبلغ' })).toHaveValue('1,234,567');
    expect(screen.getByText('1234567')).toBeVisible();
  });
});
