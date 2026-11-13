import type { Language } from '../../i18n/instance';
type WorkspaceProps = { title: string; pageTitle?: string; parkingId: number; language: Language; isCommercialParking?: boolean };
export type TrafficControlProps = WorkspaceProps & { userId?: number; canEditVehicle?: boolean; canSearchHistory?: boolean };
export type TrafficHistoryProps = WorkspaceProps & {
  userId?: number;
  initialIdentity?: { plate: string; card: string; member: string; doorId: string };
  onBusyChange?: (busy: boolean) => void;
};
