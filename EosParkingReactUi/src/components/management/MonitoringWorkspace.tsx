import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Paper, MenuItem, TextField, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import { ApiError } from '../../api/client';
import { parkingApi } from '../../api/management';
import { formatDateTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { BooleanStatusIcon } from '../BooleanStatusIcon';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, recordValue, type Language, type RecordValue } from './managementTypes';

type Props = { title: string; pageTitle?: string; parkingId: number; language: Language };
type DoorRow = RecordValue;
type TrafficRow = RecordValue;

const text = (language: Language, fa: string, en: string) => language === 'fa' ? fa : en;
const value = (row: RecordValue, key: string) => recordValue(row, key);
const numberValue = (row: RecordValue, key: string) => Number(value(row, key) ?? 0);
const doorTypeLabel = (input: unknown, language: Language) => ({
  '0': text(language, 'ورودی', 'Entrance'), '1': text(language, 'خروجی', 'Exit'),
  '2': text(language, 'ورودی و خروجی', 'Entrance and exit'), '3': text(language, 'درب داخلی', 'Internal door'),
}[String(input)] ?? String(input ?? '—'));
const trafficTypeLabel = (input: unknown, language: Language) => ({
  '0': text(language, 'ورود', 'Entrance'), '1': text(language, 'خروج', 'Exit'),
  '2': text(language, 'ورود و خروج', 'Entrance and exit'),
}[String(input)] ?? String(input ?? '—'));
const trafficTypeCell = (input: unknown, language: Language) => {
  const type = String(input);
  const Icon = type === '0' ? LoginRoundedIcon : type === '1' ? LogoutRoundedIcon : SwapVertRoundedIcon;
  return <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, direction: 'ltr', whiteSpace: 'nowrap' }}><Icon fontSize="small" /><span dir={language === 'fa' ? 'rtl' : 'ltr'}>{trafficTypeLabel(input, language)}</span></Box>;
};
const sendStatusCell = (input: unknown, language: Language) => {
  const status = String(input ?? '').toLowerCase();
  const sent = status.includes('sent') || status.includes('ارسال شده');
  return <BooleanStatusIcon value={sent} trueLabel={text(language, 'ارسال شده', 'Sent')} falseLabel={text(language, 'ارسال نشده', 'Not sent')} />;
};
const rowsAreEqual = (left: DoorRow[], right: DoorRow[]) => left.length === right.length && left.every((row, index) => JSON.stringify(row) === JSON.stringify(right[index]));

function mergeTrafficRows(current: TrafficRow[], incoming: TrafficRow[], limit: number) {
  if (incoming.length === 0) return current;
  const rows = [...incoming, ...current];
  const unique = new Map<string, TrafficRow>();
  rows.forEach((row, index) => {
    const id = value(row, 'Id');
    const key = id ? String(id) : `${value(row, 'DumpDateTime') ?? value(row, 'dumpDateTime')}-${value(row, 'DoorId')}-${value(row, 'Plate')}`;
    if (!unique.has(key)) unique.set(key, row);
  });
  if (incoming.length > 0 && incoming.every((row) => {
    const id = value(row, 'Id');
    const key = id ? String(id) : `${value(row, 'DumpDateTime') ?? value(row, 'dumpDateTime')}-${value(row, 'DoorId')}-${value(row, 'Plate')}`;
    return current.some((existing) => {
      const existingId = value(existing, 'Id');
      const existingKey = existingId ? String(existingId) : `${value(existing, 'DumpDateTime') ?? value(existing, 'dumpDateTime')}-${value(existing, 'DoorId')}-${value(existing, 'Plate')}`;
      return existingKey === key;
    });
  })) return current;
  return [...unique.values()].sort((left, right) => String(value(right, 'DumpDateTime') ?? '').localeCompare(String(value(left, 'DumpDateTime') ?? ''))).slice(0, limit);
}

