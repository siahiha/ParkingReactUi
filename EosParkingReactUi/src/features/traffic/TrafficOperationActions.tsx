import { Button, SvgIcon } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../utils/records';
import type { trafficActionState } from './trafficActionState';

type Props = {
  language: Language;
  state: ReturnType<typeof trafficActionState>;
  busy: boolean;
  blocked: boolean;
  canSearch: boolean;
  canCancel: boolean;
  onEnter: () => void;
  onExit: () => void;
  onSearch: () => void;
  onCancel: () => void;
};

function actionColors(theme: Theme, tone: 'success' | 'primary' | 'secondary') {
  const accent = tone === 'secondary' ? theme.palette.text.primary : theme.palette[tone].main;
  return {
    '--traffic-action-accent': accent,
    '--traffic-action-ink': tone === 'secondary' ? accent : theme.palette[tone][theme.palette.mode === 'dark' ? 'light' : 'dark'],
    '--traffic-action-muted': theme.palette.text.secondary,
  };
}

function ActionIcon({ action, language }: { action: 'enter' | 'exit' | 'search' | 'cancel'; language: Language }) {
  const directional = action === 'enter' || action === 'exit';
  return <SvgIcon viewBox="0 0 24 24" sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round', transform: directional && language === 'fa' ? 'scaleX(-1)' : undefined }}>
    {action === 'enter' && <path d="M14 4h5v16h-5M4 12h10m-4-4 4 4-4 4" />}
    {action === 'exit' && <path d="M10 4H5v16h5m0-8h10m-4-4 4 4-4 4" />}
    {action === 'search' && <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>}
    {action === 'cancel' && <path d="m7 7 10 10M17 7 7 17" />}
  </SvgIcon>;
}

export function TrafficOperationActions({ language, state, busy, blocked, canSearch, canCancel, onEnter, onExit, onSearch, onCancel }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  return <>
    {state.showEnter && <Button data-traffic-action="enter" size="small" color="success" variant={state.canEnter ? 'contained' : 'outlined'} disabled={busy || blocked || !state.canEnter}
      sx={theme => actionColors(theme, 'success')} startIcon={<ActionIcon action="enter" language={language} />}
      onClick={onEnter}>{t('trafficOperation.enter')}</Button>}
    {state.showExit && <Button data-traffic-action="exit" size="small" variant={state.canExit ? 'contained' : 'outlined'} disabled={busy || blocked || !state.canExit}
      sx={theme => actionColors(theme, 'primary')} startIcon={<ActionIcon action="exit" language={language} />}
      onClick={onExit}>{t('trafficOperation.exit')}</Button>}
    {state.showSearch && <Button data-traffic-action="search" size="small" variant="outlined" disabled={busy || !canSearch}
      sx={theme => actionColors(theme, 'primary')} startIcon={<ActionIcon action="search" language={language} />}
      onClick={onSearch}>{t('trafficOperation.search')}</Button>}
    <Button data-traffic-action="cancel" size="small" color="secondary" variant="contained" disabled={busy || !canCancel}
      sx={theme => actionColors(theme, 'secondary')} startIcon={<ActionIcon action="cancel" language={language} />}
      onClick={onCancel}>{t('trafficOperation.cancel')}</Button>
  </>;
}
