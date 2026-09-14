import { Box, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { ReactNode } from 'react';
import type { Language } from './managementTypes';
import { WorkspaceToolbar } from '../WorkspaceToolbar';

type Props = {
  title: string;
  pageTitle?: string;
  subtitle: string;
  language: Language;
  loading?: boolean;
  onRefresh?: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function ManagementWorkspaceFrame({ title, pageTitle, subtitle, language, loading = false, onRefresh, toolbar, children }: Props) {
  const refreshLabel = language === 'fa' ? 'به‌روزرسانی' : 'Refresh';
  return (
    <Paper className="home-workspace parking-management-workspace" elevation={0}>
      <Box className={`workspace-heading ${pageTitle ? 'workspace-heading-unified' : ''}`}>
        {pageTitle && <Box className="workspace-page-context"><Typography component="h1" variant="h1">{pageTitle}</Typography><Typography component="span" className="workspace-heading-separator">-</Typography><Typography variant="h6">{title}</Typography><Typography variant="body2" color="text.secondary">{subtitle}</Typography></Box>}
        {!pageTitle && <Box className="workspace-resource-heading"><Typography variant="h6">{title}</Typography><Typography variant="body2" color="text.secondary">{subtitle}</Typography></Box>}
        {onRefresh && pageTitle && <Tooltip title={refreshLabel} arrow><IconButton className="workspace-refresh-button" aria-label={refreshLabel} onClick={onRefresh} disabled={loading}><RefreshRoundedIcon /></IconButton></Tooltip>}
      </Box>
      {toolbar && <WorkspaceToolbar ariaLabel={language === 'fa' ? 'ابزارهای صفحه' : 'Page actions'}>{toolbar}</WorkspaceToolbar>}
      <Divider sx={{ my: 2 }} />
      {children}
    </Paper>
  );
}
