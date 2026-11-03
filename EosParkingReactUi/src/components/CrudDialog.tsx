import { AppPopup } from './AppPopup';
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
  direction: 'rtl' | 'ltr';
};

/** Shared modal shell for create/edit forms across management modules. */
export function CrudDialog({ open, title, children, onClose, onConfirm, cancelLabel, confirmLabel, busy = false, maxWidth = 'md', direction }: CrudDialogProps) {
  return (
    <AppPopup dir={direction} open={open} onClose={onClose} maxWidth={maxWidth} title={title}
      onConfirm={onConfirm} cancelLabel={cancelLabel} confirmLabel={confirmLabel} busy={busy}>{children}</AppPopup>
  );
}
