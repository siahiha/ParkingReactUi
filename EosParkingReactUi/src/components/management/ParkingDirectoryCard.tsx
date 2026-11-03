import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import LocalParkingRoundedIcon from '@mui/icons-material/LocalParkingRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { AppRecordCard } from '../AppRecordCard';
import { formatNumber } from '../../utils/formatters';
import i18n from '../../i18n/instance';
import { parkingCopy } from './parkingCopy';
import type { Language, RecordValue } from './managementTypes';
import './parkingDirectoryCards.css';

type Props = { row: RecordValue; id: number; language: Language; onEdit: () => void; onRemove: () => void };

export function ParkingDirectoryCard({ row, id, language, onEdit, onRemove }: Props) {
  const copy = parkingCopy(language);
  const t = i18n.getFixedT(language);
  const name = String(row.ParkingName ?? row.parkingName ?? t('readonlyModule.noName'));
  const address = String(row.Address ?? row.address ?? '—');
  const phone = String(row.PhonNumber ?? row.phonNumber ?? '—');
  const statuses = [
    { enabled: row.IsCommercialParking === true, on: copy.commercialEnabled, off: copy.commercialDisabled },
    { enabled: row.HasUserShifts === true, on: copy.shiftsEnabled, off: copy.shiftsDisabled },
  ];

  return <AppRecordCard className="parking-directory-card parking-directory-card--atelier"
    contentClassName="parking-identity-content" actionsClassName="parking-identity-footer"
    actions={<>
      <Box className="parking-identity-phone"><LocalPhoneOutlinedIcon aria-hidden="true" /><Box>
        <Typography component="span" className="parking-identity-caption">{copy.phone}</Typography>
        <Typography component="bdi" className="parking-identity-phone-value" dir="ltr">{phone}</Typography>
      </Box></Box>
      <Box className="parking-identity-actions">
        <Tooltip title={copy.edit}><IconButton aria-label={copy.edit} onClick={onEdit}><EditOutlinedIcon /></IconButton></Tooltip>
        <Tooltip title={copy.remove}><IconButton color="error" sx={theme => ({ '--parking-card-error': theme.palette.error.main })} aria-label={copy.remove} onClick={onRemove}><DeleteOutlineRoundedIcon /></IconButton></Tooltip>
      </Box>
    </>}>
    <Box className="parking-identity-art">
      <Box className="parking-identity-blueprint" aria-hidden="true"><i /><i /><i /><i /><i /><i /></Box>
      <Box className="parking-identity-emblem" aria-hidden="true"><LocalParkingRoundedIcon /></Box>
      <Box className="parking-identity-code"><span>{t('readonlyModule.id')}</span><bdi>{formatNumber(id, language)}</bdi></Box>
    </Box>
    <Box className="parking-identity-body">
      <Tooltip title={name}><Typography component="h3" className="parking-identity-name">{name}</Typography></Tooltip>
      <Box className="parking-identity-address"><LocationOnOutlinedIcon aria-hidden="true" /><Tooltip title={address}><Typography component="p">{address}</Typography></Tooltip></Box>
      <Box className="parking-identity-statuses">{statuses.map((status, index) => <Box component="span" key={index}
        className={`parking-identity-status ${status.enabled ? 'is-on' : 'is-off'}`}>
        {status.enabled ? <CheckRoundedIcon aria-hidden="true" /> : <RemoveRoundedIcon aria-hidden="true" />}
        {status.enabled ? status.on : status.off}
      </Box>)}</Box>
    </Box>
  </AppRecordCard>;
}
