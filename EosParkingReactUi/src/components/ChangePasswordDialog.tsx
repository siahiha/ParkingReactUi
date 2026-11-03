import { AppPopup } from './AppPopup';
import { Alert, TextField } from '@mui/material';
import { Box } from '@mui/material';
import type { PasswordDialogProps } from './homeProfileTypes';

export function ChangePasswordDialog({ open, labels, values, setValues, message, messageSeverity, saving, onSave, onClose }: PasswordDialogProps) {
  return (
    <AppPopup open={open} onClose={onClose} maxWidth="xs" busy={saving} title={labels.changePassword}
      actions={[
        { id: 'cancel', label: labels.close, testId: 'close-password-dialog', onClick: onClose },
        { id: 'save', label: saving ? labels.saving : labels.save, testId: 'save-password', variant: 'contained', onClick: onSave },
      ]}>
        <Box className="form-field-column" sx={{ mt: 1 }}>
          {message && <Alert severity={messageSeverity}>{message}</Alert>}
          <TextField label={labels.currentPassword} type="password" autoComplete="current-password" value={values.current} onChange={(event) => setValues({ ...values, current: event.target.value })} />
          <TextField label={labels.newPassword} type="password" autoComplete="new-password" value={values.next} onChange={(event) => setValues({ ...values, next: event.target.value })} />
          <TextField label={labels.confirmPassword} type="password" autoComplete="new-password" error={Boolean(values.confirm) && values.confirm !== values.next} helperText={Boolean(values.confirm) && values.confirm !== values.next ? labels.passwordMismatch : undefined} value={values.confirm} onChange={(event) => setValues({ ...values, confirm: event.target.value })} />
        </Box>
      </AppPopup>
  );
}
