import { createContext, useContext, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useTranslation } from 'react-i18next';
import { getAvailableHelpTopics, getContextHelpTopic, getHelpMenuKey, helpCatalog } from './helpCatalog';
import type { HelpTopicId } from './helpTypes';
import { HelpCenter } from './HelpCenter';

type HelpContextValue = { isOpen: boolean; panelId: string; openHelp: (trigger: HTMLElement, topicId?: HelpTopicId) => void };
const HelpContext = createContext<HelpContextValue | null>(null);
export const useHelp = () => useContext(HelpContext);

type Props = { children: ReactNode; activePath: string; menuKeys: string[]; parkingId: number };
export function HelpProvider({ children, activePath, menuKeys, parkingId }: Props) {
  const panelId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const requestId = useRef(0);
  const [request, setRequest] = useState<{ id: number; topicId: HelpTopicId | null; explicitTopic: HelpTopicId | null } | null>(null);
  const menuSignature = JSON.stringify(menuKeys);
  const availableTopics = useMemo(() => getAvailableHelpTopics(JSON.parse(menuSignature) as string[]), [menuSignature]);
  const pageTopic = getContextHelpTopic(activePath, availableTopics);
  const explicitTopic = request?.explicitTopic && availableTopics.includes(request.explicitTopic) ? request.explicitTopic : null;
  const contextTopic = explicitTopic ?? pageTopic;
  const contextTopics = explicitTopic ? [explicitTopic] : availableTopics.filter(id => helpCatalog[id].menus.includes(getHelpMenuKey(activePath)) || id === contextTopic);
  const openHelp = (trigger: HTMLElement, topicId?: HelpTopicId) => {
    triggerRef.current = trigger;
    const explicitTopic = topicId && availableTopics.includes(topicId) ? topicId : null;
    setRequest({ id: ++requestId.current, topicId: explicitTopic ?? pageTopic, explicitTopic });
  };
  const closeHelp = () => {
    setRequest(null);
    // Focus restoration is the only DOM access; it never changes form values or layout.
    if (triggerRef.current?.isConnected) triggerRef.current.focus({ preventScroll: true });
  };
  return <HelpContext.Provider value={{ isOpen: Boolean(request), panelId, openHelp }}>
    {children}
    {request && <>
      <HelpCenter key={`${request.id}:${parkingId}`} panelId={panelId} initialTopic={request.topicId} availableTopics={availableTopics} contextTopic={contextTopic} contextTopics={contextTopics} onClose={closeHelp} />
    </>}
  </HelpContext.Provider>;
}

export function HelpButton({ topicId, className, disabled = false }: { topicId?: HelpTopicId; className?: string; disabled?: boolean }) {
  const help = useHelp();
  const { t } = useTranslation();
  if (!help) return null;
  return <Tooltip title={t('help.open')} arrow><span>
    <IconButton type="button" className={className} size="small" disabled={disabled} aria-label={t('help.open')}
      aria-expanded={help.isOpen} aria-controls={help.isOpen ? help.panelId : undefined}
      onClick={event => { event.stopPropagation(); help.openHelp(event.currentTarget, topicId); }}>
      <HelpOutlineRoundedIcon fontSize="small" />
    </IconButton>
  </span></Tooltip>;
}
