import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react';
import { alpha, Box, Button, CircularProgress, Paper, Portal, Tooltip, Typography } from '@mui/material';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import CallReceivedRoundedIcon from '@mui/icons-material/CallReceivedRounded';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n/instance';
import { parseIranianPlate } from '../../components/IranianPlateInput';
import { formatDateTime, formatNumber, formatTime } from '../../utils/formatters';
import { normalizeHistorySearch, plateHistoryFreshness, type PlateHistoryItem } from './plateDetectionHistory';
import { AppDataGrid, type AppDataGridColumn } from '../../components/AppDataGrid';
import { ConnectionStatusIndicator } from '../../components/ConnectionStatusIndicator';
import type { ShahabHistoryStatus } from '../../api/shahabTrafficRealtime';
import { historyHandleHeight, historyHandleWidth, useFloatingHistoryPosition } from './useFloatingHistoryPosition';
import './plateDetectionHistory.css';

type Props = {
  items: readonly PlateHistoryItem[];
  status: ShahabHistoryStatus;
  language: Language;
  busy: boolean;
  hasCurrentInput: boolean;
  onSelect: (item: PlateHistoryItem) => boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<HTMLDivElement | null>;
};

function HistoryPlate({ plate }: { plate: string }) {
  const parts = parseIranianPlate(plate);
  if (!parts.letter) return <span dir="ltr">{plate}</span>;
  // Separate bidi runs so the letter cannot reorder the numeric groups in RTL pages.
  return <Box component="span" dir="ltr" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{parts.left}</span><span dir="rtl">{parts.letter}</span><span>{parts.middle}</span>
    <Box component="span" sx={{ borderInlineStart: 1, borderColor: 'divider', ps: 0.5 }}>{parts.region}</Box>
  </Box>;
}

