import { ThemeProvider } from '@mui/material';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { appTheme } from '../theme';
import { AppDataGrid } from './AppDataGrid';

type TestRow = { id: number; name: string; code: string };
type BooleanRow = { id: number; IsActive: boolean };

const rows: TestRow[] = [
  { id: 1, name: 'Alpha', code: 'A-100' },
  { id: 2, name: 'Beta', code: 'B-200' },
];

describe('AppDataGrid column filters', () => {
  afterEach(() => cleanup());

  it('keeps column search hidden by default and opens it from a column menu', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider theme={appTheme}><AppDataGrid direction="ltr" rows={rows} columns={[{ key: 'name', label: 'Name', render: (row) => row.name }, { key: 'code', label: 'Code', render: (row) => row.code }]} rowKey={(row) => row.id} /></ThemeProvider>);

    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Column menu: Name' }));
    expect(screen.getByRole('menu')).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Show column search' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'alp');

    expect(screen.getByText('Alpha')).toBeVisible();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('supports an open default, search modes, case sensitivity, and clearing filters', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider theme={appTheme}><AppDataGrid direction="ltr" defaultFilterOpen defaultSearchMode="equals" rows={rows} columns={[{ key: 'name', label: 'Name', render: (row) => row.name }]} rowKey={(row) => row.id} /></ThemeProvider>);

    const input = screen.getByRole('textbox', { name: 'Name' });
    await user.type(input, 'alp');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Column menu: Name' }));
    await user.click(screen.getByRole('menuitem', { name: /Case sensitive/ }));
    await user.clear(input);
    await user.type(input, 'Alpha');
    expect(screen.getByText('Alpha')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Column menu: Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Clear filters' }));
    expect(screen.getByText('Beta')).toBeVisible();
  });

  it('renders Boolean columns as accessible tick and cross icons', () => {
    const booleanRows: BooleanRow[] = [{ id: 1, IsActive: true }, { id: 2, IsActive: false }];
    render(<ThemeProvider theme={appTheme}><AppDataGrid direction="ltr" rows={booleanRows} columns={[{ key: 'IsActive', label: 'Status', trueLabel: 'Active', falseLabel: 'Inactive' }]} rowKey={(row) => row.id} /></ThemeProvider>);

    expect(screen.getByLabelText('Active')).toBeVisible();
    expect(screen.getByLabelText('Inactive')).toBeVisible();
    expect(screen.queryByText('true')).not.toBeInTheDocument();
    expect(screen.queryByText('false')).not.toBeInTheDocument();
  });
});
