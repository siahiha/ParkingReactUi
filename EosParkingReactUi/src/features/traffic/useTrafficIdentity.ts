import { useCallback, useEffect, useRef, useState } from 'react';
import { trafficIdentityService, type TrafficIdentity, type VehicleDraft } from './trafficIdentityService';
import { TrafficOperationError } from './trafficOperationService';

export function useTrafficIdentity(parkingId: number, doorId: string, canEditVehicle: boolean) {
  const [details, setDetails] = useState<TrafficIdentity | null>(null);
  const requestController = useRef(new AbortController());
  useEffect(() => {
    requestController.current = new AbortController();
    setDetails(null);
    return () => { requestController.current.abort(); };
  }, [parkingId, doorId]);

  const lookup = (plate: string, card: string, member: string) => {
    return trafficIdentityService.lookup(parkingId, plate, card, member, requestController.current.signal);
  };
  const saveVehicle = async (memberId: number, draft: VehicleDraft) => {
    if (!canEditVehicle) throw new TrafficOperationError('', 'vehicleForbidden');
    return trafficIdentityService.saveVehicle(memberId, draft);
  };
  const clear = useCallback(() => {
    setDetails(null);
  }, []);
  return { details, setDetails, lookup, saveVehicle, clear };
}
