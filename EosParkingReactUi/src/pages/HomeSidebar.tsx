import { useEffect, useState } from 'react';
import { Box, Button, Divider, Drawer, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';

type Props = {
  appName: string; systemMenu: string; currentParkingSectionTitle: string; reportsSectionTitle: string;
  direction: 'rtl' | 'ltr'; collapseLabel: string; expandLabel: string;
  visibleManagementItems: Array<HomeMenuItem & { key: ManagementSection }>; visibleParkingMenuGroups: HomeMenuGroup[];
  activeParkingMenu: string | null; managementSection?: ManagementSection; onNavigate: (path: string) => void;
  canManageDashboard: boolean; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobileOpen: boolean; onMobileClose: () => void;
};

export function HomeSidebar({ appName, systemMenu, currentParkingSectionTitle, reportsSectionTitle, direction, collapseLabel, expandLabel, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, onNavigate, canManageDashboard, collapsed, onCollapsedChange, mobileOpen, onMobileClose }: Props) {
  const [expandedMenuGroup, setExpandedMenuGroup] = useState<string | null>(canManageDashboard ? 'system' : 'definitions-root');
  const [expandedSubgroups, setExpandedSubgroups] = useState<Record<string, boolean>>({});
  const definitionsGroup = visibleParkingMenuGroups.find((group) => group.key === 'definitions');
  const currentParkingSubgroups = visibleParkingMenuGroups.filter((group) => group.key === 'operations' || group.key === 'integrations');
  const reportsGroup = visibleParkingMenuGroups.find((group) => group.key === 'reports');
  const parkingGroupIcons = { definitions: <SettingsRoundedIcon />, operations: <TrafficRoundedIcon />, integrations: <SyncRoundedIcon />, reports: <AssessmentRoundedIcon /> };

  useEffect(() => {
    if (managementSection) setExpandedMenuGroup('system');
    if (activeParkingMenu && reportsGroup?.items.some((item) => item.key === activeParkingMenu)) setExpandedMenuGroup('reports-root');
    if (activeParkingMenu && !reportsGroup?.items.some((item) => item.key === activeParkingMenu)) setExpandedMenuGroup('definitions-root');
  }, [activeParkingMenu, managementSection, reportsGroup]);

  const navigate = (path: string) => { onNavigate(path); onMobileClose(); };
  const openCompactGroup = (group: string) => {
    onCollapsedChange(false);
    if (group === 'system' || group === 'reports-root' || group === 'definitions-root') setExpandedMenuGroup(group);
    else { setExpandedMenuGroup('definitions-root'); setExpandedSubgroups((current) => ({ ...current, [group]: true })); }
  };
  const renderParkingGroup = (group: HomeMenuGroup) => {
    const isExpanded = Boolean(expandedSubgroups[group.key]);
    return <Box key={group.key} className="home-menu-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-branch-heading ${isExpanded ? 'active' : ''}`} startIcon={parkingGroupIcons[group.key as keyof typeof parkingGroupIcons]} endIcon={<ExpandMoreRoundedIcon className={isExpanded ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedSubgroups((current) => ({ ...current, [group.key]: !isExpanded }))} aria-expanded={isExpanded}>{group.title}</Button>{isExpanded && <Box className="home-section-items home-nested-subnav">{group.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item home-nested-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}</Box>}</Box>;
  };
  const renderCompactNavigation = () => <Box className="home-sidebar-icon-rail" aria-label={appName}>
    {visibleManagementItems.length > 0 && <Tooltip title={systemMenu} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={managementSection ? 'active' : ''} aria-label={systemMenu} onClick={() => openCompactGroup('system')}><LocalParkingRoundedIcon /></IconButton></Tooltip>}
    {definitionsGroup && <Tooltip title={currentParkingSectionTitle} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={activeParkingMenu && !reportsGroup?.items.some((item) => item.key === activeParkingMenu) ? 'active' : ''} aria-label={currentParkingSectionTitle} onClick={() => openCompactGroup('definitions-root')}><SettingsRoundedIcon /></IconButton></Tooltip>}
    {currentParkingSubgroups.map((group) => <Tooltip key={group.key} title={group.title} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton aria-label={group.title} onClick={() => openCompactGroup(group.key)}>{parkingGroupIcons[group.key as keyof typeof parkingGroupIcons]}</IconButton></Tooltip>)}
    {reportsGroup && <Tooltip title={reportsSectionTitle} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={reportsGroup.items.some((item) => item.key === activeParkingMenu) ? 'active' : ''} aria-label={reportsSectionTitle} onClick={() => openCompactGroup('reports-root')}><AssessmentRoundedIcon /></IconButton></Tooltip>}
  </Box>;
  const renderFullNavigation = () => <>
    {visibleManagementItems.length > 0 && <Box className="home-menu-section home-system-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'system' ? 'active' : ''}`} startIcon={<LocalParkingRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'system' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'system' ? null : 'system')} aria-expanded={expandedMenuGroup === 'system'}>{systemMenu}</Button>{expandedMenuGroup === 'system' && <Box className="home-top-level-subnav">{visibleManagementItems.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${managementSection === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/management/${item.key}`)}>{item.label}</Button>)}</Box>}</Box>}
    <Box className="home-sidebar-parking-menu"><Box className="home-menu-section home-current-parking-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'definitions-root' ? 'active' : ''}`} startIcon={<SettingsRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'definitions-root' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'definitions-root' ? null : 'definitions-root')} aria-expanded={expandedMenuGroup === 'definitions-root'}>{currentParkingSectionTitle}</Button>{expandedMenuGroup === 'definitions-root' && <Box className="home-current-parking-subgroups home-top-level-subnav">{definitionsGroup?.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}{currentParkingSubgroups.map(renderParkingGroup)}</Box>}</Box><Box className="home-menu-section home-reports-section home-top-level-section"><Button className={`home-nav-item home-menu-group-button home-parking-group-button home-top-level-heading ${expandedMenuGroup === 'reports-root' ? 'active' : ''}`} startIcon={<AssessmentRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedMenuGroup === 'reports-root' ? 'menu-chevron-open' : ''} />} onClick={() => setExpandedMenuGroup(expandedMenuGroup === 'reports-root' ? null : 'reports-root')} aria-expanded={expandedMenuGroup === 'reports-root'}>{reportsSectionTitle}</Button>{expandedMenuGroup === 'reports-root' && reportsGroup && <Box className="home-current-parking-subgroups home-reports-subgroups home-top-level-subnav">{reportsGroup.items.map((item) => <Button key={item.key} className={`home-nav-item home-leaf-item ${activeParkingMenu === item.key ? 'active' : ''}`} startIcon={item.icon} onClick={() => navigate(`/home/parking/${item.key}`)}>{item.label}</Button>)}</Box>}</Box></Box>
  </>;
  const navigation = (isDrawer: boolean) => <Box className={`home-sidebar-content ${isDrawer ? 'home-sidebar-drawer-content' : ''}`} dir={direction}><Box className="home-sidebar-brand-box"><Box component="img" className="home-sidebar-brand-image" src="/parking-logo.png" alt="" />{(!collapsed || isDrawer) && <Typography className="home-sidebar-brand-title">{appName}</Typography>}<Tooltip title={isDrawer ? collapseLabel : (collapsed ? expandLabel : collapseLabel)}><IconButton className="home-sidebar-collapse-button" aria-label={isDrawer ? collapseLabel : (collapsed ? expandLabel : collapseLabel)} onClick={isDrawer ? onMobileClose : () => onCollapsedChange(!collapsed)}>{isDrawer ? (direction === 'rtl' ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />) : (collapsed ? <MenuOpenRoundedIcon /> : (direction === 'rtl' ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />))}</IconButton></Tooltip></Box><Divider className="home-sidebar-brand-divider" />{isDrawer || !collapsed ? renderFullNavigation() : renderCompactNavigation()}</Box>;

  return <>
    <Paper component="nav" aria-label={appName} className={`home-sidebar ${collapsed ? 'home-sidebar-collapsed' : ''}`} elevation={0}>{navigation(false)}</Paper>
    <Drawer open={mobileOpen} onClose={onMobileClose} slotProps={{ paper: { className: 'home-sidebar-drawer' } }}>
      <Box component="nav" aria-label={appName}>{navigation(true)}</Box>
    </Drawer>
  </>;
}
