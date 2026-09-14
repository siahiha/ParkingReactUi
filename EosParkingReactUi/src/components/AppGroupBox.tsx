import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type AppGroupBoxProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

/** Shared fieldset/legend shell for all logical form groups. */
export function AppGroupBox({ title, children, className = '' }: AppGroupBoxProps) {
  return (
    <Box component="fieldset" className={`app-group-box ${className}`.trim()}>
      <Typography component="legend" className="app-group-box-title" variant="subtitle2">{title}</Typography>
      {children}
    </Box>
  );
}
