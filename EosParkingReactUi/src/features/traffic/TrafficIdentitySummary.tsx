import { useEffect, useId, useRef, useState } from 'react';
import { Box, Button, Fade, IconButton, Popover, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useTranslation } from 'react-i18next';
import { recordValue } from '../../components/management/managementTypes';
import { formatDateTime, formatTime } from '../../utils/formatters';
import { hasTrafficTime } from './trafficOperationService';
import { TrafficIdentityDetails, TrafficVehicleSelector, type TrafficIdentityDetailsProps } from './TrafficIdentityDetails';

export function TrafficIdentitySummary(props: TrafficIdentityDetailsProps) {
  const { details, language, busy, canEdit, onAdd } = props;
  const { t } = useTranslation(undefined, { lng: language });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);
  const compact = useMediaQuery('(max-width:680px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const id = useId();
  const info = details.info;
  const value = (...keys: string[]) => String(keys.map(key => recordValue(info, key)).find(item => item !== null && item !== undefined && item !== '') ?? '—');
  const memberId = Number(recordValue(info, 'MemberId')) || 0;
  useEffect(() => {
    // A new input clears this summary; refreshing the same member must respect dismissal.
    setAnchor(memberId > 0 ? detailsButtonRef.current : null);
  }, [memberId]);
  const carId = Number(recordValue(info, 'CarId')) || 0;
  const car = details.cars.find(item => item.Id === carId);
  const needsSelector = memberId > 0 && (details.cars.length > 1 || !car);
  const enteredAt = recordValue(info, 'EnterDateTime');
  const vehicle = [value('CarName', 'CarModel') === '—' ? car?.Name : value('CarName', 'CarModel'), value('CarColor') === '—' ? car?.DtoViewCarColorTitle : value('CarColor')].filter(Boolean).join(' · ') || '—';
  const closeThen = (action: () => void) => { setAnchor(null); action(); };
  return <Box className="traffic-identity-summary">
    <Box className="traffic-identity-summary-heading">
      <Tooltip title={value('MemberFullName', 'Name')}><Typography variant="body2" noWrap>{value('MemberFullName', 'Name')}</Typography></Tooltip>
      <Button ref={detailsButtonRef} size="small" startIcon={<BadgeOutlinedIcon />} aria-haspopup="dialog" aria-expanded={Boolean(anchor)} aria-controls={anchor ? id : undefined}
        onClick={event => setAnchor(event.currentTarget)}>{t('trafficIdentity.details')}</Button>
    </Box>
    <Box className="traffic-identity-summary-meta">
      <Tooltip title={vehicle}><Typography variant="caption" color="text.secondary" noWrap>{vehicle}</Typography></Tooltip>
      {hasTrafficTime(enteredAt) && <Tooltip title={formatDateTime(enteredAt, language)}><Typography variant="caption" noWrap>
        {t('trafficLayout.entry')}: {formatTime(new Date(String(enteredAt)), language, { hour: '2-digit', minute: '2-digit', hour12: false })}
      </Typography></Tooltip>}
    </Box>
    {needsSelector && <TrafficVehicleSelector details={details} language={language} busy={busy} onSelect={props.onSelect} />}
    {needsSelector && !car && <Button size="small" disabled={busy || !canEdit} onClick={onAdd}>{t('trafficIdentity.addVehicle')}</Button>}
    {details.creditError && <Typography variant="caption" color="warning.main">{t('trafficIdentity.creditError')}</Typography>}
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}
      slots={{ transition: Fade }} transitionDuration={reducedMotion ? 0 : { enter: 200, exit: 120 }}
      // Portal events must not open the operation panel's tooltip over this card.
      onFocus={event => event.stopPropagation()} onMouseOver={event => event.stopPropagation()}
      anchorOrigin={{ vertical: compact ? 'bottom' : 'top', horizontal: compact ? 'center' : language === 'fa' ? 'left' : 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: compact ? 'center' : language === 'fa' ? 'right' : 'left' }}
      elevation={0}
      slotProps={{ paper: { id, role: 'dialog', 'aria-label': t('trafficIdentity.detailsTitle'), className: 'traffic-identity-popover', dir: language === 'fa' ? 'rtl' : 'ltr',
        sx: theme => ({
          '--identity-surface': theme.palette.background.paper,
          '--identity-text': theme.palette.text.primary,
          '--identity-muted': theme.palette.text.secondary,
          '--identity-line': theme.palette.divider,
          '--identity-accent': theme.palette.primary.main,
          '--identity-success': theme.palette.success[theme.palette.mode === 'dark' ? 'light' : 'dark'],
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? .28 : .12)}`,
        }),
      } }}>
      <Box className="traffic-identity-popover-heading">
        <Typography variant="subtitle2"><BadgeOutlinedIcon />{t('trafficIdentity.detailsTitle')}</Typography>
        <IconButton size="small" autoFocus aria-label={t('trafficIdentity.close')} onClick={() => setAnchor(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
      </Box>
      <TrafficIdentityDetails {...props} showVehicleSelector={false} onAdd={() => closeThen(props.onAdd)} onEdit={() => closeThen(props.onEdit)} />
    </Popover>
  </Box>;
}
