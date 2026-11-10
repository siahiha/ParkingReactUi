import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n/instance';
import { TrafficControlGrids } from './TrafficControlGrids';

const rows = [
  { DumpId: 1, CarPlate: '12ب34567', MemberFullName: 'علی', MemberCode: '123', EnterDateTime: '2026-11-10T09:00:00', ExitDateTime: null },
  { DumpId: 2, CarPlate: '22ب34567', MemberFullName: 'رضا', EnterDateTime: '2026-11-10T10:00:00', ExitDateTime: '2026-11-10T11:00:00', PayType: 0, CommonCost: 10000 },
];
const base = { rows, language: 'fa' as const, loading: false, error: '' as const, updatedAt: null, onExit: vi.fn(), onPay: vi.fn(), onCargo: vi.fn() };
describe('traffic control grids', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it('renders the Windows columns and invokes exit on double-click without opening an editor', () => {
    render(<TrafficControlGrids {...base} />);
    const entries = screen.getByRole('region', { name: 'ورودها (۱)' });
    const exits = screen.getByRole('region', { name: 'خروج‌ها (۱)' });
    expect(within(entries).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['عضویت', 'پلاک', 'زمان ورود', 'خروج', '']);
    expect(within(exits).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['عضویت', 'پلاک', 'زمان خروج', 'وضعیت پرداخت', 'مبلغ پرداختی', '', '']);
    fireEvent.doubleClick(within(entries).getByText('علی - 123'));
    expect(base.onExit).toHaveBeenCalledWith(rows[0]);
    fireEvent.click(within(exits).getByRole('button', { name: 'پرداخت مبلغ خروج' }));
    expect(base.onPay).toHaveBeenCalledWith(rows[1]);
  });
  it('keeps selection and mounted scroll containers during refresh and offers both cargo directions', () => {
    const { rerender } = render(<TrafficControlGrids {...base} />);
    const entry = screen.getByText('علی - 123').closest('tr')!;
    fireEvent.click(entry);
    const wrapper = entry.closest('.app-data-grid-wrapper')!;
    wrapper.scrollTop = 120;
    wrapper.scrollLeft = -30;
    rerender(<TrafficControlGrids {...base} rows={[{ ...rows[0], MemberFullName: 'علی جدید' }, rows[1]]} updatedAt={new Date()} />);
    expect(screen.getByText('علی جدید - 123').closest('tr')).toHaveClass('Mui-selected');
    expect(screen.getByText('علی جدید - 123').closest('.app-data-grid-wrapper')).toBe(wrapper);
    expect(wrapper.scrollTop).toBe(120);
    expect(wrapper.scrollLeft).toBe(-30);
    fireEvent.click(within(screen.getByRole('region', { name: 'ورودها (۱)' })).getByRole('button', { name: 'ثبت بار' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'ثبت بار خروجی' }));
    expect(base.onCargo).toHaveBeenCalledWith(expect.objectContaining({ DumpId: 1 }), true);
  });
  it('shares search across both lists and restores counts when cleared', () => {
    render(<TrafficControlGrids {...base} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'جستجو در ترددها' }), { target: { value: '١٢٣' } });
    expect(screen.getByRole('region', { name: 'ورودها (۱)' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'خروج‌ها (۰)' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'پاک کردن' }));
    expect(screen.getByRole('region', { name: 'خروج‌ها (۱)' })).toBeVisible();
  });
});