export function FloatingPlateHistory({ items, status, language, busy, hasCurrentInput, onSelect, onOpenChange, anchorRef }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const panelId = useId();
  const headerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [gridMenuOpen, setGridMenuOpen] = useState(false);
  const [pending, setPending] = useState<PlateHistoryItem | null>(null);
  const [now, setNow] = useState(Date.now);
  const hovered = useRef(false);
  const focused = useRef(false);
  const dismissed = useRef(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { position, viewport, dragging, moved, dragHandlers } = useFloatingHistoryPosition(anchorRef, language);
  const latest = items[0];
  const freshness = plateHistoryFreshness(latest, now);
  const receiving = Boolean(latest && now - latest.receivedAt < 5000);
  const activityTone = latest?.repeated ? 'error' : 'success';
  const panelWidth = Math.min(340, viewport.width - 16);
  const gap = 6;
  const above = position.y - gap - 8;
  const below = viewport.height - position.y - historyHandleHeight - gap - 8;
  const fitsRight = position.x + historyHandleWidth + gap + panelWidth <= viewport.width - 8;
  const fitsLeft = position.x - gap - panelWidth >= 8;
  const preferredSide = language === 'fa' ? 'right' : 'left';
  const side = preferredSide === 'right' && fitsRight ? 'right' : preferredSide === 'left' && fitsLeft ? 'left'
    : fitsRight ? 'right' : fitsLeft ? 'left' : above > below ? 'above' : 'below';
  const horizontal = side === 'right' || side === 'left';
  const desiredHeight = Math.min(384, 96 + Math.min(8, Math.max(1, items.length)) * 33 + (pending ? 76 : 0));
  const panelHeight = Math.max(0, Math.min(desiredHeight, horizontal ? viewport.height - 16 : side === 'above' ? above : below));
  const panelX = side === 'right' ? position.x + historyHandleWidth + gap : side === 'left' ? position.x - gap - panelWidth
    : Math.max(8, Math.min(position.x, viewport.width - panelWidth - 8));
  const panelY = horizontal ? Math.max(8, Math.min(position.y, viewport.height - panelHeight - 8))
    : side === 'above' ? position.y - panelHeight - gap : position.y + historyHandleHeight + gap;
  const clearTimers = () => {
    if (openTimer.current !== null) clearTimeout(openTimer.current);
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    openTimer.current = closeTimer.current = null;
  };
  useEffect(() => () => {
    if (openTimer.current !== null) clearTimeout(openTimer.current);
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => { onOpenChange(open); }, [open, onOpenChange]);
  useEffect(() => () => onOpenChange(false), [onOpenChange]);
  useEffect(() => {
    if (!latest) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [latest?.id]);

  const scheduleClose = () => {
    clearTimers();
    if (!hovered.current && !focused.current && !pending && !dragging && !gridMenuOpen) {
      closeTimer.current = setTimeout(() => setOpen(false), 400);
    }
  };
  useEffect(() => {
    if (!dragging && !hovered.current && !focused.current && !pending && !gridMenuOpen) {
      closeTimer.current = setTimeout(() => setOpen(false), 400);
    }
    return () => { if (closeTimer.current !== null) clearTimeout(closeTimer.current); };
  }, [dragging, pending, gridMenuOpen]);
  const dismiss = () => {
    clearTimers();
    dismissed.current = true;
    setPending(null);
    setOpen(false);
  };
  const select = (item: PlateHistoryItem) => {
    if (busy) return;
    if (onSelect(item)) dismiss();
  };
  const tone = freshness === 'recent' ? 'info' : freshness === 'aging' ? 'warning' : null;
  const columns = useMemo<AppDataGridColumn<PlateHistoryItem>[]>(() => [
    { key: 'plate', label: t('trafficGrid.plate'), width: 134, filterPlaceholder: t('plateHistory.search'), getFilterValue: item => item.plate,
      render: item => <Tooltip describeChild title={`${formatDateTime(item.occurredAt, language)} · ${item.cameraName || t('plateHistory.camera', { id: item.cameraId ?? '—' })} · ${t(item.repeated ? 'plateHistory.repeated' : 'plateHistory.fresh')}`}>
        <Box component="span" sx={{ display: 'block', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}><HistoryPlate plate={item.plate} /></Box>
      </Tooltip> },
    { key: 'occurredAt', label: t('plateHistory.time'), width: 94,
      getFilterValue: item => formatTime(new Date(item.occurredAt), language, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      render: item => <Typography variant="caption" component="time" dateTime={item.occurredAt} dir="ltr" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>{formatTime(new Date(item.occurredAt), language, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</Typography> },
    { key: 'direction', label: t('plateHistory.direction'), width: 72, filterable: false,
      render: item => <Tooltip title={item.direction ? t(`trafficLayout.${item.direction}`) : ''}>
        <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>{item.direction === 'exit' ? <CallMadeRoundedIcon sx={{ fontSize: 15 }} /> : <CallReceivedRoundedIcon sx={{ fontSize: 15 }} />}</Box>
      </Tooltip> },
  ], [t, language]);

  return <Portal><Box data-traffic-history="true" dir={language === 'fa' ? 'rtl' : 'ltr'}
    className={`plate-history-floating${dragging ? ' is-dragging' : ''}`} data-freshness={freshness}
    style={{ left: position.x, top: position.y }}
    sx={{ position: 'fixed', width: historyHandleWidth, height: historyHandleHeight, zIndex: theme => theme.zIndex.drawer + 1 }}
    onPointerEnter={event => {
      if (event.pointerType === 'touch') return;
      hovered.current = true;
      dismissed.current = false;
      clearTimers();
      if (!dragging) openTimer.current = setTimeout(() => setOpen(true), 200);
    }}
    onPointerLeave={() => { hovered.current = false; scheduleClose(); }}
    onFocusCapture={() => { focused.current = true; clearTimers(); if (!dismissed.current) setOpen(true); }}
    onBlurCapture={event => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      focused.current = false;
      dismissed.current = false;
      scheduleClose();
    }}
    onKeyDown={event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        dismiss();
        headerRef.current?.focus();
      }
    }}>
    <Tooltip describeChild title={dragging ? '' : t('plateHistory.title')} placement={side === 'above' ? 'bottom' : 'top'} enterDelay={100} disableInteractive>
    <Paper ref={headerRef} component="div" role="button" tabIndex={0} aria-label={t('plateHistory.title')}
      aria-description={t('plateHistory.moveHint')} aria-expanded={open} aria-controls={open ? panelId : undefined}
      data-activity={receiving ? latest?.repeated ? 'repeated' : 'new' : 'idle'}
      variant="outlined" className="plate-history-handle" {...dragHandlers}
      onPointerDown={event => { clearTimers(); dragHandlers.onPointerDown(event); }}
      onClick={() => { if (!moved.current) { dismissed.current = open; setOpen(value => !value); } }}
      onKeyDown={event => {
        dragHandlers.onKeyDown(event);
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dismissed.current = open; setOpen(value => !value); }
      }}
      sx={theme => ({
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        borderRadius: 1,
        color: tone ? theme.palette[tone][theme.palette.mode === 'dark' ? 'light' : 'main'] : theme.palette.text.secondary,
        bgcolor: theme.palette.background.paper,
        borderColor: tone ? alpha(theme.palette[tone][theme.palette.mode === 'dark' ? 'light' : 'main'], 0.45) : theme.palette.divider,
        boxShadow: 1,
        '&:hover': { borderColor: tone ? theme.palette[tone].main : theme.palette.text.secondary, boxShadow: 2 },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
      })}>
      {receiving && <Box aria-hidden className="plate-history-activity" sx={{ bgcolor: `${activityTone}.main` }} />}
      {latest && now - latest.receivedAt < 1600 && <Box aria-hidden key={latest.id} className="plate-history-arrival" sx={{ borderColor: `${activityTone}.main` }} />}
      <ListAltRoundedIcon sx={{ fontSize: 21, position: 'relative' }} />
      {latest && <Box className="plate-history-freshness-dot" sx={{ position: 'absolute', bottom: 7, insetInlineEnd: 5,
        width: 5, height: 5, borderRadius: '50%', bgcolor: 'currentColor', border: 1, borderColor: 'background.paper' }} />}
    </Paper>
    </Tooltip>
    {open && <>
    <Box aria-hidden style={{
      left: side === 'right' ? historyHandleWidth : side === 'left' ? -gap : panelX - position.x,
      top: horizontal ? 0 : side === 'above' ? -gap : historyHandleHeight,
      width: horizontal ? gap : panelWidth, height: horizontal ? historyHandleHeight : gap,
    }} sx={{ position: 'absolute' }} />
    <Box style={{ left: panelX - position.x, top: panelY - position.y, width: panelWidth }} sx={{ position: 'absolute' }}>
      <Paper id={panelId} role="region" aria-label={t('plateHistory.title')} variant="outlined" className="plate-history-panel"
        sx={{ height: panelHeight, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, minHeight: 32, boxSizing: 'border-box', flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
          <ListAltRoundedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
          <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.75rem', fontWeight: 700 }}>{t('plateHistory.title')}</Typography>
          {status === 'loading' && <CircularProgress size={12} aria-label={t('plateHistory.loading')} />}
          <ConnectionStatusIndicator message={status === 'error' ? t('plateHistory.loadError') : ''} />
          <Typography variant="caption" dir="ltr" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', fontSize: '0.6875rem' }}>
            {formatNumber(items.length, language)} / {formatNumber(100, language)}
          </Typography>
        </Box>
        {pending && <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: theme => alpha(theme.palette.warning.main, 0.08) }}>
          <Typography variant="caption">{t('plateHistory.replacePrompt', { plate: pending.plate })}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button size="small" disabled={busy} onClick={() => select(pending)}>{t('plateHistory.replace')}</Button>
            <Button size="small" color="inherit" onClick={() => setPending(null)}>{t('plateHistory.keepCurrent')}</Button>
          </Box>
        </Box>}
        <Box className="plate-history-grid" aria-busy={busy} sx={theme => ({ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative',
          '& .app-data-grid-wrapper': { height: '100%', minHeight: 0, overflow: 'auto', border: 0, boxShadow: 'none', bgcolor: 'background.paper', borderRadius: 0, overscrollBehavior: 'contain', overflowAnchor: 'auto' },
          '& table': { tableLayout: 'fixed', width: '100%' },
          '& thead': { position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' },
          '& .app-data-grid .MuiTableHead-root .MuiTableCell-root': { bgcolor: 'background.default', color: 'text.secondary' },
          '& th, & td': { px: 1, py: 0.5, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', whiteSpace: 'nowrap' },
          '& th:last-child .app-data-grid-header-content > span': { paddingInlineEnd: 0, textAlign: 'center', textOverflow: 'clip' },
          '& .plate-history-repeated > td': { bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.09) },
          '& .app-data-grid-row:hover > td': { bgcolor: 'action.hover' },
          '& .plate-history-repeated:hover > td, & .plate-history-repeated:focus-visible > td': { bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.24 : 0.15) },
          '& .app-data-grid-filter-input, & .app-data-grid-filter-input .MuiOutlinedInput-root, & .app-data-grid-filter-input .MuiOutlinedInput-root.Mui-focused': { bgcolor: 'background.paper', color: 'text.primary', minWidth: 0 },
          '&[aria-busy="true"] tbody': { opacity: 0.5 },
        })}>
          <AppDataGrid rows={[...items]} columns={columns} rowKey={item => item.id} direction={language === 'fa' ? 'rtl' : 'ltr'}
            normalizeFilterText={normalizeHistorySearch} getRowClassName={item => item.repeated ? 'plate-history-repeated' : ''}
            getRowLabel={item => t('plateHistory.selectPlate', { plate: item.plate, state: t(item.repeated ? 'plateHistory.repeated' : 'plateHistory.fresh'), direction: item.direction ? t(`trafficLayout.${item.direction}`) : '' })}
            onColumnMenuOpenChange={setGridMenuOpen} onRowClick={item => { if (busy) return; if (hasCurrentInput) setPending(item); else select(item); }} />
          {items.length === 0 && <Typography variant="caption" sx={{ p: 1, color: 'text.secondary', position: 'absolute', top: '50%', insetInline: 0, textAlign: 'center' }}>{t(status === 'loading' ? 'plateHistory.loading' : 'plateHistory.empty')}</Typography>}
        </Box>
        <Typography variant="caption" sx={{ px: 1, py: 0.25, borderTop: 1, borderColor: 'divider', color: 'text.secondary', fontSize: '0.625rem' }}>{t('plateHistory.todayCount', { value: formatNumber(items.length, language) })}</Typography>
      </Paper>
    </Box></>}
  </Box></Portal>;
}
