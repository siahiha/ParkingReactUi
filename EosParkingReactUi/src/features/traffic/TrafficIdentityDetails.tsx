import { Alert, Avatar, Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { useId } from 'react';
import { recordValue } from '../../components/management/managementTypes';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import type { Language } from '../../i18n/instance';
import { trafficBoolean } from './trafficPolicy';
import type { TrafficIdentity } from './trafficIdentityService';
import { hasOpenTraffic, hasTrafficTime } from './trafficOperationService';

export type TrafficIdentityDetailsProps = {
  details: TrafficIdentity; language: Language; busy: boolean; canEdit: boolean;
  onSelect: (plate: string) => void; onAdd: () => void; onEdit: () => void; onRetry: () => void;
};
export function TrafficVehicleSelector({ details, language, busy, onSelect }: Pick<TrafficIdentityDetailsProps, 'details' | 'language' | 'busy' | 'onSelect'>) {
  const { t } = useTranslation(undefined, { lng: language });
  const vehicleLabelId = useId();
  const selected = details.cars.find(car => car.Id === Number(recordValue(details.info, 'CarId')))?.Plate ?? '';
  return <Box className="traffic-vehicle-selector" data-traffic-focus="vehicle">
    <FormControl fullWidth size="small" disabled={busy}>
      <InputLabel id={vehicleLabelId}>{t('trafficIdentity.memberVehicle')}</InputLabel>
      <Select labelId={vehicleLabelId} value={selected} label={t('trafficIdentity.memberVehicle')} onChange={event => onSelect(event.target.value)}>
        {details.cars.map(car => <MenuItem key={car.Id} value={car.Plate}><span dir="ltr">{car.Plate}</span>&nbsp;{car.Name}</MenuItem>)}
      </Select>
    </FormControl>
    {!selected && !hasOpenTraffic(details.info) && <Typography variant="caption" color="text.secondary">{t('trafficIdentity.selectVehicle')}</Typography>}
  </Box>;
}
export function TrafficIdentityDetails({ details, language, busy, canEdit, onSelect, onAdd, onEdit, onRetry, showVehicleSelector = true }: TrafficIdentityDetailsProps & { showVehicleSelector?: boolean }) {
  const { t } = useTranslation(undefined, { lng: language });
  const memberId = Number(recordValue(details.info, 'MemberId')) || 0;
  const carId = Number(recordValue(details.info, 'CarId')) || 0;
  const car = details.cars.find(item => item.Id === carId);
  const value = (...keys: string[]) => String(keys.map(key => recordValue(details.info, key)).find(item => item !== null && item !== undefined && item !== '') ?? '—');
  const enteredAt = recordValue(details.info, 'EnterDateTime');
  const vehicleFields = [
    [t('trafficIdentity.color'), car?.DtoViewCarColorTitle || value('CarColor')],
    [t('trafficIdentity.model'), car?.DtoViewCarModelTitle || value('CarModel')],
    [t('trafficGrid.entryTime'), hasTrafficTime(enteredAt) ? formatDateTime(enteredAt, language) : '—'],
  ];
  return <Box className="traffic-identity-details">
    <Box className="traffic-identity-card-body">
      <Box className="traffic-identity-profile">
        <Avatar variant="rounded" className="traffic-identity-avatar" src={details.personalPhoto ?? undefined} alt={t('trafficIdentity.personalPhoto')}>
          <PersonOutlineRoundedIcon />
        </Avatar>
        <Box className="traffic-identity-person">
          <Typography component="h3" className="traffic-identity-name">{memberId > 0 ? value('MemberFullName', 'Name') : t('trafficIdentity.guest')}</Typography>
          {memberId > 0 && <Box component="dl" className="traffic-identity-identifiers">
            <Box><Typography component="dt">{t('trafficIdentity.memberCode')}</Typography><Typography component="dd" dir="ltr">{value('MemberCode')}</Typography></Box>
            <Box><Typography component="dt">{t('trafficIdentity.nationalCode')}</Typography><Typography component="dd" dir="ltr">{value('MemberNationalCode')}</Typography></Box>
          </Box>}
        </Box>
      </Box>
      <Box component="section" className="traffic-identity-section" aria-label={t('trafficIdentity.vehicleDetails')}>
        <Box className="traffic-identity-vehicle-heading">
          <Box className="traffic-identity-vehicle-name">
            <Typography className="traffic-identity-eyebrow"><DirectionsCarOutlinedIcon />{t('trafficIdentity.vehicleDetails')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{car?.Name || value('CarName')}</Typography>
          </Box>
        </Box>
        <Box component="dl" className="traffic-identity-fields">
          {vehicleFields.map(([label, content]) => <Box key={label}><Typography component="dt">{label}</Typography><Typography component="dd">{content}</Typography></Box>)}
        </Box>
        {memberId > 0 && showVehicleSelector && <TrafficVehicleSelector details={details} language={language} busy={busy} onSelect={onSelect} />}
      </Box>
      {memberId > 0 && <Box component="section" className="traffic-identity-section" aria-label={t('trafficIdentity.memberships')}>
        <Typography component="h4" className="traffic-identity-section-title">{t('trafficIdentity.memberships')}</Typography>
        <Box className="traffic-credit-list">
          {details.creditError ? <Alert severity="warning" action={<Button size="small" disabled={busy} onClick={onRetry}>{t('trafficIdentity.retry')}</Button>}>{t('trafficIdentity.creditError')}</Alert>
            : details.credits.length === 0 ? <Typography variant="caption" color="text.secondary">{t('trafficIdentity.noMembership')}</Typography>
              : details.credits.map((credit, index) => <Box key={`${credit.MemberRegisterId ?? index}:${index}`} className="traffic-credit-item">
                <Box className="traffic-credit-heading">
                  <Typography component="h5">{credit.Title || t('trafficIdentity.memberships')}</Typography>
                  <Typography component="span" className={`traffic-credit-status ${trafficBoolean(credit.IsActive) ? 'is-active' : ''}`}>{t(trafficBoolean(credit.IsActive) ? 'trafficIdentity.active' : 'trafficIdentity.reserved')}</Typography>
                </Box>
                <Box className="traffic-credit-meta">
                  <Typography variant="caption" color="text.secondary">{t('trafficIdentity.creditTypes', { returnObjects: true })[credit.MembershipCreditType]}</Typography>
                  {credit.MembershipCreditType !== 1 && <Typography variant="caption" className="traffic-credit-balance"><span>{t('trafficIdentity.balance')}</span><strong>{formatNumber(credit.CashAmount, language)}</strong><span>{t('trafficIdentity.rial')}</span></Typography>}
                </Box>
                <Box component="dl" className="traffic-credit-dates">
                  <Box><Typography component="dt">{t('trafficIdentity.validFrom')}</Typography><Typography component="dd">{formatDateTime(credit.RegisterStartDateTime, language)}</Typography></Box>
                  <Box><Typography component="dt">{t('trafficIdentity.validUntil')}</Typography><Typography component="dd">{formatDateTime(credit.RegisterEndDateTime, language)}</Typography></Box>
                </Box>
              </Box>)}
        </Box>
      </Box>}
      {details.entranceImage && <Box component="figure" className="traffic-identity-entry-image">
        <Box component="img" src={details.entranceImage} alt={t('trafficIdentity.entranceImage')} />
        <Typography component="figcaption" variant="caption">{t('trafficIdentity.entranceImage')}</Typography>
      </Box>}
    </Box>
    {(memberId > 0 || carId > 0) && <Box className="traffic-identity-footer">
      {memberId > 0 && <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} disabled={busy || !canEdit} onClick={onAdd}>{t('trafficIdentity.addVehicle')}</Button>}
      {carId > 0 && <Button size="small" variant="text" startIcon={<EditOutlinedIcon />} disabled={busy || !canEdit} onClick={onEdit}>{t('trafficIdentity.editVehicle')}</Button>}
    </Box>}
  </Box>;
}
