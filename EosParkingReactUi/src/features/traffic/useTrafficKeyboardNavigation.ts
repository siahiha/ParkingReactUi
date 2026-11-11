import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

type FocusTarget = 'plate' | 'card' | 'member' | 'vehicle' | 'actions';

/** Focus is the only DOM operation here; React owns the form and its pending state. */
export function useTrafficKeyboardNavigation(enabled: boolean, doorId: string, busy: boolean) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const movingBackward = useRef(false);
  const [pending, setPending] = useState<{ target: FocusTarget; doorId: string } | null>(null);
  const requestFocus = useCallback((target: FocusTarget) => {
    if (enabled) setPending({ target, doorId });
  }, [enabled, doorId]);

  useEffect(() => {
    if (!pending || busy) return;
    if (!enabled || pending.doorId !== doorId) { setPending(null); return; }
    const root = consoleRef.current;
    const selectors: Record<FocusTarget, string[]> = {
      plate: ['.traffic-plate-field input[name="left"]', '.traffic-plate-field input[name="motorFirst"]'],
      card: ['.traffic-card-field input'],
      member: ['.traffic-member-field input'],
      vehicle: ['[data-traffic-focus="vehicle"] [role="combobox"]'],
      actions: ['[data-traffic-action="exit"]', '[data-traffic-action="enter"]', '[data-traffic-action="search"]', '[data-traffic-action="cancel"]'],
    };
    const target = selectors[pending.target].map(selector => root?.querySelector<HTMLElement>(selector))
      .find(element => element && !element.matches(':disabled, [aria-disabled="true"]'));
    target?.focus();
    setPending(null);
  }, [pending, busy, enabled, doorId]);

  const onKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (!enabled) return;
    movingBackward.current = event.key === 'Tab' && event.shiftKey;
  };
  return { consoleRef, requestFocus, onKeyDownCapture,
    onPointerDownCapture: () => { movingBackward.current = false; },
    shouldIdentifyOnBlur: () => !enabled || !movingBackward.current,
  };
}
