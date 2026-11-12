import { useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Skeleton, TablePagination, Tooltip, Typography } from '@mui/material';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n/instance';
import { formatDateTime, formatNumber, formatTime } from '../../utils/formatters';
import { useParkingMap } from './useParkingMap';
import type { ParkingMapSpace } from './parkingMapService';
import { ParkingMapEmptyState } from './ParkingMapEmptyState';
import { ConnectionStatusIndicator } from '../../components/ConnectionStatusIndicator';

export function ParkingSpaceMap({ parkingId, language }: { parkingId: number; language: Language }) {
  return <ParkingSpaceMapContent key={parkingId} parkingId={parkingId} language={language} />;
}

function ParkingSpaceMapContent({ parkingId, language }: { parkingId: number; language: Language }) {
  const { t } = useTranslation();
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const map = useParkingMap({ parkingId, sectionId, page, pageSize });
  const data = map.data;
  const selected = data?.items.find(space => space.id === selectedId);

  useEffect(() => {
    if (!data) return;
    setPage(data.page);
    setSectionId(data.sectionId);
    setSelectedId(previous => data.items.some(space => space.id === previous) ? previous : null);
  }, [data]);

  const groups = new Map<number | null, ParkingMapSpace[]>();
  data?.items.forEach(space => {
    const group = groups.get(space.sectionId) ?? [];
    group.push(space);
    groups.set(space.sectionId, group);
  });
  const failed = ['unavailable', 'unauthorized', 'forbidden', 'notFound'].includes(map.status);
  const errorCode = map.status === 'unauthorized' || map.status === 'forbidden' || map.status === 'notFound' ? map.status : 'unavailable';
  const stale = Boolean(data && map.status !== 'connected');
  const canRetry = failed && map.status !== 'unauthorized' && map.status !== 'forbidden';
  const connectionMessage = [t(`parkingMap.connection.${map.status}`),
    failed ? t(`parkingMap.errors.${errorCode}`) : '', stale ? t('parkingMap.stale') : '',
    canRetry ? t('home.retry') : ''].filter(Boolean).join(' — ');

  return <Paper className="home3-map-panel home3-space-map" elevation={0} aria-label={t('home.spaceMap')}>
    <Box className="home3-panel-heading home3-space-map-heading">
      <Box className="home3-map-heading-title"><Box className="home3-map-heading-icon"><LocalParkingRoundedIcon /></Box><Typography className="home3-panel-title">{t('home.spaceMap')}</Typography></Box>
      <ConnectionStatusIndicator message={connectionMessage}
        color={map.status === 'connected' ? 'success' : failed ? 'error' : stale ? 'warning' : 'info'}
        onClick={canRetry ? map.retry : undefined} />
    </Box>
    {data && <Box className="home3-space-map-toolbar">
      {data.sections.length > 0 && <FormControl size="small" className="home3-map-zone-filter">
        <InputLabel shrink id="parking-map-zone-label">{t('parkingMap.zone')}</InputLabel>
        <Select<string> displayEmpty labelId="parking-map-zone-label" value={sectionId === null ? '' : String(sectionId)} label={t('parkingMap.zone')} onChange={event => {
          setSectionId(event.target.value === '' ? null : Number(event.target.value)); setPage(1); setSelectedId(null);
        }}>
          <MenuItem value="">{t('parkingMap.allZones')}</MenuItem>
          {data.sections.map(zone => <MenuItem key={zone.id} value={String(zone.id)}>{zone.title} · {formatNumber(zone.spaceCount, language)}</MenuItem>)}
          {data.unsectionedCount > 0 && <MenuItem value="-1">{t('parkingMap.noZone')} · {formatNumber(data.unsectionedCount, language)}</MenuItem>}
        </Select>
      </FormControl>}
      <Typography className="home3-map-total">{t('parkingMap.total', { total: formatNumber(data.totalCount, language) })}</Typography>
    </Box>}
    <Box className={`home3-map-canvas ${selected ? 'has-selection' : ''}`}>
    {!data && !failed && <Box className="home3-space-map-loading" role="status" aria-label={t('common.loading')}>
      {Array.from({ length: 20 }, (_, index) => <Skeleton key={index} variant="rounded" height={38} />)}
    </Box>}
    {data && <Box className="home3-space-map-body" aria-busy={stale}>
      {data.items.length === 0 && <ParkingMapEmptyState />}
      {[...groups].map(([zoneId, spaces]) => <Box key={zoneId ?? 'unsectioned'} className="home3-space-zone">
        {data.sections.length > 0 && <Typography className="home3-space-zone-title">{spaces[0].sectionTitle || t('parkingMap.noZone')}</Typography>}
        <Box className="home3-space-grid">
          {spaces.map(space => {
            const status = !space.isActive ? 'inactive' : space.isAssigned ? 'assigned' : 'unassigned';
            return <Tooltip key={space.id} title={`${space.floorTitle}${space.kindTitle ? ` · ${space.kindTitle}` : ''}`} arrow enterDelay={500}>
            <Button className={`home3-space-tile is-${status} ${space.id === selectedId ? 'is-selected' : ''}`}
              aria-label={t('parkingMap.spaceLabel', { title: space.title, floor: space.floorTitle, status: t(`parkingMap.assignment.${status}`) })}
              aria-pressed={space.id === selectedId} onClick={() => setSelectedId(previous => previous === space.id ? null : space.id)}>
              <Box component="span" className="home3-space-emblem" aria-hidden="true">
                {!space.isActive ? <BlockRoundedIcon /> : space.isAssigned ? <PersonOutlineRoundedIcon /> : <LocalParkingRoundedIcon />}
              </Box>
              <Box component="span" className="home3-space-label">
                <Typography component="span" dir="auto" className="home3-space-title">{space.title}</Typography>
                <Typography component="span" className="home3-space-assignment">{t(`parkingMap.assignment.${status}`)}</Typography>
              </Box>
              <Box component="span" className="home3-space-led" aria-hidden="true" />
            </Button></Tooltip>;
          })}
        </Box>
      </Box>)}
    </Box>}
    {selected && <Box className="home3-space-detail" role="status">
      <Typography component="strong">{selected.title}</Typography>
      <Typography>{selected.floorTitle}{selected.kindTitle ? ` · ${selected.kindTitle}` : ''}</Typography>
      <Typography>{t('parkingMap.occupancyUnknown')}</Typography>
    </Box>}
    </Box>
    {data && <TablePagination component="div" className="home3-map-pagination" count={data.totalCount} page={data.page - 1} rowsPerPage={pageSize} rowsPerPageOptions={[10, 20, 30].map(value => ({ value, label: formatNumber(value, language) }))}
      onPageChange={(_, next) => { setPage(next + 1); setSelectedId(null); }}
      onRowsPerPageChange={event => { setPageSize(Number(event.target.value)); setPage(1); setSelectedId(null); }}
      labelRowsPerPage={t('parkingMap.pageSize')}
      labelDisplayedRows={({ from, to, count }) => t('parkingMap.range', { from: formatNumber(from, language), to: formatNumber(to, language), total: formatNumber(count, language) })}
      getItemAriaLabel={type => t(`parkingMap.pagination.${type}`)} />}
    <Box className="home3-space-map-footer">
      <Box className="home3-space-legend">
        {Boolean(data?.items.length) && (['assigned', 'unassigned', 'inactive'] as const).map(status => <Box component="span" key={status}><i className={`is-${status}`} />{t(`parkingMap.assignment.${status}`)}</Box>)}
      </Box>
      {data && <Tooltip title={formatDateTime(data.generatedAtUtc, language)}><Typography>{t('parkingMap.updatedAt', { time: formatTime(new Date(data.generatedAtUtc), language) })}</Typography></Tooltip>}
    </Box>
  </Paper>;
}
