import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Box, Button, IconButton, LinearProgress, Menu, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppDataGrid, type AppDataGridColumn } from '../../components/AppDataGrid';
import { ConnectionStatusIndicator } from '../../components/ConnectionStatusIndicator';
import { formatDateTime, formatNumber, formatTime } from '../../utils/formatters';
import type { Language } from '../../i18n/instance';
import { membershipText, splitTrafficRows, trafficField, trafficId, type TrafficGridRow } from './trafficGridData';
import { useTrafficGridEmphasis, type TrafficGridId, type TrafficGridEvents } from './useTrafficGridEmphasis';
import exitIcon from '../../assets/traffic/exit-21.png';
import cargoIcon from '../../assets/traffic/deliver-21.png';
import paymentIcon from '../../assets/traffic/Cost21.png';
import inboundIcon from '../../assets/traffic/inCargo-16.png';
import outboundIcon from '../../assets/traffic/outCargo-16.png';
import './trafficGrids.css';

type Props = {
  rows: TrafficGridRow[];
  language: Language;
  loading: boolean;
  error: 'loadError' | 'forbidden' | '';
  updatedAt: Date | null;
  busy?: boolean;
  onExit: (row: TrafficGridRow) => void;
  onPay: (row: TrafficGridRow) => void;
  onCargo: (row: TrafficGridRow, outbound: boolean) => void;
};
function TrafficTable({ title, rows, columns, language, emphasized, initialFocus = false, events, onActivate, errorMessage }: {
  title: string; rows: TrafficGridRow[]; columns: AppDataGridColumn<TrafficGridRow>[];
  language: Language; emphasized: boolean; initialFocus?: boolean; events: TrafficGridEvents;
  onActivate?: (row: TrafficGridRow) => void;
  errorMessage: string;
}) {
  const { t } = useTranslation(undefined, { lng: language });
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [selection, setSelection] = useState<{ id: string; index: number } | null>(null);
  useEffect(() => {
    if (initialFocus) panelRef.current?.focus({ preventScroll: true });
  }, [initialFocus]);
  useEffect(() => {
    setSelection(previous => {
      if (!previous) return previous;
      const currentIndex = rows.findIndex(row => trafficId(row) === previous.id);
      if (currentIndex >= 0) return currentIndex === previous.index ? previous : { ...previous, index: currentIndex };
      const index = Math.min(previous.index, rows.length - 1);
      return index >= 0 ? { id: trafficId(rows[index]), index } : null;
    });
  }, [rows]);
  return <Paper ref={panelRef} component="section" variant="outlined" className={`traffic-split-panel${emphasized ? ' is-emphasized' : ''}`} aria-labelledby={headingId} tabIndex={0}
    {...events}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, minHeight: 28, boxSizing: 'border-box' }}>
      <Typography component="h3" variant="subtitle2" id={headingId}>
        {title} ({formatNumber(rows.length, language)})
      </Typography>
      <ConnectionStatusIndicator message={errorMessage} />
    </Box>
    <AppDataGrid rows={rows} columns={columns} rowKey={trafficId} direction={language === 'fa' ? 'rtl' : 'ltr'}
      filterable={false} selectedKey={selection?.id}
      onRowClick={(row, index) => setSelection({ id: trafficId(row), index })}
      onRowFocus={(row, index) => setSelection({ id: trafficId(row), index })}
      onRowDoubleClick={onActivate ? row => onActivate(row) : undefined} />
    {rows.length === 0 && <Typography role="status" className="traffic-grid-empty" variant="body2">{t('trafficGrid.empty')}</Typography>}
  </Paper>;
}

