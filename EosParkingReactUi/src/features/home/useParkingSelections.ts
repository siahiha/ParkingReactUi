import { useEffect, useState } from 'react';
import type { Language } from '../../i18n/instance';
import { fetchParkingSelections, parkingSettingsChangedEvent, type ParkingSelection } from './parkingSelectionService';

export function useParkingSelections(currentParkingId: number, language: Language, refreshScope: string) {
  const [options, setOptions] = useState<ParkingSelection[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState(currentParkingId);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [settingsRevision, setSettingsRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setSettingsRevision(value => value + 1);
    window.addEventListener(parkingSettingsChangedEvent, refresh);
    return () => window.removeEventListener(parkingSettingsChangedEvent, refresh);
  }, []);
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setFailed(false);
    void fetchParkingSelections().then(next => {
      if (!isCurrent) return;
      setOptions(next);
      setSelectedParkingId(current => next.some(parking => parking.id === current)
        ? current : next.some(parking => parking.id === currentParkingId)
          ? currentParkingId : next[0]?.id ?? 0);
      setLoading(false);
    }).catch(() => {
      if (!isCurrent) return;
      setOptions([]);
      setFailed(true);
      setLoading(false);
    });
    return () => { isCurrent = false; };
  }, [currentParkingId, language, refreshScope, settingsRevision]);
  return { options, selectedParkingId, setSelectedParkingId, loading, failed };
}
