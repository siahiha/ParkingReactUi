import { useEffect, useRef, useState, type Ref } from 'react';
import { Alert, Box, Button, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppPopup, type PopupAction } from '../../components/AppPopup';
import { recordValue, type Language, type RecordValue } from '../../utils/records';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import type { TrafficDoor } from './trafficDoorService';
import type { trafficPaymentPolicy } from './trafficPaymentPolicy';

export type TrafficPaymentPresentation = ReturnType<typeof trafficPaymentPolicy> & { door: TrafficDoor | null };
type Props = {
  bill: RecordValue;
  presentation: TrafficPaymentPresentation;
  language: Language;
  busy: boolean;
  error: string;
  paperRef: Ref<HTMLDivElement>;
  onClose: () => void;
  onPay: () => void;
};

export function TrafficPaymentPopup({ bill, presentation, language, busy, error, paperRef, onClose, onPay }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const [remaining, setRemaining] = useState<number | null>(presentation.timeoutSeconds || null);
  const [stopped, setStopped] = useState(false);
  const closed = useRef(false);
  useEffect(() => { if (busy) setStopped(true); }, [busy]);
  useEffect(() => {
    if (stopped || busy || presentation.timeoutSeconds === 0) return;
    const interval = window.setInterval(() => setRemaining(value => value === null ? null : value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [stopped, busy, presentation.timeoutSeconds]);
  useEffect(() => {
    // Reaching the deadline dismisses the bill; it never submits payment.
    if (remaining !== null && remaining <= 0 && !stopped && !busy && !closed.current) {
      closed.current = true;
      onClose();
    }
  }, [remaining, stopped, busy, onClose]);

  const number = (key: string) => {
    const value = recordValue(bill, key);
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  };
  const money = (value: number | null) => `${formatNumber(value, language)} ${t('trafficPayment.rial')}`;
  const duration = (value: number | null) => value === null ? '—' : t('trafficPayment.duration', {
    days: formatNumber(Math.floor(value / 1440), language), hours: formatNumber(Math.floor(value % 1440 / 60), language), minutes: formatNumber(Math.floor(value % 60), language),
  });
  const enteredAt = recordValue(bill, 'EnterDateTime');
  const exitedAt = recordValue(bill, 'ExitDateTime');
  const elapsed = (Date.parse(String(exitedAt)) - Date.parse(String(enteredAt))) / 60000;
  // The legacy FormatedDuration is always Persian. Localize the same elapsed minutes.
  const totalDuration = duration(Number.isFinite(elapsed) && elapsed >= 0 ? Math.floor(elapsed) : number('TotalDuration'));
  const memberCost = number('MemberCost') ?? 0;
  const memberDuration = number('MemberDuration') ?? 0;
  const commonDuration = number('CommonDuration') ?? 0;
  const row = (label: string, value: string) => <Box sx={{ display: 'flex', alignItems: 'baseline', gap: .5, flexWrap: 'wrap' }}>
    <Typography component="span" variant="body2" sx={{ fontSize: '.75rem' }}>{label}:</Typography>
    <Typography component="span" variant="body2" sx={{ fontSize: '.75rem', fontWeight: 500 }}>{value}</Typography>
  </Box>;
  const actions: PopupAction[] = [
    { id: 'cash', label: presentation.amount === 0 ? t('popup.confirm') : t('trafficPayment.confirmPay'), variant: 'contained',
      onClick: presentation.amount === 0 ? onClose : onPay,
      disabled: presentation.amount < 0 || !(Number(recordValue(bill, 'DumpId')) > 0) },
    { id: 'close', label: t('trafficPayment.close'), onClick: onClose, variant: 'outlined' },
    // The Windows POS/LCD are local devices. No web transaction/display contract exists yet.
    ...(presentation.door?.posConfigured ? [{ id: 'pos', label: t('trafficPayment.posPay'), tooltip: t('trafficPayment.posUnavailable'), onClick: () => {}, disabled: true, variant: 'outlined' as const }] : []),
  ];
  return <AppPopup open title={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
      <span>{t('trafficPayment.title')}</span>
      {remaining !== null && !stopped && <Typography component="span" variant="caption" role="timer" sx={{ fontSize: '.62rem', fontWeight: 400 }}>
        {t('trafficPayment.countdown', { seconds: formatNumber(Math.max(0, remaining), language) })}
      </Typography>}
    </Box>
    {presentation.door?.hasPriceDisplay && presentation.amount > 0 && <Tooltip title={t('trafficPayment.displayUnavailable')} describeChild><span>
      <Button size="small" disabled sx={{ width: 78, fontSize: '.6rem', lineHeight: 1.4 }}>{t('trafficPayment.showPrice')}</Button>
    </span></Tooltip>}
  </Box>} ariaLabel={t('trafficPayment.title')} className="traffic-payment-popup" modal={presentation.modal} compact width={336} maxWidth="xs"
    dir={language === 'fa' ? 'rtl' : 'ltr'} footerDirection="ltr" paperRef={paperRef} busy={busy} onClose={onClose} onInteract={() => setStopped(true)} actions={actions}>
    <Box className="traffic-payment-details" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {error && <Alert severity="error" sx={{ py: .25, px: 1 }}>{error}</Alert>}
      <Box>{row(t('trafficPayment.entryTime'), formatDateTime(enteredAt, language))}{row(t('trafficPayment.exitTime'), formatDateTime(exitedAt, language))}</Box>
      <Box component="section" aria-label={t('trafficPayment.totalStay')}>
        <Typography variant="body2" sx={{ fontSize: '.75rem', fontWeight: 700 }}>{t('trafficPayment.totalStay')}:</Typography>
        <Box sx={{ paddingInlineStart: 1.5 }}>{row(t('trafficPayment.totalDuration'), totalDuration)}{row(t('trafficPayment.totalCost'), money(number('TotalCost') ?? memberCost + presentation.amount))}</Box>
      </Box>
      {memberDuration > 0 && <Box component="section" aria-label={t('trafficPayment.membershipUsed')}>
        <Typography variant="body2" sx={{ fontSize: '.75rem', fontWeight: 700 }}>{t('trafficPayment.membershipUsed')}:</Typography>
        <Box sx={{ paddingInlineStart: 1.5 }}>{row(t('trafficPayment.roundedDuration'), duration(memberDuration))}{row(t('trafficPayment.memberPaid'), money(memberCost))}</Box>
      </Box>}
      {commonDuration > 0 && <Box component="section" aria-label={t('trafficPayment.receivable')}>
        <Typography variant="body2" sx={{ fontSize: '.75rem', fontWeight: 700 }}>{t('trafficPayment.receivable')}:</Typography>
        <Box sx={{ paddingInlineStart: 1.5 }}>{row(t('trafficPayment.roundedDuration'), duration(commonDuration))}{row(t('trafficPayment.tax'), money(number('TaxValue') ?? 0))}{row(t('trafficPayment.amount'), money(presentation.amount))}</Box>
      </Box>}
      {row(t('trafficPayment.tariff'), String(recordValue(bill, 'TarrifTitle') ?? '—'))}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBlockStart: 2, minHeight: 56 }}>
      <Typography component="span" variant="caption" color="text.secondary">{t('trafficPayment.payable')}</Typography>
      <Typography component="strong" className="traffic-payment-amount" dir="ltr" sx={{ marginInlineStart: 'auto', fontSize: '2.4rem', lineHeight: 1.2, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {formatNumber(presentation.amount, language)}
      </Typography>
      <Typography component="span" variant="caption">{t('trafficPayment.rial')}</Typography>
    </Box>
  </AppPopup>;
}
