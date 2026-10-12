import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { Language } from '../i18n';
import type { HomeUser } from './Home';
const ParkingDefinitionsCrudWorkspace = lazy(() => import('../components/ParkingDefinitionsCrudWorkspace').then((module) => ({ default: module.ParkingDefinitionsCrudWorkspace })));
const ParkingManagementWorkspace = lazy(() => import('../components/ParkingManagementWorkspace').then((module) => ({ default: module.ParkingManagementWorkspace })));
const ExitPermissionWorkspace = lazy(() => import('../components/ExitPermissionWorkspace').then((module) => ({ default: module.ExitPermissionWorkspace })));
const TariffListWorkspace = lazy(() => import('../features/tariffs/TariffListWorkspace').then((module) => ({ default: module.TariffListWorkspace })));
const MemberManagementWorkspace = lazy(() => import('../features/members/MemberManagementWorkspace').then((module) => ({ default: module.MemberManagementWorkspace })));

type MenuItem = { key: string; label: string };
type Labels = { parkingManagement: string; listMenu: string; placeholder: string; accessDeniedTitle: string; accessDeniedMessage: string; unknownRouteTitle: string; unknownRouteMessage: string; backHome: string };

type Props = {
  language: Language;
  user: HomeUser;
  labels: Labels;
  selectedParkingId: number;
  visibleManagementItems: MenuItem[];
  allManagementItems: MenuItem[];
  visibleParkingMenuItems: MenuItem[];
  allParkingMenuItems: MenuItem[];
  hasPart1: (bit: bigint, permissionName?: string) => boolean;
};

const crudKinds = new Set(['space-types', 'floors', 'zones', 'member-kinds']);

function AccessDenied({ labels }: Pick<Props, 'labels'>) {
  const navigate = useNavigate();
  return <Paper className="home-workspace" elevation={0} role="alert"><Typography variant="h6">{labels.accessDeniedTitle}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.accessDeniedMessage}</Typography><Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/home')}>{labels.backHome}</Button></Paper>;
}

function UnknownRoute({ labels }: Pick<Props, 'labels'>) {
  const navigate = useNavigate();
  return <Paper className="home-workspace" elevation={0} role="alert"><Typography variant="h6">{labels.unknownRouteTitle}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.unknownRouteMessage}</Typography><Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/home')}>{labels.backHome}</Button></Paper>;
}

function ManagementPage({ language, user, labels, selectedParkingId, visibleManagementItems, allManagementItems }: Omit<Props, 'hasPart1' | 'visibleParkingMenuItems' | 'allParkingMenuItems'>) {
  const { section } = useParams();
  const item = allManagementItems.find((candidate) => candidate.key === section);
  if (!item) return <UnknownRoute labels={labels} />;
  if (!visibleManagementItems.some((candidate) => candidate.key === section)) return <AccessDenied labels={labels} />;
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

function ParkingPage({ language, user, labels, selectedParkingId, visibleParkingMenuItems, allParkingMenuItems, hasPart1 }: Props) {
  const { itemKey } = useParams();
  const item = allParkingMenuItems.find((candidate) => candidate.key === itemKey);
  if (!item) return <UnknownRoute labels={labels} />;
  if (!visibleParkingMenuItems.some((candidate) => candidate.key === itemKey)) return <AccessDenied labels={labels} />;
  if (crudKinds.has(item.key)) {
    return <ParkingDefinitionsCrudWorkspace kind={item.key as 'space-types' | 'floors' | 'zones' | 'member-kinds'} title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} canEdit={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 48n)} canDelete={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 49n)} />;
  }
  if (item.key === 'tariffs') {
    return <TariffListWorkspace title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} />;
  }
  if (item.key === 'members') {
    return <MemberManagementWorkspace title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} />;
  }
  return <ParkingManagementWorkspace itemKey={item.key} title={item.label} parkingId={selectedParkingId} language={language} />;
}

export function HomeFormRoutes(props: Props) {
  return (
    <Suspense fallback={<Box className="inline-status-row"><CircularProgress size={20} /><Typography variant="body2">{props.language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</Typography></Box>}><Routes>
      <Route path="management/:section" element={<ManagementPage {...props} />} />
      <Route path="parking/:itemKey" element={<ParkingPage {...props} />} />
      <Route path="*" element={<UnknownRoute labels={props.labels} />} />
    </Routes></Suspense>
  );
}
