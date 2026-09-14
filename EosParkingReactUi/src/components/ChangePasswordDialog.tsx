import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Box } from '@mui/material';
import type { PasswordDialogProps } from './homeProfileTypes';

export function ChangePasswordDialog({ open, labels, values, setValues, message, messageSeverity, saving, onSave, onClose }: PasswordDialogProps) {
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{labels.changePassword}</DialogTitle>
      <DialogContent>
        <Box className="form-field-column" sx={{ mt: 1 }}>
          {message && <Alert severity={messageSeverity}>{message}</Alert>}
          <TextField label={labels.currentPassword} type="password" autoComplete="current-password" value={values.current} onChange={(event) => setValues({ ...values, current: event.target.value })} />
          <TextField label={labels.newPassword} type="password" autoComplete="new-password" value={values.next} onChange={(event) => setValues({ ...values, next: event.target.value })} />
          <TextField label={labels.confirmPassword} type="password" autoComplete="new-password" error={Boolean(values.confirm) && values.confirm !== values.next} helperText={Boolean(values.confirm) && values.confirm !== values.next ? labels.passwordMismatch : undefined} value={values.confirm} onChange={(event) => setValues({ ...values, confirm: event.target.value })} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button data-testid="close-password-dialog" onClick={onClose} disabled={saving}>{labels.close}</Button>
        <Button data-testid="save-password" variant="contained" onClick={onSave} disabled={saving}>{saving ? labels.saving : labels.save}</Button>
      </DialogActions>
    </Dialog>
  );
}
