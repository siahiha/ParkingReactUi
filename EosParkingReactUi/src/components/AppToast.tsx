import { Alert, Snackbar, type AlertColor } from '@mui/material';

type Props = { message: string; severity?: AlertColor; onClose: () => void };

/** Snackbar pauses its timer on hover, keyboard focus and window blur. */
export function AppToast({ message, severity = 'success', onClose }: Props) {
  return <Snackbar key={`${severity}:${message}`} open={Boolean(message)} autoHideDuration={3000} resumeHideDuration={3000}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: theme => theme.zIndex.modal + 100 }}
    onClose={(_event, reason) => { if (reason !== 'clickaway') onClose(); }}>
    <Alert severity={severity} variant="filled" onClose={onClose} sx={{ maxWidth: 'min(560px, calc(100vw - 32px))', boxShadow: 3 }}>
      {message}
    </Alert>
  </Snackbar>;
}
