import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import type { ReactNode } from 'react';

type CrudDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  cancelLabel: string;
  confirmLabel: string;
  busy?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

/** Shared modal shell for create/edit forms across management modules. */
export function CrudDialog({ open, title, children, onClose, onConfirm, cancelLabel, confirmLabel, busy = false, maxWidth = 'md' }: CrudDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth={maxWidth} slotProps={{ paper: { className: 'crud-dialog-paper' } }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>{cancelLabel}</Button>
        <Button variant="contained" onClick={onConfirm} disabled={busy} aria-busy={busy}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
