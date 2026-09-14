import type { KeyboardEvent, ReactNode } from 'react';
import { Box, Checkbox, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { translations } from '../i18n';

export type AppDataGridColumn<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  /** Boolean/status columns stay compact, sized close to their header and icon. */
  compact?: boolean;
};

type AppDataGridProps<T> = {
  rows: T[];
  columns: AppDataGridColumn<T>[];
  rowKey: (row: T, index: number) => string | number;
  direction?: 'rtl' | 'ltr';
  selectedKey?: string | number | null;
  selectedKeys?: Array<string | number>;
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (keys: Array<string | number>) => void;
  isRowSelectable?: (row: T, index: number) => boolean;
};

/** Shared compact table/grid shell. Row actions belong in the parent toolbar. */
export function AppDataGrid<T>({ rows, columns, rowKey, direction = 'ltr', selectedKey = null, selectedKeys = [], onRowClick, onSelectionChange, isRowSelectable }: AppDataGridProps<T>) {
  const copy = translations[direction === 'rtl' ? 'fa' : 'en'];
  const selectionEnabled = Boolean(onSelectionChange);
  const selectableEntries = rows.map((row, index) => ({ row, index })).filter(({ row, index }) => isRowSelectable?.(row, index) ?? true);
  const selectedSet = new Set(selectedKeys.map(String));
  const selectedSelectableCount = selectableEntries.filter(({ row, index }) => selectedSet.has(String(rowKey(row, index)))).length;
  const allSelected = selectableEntries.length > 0 && selectedSelectableCount === selectableEntries.length;
  const someSelected = selectedSelectableCount > 0 && !allSelected;
  const toggleAll = () => onSelectionChange?.(allSelected ? [] : selectableEntries.map(({ row, index }) => rowKey(row, index)));
  const toggleRow = (key: string | number, checked: boolean) => onSelectionChange?.(checked ? [...selectedKeys.filter((value) => String(value) !== String(key)), key] : selectedKeys.filter((value) => String(value) !== String(key)));
  const isCompactColumn = (column: AppDataGridColumn<T>) => column.compact ?? /^(Is|Has)[A-Z]/.test(column.key);
  return (
    <Box className="app-data-grid-wrapper" dir={direction}>
      <Table size="small" className="app-data-grid">
        <TableHead><TableRow>{selectionEnabled && <TableCell className="app-data-grid-selection-cell" padding="checkbox"><Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} slotProps={{ input: { 'aria-label': copy.selectAllRows } }} /></TableCell>}{columns.map((column) => <TableCell key={column.key} className={isCompactColumn(column) ? 'app-data-grid-compact-cell' : undefined}>{column.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{rows.map((row, index) => {
          const key = rowKey(row, index);
          const selectable = isRowSelectable?.(row, index) ?? true;
          const checked = selectedSet.has(String(key));
          const activateRow = () => onRowClick?.(row, index);
          const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
            if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            activateRow();
          };
          return <TableRow key={String(key)} hover selected={selectedKey === key || checked} onClick={activateRow} onKeyDown={handleRowKeyDown} tabIndex={onRowClick ? 0 : undefined} className={onRowClick ? 'app-data-grid-row' : undefined}>
            {selectionEnabled && <TableCell className="app-data-grid-selection-cell" padding="checkbox"><Checkbox size="small" checked={checked} disabled={!selectable} onClick={(event) => event.stopPropagation()} onChange={(event) => toggleRow(key, event.target.checked)} slotProps={{ input: { 'aria-label': copy.selectRow } }} /></TableCell>}
            {columns.map((column) => <TableCell key={column.key} className={isCompactColumn(column) ? 'app-data-grid-compact-cell' : undefined}>{column.render ? column.render(row, index) : '—'}</TableCell>)}
          </TableRow>;
        })}</TableBody>
      </Table>
    </Box>
  );
}