export function MonitoringWorkspace({ title, pageTitle, parkingId, language }: Props) {
  const [doors, setDoors] = useState<DoorRow[]>([]);
  const [selectedDoorIds, setSelectedDoorIds] = useState<Array<string | number>>([]);
  const [trafficRows, setTrafficRows] = useState<TrafficRow[]>([]);
  const [trafficCount, setTrafficCount] = useState('500');
  const [trafficType, setTrafficType] = useState('2');
  const [loadingDoors, setLoadingDoors] = useState(false);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [error, setError] = useState('');
  const doorsRef = useRef<DoorRow[]>([]);
  const initializedParkingRef = useRef<number | null>(null);
  const latestTrafficDateTimeRef = useRef<number | null>(null);
  const trafficRequestRef = useRef<Promise<void> | null>(null);

  const loadDoors = useCallback(async () => {
    setLoadingDoors(true);
    try {
      const next = asRows(await parkingApi.getDoorsLive(parkingId));
      doorsRef.current = next;
      setDoors((current) => rowsAreEqual(current, next) ? current : next);
      setSelectedDoorIds((current) => {
        const filtered = current.filter((id) => next.some((door) => String(value(door, 'Id')) === String(id)));
        return filtered.length === current.length && filtered.every((id, index) => String(id) === String(current[index])) ? current : filtered;
      });
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده مانیتورینگ مجاز نیست.', 'Monitoring access is forbidden.') : text(language, 'دریافت وضعیت درب‌ها ناموفق بود.', 'Loading live doors failed.'));
    } finally {
      setLoadingDoors(false);
    }
  }, [language, parkingId]);

  const loadTraffic = useCallback(async (reset = false) => {
    if (trafficRequestRef.current) return;
    const request = (async () => {
    setLoadingTraffic(true);
    try {
      if (reset) latestTrafficDateTimeRef.current = null;
      const startDateTime = latestTrafficDateTimeRef.current === null
        ? ''
        : new Date(latestTrafficDateTimeRef.current - (10 * 1000)).toISOString();
      const doorIds = selectedDoorIds.length
        ? selectedDoorIds.map(Number)
        : doorsRef.current.map((door) => numberValue(door, 'Id')).filter((doorId) => doorId > 0);
      const incoming = asRows(await parkingApi.getMonitoringTraffics(parkingId, Number(trafficCount), Number(trafficType), doorIds, startDateTime));
      setTrafficRows((current) => reset ? mergeTrafficRows([], incoming, Number(trafficCount)) : mergeTrafficRows(current, incoming, Number(trafficCount)));
      const receivedMaxDateTime = incoming.reduce((max, row) => {
        const timestamp = Date.parse(String(value(row, 'DumpDateTime') ?? ''));
        return Number.isNaN(timestamp) ? max : Math.max(max, timestamp);
      }, latestTrafficDateTimeRef.current ?? 0);
      latestTrafficDateTimeRef.current = receivedMaxDateTime > 0 ? receivedMaxDateTime : latestTrafficDateTimeRef.current;
      setError('');
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 403 ? text(language, 'دسترسی مشاهده ترددهای زنده مجاز نیست.', 'Live traffic access is forbidden.') : text(language, 'دریافت ترددهای زنده ناموفق بود.', 'Loading live traffic failed.'));
    } finally {
      setLoadingTraffic(false);
    }
    })();
    trafficRequestRef.current = request;
    try {
      await request;
    } finally {
      if (trafficRequestRef.current === request) trafficRequestRef.current = null;
    }
  }, [language, parkingId, selectedDoorIds, trafficCount, trafficType]);

  useEffect(() => {
    const initialize = async () => {
      if (initializedParkingRef.current !== parkingId) {
        initializedParkingRef.current = parkingId;
        await loadDoors();
      }
      setTrafficRows([]);
      await loadTraffic(true);
    };
    void initialize();
  }, [loadDoors, loadTraffic, parkingId]);
  useEffect(() => {
    const timer = window.setInterval(() => { void loadTraffic(false); void loadDoors(); }, 10000);
    return () => window.clearInterval(timer);
  }, [loadDoors, loadTraffic]);

  const controlRows = useMemo(() => trafficRows.filter((row) => numberValue(row, 'ControlType') !== 0).reduce<TrafficRow[]>((items, row) => {
    const key = String(value(row, 'Id') ?? `${value(row, 'DumpDateTime')}-${value(row, 'Plate')}`);
    return items.some((item) => String(value(item, 'Id') ?? `${value(item, 'DumpDateTime')}-${value(item, 'Plate')}`) === key) ? items : [...items, row];
  }, []).slice(0, 50), [trafficRows]);

  const doorColumns = [
    { key: 'DoorTitle', label: text(language, 'نام درب', 'Door name'), render: (row: DoorRow) => String(value(row, 'DoorTitle') ?? '—') },
    { key: 'TrafficCount', label: text(language, 'تعداد ترددها', 'Traffic count'), render: (row: DoorRow) => String(value(row, 'TrafficCount') ?? 0) },
    { key: 'LastTrafficDateTime', label: text(language, 'آخرین تردد امروز', 'Last traffic today'), render: (row: DoorRow) => formatDateTime(value(row, 'LastTrafficDateTime'), language) },
    { key: 'DoorType', label: text(language, 'نوع درب', 'Door type'), render: (row: DoorRow) => doorTypeLabel(value(row, 'DoorType'), language) },
  ];
  const trafficColumns = [
    { key: 'TrafficType', label: text(language, 'نوع تردد', 'Traffic type'), width: 104, minWidth: 104, render: (row: TrafficRow) => trafficTypeCell(value(row, 'TrafficType'), language) },
    { key: 'Plate', label: text(language, 'پلاک', 'Plate'), render: (row: TrafficRow) => <span dir="ltr">{String(value(row, 'Plate') ?? '—')}</span> },
    { key: 'MemberName', label: text(language, 'نام عضو', 'Member name'), render: (row: TrafficRow) => String(value(row, 'MemberName') ?? '—') },
    { key: 'CardNumber', label: text(language, 'شماره کارت', 'Card number'), render: (row: TrafficRow) => <span dir="ltr">{String(value(row, 'CardNumber') ?? '—')}</span> },
    { key: 'DumpDateTime', label: text(language, 'تاریخ و زمان', 'Date and time'), width: 160, minWidth: 160, render: (row: TrafficRow) => formatDateTime(value(row, 'DumpDateTime'), language) },
    { key: 'DoorName', label: text(language, 'درب', 'Door'), width: 130, minWidth: 130, render: (row: TrafficRow) => String(value(row, 'DoorName') ?? '—') },
    { key: 'SendStatus', label: text(language, 'ارسال', 'Sent'), width: 56, minWidth: 56, render: (row: TrafficRow) => sendStatusCell(value(row, 'SendStatus'), language) },
  ];

  return <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={text(language, 'ترددهای زنده و وضعیت درب‌های پارکینگ', 'Live traffic and parking door status')} language={language} loading={loadingDoors || loadingTraffic} onRefresh={() => { void loadDoors(); void loadTraffic(true); }}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 0.32fr) minmax(0, 1fr)' }, gap: 2, alignItems: 'stretch' }}>
      <Box sx={{ display: 'grid', gap: 2, alignContent: 'start', minWidth: 0 }}>
        <Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="subtitle2" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>{text(language, 'پیام‌های لیست کنترل', 'Control-list messages')}</Typography>{controlRows.length === 0 ? <Typography variant="body2" color="text.secondary">{text(language, 'پیامی وجود ندارد.', 'No control-list messages.')}</Typography> : controlRows.map((row) => <Box key={String(value(row, 'Id') ?? value(row, 'DumpDateTime'))} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}><Typography variant="body2">{String(value(row, 'Plate') ?? '—')}</Typography><Typography variant="caption" color="text.secondary">{String(value(row, 'Description') ?? trafficTypeLabel(value(row, 'ControlType'), language))}</Typography></Box>)}</Paper>
        <Accordion disableGutters elevation={0} sx={{ minWidth: 0, border: 1, borderColor: 'divider', '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: 42, px: 1.5, '&.Mui-expanded': { minHeight: 42 }, '& .MuiAccordionSummary-content': { my: 0.75, alignItems: 'center', justifyContent: 'space-between', gap: 1 } }}>
            <Typography variant="subtitle2">{text(language, 'درب‌های پارکینگ', 'Parking doors')}</Typography>
            <Typography variant="caption" color="text.secondary">{selectedDoorIds.length ? text(language, `${selectedDoorIds.length} درب انتخاب شده`, `${selectedDoorIds.length} selected`) : text(language, 'همه درب‌ها', 'All doors')}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5, minWidth: 0, borderTop: 1, borderColor: 'divider' }}><ResourceState loading={loadingDoors && doors.length === 0} error="" empty={doors.length === 0} loadingLabel={text(language, 'در حال دریافت درب‌ها...', 'Loading doors...')} emptyLabel={text(language, 'دربی برای نمایش وجود ندارد.', 'No doors found.')}><Box className="monitoring-door-grid" sx={{ maxHeight: 320, maxWidth: '100%', minWidth: 0, overflow: 'auto' }}><AppDataGrid<DoorRow> direction={language === 'fa' ? 'rtl' : 'ltr'} rows={doors} columns={doorColumns} rowKey={(row, index) => String(value(row, 'Id') ?? index)} selectedKeys={selectedDoorIds} onSelectionChange={setSelectedDoorIds} /></Box></ResourceState></AccordionDetails>
        </Accordion>
      </Box>
      <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0 }}><Box sx={{ direction: language === 'fa' ? 'rtl' : 'ltr', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}><Typography variant="subtitle2" sx={{ direction: language === 'fa' ? 'rtl' : 'ltr', whiteSpace: 'nowrap', justifySelf: 'start' }}>{text(language, 'ترددها', 'Traffic')}</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', justifySelf: 'end', direction: 'ltr' }}><TextField select size="small" label={text(language, 'نوع', 'Type')} value={trafficType} onChange={(event) => setTrafficType(event.target.value)} sx={{ width: { xs: 86, sm: 94 }, '& .MuiInputBase-root': { height: 26, fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' }, '& .MuiInputBase-input': { py: 0.25, px: 0.75 } }}><MenuItem value="0">{text(language, 'ورودی', 'In')}</MenuItem><MenuItem value="1">{text(language, 'خروجی', 'Out')}</MenuItem><MenuItem value="2">{text(language, 'هر دو', 'Both')}</MenuItem></TextField><TextField select size="small" label={text(language, 'تعداد', 'Count')} value={trafficCount} onChange={(event) => setTrafficCount(event.target.value)} sx={{ width: { xs: 74, sm: 82 }, '& .MuiInputBase-root': { height: 26, fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' }, '& .MuiInputBase-input': { py: 0.25, px: 0.75 } }}>{['10', '50', '100', '300', '500', '1000', '10000'].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}</TextField>{loadingTraffic && <Typography variant="caption" color="text.secondary" sx={{ direction: language === 'fa' ? 'rtl' : 'ltr' }}>{text(language, 'در حال دریافت...', 'Updating...')}</Typography>}</Box></Box>{error && trafficRows.length === 0 && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}<Box sx={{ minHeight: 160 }}><AppDataGrid<TrafficRow> direction={language === 'fa' ? 'rtl' : 'ltr'} defaultFilterOpen rows={trafficRows} columns={trafficColumns} rowKey={(row, index) => String(value(row, 'Id') ?? index)} /></Box></Paper>
    </Box>
  </ManagementWorkspaceFrame>;
}
