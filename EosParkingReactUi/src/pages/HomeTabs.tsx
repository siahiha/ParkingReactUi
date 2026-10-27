import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';

export type HomeTab = { path: string; label: string };

type Props = {
  tabs: HomeTab[];
  activePath: string;
  homeLabel: string;
  homePath?: string;
  closeLabel: string;
  direction: 'rtl' | 'ltr';
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

export function HomeTabs({ tabs, activePath, homeLabel, homePath = '/home', closeLabel, direction, onSelect, onClose }: Props) {
  return <Box className="home-tabs-strip" component="nav" aria-label={homeLabel} dir={direction}>
    <Tabs value={tabs.some((tab) => tab.path === activePath) ? activePath : false} onChange={(_, value: string) => onSelect(value)} variant="scrollable" scrollButtons="auto" className="home-tabs">
      {tabs.map((tab) => <Tab key={tab.path} value={tab.path} aria-label={tab.path === homePath ? homeLabel : tab.label} label={<Box className="home-tab-label"><Box component="span" className="home-tab-text">{tab.path === homePath ? <HomeRoundedIcon fontSize="small" /> : tab.label}</Box>{tab.path !== homePath && <Tooltip title={closeLabel}><IconButton component="span" className="home-tab-close" aria-label={`${closeLabel}: ${tab.label}`} onClick={(event) => { event.stopPropagation(); onClose(tab.path); }}><CloseRoundedIcon fontSize="inherit" /></IconButton></Tooltip>}</Box>} />)}
    </Tabs>
  </Box>;
}
