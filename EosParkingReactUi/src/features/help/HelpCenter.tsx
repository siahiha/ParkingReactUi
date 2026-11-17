import { useMemo, useState } from 'react';
import { Box, Button, Checkbox, Chip, Divider, Drawer, FormControlLabel, IconButton, InputAdornment, List, ListItemButton, Portal, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useTranslation } from 'react-i18next';
import { helpCatalog } from './helpCatalog';
import { buildHelpDocuments, createHelpSearchIndex, searchHelp } from './helpSearch';
import { HelpArticleView, HelpText } from './HelpArticleView';
import type { HelpArticles, HelpLocation, HelpSearchConfig, HelpTopicId } from './helpTypes';
import { formatNumber } from '../../utils/formatters';

type Props = { panelId: string; initialTopic: HelpTopicId | null; availableTopics: HelpTopicId[]; contextTopic: HelpTopicId | null; contextTopics: HelpTopicId[]; onClose: () => void };
export function HelpCenter({ panelId, initialTopic, availableTopics, contextTopic, contextTopics, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [query, setQuery] = useState('');
  const [onlyPage, setOnlyPage] = useState(false);
  const [resultLimit, setResultLimit] = useState(20);
  const [selected, setSelected] = useState<HelpLocation | null>(initialTopic ? { topicId: initialTopic, section: 'overview', index: 0 } : null);
  const articles = useMemo(() => t('help.articles', { returnObjects: true }) as unknown as HelpArticles, [t, i18n.resolvedLanguage]);
  const searchConfig = useMemo(() => t('help.search', { returnObjects: true }) as unknown as HelpSearchConfig, [t, i18n.resolvedLanguage]);
  const availableSignature = availableTopics.join('|');
  const index = useMemo(() => createHelpSearchIndex(buildHelpDocuments(articles, availableTopics), searchConfig), [articles, searchConfig, availableSignature]);
  const results = useMemo(() => searchHelp(index, query, searchConfig, contextTopic), [index, query, searchConfig, contextTopic]);
  const scopedResults = onlyPage ? results.filter(result => contextTopics.includes(result.topicId)) : results;
  const currentSelection = selected && availableTopics.includes(selected.topicId) ? selected : null;
  const topicIds = onlyPage ? availableTopics.filter(id => contextTopics.includes(id)) : availableTopics;
  const groups = ['start', 'operations', 'definitions', 'management', 'reports'] as const;
  const titleId = `${panelId}-title`;
  const reset = () => { setSelected(null); setQuery(''); setOnlyPage(false); setResultLimit(20); };
  return <Portal><Drawer variant={isMobile ? 'temporary' : 'persistent'} open anchor={theme.direction === 'rtl' ? 'left' : 'right'} onClose={onClose}
    slotProps={{ paper: { id: panelId, role: isMobile ? 'dialog' : 'complementary', 'aria-modal': isMobile ? true : undefined, 'aria-labelledby': titleId, dir: theme.direction } }}
    sx={{ zIndex: theme.zIndex.modal + 2, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 560 }, maxWidth: '100vw', height: '100dvh', boxSizing: 'border-box', bgcolor: 'background.paper', backgroundImage: 'none' }, '@media (prefers-reduced-motion: reduce)': { '& .MuiDrawer-paper': { transition: 'none !important' } } }}>
    <Box onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, textAlign: 'start' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2, pb: 1 }}>
        <Typography id={titleId} component="h1" variant="subtitle1" sx={{ flex: 1, fontWeight: 700 }}>{t('help.title')}</Typography>
        <Tooltip title={t('help.close')}><IconButton type="button" size="small" onClick={onClose} aria-label={t('help.close')}><CloseRoundedIcon /></IconButton></Tooltip>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <TextField autoFocus fullWidth size="small" label={t('help.searchLabel')} placeholder={t('help.searchPlaceholder')} value={query}
          onChange={event => { setQuery(event.target.value); setSelected(null); setResultLimit(20); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>, endAdornment: query ? <InputAdornment position="end"><IconButton type="button" size="small" onClick={() => { setQuery(''); setSelected(null); }} aria-label={t('help.clearSearch')}><CloseRoundedIcon fontSize="small" /></IconButton></InputAdornment> : undefined } }} />
        <Stack direction="row" useFlexGap sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', gap: .5 }}>
          <Button size="small" onClick={reset}>{t('help.allTopics')}</Button>
          {contextTopic && <Button size="small" onClick={() => { setQuery(''); setSelected({ topicId: contextTopic, section: 'overview', index: 0 }); }}>{t('help.thisPage')}</Button>}
          <FormControlLabel sx={{ marginInline: 0 }} control={<Checkbox size="small" checked={onlyPage} disabled={!contextTopic} onChange={event => { setOnlyPage(event.target.checked); setSelected(null); setResultLimit(20); }} />} label={<Typography variant="caption">{t('help.onlyPage')}</Typography>} />
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', p: 2, overflowWrap: 'anywhere' }}>
        {currentSelection ? <>
          <Button size="small" startIcon={<ArrowBackRoundedIcon sx={{ transform: theme.direction === 'rtl' ? 'rotate(180deg)' : undefined }} />} sx={{ mb: 2 }} onClick={() => setSelected(null)}>{query.trim() ? t('help.backResults') : t('help.backTopics')}</Button>
          <HelpArticleView article={articles[currentSelection.topicId]} target={currentSelection} query={query} availableTopics={availableTopics} topicTitle={id => articles[id].title} onSelect={setSelected} />
        </> : query.trim() ? <>
          <Typography variant="body2" color="text.secondary" role="status" aria-live="polite" sx={{ mb: 1 }}>{t('help.results', { count: formatNumber(scopedResults.length, i18n.resolvedLanguage === 'fa' ? 'fa' : 'en') })}</Typography>
          {scopedResults.length === 0 && <Box sx={{ py: 3 }}><Typography variant="subtitle2">{t('help.noResults')}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.9 }}>{t('help.noResultsHint')}</Typography><Button size="small" sx={{ mt: 2 }} onClick={reset}>{t('help.allTopics')}</Button></Box>}
          <List disablePadding aria-label={t('help.searchLabel')}>
            {scopedResults.slice(0, resultLimit).map(result => <ListItemButton key={`${result.topicId}:${result.section}:${result.index}`} alignItems="flex-start"
              onClick={() => setSelected({ topicId: result.topicId, section: result.section, index: result.index })}
              sx={{ display: 'block', px: 1.5, py: 1.5, borderBlockEnd: 1, borderColor: 'divider' }}>
              <Stack direction="row" useFlexGap sx={{ mb: .5, flexWrap: 'wrap', gap: .5 }}>
                <Typography variant="caption" color="text.secondary">{articles[result.topicId].title} · {t(`help.sections.${result.section}`)}</Typography>
                {result.topicId === contextTopic && <Chip size="small" label={t('help.currentPage')} />}
                {result.approximate && <Chip size="small" variant="outlined" label={t('help.approximate')} />}
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 700 }}><HelpText text={result.title} query={query} /></Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: .5, lineHeight: 1.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}><HelpText text={result.body} query={query} /></Typography>
            </ListItemButton>)}
          </List>
          {scopedResults.length > resultLimit && <Button fullWidth size="small" sx={{ mt: 2 }} onClick={() => setResultLimit(value => value + 20)}>{t('help.moreResults')}</Button>}
        </> : <>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>{contextTopic ? t('help.browseHint') : t('help.noContext')}</Typography>
          {groups.map(group => {
            const topics = topicIds.filter(id => helpCatalog[id].group === group);
            return topics.length ? <Box component="section" key={group} sx={{ mb: 2 }}>
              <Typography component="h2" variant="subtitle2" sx={{ mb: .5 }}>{t(`help.groups.${group}`)}</Typography>
              <List disablePadding>{topics.map(id => <ListItemButton key={id} onClick={() => setSelected({ topicId: id, section: 'overview', index: 0 })} sx={{ py: 1 }}><Typography variant="body2">{articles[id].title}</Typography></ListItemButton>)}</List>
            </Box> : null;
          })}
        </>}
      </Box>
    </Box>
  </Drawer></Portal>;
}
