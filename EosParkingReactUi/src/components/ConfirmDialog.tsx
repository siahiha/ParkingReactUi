import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export function ConfirmDialog({ open, title, message, cancelLabel, confirmLabel, busy = false, onClose, onConfirm }: { open: boolean; title: string; message: string; cancelLabel: string; confirmLabel: string; busy?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent><Typography variant="body2">{message}</Typography></DialogContent>
    <DialogActions><Button onClick={onClose} disabled={busy}>{cancelLabel}</Button><Button color="error" variant="contained" onClick={onConfirm} disabled={busy}>{confirmLabel}</Button></DialogActions>
  </Dialog>;
}
