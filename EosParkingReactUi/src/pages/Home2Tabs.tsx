import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { HomeTab } from './HomeTabs';

type Props = {
  tabs: HomeTab[];
  activePath: string;
  homePath: string;
  direction: 'rtl' | 'ltr';
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

export function Home2Tabs({ tabs, activePath, homePath, direction, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const homeLabel = t('home2.home');
  const closeLabel = t('home2.closeTab');

  return <Box className="home2-tabs" component="nav" aria-label={t('home2.tabs')} dir={direction}>
    <Box className="home2-tabs-caption">{t('home2.tabs')}</Box>
    <Tabs value={tabs.some((tab) => tab.path === activePath) ? activePath : false} onChange={(_, value: string) => onSelect(value)} variant="scrollable" scrollButtons="auto">
      {tabs.map((tab) => <Tab key={tab.path} value={tab.path} aria-label={tab.path === homePath ? homeLabel : tab.label} label={<Box className="home2-tab-label"><Box component="span" className="home2-tab-text">{tab.path === homePath ? <HomeRoundedIcon fontSize="small" /> : tab.label}</Box>{tab.path !== homePath && <Tooltip title={closeLabel}><IconButton component="span" className="home2-tab-close" aria-label={`${closeLabel}: ${tab.label}`} onClick={(event) => { event.stopPropagation(); onClose(tab.path); }}><CloseRoundedIcon fontSize="inherit" /></IconButton></Tooltip>}</Box>} />)}
    </Tabs>
  </Box>;
}
