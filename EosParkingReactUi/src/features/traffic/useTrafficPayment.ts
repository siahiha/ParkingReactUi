import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recordValue, type Language, type RecordValue } from '../../utils/records';
import { hasTrafficTime, TrafficOperationError } from './trafficOperationService';
import type { TrafficDoor } from './trafficDoorService';
import type { TrafficPaymentPresentation } from './TrafficPaymentPopup';
import { trafficPaymentPolicy, type TrafficPaymentSource } from './trafficPaymentPolicy';

type Options = {
  language: Language; door: TrafficDoor | null; pay: (dumpId: number) => Promise<unknown>;
  onPaid: () => void | Promise<void>; onError: (message: string) => void;
  onPendingChange: (pending: boolean) => void; onRestoreFocus: () => void;
};
/** Exit persistence belongs to registration. This hook only presents and settles an existing bill. */
export function useTrafficPayment({ language, door, pay, onPaid, onError, onPendingChange, onRestoreFocus }: Options) {
  const { t } = useTranslation(undefined, { lng: language });
  const [bill, setBill] = useState<RecordValue | null>(null);
  const [presentation, setPresentation] = useState<TrafficPaymentPresentation | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const focus = () => paperRef.current?.focus();
  const open = (next: RecordValue, source: TrafficPaymentSource) => {
    if (bill) { focus(); return; }
    try {
      const policy = trafficPaymentPolicy(next, source);
      setBill({ ...next }); setPresentation({ ...policy, door: door ? { ...door } : null }); setError('');
    } catch { onError(t('trafficPayment.invalidBill')); }
  };
  const openFromGrid = (row: RecordValue) => {
    if (bill) { focus(); return; }
    if (!hasTrafficTime(recordValue(row, 'ExitDateTime'))) { onError(t('trafficWorkspace.exitFirst')); return; }
    const payType = Number(recordValue(row, 'PayType')) || 0;
    if (payType !== 0 && payType !== 9) { onError(t('trafficWorkspace.alreadyPaid')); return; }
    open(row, 'grid');
  };
  const dismiss = () => { setBill(null); setPresentation(null); setError(''); };
  const close = () => {
    if (locked.current) return;
    // A modeless timeout only restores focus if the user was inside this popup.
    if (paperRef.current?.contains(document.activeElement)) onRestoreFocus();
    dismiss();
  };
  const settle = async () => {
    const dumpId = Number(recordValue(bill ?? {}, 'DumpId'));
    if (!dumpId || !presentation || presentation.amount <= 0 || locked.current) return;
    locked.current = true; setBusy(true); onPendingChange(true); setError('');
    try {
      await pay(dumpId);
      dismiss();
      await onPaid();
    } catch (cause) {
      setError(cause instanceof TrafficOperationError && cause.userMessage ? cause.userMessage : t('trafficOperation.paymentFailed'));
    } finally { locked.current = false; setBusy(false); onPendingChange(false); }
  };
  return { bill, presentation, error, busy, paperRef, isOpen: Boolean(bill), blocksInput: Boolean(bill && presentation?.modal !== false), open, openFromGrid, focus, close, settle };
}
