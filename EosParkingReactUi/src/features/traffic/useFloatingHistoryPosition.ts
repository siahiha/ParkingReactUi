import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { Language } from '../../i18n/instance';

type Point = { x: number; y: number };
const storageKey = 'parking-plate-history-icon-position-v2';
const margin = 8;
export const historyHandleWidth = 36;
export const historyHandleHeight = 44;
const viewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });
function constrain(point: Point, viewport: ReturnType<typeof viewportSize>): Point {
  return {
    x: Math.max(0, Math.min(Math.max(0, viewport.width - historyHandleWidth), point.x)),
    y: Math.max(margin, Math.min(Math.max(margin, viewport.height - historyHandleHeight - margin), point.y)),
  };
}
function savedPosition(): Point | null {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (saved && typeof saved === 'object' && 'x' in saved && 'y' in saved
      && typeof saved.x === 'number' && Number.isFinite(saved.x) && typeof saved.y === 'number' && Number.isFinite(saved.y)) {
      return { x: saved.x, y: saved.y };
    }
  } catch { /* Position persistence is optional in restricted browser sessions. */ }
  return null;
}
function save(point: Point) {
  try { localStorage.setItem(storageKey, JSON.stringify(point)); } catch { /* Keep the in-memory position. */ }
}

/** Browser pointer capture and viewport reads are isolated here; React renders every position. */
export function useFloatingHistoryPosition(anchorRef: RefObject<HTMLDivElement | null>, language: Language) {
  const [viewport, setViewport] = useState(viewportSize);
  const [manualPosition, setManualPosition] = useState(savedPosition);
  const [anchorPosition, setAnchorPosition] = useState<Point>(() => ({ x: language === 'fa' ? 0 : viewportSize().width - historyHandleWidth, y: 160 }));
  const position = constrain(manualPosition ?? anchorPosition, viewport);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ start: Point; origin: Point; last: Point } | null>(null);
  const moved = useRef(false);
  useLayoutEffect(() => {
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const next = viewportSize();
      const card = anchorRef.current?.getBoundingClientRect();
      const anchor = constrain({
        x: language === 'fa' ? 0 : next.width - historyHandleWidth,
        y: card ? card.top + card.height / 2 - historyHandleHeight / 2 : 160,
      }, next);
      setViewport(current => current.width === next.width && current.height === next.height ? current : next);
      setAnchorPosition(current => current.x === anchor.x && current.y === anchor.y ? current : anchor);
    };
    const scheduleMeasure = () => { if (frame === null) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(scheduleMeasure);
    if (anchorRef.current) observer.observe(anchorRef.current);
    measure();
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleMeasure, { capture: true, passive: true });
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure, true);
    };
  }, [anchorRef, language]);
  const finish = () => {
    if (!gesture.current) return;
    if (moved.current) save(gesture.current.last);
    gesture.current = null;
    setDragging(false);
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    // Dragging must not take keyboard focus from the operator's current input.
    event.preventDefault();
    moved.current = false;
    gesture.current = { start: { x: event.clientX, y: event.clientY }, origin: position, last: position };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current) return;
    const dx = event.clientX - current.start.x;
    const dy = event.clientY - current.start.y;
    if (!moved.current && Math.hypot(dx, dy) < 4) return;
    moved.current = true;
    const next = constrain({ x: current.origin.x + dx, y: current.origin.y + dy }, viewport);
    current.last = next;
    setManualPosition(next);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? 24 : 8;
    const delta: Record<string, Point> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } };
    const change = delta[event.key];
    if (!change) return;
    event.preventDefault();
    const next = constrain({ x: position.x + change.x, y: position.y + change.y }, viewport);
    save(next);
    setManualPosition(next);
  };
  return { position, viewport, dragging, moved,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onLostPointerCapture: finish, onKeyDown } };
}
