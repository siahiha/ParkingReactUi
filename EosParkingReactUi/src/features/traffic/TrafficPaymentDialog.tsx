import type { Language } from '../../i18n/instance';
import { TrafficPaymentPopup } from './TrafficPaymentPopup';
import type { useTrafficPayment } from './useTrafficPayment';

export function TrafficPaymentDialog({ payment, language }: { payment: ReturnType<typeof useTrafficPayment>; language: Language }) {
  return payment.bill && payment.presentation ? <TrafficPaymentPopup
    key={String(payment.bill.DumpId ?? payment.bill.dumpId)} bill={payment.bill} presentation={payment.presentation}
    language={language} busy={payment.busy} error={payment.error} paperRef={payment.paperRef}
    onClose={payment.close} onPay={() => void payment.settle()} /> : null;
}
