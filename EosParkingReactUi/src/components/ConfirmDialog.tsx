import { Typography } from '@mui/material';
import { AppPopup } from './AppPopup';

export function ConfirmDialog({ open, title, message, cancelLabel, confirmLabel, busy = false, onClose, onConfirm }: { open: boolean; title: string; message: string; cancelLabel: string; confirmLabel: string; busy?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <AppPopup open={open} onClose={onClose} maxWidth="xs" title={title} onConfirm={onConfirm}
    cancelLabel={cancelLabel} confirmLabel={confirmLabel} confirmColor="error" busy={busy}>
    <Typography variant="body2">{message}</Typography>
  </AppPopup>;
}
