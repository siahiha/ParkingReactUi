import { isValidElement, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Checkbox, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { translations } from '../i18n';
import { BooleanStatusIcon } from './BooleanStatusIcon';

export type AppDataGridColumn<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  /** Value used by the shared column filter when it differs from the row property. */
  getFilterValue?: (row: T, index: number) => unknown;
  /** Set false for action/status columns that should not have a search input. */
  filterable?: boolean;
  filterPlaceholder?: string;
  /** Boolean/status columns stay compact, sized close to their header and icon. */
  compact?: boolean;
  /** Enforces the shared tick/cross presentation for Boolean grid values. */
  boolean?: boolean;
  /** Maps an inversely named Boolean field to the positive UI status when needed. */
  getBooleanValue?: (row: T, index: number) => boolean;
  trueLabel?: string;
  falseLabel?: string;
};

export type AppDataGridSearchMode = 'contains' | 'startsWith' | 'equals';

type AppDataGridProps<T> = {
  rows: T[];
  columns: AppDataGridColumn<T>[];
  rowKey: (row: T, index: number) => string | number;
  direction?: 'rtl' | 'ltr';
  selectedKey?: string | number | null;
  selectedKeys?: Array<string | number>;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  onSelectionChange?: (keys: Array<string | number>) => void;
  isRowSelectable?: (row: T, index: number) => boolean;
  /** Column filters are available by default but remain collapsed until opened. */
  filterable?: boolean;
  defaultFilterOpen?: boolean;
  defaultSearchMode?: AppDataGridSearchMode;
  defaultCaseSensitive?: boolean;
  allowSearchOptions?: boolean;
  allowCaseSensitive?: boolean;
};

type ColumnMenuState = { key: string; anchor: HTMLElement } | null;

