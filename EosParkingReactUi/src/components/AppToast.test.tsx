import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppToast } from './AppToast';

describe('AppToast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  it('closes after three seconds and pauses while hovered', () => {
    const onClose = vi.fn();
    render(<AppToast message="تسویه نقدی انجام شد." onClose={onClose} />);
    act(() => vi.advanceTimersByTime(2000));
    const toast = screen.getByRole('alert').closest('.MuiSnackbar-root')!;
    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(5000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(2999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('gives a new message its own timer and supports keyboard focus and dismiss', () => {
    const onClose = vi.fn();
    const { rerender } = render(<AppToast message="ورود ثبت شد" onClose={onClose} />);
    act(() => vi.advanceTimersByTime(2500));
    rerender(<AppToast message="خروج ثبت شد" onClose={onClose} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(onClose).not.toHaveBeenCalled();
    const close = screen.getByRole('button');
    fireEvent.focus(close);
    act(() => vi.advanceTimersByTime(4000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
