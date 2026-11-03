import { useId, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, type ButtonProps, type DialogProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type PopupAction = {
  id: string;
  label: ReactNode;
  onClick: () => void;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  testId?: string;
};

export type AppPopupProps = {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: ButtonProps['color'];
  confirmDisabled?: boolean;
  /** Overrides the default cancel/confirm buttons, in display order. */
  actions?: readonly PopupAction[];
  busy?: boolean;
  dir?: 'rtl' | 'ltr';
  maxWidth?: DialogProps['maxWidth'];
  fullScreen?: boolean;
};

/** The only application dialog shell. Feature components own content and workflow, not presentation. */
export function AppPopup({ open, title, children, onClose, onConfirm, cancelLabel, confirmLabel, confirmColor = 'primary', confirmDisabled, actions, busy = false, dir, maxWidth = 'md', fullScreen = false }: AppPopupProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const titleId = useId();
  const buttons: readonly PopupAction[] = actions ?? [
    { id: 'cancel', label: cancelLabel ?? t('popup.cancel'), onClick: onClose },
    ...(onConfirm ? [{ id: 'confirm', label: confirmLabel ?? t('popup.confirm'), onClick: onConfirm, color: confirmColor, variant: 'contained' as const, disabled: confirmDisabled }] : []),
  ];

  return <Dialog open={open} onClose={busy ? undefined : onClose}
    dir={dir ?? theme.direction} fullWidth maxWidth={maxWidth} fullScreen={fullScreen} aria-labelledby={titleId}
    slotProps={{ paper: { className: 'app-popup-paper', 'aria-busy': busy } }}
    sx={{
      '& .app-popup-paper': { border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', overflow: 'hidden' },
      '& .MuiDialogTitle-root': { px: 2, py: 1.5, fontSize: '.92rem', fontWeight: 800, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' },
      '& .MuiDialogContent-root': { px: 2, py: 2, bgcolor: 'background.paper', overflowWrap: 'anywhere' },
      '& .MuiDialogActions-root': { px: 2, py: 1, gap: .75, flexWrap: 'wrap', bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider' },
      '& .MuiDialogActions-root > .MuiButton-root': { m: 0, minHeight: 32 },
      '& .MuiDialogActions-root > .MuiButton-containedPrimary': { color: theme.palette.getContrastText(theme.palette.primary.main) },
    }}>
    <DialogTitle id={titleId}>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    {buttons.length > 0 && <DialogActions>{buttons.map(action => <Button key={action.id} type="button"
      variant={action.variant ?? 'text'} color={action.color ?? 'primary'} disabled={busy || action.disabled}
      data-testid={action.testId} onClick={() => { if (!busy && !action.disabled) action.onClick(); }}>{action.label}</Button>)}</DialogActions>}
  </Dialog>;
}
