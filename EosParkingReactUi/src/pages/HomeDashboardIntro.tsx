import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import type { Language } from '../i18n/instance';
import { ConnectionStatusIndicator } from '../components/ConnectionStatusIndicator';

type Props = {
  language: Language;
  selectedParkingName: string;
  connectionError?: boolean;
};

export function HomeDashboardIntro({ language, selectedParkingName, connectionError = false }: Props) {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(language);

  return <Box className="home3-intro">
    <Box className="home3-intro-copy">
      <Box className="home3-intro-text-block">
        <Typography className="home3-overline">{t('home.smartInfrastructure')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography component="h1" className="home3-title"><Box component="span" className="home3-title-name">{selectedParkingName}</Box></Typography>
          <ConnectionStatusIndicator message={connectionError ? t('home.parkingInfoLoadError') : ''} />
        </Box>
      </Box>
    </Box>
  </Box>;
}



