import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Tooltip } from '@mui/material';

type Props = { value: boolean; trueLabel: string; falseLabel: string };

/** The mandatory, accessible visual for Boolean values inside data grids. */
export function BooleanStatusIcon({ value, trueLabel, falseLabel }: Props) {
  const label = value ? trueLabel : falseLabel;
  return <Tooltip title={label} arrow><span className={`status-grid-icon ${value ? 'status-grid-icon-active' : 'status-grid-icon-inactive'}`} aria-label={label}>{value ? <CheckCircleOutlineRoundedIcon fontSize="small" /> : <CloseRoundedIcon fontSize="small" />}</span></Tooltip>;
}
