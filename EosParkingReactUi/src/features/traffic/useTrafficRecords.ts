import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import type { RecordValue } from '../../utils/records';
import { trafficRecordsService, type TrafficHistoryFilter } from './trafficRecordsService';

type LoadError = '' | 'forbidden' | 'loadError';
export function useTrafficRecords(filter: TrafficHistoryFilter, enabled: boolean, service = trafficRecordsService) {
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoadError>('');
  const sequence = useRef(0);
  const { parkingId, startDate, endDate, sourceType } = filter;
  const refresh = useCallback(async () => {
    if (!enabled) return;
    const request = ++sequence.current;
    setLoading(true); setError('');
    try {
      const result = await service.list({ parkingId, startDate, endDate, sourceType });
      if (request === sequence.current) setRows(result);
    } catch (cause) {
      if (request === sequence.current) {
        setRows([]); setError(cause instanceof ApiError && cause.status === 403 ? 'forbidden' : 'loadError');
      }
    } finally { if (request === sequence.current) setLoading(false); }
  }, [enabled, parkingId, startDate, endDate, sourceType, service]);
  useEffect(() => { void refresh(); return () => { sequence.current++; }; }, [refresh]);
  return { rows, loading, error, refresh, create: service.create, update: service.update, remove: service.remove, credit: service.credit };
}
