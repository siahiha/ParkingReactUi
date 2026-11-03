import { useEffect, useState } from 'react';
import { ParkingMapRealtimeConnection } from '../../api/parkingMapRealtime';
import type { ParkingMapPage, ParkingMapQuery, ParkingMapStatus } from './parkingMapService';

export function useParkingMap(query: ParkingMapQuery) {
  const [snapshot, setSnapshot] = useState<{ key: string; data: ParkingMapPage | null; status: ParkingMapStatus }>({ key: '', data: null, status: 'connecting' });
  const [retry, setRetry] = useState(0);
  const key = `${query.parkingId}:${query.sectionId}:${query.page}:${query.pageSize}:${retry}`;
  useEffect(() => {
    let active = true;
    setSnapshot({ key, data: null, status: 'connecting' });
    if (query.parkingId <= 0) return;
    const connection = new ParkingMapRealtimeConnection(query,
      data => { if (active) setSnapshot({ key, data, status: 'connected' }); },
      status => {
        if (active) setSnapshot(previous => ({ key,
          data: previous.key === key && status !== 'unauthorized' && status !== 'forbidden' && status !== 'notFound' ? previous.data : null,
          status }));
      });
    void connection.start();
    return () => { active = false; connection.stop(); };
  }, [key, query.parkingId, query.sectionId, query.page, query.pageSize]);
  const current = snapshot.key === key ? snapshot : { data: null, status: 'connecting' as const };
  return { ...current, retry: () => setRetry(value => value + 1) };
}
