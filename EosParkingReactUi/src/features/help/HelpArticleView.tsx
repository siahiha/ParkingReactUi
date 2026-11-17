import { useEffect, useRef } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { helpCatalog } from './helpCatalog';
import { getHelpHighlightParts } from './helpSearch';
import { helpSections, type HelpArticle, type HelpLocation, type HelpTopicId } from './helpTypes';

export function HelpText({ text, query }: { text: string; query: string }) {
  return <>{getHelpHighlightParts(text, query).map((part, index) => part.match
    ? <Box component="mark" key={index} sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}>{part.text}</Box>
    : part.text)}</>;
}

type Props = {
  article: HelpArticle; target: HelpLocation; query: string; availableTopics: readonly HelpTopicId[];
  topicTitle: (id: HelpTopicId) => string; onSelect: (target: HelpLocation) => void;
};
export function HelpArticleView({ article, target, query, availableTopics, topicTitle, onSelect }: Props) {
  const { t } = useTranslation();
  const targetRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    targetRef.current?.focus({ preventScroll: true });
    targetRef.current?.scrollIntoView?.({ block: 'start' });
  }, [target]);
  const related = helpCatalog[target.topicId].related.filter(id => availableTopics.includes(id));
  const targetProps = (section: HelpLocation['section'], index: number) => ({
    ref: (node: HTMLElement | null) => { if (target.section === section && target.index === index) targetRef.current = node; },
    tabIndex: -1,
    sx: { scrollMarginBlockStart: 16, borderRadius: 'var(--app-control-radius, 4px)', ...(target.section === section && target.index === index && section !== 'overview' ? { bgcolor: 'action.selected', outline: '2px solid', outlineColor: 'primary.main', p: 1.5 } : {}) },
  });
  return <Box component="article" aria-label={article.title} sx={{ minWidth: 0 }}>
    <Box {...targetProps('overview', 0)}>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>{article.title}</Typography>
      <Typography variant="body2" sx={{ lineHeight: 1.9 }}>{article.intro}</Typography>
    </Box>
    <Box component="nav" aria-label={t('help.contents')} sx={{ my: 2, borderBlock: 1, borderColor: 'divider', py: 1 }}>
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: .5 }}>
        {helpSections.filter(section => section !== 'overview' && Boolean(article[section]?.length)).map(section => <Button key={section} size="small" onClick={() => onSelect({ topicId: target.topicId, section, index: 0 })}>{t(`help.sections.${section}`)}</Button>)}
      </Stack>
    </Box>
    {helpSections.filter(section => section !== 'overview').map(section => {
      const entries = article[section];
      if (!entries?.length) return null;
      return <Box component="section" key={section} sx={{ mb: 3 }} aria-label={t(`help.sections.${section}`)}>
        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>{t(`help.sections.${section}`)}</Typography>
        {section === 'steps' ? <Box component="ol" sx={{ m: 0, paddingInlineStart: 3, display: 'grid', gap: 1.5 }}>
          {article.steps.map((body, index) => <Box component="li" key={index} {...targetProps(section, index)}><Typography variant="body2" sx={{ lineHeight: 1.9 }}><HelpText text={body} query={query} /></Typography></Box>)}
        </Box> : <Box sx={{ display: 'grid', gap: 2 }}>
          {article[section]?.map(([title, body], index) => <Box component="section" key={index} {...targetProps(section, index)}>
            <Typography component="h4" variant="body2" sx={{ fontWeight: 700, mb: .5 }}><HelpText text={title} query={query} /></Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}><HelpText text={body} query={query} /></Typography>
          </Box>)}
        </Box>}
      </Box>;
    })}
    {related.length > 0 && <Box component="nav" aria-label={t('help.related')} sx={{ pt: 2, borderBlockStart: 1, borderColor: 'divider' }}>
      <Typography component="h3" variant="subtitle2">{t('help.related')}</Typography>
      <Stack direction="row" useFlexGap sx={{ mt: 1, flexWrap: 'wrap', gap: .5 }}>{related.map(id => <Button key={id} size="small" onClick={() => onSelect({ topicId: id, section: 'overview', index: 0 })}>{topicTitle(id)}</Button>)}</Stack>
    </Box>}
  </Box>;
}
