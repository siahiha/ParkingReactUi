import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrafficRoundedIcon from '@mui/icons-material/TrafficRounded';
import { useTranslation } from 'react-i18next';
import type { HomeMenuGroup, HomeMenuItem, ManagementSection } from './homeMenuModel';

type Props = { appName: string; direction: 'rtl' | 'ltr'; basePath: '/home' | '/home2' | '/home3'; systemMenu: string; currentParkingSectionTitle: string; reportsSectionTitle: string; visibleManagementItems: Array<HomeMenuItem & { key: ManagementSection }>; visibleParkingMenuGroups: HomeMenuGroup[]; activeParkingMenu: string | null; managementSection?: ManagementSection; canManageDashboard: boolean; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobileOpen: boolean; onMobileClose: () => void; onNavigate: (path: string) => void };
const groupIcons = { definitions: <SettingsRoundedIcon />, operations: <TrafficRoundedIcon />, integrations: <SyncRoundedIcon />, reports: <AssessmentRoundedIcon />, 'member-reports': <PeopleAltRoundedIcon />, 'traffic-reports': <TrafficRoundedIcon />, 'financial-reports': <ReceiptLongRoundedIcon />, 'other-reports': <AssessmentRoundedIcon />, 'management-reports': <AssessmentRoundedIcon /> };

