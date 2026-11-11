import { useRef, type RefObject } from 'react';
import { Box } from '@mui/material';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../i18n/instance';

type Props = { panelRef: RefObject<HTMLElement | null>; onResize: (height: number) => void; language: Language };

/** Pointer capture stays on the separator; sizing itself is rendered through React props. */
export function TrafficWorkspaceSplitter({ panelRef, onResize, language }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const drag = useRef<{ y: number; height: number; max: number } | null>(null);
  const bounds = () => {
    const panel = panelRef.current;
    const grids = panel?.parentElement?.querySelector('.traffic-split-grids');
    const height = panel?.getBoundingClientRect().height ?? 280;
    return { height, max: Math.max(248, height + (grids?.getBoundingClientRect().height ?? 180) - 150) };
  };
  return <Box component="button" type="button" className="traffic-workspace-splitter" aria-label={t('trafficLayout.resize')}
    onPointerDown={event => { const size = bounds(); drag.current = { ...size, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={event => { const start = drag.current; if (start) onResize(Math.min(start.max, Math.max(248, start.height + event.clientY - start.y))); }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
    onDoubleClick={() => { const size = bounds(); onResize(Math.min(size.max, 280)); }}
    onKeyDown={event => { if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return; event.preventDefault(); const size = bounds(); onResize(Math.min(size.max, Math.max(248, size.height + (event.key === 'ArrowUp' ? -24 : 24)))); }}>
    <DragHandleRoundedIcon fontSize="small" />
  </Box>;
}
