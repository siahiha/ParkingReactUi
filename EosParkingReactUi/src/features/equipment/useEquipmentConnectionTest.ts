import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/client';
import { equipmentService, type EquipmentConnectionSettings, type EquipmentConnectionResult } from './equipmentService';

export type EquipmentTestPhase = 'idle' | 'checking' | 'forbidden' | 'cancelled' | EquipmentConnectionResult['Status'];

export function useEquipmentConnectionTest(settings: EquipmentConnectionSettings) {
  const [phase, setPhase] = useState<EquipmentTestPhase>('idle');
  const generation = useRef(0);
  const active = useRef<AbortController | null>(null);
  const settingsKey = JSON.stringify(settings);
  const stop = useCallback(() => {
    generation.current += 1;
    active.current?.abort();
    active.current = null;
  }, []);

  useEffect(() => {
    stop();
    setPhase('idle');
    return stop;
  }, [settingsKey, stop]);

  const start = useCallback(async () => {
    stop();
    const attempt = generation.current;
    const controller = new AbortController();
    active.current = controller;
    setPhase('checking');
    try {
      const result = await equipmentService.testConnection(settings, controller.signal);
      if (attempt === generation.current) setPhase(result.Status);
    } catch (cause) {
      if (attempt !== generation.current) return;
      setPhase(cause instanceof ApiError && [401, 403].includes(cause.status) ? 'forbidden'
        : cause instanceof ApiError && cause.status === 400 ? 'invalid-config'
          : cause instanceof ApiError && cause.status === 503 ? 'unavailable'
            : cause instanceof DOMException && cause.name === 'AbortError' ? 'timeout' : 'error');
    } finally {
      if (attempt === generation.current) active.current = null;
    }
  }, [settings, stop]);

  return { phase, start, cancel: () => { stop(); setPhase('cancelled'); } };
}
