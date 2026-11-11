import { useId, type ReactNode, type Ref } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Portal, Tooltip, useTheme, type ButtonProps, type DialogProps } from '@mui/material';
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
  tooltip?: string;
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
  modal?: boolean;
  compact?: boolean;
  width?: number;
  className?: string;
  ariaLabel?: string;
  paperRef?: Ref<HTMLDivElement>;
  onInteract?: () => void;
  footerDirection?: 'ltr' | 'rtl';
};

/** The only application dialog shell. Feature components own content and workflow, not presentation. */
export function AppPopup({ open, title, children, onClose, onConfirm, cancelLabel, confirmLabel, confirmColor = 'primary', confirmDisabled, actions, busy = false, dir, maxWidth = 'md', fullScreen = false,
  modal = true, compact = false, width, className, ariaLabel, paperRef, onInteract, footerDirection }: AppPopupProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const titleId = useId();
  const buttons: readonly PopupAction[] = actions ?? [
    { id: 'cancel', label: cancelLabel ?? t('popup.cancel'), onClick: onClose },
    ...(onConfirm ? [{ id: 'confirm', label: confirmLabel ?? t('popup.confirm'), onClick: onConfirm, color: confirmColor, variant: 'contained' as const, disabled: confirmDisabled }] : []),
  ];

  const content = <>
    <DialogTitle id={titleId}><span className="app-popup-mark" aria-hidden="true" /><span className="app-popup-title-text">{title}</span></DialogTitle>
    <DialogContent>{children}</DialogContent>
    {buttons.length > 0 && <DialogActions dir={footerDirection}>{buttons.map(action => {
      const button = <Button key={action.id} type="button" dir={dir ?? theme.direction}
      variant={action.variant ?? 'text'} color={action.color ?? 'primary'} disabled={busy || action.disabled}
      data-testid={action.testId} onClick={() => { if (!busy && !action.disabled) action.onClick(); }}>{action.label}</Button>;
      return action.tooltip ? <Tooltip key={action.id} title={action.tooltip} describeChild><span>{button}</span></Tooltip> : button;
    })}</DialogActions>}
  </>;
  const styles = [appPopupStyles(theme), {
    ...(width ? { '& .app-popup-paper': { width, maxWidth: 'calc(100vw - 32px)' } } : {}),
    ...(compact ? {
      '& .app-popup-paper > .MuiDialogTitle-root': { minHeight: 40, px: 1.5, py: .75, fontSize: '.85rem', gap: 1 },
      '& .app-popup-mark': { display: 'none' },
      '& .app-popup-title-text': { flex: 1 },
      '& .app-popup-paper > .MuiDialogContent-root': { px: 1.5, py: 1.5 },
      '& .app-popup-paper > .MuiDialogActions-root': { px: 1, py: 1, gap: .5, flexWrap: 'nowrap', justifyContent: 'flex-start',
        '& .MuiButton-root': { minHeight: 30, minWidth: 0, px: 1, fontSize: '.7rem', fontWeight: 600 },
      },
    } : {}),
  }];
  const paperProps = { ref: paperRef, className: 'app-popup-paper', 'aria-busy': busy, 'aria-label': ariaLabel,
    'aria-labelledby': ariaLabel ? undefined : titleId,
    onMouseEnter: onInteract,
    onPointerDownCapture: onInteract,
    onKeyDownCapture: (event: React.KeyboardEvent) => { if (event.key !== 'Escape') onInteract?.(); },
  };
  if (!modal) return open ? <Portal><Box className={className} dir={dir ?? theme.direction} sx={[...styles, {
    position: 'fixed', zIndex: theme.zIndex.modal, insetInline: 0, top: '50%', transform: 'translateY(-50%)',
    width: width ?? 440, maxWidth: 'calc(100vw - 32px)', mx: 'auto',
  }]}>
    <Paper {...paperProps} role="dialog" aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : titleId} tabIndex={-1}
      onKeyDown={event => { if (event.key === 'Escape' && !busy) { event.stopPropagation(); onClose(); } }}
      sx={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100dvh - 32px)', borderRadius: 'var(--app-popup-radius, 5px)' }}>
      {content}
    </Paper>
  </Box></Portal> : null;
  return <Dialog open={open} onClose={busy ? undefined : onClose} className={className}
    dir={dir ?? theme.direction} fullWidth maxWidth={maxWidth} fullScreen={fullScreen} aria-labelledby={titleId}
    slotProps={{ paper: paperProps }} sx={styles}>{content}</Dialog>;
}
