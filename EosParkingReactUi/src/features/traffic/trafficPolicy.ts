import type { RecordValue } from '../../components/management/managementTypes';
import { recordValue } from '../../components/management/managementTypes';

export type TrafficDirection = 'enter' | 'exit';
export type TrafficAlert = { key: 'inactiveMember' | 'blacklisted' | 'stolen' | 'observation' | 'exitNotApproved'; blocked: boolean; description?: string };
export const trafficBoolean = (value: unknown) => value === true || value === 1 || value === '1' || value === 'true';

export function trafficAlerts(info: RecordValue | null, direction: TrafficDirection, requireExitPermission: boolean): TrafficAlert[] {
  if (!info) return [];
  const alerts: TrafficAlert[] = [];
  if (trafficBoolean(recordValue(info, 'IsMemberBlock'))) alerts.push({ key: 'inactiveMember', blocked: true });
  const control = Number(recordValue(info, 'ControlType') ?? 0);
  const action = Number(recordValue(info, 'ControlListActionType') ?? 0);
  const applies = action === 0 || (action === 1 && direction === 'enter') || (action === 2 && direction === 'exit');
  const description = String(recordValue(info, 'Description') ?? '').trim();
  if (control === 1 && applies) alerts.push({ key: 'blacklisted', blocked: true, description });
  if (control === 2 && applies) alerts.push({ key: 'observation', blocked: false, description });
  // A stolen vehicle must never be cleared for exit; entry remains visible as a warning.
  if (control === 3) alerts.push({ key: 'stolen', blocked: direction === 'exit', description });
  if (direction === 'exit' && requireExitPermission && !trafficBoolean(recordValue(info, 'ExitPermission'))) {
    alerts.push({ key: 'exitNotApproved', blocked: true });
  }
  return alerts;
}
