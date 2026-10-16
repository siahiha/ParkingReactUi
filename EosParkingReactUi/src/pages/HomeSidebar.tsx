import { useEffect, useState } from 'react';
import { Box, Button, Drawer, IconButton, Tooltip } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';

type Props = {
  appName: string; systemMenu: string; currentParkingSectionTitle: string; reportsSectionTitle: string;
  direction: 'rtl' | 'ltr';
  visibleManagementItems: Array<HomeMenuItem & { key: ManagementSection }>; visibleParkingMenuGroups: HomeMenuGroup[];
  activeParkingMenu: string | null; managementSection?: ManagementSection; onNavigate: (path: string) => void;
  canManageDashboard: boolean; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobileOpen: boolean; onMobileClose: () => void;
};

export function HomeSidebar({ appName, systemMenu, currentParkingSectionTitle, reportsSectionTitle, direction, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, onNavigate, canManageDashboard, collapsed, onCollapsedChange, mobileOpen, onMobileClose }: Props) {
  const [expandedMenuGroup, setExpandedMenuGroup] = useState<string | null>(canManageDashboard ? 'system' : 'definitions-root');
  const [expandedSubgroups, setExpandedSubgroups] = useState<Record<string, boolean>>({});
  const definitionsGroup = visibleParkingMenuGroups.find((group) => group.key === 'definitions');
  const currentParkingSubgroups = visibleParkingMenuGroups.filter((group) => group.key === 'operations' || group.key === 'integrations');
  const reportsGroup = visibleParkingMenuGroups.find((group) => group.key === 'reports');
  const activeParkingSubgroup = currentParkingSubgroups.find((group) => group.items.some((item) => item.key === activeParkingMenu));
  const activeParkingSubgroupKey = activeParkingSubgroup?.key;
  const reportSubgroups = reportsGroup?.subgroups ?? [];
  const activeReportSubgroup = reportSubgroups.find((group) => group.items.some((item) => item.key === activeParkingMenu));
  const activeReportSubgroupKey = activeReportSubgroup?.key;
  const activeParkingMenuIsReport = Boolean(activeParkingMenu && (reportsGroup?.items.some((item) => item.key === activeParkingMenu) || activeReportSubgroup));
  const parkingGroupIcons = { definitions: <SettingsRoundedIcon />, operations: <TrafficRoundedIcon />, integrations: <SyncRoundedIcon />, reports: <AssessmentRoundedIcon />, 'member-reports': <PeopleAltRoundedIcon />, 'traffic-reports': <TrafficRoundedIcon />, 'financial-reports': <ReceiptLongRoundedIcon />, 'other-reports': <AssessmentRoundedIcon />, 'management-reports': <AssessmentRoundedIcon /> };

  useEffect(() => {
    if (managementSection) {
      setExpandedMenuGroup('system');
      setExpandedSubgroups({});
      return;
    }
    if (!activeParkingMenu) return;
    if (activeParkingMenuIsReport) {
      setExpandedMenuGroup('reports-root');
      setExpandedSubgroups(activeReportSubgroupKey ? { [activeReportSubgroupKey]: true } : {});
      return;
    }
    setExpandedMenuGroup('definitions-root');
    setExpandedSubgroups(activeParkingSubgroupKey ? { [activeParkingSubgroupKey]: true } : {});
  }, [activeParkingMenu, activeParkingMenuIsReport, activeParkingSubgroupKey, activeReportSubgroupKey, managementSection]);

  const navigate = (path: string) => { onNavigate(path); onMobileClose(); };
  const openCompactGroup = (group: string) => {
    onCollapsedChange(false);
    if (group === 'system' || group === 'reports-root' || group === 'definitions-root') {
      setExpandedMenuGroup(group);
      setExpandedSubgroups({});
    } else {
      setExpandedMenuGroup('definitions-root');
      setExpandedSubgroups({ [group]: true });
    }
  };
  const renderParkingGroup = (group: HomeMenuGroup) => {
    const isExpanded = Boolean(expandedSubgroups[group.key]);
    return <Box key={group.key} className="home-menu-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-branch-heading ${isExpanded ? 'active' : ''}`} startIcon={parkingGroupIcons[group.key as keyof typeof parkingGroupIcons]} endIcon={<ExpandMoreRoundedIcon className={isExpanded ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedSubgroups((current) => ({ ...current, [group.key]: !isExpanded }))} aria-expanded={isExpanded}>{group.title}</Button>{isExpanded && <Box className="home-section-items home-nested-subnav">{group.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item home-nested-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}</Box>}</Box>;
  };
  const renderCompactNavigation = () => <Box className="home-sidebar-icon-rail" aria-label={appName}>
    {visibleManagementItems.length > 0 && <Tooltip title={systemMenu} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={managementSection ? 'active' : ''} aria-label={systemMenu} onClick={() => openCompactGroup('system')}><LocalParkingRoundedIcon /></IconButton></Tooltip>}
    {definitionsGroup && <Tooltip title={currentParkingSectionTitle} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={activeParkingMenu && !activeParkingMenuIsReport ? 'active' : ''} aria-label={currentParkingSectionTitle} onClick={() => openCompactGroup('definitions-root')}><SettingsRoundedIcon /></IconButton></Tooltip>}
    {currentParkingSubgroups.map((group) => <Tooltip key={group.key} title={group.title} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton aria-label={group.title} onClick={() => openCompactGroup(group.key)}>{parkingGroupIcons[group.key as keyof typeof parkingGroupIcons]}</IconButton></Tooltip>)}
    {reportsGroup && <Tooltip title={reportsSectionTitle} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={activeParkingMenuIsReport ? 'active' : ''} aria-label={reportsSectionTitle} onClick={() => openCompactGroup('reports-root')}><AssessmentRoundedIcon /></IconButton></Tooltip>}
  </Box>;
  const renderFullNavigation = () => <>
    {visibleManagementItems.length > 0 && <Box className="home-menu-section home-system-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'system' ? 'active' : ''}`} startIcon={<LocalParkingRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'system' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'system' ? null : 'system')} aria-expanded={expandedMenuGroup === 'system'}>{systemMenu}</Button>{expandedMenuGroup === 'system' && <Box className="home-top-level-subnav">{visibleManagementItems.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${managementSection === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/management/${item.key}`)}>{item.label}</Button>)}</Box>}</Box>}
    <Box className="home-sidebar-parking-menu"><Box className="home-menu-section home-current-parking-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'definitions-root' ? 'active' : ''}`} startIcon={<SettingsRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'definitions-root' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'definitions-root' ? null : 'definitions-root')} aria-expanded={expandedMenuGroup === 'definitions-root'}>{currentParkingSectionTitle}</Button>{expandedMenuGroup === 'definitions-root' && <Box className="home-current-parking-subgroups home-top-level-subnav">{definitionsGroup?.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}{currentParkingSubgroups.map(renderParkingGroup)}</Box>}</Box><Box className="home-menu-section home-reports-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'reports-root' ? 'active' : ''}`} startIcon={<AssessmentRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'reports-root' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'reports-root' ? null : 'reports-root')} aria-expanded={expandedMenuGroup === 'reports-root'}>{reportsSectionTitle}</Button>{expandedMenuGroup === 'reports-root' && reportsGroup && <Box className="home-current-parking-subgroups home-reports-subgroups home-top-level-subnav">{reportsGroup.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}{reportSubgroups.map(renderParkingGroup)}</Box>}</Box></Box>
  </>;
  const navigation = (isDrawer: boolean) => <Box className={`home-sidebar-content ${isDrawer ? 'home-sidebar-drawer-content' : ''}`} dir={direction}>
    {isDrawer || !collapsed ? renderFullNavigation() : renderCompactNavigation()}
  </Box>;

  return <>
    <Drawer
      variant="permanent"
      open={!collapsed}
      anchor={direction === 'rtl' ? 'right' : 'left'}
      className={`home-sidebar ${collapsed ? 'home-sidebar-collapsed' : ''}`}
      slotProps={{ paper: { className: 'home-sidebar-paper' } }}
    >
      <Box component="nav" aria-label={appName}>{navigation(false)}</Box>
    </Drawer>
    <Drawer className="home-sidebar-drawer-root" anchor={direction === 'rtl' ? 'right' : 'left'} open={mobileOpen} onClose={onMobileClose} slotProps={{ paper: { className: 'home-sidebar-drawer' } }}>
      <Box className="home-sidebar-drawer-surface" component="nav" aria-label={appName}>{navigation(true)}</Box>
    </Drawer>
  </>;
}
