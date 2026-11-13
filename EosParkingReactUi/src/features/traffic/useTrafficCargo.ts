import { useEffect, useRef, useState } from 'react';
import type { RecordValue } from '../../utils/records';
import { trafficCargoService, TrafficCargoError, type CargoFormState, type CargoOptions } from './trafficCargoService';

const emptyForm = (): CargoFormState => ({ driverId: '', merchandiseId: '', originId: '', destinationId: '', weight: '0', count: '0', reason: '', description: '' });
const emptyOptions: CargoOptions = { drivers: [], merchandises: [], companies: [] };
type CargoError = '' | 'loadError' | 'required' | 'alreadyRegistered' | 'saveError';

/** Owns cargo requests and draft lifetime; the traffic page only opens it and refreshes after success. */
export function useTrafficCargo(onSaved: (outbound: boolean) => void | Promise<void>, service = trafficCargoService) {
  const [row, setRow] = useState<RecordValue | null>(null);
  const [outbound, setOutbound] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [data, setData] = useState<CargoOptions>(emptyOptions);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CargoError>('');
  const generation = useRef(0);
  const pending = useRef(false);
  useEffect(() => () => { generation.current++; }, []);
  const open = async (next: RecordValue, isOutbound = false) => {
    if (pending.current) return;
    const request = ++generation.current;
    pending.current = true;
    setRow(next); setOutbound(isOutbound); setForm(emptyForm()); setData(emptyOptions); setError(''); setBusy(true);
    try { const loaded = await service.load(); if (request === generation.current) setData(loaded); }
    catch { if (request === generation.current) setError('loadError'); }
    finally { pending.current = false; if (request === generation.current) setBusy(false); }
  };
  const close = () => { if (!pending.current) { generation.current++; setRow(null); } };
  const save = async () => {
    if (!row || pending.current) return;
    const request = generation.current;
    pending.current = true; setBusy(true); setError('');
    try {
      await service.save(row, outbound, form, data);
      if (request !== generation.current) return;
      setRow(null);
      await onSaved(outbound);
    } catch (cause) {
      if (request === generation.current) setError(cause instanceof TrafficCargoError ? cause.key : 'saveError');
    } finally { pending.current = false; if (request === generation.current) setBusy(false); }
  };
  return { isOpen: Boolean(row), outbound, setOutbound, form, setForm, data, busy, error, open, close, save };
}
