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
const MemberReportWorkspace = lazy(() => import('../features/reports/MemberReportWorkspace').then((module) => ({ default: module.MemberReportWorkspace })));
const TrafficReportWorkspace = lazy(() => import('../features/reports/TrafficReportWorkspace').then((module) => ({ default: module.TrafficReportWorkspace })));
const FinancialReportWorkspace = lazy(() => import('../features/reports/FinancialReportWorkspace').then((module) => ({ default: module.FinancialReportWorkspace })));
const CargoReportWorkspace = lazy(() => import('../features/reports/CargoReportWorkspace').then((module) => ({ default: module.CargoReportWorkspace })));
const ManagementReportWorkspace = lazy(() => import('../features/reports/ManagementReportWorkspace').then((module) => ({ default: module.ManagementReportWorkspace })));

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
const memberReportStates = { 'member-report': 'all', 'active-member-report': 'active', 'inactive-member-report': 'inactive' } as const;
const trafficReportKinds = { 'traffic-reports-list': 'details', 'door-traffic-reports': 'daily', 'average-parking-time': 'average' } as const;
const financialReportKinds = { 'parking-income': 'parking-income', 'monthly-parking-income': 'monthly-income', 'member-cash': 'member-cash', 'user-performance': 'user-performance', 'membership-income': 'membership-income' } as const;
const managementReportKinds = { 'management-monthly-income-comparison': 'monthly-income-comparison', 'management-income-comparison': 'income-comparison', 'management-yearly-income-comparison': 'yearly-income-comparison', 'management-user-performance': 'user-performance', 'management-free-parking-income': 'free-parking-income' } as const;

function AccessDenied({ labels }: Pick<Props, 'labels'>) {
  const navigate = useNavigate();
  return <Paper className="home-workspace" elevation={0} role="alert"><Typography variant="h6">{labels.accessDeniedTitle}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.accessDeniedMessage}</Typography><Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/home')}>{labels.backHome}</Button></Paper>;
}

function UnknownRoute({ labels }: Pick<Props, 'labels'>) {
  const navigate = useNavigate();
  return <Paper className="home-workspace" elevation={0} role="alert"><Typography variant="h6">{labels.unknownRouteTitle}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.unknownRouteMessage}</Typography><Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/home')}>{labels.backHome}</Button></Paper>;
}

function ManagementPage({ language, labels, selectedParkingId, visibleManagementItems, allManagementItems }: Omit<Props, 'hasPart1' | 'visibleParkingMenuItems' | 'allParkingMenuItems'>) {
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
      return <ExitPermissionWorkspace parkingId={selectedParkingId} language={language} />;
  }
  return <Paper className="home-workspace" elevation={0}><Typography variant="h6">{visibleManagementItems.find((item) => item.key === section)?.label}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{labels.placeholder}</Typography></Paper>;
}

function ParkingPage({ language, user, labels, selectedParkingId, visibleParkingMenuItems, allParkingMenuItems, hasPart1 }: Props) {
  const { itemKey } = useParams();
  const item = allParkingMenuItems.find((candidate) => candidate.key === itemKey);
  if (!item) return <UnknownRoute labels={labels} />;
  if (!visibleParkingMenuItems.some((candidate) => candidate.key === itemKey)) return <AccessDenied labels={labels} />;
  if (itemKey && itemKey in memberReportStates) {
    return <MemberReportWorkspace title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} state={memberReportStates[itemKey as keyof typeof memberReportStates]} />;
  }
  if (itemKey && itemKey in trafficReportKinds) {
    return <TrafficReportWorkspace title={item.label} parkingId={selectedParkingId} language={language} kind={trafficReportKinds[itemKey as keyof typeof trafficReportKinds]} />;
  }
  if (itemKey && itemKey in financialReportKinds) {
    return <FinancialReportWorkspace title={item.label} parkingId={selectedParkingId} language={language} kind={financialReportKinds[itemKey as keyof typeof financialReportKinds]} />;
  }
  if (itemKey && itemKey in managementReportKinds) {
    return <ManagementReportWorkspace title={item.label} language={language} kind={managementReportKinds[itemKey as keyof typeof managementReportKinds]} />;
  }
  if (itemKey === 'cargo-details') {
    return <CargoReportWorkspace title={item.label} language={language} />;
  }
  if (crudKinds.has(item.key)) {
    return <ParkingDefinitionsCrudWorkspace kind={item.key as 'space-types' | 'floors' | 'zones' | 'member-kinds'} title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} canEdit={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 48n)} canDelete={item.key !== 'member-kinds' || user.canManageDashboard || hasPart1(1n << 49n)} />;
  }
  if (item.key === 'doors') {
    return <ParkingManagementWorkspace itemKey="doors" title={item.label} pageTitle={labels.parkingManagement} parkingId={selectedParkingId} language={language} canEdit={user.canManageDashboard || hasPart1(1n << 14n)} canDelete={user.canManageDashboard || hasPart1(1n << 15n)} />;
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
