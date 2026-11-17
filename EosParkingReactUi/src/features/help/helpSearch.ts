import { helpSections, type HelpArticles, type HelpDocument, type HelpSearchConfig, type HelpSearchResult, type HelpTopicId } from './helpTypes';

export function normalizeHelpText(input: string): string {
  return input.normalize('NFKC').toLowerCase()
    .replace(/[يىئ]/g, 'ی').replace(/ك/g, 'ک').replace(/[أإآٱ]/g, 'ا').replace(/ؤ/g, 'و').replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670\u0640\u200c\u200d\u200e\u200f\u202a-\u202e]/g, '')
    .replace(/[۰-۹]/g, char => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, char => String(char.charCodeAt(0) - 1632))
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

const vocabularyCache = new WeakMap<HelpSearchConfig, { alias: string; canonical: string }[]>();

function canonicalize(text: string, config: HelpSearchConfig): string {
  let normalized = ` ${normalizeHelpText(text)} `;
  let replacements = vocabularyCache.get(config);
  if (!replacements) {
    replacements = config.synonyms.flatMap(group => group.slice(1).map(alias => ({ alias: normalizeHelpText(alias), canonical: normalizeHelpText(group[0]) })))
      .sort((a, b) => b.alias.length - a.alias.length);
    vocabularyCache.set(config, replacements);
  }
  for (const { alias, canonical } of replacements) {
    if (alias) normalized = normalized.split(` ${alias} `).join(` ${canonical} `);
  }
  return normalized.trim();
}

export function buildHelpDocuments(articles: HelpArticles, topics: readonly HelpTopicId[]): HelpDocument[] {
  return topics.flatMap(topicId => {
    const article = articles[topicId];
    return helpSections.flatMap<HelpDocument>(section => {
      if (section === 'overview') return [{ topicId, section, index: 0, title: article.title, body: article.intro, phrases: '' }];
      if (section === 'steps') return article.steps.map((body, index) => ({ topicId, section, index, title: article.title, body, phrases: '' }));
      return (article[section] ?? []).map(([title, body, phrases = ''], index) => ({ topicId, section, index, title, body, phrases }));
    });
  });
}

/** Bounded Damerau-Levenshtein also handles a single pair of transposed letters. */
function typoDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previousPrevious: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], previousPrevious[j - 2] + 1);
    }
    previousPrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function wordScore(query: string, words: string[], distances: Map<string, number>): { score: number; approximate: boolean } {
  if (words.includes(query)) return { score: 1, approximate: false };
  if (query.length >= 3 && words.some(word => word.startsWith(query))) return { score: .8, approximate: false };
  if (query.length >= 4) {
    const limit = query.length >= 8 ? 2 : 1;
    const closeMatch = words.some(word => {
      if (word.length < 4 || Math.abs(query.length - word.length) > limit) return false;
      const key = `${query}:${word}`;
      let distance = distances.get(key);
      if (distance === undefined) {
        distance = typoDistance(query, word, limit);
        distances.set(key, distance);
      }
      return distance <= limit;
    });
    if (closeMatch) return { score: .45, approximate: true };
  }
  return { score: 0, approximate: false };
}

export type HelpSearchIndex = ReturnType<typeof createHelpSearchIndex>;
export function createHelpSearchIndex(documents: HelpDocument[], config: HelpSearchConfig) {
  return documents.map(document => {
    const title = document.section === 'steps' ? '' : canonicalize(document.title, config);
    const body = canonicalize(document.body, config);
    const phrases = canonicalize(document.phrases, config);
    return { document, title, body, phrases, titleWords: title.split(' '), bodyWords: body.split(' '), phraseWords: phrases.split(' ') };
  });
}

export function searchHelp(index: HelpSearchIndex, query: string, config: HelpSearchConfig, contextTopic?: HelpTopicId | null): HelpSearchResult[] {
  const normalized = canonicalize(query, config);
  const stopWords = new Set(config.stopWords.map(normalizeHelpText));
  const words = [...new Set(normalized.split(' ').filter(word => word.length > 1 && !stopWords.has(word)))].slice(0, 12);
  if (!words.length) return [];
  const results: HelpSearchResult[] = [];
  const distances = new Map<string, number>();
  for (const item of index) {
    let matched = 0;
    let score = 0;
    let approximate = false;
    for (const word of words) {
      const options = [
        { ...wordScore(word, item.titleWords, distances), weight: 9 },
        { ...wordScore(word, item.phraseWords, distances), weight: 7 },
        { ...wordScore(word, item.bodyWords, distances), weight: 2 },
      ].sort((a, b) => b.score * b.weight - a.score * a.weight);
      const best = options[0];
      if (best.score > 0) { matched++; score += best.score * best.weight; approximate ||= best.approximate; }
    }
    // Short searches must match every meaningful word; questions can omit one incidental word.
    if (matched < (words.length <= 3 ? words.length : Math.ceil(words.length * .8))) continue;
    const phrase = words.join(' ');
    if (` ${item.title} `.includes(` ${phrase} `)) score += 32;
    if (` ${item.phrases} `.includes(` ${phrase} `)) score += 24;
    if (item.document.topicId === contextTopic) score += 3;
    if (item.document.section === 'fields' || item.document.section === 'concepts') score += 1;
    results.push({ ...item.document, score, approximate });
  }
  return results.sort((a, b) => b.score - a.score || Number(a.approximate) - Number(b.approximate));
}

/** Keep original offsets, including Persian joining characters, without inserting HTML. */
export function getHelpHighlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const tokens = normalizeHelpText(query).split(' ').filter(word => word.length > 2);
  if (!tokens.length) return [{ text, match: false }];
  let normalized = '';
  const offsets: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const part = normalizeHelpText(text[i]);
    for (const char of part) { normalized += char; offsets.push(i); }
    if (/\s/.test(text[i])) { normalized += ' '; offsets.push(i); }
  }
  const matches = new Set<number>();
  for (const token of tokens) {
    let from = normalized.indexOf(token);
    while (from >= 0) {
      const first = offsets[from];
      const last = offsets[from + token.length - 1];
      for (let i = first; i <= last; i++) matches.add(i);
      from = normalized.indexOf(token, from + token.length);
    }
  }
  const parts: { text: string; match: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const match = matches.has(i);
    if (parts.length && parts[parts.length - 1].match === match) parts[parts.length - 1].text += text[i];
    else parts.push({ text: text[i], match });
  }
  return parts;
}
