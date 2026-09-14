import type { ReactNode } from 'react';
import { Box } from '@mui/material';

type WorkspaceToolbarProps = {
  children: ReactNode;
  ariaLabel: string;
};

/** Shared action bar for every workspace that renders cards, lists or tables. */
export function WorkspaceToolbar({ children, ariaLabel }: WorkspaceToolbarProps) {
  return <Box component="div" role="toolbar" aria-label={ariaLabel} className="workspace-toolbar">{children}</Box>;
}
