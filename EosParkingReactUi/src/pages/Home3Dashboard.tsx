import { Alert, Box } from '@mui/material';
import type { Language } from '../i18n';
import { useHome3ParkingInfo } from '../features/home3/useHome3ParkingInfo';
import { Home3DashboardIntro } from './Home3DashboardIntro';
import { Home3DashboardLower } from './Home3DashboardLower';
import { Home3DashboardOverview } from './Home3DashboardOverview';
import { useTranslation } from 'react-i18next';

type Props = {
  language: Language;
  selectedParkingName: string;
  selectedParkingId: number;
  basePath: '/home' | '/home2' | '/home3';
  onNavigate: (path: string) => void;
};

export function Home3Dashboard({ language, selectedParkingName, selectedParkingId, basePath, onNavigate }: Props) {
  const { t } = useTranslation();
  const navigateTo = (path: string) => onNavigate(`${basePath}${path}`);
  const parkingInfo = useHome3ParkingInfo(selectedParkingId);

  return <Box className="home3-dashboard">
    <Home3DashboardIntro language={language} selectedParkingName={selectedParkingName} />
    {parkingInfo.error && <Alert severity="error">{t('home2.parkingInfoLoadError')}</Alert>}
    <Home3DashboardOverview language={language} parkingInfo={parkingInfo.data} refreshing={parkingInfo.refreshing} onRefresh={() => void parkingInfo.refresh()} onNavigate={navigateTo} />
    <Home3DashboardLower onNavigate={navigateTo} />
  </Box>;
}
