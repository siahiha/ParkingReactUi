import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ApiError } from '../../api/client';
import { definitionApi } from '../../api/management';
import { formatTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, formatValue, moduleDefinitions, type Language, type RecordValue } from './managementTypes';
import i18n from '../../i18n/instance';

type Props = { itemKey: string; title: string; pageTitle?: string; parkingId: number; language: Language };

export function ReadOnlyModuleWorkspace({ itemKey, title, pageTitle, parkingId, language }: Props) {
  const text = i18n.getFixedT(language);
  const definition = moduleDefinitions[itemKey];
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);

  const load = async () => {
    if (!definition) return;
    setLoading(true);
    setError('');
    try {
      setRows(asRows(await definitionApi.get(definition.path(parkingId))));
      setLastLoadedAt(new Date());
    } catch (cause) {
      setRows([]);
      setError(cause instanceof ApiError && cause.status === 403 ? text('readonlyModule.forbidden') : text('readonlyModule.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [itemKey, parkingId, language]);

  const copy = { loading: text('readonlyModule.loading'), empty: text('readonlyModule.empty'), unavailable: text('readonlyModule.unavailable'), count: text('readonlyModule.count'), lastLoaded: text('readonlyModule.lastLoaded') };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} language={language} loading={loading} onRefresh={definition ? () => void load() : undefined}>
      <Box className="workspace-resource-content">
        {!definition && <Typography variant="body2" color="text.secondary">{copy.unavailable}</Typography>}
        {definition && <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
          <AppDataGrid<RecordValue> direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => String(row.Id ?? row.id ?? index)} columns={definition.columns.map((column) => ({ key: column.key, label: language === 'fa' ? column.fa : column.en, render: (row) => formatValue(row[column.key] ?? row[column.key.charAt(0).toLowerCase() + column.key.slice(1)], language) }))} />
          {lastLoadedAt && !error && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{copy.lastLoaded}: {formatTime(lastLoadedAt, language)}</Typography>}
        </ResourceState>}
      </Box>
    </ManagementWorkspaceFrame>
  );
}
