import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useId } from 'react';
import { recordValue } from '../../components/management/managementTypes';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import type { Language } from '../../i18n/instance';
import { trafficBoolean } from './trafficPolicy';
import type { TrafficIdentity } from './trafficIdentityService';
import { hasOpenTraffic } from './trafficOperationService';

type Props = {
  details: TrafficIdentity; language: Language; busy: boolean; canEdit: boolean;
  onSelect: (plate: string) => void; onAdd: () => void; onEdit: () => void; onRetry: () => void;
};
export function TrafficIdentityDetails({ details, language, busy, canEdit, onSelect, onAdd, onEdit, onRetry }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const vehicleLabelId = useId();
  const memberId = Number(recordValue(details.info, 'MemberId')) || 0;
  const carId = Number(recordValue(details.info, 'CarId')) || 0;
  const selected = details.cars.find(car => car.Id === carId)?.Plate ?? '';
  return <Box className="traffic-identity-details">
    {memberId > 0 && <>
      <Box className="traffic-personal-details">
        {details.personalPhoto && <Box component="img" className="traffic-personal-photo" src={details.personalPhoto} alt={t('trafficIdentity.personalPhoto')} />}
        <Box className="traffic-member-identity-row">
          <Typography variant="body2">{t('trafficIdentity.nationalCode')}: <strong dir="ltr">{recordValue(details.info, 'MemberNationalCode') || '—'}</strong></Typography>
          <FormControl fullWidth size="small" disabled={busy}>
            <InputLabel id={vehicleLabelId}>{t('trafficIdentity.memberVehicle')}</InputLabel>
            <Select labelId={vehicleLabelId} value={selected} label={t('trafficIdentity.memberVehicle')} onChange={event => onSelect(event.target.value)}>
              {details.cars.map(car => <MenuItem key={car.Id} value={car.Plate}><span dir="ltr">{car.Plate}</span>&nbsp;{car.Name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {!selected && !hasOpenTraffic(details.info) && <Alert severity="info">{t('trafficIdentity.selectVehicle')}</Alert>}
    </>}
    <Box sx={{ display: 'flex', gap: 1 }}>
      {memberId > 0 && <Button size="small" disabled={busy || !canEdit} onClick={onAdd}>{t('trafficIdentity.addVehicle')}</Button>}
      {carId > 0 && <Button size="small" disabled={busy || !canEdit} onClick={onEdit}>{t('trafficIdentity.editVehicle')}</Button>}
    </Box>
    {memberId > 0 && <Box className="traffic-credit-list" aria-label={t('trafficIdentity.memberships')}>
      {details.creditError ? <Alert severity="warning" action={<Button size="small" disabled={busy} onClick={onRetry}>{t('trafficIdentity.retry')}</Button>}>{t('trafficIdentity.creditError')}</Alert>
        : details.credits.length === 0 ? <Typography variant="caption">{t('trafficIdentity.noMembership')}</Typography>
          : details.credits.map((credit, index) => <Box key={`${credit.MemberRegisterId ?? index}:${index}`} className="traffic-credit-item" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption"><strong>{credit.Title || t('trafficIdentity.memberships')}</strong> · {t(trafficBoolean(credit.IsActive) ? 'trafficIdentity.active' : 'trafficIdentity.reserved')} · {t('trafficIdentity.creditTypes', { returnObjects: true })[credit.MembershipCreditType]}</Typography>
            <Typography variant="caption" component="div">{formatDateTime(credit.RegisterStartDateTime, language)} — {formatDateTime(credit.RegisterEndDateTime, language)}</Typography>
            {credit.MembershipCreditType !== 1 && <Typography variant="caption">{t('trafficIdentity.balance')}: {formatNumber(credit.CashAmount, language)} {t('trafficIdentity.rial')}</Typography>}
          </Box>)}
    </Box>}
    {details.entranceImage && <Box component="figure" sx={{ m: 0 }}>
      <Typography component="figcaption" variant="caption">{t('trafficIdentity.entranceImage')}</Typography>
      <Box component="img" className="traffic-entrance-image" src={details.entranceImage} alt={t('trafficIdentity.entranceImage')} />
    </Box>}
  </Box>;
}
