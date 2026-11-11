import { recordValue, type RecordValue } from '../../components/management/managementTypes';
import { hasOpenTraffic, hasTrafficTime } from './trafficOperationService';
import type { TrafficDoorType } from './trafficDoorService';

export function trafficActionState(doorType: TrafficDoorType | undefined, info: RecordValue | null) {
  const hasEntry = Boolean(info && hasTrafficTime(recordValue(info, 'EnterDateTime')) && !hasTrafficTime(recordValue(info, 'ExitDateTime')));
  const direction = doorType === 0 ? 'enter' : doorType === 1 ? 'exit' : doorType === 2 ? hasEntry ? 'exit' : 'enter' : null;
  return {
    direction,
    showEnter: doorType === 0 || doorType === 2,
    showExit: doorType === 1 || doorType === 2,
    canEnter: Boolean(info && (doorType === 0 || doorType === 2) && !hasEntry),
    canExit: Boolean(info && (doorType === 1 || doorType === 2) && hasOpenTraffic(info)),
    showSearch: Boolean(info && doorType !== undefined && (doorType === 0 || !hasEntry)),
  } as const;
}
