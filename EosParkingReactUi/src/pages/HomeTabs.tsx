import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import type { HomeTab } from './homeTypes';

type Props = {
  tabs: HomeTab[];
  activePath: string;
  homePath: string;
  homeLabel: string;
  closeLabel: string;
  direction: 'rtl' | 'ltr';
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

export function HomeTabs({ tabs, activePath, homePath, homeLabel, closeLabel, direction, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const translate = t as unknown as (key: string) => string;
  const labelForTab = (tab: HomeTab) => {
    if (tab.path === homePath) return homeLabel;
    const match = tab.path.match(/\/(?:management|parking)\/([^/]+)$/);
    return match ? translate(`homeMenu.items.${match[1]}`) : homeLabel;
  };

  return <Box className="home3-tabs" component="nav" aria-label={homeLabel} dir={direction}>
    <Box className="home3-tabs-rule" />
    <Tabs value={tabs.some((tab) => tab.path === activePath) ? activePath : false} onChange={(_, value: string) => onSelect(value)} variant="scrollable" scrollButtons="auto">
      {tabs.map((tab) => { const label = labelForTab(tab); return <Tab key={tab.path} value={tab.path} aria-label={tab.path === homePath ? homeLabel : label} label={<Box className="home3-tab-label"><Box component="span" className="home3-tab-text">{tab.path === homePath ? <HomeRoundedIcon fontSize="small" /> : label}</Box>{tab.path !== homePath && <Tooltip title={closeLabel}><IconButton component="span" className="home3-tab-close" aria-label={`${closeLabel}: ${label}`} onClick={(event) => { event.stopPropagation(); onClose(tab.path); }}><CloseRoundedIcon fontSize="inherit" /></IconButton></Tooltip>}</Box>} />; })}
    </Tabs>
  </Box>;
}