/** Shared compact table/grid shell. Column actions belong in the header menu. */
export function AppDataGrid<T>({ rows, columns, rowKey, direction = 'ltr', selectedKey = null, selectedKeys = [], onRowClick, onRowDoubleClick, onSelectionChange, isRowSelectable, filterable = true, defaultFilterOpen = false, defaultSearchMode = 'contains', defaultCaseSensitive = false, allowSearchOptions = true, allowCaseSensitive = true }: AppDataGridProps<T>) {
  const copy = translations[direction === 'rtl' ? 'fa' : 'en'];
  const menuId = useId();
  const [openFilterColumns, setOpenFilterColumns] = useState<string[]>(() => defaultFilterOpen ? columns.filter((column) => column.filterable !== false).map((column) => column.key) : []);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchMode, setSearchMode] = useState<AppDataGridSearchMode>(defaultSearchMode);
  const [caseSensitive, setCaseSensitive] = useState(defaultCaseSensitive);
  const [columnMenu, setColumnMenu] = useState<ColumnMenuState>(null);
  const filterInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const selectionEnabled = Boolean(onSelectionChange);
  const rowEntries = rows.map((row, index) => ({ row, index }));
  const normalized = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };
  const textFromRenderedValue = (value: ReactNode): string => {
    if (value === null || value === undefined || typeof value === 'boolean') return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') return String(value);
    if (Array.isArray(value)) return value.map(textFromRenderedValue).join(' ');
    if (isValidElement(value)) {
      const props = value.props as Record<string, unknown>;
      return textFromRenderedValue((props['aria-label'] ?? props.label ?? props.title ?? props.children) as ReactNode);
    }
    return '';
  };
  const valueForColumn = (row: T, index: number, column: AppDataGridColumn<T>) => {
    if (column.getFilterValue) return normalized(column.getFilterValue(row, index));
    if (column.render) {
      const renderedValue = textFromRenderedValue(column.render(row, index));
      if (renderedValue) return renderedValue;
    }
    if (!row || typeof row !== 'object') return '';
    const record = row as Record<string, unknown>;
    return normalized(record[column.key] ?? record[column.key.charAt(0).toLowerCase() + column.key.slice(1)]);
  };
  const visibleEntries = useMemo(() => rowEntries.filter(({ row, index }) => columns.every((column) => {
    if (column.filterable === false) return true;
    const query = filters[column.key]?.trim() ?? '';
    if (!query) return true;
    const value = valueForColumn(row, index, column);
    const actual = caseSensitive ? value : value.toLocaleLowerCase();
    const expected = caseSensitive ? query : query.toLocaleLowerCase();
    if (searchMode === 'equals') return actual === expected;
    if (searchMode === 'startsWith') return actual.startsWith(expected);
    return actual.includes(expected);
  })), [columns, filters, rowEntries, searchMode, caseSensitive]);
  const selectableEntries = visibleEntries.filter(({ row, index }) => isRowSelectable?.(row, index) ?? true);
  const selectedSet = new Set(selectedKeys.map(String));
  const selectedSelectableCount = selectableEntries.filter(({ row, index }) => selectedSet.has(String(rowKey(row, index)))).length;
  const allSelected = selectableEntries.length > 0 && selectedSelectableCount === selectableEntries.length;
  const someSelected = selectedSelectableCount > 0 && !allSelected;
  const activeMenuColumn = columnMenu ? columns.find((column) => column.key === columnMenu.key) : undefined;
  const activeMenuFilter = activeMenuColumn ? filters[activeMenuColumn.key]?.trim() ?? '' : '';
  const activeMenuFilterOpen = activeMenuColumn ? openFilterColumns.includes(activeMenuColumn.key) : false;
  const hasActiveFilters = Object.values(filters).some((value) => value.trim().length > 0);
  const closeColumnMenu = () => setColumnMenu(null);
  const openColumnMenu = (event: React.MouseEvent<HTMLElement>, column: AppDataGridColumn<T>) => {
    event.stopPropagation();
    setColumnMenu({ key: column.key, anchor: event.currentTarget });
  };
  const focusColumnFilter = (key: string) => {
    window.requestAnimationFrame(() => filterInputRefs.current[key]?.focus());
  };
  const showColumnFilter = () => {
    if (!activeMenuColumn || activeMenuColumn.filterable === false) return;
    setOpenFilterColumns((current) => current.includes(activeMenuColumn.key) ? current : [...current, activeMenuColumn.key]);
    focusColumnFilter(activeMenuColumn.key);
    closeColumnMenu();
  };
  const hideColumnFilter = () => {
    if (!activeMenuColumn) return;
    setOpenFilterColumns((current) => current.filter((key) => key !== activeMenuColumn.key));
    closeColumnMenu();
  };
  const updateFilter = (key: string, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const clearColumnFilter = () => {
    if (!activeMenuColumn) return;
    setFilters((current) => ({ ...current, [activeMenuColumn.key]: '' }));
    closeColumnMenu();
  };
  const clearFilters = () => {
    setFilters({});
    closeColumnMenu();
  };
  const selectSearchMode = (mode: AppDataGridSearchMode) => {
    setSearchMode(mode);
    closeColumnMenu();
  };
  const toggleCaseSensitive = () => {
    setCaseSensitive((current) => !current);
    closeColumnMenu();
  };
  const toggleAll = () => {
    const visibleKeys = new Set(selectableEntries.map(({ row, index }) => String(rowKey(row, index))));
    if (allSelected) {
      onSelectionChange?.(selectedKeys.filter((key) => !visibleKeys.has(String(key))));
      return;
    }
    onSelectionChange?.([...selectedKeys, ...selectableEntries.map(({ row, index }) => rowKey(row, index)).filter((key) => !selectedSet.has(String(key)))]);
  };
  const toggleRow = (key: string | number, checked: boolean) => onSelectionChange?.(checked ? [...selectedKeys.filter((value) => String(value) !== String(key)), key] : selectedKeys.filter((value) => String(value) !== String(key)));
  const isCompactColumn = (column: AppDataGridColumn<T>) => column.compact ?? /^(Is|Has)[A-Z]/.test(column.key);
  const booleanForColumn = (column: AppDataGridColumn<T>) => column.boolean ?? /^(Is|Has)[A-Z]|Disabled$/.test(column.key);
  const booleanValueForColumn = (row: T, index: number, column: AppDataGridColumn<T>) => {
    if (column.getBooleanValue) return column.getBooleanValue(row, index);
    const value = column.getFilterValue ? column.getFilterValue(row, index) : (row as Record<string, unknown>)[column.key] ?? (row as Record<string, unknown>)[column.key.charAt(0).toLowerCase() + column.key.slice(1)];
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  };
  const booleanLabels = direction === 'rtl' ? { yes: 'بله', no: 'خیر' } : { yes: 'Yes', no: 'No' };
  const headerCell = (column: AppDataGridColumn<T>) => <TableCell key={column.key} className={`app-data-grid-header-cell-root${isCompactColumn(column) ? ' app-data-grid-compact-cell' : ''}`}>
    <Box className="app-data-grid-header-cell-content">
      <Box className="app-data-grid-header-content">
        <span>{column.label}</span>
        {filterable && column.filterable !== false && <button type="button" className={`app-data-grid-column-menu-button${filters[column.key]?.trim() ? ' is-active' : ''}`} aria-label={`${copy.columnMenu}: ${column.label}`} title={`${copy.columnMenu}: ${column.label}`} aria-haspopup="menu" aria-expanded={columnMenu?.key === column.key} aria-controls={columnMenu?.key === column.key ? menuId : undefined} onClick={(event) => openColumnMenu(event, column)}><MoreVertRoundedIcon fontSize="small" /></button>}
      </Box>
      {filterable && column.filterable !== false && openFilterColumns.includes(column.key) && <TextField className="app-data-grid-filter-input" size="small" variant="outlined" value={filters[column.key] ?? ''} placeholder={column.filterPlaceholder ?? copy.filterColumn} onChange={(event) => updateFilter(column.key, event.target.value)} inputRef={(node) => { filterInputRefs.current[column.key] = node; }} slotProps={{ htmlInput: { 'aria-label': column.label } }} />}
    </Box>
  </TableCell>;
  return (
    <Box className="app-data-grid-wrapper" dir={direction}>
      <Table size="small" className="app-data-grid">
        <TableHead>
          <TableRow>{selectionEnabled && <TableCell className="app-data-grid-selection-cell" padding="checkbox"><Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} slotProps={{ input: { 'aria-label': copy.selectAllRows } }} /></TableCell>}{columns.map(headerCell)}</TableRow>
        </TableHead>
        <TableBody>{visibleEntries.map(({ row, index }) => {
          const key = rowKey(row, index);
          const selectable = isRowSelectable?.(row, index) ?? true;
          const checked = selectedSet.has(String(key));
          const activateRow = () => onRowClick?.(row, index);
          const activateRowForEdit = () => onRowDoubleClick?.(row, index);
          const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
            if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            activateRow();
          };
          return <TableRow key={String(key)} hover selected={selectedKey === key || checked} onClick={activateRow} onDoubleClick={activateRowForEdit} onKeyDown={handleRowKeyDown} tabIndex={onRowClick ? 0 : undefined} className={onRowClick ? 'app-data-grid-row' : undefined}>
            {selectionEnabled && <TableCell className="app-data-grid-selection-cell" padding="checkbox"><Checkbox size="small" checked={checked} disabled={!selectable} onClick={(event) => event.stopPropagation()} onChange={(event) => toggleRow(key, event.target.checked)} slotProps={{ input: { 'aria-label': copy.selectRow } }} /></TableCell>}
            {columns.map((column) => <TableCell key={column.key} className={isCompactColumn(column) ? 'app-data-grid-compact-cell' : undefined}>{booleanForColumn(column) ? <BooleanStatusIcon value={booleanValueForColumn(row, index, column)} trueLabel={column.trueLabel ?? booleanLabels.yes} falseLabel={column.falseLabel ?? booleanLabels.no} /> : column.render ? column.render(row, index) : '—'}</TableCell>)}
          </TableRow>;
        })}</TableBody>
      </Table>
      {filterable && hasActiveFilters && visibleEntries.length === 0 && rows.length > 0 && <Box className="app-data-grid-no-results">{copy.noFilterResults}</Box>}
      <Menu id={menuId} className="app-data-grid-column-menu" anchorEl={columnMenu?.anchor ?? null} open={Boolean(columnMenu)} onClose={closeColumnMenu} anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'right' : 'left' }} transformOrigin={{ vertical: 'top', horizontal: direction === 'rtl' ? 'right' : 'left' }}>
        <MenuItem onClick={activeMenuFilterOpen ? hideColumnFilter : showColumnFilter}><ListItemIcon>{activeMenuFilterOpen ? <ClearRoundedIcon fontSize="small" /> : <SearchRoundedIcon fontSize="small" />}</ListItemIcon><ListItemText>{activeMenuFilterOpen ? copy.hideColumnSearch : copy.showColumnSearch}</ListItemText></MenuItem>
        {allowSearchOptions && <>
          <Divider />
          <MenuItem selected={searchMode === 'contains'} onClick={() => selectSearchMode('contains')}><ListItemIcon><FilterListRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>{copy.contains}</ListItemText></MenuItem>
          <MenuItem selected={searchMode === 'startsWith'} onClick={() => selectSearchMode('startsWith')}><ListItemIcon><FilterListRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>{copy.startsWith}</ListItemText></MenuItem>
          <MenuItem selected={searchMode === 'equals'} onClick={() => selectSearchMode('equals')}><ListItemIcon><FilterListRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>{copy.equals}</ListItemText></MenuItem>
          {allowCaseSensitive && <MenuItem aria-label={copy.caseSensitive} onClick={toggleCaseSensitive}><ListItemIcon><Checkbox edge="start" size="small" checked={caseSensitive} tabIndex={-1} disableRipple slotProps={{ input: { 'aria-label': copy.caseSensitive } }} /></ListItemIcon><ListItemText>{copy.caseSensitive}</ListItemText></MenuItem>}
        </>}
        {activeMenuFilter && <MenuItem onClick={clearColumnFilter}><ListItemIcon><ClearRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>{copy.clearColumnFilter}</ListItemText></MenuItem>}
        {hasActiveFilters && <MenuItem onClick={clearFilters}><ListItemIcon><ClearAllRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>{copy.clearFilters}</ListItemText></MenuItem>}
      </Menu>
    </Box>
  );
}
