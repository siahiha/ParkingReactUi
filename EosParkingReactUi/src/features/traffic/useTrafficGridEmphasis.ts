import { useEffect, useRef, useState, type HTMLAttributes } from 'react';

export type TrafficGridId = 'entries' | 'exits';
type Interaction = { hovered: TrafficGridId | null; focused: TrafficGridId | null; source: 'pointer' | 'focus' };
type InteractionUpdate = (previous: Interaction) => Interaction;
export type TrafficGridEvents = Pick<HTMLAttributes<HTMLElement>, 'onPointerMove' | 'onPointerLeave' | 'onPointerDownCapture'
  | 'onPointerUpCapture' | 'onPointerCancelCapture' | 'onClickCapture' | 'onKeyDownCapture' | 'onFocusCapture' | 'onBlurCapture'>;

export function useTrafficGridEmphasis(pinnedGrid: TrafficGridId | null) {
  const [interaction, setInteraction] = useState<Interaction>({ hovered: null, focused: null, source: 'pointer' });
  const current = useRef(interaction);
  current.current = interaction;
  const pointerPressed = useRef(false);
  const pending = useRef<InteractionUpdate[]>([]);
  const hoverCandidate = useRef<TrafficGridId | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHover = () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    hoverCandidate.current = null;
  };
  useEffect(() => () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current);
  }, []);

  const update = (next: InteractionUpdate) => {
    if (pointerPressed.current) pending.current.push(next);
    else setInteraction(next);
  };
  const emphasize = (grid: TrafficGridId, source: Interaction['source']) => update(previous => {
    const key = source === 'pointer' ? 'hovered' : 'focused';
    return previous[key] === grid && previous.source === source ? previous : { ...previous, [key]: grid, source };
  });
  const leave = (grid: TrafficGridId, key: 'hovered' | 'focused') => update(previous => previous[key] === grid ? { ...previous, [key]: null } : previous);
  const finishPointer = (grid?: TrafficGridId) => {
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current);
    releaseTimer.current = null;
    if (!pointerPressed.current) return;
    pointerPressed.current = false;
    const queued = pending.current;
    pending.current = [];
    setInteraction(previous => {
      const next = queued.reduce((value, apply) => apply(value), previous);
      return grid ? { ...next, hovered: grid, source: 'pointer' } : next;
    });
  };
  const activeGrid = pinnedGrid ?? (interaction.source === 'focus'
    ? interaction.focused ?? interaction.hovered : interaction.hovered ?? interaction.focused) ?? 'entries';
  const eventsFor = (grid: TrafficGridId): TrafficGridEvents => ({
    onPointerMove: event => {
      if (event.pointerType === 'touch') return;
      if (pointerPressed.current && event.buttons === 0) finishPointer();
      if (pointerPressed.current || (current.current.hovered === grid && current.current.source === 'pointer') || hoverCandidate.current === grid) return;
      cancelHover();
      hoverCandidate.current = grid;
      // A short dwell keeps direct clicks on row actions from moving their target.
      hoverTimer.current = setTimeout(() => { cancelHover(); emphasize(grid, 'pointer'); }, 120);
    },
    onPointerLeave: () => { if (hoverCandidate.current === grid) cancelHover(); finishPointer(); leave(grid, 'hovered'); },
    onPointerDownCapture: () => {
      finishPointer();
      cancelHover();
      pointerPressed.current = true;
    },
    // Keep the layout stable until the browser has dispatched the click target.
    onPointerUpCapture: () => { releaseTimer.current = setTimeout(() => finishPointer(grid), 0); },
    onPointerCancelCapture: () => finishPointer(),
    onClickCapture: () => finishPointer(grid),
    onKeyDownCapture: () => { finishPointer(); cancelHover(); emphasize(grid, 'focus'); },
    onFocusCapture: () => { cancelHover(); emphasize(grid, 'focus'); },
    onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) leave(grid, 'focused'); },
  });
  return { activeGrid, eventsFor };
}
