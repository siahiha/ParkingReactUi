import type { ReactNode } from 'react';
import { Card, CardActions, CardContent } from '@mui/material';

type AppRecordCardProps = {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
};

/** Shared record-card shell; feature cards provide only their content and actions. */
export function AppRecordCard({ children, actions, className = '', contentClassName = '', actionsClassName = '' }: AppRecordCardProps) {
  return (
    <Card className={`app-record-card ${className}`.trim()} elevation={0}>
      <CardContent className={contentClassName}>{children}</CardContent>
      {actions && <CardActions className={actionsClassName}>{actions}</CardActions>}
    </Card>
  );
}
