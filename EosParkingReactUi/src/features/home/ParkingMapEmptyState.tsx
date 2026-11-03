import { Box, Typography } from '@mui/material';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import { useTranslation } from 'react-i18next';

export function ParkingMapEmptyState() {
  const { t } = useTranslation();

  return <Box className="home3-map-empty">
    <Box className="home3-map-schematic" role="img" aria-label={t('parkingMap.schematic')}>
      <Box className="home3-schematic-grid" aria-hidden="true">
        {Array.from({ length: 20 }, (_, index) => <Box component="span" key={index} className="home3-schematic-bay">
          {index % 4 === 1 || index % 7 === 0 ? <span className="home3-schematic-car" /> : <LocalParkingRoundedIcon />}
        </Box>)}
      </Box>
      <Box className="home3-schematic-aisle" aria-hidden="true"><span /><span /><span /></Box>
    </Box>
    <Box className="home3-schematic-caption">
      <LocalParkingRoundedIcon />
      <Typography>{t('parkingMap.empty')}</Typography>
      <Typography>{t('parkingMap.schematic')}</Typography>
    </Box>
  </Box>;
}