export function Home3Navigation({ appName, direction, basePath, systemMenu, currentParkingSectionTitle, reportsSectionTitle, visibleManagementItems, visibleParkingMenuGroups, activeParkingMenu, managementSection, canManageDashboard, collapsed, onCollapsedChange, mobileOpen, onMobileClose, onNavigate }: Props) {
  const { t } = useTranslation();
  const translate = t as unknown as (key: string) => string;
  const [expandedRoot, setExpandedRoot] = useState<'system' | 'parking' | 'reports' | null>(canManageDashboard ? 'system' : 'parking');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const definitionsGroup = useMemo(() => visibleParkingMenuGroups.find((group) => group.key === 'definitions'), [visibleParkingMenuGroups]);
  const operationalGroups = useMemo(() => visibleParkingMenuGroups.filter((group) => group.key === 'operations' || group.key === 'integrations'), [visibleParkingMenuGroups]);
  const reportsGroup = useMemo(() => visibleParkingMenuGroups.find((group) => group.key === 'reports'), [visibleParkingMenuGroups]);
  const reportGroups = useMemo(() => reportsGroup?.subgroups ?? [], [reportsGroup]);
  const activeReport = Boolean(activeParkingMenu && (reportsGroup?.items.some((item) => item.key === activeParkingMenu) || reportGroups.some((group) => group.items.some((item) => item.key === activeParkingMenu))));
  const menuLabel = (key: string) => translate(`home3Menu.items.${key}`);
  const groupLabel = (key: string) => translate(`home3Menu.groups.${key}`);

  useEffect(() => {
    if (managementSection) { setExpandedRoot('system'); setExpandedGroups({}); return; }
    if (!activeParkingMenu) return;
    setExpandedRoot(activeReport ? 'reports' : 'parking');
    const activeGroup = [...operationalGroups, ...reportGroups].find((group) => group.items.some((item) => item.key === activeParkingMenu));
    setExpandedGroups(activeGroup ? { [activeGroup.key]: true } : {});
  }, [activeParkingMenu, activeReport, managementSection, operationalGroups, reportGroups]);

  const navigate = (path: string) => { onNavigate(path); onMobileClose(); };
  const iconFor = (key: string) => groupIcons[key as keyof typeof groupIcons] ?? <SettingsRoundedIcon />;
  const renderLeaf = (item: HomeMenuItem, path: string, nested = false) => <Button key={item.key} className={`home3-nav-leaf ${nested ? 'is-nested' : ''} ${activeParkingMenu === item.key || managementSection === item.key ? 'is-active' : ''}`} startIcon={item.icon} onClick={() => navigate(path)}>{menuLabel(item.key)}</Button>;
  const renderGroup = (group: HomeMenuGroup) => { const isExpanded = Boolean(expandedGroups[group.key]); return <Box key={group.key} className="home3-nav-group"><Button className={`home3-nav-branch ${isExpanded ? 'is-open' : ''}`} startIcon={iconFor(group.key)} endIcon={<ExpandMoreRoundedIcon className={isExpanded ? 'is-rotated' : ''} />} onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !current[group.key] }))} aria-expanded={isExpanded}>{groupLabel(group.key)}</Button>{isExpanded && <Box className="home3-nav-nested">{group.items.map((item) => renderLeaf(item, `${basePath}/parking/${item.key}`, true))}</Box>}</Box>; };
  const renderFull = () => <>
    <Button className={`home3-nav-home ${!activeParkingMenu && !managementSection ? 'is-active' : ''}`} startIcon={<HomeRoundedIcon />} onClick={() => navigate(basePath)}>{t('home2.menuHome')}</Button>
    {visibleManagementItems.length > 0 && <Box className="home3-nav-section">
      <Button className={`home3-nav-branch home3-nav-root ${expandedRoot === 'system' ? 'is-open' : ''}`} startIcon={<LocalParkingRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedRoot === 'system' ? 'is-rotated' : ''} />} onClick={() => setExpandedRoot((current) => current === 'system' ? null : 'system')} aria-expanded={expandedRoot === 'system'}>{systemMenu}</Button>
      {expandedRoot === 'system' && <Box className="home3-nav-nested">{visibleManagementItems.map((item) => renderLeaf(item, `${basePath}/management/${item.key}`))}</Box>}
    </Box>}
    <Box className="home3-nav-section">
      <Button className={`home3-nav-branch home3-nav-root ${expandedRoot === 'parking' ? 'is-open' : ''}`} startIcon={<SettingsRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedRoot === 'parking' ? 'is-rotated' : ''} />} onClick={() => setExpandedRoot((current) => current === 'parking' ? null : 'parking')} aria-expanded={expandedRoot === 'parking'}>{currentParkingSectionTitle}</Button>
      {expandedRoot === 'parking' && <Box className="home3-nav-nested">{definitionsGroup?.items.map((item) => renderLeaf(item, `${basePath}/parking/${item.key}`))}{operationalGroups.map(renderGroup)}</Box>}
    </Box>
    {reportsGroup && <Box className="home3-nav-section">
      <Button className={`home3-nav-branch home3-nav-root ${expandedRoot === 'reports' ? 'is-open' : ''}`} startIcon={<AssessmentRoundedIcon />} endIcon={<ExpandMoreRoundedIcon className={expandedRoot === 'reports' ? 'is-rotated' : ''} />} onClick={() => setExpandedRoot((current) => current === 'reports' ? null : 'reports')} aria-expanded={expandedRoot === 'reports'}>{reportsSectionTitle}</Button>
      {expandedRoot === 'reports' && <Box className="home3-nav-nested">{reportsGroup.items.map((item) => renderLeaf(item, `${basePath}/parking/${item.key}`))}{reportGroups.map(renderGroup)}</Box>}
    </Box>}
  </>;
  const renderCompact = () => <Box className="home3-nav-compact"><Tooltip title={t('home2.menuHome')} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={!activeParkingMenu && !managementSection ? 'is-active' : ''} onClick={() => navigate(basePath)} aria-label={t('home2.menuHome')}><HomeRoundedIcon /></IconButton></Tooltip>{visibleManagementItems.length > 0 && <Tooltip title={systemMenu} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={managementSection ? 'is-active' : ''} onClick={() => { onCollapsedChange(false); setExpandedRoot('system'); }} aria-label={systemMenu}><LocalParkingRoundedIcon /></IconButton></Tooltip>}{definitionsGroup && <Tooltip title={groupLabel('definitions')} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={activeParkingMenu && !activeReport ? 'is-active' : ''} onClick={() => { onCollapsedChange(false); setExpandedRoot('parking'); }} aria-label={groupLabel('definitions')}><SettingsRoundedIcon /></IconButton></Tooltip>}{operationalGroups.map((group) => <Tooltip key={group.key} title={groupLabel(group.key)} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton onClick={() => { onCollapsedChange(false); setExpandedRoot('parking'); }} aria-label={groupLabel(group.key)}>{iconFor(group.key)}</IconButton></Tooltip>)}{reportsGroup && <Tooltip title={reportsSectionTitle} placement={direction === 'rtl' ? 'left' : 'right'}><IconButton className={activeReport ? 'is-active' : ''} onClick={() => { onCollapsedChange(false); setExpandedRoot('reports'); }} aria-label={reportsSectionTitle}><AssessmentRoundedIcon /></IconButton></Tooltip>}</Box>;
  const content = (isDrawer: boolean) => <Box className={`home3-navigation-content ${isDrawer ? 'is-drawer' : ''}`} dir={direction}><Box className="home3-nav-heading"><Typography>{t('home2.navigation')}</Typography>{!isDrawer && <IconButton onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? t('home2.expand') : t('home2.collapse')} size="small">{collapsed ? direction === 'rtl' ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon /> : direction === 'rtl' ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}</IconButton>}</Box>{isDrawer || !collapsed ? renderFull() : renderCompact()}</Box>;
  return <><Box component="aside" className={`home3-navigation ${collapsed ? 'is-collapsed' : ''}`} aria-label={appName}>{content(false)}</Box><Drawer className="home3-drawer" anchor={direction === 'rtl' ? 'right' : 'left'} open={mobileOpen} onClose={onMobileClose}><Box className="home3-drawer-surface">{content(true)}</Box></Drawer></>;
}
