import { AccessLevelWorkspace } from './management/AccessLevelWorkspace';
import { CardManagementWorkspace } from './management/CardManagementWorkspace';
import { ParkingDetailsWorkspace } from './management/ParkingDetailsWorkspace';
import { ParkingDirectoryWorkspace } from './management/ParkingDirectoryWorkspace';
import { ReadOnlyModuleWorkspace } from './management/ReadOnlyModuleWorkspace';
import { UserManagementWorkspace } from './management/UserManagementWorkspace';
import type { Language } from './management/managementTypes';

type Props = {
  itemKey: string;
  title: string;
  pageTitle?: string;
  parkingId: number;
  language: Language;
};

/** Route-level composition only. Each resource owns its own state, API workflow and form. */
export function ParkingManagementWorkspace({ itemKey, title, pageTitle, parkingId, language }: Props) {
  if (itemKey === 'parking-list') return <ParkingDirectoryWorkspace title={title} pageTitle={pageTitle} language={language} />;
  if (itemKey === 'parking-details') return <ParkingDetailsWorkspace title={title} pageTitle={pageTitle} parkingId={parkingId} language={language} />;
  if (itemKey === 'users') return <UserManagementWorkspace title={title} pageTitle={pageTitle} language={language} />;
  if (itemKey === 'access') return <AccessLevelWorkspace title={title} pageTitle={pageTitle} language={language} />;
  if (itemKey === 'cards') return <CardManagementWorkspace title={title} pageTitle={pageTitle} parkingId={parkingId} language={language} />;
  return <ReadOnlyModuleWorkspace itemKey={itemKey} title={title} pageTitle={pageTitle} parkingId={parkingId} language={language} />;
}
