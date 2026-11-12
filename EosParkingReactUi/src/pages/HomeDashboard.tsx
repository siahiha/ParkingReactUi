import { Box } from '@mui/material';
import type { Language } from '../i18n/instance';
import { useHomeParkingInfo } from '../features/home/useHomeParkingInfo';
import { HomeDashboardIntro } from './HomeDashboardIntro';
import { HomeDashboardLower } from './HomeDashboardLower';
import { HomeDashboardOverview } from './HomeDashboardOverview';

type Props = {
  language: Language;
  selectedParkingName: string;
  selectedParkingId: number;
  basePath: '/home' | '/home';
  onNavigate: (path: string) => void;
};

export function HomeDashboard({ language, selectedParkingName, selectedParkingId, basePath, onNavigate }: Props) {
  const navigateTo = (path: string) => onNavigate(`${basePath}${path}`);
  const parkingInfo = useHomeParkingInfo(selectedParkingId);

  return <Box className="home3-dashboard">
    <HomeDashboardIntro language={language} selectedParkingName={selectedParkingName} connectionError={parkingInfo.error} />
    <HomeDashboardOverview parkingId={selectedParkingId} language={language} parkingInfo={parkingInfo.data} refreshing={parkingInfo.refreshing} onRefresh={() => void parkingInfo.refresh()} />
    <HomeDashboardLower onNavigate={navigateTo} />
  </Box>;
}
