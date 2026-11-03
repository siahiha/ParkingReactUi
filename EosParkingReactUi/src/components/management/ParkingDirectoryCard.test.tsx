import '../../i18n/instance';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ParkingDirectoryCard } from './ParkingDirectoryCard';
import { parkingCopy } from './parkingCopy';

afterEach(cleanup);

it('shows the real identity, contact information and both independent statuses', () => {
  const copy = parkingCopy('fa');
  render(<ParkingDirectoryCard id={7} language="fa" row={{ ParkingName: 'پارکینگ مرکزی', Address: 'خیابان اصلی', PhonNumber: '02112345678', IsCommercialParking: true, HasUserShifts: false }} onEdit={vi.fn()} onRemove={vi.fn()} />);
  expect(screen.getByRole('heading', { name: 'پارکینگ مرکزی' })).toBeVisible();
  for (const value of ['خیابان اصلی', '02112345678', '۷', copy.commercialEnabled, copy.shiftsDisabled]) expect(screen.getByText(value)).toBeVisible();
});

it('preserves edit and delete callbacks and keyboard operation', async () => {
  const copy = parkingCopy('fa');
  const onEdit = vi.fn(); const onRemove = vi.fn();
  render(<ParkingDirectoryCard id={7} language="fa" row={{ ParkingName: 'پارکینگ' }} onEdit={onEdit} onRemove={onRemove} />);
  const user = userEvent.setup();
  screen.getByRole('button', { name: copy.edit }).focus();
  await user.keyboard('{Enter}');
  expect(onEdit).toHaveBeenCalledOnce();
  expect(onRemove).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: copy.remove }));
  expect(onRemove).toHaveBeenCalledOnce();
});

it('keeps missing fields safe and does not invent live statistics', () => {
  render(<ParkingDirectoryCard id={12} language="en" row={{}} onEdit={vi.fn()} onRemove={vi.fn()} />);
  expect(screen.getByRole('heading')).toBeVisible();
  expect(screen.getAllByText('—')).toHaveLength(2);
  expect(screen.queryByText(/capacity|occupied|online/i)).toBeNull();
});
