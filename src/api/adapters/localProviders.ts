import axiosInstance from '../axiosInstance';
import type { Provider, GetQuestionsOptions } from '../../types';
import { shuffleArray } from './utils';
import type { CardQuestion, CategoryDef } from './utils';

function makeLocalProvider(
  id: string,
  name: string,
  description: string,
  group: string,
  dataFile: string,
  categories: CategoryDef[],
  getCategoryFilterValue: (c: CategoryDef) => string = (c) => c.name,
) {
  let dataPromise: Promise<CardQuestion[]> | null = null;
  const categoryNameById = Object.fromEntries(categories.map(c => [c.id, getCategoryFilterValue(c)]));
  const categoryLabelByValue = Object.fromEntries(categories.map(c => [getCategoryFilterValue(c), c.name]));
  const seenByCategory = new Map<string, Set<CardQuestion>>();

  return {
    id,
    name,
    description,
    group,
    requiresToken: false,

    async getCategories() { return [{ id: 'all', name: 'Any Category' }, ...categories]; },

    async getQuestions({ amount = 10, categoryId, signal }: GetQuestionsOptions) {
      if (!dataPromise) {
        dataPromise = axiosInstance
          .get<{ questions: CardQuestion[] }>(dataFile, { signal })
          .then(r => r.data.questions)
          .catch(err => { dataPromise = null; throw err; });
      }
      const allQuestions = await dataPromise;
      const categoryName = categoryId ? categoryNameById[categoryId] : null;
      const pool = categoryName ? allQuestions.filter(q => q.category === categoryName) : allQuestions;

      const cacheKey = categoryId ?? 'all';
      if (!seenByCategory.has(cacheKey)) seenByCategory.set(cacheKey, new Set());
      const seen = seenByCategory.get(cacheKey)!;

      let source = pool.filter(q => !seen.has(q));
      if (source.length < amount) {
        seen.clear();
        source = pool;
      }

      const picked = shuffleArray(source).slice(0, amount);
      picked.forEach(q => seen.add(q));

      return {
        results: picked.map(q => ({
          question: q.question,
          correctAnswer: q.answer,
          incorrectAnswers: [],
          category: categoryLabelByValue[q.category] ?? q.category,
          difficulty: 'all',
          type: 'open' as const,
        }))
      };
    },

    difficulties: [{ value: 'all', label: 'Any difficulty' }],
    types: [{ value: 'open', label: 'Open Answer' }],
  } satisfies Provider;
}

export const allOfUsProvider = makeLocalProvider(
  'allofus',
  'All Of Us',
  'Generational trivia questions from physical card sets (1,535 questions)',
  'Card Games',
  '/data/all_of_us.json',
  [
    { id: 'boomers', name: 'Boomers' },
    { id: 'gen_x', name: 'Gen X' },
    { id: 'millennials', name: 'Millennials' },
    { id: 'gen_z', name: 'Gen Z' },
  ],
);

export const mindTheGapProvider = makeLocalProvider(
  'mindthegap',
  'Mind the Gap',
  'Cross-generational trivia card game (1,600 questions)',
  'Card Games',
  '/data/mind_the_gap.json',
  [
    { id: 'boomer', name: 'Boomer' },
    { id: 'gen_x', name: 'Gen X' },
    { id: 'millennial', name: 'Millennial' },
    { id: 'gen_z', name: 'Gen Z' },
  ],
);

export const tpMillenniumProvider = makeLocalProvider(
  'tpmillennium',
  'Trivial Pursuit — Millennium',
  'Classic Trivial Pursuit questions from the Millennium Edition (2,970 questions)',
  'Card Games',
  '/data/tp_millennium.json',
  [
    { id: 'PP', name: 'People & Places' },
    { id: 'AE', name: 'Arts & Entertainment' },
    { id: 'HIS', name: 'History' },
    { id: 'SN', name: 'Science & Nature' },
    { id: 'SL', name: 'Sports & Leisure' },
    { id: 'WC', name: 'Wild Card' },
  ],
  (c) => c.id,
);
