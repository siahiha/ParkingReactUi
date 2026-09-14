import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ApiError } from '../../api/client';
import { definitionApi } from '../../api/management';
import { formatTime } from '../../utils/formatters';
import { AppDataGrid } from '../AppDataGrid';
import { ManagementWorkspaceFrame } from './ManagementWorkspaceFrame';
import { ResourceState } from './ResourceState';
import { asRows, formatValue, moduleDefinitions, type Language, type RecordValue } from './managementTypes';

type Props = { itemKey: string; title: string; pageTitle?: string; parkingId: number; language: Language };

export function ReadOnlyModuleWorkspace({ itemKey, title, pageTitle, parkingId, language }: Props) {
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
      setError(cause instanceof ApiError && cause.status === 403 ? (language === 'fa' ? 'دسترسی مشاهده‌ی این بخش برای کاربر فعلی مجاز نیست.' : 'The current user is not allowed to view this module.') : (language === 'fa' ? 'دریافت اطلاعات این بخش از API ناموفق بود.' : 'Loading this module from the API failed.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [itemKey, parkingId, language]);

  const copy = language === 'fa'
    ? { loading: 'در حال دریافت اطلاعات...', empty: 'رکوردی برای نمایش وجود ندارد.', unavailable: 'برای این بخش هنوز endpoint قابل اتکایی در Backend شناسایی نشده است.', count: 'رکورد' }
    : { loading: 'Loading...', empty: 'No records to display.', unavailable: 'A reliable Backend endpoint has not been identified for this module yet.', count: 'records' };

  return (
    <ManagementWorkspaceFrame title={title} pageTitle={pageTitle} subtitle={definition ? `${rows.length} ${copy.count}` : copy.unavailable} language={language} loading={loading} onRefresh={definition ? () => void load() : undefined}>
      <Box className="workspace-resource-content">
        {!definition && <Typography variant="body2" color="text.secondary">{copy.unavailable}</Typography>}
        {definition && <ResourceState loading={loading} error={error} empty={rows.length === 0} loadingLabel={copy.loading} emptyLabel={copy.empty}>
          <AppDataGrid<RecordValue> direction={language === 'fa' ? 'rtl' : 'ltr'} rows={rows} rowKey={(row, index) => String(row.Id ?? row.id ?? index)} columns={definition.columns.map((column) => ({ key: column.key, label: language === 'fa' ? column.fa : column.en, render: (row) => formatValue(row[column.key] ?? row[column.key.charAt(0).toLowerCase() + column.key.slice(1)], language) }))} />
          {lastLoadedAt && !error && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>{language === 'fa' ? `آخرین دریافت: ${formatTime(lastLoadedAt, language)}` : `Last loaded: ${formatTime(lastLoadedAt, language)}`}</Typography>}
        </ResourceState>}
      </Box>
    </ManagementWorkspaceFrame>
  );
}
