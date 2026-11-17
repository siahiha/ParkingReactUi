import type { HelpArticles } from '../../features/help/helpTypes';
import { helpSearchTerms } from './searchTerms';
import { enDefinitions } from './enDefinitions';
import { enManagement } from './enManagement';
import { enOperations } from './enOperations';
import { enReports } from './enReports';

const articles: HelpArticles = { ...enDefinitions, ...enManagement, ...enOperations, ...enReports };

export default {
  moreResults: 'More results',
  title: 'User help', open: 'Help', close: 'Close help', allTopics: 'All topics', thisPage: 'Help for this page',
  searchLabel: 'Search help', searchPlaceholder: 'Enter a field, concept or question…', clearSearch: 'Clear search',
  onlyPage: 'Only this form', results: '{{count}} results', noResults: 'No matching topic.', noResultsHint: 'Try a field name or fewer words, or search all topics.',
  noContext: 'No specific topic is available for this page. Use the topic list or search.', browseHint: 'Choose a topic or search for a field or problem.',
  backResults: 'Back to results', backTopics: 'Back to topics', related: 'Related topics', contents: 'In this guide', currentPage: 'Current form',
  approximate: 'Close match', readSection: 'Read explanation', sections: { overview: 'About this form', steps: 'How to use it', fields: 'Fields and options', concepts: 'Concepts', actions: 'Buttons and actions', problems: 'Questions and troubleshooting' },
  groups: { start: 'Getting started and concepts', operations: 'Daily operations', definitions: 'Definitions and settings', management: 'Administration', reports: 'Reports' },
  search: helpSearchTerms, articles,
};
