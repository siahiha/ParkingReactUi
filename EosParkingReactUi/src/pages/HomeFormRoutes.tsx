import { Box, Paper, Typography } from '@mui/material';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import type { Language } from '../i18n';
import type { HomeUser } from './Home';
import { ParkingDefinitionsCrudWorkspace } from '../components/ParkingDefinitionsCrudWorkspace';
import { ParkingManagementWorkspace } from '../components/ParkingManagementWorkspace';
import { ExitPermissionWorkspace } from '../components/ExitPermissionWorkspace';
import { TariffListWorkspace } from '../features/tariffs/TariffListWorkspace';

type MenuItem = { key: string; label: string };
type Labels = { parkingManagement: string; listMenu: string; placeholder: string };

type Props = {
  language: Language;
  user: HomeUser;
  labels: Labels;
  selectedParkingId: number;
  visibleManagementItems: MenuItem[];
  visibleParkingMenuItems: MenuItem[];
  hasPart1: (bit: bigint, permissionName?: string) => boolean;
};

const crudKinds = new Set(['space-types', 'floors', 'zones', 'member-kinds']);

function ManagementPage({ language, user, labels, selectedParkingId, visibleManagementItems }: Omit<Props, 'hasPart1'>) {
  const { section } = useParams();
  if (section === 'list') {
      return <ParkingManagementWorkspace itemKey="parking-list" title={labels.listMenu} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} />;
  }
  if (section === 'users' || section === 'access') {
      return <ParkingManagementWorkspace itemKey={section} title={visibleManagementItems.find((item) => item.key === section)?.label ?? ''} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} />;
  }
  if (section === 'exit') {
      return <ExitPermissionWorkspace parkingId={selectedParkingId} language={language} userId={user.id} pageTitle={labels.parkingManagement} />;
  }
  return <Paper className="home-workspace" elevation={0}><Typography variant="h6">{visibleManagementItems.find((item) => item.key === section)?.label}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.placeholder}</Typography></Paper>;
}

function ParkingPage({ language, user, labels, selectedParkingId, visibleParkingMenuItems, hasPart1 }: Props) {
  const { itemKey } = useParams();
  const item = visibleParkingMenuItems.find((candidate) => candidate.key === itemKey);
  if (!item) return <Navigate to="/home" replace />;
  if (crudKinds.has(item.key)) {
    return <ParkingDefinitionsCrudWorkspace kind={item.key as 'space-types' | 'floors' | 'zones' | 'member-kinds'} title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} canEdit={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 48n)} canDelete={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 49n)} />;
  }
  if (item.key === 'tariffs') {
    return <TariffListWorkspace title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} />;
  }
  return <ParkingManagementWorkspace itemKey={item.key} title={item.label} parkingId={selectedParkingId} language={language} />;
}

export function HomeFormRoutes(props: Props) {
  return (
    <Routes>
      <Route path="management/:section" element={<ManagementPage {...props} />} />
      <Route path="parking/:itemKey" element={<ParkingPage {...props} />} />
    </Routes>
  );
}
