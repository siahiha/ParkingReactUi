import type { Dispatch, SetStateAction } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { AppGroupBox } from '../AppGroupBox';
import type { AccessPermissionNode } from './accessPermissionTypes';

export type AccessLevelFormState = { Id: number; Name: string; Description: string; AccessPermissionPart1: string; AccessPermissionPart2: string; IsSystemType: boolean };
export type AccessLevelFormLabels = { saved: string; name: string; description: string; permissions: string; selectDescendants: string };
type Props = { form: AccessLevelFormState; setForm: Dispatch<SetStateAction<AccessLevelFormState>>; labels: AccessLevelFormLabels; message: string; nodes: AccessPermissionNode[]; cascade: boolean; onCascadeChange: (value: boolean) => void; onToggle: (key: string, checked: boolean) => void };

function PermissionTree({ nodes, onToggle, prefix = '' }: { nodes: AccessPermissionNode[]; onToggle: (key: string, checked: boolean) => void; prefix?: string }) {
  return <Box className="access-permission-tree">{nodes.filter((node) => node.isVisible).map((node, index) => {
    const key = `${prefix}${node.Title}-${index}`;
    return <Box key={key} className="access-permission-node"><FormControlLabel control={<Checkbox size="small" checked={node.checked} onChange={(event) => onToggle(key, event.target.checked)} />} label={node.Title} />{node.Childs.length > 0 && <PermissionTree nodes={node.Childs} onToggle={onToggle} prefix={`${key}/`} />}</Box>;
  })}</Box>;
}

export function AccessLevelFormFields({ form, setForm, labels, message, nodes, cascade, onCascadeChange, onToggle }: Props) {
  return <Box className="form-section-column">
    {message && <Alert severity={message === labels.saved ? 'success' : 'error'}>{message}</Alert>}
    <AppGroupBox title={labels.name}><Box className="parking-form-fields"><TextField label={labels.name} value={form.Name} onChange={(event) => setForm({ ...form, Name: event.target.value })} required autoFocus /><TextField label={labels.description} value={form.Description} onChange={(event) => setForm({ ...form, Description: event.target.value })} multiline minRows={2} /></Box></AppGroupBox>
    <AppGroupBox title={labels.permissions}><FormControlLabel className="access-cascade-toggle" control={<Checkbox size="small" checked={cascade} onChange={(event) => onCascadeChange(event.target.checked)} />} label={labels.selectDescendants} /><PermissionTree nodes={nodes} onToggle={onToggle} /></AppGroupBox>
  </Box>;
}
