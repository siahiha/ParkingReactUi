import { useEffect, useState } from 'react';
import { trafficRecordsService, type TrafficDoorOption } from './trafficRecordsService';

export function useTrafficDoors(parkingId: number, initialDoorId?: string, service: Pick<typeof trafficRecordsService, 'doors'> = trafficRecordsService) {
  const [doors, setDoors] = useState<TrafficDoorOption[]>([]);
  const [doorId, setDoorId] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setDoors([]); setDoorId(''); setError(false);
    void service.doors(parkingId).then(next => {
      if (!active) return;
      setDoors(next);
      setDoorId(String(next.find(door => String(door.id) === initialDoorId)?.id ?? next[0]?.id ?? ''));
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [parkingId, initialDoorId, service]);
  return { doors, doorId, setDoorId, error };
}
