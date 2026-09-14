import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props = { loading: boolean; error: string; empty: boolean; emptyLabel: string; loadingLabel: string; children: ReactNode };

export function ResourceState({ loading, error, empty, emptyLabel, loadingLabel, children }: Props) {
  if (loading) return <Box className="inline-status-row"><CircularProgress size={20} /><Typography variant="body2">{loadingLabel}</Typography></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (empty) return <Alert severity="info">{emptyLabel}</Alert>;
  return <>{children}</>;
}
