import { useId, type ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme, type ButtonProps, type DialogProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { appPopupStyles } from './appPopupStyles';

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
    sx={appPopupStyles(theme)}>
    <DialogTitle id={titleId}><span className="app-popup-mark" aria-hidden="true" /><span className="app-popup-title-text">{title}</span></DialogTitle>
    <DialogContent>{children}</DialogContent>
    {buttons.length > 0 && <DialogActions>{buttons.map(action => <Button key={action.id} type="button"
      variant={action.variant ?? 'text'} color={action.color ?? 'primary'} disabled={busy || action.disabled}
      data-testid={action.testId} onClick={() => { if (!busy && !action.disabled) action.onClick(); }}>{action.label}</Button>)}</DialogActions>}
  </Dialog>;
}