export const TrafficControlGrids = memo(function TrafficControlGrids({ rows, language, loading, error, updatedAt, busy = false, onExit, onPay, onCargo }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const [search, setSearch] = useState('');
  const [cargoMenu, setCargoMenu] = useState<{ anchor: HTMLElement; row: TrafficGridRow; grid: TrafficGridId } | null>(null);
  const emphasis = useTrafficGridEmphasis(cargoMenu?.grid ?? null);
  const { entries, exits } = useMemo(() => splitTrafficRows(rows, search), [rows, search]);
  const detailText = (value: string, visible = value, direction?: 'ltr') => <Tooltip title={value} arrow>
    <span className="traffic-grid-text" tabIndex={0} dir={direction}>{visible}</span>
  </Tooltip>;
  const timeText = (value: unknown) => {
    const date = new Date(String(value ?? ''));
    return detailText(formatDateTime(value, language), Number.isNaN(date.getTime()) ? '—' : formatTime(date, language, { hour: '2-digit', minute: '2-digit', hour12: false }), 'ltr');
  };
  const action = (label: string, image: string, run: (anchor: HTMLElement) => void, always = false) =>
    <Tooltip title={label} arrow slotProps={{ popper: { modifiers: [{ name: 'preventOverflow', options: { rootBoundary: 'viewport', tether: false, padding: 8 } }] } }}><span className={always ? 'traffic-grid-action' : 'traffic-grid-action traffic-grid-focused-action'}>
      <IconButton size="small" aria-label={label} disabled={busy}
        onDoubleClick={event => event.stopPropagation()}
        onClick={event => { event.stopPropagation(); run(event.currentTarget); }}>
        <Box component="img" src={image} alt="" sx={{ inlineSize: 21, blockSize: 21, bgcolor: 'common.white', borderRadius: 1 }} />
      </IconButton>
    </span></Tooltip>;
  const membership: AppDataGridColumn<TrafficGridRow> = {
    key: 'MembershipDisplay', label: t('trafficGrid.membership'),
    render: row => detailText(membershipText(row) || '—'),
  };
  const plate: AppDataGridColumn<TrafficGridRow> = {
    key: 'CarPlate', label: t('trafficGrid.plate'), width: 120,
    render: row => <span dir="ltr">{trafficField(row, 'CarPlateReversed') ?? trafficField(row, 'CarPlate') ?? '—'}</span>,
  };
  const cargo = (grid: TrafficGridId): AppDataGridColumn<TrafficGridRow> => ({
    key: 'CargoAction', label: '', width: 30, compact: true,
    render: row => action(t('trafficGrid.cargo'), cargoIcon, anchor => setCargoMenu({ anchor, row, grid })),
  });
  const entryColumns: AppDataGridColumn<TrafficGridRow>[] = [membership, plate,
    { key: 'EnterDateTime', label: t('trafficGrid.entryTime'), width: 54, render: row => timeText(trafficField(row, 'EnterDateTime')) },
    { key: 'ExitAction', label: t('trafficGrid.exit'), width: 30, compact: true, render: row => action(t('trafficGrid.exit'), exitIcon, () => onExit(row), true) }, cargo('entries'),
  ];
  const exitColumns: AppDataGridColumn<TrafficGridRow>[] = [membership, plate,
    { key: 'ExitDateTime', label: t('trafficGrid.exitTime'), width: 54, render: row => timeText(trafficField(row, 'ExitDateTime')) },
    { key: 'PayType', label: t('trafficGrid.paymentShort'), render: row => {
      const value = trafficField(row, 'PayType');
      const index = Number(value);
      return detailText(value === null || value === undefined ? '—' : Number.isInteger(index) && index >= 0 && index <= 9
        ? t('trafficGrid.paymentTypes', { returnObjects: true })[index] : String(value));
    } },
    { key: 'CommonCost', label: t('trafficGrid.amountShort'), width: 92, render: row => formatNumber(trafficField(row, 'CommonCost') as string | number | null, language) },
    cargo('exits'),
    { key: 'PayAction', label: '', width: 30, compact: true, render: row => action(t('trafficGrid.pay'), paymentIcon, () => onPay(row)) },
  ];
  const chooseCargo = (outbound: boolean) => {
    if (cargoMenu) onCargo(cargoMenu.row, outbound);
    setCargoMenu(null);
  };
  return <Box className="traffic-details-section traffic-split-grids" dir={language === 'fa' ? 'rtl' : 'ltr'}>
    <Box className="traffic-grid-search" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <TextField size="small" label={t('trafficGrid.search')} placeholder={t('trafficGrid.searchHint')}
        value={search} onChange={event => setSearch(event.target.value)} sx={{ flex: '1 1 260px' }} />
      <Button size="small" onClick={() => setSearch('')} disabled={!search}>{t('trafficGrid.clear')}</Button>
      {updatedAt && <Typography variant="caption" color="text.secondary">{t('trafficGrid.updatedAt', { time: formatTime(updatedAt, language) })}</Typography>}
    </Box>
    {loading && <LinearProgress aria-label={t('trafficGrid.loading')} />}
    <Box className="traffic-split-grid-layout" data-active-grid={emphasis.activeGrid ?? undefined}>
      <TrafficTable title={t('trafficGrid.entries')} rows={entries} columns={entryColumns} language={language} emphasized={emphasis.activeGrid === 'entries'}
        initialFocus events={emphasis.eventsFor('entries')} errorMessage={error ? t(`trafficGrid.${error}`) : ''}
        onActivate={busy ? undefined : onExit} />
      <TrafficTable title={t('trafficGrid.exits')} rows={exits} columns={exitColumns} language={language} emphasized={emphasis.activeGrid === 'exits'}
        events={emphasis.eventsFor('exits')} errorMessage={error ? t(`trafficGrid.${error}`) : ''} />
    </Box>
    <Menu anchorEl={cargoMenu?.anchor} open={Boolean(cargoMenu)} onClose={() => setCargoMenu(null)}>
      <MenuItem onClick={() => chooseCargo(false)}><Box component="img" src={inboundIcon} alt="" sx={{ inlineSize: 16, blockSize: 16, marginInlineEnd: 1 }} />{t('trafficGrid.inboundCargo')}</MenuItem>
      <MenuItem onClick={() => chooseCargo(true)}><Box component="img" src={outboundIcon} alt="" sx={{ inlineSize: 16, blockSize: 16, marginInlineEnd: 1 }} />{t('trafficGrid.outboundCargo')}</MenuItem>
    </Menu>
  </Box>;
});
