import { TrafficControlWorkspace } from '../../features/traffic/TrafficControlWorkspace';
import { TrafficHistoryWorkspace } from '../../features/traffic/TrafficHistoryWorkspace';
import type { TrafficControlProps, TrafficHistoryProps } from '../../features/traffic/trafficWorkspaceTypes';

type Props = TrafficControlProps & TrafficHistoryProps & { showCameras?: boolean };
/** Compatibility for the two existing menu routes. Each workflow owns its own state. */
export function TrafficRecordsWorkspace({ showCameras = false, ...props }: Props) {
  return showCameras ? <TrafficControlWorkspace key={props.parkingId} {...props} /> : <TrafficHistoryWorkspace key={props.parkingId} {...props} />;
}
