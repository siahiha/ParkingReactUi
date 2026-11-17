export const helpTopicIds = ['home', 'parking', 'spaceTypes', 'floors', 'zones', 'membershipKinds', 'equipment', 'doors', 'tariffs', 'members', 'cards', 'traffic', 'payment', 'history', 'monitoring', 'plateReader', 'shifts', 'users', 'access', 'exitPermission', 'integration', 'importMembers', 'memberReports', 'trafficReports', 'financialReports', 'managementReports', 'cargoReport', 'cargo', 'concepts', 'problems', 'unavailable'] as const;
export type HelpTopicId = typeof helpTopicIds[number];
export const helpSections = ['overview', 'steps', 'fields', 'concepts', 'actions', 'problems'] as const;
export type HelpSection = typeof helpSections[number];
/** Search phrases stay in the language resources and are never displayed as answers. */
export type HelpEntry = readonly [title: string, body: string, searchPhrases?: string];
export type HelpArticle = {
  title: string;
  intro: string;
  steps: string[];
  fields: HelpEntry[];
  concepts?: HelpEntry[];
  actions: HelpEntry[];
  problems: HelpEntry[];
};
export type HelpArticles = Record<HelpTopicId, HelpArticle>;
export type HelpSearchConfig = { stopWords: string[]; synonyms: string[][] };
export type HelpLocation = { topicId: HelpTopicId; section: HelpSection; index: number };
export type HelpDocument = HelpLocation & { title: string; body: string; phrases: string };
export type HelpSearchResult = HelpDocument & { score: number; approximate: boolean };
