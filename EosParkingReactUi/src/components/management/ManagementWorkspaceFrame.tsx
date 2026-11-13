import { useTranslation } from 'react-i18next';
import { Box, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { ReactNode } from 'react';
import type { Language } from './managementTypes';
import { WorkspaceToolbar } from '../WorkspaceToolbar';

type Props = {
  className?: string;
  title: string;
  pageTitle?: string;
  language: Language;
  loading?: boolean;
  onRefresh?: () => void;
  headingActions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function ManagementWorkspaceFrame({ className = '', title, language, loading = false, onRefresh, headingActions, toolbar, children }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const refreshLabel = t('workspaceFrame.refresh');
  return (
    <Paper className={`home-workspace parking-management-workspace ${className}`} elevation={0}>
      <Box className="workspace-heading">
        <Box className="workspace-resource-heading"><Typography variant="h6">{title}</Typography></Box>
        {(headingActions || onRefresh) && <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>{headingActions}{onRefresh && <Tooltip title={refreshLabel} arrow><IconButton className="workspace-refresh-button" aria-label={refreshLabel} onClick={onRefresh} disabled={loading}><RefreshRoundedIcon /></IconButton></Tooltip>}</Stack>}
      </Box>
      {toolbar && <WorkspaceToolbar ariaLabel={t('workspaceFrame.actions')}>{toolbar}</WorkspaceToolbar>}
      <Divider sx={{ my: 2 }} />
      {children}
    </Paper>
  );
}
