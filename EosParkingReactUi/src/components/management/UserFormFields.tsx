import type { Dispatch, SetStateAction } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, MenuItem, TextField } from '@mui/material';
import { AppGroupBox } from '../AppGroupBox';

export type UserFormState = { Id: number; UserName: string; UserPass: string; StoredUserPass: string; FirstName: string; LastName: string; FatherName: string; NationalCode: string; Address: string; Description: string; TellNumber: string; PhonNumber: string; UserAccessLevelId: string; UserType: string; IsActive: boolean; IsSystemType: boolean };
export type UserFormLabels = { saved: string; name: string; password: string; accessLevel: string; userType: string; firstName: string; lastName: string; fatherName: string; nationalCode: string; telephone: string; mobile: string; address: string; description: string; disable: string; accessTitle: string; personalTitle: string };
type Row = Record<string, string | number | boolean | null | undefined>;
type Props = { form: UserFormState; setForm: Dispatch<SetStateAction<UserFormState>>; labels: UserFormLabels; message: string; language: 'fa' | 'en'; editingId: number | null; accessLevels: Row[]; userTypes: Array<{ value: string; fa: string; en: string }> };

export function UserFormFields({ form, setForm, labels, message, language, editingId, accessLevels, userTypes }: Props) {
  const valueOf = (row: Row, key: string) => row[key] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];
  return <Box className="form-section-column">
    {message && <Alert severity={message === labels.saved ? 'success' : 'error'}>{message}</Alert>}
    <AppGroupBox title={labels.accessTitle}>
      <Box className="parking-form-fields">
        <TextField label={labels.name} value={form.UserName} onChange={(event) => setForm({ ...form, UserName: event.target.value })} required autoFocus />
        <TextField label={labels.password} type="password" value={form.UserPass} onChange={(event) => setForm({ ...form, UserPass: event.target.value })} required={!editingId} placeholder={editingId ? (language === 'fa' ? 'برای تغییر وارد کنید' : 'Enter only to change') : undefined} />
        <TextField select label={labels.accessLevel} value={form.UserAccessLevelId} onChange={(event) => setForm({ ...form, UserAccessLevelId: event.target.value })} disabled={form.IsSystemType} required>{accessLevels.map((level, index) => <MenuItem key={String(valueOf(level, 'Id') ?? index)} value={String(valueOf(level, 'Id') ?? '')}>{String(valueOf(level, 'Name') ?? valueOf(level, 'Title') ?? '—')}</MenuItem>)}</TextField>
        <TextField select label={labels.userType} value={form.UserType} onChange={(event) => setForm({ ...form, UserType: event.target.value })} disabled={form.IsSystemType} required>{userTypes.map((option) => <MenuItem key={option.value} value={option.value}>{language === 'fa' ? option.fa : option.en}</MenuItem>)}</TextField>
        <FormControlLabel control={<Checkbox checked={!form.IsActive} disabled={form.IsSystemType} onChange={(event) => setForm({ ...form, IsActive: !event.target.checked })} />} label={labels.disable} />
      </Box>
    </AppGroupBox>
    <AppGroupBox title={labels.personalTitle}>
      <Box className="parking-form-fields">
        <TextField label={labels.firstName} value={form.FirstName} onChange={(event) => setForm({ ...form, FirstName: event.target.value })} />
        <TextField label={labels.lastName} value={form.LastName} onChange={(event) => setForm({ ...form, LastName: event.target.value })} />
        <TextField label={labels.fatherName} value={form.FatherName} onChange={(event) => setForm({ ...form, FatherName: event.target.value })} />
        <TextField label={labels.nationalCode} value={form.NationalCode} onChange={(event) => setForm({ ...form, NationalCode: event.target.value.replace(/\D/g, '').slice(0, 10) })} />
        <TextField label={labels.telephone} value={form.TellNumber} onChange={(event) => setForm({ ...form, TellNumber: event.target.value })} />
        <TextField label={labels.mobile} value={form.PhonNumber} onChange={(event) => setForm({ ...form, PhonNumber: event.target.value })} />
        <TextField label={labels.address} value={form.Address} onChange={(event) => setForm({ ...form, Address: event.target.value })} multiline minRows={2} />
        <TextField label={labels.description} value={form.Description} onChange={(event) => setForm({ ...form, Description: event.target.value })} multiline minRows={2} />
      </Box>
    </AppGroupBox>
  </Box>;
}
