import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

afterEach(cleanup);

it('reveals the live error on hover or keyboard focus without rendering a banner or taking focus', async () => {
  const user = userEvent.setup();
  const message = 'Live updates are unavailable.';
  render(<><input aria-label="Plate" /><ConnectionStatusIndicator message={message} /></>);
  const input = screen.getByRole('textbox');
  await user.click(input);
  const indicator = screen.getByRole('img', { name: message });
  expect(screen.queryByText(message)).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.hover(indicator);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(message);
  expect(input).toHaveFocus();
  await user.unhover(indicator);
  await user.tab();
  expect(indicator).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(message);
});
