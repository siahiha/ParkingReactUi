import { Box, IconButton, Tooltip } from '@mui/material';
import SyncProblemRoundedIcon from '@mui/icons-material/SyncProblemRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

type Props = {
  message: string;
  color?: 'warning' | 'error' | 'success' | 'info';
  onClick?: () => void;
};

/** Keep live-update feedback in the owning section's heading without taking focus. */
export function ConnectionStatusIndicator({ message, color = 'warning', onClick }: Props) {
  if (!message) return null;
  const icon = color === 'success' ? <WifiRoundedIcon sx={{ fontSize: 18 }} />
    : color === 'info' ? <SyncRoundedIcon sx={{ fontSize: 18 }} />
      : <SyncProblemRoundedIcon sx={{ fontSize: 18 }} />;
  return <Tooltip title={message} arrow>
    {onClick ? <IconButton size="small" color={color} aria-label={message} onClick={onClick}
      data-connection-status="true" sx={{ flexShrink: 0, p: 0.25 }}>{icon}</IconButton>
      : <Box component="span" role="img" tabIndex={0} aria-label={message} data-connection-status="true"
        sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, p: 0.25, color: `${color}.main`, cursor: 'help',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2, borderRadius: 1 } }}>{icon}</Box>}
  </Tooltip>;
}
